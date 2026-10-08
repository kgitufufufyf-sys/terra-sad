if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (!location.hash) window.scrollTo(0, 0);
window.addEventListener('pageshow', () => {
  if (!location.hash) window.scrollTo(0, 0);
});
window.addEventListener('pagereveal', (event) => {
  if (event.viewTransition && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    event.viewTransition.skipTransition();
  }
});

const header = document.querySelector('.header');
const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 20);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const progress = document.createElement('div');
progress.className = 'scroll-progress';
progress.setAttribute('aria-hidden', 'true');
if (!CSS.supports('animation-timeline: scroll()')) {
  document.body.prepend(progress);
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  };
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
}

const menu = document.getElementById('nav');
const burger = document.getElementById('burger');
if (menu && burger) {
  const setMenu = (open) => {
    menu.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (event) => {
    if (burger.getAttribute('aria-expanded') !== 'true') return;
    if (event.key === 'Escape') {
      setMenu(false);
      burger.focus();
    }
    if (event.key === 'Tab') {
      const items = [burger, ...menu.querySelectorAll('a')];
      const index = items.indexOf(document.activeElement);
      if (event.shiftKey && index === 0) {
        event.preventDefault();
        items.at(-1).focus();
      } else if (!event.shiftKey && index === items.length - 1) {
        event.preventDefault();
        burger.focus();
      }
    }
  });
  window.matchMedia('(min-width: 781px)').addEventListener('change', (event) => {
    if (event.matches) setMenu(false);
  });
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const heroV2 = document.querySelector('.hero-v2');
if (heroV2 && !reducedMotion.matches) {
  const copy = heroV2.querySelector('.hero-copy');
  const updateHero = () => {
    const total = heroV2.offsetHeight - innerHeight;
    const passed = Math.min(1, Math.max(0, -heroV2.getBoundingClientRect().top / (total || 1)));
    copy.style.opacity = String(1 - passed * 0.55);
    copy.style.transform = `translateY(${passed * -60}px)`;
  };
  updateHero();
  window.addEventListener('scroll', updateHero, { passive: true });
  window.addEventListener('resize', updateHero, { passive: true });
}

const statement = document.querySelector('.statement');
if (statement && !reducedMotion.matches) {
  const img = statement.querySelector('img');
  const parallax = () => {
    const r = statement.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const shift = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
    img.style.transform = `translateY(${shift * -34}px)`;
  };
  parallax();
  window.addEventListener('scroll', parallax, { passive: true });
  window.addEventListener('resize', parallax, { passive: true });
}

document.querySelectorAll('.hero-giant').forEach((el) => {
  const text = el.textContent;
  el.textContent = '';
  [...text].forEach((ch, i) => {
    const s = document.createElement('span');
    s.className = 'wl';
    s.textContent = ch;
    s.style.setProperty('--i', String(i));
    el.append(s);
  });
});

if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll('.service-tile').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}

const toTop = document.createElement('button');
toTop.type = 'button';
toTop.className = 'to-top';
toTop.innerHTML = '&uarr;';
toTop.setAttribute('aria-label', 'Наверх');
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' }));
document.body.append(toTop);
const updateToTop = () => toTop.classList.toggle('on', window.scrollY > 700);
updateToTop();
window.addEventListener('scroll', updateToTop, { passive: true });

const revealItems = document.querySelectorAll('[data-reveal]');
if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    const shown = entries.filter((entry) => entry.isIntersecting);
    shown.forEach((entry, index) => {
      const target = entry.target;
      target.style.transitionDelay = `${Math.min(index * 60, 240)}ms`;
      target.classList.add('visible');
      target.addEventListener('transitionend', () => { target.style.transitionDelay = ''; }, { once: true });
      observer.unobserve(target);
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => observer.observe(item));
  document.documentElement.classList.add('reveal-ready');
  reducedMotion.addEventListener('change', (event) => {
    if (event.matches) document.documentElement.classList.remove('reveal-ready');
  });
}

const chips = document.querySelectorAll('[data-filter]');
const cards = document.querySelectorAll('.gallery-card');
if (chips.length) {
  const filterGallery = (value, updateUrl = false) => {
    const category = [...chips].some((chip) => chip.dataset.filter === value) ? value : 'all';
    chips.forEach((chip) => chip.setAttribute('aria-pressed', String(chip.dataset.filter === category)));
    cards.forEach((card) => { card.hidden = category !== 'all' && card.dataset.cat !== category; });
    document.getElementById('galleryCount').textContent = `Разделов: ${[...cards].filter((card) => !card.hidden).length}`;
    if (updateUrl) {
      const url = new URL(window.location.href);
      if (category === 'all') url.searchParams.delete('category');
      else url.searchParams.set('category', category);
      window.history.pushState(null, '', url);
    }
  };
  filterGallery(new URLSearchParams(window.location.search).get('category') || 'all');
  chips.forEach((chip) => chip.addEventListener('click', () => filterGallery(chip.dataset.filter, true)));
  window.addEventListener('popstate', () => filterGallery(new URLSearchParams(window.location.search).get('category') || 'all'));
}

