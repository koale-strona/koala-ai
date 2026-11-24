/*
 * Prosty generator edukacyjnych ilustracji i animacji SVG.
 * Wszystkie obrazy są składane lokalnie z własnych kształtów, bez usług i API.
 * To nie jest generator fotorealistycznych obrazów ani plików MP4.
 */

function fold(value) {
  return String(value || "").toLocaleLowerCase("pl-PL")
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function solarSystem(animated) {
  const motion = animated
    ? '<animateMotion dur="8s" repeatCount="indefinite" path="M 510,245 A 150,90 0 1,1 509,246"/>'
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 440" role="img" aria-labelledby="title desc">
<title id="title">Układ Słoneczny</title><desc id="desc">Schemat Słońca i orbit planet</desc>
<defs><radialGradient id="space"><stop stop-color="#182b52"/><stop offset="1" stop-color="#080d1b"/></radialGradient><radialGradient id="sun"><stop stop-color="#fff4a8"/><stop offset="1" stop-color="#ff8a24"/></radialGradient></defs>
<rect width="720" height="440" rx="28" fill="url(#space)"/><text x="36" y="52" fill="#fff" font-size="26" font-family="sans-serif" font-weight="700">Układ Słoneczny</text><text x="36" y="80" fill="#b8c7e8" font-size="14" font-family="sans-serif">Schemat poglądowy — odległości i rozmiary nie są w skali</text>
<g fill="none" stroke="#536481" stroke-opacity=".5">${[74,105,136,169,210,252,294].map((r) => `<ellipse cx="360" cy="245" rx="${r}" ry="${Math.round(r * .58)}"/>`).join("")}</g>
<circle cx="360" cy="245" r="28" fill="url(#sun)"/><text x="360" y="300" text-anchor="middle" fill="#ffe6a4" font-size="13" font-family="sans-serif">Słońce</text>
<g fill="#d7dce8"><circle cx="434" cy="245" r="4"/><circle cx="459" cy="245" r="6"/></g><circle cx="496" cy="245" r="7" fill="#4aa5d8"/><circle cx="529" cy="245" r="5" fill="#d86c50"/><circle cx="570" cy="245" r="16" fill="#d7a46a"/><circle cx="612" cy="245" r="13" fill="#e5ce98"/><circle cx="654" cy="245" r="10" fill="#79cbd3"/>
<g fill="#d8e4ff" font-size="12" font-family="sans-serif"><text x="420" y="274">Merkury</text><text x="452" y="288">Wenus</text><text x="485" y="269">Ziemia</text><text x="517" y="286">Mars</text><text x="550" y="274">Jowisz</text><text x="598" y="286">Saturn</text><text x="634" y="272">Uran</text></g>
${animated ? `<circle cx="0" cy="0" r="5" fill="#80eaff">${motion}</circle><circle cx="0" cy="0" r="4" fill="#ffb170"><animateMotion dur="5s" repeatCount="indefinite" path="M 465,245 A 105,60 0 1,1 464,246"/></circle>` : ""}
</svg>`;
}

function atom(animated) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 440" role="img" aria-labelledby="title desc"><title id="title">Schemat atomu</title><desc id="desc">Jądro atomowe i elektrony na orbitach</desc><defs><radialGradient id="bg"><stop stop-color="#153c55"/><stop offset="1" stop-color="#091321"/></radialGradient></defs><rect width="720" height="440" rx="28" fill="url(#bg)"/><text x="36" y="52" fill="#fff" font-size="26" font-family="sans-serif" font-weight="700">Budowa atomu</text><text x="36" y="80" fill="#b8c7e8" font-size="14" font-family="sans-serif">Model poglądowy — nie pokazuje rzeczywistych rozmiarów</text><g transform="translate(360 240)" fill="none" stroke="#7e9fc9" stroke-width="2"><ellipse rx="190" ry="72"/><ellipse rx="190" ry="72" transform="rotate(60)"/><ellipse rx="190" ry="72" transform="rotate(-60)"/></g><g fill="#ff7e79"><circle cx="349" cy="235" r="22"/><circle cx="372" cy="245" r="21"/><circle cx="360" cy="218" r="20"/></g><g fill="#dce8f8" font-family="sans-serif" font-size="13"><text x="340" y="240">p+</text><text x="363" y="250">n</text><text x="352" y="223">p+</text></g><g fill="#76e7ff"><circle cx="550" cy="240" r="9"/>${animated ? '<animateTransform attributeName="transform" type="rotate" from="0 360 240" to="360 360 240" dur="6s" repeatCount="indefinite"/>' : ""}</g><g fill="#e3edff" font-family="sans-serif" font-size="16"><text x="385" y="330">jądro: protony (+) i neutrony (0)</text><text x="450" y="214">elektron (−)</text></g></svg>`;
}

function waterCycle(animated) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 440" role="img" aria-labelledby="title desc"><title id="title">Obieg wody w przyrodzie</title><desc id="desc">Parowanie, skraplanie, opad i spływ wody</desc><rect width="720" height="440" rx="28" fill="#eaf7ff"/><text x="32" y="48" fill="#17466a" font-size="26" font-family="sans-serif" font-weight="700">Obieg wody w przyrodzie</text><circle cx="600" cy="108" r="38" fill="#ffd25c"/><path d="M0 330 Q150 302 300 330 T720 320 V440 H0Z" fill="#61b5df"/><path d="M0 350 Q130 330 250 350 T500 346" fill="none" stroke="#3a8eba" stroke-width="5"/><g fill="#fff" stroke="#9acde8" stroke-width="3"><ellipse cx="300" cy="128" rx="76" ry="30"/><circle cx="260" cy="120" r="30"/><circle cx="330" cy="111" r="38"/></g><g fill="#15557c" font-family="sans-serif" font-size="16" font-weight="600"><text x="80" y="220">parowanie</text><text x="263" y="190">skraplanie</text><text x="490" y="218">opad</text><text x="112" y="390">spływ i gromadzenie</text></g><path d="M180 320 C178 275 200 255 205 225 M400 170 C430 180 460 195 490 220 M500 260 C485 300 460 320 430 340" fill="none" stroke="#2786bd" stroke-width="5" stroke-linecap="round" stroke-dasharray="10 8" marker-end="url(#arrow)"/><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#2786bd"/></marker></defs>${animated ? '<path d="M490 230 C480 245 476 251 476 258 A14 14 0 0 0 504 258 C504 251 500 245 490 230" fill="#2589c2"><animateTransform attributeName="transform" type="translate" values="0 0;0 65;0 0" dur="3s" repeatCount="indefinite"/></path>' : ""}</svg>`;
}

