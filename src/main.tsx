import { createRoot } from "react-dom/client";
import { initializeFaro, getWebInstrumentations } from "@grafana/faro-web-sdk";
import { ReactIntegration } from "@grafana/faro-react";
import App from "./App";
import "./index.css";

// Initialize Grafana Faro for Real User Monitoring (RUM)
// If you are trying Grafana Cloud, you can get these values from the "Frontend Observability" section.
const faroUrl = import.meta.env.VITE_GRAFANA_FARO_URL;

if (faroUrl) {
  initializeFaro({
    url: faroUrl,
    app: {
      name: "pixel-portfolio",
      version: "1.0.0",
      environment: "production",
    },
    instrumentations: [
      ...getWebInstrumentations(),
      new ReactIntegration(),
    ],
  });
} else {
  console.warn("Grafana Faro URL not found. RUM monitoring is disabled.");
}

createRoot(document.getElementById("root")!).render(<App />);
