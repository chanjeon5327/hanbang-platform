"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserAuth } from "@/context/UserAuthContext";

export default function TopHeader() {
  const router = useRouter();
  const { user, loading } = useUserAuth();

  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [showPhotoCard, setShowPhotoCard] = useState(false);

  const isAuthenticated = !!user;
}


  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setVisible(lastScrollY > currentScrollY || currentScrollY < 50);
      setScrolled(currentScrollY > 50);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleLogout = async () => {
    try {
      await userLogout();
      router.replace("/");
    } catch (e) {
      console.error("TopHeader logout error:", e);
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  };

  if (loading) return null;

  return (
    <header style={{ position: "fixed", top: "48px", width: "100%", zIndex: 40 }}>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "15px 5%" }}>
        <Link href="/">HANBANG</Link>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <AuthStatus />

          {isAuthenticated ? (
            <>
              <div onClick={() => router.push("/wallet")} style={{ cursor: "pointer" }}>
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : user.email} 님
              </div>
              <button onClick={handleLogout}>로그아웃</button>
            </>
          ) : (
            <button onClick={() => router.push("/login")}>로그인</button>
          )}
        </div>
      </div>

      {showPhotoCard && <div>🎴 데일리 포토카드</div>}
    </header>
  );
}
