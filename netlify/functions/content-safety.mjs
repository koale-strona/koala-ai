/* Localne filtry treści przeznaczone dla edukacyjnego chatbota dla uczniów. */

function fold(value) {
  return String(value || "")
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, "")
    .toLocaleLowerCase()
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

const PROFANITY_STEMS = [
  "kurw", "chuj", "pierd", "jeb", "skurw", "sukins", "dziwk", "pizd", "cwel", "szmat", "spierdal", "zajeb",
  "fuck", "shit", "bitch", "asshole", "motherf", "bullshit", "cunt", "dickhead", "cockhead", "wanker", "whore", "slut",
  "mierd", "joder", "coño", "cabron", "putain", "merd", "fout", "salop", "scheiss", "arsch", "hurensohn", "caralho",
  "бляд", "сука", "хуй", "еба", "пизд", "говн", "бля", "курв", "срака", "ебат", "заеб",
  "cyka", "blyat", "huy", "pizda", "ebat"
];

const ADULT_STEMS = ["porn", "porno", "pornograph", "hentai", "xxx", "sex tape", "pornografia", "порно"];

function latinLookalikes(value) {
  return value.replace(/[а-яёіїєґ]/giu, char => ({
    "а": "a", "е": "e", "ё": "e", "і": "i", "ї": "i", "є": "e", "о": "o", "р": "p", "с": "c", "у": "y", "х": "x", "к": "k", "м": "m", "т": "t", "в": "b", "н": "h"
  })[char.toLocaleLowerCase()] || char);
}

function disguiseFold(value) {
  return fold(latinLookalikes(String(value || "")))
    .replace(/[013457@$]/g, character => ({ "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s" })[character] || character)
    .replace(/(.)\1{2,}/g, "$1$1")
    .replace(/\s+/g, "");
}

function hasStem(words, stems) {
  return words.some(word => stems.some(stem => word.startsWith(fold(stem))));
}

export function getBlockedContentReason(message) {
  const raw = String(message || "").replace(/[\u200B-\u200D\u2060\uFEFF]/g, "");
  const plainWords = fold(raw).split(/\s+/).filter(Boolean);
  if (!plainWords.length) return null;

  const disguisedTokens = raw.split(/\s+/).map(disguiseFold).filter(Boolean);
  if (hasStem(plainWords, PROFANITY_STEMS) || hasStem(disguisedTokens, PROFANITY_STEMS)) return "profanity";

  // Wykrywa wpisy typu „f u c k”; nie skleja zwykłych sąsiednich wyrazów.
  for (let start = 0; start < disguisedTokens.length; start++) {
    let joined = "";
    for (let end = start; end < Math.min(disguisedTokens.length, start + 14); end++) {
      if (disguisedTokens[end].length !== 1) break;
      joined += disguisedTokens[end];
      if (hasStem([joined], PROFANITY_STEMS)) return "profanity";
    }
  }

  if (hasStem(plainWords, ADULT_STEMS) || hasStem(disguisedTokens, ADULT_STEMS)) return "explicit-adult";
  return null;
}

export function getContentBlockMessage(reason, language = "pl") {
  const messages = {
    pl: "🐨 Zablokowałam tę wiadomość, bo zawiera wulgarne albo pornograficzne treści. Napisz pytanie odpowiednim językiem, a pomogę Ci w nauce.",
    en: "🐨 I blocked that message because it contains profanity or pornographic content. Rephrase it respectfully and I can help you learn.",
    es: "🐨 He bloqueado el mensaje porque contiene insultos o contenido pornográfico. Reformúlalo con respeto y te ayudaré a estudiar.",
    fr: "🐨 J’ai bloqué ce message car il contient des insultes ou du contenu pornographique. Reformule-le respectueusement et je t’aiderai à apprendre.",
    de: "🐨 Ich habe diese Nachricht wegen Schimpfwörtern oder pornografischen Inhalten blockiert. Formuliere sie bitte respektvoll neu.",
    it: "🐨 Ho bloccato il messaggio perché contiene insulti o contenuti pornografici. Riformulalo con rispetto e ti aiuterò a studiare.",
    pt: "🐨 Bloqueei a mensagem porque contém insultos ou conteúdo pornográfico. Reformula-a com respeito e vou ajudar-te a estudar.",
    ru: "🐨 Сообщение заблокировано из-за брани или порнографического содержания. Переформулируйте его уважительно.",
    uk: "🐨 Повідомлення заблоковано через лайку або порнографічний зміст. Переформулюй його ввічливо.",
    ja: "🐨 不適切な言葉やポルノ表現が含まれるため、このメッセージをブロックしました。丁寧な表現で質問してください。",
    zh: "🐨 这条消息含有粗俗或色情内容，因此已被拦截。请用合适的语言重新提问。",
    tr: "🐨 Bu mesaj kaba veya pornografik içerik içerdiği için engellendi. Lütfen uygun bir dille yeniden sorun."
  };
  return messages[language] || messages.en;
}
