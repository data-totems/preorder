"use client";
import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getLeads, getStoreShareStats } from "@/actions/share-links.actions";
import LeadRow from "@/components/leads/LeadRow";
import LeadActivityDrawer from "@/components/leads/LeadActivityDrawer";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
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
    <div className="max-w-7xl mx-auto">
      <PageHeader
        eyebrow="LEADS"
        title="Your leads"
        description={`${count} lead${count === 1 ? "" : "s"} · sorted by most recent`}
        actions={
          <Input
            aria-label="Search leads by phone number"
            className="max-w-xs"
            placeholder="Search 080…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        }
      />

      <section className="px-6 md:px-10 pb-12">
        {leads.length === 0 ? (
          <EmptyState
            icon={<Users />}
            title="No leads yet"
            description="Share your store or product links on WhatsApp to start collecting leads."
            action={<Button onClick={copyStoreLink}>Copy store link</Button>}
          />
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {leads.map((l) => (
                <LeadRow
                  key={l.id}
                  lead={l}
                  onViewActivity={setActivityLeadId}
                />
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
              <span className="text-sm text-muted-foreground">Page {page}</span>
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
      </section>

      <LeadActivityDrawer
        leadId={activityLeadId}
        onClose={() => setActivityLeadId(null)}
      />
    </div>
  );
}
