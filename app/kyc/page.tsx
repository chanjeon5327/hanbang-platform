// app/kyc/page.tsx
import { redirect } from 'next/navigation';

export default function KycIndexPage() {
  redirect('/kyc/start');
}
