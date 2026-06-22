"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Inbox, Package, ShoppingBag } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/actions/notifications.actions";

interface Notification {
  id: number;
  type: string;
  message: string;
  is_read: boolean;
  time?: string;
  time_ago?: string;
  created_at?: string;
}

const POLL_INTERVAL_MS = 30_000;

const iconFor = (type: string) => {
  if (type === "order") return ShoppingBag;
  if (type === "product") return Package;
  return Inbox;
};

const relTime = (notification: Notification): string => {
  return (
    notification.time_ago ||
    notification.time ||
    (notification.created_at
      ? new Date(notification.created_at).toLocaleString()
      : "")
  );
};

const routeFor = (type: string): string => {
  if (type === "order") return "/orders";
  if (type === "product") return "/marketplace";
  return "/";
};

const NotificationBell = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[] | null>(null);
  const [unread, setUnread] = useState(0);

  const refreshCount = useCallback(async () => {
    try {
      const n = await getUnreadCount();
      setUnread(n);
    } catch {
      // silent
    }
  }, []);

  // Poll unread count every 30s while authenticated
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem("buzzToken")) return;
    refreshCount();
    const id = setInterval(refreshCount, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [refreshCount]);

  // Load full list when the popover opens
  useEffect(() => {
    if (!open) return;
    let alive = true;
    setItems(null);
    getNotifications()
      .then((r) => {
        if (!alive) return;
        const list: Notification[] = r.data?.notifications ?? r.data ?? [];
        setItems(list);
      })
      .catch(() => {
        if (alive) setItems([]);
      });
    return () => {
      alive = false;
    };
  }, [open]);

  const handleClick = async (n: Notification) => {
    setOpen(false);
    if (!n.is_read) {
      try {
        await markNotificationRead(n.id);
        setUnread((u) => Math.max(0, u - 1));
      } catch {
        // silent — navigation still happens
      }
    }
    router.push(routeFor(n.type));
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setUnread(0);
      setItems((prev) => (prev ?? []).map((n) => ({ ...n, is_read: true })));
    } catch {
      // silent
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ""}`}
          className="relative h-9 w-9 rounded-md flex items-center justify-center text-ink-200 hover:bg-white/10 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-400 focus-visible:ring-offset-2 focus-visible:ring-offset-forest-900"
        >
          <Bell className="size-5" />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-forest-400 ring-2 ring-forest-900" />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" side="right" sideOffset={8} className="w-80 p-0">
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border">
          <div className="text-[14px] font-semibold text-foreground">
            Notifications
          </div>
          {(items?.some((n) => !n.is_read) || unread > 0) && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-[12px] font-semibold text-forest-700 hover:text-forest-500"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="max-h-[360px] overflow-y-auto">
          {items === null && (
            <div className="flex flex-col gap-2 p-3">
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
            </div>
          )}

          {items && items.length === 0 && (
            <div className="px-4 py-2">
              <EmptyState
                icon={<Inbox />}
                title="No notifications"
                description="New orders and product updates will appear here."
              />
            </div>
          )}

          {items && items.length > 0 && (
            <ul className="flex flex-col divide-y divide-border">
              {items.map((n) => {
                const Icon = iconFor(n.type);
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => handleClick(n)}
                      className={cn(
                        "w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-ink-50 transition-colors",
                        !n.is_read && "bg-forest-50/40",
                      )}
                    >
                      <div className="size-8 rounded-md bg-forest-50 text-forest-700 flex items-center justify-center shrink-0">
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div
                          className={cn(
                            "text-[13px] leading-[18px] text-foreground",
                            !n.is_read && "font-semibold",
                          )}
                        >
                          {n.message}
                        </div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">
                          {relTime(n)}
                        </div>
                      </div>
                      {!n.is_read && (
                        <span className="size-2 rounded-full bg-forest-500 shrink-0 mt-1.5" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
