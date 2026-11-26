/* Wielojęzyczne dopasowanie pytań do lokalnych kart, bez zewnętrznego modelu. */
import { detectQuestionLanguage } from "./languages.mjs";

function fold(value) {
  return String(value || "")
    .toLocaleLowerCase()
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const CONCEPTS = [
  ["fotosynteza", "photosynthesis|fotosintesis|photosynthese|fotosynthese|fotosintesi|fotossintese|фотосинтез|фотосинтезу|光合作用|光合成|광합성|fotosintéza|fotosinteza|fotosíntese|fotosüntees|fotosintezė|fotosyntese|fotosyntesen|fotosyntéza|fotosinteză|fotoszintézis|fotosinteza|quang hợp"],
  ["grawitacja", "gravity|gravedad|gravité|schwerkraft|gravita|gravidade|гравитация|гравітація|重力|중력|gravitace|gravitace|gravitacija|gravitație|gravitáció|gravita|gravitatie|zwaartekracht|gravitation|tyngdkraft|gravitasjon|painovoima|dżādh|yerçekimi"],
  ["atom", "atom|átomo|atome|атом|الذرة|原子|आणविक परमाणु|atomu|atomos|atomo|atomio|atòm|atomio|atomos|atomis|atomas|atóm|atom|atom|átom|atomi|атом|atom"],
  ["komórka", "cell|plant cell|célula|cellule|zelle|cella|клетка|клітина|细胞|細胞|세포|sel|buňka|célula|cellula|célula|lula|cèl·lula|zelula|ląstelė|kletka|bunka|celulă|sejt|kletka|kletka|kletka|cèl·lula"],
  ["dna", "dna|adn|and|днк|адн|脱氧核糖核酸|ДНК|ADN|ADN|DNA"],
  ["siła", "force|fuerza|force physique|kraft|forza|força|сила|силa|力|힘|síla|forță|erő|güç|lực"],
  ["prędkość", "speed|velocity|velocidad|vitesse|geschwindigkeit|velocità|velocidade|скорость|швидкість|速度|속도|rychlost|viteză|sebesség|snelheid|hastighet|hastighed|hastighet|nopeus|velocitat|greitis|rýchlosť|vitesse|tốc độ"],
  ["gęstość", "density|densidad|densité|dichte|densità|densidade|плотность|густина|密度|밀도|hustota|densitate|sűrűség|yoğunluk|khối lượng riêng"],
  ["układ słoneczny", "solar system|sistema solar|système solaire|sonnensystem|sistema solare|солнечная система|сонячна система|太阳系|太陽系|태양계|sluneční soustava|solsystem|aurinkokunta|układ planetarny|sistema solar|he solar system"],
  ["obieg wody", "water cycle|ciclo del agua|cycle de l eau|wasserkreislauf|ciclo dell acqua|ciclo da água|круговорот воды|кругообіг води|水循环|水循環|물의 순환|koloběh vody|circuitul apei|víz körforgása|waterkringloop|vattnets kretslopp|vandets kredsløb|vannets kretsløp|veden kiertokulku|cicle de l aigua|vandens apytaka|ciclo da agua"],
  ["ekosystem", "ecosystem|ecosistema|écosystème|ökosystem|экосистема|екосистема|生态系统|生態系|생태계|ekosystém|ecosistem|ökoszisztéma|ekosistem|hệ sinh thái"],
  ["łańcuch pokarmowy", "food chain|cadena alimentaria|chaîne alimentaire|nahrungskette|catena alimentare|cadeia alimentar|пищевая цепь|харчовий ланцюг|食物链|食物連鎖|먹이 사슬|potravní řetězec|lanț trofic|tápláléklánc|voedselketen|näringskedja|fødekæde|næringskjede|ravintoketju|cadena alimentària|mitybos grandinė|potravový reťazec|chuỗi thức ăn"],
  ["klimat", "climate|clima|climat|klima|климат|клімат|气候|気候|기후|podnebí|klíma|klimatas|klima|iklim|khí hậu"],
  ["pogoda", "weather|tiempo atmosférico|météo|wetter|meteo|погода|天气|天気|날씨|počasí|vreme|vreme|vreme|vreme|vreme|vreme|vreme|vreme|vreme|vremenska prognoza|vreme|vreme|vreme|vreme|thời tiết"],
  ["skala mapy", "map scale|escala del mapa|échelle de la carte|kartenmaßstab|scala della mappa|масштаб карты|масштаб карти|地图比例尺|地図の縮尺|지도의 축척|měřítko mapy|scara hărții|térkép méretaránya|kaartschaal|kartskala|kortestok|målestokk|mittakaava|escala del mapa|žemėlapio mastelis|mierka mapy|tỷ lệ bản đồ"],
  ["pole trójkąta", "triangle area|area of a triangle|área del triángulo|aire du triangle|dreiecksfläche|area del triangolo|площадь треугольника|площа трикутника|三角形面积|三角形の面積|삼각형의 넓이|obsah trojúhelníku|aria triunghiului|háromszög területe|oppervlakte driehoek|triangelns area|trekantens areal|kolmion pinta-ala|àrea del triangle|trikampio plotas|obsah trojuholníka|diện tích tam giác"],
  ["ułamek zwykły", "fraction|fracción|fraction|bruch|frazione|fração|дробь|дріб|分数|분수|zlomek|fracție|tört|breuk|bråk|brøk|murtoluku|fracción|trupmena|zlomok|phân số"],
  ["procenty", "percentage|percent|porcentaje|pourcentage|prozent|percentuale|porcentagem|процент|відсоток|百分比|パーセント|백분율|procento|procent|százalék|procent|procent|prosent|prosentti|percentatge|procentas|percento|phần trăm"],
  ["równanie", "equation|ecuación|équation|gleichung|equazione|equação|уравнение|рівняння|方程|方程式|방정식|rovnice|ecuație|egyenlet|vergelijking|ekvation|ligning|likning|yhtälö|equació|lygtis|rovnica|phương trình"],
  ["średnia arytmetyczna", "arithmetic mean|mean average|media aritmética|moyenne arithmétique|arithmetisches mittel|media aritmetica|среднее арифметическое|середнє арифметичне|算术平均数|算術平均|산술 평균|aritmetický průměr|media aritmetică|számtani átlag|rekenkundig gemiddelde|aritmetiskt medelvärde|aritmetisk gennemsnit|aritmetisk gjennomsnitt|aritmeettinen keskiarvo|mitjana aritmètica|aritmetinis vidurkis|aritmetický priemer|trung bình cộng"],
  ["algorytm", "algorithm|algoritmo|algorithme|algorithmus|алгоритм|算法|알고리즘|algoritmus|algoritmi|algoritm|algoritme|algoritme|algoritme|algoritmi|algoritmo|algoritmas|algoritmus|thuật toán"],
  ["pętla programistyczna", "programming loop|loop programming|bucle de programación|boucle de programmation|programmierschleife|ciclo di programmazione|цикл программирования|цикл у програмуванні|编程循环|プログラミングループ|프로그래밍 반복문|programovací smyčka|buclă de programare|programozási ciklus|programmeer lus|programmeringsloop|programmeringsløkke|programmeringsløkke|ohjelmointisilmukka|bucle de programació|programavimo ciklas|programovací cyklus|vòng lặp lập trình"],
  ["obwód elektryczny", "electric circuit|circuito eléctrico|circuit électrique|stromkreis|circuito elettrico|circuito elétrico|электрическая цепь|електричне коло|电路|電気回路|전기 회로|elektrický obvod|circuit electric|elektromos áramkör|elektrisch circuit|elektrisk krets|elektrisk kredsløb|elektrisk krets|sähköpiiri|circuit elèctric|elektros grandinė|elektrický obvod|mạch điện"],
  ["reakcja chemiczna", "chemical reaction|reacción química|réaction chimique|chemische reaktion|reazione chimica|reação química|химическая реакция|хімічна реакція|化学反应|化学反応|화학 반응|chemická reakce|reacție chimică|kémiai reakció|chemische reactie|kemisk reaktion|kemisk reaktion|kjemisk reaksjon|kemiallinen reaktio|reacció química|cheminė reakcija|chemická reakcia|phản ứng hóa học"],
  ["pierwiastek chemiczny", "chemical element|elemento químico|élément chimique|chemisches element|elemento chimico|химический элемент|хімічний елемент|化学元素|화학 원소|chemický prvek|element chimic|kémiai elem|chemisch element|kemiskt grundämne|kemisk grundstof|kjemisk grunnstoff|kemiallinen alkuaine|element químic|cheminis elementas|chemický prvok|nguyên tố hóa học"],
  ["źródło historyczne", "historical source|fuente histórica|source historique|historische quelle|fonte storica|fonte histórica|исторический источник|історичне джерело|历史资料|歴史資料|역사 자료|historický pramen|sursă istorică|történelmi forrás|historische bron|historisk källa|historisk kilde|historisk kilde|historiallinen lähde|font històrica|istorinis šaltinis|historický prameň|tư liệu lịch sử"],
  ["prawo ohma", "ohm law|ohm s law|ley de ohm|loi d ohm|ohmsches gesetz|legge di ohm|закона ома|закон ома|欧姆定律|옴의 법칙|Ohmův zákon|legea lui Ohm|Ohm törvénye|wet van ohm|ohms lag|ohms lov|ohms lov|ohmin laki|llei d ohm|omo dėsnis|ohmov zákon|định luật ohm"],
  ["energia kinetyczna", "kinetic energy|energía cinética|énergie cinétique|kinetische energie|energia cinetica|energia cinética|кинетическая энергия|кінетична енергія|动能|運動エネルギー|운동 에너지|kinetická energie|energie cinetică|mozgási energia|kinetische energie|rörelseenergi|kinetisk energi|kinetisk energi|liike-energia|energia cinètica|kinetinė energija|kinetická energia|động năng"],
  ["ciśnienie", "pressure|presión|pression|druck|pressione|pressão|давление|тиск|ضغط|圧力|压力|압력|tlak|presiune|nyomás|druk|tryck|tryk|trykk|paine|pressió|slėgis|tlak|áp suất"],
  ["części mowy", "parts of speech|partes de la oración|parties du discours|wortarten|parti del discorso|classes gramaticais|части речи|частини мови|词类|品詞|품사|slovní druhy|părți de vorbire|szófajok|woordsoorten|ordklasser|ordklasser|ordklasser|sanaluokat|categories gramaticals|kalbos dalys|slovné druhy|từ loại"],
  ["czasownik", "verb|verbo|verbe|verb|verbo|verbo|глагол|дієслово|动词|動詞|동사|sloveso|verb|ige|werkwoord|verb|udsagnsord|verb|verbi|verb|veiksmažodis|sloveso|động từ"],
  ["demokracja", "democracy|democracia|démocratie|demokratie|democrazia|демократия|демократія|民主|民主主義|민주주의|demokracie|democrație|demokrácia|democratie|demokrati|demokrati|demokrati|demokratia|democràcia|demokratija|demokracia|dân chủ"],
  ["układ krwionośny", "circulatory system|sistema circulatorio|système circulatoire|kreislaufsystem|apparato circolatorio|sistema circulatório|кровеносная система|кровоносна система|循環器系|순환계"],
  ["układ oddechowy", "respiratory system|sistema respiratorio|système respiratoire|atemwegssystem|apparato respiratorio|sistema respiratório|дыхательная система|дихальна система|呼吸器系|호흡계"],
  ["układ pokarmowy", "digestive system|digestive tract|sistema digestivo|système digestif|verdauungssystem|apparato digerente|sistema digestório|пищеварительная система|травна система|消化器系|소화계"],
  ["twierdzenie Pitagorasa", "pythagorean theorem|teorema de pitagoras|théorème de pythagore|satz des pythagoras|teorema di pitagora|teorema de pitágoras|теорема пифагора|теорема піфагора|三平方の定理|피타고라스 정리"],
  ["zmiana klimatu", "climate change|cambio climatico|changement climatique|klimawandel|cambiamento climatico|mudança climática|изменение климата|зміна клімату|气候变化|気候変動|기후 변화"],
  ["pory roku", "seasons|las estaciones|les saisons|jahreszeiten|le stagioni|estações do ano|времена года|пори року|四季|계절"],
  ["prąd elektryczny", "electric current|electrical current|corriente electrica|courant electrique|elektrischer strom|corrente elettrica|corrente eletrica|электрический ток|електричний струм|電流|전류"],
  ["prawo zachowania masy", "law of conservation of mass|conservation of mass|ley de conservacion de la masa|loi de conservation de la masse|massenerhaltungssatz|legge di conservazione della massa|закон сохранения массы|закон збереження маси|質量保存の法則|질량 보존 법칙"],
  ["układ współrzędnych", "coordinate system|coordinate plane|sistema de coordenadas|systeme de coordonnees|koordinatensystem|sistema di coordinate|система координат|座標系|좌표계"],
  ["kontynenty i oceany", "continents and oceans|continentes y oceanos|continents et oceans|kontinente und ozeane|continenti e oceani|continentes e oceanos|континенты и океаны|материки й океани|大陸と海洋|대륙과 해양"],
  ["system dwójkowy", "binary system|binary number system|sistema binario|systeme binaire|binarsystem|sistema binario|система счисления двоичная|двійкова система числення|二進法|이진법"],
  ["rodzaje kątów", "types of angles|tipos de angulos|types d angles|winkelarten|tipi di angoli|tipos de angulos|виды углов|види кутів|角の種類|각의 종류"]
].map(([canonical, aliases]) => ({ canonical, aliases: aliases.split("|").map(fold).filter(Boolean) }));

const QUESTION_PREFIXES = {
  pl: ["co to jest", "jak działa", "podaj przykład"],
  en: ["what is", "how does", "give an example of"],
  es: ["qué es", "cómo funciona", "da un ejemplo de"],
  fr: ["qu est ce que", "comment fonctionne", "donne un exemple de"],
  de: ["was ist", "wie funktioniert", "gib ein beispiel für"],
  it: ["che cos è", "come funziona", "fai un esempio di"],
  pt: ["o que é", "como funciona", "dê um exemplo de"],
  ru: ["что такое", "как работает", "приведи пример"],
  uk: ["що таке", "як працює", "наведи приклад"],
  nl: ["wat is", "hoe werkt", "geef een voorbeeld van"],
  tr: ["nedir", "nasıl çalışır", "örnek ver"],
  ja: ["とは何", "どのように機能", "例を挙げる"],
  zh: ["什么是", "如何运作", "举例说明"],
  ar: ["ما هو", "كيف يعمل", "أعط مثالا على"],
  hi: ["क्या है", "कैसे काम करता है", "उदाहरण दें"],
  cs: ["co je", "jak funguje", "uveď příklad"],
  ro: ["ce este", "cum funcționează", "dă un exemplu"],
  hu: ["mi az", "hogyan működik", "mondj példát"],
  sv: ["vad är", "hur fungerar", "ge ett exempel"],
  da: ["hvad er", "hvordan fungerer", "giv et eksempel"],
  no: ["hva er", "hvordan fungerer", "gi et eksempel"],
  fi: ["mikä on", "miten se toimii", "anna esimerkki"],
  id: ["apa itu", "bagaimana cara kerja", "berikan contoh"],
  vi: ["là gì", "hoạt động như thế nào", "cho ví dụ"],
  ko: ["무엇인가요", "어떻게 작동하나요", "예를 들어"],
  el: ["τι είναι", "πώς λειτουργεί", "δώσε ένα παράδειγμα"]
};

const INTENT_WORDS = {
  definition: /(?:例を挙げる|举例说明|예를 들어|\b(co to jest|czym jest|what is|define|que es|qu est ce que|was ist|che cos e|cos e|o que e|что такое|що таке|nedir|mi az|ce este|apa itu)\b)/u,
  explanation: /(?:\b(wyjasnij|wytlumacz|jak dziala|dlaczego|explain|how does|why|como funciona|por que|comment fonctionne|wie funktioniert|warum|perche|come funziona|как работает|почему|як працює|nasil calisir)\b|解释|説明して|설명해)/u,
  example: /(?:ví dụ|vi du|उदाहरण दें|\b(przyklad|podaj przyklad|example|give an example|ejemplo|beispiel|пример|приклад|exemplo|voorbeeld|ornek ver)\b)/u,
  steps: /(?:\b(krok po kroku|jak obliczyc|rozpisz|step by step|how to calculate|paso a paso|schritt fur schritt|etape par etape|passo a passo|шаг за шагом|крок за кроком)\b|一步一步|順を追って|단계별)/u,
  compare: /(?:\b(porownaj|roznica|compare|difference between|comparar|diferencia entre|unterschied zwischen|сравни|порівняй|so sanh|karsilastir)\b|比較して|비교해)/u,
  simplify: /(?:\b(prosciej|latwiej|w prostych slowach|simpler|in simple terms|mas sencillo|en palabras sencillas|einfacher|plus simple|piu semplice|in parole semplici|простыми словами|proshche|daha basit)\b|简单来说|簡単に|쉽게 설명)/u
};

export function understandQuestion(question) {
  const raw = String(question || "").slice(0, 2000);
  const normalized = fold(raw);
  const concepts = [];
  const padded = ` ${normalized} `;
  for (const concept of CONCEPTS) {
    const matched = concept.aliases.some(alias => {
      if (/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(alias)) return normalized.includes(alias);
      return padded.includes(` ${alias} `);
    });
    if (matched) concepts.push(concept.canonical);
  }

  const intentOrder = ["steps", "compare", "simplify", "example", "explanation", "definition"];
  const intent = intentOrder.find(name => INTENT_WORDS[name].test(normalized)) || "factual";
  const language = detectQuestionLanguage(raw);
  const expanded = [...new Set([normalized, ...concepts])].join(" ");
  const commandsRemoved = normalized
    .replace(/\b(prosze|proszę|wytlumacz|wyjasnij|opowiedz|podaj|pokaz|zrob|stworz|co to jest|czym jest|what is|please|explain|define|tell me|give an example|qué es|was ist|что такое|що таке)\b/gu, " ")
    .replace(/\s+/g, " ").trim();
  const variants = [...new Set([normalized, commandsRemoved, expanded].filter(Boolean))];
  return { language, intent, concepts, normalized, expanded, variants };
}

export function getKnowledgeSearchPhrases(item, language = "pl") {
  const title = String(item?.title || "").trim();
  const prefixes = QUESTION_PREFIXES[language] || QUESTION_PREFIXES.pl;
  const phrases = [title, ...(item?.keywords || []), ...(item?.aliases || [])];
  if (title) {
    for (const prefix of prefixes) phrases.push(`${prefix} ${title}`);
  }
  return [...new Set(phrases.map(value => String(value || "").trim()).filter(Boolean))];
}

export function getExpandedSearchText(question) {
  const profile = understandQuestion(question);
  const queryPrefixes = QUESTION_PREFIXES[profile.language] || QUESTION_PREFIXES.pl;
  const conceptText = profile.concepts.join(" ");
  const clean = profile.variants[1] || profile.normalized;
  return [...new Set([profile.normalized, clean, `${clean} ${conceptText}`, ...profile.concepts.map((concept, index) => `${queryPrefixes[index % queryPrefixes.length]} ${concept}`)])]
    .filter(Boolean)
    .join(" ");
}

export function getConceptGlossarySize() {
  return CONCEPTS.length;
}
