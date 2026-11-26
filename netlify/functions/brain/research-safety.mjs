/*
 * Lokalny filtr zapytań do przeglądarki badawczej Koali.
 * Nie korzysta z usług ani modeli zewnętrznych. Blokuje prośby o instrukcje,
 * które mogłyby prowadzić do poważnej krzywdy; pozostawia kontekst szkolny.
 */

function normalize(value) {
  return String(value ?? "")
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, "")
    .toLocaleLowerCase()
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const INSTRUCTION_PATTERNS = [
  {
    reason: "self-harm-instructions",
    patterns: [
      /\b(how (can|do) i (kill|hurt) myself|ways to kill myself|suicide methods|how to self harm)\b/,
      /\b(jak (sie )?(zabic|skrzywdzic)|sposoby (na )?samobojstwo|jak sie okaleczyc|czym sie okaleczyc)\b/,
      /\b(como suicidarme|formas de suicidarme|wie kann ich mich umbringen)\b/
    ]
  },
  {
    reason: "weapon-instructions",
    patterns: [
      /\b(how to (make|build) (a )?(bomb|explosive|pipe bomb|gun)|make an explosive device)\b/,
      /\b(jak (zrobic|zbudowac) (bombe|material wybuchowy|bron palna)|instrukcja budowy bomby)\b/,
      /\b(como fabricar una bomba|wie baut man eine bombe)\b/
    ]
  },
  {
    reason: "drug-production",
    patterns: [
      /\b(how to (make|cook|synthesize) (meth|methamphetamine|illegal drugs)|make illegal drugs)\b/,
      /\b(jak (zrobic|wyprodukowac|ugotowac) (narkotyki|metamfetamine|amfetamine))\b/,
      /\b(como fabricar metanfetamina|meth herstellen)\b/
    ]
  },
  {
    reason: "cyber-abuse",
    patterns: [
      /\b(steal (a )?passwords?|steal (an )?account|hack (someone|a person s|my friend s) account|make ransomware|deploy malware)\b/,
      /\b(ukrasc haslo|ukrasc konto|zhakowac cudze konto|zrobic ransomware|stworzyc malware)\b/
    ]
  },
  {
    reason: "explicit-sexual-content",
    patterns: [
      /\b(sex positions|how to have sex|sexual techniques|erotic stories|nudes?|naked photos|sex videos)\b/,
      /\b(jak uprawiac seks|pozycje seksualne|filmy erotyczne|nagie zdjecia|zdjecia nagich (osob|dziewczyn|chlopakow)|wyslij nude)\b/,
      /\b(posiciones sexuales|fotos desnudas|erotische geschichten|nacktbilder)\b/
    ]
  }
];

const BLOCK_MESSAGES = {
  "self-harm-instructions": {
    pl: "Nie pomogę szukać sposobów na zrobienie sobie krzywdy. Jeśli to dotyczy Ciebie, powiedz teraz zaufanej osobie dorosłej. Jeśli grozi Ci bezpośrednie niebezpieczeństwo, zadzwoń pod 112.",
    en: "I can’t help find ways to hurt yourself. If this is about you, tell a trusted adult now. If you’re in immediate danger, call your local emergency number."
  },
  "weapon-instructions": {
    pl: "Nie pomogę wyszukiwać instrukcji budowy broni ani materiałów wybuchowych. Mogę za to wyjaśnić bezpiecznie historię, zasady bezpieczeństwa lub chemię na poziomie szkolnym.",
    en: "I can’t help find weapon or explosive construction instructions. I can help with safe history, safety information, or school-level science instead."
  },
  "drug-production": {
    pl: "Nie pomogę wyszukiwać instrukcji wytwarzania nielegalnych narkotyków. Mogę wyjaśnić ich wpływ na zdrowie albo temat uzależnień w bezpieczny, edukacyjny sposób.",
    en: "I can’t help find instructions for making illegal drugs. I can explain health effects or addiction in a safe, educational way."
  },
  "cyber-abuse": {
    pl: "Nie pomogę wyszukiwać sposobów kradzieży kont, haseł ani tworzenia złośliwego oprogramowania. Mogę pomóc w nauce cyberbezpieczeństwa i ochronie kont.",
    en: "I can’t help find ways to steal accounts or passwords or create malware. I can help with cybersecurity and protecting accounts."
  },
  "explicit-sexual-content": {
    pl: "Nie pomogę wyszukiwać jawnych treści seksualnych. Mogę za to odpowiedzieć bezpiecznie na pytania o dojrzewanie, zdrowie i biologię.",
    en: "I can’t help find explicit sexual material. I can answer safe questions about puberty, health, and biology."
  }
};

export function getUnsafeResearchReason(message) {
  const normalized = normalize(message);
  if (!normalized) return null;
  for (const group of INSTRUCTION_PATTERNS) {
    if (group.patterns.some(pattern => pattern.test(normalized))) return group.reason;
  }
  return null;
}

export function getResearchSafetyMessage(reason, language = "pl") {
  const messages = BLOCK_MESSAGES[reason];
  if (!messages) return BLOCK_MESSAGES["weapon-instructions"].pl;
  return messages[language] || messages.pl;
}
