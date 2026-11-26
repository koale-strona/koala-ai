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
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 440" role="img" aria-labelledby="title desc"><title id="title">Obieg wody w przyrodzie</title><desc id="desc">Parowanie, skraplanie, opad i spływ wody</desc><rect width="720" height="440" rx="28" fill="#eaf7ff"/><text x="32" y="48" fill="#17466a" font-size="26" font-family="sans-serif" font-weight="700">Obieg wody w przyrodzie</text><circle cx="600" cy="108" r="38" fill="#ffd25c"/><path d="M0 330 Q150 302 300 330 T720 320 V440 H0Z" fill="#61b5df"/><path d="M0 350 Q130 330 250 350 T500 346" fill="none" stroke="#3a8eba" stroke-width="5"/><g fill="#fff" stroke="#9acde8" stroke-width="3"><ellipse cx="300" cy="128" rx="76" ry="30"/><circle cx="260" cy="120" r="30"/><circle cx="330" cy="111" r="38"/></g><g fill="#15557c" font-family="sans-serif" font-size="16" font-weight="600"><text x="80" y="220">parowanie</text><text x="263" y="190">skraplanie</text><text x="490" y="218">opad</text><text x="112" y="390">spływ i gromadzenie</text></g><path d="M180 320 C178 275 200 255 205 225 M400 170 C430 180 460 195 490 220 M500 260 C485 300 460 320 430 340" fill="none" stroke="#2786bd" stroke-width="5" stroke-linecap="round" stroke-dasharray="10 8" marker-end="url(#arrow)"/><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#2786bd"/></marker></defs>${animated ? '<path d="M0 0 C-10 15 -14 21 -14 28 A14 14 0 0 0 14 28 C14 21 10 15 0 0" fill="#2589c2"><animateTransform attributeName="transform" type="translate" values="490 225;490 290;490 225" dur="3s" repeatCount="indefinite"/></path>' : ""}</svg>`;
}

function geometry(animated) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 440" role="img" aria-labelledby="title desc"><title id="title">Pole trójkąta</title><desc id="desc">Trójkąt z zaznaczoną podstawą i wysokością</desc><rect width="720" height="440" rx="28" fill="#111b35"/><text x="36" y="52" fill="#fff" font-size="26" font-family="sans-serif" font-weight="700">Pole trójkąta</text><path d="M160 350 L570 350 L435 120 Z" fill="#57b8d2" fill-opacity=".22" stroke="#79d8ec" stroke-width="5"/><path d="M435 120 L435 350" stroke="#ffd166" stroke-width="4" stroke-dasharray="9 7"/><path d="M435 338 L447 338 L447 350" fill="none" stroke="#ffd166" stroke-width="3"/><text x="353" y="390" fill="#e9f0ff" font-size="20" font-family="sans-serif">podstawa a</text><text x="450" y="245" fill="#ffd166" font-size="20" font-family="sans-serif">wysokość h</text><text x="203" y="140" fill="#fff" font-size="30" font-family="sans-serif" font-weight="700">P = a · h / 2</text>${animated ? '<circle cx="435" cy="120" r="8" fill="#fff"><animate attributeName="r" values="6;12;6" dur="1.5s" repeatCount="indefinite"/></circle>' : ""}</svg>`;
}

function cell(animated) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 440" role="img" aria-labelledby="title desc"><title id="title">Komórka roślinna</title><desc id="desc">Schemat ściany komórkowej, błony, jądra i chloroplastów</desc><rect width="720" height="440" rx="28" fill="#10241f"/><text x="36" y="52" fill="#fff" font-size="26" font-family="sans-serif" font-weight="700">Komórka roślinna</text><rect x="150" y="105" width="420" height="260" rx="85" fill="#76bd6b" fill-opacity=".3" stroke="#a6df88" stroke-width="12"/><rect x="165" y="120" width="390" height="230" rx="74" fill="none" stroke="#e1f2a3" stroke-width="3"/><circle cx="360" cy="235" r="62" fill="#bd92ed" fill-opacity=".75" stroke="#e4c9ff" stroke-width="3"/><circle cx="360" cy="235" r="15" fill="#f4e5ff"/><g fill="#75e0b4" stroke="#c4ffe8" stroke-width="2"><ellipse cx="245" cy="185" rx="31" ry="14"/><ellipse cx="470" cy="290" rx="31" ry="14"/><ellipse cx="270" cy="305" rx="31" ry="14"/></g><g fill="#f2f7df" font-family="sans-serif" font-size="16"><text x="190" y="386">ściana i błona</text><text x="390" y="228">jądro</text><text x="212" y="165">chloroplast</text><text x="390" y="350">cytoplazma</text></g>${animated ? '<circle cx="245" cy="185" r="4" fill="#fff"><animate attributeName="opacity" values=".3;1;.3" dur="2s" repeatCount="indefinite"/></circle>' : ""}</svg>`;
}

