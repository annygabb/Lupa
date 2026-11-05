import type { Metadata } from "next";
import { ModulePreview } from "@/components/module-preview";
export const metadata: Metadata={title:"Evidências"};
export default function Evidencias(){return <ModulePreview eyebrow="Pesquisa científica" title="Explorar evidências" description="Catálogo de artigos revisados, com origem rastreável e comparação cuidadosa de amostras e desfechos." objectives={["Busca por medicamento, desfecho e tipo de estudo.","Ficha com DOI ou PMID, duração, amostra e fontes oficiais.","Sem ingestão automática ou percentuais gerados por IA."]}/>;}
