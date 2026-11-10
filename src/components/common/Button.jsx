import styles from './Button.module.css';

// variant: 'secondary'(기본) | 'primary' | 'quiet'. 주 버튼은 화면당 1개만 쓴다.
// disabled, onClick 같은 나머지 값은 button에 그대로 넘긴다.
function Button({ variant = 'secondary', className = '', children, ...rest }) {
  // 'secondary'나 잘못 쓴 값처럼 CSS에 클래스가 없는 variant는 빈 글자로 둔다.
  // 그대로 넣으면 class에 'undefined'라는 글자가 들어간다.
  const variantClass = styles[variant] || '';
  return (
    <button className={`${styles.button} ${variantClass} ${className}`} type="button" {...rest}>
      {children}
    </button>
  );
}

export default Button;
