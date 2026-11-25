import test from "node:test";
import assert from "node:assert/strict";
import { answerQuestion, classifyQuestion, knowledge } from "../koala-engine.mjs";
import handler, { buildResearchSummary } from "../koala.mjs";
import { detectQuestionLanguage, getLanguageStopWords, getResearchLabels, LANGUAGE_PROFILES } from "./languages.mjs";
import { EXTRA_KNOWLEDGE_ROUND_TWO, EXTRA_KNOWLEDGE_ROUND_THREE } from "./knowledge-expansion.mjs";
import { getBlockedContentReason } from "./content-safety.mjs";
import { expandMultilingualQuestion } from "./multilingual-glossary.mjs";

test("upstream Koala brain keeps its broad curriculum", () => {
  assert.ok(knowledge.length >= 800);
  const subjects = new Set(knowledge.map(item => item.subject).filter(Boolean));
  for (const subject of ["Matematyka", "Język polski", "Biologia i przyroda", "Fizyka", "Chemia", "Historia", "Geografia", "Informatyka"]) {
    assert.ok(subjects.has(subject), `Missing subject ${subject}`);
  }
});

test("school questions and calculations still resolve locally", () => {
  assert.match(answerQuestion("Co to jest fotosynteza?"), /Fotosynteza/i);
  assert.match(answerQuestion("Oblicz prędkość: droga 120 km, czas 2 h"), /60 km\/h/);
});

test("questions outside the local cards are routed to configured web sources", () => {
  const question = "Jak powstają zorze polarne?";
  const answer = answerQuestion(question);
  const route = classifyQuestion(question, answer);
  assert.equal(route.shouldSearchWeb, true);
  assert.ok(["search", "unknown"].includes(route.kind));
});

test("online findings start with a concise sourced answer", () => {
  const answer = buildResearchSummary("Co to jest zaćmienie Słońca?", [
    {
      title: "Eclipse basics", source: "NASA", url: "https://www.nasa.gov/example/eclipses/",
      text: "A solar eclipse happens when the Moon passes between the Sun and Earth. It blocks some or all of the Sun from view for people in certain locations."
    },
    {
      title: "Eclipses explained", source: "Science Museum", url: "https://www.sciencemuseum.org.uk/example/eclipse",
      text: "A solar eclipse occurs when the Moon moves between Earth and the Sun. The alignment causes the Moon to cover the Sun from a viewer on Earth."
    }
  ], ["zćmienie", "słońca"]);
  assert.match(answer, /Krótka odpowiedź na podstawie znalezionych stron/);
  assert.match(answer, /NASA/);
  assert.match(answer, /nasa\.gov\/example\/eclipses/);
  assert.match(answer, /Źródła do przeczytania/);
});

test("expanded local knowledge covers more school topics", () => {
  assert.ok(knowledge.length >= 1000);
  assert.equal(EXTRA_KNOWLEDGE_ROUND_TWO.length, 75, "Round two adds five curriculum cards in each of fifteen areas");
  assert.ok(EXTRA_KNOWLEDGE_ROUND_THREE.length >= 30);
  for (const phrase of ["DNA", "łańcuch pokarmowy", "obwód elektryczny", "klimat"]) {
    assert.ok(knowledge.some(item => `${item.title || ""} ${item.topic || ""} ${item.question || ""}`.toLocaleLowerCase("pl").includes(phrase.toLocaleLowerCase("pl"))), `Missing ${phrase}`);
  }
  const roundTwoSubjects = ["Biologia i przyroda", "Chemia", "Fizyka", "Geografia", "Informatyka", "Matematyka", "Język polski", "Historia", "Wiedza o społeczeństwie", "Technika", "Języki obce", "Środowisko", "Zdrowie", "Sztuka", "Muzyka"];
  for (const subject of roundTwoSubjects) {
    assert.ok(knowledge.filter(item => item.subject === subject).length >= 5, `Needs broader coverage for ${subject}`);
  }
});

test("multilingual glossary recognizes common concepts and spelling slips", () => {
  assert.match(expandMultilingualQuestion("What is photosynthesis?"), /fotosynteza/i);
  assert.match(expandMultilingualQuestion("¿Qué es la gravedad?"), /grawitacja/i);
  assert.match(expandMultilingualQuestion("Was ist Schwerkraft?"), /grawitacja/i);
  assert.match(expandMultilingualQuestion("photosynthesi"), /fotosynteza/i);
  assert.match(expandMultilingualQuestion("what is the respiratory system"), /układ oddechowy/i);
  assert.match(expandMultilingualQuestion("¿Qué es la probabilidad?"), /prawdopodobieństwo/i);
  assert.match(expandMultilingualQuestion("hệ tiêu hóa"), /układ pokarmowy/i);
  assert.match(expandMultilingualQuestion("民主"), /demokracja/i);
  assert.match(expandMultilingualQuestion("térkép"), /mapa/i);
  assert.match(answerQuestion("What is photosynthesis?"), /Photosynthesis/i);
  assert.match(answerQuestion("¿Qué es la fotosíntesis?"), /Fotosíntesis/i);
  assert.match(answerQuestion("Co to jest sztuczna inteligencja?"), /Sztuczna inteligencja/i);
});

