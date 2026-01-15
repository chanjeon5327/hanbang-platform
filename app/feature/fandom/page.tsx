"use client";
import React from 'react';
import Link from 'next/link';
import TopHeader from '../../../components/TopHeader';
import BottomNav from '../../../components/BottomNav';
import { ArrowLeft, Users, TrendingUp, Globe } from 'lucide-react';

export default function FandomPage() {
  return (
    <div style={{ paddingBottom: '120px', minHeight: '100vh' }}>
      <TopHeader />
      
      <div style={{ marginTop: '80px', position: 'relative', height: '400px', overflow: 'hidden' }}>
        <img 
          src="https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3" 
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, var(--bg-primary))' }}></div>
        <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 10, width: '100%', maxWidth: '1200px', padding: '0 20px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '900', color: 'white', marginBottom: '20px', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>글로벌 팬덤 수익</h1>
          <p style={{ fontSize: '20px', color: '#e5e7eb' }}>전 세계 1억 명의 팬덤이 당신의 수익이 됩니다</p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--accent-color)', textDecoration: 'none', marginBottom: '40px' }}>
          <ArrowLeft size={20} />
          <span>홈으로 돌아가기</span>
        </Link>

        <div style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '20px' }}>세계가 클릭할 때마다 수익이 쌓입니다</h2>
          <p style={{ fontSize: '18px', lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: '40px' }}>
            K-콘텐츠는 더 이상 단순한 엔터테인먼트가 아닙니다. 전 세계 팬들의 한 번의 클릭, 한 번의 시청이 바로 당신의 수익으로 연결됩니다. 
            HANBANG을 통해 검증된 IP의 주인이 되어보세요.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px', marginBottom: '60px' }}>
          <div style={{ backgroundColor: 'var(--card-bg)', padding: '30px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
            <Users size={48} style={{ color: 'var(--accent-color)', marginBottom: '20px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '15px' }}>1억 명의 글로벌 팬</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              BTS, 세븐틴, 블랙핑크 등 K-POP 아티스트들의 전 세계 팬덤이 유튜브, 스포티파이에서 콘텐츠를 소비할 때마다 수익이 발생합니다.
            </p>
          </div>
          <div style={{ backgroundColor: 'var(--card-bg)', padding: '30px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
            <TrendingUp size={48} style={{ color: 'var(--up-color)', marginBottom: '20px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '15px' }}>검증된 히트작</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              오징어게임, 기생충, 파라사이트 등 넷플릭스 역대 최고 시청 기록을 세운 작품들의 IP를 직접 소유하고 수익을 분배받으세요.
            </p>
          </div>
          <div style={{ backgroundColor: 'var(--card-bg)', padding: '30px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
            <Globe size={48} style={{ color: 'var(--accent-color)', marginBottom: '20px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '15px' }}>실시간 수익 정산</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              매월 25일, 전 세계에서 발생한 콘텐츠 수익이 투자자들에게 자동으로 정산됩니다. 투명한 수익 구조로 안심하고 투자하세요.
            </p>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '40px', borderRadius: '24px', marginBottom: '40px' }}>
          <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '20px' }}>💰 실제 수익 사례</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ padding: '20px', backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '18px' }}>오징어게임 시즌1</span>
                <span style={{ color: 'var(--up-color)', fontWeight: 'bold', fontSize: '18px' }}>+450% 수익률</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                100만원 투자 → 현재 평가액 550만원. 넷플릭스 전 세계 1억 1,100만 시간 시청 기록 달성으로 지속적인 수익 발생 중.
              </p>
            </div>
            <div style={{ padding: '20px', backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '18px' }}>BTS 뮤직비디오 IP</span>
                <span style={{ color: 'var(--up-color)', fontWeight: 'bold', fontSize: '18px' }}>+280% 수익률</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                50만원 투자 → 현재 평가액 190만원. 유튜브 조회수 10억 회 돌파, 월간 배당금 평균 15만원 수령 중.
              </p>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'var(--card-bg)', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '20px' }}>지금 바로 시작하세요</h3>
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '30px' }}>
            검증된 K-콘텐츠 IP에 투자하고, 전 세계 팬들의 사랑을 수익으로 전환하세요.
          </p>
          <Link href="/active-invest">
            <button style={{ padding: '16px 40px', fontSize: '18px', fontWeight: 'bold', borderRadius: '30px', backgroundColor: 'var(--accent-color)', color: 'white', border: 'none', cursor: 'pointer' }}>
              투자 상품 둘러보기 →
            </button>
          </Link>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}


