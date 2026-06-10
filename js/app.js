// ==========================================
// TAPKIDROP | PRODUCTION CORE v19.1 FIXED
// Bug Fixes: Event delegation, missing actions,
// cart drawer, search sync, bento navigation
// ==========================================

"use strict";

// --- CONFIG & CONSTANTS ---
const CONFIG = Object.freeze({
  supabaseUrl: "https://dlfynallzrbghniaeafb.supabase.co",
  supabaseKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsZnluYWxsenJiZ2huaWFlYWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4OTUxOTYsImV4cCI6MjA5NTQ3MTE5Nn0.n6JJtaOjP8_kpTFENk0Mv0o2X31_rSRXiDywcIv2syw",
  tgToken: "8706865987:AAHSTQvxklwoiScS3HpJvFyEyVT57eQkz8o",
  tgChat: "-1003371505343",
  adminEmails: ["antoniobandero11@gmail.com", "buldozer.mas12@gmail.com"],
  storageBucket: "products"
});

// Mock Data Fallback (Instant Render)
const MOCK_PRODUCTS = [
  { id: "mock-1", name: "Nike Air Max Pulse Essential", price: 18990, old_price: 23990, category: "designer", description: "Легендарная модель с амортизирующей подошвой Air Max.", sizes: ["40","41","42","43","44"], images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop"], image_url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop", is_hit: true, created_at: new Date().toISOString() },
  { id: "mock-2", name: "Adidas Ultraboost Light Running", price: 14500, old_price: null, category: "classics", description: "Самые легкие Ultraboost в истории. Возврат энергии Boost.", sizes: ["39","40","41","42","43"], images: ["https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?q=80&w=600&auto=format&fit=crop"], image_url: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?q=80&w=600&auto=format&fit=crop", is_hit: false, created_at: new Date().toISOString() },
  { id: "mock-3", name: "Air Jordan 1 Low OG White Red", price: 12990, old_price: null, category: "classics", description: "Классический силуэт в новой расцветке. Кожаный верх.", sizes: ["40","41","42","43","44","45"], images: ["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&auto=format&fit=crop"], image_url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&auto=format&fit=crop", is_hit: false, created_at: new Date(Date.now() - 86400000*2).toISOString() },
  { id: "mock-4", name: "New Balance 550 White Green", price: 11200, old_price: 17200, category: "sale", description: "Ретро-баскетбольный стиль. Перфорированный кожаный верх.", sizes: ["36","37","38","39","40"], images: ["https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=600&auto=format&fit=crop"], image_url: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=600&auto=format&fit=crop", is_hit: false, created_at: new Date().toISOString() },
  { id: "mock-5", name: "Nike Dunk Low Panda Classic", price: 21990, old_price: null, category: "designer", description: "Самая популярная расцветка года. Черно-белая классика.", sizes: ["38","39","40","41","42","43","44"], images: ["https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=600&auto=format&fit=crop"], image_url: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=600&auto=format&fit=crop", is_hit: true, created_at: new Date().toISOString() },
  { id: "mock-6", name: "Puma RS-X Reinvention Kids", price: 9990, old_price: null, category: "kids", description: "Яркие детские кроссовки с технологией RS. Легкие и удобные.", sizes: ["28","29","30","31","32","33"], images: ["https://images.unsplash.com/photo-1584735175315-9d5df23860e6?q=80&w=600&auto=format&fit=crop"], image_url: "https://images.unsplash.com/photo-1584735175315-9d5df23860e6?q=80&w=600&auto=format&fit=crop", is_hit: false, created_at: new Date().toISOString() }
];

// --- STATE MANAGEMENT ---
const Store = {
  user: null,
  profile: null,
  products: [],
  filteredProducts: [],
  currentProduct: null,
  currentSize: null,
  isLoading: false,
  editProdId: null,
  _oldImages: [],
  currentCategory: "all",
  theme: localStorage.getItem("td_theme") || "light",

  cart: [],
  pvz: { city: "", addr: "" },
  wishlist: [],
  appliedPromo: null,

  init() {
    this.loadUserData();
    this.applyTheme();
  },

  getUserKey(base) {
    return this.user ? `td_${base}_${this.user.id}` : `td_${base}_guest`;
  },

  loadUserData() {
    try {
      this.cart     = JSON.parse(localStorage.getItem(this.getUserKey("cart")))     || [];
      this.pvz      = JSON.parse(localStorage.getItem(this.getUserKey("pvz")))      || { city: "", addr: "" };
      this.wishlist = JSON.parse(localStorage.getItem(this.getUserKey("wishlist"))) || [];
    } catch (e) {
      console.error("[STORE] Load error", e);
      this.cart = []; this.pvz = { city: "", addr: "" }; this.wishlist = [];
    }
  },

  save(key, data) {
    try {
      localStorage.setItem(this.getUserKey(key), JSON.stringify(data));
    } catch (e) { console.error("[STORE] Save error", e); }
  },

  applyTheme() {
    document.documentElement.setAttribute("data-theme", this.theme);
    const icon = document.getElementById("theme-icon");
    if (icon) icon.className = this.theme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
  }
};

// --- SUPABASE CLIENT ---
let sb;
try {
  sb = supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);
} catch(e) {
  console.error("[SB INIT FAIL]", e);
}

// --- UTILITIES ---
const Utils = {
  $(id) { return document.getElementById(id); },

  toast(msg, type = "info") {
    // Remove any existing toast first
    document.querySelectorAll(".toast").forEach(t => t.remove());
    const t = document.createElement("div");
    t.textContent = msg;
    t.className = `toast toast--${type}`;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add("visible"));
    setTimeout(() => {
      t.classList.remove("visible");
      setTimeout(() => t.remove(), 300);
    }, 3000);
  },

  ruError(err) {
    if (!err) return "Неизвестная ошибка";
    const msg = err.message || String(err);
    const map = {
      "invalid login": "Неверный email или пароль",
      "already registered": "Этот email уже занят",
      "password should be": "Пароль минимум 6 символов",
      "email not confirmed": "Подтвердите email в настройках Supabase",
      "violates row-level": "Нет прав доступа",
      "failed to fetch": "Нет соединения с интернетом"
    };
    for (const [k, v] of Object.entries(map)) if (msg.toLowerCase().includes(k)) return v;
    return msg.length > 50 ? msg.slice(0, 50) + "..." : msg;
  },

  async compressImage(file, maxWidth = 1200, quality = 0.8) {
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
          canvas.toBlob((blob) => resolve(blob || file), 'image/jpeg', quality);
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
  },

  formatPrice(price) {
    return Number(price).toLocaleString("ru-RU") + " ₽";
  }
};

// ============================================================
// FIX #1 — GLOBAL EVENT DELEGATION
// The HTML uses data-action attributes but the original code
// had no central dispatcher. All actions are now handled here.
// ============================================================
function setupGlobalDelegation() {
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-action]");
    if (!el) return;

    const action = el.dataset.action;
    const target = el.dataset.target;
    const cat    = el.dataset.cat;
    const modal  = el.dataset.modal;
    const tab    = el.dataset.tab;

    switch (action) {
      // ── Navigation ──────────────────────────────────────
      case "go":
        TapkiDrop.go(target);
        break;

      // FIX #2 — goFilter was missing entirely
      case "goFilter":
        TapkiDrop.goFilter(target, cat);
        break;

      // ── Categories ──────────────────────────────────────
      case "filterCategory":
        TapkiDrop.filterCategory(cat, el);
        break;

      // ── Theme ───────────────────────────────────────────
      case "toggleTheme":
        TapkiDrop.toggleTheme();
        break;

      // ── Cart Drawer ──────────────────────────────────────
      // FIX #3 — HTML used openCartDrawer / closeCartDrawer
      // but JS only had openDrawer / closeDrawer
      case "openCartDrawer":
        Cart.openDrawer();
        break;
      case "closeCartDrawer":
        Cart.closeDrawer();
        break;

      // FIX #4 — goToCheckout was missing
      case "goToCheckout":
        Cart.closeDrawer();
        TapkiDrop.go("cart");
        break;

      // ── Checkout ─────────────────────────────────────────
      case "checkout":
        Cart.checkout();
        break;

      case "applyPromo":
        Cart.applyPromo();
        break;

      // ── Cart detail page ─────────────────────────────────
      case "addToCartFromDetail":
        TapkiDrop.addToCartFromDetail();
        break;

      case "toggleWishlist":
        Wishlist.toggle();
        break;

      // ── Modals ───────────────────────────────────────────
      case "openModal":
        TapkiDrop.openModal(modal);
        break;
      case "closeModal":
        TapkiDrop.closeModal();
        break;

      case "openPVZ":
        TapkiDrop.openPVZ();
        break;
      case "closePVZ":
        TapkiDrop.closePVZ();
        break;
      case "savePVZ":
        TapkiDrop.savePVZ();
        break;

      case "openChat":
        TapkiDrop.openChat();
        break;
      case "closeChat":
        TapkiDrop.closeChat();
        break;
      case "sendMsg":
        TapkiDrop.sendMsg();
        break;

      // ── Auth ─────────────────────────────────────────────
      // FIX #5 — switchTab received tab and el separately in
      // old inline calls; delegation passes both correctly now
      case "switchTab":
        TapkiDrop.switchTab(tab, el);
        break;

      // ── Admin ─────────────────────────────────────────────
      case "handleProdAction":
        Admin.handleProdAction();
        break;
      case "cancelEdit":
        Admin.cancelEdit();
        break;
      case "createPromo":
        Admin.createPromo();
        break;
    }
  });

  // Send chat message on Enter key
  Utils.$("chat-in")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") TapkiDrop.sendMsg();
  });
}

