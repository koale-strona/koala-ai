/*
 * Koala.ai v7 — Brain — lokalny, edukacyjny silnik regułowy z kontekstem i dodatkową wiedzą historyczną.
 * Bez zewnętrznych modeli AI, kluczy API i dodatkowych zależności.
 * Zachowuje bazę wiedzy, matematykę, historię rozmowy i tryb nauczyciela.
 * To nie jest ogólny model językowy — odpowiedzi wynikają z reguł i wiedzy w pliku.
 */

const MAX_QUESTION_LENGTH = 2000;
const MAX_HISTORY_ITEMS = 24;
const MAX_MATH_LENGTH = 180;
const MAX_MATH_TOKENS = 80;

const knowledge = [
  {
    title: "Rzeczownik",
    keywords: ["rzeczownik", "co to jest rzeczownik"],
    aliases: ["rzeczownika", "rzeczowniku"],
    short: "Rzeczownik nazywa osoby, zwierzęta, rzeczy, miejsca, zjawiska i pojęcia.",
    explanation: "Odpowiada na pytania: kto? co? Odmienia się przez przypadki i liczby. Występuje w rodzaju męskim, żeńskim lub nijakim.",
    example: "W zdaniu „Pies biega” wyraz „pies” jest rzeczownikiem. Inne przykłady: uczeń, książka, szkoła, radość.",
    related: "Rzeczownik często występuje z przymiotnikiem, który opisuje jego cechy.",
    check: "W zdaniu „Zielony kot śpi” wskaż rzeczownik."
  },
  {
    title: "Czasownik",
    keywords: ["czasownik", "co to jest czasownik"],
    aliases: ["czasownika", "czasowniku"],
    short: "Czasownik oznacza czynność, stan lub proces.",
    explanation: "Odpowiada na pytania: co robi? co się z nim dzieje? Czasowniki występują w czasie przeszłym, teraźniejszym i przyszłym oraz odmieniają się przez osoby i liczby.",
    example: "W zdaniu „Ola czyta książkę” wyraz „czyta” jest czasownikiem. Inne przykłady: pisze, biega, śpi.",
    related: "Czasownik jest ważnym elementem orzeczenia w zdaniu.",
    check: "Znajdź czasownik w zdaniu: „Dzieci grają w piłkę”."
  },
  {
    title: "Przymiotnik",
    keywords: ["przymiotnik", "co to jest przymiotnik"],
    aliases: ["przymiotnika", "przymiotniku"],
    short: "Przymiotnik określa cechy osób, rzeczy i zjawisk.",
    explanation: "Odpowiada na pytania: jaki? jaka? jakie? Dopasowuje się do rzeczownika pod względem rodzaju, liczby i przypadku.",
    example: "W wyrażeniu „zielona trawa” wyraz „zielona” jest przymiotnikiem. Inne przykłady: wysoki budynek, ciekawe książki.",
    related: "Przymiotnik najczęściej opisuje rzeczownik.",
    check: "Który wyraz jest przymiotnikiem: „mały pies szybko biegnie”?"
  },
  {
    title: "Przysłówek",
    keywords: ["przysłówek", "przyslowek", "co to jest przysłówek"],
    aliases: ["przysłówka", "przysłówku"],
    short: "Przysłówek określa sposób, miejsce, czas lub stopień wykonywania czynności.",
    explanation: "Odpowiada między innymi na pytania: jak? gdzie? kiedy? Często określa czasownik.",
    example: "W zdaniu „Ola biegnie szybko” wyraz „szybko” jest przysłówkiem. Inne przykłady: daleko, wczoraj, bardzo.",
    related: "Od wielu przymiotników można utworzyć przysłówki, np. szybki — szybko.",
    check: "Jakim pytaniem rozpoznasz przysłówek „wczoraj”?"
  },
  {
    title: "Zaimek",
    keywords: ["zaimek", "co to jest zaimek"],
    aliases: ["zaimka", "zaimku"],
    short: "Zaimek zastępuje inne części mowy, najczęściej rzeczownik, przymiotnik lub liczebnik.",
    explanation: "Dzięki zaimkom nie musimy stale powtarzać tych samych wyrazów. Przykłady pytań: kto? jaki? ile? czyj?",
    example: "Zamiast „Ania wzięła książkę Ani” możemy powiedzieć „Ania wzięła swoją książkę”. Wyraz „swoją” jest zaimkiem.",
    related: "Przykłady zaimków: ja, ty, on, ona, mój, ten, tyle, kto.",
    check: "W zdaniu „Ona czyta swoją książkę” wskaż dwa zaimki."
  },
  {
    title: "Liczby pierwsze",
    keywords: ["liczba pierwsza", "liczby pierwsze"],
    aliases: ["liczb pierwszych", "liczbach pierwszych"],
    short: "Liczba pierwsza to liczba naturalna większa od 1, która ma dokładnie dwa dzielniki: 1 i samą siebie.",
    explanation: "Aby sprawdzić, czy liczba jest pierwsza, szukamy dzielników innych niż 1 i ona sama. Jeśli żadnego nie ma, liczba jest pierwsza.",
    example: "2, 3, 5, 7, 11 i 13 są pierwsze. 9 nie jest pierwsza, bo dzieli się przez 3.",
    related: "Liczba 2 jest jedyną parzystą liczbą pierwszą. Liczba 1 nie jest pierwsza.",
    check: "Czy 15 jest liczbą pierwszą? Spróbuj znaleźć jej dzielnik oprócz 1 i 15."
  },
  {
    title: "Ułamki zwykłe",
    keywords: ["ułamek zwykły", "ulamek zwykly", "ułamek", "ulamek", "ułamki", "ulamki"],
    aliases: ["ułamka zwykłego", "ułamków zwykłych", "ułamkach zwykłych"],
    short: "Ułamek zwykły przedstawia część całości. Składa się z licznika i mianownika.",
    explanation: "Mianownik jest pod kreską i mówi, na ile równych części podzielono całość. Licznik jest nad kreską i mówi, ile części wybrano.",
    example: "W ułamku 3/4 mianownik 4 oznacza cztery równe części, a licznik 3 oznacza trzy wybrane części.",
    related: "Ułamki można skracać, rozszerzać, dodawać, odejmować, mnożyć i dzielić.",
    check: "W ułamku 2/5 wskaż licznik i mianownik."
  },
  {
    title: "Procenty",
    keywords: ["procent", "procenty", "co to jest procent"],
    aliases: ["procentów", "procencie", "procentach"],
    short: "Procent oznacza jedną setną całości. Zapisujemy go symbolem %.",
    explanation: "100% to całość, 50% to połowa, 25% to jedna czwarta, a 10% to jedna dziesiąta. Procent zamieniamy na ułamek dziesiętny, dzieląc przez 100.",
    example: "20% z 50 to 10, ponieważ 20/100 × 50 = 10.",
    related: "Procenty wykorzystujemy m.in. przy obniżkach, podwyżkach, wynikach i statystykach.",
    check: "Ile wynosi 10% z 80?"
  },
  {
    title: "Pole kwadratu",
    keywords: ["pole kwadratu", "jak obliczyć pole kwadratu", "jak obliczyc pole kwadratu"],
    aliases: ["pola kwadratu", "polu kwadratu"],
    short: "Pole kwadratu obliczamy ze wzoru P = a × a, czyli P = a².",
    explanation: "Litera a oznacza długość boku. Pole opisuje powierzchnię figury, dlatego wynik zapisujemy w jednostkach kwadratowych, np. cm².",
    example: "Jeśli bok ma 4 cm, to P = 4 × 4 = 16 cm².",
    related: "Obwód kwadratu obliczamy ze wzoru O = 4 × a.",
    check: "Kwadrat ma bok 5 cm. Jaki jest jego wzór na pole i wynik?"
  },
  {
    title: "Pole prostokąta",
    keywords: ["pole prostokąta", "pole prostokata", "prostokąt", "prostokat"],
    aliases: ["pola prostokąta", "polu prostokąta"],
    short: "Pole prostokąta obliczamy ze wzoru P = a × b.",
    explanation: "Mnożymy długość jednego boku przez długość drugiego boku. Wynik zapisujemy w jednostkach kwadratowych.",
    example: "Dla boków 6 cm i 3 cm: P = 6 × 3 = 18 cm².",
    related: "Obwód prostokąta to O = 2a + 2b.",
    check: "Prostokąt ma boki 7 cm i 2 cm. Jak obliczysz jego pole?"
  },
  {
    title: "Obwód kwadratu",
    keywords: ["obwód kwadratu", "obwod kwadratu"],
    aliases: ["obwodu kwadratu", "obwodzie kwadratu"],
    short: "Obwód kwadratu obliczamy ze wzoru O = 4 × a.",
    explanation: "Kwadrat ma cztery równe boki. Obwód to suma długości wszystkich boków.",
    example: "Jeśli bok ma 3 cm, obwód wynosi 3 + 3 + 3 + 3 = 12 cm.",
    related: "Pole kwadratu obliczamy ze wzoru P = a². Obwód i pole to różne wielkości.",
    check: "Kwadrat ma bok 6 cm. Jaki jest jego obwód?"
  },
  {
    title: "Obwód prostokąta",
    keywords: ["obwód prostokąta", "obwod prostokata"],
    aliases: ["obwodu prostokąta", "obwodzie prostokąta"],
    short: "Obwód prostokąta obliczamy ze wzoru O = 2a + 2b.",
    explanation: "Dodajemy długości wszystkich czterech boków. Przeciwległe boki prostokąta są równe.",
    example: "Dla boków 5 cm i 3 cm: O = 5 + 3 + 5 + 3 = 16 cm.",
    related: "Pole prostokąta obliczamy ze wzoru P = a × b.",
    check: "Prostokąt ma boki 8 cm i 4 cm. Oblicz jego obwód."
  },
  {
    title: "Fotosynteza",
    keywords: ["fotosynteza", "co to jest fotosynteza"],
    aliases: ["fotosyntezy", "fotosyntezie", "fotosyntezę", "fotosynteze"],
    short: "Fotosynteza to proces, w którym rośliny wykorzystują energię światła do wytwarzania substancji organicznych.",
    explanation: "Rośliny pobierają wodę i dwutlenek węgla. Dzięki energii światła i chlorofilowi wytwarzają związki organiczne, między innymi glukozę. W procesie uwalnia się tlen.",
    example: "Liście pobierają światło słoneczne, a roślina wykorzystuje jego energię podczas fotosyntezy.",
    related: "Fotosynteza dostarcza materii organicznej i uwalnia tlen.",
    check: "Jakie dwa surowce roślina pobiera do fotosyntezy?"
  },
  {
    title: "Oddychanie komórkowe",
    keywords: ["oddychanie komórkowe", "oddychanie komorkowe"],
    aliases: ["oddychania komórkowego", "oddychaniu komórkowym"],
    short: "Oddychanie komórkowe to proces uwalniania energii ze związków organicznych.",
    explanation: "W oddychaniu tlenowym komórki wykorzystują tlen do rozkładania glukozy. Powstają dwutlenek węgla, woda i energia magazynowana między innymi w ATP.",
    example: "Komórki mięśni wykorzystują energię uzyskaną w oddychaniu komórkowym do pracy.",
    related: "Fotosynteza magazynuje energię w związkach organicznych, a oddychanie komórkowe pozwala ją uwalniać.",
    check: "Jaki gaz jest wykorzystywany w oddychaniu tlenowym?"
  },
  {
    title: "Komórka",
    keywords: ["komórka biologiczna", "komorka biologiczna", "komórka", "komorka"],
    aliases: ["komórki", "komórce"],
    short: "Komórka jest podstawową jednostką budowy i funkcjonowania organizmów.",
    explanation: "Wiele komórek zawiera błonę komórkową, cytoplazmę i materiał genetyczny. Komórki roślinne mają dodatkowo m.in. ścianę komórkową i chloroplasty.",
    example: "Komórki mięśniowe umożliwiają ruch, a komórki nerwowe uczestniczą w przekazywaniu informacji.",
    related: "Wiele komórek może tworzyć tkanki, narządy i układy narządów.",
    check: "Wymień jedną strukturę charakterystyczną dla komórki roślinnej."
  },
  {
    title: "Układ Słoneczny",
    keywords: ["układ słoneczny", "uklad sloneczny", "planety układu słonecznego", "planety ukladu slonecznego"],
    aliases: ["układu słonecznego", "układzie słonecznym"],
    short: "Układ Słoneczny składa się ze Słońca oraz krążących wokół niego planet i innych ciał niebieskich.",
    explanation: "Grawitacja Słońca utrzymuje planety na orbitach. W Układzie Słonecznym znajdują się też księżyce, planety karłowate, asteroidy i komety.",
    example: "Osiem planet to: Merkury, Wenus, Ziemia, Mars, Jowisz, Saturn, Uran i Neptun.",
    related: "Ziemia jest trzecią planetą od Słońca.",
    check: "Która planeta znajduje się najbliżej Słońca?"
  },
  {
    title: "Grawitacja",
    keywords: ["grawitacja", "co to jest grawitacja"],
    aliases: ["grawitacji"],
    short: "Grawitacja to oddziaływanie, dzięki któremu obiekty posiadające masę przyciągają się.",
    explanation: "Siła przyciągania zależy między innymi od mas obiektów i odległości między nimi. Grawitacja Ziemi utrzymuje nas na jej powierzchni.",
    example: "Gdy puścisz piłkę, spada ona w kierunku podłoża wskutek przyciągania grawitacyjnego Ziemi.",
    related: "Grawitacja wpływa także na ruch Księżyca wokół Ziemi i planet wokół Słońca.",
    check: "Dlaczego piłka puszczona z ręki spada na ziemię?"
  },
  {
    title: "Atom",
    keywords: ["atom", "co to jest atom", "budowa atomu"],
    aliases: ["atomu", "atomie"],
    short: "Atom to podstawowa jednostka budowy pierwiastka chemicznego.",
    explanation: "Atom składa się z jądra, w którym znajdują się protony i neutrony, oraz elektronów znajdujących się wokół jądra.",
    example: "Atom wodoru ma jeden proton w jądrze i zwykle jeden elektron.",
    related: "Liczba protonów określa, jaki to pierwiastek chemiczny.",
    check: "Jak nazywają się cząstki znajdujące się w jądrze atomu?"
  },
  {
    title: "Energia",
    keywords: ["energia", "co to jest energia", "energia kinetyczna", "energia potencjalna"],
    aliases: ["energii", "energię"],
    short: "Energia opisuje zdolność układu do wykonania pracy lub wywołania zmian.",
    explanation: "Wyróżnia się między innymi energię kinetyczną, potencjalną, cieplną, chemiczną i elektryczną. Energia może zmieniać formę.",
    example: "Poruszający się rower ma energię kinetyczną, a podniesiony przedmiot — energię potencjalną grawitacji.",
    related: "Zgodnie z zasadą zachowania energii nie znika ona, lecz ulega przemianom.",
    check: "Jaką energię ma poruszający się rower?"
  },
  {
    title: "Demokracja",
    keywords: ["demokracja", "co to jest demokracja"],
    aliases: ["demokracji"],
    short: "Demokracja to forma rządów, w której obywatele mają udział w podejmowaniu decyzji publicznych.",
    explanation: "Obywatele mogą uczestniczyć w życiu politycznym między innymi poprzez wybory. Ważne są też prawa obywatelskie, pluralizm i praworządność.",
    example: "Wybory parlamentarne są jednym ze sposobów udziału obywateli w demokracji.",
    related: "Demokracja może mieć różne formy i rozwiązania instytucjonalne.",
    check: "W jaki sposób obywatele mogą uczestniczyć w demokracji?"
  },
  {
    title: "Pan Tadeusz",
    keywords: ["pan tadeusz", "autor pana tadeusza", "kto napisał pana tadeusza", "kto napisal pana tadeusza"],
    aliases: ["pana tadeusza"],
    short: "Autorem epopei „Pan Tadeusz” jest Adam Mickiewicz.",
    explanation: "Utwór został wydany w 1834 roku. Jego pełny tytuł brzmi „Pan Tadeusz, czyli Ostatni zajazd na Litwie”.",
    example: "Akcja utworu rozgrywa się na Litwie, a ważne tematy to życie szlachty i tęsknota za ojczyzną.",
    related: "Adam Mickiewicz jest jednym z najważniejszych polskich poetów romantycznych.",
    check: "Kto jest autorem „Pana Tadeusza”?"
  },
  {
    title: "Druga wojna światowa",
    keywords: ["druga wojna światowa", "druga wojna swiatowa", "ii wojna światowa", "ii wojna swiatowa"],
    aliases: ["drugiej wojny światowej", "drugiej wojnie światowej"],
    short: "II wojna światowa trwała od 1939 do 1945 roku.",
    explanation: "Rozpoczęła się 1 września 1939 roku atakiem Niemiec na Polskę. Był to największy konflikt zbrojny w historii.",
    example: "W Europie wojna zakończyła się w maju 1945 roku, a kapitulacja Japonii nastąpiła we wrześniu 1945 roku.",
    related: "Skutkami wojny były ogromne straty ludzkie, zniszczenia miast i zmiany granic państw.",
    check: "W którym roku rozpoczęła się II wojna światowa?"
  },
  {
    title: "Powstanie styczniowe",
    keywords: [
      "powstanie styczniowe",
      "kiedy było powstanie styczniowe",
      "kiedy wybuchło powstanie styczniowe",
      "data powstania styczniowego"
    ],
    aliases: ["powstania styczniowego", "powstaniu styczniowym", "powstanie styczniowe"],
    short: "Powstanie styczniowe wybuchło 22 stycznia 1863 roku.",
    explanation: "Było to polskie powstanie przeciwko Imperium Rosyjskiemu. Rozpoczęło się 22 stycznia 1863 roku i miało charakter głównie partyzancki. Walki i działalność oddziałów powstańczych trwały do jesieni 1864 roku.",
    example: "Najważniejsza data do zapamiętania: 22 stycznia 1863 roku — początek powstania styczniowego.",
    related: "Powstanie było największym polskim powstaniem narodowym XIX wieku. Jego klęska przyniosła represje i ograniczenie autonomii Królestwa Polskiego.",
    check: "W którym dniu i roku wybuchło powstanie styczniowe?"
  },
  {
    title: "Najdłuższa rzeka Polski",
    keywords: ["najdłuższa rzeka polski", "najdluzsza rzeka polski", "wisła", "wisla"],
    aliases: ["najdłuższej rzeki polski"],
    short: "Najdłuższą rzeką Polski jest Wisła.",
    explanation: "Wisła ma około 1047 km długości. Przepływa przez wiele regionów Polski i uchodzi do Morza Bałtyckiego.",
    example: "Do ważnych miast położonych nad Wisłą należą Kraków, Warszawa i Toruń.",
    related: "Wisła jest ważnym elementem geografii i historii Polski.",
    check: "Do jakiego morza uchodzi Wisła?"
  }
];

