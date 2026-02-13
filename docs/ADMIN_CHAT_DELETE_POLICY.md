# 채팅/공지 삭제 정책

## 메시지 삭제
- **소프트 삭제**: `is_deleted = true` 고정
- 물리 삭제 금지
- 삭제/고정/신고처리는 `admin_audit_logs`에 기록

## chat_messages_v2 스키마 보강 필요
- `is_deleted boolean DEFAULT false` 컬럼 추가
- 관리자 삭제 시 `UPDATE ... SET is_deleted = true`

## 감사 로그 액션
- CHAT_DELETE: 메시지 삭제
- CHAT_USER_SUSPEND: 유저 정지
