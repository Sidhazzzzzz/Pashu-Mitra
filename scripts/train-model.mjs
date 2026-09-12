import * as tf from '@tensorflow/tfjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ── 1. Load & parse CSV ──
const csv = fs.readFileSync(path.join(ROOT, 'cow_milk_mastitis_dataset.csv'), 'utf-8');
const lines = csv.trim().split('\n');
const headers = lines[0].split(',');
const rows = lines.slice(1).map(l => l.split(',').map(v => v.trim()));

// Features we use (drop Cow_ID which is an identifier, not a feature)
const FEATURE_COLS = ['Milk_Temperature', 'Milk_pH', 'Milk_Conductivity', 'Somatic_Cell_Count', 'Milk_Yield', 'Clotting', 'Day'];
const LABEL_COL = 'class1';

const featureIdxs = FEATURE_COLS.map(c => headers.indexOf(c));
const labelIdx = headers.indexOf(LABEL_COL);

const X = rows.map(r => featureIdxs.map(i => parseFloat(r[i])));
const y = rows.map(r => parseFloat(r[labelIdx]));

console.log(`Total samples: ${X.length}`);
console.log(`Class 0 (healthy): ${y.filter(v => v === 0).length}`);
console.log(`Class 1 (mastitis): ${y.filter(v => v === 1).length}`);

// ── 2. Stratified train/val/test split (60/20/20) ──
function stratifiedSplit(X, y, trainRatio, valRatio) {
  const c0 = [], c1 = [];
  X.forEach((x, i) => (y[i] === 0 ? c0 : c1).push({ x, y: y[i] }));

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  shuffle(c0);
  shuffle(c1);

  function splitGroup(group) {
    const n1 = Math.floor(group.length * trainRatio);
    const n2 = Math.floor(group.length * (trainRatio + valRatio));
    return [group.slice(0, n1), group.slice(n1, n2), group.slice(n2)];
  }

  const [c0Train, c0Val, c0Test] = splitGroup(c0);
  const [c1Train, c1Val, c1Test] = splitGroup(c1);

  const combine = (...arrs) => {
    const all = arrs.flat();
    shuffle(all);
    return { X: all.map(d => d.x), y: all.map(d => d.y) };
  };

  return {
    train: combine(c0Train, c1Train),
    val: combine(c0Val, c1Val),
    test: combine(c0Test, c1Test),
  };
}

tf.util.shuffle.seed = 42;
const splits = stratifiedSplit(X, y, 0.6, 0.2);
console.log(`\nSplit sizes — Train: ${splits.train.y.length}, Val: ${splits.val.y.length}, Test: ${splits.test.y.length}`);
console.log(`Train class balance: 0=${splits.train.y.filter(v=>v===0).length}, 1=${splits.train.y.filter(v=>v===1).length}`);

// ── 3. Normalize (compute on train, apply to all) ──
const nFeatures = FEATURE_COLS.length;
const means = new Array(nFeatures).fill(0);
const stds = new Array(nFeatures).fill(0);

for (const x of splits.train.X) {
  for (let j = 0; j < nFeatures; j++) means[j] += x[j];
}
for (let j = 0; j < nFeatures; j++) means[j] /= splits.train.X.length;

for (const x of splits.train.X) {
  for (let j = 0; j < nFeatures; j++) stds[j] += (x[j] - means[j]) ** 2;
}
for (let j = 0; j < nFeatures; j++) stds[j] = Math.sqrt(stds[j] / splits.train.X.length) || 1;

function normalize(X) {
  return X.map(x => x.map((v, j) => (v - means[j]) / stds[j]));
}

const trainX = normalize(splits.train.X);
const valX = normalize(splits.val.X);
const testX = normalize(splits.test.X);

// ── 4. Logistic Regression baseline (gradient descent in TF.js) ──
console.log('\n=== BASELINE: Logistic Regression ===');