const teacherAnswerRules = {
  "Rzeczownik": { all: ["kot"], hint: "Poszukaj wyrazu nazywającego zwierzę." },
  "Czasownik": { all: [["graja", "grają"]], hint: "Szukaj wyrazu, który oznacza wykonywaną czynność." },
  "Przymiotnik": { all: ["maly"], hint: "Przymiotnik odpowiada między innymi na pytanie: jaki?" },
  "Przysłówek": { all: ["kiedy"], hint: "Zastanów się, na jakie pytanie odpowiada wyraz „wczoraj”." },
  "Zaimek": { all: ["ona", "swoja"], hint: "W zdaniu są dwa wyrazy zastępujące inne części mowy." },
  "Liczby pierwsze": { all: ["3"], hint: "Sprawdź, czy 15 można podzielić przez 3 bez reszty." },
  "Ułamki zwykłe": { all: ["2", "5"], hint: "Licznik jest nad kreską, a mianownik pod kreską." },
  "Procenty": { all: ["8"], hint: "10% to jedna dziesiąta liczby. Oblicz jedną dziesiątą z 80." },
  "Pole kwadratu": { all: ["25"], hint: "Pomnóż długość boku przez samą siebie: 5 × 5." },
  "Pole prostokąta": { all: ["14"], hint: "Pole obliczamy, mnożąc długości dwóch boków." },
  "Obwód kwadratu": { all: ["24"], hint: "Kwadrat ma cztery równe boki. Dodaj je." },
  "Obwód prostokąta": { all: ["24"], hint: "Dodaj wszystkie cztery boki: 8 + 4 + 8 + 4." },
  "Fotosynteza": { all: ["woda", "dwutlenek wegla"], hint: "Pomyśl, jakie dwa surowce roślina pobiera ze środowiska." },
  "Oddychanie komórkowe": { all: ["tlen"], hint: "Pomyśl, jaki gaz pobieramy podczas oddychania tlenowego." },
  "Komórka": { any: ["chloroplast", "sciana komorkowa"], hint: "Pomyśl o strukturach, które odróżniają komórkę roślinną." },
  "Układ Słoneczny": { all: ["merkury"], hint: "To planeta znajdująca się najbliżej Słońca." },
  "Grawitacja": { all: ["ziemia", "przyciaga"], hint: "Pomyśl, co sprawia, że puszczona piłka spada na podłoże." },
  "Atom": { all: ["proton", "neutron"], hint: "W jądrze atomu znajdują się dwa rodzaje cząstek." },
  "Energia": { all: ["kinetyczna"], hint: "To energia związana z ruchem." },
  "Demokracja": { all: ["wybory"], hint: "Pomyśl, w jaki sposób obywatele wybierają swoich przedstawicieli." },
  "Pan Tadeusz": { all: ["adam", "mickiewicz"], hint: "Chodzi o polskiego poetę epoki romantyzmu." },
  "Druga wojna światowa": { all: ["1939"], hint: "Pomyśl o roku ataku Niemiec na Polskę." },
  "Najdłuższa rzeka Polski": { any: ["baltyk", "baltyckiego"], hint: "Wisła uchodzi do morza na północy Polski." }
};

