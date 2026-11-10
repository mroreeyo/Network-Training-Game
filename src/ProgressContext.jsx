// [라이브러리] react: 진행도를 여러 화면이 같이 읽도록 Context를 만든다 (자세한 이유는 main.jsx)
import { createContext, useContext, useState } from 'react';
import { makeStageKey, mergeBestStars } from './rules/progressRules.js';
import { loadProgress, saveProgress } from './utils/storage.js';

// Context를 쓰는 이유: 월드맵, 스테이지 목록, 스테이지, 도감이 같은 진행도를 읽는다.
// props로 내리면 모든 화면에 같은 값을 계속 전달해야 해서, 이 한 곳에서만 Context를 쓴다.
const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  // 처음 그릴 때 한 번만 저장소에서 읽는다.
  const [progress, setProgress] = useState(() => loadProgress());

  // 스테이지를 깼을 때 부른다. 같은 스테이지를 다시 깨면 더 높은 별점만 남긴다.
  // 저장에 실패해도(사생활 보호 모드) 화면의 진행도는 바꿔서 이번 방문 동안은 이어서 플레이할 수 있다.
  function recordClear(chapterId, stageNumber, stars) {
    const key = makeStageKey(chapterId, stageNumber);
    const previous = progress.clearedStages[key];
    const previousStars = previous ? previous.stars : undefined;
    const best = mergeBestStars(previousStars, stars);
    const next = { ...progress, clearedStages: { ...progress.clearedStages, [key]: { stars: best } } };
    saveProgress(next);
    setProgress(next);
  }

  return <ProgressContext.Provider value={{ progress, recordClear }}>{children}</ProgressContext.Provider>;
}

// 커스텀 훅을 쓰는 이유: 화면마다 useContext(ProgressContext)를 적는 대신 이름으로 뜻을 알리려는 것이다.
export function useProgress() {
  return useContext(ProgressContext);
}
