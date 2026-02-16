# LOGIN_FIX_PROOF (로그인 ??? 텍스트 복구)

**문제**: /login 페이지에서 한글이 ???로 표시됨

**수정**: app/login/page.tsx UTF-8로 재작성

**복구된 텍스트**:
- 제목: 로그인
- 부제: HANBANG에 로그인하여 투자를 시작하세요
- placeholder: 이메일, 비밀번호
- 버튼: 로그인, 로그인 중...
- 링크: 비밀번호를 잊으셨나요? 비밀번호 찾기
- 계정이 없으신가요? 회원가입
- toast: 로그인되었습니다.

**증거**: node tools/screenshot-audit.mjs 실행 후 docs/SCREEN_AUDIT/pc_login.png, m_login.png 확인

**날짜**: 2026-02-17
