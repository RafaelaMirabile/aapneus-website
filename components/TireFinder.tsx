"use client";

import { useId, useState } from "react";
import { Camera } from "lucide-react";
import type { Dict } from "@/lib/i18n";
import { whatsappUrl } from "@/lib/site";
import { WhatsAppIcon } from "./BrandIcons";

type Vehicle = "car" | "moto" | "van";
type Field = "width" | "profile" | "rim";
type Condition = "new" | "used" | "any";

const range = (from: number, to: number, step: number) =>
  Array.from({ length: Math.floor((to - from) / step) + 1 }, (_, i) => from + i * step);

const options: Record<Vehicle, Record<Field, number[]>> = {
  car: { width: range(135, 335, 10), profile: range(25, 85, 5), rim: range(12, 24, 1) },
  van: { width: range(155, 315, 10), profile: range(45, 85, 5), rim: range(13, 22, 1) },
  moto: {
    width: [60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 240],
    profile: range(50, 100, 5),
    rim: range(10, 21, 1),
  },
};

const example = { width: "205", profile: "55", rim: "16" };

export function TireFinder({ t }: { t: Dict }) {
  const f = t.finder;
  const uid = useId();
  const [vehicle, setVehicle] = useState<Vehicle>("car");
  const [size, setSize] = useState<Record<Field, string>>({ width: "", profile: "", rim: "" });
  const [qty, setQty] = useState(4);
  const [condition, setCondition] = useState<Condition>("any");
  const [active, setActive] = useState<Field | null>(null);
  const [error, setError] = useState(false);

  const complete = size.width && size.profile && size.rim;
  const shown = {
    width: size.width || example.width,
    profile: size.profile || example.profile,
    rim: size.rim || example.rim,
  };
  const sizeText = `${shown.width}/${shown.profile} R${shown.rim}`;

  const changeVehicle = (v: Vehicle) => {
    setVehicle(v);
    setSize((s) => ({
      width: options[v].width.includes(Number(s.width)) ? s.width : "",
      profile: options[v].profile.includes(Number(s.profile)) ? s.profile : "",
      rim: options[v].rim.includes(Number(s.rim)) ? s.rim : "",
    }));
  };

  const message = [
    f.message.greeting,
    `• ${f.message.size}: ${sizeText}`,
    `• ${f.message.quantity}: ${qty}`,
    `• ${f.message.condition}: ${f.conditions[condition]}`,
    `• ${f.message.vehicle}: ${f.vehicles[vehicle]}`,
    f.message.thanks,
  ].join("\n");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complete) {
      setError(true);
      const first = (["width", "profile", "rim"] as Field[]).find((k) => !size[k]);
      if (first) document.getElementById(`${uid}-${first}`)?.focus();
      return;
    }
    setError(false);
    window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
  };

  const fieldProps = (k: Field) => ({
    id: `${uid}-${k}`,
    value: size[k],
    onFocus: () => setActive(k),
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSize((s) => ({ ...s, [k]: e.target.value }));
      setActive(k);
      setError(false);
    },
    "aria-invalid": error && !size[k] ? true : undefined,
    "aria-describedby": error ? `${uid}-error` : undefined,
  });

  const cls = (k: Field) => (active === k ? "is-active" : active ? "is-dim" : "");

  return (
    <div className="finder">
      <div className="finder__head">
        <p className="eyebrow eyebrow--red">{f.eyebrow}</p>
        <h2 id="finder-title" className="h2">{f.title}</h2>
        <p className="finder__lead">{f.lead}</p>
      </div>

      <figure className="diagram" aria-labelledby={`${uid}-cap`}>
        <div className="diagram__head">
          <span className="diagram__kicker">{f.yourSize}</span>
          <output className={`diagram__size ${complete ? "" : "is-example"}`} aria-live="polite">
            <span className={cls("width")}>{shown.width}</span>/<span className={cls("profile")}>{shown.profile}</span>{" "}
            <span className={cls("rim")}>R{shown.rim}</span>
          </output>
        </div>

        <svg viewBox="0 0 560 400" className="diagram__svg" aria-hidden="true">
          <defs>
            <radialGradient id={`${uid}-rim`} cx="40%" cy="35%" r="75%">
              <stop offset="0" stopColor="#e9ecef" />
              <stop offset=".6" stopColor="#9aa1a9" />
              <stop offset="1" stopColor="#5d636b" />
            </radialGradient>
            <path id={`${uid}-arc`} d="M 62 205 A 138 138 0 0 1 338 205" />
            <marker id={`${uid}-ah`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill="context-stroke" />
            </marker>
          </defs>

          {/* Side view */}
          <g className="tyre">
            <circle cx="200" cy="205" r="170" className="tyre__body" />
            <circle cx="200" cy="205" r="163" className="tyre__tread" />
            <circle cx="200" cy="205" r="110" className="tyre__bead" />
            <circle cx="200" cy="205" r="104" fill={`url(#${uid}-rim)`} />
            {[0, 72, 144, 216, 288].map((a) => (
              <path
                key={a}
                d="M 192 180 L 186 112 Q 200 104 214 112 L 208 180 Z"
                className="tyre__spoke"
                transform={`rotate(${a} 200 205)`}
              />
            ))}
            <circle cx="200" cy="205" r="28" className="tyre__hub" />
            <circle cx="200" cy="205" r="9" className="tyre__nut" />
          </g>

          {/* Sidewall marking */}
          <text className="sidewall">
            <textPath href={`#${uid}-arc`} startOffset="50%" textAnchor="middle">
              <tspan className={`sw sw--width ${cls("width")}`}>{shown.width}</tspan>
              <tspan className="sw sw--muted">/</tspan>
              <tspan className={`sw sw--profile ${cls("profile")}`}>{shown.profile}</tspan>
              <tspan className="sw sw--muted"> </tspan>
              <tspan className={`sw sw--rim ${cls("rim")}`}>R{shown.rim}</tspan>
              <tspan className="sw sw--muted"> 91V</tspan>
            </textPath>
          </text>

          {/* Profile: sidewall height */}
          <g className={`dim dim--profile ${cls("profile")}`}>
            <line x1="200" y1="317" x2="200" y2="373" markerStart={`url(#${uid}-ah)`} markerEnd={`url(#${uid}-ah)`} />
            <rect x="212" y="330" width="58" height="28" rx="6" className="dim__pill" />
            <text x="241" y="350" className="dim__label">{shown.profile}%</text>
          </g>

          {/* Rim diameter */}
          <g className={`dim dim--rim ${cls("rim")}`}>
            <line x1="92" y1="205" x2="308" y2="205" markerStart={`url(#${uid}-ah)`} markerEnd={`url(#${uid}-ah)`} />
            <rect x="166" y="244" width="68" height="28" rx="6" className="dim__pill" />
            <text x="200" y="264" className="dim__label">{shown.rim}″</text>
          </g>

          {/* Front view (tread) for width */}
          <g className="tyre">
            <rect x="420" y="62" width="104" height="313" rx="40" className="tyre__body" />
            {[446, 472, 498].map((x) => (
              <line key={x} x1={x} y1="80" x2={x} y2="357" className="tyre__groove" />
            ))}
            {range(0, 13, 1).map((i) => (
              <line key={i} x1="424" y1={92 + i * 21} x2="520" y2={84 + i * 21} className="tyre__sipe" />
            ))}
          </g>
          <g className={`dim dim--width ${cls("width")}`}>
            <line x1="420" y1="42" x2="524" y2="42" markerStart={`url(#${uid}-ah)`} markerEnd={`url(#${uid}-ah)`} />
            <line x1="420" y1="34" x2="420" y2="62" className="dim__ext" />
            <line x1="524" y1="34" x2="524" y2="62" className="dim__ext" />
            <rect x="436" y="6" width="72" height="26" rx="6" className="dim__pill" />
            <text x="472" y="25" className="dim__label">{shown.width} mm</text>
          </g>
        </svg>

        <figcaption id={`${uid}-cap`} className="diagram__help" aria-live="polite">
          <strong>{f.diagramTitle}.</strong> {active ? f.help[active] : f.help.none}
        </figcaption>
      </figure>

      <form className="finder__form" onSubmit={onSubmit} noValidate>

        <fieldset className="seg">
          <legend className="label">{f.vehicle}</legend>
          <div className="seg__row">
            {(Object.keys(f.vehicles) as Vehicle[]).map((v) => (
              <label key={v} className="seg__opt">
                <input type="radio" name="vehicle" value={v} checked={vehicle === v} onChange={() => changeVehicle(v)} />
                <span>{f.vehicles[v]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="size-row">
          {(["width", "profile", "rim"] as Field[]).map((k, i) => (
            <div key={k} className={`size-field size-field--${k} ${active === k ? "is-active" : ""}`}>
              <label htmlFor={`${uid}-${k}`} className="label">
                <span className="size-field__num" aria-hidden="true">{i + 1}</span>
                {f[k]}
              </label>
              <div className="select">
                {k === "rim" && <span className="select__prefix" aria-hidden="true">R</span>}
                <select {...fieldProps(k)}>
                  <option value="">{f.choose}</option>
                  {options[vehicle][k].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>

        <div className="finder__extras">
          <fieldset className="seg">
            <legend className="label">{f.quantity}</legend>
            <div className="seg__row">
              {[1, 2, 4].map((n) => (
                <label key={n} className="seg__opt seg__opt--sq">
                  <input type="radio" name="qty" value={n} checked={qty === n} onChange={() => setQty(n)} />
                  <span>{n}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="seg">
            <legend className="label">{f.condition}</legend>
            <div className="seg__row">
              {(Object.keys(f.conditions) as Condition[]).map((c) => (
                <label key={c} className="seg__opt">
                  <input type="radio" name="condition" value={c} checked={condition === c} onChange={() => setCondition(c)} />
                  <span>{f.conditions[c]}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <p id={`${uid}-error`} className="finder__error" role="alert">
          {error ? f.error : ""}
        </p>

        <button type="submit" className="btn btn--whatsapp btn--lg finder__submit">
          <WhatsAppIcon size={22} />
          {f.send}
        </button>

        <p className="finder__nosize">
          {f.noSize}{" "}
          <a href={whatsappUrl(f.message.photo)} target="_blank" rel="noopener noreferrer">
            <Camera size={16} aria-hidden="true" /> {f.noSizeCta}
          </a>
        </p>
      </form>

    </div>
  );
}