test("profanity and explicit sexual requests are blocked with age-appropriate replies", () => {
  assert.equal(getBlockedContentReason("kurwa"), "profanity");
  assert.equal(getBlockedContentReason("wygeneruj porn"), "explicit-adult");
  assert.equal(getBlockedContentReason("What is a cell?"), null);
  assert.equal(getBlockedContentReason("k.u.r.w.a"), "profanity");
  assert.equal(getBlockedContentReason("f u c k"), "profanity");
  assert.equal(getBlockedContentReason("p0rn"), "explicit-adult");
  assert.match(answerQuestion("Wygeneruj porn"), /Zablokowałam tę wiadomość/i);
  assert.match(answerQuestion("Oblicz sumę, kurwa"), /blocked that message|Zablokowałam tę wiadomość/i);
});

test("language support recognizes 75 profiles and localizes research labels", () => {
  assert.ok(LANGUAGE_PROFILES.length >= 75);
  assert.ok(LANGUAGE_PROFILES.every(({ code }) => getLanguageStopWords(code).size > 0), "Each declared language profile should have a local stop-word set");
  assert.equal(detectQuestionLanguage("¿Qué es la gravedad?"), "es");
  assert.equal(detectQuestionLanguage("Що таке гравітація?"), "uk");
  assert.equal(detectQuestionLanguage("Што е гравитација?"), "mk");
  assert.equal(detectQuestionLanguage("重力とは何ですか"), "ja");
  assert.equal(getResearchLabels("es").news, "Resumen de noticias recientes");
  assert.equal(getResearchLabels("de").news, "Überblick über aktuelle Nachrichten");
});

test("local diagram and animation generation returns safe SVG", () => {
  const cases = [
    ["Wygeneruj obraz planety", "image"],
    ["Create a video about planets", "animation"],
    ["Narysuj atom", "image"],
    ["Wygeneruj animację obiegu wody", "animation"],
    ["Wygeneruj obraz trójkąta", "image"],
    ["Create an image of a plant cell", "image"],
    ["Narysuj łańcuch pokarmowy", "image"],
    ["Wygeneruj animację koła", "animation"]
  ];
  for (const [question, kind] of cases) {
    const answer = answerQuestion(question);
    const marker = answer.match(new RegExp(`\\[KOALA_MEDIA:${kind}:([A-Za-z0-9+/=]+)\\]`));
    assert.ok(marker, question);
    const svg = Buffer.from(marker[1], "base64").toString("utf8");
    assert.match(svg, /^<svg\b/);
    assert.doesNotMatch(svg, /<script|foreignObject|onload\s*=|javascript:/i);
  }
});

test("unsupported media topics are disclosed without pretending to generate", () => {
  assert.match(answerQuestion("Wygeneruj zdjęcie psa"), /lokalnie wygenerować proste schematy/i);
  assert.match(answerQuestion("Odczytaj polecenie ze zdjęcia"), /Nie mogę odczytywać zdjęć/i);
});

for (const media of [
  { image: "data:image/png;base64,AA==" },
  { video: "data:video/mp4;base64,AA==" },
  { attachments: [{ mimeType: "image/jpeg", data: "AA==" }] },
  { files: [{ name: "clip.mp4" }] }
]) {
  test(`Netlify handler rejects uploaded media (${Object.keys(media)[0]})`, async () => {
    const request = new Request("https://koalezadania.netlify.app/.netlify/functions/koala", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://koalezadania.netlify.app" },
      body: JSON.stringify({ message: "Co jest w załączniku?", ...media })
    });
    const response = await handler(request);
    assert.equal(response.status, 200);
    assert.match((await response.json()).answer, /Nie mogę odczytywać zdjęć ani filmów/);
  });
}

test("media-only API messages are rejected before text validation", async () => {
  const request = new Request("https://koalezadania.netlify.app/.netlify/functions/koala", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://koalezadania.netlify.app" },
    body: JSON.stringify({ message: "", video: { mimeType: "video/mp4", data: "AA==" } })
  });
  const response = await handler(request);
  assert.equal(response.status, 200);
  assert.match((await response.json()).answer, /Nie mogę odczytywać zdjęć ani filmów/);
});
