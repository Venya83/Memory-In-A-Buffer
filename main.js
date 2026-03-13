// main.js
// ─────────────────────────────────────────────────────────────────────────────
// Полностью обновлённый файл: теперь галерея подгружается динамически из
// gallery.js при первом входе в режим «Gallery». Больше нет «заглушек» и
// сообщения «Галерея ещё не реализована.» – отображаются реальные данные.
// Canvas и другие холсты не используются.
// ─────────────────────────────────────────────────────────────────────────────


/* ╔═══════════════════╗
   ║  ГЛОБАЛЬНЫЕ ДАННЫЕ ║
   ╚═══════════════════╝ */
   window.gameData = JSON.parse(
    localStorage.getItem("gameData") ||
    JSON.stringify({
      spice: 0, coins: 0, intel: 0, amd: 0, autoRate: 0, pulledChars: []
    })
  );
  
  /* ── миграция устаревших ключей ──────────────────────────────────────────── */
  if (localStorage.getItem("spiceCount") !== null) {
    const legacySpice = parseInt(localStorage.getItem("spiceCount"), 10) || 0;
    window.gameData.spice = Math.max(window.gameData.spice, legacySpice);
    localStorage.removeItem("spiceCount");
  }
  if ("intelCurrency" in window.gameData) {
    window.gameData.intel += window.gameData.intelCurrency || 0;
    delete window.gameData.intelCurrency;
  }
  if ("amdCurrency" in window.gameData) {
    window.gameData.amd += window.gameData.amdCurrency || 0;
    delete window.gameData.amdCurrency;
  }
  if (!Array.isArray(window.gameData.pulledChars)) {
    window.gameData.pulledChars = [];
  }
  
  /* ── сохранение ──────────────────────────────────────────────────────────── */
  window.saveGameData = () =>
    localStorage.setItem("gameData", JSON.stringify(window.gameData));
  
  window.addEventListener("beforeunload", window.saveGameData);
  
  
  /* ╔═══════════════════════════╗
     ║  ОБЩИЕ ССЫЛКИ И ПЕРЕМЕННЫЕ ║
     ╚═══════════════════════════╝ */
  let active       = null;   // текущий режим
  let isSwitching  = false;  // блокировка «дребезга» кликов
  
  const btns = {
    farm:    document.getElementById("btn-farm"),
    shop:    document.getElementById("btn-shop"),
    wish:    document.getElementById("btn-wish"),
    gallery: document.getElementById("btn-gallery")
  };
  
  
  /* ╔══════════════════╗
     ║  ОБНОВЛЕНИЕ UI   ║
     ╚══════════════════╝ */
  window.updateCurrencyDisplay = () => {
    document.getElementById("spice-count").textContent  = window.gameData.spice;
    document.getElementById("nickel-count").textContent = window.gameData.coins;
    document.getElementById("intel-count").textContent  = window.gameData.intel;
    document.getElementById("amd-count").textContent    = window.gameData.amd;
    window.saveGameData();
  };
  
  setInterval(() => {
    if (window.gameData.autoRate) {
      window.gameData.spice += window.gameData.autoRate;
      window.updateCurrencyDisplay();
    }
  }, 1000);
  
  window.updateCurrencyDisplay();
  
  
  /* ╔═════════════════════════╗
     ║  ГАЛЕРЕЙНАЯ КНОПКА/УИ   ║
     ╚═════════════════════════╝ */
  function updateGalleryButtonVisibility() {
    const hasChars = Array.isArray(window.gameData.pulledChars) &&
                     window.gameData.pulledChars.length > 0;
  
    btns.gallery.style.display = hasChars ? "block" : "none";
  
    // если персонажей нет, а пользователь был в галерее, вернём его на ферму
    if (!hasChars && active === "gallery") switchMode("farm");
  }
  
  /* следим за добавлением новых персонажей */
  (() => {
    const arr = window.gameData.pulledChars;
    if (!Array.isArray(arr)) return;
    const origPush = arr.push;
    arr.push = function (...args) {
      const out = origPush.apply(this, args);
      updateGalleryButtonVisibility();
      return out;
    };
  })();
  
  
  /* ╔══════════════════════════════╗
     ║  ДИНАМИЧЕСКАЯ ЗАГРУЗКА JS    ║
     ╚══════════════════════════════╝ */
  let galleryLoaded = false;
  function loadGalleryJS() {
    return new Promise((resolve, reject) => {
      if (galleryLoaded || window.createGalleryContent) return resolve();
      const s = document.createElement("script");
      s.src = "gallery.js";          // путь к файлу с галереей
      s.onload = () => { galleryLoaded = true; resolve(); };
      s.onerror = (e) => reject(new Error("Не удалось загрузить gallery.js"));
      document.head.appendChild(s);
    });
  }
  
  
  /* ╔══════════════════════════╗
     ║  ПЕРЕКЛЮЧЕНИЕ  РЕЖИМОВ   ║
     ╚══════════════════════════╝ */
  const container = document.getElementById("content-container");
  const subtitle  = document.getElementById("subtitle");
  
  const modeSubtitles = {
    farm:    "Tap For The Dawn",
    shop:    "Every Choice Has Its Price",
    wish:    "Hope Is a Risk",
    gallery: "Hall of Memories"
  };
  
  function activate(name) {
    Object.values(btns).forEach(b => b.classList.remove("active"));
    if (btns[name]) btns[name].classList.add("active");
  }
  
  async function switchMode(name) {
    if (active === name || isSwitching) return;
    if (!(name in modeSubtitles)) return;
  
    isSwitching = true;
  
    // ── при необходимости подгрузим скрипт галереи
    if (name === "gallery" && typeof window.createGalleryContent !== "function") {
      try { await loadGalleryJS(); }
      catch (err) {
        alert(err.message);
        isSwitching = false;
        return switchMode("farm");     // откат на ферму, если ошибка
      }
    }
  
    activate(name);
  
    /* уход предыдущего контента */
    if (active) {
      subtitle.classList.remove("fade-in");
      subtitle.classList.add("fade-out");
      const old = container.firstChild;
      old.classList.add("fade-out");
  
      await Promise.all([
        new Promise(res => subtitle.addEventListener("animationend", res, { once:true })),
        new Promise(res => old.addEventListener("animationend", res, { once:true }))
      ]);
  
      container.removeChild(old);
    }
  
    /* создание нового контента */
    subtitle.textContent = modeSubtitles[name];
    subtitle.classList.remove("fade-out");
    subtitle.classList.add("fade-in");
  
    const fnName = "create" + name.charAt(0).toUpperCase() + name.slice(1) + "Content";
    let fn = window[fnName];
  
    // запасной вариант: если после подгрузки функция всё равно не появилась
    if (typeof fn !== "function") {
      fn = () => {
        const d = document.createElement("div");
        d.className = name + "-content";
        return d;  // пустой контейнер
      };
    }
  
    const node = fn();
    node.classList.add("fade-in");
    container.appendChild(node);
  
    active = name;
    localStorage.setItem("lastMode", name);
    isSwitching = false;
  }
  
  /* кнопки */
  btns.farm   .addEventListener("click", () => switchMode("farm"));
  btns.shop   .addEventListener("click", () => switchMode("shop"));
  btns.wish   .addEventListener("click", () => switchMode("wish"));
  btns.gallery.addEventListener("click", () => switchMode("gallery"));
  
  /* запуск */
  updateGalleryButtonVisibility();
  switchMode(localStorage.getItem("lastMode") || "farm");
  
  
  /* ╔═════════════════════════════════╗
     ║  СБРОС ПРОГРЕССА / БАНКРОТСТВО ║
     ╚═════════════════════════════════╝ */
  document.getElementById("btn-reset").addEventListener("click", () => {
    if (confirm("Ты точно хочешь объявить о банкротстве?")) {
      window.removeEventListener("beforeunload", window.saveGameData);
      localStorage.clear();
      window.gameData = { spice:0, coins:0, intel:0, amd:0, autoRate:0, pulledChars:[] };
      window.updateCurrencyDisplay();
      location.reload();
    }
  });
  
  
  /* ╔══════════════════════════╗
     ║  ПРОЧЕЕ (фон, секреты)   ║
     ╚══════════════════════════╝ */
  window.hideControls = false;
  window.applyControlsHidden = () =>
    document.body.classList.toggle("controls-hidden", !!window.hideControls);
  
  window.applyControlsHidden();
  
  window.setMainBackground = function (newMainBgUrl) {
    let overlay = document.getElementById("bg-fade-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "bg-fade-overlay";
      Object.assign(overlay.style, {
        position:"fixed", top:0, left:0,
        width:"100vw", height:"100vh",
        background:`url("resource/bg/pixel_bg.png") no-repeat center/cover,
                    url("${newMainBgUrl}") no-repeat center/cover`,
        opacity:"0", transition:"opacity .8s ease",
        zIndex:"-1", pointerEvents:"none"
      });
      document.body.appendChild(overlay);
    } else {
      overlay.style.background =
        `url("resource/bg/pixel_bg.png") no-repeat center/cover,
         url("${newMainBgUrl}") no-repeat center/cover`;
    }
    requestAnimationFrame(() => overlay.style.opacity = "1");
    overlay.addEventListener("transitionend", function handler() {
      document.body.style.background =
        `url("resource/bg/pixel_bg.png") no-repeat center/cover,
         url("${newMainBgUrl}") no-repeat center/cover`;
      overlay.style.opacity = "0";
      overlay.removeEventListener("transitionend", handler);
    }, { once:true });
  };
  
  /* секретный код на 1000 никелей */
  (() => {
    const secret = "UZUMEFM";
    let buf = "";
    window.addEventListener("keydown", e => {
      const k = e.key.toUpperCase();
      if (/^[A-Z]$/.test(k)) {
        buf += k;
        if (buf.endsWith(secret)) {
          window.gameData.coins += 1000;
          window.updateCurrencyDisplay();
          buf = "";
        }
        if (buf.length > secret.length) buf = buf.slice(-secret.length);
      }
    });
  })();
  