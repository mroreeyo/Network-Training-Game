// [라이브러리] react: 화면 상태(useState)를 만드는 기본 도구 (자세한 이유는 main.jsx)
import { useEffect, useRef } from 'react';
import styles from './Modal.module.css';

// 브라우저 기본 <dialog>를 쓴다. showModal()이 모달 바깥 조작 차단,
// 포커스 가두기, Esc로 닫기를 처리해 주므로 따로 만들지 않는다.
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
