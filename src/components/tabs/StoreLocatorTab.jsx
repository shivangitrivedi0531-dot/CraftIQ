import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default marker icon paths in Vite / React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom active pin icon (Terracotta / Red marker)
const activeIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [26, 42],
  iconAnchor: [13, 42],
  popupAnchor: [1, -36],
  shadowSize: [41, 41]
});

// Default pin icon
const defaultIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Craft Category Options matching Analytics & Calculator tabs
const CRAFT_CATEGORIES = [
  { id: "resin", label: "Resin Art", icon: "🧪", subtitle: "Epoxy, Molds & Pigments" },
  { id: "candle", label: "Candle Making", icon: "🕯️", subtitle: "Waxes, Wicks & Scents" },
  { id: "crochet", label: "Crochet & Yarn", icon: "🧶", subtitle: "Yarns, Hooks & Needles" },
  { id: "clay", label: "Clay Sculpting", icon: "🏺", subtitle: "Polymer, Air-Dry & Tools" },
  { id: "pipe-cleaner", label: "Pipe Cleaner", icon: "🌸", subtitle: "Chenille Stems & Wire" },
];

// Helper to smoothly fly map to new center coordinates
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])) {
      map.flyTo(center, zoom || 14, { duration: 1.2 });
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }
  }, [center, zoom, map]);
  return null;
}

