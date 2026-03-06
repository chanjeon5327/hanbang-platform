"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { MobileSignup } from '@/components/mobile/MobileSignup';

export default function Signup() {
  const router = useRouter();
  return (
    <>
      {/* 모바일 전용 */}
      <div className="block md:hidden">
        <MobileSignup />
      </div>
      {/* PC 버전 */}
      <div className="hidden md:flex" style={{ height: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#111827' }}>
        <h2 style={{ color: '#111827', marginBottom: '8px' }}>회원가입</h2>
        <p style={{ color: '#6B7280' }}>이메일 가입은 로그인 페이지에서 진행해 주세요.</p>
        <button type="button" onClick={() => router.push('/login')} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#6D28D9', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          로그인 페이지로 이동
        </button>
      </div>
    </>
  );
}
