/* ============================================================
   Thiệp mời Lễ Tốt Nghiệp — Hoài Thương (style cute)
   ============================================================ */

(function () {
  'use strict';

  /* ------------------------------------------------------------------ *
   * DÁN LINK WEB APP CỦA GOOGLE APPS SCRIPT VÀO ĐÂY
   * (xem hướng dẫn trong HUONG-DAN-LOI-CHUC.md)
   * Ví dụ: 'https://script.google.com/macros/s/AKfycbx..../exec'
   * Để trống thì lời chúc chỉ lưu tạm trong máy người xem.
   * ------------------------------------------------------------------ */
  var WISH_API = 'https://script.google.com/macros/s/AKfycbwNbBz3Q9kAVZIGD8hm1SXlvtUgrbNX-VlB37obdg4UCqybCa3hHabZdrhJLOCt50w/exec';
  var DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1550720378668711947/WWLWSiYb4EuHLtF3kryXECIvtT4dVDJCa0-JsZsuInjrTCF7UPN8U0JvpXLocX56ZE06';

  /* --- Thông tin buổi lễ --------------------------------------------- */
  // 8:00 sáng, Thứ Bảy 26/09/2026 (giờ Việt Nam, UTC+7)
  var EVENT = { start: new Date('2026-09-26T08:00:00+07:00') };

  var $ = function (id) { return document.getElementById(id); };
  var rand = function (min, max) { return min + Math.random() * (max - min); };

  function sendDiscordDirect(ten, loi, luc) {
    if (!DISCORD_WEBHOOK_URL) return;

    fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Sổ lưu bút Hoài Thương',
        allowed_mentions: { parse: [] },
        embeds: [{
          title: 'Có lời chúc mới',
          color: 10184504,
          fields: [
            { name: 'Người gửi', value: ten, inline: true },
            { name: 'Lời chúc', value: loi, inline: false }
          ],
          timestamp: luc,
          footer: { text: 'Thiệp mời Lễ Tốt Nghiệp' }
        }]
      })
    }).catch(function () {});
  }

  /* --- Tên khách mời: đọc từ ?ten=... hoặc #ten ----------------------- */
  (function setGuestName() {
    var el = $('guestName');
    if (!el) return;

    var raw = new URLSearchParams(location.search).get('ten') ||
              decodeURIComponent(location.hash.replace(/^#/, ''));
    if (!raw) return;

    var name = raw.trim().replace(/\s+/g, ' ').slice(0, 60);
    if (name) el.textContent = name;
  })();

  /* --- Tim & sao bay lơ lửng ------------------------------------------ */
  (function sky() {
    var box = $('sky');
    if (!box) return;

    var glyphs = ['♡', '✿', '✦', '♥', '✧', '🎀'];
    var tints = ['#ffb8d3', '#ff92bd', '#d9c9f7', '#ffe2a8', '#b7e7dc'];

    for (var i = 0; i < 18; i++) {
      var s = document.createElement('span');
      s.textContent = glyphs[i % glyphs.length];
      s.style.left = rand(0, 100).toFixed(2) + '%';
      s.style.setProperty('--size', rand(14, 30).toFixed(0) + 'px');
      s.style.setProperty('--tint', tints[i % tints.length]);
      s.style.setProperty('--dur', rand(13, 26).toFixed(1) + 's');
      s.style.setProperty('--delay', rand(0, 18).toFixed(1) + 's');
      s.style.setProperty('--spin', rand(-220, 220).toFixed(0) + 'deg');
      box.appendChild(s);
    }
  })();

  /* --- Confetti khi mở thiệp ------------------------------------------ */
  function confetti(count) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var colors = ['#ff92bd', '#f96fa8', '#d9c9f7', '#ffe2a8', '#b7e7dc', '#fffdfe'];
    var box = document.createElement('div');
    box.className = 'confetti';

    for (var i = 0; i < count; i++) {
      var bit = document.createElement('i');
      bit.style.left = rand(0, 100).toFixed(2) + '%';
      bit.style.setProperty('--c', colors[i % colors.length]);
      bit.style.setProperty('--dur', rand(2.4, 4.6).toFixed(2) + 's');
      bit.style.setProperty('--delay', rand(0, 1.2).toFixed(2) + 's');
      bit.style.setProperty('--spin', rand(-720, 720).toFixed(0) + 'deg');
      bit.style.width = rand(7, 12).toFixed(0) + 'px';
      bit.style.height = rand(10, 18).toFixed(0) + 'px';
      if (i % 3 === 0) bit.style.borderRadius = '50%';
      box.appendChild(bit);
    }

    document.body.appendChild(box);
    window.setTimeout(function () { box.remove(); }, 6500);
  }

  /* --- Mở thiệp ------------------------------------------------------- */
  var opener = $('opener');
  var card = $('card');
  var backgroundMusic = $('backgroundMusic');
  var musicToggle = $('musicToggle');
  var musicLabel = $('musicLabel');

  function updateMusicButton() {
    if (!musicToggle || !musicLabel || !backgroundMusic) return;
    var isPlaying = !backgroundMusic.paused;
    musicLabel.textContent = isPlaying ? 'Music: On' : 'Music: Off';
    musicToggle.setAttribute('aria-label', isPlaying ? 'Tắt nhạc' : 'Bật nhạc');
    musicToggle.setAttribute('aria-pressed', String(isPlaying));
    musicToggle.classList.toggle('is-playing', isPlaying);
  }

  function playBackgroundMusic() {
    if (!backgroundMusic) return;
    backgroundMusic.load();
    var playback = backgroundMusic.play();
    if (playback && typeof playback.catch === 'function') playback.catch(function () {});
    updateMusicButton();
  }

  function stagger() {
    var items = card.querySelectorAll('.reveal');
    for (var i = 0; i < items.length; i++) {
      items[i].style.setProperty('--d', (i * 0.11).toFixed(2) + 's');
    }
    card.classList.add('is-live');
  }

  function openCard() {
    if (!opener || opener.classList.contains('is-open')) return;
    opener.classList.add('is-open');
    document.body.style.overflow = '';
    stagger();
    confetti(60);
    playBackgroundMusic();
    window.setTimeout(function () { opener.remove(); }, 900);
  }

  if (opener) {
    document.body.style.overflow = 'hidden';
    opener.addEventListener('click', openCard);
    $('mail').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCard(); }
    });
    // Tự mở sau 6 giây nếu khách chưa chạm
    window.setTimeout(openCard, 6000);
  } else {
    stagger();
  }

  if (musicToggle) {
    musicToggle.addEventListener('click', function () {
      if (backgroundMusic.paused) playBackgroundMusic();
      else backgroundMusic.pause();
      updateMusicButton();
    });
    backgroundMusic.addEventListener('play', updateMusicButton);
    backgroundMusic.addEventListener('pause', updateMusicButton);
    updateMusicButton();
  }

  $('homeNav').addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  $('wishNav').addEventListener('click', function () {
    var wishes = $('wishes');
    if (wishes) wishes.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* --- Đếm ngược ------------------------------------------------------ */
  (function countdown() {
    var box = $('countdown');
    var label = $('countdownLabel');
    if (!box) return;

    var slots = {
      d: box.querySelector('[data-unit="d"]'),
      h: box.querySelector('[data-unit="h"]'),
      m: box.querySelector('[data-unit="m"]'),
      s: box.querySelector('[data-unit="s"]')
    };

    var pad = function (n) { return n < 10 ? '0' + n : String(n); };

    function tick() {
      var left = EVENT.start.getTime() - Date.now();

      if (left <= 0) {
        label.textContent = 'Hẹn gặp cậu ở buổi lễ nha ♡';
        box.hidden = true;
        window.clearInterval(timer);
        return;
      }

      var s = Math.floor(left / 1000);
      slots.d.textContent = pad(Math.floor(s / 86400));
      slots.h.textContent = pad(Math.floor(s / 3600) % 24);
      slots.m.textContent = pad(Math.floor(s / 60) % 60);
      slots.s.textContent = pad(s % 60);
    }

    tick();
    var timer = window.setInterval(tick, 1000);
  })();

  /* --- Thông báo nhỏ -------------------------------------------------- */
  var toastTimer;
  function toast(msg) {
    var el = $('toast');
    el.textContent = msg;
    el.classList.add('is-on');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { el.classList.remove('is-on'); }, 2600);
  }

  /* ==================================================================== *
   * SỔ LƯU BÚT — gửi & đọc lời chúc từ Google Sheet qua Apps Script
   * Dùng JSONP (thẻ <script>) nên không vướng CORS, chạy được cả khi mở
   * file index.html trực tiếp từ máy.
   * ==================================================================== */
  (function wishes() {
    var form = $('wishForm');
    if (!form) return;

    var elName  = $('wishName');
    var elText  = $('wishText');
    var elTrap  = $('wishTrap');
    var elSend  = $('wishSend');
    var elNote  = $('wishNote');
    var elCount = $('wishCount');
    var elState = $('wishState');
    var elList  = $('wishList');
    var elWrap  = $('wishScroll');

    var LOCAL_KEY = 'loi-chuc-hoai-thuong';
    var NAME_KEY  = 'ten-khach-hoai-thuong';
    var items = [];
    var sending = false;
    var online = !!WISH_API;

    /* --- Gọi Apps Script bằng JSONP --------------------------------- */
    var jsonpId = 0;

    function jsonp(params, done) {
      var name = '__wish_cb_' + (++jsonpId);
      var tag = document.createElement('script');
      var timer;

      function cleanup() {
        window.clearTimeout(timer);
        try { delete window[name]; } catch (e) { window[name] = undefined; }
        if (tag.parentNode) tag.parentNode.removeChild(tag);
      }

      window[name] = function (data) { cleanup(); done(null, data); };
      tag.onerror = function () { cleanup(); done(new Error('network')); };
      timer = window.setTimeout(function () { cleanup(); done(new Error('timeout')); }, 15000);

      var qs = ['callback=' + name];
      for (var k in params) {
        if (Object.prototype.hasOwnProperty.call(params, k)) {
          qs.push(encodeURIComponent(k) + '=' + encodeURIComponent(params[k]));
        }
      }
      tag.src = WISH_API + (WISH_API.indexOf('?') === -1 ? '?' : '&') + qs.join('&');
      document.head.appendChild(tag);
    }

    /* --- Lưu tạm trong máy khi chưa cấu hình Apps Script ------------- */
    function readLocal() {
      try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) || []; }
      catch (e) { return []; }
    }
    function writeLocal(list) {
      try { localStorage.setItem(LOCAL_KEY, JSON.stringify(list.slice(0, 200))); } catch (e) {}
    }

    /* --- Hiển thị ---------------------------------------------------- */
    function esc(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }

    function since(iso) {
      var t = Date.parse(iso);
      if (isNaN(t)) return '';
      var m = Math.floor((Date.now() - t) / 60000);
      if (m < 1) return 'vừa xong';
      if (m < 60) return m + ' phút trước';
      if (m < 1440) return Math.floor(m / 60) + ' giờ trước';
      if (m < 10080) return Math.floor(m / 1440) + ' ngày trước';
      var d = new Date(t);
      return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
    }

    // Ẩn vệt mờ ở đáy khi đã cuộn hết hoặc danh sách còn ngắn
    function updateFade() {
      var atEnd = elList.scrollTop + elList.clientHeight >= elList.scrollHeight - 2;
      elWrap.classList.toggle('is-end', atEnd);
    }
    elList.addEventListener('scroll', updateFade, { passive: true });
    window.addEventListener('resize', updateFade);

    function render(newestId) {
      var total = items.length;

      if (!total) {
        elState.textContent = 'Chưa có lời chúc nào — cậu viết dòng đầu tiên nha ♡';
        elState.hidden = false;
        elList.innerHTML = '';
        updateFade();
        return;
      }

      elState.textContent = 'Đã có ' + total + ' lời chúc ♡ — cuộn để đọc tiếp';
      elState.hidden = false;

      elList.innerHTML = items.map(function (w) {
        var time = since(w.luc);
        return '<li' + (w.id && w.id === newestId ? ' class="is-new"' : '') + '>' +
                 '<p class="wlist__head">' +
                   '<span class="wlist__name">' + esc(w.ten || 'Ẩn danh') + '</span>' +
                   (time ? '<span class="wlist__time">' + time + '</span>' : '') +
                 '</p>' +
                 '<p class="wlist__msg">' + esc(w.loi) + '</p>' +
               '</li>';
      }).join('');

      updateFade();
    }

    /* --- Tải danh sách ----------------------------------------------- */
    function load() {
      if (!online) {
        items = readLocal();
        render();
        note('Chưa nối Google Sheet nên lời chúc đang lưu tạm trên máy cậu.');
        return;
      }

      elState.textContent = 'Đang tải lời chúc…';
      elState.hidden = false;

      jsonp({ action: 'list' }, function (err, res) {
        if (err || !res || !res.ok) {
          items = readLocal();
          render();
          if (!items.length) elState.textContent = 'Chưa tải được lời chúc, cậu thử lại sau nha.';
          return;
        }
        items = res.data || [];
        render();
      });
    }

    /* --- Ghi chú dưới form ------------------------------------------- */
    var noteTimer;
    function note(msg, bad) {
      elNote.textContent = msg;
      elNote.hidden = !msg;
      elNote.classList.toggle('is-bad', !!bad);
      window.clearTimeout(noteTimer);
      if (msg && bad) {
        noteTimer = window.setTimeout(function () { elNote.hidden = true; }, 5000);
      }
    }

    /* --- Đếm ký tự + nhớ tên ----------------------------------------- */
    elText.addEventListener('input', function () {
      elCount.textContent = elText.value.length;
    });

    try {
      var savedName = localStorage.getItem(NAME_KEY);
      if (savedName) elName.value = savedName;
    } catch (e) {}

    /* --- Gửi lời chúc ------------------------------------------------ */
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sending) return;

      if (elTrap.value) return;                    // bot điền vào bẫy

      var ten = elName.value.trim().replace(/\s+/g, ' ').slice(0, 40);
      var loi = elText.value.trim().slice(0, 300);

      if (!ten) { note('Cậu điền tên giúp Thương nha ♡', true); elName.focus(); return; }
      if (loi.length < 2) { note('Lời chúc còn trống kìa!', true); elText.focus(); return; }

      sending = true;
      elSend.disabled = true;
      elSend.textContent = 'Đang gửi…';
      note('');

      try { localStorage.setItem(NAME_KEY, ten); } catch (err) {}

      var wish = { id: 'tmp' + Date.now(), ten: ten, loi: loi, luc: new Date().toISOString() };

      function done(savedOnline) {
        items.unshift(wish);
        if (!savedOnline) writeLocal(items);
        render(wish.id);
        elList.scrollTop = 0;         // lời chúc mới nhất nằm trên cùng
        try { localStorage.removeItem(NAME_KEY); } catch (err) {}
        elName.value = '';
        elText.value = '';
        elCount.textContent = '0';
        sending = false;
        elSend.disabled = false;
        elSend.textContent = 'Gửi lời chúc ♡';
        confetti(24);
        toast('Cảm ơn lời chúc của cậu ♡');
        note(savedOnline ? '' : 'Đang lưu tạm trên máy cậu.');
      }

      if (!online) { done(false); return; }

      jsonp({ action: 'add', ten: ten, loi: loi }, function (err, res) {
        if (err || !res || !res.ok) {
          sending = false;
          elSend.disabled = false;
          elSend.textContent = 'Gửi lời chúc ♡';
          note((res && res.error) || 'Gửi chưa được, cậu thử lại giúp Thương nha!', true);
          return;
        }
        if (res.data && res.data.luc) wish.luc = res.data.luc;
        sendDiscordDirect(wish.ten, wish.loi, wish.luc);
        done(true);
      });
    });

    load();
  })();
})();
