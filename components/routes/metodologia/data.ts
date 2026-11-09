/**
 * Conteúdo da prancha 06 (metodologia). Mesmo conteúdo de
 * components/methodology/methodology-page.tsx, reorganizado para o atlas.
 */
export const principles = [
  { id: "P-01", title: "Rastreabilidade", sub: "Referência original e metadados" },
  { id: "P-02", title: "Reprodutibilidade", sub: "Parâmetros e fórmulas explícitos" },
  { id: "P-03", title: "Limites", sub: "Hipóteses não viram fatos clínicos" },
] as const;

export const steps = [
  { number: "01", title: "Localizar e identificar a fonte", description: "Publicação, PMID, URL, ano, tipo de documento, população e método. Um alias não vira uma pesquisa independente.", checks: ["PMID", "URL", "ano", "método"] },
  { number: "02", title: "Distinguir natureza da evidência", description: "Ensaio, metanálise, análise pós-hoc, consenso, farmacovigilância e documento regulatório não medem a mesma coisa.", checks: ["ensaio", "metanálise", "pós-hoc", "regulatório"] },
  { number: "03", title: "Conferir o indicador no original", description: "Braços, N, medidas, período, unidades, IC quando disponíveis e limitações. Números ausentes não são inventados.", checks: ["braços", "N", "IC", "unidades"] },
  { number: "04", title: "Avaliar comparabilidade", description: "Famílias de estudos, participantes compartilhados, tratamentos e desfechos. O Comparador impede agregação entre artigos.", checks: ["família", "participantes", "desfecho"] },
  { number: "05", title: "Definir o que é apenas hipótese", description: "Vínculos não investigados diretamente permanecem sinalizados; cenário matemático não equivale a previsão epidemiológica.", checks: ["vínculo", "cenário", "limite"] },
] as const;

export const safeguards = [
  { title: "Misturar amostras relacionadas", description: "Publicações da mesma família podem compartilhar participantes; a soma automática é proibida.", img: "estudos-1", alt: "Cianotipia de um livro, folhas de pesquisa com um gráfico e uma lupa" },
  { title: "Transformar OR em porcentagem absoluta", description: "Uma razão de chances depende do contexto, do período e da probabilidade basal; não vira risco individual por multiplicação.", img: "balanca-1", alt: "Cianotipia de uma balança de banheiro antiga vista de cima, entre folhas e comprimidos" },
  { title: "Tratar massa magra como diagnóstico", description: "DXA de massa magra não substitui avaliação de força, função e critérios de sarcopenia.", img: "musculo", alt: "Cianotipia de feixes de fibras musculares em estilo de gravura anatômica" },
  { title: "Projetar mortalidade em UTI a partir de fármaco", description: "Não há evidência direta que ligue o desfecho muscular do SURMOUNT ao prognóstico de UTI de uma outra população.", img: "uti", alt: "Cianotipia de um leito hospitalar com monitor cardíaco" },
  { title: "Usar farmacovigilância como incidência", description: "Relatos espontâneos não fornecem todos os casos nem população total exposta sob risco.", img: "orgaos-1", alt: "Cianotipia anatômica de fígado, vesícula, estômago e pâncreas" },
  { title: "Chamar pedido de incorporação de cobertura SUS", description: "O protocolo de avaliação em setembro de 2026 não é garantia de oferta nem definição de elegibilidade nacional.", img: "canetas-1", alt: "Cianotipia de duas canetas injetoras entre samambaias" },
] as const;

export const formulas = [
  { id: "N", title: "Grupo no ano t", parts: ["N(t)", "=", "arredondar(N₀ × (1 + crescimento)ᵗ)"] },
  { id: "C", title: "Continuaram", parts: ["C(t)", "=", "min(N(t), arredondar(ativos(t−1) × retenção))"] },
  { id: "I", title: "Iniciaram", parts: ["I(t)", "=", "arredondar((N(t) − C(t)) × taxa_início(t))"] },
  { id: "A", title: "Ativos", parts: ["A(t)", "=", "C(t) + I(t)"] },
  { id: "S", title: "Saídas", parts: ["S(t)", "=", "ativos(t−1) − C(t)"] },
  { id: "R$", title: "Custo hipotético opcional", parts: ["R$(t)", "=", "A(t) × custo informado por ativo/ano"] },
] as const;

export const susContext = [
  { when: "2025", tag: "decisão específica", title: "Não incorporação em indicação delimitada", body: "Portaria SECTICS/MS nº 65 de setembro de 2025 sobre semaglutida, para população clínica expressamente descrita no ato. Não equivale à proibição geral da classe." },
  { when: "24/09/2026", tag: "pedido de análise", title: "Solicitação à Conitec", body: "O Ministério da Saúde solicitou avaliação de semaglutida/liraglutida. Um pedido não significa incorporação, financiamento nem distribuição universal." },
  { when: "Contínuo", tag: "demografia e vigilância", title: "IBGE ≠ Vigitel ≠ elegibilidade", body: "IBGE projeta população; Vigitel amostra fatores de risco nas capitais e DF. Nenhuma dessas medidas fornece sozinha o total nacional elegível a uma medicação." },
] as const;

