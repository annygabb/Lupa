/** Índice de pranchas do atlas: cada rota do site é uma prancha ilustrada. */
export interface Plate {
  n: string;
  href: string;
  label: string;
  title: string;
  caption: string;
  image: string;
  alt: string;
}

const img = (name: string) => `/assets/images/cianotipia/${name}.webp`;

export const plates: readonly Plate[] = [
  {
    n: "01", href: "/evidencias", label: "Evidências",
    title: "Uma manchete não conta o estudo inteiro",
    caption: "50 referências em curadoria, com população, método, limite e fonte original.",
    image: img("estudos-1"), alt: "Cianotipia de um livro, folhas de pesquisa com um gráfico e uma lupa",
  },
  {
    n: "02", href: "/comparar", label: "Comparar",
    title: "Números parecidos podem medir coisas diferentes",
    caption: "Dois estudos lado a lado, com o que pode e o que não pode ser combinado.",
    image: img("comparar"), alt: "Cianotipia de uma balança antiga de dois pratos com um espécime botânico em cada lado",
  },
  {
    n: "03", href: "/musculos-uti", label: "Músculos e UTI",
    title: "A balança não mostra toda a saúde muscular",
    caption: "Massa magra, força e cuidados críticos, com as ligações que ainda não foram demonstradas.",
    image: img("musculo"), alt: "Cianotipia de feixes de fibras musculares em estilo de gravura anatômica",
  },
  {
    n: "04", href: "/saude-mental", label: "Saúde mental",
    title: "Emagrecer não resume o que uma pessoa sente",
    caption: "O que os estudos mediram sobre sintomas, bem-estar e quem participou.",
    image: img("cerebro"), alt: "Cianotipia de um cérebro humano com neurônios que crescem como raízes",
  },
  {
    n: "05", href: "/projecoes", label: "Brasil × EUA",
    title: "O futuro depende de acesso e continuidade",
    caption: "Dados observados, lacunas e um laboratório de cenários hipotéticos até 2041.",
    image: img("globo"), alt: "Cianotipia de um globo terrestre antigo com folhas ao redor da base",
  },
  {
    n: "06", href: "/metodologia", label: "Metodologia",
    title: "Cada conclusão precisa de um caminho",
    caption: "Como as fontes são escolhidas, conferidas e onde a interpretação para.",
    image: img("laboratorio-2"), alt: "Cianotipia de vidrarias de laboratório e um microscópio antigo",
  },
];

export function plateFor(href: string): Plate | undefined {
  return plates.find(p => p.href === href);
}
