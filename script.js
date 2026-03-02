const form = document.querySelector('#form');
const statusEl = document.querySelector('#status');
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');

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
    'Nueva consulta desde TeCubro',
    '',
    `Nombre: ${data.nombre}`,
    `Telefono: ${data.telefono}`,
    `Tipo de seguro: ${data.tipo}`,
    `Detalle: ${data.mensaje}`,
  ].join('\n');
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
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
    return;
  }

  if (!validatePhone(payload.telefono)) {
    setStatus('Ingresa un telefono valido.', 'error');
    return;
  }

  if (!payload.consent) {
    setStatus('Debes aceptar el consentimiento de contacto.', 'error');
    return;
  }

  saveLead(payload);
  const whatsappNumber = '3415690322';
  const message = buildWhatsappMessage(payload);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  const popup = window.open(whatsappUrl, '_blank', 'noopener');
  if (!popup) {
    window.location.href = whatsappUrl;
  }
  setStatus('Listo. Abrimos WhatsApp con tu consulta para enviar.');
  form.reset();
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
      renderGallery(currentIndex - 1);
      startAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      renderGallery(currentIndex + 1);
      startAutoplay();
    });
  }

  gallery.addEventListener('mouseenter', stopAutoplay);
  gallery.addEventListener('mouseleave', startAutoplay);
  gallery.addEventListener('touchstart', stopAutoplay, { passive: true });
  gallery.addEventListener('touchend', startAutoplay, { passive: true });

  renderGallery(0);
  startAutoplay();
}