// --- CORE ACTIONS ---
window.TapkiDrop = {
  // ── Navigation ────────────────────────────────────────────
  go(id) {
    document.querySelectorAll(".page").forEach(p => {
      p.classList.remove("active");
      p.style.opacity = "0";
    });
    const el = Utils.$(id);
    if (el) {
      el.classList.add("active");
      requestAnimationFrame(() => { el.style.opacity = "1"; });
    }

    document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
    const nav = document.querySelector(`.nav-item[data-target="${id}"]`);
    if (nav) nav.classList.add("active");

    const catNav = Utils.$("cat-nav");
    if (catNav) catNav.classList.toggle("hide", !["home", "catalog"].includes(id));

    window.scrollTo({ top: 0, behavior: "smooth" });

    if (id === "admin")         Admin.load();
    if (id === "my-orders")     Orders.load();
    if (id === "wishlist-page") Wishlist.render();
    if (id === "product" && Store.currentProduct) Reviews.load(Store.currentProduct.id);

    // Re-observe reveal elements on newly shown page
    setTimeout(() => {
      document.querySelectorAll(".reveal:not(.visible)").forEach(el => revealObserver.observe(el));
    }, 50);
  },

  // FIX #2 — navigate to catalog and apply a category filter
  goFilter(target, cat) {
    this.go(target);
    if (cat) {
      const btn = document.querySelector(`.cat-btn[data-cat="${cat}"]`);
      this.filterCategory(cat, btn);
    }
  },

  toggleTheme() {
    Store.theme = Store.theme === "dark" ? "light" : "dark";
    localStorage.setItem("td_theme", Store.theme);
    Store.applyTheme();
  },

  filterCategory(cat, btn) {
    Store.currentCategory = cat;
    document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
    if (btn) btn.classList.add("active");

    const filtered = cat === "all"
      ? Store.products
      : Store.products.filter(p => p.category === cat);
    Store.filteredProducts = filtered;

    const grid = Utils.$("catalog-grid");
    if (grid) {
      grid.innerHTML = filtered.map(Render.card).join("")
        || '<p style="grid-column:1/-1;text-align:center;padding:48px;color:var(--text-muted)">Пусто</p>';
    }

    if (!Utils.$("catalog").classList.contains("active")) this.go("catalog");
  },

  // ── Product Interaction ───────────────────────────────────
  openProd(id) {
    const p = Store.products.find(x => x.id === id);
    if (!p) return Utils.toast("Не найдено", "error");

    Store.currentProduct = p;
    Store.currentSize = null;

    const images = Array.isArray(p.images) ? p.images : (p.image_url ? [p.image_url] : []);
    const mainImg = images[0] || "";

    const imgContainer = Utils.$("detail-img");
    if (imgContainer) {
      imgContainer.innerHTML = mainImg
        ? `<img src="${mainImg}" alt="${p.name}" style="width:100%;height:100%;object-fit:contain;padding:32px;">`
        : "<div style='display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:3rem;'>👟</div>";

      const thumbs = Utils.$("gallery-thumbs");
      if (thumbs) {
        thumbs.innerHTML = images.length > 1
          ? images.map(img =>
              `<img src="${img}"
                    onclick="TapkiDrop.switchImage('${img}')"
                    style="width:60px;height:60px;object-fit:cover;border-radius:8px;cursor:pointer;border:2px solid transparent;"
                    onmouseover="this.style.borderColor='var(--accent-primary)'"
                    onmouseout="this.style.borderColor='transparent'">`
            ).join("")
          : "";
      }
    }

    const setTxt = (id, val) => { const el = Utils.$(id); if (el) el.textContent = val; };
    setTxt("detail-brand", p.category);
    setTxt("detail-name", p.name);
    setTxt("detail-desc", p.description || "");

    // FIX #6 — price block showed plain text; now shows old price too
    const priceBlock = Utils.$("detail-price");
    if (priceBlock) {
      priceBlock.innerHTML = p.old_price && p.old_price > p.price
        ? `<span style="text-decoration:line-through;color:var(--text-muted);font-size:1.4rem;font-weight:500;margin-right:12px">${Utils.formatPrice(p.old_price)}</span>${Utils.formatPrice(p.price)}`
        : Utils.formatPrice(p.price);
    }

    const sizes = Array.isArray(p.sizes)
      ? p.sizes
      : (p.sizes || "").split(",").map(s => s.trim()).filter(Boolean);
    const szContainer = Utils.$("sizes-container");
    if (szContainer) {
      szContainer.innerHTML = sizes.length
        ? sizes.map(s =>
            `<button class="size-btn" onclick="TapkiDrop.selectSize('${s}', this)">${s}</button>`
          ).join("")
        : '<span style="color:var(--text-muted)">Нет размеров</span>';
    }

    const wi = Utils.$("wishlist-icon");
    if (wi) wi.className = `fa-${Store.wishlist.some(w => w.id === p.id) ? 'solid' : 'regular'} fa-heart`;

    this.go("product");
    Reviews.load(id);
  },

  switchImage(url) {
    const c = Utils.$("detail-img");
    if (c) c.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:contain;padding:32px;">`;
  },

  selectSize(size, btn) {
    document.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    Store.currentSize = size;
  },

  addToCart(id) {
    const p = Store.products.find(x => x.id === id);
    if (!p) return;
    const ex = Store.cart.find(x => x.id === id && x.size === (Store.currentSize || null));
    if (ex) ex.qty++;
    else Store.cart.push({ ...p, qty: 1, size: Store.currentSize || null });

    Store.save("cart", Store.cart);
    Cart.updateUI();
    Utils.toast("✅ Добавлено в корзину", "success");

    const badge = Utils.$("cart-badge");
    if (badge) {
      badge.style.transform = "scale(1.4)";
      setTimeout(() => badge.style.transform = "scale(1)", 200);
    }
  },

  addToCartFromDetail() {
    if (!Store.currentProduct) return;
    const sizes = Store.currentProduct.sizes;
    const hasSizes = Array.isArray(sizes) ? sizes.length > 0 : (sizes && sizes.length > 0);
    if (hasSizes && !Store.currentSize) return Utils.toast("Выберите размер", "error");
    this.addToCart(Store.currentProduct.id);
  },

  // ── Modals ────────────────────────────────────────────────
  openModal(type) {
    const m = Utils.$("legal-modal"), t = Utils.$("legal-title"), b = Utils.$("legal-body");
    if (!m) return;
    m.classList.add("open");
    document.body.classList.add("modal-open");
    if (type === "offer") {
      t.textContent = "📜 Оферта";
      b.innerHTML = `<div class="legal-text"><h3>1. Общие положения</h3><p>Настоящая Публичная оферта является официальным предложением ИП Маслаков А.Е. заключить договор купли-продажи товаров дистанционным способом.</p><h3>2. Предмет договора</h3><p>Продавец обязуется передать покупателю товар на условиях, изложенных в настоящей оферте.</p><h3>3. Оплата и доставка</h3><p>Оплата производится любым доступным способом. Доставка осуществляется в течение 2–7 рабочих дней.</p></div>`;
    } else if (type === "privacy") {
      t.textContent = "🔒 Конфиденциальность";
      b.innerHTML = `<div class="legal-text"><h3>Обработка персональных данных</h3><p>Мы обрабатываем только необходимые для выполнения заказа данные. Мы не передаём данные третьим лицам без вашего согласия.</p></div>`;
    }
  },
  closeModal() {
    const m = Utils.$("legal-modal");
    if (m) { m.classList.remove("open"); document.body.classList.remove("modal-open"); }
  },

  openPVZ() {
    const m = Utils.$("pvz-modal");
    if (!m) return;
    m.classList.add("open");
    document.body.classList.add("modal-open");
    const c = Utils.$("pvz-city"), a = Utils.$("pvz-addr");
    if (c) c.value = Store.pvz.city || "";
    if (a) a.value = Store.pvz.addr || "";
  },
  closePVZ() {
    const m = Utils.$("pvz-modal");
    if (m) { m.classList.remove("open"); document.body.classList.remove("modal-open"); }
  },
  savePVZ() {
    const c = Utils.$("pvz-city")?.value.trim();
    const a = Utils.$("pvz-addr")?.value.trim();
    if (!c || !a) return Utils.toast("Заполните поля", "error");
    Store.pvz = { city: c, addr: a };
    Store.save("pvz", Store.pvz);
    this.closePVZ();
    Utils.toast("✅ Адрес сохранён", "success");
  },

  openChat() {
    const m = Utils.$("chat-modal");
    if (!m) return;
    m.classList.add("open");
    document.body.classList.add("modal-open");
    // Show greeting if empty
    const body = Utils.$("chat-body");
    if (body && !body.children.length) {
      const msg = document.createElement("div");
      msg.className = "chat-msg bot";
      msg.textContent = "👋 Привет! Чем могу помочь?";
      body.appendChild(msg);
    }
  },
  closeChat() {
    const m = Utils.$("chat-modal");
    if (m) { m.classList.remove("open"); document.body.classList.remove("modal-open"); }
  },
  sendMsg() {
    const i = Utils.$("chat-in");
    const t = i?.value.trim();
    if (!t) return;

    const body = Utils.$("chat-body");
    if (body) {
      const userMsg = document.createElement("div");
      userMsg.className = "chat-msg user";
      userMsg.textContent = t;
      body.appendChild(userMsg);

      setTimeout(() => {
        const botMsg = document.createElement("div");
        botMsg.className = "chat-msg bot";
        botMsg.textContent = "Спасибо за обращение! Мы ответим вам в ближайшее время.";
        body.appendChild(botMsg);
        body.scrollTop = body.scrollHeight;
      }, 800);

      body.scrollTop = body.scrollHeight;
    }

    i.value = "";
    Utils.toast("Сообщение отправлено", "success");
  },

  // ── Auth Tabs ─────────────────────────────────────────────
  switchTab(tab, el) {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    el.classList.add("active");
    const btn = Utils.$("auth-btn");
    if (btn) btn.textContent = tab === "login" ? "Войти" : "Регистрация";
  }
};

