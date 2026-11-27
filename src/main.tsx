import { createRoot } from "react-dom/client";
import ResearchSite from "./research-site";
import { themeKey } from "./color-theme";
import "./globals.css";

try {
  if (localStorage.getItem(themeKey) === "dark") document.documentElement.dataset.theme = "dark";
} catch {}
createRoot(document.getElementById("root")!).render(<ResearchSite />);
