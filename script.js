let currentQ = 0;
let answers = new Array(10).fill(null); // Hardcoded to 10 for safety
let pendingResultKey = 'snake';
let pendingResult = null;

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function startQuiz() {
  const introBg = document.getElementById('intro-bg');
  if (introBg) introBg.classList.add('hidden');
  
  showScreen('quiz');
  renderQuestion(0);
}

window.setLanguage = function(lang) {
  if (!window.__i18n.ui[lang]) return;
  window.__lang = lang;
  try { localStorage.setItem('quiz-lang', lang); } catch(e) {}

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  const ui = window.__i18n.ui[lang];

  ['title', 'subtitle'].forEach(key => {
    const el = document.querySelector(`[data-i18n="${key}"]`);
    if (el) el.innerHTML = ui[key];
  });

  ['badge','btn_start','btn_prev','result_label','share_hint','btn_retry'].forEach(key => {
    document.querySelectorAll(`[data-i18n="${key}"]`).forEach(el => {
      el.textContent = ui[key];
    });
  });

  const quizActive = document.getElementById('screen-quiz')?.classList.contains('active');
  const resultActive = document.getElementById('screen-result')?.classList.contains('active');

  if (quizActive) {
    renderQuestion(currentQ);
  }
  if (resultActive && pendingResult) {
    // Re-fetch result text with new lang
    const oldTotal = pendingResult.total;
    pendingResult = window.__getResult(oldTotal);
    pendingResult.total = oldTotal; // Preserve total for subsequent switches
    
    document.getElementById('res-title').textContent = pendingResult.title;
    document.getElementById('res-desc').textContent = pendingResult.desc;
    drawRadar(pendingResult.scores);
  }
};

function renderQuestion(idx) {
  const _qs = (window.__i18n && window.__i18n.questions[window.__lang]) || questions;
  const q = _qs[idx];
  currentQ = idx;

  const _ui = window.__i18n && window.__i18n.ui[window.__lang];
  document.getElementById('q-count').textContent = _ui ? _ui.q_count(idx + 1, _qs.length) : `第 ${idx + 1} 題，共 ${_qs.length} 題`;
  
  const pct = Math.round((idx / _qs.length) * 100);
  document.getElementById('progress-fill').style.width = pct + '%';

  document.getElementById('q-text').textContent = q.text;
  document.getElementById('q-hint').textContent = q.hint;

  const illust = document.getElementById('q-illust');
  illust.src = `q${idx + 1}.png`;
  illust.style.display = 'block';

  const wrap = document.getElementById('options-wrap');
  wrap.innerHTML = '';
  const labels = ['A', 'B', 'C', 'D'];
  q.options.forEach((opt, oi) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn' + (answers[idx] === oi ? ' selected' : '');
    btn.innerHTML = `<span class="opt-label">${labels[oi]}</span><span>${opt.label}</span>`;
    btn.onclick = () => selectOption(oi);
    wrap.appendChild(btn);
  });

  document.getElementById('btn-prev').disabled = idx === 0;

  const card = document.getElementById('question-card');
  card.style.animation = 'none';
  card.offsetHeight;
  card.style.animation = 'fadeUp 0.35s ease';
}

function selectOption(oi) {
  answers[currentQ] = oi;
  document.querySelectorAll('.option-btn').forEach((btn, i) => {
    btn.classList.toggle('selected', i === oi);
  });

  setTimeout(() => {
    const totalQ = (window.__i18n && window.__i18n.questions[window.__lang]) ? window.__i18n.questions[window.__lang].length : 10;
    if (currentQ < totalQ - 1) {
      renderQuestion(currentQ + 1);
    } else {
      showResult();
    }
  }, 400);
}

function prevQ() {
  if (currentQ > 0) {
    renderQuestion(currentQ - 1);
  }
}

function showResult() {
  let total = 0;
  const _qs = (window.__i18n && window.__i18n.questions['zh-TW']) || questions;
  answers.forEach((ai, qi) => {
    if (ai !== null && _qs[qi]) {
      total += _qs[qi].options[ai].score;
    }
  });

  pendingResult = window.__getResult(total);
  pendingResult.total = total; // Save total for i18n switching

  document.getElementById('res-title').textContent = pendingResult.title;
  document.getElementById('res-desc').textContent = pendingResult.desc;
  
  const heroImg = document.getElementById('result-hero-img');
  if (heroImg && pendingResult.image) {
    heroImg.src = pendingResult.image;
    heroImg.style.display = 'block';
  }

  showScreen('result');
  setTimeout(() => drawRadar(pendingResult.scores), 100);
  setTimeout(launchConfetti, 300);

  // 3 秒後自動彈出插頁廣告
  setTimeout(() => {
    if (typeof showAdInterstitial === 'function') {
      showAdInterstitial();
    }
  }, 3000);
}