// Expose legacy window functions for backward compatibility
Object.assign(window, window.TapkiDrop);

// --- RENDER ENGINE ---
const Render = {
  card(p) {
    const isWished = Store.wishlist.some(w => w.id === p.id);
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
      ? `<div class="card-badges">${badges.map(b =>
          `<span class="card-badge" style="background:${b.color}">${b.text}</span>`
        ).join('')}</div>`
      : '';

    const priceHtml = p.old_price && p.old_price > p.price
      ? `<div class="card-price"><span class="old-price">${Utils.formatPrice(p.old_price)}</span>${Utils.formatPrice(p.price)}</div>`
      : `<div class="card-price">${Utils.formatPrice(p.price)}</div>`;

    // Escape name for use in onclick
    const safeName = p.name.replace(/'/g, "\\'");

    return `
      <div class="card reveal" onclick="TapkiDrop.openProd('${p.id}')">
        <div class="card-img">
          ${mainImg
            ? `<img src="${mainImg}" alt="${safeName}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">`
            : "<div style='display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:3rem;'>👟</div>"
          }
          ${badgesHtml}
          <button class="card-wishlist ${isWished ? 'active' : ''}"
                  onclick="event.stopPropagation(); Wishlist.toggleCard('${p.id}', this)">
            <i class="fa-${isWished ? 'solid' : 'regular'} fa-heart"></i>
          </button>
        </div>
        <div class="card-body">
          <div class="card-name">${p.name}</div>
          ${priceHtml}
          <button class="btn-cart" onclick="event.stopPropagation(); TapkiDrop.addToCart('${p.id}')">В корзину</button>
        </div>
      </div>`;
  },

  products(list, target = "both") {
    const emptyMsg = '<p style="grid-column:1/-1;text-align:center;padding:48px;color:var(--text-muted)">Ничего не найдено</p>';
    if (target === "home" || target === "both") {
      const h = Utils.$("home-grid");
      if (h) h.innerHTML = list.slice(0, 8).map(this.card).join("") || emptyMsg;
    }
    if (target === "catalog" || target === "both") {
      const c = Utils.$("catalog-grid");
      if (c) c.innerHTML = list.map(this.card).join("") || emptyMsg;
    }
    // Observe new cards for reveal animation
    setTimeout(() => {
      document.querySelectorAll(".reveal:not(.visible)").forEach(el => revealObserver.observe(el));
    }, 50);
  }
};

// --- CART MODULE ---
const Cart = {
  updateUI() {
    const count = Store.cart.reduce((s, i) => s + (i.qty || 1), 0);
    const b = Utils.$("cart-badge");
    if (b) { b.textContent = count; b.setAttribute("data-count", count); }

    let subtotal = Store.cart.reduce((s, i) => s + Number(i.price) * (i.qty || 1), 0);
    let discount = 0;
    if (Store.appliedPromo) {
      discount = Math.round(subtotal * Store.appliedPromo.discount_percent / 100);
    }
    const total = subtotal - discount;

    const emp = Utils.$("cart-empty"), lay = Utils.$("cart-layout");
    if (!Store.cart.length) {
      if (emp) emp.style.display = "block";
      if (lay) lay.style.display = "none";
    } else {
      if (emp) emp.style.display = "none";
      if (lay) lay.style.display = "grid";
    }

    const items = Utils.$("cart-items");
    if (items) {
      items.innerHTML = Store.cart.map((i, k) => `
        <div class="cart-item">
          <div>
            <b>${i.name}</b>
            ${i.size ? `<br><small class="text-muted">Размер: ${i.size}</small>` : ""}
            <br><small class="text-muted">${Utils.formatPrice(i.price)} × ${i.qty}</small>
          </div>
          <div class="cart-controls">
            <button onclick="Cart.chgQty(${k},-1)">−</button>
            <span>${i.qty}</span>
            <button onclick="Cart.chgQty(${k},1)">+</button>
            <button onclick="Cart.rmItem(${k})" class="text-danger" style="margin-left:4px">🗑</button>
          </div>
        </div>`).join("");
    }

    // FIX #7 — cart-subtotal was missing in original UI update
    const st = Utils.$("cart-subtotal");
    if (st) st.textContent = Utils.formatPrice(subtotal);

    const tf = Utils.$("cart-total-final");
    if (tf) tf.textContent = Utils.formatPrice(total);

    const promoRow = Utils.$("promo-row");
    if (promoRow) {
      if (Store.appliedPromo && discount > 0) {
        promoRow.style.display = "flex";
        const pl = Utils.$("promo-label"), pv = Utils.$("promo-value");
        if (pl) pl.textContent = `Промокод ${Store.appliedPromo.code}`;
        if (pv) pv.textContent = `-${Utils.formatPrice(discount)}`;
      } else {
        promoRow.style.display = "none";
      }
    }

    // Drawer
    const dItems = Utils.$("cart-drawer-items");
    if (dItems) {
      dItems.innerHTML = Store.cart.length
        ? Store.cart.map((i, k) => `
            <div class="cart-item">
              <div>
                <b style="font-size:0.9rem">${i.name}</b>
                ${i.size ? `<br><small class="text-muted">${i.size}</small>` : ""}
                <br><small style="color:var(--accent-primary);font-weight:600">${Utils.formatPrice(i.price)} × ${i.qty}</small>
              </div>
              <div class="cart-controls">
                <button onclick="Cart.chgQty(${k},-1)">−</button>
                <span>${i.qty}</span>
                <button onclick="Cart.chgQty(${k},1)">+</button>
              </div>
            </div>`).join("")
        : '<div class="empty-state" style="padding:32px"><div class="empty-icon">🛒</div><p class="text-muted">Корзина пуста</p></div>';
    }
    const dt = Utils.$("cart-drawer-total");
    if (dt) dt.textContent = Utils.formatPrice(total);
  },

  chgQty(k, d) {
    if (!Store.cart[k]) return;
    Store.cart[k].qty = Math.max(1, (Store.cart[k].qty || 1) + d);
    Store.save("cart", Store.cart);
    this.updateUI();
  },
  rmItem(k) {
    Store.cart.splice(k, 1);
    Store.save("cart", Store.cart);
    this.updateUI();
    Utils.toast("🗑️ Удалено", "info");
  },

  openDrawer() {
    const d = Utils.$("cart-drawer");
    if (d) { d.classList.add("open"); document.body.classList.add("modal-open"); }
  },
  closeDrawer() {
    const d = Utils.$("cart-drawer");
    if (d) { d.classList.remove("open"); document.body.classList.remove("modal-open"); }
  },

  async applyPromo() {
    const code   = Utils.$("promo-input")?.value.trim().toUpperCase();
    const status = Utils.$("promo-status");
    if (!code || !status) return;
    if (!sb) { status.innerHTML = '<span class="text-danger">❌ Нет соединения</span>'; return; }
    try {
      const { data, error } = await sb.from("promo_codes").select("*").eq("code", code).eq("is_active", true).single();
      if (error || !data) { status.innerHTML = '<span class="text-danger">❌ Промокод не найден</span>'; Store.appliedPromo = null; this.updateUI(); return; }
      if (data.max_uses && data.used_count >= data.max_uses) { status.innerHTML = '<span class="text-danger">❌ Лимит исчерпан</span>'; Store.appliedPromo = null; return; }
      if (data.expires_at && new Date(data.expires_at) < new Date()) { status.innerHTML = '<span class="text-danger">❌ Промокод истёк</span>'; Store.appliedPromo = null; return; }
      Store.appliedPromo = data;
      status.innerHTML = `<span class="text-success">✅ Скидка ${data.discount_percent}% применена!</span>`;
      this.updateUI();
      Utils.toast(`🎁 Скидка ${data.discount_percent}% активирована!`, "success");
    } catch (e) {
      status.innerHTML = '<span class="text-danger">❌ Ошибка проверки</span>';
    }
  },

  async checkout() {
    const btn = Utils.$("checkout-btn");
    if (!btn || Store.isLoading) return;
    if (!Utils.$("agree-check")?.checked) return Utils.toast("Примите условия оферты", "error");
    if (!Store.user) return Utils.toast("Войдите в аккаунт", "error");
    if (!Store.cart.length) return Utils.toast("Корзина пуста", "error");
    if (!Store.pvz.city || !Store.pvz.addr) {
      TapkiDrop.openPVZ();
      return Utils.toast("Укажите адрес доставки", "error");
    }

    Store.isLoading = true;
    btn.disabled = true;
    btn.textContent = "⏳ Оформление...";

    const timeout = setTimeout(() => {
      Store.isLoading = false;
      btn.disabled = false;
      btn.textContent = "Оформить заказ";
      Utils.toast("⏱️ Превышено время. Попробуйте снова.", "error");
    }, 30000);

    try {
      let total = Store.cart.reduce((s, i) => s + Number(i.price) * (i.qty || 1), 0);
      let discount = 0;
      if (Store.appliedPromo) {
        discount = Math.round(total * Store.appliedPromo.discount_percent / 100);
        total -= discount;
      }
      const items = Store.cart.map(i => `${i.name}${i.size ? ` (${i.size})` : ''} ×${i.qty}`).join(", ");

      const { data: order, error: orderErr } = await sb.from("orders").insert({
        user_email: Store.user.email,
        items,
        total: `${total.toLocaleString("ru")} ₽`,
        address: `${Store.pvz.city}, ${Store.pvz.addr}`,
        status: "pending",
        promo_code: Store.appliedPromo?.code || null,
        discount: discount || 0
      }).select().single();

      if (orderErr) throw orderErr;

      if (Store.appliedPromo) {
        await sb.from("promo_codes").update({ used_count: Store.appliedPromo.used_count + 1 }).eq("id", Store.appliedPromo.id);
        Store.appliedPromo = null;
      }

      fetch(`https://api.telegram.org/bot${CONFIG.tgToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CONFIG.tgChat,
          text: `📦 ЗАКАЗ #${order.id.slice(0,6)}\n👤 ${order.user_email}\n🛍 ${order.items}\n💰 ${order.total}${discount > 0 ? `\n🎁 Скидка: -${discount}₽` : ''}\n📍 ${order.address}`
        })
      }).catch(() => {});

      Store.cart = [];
      Store.save("cart", Store.cart);
      this.updateUI();
      Utils.toast("✅ Заказ оформлен!", "success");
      setTimeout(() => TapkiDrop.go("my-orders"), 600);
    } catch (e) {
      console.error("[CHECKOUT]", e);
      Utils.toast("❌ " + Utils.ruError(e), "error");
    } finally {
      clearTimeout(timeout);
      Store.isLoading = false;
      if (btn) { btn.disabled = false; btn.textContent = "Оформить заказ"; }
    }
  }
};
window.Cart = Cart;

