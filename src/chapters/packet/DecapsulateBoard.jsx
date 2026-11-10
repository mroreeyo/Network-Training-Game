// [라이브러리] react: 벗긴 헤더 상태(useState)와 포커스 옮기기(useEffect, useRef) (자세한 이유는 main.jsx)
import { useEffect, useRef, useState } from 'react';
import Button from '../../components/common/Button.jsx';
import Workbench from '../../components/common/Workbench.jsx';
import { describePeel, judgePeel, PEEL_ORDER } from '../../rules/packetRules.js';
import PacketBox from './PacketBox.jsx';
import styles from './EncapsulateBoard.module.css';

// 벗긴 헤더마다 그 계층이 한 일을 알려 준다.
// role="status": 헤더를 벗길 때마다 화면 낭독기가 새 줄을 읽어 준다.
// role을 ul이 아니라 감싸는 div에 주는 이유: ul에 주면 목록이라는 정보가 사라진다.
function RemovedList({ removedLayers }) {
  return (
    <div role="status">
      <ul className="text-body">
        {removedLayers.map((layer) => (
          <li key={layer}>
            {layer} 헤더를 벗겼어요. {describePeel(layer)}
          </li>
        ))}
      </ul>
    </div>
  );
}

// 누른 라벨이 사라지면 키보드 포커스가 화면 맨 앞으로 빠진다.
// 다음에 벗길 라벨로, 다 벗겼으면 "데이터 꺼내기" 버튼으로 포커스를 옮긴다.
// removedLayers(상태)만 지켜보는 이유: 렌더마다 새로 만드는 배열을 지켜보면 힌트 버튼을 누를 때처럼
// 다른 이유로 다시 그려질 때도 포커스를 빼앗는다.
// 커스텀 훅을 쓰는 이유: 포커스 옮기기는 화면 그리기와 따로 읽혀야 DecapsulateBoard가 30줄 안에 든다.
function useFocusNextLabel(areaRef, removedLayers) {
  useEffect(() => {
    if (removedLayers.length === 0) {
      return;
    }
    const area = areaRef.current;
    const next = PEEL_ORDER.find((layer) => !removedLayers.includes(layer));
    const target = next ? area.querySelector(`[data-layer="${next}"]`) : area.querySelector('[data-finish]');
    target.focus();
  }, [areaRef, removedLayers]);
}

// 받는 쪽: 도착한 상자에서 바깥 헤더부터 눌러서 벗긴다.
function DecapsulateBoard({ stage, onFinish }) {
  const { arrived } = stage;
  const areaRef = useRef(null);
  const [removedLayers, setRemovedLayers] = useState([]);
  const remainingLayers = PEEL_ORDER.filter((layer) => !removedLayers.includes(layer));
  const remainingLabels = arrived.labels.filter((card) => remainingLayers.includes(card.layer));
  useFocusNextLabel(areaRef, removedLayers);

  // 판정이 끝나면 연출을 기다리지 않고 바로 onFinish를 부른다 (계획서 3.5절).
  function pickLabel(layer) {
    const result = judgePeel(remainingLayers, layer);
    if (!result.passed) {
      onFinish(result);
      return;
    }
    setRemovedLayers([...removedLayers, layer]);
  }

  return (
    <Workbench>
      <div className={styles.packing} ref={areaRef}>
        <p className="text-body">{arrived.destinationName}에 상자가 도착했어요. 가장 바깥에 붙은 헤더부터 눌러서 벗겨요.</p>
        <PacketBox payload={arrived.payload} labels={remainingLabels} onPickLabel={pickLabel} />
        <RemovedList removedLayers={removedLayers} />
        <Button variant="primary" data-finish disabled={remainingLayers.length > 0} onClick={() => onFinish({ passed: true, summary: stage.successSummary })}>
          데이터 꺼내기
        </Button>
      </div>
    </Workbench>
  );
}

export default DecapsulateBoard;
