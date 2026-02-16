export default function KPIBar() {
  const items = [
    { label: '처리 대기', value: 3 },
    { label: '오늘 승인', value: 12 },
    { label: '실수', value: 0 },
    { label: '내 포인트', value: 128 },
  ];

  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-white rounded-[16px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[var(--toss-border)]"
        >
          <div className="body-sm text-[var(--toss-text-secondary)]">{item.label}</div>
          <div className="h2 font-bold text-[var(--toss-text)] mt-1" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {item.value}
          </div>
        </div>
      ))}
    </section>
  );
}
