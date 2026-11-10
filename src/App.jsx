// [라이브러리] react-router-dom
// 왜: 월드맵 → 챕터 → 스테이지마다 주소가 생겨서 뒤로가기와 새로고침이 자연스럽다.
//     직접 만들면 주소와 화면을 맞추는 코드를 모두 짜야 한다.
// 어디에: 화면 이동(라우터) 설정. 링크는 Button과 각 화면에서 쓴다.
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ProgressProvider } from './ProgressContext.jsx';
import GlossaryPage from './pages/GlossaryPage.jsx';
import StageListPage from './pages/StageListPage.jsx';
import StagePage from './pages/StagePage.jsx';
import WorldMapPage from './pages/WorldMapPage.jsx';

function App() {
  return (
    <ProgressProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WorldMapPage />} />
          <Route path="/chapters/:chapterId" element={<StageListPage />} />
          <Route path="/chapters/:chapterId/stages/:stageNumber" element={<StagePage />} />
          <Route path="/glossary" element={<GlossaryPage />} />
        </Routes>
      </BrowserRouter>
    </ProgressProvider>
  );
}

export default App;
