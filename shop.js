window.createShopContent = function () {
    const div = document.createElement("div");
    div.className = "shop-content";
  
    /* ---------------------- данные о системах ---------------------- */
    const systems = [
      { displayName: "👽 Система автодобычи DEXP",          cost: 80,  rate: 1 },
      { displayName: "🔻 Система автодобычи ARDOR GAMING", cost: 130, rate: 3 },
      { displayName: "➰ Система автодобычи Logitech",      cost: 200, rate: 5 },
      { displayName: "🟢 Система автодобычи Razer",        cost: 300, rate: 8 },
      { displayName: "🈯 Система автодобычи Nvidia",       cost: 500, rate: 10 }
    ];
  
    /* ---------------------- прогресс покупки ----------------------- */
    let currentSystemIndex = parseInt(localStorage.getItem("currentSystemIndex"), 10) || 0;
  
    /* ---------------------- базовые стили кнопок ------------------- */
    const baseButtonStyle = {
      padding: "12px 20px",
      fontSize: "16px",
      margin: "8px 0",
      cursor: "pointer",
      backgroundColor: "#444",
      color: "white",
      border: "none",
      borderRadius: "8px",
      width: "100%",
      boxSizing: "border-box",
      fontFamily: "'IntroFriday', sans-serif",
      transition: "transform .1s ease, background-color .1s ease, opacity .1s ease"
    };
  
    /* ---------------------- контейнер кнопок ----------------------- */
    const buttonContainer = document.createElement("div");
    Object.assign(buttonContainer.style, {
      position: "absolute",
      top: "45%",
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      zIndex: "10",
      width: "300px",
      maxWidth: "90%"
    });
  
    /* ---------------------- утилита эффектов ----------------------- */
    function addButtonEffects(btn) {
      btn.addEventListener("mouseenter", () => {
        if (btn.disabled) return;
        btn.style.backgroundColor = "#555";
        btn.style.transform = "scale(1.04)";
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.backgroundColor = btn.disabled ? "#666" : "#444";
        btn.style.transform = "scale(1)";
      });
      btn.addEventListener("mousedown", () => {
        if (btn.disabled) return;
        btn.style.transform = "scale(0.95)";
      });
      btn.addEventListener("mouseup", () => {
        btn.style.transform = btn.disabled ? "scale(1)" : "scale(1.04)";
      });
    }
  
    /* ---------------------- сеттер доступности --------------------- */
    function setButtonEnabled(btn, enabled) {
      btn.disabled = !enabled;
      btn.style.opacity = enabled ? "1" : "0.5";
      btn.style.cursor  = enabled ? "pointer" : "not-allowed";
      btn.style.backgroundColor = enabled ? "#444" : "#666";
      btn.style.transform = "scale(1)";
    }
  
    /* ---------------------- кнопка покупки системы ----------------- */
    const buySystemButton = document.createElement("button");
    Object.assign(buySystemButton.style, baseButtonStyle);
    addButtonEffects(buySystemButton);
  
    function updateSystemButtonText() {
      buySystemButton.innerHTML = "";
      if (currentSystemIndex < systems.length) {
        const s = systems[currentSystemIndex];
        // подсказка
        buySystemButton.title = `Автоматически добывает ${s.rate} пряности в секунду`;
        // текст с названием
        buySystemButton.appendChild(document.createTextNode(s.displayName + " ("));
        // иконка никеля
        const img = document.createElement("img");
        img.src = "resource/icons/nickel.png";
        img.alt = "никель";
        img.style.width = "24px";
        img.style.height = "24px";
        img.style.verticalAlign = "middle";
        img.style.margin = "0 4px";
        buySystemButton.appendChild(img);
        // цена
        buySystemButton.appendChild(document.createTextNode(s.cost + ")"));
      } else {
        buySystemButton.textContent = "Все системы куплены";
        buySystemButton.title = "";
      }
    }
  
    buySystemButton.onclick = () => {
      if (currentSystemIndex >= systems.length) return;
      const s = systems[currentSystemIndex];
      if (gameData.coins >= s.cost) {
        gameData.coins -= s.cost;
        gameData.autoRate = (gameData.autoRate || 0) + s.rate;
        currentSystemIndex++;
        localStorage.setItem("currentSystemIndex", currentSystemIndex);
        updateCurrencyDisplay();
        updateButtons();
      }
    };
  
    /* ---------------------- фабрика кнопок обмена ------------------ */
    function createExchangeButton(lImg, lAmt, lLabel, rImg, rAmt, rLabel, exchangeFn) {
      const btn = document.createElement("button");
      Object.assign(btn.style, baseButtonStyle, {
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      });
      addButtonEffects(btn);
      btn.title = `${lAmt} ${lLabel} → ${rAmt} ${rLabel}`;
  
      const imgL = document.createElement("img");
      imgL.src = lImg;
      imgL.alt = lLabel;
      imgL.style.width = "24px";
      imgL.style.height = "24px";
      imgL.style.marginRight = "8px";
  
      const imgR = document.createElement("img");
      imgR.src = rImg;
      imgR.alt = rLabel;
      imgR.style.width = "24px";
      imgR.style.height = "24px";
      imgR.style.marginLeft = "8px";
  
      btn.append(imgL,
                 document.createTextNode(lAmt),
                 document.createTextNode(" → "),
                 imgR,
                 document.createTextNode(rAmt));
  
      btn.onclick = () => {
        if (btn.disabled) return;
        if (exchangeFn()) {
          updateCurrencyDisplay();
          updateButtons();
        }
      };
      return btn;
    }
  
    /* ---------------------- создаём кнопки обмена ------------------ */
    const exchangeSpiceToCoinButton = createExchangeButton(
      "resource/icons/spice_small.png", "20", "пряности",
      "resource/icons/nickel.png",      "1",  "никель",
      () => {
        if (gameData.spice >= 20) {
          gameData.spice -= 20;
          gameData.coins += 1;
          return true;
        }
        return false;
      }
    );
  
    const exchangeCoinToIntelButton = createExchangeButton(
      "resource/icons/nickel.png", "15", "никелей",
      "resource/icons/intel.png",  "1",  "Intel",
      () => {
        if (gameData.coins >= 15) {
          gameData.coins -= 15;
          gameData.intel += 1;
          return true;
        }
        return false;
      }
    );
  
    const exchangeCoinToAMDButton = createExchangeButton(
      "resource/icons/nickel.png", "30", "никелей",
      "resource/icons/amd.png",   "1",  "AMD",
      () => {
        if (gameData.coins >= 30) {
          gameData.coins -= 30;
          gameData.amd += 1;
          return true;
        }
        return false;
      }
    );
  
    /* ---------------------- логика доступности --------------------- */
    function updateButtons() {
      if (currentSystemIndex < systems.length) {
        setButtonEnabled(buySystemButton, gameData.coins >= systems[currentSystemIndex].cost);
      } else {
        setButtonEnabled(buySystemButton, false);
      }
      setButtonEnabled(exchangeSpiceToCoinButton, gameData.spice >= 20);
      setButtonEnabled(exchangeCoinToIntelButton,  gameData.coins >= 15);
      setButtonEnabled(exchangeCoinToAMDButton,    gameData.coins >= 30);
      updateSystemButtonText();
    }
  
    /* ---------------------- инициализация ------------------------- */
    updateButtons();
  
    /* ---------------------- сборка интерфейса ---------------------- */
    buttonContainer.append(
      buySystemButton,
      exchangeSpiceToCoinButton,
      exchangeCoinToIntelButton,
      exchangeCoinToAMDButton
    );
    div.appendChild(buttonContainer);
  
    const desc = document.createElement("p");
    Object.assign(desc.style, {
      position: "absolute",
      bottom: "10%",
      left: "50%",
      transform: "translateX(-50%)",
      color: "white",
      fontSize: "20px",
      textAlign: "center"
    });
    div.appendChild(desc);
  
    return div;
  };
  