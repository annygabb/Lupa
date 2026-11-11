import {describe,expect,it} from "vitest";
import {liveOptions,liveQuestion} from "@/lib/live/content";
describe("LUPA Live: curadoria de questões",()=>{
 it("só admite perguntas existentes com três respostas",()=>{
  expect(liveOptions.length).toBeGreaterThan(0);
  for(const q of liveOptions){
   const v=liveQuestion(q.id);
   expect(v?.choices).toHaveLength(3);
   expect(v?.correctIndex).toBe(1);
   expect(v?.question.length).toBeGreaterThan(10);
  }
 });
 it("rejeita identificadores arbitrários",()=>{
  expect(liveQuestion("id-inventado")).toBeNull();
  expect(liveQuestion("<script>alert(1)</script>")).toBeNull();
 });
});
