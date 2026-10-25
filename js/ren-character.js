/* =========================================================
   Renel Studio — ren-character.js
   スクロール連動キャラ「REN」（TOPページ専用）
   仕様: REN_scroll_character_spec.md / 元デモ: ren-scroll-demo.html

   - index.html だけで読み込む（他ページには <script> を置かない＝出さない）
   - 2D: デモの SVG とスクロール物理をそのまま移植
   - 3D: <script id="renScript" data-glb="assets/ren/ren.glb"> のように .glb を指定すると
         three.js を読み込み、到着後に SVG と差し替える（未指定なら SVG のまま）
   - ?ren-debug=1 で調整パネルを表示
   ========================================================= */

(function () {
  "use strict";

  var script = document.getElementById("renScript");
  var GLB_URL = (script && script.getAttribute("data-glb")) || "";
  var DEBUG = /[?&]ren-debug=1/.test(location.search);
  // 画像モード: 3つとも指定されていれば SVG の代わりに表情ごとの画像を使う
  var IMG = script
    ? {
        idle: script.getAttribute("data-img-idle") || "",
        surprised: script.getAttribute("data-img-surprised") || "",
        relief: script.getAttribute("data-img-relief") || "",
      }
    : {};
  var USE_IMG = !!(IMG.idle && IMG.surprised && IMG.relief);
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mobileMQ = window.matchMedia("(max-width: 767px)");

  /* ---------- マークアップ（デモの SVG そのまま） ---------- */
  var SVG =
    '<svg viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg">' +
    '<g id="renBody">' +
    '<rect x="40" y="128" width="17" height="52" rx="7" fill="var(--jean)"/>' +
    '<rect x="63" y="128" width="17" height="52" rx="7" fill="var(--jean)"/>' +
    '<path d="M38 178h21v8a4 4 0 0 1-4 4H40a4 4 0 0 1-4-4z" fill="var(--shoe)" stroke="var(--line-ink)" stroke-width="1"/>' +
    '<path d="M61 178h21v8a4 4 0 0 1-4 4H63a4 4 0 0 1-4-4z" fill="var(--shoe)" stroke="var(--line-ink)" stroke-width="1"/>' +
    '<path d="M44 132q-8 10 0 20" fill="none" stroke="var(--silver)" stroke-width="1.6" stroke-dasharray="2 2"/>' +
    '<path d="M34 90q26-10 52 0l4 42H30z" fill="var(--tee)"/>' +
    '<path d="M30 92q-8 0-10 10l-2 26h12l2-28z M90 92q8 0 10 10l2 26H90l-2-28z" fill="#8a5a3c"/>' +
    '<path d="M34 90l-4 2 2 40h6l-2-38z M86 90l4 2-2 40h-6l2-38z" fill="#8a5a3c"/>' +
    '<rect x="18" y="98" width="12" height="40" rx="6" fill="#8a5a3c" class="ren-arm ren-armL"/>' +
    '<rect x="90" y="98" width="12" height="40" rx="6" fill="#8a5a3c" class="ren-arm ren-armR"/>' +
    '<circle cx="24" cy="140" r="5.5" fill="var(--skin)"/><circle cx="96" cy="140" r="5.5" fill="var(--skin)"/>' +
    '<path d="M44 94q16 14 32 0" fill="none" stroke="var(--silver)" stroke-width="2.4" stroke-dasharray="3 2"/>' +
    '<rect x="52" y="76" width="16" height="18" fill="var(--skin)"/>' +
    '<g id="renHead">' +
    '<ellipse cx="60" cy="48" rx="36" ry="38" fill="var(--skin)"/>' +
    '<path d="M24 44q0-36 36-36t36 36v10q-10-6-36-6T24 54z" fill="var(--hair-in)"/>' +
    '<path d="M22 44q2-38 38-38t38 38q-6 8-16 10q-4-6-12-6t-16 4q-8-3-16-2q-6 6-16-6z" fill="var(--hair)"/>' +
    '<path d="M30 44q6 14 14 6q4 12 12 4q6 10 14 2q6 8 14-2" fill="none" stroke="var(--hair)" stroke-width="5" stroke-linecap="round"/>' +
    '<circle cx="24" cy="60" r="3.5" fill="none" stroke="var(--silver)" stroke-width="1.6"/>' +
    '<circle cx="96" cy="60" r="3.5" fill="none" stroke="var(--silver)" stroke-width="1.6"/>' +
    '<g class="ren-face f-idle">' +
    '<ellipse cx="46" cy="62" rx="3.5" ry="4.5" fill="#1c1b1a"/><ellipse cx="74" cy="62" rx="3.5" ry="4.5" fill="#1c1b1a"/>' +
    '<circle cx="47.3" cy="60.5" r="1.1" fill="#fff"/><circle cx="75.3" cy="60.5" r="1.1" fill="#fff"/>' +
    '<path d="M54 74q6 4 12 0" fill="none" stroke="#1c1b1a" stroke-width="1.8" stroke-linecap="round"/>' +
    '<circle cx="38" cy="70" r="4" fill="#ef7b5a" opacity=".35"/><circle cx="82" cy="70" r="4" fill="#ef7b5a" opacity=".35"/>' +
    "</g>" +
    '<g class="ren-face f-surprised">' +
    '<circle cx="46" cy="62" r="6.5" fill="#fff" stroke="#1c1b1a" stroke-width="1.5"/><circle cx="74" cy="62" r="6.5" fill="#fff" stroke="#1c1b1a" stroke-width="1.5"/>' +
    '<circle cx="46" cy="62" r="2.6" fill="#1c1b1a"/><circle cx="74" cy="62" r="2.6" fill="#1c1b1a"/>' +
    '<ellipse cx="60" cy="77" rx="5" ry="6.5" fill="#1c1b1a"/>' +
    '<path d="M40 52l8 3 M80 52l-8 3" stroke="#1c1b1a" stroke-width="1.8" stroke-linecap="round"/>' +
    "</g>" +
    '<g class="ren-face f-relief">' +
    '<path d="M40 63q6-6 12 0 M68 63q6-6 12 0" fill="none" stroke="#1c1b1a" stroke-width="2.2" stroke-linecap="round"/>' +
    '<path d="M52 73q8 7 16 0" fill="none" stroke="#1c1b1a" stroke-width="1.8" stroke-linecap="round"/>' +
    '<circle cx="38" cy="70" r="5" fill="#ef7b5a" opacity=".5"/><circle cx="82" cy="70" r="5" fill="#ef7b5a" opacity=".5"/>' +
    '<path d="M86 40l4-6 M90 44l6-4" stroke="#ef7b5a" stroke-width="1.6" stroke-linecap="round"/>' +
    "</g>" +
    "</g></g></svg>";

  var ren = document.createElement("div");
  ren.id = "ren";
  ren.setAttribute("data-face", "idle");
  ren.setAttribute("aria-hidden", "true");
  ren.innerHTML = SVG + '<div class="ren-shadow"></div><div class="ren-hit is-interactive"></div>';
  if (USE_IMG) {
    // 画像はあらかじめ全部読み込んでおき、表情の切り替えで一瞬消えないようにする
    var imgs = document.createElement("div");
    imgs.className = "ren-imgs";
    ["idle", "surprised", "relief"].forEach(function (f) {
      var im = document.createElement("img");
      im.src = IMG[f];
      im.alt = "";
      im.decoding = "async";
      im.className = "ren-img f-" + f;
      imgs.appendChild(im);
    });
    ren.insertBefore(imgs, ren.firstChild);
    ren.classList.add("is-img");
  }
  document.body.appendChild(ren);

  var body = ren.querySelector("#renBody");
  var head = ren.querySelector("#renHead");
  var armL = ren.querySelector(".ren-armL");
  var armR = ren.querySelector(".ren-armR");
  var shadow = ren.querySelector(".ren-shadow");
  body.style.transformOrigin = "60px 130px";
  head.style.transformOrigin = "60px 76px";
  armL.style.transformOrigin = "24px 100px";
  armR.style.transformOrigin = "96px 100px";

  /* ---------- 物理パラメータ（仕様の初期値） ---------- */
  var P = { fall: 1.0, spring: 0.08, relief: 1.5 };

  /* ---------- 調整パネル（?ren-debug=1 のときだけ） ---------- */
  var stateOut = null;
  if (DEBUG) {
    var panel = document.createElement("div");
    panel.id = "renPanel";
    panel.innerHTML =
      "<details open><summary>REN 動きの調整</summary>" +
      '<label>落下の強さ <span class="st" id="renV-fall">1.0</span><input id="renI-fall" type="range" min="0.3" max="2.5" step="0.1" value="1.0"></label>' +
      '<label>戻りのバネ <span class="st" id="renV-spring">0.08</span><input id="renI-spring" type="range" min="0.03" max="0.2" step="0.01" value="0.08"></label>' +
      '<label>安堵の余韻 (秒) <span class="st" id="renV-relief">1.5</span><input id="renI-relief" type="range" min="0.5" max="4" step="0.1" value="1.5"></label>' +
      '<label>状態 <span class="st" id="renV-state">idle</span></label>' +
      "</details>";
    document.body.appendChild(panel);
    ["fall", "spring", "relief"].forEach(function (k) {
      var el = document.getElementById("renI-" + k);
      var out = document.getElementById("renV-" + k);
      el.addEventListener("input", function () {
        P[k] = parseFloat(el.value);
        out.textContent = el.value;
      });
    });
    stateOut = document.getElementById("renV-state");
  }

  /* ---------- 3D レイヤー（差し込み口） ----------
     .glb 未指定のあいだは何もしない（SVG がそのまま表示される）。
     指定されると three.js を読み込み、到着後に SVG を隠してキャンバスに切り替える。 */
  var model3D = null; // { setFace(face), update(params) }

  function init3D(url) {
    // importmap（index.html）経由で three を解決する
    Promise.all([import("three"), import("three/addons/loaders/GLTFLoader.js")])
      .then(function (mods) {
        var THREE = mods[0];
        var GLTFLoader = mods[1].GLTFLoader;

        var canvas = document.createElement("canvas");
        canvas.className = "ren-canvas";
        ren.insertBefore(canvas, ren.firstChild);

        var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(30, 120 / 200, 0.1, 100);
        camera.position.set(0, 0, 6);
        camera.lookAt(0, 0, 0);
        scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2.2));
        var key = new THREE.DirectionalLight(0xffffff, 1.6);
        key.position.set(2, 3, 4);
        scene.add(key);

        function resize() {
          var w = ren.clientWidth;
          var h = Math.round((w * 200) / 120);
          renderer.setSize(w, h, false);
        }
        resize();
        window.addEventListener("resize", resize);

        new GLTFLoader().load(
          url,
          function (gltf) {
            var root = gltf.scene;
            // モデルを枠に収める（高さ 2.8 / 中心を原点に）
            var pivot = new THREE.Group();
            pivot.add(root);
            scene.add(pivot);
            pivot.updateMatrixWorld(true);
            var box = new THREE.Box3().setFromObject(pivot, true);
            var size = box.getSize(new THREE.Vector3());
            var center = box.getCenter(new THREE.Vector3());
            var s = 2.8 / Math.max(size.y, size.x * (200 / 120), 0.001);
            root.position.sub(center);
            pivot.scale.setScalar(s);

            // 表情（ブレンドシェイプ）: idle / surprised / relief / blink
            var morphMeshes = [];
            root.traverse(function (o) {
              if (o.morphTargetDictionary && o.morphTargetInfluences) morphMeshes.push(o);
            });
            var FACES = ["idle", "surprised", "relief"];
            var faceTarget = { idle: 1, surprised: 0, relief: 0 };
            var faceNow = { idle: 1, surprised: 0, relief: 0 };

            // 腕ボーン（VRM / Mixamo のよくある名前）
            function findBone(names) {
              var hit = null;
              root.traverse(function (o) {
                if (!hit && o.isBone && names.indexOf(o.name) >= 0) hit = o;
              });
              return hit;
            }
            var boneL = findBone(["LeftUpperArm", "mixamorigLeftArm", "J_Bip_L_UpperArm", "leftUpperArm"]);
            var boneR = findBone(["RightUpperArm", "mixamorigRightArm", "J_Bip_R_UpperArm", "rightUpperArm"]);
            var baseL = boneL ? boneL.rotation.z : 0;
            var baseR = boneR ? boneR.rotation.z : 0;

            var last = performance.now();
            model3D = {
              setFace: function (f) {
                FACES.forEach(function (k) { faceTarget[k] = k === f ? 1 : 0; });
              },
              update: function (p) {
                var now = performance.now();
                var dt = Math.min(0.05, (now - last) / 1000);
                last = now;
                // 0.15秒くらいで表情を補間
                var a = Math.min(1, dt / 0.15);
                FACES.forEach(function (k) {
                  faceNow[k] += (faceTarget[k] - faceNow[k]) * a;
                  morphMeshes.forEach(function (m) {
                    var i = m.morphTargetDictionary[k];
                    if (i !== undefined) m.morphTargetInfluences[i] = faceNow[k];
                  });
                });
                if (boneL) boneL.rotation.z = baseL + p.armLift * 1.0;
                if (boneR) boneR.rotation.z = baseR - p.armLift * 1.0;
                pivot.rotation.y = Math.sin(p.t * 0.5) * 0.15;
                renderer.render(scene, camera);
              },
            };
            model3D.setFace(ren.getAttribute("data-face"));
            ren.classList.add("is-3d"); // SVG を隠す
            if (reduce) model3D.update({ armLift: 0, t: 0 });
          },
          undefined,
          function (err) {
            // 読み込み失敗時は SVG のまま
            if (window.console) console.warn("[REN] .glb を読み込めませんでした:", err);
            canvas.remove();
          }
        );
      })
      .catch(function (err) {
        if (window.console) console.warn("[REN] three.js を読み込めませんでした:", err);
      });
  }

  if (GLB_URL) init3D(GLB_URL);

  /* ---------- 状態とスクロール物理（デモのロジックをそのまま） ---------- */
  var lastY = window.scrollY, vel = 0, y = 0, vy = 0, tilt = 0, state = "idle";
  var lastMove = performance.now(), reliefUntil = 0, t = 0, prev = 0;
  var gone = false;

  function setFace(f) {
    if (ren.getAttribute("data-face") !== f) {
      ren.setAttribute("data-face", f);
      if (model3D) model3D.setFace(f);
    }
  }
  function setState(s) {
    if (state !== s) {
      state = s;
      if (stateOut) stateOut.textContent = s;
    }
  }

  function frame(now) {
    var dt = Math.min(0.05, (now - (prev || now)) / 1000);
    prev = now;
    t += dt;
    var sy = window.scrollY;
    var raw = sy - lastY;
    lastY = sy;
    vel = vel * 0.6 + raw * 0.4; // スクロール速度を平滑化（px/frame）

    if (reduce || gone) return; // 静止（浮遊もしない）／クリックで消えた後は止める

    var moving = Math.abs(vel) > 0.6;
    if (moving) {
      lastMove = now;
      setState("falling");
      setFace("surprised");
    } else if (state === "falling" && now - lastMove > 180) {
      setState("recover");
      setFace("relief");
      reliefUntil = now + P.relief * 1000;
    } else if (state === "recover" && now > reliefUntil) {
      setState("idle");
      setFace("idle");
    }

    // 落下はスクロール速度で y を押し、バネで 0 に戻す
    if (state === "falling") vy += vel * 0.9 * P.fall;
    var k = state === "falling" ? P.spring * 0.35 : P.spring;
    vy += -y * k;
    vy *= 0.86;
    y += vy;
    // PC: 画面の縦中央から上下に / スマホ: 左下から、下へは体の6割まで（はみ出してから戻る）
    if (mobileMQ.matches) y = Math.max(-60, Math.min(ren.offsetHeight * 0.6, y));
    else y = Math.max(-160, Math.min(window.innerHeight * 0.45, y));

    // 傾きは縦の速度に追従、頭は少し遅れる
    var targetTilt = Math.max(-28, Math.min(28, vy * 1.4));
    tilt += (targetTilt - tilt) * 0.2;

    var bob = state === "idle" ? Math.sin(t * 1.6) * 6 : 0;
    var sway = state === "idle" ? Math.sin(t * 0.9) * 2 : 0;
    var armLift = Math.max(0, Math.min(1, Math.abs(vy) / 10));

    ren.style.transform =
      "translateY(calc(var(--ren-base, -50%) + " + (y + bob) + "px)) rotate(" + (tilt + sway) + "deg)";
    body.style.transform = "scaleY(" + (1 + armLift * 0.04) + ")";
    head.style.transform = "rotate(" + -tilt * 0.3 + "deg)";
    armL.style.transform = "rotate(" + -armLift * 60 + "deg)";
    armR.style.transform = "rotate(" + armLift * 60 + "deg)";
    shadow.style.opacity = 0.12 * (1 - Math.min(1, Math.abs(y) / 200));

    if (model3D) model3D.update({ state: state, y: y, tilt: tilt, armLift: armLift, t: t });

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------- クリック/タップで「びっくり → キラッと消える」 ----------
     状態は保存しないので、リロードするとまた出てくる */
  var hit = ren.querySelector(".ren-hit");
  var ringEl = document.querySelector(".cursor-ring");
  var dotEl = document.querySelector(".cursor-dot");
  function hover(on) {
    if (ringEl) ringEl.classList.toggle("is-hover", on);
    if (dotEl) dotEl.classList.toggle("is-hover", on);
  }
  hit.addEventListener("mouseenter", function () { hover(true); });
  hit.addEventListener("mouseleave", function () { hover(false); });
  hit.addEventListener("click", function () {
    if (gone) return;
    gone = true;
    hover(false);
    setFace("surprised");
    setState("gone");
    // キラキラ
    var colors = ["#ef7b5a", "#e8c66a", "#f0ede6", "#b9b4ac"];
    for (var i = 0; i < 12; i++) {
      var sp = document.createElement("span");
      sp.className = "ren-spark";
      var ang = (Math.PI * 2 * i) / 12 + Math.random() * 0.4;
      var dist = 40 + Math.random() * 40;
      sp.style.setProperty("--dx", Math.cos(ang) * dist + "px");
      sp.style.setProperty("--dy", Math.sin(ang) * dist - 20 + "px");
      sp.style.background = colors[i % colors.length];
      sp.style.animationDelay = 120 + Math.random() * 80 + "ms";
      ren.appendChild(sp);
    }
    ren.classList.add("is-poof");
    setTimeout(function () {
      ren.remove();
    }, reduce ? 300 : 1100);
  });

  /* ---------- TOP から別ページへ移るときは 0.3s でフェードアウト ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#" || a.target === "_blank") return;
    if (a.origin && a.origin !== location.origin && location.protocol !== "file:") return;
    ren.classList.add("is-leaving");
  });
  // 戻るボタンで TOP に戻ったとき（bfcache）に再表示
  window.addEventListener("pageshow", function () {
    ren.classList.remove("is-leaving");
  });
})();
