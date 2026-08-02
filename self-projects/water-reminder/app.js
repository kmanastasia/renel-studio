/*
 * お水ごくごく — app.js
 *
 * 責務:
 *  - 摂取量の記録（localStorage / 日付が変わったら自動リセット）
 *  - 円形ゲージと水滴アニメ
 *  - 通知許可 → Push購読 → サーバーへ登録
 *  - iOS 判定と「ホーム画面に追加」誘導
 *  - デモモード（サーバー未構築でも、アプリを開いている間は設定時刻にローカル通知）
 */
(function () {
  'use strict';

  /* =======================================================================
   * 設定（デプロイ時に差し替える）
   * =====================================================================*/

  // VAPID 公開鍵。生成手順は outputs/build_notes.md 参照。
  // 秘密鍵はここには絶対に置かない（Cloudflare Workers の Secret で管理）。
  var VAPID_PUBLIC_KEY = 'BEP6hJT1eaF-KryMrFVzNkPo2HyO1n2gkTZiCxXi82U0aTMg3M_URLBhsgkRhnVfry1H_PFJy_j1t03WK7Orj7I';

  // Cloudflare Workers のエンドポイント（例: https://water-reminder-push.xxx.workers.dev）
  var API_BASE = 'https://water-reminder-push.k-murata0301.workers.dev';

  // プレースホルダのままなら本番Pushは無効。デモモードのみで動く。
  var PUSH_CONFIGURED =
    VAPID_PUBLIC_KEY.indexOf('YOUR_') === -1 && API_BASE.indexOf('YOUR_') === -1;

  var DEFAULT_GOAL = 2000;
  // 「＋じぶんで」で一度に記録できる範囲。常識的な一杯〜大ボトルを想定。
  var CUSTOM_MIN_ML = 1;
  var CUSTOM_MAX_ML = 2000;
  var DEFAULT_TIMES = ['09:00', '13:00', '17:00', '20:00'];
  var DEMO_CHECK_INTERVAL_MS = 30 * 1000;
  var DEMO_FIRE_WINDOW_MIN = 5; // 設定時刻から何分以内なら鳴らすか（タブ復帰時の取りこぼし対策）
  var GAUGE_CIRCUMFERENCE = 603.19; // 2πr, r=96

  var STORAGE_KEY = 'waterReminder.v1';

  /* =======================================================================
   * 状態
   * =====================================================================*/

  var defaultState = function () {
    return {
      date: todayKey(),
      intake: 0,
      goal: DEFAULT_GOAL,
      times: DEFAULT_TIMES.map(function (t) { return { time: t, enabled: true }; }),
      firedSlots: [],   // その日すでに鳴らした時刻
      nudgeCount: 0,    // 今日の声かけ回数
      lastMessage: ''
    };
  };

  var state = load();
  var celebrated = false;

  // load() で日付リセットが起きた場合、その結果を保存まで確定させておく
  // （保存し忘れると localStorage に前日の数値が残り続ける）
  save();

  function todayKey() {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function load() {
    var fresh = defaultState();
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return fresh;
      var saved = JSON.parse(raw);
      // 日付が変わっていたら、今日の記録だけリセット（設定は引き継ぐ）
      if (saved.date !== fresh.date) {
        saved.date = fresh.date;
        saved.intake = 0;
        saved.firedSlots = [];
        saved.nudgeCount = 0;
      }
      fresh.goal = typeof saved.goal === 'number' ? saved.goal : fresh.goal;
      fresh.times = Array.isArray(saved.times) && saved.times.length ? saved.times : fresh.times;
      fresh.intake = saved.intake || 0;
      fresh.firedSlots = saved.firedSlots || [];
      fresh.nudgeCount = saved.nudgeCount || 0;
      fresh.lastMessage = saved.lastMessage || '';
      return fresh;
    } catch (e) {
      return fresh;
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* プライベートブラウズ等で失敗しても動作は継続する */
    }
  }

  /** 日付をまたいだら状態を巻き戻す（開きっぱなし対策） */
  function rolloverIfNeeded() {
    var key = todayKey();
    if (state.date === key) return false;
    state.date = key;
    state.intake = 0;
    state.firedSlots = [];
    state.nudgeCount = 0;
    celebrated = false;
    save();
    return true;
  }

  /* =======================================================================
   * DOM
   * =====================================================================*/

  var el = {
    headerDate: document.getElementById('headerDate'),
    headerGreeting: document.getElementById('headerGreeting'),
    gauge: document.getElementById('gauge'),
    gaugeValue: document.getElementById('gaugeValue'),
    gaugePercent: document.getElementById('gaugePercent'),
    gaugeFace: document.getElementById('gaugeFace'),
    amountEdit: document.getElementById('amountEdit'),
    amountCurrent: document.getElementById('amountCurrent'),
    amountGoal: document.getElementById('amountGoal'),
    drinkBtn: document.getElementById('drinkBtn'),
    particles: document.getElementById('particles'),
    subButtons: document.querySelectorAll('.sub-btn[data-amount]'),
    customBtn: document.getElementById('customBtn'),
    customPanel: document.getElementById('customPanel'),
    customInput: document.getElementById('customInput'),
    customSubmit: document.getElementById('customSubmit'),
    customChips: document.querySelectorAll('#customChips .chip'),
    settingsToggle: document.getElementById('settingsToggle'),
    settingsBody: document.getElementById('settingsBody'),
    timeList: document.getElementById('timeList'),
    resetTimes: document.getElementById('resetTimes'),
    goalInput: document.getElementById('goalInput'),
    permitBtn: document.getElementById('permitBtn'),
    permitNote: document.getElementById('permitNote'),
    bellBadge: document.getElementById('bellBadge'),
    footerStreak: document.getElementById('footerStreak'),
    a2hsBanner: document.getElementById('a2hsBanner'),
    a2hsClose: document.getElementById('a2hsClose'),
    toast: document.getElementById('toast')
  };

  /* =======================================================================
   * 描画
   * =====================================================================*/

  var WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

  var GREETINGS = [
    { from: 0,  to: 6,  text: 'よふかしさん、水分だけはね' },
    { from: 6,  to: 11, text: 'おはよ、今日もいこ' },
    { from: 11, to: 15, text: 'おつかれ、ひと息どう？' },
    { from: 15, to: 19, text: '午後もぼちぼちいこ' },
    { from: 19, to: 24, text: 'おかえり、今日もおつかれさま' }
  ];

  function renderHeader() {
    var d = new Date();
    el.headerDate.textContent =
      '今日、' + (d.getMonth() + 1) + '/' + d.getDate() + '(' + WEEKDAYS[d.getDay()] + ')';
    var h = d.getHours();
    var g = GREETINGS.find(function (x) { return h >= x.from && h < x.to; });
    el.headerGreeting.textContent = g ? g.text : 'やっほ';
  }

  function renderGauge() {
    var ratio = state.goal > 0 ? state.intake / state.goal : 0;
    var clamped = Math.max(0, Math.min(1, ratio));
    el.gaugeValue.style.strokeDashoffset = String(GAUGE_CIRCUMFERENCE * (1 - clamped));
    el.gaugePercent.textContent = Math.round(ratio * 100) + '%';

    if (clamped >= 1) {
      el.gaugeFace.textContent = '😊';
      el.gaugeFace.classList.add('gauge__face--happy');
      if (!celebrated) {
        celebrated = true;
        el.gauge.classList.remove('gauge--celebrate');
        void el.gauge.offsetWidth; // reflow でアニメを再実行
        el.gauge.classList.add('gauge--celebrate');
        showToast('今日のぶん、達成だね 🎉');
      }
    } else {
      el.gaugeFace.textContent = '💧';
      el.gaugeFace.classList.remove('gauge__face--happy');
      celebrated = false;
    }
  }

  function renderAmount() {
    el.amountCurrent.textContent = state.intake.toLocaleString('ja-JP');
    el.amountGoal.textContent = state.goal.toLocaleString('ja-JP');
    el.goalInput.value = state.goal;
  }

  function renderFooter() {
    el.footerStreak.textContent = state.nudgeCount === 0
      ? '今日はまだ声かけてないよ 🐣'
      : '今日は' + state.nudgeCount + '回声かけたよ 🐣';
  }

  function renderTimes() {
    el.timeList.innerHTML = '';
    state.times.forEach(function (slot, i) {
      var li = document.createElement('li');
      li.className = 'time-row';

      var label = document.createElement('label');
      label.className = 'switch';
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = slot.enabled !== false;
      cb.setAttribute('aria-label', slot.time + ' の通知');
      cb.addEventListener('change', function () {
        state.times[i].enabled = cb.checked;
        save();
        syncSubscriptionSettings();
      });
      var track = document.createElement('span');
      track.className = 'switch__track';
      label.appendChild(cb);
      label.appendChild(track);

      var input = document.createElement('input');
      input.type = 'time';
      input.value = slot.time;
      input.disabled = !cb.checked;
      input.addEventListener('change', function () {
        state.times[i].time = input.value || slot.time;
        save();
        renderTimes();
        syncSubscriptionSettings();
      });
      cb.addEventListener('change', function () { input.disabled = !cb.checked; });

      var del = document.createElement('button');
      del.type = 'button';
      del.className = 'time-row__delete';
      del.textContent = '×';
      del.setAttribute('aria-label', slot.time + ' を削除');
      del.addEventListener('click', function () {
        state.times.splice(i, 1);
        save();
        renderTimes();
        syncSubscriptionSettings();
      });

      li.appendChild(label);
      li.appendChild(input);
      li.appendChild(del);
      el.timeList.appendChild(li);
    });
    refreshSettingsHeight();
  }

  function render() {
    renderHeader();
    renderGauge();
    renderAmount();
    renderFooter();
  }

  /* =======================================================================
   * 摂取量の記録
   * =====================================================================*/

  function addIntake(ml) {
    rolloverIfNeeded();
    state.intake = Math.max(0, state.intake + ml);
    save();
    renderGauge();
    renderAmount();
  }

  function spawnParticles(count) {
    for (var i = 0; i < count; i++) {
      (function (i) {
        var span = document.createElement('span');
        span.className = 'particle';
        span.textContent = '💧';
        span.style.setProperty('--dx', (Math.random() * 60 - 30).toFixed(0) + 'px');
        span.style.animationDelay = (i * 60) + 'ms';
        el.particles.appendChild(span);
        setTimeout(function () { span.remove(); }, 900 + i * 60);
      })(i);
    }
  }

  el.drinkBtn.addEventListener('click', function () {
    addIntake(200);
    spawnParticles(3);
  });

  Array.prototype.forEach.call(el.subButtons, function (btn) {
    btn.addEventListener('click', function () {
      addIntake(Number(btn.dataset.amount));
      flashButton(btn);
    });
  });

  function flashButton(btn) {
    btn.classList.add('sub-btn--flash');
    setTimeout(function () { btn.classList.remove('sub-btn--flash'); }, 300);
  }

  /* =======================================================================
   * 任意ml入力（＋じぶんで）
   * =====================================================================*/

  function openCustomPanel(open) {
    el.customBtn.setAttribute('aria-expanded', String(open));
    el.customPanel.style.maxHeight = open ? el.customPanel.scrollHeight + 'px' : '0px';
    if (open) {
      el.customInput.focus();
    } else {
      clearChipSelection();
    }
  }

  function clearChipSelection() {
    Array.prototype.forEach.call(el.customChips, function (chip) {
      chip.classList.remove('chip--selected');
    });
  }

  /** 範囲外・空・非数値は静かに無視し、入力欄を軽く揺らすだけにする（警告色は使わない） */
  function nudgeInput() {
    el.customInput.classList.remove('custom-input--nudge');
    void el.customInput.offsetWidth; // reflow でアニメを再実行
    el.customInput.classList.add('custom-input--nudge');
    el.customInput.focus();
  }

  function submitCustomAmount() {
    var ml = parseInt(el.customInput.value, 10);
    if (isNaN(ml) || ml < CUSTOM_MIN_ML || ml > CUSTOM_MAX_ML) {
      nudgeInput();
      return;
    }

    addIntake(ml);
    spawnParticles(3);
    showToast(ml.toLocaleString('ja-JP') + 'ml、記録したよ 💧');

    el.customInput.value = '';
    openCustomPanel(false);
  }

  el.customBtn.addEventListener('click', function () {
    openCustomPanel(el.customBtn.getAttribute('aria-expanded') !== 'true');
  });

  el.customSubmit.addEventListener('click', submitCustomAmount);

  el.customInput.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    submitCustomAmount();
  });

  // 入力するとチップの選択表示は外す（どちらの値が記録されるか迷わせない）
  el.customInput.addEventListener('input', clearChipSelection);

  Array.prototype.forEach.call(el.customChips, function (chip) {
    chip.addEventListener('click', function () {
      clearChipSelection();
      chip.classList.add('chip--selected');
      el.customInput.value = chip.dataset.amount;
      el.customInput.focus();
    });
  });

  // 数値部分タップで目標量を編集（設定を開いて入力にフォーカス）
  el.amountEdit.addEventListener('click', function () {
    openSettings(true);
    el.goalInput.focus();
    el.goalInput.select();
  });

  el.goalInput.addEventListener('change', function () {
    var v = parseInt(el.goalInput.value, 10);
    if (isNaN(v) || v < 200) v = 200;
    if (v > 5000) v = 5000;
    state.goal = v;
    save();
    renderAmount();
    renderGauge();
  });

  /* =======================================================================
   * 設定アコーディオン
   * =====================================================================*/

  function openSettings(open) {
    el.settingsToggle.setAttribute('aria-expanded', String(open));
    el.settingsBody.style.maxHeight = open ? el.settingsBody.scrollHeight + 'px' : '0px';
  }

  el.settingsToggle.addEventListener('click', function () {
    var open = el.settingsToggle.getAttribute('aria-expanded') !== 'true';
    openSettings(open);
  });

  // 時刻の追加/削除で中身の高さが変わったら max-height を追従させる
  function refreshSettingsHeight() {
    if (el.settingsToggle.getAttribute('aria-expanded') !== 'true') return;
    el.settingsBody.style.maxHeight = el.settingsBody.scrollHeight + 'px';
  }

  el.resetTimes.addEventListener('click', function () {
    state.times = DEFAULT_TIMES.map(function (t) { return { time: t, enabled: true }; });
    save();
    renderTimes();
    syncSubscriptionSettings();
    showToast('おすすめの時刻に戻したよ');
  });

  /* =======================================================================
   * トースト
   * =====================================================================*/

  var toastTimer = null;
  function showToast(text) {
    el.toast.textContent = text;
    el.toast.hidden = false;
    requestAnimationFrame(function () { el.toast.classList.add('toast--show'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.toast.classList.remove('toast--show');
      setTimeout(function () { el.toast.hidden = true; }, 250);
    }, 2400);
  }

  /* =======================================================================
   * iOS / インストール判定
   * =====================================================================*/

  var isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) ||
    // iPadOS 13+ は Mac を名乗る
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  var isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  // iOS は「ホーム画面に追加」しないと Push API 自体が使えない（research_tech.md §4-1）
  var needsA2HS = isIOS && !isStandalone;

  if (needsA2HS && localStorage.getItem('waterReminder.a2hsDismissed') !== '1') {
    el.a2hsBanner.hidden = false;
  }

  el.a2hsClose.addEventListener('click', function () {
    el.a2hsBanner.hidden = true;
    localStorage.setItem('waterReminder.a2hsDismissed', '1');
  });

  /* =======================================================================
   * Service Worker / 通知許可 / Push購読
   * =====================================================================*/

  var swRegistration = null;

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return Promise.resolve(null);
    return navigator.serviceWorker.register('service-worker.js')
      .then(function (reg) {
        swRegistration = reg;
        return reg;
      })
      .catch(function (err) {
        console.warn('[water] Service Worker 登録失敗:', err);
        return null;
      });
  }

  // 'Notification' in window だと、値が undefined の環境で true になってしまう
  function notificationsSupported() {
    return typeof Notification !== 'undefined' && Notification !== null;
  }

  function updatePermissionUI() {
    var supported = notificationsSupported();
    var perm = supported ? Notification.permission : 'unsupported';

    if (!supported) {
      el.permitBtn.hidden = true;
      el.permitNote.textContent = 'このブラウザは通知に対応していないみたい。アプリを開いている間は画面で確認してね。';
      return;
    }

    if (perm === 'granted') {
      el.permitBtn.classList.add('permit-btn--done');
      setTimeout(function () { el.permitBtn.hidden = true; }, 320);
      el.bellBadge.hidden = false;
      el.permitNote.textContent = PUSH_CONFIGURED
        ? '通知ON。設定した時刻に声をかけるね。'
        : '通知ON。いまはデモモード（アプリを開いている間だけ鳴るよ）。';
      return;
    }

    if (perm === 'denied') {
      el.permitBtn.hidden = true;
      el.permitNote.textContent = '通知がブロックされてるみたい。ブラウザの設定から許可すると声をかけられるよ。';
      return;
    }

    el.permitBtn.hidden = false;
    el.permitNote.textContent = needsA2HS
      ? 'iPhone では先に「ホーム画面に追加」してから許可してね。'
      : 'タップすると通知の確認が出るよ。';
  }

  // 許可リクエストは必ずユーザー操作の直後に呼ぶ（research_tech.md §4-2）
  el.permitBtn.addEventListener('click', function () {
    if (!notificationsSupported()) return;

    if (needsA2HS) {
      el.a2hsBanner.hidden = false;
      showToast('先に「ホーム画面に追加」してね');
      return;
    }

    Notification.requestPermission().then(function (perm) {
      updatePermissionUI();
      if (perm !== 'granted') return;
      showToast('ありがとう、これからよろしくね 💧');
      return subscribeToPush();
    }).catch(function (err) {
      console.warn('[water] 通知許可に失敗:', err);
    });
  });

  function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    var base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    var raw = atob(base64);
    var out = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  }

  function subscribeToPush() {
    if (!PUSH_CONFIGURED) {
      console.info('[water] VAPID鍵/APIが未設定のためデモモードで動作します。');
      return Promise.resolve(null);
    }
    if (!swRegistration || !('PushManager' in window)) {
      console.info('[water] PushManager が使えないためデモモードで動作します。');
      return Promise.resolve(null);
    }

    return swRegistration.pushManager.getSubscription()
      .then(function (existing) {
        if (existing) return existing;
        return swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });
      })
      .then(function (sub) {
        if (!sub) return null;
        return sendSubscription(sub).then(function () { return sub; });
      })
      .catch(function (err) {
        console.warn('[water] Push購読に失敗（デモモードで継続）:', err);
        return null;
      });
  }

  function sendSubscription(sub) {
    return fetch(API_BASE + '/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: sub.toJSON(),
        // サーバー側は cron 実行時にこの設定を見て送るかどうかを決める
        settings: {
          times: state.times.filter(function (t) { return t.enabled !== false; })
                            .map(function (t) { return t.time; }),
          timezoneOffsetMinutes: new Date().getTimezoneOffset()
        }
      })
    }).then(function (res) {
      if (!res.ok) throw new Error('subscribe failed: ' + res.status);
    });
  }

  /** 時刻設定を変えたら、購読済みならサーバーにも反映する */
  function syncSubscriptionSettings() {
    if (!PUSH_CONFIGURED || !swRegistration || !('PushManager' in window)) return;
    swRegistration.pushManager.getSubscription().then(function (sub) {
      if (sub) return sendSubscription(sub);
    }).catch(function (err) {
      console.warn('[water] 設定の同期に失敗:', err);
    });
  }

  /* =======================================================================
   * デモモード
   *  サーバー未構築でも、アプリを開いている間は設定時刻にローカル通知を出す。
   *  ※ 画面を閉じる／端末がスリープすると JS が止まるので本番の代わりにはならない
   *    （research_tech.md 方式E の制約）。あくまで文言と導線の確認用。
   * =====================================================================*/

  function nowHHMM() {
    var d = new Date();
    return pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  function minutesOf(hhmm) {
    var parts = hhmm.split(':');
    return Number(parts[0]) * 60 + Number(parts[1]);
  }

  function checkDemoReminders() {
    if (rolloverIfNeeded()) render();
    if (!notificationsSupported() || Notification.permission !== 'granted') return;

    var nowMin = minutesOf(nowHHMM());

    state.times.forEach(function (slot) {
      if (slot.enabled === false) return;
      if (state.firedSlots.indexOf(slot.time) !== -1) return;
      var diff = nowMin - minutesOf(slot.time);
      if (diff < 0 || diff > DEMO_FIRE_WINDOW_MIN) return;

      state.firedSlots.push(slot.time);
      state.nudgeCount += 1;
      fireLocalNotification();
      save();
      renderFooter();
    });
  }

  function fireLocalNotification() {
    var text = self.wrPickMessage(new Date().getHours(), state.lastMessage);
    state.lastMessage = text;

    var options = {
      body: text,
      icon: 'icons/icon.svg',
      badge: 'icons/badge.svg',
      tag: 'water-reminder',
      renotify: true,
      data: { url: './' }
    };

    // SW経由のほうがモバイルでの表示が安定する
    if (swRegistration && swRegistration.showNotification) {
      swRegistration.showNotification('お水ごくごく', options).catch(function () {
        try { new Notification('お水ごくごく', options); } catch (e) { /* noop */ }
      });
    } else {
      try { new Notification('お水ごくごく', options); } catch (e) { /* noop */ }
    }
  }

  /* =======================================================================
   * 起動
   * =====================================================================*/

  render();
  renderTimes();
  updatePermissionUI();
  handleDrankParam();

  // 通知の「飲んだ！」アクション経由で開かれた場合の加算
  function handleDrankParam() {
    var params = new URLSearchParams(location.search);
    var ml = parseInt(params.get('drank'), 10);
    if (!ml || isNaN(ml)) return;
    addIntake(ml);
    spawnParticles(3);
    showToast('えらい！記録したよ 💧');
    history.replaceState(null, '', location.pathname);
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', function (event) {
      var data = event.data || {};
      if (data.type === 'notification-click' && data.action === 'drank') {
        addIntake(200);
        spawnParticles(3);
        showToast('えらい！記録したよ 💧');
      }
    });
  }

  registerServiceWorker().then(function () {
    updatePermissionUI();
    // すでに許可済みなら、購読が切れていないか確認して復旧する
    if (notificationsSupported() && Notification.permission === 'granted') {
      subscribeToPush();
    }
  });

  setInterval(checkDemoReminders, DEMO_CHECK_INTERVAL_MS);
  checkDemoReminders();

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState !== 'visible') return;
    if (rolloverIfNeeded()) renderTimes();
    render();
    checkDemoReminders();
  });
})();
