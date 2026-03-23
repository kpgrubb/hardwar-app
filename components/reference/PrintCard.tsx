import type { ElementStatCard, KeywordDefinition } from "@/types";
import keywordsData from "@/data/keywords.json";

const allKeywords = keywordsData as KeywordDefinition[];
const keywordMap = new Map<string, KeywordDefinition>();
for (const kw of allKeywords) {
  keywordMap.set(kw.term.toLowerCase(), kw);
  for (const alias of kw.aliases) keywordMap.set(alias.toLowerCase(), kw);
}

interface Props {
  element: ElementStatCard;
}

export default function PrintCard({ element }: Props) {
  const { stats } = element;
  const damageBoxes = Array.from({ length: stats.A }, (_, i) => i);

  // Collect all terms and resolve their definitions
  const allTerms = [
    ...element.special_rules,
    ...element.weapon_upgrades.map((w) => w.name),
    ...element.performance_upgrades,
  ];
  const definitions = allTerms
    .map((t) => {
      const kw = keywordMap.get(t.toLowerCase());
      return kw ? { term: t, def: kw.definition_core } : null;
    })
    .filter((d): d is { term: string; def: string } => d !== null);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        border: "0.5px solid #999",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-body)",
        fontSize: "7pt",
        lineHeight: 1.3,
        color: "#1C1814",
        background: "#fff",
      }}
    >
      {/* Header bar */}
      <div
        style={{
          background: "#1C1814",
          color: "#FAFAF8",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "3px 6px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "11pt",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {element.name}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "8pt",
            fontWeight: 700,
            background: "#F5E600",
            color: "#1C1814",
            padding: "1px 4px",
          }}
        >
          C{element.class}
        </span>
      </div>

      {/* Faction + Motive row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "2px 6px",
          borderBottom: "0.5px solid #D5D4D3",
          fontFamily: "var(--font-mono)",
          fontSize: "6pt",
          color: "#8E8C8A",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        <span>{element.faction}</span>
        <span>{element.motive_type}</span>
      </div>

      {/* Stats row — compact horizontal */}
      <div
        style={{
          display: "flex",
          borderBottom: "0.5px solid #D5D4D3",
        }}
      >
        {(["M", "F", "D", "A", "C"] as const).map((stat) => (
          <div
            key={stat}
            style={{
              flex: 1,
              textAlign: "center",
              padding: "2px 0",
              borderRight: "0.5px solid #D5D4D3",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "5pt",
                color: "#8E8C8A",
                textTransform: "uppercase",
              }}
            >
              {stat}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "14pt",
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {stats[stat]}
            </div>
          </div>
        ))}
        {/* Damage track */}
        <div style={{ flex: 1.5, padding: "3px 4px" }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "5pt",
              color: "#8E8C8A",
              textTransform: "uppercase",
              marginBottom: "2px",
            }}
          >
            DMG
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5px" }}>
            {damageBoxes.map((i) => (
              <div
                key={i}
                style={{
                  width: "8px",
                  height: "8px",
                  border: "1px solid #1C1814",
                  background: "#fff",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Abilities + inline definitions */}
      <div style={{ flex: 1, padding: "3px 6px", overflow: "hidden" }}>
        {definitions.map(({ term, def }) => (
          <div key={term} style={{ marginBottom: "2px" }}>
            <span
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: "6pt",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {term}
            </span>
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "5.5pt",
                color: "#4A4644",
                marginLeft: "4px",
              }}
            >
              — {def}
            </span>
          </div>
        ))}

        {/* Weapon upgrades */}
        {element.weapon_upgrades.map((w, i) => (
          <div
            key={i}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "5.5pt",
              color: "#8E8C8A",
              marginBottom: "1px",
            }}
          >
            [{w.name}]
            {w.f_bonus !== 0 && (
              <span style={{ color: "#1C1814", marginLeft: "3px" }}>
                F{w.f_bonus > 0 ? "+" : ""}{w.f_bonus}
              </span>
            )}
            {w.notes && <span style={{ marginLeft: "3px" }}>{w.notes}</span>}
          </div>
        ))}
      </div>

      {/* Page ref footer */}
      <div
        style={{
          padding: "1px 6px",
          borderTop: "0.5px solid #D5D4D3",
          textAlign: "right",
          fontFamily: "var(--font-mono)",
          fontSize: "5pt",
          color: "#8E8C8A",
        }}
      >
        p.{element.page_ref}
      </div>
    </div>
  );
}
