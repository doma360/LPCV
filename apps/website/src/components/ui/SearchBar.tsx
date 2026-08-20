import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin } from "lucide-react";
import { services } from "@/data/services";

interface SearchBarProps {
  className?: string;
}

export default function SearchBar({ className = "" }: SearchBarProps) {
  const navigate = useNavigate();
  const [metier, setMetier] = useState("");
  const [lieu, setLieu] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (metier) params.set("metier", metier);
    if (lieu) params.set("lieu", lieu);
    navigate(`/recherche?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col gap-3 rounded-2xl border border-ink-100 bg-white p-3 shadow-lifted sm:flex-row sm:items-center ${className}`}
    >
      <label className="flex flex-1 items-center gap-3 rounded-xl px-3 py-2.5 sm:border-r sm:border-ink-100">
        <Search className="h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
        <select
          value={metier}
          onChange={(event) => setMetier(event.target.value)}
          className="w-full bg-transparent text-sm font-medium text-ink-900 outline-none"
        >
          <option value="">Quel métier cherchez-vous ?</option>
          {services.map((service) => (
            <option key={service.slug} value={service.slug}>
              {service.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-1 items-center gap-3 rounded-xl px-3 py-2.5">
        <MapPin className="h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
        <input
          type="text"
          value={lieu}
          onChange={(event) => setLieu(event.target.value)}
          placeholder="Quartier, Abidjan"
          className="w-full bg-transparent text-sm font-medium text-ink-900 placeholder:text-ink-400 outline-none"
        />
      </label>
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-400 px-6 py-3 text-sm font-semibold text-brand-900 transition-all duration-200 hover:scale-[1.03] hover:bg-accent-300 active:scale-95"
      >
        Rechercher
      </button>
    </form>
  );
}
