'use client';

import { FileCheck, Shield } from 'lucide-react';
import KycReviewTable from '@/components/admin/kyc/KycReviewTable';

export default function AdminKycPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text)' }}>
        <FileCheck size={24} />
        KYC 관리
      </h1>

      <section className="mb-8">
        <h2 className="font-semibold mb-4 flex items-center gap-2" style={{ fontSize: 16, color: 'var(--text)' }}>
          <Shield size={20} />
          KYC 심사
        </h2>
        <KycReviewTable />
      </section>
    </div>
  );
}
