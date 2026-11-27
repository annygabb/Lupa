"use client";

import { ViewTransition, type ReactNode } from "react";

/** Transição entre rotas com máscara que sobe (View Transitions do React/Next). */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="at-page-enter" exit="at-page-exit" default="none">
      {children}
    </ViewTransition>
  );
}
