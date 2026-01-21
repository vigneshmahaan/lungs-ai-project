export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 shadow-sm" />
      <div className="leading-tight">
        <div className="text-sm font-semibold text-slate-900">Respiratory AI</div>
        <div className="text-xs text-slate-500">Lung Sound Analysis</div>
      </div>
    </div>
  );
}

