import { useState } from "react";
import { useLocation } from "wouter";
import { Lock, Mail, ArrowRight } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost/leaonorth/api/admin/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("admin_token", data.token);
        setLocation("/admin/dashboard");
      } else {
        setError(data.mensagem || "Erro ao fazer login.");
      }
    } catch (err) {
      setError("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-[#080808] border border-white/10 rounded-sm pl-10 pr-4 py-3 text-white text-sm font-['DM_Sans'] placeholder-white/30 focus:outline-none focus:border-[#F0B429]/50 focus:ring-1 focus:ring-[#F0B429]/30 transition-all duration-200";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4 font-['DM_Sans']">
      <div className="w-full max-w-md bg-[#111111] border border-white/10 rounded-sm p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="font-['Barlow_Condensed'] font-700 text-3xl text-white uppercase tracking-wide">
            Leão North <span className="text-[#F0B429]">Admin</span>
          </h1>
          <p className="text-white/40 text-sm mt-2">Área restrita para gerenciamento</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-sm mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 w-4 h-4 text-white/40" />
            <input
              type="email"
              placeholder="E-mail"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 w-4 h-4 text-white/40" />
            <input
              type="password"
              placeholder="Senha"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#F0B429] text-[#080808] font-['Barlow_Condensed'] font-700 text-base uppercase tracking-wider rounded-sm hover:bg-[#FFD060] transition-colors disabled:opacity-50"
          >
            {loading ? "Acessando..." : "Entrar no Painel"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}