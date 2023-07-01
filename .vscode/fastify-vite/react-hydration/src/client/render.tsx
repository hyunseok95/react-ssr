import React from "react";
import { createRoot } from "react-dom/client";
import { EntryPoint } from "./views";

const root = document.getElementById("root")!;
createRoot(root).render(
  <React.StrictMode>
    <EntryPoint />
  </React.StrictMode>
);
