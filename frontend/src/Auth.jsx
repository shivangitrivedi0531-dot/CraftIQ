import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './Auth.css'

export default function Auth() {
  const navigate = useNavigate()
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Mouse position tracking with smooth lerp
  const containerRef = useRef(null)
  const targetMouse = useRef({ x: 0, y: 0, nx: 0, ny: 0 })
  const currentMouse = useRef({ x: 0, y: 0, nx: 0, ny: 0 })
  const animFrameId = useRef(null)

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [layers, setLayers] = useState({
    bgX: 0, bgY: 0,
    paperX: 0, paperY: 0,
    ribbonX: 0, ribbonY: 0,
    flowerX: 0, flowerY: 0,
    itemX: 0, itemY: 0,
    cardX: 0, cardY: 0
  })

  // Form fields
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: false,
    agreeTerms: false
  })

  // Toast feedback message
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    // Initial page load trigger
    const timer = setTimeout(() => setIsLoaded(true), 50)

    // Smooth animation loop for lerp mouse tracking
    const updateMouse = () => {
      const lerpFactor = 0.08
      currentMouse.current.x += (targetMouse.current.x - currentMouse.current.x) * lerpFactor
      currentMouse.current.y += (targetMouse.current.y - currentMouse.current.y) * lerpFactor
      currentMouse.current.nx += (targetMouse.current.nx - currentMouse.current.nx) * lerpFactor
      currentMouse.current.ny += (targetMouse.current.ny - currentMouse.current.ny) * lerpFactor

      const nx = currentMouse.current.nx
      const ny = currentMouse.current.ny

      setMousePos({ x: currentMouse.current.x, y: currentMouse.current.y })
      setLayers({
        bgX: nx * 2,
        bgY: ny * 2,
        paperX: nx * 3.5,
        paperY: ny * 3.5,
        ribbonX: nx * 5.5,
        ribbonY: ny * 5.5,
        flowerX: nx * 6.8,
        flowerY: ny * 6.8,
        itemX: nx * 8,
        itemY: ny * 8,
        cardX: nx * 3,
        cardY: ny * 3
      })

      animFrameId.current = requestAnimationFrame(updateMouse)
    }

    animFrameId.current = requestAnimationFrame(updateMouse)

    return () => {
      clearTimeout(timer)
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current)
    }
  }, [])

  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Normalized coordinates (-1 to 1)
    const nx = (x - rect.width / 2) / (rect.width / 2)
    const ny = (y - rect.height / 2) / (rect.height / 2)

    targetMouse.current = { x, y, nx, ny }
  }

  const handleMouseLeave = () => {
    targetMouse.current = { x: 0, y: 0, nx: 0, ny: 0 }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isSignUp) {
      if (formData.password !== formData.confirmPassword) {
        triggerToast('⚠️ Passwords do not match!')
        return
      }
      triggerToast('🌿 Welcome to your CraftIQ Studio!')
      setTimeout(() => navigate('/categories'), 300)
    } else {
      triggerToast('🎨 Entering your creative space...')
      setTimeout(() => navigate('/categories'), 300)
    }
  }

  const handleGoogleSignIn = () => {
    triggerToast('🌐 Continuing with Google...')
    setTimeout(() => navigate('/categories'), 300)
  }

  return (
    <div
      ref={containerRef}
      className={`studio-container ${isLoaded ? 'page-loaded' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        '--mouse-x': `${mousePos.x}px`,
        '--mouse-y': `${mousePos.y}px`,
        '--bg-px': `${layers.bgX}px`,
        '--bg-py': `${layers.bgY}px`,
        '--paper-px': `${layers.paperX}px`,
        '--paper-py': `${layers.paperY}px`,
        '--ribbon-px': `${layers.ribbonX}px`,
        '--ribbon-py': `${layers.ribbonY}px`,
        '--flower-px': `${layers.flowerX}px`,
        '--flower-py': `${layers.flowerY}px`,
        '--item-px': `${layers.itemX}px`,
        '--item-py': `${layers.itemY}px`,
        '--card-px': `${layers.cardX}px`,
        '--card-py': `${layers.cardY}px`
      }}
    >
      {/* Multi-tone Natural Soft Ambient Lighting */}
      <div className="natural-ambient-light ambient-cream"></div>
      <div className="natural-ambient-light ambient-sage"></div>
      <div className="natural-ambient-light ambient-terracotta"></div>

      {/* Main Split-Screen Layout */}
      <div className="studio-layout">
        
        {/* LEFT SIDE — ARTIST STUDIO EDITORIAL VISUAL (55-60%) */}
        <div className="studio-visual-panel">
          
          {/* Sparse Gentle Floating Decorative Elements */}
          <div className="floating-decorations">
            <span className="float-item float-leaf-1">🌿</span>
            <span className="float-item float-petal-2">🌸</span>
            <span className="float-item float-star-3">✦</span>
            <span className="float-item float-dot-4">•</span>
          </div>

          {/* Woven Basket Rattan Frame */}
          <div className="rattan-tray">
            <div className="rattan-texture"></div>
            
            {/* Layered Parchment & Vintage Score Sheets */}
            <div className="vintage-sheets">
              <div className="sheet music-sheet"></div>
              <div className="sheet main-paper-sheet">
                <div className="paper-texture-overlay"></div>
                
                {/* Botanical Dried Flowers */}
                <svg className="botanical-branch babys-breath" viewBox="0 0 100 120" fill="none">
                  <path d="M50 110 Q45 70 30 20 M50 110 Q55 60 75 35 M48 65 Q30 50 15 45 M52 80 Q70 65 85 55" stroke="#8B735C" strokeWidth="1.2" strokeLinecap="round"/>
                  <circle cx="30" cy="20" r="3" fill="#E8D5C4"/>
                  <circle cx="75" cy="35" r="3.5" fill="#E8D5C4"/>
                  <circle cx="15" cy="45" r="2.5" fill="#F2E6D8"/>
                  <circle cx="85" cy="55" r="3" fill="#E8D5C4"/>
                  <circle cx="40" cy="35" r="2" fill="#E8D5C4"/>
                </svg>

                {/* Hydrangea Green Bloom Cluster */}
                <div className="hydrangea-cluster">
                  <span className="bloom-petal p1"></span>
                  <span className="bloom-petal p2"></span>
                  <span className="bloom-petal p3"></span>
                  <span className="bloom-petal p4"></span>
                </div>

                {/* Silk Ribbon Curl */}
                <svg className="silk-ribbon" viewBox="0 0 160 90" fill="none">
                  <path d="M10 80 C 40 10, 80 90, 110 30 C 130 5, 150 50, 155 70" stroke="#FAF8F1" strokeWidth="8" strokeLinecap="round" opacity="0.85"/>
                  <path d="M10 80 C 40 10, 80 90, 110 30 C 130 5, 150 50, 155 70" stroke="#E6E1D5" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>

                {/* Brass Embroidery Scissors */}
                <svg className="brass-scissors" viewBox="0 0 60 90" fill="none" stroke="#68745E" strokeWidth="1.5">
                  <circle cx="20" cy="75" r="10" stroke="#8B735C" strokeWidth="1.8"/>
                  <circle cx="40" cy="75" r="10" stroke="#8B735C" strokeWidth="1.8"/>
                  <path d="M20 65 L 30 20 L 40 65" stroke="#68745E" strokeWidth="1.8"/>
                  <path d="M30 20 L 30 10" stroke="#68745E" strokeWidth="2"/>
                </svg>

                {/* Botanical Postage Stamp */}
                <div className="postage-stamp">
                  <div className="stamp-edge"></div>
                  <span className="stamp-art">🌸</span>
                  <span className="stamp-text">CRAFT 2026</span>
                </div>

                {/* Main Editorial Text on Parchment */}
                <div className="editorial-content">
                  <div className="studio-brand-badge">
                    <span className="badge-leaf">🌿</span>
                    <span className="badge-text">CRAFTIQ ARTISAN STUDIO</span>
                  </div>
                  <h1 className="editorial-headline">
                    Create something <em>beautiful.</em>
                  </h1>
                  <p className="editorial-subtext">
                    Your ideas. Your craft. Your creative space.
                  </p>
                  
                  {/* Craft Categories Pills */}
                  <div className="craft-tags">
                    <span className="tag">🕯️ Candle</span>
                    <span className="tag">✨ Resin</span>
                    <span className="tag">🧶 Crochet</span>
                    <span className="tag">🏺 Clay</span>
                    <span className="tag">✂️ Paper</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Decorative Corner Leaves */}
          <div className="sage-leaves-corner">
            <svg viewBox="0 0 120 120" fill="none">
              <path d="M10 110 Q 50 80 110 30" stroke="#68745E" strokeWidth="1.5"/>
              <path d="M40 88 C 25 70 45 55 60 72 Z" fill="#A8B39A" opacity="0.7"/>
              <path d="M70 60 C 55 40 75 25 90 42 Z" fill="#68745E" opacity="0.6"/>
              <path d="M20 100 C 5 85 20 70 35 88 Z" fill="#8B735C" opacity="0.5"/>
            </svg>
          </div>

        </div>


        {/* RIGHT SIDE — WARM STUDIO LOGIN PANEL (40-45%) */}
        <div className="studio-form-panel">
          <div className="auth-card">
            
            {/* Header */}
            <div className="auth-header">
              <div className="brand-emblem">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#5B6752" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18M5.5 5.5l13 13M18.5 5.5l-13 13" opacity="0.3"/>
                  <circle cx="12" cy="12" r="8" stroke="#5B6752" strokeWidth="1.5"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v10M7 12h10" stroke="#5B6752"/>
                </svg>
              </div>
              <span className="brand-name">CraftIQ</span>
              <h2 className="auth-title">
                {isSignUp ? 'Join the Studio' : 'Welcome back'}
              </h2>
              <p className="auth-subtitle">
                {isSignUp
                  ? 'Start crafting your products with intelligent tools'
                  : 'Step into your creative space.'}
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="tab-switcher" role="tablist">
              <button
                type="button"
                className={`tab-btn ${!isSignUp ? 'active' : ''}`}
                onClick={() => setIsSignUp(false)}
                role="tab"
                aria-selected={!isSignUp}
              >
                Log In
              </button>
              <button
                type="button"
                className={`tab-btn ${isSignUp ? 'active' : ''}`}
                onClick={() => setIsSignUp(true)}
                role="tab"
                aria-selected={isSignUp}
              >
                Sign Up
              </button>
            </div>

            {/* Google Sign-In Button */}
            <div className="social-group">
              <button
                type="button"
                className="btn-google"
                onClick={handleGoogleSignIn}
                aria-label="Continue with Google"
              >
                <svg className="google-icon" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Divider */}
            <div className="divider">
              <span>Or with email</span>
            </div>

            {/* Form with fade transition key */}
            <form key={isSignUp ? 'signup' : 'login'} className="auth-form" onSubmit={handleSubmit}>
              {/* Full Name field (Sign Up mode) */}
              {isSignUp && (
                <div className="form-group">
                  <label className="form-label" htmlFor="fullName">Full Name</label>
                  <div className="input-wrapper">
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      className="auth-input"
                      placeholder="Jane Artisan"
                      value={formData.fullName}
                      onChange={handleChange}
                      required={isSignUp}
                    />
                    <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Email field */}
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="auth-input"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              {/* Password field */}
              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="••••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Sign Up mode) */}
              {isSignUp && (
                <div className="form-group">
                  <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                  <div className="input-wrapper">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="auth-input"
                      placeholder="••••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required={isSignUp}
                    />
                    <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Form Options */}
              <div className="form-options">
                {!isSignUp ? (
                  <>
                    <label className="remember-me">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        className="custom-checkbox"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                      />
                      <span>Remember me</span>
                    </label>
                    <a
                      href="#forgot"
                      className="forgot-link"
                      onClick={(e) => {
                        e.preventDefault()
                        triggerToast('🌱 Password reset link sent (Visual demo)')
                      }}
                    >
                      Forgot password?
                    </a>
                  </>
                ) : (
                  <label className="remember-me">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      className="custom-checkbox"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      required
                    />
                    <span>I agree to Terms & Privacy Policy</span>
                  </label>
                )}
              </div>

              {/* Primary Button */}
              <button type="submit" className="btn-submit">
                <span>{isSignUp ? 'Create Account →' : 'Enter Studio →'}</span>
              </button>
            </form>

            {/* Footer switch link */}
            <div className="auth-footer">
              {isSignUp ? (
                <p>
                  Already have an account?{' '}
                  <button type="button" onClick={() => setIsSignUp(false)}>
                    Log In
                  </button>
                </p>
              ) : (
                <p>
                  Don't have an account?{' '}
                  <button type="button" onClick={() => setIsSignUp(true)}>
                    Sign Up
                  </button>
                </p>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Demo Toast Notification */}
      {toastMessage && (
        <div className="demo-toast">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
