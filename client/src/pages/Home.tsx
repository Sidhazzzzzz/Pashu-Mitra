import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  BatteryCharging,
  BatteryLow,
  BatteryMedium,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  CloudOff,
  Info,
  Languages,
  Leaf,
  Menu,
  Phone,
  RefreshCw,
  ScanLine,
  Search,
  Signal,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Sun,
  TrendingUp,
  UserRound,
  Wifi,
  XCircle,
} from "lucide-react";

type Language = "en" | "hi" | "mr" | "gu" | "pa" | "kn" | "ta" | "te";
type Risk = "low" | "medium" | "high";
type View = "home" | "alerts" | "about" | "cow" | "vet" | "farm" | "profile";
type Validation = "active" | "confirmed" | "false-alarm" | "resolved";
type SensorState = "connected" | "stale" | "low-battery";

type SensorTelemetry = {
  ec: number;
  temperature: number;
  battery: number;
  state: SensorState;
  lastContact: string;
};

type Cow = {
  id: string;
  name: string;
  tag: string;
  farm: string;
  breed: string;
  risk: Risk;
  score: number;
  probability: number | null;
  checked: string;
  recommendation: string;
  history: number[];
  historyDays: string[];
  sensor: SensorTelemetry;
  treatmentStatus?: "under-treatment" | "none";
};

type AlertItem = {
  id: string;
  cowId: string;
  date: string;
  time: string;
  risk: Risk;
  title: string;
  body: string;
  validation: Validation;
};

type StateOption = { state: string; native: string; language: Language; languageLabel: string };

const stateOptions: StateOption[] = [
  { state: "Maharashtra", native: "महाराष्ट्र", language: "mr", languageLabel: "मराठी" },
  { state: "Gujarat", native: "ગુજરાત", language: "gu", languageLabel: "ગુજરાતી" },
  { state: "Punjab", native: "ਪੰਜਾਬ", language: "pa", languageLabel: "ਪੰਜਾਬੀ" },
  { state: "Karnataka", native: "ಕರ್ನಾಟಕ", language: "kn", languageLabel: "ಕನ್ನಡ" },
  { state: "Tamil Nadu", native: "தமிழ்நாடு", language: "ta", languageLabel: "தமிழ்" },
  { state: "Andhra Pradesh", native: "ఆంధ్ర ప్రదేశ్", language: "te", languageLabel: "తెలుగు" },
  { state: "Telangana", native: "తెలంగాణ", language: "te", languageLabel: "తెలుగు" },
  { state: "Uttar Pradesh", native: "उत्तर प्रदेश", language: "hi", languageLabel: "हिन्दी" },
  { state: "Bihar", native: "बिहार", language: "hi", languageLabel: "हिन्दी" },
  { state: "Rajasthan", native: "राजस्थान", language: "hi", languageLabel: "हिन्दी" },
  { state: "Madhya Pradesh", native: "मध्य प्रदेश", language: "hi", languageLabel: "हिन्दी" },
  { state: "Kerala", native: "കേരളം", language: "en", languageLabel: "English" },
  { state: "West Bengal", native: "পশ্চিমবঙ্গ", language: "en", languageLabel: "English" },
  { state: "Odisha", native: "ଓଡ଼ିଶା", language: "en", languageLabel: "English" },
  { state: "Assam", native: "অসম", language: "en", languageLabel: "English" },
  { state: "Goa", native: "गोवा", language: "en", languageLabel: "English" },
  { state: "Arunachal Pradesh", native: "Arunachal Pradesh", language: "en", languageLabel: "English" },
  { state: "Chhattisgarh", native: "छत्तीसगढ़", language: "hi", languageLabel: "हिन्दी" },
  { state: "Haryana", native: "हरियाणा", language: "hi", languageLabel: "हिन्दी" },
  { state: "Himachal Pradesh", native: "हिमाचल प्रदेश", language: "hi", languageLabel: "हिन्दी" },
  { state: "Jharkhand", native: "झारखंड", language: "hi", languageLabel: "हिन्दी" },
  { state: "Manipur", native: "মণিপুর", language: "en", languageLabel: "English" },
  { state: "Meghalaya", native: "Meghalaya", language: "en", languageLabel: "English" },
  { state: "Mizoram", native: "Mizoram", language: "en", languageLabel: "English" },
  { state: "Nagaland", native: "Nagaland", language: "en", languageLabel: "English" },
  { state: "Sikkim", native: "सिक्किम", language: "en", languageLabel: "English" },
  { state: "Tripura", native: "ত্রিপুরা", language: "en", languageLabel: "English" },
  { state: "Uttarakhand", native: "उत्तराखंड", language: "hi", languageLabel: "हिन्दी" },
  { state: "Delhi", native: "दिल्ली", language: "hi", languageLabel: "हिन्दी" },
  { state: "Jammu and Kashmir", native: "जम्मू और कश्मीर", language: "en", languageLabel: "English" },
  { state: "Ladakh", native: "लद्दाख", language: "en", languageLabel: "English" },
  { state: "Puducherry", native: "புதுச்சேரி", language: "en", languageLabel: "English" },
  { state: "Chandigarh", native: "ਚੰਡੀਗੜ੍ਹ", language: "en", languageLabel: "English" },
  { state: "Andaman and Nicobar Islands", native: "Andaman and Nicobar Islands", language: "en", languageLabel: "English" },
  { state: "Dadra and Nagar Haveli and Daman and Diu", native: "Dadra and Nagar Haveli and Daman and Diu", language: "en", languageLabel: "English" },
  { state: "Lakshadweep", native: "Lakshadweep", language: "en", languageLabel: "English" },
  { state: "Other state / UT", native: "Other state / UT", language: "en", languageLabel: "English" },
];

// Deliberate scope: unsupported Hindi-belt states are mapped to Hindi; other unsupported states/UTs fall back to English.
function resolveStateLanguage(state: StateOption): Language {
  return state.language;
}

const cowsSeed: Cow[] = [
  {
    id: "cow-1",
    name: "Lakshmi",
    tag: "Cow #03",
    farm: "Sita Devi’s Dairy",
    breed: "Gir cross",
    risk: "high",
    score: 86,
    probability: null,
    checked: "Today, 6:40 AM",
    recommendation: "",
    history: [18, 20, 23, 27, 29, 32, 36, 42, 49, 57, 64, 71, 78, 86],
    historyDays: ["Aug 24", "25", "26", "27", "28", "29", "30", "31", "Sep 1", "2", "3", "4", "5", "Today"],
    sensor: { ec: 7.82, temperature: 39.4, battery: 64, state: "connected", lastContact: "Just now" },
  },
  {
    id: "cow-2",
    name: "Gauri",
    tag: "Cow #07",
    farm: "Sita Devi’s Dairy",
    breed: "Sahiwal",
    risk: "medium",
    score: 54,
    probability: null,
    checked: "Today, 6:42 AM",
    recommendation: "",
    history: [35, 38, 36, 40, 39, 44, 42, 46, 49, 48, 51, 50, 53, 54],
    historyDays: ["Aug 24", "25", "26", "27", "28", "29", "30", "31", "Sep 1", "2", "3", "4", "5", "Today"],
    sensor: { ec: 6.48, temperature: 39.0, battery: 42, state: "connected", lastContact: "Just now" },
  },
  {
    id: "cow-3",
    name: "Radha",
    tag: "Cow #11",
    farm: "Sita Devi’s Dairy",
    breed: "Jersey cross",
    risk: "low",
    score: 18,
    probability: null,
    checked: "Today, 6:45 AM",
    recommendation: "",
    history: [22, 20, 21, 19, 20, 18, 17, 19, 18, 16, 17, 18, 17, 18],
    historyDays: ["Aug 24", "25", "26", "27", "28", "29", "30", "31", "Sep 1", "2", "3", "4", "5", "Today"],
    sensor: { ec: 4.36, temperature: 38.5, battery: 81, state: "connected", lastContact: "Just now" },
  },
  {
    id: "cow-4",
    name: "Kamdhenu",
    tag: "Cow #14",
    farm: "Sita Devi’s Dairy",
    breed: "Tharparkar",
    risk: "medium",
    score: 47,
    probability: null,
    checked: "Yesterday, 6:35 AM",
    recommendation: "",
    history: [42, 39, 44, 41, 45, 43, 40, 45, 44, 46, 48, 45, 47, 47],
    historyDays: ["Aug 24", "25", "26", "27", "28", "29", "30", "31", "Sep 1", "2", "3", "4", "5", "Today"],
    sensor: { ec: 6.12, temperature: 38.9, battery: 11, state: "low-battery", lastContact: "Just now" },
  },
  {
    id: "cow-5",
    name: "Nandini",
    tag: "Cow #18",
    farm: "Sita Devi’s Dairy",
    breed: "Gir",
    risk: "low",
    score: 12,
    probability: null,
    checked: "Yesterday, 6:31 AM",
    recommendation: "",
    history: [14, 13, 14, 12, 11, 12, 14, 13, 12, 11, 13, 12, 11, 12],
    historyDays: ["Aug 24", "25", "26", "27", "28", "29", "30", "31", "Sep 1", "2", "3", "4", "5", "Today"],
    sensor: { ec: 4.12, temperature: 38.4, battery: 28, state: "stale", lastContact: "2 days ago" },
  },
];

const cowsSeedInitialized = cowsSeed.map((cow) => {
  const forecast = getRiskForecast(cow.history);
  return { ...cow, recommendation: generateRecommendation(cow.risk, cow.probability, forecast.trend, cow.score) };
});

const alertsSeed: AlertItem[] = [
  {
    id: "alert-1",
    cowId: "cow-1",
    date: "Today",
    time: "6:40 AM",
    risk: "high",
    title: "Early signs detected in Lakshmi",
    body: "Risk has risen steadily for 5 days. Contact your vet today.",
    validation: "active",
  },
  {
    id: "alert-2",
    cowId: "cow-2",
    date: "Today",
    time: "6:42 AM",
    risk: "medium",
    title: "Gauri needs another check",
    body: "A small change was noticed. Check again tomorrow morning.",
    validation: "active",
  },
  {
    id: "alert-3",
    cowId: "cow-4",
    date: "Yesterday",
    time: "6:35 AM",
    risk: "medium",
    title: "Kamdhenu is being watched",
    body: "Her reading is steady but above her normal range.",
    validation: "active",
  },
  {
    id: "alert-4",
    cowId: "cow-3",
    date: "Sep 04",
    time: "6:39 AM",
    risk: "low",
    title: "Routine check complete",
    body: "Radha’s reading is healthy. No action needed.",
    validation: "resolved",
  },
];

const copy = {
  en: {
    home: "My cows",
    alerts: "Alerts",
    about: "How it works",
    farmer: "Farmer view",
    vet: "Vet view",
    greeting: "Good morning, Sita",
    subtitle: "Here is your herd’s health today.",
    checkCows: "Check my cows",
    checking: "Checking readings…",
    addReading: "Add a reading",
    monitored: "Cows monitored",
    attention: "Need attention",
    healthy: "Healthy today",
    lastSynced: "Last synced 2 hours ago",
    offline: "Offline mode",
    online: "Online",
    high: "High risk",
    medium: "Watch closely",
    low: "Low risk",
    activeAlert: "Active alert",
    viewDetails: "View details",
    todayAt: "Checked today",
    recommendation: "Recommended action",
    history: "Risk history",
    trendTitle: "We noticed the change early",
    trendBody: "Lakshmi’s risk rose over the last 5 days. This is an early warning, before visible signs.",
    vetConfirmed: "Vet confirmed",
    falseAlarm: "False alarm",
    confirmed: "Confirmed",
    resolved: "Resolved",
    underTreatment: "Under treatment",
    underTreatmentRec: "Under vet treatment and active observation.",
    learnMore: "Learn more",
    switchToVet: "Switch to vet view",
    switchToFarmer: "Back to farmer view",
    menu: "Menu",
    selectCow: "Select a cow",
    activeAlerts: "Active alerts",
    farmsFlagged: "Farms flagged this week",
    casesMonth: "Confirmed cases this month",
    animals: "Animals monitored",
    sortRisk: "Sort by risk",
    allAlerts: "All alerts",
    highOnly: "High risk only",
    noAction: "No action needed — monitor as usual.",
    earlyWarning: "Early warning",
    demoNote: "Demo data · No hardware connected",
    aboutTitleLine1: "Know sooner.",
    aboutTitleLine2: "Care better.",
    aboutBody: "We check your cow’s milk for early signs of infection — days before you might notice anything yourself.",
    howOneTitle: "Check during milking",
    howOneBody: "The small sensor reads each cow while you already do your morning routine.",
    howTwoTitle: "Watch the change",
    howTwoBody: "We look at the pattern over time, not just one reading.",
    howThreeTitle: "Act early",
    howThreeBody: "A clear alert helps you speak to your vet before a problem grows.",
    aboutNoteTitle: "Built for real farm mornings.",
    aboutNoteBody: "Large buttons, simple colors, Hindi support, and offline-friendly readings keep Pashu Mitra useful in a cattle shed, not just on a stage.",
    phaseTwo: "Phase 2 roadmap · cooperative rollout",
    herdOverview: "Herd health overview",
    herdOverviewBody: "A clear picture across Sita Devi’s Dairy and nearby farms.",
    priorityList: "Priority list",
    animalsToReview: "Animals to review",
    selectedAnimal: "Selected animal",
    tableAnimal: "Animal",
    tableFarm: "Farm",
    tableRisk: "Risk",
    lastReading: "Last reading",
    tableAction: "Action",
    reviewed: "Reviewed",
    review: "Review",
    weekLabel: "Week 36 · 2026",
    readingCompletion: "Reading completion",
    cooperativeDesk: "Cooperative field desk",
    needsFollowup: "Needs follow-up",
    treatedEarly: "Both treated early",
    acrossFarms: "Across 8 farms",
    confirm: "Confirm",
    falseAlarmAction: "False alarm",
    noAnimalsMatch: "No animals match",
    riskChartNote: "Risk score over 14 days. A rising line prompts a timely physical check.",
  },
  hi: {
    home: "मेरी गायें",
    alerts: "सूचनाएं",
    about: "यह कैसे काम करता है",
    farmer: "किसान दृश्य",
    vet: "पशु चिकित्सक दृश्य",
    greeting: "सुप्रभात, सीता",
    subtitle: "आज आपके झुंड का स्वास्थ्य।",
    checkCows: "गायों की जांच करें",
    checking: "जांच हो रही है…",
    addReading: "रीडिंग जोड़ें",
    monitored: "निगरानी में",
    attention: "ध्यान दें",
    healthy: "आज स्वस्थ",
    lastSynced: "2 घंटे पहले सिंक हुआ",
    offline: "ऑफलाइन मोड",
    online: "ऑनलाइन",
    high: "अधिक जोखिम",
    medium: "ध्यान से देखें",
    low: "कम जोखिम",
    activeAlert: "सक्रिय सूचना",
    viewDetails: "विवरण देखें",
    todayAt: "आज जांची गई",
    recommendation: "सुझाई गई कार्रवाई",
    history: "जोखिम का इतिहास",
    trendTitle: "बदलाव जल्दी पता चला",
    trendBody: "लक्ष्मी का जोखिम पिछले 5 दिनों में बढ़ा है। यह दिखाई देने वाले लक्षणों से पहले की चेतावनी है।",
    vetConfirmed: "डॉक्टर ने पुष्टि की",
    falseAlarm: "गलत चेतावनी",
    confirmed: "पुष्टि हुई",
    resolved: "सुलझा हुआ",
    underTreatment: "उपचाराधीन",
    underTreatmentRec: "पशु चिकित्सक के इलाज और निगरानी में।",
    learnMore: "और जानें",
    switchToVet: "पशु चिकित्सक दृश्य",
    switchToFarmer: "किसान दृश्य पर वापस",
    menu: "मेनू",
    selectCow: "गाय चुनें",
    activeAlerts: "सक्रिय सूचनाएं",
    farmsFlagged: "इस सप्ताह जोखिम वाले फार्म",
    casesMonth: "इस महीने पुष्ट मामले",
    animals: "निगरानी में पशु",
    sortRisk: "जोखिम के अनुसार",
    allAlerts: "सभी सूचनाएं",
    highOnly: "केवल अधिक जोखिम",
    noAction: "कोई कार्रवाई नहीं — सामान्य निगरानी रखें।",
    earlyWarning: "जल्दी चेतावनी",
    demoNote: "डेमो डेटा · कोई हार्डवेयर जुड़ा नहीं",
    aboutTitleLine1: "जल्दी जानें।",
    aboutTitleLine2: "बेहतर देखभाल करें।",
    aboutBody: "हम आपकी गाय के दूध में संक्रमण के शुरुआती संकेत खोजते हैं — कई दिन पहले, जब आपको कुछ दिखाई भी नहीं देता।",
    howOneTitle: "दुहते समय जांचें",
    howOneBody: "छोटा सेंसर हर गाय को उसी सुबह की दिनचर्या के दौरान पढ़ता है।",
    howTwoTitle: "बदलाव पर नज़र रखें",
    howTwoBody: "हम केवल एक रीडिंग नहीं, बल्कि समय के साथ पैटर्न देखते हैं।",
    howThreeTitle: "जल्दी कदम उठाएं",
    howThreeBody: "एक साफ सूचना आपको समस्या बढ़ने से पहले डॉक्टर से बात करने में मदद करती है।",
    aboutNoteTitle: "असली खेत की सुबह के लिए बनाया गया।",
    aboutNoteBody: "बड़े बटन, सरल रंग, हिंदी सहायता और ऑफलाइन रीडिंग Pashu Mitra को खेत में उपयोगी बनाते हैं, सिर्फ मंच पर नहीं।",
    phaseTwo: "फेज़ 2 रोडमैप · सहकारी विस्तार",
    herdOverview: "झुंड के स्वास्थ्य का अवलोकन",
    herdOverviewBody: "सीता देवी के डेयरी और आसपास के फार्मों की स्पष्ट तस्वीर।",
    priorityList: "प्राथमिकता सूची",
    animalsToReview: "जिन पशुओं की समीक्षा करनी है",
    selectedAnimal: "चयनित पशु",
    tableAnimal: "पशु",
    tableFarm: "फार्म",
    tableRisk: "जोखिम",
    lastReading: "अंतिम रीडिंग",
    tableAction: "कार्रवाई",
    reviewed: "समीक्षा हुई",
    review: "समीक्षा करें",
    weekLabel: "सप्ताह 36 · 2026",
    readingCompletion: "रीडिंग पूर्णता",
    cooperativeDesk: "सहकारी फील्ड डेस्क",
    needsFollowup: "फॉलो-अप ज़रूरी",
    treatedEarly: "दोनों का जल्दी इलाज हुआ",
    acrossFarms: "8 फार्मों में",
    confirm: "पुष्टि करें",
    falseAlarmAction: "गलत चेतावनी",
    noAnimalsMatch: "कोई पशु मेल नहीं खाता",
    riskChartNote: "14 दिनों का जोखिम स्कोर। बढ़ती रेखा समय पर शारीरिक जांच का संकेत देती है।",
  },
};

