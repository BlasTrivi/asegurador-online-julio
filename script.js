const form = document.querySelector('#form');
const statusEl = document.querySelector('#status');
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');
const topbar = document.querySelector('.topbar');
let isSubmitting = false;

requestAnimationFrame(() => {
  document.body.classList.add('page-ready');
});

function syncTopbarState() {
  if (!topbar) return;
  topbar.classList.toggle('is-scrolled', window.scrollY > 16);
}

syncTopbarState();
window.addEventListener('scroll', syncTopbarState, { passive: true });

function setStatus(message, type = 'ok') {
  statusEl.textContent = message;
  statusEl.style.color = type === 'ok' ? 'var(--accent)' : '#f48c8c';
}

function validatePhone(phone) {
  return phone.replace(/\D/g, '').length >= 8;
}

function saveLead(data) {
  const existing = JSON.parse(localStorage.getItem('leads') || '[]');
  existing.push({ ...data, createdAt: new Date().toISOString() });
  localStorage.setItem('leads', JSON.stringify(existing));
}

function buildWhatsappMessage(data) {
  return [
    'Nueva consulta desde TeCubroya',
    '',
    `Nombre: ${data.nombre}`,
    `Telefono: ${data.telefono}`,
    `Tipo de seguro: ${data.tipo}`,
    `Detalle: ${data.mensaje}`,
  ].join('\n');
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  if (isSubmitting) {
    return;
  }

  isSubmitting = true;
  setStatus('');

  const formData = new FormData(form);
  const payload = {
    nombre: formData.get('nombre')?.trim(),
    telefono: formData.get('telefono')?.trim(),
    tipo: formData.get('tipo'),
    mensaje: formData.get('mensaje')?.trim(),
    consent: formData.get('consent') === 'on',
  };

  if (!payload.nombre || !payload.telefono || !payload.tipo || !payload.mensaje) {
    setStatus('Completa todos los campos para continuar.', 'error');
    isSubmitting = false;
    return;
  }

  if (!validatePhone(payload.telefono)) {
    setStatus('Ingresa un telefono valido.', 'error');
    isSubmitting = false;
    return;
  }

  if (!payload.consent) {
    setStatus('Debes aceptar el consentimiento para continuar.', 'error');
    isSubmitting = false;
    return;
  }

  saveLead(payload);
  const whatsappNumber = '3415764047';
  const message = buildWhatsappMessage(payload);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  setStatus('Listo. TeCubroya te redirige a WhatsApp con tu consulta lista.');
  form.reset();
  window.location.assign(whatsappUrl);
});

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const revealEls = document.querySelectorAll('.reveal');

if (revealEls.length) {
  revealEls.forEach((el, index) => {
    const delay = Math.min((index % 6) * 90, 450);
    el.style.setProperty('--reveal-delay', `${delay}ms`);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealEls.forEach((el) => observer.observe(el));
}

const gallery = document.querySelector('[data-gallery]');

if (gallery) {
  const slides = Array.from(gallery.querySelectorAll('.gallery__slide'));
  const prevBtn = gallery.querySelector('.gallery__control--prev');
  const nextBtn = gallery.querySelector('.gallery__control--next');
  let currentIndex = 0;
  let autoplayId;

  function bumpControl(control) {
    if (!control) return;
    control.classList.remove('is-bump');
    requestAnimationFrame(() => control.classList.add('is-bump'));
  }

  function renderGallery(index) {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === currentIndex);
    });
  }

  function startAutoplay() {
    clearInterval(autoplayId);
    autoplayId = setInterval(() => {
      renderGallery(currentIndex + 1);
    }, 4000);
  }

  function stopAutoplay() {
    clearInterval(autoplayId);
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      bumpControl(prevBtn);
      renderGallery(currentIndex - 1);
      startAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      bumpControl(nextBtn);
      renderGallery(currentIndex + 1);
      startAutoplay();
    });
  }

  gallery.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      bumpControl(prevBtn);
      renderGallery(currentIndex - 1);
      startAutoplay();
    }

    if (event.key === 'ArrowRight') {
      bumpControl(nextBtn);
      renderGallery(currentIndex + 1);
      startAutoplay();
    }
  });

  gallery.addEventListener('mouseenter', stopAutoplay);
  gallery.addEventListener('mouseleave', startAutoplay);
  gallery.addEventListener('focusin', stopAutoplay);
  gallery.addEventListener('focusout', startAutoplay);
  gallery.addEventListener('touchstart', stopAutoplay, { passive: true });
  gallery.addEventListener('touchend', startAutoplay, { passive: true });

  renderGallery(0);
  startAutoplay();
}
