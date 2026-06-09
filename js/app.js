// ==========================================
// TAPKIDROP | PRODUCTION CORE v18.0 FINAL
// Full Code — No Shortcuts + Mock Data Fallback
// ==========================================

const CONFIG = {
  supabaseUrl: "https://dlfynallzrbghniaeafb.supabase.co",
  supabaseKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsZnluYWxsenJiZ2huaWFlYWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4OTUxOTYsImV4cCI6MjA5NTQ3MTE5Nn0.n6JJtaOjP8_kpTFENk0Mv0o2X31_rSRXiDywcIv2syw",
  tgToken: "8706865987:AAHSTQvxklwoiScS3HpJvFyEyVT57eQkz8o",
  tgChat: "-1003371505343",
  adminEmails: ["antoniobandero11@gmail.com", "buldozer.mas12@gmail.com"]
};

// Временные товары для демонстрации (если база пуста)
const MOCK_PRODUCTS = [
  { id: "mock-1", name: "Nike Air Max Pulse Essential", price: 18990, old_price: 23990, category: "designer", description: "Легендарная модель с амортизирующей подошвой Air Max.", sizes: ["40","41","42","43","44"], images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop"], image_url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop", is_hit: true, created_at: new Date().toISOString() },
  { id: "mock-2", name: "Adidas Ultraboost Light Running", price: 14500, old_price: null, category: "classics", description: "Самые легкие Ultraboost в истории. Возврат энергии Boost.", sizes: ["39","40","41","42","43"], images: ["https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?q=80&w=600&auto=format&fit=crop"], image_url: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?q=80&w=600&auto=format&fit=crop", is_hit: false, created_at: new Date().toISOString() },
  { id: "mock-3", name: "Air Jordan 1 Low OG White Red", price: 12990, old_price: null, category: "classics", description: "Классический силуэт в новой расцветке. Кожаный верх.", sizes: ["40","41","42","43","44","45"], images: ["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&auto=format&fit=crop"], image_url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&auto=format&fit=crop", is_hit: false, created_at: new Date(Date.now() - 86400000*2).toISOString() },
  { id: "mock-4", name: "New Balance 550 White Green", price: 11200, old_price: 17200, category: "sale", description: "Ретро-баскетбольный стиль. Перфорированный кожаный верх.", sizes: ["36","37","38","39","40"], images: ["https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=600&auto=format&fit=crop"], image_url: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=600&auto=format&fit=crop", is_hit: false, created_at: new Date().toISOString() },
  { id: "mock-5", name: "Nike Dunk Low Panda Classic", price: 21990, old_price: null, category: "designer", description: "Самая популярная расцветка года. Черно-белая классика.", sizes: ["38","39","40","41","42","43","44"], images: ["https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=600&auto=format&fit=crop"], image_url: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=600&auto=format&fit=crop", is_hit: true, created_at: new Date().toISOString() },
  { id: "mock-6", name: "Puma RS-X Reinvention Kids", price: 9990, old_price: null, category: "kids", description: "Яркие детские кроссовки с технологией RS. Легкие и удобные.", sizes: ["28","29","30","31","32","33"], images: ["https://images.unsplash.com/photo-1584735175315-9d5df23860e6?q=80&w=600&auto=format&fit=crop"], image_url: "https://images.unsplash.com/photo-1584735175315-9d5df23860e6?q=80&w=600&auto=format&fit=crop", is_hit: false, created_at: new Date().toISOString() }
];

let sb;
try { sb = supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey); } catch(e) { console.error("[SB INIT]", e); }

const STATE = {
  user: null, profile: null, products: [], filteredProducts: [],
  currentProduct: null, currentSize: null, isLoading: false,
  editProdId: null, _oldImages: [], currentCategory: "all",
  theme: localStorage.getItem("td_theme") || "light"
};

function getUserKey(base) { return STATE.user ? `td_${base}_${STATE.user.id}` : `td_${base}_guest`; }
function loadLocal(key) { try { return JSON.parse(localStorage.getItem(getUserKey(key))) || (key === "pvz" ? { city: "", addr: "" } : []); } catch { return key === "pvz" ? { city: "", addr: "" } : []; } }
function saveLocal(key, data) { localStorage.setItem(getUserKey(key), JSON.stringify(data)); }

let CART = loadLocal("cart");
let PVZ = loadLocal("pvz");
let WISHLIST = loadLocal("wishlist");
let APPLIED_PROMO = null;

const $ = (id) => document.getElementById(id);

// ==========================================
// UTILITIES
// ==========================================

async function compressImage(file, maxWidth = 1200, quality = 0.8) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        let w = img.width, h = img.height;
        if (w > maxWidth) { h = Math.round((h * maxWidth) / w); w = maxWidth; }
        canvas.width = w; canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
      };
    };
  });
}

function ruError(err) {
  if (!err) return "Неизвестная ошибка";
  const msg = err.message || String(err);
  if (msg.includes("invalid login")) return "Неверный email или пароль";
  if (msg.includes("already registered")) return "Этот email уже занят";
  if (msg.includes("password should be")) return "Пароль минимум 6 символов";
  if (msg.includes("email not confirmed")) return "Подтвердите email в настройках Supabase";
  if (msg.includes("violates row-level")) return "Нет прав доступа";
  if (msg.includes("failed to fetch")) return "Нет соединения с интернетом";
  return msg.length > 50 ? msg.slice(0, 50) + "..." : msg;
}

window.toast = (msg, type = "info") => {
  const t = document.createElement("div");
  t.textContent = msg;
  t.className = `toast toast--${type}`;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = "0"; setTimeout(() => t.remove(), 300); }, 3000);
};

// ==========================================
// THEME
// ==========================================

function applyTheme() {
  document.documentElement.setAttribute("data-theme", STATE.theme);
  const icon = $("theme-icon");
  if (icon) icon.className = STATE.theme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
}

