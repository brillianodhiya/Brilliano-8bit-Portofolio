import { createRoot } from "react-dom/client";
import { initializeFaro, getWebInstrumentations } from "@grafana/faro-web-sdk";
import { ReactIntegration } from "@grafana/faro-react";
import App from "./App";
import "./index.css";

// Initialize Grafana Faro for Real User Monitoring (RUM)
// If you are trying Grafana Cloud, you can get these values from the "Frontend Observability" section.
initializeFaro({
  url: import.meta.env.VITE_GRAFANA_FARO_URL,
  app: {
    name: "pixel-portfolio",
    version: "1.0.0",
    environment: "development",
  },
  instrumentations: [
    ...getWebInstrumentations(),
    new ReactIntegration(),
  ],
});

createRoot(document.getElementById("root")!).render(<App />);
