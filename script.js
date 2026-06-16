/**
 * script.js - Heshani Wickramasinghe Portfolio Script
 * Interactive typewriter, counters, and smooth layout transitions
 */

(() => {
  // Set copyright year
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Core navigation, sidebar, and theme components
  const asideToggler = document.getElementById("asideToggler");
  const aside = document.getElementById("aside");
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const themeText = document.getElementById("themeText");

  const closeSidebar = () => {
    if (aside && asideToggler) {
      aside.classList.remove("open");
      asideToggler.classList.remove("active");
    }
  };

  const STORAGE_KEY = "theme";
  const root = document.documentElement;

  function applyTheme(theme) {
    if (theme === "light") {
      root.setAttribute("data-theme", "light");
      if (themeIcon) {
        themeIcon.className = "bi bi-moon-stars-fill";
      }
      if (themeText) themeText.textContent = "Dark";
    } else {
      root.removeAttribute("data-theme");
      if (themeIcon) {
        themeIcon.className = "bi bi-sun-fill";
      }
      if (themeText) themeText.textContent = "Light";
    }
  }

  // Load saved theme, default dark
  const savedTheme = localStorage.getItem(STORAGE_KEY);
  const initialTheme = savedTheme === "light" ? "light" : "dark";
  applyTheme(initialTheme);

  // Toggle theme click listener
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") === "light" ? "light" : "dark";
      const next = current === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
    });
  }

  // Mobile sidebar toggle click listener
  if (asideToggler && aside) {
    asideToggler.addEventListener("click", () => {
      aside.classList.toggle("open");
      asideToggler.classList.toggle("active");
    });
  }

  // Navigation logic & Section transitions
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = ["home", "about", "work", "credentials", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  function showSection(targetId) {
    const activeSection = document.querySelector(".section.active");
    const targetSection = document.getElementById(targetId);
    
    if (!targetSection || activeSection === targetSection) return;
    
    sections.forEach(sec => {
      if (sec !== activeSection) {
        sec.classList.remove("back-section");
      }
    });

    if (activeSection) {
      activeSection.classList.add("back-section");
      activeSection.classList.remove("active");
    }
    
    targetSection.classList.remove("back-section");
    targetSection.classList.add("active");
    
    // Update nav link active states
    navLinks.forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === `#${targetId}` || a.dataset.section === targetId);
    });

    // Hash update in URL (without breaking page positions)
    if (window.location.hash !== `#${targetId}`) {
      history.pushState(null, null, `#${targetId}`);
    }

    // Trigger animations for the active section
    if (targetId === "about") {
      setTimeout(animateStats, 300);
      setTimeout(animateProgressBars, 300);
    } else if (targetId === "work") {
      setTimeout(triggerCardQueue, 80);
    } else {
      resetStats();
      resetProgressBars();
    }
  }

  // Bind navigation click events
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const href = link.getAttribute("href");
      if (href && href.startsWith("#")) {
        const targetId = href.substring(1);
        showSection(targetId);
        closeSidebar();
      }
    });
  });

  // Bind CTA links and buttons to their sections
  document.querySelectorAll('a[href^="#"]').forEach(btn => {
    if (!btn.classList.contains("nav-link")) {
      btn.addEventListener("click", (e) => {
        const targetId = btn.getAttribute("href").substring(1);
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
          e.preventDefault();
          showSection(targetId);
        }
      });
    }
  });

  // ============================================
  // TYPEWRITER ANIMATION
  // ============================================
  function initTypewriter() {
    const typewriterEl = document.getElementById("typewriter");
    if (!typewriterEl) return;
    
    const words = [
      "I'm a Full-Stack Developer.",
      "I'm a Spring Boot Developer.",
      "I'm an Android Developer.",
      "I'm a MERN Stack Developer."
    ];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    
    function type() {
      const currentWord = words[wordIndex];
      if (isDeleting) {
        typewriterEl.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typewriterEl.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
      }
      
      let typingSpeed = isDeleting ? 40 : 80;
      
      if (!isDeleting && charIndex === currentWord.length) {
        typingSpeed = 2000; // Pause at end
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typingSpeed = 600; // Pause before next word
      }
      
      setTimeout(type, typingSpeed);
    }
    
    type();
  }

  // ============================================
  // STATS COUNTERS ANIMATION
  // ============================================
  function animateStats() {
    const stats = document.querySelectorAll(".stat-number");
    stats.forEach(stat => {
      if (stat.dataset.animated === "true") return;
      stat.dataset.animated = "true";
      
      const target = +stat.dataset.target;
      const duration = 1200; // 1.2s
      const start = performance.now();
      
      function update(now) {
        const progress = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3); // cubic ease out
        stat.textContent = Math.round(ease * target);
        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          stat.textContent = target;
        }
      }
      requestAnimationFrame(update);
    });
  }

  function resetStats() {
    const stats = document.querySelectorAll(".stat-number");
    stats.forEach(stat => {
      stat.dataset.animated = "false";
      stat.textContent = "0";
    });
  }

  // ============================================
  // PROGRESS BARS ANIMATION
  // ============================================
  function animateProgressBars() {
    const progressBars = document.querySelectorAll(".progress-in");
    progressBars.forEach(bar => {
      const width = bar.dataset.width;
      bar.style.width = width;
    });
  }

  function resetProgressBars() {
    const progressBars = document.querySelectorAll(".progress-in");
    progressBars.forEach(bar => {
      bar.style.width = "0%";
    });
  }

  // ============================================
  // TOAST MESSAGES
  // ============================================
  const toast = document.getElementById("toast");
  const toastText = document.getElementById("toastText");
  let toastTimer = null;

  function showToast(msg) {
    if (!toast || !toastText) return;
    toastText.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2500);
  }

  // ============================================
  // CONTACT FORM SUBMISSION
  // ============================================
  const form = document.getElementById("contactForm");
  const clearBtn = document.getElementById("clearBtn");

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email);
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const subject = document.getElementById("subject").value.trim();
      const message = document.getElementById("message").value.trim();

      if (!name || !email || !subject || !message) {
        showToast("Please fill all fields.");
        return;
      }
      if (!isValidEmail(email)) {
        showToast("Please enter a valid email address.");
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "SENDING...";

      const templateParams = {
        name: name,
        email: email,
        subject: subject,
        message: message,
      };

      emailjs.send("service_4p9vfjo", "template_izebr8l", templateParams)
        .then(() => {
          showToast("Message sent successfully! ✓");
          form.reset();
        })
        .catch((error) => {
          console.error("EmailJS Error:", error);
          showToast("EmailJS failed. Opening mail client...");
          setTimeout(() => {
            const mailtoLink = `mailto:wickramasinghheshani@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent("From: " + name + " (" + email + ")\n\n" + message)}`;
            window.location.href = mailtoLink;
          }, 1500);
        })
        .finally(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        });
    });
  }

  if (clearBtn && form) {
    clearBtn.addEventListener("click", () => {
      form.reset();
      showToast("Form cleared.");
    });
  }

  // ============================================
  // HERO CANVAS ANIMATION (Constellation)
  // ============================================
  const canvas = document.getElementById("heroCanvas");
  if (canvas) {
    const ctx = canvas.getContext("2d", { alpha: true });
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0, h = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const pointer = { x: 0.5, y: 0.5, active: false };

    function resize() {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    window.addEventListener("resize", resize);

    const points = [];
    const POINTS = 35; // slightly reduced for smaller visual circle area
    const MAX_LINK_DIST = 100;
    const SPEED = 0.35;

    function rand(min, max) {
      return Math.random() * (max - min) + min;
    }

    function initPoints() {
      points.length = 0;
      for (let i = 0; i < POINTS; i++) {
        points.push({
          x: rand(0, w),
          y: rand(0, h),
          vx: rand(-SPEED, SPEED),
          vy: rand(-SPEED, SPEED),
          r: rand(1.2, 2.2),
        });
      }
    }

    function clamp(v, a, b) {
      return Math.max(a, Math.min(b, v));
    }

    function drawBackground() {
      const grad = ctx.createRadialGradient(w * 0.5, h * 0.5, 40, w * 0.5, h * 0.5, Math.max(w, h) * 0.6);
      const isDark = !root.getAttribute("data-theme") || root.getAttribute("data-theme") === "dark";
      
      if (isDark) {
        grad.addColorStop(0, "rgba(56,189,248,0.12)");
        grad.addColorStop(0.6, "rgba(167,139,250,0.05)");
        grad.addColorStop(1, "rgba(0,0,0,0)");
      } else {
        grad.addColorStop(0, "rgba(2,132,199,0.06)");
        grad.addColorStop(0.6, "rgba(124,58,237,0.03)");
        grad.addColorStop(1, "rgba(0,0,0,0)");
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    function step() {
      ctx.clearRect(0, 0, w, h);
      drawBackground();

      const px = pointer.x * w;
      const py = pointer.y * h;

      for (const p of points) {
        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;
        }

        if (p.x <= 0 || p.x >= w) p.vx *= -1;
        if (p.y <= 0 || p.y >= h) p.vy *= -1;

        if (pointer.active && !prefersReducedMotion) {
          const dx = px - p.x;
          const dy = py - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const pull = clamp((120 - dist) / 120, 0, 1) * 0.2;
          p.x += (dx / dist) * pull;
          p.y += (dy / dist) * pull;
        }
      }

      ctx.lineWidth = 1;
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const a = points[i];
          const b = points[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_LINK_DIST) {
            const alpha = 1 - dist / MAX_LINK_DIST;
            const isDark = !root.getAttribute("data-theme") || root.getAttribute("data-theme") === "dark";
            const strokeColor = isDark ? `rgba(167,139,250,${0.14 * alpha})` : `rgba(124,58,237,${0.1 * alpha})`;
            ctx.strokeStyle = strokeColor;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const p of points) {
        const isDark = !root.getAttribute("data-theme") || root.getAttribute("data-theme") === "dark";
        ctx.fillStyle = isDark ? "rgba(255,255,255,0.65)" : "rgba(15,23,42,0.5)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(step);
    }

    function getLocalPointer(evt) {
      const rect = canvas.getBoundingClientRect();
      const x = (evt.clientX - rect.left) / rect.width;
      const y = (evt.clientY - rect.top) / rect.height;
      pointer.x = clamp(x, 0, 1);
      pointer.y = clamp(y, 0, 1);
    }

    canvas.addEventListener("pointermove", (e) => {
      pointer.active = true;
      getLocalPointer(e);
    });
    canvas.addEventListener("pointerleave", () => {
      pointer.active = false;
    });

    resize();
    initPoints();
    step();
  }

  // ============================================
  // PROJECT MODAL
  // ============================================
  const modalBackdrop = document.getElementById("projectModalBackdrop");
  const modalClose    = document.getElementById("modalClose");
  const modalImg      = document.getElementById("modalImg");
  const modalTitle    = document.getElementById("modalTitle");
  const modalYear     = document.getElementById("modalYear");
  const modalDesc     = document.getElementById("modalDesc");
  const modalTags     = document.getElementById("modalTags");
  const modalActions  = document.getElementById("modalActions");

  function openProjectModal(card) {
    const { title, year, desc, tags, demo, github, img } = card.dataset;

    modalImg.src = img;
    modalImg.alt = title;
    modalTitle.textContent = title;
    modalYear.textContent  = year;
    modalDesc.textContent  = desc;

    // Build tags
    modalTags.innerHTML = tags.split(",")
      .map(t => `<span>${t.trim()}</span>`).join("");

    // Build action buttons
    modalActions.innerHTML = "";
    if (demo) {
      const a = document.createElement("a");
      a.className = "btn btn-small btn-primary";
      a.href = demo;
      a.target = "_blank";
      a.rel = "noreferrer";
      a.textContent = "Live Demo";
      modalActions.appendChild(a);
    } else {
      const s = document.createElement("span");
      s.className = "btn btn-small btn-ghost";
      s.style.cssText = "opacity:0.55;cursor:not-allowed;pointer-events:none";
      s.textContent = "Android App";
      modalActions.appendChild(s);
    }
    if (github) {
      const a = document.createElement("a");
      a.className = "btn btn-small btn-ghost";
      a.href = github;
      a.target = "_blank";
      a.rel = "noreferrer";
      a.innerHTML = '<i class="bi bi-github"></i> GitHub';
      modalActions.appendChild(a);
    }

    modalBackdrop.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeProjectModal() {
    modalBackdrop.classList.remove("open");
    document.body.style.overflow = "";
  }

  if (modalClose)    modalClose.addEventListener("click", closeProjectModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) closeProjectModal();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeProjectModal();
  });

  // Attach click to each project card
  document.querySelectorAll(".project-card").forEach(card => {
    card.style.cursor = "pointer";
    card.addEventListener("click", () => openProjectModal(card));
  });

  // ============================================
  // ROTATION QUEUE ANIMATION (trigger when Work section becomes active)
  // ============================================
  function triggerCardQueue() {
    const cards = document.querySelectorAll(".project-card");
    cards.forEach(c => c.classList.remove("card-animate"));
    // Force reflow so re-adding the class restarts animation
    void document.querySelector(".projects-grid").offsetWidth;
    cards.forEach(c => c.classList.add("card-animate"));
  }

  function init() {
    initTypewriter();

    // Route active section on initial load hash
    const currentHash = window.location.hash.substring(1);
    if (currentHash && sections.find(s => s.id === currentHash)) {
      showSection(currentHash);
      if (currentHash === "work") setTimeout(triggerCardQueue, 80);
    } else {
      showSection("home");
    }
  }

  // Document init readyState check
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