const STOPWORDS = new Set([
  "a", "aby", "ale", "albo", "bo", "by", "byc", "co", "czy", "dla", "do", "dlaczego",
  "gdzie", "i", "ile", "jak", "jaka", "jaki", "jakie", "jest", "jeszcze", "kiedy", "ktora",
  "ktore", "ktory", "lub", "ma", "mam", "mi", "mnie", "na", "nad", "nie", "o", "od",
  "oraz", "po", "pod", "poniewaz", "prosze", "przez", "się", "sie", "to", "w", "we",
  "z", "za", "ze", "że", "ten", "ta", "te", "tym", "tego", "tej", "mozesz", "mi"
]);

function normalize(value) {
  return String(value ?? "")
    .toLocaleLowerCase("pl-PL")
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[„”"'`]/g, " ")
    .replace(/[^\p{L}\p{N}%+*/().,^=\-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsPhrase(text, phrase) {
  const normalizedText = normalize(text);
  const normalizedPhrase = normalize(phrase);
  if (!normalizedPhrase) return false;
  return (` ${normalizedText} `).includes(` ${normalizedPhrase} `);
}

function lexicalTokens(value) {
  return normalize(value).split(/\s+/).filter(Boolean);
}

function tokenStemMatch(left, right) {
  if (left === right) return true;
  if (Math.min(left.length, right.length) < 5) return false;
  const common = Math.min(left.length, right.length, 7);
  return left.slice(0, common) === right.slice(0, common);
}

function phraseMatchScore(questionTokens, phrase) {
  const phraseTokens = lexicalTokens(phrase);
  if (!phraseTokens.length) return 0;
  const joined = questionTokens.join(' ');
  const normalizedPhrase = normalize(phrase);
  if ((` ${joined} `).includes(` ${normalizedPhrase} `)) return 100 + normalizedPhrase.length;

  let matched = 0;
  for (const part of phraseTokens) {
    if (questionTokens.some(token => tokenStemMatch(token, part))) matched++;
  }
  if (matched === phraseTokens.length) return 45 + normalizedPhrase.length;
  if (phraseTokens.length === 1 && matched === 1) return 25 + phraseTokens[0].length;
  return matched ? (matched / phraseTokens.length) * 12 : 0;
}

function findKnowledgeMatches(question) {
  const questionTokens = lexicalTokens(question);
  if (!questionTokens.length) return [];
  const matches = [];

  for (const item of knowledge) {
    const phrases = [...(item.keywords || []), ...(item.aliases || [])];
    let score = 0;
    let matchedPhrase = '';
    for (const phrase of phrases) {
      const candidate = phraseMatchScore(questionTokens, phrase);
      if (candidate > score) {
        score = candidate;
        matchedPhrase = phrase;
      }
    }
    if (score >= 25) matches.push({ item, score, matchedPhrase });
  }

  return matches.sort((a, b) => b.score - a.score);
}

function findKnowledge(question) {
  return findKnowledgeMatches(question)[0]?.item || null;
}

function isGreetingMessage(question) {
  const text = normalize(question).replace(/[!.?,]+$/g, "").trim();
  return /^(hej|hejka|czesc|siema|witaj|witam|hello|hi|elo|dzien dobry|dobry wieczor|dobranoc)( koala( ai)?| koalo)?$/.test(text);
}

function isThanksMessage(question) {
  const text = normalize(question).replace(/[!.?,]+$/g, "").trim();
  return /^(dziekuje|dzieki|wielkie dzieki|dziekuje koala|dzieki koala|dziekuje koalo|dzieki koalo|super dzieki)$/.test(text);
}

function isSocialMessage(question) {
  const text = normalize(question);
  return /^(jak sie masz|co tam|co u ciebie|jestes fajna|jestes super|kim jestes|co potrafisz|pomoz mi|potrzebuje pomocy)( koala)?\??$/.test(text);
}

function isCurrentInformationQuestion(question) {
  const text = normalize(question);
  return /\b(aktualnie|obecnie|dzisiaj|dzis|jutro|wczoraj|najnowsz\w*|na zywo|teraz|aktualn\w*|ostatnie wiadomosci|co nowego|co wiadomo|co sie dzieje|co sie wydarzylo|ostatnie informacje|ostatnie wydarzenia|na swiecie|w polsce)\b/.test(text)
    || /\b(mecz|mecze|spotkanie|terminarz|wynik meczu|pogoda|kurs walut|kurs euro|kurs dolara|aktualnosci|wiadomosci)\b/.test(text);
}

function asksToSearchOnline(question) {
  const text = normalize(question);
  return /\b(w internecie|online|w sieci|wyszukaj|poszukaj|szukaj w internecie|znajdz w internecie|znajdz w sieci|sprawdz w internecie|sprawdz online|zweryfikuj online|potwierdz w zrodlach|podsumuj wydarzenia|podsumuj wiadomosci|najnowsze wiadomosci|najnowsze wydarzenia|wikipedi\w*|wiki)\b/.test(text);
}

function looksLikeFactualQuestion(question) {
  const text = normalize(question);
  if (isGreetingMessage(text) || isThanksMessage(text) || isSocialMessage(text)) return false;
  return /\b(co to jest|czym jest|kto jest|kto byl|kto|gdzie|kiedy|ile|jak dziala|jak powstal|jak powstala|dlaczego|czemu|wymien|podaj informacje|opowiedz o|wyjasnij|co oznacza|co nowego|co wiadomo|najnowsze informacje|informacje o|historia|biografia|definicja|znaczenie|czy)\b/.test(text);
}

function getQuestionRoute(question, localAnswer = "", history = []) {
  const text = String(question ?? "").trim();
  if (!text) return { kind: "empty", shouldSearchWeb: false };
  if (isGreetingMessage(text)) return { kind: "greeting", shouldSearchWeb: false };
  if (isThanksMessage(text)) return { kind: "thanks", shouldSearchWeb: false };
  if (isSocialMessage(text)) return { kind: "social", shouldSearchWeb: false };

  const normalized = normalize(text);
  const topic = findKnowledge(text);
  const math = calculate(text) !== null;
  if (math) return { kind: "math", shouldSearchWeb: false };

  const followUpQuery = buildFollowUpSearchQuery(text, history);
  if (followUpQuery) {
    const anchor = getContextAnchorQuestion(history) || "";
    if (isWikipediaLookupFollowUp(text)) {
      return { kind: "search", shouldSearchWeb: true, topic: null, searchQuery: followUpQuery, preferredSource: "wikipedia" };
    }
    if (isSportsQuestion(anchor)) return { kind: "sports-search", shouldSearchWeb: true, searchQuery: followUpQuery };
    if (isNewsQuestion(anchor)) return { kind: "news-search", shouldSearchWeb: true, searchQuery: followUpQuery };
  }

  if (topic && !asksToSearchOnline(text) && !isCurrentInformationQuestion(text) && !isFollowUp(text)) {
    const matches = findKnowledgeMatches(text);
    if (getIntent(text) === "compare" && matches.length >= 2) {
      return { kind: "knowledge-comparison", shouldSearchWeb: false, topic: matches.slice(0, 3).map(item => item.item.title) };
    }
    return { kind: "knowledge", shouldSearchWeb: false, topic: topic.title };
  }

  const explicit = asksToSearchOnline(text) || isCurrentInformationQuestion(text);
  const unknownLocal = normalize(localAnswer).includes("nie mam jeszcze wystarczajacej wiedzy")
    || normalize(localAnswer).includes("nie znalazlam jeszcze tego zagadnienia");
  const shouldSearchWeb = explicit || (!topic && !math && looksLikeFactualQuestion(text)) || unknownLocal;

  if (isSportsQuestion(text)) return { kind: "sports-search", shouldSearchWeb: true, topic: null };
  if (isNewsQuestion(text)) return { kind: "news-search", shouldSearchWeb: true, topic: null };
  if (/\b(wikipedi\w*|wiki)\b/.test(normalized) && shouldSearchWeb) {
    return { kind: "search", shouldSearchWeb: true, topic: null, searchQuery: text, preferredSource: "wikipedia" };
  }
  return { kind: shouldSearchWeb ? "search" : "unknown", shouldSearchWeb, topic: topic?.title || null };
}

function getIntent(question) {
  const text = normalize(question);
  if (/\b(notatk\w*|podsumuj\w*|podsumowani\w*|skroc\w*|najwazniejsz\w*)\b/.test(text)) return "summary";
  if (/\b(porownaj|roznica miedzy|czym sie rozni|podobienstwa)\b/.test(text)) return "compare";
  if (/\b(przyklad\w*|podaj przyklad|daj przyklad)\b/.test(text)) return "example";
  if (/\b(prosciej|latwiej|nie rozumiem|wytlumacz\w*|wyjasn\w*|po ludzku)\b/.test(text)) return "simple";
  if (/\b(dlaczego|czemu|z jakiego powodu)\b/.test(text)) return "why";
  if (/\b(rozwin\w*|rozszerz\w*|dokladniej|wiecej|opowiedz wiecej|szerzej)\b/.test(text)) return "expand";
  if (/\b(sprawdz mnie|zrob quiz|przepytaj mnie|pytanie sprawdzajace|quiz)\b/.test(text)) return "quiz";
  return "normal";
}

function isFollowUp(question) {
  const text = normalize(question).replace(/[?.!,]+$/g, '').trim();
  return /^(a\s+)?(dlaczego|czemu|jak to|co to|co z tym|a co z|a jak|a kiedy|a gdzie|a kto|a ile|rozwin\w*|rozszerz\w*|dokladniej|wiecej|jeszcze|kolejne|nastepne|inny przyklad|przyklad|podaj przyklad|daj przyklad|prosciej|latwiej|nie rozumiem|podsumuj|skroc|sprawdz mnie|przepytaj mnie|zrob quiz|pokaz zrodla|inne zrodla|porownaj)\b/.test(text)
    || /^(wyjasnij|wytlumacz|pokaz mi|rozwin|podsumuj|skroc|przyklad)$/.test(text)
    || /^(a\s+)?(mozesz|czy mozesz)\s+(to\s+)?(wyjasnic|wytlumaczyc|rozwinac|skrocic|podsumowac|podac przyklad|pokazac)/.test(text)
    || /^(wyjasnij|wytlumacz)\s+(to|ten temat|to prosciej|mi to)/.test(text)
    || isWikipediaLookupFollowUp(question);
}

function isWikipediaLookupFollowUp(question) {
  const text = normalize(question).replace(/[?.!,]+$/g, "").trim();
  const mentionsWikipedia = /\b(wikipedi\w*|wiki)\b/.test(text);
  const asksToLook = /\b(zobaczysz|zobaczyc|sprawdzisz|sprawdzic|poszukasz|poszukac|wyszukasz|wyszukac|znajdziesz|znalezc|zerkniesz|czytasz|czy mozesz|mozesz)\b/.test(text);
  return mentionsWikipedia && asksToLook;
}

function isContextualFollowUp(question) {
  const text = normalize(question).replace(/[?.!,]+$/g, '').trim();
  return /^(a\s+)?(co jeszcze|a co jeszcze|a co dalej|a nastepne|nastepne|kolejne|wiecej|jeszcze wiecej|inne zrodla|pokaz zrodla|a wynik|a kiedy|a gdzie|a kto|a dlaczego|a czemu|a jak|rozwin|skroc|prosciej|latwiej|dokladniej|podaj przyklad|daj przyklad|pokaz kolejne)/.test(text)
    || isWikipediaLookupFollowUp(question);
}

function isTopicChange(question) {
  return /\b(zmienmy temat|zmien temat|zmieniamy temat|przejdzmy do|teraz matm\w*|teraz matematy\w*|teraz biologi\w*|teraz histori\w*|teraz geograf\w*|teraz polski)\b/.test(normalize(question));
}

function formatKnowledge(item, intent = "normal") {
  if (!item) return null;
  if (intent === "example") return `## 🐨 Przykład: ${item.title}\n\n${item.example}\n\n**Sprawdź, czy rozumiesz:**\n${item.check}`;
  if (intent === "simple") return `## 🐨 Wyjaśnijmy to prościej\n\n**${item.title}**\n\n${item.short}\n\n**Przykład:**\n${item.example}\n\nCzy teraz jest to bardziej zrozumiałe?`;
  if (intent === "summary") return `## 📝 Krótka notatka — ${item.title}\n\n**Najważniejsze:** ${item.short}\n\n**Warto zapamiętać:** ${item.explanation}\n\n**Przykład:** ${item.example}`;
  if (intent === "why") return `## 🐨 Dlaczego to jest ważne?\n\n${item.related}\n\n**Dokładniej:**\n${item.explanation}`;
  if (intent === "expand") return `## 📚 ${item.title} — rozwinięcie\n\n**1. Podstawowa definicja**\n${item.short}\n\n**2. Dokładniejsze wyjaśnienie**\n${item.explanation}\n\n**3. Przykład**\n${item.example}\n\n**4. Co warto zapamiętać?**\n${item.related}\n\n**🎓 Sprawdź swoją wiedzę**\n${item.check}`;
  if (intent === "quiz") return `## 🎓 Mini quiz — ${item.title}\n\n**Pytanie:** ${item.check}\n\nSpróbuj odpowiedzieć samodzielnie. Nie podam od razu rozwiązania! 🐨`;
  return `## 🐨 ${item.title}\n\n**Najważniejsze**\n${item.short}\n\n**Wyjaśnienie**\n${item.explanation}\n\n**Przykład**\n${item.example}\n\n**🎓 Sprawdź, czy rozumiesz**\n${item.check}\n\n_Możesz poprosić mnie o prostsze wyjaśnienie, przykład albo krótką notatkę._`;
}

function getSafeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter(item => item && typeof item === "object" && ["user", "model"].includes(item.role) && typeof item.text === "string")
    .slice(-MAX_HISTORY_ITEMS)
    .map(item => ({ role: item.role, text: item.text.slice(0, MAX_QUESTION_LENGTH) }));
}

function getPreviousUserQuestion(history) {
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i]?.role === "user" && typeof history[i].text === "string") return history[i].text;
  }
  return null;
}

