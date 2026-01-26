export default function BetaNotice() {
    return (
      <div
        style={{
          margin: '12px 0',
          padding: 12,
          background: '#fffbe6',
          border: '1px solid #ffe58f',
          fontSize: 13,
          lineHeight: 1.5,
        }}
      >
        ⚠️ <b>베타 운영 안내</b><br />
        현재 한방프로젝트는 베타 운영 중이며,
        충전 및 투자는 <b>실제 현금 결제가 아닌 가상 잔액 기반 테스트</b>로 진행됩니다.<br />
        정식 결제(PG 연동)는 추후 제공될 예정입니다.
      </div>
    );
  }
  