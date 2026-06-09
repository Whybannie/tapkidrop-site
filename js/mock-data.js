// js/mock-data.js
// Временные товары для демонстрации дизайна v19
window.MOCK_PRODUCTS = [
  {
    id: "mock-1",
    name: "Nike Air Max Pulse Essential",
    price: 18990,
    old_price: 23990,
    category: "designer",
    description: "Легендарная модель с амортизирующей подошвой Air Max. Идеально для города и спорта.",
    sizes: ["40", "41", "42", "43", "44"],
    images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop"],
    image_url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop",
    is_hit: true,
    created_at: new Date().toISOString()
  },
  {
    id: "mock-2",
    name: "Adidas Ultraboost Light Running",
    price: 14500,
    old_price: null,
    category: "classics",
    description: "Самые легкие Ultraboost в истории. Возврат энергии Boost для каждого шага.",
    sizes: ["39", "40", "41", "42", "43"],
    images: ["https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?q=80&w=600&auto=format&fit=crop"],
    image_url: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?q=80&w=600&auto=format&fit=crop",
    is_hit: false,
    created_at: new Date().toISOString()
  },
  {
    id: "mock-3",
    name: "Air Jordan 1 Low OG White Red",
    price: 12990,
    old_price: null,
    category: "classics",
    description: "Классический силуэт в новой расцветке. Кожаный верх и культовый дизайн.",
    sizes: ["40", "41", "42", "43", "44", "45"],
    images: ["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&auto=format&fit=crop"],
    image_url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&auto=format&fit=crop",
    is_hit: false,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: "mock-4",
    name: "New Balance 550 White Green",
    price: 11200,
    old_price: 17200,
    category: "sale",
    description: "Ретро-баскетбольный стиль. Перфорированный кожаный верх и винтажная подошва.",
    sizes: ["36", "37", "38", "39", "40"],
    images: ["https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=600&auto=format&fit=crop"],
    image_url: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=600&auto=format&fit=crop",
    is_hit: false,
    created_at: new Date().toISOString()
  },
  {
    id: "mock-5",
    name: "Nike Dunk Low Panda Classic",
    price: 21990,
    old_price: null,
    category: "designer",
    description: "Самая популярная расцветка года. Черно-белая классика для любого гардероба.",
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    images: ["https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=600&auto=format&fit=crop"],
    image_url: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=600&auto=format&fit=crop",
    is_hit: true,
    created_at: new Date().toISOString()
  },
  {
    id: "mock-6",
    name: "Puma RS-X Reinvention Kids",
    price: 9990,
    old_price: null,
    category: "kids",
    description: "Яркие детские кроссовки с технологией RS. Легкие и удобные для активных игр.",
    sizes: ["28", "29", "30", "31", "32", "33"],
    images: ["https://images.unsplash.com/photo-1584735175315-9d5df23860e6?q=80&w=600&auto=format&fit=crop"],
    image_url: "https://images.unsplash.com/photo-1584735175315-9d5df23860e6?q=80&w=600&auto=format&fit=crop",
    is_hit: false,
    created_at: new Date().toISOString()
  }
];
