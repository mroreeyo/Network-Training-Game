// [라이브러리] react: 붙인 카드, 고른 카드, 작업 위치 상태(useState)를 만든다 (자세한 이유는 main.jsx)
import { useState } from 'react';
import Button from '../../components/common/Button.jsx';
import DragDropArea from '../../components/common/DragDropArea.jsx';
import DraggableCard from '../../components/common/DraggableCard.jsx';
import DropZone from '../../components/common/DropZone.jsx';
import PartsTray from '../../components/common/PartsTray.jsx';
import Workbench from '../../components/common/Workbench.jsx';
import { advanceAfterPass, describeHeaderCard, judgeStep } from '../../rules/packetRules.js';
import PacketBox from './PacketBox.jsx';
import RouteView from './RouteView.jsx';
import styles from './EncapsulateBoard.module.css';

const NEXT_LABEL_ZONE = 'next-label';

// 상자에 붙이는 카드의 상태: 이번 작업에서 붙인 카드, 지금 고른 카드(selectedId), 트레이에 남은 카드.
function useAttachedCards(step) {
  const [attached, setAttached] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const trayCards = step.tray.filter((card) => !attached.some((item) => item.id === card.id));

  // 드래그로 놓든 카드와 자리를 차례로 누르든 이 함수 하나를 부른다.
  function placeCard(cardId, zoneId) {
    const card = trayCards.find((item) => item.id === cardId);
    const isFull = attached.length >= step.layers.length;
    if (zoneId !== NEXT_LABEL_ZONE || !card || isFull) {
      return;
    }
    setAttached([...attached, card]);
    setSelectedId(null);
  }

  function undoLastLabel() {
    setAttached(attached.slice(0, -1));
    setSelectedId(null);
  }

  function clearAttached() {
    setAttached([]);
    setSelectedId(null);
  }

  return { attached, trayCards, selectedId, setSelectedId, placeCard, undoLastLabel, clearAttached };
}

// 보내는 쪽: 헤더 카드를 순서대로 붙여서 목적지까지 보낸다.
// 상태: 지금 몇 번째 배송의 몇 번째 작업인지, 상자에 이미 붙은 라벨.
// 판정이 끝나면 연출을 기다리지 않고 바로 onFinish를 부른다 (계획서 3.5절).
// 커스텀 훅을 쓰는 이유: 상태와 처리 함수가 길어서 화면 코드와 나눠야 함수 하나를 30줄 안에서 읽을 수 있다.
function useEncapsulation(stage, onFinish) {
  const [position, setPosition] = useState({ deliveryIndex: 0, stepIndex: 0, labels: [] });
  const [notice, setNotice] = useState('');
  const delivery = stage.deliveries[position.deliveryIndex];
  const step = delivery.steps[position.stepIndex];
  const cards = useAttachedCards(step);

  function sendPacket() {
    const result = judgeStep(step, cards.attached, delivery);
    if (!result.passed) {
      onFinish(result);
      return;
    }
    const next = advanceAfterPass({
      ...position,
      attached: cards.attached,
      delivery,
      deliveryCount: stage.deliveries.length,
    });
    if (next.kind === 'finished') {
      onFinish({ passed: true, summary: stage.successSummary });
      return;
    }
    const following = stage.deliveries[next.deliveryIndex];
    setNotice(next.kind === 'next-delivery' ? `${delivery.application} 배송 완료. 이어서 ${following.application}을 보내요.` : '');
    setPosition({ deliveryIndex: next.deliveryIndex, stepIndex: next.stepIndex, labels: next.labels });
    cards.clearAttached();
  }

  return { ...cards, delivery, step, labels: position.labels, notice, sendPacket };
}

function BoxArea({ board }) {
  const { step, attached, selectedId } = board;
  const isFull = attached.length >= step.layers.length;
  const zoneName = step.layers.length === 1 ? `${step.layers[0]} 헤더 자리` : '다음 헤더 자리';
  const zoneHint = selectedId ? '고른 카드를 여기에 붙여요.' : '부품 트레이에서 카드를 먼저 골라요.';
  return (
    <div className={styles.packing}>
      <p className="text-body">{step.prompt}</p>
      <PacketBox payload={board.delivery.payload} labels={[...board.labels, ...attached]}>
        {isFull ? null : (
          <li>
            <DropZone id={NEXT_LABEL_ZONE} name={zoneName} hint={zoneHint} ready={selectedId !== null} onActivate={() => board.placeCard(selectedId, NEXT_LABEL_ZONE)} />
          </li>
        )}
      </PacketBox>
      <div className={styles.actions}>
        <Button variant="primary" disabled={!isFull} onClick={board.sendPacket}>
          패킷 보내기
        </Button>
        <Button variant="quiet" disabled={attached.length === 0} onClick={board.undoLastLabel}>
          마지막 라벨 떼기
        </Button>
      </div>
      <p className="text-quiet">{isFull ? '라벨을 모두 붙였어요. 패킷을 보내 보세요.' : `헤더 ${step.layers.length}장을 붙이면 보낼 수 있어요.`}</p>
      {board.notice ? <p className="text-label">{board.notice}</p> : null}
    </div>
  );
}

function EncapsulateBoard({ stage, onFinish }) {
  const board = useEncapsulation(stage, onFinish);
  const stopIndex = board.step.segmentIndex;
  const trayTitle = `부품 트레이: 헤더 카드 ${board.trayCards.length}장`;

  return (
    <DragDropArea onDropCard={board.placeCard} onSelectCard={board.setSelectedId}>
      <Workbench>
        <RouteView delivery={board.delivery} stopIndex={stopIndex} />
        <BoxArea board={board} />
      </Workbench>
      <PartsTray title={trayTitle}>
        {board.trayCards.map((card) => {
          const { name, rows } = describeHeaderCard(card);
          return (
            <li key={card.id}>
              <DraggableCard id={card.id} layer={card.layer} name={name} rows={rows} selected={board.selectedId === card.id} onSelect={board.setSelectedId} />
            </li>
          );
        })}
      </PartsTray>
    </DragDropArea>
  );
}

export default EncapsulateBoard;
