import type { ReviewedMetric } from "@/features/comparison/reviewed-metrics";

export function ComparisonBarPlot({metric}:{metric:ReviewedMetric}) {
  const proportion=metric.measurementKind==="outcome_proportion";
  const maxAbs=Math.max(...metric.arms.map(x=>Math.abs(x.value)));
  const bound=proportion?100:Math.max(20,Math.ceil(maxAbs/5)*5);
  const zero=proportion?257:151;
  const scale=proportion?207/100:101/bound;
  const ticks=proportion?[100,75,50,25,0]:[bound,bound/2,0,-bound/2,-bound];
  const y=(value:number)=>zero-value*scale;
  const groupCenters=[228,458];
  const barWidth=110;
  return (
    <svg viewBox="0 0 680 318" className="w-full" role="img"
      aria-label={"Comparação gráfica dentro do mesmo estudo: "+metric.arms.map(a=>a.label+" "+a.value.toLocaleString("pt-BR")+" por cento").join("; ")}>
      <defs>
        <linearGradient id="studio-plot-a" x1="0" y1="0" x2=".9" y2="1">
          <stop stopColor="#74a4ff"/><stop offset="1" stopColor="#315ff4"/>
        </linearGradient>
        <linearGradient id="studio-plot-b" x1="0" y1="0" x2=".9" y2="1">
          <stop stopColor="#55ead8"/><stop offset="1" stopColor="#099e9b"/>
        </linearGradient>
        <filter id="studio-shadow" x="-30%" y="-20%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="8"/>
        </filter>
      </defs>
      {ticks.map((v,i)=>{
        const yp=y(v);
        return (
          <g key={i}>
            <line x1="98" x2="620" y1={yp} y2={yp}
              stroke={v===0?"#8194b2":"#dde5f1"} strokeWidth={v===0?2:1}
              strokeDasharray={v===0?undefined:"5 8"}/>
            <text x="83" y={yp+5} textAnchor="end" fill="#4c6078" fontSize="15" fontWeight={v===0?700:500}>
              {v===0?"0%":(proportion?"":v>0?"+":"")+Number(v.toFixed(1)).toLocaleString("pt-BR")+"%"}
            </text>
          </g>
        );
      })}
      {metric.arms.map((arm,i)=>{
        const center=groupCenters[i];
        const barTop=Math.min(zero,y(arm.value));
        const height=Math.max(0.75,Math.abs(arm.value)*scale);
        const barX=center-barWidth/2;
        const fill=i===0?"url(#studio-plot-a)":"url(#studio-plot-b)";
        return (
          <g key={arm.key}>
            <rect x={barX+6} y={barTop+6} width={barWidth-12} height={height}
              rx="12" fill={i===0?"#315ff4":"#0daca0"} opacity=".20" filter="url(#studio-shadow)"/>
            <rect x={barX} y={barTop} width={barWidth} height={height} rx="12" fill={fill}/>
            {height>26&&(
              <path d={"M"+(barX+12)+" "+(barTop+9)+"h"+(barWidth-24)}
                stroke="white" strokeOpacity=".55" strokeWidth="2.2" strokeLinecap="round"/>
            )}
            <rect x={center-28} y="283" width="56" height="5" rx="2.5" fill={i===0?"#426ef2":"#0fae9d"} opacity=".70"/>
            <text x={center} y="307" fill="#4b627f" fontSize="15" textAnchor="middle" fontWeight="750">
              {i===0?"Grupo 1":"Grupo 2"}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
