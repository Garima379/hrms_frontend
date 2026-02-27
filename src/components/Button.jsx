import styles from './Button.module.css'

export default function Button({ children, variant = 'primary', type = 'button', disabled, ...props }) {
  return (
    <button
      type={type}
      className={`${styles.btn} ${styles[variant]}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