// --- WISHLIST MODULE ---
const Wishlist = {
  toggleCard(id, btn) {
    const p = Store.products.find(x => x.id === id);
    if (!p) return;
    const idx = Store.wishlist.findIndex(w => w.id === id);
    if (idx >= 0) {
      Store.wishlist.splice(idx, 1);
      if (btn) { btn.classList.remove("active"); btn.querySelector("i").className = "fa-regular fa-heart"; }
      Utils.toast("💔 Убрано из избранного", "info");
    } else {
      Store.wishlist.push(p);
      if (btn) { btn.classList.add("active"); btn.querySelector("i").className = "fa-solid fa-heart"; }
      Utils.toast("❤️ Добавлено в избранное", "success");
    }
    Store.save("wishlist", Store.wishlist);
  },

  toggle() {
    if (!Store.currentProduct) return;
    const id = Store.currentProduct.id;
    // Use null for btn so toggleCard handles icon via wishlist-icon
    this.toggleCard(id, null);
    const wi = Utils.$("wishlist-icon");
    if (wi) wi.className = `fa-${Store.wishlist.some(w => w.id === id) ? 'solid' : 'regular'} fa-heart`;
  },

  render() {
    const grid = Utils.$("wishlist-grid"), empty = Utils.$("wishlist-empty");
    if (!grid || !empty) return;
    if (!Store.wishlist.length) {
      grid.style.display = "none";
      empty.style.display = "block";
      return;
    }
    empty.style.display = "none";
    grid.style.display = "grid";
    grid.innerHTML = Store.wishlist.map(Render.card).join("");
    setTimeout(() => {
      document.querySelectorAll(".reveal:not(.visible)").forEach(el => revealObserver.observe(el));
    }, 50);
  }
};
window.Wishlist = Wishlist;

