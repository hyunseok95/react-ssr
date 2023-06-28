import { globalStyle } from "@vanilla-extract/css";

globalStyle("html, body, #root", {
  margin: 0,
  padding: 0,
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Oxygen", Ubuntu, "Cantarell", Fira Sans, "Droid Sans", "Helvetica Neue"',
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
  height: "100%",
});