import type { Metadata } from "next";
import { InstitutionalLogin } from "@/components/live/institutional-login";
import "../experiencias.css";
export const metadata: Metadata = { title: "Login institucional | LUPA Saúde",
  robots: { index: false, follow: false }};
export default function Page() { return <InstitutionalLogin/>; }
