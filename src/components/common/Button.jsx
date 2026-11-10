// [라이브러리] react-router-dom
// 왜: 버튼 모양으로 화면을 이동해야 해서 Link를 쓴다. 직접 만들면 새로고침 없이 이동하는 기능을 다시 만들어야 한다.
// 어디에: Button (to가 있을 때만)
import { Link } from 'react-router-dom';
import styles from './Button.module.css';

// variant: 'secondary'(기본) | 'primary' | 'quiet'. 주 버튼은 화면당 1개만 쓴다.
// to를 주면 화면 이동 링크가 되고, 주지 않으면 일반 버튼이 된다.
function Button({ variant = 'secondary', to, className = '', children, ...rest }) {
  const variantClass = variant === 'secondary' ? '' : styles[variant];
  const classNames = `${styles.button} ${variantClass} ${className}`;
  if (to) {
    return (
      <Link className={classNames} to={to} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classNames} type="button" {...rest}>
      {children}
    </button>
  );
}

export default Button;
