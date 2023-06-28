import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StaticRouter } from "react-router-dom/server.js";
import { Provider as StateProvider } from "jotai";
import routes from "./routes";
import { todoList } from "./state";

// import "./styles/index.css";

const isProd = process.env.NODE_ENV === "production";

// const Router = import.meta.env.SSR ? StaticRouter : BrowserRouter
const Router = isProd ? StaticRouter : BrowserRouter;

export default function App(ctx: any, url: string | void) {
  return (
    // <StateProvider initialValues={[
    //   [todoList, ctx.data.todoList]
    // ]}>
    <Suspense>
      <Router location={url!}>
        <Routes>
          {routes.map(({ path, component: Component }: any) => {
            return <Route key={path} path={path} element={<Component />} />;
          })}
        </Routes>
      </Router>
    </Suspense>
    // </StateProvider>
  );
}

// const root = ReactDOM.createRoot(document.getElementById("root")!);
// root.render(<App />);
