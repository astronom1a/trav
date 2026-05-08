/* ══════════════════════════════════════
   Counter — jumlah destinasi dari slide 2
══════════════════════════════════════ */
function initDestCounter() {
  const cards     = document.querySelectorAll('#destinations .dest-card');
  const totalEl   = document.querySelector('.counter .total');
  const count     = cards.length;

  // format dua digit: 3 → "03"
  totalEl.textContent = String(count).padStart(2, '0');
}

/* ══════════════════════════════════════
   Animated Side Scroll Bar
══════════════════════════════════════ */
function initScrollBar() {
  const sbFill  = document.getElementById('sbFill');
  const sbDot   = document.getElementById('sbDot');
  const sbPct   = document.getElementById('sbPct');
  const sbLabel = document.getElementById('sbLabel');
  const sbArrow = document.getElementById('sbArrow');
  const secDots = document.querySelectorAll('.scroll-bar__sec-dot');
  const sections = document.querySelectorAll('[data-section-index]');

  function update() {
    const scrollY   = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const pct       = maxScroll > 0 ? scrollY / maxScroll : 0;

    sbFill.style.height = (pct * 100) + '%';
    sbDot.style.top     = (pct * 100) + '%';
    sbPct.textContent   = Math.round(pct * 100) + '%';

    if (scrollY > 40) {
      sbPct.classList.add('visible');
      sbLabel.classList.add('hidden');
      sbArrow.classList.add('hidden');
    } else {
      sbPct.classList.remove('visible');
      sbLabel.classList.remove('hidden');
      sbArrow.classList.remove('hidden');
    }

    // active section dot
    let activeIdx = 0;
    sections.forEach((sec, i) => {
      if (sec.getBoundingClientRect().top <= window.innerHeight * 0.5) activeIdx = i;
    });
    secDots.forEach((d, i) => d.classList.toggle('active', i === activeIdx));
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ══════════════════════════════════════
   Scroll Reveal
══════════════════════════════════════ */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
}

/* ══════════════════════════════════════
   Hero Parallax + Fade on Scroll
══════════════════════════════════════ */
function initHeroParallax() {
  const heroBg      = document.querySelector('.hero__bg');
  const heroContent = document.querySelector('.hero__content');
  const heroHeight  = document.querySelector('.hero').offsetHeight;

  function onScroll() {
    const y = window.scrollY;
    if (y > heroHeight) return;

    // bg bergerak lebih lambat (40% kecepatan scroll) → efek kedalaman
    heroBg.style.transform = `translateY(${y * 0.4}px)`;

    // konten hero fade out + naik perlahan saat user scroll
    const progress = Math.min(1, y / (heroHeight * 0.6));
    heroContent.style.opacity   = 1 - progress;
    heroContent.style.transform = `translateY(${y * -0.1}px)`;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ══════════════════════════════════════
   Card Slider (auto + dot click)
══════════════════════════════════════ */
function initCardSliders() {
  document.querySelectorAll('.dest-card--slider').forEach(card => {
    const slides = card.querySelectorAll('.dest-card__slide');
    const dots   = card.querySelectorAll('.dest-card__dot');
    const total  = slides.length;
    let current  = 0;

    function goTo(idx) {
      slides[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = (idx + total) % total;
      slides[current].classList.add('active');
      dots[current].classList.add('active');
    }

    // click left half = prev, right half = next
    card.querySelector('.dest-card__slides').addEventListener('click', (e) => {
      const { left, width } = card.getBoundingClientRect();
      goTo((e.clientX - left) < width / 2 ? current - 1 : current + 1);
      resetTimer();
    });

    // dot click
    dots.forEach((dot, i) => dot.addEventListener('click', (e) => {
      e.stopPropagation();
      goTo(i);
      resetTimer();
    }));

    let timer = setInterval(() => goTo(current + 1), 4500);
    function resetTimer() {
      clearInterval(timer);
      timer = setInterval(() => goTo(current + 1), 4500);
    }
  });
}

/* ══════════════════════════════════════
   Hero Background Slideshow
══════════════════════════════════════ */
function initHeroBgSlider() {
  const slides    = document.querySelectorAll('.hero__bg-slide');
  const caption   = document.querySelector('.caption');
  const capLoc    = caption.querySelector('.caption__loc');
  const capCoords = caption.querySelector('.caption__coords');
  const total     = slides.length;
  let current     = 0;

  function updateCaption(slide) {
    caption.classList.add('caption--fade');
    setTimeout(() => {
      capLoc.textContent    = slide.dataset.loc;
      capCoords.textContent = slide.dataset.coords;
      caption.classList.remove('caption--fade');
    }, 350);
  }

  setInterval(() => {
    slides[current].classList.remove('active');
    current = (current + 1) % total;
    slides[current].classList.add('active');
    updateCaption(slides[current]);
  }, 6000);
}

/* ══════════════════════════════════════
   Boot
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initDestCounter();
  initScrollBar();
  initScrollReveal();
  initHeroParallax();
  initCardSliders();
  initHeroBgSlider();
});
