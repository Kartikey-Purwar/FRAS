import EmptyState from './EmptyState.jsx'

export default function AttendanceTable({ records }) {
  return (
    <section className="card">
      <h2>Attendance records</h2>
      {records.length === 0 ? (
        <EmptyState title="No attendance records available yet">
          Attendance will appear here after it is recorded by the FRAS attendance system.
        </EmptyState>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Subject / Class</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {records.map((row) => (
                <tr key={`${row.date}-${row.subject}-${row.time || 'na'}`}>
                  <td>{row.date}</td>
                  <td>{row.subject}</td>
                  <td>
                    <span className={`status-pill status-${row.status.toLowerCase()}`}>
                      {row.status}
                    </span>
                  </td>
                  <td>{row.time || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
