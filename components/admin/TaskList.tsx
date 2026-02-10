export default function TaskList() {
    return (
      <section className="bg-white rounded-xl border p-4">
        <h2 className="font-semibold mb-4">
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
              className="flex justify-between items-center border rounded-lg p-3"
            >
              <span>{task.title}</span>
              <span className="text-green-600 font-semibold">
                {task.point}pt
              </span>
            </li>
          ))}
        </ul>
      </section>
    );
  }
  