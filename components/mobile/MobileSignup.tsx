"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

export function MobileSignup() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const handleNext = () => {
    if (step === 1 && name.trim()) {
      setStep(2);
    } else if (step === 2 && phone.trim()) {
      setStep(3);
    } else if (step === 3 && verificationCode.trim()) {
      // 회원가입 완료 처리
      alert("회원가입이 완료되었습니다!");
    }
  };

  const isStepValid = () => {
    if (step === 1) return name.trim().length > 0;
    if (step === 2) return phone.trim().length >= 10;
    if (step === 3) return verificationCode.trim().length === 6;
    return false;
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)", paddingBottom: "100px" }}>
      {/* 상단 질문 텍스트 */}
      <div style={{ padding: "60px 24px 40px", textAlign: "center" }}>
        {step === 1 && (
          <>
            <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "12px" }}>
              이름을 알려주세요
            </h1>
            <p style={{ fontSize: "16px", color: "var(--text-secondary)" }}>HANBANG에서 사용할 이름을 입력해주세요</p>
          </>
        )}
        {step === 2 && (
          <>
            <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "12px" }}>
              연락처를 입력하세요
            </h1>
            <p style={{ fontSize: "16px", color: "var(--text-secondary)" }}>인증을 위해 휴대폰 번호가 필요합니다</p>
          </>
        )}
        {step === 3 && (
          <>
            <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "12px" }}>
              인증번호를 입력하세요
            </h1>
            <p style={{ fontSize: "16px", color: "var(--text-secondary)" }}>{phone}로 전송된 6자리 번호를 입력해주세요</p>
          </>
        )}
      </div>

      {/* 입력 필드 */}
      <div style={{ padding: "0 24px" }}>
        {step === 1 && (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름"
            style={{
              width: "100%",
              padding: "20px",
              borderRadius: "16px",
              border: "none",
              backgroundColor: "#F9FAFB",
              fontSize: "18px",
              outline: "none",
              fontWeight: 500,
            }}
            autoFocus
          />
        )}
        {step === 2 && (
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="010-1234-5678"
            style={{
              width: "100%",
              padding: "20px",
              borderRadius: "16px",
              border: "none",
              backgroundColor: "#F9FAFB",
              fontSize: "18px",
              outline: "none",
              fontWeight: 500,
            }}
            autoFocus
          />
        )}
        {step === 3 && (
          <div>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              style={{
                width: "100%",
                padding: "20px",
                borderRadius: "16px",
                border: "none",
                backgroundColor: "#F9FAFB",
                fontSize: "24px",
                textAlign: "center",
                letterSpacing: "8px",
                outline: "none",
                fontWeight: 600,
              }}
              autoFocus
            />
            <button
              onClick={() => alert("인증번호를 다시 전송했습니다.")}
              style={{
                marginTop: "16px",
                width: "100%",
                padding: "12px",
                backgroundColor: "transparent",
                border: "none",
                color: "var(--accent-color)",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              인증번호 다시 받기
            </button>
          </div>
        )}
      </div>

      {/* 하단 고정 버튼 */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "20px 24px",
          backgroundColor: "var(--card-bg)",
          borderTop: "1px solid var(--border-color)",
          boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.08)",
        }}
      >
        <button
          onClick={handleNext}
          disabled={!isStepValid()}
          style={{
            width: "100%",
            padding: "18px",
            borderRadius: "16px",
            border: "none",
            backgroundColor: isStepValid() ? "var(--accent-color)" : "#E5E7EB",
            color: isStepValid() ? "white" : "#9CA3AF",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: isStepValid() ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "all 0.2s",
          }}
        >
          다음
          {step === 3 ? <Check size={20} /> : <ArrowRight size={20} />}
        </button>
      </div>

      {/* 진행 표시기 */}
      <div style={{ display: "flex", justifyContent: "center", gap: "8px", padding: "40px 24px" }}>
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            style={{
              width: s === step ? "24px" : "8px",
              height: "8px",
              borderRadius: "4px",
              backgroundColor: s === step ? "var(--accent-color)" : "#E5E7EB",
              transition: "all 0.3s",
            }}
          />
        ))}
      </div>
    </div>
  );
}