// --- AUTH MODULE ---
const Auth = {
  async loadProfile(user) {
    if (!user?.id) return;
    try {
      const { data } = await sb.from("profiles").select("*").eq("id", user.id).single();
      Store.profile = data || { email: user.email, full_name: user.email.split("@")[0], is_admin: false };
    } catch (e) {
      Store.profile = { email: user.email, full_name: user.email.split("@")[0], is_admin: false };
    }
    this.updateUI();
  },

  updateUI() {
    const af = Utils.$("auth-flow");
    const pa = Utils.$("profile-acts");
    const pn = Utils.$("profile-display-name");
    const pe = Utils.$("profile-email");
    const am = Utils.$("admin-menu");

    if (af) af.style.display = Store.user ? "none" : "block";
    if (pa) pa.style.display = Store.user ? "flex" : "none";

    if (Store.user) {
      const isAdmin = Store.profile?.is_admin === true || CONFIG.adminEmails.includes(Store.user.email);
      if (pn) pn.textContent = Store.profile?.full_name || Store.user.email.split("@")[0];
      if (pe) pe.textContent = Store.user.email;
      if (am) am.style.display = isAdmin ? "flex" : "none";
    } else {
      Store.profile = null;
      if (pn) pn.textContent = "Гость";
      if (pe) pe.textContent = "Войдите в аккаунт";
      if (am) am.style.display = "none";
    }
    Cart.updateUI();
  },

  async handleLogin(e) {
    e.preventDefault();
    const em  = Utils.$("email-in")?.value.trim();
    const pw  = Utils.$("pass-in")?.value;
    const err = Utils.$("auth-err");
    const btn = Utils.$("auth-btn");
    if (!err || !btn) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      err.textContent = "Неверный email";
      err.style.display = "block";
      return;
    }
    if (pw.length < 6) {
      err.textContent = "Пароль минимум 6 символов";
      err.style.display = "block";
      return;
    }

    err.style.display = "none";
    btn.disabled = true;
    const isLogin = document.querySelector(".tab.active")?.dataset.tab === "login";
    btn.textContent = "⏳...";

    const timeout = setTimeout(() => {
      btn.disabled = false;
      btn.textContent = isLogin ? "Войти" : "Регистрация";
      Utils.toast("⏱️ Сервер не отвечает. Проверьте интернет.", "error");
    }, 15000);

    try {
      const res = isLogin
        ? await sb.auth.signInWithPassword({ email: em, password: pw })
        : await sb.auth.signUp({ email: em, password: pw });

      if (res.error) throw res.error;

      if (res.data?.user) {
        Store.user = res.data.user;
        await this.loadProfile(Store.user);
        Store.loadUserData();
        this.updateUI();
      }
      Utils.toast(isLogin ? "✅ С возвращением!" : "✅ Аккаунт создан!", "success");
    } catch (e) {
      err.textContent = Utils.ruError(e);
      err.style.display = "block";
      Utils.toast("❌ " + err.textContent, "error");
    } finally {
      clearTimeout(timeout);
      btn.disabled = false;
      btn.textContent = isLogin ? "Войти" : "Регистрация";
    }
  },

  async logout() {
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
  }
};

