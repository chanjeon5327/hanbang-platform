export default function ApprovalQueue() {
    return (
      <section className="bg-white rounded-xl border p-4">
        <h2 className="font-semibold mb-4">
          ⚠️ 내가 처리해야 할 승인
        </h2>
  
        <ul className="space-y-3">
          {[
            {
              id: 1,
              title: '정산 확정',
              from: '검수자 A',
              next: 'CFO',
            },
            {
              id: 2,
              title: '이벤트 등록',
              from: 'CS팀',
              next: 'CMO',
            },
          ].map((item) => (
            <li
              key={item.id}
              className="border rounded-lg p-3 flex justify-between items-center"
            >
              <div>
                <div className="font-medium">{item.title}</div>
                <div className="text-xs text-gray-500">
                  {item.from} → {item.next}
                </div>
              </div>
  
              <button className="px-3 py-1 rounded-lg bg-blue-600 text-white text-sm">
                검수 완료
              </button>
            </li>
          ))}
        </ul>
      </section>
    );
  }
  