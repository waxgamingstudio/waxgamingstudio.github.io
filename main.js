/* =========================================================
   WAX GAMING — MAIN CONTROLLER
   Handles: component loading, nav toggle, theme binding,
   game card visibility, and back-to-top button.

   Fix (2026-04): Load header.html first (await), then nav
   and footer in parallel. This ensures #nav-container
   exists in the DOM before nav.html tries to inject into it,
   fixing the broken hamburger menu on mobile.
========================================================= */

document.addEventListener("DOMContentLoaded", initApp);

async function initApp() {
  await loadComponents();

  initNav();
  initThemeButtons();

  await loadGames();

  initBackToTop();
  initStickyHeader();
}

/* =========================
   COMPONENT LOADER
========================= */
const cache = new Map();

async function loadComponent(name) {
  const container = document.getElementById(`${name}-container`);
  if (!container) return;

  if (!cache.has(name)) {
    const res = await fetch(`${name}.html`);
    if (!res.ok) return;
    cache.set(name, await res.text());
  }

  container.innerHTML = cache.get(name);
}

async function loadComponents() {
  // Header must load first — nav.html injects into #nav-container
  // which lives inside header.html. Loading all three in parallel
  // caused the hamburger bug: #nav-container didn't exist yet
  // when nav.html tried to inject into it.
  await loadComponent("header");
  await Promise.all([loadComponent("nav"), loadComponent("footer")]);
}

/* =========================
   NAV SYSTEM
========================= */
function initNav() {
  const toggle = document.getElementById("navToggle");
  const drawer = document.getElementById("navDrawer");
  if (!toggle || !drawer) return;

  // Ensure drawer lives inside the <header> element
  const header = document.querySelector("header.nav");
  if (header && !header.contains(drawer)) header.appendChild(drawer);

  const close = () => {
    drawer.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = drawer.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  document.addEventListener("click", (e) => {
    if (!drawer.contains(e.target) && !toggle.contains(e.target)) close();
  });

  drawer.addEventListener("click", (e) => {
    if (e.target.tagName === "A") close();
  });
}

/* =========================
   THEME BUTTONS
========================= */
function initThemeButtons() {
  document.querySelectorAll(".theme-toggle").forEach((btn) => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = "true";
    btn.addEventListener("click", () => ThemeManager.toggle());
  });
}



/* =========================
   BACK TO TOP BUTTON
========================= */
function initBackToTop() {
  // Create button element
  const btn = document.createElement("button");
  btn.className = "back-to-top";
  btn.setAttribute("aria-label", "Back to top");
  btn.innerHTML = "↑";
  document.body.appendChild(btn);

  // Show/hide based on scroll position
  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      btn.classList.add("visible");
    } else {
      btn.classList.remove("visible");
    }
  };

  // Smooth scroll to top on click
  btn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  // Listen for scroll events
  window.addEventListener("scroll", toggleVisibility);
  toggleVisibility(); // Initial check
}
let headerPlaceholder = null;
function initStickyHeader() {
  const header = document.querySelector(".nav");
  if (!header) {
    console.warn("Sticky header: .nav not found");
    return;
  }

  // Create placeholder if not exists
  let placeholder = document.querySelector(".header-placeholder");
  if (!placeholder) {
    placeholder = document.createElement("div");
    placeholder.className = "header-placeholder";
    header.parentNode.insertBefore(placeholder, header);
  }

  const update = () => {
    const scrollY = window.scrollY;
    const shouldStick = scrollY > header.offsetTop;

    if (shouldStick && !header.classList.contains("is-stuck")) {
      const h = header.offsetHeight;
      header.classList.add("is-stuck");
      header.style.position = "fixed";
      header.style.top = "0";
      header.style.left = "0";
      header.style.right = "0";
      header.style.width = "100%";
      placeholder.style.display = "block";
      placeholder.style.height = `${h}px`;
    } else if (!shouldStick && header.classList.contains("is-stuck")) {
      header.classList.remove("is-stuck");
      header.style.position = "";
      header.style.top = "";
      header.style.left = "";
      header.style.right = "";
      header.style.width = "";
      placeholder.style.display = "none";
      placeholder.style.height = "";
    }
  };

  window.addEventListener("scroll", update);
  window.addEventListener("resize", update);
  const resizeObserver = new ResizeObserver(() => update());
  resizeObserver.observe(header);
  update();
}


/* =========================
   GAMES DATABASE
========================= */

async function loadGames() {
  const grid = document.getElementById("gamesGrid");

  if (!grid) return;

  try {
    const response = await fetch("data/games.json");

    if (!response.ok) {
      throw new Error("Failed to load games.json");
    }

    const data = await response.json();

    grid.innerHTML = "";

    data.games.forEach((game) => {
      const card = document.createElement("article");

      card.className = "game-card";

      card.innerHTML = `
        ${
          game.icon
            ? `
              <img
                src="${game.icon}"
                alt="${game.name}"
                class="game-icon"
              >
            `
            : `
              <div class="game-icon-placeholder">
                🎮
              </div>
            `
        }

        <div>
          <h3 class="game-name">${game.name}</h3>
          <p class="game-desc">${game.description}</p>
        </div>

        <div class="game-actions">

          ${
            game.appStoreUrl
              ? `
                <a
                  href="${game.appStoreUrl}"
                  target="_blank"
                  class="btn btn-primary btn-sm"
                >
                  🍎 App Store
                </a>
              `
              : ""
          }

          ${
            game.playStoreUrl
              ? `
                <a
                  href="${game.playStoreUrl}"
                  target="_blank"
                  class="btn btn-green btn-sm"
                >
                  ▶ Play Store
                </a>
              `
              : ""
          }

        </div>
      `;

      grid.appendChild(card);
    });
  } catch (error) {
    console.error(error);
  }
}
