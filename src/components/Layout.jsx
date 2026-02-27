import { NavLink } from 'react-router-dom'
import styles from './Layout.module.css'

export default function Layout({ children }) {
  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.container}>
          <h1 className={styles.logo}>HRMS Lite</h1>
          <nav className={styles.nav}>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
              end
            >
              Employees
            </NavLink>
            <NavLink
              to="/attendance"
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
            >
              Attendance
            </NavLink>
          </nav>
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.container}>
          {children}
        </div>
      </main>
    </div>
  )
}
