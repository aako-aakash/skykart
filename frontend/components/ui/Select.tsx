import { cn } from "@/utils";
import { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export default function Select({ label, error, options, className, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-[rgba(240,239,248,0.6)] uppercase tracking-wide">{label}</label>
      )}
      <select
        className={cn(
          "w-full bg-[#111118] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2.5 text-sm",
          "text-[#f0eff8] outline-none focus:border-[#6C63FF] transition-colors",
          error && "border-red-500/50",
          className
        )}
        {...props}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
