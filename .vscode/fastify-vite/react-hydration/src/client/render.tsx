import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Home } from "./views/home";
import { Other } from "./views/other";

interface MyProps {
  hydration?: any;
}

function EntryPoint(props: MyProps, context?: any): React.ReactNode {
  return (
    <BrowserRouter>
      <Routes>
        <Route key="/" path="/" Component={Home} />;
        <Route key="/other" path="/other" Component={Other} />;
      </Routes>
    </BrowserRouter>
  );
}

const root = document.getElementById("root")!;
createRoot(root).render(
  <React.StrictMode>
    <EntryPoint />
  </React.StrictMode>
);
