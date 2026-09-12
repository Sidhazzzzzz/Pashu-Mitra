# Pashu Mitra (पशु मित्र)

> An early warning system for dairy herd health and subclinical mastitis detection on Indian dairy farms.

---

## 🐄 What This Is

**Subclinical mastitis** is one of the most cost-injurious conditions affecting smallholder dairy farmers across India. Because udders show no visible swelling or abnormalities during the subclinical phase, infections often go undetected until milk yield collapses and permanent tissue damage occurs.

**Pashu Mitra** ("Animal Friend") bridges this diagnostic window by combining multi-parameter sensor metrics—specifically udder quarter **Electrical Conductivity (EC)**, **Thermal Differential (ΔT)**, and **Somatic Cell Count (SCC)** proxies—with machine learning to flag elevated risk **2 to 4 days before clinical symptoms manifest**. Early detection enables low-cost preventative care and prompt veterinary intervention, preserving herd productivity and farmer livelihoods.

---

## 🔬 Prototype: Real vs. Simulated

To provide a complete end-to-end demonstration, this prototype combines genuine machine learning components with simulated IoT hardware inputs:

* **Real TensorFlow.js ML Model**: Includes a multi-layer neural network trained on multi-quarter telemetry parameters (`server/ml-model/`). Inference runs on Node.js using `@tensorflow/tfjs`. Model training scripts are available in `scripts/train-model.mjs`.
* **Simulated Hardware Telemetry**: Sensor readings (electrical conductivity in mS/cm, quarter skin temperature, somatic cell proxies) are generated via simulated hardware streams for 8 profile cows across cooperative farms.
* **Offline & Localization Capabilities**: Local state persistence and an 8-language dictionary engine allow full offline review and instant switching between regional languages without external network dependencies.

---

## ✨ Key Features

- **Dual Persona Interface**:
  - **Farmer View**: High-contrast, intuitive status cards showing daily herd risk, simple actionable guidance, and offline status feedback.
  - **Veterinary Field Desk**: Comprehensive triage table with 14-day telemetry trends, risk score breakdowns, and single-click alert resolution workflows.
- **Early Mastitis Forecasting**: Multi-quarter electrical conductivity and thermal variance scoring powered by TensorFlow.js inference.
- **Multilingual Support**: Complete UI localization in 8 regional languages:
  - English (`en`), Hindi (`hi`), Marathi (`mr`), Gujarati (`gu`), Punjabi (`pa`), Tamil (`ta`), Kannada (`kn`), and Bengali (`bn`).
- **Interactive Health Workflows**: Vets and field officers can update treatment states (*Under Treatment*, *Reviewed*, *False Alarm*), which immediately re-calculates active herd risk levels.
- **Responsive & Accessible**: Styled using Tailwind CSS with custom branding (`LogoMark` SVG and custom favicon).

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite 7, Tailwind CSS v4, Wouter, Recharts, Lucide React
- **Backend**: Express, Node.js, tsx
- **Machine Learning**: TensorFlow.js (`@tensorflow/tfjs`)
- **Tooling**: TypeScript (`tsc`), Esbuild, Prettier

---

## 📁 Project Structure

```text
pashu-mitra/
├── client/                 # React frontend application
│   ├── public/             # Static assets (favicon.svg)
│   ├── src/
│   │   ├── components/     # UI components & SVG brand assets
│   │   ├── contexts/       # React contexts (language, theme)
│   │   ├── hooks/          # Custom hooks (e.g. useMobile)
│   │   ├── pages/          # Primary views (Home, About, NotFound)
│   │   └── App.tsx         # Routing & layout setup
│   └── index.html          # HTML entry point with metadata
├── server/                 # Express API server & ML inference engine
│   ├── ml-model/           # Trained TensorFlow.js model artifacts
│   │   ├── model.json
│   │   ├── weights.bin
│   │   └── norm-params.json
│   ├── index.ts            # Server entry point
│   └── inference.ts        # TensorFlow.js prediction pipeline
├── scripts/                # ML model training and validation scripts
│   ├── train-model.mjs     # Model training script
│   └── investigate-and-retrain.mjs
├── shared/                 # Common TypeScript definitions and constants
│   └── const.ts
├── vite.config.ts          # Vite build & proxy configuration
├── package.json            # Dependencies and npm scripts
└── README.md               # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm**

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/pashu-mitra.git
   cd pashu-mitra
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

- **Start API Server**:
  ```bash
  npm run dev:api
  ```

- **Start Frontend Client**:
  ```bash
  npm run dev
  ```
  Open `http://localhost:3000` in your browser.

### Model Training

To retrain the TensorFlow.js mastitis detection model with updated sample telemetry:
```bash
npm run train
```

### Type Checking & Building

- Check TypeScript types:
  ```bash
  npm run check
  ```
- Build for production:
  ```bash
  npm run build
  ```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
