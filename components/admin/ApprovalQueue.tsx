export default function ApprovalQueue() {
  return (
    <section className="bg-white rounded-[16px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[var(--toss-border)]">
      <h2 className="text-[17px] font-bold text-[var(--toss-text)] mb-4">
        ⚠️ 내가 처리해야 할 승인
      </h2>
      <ul className="space-y-3">
        {[
          { id: 1, title: '정산 확정', from: '검수자 A', next: 'CFO' },
          { id: 2, title: '이벤트 등록', from: 'CS팀', next: 'CMO' },
        ].map((item) => (
          <li
            key={item.id}
            className="border border-[var(--toss-border)] rounded-[12px] p-4 flex justify-between items-center"
          >
            <div>
              <div className="font-semibold text-[var(--toss-text)]">{item.title}</div>
              <div className="text-[13px] text-[var(--toss-text-secondary)] mt-0.5">
                {item.from} → {item.next}
              </div>
            </div>
            <button className="px-4 py-2 rounded-lg bg-[var(--toss-blue)] text-white text-[14px] font-medium hover:opacity-90 transition">
              검수 완료
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
