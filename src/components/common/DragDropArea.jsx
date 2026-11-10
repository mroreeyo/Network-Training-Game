// [라이브러리] @dnd-kit/core
// 왜: 챕터 1에서 헤더 카드를 드래그해서 패킷 상자에 붙이는 기능이 필요하다.
//     브라우저 기본 드래그 기능은 모바일 터치에서 동작하지 않아서 직접 만들기 어렵다.
//     react-beautiful-dnd 대신 고른 이유: 개발이 중단되었고, dnd-kit이 더 가볍다.
// 어디에: DragDropArea, DraggableCard, DropZone 공통 컴포넌트
import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';

// 마우스는 조금 움직여야 드래그로 본다. 가만히 누르는 동작은 클릭(카드 고르기)으로 남기기 위해서다.
const MOUSE_DRAG = { activationConstraint: { distance: 8 } };
// 터치는 잠깐 누르고 있어야 드래그로 본다. 바로 드래그로 보면 화면을 밀어서 스크롤할 수 없다.
const TOUCH_DRAG = { activationConstraint: { delay: 200, tolerance: 8 } };

// 카드를 끌어다 놓을 수 있는 영역. 이 안의 DraggableCard를 DropZone에 놓으면 onDropCard를 부른다.
// 드래그로 놓는 것도, 카드를 누르고 자리를 누르는 것도 쓰는 쪽에서 같은 함수
// placeCard(cardId, zoneId)를 부르게 한다. 그래야 드래그 없이도 플레이할 수 있다 (접근성 기준 3번).
function DragDropArea({ onDropCard, children }) {
  const sensors = useSensors(useSensor(MouseSensor, MOUSE_DRAG), useSensor(TouchSensor, TOUCH_DRAG));

  function handleDragEnd(event) {
    if (event.over) {
      onDropCard(event.active.id, event.over.id);
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {children}
    </DndContext>
  );
}

export default DragDropArea;
