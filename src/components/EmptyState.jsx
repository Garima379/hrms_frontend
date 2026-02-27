import styles from './EmptyState.module.css'

export default function EmptyState({ message, icon }) {
  return (
    <div className={styles.wrap}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <p className={styles.message}>{message}</p>
    </div>
  )
}