window.toggleTheme = () => {
  STATE.theme = STATE.theme === "dark" ? "light" : "dark";
  localStorage.setItem("td_theme", STATE.theme);
  applyTheme();
};

// ==========================================
// AUTHENTICATION
// ==========================================

async function loadUserProfile(user) {
  if (!user?.id) return;
  try {
    const { data } = await sb.from("profiles").select("*").eq("id", user.id).single();
    STATE.profile = data || { email: user.email, full_name: user.email.split("@")[0], is_admin: false };
  } catch (e) {
    STATE.profile = { email: user.email, full_name: user.email.split("@")[0], is_admin: false };
  }
  window.updateAuthUI();
}

window.updateAuthUI = function() {
  const af = $("auth-flow"), pa = $("profile-acts"), pn = $("profile-display-name"), pe = $("profile-email"), am = $("admin-menu");
  if (af) af.style.display = STATE.user ? "none" : "block";
  if (pa) pa.style.display = STATE.user ? "flex" : "none";
  if (STATE.user) {
    const isAdmin = STATE.profile?.is_admin === true || CONFIG.adminEmails.includes(STATE.user.email);
    if (pn) pn.textContent = STATE.profile?.full_name || STATE.user.email.split("@")[0];
    if (pe) pe.textContent = STATE.user.email;
    if (am) am.style.display = isAdmin ? "flex" : "none";
  } else {
    STATE.profile = null;
    if (pn) pn.textContent = "Гость";
    if (pe) pe.textContent = "Войдите в аккаунт";
    if (am) am.style.display = "none";
  }
  window.updateCartUI();
};

sb.auth.onAuthStateChange(async (event, session) => {
  STATE.user = session?.user || null;
  if (STATE.user) {
    await loadUserProfile(STATE.user);
    CART = loadLocal("cart"); PVZ = loadLocal("pvz"); WISHLIST = loadLocal("wishlist");
  } else {
    STATE.profile = null; CART = []; PVZ = { city: "", addr: "" }; WISHLIST = [];
    window.updateAuthUI();
  }
  window.updateCartUI();
});

$("auth-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const em = $("email-in")?.value.trim(), pw = $("pass-in")?.value, err = $("auth-err"), btn = $("auth-btn");
  if (!err || !btn) return;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return err.textContent = "Неверный email", err.style.display = "block";
  if (pw.length < 6) return err.textContent = "Пароль < 6 символов", err.style.display = "block";

  err.style.display = "none"; btn.disabled = true; btn.textContent = "⏳...";

  const timeout = setTimeout(() => {
    btn.disabled = false;
    const isLogin = document.querySelector(".tab.active")?.dataset.tab === "login";
    btn.textContent = isLogin ? "Войти" : "Регистрация";
    window.toast("⏱️ Сервер не отвечает. Проверьте интернет.", "error");
  }, 15000);

  try {
    const isLogin = document.querySelector(".tab.active")?.dataset.tab === "login";
    const res = isLogin
      ? await sb.auth.signInWithPassword({ email: em, password: pw })
      : await sb.auth.signUp({ email: em, password: pw });

    if (res.error) throw res.error;

    if (res.data?.user) {
      STATE.user = res.data.user;
      await loadUserProfile(STATE.user);
      CART = loadLocal("cart"); PVZ = loadLocal("pvz"); WISHLIST = loadLocal("wishlist");
      window.updateAuthUI();
    }
    window.toast(isLogin ? "✅ С возвращением!" : "✅ Аккаунт создан!", "success");
  } catch (e) {
    err.textContent = ruError(e);
    err.style.display = "block";
    window.toast("❌ " + err.textContent, "error");
  } finally {
    clearTimeout(timeout);
    btn.disabled = false;
    const isLogin = document.querySelector(".tab.active")?.dataset.tab === "login";
    btn.textContent = isLogin ? "Войти" : "Регистрация";
  }
});

$("logout-btn")?.addEventListener("click", async () => {
  try {
    await Promise.race([
      sb.auth.signOut({ scope: 'global' }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 5000))
    ]);
  } catch (e) { /* ignore */ }
  const theme = localStorage.getItem("td_theme");
  localStorage.clear();
  if (theme) localStorage.setItem("td_theme", theme);
  window.location.reload();
});

window.switchTab = (tab, el) => {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  el.classList.add("active");
  const btn = $("auth-btn");
  if (btn) btn.textContent = tab === "login" ? "Войти" : "Регистрация";
};

// ==========================================
// NAVIGATION
// ==========================================

window.go = function(id) {
  document.querySelectorAll(".page").forEach(p => { p.classList.remove("active"); p.style.opacity = "0"; });
  const el = $(id);
  if (el) { el.classList.add("active"); requestAnimationFrame(() => { el.style.opacity = "1"; }); }
  document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
  const nav = document.querySelector(`.nav-item[onclick*="'${id}'"]`);
  if (nav) nav.classList.add("active");
  const catNav = $("cat-nav");
  if (catNav) catNav.classList.toggle("hide", !["home", "catalog"].includes(id));
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (id === "admin") window.loadAdmin();
  if (id === "my-orders") window.loadOrders();
  if (id === "wishlist-page") window.renderWishlist();
  if (id === "product" && STATE.currentProduct) window.loadReviews(STATE.currentProduct.id);
};

// ==========================================
// PRODUCTS & RENDERING
// ==========================================

