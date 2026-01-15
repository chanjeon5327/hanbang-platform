"use client";
import React from 'react';
import Link from 'next/link';
import TopHeader from '../../../components/TopHeader';
import BottomNav from '../../../components/BottomNav';
import { ArrowLeft, Shield, Lock, Database } from 'lucide-react';

export default function BlockchainPage() {
  return (
    <div style={{ paddingBottom: '120px', minHeight: '100vh' }}>
      <TopHeader />
      
      <div style={{ marginTop: '80px', position: 'relative', height: '400px', overflow: 'hidden' }}>
        <img 
          src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3" 
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, var(--bg-primary))' }}></div>
        <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 10, width: '100%', maxWidth: '1200px', padding: '0 20px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '900', color: 'white', marginBottom: '20px', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>안전한 블록체인</h1>
          <p style={{ fontSize: '20px', color: '#e5e7eb' }}>위변조 불가능한 KCP 블록체인으로 영구 보장</p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--accent-color)', textDecoration: 'none', marginBottom: '40px' }}>
          <ArrowLeft size={20} />
          <span>홈으로 돌아가기</span>
        </Link>

        <div style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '20px' }}>당신의 소유권은 영원히 기록됩니다</h2>
          <p style={{ fontSize: '18px', lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: '40px' }}>
            HANBANG은 KCP(K-Content Protocol) 블록체인을 기반으로 모든 거래와 소유권을 기록합니다. 
            플랫폼이 사라져도, 회사가 없어져도 당신의 자산은 블록체인에 영원히 남아있습니다. 
            탈중앙화된 네트워크로 보장되는 절대적 안전성.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px', marginBottom: '60px' }}>
          <div style={{ backgroundColor: 'var(--card-bg)', padding: '30px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
            <Shield size={48} style={{ color: 'var(--accent-color)', marginBottom: '20px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '15px' }}>위변조 불가능</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              블록체인의 분산 원장 기술로 모든 거래가 암호화되어 기록됩니다. 한 번 기록된 데이터는 절대 수정하거나 삭제할 수 없습니다.
            </p>
          </div>
          <div style={{ backgroundColor: 'var(--card-bg)', padding: '30px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
            <Lock size={48} style={{ color: 'var(--accent-color)', marginBottom: '20px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '15px' }}>영구 소유권</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              당신이 구매한 IP 지분은 블록체인에 영원히 기록됩니다. 플랫폼이 종료되어도, 회사가 사라져도 당신의 자산은 증발하지 않습니다.
            </p>
          </div>
          <div style={{ backgroundColor: 'var(--card-bg)', padding: '30px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
            <Database size={48} style={{ color: 'var(--accent-color)', marginBottom: '20px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '15px' }}>투명한 거래</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              모든 거래 내역이 블록체인에 공개되어 누구나 확인할 수 있습니다. 수익 정산, 배당금 지급까지 모든 과정이 투명하게 기록됩니다.
            </p>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '40px', borderRadius: '24px', marginBottom: '40px' }}>
          <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '20px' }}>🔒 보안 기술</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ padding: '20px', backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '10px', fontSize: '18px' }}>분산 원장 기술 (DLT)</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
                전 세계 수천 개의 노드에 거래 기록이 분산 저장되어 단일 장애점이 없습니다. 한 노드가 해킹당해도 다른 노드의 데이터로 복구 가능합니다.
              </p>
            </div>
            <div style={{ padding: '20px', backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '10px', fontSize: '18px' }}>스마트 컨트랙트</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
                수익 정산과 배당금 지급이 자동으로 실행되는 스마트 컨트랙트로 중간 개입 없이 투명하게 처리됩니다. 코드로 보장되는 신뢰성.
              </p>
            </div>
            <div style={{ padding: '20px', backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '10px', fontSize: '18px' }}>암호화 보안</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
                SHA-256 암호화 알고리즘으로 모든 거래가 보호됩니다. 개인 지갑 키는 오직 본인만 알고 있으며, 분실 시 복구 불가능한 구조로 보안을 극대화했습니다.
              </p>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'var(--card-bg)', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '20px' }}>안전하게 투자하세요</h3>
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '30px' }}>
            블록체인 기술로 보장되는 영구적 소유권과 투명한 거래. HANBANG과 함께 안심하고 투자하세요.
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


