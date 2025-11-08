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

// Centralized API client
const api = (() => {
  const BASE = 'https://shs-backend-ktg8.onrender.com';
  const get = async (url) => {
    const res = await fetch(BASE + url, { credentials: 'include' });
    const ct = res.headers.get('content-type')||'';
    if (ct.includes('application/json')) return res.json();
    return res.text();
  };
  const postForm = async (url, formData) => {
    const res = await fetch(BASE + url, { method: 'POST', body: formData, credentials: 'include' });
    try { return await res.json(); } catch { return { ok: res.ok }; }
  };
  const postJSON = async (url, body) => {
    const res = await fetch(BASE + url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), credentials: 'include' });
    try { return await res.json(); } catch { return { ok: res.ok }; }
  };

  return {
    // auth
    login: (formData) => postForm('/login', formData),
    signup: (role, formData) => postForm(`/signup/${role}`, formData),
    logout: () => get('/logout'),
    me: () => get('/api/me'), // requires a backend endpoint; will be shimmed if missing

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

// Polyfill frontend shims if some endpoints are missing
(async function ensureShims(){
  try {
    const me = await api.me();
    if (me && me.role) return; // ok
    window.api.me = async () => ({ role: 'patient', name: 'Guest', avatar: '', availability: 0 });
  } catch {
    window.api.me = async () => ({ role: 'patient', name: 'Guest', avatar: '', availability: 0 });
  }
})();
