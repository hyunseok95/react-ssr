import React from "react";
import { hydrateRoot } from "react-dom/client";
import App from "./app";

declare global {
  interface Window {
    hydration: any;
  }
}

const container = document.getElementById("root")!;
hydrateRoot(container, <App hydration={window.hydration} />);
