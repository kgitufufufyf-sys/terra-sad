const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
burger.addEventListener('click', () => nav.classList.toggle('open'));
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

// filter
const chips = document.querySelectorAll('.chip');
const figs = document.querySelectorAll('#gallery figure');
chips.forEach(c => c.addEventListener('click', () => {
  chips.forEach(x => x.classList.remove('active'));
  c.classList.add('active');
  const f = c.dataset.filter;
  figs.forEach(fig => {
    fig.style.display = (f === 'all' || fig.dataset.cat === f) ? '' : 'none';
  });
}));

// lightbox
const lb = document.getElementById('lightbox');
const lbImg = lb.querySelector('img');
document.querySelectorAll('#gallery img').forEach(img => {
  img.addEventListener('click', () => {
    lbImg.src = img.src.replace('w=800','w=1400');
    lb.classList.add('open');
  });
});
lb.addEventListener('click', () => lb.classList.remove('open'));
document.addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('open'); });

// fake form -> copy to clipboard
const form = document.getElementById('leadForm');
const ok = document.getElementById('formOk');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const d = new FormData(form);
  const text = `Заявка с сайта TERRA: ${d.get('name')} / ${d.get('phone')} / ${d.get('msg')||'-'}`;
  try { await navigator.clipboard.writeText(text); } catch {}
  ok.style.display = 'block';
  form.reset();
  setTimeout(()=> ok.style.display='none', 5000);
});
