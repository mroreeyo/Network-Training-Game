import DecapsulateBoard from './DecapsulateBoard.jsx';
import EncapsulateBoard from './EncapsulateBoard.jsx';

// 챕터 1 게임판. 모든 챕터의 게임판은 같은 props(stage, onFinish)를 받는다 (계획서 3.5절).
// 스테이지 모드에 따라 보내는 쪽(캡슐화)과 받는 쪽(역캡슐화) 화면을 고른다.
function PacketBoard({ stage, onFinish }) {
  if (stage.mode === 'decapsulate') {
    return <DecapsulateBoard stage={stage} onFinish={onFinish} />;
  }
  return <EncapsulateBoard stage={stage} onFinish={onFinish} />;
}

export default PacketBoard;
