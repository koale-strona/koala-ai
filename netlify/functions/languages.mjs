/* Lokalne, lekkie rozpoznawanie języka i słowa pomijane w wyszukiwaniu. */

export const LANGUAGE_PROFILES = [
  ["pl", "polski"], ["en", "English"], ["es", "español"], ["fr", "français"],
  ["de", "Deutsch"], ["it", "italiano"], ["pt", "português"], ["nl", "Nederlands"],
  ["ru", "русский"], ["uk", "українська"], ["ja", "日本語"], ["zh", "中文"],
  ["ar", "العربية"], ["hi", "हिन्दी"], ["tr", "Türkçe"], ["sv", "svenska"],
  ["ko", "한국어"], ["el", "Ελληνικά"], ["he", "עברית"], ["fa", "فارسی"],
  ["ur", "اردو"], ["bn", "বাংলা"], ["th", "ไทย"], ["da", "dansk"],
  ["no", "norsk"], ["fi", "suomi"], ["cs", "čeština"], ["ro", "română"],
  ["hu", "magyar"], ["id", "Indonesia"], ["vi", "Tiếng Việt"],
  ["af", "Afrikaans"], ["sq", "shqip"], ["az", "azərbaycan dili"], ["eu", "euskara"],
  ["be", "беларуская"], ["bg", "български"], ["bs", "bosanski"], ["ca", "català"],
  ["hr", "hrvatski"], ["et", "eesti"], ["fil", "Filipino"], ["gl", "galego"],
  ["ka", "ქართული"], ["gu", "ગુજરાતી"], ["is", "íslenska"], ["ga", "Gaeilge"],
  ["kk", "қазақша"], ["kn", "ಕನ್ನಡ"], ["km", "ខ្មែរ"], ["lo", "ລາວ"],
  ["lv", "latviešu"], ["lt", "lietuvių"], ["mk", "македонски"], ["ms", "Bahasa Melayu"],
  ["ml", "മലയാളം"], ["mn", "монгол"], ["ne", "नेपाली"], ["pa", "ਪੰਜਾਬੀ"],
  ["ps", "پښتو"], ["si", "සිංහල"], ["sk", "slovenčina"], ["sl", "slovenščina"],
  ["so", "Soomaali"], ["sr", "српски"], ["sw", "Kiswahili"], ["ta", "தமிழ்"], ["te", "తెలుగు"],
  ["uz", "oʻzbekcha"], ["cy", "Cymraeg"], ["yo", "Yorùbá"], ["zu", "isiZulu"],
  ["am", "አማርኛ"], ["hy", "հայերեն"], ["my", "မြန်မာဘာသာ"]
].map(([code, label]) => ({ code, label }));

