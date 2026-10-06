const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
if (burger && nav) {
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => nav.classList.remove('open'));
  });
}

document.querySelectorAll('.chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach((item) => item.classList.remove('on'));
    chip.classList.add('on');
    const filter = chip.dataset.filter;
    document.querySelectorAll('#gallery article').forEach((card) => {
      card.hidden = filter !== 'all' && card.dataset.cat !== filter;
    });
  });
});

const lightbox = document.getElementById('lightbox');
if (lightbox) {
  document.querySelectorAll('#gallery article').forEach((card) => {
    card.addEventListener('click', () => { lightbox.hidden = false; });
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        lightbox.hidden = false;
      }
    });
  });
  lightbox.addEventListener('click', () => { lightbox.hidden = true; });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') lightbox.hidden = true;
  });
}

const form = document.getElementById('leadForm');
const ok = document.getElementById('formOk');
if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    ok.style.display = 'block';
    form.reset();
  });
}

const cookie = document.getElementById('cookie');
const cookieOk = document.getElementById('cookieOk');
if (cookie && localStorage.getItem('terra-cookie') !== '1') cookie.hidden = false;
if (cookieOk) {
  cookieOk.addEventListener('click', () => {
    localStorage.setItem('terra-cookie', '1');
    cookie.hidden = true;
  });
}
