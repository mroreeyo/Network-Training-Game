// [라이브러리] react: 목표를 접고 펴는 상태(useState)를 만든다 (자세한 이유는 main.jsx)
import { useState } from 'react';
import Button from './Button.jsx';
import Card from './Card.jsx';
import styles from './StageHeader.module.css';

// 작업 지시서: 스테이지 제목, 목표, 지금까지의 반송 횟수를 보여 준다.
// 휴대폰에서는 제목 한 줄만 보여 주고 목표·힌트는 접어 둬서 게임판이 화면에 먼저 보이게 한다
// (0단계 검수 기록 결정 A). 넓은 화면에서는 항상 펼쳐져 있다.
function StageHeader({ stage, mistakeCount, children }) {
  const [open, setOpen] = useState(false);
  const detailClass = `${styles.detail} ${open ? styles.open : ''}`;

  return (
    <Card className={styles.order}>
      <h1 className="title-section">
        스테이지 {stage.number}. {stage.title}
      </h1>
      <Button variant="quiet" className={styles.toggle} aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? '목표 접기' : '목표와 힌트 보기'}
      </Button>
      <div className={detailClass}>
        <p className="text-body">{stage.goal}</p>
        <div className={styles.side}>
          <p className="text-quiet numeric">반송 {mistakeCount}번</p>
          {children}
        </div>
      </div>
    </Card>
  );
}

export default StageHeader;
