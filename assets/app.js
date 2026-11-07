/* =========================================================
   Интерактив демонстрационного макета
   ---------------------------------------------------------
   Кнопки контакта, маршрута и соцсетей показывают понятное
   пояснение, пока данные не заполнены. Когда владелец пришлёт
   данные, впишите прямые ссылки в DIRECT_LINKS — и кнопки
   сразу начнут открывать телефон, мессенджер и карту.
   ========================================================= */

(() => {
  "use strict";

  const DIRECT_LINKS = {
    // Пример: "tel:+79991234567" или "https://t.me/example"
    contact: "",
    // Пример: "https://yandex.ru/maps/?text=Москва%2C%20улица%2C%201"
    directions: "",
    // Ссылки на профили, если они есть.
    "social-telegram": "",
    "social-vk": "",
  };

  const FALLBACK_COPY = {
    contact: {
      title: "Контакт ещё не добавлен",
      text: "В макете пока нет телефона или ссылки на мессенджер. Когда владелец пришлёт контакт, кнопка «Написать нам» начнёт открывать звонок или чат.",
    },
    directions: {
      title: "Карта ждёт точный адрес",
      text: "Адрес кофейни в макете пока не указан. Как только появится точная точка, кнопка «Как добраться» откроет карту с маршрутом.",
    },
    "social-telegram": {
      title: "Ссылка на Telegram появится позже",
      text: "Профиль кофейни в Telegram ещё нужно уточнить у владельца. В макете здесь пока стоит заметная заглушка.",
    },
    "social-vk": {
      title: "Ссылка на ВКонтакте появится позже",
      text: "Профиль кофейни во ВКонтакте ещё нужно уточнить у владельца. После добавления эта кнопка начнёт открывать соцсеть.",
    },
  };

  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

  /* ---------- Header & mobile navigation ---------- */
  const header = document.querySelector("[data-header]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  const navScrim = document.querySelector("[data-nav-scrim]");
  const navToggleText = navToggle ? navToggle.querySelector(".nav-toggle__text") : null;
  const pageMain = document.querySelector("main");
  const pageFooter = document.querySelector(".site-footer");
  let menuCloseTimer = null;

  const setPageInert = (inert) => {
    if ("inert" in HTMLElement.prototype) {
      if (pageMain) pageMain.inert = inert;
      if (pageFooter) pageFooter.inert = inert;
    }
  };

  const openMenu = () => {
    if (!mobileMenu || !navToggle) return;
    window.clearTimeout(menuCloseTimer);
    mobileMenu.hidden = false;
    mobileMenu.setAttribute("aria-hidden", "false");
    if (navScrim) navScrim.hidden = false;

    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Закрыть меню");
    if (navToggleText) navToggleText.textContent = "Закрыть";

    document.body.classList.add("menu-open");
    setPageInert(true);

    requestAnimationFrame(() => {
      mobileMenu.classList.add("is-open");
      if (navScrim) navScrim.classList.add("is-visible");
    });
  };

  const closeMenu = ({ restoreFocus = false } = {}) => {
    if (!mobileMenu || !navToggle || mobileMenu.hidden) return;
    mobileMenu.classList.remove("is-open");
    if (navScrim) navScrim.classList.remove("is-visible");

    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Открыть меню");
    if (navToggleText) navToggleText.textContent = "Меню";
    mobileMenu.setAttribute("aria-hidden", "true");

    document.body.classList.remove("menu-open");
    setPageInert(false);

    window.clearTimeout(menuCloseTimer);
    menuCloseTimer = window.setTimeout(() => {
      mobileMenu.hidden = true;
      if (navScrim) navScrim.hidden = true;
    }, 320);

    if (restoreFocus) navToggle.focus();
  };

  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", () => {
      if (mobileMenu.hidden) openMenu();
      else closeMenu({ restoreFocus: true });
    });

    if (navScrim) navScrim.addEventListener("click", () => closeMenu({ restoreFocus: true }));

    $$("a", mobileMenu).forEach((link) => {
      link.addEventListener("click", () => closeMenu());
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !mobileMenu.hidden) {
        closeMenu({ restoreFocus: true });
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 980 && !mobileMenu.hidden) closeMenu();
    });
  }

  /* ---------- Navigation state ---------- */
  const navLinks = $$(".site-nav a[data-nav-link]");
  const sections = ["about", "menu", "atmosphere", "contacts"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const updateScrollUI = () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
    if (!sections.length) return;

    const marker = (header ? header.offsetHeight : 0) + 120;
    let active = "";

    for (const section of sections) {
      if (section.getBoundingClientRect().top <= marker) active = section.id;
    }

    const nearBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 48;
    if (nearBottom) active = "contacts";

    for (const link of navLinks) {
      const isActive = link.getAttribute("href") === "#" + active;
      link.classList.toggle("is-active", isActive);
      if (isActive) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    }
  };

  let scrollQueued = false;
  const requestScrollUI = () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      updateScrollUI();
      scrollQueued = false;
    });
  };

  window.addEventListener("scroll", requestScrollUI, { passive: true });
  window.addEventListener("resize", requestScrollUI);
  updateScrollUI();

  /* ---------- Menu tabs ---------- */
  const tabs = $$('[role="tab"]');
  const panels = $$('[role="tabpanel"]');

  const activateTab = (tab, moveFocus = true) => {
    if (!tab) return;
    const panelId = tab.getAttribute("aria-controls");

    tabs.forEach((item) => {
      const selected = item === tab;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
    });

    panels.forEach((panel) => {
      const selected = panel.id === panelId;
      panel.hidden = !selected;
      panel.classList.remove("is-visible");
      if (selected) {
        // Перезапускаем мягкую анимацию строк при переключении категории.
        void panel.offsetWidth;
        panel.classList.add("is-visible");
      }
    });

    if (moveFocus) tab.focus({ preventScroll: true });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateTab(tab, false));

    tab.addEventListener("keydown", (event) => {
      const key = event.key;
      let nextIndex = index;

      if (key === "ArrowRight" || key === "ArrowDown") {
        nextIndex = (index + 1) % tabs.length;
      } else if (key === "ArrowLeft" || key === "ArrowUp") {
        nextIndex = (index - 1 + tabs.length) % tabs.length;
      } else if (key === "Home") {
        nextIndex = 0;
      } else if (key === "End") {
        nextIndex = tabs.length - 1;
      } else {
        return;
      }

      event.preventDefault();
      activateTab(tabs[nextIndex], true);
    });
  });

  /* ---------- Dialog for unsupplied data ---------- */
  const dialog = document.getElementById("info-dialog");
  const dialogTitle = document.getElementById("dialog-title");
  const dialogText = document.getElementById("dialog-text");
  let lastTrigger = null;

  const openInfoDialog = (title, text) => {
    if (!dialog) return;
    if (typeof dialog.showModal === "function") {
      if (dialog.open) dialog.close();
      dialogTitle.textContent = title;
      dialogText.textContent = text;
      dialog.showModal();
      document.body.classList.add("modal-open");
    }
  };

  const closeInfoDialog = () => {
    if (dialog && dialog.open) dialog.close();
  };

  if (dialog) {
    dialog.addEventListener("close", () => {
      document.body.classList.remove("modal-open");
      if (lastTrigger && document.contains(lastTrigger)) {
        lastTrigger.focus({ preventScroll: true });
      }
    });

    $$("[data-dialog-close]", dialog).forEach((button) => {
      button.addEventListener("click", closeInfoDialog);
    });

    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeInfoDialog();
    });
  }

  const followDirectLink = (url) => {
    if (!url) return false;
    if (/^(tel:|mailto:)/i.test(url)) {
      window.location.href = url;
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
    return true;
  };

  $$("[data-action]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const action = button.getAttribute("data-action");
      if (!action) return;

      const directLink = DIRECT_LINKS[action] || "";
      if (directLink) {
        if (followDirectLink(directLink)) {
          event.preventDefault();
          return;
        }
      }

      const copy = FALLBACK_COPY[action] || {
        title: "Данные ещё не добавлены",
        text: "Эта кнопка станет рабочей, когда в макете появятся реальные данные кофейни.",
      };

      lastTrigger = button;
      openInfoDialog(copy.title, copy.text);
    });
  });

  /* ---------- Small utilities ---------- */
  $$("[data-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
})();
