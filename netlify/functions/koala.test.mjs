import test from "node:test";
import assert from "node:assert/strict";
import { answerQuestion, knowledge } from "../koala-engine.mjs";
import handler from "../koala.mjs";
import { detectQuestionLanguage, getResearchLabels, LANGUAGE_PROFILES } from "./languages.mjs";

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

test("language support recognizes 75 profiles and localizes research labels", () => {
  assert.ok(LANGUAGE_PROFILES.length >= 75);
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
    ["Create an image of a plant cell", "image"]
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