function getPreviousAnswer(history) {
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i]?.role === "model" && typeof history[i].text === "string") return history[i].text;
  }
  return "";
}

function getPreviousTopic(history) {
  for (let i = history.length - 1; i >= 0; i--) {
    const item = history[i];
    if (!item || item.role !== "user" || typeof item.text !== "string") continue;
    if (isTopicChange(item.text)) return null;
    const topic = findKnowledge(item.text);
    if (topic) return topic;
  }
  return null;
}

function formatNumber(value) {
  return new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 8 }).format(value);
}

function cleanMathExpression(input) {
  let expression = String(input ?? "")
    .toLowerCase()
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  expression = expression
    .replace(/^(a\s+)?(ile to(?: jest)?|ile jest|oblicz|policz(?: mi)?|rozwiaz(?: mi)?|wynik)\s+/, "")
    .replace(/[?!=]+$/g, "")
    .replace(/(\d),(\d)/g, "$1.$2")
    .replace(/\b(pomnozone przez|mnozone przez|razy)\b/g, "*")
    .replace(/\b(plus|dodac)\b/g, "+")
    .replace(/\b(minus|odjac)\b/g, "-")
    .replace(/\b(podzielone przez|dzielone przez|podzielic przez|podziel przez)\b/g, "/")
    .replace(/\b(do potegi|podniesione do potegi)\b/g, "^")
    .replace(/[×x]/g, "*")
    .replace(/÷/g, "/")
    .replace(/\s+/g, " ")
    .trim();

  return expression;
}

