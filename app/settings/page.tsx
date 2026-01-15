'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight, User } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [blockOverseasLogin, setBlockOverseasLogin] = useState(false);

  return (
    <div className="min-h-screen bg-[#F2F4F6] pb-[90px]">
      {/* 헤더 */}
      <header className="sticky top-0 bg-white z-50 border-b border-gray-200">
        <div className="px-4 py-3 flex items-center">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center active:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-800" />
          </button>
          <h1 className="flex-1 text-center text-lg font-bold text-slate-800">설정</h1>
          <div className="w-10"></div> {/* 중앙 정렬을 위한 더미 */}
        </div>
      </header>

      <main className="px-5 pt-4 pb-8">
        {/* 프로필 섹션 */}
        <div className="bg-white rounded-2xl p-4 mb-4 active:bg-gray-50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <div className="text-base font-bold text-[#191F28]">전병찬</div>
                <div className="text-sm text-gray-500">내 정보 · 주소 관리</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* 그룹 A: 일반 */}
        <div className="bg-white rounded-2xl mb-3 overflow-hidden">
          <div className="px-4 py-3 active:bg-gray-50 transition-colors flex items-center justify-between border-b border-gray-100">
            <span className="text-base text-[#191F28]">언어</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">한국어</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="px-4 py-3 active:bg-gray-50 transition-colors flex items-center justify-between border-b border-gray-100">
            <span className="text-base text-[#191F28]">알림</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          <div className="px-4 py-3 active:bg-gray-50 transition-colors flex items-center justify-between">
            <span className="text-base text-[#191F28]">화면 테마 · 진동</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* 그룹 B: 인증 및 보안 */}
        <div className="bg-white rounded-2xl mb-3 overflow-hidden">
          <div className="px-4 py-3 active:bg-gray-50 transition-colors flex items-center justify-between border-b border-gray-100">
            <span className="text-base text-[#191F28]">인증서</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          <div className="px-4 py-3 active:bg-gray-50 transition-colors flex items-center justify-between border-b border-gray-100">
            <span className="text-base text-[#191F28]">비밀번호 · 보안</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          <div className="px-4 py-3 active:bg-gray-50 transition-colors flex items-center justify-between border-b border-gray-100">
            <span className="text-base text-[#191F28]">PIN 비밀번호 변경</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          <div className="px-4 py-3 active:bg-gray-50 transition-colors flex items-center justify-between border-b border-gray-100">
            <span className="text-base text-[#191F28]">생체인증 사용</span>
            <button
              onClick={() => setBiometricEnabled(!biometricEnabled)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                biometricEnabled ? 'bg-[#7c3aed]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 ${
                  biometricEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <div className="px-4 py-3 active:bg-gray-50 transition-colors flex items-center justify-between">
            <span className="text-base text-[#191F28]">해외 로그인 차단</span>
            <button
              onClick={() => setBlockOverseasLogin(!blockOverseasLogin)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                blockOverseasLogin ? 'bg-[#7c3aed]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 ${
                  blockOverseasLogin ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 그룹 C: 법적 정보 및 기타 */}
        <div className="bg-white rounded-2xl mb-3 overflow-hidden">
          <div className="px-4 py-3 active:bg-gray-50 transition-colors flex items-center justify-between border-b border-gray-100">
            <span className="text-base text-[#191F28]">약관 및 개인정보 처리 동의</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          <div className="px-4 py-3 active:bg-gray-50 transition-colors flex items-center justify-between border-b border-gray-100">
            <span className="text-base text-[#191F28]">개인정보 처리방침</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          <div className="px-4 py-3 active:bg-gray-50 transition-colors flex items-center justify-between">
            <span className="text-base text-[#191F28]">선불전자지급수단 통합 운영 정책</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* 탈퇴하기 */}
        <div className="bg-white rounded-2xl mb-6 overflow-hidden">
          <div className="px-4 py-3 active:bg-gray-50 transition-colors flex items-center justify-between">
            <span className="text-base text-red-600">탈퇴하기</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* 푸터 */}
        <div className="text-center space-y-2 pt-4">
          <div className="text-sm text-gray-500">앱 버전 5.242.3...</div>
          <button className="text-sm text-gray-500 underline underline-offset-2 active:text-gray-700">
            오픈소스 라이선스 보기
          </button>
        </div>
      </main>
    </div>
  );
}
