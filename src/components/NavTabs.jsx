const TABS = [
  { id: "now", label: "Latest" },
  { id: "upcoming", label: "Coming Soon" },
  { id: "top", label: "Top Rated" },
  { id: "popular", label: "Popular" },
];

export default function NavTabs({ tab, setTab }) {
  return (
    <div className="flex items-center gap-4 border-b border-white/10">
      {TABS.map(t => (
        <button
          key={t.id}
          onClick={() => setTab(t.id)}
          className={`relative py-2 text-sm ${tab===t.id ? "text-white" : "text-slate-400 hover:text-slate-200"}`}
        >
          {t.label}
          {tab===t.id && <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-gradient-to-r from-fuchsia-400 to-pink-500 rounded-full" />}
        </button>
      ))}
    </div>
  );
}
