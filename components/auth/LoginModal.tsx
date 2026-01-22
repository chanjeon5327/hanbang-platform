import { useRouter } from "next/navigation";

export default function LoginModal() {
  const router = useRouter();

  return (
    <button onClick={() => router.push("/login")}>
      로그인
    </button>
  );
}
