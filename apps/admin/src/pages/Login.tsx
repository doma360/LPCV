import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifiant, setIdentifiant] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErreur(null);
    setLoading(true);
    try {
      await login(identifiant, motDePasse);
      navigate("/", { replace: true });
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Connexion impossible");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-cream-100 px-6">
      <div className="w-full max-w-sm rounded-2xl border border-ink-100 bg-white p-8 shadow-lifted">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-400 font-display text-base font-bold text-brand-900">
            L
          </span>
          <span className="font-display text-lg font-semibold text-ink-900">LPCV Admin</span>
        </div>
        <h1 className="mt-6 text-xl font-semibold text-ink-900">Connexion</h1>
        <p className="mt-1 text-sm text-ink-500">Réservé à l'équipe interne LPCV.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-ink-700" htmlFor="identifiant">
              Email
            </label>
            <input
              id="identifiant"
              type="text"
              required
              value={identifiant}
              onChange={(e) => setIdentifiant(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-brand-600"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700" htmlFor="motDePasse">
              Mot de passe
            </label>
            <input
              id="motDePasse"
              type="password"
              required
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-brand-600"
            />
          </div>

          {erreur && <p className="text-sm text-danger-500">{erreur}</p>}

          <Button type="submit" disabled={loading} className="w-full justify-center">
            {loading ? "Connexion..." : "Se connecter"}
          </Button>
        </form>
      </div>
    </div>
  );
}
