/* =========================================================
   Renel Studio — works.js
   works-data.js を読んで Works ページ / トップの Featured Films を描画する。
   main.js より【前】に読み込むこと（tilt・reveal・filter が描画後のカードに効くように）。
   ========================================================= */

(function () {
  "use strict";

  var DATA = window.RENEL_WORKS;
  if (!DATA || !DATA.works) return;

  var works = DATA.works;
  var total = works.length;
  var UNIT_NAME = (DATA.unit && DATA.unit.name) || "It's color STUDIO";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  // 古い作品ほど番号が小さい（配列の先頭 = 最新）
  function workNo(i) {
    return "No." + pad(total - i);
  }

  // 制作期間: made（"32H" など自由表記）優先、なければ days（日数）
  function madeText(w) {
    return w.made || (w.days ? w.days + "日" : "");
  }

  function creditLabel(w) {
    if (w.label) return w.label;
    return w.credit === "unit" ? UNIT_NAME : "Solo — REN";
  }

  function creditHTML(w) {
    var cls = w.credit === "unit" ? "credit credit--unit" : "credit credit--solo";
    return (
      '<span class="' + cls + '"><i class="credit__mark" aria-hidden="true"></i>' +
      esc(creditLabel(w)) +
      "</span>"
    );
  }

  function descHTML(w, full, cls) {
    var paras = String(w.desc || "").split(/\n\s*\n/).filter(function (t) { return t.trim(); });
    if (!full) paras = paras.slice(0, 1);
    return paras
      .map(function (t) {
        return '<p class="' + cls + '">' + esc(t.trim()).replace(/\n/g, "<br />") + "</p>";
      })
      .join("");
  }

  function badgeHTML(w) {
    return w.badge ? '<span class="film-badge">' + esc(w.badge) + "</span>" : "";
  }

  function rolesHTML(w) {
    if (!w.roles) return "";
    var parts = Object.keys(w.roles).map(function (k) {
      return "<span><b>" + esc(k) + "</b> " + esc(w.roles[k]) + "</span>";
    });
    return '<p class="film-roles">' + parts.join("") + "</p>";
  }

  // サムネ: poster があれば画像、無ければ hue からタイトルカード風の仮ポスター
  function mediaStyle(w, base) {
    if (w.poster) {
      return (
        "background-image:url('" + esc(base + w.poster) + "')" +
        (w.posterPos ? ";background-position:" + esc(w.posterPos) : "")
      );
    }
    var h = typeof w.hue === "number" ? w.hue : 40;
    return "--h:" + h;
  }

  function mediaHTML(w, base, i, big) {
    var hasPoster = !!w.poster;
    return (
      '<div class="film-media' +
      (hasPoster ? "" : " film-media--placeholder") +
      (big ? " film-media--big" : "") +
      '" style="' +
      mediaStyle(w, base) +
      '">' +
      (hasPoster
        ? ""
        : '<span class="film-media__title" aria-hidden="true">' + esc(w.title) + "</span>") +
      (w.preview
        ? '<video class="film-media__preview" muted loop playsinline preload="none" src="' +
          esc(base + w.preview) +
          '"></video>'
        : "") +
      '<span class="film-media__no">' + workNo(i) + "</span>" +
      (w.duration ? '<span class="film-media__dur">' + esc(w.duration) + "</span>" : "") +
      (w.sample ? '<span class="film-media__sample">Sample</span>' : "") +
      '<span class="film-media__play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span>' +
      "</div>"
    );
  }

  function cardHTML(w, i, base, opts) {
    opts = opts || {};
    var tools = (w.tools || []).join(" / ");
    return (
      '<a href="' + esc(opts.href || "#film-" + w.id) + '" class="card film-card is-interactive' +
      (opts.reveal ? " reveal" : "") +
      '" data-category="' + esc(w.credit) + '" data-work="' + esc(w.id) + '">' +
      mediaHTML(w, base, i, false) +
      '<div class="card__body">' +
      creditHTML(w) +
      '<h3 class="card__title">' + esc(w.title) + "</h3>" +
      (w.titleJa ? '<p class="film-card__ja">' + esc(w.titleJa) + "</p>" : "") +
      rolesHTML(w) +
      '<div class="card__meta"><span>' +
      esc(w.kind || "Film") +
      (tools ? " · " + esc(tools) : "") +
      "</span><span>" + (madeText(w) ? '<b class="film-days">制作 ' + esc(madeText(w)) + "</b> · " : "") + esc(w.year) + "</span></div>" +
      "</div></a>"
    );
  }

  /* ---------- Works page ---------- */
  function renderWorksPage() {
    var grid = document.getElementById("cardGrid");
    var featuredEl = document.getElementById("worksFeatured");
    if (!grid || !grid.hasAttribute("data-works")) return;
    var base = grid.getAttribute("data-base") || "";

    grid.innerHTML = works
      .map(function (w, i) {
        return cardHTML(w, i, base);
      })
      .join("");

    // フィルタボタンに件数
    document.querySelectorAll("#filters .filter-btn").forEach(function (btn) {
      var f = btn.getAttribute("data-filter");
      var n = f === "all" ? total : works.filter(function (w) { return w.credit === f; }).length;
      var c = document.createElement("span");
      c.className = "filter-btn__count";
      c.textContent = n;
      btn.appendChild(c);
      if (n === 0) btn.hidden = true; // 作品が0件の絞り込みは出さない
    });

    if (featuredEl) {
      var fi = works.findIndex(function (w) { return w.featured; });
      if (fi < 0) fi = 0;
      var w = works[fi];
      featuredEl.innerHTML =
        '<a href="#film-' + esc(w.id) + '" class="featured is-interactive" data-work="' + esc(w.id) + '">' +
        mediaHTML(w, base, fi, true) +
        '<div class="featured__info">' +
        '<span class="featured__eyebrow">Latest Film</span>' +
        creditHTML(w) +
        '<h2 class="featured__title">' + esc(w.title) + "</h2>" +
        (w.titleJa ? '<p class="featured__ja">' + esc(w.titleJa) + "</p>" : "") +
        descHTML(w, false, "featured__desc") +
        '<div class="featured__chips">' + badgeHTML(w) +
        (madeText(w) ? '<span class="film-badge film-badge--time">制作 ' + esc(madeText(w)) + "</span>" : "") +
        "</div>" +
        rolesHTML(w) +
        '<span class="featured__cta">▶ Watch</span>' +
        "</div></a>";
    }
  }

  /* ---------- Home: Featured Films ---------- */
  function renderHome() {
    var el = document.getElementById("homeFilms");
    if (!el) return;
    var base = el.getAttribute("data-base") || "";
    var max = parseInt(el.getAttribute("data-max") || "3", 10);
    el.innerHTML = works
      .slice(0, max)
      .map(function (w, i) {
        return cardHTML(w, i, base, { href: "works/index.html#film-" + w.id });
      })
      .join("");
  }

  /* ---------- Music: Naked Lotus ---------- */
  var LINK_LABEL = {
    listen: "Listen",
    instagram: "Instagram",
    tiktok: "TikTok",
    spotify: "Spotify",
    apple: "Apple Music",
    youtube: "YouTube",
    soundcloud: "SoundCloud",
    suno: "Suno",
  };

  function linksHTML(links) {
    if (!links) return "";
    return Object.keys(links)
      .filter(function (k) { return links[k]; })
      .map(function (k) {
        return (
          '<a class="music-link is-interactive" href="' + esc(links[k]) +
          '" target="_blank" rel="noopener noreferrer">' + esc(LINK_LABEL[k] || k) + " ↗</a>"
        );
      })
      .join("");
  }

  function renderMusic() {
    var el = document.getElementById("musicBlock");
    var M = DATA.music;
    if (!el || !M) return;
    var base = el.getAttribute("data-base") || "";
    var worksHref = el.getAttribute("data-works-href") || "#film-";
    var tracks = M.tracks || [];
    var latest = tracks[0];

    var list = tracks
      .map(function (t, i) {
        var mv = t.mv
          ? '<a class="music-link music-link--mv is-interactive" href="' + esc(worksHref + t.mv) +
            '" data-work="' + esc(t.mv) + '">▶ MV</a>'
          : "";
        var links = linksHTML(t.links) + mv;
        return (
          '<li class="track">' +
          '<span class="track__no">' + pad(tracks.length - i) + "</span>" +
          '<span class="track__cover" style="background-image:url(\'' + esc(base + (t.cover || "")) + "')\"></span>" +
          '<span class="track__main"><b>' + esc(t.title) + "</b><small>" +
          esc([t.type, t.year, t.bpm ? t.bpm + " BPM" : ""].filter(Boolean).join(" · ")) +
          "</small></span>" +
          '<span class="track__len">' + esc(t.length || "") + "</span>" +
          '<span class="track__links">' + (links || '<span class="track__soon">Coming soon</span>') + "</span>" +
          "</li>"
        );
      })
      .join("");

    el.innerHTML =
      '<div class="music__grid">' +
      '<div class="music__art">' +
      (latest && latest.cover
        ? '<div class="music__disc" style="background-image:url(\'' + esc(base + latest.cover) + "')\"></div>"
        : "") +
      '<span class="music__now">Latest — ' + esc(latest ? latest.title : "") + "</span>" +
      "</div>" +
      '<div class="music__body">' +
      '<h3 class="music__artist">' + esc(M.artist) + "</h3>" +
      '<p class="music__lead">' + esc(M.lead) + "</p>" +
      (M.tools && M.tools.length
        ? '<ul class="film-modal__tools music__tools">' +
          M.tools.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") +
          "</ul>"
        : "") +
      '<div class="music__artist-links">' + linksHTML(M.links) + "</div>" +
      '<ol class="tracklist">' + list + "</ol>" +
      "</div></div>";
  }

  /* ---------- Apps（1日1アプリ）---------- */
  function renderApps() {
    document.querySelectorAll("[data-apps]").forEach(function (el) {
      var base = el.getAttribute("data-base") || "";
      var max = parseInt(el.getAttribute("data-max") || "99", 10);
      el.innerHTML = (DATA.apps || [])
        .slice(0, max)
        .map(function (a) {
          return (
            '<a href="' + esc(base + a.id + "/") + '" class="card is-interactive" data-category="app">' +
            '<div class="card__media card__media--screenshot" style="background-image:url(\'' +
            esc(base + a.id + "/screenshot.png") + '\')" data-tag="1日1アプリ"></div>' +
            '<div class="card__body">' +
            '<h3 class="card__title"' +
            (a.jpTitle ? ' style="font-family: var(--font-sans); font-weight: 800"' : "") + ">" +
            esc(a.title) + "</h3>" +
            '<p class="card__desc">' + esc(a.desc) + "</p>" +
            '<div class="card__meta"><span>' + esc(a.stack) + "</span><span>" + esc(a.year) + "</span></div>" +
            "</div></a>"
          );
        })
        .join("");
    });
  }

  /* ---------- 数字（Works / トップ）---------- */
  function renderStats() {
    var tools = {};
    works.forEach(function (w) { (w.tools || []).forEach(function (t) { tools[t] = 1; }); });
    (DATA.workflow || []).forEach(function (s) { s.tools.forEach(function (t) { tools[t] = 1; }); });
    ((DATA.music && DATA.music.tools) || []).forEach(function (t) { tools[t] = 1; });
    var counts = {
      films: works.length,
      tracks: ((DATA.music && DATA.music.tracks) || []).length,
      apps: (DATA.apps || []).length,
      tools: Object.keys(tools).length,
    };
    document.querySelectorAll("[data-stat]").forEach(function (el) {
      el.textContent = counts[el.getAttribute("data-stat")];
    });
  }

  /* ---------- AI Workflow ---------- */
  function renderWorkflow() {
    var el = document.getElementById("aiWorkflow");
    if (!el || !DATA.workflow) return;
    el.innerHTML =
      '<ol class="flow">' +
      DATA.workflow
        .map(function (s, i) {
          return (
            '<li class="flow__step reveal">' +
            '<span class="flow__no">' + pad(i + 1) + "</span>" +
            '<b class="flow__en">' + esc(s.en) + "</b>" +
            '<span class="flow__ja">' + esc(s.ja) + "</span>" +
            '<ul class="flow__tools">' +
            s.tools.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") +
            "</ul></li>"
          );
        })
        .join("") +
      "</ol>" +
      (DATA.workflowNote ? '<p class="flow__note reveal">' + esc(DATA.workflowNote) + "</p>" : "");
  }

  /* ---------- Services ---------- */
  function renderServices() {
    var el = document.getElementById("servicesGrid");
    if (!el || !DATA.services) return;
    el.innerHTML = DATA.services
      .map(function (s, i) {
        return (
          '<article class="service reveal">' +
          '<div class="service__top"><span class="service__no">' + pad(i + 1) + "</span>" +
          creditHTML({ credit: s.by, label: s.by === "unit" ? UNIT_NAME : "Renel. Studio" }) + "</div>" +
          '<h3 class="service__title">' + esc(s.title) + "</h3>" +
          '<p class="service__desc">' + esc(s.desc) + "</p>" +
          '<div class="service__tags">' +
          (s.tags || []).map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("") +
          "</div>" +
          '<span class="service__soon">料金・詳細 Coming soon</span>' +
          "</article>"
        );
      })
      .join("");
  }

  /* ---------- Tabs（Film / Music / Apps）---------- */
  function initTabs() {
    document.querySelectorAll("[data-tabs]").forEach(function (wrap) {
      var btns = wrap.querySelectorAll("[data-tab]");
      var panels = wrap.querySelectorAll("[data-panel]");
      var useHash = wrap.hasAttribute("data-tabs-hash");

      function select(name, fromUser) {
        var found = false;
        btns.forEach(function (b) {
          var on = b.getAttribute("data-tab") === name;
          if (on) found = true;
          b.classList.toggle("is-active", on);
          b.setAttribute("aria-selected", on ? "true" : "false");
        });
        if (!found) return false;
        panels.forEach(function (p) {
          var on = p.getAttribute("data-panel") === name;
          p.hidden = !on;
          if (on && fromUser && window.gsap && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            gsap.fromTo(p, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: "expo.out" });
          }
        });
        if (useHash && fromUser) history.replaceState(null, "", "#" + name);
        if (window.ScrollTrigger) ScrollTrigger.refresh();
        return true;
      }

      btns.forEach(function (b) {
        b.addEventListener("click", function () {
          select(b.getAttribute("data-tab"), true);
        });
      });

      // URL #music / #apps / #film-xxx でタブを選ぶ
      var h = location.hash.replace("#", "");
      if (useHash && h) {
        if (h.indexOf("film-") === 0) h = "film";
        select(h, false);
      }
    });
  }

  /* ---------- Hover preview ---------- */
  function initPreview() {
    if (!window.matchMedia("(hover: hover)").matches) return;
    document.querySelectorAll(".film-card, .featured").forEach(function (card) {
      var v = card.querySelector(".film-media__preview");
      if (!v) return;
      card.addEventListener("mouseenter", function () {
        v.play().catch(function () {});
      });
      card.addEventListener("mouseleave", function () {
        v.pause();
      });
    });
  }

  /* ---------- Player modal ---------- */
  var modal, frame, info, lastFocus;

  function playerHTML(w, base) {
    var v = w.video;
    if (!v) {
      return (
        '<div class="film-modal__soon">' + mediaHTML(w, base, works.indexOf(w), true) +
        '<p>Coming soon — 動画は準備中です</p></div>'
      );
    }
    if (v.type === "link") {
      return (
        '<div class="film-modal__soon">' + mediaHTML(w, base, works.indexOf(w), true) +
        '<a class="film-modal__ext is-interactive" href="' + esc(v.url) +
        '" target="_blank" rel="noopener noreferrer">' + esc(v.label || "作品ページで見る") + " ↗</a></div>"
      );
    }
    if (v.type === "tiktok") {
      return (
        '<div class="film-modal__vertical"><iframe src="https://www.tiktok.com/embed/v2/' + encodeURIComponent(v.id) +
        '" title="' + esc(w.title) + '" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>' +
        (v.url ? '<a class="film-modal__ext film-modal__ext--side is-interactive" href="' + esc(v.url) +
          '" target="_blank" rel="noopener noreferrer">TikTok で見る ↗</a>' : "") +
        "</div>"
      );
    }
    if (v.type === "youtube") {
      return (
        '<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(v.id) +
        '?autoplay=1&rel=0&modestbranding=1&playsinline=1" title="' + esc(w.title) +
        '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>'
      );
    }
    if (v.type === "vimeo") {
      return (
        '<iframe src="https://player.vimeo.com/video/' + encodeURIComponent(v.id) +
        '?autoplay=1&title=0&byline=0&portrait=0" title="' + esc(w.title) +
        '" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>'
      );
    }
    return (
      '<video src="' + esc(base + v.src) + '" controls autoplay playsinline' +
      (w.poster ? ' poster="' + esc(base + w.poster) + '"' : "") + "></video>"
    );
  }

  function openWork(id) {
    var w = works.find(function (x) { return x.id === id; });
    if (!w || !modal) return;
    var base = modal.getAttribute("data-base") || "";
    lastFocus = document.activeElement;
    frame.innerHTML = playerHTML(w, base);
    frame.classList.toggle("film-modal__frame--vertical", !!(w.video && w.video.type === "tiktok"));
    var tools = (w.tools || []).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("");
    info.innerHTML =
      creditHTML(w) +
      '<h2 class="film-modal__title">' + esc(w.title) + "</h2>" +
      (w.titleJa ? '<p class="featured__ja">' + esc(w.titleJa) + "</p>" : "") +
      badgeHTML(w) + descHTML(w, true, "film-modal__desc") +
      rolesHTML(w) +
      '<dl class="film-modal__spec">' +
      "<div><dt>Type</dt><dd>" + esc(w.kind || "Film") + "</dd></div>" +
      "<div><dt>Year</dt><dd>" + esc(w.year) + "</dd></div>" +
      (w.duration ? "<div><dt>Length</dt><dd>" + esc(w.duration) + "</dd></div>" : "") +
      (madeText(w) ? "<div><dt>Made in</dt><dd>" + esc(madeText(w)) + "</dd></div>" : "") +
      "</dl>" +
      (tools ? '<ul class="film-modal__tools">' + tools + "</ul>" : "");
    modal.hidden = false;
    document.documentElement.classList.add("is-modal-open");
    requestAnimationFrame(function () {
      modal.classList.add("is-open");
    });
    modal.querySelector(".film-modal__close").focus();
    if (location.hash !== "#film-" + id) history.replaceState(null, "", "#film-" + id);
  }

  function closeWork() {
    if (!modal || modal.hidden) return;
    modal.classList.remove("is-open");
    document.documentElement.classList.remove("is-modal-open");
    frame.innerHTML = ""; // 再生停止
    modal.hidden = true;
    history.replaceState(null, "", location.pathname + location.search);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function initModal() {
    modal = document.getElementById("filmModal");
    if (!modal) return;
    frame = modal.querySelector(".film-modal__frame");
    info = modal.querySelector(".film-modal__info");

    // 背面の Lenis にホイール/タッチを渡さない
    ["wheel", "touchmove"].forEach(function (ev) {
      modal.addEventListener(ev, function (e) { e.stopPropagation(); }, { passive: true });
    });

    document.addEventListener("click", function (e) {
      var link = e.target.closest("[data-work]");
      if (link && link.getAttribute("href").charAt(0) === "#") {
        e.preventDefault();
        openWork(link.getAttribute("data-work"));
        return;
      }
      if (e.target.closest("[data-close]")) closeWork();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeWork();
    });

    var m = location.hash.match(/^#film-(.+)$/);
    if (m) openWork(decodeURIComponent(m[1]));
  }

  renderWorksPage();
  renderHome();
  renderMusic();
  renderApps();
  renderStats();
  renderWorkflow();
  renderServices();
  initTabs();
  initPreview();
  initModal();
})();
