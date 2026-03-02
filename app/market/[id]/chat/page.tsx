type Props = { params: Promise<{ id: string }> };

export default async function MarketUserChatPage({ params }: Props) {
  const { id } = await params;
  return (
    <main className="min-h-[70vh] px-4 py-6">
      <h1 className="text-xl font-extrabold">CHAT</h1>
      <p className="mt-2 text-sm text-gray-600">
        (데모) 종목 {id} 유저 채팅/댓글/커뮤니티 영역
      </p>

      <section className="mt-6 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="text-sm text-gray-800">유저 상호 대화 영역(추후 실시간/스레드)</div>
        <div className="mt-3 h-48 rounded-xl bg-gray-50" />
      </section>
    </main>
  );
}
