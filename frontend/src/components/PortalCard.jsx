import { Link } from 'react-router-dom'

export default function PortalCard({ to, icon: Icon, title, description, actionLabel }) {
  return (
    <Link to={to} className="portal-card">
      <span className="portal-icon" aria-hidden="true">
        <Icon size={22} strokeWidth={1.75} />
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      <span className="portal-action">{actionLabel}</span>
    </Link>
  )
}
