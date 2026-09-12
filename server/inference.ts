import * as tf from '@tensorflow/tfjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODEL_DIR = path.join(__dirname, 'ml-model');

let model: tf.LayersModel | null = null;
let normParams: { features: string[]; means: number[]; stds: number[] } | null = null;
let incrementalUpdateCount = 0;

export async function loadModel() {
  const modelJSON = JSON.parse(fs.readFileSync(path.join(MODEL_DIR, 'model.json'), 'utf-8'));
  const weightData = fs.readFileSync(path.join(MODEL_DIR, 'weights.bin'));

  model = await tf.loadLayersModel(tf.io.fromMemory({
    modelTopology: modelJSON.modelTopology,
    weightSpecs: modelJSON.weightsManifest[0].weights,
    weightData: new Uint8Array(weightData).buffer,
  }));

  model.compile({
    optimizer: tf.train.adam(0.0001),
    loss: 'binaryCrossentropy',
    metrics: ['accuracy'],
  });

  normParams = JSON.parse(fs.readFileSync(path.join(MODEL_DIR, 'norm-params.json'), 'utf-8'));
  incrementalUpdateCount = 0;

  console.log(`ML model loaded (${model.countParams()} params). Features: ${normParams!.features.join(', ')}`);
}

// Model uses only the two features the hardware can actually sense.
function mapSensorToFeatures(sensor: {
  ec: number;
  temperature: number;
}): number[] {
  return [sensor.temperature, sensor.ec];
}

function normalizeFeatures(raw: number[]): number[] {
  if (!normParams) throw new Error('Model not loaded');
  return raw.map((v, i) => (v - normParams!.means[i]) / normParams!.stds[i]);
}

export type PredictionResult = {
  probability: number;
  risk: 'low' | 'medium' | 'high';
  score: number;
  features: Record<string, number>;
};

export function predict(sensor: { ec: number; temperature: number }): PredictionResult {
  if (!model || !normParams) throw new Error('Model not loaded');

  const rawFeatures = mapSensorToFeatures(sensor);
  const normalized = normalizeFeatures(rawFeatures);

  const input = tf.tensor2d([normalized]);
  const output = model.predict(input) as tf.Tensor;
  const probability = output.dataSync()[0];
  input.dispose();
  output.dispose();

  const score = Math.round(probability * 100);
  const risk: 'low' | 'medium' | 'high' =
    score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';

  const features: Record<string, number> = {};
  normParams.features.forEach((name, i) => {
    features[name] = Math.round(rawFeatures[i] * 100) / 100;
  });

  return { probability, risk, score, features };
}

export function incrementalLearn(sensor: { ec: number; temperature: number }, label: number): void {
  if (!model || !normParams) throw new Error('Model not loaded');

  const rawFeatures = mapSensorToFeatures(sensor);
  const normalized = normalizeFeatures(rawFeatures);

  const input = tf.tensor2d([normalized]);
  const target = tf.tensor2d([[label]]);

  model.trainOnBatch(input, target);

  input.dispose();
  target.dispose();
  incrementalUpdateCount++;
}

export function getUpdateCount(): number {
  return incrementalUpdateCount;
}