function resetQuiz() {
  const totalQ = (window.__i18n && window.__i18n.questions[window.__lang]) ? window.__i18n.questions[window.__lang].length : 10;
  answers = new Array(totalQ).fill(null);
  currentQ = 0;
  
  const introBg = document.getElementById('intro-bg');
  if (introBg) introBg.classList.remove('hidden');
  
  initPetGrid(); // 重新隨機生成首頁寵物圖
  showScreen('intro');
}

// 繪製雷達圖 (Canvas)
function drawRadar(scoresMap) {
  const canvas = document.getElementById('radarChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  
  if (!canvas.dataset.baseWidth) {
    canvas.dataset.baseWidth = canvas.width;
    canvas.dataset.baseHeight = canvas.height;
  }
  const width = parseInt(canvas.dataset.baseWidth, 10) || 280;
  const height = parseInt(canvas.dataset.baseHeight, 10) || 280;
  
  // 處理高清屏
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.scale(dpr, dpr);
  
  const centerX = width / 2;
  const centerY = height / 2 + 10;
  const radius = Math.min(width, height) / 2 - 40;
  
  const labels = Object.keys(scoresMap);
  const data = Object.values(scoresMap);
  const sides = labels.length;
  const angle = Math.PI * 2 / sides;
  
  ctx.clearRect(0, 0, width, height);
  
  // 畫網格
  ctx.strokeStyle = 'rgba(44,36,22,0.1)';
  ctx.lineWidth = 1;
  for (let level = 1; level <= 5; level++) {
    const r = radius * (level / 5);
    ctx.beginPath();
    for (let i = 0; i <= sides; i++) {
      const a = i * angle - Math.PI / 2;
      const x = centerX + Math.cos(a) * r;
      const y = centerY + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  
  // 畫軸線
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const a = i * angle - Math.PI / 2;
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + Math.cos(a) * radius, centerY + Math.sin(a) * radius);
  }
  ctx.stroke();
  
  // 畫文字
  ctx.font = 'bold 13px "Noto Sans TC"';
  ctx.fillStyle = '#7a6650';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < sides; i++) {
    const a = i * angle - Math.PI / 2;
    const offset = 20;
    const x = centerX + Math.cos(a) * (radius + offset);
    const y = centerY + Math.sin(a) * (radius + offset);
    ctx.fillText(labels[i], x, y);
  }
  
  // 畫資料區域
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const value = data[i] / 100; // 假設分數是 0-100
    const a = i * angle - Math.PI / 2;
    const r = radius * value;
    const x = centerX + Math.cos(a) * r;
    const y = centerY + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(232,137,106,0.3)';
  ctx.fill();
  ctx.strokeStyle = '#e8896a';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // 畫資料點
  for (let i = 0; i < sides; i++) {
    const value = data[i] / 100;
    const a = i * angle - Math.PI / 2;
    const r = radius * value;
    const x = centerX + Math.cos(a) * r;
    const y = centerY + Math.sin(a) * r;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.stroke();
  }
}

// 慶祝動畫
function launchConfetti() {
  const colors = ['#e8896a', '#7c6fc4', '#e8a030', '#7a6650', '#ffffff'];
  for (let i = 0; i < 40; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.setProperty('--tx', (Math.random() * 200 - 100) + 'px');
    confetti.style.animationDelay = Math.random() * 0.5 + 's';
    document.body.appendChild(confetti);
    
    // 清理DOM
    setTimeout(() => {
      if (confetti.parentNode) confetti.parentNode.removeChild(confetti);
    }, 3500);
  }
}

// ── 社群分享相關邏輯 ──
function isLineIAB() {
  return /Line/i.test(navigator.userAgent);
}
function isMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function copyTextFallback(str) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(str).catch(() => execCopyFallback(str));
  }
  return execCopyFallback(str);
}
function execCopyFallback(str) {
  return new Promise((resolve) => {
    const ta = document.createElement('textarea');
    ta.value = str;
    ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;';
    document.body.appendChild(ta);
    ta.focus(); ta.select();
    try { document.execCommand('copy'); } catch(e) {}
    document.body.removeChild(ta);
    resolve();
  });
}

