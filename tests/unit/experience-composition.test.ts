import {describe,expect,it} from "vitest";
import {calculateComposition} from "@/features/experience/composition";
describe("partição educacional de massa gorda/magra",()=>{
 it("25% é fração do peso perdido, não do peso corporal",()=>{
  const x=calculateComposition({initialWeightKg:85,weightLossKg:10,leanShareOfLossPct:25});
  expect(x).toMatchObject({weightAfterKg:75,fatLossKg:7.5,leanLossKg:2.5,context:"hypothetical_illustration"});
 });
 it("não permite perder mais que todo o peso",()=>{
  expect(()=>calculateComposition({initialWeightKg:85,weightLossKg:85,leanShareOfLossPct:25})).toThrow();
 });
 it("rejeita NaN, frações negativas ou acima de 100%",()=>{
  for(const fraction of [NaN,-1,101]){
   expect(()=>calculateComposition({initialWeightKg:85,weightLossKg:10,leanShareOfLossPct:fraction})).toThrow();
  }
 });
});
