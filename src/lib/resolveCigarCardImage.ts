import acidStyle from "@/assets/cigar-cards/unsplash-tobacco-leaves-wood.jpg";
import boldSmoke from "@/assets/cigar-cards/unsplash-cigar-smoke-table.jpg";
import classicSingle from "@/assets/cigar-cards/unsplash-single-cigar-plate.jpg";
import mildSelection from "@/assets/cigar-cards/unsplash-three-cigars-ashtray.jpg";
import cigarCloseup from "@/assets/cigar-closeup.jpg";
import cigarsFeatured from "@/assets/cigars-featured.jpg";
import featuredFigurado from "@/assets/featured-figurado-style.jpg";
import featuredMaduro from "@/assets/featured-maduro-style.jpg";
import featuredOpus from "@/assets/featured-opus-style.jpg";
import humidor from "@/assets/humidor.jpg";

/**
 * Bundled stock imagery for menu cards (Unsplash License + existing lounge photography).
 * Not SKU-specific product shots — brand/vitola heuristics pick a representative visual.
 */

type Rule = { test: RegExp; src: string };

const RULES: Rule[] = [
  { test: /\bopus\s*x\b/i, src: featuredOpus },
  { test: /\bel septimo\b/i, src: featuredOpus },
  { test: /\b(liga privada|tattoo|t52|h99)\b/i, src: boldSmoke },
  { test: /\b(LFD|la flor dominicana)\b/i, src: boldSmoke },
  { test: /\b(hemingway|short story|work of art|perfecto|figurado|salomon|diadema)\b/i, src: featuredFigurado },
  { test: /\b(dc|diesel)\b/i, src: boldSmoke },
  { test: /\b(acid|deadwood|tatiana|isla del sol|leather rose|crazy alice|sweet jane)\b/i, src: acidStyle },
  { test: /\b(padr[oó]n|pardon)\b/i, src: featuredMaduro },
  { test: /\b(cohiba|montecristo|casa cuba)\b/i, src: classicSingle },
  { test: /\bromeo\b/i, src: classicSingle },
  { test: /\b(macanudo|\bm bourbon\b)\b/i, src: mildSelection },
  { test: /\b(ashton|avo)\b/i, src: cigarsFeatured },
  { test: /\boliva.*melanio\b/i, src: featuredFigurado },
  { test: /\b(my father|gurkha)\b/i, src: featuredMaduro },
  { test: /\brocky patel\b/i, src: humidor },
  { test: /\b(crownhead|alec bradley|perla del mar)\b/i, src: classicSingle },
  { test: /\b(camacho|cao|flathead|flat head)\b/i, src: featuredMaduro },
  { test: /\b(leaf by oscar)\b/i, src: acidStyle },
  { test: /\bnub\b/i, src: cigarCloseup },
  { test: /\bfinck/i, src: mildSelection },
  { test: /\b(buffalo trace|pappy|blackened|red meat)\b/i, src: boldSmoke },
  { test: /\b(la aroma|oliva|aliados)\b/i, src: humidor },
  { test: /\b(tatuaje|osok|street|blood)\b/i, src: boldSmoke },
  { test: /\barturo fuente\b/i, src: classicSingle },
  { test: /\baladino\b/i, src: humidor },
  { test: /\bdiamond crown|julius caes|julius caesar\b/i, src: featuredOpus },
  { test: /\bperdomo.*champagne\b/i, src: mildSelection },
  { test: /\bperdomo\b/i, src: featuredMaduro },
  { test: /\bj\.f\.r|lunatic\b/i, src: boldSmoke },
  { test: /\bpunch\b/i, src: classicSingle },
  { test: /\bsan christobal\b/i, src: humidor },
  { test: /\bwhite owl\b/i, src: cigarCloseup },
];

const DEFAULT_SRC = humidor;

export function resolveCigarCardImage(productName: string): string {
  for (const { test, src } of RULES) {
    if (test.test(productName)) return src;
  }
  return DEFAULT_SRC;
}
