// [라이브러리] react-router-dom: 버튼 모양으로 화면을 이동할 때 Link를 쓴다 (자세한 이유는 App.jsx)
import { Link } from 'react-router-dom';
import styles from './Button.module.css';

// variant: 'secondary'(기본) | 'primary' | 'quiet'. 주 버튼은 화면당 1개만 쓴다.
// to를 주면 화면을 이동하는 링크가 되고, 주지 않으면 일반 버튼이 된다.
// disabled, onClick 같은 나머지 값은 그대로 넘긴다.
function Button({ variant = 'secondary', to, className = '', children, ...rest }) {
  // 'secondary'나 잘못 쓴 값처럼 CSS에 클래스가 없는 variant는 빈 글자로 둔다.
  // 그대로 넣으면 class에 'undefined'라는 글자가 들어간다.
  const variantClass = styles[variant] || '';
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
