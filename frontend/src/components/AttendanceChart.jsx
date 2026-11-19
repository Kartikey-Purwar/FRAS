import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import EmptyState from './EmptyState.jsx'

const COLORS = {
  Present: '#1e3a8a',
  Absent: '#94a3b8',
}

export default function AttendanceChart({ totals, percentage }) {
  const hasRecords = totals.classes > 0
  const data = [
    { name: 'Present', value: totals.present },
    { name: 'Absent', value: totals.absent },
  ]

  return (
    <section className="card">
      <h2>Attendance overview</h2>
      <div className="stat-row">
        <div>
          <p className="stat-label">Recorded classes</p>
          <p className="stat-value">{totals.classes}</p>
        </div>
        <div>
          <p className="stat-label">Present</p>
          <p className="stat-value">{totals.present}</p>
        </div>
        <div>
          <p className="stat-label">Absent</p>
          <p className="stat-value">{totals.absent}</p>
        </div>
        <div>
          <p className="stat-label">Attendance</p>
          <p className="stat-value">
            {percentage == null ? 'Unavailable' : `${percentage}%`}
          </p>
        </div>
      </div>
      {hasRecords ? (
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <EmptyState title="No attendance to chart">
          A present/absent chart will appear here after FRAS records attendance.
        </EmptyState>
      )}
    </section>
  )
}
