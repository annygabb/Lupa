import { countrySnapshot, futureCountryValue, horizons } from "@/features/insights/evidence";
import { LimitNote, Reveal } from "@/components/atlas/ui";

const rows = [
  { code: "BR" as const, name: "Brasil", snap: countrySnapshot.brazil },
  { code: "US" as const, name: "Estados Unidos", snap: countrySnapshot.usa },
];

/**
 * Mapa de lacunas: o que cada país tem de dado nacional comparável e o que falta em cada
 * horizonte. Uma célula vazia é desenhada como ausência (hachura âmbar), nunca como 0.
 */
export function GapLedger() {
  return (
    <div className="px-ledger">
      <Reveal className="px-ledger__wrap">
        <table className="px-ledger__table">
          <caption className="sr-only">Uso atual ou passado de GLP-1/GIP por país: último dado nacional e horizontes 2026 a 2041. Células marcadas como lacuna não têm valor sustentado e não equivalem a zero.</caption>
          <thead>
            <tr>
              <th scope="col">País</th>
              <th scope="col">Último dado nacional</th>
              {horizons.map(y => <th scope="col" key={y}>{y}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.code}>
                <th scope="row"><span className="px-ledger__flag" aria-hidden="true">{r.code}</span>{r.name}</th>
                <td data-label="Último dado nacional" className={r.snap.value === null ? "is-gap" : "is-data"}>
                  {r.snap.value === null ? (
                    <Gap note="Sem prevalência nacional comparável"/>
                  ) : (
                    <span className="px-ledger__data">
                      <strong>{r.snap.value.toLocaleString("pt-BR")}%</strong>
                      <span>Out/{r.snap.year} · preprint · uso atual ou passado</span>
                    </span>
                  )}
                </td>
                {horizons.map(y => {
                  const v = futureCountryValue(r.code, y);
                  return (
                    <td key={y} data-label={String(y)} className={v === null ? "is-gap" : "is-data"}>
                      {v === null ? <Gap note="Sem modelo calibrado"/> : <strong>{v}</strong>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>
      <div className="px-ledger__foot">
        <div className="px-ledger__defs">
          <p><strong>Brasil.</strong> {countrySnapshot.brazil.definition} <a className="at-link" href={`https://pubmed.ncbi.nlm.nih.gov/${countrySnapshot.brazil.pmid}/`} target="_blank" rel="noopener noreferrer">PMID {countrySnapshot.brazil.pmid}</a></p>
          <p><strong>Estados Unidos.</strong> {countrySnapshot.usa.definition} <a className="at-link" href={`https://pubmed.ncbi.nlm.nih.gov/${countrySnapshot.usa.pmid}/`} target="_blank" rel="noopener noreferrer">PMID {countrySnapshot.usa.pmid}</a></p>
        </div>
        <LimitNote title="Lacuna não é zero">
          <p>Nenhum estudo recuperado oferece um modelo longitudinal calibrado por país. Por isso 2026, 2031, 2036 e 2041 aparecem vazios para Brasil e EUA. Valores futuros só existem, mais abaixo, como hipóteses de um grupo fictício.</p>
        </LimitNote>
      </div>
    </div>
  );
}

function Gap({ note }: { note: string }) {
  return (
    <span className="px-gap">
      <span className="px-gap__glyph" aria-hidden="true"/>
      <span className="px-gap__word">Lacuna</span>
      <span className="px-gap__note">{note}</span>
    </span>
  );
}
