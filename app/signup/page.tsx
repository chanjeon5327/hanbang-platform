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
      <div className="hidden md:flex" style={{ height: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2>회원가입</h2>
        <p>이메일 가입 절차 (생략)</p>
        <button onClick={() => router.push('/login')} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '8px' }}>
          가입 완료 (로그인하러 가기)
        </button>
      </div>
    </>
  );
}