/** Glossário de herbário: cada termo é um espécime com um recorte botânico. */
export const glossary = [
  { term: "Massa magra", definition: "Medida corporal que inclui água, tecidos e outras estruturas não gordurosas; não é sinônimo de força muscular.", cut: "samambaia-alta" },
  { term: "DXA", definition: "Absorciometria por raios X de dupla energia. Nos estudos citados, separa gordura e massa magra; não mede força nem função muscular.", cut: "ginkgo" },
  { term: "Sarcopenia", definition: "Condição definida e avaliada por critérios que priorizam força muscular, complementados por quantidade/qualidade e desempenho.", cut: "eucalipto" },
  { term: "PHQ-9", definition: "Questionário de sintomas depressivos. Mudar para uma categoria mais grave não equivale a diagnóstico nem a incidência de depressão causada pelo remédio.", cut: "dente-de-leao" },
  { term: "Odds ratio (OR)", definition: "Razão de chances entre grupos. Sem risco absoluto basal, não representa automaticamente percentual de mortalidade.", cut: "folhas-soltas" },
  { term: "Incidência", definition: "Novos eventos em uma população sob risco e período definido. Relatos espontâneos não fornecem, por si, denominador válido.", cut: "samambaia-curta" },
  { term: "Cenário hipotético", definition: "Resultado de premissas editáveis e fórmula explícita; não prevê que a hipótese ocorrerá.", cut: "semente-alada" },
  { term: "Revisão clínica independente", definition: "Análise por especialista qualificado que ainda não foi concluída para os indicadores atuais.", cut: "lupa" },
] as const;

export const sources = [
  { label: "SURMOUNT-1 / DXA", url: "https://pubmed.ncbi.nlm.nih.gov/39996356/", role: "Composição corporal; subestudo n=160", type: "Pesquisa" },
  { label: "EWGSOP2 — sarcopenia", url: "https://pubmed.ncbi.nlm.nih.gov/30312372/", role: "Força, quantidade/qualidade e função muscular", type: "Consenso" },
  { label: "Metanálise de UTI", url: "https://pubmed.ncbi.nlm.nih.gov/40462133/", role: "Associação com prognóstico em pacientes críticos", type: "Metanálise" },
  { label: "SURMOUNT-4 — continuidade", url: "https://pubmed.ncbi.nlm.nih.gov/38078870/", role: "Continuação e retirada após fase inicial", type: "Ensaio" },
  { label: "SURMOUNT — segurança psiquiátrica", url: "https://pubmed.ncbi.nlm.nih.gov/41537305/", role: "Categorias PHQ-9 em análise pós-hoc", type: "Pós-hoc" },
  { label: "IBGE — projeções populacionais", url: "https://www.ibge.gov.br/estatisticas/sociais/populacao/9109-proje%C3%A7%C3%A3o-da-populacao.html", role: "Contexto demográfico, não taxa de adoção", type: "Oficial" },
  { label: "Vigitel 2006–2024", url: "https://www.gov.br/saude/pt-br/centrais-de-conteudo/publicacoes/svsa/vigitel/", role: "Dados de capitais e DF, não denominador nacional direto", type: "Oficial" },
  { label: "Conitec / decisão de 2025", url: "https://bvsms.saude.gov.br/bvs/saudelegis/sctie/2025/prt0065_16_09_2025.html", role: "Não incorporação em indicação específica à época", type: "Oficial" },
  { label: "Ministério da Saúde / pedido de 2026", url: "https://www.gov.br/saude/pt-br/assuntos/noticias/2026/setembro/ministerio-da-saude-protocola-na-conitec-pedido-de-analise-para-incorporacao-de-canetas-emagrecedoras-no-sus", role: "Pedido de avaliação, não fornecimento universal", type: "Oficial" },
] as const;

/**
 * Quatro tipos de afirmação, do mais simples ao mais exigente. Só a previsão validada
 * exige calibração contra dados observados e validação; o LUPA não tem nenhuma.
 */
export const claimLevels = [
  { id: "O", name: "Observação", asks: "O que foi medido, em quem e quando?",
    example: "Percentual de automedicação entre os adultos entrevistados de uma amostra online brasileira.",
    needs: "Fonte, população, denominador e período.", status: "Há no acervo, sempre com denominador", validated: false },
  { id: "A", name: "Associação", asks: "Duas coisas aparecem juntas?",
    example: "Baixa massa muscular associada a mortalidade na UTI (metanálise E12, medida em OR).",
    needs: "Desenho, medida de efeito e população. Não prova que uma coisa causa a outra.", status: "Há no acervo, sem leitura causal", validated: false },
  { id: "H", name: "Hipótese", asks: "E se as premissas fossem estas?",
    example: "Os cenários 2031, 2036 e 2041 do laboratório e o elo medicamento → reserva muscular → UTI.",
    needs: "Premissas explícitas, editáveis e rotuladas como hipotéticas.", status: "Há no LUPA, sempre rotulada", validated: false },
  { id: "P", name: "Previsão validada", asks: "O que deve acontecer, com erro conhecido?",
    example: "Nenhuma. O LUPA não publica previsão nacional nem clínica.",
    needs: "Calibração contra dados observados e validação em dados que não foram usados no ajuste. É a única categoria que exige isso.", status: "Nenhuma até esta versão", validated: true },
] as const;
