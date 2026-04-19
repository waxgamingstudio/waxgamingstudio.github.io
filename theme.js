/* =========================================================
   WAX GAMING — THEME MANAGER
   Runs immediately (no defer) to prevent flash of wrong theme.
   Supports: system preference detection, manual override,
   localStorage persistence, and ARIA state sync.
========================================================= */

const ThemeManager = (() => {
  const KEY = "wax-theme-preference";

  const system = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

  const stored = () => {
    const t = localStorage.getItem(KEY);
    return t === "dark" || t === "light" ? t : null;
  };

  const apply = (theme) => {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    // Sync ARIA labels on all toggle buttons
    const label = `Switch to ${theme === "dark" ? "light" : "dark"} mode`;
    document.querySelectorAll(".theme-toggle").forEach(btn => {
      btn.setAttribute("aria-label", label);
      btn.setAttribute("aria-pressed", String(theme === "dark"));
    });
  };

  const toggle = () => {
    const current = document.documentElement.getAttribute("data-theme") === "dark"
      ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    apply(next);
    localStorage.setItem(KEY, next);
  };

  const init = () => {
    apply(stored() || system());
    // Respond to OS-level theme changes only when no manual override is stored
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => { if (!stored()) apply(e.matches ? "dark" : "light"); };
    media.addEventListener
      ? media.addEventListener("change", handler)
      : media.addListener(handler);
  };

  return { init, toggle };
})();

/* ⚡ Run immediately — must not be deferred */
ThemeManager.init();
