import { useState, useEffect } from 'react'
import { api } from '../api/client'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import styles from './Employees.module.css'

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    employee_id: '',
    full_name: '',
    email: '',
    department: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const [deleteId, setDeleteId] = useState(null)

  async function fetchEmployees() {
    setLoading(true)
    setError(null)
    try {
      const data = await api.employees.list()
      setEmployees(data)
    } catch (err) {
      setError(err.message || 'Failed to load employees.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

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
      await api.employees.create(formData)
      setFormData({ employee_id: '', full_name: '', email: '', department: '' })
      setFormOpen(false)
      fetchEmployees()
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

  async function handleDelete(emp) {
    if (!window.confirm(`Delete employee "${emp.full_name}" (${emp.employee_id})?`)) return
    setDeleteId(emp.id)
    try {
      await api.employees.delete(emp.id)
      fetchEmployees()
    } catch (err) {
      setError(err.message || 'Failed to delete employee.')
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Employees</h1>
        <Button onClick={() => setFormOpen(!formOpen)}>
          {formOpen ? 'Cancel' : 'Add Employee'}
        </Button>
      </div>

      {formOpen && (
        <Card title="Add new employee">
          <form onSubmit={handleSubmit} className={styles.form}>
            {formErrors._ && <p className={styles.formError}>{formErrors._}</p>}
            <div className={styles.formGrid}>
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
                label="Full Name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="John Doe"
                error={formErrors.full_name}
                required
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@company.com"
                error={formErrors.email}
                required
              />
              <Input
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Engineering"
                error={formErrors.department}
                required
              />
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Adding…' : 'Add Employee'}
            </Button>
          </form>
        </Card>
      )}

      <Card title="All employees">
        {loading && (
          <div className={styles.loading}>
            <Spinner />
            <span>Loading employees…</span>
          </div>
        )}
        {error && (
          <div className={styles.error}>
            {error}
            <Button variant="secondary" onClick={fetchEmployees}>Retry</Button>
          </div>
        )}
        {!loading && !error && employees.length === 0 && (
          <EmptyState message="No employees yet. Add one using the button above." />
        )}
        {!loading && !error && employees.length > 0 && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.employee_id}</td>
                    <td>{emp.full_name}</td>
                    <td>{emp.email}</td>
                    <td>{emp.department}</td>
                    <td>
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(emp)}
                        disabled={deleteId === emp.id}
                      >
                        {deleteId === emp.id ? 'Deleting…' : 'Delete'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}
