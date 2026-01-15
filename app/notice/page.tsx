"use client";
import React from 'react';
import TopHeader from '../../components/TopHeader';
import BottomNav from '../../components/BottomNav';

export default function Notice() {
  return (
    <div style={{ paddingBottom: '100px' }}>
      <TopHeader />
      <div style={{ marginTop: '80px', padding: '20px', maxWidth: '800px', margin: '80px auto' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '30px' }}>공지사항 & 가이드</h1>
        
        <div style={{ marginBottom: '40px', padding: '20px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '10px' }}>📘 초보 투자자 가이드</h3>
          <ul style={{ lineHeight: '1.8', fontSize: '14px', color: 'var(--text-secondary)' }}>
            <li>1. 회원가입 후 [내 자산]에서 가상 계좌를 발급받으세요.</li>
            <li>2. 원하는 콘텐츠(K-POP, 드라마 등)를 선택해 상세 정보를 확인하세요.</li>
            <li>3. [매수] 버튼을 눌러 원하는 수량만큼 지분을 구매하세요.</li>
            <li>4. 매수 가격은 500원 단위로 설정 가능합니다.</li>
            <li>5. 거래 체결 시 알림톡이 발송됩니다.</li>
            <li>6. 수익 정산은 매월 25일 정산되어 내 지갑으로 들어옵니다.</li>
            <li>7. 판매하고 싶을 땐 [매도]를 통해 시장가 또는 지정가로 판매하세요.</li>
            <li>8. 실시간 랭킹은 '최근 1시간 거래량' 순서로 집계됩니다.</li>
            <li>9. 법적 보호를 위해 모든 거래는 블록체인에 기록됩니다.</li>
            <li>10. 문의사항은 우측 하단 채팅 버튼을 이용해주세요.</li>
          </ul>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