async function trainLogistic() {
  const w = tf.variable(tf.zeros([nFeatures, 1]));
  const b = tf.variable(tf.zeros([1]));

  const xTrain = tf.tensor2d(trainX);
  const yTrain = tf.tensor2d(splits.train.y.map(v => [v]));
  const xVal = tf.tensor2d(valX);
  const yVal = tf.tensor2d(splits.val.y.map(v => [v]));

  const lr = 0.1;
  const epochs = 200;

  for (let e = 0; e < epochs; e++) {
    const loss = tf.tidy(() => {
      const logits = xTrain.matMul(w).add(b);
      return tf.losses.sigmoidCrossEntropy(yTrain, logits).mean();
    });

    const grads = tf.tidy(() => {
      return tf.grads((w, b) => {
        const logits = xTrain.matMul(w).add(b);
        return tf.losses.sigmoidCrossEntropy(yTrain, logits).mean();
      })([w, b]);
    });

    w.assign(w.sub(grads[0].mul(lr)));
    b.assign(b.sub(grads[1].mul(lr)));

    grads.forEach(g => g.dispose());
    loss.dispose();
  }

  function evaluate(xData, yData, label) {
    const probs = tf.tidy(() => tf.sigmoid(xData.matMul(w).add(b)).squeeze());
    const probArr = probs.arraySync();
    const yArr = yData.arraySync().flat();
    probs.dispose();

    let tp = 0, fp = 0, fn = 0, tn = 0;
    probArr.forEach((p, i) => {
      const pred = p >= 0.5 ? 1 : 0;
      if (pred === 1 && yArr[i] === 1) tp++;
      if (pred === 1 && yArr[i] === 0) fp++;
      if (pred === 0 && yArr[i] === 1) fn++;
      if (pred === 0 && yArr[i] === 0) tn++;
    });

    const accuracy = (tp + tn) / (tp + tn + fp + fn);
    const precision = tp / (tp + fp) || 0;
    const recall = tp / (tp + fn) || 0;
    const f1 = 2 * precision * recall / (precision + recall) || 0;

    console.log(`${label}: Accuracy=${accuracy.toFixed(4)}, Precision=${precision.toFixed(4)}, Recall=${recall.toFixed(4)}, F1=${f1.toFixed(4)}`);
    console.log(`  Confusion matrix: TP=${tp}, FP=${fp}, FN=${fn}, TN=${tn}`);
    return { accuracy, precision, recall, f1 };
  }

  const valMetrics = evaluate(xVal, yVal, 'Validation');

  const xTest = tf.tensor2d(testX);
  const yTest = tf.tensor2d(splits.test.y.map(v => [v]));
  const testMetrics = evaluate(xTest, yTest, 'Test');

  [xTrain, yTrain, xVal, yVal, xTest, yTest, w, b].forEach(t => t.dispose());
  return { val: valMetrics, test: testMetrics };
}

const baselineResults = await trainLogistic();

// ── 5. Neural Network (2 hidden layers) ──
console.log('\n=== NEURAL NETWORK (2 hidden layers) ===');

const model = tf.sequential();
model.add(tf.layers.dense({ inputShape: [nFeatures], units: 16, activation: 'relu' }));
model.add(tf.layers.dropout({ rate: 0.3 }));
model.add(tf.layers.dense({ units: 8, activation: 'relu' }));
model.add(tf.layers.dropout({ rate: 0.2 }));
model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

model.compile({
  optimizer: tf.train.adam(0.001),
  loss: 'binaryCrossentropy',
  metrics: ['accuracy'],
});

model.summary();

const xTrainT = tf.tensor2d(trainX);
const yTrainT = tf.tensor1d(splits.train.y);
const xValT = tf.tensor2d(valX);
const yValT = tf.tensor1d(splits.val.y);

