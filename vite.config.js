// [라이브러리] @vitejs/plugin-react
// 왜: JSX를 브라우저가 읽을 수 있는 코드로 바꾸고, 저장하면 화면이 즉시 바뀌게 하려고 쓴다.
//     직접 설정하면 Babel 설정이 필요해서 어렵다.
// 어디에: Vite 빌드 전체
import react from '@vitejs/plugin-react';

export default {
  plugins: [react()],
  test: {
    environment: 'node',
  },
};
