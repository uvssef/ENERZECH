/* ═══════════════════════════════════════════════════════════════
   ENERZECH  |  script.js v3
   ═══════════════════════════════════════════════════════════════ */

// EmailJS init — runs once, safe to call even on pages without a form
if (typeof emailjs !== 'undefined') {
  emailjs.init({ publicKey: "8NLcvO1r9-XCfh3e_" });
}

(function () {
  'use strict';

  const header = document.getElementById('site-header');
  const burger = document.getElementById('nav-burger');
  const nav    = document.getElementById('main-nav');

  if (header) {
    function updateHeader() {
      if (window.scrollY > 60) {
        header.classList.remove('transparent');
        header.classList.add('solid');
      } else {
        header.classList.remove('solid');
        header.classList.add('transparent');
      }
    }

    header.classList.add('transparent');
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();

    window.addEventListener('resize', updateHeader);
  }

  if (burger && nav && header) {
    burger.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = nav.classList.toggle('open');
      burger.classList.toggle('open', open);
    });

    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        burger.classList.remove('open');
      });
    });

    document.addEventListener('click', e => {
      if (!header.contains(e.target)) {
        nav.classList.remove('open');
        burger.classList.remove('open');
      }
    });
  }

  /* ─────────────────────────────────────────
     ACTIVE NAV HIGHLIGHT
  ───────────────────────────────────────── */
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const navLinks = document.querySelectorAll('.nav-item:not(.nav-item--cta)');

  function highlightNav() {
    if (!sections.length) return;
    const mid = window.scrollY + window.innerHeight / 3;
    let current = sections[0];
    sections.forEach(sec => {
      if (mid >= sec.offsetTop) current = sec;
    });
    navLinks.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + current.id);
    });
  }

  window.addEventListener('scroll', highlightNav, { passive: true });

  if (header) {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          window.scrollTo({ top: target.offsetTop - header.offsetHeight, behavior: 'smooth' });
        }
      });
    });
  }

  /* ─────────────────────────────────────────
     HERO SLIDER  (IES-style auto-advance)
  ───────────────────────────────────────── */
  const slides  = document.querySelectorAll('.hero-slide');
  const dots    = document.querySelectorAll('.dot');
  const btnPrev = document.getElementById('slide-prev');
  const btnNext = document.getElementById('slide-next');
  const heroEl  = document.querySelector('.hero');
  let currentSlide = 0;
  let slideTimer   = null;
  const SLIDE_DURATION = 6000;

  if (slides.length && dots.length && btnPrev && btnNext && heroEl) {
    function goTo(idx) {
      slides[currentSlide].classList.remove('active');
      slides[currentSlide].classList.add('prev');
      dots[currentSlide].classList.remove('active');

      currentSlide = (idx + slides.length) % slides.length;

      slides[currentSlide].classList.add('active');
      slides[currentSlide].classList.remove('prev');
      dots[currentSlide].classList.add('active');

      setTimeout(() => {
        slides.forEach(s => s.classList.remove('prev'));
      }, 1100);
    }

    function startAutoplay() {
      clearInterval(slideTimer);
      slideTimer = setInterval(() => goTo(currentSlide + 1), SLIDE_DURATION);
    }

    btnNext.addEventListener('click', () => { goTo(currentSlide + 1); startAutoplay(); });
    btnPrev.addEventListener('click', () => { goTo(currentSlide - 1); startAutoplay(); });
    dots.forEach(dot => {
      dot.addEventListener('click', () => { goTo(+dot.dataset.dot); startAutoplay(); });
    });

    let touchStartX = 0;
    heroEl.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    heroEl.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) { goTo(dx < 0 ? currentSlide + 1 : currentSlide - 1); startAutoplay(); }
    });

    startAutoplay();
  }

  /* ─────────────────────────────────────────
     AOS — scroll reveal
  ───────────────────────────────────────── */
  const aosEls = document.querySelectorAll('[data-aos]');

  const aosObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.aosDelay || '0', 10);
        setTimeout(() => entry.target.classList.add('aos-animate'), delay);
        aosObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  aosEls.forEach(el => aosObserver.observe(el));

  /* ─────────────────────────────────────────
     COUNTERS — animate on scroll into view
  ───────────────────────────────────────── */
  const counters = document.querySelectorAll('.counter');
  const ease = t => 1 - Math.pow(1 - t, 3);

  function animCount(el, target, dur = 1800) {
    const start = performance.now();
    const tick = now => {
      const t = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(ease(t) * target);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  let countersDone = false;
  const counterObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !countersDone) {
      countersDone = true;
      counters.forEach(el => {
        animCount(el, parseInt(el.dataset.target, 10));
      });
    }
  }, { threshold: 0.3 });

  const highlightsSection = document.getElementById('highlights');
  if (highlightsSection) counterObserver.observe(highlightsSection);

  /* ─────────────────────────────────────────
     CONTACT FORM
  ───────────────────────────────────────── */
  const form      = document.getElementById('contact-form');
  const success   = document.getElementById('form-success');
  const submitBtn = document.getElementById('form-submit');

  if (form && submitBtn && success) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const dflt    = submitBtn.querySelector('.fs-default');
      const loading = submitBtn.querySelector('.fs-loading');
      submitBtn.disabled = true;
      dflt.style.display = 'none';
      loading.style.display = 'flex';

      setTimeout(() => {
        submitBtn.disabled = false;
        dflt.style.display = 'inline-flex';
        loading.style.display = 'none';
        form.reset();
        success.classList.add('show');
        setTimeout(() => success.classList.remove('show'), 8000);
      }, 2000);
    });
  }

  /* ─────────────────────────────────────────
     BACK TO TOP
  ───────────────────────────────────────── */
  const backTop = document.getElementById('back-top');

  if (backTop) {
    window.addEventListener('scroll', () => {
      backTop.classList.toggle('show', window.scrollY > 600);
    }, { passive: true });
    backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  if (window.matchMedia('(min-width: 901px)').matches) {
    const bar = document.createElement('div');
    bar.style.cssText = 'position:fixed;top:0;left:0;height:3px;background:#e2231a;z-index:9999;width:0%;transition:width .1s linear;pointer-events:none;';
    document.body.appendChild(bar);
    window.addEventListener('scroll', () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
    }, { passive: true });
  }

  const marketGrid = document.querySelector('.markets-grid');
  if (marketGrid && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const cards = marketGrid.querySelectorAll('.market-card');
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        cards.forEach(c => { c.style.flex = c === card ? '1.6' : '0.85'; });
      });
      card.addEventListener('mouseleave', () => {
        cards.forEach(c => { c.style.flex = ''; });
      });
    });
  }

  window.addEventListener('resize', highlightNav);

  /* ─────────────────────────────────────────
     ENERZECH CONTACT PAGE FORM (EmailJS)
  ───────────────────────────────────────── */
  const ENERZECHForm = document.getElementById('contactForm');

  if (ENERZECHForm) {
    const ENERZECHSubmitBtn = document.getElementById('submitBtn');
    const ENERZECHSubmitText = ENERZECHForm.querySelector('.form-submit-text');
    const ENERZECHMessageBox = document.getElementById('formMessage');

    ENERZECHForm.addEventListener('submit', function (e) {
      e.preventDefault();

      ENERZECHSubmitBtn.disabled = true;
      ENERZECHSubmitText.textContent = 'Envoi en cours...';

      const templateParams = {
        to_email: 'visca655@gmail.com',
        from_name: document.getElementById('nom').value,
        from_email: document.getElementById('email').value,
        phone: document.getElementById('telephone').value || 'Non renseigné',
        subject: document.getElementById('sujet').value,
        message: document.getElementById('message').value
      };

      emailjs.send('service_tyu9ntl', 'template_s77gb3q', templateParams)
        .then(() => {
          ENERZECHMessageBox.style.display = 'block';
          ENERZECHMessageBox.style.color = '#28a745';
          ENERZECHMessageBox.innerHTML = '✅ Votre message a été envoyé avec succès.';
          ENERZECHForm.reset();
        })
        .catch((error) => {
          console.error(error);
          ENERZECHMessageBox.style.display = 'block';
          ENERZECHMessageBox.style.color = '#dc3545';
          ENERZECHMessageBox.innerHTML = '❌ Une erreur est survenue lors de l\'envoi.';
        })
        .finally(() => {
          ENERZECHSubmitBtn.disabled = false;
          ENERZECHSubmitText.textContent = 'Envoyer le message';
        });
    });
  }

})();
