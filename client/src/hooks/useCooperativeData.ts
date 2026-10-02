import { useState, useEffect, useMemo } from "react";
import { cowsSeedInitialized, alertsSeed, localizedExtras, localizedCopy, stateOptions, resolveStateLanguage, type Cow, type AlertItem, type Validation } from "../lib/dashboard-data";
import { dynamicCopy, extraUi } from "../lib/dynamic-translations";
import { toast } from "sonner"; 

export function useCooperativeData() {
  const [cows, setCows] = useState<Cow[]>(cowsSeedInitialized);
  const [alerts, setAlerts] = useState<AlertItem[]>(alertsSeed);
  const [offline, setOffline] = useState(false);
  const [lastSynced, setLastSynced] = useState("just now");
  const [selectedStateName, setSelectedStateName] = useState("Maharashtra");

  const selectedState = useMemo(() => stateOptions.find(s => s.state === selectedStateName) || stateOptions[0], [selectedStateName]);
  const lang = useMemo(() => resolveStateLanguage(selectedState), [selectedState]);
  const ui = localizedExtras[lang];
  const copy = localizedCopy[lang];
  const dynamicUi = dynamicCopy[lang];
  const extra = extraUi[lang];

  const getReasonForCow = (cow: Cow) => {
    if (cow.history.length < 2) return dynamicUi.reasonStable(cow.score);
    const recent = cow.history.slice(-3); // last 3 days
    const delta = recent[recent.length - 1] - recent[0];
    
    // Consecutive high days
    let highDays = 0;
    for (let i = cow.history.length - 1; i >= 0; i--) {
      if (cow.history[i] >= 70) highDays++;
      else break;
    }
    
    if (highDays >= 2) return dynamicUi.reasonHigh(highDays);
    if (delta > 10) return dynamicUi.reasonRising(delta, recent.length);
    if (delta < -10) return dynamicUi.reasonFalling(Math.abs(delta));
    
    const avg = Math.round(cow.history.reduce((a, b) => a + b, 0) / cow.history.length);
    return dynamicUi.reasonStable(avg);
  };


  // Logic from existing app
  const getRiskForecast = (history: number[]) => {
    const values = [...history];
    if (values.length < 2) return { slope: 0, forecast: [], trend: "insufficient", daysToHigh: null };
    const meanX = (values.length - 1) / 2;
    const meanY = values.reduce((a, b) => a + b, 0) / values.length;
    let num = 0; let den = 0;
    for (let i = 0; i < values.length; i++) {
        num += (i - meanX) * (values[i] - meanY);
        den += Math.pow(i - meanX, 2);
    }
    const slope = den === 0 ? 0 : num / den;
    const forecast = [];
    let currentY = values[values.length - 1];
    for (let i = 1; i <= 3; i++) {
        currentY += slope;
        forecast.push(Math.max(0, Math.min(100, Math.round(currentY))));
    }
    let trend = "stable";
    if (slope > 1.5) trend = "rising-fast";
    else if (slope > 0.5) trend = "rising";
    else if (slope < -1.5) trend = "falling-fast";
    else if (slope < -0.5) trend = "falling";
    let daysToHigh = null;
    if (slope > 0.5 && values[values.length - 1] < 70) {
        daysToHigh = Math.ceil((70 - values[values.length - 1]) / slope);
    }
    // Battery drain simulation
  useEffect(() => {
    const drainInterval = setInterval(() => {
      setCows((current) => current.map((cow) => {
        const drain = Math.random() < 0.7 ? 1 : 0;
        const battery = Math.max(8, cow.sensor.battery - drain);
        const state = (cow.sensor.state === 'stale' ? 'stale' : battery < 15 ? 'low-battery' : cow.sensor.state) as "stale" | "low-battery" | "connected";
        return battery === cow.sensor.battery && state === cow.sensor.state ? cow : { ...cow, sensor: { ...cow.sensor, battery, state } };
      }));
    }, 25000);
    return () => clearInterval(drainInterval);
  }, []);

  return { slope, forecast, trend, daysToHigh };
  };

  
  const [isReading, setIsReading] = useState(false);

  const prepareReading = (cow: Cow) => {
    const deductBattery = true;
    const ecDrift = deductBattery ? (cow.id === 'cow-1' ? 0.08 : (Math.random() - 0.5) * 0.1) : 0;
    const tempDrift = deductBattery ? (cow.id === 'cow-1' ? 0.02 : (Math.random() - 0.5) * 0.05) : 0;
    const battery = deductBattery ? Math.max(8, cow.sensor.battery - 1) : cow.sensor.battery;
    const state = (cow.sensor.state === 'stale' ? 'stale' : battery < 15 ? 'low-battery' : cow.sensor.state) as "stale" | "low-battery" | "connected";
    return {
      ...cow,
      sensor: {
        ...cow.sensor,
        ec: Number((cow.sensor.ec + ecDrift).toFixed(2)),
        temperature: Number((cow.sensor.temperature + tempDrift).toFixed(1)),
        battery,
        state,
        lastContact: deductBattery ? 'Just now' : cow.sensor.lastContact,
      },
    };
  };

  const takeReading = async (cowIds?: string[]) => {
    if (offline) {
      toast('Cannot run live model inference while offline.');
      return false;
    }
    
    setIsReading(true);
    const targets = cowIds ? cows.filter(c => cowIds.includes(c.id)) : cows.filter(c => c.sensor.state !== 'stale');
    if (targets.length === 0) {
      setIsReading(false);
      return false;
    }

    const updatedCows = targets.map((cow) => prepareReading(cow));
    try {
      const response = await fetch('/api/predict-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cows: updatedCows.map((cow) => ({ id: cow.id, ec: cow.sensor.ec, temperature: cow.sensor.temperature })),
        }),
      });
      if (!response.ok) throw new Error('API error');
      
      
      const { results } = await response.json();
      
      const newAlerts: AlertItem[] = [];
      const predictedCows = updatedCows.map((cow) => {
        const prediction = results.find((r: { id: string }) => r.id === cow.id);
        if (!prediction) return cow;
        const score = prediction.score;
        const risk = (score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low') as "high" | "medium" | "low";
        const newHistory = [...cow.history.slice(1), score];
        
        if (risk !== 'low' && cow.risk === 'low') {
          newAlerts.push({
            id: 'alert-' + Date.now() + '-' + cow.id,
            cowId: cow.id,
            date: 'Today',
            time: 'Just now',
            risk: risk,
            title: `Risk elevated to ${risk}`,
            body: 'Model detected elevated risk during reading.',
            validation: 'active'
          });
        }
        
        return { ...cow, score, risk, probability: prediction.probability, checked: 'Just now', history: newHistory };
      });
      
      setCows((current) => current.map((cow) => predictedCows.find((next) => next.id === cow.id) ?? cow));
      if (newAlerts.length > 0) {
        setAlerts((current) => [...newAlerts, ...current]);
      }
      setLastSynced('just now');
      setIsReading(false);


      
      await Promise.all(predictedCows.map((cow) =>
        fetch('/api/learn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ec: cow.sensor.ec, temperature: cow.sensor.temperature, label: cow.risk === 'high' ? 1 : 0 }),
        }).catch(() => false)
      ));
      
      return true;
    } catch (e) {
      toast('Failed to run reading. Ensure server is online.');
      setIsReading(false);
      return false;
    }
  };

  const syncCows = async (targets: Cow[]) => {};

  const updateCowOnReview = (cowId: string, validation: Validation) => {
    setCows((current) => current.map((cow) => {
      if (cow.id !== cowId) return cow;
      if (validation === "confirmed") {
        return { ...cow, risk: "high", recommendation: copy.underTreatmentRec, treatmentStatus: "under-treatment" };
      }
      if (validation === "false-alarm" || validation === "resolved") {
        const newHistory = [...cow.history];
        newHistory[newHistory.length - 1] = Math.max(10, newHistory[newHistory.length - 1] - 40);
        return { ...cow, risk: "low", recommendation: "", history: newHistory, treatmentStatus: "none" };
      }
      return cow;
    }));
  };

  const [vetLoadingId, setVetLoadingId] = useState<string | null>(null);
  const [queuedReviews, setQueuedReviews] = useState<{cowId: string, validation: "confirmed" | "false-alarm", alertId?: string}[]>([]);

  const resolveVetReview = async (cowId: string, validation: "confirmed" | "false-alarm", alertId?: string) => {
    if (!alertId) {
      const activeAlert = alerts.find(a => a.cowId === cowId && a.validation === 'active');
      if (activeAlert) alertId = activeAlert.id;
    }
    const cow = cows.find((item) => item.id === cowId);
    if (!cow) return;

    if (offline) {
      setQueuedReviews((current) => [...current, { cowId, validation, alertId }]);
      if (alertId) {
        setAlerts((current) => current.map((alert) => alert.id === alertId ? { ...alert, validation } : alert));
      }
      updateCowOnReview(cowId, validation);
      toast("Queued for sync when online");
      return;
    }

    setVetLoadingId(`${cowId}-${validation}`);
    let apiSuccess = true;
    try {
      const response = await fetch("/api/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ec: cow.sensor.ec,
          temperature: cow.sensor.temperature,
          label: validation === "confirmed" ? 1 : 0,
        }),
      });
      if (!response.ok) throw new Error("API error");
    } catch (e) {
      apiSuccess = false;
      toast("Couldn't reach the server - check your connection and try again");
    } finally {
      setVetLoadingId(null);
      if (apiSuccess) {
        if (alertId) {
          setAlerts((current) => current.map((alert) => alert.id === alertId ? { ...alert, validation } : alert));
        }
        updateCowOnReview(cowId, validation);
        toast(validation === "confirmed" ? ui.vetConfirmedToast : ui.falseAlarmToast);
      }
    }
  };

  const toggleOffline = async () => {
    if (offline) {
      setOffline(false);
      if (queuedReviews.length > 0) {
        setVetLoadingId("syncing");
        let syncCount = 0;
        for (const review of queuedReviews) {
          const cow = cows.find((c) => c.id === review.cowId);
          if (!cow) continue;
          try {
            await fetch("/api/learn", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ec: cow.sensor.ec,
                temperature: cow.sensor.temperature,
                label: review.validation === "confirmed" ? 1 : 0,
              }),
            });
            syncCount++;
          } catch (e) {
            console.error("Failed to sync review", review);
          }
        }
        setVetLoadingId(null);
        setQueuedReviews([]);
        if (syncCount > 0) toast(`Synced ${syncCount} actions`);
        else toast(ui.backOnline || "Back online");
      } else {
        toast(ui.backOnline || "Back online");
      }
    } else {
      setOffline(true);
      toast(ui.offlineOn || "Simulating offline mode");
    }
  };

  // Cooperative dashboard calculations
  const totalCows = cows.length;
  const uniqueFarmsCount = new Set(cows.map(c => c.farm)).size;
  
  const highRiskCows = cows.filter(c => c.risk === "high").length;
  const connectedCows = cows.filter(c => c.sensor.state === "connected").length;
  const syncRate = totalCows > 0 ? Math.round((connectedCows / totalCows) * 100) : 100;
  
  // Real dates calculation
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime() + (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60000;
  const oneWeek = 604800000;
  const weekNumber = Math.floor(diff / oneWeek);
  
  const weekLabel = `Week ${weekNumber} · ${now.getFullYear()}`;

  return {
    cows,
    alerts,
    offline,
    setOffline,
    lastSynced,
    selectedStateName,
    setSelectedStateName,
    selectedState,
    lang,
    ui,
    copy,
    dynamicUi,
    extra,
    stateOptions,
    resolveVetReview,
    toggleOffline,
    queuedReviews,
    vetLoadingId,
    getRiskForecast,
    getReasonForCow,
    takeReading,
    isReading,
    
    stats: {
      totalCows,
      totalFarms: uniqueFarmsCount,
      highRiskCows,
      syncRate,
      weekLabel
    }
  };
}
