// wish.js
/*  -----------------------------------------------------------
    Режим «Wish».
    ▸ Баннер изначально скрыт; появляется после клика на мини-кнопке
      «Goddesses» / «Sisters».
    ▸ Спрайты, имена и звёздность берутся из chara_info.js
      (window.charaInfo), никаких дубликатов в коде нет.
    ▸ При выпадении персонажа показываются его спрайт, имя и «звёзды».
      Компоненты создаются на чистом DOM, canvas НЕ используется.
   ----------------------------------------------------------- */

   ;(function () {

    /* ╔═════════════════════════════╗
       ║  ЗАГРУЗКА chara_info.js     ║
       ╚═════════════════════════════╝ */
    const CHARA_INFO_SRC = 'chara_info.js';
  
    function loadCharaInfo () {
      return new Promise((resolve, reject) => {
        if (window.charaInfo) return resolve();
  
        const existing = document.querySelector(`script[src="${CHARA_INFO_SRC}"]`);
        if (existing) {
          existing.addEventListener('load', () => resolve(),  { once: true });
          existing.addEventListener('error', () =>
            reject(new Error(`Не удалось загрузить ${CHARA_INFO_SRC}`)), { once: true });
          return;
        }
  
        const s = document.createElement('script');
        s.src = CHARA_INFO_SRC;
        s.onload  = () => resolve();
        s.onerror = () => reject(new Error(`Не удалось загрузить ${CHARA_INFO_SRC}`));
        document.head.appendChild(s);
      });
    }
  
    /** Возвращает массив путей к спрайтам нужной категории. */
    function getSpriteList (key) {
      if (!window.charaInfo) return [];
      const folder = key === 'goddesses' ? '/All Goddesses/' : '/All Sisters/';
      return Object.keys(window.charaInfo).filter(p => p.includes(folder));
    }
  
  
    /* ╔══════════════════════════════╗
       ║  СОЗДАНИЕ КОНТЕНТА РЕЖИМА    ║
       ╚══════════════════════════════╝ */
    window.createWishContent = function () {
      const div = document.createElement('div');
      div.className = 'wish-content';
  
      /* ---------- ГЛОБАЛЬНЫЕ КОНСТАНТЫ ---------- */
      const WISH_COMPLETE_BG = 'resource/bg/wish_complete_bg.png';
      const ORIGINAL_MAIN_BG = 'resource/bg/main_bg.png';
  
      const LOADING_MESSAGES = [
        'Перебираем пряности…',
        'Собираем шейр‑кристаллы…',
        'Разгоняем видеокарты…',
        'Готовим отчёт для Истоар…',
        'Крутим альтернативные баннеры…',
        'Выбиваем юбки…',
        'Синхронизируем Subtick…',
        'Убаюкиваем Пурурут…',
        'Запрашиваем разрешение у Консула…',
        'Пишем .log файл…',
        'Делаем перерыв на чай…',
        'Травим анекдоты…'
      ];
  
      /* ---------- ГЛОБАЛЬНЫЕ СТИЛИ (один раз) ---------- */
      if (!document.getElementById('wish-banner-styles')) {
        const style = document.createElement('style');
        style.id = 'wish-banner-styles';
        style.textContent = `
          /* баннеры */
          .wish-banner-bg,
          .wish-banner-fg{
            position:absolute;top:55%;left:50%;
            transform:translate(-50%,-50%);
            opacity:0;height:500px;pointer-events:none;
            transition:transform .6s ease,opacity .6s ease;
            will-change:transform,opacity;
          }
          .wish-banner-bg{z-index:4}.wish-banner-fg{z-index:5}
  
          /* анимация букв */
          @keyframes letter-in{0%{transform:translateY(120%);opacity:0}
                               100%{transform:translateY(0);opacity:1}}
          @keyframes letter-out{0%{transform:translateY(0);opacity:1}
                                100%{transform:translateY(120%);opacity:0}}
          .wish-letter      {display:inline-block}
          .wish-letter.in   {animation:letter-in  .4s ease-out forwards}
          .wish-letter.out  {animation:letter-out .25s ease-in  forwards}
        `;
        document.head.appendChild(style);
      }
  
      /* ---------- КОНТЕЙНЕР БАННЕР-КНОПОК ---------- */
      const bannerContainer = document.createElement('div');
      Object.assign(bannerContainer.style, {
        position: 'absolute',
        top: '4%',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '16px',
        zIndex: 10
      });
  
      /* ---------- РЕСУРСЫ БАННЕРОВ ---------- */
      const variants = {
        goddesses: {
          btn: {
            norm: 'resource/banners/button_all-goddesses_bg_normal.png',
            hov : 'resource/banners/button_all-goddesses_bg_hovered.png',
            fg  : 'resource/banners/button_all-goddesses_fg.png'
          },
          banner: {
            bg: 'resource/banners/banner_all-goddesses_bg.png',
            fg: 'resource/banners/banner_all-goddesses_fg.png'
          }
        },
        sisters: {
          btn: {
            norm: 'resource/banners/button_all-sisters_bg_normal.png',
            hov : 'resource/banners/button_all-sisters_bg_hovered.png',
            fg  : 'resource/banners/button_all-sisters_fg.png'
          },
          banner: {
            bg: 'resource/banners/banner_all-sisters_bg.png',
            fg: 'resource/banners/banner_all-sisters_fg.png'
          }
        }
      };
  
      /* ---------- ДЕРЖАТЕЛЬ АКТИВНОГО БАННЕРА (СКРЫТ) ---------- */
      const activeBannerHolder = document.createElement('div');
      Object.assign(activeBannerHolder.style, {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'none'
      });
      div.appendChild(activeBannerHolder);
  
      /* ---------- КНОПКИ МОЛИТВЫ ---------- */
      const prayerBox = document.createElement('div');
      Object.assign(prayerBox.style, {
        position: 'absolute',
        top: '82%',
        left: '58%',
        transform: 'translateX(-50%)',
        display: 'none',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '16px',
        zIndex: 10
      });
      div.appendChild(prayerBox);
  
      /* ---------- БАЗОВЫЙ СТИЛЬ КНОПОК ---------- */
      const baseButtonStyle = {
        padding: '12px 20px',
        fontSize: '16px',
        cursor: 'pointer',
        backgroundColor: '#444',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontFamily: '"IntroFriday",sans-serif',
        transition: 'transform .1s,background-color .1s,opacity .1s'
      };
      function addButtonEffects (btn) {
        btn.addEventListener('mouseenter', () => {
          if (btn.disabled) return;
          btn.style.backgroundColor = '#555';
          btn.style.transform = 'scale(1.04)';
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.backgroundColor = btn.disabled ? '#666' : '#444';
          btn.style.transform = 'scale(1)';
        });
        btn.addEventListener('mousedown', () => {
          if (btn.disabled) return;
          btn.style.transform = 'scale(0.95)';
        });
        btn.addEventListener('mouseup', () => {
          btn.style.transform = btn.disabled ? 'scale(1)' : 'scale(1.04)';
        });
      }
      function setButtonEnabled (btn, en) {
        btn.disabled        = !en;
        btn.style.opacity   = en ? '1' : '0.5';
        btn.style.cursor    = en ? 'pointer' : 'not-allowed';
        btn.style.backgroundColor = en ? '#444' : '#666';
        btn.style.transform = 'scale(1)';
      }
  
      /* ---------- ФАБРИКА КНОПКИ «ПОМОЛИТЬСЯ» ---------- */
      function createPrayerButton (times) {
        const btn = document.createElement('button');
        Object.assign(btn.style, baseButtonStyle);
        addButtonEffects(btn);
  
        const icon  = document.createElement('img');
        Object.assign(icon.style, { width: '24px', height: '24px', margin: '0 8px' });
        const label = document.createTextNode('');
  
        btn.append(
          document.createTextNode(`Помолиться ${times}× (`),
          icon,
          label,
          document.createTextNode(')')
        );
        btn._times = times;
        btn._icon  = icon;
        btn._label = label;
  
        btn.onclick = () => {
          if (btn.disabled) return;
          if (currentKey === 'goddesses') window.gameData.amd  -= times;
          else                            window.gameData.intel -= times;
          window.updateCurrencyDisplay();
          updatePrayerButtons();
  
          bannerContainer.style.display   = 'none';
          activeBannerHolder.style.display = 'none';
          prayerBox.style.display         = 'none';
          startPrayerSequence();
        };
        return btn;
      }
  
      // единственная кнопка «1×»
      const pray1 = createPrayerButton(1);
      prayerBox.append(pray1);
  
      /* ---------- ОБНОВЛЕНИЕ ДОСТУПНОСТИ КНОПКИ ---------- */
      function updatePrayerButtons () {
        if (!currentKey) return;
        const god   = currentKey === 'goddesses';
        const ico   = god ? 'resource/icons/amd.png' : 'resource/icons/intel.png';
        const have  = god ? window.gameData.amd       : window.gameData.intel;
        const title = god ? 'AMD RX 5500 XT'
                          : 'Intel(R) Core(TM) i5-9400F CPU @ 2.90 GHz';
  
        pray1._icon.src         = ico;
        pray1._icon.alt         = title;
        pray1._label.nodeValue  = ' ' + pray1._times;
        pray1.title             = `Помолиться ${pray1._times} раз за ${pray1._times} ${title}`;
        setButtonEnabled(pray1, have >= pray1._times);
      }
  
      /* ---------- ОТОБРАЖЕНИЕ БАННЕРА ---------- */
      let currentKey = null,
          prayerInProgress = false;
  
      function showBanner (key) {
        if (key === currentKey || prayerInProgress) return;
        currentKey = key;
  
        activeBannerHolder.style.display = 'block';
  
        const bgNew = document.createElement('img');
        bgNew.className = 'wish-banner-bg';
        bgNew.src = variants[key].banner.bg;
        const fgNew = document.createElement('img');
        fgNew.className = 'wish-banner-fg';
        fgNew.src = variants[key].banner.fg;
  
        bgNew.style.transform = 'translate(-50%,-50%) translateX(20px)';
        fgNew.style.transform = 'translate(-50%,-50%) translateX(30px)';
        activeBannerHolder.append(bgNew, fgNew);
  
        Array
          .from(activeBannerHolder.querySelectorAll('.wish-banner-bg,.wish-banner-fg'))
          .filter(el => el !== bgNew && el !== fgNew)
          .forEach(el => {
            const shift = el.classList.contains('wish-banner-bg') ? 20 : 30;
            el.style.transition = 'transform .3s,opacity .3s';
            requestAnimationFrame(() => {
              el.style.transform = `translate(-50%,-50%) translateX(${shift}px)`;
              el.style.opacity   = '0';
            });
            el.addEventListener('transitionend', () => el.remove(), { once: true });
          });
  
        requestAnimationFrame(() => {
          bgNew.style.opacity = fgNew.style.opacity = '1';
          bgNew.style.transform = fgNew.style.transform = 'translate(-50%,-50%)';
        });
  
        prayerBox.style.display = 'flex';
        updatePrayerButtons();
      }
  
      /* ---------- МИНИ-КНОПКИ БАННЕРА ---------- */
      const buttonsArr = [];
      function createMiniButton (key) {
        const wrap = document.createElement('div');
        Object.assign(wrap.style, {
          position: 'relative',
          display: 'inline-block',
          overflow: 'hidden',
          paddingTop: '20px',
          cursor: 'pointer',
          userSelect: 'none'
        });
  
        const bgNorm = document.createElement('img');
        bgNorm.src = variants[key].btn.norm;
        Object.assign(bgNorm.style, { display: 'block', height: '80px', transition: 'opacity .3s' });
  
        const bgHov = document.createElement('img');
        bgHov.src = variants[key].btn.hov;
        Object.assign(bgHov.style, {
          position: 'absolute', top: '20px', left: 0, height: '80px',
          opacity: 0, transition: 'opacity .3s', pointerEvents: 'none'
        });
  
        const fgImg = document.createElement('img');
        fgImg.src = variants[key].btn.fg;
        Object.assign(fgImg.style, {
          position: 'absolute', left: '50%', top: 0, height: '90px',
          transform: 'translate(-50%,22px)', transition: 'transform .3s',
          pointerEvents: 'none'
        });
  
        wrap.append(bgNorm, bgHov, fgImg);
        buttonsArr.push({ wrap, bgNorm, bgHov, fgImg });
  
        wrap.addEventListener('click', () => {
          if (prayerInProgress) return;
          buttonsArr.forEach(b => {
            const active = b.wrap === wrap;
            b.bgNorm.style.opacity = active ? '0' : '1';
            b.bgHov.style.opacity  = active ? '1' : '0';
            b.fgImg.style.transform = active
              ? 'translate(-50%,10px)'
              : 'translate(-50%,22px)';
          });
          showBanner(key);
        });
        return wrap;
      }
      bannerContainer.append(
        createMiniButton('goddesses'),
        createMiniButton('sisters')
      );
      div.appendChild(bannerContainer);
  
      /* ===============================================================
                             С Е К В Е Н Ц И Я  М О Л И Т В Ы
         ==============================================================*/
      async function startPrayerSequence () {
        if (prayerInProgress) return;
        prayerInProgress = true;
  
        // гарантируем, что данные персонажей загружены
        await loadCharaInfo();
  
        /* ---------- Overlay ---------- */
        let ov = document.getElementById('pray-overlay');
        if (!ov) {
          ov = document.createElement('div');
          ov.id = 'pray-overlay';
          Object.assign(ov.style, {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'black',
            opacity: 0,
            transition: 'opacity .3s,background-color .15s',
            zIndex: 9999
          });
          document.body.appendChild(ov);
        }
        ov.style.opacity = '1';
        ov.style.pointerEvents = 'auto';
  
        /* ---------- Loading icon ---------- */
        const loadingIcon = document.createElement('img');
        let frameIdx = 0;
        const frames = 5, frameDur = 120;
        loadingIcon.src = `resource/s_loadingicon/s_loadingicon_${frameIdx}.png`;
        Object.assign(loadingIcon.style, {
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)', width: '64px',
          height: '64px', userSelect: 'none',
          pointerEvents: 'none', imageRendering: 'pixelated'
        });
        ov.appendChild(loadingIcon);
        const iconTimer = setInterval(() => {
          frameIdx = (frameIdx + 1) % frames;
          loadingIcon.src = `resource/s_loadingicon/s_loadingicon_${frameIdx}.png`;
        }, frameDur);
  
        /* ---------- Loading text ---------- */
        const loadingText = document.createElement('div');
        Object.assign(loadingText.style, {
          position: 'absolute', top: '58%', left: '50%',
          transform: 'translate(-50%,-50%)',
          fontFamily: '"IntroFriday",sans-serif',
          fontSize: '18px', color: '#fff',
          whiteSpace: 'nowrap', pointerEvents: 'none',
          textAlign: 'center', textShadow: '0 0 6px rgba(0,0,0,.8)'
        });
        ov.appendChild(loadingText);
  
        /* ---------- АНИМАЦИЯ ТЕКСТА ---------- */
        const charDelay = 50;
        const readPause = 800;
        let textTimers = [];
  
        function clearTextTimers () {
          textTimers.forEach(id => clearTimeout(id));
          textTimers = [];
        }
        function schedule (fn, ms) {
          const id = setTimeout(fn, ms);
          textTimers.push(id);
        }
  
        function showMessageQueue (list, idx = 0) {
          const msg = list[idx];
          hideCurrent(() =>
            revealNew(msg, () => {
              const next = (idx + 1) % list.length;
              schedule(() => showMessageQueue(list, next),
                       msg.length * charDelay + readPause + 200);
            })
          );
        }
        function hideCurrent (cb) {
          const spans = [...loadingText.querySelectorAll('.wish-letter')];
          if (!spans.length) { cb(); return; }
          spans.forEach((sp, i) => {
            sp.classList.remove('in');
            sp.classList.add('out');
            sp.style.animationDelay = (i * 0.03) + 's';
          });
          const last = spans[spans.length - 1];
          last.addEventListener('animationend', () => {
            loadingText.innerHTML = '';
            cb();
          }, { once: true });
        }
        function revealNew (txt, cb) {
          let pos = 0;
          function addNext () {
            const ch = txt[pos];
            if (ch === ' ') {
              loadingText.appendChild(document.createTextNode(' '));
            } else {
              const span = document.createElement('span');
              span.textContent = ch;
              span.className   = 'wish-letter in';
              loadingText.appendChild(span);
            }
            pos++;
            if (pos < txt.length) schedule(addNext, charDelay);
            else schedule(cb, readPause);
          }
          addNext();
        }
  
        /* запускаем очередь */
        const shuffled = LOADING_MESSAGES.slice().sort(() => Math.random() - 0.5);
        showMessageQueue(shuffled.slice(0, 3));
  
        /* ---------- скрываем общий UI ---------- */
        window.hideControls = true;
        window.applyControlsHidden();
  
        /* ---------- 5 секунд «тьмы» ---------- */
        setTimeout(() => {
          clearInterval(iconTimer);
          clearTextTimers();
          loadingIcon.remove();
          loadingText.remove();
  
          ov.style.backgroundColor = 'white';
          ov.style.opacity = '1';
  
          window.setMainBackground(WISH_COMPLETE_BG);
  
          /* ---------- Контейнер результата ---------- */
          let result = document.getElementById('wish-result');
          if (result) result.remove();
          result = document.createElement('div');
          result.id = 'wish-result';
          Object.assign(result.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            zIndex: 10000
          });
  
          const spriteList = getSpriteList(currentKey);
          const spritePath = spriteList[Math.floor(Math.random() * spriteList.length)];
  
          /* ---------- ДАННЫЕ ПЕРСОНАЖА ---------- */
          const ci = window.charaInfo && window.charaInfo[spritePath];
          const displayName = ci ? ci.displayName
                                 : spritePath.split('/').pop().replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ');
          const stars = ci ? ci.stars : 0;
  
          // сохраняем выпадение
          window.gameData.pulledChars.push(spritePath);
          window.saveGameData();
  
          const charImg = document.createElement('img');
          charImg.src = spritePath;
          charImg.alt = displayName;
          Object.assign(charImg.style, {
            maxHeight: '70vh',
            objectFit: 'contain',
            userSelect: 'none',
            pointerEvents: 'none',
            filter: 'brightness(0)',
            transform: 'translateX(80px)',
            transition: 'transform .6s'
          });
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              charImg.style.transform = 'translateX(0)';
            })
          );
          charImg.addEventListener('transitionend', e => {
            if (e.propertyName !== 'transform') return;
            charImg.style.transition = 'filter .4s';
            requestAnimationFrame(() => { charImg.style.filter = 'brightness(1)'; });
          }, { once: true });
  
          /* ---------- ИМЯ И ЗВЁЗДНОСТЬ ---------- */
          const nameEl = document.createElement('div');
          nameEl.textContent = displayName;
          Object.assign(nameEl.style, {
            fontFamily: '"Genshin Impact","IntroFriday",sans-serif',
            fontSize: '36px',
            color: '#fff',
            textAlign: 'center',
            textShadow: '0 0 4px rgba(0,0,0,.8)',
            userSelect: 'none'
          });
  
          const starsEl = document.createElement('div');
          starsEl.textContent = '★'.repeat(stars) + '☆'.repeat(5 - stars);
          Object.assign(starsEl.style, {
            fontFamily: '"IntroFriday",sans-serif',
            fontSize: '28px',
            color: '#ffd700',
            textAlign: 'center',
            textShadow: '0 0 3px rgba(0,0,0,.8)',
            userSelect: 'none'
          });
  
          /* ---------- КНОПКА OK ---------- */
          const okBtn = document.createElement('button');
          okBtn.textContent = 'Ладно';
          Object.assign(okBtn.style, baseButtonStyle, { padding: '10px 40px', fontSize: '20px' });
          addButtonEffects(okBtn);
          okBtn.addEventListener('click', () => {
            result.remove();
            window.setMainBackground(ORIGINAL_MAIN_BG);
            bannerContainer.style.display    = 'flex';
            activeBannerHolder.style.display = 'block';
            prayerBox.style.display          = 'flex';
            window.hideControls = false;
            window.applyControlsHidden();
            ov.style.opacity        = '0';
            ov.style.pointerEvents  = 'none';
            ov.style.backgroundColor = 'black';
            prayerInProgress = false;
          });
  
          result.append(charImg, nameEl, starsEl, okBtn);
          document.body.appendChild(result);
  
          /* гасим вспышку через 150 мс */
          setTimeout(() => { ov.style.opacity = '0'; }, 150);
  
        }, 10000); // «тьма» 5 с
      } // end startPrayerSequence
  
  
  
      /* ---------- ВОЗВРАТ КОРНЯ ---------- */
      return div;
    }; // createWishContent
  
  })(); // IIFE
  