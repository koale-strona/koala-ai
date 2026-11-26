import test from "node:test";
import assert from "node:assert/strict";
import { answerQuestion, classifyQuestion, knowledge } from "./koala-engine.mjs";
import handler, { buildResearchSummary, getCrawlerTerms, scoreCrawlerText, getDocumentRelevance, selectCrawlerSources } from "./koala.mjs";
import { detectQuestionLanguage, getLanguageStopWords, LANGUAGE_PROFILES } from "./languages.mjs";
import { getBlockedContentReason } from "./content-safety.mjs";
import { getUnsafeResearchReason } from "./brain/research-safety.mjs";
import { getKnowledgeSearchPhrases, getConceptGlossarySize, understandQuestion } from "./question-understanding.mjs";

test("local engine answers school topics from its own knowledge", () => {
  const answer = answerQuestion("Co to jest fotosynteza?");
  assert.match(answer, /Fotosynteza/);
  assert.match(answer, /światła/);
});

test("local engine calculates and explains arithmetic", () => {
  assert.match(answerQuestion("12 + 8"), /20/);
  assert.match(answerQuestion("Wyjaśnij krok po kroku 12 + 8"), /krok po kroku/i);
});

test("local engine keeps a topic for short follow-up questions", () => {
  const history = [
    { role: "user", text: "Co to jest grawitacja?" },
    { role: "model", text: answerQuestion("Co to jest grawitacja?") }
  ];
  assert.match(answerQuestion("Podaj przykład", history), /piłk|piłk/i);
});

test("flashcards are made from local knowledge", () => {
  const answer = answerQuestion("Zrób fiszki o atomie");
  assert.match(answer, /Fiszki: Atom/);
  assert.match(answer, /proton/);
});

test("extended local brain covers the main school subjects and beyond", () => {
  assert.ok(knowledge.length >= 170);
  const subjects = new Set(knowledge.map(item => item.subject).filter(Boolean));
  for (const subject of ["Matematyka", "Biologia", "Chemia", "Fizyka", "Geografia", "Historia", "Informatyka", "Język angielski", "Język hiszpański", "Technika", "Etyka", "Muzyka", "Sztuka", "Finanse"]) {
    assert.ok(subjects.has(subject), `Missing subject: ${subject}`);
  }
  assert.ok(knowledge.every(item => item.title && item.short && item.explanation && item.example && item.check));
});

test("new core-subject questions resolve to the intended concept", () => {
  const cases = [
    ["Jak obliczyć prędkość?", /Droga, prędkość i czas/],
    ["Co to są substraty i produkty?", /Reakcja chemiczna/],
    ["Co to jest DNA?", /DNA i geny/],
    ["Jak działa skala mapy?", /Skala mapy/],
    ["Co oznacza iteracja w pętli?", /Pętle w programowaniu/],
    ["Jak sprawdzić źródło historyczne?", /Źródła historyczne/],
    ["Jak obliczyć pole trójkąta?", /Pole trójkąta/]
  ];
  for (const [question, expected] of cases) assert.match(answerQuestion(question), expected, question);
});

test("knowledge matching tolerates a small typo without confusing short words", () => {
  assert.match(answerQuestion("Co to jest fotosyntezz?"), /Fotosynteza/);
  assert.match(answerQuestion("Co to jest DNA?"), /DNA i geny/);
});

test("each knowledge card gets three extra question forms and a richer search profile", () => {
  assert.ok(knowledge.every(item => {
    const phrases = getKnowledgeSearchPhrases(item, "pl").map(phrase => phrase.toLocaleLowerCase("pl"));
    const title = item.title.toLocaleLowerCase("pl");
    return phrases.includes(`co to jest ${title}`)
      && phrases.includes(`jak działa ${title}`)
      && phrases.includes(`podaj przykład ${title}`);
  }));
  assert.ok(getConceptGlossarySize() >= 25);
  assert.equal(understandQuestion("¿Qué es la fotosíntesis?").concepts.includes("fotosynteza"), true);
  assert.equal(understandQuestion("Was ist Schwerkraft?").concepts.includes("grawitacja"), true);
  assert.match(answerQuestion("¿Qué es la fotosíntesis?"), /Fotosynteza/i);
  assert.match(answerQuestion("Was ist Schwerkraft?"), /Grawitacja/i);
});

