'use client';

import { useState } from 'react';

const DOC_TYPES = [
  { value: 'resident', label: '주민등록증' },
  { value: 'license', label: '운전면허' },
  { value: 'passport', label: '여권' },
] as const;

type Props = {
  onSubmitted: () => void;
};

export default function KycForm({ onSubmitted }: Props) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [docType, setDocType] = useState<(typeof DOC_TYPES)[number]['value']>('resident');
  const [address, setAddress] = useState('');
  const [privacy, setPrivacy] = useState(false);
  const [pii, setPii] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [demoMessage, setDemoMessage] = useState<string | null>(null);

  const canSubmit =
    fullName.trim().length >= 2 &&
    phone.trim().length >= 10 &&
    birthDate.length >= 10 &&
    privacy &&
    pii;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setDemoMessage(null);

    const payload = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      birthDate,
      docType,
      address: address.trim() || null,
      consents: { privacy: true, pii: true },
    };

    try {
      const res = await fetch('/api/kyc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          real_name: payload.fullName,
          phone: payload.phone || null,
          birth_date: payload.birthDate || null,
          address: payload.address || null,
        }),
      });
      const json = await res.json().catch(() => ({}));

      if (res.ok && json?.ok) {
        onSubmitted();
      } else {
        onSubmitted();
        setDemoMessage('데모 제출 처리되었습니다. (API 실패 시에도 진행)');
      }
    } catch {
      onSubmitted();
      setDemoMessage('데모 제출 처리되었습니다. (API 실패 시에도 진행)');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="rounded-2xl p-4"
      style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <h3 className="font-semibold mb-3" style={{ fontSize: 14, color: 'var(--text)' }}>
        본인 정보 입력
      </h3>

      <div className="space-y-3">
        <div>
          <label className="block caption mb-1" style={{ color: 'var(--text-secondary)' }}>
            이름 *
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="홍길동"
            className="w-full px-3 py-2.5 rounded-xl border body-sm"
            style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
          />
        </div>

        <div>
          <label className="block caption mb-1" style={{ color: 'var(--text-secondary)' }}>
            휴대폰 *
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="010-1234-5678"
            className="w-full px-3 py-2.5 rounded-xl border body-sm"
            style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
          />
        </div>

        <div>
          <label className="block caption mb-1" style={{ color: 'var(--text-secondary)' }}>
            생년월일 *
          </label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border body-sm"
            style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
          />
        </div>

        <div>
          <label className="block caption mb-1" style={{ color: 'var(--text-secondary)' }}>
            신분증 종류
          </label>
          <div className="flex gap-2">
            {DOC_TYPES.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => setDocType(d.value)}
                className="flex-1 py-2 rounded-xl caption font-semibold transition"
                style={{
                  backgroundColor: docType === d.value ? 'var(--royal-blue)' : 'var(--bg)',
                  color: docType === d.value ? '#fff' : 'var(--text-secondary)',
                  border: docType === d.value ? 'none' : '1px solid var(--border)',
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block caption mb-1" style={{ color: 'var(--text-secondary)' }}>
            주소
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="서울시 강남구..."
            className="w-full px-3 py-2.5 rounded-xl border body-sm"
            style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
          />
        </div>

        <div className="space-y-2 pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={privacy}
              onChange={(e) => setPrivacy(e.target.checked)}
              className="rounded"
            />
            <span className="caption" style={{ color: 'var(--text)' }}>
              개인정보 수집/이용 동의 (필수)
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={pii}
              onChange={(e) => setPii(e.target.checked)}
              className="rounded"
            />
            <span className="caption" style={{ color: 'var(--text)' }}>
              고유식별정보 처리 동의 (필수)
            </span>
          </label>
        </div>
      </div>

      {demoMessage && (
        <p className="caption mt-2" style={{ color: 'var(--royal-blue)' }}>
          {demoMessage}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit || submitting}
        className="w-full mt-4 py-2.5 rounded-xl font-semibold text-white transition active:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: 'var(--royal-blue)', fontSize: 14 }}
      >
        {submitting ? '제출 중…' : '제출하기'}
      </button>
    </div>
  );
}
