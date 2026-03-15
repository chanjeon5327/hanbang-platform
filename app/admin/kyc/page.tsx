'use client';

import { FileCheck } from 'lucide-react';
import KycReviewTable from '@/components/admin/kyc/KycReviewTable';

export default function AdminKycPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text)' }}>
        <FileCheck size={24} />
        KYC 관리
      </h1>

      <section>
        <KycReviewTable />
      </section>
    </div>
  );
}
