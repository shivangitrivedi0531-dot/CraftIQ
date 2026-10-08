import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CURATED_TUTORIALS } from "../../data/curatedTutorials";

const BACKEND_URLS = [
  "http://127.0.0.1:8001",
  "http://localhost:8001",
  "http://127.0.0.1:8000",
  "http://localhost:8000"
];

const CRAFT_CATEGORIES = [
  { id: "resin", label: "Resin Art", icon: "🧪", searchKey: "resin" },
  { id: "candle", label: "Candle Making", icon: "🕯️", searchKey: "candle" },
  { id: "crochet", label: "Crochet & Yarn", icon: "🧶", searchKey: "crochet" },
  { id: "clay", label: "Clay Sculpting", icon: "🏺", searchKey: "clay" },
  { id: "pipe-cleaner", label: "Pipe Cleaner", icon: "🌸", searchKey: "pipe cleaner" }
];

const LEVEL_COLORS = {
  Beginner: "bg-emerald-50 text-emerald-800 border-emerald-200",
  Intermediate: "bg-amber-50 text-amber-800 border-amber-200",
  Advanced: "bg-indigo-50 text-indigo-800 border-indigo-200",
  Masterclass: "bg-rose-50 text-rose-800 border-rose-200",
  "All Levels": "bg-stone-50 text-stone-700 border-stone-200"
};

const DEFAULT_ROADMAPS = {
  resin: [
    { step: 1, title: "Safety & 2:1 Ratio Weighing", desc: "Nitrile gloves, respirator mask and precision digital weighing scales." },
    { step: 2, title: "Silicone Mold Casting", desc: "Bubble popping with butane torches, translucent tints & floral embedding." },
    { step: 3, title: "Cell Lacing & Ocean Waves", desc: "White paste pigment, 45° heat gun angling and layered transparent pours." },
    { step: 4, title: "Curing, Sanding & Top Glaze", desc: "48-hr full cure, wet sanding up to 3000 grit and mirror doming finish." }
  ],
  candle: [
    { step: 1, title: "Double-Boiler Wax Melting", desc: "Monitor soy/beeswax temperatures at 80°C - 85°C with digital thermometers." },
    { step: 2, title: "Wick Sizing & Jar Centering", desc: "Selecting cotton vs wooden wicks with glue dots and stabilizer clips." },
    { step: 3, title: "Fragrance Oil Blending", desc: "6-10% scent load added at 70°C and stirred gently for 2 minutes." },
    { step: 4, title: "Cooling & Surface Smoothing", desc: "Controlled cooling at 24°C, heat gun touch-ups and 14-day curing." }
  ],
  crochet: [
    { step: 1, title: "Grips, Slip Knot & Foundation", desc: "Knife vs pencil grip, pinky tension control and foundation chains." },
    { step: 2, title: "Core Stitches (SC, HDC, DC)", desc: "Mastering single, half-double and double crochet with straight edges." },
    { step: 3, title: "Magic Ring & 3D Amigurumi", desc: "Continuous spiral rounds, invisible decreases and polyester fiberfill." },
    { step: 4, title: "Pattern Reading & Eternal Flowers", desc: "Reading US/UK brackets, floral stem assembly and petal blocking." }
  ],
  clay: [
    { step: 1, title: "Conditioning & Armature Wire", desc: "Conditioning clay rollers, aluminum wire skeletal frames and foil cores." },
    { step: 2, title: "Facial Planes & Wedge Blocking", desc: "Axel wedge blocking, skull proportions, ball styluses and texture tools." },
    { step: 3, title: "Traditional Lippan Mud Art", desc: "MDF grid geometry, dough coil piping, spoon rolling and setting abhla mirrors." },
    { step: 4, title: "Curing, Gesso & Weatherproof Varnish", desc: "Oven calibration, gesso sealing, acrylic highlights and UV topcoat." }
  ],
  "pipe-cleaner": [
    { step: 1, title: "Wire Bending & Petal Loops", desc: "High-density chenille wire bending, flattening velvet pile and petal shaping." },
    { step: 2, title: "Flower Core & Hot Glue Assembly", desc: "Stamen/pistil rolling, layering multi-tier petals and glue gun bonding." },
    { step: 3, title: "Stem Wrapping & Green Calyx", desc: "Stretching floral wax tape, mounting dowel rods and securing leaf sprays." },
    { step: 4, title: "Korean Aesthetic Bouquet Packaging", desc: "Waterproof frosted cellophane folds, contrasting liners and silk ribbon bows." }
  ]
};

