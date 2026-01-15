"use client";
import React from 'react';
import Link from 'next/link';
import TopHeader from '../../../components/TopHeader';
import BottomNav from '../../../components/BottomNav';
import { ArrowLeft, Share2, TrendingUp, Users, Zap } from 'lucide-react';

export default function AssetsPage() {
  return (
    <div style={{ paddingBottom: '120px', minHeight: '100vh' }}>
      <TopHeader />
      
      <div style={{ marginTop: '80px', position: 'relative', height: '400px', overflow: 'hidden' }}>
        <img 
          src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3" 
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, var(--bg-primary))' }}></div>
        <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 10, width: '100%', maxWidth: '1200px', padding: '0 20px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '900', color: 'white', marginBottom: '20px', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>내가 만드는 자산</h1>
          <p style={{ fontSize: '20px', color: '#e5e7eb' }}>단순한 소비를 넘어 자산으로, 당신의 활동이 수익이 됩니다</p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--accent-color)', textDecoration: 'none', marginBottom: '40px' }}>
          <ArrowLeft size={20} />
          <span>홈으로 돌아가기</span>
        </Link>

        <div style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '20px' }}>가만히 기다리지 마세요. 직접 만들어보세요</h2>
          <p style={{ fontSize: '18px', lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: '40px' }}>
            HANBANG은 단순히 투자하고 기다리는 플랫폼이 아닙니다. 당신이 소유한 IP를 친구들에게 홍보하고, 
            유튜브 조회수를 올리고, SNS에 공유할 때마다 그 활동이 바로 배당금 상승으로 이어집니다. 
            당신의 노력이 곧 수익이 되는 구조입니다.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px', marginBottom: '60px' }}>
          <div style={{ backgroundColor: 'var(--card-bg)', padding: '30px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
            <Share2 size={48} style={{ color: 'var(--accent-color)', marginBottom: '20px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '15px' }}>홍보 = 수익</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              소유한 IP를 친구들에게 공유하고 홍보하면, 그들이 유입되어 발생한 수익의 일부를 추가로 받게 됩니다. 
              당신의 네트워크가 곧 수익원입니다.
            </p>
          </div>
          <div style={{ backgroundColor: 'var(--card-bg)', padding: '30px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
            <TrendingUp size={48} style={{ color: 'var(--up-color)', marginBottom: '20px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '15px' }}>조회수 = 배당금</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              유튜브, 넷플릭스 등에서 발생하는 조회수와 시청 시간이 직접적으로 배당금으로 연결됩니다. 
              조회수가 오를수록 배당금도 함께 상승합니다.
            </p>
          </div>
          <div style={{ backgroundColor: 'var(--card-bg)', padding: '30px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
            <Users size={48} style={{ color: 'var(--accent-color)', marginBottom: '20px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '15px' }}>커뮤니티 활동</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              HANBANG 커뮤니티에서 IP에 대한 토론, 리뷰, 추천 활동을 하면 추가 보상 포인트(KCP)를 받을 수 있습니다. 
              활발한 커뮤니티가 더 높은 수익을 만듭니다.
            </p>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '40px', borderRadius: '24px', marginBottom: '40px' }}>
          <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '20px' }}>📈 활동 기반 수익 구조</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ padding: '20px', backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                <Zap size={24} style={{ color: 'var(--accent-color)' }} />
                <h4 style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '18px' }}>1단계: IP 구매</h4>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', marginLeft: '39px' }}>
                원하는 K-콘텐츠 IP를 구매하고 지분을 소유합니다. 기본 배당금은 자동으로 발생합니다.
              </p>
            </div>
            <div style={{ padding: '20px', backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                <Share2 size={24} style={{ color: 'var(--accent-color)' }} />
                <h4 style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '18px' }}>2단계: 홍보 및 공유</h4>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', marginLeft: '39px' }}>
                소유한 IP를 SNS, 유튜브, 친구들에게 홍보합니다. 당신의 링크를 통해 유입된 모든 수익의 10%를 추가로 받습니다.
              </p>
            </div>
            <div style={{ padding: '20px', backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                <TrendingUp size={24} style={{ color: 'var(--up-color)' }} />
                <h4 style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '18px' }}>3단계: 수익 상승</h4>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', marginLeft: '39px' }}>
                홍보로 인한 조회수 증가 → IP 가치 상승 → 배당금 증가 → 자산 가치 상승의 선순환 구조가 완성됩니다.
              </p>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'var(--card-bg)', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '20px' }}>당신의 노력이 수익이 됩니다</h3>
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '30px' }}>
            단순 투자가 아닌, 직접 만들어가는 자산. HANBANG과 함께 당신만의 수익 구조를 만들어보세요.
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


