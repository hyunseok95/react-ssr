import React from "react";
import { hydrateRoot } from "react-dom/client";
import { EntryPoint } from "./views";

declare global {
  interface Window {
    hydration: any;
  }
}
const container = document.querySelector("main")!;
hydrateRoot(
  container,
  <React.Suspense>
    <EntryPoint hydration={window.hydration} />
  </React.Suspense>
);
