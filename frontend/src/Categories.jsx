import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './Categories.css'

const CATEGORIES = [
  {
    id: 'candle',
    slug: 'candle',
    name: 'CANDLE',
    tagline: '"Light up your creativity"',
    type: 'top',
    icon: (
      <svg className="craft-card-svg" viewBox="0 0 160 140" fill="none">
        {/* Soft Warm Flame Glow */}
        <circle cx="80" cy="40" r="28" fill="#FCEBD6" opacity="0.75" />
        <circle cx="80" cy="40" r="16" fill="#F8D4A6" opacity="0.6" />
        
        {/* Candle Flame */}
        <path d="M80 20 C74 32, 73 40, 80 48 C87 40, 86 32, 80 20 Z" fill="#D9A48F" />
        <path d="M80 28 C77 34, 76 38, 80 44 C84 38, 83 34, 80 28 Z" fill="#E8B07D" />
        <path d="M80 34 C78 37, 78 40, 80 42 C82 40, 82 37, 80 34 Z" fill="#FFF8F0" />
        <line x1="80" y1="48" x2="80" y2="56" stroke="#4A3E37" strokeWidth="2" strokeLinecap="round" />
        
        {/* Candle Body */}
        <rect x="54" y="56" width="52" height="66" rx="8" fill="#FAF6EE" stroke="#D3C9B8" strokeWidth="1.5" />
        <path d="M54 66 C 65 72, 75 60, 85 68 C 95 62, 100 68, 106 64" stroke="#E6DCCB" strokeWidth="2" fill="none" opacity="0.7" />
        
        {/* Wax Drips */}
        <path d="M60 56 Q63 72 66 56" fill="#FAF6EE" stroke="#D3C9B8" strokeWidth="1" />
        <path d="M92 56 Q95 76 98 56" fill="#FAF6EE" stroke="#D3C9B8" strokeWidth="1" />
        
        {/* Botanical Lavender Sprig */}
        <path d="M42 118 Q50 90 48 70" stroke="#68745E" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <circle cx="46" cy="74" r="3" fill="#A8B39A" />
        <circle cx="50" cy="82" r="3.5" fill="#8B735C" />
        <circle cx="44" cy="90" r="3" fill="#A8B39A" />
      </svg>
    )
  },
  {
    id: 'resin',
    slug: 'resin',
    name: 'RESIN',
    tagline: '"Pour, shape & create"',
    type: 'top',
    icon: (
      <svg className="craft-card-svg" viewBox="0 0 160 140" fill="none">
        {/* Ambient Resin Gloss Backdrop */}
        <ellipse cx="80" cy="70" rx="55" ry="45" fill="#EAE5DA" opacity="0.6" />
        
        {/* Organic Resin Coaster Slab */}
        <path d="M40 70 C35 40, 60 25, 95 30 C125 35, 135 60, 125 90 C115 118, 70 125, 45 105 C30 92, 45 80, 40 70 Z" 
              fill="#F2EFEB" stroke="#CFC5B4" strokeWidth="1.8" />
        
        {/* Fluid Swirl Layers */}
        <path d="M48 65 C60 45, 90 40, 115 55 C120 70, 105 85, 80 95 C60 100, 45 85, 48 65 Z" 
              fill="#E3DDD0" opacity="0.65" />
        <path d="M60 70 C70 55, 95 52, 108 65 C110 75, 95 85, 75 88 C62 88, 55 78, 60 70 Z" 
              fill="#D4CAB7" opacity="0.5" />

        {/* Pressed Dried Flower in Resin */}
        <g opacity="0.85">
          <circle cx="82" cy="70" r="4" fill="#D9A48F" />
          <path d="M82 66 Q82 56 84 56 Q86 56 82 66 Z" fill="#D9A48F" />
          <path d="M82 74 Q82 84 80 84 Q78 84 82 74 Z" fill="#D9A48F" />
          <path d="M78 70 Q68 70 68 68 Q68 66 78 70 Z" fill="#E8B07D" />
          <path d="M86 70 Q96 70 96 72 Q96 74 86 70 Z" fill="#E8B07D" />
          <path d="M85 67 Q92 60 94 62 Z" fill="#A8B39A" />
          <path d="M79 73 Q72 80 70 78 Z" fill="#A8B39A" />
        </g>
        
        {/* Gold Foil Flecks */}
        <polygon points="62,50 65,48 64,52" fill="#D9A48F" />
        <polygon points="105,75 109,74 107,78" fill="#D9A48F" />
        <polygon points="72,98 75,96 74,100" fill="#D9A48F" />
        <polygon points="98,42 101,40 100,44" fill="#D9A48F" />
      </svg>
    )
  },
  {
    id: 'crochet',
    slug: 'crochet',
    name: 'CROCHET',
    tagline: '"Stitch your imagination"',
    type: 'top',
    icon: (
      <svg className="craft-card-svg" viewBox="0 0 160 140" fill="none">
        {/* Soft Yarn Shadow */}
        <ellipse cx="75" cy="85" rx="38" ry="34" fill="#E6DFD3" />
        
        {/* Yarn Ball */}
        <circle cx="75" cy="72" r="36" fill="#8B735C" />
        
        {/* Yarn Texture Ribs */}
        <path d="M50 60 C60 45, 90 45, 100 60 M44 72 C55 58, 95 58, 106 72 M48 84 C60 70, 90 70, 102 84 M56 94 C65 85, 85 85, 94 94" 
              stroke="#A68D75" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M60 44 C72 55, 72 90, 60 100 M75 36 C88 50, 88 94, 75 108 M90 44 C102 55, 102 90, 90 100" 
              stroke="#6E5844" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.6" />

        {/* Loose Woven Thread Tail */}
        <path d="M102 88 C120 105, 125 115, 140 110 C148 106, 150 96, 142 92" 
              stroke="#8B735C" strokeWidth="3" strokeLinecap="round" fill="none" />
        
        {/* Wooden Crochet Hook */}
        <g transform="rotate(-35 80 60)">
          <rect x="20" y="58" width="115" height="7" rx="3.5" fill="#D9A48F" stroke="#B8836F" strokeWidth="1" />
          {/* Hook Tip */}
          <path d="M135 58 C142 58, 144 54, 140 52 C135 50, 132 55, 128 58" fill="#B8836F" />
        </g>
      </svg>
    )
  },
  {
    id: 'pipe-cleaner',
    slug: 'pipe-cleaner',
    name: 'PIPE CLEANER',
    tagline: '"Twist it into something new"',
    type: 'bottom',
    icon: (
      <svg className="craft-card-svg" viewBox="0 0 160 140" fill="none">
        {/* Fuzzy Twisted Pipe Cleaner Spiral */}
        <path d="M35 105 C40 40, 70 30, 80 65 C90 100, 120 90, 125 40" 
              stroke="#68745E" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M35 105 C40 40, 70 30, 80 65 C90 100, 120 90, 125 40" 
              stroke="#A8B39A" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M35 105 C40 40, 70 30, 80 65 C90 100, 120 90, 125 40" 
              stroke="#E8EFE2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.8" />

        {/* Secondary Pipe Cleaner Accent (Terracotta/Sage Blossom) */}
        <path d="M110 85 C125 70, 145 85, 130 105 C115 120, 95 105, 110 85 Z" 
              stroke="#D9A48F" strokeWidth="8" strokeLinecap="round" fill="none" />
        <path d="M110 85 C125 70, 145 85, 130 105 C115 120, 95 105, 110 85 Z" 
              stroke="#E8B07D" strokeWidth="4" strokeLinecap="round" fill="none" />

        {/* Fuzzy Texture Dots */}
        <circle cx="45" cy="70" r="2.5" fill="#68745E" />
        <circle cx="75" cy="50" r="3" fill="#68745E" />
        <circle cx="95" cy="75" r="2.5" fill="#68745E" />
        <circle cx="120" cy="55" r="3" fill="#68745E" />
      </svg>
    )
  },
  {
    id: 'clay',
    slug: 'clay',
    name: 'CLAY',
    tagline: '"Shape your ideas"',
    type: 'bottom',
    icon: (
      <svg className="craft-card-svg" viewBox="0 0 160 140" fill="none">
        {/* Potter's Wheel Base */}
        <ellipse cx="80" cy="115" rx="55" ry="12" fill="#D9D0C1" stroke="#BFB5A3" strokeWidth="1.5" />
        <ellipse cx="80" cy="112" rx="42" ry="8" fill="#C5BBB7" />

        {/* Clay Vase Body (Terracotta / Warm Earthenware) */}
        <path d="M56 108 C52 85, 42 65, 58 48 C66 40, 94 40, 102 48 C118 65, 108 85, 104 108 Z" 
              fill="#D9A48F" stroke="#B5816D" strokeWidth="1.8" />
        
        {/* Vase Neck & Rim */}
        <ellipse cx="80" cy="46" rx="22" ry="6" fill="#E8B07D" stroke="#B5816D" strokeWidth="1.5" />
        <ellipse cx="80" cy="46" rx="16" ry="4" fill="#8B735C" opacity="0.4" />
        
        {/* Sculpted Curves Highlight */}
        <path d="M64 52 C54 68, 60 90, 66 104" stroke="#F0C7B5" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.75" />
        <path d="M96 52 C106 68, 100 90, 94 104" stroke="#9E6957" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
        
        {/* Handheld Clay Sculpting Tool */}
        <g transform="rotate(25 110 70)">
          <rect x="95" y="40" width="6" height="55" rx="3" fill="#8B735C" />
          <path d="M95 40 Q98 28 101 40 Z" fill="#68745E" />
        </g>
      </svg>
    )
  }
]

