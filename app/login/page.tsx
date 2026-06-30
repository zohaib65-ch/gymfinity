"use client";

import { useRouter } from "next/navigation";
import LoginPanel from "@/components/login-panel";

export default function LoginPage() {
  const router = useRouter();

  const handleLoginSuccess = (user: { id: string; name: string; username: string; role: "admin" }) => {
    window.localStorage.setItem("gym_user_session", JSON.stringify(user));
    router.replace("/dashboard");
  };

  return <LoginPanel onLoginSuccess={handleLoginSuccess} />;
}
