import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Category options matching Analytics, Calculator, and Stores tabs
const CRAFT_CATEGORIES = [
  { id: "resin", label: "Resin Art", icon: "🧪", subtitle: "Epoxy, Molds & Pigments" },
  { id: "candle", label: "Candle Making", icon: "🕯️", subtitle: "Waxes, Wicks & Fragrances" },
  { id: "crochet", label: "Crochet & Yarn", icon: "🧶", subtitle: "Yarns, Hooks & Needles" },
  { id: "clay", label: "Clay Sculpting", icon: "🏺", subtitle: "Polymer, Air-Dry & Tools" },
  { id: "pipe-cleaner", label: "Pipe Cleaner", icon: "🌸", subtitle: "Chenille Stems & Wire" },
];

// Fallback creators (6 active accounts per category)
const FALLBACK_ARTISTS = {
  resin: [
    {
      name: "Shikha Kothari",
      handle: "@shikhakothari_",
      followers: "276K",
      bio: "Luxury resin preservation artist. 50k+ custom orders, 30k+ students trained. Famous for wedding varmala and floral memory preservation.",
      signature_style: "Flower & Varmala Preservation",
      location: "Mumbai, India",
      badge: "Top Creator",
      url: "https://www.instagram.com/shikhakothari_/"
    },
    {
      name: "Poonam Shah",
      handle: "@poonam.shah_art",
      followers: "170K",
      bio: "Known for luxury epoxy resin art, bespoke furniture, and sculptural commissions in Mumbai, plus masterclasses via @artworkshops_by_poonam.",
      signature_style: "Luxury Resin Decor & Furniture",
      location: "Mumbai, India",
      badge: "Featured Artist",
      url: "https://www.instagram.com/poonam.shah_art/"
    },
    {
      name: "Ritesh Singla",
      handle: "@resinandritesh",
      followers: "85K",
      bio: "A self-taught resin artist and educator based in Greater Noida specializing in mantra frames and detailed resin art classes.",
      signature_style: "Mantra Frames & 3D Art",
      location: "Greater Noida, India",
      badge: "Educator",
      url: "https://www.instagram.com/resinandritesh/"
    },
    {
      name: "Priya (Aartistique Priya)",
      handle: "@aartistique_priya",
      followers: "45K",
      bio: "Popular for creative resin preservation (keepsakes, botanical items, custom pieces) and teaching resin techniques to 4,500+ students.",
      signature_style: "Botanical Keepsakes & Clocks",
      location: "Delhi NCR, India",
      badge: "Educator",
      url: "https://www.instagram.com/aartistique_priya/"
    },
    {
      name: "Shlok Dagly (Kaizen Art)",
      handle: "@kaizenart04",
      followers: "43.9K",
      bio: "Resin artist known for intricate wedding varmala preservation, custom acrylic nameplates, and hands-on offline workshops.",
      signature_style: "Varmala Preservation & Nameplates",
      location: "Mumbai / Gujarat, India",
      badge: "Viral Maker",
      url: "https://www.instagram.com/kaizenart04/"
    },
    {
      name: "Sapna Gohil (ArtLocal)",
      handle: "@artlocal_by_sapnagohil",
      followers: "62K",
      bio: "Famous for large-scale and viral 3D resin artworks, including intricate divine and fish-eye effect pieces like Radha Krishna.",
      signature_style: "3D Divine Idols & Fluid Art",
      location: "Ahmedabad, Gujarat",
      badge: "Master Artisan",
      url: "https://www.instagram.com/artlocal_by_sapnagohil/"
    }
  ],
  candle: [
    {
      name: "Boholette",
      handle: "@boholette_",
      followers: "42K",
      bio: "Founded by Shruti Kundan. Gained immense popularity on Instagram for popularizing Laddu-shaped dessert candles that look identical to real sweets.",
      signature_style: "Laddu Dessert Candles & Festive Gifting",
      location: "Chandigarh / Delhi, India",
      badge: "Viral Dessert Candles",
      url: "https://www.instagram.com/boholette_/"
    },
    {
      name: "Sookshma Studio",
      handle: "@sookshma.studio",
      followers: "38K",
      bio: "A Gurgaon-based creative studio merging resin art and wax art. Globally recognized for creating the first-ever intricate 3D Shiva Candle and sculptural devotional art candles.",
      signature_style: "3D Devotional Sculptural Candles",
      location: "Gurgaon, Haryana",
      badge: "Devotional Wax Art",
      url: "https://www.instagram.com/sookshma.studio/"
    },
    {
      name: "Kindled Origins",
      handle: "@kindled.origins",
      followers: "28K",
      bio: "Run by Dipti, an auditor by day and candle artist by night. Hand-poured Modak-shaped return gifts for Ganesh Chaturthi and inspiring passion project reels.",
      signature_style: "Hand-Poured Modak & Festive Gifts",
      location: "Mumbai, India",
      badge: "Homegrown Maker",
      url: "https://www.instagram.com/kindled.origins/"
    },
    {
      name: "Manomay Scented Candles",
      handle: "@manomay_scentedcandles",
      followers: "35K",
      bio: "A homegrown brand centered around premium soy wax formulations and luxury home fragrances with minimalist glass containers and botanical tops.",
      signature_style: "Botanical Soy Wax & Luxury Scents",
      location: "India",
      badge: "Luxury Aromas",
      url: "https://www.instagram.com/manomay_scentedcandles/"
    },
    {
      name: "Anjali Mittal (Amour by Anjali)",
      handle: "@amour_by_anjali",
      followers: "45K",
      bio: "Luxury scented candles studio turning stories, places, and little moments into evocative scents and artisanal sculpted home decor.",
      signature_style: "Story-Driven Luxury Scented Jars",
      location: "India",
      badge: "Luxury Scent Studio",
      url: "https://www.instagram.com/amour_by_anjali/"
    },
    {
      name: "Rad Living",
      handle: "@radliving",
      followers: "75K",
      bio: "India's favourite contemporary scented soy wax candles with witty statements and premium perfume blends. 100% pure soy wax.",
      signature_style: "Quote Jars & Luxury Soy Candles",
      location: "New Delhi, India",
      badge: "Top Brand",
      url: "https://www.instagram.com/radliving/"
    }
  ],
  crochet: [
    {
      name: "Kunal Jaikumar (Crochet Over Cliché)",
      handle: "@crochet_by_kunal",
      followers: "100K+",
      bio: "Based in Mumbai, Kunal has shattered the stereotype that crochet is only a grandmother's hobby. Pop-culture creations, streetwear fashion, and interactive workshops across India.",
      signature_style: "Pop-Culture Wear & Streetwear Crochet",
      location: "Mumbai, Maharashtra",
      badge: "100K+ Creator",
      url: "https://www.instagram.com/crochet_by_kunal/"
    },
    {
      name: "Floreal India",
      handle: "@floreal.india",
      followers: "85K",
      bio: "Founded by Vanshika Mittal in Ludhiana. High-quality, long-lasting crochet flower arrangements (roses, tulips, bouquets) providing employment to over 300 women artisans.",
      signature_style: "Forever Crochet Flower Arrangements",
      location: "Ludhiana, Punjab",
      badge: "300+ Women Artisans",
      url: "https://www.instagram.com/floreal.india/"
    },
    {
      name: "ArtsyNaari",
      handle: "@an.artsynaari",
      followers: "52K",
      bio: "Operated out of Indore by founder Divyaa. Custom handmade crochet fashion and forever flowers, combining aesthetic showcases with relatable maker reels.",
      signature_style: "Handmade Fashion & Forever Flowers",
      location: "Indore, Madhya Pradesh",
      badge: "Featured Maker",
      url: "https://www.instagram.com/an.artsynaari/"
    },
    {
      name: "The Crochet House Mumbai",
      handle: "@the.crochethouse",
      followers: "48K",
      bio: "Standout sustainable slow-fashion brand based in Mumbai. Bohemian aesthetic apparel like sleeveless tops, cardigans, baby items, and custom knitwear.",
      signature_style: "Bohemian Slow-Fashion Apparel",
      location: "Mumbai, Maharashtra",
      badge: "Sustainable Brand",
      url: "https://www.instagram.com/the.crochethouse/"
    },
    {
      name: "Anjali Dulwani (Miss Loombastic)",
      handle: "@missloombastic",
      followers: "38K",
      bio: "One of Ahmedabad's most prominent Amigurumi artists and educators. Premium plushies, pop-culture collectibles, and interactive offline crochet workshops.",
      signature_style: "Amigurumi Plushies & Masterclasses",
      location: "Ahmedabad, Gujarat",
      badge: "Master Educator",
      url: "https://www.instagram.com/missloombastic/"
    },
    {
      name: "Love Crochet Art",
      handle: "@lovecrochetart",
      followers: "32K",
      bio: "Dedicated studio space in Gota, Ahmedabad. Women-led business manufacturing zero-plastic, machine-washable crochet baby toys, rattles, and forever bouquets.",
      signature_style: "Baby Rattles & Forever Bouquets",
      location: "Gota, Ahmedabad",
      badge: "Women-Led Studio",
      url: "https://www.instagram.com/lovecrochetart/"
    }
  ],
  clay: [
    {
      name: "Moraa by Deepika",
      handle: "@moraa_by_deepika",
      followers: "65K",
      bio: "Deepika is a master of 3D relief clay art. Celebrated for merging traditional Lippan mirror patterns with 3D devotional iconography—like her viral 48-inch Shrinathji and Yamunaji clay mural panels with intricate clay shringaar detailing.",
      signature_style: "3D Relief Clay Murals & Shrinathji Panels",
      location: "Pan-India",
      badge: "3D Clay Relief Master",
      url: "https://www.instagram.com/moraa_by_deepika/"
    },
    {
      name: "Mahima | Colors•Canvas•Clay",
      handle: "@artsyymahi",
      followers: "48K",
      bio: "Energetic clay artist and digital educator who has trained over 170+ students online. Focuses heavily on modern, accessible air-dry clay murals and canvas art with smooth resin finishes.",
      signature_style: "Air-Dry Clay Murals & Canvas Art",
      location: "Pan-India",
      badge: "Educator (170+ Students)",
      url: "https://www.instagram.com/artsyymahi/"
    },
    {
      name: "Rishita",
      handle: "@colourslia_",
      followers: "36K",
      bio: "Offers a beautiful look into the 'Cottagecore' whimsical aesthetic. Hand-sculpted clay, plaster textures, and concrete for whimsical floral trinket trays, jewelry organizers, and DIY painting kits.",
      signature_style: "Cottagecore Floral Trinket Trays",
      location: "Pan-India",
      badge: "Cottagecore Aesthetic",
      url: "https://www.instagram.com/colourslia_/"
    },
    {
      name: "Rekha Goyal",
      handle: "@rekhagoyalx",
      followers: "42K",
      bio: "Premium Mumbai-based ceramic muralist practicing for 25 years. Museum-grade structural clay blocks and public art installations for the Constitution of India Museum and Mahindra Museum.",
      signature_style: "Architectural Ceramic Murals",
      location: "Mumbai, Maharashtra",
      badge: "25+ Yrs Master Muralist",
      url: "https://www.instagram.com/rekhagoyalx/"
    },
    {
      name: "Maji Khan Mud Art",
      handle: "@majikhanmudart",
      followers: "55K",
      bio: "Handcrafted Indian craftsmanship blending traditional Kutch Lippan mud and mirror art with modern interior wall panels. Hand-rolled clay borders with reflective mirror mosaics.",
      signature_style: "Traditional Lippan Mud & Mirror Art",
      location: "Ahmedabad, Gujarat",
      badge: "Heritage Lippan Artisan",
      url: "https://www.instagram.com/majikhanmudart/"
    },
    {
      name: "Devesh Heartist",
      handle: "@devesh_heartist",
      followers: "64K",
      bio: "Dev Griha Mandala in the making. Intricate clay mandalas, sacred geometric wall art, and Lippan relief work celebrating Indian heritage craftsmanship.",
      signature_style: "Dev Griha Clay Mandalas",
      location: "Ahmedabad, Gujarat",
      badge: "Mandala Clay Artist",
      url: "https://www.instagram.com/devesh_heartist/"
    }
  ],
  "pipe-cleaner": [
    {
      name: "Afzaai by Shahreen",
      handle: "@afzaai.in",
      followers: "58K",
      bio: "One of the biggest Indian pages doing premium, aesthetic Korean-wrapped lotus and tulip bouquets. Choose from a thoughtfully curated collection of 40+ bouquets or customize orders.",
      signature_style: "Korean-Wrapped Lotus & Tulip Bouquets",
      location: "India",
      badge: "Curated 40+ Bouquets",
      url: "https://www.instagram.com/afzaai.in/"
    },
    {
      name: "Petalea India",
      handle: "@petalea.in",
      followers: "62K",
      bio: "Known for viral aesthetic flower packing reels with over 865K+ views! Handcrafted pipe cleaner lilies, velvet stem hair clips, and trending handmade gifting creations.",
      signature_style: "Lilies & Velvet Stem Hair Clips",
      location: "India",
      badge: "865K+ Viral Reels",
      url: "https://www.instagram.com/petalea.in/"
    },
    {
      name: "Bloom By Hands",
      handle: "@bloom_by_hands_dh",
      followers: "34K",
      bio: "Specializes in hand-twisted fuzzy garlands and custom gifting stems. Vibrant colorful chenille flowers designed to stay fresh and everlasting forever.",
      signature_style: "Hand-Twisted Fuzzy Garlands",
      location: "India",
      badge: "Garland Specialist",
      url: "https://www.instagram.com/bloom_by_hands_dh/"
    },
    {
      name: "Artocalypse",
      handle: "@artocalypse.in",
      followers: "41K",
      bio: "Creates stunning multi-flower chenille arrangements and ready-to-ship gifting bouquets. Perfect everlasting gifts for birthdays, anniversaries, and graduations.",
      signature_style: "Multi-Flower Gifting Bouquets",
      location: "India",
      badge: "Ready-To-Ship Bouquets",
      url: "https://www.instagram.com/artocalypse.in/"
    },
    {
      name: "Miss Crafty",
      handle: "@miss_crafty_107",
      followers: "28K",
      bio: "Feeds filled with detailed festive marigold layouts and mini daisy creations made entirely with chenille fuzzy stems. Ideal for festive pooja decor.",
      signature_style: "Festive Marigold & Mini Daisies",
      location: "India",
      badge: "Festive Decor Maker",
      url: "https://www.instagram.com/miss_crafty_107/"
    },
    {
      name: "Snip and Swirl",
      handle: "@snipandswirl",
      followers: "32K",
      bio: "Excellent behind-the-scenes content on twisting fuzzy wires into full blooms. Tutorials on petal curving, multi-layer flower centers, and floral tape wrapping.",
      signature_style: "Fuzzy Wire Shaping & Full Blooms",
      location: "India",
      badge: "BTS Flower Shaping",
      url: "https://www.instagram.com/snipandswirl/"
    }
  ]
};

