import {describe,expect,it} from "vitest";
import {validLiveInvalidation} from "@/lib/live/realtime-client";

describe("LUPA Live Broadcast: only sanitized invalidations are acted upon",()=>{
 const code="A1B2C3D4E5F6",topic="realtime:live:A1B2C3D4E5F6";
 it("accepts an invalidation only on the joined topic for the exact event",()=>{
  expect(validLiveInvalidation({
   event:"broadcast",topic,payload:{event:"invalidate",
    payload:{code,kind:"snapshot_updated"}},
  },code)).toBe(true);
 });
 it("rejects wrong event, topic, payload, or unaudited content",()=>{
  for(const value of [
   null,{},{event:"broadcast",topic:"realtime:live:000000000000",
     payload:{event:"invalidate",payload:{code,kind:"snapshot_updated"}}},
   {event:"broadcast",topic,payload:{event:"fake",payload:{code,kind:"snapshot_updated"}}},
   {event:"broadcast",topic,payload:{event:"invalidate",payload:{code,kind:"vote_details"}}},
   {event:"system",topic,payload:{event:"invalidate",payload:{code,kind:"snapshot_updated"}}},
  ])expect(validLiveInvalidation(value,code)).toBe(false);
 });
});
