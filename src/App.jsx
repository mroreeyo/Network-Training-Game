// [라이브러리] react-router-dom
// 왜: 월드맵 → 챕터 → 스테이지마다 주소가 생겨서 뒤로가기와 새로고침이 자연스럽다.
//     직접 만들면 주소와 화면을 맞추는 코드를 모두 짜야 한다.
// 어디에: 화면 이동(라우터) 설정. 링크는 Button과 각 화면에서 쓴다.
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';
// [라이브러리] react: 주소가 바뀐 뒤에 스크롤을 옮기려고 useEffect를 쓴다 (자세한 이유는 main.jsx)
import { useEffect } from 'react';
import { ProgressProvider } from './ProgressContext.jsx';
import StageFramePreviewPage from './pages/StageFramePreviewPage.jsx';
import StageListPage from './pages/StageListPage.jsx';
import StagePage from './pages/StagePage.jsx';
import WorldMapPage from './pages/WorldMapPage.jsx';

// 라우터는 화면을 바꿔도 스크롤을 그대로 둔다. 휴대폰 안내도 아래쪽에서 챕터를 고르면
// 다음 화면이 제목이 잘린 채 중간부터 보이므로, 새 화면으로 갈 때는 맨 위로 올린다.
// 뒤로가기(POP)는 브라우저가 보던 위치를 되찾아 주므로 건드리지 않는다.
function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType !== 'POP') {
      window.scrollTo(0, 0);
    }
  }, [pathname, navigationType]);

  return null;
}

// 개념 도감 주소는 그 화면을 만들 때 추가한다.
// /preview/stage-frame은 스테이지 틀을 확인하는 임시 주소다. 챕터 1 게임판을 만들면 지운다.
function App() {
  return (
    <ProgressProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<WorldMapPage />} />
          <Route path="/chapters/:chapterId" element={<StageListPage />} />
          <Route path="/chapters/:chapterId/stages/:stageNumber" element={<StagePage />} />
          <Route path="/preview/stage-frame" element={<StageFramePreviewPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ProgressProvider>
  );
}

export default App;
