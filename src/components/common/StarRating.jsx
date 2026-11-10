import styles from './StarRating.module.css';

// 별 대신 검수 스티커 3칸. 색만으로 알리지 않으려고 얻은 칸에는 '검수' 글자를 쓴다.
function StarRating({ stars, maxStars = 3 }) {
  const cells = [];
  for (let index = 1; index <= maxStars; index += 1) {
    const earned = index <= stars;
    const earnedClass = earned ? styles.earned : '';
    cells.push(
      <li key={index} className={`${styles.sticker} ${earnedClass}`}>
        {earned ? '검수' : ''}
      </li>,
    );
  }
  return (
    <ul className={styles.stickers} role="img" aria-label={`별점 ${maxStars}개 중 ${stars}개`}>
      {cells}
    </ul>
  );
}

export default StarRating;
