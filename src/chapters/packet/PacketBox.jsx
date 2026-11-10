import HeaderLabel from '../../components/common/HeaderLabel.jsx';
import { describeHeaderCard } from '../../rules/packetRules.js';
import styles from './PacketBox.module.css';

// 상자에 붙은 라벨 한 장. onPick이 있으면 누를 수 있다.
// data-layer는 받는 쪽 화면이 라벨을 벗긴 뒤 다음 라벨로 키보드 포커스를 옮길 때 쓴다.
function PacketLabel({ card, name, rows, onPick }) {
  if (!onPick) {
    return <HeaderLabel layer={card.layer} name={name} rows={rows} />;
  }
  return (
    <HeaderLabel
      as="button"
      layer={card.layer}
      name={name}
      rows={rows}
      data-layer={card.layer}
      aria-label={`${card.layer} ${name} 벗기기`}
      onClick={() => onPick(card.layer)}
    />
  );
}

// 패킷 상자: 데이터 위에 붙은 라벨이 겹쳐 쌓인다. 화면에는 바깥 헤더가 위에 오도록 뒤집어 쌓는다.
// 안쪽(데이터)부터 적는 이유: 나중에 붙인 라벨이 위에 보여야 "바깥부터 벗긴다"는 규칙이 눈에 보인다.
// children에는 라벨 위에 더 그릴 것(카드를 놓을 자리)을 li로 넘긴다.
// onPickLabel을 주면 라벨을 누를 수 있는 버튼으로 그린다 (받는 쪽에서 벗길 라벨을 고를 때).
function PacketBox({ payload, labels, onPickLabel, children }) {
  return (
    <div className={styles.box}>
      <h2 className="text-label">패킷 상자</h2>
      <ol className={`${styles.labels} numeric`}>
        <li className={styles.dataSlip}>
          <span className="text-label">데이터</span>
          <span>{payload}</span>
        </li>
        {labels.map((card) => {
          const { name, rows } = describeHeaderCard(card);
          return (
            <li key={card.id}>
              <PacketLabel card={card} name={name} rows={rows} onPick={onPickLabel} />
            </li>
          );
        })}
        {children}
      </ol>
    </div>
  );
}

export default PacketBox;
