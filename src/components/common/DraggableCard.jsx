// [라이브러리] @dnd-kit/core: useDraggable로 카드를 끌 수 있게 한다 (자세한 이유는 DragDropArea.jsx)
import { useDraggable } from '@dnd-kit/core';
import HeaderLabel from './HeaderLabel.jsx';
import styles from './DraggableCard.module.css';

// 끌 수 있는 헤더 라벨. 누르거나 Enter/Space를 누르면 선택되고(onSelect), 끌어서 놓을 수도 있다.
// 끄는 동안에는 손가락을 따라 움직이면서 3도 기운다 (디자인 가이드).
function DraggableCard({ id, layer, name, rows, selected, onSelect }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  const dragStyle = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px) rotate(3deg)` }
    : undefined;

  return (
    <HeaderLabel
      as="button"
      ref={setNodeRef}
      layer={layer}
      name={name}
      rows={rows}
      selected={selected}
      compact
      className={isDragging ? styles.dragging : ''}
      style={dragStyle}
      onClick={() => onSelect(id)}
      {...listeners}
      {...attributes}
    />
  );
}

export default DraggableCard;
