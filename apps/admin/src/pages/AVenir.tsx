export default function AVenir({ titre }: { titre: string }) {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900">{titre}</h1>
      <p className="mt-4 rounded-xl border border-dashed border-ink-200 px-5 py-8 text-center text-sm text-ink-400">
        Pas encore construit.
      </p>
    </div>
  );
}
