// src/data/dummyData.js

// ============ ANALYTICS DATA ============
export const DUMMY_ANALYTICS = {
  candle: {
    localMarketAverage: 450,
    demandTrend: 12,
    searchInterest: 78,
    demandOverTime: [
      { week: "W1", demand: 45 },
      { week: "W2", demand: 52 },
      { week: "W3", demand: 68 },
      { week: "W4", demand: 78 },
    ],
    weeklyProfitOpportunity: 1200,
  },
  resin: {
    localMarketAverage: 650,
    demandTrend: 18,
    searchInterest: 85,
    demandOverTime: [
      { week: "W1", demand: 40 },
      { week: "W2", demand: 55 },
      { week: "W3", demand: 72 },
      { week: "W4", demand: 85 },
    ],
    weeklyProfitOpportunity: 1800,
  },
  crochet: {
    localMarketAverage: 350,
    demandTrend: 8,
    searchInterest: 62,
    demandOverTime: [
      { week: "W1", demand: 38 },
      { week: "W2", demand: 45 },
      { week: "W3", demand: 55 },
      { week: "W4", demand: 62 },
    ],
    weeklyProfitOpportunity: 950,
  },
  "pipe-cleaner": {
    localMarketAverage: 200,
    demandTrend: 5,
    searchInterest: 45,
    demandOverTime: [
      { week: "W1", demand: 30 },
      { week: "W2", demand: 35 },
      { week: "W3", demand: 40 },
      { week: "W4", demand: 45 },
    ],
    weeklyProfitOpportunity: 600,
  },
  clay: {
    localMarketAverage: 380,
    demandTrend: 10,
    searchInterest: 70,
    demandOverTime: [
      { week: "W1", demand: 42 },
      { week: "W2", demand: 50 },
      { week: "W3", demand: 62 },
      { week: "W4", demand: 70 },
    ],
    weeklyProfitOpportunity: 1100,
  },
};

// ============ CALCULATOR MATERIALS ============
export const DUMMY_CALCULATOR_MATERIALS = {
  candle: [
    { name: "Soy Wax (per kg)", cost: 300 },
    { name: "Wick (per piece)", cost: 20 },
    { name: "Fragrance Oil (per ml)", cost: 5 },
    { name: "Container (per piece)", cost: 40 },
  ],
  resin: [
    { name: "Epoxy Resin (per liter)", cost: 800 },
    { name: "Hardener (per liter)", cost: 400 },
    { name: "Mold (per unit)", cost: 150 },
    { name: "Colorant (per gram)", cost: 2 },
  ],
  crochet: [
    { name: "Yarn (per 100g)", cost: 150 },
    { name: "Crochet Hook (per set)", cost: 200 },
    { name: "Stuffing (per 250g pack)", cost: 120 },
  ],
  "pipe-cleaner": [
    { name: "Pipe Cleaners (per 100 pcs)", cost: 50 },
    { name: "Googly Eyes (per 100)", cost: 30 },
  ],
  clay: [
    { name: "Air Dry Clay (per 500g)", cost: 120 },
    { name: "Polymer Clay (per 100g)", cost: 80 },
    { name: "Sculpting Tools (per set)", cost: 200 },
  ],
};

// ============ STORE LOCATOR ============
export const DUMMY_STORES = [
  { 
    name: "Art Supply Hub", 
    address: "Opp. Sabarmati, Ahmedabad", 
    distance: "2.3 km",
    lat: 23.1815,
    lng: 72.6369
  },
  { 
    name: "Craft Corner", 
    address: "CM Road, Ahmedabad", 
    distance: "3.1 km",
    lat: 23.0225,
    lng: 72.5714
  },
  { 
    name: "Maker's Gallery", 
    address: "Drive-In Road, Ahmedabad", 
    distance: "4.5 km",
    lat: 23.0330,
    lng: 72.5714
  },
  { 
    name: "Creative Studio", 
    address: "Ellis Bridge, Ahmedabad", 
    distance: "5.2 km",
    lat: 23.1976,
    lng: 72.5229
  },
];
// ============ SIMILAR ARTISTS ============
export const DUMMY_ARTISTS = [
  { handle: "@resin_dreams_", followers: "45.2K", category: "resin" },
  { handle: "@epoxy_magic", followers: "52.1K", category: "resin" },
  { handle: "@candle_cottage_", followers: "32.8K", category: "candle" },
  { handle: "@scent_stories", followers: "28.5K", category: "candle" },
  { handle: "@crochet_tales_", followers: "38.9K", category: "crochet" },
  { handle: "@yarn_love_", followers: "41.3K", category: "crochet" },
];

