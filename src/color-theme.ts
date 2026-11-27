export const themeKey = "sushil-portfolio-theme";

export const initializeTheme = `try {
  if (localStorage.getItem(${JSON.stringify(themeKey)}) === "dark") {
    document.documentElement.dataset.theme = "dark";
  }
} catch {}`;
