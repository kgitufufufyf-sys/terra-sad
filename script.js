const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
if (burger && nav) {
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

document.querySelectorAll('.chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach((item) => item.classList.remove('on'));
    chip.classList.add('on');
    const filter = chip.dataset.filter;
    document.querySelectorAll('#gallery a').forEach((card) => {
      card.hidden = filter !== 'all' && card.dataset.cat !== filter;
    });
  });
});

const form = document.getElementById('leadForm');
const ok = document.getElementById('formOk');
if (form && ok) {
  const saved = JSON.parse(localStorage.getItem('sihay-lead') || 'null');
  if (saved) {
    ok.hidden = false;
    ok.textContent = 'В этом браузере уже есть заявка: ' + saved.name + ', ' + saved.phone;
  }
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const lead = { name: data.get('name'), phone: data.get('phone') };
    localStorage.setItem('sihay-lead', JSON.stringify(lead));
    ok.hidden = false;
    ok.textContent = 'Заявка сохранена только в этом браузере. На сервер она не уходит.';
    form.reset();
  });
}

const motion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const frames = document.querySelectorAll('.scene, .shot');
if (motion) {
  frames.forEach((frame) => frame.classList.add('in'));
} else if (frames.length) {
  const watcher = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('in');
    });
  }, { threshold: 0.35 });
  frames.forEach((frame) => watcher.observe(frame));
}

const cookie = document.getElementById('cookie');
const cookieOk = document.getElementById('cookieOk');
if (cookie && localStorage.getItem('sihay-cookie') !== '1') cookie.hidden = false;
if (cookieOk) {
  cookieOk.addEventListener('click', () => {
    localStorage.setItem('sihay-cookie', '1');
    cookie.hidden = true;
  });
}
