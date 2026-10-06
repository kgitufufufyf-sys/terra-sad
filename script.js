const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
burger.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  burger.setAttribute('aria-expanded', open ? 'true' : 'false');
});
nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => nav.classList.remove('open'));
});

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
document.querySelectorAll('#gallery article').forEach((card) => {
  card.addEventListener('click', () => { lightbox.hidden = false; });
});
lightbox.addEventListener('click', () => { lightbox.hidden = true; });
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') lightbox.hidden = true;
});

const form = document.getElementById('leadForm');
const ok = document.getElementById('formOk');
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const text = `Заявка TERRA\n${data.get('name')}\n${data.get('phone')}\n${data.get('msg') || '—'}`;
  try { await navigator.clipboard.writeText(text); } catch (_) {}
  ok.style.display = 'block';
  form.reset();
});
