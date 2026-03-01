'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreatorUploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [contentId, setContentId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [planPdfUrl, setPlanPdfUrl] = useState<string | null>(null);
  const [strategySummary, setStrategySummary] = useState('');
  const [targetMarket, setTargetMarket] = useState('');
  const [revenueModel, setRevenueModel] = useState('');
  const [coreTeam, setCoreTeam] = useState('');
  const [equipmentStack, setEquipmentStack] = useState('');
  const [distributionPlan, setDistributionPlan] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      if (f.type !== 'application/pdf') {
        setError('PDF 파일만 업로드 가능합니다.');
        setFile(null);
        return;
      }
      if (f.size > 10 * 1024 * 1024) {
        setError('파일 크기는 10MB 이하여야 합니다.');
        setFile(null);
        return;
      }
      setError('');
      setFile(f);
    }
  };

  const hasStrategyFields = strategySummary.trim() || targetMarket.trim() || revenueModel.trim() || coreTeam.trim() || equipmentStack.trim() || distributionPlan.trim();

  const handleUpload = async () => {
    if (!contentId.trim()) {
      setError('작품 ID (content_id)를 입력해주세요.');
      return;
    }
    if (!file && !hasStrategyFields) {
      setError('PDF 파일 또는 전략 정보를 입력해주세요.');
      return;
    }
    setUploading(true);
    setError('');
    setSuccess('');
    setPlanPdfUrl(null);

    try {
      const formData = new FormData();
      if (file) formData.append('file', file);
      formData.append('content_id', contentId.trim());
      formData.append('strategy_summary', strategySummary.trim());
      formData.append('target_market', targetMarket.trim());
      formData.append('revenue_model', revenueModel.trim());
      formData.append('core_team', coreTeam.trim());
      formData.append('equipment_stack', equipmentStack.trim());
      formData.append('distribution_plan', distributionPlan.trim());

      const res = await fetch('/api/creator/update-plan-pdf', {
        method: 'POST',
        body: formData,
      });

      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error ?? '업로드 실패');

      setSuccess(file ? '업로드 및 저장 완료!' : '전략 정보 저장 완료!');
      setPlanPdfUrl(j.plan_pdf_url ?? null);
      setFile(null);
      setTimeout(() => router.push(`/market/${contentId.trim()}`), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : '업로드 실패');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/creator/dashboard" style={{ fontSize: 14, color: '#6B7280' }}>‹ 크리에이터 대시보드</Link>
      </div>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>작가의 기획 (PDF)</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
            작품 ID (content_id) *
          </label>
          <input
            type="text"
            value={contentId}
            onChange={(e) => setContentId(e.target.value)}
            placeholder="저장할 종목 ID (UUID)"
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              fontSize: 14,
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
            PDF 파일 *
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            style={{ fontSize: 14 }}
          />
          <p style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>최대 10MB, PDF만 가능</p>
        </div>

        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>구조화된 전략 입력 (선택)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600 }}>사업 방향 요약</label>
              <textarea
                value={strategySummary}
                onChange={(e) => setStrategySummary(e.target.value)}
                placeholder="한 줄로 핵심 사업 방향을 요약해주세요"
                rows={2}
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, resize: 'vertical' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600 }}>타겟 시장</label>
              <input
                type="text"
                value={targetMarket}
                onChange={(e) => setTargetMarket(e.target.value)}
                placeholder="예: 국내/한류/말레이시아/기업용"
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600 }}>수익 모델</label>
              <input
                type="text"
                value={revenueModel}
                onChange={(e) => setRevenueModel(e.target.value)}
                placeholder="예: 광고, 구독, 라이선싱"
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600 }}>핵심 팀 구성</label>
              <input
                type="text"
                value={coreTeam}
                onChange={(e) => setCoreTeam(e.target.value)}
                placeholder="예: 작가 1명, 어시스턴트 2명"
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600 }}>장비/제작 인프라</label>
              <input
                type="text"
                value={equipmentStack}
                onChange={(e) => setEquipmentStack(e.target.value)}
                placeholder="예: Cintiq, Clip Studio, 클라우드 렌더"
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600 }}>유통 전략</label>
              <input
                type="text"
                value={distributionPlan}
                onChange={(e) => setDistributionPlan(e.target.value)}
                placeholder="예: 웹툰 플랫폼 연재, 해외 OTT 라이선싱"
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14 }}
              />
            </div>
          </div>
        </div>

        {error && <p style={{ color: '#dc2626', fontSize: 14 }}>{error}</p>}
        {success && <p style={{ color: '#059669', fontSize: 14 }}>{success}</p>}
        {planPdfUrl && (
          <p style={{ fontSize: 14 }}>
            <a href={planPdfUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#6D28D9', textDecoration: 'underline' }}>
              미리보기 링크
            </a>
          </p>
        )}
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading || !contentId.trim() || (!file && !hasStrategyFields)}
          style={{
            padding: '12px 20px',
            borderRadius: 12,
            background: '#6d28d9',
            color: '#fff',
            fontWeight: 700,
            border: 'none',
            cursor: uploading ? 'not-allowed' : 'pointer',
            opacity: uploading || !contentId.trim() || (!file && !hasStrategyFields) ? 0.6 : 1,
          }}
        >
          {uploading ? '업로드 중…' : '업로드'}
        </button>
      </div>
    </div>
  );
}
