'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBrowserSupabase } from '@/utils/supabase/client';

const BUCKET = 'creator-plans';

export default function CreatorUploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [contentId, setContentId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      if (f.type !== 'application/pdf') {
        setError('PDF 파일만 업로드 가능합니다.');
        setFile(null);
        return;
      }
      setError('');
      setFile(f);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('파일을 선택해주세요.');
      return;
    }
    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const supabase = getBrowserSupabase();
      if (!supabase?.storage) {
        throw new Error('스토리지 초기화 실패');
      }

      const ext = file.name.split('.').pop() || 'pdf';
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const publicUrl = urlData.publicUrl;

      if (contentId.trim()) {
        const res = await fetch('/api/creator/update-plan-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content_id: contentId.trim(), creator_plan_pdf: publicUrl }),
        });
        const j = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(j?.error ?? '저장 실패');
      }

      setSuccess(contentId.trim() ? '업로드 및 저장 완료!' : `업로드 완료. URL: ${publicUrl}`);
      setFile(null);
      if (contentId.trim()) {
        setTimeout(() => router.push(`/market/${contentId.trim()}`), 1500);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '업로드 실패');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>작가의 기획 (PDF)</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
            작품 ID (content_id)
          </label>
          <input
            type="text"
            value={contentId}
            onChange={(e) => setContentId(e.target.value)}
            placeholder="저장할 종목 ID (선택)"
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
        </div>
        {error && <p style={{ color: '#dc2626', fontSize: 14 }}>{error}</p>}
        {success && <p style={{ color: '#059669', fontSize: 14 }}>{success}</p>}
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading || !file}
          style={{
            padding: '12px 20px',
            borderRadius: 12,
            background: '#6d28d9',
            color: '#fff',
            fontWeight: 700,
            border: 'none',
            cursor: uploading ? 'not-allowed' : 'pointer',
            opacity: uploading || !file ? 0.6 : 1,
          }}
        >
          {uploading ? '업로드 중…' : '업로드'}
        </button>
      </div>
    </div>
  );
}
