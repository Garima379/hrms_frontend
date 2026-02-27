import styles from './Input.module.css'

export default function Input({ label, error, id, ...props }) {
  const inputId = id || props.name;
  return (
    <div className={styles.wrap}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <input id={inputId} className={styles.input} {...props} />
      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}
