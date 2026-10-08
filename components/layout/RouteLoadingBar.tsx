"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/** A thin, non-blocking animated bar pinned to the very top of the
 * viewport -- above the sidebar and the page header both, the first thing
 * rendered, not nested inside the content column -- shown briefly on
 * every page load/navigation. Purely a visual "something is loading" cue
 * (an indeterminate sweep, like a classic NProgress bar): every page here
 * is a client component that fetches its own data after mount, so there's
 * no single shared "percent loaded" to track. `pointer-events-none` keeps
 * it non-blocking even though `fixed` would otherwise sit above
 * everything in the click-hit-test order. */
export function RouteLoadingBar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Restarts the sweep on every pathname change (it may already be
    // false from the previous navigation's timeout) -- genuinely
    // synchronizing with an external signal (the router's pathname), not
    // state this component could derive during render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(true);
    const timeout = setTimeout(() => setVisible(false), 700);
    return () => clearTimeout(timeout);
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-brand-orange/15" aria-hidden="true">
      <div className="h-full w-1/3 animate-[route-loading-sweep_700ms_ease-in-out] bg-brand-orange" />
    </div>
  );
}
