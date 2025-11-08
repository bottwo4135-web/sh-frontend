// Generic helpers and backend API client wired to Render backend
(function(){
  // Intersection-based reveal for animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting){ e.target.style.visibility = 'visible'; }
    });
  }, { threshold: 0.1 });
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.fade-in, .slide-up').forEach(el => {
      el.style.visibility = 'hidden'; observer.observe(el);
    });
  });
})();

// Ensure global api holder exists
window.api = window.api || {};

// Centralized API client
window.api = (() => {
  const BASE = 'https://shs-backend-ktg8.onrender.com';
  const safeJson = async (res) => {
    try { return await res.json(); } catch { return { ok: res.ok, status: res.status }; }
  };
  const get = async (url) => {
    try {
      const res = await fetch(BASE + url, { credentials: 'include' });
      const ct = res.headers.get('content-type')||'';
      if (!res.ok) return { ok: false, status: res.status };
      if (ct.includes('application/json')) return await res.json();
      return { ok: true, data: await res.text() };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  };
  const postForm = async (url, formData) => {
    try {
      const res = await fetch(BASE + url, { method: 'POST', body: formData, credentials: 'include' });
      return await safeJson(res);
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  };
  const postJSON = async (url, body) => {
    try {
      const res = await fetch(BASE + url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), credentials: 'include' });
      return await safeJson(res);
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  };

  return {
    // auth
    login: (formData) => postForm('/login', formData),
    signup: (role, formData) => postForm(`/signup/${role}`, formData),
    logout: () => get('/logout'),
    me: () => get('/api/me'),

    // doctor
    setAvailability: (available, free_at) => {
      const fd = new FormData(); fd.append('available', String(!!available)); if (free_at) fd.append('free_at', free_at);
      return postForm('/doctor/availability', fd);
    },
    myChats: () => get('/api/my_chats'),

    // patient
    listDoctors: () => get('/api/doctors'),

    // chat
    getMessages: (chatId, after=null) => get(`/api/messages/${chatId}${after?`?after=${encodeURIComponent(after)}`:''}`),
    sendMessage: (chatId, message) => { const fd = new FormData(); fd.append('chat_id', chatId); fd.append('message', message); return postForm('/api/send', fd); },
    chatInit: (otherId) => get(`/api/chat_init/${otherId}`),

    // ai
    askAI: (message) => postForm('/api/ai', new URLSearchParams({ message }))
  };
})();

const api = window.api;

// Polyfill frontend shims if some endpoints are missing or unauthorized
(async function ensureShims(){
  try {
    const meResp = await api.me();
    if (meResp && meResp.role) return; // already a valid profile
    if (meResp && meResp.ok === false) {
      window.api.me = async () => ({ role: 'guest', name: 'Guest', avatar: '', availability: 0 });
      return;
    }
    if (!meResp || !meResp.role) {
      window.api.me = async () => ({ role: 'guest', name: 'Guest', avatar: '', availability: 0 });
    }
  } catch (e) {
    window.api.me = async () => ({ role: 'guest', name: 'Guest', avatar: '', availability: 0 });
  }
})();
