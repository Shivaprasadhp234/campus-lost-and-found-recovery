const STATUS_TONES = {
  PAID: 'success',
  RESOLVED: 'success',
  ACTIVE: 'success',
  AVAILABLE: 'success',
  OWNER: 'info',
  MANAGER: 'info',
  TENANT: 'neutral',
  PENDING: 'warning',
  OPEN: 'warning',
  IN_PROGRESS: 'warning',
  OVERDUE: 'danger',
  FULL: 'danger',
  MAINTENANCE: 'danger',
  ENDED: 'neutral',
  CLOSED: 'neutral',
}

export function Badge({ tone = 'neutral', children }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}

export function StatusBadge({ status }) {
  return <Badge tone={STATUS_TONES[status] || 'neutral'}>{String(status || '').replaceAll('_', ' ')}</Badge>
}

export function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <div className="page-header">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  )
}

export function Card({ title, subtitle, actions, children, className = '' }) {
  return (
    <section className={`card ${className}`.trim()}>
      {(title || actions) && (
        <div className="card-head">
          <div>
            {title && <h2>{title}</h2>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  )
}

export function StatCard({ label, value, hint, tone = 'default' }) {
  return (
    <div className={`stat-card stat-${tone}`}>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      {hint && <p className="stat-hint">{hint}</p>}
    </div>
  )
}

export function Loading({ label = 'Loading…' }) {
  return (
    <div className="loading" role="status">
      <span className="spinner" aria-hidden="true" />
      {label}
    </div>
  )
}

export function LoadingScreen() {
  return (
    <div className="loading-screen">
      <Loading label="Checking your session…" />
    </div>
  )
}

export function ErrorNotice({ message, onRetry }) {
  if (!message) return null
  return (
    <div className="notice notice-error" role="alert">
      <span>{message}</span>
      {onRetry && (
        <button type="button" className="button button-small button-ghost" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  )
}

export function SuccessNotice({ message }) {
  if (!message) return null
  return (
    <div className="notice notice-success" role="status">
      {message}
    </div>
  )
}

export function InfoNotice({ children }) {
  return <div className="notice notice-info">{children}</div>
}

export function EmptyState({ title, description, children }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {children}
    </div>
  )
}

export function Field({ label, hint, error, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && !error && <span className="field-hint">{hint}</span>}
      {error && <span className="field-error">{error}</span>}
    </label>
  )
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          className={`tab ${active === tab.id ? 'tab-active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
