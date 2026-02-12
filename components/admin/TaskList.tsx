export default function TaskList() {
  return (
    <section className="bg-white rounded-[16px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[var(--toss-border)]">
      <h2 className="text-[17px] font-bold text-[var(--toss-text)] mb-4">
        🧩 나의 업무 / 퀘스트
      </h2>
      <ul className="space-y-3">
        {[
          { title: '신규 콘텐츠 검수', point: '+1' },
          { title: '아이디어 제안', point: '+1' },
          { title: '아이디어 채택', point: '+10' },
        ].map((task, idx) => (
          <li
            key={idx}
            className="flex justify-between items-center border border-[var(--toss-border)] rounded-[12px] p-4"
          >
            <span className="font-medium text-[var(--toss-text)]">{task.title}</span>
            <span className="font-semibold text-[var(--accent-positive)]">{task.point}pt</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
