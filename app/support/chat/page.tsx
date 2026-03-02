export default function SupportChatPage() {
  return (
    <main className="min-h-[70vh] px-4 py-6">
      <h1 className="text-xl font-extrabold">1:1 문의</h1>
      <p className="mt-2 text-sm text-gray-600">
        고객센터 1:1 채팅 영역
      </p>

      <section className="mt-6 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="text-sm text-gray-800">1:1 문의 대화 영역(추후 실시간 연동)</div>
        <div className="mt-3 h-48 rounded-xl bg-gray-50" />
      </section>
    </main>
  );
}