// --- PRODUCTS LOADER ---
async function loadProducts() {
  if (Store.isLoading) return;
  Store.isLoading = true;
  try {
    const { data, error } = await sb.from("products").select("*").order("created_at", { ascending: false });
    if (error || !data || data.length === 0) {
      console.warn("[LOAD PROD] Fallback to mock data:", error);
      Store.products = MOCK_PRODUCTS;
    } else {
      Store.products = data;
    }
  } catch (e) {
    console.error("[LOAD PROD FALLBACK]", e);
    Store.products = MOCK_PRODUCTS;
  } finally {
    Store.filteredProducts = Store.products;
    Render.products(Store.products, "both");
    Store.isLoading = false;
  }
}

// --- ADMIN MODULE ---
const Admin = {
  async load() {
    if (!Store.user) return;
    try {
      const [ordRes, prodRes, revRes, totalRes, promoRes] = await Promise.all([
        sb.from("orders").select("*", { count: "exact" }),
        sb.from("products").select("*").order("created_at", { ascending: false }),
        sb.from("reviews").select("*", { count: "exact", head: true }),
        sb.from("orders").select("total"),
        sb.from("promo_codes").select("*").order("created_at", { ascending: false })
      ]);

      if (prodRes.error) throw prodRes.error;
      window._adminProducts = prodRes.data || [];

      const s1 = Utils.$("st-orders"); if (s1) s1.textContent = ordRes.data?.length || 0;
      const s2 = Utils.$("st-prods");  if (s2) s2.textContent = window._adminProducts.length;
      const s3 = Utils.$("st-reviews"); if (s3) s3.textContent = revRes.count || 0;
      const s4 = Utils.$("st-rev");
      if (s4) s4.textContent = `${(totalRes.data?.reduce((s, o) => s + (parseFloat(String(o.total).replace(/[^0-9.]/g, "")) || 0), 0) || 0).toLocaleString("ru")} ₽`;

      const promoList = Utils.$("promo-list");
      if (promoList) {
        promoList.innerHTML = promoRes.data?.map(p => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border-light)">
            <div><b>${p.code}</b> — ${p.discount_percent}%<br><small class="text-muted">Использовано: ${p.used_count}${p.max_uses ? '/'+p.max_uses : ''}</small></div>
            <button class="btn-sm btn--danger" onclick="Admin.deletePromo('${p.id}')">🗑</button>
          </div>`).join("") || '<p class="text-muted">Нет промокодов</p>';
      }

      const statuses = ["pending","paid","processing","shipped","delivered","cancelled"];
      const labels   = { pending:"Ожидает", paid:"Оплачен", processing:"Собирается", shipped:"В пути", delivered:"Доставлен", cancelled:"Отменён" };
      const ol = Utils.$("admin-orders-list");
      if (ol) {
        ol.innerHTML = ordRes.data?.map(o => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--border-light);gap:10px;flex-wrap:wrap">
            <span>#${(o.id||"").slice(0,6)}<br><small class="text-muted">${o.user_email}</small></span>
            <select onchange="Admin.updateOrderStatus('${o.id}',this.value)" class="input" style="width:auto;margin:0">
              ${statuses.map(s => `<option value="${s}" ${s===o.status?'selected':''}>${labels[s]}</option>`).join("")}
            </select>
            <button onclick="Admin.deleteOrder('${o.id}')" class="btn-sm btn--danger">🗑</button>
          </div>`).join("") || '<p class="text-muted">Нет заказов</p>';
      }

      const ap = Utils.$("admin-prods");
      if (ap) {
        ap.innerHTML = window._adminProducts.map(p => {
          const imgs  = Array.isArray(p.images) ? p.images : (p.image_url ? [p.image_url] : []);
          const thumb = imgs[0] || '';
          return `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--border-light);gap:10px">
              <div style="display:flex;align-items:center;gap:10px;overflow:hidden;flex:1">
                ${thumb ? `<img src="${thumb}" style="width:44px;height:44px;border-radius:10px;object-fit:cover;flex-shrink:0;">` : ''}
                <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.name}<br><small class="text-muted">${Utils.formatPrice(p.price)}</small></span>
              </div>
              <div style="display:flex;gap:6px;flex-shrink:0">
                <button onclick="Admin.editProd('${p.id}')" class="btn-sm btn--primary">✏️</button>
                <button onclick="Admin.delProd('${p.id}')" class="btn-sm btn--danger">🗑</button>
              </div>
            </div>`;
        }).join("") || '<p class="text-muted">Нет товаров</p>';
      }
    } catch (e) {
      console.error("[ADMIN LOAD]", e);
      Utils.toast("❌ " + Utils.ruError(e), "error");
    }
  },

  async createPromo() {
    const code     = Utils.$("promo-new-code")?.value.trim().toUpperCase();
    const discount = Number(Utils.$("promo-new-discount")?.value);
    const maxUses  = Number(Utils.$("promo-new-uses")?.value) || null;
    if (!code || !discount) return Utils.toast("Заполните код и %", "error");
    try {
      await sb.from("promo_codes").insert({ code, discount_percent: discount, max_uses: maxUses });
      Utils.toast("✅ Промокод создан", "success");
      ["promo-new-code","promo-new-discount","promo-new-uses"].forEach(id => { const el = Utils.$(id); if (el) el.value = ""; });
      await this.load();
    } catch (e) { Utils.toast("❌ " + Utils.ruError(e), "error"); }
  },

  async deletePromo(id) {
    if (!confirm("Удалить промокод?")) return;
    await sb.from("promo_codes").delete().eq("id", id);
    Utils.toast("🗑️ Удалён", "info");
    await this.load();
  },

  async updateOrderStatus(oid, st) {
    try {
      await sb.from("orders").update({ status: st }).eq("id", oid);
      Utils.toast("✅ Статус обновлён", "success");
      await this.load();
      await Orders.load();
    } catch (e) { Utils.toast("❌ " + Utils.ruError(e), "error"); }
  },

  async deleteOrder(id) {
    if (!confirm("Удалить заказ?")) return;
    await sb.from("orders").delete().eq("id", id);
    Utils.toast("🗑️ Заказ удалён", "info");
    await this.load();
  },

  editProd(id) {
    const p = window._adminProducts?.find(x => x.id === id);
    if (!p) return Utils.toast("Товар не найден", "error");
    Store.editProdId = id;
    const images = Array.isArray(p.images) ? p.images : (p.image_url ? [p.image_url] : []);
    Store._oldImages = [...images];

    const fields = { "add-name":p.name, "add-price":p.price, "add-old-price":p.old_price||"", "add-cat":p.category, "add-desc":p.description||"" };
    Object.entries(fields).forEach(([fid, val]) => { const el = Utils.$(fid); if (el) el.value = val; });

    const sz = Utils.$("add-sizes"); if (sz) sz.value = Array.isArray(p.sizes) ? p.sizes.join(", ") : (p.sizes || "");
    const hitCb = Utils.$("add-is-hit"); if (hitCb) hitCb.checked = !!p.is_hit;

    const pc = Utils.$("img-preview-container");
    if (pc) {
      pc.innerHTML = images.map((img, i) =>
        `<div style="position:relative;display:inline-block;margin:4px;">
          <img src="${img}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;">
          <button onclick="Admin.removeOldImage(${i})" style="position:absolute;top:-6px;right:-6px;background:var(--danger);color:white;border:none;border-radius:50%;width:20px;height:20px;font-size:12px;cursor:pointer;line-height:1;">×</button>
        </div>`
      ).join("");
      pc.style.display = images.length ? "block" : "none";
    }

    Utils.$("form-title").textContent  = "✏️ Редактирование: " + p.name;
    Utils.$("prod-action-btn").textContent = "💾 Сохранить";
    Utils.$("prod-cancel-btn").style.display = "block";
    TapkiDrop.go("admin");
  },

  removeOldImage(index) {
    Store._oldImages.splice(index, 1);
    const pc = Utils.$("img-preview-container");
    if (pc) {
      pc.innerHTML = Store._oldImages.map((img, i) =>
        `<div style="position:relative;display:inline-block;margin:4px;">
          <img src="${img}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;">
          <button onclick="Admin.removeOldImage(${i})" style="position:absolute;top:-6px;right:-6px;background:var(--danger);color:white;border:none;border-radius:50%;width:20px;height:20px;font-size:12px;cursor:pointer;line-height:1;">×</button>
        </div>`
      ).join("");
      pc.style.display = Store._oldImages.length ? "block" : "none";
    }
  },

  cancelEdit() {
    Store.editProdId = null; Store._oldImages = [];
    ["add-name","add-price","add-old-price","add-desc","add-sizes"].forEach(id => { const el = Utils.$(id); if (el) el.value = ""; });
    const f = Utils.$("add-file"); if (f) f.value = "";
    const hitCb = Utils.$("add-is-hit"); if (hitCb) hitCb.checked = false;
    const pc = Utils.$("img-preview-container"); if (pc) { pc.innerHTML = ""; pc.style.display = "none"; }
    const ft = Utils.$("form-title"); if (ft) ft.textContent = "➕ Добавить товар";
    const pb = Utils.$("prod-action-btn"); if (pb) pb.textContent = "Опубликовать";
    const cb = Utils.$("prod-cancel-btn"); if (cb) cb.style.display = "none";
  },

  async handleProdAction() {
    const n    = Utils.$("add-name")?.value.trim();
    const p    = Number(Utils.$("add-price")?.value);
    const oldP = Number(Utils.$("add-old-price")?.value) || null;
    const c    = Utils.$("add-cat")?.value;
    const s    = Utils.$("add-sizes")?.value;
    const d    = Utils.$("add-desc")?.value.trim();
    const isHit = Utils.$("add-is-hit")?.checked || false;
    const files = Utils.$("add-file")?.files;

    if (!n || !p || p <= 0) return Utils.toast("Заполните название и корректную цену", "error");

    const btn = Utils.$("prod-action-btn");
    if (!btn) return;
    btn.disabled = true;
    btn.textContent = "⏳ Обработка...";

    const timeout = setTimeout(() => {
      btn.disabled = false;
      btn.textContent = Store.editProdId ? "Сохранить" : "Опубликовать";
      Utils.toast("⏱️ Превышено время. Попробуйте снова.", "error");
    }, 60000);

    try {
      let images = [...Store._oldImages];
      if (files && files.length > 0) {
        const maxNew = 5 - images.length;
        const filesToUpload = Array.from(files).slice(0, maxNew);
        for (const file of filesToUpload) {
          if (!file.type.startsWith("image/")) continue;
          const compressed = await Utils.compressImage(file);
          const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
          const { error: upErr } = await sb.storage.from(CONFIG.storageBucket).upload(fileName, compressed, { contentType: "image/jpeg" });
          if (upErr) throw upErr;
          const { data: urlData } = sb.storage.from(CONFIG.storageBucket).getPublicUrl(fileName);
          images.push(urlData.publicUrl);
        }
      }

      if (images.length === 0) {
        btn.disabled = false;
        btn.textContent = Store.editProdId ? "Сохранить" : "Опубликовать";
        clearTimeout(timeout);
        return Utils.toast("Добавьте хотя бы одно фото", "error");
      }

      const payload = {
        name: n, price: p, old_price: oldP, category: c,
        sizes: s.split(",").map(x => x.trim()).filter(Boolean),
        images, image_url: images[0], description: d, is_hit: isHit
      };

      let dbErr;
      if (Store.editProdId) {
        const res = await sb.from("products").update(payload).eq("id", Store.editProdId);
        dbErr = res.error;
      } else {
        const res = await sb.from("products").insert(payload);
        dbErr = res.error;
      }
      if (dbErr) throw dbErr;

      Utils.toast("✅ " + (Store.editProdId ? "Обновлено" : "Опубликовано"), "success");
      this.cancelEdit();
      await loadProducts();
      await this.load();
    } catch (e) {
      console.error("[PROD FAIL]", e);
      Utils.toast("❌ " + Utils.ruError(e), "error");
    } finally {
      clearTimeout(timeout);
      if (btn) { btn.disabled = false; btn.textContent = Store.editProdId ? "Сохранить" : "Опубликовать"; }
    }
  },

  async delProd(id) {
    if (!confirm("Удалить товар? Все фото будут удалены.")) return;
    try {
      const p = window._adminProducts?.find(x => x.id === id);
      if (p) {
        const imgs = Array.isArray(p.images) ? p.images : (p.image_url ? [p.image_url] : []);
        for (const imgUrl of imgs) {
          const path = decodeURIComponent(imgUrl.split(`/storage/v1/object/public/${CONFIG.storageBucket}/`)[1]);
          if (path) await sb.storage.from(CONFIG.storageBucket).remove([path]).catch(() => {});
        }
      }
      const res = await sb.from("products").delete().eq("id", id);
      if (res.error) throw res.error;
      Utils.toast("🗑️ Удалено", "info");
      await loadProducts();
      await this.load();
    } catch (e) {
      console.error("[DELETE]", e);
      Utils.toast("❌ " + Utils.ruError(e), "error");
    }
  }
};
window.Admin = Admin;

