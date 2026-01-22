"use client";

import { useEffect } from "react";
import { supabaseClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Globe, Mail } from "lucide-react";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const supabase = supabaseClient;

  // 로그인 성공 시 모달 닫기만 담당
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          onOpenChange(false);
        }
      }
    );

    return () => {
      sub.subscription.unsubscribe();
    };
  }, [onOpenChange]);

  const handleKakaoLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: { redirectTo: `${location.origin}/lobby` },
    });
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/lobby` },
    });
  };

  const handleEmailLogin = async () => {
    // 예: 이메일 로그인 / 매직링크
    // await supabase.auth.signInWithOtp({ email })
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>로그인 / 회원가입</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Button onClick={handleKakaoLogin} className="w-full">
            카카오로 로그인
          </Button>

          <button
            onClick={handleGoogleLogin}
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-white border-2 border-gray-200 py-4 font-bold text-gray-700 hover:bg-gray-50"
          >
            <Globe className="w-5 h-5" />
            구글로 시작하기
          </button>

          <button
            onClick={handleEmailLogin}
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-gray-100 py-4 font-bold text-gray-700 hover:bg-gray-200"
          >
            <Mail className="w-5 h-5" />
            이메일로 시작하기
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