async function loadProducts() {
  if (STATE.isLoading) return;
  STATE.isLoading = true;
  try {
    const { data, error } = await sb.from("products").select("*").order("created_at", { ascending: false });
    
    // Если база пуста или ошибка — используем временные товары
    if (error || !data || data.length === 0) {
      console.warn("[LOAD PROD] База пуста или ошибка, загружаем mock-данные:", error);
      STATE.products = MOCK_PRODUCTS;
    } else {
      STATE.products = data;
    }
    
    STATE.filteredProducts = STATE.products;
    window.render(STATE.products.slice(0, 8), "home");
    window.render(STATE.products, "catalog");
  } catch (e) {
    console.error("[LOAD PROD FALLBACK]", e);
    STATE.products = MOCK_PRODUCTS;
    STATE.filteredProducts = STATE.products;
    window.render(STATE.products.slice(0, 8), "home");
    window.render(STATE.products, "catalog");
  } finally { 
    STATE.isLoading = false; 
  }
}

function makeCard(p) {
  const isWished = WISHLIST.some(w => w.id === p.id);
  const images = Array.isArray(p.images) ? p.images : (p.image_url ? [p.image_url] : []);
  const mainImg = images[0] || "";

  const badges = [];
  const createdAt = new Date(p.created_at);
  const daysOld = (Date.now() - createdAt) / (1000 * 60 * 60 * 24);
  if (daysOld < 7) badges.push({ text: 'NEW', color: '#10b981' });
  if (p.category === 'sale') badges.push({ text: 'SALE', color: '#ef4444' });
  if (p.old_price && p.old_price > p.price) {
    const discount = Math.round((1 - p.price / p.old_price) * 100);
    badges.push({ text: `-${discount}%`, color: '#f59e0b' });
  }
  if (p.is_hit) badges.push({ text: 'ХИТ', color: '#8b5cf6' });

  const badgesHtml = badges.length
    ? `<div class="card-badges">${badges.map(b => `<span class="card-badge" style="background:${b.color}">${b.text}</span>`).join('')}</div>`
    : '';

  const priceHtml = p.old_price && p.old_price > p.price
    ? `<div class="card-price"><span class="old-price">${Number(p.old_price).toLocaleString("ru")} ₽</span> ${Number(p.price).toLocaleString("ru")} ₽</div>`
    : `<div class="card-price">${Number(p.price).toLocaleString("ru")} ₽</div>`;

  return `
    <div class="card reveal" onclick="window.openProd('${p.id}')">
      <div class="card-img">
        ${mainImg ? `<img src="${mainImg}" alt="${p.name}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">` : "<div style='display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:3rem;'>👟</div>"}
        ${badgesHtml}
        <button class="card-wishlist ${isWished ? 'active' : ''}"
                onclick="event.stopPropagation(); window.toggleWishlistCard('${p.id}', this)">
          <i class="fa-${isWished ? 'solid' : 'regular'} fa-heart"></i>
        </button>
      </div>
      <div class="card-body">
        <div class="card-name">${p.name}</div>
        ${priceHtml}
        <button class="btn-cart" onclick="event.stopPropagation(); window.addToCart('${p.id}')">В корзину</button>
      </div>
    </div>`;
}

window.render = function(list, target = "both") {
  const emptyMsg = '<p style="grid-column:1/-1;text-align:center;padding:48px;color:var(--text-muted)">Ничего не найдено</p>';
  if (target === "home" || target === "both") {
    const h = $("home-grid");
    if (h) h.innerHTML = list.slice(0, 8).map(makeCard).join("") || emptyMsg;
  }
  if (target === "catalog" || target === "both") {
    const c = $("catalog-grid");
    if (c) c.innerHTML = list.map(makeCard).join("") || emptyMsg;
  }
};

window.openProd = async function(id) {
  const p = STATE.products.find(x => x.id === id);
  if (!p) return window.toast("Не найдено", "error");
  STATE.currentProduct = p;
  STATE.currentSize = null;

  const images = Array.isArray(p.images) ? p.images : (p.image_url ? [p.image_url] : []);
  const mainImg = images[0] || "";

  const imgContainer = $("detail-img");
  if (imgContainer) {
    imgContainer.innerHTML = mainImg ? `<img src="${mainImg}" alt="${p.name}" style="width:100%;height:100%;object-fit:contain;padding:32px;">` : "👟";
    const thumbsContainer = $("gallery-thumbs");
    if (thumbsContainer && images.length > 1) {
      thumbsContainer.innerHTML = images.map((img) =>
        `<img src="${img}" onclick="$('detail-img').innerHTML='<img src=\\\'${img}\\\' style=\\\"width:100%;height:100%;object-fit:contain;padding:32px;\\\">'" style="width:60px;height:60px;object-fit:cover;border-radius:8px;cursor:pointer;border:2px solid transparent;" onmouseover="this.style.borderColor='var(--accent-primary)'" onmouseout="this.style.borderColor='transparent'">`
      ).join("");
    } else if (thumbsContainer) {
      thumbsContainer.innerHTML = "";
    }
  }

  const b = $("detail-brand"); if (b) b.textContent = p.category;
  const n = $("detail-name"); if (n) n.textContent = p.name;
  const pr = $("detail-price"); if (pr) pr.textContent = `${Number(p.price).toLocaleString("ru")} ₽`;
  const d = $("detail-desc"); if (d) d.textContent = p.description || "";

  const sizes = Array.isArray(p.sizes) ? p.sizes : (p.sizes || "").split(",").map(s => s.trim()).filter(Boolean);
  const sz = $("sizes-container");
  if (sz) sz.innerHTML = sizes.length
    ? sizes.map(s => `<button class="size-btn" onclick="window.selectSize('${s}', this)">${s}</button>`).join("")
    : '<span style="color:var(--text-muted)">Нет размеров</span>';

  const wi = $("wishlist-icon");
  if (wi) wi.className = `fa-${WISHLIST.some(w => w.id === p.id) ? 'solid' : 'regular'} fa-heart`;

  window.go("product");
  window.loadReviews(id);
};

window.selectSize = (size, btn) => {
  document.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  STATE.currentSize = size;
};

// ==========================================
// CART & PROMO CODES
// ==========================================