// --- ORDERS MODULE ---
const Orders = {
  async load() {
    if (!Store.user) return;
    const list = Utils.$("my-orders-list");
    if (!list) return;
    list.innerHTML = '<div class="loading">Загрузка</div>';
    try {
      const { data, error } = await sb.from("orders").select("*").eq("user_email", Store.user.email).order("created_at", { ascending: false });
      if (error) throw error;
      const statuses = { pending:"⏳ Ожидает оплаты", paid:"✅ Оплачен", processing:"📦 Собирается", shipped:"🚚 В пути", delivered:"🏠 Доставлен", cancelled:"❌ Отменён" };
      list.innerHTML = data?.length
        ? data.map(o => `
            <div class="order-card card" style="padding:20px;margin-bottom:12px">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                <b>#${o.id.slice(0,6)}</b>
                <span>${statuses[o.status] || o.status}</span>
              </div>
              <p class="text-muted" style="font-size:0.9rem;margin-bottom:8px">${o.items}</p>
              <div style="display:flex;justify-content:space-between;font-weight:700">
                <span class="text-muted" style="font-size:0.85rem">${o.created_at?.slice(0,10)}</span>
                <span>${o.total}</span>
              </div>
            </div>`).join("")
        : '<p class="text-muted" style="text-align:center;padding:40px">Нет заказов</p>';
    } catch (e) {
      list.innerHTML = '<p class="text-danger" style="text-align:center;padding:40px">Ошибка загрузки</p>';
    }
  }
};
window.Orders = Orders;

