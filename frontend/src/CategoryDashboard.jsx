import { useParams, Link } from 'react-router-dom'
import './Categories.css'

export default function CategoryDashboard() {
  const { category } = useParams()

  // Format category slug to Title Case
  const formattedCategory = category
    ? category
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : 'Craft'

  return (
    <div className="categories-container dashboard-placeholder-view">
      {/* Top Navbar */}
      <header className="categories-nav">
        <div className="nav-brand">
          <svg className="nav-logo-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5B6752" strokeWidth="2">
            <circle cx="12" cy="12" r="8" stroke="#5B6752" strokeWidth="1.5"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v10M7 12h10" stroke="#5B6752"/>
          </svg>
          <span className="nav-brand-title">CraftIQ</span>
        </div>
        <div className="nav-links">
          <Link to="/categories" className="nav-item">Studio</Link>
          <span className="nav-item">Profile</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        <div className="dashboard-card">
          <div className="dashboard-badge">
            <span>🎨 ARTISAN WORKSPACE</span>
          </div>
          <h1 className="dashboard-title">{formattedCategory} Dashboard</h1>
          <p className="dashboard-subtext">You selected: <strong>{formattedCategory}</strong></p>
          
          <div className="dashboard-info-box">
            <p>Your custom {formattedCategory.toLowerCase()} creation tools, inventory tracker, and AI recipe generators are ready for deployment.</p>
          </div>

          <Link to="/categories" className="btn-back-categories">
            ← Back to Craft Categories
          </Link>
        </div>
      </main>
    </div>
  )
}