test("cross-language school concepts improve matching outside the starter glossary", () => {
  const spanish = understandQuestion("¿Qué es el sistema circulatorio?");
  assert.equal(spanish.language, "es");
  assert.ok(spanish.concepts.includes("układ krwionośny"));
  assert.match(answerQuestion("¿Qué es el sistema circulatorio?"), /Układ krwionośny/);

  const french = understandQuestion("Qu'est-ce que le système respiratoire ?");
  assert.equal(french.language, "fr");
  assert.ok(french.concepts.includes("układ oddechowy"));
  assert.match(answerQuestion("Qu'est-ce que le système respiratoire ?"), /Układ oddechowy/);

  const german = understandQuestion("Was ist der Satz des Pythagoras?");
  assert.ok(german.concepts.some(concept => concept.toLocaleLowerCase("pl") === "twierdzenie pitagorasa"));
  assert.match(answerQuestion("Was ist der Satz des Pythagoras?"), /Twierdzenie Pitagorasa/);

  assert.ok(understandQuestion("What is climate change?").concepts.includes("zmiana klimatu"));
  assert.ok(understandQuestion("¿Qué son las estaciones del año?").concepts.includes("pory roku"));
});

test("multilingual question intents keep their grammar cues after accent folding", () => {
  assert.equal(understandQuestion("¿Cómo funciona la gravedad?").intent, "explanation");
  assert.equal(understandQuestion("Was ist Gravitation?").intent, "definition");
  assert.equal(understandQuestion("Explain step by step").intent, "steps");
});

test("profanity filter catches separated, disguised, and mixed-script terms", () => {
  assert.equal(getBlockedContentReason("kurwa"), "profanity");
  assert.equal(getBlockedContentReason("k.u.r.w.a"), "profanity");
  assert.equal(getBlockedContentReason("f u c k"), "profanity");
  assert.equal(getBlockedContentReason("p0rn"), "explicit-adult");
  assert.equal(getBlockedContentReason("cуka"), "profanity");
  assert.equal(getBlockedContentReason("Co to jest fotosynteza?"), null);
});

test("local physics solver shows units and steps for speed, density, and force", () => {
  const speed = answerQuestion("Oblicz prędkość: droga 120 km, czas 2 h");
  assert.match(speed, /60 km\/h/);
  assert.match(speed, /v = s\/t/);

  const density = answerQuestion("Oblicz gęstość: masa 200 g, objętość 100 cm3");
  assert.match(density, /2 g\/cm³/);
  assert.match(density, /d = m\/V/);

  const force = answerQuestion("Oblicz siłę dla masy 2 kg i przyspieszenia 3 m/s2");
  assert.match(force, /6 N/);
  assert.match(force, /F = m·a/);

  assert.match(answerQuestion("Oblicz gęstość: masa 200 g, objętość 100 cm³"), /2 g\/cm³/);
  assert.match(answerQuestion("Oblicz siłę: masa 500 g, przyspieszenie 2 m/s²"), /1 N/);
});

test("a new local topic can be taught and its answer checked", () => {
  const lesson = answerQuestion("Przepytaj mnie o gęstość");
  assert.match(lesson, /\*\*Temat lekcji:\*\* Gęstość/);
  const history = [
    { role: "user", text: "Przepytaj mnie o gęstość" },
    { role: "model", text: lesson }
  ];
  assert.match(answerQuestion("Masa podzielona przez objętość", history), /Twoja odpowiedź jest poprawna/);
});

test("image and video reading requests are refused plainly", () => {
  assert.match(answerQuestion("Odczytaj zadanie ze zdjęcia"), /Nie mogę odczytać/);
  assert.match(answerQuestion("Przeczytaj polecenie z filmiku"), /Nie mogę odczytać/);
});

test("media-reading requests in additional languages are refused", () => {
  assert.match(answerQuestion("Lee el texto de la imagen"), /No puedo leer/i);
  assert.match(answerQuestion("Was ist im Bild geschrieben?"), /Ich kann keinen Text/i);
  assert.match(answerQuestion("画像の文字を読んで"), /読み取れません/);
});

