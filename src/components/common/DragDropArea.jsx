// [라이브러리] @dnd-kit/core
// 왜: 챕터 1에서 헤더 카드를 드래그해서 패킷 상자에 붙이는 기능이 필요하다.
//     브라우저 기본 드래그 기능은 모바일 터치에서 동작하지 않아서 직접 만들기 어렵다.
//     react-beautiful-dnd 대신 고른 이유: 개발이 중단되었고, dnd-kit이 더 가볍다.
// 어디에: DragDropArea, DraggableCard, DropZone 공통 컴포넌트
import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';

// 이 거리(px)보다 적게 움직였으면 끈 것이 아니라 누른 것으로 본다.
const DRAG_DISTANCE = 8;
// 마우스는 조금 움직여야 드래그로 본다. 가만히 누르는 동작은 클릭(카드 고르기)으로 남기기 위해서다.
const MOUSE_DRAG = { activationConstraint: { distance: DRAG_DISTANCE } };
// 터치는 잠깐 누르고 있어야 드래그로 본다. 바로 드래그로 보면 화면을 밀어서 스크롤할 수 없다.
const TOUCH_DRAG = { activationConstraint: { delay: 200, tolerance: DRAG_DISTANCE } };
// dnd-kit의 기본 안내문은 영어이고 "Space로 집어서 화살표로 옮긴다"고 알려 주는데, 이 게임은 그렇게 움직이지 않는다.
// 스크린 리더가 실제 조작법(카드를 고른 뒤 자리를 누르기)을 읽게 바꾼다.
const SCREEN_READER_GUIDE = {
  screenReaderInstructions: { draggable: '카드를 누르거나 Enter, Space로 고른 다음, 놓을 자리를 눌러서 붙여요.' },
};

// 카드를 끌어다 놓을 수 있는 영역. 이 안의 DraggableCard를 DropZone에 놓으면 onDropCard를 부른다.
// 드래그로 놓는 것도, 카드를 누르고 자리를 누르는 것도 쓰는 쪽에서 같은 함수
// placeCard(cardId, zoneId)를 부르게 한다. 그래야 드래그 없이도 플레이할 수 있다 (접근성 기준 3번).
// onSelectCard(cardId)에는 DraggableCard의 onSelect와 같은 함수를 넘긴다.
function DragDropArea({ onDropCard, onSelectCard, children }) {
  const sensors = useSensors(useSensor(MouseSensor, MOUSE_DRAG), useSensor(TouchSensor, TOUCH_DRAG));

  function handleDragEnd(event) {
    // 터치로 0.2초 넘게 눌렀다가 그대로 떼면 드래그가 시작돼서 클릭이 오지 않는다.
    // 거의 움직이지 않았으면 카드를 누른 것으로 보고 고른다. 놓을 자리가 카드와 겹쳐 있어도 저절로 붙지 않는다.
    const movedDistance = Math.hypot(event.delta.x, event.delta.y);
    if (movedDistance < DRAG_DISTANCE) {
      onSelectCard(event.active.id);
      return;
    }
    if (event.over) {
      onDropCard(event.active.id, event.over.id);
    }
  }

  return (
    <DndContext sensors={sensors} accessibility={SCREEN_READER_GUIDE} onDragEnd={handleDragEnd}>
      {children}
    </DndContext>
  );
}

export default DragDropArea;