function foodChain(animated) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 440" role="img" aria-labelledby="title desc"><title id="title">Łańcuch pokarmowy</title><desc id="desc">Schemat przepływu energii od rośliny do roślinożercy i drapieżnika</desc><rect width="720" height="440" rx="28" fill="#14251e"/><text x="32" y="52" fill="#fff" font-size="26" font-family="sans-serif" font-weight="700">Łańcuch pokarmowy</text><text x="32" y="82" fill="#b8d4c2" font-size="14" font-family="sans-serif">Przykład zależności — strzałki pokazują kierunek przepływu energii</text><g font-family="sans-serif" text-anchor="middle"><circle cx="130" cy="220" r="55" fill="#78c779"/><text x="130" y="225" fill="#102015" font-size="18">trawa</text><circle cx="350" cy="220" r="55" fill="#e3be70"/><text x="350" y="225" fill="#28200e" font-size="18">konik polny</text><circle cx="570" cy="220" r="55" fill="#df8568"/><text x="570" y="225" fill="#2c130e" font-size="18">żaba</text></g><g stroke="#d8e8df" stroke-width="4" fill="none" marker-end="url(#arr)"><path d="M195 220 H280"/><path d="M415 220 H500"/></g><defs><marker id="arr" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0 0 L0 6 L9 3Z" fill="#d8e8df"/></marker></defs>${animated ? '<circle cx="0" cy="0" r="8" fill="#ffd166"><animateMotion dur="4s" repeatCount="indefinite" path="M 195,220 L 280,220 L 415,220 L 500,220"/></circle>' : ""}</svg>`;
}

function circuit(animated) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 440" role="img" aria-labelledby="title desc"><title id="title">Prosty obwód elektryczny</title><desc id="desc">Schemat baterii, przewodów, wyłącznika i żarówki w zamkniętym obwodzie</desc><rect width="720" height="440" rx="28" fill="#101b31"/><text x="32" y="52" fill="#fff" font-size="26" font-family="sans-serif" font-weight="700">Prosty obwód elektryczny</text><text x="32" y="80" fill="#bed0ee" font-size="14" font-family="sans-serif">Schemat poglądowy — korzystaj tylko z bezpiecznych zestawów szkolnych</text><path d="M170 170 H490 Q550 170 550 230 V300 Q550 340 510 340 H210 Q170 340 170 300 Z" fill="none" stroke="#70d6d0" stroke-width="7"/><circle cx="550" cy="250" r="39" fill="#1c2d4b" stroke="#ffd166" stroke-width="5"/><path d="M526 226 L574 274 M574 226 L526 274" stroke="#ffd166" stroke-width="5"/><text x="515" y="315" fill="#eaf0ff" font-size="15" font-family="sans-serif">żarówka</text><path d="M170 238 V300 M170 262 V300" stroke="#f28f6b" stroke-width="5"/><path d="M145 238 H195 M151 262 H189" stroke="#f28f6b" stroke-width="5"/><text x="115" y="220" fill="#eaf0ff" font-size="14" font-family="sans-serif">bateria</text><circle cx="330" cy="170" r="7" fill="#ffd166"/><circle cx="390" cy="170" r="7" fill="#ffd166"/><path d="M330 170 L378 145" stroke="#ffd166" stroke-width="5" stroke-linecap="round"/><text x="320" y="130" fill="#eaf0ff" font-size="14" font-family="sans-serif">wyłącznik</text><text x="235" y="390" fill="#bed0ee" font-size="15" font-family="sans-serif">Po zamknięciu obwodu może popłynąć prąd.</text>${animated ? '<circle r="7" fill="#fff1a8"><animateMotion dur="4s" repeatCount="indefinite" path="M 170,170 L 490,170 Q 550,170 550,230 L 550,300 Q 550,340 510,340 L 210,340 Q 170,340 170,300 L 170,170"/></circle>' : ""}</svg>`;
}