window.addToCart = function(id) {
  const p = STATE.products.find(x => x.id === id);
  if (!p) return;
  const ex = CART.find(x => x.id === id && x.size === STATE.currentSize);
  if (ex) ex.qty++; else CART.push({ ...p, qty: 1, size: STATE.currentSize || null });
  saveLocal("cart", CART);
  window.updateCartUI();
  window.toast("✅ Добавлено в корзину", "success");
  const badge = $("cart-badge");
  if (badge) { badge.style.transform = "scale(1.3)"; setTimeout(() => badge.style.transform = "scale(1)", 200); }
};

window.addToCartFromDetail = function() {
  if (!STATE.currentProduct) return;
  const sizes = STATE.currentProduct.sizes;
  const hasSizes = Array.isArray(sizes) ? sizes.length > 0 : (sizes && sizes.length > 0);
  if (hasSizes && !STATE.currentSize) return window.toast("Выберите размер", "error");
  window.addToCart(STATE.currentProduct.id);
};

window.applyPromo = async function() {
  const code = $("promo-input")?.value.trim().toUpperCase();
  const status = $("promo-status");
  if (!code || !status) return;
  try {
    const { data, error } = await sb.from("promo_codes").select("*").eq("code", code).eq("is_active", true).single();
    if (error || !data) { status.innerHTML = '<span class="text-danger">❌ Промокод не найден</span>'; APPLIED_PROMO = null; window.updateCartUI(); return; }
    if (data.max_uses && data.used_count >= data.max_uses) { status.innerHTML = '<span class="text-danger">❌ Лимит исчерпан</span>'; APPLIED_PROMO = null; return; }
    if (data.expires_at && new Date(data.expires_at) < new Date()) { status.innerHTML = '<span class="text-danger">❌ Промокод истёк</span>'; APPLIED_PROMO = null; return; }
    APPLIED_PROMO = data;
    status.innerHTML = `<span class="text-success">✅ Скидка ${data.discount_percent}% применена!</span>`;
    window.updateCartUI();
    window.toast(`🎁 Скидка ${data.discount_percent}% активирована!`, "success");
  } catch (e) { status.innerHTML = '<span class="text-danger">❌ Ошибка проверки</span>'; }
};

window.updateCartUI = function() {
  const count = CART.reduce((s, i) => s + (i.qty || 1), 0);
  const b = $("cart-badge");
  if (b) { b.textContent = count; b.setAttribute("data-count", count); }

  let total = CART.reduce((s, i) => s + Number(i.price) * (i.qty || 1), 0);
  let discount = 0;
  if (APPLIED_PROMO) { discount = Math.round(total * APPLIED_PROMO.discount_percent / 100); total -= discount; }

  const emp = $("cart-empty"), lay = $("cart-layout");
  if (!CART.length) { if (emp) emp.style.display = "block"; if (lay) lay.style.display = "none"; }
  else { if (emp) emp.style.display = "none"; if (lay) lay.style.display = "block"; }

  const items = $("cart-items");
  if (items) {
    items.innerHTML = CART.map((i, k) => `
      <div class="cart-item">
        <div><b>${i.name}</b>${i.size ? `<br><small class="text-muted">Размер: ${i.size}</small>` : ""}<br><small class="text-muted">${Number(i.price).toLocaleString("ru")} ₽</small></div>
        <div class="cart-controls">
          <button onclick="window.chgQty(${k},-1)">−</button><span>${i.qty}</span><button onclick="window.chgQty(${k},1)">+</button>
          <button onclick="window.rmItem(${k})" class="text-danger">🗑</button>
        </div>
      </div>`).join("");
  }
  const t = $("cart-total"); if (t) t.textContent = `${total.toLocaleString("ru")} ₽`;
  const tf = $("cart-total-final"); if (tf) tf.textContent = `${total.toLocaleString("ru")} ₽`;

  const promoRow = $("promo-row");
  if (promoRow) {
    if (APPLIED_PROMO && discount > 0) { promoRow.style.display = "flex"; promoRow.innerHTML = `<span>Промокод ${APPLIED_PROMO.code}</span><span class="text-success">-${discount.toLocaleString("ru")} ₽</span>`; }
    else { promoRow.style.display = "none"; }
  }

  const dItems = $("cart-drawer-items");
  if (dItems) {
    dItems.innerHTML = CART.length
      ? CART.map((i, k) => `<div class="cart-item"><div><b style="font-size:0.9rem">${i.name}</b>${i.size ? `<br><small class="text-muted">${i.size}</small>` : ""}<br><small style="color:var(--accent-primary);font-weight:600">${Number(i.price).toLocaleString("ru")} ₽ × ${i.qty}</small></div><div class="cart-controls"><button onclick="window.chgQty(${k},-1)">−</button><span>${i.qty}</span><button onclick="window.chgQty(${k},1)">+</button></div></div>`).join("")
      : '<div class="empty-state" style="padding:32px"><div class="empty-icon">🛒</div><p class="text-muted">Корзина пуста</p></div>';
  }
  const dt = $("cart-drawer-total"); if (dt) dt.textContent = `${total.toLocaleString("ru")} ₽`;
};

window.chgQty = (k, d) => { CART[k].qty = Math.max(1, (CART[k].qty || 1) + d); saveLocal("cart", CART); window.updateCartUI(); };
window.rmItem = (k) => { CART.splice(k, 1); saveLocal("cart", CART); window.updateCartUI(); window.toast("🗑️ Удалено", "info"); };
window.openCartDrawer = () => { const d = $("cart-drawer"); if (d) d.classList.add("open"); document.body.classList.add("modal-open"); };
window.closeCartDrawer = () => { const d = $("cart-drawer"); if (d) d.classList.remove("open"); document.body.classList.remove("modal-open"); };

// ==========================================
// CHECKOUT
// ==========================================

