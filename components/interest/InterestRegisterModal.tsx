'use client';

import { useState } from 'react';

type Props = {
  contentId: string;
  onClose: () => void;
  onSuccess: () => void;
};

export default function InterestRegisterModal({
  contentId,
  onClose,
  onSuccess,
}: Props) {
  const [type, setType] = useState<'email' | 'phone'>('email');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!value) {
      alert('값을 입력해주세요');
      return;
    }

    try {
      setLoading(true);

      await fetch('/api/interest/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId,
          contactType: type,
          contactValue: value,
        }),
      });

      onSuccess();
      onClose();
    } catch (e) {
      console.error('[INTEREST_REGISTER_MODAL_ERROR]', e);
      alert('잠시 후 다시 시도해주세요');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50">
      <div className="w-full rounded-t-2xl bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">관심 등록</h2>

        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={() => setType('email')}
            className={`flex-1 rounded-lg border p-2 ${
              type === 'email' ? 'border-black' : 'border-gray-300'
            }`}
          >
            이메일
          </button>

          <button
            type="button"
            onClick={() => setType('phone')}
            className={`flex-1 rounded-lg border p-2 ${
              type === 'phone' ? 'border-black' : 'border-gray-300'
            }`}
          >
            전화번호
          </button>
        </div>

        <input
          className="mb-2 w-full rounded-lg border p-3"
          placeholder={type === 'email' ? '이메일 입력' : '전화번호 입력'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        <p className="mb-4 text-xs text-gray-500">
          {type === 'email'
            ? '오픈 및 변경사항을 이메일로 안내드립니다'
            : '앱 푸시로 변경사항을 알려드립니다'}
        </p>

        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="w-full rounded-lg bg-black py-3 text-white disabled:opacity-50"
        >
          {loading ? '등록 중...' : '등록하기'}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full text-sm text-gray-500"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
