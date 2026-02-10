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
  setStatus('Listo. Un gestor te contactara en breve.');
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
