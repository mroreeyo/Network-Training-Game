import EncapsulateBoard from './EncapsulateBoard.jsx';

// 챕터 1 게임판. 모든 챕터의 게임판은 같은 props(stage, onFinish)를 받는다 (계획서 3.5절).
// 지금은 보내는 쪽(캡슐화) 화면만 있다. 받는 쪽(역캡슐화) 화면은 스테이지 5를 만들 때 여기서 고르게 한다.
function PacketBoard({ stage, onFinish }) {
  return <EncapsulateBoard stage={stage} onFinish={onFinish} />;
}

export default PacketBoard;
