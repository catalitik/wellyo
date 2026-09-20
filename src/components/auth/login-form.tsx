"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError(null);
    const data = new FormData(event.currentTarget);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: String(data.get("email")), password: String(data.get("password")) });
      if (signInError) throw signInError;
      window.location.assign("/dashboard");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo iniciar sesión."); setLoading(false); }
  }
  return <form className="mt-8 space-y-5" onSubmit={submit}><label className="block"><span className="mb-2 block text-sm font-semibold">Correo electrónico</span><input name="email" type="email" required placeholder="tu@email.com" className="w-full rounded-xl border border-sage-200 bg-cream px-4 py-3.5 outline-none transition focus:border-sage-500 focus:ring-2 focus:ring-sage-100" /></label><label className="block"><span className="mb-2 block text-sm font-semibold">Contraseña</span><input name="password" type="password" required placeholder="Tu contraseña" className="w-full rounded-xl border border-sage-200 bg-cream px-4 py-3.5 outline-none transition focus:border-sage-500 focus:ring-2 focus:ring-sage-100" /></label><div className="flex justify-end"><a href="#" className="text-sm font-semibold text-sage-700">¿Has olvidado tu contraseña?</a></div>{error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}<button disabled={loading} type="submit" className="w-full rounded-xl bg-sage-500 px-5 py-3.5 font-semibold text-white shadow-soft transition hover:bg-sage-700 disabled:cursor-wait disabled:opacity-60">{loading ? "Entrando…" : "Entrar en Wellyo"}</button></form>;
}