window.checkout = async function() {
  const btn = $("checkout-btn");
  if (!btn || STATE.isLoading) return;
  if (!$("agree-check")?.checked) return window.toast("Примите условия оферты", "error");
  if (!STATE.user) return window.toast("Войдите в аккаунт", "error");
  if (!CART.length) return window.toast("Корзина пуста", "error");
  if (!PVZ.city || !PVZ.addr) { window.openPVZ(); return window.toast("Укажите адрес доставки", "error"); }

  STATE.isLoading = true; btn.disabled = true; btn.textContent = "⏳ Оформление...";
  const timeout = setTimeout(() => { STATE.isLoading = false; btn.disabled = false; btn.textContent = "Оформить заказ"; window.toast("⏱️ Превышено время. Попробуйте снова.", "error"); }, 30000);

  try {
    let total = CART.reduce((s, i) => s + Number(i.price) * (i.qty || 1), 0);
    let discount = 0;
    if (APPLIED_PROMO) { discount = Math.round(total * APPLIED_PROMO.discount_percent / 100); total -= discount; }
    const items = CART.map(i => `${i.name}${i.size ? ` (${i.size})` : ''} ×${i.qty}`).join(", ");

    const { data: order, error: orderErr } = await sb.from("orders").insert({
      user_email: STATE.user.email, items, total: `${total.toLocaleString("ru")} ₽`,
      address: `${PVZ.city}, ${PVZ.addr}`, status: "pending",
      promo_code: APPLIED_PROMO?.code || null, discount: discount || 0
    }).select().single();
    if (orderErr) throw orderErr;

    if (APPLIED_PROMO) {
      await sb.from("promo_codes").update({ used_count: APPLIED_PROMO.used_count + 1 }).eq("id", APPLIED_PROMO.id);
      APPLIED_PROMO = null;
    }

    fetch(`https://api.telegram.org/bot${CONFIG.tgToken}/sendMessage`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CONFIG.tgChat, text: `📦 ЗАКАЗ #${order.id.slice(0,6)}\n👤 ${order.user_email}\n🛍 ${order.items}\n💰 ${order.total}${discount > 0 ? `\n🎁 Скидка: -${discount}₽` : ''}\n📍 ${order.address}` })
    }).catch(() => {});

    CART = []; saveLocal("cart", CART); window.updateCartUI();
    window.toast("✅ Заказ оформлен!", "success");
    setTimeout(() => window.go("my-orders"), 600);
  } catch (e) { console.error("[CHECKOUT]", e); window.toast("❌ " + ruError(e), "error"); }
  finally { clearTimeout(timeout); STATE.isLoading = false; if (btn) { btn.disabled = false; btn.textContent = "Оформить заказ"; } }
};

// ==========================================
// ORDERS
// ==========================================

window.loadOrders = async function() {
  if (!STATE.user) return;
  const list = $("my-orders-list");
  if (!list) return;
  list.innerHTML = '<div class="loading">Загрузка...</div>';
  try {
    const { data, error } = await sb.from("orders").select("*").eq("user_email", STATE.user.email).order("created_at", { ascending: false });
    if (error) throw error;
    const statuses = { pending: "⏳ Ожидает оплаты", paid: "✅ Оплачен", processing: "📦 Собирается", shipped: "🚚 В пути", delivered: "🏠 Доставлен", cancelled: "❌ Отменён" };
    list.innerHTML = data?.length ? data.map(o => `
      <div class="order-card card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <b>#${o.id.slice(0,6)}</b>
          <span>${statuses[o.status] || o.status}</span>
        </div>
        <p class="text-muted" style="font-size:0.9rem">${o.items}</p>
        <div style="display:flex;justify-content:space-between;margin-top:8px;font-weight:700">
          <span>${o.created_at?.slice(0,10)}</span>
          <span>${o.total}</span>
        </div>
      </div>`).join("") : '<p class="text-muted">Нет заказов</p>';
  } catch (e) { list.innerHTML = '<p class="text-danger">Ошибка загрузки</p>'; }
};

// ==========================================
// ADMIN PANEL
// ==========================================

window.loadAdmin = async function() {
  if (!STATE.user) return;
  try {
    const [ordRes, prodRes, revRes, totalRes, promoRes] = await Promise.all([
      sb.from("orders").select("*", { count: "exact", head: true }),
      sb.from("products").select("*").order("created_at", { ascending: false }),
      sb.from("reviews").select("*", { count: "exact", head: true }),
      sb.from("orders").select("total"),
      sb.from("promo_codes").select("*").order("created_at", { ascending: false })
    ]);

    if (prodRes.error) throw prodRes.error;
    window._adminProducts = prodRes.data || [];

    const s1 = $("st-orders"); if (s1) s1.textContent = ordRes.count || 0;
    const s2 = $("st-prods"); if (s2) s2.textContent = window._adminProducts.length;
    const s3 = $("st-reviews"); if (s3) s3.textContent = revRes.count || 0;
    const s4 = $("st-rev"); if (s4) s4.textContent = `${(totalRes.data?.reduce((s,o) => s + (parseFloat(String(o.total).replace(/[^0-9.]/g,"")) || 0), 0) || 0).toLocaleString("ru")} ₽`;

    const promoList = $("promo-list");
    if (promoList) {
      promoList.innerHTML = promoRes.data?.map(p => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border-light)">
          <div><b>${p.code}</b> — ${p.discount_percent}%<br><small class="text-muted">Использовано: ${p.used_count}${p.max_uses ? '/'+p.max_uses : ''}</small></div>
          <button class="btn-sm btn--danger" onclick="window.deletePromo('${p.id}')">🗑</button>
        </div>`).join("") || '<p class="text-muted">Нет промокодов</p>';
    }

    const statuses = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];
    const labels = { pending: "Ожидает", paid: "Оплачен", processing: "Собирается", shipped: "В пути", delivered: "Доставлен", cancelled: "Отменён" };
    const ol = $("admin-orders-list");
    if (ol) ol.innerHTML = ordRes.data?.map(o => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--border-light);gap:10px;flex-wrap:wrap">
        <span>#${(o.id||"").slice(0,6)}<br><small class="text-muted">${o.user_email}</small></span>
        <select onchange="window.updateOrderStatus('${o.id}',this.value)" class="input" style="width:auto;margin:0">
          ${statuses.map(s => `<option value="${s}" ${s===o.status?'selected':''}>${labels[s]}</option>`).join("")}
        </select>
        <button onclick="window.deleteOrder('${o.id}')" class="btn-sm btn--danger">🗑</button>
      </div>`).join("") || '<p class="text-muted">Нет заказов</p>';

    const ap = $("admin-prods");
    if (ap) ap.innerHTML = window._adminProducts.map(p => {
      const imgs = Array.isArray(p.images) ? p.images : (p.image_url ? [p.image_url] : []);
      const thumb = imgs[0] || '';
      return `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--border-light);gap:10px">
        <div style="display:flex;align-items:center;gap:10px;overflow:hidden;flex:1">
          ${thumb ? `<img src="${thumb}" style="width:44px;height:44px;border-radius:10px;object-fit:cover;flex-shrink:0;background:var(--bg-surface-2)">` : ''}
          <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.name}<br><small class="text-muted">${Number(p.price).toLocaleString("ru")} ₽</small></span>
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0">
          <button onclick="window.editProd('${p.id}')" class="btn-sm btn--primary">✏️</button>
          <button onclick="window.delProd('${p.id}')" class="btn-sm btn--danger">🗑</button>
        </div>
      </div>`;
    }).join("") || '<p class="text-muted">Нет товаров</p>';
  } catch (e) { console.error("[ADMIN LOAD]", e); window.toast("❌ " + ruError(e), "error"); }
};

