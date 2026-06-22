"use client";
import { useEffect, useState } from "react";
import { getLeads } from "@/actions/share-links.actions";
import { Badge } from "@/components/ui/badge";

const LeadsNavBadge = () => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const since = localStorage.getItem("lastSeenLeadsAt") ?? undefined;
    getLeads({ since }).then((data) => setCount(data.count ?? 0)).catch(() => {});
  }, []);
  if (count === 0) return null;
  return (
    <Badge
      variant="accent"
      role="status"
      aria-label={`${count} new lead${count === 1 ? "" : "s"}`}
      className="ml-auto"
    >
      {count > 99 ? "99+" : count}
    </Badge>
  );
};

export default LeadsNavBadge;
