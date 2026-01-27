import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

// ✅ Pages Router에서는 dynamic + ssr:false 필수
const MobileInvestorChat = dynamic(
  () => import('@/components/chat/MobileInvestorChat'),
  { ssr: false }
);

export default function InvestPage() {
  const router = useRouter();
  const { id } = router.query;

  // 아직 id 없을 때 보호
  if (!id) {
    return <div>로딩중...</div>;
  }

  // 🔒 지금은 고정값 → 다음 단계에서 invest:${id} 로 변경
  const roomKey = 'invest:test';

  return (
    <div style={{ padding: 24 }}>
      <h1>투자</h1>

      <p>product id: {id}</p>

      {/* ✅ 안정성 1차 확인용 */}
      <div style={{ border: '2px solid red', padding: 12, marginTop: 16 }}>
        채팅 영역 테스트
      </div>

      {/* ✅ 채팅 최소 렌더링 */}
      <div style={{ border: '2px solid green', padding: 12, marginTop: 16 }}>
        <MobileInvestorChat roomKey={roomKey} />
      </div>
    </div>
  );
}
