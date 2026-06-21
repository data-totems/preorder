"use client";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import ShareButton from "./ShareButton";
import type { ShareStats } from "@/types/api";
import { cn } from "@/lib/utils";

interface SharePanelProps {
  stats: ShareStats | null;
  messageTemplate: string; // pre-built outside; we just stitch + share
  shareTitle: string;
  title?: string;
  recentLabel?: string;
  recentLimit?: number;
  className?: string;
}

export default function SharePanel({
  stats,
  messageTemplate,
  shareTitle,
  title = "Share link",
  recentLabel = "Recent clicks",
  recentLimit = 20,
  className,
}: SharePanelProps) {
  const copyUrl = async () => {
    if (!stats) return;
    try {
      await navigator.clipboard.writeText(stats.full_url);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  if (!stats) {
    return (
      <div
        className={cn(
          "bg-white rounded-2xl p-5 shadow-sm border border-gray-100",
          className
        )}
      >
        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">
          {title}
        </h2>
        <p className="text-sm text-gray-400 mt-3">Loading…</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-5 shadow-sm border border-gray-100",
        className
      )}
    >
      <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">
        {title}
      </h2>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <code className="flex-1 min-w-0 break-all px-3 py-2 bg-gray-50 rounded-md text-sm">
          {stats.full_url}
        </code>
        <Button variant="ghost" onClick={copyUrl}>
          <Copy className="w-4 h-4 mr-1" /> Copy
        </Button>
        <ShareButton
          title={shareTitle}
          text={messageTemplate}
          url={stats.full_url}
        />
      </div>

      <div className="mt-4 text-sm text-gray-700">
        <strong>{stats.total_clicks}</strong> clicks ·{" "}
        <strong>{stats.unique_leads}</strong> unique leads ·{" "}
        <strong>{stats.total_orders}</strong> orders
      </div>

      <h3 className="mt-5 text-xs font-semibold uppercase text-gray-400">
        {recentLabel}
      </h3>
      {stats.recent_clicks.length === 0 ? (
        <p className="mt-2 text-sm text-gray-500">No clicks yet.</p>
      ) : (
        <ul className="mt-2 space-y-1.5 text-sm">
          {stats.recent_clicks.slice(0, recentLimit).map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-center gap-2 text-gray-600"
            >
              <span className="text-gray-400">·</span>
              <span>{new Date(c.occurred_at).toLocaleString()}</span>
              <span className="text-gray-400">—</span>
              <span>
                {c.lead?.name || "Unknown"} (
                {c.lead?.wa_number || "anonymous"})
              </span>
              <span className="text-xs text-gray-400">{c.event_type}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
