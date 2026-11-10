// [라이브러리] react: 붙인 카드와 고른 카드 상태(useState)를 만든다 (자세한 이유는 main.jsx)
import { useState } from 'react';
import Button from '../components/common/Button.jsx';
import DragDropArea from '../components/common/DragDropArea.jsx';
import DraggableCard from '../components/common/DraggableCard.jsx';
import DropZone from '../components/common/DropZone.jsx';
import HeaderLabel from '../components/common/HeaderLabel.jsx';
import PartsTray from '../components/common/PartsTray.jsx';
import Workbench from '../components/common/Workbench.jsx';
import { chapters } from '../data/chapters.js';
import { StageSession } from './StagePage.jsx';

// 스테이지 틀(작업 지시서, 힌트, 작업대, 부품 트레이, 결과 화면)을 확인하는 임시 화면이다.
// 진짜 게임판이 아직 없어서, 카드를 붙여 보고 버튼으로 통과·반송 결과를 내는 점검용 게임판을 끼워 넣었다.
// 챕터 1 게임판을 만들면 이 파일과 주소(/preview/stage-frame)를 지운다.
const sampleStage = {
  number: 2,
  title: '라우터 1대를 거쳐 보내기',
  goal: 'PC A의 파일 조각을 서버 B까지 보내요. 라우터를 지날 때마다 L2 헤더를 새로 붙여야 해요.',
  hints: [
    'IP 헤더의 목적지는 라우터가 아니라 최종 목적지(서버 B)예요.',
    '라우터를 지나면 L2 헤더가 떼어져요. 구간 2의 출발지 MAC은 라우터의 오른쪽 MAC이에요.',
  ],
};

const sampleConceptCard = {
  id: 'preview',
  title: 'MAC은 구간마다 바뀐다',
  lines: [
    'IP 주소는 출발지에서 최종 목적지까지 그대로예요.',
    'MAC 주소는 같은 네트워크 안에서만 통해서, 구간마다 출발지와 목적지가 바뀌어요.',
    '라우터는 L2 헤더를 떼고, 다음 구간용 L2 헤더를 새로 붙여 내보내요.',
  ],
};

const passResult = {
  passed: true,
  summary: '배송 완료. 라우터에서 L2 헤더를 새로 붙였고, IP 주소는 끝까지 그대로였어요.',
};

const returnResult = {
  passed: false,
  reason: {
    what: '패킷이 반송됐어요.',
    why: '라우터를 지났는데 이전 구간의 MAC 주소가 그대로예요.',
    next: 'L2 헤더를 새로 붙여 보세요.',
  },
  record: {
    title: '붙인 L2 이더넷 헤더',
    rows: [
      ['출발지 MAC', 'AA:AA:AA:00:00:0A'],
      ['목적지 MAC', '11:11:11:00:00:01'],
    ],
  },
};

const sampleCards = [
  { id: 'tcp', layer: 'L4', name: 'TCP 헤더', rows: [['목적지 포트', '443']] },
  { id: 'ip', layer: 'L3', name: 'IP 헤더', rows: [['출발지 IP', '192.168.0.10'], ['목적지 IP', '10.0.0.20']] },
  { id: 'eth', layer: 'L2', name: '이더넷 헤더', rows: [['출발지 MAC', 'AA:AA:AA:00:00:0A'], ['목적지 MAC', '11:11:11:00:00:01']] },
];
const SAMPLE_ZONE = 'sample-zone';

// 붙인 라벨 목록과 카드를 놓을 자리. 고른 카드가 있으면 자리가 테이프색으로 바뀐다.
function SampleBox({ attached, selectedId, onPlace }) {
  const zoneHint = selectedId ? '고른 카드를 여기에 붙여요.' : '부품 트레이에서 카드를 먼저 골라요.';
  return (
    <>
      <ul className="text-body">
        {attached.map((card) => (
          <li key={card.id}>
            <HeaderLabel layer={card.layer} name={card.name} rows={card.rows} />
          </li>
        ))}
      </ul>
      <DropZone id={SAMPLE_ZONE} name="다음 헤더 자리" hint={zoneHint} ready={selectedId !== null} onActivate={() => onPlace(selectedId, SAMPLE_ZONE)} />
    </>
  );
}

function SampleTray({ cards, selectedId, onSelect }) {
  return (
    <PartsTray title={`부품 트레이: 헤더 카드 ${cards.length}장`}>
      {cards.map((card) => (
        <li key={card.id}>
          <DraggableCard id={card.id} layer={card.layer} name={card.name} rows={card.rows} selected={selectedId === card.id} onSelect={onSelect} />
        </li>
      ))}
    </PartsTray>
  );
}

// 모든 게임판과 같은 props(stage, onFinish)를 받는다.
function PreviewBoard({ onFinish }) {
  const [attachedIds, setAttachedIds] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const attached = attachedIds.map((id) => sampleCards.find((card) => card.id === id));
  const trayCards = sampleCards.filter((card) => !attachedIds.includes(card.id));

  // 드래그로 놓든 카드와 자리를 차례로 누르든 이 함수 하나를 부른다.
  function placeCard(cardId, zoneId) {
    const inTray = trayCards.some((card) => card.id === cardId);
    if (zoneId !== SAMPLE_ZONE || !inTray) {
      return;
    }
    setAttachedIds([...attachedIds, cardId]);
    setSelectedId(null);
  }

  return (
    <DragDropArea onDropCard={placeCard} onSelectCard={setSelectedId}>
      <Workbench>
        <SampleBox attached={attached} selectedId={selectedId} onPlace={placeCard} />
        <Button variant="primary" onClick={() => onFinish(passResult)}>
          통과 결과 보기
        </Button>
        <Button onClick={() => onFinish(returnResult)}>반송 결과 보기</Button>
      </Workbench>
      <SampleTray cards={trayCards} selectedId={selectedId} onSelect={setSelectedId} />
    </DragDropArea>
  );
}

// 점검 화면이라서 진행도를 저장하지 않는다 (onCleared가 아무 일도 하지 않는다).
function StageFramePreviewPage() {
  return (
    <StageSession
      chapter={chapters[0]}
      stage={sampleStage}
      Board={PreviewBoard}
      conceptCard={sampleConceptCard}
      onCleared={() => {}}
    />
  );
}

export default StageFramePreviewPage;