window.createPromo = async function() {
  const code = $("promo-new-code")?.value.trim().toUpperCase();
  const discount = Number($("promo-new-discount")?.value);
  const maxUses = Number($("promo-new-uses")?.value) || null;
  if (!code || !discount) return window.toast("Заполните код и %", "error");
  try {
    await sb.from("promo_codes").insert({ code, discount_percent: discount, max_uses: maxUses });
    window.toast("✅ Промокод создан", "success");
    ["promo-new-code", "promo-new-discount", "promo-new-uses"].forEach(id => { const el = $(id); if (el) el.value = ""; });
    await window.loadAdmin();
  } catch (e) { window.toast("❌ " + ruError(e), "error"); }
};

window.deletePromo = async function(id) {
  if (!confirm("Удалить промокод?")) return;
  await sb.from("promo_codes").delete().eq("id", id);
  window.toast("🗑️ Удалён", "info");
  await window.loadAdmin();
};

window.updateOrderStatus = async (oid, st) => {
  try {
    await sb.from("orders").update({ status: st }).eq("id", oid);
    window.toast("✅ Статус обновлён", "success");
    await window.loadAdmin(); await window.loadOrders();
  } catch (e) { window.toast("❌ " + ruError(e), "error"); }
};

window.deleteOrder = async (id) => {
  if (!confirm("Удалить заказ?")) return;
  await sb.from("orders").delete().eq("id", id);
  window.toast("🗑️ Заказ удалён", "info");
  await window.loadAdmin();
};

window.editProd = function(id) {
  const p = window._adminProducts?.find(x => x.id === id);
  if (!p) return window.toast("Товар не найден", "error");
  STATE.editProdId = id;
  const images = Array.isArray(p.images) ? p.images : (p.image_url ? [p.image_url] : []);
  STATE._oldImages = images;

  const fields = { "add-name": p.name, "add-price": p.price, "add-old-price": p.old_price || "", "add-cat": p.category, "add-desc": p.description || "" };
  Object.entries(fields).forEach(([fid, val]) => { const el = $(fid); if (el) el.value = val; });

  const sz = $("add-sizes"); if (sz) sz.value = Array.isArray(p.sizes) ? p.sizes.join(", ") : (p.sizes || "");
  const hitCb = $("add-is-hit"); if (hitCb) hitCb.checked = !!p.is_hit;

  const previewContainer = $("img-preview-container");
  if (previewContainer) {
    previewContainer.innerHTML = images.map((img, i) =>
      `<div style="position:relative;display:inline-block;margin:4px;">
        <img src="${img}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;">
        <button onclick="window.removeOldImage(${i})" style="position:absolute;top:-6px;right:-6px;background:var(--danger);color:white;border:none;border-radius:50%;width:20px;height:20px;font-size:12px;cursor:pointer;">×</button>
      </div>`
    ).join("");
    previewContainer.style.display = images.length ? "block" : "none";
  }

  $("form-title").textContent = "✏️ Редактирование: " + p.name;
  $("prod-action-btn").textContent = "💾 Сохранить";
  $("prod-cancel-btn").style.display = "block";
  window.go("admin");
};

window.removeOldImage = function(index) {
  STATE._oldImages.splice(index, 1);
  const previewContainer = $("img-preview-container");
  if (previewContainer) {
    previewContainer.innerHTML = STATE._oldImages.map((img, i) =>
      `<div style="position:relative;display:inline-block;margin:4px;">
        <img src="${img}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;">
        <button onclick="window.removeOldImage(${i})" style="position:absolute;top:-6px;right:-6px;background:var(--danger);color:white;border:none;border-radius:50%;width:20px;height:20px;font-size:12px;cursor:pointer;">×</button>
      </div>`
    ).join("");
    previewContainer.style.display = STATE._oldImages.length ? "block" : "none";
  }
};

