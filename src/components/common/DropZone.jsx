// [라이브러리] @dnd-kit/core: useDroppable로 카드를 놓을 자리를 만든다 (자세한 이유는 DragDropArea.jsx)
import { useDroppable } from '@dnd-kit/core';
import styles from './DropZone.module.css';

// 카드를 놓을 자리. 점선 잉크 테두리 안에 놓을 것의 이름을 적는다.
// 고른 카드가 있을 때 이 자리를 누르면 onActivate(id)를 부른다.
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