function openUrl(url) {
  window.open(url, '_blank');
}

function shareTo(platform) {
  const url = window.location.href;
  const resTitle = pendingResult ? pendingResult.title : document.getElementById('res-title').textContent;
  const _ui = window.__i18n && window.__i18n.ui[window.__lang];
  const text = _ui ? _ui.share_text(resTitle) : `🐾 萌寵心理測驗結果出爐：我是「${resTitle}」！快來測測看你的動物原型是什麼！`;
  const fullText = encodeURIComponent(text + '\n' + url);

  if (platform === 'copy') {
    copyTextFallback(text + '\n' + url).then(() => {
      showShareToast('✅ 已複製到剪貼簿！');
    });
    return;
  }

  if (platform === 'ig') {
    copyTextFallback(text + '\n' + url).then(() => {
      showShareToast('📸 文字已複製！請到 IG 限動或貼文手動貼上');
      setTimeout(() => {
        if (isMobile()) { window.location.href = 'instagram://app'; }
        else { openUrl('https://www.instagram.com/'); }
      }, 600);
    });
    return;
  }

  let shareUrl = '';
  switch (platform) {
    case 'line':
      if (isMobile()) {
        shareUrl = `line://msg/text/${encodeURIComponent(text + '\n' + url)}`;
      } else if (isLineIAB()) {
        shareUrl = `https://line.me/R/share?text=${fullText}`;
      } else {
        shareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
      }
      break;
    case 'threads':
      shareUrl = `https://www.threads.net/intent/post?text=${fullText}`;
      break;
    case 'x':
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      break;
    case 'fb':
      if (isMobile()) {
        window.location.href = `fb://share/?link=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
        setTimeout(() => {
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank');
        }, 1500);
        return;
      }
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
      break;
  }
  
  if (shareUrl) {
    if (platform === 'line' && isMobile()) {
      window.location.href = shareUrl;
    } else {
      openUrl(shareUrl);
    }
  }
}

function showShareToast(msg) {
  let toast = document.getElementById('share-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'share-toast';
    toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%) translateY(20px);background:rgba(45,36,22,0.95);border:1px solid rgba(232,137,106,0.3);color:#fff;padding:14px 24px;border-radius:16px;font-size:14px;z-index:9999;opacity:0;transition:all 0.3s;backdrop-filter:blur(12px);text-align:center;max-width:320px;';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, 4000);
}

// ── 廣告相關邏輯 ──
function showAdInterstitial() {
  const el = document.getElementById('ad-interstitial');
  if (!el) return;
  el.style.display = 'flex';
  const closeBtn = el.querySelector('.ad-inter-close');
  closeBtn.disabled = true;
  closeBtn.textContent = '5';
  closeBtn.style.cursor = 'not-allowed';
  closeBtn.style.opacity = '0.5';
  let count = 5;
  const timer = setInterval(() => {
    count--;
    if (count <= 0) {
      clearInterval(timer);
      closeBtn.textContent = '✕';
      closeBtn.disabled = false;
      closeBtn.style.cursor = 'pointer';
      closeBtn.style.opacity = '1';
    } else {
      closeBtn.textContent = count;
    }
  }, 1000);
}

function closeAdInterstitial() {
  const el = document.getElementById('ad-interstitial');
  if (!el) return;
  el.style.opacity = '0';
  el.style.transition = 'opacity 0.3s';
  setTimeout(() => {
    el.style.display = 'none';
    el.style.opacity = '1';
    el.style.transition = '';
  }, 300);
}

// ── 首頁寵物圖 ──
function initPetGrid() {
  const grid = document.getElementById('pet-grid');
  if (!grid) return;
  const pets = [
    'chihuahua', 'poodle', 'shiba', 'cat',
    'snake', 'hamster', 'rabbit', 'cow'
  ];
  const mysteryIndex = Math.floor(Math.random() * pets.length);
  let html = '';
  pets.forEach((pet, index) => {
    const isMystery = index === mysteryIndex;
    html += `
      <div class="pet-icon-wrap ${isMystery ? 'mystery' : ''}">
        <img src="result_${pet}.png" class="pet-icon" alt="pet">
      </div>
    `;
  });
  grid.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', initPetGrid);
