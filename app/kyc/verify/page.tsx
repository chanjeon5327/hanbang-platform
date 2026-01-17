// app/kyc/verify/page.tsx
'use client';

export default function KycVerifyPage() {
  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">본인인증 진행</h1>

      <p className="text-sm text-gray-600 mb-6">
        (MVP) 현재는 더미 KYC 단계입니다.<br />
        실제 서비스에서는 이 단계에서<br />
        휴대폰 본인인증 / 신분증 인증이 진행됩니다.
      </p>

      <div className="bg-gray-100 p-4 rounded text-sm text-gray-700">
        ✔ 인증 요청이 접수되었습니다.<br />
        ✔ 관리자 승인 후 거래가 가능합니다.
      </div>
    </div>
  );
}
