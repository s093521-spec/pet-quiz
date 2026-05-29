// 1. 讀取儲存的語言偏好（預設 zh-TW）
window.__lang = (function() {
  try { return localStorage.getItem('quiz-lang') || 'zh-TW'; } catch(e) { return 'zh-TW'; }
})();

// 結果 Meta (共用圖片等)
var _resultMeta = {
  'snake': { min: 0, max: 4, image: 'result_snake.png' },
  'cat': { min: 5, max: 8, image: 'result_cat.png' },
  'shiba': { min: 9, max: 12, image: 'result_shiba.png' },
  'rabbit': { min: 13, max: 16, image: 'result_rabbit.png' },
  'hamster': { min: 17, max: 20, image: 'result_hamster.png' },
  'cow': { min: 21, max: 24, image: 'result_cow.png' },
  'poodle': { min: 25, max: 27, image: 'result_poodle.png' },
  'chihuahua': { min: 28, max: 30, image: 'result_chihuahua.png' }
};

window.__i18n = {
  ui: {
    'zh-TW': {
      badge:             '🐾 萌寵心理測驗',
      title:             '測測你的靈魂裡<br>住著哪種萌寵？',
      subtitle:          '10個日常小情境，測出你最真實的可愛本性！<br>⚠️ 準備好面對你的動物原型了嗎？',
      btn_start:         '開始測驗',
      q_count:           function(n, total) { return `第 ${n} 題，共 ${total} 題`; },
      btn_prev:          '← 上一題',
      result_label:      '你的萌寵人格是...',
      share_hint:        '📸 截圖分享給朋友，看看他們是什麼寵物！',
      btn_retry:         '↺ 再測一次',
      share_text: function(resTitle) {
        return `🐾 萌寵心理測驗結果出爐：我是「${resTitle}」！快來測測看你的動物原型是什麼！`;
      }
    },
    'en': {
      badge:             '🐾 Cute Pet Personality Quiz',
      title:             'What Cute Pet<br>Lives in Your Soul?',
      subtitle:          '10 daily scenarios to reveal your true cute nature!<br>⚠️ Ready to face your animal archetype?',
      btn_start:         'Start Quiz',
      q_count:           function(n, total) { return `Q${n} / ${total}`; },
      btn_prev:          '← Back',
      result_label:      'Your Pet Personality is...',
      share_hint:        '📸 Share with friends and see what pet they are!',
      btn_retry:         '↺ Retake Quiz',
      share_text: function(resTitle) {
        return `🐾 Pet Quiz Result: I'm a "${resTitle}"! Find out your inner animal archetype here!`;
      }
    }
  },

  questions: {
    'zh-TW': typeof questions !== 'undefined' ? questions : [],
    'en': [
      {
        text: 'How do you usually wake up on a weekend morning?',
        hint: 'Think about your truest weekend morning routine',
        options: [
          { label: 'Wake up naturally and scroll on my phone for ages', score: 0 },
          { label: 'Set an alarm and get up as planned', score: 2 },
          { label: 'Woken up by hunger or outside noise', score: 1 },
          { label: 'Jump out of bed, eager to start the day', score: 3 }
        ]
      },
      {
        text: 'A friend asks you out 30 minutes before meeting. Your reaction?',
        hint: 'Sudden change of plans',
        options: [
          { label: 'Make an excuse. I need advance notice.', score: 0 },
          { label: 'Depends on my mood. If I feel like it, I\'ll go.', score: 1 },
          { label: 'A bit rushed, but I\'ll get ready quickly.', score: 2 },
          { label: 'Say yes instantly! Love spontaneous hangouts.', score: 3 }
        ]
      },
      {
        text: 'How do you comfort yourself after feeling extremely wronged?',
        hint: 'Handling negative emotions',
        options: [
          { label: 'Process it silently, don\'t want to talk about it.', score: 0 },
          { label: 'Treat myself to good food or some shopping.', score: 1 },
          { label: 'Complain to my most trusted person.', score: 2 },
          { label: 'Post a story or vent loudly immediately.', score: 3 }
        ]
      },
      {
        text: 'At a party where you know no one, what\'s your role?',
        hint: 'Your social positioning',
        options: [
          { label: 'Observe from the corner, stay invisible.', score: 0 },
          { label: 'Only chat with people who look approachable.', score: 1 },
          { label: 'Make polite conversation and smile.', score: 2 },
          { label: 'Break the ice and mingle with everyone quickly.', score: 3 }
        ]
      },
      {
        text: 'Someone asks for a favor you really don\'t want to do.',
        hint: 'Testing boundaries and temper',
        options: [
          { label: 'Refuse directly. Won\'t force myself.', score: 0 },
          { label: 'Agree but feel annoyed, or procrastinate.', score: 1 },
          { label: 'Sigh, do it anyway, and do it well.', score: 2 },
          { label: 'Blow up instantly: "Why me?!"', score: 3 }
        ]
      },
      {
        text: 'Seeing a completely useless but super cute item, you think:',
        hint: 'Reacting to temptations',
        options: [
          { label: 'What is this for? Waste of money. (Poker face)', score: 0 },
          { label: 'So cute! But I have nowhere to put it... (Hesitates)', score: 1 },
          { label: 'Just buy it! Looking at it makes me happy.', score: 2 },
          { label: 'Screams! Buys one for my friend too!', score: 3 }
        ]
      },
      {
        text: 'Assigned a brand new and difficult task, your first thought?',
        hint: 'Handling pressure',
        options: [
          { label: 'So annoying, why me again?', score: 0 },
          { label: 'A bit anxious, worried I\'ll mess up.', score: 1 },
          { label: 'Quietly start planning step by step.', score: 2 },
          { label: 'Awesome! Another chance to show my skills.', score: 3 }
        ]
      },
      {
        text: 'Your perfect way to spend a rainy weekend?',
        hint: 'Seeking comfort',
        options: [
          { label: 'Lock myself in my room, nobody bother me.', score: 0 },
          { label: 'Cuddle on the couch, binge-watch and eat snacks.', score: 1 },
          { label: 'Tidy up the room or enjoy a nice cup of tea.', score: 2 },
          { label: 'Invite friends over for a house party or board games.', score: 3 }
        ]
      },
      {
        text: 'A friend accidentally breaks your favorite item. Your reaction?',
        hint: 'Directness of emotion expression',
        options: [
          { label: 'Say it\'s fine, but secretly deduct points from them.', score: 0 },
          { label: 'Very sad but hold back my anger.', score: 1 },
          { label: 'Communicate calmly about compensation.', score: 2 },
          { label: 'Explode immediately: "How could you?!"', score: 3 }
        ]
      },
      {
        text: 'Which phrase best describes you?',
        hint: 'Last question, go with your gut',
        options: [
          { label: 'Unpredictable', score: 0 },
          { label: 'Simple & Happy', score: 1 },
          { label: 'Warm & Reliable', score: 2 },
          { label: 'Dramatic & Expressive', score: 3 }
        ]
      }
    ]
  },

  resultText: {
    'zh-TW': {
      'snake': {
        title: '冷靜神秘蛇',
        desc: '喜歡獨處空間，不輕易流露情緒，觀察力敏銳且理性。對你來說，保持適當距離是最舒服的社交狀態。',
        scores: { '熱情度': 30, '獨立性': 95, '共情力': 40, '適應力': 60, '穩定度': 80 }
      },
      'cat': {
        title: '多變主子貓',
        desc: '平時高冷獨立，但偶爾又會突然爆走或展現極度貼心的一面。你的心思難以捉摸，這正是你的迷人之處。',
        scores: { '熱情度': 45, '獨立性': 90, '共情力': 50, '適應力': 70, '穩定度': 50 }
      },
      'shiba': {
        title: '傲嬌小柴犬',
        desc: '表面倔強有個性，其實內心柔軟，只對在乎的人展現可愛。不輕易妥協，但對認定的人非常忠誠。',
        scores: { '熱情度': 60, '獨立性': 75, '共情力': 65, '適應力': 60, '穩定度': 65 }
      },
      'rabbit': {
        title: '軟萌小兔兔',
        desc: '心思細膩，需要滿滿的安全感和溫柔對待。你對周遭環境很敏感，總是能察覺到別人忽略的小細節。',
        scores: { '熱情度': 70, '獨立性': 40, '共情力': 85, '適應力': 50, '穩定度': 45 }
      },
      'hamster': {
        title: '呆萌小倉鼠',
        desc: '喜歡待在自己的舒適圈，擁有自己的小世界就能開心很久。容易滿足，是個懂得知足常樂的小可愛。',
        scores: { '熱情度': 50, '獨立性': 60, '共情力': 60, '適應力': 40, '穩定度': 75 }
      },
      'cow': {
        title: '憨厚老實牛',
        desc: '默默付出不抱怨，腳踏實地，是身邊人最可靠的後盾。只要是你答應的事，就一定會努力做到最好。',
        scores: { '熱情度': 65, '獨立性': 70, '共情力': 80, '適應力': 85, '穩定度': 95 }
      },
      'poodle': {
        title: '精緻貴賓犬',
        desc: '注重生活品質，腦筋轉得飛快，懂得如何討人喜歡。你在人群中總是閃閃發光，適應力極強。',
        scores: { '熱情度': 85, '獨立性': 50, '共情力': 90, '適應力': 95, '穩定度': 70 }
      },
      'chihuahua': {
        title: '暴走吉娃娃',
        desc: '情緒豐富且起伏大，充滿謎之自信與爆發力。你毫不掩飾自己的喜怒哀樂，活得非常真實坦率。',
        scores: { '熱情度': 95, '獨立性': 85, '共情力': 45, '適應力': 65, '穩定度': 20 }
      }
    },
    'en': {
      'snake': {
        title: 'Cool Mystic Snake',
        desc: 'Loves solitude and keeps emotions hidden. Highly observant and rational — a safe distance is your ideal social state.',
        scores: { 'Enthusiasm': 30, 'Independence': 95, 'Empathy': 40, 'Adaptability': 60, 'Stability': 80 }
      },
      'cat': {
        title: 'Moody Boss Cat',
        desc: 'Usually aloof and independent, but occasionally bursts into craziness or extreme sweetness. Unpredictability is your charm.',
        scores: { 'Enthusiasm': 45, 'Independence': 90, 'Empathy': 50, 'Adaptability': 70, 'Stability': 50 }
      },
      'shiba': {
        title: 'Tsundere Shiba',
        desc: 'Appears stubborn but has a soft heart. You only show your cute side to those who truly matter. Loyal to the core.',
        scores: { 'Enthusiasm': 60, 'Independence': 75, 'Empathy': 65, 'Adaptability': 60, 'Stability': 65 }
      },
      'rabbit': {
        title: 'Soft Fluffy Bunny',
        desc: 'Sensitive and delicate, you need plenty of security and gentle care. You easily notice little details others miss.',
        scores: { 'Enthusiasm': 70, 'Independence': 40, 'Empathy': 85, 'Adaptability': 50, 'Stability': 45 }
      },
      'hamster': {
        title: 'Derpy Hamster',
        desc: 'Content in your comfort zone. Just having your own little world makes you incredibly happy. Easily satisfied and grateful.',
        scores: { 'Enthusiasm': 50, 'Independence': 60, 'Empathy': 60, 'Adaptability': 40, 'Stability': 75 }
      },
      'cow': {
        title: 'Honest Gentle Cow',
        desc: 'A silent giver who never complains. Down-to-earth and the most reliable backbone for everyone around you.',
        scores: { 'Enthusiasm': 65, 'Independence': 70, 'Empathy': 80, 'Adaptability': 85, 'Stability': 95 }
      },
      'poodle': {
        title: 'Elegant Poodle',
        desc: 'Values life quality, quick-witted, and knows how to be liked. You always shine in a crowd with top adaptability.',
        scores: { 'Enthusiasm': 85, 'Independence': 50, 'Empathy': 90, 'Adaptability': 95, 'Stability': 70 }
      },
      'chihuahua': {
        title: 'Chaotic Chihuahua',
        desc: 'Highly emotional with dramatic mood swings. Full of mysterious confidence and explosive energy. You live authentically.',
        scores: { 'Enthusiasm': 95, 'Independence': 85, 'Empathy': 45, 'Adaptability': 65, 'Stability': 20 }
      }
    }
  }
};

window.__getResult = function(total) {
  // 找對應結果
  let key = 'snake'; // fallback
  for (let k in _resultMeta) {
    if (total >= _resultMeta[k].min && total <= _resultMeta[k].max) {
      key = k;
      break;
    }
  }
  var meta = _resultMeta[key];
  var text = (window.__i18n.resultText[window.__lang] || window.__i18n.resultText['zh-TW'])[key]
          || window.__i18n.resultText['zh-TW'][key];
  return Object.assign({}, meta, text, { __key: key });
};
