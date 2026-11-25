/* Proste narzędzia dydaktyczne budowane wyłącznie z lokalnej bazy wiedzy. */

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

export function createFlashcards(item) {
  if (!item) return null;
  const title = clean(item.title);
  const cards = [
    ["Co oznacza „" + title + "”?", clean(item.short)],
    ["Jak rozpoznać lub wyjaśnić „" + title + "”?", clean(item.explanation)],
    ["Jaki przykład pomoże zapamiętać „" + title + "”?", clean(item.example)]
  ].filter(([, answer]) => answer);

  const related = clean(item.related);
  if (related) cards.push(["Z czym warto połączyć temat „" + title + "”?", related]);

  const sections = cards.map(([question, answer], index) =>
    "### " + (index + 1) + ". " + question + "\n" + answer
  ).join("\n\n");
  return "## 🐨 Fiszki: " + title + "\n\n" + sections
    + "\n\nZakryj odpowiedź i spróbuj przypomnieć ją sobie przed odsłonięciem.";
}
