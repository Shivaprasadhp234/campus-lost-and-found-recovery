import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { homeFor, titleCase } from '../utils/format'

const ICONS = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  building: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
      <path d="M16 9h2a2 2 0 0 1 2 2v10" />
      <path d="M2 21h20M8 7h4M8 11h4M8 15h4M8 19h4" />
    </svg>
  ),
}

const NAV_ITEMS = {
  OWNER: [
    { to: '/owner', label: 'Dashboard', icon: ICONS.dashboard, end: true },
    { to: '/owner/properties', label: 'Properties', icon: ICONS.building },
  ],
  MANAGER: [{ to: '/manager', label: 'Dashboard', icon: ICONS.dashboard, end: true }],
  TENANT: [{ to: '/tenant', label: 'Dashboard', icon: ICONS.dashboard, end: true }],
}

function initials(name) {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'PG'
}

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const items = NAV_ITEMS[user?.role] || []

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink to={homeFor(user?.role)} className="brand">
          <span className="brand-mark">PG</span>
          <span className="brand-text">
            <strong>PG Manager</strong>
            <small>Hostel &amp; PG operations</small>
          </span>
        </NavLink>

        <nav className="side-nav" aria-label="Main navigation">
          <p className="side-label">Menu</p>
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="sidebar-user">
            <span className="avatar">{initials(user?.fullName)}</span>
            <span className="sidebar-user-text">
              <strong>{user?.fullName}</strong>
              <small>{titleCase(user?.role)}</small>
            </span>
          </div>
          <button type="button" className="sidebar-logout" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
              <path d="M10 17l5-5-5-5M15 12H3" />
            </svg>
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <div className="app-main">
        <main className="page">{children}</main>
        <footer className="footer">
          <span>PG Manager</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </footer>
      </div>
    </div>
  )
}
