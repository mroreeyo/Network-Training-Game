// [라이브러리] react: 화면 상태(useState)를 만드는 기본 도구 (자세한 이유는 main.jsx)
import { useState } from 'react';
import Button from '../../components/common/Button.jsx';
import Workbench from '../../components/common/Workbench.jsx';
import { describePeel, judgePeel, PEEL_ORDER } from '../../rules/packetRules.js';
import PacketBox from './PacketBox.jsx';
import styles from './EncapsulateBoard.module.css';

// 벗긴 헤더마다 그 계층이 한 일을 알려 준다.
function RemovedList({ removedLayers }) {
  return (
    <ul className="text-body">
      {removedLayers.map((layer) => (
        <li key={layer}>
          {layer} 헤더를 벗겼어요. {describePeel(layer)}
        </li>
      ))}
    </ul>
  );
}

// 받는 쪽: 도착한 상자에서 바깥 헤더부터 눌러서 벗긴다.
function DecapsulateBoard({ stage, onFinish }) {
  const { arrived } = stage;
  const [removedLayers, setRemovedLayers] = useState([]);
  const remainingLayers = PEEL_ORDER.filter((layer) => !removedLayers.includes(layer));
  const remainingLabels = arrived.labels.filter((card) => remainingLayers.includes(card.layer));
  const finish = () => onFinish({ passed: true, summary: stage.successSummary });

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
      <div className={styles.packing}>
        <p className="text-body">{arrived.destinationName}에 상자가 도착했어요. 가장 바깥 헤더부터 눌러서 벗겨요.</p>
        <PacketBox payload={arrived.payload} labels={remainingLabels} onPickLabel={pickLabel} />
        <RemovedList removedLayers={removedLayers} />
        <Button variant="primary" disabled={remainingLayers.length > 0} onClick={finish}>
          데이터 꺼내기
        </Button>
      </div>
    </Workbench>
  );
}

export default DecapsulateBoard;