const DEFAULT_PRO_TIPS = {
  resin: [
    "Work strictly between 24°C–28°C for optimal bubble rise and clear chemical curing.",
    "Never use water-based food dyes — moisture permanently clouds and softens epoxy resin.",
    "Allow 48 hours for full cure before aggressive sanding or packaging heavy preservation orders."
  ],
  candle: [
    "Pour soy wax between 55°C–60°C to eliminate frosting, sinkholes, and glass adhesion gaps.",
    "Always trim wicks to 1/4 inch before lighting to prevent smoking, soot, and tunneling.",
    "Allow scented soy candles to cure 7 to 14 days in dark cupboards for maximum scent throw."
  ],
  crochet: [
    "Use light-colored worsted yarn (size 4) and a 4.5mm or 5mm ergonomic hook to start.",
    "Count your stitches at the end of every row to prevent unintentional tapering edges.",
    "Use locking stitch markers in spiral rounds to keep track of the first stitch."
  ],
  clay: [
    "Use an independent oven thermometer; domestic oven dials often run 15°C hotter than indicated.",
    "Dust your hands and table with talcum powder or cornstarch when rolling Lippan clay dough.",
    "Seal air-dry clay pieces with 2 thin coats of gesso before applying acrylic paints and mirrors."
  ],
  "pipe-cleaner": [
    "Use high-density 6mm or 9mm chenille stems so bending wire won't expose inner metallic cores.",
    "Slightly stretch your floral tape while wrapping — stretching activates the wax adhesive.",
    "Gently fluff the velvet pile with a soft spoolie brush for natural velvety flower textures."
  ]
};

