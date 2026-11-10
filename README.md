# 네트워크 물류 센터 (네트워크 학습 게임)

계획서: `docs/implementation-plan.md`, 기획: `docs/네트워크 학습 게임 패키지 PRD.md`

```bash
npm install
npm run dev     # 개발 서버
npm run check   # lint + 테스트 + 토큰 검사 + import 주석 검사 (커밋 전에 실행)
npm run build   # 정적 파일 만들기 (dist/)
```

배포는 정적 호스팅이면 됩니다. Vercel은 `vercel.json`이 모든 주소를 `index.html`로 돌려서 스테이지 주소에서 새로고침해도 동작합니다.
