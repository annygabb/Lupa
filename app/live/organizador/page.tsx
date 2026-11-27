import type {Metadata} from "next";
import {LiveOrganizer} from "@/components/live/organizer";
import "../../experiencias.css";
export const metadata:Metadata={title:"Organização do LUPA Live",robots:{index:false,follow:false}};
export default function Page(){return <LiveOrganizer/>;}
