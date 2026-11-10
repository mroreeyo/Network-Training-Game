// [라이브러리] react: dialog 요소를 직접 열고 닫으려고 useEffect와 useRef를 쓴다 (자세한 이유는 main.jsx)
import { useEffect, useRef } from 'react';
import styles from './Modal.module.css';

// 브라우저 기본 <dialog>를 쓴다. showModal()이 모달 바깥 조작 차단,
// 포커스 가두기, Esc로 닫기를 처리해 주므로 따로 만들지 않는다.
// 쓰는 쪽은 onClose에서 open을 false로 바꿔야 한다. Esc를 누르면 브라우저가 창을 먼저 닫기 때문이다.
function Modal({ open, onClose, titleId, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) {
      dialog.showModal();
    }
    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={styles.modal}
      aria-labelledby={titleId}
      onCancel={onClose}
    >
      {open ? children : null}
    </dialog>
  );
}

export default Modal;
