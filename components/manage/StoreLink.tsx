"use client";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import SharePanel from "@/components/share/SharePanel";
import EditSlugModal from "@/components/slug/EditSlugModal";
import { getStoreShareStats } from "@/actions/share-links.actions";
import { getMyStoreLink } from "@/actions/slug.actions";
import { toast } from "sonner";
import { errorMessage } from "@/lib/errors";
import type { ShareStats, MyStoreLinkResponse } from "@/types/api";

/**
 * StoreLink — "Store Link" tab on the manage page.
 *
 * Loads two things in parallel on mount (and after a successful slug update):
 *  1. The store-level ShareStats (clicks / leads / orders / recent activity)
 *  2. The merchant's current slug + business name + retired aliases
 *
 * Race-safe: each async effect uses a `cancelled` guard so a quick
 * tab-switch or remount doesn't write stale data into state.
 */
export default function StoreLink() {
  const [storeStats, setStoreStats] = useState<ShareStats | null>(null);
  const [storeMeta, setStoreMeta] = useState<MyStoreLinkResponse | null>(null);
  const [editing, setEditing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getStoreShareStats(), getMyStoreLink()])
      .then(([stats, meta]) => {
        if (cancelled) return;
        setStoreStats(stats);
        setStoreMeta(meta);
      })
      .catch((e) => {
        if (!cancelled) {
          toast.error(errorMessage(e, "Could not load store link."));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-bold uppercase text-sm text-ink-500">
            Your Store Link
          </h2>
          <code className="text-sm break-all">
            buzzmart.app/store/{storeMeta?.store_slug ?? "…"}
          </code>
        </div>
        <Button
          variant="outline"
          onClick={() => setEditing(true)}
          disabled={!storeMeta}
        >
          Edit slug
        </Button>
      </div>

      <SharePanel
        stats={storeStats}
        shareTitle={storeMeta?.business_name ?? "My store"}
        messageTemplate="Visit my store:"
      />

      {storeMeta && (
        <EditSlugModal
          open={editing}
          onClose={() => setEditing(false)}
          currentSlug={storeMeta.store_slug}
          aliases={storeMeta.aliases}
          onUpdated={refresh}
        />
      )}
    </div>
  );
}