// ============ TUTORIALS ============
export const DUMMY_TUTORIALS = {
  candle: [
    { title: "Beginner Candle Making", link: "https://youtube.com/watch?v=...", thumbnail: "🎥" },
    { title: "Advanced Wick Sizing", link: "https://youtube.com/watch?v=...", thumbnail: "🎥" },
    { title: "Scent Blending Guide", link: "https://youtube.com/watch?v=...", thumbnail: "🎥" },
  ],
  resin: [
    { title: "Epoxy Resin Basics", link: "https://youtube.com/watch?v=...", thumbnail: "🎥" },
    { title: "UV Resin vs Epoxy", link: "https://youtube.com/watch?v=...", thumbnail: "🎥" },
  ],
  crochet: [
    { title: "Beginner Crochet Stitches", link: "https://youtube.com/watch?v=...", thumbnail: "🎥" },
    { title: "Amigurumi Basics", link: "https://youtube.com/watch?v=...", thumbnail: "🎥" },
  ],
  "pipe-cleaner": [
    { title: "Pipe Cleaner Crafts", link: "https://youtube.com/watch?v=...", thumbnail: "🎥" },
  ],
  clay: [
    { title: "Polymer Clay Basics", link: "https://youtube.com/watch?v=...", thumbnail: "🎥" },
    { title: "Air Dry Clay Techniques", link: "https://youtube.com/watch?v=...", thumbnail: "🎥" },
  ],
};

// ============ CHAT HISTORY ============
export const DUMMY_CHAT_HISTORY = {
  candle: [
    {
      date: "Today",
      messages: [
        { user: "How to price my candles?", ai: "Consider wax cost (₹300/kg), wick (₹20), fragrance (₹5/ml)..." },
        { user: "Best way to market?", ai: "Social media + Instagram reels work best for candle makers..." },
      ],
    },
    {
      date: "Yesterday",
      messages: [
        { user: "Best wax type?", ai: "Soy wax is popular because it's eco-friendly and holds fragrance well..." },
      ],
    },
  ],
  resin: [
    {
      date: "Today",
      messages: [
        { user: "Resin safety tips?", ai: "Always wear gloves, work in ventilated area, avoid skin contact..." },
      ],
    },
  ],
  crochet: [
    {
      date: "Today",
      messages: [
        { user: "How much should I charge?", ai: "Time cost + material cost. Average ₹200-500 for small items..." },
      ],
    },
  ],
  "pipe-cleaner": [],
  clay: [],
};

// ============ CHAT MESSAGES (for ChatPanel) ============
export const DUMMY_MESSAGES = [
  { id: 1, role: "assistant", text: "Hi! I'm your craft business assistant. Ask me about pricing, materials, or trends for this category." },
  { id: 2, role: "user", text: "What should I charge for a medium soy candle?" },
  { id: 3, role: "assistant", text: "Based on typical material costs and a healthy margin, most sellers price a medium soy candle between ₹350–₹550. Want me to break down the cost per candle?" },
];

// ============ DUMMY CHAT HISTORY (for ChatHistoryTab) ============
export const DUMMY_CHAT_HISTORY_ITEMS = [
  { id: "h1", date: "12 Aug 2026", preview: "Pricing question about scented candles" },
  { id: "h2", date: "9 Aug 2026", preview: "Wick size recommendations" },
  { id: "h3", date: "3 Aug 2026", preview: "Local market comparison for jar candles" },
];