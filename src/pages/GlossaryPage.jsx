import Button from '../components/common/Button.jsx';
import ConceptCard from '../components/common/ConceptCard.jsx';
import { chapters } from '../data/chapters.js';
import { conceptCards } from '../data/conceptCards.js';
import { getEarnedConceptCards } from '../rules/progressRules.js';
import { useProgress } from '../ProgressContext.jsx';
import styles from './GlossaryPage.module.css';

// 지금까지 스테이지를 깨서 얻은 개념 카드 모음. 복습용이다.
function GlossaryPage() {
  const { progress } = useProgress();
  const earned = getEarnedConceptCards(progress, conceptCards);

  return (
    <main className="page">
      <header className={styles.header}>
        <Button to="/">센터 안내도</Button>
        <h1 className="title-screen">개념 도감</h1>
        <p className="text-body">스테이지를 깰 때마다 개념 카드가 하나씩 모여요. 얻은 카드 {earned.length}장</p>
      </header>
      {chapters.map((chapter) => {
        const cards = earned.filter((card) => card.chapterId === chapter.id);
        return (
          <section key={chapter.id} className={styles.section}>
            <h2 className="title-section">
              챕터 {chapter.number}. {chapter.name}
            </h2>
            {cards.length === 0 ? <p className="text-quiet">아직 얻은 카드가 없어요.</p> : null}
            {cards.map((card) => (
              <ConceptCard key={card.id} card={card} />
            ))}
          </section>
        );
      })}
    </main>
  );
}

export default GlossaryPage;
