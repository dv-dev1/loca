"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

function Field({
  label,
  type = "text",
  placeholder,
  autoComplete,
  value,
  onChange,
}: {
  label: string;
  type?: string;
  placeholder: string;
  autoComplete?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[0.7rem] uppercase tracking-[0.15em] text-ink-faint">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full border-b border-ink/25 bg-transparent pb-2 text-lg text-ink outline-none transition placeholder:text-ink-faint/70 focus:border-brand"
      />
    </label>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (signInError) {
      setError("E-mail ou senha inválidos.");
      return;
    }

    router.push("/painel");
  }

  return (
    <form className="mt-10 flex flex-col gap-7" onSubmit={handleSubmit}>
      <Field
        label="E-mail"
        type="email"
        placeholder="voce@imobiliaria.com.br"
        autoComplete="email"
        value={email}
        onChange={setEmail}
      />
      <Field
        label="Senha"
        type="password"
        placeholder="••••••••"
        autoComplete="current-password"
        value={password}
        onChange={setPassword}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="mt-2 flex flex-col gap-4">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-[3.25rem] items-center justify-center rounded-sm bg-brand font-semibold text-paper transition hover:bg-brand-2 disabled:opacity-60"
        >
          {loading ? "Entrando…" : "Entrar no painel"}
        </button>
        <a href="#" className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-ink-faint transition hover:text-ink">
          Esqueci minha senha
        </a>
      </div>
    </form>
  );
}