function parseSimpleArithmetic(input) {
  const expression = cleanMathExpression(input);
  const match = expression.match(/^(-?\d+)\s*([+\-*/])\s*(-?\d+)$/);
  if (!match) return null;
  try {
    return { a: BigInt(match[1]), operator: match[2], b: BigInt(match[3]) };
  } catch {
    return null;
  }
}

function alignRight(value, width) {
  return String(value).padStart(width, " ");
}

function formatColumnWork(a, b, operator, result) {
  // Dodawanie i odejmowanie pisemne.
  if (["+", "-"].includes(operator) && a >= 0n && b >= 0n) {
    const width = Math.max(
      a.toString().length,
      (operator + b.toString()).length,
      result.toString().length
    );
    return [
      alignRight(a, width),
      alignRight(operator + b.toString(), width),
      "─".repeat(width),
      alignRight(result, width)
    ].join("\n");
  }

  // Pełne mnożenie pisemne: osobny wiersz dla każdej cyfry drugiego czynnika.
  if (operator === "*") {
    const absA = a < 0n ? -a : a;
    const absB = b < 0n ? -b : b;
    const absResult = absA * absB;
    const digits = absB.toString().split("").reverse();
    const partials = digits.map((digit, index) =>
      (absA * BigInt(digit) * (10n ** BigInt(index))).toString()
    );
    const signedResult = result.toString();
    const width = Math.max(
      absA.toString().length,
      (`× ${absB}`).length,
      absResult.toString().length,
      ...partials.map(line => line.length),
      signedResult.length
    );

    const lines = [
      alignRight(absA.toString(), width),
      alignRight(`× ${absB.toString()}`, width),
      "─".repeat(width),
      ...partials.map(line => alignRight(line, width))
    ];

    if (partials.length > 1) lines.push("─".repeat(width));
    lines.push(alignRight(signedResult, width));

    if ((a < 0n) !== (b < 0n)) {
      lines.push("Wynik jest ujemny, ponieważ czynniki mają różne znaki.");
    }

    return lines.join("\n");
  }

  if (operator === "/") {
    return `${a} : ${b}\n────────\nIloraz: ${a / b}\nReszta: ${a % b}`;
  }

  return `${a} ${operator} ${b} = ${result}`;
}

