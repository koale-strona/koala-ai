/* Localny filtr niecenzuralnych treści. To lista reguł, nie uniwersalny moderator. */

function fold(value) {
  return String(value || "")
    .toLocaleLowerCase()
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

const BLOCKED_STEMS = [
  // Polski
  "kurw", "chuj", "pierd", "jeb", "skurw", "sukins", "dziwk", "pizd", "cwel", "szmat",
  // Angielski
  "fuck", "shit", "bitch", "asshole", "motherf", "bullshit", "cunt", "dickhead", "cockhead",
  // Hiszpański, francuski, niemiecki i portugalski
  "mierd", "joder", "coño", "cabron", "putain", "merd", "fout", "salop", "scheiss", "fick", "arsch", "hurensohn", "porra", "caralho", "puta",
  // Języki słowiańskie pisane cyrylicą
  "бляд", "сука", "хуй", "еба", "пизд", "говн", "бля", "курв", "срака", "ебат",
  // Dodatkowe częste warianty w językach europejskich
  "kurwa", "chujnia", "spierdal", "zajeb", "whore", "slut", "wanker", "bollock",
  "mierda", "jodid", "puto", "putain", "scheiße", "scheisse", "arschloch", "verdammt",
  "foda", "foder", "puta", "merda", "bastardo", "сукин", "пиздец", "заеб"
];

const EXPLICIT_ADULT_TERMS = ["porn", "porno", "pornograph", "hentai", "xxx", "hardcore porn", "pornografia", "порно"];

export function getBlockedContentReason(message) {
  const raw = String(message || "")
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, "")
    .toLocaleLowerCase();
  const text = fold(raw);
  if (!text) return null;
  const words = text.split(" ").filter(Boolean);

  const asciiLeetspeak = value => fold(value)
    .replace(/[013457@$]/g, char => ({ "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s" })[char] || char)
    .replace(/(.)\1{2,}/g, "$1$1");
  const compactTokens = raw.split(/\s+/).map(token => asciiLeetspeak(token.replace(/[^\p{L}\p{N}@$/]+/gu, ""))).filter(Boolean);
  const blocked = word => BLOCKED_STEMS.some(stem => word.startsWith(fold(stem)));
  const explicit = word => EXPLICIT_ADULT_TERMS.some(term => word.startsWith(fold(term)));

  if (words.some(blocked) || compactTokens.some(blocked)) return "profanity";
  // Wykrywa wpisy typu „f u c k”, ale wyłącznie gdy połączone fragmenty
  // są pojedynczymi literami — zwykłe sąsiednie słowa pozostają nietknięte.
  for (let start = 0; start < compactTokens.length; start++) {
    let joined = "";
    for (let end = start; end < Math.min(compactTokens.length, start + 14); end++) {
      if (compactTokens[end].length !== 1) break;
      joined += compactTokens[end];
      if (blocked(joined)) return "profanity";
    }
  }
  if (words.some(explicit) || compactTokens.some(explicit)) return "explicit-adult";
  return null;
}

export function getContentBlockMessage(reason, language = "pl") {
  const messages = {
    pl: "🐨 Zablokowałam tę wiadomość, bo zawiera wulgarną albo pornograficzną treść. Napisz pytanie bez takich słów, a pomogę Ci w nauce.",
    en: "🐨 I blocked that message because it contains profanity or pornographic content. Rephrase it without those terms and I can help with learning.",
    es: "🐨 He bloqueado el mensaje porque contiene insultos o contenido pornográfico. Reformula la pregunta sin esas expresiones y te ayudaré a estudiar.",
    fr: "🐨 J’ai bloqué ce message car il contient des insultes ou du contenu pornographique. Reformule ta question sans ces termes et je t’aiderai à apprendre.",
    de: "🐨 Ich habe diese Nachricht wegen Schimpfwörtern oder pornografischen Inhalten blockiert. Formuliere sie ohne diese Begriffe neu.",
    ru: "🐨 Я заблокировала это сообщение из-за брани или порнографического содержания. Переформулируйте вопрос без этих слов.",
    uk: "🐨 Я заблокувала це повідомлення через лайку або порнографічний зміст. Переформулюй запитання без цих слів.",
    ja: "🐨 このメッセージには不適切な言葉またはポルノ表現が含まれるため、ブロックしました。学習の質問を別の言い方で入力してください。",
    zh: "🐨 这条消息含有粗俗或色情内容，因此已被拦截。请换一种表达方式再提出学习问题。",
    ar: "🐨 تم حظر الرسالة لأنها تتضمن ألفاظًا بذيئة أو محتوى إباحيًا. أعد صياغة سؤال الدراسة من فضلك.",
    hi: "🐨 इस संदेश में अपशब्द या अश्लील सामग्री है, इसलिए इसे रोक दिया गया। कृपया अपना सीखने का प्रश्न दूसरे शब्दों में लिखें।",
    tr: "🐨 Bu mesaj kaba veya pornografik içerik barındırdığı için engellendi. Öğrenme sorunuzu başka sözcüklerle yazın."
  };
  return messages[language] || messages.en;
}