export default function TutorialsTab({ category }) {
  const normPropId = category?.id?.toLowerCase() || "resin";
  const [selectedCategory, setSelectedCategory] = useState(normPropId);
  const [tutorials, setTutorials] = useState(CURATED_TUTORIALS[normPropId] || []);
  const [learningPath, setLearningPath] = useState(DEFAULT_ROADMAPS[normPropId] || []);
  const [proTips, setProTips] = useState(DEFAULT_PRO_TIPS[normPropId] || []);
  const [activeLevel, setActiveLevel] = useState("All");
  const [loading, setLoading] = useState(false);
  const [activeVideoModal, setActiveVideoModal] = useState(null);

  // Sync state if category prop changes
  useEffect(() => {
    if (category?.id && category.id !== selectedCategory) {
      setSelectedCategory(category.id);
    }
  }, [category?.id]);

  // Synchronize with URL and fetch data whenever selectedCategory changes
  useEffect(() => {
    const fallbackList = CURATED_TUTORIALS[selectedCategory] || CURATED_TUTORIALS.resin;
    setTutorials(fallbackList);
    setLearningPath(DEFAULT_ROADMAPS[selectedCategory] || DEFAULT_ROADMAPS.resin);
    setProTips(DEFAULT_PRO_TIPS[selectedCategory] || DEFAULT_PRO_TIPS.resin);
    setActiveLevel("All");

    let isMounted = true;

    async function loadCategoryTutorials() {
      setLoading(true);
      for (const base of BACKEND_URLS) {
        try {
          const res = await fetch(`${base}/api/tutorials/${selectedCategory}`);
          if (res.ok) {
            const data = await res.json();
            if (isMounted && data.tutorials && data.tutorials.length > 0) {
              setTutorials(data.tutorials);
              if (data.learningPath) setLearningPath(data.learningPath);
              if (data.proTips) setProTips(data.proTips);
              setLoading(false);
              return;
            }
          }
        } catch {
          // continue to next backend fallback
        }
      }
      if (isMounted) setLoading(false);
    }

    loadCategoryTutorials();

    return () => {
      isMounted = false;
    };
  }, [selectedCategory]);

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      params.set("category", catId);
      params.set("tab", "tutorials");
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.pushState({ path: newUrl }, "", newUrl);
    }
  };

  const currentCatObj =
    CRAFT_CATEGORIES.find((c) => c.id === selectedCategory) || CRAFT_CATEGORIES[0];

  const filteredTutorials = tutorials.filter((v) => {
    if (activeLevel === "All") return true;
    return v.level?.toLowerCase() === activeLevel.toLowerCase();
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* ------------------------------------------------------------- */}
      {/* HERO SECTION                                                  */}
      {/* ------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FFF4EE] via-[#FDF1F3] to-[#FCEEE8] border border-[#F5DDD5] p-6 md:p-8 shadow-sm"
      >
        <div className="absolute right-0 top-0 bottom-0 w-1/3 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-200 via-rose-100 to-transparent"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#A84A38]">
                STEP-BY-STEP WORKSHOP LEARNING
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-[#A84A38] text-[10px] font-bold border border-rose-200">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                Real YouTube Video Guides
              </span>
            </div>

            <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-[#4A151B]">
              Masterclass Video Guides
            </h1>

            <p className="text-base md:text-lg text-[#6E2A20] font-medium">
              Curated, high-definition tutorial masterclasses for{" "}
              <strong className="text-[#A84A38]">{currentCatObj.label}</strong>
            </p>

            <p className="text-xs md:text-sm text-[#8C5D53] max-w-xl">
              Watch real expert demonstrations, technique breakdowns, mixing ratios, and professional finish routines directly in the studio.
            </p>
          </div>

          {/* Category Switcher Pills */}
          <div className="shrink-0 space-y-2 bg-white/70 backdrop-blur-md p-3.5 rounded-2xl border border-[#F5DDD5] shadow-xs">
            <span className="text-[11px] font-bold text-[#8C5D53] uppercase tracking-wider block">
              Switch Craft Category:
            </span>
            <div className="flex flex-wrap gap-1.5 max-w-md">
              {CRAFT_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-[#A84A38] text-white shadow-sm scale-105"
                        : "bg-white/80 hover:bg-[#FFF4EE] text-[#6E2A20] border border-[#F5DDD5]"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ------------------------------------------------------------- */}
      {/* SKILL LEVEL CHOOSING BAR                                      */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-[#F5DDD5] px-5 py-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-[#8C5D53] uppercase tracking-wider mr-1">
            Skill Level:
          </span>
          {["All", "Beginner", "Intermediate", "Advanced", "Masterclass"].map((level) => {
            const active = activeLevel === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() => setActiveLevel(level)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-[#4A151B] text-white shadow-xs scale-105"
                    : "bg-[#FAF7F2] text-[#6E2A20] hover:bg-[#FFF4EE] border border-[#F5DDD5]"
                }`}
              >
                {level}
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION HEADER                                                */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center justify-between px-2 pt-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">{currentCatObj.icon}</span>
          <h2 className="text-sm md:text-base font-bold text-[#4A151B] tracking-wide">
            YouTube Video Guide for {currentCatObj.label}
          </h2>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* VIDEO CARDS GRID                                              */}
      {/* ------------------------------------------------------------- */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((sk) => (
            <div
              key={sk}
              className="rounded-3xl border border-[#F5DDD5] bg-white p-4 space-y-3 animate-pulse"
            >
              <div className="w-full aspect-video rounded-2xl bg-gray-200"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded-xl w-full"></div>
            </div>
          ))}
        </div>
      ) : filteredTutorials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredTutorials.map((video, idx) => {
            const levelClass = LEVEL_COLORS[video.level] || LEVEL_COLORS["All Levels"];
            return (
              <motion.div
                key={video.id || idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className="group rounded-3xl bg-white border border-[#F5DDD5] hover:border-[#E8B4A8] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Video Thumbnail & Play Trigger */}
                <div>
                  <div
                    onClick={() => setActiveVideoModal(video)}
                    className="relative w-full aspect-video bg-stone-900 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={video.thumbnail || `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                      alt={video.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
                      }}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-all"></div>

                    {/* Play Button Badge */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/90 group-hover:bg-[#A84A38] text-[#4A151B] group-hover:text-white shadow-lg flex items-center justify-center transition-all group-hover:scale-110">
                        <span className="text-xl ml-0.5">▶</span>
                      </div>
                    </div>

                    {/* Duration Badge */}
                    <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 text-white text-[11px] font-bold tracking-wider backdrop-blur-xs">
                      {video.duration || "12:30"}
                    </div>

                    {/* Topic Badge */}
                    {video.topic && (
                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-semibold tracking-wide backdrop-blur-xs max-w-[80%] truncate">
                        {video.topic}
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${levelClass}`}
                      >
                        {video.level || "Beginner"}
                      </span>
                      <span className="text-[11px] font-semibold text-[#8C5D53] flex items-center gap-1">
                        <span>👁️</span> {video.views || "50K+"}
                      </span>
                    </div>

                    <h3
                      onClick={() => setActiveVideoModal(video)}
                      className="font-bold text-xs md:text-sm text-[#4A151B] line-clamp-2 leading-snug group-hover:text-[#A84A38] transition-colors cursor-pointer"
                      title={video.title}
                    >
                      {video.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-[11px] text-[#6E2A20] font-semibold">
                      <span className="w-3.5 h-3.5 rounded-full bg-red-600 text-white text-[8px] flex items-center justify-center font-bold">
                        ▶
                      </span>
                      <span className="truncate">{video.channel || "Craft Creator"}</span>
                    </div>

                    {video.description && (
                      <p className="text-[11px] text-[#8C5D53] line-clamp-2 leading-relaxed">
                        {video.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 pt-0 space-y-2">
                  <button
                    type="button"
                    onClick={() => setActiveVideoModal(video)}
                    className="w-full py-2 px-3 rounded-xl bg-[#FFF4EE] hover:bg-[#FCEEE8] text-[#A84A38] hover:text-[#4A151B] font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-[#F5DDD5]"
                  >
                    <span>Watch In-App</span>
                    <span>▶</span>
                  </button>

                  <a
                    href={video.url || `https://www.youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-1 text-center text-[11px] font-medium text-[#8C5D53] hover:text-[#A84A38] transition-colors block"
                  >
                    Open on YouTube ↗
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 rounded-3xl border border-dashed border-[#F5DDD5] bg-white p-8">
          <span className="text-4xl block mb-2">📹</span>
          <h3 className="font-bold text-[#4A151B] text-base">No tutorials found for this skill level</h3>
          <p className="text-xs text-[#8C5D53] mt-1">
            Try choosing &quot;All&quot; to see all curated video guides.
          </p>
          <button
            type="button"
            onClick={() => setActiveLevel("All")}
            className="mt-4 px-4 py-2 bg-[#A84A38] text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            Show All Tutorials
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* GEMINI SUGGESTED LEARNING PATH & PRO TIPS                      */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Progressive Learning Roadmap (2 columns) */}
        <div className="lg:col-span-2 rounded-3xl bg-white border border-[#F5DDD5] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🗺️</span>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#4A151B]">
                Suggested Learning Roadmap: {currentCatObj.label}
              </h3>
              <p className="text-xs text-[#8C5D53]">
                Progress step-by-step from foundational mechanics to professional monetization.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            {learningPath.map((item) => (
              <div
                key={item.step}
                className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#F5DDD5]/80 space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#A84A38] text-white text-xs font-bold flex items-center justify-center">
                    {item.step}
                  </span>
                  <h4 className="font-bold text-xs md:text-sm text-[#4A151B]">
                    {item.title}
                  </h4>
                </div>
                <p className="text-xs text-[#6E2A20] leading-relaxed pl-8">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Pro Tips & Safety Checklist (1 column) */}
        <div className="rounded-3xl bg-gradient-to-br from-[#FFF4EE] to-[#FAF7F2] border border-[#F5DDD5] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">💡</span>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#4A151B]">
                Studio Workshop Tips
              </h3>
              <p className="text-xs text-[#8C5D53]">
                Essential safety & execution rules
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {proTips.map((tip, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white/90 border border-[#F5DDD5] text-xs text-[#6E2A20] flex items-start gap-2.5 leading-relaxed"
              >
                <span className="text-[#A84A38] font-bold text-sm">✓</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* IN-APP VIDEO PLAYER MODAL                                     */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {activeVideoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
            onClick={() => setActiveVideoModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#F5DDD5] space-y-0"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-[#FAF7F2] border-b border-[#F5DDD5]">
                <div className="flex items-center gap-2 max-w-[85%]">
                  <span className="w-3 h-3 rounded-full bg-red-600"></span>
                  <h3 className="font-bold text-sm md:text-base text-[#4A151B] truncate">
                    {activeVideoModal.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveVideoModal(null)}
                  className="w-8 h-8 rounded-full bg-white hover:bg-stone-200 border border-[#F5DDD5] text-stone-700 text-sm font-bold flex items-center justify-center cursor-pointer transition-all"
                >
                  ✕
                </button>
              </div>

              {/* 16:9 Responsive Video Iframe */}
              <div className="relative w-full aspect-video bg-black">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${activeVideoModal.id}?autoplay=1&rel=0`}
                  title={activeVideoModal.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>

              {/* Modal Footer Info */}
              <div className="p-6 bg-white space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-sm text-[#4A151B]">
                      {activeVideoModal.channel}
                    </p>
                    <p className="text-xs text-[#8C5D53]">
                      Duration: {activeVideoModal.duration} • Views: {activeVideoModal.views} • Level: {activeVideoModal.level}
                    </p>
                  </div>

                  <a
                    href={activeVideoModal.url || `https://www.youtube.com/watch?v=${activeVideoModal.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-[#A84A38] hover:bg-[#8F3B2C] text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                  >
                    <span>Watch Directly on YouTube</span>
                    <span>↗</span>
                  </a>
                </div>

                {activeVideoModal.description && (
                  <p className="text-xs text-[#6E2A20] leading-relaxed bg-[#FAF7F2] p-3.5 rounded-xl border border-[#F5DDD5]">
                    {activeVideoModal.description}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}