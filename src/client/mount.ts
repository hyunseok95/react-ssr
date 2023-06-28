// import "./base.css";
import { hydrateRoot } from "react-dom/client";
import App from "./base";

declare global {
  interface Window { hydration: any; }
}

const htmlElemnet: HTMLElement | null = document.querySelector("main");
if (!htmlElemnet) {
  throw new Error("no html");
}

const container: Document | Element = htmlElemnet;
const initialChildren: React.ReactNode = App(window.hydration);

hydrateRoot(
  container,
  initialChildren
);

