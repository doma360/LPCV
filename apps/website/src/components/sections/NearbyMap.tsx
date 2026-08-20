import { MapPin } from "lucide-react";
import { professionals } from "@/data/professionals";

interface NearbyMapProps {
  selectedId: string | null;
}

const positions = [
  { top: "38%", left: "52%" },
  { top: "62%", left: "68%" },
  { top: "24%", left: "70%" },
  { top: "70%", left: "30%" },
  { top: "48%", left: "20%" },
  { top: "18%", left: "38%" },
];

export default function NearbyMap({ selectedId }: NearbyMapProps) {
  return (
    <div className="relative h-full min-h-[320px] overflow-hidden rounded-2xl border border-ink-100 bg-cream-200">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(#d2d6dd 1px, transparent 1px), linear-gradient(90deg, #d2d6dd 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
        aria-hidden="true"
      />
      <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-brand-700 shadow-soft" />
      {professionals.map((pro, index) => {
        const active = pro.id === selectedId;
        const pos = positions[index % positions.length];
        return (
          <div
            key={pro.id}
            className="absolute -translate-x-1/2 -translate-y-full"
            style={{ top: pos.top, left: pos.left }}
          >
            <div
              className={`flex h-8 w-8 rotate-45 items-center justify-center rounded-full rounded-bl-none border-2 border-white shadow-soft transition-colors ${
                active ? "bg-accent-500" : "bg-brand-700"
              }`}
            >
              <MapPin className="h-3.5 w-3.5 -rotate-45 text-white" aria-hidden="true" />
            </div>
          </div>
        );
      })}
      <p className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium text-ink-500 shadow-soft">
        Carte illustrative
      </p>
    </div>
  );
}
