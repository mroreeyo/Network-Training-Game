// 한 줄 요약: @dnd-kit/core의 useDroppable로 카드를 놓을 자리를 만든다 (자세한 이유는 DragDropArea).
import { useDroppable } from '@dnd-kit/core';
import styles from './DropZone.module.css';

// 점선 잉크 테두리 안에 놓을 것의 이름을 적는다.
// ready면 지금 카드를 놓을 수 있다는 뜻이라 테이프색 면으로 바뀐다 (점선 테두리는 그대로).
function DropZone({ id, name, hint, ready, onActivate }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const highlighted = ready || isOver;

  return (
    <button
      ref={setNodeRef}
      type="button"
      className={`${styles.zone} ${highlighted ? styles.ready : ''}`}
      onClick={() => onActivate(id)}
    >
      <span className="text-label">{name}</span>
      <span>{hint}</span>
    </button>
  );
}

export default DropZone;
