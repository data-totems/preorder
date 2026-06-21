"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getLeads, getStoreShareStats } from "@/actions/share-links.actions";
import LeadRow from "@/components/leads/LeadRow";
import LeadActivityDrawer from "@/components/leads/LeadActivityDrawer";
import { toast } from "sonner";
import { errorMessage } from "@/lib/errors";
import type { LeadListItem } from "@/types/api";

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadListItem[]>([]);
  const [count, setCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activityLeadId, setActivityLeadId] = useState<number | null>(null);

  // Record visit for sidebar badge (Task 18). Guard for SSR even though
  // this is a client component — defensive in case of any pre-hydration path.
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("lastSeenLeadsAt", new Date().toISOString());
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      getLeads({ search: search || undefined, page })
        .then((data) => {
          if (cancelled) return;
          setLeads(data.results);
          setCount(data.count);
          setHasNext(Boolean(data.next));
          setHasPrev(Boolean(data.previous));
        })
        .catch((e) => {
          if (!cancelled) toast.error(errorMessage(e, "Could not load leads."));
        });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [search, page]);

  const copyStoreLink = async () => {
    try {
      const stats = await getStoreShareStats();
      await navigator.clipboard.writeText(stats.full_url);
      toast.success("Store link copied");
    } catch (e) {
      toast.error(errorMessage(e, "Could not copy store link."));
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">LEADS</h1>
        <Input
          aria-label="Search leads by phone number"
          className="max-w-xs bg-gray-50 rounded-[12px]"
          placeholder="Search 080…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <p className="text-sm text-gray-500 mb-4">
        {count} leads · sorted by most recent
      </p>

      {leads.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">
            No leads yet. Share your store or product links on WhatsApp to start collecting leads.
          </p>
          <Button
            className="mt-4 bg-[#27BA5F] hover:bg-[#1FA34E]"
            onClick={copyStoreLink}
          >
            Copy store link
          </Button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl p-2 shadow-sm">
            {leads.map((l) => (
              <LeadRow key={l.id} lead={l} onViewActivity={setActivityLeadId} />
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={!hasPrev}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-500">Page {page}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasNext}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}

      <LeadActivityDrawer
        leadId={activityLeadId}
        onClose={() => setActivityLeadId(null)}
      />
    </div>
  );
}
