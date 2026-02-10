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
            className="bg-white rounded-2xl p-5 shadow-sm"
          >
            <div className="text-xs text-gray-500">{item.label}</div>
            <div className="text-2xl font-bold mt-1">{item.value}</div>
          </div>
        ))}
      </section>
    );
  }
  