const STOP_WORDS = {
  pl: "jest jak czy oraz dla sie nie żeby który która gdzie kiedy co dlaczego wyjaśnij podaj opowiedz ze z na o wygeneruj odczytaj przeczytaj zrob",
  ru: "и это есть что как почему кто где когда для с объясни",
  uk: "і це є що як чому хто де коли для з поясни",
  sr: "и је су шта како зашто ко где када за са објасни",
  mk: "и е се што како зошто кој каде кога за со објасни",
  kk: "және бұл не қалай неге кім қайда қашан үшін түсіндір",
  mn: "ба энэ юу яаж яагаад хэн хаана хэзээ тайлбарла",
  en: "the is are was were what how why who where when which and or for with from explain define tell describe",
  es: "el la los las un una es son que como quien donde cuando por para con del explica define",
  fr: "le la les un une est sont que comment pourquoi qui ou quand des pour avec explique",
  de: "der die das ein eine ist sind was wie warum wer wo wann und oder mit von erkläre",
  it: "il lo la gli le un una è sono che come perché chi dove quando per con spiega",
  pt: "o a os as um uma é são que como porque quem onde quando para com explica",
  nl: "de het een is zijn wat hoe waarom wie waar wanneer en of met van uitleg",
  sv: "en ett det är vad hur varför vem var när och med från förklara",
  tr: "bir ve veya nedir nasıl neden kim nerede ne zaman için ile açıkla",
  da: "en et den det er hvad hvordan hvorfor hvem hvor hvornar og med fra forklar",
  no: "en ei et den det er hva hvordan hvorfor hvem hvor nar og med fra forklar",
  fi: "ja on ovat mikä miten miksi kuka missä milloin kanssa varten selitä",
  cs: "a je jsou co jak proč kdo kde kdy nebo pro s vysvětli",
  ro: "și este sunt ce cum de ce cine unde când pentru cu explică",
  hu: "és van vannak mi hogyan miért ki hol mikor vagy hogy magyarázd",
  id: "dan adalah apa bagaimana mengapa siapa dimana kapan untuk dengan jelaskan",
  vi: "và là gì như thế nào tại sao ai ở đâu khi nào với giải thích",
  af: "die is wat hoe waarom wie waar wanneer en of met vir verduidelik",
  sq: "dhe është janë çfarë si pse kush ku kur për me shpjego",
  az: "və bir nə necə niyə kim harada nə vaxt ilə üçün izah",
  eu: "eta da dira zer nola zergatik nor non noiz eta azaldu",
  be: "і ёсць што як чаму хто дзе калі для каб з тлумач",
  bg: "и е са как защо кой къде кога за с обясни",
  bs: "i je su šta kako zašto ko gdje kada za sa objasni",
  ca: "i és són què com per què qui on quan per amb explica",
  hr: "i je su što kako zašto tko gdje kada za s objasni",
  et: "ja on mis kuidas miks kes kus millal ning koos selgita",
  fil: "at ay ano paano bakit sino saan kailan para kasama ipaliwanag",
  gl: "e é son que como por que quen onde cando para con explica",
  ga: "agus tá cad conas cén fáth cé cá cathain le haghaidh mínigh",
  is: "og er hvað hvernig hvers vegna hver hvar hvenær með fyrir útskýrðu",
  lv: "un ir kas kā kāpēc kurš kur kad ar par izskaidro",
  lt: "ir yra kas kaip kodėl kas kur kada su paaiškink",
  ms: "dan ialah apa bagaimana mengapa siapa di mana bila untuk dengan jelaskan",
  sk: "a je sú čo ako prečo kto kde kedy alebo pre s vysvetli",
  sl: "in je so kaj kako zakaj kdo kje kdaj za z pojasni",
  so: "iyo waa maxay sida sababta yaa halka goorma iyo sharax",
  sw: "na ni nini jinsi kwa nini nani wapi lini kwa pamoja eleza",
  uz: "va bu nima qanday nima uchun kim qayerda qachon bilan uchun tushuntir",
  cy: "a yw beth sut pam pwy ble pryd gyda ar gyfer esboniwch",
  yo: "ati ni kini bawo idi ti tani nibo nigbawo pelu se alaye",
  zu: "futhi yini kanjani kungani ubani kuphi nini nge chaza"
};

// Te języki używają innych alfabetów; podajemy im lokalne słowa funkcyjne,
// żeby rozpoznawanie i czyszczenie zapytań miało dane dla każdego profilu.
Object.assign(STOP_WORDS, {
  ja: "これ は が を に で と から まで 何 なぜ どう 説明",
  zh: "什么 为什么 怎么 谁 哪里 什么时候 的 是 和 在 请 解释",
  ar: "ما ماذا لماذا كيف من أين متى في إلى عن اشرح",
  hi: "क्या क्यों कैसे कौन कहाँ कब और के लिए साथ समझाइए",
  ko: "무엇 왜 어떻게 누구 어디 언제 이 가 을 를 에서 설명",
  el: "τι γιατί πώς ποιος πού πότε και για με εξήγησε",
  he: "מה למה איך מי איפה מתי ועם עבור הסבר",
  fa: "چه چرا چگونه چه کسی کجا کی و برای با توضیح",
  ur: "کیا کیوں کیسے کون کہاں کب اور کے لیے ساتھ وضاحت",
  bn: "কি কেন কীভাবে কে কোথায় কখন এবং জন্য সঙ্গে ব্যাখ্যা",
  th: "อะไร ทำไม อย่างไร ใคร ที่ไหน เมื่อไร และ สำหรับ อธิบาย",
  ka: "რა რატომ როგორ ვინ სად როდის და ახსენი",
  gu: "શું શા માટે કેવી રીતે કોણ ક્યાં ક્યારે અને માટે સમજાવો",
  kn: "ಏನು ಏಕೆ ಹೇಗೆ ಯಾರು ಎಲ್ಲಿ ಯಾವಾಗ ಮತ್ತು ವಿವರಿಸಿ",
  km: "អ្វី ហេតុអ្វី របៀបណា អ្នកណា នៅឯណា ពេលណា និង ពន្យល់",
  lo: "ຫຍັງ ເປັນຫຍັງ ແນວໃດ ໃຜ ຢູ່ໃສ ເມື່ອໃດ ອະທິບາຍ",
  ml: "എന്ത് എന്തുകൊണ്ട് എങ്ങനെ ആര് എവിടെ എപ്പോൾ വിശദീകരിക്കുക",
  ne: "के किन कसरी को कहाँ कहिले र लागि व्याख्या",
  pa: "ਕੀ ਕਿਉਂ ਕਿਵੇਂ ਕੌਣ ਕਿੱਥੇ ਕਦੋਂ ਅਤੇ ਲਈ ਸਮਝਾਓ",
  ps: "څه ولې څنګه څوک چېرته کله او لپاره تشریح",
  si: "කුමක් ඇයි කෙසේ කවුද කොහේ කවදා සහ සඳහා පැහැදිලි",
  ta: "என்ன ஏன் எப்படி யார் எங்கே எப்போது மற்றும் விளக்கவும்",
  te: "ఏమి ఎందుకు ఎలా ఎవరు ఎక్కడ ఎప్పుడు మరియు వివరించండి",
  am: "ምን ለምን እንዴት ማን የት መቼ እና ለ አብራራ",
  hy: "ինչ ինչու ինչպես ով որտեղ երբ և համար բացատրի",
  my: "ဘာကြောင့် ဘယ်လို ဘယ်သူ ဘယ်မှာ ဘယ်အချိန် နှင့် ရှင်းပြ"
});

