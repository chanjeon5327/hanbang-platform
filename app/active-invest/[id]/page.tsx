import MarketDetailPage from "@/app/market/[id]/page";

export default function Page({ params }: { params: { id: string } }) {
  return <MarketDetailPage params={params} />;
}
