"use client";

import type { Dict } from "@/lib/i18n";
import { fmtTime, hours } from "@/lib/site";
import { openState, useLisbonNow } from "./useLisbonNow";

export function OpenStatus({ t, className }: { t: Dict; className?: string }) {
  const now = useLisbonNow();
  if (!now) return <span className={`status ${className ?? ""}`} aria-hidden="true">&nbsp;</span>;

  const s = openState(now.day, now.minutes);
  const s_ = t.status;
  let label: string;
  let tone: "open" | "pause" | "closed";

  if (s.kind === "open") {
    tone = "open";
    label = `${s_.open} · ${s_.closesAt} ${fmtTime(s.until)}`;
  } else if (s.kind === "lunch") {
    tone = "pause";
    label = `${s_.lunch} · ${s_.reopensAt} ${fmtTime(s.reopens)}`;
  } else {
    tone = "closed";
    const when =
      s.when === "today" ? s_.today : s.when === "tomorrow" ? s_.tomorrow : `${t.days[s.day].toLowerCase()} ${s_.on}`;
    label = `${s_.closed} · ${s_.opensAt} ${when} ${fmtTime(s.at)}`;
  }

  return (
    <span className={`status status--${tone} ${className ?? ""}`} role="status">
      <span className="status__dot" aria-hidden="true" />
      {label}
    </span>
  );
}

const order = [1, 2, 3, 4, 5, 6, 0]; // Monday first

export function HoursTable({ t }: { t: Dict }) {
  const now = useLisbonNow();
  return (
    <table className="hours">
      <tbody>
        {order.map((d) => {
          const ranges = hours[d];
          const isToday = now?.day === d;
          return (
            <tr key={d} className={isToday ? "is-today" : undefined} aria-current={isToday ? "date" : undefined}>
              <th scope="row">{t.days[d]}</th>
              <td>
                {ranges.length ? (
                  ranges.map(([s, e]) => `${fmtTime(s)}–${fmtTime(e)}`).join(" · ")
                ) : (
                  <span className="hours__closed">{t.contact.closed}</span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