function fold(value) {
  return String(value || "")
    .toLocaleLowerCase()
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function detectQuestionLanguage(question) {
  const raw = String(question || "");
  if (/[\u3040-\u30ff]/u.test(raw)) return "ja";
  if (/[\u4e00-\u9fff]/u.test(raw)) return "zh";
  if (/[\uac00-\ud7af]/u.test(raw)) return "ko";
  if (/[\u0600-\u06ff]/u.test(raw)) {
    if (/[ښږڅډړټګڼ]/u.test(raw)) return "ps";
    if (/[پچژگ]/u.test(raw)) return "fa";
    if (/[ٹڈڑںھ]/u.test(raw)) return "ur";
    return "ar";
  }
  if (/[\u0900-\u097f]/u.test(raw)) return "hi";
  if (/[\u0980-\u09ff]/u.test(raw)) return "bn";
  if (/[\u0a00-\u0a7f]/u.test(raw)) return "pa";
  if (/[\u0a80-\u0aff]/u.test(raw)) return "gu";
  if (/[\u0b80-\u0bff]/u.test(raw)) return "ta";
  if (/[\u0c00-\u0c7f]/u.test(raw)) return "te";
  if (/[\u0c80-\u0cff]/u.test(raw)) return "kn";
  if (/[\u0d00-\u0d7f]/u.test(raw)) return "ml";
  if (/[\u0d80-\u0dff]/u.test(raw)) return "si";
  if (/[\u0e00-\u0e7f]/u.test(raw)) return "th";
  if (/[\u0e80-\u0eff]/u.test(raw)) return "lo";
  if (/[\u1000-\u109f]/u.test(raw)) return "my";
  if (/[\u1780-\u17ff]/u.test(raw)) return "km";
  if (/[\u0590-\u05ff]/u.test(raw)) return "he";
  if (/[\u0530-\u058f]/u.test(raw)) return "hy";
  if (/[\u10a0-\u10ff]/u.test(raw)) return "ka";
  if (/[\u1200-\u137f]/u.test(raw)) return "am";
  if (/[\u0370-\u03ff]/u.test(raw)) return "el";

  const text = fold(raw);
  const textWords = new Set(text.split(" ").filter(Boolean));
  let bestLanguage = "en";
  let bestScore = 0;
  for (const [language, words] of Object.entries(STOP_WORDS)) {
    const score = words.split(" ").reduce((total, word) => total + Number(textWords.has(fold(word))), 0);
    if (score > bestScore) {
      bestLanguage = language;
      bestScore = score;
    }
  }
  if (/[\u0400-\u04ff]/u.test(raw) && bestScore === 0) return "ru";
  return bestLanguage;
}

export function getLanguageStopWords(language) {
  return new Set(fold(STOP_WORDS[language] || "").split(" ").filter(Boolean));
}

const RESEARCH_LABELS = {
  pl: { news: "Przegląd najnowszych wiadomości", materials: "Zebrane materiały", found: "Znalazłam", articles: "artykułów z", pages: "stron z", sites: "witryn", match: "pasujących do pytania.", sorted: "Uporządkowałam je według dat publikacji.", important: "Najważniejsze znalezione materiały", sources: "Źródła do przeczytania", checked: "Stan sprawdzenia", newsLimit: "To krótkie omówienia fragmentów artykułów, a nie pełna synteza wszystkich wydarzeń. Fragmenty mogą pozostać w języku oryginalnym strony.", generalLimit: "To wybrane fragmenty publicznych stron. Sprawdź źródła, jeśli potrzebujesz pełnego kontekstu." },
  en: { news: "Latest news overview", materials: "Collected materials", found: "Found", articles: "articles from", pages: "pages from", sites: "websites", match: "that match the question.", sorted: "They are ordered by publication date.", important: "Most relevant material found", sources: "Sources to read", checked: "Checked", newsLimit: "These are short summaries of article excerpts, not a complete review of all events. Excerpts may remain in the source language.", generalLimit: "These are selected excerpts from public pages. Check the sources for full context." },
  es: { news: "Resumen de noticias recientes", materials: "Materiales encontrados", found: "Encontré", articles: "artículos de", pages: "páginas de", sites: "sitios web", match: "que coinciden con la pregunta.", sorted: "Están ordenados por fecha de publicación.", important: "Material más relevante", sources: "Fuentes para leer", checked: "Consulta realizada", newsLimit: "Son resúmenes breves de fragmentos, no un análisis completo de todas las noticias. Los fragmentos pueden seguir en el idioma original.", generalLimit: "Son fragmentos seleccionados de páginas públicas. Consulta las fuentes para obtener el contexto completo." },
  fr: { news: "Aperçu des actualités récentes", materials: "Documents trouvés", found: "J’ai trouvé", articles: "articles sur", pages: "pages sur", sites: "sites", match: "qui correspondent à la question.", sorted: "Ils sont classés par date de publication.", important: "Documents les plus pertinents", sources: "Sources à consulter", checked: "Recherche effectuée", newsLimit: "Ce sont de courts résumés d’extraits, pas une synthèse complète. Les extraits peuvent rester dans la langue d’origine.", generalLimit: "Ce sont des extraits de pages publiques. Consultez les sources pour le contexte complet." },
  de: { news: "Überblick über aktuelle Nachrichten", materials: "Gefundene Materialien", found: "Gefunden", articles: "Artikel aus", pages: "Seiten aus", sites: "Websites", match: "die zur Frage passen.", sorted: "Sie sind nach Veröffentlichungsdatum geordnet.", important: "Wichtigste gefundene Materialien", sources: "Quellen zum Weiterlesen", checked: "Abgerufen", newsLimit: "Dies sind kurze Zusammenfassungen von Auszügen, keine vollständige Übersicht. Auszüge können in der Originalsprache bleiben.", generalLimit: "Dies sind ausgewählte Auszüge öffentlicher Seiten. Für den vollständigen Kontext bitte die Quellen prüfen." },
  it: { news: "Riepilogo delle notizie recenti", materials: "Materiali trovati", found: "Ho trovato", articles: "articoli da", pages: "pagine da", sites: "siti", match: "che corrispondono alla domanda.", sorted: "Sono ordinati per data di pubblicazione.", important: "Materiali più pertinenti", sources: "Fonti da leggere", checked: "Ricerca effettuata", newsLimit: "Sono brevi riassunti di estratti, non una rassegna completa. Gli estratti possono restare nella lingua originale.", generalLimit: "Sono estratti selezionati da pagine pubbliche. Consulta le fonti per il contesto completo." },
  pt: { news: "Resumo das notícias recentes", materials: "Materiais encontrados", found: "Encontrei", articles: "artigos de", pages: "páginas de", sites: "sites", match: "que correspondem à pergunta.", sorted: "Estão ordenados por data de publicação.", important: "Materiais mais relevantes", sources: "Fontes para consultar", checked: "Pesquisa realizada", newsLimit: "São resumos breves de trechos, não uma revisão completa. Os trechos podem permanecer no idioma original.", generalLimit: "São trechos selecionados de páginas públicas. Consulte as fontes para obter o contexto completo." },
  ru: { news: "Обзор последних новостей", materials: "Найденные материалы", found: "Найдено", articles: "статей из", pages: "страниц из", sites: "сайтов", match: "по теме вопроса.", sorted: "Материалы расположены по дате публикации.", important: "Наиболее подходящие материалы", sources: "Источники", checked: "Проверено", newsLimit: "Это краткие обзоры фрагментов, а не полный анализ всех событий. Фрагменты могут остаться на языке источника.", generalLimit: "Это выбранные фрагменты общедоступных страниц. Проверьте источники для полного контекста." },
  uk: { news: "Огляд останніх новин", materials: "Знайдені матеріали", found: "Знайдено", articles: "статей із", pages: "сторінок із", sites: "сайтів", match: "за темою запитання.", sorted: "Матеріали впорядковано за датою публікації.", important: "Найбільш відповідні матеріали", sources: "Джерела для читання", checked: "Перевірено", newsLimit: "Це короткі огляди фрагментів, а не повний аналіз усіх подій. Фрагменти можуть залишатися мовою джерела.", generalLimit: "Це вибрані фрагменти відкритих сторінок. Перегляньте джерела для повного контексту." },
  ja: { news: "最新ニュースの概要", materials: "見つかった資料", found: "見つかった", articles: "件の記事（サイト数:", pages: "件のページ（サイト数:", sites: "", match: "質問に関連しています。", sorted: "公開日順に並べています。", important: "関連性の高い資料", sources: "参照元", checked: "確認日時", newsLimit: "記事の抜粋を短くまとめたもので、すべての出来事を網羅するものではありません。抜粋は元の言語の場合があります。", generalLimit: "公開ページから選んだ抜粋です。詳しい内容は参照元をご確認ください。" },
  zh: { news: "近期新闻概览", materials: "找到的资料", found: "找到", articles: "篇文章，来自", pages: "个页面，来自", sites: "个网站", match: "与问题相关。", sorted: "按发布日期排序。", important: "最相关的资料", sources: "参考来源", checked: "查询时间", newsLimit: "这些是文章片段的简短摘要，并非对所有事件的完整综述。片段可能保留原文语言。", generalLimit: "这些是公开网页中的精选片段。完整背景请查看来源。" },
  ar: { news: "موجز أحدث الأخبار", materials: "المواد التي تم العثور عليها", found: "تم العثور على", articles: "مقالات من", pages: "صفحات من", sites: "مواقع", match: "ذات صلة بالسؤال.", sorted: "مرتبة حسب تاريخ النشر.", important: "أهم المواد ذات الصلة", sources: "مصادر للقراءة", checked: "وقت التحقق", newsLimit: "هذه ملخصات قصيرة لمقتطفات وليست مراجعة كاملة لكل الأحداث. قد تبقى المقتطفات باللغة الأصلية.", generalLimit: "هذه مقتطفات مختارة من صفحات عامة. راجع المصادر للاطلاع على السياق الكامل." },
  hi: { news: "हाल की खबरों का सार", materials: "मिली हुई सामग्री", found: "मिलीं", articles: "लेख", pages: "पृष्ठ", sites: "वेबसाइटों से", match: "जो प्रश्न से संबंधित हैं।", sorted: "इन्हें प्रकाशन तिथि के अनुसार क्रमबद्ध किया गया है।", important: "सबसे उपयोगी सामग्री", sources: "पढ़ने के स्रोत", checked: "जाँच का समय", newsLimit: "ये लेखों के अंशों के संक्षिप्त सार हैं, सभी घटनाओं की पूरी समीक्षा नहीं। अंश मूल भाषा में हो सकते हैं।", generalLimit: "ये सार्वजनिक पृष्ठों से चुने गए अंश हैं। पूरा संदर्भ देखने के लिए स्रोत पढ़ें।" },
  tr: { news: "Son haberlerin özeti", materials: "Bulunan materyaller", found: "Bulundu:", articles: "makale, kaynak:", pages: "sayfa, kaynak:", sites: "web sitesi", match: "soruyla ilgili.", sorted: "Yayın tarihine göre sıralandı.", important: "En ilgili materyaller", sources: "Kaynaklar", checked: "Kontrol zamanı", newsLimit: "Bunlar kısa alıntı özetleridir; tüm olayların kapsamlı bir incelemesi değildir. Alıntılar özgün dilinde olabilir.", generalLimit: "Bunlar herkese açık sayfalardan seçilmiş alıntılardır. Tam bağlam için kaynakları inceleyin." }
};

export function getResearchLabels(language) {
  return RESEARCH_LABELS[language] || RESEARCH_LABELS.en;
}

const MEDIA_MESSAGES = {
  pl: {
    read: "🐨 Nie mogę odczytać treści ani ukrytych poleceń ze zdjęcia lub filmu. Wklej pytanie jako tekst, a odpowiem na podstawie tej wiadomości.",
    generate: "🐨 Ta wersja Koala.ai nie tworzy jeszcze obrazów ani filmów. Mogę za to pomóc napisać opis lub scenariusz jako tekst.",
    attachment: "🐨 Nie mogę odczytywać poleceń ani treści z przesłanych zdjęć lub filmów. Wklej pytanie jako tekst, a postaram się pomóc."
  },
  en: {
    read: "🐨 I can’t read text or hidden instructions from an image or video. Paste the question as text and I’ll answer from that message.",
    generate: "🐨 This version of Koala.ai can’t create images or videos yet. I can help write a description or script as text.",
    attachment: "🐨 I can’t read instructions or text from uploaded images or videos. Paste the question as text and I’ll try to help."
  },
  es: {
    read: "🐨 No puedo leer texto ni instrucciones ocultas de una imagen o un vídeo. Copia la pregunta como texto y responderé a partir de ella.",
    generate: "🐨 Esta versión de Koala.ai todavía no puede crear imágenes ni vídeos. Puedo ayudarte a escribir una descripción o un guion.",
    attachment: "🐨 No puedo leer instrucciones ni texto de imágenes o vídeos adjuntos. Copia la pregunta como texto y trataré de ayudarte."
  },
  fr: {
    read: "🐨 Je ne peux pas lire le texte ni les consignes cachées dans une image ou une vidéo. Colle la question sous forme de texte.",
    generate: "🐨 Cette version de Koala.ai ne peut pas encore créer d’images ni de vidéos. Je peux aider à rédiger une description ou un scénario.",
    attachment: "🐨 Je ne peux pas lire le texte ou les consignes des images et vidéos jointes. Colle la question sous forme de texte."
  },
  de: {
    read: "🐨 Ich kann keinen Text und keine versteckten Anweisungen aus einem Bild oder Video lesen. Füge die Frage als Text ein.",
    generate: "🐨 Diese Version von Koala.ai kann noch keine Bilder oder Videos erstellen. Ich kann dir beim Schreiben einer Beschreibung oder eines Skripts helfen.",
    attachment: "🐨 Ich kann keine Anweisungen oder Texte aus angehängten Bildern oder Videos lesen. Füge die Frage als Text ein."
  },
  ru: {
    read: "🐨 Я не могу прочитать текст или скрытые инструкции на изображении или в видео. Вставьте вопрос текстом.",
    generate: "🐨 Эта версия Koala.ai пока не умеет создавать изображения и видео. Я могу помочь написать описание или сценарий.",
    attachment: "🐨 Я не могу читать инструкции или текст из прикреплённых изображений и видео. Вставьте вопрос текстом."
  },
  uk: {
    read: "🐨 Я не можу прочитати текст або приховані інструкції на зображенні чи у відео. Вставте запитання текстом.",
    generate: "🐨 Ця версія Koala.ai поки не створює зображення й відео. Я можу допомогти написати опис або сценарій.",
    attachment: "🐨 Я не можу читати інструкції або текст із доданих зображень і відео. Вставте запитання текстом."
  },
  ja: {
    read: "🐨 画像や動画に含まれる文章や隠れた指示は読み取れません。質問をテキストで入力してください。",
    generate: "🐨 このKoala.aiはまだ画像や動画を生成できません。説明文や台本なら一緒に作れます。",
    attachment: "🐨 添付された画像や動画の指示や文章は読み取れません。質問をテキストで入力してください。"
  },
  zh: {
    read: "🐨 我无法读取图片或视频中的文字和隐藏指令。请把问题以文字形式粘贴过来。",
    generate: "🐨 当前版本的 Koala.ai 还不能生成图片或视频，但可以帮你写描述或脚本。",
    attachment: "🐨 我无法读取所附图片或视频中的指令和文字。请把问题以文字形式粘贴过来。"
  }
};

export function getMediaMessage(language, kind) {
  return (MEDIA_MESSAGES[language] || MEDIA_MESSAGES.en)[kind] || MEDIA_MESSAGES.en.read;
}