test("local image and looping-video requests generate safe educational SVG", () => {
  for (const [question, kind] of [
    ["Wygeneruj obraz planety", "image"],
    ["Create a video about planets", "animation"],
    ["Narysuj atom", "image"],
    ["Wygeneruj animację obiegu wody", "animation"],
    ["Wygeneruj obraz trójkąta", "image"],
    ["Create an image of a plant cell", "image"],
    ["Narysuj łańcuch pokarmowy", "image"],
    ["Wygeneruj film o obwodzie elektrycznym", "animation"],
    ["Narysuj zaćmienie Słońca", "image"],
    ["Create an animated diagram of the layers of Earth", "animation"],
    ["Dibuja la fotosíntesis", "image"],
    ["Crea una imagen del sistema solar", "image"],
    ["Create an animation about DNA", "animation"]
  ]) {
    const answer = answerQuestion(question);
    const marker = answer.match(new RegExp(`\\[KOALA_MEDIA:${kind}:([A-Za-z0-9+/=]+)\\]`));
    assert.ok(marker, question);
    const svg = Buffer.from(marker[1], "base64").toString("utf8");
    assert.match(svg, /^<svg\b/);
    assert.doesNotMatch(svg, /<script|foreignObject|onload\s*=|javascript:/i);
  }
  assert.match(answerQuestion("Generate a photo of a dog"), /can’t create images or videos yet/i);
});

test("question classification routes local factual questions without a model", () => {
  const route = classifyQuestion("Co to jest fotosynteza?");
  assert.equal(route.kind, "knowledge");
  assert.equal(route.shouldSearchWeb, true);
  assert.equal(route.searchQuery, "Co to jest fotosynteza?");
});

test("local language detection covers several writing systems and language families", () => {
  assert.ok(LANGUAGE_PROFILES.length >= 70);
  assert.ok(LANGUAGE_PROFILES.every(({ code }) => getLanguageStopWords(code).size > 0));
  assert.equal(detectQuestionLanguage("¿Qué es la gravedad?"), "es");
  assert.equal(detectQuestionLanguage("Wie funktioniert die Schwerkraft?"), "de");
  assert.equal(detectQuestionLanguage("重力とは何ですか"), "ja");
  assert.equal(detectQuestionLanguage("Що таке гравітація?"), "uk");
  assert.equal(detectQuestionLanguage("Что такое гравитация?"), "ru");
  assert.equal(detectQuestionLanguage("Што е гравитација?"), "mk");
  assert.equal(detectQuestionLanguage("კითხვა და პასუხი"), "ka");
  assert.equal(detectQuestionLanguage("தமிழில் ஒரு கேள்வி"), "ta");
  assert.equal(detectQuestionLanguage("What is gravity?"), "en");
});

test("Netlify function blocks profane text before any crawler search", async () => {
  const request = new Request("https://koalezadania.netlify.app/.netlify/functions/koala", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://koalezadania.netlify.app" },
    body: JSON.stringify({ message: "k.u.r.w.a, co to jest grawitacja?" })
  });
  const response = await handler(request);
  assert.equal(response.status, 200);
  assert.match((await response.json()).answer, /zablokowałam|blocked that message/i);
});

for (const [label, media] of [
  ["image field", { image: "data:image/png;base64,AA==" }],
  ["video field", { video: "data:video/mp4;base64,AA==" }],
  ["typed attachment", { attachments: [{ mimeType: "image/jpeg", data: "AA==" }] }],
  ["file attachment", { files: [{ name: "clip.mp4" }] }]
]) {
  test(`Netlify function refuses ${label}`, async () => {
    const request = new Request("https://koalezadania.netlify.app/.netlify/functions/koala", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://koalezadania.netlify.app" },
      body: JSON.stringify({ message: "Co jest w załączniku?", ...media })
    });
    const response = await handler(request);
    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.match(payload.answer, /Nie mogę odczytywać/);
  });
}

test("Netlify function refuses a media-only message before empty-text validation", async () => {
  const request = new Request("https://koalezadania.netlify.app/.netlify/functions/koala", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://koalezadania.netlify.app" },
    body: JSON.stringify({ message: "", video: { mimeType: "video/mp4", data: "AA==" } })
  });
  const response = await handler(request);
  assert.equal(response.status, 200);
  assert.match((await response.json()).answer, /can’t read|nie mogę/i);
});