function eclipse(animated) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 440" role="img" aria-labelledby="title desc"><title id="title">Zaćmienie Słońca</title><desc id="desc">Schemat Słońca, Księżyca i cienia padającego na Ziemię</desc><rect width="720" height="440" rx="28" fill="#101729"/><text x="32" y="52" fill="#fff" font-size="26" font-family="sans-serif" font-weight="700">Zaćmienie Słońca</text><text x="32" y="80" fill="#bdc9e2" font-size="14" font-family="sans-serif">Schemat nie w skali — nigdy nie patrz na Słońce bez certyfikowanego filtra</text><circle cx="160" cy="230" r="72" fill="#ffbf52"/><g fill="#24324e" stroke="#9fb0cc" stroke-width="3"><circle cx="375" cy="230" r="30"/><circle cx="600" cy="230" r="54" fill="#4b89c9"/></g><path d="M375 195 L600 190 L600 270 L375 265Z" fill="#27334c" opacity=".72"/><text x="125" y="335" fill="#f6dfab" font-family="sans-serif" font-size="16">Słońce</text><text x="350" y="290" fill="#dce5f5" font-family="sans-serif" font-size="16">Księżyc</text><text x="580" y="320" fill="#dce5f5" font-family="sans-serif" font-size="16">Ziemia</text><text x="247" y="390" fill="#bdc9e2" font-family="sans-serif" font-size="15">Księżyc znajduje się między Słońcem a obserwatorem na Ziemi.</text>${animated ? '<circle cx="0" cy="0" r="30" fill="#24324e" stroke="#9fb0cc" stroke-width="3"><animateMotion dur="5s" repeatCount="indefinite" path="M 375,230 L 600,230"/></circle>' : ""}</svg>`;
}

function earthLayers(animated) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 440" role="img" aria-labelledby="title desc"><title id="title">Warstwy wnętrza Ziemi</title><desc id="desc">Schemat skorupy, płaszcza, jądra zewnętrznego i wewnętrznego</desc><rect width="720" height="440" rx="28" fill="#15192d"/><text x="32" y="52" fill="#fff" font-size="26" font-family="sans-serif" font-weight="700">Wnętrze Ziemi</text><text x="32" y="80" fill="#c2c9e5" font-size="14" font-family="sans-serif">Warstwy i ich grubości pokazano schematycznie</text><circle cx="300" cy="245" r="145" fill="#bd583d"/><circle cx="300" cy="245" r="95" fill="#f0a347"/><circle cx="300" cy="245" r="48" fill="#ffe28a"/><circle cx="300" cy="245" r="13" fill="#fff5c7"/><g font-family="sans-serif" font-size="17" fill="#f0f3ff"><path d="M408 155 H500" stroke="#9bd2ed" stroke-width="2"/><text x="510" y="160">skorupa</text><path d="M382 210 H500" stroke="#ffb57c" stroke-width="2"/><text x="510" y="215">płaszcz</text><path d="M342 260 H500" stroke="#ffe28a" stroke-width="2"/><text x="510" y="265">jądro zewnętrzne</text><path d="M312 300 H500" stroke="#fff5c7" stroke-width="2"/><text x="510" y="305">jądro wewnętrzne</text></g>${animated ? '<circle cx="300" cy="245" r="22" fill="none" stroke="#fff5c7" stroke-width="3"><animate attributeName="r" values="14;44;14" dur="2.8s" repeatCount="indefinite"/></circle>' : ""}</svg>`;
}


