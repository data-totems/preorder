"use client";
import { useEffect, useState } from "react";
import { Copy, Users } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getLeads, getStoreShareStats } from "@/actions/share-links.actions";
import LeadRow from "@/components/leads/LeadRow";
import LeadActivityDrawer from "@/components/leads/LeadActivityDrawer";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { errorMessage } from "@/lib/errors";
import type { LeadListItem } from "@/types/api";

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadListItem[] | null>(null);
  const [count, setCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activityLeadId, setActivityLeadId] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("lastSeenLeadsAt", new Date().toISOString());
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLeads(null);
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
          if (cancelled) return;
          toast.error(errorMessage(e, "Could not load leads."));
          setLeads([]);
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
          <div className="flex items-center gap-2">
            <Input
              aria-label="Search leads by phone number"
              className="w-[200px] md:w-[240px]"
              placeholder="Search 080…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <Button variant="outline" onClick={copyStoreLink}>
              <Copy className="size-4" /> Copy link
            </Button>
          </div>
        }
      />

      <section className="px-6 md:px-10 pb-12">
        {leads === null ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : leads.length === 0 ? (
          <EmptyState
            icon={<Users />}
            title={search ? "No leads match that search" : "No leads yet"}
            description={
              search
                ? "Try a different number, or clear the search to see all leads."
                : "Share your store or product links on WhatsApp to start collecting leads."
            }
            action={
              search ? (
                <Button variant="outline" onClick={() => setSearch("")}>
                  Clear search
                </Button>
              ) : (
                <Button onClick={copyStoreLink}>
                  <Copy className="size-4" /> Copy store link
                </Button>
              )
            }
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

            {(hasPrev || hasNext) && (
              <div className="flex items-center justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasPrev}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-[13px] text-muted-foreground tabular-nums">
                  Page {page}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasNext}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
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
