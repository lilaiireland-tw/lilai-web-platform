"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { initialize } from "./native-interactions";

export function Interactions({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (root.current) return initialize(root.current);
  }, []);
  return <div className="ireland25" ref={root}>{children}</div>;
}
