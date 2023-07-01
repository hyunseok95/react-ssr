import React from "react";
import { Routes, Route } from "react-router-dom";
import { StaticRouter } from "react-router-dom/server";

import { Home } from "./home";
import { Other } from "./other";

interface MyProps {
  hydration?: any;
}

export const EntryPoint: React.FunctionComponent<MyProps> = function (
  props: MyProps,
  context?: any
) {
  console.log(props.hydration.url);
  return (
    // <React.Fragment>
    //   <h1>Hello, {props.name}!</h1>
    // </React.Fragment>
    <React.Suspense>
      <StaticRouter location={props.hydration.url}>
        <Routes>
          <Route key="/" path="/" Component={Home} />;
          <Route key="/other" path="/other" Component={Other} />;
        </Routes>
      </StaticRouter>
    </React.Suspense>
  );
};

// const root = document.getElementById("root")!;
// createRoot(root).render(
//   <React.StrictMode>
//     <EntryPoint />
//   </React.StrictMode>
// );

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
