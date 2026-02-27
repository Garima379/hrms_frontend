import { useState, useEffect } from 'react'
import { api } from '../api/client'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import styles from './Attendance.module.css'

const STATUS_OPTIONS = [
  { value: 'Present', label: 'Present' },
  { value: 'Absent', label: 'Absent' },
]

export default function Attendance() {
  const [employees, setEmployees] = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    employee_id: '',
    date: new Date().toISOString().slice(0, 10),
    status: 'Present',
  })
  const [formErrors, setFormErrors] = useState({})
  const [filterDate, setFilterDate] = useState('')
  const [filterEmployeeId, setFilterEmployeeId] = useState('')

  async function fetchEmployees() {
    try {
      const data = await api.employees.list()
      setEmployees(data)
    } catch (err) {
      setError(err.message || 'Failed to load employees.')
    }
  }

  async function fetchAttendance() {
    setAttendanceLoading(true)
    setError(null)
    try {
      const params = {}
      if (filterDate) params.date = filterDate
      if (filterEmployeeId) params.employee_id = filterEmployeeId
      const data = await api.attendance.list(params)
      setAttendance(data)
    } catch (err) {
      setError(err.message || 'Failed to load attendance.')
    } finally {
      setAttendanceLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchEmployees(), fetchAttendance()]).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!loading) fetchAttendance()
  }, [filterDate, filterEmployeeId])

  function handleChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: null }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormErrors({})
    setSubmitting(true)
    try {
      await api.attendance.create({
        employee_id: formData.employee_id.trim(),
        date: formData.date,
        status: formData.status,
      })
      setFormData((prev) => ({ ...prev, employee_id: '', date: new Date().toISOString().slice(0, 10), status: 'Present' }))
      setFormOpen(false)
      fetchAttendance()
      fetchAllAttendance()
    } catch (err) {
      if (err.details && typeof err.details === 'object') {
        setFormErrors(err.details)
      } else {
        setFormErrors({ _: err.message })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const [allAttendance, setAllAttendance] = useState([])
  async function fetchAllAttendance() {
    try {
      const data = await api.attendance.list()
      setAllAttendance(data)
    } catch (_) {}
  }
  useEffect(() => {
    if (!loading) fetchAllAttendance()
  }, [loading])
  const presentCountByEmployee = allAttendance.reduce((acc, r) => {
    if (r.status === 'Present') acc[r.employee_id] = (acc[r.employee_id] || 0) + 1
    return acc
  }, {})

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Attendance</h1>
        <Button onClick={() => setFormOpen(!formOpen)}>
          {formOpen ? 'Cancel' : 'Mark Attendance'}
        </Button>
      </div>

      {formOpen && (
        <Card title="Mark attendance">
          <form onSubmit={handleSubmit} className={styles.form}>
            {formErrors._ && <p className={styles.formError}>{formErrors._}</p>}
            <div className={styles.formRow}>
              <Input
                label="Employee ID"
                name="employee_id"
                value={formData.employee_id}
                onChange={handleChange}
                placeholder="e.g. E001"
                error={formErrors.employee_id}
                required
              />
              <Input
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                error={formErrors.date}
                required
              />
              <div className={styles.selectWrap}>
                <label className={styles.label}>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={styles.select}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save'}
            </Button>
          </form>
        </Card>
      )}

      <Card title="Filters">
        <div className={styles.filters}>
          <Input
            label="Filter by date"
            name="filterDate"
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          <Input
            label="Filter by Employee ID"
            name="filterEmployeeId"
            value={filterEmployeeId}
            onChange={(e) => setFilterEmployeeId(e.target.value)}
            placeholder="e.g. E001"
          />
        </div>
      </Card>

      <Card title="Attendance records">
        {loading && (
          <div className={styles.loading}>
            <Spinner />
            <span>Loading…</span>
          </div>
        )}
        {error && (
          <div className={styles.error}>
            {error}
            <Button variant="secondary" onClick={() => { setError(null); fetchAttendance(); }}>Retry</Button>
          </div>
        )}
        {!loading && !error && attendance.length === 0 && (
          <EmptyState message="No attendance records. Mark attendance using the button above or adjust filters." />
        )}
        {!loading && !error && attendance.length > 0 && (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((r) => (
                    <tr key={r.id}>
                      <td>{r.date}</td>
                      <td>{r.employee_id}</td>
                      <td>{r.employee_name}</td>
                      <td>
                        <span className={r.status === 'Present' ? styles.present : styles.absent}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      {!loading && !error && employees.length > 0 && (
        <Card title="Summary – Present days per employee">
          <div className={styles.summary}>
            {employees.map((emp) => (
              <div key={emp.id} className={styles.summaryItem}>
                <span className={styles.summaryName}>{emp.full_name}</span>
                <span className={styles.summaryBadge}>
                  {presentCountByEmployee[emp.employee_id] ?? 0} present
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  )
}