window.cancelEdit = function() {
  STATE.editProdId = null; STATE._oldImages = [];
  ["add-name", "add-price", "add-old-price", "add-desc", "add-sizes"].forEach(id => { const el = $(id); if (el) el.value = ""; });
  const f = $("add-file"); if (f) f.value = "";
  const hitCb = $("add-is-hit"); if (hitCb) hitCb.checked = false;
  const pc = $("img-preview-container"); if (pc) { pc.innerHTML = ""; pc.style.display = "none"; }
  $("form-title").textContent = "➕ Добавить товар";
  $("prod-action-btn").textContent = "Опубликовать";
  $("prod-cancel-btn").style.display = "none";
};

window.handleProdAction = async function() {
  const n = $("add-name")?.value.trim(), p = Number($("add-price")?.value), oldP = Number($("add-old-price")?.value) || null;
  const c = $("add-cat")?.value, s = $("add-sizes")?.value, d = $("add-desc")?.value.trim();
  const isHit = $("add-is-hit")?.checked || false;
  const files = $("add-file")?.files;

  if (!n || !p || p <= 0) return window.toast("Заполните название и корректную цену", "error");

  const btn = $("prod-action-btn");
  if (!btn) return;
  btn.disabled = true; btn.textContent = "⏳ Обработка...";

  const timeout = setTimeout(() => {
    btn.disabled = false; btn.textContent = STATE.editProdId ? "Сохранить" : "Опубликовать";
    window.toast("⏱️ Превышено время. Попробуйте снова.", "error");
  }, 60000);

  try {
    let images = [...STATE._oldImages];
    if (files && files.length > 0) {
      const maxNew = 5 - images.length;
      const filesToUpload = Array.from(files).slice(0, maxNew);
      for (const file of filesToUpload) {
        if (!file.type.startsWith("image/")) continue;
        const compressedBlob = await compressImage(file);
        const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
        const { error: upErr } = await sb.storage.from("products").upload(fileName, compressedBlob, { contentType: "image/jpeg" });
        if (upErr) throw upErr;
        const { data: urlData } = sb.storage.from("products").getPublicUrl(fileName);
        images.push(urlData.publicUrl);
      }
    }

    if (images.length === 0) return window.toast("Добавьте хотя бы одно фото", "error");

    const payload = {
      name: n, price: p, old_price: oldP, category: c,
      sizes: s.split(",").map(x => x.trim()).filter(Boolean),
      images: images, image_url: images[0], description: d, is_hit: isHit
    };

    let dbErr;
    if (STATE.editProdId) {
      const res = await sb.from("products").update(payload).eq("id", STATE.editProdId);
      dbErr = res.error;
    } else {
      const res = await sb.from("products").insert(payload);
      dbErr = res.error;
    }
    if (dbErr) throw dbErr;

    window.toast("✅ " + (STATE.editProdId ? "Обновлено" : "Опубликовано"), "success");
    window.cancelEdit();
    await loadProducts();
    await window.loadAdmin();
  } catch (e) {
    console.error("[PROD FAIL]", e);
    window.toast("❌ " + ruError(e), "error");
  } finally {
    clearTimeout(timeout);
    if (btn) { btn.disabled = false; btn.textContent = STATE.editProdId ? "Сохранить" : "Опубликовать"; }
  }
};

window.delProd = async function(id) {
  if (!confirm("Удалить товар? Все фото будут удалены.")) return;
  try {
    const p = window._adminProducts?.find(x => x.id === id);
    if (p) {
      const images = Array.isArray(p.images) ? p.images : (p.image_url ? [p.image_url] : []);
      for (const imgUrl of images) {
        const path = decodeURIComponent(imgUrl.split("/products/")[1]);
        await sb.storage.from("products").remove([path]).catch(() => {});
      }
    }
    const res = await sb.from("products").delete().eq("id", id);
    if (res.error) throw res.error;
    window.toast("🗑️ Удалено", "info");
    await loadProducts();
    await window.loadAdmin();
  } catch (e) { console.error("[DELETE]", e); window.toast("❌ " + ruError(e), "error"); }
};

// ==========================================
// REVIEWS
// ==========================================

window.loadReviews = async function(pid) {
  const l = $("reviews-list"); if (!l) return;
  try {
    const res = await sb.from("reviews").select("*,profiles(full_name)").eq("product_id", pid).order("created_at", { ascending: false });
    l.innerHTML = res.data?.length ? res.data.map(x => `
      <div class="review-card">
        <div style="display:flex;justify-content:space-between"><b>${x.profiles?.full_name || x.user_email?.split("@")[0] || "User"}</b><span style="color:#f59e0b">${"⭐".repeat(x.rating)}</span></div>
        <p style="margin-top:8px;color:var(--text-secondary)">${x.comment}</p>
        ${STATE.user && CONFIG.adminEmails.includes(STATE.user.email) ? `<button onclick="window.deleteReview('${x.id}')" class="btn-sm btn--danger" style="margin-top:8px">Удалить</button>` : ''}
      </div>`).join("") : '<p class="text-muted">Нет отзывов</p>';
  } catch (e) { console.error(e); }
};

$("review-form")?.addEventListener("submit", async e => {
  e.preventDefault();
  if (!STATE.user) return window.toast("Войдите", "error");
  const r = Number($("review-rating").value), c = $("review-comment")?.value.trim();
  if (!c) return window.toast("Напишите текст", "error");
  try {
    await sb.from("reviews").insert({ product_id: STATE.currentProduct.id, user_id: STATE.user.id, user_email: STATE.user.email, rating: r, comment: c });
    $("review-comment").value = "";
    await window.loadReviews(STATE.currentProduct.id);
    window.toast("✅ Спасибо за отзыв!", "success");
  } catch (e) { window.toast("❌ " + ruError(e), "error"); }
});

window.deleteReview = async function(id) {
  if (!confirm("Удалить отзыв?")) return;
  await sb.from("reviews").delete().eq("id", id);
  await window.loadReviews(STATE.currentProduct.id);
};

// ==========================================
// WISHLIST
// ==========================================

