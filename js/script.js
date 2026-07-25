/* ==================================================================
   VENKATESWARLU RAJARAPU — PORTFOLIO
   Vanilla JS — no external runtime dependencies
   ================================================================== */
(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------
     1. LOADER
     --------------------------------------------------------------- */
  window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    if (!loader) return;
    setTimeout(() => {
      loader.classList.add("loaded");
      document.body.style.overflow = "";
    }, 500);
  });

  /* ---------------------------------------------------------------
     2. THEME TOGGLE (persists via in-memory state; falls back to
        system preference — no localStorage per artifact sandbox rules,
        but this is a static site so localStorage is safe here)
     --------------------------------------------------------------- */
  const themeToggle = document.getElementById("themeToggle");
  const root = document.documentElement;

  function applyStoredTheme() {
    let stored = null;
    try { stored = window.localStorage.getItem("portfolio-theme"); } catch (e) { /* ignore */ }
    if (stored === "light" || stored === "dark") {
      root.setAttribute("data-theme", stored);
    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      root.setAttribute("data-theme", "light");
    }
  }
  applyStoredTheme();

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") === "light" ? "light" : "dark";
      const next = current === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try { window.localStorage.setItem("portfolio-theme", next); } catch (e) { /* ignore */ }
    });
  }

  /* ---------------------------------------------------------------
     3. ACTIVE NAV LINK STATE (declared early — used by onScroll below)
     --------------------------------------------------------------- */
  const sections = Array.from(document.querySelectorAll("main section[id]"));
  const navAnchors = Array.from(document.querySelectorAll(".nav-links a"));

  function updateActiveNav() {
    let currentId = sections.length ? sections[0].id : "";
    const scrollPos = window.scrollY + 140;

    sections.forEach((sec) => {
      if (sec.offsetTop <= scrollPos) currentId = sec.id;
    });

    navAnchors.forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === "#" + currentId);
    });
  }

  /* ---------------------------------------------------------------
     4. SCROLL PROGRESS BAR + HEADER STATE + BACK TO TOP
     --------------------------------------------------------------- */
  const progressBar = document.getElementById("progress-bar");
  const header = document.getElementById("header");
  const backToTop = document.getElementById("backToTop");

  function onScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + "%";

    if (header) header.classList.toggle("scrolled", scrollTop > 20);
    if (backToTop) backToTop.classList.toggle("show", scrollTop > 500);

    updateActiveNav();
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  /* ---------------------------------------------------------------
     4. MOBILE MENU
     --------------------------------------------------------------- */
  const menuBtn = document.getElementById("menu-btn");
  const navLinks = document.getElementById("navLinks");

  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(isOpen));
      menuBtn.innerHTML = isOpen
        ? '<i class="fa-solid fa-xmark" aria-hidden="true"></i>'
        : '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
      });
    });
  }

  /* ---------------------------------------------------------------
     7. HERO CANVAS — network / node backdrop (signature element)
     --------------------------------------------------------------- */
  const canvas = document.getElementById("hero-canvas");
  const ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;
  if (canvas && ctx) {
    const heroSection = document.getElementById("home");
    let nodes = [];
    let w, h, dpr;
    let mouse = { x: null, y: null };

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = heroSection.offsetWidth;
      h = heroSection.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildNodes();
    }

    function buildNodes() {
      const density = Math.min(70, Math.floor((w * h) / 18000));
      nodes = Array.from({ length: density }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.6 + 0.6
      }));
    }

    function step() {
      ctx.clearRect(0, 0, w, h);
      const linkDist = 130;

      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < linkDist) {
            ctx.strokeStyle = `rgba(109,94,248,${0.16 * (1 - dist / linkDist)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(45,212,191,0.55)";
        ctx.fill();
      });

      if (!prefersReducedMotion) requestAnimationFrame(step);
    }

    resize();
    window.addEventListener("resize", resize);
    step();
  }

  /* ---------------------------------------------------------------
     8. TYPEWRITER (hero role text) — no external dependency
     --------------------------------------------------------------- */
  const typedEl = document.getElementById("typedText");
  if (typedEl) {
    const roles = [
      "Data Science Enthusiast",
      "Machine Learning Engineer",
      "AI / ML Explorer",
      "Full-Stack Developer"
    ];
    let roleIdx = 0, charIdx = 0, deleting = false;

    function typeTick() {
      const word = roles[roleIdx];
      if (!deleting) {
        charIdx++;
        typedEl.textContent = word.slice(0, charIdx);
        if (charIdx === word.length) {
          deleting = true;
          setTimeout(typeTick, 1400);
          return;
        }
      } else {
        charIdx--;
        typedEl.textContent = word.slice(0, charIdx);
        if (charIdx === 0) {
          deleting = false;
          roleIdx = (roleIdx + 1) % roles.length;
        }
      }
      setTimeout(typeTick, deleting ? 40 : 85);
    }

    if (prefersReducedMotion) {
      typedEl.textContent = roles[0];
    } else {
      typeTick();
    }
  }

  /* ---------------------------------------------------------------
     9. SCROLL-REVEAL via IntersectionObserver
     --------------------------------------------------------------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach((el, i) => {
      el.style.setProperty("--reveal-delay", Math.min(i % 4, 3) * 0.08 + "s");
      io.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add("in-view"));
  }

  /* ---------------------------------------------------------------
     10. ANIMATED STAT COUNTERS
     --------------------------------------------------------------- */
  const counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && counters.length) {
    const counterIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseInt(el.getAttribute("data-count"), 10) || 0;
          const suffix = el.getAttribute("data-suffix") || "";
          const duration = 1200;
          const start = performance.now();

          function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target) + suffix;
            if (progress < 1) requestAnimationFrame(tick);
          }
          if (prefersReducedMotion) {
            el.textContent = target + suffix;
          } else {
            requestAnimationFrame(tick);
          }
          counterIO.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((el) => counterIO.observe(el));
  }

  /* ---------------------------------------------------------------
     11. SKILL METER FILL ON VIEW
     --------------------------------------------------------------- */
  const meters = document.querySelectorAll(".skill-meter-fill");
  if ("IntersectionObserver" in window && meters.length) {
    const meterIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            el.style.width = el.getAttribute("data-progress") + "%";
            meterIO.unobserve(el);
          }
        });
      },
      { threshold: 0.3 }
    );
    meters.forEach((el) => meterIO.observe(el));
  }

  /* ---------------------------------------------------------------
     12. SKILLS TABS
     --------------------------------------------------------------- */
  const skillTabs = document.querySelectorAll(".skills-tab");
  const skillPanels = document.querySelectorAll(".skills-panel");

  skillTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      skillTabs.forEach((t) => { t.classList.remove("active"); t.setAttribute("aria-selected", "false"); });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");

      skillPanels.forEach((p) => p.classList.remove("active"));
      const target = document.getElementById("panel-" + tab.dataset.tab);
      if (target) {
        target.classList.add("active");
        target.querySelectorAll(".skill-meter-fill").forEach((fill) => {
          fill.style.width = "0%";
          requestAnimationFrame(() => {
            fill.style.width = fill.getAttribute("data-progress") + "%";
          });
        });
      }
    });
  });

  /* ---------------------------------------------------------------
     13. PROJECT FILTER
     --------------------------------------------------------------- */
  const filterBtns = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.filter;

      projectCards.forEach((card) => {
        const match = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("hide", !match);
      });
    });
  });

  /* ---------------------------------------------------------------
     15. FOOTER YEAR
     --------------------------------------------------------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
