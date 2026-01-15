"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export function Footer() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <footer className="bg-gray-900 text-gray-400 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">HANBANG</h3>
            <p className="text-sm leading-relaxed">
              K-콘텐츠 투자의 새로운 패러다임을 제시하는 혁신적인 플랫폼입니다.
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-4">회사 정보</h3>
            <ul className="text-sm space-y-2">
              <li>(주)한방</li>
              <li>대표: 전병찬</li>
              <li>사업자등록번호: 123-45-67890</li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-4">연락처</h3>
            <ul className="text-sm space-y-2">
              <li>주소: 서울특별시 강남구 테헤란로 123</li>
              <li>이메일: contact@hanbang.com</li>
              <li>전화: 02-1234-5678</li>
            </ul>
          </div>
        </div>
        
        {/* 모바일 아코디언 */}
        <div className="md:hidden border-t border-gray-800 pt-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between py-3 text-sm font-semibold text-gray-300 active:scale-95 transition-transform cursor-pointer"
          >
            <span>한방 사업자 정보</span>
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {isExpanded && (
            <div className="pt-2 space-y-2 text-sm">
              <p>(주)한방 | 대표: 전병찬</p>
              <p>사업자등록번호: 123-45-67890</p>
              <p>주소: 서울특별시 강남구 테헤란로 123</p>
              <p>이메일: contact@hanbang.com</p>
              <p>전화: 02-1234-5678</p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm">
          <p>© 2024 HANBANG. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

