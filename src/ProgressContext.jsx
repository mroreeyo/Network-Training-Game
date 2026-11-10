// [라이브러리] react: 화면 상태(useState)를 만드는 기본 도구 (자세한 이유는 main.jsx)
import { createContext, useContext, useState } from 'react';
import { mergeBestStars, makeStageKey } from './rules/progressRules.js';
import { clearProgress, loadProgress, saveProgress } from './utils/storage.js';

// Context를 쓰는 이유: 월드맵, 스테이지 목록, 스테이지, 도감이 같은 진행도를 읽고 쓴다.
// props로 내리면 모든 화면에 같은 값을 계속 전달해야 해서, 이 한 곳에서만 Context를 쓴다.
const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  const [progress, setProgress] = useState(() => loadProgress());

  function recordClear(chapterId, stageNumber, stars) {
    const key = makeStageKey(chapterId, stageNumber);
    const previous = progress.clearedStages[key];
    const best = mergeBestStars(previous ? previous.stars : undefined, stars);
    const next = {
      ...progress,
      clearedStages: { ...progress.clearedStages, [key]: { stars: best } },
    };
    saveProgress(next);
    setProgress(next);
  }

  function resetProgress() {
    clearProgress();
    setProgress(loadProgress());
  }

  const value = { progress, recordClear, resetProgress };
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  return useContext(ProgressContext);
}
