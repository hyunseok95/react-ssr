import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import { StaticRouter } from "react-router-dom/server.js";
// import { Provider as StateProvider } from "jotai";
// import routes from "./routes";
// import { todoList } from "./state";

// import "./styles/index.css";
// import createApp from ".";
import { Home } from "./views";
import { Other } from "./views/other";

// const isProd = process.env.NODE_ENV === "production";
// const Router = import.meta.env.SSR ? StaticRouter : BrowserRouter
// const Router = isProd ? StaticRouter : BrowserRouter;

export function App(ctx: any, url: string | void) {
  return (
    // <StateProvider initialValues={[
    //   [todoList, ctx.data.todoList]
    // ]}>
    <Suspense>
      {/* <Router location={url!}> */}
      <Router>
        <Routes>
          <Route key="/" path="/" Component={Home} />;
          <Route key="/other" path="/other" Component={Other} />;
        </Routes>
      </Router>
    </Suspense>
    // </StateProvider>
  );
}

// const root = ReactDOM.createRoot(document.getElementById("root")!);
// root.render(<App />);

const routes = [
  {
    path: "/",
    component: Home,
  },
  {
    path: "/other",
    component: Other,
  },
];

export default {
  // Provides client-side navigation routes to server
  routes,
  // Provides function needed to perform SSR
  App,
};
