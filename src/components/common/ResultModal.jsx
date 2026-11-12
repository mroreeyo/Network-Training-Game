import Button from './Button.jsx';
import ConceptCard from './ConceptCard.jsx';
import Modal from './Modal.jsx';
import StarRating from './StarRating.jsx';
import styles from './ResultModal.module.css';

// 판정 결과의 공통 형태 (계획서 3.4절). 챕터를 몰라도 실패 이유를 그릴 수 있다.
//   성공: { passed: true, summary: '배송 완료. ...' }
//   실패: { passed: false, reason: { what, why, next }, record?: { title, rows } }
function FailureText({ reason }) {
  return (
    <div className={styles.reason}>
      <p className="text-body">{reason.what}</p>
      <p className="text-body">{reason.why}</p>
      <p className="text-body">{reason.next}</p>
    </div>
  );
}

// 플레이어가 실제로 붙인 값을 보여 줘서 실패 이유를 확인하게 한다. 정답은 보여 주지 않는다.
function Record({ record }) {
  return (
    <div className={`${styles.record} numeric`}>
      <p className="text-label">{record.title}</p>
      {record.rows.map(([label, value]) => (
        <p key={label} className="text-quiet">
          {label} {value}
        </p>
      ))}
    </div>
  );
}

function ResultBody({ result, stars, conceptCard, notice }) {
  if (!result.passed) {
    return (
      <>
        <FailureText reason={result.reason} />
        {result.record ? <Record record={result.record} /> : null}
      </>
    );
  }
  return (
    <>
      <p className="text-body">{result.summary}</p>
      <div className={styles.rating}>
        <StarRating stars={stars} />
      </div>
      {conceptCard ? <ConceptCard card={conceptCard} /> : null}
      {notice ? <p className="text-label">{notice}</p> : null}
    </>
  );
}

function ResultActions({ passed, next, listPath, onRetry }) {
  return (
    <div className={styles.actions}>
      {passed ? (
        <Button variant="primary" to={next.path}>
          {next.label}
        </Button>
      ) : null}
      <Button variant={passed ? 'secondary' : 'primary'} onClick={onRetry}>
        다시 하기
      </Button>
      <Button to={listPath}>스테이지 목록</Button>
    </div>
  );
}

// next: 통과한 뒤 갈 곳 { path, label, notice }. notice는 챕터를 다 깼을 때처럼 따로 알릴 말이 있을 때만 있다.
function ResultModal({ result, stars, conceptCard, onRetry, next, listPath }) {
  const open = result !== null;
  const passed = open && result.passed;
  return (
    <Modal open={open} onClose={onRetry} titleId="result-title">
      {open ? (
        <div className={styles.inspection}>
          <h2 id="result-title" className={`${styles.stamp} ${passed ? styles.pass : styles.return}`}>
            {passed ? '통과' : '반송'}
          </h2>
          <ResultBody result={result} stars={stars} conceptCard={conceptCard} notice={next.notice} />
          <ResultActions passed={passed} next={next} listPath={listPath} onRetry={onRetry} />
        </div>
      ) : null}
    </Modal>
  );
}

export default ResultModal;
