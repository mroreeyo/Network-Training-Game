// [라이브러리] react: 모달을 열고 닫는 상태(useState)를 만든다 (자세한 이유는 main.jsx)
import { useState } from 'react';
import Button from './components/common/Button.jsx';
import Card from './components/common/Card.jsx';
import Modal from './components/common/Modal.jsx';
import ProgressBar from './components/common/ProgressBar.jsx';
import StarRating from './components/common/StarRating.jsx';
import styles from './App.module.css';

// 기본 컴포넌트가 디자인 가이드대로 보이는지 확인하는 임시 화면이다.
// 월드맵을 만들 때 화면 이동(라우터) 설정으로 바꾼다.
function ButtonSamples({ onOpenModal }) {
  return (
    <Card>
      <h2 className="title-section">Button</h2>
      <div className={styles.row}>
        <Button variant="primary" onClick={onOpenModal}>
          모달 열기
        </Button>
        <Button>보조 버튼</Button>
        <Button variant="quiet">조용한 버튼</Button>
        <Button disabled>누를 수 없는 버튼</Button>
      </div>
    </Card>
  );
}

function StatusSamples() {
  return (
    <Card selected>
      <h2 className="title-section">선택된 Card, StarRating, ProgressBar</h2>
      <div className={styles.row}>
        <StarRating stars={0} />
        <StarRating stars={2} />
        <StarRating stars={3} />
      </div>
      <ProgressBar done={2} total={5} label="스테이지 5개 중 2개 완료" />
    </Card>
  );
}

function App() {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <main className={`page ${styles.samples}`}>
      <h1 className="title-screen">네트워크 물류 센터 부품 점검</h1>
      <ButtonSamples onOpenModal={() => setModalOpen(true)} />
      <StatusSamples />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} titleId="sample-modal-title">
        <div className={styles.samples}>
          <h2 id="sample-modal-title" className="title-section">
            Modal
          </h2>
          <p className="text-body">Esc를 누르거나 아래 버튼을 누르면 닫혀요.</p>
          <Button onClick={() => setModalOpen(false)}>모달 닫기</Button>
        </div>
      </Modal>
    </main>
  );
}

export default App;
