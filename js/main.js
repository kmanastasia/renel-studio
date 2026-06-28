/* =========================================================
   Renel Studio — main.js
   GSAP + ScrollTrigger + Lenis / custom cursor /
   page curtain / kinetic hero / 3D tilt / nav blur / filter
   全ページ共通。要素が無いページでは各機能をスキップ。
   ========================================================= */

(function () {
  "use strict";

  document.documentElement.classList.remove("no-js");

  const hasGSAP = typeof window.gsap !== "undefined";
  const hasLenis = typeof window.Lenis !== "undefined";
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const finePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;

  let lenis = null;

  if (hasGSAP && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* -----------------------------------------------------
     0. Lenis smooth scroll (ScrollTrigger連携)
  ----------------------------------------------------- */
  function initLenis() {
    if (!hasLenis || prefersReduced) return;
    lenis = new Lenis({
      duration: 1.1,
      easing: function (t) {
        return Math.min(1, 1.001 - Math.pow(2, -10 * t));
      },
    });

    if (hasGSAP && window.ScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (time) {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(t) {
        lenis.raf(t);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  /* -----------------------------------------------------
     1. Custom cursor (デスクトップのみ)
  ----------------------------------------------------- */
  function initCursor() {
    if (!finePointer) return;
    const dot = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-ring");
    if (!dot || !ring) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener("mousemove", function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + "px";
      dot.style.top = mouseY + "px";
    });

    function render() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.left = ringX + "px";
      ring.style.top = ringY + "px";
      requestAnimationFrame(render);
    }
    render();

    document.querySelectorAll("a, button, .is-interactive").forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        ring.classList.add("is-hover");
        dot.classList.add("is-hover");
      });
      el.addEventListener("mouseleave", function () {
        ring.classList.remove("is-hover");
        dot.classList.remove("is-hover");
      });
    });

    document.addEventListener("mouseleave", function () {
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    });
    document.addEventListener("mouseenter", function () {
      dot.style.opacity = "";
      ring.style.opacity = "";
    });
  }

  /* -----------------------------------------------------
     2. Page curtain transition (Curtain Wipe)
  ----------------------------------------------------- */
  function initCurtain() {
    const curtain = document.querySelector(".page-curtain");
    if (!curtain || prefersReduced) return;

    // 入場（前ページからの遷移時のみ）: カーテンが covering 状態から上へ退場
    if (sessionStorage.getItem("renel-transition")) {
      sessionStorage.removeItem("renel-transition");
      // インラインスタイルでページを即時カバー（transitionなし）
      curtain.style.cssText = "transform: translateY(0); transition: none;";
      void curtain.offsetHeight; // reflow
      // 次フレームでインライン transition を使って上方向に退場
      requestAnimationFrame(function () {
        curtain.style.transition = "transform 0.4s cubic-bezier(0.76, 0, 0.24, 1)";
        curtain.style.transform = "translateY(-100%)";
        setTimeout(function () {
          curtain.style.cssText = ""; // インラインスタイル全消去 → CSS default (translateY(100%)) に戻る
        }, 450);
      });
    }

    // 退場（内部リンククリック時）: カーテンが下から覆う → 遷移
    document.querySelectorAll('a[href]').forEach(function (link) {
      const url = link.getAttribute("href");
      if (!url) return;
      const isHash = url.charAt(0) === "#";
      const isExternal = /^(https?:)?\/\//i.test(url) || /^(mailto:|tel:)/i.test(url);
      const newTab = link.target === "_blank";
      if (isHash || isExternal || newTab) return;

      link.addEventListener("click", function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        sessionStorage.setItem("renel-transition", "1");
        curtain.classList.add("entering");
        setTimeout(function () {
          window.location.href = url;
        }, 420);
      });
    });
  }

  /* -----------------------------------------------------
     3. Navigation: scroll blur + mobile toggle
  ----------------------------------------------------- */
  function initNav() {
    const nav = document.getElementById("nav");
    const toggle = document.getElementById("navToggle");
    const links = document.getElementById("navLinks");
    if (!nav) return;

    const isSubPage = nav.classList.contains("is-scrolled");

    if (!isSubPage) {
      const onScroll = function () {
        nav.classList.toggle("is-scrolled", window.scrollY > 40);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    if (toggle && links) {
      toggle.addEventListener("click", function () {
        const open = links.classList.toggle("is-open");
        nav.classList.toggle("is-open", open);
        toggle.setAttribute(
          "aria-label",
          open ? "メニューを閉じる" : "メニューを開く"
        );
      });
      links.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          links.classList.remove("is-open");
          nav.classList.remove("is-open");
        });
      });
    }
  }

  /* -----------------------------------------------------
     4. Smooth scroll (アンカーリンク)
  ----------------------------------------------------- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      const href = link.getAttribute("href");
      if (href === "#" || href.length < 2) return;
      link.addEventListener("click", function (e) {
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(target, { offset: -70 });
        } else {
          const top = target.getBoundingClientRect().top + window.scrollY - 70;
          window.scrollTo({ top: top, behavior: "smooth" });
        }
      });
    });
  }

  /* -----------------------------------------------------
     5. Hero kinetic typography
  ----------------------------------------------------- */
  function initHero() {
    const hero = document.querySelector(".hero");
    if (!hero) return;

    // タイトルを文字単位(.char)に分割
    hero.querySelectorAll(".hero-title__line").forEach(function (line) {
      const text = line.textContent;
      line.textContent = "";
      text.split("").forEach(function (ch) {
        const span = document.createElement("span");
        span.className = "char";
        span.textContent = ch === " " ? " " : ch;
        line.appendChild(span);
      });
    });

    const bg = hero.querySelector(".hero-bg");
    const logo = document.querySelector(".nav .logo");
    const chars = hero.querySelectorAll(".hero-title .char");
    const sub = hero.querySelector(".hero-sub");
    const cta = hero.querySelector(".hero-cta");
    const eyebrow = hero.querySelector(".hero__eyebrow");

    if (!hasGSAP || prefersReduced) {
      [eyebrow, sub, cta].forEach(function (el) {
        if (el) el.style.opacity = "1";
      });
      chars.forEach(function (c) {
        c.style.opacity = "1";
      });
      return;
    }

    const tl = gsap.timeline();
    if (bg) tl.from(bg, { opacity: 0, duration: 0.8 });
    if (eyebrow) {
      tl.from(eyebrow, { y: -10, opacity: 0, duration: 0.5, ease: "expo.out" }, 0.15);
    }
    if (logo) {
      tl.from(logo, { y: -20, opacity: 0, duration: 0.6, ease: "expo.out" }, 0.2);
    }
    tl.from(
      chars,
      { y: 40, opacity: 0, stagger: 0.03, duration: 0.6, ease: "expo.out" },
      0.5
    );
    if (sub) tl.from(sub, { y: 20, opacity: 0, duration: 0.4 }, 0.9);
    if (cta) tl.from(cta, { opacity: 0, duration: 0.3 }, 1.1);

    // Hero背景のパララックス
    if (bg && window.ScrollTrigger) {
      gsap.to(bg, {
        yPercent: 20,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }
  }

  /* -----------------------------------------------------
     6. Scroll reveal (Fade Up)
  ----------------------------------------------------- */
  function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (!hasGSAP || !window.ScrollTrigger || prefersReduced) {
      items.forEach(function (el) {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      return;
    }

    items.forEach(function (el) {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "expo.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    });
  }

  /* -----------------------------------------------------
     7. 3D tilt on cards
  ----------------------------------------------------- */
  function initTilt() {
    if (!finePointer || prefersReduced) return;
    const cards = document.querySelectorAll(".card");
    const MAX = 8;

    cards.forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          "perspective(800px) rotateY(" +
          px * MAX * 2 +
          "deg) rotateX(" +
          -py * MAX * 2 +
          "deg) translateY(-8px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  /* -----------------------------------------------------
     8. Works / Projects filter
  ----------------------------------------------------- */
  function initFilter() {
    const filterWrap = document.getElementById("filters");
    const grid = document.getElementById("cardGrid");
    if (!filterWrap || !grid) return;

    const buttons = filterWrap.querySelectorAll(".filter-btn");
    const cards = grid.querySelectorAll(".card");

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) {
          b.classList.remove("is-active");
        });
        btn.classList.add("is-active");

        const filter = btn.getAttribute("data-filter");
        cards.forEach(function (card) {
          const cat = card.getAttribute("data-category");
          const show = filter === "all" || cat === filter;
          card.classList.toggle("is-hidden", !show);
        });

        if (hasGSAP && !prefersReduced) {
          const visible = grid.querySelectorAll(".card:not(.is-hidden)");
          gsap.fromTo(
            visible,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.05,
              ease: "expo.out",
            }
          );
        }
        if (window.ScrollTrigger) ScrollTrigger.refresh();
      });
    });
  }

  /* -----------------------------------------------------
     9. Contact form (ダミー送信)
  ----------------------------------------------------- */
  function initForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;
    const status = document.getElementById("formStatus");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const name = form.querySelector("#name");
      const email = form.querySelector("#email");
      const message = form.querySelector("#message");

      if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
        if (status) {
          status.classList.add("is-error");
          status.textContent = "すべての項目をご入力ください。";
        }
        return;
      }

      if (status) {
        status.classList.remove("is-error");
        status.textContent =
          "送信しました（デモ表示）。ありがとうございます。折り返しご連絡します。";
      }
      form.reset();
    });
  }

  /* -----------------------------------------------------
     init
  ----------------------------------------------------- */
  /* ----- Magnet Button ----- */
  function initMagnet() {
    document.querySelectorAll('.btn--primary').forEach(btn => {
      btn.style.willChange = 'transform';
      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
        btn.style.transition = 'transform 0.1s ease';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
        btn.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
      });
    });
  }

  /* ----- Nav Text Scramble ----- */
  function initScramble() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    document.querySelectorAll('.nav__links a').forEach(link => {
      const original = link.textContent;
      link.addEventListener('mouseenter', () => {
        let iteration = 0;
        clearInterval(link._scramble);
        link._scramble = setInterval(() => {
          link.textContent = original.split('').map((char, i) =>
            char === ' ' ? ' ' :
            i < iteration ? original[i] :
            chars[Math.floor(Math.random() * chars.length)]
          ).join('');
          iteration += 0.35;
          if (iteration >= original.length) {
            clearInterval(link._scramble);
            link.textContent = original;
          }
        }, 28);
      });
    });
  }

  function init() {
    initLenis();
    initCursor();
    initCurtain();
    initNav();
    initSmoothScroll();
    initHero();
    initReveal();
    initTilt();
    initFilter();
    initForm();
    initMagnet();
    initScramble();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