const localizedCopy: Record<Language, typeof copy.en> = {
  en: copy.en,
  hi: copy.hi,
  mr: { ...copy.en, home: "माझ्या गायी", alerts: "सूचना", about: "हे कसे काम करते", farmer: "शेतकरी दृश्य", vet: "पशुवैद्य दृश्य", greeting: "शुभ प्रभात, सीता", subtitle: "आज तुमच्या कळपाचे आरोग्य.", checkCows: "गायी तपासा", checking: "रीडिंग तपासत आहे…", monitored: "निगराणीतील गायी", attention: "लक्ष देणे आवश्यक", healthy: "आज निरोगी", offline: "ऑफलाइन मोड", online: "ऑनलाइन", high: "जास्त धोका", medium: "लक्षपूर्वक पाहा", low: "कमी धोका", activeAlert: "सक्रिय सूचना", recommendation: "सुचवलेली कृती", history: "धोक्याचा इतिहास", trendTitle: "बदल लवकर लक्षात आला", switchToVet: "पशुवैद्य दृश्यावर जा", switchToFarmer: "शेतकरी दृश्यावर परत", menu: "मेनू", activeAlerts: "सक्रिय सूचना", farmsFlagged: "या आठवड्यात धोक्यातील फार्म", casesMonth: "या महिन्यातील निश्चित प्रकरणे", animals: "निगराणीतील प्राणी", sortRisk: "धोक्यानुसार क्रम", allAlerts: "सर्व सूचना", highOnly: "फक्त जास्त धोका", noAction: "कृती आवश्यक नाही — नेहमीप्रमाणे लक्ष ठेवा.", earlyWarning: "लवकर इशारा", demoNote: "डेमो डेटा · हार्डवेअर जोडलेले नाही", aboutTitleLine1: "लवकर जाणून घ्या.", aboutTitleLine2: "चांगली काळजी घ्या.", aboutBody: "तुमच्या लक्षात येण्याच्या काही दिवस आधी आम्ही गायीच्या दुधातील संसर्गाची सुरुवातीची चिन्हे तपासतो.", howOneTitle: "दूध काढताना तपासा", howOneBody: "तुमच्या सकाळच्या दिनक्रमात छोटा सेन्सर प्रत्येक गाय वाचतो.", howTwoTitle: "बदलावर लक्ष ठेवा", howTwoBody: "आम्ही फक्त एक रीडिंग नाही तर कालांतराने नमुना पाहतो.", howThreeTitle: "लवकर कृती करा", howThreeBody: "स्पष्ट सूचना समस्या वाढण्यापूर्वी पशुवैद्याशी बोलण्यास मदत करते.", aboutNoteTitle: "खऱ्या शेतातील सकाळीसाठी बनवलेले.", aboutNoteBody: "मोठी बटणे, सोपे रंग, मराठी मदत आणि ऑफलाइन रीडिंग Pashu Mitra ला गोठ्यात उपयुक्त ठेवतात.", phaseTwo: "फेज २ रोडमॅप · सहकारी विस्तार", herdOverview: "कळपाच्या आरोग्याचा आढावा", herdOverviewBody: "सीता देवी डेअरी आणि जवळच्या फार्मची स्पष्ट माहिती.", priorityList: "प्राधान्य यादी", animalsToReview: "तपासायचे प्राणी", selectedAnimal: "निवडलेला प्राणी", tableAnimal: "प्राणी", tableFarm: "फार्म", tableRisk: "धोका", lastReading: "शेवटचे रीडिंग", tableAction: "कृती", reviewed: "तपासले", review: "तपासा", weekLabel: "आठवडा ३६ · २०२६", readingCompletion: "रीडिंग पूर्णता", cooperativeDesk: "सहकारी फील्ड डेस्क", needsFollowup: "फॉलो-अप आवश्यक", treatedEarly: "दोन्हीवर लवकर उपचार", acrossFarms: "८ फार्ममध्ये", confirm: "निश्चित करा", falseAlarmAction: "चुकीची सूचना", noAnimalsMatch: "कोणताही प्राणी जुळला नाही", riskChartNote: "१४ दिवसांचा धोका. वाढती रेषा वेळेवर शारीरिक तपासणीचा संकेत देते." },
  gu: { ...copy.en, home: "મારી ગાયો", alerts: "સૂચનાઓ", about: "આ કેવી રીતે કામ કરે છે", farmer: "ખેડૂત દૃશ્ય", vet: "પશુચિકિત્સક દૃશ્ય", greeting: "સુપ્રભાત, સીતા", subtitle: "આજે તમારા ટોળાનું સ્વાસ્થ્ય.", checkCows: "ગાયો તપાસો", checking: "રીડિંગ તપાસી રહ્યા છીએ…", monitored: "નિરીક્ષણમાં ગાયો", attention: "ધ્યાન જરૂરી", healthy: "આજે સ્વસ્થ", offline: "ઑફલાઇન મોડ", online: "ઑનલાઇન", high: "વધુ જોખમ", medium: "ધ્યાનથી જુઓ", low: "ઓછું જોખમ", activeAlert: "સક્રિય સૂચના", recommendation: "ભલામણ કરેલી કાર્યવાહી", history: "જોખમનો ઇતિહાસ", trendTitle: "ફેરફાર વહેલો જણાયો", switchToVet: "પશુચિકિત્સક દૃશ્ય પર જાઓ", switchToFarmer: "ખેડૂત દૃશ્ય પર પાછા", menu: "મેનૂ", activeAlerts: "સક્રિય સૂચનાઓ", farmsFlagged: "આ અઠવાડિયે જોખમવાળા ફાર્મ", casesMonth: "આ મહિનાના પુષ્ટિ થયેલા કેસ", animals: "નિરીક્ષણમાં પ્રાણીઓ", sortRisk: "જોખમ પ્રમાણે ગોઠવો", allAlerts: "બધી સૂચનાઓ", highOnly: "માત્ર વધુ જોખમ", noAction: "કોઈ કાર્યવાહી જરૂરી નથી — સામાન્ય દેખરેખ રાખો.", earlyWarning: "વહેલી ચેતવણી", demoNote: "ડેમો ડેટા · હાર્ડવેર જોડાયેલ નથી", aboutTitleLine1: "વહેલું જાણો.", aboutTitleLine2: "સારી સંભાળ રાખો.", aboutBody: "તમને કંઈ જણાય તે પહેલાંના દિવસોમાં અમે ગાયના દૂધમાં ચેપના પ્રારંભિક સંકેતો તપાસીએ છીએ.", howOneTitle: "દોહતી વખતે તપાસો", howOneBody: "નાનો સેન્સર તમારી સવારની દિનચર્યામાં દરેક ગાયને વાંચે છે.", howTwoTitle: "ફેરફાર પર નજર રાખો", howTwoBody: "અમે માત્ર એક રીડિંગ નહીં, સમય સાથેની પેટર્ન જોઈએ છીએ.", howThreeTitle: "વહેલી કાર્યવાહી કરો", howThreeBody: "સ્પષ્ટ સૂચના સમસ્યા વધે તે પહેલાં પશુચિકિત્સક સાથે વાત કરવામાં મદદ કરે છે.", aboutNoteTitle: "ખેતરની વાસ્તવિક સવાર માટે બનાવેલું.", aboutNoteBody: "મોટા બટન, સરળ રંગો, ગુજરાતી સહાય અને ઑફલાઇન રીડિંગ Pashu Mitra ને તબેલામાં ઉપયોગી રાખે છે.", phaseTwo: "ફેઝ ૨ રોડમેપ · સહકારી વિસ્તરણ", herdOverview: "ટોળાના સ્વાસ્થ્યનો સારાંશ", herdOverviewBody: "સીતા દેવી ડેરી અને નજીકના ફાર્મની સ્પષ્ટ માહિતી.", priorityList: "પ્રાથમિકતા યાદી", animalsToReview: "સમીક્ષા કરવાના પ્રાણીઓ", selectedAnimal: "પસંદ કરેલ પ્રાણી", tableAnimal: "પ્રાણી", tableFarm: "ફાર્મ", tableRisk: "જોખમ", lastReading: "છેલ્લું રીડિંગ", tableAction: "કાર્યવાહી", reviewed: "સમીક્ષા થઈ", review: "સમીક્ષા કરો", weekLabel: "અઠવાડિયું ૩૬ · ૨૦૨૬", readingCompletion: "રીડિંગ પૂર્ણતા", cooperativeDesk: "સહકારી ફીલ્ડ ડેસ્ક", needsFollowup: "ફોલો-અપ જરૂરી", treatedEarly: "બંનેની વહેલી સારવાર થઈ", acrossFarms: "૮ ફાર્મમાં", confirm: "પુષ્ટિ કરો", falseAlarmAction: "ખોટી સૂચના", noAnimalsMatch: "કોઈ પ્રાણી મળ્યું નથી", riskChartNote: "૧૪ દિવસનો જોખમ. વધતી રેખા સમયસર શારીરિક તપાસનો સંકેત આપે છે." },
  pa: { ...copy.en, home: "ਮੇਰੀਆਂ ਗਾਵਾਂ", alerts: "ਸੂਚਨਾਵਾਂ", about: "ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ", farmer: "ਕਿਸਾਨ ਦ੍ਰਿਸ਼", vet: "ਪਸ਼ੂ ਡਾਕਟਰ ਦ੍ਰਿਸ਼", greeting: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ, ਸੀਤਾ", subtitle: "ਅੱਜ ਤੁਹਾਡੇ ਝੁੰਡ ਦੀ ਸਿਹਤ.", checkCows: "ਗਾਵਾਂ ਦੀ ਜਾਂਚ ਕਰੋ", checking: "ਰੀਡਿੰਗ ਜਾਂਚ ਰਹੇ ਹਾਂ…", monitored: "ਨਿਗਰਾਨੀ ਹੇਠ ਗਾਵਾਂ", attention: "ਧਿਆਨ ਦੀ ਲੋੜ", healthy: "ਅੱਜ ਤੰਦਰੁਸਤ", offline: "ਆਫਲਾਈਨ ਮੋਡ", online: "ਆਨਲਾਈਨ", high: "ਵੱਧ ਖਤਰਾ", medium: "ਧਿਆਨ ਨਾਲ ਦੇਖੋ", low: "ਘੱਟ ਖਤਰਾ", activeAlert: "ਸਰਗਰਮ ਸੂਚਨਾ", recommendation: "ਸਿਫ਼ਾਰਸ਼ੀ ਕਾਰਵਾਈ", history: "ਖਤਰੇ ਦਾ ਇਤਿਹਾਸ", trendTitle: "ਬਦਲਾਅ ਜਲਦੀ ਪਤਾ ਲੱਗਾ", switchToVet: "ਪਸ਼ੂ ਡਾਕਟਰ ਦ੍ਰਿਸ਼ ਤੇ ਜਾਓ", switchToFarmer: "ਕਿਸਾਨ ਦ੍ਰਿਸ਼ ਤੇ ਵਾਪਸ", menu: "ਮੀਨੂ", activeAlerts: "ਸਰਗਰਮ ਸੂਚਨਾਵਾਂ", farmsFlagged: "ਇਸ ਹਫ਼ਤੇ ਖਤਰੇ ਵਾਲੇ ਫਾਰਮ", casesMonth: "ਇਸ ਮਹੀਨੇ ਪੁਸ਼ਟੀਸ਼ੁਦਾ ਕੇਸ", animals: "ਨਿਗਰਾਨੀ ਹੇਠ ਜਾਨਵਰ", sortRisk: "ਖਤਰੇ ਅਨੁਸਾਰ", allAlerts: "ਸਾਰੀਆਂ ਸੂਚਨਾਵਾਂ", highOnly: "ਸਿਰਫ਼ ਵੱਧ ਖਤਰਾ", noAction: "ਕੋਈ ਕਾਰਵਾਈ ਲੋੜੀਂਦੀ ਨਹੀਂ — ਆਮ ਨਿਗਰਾਨੀ ਰੱਖੋ.", earlyWarning: "ਜਲਦੀ ਚੇਤਾਵਨੀ", demoNote: "ਡੈਮੋ ਡਾਟਾ · ਹਾਰਡਵੇਅਰ ਜੁੜਿਆ ਨਹੀਂ", aboutTitleLine1: "ਜਲਦੀ ਜਾਣੋ.", aboutTitleLine2: "ਚੰਗੀ ਦੇਖਭਾਲ ਕਰੋ.", aboutBody: "ਤੁਹਾਨੂੰ ਪਤਾ ਲੱਗਣ ਤੋਂ ਕਈ ਦਿਨ ਪਹਿਲਾਂ ਅਸੀਂ ਗਾਂ ਦੇ ਦੁੱਧ ਵਿੱਚ ਇਨਫੈਕਸ਼ਨ ਦੇ ਸ਼ੁਰੂਆਤੀ ਸੰਕੇਤ ਜਾਂਚਦੇ ਹਾਂ.", howOneTitle: "ਦੁੱਧ ਕੱਢਦੇ ਸਮੇਂ ਜਾਂਚੋ", howOneBody: "ਛੋਟਾ ਸੈਂਸਰ ਤੁਹਾਡੀ ਸਵੇਰ ਦੀ ਰੁਟੀਨ ਵਿੱਚ ਹਰ ਗਾਂ ਨੂੰ ਪੜ੍ਹਦਾ ਹੈ.", howTwoTitle: "ਬਦਲਾਅ ਤੇ ਨਜ਼ਰ ਰੱਖੋ", howTwoBody: "ਅਸੀਂ ਸਿਰਫ਼ ਇੱਕ ਰੀਡਿੰਗ ਨਹੀਂ, ਸਮੇਂ ਨਾਲ ਪੈਟਰਨ ਵੇਖਦੇ ਹਾਂ.", howThreeTitle: "ਜਲਦੀ ਕਾਰਵਾਈ ਕਰੋ", howThreeBody: "ਸਪਸ਼ਟ ਸੂਚਨਾ ਸਮੱਸਿਆ ਵਧਣ ਤੋਂ ਪਹਿਲਾਂ ਪਸ਼ੂ ਡਾਕਟਰ ਨਾਲ ਗੱਲ ਕਰਨ ਵਿੱਚ ਮਦਦ ਕਰਦੀ ਹੈ.", aboutNoteTitle: "ਅਸਲੀ ਖੇਤ ਦੀ ਸਵੇਰ ਲਈ ਬਣਾਇਆ ਗਿਆ.", aboutNoteBody: "ਵੱਡੇ ਬਟਨ, ਸਧਾਰਨ ਰੰਗ, ਪੰਜਾਬੀ ਸਹਾਇਤਾ ਅਤੇ ਆਫਲਾਈਨ ਰੀਡਿੰਗ Pashu Mitra ਨੂੰ ਪਸ਼ੂਆਂ ਦੇ ਥਾਂ ਤੇ ਲਾਭਦਾਇਕ ਰੱਖਦੇ ਹਨ.", phaseTwo: "ਫੇਜ਼ ੨ ਰੋਡਮੈਪ · ਸਹਿਕਾਰੀ ਵਿਸਥਾਰ", herdOverview: "ਝੁੰਡ ਦੀ ਸਿਹਤ ਦਾ ਜਾਇਜ਼ਾ", herdOverviewBody: "ਸੀਤਾ ਦੇਵੀ ਡੇਅਰੀ ਅਤੇ ਨੇੜਲੇ ਫਾਰਮਾਂ ਦੀ ਸਪਸ਼ਟ ਤਸਵੀਰ.", priorityList: "ਤਰਜੀਹ ਸੂਚੀ", animalsToReview: "ਜਿਨ੍ਹਾਂ ਜਾਨਵਰਾਂ ਦੀ ਸਮੀਖਿਆ ਕਰਨੀ ਹੈ", selectedAnimal: "ਚੁਣਿਆ ਜਾਨਵਰ", tableAnimal: "ਜਾਨਵਰ", tableFarm: "ਫਾਰਮ", tableRisk: "ਖਤਰਾ", lastReading: "ਆਖਰੀ ਰੀਡਿੰਗ", tableAction: "ਕਾਰਵਾਈ", reviewed: "ਸਮੀਖਿਆ ਹੋਈ", review: "ਸਮੀਖਿਆ ਕਰੋ", weekLabel: "ਹਫ਼ਤਾ ੩੬ · ੨੦੨੬", readingCompletion: "ਰੀਡਿੰਗ ਪੂਰਨਤਾ", cooperativeDesk: "ਸਹਿਕਾਰੀ ਫੀਲਡ ਡੈਸਕ", needsFollowup: "ਫਾਲੋ-ਅੱਪ ਲੋੜੀਂਦਾ", treatedEarly: "ਦੋਵਾਂ ਦਾ ਜਲਦੀ ਇਲਾਜ ਹੋਇਆ", acrossFarms: "੮ ਫਾਰਮਾਂ ਵਿੱਚ", confirm: "ਪੁਸ਼ਟੀ ਕਰੋ", falseAlarmAction: "ਗਲਤ ਸੂਚਨਾ", noAnimalsMatch: "ਕੋਈ ਜਾਨਵਰ ਨਹੀਂ ਮਿਲਿਆ", riskChartNote: "੧੪ ਦਿਨਾਂ ਦਾ ਖਤਰਾ. ਵਧਦੀ ਲਾਈਨ ਸਮੇਂ ਸਿਰ ਜਾਂਚ ਦਾ ਸੰਕੇਤ ਦਿੰਦੀ ਹੈ." },
  kn: { ...copy.en, home: "ನನ್ನ ಹಸುಗಳು", alerts: "ಎಚ್ಚರಿಕೆಗಳು", about: "ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ", farmer: "ರೈತ ವೀಕ್ಷಣೆ", vet: "ಪಶುವೈದ್ಯ ವೀಕ್ಷಣೆ", greeting: "ಶುಭೋದಯ, ಸೀತಾ", subtitle: "ಇಂದು ನಿಮ್ಮ ಹಿಂಡಿನ ಆರೋಗ್ಯ.", checkCows: "ಹಸುಗಳನ್ನು ಪರೀಕ್ಷಿಸಿ", checking: "ರೀಡಿಂಗ್ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ…", monitored: "ಮೇಲ್ವಿಚಾರಣೆಯಲ್ಲಿರುವ ಹಸುಗಳು", attention: "ಗಮನ ಅಗತ್ಯ", healthy: "ಇಂದು ಆರೋಗ್ಯಕರ", offline: "ಆಫ್‌ಲೈನ್ ಮೋಡ್", online: "ಆನ್‌ಲೈನ್", high: "ಹೆಚ್ಚಿನ ಅಪಾಯ", medium: "ಎಚ್ಚರಿಕೆಯಿಂದ ನೋಡಿ", low: "ಕಡಿಮೆ ಅಪಾಯ", activeAlert: "ಸಕ್ರಿಯ ಎಚ್ಚರಿಕೆ", recommendation: "ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ರಮ", history: "ಅಪಾಯದ ಇತಿಹಾಸ", trendTitle: "ಬದಲಾವಣೆ ಬೇಗ ಕಂಡುಬಂದಿತು", switchToVet: "ಪಶುವೈದ್ಯ ವೀಕ್ಷಣೆಗೆ ಬದಲಿಸಿ", switchToFarmer: "ರೈತ ವೀಕ್ಷಣೆಗೆ ಹಿಂತಿರುಗಿ", menu: "ಮೆನು", activeAlerts: "ಸಕ್ರಿಯ ಎಚ್ಚರಿಕೆಗಳು", farmsFlagged: "ಈ ವಾರ ಗುರುತಿಸಲಾದ ಫಾರ್ಮ್‌ಗಳು", casesMonth: "ಈ ತಿಂಗಳ ದೃಢಪಟ್ಟ ಪ್ರಕರಣಗಳು", animals: "ಮೇಲ್ವಿಚಾರಣೆಯಲ್ಲಿರುವ ಪ್ರಾಣಿಗಳು", sortRisk: "ಅಪಾಯದ ಪ್ರಕಾರ", allAlerts: "ಎಲ್ಲಾ ಎಚ್ಚರಿಕೆಗಳು", highOnly: "ಹೆಚ್ಚಿನ ಅಪಾಯ ಮಾತ್ರ", noAction: "ಯಾವುದೇ ಕ್ರಮ ಅಗತ್ಯವಿಲ್ಲ — ಎಂದಿನಂತೆ ಗಮನಿಸಿ.", earlyWarning: "ಮುಂಚಿನ ಎಚ್ಚರಿಕೆ", demoNote: "ಡೆಮೋ ಡೇಟಾ · ಹಾರ್ಡ್‌ವೇರ್ ಸಂಪರ್ಕಗೊಂಡಿಲ್ಲ", aboutTitleLine1: "ಬೇಗ ತಿಳಿಯಿರಿ.", aboutTitleLine2: "ಉತ್ತಮ ಆರೈಕೆ ಮಾಡಿ.", aboutBody: "ನಿಮಗೆ ಕಾಣಿಸುವ ಹಲವು ದಿನಗಳ ಮುಂಚೆಯೇ ಹಸುವಿನ ಹಾಲಿನಲ್ಲಿ ಸೋಂಕಿನ ಆರಂಭಿಕ ಲಕ್ಷಣಗಳನ್ನು ನಾವು ಪರಿಶೀಲಿಸುತ್ತೇವೆ.", howOneTitle: "ಹಾಲು ಕರೆಯುವಾಗ ಪರಿಶೀಲಿಸಿ", howOneBody: "ನಿಮ್ಮ ಬೆಳಗಿನ ದಿನಚರಿಯಲ್ಲೇ ಸಣ್ಣ ಸೆನ್ಸರ್ ಪ್ರತಿ ಹಸುವನ್ನು ಓದುತ್ತದೆ.", howTwoTitle: "ಬದಲಾವಣೆಯನ್ನು ಗಮನಿಸಿ", howTwoBody: "ನಾವು ಒಂದೇ ರೀಡಿಂಗ್ ಅಲ್ಲ, ಕಾಲಕ್ರಮೇಣದ ಮಾದರಿಯನ್ನು ನೋಡುತ್ತೇವೆ.", howThreeTitle: "ಬೇಗ ಕ್ರಮ ಕೈಗೊಳ್ಳಿ", howThreeBody: "ಸ್ಪಷ್ಟ ಎಚ್ಚರಿಕೆಯು ಸಮಸ್ಯೆ ಹೆಚ್ಚಾಗುವ ಮುನ್ನ ಪಶುವೈದ್ಯರೊಂದಿಗೆ ಮಾತನಾಡಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.", aboutNoteTitle: "ನಿಜವಾದ ಕೃಷಿ ಬೆಳಗ್ಗಿಗಾಗಿ ನಿರ್ಮಿಸಲಾಗಿದೆ.", aboutNoteBody: "ದೊಡ್ಡ ಬಟನ್‌ಗಳು, ಸರಳ ಬಣ್ಣಗಳು, ಕನ್ನಡ ಬೆಂಬಲ ಮತ್ತು ಆಫ್‌ಲೈನ್ ರೀಡಿಂಗ್ Pashu Mitra ಅನ್ನು ಕೊಟ್ಟಿಗೆಯಲ್ಲೂ ಉಪಯುಕ್ತವಾಗಿಸುತ್ತವೆ.", phaseTwo: "ಹಂತ ೨ ರೋಡ್‌ಮ್ಯಾಪ್ · ಸಹಕಾರಿ ವಿಸ್ತರಣೆ", herdOverview: "ಹಿಂಡಿನ ಆರೋಗ್ಯದ ಅವಲೋಕನ", herdOverviewBody: "ಸೀತಾ ದೇವಿ ಡೈರಿ ಮತ್ತು ಹತ್ತಿರದ ಫಾರ್ಮ್‌ಗಳ ಸ್ಪಷ್ಟ ಚಿತ್ರ.", priorityList: "ಆದ್ಯತಾ ಪಟ್ಟಿ", animalsToReview: "ಪರಿಶೀಲಿಸಬೇಕಾದ ಪ್ರಾಣಿಗಳು", selectedAnimal: "ಆಯ್ಕೆ ಮಾಡಿದ ಪ್ರಾಣಿ", tableAnimal: "ಪ್ರಾಣಿ", tableFarm: "ಫಾರ್ಮ್", tableRisk: "ಅಪಾಯ", lastReading: "ಕೊನೆಯ ರೀಡಿಂಗ್", tableAction: "ಕ್ರಮ", reviewed: "ಪರಿಶೀಲಿಸಲಾಗಿದೆ", review: "ಪರಿಶೀಲಿಸಿ", weekLabel: "ವಾರ ೩೬ · ೨೦೨೬", readingCompletion: "ರೀಡಿಂಗ್ ಪೂರ್ಣತೆ", cooperativeDesk: "ಸಹಕಾರಿ ಫೀಲ್ಡ್ ಡೆಸ್ಕ್", needsFollowup: "ಫಾಲೋ-ಅಪ್ ಅಗತ್ಯ", treatedEarly: "ಎರಡಕ್ಕೂ ಬೇಗ ಚಿಕಿತ್ಸೆ", acrossFarms: "೮ ಫಾರ್ಮ್‌ಗಳಲ್ಲಿ", confirm: "ದೃಢೀಕರಿಸಿ", falseAlarmAction: "ಸುಳ್ಳು ಎಚ್ಚರಿಕೆ", noAnimalsMatch: "ಯಾವುದೇ ಪ್ರಾಣಿ ಹೊಂದಿಕೆಯಾಗಲಿಲ್ಲ", riskChartNote: "೧೪ ದಿನಗಳ ಅಪಾಯ. ಏರುತ್ತಿರುವ ರೇಖೆಯು ಸಮಯೋಚಿತ ದೈಹಿಕ ಪರೀಕ್ಷೆಯ ಸೂಚನೆ." },
  ta: { ...copy.en, home: "என் மாடுகள்", alerts: "எச்சரிக்கைகள்", about: "இது எப்படி செயல்படுகிறது", farmer: "விவசாயி பார்வை", vet: "கால்நடை மருத்துவர் பார்வை", greeting: "காலை வணக்கம், சீதா", subtitle: "இன்று உங்கள் மந்தையின் ஆரோக்கியம்.", checkCows: "மாடுகளைச் சரிபார்க்கவும்", checking: "வாசிப்புகளைச் சரிபார்க்கிறது…", monitored: "கண்காணிப்பில் உள்ள மாடுகள்", attention: "கவனம் தேவை", healthy: "இன்று ஆரோக்கியம்", offline: "ஆஃப்லைன் முறை", online: "ஆன்லைன்", high: "அதிக ஆபத்து", medium: "கவனமாகக் கண்காணிக்கவும்", low: "குறைந்த ஆபத்து", activeAlert: "செயலில் உள்ள எச்சரிக்கை", recommendation: "பரிந்துரைக்கப்பட்ட செயல்", history: "ஆபத்து வரலாறு", trendTitle: "மாற்றத்தை முன்கூட்டியே கண்டோம்", switchToVet: "மருத்துவர் பார்வைக்கு மாறவும்", switchToFarmer: "விவசாயி பார்வைக்குத் திரும்பவும்", menu: "மெனு", activeAlerts: "செயலில் உள்ள எச்சரிக்கைகள்", farmsFlagged: "இந்த வாரம் குறிக்கப்பட்ட பண்ணைகள்", casesMonth: "இந்த மாதம் உறுதி செய்யப்பட்ட வழக்குகள்", animals: "கண்காணிக்கப்படும் விலங்குகள்", sortRisk: "ஆபத்தின் படி வரிசை", allAlerts: "அனைத்து எச்சரிக்கைகள்", highOnly: "அதிக ஆபத்து மட்டும்", noAction: "செயல் தேவையில்லை — வழக்கம்போல் கண்காணிக்கவும்.", earlyWarning: "முன்கூட்டிய எச்சரிக்கை", demoNote: "டெமோ தரவு · வன்பொருள் இணைக்கப்படவில்லை", aboutTitleLine1: "முன்கூட்டியே அறியுங்கள்.", aboutTitleLine2: "சிறந்த பராமரிப்பு செய்யுங்கள்.", aboutBody: "உங்களுக்கு அறிகுறிகள் தெரிவதற்கு பல நாட்களுக்கு முன்பே, உங்கள் மாட்டுப் பாலில் தொற்றின் ஆரம்ப அறிகுறிகளை நாங்கள் சரிபார்க்கிறோம்.", howOneTitle: "பால் கறக்கும் போது சரிபார்க்கவும்", howOneBody: "உங்கள் காலை வழக்கத்திலேயே சிறிய சென்சார் ஒவ்வொரு மாட்டையும் படிக்கும்.", howTwoTitle: "மாற்றத்தைக் கவனியுங்கள்", howTwoBody: "ஒரு வாசிப்பு மட்டுமல்ல, காலப்போக்கில் உள்ள முறையைப் பார்க்கிறோம்.", howThreeTitle: "முன்கூட்டியே செயல்படுங்கள்", howThreeBody: "தெளிவான எச்சரிக்கை பிரச்சினை பெரிதாகும் முன் மருத்துவரிடம் பேச உதவும்.", aboutNoteTitle: "உண்மையான பண்ணை காலைக்காக உருவாக்கப்பட்டது.", aboutNoteBody: "பெரிய பொத்தான்கள், எளிய வண்ணங்கள், தமிழ் ஆதரவு மற்றும் ஆஃப்லைன் வாசிப்புகள் Pashu Mitra-வை மாட்டுத் தொழுவத்திலும் பயனுள்ளதாக வைத்திருக்கின்றன.", phaseTwo: "கட்டம் ௨ சாலைவரைபடம் · கூட்டுறவு விரிவாக்கம்", herdOverview: "மந்தை ஆரோக்கிய மேலோட்டம்", herdOverviewBody: "சீதா தேவி பால் பண்ணை மற்றும் அருகிலுள்ள பண்ணைகளின் தெளிவான படம்.", priorityList: "முன்னுரிமைப் பட்டியல்", animalsToReview: "மதிப்பாய்வு செய்ய வேண்டிய விலங்குகள்", selectedAnimal: "தேர்ந்தெடுக்கப்பட்ட விலங்கு", tableAnimal: "விலங்கு", tableFarm: "பண்ணை", tableRisk: "ஆபத்து", lastReading: "கடைசி வாசிப்பு", tableAction: "செயல்", reviewed: "மதிப்பாய்வு செய்யப்பட்டது", review: "மதிப்பாய்வு செய்க", weekLabel: "வாரம் ௩௬ · ௨௦௨௨", readingCompletion: "வாசிப்பு நிறைவு", cooperativeDesk: "கூட்டுறவு கள மேசை", needsFollowup: "தொடர் நடவடிக்கை தேவை", treatedEarly: "இரண்டுக்கும் முன்கூட்டியே சிகிச்சை", acrossFarms: "௮ பண்ணைகளில்", confirm: "உறுதிப்படுத்துக", falseAlarmAction: "தவறான எச்சரிக்கை", noAnimalsMatch: "விலங்குகள் பொருந்தவில்லை", riskChartNote: "௧௪ நாள் ஆபத்து. உயரும் கோடு சரியான நேரத்தில் உடல் பரிசோதனையைச் சுட்டுகிறது." },
  te: { ...copy.en, home: "నా ఆవులు", alerts: "హెచ్చరికలు", about: "ఇది ఎలా పనిచేస్తుంది", farmer: "రైతు వీక్షణ", vet: "పశువైద్య వీక్షణ", greeting: "శుభోదయం, సీత", subtitle: "ఈ రోజు మీ మంద ఆరోగ్యం.", checkCows: "ఆవులను తనిఖీ చేయండి", checking: "రీడింగ్‌లను తనిఖీ చేస్తున్నాం…", monitored: "పర్యవేక్షణలోని ఆవులు", attention: "శ్రద్ధ అవసరం", healthy: "ఈ రోజు ఆరోగ్యంగా", offline: "ఆఫ్‌లైన్ మోడ్", online: "ఆన్‌లైన్", high: "అధిక ప్రమాదం", medium: "జాగ్రత్తగా చూడండి", low: "తక్కువ ప్రమాదం", activeAlert: "క్రియాశీల హెచ్చరిక", recommendation: "సిఫార్సు చేసిన చర్య", history: "ప్రమాద చరిత్ర", trendTitle: "మార్పును ముందుగానే గుర్తించాం", switchToVet: "పశువైద్య వీక్షణకు మారండి", switchToFarmer: "రైతు వీక్షణకు తిరిగి వెళ్లండి", menu: "మెను", activeAlerts: "క్రియాశీల హెచ్చరికలు", farmsFlagged: "ఈ వారం గుర్తించిన ఫారాలు", casesMonth: "ఈ నెల నిర్ధారించిన కేసులు", animals: "పర్యవేక్షణలోని జంతువులు", sortRisk: "ప్రమాదం ప్రకారం", allAlerts: "అన్ని హెచ్చరికలు", highOnly: "అధిక ప్రమాదం మాత్రమే", noAction: "చర్య అవసరం లేదు — సాధారణంగా పర్యవేక్షించండి.", earlyWarning: "ముందస్తు హెచ్చరిక", demoNote: "డెమో డేటా · హార్డ్‌వేర్ కనెక్ట్ కాలేదు", aboutTitleLine1: "ముందుగానే తెలుసుకోండి.", aboutTitleLine2: "మెరుగైన సంరక్షణ చేయండి.", aboutBody: "మీకు కనిపించే లక్షణాలకు కొన్ని రోజుల ముందే, మీ ఆవు పాలలో సంక్రమణ ప్రారంభ సంకేతాలను మేము తనిఖీ చేస్తాము.", howOneTitle: "పాలు పితికేటప్పుడు తనిఖీ చేయండి", howOneBody: "మీ ఉదయపు దినచర్యలోనే చిన్న సెన్సార్ ప్రతి ఆవును చదువుతుంది.", howTwoTitle: "మార్పును గమనించండి", howTwoBody: "ఒక్క రీడింగ్ కాకుండా కాలక్రమంలోని నమూనాను చూస్తాము.", howThreeTitle: "ముందుగానే చర్య తీసుకోండి", howThreeBody: "స్పష్టమైన హెచ్చరిక సమస్య పెరగకముందే పశువైద్యుడితో మాట్లాడటానికి సహాయపడుతుంది.", aboutNoteTitle: "నిజమైన వ్యవసాయ ఉదయాల కోసం నిర్మించబడింది.", aboutNoteBody: "పెద్ద బటన్లు, సరళమైన రంగులు, తెలుగు మద్దతు మరియు ఆఫ్‌లైన్ రీడింగ్‌లు Pashu Mitraని పశువుల కొట్టంలో ఉపయోగకరంగా ఉంచుతాయి.", phaseTwo: "దశ ౨ రోడ్‌మ్యాప్ · సహకార విస్తరణ", herdOverview: "మంద ఆరోగ్య అవలోకనం", herdOverviewBody: "సీతా దేవి డైరీ మరియు సమీప ఫారాల స్పష్టమైన చిత్రం.", priorityList: "ప్రాధాన్యత జాబితా", animalsToReview: "సమీక్షించాల్సిన జంతువులు", selectedAnimal: "ఎంచుకున్న జంతువు", tableAnimal: "జంతువు", tableFarm: "ఫారం", tableRisk: "ప్రమాదం", lastReading: "చివరి రీడింగ్", tableAction: "చర్య", reviewed: "సమీక్షించబడింది", review: "సమీక్షించండి", weekLabel: "వారం ౩౬ · ౨౦౨౬", readingCompletion: "రీడింగ్ పూర్తి", cooperativeDesk: "సహకార ఫీల్డ్ డెస్క్", needsFollowup: "ఫాలో-అప్ అవసరం", treatedEarly: "రెండింటికీ ముందుగానే చికిత్స", acrossFarms: "౮ ఫారాల్లో", confirm: "నిర్ధారించండి", falseAlarmAction: "తప్పుడు హెచ్చరిక", noAnimalsMatch: "జంతువులు సరిపోలలేదు", riskChartNote: "౧౪ రోజుల ప్రమాదం. పెరుగుతున్న రేఖ సమయానుకూల శారీరక పరీక్షకు సంకేతం." },
};

type ExtraCopy = {
  weatherToday: string; weatherLocationLabel: string; farmerProfile: string; profileSubtitle: string; farmerLabel: string; phoneLabel: string; villageLabel: string; memberSinceLabel: string; dairyLabel: string; registeredDevices: string; cowsRegistered: string; sensorDevices: string; currentPreference: string; languageHelp: string; changeLanguage: string; localVet: string; largeAnimalSpecialist: string; availableToday: string; shareReading: string; startDemoCall: string; demoInteraction: string; sensorConnected: string; sensorLow: string; sensorStale: string; liveDemoFeed: string; callingVet: string; queuedReadings: string; syncedReadings: string; backOnline: string; offlineOn: string; vetConfirmedToast: string; falseAlarmToast: string; farmerOverview: string; farmTitle: string; farmSubtitle: string; cowsRegisteredStat: string; currentHerd: string; sensorsConnected: string; sensorsNotResponding: string; lowBattery: string; watchSensors: string; herdTrend: string; averageRisk: string; recentCare: string; lastResolved: string; noResolved: string; dayAgo: string; daysAgo: string; basedOnAlerts: string; sensorWatch: string; sensorNotRespondingPlural: string; dueChecks: string; dueChecksBody: string; allChecked: string; thisWeek: string; readingsTaken: string; alertsRaised: string; alertsResolved: string; advisory: string; advisoryHigh: string; advisoryMedium: string; advisoryGood: string; quickAccess: string; openAlerts: string; contactVet: string; useStatePicker: string; searchAnimals: string; close: string; actualFeed: string; modelRisk: string; modelRiskBody: string; riskScoreToday: string; infectionProbability: string; days: string; continuousHistory: string; routineTitle: string; routineBody: string; alertSubtitle: string; farmTrendNote: string; demoDerived: string; checkNow: string; noAnimals: string; vetValidationNote: string; dateToday: string;
  selectStateLabel: string; cooperativeOverview: string; perFarmRiskDist: string; weeklyAlertTrend: string; sevenDayTrajectory: string; hassanCoopDesk: string; registeredFarms: string; activeAnimals: string; telemetrySyncRate: string; subclinicalFlags: string; highRisk: string; medRisk: string; allLowRisk: string; normalRisk: string; weeklyTrendChange: string; explainableAi: string; featureTransparencyPanel: string; transparencyIntro: string; conductivityFeatureName: string; conductivityFeatureRole: string; conductivityFeatureDesc: string; temperatureFeatureName: string; temperatureFeatureRole: string; temperatureFeatureDesc: string; vetFeedbackNote: string; impactTechnologyRoadmap: string; subclinicalIntelligenceEconomicProtection: string; pitchIntro: string; card1Badge: string; card1Title: string; card1Body: string; card1Bullet1: string; card1Bullet2: string; card1Bullet3: string; card2Badge: string; card2Title: string; card2Body: string; card2Bullet1: string; card2Bullet2: string; card2Bullet3: string; card3Badge: string; card3Title: string; card3Body: string; card3Bullet1: string; card3Bullet2: string; card3Bullet3: string;
}
const extraCopy: Record<Language, Partial<ExtraCopy>> = {
  en: { weatherToday: "Sunday, 6 September 2026", weatherLocationLabel: "Hassan, Karnataka", farmerProfile: "Farmer profile", profileSubtitle: "Your farmer identity and dairy details.", farmerLabel: "Farmer", phoneLabel: "Phone", villageLabel: "Village", memberSinceLabel: "Member since", dairyLabel: "Your dairy", registeredDevices: "Registered devices", cowsRegistered: "Cows registered", sensorDevices: "Sensor devices", currentPreference: "Current preference", languageHelp: "Your state picker controls the language across the app.", changeLanguage: "Change state / language", localVet: "Your local veterinarian", largeAnimalSpecialist: "Large animal specialist", availableToday: "Available today · 8 AM – 7 PM", shareReading: "Share the reading when you speak with the vet.", startDemoCall: "Start demo call", demoInteraction: "Demo interaction · no real call will be placed", sensorConnected: "Sensor connected", sensorLow: "Battery low", sensorStale: "Sensor not responding", liveDemoFeed: "Live demo feed", callingVet: "Calling Dr. Meera Rao… (demo)", queuedReadings: "readings queued · will sync when back online", syncedReadings: "queued readings synced · herd is up to date", backOnline: "Back online", offlineOn: "Offline mode on · readings stay on this device", vetConfirmedToast: "Vet confirmation recorded", falseAlarmToast: "Marked as a false alarm", farmerOverview: "Farmer overview", farmTitle: "My Farm", farmSubtitle: "A simple picture of your herd today.", cowsRegisteredStat: "Cows registered", currentHerd: "Your current herd", sensorsConnected: "Sensors connected", sensorsNotResponding: "not responding", lowBattery: "Low battery", watchSensors: "Watch these sensors", herdTrend: "Herd trend", averageRisk: "Average risk score", recentCare: "Recent care", lastResolved: "Last resolved alert", noResolved: "No resolved case yet", dayAgo: "day ago", daysAgo: "days ago", basedOnAlerts: "Based on the most recent confirmed or resolved alert in this demo.", sensorWatch: "Sensor watch", sensorNotRespondingPlural: "sensor(s) not responding.", dueChecks: "Cows due for a check", dueChecksBody: "These cows have not been checked today.", allChecked: "Every cow has a current reading today.", thisWeek: "This week", readingsTaken: "Readings taken", alertsRaised: "Alerts raised", alertsResolved: "Alerts resolved", advisory: "Today’s advisory", advisoryHigh: "needs attention today.", advisoryMedium: "could use a closer look today.", advisoryGood: "Your herd looks good — no cows need attention right now.", quickAccess: "Quick access", openAlerts: "Open alerts", contactVet: "Contact vet", useStatePicker: "Use the state picker above to change your language", searchAnimals: "Search animals…", close: "Close", actualFeed: "Today’s milk check", modelRisk: "AI risk model", modelRiskBody: "Trained on real conductivity and temperature data. This is not a diagnosis — it helps you speak to your vet at the right time.", riskScoreToday: "Today’s risk score", infectionProbability: "Probability of infection risk", days: "days", continuousHistory: "Continuous history", routineTitle: "Keep the good habit", routineBody: "One morning reading a day keeps your herd story clear.", alertSubtitle: "Every alert gives you one clear next step.", farmTrendNote: "Lower scores are generally calmer. This is an overview of your existing cow readings.", demoDerived: "Demo-derived summary · updates with current readings", checkNow: "Check now", noAnimals: "No animals match", vetValidationNote: "Vet-in-the-loop validation improves the next reading.", dateToday: "Sunday, 6 September 2026", selectStateLabel: "Select your state", cooperativeOverview: "Cooperative Overview", perFarmRiskDist: "Per-Farm Risk Distribution", weeklyAlertTrend: "Weekly Alert Trend", sevenDayTrajectory: "7-Day Trajectory", hassanCoopDesk: "Hassan District Dairy Union · Route 4 Cooperative Desk", registeredFarms: "Registered Farms", activeAnimals: "Active Animals", telemetrySyncRate: "Telemetry Sync Rate", subclinicalFlags: "Subclinical Flags", highRisk: "High Risk", medRisk: "Med Risk", allLowRisk: "All Low Risk", normalRisk: "Normal", weeklyTrendChange: "-28% vs Last Week", explainableAi: "Explainable AI", featureTransparencyPanel: "Feature Transparency Panel", transparencyIntro: "Subclinical risk predictions are generated by a neural network model trained on real conductivity and temperature telemetry from public datasets. Both inputs work together to estimate risk.", conductivityFeatureName: "Milk_Conductivity", conductivityFeatureRole: "Primary Sensor Signal · Direct Measure", conductivityFeatureDesc: "Measures Na⁺ and Cl⁻ ion concentration shifts in milk. Elevated electrical conductivity directly signals subclinical cell membrane permeability changes.", temperatureFeatureName: "Milk_Temperature", temperatureFeatureRole: "Secondary Sensor Signal · Co-factor", temperatureFeatureDesc: "Captures thermal variances. Combined with conductivity in the neural network, temperature helps distinguish early physiological shifts from ambient fluctuations.", vetFeedbackNote: "Model Validation: Real conductivity and temperature telemetry feed the 2-feature neural network. Clinical feedback (Confirmed / False Alarm) reinforces regional threshold accuracy.", impactTechnologyRoadmap: "Impact & Technology Roadmap", subclinicalIntelligenceEconomicProtection: "Subclinical Intelligence & Economic Protection", pitchIntro: "Pashu Mitra bridges advanced bio-sensing telemetry with rural dairy economics to eliminate silent production loss.", card1Badge: "2–4 Days Advance", card1Title: "Early Forecasting vs. Clinical Detection", card1Body: "Traditional clinical detection relies on visible symptoms (clots, udder swelling, milk drop) after tissue damage occurs. Pashu Mitra tracks subclinical ion shifts (Na⁺, Cl⁻ conductivity) and micro-thermal variances 2–4 days before physical manifestations appear.", card1Bullet1: "Detects ionic concentration shifts prior to cellular inflammation", card1Bullet2: "Enables early herbal/non-antibiotic supportive treatment", card1Bullet3: "Prevents permanent quarter tissue scarring and yield loss", card2Badge: "Smallholder Protection", card2Title: "Indian Dairy Economics & AMR Mitigation", card2Body: "80%+ of India’s milk comes from smallholders owning 2–5 cows. Undetected mastitis causes ₹6,000–₹10,000 loss per lactation cycle. Early triage protects household incomes and stops the routine over-prescription of broad-spectrum antibiotics that drive Antimicrobial Resistance (AMR).", card2Bullet1: "Saves ₹6k–₹10k per cow in treatment cost & dumped milk", card2Bullet2: "Prevents indiscriminate antibiotic overuse at the farm gate", card2Bullet3: "Safeguards cooperative milk union fat & SNF testing standards", card3Badge: "Phase 2 Roadmap", card3Title: "Hardware Prototype & Edge ML Deployment", card3Body: "Currently operating as a browser-validated predictive prototype with calibrated sensor inputs. Phase 2 transitions logic directly onto handheld probe microcontrollers and stall-cup sensors with offline BLE sync for zero-connectivity rural dairies.", card3Bullet1: "Handheld IP67 EC dip probes & automated stall cup sensors", card3Bullet2: "Microcontroller edge TinyML inference without internet", card3Bullet3: "Seamless sync with Village Dairy Cooperative Society (VDCS)" },
  hi: { weatherToday: "रविवार, 6 सितंबर 2026", weatherLocationLabel: "हसन, कर्नाटक", farmerProfile: "किसान प्रोफ़ाइल", profileSubtitle: "आपकी किसान पहचान और डेयरी का विवरण।", farmerLabel: "किसान", phoneLabel: "फ़ोन", villageLabel: "गांव", memberSinceLabel: "सदस्य बने", dairyLabel: "आपकी डेयरी", registeredDevices: "पंजीकृत उपकरण", cowsRegistered: "पंजीकृत गायें", sensorDevices: "सेंसर उपकरण", currentPreference: "वर्तमान पसंद", languageHelp: "स्टेट पिकर पूरे ऐप की भाषा बदलता है।", changeLanguage: "राज्य / भाषा बदलें", localVet: "आपके क्षेत्र के डॉक्टर", largeAnimalSpecialist: "बड़े पशुओं के विशेषज्ञ", availableToday: "आज उपलब्ध · सुबह 8 – शाम 7 बजे", shareReading: "डॉक्टर से बात करते समय रीडिंग दिखाएं।", startDemoCall: "डेमो कॉल शुरू करें", demoInteraction: "डेमो इंटरैक्शन · असली कॉल नहीं होगी", sensorConnected: "सेंसर जुड़ा है", sensorLow: "बैटरी कम", sensorStale: "सेंसर जवाब नहीं दे रहा", liveDemoFeed: "लाइव डेमो फीड", callingVet: "डॉ. मीरा राव को कॉल किया जा रहा है… (डेमो)", queuedReadings: "रीडिंग कतार में हैं — ऑनलाइन होने पर सिंक होंगी", syncedReadings: "रीडिंग सिंक हो गईं — झुंड अपडेट है", backOnline: "फिर से ऑनलाइन", offlineOn: "ऑफलाइन मोड चालू · रीडिंग इसी डिवाइस पर रहेंगी", vetConfirmedToast: "डॉक्टर की पुष्टि दर्ज हुई", falseAlarmToast: "गलत चेतावनी दर्ज हुई", farmerOverview: "किसान अवलोकन", farmTitle: "मेरा फार्म", farmSubtitle: "आज आपके झुंड की सरल तस्वीर।", cowsRegisteredStat: "पंजीकृत गायें", currentHerd: "आपका मौजूदा झुंड", sensorsConnected: "जुड़े सेंसर", sensorsNotResponding: "जवाब नहीं दे रहे", lowBattery: "बैटरी कम", watchSensors: "इन सेंसर पर ध्यान दें", herdTrend: "झुंड का रुझान", averageRisk: "औसत जोखिम स्कोर", recentCare: "हाल की देखभाल", lastResolved: "अंतिम सुलझी सूचना", noResolved: "अभी कोई मामला सुलझा नहीं", dayAgo: "दिन पहले", daysAgo: "दिन पहले", basedOnAlerts: "इस डेमो में सबसे हाल की पुष्टि या सुलझी सूचना पर आधारित।", sensorWatch: "सेंसर पर ध्यान", sensorNotRespondingPlural: "सेंसर जवाब नहीं दे रहे।", dueChecks: "जिन गायों की जांच बाकी है", dueChecksBody: "इन गायों की आज जांच नहीं हुई।", allChecked: "आज हर गाय की ताज़ा रीडिंग है।", thisWeek: "इस सप्ताह", readingsTaken: "ली गई रीडिंग", alertsRaised: "उठी सूचनाएं", alertsResolved: "सुलझी सूचनाएं", advisory: "आज की सलाह", advisoryHigh: "को आज ध्यान चाहिए।", advisoryMedium: "पर आज थोड़ा और ध्यान दें।", advisoryGood: "आपका झुंड अच्छा है — अभी किसी गाय को ध्यान की जरूरत नहीं।", quickAccess: "त्वरित पहुंच", openAlerts: "सूचनाएं खोलें", contactVet: "डॉक्टर से संपर्क", useStatePicker: "भाषा बदलने के लिए ऊपर का स्टेट पिकर इस्तेमाल करें", searchAnimals: "पशु खोजें…", close: "बंद करें", actualFeed: "आज की दूध जांच", modelRisk: "AI जोखिम मॉडल", modelRiskBody: "वास्तविक चालकता और तापमान डेटा पर प्रशिक्षित। यह निदान नहीं है — समय पर डॉक्टर से बात करने में मदद करता है।", riskScoreToday: "आज का जोखिम स्कोर", infectionProbability: "संक्रमण जोखिम की संभावना", days: "दिन", continuousHistory: "लगातार निगरानी", routineTitle: "अच्छी आदत जारी रखें", routineBody: "दिन में एक बार सुबह की रीडिंग आपके झुंड की कहानी साफ रखती है।", alertSubtitle: "हर सूचना आपको अगला सही कदम बताती है।", farmTrendNote: "कम स्कोर आमतौर पर शांत स्थिति दिखाते हैं। यह आपकी मौजूदा रीडिंग का सार है।", demoDerived: "डेमो से निकला सार · मौजूदा रीडिंग के साथ बदलता है", checkNow: "अभी जांचें", noAnimals: "कोई पशु मेल नहीं खाता", vetValidationNote: "डॉक्टर की पुष्टि अगली रीडिंग बेहतर बनाती है।", dateToday: "रविवार, 6 सितंबर 2026", selectStateLabel: "अपना राज्य चुनें", cooperativeOverview: "सहकारी अवलोकन", perFarmRiskDist: "प्रति-फार्म जोखिम वितरण", weeklyAlertTrend: "साप्ताहिक अलर्ट रुझान", sevenDayTrajectory: "7-दिवसीय प्रक्षेपवक्र", hassanCoopDesk: "हसन जिला डेयरी संघ · मार्ग 4 सहकारी डेस्क", registeredFarms: "पंजीकृत फार्म", activeAnimals: "सक्रिय मवेशी", telemetrySyncRate: "टेलीमेट्री सिंक दर", subclinicalFlags: "सबक्लिनिकल झंडे", highRisk: "उच्च जोखिम", medRisk: "मध्यम जोखिम", allLowRisk: "सभी कम जोखिम", normalRisk: "सामान्य", weeklyTrendChange: "-28% पिछले सप्ताह की तुलना में", explainableAi: "व्याख्या योग्य एआई", featureTransparencyPanel: "विशेषता पारदर्शिता पैनल", transparencyIntro: "सबक्लिनिकल जोखिम पूर्वानुमान वास्तविक चालकता और तापमान डेटा पर प्रशिक्षित न्यूरल नेटवर्क मॉडल द्वारा उत्पन्न होते हैं। दोनों इनपुट जोखिम का आकलन करने में योगदान करते हैं।", conductivityFeatureName: "Milk_Conductivity (दूध की चालकता)", conductivityFeatureRole: "प्राथमिक सेंसर संकेत · प्रत्यक्ष माप", conductivityFeatureDesc: "दूध में Na⁺ और Cl⁻ आयन सांद्रता में बदलाव को मापता है। बढ़ी हुई विद्युत चालकता सीधे सबक्लिनिकल कोशिका झिल्ली परिवर्तन का संकेत देती है।", temperatureFeatureName: "Milk_Temperature (दूध का तापमान)", temperatureFeatureRole: "द्वितीयक सेंसर संकेत · सह-कारक", temperatureFeatureDesc: "तापमान भिन्नता को पकड़ता है। न्यूरल नेटवर्क में चालकता के साथ मिलकर, यह सामान्य उतार-चढ़ाव से शुरुआती बदलावों को अलग करने में मदद करता है।", vetFeedbackNote: "मॉडल सत्यापन: वास्तविक चालकता और तापमान डेटा 2-विशेषता न्यूरल नेटवर्क को फीड करता है। नैदानिक प्रतिक्रिया क्षेत्रीय सीमा सटीकता को मजबूत करती है।", impactTechnologyRoadmap: "प्रभाव और प्रौद्योगिकी रोडमैप", subclinicalIntelligenceEconomicProtection: "सबक्लिनिकल इंटेलिजेंस और आर्थिक सुरक्षा", pitchIntro: "पशु-मित्र मवेशियों के स्वास्थ्य की समय पर चेतावनी देकर नुकसान को रोकता है।", card1Badge: "2-4 दिन पहले चेतावनी", card1Title: "प्रारंभिक पूर्वानुमान बनाम नैदानिक पहचान", card1Body: "पारंपरिक नैदानिक पहचान शारीरिक लक्षण दिखने के बाद होती है। पशु-मित्र लक्षण दिखने से 2-4 दिन पहले आयनिक बदलावों और तापमान में सूक्ष्म परिवर्तन को ट्रैक करता है।", card1Bullet1: "कोशिका सूजन से पहले आयनिक सांद्रता में बदलाव का पता लगाता है", card1Bullet2: "शुरुआती हर्बल/गैर-एंटीबायोटिक उपचार को सक्षम बनाता है", card1Bullet3: "स्थायी ऊतक क्षति और दूध हानि को रोकता है", card2Badge: "छोटे किसानों की सुरक्षा", card2Title: "भारतीय डेयरी अर्थशास्त्र और एएमआर शमन", card2Body: "भारत का 80%+ दूध छोटे किसानों से आता है। बीमारी का सही समय पर पता लगाने से किसानों की आय सुरक्षित होती है और एंटीबायोटिक दवाओं के अत्यधिक उपयोग को रोका जाता है।", card2Bullet1: "उपचार लागत और दूध के नुकसान में प्रति गाय ₹6k–₹10k बचाता है", card2Bullet2: "अंधाधुंध एंटीबायोटिक उपयोग को रोकता है", card2Bullet3: "सहकारी दूध गुणवत्ता मानकों की रक्षा करता है", card3Badge: "चरण 2 रोडमैप", card3Title: "हार्डवेयर प्रोटोटाइप और एज एमएल परिनियोजन", card3Body: "वर्तमान में ब्राउज़र-सत्यापित मॉडल के रूप में कार्य कर रहा है। चरण 2 में यह तकनीक सीधे हैंडहेल्ड डिवाइस पर काम करेगी।", card3Bullet1: "हैंडहेल्ड ईसी प्रोब और स्वचालित सेंसर", card3Bullet2: "बिना इंटरनेट के माइक्रोकंट्रोलर एज पर अनुमान", card3Bullet3: "डेयरी सहकारी समितियों के साथ निर्बाध सिंक" },
  mr: { weatherToday: "रविवार, ६ सप्टेंबर २०२६", weatherLocationLabel: "हसन, कर्नाटक", farmerProfile: "शेतकरी प्रोफाइल", profileSubtitle: "तुमची शेतकरी ओळख आणि डेअरीची माहिती.", farmerLabel: "शेतकरी", phoneLabel: "फोन", villageLabel: "गाव", memberSinceLabel: "सदस्यत्व", dairyLabel: "तुमची डेअरी", registeredDevices: "नोंदणीकृत उपकरणे", cowsRegistered: "नोंदणीकृत गायी", sensorDevices: "सेन्सर उपकरणे", currentPreference: "सध्याची पसंती", languageHelp: "स्टेट पिकरमधून संपूर्ण अॅपची भाषा बदलते.", changeLanguage: "राज्य / भाषा बदला", localVet: "तुमच्या भागातील पशुवैद्य", largeAnimalSpecialist: "मोठ्या प्राण्यांचे तज्ज्ञ", availableToday: "आज उपलब्ध · सकाळी ८ – संध्याकाळी ७", shareReading: "पशुवैद्याशी बोलताना रीडिंग दाखवा.", startDemoCall: "डेमो कॉल सुरू करा", demoInteraction: "डेमो संवाद · प्रत्यक्ष कॉल होणार नाही", sensorConnected: "सेन्सर जोडलेला", sensorLow: "बॅटरी कमी", sensorStale: "सेन्सर प्रतिसाद देत नाही", liveDemoFeed: "लाइव्ह डेमो फीड", callingVet: "डॉ. मीरा राव यांना कॉल केला जात आहे… (डेमो)", queuedReadings: "रीडिंग रांगेत आहेत — ऑनलाइन झाल्यावर सिंक होतील", syncedReadings: "रीडिंग सिंक झाली — कळप अद्ययावत आहे", backOnline: "पुन्हा ऑनलाइन", offlineOn: "ऑफलाइन मोड सुरू · रीडिंग या डिव्हाइसवर राहतील", vetConfirmedToast: "पशुवैद्याची पुष्टी नोंदली", falseAlarmToast: "चुकीची सूचना नोंदली", farmerOverview: "शेतकरी आढावा", farmTitle: "माझे फार्म", farmSubtitle: "आजच्या कळपाचे सोपे चित्र.", cowsRegisteredStat: "नोंदणीकृत गायी", currentHerd: "तुमचा सध्याचा कळप", sensorsConnected: "जोडलेले सेन्सर", sensorsNotResponding: "प्रतिसाद नाही", lowBattery: "बॅटरी कमी", watchSensors: "या सेन्सरकडे लक्ष द्या", herdTrend: "कळपाचा कल", averageRisk: "सरासरी धोका", recentCare: "अलीकडची काळजी", lastResolved: "शेवटची सोडवलेली सूचना", noResolved: "अजून सोडवलेले प्रकरण नाही", dayAgo: "दिवसापूर्वी", daysAgo: "दिवसांपूर्वी", basedOnAlerts: "या डेमोतील सर्वात अलीकडच्या पुष्टी किंवा सोडवलेल्या सूचनेवर आधारित.", sensorWatch: "सेन्सर निरीक्षण", sensorNotRespondingPlural: "सेन्सर प्रतिसाद देत नाहीत.", dueChecks: "तपासणी बाकी असलेल्या गायी", dueChecksBody: "आज या गायींची तपासणी झालेली नाही.", allChecked: "आज प्रत्येक गायीचे ताजे रीडिंग आहे.", thisWeek: "या आठवड्यात", readingsTaken: "घेतलेली रीडिंग", alertsRaised: "आलेल्या सूचना", alertsResolved: "सोडवलेल्या सूचना", advisory: "आजचा सल्ला", advisoryHigh: "आज लक्ष देणे आवश्यक आहे.", advisoryMedium: "आज थोडे अधिक लक्ष द्या.", advisoryGood: "तुमचा कळप चांगला आहे — सध्या कोणत्याही गायीला लक्षाची गरज नाही.", quickAccess: "जलद प्रवेश", openAlerts: "सूचना उघडा", contactVet: "पशुवैद्याशी संपर्क", useStatePicker: "भाषा बदलण्यासाठी वरचा स्टेट पिकर वापरा", searchAnimals: "प्राणी शोधा…", close: "बंद करा", actualFeed: "आजची दूध तपासणी", modelRisk: "AI धोका मॉडेल", modelRiskBody: "खऱ्या चालकता आणि तापमान डेटावर प्रशिक्षित. हे निदान नाही — योग्य वेळी पशुवैद्याशी बोलण्यास मदत करते.", riskScoreToday: "आजचा धोका स्कोअर", infectionProbability: "संसर्ग धोक्याची शक्यता", days: "दिवस", continuousHistory: "सतत निरीक्षण", routineTitle: "चांगली सवय सुरू ठेवा", routineBody: "दररोज सकाळचे एक रीडिंग कळपाची स्थिती स्पष्ट ठेवते.", alertSubtitle: "प्रत्येक सूचना पुढचे योग्य पाऊल सांगते.", farmTrendNote: "कमी स्कोअर साधारणपणे शांत स्थिती दाखवतात. हा तुमच्या सध्याच्या रीडिंगचा आढावा आहे.", demoDerived: "डेमोमधून तयार केलेला सारांश · सध्याच्या रीडिंगनुसार बदलतो", checkNow: "आता तपासा", noAnimals: "कोणताही प्राणी जुळला नाही", vetValidationNote: "पशुवैद्याची पुष्टी पुढील रीडिंग सुधारते.", dateToday: "रविवार, ६ सप्टेंबर २०२६" },
  gu: {
    weatherToday: "રવિવાર, 6 સપ્ટેમ્બર 2026", weatherLocationLabel: "હસન, કર્ણાટક", farmerProfile: "ખેડૂત પ્રોફાઇલ", profileSubtitle: "તમારી ખેડૂત ઓળખ અને ડેરીની વિગતો.", farmerLabel: "ખેડૂત", phoneLabel: "ફોન", villageLabel: "ગામ", memberSinceLabel: "સભ્ય બન્યા", dairyLabel: "તમારી ડેરી", registeredDevices: "નોંધાયેલા ઉપકરણો", cowsRegistered: "નોંધાયેલી ગાયો", sensorDevices: "સેન્સર ઉપકરણો", currentPreference: "વર્તમાન પસંદગી", languageHelp: "સ્ટેટ પિકરથી આખી એપની ભાષા બદલાય છે.", changeLanguage: "રાજ્ય / ભાષા બદલો", localVet: "તમારા વિસ્તારના પશુચિકિત્સક", largeAnimalSpecialist: "મોટા પ્રાણીઓના નિષ્ણાત", availableToday: "આજે ઉપલબ્ધ · સવારે 8 – સાંજે 7", shareReading: "પશુચિકિત્સક સાથે વાત કરતી વખતે રીડિંગ બતાવો.", startDemoCall: "ડેમો કૉલ શરૂ કરો", demoInteraction: "ડેમો ક્રિયાપ્રતિક્રિયા · કોઈ વાસ્તવિક કૉલ કરવામાં આવશે નહીં", sensorConnected: "સેન્સર જોડાયેલો", sensorLow: "બેટરી ઓછી", sensorStale: "સેન્સર જવાબ આપતું નથી", liveDemoFeed: "લાઇવ ડેમો ફીડ", callingVet: "ડૉ. મીરા રાવને કૉલ કરી રહ્યા છીએ… (ડેમો)", queuedReadings: "રીડિંગ્સ કતારમાં છે — ઑનલાઇન થવા પર સિંક થશે", syncedReadings: "કતારબદ્ધ રીડિંગ્સ સિંક થઈ — ટોળું અપડેટ છે", backOnline: "ફરી ઑનલાઇન", offlineOn: "ઑફલાઇન મોડ ચાલુ — રીડિંગ્સ આ ઉપકરણ પર રહેશે", vetConfirmedToast: "પશુચિકિત્સકની પુષ્ટિ નોંધાઈ", falseAlarmToast: "ખોટી ચેતવણી તરીકે દર્જ કરી", farmerOverview: "ખેડૂત અવલોકન", farmTitle: "મારું ફાર્મ", farmSubtitle: "આજે તમારા ટોળાની સરળ તસવીર.", cowsRegisteredStat: "નોંધાયેલી ગાયો", currentHerd: "તમારું વર્તમાન ટોળું", sensorsConnected: "જોડાયેલા સેન્સર", sensorsNotResponding: "જવાબ આપતા નથી", lowBattery: "બેટરી ઓછી", watchSensors: "આ સેન્સર પર ધ્યાન આપો", herdTrend: "ટોળાનો ટ્રેન્ડ", averageRisk: "સરેરાશ જોખમ સ્કોર", recentCare: "તાજેતરની સંભાળ", lastResolved: "છેલ્લી ઉકેલાયેલી સૂચના", noResolved: "હજુ કોઈ કેસ ઉકેલાયો નથી", dayAgo: "દિવસ પહેલાં", daysAgo: "દિવસ પહેલાં", basedOnAlerts: "આ ડેમોમાં સૌથી તાજેતરની પુષ્ટિ થયેલી અથવા ઉકેલાયેલી સૂચના પર આધારિત.", sensorWatch: "સેન્સર ધ્યાન", sensorNotRespondingPlural: "સેન્સર જવાબ આપતા નથી.", dueChecks: "તપાસ બાકી ગાયો", dueChecksBody: "આ ગાયોની આજે તપાસ થઈ નથી.", allChecked: "આજે દરેક ગાયનું તાજું રીડિંગ છે.", thisWeek: "આ અઠવાડિયે", readingsTaken: "લેવામાં આવેલા રીડિંગ", alertsRaised: "ઊભી થયેલી સૂચનાઓ", alertsResolved: "ઉકેલાયેલી સૂચનાઓ", advisory: "આજની સલાહ", advisoryHigh: "આજે ધ્યાન જરૂરી છે.", advisoryMedium: "આજે થોડું વધુ ધ્યાન જોઈએ.", advisoryGood: "તમારું ટોળું સારું છે — અત્યારે કોઈ ગાયને ધ્યાનની જરૂર નથી.", quickAccess: "ઝડપી ઍક્સેસ", openAlerts: "સૂચનાઓ ખોલો", contactVet: "પશુચિકિત્સકનો સંપર્ક", useStatePicker: "ભાષા બદલવા ઉપરનો સ્ટેટ પિકર વાપરો", searchAnimals: "પ્રાણીઓ શોધો…", close: "બંધ કરો", actualFeed: "આજની દૂધ તપાસ", modelRisk: "AI જોખમ મોડેલ", modelRiskBody: "વાસ્તવિક વાહકતા અને તાપમાન ડેટા પર તાલીમ પામેલ. આ નિદાન નથી — તે તમને યોગ્ય સમયે પશુચિકિત્સક સાથે વાત કરવામાં મદદ કરે છે.", riskScoreToday: "આજનો જોખમ સ્કોર", infectionProbability: "ચેપ જોખમની સંભાવના", days: "દિવસ", continuousHistory: "સતત ઇતિહાસ", routineTitle: "સારી ટેવ ચાલુ રાખો", routineBody: "દિવસે એક વાર સવારનું રીડિંગ તમારા ટોળાની સ્થિતિ સ્પષ્ટ રાખે છે.", alertSubtitle: "દરેક સૂચના તમને આગામી સ્પષ્ટ પગલું આપે છે.", farmTrendNote: "ઓછા સ્કોર સામાન્ય રીતે શાંત સ્થિતિ બતાવે છે. આ તમારા હાલના રીડિંગનો સાર છે.", demoDerived: "ડેમો પરથી મેળવેલ સારાઉંશ · વર્તમાન રીડિંગ સાથે અપડેટ થાય છે", checkNow: "હમણાં તપાસો", noAnimals: "કોઈ પ્રાણી મળ્યું નથી", vetValidationNote: "પશુચિકિત્સકની પુષ્ટિ આગામી રીડિંગ સુધારે છે.", dateToday: "રવિવાર, 6 સપ્ટેમ્બર 2026"
  },
  pa: {
    weatherToday: "ਐਤਵਾਰ, 6 ਸਤੰਬਰ 2026", weatherLocationLabel: "ਹਾਸਨ, ਕਰਨਾਟਕ", farmerProfile: "ਕਿਸਾਨ ਪ੍ਰੋਫਾਈਲ", profileSubtitle: "ਤੁਹਾਡੀ ਕਿਸਾਨ ਪਛਾਣ ਅਤੇ ਡੇਅਰੀ ਦੀ ਜਾਣਕਾਰੀ।", farmerLabel: "ਕਿਸਾਨ", phoneLabel: "ਫੋਨ", villageLabel: "ਪਿੰਡ", memberSinceLabel: "ਮੈਂਬਰ ਬਣੇ", dairyLabel: "ਤੁਹਾਡੀ ਡੇਅਰੀ", registeredDevices: "ਰਜਿਸਟਰ ਕੀਤੇ ਉਪਕਰਨ", cowsRegistered: "ਰਜਿਸਟਰ ਗਾਵਾਂ", sensorDevices: "ਸੈਂਸਰ ਉਪਕਰਨ", currentPreference: "ਮੌਜੂਦਾ ਪਸੰਦ", languageHelp: "ਸਟੇਟ ਪਿਕਰ ਨਾਲ ਪੂਰੇ ਐਪ ਦੀ ਭਾਸ਼ਾ ਬਦਲਦੀ ਹੈ।", changeLanguage: "ਰਾਜ / ਭਾਸ਼ਾ ਬਦਲੋ", localVet: "ਤੁਹਾਡੇ ਇਲਾਕੇ ਦੇ ਪਸ਼ੂ ਡਾਕਟਰ", largeAnimalSpecialist: "ਵੱਡੇ ਪਸ਼ੂਆਂ ਦੇ ਮਾਹਿਰ", availableToday: "ਅੱਜ ਉਪਲਬਧ · ਸਵੇਰੇ 8 – ਸ਼ਾਮ 7", shareReading: "ਪਸ਼ੂ ਡਾਕਟਰ ਨਾਲ ਗੱਲ ਕਰਦੇ ਸਮੇਂ ਰੀਡਿੰਗ ਦਿਖਾਓ।", startDemoCall: "ਡੈਮੋ ਕਾਲ ਸ਼ੁਰੂ ਕਰੋ", demoInteraction: "ਡੈਮੋ ਗੱਲਬਾਤ · ਕੋਈ ਅਸਲੀ ਕਾਲ ਨਹੀਂ ਹੋਵੇਗੀ", sensorConnected: "ਸੈਂਸਰ ਜੁੜਿਆ", sensorLow: "ਬੈਟਰੀ ਘੱਟ", sensorStale: "ਸੈਂਸਰ ਜਵਾਬ ਨਹੀਂ ਦੇ ਰਿਹਾ", liveDemoFeed: "ਲਾਈਵ ਡੈਮੋ ਫੀਡ", callingVet: "ਡਾ. ਮੀਰਾ ਰਾਵ ਨੂੰ ਕਾਲ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ… (ਡੈਮੋ)", queuedReadings: "ਰੀਡਿੰਗਾਂ ਕਤਾਰ ਵਿੱਚ ਹਨ — ਆਨਲਾਈਨ ਹੋਣ ਤੇ ਸਿੰਕ ਹੋਣਗੀਆਂ", syncedReadings: "ਕਤਾਰਬੱਧ ਰੀਡਿੰਗਾਂ ਸਿੰਕ ਹੋ ਗਈਆਂ — ਝੁੰਡ ਅੱਪਡੇਟ ਹੈ", backOnline: "ਦੁਬਾਰਾ ਆਨਲਾਈਨ", offlineOn: "ਆਫਲਾਈਨ ਮੋਡ ਚਾਲੂ — ਰੀਡਿੰਗਾਂ ਇਸ ਡਿਵਾਈਸ ਤੇ ਰਹਿਣਗੀਆਂ", vetConfirmedToast: "ਪਸ਼ੂ ਡਾਕਟਰ ਦੀ ਪੁਸ਼ਟੀ ਦਰਜ ਹੋਈ", falseAlarmToast: "ਗਲਤ ਚੇਤਾਵਨੀ ਦਰਜ ਕੀਤੀ", farmerOverview: "ਕਿਸਾਨ ਜਾਇਜ਼ਾ", farmTitle: "ਮੇਰਾ ਫਾਰਮ", farmSubtitle: "ਅੱਜ ਤੁਹਾਡੇ ਝੁੰਡ ਦੀ ਸਧਾਰਨ ਤਸਵੀਰ।", cowsRegisteredStat: "ਰਜਿਸਟਰ ਗਾਵਾਂ", currentHerd: "ਤੁਹਾਡਾ ਮੌਜੂਦਾ ਝੁੰਡ", sensorsConnected: "ਜੁੜੇ ਸੈਂਸਰ", sensorsNotResponding: "ਜਵਾਬ ਨਹੀਂ ਦੇ ਰਹੇ", lowBattery: "ਬੈਟਰੀ ਘੱਟ", watchSensors: "ਇਨ੍ਹਾਂ ਸੈਂਸਰਾਂ ਤੇ ਧਿਆਨ ਦਿਓ", herdTrend: "ਝੁੰਡ ਦਾ ਰੁਝਾਨ", averageRisk: "ਔਸਤ ਖਤਰਾ ਸਕੋਰ", recentCare: "ਹਾਲ ਦੀ ਦੇਖਭਾਲ", lastResolved: "ਆਖਰੀ ਹੱਲ ਹੋਈ ਸੂਚਨਾ", noResolved: "ਅਜੇ ਕੋਈ ਕੇਸ ਹੱਲ ਨਹੀਂ ਹੋਇਆ", dayAgo: "ਦਿਨ ਪਹਿਲਾਂ", daysAgo: "ਦਿਨ ਪਹਿਲਾਂ", basedOnAlerts: "ਇਸ ਡੈਮੋ ਦੀ ਸਭ ਤੋਂ ਤਾਜ਼ਾ ਪੁਸ਼ਟੀ ਜਾਂ ਹੱਲ ਹੋਈ ਸੂਚਨਾ ਤੇ ਆਧਾਰਿਤ।", sensorWatch: "ਸੈਂਸਰ ਧਿਆਨ", sensorNotRespondingPlural: "ਸੈਂਸਰ ਜਵਾਬ ਨਹੀਂ ਦੇ ਰਹੇ।", dueChecks: "ਜਿਨ੍ਹਾਂ ਗਾਵਾਂ ਦੀ ਜਾਂਚ ਬਾਕੀ ਹੈ", dueChecksBody: "ਅੱਜ ਇਨ੍ਹਾਂ ਗਾਵਾਂ ਦੀ ਜਾਂਚ ਨਹੀਂ ਹੋਈ।", allChecked: "ਅੱਜ ਹਰ ਗਾਂ ਦੀ ਤਾਜ਼ਾ ਰੀਡਿੰਗ ਹੈ।", thisWeek: "ਇਸ ਹਫ਼ਤੇ", readingsTaken: "ਲਈਆਂ ਰੀਡਿੰਗਾਂ", alertsRaised: "ਉੱਠੀਆਂ ਸੂਚਨਾਵਾਂ", alertsResolved: "ਹੱਲ ਹੋਈਆਂ ਸੂਚਨਾਵਾਂ", advisory: "ਅੱਜ ਦੀ ਸਲਾਹ", advisoryHigh: "ਨੂੰ ਅੱਜ ਧਿਆਨ ਦੀ ਲੋੜ ਹੈ।", advisoryMedium: "ਤੇ ਅੱਜ ਥੋੜ੍ਹਾ ਹੋਰ ਧਿਆਨ ਦਿਓ।", advisoryGood: "ਤੁਹਾਡਾ ਝੁੰਡ ਚੰਗਾ ਹੈ — ਹੁਣ ਕਿਸੇ ਗਾਂ ਨੂੰ ਧਿਆਨ ਦੀ ਲੋੜ ਨਹੀਂ।", quickAccess: "ਤੁਰੰਤ ਪਹੁੰਚ", openAlerts: "ਸੂਚਨਾਵਾਂ ਖੋਲ੍ਹੋ", contactVet: "ਪਸ਼ੂ ਡਾਕਟਰ ਨਾਲ ਸੰਪਰਕ", useStatePicker: "ਭਾਸ਼ਾ ਬਦਲਣ ਲਈ ਉੱਪਰਲਾ ਸਟੇਟ ਪਿਕਰ ਵਰਤੋ", searchAnimals: "ਜਾਨਵਰ ਖੋਜੋ…", close: "ਬੰਦ ਕਰੋ", actualFeed: "ਅੱਜ ਦੀ ਦੁੱਧ ਜਾਂਚ", modelRisk: "AI ਖਤਰਾ ਮਾਡਲ", modelRiskBody: "ਅਸਲੀ ਚਾਲਕਤਾ ਅਤੇ ਤਾਪਮਾਨ ਡਾਟਾ ਤੇ ਸਿਖਲਾਈ ਪ੍ਰਾਪਤ। ਇਹ ਨਿਦਾਨ ਨਹੀਂ ਹੈ — ਇਹ ਸਹੀ ਸਮੇਂ ਤੇ ਪਸ਼ੂ ਡਾਕਟਰ ਨਾਲ ਗੱਲ ਕਰਨ ਵਿੱਚ ਮਦਦ ਕਰਦਾ ਹੈ।", riskScoreToday: "ਅੱਜ ਦਾ ਖਤਰਾ ਸਕੋਰ", infectionProbability: "ਇਨਫੈਕਸ਼ਨ ਖਤਰੇ ਦੀ ਸੰਭਾਵਨਾ", days: "ਦਿਨ", continuousHistory: "ਨਿਰੰਤਰ ਇਤਿਹਾਸ", routineTitle: "ਚੰਗੀ ਆਦਤ ਜਾਰੀ ਰੱਖੋ", routineBody: "ਦਿਨ ਵਿੱਚ ਇੱਕ ਵਾਰ ਸਵੇਰ ਦੀ ਰੀਡਿੰਗ ਤੁਹਾਡੇ ਝੁੰਡ ਦੀ ਸਥਿਤੀ ਸਾਫ਼ ਰੱਖਦੀ ਹੈ।", alertSubtitle: "ਹਰ ਸੂਚਨਾ ਤੁਹਾਨੂੰ ਅਗਲਾ ਸਪਸ਼ਟ ਕਦਮ ਦੱਸਦੀ ਹੈ।", farmTrendNote: "ਘੱਟ ਸਕੋਰ ਆਮ ਤੌਰ ਤੇ ਸ਼ਾਂਤ ਹਾਲਤ ਦਿਖਾਉਂਦੇ ਹਨ। ਇਹ ਮੌਜੂਦਾ ਰੀਡਿੰਗਾਂ ਦਾ ਸਾਰ ਹੈ।", demoDerived: "ਡੈਮੋ ਤੋਂ ਨਿਕਲਿਆ ਸਾਰ · ਮੌਜੂਦਾ ਰੀਡਿੰਗਾਂ ਨਾਲ ਅੱਪਡੇਟ ਹੁੰਦਾ ਹੈ", checkNow: "ਹੁਣੇ ਜਾਂਚੋ", noAnimals: "ਕੋਈ ਜਾਨਵਰ ਨਹੀਂ ਮਿਲਿਆ", vetValidationNote: "ਪਸ਼ੂ ਡਾਕਟਰ ਦੀ ਪੁਸ਼ਟੀ ਅਗਲੀ ਰੀਡਿੰਗ ਸੁਧਾਰਦੀ ਹੈ।", dateToday: "ਐਤਵਾਰ, 6 ਸਤੰਬਰ 2026"
  },
  kn: {
    weatherToday: "ಭಾನುವಾರ, 6 ಸೆಪ್ಟೆಂಬರ್ 2026", weatherLocationLabel: "ಹಾಸನ, ಕರ್ನಾಟಕ", farmerProfile: "ರೈತ ಪ್ರೊಫೈಲ್", profileSubtitle: "ನಿಮ್ಮ ರೈತ ಗುರುತು ಮತ್ತು ಡೇರಿಯ ವಿವರಗಳು.", farmerLabel: "ರೈತ", phoneLabel: "ದೂರವಾಣಿ", villageLabel: "ಹಳ್ಳಿ", memberSinceLabel: "ಸದಸ್ಯರಾದ ದಿನ", dairyLabel: "ನಿಮ್ಮ ಡೇರಿ", registeredDevices: "ನೋಂದಾಯಿತ ಸಾಧನಗಳು", cowsRegistered: "ನೋಂದಾಯಿತ ಹಸುಗಳು", sensorDevices: "ಸೆನ್ಸರ್ ಸಾಧನಗಳು", currentPreference: "ಪ್ರಸ್ತುತ ಆಯ್ಕೆ", languageHelp: "ಸ್ಟೇಟ್ ಪಿಕರ್ ಇಡೀ ಆ್ಯಪ್‌ನ ಭಾಷೆಯನ್ನು ಬದಲಿಸುತ್ತದೆ.", changeLanguage: "ರಾಜ್ಯ / ಭಾಷೆ ಬದಲಿಸಿ", localVet: "ನಿಮ್ಮ ಸ್ಥಳೀಯ ಪಶುವೈದ್ಯರು", largeAnimalSpecialist: "ದೊಡ್ಡ ಪ್ರಾಣಿಗಳ ತಜ್ಞರು", availableToday: "ಇಂದು ಲಭ್ಯ · ಬೆಳಗ್ಗೆ 8 – ಸಂಜೆ 7", shareReading: "ಪಶುವೈದ್ಯರೊಂದಿಗೆ ಮಾತನಾಡುವಾಗ ರೀಡಿಂಗ್ ತೋರಿಸಿ.", startDemoCall: "ಡೆಮೋ ಕರೆ ಪ್ರಾರಂಭಿಸಿ", demoInteraction: "ಡೆಮೋ ಸಂವಹನ · ಯಾವುದೇ ನೈಜ ಕರೆ ಇರುವುದಿಲ್ಲ", sensorConnected: "ಸೆನ್ಸರ್ ಸಂಪರ್ಕಗೊಂಡಿದೆ", sensorLow: "ಬ್ಯಾಟರಿ ಕಡಿಮೆ", sensorStale: "ಸೆನ್ಸರ್ ಪ್ರತಿಕ್ರಿಯಿಸುತ್ತಿಲ್ಲ", liveDemoFeed: "ಲೈವ್ ಡೆಮೋ ಫೀಡ್", callingVet: "ಡಾ. ಮೀರಾ ರಾವ್ ಅವರಿಗೆ ಕರೆ ಮಾಡಲಾಗುತ್ತಿದೆ… (ಡೆಮೋ)", queuedReadings: "ರೀಡಿಂಗ್‌ಗಳು ಸಾಲಿನಲ್ಲಿವೆ — ಆನ್‌ಲೈನ್ ಬಂದಾಗ ಸಿಂಕ್ ಆಗುತ್ತವೆ", syncedReadings: "ಸಾಲಿನ ರೀಡಿಂಗ್‌ಗಳು ಸಿಂಕ್ ಆಗಿವೆ — ಹಿಂಡು ಅಪ್‌ಡೇಟ್ ಆಗಿದೆ", backOnline: "ಮತ್ತೆ ಆನ್‌ಲೈನ್", offlineOn: "ಆಫ್‌ಲೈನ್ ಮೋಡ್ ಆನ್ — ರೀಡಿಂಗ್‌ಗಳು ಈ ಸಾಧನದಲ್ಲಿರುತ್ತವೆ", vetConfirmedToast: "ಪಶುವೈದ್ಯರ ದೃಢೀಕರಣ ದಾಖಲಾಗಿದೆ", falseAlarmToast: "ಸುಳ್ಳು ಎಚ್ಚರಿಕೆ ಎಂದು ನಮೂದಿಸಲಾಗಿದೆ", farmerOverview: "ರೈತ ಅವಲೋಕನ", farmTitle: "ನನ್ನ ಫಾರ್ಮ್", farmSubtitle: "ಇಂದು ನಿಮ್ಮ ಹಿಂಡಿನ ಸರಳ ಚಿತ್ರ.", cowsRegisteredStat: "ನೋಂದಾಯಿತ ಹಸುಗಳು", currentHerd: "ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಹಿಂಡು", sensorsConnected: "ಸಂಪರ್ಕಿತ ಸೆನ್ಸರ್‌ಗಳು", sensorsNotResponding: "ಪ್ರತಿಕ್ರಿಯಿಸುತ್ತಿಲ್ಲ", lowBattery: "ಬ್ಯಾಟರಿ ಕಡಿಮೆ", watchSensors: "ಈ ಸೆನ್ಸರ್‌ಗಳನ್ನು ಗಮನಿಸಿ", herdTrend: "ಹಿಂಡಿನ ಪ್ರವೃತ್ತಿ", averageRisk: "ಸರಾಸರಿ ಅಪಾಯ ಸ್ಕೋರ್", recentCare: "ಇತ್ತೀಚಿನ ಆರೈಕೆ", lastResolved: "ಕೊನೆಯ ಪರಿಹಾರವಾದ ಎಚ್ಚರಿಕೆ", noResolved: "ಇನ್ನೂ ಪರಿಹಾರವಾದ ಪ್ರಕರಣವಿಲ್ಲ", dayAgo: "ದಿನದ ಹಿಂದೆ", daysAgo: "ದಿನಗಳ ಹಿಂದೆ", basedOnAlerts: "ಈ ಡೆಮೋದ ಇತ್ತೀಚಿನ ದೃಢೀಕರಿಸಿದ ಅಥವಾ ಪರಿಹಾರವಾದ ಎಚ್ಚರಿಕೆಯನ್ನು ಆಧರಿಸಿದೆ.", sensorWatch: "ಸೆನ್ಸರ್ ಗಮನ", sensorNotRespondingPlural: "ಸೆನ್ಸರ್‌ಗಳು ಪ್ರತಿಕ್ರಿಯಿಸುತ್ತಿಲ್ಲ.", dueChecks: "ಪರೀಕ್ಷೆ ಬಾಕಿ ಇರುವ ಹಸುಗಳು", dueChecksBody: "ಈ ಹಸುಗಳನ್ನು ಇಂದು ಪರೀಕ್ಷಿಸಲಾಗಿಲ್ಲ.", allChecked: "ಇಂದು ಪ್ರತಿಯೊಂದು ಹಸುವಿಗೂ ಹೊಸ ರೀಡಿಂಗ್ ಇದೆ.", thisWeek: "ಈ ವಾರ", readingsTaken: "ತೆಗೆದ ರೀಡಿಂಗ್‌ಗಳು", alertsRaised: "ಎದ್ದ ಎಚ್ಚರಿಕೆಗಳು", alertsResolved: "ಪರಿಹಾರವಾದ ಎಚ್ಚರಿಕೆಗಳು", advisory: "ಇಂದಿನ ಸಲಹೆ", advisoryHigh: "ಗೆ ಇಂದು ಗಮನ ಬೇಕು.", advisoryMedium: "ಇಂದು ಸ್ವಲ್ಪ ಹೆಚ್ಚು ಗಮನ ಬೇಕು.", advisoryGood: "ನಿಮ್ಮ ಹಿಂಡು ಚೆನ್ನಾಗಿದೆ — ಈಗ ಯಾವುದೇ ಹಸುವಿಗೆ ವಿಶೇಷ ಗಮನ ಬೇಕಿಲ್ಲ.", quickAccess: "ತ್ವರಿತ ಪ್ರವೇಶ", openAlerts: "ಎಚ್ಚರಿಕೆ ತೆರೆಯಿರಿ", contactVet: "ಪಶುವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ", useStatePicker: "ಭಾಷೆ ಬದಲಿಸಲು ಮೇಲಿನ ಸ್ಟೇಟ್ ಪಿಕರ್ ಬಳಸಿ", searchAnimals: "ಪ್ರಾಣಿಗಳನ್ನು ಹುಡುಕಿ…", close: "ಮುಚ್ಚಿ", actualFeed: "ಇಂದಿನ ಹಾಲಿನ ತಪಾಸಣೆ", modelRisk: "AI ಅಪಾಯದ ಮಾದರಿ", modelRiskBody: "ನೈಜ ವಾಹಕತೆ ಮತ್ತು ತಾಪಮಾನ ಡೇಟಾದ ಮೇಲೆ ತರಬೇತಿ ನೀಡಲಾಗಿದೆ. ಇದು ರೋಗನಿರ್ಣಯವಲ್ಲ — ಸೂಕ್ತ ಸಮಯದಲ್ಲಿ ಪಶುವೈದ್ಯರೊಂದಿಗೆ ಮಾತನಾಡಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.", riskScoreToday: "ಇಂದಿನ ಅಪಾಯ ಸ್ಕೋರ್", infectionProbability: "ಸಂಕ್ರಮಣ ಅಪಾಯದ ಸಾಧ್ಯತೆ", days: "ದಿನಗಳು", continuousHistory: "ನಿರಂತರ ಇತಿಹಾಸ", routineTitle: "ಒಳ್ಳೆಯ ಅಭ್ಯಾಸ ಮುಂದುವರಿಸಿ", routineBody: "ದಿನಕ್ಕೆ ಒಮ್ಮೆ ಬೆಳಗಿನ ರೀಡಿಂಗ್ ನಿಮ್ಮ ಹಿಂಡಿನ ಸ್ಥಿತಿಯನ್ನು ಸ್ಪಷ್ಟವಾಗಿಡುತ್ತದೆ.", alertSubtitle: "ಪ್ರತಿಯೊಂದು ಎಚ್ಚರಿಕೆಯು ನಿಮಗೆ ಮುಂದಿನ ಸ್ಪಷ್ಟ ಹೆಜ್ಜೆಯನ್ನು ನೀಡುತ್ತದೆ.", farmTrendNote: "ಕಡಿಮೆ ಸ್ಕೋರ್‌ಗಳು ಸಾಮಾನ್ಯವಾಗಿ ಶಾಂತ ಸ್ಥಿತಿಯನ್ನು ತೋರಿಸುತ್ತವೆ. ಇದು ನಿಮ್ಮ ಇತ್ತೀಚಿನ ರೀಡಿಂಗ್‌ಗಳ ಸಾರಾಂಶ.", demoDerived: "ಡೆಮೋ ಆಧಾರಿತ ಸಾರಾಂಶ · ಪ್ರಸ್ತುತ ರೀಡಿಂಗ್‌ಗಳೊಂದಿಗೆ ಅಪ್‌ಡೇಟ್ ಆಗುತ್ತದೆ", checkNow: "ಈಗ ಪರೀಕ್ಷಿಸಿ", noAnimals: "ಯಾವುದೇ ಪ್ರಾಣಿ ಸಿಗಲಿಲ್ಲ", vetValidationNote: "ಪಶುವೈದ್ಯರ ಪರಿಶೀಲನೆಯು ಮುಂದಿನ ರೀಡಿಂಗ್ ಅನ್ನು ಉತ್ತಮಗೊಳಿಸುತ್ತದೆ.", dateToday: "ಭಾನುವಾರ, 6 ಸೆಪ್ಟೆಂಬರ್ 2026"
  },
  ta: {
    weatherToday: "ஞாயிறு, 6 செப்டம்பர் 2026", weatherLocationLabel: "ஹாசன், கர்நாடகா", farmerProfile: "விவசாயி சுயவிவரம்", profileSubtitle: "உங்கள் விவசாயி அடையாளம் மற்றும் பால் பண்ணை விவரங்கள்.", farmerLabel: "விவசாயி", phoneLabel: "தொலைபேசி", villageLabel: "கிராமம்", memberSinceLabel: "உறுப்பினர் முதல்", dairyLabel: "உங்கள் பண்ணை", registeredDevices: "பதிவு செய்யப்பட்ட சாதனங்கள்", cowsRegistered: "பதிவு செய்யப்பட்ட மாடுகள்", sensorDevices: "சென்சார் சாதனங்கள்", currentPreference: "தற்போதைய விருப்பம்", languageHelp: "நிலத் தேர்வி முழு செயலியின் மொழியை மாற்றுகிறது.", changeLanguage: "மாநிலம் / மொழியை மாற்று", localVet: "உங்கள் உள்ளூர் கால்நடை மருத்துவர்", largeAnimalSpecialist: "பெரிய விலங்கு நிபுணர்", availableToday: "இன்று கிடைக்கும் · காலை 8 – மாலை 7", shareReading: "மருத்துவரிடம் பேசும்போது வாசிப்பைக் காட்டுங்கள்.", startDemoCall: "டெமோ அழைப்பைத் தொடங்கு", demoInteraction: "டெமோ தொடர்பு · உண்மையான அழைப்பு இருக்காது", sensorConnected: "சென்சார் இணைக்கப்பட்டது", sensorLow: "பேட்டரி குறைவு", sensorStale: "சென்சார் பதிலளிக்கவில்லை", liveDemoFeed: "நேரடி டெமோ ஊட்டம்", callingVet: "டாக்டர் மீரா ராவ் அவர்களுக்கு அழைப்பு விடுக்கப்படுகிறது… (டெமோ)", queuedReadings: "வாசிப்புகள் வரிசையில் உள்ளன — ஆன்லைனில் வந்ததும் சிங்கிங் ஆகும்", syncedReadings: "வரிசை வாசிப்புகள் சிங்கிங் செய்யப்பட்டன — மந்தை புதுப்பிக்கப்பட்டது", backOnline: "மீண்டும் ஆன்லைனில்", offlineOn: "ஆஃப்லைன் பயன்முறை ஆன் — வாசிப்புகள் இந்த சாதனத்தில் இருக்கும்", vetConfirmedToast: "கால்நடை மருத்துவர் உறுதிப்படுத்தல் பதிவு செய்யப்பட்டது", falseAlarmToast: "தவறான எச்சரிக்கை என பதிவு செய்யப்பட்டது", farmerOverview: "விவசாயி கண்ணோட்டம்", farmTitle: "என் பண்ணை", farmSubtitle: "இன்று உங்கள் மந்தையின் எளிய படம்.", cowsRegisteredStat: "பதிவு செய்யப்பட்ட மாடுகள்", currentHerd: "உங்கள் தற்போதைய மந்தை", sensorsConnected: "இணைக்கப்பட்ட சென்சார்கள்", sensorsNotResponding: "பதிலளிக்கவில்லை", lowBattery: "பேட்டரி குறைவு", watchSensors: "இந்த சென்சார்களைக் கவனிக்கவும்", herdTrend: "மந்தை போக்கு", averageRisk: "சராசரி ஆபத்து மதிப்பெண்", recentCare: "சமீபத்திய பராமரிப்பு", lastResolved: "கடைசி தீர்க்கப்பட்ட எச்சரிக்கை", noResolved: "இதுவரை தீர்க்கப்பட்ட வழக்கு இல்லை", dayAgo: "நாள் முன்பு", daysAgo: "நாட்களுக்கு முன்பு", basedOnAlerts: "இந்த டெமோவின் சமீபத்திய உறுதி அல்லது தீர்க்கப்பட்ட எச்சரிக்கையை அடிப்படையாகக் கொண்டது.", sensorWatch: "சென்சார் கவனம்", sensorNotRespondingPlural: "சென்சார்கள் பதிலளிக்கவில்லை.", dueChecks: "சோதனை வேண்டிய மாடுகள்", dueChecksBody: "இந்த மாடுகள் இன்று சோதிக்கப்படவில்லை.", allChecked: "இன்று ஒவ்வொரு மாட்டுக்கும் புதிய வாசிப்பு உள்ளது.", thisWeek: "இந்த வாரம்", readingsTaken: "எடுக்கப்பட்ட வாசிப்புகள்", alertsRaised: "எழுந்த எச்சரிக்கைகள்", alertsResolved: "தீர்க்கப்பட்ட எச்சரிக்கைகள்", advisory: "இன்றைய ஆலோசனை", advisoryHigh: "இன்று கவனம் தேவை.", advisoryMedium: "இன்று சற்று கூடுதல் கவனம் தேவை.", advisoryGood: "உங்கள் மந்தை நன்றாக உள்ளது — இப்போது எந்த மாட்டுக்கும் சிறப்பு கவனம் தேவையில்லை.", quickAccess: "விரைவு அணுகல்", openAlerts: "எச்சரிக்கைகளைத் திற", contactVet: "மருத்துவரைத் தொடர்பு", useStatePicker: "மொழியை மாற்ற மேலுள்ள மாநிலத் தேர்வியைப் பயன்படுத்தவும்", searchAnimals: "விலங்குகளைத் தேடுங்கள்…", close: "மூடு", actualFeed: "இன்றைய பால் சோதனை", modelRisk: "AI ஆபத்து மாதிரி", modelRiskBody: "உண்மையான கடத்துத்திறன் மற்றும் வெப்பநிலை தரவில் பயிற்சி பெற்றது. இது நோயறிதல் அல்ல — சரியான நேரத்தில் மருத்துவரிடம் பேச உதவுகிறது.", riskScoreToday: "இன்றைய ஆபத்து மதிப்பெண்", infectionProbability: "தொற்று ஆபத்து சாத்தியக்கூறு", days: "நாட்கள்", continuousHistory: "தொடர்ச்சியான வரலாறு", routineTitle: "நல்ல பழக்கத்தைத் தொடருங்கள்", routineBody: "நாளைக்கு ஒரு முறை காலை வாசிப்பு உங்கள் மந்தையின் நிலையை தெளிவாக வைக்கும்.", alertSubtitle: "ஒவ்வொரு எச்சரிக்கையும் அடுத்த தெளிவான படியை உங்களுக்கு வழங்கும்.", farmTrendNote: "குறைந்த மதிப்பெண்கள் பொதுவாக அமைதியான நிலையை காட்டும். இது உங்கள் தற்போதைய வாசிப்புகளின் சுருக்கம்.", demoDerived: "டெமோ மூல சுருக்கம் · தற்போதைய வாசிப்புகளுடன் புதுப்பிக்கப்படும்", checkNow: "இப்போது சோதிக்கவும்", noAnimals: "எந்த விலங்கும் கிடைக்கவில்லை", vetValidationNote: "கால்நடை மருத்துவர் சரிபார்ப்பு அடுத்த வாசிப்பை மேம்படுத்துகிறது.", dateToday: "ஞாயிறு, 6 செப்டம்பர் 2026"
  },
  te: {
    weatherToday: "ఆదివారం, 6 సెప్టెంబర్ 2026", weatherLocationLabel: "హాసన్, కర్ణాటక", farmerProfile: "రైతు ప్రొఫైల్", profileSubtitle: "మీ రైతు గుర్తింపు మరియు డెయిరీ వివరాలు.", farmerLabel: "రైతు", phoneLabel: "ఫోన్", villageLabel: "గ్రామం", memberSinceLabel: "సభ్యత్వం ప్రారంభం", dairyLabel: "మీ డెయిరీ", registeredDevices: "నమోదైన పరికరాలు", cowsRegistered: "నమోదైన ఆవులు", sensorDevices: "సెన్సర్ పరికరాలు", currentPreference: "ప్రస్తుత ఎంపిక", languageHelp: "స్టేట్ పికర్ మొత్తం యాప్ భాషను మారుస్తుంది.", changeLanguage: "రాష్ట్రం / భాష మార్చండి", localVet: "మీ స్థానిక పశువైద్యుడు", largeAnimalSpecialist: "పెద్ద జంతువుల నిపుణుడు", availableToday: "ఈ రోజు అందుబాటులో · ఉదయం 8 – సాయంత్రం 7", shareReading: "పశువైద్యుడితో మాట్లాడేటప్పుడు రీడింగ్ చూపించండి.", startDemoCall: "డెమో కాల్ ప్రారంభించండి", demoInteraction: "డెమో సంభాషణ · నిజమైన కాల్ ఉండదు", sensorConnected: "సెన్సర్ అనుసంధానమైంది", sensorLow: "బ్యాటరీ తక్కువ", sensorStale: "సెన్సర్ స్పందించడం లేదు", liveDemoFeed: "లైవ్ డెమో ఫీడ్", callingVet: "డాక్టర్ మీరా రావు గారికి కాల్ చేస్తున్నారు… (డెమో)", queuedReadings: "రీడింగ్‌లు క్యూలో ఉన్నాయి — ఆన్‌లైన్‌లోకి రాగానే సింక్ అవుతాయి", syncedReadings: "క్యూలోని రీడింగ్‌లు సింక్ అయ్యాయి — మంద సమాచారం అప్‌డేట్ అయింది", backOnline: "మళ్లీ ఆన్‌లైన్", offlineOn: "ఆఫ్‌లైన్ మోడ్ ఆన్ — రీడింగ్‌లు ఈ పరికరంలో ఉంటాయి", vetConfirmedToast: "పశువైద్యుడి దృవీకరణ నమోదు చేయబడింది", falseAlarmToast: "తప్పు హెచ్చరికగా నమోదు చేయబడింది", farmerOverview: "రైతు అవలోకనం", farmTitle: "నా ఫారం", farmSubtitle: "ఈ రోజు మీ మంద యొక్క సరళమైన చిత్రం.", cowsRegisteredStat: "నమోదైన ఆవులు", currentHerd: "మీ ప్రస్తుత మంద", sensorsConnected: "అనుసంధానమైన సెన్సర్లు", sensorsNotResponding: "స్పందించడం లేదు", lowBattery: "బ్యాటరీ తక్కువ", watchSensors: "ఈ సెన్సర్లను గమనించండి", herdTrend: "మంద ధోరణి", averageRisk: "సగటు ప్రమాద స్కోర్", recentCare: "ఇటీవలి సంరక్షణ", lastResolved: "చివరి పరిష్కరించిన హెచ్చరిక", noResolved: "ఇంకా పరిష్కరించిన కేసు లేదు", dayAgo: "రోజు క్రితం", daysAgo: "రోజుల క్రితం", basedOnAlerts: "ఈ డెమోలో ఇటీవలి నిర్ధారించిన లేదా పరిష్కరించిన హెచ్చరిక ఆధారంగా.", sensorWatch: "సెన్సర్ గమనిక", sensorNotRespondingPlural: "సెన్సర్లు స్పందించడం లేదు.", dueChecks: "తనిఖీ చేయాల్సిన ఆవులు", dueChecksBody: "ఈ ఆవులను ఈ రోజు తనిఖీ చేయలేదు.", allChecked: "ఈ రోజు ప్రతి ఆవుకు తాజా రీడింగ్ ఉంది.", thisWeek: "ఈ వారం", readingsTaken: "తీసిన రీడింగ్‌లు", alertsRaised: "వచ్చిన హెచ్చరికలు", alertsResolved: "పరిష్కరించిన హెచ్చరికలు", advisory: "ఈ రోజు సలహా", advisoryHigh: "కు ఈ రోజు శ్రద్ధ అవసరం.", advisoryMedium: "కు ఈ రోజు మరింత శ్రద్ధ అవసరం.", advisoryGood: "మీ మంద బాగుంది — ఇప్పుడు ఏ ఆవుకూ ప్రత్యేక శ్రద్ధ అవసరం లేదు.", quickAccess: "త్వరిత ప్రాప్యత", openAlerts: "హెచ్చరికలు తెరవండి", contactVet: "పశువైద్యుడిని సంప్రదించండి", useStatePicker: "భాష మార్చడానికి పై స్టేట్ పికర్‌ను ఉపయోగించండి", searchAnimals: "జంతువులను వెతకండి…", close: "మూసివేయి", actualFeed: "ఈ రోజు పాలు తనిఖీ", modelRisk: "AI ప్రమాద మోడల్", modelRiskBody: "వాస్తవ విద్యుత్ వాహకత మరియు ఉష్ణోగ్రత డేటా ఆధారంగా శిక్షణ పొందబడింది. ఇది వ్యాధి నిర్ధారణ కాదు — సమయానికి పశువైద్యుడితో మాట్లాడటానికి సహాయపడుతుంది.", riskScoreToday: "ఈ రోజు ప్రమాద స్కోర్", infectionProbability: "ఇన్ఫెక్షన్ ప్రమాద సంభావ్యత", days: "రోజులు", continuousHistory: "నిరంతర చరిత్ర", routineTitle: "మంచి అలవాటు కొనసాగించండి", routineBody: "రోజుకు ఒకసారి ఉదయం రీడింగ్ మీ మంద స్థితిని స్పష్టంగా ఉంచుతుంది.", alertSubtitle: "ప్రతి హెచ్చరిక మీకు తదుపరి స్పష్టమైన అడుగును అందిస్తుంది.", farmTrendNote: "తక్కువ స్కోర్లు సాధారణంగా ప్రశాంత స్థితిని సూచిస్తాయి. ఇది మీ ప్రస్తుత రీడింగ్‌ల సారాంశం.", demoDerived: "డెమో ఆధారిత సారాంశం · ప్రస్తుత రీడింగ్‌లతో అప్‌డేట్ అవుతుంది", checkNow: "ఇప్పుడే తనిఖీ చేయండి", noAnimals: "ఏ జంతువూ కనబడలేదు", vetValidationNote: "పశువైద్యుడి తనిఖీ తదుపరి రీడింగ్‌ను మెరుగుపరుస్తుంది.", dateToday: "ఆదివారం, 6 సెప్టెంబర్ 2026"
  }
}
const localizedExtras: Record<Language, ExtraCopy> = Object.fromEntries(Object.entries(extraCopy).map(([key, value]) => [key, { ...extraCopy.en, ...value }])) as Record<Language, ExtraCopy>

const surfaceCopy: Record<Language, { brandTagline: string; earlyWarning: string; heroLineOne: string; heroLineTwo: string; heroBody: string; modelNote: string; simulatedFeed: string; milkCheck: string; hardwareNote: string; conductivity: string; conductivityNote: string; temperature: string; temperatureNote: string; battery: string; batteryNote: string; staleNote: string; telemetryNote: string }> = {
  en: { brandTagline: "Healthy connections", earlyWarning: "Pashu Mitra early warning", heroLineOne: "Healthy cows.", heroLineTwo: "Peaceful mornings.", heroBody: "Check once a day. Know sooner. Care better.", modelNote: "Model updated from today’s readings", simulatedFeed: "Simulated sensor feed", milkCheck: "Today’s milk check", hardwareNote: "Hardware prototype in development", conductivity: "Electrical conductivity", conductivityNote: "Milk conductivity · rises with infection", temperature: "Milk temperature", temperatureNote: "Secondary signal · helps reduce false positives", battery: "Sensor battery", batteryNote: "Functional · battery degrades slowly", staleNote: "Sensor not responding", telemetryNote: "Simulated sensor feed · values are mock data and are not a diagnosis." },
  hi: { brandTagline: "स्वस्थ संबंध", earlyWarning: "पशु-मित्र शुरुआती चेतावनी", heroLineOne: "स्वस्थ गायें।", heroLineTwo: "सुकून भरी सुबह।", heroBody: "दिन में एक बार जांचें। जल्दी जानें। बेहतर देखभाल करें।", modelNote: "आज की रीडिंग से मॉडल अपडेट", simulatedFeed: "सिम्युलेटेड सेंसर फीड", milkCheck: "आज की दूध जांच", hardwareNote: "हार्डवेयर प्रोटोटाइप विकास में", conductivity: "विद्युत चालकता", conductivityNote: "दूध की चालकता · संक्रमण में बढ़ती है", temperature: "दूध का तापमान", temperatureNote: "दूसरा संकेत · गलत चेतावनी कम करने में मदद", battery: "सेंसर बैटरी", batteryNote: "सक्रिय · बैटरी धीरे घटती है", staleNote: "सेंसर जवाब नहीं दे रहा", telemetryNote: "सिम्युलेटेड सेंसर फीड · ये नकली मान हैं और निदान नहीं हैं।" },
  mr: { brandTagline: "निरोगी नाती", earlyWarning: "पशु-मित्र लवकर इशारा", heroLineOne: "निरोगी गायी.", heroLineTwo: "शांत सकाळी.", heroBody: "दिवसातून एकदा तपासा. लवकर जाणून घ्या. चांगली काळजी घ्या.", modelNote: "आजच्या रीडिंगमधून मॉडेल अपडेट", simulatedFeed: "सिम्युलेटेड सेन्सर फीड", milkCheck: "आजची दूध तपासणी", hardwareNote: "हार्डवेअर प्रोटोटाइप विकासात", conductivity: "विद्युत चालकता", conductivityNote: "दुधाची चालकता · संसर्गात वाढते", temperature: "दुधाचे तापमान", temperatureNote: "दुय्यम संकेत · चुकीच्या सूचना कमी करण्यास मदत", battery: "सेन्सर बॅटरी", batteryNote: "कार्यरत · बॅटरी हळूहळू कमी होते", staleNote: "सेन्सर प्रतिसाद देत नाही", telemetryNote: "सिम्युलेटेड सेन्सर फीड · ही बनावट मूल्ये आहेत, निदान नाही." },
  gu: { brandTagline: "સ્વસ્થ જોડાણો", earlyWarning: "પશુ-મિત્ર વહેલી ચેતવણી", heroLineOne: "સ્વસ્થ ગાયો.", heroLineTwo: "શાંત સવાર.", heroBody: "દિવસમાં એક વાર તપાસો. વહેલું જાણો. સારી સંભાળ રાખો.", modelNote: "આજના રીડિંગથી મોડેલ અપડેટ", simulatedFeed: "સિમ્યુલેટેડ સેન્સર ફીડ", milkCheck: "આજની દૂધ તપાસ", hardwareNote: "હાર્ડવેર પ્રોટોટાઇપ વિકાસમાં", conductivity: "વિદ્યુત વાહકતા", conductivityNote: "દૂધની વાહકતા · ચેપમાં વધે છે", temperature: "દૂધનું તાપમાન", temperatureNote: "બીજો સંકેત · ખોટી સૂચનાઓ ઘટાડે છે", battery: "સેન્સર બેટરી", batteryNote: "કાર્યરત · બેટરી ધીમે ઘટે છે", staleNote: "સેન્સર જવાબ આપતું નથી", telemetryNote: "સિમ્યુલેટેડ સેન્સર ફીડ · આ નકલી મૂલ્યો છે, નિદાન નથી." },
  pa: { brandTagline: "ਸਿਹਤਮੰਦ ਜੋੜ", earlyWarning: "ਪਸ਼ੂ-ਮਿੱਤਰ ਜਲਦੀ ਚੇਤਾਵਨੀ", heroLineOne: "ਤੰਦਰੁਸਤ ਗਾਵਾਂ।", heroLineTwo: "ਸੁਖਦ ਸਵੇਰਾਂ।", heroBody: "ਦਿਨ ਵਿੱਚ ਇੱਕ ਵਾਰ ਜਾਂਚੋ। ਜਲਦੀ ਜਾਣੋ। ਚੰਗੀ ਦੇਖਭਾਲ ਕਰੋ।", modelNote: "ਅੱਜ ਦੀਆਂ ਰੀਡਿੰਗਾਂ ਨਾਲ ਮਾਡਲ ਅੱਪਡੇਟ", simulatedFeed: "ਸਿਮੂਲੇਟਡ ਸੈਂਸਰ ਫੀਡ", milkCheck: "ਅੱਜ ਦੀ ਦੁੱਧ ਜਾਂਚ", hardwareNote: "ਹਾਰਡਵੇਅਰ ਪ੍ਰੋਟੋਟਾਈਪ ਵਿਕਾਸ ਵਿੱਚ", conductivity: "ਬਿਜਲੀ ਚਾਲਕਤਾ", conductivityNote: "ਦੁੱਧ ਦੀ ਚਾਲਕਤਾ · ਇਨਫੈਕਸ਼ਨ ਵਿੱਚ ਵਧਦੀ ਹੈ", temperature: "ਦੁੱਧ ਦਾ ਤਾਪਮਾਨ", temperatureNote: "ਦੂਜਾ ਸੰਕੇਤ · ਗਲਤ ਸੂਚਨਾਵਾਂ ਘਟਾਉਂਦਾ ਹੈ", battery: "ਸੈਂਸਰ ਬੈਟਰੀ", batteryNote: "ਚੱਲ ਰਹੀ · ਬੈਟਰੀ ਹੌਲੀ ਘਟਦੀ ਹੈ", staleNote: "ਸੈਂਸਰ ਜਵਾਬ ਨਹੀਂ ਦੇ ਰਿਹਾ", telemetryNote: "ਸਿਮੂਲੇਟਡ ਸੈਂਸਰ ਫੀਡ · ਇਹ ਨਕਲੀ ਮੁੱਲ ਹਨ, ਨਿਦਾਨ ਨਹੀਂ." },
  kn: { brandTagline: "ಆರೋಗ್ಯಕರ ಸಂಪರ್ಕಗಳು", earlyWarning: "ಪಶು-ಮಿತ್ರ ಮುನ್ನೆಚ್ಚರಿಕೆ", heroLineOne: "ಆರೋಗ್ಯಕರ ಹಸುಗಳು.", heroLineTwo: "ಶಾಂತ ಬೆಳಗ್ಗೆಗಳು.", heroBody: "ದಿನಕ್ಕೆ ಒಮ್ಮೆ ಪರೀಕ್ಷಿಸಿ. ಬೇಗ ತಿಳಿಯಿರಿ. ಉತ್ತಮ ಆರೈಕೆ ಮಾಡಿ.", modelNote: "ಇಂದಿನ ರೀಡಿಂಗ್‌ಗಳಿಂದ ಮಾದರಿ ನವೀಕರಿಸಲಾಗಿದೆ", simulatedFeed: "ಸಿಮ್ಯುಲೇಟೆಡ್ ಸೆನ್ಸರ್ ಫೀಡ್", milkCheck: "ಇಂದಿನ ಹಾಲಿನ ಪರೀಕ್ಷೆ", hardwareNote: "ಹಾರ್ಡ್‌ವೇರ್ ಮಾದರಿ ಅಭಿವೃದ್ಧಿಯಲ್ಲಿದೆ", conductivity: "ವಿದ್ಯುತ್ ವಾಹಕತೆ", conductivityNote: "ಹಾಲಿನ ವಾಹಕತೆ · ಸೋಂಕಿನಲ್ಲಿ ಹೆಚ್ಚುತ್ತದೆ", temperature: "ಹಾಲಿನ ತಾಪಮಾನ", temperatureNote: "ದ್ವಿತೀಯ ಸಂಕೇತ · ತಪ್ಪು ಎಚ್ಚರಿಕೆ ಕಡಿಮೆ ಮಾಡುತ್ತದೆ", battery: "ಸೆನ್ಸರ್ ಬ್ಯಾಟರಿ", batteryNote: "ಕಾರ್ಯನಿರ್ವಹಣೆ · ಬ್ಯಾಟರಿ ನಿಧಾನವಾಗಿ ಕಡಿಮೆಯಾಗುತ್ತದೆ", staleNote: "ಸೆನ್ಸರ್ ಪ್ರತಿಕ್ರಿಯಿಸುತ್ತಿಲ್ಲ", telemetryNote: "ಸಿಮ್ಯುಲೇಟೆಡ್ ಸೆನ್ಸರ್ ಫೀಡ್ · ಇವು ಮಾದರಿ ಮೌಲ್ಯಗಳು, ರೋಗನಿರ್ಣಯವಲ್ಲ." },
  ta: { brandTagline: "ஆரோக்கியமான இணைப்புகள்", earlyWarning: "பசு-மித்ரா முன் எச்சரிக்கை", heroLineOne: "ஆரோக்கியமான மாடுகள்.", heroLineTwo: "அமைதியான காலைகள்.", heroBody: "ஒரு நாளில் ஒருமுறை சரிபார்க்கவும். விரைவில் அறியவும். சிறப்பாக பராமரிக்கவும்.", modelNote: "இன்றைய வாசிப்புகளிலிருந்து மாதிரி புதுப்பிக்கப்பட்டது", simulatedFeed: "உருவகப்படுத்தப்பட்ட சென்சார் ஊட்டம்", milkCheck: "இன்றைய பால் சோதனை", hardwareNote: "வன்பொருள் முன்மாதிரி உருவாக்கத்தில்", conductivity: "மின் கடத்துத்திறன்", conductivityNote: "பாலின் கடத்துத்திறன் · தொற்றில் அதிகரிக்கும்", temperature: "பாலின் வெப்பநிலை", temperatureNote: "இரண்டாம் அறிகுறி · தவறான எச்சரிக்கைகளை குறைக்கும்", battery: "சென்சார் பேட்டரி", batteryNote: "செயலில் · பேட்டரி மெதுவாக குறையும்", staleNote: "சென்சார் பதிலளிக்கவில்லை", telemetryNote: "உருவகப்படுத்தப்பட்ட சென்சார் ஊட்டம் · இவை மாதிரி மதிப்புகள், நோயறிதல் அல்ல." },
  te: { brandTagline: "ఆరోగ్యకరమైన అనుసంధానాలు", earlyWarning: "పశు-మిత్ర ముందస్తు హెచ్చరిక", heroLineOne: "ఆరోగ్యమైన ఆవులు.", heroLineTwo: "ప్రశాంతమైన ఉదయాలు.", heroBody: "రోజుకు ఒకసారి తనిఖీ చేయండి. త్వరగా తెలుసుకోండి. మెరుగైన సంరక్షణ చేయండి.", modelNote: "నేటి రీడింగ్‌లతో మోడల్ నవీకరించబడింది", simulatedFeed: "సిమ్యులేటెడ్ సెన్సర్ ఫీడ్", milkCheck: "నేటి పాలు తనిఖీ", hardwareNote: "హార్డ్‌వేర్ నమూనా అభివృద్ధిలో ఉంది", conductivity: "విద్యుత్ వాహకత", conductivityNote: "పాల వాహకత · సంక్రమణలో పెరుగుతుంది", temperature: "పాల ఉష్ణోగ్రత", temperatureNote: "ద్వితీయ సంకేతం · తప్పుడు హెచ్చరికలను తగ్గిస్తుంది", battery: "సెన్సర్ బ్యాటరీ", batteryNote: "పనిచేస్తోంది · బ్యాటరీ నెమ్మదిగా తగ్గుతుంది", staleNote: "సెన్సర్ స్పందించడం లేదు", telemetryNote: "సిమ్యులేటెడ్ సెన్సర్ ఫీడ్ · ఇవి నమూనా విలువలు, నిర్ధారణ కాదు." },
};
const trendBodyByLanguage: Record<Language, string> = {
  en: "Lakshmi’s risk rose over the last 5 days. This is an early warning, before visible signs.",
  hi: "लक्ष्मी का जोखिम पिछले 5 दिनों में बढ़ा है। यह दिखाई देने वाले लक्षणों से पहले की चेतावनी है।",
  mr: "लक्ष्मीचा धोका मागील ५ दिवसांत वाढला आहे. दिसणारी लक्षणे येण्यापूर्वीचा हा इशारा आहे.",
  gu: "લક્ષ્મીનું જોખમ છેલ્લા 5 દિવસમાં વધ્યું છે. દેખાતા લક્ષણો પહેલાંની આ વહેલી ચેતવણી છે.",
  pa: "ਲਕਸ਼ਮੀ ਦਾ ਖਤਰਾ ਪਿਛਲੇ 5 ਦਿਨਾਂ ਵਿੱਚ ਵਧਿਆ ਹੈ। ਇਹ ਦਿਖਾਈ ਦੇਣ ਵਾਲੇ ਲੱਛਣਾਂ ਤੋਂ ਪਹਿਲਾਂ ਦੀ ਚੇਤਾਵਨੀ ਹੈ.",
  kn: "ಲಕ್ಷ್ಮಿಯ ಅಪಾಯವು ಕಳೆದ 5 ದಿನಗಳಲ್ಲಿ ಹೆಚ್ಚಾಗಿದೆ. ಕಾಣುವ ಲಕ್ಷಣಗಳಿಗಿಂತ ಮುಂಚಿನ ಮುನ್ನೆಚ್ಚರಿಕೆ ಇದು.",
  ta: "லட்சுமியின் ஆபத்து கடந்த 5 நாட்களில் அதிகரித்துள்ளது. காணக்கூடிய அறிகுறிகளுக்கு முன் வரும் எச்சரிக்கை இது.",
  te: "లక్ష్మి ప్రమాదం గత 5 రోజుల్లో పెరిగింది. కనిపించే లక్షణాలకు ముందే వచ్చే హెచ్చరిక ఇది.",
};

const riskMeta = {
  high: { label: "High risk", color: "red", icon: CircleAlert },
  medium: { label: "Watch closely", color: "yellow", icon: AlertCircle },
  low: { label: "Low risk", color: "green", icon: CheckCircle2 },
} as const;

function formatRisk(risk: Risk, lang: Language) {
  const labels = localizedCopy[lang];
  return risk === "high" ? labels.high : risk === "medium" ? labels.medium : labels.low;
}

function StatusPill({ risk, lang, compact = false, treatmentStatus }: { risk: Risk; lang: Language; compact?: boolean; treatmentStatus?: "under-treatment" | "none" }) {
  if (treatmentStatus === "under-treatment") {
    return (
      <span className={`status-pill status-treatment ${compact ? "status-compact" : ""}`}>
        <Activity size={compact ? 14 : 16} strokeWidth={2.4} />
        <span>{localizedCopy[lang].underTreatment || "Under treatment"}</span>
      </span>
    );
  }
  const Icon = riskMeta[risk].icon;
  return (
    <span className={`status-pill status-${risk} ${compact ? "status-compact" : ""}`}>
      <Icon size={compact ? 14 : 16} strokeWidth={2.4} />
      <span>{formatRisk(risk, lang)}</span>
    </span>
  );
}

function SyncBadge({ offline, lang, onToggle, queued, lastSynced }: { offline: boolean; lang: Language; onToggle: () => void; queued: number; lastSynced: string }) {
  return (
    <button className={`sync-badge ${offline ? "is-offline" : ""}`} onClick={onToggle} aria-label="Toggle connectivity mode">
      {offline ? <CloudOff size={15} /> : <Wifi size={15} />}
      <span>{queued > 0 ? `${queued} queued · ${localizedCopy[lang].offline}` : offline ? localizedCopy[lang].offline : `Last synced ${lastSynced}`}</span>
      <span className="sync-dot" />
    </button>
  );
}

function SensorStatus({ cow, lang }: { cow: Cow; lang: Language }) {
  const ui = localizedExtras[lang];
  const stale = cow.sensor.state === "stale";
  const lowBattery = cow.sensor.battery < 15;
  return <div className={`sensor-status ${stale ? "sensor-stale" : lowBattery ? "sensor-low" : ""}`}><Signal size={14} /><span>{stale ? ui.sensorStale : lowBattery ? ui.sensorLow : ui.sensorConnected}</span><small>• {stale ? cow.sensor.lastContact : ui.liveDemoFeed}</small></div>;
}

function TelemetryCard({ icon, label, value, note, className = "", children }: { icon: ReactNode; label: string; value: string; note: string; className?: string; children?: ReactNode }) {
  return <div className={`telemetry-card ${className}`}><div className="telemetry-icon">{icon}</div><div className="telemetry-copy"><span>{label}</span><strong>{value}</strong><small>{note}</small>{children}</div></div>;
}

function VetContactModal({ lang, location, onClose, onCall }: { lang: Language; location: { village: string; region: string }; onClose: () => void; onCall: () => void }) {
  const ui = localizedExtras[lang];
  return <div className="modal-backdrop" role="presentation" onClick={onClose}><section className="contact-modal" role="dialog" aria-modal="true" aria-labelledby="vet-contact-title" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={onClose} aria-label={ui.close}><XCircle size={20} /></button><div className="contact-avatar"><Stethoscope size={25} /></div><p className="eyebrow">{ui.localVet}</p><h2 id="vet-contact-title">Dr. Meera Rao</h2><p className="contact-role">{ui.largeAnimalSpecialist} · {location.region}</p><div className="contact-detail"><Phone size={17} /><span><strong>+91 98765 43210</strong><small>{ui.availableToday}</small></span></div><p className="contact-note">{ui.shareReading}</p><button className="primary-button contact-call" onClick={onCall}><Phone size={17} /> {ui.startDemoCall}</button><small className="modal-demo">{ui.demoInteraction}</small></section></div>;
}

function StatePicker({ selectedState, onSelect, compact = false }: { selectedState: StateOption; onSelect: (state: StateOption) => void; compact?: boolean }) {
  const ui = localizedExtras[selectedState.language];
  return <label className={`state-picker-wrap ${compact ? "state-picker-compact" : ""}`}><Languages size={16} /><span className="sr-only">{ui.selectStateLabel}</span><select className="state-picker" value={selectedState.state} onChange={(event) => { const next = stateOptions.find((option) => option.state === event.target.value); if (next) onSelect(next); }} aria-label={ui.selectStateLabel}>{stateOptions.map((option) => <option key={option.state} value={option.state}>{option.native} · {option.languageLabel}</option>)}</select></label>;
}

function MobileDrawer({ lang, mode, view, selectedState, onClose, onView, onMode, onState }: { lang: Language; mode: "farmer" | "vet"; view: View; selectedState: StateOption; onClose: () => void; onView: (view: View) => void; onMode: () => void; onState: (state: StateOption) => void }) {
  const text = localizedCopy[lang];
  const ui = localizedExtras[lang];

  return <div className="drawer-backdrop" onClick={onClose}><aside className="mobile-drawer" onClick={(event) => event.stopPropagation()}><div className="drawer-head"><Logo onClick={() => { onView("home"); onClose(); }} /><button className="modal-close" onClick={onClose} aria-label={ui.close}><XCircle size={20} /></button></div><p className="drawer-kicker">{mode === "farmer" ? text.farmer : text.vet}</p><nav className="drawer-nav"><button className={view === "home" || view === "cow" ? "active" : ""} onClick={() => { onView("home"); onClose(); }}><Activity size={18} />{text.home}</button><button className={view === "farm" ? "active" : ""} onClick={() => { onView("farm"); onClose(); }}><Leaf size={18} />{ui.farmTitle}</button><button className={view === "alerts" ? "active" : ""} onClick={() => { onView("alerts"); onClose(); }}><Bell size={18} />{text.alerts}</button><button className={view === "about" ? "active" : ""} onClick={() => { onView("about"); onClose(); }}><Info size={18} />{text.about}</button></nav><div className="drawer-actions"><button onClick={() => { onView("profile"); onClose(); }}><UserRound size={16} /> {ui.farmerProfile}</button><button onClick={onMode}><RefreshCw size={16} /> {mode === "farmer" ? text.switchToVet : text.switchToFarmer}</button><StatePicker selectedState={selectedState} onSelect={onState} /></div></aside></div>;
}

type ForecastResult = {
  slope: number;
  forecast: number[];
  trend: "rising" | "stable" | "improving" | "insufficient";
  daysToHigh: number | null;
};

function getRiskForecast(history: number[]): ForecastResult {
  const values = history.filter((value) => Number.isFinite(value)).slice(-7);
  if (values.length < 2) return { slope: 0, forecast: [], trend: "insufficient", daysToHigh: null };

  const meanX = (values.length - 1) / 2;
  const meanY = values.reduce((sum, value) => sum + value, 0) / values.length;
  const denominator = values.reduce((sum, _value, index) => sum + (index - meanX) ** 2, 0);
  const slope = denominator === 0
    ? 0
    : values.reduce((sum, value, index) => sum + (index - meanX) * (value - meanY), 0) / denominator;
  const latest = values[values.length - 1];
  const forecast = Array.from({ length: 4 }, (_, index) => Math.max(0, Math.min(100, latest + slope * (index + 1))));
  const trend = slope > 1 ? "rising" : slope < -1 ? "improving" : "stable";
  const daysToHigh = trend === "rising" && latest < 70 && slope > 0
    ? (70 - latest) / slope
    : null;

  return { slope, forecast, trend, daysToHigh };
}

function generateRecommendation(risk: Risk, probability: number | null, trend: ForecastResult["trend"], score: number): string {
  const p = probability != null ? Math.round(probability * 100) : score;
  const variant = (score + (probability != null ? Math.round(probability * 37) : 0)) % 3;

  if (risk === "high") {
    if (p >= 90) {
      if (trend === "rising") return "Urgent — risk is climbing fast. Call your vet today; early treatment can prevent lasting udder damage.";
      return "Risk is high at " + p + "%. Speak to your vet today — catching this early can save the cow and your milk income.";
    }
    if (p >= 80) {
      if (trend === "rising") return "Risk has been rising steadily to " + p + "%. Contact your vet soon — the upward trend suggests action is needed.";
      if (trend === "improving") return "Risk is high (" + p + "%) but the trend is coming down. Stay watchful and speak to your vet if it climbs again.";
      return variant === 0
        ? "Contact your vet — early signs of infection detected at " + p + "%. Timely attention can prevent bigger problems."
        : "Early signs detected (" + p + "% risk). A vet visit now could stop this from getting worse.";
    }
    if (trend === "rising") return "This cow is at " + p + "% and still climbing. Schedule a vet check within a day or two.";
    if (trend === "improving") return "Risk crossed the high line (" + p + "%) but is easing. Watch closely and consult your vet if it reverses.";
    return variant === 0
      ? "Contact your vet — early signs of infection detected. A quick check now could prevent a bigger problem."
      : "Risk has crossed " + p + "%. Speak to your vet before visible symptoms appear.";
  }

  if (risk === "medium") {
    if (p >= 60) {
      if (trend === "rising") return "Watch closely — this cow's reading is creeping up to " + p + "%. Check again tomorrow and contact the vet if it continues.";
      if (trend === "improving") return "Elevated at " + p + "% but improving. Continue monitoring — the trend is encouraging.";
      return "Elevated reading at " + p + "%. Keep an eye on this cow and check again tomorrow morning.";
    }
    if (p >= 45) {
      if (trend === "rising") return "A small upward trend was noticed (" + p + "%). Check this cow again tomorrow to see if it continues.";
      if (trend === "improving") return "Reading was elevated but is coming down (" + p + "%). Keep monitoring — good progress.";
      return variant === 0
        ? "Keep an eye on this cow — her reading is above the calm range at " + p + "%. Check again tomorrow."
        : "This cow's score sits at " + p + "% — not alarming yet, but worth another look tomorrow.";
    }
    if (trend === "stable") return "Reading is in the watch range (" + p + "%) but holding steady. Continue daily checks to catch any change early.";
    if (trend === "rising") return "A slight upward shift to " + p + "%. Check again tomorrow — consistent monitoring catches problems early.";
    return variant === 0
      ? "Keep an eye on this cow — check again tomorrow."
      : "Score is " + p + "%, slightly elevated. Continue your routine morning checks.";
  }

  if (trend === "improving") return "Looking good — this cow's reading has been falling to " + p + "%. No action needed, keep up the routine.";
  if (score <= 10) return "Very calm reading (" + p + "%). No action needed — this cow is doing well.";
  return variant === 0
    ? "No action needed — monitor as usual. One morning reading a day keeps the story clear."
    : "Healthy reading at " + p + "%. Keep up the daily routine.";
}

function ForecastCallout({ forecast, showDetail = false }: { forecast: ForecastResult; showDetail?: boolean }) {
  const projectedScore = forecast.forecast[forecast.forecast.length - 1];
  const detail = showDetail && projectedScore != null ? ` 4-day estimate: ${Math.round(projectedScore)}/100.` : "";
  const message = forecast.trend === "insufficient"
    ? "Not enough recent readings for a reliable trend estimate."
    : forecast.trend === "rising" && forecast.daysToHigh != null && forecast.daysToHigh <= 4
      ? `At this rate, risk may cross the high-risk line in about ${Math.max(1, Math.ceil(forecast.daysToHigh))} day${Math.ceil(forecast.daysToHigh) === 1 ? "" : "s"}.${detail}`
      : forecast.trend === "rising"
        ? `Risk is trending upward — keep a closer watch over the next few days.${detail}`
        : forecast.trend === "improving"
          ? `Risk is easing — no concerning upward trend detected.${detail}`
          : `Risk is stable — no concerning trend detected.${detail}`;
  return <div className="forecast-callout"><span className="forecast-callout-text">{message}</span><span className="forecast-honesty">Projected trend · estimate, not a guarantee</span></div>;
}

function TrendChart({ cow, large = false, showDetail = false }: { cow: Cow; large?: boolean; showDetail?: boolean }) {
  const max = 100;
  const width = large ? 720 : 520;
  const height = large ? 230 : 190;
  const forecast = getRiskForecast(cow.history);
  const forecastDays = forecast.forecast.length;
  const historyEnd = forecastDays > 0 ? width - 112 : width - 14;
  const points = cow.history.map((value, index) => {
    const x = 14 + (index * (historyEnd - 14)) / Math.max(cow.history.length - 1, 1);
    const y = height - 20 - (value / max) * (height - 42);
    return `${x},${y}`;
  });
  const projectPoints = forecast.forecast.map((value, index) => {
    const x = historyEnd + ((index + 1) * (width - 14 - historyEnd)) / forecastDays;
    const y = height - 20 - (value / max) * (height - 42);
    return `${x},${y}`;
  });
  const areaPoints = [`14,${height - 20}`, ...points, `${historyEnd},${height - 20}`].join(" ");
  const actualLast = points[points.length - 1] ?? `14,${height - 20}`;
  const forecastLine = forecastDays > 0 ? [actualLast, ...projectPoints].join(" ") : "";
  return (
    <div className={`trend-wrap ${large ? "trend-large" : ""}`}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${cow.name} actual risk history with a projected four-day trend estimate`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`risk-fill-${cow.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d86d53" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#d86d53" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[20, 40, 60, 80].map((line) => {
          const y = height - 20 - (line / max) * (height - 42);
          return <line key={line} x1="14" x2={width - 14} y1={y} y2={y} className="chart-grid" />;
        })}
        <polygon points={areaPoints} fill={`url(#risk-fill-${cow.id})`} />
        <polyline points={points.join(" ")} className="chart-line" />
        {forecastDays > 0 && <polyline points={forecastLine} className="chart-forecast-line" />}
        {cow.history.map((value, index) => {
          const [x, y] = points[index].split(",");
          return <circle key={`${cow.id}-${index}`} cx={x} cy={y} r={index === cow.history.length - 1 ? 5 : 2.6} className={index === cow.history.length - 1 ? "chart-point chart-point-final" : "chart-point"} />;
        })}
        {projectPoints.length > 0 && (() => {
          const [x, y] = projectPoints[projectPoints.length - 1].split(",");
          return <circle cx={x} cy={y} r="4" className="chart-forecast-point" />;
        })()}
      </svg>
      <div className="chart-axis"><span>{cow.history.length} days of actual</span><span>Today</span><span>+4 days projected</span></div>
      <ForecastCallout forecast={forecast} showDetail={showDetail} />
    </div>
  );
}
function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width={size} height={size} style={{ borderRadius: 8, display: "block" }}>
      <rect width="64" height="64" rx="18" fill="#1f5a45"/>
      <path d="M22 42C22 30 31 22 42 22C42 34 33 42 42 42Z" fill="#ebc276"/>
      <path d="M42 42C42 30 33 22 22 22C22 34 31 42 42 42Z" fill="#9db793" opacity="0.85"/>
      <circle cx="32" cy="27" r="3.5" fill="#f8f5ed"/>
    </svg>
  );
}

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <button className="brand" onClick={onClick} aria-label="Go to home">
      <span className="brand-icon" style={{ background: "transparent", padding: 0 }}><LogoMark size={28} /></span>
      <span><strong>Pashu Mitra</strong><small>Healthy connections</small></span>
    </button>
  );
}

