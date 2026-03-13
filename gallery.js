// gallery.js
// ─────────────────────────────────────────────────────────────
// Режим «Gallery»: карточки содержат только имя и звёзды,
// полноэкранный просмотр отображает имя, звёздность и описание.
// Информация о персонажах берётся из chara_info.js (window.charaInfo).
// Canvas не используется.
// ─────────────────────────────────────────────────────────────

;(function() {

    // Путь к модулю с данными персонажей
    const CHARA_INFO_SRC = 'chara_info.js';
  
    // Загружает скрипт chara_info.js, если он ещё не загружен
    function loadCharaInfo() {
      return new Promise((resolve, reject) => {
        if (window.charaInfo || document.querySelector(`script[src="${CHARA_INFO_SRC}"]`)) {
          resolve();
        } else {
          const s = document.createElement('script');
          s.src = CHARA_INFO_SRC;
          s.onload = () => resolve();
          s.onerror = () => reject(new Error(`Не удалось загрузить ${CHARA_INFO_SRC}`));
          document.head.appendChild(s);
        }
      });
    }
  
    // Инъекция CSS-стилей для галереи (однократно)
    function ensureStyles() {
      if (document.getElementById('gallery-styles')) return;
  
      const css = `
        @font-face {
          font-family: 'Genshin Impact';
          src: url('resource/fonts/Genshin_Impact.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
        }
        .gallery-content {
          position: absolute; inset: 0;
          display: flex; justify-content: center; align-items: flex-start;
          padding: 300px 40px 40px; box-sizing: border-box; overflow-y: auto;
        }
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 40px; max-width: 1100px; width: 100%;
        }
        .gallery-item { perspective: 900px; width: 100%; aspect-ratio: 0.7/1; cursor: pointer; }
        .card-inner {
          position: relative; width: 100%; height: 100%;
          transform-style: preserve-3d; transition: transform .12s ease-out;
          border-radius: 6px; overflow: hidden;
        }
        .card-frame {
          position: absolute; inset: 0;
          background: #0d1e3b; border: 4px solid #275cb6; border-radius: 6px;
          box-shadow: 0 0 0 1px rgba(255,255,255,.05) inset, 0 2px 4px rgba(0,0,0,.6);
          display: flex; flex-direction: column;
        }
        .card-header {
          flex: 0 0 auto; text-align: center;
          font-family: 'IntroFriday',sans-serif; letter-spacing: .05em;
          color: #fff; text-transform: uppercase; user-select: none;
          text-shadow: 0 0 3px rgba(0,0,0,.8);
          font-size: 12px; padding: 4px 2px;
          background: linear-gradient(#1b3d7b 0%, #102a57 100%);
          border-bottom: 1px solid #0b162e;
        }
        .card-stars {
          flex: 0 0 auto; text-align: center; font-size: 14px;
          color: #ffd700; padding: 2px 0; user-select: none;
          transform: translateZ(35px);
        }
        .card-image-wrapper {
          position: relative; flex: 1 1 auto; overflow: hidden;
        }
        .card-image-wrapper img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover; object-position: top center;
          user-select: none; image-rendering: pixelated;
          transform: translateZ(30px);
        }
        .gallery-count {
          position: absolute; bottom: 6px; right: 8px;
          background: rgba(0,0,0,.65); color: #fff;
          font-family: 'IntroFriday',sans-serif; font-size: 16px;
          padding: 2px 6px; border-radius: 4px;
          pointer-events: none; transform: translateZ(40px);
        }
        .gallery-viewer {
          position: fixed; inset: 0; display: flex; flex-direction: column; align-items: center;
          background: rgba(0,0,0,.85); z-index: 10000; opacity: 0; transition: opacity .25s;
          padding: 130px; box-sizing: border-box; overflow-y: auto;
        }
        .gallery-viewer.open { opacity: 1; }
        .gallery-viewer img {
          max-width: 80vw; max-height: 60vh; object-fit: contain;
          user-select: none; image-rendering: pixelated;
        }
        .viewer-info {
          margin-top: 20px; text-align: center;
          font-family: 'Genshin Impact'; color: #fff;
        }
        .viewer-name {
          font-size: 32px; margin-bottom: 10px;
          text-shadow: 0 0 4px rgba(0,0,0,.8);
        }
        .viewer-stars {
          font-size: 24px; margin-bottom: 10px;
          color: #ffd700; text-shadow: 0 0 3px rgba(0,0,0,.8);
        }
        .viewer-desc {
          font-size: 16px; max-width: 80vw; line-height: 1.4;
          text-shadow: 0 0 3px rgba(0,0,0,.8);
        }
      `;
      const style = document.createElement('style');
      style.id = 'gallery-styles';
      style.textContent = css;
      document.head.appendChild(style);
    }
  
    // Считает, сколько раз встречается каждый путь и запоминает первый индекс
    function buildCounts(arr) {
      const map = new Map();
      arr.forEach((path, idx) => {
        if (!map.has(path)) map.set(path, { count: 0, first: idx });
        map.get(path).count++;
      });
      return [...map.entries()].sort((a, b) => a[1].first - b[1].first);
    }
  
    // Преобразует путь файла в человекочитаемое имя
    function extractName(path) {
      const file = path.split('/').pop().replace(/\.[^.]+$/, '');
      return file.replace(/[_-]/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase());
    }
  
    // Открывает полноэкранный просмотр карточки
    function openViewer(src, data) {
      let viewer = document.getElementById('gallery-viewer');
      if (!viewer) {
        viewer = document.createElement('div');
        viewer.id = 'gallery-viewer';
        viewer.className = 'gallery-viewer';
        viewer.addEventListener('click', closeViewer);
        document.addEventListener('keydown', escClose);
        document.body.appendChild(viewer);
      }
      viewer.innerHTML = '';
      const img = document.createElement('img');
      img.src = src; img.alt = data.displayName;
      viewer.appendChild(img);
  
      const info = document.createElement('div');
      info.className = 'viewer-info';
      const nameEl = document.createElement('div');
      nameEl.className = 'viewer-name'; nameEl.textContent = data.displayName;
      const starsEl = document.createElement('div');
      starsEl.className = 'viewer-stars';
      starsEl.textContent = '★'.repeat(data.stars) + '☆'.repeat(5 - data.stars);
      const descEl = document.createElement('div');
      descEl.className = 'viewer-desc'; descEl.textContent = data.description;
      info.append(nameEl, starsEl, descEl);
      viewer.appendChild(info);
  
      requestAnimationFrame(() => viewer.classList.add('open'));
  
      function escClose(e) { if (e.key === 'Escape') closeViewer(); }
      function closeViewer() {
        viewer.classList.remove('open');
        viewer.addEventListener('transitionend', () => viewer.remove(), { once: true });
        document.removeEventListener('keydown', escClose);
      }
    }
  
    // Эффект наклона карточки при наведении
    function attachTilt(item, inner) {
      const MAX = 12;
      item.addEventListener('mousemove', e => {
        const r = item.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        inner.style.transform =
          `rotateX(${(0.5 - y) * MAX * 2}deg) rotateY(${(x - 0.5) * MAX * 2}deg)`;
      });
      item.addEventListener('mouseleave', () => {
        inner.style.transition = 'transform .25s ease-out';
        inner.style.transform = 'rotateX(0deg) rotateY(0deg)';
        inner.addEventListener('transitionend', () => {
          inner.style.transition = '';
        }, { once: true });
      });
    }
  
    // Основная функция: создаёт контейнер и заполняет его карточками
    window.createGalleryContent = function() {
      ensureStyles();
      const root = document.createElement('div');
      root.className = 'gallery-content';
      const grid = document.createElement('div');
      grid.className = 'gallery-grid';
      root.appendChild(grid);
  
      function populate() {
        grid.innerHTML = '';
        const list = Array.isArray(window.gameData.pulledChars)
          ? window.gameData.pulledChars
          : [];
        if (!list.length) {
          const msg = document.createElement('p');
          msg.textContent = 'Пока что у вас нет ни одного персонажа.';
          Object.assign(msg.style, {
            fontFamily: "'IntroFriday',sans-serif",
            fontSize: '20px', color: '#fff', margin: 'auto'
          });
          grid.appendChild(msg);
          return;
        }
        buildCounts(list).forEach(([path, info]) => {
          const data = (window.charaInfo && window.charaInfo[path]) || {
            displayName: extractName(path),
            stars: 0,
            description: ''
          };
          const item = document.createElement('div');
          item.className = 'gallery-item';
          const inner = document.createElement('div');
          inner.className = 'card-inner';
          const frame = document.createElement('div');
          frame.className = 'card-frame';
  
          const header = document.createElement('div');
          header.className = 'card-header';
          header.textContent = data.displayName;
          const starsEl = document.createElement('div');
          starsEl.className = 'card-stars';
          starsEl.textContent = '★'.repeat(data.stars) + '☆'.repeat(5 - data.stars);
  
          const imgWrap = document.createElement('div');
          imgWrap.className = 'card-image-wrapper';
          const img = document.createElement('img');
          img.src = path; img.alt = data.displayName;
          imgWrap.appendChild(img);
  
          frame.append(header, starsEl, imgWrap);
          inner.appendChild(frame);
          item.appendChild(inner);
  
          if (info.count > 1) {
            const badge = document.createElement('span');
            badge.className = 'gallery-count';
            badge.textContent = `×${info.count}`;
            inner.appendChild(badge);
          }
  
          attachTilt(item, inner);
          item.addEventListener('click', () => openViewer(path, data));
          grid.appendChild(item);
        });
      }
  
      // Если данные charaInfo уже загружены — сразу заполняем, иначе грузим и потом
      if (window.charaInfo) {
        populate();
      } else {
        loadCharaInfo()
          .then(() => populate())
          .catch(err => console.error(err));
      }
  
      return root;
    };
  
  })();
  