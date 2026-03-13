// chara_info.js
// ─────────────────────────────────────────────────────────────────────────────
// Модуль с информацией о персонажах для режима «Gallery».
// Экспортирует глобальную переменную window.charaInfo, содержащую
// мапу пути к спрайту → объект с displayName, stars и description.
// ─────────────────────────────────────────────────────────────────────────────

(function() {
    if (window.charaInfo) return; // не перезаписываем, если уже загружено
  
    window.charaInfo = {
      // Богини
      'resource/wishes_chara/All Goddesses/Neptune_dress.png': {
        displayName: 'Нептун (в платье)',
        stars: 5,
        description: 'Богиня Планептуна, оптимистичная и энергичная.'
      },
      'resource/wishes_chara/All Goddesses/Neptune_hoody.png': {
        displayName: 'Нептун (в худи)',
        stars: 5,
        description: 'Нептун в своём уютном парка-платье. Просто чтобы вы знали: да, она что-то носит под ним.'
      },
      'resource/wishes_chara/All Goddesses/Noire_classic.png': {
        displayName: 'Ноар',
        stars: 5,
        description: 'Честолюбивая богиня Ластейшен, всегда стремится быть лучше.'
      },
      'resource/wishes_chara/All Goddesses/Noire_alter.png': {
        displayName: 'Ноар (альтернативная)',
        stars: 4,
        description: 'Ноар из параллельного измерения, в более откровенном и стилёвом наряде.'
      },
      'resource/wishes_chara/All Goddesses/Blanc_classic.png': {
        displayName: 'Блан',
        stars: 5,
        description: 'Спокойная и сдержанная богиня Луви, любящая читать, писать и своих младших сестёр.'
      },
      'resource/wishes_chara/All Goddesses/Blanc_alter.png': {
        displayName: 'Блан (альтернативная)',
        stars: 3,
        description: 'Блан из параллельного измерения. Не смогла отстоять свою же страну и прибегла к помощи других богинь.'
      },
      'resource/wishes_chara/All Goddesses/Vert_classic.png': {
        displayName: 'Верт',
        stars: 3,
        description: 'Просто богиня Линбокс. Затворница.'
      },
      'resource/wishes_chara/All Goddesses/Vert_alter.png': {
        displayName: 'Верт (альтернативная)',
        stars: 3,
        description: 'Верт из параллельного измерения. О ней правда больше нечего сказать.'
      },
  
      // Сёстры
      'resource/wishes_chara/All Sisters/Nepgear_sailor.png': {
        displayName: 'Непгир',
        stars: 4,
        description: 'Младшая сестра Нептуны, не смотря на это, она более ответственная \"Взрослая\"'
      },
      'resource/wishes_chara/All Sisters/Nepgear_CPU.png': {
        displayName: 'Непгир (CPU)',
        stars: 4,
        description: 'Непгир в своей божественной форме. Всё ещё младшая богиня.'
      },
      'resource/wishes_chara/All Sisters/Ram_classic.png': {
        displayName: 'Рам',
        stars: 3,
        description: 'Младшая из младших сестёр Блан. Очень активная и раздражительная.'
      },
      'resource/wishes_chara/All Sisters/Ram_CPU.png': {
        displayName: 'Рам (CPU)',
        stars: 4,
        description: 'Рам в своей божественной форме.'
      },
      'resource/wishes_chara/All Sisters/Rom_classic.png': {
        displayName: 'Ром',
        stars: 3,
        description: 'Старшая из младших сестёр Блан. Скромная, боится незнакомцев.'
      },
      'resource/wishes_chara/All Sisters/Rom_CPU.png': {
        displayName: 'Ром (CPU)',
        stars: 4,
        description: 'Ром в своей божественной форме. Более решительная, но всё ещё не Рам.'
      },
      'resource/wishes_chara/All Sisters/Uni_classic.png': {
        displayName: 'Юни',
        stars: 4,
        description: 'Младшая сестра Ноар. Стремится стать такой же сильной, как и её старшая Сестра.'
      },
      'resource/wishes_chara/All Sisters/Uni_CPU.png': {
        displayName: 'Юни (CPU)',
        stars: 4,
        description: 'Божественная форма Юни для отстаивания своих позиций.'
      }
    };
  })();
  