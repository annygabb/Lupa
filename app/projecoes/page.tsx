import type { Metadata } from "next";
import { ScenarioDashboard } from "@/components/scenarios/scenario-dashboard";
import { CountryOutlook } from "@/components/insights/country-outlook";
import { PagePlate } from "@/components/atlas/page-plate";
export const metadata: Metadata = {title:"Brasil × EUA: evidências e cenários até 2041",description:"Compare evidências de uso, saúde mental e massa magra. Horizontes 2026/2031/2036/2041 com lacunas explícitas e laboratório de cenários hipotéticos."};
export default function ProjecoesPage(){return <><PagePlate href="/projecoes"/><div className="lupa-editorial mental-page"><CountryOutlook/></div><ScenarioDashboard embedded/></>;}