// --- REVIEWS MODULE ---
const Reviews = {
  async load(pid) {
    const l = Utils.$("reviews-list");
    if (!l) return;
    try {
      const res = await sb.from("reviews").select("*,profiles(full_name)").eq("product_id", pid).order("created_at", { ascending: false });
      l.innerHTML = res.data?.length
        ? res.data.map(x => `
            <div class="review-card">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <b>${x.profiles?.full_name || x.user_email?.split("@")[0] || "User"}</b>
                <span style="color:#f59e0b">${"⭐".repeat(x.rating)}</span>
              </div>
              <p style="margin-top:8px;color:var(--text-secondary)">${x.comment}</p>
              ${Store.user && CONFIG.adminEmails.includes(Store.user.email)
                ? `<button onclick="Reviews.delete('${x.id}')" class="btn-sm btn--danger" style="margin-top:8px">Удалить</button>`
                : ''}
            </div>`).join("")
        : '<p class="text-muted">Нет отзывов. Будьте первым!</p>';
    } catch (e) {
      console.error("[REVIEWS]", e);
    }
  },

  async submit(e) {
    e.preventDefault();
    if (!Store.user) return Utils.toast("Войдите в аккаунт", "error");
    const r = Number(Utils.$("review-rating").value);
    const c = Utils.$("review-comment")?.value.trim();
    if (!c) return Utils.toast("Напишите текст отзыва", "error");
    try {
      await sb.from("reviews").insert({
        product_id: Store.currentProduct.id,
        user_id: Store.user.id,
        user_email: Store.user.email,
        rating: r,
        comment: c
      });
      Utils.$("review-comment").value = "";
      await this.load(Store.currentProduct.id);
      Utils.toast("✅ Спасибо за отзыв!", "success");
    } catch (e) {
      Utils.toast("❌ " + Utils.ruError(e), "error");
    }
  },

  async delete(id) {
    if (!confirm("Удалить отзыв?")) return;
    await sb.from("reviews").delete().eq("id", id);
    await this.load(Store.currentProduct.id);
  }
};
window.Reviews = Reviews;

// --- REVEAL OBSERVER (module-level so go() can reuse it) ---
let revealObserver;

// --- EVENT LISTENERS SETUP ---
function setupEventListeners() {
  // Central delegation (FIX #1)
  setupGlobalDelegation();

  // Auth Form
  Utils.$("auth-form")?.addEventListener("submit", (e) => Auth.handleLogin(e));
  Utils.$("logout-btn")?.addEventListener("click", () => Auth.logout());

  // Review Form
  Utils.$("review-form")?.addEventListener("submit", (e) => Reviews.submit(e));

  // Search with debounce
  let searchTimer;
  const runSearch = (q) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      const term = q.toLowerCase().trim();
      if (!term) {
        Render.products(Store.products, "both");
        return;
      }
      const results = Store.products.filter(p =>
        p.name.toLowerCase().includes(term) ||
        (p.description || "").toLowerCase().includes(term)
      );
      if (!Utils.$("catalog").classList.contains("active")) TapkiDrop.go("catalog");
      Render.products(results, "catalog");
    }, 300);
  };

  Utils.$("search-input")?.addEventListener("input", e => runSearch(e.target.value));

  // FIX #8 — mobile search now syncs bidirectionally
  const mobileSearch  = Utils.$("search-input-mobile");
  const desktopSearch = Utils.$("search-input");
  if (mobileSearch && desktopSearch) {
    mobileSearch.addEventListener("input", e => {
      desktopSearch.value = e.target.value;
      runSearch(e.target.value);
    });
  }

  // File Preview in Admin
  Utils.$("add-file")?.addEventListener("change", function(e) {
    const files = e.target.files;
    const pc    = Utils.$("img-preview-container");
    if (files && files.length > 0 && pc) {
      pc.innerHTML = Array.from(files).slice(0, 5).map(f =>
        `<img src="${URL.createObjectURL(f)}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;margin:4px;">`
      ).join("");
      pc.style.display = "block";
    } else if (pc) {
      pc.style.display = "none";
    }
  });

  // Logo click → home
  document.querySelector(".logo")?.addEventListener("click", () => TapkiDrop.go("home"));
  document.querySelector(".logo")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") TapkiDrop.go("home");
  });

  // Global Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      Cart.closeDrawer();
      TapkiDrop.closeChat();
      TapkiDrop.closeModal();
      TapkiDrop.closePVZ();
    }
  });

  // Reveal on scroll
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));
}

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", async () => {
  console.log("[OK] TapkiDrop v19.1 FIXED ready");
  Store.init();
  setupEventListeners();

  // Show home page immediately
  TapkiDrop.go("home");

  try {
    const { data: { session } } = await Promise.race([
      sb.auth.getSession(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 5000))
    ]);
    if (session?.user) {
      Store.user = session.user;
      await Auth.loadProfile(Store.user);
      Store.loadUserData();
    }
  } catch (e) {
    console.warn("[SESSION]", e);
  }

  Auth.updateUI();
  await loadProducts();
  Cart.updateUI();
});
