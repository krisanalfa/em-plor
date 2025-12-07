"use client";

import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/Button";
import { TextField } from "@/components/Fields";
import { useEffect, useState } from "react";
import { useAuth, useProfile } from "@/lib/hooks/auth";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("genesys.admin@example.com");
  const [password, setPassword] = useState("password");
  const { authenticate, loading, token, storeToken } = useAuth();
  const { whoami, account } = useProfile();
  const authStore = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    authenticate({ variables: { email, password } });
  };

  useEffect(() => {
    if (token) {
      authStore.setToken(token);
      storeToken(token);
      whoami();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (account) {
      authStore.setAccount(account);
      router.push("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  return (
    <AuthLayout
      title="Sign in to account"
      subtitle={<>Please sign in to your account to manage your employees. </>}
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <TextField
            label="Email address"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button
          type="submit"
          color="cyan"
          className="mt-8 w-full"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </AuthLayout>
  );
}
