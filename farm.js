;(function(){
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      from { transform: translate(-50%, -50%) rotate(0deg); }
      to   { transform: translate(-50%, -50%) rotate(360deg); }
    }
    
    @keyframes flyOut {
      0%   { opacity: 1; transform: translate(-50%, -50%) scale(0.8); }
      100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(1.2); }
    }
    
    .spice-plus-one {
      position: absolute;
      top: 50%;
      left: 50%;
      font-family: 'IntroFriday', sans-serif;
      font-size: 24px;
      color: #fff;
      text-shadow: 0 0 4px rgba(0,0,0,0.8);
      user-select: none;
      pointer-events: none;
      z-index: 0;
      animation: flyOut 1s ease-out forwards;
    }
  `;
  document.head.appendChild(style);
})();

window.createFarmContent = function() {
  const div = document.createElement('div');
  div.className = 'farm-content';

  // вращающийся круг
  const circle = document.createElement('img');
  circle.src = 'resource/ui/just_circle.png';
  Object.assign(circle.style, {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '250px',
    animation: 'spin 25s linear infinite',
    transform: 'translate(-50%, -50%)'
  });
  div.appendChild(circle);

  // иконка пряности
  const icon = document.createElement('img');
  icon.src = 'resource/icons/spice_big.png';
  icon.draggable = false;
  Object.assign(icon.style, {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) scale(1)',
    width: '200px',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'transform .05s ease-in',
    zIndex: '1'
  });
  icon.addEventListener('dragstart', (e) => e.preventDefault());
  // функция для создания вылетающего +1
  function createPlusOneText() {
    const plusOne = document.createElement('div');
    plusOne.className = 'spice-plus-one';
    plusOne.textContent = '+1';
    
    // случайное направление полета
    const angle = Math.random() * Math.PI * 2; // случайный угол в радианах
    const distance = 100 + Math.random() * 100; // случайное расстояние 100-200px
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    
    // устанавливаем CSS переменные для анимации
    plusOne.style.setProperty('--tx', `${tx}px`);
    plusOne.style.setProperty('--ty', `${ty}px`);
    
    div.appendChild(plusOne);
    
    // удалить элемент после завершения анимации
    plusOne.addEventListener('animationend', () => {
      plusOne.remove();
    });
  }

  function handlePress(e) {
    if (e && e.type === 'mousedown' && e.button !== 0) return;
    if (e && typeof e.preventDefault === 'function') e.preventDefault();

    window.gameData.spice += 1;
    window.updateCurrencyDisplay();
    createPlusOneText();

    icon.style.transform = 'translate(-50%, -50%) scale(.8)';
  }

  icon.addEventListener('mousedown', handlePress);
  icon.addEventListener('touchstart', handlePress, { passive: false });

  ['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach(e =>
    icon.addEventListener(e, () =>
      icon.style.transform = 'translate(-50%, -50%) scale(1)'
    )
  );
  
  div.appendChild(icon);

  // сразу показать актуальную цифру
  window.updateCurrencyDisplay();

  // описание
  const desc = document.createElement('p');
  Object.assign(desc.style, {
    position: 'absolute',
    bottom: '20%',
    left: '50%',
    transform: 'translateX(-50%)',
    color: 'white'
  });
  div.appendChild(desc);

  return div;
};