function photosynthesis(animated) {
  const pulse = animated
    ? '<animate attributeName="opacity" values="0.45;1;0.45" dur="3s" repeatCount="indefinite"/>'
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 440" role="img" aria-labelledby="title desc">
<title id="title">Fotosynteza</title><desc id="desc">Schemat: światło, woda i dwutlenek węgla pomagają roślinie wytworzyć glukozę i tlen</desc>
<defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#60a5fa"/></marker><linearGradient id="leaf"><stop stop-color="#86efac"/><stop offset="1" stop-color="#15803d"/></linearGradient></defs>
<rect width="720" height="440" rx="28" fill="#effaf1"/>
<text x="36" y="48" fill="#14532d" font-size="28" font-family="sans-serif" font-weight="700">Fotosynteza</text>
<text x="36" y="75" fill="#365c45" font-size="15" font-family="sans-serif">Schemat poglądowy — nie przedstawia skali</text>
<circle cx="116" cy="148" r="38" fill="#fbbf24"><g>${pulse}</g></circle><text x="82" y="205" fill="#713f12" font-size="16" font-family="sans-serif">światło</text>
<path d="M155 150 C220 150 245 175 292 195" fill="none" stroke="#60a5fa" stroke-width="4" marker-end="url(#arrow)"/>
<text x="40" y="280" fill="#1e3a8a" font-size="18" font-family="sans-serif">CO₂ + woda</text>
<path d="M178 272 C235 270 258 252 295 238" fill="none" stroke="#60a5fa" stroke-width="4" marker-end="url(#arrow)"/>
<path d="M350 325 C350 255 350 213 350 156" fill="none" stroke="#166534" stroke-width="12" stroke-linecap="round"/>
<path d="M350 238 C282 236 258 198 275 168 C319 171 348 190 350 238Z" fill="url(#leaf)" stroke="#166534" stroke-width="3"/>
<path d="M350 220 C416 216 449 179 433 150 C389 154 357 174 350 220Z" fill="url(#leaf)" stroke="#166534" stroke-width="3"/>
<path d="M350 236 C370 217 394 191 420 165" fill="none" stroke="#dcfce7" stroke-width="3"/>
<path d="M350 238 C330 218 308 193 288 176" fill="none" stroke="#dcfce7" stroke-width="3"/>
<text x="307" y="365" fill="#14532d" font-size="17" font-family="sans-serif">roślina</text>
<path d="M445 205 C500 205 520 180 555 166" fill="none" stroke="#60a5fa" stroke-width="4" marker-end="url(#arrow)"/>
<text x="540" y="143" fill="#14532d" font-size="18" font-family="sans-serif">glukoza</text>
<path d="M445 235 C500 244 520 273 555 286" fill="none" stroke="#60a5fa" stroke-width="4" marker-end="url(#arrow)"/>
<text x="560" y="302" fill="#1d4ed8" font-size="18" font-family="sans-serif">tlen (O₂)</text>
<text x="482" y="354" fill="#365c45" font-size="14" font-family="sans-serif">w liściach, dzięki chlorofilowi</text>
</svg>`;
}

function dna(animated) {
  const pairs = Array.from({ length: 11 }, (_, index) => {
    const y = 105 + index * 23;
    const offset = Math.sin(index * Math.PI / 2) * 52;
    const left = 360 - offset;
    const right = 360 + offset;
    const bases = [["A", "T"], ["C", "G"], ["T", "A"], ["G", "C"]][index % 4];
    return `<line x1="${left}" y1="${y}" x2="${right}" y2="${y}" stroke="#93c5fd" stroke-width="4"/><circle cx="${left}" cy="${y}" r="6" fill="#f472b6"/><circle cx="${right}" cy="${y}" r="6" fill="#34d399"/><text x="${left - 17}" y="${y + 5}" fill="#7f1d1d" font-size="13" font-family="sans-serif">${bases[0]}</text><text x="${right + 8}" y="${y + 5}" fill="#064e3b" font-size="13" font-family="sans-serif">${bases[1]}</text>`;
  }).join("");
  const motion = animated
    ? '<animate attributeName="opacity" values="0.65;1;0.65" dur="4s" repeatCount="indefinite"/>'
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 440" role="img" aria-labelledby="title desc">
<title id="title">DNA i geny</title><desc id="desc">Uproszczony model podwójnej helisy DNA z parami zasad A–T i C–G</desc>
<rect width="720" height="440" rx="28" fill="#101a35"/>
<text x="36" y="48" fill="#fff" font-size="28" font-family="sans-serif" font-weight="700">DNA — podwójna helisa</text>
<text x="36" y="75" fill="#cbd5e1" font-size="15" font-family="sans-serif">Uproszczony model: zasady łączą się w pary A–T oraz C–G</text>
<g>${motion}${pairs}</g>
<text x="245" y="395" fill="#f9a8d4" font-size="16" font-family="sans-serif">A i T</text>
<text x="405" y="395" fill="#6ee7b7" font-size="16" font-family="sans-serif">C i G</text>
</svg>`;
}

