import { ArrowUpRight } from "lucide-react";

export function MetricCard({
  icon,
  label,
  value,
  delta,
  tone,
}: {
  icon: string;
  label: string;
  value: string;
  delta: string;
  tone: string;
}) {
  const Icon = icon;
  return (
    <div className="metric-card">
      <div className={`metric-icon ${tone}`}>
        <Icon />
      </div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <small className="trend">{delta}</small>
      </div>
      <ArrowUpRight className="trend-icon" />
    </div>
  );
}