function geometry(animated) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 440" role="img" aria-labelledby="title desc"><title id="title">Pole trójkąta</title><desc id="desc">Trójkąt z zaznaczoną podstawą i wysokością</desc><rect width="720" height="440" rx="28" fill="#111b35"/><text x="36" y="52" fill="#fff" font-size="26" font-family="sans-serif" font-weight="700">Pole trójkąta</text><path d="M160 350 L570 350 L435 120 Z" fill="#57b8d2" fill-opacity=".22" stroke="#79d8ec" stroke-width="5"/><path d="M435 120 L435 350" stroke="#ffd166" stroke-width="4" stroke-dasharray="9 7"/><path d="M435 338 L447 338 L447 350" fill="none" stroke="#ffd166" stroke-width="3"/><text x="353" y="390" fill="#e9f0ff" font-size="20" font-family="sans-serif">podstawa a</text><text x="450" y="245" fill="#ffd166" font-size="20" font-family="sans-serif">wysokość h</text><text x="203" y="140" fill="#fff" font-size="30" font-family="sans-serif" font-weight="700">P = a · h / 2</text>${animated ? '<circle cx="435" cy="120" r="8" fill="#fff"><animate attributeName="r" values="6;12;6" dur="1.5s" repeatCount="indefinite"/></circle>' : ""}</svg>`;
}

function cell(animated) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 440" role="img" aria-labelledby="title desc"><title id="title">Komórka roślinna</title><desc id="desc">Schemat ściany komórkowej, błony, jądra i chloroplastów</desc><rect width="720" height="440" rx="28" fill="#10241f"/><text x="36" y="52" fill="#fff" font-size="26" font-family="sans-serif" font-weight="700">Komórka roślinna</text><rect x="150" y="105" width="420" height="260" rx="85" fill="#76bd6b" fill-opacity=".3" stroke="#a6df88" stroke-width="12"/><rect x="165" y="120" width="390" height="230" rx="74" fill="none" stroke="#e1f2a3" stroke-width="3"/><circle cx="360" cy="235" r="62" fill="#bd92ed" fill-opacity=".75" stroke="#e4c9ff" stroke-width="3"/><circle cx="360" cy="235" r="15" fill="#f4e5ff"/><g fill="#75e0b4" stroke="#c4ffe8" stroke-width="2"><ellipse cx="245" cy="185" rx="31" ry="14"/><ellipse cx="470" cy="290" rx="31" ry="14"/><ellipse cx="270" cy="305" rx="31" ry="14"/></g><g fill="#f2f7df" font-family="sans-serif" font-size="16"><text x="190" y="386">ściana i błona</text><text x="390" y="228">jądro</text><text x="212" y="165">chloroplast</text><text x="390" y="350">cytoplazma</text></g>${animated ? '<circle cx="245" cy="185" r="4" fill="#fff"><animate attributeName="opacity" values=".3;1;.3" dur="2s" repeatCount="indefinite"/></circle>' : ""}</svg>`;
}

const TOPICS = [
  { test: /uklad sloneczny|planeta|planety|solar system|planets?/, name: "Układ Słoneczny", draw: solarSystem },
  { test: /atom|proton|neutron|electron/, name: "Budowa atomu", draw: atom },
  { test: /obieg\w* wody|cykl\w* wod\w*|water cycle/, name: "Obieg wody", draw: waterCycle },
  { test: /trojkat|geometr|triangle|geometry/, name: "Geometria", draw: geometry },
  { test: /komork|cell|chloroplast/, name: "Komórka roślinna", draw: cell }
];

export function generateEducationalMedia(prompt) {
  const text = fold(prompt);
  const isGeneration = /\b(wygeneruj|stworz|narysuj|zrob|generate|create|draw|make|animuj)\b/.test(text);
  if (!isGeneration) return null;

  const topic = TOPICS.find(item => item.test.test(text));
  if (!topic) return null;
  const animated = /\b(film|wideo|video|animac\w*|animation|clip)\b/.test(text);
  const svg = topic.draw(animated);
  const encoded = Buffer.from(svg, "utf8").toString("base64");
  const kind = animated ? "animation" : "image";
  const description = animated
    ? `Przygotowałam lokalną, zapętloną animację edukacyjną SVG: **${topic.name}**. To animacja wektorowa, nie plik MP4.`
    : `Wygenerowałam lokalną ilustrację edukacyjną SVG: **${topic.name}**. To schemat poglądowy, nie fotorealistyczne zdjęcie.`;
  return `## 🐨 ${topic.name}\n\n${description}\n\n[KOALA_MEDIA:${kind}:${encoded}]`;
}

