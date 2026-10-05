"use client";

import { useEffect, useState } from "react";
import { hours } from "@/lib/site";

const dayIndex: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function lisbonNow() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Lisbon",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";
  return { day: dayIndex[get("weekday")], minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

/** Current day/time in Lisbon. Null until mounted, so server and client markup match. */
export function useLisbonNow() {
  const [now, setNow] = useState<{ day: number; minutes: number } | null>(null);
  useEffect(() => {
    setNow(lisbonNow());
    const id = setInterval(() => setNow(lisbonNow()), 60_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export type OpenState =
  | { kind: "open"; until: number }
  | { kind: "lunch"; reopens: number }
  | { kind: "closed"; day: number; at: number; when: "today" | "tomorrow" | "later" };

export function openState(day: number, minutes: number): OpenState {
  const today = hours[day];
  const current = today.find(([s, e]) => minutes >= s && minutes < e);
  if (current) return { kind: "open", until: current[1] };

  const next = today.find(([s]) => s > minutes);
  if (next) {
    const hadEarlier = today.some(([, e]) => e <= minutes);
    return hadEarlier ? { kind: "lunch", reopens: next[0] } : { kind: "closed", day, at: next[0], when: "today" };
  }

  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    if (hours[d].length) return { kind: "closed", day: d, at: hours[d][0][0], when: i === 1 ? "tomorrow" : "later" };
  }
  return { kind: "closed", day, at: 0, when: "later" };
}
