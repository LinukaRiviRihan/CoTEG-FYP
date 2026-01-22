export default function MetricRow({
  label,
  value,
  highlight = false,
  isLoss = false,
}) {
  if (typeof value !== 'number') return null;

  const formatted = isLoss ? value.toFixed(4) : `${(value * 100).toFixed(1)}%`;

  return (
    <div className="flex justify-end gap-3 text-sm">
      <span className="text-gray-500 text-xs uppercase tracking-wide pt-0.5">
        {label}
      </span>
      <span
        className={`font-mono font-bold ${highlight && !isLoss ? 'text-emerald-600' : 'text-gray-900'}`}>
        {formatted}
      </span>
    </div>
  );
}
