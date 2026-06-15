/**
 * script.js - Heshani Wickramasinghe Portfolio Script
 * Adapted from Ushan's design system with interactive components
 */

(() => {
  // Set copyright year
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Sidebar menu & mobile toggle
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
      if (themeIcon) themeIcon.textContent = "☾";
      if (themeText) themeText.textContent = "Dark";
    } else {
      root.removeAttribute("data-theme");
      if (themeIcon) themeIcon.textContent = "☀";
      if (themeText) themeText.textContent = "Light";
    }
  }

  // Load saved theme, else default dark
  const savedTheme = localStorage.getItem(STORAGE_KEY);
  const initialTheme = savedTheme === "light" ? "light" : "dark";
  applyTheme(initialTheme);

  // Toggle
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") === "light" ? "light" : "dark";
      const next = current === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
    });
  }

  if (asideToggler && aside) {
    asideToggler.addEventListener("click", () => {
      aside.classList.toggle("open");
      asideToggler.classList.toggle("active");
    });
  }

  // Active nav link and section sliding transitions
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = ["home", "work", "about", "credentials", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  function showSection(targetId) {
    const activeSection = document.querySelector(".section.active");
    const targetSection = document.getElementById(targetId);
    
    if (!targetSection || activeSection === targetSection) return;
    
    // Set all sections to remove back-section except the currently active one
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
  }

  // Bind click listeners to navigation links
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

  // Also bind other buttons that link to portfolio sections (e.g. View Work, See my Work)
  document.querySelectorAll('a[href^="#"]').forEach(btn => {
    // Only bind if it's not already handled via nav-link class
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

  // Toast
  const toast = document.getElementById("toast");
  const toastText = document.getElementById("toastText");
  let toastTimer = null;

  function showToast(msg) {
    if (!toast || !toastText) return;
    toastText.textContent = msg;
    toast.hidden = false;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
      toast.hidden = true;
    }, 2500);
  }

  // Contact form (EmailJS integration)
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

      // Show loading state
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "SENDING...";

      // EmailJS parameters
      const templateParams = {
        name: name,
        email: email,
        subject: subject,
        message: message,
      };

      // Send email using EmailJS
      emailjs.send("service_4p9vfjo", "template_izebr8l", templateParams)
        .then((response) => {
          console.log("SUCCESS!", response.status, response.text);
          showToast("Message sent successfully! ✓");
          form.reset();
        })
        .catch((error) => {
          console.error("EmailJS Error Details:", error);
          
          // Fallback: If EmailJS fails due to limits or API keys, prompt traditional mailto
          let errorMsg = "EmailJS failed. Opening mail client...";
          showToast(errorMsg);

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

    // Points
    const points = [];
    const POINTS = 55;
    const MAX_LINK_DIST = 120;
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
          r: rand(1.3, 2.4),
        });
      }
    }

    function clamp(v, a, b) {
      return Math.max(a, Math.min(b, v));
    }

    function drawBackground() {
      // Soft vignette background inside canvas
      const grad = ctx.createRadialGradient(w * 0.5, h * 0.45, 60, w * 0.5, h * 0.45, Math.max(w, h) * 0.7);
      
      const isDark = !root.getAttribute("data-theme") || root.getAttribute("data-theme") === "dark";
      if (isDark) {
        grad.addColorStop(0, "rgba(90,167,255,0.16)");
        grad.addColorStop(0.6, "rgba(147,245,255,0.06)");
        grad.addColorStop(1, "rgba(0,0,0,0)");
      } else {
        grad.addColorStop(0, "rgba(37,99,235,0.08)");
        grad.addColorStop(0.6, "rgba(6,182,212,0.04)");
        grad.addColorStop(1, "rgba(0,0,0,0)");
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Subtle noise grain
      ctx.globalAlpha = 0.08;
      for (let i = 0; i < 120; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)";
        ctx.fillRect(x, y, 1, 1);
      }
      ctx.globalAlpha = 1;
    }

    function step() {
      ctx.clearRect(0, 0, w, h);
      drawBackground();

      const px = pointer.x * w;
      const py = pointer.y * h;

      // Move points
      for (const p of points) {
        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;
        }

        // Bounce boundaries
        if (p.x <= 0 || p.x >= w) p.vx *= -1;
        if (p.y <= 0 || p.y >= h) p.vy *= -1;

        // Pull towards cursor if hover is active
        if (pointer.active && !prefersReducedMotion) {
          const dx = px - p.x;
          const dy = py - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const pull = clamp((140 - dist) / 140, 0, 1) * 0.22;
          p.x += (dx / dist) * pull;
          p.y += (dy / dist) * pull;
        }
      }

      // Draw constellation links
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
            const strokeColor = isDark ? `rgba(90,167,255,${0.16 * alpha})` : `rgba(37,99,235,${0.14 * alpha})`;
            ctx.strokeStyle = strokeColor;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Draw dots
      for (const p of points) {
        const isDark = !root.getAttribute("data-theme") || root.getAttribute("data-theme") === "dark";
        ctx.fillStyle = isDark ? "rgba(255,255,255,0.70)" : "rgba(10,20,35,0.60)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Highlight hover radius
      if (pointer.active && !prefersReducedMotion) {
        const ring = ctx.createRadialGradient(px, py, 0, px, py, 140);
        const isDark = !root.getAttribute("data-theme") || root.getAttribute("data-theme") === "dark";
        if (isDark) {
          ring.addColorStop(0, "rgba(147,245,255,0.18)");
          ring.addColorStop(1, "rgba(147,245,255,0)");
        } else {
          ring.addColorStop(0, "rgba(6,182,212,0.1)");
          ring.addColorStop(1, "rgba(6,182,212,0)");
        }
        ctx.fillStyle = ring;
        ctx.beginPath();
        ctx.arc(px, py, 140, 0, Math.PI * 2);
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
  // LIQUID BUTTON EFFECT
  // ============================================
  const LiquidButton = class LiquidButton {
    constructor(button) {
      const { width, height } = button.getBoundingClientRect();
      const buttonStyles = window.getComputedStyle(button);
      const options = button.dataset || {};

      this.button = button;
      this.font = `${buttonStyles['font-size']} ${buttonStyles['font-family']}`;
      this.tension = options.tension || 0.4;
      this.width = width;
      this.height = height;
      this.margin = options.margin || 50;
      this.padding = parseFloat(buttonStyles.paddingRight);
      this.hoverFactor = options.hoverFactor || 0.5;
      this.gap = options.gap || 5;
      this.debug = options.debug || false;
      this.forceFactor = options.forceFactor || 0.2;
      
      const isDarkTheme = !root.getAttribute("data-theme") || root.getAttribute("data-theme") === "dark";
      
      // Check for social links matching text or custom classes
      const buttonText = button.textContent.trim().toLowerCase();
      const buttonHref = button.href ? button.href.toLowerCase() : '';
      let isSocial = false;
      
      if (buttonText.includes('gmail') || buttonHref.includes('mailto')) {
        this.color1 = '#EA4335';
        this.color2 = '#FBBC05';
        this.color3 = '#34A853';
        isSocial = true;
      } else if (buttonText.includes('github') || buttonHref.includes('github')) {
        this.color1 = '#4F46E5'; // indigo
        this.color2 = '#6366F1';
        this.color3 = '#818CF8';
        isSocial = true;
      } else if (buttonText.includes('linkedin') || buttonHref.includes('linkedin')) {
        this.color1 = '#0077B5';
        this.color2 = '#0A66C2';
        this.color3 = '#378ADD';
        isSocial = true;
      } else if (buttonText.includes('instagram') || buttonHref.includes('instagram')) {
        this.color1 = '#E1306C';
        this.color2 = '#C13584';
        this.color3 = '#F77737';
        isSocial = true;
      }
      
      // Default styles for actions
      if (!isSocial) {
        if (button.classList.contains('btn-primary')) {
          this.color1 = isDarkTheme ? '#1E40AF' : '#2563EB';
          this.color2 = isDarkTheme ? '#0F766E' : '#0D9488';
          this.color3 = isDarkTheme ? '#3B82F6' : '#60A5FA';
        } else {
          this.color1 = isDarkTheme ? 'rgba(255,255,255,0.08)' : 'rgba(10,20,35,0.06)';
          this.color2 = isDarkTheme ? 'rgba(255,255,255,0.14)' : 'rgba(10,20,35,0.10)';
          this.color3 = isDarkTheme ? 'rgba(255,255,255,0.10)' : 'rgba(10,20,35,0.08)';
        }
      }
      
      this.textColor = buttonStyles.color || '#FFFFFF';
      this.layers = [{
        points: [],
        viscosity: 0.5,
        mouseForce: 100,
        forceLimit: 2,
      }, {
        points: [],
        viscosity: 0.8,
        mouseForce: 150,
        forceLimit: 3,
      }];
      this.text = button.textContent;
      this.canvas = options.canvas || document.createElement('canvas');
      this.context = this.canvas.getContext('2d');
      
      this.canvas.style.position = 'absolute';
      this.canvas.style.top = '50%';
      this.canvas.style.left = '50%';
      this.canvas.style.transform = 'translate(-50%, -50%)';
      this.canvas.style.zIndex = '-1';
      this.canvas.style.pointerEvents = 'none';
      
      button.appendChild(this.canvas);
      this.touches = [];
      this.noise = options.noise || 0;
      
      button.addEventListener('mousemove', this.mousemove.bind(this));
      button.addEventListener('mouseout', this.mouseout.bind(this));
      
      this.initOrigins();
      this.animate();
      this.restingFace();
    }

    restingFace() {
      this.mousemove({ offsetX: Math.random() * this.width, offsetY: 1 });
    }

    mousemove(e) {
      this.touches = [{
        x: e.offsetX,
        y: e.offsetY,
        z: 0,
        force: 1,
      }];
    }

    mouseout(e) {
      this.touches = [];
      this.restingFace();
    }

    get raf() {
      return this.__raf || (this.__raf = (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function (callback) { setTimeout(callback, 10); }
      ).bind(window));
    }

    distance(p1, p2) {
      return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    }

    update() {
      for (let layerIndex = 0; layerIndex < this.layers.length; layerIndex++) {
        const layer = this.layers[layerIndex];
        const points = layer.points;
        for (let pointIndex = 0; pointIndex < points.length; pointIndex++) {
          const point = points[pointIndex];
          const dx = point.ox - point.x + (Math.random() - 0.5) * this.noise;
          const dy = point.oy - point.y + (Math.random() - 0.5) * this.noise;
          const d = Math.sqrt(dx * dx + dy * dy);
          const f = d * this.forceFactor;
          point.vx += f * ((dx / d) || 0);
          point.vy += f * ((dy / d) || 0);
          for (let touchIndex = 0; touchIndex < this.touches.length; touchIndex++) {
            const touch = this.touches[touchIndex];
            let mouseForce = layer.mouseForce;
            if (
              touch.x > this.margin &&
              touch.x < this.margin + this.width &&
              touch.y > this.margin &&
              touch.y < this.margin + this.height
            ) {
              mouseForce *= -this.hoverFactor;
            }
            const mx = point.x - touch.x;
            const my = point.y - touch.y;
            const md = Math.sqrt(mx * mx + my * my);
            const mf = Math.max(-layer.forceLimit, Math.min(layer.forceLimit, (mouseForce * touch.force) / md));
            point.vx += mf * ((mx / md) || 0);
            point.vy += mf * ((my / md) || 0);
          }
          point.vx *= layer.viscosity;
          point.vy *= layer.viscosity;
          point.x += point.vx;
          point.y += point.vy;
        }
        for (let pointIndex = 0; pointIndex < points.length; pointIndex++) {
          const prev = points[(pointIndex + points.length - 1) % points.length];
          const point = points[pointIndex];
          const next = points[(pointIndex + points.length + 1) % points.length];
          const dPrev = this.distance(point, prev);
          const dNext = this.distance(point, next);

          const line = {
            x: next.x - prev.x,
            y: next.y - prev.y,
          };
          const dLine = Math.sqrt(line.x * line.x + line.y * line.y);

          point.cPrev = {
            x: point.x - (line.x / dLine) * dPrev * this.tension,
            y: point.y - (line.y / dLine) * dPrev * this.tension,
          };
          point.cNext = {
            x: point.x + (line.x / dLine) * dNext * this.tension,
            y: point.y + (line.y / dLine) * dNext * this.tension,
          };
        }
      }
    }

    animate() {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReducedMotion) {
        this.draw();
        return;
      }
      
      this.raf(() => {
        this.update();
        this.draw();
        this.animate();
      });
    }

    draw() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      for (let layerIndex = 0; layerIndex < this.layers.length; layerIndex++) {
        const layer = this.layers[layerIndex];
        if (layerIndex === 1) {
          if (this.touches.length > 0) {
            const gx = this.touches[0].x;
            const gy = this.touches[0].y;
            layer.color = this.context.createRadialGradient(gx, gy, this.height * 2, gx, gy, 0);
            layer.color.addColorStop(0, this.color2);
            layer.color.addColorStop(1, this.color3);
          } else {
            layer.color = this.color2;
          }
        } else {
          layer.color = this.color1;
        }
        const points = layer.points;
        this.context.fillStyle = layer.color;

        this.context.beginPath();
        this.context.moveTo(points[0].x, points[0].y);
        for (let pointIndex = 1; pointIndex < points.length; pointIndex += 1) {
          this.context.bezierCurveTo(
            points[(pointIndex + 0) % points.length].cNext.x,
            points[(pointIndex + 0) % points.length].cNext.y,
            points[(pointIndex + 1) % points.length].cPrev.x,
            points[(pointIndex + 1) % points.length].cPrev.y,
            points[(pointIndex + 1) % points.length].x,
            points[(pointIndex + 1) % points.length].y
          );
        }
        this.context.fill();
      }
    }

    createPoint(x, y) {
      return { x: x, y: y, ox: x, oy: y, vx: 0, vy: 0 };
    }

    initOrigins() {
      this.canvas.width = this.width + this.margin * 2;
      this.canvas.height = this.height + this.margin * 2;
      for (let layerIndex = 0; layerIndex < this.layers.length; layerIndex++) {
        const layer = this.layers[layerIndex];
        const points = [];
        for (let x = ~~(this.height / 2); x < this.width - ~~(this.height / 2); x += this.gap) {
          points.push(this.createPoint(x + this.margin, this.margin));
        }
        for (let alpha = ~~(this.height * 1.25); alpha >= 0; alpha -= this.gap) {
          const angle = (Math.PI / ~~(this.height * 1.25)) * alpha;
          points.push(this.createPoint(
            Math.sin(angle) * this.height / 2 + this.margin + this.width - this.height / 2,
            Math.cos(angle) * this.height / 2 + this.margin + this.height / 2
          ));
        }
        for (let x = this.width - ~~(this.height / 2) - 1; x >= ~~(this.height / 2); x -= this.gap) {
          points.push(this.createPoint(x + this.margin, this.margin + this.height));
        }
        for (let alpha = 0; alpha <= ~~(this.height * 1.25); alpha += this.gap) {
          const angle = (Math.PI / ~~(this.height * 1.25)) * alpha;
          points.push(this.createPoint(
            (this.height - Math.sin(angle) * this.height / 2) + this.margin - this.height / 2,
            Math.cos(angle) * this.height / 2 + this.margin + this.height / 2
          ));
        }
        layer.points = points;
      }
    }
  };

  function initLiquidButtons() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const buttons = document.querySelectorAll('.btn, .icon-btn');
    buttons.forEach(button => {
      if (button.liquidButton) return;
      button.liquidButton = new LiquidButton(button);
    });
  }

  // Initialize
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLiquidButtons);
  } else {
    setTimeout(initLiquidButtons, 100);
  }

  // Reload liquid buttons on theme change
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      setTimeout(() => {
        document.querySelectorAll('.btn, .icon-btn').forEach(btn => {
          const canvas = btn.querySelector('canvas');
          if (canvas) canvas.remove();
          delete btn.liquidButton;
        });
        initLiquidButtons();
      }, 200);
    });
  }
})();