const TOPICS = [
  { test: /photosynth|fotosynthe|fotosintesis|光合作用|광합성/, name: "Fotosynteza", draw: photosynthesis },
  { test: /\b(dna|adn|dnk)\b|днк|脱氧核糖核酸/, name: "DNA i geny", draw: dna },
  { test: /uklad sloneczny|sistema solar|systeme solaire|sonnensystem|sistema solare|planeta|planety|solar system|planets?|太阳系|太陽系|태양계/, name: "Układ Słoneczny", draw: solarSystem },
  { test: /atom|proton|neutron|electron/, name: "Budowa atomu", draw: atom },
  { test: /obieg(?:u)? wody|cykl wodny|water cycle/, name: "Obieg wody", draw: waterCycle },
  { test: /trojkat|geometr|triangle|geometry/, name: "Geometria", draw: geometry },
  { test: /komork|cell|chloroplast/, name: "Komórka roślinna", draw: cell },
  { test: /lancuch pokarm|food chain|cadena alimentaria|nahrungskette/, name: "Łańcuch pokarmowy", draw: foodChain },
  { test: /obwod(?:zie|u)? elektrycz|electric circuit|stromkreis|circuito electrico/, name: "Prosty obwód elektryczny", draw: circuit },
  { test: /z(a|ae)cmienie slonca|solar eclipse|sonnenfinsternis|eclipse solar/, name: "Zaćmienie Słońca", draw: eclipse },
  { test: /warstw\w* ziemi|wnetrze ziemi|earth layers|layers? of (?:the )?earth|inner earth|erdschichten/, name: "Wnętrze Ziemi", draw: earthLayers }
];

export function generateEducationalMedia(prompt) {
  const text = fold(prompt);
  const isGeneration = /\b(wygeneruj|stworz|narysuj|zrob|generate|create|draw|make|animuj|dibuja|crea|genera|genere|dessine|erstelle|zeichne|erzeuge|disegna|crie|desenhe|gere|narisu|sozda|olustur|ciz)\b/.test(text) || /(?:生成|描いて|画いて|绘制|생성|그려|أنشئ|ارسم|बनाओ|चित्र बनाओ)/u.test(text);
  if (!isGeneration) return null;

  const topic = TOPICS.find(item => item.test.test(text));
  if (!topic) return null;
  const animated = /\b(film|wideo|video|animac\w*|animated|animation|clip|pelicula|video|vidéo|animation|film|animazione|animacao|анимац\w*|видео|animasyon)\b/.test(text) || /(?:動画|动画|影片|동영상|वीडियो|فيديو)/u.test(text);
  const svg = topic.draw(animated);
  const encoded = Buffer.from(svg, "utf8").toString("base64");
  const kind = animated ? "animation" : "image";
  const description = animated
    ? `Przygotowałam lokalną, zapętloną animację edukacyjną SVG: **${topic.name}**. To animacja wektorowa, nie plik MP4.`
    : `Wygenerowałam lokalną ilustrację edukacyjną SVG: **${topic.name}**. To schemat poglądowy, nie fotorealistyczne zdjęcie.`;
  return `## 🐨 ${topic.name}\n\n${description}\n\n[KOALA_MEDIA:${kind}:${encoded}]`;
}