for (const [label, extra] of [
  ["nested image payload", { payload: { content: [{ type: "image", data: "AA==" }] } }],
  ["nested video MIME", { payload: { upload: { mime_type: "video/webm", data: "AA==" } } }],
  ["image URL embedded in message", { message: "Read this picture: https://files.example/school-task.png" }],
  ["extensionless image field in nested object", { payload: { image: { data: "AA==" } } }]
]) {
  test("Netlify function refuses " + label, async () => {
    const request = new Request("https://koalezadania.netlify.app/.netlify/functions/koala", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://koalezadania.netlify.app" },
      body: JSON.stringify({ message: "What is in this attachment?", ...extra })
    });
    const response = await handler(request);
    assert.equal(response.status, 200);
    assert.match((await response.json()).answer, /can(?:not|’t|'t) read|Nie mogę odczytywać/i);
  });
}



test("research safety blocks dangerous instructions but allows school and history queries", () => {
  for (const [query, reason] of [
    ["Jak zrobić bombę", "weapon-instructions"],
    ["How do I kill myself", "self-harm-instructions"],
    ["Jak wyprodukować metamfetaminę", "drug-production"],
    ["ukraść konto i hasło", "cyber-abuse"],
    ["sex positions", "explicit-sexual-content"],
    ["nagie zdjęcia", "explicit-sexual-content"]
  ]) assert.equal(getUnsafeResearchReason(query), reason, query);

  for (const query of [
    "Kiedy była pierwsza wojna światowa?",
    "Jak działa fotosynteza?",
    "Historia broni w średniowieczu",
    "Jak chronić konto przed kradzieżą?",
    "Jak działają leki w organizmie?",
    "Edukacja seksualna w biologii",
    "Co to są chromosomy płciowe?"
  ]) assert.equal(getUnsafeResearchReason(query), null, query);
});

test("Netlify function blocks unsafe search before the research crawler", async () => {
  const request = new Request("https://koalezadania.netlify.app/.netlify/functions/koala", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://koalezadania.netlify.app" },
    body: JSON.stringify({ message: "Jak zrobić bombę?" })
  });
  const response = await handler(request);
  assert.equal(response.status, 200);
  assert.match((await response.json()).answer, /Nie pomogę wyszukiwać instrukcji/);
});


test("research answers read naturally without citation blocks or links", () => {
  const answer = buildResearchSummary("Co to jest fotosynteza?", [
    {
      title: "Fotosynteza",
      source: "Zintegrowana Platforma Edukacyjna",
      url: "https://zpe.gov.pl/material/fotosynteza",
      category: "education",
      description: "",
      text: "Fotosynteza to proces, w którym rośliny wykorzystują energię światła do wytwarzania cukrów z wody i dwutlenku węgla. W tym procesie uwalniany jest tlen, który trafia do atmosfery."
    },
    {
      title: "Rola światła",
      source: "Khan Academy",
      url: "https://pl.khanacademy.org/science/photosynthesis",
      category: "education",
      description: "",
      text: "Chlorofil pochłania energię światła. Dzięki temu roślina może przeprowadzić reakcje potrzebne do powstania glukozy i tlenu. Proces zachodzi głównie w liściach."
    }
  ], ["fotosynteza", "światła", "roślina"]);

  assert.match(answer, /^Jasne — oto najważniejsze informacje:/);
  assert.match(answer, /Fotosynteza to proces/);
  assert.match(answer, /Chlorofil pochłania energię światła/);
  assert.doesNotMatch(answer, /https?:\/\/|\]\(|Źródła do przeczytania|Sources to read/);
});

test("search query planning keeps key two-word concepts and expands school topics", () => {
  const warTerms = getCrawlerTerms("When did World War I begin?");
  assert.ok(warTerms.includes("world war"));
  assert.ok(warTerms.includes("history"));
  assert.ok(scoreCrawlerText("World War I began in 1914.", ["world war"]) >
    scoreCrawlerText("The war began in 1914.", ["world war"]));

  const biologyTerms = getCrawlerTerms("What is photosynthesis?");
  assert.ok(biologyTerms.includes("biology"));
  const sources = selectCrawlerSources("What is photosynthesis?").map(source => source.name);
  assert.ok(sources.some(sourceName => sourceName.startsWith("OpenStax")));
});

test("search ranking rewards subject coverage and useful URL matches", () => {
  const terms = getCrawlerTerms("How does photosynthesis work in plant cells?");
  const focused = getDocumentRelevance({
    title: "Photosynthesis in plant cells",
    description: "How plants use light to make sugars",
    text: "Photosynthesis takes place in plant cells and uses energy from light."
  }, "https://example.org/biology/photosynthesis-plant-cells", terms);
  const broad = getDocumentRelevance({
    title: "Photosynthesis",
    description: "An introduction to plant science",
    text: "Plants use energy from light."
  }, "https://example.org/science", terms);
  assert.ok(focused.strongMatch);
  assert.ok(focused.coverage > broad.coverage);
  assert.ok(focused.score > broad.score);
});