export default function Categories() {
  const navigate = useNavigate()
  const containerRef = useRef(null)

  const targetMouse = useRef({ x: 0, y: 0 })
  const currentMouse = useRef({ x: 0, y: 0 })
  const animFrameId = useRef(null)

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 50)

    // Smooth Lerp Mouse Motion for Ambient Workspace Lighting
    const updateMouse = () => {
      const lerpFactor = 0.07
      currentMouse.current.x += (targetMouse.current.x - currentMouse.current.x) * lerpFactor
      currentMouse.current.y += (targetMouse.current.y - currentMouse.current.y) * lerpFactor

      setMousePos({ x: currentMouse.current.x, y: currentMouse.current.y })
      animFrameId.current = requestAnimationFrame(updateMouse)
    }

    animFrameId.current = requestAnimationFrame(updateMouse)

    return () => {
      clearTimeout(timer)
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current)
    }
  }, [])

  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    targetMouse.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  const handleMouseLeave = () => {
    targetMouse.current = { x: 0, y: 0 }
  }

  const handleCardClick = (slug) => {
    navigate(`/dashboard/${slug}`)
  }

  const topCategories = CATEGORIES.filter((c) => c.type === 'top')
  const bottomCategories = CATEGORIES.filter((c) => c.type === 'bottom')

  return (
    <div
      ref={containerRef}
      className={`categories-container ${isLoaded ? 'page-loaded' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        '--mouse-x': `${mousePos.x}px`,
        '--mouse-y': `${mousePos.y}px`
      }}
    >
      {/* Soft Ambient Natural Cursor Light */}
      <div className="ambient-light ambient-cream"></div>
      <div className="ambient-light ambient-sage"></div>
      <div className="ambient-light ambient-terracotta"></div>

      {/* Floating Botanical Studio Decorations */}
      <div className="decorations-layer" aria-hidden="true">
        <span className="decor float-leaf-1">🌿</span>
        <span className="decor float-star-1">✦</span>
        <span className="decor float-petal-1">🌸</span>
        <span className="decor float-star-2">✧</span>
        <span className="decor float-dot-1">•</span>
        <span className="decor float-leaf-2">🍃</span>

        <svg className="decor-svg decor-botanical-left" viewBox="0 0 120 180" fill="none">
          <path d="M20 170 Q40 110 90 20" stroke="#68745E" strokeWidth="1.2" strokeDasharray="3 3" />
          <path d="M45 125 C30 110 50 95 65 110 Z" fill="#A8B39A" opacity="0.35" />
          <path d="M70 80 C55 65 75 50 90 65 Z" fill="#8B735C" opacity="0.3" />
        </svg>

        <svg className="decor-svg decor-botanical-right" viewBox="0 0 140 200" fill="none">
          <path d="M120 180 Q80 100 20 20" stroke="#8B735C" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="35" cy="35" r="4" fill="#D9A48F" opacity="0.5" />
          <circle cx="65" cy="75" r="5" fill="#A8B39A" opacity="0.4" />
          <circle cx="95" cy="125" r="4" fill="#D9A48F" opacity="0.5" />
        </svg>
      </div>

      {/* Top Navbar */}
      <header className="categories-nav">
        <div className="nav-brand">
          <div className="brand-icon-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5B6752" strokeWidth="2">
              <circle cx="12" cy="12" r="8" stroke="#5B6752" strokeWidth="1.5"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v10M7 12h10" stroke="#5B6752"/>
            </svg>
          </div>
          <span className="nav-brand-title">CRAFTIQ</span>
        </div>

        <nav className="nav-links">
          <Link to="/categories" className="nav-link active">Studio</Link>
          <span className="nav-link">Profile</span>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="categories-main">
        {/* Header Title Section */}
        <section className="categories-header-section">
          <div className="eyebrow-badge">
            <span className="eyebrow-leaf">🌿</span>
            <span className="eyebrow-text">YOUR CREATIVE SPACE</span>
          </div>

          <h1 className="categories-title">
            Choose your <em>craft</em>
          </h1>

          <p className="categories-subtitle">
            Select a craft to begin creating something uniquely yours.
          </p>
        </section>

        {/* Category Cards Composition Layout */}
        <section className="categories-grid-section">
          {/* Top Row — 3 Cards */}
          <div className="cards-row cards-row-top">
            {topCategories.map((category) => (
              <div
                key={category.id}
                className="craft-card"
                onClick={() => handleCardClick(category.slug)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleCardClick(category.slug)
                  }
                }}
              >
                <div className="card-texture-overlay"></div>
                <div className="card-visual-wrapper">
                  {category.icon}
                </div>
                <div className="card-info">
                  <h2 className="card-name">{category.name}</h2>
                  <p className="card-tagline">{category.tagline}</p>
                </div>
                <div className="card-hover-arrow">
                  <span>Explore Craft →</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Row — 2 Cards Centered */}
          <div className="cards-row cards-row-bottom">
            {bottomCategories.map((category) => (
              <div
                key={category.id}
                className="craft-card"
                onClick={() => handleCardClick(category.slug)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleCardClick(category.slug)
                  }
                }}
              >
                <div className="card-texture-overlay"></div>
                <div className="card-visual-wrapper">
                  {category.icon}
                </div>
                <div className="card-info">
                  <h2 className="card-name">{category.name}</h2>
                  <p className="card-tagline">{category.tagline}</p>
                </div>
                <div className="card-hover-arrow">
                  <span>Explore Craft →</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Minimal Footer Signature */}
      <footer className="categories-footer">
        <p>CraftIQ Artisan Studio • Made with natural inspiration</p>
      </footer>
    </div>
  )
}
