// ── Input ─────────────────────────────────────────────────────────────────────
"use client";
import { cn } from "@/utils";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-[rgba(240,239,248,0.6)] uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(240,239,248,0.4)]">
            {icon}
          </span>
        )}
        <input
          className={cn(
            "w-full bg-[#111118] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2.5 text-sm",
            "text-[#f0eff8] placeholder:text-[rgba(240,239,248,0.3)]",
            "focus:outline-none focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF]/30",
            "transition-colors duration-200",
            icon && "pl-9",
            error && "border-red-500/50 focus:border-red-500",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-[rgba(240,239,248,0.6)] uppercase tracking-wide">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          "w-full bg-[#111118] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2.5 text-sm",
          "text-[#f0eff8] placeholder:text-[rgba(240,239,248,0.3)]",
          "focus:outline-none focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF]/30",
          "transition-colors duration-200 resize-none",
          error && "border-red-500/50",
          className
        )}
        rows={4}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
