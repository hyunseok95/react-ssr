import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Home } from "./home";
import { Other } from "./other";

interface MyProps {
  hydration?: any;
}

export const EntryPoint: React.FunctionComponent<MyProps> = function (
  props: MyProps,
  context?: any
) {
  return (
    <BrowserRouter>
      <Routes>
        <Route key="/" path="/" Component={Home} />;
        <Route key="/other" path="/other" Component={Other} />;
      </Routes>
    </BrowserRouter>
  );
};

const root = document.getElementById("root")!;
createRoot(root).render(
  <React.StrictMode>
    <EntryPoint />
  </React.StrictMode>
);

// const routes = [
//   {
//     path: "/",
//     component: Home,
//   },
//   {
//     path: "/other",
//     component: Other,
//   },
// ];

// export default {
//   // Provides client-side navigation routes to server
//   routes,
//   // Provides function needed to perform SSR
//   App,
// };
