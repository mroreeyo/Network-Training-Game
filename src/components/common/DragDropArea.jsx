// [라이브러리] @dnd-kit/core
// 왜: 챕터 1에서 헤더 카드를 드래그해서 패킷 상자에 붙이는 기능이 필요하다.
//     브라우저 기본 드래그 기능은 모바일 터치에서 동작하지 않아서 직접 만들기 어렵다.
//     react-beautiful-dnd 대신 고른 이유: 개발이 중단되었고, dnd-kit이 더 가볍다.
// 어디에: DragDropArea, DraggableCard, DropZone 공통 컴포넌트
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

// 드래그로 놓는 것도, 카드를 누르고 자리를 누르는 것도 같은 placeCard(cardId, zoneId)를 부른다.
// 이렇게 하면 드래그 없이도 플레이할 수 있다 (접근성 기준 3번).
function DragDropArea({ onDropCard, children }) {
  // 몇 픽셀 움직여야 드래그로 보게 해서, 가만히 누르는 동작은 클릭으로 남긴다.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

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