export default function StoreLocatorTab({ category }) {
  // Support reading category from URL query (?category=resin) or prop or default "resin"
  const getInitialCategory = () => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlCat = params.get("category");
      if (urlCat && CRAFT_CATEGORIES.some((c) => c.id === urlCat)) {
        return urlCat;
      }
    }
    if (typeof category === "object" && category?.id) return category.id;
    if (typeof category === "string" && CRAFT_CATEGORIES.some((c) => c.id === category)) {
      return category;
    }
    return "resin";
  };

  const [selectedCategory, setSelectedCategory] = useState(getInitialCategory);
  const [searchQuery, setSearchQuery] = useState("Paldi Ahmedabad");
  const [activeSearch, setActiveSearch] = useState("Paldi Ahmedabad");
  const [stores, setStores] = useState([]);
  const [mapCenter, setMapCenter] = useState([23.0134, 72.5624]); // Paldi Ahmedabad default
  const [mapZoom, setMapZoom] = useState(14);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [dataSource, setDataSource] = useState("gemini_ai_live");
  const markerRefs = useRef({});

  // Sync category changes with URL and state
  const handleCategoryChange = (newCatId) => {
    setSelectedCategory(newCatId);
    if (typeof window !== "undefined") {
      const newUrl = `${window.location.pathname}?category=${newCatId}`;
      window.history.pushState({ path: newUrl }, "", newUrl);
    }
  };

  // Sync if prop changes externally
  useEffect(() => {
    if (category) {
      const catId = typeof category === "object" && category?.id ? category.id : category;
      if (CRAFT_CATEGORIES.some((c) => c.id === catId)) {
        setSelectedCategory(catId);
      }
    }
  }, [category]);

  // Current category metadata
  const currentCatObj =
    CRAFT_CATEGORIES.find((c) => c.id === selectedCategory) || CRAFT_CATEGORIES[0];

  // Fetch stores on category change or initial load
  useEffect(() => {
    fetchStores(searchQuery, selectedCategory);
  }, [selectedCategory]);

  const fetchStores = async (queryToSearch, categoryToSearch) => {
    const targetQuery = (queryToSearch || searchQuery).trim();
    const targetCategory = categoryToSearch || selectedCategory;
    if (!targetQuery) return;

    setLoading(true);
    setError(null);
    setActiveSearch(targetQuery);

    try {
      let response;
      // Try backend port 8001 first, then fallback to 8000
      try {
        response = await fetch(
          `http://localhost:8001/api/stores/?location=${encodeURIComponent(targetQuery)}&category=${encodeURIComponent(targetCategory)}&radius_km=15`
        );
        if (!response.ok) throw new Error("Port 8001 returned status " + response.status);
      } catch (err8001) {
        response = await fetch(
          `http://localhost:8000/api/stores/?location=${encodeURIComponent(targetQuery)}&category=${encodeURIComponent(targetCategory)}&radius_km=15`
        );
        if (!response.ok) {
          throw new Error(`Server returned status ${response.status}`);
        }
      }

      const data = await response.json();
      const fetchedStores = data.stores || [];
      setStores(fetchedStores);
      setDataSource(data.source || "gemini_ai_live");

      if (data.center && data.center.lat && data.center.lng) {
        setMapCenter([data.center.lat, data.center.lng]);
        setMapZoom(14);
      } else if (fetchedStores.length > 0) {
        setMapCenter([fetchedStores[0].lat, fetchedStores[0].lng]);
        setMapZoom(14);
      }
      setSelectedStoreId(null);
    } catch (err) {
      console.error("Error fetching stores:", err);
      setError("Unable to connect to stores backend. Please ensure the backend server is running on port 8001.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStore = (store) => {
    setSelectedStoreId(store.id);
    setMapCenter([store.lat, store.lng]);
    setMapZoom(16);

    const marker = markerRefs.current[store.id];
    if (marker) {
      marker.openPopup();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans text-slate-800">
      {/* ------------------------------------------------------------- */}
      {/* TOP HERO BANNER (Matches Analytics & Calculator aesthetic)     */}
      {/* ------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FFF4EE] via-[#FDF1F3] to-[#FCEEE8] border border-[#F5DDD5] p-6 md:p-8 shadow-sm"
      >
        <div className="absolute right-0 top-0 bottom-0 w-1/3 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-200 via-orange-100 to-transparent"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#A84A38]">
                LOCAL RAW MATERIAL SOURCING
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {dataSource.includes("gemini") ? "Gemini AI Live Grounded" : "Verified Craft Directory"}
              </span>
            </div>

            <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-[#4A151B]">
              Artisan Supply Stores
            </h1>

            <p className="text-base md:text-lg text-[#6E2A20] font-medium">
              Locate authentic, specialized suppliers for your{" "}
              <strong className="text-[#A84A38]">{currentCatObj.label}</strong> projects
            </p>

            <p className="text-xs md:text-sm text-[#8C5D53] max-w-xl">
              Search any area or city across India to discover physically verified art and craft stores, 
              wholesale merchants, and raw material dealers with live coordinates and contact details.
            </p>
          </div>

          {/* Category Switcher Pills inside Hero */}
          <div className="shrink-0 space-y-2 bg-white/70 backdrop-blur-md p-3.5 rounded-2xl border border-[#F5DDD5] shadow-xs">
            <span className="text-[11px] font-bold text-[#8C5D53] uppercase tracking-wider block">
              Filter by Craft Category:
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
      {/* SEARCH BAR (Clean, Prominent Terracotta Button, No GPS/Chips)  */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-[#F5DDD5] p-3 shadow-xs">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchStores(searchQuery, selectedCategory);
          }}
          className="flex flex-col sm:flex-row gap-2.5"
        >
          <div className="flex-1 relative">
            <span className="absolute left-4 top-3.5 text-gray-400 text-lg">📍</span>
            <input
              type="text"
              placeholder={`Enter any area or city in India (e.g. Paldi Ahmedabad, Bandra Mumbai, Kothrud Pune, Lajpat Nagar Delhi)...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 border-2 border-[#F5DDD5] rounded-xl focus:outline-none focus:border-[#A84A38] text-sm bg-white text-slate-900 shadow-inner transition-all placeholder:text-gray-400 font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-7 py-3.5 bg-[#A84A38] hover:bg-[#8F3C2C] active:scale-95 text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-60 cursor-pointer min-w-[160px]"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>Searching...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <span>Find Stores</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MAIN TWO-COLUMN LAYOUT: Interactive Map + Real Store Cards     */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Map (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-2">
          <div className="rounded-3xl overflow-hidden border-2 border-[#F5DDD5] shadow-md h-[520px] bg-slate-100 relative">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              scrollWheelZoom={true}
              dragging={true}
              doubleClickZoom={true}
              zoomControl={true}
              className="w-full h-full"
              style={{ width: "100%", height: "100%", minHeight: "520px" }}
            >
              <ChangeMapView center={mapCenter} zoom={mapZoom} />

              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                maxZoom={19}
              />

              {stores.map((store) => {
                const isSelected = selectedStoreId === store.id;
                return (
                  <Marker
                    key={store.id}
                    position={[store.lat, store.lng]}
                    icon={isSelected ? activeIcon : defaultIcon}
                    ref={(ref) => {
                      if (ref) markerRefs.current[store.id] = ref;
                    }}
                    eventHandlers={{
                      click: () => setSelectedStoreId(store.id),
                    }}
                  >
                    <Popup className="custom-popup">
                      <div className="p-1 space-y-1 max-w-[240px]">
                        <p className="font-bold text-[#4A151B] text-sm leading-snug">{store.name}</p>
                        <p className="text-xs text-gray-600">{store.address}</p>
                        <div className="inline-block px-2 py-0.5 rounded-md bg-[#FFF4EE] border border-[#F5DDD5] text-[11px] font-semibold text-[#A84A38] mt-1">
                          {currentCatObj.icon} {store.specialty}
                        </div>
                        <div className="flex items-center justify-between pt-1.5 border-t border-gray-100 text-xs mt-1">
                          <span className="text-emerald-700 font-bold">📍 {store.distance}</span>
                          <a
                            href={`tel:${store.phone.replace(/[^0-9+]/g, "")}`}
                            className="text-[#A84A38] font-bold hover:underline"
                          >
                            📞 {store.phone}
                          </a>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>

            {/* Map bottom pill overlay showing active search & count */}
            <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl shadow-md border border-[#F5DDD5] text-xs font-semibold text-[#4A151B] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>
                <strong>{currentCatObj.label}</strong> in <strong>{activeSearch}</strong> ({stores.length} real stores found)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#8C5D53] px-1">
            <span>💡 Click any store card to locate on the map.</span>
            <span>Use +/- or scroll wheel to zoom.</span>
          </div>
        </div>

        {/* Right Column: Real Store Cards List (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <div>
              <h3 className="text-sm font-bold text-[#4A151B] uppercase tracking-wide flex items-center gap-2">
                <span>{currentCatObj.icon}</span> Verified Stores ({stores.length})
              </h3>
              <p className="text-[11px] text-[#8C5D53] mt-0.5">
                Authentic art & craft retailers in {activeSearch}
              </p>
            </div>
            {loading && (
              <span className="text-xs text-[#A84A38] font-semibold animate-pulse flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#A84A38] animate-ping"></span>
                Fetching Gemini...
              </span>
            )}
          </div>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            <AnimatePresence>
              {stores.length > 0 ? (
                stores.map((store) => {
                  const isSelected = selectedStoreId === store.id;
                  return (
                    <motion.div
                      key={store.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => handleSelectStore(store)}
                      className={`rounded-2xl border-2 p-4 cursor-pointer transition-all ${
                        isSelected
                          ? "border-[#A84A38] bg-[#FFF4EE] shadow-md ring-2 ring-[#A84A38]/20"
                          : "border-[#F5DDD5] bg-white hover:border-[#DDA799] hover:shadow-xs"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-[#4A151B] text-sm leading-snug">
                          {store.name}
                        </h4>
                        <span className="shrink-0 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200">
                          📍 {store.distance}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-1.5 flex items-start gap-1 leading-relaxed">
                        <span className="text-gray-400 shrink-0 mt-0.5">🏬</span>
                        <span>{store.address}</span>
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-[#F5DDD5]/80 flex flex-col gap-2 text-xs">
                        <div className="bg-[#FAF7F2] p-2 rounded-xl border border-[#F5DDD5] text-[#6E2A20] font-medium flex items-start gap-1.5">
                          <span className="shrink-0">{currentCatObj.icon}</span>
                          <span className="text-[11px] leading-tight">{store.specialty}</span>
                        </div>

                        <div className="flex items-center justify-between pt-0.5">
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Verified Retailer
                          </span>

                          <a
                            href={`tel:${store.phone.replace(/[^0-9+]/g, "")}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 font-bold text-[#A84A38] hover:text-[#8F3C2C] hover:underline px-3 py-1 bg-[#FFF4EE] border border-[#F5DDD5] rounded-lg transition-colors text-xs"
                          >
                            <span>📞</span> {store.phone}
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : !loading ? (
                <div className="text-center py-16 px-4 rounded-2xl border-2 border-dashed border-[#F5DDD5] bg-[#FAF7F2]">
                  <span className="text-4xl block mb-2">{currentCatObj.icon}</span>
                  <p className="text-sm font-bold text-[#4A151B]">
                    No stores found in "{activeSearch}"
                  </p>
                  <p className="text-xs text-[#8C5D53] mt-1">
                    Try searching a nearby major area or city (e.g. Paldi, Navrangpura, CG Road).
                  </p>
                </div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
