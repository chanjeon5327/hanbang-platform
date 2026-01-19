import AuthGuard from "@/components/AuthGuard";

export default function HomePage() {
  return (
    <AuthGuard>
      <div className="p-8">
        <h1 className="text-2xl font-bold">홈 콘텐츠 영역</h1>
        <p>이제 레이아웃과 헤더는 정상입니다.</p>
      </div>
    </AuthGuard>
  );
}