export default function SimilarArtistsTab({ category }) {
  // Support category from URL query (?category=resin) or prop or default "resin"
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
  const [artists, setArtists] = useState(FALLBACK_ARTISTS[getInitialCategory()] || FALLBACK_ARTISTS.resin);
  const [loading, setLoading] = useState(false);
  const [copiedHandle, setCopiedHandle] = useState(null);

  // Sync category changes with URL and state
  const handleCategoryChange = (newCatId) => {
    setSelectedCategory(newCatId);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      params.set("category", newCatId);
      params.set("tab", "artists");
      const newUrl = `${window.location.pathname}?${params.toString()}`;
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

  // Fetch artists on category change
  useEffect(() => {
    fetchArtists(selectedCategory);
  }, [selectedCategory]);

  const fetchArtists = async (catId) => {
    const targetCat = catId || selectedCategory;
    setLoading(true);

    try {
      let response;
      try {
        response = await fetch(`http://localhost:8001/api/artists/${targetCat}`);
        if (!response.ok) throw new Error("Port 8001 status " + response.status);
      } catch (err8001) {
        response = await fetch(`http://localhost:8000/api/artists/${targetCat}`);
      }

      if (response && response.ok) {
        const data = await response.json();
        if (data.artists && data.artists.length > 0) {
          setArtists(data.artists);
        } else {
          setArtists(FALLBACK_ARTISTS[targetCat] || FALLBACK_ARTISTS.resin);
        }
      } else {
        setArtists(FALLBACK_ARTISTS[targetCat] || FALLBACK_ARTISTS.resin);
      }
    } catch (err) {
      console.warn("Using verified active creators fallback:", err);
      setArtists(FALLBACK_ARTISTS[targetCat] || FALLBACK_ARTISTS.resin);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (handle) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(handle);
      setCopiedHandle(handle);
      setTimeout(() => {
        setCopiedHandle(null);
      }, 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans text-slate-800">
      {/* ------------------------------------------------------------- */}
      {/* TOP HERO BANNER (Warm Artisan Theme, No Refresh Button)       */}
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
                CREATIVE INSPIRATION & COMMUNITY
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Verified Instagram Creators
              </span>
            </div>

            <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-[#4A151B]">
              Featured Artisan Creators
            </h1>

            <p className="text-base md:text-lg text-[#6E2A20] font-medium">
              Discover authentic, top-followed Indian Instagram artists for{" "}
              <strong className="text-[#A84A38]">{currentCatObj.label}</strong>
            </p>

            <p className="text-xs md:text-sm text-[#8C5D53] max-w-xl">
              Take inspiration from top verified Indian craft entrepreneurs, signature product collections, 
              aesthetic feeds, and workshop masterclasses.
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

      {/* Category Header */}
      <div className="flex items-center justify-between px-2 pt-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">{currentCatObj.icon}</span>
          <h2 className="text-sm md:text-base font-bold text-[#4A151B] tracking-wide">
            Instagram Creator Guide for {currentCatObj.label}
          </h2>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* EXACT 6 CREATOR CARDS GRID                                    */}
      {/* ------------------------------------------------------------- */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((sk) => (
            <div
              key={sk}
              className="rounded-3xl border border-[#F5DDD5] bg-white p-6 space-y-4 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-gray-200"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded-md w-1/2"></div>
                </div>
              </div>
              <div className="h-3 bg-gray-200 rounded-md w-full"></div>
              <div className="h-3 bg-gray-200 rounded-md w-5/6"></div>
              <div className="h-10 bg-gray-200 rounded-xl w-full"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {artists.map((artist, idx) => {
              const cleanHandle = artist.handle?.replace(/^@/, "") || "";
              const instagramUrl = artist.url || `https://www.instagram.com/${cleanHandle}/`;
              const isCopied = copiedHandle === artist.handle;

              return (
                <motion.div
                  key={artist.handle || idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="rounded-3xl border-2 border-[#F5DDD5] bg-white p-6 shadow-xs hover:border-[#DDA799] hover:shadow-md transition-all flex flex-col justify-between relative group"
                >
                  <div>
                    {/* Top Creator Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        {/* Gradient Story Ring Avatar */}
                        <div className="relative p-[2.5px] rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-sm shrink-0">
                          <div className="w-13 h-13 rounded-full bg-white flex items-center justify-center p-0.5">
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#FFF4EE] to-[#FCEEE8] flex items-center justify-center text-xl font-serif font-bold text-[#A84A38]">
                              {artist.name ? artist.name.charAt(0) : "✨"}
                            </div>
                          </div>
                          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white"></span>
                        </div>

                        <div>
                          <h3 className="font-bold text-[#4A151B] text-base leading-snug group-hover:text-[#A84A38] transition-colors">
                            {artist.name}
                          </h3>
                          <a
                            href={instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs font-semibold text-[#A84A38] hover:underline block"
                          >
                            {artist.handle}
                          </a>
                        </div>
                      </div>

                      {/* Follower Count Badge */}
                      <span className="shrink-0 px-2.5 py-1 bg-gradient-to-r from-rose-50 to-orange-50 text-[#A84A38] text-xs font-bold rounded-xl border border-[#F5DDD5]">
                        👥 {artist.followers}
                      </span>
                    </div>

                    {/* Signature Style Pill */}
                    {artist.signature_style && (
                      <div className="mb-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FAF7F2] border border-[#F5DDD5] text-xs font-semibold text-[#6E2A20]">
                          <span>{currentCatObj.icon}</span>
                          <span>{artist.signature_style}</span>
                        </span>
                      </div>
                    )}

                    {/* Bio Description */}
                    <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-3">
                      {artist.bio}
                    </p>

                    {/* Location & Badge */}
                    <div className="flex items-center justify-between text-[11px] text-[#8C5D53] pb-4 mb-4 border-b border-[#F5DDD5]/80">
                      <span className="flex items-center gap-1 font-medium">
                        <span>📍</span> {artist.location || "India"}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold border border-purple-200">
                        ⭐ {artist.badge || "Verified Creator"}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCopy(artist.handle)}
                      className="py-2.5 px-3 rounded-xl border border-[#F5DDD5] hover:bg-[#FFF4EE] text-[#6E2A20] font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>{isCopied ? "✓" : "📋"}</span>
                      <span>{isCopied ? "Copied!" : "Copy Handle"}</span>
                    </button>

                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#A84A38] to-[#913D2D] hover:from-[#913D2D] hover:to-[#7E3324] text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer text-center"
                    >
                      <span>View Profile</span>
                      <span>↗</span>
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* BOTTOM FOOTER CALLOUT                                         */}
      {/* ------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-3xl bg-gradient-to-r from-[#FFF4EE] via-[#FDF1F3] to-[#FCEEE8] border border-[#F5DDD5] p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left"
      >
        <div className="space-y-1">
          <p className="text-xs font-bold text-[#4A151B] uppercase tracking-wide flex items-center justify-center sm:justify-start gap-1.5">
            <span>✨</span> Creative Inspiration in {currentCatObj.label}
          </p>
          <p className="text-xs text-[#8C5D53]">
            Follow these active creators on Instagram to stay updated on trending styles, packaging tips, and raw material sourcing.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className="shrink-0 px-4 py-2 bg-white text-[#A84A38] border border-[#F5DDD5] rounded-xl text-xs font-bold shadow-xs hover:bg-[#FFF4EE] transition-all cursor-pointer"
        >
          Back to Top ↑
        </button>
      </motion.div>
    </div>
  );
}