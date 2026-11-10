import styles from './Button.module.css';

// variant: 'secondary'(기본) | 'primary' | 'quiet'. 주 버튼은 화면당 1개만 쓴다.
// disabled, onClick 같은 나머지 값은 button에 그대로 넘긴다.
function Button({ variant = 'secondary', className = '', children, ...rest }) {
  const variantClass = variant === 'secondary' ? '' : styles[variant];
  return (
    <button className={`${styles.button} ${variantClass} ${className}`} type="button" {...rest}>
      {children}
    </button>
  );
}

export default Button;
