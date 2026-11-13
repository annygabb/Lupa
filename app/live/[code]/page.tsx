import type {Metadata} from "next";
import {LiveParticipant} from "@/components/live/participant";
import "../../experiencias.css";
export const metadata:Metadata={title:"Votação coletiva | LUPA Live",robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{code:string}>}) {
 const {code}=await params;
 return <LiveParticipant code={code.toUpperCase()}/>;
}
