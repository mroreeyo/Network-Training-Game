import DecapsulateBoard from './DecapsulateBoard.jsx';
import EncapsulateBoard from './EncapsulateBoard.jsx';

// 챕터 1 게임판. 모든 챕터의 게임판은 같은 props(stage, onFinish)를 받는다 (계획서 3.5절).
// 받은 상자를 벗기는 스테이지(arrived가 있음)는 받는 쪽 화면, 나머지는 보내는 쪽 화면을 쓴다.
function PacketBoard({ stage, onFinish }) {
  if (stage.arrived) {
    return <DecapsulateBoard stage={stage} onFinish={onFinish} />;
  }
  return <EncapsulateBoard stage={stage} onFinish={onFinish} />;
}

export default PacketBoard;
