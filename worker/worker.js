// Worker: принимает заявку с сайта, отправляет в Telegram.
// Секреты задаются через `wrangler secret put` (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID).

const MAX_FIELDS = { name: 80, phone: 30, service: 40, message: 1000 };
const ALLOWED_ORIGINS = [
  'https://kgitufufufyf-sys.github.io',
  'http://localhost:8000',
  'http://127.0.0.1:8000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
];

function cors(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') ?? '';
    if (request.method === 'OPTIONS') {
      if (!ALLOWED_ORIGINS.includes(origin)) return new Response(null, { status: 204 });
      return new Response(null, { status: 204, headers: cors(origin) });
    }
    if (request.method !== 'POST') {
      return Response.json({ ok: false, error: 'method' }, { status: 405 });
    }
    if (!ALLOWED_ORIGINS.includes(origin)) {
      return Response.json({ ok: false, error: 'origin' }, { status: 403 });
    }
    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
      return Response.json({ ok: false, error: 'config' }, { status: 500, headers: cors(origin) });
    }

    let data;
    try {
      data = await request.json();
    } catch {
      return Response.json({ ok: false, error: 'json' }, { status: 400, headers: cors(origin) });
    }

    const name = String(data.name ?? '').trim().slice(0, MAX_FIELDS.name);
    const phoneRaw = String(data.phone ?? '').trim().slice(0, MAX_FIELDS.phone);
    const service = String(data.service ?? '').trim().slice(0, MAX_FIELDS.service);
    const message = String(data.message ?? '').trim().slice(0, MAX_FIELDS.message);
    const digits = phoneRaw.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15 || !/^[+()\d\s-]+$/.test(phoneRaw)) {
      return Response.json({ ok: false, error: 'phone' }, { status: 422, headers: cors(origin) });
    }
    if (!name) {
      return Response.json({ ok: false, error: 'name' }, { status: 422, headers: cors(origin) });
    }

    const ua = request.headers.get('User-Agent') ?? '';
    const lines = [
      'Новая заявка с сайта sihay',
      name ? `Имя: ${name}` : null,
      `Телефон: ${phoneRaw}`,
      service ? `Направление: ${service}` : null,
      message ? `Сообщение: ${message}` : null,
      `Страница: ${origin}`,
    ].filter(Boolean);
    const text = lines.join('\n');

    const tg = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text,
      }),
    });
    if (!tg.ok) {
      return Response.json({ ok: false, error: 'telegram' }, { status: 502, headers: cors(origin) });
    }
    return Response.json({ ok: true }, { headers: cors(origin) });
  },
};
