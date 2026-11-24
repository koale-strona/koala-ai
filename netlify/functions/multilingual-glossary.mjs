/* Curated classroom vocabulary aliases for local questions in common languages. */

function fold(value) {
  return String(value || "").toLocaleLowerCase()
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const GLOSSARY = [
  ["fotosynteza", "photosynthesis|fotosintesis|photosynthèse|fotosynthese|fotosintesi|fotossintese|фотосинтез|фотосинтезу|光合作用|光合成"],
  ["grawitacja", "gravity|gravedad|gravité|schwerkraft|gravita|gravidade|гравитация|гравітація|重力|중력"],
  ["atom", "atom|átomo|atome|atomar|атом|الذرة|原子|आणविक परमाणु"],
  ["komórka", "cell|plant cell|célula|cellule|zelle|cella|клетка|клітина|细胞|細胞|세포"],
  ["dna", "dna|adn|and|адн|днк|脱氧核糖核酸"],
  ["siła", "force|fuerza|force physique|kraft|forza|força|сила|силa|力|힘"],
  ["prędkość", "speed|velocity|velocidad|vitesse|geschwindigkeit|velocità|velocidade|скорость|швидкість|速度|속도"],
  ["gęstość", "density|densidad|densité|dichte|densità|densidade|плотность|густина|密度|밀도"],
  ["układ słoneczny", "solar system|sistema solar|système solaire|sonnensystem|sistema solare|sistema solar|солнечная система|сонячна система|太阳系|太陽系|태양계"],
  ["obieg wody", "water cycle|ciclo del agua|cycle de l eau|wasserkreislauf|ciclo dell acqua|ciclo da agua|круговорот воды|кругообіг води|水循环|水循環|물의 순환"],
  ["ekosystem", "ecosystem|ecosistema|écosystème|ökosystem|ecosistema|экосистема|екосистема|生态系统|生態系"],
  ["łańcuch pokarmowy", "food chain|cadena alimentaria|chaîne alimentaire|nahrungskette|catena alimentare|cadeia alimentar|пищевая цепь|харчовий ланцюг|食物链|食物連鎖"],
  ["klimat", "climate|clima|climat|klima|clima|климат|клімат|气候|気候|기후"],
  ["pogoda", "weather|tiempo atmosférico|météo|wetter|meteo|погода|天气|天気|날씨"],
  ["skala mapy", "map scale|escala del mapa|échelle de la carte|kartenmaßstab|scala della mappa|масштаб карты|масштаб карти|地图比例尺|地図の縮尺"],
  ["pole trójkąta", "triangle area|area of a triangle|área del triángulo|aire du triangle|dreiecksfläche|area del triangolo|площадь треугольника|площа трикутника|三角形面积|三角形の面積"],
  ["ułamek zwykły", "fraction|fractions|fracción|fraction|bruch|frazione|fração|дробь|дріб|分数|분수"],
  ["procenty", "percentage|percent|porcentaje|pourcentage|prozent|percentuale|porcentagem|процент|відсоток|百分比|パーセント"],
  ["równanie", "equation|ecuación|équation|gleichung|equazione|equação|уравнение|рівняння|方程|方程式|방정식"],
  ["średnia arytmetyczna", "arithmetic mean|mean average|media aritmética|moyenne arithmétique|arithmetisches mittel|media aritmetica|среднее арифметическое|середнє арифметичне|算术平均数|算術平均"],
  ["algorytm", "algorithm|algoritmo|algorithme|algorithmus|алгоритм|算法|알고리즘"],
  ["pętla programistyczna", "programming loop|loop programming|bucle de programación|boucle de programmation|programmierschleife|ciclo di programmazione|цикл программирования|цикл у програмуванні|编程循环|プログラミングループ"],
  ["obwód elektryczny", "electric circuit|circuito eléctrico|circuit électrique|stromkreis|circuito elettrico|circuito elétrico|электрическая цепь|електричне коло|电路|電気回路"],
  ["reakcja chemiczna", "chemical reaction|reacción química|réaction chimique|chemische reaktion|reazione chimica|reação química|химическая реакция|хімічна реакція|化学反应|化学反応"],
  ["pierwiastek chemiczny", "chemical element|elemento químico|élément chimique|chemisches element|elemento chimico|химический элемент|хімічний елемент|化学元素|화학 원소"],
  ["źródło historyczne", "historical source|fuente histórica|source historique|historische quelle|fonte storica|исторический источник|історичне джерело|历史资料|歴史資料"],
  ["łańcuch pokarmowy", "food web|red trófica|réseau trophique|nahrungsnetz|rete alimentare|тещевая сеть|трофічна мережа|食物网"],
  ["obieg wody", "evaporation condensation precipitation|evaporación condensación precipitación|verdunstung kondensation niederschlag|evaporation condensation precipitation"],
  ["komórka", "cell membrane|membrana celular|membrane cellulaire|zellmembran|мембрана клетки|клітинна мембрана|细胞膜"],
  ["prawo ohma", "ohm law|ohm s law|ley de ohm|loi d ohm|ohmsches gesetz|legge di ohm|закона ома|закон ома|欧姆定律|옴의 법칙"]
  , ["ciśnienie", "pressure|presión|pression|druck|pressione|pressão|давление|тиск|ضغط|圧力|压力|압력|druk|tryck|tryk|trykk|tlak|presiune|nyomás|tekanan|áp suất"]
  , ["energia kinetyczna", "kinetic energy|energía cinética|énergie cinétique|kinetische energie|energia cinetica|energia cinética|кинетическая энергия|кінетична енергія|energia cinetica|動能|动能|운동 에너지|kinetische energie|kinetisk energi|kinetisk energi|kinetisk energi|kinetická energie|energie cinetică|mozgási energia|energi kinetik|động năng"]
  , ["energia potencjalna", "potential energy|energía potencial|énergie potentielle|potenzielle energie|energia potenziale|energia potencial|потенциальная энергия|потенціальна енергія|energia potencial|位置エネルギー|势能|위치 에너지|potentiële energie|potentiell energi|potentiel energi|potensiell energi|potenciální energie|energie potențială|helyzeti energia|energi potensial|thế năng"]
  , ["układ oddechowy", "respiratory system|sistema respiratorio|système respiratoire|atmungssystem|sistema respiratorio|sistema respiratório|дыхательная система|дихальна система|الجهاز التنفسي|呼吸器系|呼吸系统|호흡계|ademhalingsstelsel|andningssystem|åndedrætssystem|åndedrettssystem|dýchací soustava|sistemul respirator|légzőrendszer|sistem pernapasan|hệ hô hấp"]
  , ["układ pokarmowy", "digestive system|sistema digestivo|système digestif|verdauungssystem|sistema digerente|sistema digestório|пищеварительная система|травна система|الجهاز الهضمي|消化器系|消化系统|소화계|spijsverteringsstelsel|matsmältningssystem|fordøjelsessystem|fordøyelsessystem|trávicí soustava|sistem digestiv|emésztőrendszer|sistem pencernaan|hệ tiêu hóa"]
  , ["układ krwionośny", "circulatory system|sistema circulatorio|système circulatoire|kreislaufsystem|sistema circolatorio|sistema circulatório|кровеносная система|кровоносна система|الجهاز الدوري|循環器系|循环系统|순환계|bloedsomloop|cirkulationssystem|kredsløbssystem|sirkulasjonssystem|oběhová soustava|sistem circulator|keringési rendszer|sistem peredaran darah|hệ tuần hoàn"]
  , ["podział komórki", "cell division|división celular|division cellulaire|zellteilung|divisione cellulare|divisão celular|деление клетки|поділ клітини|انقسام الخلية|細胞分裂|细胞分裂|세포 분열|celdeling|celldelning|celledeling|celledeling|dělení buněk|diviziune celulară|sejtosztódás|pembelahan sel|phân bào"]
  , ["kwas", "acid|ácido|acide|säure|acido|ácido|кислота|кислота|حمض|酸|酸|산|zuur|syra|syre|syre|kyselina|acid|sav|asam|axit"]
  , ["mieszanina", "mixture|mezcla|mélange|gemisch|miscela|mistura|смесь|суміш|خليط|混合物|混合物|혼합물|mengsel|blandning|blanding|blanding|směs|amestec|keverék|campuran|hỗn hợp"]
  , ["prawo zachowania masy", "law of conservation of mass|ley de conservación de la masa|loi de conservation de la masse|massenerhaltungsgesetz|legge di conservazione della massa|lei da conservação da massa|закон сохранения массы|закон збереження маси|قانون حفظ الكتلة|質量保存の法則|质量守恒定律|질량 보존 법칙|wet van behoud van massa|massans bevarande|massens bevarelse|bevaring av masse|zákon zachování hmotnosti|legea conservării masei|tömegmegmaradás törvénye|hukum kekekalan massa|định luật bảo toàn khối lượng"]
  , ["ruch obrotowy Ziemi", "earth rotation|rotación de la Tierra|rotation de la Terre|erdrotation|rotazione terrestre|rotação da Terra|вращение Земли|обертання Землі|دوران الأرض|地球の自転|地球自转|지구 자전|aardrotatie|jordrotation|jordens rotation|jordrotasjon|rotace Země|rotația Pământului|Föld forgása|rotasi bumi|sự tự quay của Trái Đất"]
  , ["prawdopodobieństwo", "probability|probabilidad|probabilité|wahrscheinlichkeit|probabilità|probabilidade|вероятность|ймовірність|احتمال|確率|概率|확률|waarschijnlijkheid|sannolikhet|sandsynlighed|sannsynlighet|pravděpodobnost|probabilitate|valószínűség|probabilitas|xác suất"]
  , ["części mowy", "parts of speech|partes de la oración|parties du discours|wortarten|parti del discorso|classes gramaticais|части речи|частини мови|أقسام الكلام|品詞|词类|품사|woordsoorten|ordklasser|ordklasser|ordklasser|slovní druhy|părți de vorbire|szófajok|kelas kata|từ loại"]
  , ["czasownik", "verb|verbo|verbe|verb|verbo|verbo|глагол|дієслово|فعل|動詞|动词|동사|werkwoord|verb|udsagnsord|verb|sloveso|verb|ige|kata kerja|động từ"]
  , ["podmiot zdania", "sentence subject|sujeto de la oración|sujet de la phrase|satzsubjekt|soggetto della frase|sujeito da oração|подлежащее|підмет|فاعل الجملة|文の主語|句子主语|문장의 주어|zins onderwerp|subjekt|grundled|subjekt|podmět věty|subiectul propoziției|mondat alanya|subjek kalimat|chủ ngữ"]
  , ["orzeczenie", "predicate grammar|predicado gramatical|prédicat|prädikat grammatik|predicato grammaticale|predicado|сказуемое|присудок|خبر الجملة|文の述語|句子谓语|문장의 서술어|gezegde|predikat|udsagnsled|predik |přísudek|predicat|állítmány|predikat|vị ngữ"]
  , ["rewolucja przemysłowa", "industrial revolution|revolución industrial|révolution industrielle|industrielle revolution|rivoluzione industriale|revolução industrial|промышленная революция|промислова революція|الثورة الصناعية|産業革命|工业革命|산업 혁명|industriële revolutie|industriella revolutionen|industrielle revolution|industrielle revolusjon|průmyslová revoluce|revoluția industrială|ipari forradalom|revolusi industri|cách mạng công nghiệp"]
  , ["demokracja", "democracy|democracia|démocratie|demokratie|democrazia|democracia|демократия|демократія|ديمقراطية|民主主義|民主|민주주의|democratie|demokrati|demokrati|demokrati|demokracie|democrație|demokrácia|demokrasi|dân chủ"]
  , ["źródło historyczne", "historical source|fuente histórica|source historique|historische quelle|fonte storica|fonte histórica|исторический источник|історичне джерело|مصدر تاريخي|史料|历史资料|역사 자료|historische bron|historisk källa|historisk kilde|historisk kilde|historický pramen|sursă istorică|történelmi forrás|sumber sejarah|nguồn sử liệu"]
  , ["mapa", "map|mapa|carte|karte|mappa|mapa|карта|карта|خريطة|地図|地图|지도|kaart|karta|kort|kart|mapa|hartă|térkép|peta|bản đồ"]
].map(([canonical, aliases]) => ({ canonical, aliases: aliases.split("|").map(fold).filter(Boolean) }));

function oneEditApart(left, right) {
  if (Math.min(left.length, right.length) < 6 || Math.abs(left.length - right.length) > 1) return false;
  let a = 0;
  let b = 0;
  let edits = 0;
  while (a < left.length && b < right.length) {
    if (left[a] === right[b]) { a++; b++; continue; }
    if (++edits > 1) return false;
    if (left.length > right.length) a++;
    else if (right.length > left.length) b++;
    else { a++; b++; }
  }
  return edits + Number(a < left.length || b < right.length) === 1;
}

export function expandMultilingualQuestion(question) {
  const folded = fold(question);
  const text = ` ${folded} `;
  const words = folded.split(" ");
  const matches = [];
  for (const concept of GLOSSARY) {
    const matchesAlias = alias => /[^\x00-\x7f]/u.test(alias) && /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(alias)
      ? text.includes(alias)
      : text.includes(` ${alias} `) || (!alias.includes(" ") && words.some(word => oneEditApart(word, alias)));
    if (concept.aliases.some(matchesAlias)) matches.push(concept.canonical);
  }
  return [...new Set(matches)].join(" ");
}

const LOCALIZED_ANSWERS = {
  fotosynteza: {
    en: ["Photosynthesis", "Plants use light energy to turn water and carbon dioxide into sugars, releasing oxygen."],
    es: ["Fotosíntesis", "Las plantas usan la energía de la luz para transformar agua y dióxido de carbono en azúcares y liberar oxígeno."],
    fr: ["Photosynthèse", "Les plantes utilisent l’énergie lumineuse pour transformer l’eau et le dioxyde de carbone en sucres, en libérant de l’oxygène."],
    de: ["Fotosynthese", "Pflanzen nutzen Lichtenergie, um Wasser und Kohlenstoffdioxid in Zucker umzuwandeln; dabei wird Sauerstoff frei."],
    ru: ["Фотосинтез", "Растения используют энергию света, чтобы превращать воду и углекислый газ в сахара и выделять кислород."],
    uk: ["Фотосинтез", "Рослини використовують енергію світла, щоб перетворювати воду й вуглекислий газ на цукри та виділяти кисень."]
  },
  grawitacja: {
    en: ["Gravity", "Gravity is an interaction between objects with mass. Near Earth, it pulls objects toward the planet."],
    es: ["Gravedad", "La gravedad es una interacción entre objetos con masa. Cerca de la Tierra, atrae los objetos hacia el planeta."],
    fr: ["Gravité", "La gravité est une interaction entre des objets qui ont une masse. Près de la Terre, elle attire les objets vers la planète."],
    de: ["Schwerkraft", "Gravitation ist eine Wechselwirkung zwischen Körpern mit Masse. In Erdnähe zieht sie Gegenstände zum Planeten."],
    ru: ["Гравитация", "Гравитация — это взаимодействие тел, имеющих массу. Рядом с Землёй она притягивает предметы к планете."],
    uk: ["Гравітація", "Гравітація — це взаємодія тіл, що мають масу. Поблизу Землі вона притягує предмети до планети."]
  },
  atom: {
    en: ["Atom", "An atom has a nucleus made of protons and usually neutrons, with electrons around it."],
    es: ["Átomo", "Un átomo tiene un núcleo con protones y, normalmente, neutrones; los electrones se encuentran alrededor."],
    fr: ["Atome", "Un atome possède un noyau composé de protons et généralement de neutrons, entouré d’électrons."],
    de: ["Atom", "Ein Atom besitzt einen Kern aus Protonen und meist Neutronen; Elektronen befinden sich in seiner Umgebung."],
    ru: ["Атом", "У атома есть ядро из протонов и обычно нейтронов, а вокруг него находятся электроны."],
    uk: ["Атом", "Атом має ядро з протонів і зазвичай нейтронів, а навколо нього розташовані електрони."]
  },
  komorka: {
    en: ["Cell", "A cell is the basic structural and functional unit of living organisms."],
    es: ["Célula", "La célula es la unidad básica de estructura y funcionamiento de los seres vivos."],
    fr: ["Cellule", "La cellule est l’unité de base qui constitue les êtres vivants et assure leur fonctionnement."],
    de: ["Zelle", "Die Zelle ist die grundlegende Bau- und Funktionseinheit lebender Organismen."],
    ru: ["Клетка", "Клетка — основная структурная и функциональная единица живых организмов."],
    uk: ["Клітина", "Клітина — основна структурна й функціональна одиниця живих організмів."]
  },
  dna: {
    en: ["DNA", "DNA stores genetic information used by cells. A gene is a section of DNA associated with a function or trait."],
    es: ["ADN", "El ADN almacena información genética que usan las células. Un gen es una parte del ADN relacionada con una función o característica."],
    fr: ["ADN", "L’ADN stocke l’information génétique utilisée par les cellules. Un gène est une portion d’ADN associée à une fonction ou à un caractère."],
    de: ["DNA", "DNA speichert genetische Information, die Zellen nutzen. Ein Gen ist ein DNA-Abschnitt, der mit einer Funktion oder einem Merkmal verbunden ist."],
    ru: ["ДНК", "ДНК хранит генетическую информацию, используемую клетками. Ген — это участок ДНК, связанный с функцией или признаком."],
    uk: ["ДНК", "ДНК зберігає генетичну інформацію, яку використовують клітини. Ген — це ділянка ДНК, пов’язана з функцією або ознакою."]
  },
  sila: {
    en: ["Force", "A force is an interaction that can change an object's motion or shape. Its SI unit is the newton (N)."],
    es: ["Fuerza", "Una fuerza es una interacción que puede cambiar el movimiento o la forma de un objeto. Su unidad SI es el newton (N)."],
    fr: ["Force", "Une force est une interaction qui peut modifier le mouvement ou la forme d’un objet. Son unité SI est le newton (N)."],
    de: ["Kraft", "Eine Kraft ist eine Wechselwirkung, die Bewegung oder Form eines Körpers ändern kann. Die SI-Einheit ist das Newton (N)."],
    ru: ["Сила", "Сила — это взаимодействие, способное изменить движение или форму тела. Единица СИ — ньютон (Н)."],
    uk: ["Сила", "Сила — це взаємодія, що може змінити рух або форму тіла. Одиниця SI — ньютон (Н)."]
  },
  predkosc: {
    en: ["Speed", "Average speed is distance divided by time: v = s/t. Keep the distance and time units consistent."],
    es: ["Velocidad media", "La rapidez media es la distancia dividida por el tiempo: v = s/t. Usa unidades compatibles."],
    fr: ["Vitesse moyenne", "La vitesse moyenne est la distance divisée par le temps : v = d/t. Les unités doivent être cohérentes."],
    de: ["Durchschnittsgeschwindigkeit", "Die Durchschnittsgeschwindigkeit ist die Strecke geteilt durch die Zeit: v = s/t. Achte auf passende Einheiten."],
    ru: ["Средняя скорость", "Средняя скорость равна пути, делённому на время: v = s/t. Единицы измерения должны быть согласованы."],
    uk: ["Середня швидкість", "Середня швидкість дорівнює шляху, поділеному на час: v = s/t. Одиниці вимірювання мають узгоджуватися."]
  },
  gestosc: {
    en: ["Density", "Density is mass divided by volume: ρ = m/V. Compare values using the same units."],
    es: ["Densidad", "La densidad es la masa dividida por el volumen: ρ = m/V. Compara valores con las mismas unidades."],
    fr: ["Masse volumique", "La masse volumique est la masse divisée par le volume : ρ = m/V. Utilise les mêmes unités pour comparer."],
    de: ["Dichte", "Die Dichte ist die Masse geteilt durch das Volumen: ρ = m/V. Vergleiche Werte nur mit passenden Einheiten."],
    ru: ["Плотность", "Плотность равна массе, делённой на объём: ρ = m/V. Для сравнения используй одинаковые единицы."],
    uk: ["Густина", "Густина дорівнює масі, поділеній на об’єм: ρ = m/V. Для порівняння використовуй однакові одиниці."]
  },
  "uklad sloneczny": {
    en: ["Solar System", "The Solar System consists of the Sun and the objects held in orbit by its gravity, including planets and smaller bodies."],
    es: ["Sistema Solar", "El Sistema Solar incluye el Sol y los cuerpos que orbitan gracias a su gravedad, como los planetas y otros objetos."],
    fr: ["Système solaire", "Le Système solaire comprend le Soleil et les objets en orbite sous l’effet de sa gravité, notamment les planètes."],
    de: ["Sonnensystem", "Zum Sonnensystem gehören die Sonne und die von ihrer Schwerkraft gebundenen Himmelskörper, darunter die Planeten."],
    ru: ["Солнечная система", "Солнечная система включает Солнце и обращающиеся вокруг него под действием его гравитации объекты, в том числе планеты."],
    uk: ["Сонячна система", "Сонячна система містить Сонце та об’єкти, що обертаються навколо нього під дією його гравітації, зокрема планети."]
  },
  algorytm: {
    en: ["Algorithm", "An algorithm is a clear, ordered set of steps for solving a problem or completing a task."],
    es: ["Algoritmo", "Un algoritmo es una serie clara y ordenada de pasos para resolver un problema o realizar una tarea."],
    fr: ["Algorithme", "Un algorithme est une suite claire et ordonnée d’étapes permettant de résoudre un problème ou d’accomplir une tâche."],
    de: ["Algorithmus", "Ein Algorithmus ist eine eindeutige, geordnete Folge von Schritten zur Lösung eines Problems oder einer Aufgabe."],
    ru: ["Алгоритм", "Алгоритм — это понятная упорядоченная последовательность шагов для решения задачи."],
    uk: ["Алгоритм", "Алгоритм — це зрозуміла впорядкована послідовність кроків для розв’язання задачі."]
  }
};

Object.assign(LOCALIZED_ANSWERS.fotosynteza, {
  ja: ["光合成", "植物は光のエネルギーを使って水と二酸化炭素から糖をつくり、酸素を放出します。"],
  zh: ["光合作用", "植物利用光能把水和二氧化碳转化为糖，并释放氧气。"]
});
Object.assign(LOCALIZED_ANSWERS.grawitacja, {
  ja: ["重力", "重力は質量をもつ物体どうしの相互作用です。地球の近くでは物体を地球へ引き寄せます。"],
  zh: ["引力", "引力是有质量物体之间的相互作用。在地球附近，它会把物体拉向地球。"]
});
Object.assign(LOCALIZED_ANSWERS.atom, {
  ja: ["原子", "原子は陽子と通常は中性子からなる原子核をもち、その周りに電子があります。"],
  zh: ["原子", "原子由原子核和核外电子组成。原子核含有质子，通常也含有中子。"]
});
Object.assign(LOCALIZED_ANSWERS.komorka, {
  ja: ["細胞", "細胞は生物の体をつくり、生命活動を行う基本単位です。"],
  zh: ["细胞", "细胞是生物体结构和生命活动的基本单位。"]
});
Object.assign(LOCALIZED_ANSWERS.dna, {
  ja: ["DNA", "DNAは細胞が使う遺伝情報を保存します。遺伝子は、特定の働きや特徴に関係するDNAの一部分です。"],
  zh: ["DNA", "DNA储存细胞使用的遗传信息。基因是与某种功能或特征有关的一段DNA。"]
});
Object.assign(LOCALIZED_ANSWERS.sila, {
  ja: ["力", "力は物体の動きや形を変える相互作用です。SI単位はニュートン（N）です。"],
  zh: ["力", "力是能改变物体运动或形状的相互作用。国际单位是牛顿（N）。"]
});
Object.assign(LOCALIZED_ANSWERS.predkosc, {
  ja: ["平均の速さ", "平均の速さは道のりを時間で割って求めます：v = s/t。単位をそろえましょう。"],
  zh: ["平均速度", "平均速度等于路程除以时间：v = s/t。计算时要统一单位。"]
});
Object.assign(LOCALIZED_ANSWERS.gestosc, {
  ja: ["密度", "密度は質量を体積で割った値です：ρ = m/V。比べるときは単位をそろえます。"],
  zh: ["密度", "密度等于质量除以体积：ρ = m/V。比较时要使用相同单位。"]
});
Object.assign(LOCALIZED_ANSWERS["uklad sloneczny"], {
  ja: ["太陽系", "太陽系は太陽と、その重力に引かれて周回する惑星などの天体から成ります。"],
  zh: ["太阳系", "太阳系由太阳以及受太阳引力约束而运行的行星等天体组成。"]
});
Object.assign(LOCALIZED_ANSWERS.algorytm, {
  ja: ["アルゴリズム", "アルゴリズムは、問題を解いたり作業を行ったりするための明確で順序立った手順です。"],
  zh: ["算法", "算法是解决问题或完成任务时使用的一组清晰、有顺序的步骤。"]
});

export function getLocalizedGlossaryAnswer(question, language) {
  const canonical = expandMultilingualQuestion(question).split(" ").find(Boolean);
  if (!canonical) return null;
  const translations = LOCALIZED_ANSWERS[fold(canonical).replace(/ /g, " ")];
  const localized = translations?.[language];
  return localized ? `## 🐨 ${localized[0]}\n\n${localized[1]}` : null;
}

export const MULTILINGUAL_GLOSSARY_SIZE = GLOSSARY.reduce((total, concept) => total + concept.aliases.length, 0);