await model.fit(xTrainT, yTrainT, {
  epochs: 100,
  batchSize: 32,
  validationData: [xValT, yValT],
  classWeight: { 0: 1, 1: 3.74 },
  verbose: 0,
  callbacks: {
    onEpochEnd: (epoch, logs) => {
      if ((epoch + 1) % 20 === 0) {
        console.log(`  Epoch ${epoch + 1}: loss=${logs.loss.toFixed(4)}, acc=${logs.acc.toFixed(4)}, val_loss=${logs.val_loss.toFixed(4)}, val_acc=${logs.val_acc.toFixed(4)}`);
      }
    },
  },
});

function evaluateModel(xData, yArr, label) {
  const preds = model.predict(xData).squeeze();
  const predArr = preds.arraySync();
  preds.dispose();

  let tp = 0, fp = 0, fn = 0, tn = 0;
  predArr.forEach((p, i) => {
    const pred = p >= 0.5 ? 1 : 0;
    if (pred === 1 && yArr[i] === 1) tp++;
    if (pred === 1 && yArr[i] === 0) fp++;
    if (pred === 0 && yArr[i] === 1) fn++;
    if (pred === 0 && yArr[i] === 0) tn++;
  });

  const accuracy = (tp + tn) / (tp + tn + fp + fn);
  const precision = tp / (tp + fp) || 0;
  const recall = tp / (tp + fn) || 0;
  const f1 = 2 * precision * recall / (precision + recall) || 0;

  console.log(`${label}: Accuracy=${accuracy.toFixed(4)}, Precision=${precision.toFixed(4)}, Recall=${recall.toFixed(4)}, F1=${f1.toFixed(4)}`);
  console.log(`  Confusion matrix: TP=${tp}, FP=${fp}, FN=${fn}, TN=${tn}`);
  return { accuracy, precision, recall, f1 };
}

console.log('\nNeural Network results:');
const nnVal = evaluateModel(xValT, splits.val.y, 'Validation');

const xTestT = tf.tensor2d(testX);
const nnTest = evaluateModel(xTestT, splits.test.y, 'Test');

// ── 6. Compare ──
console.log('\n=== COMPARISON ===');
console.log(`Logistic Regression test F1: ${baselineResults.test.f1.toFixed(4)}`);
console.log(`Neural Network test F1:      ${nnTest.f1.toFixed(4)}`);
if (nnTest.f1 > baselineResults.test.f1) {
  console.log('→ Neural Network outperforms baseline.');
} else if (nnTest.f1 === baselineResults.test.f1) {
  console.log('→ Neural Network ties with baseline. Given complexity, the simpler model may be preferable.');
} else {
  console.log('→ Neural Network does NOT outperform baseline. Reporting honestly: the simpler model wins on this split.');
}

// ── 7. Save model + normalization params ──
const modelDir = path.join(ROOT, 'server', 'ml-model');
if (!fs.existsSync(modelDir)) fs.mkdirSync(modelDir, { recursive: true });

// Pure TF.js doesn't have file:// save handler, so save topology + weights manually
const saveResult = await model.save(tf.io.withSaveHandler(async (artifacts) => {
  const modelJSON = {
    modelTopology: artifacts.modelTopology,
    weightsManifest: [{
      paths: ['weights.bin'],
      weights: artifacts.weightSpecs,
    }],
  };
  fs.writeFileSync(path.join(modelDir, 'model.json'), JSON.stringify(modelJSON, null, 2));

  // Save weight data as binary
  const weightData = Buffer.from(artifacts.weightData);
  fs.writeFileSync(path.join(modelDir, 'weights.bin'), weightData);
  return { modelArtifactsInfo: { dateSaved: new Date(), modelTopologyType: 'JSON' } };
}));
console.log(`\nModel saved to ${modelDir}`);

const normParams = { features: FEATURE_COLS, means, stds };
fs.writeFileSync(path.join(modelDir, 'norm-params.json'), JSON.stringify(normParams, null, 2));
console.log('Normalization params saved.');

// Cleanup
[xTrainT, yTrainT, xValT, yValT, xTestT].forEach(t => t.dispose());
console.log('\nDone.');
