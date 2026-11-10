import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import PartsTray from '../components/common/PartsTray.jsx';
import Workbench from '../components/common/Workbench.jsx';
import { chapters } from '../data/chapters.js';
import { StageSession } from './StagePage.jsx';

// 스테이지 틀(작업 지시서, 힌트, 작업대, 부품 트레이, 결과 화면)을 확인하는 임시 화면이다.
// 진짜 게임판이 아직 없어서, 버튼으로 통과·반송 결과를 내는 점검용 게임판을 끼워 넣었다.
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

// 모든 게임판과 같은 props(stage, onFinish)를 받는다.
function PreviewBoard({ onFinish }) {
  return (
    <>
      <Workbench>
        <p className="text-body">여기에 챕터별 게임판이 들어가요. 아래 버튼으로 결과 화면을 확인해요.</p>
        <Button variant="primary" onClick={() => onFinish(passResult)}>
          통과 결과 보기
        </Button>
        <Button onClick={() => onFinish(returnResult)}>반송 결과 보기</Button>
      </Workbench>
      <PartsTray title="부품 트레이: 카드 3장">
        <li>
          <Card>카드 1</Card>
        </li>
        <li>
          <Card>카드 2</Card>
        </li>
        <li>
          <Card>카드 3</Card>
        </li>
      </PartsTray>
    </>
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
