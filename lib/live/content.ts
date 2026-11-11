import {getClaim} from "@/features/interpretation/claims";
/** Respostas pré-curadas, nunca geradas pela IA durante a votação. */
const questions={
 "massa-magra-nao-equivale-a-musculos":[
  "Sim, é exatamente a mesma coisa.",
  "Não. Massa magra não é sinônimo de músculo funcional.",
  "Sim, isso sempre comprova sarcopenia."
 ],
 "uti-mortalidade-nao-e-efeito-do-medicamento":[
  "Sim, os estudos provam causa e efeito.",
  "Não. Os estudos mediram populações e resultados diferentes.",
  "Sim, o odds ratio é a chance absoluta de uma pessoa morrer."
 ],
 "cenario-2036-nao-e-previsao-sus":[
  "Sim, é uma previsão oficial.",
  "Não. É uma simulação fictícia com premissas editáveis.",
  "Sim, reflete cobertura universal de medicamentos pelo SUS."
 ],
} as const;
export type LiveClaimId=keyof typeof questions;
export function liveQuestion(id:string){
 if(!Object.prototype.hasOwnProperty.call(questions,id))return null;
 const claim=getClaim(id);if(!claim)return null;
 return {claimId:id,title:claim.title,question:claim.question,choices:[...questions[id as LiveClaimId]],correctIndex:1};
}
export const liveOptions=Object.keys(questions).map(id=>({id,title:getClaim(id)?.title??id}));
