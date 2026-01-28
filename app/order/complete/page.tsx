export default function OrderCompletePage() {
    return (
      <div style={{ padding: 32 }}>
        <h1>구매 요청 완료</h1>
        <p>구매 요청이 정상적으로 접수되었습니다.</p>
        <p>판매자 확인 후 다음 단계가 진행됩니다.</p>
  
        <a href="/market" style={{ display: 'inline-block', marginTop: 24 }}>
          판매 중인 콘텐츠 더 보기
        </a>
      </div>
    );
  }
  