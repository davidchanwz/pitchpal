'use client';

import { useEffect, useState } from "react";

export enum Breakpoints {
  Mobile = 576,
  Tablet = 768,
  NotebookMonitor = 992,
  DesktopMonitor = 1200,
}

type Direction = "up" | "down";

function getInitialMatches(breakpoint: Breakpoints, direction: Direction) {
  const screenSize = window.innerWidth;
  if (direction === "up") {
    return screenSize >= breakpoint;
  } else {
    return screenSize <= breakpoint;
  }
}

export function useBreakpoint(
  breakpoint: Breakpoints,
  direction: Direction = "down",
) {
  const [matches, setMatches] = useState(
    getInitialMatches(breakpoint, direction),
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      direction === "up"
        ? `(min-width: ${breakpoint}px)`
        : `(max-width: ${breakpoint}px)`,
    );
    const handleBreakpointChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    mediaQuery.addEventListener("change", handleBreakpointChange);

    return () =>
      mediaQuery.removeEventListener("change", handleBreakpointChange);
  }, [breakpoint, direction]);

  return matches;
}
