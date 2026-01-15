"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface FormData {
  // 기본 정보
  name: string;
  country: string;
  phone: string;
  email: string;
  projectUrl: string;
  
  // 투자 조건 및 정산
  targetAmount: string;
  platformEquity: number; // 10% 고정
  investorEquity: string;
  creatorEquity: string;
  bankName: string;
  accountNumber: string;
  walletAddress: string;
  
  // 작품 상세 정보
  title: string;
  category: string;
  description: string;
  episodeCount: string;
  channels: string[];
  thumbnail: string | null;
}

const COUNTRIES = ["대한민국", "미국", "일본", "중국", "기타"];
const CATEGORIES = ["웹툰", "드라마", "영화", "유튜브", "K-POP", "기타"];
const CHANNELS = ["유튜브", "인스타그램", "네이버 라이브", "웨이툰", "틱톡", "기타"];

export default function CreatorRegister() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    country: "",
    phone: "",
    email: "",
    projectUrl: "",
    targetAmount: "",
    platformEquity: 10,
    investorEquity: "",
    creatorEquity: "",
    bankName: "",
    accountNumber: "",
    walletAddress: "",
    title: "",
    category: "",
    description: "",
    episodeCount: "",
    channels: [],
    thumbnail: null,
  });

  const [equityTotal, setEquityTotal] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // localStorage에서 저장된 데이터 불러오기
  useEffect(() => {
    const saved = localStorage.getItem("creator_form_draft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
      } catch (e) {
        console.error("Failed to load draft:", e);
      }
    }
  }, []);

  // 지분 합계 계산
  useEffect(() => {
    const investor = parseFloat(formData.investorEquity) || 0;
    const creator = parseFloat(formData.creatorEquity) || 0;
    const total = formData.platformEquity + investor + creator;
    setEquityTotal(total);
  }, [formData.investorEquity, formData.creatorEquity, formData.platformEquity]);

  // 전화번호 자동 하이픈
  const formatPhone = (value: string) => {
    const numbers = value.replace(/[^\d]/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  // 금액 자동 콤마
  const formatAmount = (value: string) => {
    const numbers = value.replace(/[^\d]/g, "");
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleChange = (field: keyof FormData, value: any) => {
    if (field === "phone") {
      value = formatPhone(value);
    } else if (field === "targetAmount") {
      value = formatAmount(value);
    } else if (field === "channels") {
      const current = formData.channels;
      if (current.includes(value)) {
        value = current.filter((c) => c !== value);
      } else {
        value = [...current, value];
      }
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, thumbnail: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = "출품자 이름을 입력해주세요.";
    if (!formData.country) newErrors.country = "국가를 선택해주세요.";
    if (!formData.phone) newErrors.phone = "연락처를 입력해주세요.";
    if (!formData.email || !formData.email.includes("@")) newErrors.email = "올바른 이메일을 입력해주세요.";
    if (!formData.targetAmount) newErrors.targetAmount = "투자 목표액을 입력해주세요.";
    if (!formData.investorEquity) newErrors.investorEquity = "인베스터 지분을 입력해주세요.";
    if (!formData.creatorEquity) newErrors.creatorEquity = "창작자 지분을 입력해주세요.";
    if (equityTotal !== 100) newErrors.equity = "지분 합계가 100%가 되어야 합니다.";
    if (!formData.bankName) newErrors.bankName = "은행을 선택해주세요.";
    if (!formData.accountNumber) newErrors.accountNumber = "계좌번호를 입력해주세요.";
    if (!formData.title) newErrors.title = "출품작 제목을 입력해주세요.";
    if (!formData.category) newErrors.category = "카테고리를 선택해주세요.";
    if (!formData.description) newErrors.description = "작품 설명을 입력해주세요.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = () => {
    localStorage.setItem("creator_form_draft", JSON.stringify(formData));
    setToastMessage("임시 저장되었습니다.");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      setToastMessage("필수 항목을 모두 입력해주세요.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    // 관리자에게 전송 (console.log)
    console.log("=== 출품 신청서 ===", formData);
    
    // 대시보드에 프로젝트 추가
    const newProject = {
      id: `project_${Date.now()}`,
      title: formData.title,
      submitDate: new Date().toLocaleDateString("ko-KR"),
      status: "심사중" as const,
      progress: 0,
      targetAmount: parseInt(formData.targetAmount.replace(/,/g, "")) || 0,
      currentAmount: 0,
    };
    
    const existingProjects = localStorage.getItem("creator_submitted_projects");
    const projects = existingProjects ? JSON.parse(existingProjects) : [];
    projects.push(newProject);
    localStorage.setItem("creator_submitted_projects", JSON.stringify(projects));
    
    // localStorage에서 초안 삭제
    localStorage.removeItem("creator_form_draft");
    
    setToastMessage("심사 요청이 완료되었습니다.");
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      router.push("/creator/dashboard");
    }, 2000);
  };

  return (
    <div className="bg-background" style={{ paddingTop: "80px", paddingBottom: "120px", minHeight: "100vh" }}>
      {showToast && (
        <div
          style={{
            position: "fixed",
            top: "80px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10000,
            backgroundColor: "var(--card-bg)",
            padding: "12px 24px",
            borderRadius: "12px",
            border: "1px solid var(--border-color)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            color: "var(--text-primary)",
            fontWeight: "bold",
            animation: "popUp 0.4s ease-out",
          }}
        >
          {toastMessage}
        </div>
      )}

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "30px" }}>
          프로젝트 출품 신청
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "30px" }}>
          {/* 좌측: 입력 폼 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
            {/* 섹션 1: 기본 정보 */}
            <div style={{ backgroundColor: "var(--card-bg)", padding: "24px", borderRadius: "16px", border: "1px solid var(--border-color)" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "20px" }}>
                기본 정보
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", color: "var(--text-secondary)", fontSize: "14px" }}>
                    출품자 이름 (실명) *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: `1px solid ${errors.name ? "var(--up-color)" : "var(--border-color)"}`,
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      fontSize: "14px",
                    }}
                  />
                  {errors.name && <span style={{ color: "var(--up-color)", fontSize: "12px" }}>{errors.name}</span>}
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "8px", color: "var(--text-secondary)", fontSize: "14px" }}>
                    국가 *
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => handleChange("country", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: `1px solid ${errors.country ? "var(--up-color)" : "var(--border-color)"}`,
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      fontSize: "14px",
                    }}
                  >
                    <option value="">선택하세요</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {errors.country && <span style={{ color: "var(--up-color)", fontSize: "12px" }}>{errors.country}</span>}
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "8px", color: "var(--text-secondary)", fontSize: "14px" }}>
                    연락처 *
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="010-1234-5678"
                    maxLength={13}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: `1px solid ${errors.phone ? "var(--up-color)" : "var(--border-color)"}`,
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      fontSize: "14px",
                    }}
                  />
                  {errors.phone && <span style={{ color: "var(--up-color)", fontSize: "12px" }}>{errors.phone}</span>}
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "8px", color: "var(--text-secondary)", fontSize: "14px" }}>
                    이메일 주소 *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: `1px solid ${errors.email ? "var(--up-color)" : "var(--border-color)"}`,
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      fontSize: "14px",
                    }}
                  />
                  {errors.email && <span style={{ color: "var(--up-color)", fontSize: "12px" }}>{errors.email}</span>}
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "8px", color: "var(--text-secondary)", fontSize: "14px" }}>
                    출품작 URL
                  </label>
                  <input
                    type="url"
                    value={formData.projectUrl}
                    onChange={(e) => handleChange("projectUrl", e.target.value)}
                    placeholder="URL이 없다면 이메일로 첨부하여 전송 바랍니다."
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      fontSize: "14px",
                    }}
                  />
                  <p style={{ marginTop: "4px", fontSize: "12px", color: "#888" }}>
                    URL이 없다면 이메일로 첨부하여 전송 바랍니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 섹션 2: 투자 조건 및 정산 */}
            <div style={{ backgroundColor: "var(--card-bg)", padding: "24px", borderRadius: "16px", border: "1px solid var(--border-color)" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "20px" }}>
                투자 조건 및 정산
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", color: "var(--text-secondary)", fontSize: "14px" }}>
                    투자 목표액 (원) *
                  </label>
                  <input
                    type="text"
                    value={formData.targetAmount}
                    onChange={(e) => handleChange("targetAmount", e.target.value)}
                    placeholder="10,000,000"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: `1px solid ${errors.targetAmount ? "var(--up-color)" : "var(--border-color)"}`,
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      fontSize: "14px",
                    }}
                  />
                  {errors.targetAmount && <span style={{ color: "var(--up-color)", fontSize: "12px" }}>{errors.targetAmount}</span>}
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "8px", color: "var(--text-secondary)", fontSize: "14px" }}>
                    지분 구조 (Equity Split) *
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px", backgroundColor: "var(--bg-secondary)", borderRadius: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "var(--text-secondary)" }}>회사(플랫폼):</span>
                      <span style={{ color: "var(--text-primary)", fontWeight: "bold" }}>10% (고정)</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                      <span style={{ color: "var(--text-secondary)", flex: 1 }}>인베스터:</span>
                      <input
                        type="number"
                        value={formData.investorEquity}
                        onChange={(e) => handleChange("investorEquity", e.target.value)}
                        placeholder="0"
                        min="0"
                        max="90"
                        style={{
                          width: "100px",
                          padding: "8px",
                          borderRadius: "6px",
                          border: `1px solid ${errors.investorEquity ? "var(--up-color)" : "var(--border-color)"}`,
                          backgroundColor: "var(--bg-primary)",
                          color: "var(--text-primary)",
                          fontSize: "14px",
                          textAlign: "right",
                        }}
                      />
                      <span style={{ color: "var(--text-primary)", width: "30px" }}>%</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                      <span style={{ color: "var(--text-secondary)", flex: 1 }}>본인(창작자):</span>
                      <input
                        type="number"
                        value={formData.creatorEquity}
                        onChange={(e) => handleChange("creatorEquity", e.target.value)}
                        placeholder="0"
                        min="0"
                        max="90"
                        style={{
                          width: "100px",
                          padding: "8px",
                          borderRadius: "6px",
                          border: `1px solid ${errors.creatorEquity ? "var(--up-color)" : "var(--border-color)"}`,
                          backgroundColor: "var(--bg-primary)",
                          color: "var(--text-primary)",
                          fontSize: "14px",
                          textAlign: "right",
                        }}
                      />
                      <span style={{ color: "var(--text-primary)", width: "30px" }}>%</span>
                    </div>
                    <div
                      style={{
                        marginTop: "8px",
                        padding: "12px",
                        backgroundColor: equityTotal === 100 ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                        borderRadius: "6px",
                        textAlign: "center",
                      }}
                    >
                      <span style={{ color: equityTotal === 100 ? "rgb(34, 197, 94)" : "var(--up-color)", fontWeight: "bold" }}>
                        합계: {equityTotal}%
                      </span>
                      {equityTotal !== 100 && (
                        <p style={{ marginTop: "4px", fontSize: "12px", color: "var(--up-color)" }}>
                          지분 합계가 100%가 되어야 합니다.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "8px", color: "var(--text-secondary)", fontSize: "14px" }}>
                    정산 받을 계좌번호 *
                  </label>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <select
                      value={formData.bankName}
                      onChange={(e) => handleChange("bankName", e.target.value)}
                      style={{
                        width: "150px",
                        padding: "12px",
                        borderRadius: "8px",
                        border: `1px solid ${errors.bankName ? "var(--up-color)" : "var(--border-color)"}`,
                        backgroundColor: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                        fontSize: "14px",
                      }}
                    >
                      <option value="">은행 선택</option>
                      <option value="KB국민은행">KB국민은행</option>
                      <option value="신한은행">신한은행</option>
                      <option value="우리은행">우리은행</option>
                      <option value="하나은행">하나은행</option>
                      <option value="NH농협은행">NH농협은행</option>
                      <option value="카카오뱅크">카카오뱅크</option>
                      <option value="토스뱅크">토스뱅크</option>
                    </select>
                    <input
                      type="text"
                      value={formData.accountNumber}
                      onChange={(e) => handleChange("accountNumber", e.target.value)}
                      placeholder="계좌번호"
                      style={{
                        flex: 1,
                        padding: "12px",
                        borderRadius: "8px",
                        border: `1px solid ${errors.accountNumber ? "var(--up-color)" : "var(--border-color)"}`,
                        backgroundColor: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                        fontSize: "14px",
                      }}
                    />
                  </div>
                  {(errors.bankName || errors.accountNumber) && (
                    <span style={{ color: "var(--up-color)", fontSize: "12px" }}>{errors.bankName || errors.accountNumber}</span>
                  )}
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "8px", color: "var(--text-secondary)", fontSize: "14px" }}>
                    정산 지갑 주소 (USDT/ETH 등)
                  </label>
                  <input
                    type="text"
                    value={formData.walletAddress}
                    onChange={(e) => handleChange("walletAddress", e.target.value)}
                    placeholder="0x..."
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      fontSize: "14px",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 섹션 3: 작품 상세 정보 */}
            <div style={{ backgroundColor: "var(--card-bg)", padding: "24px", borderRadius: "16px", border: "1px solid var(--border-color)" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "20px" }}>
                작품 상세 정보
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", color: "var(--text-secondary)", fontSize: "14px" }}>
                    출품작 제목 *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: `1px solid ${errors.title ? "var(--up-color)" : "var(--border-color)"}`,
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      fontSize: "14px",
                    }}
                  />
                  {errors.title && <span style={{ color: "var(--up-color)", fontSize: "12px" }}>{errors.title}</span>}
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "8px", color: "var(--text-secondary)", fontSize: "14px" }}>
                    카테고리 *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: `1px solid ${errors.category ? "var(--up-color)" : "var(--border-color)"}`,
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      fontSize: "14px",
                    }}
                  >
                    <option value="">선택하세요</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {errors.category && <span style={{ color: "var(--up-color)", fontSize: "12px" }}>{errors.category}</span>}
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "8px", color: "var(--text-secondary)", fontSize: "14px" }}>
                    작품 설명 *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    rows={6}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: `1px solid ${errors.description ? "var(--up-color)" : "var(--border-color)"}`,
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      fontSize: "14px",
                      resize: "vertical",
                    }}
                  />
                  {errors.description && <span style={{ color: "var(--up-color)", fontSize: "12px" }}>{errors.description}</span>}
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "8px", color: "var(--text-secondary)", fontSize: "14px" }}>
                    에피소드/수량
                  </label>
                  <input
                    type="text"
                    value={formData.episodeCount}
                    onChange={(e) => handleChange("episodeCount", e.target.value)}
                    placeholder="예: 20개"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      fontSize: "14px",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "8px", color: "var(--text-secondary)", fontSize: "14px" }}>
                    노출 채널 (다중 선택)
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {CHANNELS.map((channel) => (
                      <label
                        key={channel}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          border: `1px solid ${formData.channels.includes(channel) ? "var(--accent-color)" : "var(--border-color)"}`,
                          backgroundColor: formData.channels.includes(channel) ? "rgba(124, 58, 237, 0.1)" : "var(--bg-secondary)",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.channels.includes(channel)}
                          onChange={() => handleChange("channels", channel)}
                          style={{ cursor: "pointer" }}
                        />
                        <span style={{ fontSize: "14px", color: "var(--text-primary)" }}>{channel}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "8px", color: "var(--text-secondary)", fontSize: "14px" }}>
                    썸네일 이미지
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    style={{ display: "none" }}
                    id="thumbnail-upload"
                  />
                  <label
                    htmlFor="thumbnail-upload"
                    style={{
                      display: "inline-block",
                      padding: "12px 24px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    이미지 업로드
                  </label>
                  {formData.thumbnail && (
                    <div style={{ marginTop: "12px", width: "200px", height: "200px", position: "relative", borderRadius: "8px", overflow: "hidden" }}>
                      <Image src={formData.thumbnail} alt="Thumbnail" fill style={{ objectFit: "cover" }} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 섹션 4: 액션 버튼 */}
            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button
                onClick={handleSaveDraft}
                style={{
                  flex: 1,
                  padding: "16px",
                  borderRadius: "12px",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  fontWeight: "bold",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                임시 저장
              </button>
              <button
                onClick={handleSubmit}
                style={{
                  flex: 1,
                  padding: "16px",
                  borderRadius: "12px",
                  border: "none",
                  backgroundColor: "var(--accent-color)",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                제출하기
              </button>
            </div>
          </div>

          {/* 우측: 실시간 미리보기 */}
          <div style={{ position: "sticky", top: "100px", height: "fit-content" }}>
            <div style={{ backgroundColor: "var(--card-bg)", padding: "24px", borderRadius: "16px", border: "1px solid var(--border-color)" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "20px" }}>
                모바일 미리보기
              </h3>
              <div
                style={{
                  width: "360px",
                  maxWidth: "100%",
                  margin: "0 auto",
                  backgroundColor: "var(--bg-primary)",
                  borderRadius: "12px",
                  padding: "16px",
                  border: "2px solid var(--border-color)",
                }}
              >
                {formData.thumbnail ? (
                  <div style={{ width: "100%", height: "200px", position: "relative", borderRadius: "8px", overflow: "hidden", marginBottom: "12px" }}>
                    <Image src={formData.thumbnail} alt="Preview" fill style={{ objectFit: "cover" }} />
                  </div>
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "200px",
                      backgroundColor: "var(--bg-secondary)",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "12px",
                      color: "var(--text-muted)",
                    }}
                  >
                    썸네일 미리보기
                  </div>
                )}
                <h4 style={{ fontSize: "18px", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "8px" }}>
                  {formData.title || "출품작 제목"}
                </h4>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "8px" }}>
                  {formData.category || "카테고리"}
                </p>
                <p style={{ fontSize: "14px", color: "var(--text-primary)", lineHeight: "1.6", marginBottom: "12px" }}>
                  {formData.description || "작품 설명이 여기에 표시됩니다."}
                </p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {formData.channels.map((c) => (
                    <span
                      key={c}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        backgroundColor: "var(--bg-secondary)",
                        color: "var(--text-secondary)",
                        fontSize: "11px",
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
                <div style={{ marginTop: "16px", padding: "12px", backgroundColor: "var(--bg-secondary)", borderRadius: "8px" }}>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>목표 금액</div>
                  <div style={{ fontSize: "20px", fontWeight: "bold", color: "var(--text-primary)" }}>
                    {formData.targetAmount ? `${formData.targetAmount}원` : "0원"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