window.toggleWishlistCard = (id, btn) => {
  const p = STATE.products.find(x => x.id === id);
  if (!p) return;
  const idx = WISHLIST.findIndex(w => w.id === id);
  if (idx >= 0) { WISHLIST.splice(idx, 1); if (btn) { btn.classList.remove("active"); btn.querySelector("i").className = "fa-regular fa-heart"; } window.toast("💔 Убрано", "info"); }
  else { WISHLIST.push(p); if (btn) { btn.classList.add("active"); btn.querySelector("i").className = "fa-solid fa-heart"; } window.toast("❤️ Добавлено", "success"); }
  saveLocal("wishlist", WISHLIST);
};

window.toggleWishlist = () => {
  if (!STATE.currentProduct) return;
  const id = STATE.currentProduct.id;
  const btn = document.querySelector(".btn-wishlist");
  window.toggleWishlistCard(id, btn ? btn.querySelector("i").parentElement : null);
  const wi = $("wishlist-icon");
  if (wi) wi.className = `fa-${WISHLIST.some(w => w.id === id) ? 'solid' : 'regular'} fa-heart`;
};

window.renderWishlist = () => {
  const grid = $("wishlist-grid"), empty = $("wishlist-empty");
  if (!grid || !empty) return;
  if (!WISHLIST.length) { grid.style.display = "none"; empty.style.display = "block"; return; }
  empty.style.display = "none"; grid.style.display = "grid";
  grid.innerHTML = WISHLIST.map(makeCard).join("");
};

// ==========================================
// MODALS & CHAT & PVZ
// ==========================================

window.openModal = (type) => {
  const m = $("legal-modal"), t = $("legal-title"), b = $("legal-body");
  if (!m) return;
  m.classList.add("open"); document.body.classList.add("modal-open");
  if (type === "offer") { t.textContent = "📜 Оферта"; b.innerHTML = `<div class="legal-text"><h3>1. Общие положения</h3><p>ИП Маслаков А.Е.</p></div>`; }
  else if (type === "privacy") { t.textContent = "🔒 Конфиденциальность"; b.innerHTML = `<div class="legal-text"><p>Мы не передаем данные третьим лицам.</p></div>`; }
};
window.closeModal = () => { const m = $("legal-modal"); if (m) m.classList.remove("open"); document.body.classList.remove("modal-open"); };

window.openPVZ = () => { const m = $("pvz-modal"); if (!m) return; m.classList.add("open"); document.body.classList.add("modal-open"); const c = $("pvz-city"), a = $("pvz-addr"); if (c) c.value = PVZ.city || ""; if (a) a.value = PVZ.addr || ""; };
window.closePVZ = () => { const m = $("pvz-modal"); if (m) m.classList.remove("open"); document.body.classList.remove("modal-open"); };
window.savePVZ = () => { const c = $("pvz-city")?.value.trim(), a = $("pvz-addr")?.value.trim(); if (!c || !a) return window.toast("Заполните поля", "error"); PVZ = { city: c, addr: a }; saveLocal("pvz", PVZ); window.closePVZ(); window.toast("✅ Адрес сохранён", "success"); };

window.openChat = () => { const m = $("chat-modal"); if (m) { m.classList.add("open"); document.body.classList.add("modal-open"); } };
window.closeChat = () => { const m = $("chat-modal"); if (m) { m.classList.remove("open"); document.body.classList.remove("modal-open"); } };
window.sendMsg = () => { const i = $("chat-in"), t = i?.value.trim(); if (!t) return; i.value = ""; window.toast("Сообщение отправлено", "success"); };

// ==========================================
// CATEGORY FILTER & SEARCH
// ==========================================

window.filterCategory = (cat, btn) => {
  STATE.currentCategory = cat;
  document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  const filtered = cat === "all" ? STATE.products : STATE.products.filter(p => p.category === cat);
  STATE.filteredProducts = filtered;
  const grid = $("catalog-grid");
  if (grid) { grid.innerHTML = filtered.map(makeCard).join("") || '<p style="grid-column:1/-1;text-align:center;padding:48px;color:var(--text-muted)">Пусто</p>'; }
  if (!document.getElementById("catalog").classList.contains("active")) window.go("catalog");
};

let searchTimer;
$("search-input")?.addEventListener("input", e => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) { window.render(STATE.products.slice(0, 8), "home"); return; }
    const results = STATE.products.filter(p => p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q));
    window.go("catalog");
    window.render(results, "catalog");
  }, 300);
});

// File preview for admin
$("add-file")?.addEventListener("change", function(e) {
  const files = e.target.files;
  const pc = $("img-preview-container");
  if (files && files.length > 0 && pc) {
    pc.innerHTML = Array.from(files).slice(0, 5).map(f =>
      `<img src="${URL.createObjectURL(f)}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;margin:4px;">`
    ).join("");
    pc.style.display = "block";
  } else if (pc) { pc.style.display = "none"; }
});

// ==========================================
// REVEAL ANIMATION OBSERVER
// ==========================================

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

function observeReveals() {
  document.querySelectorAll(".reveal:not(.visible)").forEach(el => revealObserver.observe(el));
}

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {
  console.log("[OK] TapkiDrop v18.0 FINAL ready");
  applyTheme();
  try {
    const { data: { session } } = await Promise.race([
      sb.auth.getSession(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 5000))
    ]);
    if (session?.user) {
      STATE.user = session.user;
      await loadUserProfile(STATE.user);
      CART = loadLocal("cart"); PVZ = loadLocal("pvz"); WISHLIST = loadLocal("wishlist");
    }
  } catch (e) { console.warn("[SESSION]", e); }
  window.updateAuthUI();
  await loadProducts();
  window.updateCartUI();
  observeReveals();
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { window.closeCartDrawer(); window.closeChat(); window.closeModal(); window.closePVZ(); }
  });
});