function explainCalculation(question) {
  const parsed = parseSimpleArithmetic(question);
  if (!parsed) return null;
  const { a, b, operator } = parsed;
  if (operator === "/" && b === 0n) return "Nie można dzielić przez zero.";

  let result;
  let name;
  let explanation;
  if (operator === "+") {
    result = a + b; name = "Dodawanie";
    explanation = `Zaczynamy od ${a} i dokładamy ${b}. Otrzymujemy ${result}.`;
  } else if (operator === "-") {
    result = a - b; name = "Odejmowanie";
    explanation = `Od ${a} odejmujemy ${b}. Otrzymujemy ${result}.`;
  } else if (operator === "*") {
    result = a * b; name = "Mnożenie";
    explanation = `Mnożenie oznacza wielokrotne dodawanie tej samej liczby. ${a} × ${b} = ${result}.`;
  } else {
    result = a / b; name = "Dzielenie";
    explanation = `Dzielimy ${a} przez ${b}. Iloraz wynosi ${result}, a reszta ${a % b}.`;
  }

  return `## 🐨 ${name} krok po kroku\n\n${explanation}\n\n**Zapis działania**\n\n\`\`\`text\n${formatColumnWork(a, b, operator, result)}\n\`\`\`\n\n**Zapamiętaj:** ważne jest nie tylko poznanie wyniku, ale też zrozumienie sposobu obliczania.\n\n**Spróbuj samodzielnie:** ${a} ${operator} ${b + 1n}`;
}

function formatKnowledgeComparison(items) {
  const uniqueItems = [...new Map(items.map(item => [item.title, item])).values()].slice(0, 3);
  if (uniqueItems.length < 2) return null;
  const sections = uniqueItems.map(item => `### ${item.title}\n${item.short}\n\n**Przykład:** ${item.example}`);
  return `## 🐨 Porównajmy pojęcia\n\n${sections.join("\n\n---\n\n")}\n\n**Najważniejsza wskazówka:** zwróć uwagę na to, co każde pojęcie opisuje i do czego służy.`;
}

function getContextAnchorQuestion(history) {
  const safe = getSafeHistory(history);
  for (let i = safe.length - 1; i >= 0; i--) {
    const item = safe[i];
    if (item.role !== "user") continue;
    const candidate = item.text.trim();
    if (!candidate || isGreetingMessage(candidate) || isThanksMessage(candidate) || isContextualFollowUp(candidate)) continue;
    return candidate;
  }
  return null;
}

function isSportsQuestion(question) {
  const text = normalize(question);
  return /\b(fcbarcelona|fcbarcelony|barcelona|barca|barcelony)\b/.test(text)
    && /\b(mecz|mecze|terminarz|spotkanie|najblizszy|najblizsza|najblizsze|kiedy|kalendarz|gra|wynik)\b/.test(text);
}

function isNewsQuestion(question) {
  const text = normalize(question);
  return /\b(wiadomosci|aktualnosci|wydarzenia|co sie dzieje|co sie wydarzylo|co nowego|na swiecie|ze swiata|najnowsz|ostatnie wydarzenia|podsumuj|w polsce)\b/.test(text);
}

function buildFollowUpSearchQuery(question, history) {
  const anchor = getContextAnchorQuestion(history);
  const wikiFollowUp = isWikipediaLookupFollowUp(question);
  if (!anchor || (!isContextualFollowUp(question) && !wikiFollowUp)) return null;

  if (wikiFollowUp) {
    return `${anchor}. Znajdź konkretny artykuł w polskiej Wikipedii dotyczący dokładnie tego tematu.`
      .slice(0, MAX_QUESTION_LENGTH);
  }

  const follow = normalize(question);
  let refinement = question.trim();
  if (/\b(kolejne|nastepne|wiecej|jeszcze)\b/.test(follow) && isSportsQuestion(anchor)) {
    refinement = "kolejne najbliższe mecze i terminarz";
  } else if (/\b(zrodla|inne zrodla|pokaz zrodla)\b/.test(follow)) {
    refinement = "oficjalne źródła i potwierdzenie informacji";
  } else if (/\b(wynik|rezultat)\b/.test(follow)) {
    refinement = "wynik i rezultat";
  }
  return `${anchor}. ${refinement}`.slice(0, MAX_QUESTION_LENGTH);
}

