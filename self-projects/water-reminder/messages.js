/*
 * 通知文言（design_spec.md §6 のまま）。
 * app.js（デモモード）と service-worker.js（push受信時のフォールバック）から共有する。
 * ※ Cloudflare Workers 側（worker/worker.js）は別デプロイなので同じ配列を複製している。
 *    文言を変えるときは worker/worker.js の MESSAGES も揃えること。
 */
(function (scope) {
  'use strict';

  var MESSAGES = [
    { from: 6,  to: 10, texts: [
      'おはよう。まず一杯、いっとこ？💧',
      '今日も一日、水からスタートしよっか'
    ]},
    { from: 10, to: 13, texts: [
      'そろそろ喉かわいてない？',
      'お昼前に、コップ一杯どうかな'
    ]},
    { from: 13, to: 17, texts: [
      '集中してると忘れがちだよね、水飲んだ？',
      'ちょっと一息、水分補給タイム'
    ]},
    { from: 17, to: 21, texts: [
      '今日、まだ半分くらいかも。無理なくもう一杯',
      '夜ごはん前に、水飲んどく？'
    ]},
    { from: 21, to: 24, texts: [
      '今日はここまでにしとく？おつかれさま',
      '寝る前に一杯、明日もよろしくね'
    ]}
  ];

  // 時間帯に当てはまらない深夜帯（0-6時）用のニュートラルな控え
  var FALLBACK = ['水飲んだ？', 'ちょっと一息、水分補給タイム'];

  /**
   * @param {number} hour 0-23（ローカル時刻の時）
   * @param {string} [exclude] 直前に出した文言（連続を避ける）
   * @returns {string}
   */
  function pickMessage(hour, exclude) {
    var slot = MESSAGES.find(function (m) { return hour >= m.from && hour < m.to; });
    var pool = slot ? slot.texts : FALLBACK;
    var candidates = pool.filter(function (t) { return t !== exclude; });
    if (candidates.length === 0) candidates = pool;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  scope.WR_MESSAGES = MESSAGES;
  scope.wrPickMessage = pickMessage;
})(typeof self !== 'undefined' ? self : this);
