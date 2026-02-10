export const dynamic = "force-dynamic";

type RailItem = {
  id: string;
  title: string;
  summary?: string | null;
  thumbnail_url?: string | null;
  creator_name?: string | null;
  category?: string | null;
  platform?: string | null;
  score: number;
  reason?: { code: string; text: string };
};

type Rail = {
  key: string;
  title: string;
  items: RailItem[];
};

export default async function HomePage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/home/rails`, {
    cache: "no-store",
  }).catch(() => null);

  const json = res ? await res.json() : null;
  const rails: Rail[] = json?.rails ?? [];

  return (
    <main className="p-4 space-y-8">
      {rails.map((rail) => (
        <section key={rail.key} className="space-y-3">
          <div className="flex items-end justify-between">
            <h2 className="text-lg font-semibold">{rail.title}</h2>
            <span className="text-xs text-gray-500">{rail.items.length}개</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {rail.items.map((it) => (
              <a
                key={it.id}
                href={`/market/${it.id}`}
                className="rounded-2xl border border-gray-200 overflow-hidden hover:shadow-sm transition"
              >
                <div className="aspect-[4/5] bg-gray-100">
                  {it.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={it.thumbnail_url}
                      alt={it.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : null}
                </div>

                <div className="p-3 space-y-1">
                  <div className="text-sm font-semibold line-clamp-2">{it.title}</div>
                  {it.creator_name ? (
                    <div className="text-xs text-gray-500 line-clamp-1">{it.creator_name}</div>
                  ) : null}

                  {/* ✅ v2.10: 추천 이유 노출 */}
                  {it.reason?.text ? (
                    <div className="text-xs text-gray-600">
                      <span className="inline-block px-2 py-1 rounded-full bg-gray-100">
                        {it.reason.text}
                      </span>
                    </div>
                  ) : null}
                </div>
              </a>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