function calculatePercent(input) {
  const original = normalize(input).replace(/^(ile to|oblicz|policz) /, "");
  const match = original.match(/^(-?\d+(?:[.,]\d+)?)\s*(?:%|procent(?:y|ow|a)?)\s*(?:z\s*)?(-?\d+(?:[.,]\d+)?)$/);
  if (!match) return null;
  const percentage = Number(match[1].replace(",", "."));
  const whole = Number(match[2].replace(",", "."));
  const result = percentage * whole / 100;
  if (!Number.isFinite(result)) return null;
  return `## 🐨 Procenty — wynik: ${formatNumber(result)}\n\n1. Zamieniamy procent na ułamek: ${formatNumber(percentage)}% = ${formatNumber(percentage / 100)}.\n2. Mnożymy przez całość: ${formatNumber(percentage / 100)} × ${formatNumber(whole)}.\n3. Otrzymujemy **${formatNumber(result)}**.\n\n💡 Procent oznacza jedną setną całości.`;
}

function calculate(input) {
  const expression = cleanMathExpression(input);
  if (!expression || expression.length > MAX_MATH_LENGTH) return null;

  const percent = calculatePercent(input);
  if (percent) return percent;

  const simple = parseSimpleArithmetic(input);
  if (simple) {
    const { a, b, operator } = simple;
    if (operator === "/" && b === 0n) return "Nie można dzielić przez zero.";
    const result = operator === "+" ? a + b : operator === "-" ? a - b : operator === "*" ? a * b : a / b;
    const formattedResult = new Intl.NumberFormat("pl-PL").format(result);
    const workTitle = operator === "*"
      ? "Mnożenie pisemne"
      : operator === "+"
        ? "Dodawanie pisemne"
        : operator === "-"
          ? "Odejmowanie pisemne"
          : "Dzielenie";
    const multiplicationNote = operator === "*"
      ? "Każdy kolejny wiersz pokazuje mnożenie przez jedną cyfrę drugiego czynnika, z odpowiednim przesunięciem miejsca."
      : "";

    return `## 🐨 Wynik działania\n\n**${formattedResult}**\n\n**${workTitle}**\n\n\`\`\`text\n${formatColumnWork(a, b, operator, result)}\n\`\`\`\n\n${multiplicationNote ? `${multiplicationNote}\n\n` : ""}${operator === "/" && a % b !== 0n ? `Dzielenie daje resztę ${a % b}.` : "Działanie zostało wykonane dokładnie."}\n\n_Możesz napisać „wyjaśnij krok po kroku”, aby zobaczyć sposób obliczenia._`;
  }

  const tokens = [];
  const tokenPattern = /\s*(\d+(?:\.\d+)?|[()+\-*/^])\s*/gy;
  let position = 0;
  while (position < expression.length) {
    tokenPattern.lastIndex = position;
    const match = tokenPattern.exec(expression);
    if (!match) return null;
    tokens.push(match[1]);
    if (tokens.length > MAX_MATH_TOKENS) return null;
    position = tokenPattern.lastIndex;
  }
  if (!tokens.length) return null;

  let index = 0;
  function primary() {
    const token = tokens[index];
    if (token === "(") {
      index++;
      const value = addition();
      if (tokens[index] !== ")") throw new Error("Nawias");
      index++;
      return value;
    }
    if (/^\d/.test(token || "")) {
      index++;
      return Number(token);
    }
    throw new Error("Liczba");
  }
  function unary() {
    if (tokens[index] === "+") { index++; return unary(); }
    if (tokens[index] === "-") { index++; return -unary(); }
    return primary();
  }
  function power() {
    const left = unary();
    if (tokens[index] === "^") {
      index++;
      const right = power();
      if (Math.abs(right) > 10) throw new Error("Potęga");
      return left ** right;
    }
    return left;
  }
  function multiplication() {
    let value = power();
    while (["*", "/"].includes(tokens[index])) {
      const operator = tokens[index++];
      const right = power();
      if (operator === "/" && right === 0) throw new Error("Zero");
      value = operator === "*" ? value * right : value / right;
    }
    return value;
  }
  function addition() {
    let value = multiplication();
    while (["+", "-"].includes(tokens[index])) {
      const operator = tokens[index++];
      const right = multiplication();
      value = operator === "+" ? value + right : value - right;
    }
    return value;
  }

  try {
    const result = addition();
    if (index !== tokens.length || !Number.isFinite(result)) return null;
    return `## 🐨 Wynik: ${formatNumber(result)}\n\n**Kolejność działań:**\n1. Nawiasy.\n2. Potęgi.\n3. Mnożenie i dzielenie.\n4. Dodawanie i odejmowanie.`;
  } catch (error) {
    if (error.message === "Zero") return "Nie można dzielić przez zero.";
    return null;
  }
}

function getActiveTeacherTopic(history) {
  const previousAnswer = getPreviousAnswer(history);
  if (!previousAnswer || !/(pytanie do ciebie|podpowiedz)/i.test(previousAnswer)) return null;
  const match = previousAnswer.replace(/\*/g, "").match(/Temat lekcji:\s*([^\n]+)/i);
  if (!match) return null;
  const title = normalize(match[1]);
  return knowledge.find(item => normalize(item.title) === title) || null;
}

function evaluateTeacherAnswer(item, answer) {
  if (!item || typeof answer !== "string") return null;
  const rules = teacherAnswerRules[item.title];
  if (!rules) return null;
  const studentAnswer = normalize(answer);
  if (!studentAnswer) return null;

  const matchesEntry = entry => (Array.isArray(entry) ? entry : [entry]).some(term => containsPhrase(studentAnswer, term));
  const allCorrect = (rules.all || []).every(matchesEntry);
  const anyCorrect = !rules.any || rules.any.some(matchesEntry);

  if (allCorrect && anyCorrect) {
    return `## 🐨 🧑‍🏫 Bardzo dobrze!\n\nTwoja odpowiedź jest poprawna.\n\n**Temat:** ${item.title}\n\n**Zapamiętaj:** ${item.related}\n\n🎓 Lekcja zakończona! Możemy przejść do następnego tematu.`;
  }
  return `## 🐨 🧑‍🏫 Mała podpowiedź\n\n**Temat lekcji:** ${item.title}\n\nJeszcze nie całkiem — spróbujmy ponownie.\n\n${rules.hint}\n\nNapisz odpowiedź własnymi słowami. Nie podam od razu gotowego rozwiązania.`;
}

function startTeacherLesson(item) {
  if (!item) return null;
  return `## 🐨 🧑‍🏫 Tryb nauczyciela\n\n**Temat lekcji:** ${item.title}\n\n### Krok 1 — Poznajmy temat\n${item.short}\n\n### Krok 2 — Zrozumienie\n${item.explanation}\n\n### Krok 3 — Przykład\n${item.example}\n\n### 🎓 Pytanie do Ciebie\n${item.check}\n\nOdpowiedz własnymi słowami. Sprawdzę odpowiedź i dam Ci podpowiedź, jeśli będzie potrzebna.`;
}

