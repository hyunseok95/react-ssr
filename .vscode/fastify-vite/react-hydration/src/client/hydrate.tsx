import React from "react";
import { hydrateRoot } from "react-dom/client";
import { EntryPoint } from "./views";
import { App } from "./App";

declare global {
  interface Window {
    hydration: any;
  }
}

// const hydration = {
//   url: "/other",
//   name: "/other",
// };
const container = document.getElementById("root")!;
hydrateRoot(container, <EntryPoint hydration={window.hydration} />);
// hydrateRoot(container, <App />);
// hydrateRoot(container, <App hydration={window.hydration} />);
