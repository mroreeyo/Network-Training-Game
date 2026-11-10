// [라이브러리] react, react-dom
// 왜: 화면이 많고 진행도를 여러 화면이 같이 쓰므로 컴포넌트로 나눠 관리하기 쉬운 React를 쓴다.
//     리액트 연습도 겸한다.
// 어디에: 앱 전체. 이 파일이 화면을 index.html의 #root에 붙이는 시작점이다.
import { StrictMode } from 'react';
// [라이브러리] react-dom: 만든 화면을 브라우저의 #root 자리에 붙이는 도구 (자세한 이유는 위 react 설명)
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/tokens.css';
import './styles/global.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
