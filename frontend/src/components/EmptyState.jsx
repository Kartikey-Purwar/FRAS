export default function EmptyState({ title, children }) {
  return (
    <div className="empty-state" role="status">
      {title ? <p className="empty-state-title">{title}</p> : null}
      <p>{children}</p>
    </div>
  )
}
