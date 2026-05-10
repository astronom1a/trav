/* ══════════════════════════════════════
   Counter — jumlah destinasi dari slide 2
══════════════════════════════════════ */
function initDestCounter() {
  const cards   = document.querySelectorAll('#destinations .dest-card');
  const totalEl = document.querySelector('.counter .total');
  totalEl.textContent = String(cards.length).padStart(2, '0');
}

/* ══════════════════════════════════════
   Animated Side Scroll Bar
══════════════════════════════════════ */
function initScrollBar() {
  const sbFill   = document.getElementById('sbFill');
  const sbDot    = document.getElementById('sbDot');
  const sbPct    = document.getElementById('sbPct');
  const sbLabel  = document.getElementById('sbLabel');
  const sbArrow  = document.getElementById('sbArrow');
  const secDots  = document.querySelectorAll('.scroll-bar__sec-dot');
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
    heroBg.style.transform      = `translateY(${y * 0.4}px)`;
    const progress              = Math.min(1, y / (heroHeight * 0.6));
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

    card.querySelector('.dest-card__slides').addEventListener('click', (e) => {
      const { left, width } = card.getBoundingClientRect();
      goTo((e.clientX - left) < width / 2 ? current - 1 : current + 1);
      resetTimer();
    });

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
   Hero Title — Char Spans
   Setiap huruf dibungkus .char.
   Style (data-type) diisi oleh
   canvas brightness sampler di bawah.
══════════════════════════════════════ */
function initHeroTitleChars() {
  const titleEl = document.querySelector('.hero__title');
  const subEl   = titleEl.querySelector('.sub');

  const rawText = Array.from(titleEl.childNodes)
    .filter(n => n.nodeType === Node.TEXT_NODE)
    .map(n => n.textContent)
    .join('');

  Array.from(titleEl.childNodes)
    .filter(n => n.nodeType === Node.TEXT_NODE)
    .forEach(n => n.remove());

  const frag  = document.createDocumentFragment();
  const chars = [];
  let idx = 0;
  rawText.split('').forEach(ch => {
    if (ch.trim() === '') { frag.appendChild(document.createTextNode(ch)); return; }
    const span = document.createElement('span');
    span.className  = 'char';
    span.dataset.type = 'dark'; // default sampai canvas sampling selesai
    span.style.setProperty('--char-delay', (idx * 0.045).toFixed(3) + 's');
    span.textContent = ch;
    chars.push(span);
    frag.appendChild(span);
    idx++;
  });
  titleEl.insertBefore(frag, subEl);
  return chars;
}

/* ══════════════════════════════════════
   Canvas Brightness Sampler
   Mereplikasi background-size:cover +
   background-position:center 40% pada
   .hero__bg (inset: -20% 0) di canvas,
   lalu membaca luminansi di posisi tiap
   huruf untuk menentukan data-type.
══════════════════════════════════════ */
let _samplingSeq = 0;

function readLuminance(ctx, x, y, w, h) {
  const sx = Math.round(Math.max(0, x));
  const sy = Math.round(Math.max(0, y));
  const sw = Math.max(1, Math.round(w));
  const sh = Math.max(1, Math.round(h));
  try {
    const d = ctx.getImageData(sx, sy, sw, sh).data;
    let sum = 0;
    for (let i = 0; i < d.length; i += 4)
      sum += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    return sum / (d.length / 4); // 0 – 255
  } catch { return 64; }
}

function applyCharTypes(chars, ctx) {
  chars.forEach(span => {
    const r   = span.getBoundingClientRect();
    const lum = readLuminance(ctx, r.left, r.top, r.width, r.height);
    span.dataset.type = lum > 118 ? 'light' : 'dark';
  });
}

function sampleSlide(chars, slide) {
  const mySeq = ++_samplingSeq;
  const src   = slide.style.backgroundImage.replace(/url\(["']?(.+?)["']?\)/, '$1');
  const vw    = window.innerWidth;
  const vh    = window.innerHeight;

  const img = new Image();
  img.onload = () => {
    if (mySeq !== _samplingSeq) return; // slide lain sudah aktif

    // .hero__bg: inset: -20% 0 → tinggi elemen = 1.4 × vh
    const bgH = vh * 1.4;

    // background-size: cover terhadap elemen bg
    const scale = Math.max(vw / img.naturalWidth, bgH / img.naturalHeight);
    const drawW = img.naturalWidth  * scale;
    const drawH = img.naturalHeight * scale;

    // background-position: center 40%
    //   titik 40% elemen sejajar titik 40% gambar
    const drawX = (vw  - drawW) / 2;
    const drawY = 0.4 * (bgH - drawH);

    // Elemen bg dimulai di -20% vh dari atas viewport
    const bgTop = -0.2 * vh;

    const canvas  = document.createElement('canvas');
    canvas.width  = vw;
    canvas.height = vh;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, drawX, bgTop + drawY, drawW, drawH);

    applyCharTypes(chars, ctx);
  };
  img.src = src;
}

/* ══════════════════════════════════════
   Hero Background Slideshow
══════════════════════════════════════ */
function initHeroBgSlider(chars) {
  const slides    = document.querySelectorAll('.hero__bg-slide');
  const caption   = document.querySelector('.caption');
  const capLoc    = caption.querySelector('.caption__loc');
  const capCoords = caption.querySelector('.caption__coords');
  const hero      = document.querySelector('.hero');
  const total     = slides.length;
  let current     = 0;

  function updateSlide(slide) {
    // hero--light-bg untuk elemen non-char (sub, eyebrow, nav)
    hero.classList.toggle('hero--light-bg', slide.dataset.theme === 'light');
    // per-char brightness sampling
    sampleSlide(chars, slide);
  }

  function updateCaption(slide) {
    caption.classList.add('caption--fade');
    setTimeout(() => {
      capLoc.textContent    = slide.dataset.loc;
      capCoords.textContent = slide.dataset.coords;
      caption.classList.remove('caption--fade');
    }, 350);
  }

  // Tunggu font render selesai supaya posisi huruf akurat
  document.fonts.ready.then(() => {
    requestAnimationFrame(() => updateSlide(slides[current]));
  });

  setInterval(() => {
    slides[current].classList.remove('active');
    current = (current + 1) % total;
    slides[current].classList.add('active');
    updateCaption(slides[current]);
    updateSlide(slides[current]);
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
  const chars = initHeroTitleChars();
  initHeroBgSlider(chars);
});
