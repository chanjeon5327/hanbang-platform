import MyPageLayout from '@/components/mypage/MyPageLayout';
import MyAssetSummary from '@/components/mypage/MyAssetSummary';
import MyInvestList from '@/components/mypage/MyInvestList';
import MyHistory from '@/components/mypage/MyHistory';

export default function MyPage() {
  return (
    <MyPageLayout>
      <MyAssetSummary />
      <MyInvestList />
      <MyHistory />
    </MyPageLayout>
  );
}
