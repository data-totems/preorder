"use client";

import { useEffect, useState } from "react";
import { getLeads } from "@/actions/share-links.actions";

// Renders a small badge with the count of leads since the user's
// last visit to /leads. Best-effort: fetches once on mount; errors swallowed.
const LeadsNavBadge = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const since = localStorage.getItem("lastSeenLeadsAt") || undefined;
    getLeads(since ? { since } : {})
      .then((data) => setCount(data.count ?? 0))
      .catch(() => {
        // Silent — badge is non-critical.
      });
  }, []);

  if (count === 0) return null;

  return (
    <span
      role="status"
      aria-label={`${count} new lead${count === 1 ? "" : "s"}`}
      className="ml-auto bg-red-500 text-white text-xs font-semibold rounded-full px-2 py-0.5 min-w-[20px] text-center"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
};

export default LeadsNavBadge;
