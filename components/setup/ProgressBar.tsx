"use client";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  current: 1 | 2 | 3;
}

const steps = [
  { id: 1, name: "Personal" },
  { id: 2, name: "Business" },
  { id: 3, name: "Bank" },
];

const ProgressBar = ({ current }: ProgressBarProps) => {
  return (
    <div className="w-full bg-paper border-b border-border py-6 px-6">
      <div className="max-w-2xl mx-auto">
        <ol role="list" aria-label="Setup progress" className="flex items-center justify-between relative">
          <div className="absolute left-[12px] right-[12px] top-[10px] h-[2px] bg-ink-200" />
          {steps.map((step) => {
            const state = step.id < current ? "past" : step.id === current ? "current" : "future";
            return (
              <li
                key={step.id}
                aria-current={state === "current" ? "step" : undefined}
                className="flex flex-col items-center gap-2 relative z-10 bg-paper px-2"
              >
                <div
                  className={cn(
                    "h-5 w-5 rounded-full flex items-center justify-center transition-colors duration-150",
                    state === "past" && "bg-forest-400",
                    state === "current" && "bg-forest-700 ring-4 ring-forest-100",
                    state === "future" && "bg-paper border-2 border-ink-200"
                  )}
                >
                  {state === "past" && (
                    <svg viewBox="0 0 20 20" className="size-3 text-white" fill="currentColor">
                      <path d="M7.629 14.566L3.428 10.365l1.414-1.415 2.787 2.787 7.529-7.529 1.414 1.414z" />
                    </svg>
                  )}
                </div>
                <span
                  className={cn(
                    "text-[12px] font-semibold tracking-[0.02em]",
                    state === "current" ? "text-forest-700" : "text-ink-500"
                  )}
                >
                  {step.name}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
};

export default ProgressBar;