function createLearningHint(topic) {
  return `## 🐨 Zróbmy to razem\n\nNie mam jeszcze wystarczającej wiedzy zapisanej lokalnie o temacie **„${topic}”**. Nie chcę zgadywać.\n\nMożemy zacząć od definicji, prostego wyjaśnienia, przykładu i krótkiego ćwiczenia. Możesz też poprosić mnie o sprawdzenie tematu w dostępnych źródłach internetowych.`;
}

export function classifyQuestion(question, localAnswer = "", history = []) {
  const safeHistory = getSafeHistory(history);
  const route = getQuestionRoute(question, localAnswer, safeHistory);
  const activeTeacher = getActiveTeacherTopic(safeHistory);

  if (activeTeacher && !isFollowUp(question) && !isGreetingMessage(question) && !isThanksMessage(question)) {
    return { ...route, kind: "teacher-answer", shouldSearchWeb: false, topic: activeTeacher.title, searchQuery: null };
  }

  if (route.kind === "unknown" && isFollowUp(question)) {
    const previousTopic = getPreviousTopic(safeHistory);
    if (previousTopic) {
      return { kind: "knowledge", shouldSearchWeb: false, topic: previousTopic.title, searchQuery: null };
    }
  }

  return route;
}

export function answerQuestion(question, history = []) {
  try {
    const text = String(question ?? "").trim();
    if (!text) return "🐨 Napisz pytanie lub wklej zadanie, a razem je rozwiążemy!";
    if (text.length > MAX_QUESTION_LENGTH) {
      return `Twoja wiadomość jest za długa. Skróć ją do maksymalnie ${MAX_QUESTION_LENGTH} znaków.`;
    }

    const safeHistory = getSafeHistory(history);
    const normalized = normalize(text);
    const intent = getIntent(text);

    // Krótkie rozmowy nigdy nie uruchamiają wyszukiwarki.
    if (isGreetingMessage(text)) {
      return "## 🐨 Hej! Jestem Koala.ai.\n\nMogę pomóc Ci z matematyką, językiem polskim, przyrodą, historią i innymi szkolnymi tematami. Wyjaśnię zagadnienie, pokażę przykład albo przeprowadzę Cię przez zadanie krok po kroku.\n\n**Co dziś chcesz zrozumieć?**";
    }
    if (isThanksMessage(text)) return "Nie ma za co! 🐨 Dobra robota. Możemy przejść do następnego pytania.";
    if (isSocialMessage(text)) {
      if (/kim jestes|co potrafisz/.test(normalized)) {
        return "## 🐨 Jestem Koala.ai\n\nJestem własnym, lokalnym silnikiem edukacyjnym opartym na kodzie, regułach, bazie wiedzy i analizie kontekstu rozmowy. Nie korzystam z zewnętrznego modelu językowego. Pomagam w nauce, wybranych obliczeniach i analizie informacji z witryn skonfigurowanych w wyszukiwarce.";
      }
      return "U mnie wszystko dobrze — jestem gotowa do pomocy! 🐨 Nad czym dziś pracujesz?";
    }

    if (isTopicChange(text)) return "Jasne, zmieniamy temat! 🐨 Napisz, czego teraz chcesz się nauczyć.";

    const activeTeacherTopic = getActiveTeacherTopic(safeHistory);
    if (activeTeacherTopic && !isFollowUp(text)) {
      if (/^(koniec lekcji|zakoncz lekcje|stop)$/i.test(normalized)) {
        return "🐨 Lekcja zakończona! Dobra robota. Możemy rozpocząć nowy temat.";
      }
      const teacherResult = evaluateTeacherAnswer(activeTeacherTopic, text);
      if (teacherResult) return teacherResult;
    }

    // Najpierw rozpoznajemy, czy pytanie odnosi się do poprzedniego tematu.
    if (isFollowUp(text)) {
      const previousQuestion = getPreviousUserQuestion(safeHistory);
      const anchorQuestion = getContextAnchorQuestion(safeHistory) || previousQuestion;
      if (anchorQuestion) {
        const previousCalculation = explainCalculation(anchorQuestion);
        if (previousCalculation && /przyklad|wyjasn|wytlumacz|prosciej|dlaczego|czemu|krok/.test(normalized)) {
          return previousCalculation;
        }
        const contextTopic = findKnowledge(anchorQuestion) || getPreviousTopic(safeHistory);
        if (contextTopic) return formatKnowledge(contextTopic, intent);
      }

      const previousAnswer = getPreviousAnswer(safeHistory);
      if (previousAnswer && previousAnswer.length > 80) {
        return "🐨 Rozumiem, że nawiązujesz do poprzedniej odpowiedzi. Napisz, który konkretnie fragment mam rozwinąć, uprościć lub porównać — wtedy skupię się na nim zamiast zgadywać.";
      }
    }

    // Porównywanie dwóch lub więcej tematów z lokalnej bazy.
    if (intent === "compare") {
      const matches = findKnowledgeMatches(text).map(match => match.item);
      const comparison = formatKnowledgeComparison(matches);
      if (comparison) return comparison;
    }

    // Tryb nauczyciela.
    const knowledgeItem = findKnowledge(text);
    if (knowledgeItem) {
      const wantsTeacher = /\b(naucz mnie|nauczysz mnie|tryb nauczyciela|lekcja|lekcje|przepytaj mnie|sprawdz mnie|zrob quiz|quiz)\b/.test(normalized);
      if (wantsTeacher || intent === "quiz") return startTeacherLesson(knowledgeItem);
      return formatKnowledge(knowledgeItem, intent);
    }

    // Matematyka — usuń polecenie, aby parser dostał samo działanie.
    const mathInput = text
      .replace(/^\s*(?:prosz[eę]\s+)?(?:wyja[sś]nij|wyt[lł]umacz|poka[zż]|oblicz|policz|rozwi[aą][zż])\s+(?:mi\s+)?/i, "")
      .replace(/^krok\s+po\s+kroku\s*[:,]?\s*/i, "")
      .replace(/^to\s*[:,]?\s*/i, "")
      .trim();
    const calculationExplanation = explainCalculation(mathInput);
    if (calculationExplanation && /\b(wyjasn\w*|wytlumacz\w*|pokaz\w*|krok po kroku|dlaczego|jak to zrobic)\b/.test(normalized)) {
      return calculationExplanation;
    }
    const calculation = calculate(text);
    if (calculation !== null) return calculation;

    if (/\b(naucz mnie|chce sie nauczyc|nauczysz mnie|zrobmy cwiczenia|przygotuj mnie|przepytaj mnie|sprawdz mnie)\b/.test(normalized)) {
      return "## 🐨 Zrobimy to razem!\n\nWybierz temat, którego chcesz się nauczyć. Mogę przygotować proste wyjaśnienie, przykłady, krótką notatkę, pytania sprawdzające i zadania do samodzielnego rozwiązania.\n\nNapisz nazwę tematu, a zaczniemy.";
    }

    if (/\b(notatk\w*|notatka|podsumowani\w*|streszczeni\w*|quiz|test)\b/.test(normalized)) {
      return "🐨 Jasne! Podaj temat albo wklej materiał, z którego mam przygotować notatkę, streszczenie lub quiz.";
    }

    return createLearningHint(text);
  } catch (error) {
    console.error("Koala engine error:", error?.message || error);
    return "🐨 Coś poszło nie tak podczas przygotowywania odpowiedzi. Spróbuj napisać pytanie inaczej.";
  }
}

export { knowledge };
