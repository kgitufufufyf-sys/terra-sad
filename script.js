if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (!location.hash) window.scrollTo(0, 0);
window.addEventListener('pageshow', () => {
  if (!location.hash) window.scrollTo(0, 0);
});

const hero = document.getElementById('hero');
const heroFrame = document.querySelector('.hero-frame');
if (hero && heroFrame && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const updateHero = () => {
    const progress = Math.min(Math.max(window.scrollY / (hero.offsetHeight * .72), 0), 1);
    const fullWidth = hero.clientWidth / heroFrame.offsetWidth;
    const fullHeight = hero.clientHeight / heroFrame.offsetHeight;
    const scale = 1 + progress * (Math.max(fullWidth, fullHeight) * 1.08 - 1);
    heroFrame.style.transform = `translate(-50%, -50%) scale(${scale})`;
    heroFrame.style.borderRadius = `${18 * (1 - progress)}px`;
    document.querySelector('.hero-photo').style.opacity = String(1 - progress * .75);
    document.querySelector('.hero-copy').style.opacity = String(1 - progress * 1.15);
  };
  updateHero();
  window.addEventListener('scroll', updateHero, { passive: true });
  window.addEventListener('resize', updateHero);
}

const header = document.querySelector('.header');
const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 20);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

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
const revealItems = document.querySelectorAll('[data-reveal]');
if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
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
  cards.forEach((card) => card.addEventListener('click', () => {
    document.getElementById('viewerTitle').textContent = card.dataset.title;
    document.getElementById('viewerDescription').textContent = card.dataset.description;
    document.getElementById('viewerImage').setAttribute('aria-label', `Место для фото: ${card.dataset.title}`);
    document.getElementById('viewerService').href = `services.html#${card.dataset.service}`;
    viewer.showModal();
  }));
  document.getElementById('viewerClose').addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', (event) => { if (event.target === viewer) viewer.close(); });
}

// Remove personal data saved by the former local-only form.
try { window.localStorage.removeItem('sihay-lead'); } catch { /* Storage may be blocked. */ }

const services = {
  proekt: 'Дизайн-проект', moshenie: 'Мощение', ozelenenie: 'Озеленение',
  gazon: 'Газон и полив', drenazh: 'Дренаж и ливнёвка', svet: 'Освещение',
};
const service = services[new URLSearchParams(window.location.search).get('service')];
const selection = document.getElementById('serviceSelection');
if (service && selection) {
  selection.hidden = false;
  selection.textContent = `Направление: ${service}`;
}

const form = document.getElementById('leadForm');
if (form) {
  const status = document.getElementById('formOk');
  const phone = form.elements.phone;
  phone.addEventListener('input', () => phone.setCustomValidity(''));
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const digits = phone.value.replace(/\D/g, '');
    phone.setCustomValidity(digits.length >= 7 && digits.length <= 15 ? '' : 'Укажите телефон: от 7 до 15 цифр с кодом страны.');
    if (!form.reportValidity()) return;
    const name = form.elements.name.value.trim();
    const text = `Обращение sihay\n${service ? `Направление: ${service}\n` : ''}${name ? `Имя: ${name}\n` : ''}Телефон: ${phone.value.trim()}\n\nЭтот файл не отправлен получателю.\n`;
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sihay-obraschenie.txt';
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.hidden = false;
    status.textContent = 'Файл подготовлен для скачивания. Данные не отправлены. После сохранения можно очистить поля.';
  });
  form.addEventListener('reset', () => {
    phone.setCustomValidity('');
    status.hidden = false;
    status.textContent = 'Поля очищены. Скачанный файл удаляется отдельно на вашем устройстве.';
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