function CowCard({ cow, lang, onClick }: { cow: Cow; lang: Language; onClick: () => void }) {
  return (
    <button className="cow-card" onClick={onClick} aria-label={`View details for ${cow.name}`}>
      <div className={`cow-avatar avatar-${cow.risk}`} aria-hidden="true">🐄</div>
      <div className="cow-card-main">
        <div className="cow-card-title"><strong>{cow.name}</strong><span>{cow.tag}</span></div>
        <div className="cow-card-meta"><span>{cow.checked}</span><span className="score-label">{cow.score}/100</span></div>
      </div>
      <div className="cow-card-end"><StatusPill risk={cow.risk} lang={lang} compact treatmentStatus={cow.treatmentStatus} /><ChevronRight size={19} /></div>
    </button>
  );
}

function EmptyState({ lang }: { lang: Language }) {
  const ui = localizedExtras[lang];
  return <div className="empty-state"><CheckCircle2 size={27} /><strong>{ui.noAnimals}</strong><span>{ui.farmTrendNote}</span></div>;
}

export default function Home() {
  const [selectedStateName, setSelectedStateName] = useState("Maharashtra");
  const [mode, setMode] = useState<"farmer" | "vet">("farmer");
  const [view, setView] = useState<View>("home");
  const [cows, setCows] = useState<Cow[]>(cowsSeedInitialized);
  const [alerts, setAlerts] = useState<AlertItem[]>(alertsSeed);
  const [selectedCowId, setSelectedCowId] = useState("cow-1");
  const [offline, setOffline] = useState(false);
  const [checking, setChecking] = useState(false);
  const [toast, setToast] = useState("");
  const [alertFilter, setAlertFilter] = useState<"all" | "high">("all");
  const [sortRisk, setSortRisk] = useState(true);
  const [queuedCowIds, setQueuedCowIds] = useState<string[]>([]);
  const [lastSynced, setLastSynced] = useState("2 hours ago");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [reviewingCowId, setReviewingCowId] = useState<string | null>(null);
  const [vetLoadingId, setVetLoadingId] = useState<string | null>(null);
  const [modelUpdates, setModelUpdates] = useState(0);
  const selectedState = stateOptions.find((option) => option.state === selectedStateName) ?? stateOptions[0];
  const lang = resolveStateLanguage(selectedState);
  const text = localizedCopy[lang];
  const ui = localizedExtras[lang];
  const surface = surfaceCopy[lang];
  const locationByState: Record<string, { village: string; region: string }> = { Maharashtra: { village: "Nashik", region: "Maharashtra" }, Gujarat: { village: "Anand", region: "Gujarat" }, Punjab: { village: "Ludhiana", region: "Punjab" }, Karnataka: { village: "Hassan", region: "Karnataka" }, "Tamil Nadu": { village: "Erode", region: "Tamil Nadu" }, "Andhra Pradesh": { village: "Guntur", region: "Andhra Pradesh" }, Telangana: { village: "Warangal", region: "Telangana" }, "Uttar Pradesh": { village: "Meerut", region: "Uttar Pradesh" }, Bihar: { village: "Muzaffarpur", region: "Bihar" }, Rajasthan: { village: "Jaipur", region: "Rajasthan" }, "Madhya Pradesh": { village: "Indore", region: "Madhya Pradesh" }, Kerala: { village: "Palakkad", region: "Kerala" }, "West Bengal": { village: "Burdwan", region: "West Bengal" }, Odisha: { village: "Cuttack", region: "Odisha" }, Assam: { village: "Jorhat", region: "Assam" }, Goa: { village: "Ponda", region: "Goa" } };
  const selectedLocation = locationByState[selectedState.state] ?? { village: "Your village", region: selectedState.state };

  const selectedCow = cows.find((cow) => cow.id === selectedCowId) ?? cows[0];
  const queuedReadings = queuedCowIds.length;

  useEffect(() => {
    let timeout: number | undefined;
    const drainBattery = () => {
      setCows((current) => current.map((cow) => {
        const drain = Math.random() < 0.7 ? 1 : 0;
        const battery = Math.max(8, cow.sensor.battery - drain);
        const state = cow.sensor.state === "stale" ? "stale" : battery < 15 ? "low-battery" : cow.sensor.state;
        return battery === cow.sensor.battery && state === cow.sensor.state ? cow : { ...cow, sensor: { ...cow.sensor, battery, state } };
      }));
      scheduleNextDrain();
    };

    const scheduleNextDrain = () => {
      if (document.visibilityState === "visible") timeout = window.setTimeout(drainBattery, 25000);
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") scheduleNextDrain();
      else if (timeout !== undefined) window.clearTimeout(timeout);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    scheduleNextDrain();

    fetch("/api/model-status")
      .then((res) => res.json())
      .then((data) => {
        if (data.modelUpdates != null) setModelUpdates(data.modelUpdates);
      })
      .catch(() => {});

    return () => {
      if (timeout !== undefined) window.clearTimeout(timeout);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const activeAlerts = alerts.filter((alert) => alert.validation === "active");
  const farmStats = useMemo(() => {
    const connectedSensors = cows.filter((cow) => cow.sensor.state === "connected").length;
    const notRespondingSensors = cows.filter((cow) => cow.sensor.state === "stale").length;
    const lowBatterySensors = cows.filter((cow) => cow.sensor.state === "low-battery").length;
    const trendLength = Math.min(14, Math.max(7, ...cows.map((cow) => cow.history.length), 7));
    const trend = Array.from({ length: trendLength }, (_, offset) => {
      const values = cows.map((cow) => cow.history[cow.history.length - trendLength + offset]).filter((value): value is number => typeof value === "number");
      return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
    });
    const resolvedAlerts = alerts.filter((alert) => ["confirmed", "false-alarm", "resolved"].includes(alert.validation));
    const latestResolved = resolvedAlerts[0];
    let daysSinceResolved: number | null = null;
    if (latestResolved) {
      if (latestResolved.date === "Today") daysSinceResolved = 0;
      else if (latestResolved.date === "Yesterday") daysSinceResolved = 1;
      else {
        const match = latestResolved.date.match(/^Sep\s+(\d+)/);
        if (match) daysSinceResolved = Math.max(0, 6 - Number(match[1]));
      }
    }
    const attentionCount = cows.filter((cow) => cow.risk !== "low").length;
    const dueCows = cows.filter((cow) => !cow.checked.startsWith("Today") && !cow.checked.startsWith("Just now"));
    const readingsTaken = cows.filter((cow) => cow.checked.startsWith("Today") || cow.checked.startsWith("Just now")).length;
    const alertsRaised = alerts.filter((alert) => alert.date === "Today" || alert.date === "Yesterday").length;
    const alertsResolved = resolvedAlerts.length;
    return { connectedSensors, notRespondingSensors, lowBatterySensors, trend, daysSinceResolved, attentionCount, dueCows, readingsTaken, alertsRaised, alertsResolved };
  }, [alerts, cows]);
  const sortedCows = useMemo(() => {
    if (!sortRisk) return cows;
    const weight = { high: 0, medium: 1, low: 2 };
    return [...cows].sort((a, b) => weight[a.risk] - weight[b.risk]);
  }, [cows, sortRisk]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const openCow = (id: string) => {
    setSelectedCowId(id);
    setView("cow");
  };

  const prepareReading = (cow: Cow, deductBattery: boolean) => {
    const ecDrift = deductBattery ? (cow.id === "cow-1" ? 0.08 : (Math.random() - 0.5) * 0.1) : 0;
    const tempDrift = deductBattery ? (cow.id === "cow-1" ? 0.02 : (Math.random() - 0.5) * 0.05) : 0;
    const battery = deductBattery ? Math.max(8, cow.sensor.battery - 1) : cow.sensor.battery;
    const state = cow.sensor.state === "stale" ? "stale" : battery < 15 ? "low-battery" as SensorState : cow.sensor.state;
    return {
      ...cow,
      sensor: {
        ...cow.sensor,
        ec: Number((cow.sensor.ec + ecDrift).toFixed(2)),
        temperature: Number((cow.sensor.temperature + tempDrift).toFixed(1)),
        battery,
        state,
        lastContact: deductBattery ? cow.sensor.lastContact : "Just now",
      },
    };
  };

  const syncCows = async (targets: Cow[], deductBattery: boolean) => {
    if (targets.length === 0) return true;
    const updatedCows = targets.map((cow) => prepareReading(cow, deductBattery));
    try {
      const response = await fetch("/api/predict-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cows: updatedCows.map((cow) => ({ id: cow.id, ec: cow.sensor.ec, temperature: cow.sensor.temperature })),
        }),
      });
      if (!response.ok) throw new Error("API error");
      const { results } = await response.json();
      const predictedCows = updatedCows.map((cow) => {
        const prediction = results.find((r: { id: string }) => r.id === cow.id);
        if (!prediction) return cow;
        const score = prediction.score;
        const risk: Risk = prediction.risk;
        const newHistory = [...cow.history.slice(1), score];
        const forecast = getRiskForecast(newHistory);
        const recommendation = generateRecommendation(risk, prediction.probability, forecast.trend, score);
        return { ...cow, score, risk, probability: prediction.probability, checked: "Just now", recommendation, history: newHistory };
      });
      setCows((current) => current.map((cow) => predictedCows.find((next) => next.id === cow.id) ?? cow));
      setLastSynced("just now");

      const learnResults = await Promise.all(predictedCows.map((cow) =>
        fetch("/api/learn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ec: cow.sensor.ec, temperature: cow.sensor.temperature, label: cow.risk === "high" ? 1 : 0 }),
        }).then((result) => {
          if (!result.ok) throw new Error("API error");
          return result.json();
        }).catch(() => null)
      ));
      const lastResult = learnResults.filter(Boolean).pop();
      if (lastResult?.modelUpdates != null) setModelUpdates(lastResult.modelUpdates);
      return true;
    } catch {
      showToast("Couldn't reach the server - check your connection and try again");
      // Keep the existing local fallback, but apply it to every selected cow when the API is unavailable.
      setCows((current) => current.map((cow) => {
        const updated = updatedCows.find((next) => next.id === cow.id);
        if (!updated) return cow;
        const score = Math.min(92, cow.score + 3);
        const risk: Risk = score >= 70 ? "high" : cow.risk;
        const newHistory = [...cow.history.slice(1), score];
        const forecast = getRiskForecast(newHistory);
        return { ...updated, score, risk, checked: "Just now", history: newHistory, recommendation: generateRecommendation(risk, null, forecast.trend, score) };
      }));
      setLastSynced("just now");
      return false;
    }
  };

  const runReading = async () => {
    if (checking) return;
    setChecking(true);

    if (offline) {
      window.setTimeout(() => {
        setCows((current) => current.map((cow) => prepareReading(cow, true)));
        setQueuedCowIds((current) => Array.from(new Set([...current, ...cows.map((cow) => cow.id)])));
        setChecking(false);
        showToast(`${cows.length} ${localizedExtras[lang].queuedReadings}`);
      }, 1700);
      return;
    }

    const synced = await syncCows(cows, true);
    setChecking(false);
    if (synced) {
      const highRiskCow = cows.find((cow) => cow.risk === "high");
      showToast(`${ui.readingsTaken}${highRiskCow ? ` · ${highRiskCow.name} ${ui.advisoryHigh}` : ""}`);
    }
  };

  const toggleConnectivity = async () => {
    if (offline) {
      setOffline(false);
      const idsToSync = queuedCowIds;
      if (idsToSync.length > 0) {
        setChecking(true);
        const queued = cows.filter((cow) => idsToSync.includes(cow.id)).map((cow) => ({ ...cow, sensor: { ...cow.sensor, lastContact: "Just now" } }));
        const synced = await syncCows(queued, false);
        setChecking(false);
        if (synced) {
          setQueuedCowIds([]);
          showToast(`${idsToSync.length} ${localizedExtras[lang].syncedReadings}`);
        }
      } else showToast(localizedExtras[lang].backOnline);
    } else {
      setOffline(true);
      showToast(localizedExtras[lang].offlineOn);
    }
  };

  const updateCowOnReview = (cowId: string, validation: Validation) => {
    setCows((prev) =>
      prev.map((c) => {
        if (c.id !== cowId) return c;
        if (validation === "confirmed") {
          return {
            ...c,
            treatmentStatus: "under-treatment",
            recommendation: localizedCopy[lang].underTreatmentRec || "Under vet treatment and active observation.",
          };
        } else if (validation === "false-alarm") {
          return {
            ...c,
            risk: "low",
            score: 22,
            probability: 0.12,
            treatmentStatus: "none",
            recommendation: localizedCopy[lang].noAction || "No action needed — monitor as usual.",
          };
        }
        return c;
      })
    );
  };

  const validateAlert = (alertId: string, validation: Validation, suppressToast = false) => {
    const targetAlert = alerts.find((a) => a.id === alertId);
    setAlerts((current) => current.map((alert) => alert.id === alertId ? { ...alert, validation } : alert));
    if (targetAlert) {
      updateCowOnReview(targetAlert.cowId, validation);
    }
    if (!suppressToast) {
      showToast(validation === "confirmed" ? (localizedExtras[lang].vetConfirmedToast) : (localizedExtras[lang].falseAlarmToast));
    }
  };

  const resolveVetReview = async (cowId: string, validation: "confirmed" | "false-alarm") => {
    const cow = cows.find((item) => item.id === cowId);
    if (!cow) return;
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
      const data = await response.json();
      if (data.modelUpdates != null) setModelUpdates(data.modelUpdates);
    } catch {
      apiSuccess = false;
      showToast("Couldn't reach the server - check your connection and try again");
    } finally {
      setVetLoadingId(null);
    }

    const existing = alerts.find((item) => item.cowId === cowId && item.validation === "active");
    if (existing) {
      validateAlert(existing.id, validation, !apiSuccess);
    } else {
      const reviewItem: AlertItem = {
        id: `review-${cowId}-${Date.now()}`,
        cowId,
        date: "Today",
        time: "Just now",
        risk: cow.risk,
        title: `${cow.name} reviewed by vet`,
        body: validation === "confirmed" ? "Vet confirmed this case." : "Vet marked this as a false alarm.",
        validation,
      };
      setAlerts((current) => [reviewItem, ...current]);
      updateCowOnReview(cowId, validation);
      if (apiSuccess) {
        showToast(validation === "confirmed" ? (localizedExtras[lang].vetConfirmedToast) : (localizedExtras[lang].falseAlarmToast));
      }
    }
    setReviewingCowId(null);
  };

  const renderVetAction = (cow: Cow, hasResolvedAlert: boolean) => {
    if (hasResolvedAlert) return <span className="reviewed"><Check size={14} /> {text.reviewed}</span>;
    if (reviewingCowId === cow.id) {
      const isConfirmLoading = vetLoadingId === `${cow.id}-confirmed`;
      const isFalseLoading = vetLoadingId === `${cow.id}-false-alarm`;
      const isAnyLoading = vetLoadingId !== null;
      return (
        <div className="review-inline" onClick={(event) => event.stopPropagation()}>
          <button className="tiny-action confirm" onClick={() => resolveVetReview(cow.id, "confirmed")} disabled={isAnyLoading} aria-label={text.confirm}>
            {isConfirmLoading ? <RefreshCw size={12} className="spin" /> : text.confirm}
          </button>
          <button className="tiny-action false" onClick={() => resolveVetReview(cow.id, "false-alarm")} disabled={isAnyLoading} aria-label={text.falseAlarmAction}>
            {isFalseLoading ? <RefreshCw size={12} className="spin" /> : text.falseAlarmAction}
          </button>
          <button className="review-cancel" onClick={() => setReviewingCowId(null)} disabled={isAnyLoading} aria-label={ui.close}>{ui.close}</button>
        </div>
      );
    }
    return <button className="tiny-action review" onClick={(event) => { event.stopPropagation(); setReviewingCowId(cow.id); }} aria-label={`${text.review} ${cow.name}`}><Search size={14} /> {text.review}</button>;
  };

  const setFarmerHome = () => {
    setMode("farmer");
    setView("home");
  };

  const renderFarmerHome = () => (
    <>
      <section className="welcome-row">
        <div>
          <p className="eyebrow"><Sun size={15} /> {ui.dateToday}</p>
          <h1>{text.greeting}</h1>
          <p className="subtitle">{text.subtitle}</p>
        </div>
        <div className="sun-note"><span className="sun-circle"><Sun size={20} /></span><span>28°<small>{selectedLocation.village}, {selectedLocation.region}</small></span></div>
      </section>

      <section className="hero-card">
        <div className="hero-copy">
          <div className="hero-kicker"><Sparkles size={15} /> {surface.earlyWarning}</div>
          <h2>{surface.heroLineOne}<br /><em>{surface.heroLineTwo}</em></h2>
          <p>{surface.heroBody}</p>
          <button className="primary-button hero-button" onClick={runReading} disabled={checking}>
            {checking ? <><RefreshCw size={18} className="spin" /> {text.checking}</> : <><ScanLine size={18} /> {text.checkCows}</>}
          </button>
        </div>
        <div className="hero-art" aria-hidden="true"><div className="sun-disc" /><div className="field-line field-one" /><div className="field-line field-two" /><div className="cow-doodle">🐄</div><span className="art-leaf leaf-one">✦</span><span className="art-leaf leaf-two">✦</span></div>
      </section>

      <div className="summary-grid">
        <div className="summary-card"><span className="summary-icon green"><CheckCircle2 size={18} /></span><div><strong>{cows.length}</strong><span>{text.monitored}</span></div></div>
        <div className="summary-card"><span className="summary-icon red"><CircleAlert size={18} /></span><div><strong>{activeAlerts.length}</strong><span>{text.attention}</span></div></div>
        <div className="summary-card"><span className="summary-icon green"><Activity size={18} /></span><div><strong>{cows.filter((cow) => cow.risk === "low").length}</strong><span>{text.healthy}</span></div></div>
      </div>

      <div className="telemetry-footnote" style={{ marginTop: "0.75rem", marginBottom: "0.75rem" }}>
        <Sparkles size={14} /> {surface.modelNote}: <strong>{modelUpdates}</strong> · {ui.demoDerived}.
      </div>

      {activeAlerts.length > 0 && <button className="attention-banner" onClick={() => { setSelectedCowId(activeAlerts[0].cowId); setView("cow"); }}><span className="attention-symbol"><Bell size={18} /></span><span><strong>{`Lakshmi ${ui.advisoryHigh}`}</strong><small>{trendBodyByLanguage[lang]}</small></span><ChevronRight size={20} /></button>}

      <div className="section-heading"><div><p className="eyebrow">{text.home}</p><h2>{text.home}</h2></div><button className="text-button" onClick={() => setView("alerts")}>{text.activeAlerts} <ChevronRight size={16} /></button></div>
      <div className="cow-list">{sortedCows.map((cow) => <CowCard key={cow.id} cow={cow} lang={lang} onClick={() => openCow(cow.id)} />)}</div>
    </>
  );

  const renderFarmOverview = () => {
    const trendPoints = farmStats.trend.map((value, index) => { const x = 12 + (index * 376) / Math.max(farmStats.trend.length - 1, 1); const y = 112 - (value / 100) * 88; return `${x},${y}`; });
    const highCow = cows.find((cow) => cow.risk === "high");
    const mediumCow = cows.find((cow) => cow.risk === "medium");
    const advisory = highCow ? `${highCow.name} ${ui.advisoryHigh}` : mediumCow ? `${mediumCow.name} ${ui.advisoryMedium}` : ui.advisoryGood;
    const summary = farmStats.attentionCount === 0 ? ui.advisoryGood : `${farmStats.attentionCount} ${farmStats.attentionCount === 1 ? "cow" : "cows"} ${ui.advisoryHigh}`;
    return <>
      <button className="back-button" onClick={() => setView("home")}><ArrowLeft size={18} /> {text.home}</button>
      <section className="page-heading farm-page-heading"><div><p className="eyebrow"><Leaf size={15} /> {ui.farmerOverview}</p><h1>{ui.farmTitle}</h1><p className="subtitle">{ui.farmSubtitle}</p></div><span className="farm-summary-pill"><CheckCircle2 size={15} /> {summary}</span></section>
      <section className="farm-summary-grid"><div className="farm-stat-card"><span className="farm-stat-icon green"><Activity size={20} /></span><div><strong>{cows.length}</strong><span>{ui.cowsRegisteredStat}</span><small>{ui.currentHerd}</small></div></div><div className="farm-stat-card"><span className="farm-stat-icon green"><Signal size={20} /></span><div><strong>{farmStats.connectedSensors}</strong><span>{ui.sensorsConnected}</span><small>{farmStats.notRespondingSensors} {ui.sensorsNotResponding}</small></div></div><div className="farm-stat-card"><span className="farm-stat-icon ochre"><BatteryMedium size={20} /></span><div><strong>{farmStats.lowBatterySensors}</strong><span>{ui.lowBattery}</span><small>{ui.watchSensors}</small></div></div></section>
      <section className="panel farm-advisory-panel"><div className="panel-heading"><span className="panel-icon"><ShieldCheck size={19} /></span><div><p className="eyebrow">{ui.advisory}</p><h2>{advisory}</h2></div></div><p className="farm-muted">{ui.demoDerived}</p></section>
      <div className="farm-content-grid"><section className="panel farm-trend-panel"><div className="panel-heading"><span className="panel-icon"><TrendingUp size={19} /></span><div><p className="eyebrow">{ui.herdTrend}</p><h2>{ui.averageRisk}</h2></div><span className="farm-trend-value">{farmStats.trend[farmStats.trend.length - 1] ?? 0}/100</span></div><div className="farm-trend-chart"><svg viewBox="0 0 400 130" role="img" aria-label={ui.averageRisk} preserveAspectRatio="none"><line x1="12" x2="388" y1="24" y2="24" className="chart-grid" /><line x1="12" x2="388" y1="68" y2="68" className="chart-grid" /><line x1="12" x2="388" y1="112" y2="112" className="chart-grid" /><polyline points={trendPoints.join(" ")} className="chart-line" />{trendPoints.map((point, index) => { const [x, y] = point.split(","); return <circle key={index} cx={x} cy={y} r={index === trendPoints.length - 1 ? 5 : 2.5} className={index === trendPoints.length - 1 ? "chart-point chart-point-final" : "chart-point"} />; })}</svg><div className="chart-axis"><span>{farmStats.trend.length} {ui.days} ago</span><span>7 {ui.days}</span><span>{text.todayAt}</span></div></div><p className="farm-muted">{ui.farmTrendNote}</p></section><section className="panel farm-activity-panel"><div className="panel-heading"><span className="panel-icon"><CalendarDays size={19} /></span><div><p className="eyebrow">{ui.recentCare}</p><h2>{ui.lastResolved}</h2></div></div><strong className="farm-activity-value">{farmStats.daysSinceResolved === null ? ui.noResolved : farmStats.daysSinceResolved === 0 ? text.todayAt : `${farmStats.daysSinceResolved} ${farmStats.daysSinceResolved === 1 ? ui.dayAgo : ui.daysAgo}`}</strong><p className="farm-muted">{ui.basedOnAlerts}</p><div className="farm-watch-note"><BatteryCharging size={17} /><span><strong>{ui.sensorWatch}</strong><small>{farmStats.connectedSensors} {ui.sensorsConnected} · {farmStats.lowBatterySensors} {ui.lowBattery} · {farmStats.notRespondingSensors} {ui.sensorsNotResponding}</small></span></div></section></div>
      <div className="farm-detail-grid"><section className="panel"><div className="panel-heading"><span className="panel-icon"><Clock3 size={19} /></span><div><p className="eyebrow">{ui.dueChecks}</p><h2>{ui.dueChecksBody}</h2></div></div>{farmStats.dueCows.length === 0 ? <p className="farm-muted">{ui.allChecked}</p> : <div className="due-cow-list">{farmStats.dueCows.map((cow) => <button className="due-cow-row" key={cow.id} onClick={() => openCow(cow.id)}><span><strong>{cow.name}</strong><small>{cow.tag} · {cow.checked}</small></span><span>{ui.checkNow} <ChevronRight size={16} /></span></button>)}</div>}</section><section className="panel"><div className="panel-heading"><span className="panel-icon"><Activity size={19} /></span><div><p className="eyebrow">{ui.thisWeek}</p><h2>{ui.demoDerived}</h2></div></div><div className="farm-week-grid"><div><strong>{farmStats.readingsTaken}</strong><span>{ui.readingsTaken}</span></div><div><strong>{farmStats.alertsRaised}</strong><span>{ui.alertsRaised}</span></div><div><strong>{farmStats.alertsResolved}</strong><span>{ui.alertsResolved}</span></div></div></section></div>
      <section className="panel farm-quick-panel"><div className="panel-heading"><span className="panel-icon"><Sparkles size={19} /></span><h2>{ui.quickAccess}</h2></div><div className="farm-quick-actions"><button className="outline-button" onClick={() => setView("alerts")}><Bell size={17} /> {ui.openAlerts}</button><button className="outline-button" onClick={() => setContactOpen(true)}><Stethoscope size={17} /> {ui.contactVet}</button><button className="primary-button" onClick={runReading}><ScanLine size={17} /> {text.checkCows}</button></div></section>
    </>;
  };

  const renderProfile = () => {
    const sensorCount = cows.filter((cow) => cow.sensor != null).length;
    const focusLanguagePicker = () => { document.querySelector<HTMLSelectElement>(".topbar .state-picker")?.focus(); showToast(ui.useStatePicker); };
    return <><button className="back-button" onClick={() => setView("home")}><ArrowLeft size={18} /> {text.home}</button><section className="page-heading profile-page-heading"><div><p className="eyebrow"><UserRound size={15} /> {ui.farmerProfile}</p><h1>Sita Devi</h1><p className="subtitle">{ui.profileSubtitle}</p></div></section><section className="profile-layout"><div className="panel profile-identity-card"><div className="profile-large-avatar"><UserRound size={28} /></div><p className="eyebrow">{ui.farmerLabel}</p><h2>Sita Devi</h2><p className="profile-farm-name">Sita Devi’s Dairy</p><div className="profile-detail-list"><div><Phone size={17} /><span><small>{ui.phoneLabel}</small><strong>+91 98765 43210</strong></span></div><div><Leaf size={17} /><span><small>{ui.villageLabel}</small><strong>{selectedLocation.village}, {selectedLocation.region}</strong></span></div><div><CalendarDays size={17} /><span><small>{ui.memberSinceLabel}</small><strong>April 2024</strong></span></div></div></div><div className="profile-side-stack"><section className="panel profile-stats-card"><div className="panel-heading"><span className="panel-icon"><Activity size={19} /></span><div><p className="eyebrow">{ui.dairyLabel}</p><h2>{ui.registeredDevices}</h2></div></div><div className="profile-count-grid"><div><strong>{cows.length}</strong><span>{ui.cowsRegistered}</span></div><div><strong>{sensorCount}</strong><span>{ui.sensorDevices}</span></div></div></section><section className="panel profile-language-card"><div className="panel-heading"><span className="panel-icon"><Languages size={19} /></span><div><p className="eyebrow">{ui.currentPreference}</p><h2>{selectedState.native} · {selectedState.languageLabel}</h2></div></div><p className="farm-muted">{ui.languageHelp}</p><button className="outline-button" onClick={focusLanguagePicker}><Languages size={16} /> {ui.changeLanguage}</button></section></div></section></>;
  };

  const renderCowDetail = () => (
    <>
      <button className="back-button" onClick={() => setView("home")}><ArrowLeft size={18} /> {text.home}</button>
      <section className={`detail-header ${selectedCow.treatmentStatus === "under-treatment" ? "detail-treatment" : `detail-${selectedCow.risk}`}`}>
        <div className="detail-heading"><div className={`cow-avatar avatar-${selectedCow.risk} avatar-large`}>🐄</div><div><p className="eyebrow">{selectedCow.tag} · {selectedCow.breed}</p><h1>{selectedCow.name}</h1><p>{selectedCow.farm}</p></div></div>
        <div className="detail-status"><StatusPill risk={selectedCow.risk} lang={lang} treatmentStatus={selectedCow.treatmentStatus} /><SensorStatus cow={selectedCow} lang={lang} /></div>
      </section>
      <div className="detail-grid">
        <div className="detail-main">
          <section className="panel recommendation-panel"><div className="panel-heading"><span className="panel-icon"><ShieldCheck size={19} /></span><div><p className="eyebrow">{text.recommendation}</p><h2>{selectedCow.risk === "high" ? (text.recommendation) : selectedCow.risk === "medium" ? (text.recommendation) : (text.noAction)}</h2></div></div><p className="recommendation-copy">{selectedCow.recommendation}</p><div className="checked-row"><Clock3 size={15} /> {selectedCow.checked} <span>•</span> <span className="demo-chip">{text.demoNote}</span></div>{selectedCow.risk === "high" && <button className="outline-button" onClick={() => setContactOpen(true)}><Stethoscope size={17} /> {ui.contactVet}</button>}</section>
          <section className="panel telemetry-panel"><div className="telemetry-heading"><div><p className="eyebrow"><Activity size={14} /> {surface.simulatedFeed}</p><h2>{surface.milkCheck}</h2></div><span className="telemetry-honesty">{surface.hardwareNote}</span></div><div className="telemetry-grid"><TelemetryCard icon={<Activity size={18} />} label={surface.conductivity} value={`${selectedCow.sensor.ec.toFixed(2)} mS/cm`} note={surface.conductivityNote} className={selectedCow.risk === "high" ? "telemetry-abnormal" : ""} /><TelemetryCard icon={<Sun size={18} />} label={surface.temperature} value={`${selectedCow.sensor.temperature.toFixed(1)} °C`} note={surface.temperatureNote} /><TelemetryCard icon={selectedCow.sensor.battery < 15 ? <BatteryLow size={18} /> : selectedCow.sensor.battery < 40 ? <BatteryMedium size={18} /> : <BatteryCharging size={18} />} label={surface.battery} value={`${selectedCow.sensor.battery}%`} note={selectedCow.sensor.battery < 15 ? ui.sensorLow : surface.batteryNote} className={selectedCow.sensor.battery < 15 ? "telemetry-low" : ""} /></div>{selectedCow.sensor.state === "stale" && <div className="sensor-warning"><CloudOff size={16} /><span><strong>{surface.staleNote}</strong><small>{selectedCow.sensor.lastContact}. {ui.checkNow}</small></span></div>}<div className="telemetry-footnote"><Info size={14} /> {surface.telemetryNote}</div></section>
          <section className="panel"><div className="section-heading panel-section-heading"><div><p className="eyebrow">{text.history}</p><h2>{text.trendTitle}</h2></div><span className="trend-badge"><TrendingUp size={15} /> +{selectedCow.history[selectedCow.history.length - 1] - selectedCow.history[selectedCow.history.length - 6]} in 5 days</span></div><TrendChart cow={selectedCow} large /><div className="chart-caption"><span><i className="legend-dot" /> Risk score (0–100)</span><span>{trendBodyByLanguage[lang]}</span></div></section>
        </div>
        <aside className="detail-side"><div className="mini-metric"><span className="mini-icon"><ScanLine size={18} /></span><div><strong>{selectedCow.score}<small>/100</small></strong><span>{ui.riskScoreToday}</span></div></div>{selectedCow.probability != null && <div className="mini-metric"><span className="mini-icon"><Activity size={18} /></span><div><strong>{Math.round(selectedCow.probability * 100)}<small>%</small></strong><span>{ui.infectionProbability}</span></div></div>}<div className="mini-metric"><span className="mini-icon"><CalendarDays size={18} /></span><div><strong>14 <small>{ui.days}</small></strong><span>{ui.continuousHistory}</span></div></div><div className="tip-card"><Sparkles size={19} /><div><strong>{ui.modelRisk}</strong><p>{ui.modelRiskBody}</p></div></div></aside>
      </div>
    </>
  );

  const renderAlerts = () => {
    const visibleAlerts = alerts.filter((alert) => alertFilter === "all" || alert.risk === "high");
    return <>
      <section className="page-heading"><div><p className="eyebrow"><Bell size={15} /> {text.activeAlerts}</p><h1>{text.alerts}</h1><p className="subtitle">{ui.alertSubtitle}</p></div><div className="filter-tabs"><button className={alertFilter === "all" ? "active" : ""} onClick={() => setAlertFilter("all")}>{text.allAlerts}</button><button className={alertFilter === "high" ? "active" : ""} onClick={() => setAlertFilter("high")}><span className="filter-dot" />{text.highOnly}</button></div></section>
      <div className="alert-feed">{visibleAlerts.length === 0 ? <EmptyState lang={lang} /> : visibleAlerts.map((alert) => { const cow = cows.find((item) => item.id === alert.cowId)!; return <button className="alert-row" key={alert.id} onClick={() => openCow(alert.cowId)}><div className={`alert-severity severity-${alert.risk}`}><span /></div><div className="alert-row-main"><div className="alert-row-top"><strong>{alert.title}</strong><span>{alert.date} · {alert.time}</span></div><p>{alert.body}</p><div className="alert-row-bottom"><StatusPill risk={alert.risk} lang={lang} compact /><span className={`validation-label ${alert.validation}`}>{alert.validation === "active" ? text.activeAlert : alert.validation === "resolved" ? text.resolved : text.falseAlarm}</span><span className="alert-cow">{cow.tag}</span></div></div><ChevronRight size={19} /></button>; })}</div>
      <div className="routine-card"><span className="routine-icon"><Check size={18} /></span><div><strong>{ui.routineTitle}</strong><p>{ui.routineBody}</p></div></div>
    </>;
  };

  const renderVetDashboard = () => {
    const query = searchQuery.trim().toLowerCase();
    const vetCows = [...cows].filter((cow) => !query || `${cow.name} ${cow.tag} ${cow.farm} ${cow.risk}`.toLowerCase().includes(query)).sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.risk] - ({ high: 0, medium: 1, low: 2 }[b.risk])));

    // Group per-farm risk distribution
    const farmDist = cows.reduce((acc, cow) => {
      const farmName = cow.farm.replace("’s Dairy", " Dairy");
      if (!acc[farmName]) acc[farmName] = { high: 0, medium: 0, low: 0, total: 0 };
      acc[farmName][cow.risk] += 1;
      acc[farmName].total += 1;
      return acc;
    }, {} as Record<string, { high: number; medium: number; low: number; total: number }>);

    const weeklyTrend = [
      { day: "Mon", count: 4, high: true },
      { day: "Tue", count: 3, high: true },
      { day: "Wed", count: 2, high: false },
      { day: "Thu", count: 5, high: true },
      { day: "Fri", count: 2, high: false },
      { day: "Sat", count: 1, high: false },
      { day: "Sun", count: 1, high: false },
    ];

    return <>
      <section className="vet-intro"><div><p className="eyebrow"><Stethoscope size={15} /> {text.cooperativeDesk}</p><h1>{text.herdOverview}</h1><p className="subtitle">{text.herdOverviewBody}</p></div><div className="vet-intro-meta"><span className="phase-badge">{text.phaseTwo}</span><div className="vet-date"><CalendarDays size={16} /> {text.weekLabel}</div></div></section>

      <div className="coop-summary-bar">
        <div className="coop-summary-main">
          <Leaf size={18} style={{ color: "var(--green)" }} />
          <span>{ui.hassanCoopDesk}</span>
        </div>
        <div className="coop-summary-stats">
          <span><strong>12</strong> {ui.registeredFarms}</span>
          <span><strong>42</strong> {ui.activeAnimals}</span>
          <span><strong style={{ color: "var(--green)" }}>94.2%</strong> {ui.telemetrySyncRate}</span>
          <span className="coop-summary-pill">3 {ui.subclinicalFlags}</span>
        </div>
      </div>

      <div className="vet-summary-grid"><div className="vet-stat"><span className="vet-stat-icon green"><Activity size={19} /></span><div><strong>42</strong><span>{text.animals}</span><small>+6 this month</small></div></div><div className="vet-stat"><span className="vet-stat-icon red"><CircleAlert size={19} /></span><div><strong>3</strong><span>{text.farmsFlagged}</span><small>{text.needsFollowup}</small></div></div><div className="vet-stat"><span className="vet-stat-icon yellow"><ShieldCheck size={19} /></span><div><strong>2</strong><span>{text.casesMonth}</span><small>{text.treatedEarly}</small></div></div><div className="vet-stat"><span className="vet-stat-icon purple"><TrendingUp size={19} /></span><div><strong>94%</strong><span>{text.readingCompletion}</span><small>{text.acrossFarms}</small></div></div></div>
      <div className="vet-content-grid"><section className="panel vet-table-panel"><div className="section-heading panel-section-heading"><div><p className="eyebrow">{text.priorityList}</p><h2>{text.animalsToReview}</h2></div><div className="table-actions">{searchOpen && <input autoFocus className="vet-search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder={ui.searchAnimals} aria-label={ui.searchAnimals} />}<button className={`table-filter ${sortRisk ? "active" : ""}`} onClick={() => setSortRisk(!sortRisk)}><TrendingUp size={15} /> {text.sortRisk}</button><button className="icon-button" aria-label="Search" onClick={() => { setSearchOpen(!searchOpen); if (searchOpen) setSearchQuery(""); }}><Search size={17} /></button></div></div><div className="table-wrap"><table><thead><tr><th>{text.tableAnimal}</th><th>{text.tableFarm}</th><th>{text.tableRisk}</th><th>{text.lastReading}</th><th>{text.tableAction}</th></tr></thead><tbody>{vetCows.length === 0 ? <tr><td colSpan={5}>{text.noAnimalsMatch} “{searchQuery}”.</td></tr> : vetCows.map((cow) => { const hasResolvedAlert = alerts.some((item) => item.cowId === cow.id && ["confirmed", "false-alarm", "resolved"].includes(item.validation)); return <tr key={cow.id} onClick={() => openCow(cow.id)}><td><div className="table-animal"><span className={`table-cow-dot dot-${cow.risk}`}>🐄</span><span><strong>{cow.name}</strong><small>{cow.tag}</small></span></div></td><td><span className="farm-name">{cow.farm.replace("’s Dairy", " Dairy")}</span></td><td><StatusPill risk={cow.risk} lang={lang} compact treatmentStatus={cow.treatmentStatus} /></td><td><span className="reading-time">{cow.checked}</span></td><td>{renderVetAction(cow, hasResolvedAlert)}</td></tr>; })}</tbody></table></div></section><section className="panel vet-trend-panel"><div className="section-heading panel-section-heading"><div><p className="eyebrow">{text.selectedAnimal}</p><h2>{selectedCow.name} <span>{selectedCow.tag}</span></h2></div><button className="icon-button" onClick={() => openCow(selectedCow.id)}><ChevronRight size={17} /></button></div><div className="vet-trend-card"><div className="vet-trend-top"><StatusPill risk={selectedCow.risk} lang={lang} compact treatmentStatus={selectedCow.treatmentStatus} /><strong>{selectedCow.score}<small>/100</small></strong></div><TrendChart cow={selectedCow} large showDetail /><p>{text.riskChartNote}</p></div><div className="vet-callout"><ShieldCheck size={17} /><span>Vet-in-the-loop validation improves the next reading.</span></div></section></div>

      <div className="vet-depth-grid">
        <section className="farm-dist-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{ui.cooperativeOverview}</p>
              <h3>{ui.perFarmRiskDist}</h3>
            </div>
          </div>
          <div className="farm-dist-list">
            {Object.entries(farmDist).map(([farmName, counts]) => {
              const highPct = (counts.high / counts.total) * 100;
              const medPct = (counts.medium / counts.total) * 100;
              const lowPct = (counts.low / counts.total) * 100;
              return (
                <div key={farmName} className="farm-dist-item">
                  <div className="farm-dist-header">
                    <span>{farmName}</span>
                    <small>{counts.high > 0 ? `${counts.high} ${ui.highRisk}` : counts.medium > 0 ? `${counts.medium} ${ui.medRisk}` : ui.allLowRisk}</small>
                  </div>
                  <div className="farm-dist-bar-track">
                    {counts.high > 0 && <div className="farm-dist-segment high" style={{ width: `${highPct}%` }} />}
                    {counts.medium > 0 && <div className="farm-dist-segment medium" style={{ width: `${medPct}%` }} />}
                    {counts.low > 0 && <div className="farm-dist-segment low" style={{ width: `${lowPct}%` }} />}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="farm-dist-legend">
            <span><strong style={{ color: "#e54d42" }}>●</strong> {ui.highRisk}</span>
            <span><strong style={{ color: "#e09f19" }}>●</strong> {ui.medRisk}</span>
            <span><strong style={{ color: "#2e8b57" }}>●</strong> {ui.normalRisk}</span>
          </div>

          <div style={{ marginTop: "1.25rem" }}>
            <div className="section-heading">
              <div>
                <p className="eyebrow">{ui.sevenDayTrajectory}</p>
                <h4 style={{ fontSize: "0.95rem", margin: 0 }}>{ui.weeklyAlertTrend}</h4>
              </div>
              <small style={{ color: "var(--green)", fontWeight: 700 }}>{ui.weeklyTrendChange}</small>
            </div>
            <div className="weekly-trend-box">
              {weeklyTrend.map((item) => (
                <div key={item.day} className="weekly-trend-col">
                  <div className={`weekly-trend-bar ${item.high ? "high-alert" : ""}`} style={{ height: `${item.count * 12}px` }} />
                  <span className="weekly-trend-label">{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="transparency-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{ui.explainableAi}</p>
              <h3>{ui.featureTransparencyPanel}</h3>
            </div>
          </div>
          <p style={{ fontSize: "0.78rem", color: "var(--muted)", margin: "0.25rem 0 0.75rem", lineHeight: 1.4 }}>
            {ui.transparencyIntro}
          </p>

          <div className="feature-weights-list">
            <div className="feature-weight-item">
              <div className="feature-weight-info">
                <span>{ui.conductivityFeatureName}</span>
                <span style={{ color: "var(--green)", fontWeight: 600, fontSize: "0.75rem" }}>{ui.conductivityFeatureRole}</span>
              </div>
              <span className="feature-weight-desc">{ui.conductivityFeatureDesc}</span>
            </div>

            <div className="feature-weight-item">
              <div className="feature-weight-info">
                <span>{ui.temperatureFeatureName}</span>
                <span style={{ color: "#2b6cb0", fontWeight: 600, fontSize: "0.75rem" }}>{ui.temperatureFeatureRole}</span>
              </div>
              <span className="feature-weight-desc">{ui.temperatureFeatureDesc}</span>
            </div>
          </div>

          <div style={{ marginTop: "1rem", padding: "0.75rem", background: "#f8f6f0", borderRadius: "10px", fontSize: "0.75rem", color: "#4f5a52" }}>
            {ui.vetFeedbackNote}
          </div>
        </section>
      </div>
    </>;
  };

  const renderAbout = () => <>
    <section className="about-hero"><div className="about-icon"><Leaf size={29} /></div><p className="eyebrow">Pashu Mitra · Healthy connections</p><h1>{text.aboutTitleLine1}<br /><em>{text.aboutTitleLine2}</em></h1><p>{text.aboutBody}</p></section>
    <div className="how-grid"><div className="how-card"><span className="how-number">01</span><ScanLine size={24} /><h3>{text.howOneTitle}</h3><p>{text.howOneBody}</p></div><div className="how-card"><span className="how-number">02</span><TrendingUp size={24} /><h3>{text.howTwoTitle}</h3><p>{text.howTwoBody}</p></div><div className="how-card"><span className="how-number">03</span><Stethoscope size={24} /><h3>{text.howThreeTitle}</h3><p>{text.howThreeBody}</p></div></div>
    <div className="about-note"><Info size={18} /><p><strong>{text.aboutNoteTitle}</strong> {text.aboutNoteBody}</p></div>
    <div className="pitch-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{ui.impactTechnologyRoadmap}</p>
          <h2>{ui.subclinicalIntelligenceEconomicProtection}</h2>
        </div>
      </div>
      <p className="pitch-intro">
        {ui.pitchIntro}
      </p>
      <div className="pitch-grid">
        <div className="pitch-card">
          <div className="pitch-card-header">
            <div className="pitch-card-icon"><Activity size={20} /></div>
            <span className="pitch-badge green">{ui.card1Badge}</span>
          </div>
          <h3>{ui.card1Title}</h3>
          <p>
            {ui.card1Body}
          </p>
          <ul className="pitch-list">
            <li><CheckCircle2 size={13} style={{ color: "var(--green)", flexShrink: 0, marginTop: 2 }} /> {ui.card1Bullet1}</li>
            <li><CheckCircle2 size={13} style={{ color: "var(--green)", flexShrink: 0, marginTop: 2 }} /> {ui.card1Bullet2}</li>
            <li><CheckCircle2 size={13} style={{ color: "var(--green)", flexShrink: 0, marginTop: 2 }} /> {ui.card1Bullet3}</li>
          </ul>
        </div>

        <div className="pitch-card">
          <div className="pitch-card-header">
            <div className="pitch-card-icon"><ShieldCheck size={20} /></div>
            <span className="pitch-badge blue">{ui.card2Badge}</span>
          </div>
          <h3>{ui.card2Title}</h3>
          <p>
            {ui.card2Body}
          </p>
          <ul className="pitch-list">
            <li><CheckCircle2 size={13} style={{ color: "var(--green)", flexShrink: 0, marginTop: 2 }} /> {ui.card2Bullet1}</li>
            <li><CheckCircle2 size={13} style={{ color: "var(--green)", flexShrink: 0, marginTop: 2 }} /> {ui.card2Bullet2}</li>
            <li><CheckCircle2 size={13} style={{ color: "var(--green)", flexShrink: 0, marginTop: 2 }} /> {ui.card2Bullet3}</li>
          </ul>
        </div>

        <div className="pitch-card">
          <div className="pitch-card-header">
            <div className="pitch-card-icon"><Sparkles size={20} /></div>
            <span className="pitch-badge">{ui.card3Badge}</span>
          </div>
          <h3>{ui.card3Title}</h3>
          <p>
            {ui.card3Body}
          </p>
          <ul className="pitch-list">
            <li><CheckCircle2 size={13} style={{ color: "var(--green)", flexShrink: 0, marginTop: 2 }} /> {ui.card3Bullet1}</li>
            <li><CheckCircle2 size={13} style={{ color: "var(--green)", flexShrink: 0, marginTop: 2 }} /> {ui.card3Bullet2}</li>
            <li><CheckCircle2 size={13} style={{ color: "var(--green)", flexShrink: 0, marginTop: 2 }} /> {ui.card3Bullet3}</li>
          </ul>
        </div>
      </div>
    </div>
  </>;

  return (
    <div className={`app-shell ${mode === "vet" ? "mode-vet" : ""}`}>
      <aside className="sidebar">
        <Logo onClick={setFarmerHome} />
        <div className="sidebar-switch"><span className="switch-label">{mode === "farmer" ? text.farmer : text.vet}</span><button onClick={() => { setMode(mode === "farmer" ? "vet" : "farmer"); setView(mode === "farmer" ? "vet" : "home"); }}><RefreshCw size={14} /> {mode === "farmer" ? text.switchToVet : text.switchToFarmer}</button></div>
        <nav className="side-nav" aria-label="Main navigation">
          <button className={view === "home" || view === "cow" ? "active" : ""} onClick={() => { setMode("farmer"); setView("home"); }}><span><Activity size={19} /></span>{text.home}</button>
          <button className={view === "farm" ? "active" : ""} onClick={() => { setMode("farmer"); setView("farm"); }}><span><Leaf size={19} /></span>{ui.farmTitle}</button>
          <button className={view === "alerts" ? "active" : ""} onClick={() => { setMode("farmer"); setView("alerts"); }}><span><Bell size={19} /><i>{activeAlerts.length}</i></span>{text.alerts}</button>
          <button className={view === "about" ? "active" : ""} onClick={() => { setMode("farmer"); setView("about"); }}><span><Info size={19} /></span>{text.about}</button>
        </nav>
        <div className="sidebar-foot"><button className="farmer-profile" onClick={() => { setMode("farmer"); setView("profile"); }}><span className="profile-avatar"><UserRound size={18} /></span><span><strong>Sita Devi</strong><small>Sita Devi’s Dairy</small></span><ChevronRight size={15} /></button><p className="offline-note"><span className="live-dot" /> {offline ? text.offline : text.online}</p></div>
      </aside>
      <main className="main-area">
        <header className="topbar"><div className="mobile-brand"><Logo onClick={setFarmerHome} /></div><div className="topbar-actions"><SyncBadge offline={offline} lang={lang} queued={queuedReadings} lastSynced={lastSynced} onToggle={toggleConnectivity} /><StatePicker selectedState={selectedState} onSelect={(next) => setSelectedStateName(next.state)} compact /><button className="mobile-menu" aria-label={text.menu} onClick={() => setDrawerOpen(true)}><Menu size={20} /></button></div></header>
        <div className="content-wrap">{mode === "vet" || view === "vet" ? renderVetDashboard() : view === "home" ? renderFarmerHome() : view === "farm" ? renderFarmOverview() : view === "profile" ? renderProfile() : view === "cow" ? renderCowDetail() : view === "alerts" ? renderAlerts() : renderAbout()}</div>
        <footer className="mobile-nav"><button className={view === "home" || view === "cow" ? "active" : ""} onClick={() => { setMode("farmer"); setView("home"); }}><Activity size={20} /><span>{text.home}</span></button><button className={view === "alerts" ? "active" : ""} onClick={() => { setMode("farmer"); setView("alerts"); }}><Bell size={20} /><span>{text.alerts}</span>{activeAlerts.length > 0 && <i>{activeAlerts.length}</i>}</button><button className={view === "about" ? "active" : ""} onClick={() => { setMode("farmer"); setView("about"); }}><Info size={20} /><span>{text.about}</span></button></footer>
      </main>
      {toast && <div className="toast" role="status"><CheckCircle2 size={17} /> {toast}</div>}
      {contactOpen && <VetContactModal lang={lang} location={selectedLocation} onClose={() => setContactOpen(false)} onCall={() => { setContactOpen(false); showToast(ui.callingVet); }} />}
      {drawerOpen && <MobileDrawer lang={lang} mode={mode} view={view} selectedState={selectedState} onClose={() => setDrawerOpen(false)} onView={(nextView) => { setMode("farmer"); setView(nextView); }} onMode={() => { const nextMode = mode === "farmer" ? "vet" : "farmer"; setMode(nextMode); setView(nextMode === "vet" ? "vet" : "home"); setDrawerOpen(false); }} onState={(next) => setSelectedStateName(next.state)} />}
    </div>
  );
}