const viewer = document.getElementById('galleryViewer');
if (viewer) {
  const visibleCards = () => [...cards].filter((card) => !card.hidden);
  let current = 0;
  let touchX = 0;
  const show = (index) => {
    const list = visibleCards();
    if (!list.length) return;
    current = (index + list.length) % list.length;
    const card = list[current];
    document.getElementById('viewerTitle').textContent = card.dataset.title;
    document.getElementById('viewerDescription').textContent = card.dataset.description;
    const cardImg = card.querySelector('img');
    const viewerImage = document.getElementById('viewerImage');
    viewerImage.classList.toggle('has-img', Boolean(cardImg));
    viewerImage.replaceChildren();
    if (cardImg) {
      const fresh = cardImg.cloneNode();
      fresh.style.opacity = '0';
      fresh.style.transition = 'opacity .35s ease';
      fresh.addEventListener('load', () => requestAnimationFrame(() => { fresh.style.opacity = '1'; }), { once: true });
      viewerImage.append(fresh);
    }
    viewerImage.setAttribute('aria-label', `Фото: ${card.dataset.title}`);
    document.getElementById('viewerService').href = `services.html#${card.dataset.service}`;
    document.getElementById('viewerCount').textContent = `${current + 1} из ${list.length}`;
    if (!viewer.open) viewer.showModal();
  };
  cards.forEach((card) => card.addEventListener('click', () => show(visibleCards().indexOf(card))));
  document.getElementById('viewerPrev').addEventListener('click', () => show(current - 1));
  document.getElementById('viewerNext').addEventListener('click', () => show(current + 1));
  document.getElementById('viewerClose').addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', (event) => { if (event.target === viewer) viewer.close(); });
  viewer.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') show(current - 1);
    if (event.key === 'ArrowRight') show(current + 1);
  });
  viewer.addEventListener('touchstart', (event) => { touchX = event.changedTouches[0].clientX; }, { passive: true });
  viewer.addEventListener('touchend', (event) => {
    const delta = event.changedTouches[0].clientX - touchX;
    if (Math.abs(delta) > 50) show(current + (delta < 0 ? 1 : -1));
  }, { passive: true });
}

// Remove personal data saved by the former local-only form.
try { window.localStorage.removeItem('sihay-lead'); } catch { /* Storage may be blocked. */ }

const services = {
  ozelenenie: 'Озеленение',
  blago: 'Благоустройство территории', vodoemy: 'Водоёмы', fontany: 'Фонтаны и каскады', maf: 'Малые формы',
};
const service = services[new URLSearchParams(window.location.search).get('service')];
const selection = document.getElementById('serviceSelection');
if (service && selection) {
  selection.hidden = false;
  selection.textContent = `Направление: ${service}`;
}

const LEAD_ENDPOINT = 'https://sihay-lead.kgitufufufyf.workers.dev';

const form = document.getElementById('leadForm');
if (form) {
  const status = document.getElementById('formOk');
  const submit = document.getElementById('leadSubmit');
  const phone = form.elements.phone;
  phone.addEventListener('input', () => phone.setCustomValidity(''));
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const digits = phone.value.replace(/\D/g, '');
    phone.setCustomValidity(digits.length >= 7 && digits.length <= 15 ? '' : 'Укажите телефон: от 7 до 15 цифр с кодом страны.');
    if (!form.reportValidity()) return;
    const payload = {
      name: form.elements.name.value.trim(),
      phone: phone.value.trim(),
      service: service ?? '',
      message: form.elements.message ? form.elements.message.value.trim() : '',
    };
    submit.disabled = true;
    status.hidden = true;
    try {
      const res = await fetch(LEAD_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        status.hidden = false;
        status.textContent = 'Заявка отправлена. Свяжусь с вами по указанному номеру.';
        form.reset();
      } else if (data.error === 'phone') {
        phone.setCustomValidity('Проверьте номер телефона.');
        if (!form.reportValidity()) return;
      } else {
        status.hidden = false;
        status.textContent = 'Не удалось отправить заявку. Попробуйте ещё раз чуть позже.';
      }
    } catch {
      status.hidden = false;
      status.textContent = 'Проблема с сетью. Проверьте подключение и попробуйте ещё раз.';
    } finally {
      submit.disabled = false;
    }
  });
}

const cookie = document.getElementById('cookie');
if (cookie) {
  let dismissed = false;
  try { dismissed = window.sessionStorage.getItem('sihay-cookie-notice') === '1'; } catch { /* Notice also works without storage. */ }
  cookie.hidden = dismissed;
  document.getElementById('cookieOk')?.addEventListener('click', () => {
    cookie.hidden = true;
    try { window.sessionStorage.setItem('sihay-cookie-notice', '1'); } catch { /* Dismiss for this page only. */ }
  });
}
