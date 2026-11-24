import { answerQuestion, classifyQuestion, createTeacherMaterials } from "./koala-engine.mjs";
import { detectQuestionLanguage, getLanguageStopWords, getResearchLabels, LANGUAGE_PROFILES } from "./brain/languages.mjs";
import { getBlockedContentReason, getContentBlockMessage } from "./brain/content-safety.mjs";

/*
 * Koala.ai v8 — wyszukiwanie szkolne i wielojęzyczne oraz narzędzia nauczyciela.
 * - Bez zewnętrznych modeli AI, kluczy API i bibliotek.
 * - Zachowuje interfejs Netlify: POST { message, history } -> { answer }.
 * - Crawler odwiedza wyłącznie jawnie skonfigurowane domeny.
 * - Cache jest pamięcią procesu (tymczasowy); nie jest trwałą bazą danych.
 *
 * UWAGA: to crawler, a nie pełna wyszukiwarka internetowa. Bez zewnętrznego
 * indeksu/API może znajdować strony tylko w obrębie skonfigurowanych witryn,
 * ich map witryn i linków, które sam odkryje.
 */

// ---------------------------------------------------------------------------
// USTAWIENIA BACKENDU
// ---------------------------------------------------------------------------

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_ITEMS = 24;
const MAX_REQUEST_BYTES = 180_000;

const CRAWLER_USER_AGENT = "KoalaAI-Crawler/2.0";
const CRAWLER_REQUEST_TIMEOUT = 2200;
const CRAWLER_TOTAL_BUDGET = 8000;
const CRAWLER_MAX_PAGE_SIZE = 450_000;
const CRAWLER_MAX_SITEMAP_SIZE = 300_000;
const CRAWLER_MAX_PAGES_PER_SITE = 9;
const CRAWLER_MAX_SITEMAPS_PER_SITE = 2;
const CRAWLER_MAX_RESULTS = 8;
const CRAWLER_MAX_SOURCES = 8;
const CRAWLER_MAX_LINKS_PER_PAGE = 120;
const CRAWLER_MAX_TERMS = 24;
const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbzDcUrRptgsCjE__4vaiY51H52XQe6WBtZoaxWJPC9Cl7hFB36JWTmDmszDCeiRP8hgrg/exec";

const FRONTEND_ORIGIN = "https://koalezadania.netlify.app";
const ALLOWED_ORIGINS = new Set([
  FRONTEND_ORIGIN,
  "http://localhost:8888",
  "http://localhost:3000"
]);

// Domeny są jawnie dozwolone. Nie pobieramy dowolnych adresów z treści pytania,
// dzięki czemu pytanie użytkownika nie może zamienić funkcji w otwarty proxy.
const CRAWLER_SOURCES = [
  {
    name: "FC Barcelona — oficjalny terminarz",
    url: "https://www.fcbarcelona.com/en/football/first-team/schedule",
    category: "sport",
    timeZone: "Europe/Madrid",
    trust: 10,
    hints: ["schedule", "match", "fixture", "football", "barcelona"]
  },
  {
    name: "LaLiga — najbliższe mecze FC Barcelona",
    url: "https://www.laliga.com/en-GB/clubs/fc-barcelona/next-matches",
    category: "sport",
    timeZone: "Europe/Madrid",
    trust: 9,
    hints: ["match", "schedule", "fixture", "barcelona", "laliga"]
  },
  {
    name: "UEFA — mecze FC Barcelona",
    url: "https://www.uefa.com/uefachampionsleague/clubs/50080/matches/",
    category: "sport",
    timeZone: "Europe/Warsaw",
    trust: 9,
    hints: ["match", "fixture", "champions league", "barcelona"]
  },
  {
    name: "PAP — Aktualności",
    url: "https://www.pap.pl/aktualnosci",
    category: "news",
    trust: 9,
    hints: ["wiadomości", "polska", "świat", "aktualności", "wydarzenia"]
  },
  {
    name: "BBC News",
    url: "https://www.bbc.com/news",
    category: "news",
    trust: 8,
    hints: ["news", "world", "latest", "politics", "science"]
  },
  {
    name: "AP News — World",
    url: "https://apnews.com/world-news",
    category: "news",
    trust: 9,
    hints: ["world", "news", "latest", "politics", "economy"]
  },
  {
    name: "Wikipedia Polska",
    url: "https://pl.wikipedia.org/wiki/Strona_g%C5%82%C3%B3wna",
    category: "general",
    language: "pl",
    trust: 5,
    hints: ["encyklopedia", "informacje", "historia", "geografia"]
  },
  {
    name: "Wielki słownik języka polskiego PAN",
    url: "https://wsjp.pl/",
    category: "language",
    trust: 10,
    aliases: ["wsjp"],
    hints: ["słownik", "znaczenie", "definicja", "odmiana", "frazeologia", "polszczyzna"]
  },
  {
    name: "Słownik Gramatyczny Języka Polskiego",
    url: "https://sgjp.pl/leksemy/",
    category: "language",
    trust: 9,
    aliases: ["sgjp"],
    hints: ["odmiana", "gramatyka", "formy wyrazów", "fleksja", "rzeczownik", "czasownik"]
  },
  {
    name: "Rada Języka Polskiego PAN",
    url: "https://rjp.pan.pl/slowniki-i-poradniki-jezykowe/",
    category: "language",
    trust: 10,
    aliases: ["rjp", "rada języka polskiego"],
    hints: ["ortografia", "interpunkcja", "poprawność językowa", "słowniki", "poradnia językowa"]
  },
  {
    name: "Słowniki języka polskiego PWN",
    url: "https://sjp.pwn.pl/",
    category: "language",
    trust: 9,
    aliases: ["pwn", "słownik PWN", "slownik pwn"],
    hints: ["znaczenie słowa", "definicja", "pisownia", "odmiana", "ortografia", "frazeologia"]
  },
  {
    name: "Wikisłownik",
    url: "https://pl.wiktionary.org/wiki/Wikis%C5%82ownik:Strona_g%C5%82%C3%B3wna",
    category: "language",
    trust: 8,
    aliases: ["wikisłownik", "wikislownik"],
    searchApi: true,
    hints: ["słownik", "wyraz", "znaczenie", "synonim", "antonim", "etymologia", "języki"]
  },
  {
    name: "Wiktionary — English",
    url: "https://en.wiktionary.org/wiki/Wiktionary:Main_Page",
    category: "language",
    trust: 8,
    aliases: ["wiktionary"],
    searchApi: true,
    hints: ["english", "translation", "pronunciation", "etymology", "definition", "dictionary"]
  },
  {
    name: "Wiktionary — Deutsch",
    url: "https://de.wiktionary.org/wiki/Wiktionary:Hauptseite",
    category: "language",
    trust: 8,
    aliases: ["deutsches wiktionary", "wiktionary deutsch"],
    searchApi: true,
    hints: ["deutsch", "niemiecki", "język niemiecki", "german", "übersetzung", "wortbedeutung"]
  },
  {
    name: "Wiktionnaire — français",
    url: "https://fr.wiktionary.org/wiki/Wiktionnaire:Page_d’accueil",
    category: "language",
    trust: 8,
    aliases: ["wiktionary français", "francuski wiktionary"],
    searchApi: true,
    hints: ["français", "francuski", "język francuski", "french", "traduction", "définition"]
  },
  {
    name: "Wikcionario — español",
    url: "https://es.wiktionary.org/wiki/Wikcionario:Portada",
    category: "language",
    trust: 8,
    aliases: ["wiktionary español", "hiszpański wiktionary"],
    searchApi: true,
    hints: ["español", "hiszpański", "język hiszpański", "spanish", "traducción", "significado"]
  },
  {
    name: "Wikizionario — italiano",
    url: "https://it.wiktionary.org/wiki/Wikizionario:Pagina_principale",
    category: "language",
    trust: 8,
    aliases: ["wiktionary italiano", "włoski wiktionary"],
    searchApi: true,
    hints: ["italiano", "włoski", "język włoski", "italian", "traduzione", "significato"]
  },
  {
    name: "Wikcionário — português",
    url: "https://pt.wiktionary.org/wiki/Wikcionário:Página_principal",
    category: "language",
    trust: 8,
    aliases: ["wiktionary português", "portugalski wiktionary"],
    searchApi: true,
    hints: ["português", "portugalski", "język portugalski", "portuguese", "tradução", "significado"]
  },
  {
    name: "Duden — słownik języka niemieckiego",
    url: "https://www.duden.de/",
    category: "language",
    trust: 9,
    aliases: ["duden"],
    hints: ["duden", "niemiecki", "deutsch", "ortografia", "znaczenie wyrazu"]
  },
  {
    name: "Cambridge Dictionary",
    url: "https://dictionary.cambridge.org/",
    category: "language",
    trust: 9,
    aliases: ["cambridge dictionary", "cambridge"],
    hints: ["english", "angielski", "język angielski", "definition", "pronunciation", "translation"]
  },
  {
    name: "Oxford Learner's Dictionaries",
    url: "https://www.oxfordlearnersdictionaries.com/",
    category: "language",
    trust: 9,
    aliases: ["oxford dictionary", "oxford learners dictionary", "oxford"],
    hints: ["english", "angielski", "język angielski", "definition", "pronunciation", "grammar", "example sentence"]
  },
  {
    name: "Real Academia Española — DLE",
    url: "https://dle.rae.es/",
    category: "language",
    trust: 10,
    aliases: ["rae", "diccionario de la lengua española"],
    hints: ["español", "hiszpański", "język hiszpański", "rae", "definición", "ortografía"]
  },
  {
    name: "CNRTL — zasoby języka francuskiego",
    url: "https://www.cnrtl.fr/",
    category: "language",
    trust: 9,
    aliases: ["cnrtl"],
    hints: ["français", "francuski", "język francuski", "cnrtl", "définition", "étymologie"]
  },
  {
    name: "Treccani — słownik języka włoskiego",
    url: "https://www.treccani.it/vocabolario/",
    category: "language",
    trust: 9,
    aliases: ["treccani", "włoski słownik"],
    hints: ["italiano", "włoski", "język włoski", "vocabolario", "definizione", "ortografia"]
  },
  {
    name: "Dicionário Priberam — język portugalski",
    url: "https://dicionario.priberam.org/",
    category: "language",
    trust: 9,
    aliases: ["priberam", "słownik portugalski"],
    hints: ["português", "portugalski", "język portugalski", "dicionário", "definição", "ortografia"]
  },
  {
    name: "Zintegrowana Platforma Edukacyjna",
    url: "https://zpe.gov.pl/",
    category: "education",
    trust: 8,
    hints: ["edukacja", "szkoła", "lekcja", "nauka", "materiały"]
  },
  {
    name: "Ministerstwo Edukacji Narodowej — podstawa programowa",
    url: "https://www.gov.pl/web/edukacja/podstawa-programowa2",
    category: "education",
    trust: 10,
    aliases: ["men", "ministerstwo edukacji", "podstawa programowa men"],
    hints: ["podstawa programowa", "wymagania", "klasa 4", "klasa 5", "klasa 6", "klasa 7", "klasa 8", "2026/2027", "reforma26"]
  },
  {
    name: "Dziennik Ustaw — podstawa programowa 2026",
    url: "https://eli.gov.pl/eli/DU/2026/378/ogl",
    category: "education",
    trust: 10,
    aliases: ["dziennik ustaw 2026", "rozporządzenie 2026", "eli podstawa programowa"],
    hints: ["rozporządzenie", "podstawa programowa", "2026/2027", "wdrażanie etapami", "klasy IV–VIII"]
  },
  {
    name: "Dziennik Ustaw — podstawa programowa 2017",
    url: "https://eli.gov.pl/eli/DU/2017/356/ogl",
    category: "education",
    trust: 10,
    aliases: ["stara podstawa", "podstawa 2017", "lektury 2017"],
    hints: ["lektury obowiązkowe", "lektury uzupełniające", "klasy IV–VI", "klasy VII–VIII", "język polski"]
  },
  {
    name: "Reforma26 — Kompas Jutra MEN",
    url: "https://reforma26.men.gov.pl/",
    category: "education",
    trust: 9,
    aliases: ["reforma26", "kompas jutra"],
    hints: ["nowa podstawa programowa", "zmiany w szkole", "reforma edukacji", "przyroda", "edukacja obywatelska"]
  },
  {
    name: "Prywatna Szkoła Podstawowa ARKONA",
    url: "https://arkona.edupage.org/",
    category: "school",
    trust: 9,
    aliases: ["arkona", "nasza szkoła", "szkoła arkona", "szkolne programy arkona"],
    hints: ["ARKONA", "szkolne programy nauczania", "aktualności szkolne", "laboratoria", "z życia szkoły"]
  },
  {
    name: "e-podręczniki",
    url: "https://epodreczniki.pl/",
    category: "education",
    trust: 9,
    hints: ["podręcznik", "szkoła", "lekcja", "ćwiczenia", "nauka"]
  },
  {
    name: "Khan Academy",
    url: "https://pl.khanacademy.org/",
    category: "education",
    trust: 8,
    hints: ["matematyka", "biologia", "chemia", "fizyka", "kurs"]
  },
  {
    name: "GeoGebra — matematyka i geometria",
    url: "https://www.geogebra.org/",
    category: "education",
    trust: 8,
    hints: ["matematyka", "geometria", "wykres", "funkcja", "konstrukcja", "interaktywne ćwiczenie"]
  },
  {
    name: "Muzeum Historii Polski — materiały edukacyjne",
    url: "https://muzhp.pl/edukacja",
    category: "history",
    trust: 10,
    aliases: ["MHP", "Muzeum Historii Polski"],
    hints: ["historia Polski", "źródło historyczne", "średniowiecze", "historia nowożytna", "niepodległość", "materiały edukacyjne"]
  },
  {
    name: "IPN — edukacja historyczna",
    url: "https://edukacja.ipn.gov.pl/edu/materialy-edukacyjne",
    category: "history",
    trust: 8,
    aliases: ["Instytut Pamięci Narodowej edukacja", "IPN edukacja"],
    hints: ["historia Polski", "II wojna światowa", "PRL", "źródła historyczne", "materiały dla uczniów"]
  },
  {
    name: "PubChem — Periodic Table",
    url: "https://pubchem.ncbi.nlm.nih.gov/periodic-table/",
    category: "science",
    trust: 10,
    aliases: ["pubchem", "układ okresowy pubchem", "tablica pierwiastków"],
    hints: ["chemia", "pierwiastki", "układ okresowy", "symbol chemiczny", "liczba atomowa", "masa atomowa"]
  },
  {
    name: "PhET — symulacje fizyczne i chemiczne",
    url: "https://phet.colorado.edu/pl/",
    category: "science",
    trust: 9,
    aliases: ["phet", "symulacje fizyka chemia"],
    hints: ["fizyka", "chemia", "doświadczenie", "symulacja", "obwód elektryczny", "cząsteczki", "siły"]
  },
  {
    name: "Royal Society of Chemistry — materiały z chemii",
    url: "https://edu.rsc.org/resources/periodic-table",
    category: "science",
    trust: 9,
    aliases: ["RSC periodic table", "Royal Society of Chemistry"],
    hints: ["chemia", "układ okresowy", "pierwiastki", "reakcje chemiczne", "doświadczenia edukacyjne"]
  },
  {
    name: "Ośrodek Rozwoju Edukacji",
    url: "https://ore.edu.pl/",
    category: "education",
    trust: 9,
    hints: ["scenariusz lekcji", "metody nauczania", "materiały edukacyjne", "nauczyciel", "uczeń"]
  },
  {
    name: "Wikibooks — wolne podręczniki",
    url: "https://pl.wikibooks.org/wiki/Strona_g%C5%82%C3%B3wna",
    category: "education",
    trust: 7,
    aliases: ["wikibooks"],
    searchApi: true,
    hints: ["podręcznik", "wolna książka", "nauka", "ćwiczenia", "szkoła"]
  },
  {
    name: "Centralna Komisja Egzaminacyjna",
    url: "https://cke.gov.pl/",
    category: "education",
    trust: 10,
    hints: ["egzamin", "arkusze", "informator", "wymagania", "podstawa programowa"]
  },
  {
    name: "Wolne Lektury",
    url: "https://wolnelektury.pl/",
    category: "literature",
    trust: 10,
    aliases: ["wolne lektury", "wolnelektury"],
    hints: ["lektury szkolne", "autor", "książka", "tekst utworu", "poezja", "literatura", "domena publiczna"]
  },
  {
    name: "Główny Urząd Statystyczny",
    url: "https://stat.gov.pl/",
    category: "poland",
    trust: 10,
    hints: ["statystyka", "dane", "ludność", "demografia", "gospodarka"]
  },
  {
    name: "Gov.pl",
    url: "https://www.gov.pl/",
    category: "poland",
    trust: 10,
    hints: ["polska", "ministerstwo", "urzędowy", "prawo", "informacje"]
  },
  {
    name: "NASA — wiadomości naukowe",
    url: "https://www.nasa.gov/news/",
    category: "science",
    trust: 10,
    hints: ["science", "research", "space", "astronomy", "planet"]
  },
  {
    name: "NASA — wyszukiwarka materiałów STEM",
    url: "https://www.nasa.gov/learning-resources/search/",
    category: "science",
    trust: 10,
    hints: ["nasa stem", "space", "astronomy", "earth science", "computer science", "grades 5-8", "fizyka", "astronomia"]
  },
  {
    name: "OpenStax — bezpłatne materiały K–12",
    url: "https://openstax.org/k12/",
    category: "education",
    trust: 9,
    hints: ["free textbooks", "biology", "chemistry", "physics", "mathematics", "science", "podręcznik"]
  },
  {
    name: "Library of Congress — materiały klasowe",
    url: "https://www.loc.gov/programs/teachers/classroom-materials/",
    category: "history",
    trust: 10,
    hints: ["primary sources", "history", "historical documents", "geography", "źródła historyczne", "historia"]
  },
  {
    name: "Smithsonian Learning Lab",
    url: "https://learninglab.si.edu/",
    category: "education",
    trust: 9,
    hints: ["museum", "science", "history", "art", "educational resources", "lesson", "muzeum", "sztuka"]
  },
  ...["en", "es", "fr", "de", "it", "pt", "nl", "ru", "uk", "ja", "zh", "ar", "hi", "tr", "sv", "ko", "el", "he", "fa", "ur", "bn", "da", "no", "fi", "cs", "ro", "hu", "id", "vi", "ca", "sr", "hr", "bg", "sk", "sl", "et", "lv", "lt", "ms", "th"].map(code => {
    const profile = LANGUAGE_PROFILES.find(item => item.code === code);
    return {
      name: `Wikipedia — ${profile?.label || code}`,
      url: `https://${code}.wikipedia.org/wiki/Main_Page`,
      category: "general",
      language: code,
      searchApi: true,
      trust: 5,
      hints: [profile?.label || code, "encyclopedia", "education", "science", "history"]
    };
  })
];

const ALLOWED_CRAWLER_HOSTS = new Set(
  CRAWLER_SOURCES.map(source => new URL(source.url).hostname)
);

// ---------------------------------------------------------------------------
// CACHE W PAMIĘCI PROCESU
// ---------------------------------------------------------------------------

// Netlify może usunąć lub uruchomić ponownie instancję funkcji. Cache przyspiesza
// kolejne zapytania obsłużone przez tę samą ciepłą instancję, ale nie jest trwały.
const PAGE_CACHE = new Map();
const ROBOTS_CACHE = new Map();
const SEARCH_CACHE = new Map();

const PAGE_CACHE_TTL = 30 * 60 * 1000;
const ROBOTS_CACHE_TTL = 15 * 60 * 1000;
const SEARCH_CACHE_TTL = 45 * 1000;
const PAGE_CACHE_LIMIT = 80;
const ROBOTS_CACHE_LIMIT = 40;
const SEARCH_CACHE_LIMIT = 40;

function cacheGet(cache, key) {
  const item = cache.get(key);
  if (!item) return null;
  if (item.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }
  // Przesunięcie elementu na koniec daje prosty cache typu LRU.
  cache.delete(key);
  cache.set(key, item);
  return item.value;
}

function cacheSet(cache, key, value, ttl, limit) {
  cache.delete(key);
  cache.set(key, { value, expiresAt: Date.now() + ttl });
  while (cache.size > limit) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
}

// ---------------------------------------------------------------------------
// NORMALIZACJA I OCENA TREŚCI
// ---------------------------------------------------------------------------

function normalizeSearchText(value) {
  return String(value ?? "")
    .toLocaleLowerCase("pl-PL")
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value) {
  return normalizeSearchText(value)
    .split(" ")
    .filter(token => token.length >= 3);
}

function unique(values) {
  return [...new Set(values)];
}

const STOP_WORDS = new Set([
  "czy", "jak", "jaki", "jaka", "jakie", "jest", "sa", "sie",
  "oraz", "dla", "przez", "podaj", "prosze", "chce", "sprawdz",
  "zweryfikuj", "potwierdz", "internet", "internecie", "online",
  "informacje", "informacja", "kiedy", "gdzie", "dlaczego", "czemu",
  "teraz", "dzisiaj", "dzis", "jutro", "wczoraj", "aktualnie", "obecnie",
  "najnowszy", "najnowsza", "najnowsze", "mi", "mnie", "ten", "tej",
  "tego", "tym", "albo", "lub", "mam", "ma", "byc", "hej", "hejka",
  "czesc", "siema", "witaj", "witam", "koala", "nowego", "wiadomo",
  "opowiedz", "wyjasnij", "prosze", "znajdz", "wyszukaj", "poszukaj",
  "wiarygodne", "edukacyjne", "materialy", "temat", "temacie", "o", "oraz",
  "w", "na", "z", "ze", "do", "od", "to", "co", "kto", "czyli",
  "i", "ale", "albo", "plan", "nauki", "nauke", "lekcji", "lekcja",
  "klasa", "klasy", "klasie", "szkolny", "szkolna", "szkolne", "uczniow",
  "godzina", "minut", "minutowy", "minutowa", "znajdz", "wyszukaj",
  "slownik", "slowniku", "material", "materialy", "strone", "strony"
]);

const INDEX_QUERY_STOP_WORDS = new Set([
  "uloz", "rozpisz", "przygotuj", "zrob", "stworz", "utworz", "wyszukaj",
  "poszukaj", "znajdz", "szukaj", "sprawdz", "zweryfikuj", "online",
  "internet", "internecie", "sieci", "wiarygodne", "rzetelne", "materialy",
  "edukacyjne", "strone", "strony", "slownik", "slowniku", "wikipedia",
  "wiki", "plan", "nauki", "nauke", "powtorki", "lekcji", "lekcja",
  "temat", "temacie", "klasa", "klasy", "klasie", "uczniow", "uczniowie",
  "wyjasnij", "wytlumacz", "opowiedz", "podaj", "pokaz", "znaczenie",
  "znaczy", "co", "to", "czy", "jak", "jaki", "jaka", "jakie", "jest",
  "oraz", "dla", "przez", "mi", "mnie", "sie", "w", "na", "z", "ze", "do"
]);

const QUERY_EXPANSIONS = [
  { match: /\b(fcbarcelona|fcbarcelony|barcelona|barca|barcelony)\b/, terms: ["barcelona", "barca", "fc barcelona"] },
  { match: /\b(mecz|mecze|spotkanie|terminarz|pilka|pilkarski)\b/, terms: ["match", "fixture", "fixtures", "schedule", "calendar"] },
  { match: /\b(nauka|naukowy|badania|kosmos|kosmosu|astronomia|eksploracji|planeta|planety)\b/, terms: ["science", "research", "space", "planet", "astronomy", "exploration"] },
  { match: /\b(fotosynteza|fotosyntezy|rosliny|chlorofil)\b/, terms: ["photosynthesis", "plant", "chlorophyll"] },
  { match: /\b(szkola|szkolny|lekcja|edukacja|zadanie|egzamin|matura|lektura|literatura)\b/, terms: ["edukacja", "lekcja", "szkola", "materialy", "egzamin", "lektura"] },
  { match: /\b(lektura|literatura|ksiazka|poezja|wiersz|autor|bohater)\b/, terms: ["literature", "book", "poem", "author", "character", "lektura"] },
  { match: /\b(egzamin|matura|sprawdzian|arkusz|wymagania)\b/, terms: ["exam", "examination", "test", "requirements", "arkusz"] },
  { match: /\b(fizyka|sila|energia|ruch|predkosc)\b/, terms: ["physics", "force", "energy", "motion", "speed"] },
  { match: /\b(chemia|atom|pierwiastek|reakcja|roztwor)\b/, terms: ["chemistry", "atom", "element", "reaction", "solution"] },
  { match: /\b(biologia|komorka|organizm|ekosystem|genetyka)\b/, terms: ["biology", "cell", "organism", "ecosystem", "genetics"] },
  { match: /\b(geografia|klimat|kontynent|mapa|ludnosc)\b/, terms: ["geography", "climate", "continent", "map", "population"] },
  { match: /\b(historia|historyczny|historyczna|wojna|powstanie|krol)\b/, terms: ["history", "historical", "war", "uprising", "king"] },
  { match: /\b(polska|polski|polskie|urzad|prawo|przepisy|ministerstwo)\b/, terms: ["polska", "polski", "gov"] },
  { match: /\b(historia|historyczny|historyczna)\b/, terms: ["historia", "history", "historyczny"] },
  { match: /\b(wiadomosci|aktualnosci|wydarzenia|co sie dzieje|co nowego|na swiecie|ze swiata|swiata|podsumuj)\b/, terms: ["news", "latest", "world", "global", "current affairs", "breaking"] },
  { match: /\b(polska|w polsce)\b/, terms: ["poland", "polska", "national"] },
  { match: /\b(angielsk\w*|jezyk angielski|english)\b/, terms: ["english", "dictionary", "definition", "translation"] },
  { match: /\b(niemieck\w*|jezyk niemiecki|deutsch|german)\b/, terms: ["deutsch", "german", "wort", "ubersetzung", "bedeutung"] },
  { match: /\b(francusk\w*|jezyk francuski|francais|french)\b/, terms: ["francais", "french", "mot", "traduction", "definition"] },
  { match: /\b(hiszpansk\w*|jezyk hiszpanski|espanol|spanish)\b/, terms: ["espanol", "spanish", "palabra", "traduccion", "significado"] },
  { match: /\b(wlosk\w*|jezyk wloski|italiano|italian)\b/, terms: ["italiano", "italian", "parola", "traduzione", "significato"] },
  { match: /\b(portugalsk\w*|jezyk portugalski|portugues|portuguese)\b/, terms: ["portugues", "portuguese", "palavra", "traducao", "significado"] }
];

function buildIndexedSearchQuery(question) {
  const text = normalizeSearchText(question)
    .replace(/https?:\/\/[^\s]+/g, " ")
    .replace(/\b(?:[4-8]|iv|v|vi|vii|viii)\s+klas(?:a|y|ie|e|ach)?\b|\bklas(?:a|y|ie|e|ach)?\s+(?:[4-8]|iv|v|vi|vii|viii)\b/g, " ")
    .replace(/\b\d{1,2}[\s-]*minut\w*\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const terms = tokenize(text).filter(term => !STOP_WORDS.has(term) && !INDEX_QUERY_STOP_WORDS.has(term));
  const expanded = [...terms];
  const normalizedQuestion = normalizeSearchText(question);
  for (const expansion of QUERY_EXPANSIONS) {
    if (expansion.match.test(normalizedQuestion)) expanded.push(...expansion.terms);
  }
  return unique(expanded).slice(0, 8).join(" ").slice(0, 180);
}

function getCrawlerTerms(question) {
  const normalized = normalizeSearchText(question);
  const languageCode = detectQuestionLanguage(question);
  const languageStopWords = getLanguageStopWords(languageCode);
  const rawTerms = tokenize(normalized).filter(term => !STOP_WORDS.has(term) && !languageStopWords.has(term));
  const terms = [...rawTerms];

  if (["ja", "zh", "th"].includes(languageCode)) {
    const characters = Array.from(normalized.replace(/\s+/g, ""));
    for (let index = 0; index < characters.length - 1; index++) terms.push(characters.slice(index, index + 2).join(""));
  }

  for (const expansion of QUERY_EXPANSIONS) {
    if (expansion.match.test(normalized)) terms.push(...expansion.terms);
  }

  // Dodajemy łagodny rdzeń dla polskich końcówek fleksyjnych. Nie usuwamy
  // oryginalnego słowa, bo tytuły stron mogą zawierać pełną formę.
  for (const term of rawTerms) {
    if (["ja", "zh", "th"].includes(languageCode)) break;
    if (term.length >= 7) {
      const stem = term.replace(/(owego|owej|owych|ami|ach|owie|acji|ację|acja|enia|enie|ego|emu|owej|ami|ów|om|ie|em|ę|ą|y|a|e|u|i)$/u, "");
      if (stem.length >= 4 && stem !== term) terms.push(stem);
    }
  }

  return unique(terms).filter(term => term.length >= 3).slice(0, CRAWLER_MAX_TERMS);
}

function scoreCrawlerText(value, terms) {
  const normalized = normalizeSearchText(value);
  if (!normalized || !terms.length) return 0;

  const tokens = normalized.split(" ");
  const tokenSet = new Set(tokens);
  let score = 0;
  for (const term of terms) {
    if (tokenSet.has(term)) score += 2;
    else if (term.length >= 4 && normalized.includes(term)) score += 1;
  }
  return score;
}

function getDocumentRelevance(page, url, terms) {
  const titleScore = scoreCrawlerText(page.title || "", terms);
  const descriptionScore = scoreCrawlerText(page.description || "", terms);
  const urlScore = scoreCrawlerText(url || "", terms);
  const contentScore = scoreCrawlerText(`${(page.paragraphs || []).join(" ")} ${page.text || ""}`, terms);
  const strongMatch = titleScore > 0 || descriptionScore > 0 || contentScore >= 8;
  const score = titleScore * 7 + descriptionScore * 4 + urlScore * 2 + Math.min(contentScore, 16) * 0.7;
  return { score, titleScore, descriptionScore, urlScore, contentScore, strongMatch };
}

function getCrawlerSnippet(page, terms) {
  const ranked = (page.paragraphs || [])
    .map(paragraph => ({
      text: paragraph,
      score: scoreCrawlerText(paragraph, terms)
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || b.text.length - a.text.length);

  if (ranked.length) {
    return ranked.slice(0, 3).map(item => item.text).join("\n\n").slice(0, 1500);
  }

  const fallback = page.description && page.description.length >= 90
    ? page.description
    : (page.text || page.description || "");
  return fallback.slice(0, 1100);
}

// ---------------------------------------------------------------------------
// BEZPIECZNE ODCZYTYWANIE ODPOWIEDZI HTTP
// ---------------------------------------------------------------------------

class ResponseTooLargeError extends Error {
  constructor() {
    super("Pobrana treść przekracza dozwolony limit.");
    this.name = "ResponseTooLargeError";
  }
}

async function readResponseTextLimited(response, maxBytes) {
  if (!response.body) return "";

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  const chunks = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel().catch(() => {});
        throw new ResponseTooLargeError();
      }

      chunks.push(value);
    }
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  }

  const combined = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return decoder.decode(combined);
}

function isAllowedUrlForHost(rawUrl, expectedHost) {
  try {
    const url = new URL(rawUrl);
    return (
      ["http:", "https:"].includes(url.protocol) &&
      url.hostname === expectedHost &&
      !url.username &&
      !url.password &&
      ALLOWED_CRAWLER_HOSTS.has(url.hostname)
    );
  } catch {
    return false;
  }
}

async function requestSiteText(
  rawUrl,
  expectedHost,
  accept = "text/html,application/xhtml+xml",
  maxSize = CRAWLER_MAX_PAGE_SIZE,
  deadline = Date.now() + CRAWLER_REQUEST_TIMEOUT
) {
  let target;
  try {
    target = new URL(rawUrl);
  } catch {
    return null;
  }

  if (!isAllowedUrlForHost(target.href, expectedHost)) return null;

  for (let attempt = 0; attempt < 2; attempt++) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) return null;

    const controller = new AbortController();
    const timeout = Math.max(100, Math.min(CRAWLER_REQUEST_TIMEOUT, remaining));
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(target.href, {
        method: "GET",
        redirect: "manual",
        headers: {
          "User-Agent": CRAWLER_USER_AGENT,
          "Accept": accept
        },
        signal: controller.signal
      });

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        await response.body?.cancel().catch(() => {});
        if (!location || attempt === 1) return null;

        const redirected = new URL(location, target);
        if (!isAllowedUrlForHost(redirected.href, expectedHost)) return null;
        target = redirected;
        continue;
      }

      if ([404, 410].includes(response.status)) {
        await response.body?.cancel().catch(() => {});
        return { status: response.status, text: "", url: target.href };
      }

      if (!response.ok) {
        await response.body?.cancel().catch(() => {});
        return null;
      }

      const contentLength = Number(response.headers.get("content-length") || 0);
      if (Number.isFinite(contentLength) && contentLength > maxSize) {
        await response.body?.cancel().catch(() => {});
        return null;
      }

      const contentType = response.headers.get("content-type") || "";
      const acceptedTypes = accept.split(",").map(value => value.trim().toLowerCase());
      const typeAllowed = acceptedTypes.some(type =>
        contentType.toLowerCase().includes(type.split(";")[0])
      );
      if (!typeAllowed) {
        await response.body?.cancel().catch(() => {});
        return null;
      }

      const text = await readResponseTextLimited(response, maxSize);
      return { status: response.status, text, url: target.href, contentType };
    } catch (error) {
      if (error instanceof ResponseTooLargeError) return null;
      if (error?.name !== "AbortError") {
        console.error("Koala fetch error:", error?.message || error);
      }
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// ROBOTS.TXT — ODCZYT I STOSOWANIE REGUŁ
// ---------------------------------------------------------------------------

function parseRobotsFile(text) {
  const groups = [];
  const sitemaps = [];
  let agents = [];
  let rules = [];
  let hasRules = false;

  function saveGroup() {
    if (agents.length) groups.push({ agents: [...agents], rules: [...rules] });
  }

  for (const rawLine of String(text || "").split(/\r?\n/)) {
    const line = rawLine.split("#", 1)[0].trim();
    if (!line) continue;

    const sitemapMatch = line.match(/^sitemap\s*:\s*(.+)$/i);
    if (sitemapMatch) {
      sitemaps.push(sitemapMatch[1].trim());
      continue;
    }

    const agentMatch = line.match(/^user-agent\s*:\s*(.+)$/i);
    if (agentMatch) {
      if (hasRules) {
        saveGroup();
        agents = [];
        rules = [];
        hasRules = false;
      }
      agents.push(agentMatch[1].trim().toLowerCase());
      continue;
    }

    const ruleMatch = line.match(/^(allow|disallow)\s*:\s*(.*)$/i);
    if (ruleMatch && agents.length) {
      const path = ruleMatch[2].trim();
      if (path) {
        rules.push({ allow: ruleMatch[1].toLowerCase() === "allow", path });
        hasRules = true;
      }
    }
  }

  saveGroup();
  return { groups, sitemaps: unique(sitemaps) };
}

function getApplicableRobotsRules(robots) {
  const agent = CRAWLER_USER_AGENT.toLowerCase();
  const specificGroups = robots.groups.filter(group =>
    group.agents.some(name => name !== "*" && agent.includes(name))
  );
  const wildcardGroups = robots.groups.filter(group => group.agents.includes("*"));
  const selected = specificGroups.length ? specificGroups : wildcardGroups;
  return selected.flatMap(group => group.rules);
}

function robotsPatternMatches(pathname, rulePattern) {
  const source = String(rulePattern || "").trim();
  if (!source) return false;

  const endAnchored = source.endsWith("$");
  const pattern = endAnchored ? source.slice(0, -1) : source;
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*");

  return new RegExp(`^${escaped}${endAnchored ? "$" : ""}`).test(pathname);
}

function crawlerCanVisit(rawUrl, robots) {
  if (!robots) return false; // Przy błędzie odczytu robots.txt działamy zachowawczo.

  try {
    const parsed = new URL(rawUrl);
    const path = parsed.pathname + parsed.search;
    const matched = getApplicableRobotsRules(robots)
      .filter(rule => robotsPatternMatches(path, rule.path))
      .sort((a, b) => {
        const aLength = a.path.replace(/[\*$]/g, "").length;
        const bLength = b.path.replace(/[\*$]/g, "").length;
        if (bLength !== aLength) return bLength - aLength;
        if (a.allow !== b.allow) return a.allow ? -1 : 1;
        return 0;
      });

    return matched.length === 0 ? true : matched[0].allow;
  } catch {
    return false;
  }
}

async function getCrawlerRobots(origin, host, deadline) {
  const cached = cacheGet(ROBOTS_CACHE, host);
  if (cached) return cached;

  const result = await requestSiteText(
    `${origin}/robots.txt`,
    host,
    "text/plain",
    100_000,
    deadline
  );

  if (!result) return null;

  const parsed = [404, 410].includes(result.status)
    ? { groups: [], sitemaps: [] }
    : parseRobotsFile(result.text);

  cacheSet(ROBOTS_CACHE, host, parsed, ROBOTS_CACHE_TTL, ROBOTS_CACHE_LIMIT);
  return parsed;
}

// ---------------------------------------------------------------------------
// MAPY WITRYN I ODKRYWANIE PODSTRON
// ---------------------------------------------------------------------------

function decodeCrawlerEntities(value) {
  return String(value || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, number) => {
      const point = Number(number);
      try {
        return Number.isInteger(point) && point >= 0 && point <= 0x10ffff
          ? String.fromCodePoint(point)
          : "";
      } catch {
        return "";
      }
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, number) => {
      const point = parseInt(number, 16);
      try {
        return Number.isInteger(point) && point >= 0 && point <= 0x10ffff
          ? String.fromCodePoint(point)
          : "";
      } catch {
        return "";
      }
    });
}

function extractSitemapUrls(xml, host) {
  const urls = [];
  const regex = /<loc>\s*([\s\S]*?)\s*<\/loc>/gi;
  let match;

  while ((match = regex.exec(String(xml || ""))) !== null) {
    const raw = decodeCrawlerEntities(match[1]).trim();
    try {
      const url = new URL(raw);
      if (
        url.hostname === host &&
        ["http:", "https:"].includes(url.protocol) &&
        !url.username && !url.password
      ) {
        url.hash = "";
        urls.push(url.href);
      }
    } catch {
      // Nieprawidłowe wpisy mapy witryny pomijamy.
    }

    if (urls.length >= 500) break;
  }

  return unique(urls);
}

async function getSitemapPages(origin, host, robots, terms, deadline) {
  const candidates = [
    ...robots.sitemaps,
    `${origin}/sitemap.xml`
  ];
  const discovered = [];

  for (const address of unique(candidates).slice(0, CRAWLER_MAX_SITEMAPS_PER_SITE)) {
    if (Date.now() >= deadline) break;

    let sitemapUrl;
    try {
      sitemapUrl = new URL(address);
    } catch {
      continue;
    }

    if (
      sitemapUrl.hostname !== host ||
      !["http:", "https:"].includes(sitemapUrl.protocol) ||
      !crawlerCanVisit(sitemapUrl.href, robots)
    ) continue;

    const response = await requestSiteText(
      sitemapUrl.href,
      host,
      "application/xml,text/xml",
      CRAWLER_MAX_SITEMAP_SIZE,
      deadline
    );
    if (!response) continue;

    let urls = extractSitemapUrls(response.text, host);
    if (/<sitemapindex\b/i.test(response.text)) {
      const nestedSitemaps = urls
        .filter(url => /\.xml(?:\?|$)/i.test(url))
        .slice(0, 1);

      for (const nestedUrl of nestedSitemaps) {
        if (Date.now() >= deadline || !crawlerCanVisit(nestedUrl, robots)) continue;
        const nestedResponse = await requestSiteText(
          nestedUrl,
          host,
          "application/xml,text/xml",
          CRAWLER_MAX_SITEMAP_SIZE,
          deadline
        );
        if (nestedResponse) urls = extractSitemapUrls(nestedResponse.text, host);
      }
    }

    discovered.push(...urls);
  }

  return unique(discovered)
    .map(url => ({ url, score: scoreCrawlerText(url, terms) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 60)
    .map(item => item.url);
}

// ---------------------------------------------------------------------------
// WYCIĄGANIE TEKSTU, METADANYCH I LINKÓW Z HTML
// ---------------------------------------------------------------------------

function cleanCrawlerHtml(html) {
  return decodeCrawlerEntities(
    String(html || "")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<(script|style|noscript|svg|nav|footer|header|form)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
      .replace(/<br\b[^>]*>/gi, "\n")
      .replace(/<\/(td|th)\s*>/gi, " | ")
      .replace(/<\/(tr|li|p|h1|h2|h3|h4|section|article|div|ul|ol)\s*>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\| */g, " | ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function extractTableRows(html) {
  const rows = [];
  const rowRegex = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;
  while ((rowMatch = rowRegex.exec(String(html || ""))) !== null && rows.length < 250) {
    const cells = [];
    const cellRegex = /<(?:td|th)\b[^>]*>([\s\S]*?)<\/(?:td|th)>/gi;
    let cellMatch;
    while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null && cells.length < 12) {
      const value = cleanCrawlerHtml(cellMatch[1]).replace(/\s*\|\s*/g, " ").trim();
      if (value) cells.push(value.slice(0, 220));
    }
    if (cells.length >= 2) rows.push(cells);
  }
  return rows;
}

function getHtmlAttributes(tag) {
  const attributes = {};
  const regex = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let match;
  while ((match = regex.exec(tag)) !== null) {
    attributes[match[1].toLowerCase()] = decodeCrawlerEntities(
      match[2] ?? match[3] ?? match[4] ?? ""
    );
  }
  return attributes;
}

function getMetaContent(html, wantedName) {
  const regex = /<meta\b[^>]*>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const attributes = getHtmlAttributes(match[0]);
    const name = (attributes.name || attributes.property || attributes.itemprop || "").toLowerCase();
    if (name === wantedName.toLowerCase() && attributes.content) {
      return attributes.content.trim();
    }
  }
  return "";
}

function extractCrawlerLinks(html, pageUrl, host) {
  const links = [];
  const regex = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = regex.exec(html)) !== null && links.length < CRAWLER_MAX_LINKS_PER_PAGE) {
    const attributes = getHtmlAttributes(`<a ${match[1]}>`);
    if (!attributes.href) continue;

    try {
      const url = new URL(attributes.href, pageUrl);
      if (
        url.hostname !== host ||
        !["http:", "https:"].includes(url.protocol) ||
        url.username || url.password
      ) continue;

      if (/\.(pdf|jpg|jpeg|png|gif|svg|zip|mp4|mp3|css|js|woff2?)(?:$|\?)/i.test(url.href)) continue;
      url.hash = "";
      const label = cleanCrawlerHtml(match[2]) || attributes["aria-label"] || attributes.title || "";
      links.push({ url: url.href, label: label.slice(0, 180) });
    } catch {
      // Pomijamy błędne adresy.
    }
  }

  return unique(links.map(link => link.url)).map(url =>
    links.find(link => link.url === url)
  );
}

function getStructuredName(value) {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) return value.map(getStructuredName).filter(Boolean).join(", ");
  if (value && typeof value === "object") return String(value.name || value.alternateName || "").trim();
  return "";
}

function collectJsonLdNodes(value, output, depth = 0) {
  if (depth > 8 || value == null) return;
  if (Array.isArray(value)) {
    for (const item of value) collectJsonLdNodes(item, output, depth + 1);
    return;
  }
  if (typeof value !== "object") return;
  output.push(value);
  for (const key of ["@graph", "mainEntity", "mainEntityOfPage", "hasPart", "itemListElement"]) {
    if (value[key]) collectJsonLdNodes(value[key], output, depth + 1);
  }
}

function extractStructuredData(html) {
  const nodes = [];
  const scriptPattern = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptPattern.exec(String(html || ""))) !== null) {
    const raw = decodeCrawlerEntities(match[1]).trim().replace(/^<!--|-->$/g, "");
    try {
      collectJsonLdNodes(JSON.parse(raw), nodes);
    } catch {
      // Błędny JSON-LD pomijamy; zwykły tekst strony nadal może być użyteczny.
    }
  }

  const events = [];
  const articles = [];
  for (const node of nodes) {
    const types = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"] || ""];
    const typeText = types.join(" ").toLowerCase();
    const homeTeam = getStructuredName(node.homeTeam);
    const awayTeam = getStructuredName(node.awayTeam);
    if (typeText.includes("sportsevent") || (homeTeam && awayTeam && node.startDate)) {
      events.push({
        name: getStructuredName(node.name),
        startDate: String(node.startDate || ""),
        homeTeam,
        awayTeam,
        competition: getStructuredName(node.superEvent) || getStructuredName(node.competitor) || getStructuredName(node.sport),
        eventStatus: getStructuredName(node.eventStatus)
      });
    }
    if (/newsarticle|article|reportagenewsarticle|blogposting/.test(typeText)) {
      articles.push({
        headline: getStructuredName(node.headline) || getStructuredName(node.name),
        datePublished: String(node.datePublished || node.dateCreated || ""),
        dateModified: String(node.dateModified || ""),
        articleBody: String(node.articleBody || "").slice(0, 16000),
        description: String(node.description || "").slice(0, 1200),
        url: String(node.url || node.mainEntityOfPage?.['@id'] || "")
      });
    }
  }
  return { events, article: articles.sort((a, b) => (b.articleBody.length + b.headline.length) - (a.articleBody.length + a.headline.length))[0] || null };
}

function getFirstTimeDate(html) {
  const match = String(html || "").match(/<time\b[^>]*datetime=["']([^"']+)["'][^>]*>/i);
  return match ? decodeCrawlerEntities(match[1]).trim() : "";
}

function extractCrawlerPage(html, pageUrl, host) {
  const structured = extractStructuredData(html);
  const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? cleanCrawlerHtml(titleMatch[1]) : "Strona internetowa";
  const description =
    getMetaContent(html, "description") ||
    getMetaContent(html, "og:description") ||
    getMetaContent(html, "twitter:description") ||
    structured.article?.description || "";
  const date =
    getMetaContent(html, "article:published_time") ||
    getMetaContent(html, "datePublished") ||
    getMetaContent(html, "date") ||
    getMetaContent(html, "dc.date") ||
    structured.article?.datePublished ||
    getFirstTimeDate(html);
  const ogType = getMetaContent(html, "og:type").toLowerCase();

  const mainMatch = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  const articleMatch = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i);
  const content = articleMatch?.[1] || mainMatch?.[1] || html;
  const paragraphMatches = content.match(/<(?:p|h1|h2|h3|h4|li)\b[^>]*>[\s\S]*?<\/(?:p|h1|h2|h3|h4|li)>/gi) || [];
  const paragraphs = paragraphMatches
    .map(cleanCrawlerHtml)
    .flatMap(value => value.split(/\n+/))
    .map(value => value.trim())
    .filter(text => text.length > 45)
    .slice(0, 160);
  let text = cleanCrawlerHtml(content).slice(0, 22000);
  if (structured.article?.articleBody && structured.article.articleBody.length > text.length) {
    text = cleanCrawlerHtml(structured.article.articleBody).slice(0, 22000);
  }
  const tableRows = extractTableRows(content);
  const links = extractCrawlerLinks(html, pageUrl, host);

  return {
    title: (structured.article?.headline || title).slice(0, 300),
    description: description.slice(0, 900),
    date: String(date || "").slice(0, 100),
    ogType,
    text,
    paragraphs: paragraphs.length ? paragraphs : text.split(/(?<=[.!?])\s+/).filter(value => value.length > 45).slice(0, 100),
    tableRows,
    structuredEvents: structured.events,
    structuredArticle: structured.article,
    links
  };
}

// ---------------------------------------------------------------------------
// DOBÓR WITRYN DO PYTANIA
// ---------------------------------------------------------------------------

function selectCrawlerSources(question) {
  const text = normalizeSearchText(question);
  const languageCode = detectQuestionLanguage(question);
  const has = pattern => pattern.test(text);

  const sports = has(/\b(mecz|mecze|spotkanie|terminarz|fcbarcelona|fcbarcelony|barcelona|barcelony|barca|liga|pilka|pilkarski|uefa|najblizszy mecz)\b/);
  const news = has(/\b(co sie dzieje|co sie wydarzylo|wiadomosci|wiadomosciami|aktualnosci|newsy|wydarzenia|na swiecie|ze swiata|swiata|dzisiejsze informacje|ostatnie wydarzenia|co nowego)\b/);
  const language = has(/\b(jezyk|jezyka|polszczyzna|slownik|slowniki|slownikowy|znaczenie|znaczy|synonim|synonimy|antonim|antonimy|odmiana|odmienic|fleksja|gramatyka|ortografia|pisownia|interpunkcja|przecinek|wymowa|fonetyka|etymologia|frazeologizm|frazeologia|poprawnie|poprawnosc|tlumaczenie|przetlumacz|rzeczownik|czasownik|przymiotnik|angielski|angielsku|niemiecki|niemiecku|francuski|francusku|hiszpanski|hiszpansku|wloski|wlosku|portugalski|portugalsku|english|german|french|spanish|italian|italiano|portuguese|portugues|deutsch|francais|espanol|meaning|definition|dictionary|translation|translate|grammar|vocabulary|pronunciation|etymology|synonym|antonym)\b/);
  const history = has(/\b(histori\w*|starozytn\w*|sredniowie\w*|jagiellon\w*|grunwald|powstan\w*\s+(warszawsk\w*|listopadow\w*|styczniow\w*)|bitw\w*|wojn\w*|krol\w*|dynasti\w*|zrodlo historyczne)\b/);
  const astronomy = has(/\b(kosmos|kosmosu|astronomia|planeta|planety|nasa|eksploracji kosmosu|misja kosmiczna)\b/);
  const science = has(/\b(nauka|naukow\w*|badania|biologi\w*|fizyk\w*|chem\w*|fotosynteza|chlorofil)\b/);
  const literature = has(/\b(lektur\w*|ksiazk\w*|powiesc\w*|bohater\w*|autor\w*|wiersz\w*|motyw literacki|utwor literacki|literatur\w*|mit\w*)\b/);
  const education = has(/\b(szkola|szkolny|lekcja|edukacja|zadanie|egzamin|matura|podstawa programowa|lektura|literatura)\b/);
  const curriculum = has(/\b(podstawa programowa|wymagania programowe|reforma26|kompas jutra|program nauczania|podstawa men|nowa podstawa)\b/);
  const arkona = has(/\b(arkona|nasza szkola|w naszej szkole|szkola arkona|program nauczania arkona)\b/);
  const statistics = has(/\b(statystyka|statystyki|dane|demografia|ludnosc|populacja|bezrobocie|inflacja)\b/);
  const officialPoland = has(/\b(gov|urzad|ministerstwo|ustawa|prawo|przepisy|wniosek|swiadczenie|podatki|sejm|senat|gus|statystyka|demografia|ludnosc)\b/);
  const PolandFocus = has(/\b(w polsce|polska|polski|polskie|polskich)\b/);

  let categories;
  if (sports) categories = ["sport"];
  else if (arkona) categories = ["school", "education", "general"];
  else if (curriculum) categories = ["education", "poland", "general"];
  else if (literature) categories = ["literature", "education", "general"];
  else if (language) categories = ["language", "education", "general"];
  else if (news && PolandFocus && officialPoland) categories = ["news", "poland"];
  else if (news) categories = ["news"];
  else if (history) categories = ["history", "education", "general"];
  else if (astronomy) categories = ["science", "general"];
  else if (science) categories = ["education", "science", "general"];
  else if (education) categories = ["education", "general"];
  else if (statistics) categories = ["poland", "general"];
  else if (officialPoland) categories = ["poland", "news"];
  else categories = ["education", "general"];

  const grouped = CRAWLER_SOURCES
    .filter(source => categories.includes(source.category))
    .sort((a, b) => {
      const relevance = source => scoreCrawlerText(`${source.name} ${(source.hints || []).join(" ")}`, getCrawlerTerms(question));
      const curriculumBoost = source => curriculum && /ministerstwo|dziennik ustaw|reforma26|zintegrowana platforma/i.test(source.name) ? 100 : 0;
      const literatureBoost = source => literature && source.category === "literature" ? 100 : 0;
      const historyBoost = source => history && source.category === "history" ? 100 : 0;
      const schoolBoost = source => arkona && source.category === "school" ? 100 : 0;
      return schoolBoost(b) - schoolBoost(a)
        || curriculumBoost(b) - curriculumBoost(a)
        || literatureBoost(b) - literatureBoost(a)
        || historyBoost(b) - historyBoost(a)
        || categories.indexOf(a.category) - categories.indexOf(b.category)
        || relevance(b) - relevance(a)
        || (b.trust || 0) - (a.trust || 0);
    });

  // Rotujemy między kategoriami zamiast wybierać wyłącznie pierwszą z nich.
  // Dzięki temu pytanie szkolne może dostać i podręcznik, i niezależne źródło ogólne.
  const byCategory = new Map(categories.map(category => [
    category,
    grouped.filter(source => source.category === category)
  ]));
  const selected = [];
  while (selected.length < CRAWLER_MAX_SOURCES) {
    let added = false;
    for (const category of categories) {
      const next = byCategory.get(category)?.shift();
      if (!next) continue;
      selected.push(next);
      added = true;
      if (selected.length >= CRAWLER_MAX_SOURCES) break;
    }
    if (!added) break;
  }
  const languageSource = CRAWLER_SOURCES.find(source => source.language === languageCode);
  if (languageSource) {
    return [languageSource, ...selected.filter(source => source.name !== languageSource.name)]
      .slice(0, CRAWLER_MAX_SOURCES);
  }
  return selected;
}

function extractAllowedSourceFromMessage(message) {
  const matches = String(message || "").match(/https?:\/\/[^\s<>()]+/gi) || [];
  for (const raw of matches) {
    try {
      const url = new URL(raw.replace(/[),.;!?]+$/, ""));
      const source = CRAWLER_SOURCES.find(item => new URL(item.url).hostname === url.hostname);
      if (source) return source;
    } catch {
      // Ignorujemy nieprawidłowy adres.
    }
  }
  const normalizedMessage = normalizeSearchText(message);
  const explicitSource = CRAWLER_SOURCES.find(source =>
    [source.name, ...(source.aliases || [])].some(alias => {
      const normalizedAlias = normalizeSearchText(alias);
      return normalizedAlias.length >= 3 && (` ${normalizedMessage} `).includes(` ${normalizedAlias} `);
    })
  );
  if (explicitSource) return explicitSource;
  return null;
}

// ---------------------------------------------------------------------------
// CRAWLER JEDNEJ WITRYNY
// ---------------------------------------------------------------------------

function isLikelyNewsArticleUrl(source, rawUrl) {
  try {
    const url = new URL(rawUrl);
    const path = url.pathname.toLowerCase().replace(/\/+$/, "");
    const host = url.hostname;
    if (host === "www.bbc.com") return /\/news\/articles\//.test(path);
    if (host === "apnews.com") return /\/article\//.test(path);
    if (host === "www.pap.pl") return /^\/aktualnosci\/.+/.test(path) && path !== "/aktualnosci";
    if (host === "www.gov.pl") {
      const parts = path.split("/").filter(Boolean);
      return parts.length >= 3 && !/^(wiadomosci|aktualnosci|strona-glowna|kontakt)$/.test(parts[2]);
    }
    return /\/(article|articles|news|story|stories)\/[^/]+/.test(path);
  } catch {
    return false;
  }
}

function parsePublishedDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed : null;
}

function isFreshNewsDate(value, maxAgeDays = 14) {
  const date = parsePublishedDate(value);
  if (!date) return false;
  const age = Date.now() - date.getTime();
  return age >= -6 * 60 * 60 * 1000 && age <= maxAgeDays * 24 * 60 * 60 * 1000;
}

function articleUrlPriority(source, rawUrl, label = "") {
  if (!isLikelyNewsArticleUrl(source, rawUrl)) return 0;
  const host = new URL(rawUrl).hostname;
  if (host === "www.bbc.com" || host === "apnews.com" || host === "www.pap.pl") return 60 + Math.min(label.length / 25, 5);
  return 35 + Math.min(label.length / 30, 4);
}

function isNewsArticlePage(source, pageUrl, page) {
  const article = page.structuredArticle;
  const hasStructuredArticle = Boolean(article?.headline && (article?.datePublished || article?.articleBody));
  const articleLike = hasStructuredArticle || page.ogType === "article" || isLikelyNewsArticleUrl(source, pageUrl);
  const published = article?.datePublished || page.date;
  return articleLike && Boolean(parsePublishedDate(published)) &&
    (page.text || "").length >= 220 &&
    !/\/(news|world|world-news|aktualnosci|wiadomosci)\/?$/i.test(new URL(pageUrl).pathname);
}

async function crawlPublicSite(source, question, terms, deadline) {
  const results = [];
  const visited = new Set();

  try {
    const seed = new URL(source.url);
    const host = seed.hostname;
    const robots = await getCrawlerRobots(seed.origin, host, deadline);
    if (!robots || Date.now() >= deadline) return results;

    const sitemapPages = await getSitemapPages(
      seed.origin, host, robots, [...terms, ...(source.hints || [])], deadline
    );

    const orderedSitemap = sitemapPages
      .map(url => ({ url, priority: source.category === "news"
        ? articleUrlPriority(source, url)
        : (source.category === "sport" && /schedule|fixtures|matches|match|calendar/i.test(url) ? 65 : 0) }))
      .sort((a, b) => b.priority - a.priority)
      .map(item => item.url);

    // Najpierw strona startowa, bo z niej zwykle da się znaleźć bezpośrednie
    // linki do artykułów lub terminarza. Dopiero potem korzystamy z sitemap.
    const queue = unique([seed.href, ...orderedSitemap]).slice(0, 120);

    while (queue.length && visited.size < CRAWLER_MAX_PAGES_PER_SITE && Date.now() < deadline) {
      const url = queue.shift();
      if (!url || visited.has(url) || !crawlerCanVisit(url, robots)) continue;
      visited.add(url);

      let page = cacheGet(PAGE_CACHE, url);
      let finalUrl = url;
      if (!page) {
        const response = await requestSiteText(
          url, host, "text/html,application/xhtml+xml", CRAWLER_MAX_PAGE_SIZE, deadline
        );
        if (!response?.text) continue;
        finalUrl = response.url || url;
        page = extractCrawlerPage(response.text, finalUrl, host);
        cacheSet(PAGE_CACHE, url, page, PAGE_CACHE_TTL, PAGE_CACHE_LIMIT);
      }

      const path = new URL(finalUrl).pathname.toLowerCase();
      const isLanding = /^\/(en\/|news|world|world-news|aktualnosci|wiadomosci)?\/?$/i.test(path);
      if (page.text.length < 80 && page.description.length < 30) continue;

      if (source.category === "sport") {
        const probe = {
          ...page, url: finalUrl, source: source.name,
          sourceTrust: source.trust || 5,
          timeZone: source.timeZone || "Europe/Warsaw"
        };
        const parsedFixtures = parseSportsFixtures(probe);
        // Nie pokazujemy sklepu, strony głównej, hokeja młodzieżowego ani
        // ogólnej strony klubu jako odpowiedzi na pytanie o pierwszy zespół.
        if (parsedFixtures.length > 0) {
          results.push({ ...probe, title: page.title, text: page.text.slice(0, 18000),
            fullText: page.text, tableRows: page.tableRows || [], score: 30 + parsedFixtures.length * 5,
            fixtures: parsedFixtures });
        }
      } else if (source.category === "news") {
        if (isNewsArticlePage(source, finalUrl, page) && isFreshNewsDate(page.structuredArticle?.datePublished || page.date)) {
          const published = page.structuredArticle?.datePublished || page.date;
          const ageHours = Math.max(0, (Date.now() - new Date(published).getTime()) / 3600000);
          const relevance = getDocumentRelevance(page, finalUrl, terms);
          const articleBody = page.structuredArticle?.articleBody || page.text;
          results.push({
            source: source.name, sourceTrust: source.trust || 5,
            title: page.structuredArticle?.headline || page.title,
            url: finalUrl, description: page.structuredArticle?.description || page.description,
            date: published, publishedAt: new Date(published).getTime(),
            text: cleanCrawlerHtml(articleBody).slice(0, 8000),
            score: 18 + relevance.score + Math.max(0, 10 - ageHours / 12),
            category: "news"
          });
        }
      } else {
        const looksLikeCategory = /\/(kategoria:|dyskusja|specjalna:)/i.test(finalUrl) || /^(kategoria:|dyskusja kategorii:)/i.test(page.title);
        const relevance = getDocumentRelevance(page, finalUrl, terms);
        if (!isLanding && !looksLikeCategory && relevance.strongMatch && relevance.score >= 7) {
          const snippet = getCrawlerSnippet(page, terms);
          if (snippet.length >= 60) {
            results.push({ source: source.name, sourceTrust: source.trust || 5,
              title: page.title, url: finalUrl, description: page.description, date: page.date,
              text: snippet, fullText: page.text, score: relevance.score, category: source.category });
          }
        }
      }

      const candidates = (page.links || []).map(link => {
        const newsPriority = source.category === "news" ? articleUrlPriority(source, link.url, link.label) : 0;
        const sportPriority = source.category === "sport" && /schedule|fixtures|matches|match|calendar/i.test(`${link.url} ${link.label}`) ? 45 : 0;
        const topical = scoreCrawlerText(`${link.label} ${link.url}`, terms) * 3;
        return { ...link, score: Math.max(newsPriority, sportPriority) + topical };
      }).filter(link => link.score >= (source.category === "news" ? 25 : 2) && !visited.has(link.url) && !queue.includes(link.url));

      candidates.sort((a, b) => b.score - a.score);
      for (const link of candidates.slice(0, 15).reverse()) {
        if (queue.length < 120) queue.unshift(link.url);
      }
    }
  } catch (error) {
    console.error(`Koala crawler error (${source.name}):`, error?.message || error);
  }

  return results;
}

// ---------------------------------------------------------------------------
// GŁÓWNE WYSZUKIWANIE INTERNETOWE KOALI
// ---------------------------------------------------------------------------

function cleanDisplayText(value, maxLength = 1400) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    // Nie pozwalamy, aby składnia Markdown pobrana z obcej strony udawała
    // nagłówki, obrazy lub linki w odpowiedzi Koali.
    .replace(/[\`*_#\[\]()>|!]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function safeSourceUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    if (!ALLOWED_CRAWLER_HOSTS.has(url.hostname) || !["http:", "https:"].includes(url.protocol)) return "";
    return url.href;
  } catch {
    return "";
  }
}

const MONTHS_EN = {
  jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3,
  apr: 4, april: 4, may: 5, jun: 6, june: 6, jul: 7, july: 7,
  aug: 8, august: 8, sep: 9, september: 9, oct: 10, october: 10,
  nov: 11, november: 11, dec: 12, december: 12
};

function getTimeZoneOffsetMs(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  const asUtc = Date.UTC(
    Number(values.year), Number(values.month) - 1, Number(values.day),
    Number(values.hour), Number(values.minute), Number(values.second)
  );
  return asUtc - date.getTime();
}

function wallTimeToDate(year, month, day, hour, minute, timeZone) {
  const wallAsUtc = Date.UTC(year, month - 1, day, hour, minute);
  const firstGuess = new Date(wallAsUtc);
  const offset = getTimeZoneOffsetMs(firstGuess, timeZone);
  return new Date(wallAsUtc - offset);
}

function formatWarsawDateTime(date) {
  return new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Europe/Warsaw",
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23"
  }).format(date).replace(",", " ·");
}

function currentWarsawDateParts() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Warsaw", year: "numeric", month: "numeric", day: "numeric"
  }).formatToParts(new Date());
  return Object.fromEntries(parts.map(part => [part.type, Number(part.value)]));
}

function yearNearLine(text, lineIndex, month) {
  const before = text.slice(Math.max(0, lineIndex - 2200), lineIndex);
  const monthNames = Object.keys(MONTHS_EN).sort((a, b) => b.length - a.length).join("|");
  const regex = new RegExp(`\\b(${monthNames})\\s+(20\\d{2})\\b`, "gi");
  let match;
  let chosen = null;
  while ((match = regex.exec(before)) !== null) chosen = Number(match[2]);
  if (chosen) return chosen;
  const now = currentWarsawDateParts();
  return month < now.month - 1 ? now.year + 1 : now.year;
}

function parseFixtureDate(line, fullText, lineIndex) {
  const numeric = line.match(/\b(\d{1,2})[./](\d{1,2})[./](20\d{2})\b/);
  if (numeric) {
    const day = Number(numeric[1]);
    const month = Number(numeric[2]);
    const year = Number(numeric[3]);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) return { day, month, year };
  }

  const named = line.match(/\b(\d{1,2})\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\b/i);
  if (named) {
    const month = MONTHS_EN[named[2].toLowerCase()];
    if (month) return { day: Number(named[1]), month, year: yearNearLine(fullText, lineIndex, month) };
  }
  return null;
}

const KNOWN_FC_OPPONENTS = [
  "Atlético de Madrid", "Atlético Madrid", "Atletico Madrid", "Atletico de Madrid",
  "Villarreal CF", "Villarreal", "Deportivo de La Coruña", "RC Deportivo",
  "Celta de Vigo", "Manchester City", "Man City", "Sabah FK", "Sabah",
  "Real Sociedad", "Real Madrid", "Valencia CF", "Valencia", "Athletic Club",
  "Getafe", "Alavés", "Alaves", "Málaga", "Malaga", "Espanyol", "Osasuna",
  "Sporting CP", "Sporting Lisbon", "Como 1907", "Como", "Aston Villa",
  "Paris Saint-Germain", "Paris SG", "Galatasaray", "Feyenoord", "Levante"
];

function extractKnownTeam(side) {
  const normalized = normalizeSearchText(side);
  if (/\b(fc barcelona|barcelona|barca)\b/.test(normalized)) return "FC Barcelona";
  const candidates = KNOWN_FC_OPPONENTS
    .map(name => ({ name, normalized: normalizeSearchText(name) }))
    .sort((a, b) => b.normalized.length - a.normalized.length);
  return candidates.find(item => normalized.includes(item.normalized))?.name || cleanDisplayText(side, 90);
}

function canonicalTeamKey(name) {
  return normalizeSearchText(name)
    .replace(/\b(fc|cf|club|de|del|the)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseEventDateTime(value, timeZone) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  // ISO con offset/Z = instante preciso. ISO senza offset = ora locale del torneo.
  if (/(?:Z|[+-]\d{2}:?\d{2})$/i.test(raw)) {
    const absolute = new Date(raw);
    return Number.isFinite(absolute.getTime()) ? absolute : null;
  }
  const iso = raw.match(/^(20\d{2})-(\d{2})-(\d{2})(?:[T ](\d{1,2}):(\d{2}))?/);
  if (iso) {
    return wallTimeToDate(Number(iso[1]), Number(iso[2]), Number(iso[3]), Number(iso[4] || 0), Number(iso[5] || 0), timeZone);
  }
  const parsed = new Date(raw);
  return Number.isFinite(parsed.getTime()) ? parsed : null;
}

function teamFromStructured(value) {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) return value.map(teamFromStructured).filter(Boolean).join(" ");
  if (value && typeof value === "object") return String(value.name || value.alternateName || "").trim();
  return "";
}

export function parseSportsFixtures(result) {
  const fixtures = [];
  const seen = new Set();
  const timezone = result.timeZone || "Europe/Madrid";
  const now = Date.now();

  for (const event of result.structuredEvents || []) {
    let home = teamFromStructured(event.homeTeam);
    let away = teamFromStructured(event.awayTeam);
    if ((!home || !away) && event.name) {
      const pair = String(event.name).match(/(.{2,90}?)\s+(?:vs?\.?|–|—)\s+(.{2,90})/i);
      if (pair) { home = pair[1]; away = pair[2]; }
    }
    if (!home || !away || !/barcelona|barca/i.test(`${home} ${away}`)) continue;
    const dateTime = parseEventDateTime(event.startDate, timezone);
    if (!dateTime || dateTime.getTime() < now - 2 * 60 * 60 * 1000) continue;
    const key = `${dateTime.toISOString().slice(0, 16)}-${canonicalTeamKey(home)}-${canonicalTeamKey(away)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    fixtures.push({
      home: /barcelona|barca/i.test(home) ? "FC Barcelona" : cleanDisplayText(home, 90),
      away: /barcelona|barca/i.test(away) ? "FC Barcelona" : cleanDisplayText(away, 90),
      dateTime,
      competition: cleanDisplayText(event.competition || event.name || "Do potwierdzenia", 100),
      source: result.source, sourceUrl: result.url,
      sourceTrust: result.sourceTrust || 5,
      sourceTimeZone: timezone
    });
  }

  // Wiele terminarzy rozdziela gospodarza, gościa, datę i godzinę na osobne
  // komórki tabeli. Odczytujemy taki wiersz tylko wtedy, gdy wszystkie dane są
  // w tej samej tabeli — nie łączymy przypadkowych dat z innych fragmentów strony.
  for (const cells of result.tableRows || []) {
    const rowText = cells.join(" | ");
    if (!/barcelona|barca/i.test(rowText)) continue;
    const date = parseFixtureDate(rowText, String(result.fullText || ""), Math.max(0, String(result.fullText || "").indexOf(rowText)));
    const timeMatch = rowText.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
    if (!date || !timeMatch) continue;
    const teamCells = cells.filter(cell => {
      const normalizedCell = normalizeSearchText(cell);
      return /barcelona|barca/i.test(normalizedCell) || KNOWN_FC_OPPONENTS.some(name => normalizedCell.includes(normalizeSearchText(name)));
    });
    if (teamCells.length < 2) continue;
    const left = extractKnownTeam(teamCells[0]);
    const right = extractKnownTeam(teamCells[1]);
    if (!/barcelona|barca/i.test(`${left} ${right}`)) continue;
    const dateTime = wallTimeToDate(date.year, date.month, date.day, Number(timeMatch[1]), Number(timeMatch[2]), timezone);
    if (dateTime.getTime() < now - 2 * 60 * 60 * 1000) continue;
    const key = `${dateTime.toISOString().slice(0, 16)}-${canonicalTeamKey(left)}-${canonicalTeamKey(right)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    fixtures.push({
      home: /barcelona|barca/i.test(left) ? "FC Barcelona" : left,
      away: /barcelona|barca/i.test(right) ? "FC Barcelona" : right,
      dateTime, competition: /uefa/i.test(result.source) ? "Liga Mistrzów" : /laliga/i.test(result.source) ? "LaLiga" : "Do potwierdzenia",
      source: result.source, sourceUrl: result.url, sourceTrust: result.sourceTrust || 5,
      sourceTimeZone: timezone
    });
  }

  // Ostrożny fallback tekstowy: akceptujemy tylko wiersze zawierające Barcelonę,
  // datę, godzinę i jawny zapis meczu. Nie próbujemy zgadywać brakujących danych.
  const rows = (result.tableRows || []).map(cells => cells.join(" | "));
  const lines = [...rows, ...(result.paragraphs || []), ...String(result.fullText || result.text || "").split(/\n+/)];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!/barcelona|barca/i.test(line)) continue;
    const context = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 2)).join(" | ");
    const pair = context.match(/(.{2,100}?)\s+(?:vs?\.?|–|—)\s+(.{2,100}?)(?=\s*\||$)/i);
    if (!pair || !/barcelona|barca/i.test(`${pair[1]} ${pair[2]}`)) continue;
    const date = parseFixtureDate(context, String(result.fullText || ""), Math.max(0, String(result.fullText || "").indexOf(context)));
    const timeMatch = context.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
    if (!date || !timeMatch) continue;
    const left = extractKnownTeam(pair[1]);
    const right = extractKnownTeam(pair[2]);
    if (!/barcelona|barca/i.test(`${left} ${right}`)) continue;
    const dateTime = wallTimeToDate(date.year, date.month, date.day, Number(timeMatch[1]), Number(timeMatch[2]), timezone);
    if (dateTime.getTime() < now - 2 * 60 * 60 * 1000) continue;
    const key = `${dateTime.toISOString().slice(0, 16)}-${canonicalTeamKey(left)}-${canonicalTeamKey(right)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    fixtures.push({
      home: /barcelona|barca/i.test(left) ? "FC Barcelona" : left,
      away: /barcelona|barca/i.test(right) ? "FC Barcelona" : right,
      dateTime, competition: /uefa/i.test(result.source) ? "Liga Mistrzów" : /laliga/i.test(result.source) ? "LaLiga" : "Do potwierdzenia",
      source: result.source, sourceUrl: result.url, sourceTrust: result.sourceTrust || 5,
      sourceTimeZone: timezone
    });
  }
  return fixtures;
}

export function buildSportsAnswer(results) {
  const fixtures = results.flatMap(parseSportsFixtures);
  if (!fixtures.length) return null;

  const grouped = new Map();
  for (const fixture of fixtures) {
    const day = fixture.dateTime.toISOString().slice(0, 10);
    const pair = [canonicalTeamKey(fixture.home), canonicalTeamKey(fixture.away)].sort().join("-");
    const key = `${day}-${pair}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(fixture);
  }
  const candidates = [...grouped.values()]
    .map(group => group.sort((a, b) => b.sourceTrust - a.sourceTrust))
    .sort((a, b) => a[0].dateTime - b[0].dateTime);
  const primaryGroup = candidates[0];
  const primary = primaryGroup[0];
  const times = new Map();
  for (const item of primaryGroup) {
    const time = new Intl.DateTimeFormat("pl-PL", {
      timeZone: "Europe/Warsaw", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).format(item.dateTime);
    if (!times.has(time)) times.set(time, []);
    times.get(time).push(item);
  }
  const distinctTimes = [...times.keys()];
  const uniqueSources = primaryGroup.filter((item, i, arr) => arr.findIndex(other => other.source === item.source) === i);
  const sourceList = uniqueSources.map(item => `- [${cleanDisplayText(item.source, 100)}](${safeSourceUrl(item.sourceUrl)})`).join("\n");
  const timeLabel = distinctTimes.length === 1 && distinctTimes[0]
    ? `**${formatWarsawDateTime(primary.dateTime)} czasu polskiego**`
    : `**Godzina wymaga potwierdzenia.** Źródła podają: ${distinctTimes.join(" oraz ")}.`;
  const nextMatches = candidates.slice(1, 4).map(group => {
    const item = group[0];
    return `- ${formatWarsawDateTime(item.dateTime)} · ${item.home} – ${item.away}`;
  }).join("\n");
  const corroboration = uniqueSources.length >= 2
    ? `Potwierdzenie: ${uniqueSources.length} niezależne źródła.`
    : "Uwaga: termin znaleziono tylko w jednym źródle. Warto sprawdzić go ponownie przed meczem.";
  const discrepancy = distinctTimes.length > 1
    ? "\n\n⚠️ Źródła różnią się godziną. Koala nie wybiera jednej bez potwierdzenia."
    : "";
  return `## 🐨 Najbliższy mecz FC Barcelony\n\n### ${primary.home} – ${primary.away}\n\n${timeLabel}\n\n**Rozgrywki:** ${primary.competition}\n\n${corroboration}${discrepancy}\n\n${nextMatches ? `### Kolejne znalezione mecze\n${nextMatches}\n\n` : ""}### Źródła\n${sourceList}\n\n_Stan sprawdzenia: ${new Intl.DateTimeFormat("pl-PL", { timeZone: "Europe/Warsaw", dateStyle: "short", timeStyle: "short" }).format(new Date())} czasu polskiego._`;
}

function buildSportsNoDataAnswer() {
  const links = CRAWLER_SOURCES.filter(source => source.category === "sport")
    .map(source => `- [${source.name}](${safeSourceUrl(source.url)})`).join("\n");
  return `## 🐨 Nie udało się potwierdzić terminu meczu\n\nZnalazłam strony terminarzy, ale nie udało mi się wiarygodnie odczytać z nich daty i godziny najbliższego spotkania. Nie będę zgadywać ani podawać przypadkowego meczu z innej sekcji klubu.\n\n### Oficjalne terminarze\n${links}\n\nMożesz otworzyć źródła powyżej. Koala spróbuje ponownie przy następnym zapytaniu.`;
}

function summarizeResultText(result, terms) {
  const raw = result.text || result.description || result.fullText || "";
  const paragraphs = raw.split(/\n+/)
    .map(value => cleanDisplayText(value, 900))
    .filter(value => value.length >= 75 && !/^(home|menu|subscribe|sign in|read more|latest news)$/i.test(value));
  const ranked = paragraphs.map(text => ({
    text,
    score: scoreCrawlerText(text, terms) + Math.min(text.length / 350, 1.5)
  })).sort((a, b) => b.score - a.score);
  const text = ranked[0]?.text || cleanDisplayText(result.description || raw, 600);
  const sentences = text.match(/[^.!?]+[.!?]?/g) || [text];
  return sentences.slice(0, 2).join(" ").replace(/\s+/g, " ").trim().slice(0, 600);
}

function buildResearchSummary(question, results, terms) {
  const newsMode = results.some(result => result.category === "news");
  const language = detectQuestionLanguage(question);
  const labels = getResearchLabels(language);
  const picked = [];
  const seenArticles = new Set();
  const domainCounts = new Map();
  for (const result of results) {
    const summary = summarizeResultText(result, terms);
    const key = normalizeSearchText(`${result.title} ${summary}`).slice(0, 220);
    if (!summary || seenArticles.has(key)) continue;
    const domain = new URL(result.url).hostname;
    if ((domainCounts.get(domain) || 0) >= 2) continue;
    seenArticles.add(key);
    domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1);
    picked.push({ result, summary });
  }

  if (newsMode) picked.sort((a, b) => (b.result.publishedAt || 0) - (a.result.publishedAt || 0));
  const bullets = picked.slice(0, 6).map(({ result, summary }) => {
    const date = result.date ? ` · **Publikacja:** ${cleanDisplayText(result.date, 40)}` : "";
    return `- **${cleanDisplayText(result.title, 160)}** — ${summary}${date} ([${cleanDisplayText(result.source, 70)}](${safeSourceUrl(result.url)}))`;
  }).join("\n");
  const sourceLines = picked.slice(0, 8).map(({ result }, index) =>
    `${index + 1}. [${cleanDisplayText(result.source, 90)} — ${cleanDisplayText(result.title, 140)}](${safeSourceUrl(result.url)})`
  ).join("\n");
  const siteCount = new Set(picked.map(item => new URL(item.result.url).hostname)).size;
  const checkedAt = new Intl.DateTimeFormat(language, {
    timeZone: "Europe/Warsaw", dateStyle: "short", timeStyle: "short"
  }).format(new Date());

  const heading = newsMode ? `🐨 ${labels.news}` : `🐨 ${labels.materials}`;
  const intro = newsMode
    ? `${labels.found} **${picked.length} ${labels.articles} ${siteCount} ${labels.sites}**. ${labels.sorted}`
    : `${labels.found} **${picked.length} ${labels.pages} ${siteCount} ${labels.sites}**, ${labels.match}`;
  const limitation = newsMode
    ? `_${labels.newsLimit}_`
    : `_${labels.generalLimit}_`;

  return `${heading}\n\n${intro}\n\n${labels.important}\n${bullets || "Nie udało się wyodrębnić treści artykułów."}\n\n${labels.sources}\n${sourceLines}\n\n_${labels.checked}: ${checkedAt} (Europe/Warsaw)._\n\n${limitation}`;
}

function isBarcaFixtureQuestion(question) {
  const text = normalizeSearchText(question);
  return /\b(fcbarcelona|fcbarcelony|barcelona|barca|barcelony)\b/.test(text) &&
    /\b(mecz|mecze|terminarz|spotkanie|najblizszy|najblizsza|kiedy|kalendarz|gra)\b/.test(text);
}

async function searchMediaWiki(source, question, terms, deadline) {
  if (!source?.searchApi || Date.now() >= deadline) return [];

  const seed = new URL(source.url);
  const host = seed.hostname;
  const robots = await getCrawlerRobots(seed.origin, host, deadline);
  if (!robots) return [];

  const query = buildIndexedSearchQuery(question);
  if (query.length < 2) return [];

  const apiUrl = new URL("/w/api.php", seed.origin);
  apiUrl.search = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "0",
    gsrlimit: "5",
    prop: "extracts|info|pageprops",
    exintro: "1",
    explaintext: "1",
    exsentences: "8",
    inprop: "url",
    format: "json",
    formatversion: "2"
  }).toString();
  if (!crawlerCanVisit(apiUrl.href, robots)) return [];

  const response = await requestSiteText(apiUrl.href, host, "application/json", 350_000, deadline);
  if (!response?.text) return [];

  let pages;
  try {
    pages = JSON.parse(response.text)?.query?.pages;
  } catch {
    return [];
  }
  if (!Array.isArray(pages)) return [];

  return pages
    .filter(page => page && page.ns === 0 && !page.missing && !Object.hasOwn(page.pageprops || {}, "disambiguation"))
    .map(page => {
      const url = safeSourceUrl(page.fullurl);
      const text = String(page.extract ?? "").replace(/\s+/g, " ").trim();
      if (!url || text.length < 80) return null;
      const paragraphs = text.split(/(?<=[.!?])\s+/).filter(part => part.length > 35);
      const relevance = getDocumentRelevance({
        title: page.title || "",
        description: paragraphs[0] || "",
        paragraphs,
        text
      }, url, terms);
      if (!relevance.strongMatch || relevance.score < 7) return null;
      return {
        source: source.name,
        sourceTrust: source.trust || 5,
        title: cleanDisplayText(page.title || source.name, 180),
        url,
        description: paragraphs[0] || "",
        text: text.slice(0, 6000),
        score: relevance.score + (source.category === "language" ? 10 : 8),
        category: source.category || "general"
      };
    })
    .filter(Boolean);
}

async function searchAllSources(question) {
  const normalizedQuestion = normalizeSearchText(question);
  const cacheKey = normalizedQuestion;
  const cached = cacheGet(SEARCH_CACHE, cacheKey);
  if (cached) return cached;

  const terms = getCrawlerTerms(question);
  if (!terms.length) return null;
  const deadline = Date.now() + CRAWLER_TOTAL_BUDGET;
  const preferredSource = extractAllowedSourceFromMessage(question);
  let sources = selectCrawlerSources(question);
  if (preferredSource) sources = [preferredSource, ...sources.filter(source => source.name !== preferredSource.name)];
  sources = unique(sources.map(source => source.name))
    .map(name => CRAWLER_SOURCES.find(source => source.name === name))
    .filter(Boolean)
    .slice(0, CRAWLER_MAX_SOURCES);

  const resultsBySite = await Promise.all(sources.map(async source => {
    if (!source.searchApi) return crawlPublicSite(source, question, terms, deadline);
    const indexedResults = await searchMediaWiki(source, question, terms, deadline);
    return indexedResults.length ? indexedResults : crawlPublicSite(source, question, terms, deadline);
  }));
  const allResults = resultsBySite.flat();
  const seen = new Set();
  const uniqueResults = allResults.filter(result => {
    const safeUrl = safeSourceUrl(result.url);
    if (!safeUrl || seen.has(safeUrl)) return false;
    seen.add(safeUrl);
    return true;
  });

  if (isBarcaFixtureQuestion(question)) {
    const sportResults = uniqueResults.filter(result => result.fixtures?.length || result.category !== "news");
    const sportsAnswer = buildSportsAnswer(sportResults);
    const answer = sportsAnswer || buildSportsNoDataAnswer();
    cacheSet(SEARCH_CACHE, cacheKey, answer, SEARCH_CACHE_TTL, SEARCH_CACHE_LIMIT);
    return answer;
  }

  const isNewsRequest = /\b(wiadomosci|aktualnosci|wydarzenia|co sie dzieje|co sie wydarzylo|co nowego|na swiecie|ze swiata|najnowsz)\b/.test(normalizedQuestion);
  let rankedResults = uniqueResults;
  if (isNewsRequest) {
    rankedResults = uniqueResults.filter(result => result.category === "news" && result.publishedAt);
    rankedResults.sort((a, b) => (b.publishedAt - a.publishedAt) || (b.score - a.score));
  } else {
    rankedResults.sort((a, b) => (b.score + (b.sourceTrust || 0) * 0.15) - (a.score + (a.sourceTrust || 0) * 0.15));
  }

  const results = [];
  const domainCounts = new Map();
  for (const result of rankedResults) {
    const domain = new URL(result.url).hostname;
    const maxPerDomain = isNewsRequest ? 2 : 3;
    if ((domainCounts.get(domain) || 0) >= maxPerDomain) continue;
    domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1);
    results.push(result);
    if (results.length >= CRAWLER_MAX_RESULTS) break;
  }

  if (!results.length) return null;
  const answer = buildResearchSummary(question, results, terms);
  cacheSet(SEARCH_CACHE, cacheKey, answer, SEARCH_CACHE_TTL, SEARCH_CACHE_LIMIT);
  return answer;
}

// ---------------------------------------------------------------------------
// DECYZJA, KIEDY SZUKAĆ W INTERNECIE
// ---------------------------------------------------------------------------

function isLocalUnknown(answer) {
  if (typeof answer !== "string") return false;
  return normalizeSearchText(answer).includes(
    "nie znalazlam jeszcze tego zagadnienia w mojej lokalnej bazie wiedzy"
  );
}

function asksToVerifyOnline(message) {
  const text = normalizeSearchText(message);
  return /\b(sprawdz|zweryfikuj|potwierdz|skontroluj|w internecie|online|wyszukaj|poszukaj)\b/.test(text);
}

function asksForCurrentInformation(message) {
  const text = normalizeSearchText(message);
  if (/\b(aktualnie|obecnie|dzisiaj|jutro|wczoraj|najnowszy|najnowsza|najnowsze|na zywo|najblizszy|najblizsza|najblizsze|teraz|co nowego|co wiadomo|co sie dzieje|co sie wydarzylo|ostatnie informacje|aktualnosci|wydarzenia)\b/.test(text)) {
    return true;
  }
  return /\b(mecz|spotkanie|terminarz|wynik meczu|pogoda|kurs walut|kurs euro|kurs dolara)\b/.test(text);
}

function isUnsupportedLiveDataQuestion(message) {
  const text = normalizeSearchText(message);
  // W skonfigurowanych witrynach nie ma specjalistycznego źródła pogody ani FX.
  return /\b(pogoda|prognoza pogody|kurs walut|kurs euro|kurs dolara|notowania gieldowe)\b/.test(text);
}

function shouldSearchOnline(message, answer, history) {
  return classifyQuestion(message, answer, history).shouldSearchWeb;
}

function getNoSearchResultMessage(message, localUnknown) {
  if (isUnsupportedLiveDataQuestion(message)) {
    return "🐨 Nie mam jeszcze skonfigurowanego własnego źródła danych pogodowych ani kursów walut. Nie chcę zgadywać aktualnych wartości. Mogę natomiast wyjaśnić, jak odczytywać prognozę lub kurs walut, albo przeanalizować dane, które wkleisz.";
  }

  if (localUnknown || asksForCurrentInformation(message)) {
    return "🐨 Nie udało mi się znaleźć pasujących materiałów w witrynach, które Koala ma obecnie skonfigurowane.\n\nMożliwe przyczyny:\n• witryna nie pozwala robotom pobierać treści;\n• strona ładuje informacje dopiero przez JavaScript;\n• mapa witryny nie zawiera szukanej podstrony;\n• dostępne witryny nie obejmują jeszcze tego tematu.\n\nMożesz wkleić adres strony lub materiał, a pomogę go przeanalizować.";
  }

  return "\n\n🐨 Nie udało mi się znaleźć dodatkowych materiałów w skonfigurowanych witrynach.";
}

// ---------------------------------------------------------------------------
// BEZPIECZNE ODCZYTANIE ŻĄDANIA DO NETLIFY
// ---------------------------------------------------------------------------

class RequestTooLargeError extends Error {
  constructor() {
    super("Żądanie jest za duże.");
    this.name = "RequestTooLargeError";
  }
}

async function readJsonBodyLimited(request) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    throw new RequestTooLargeError();
  }

  if (!request.body) return {};
  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_REQUEST_BYTES) {
        await reader.cancel().catch(() => {});
        throw new RequestTooLargeError();
      }
      chunks.push(value);
    }
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return JSON.parse(new TextDecoder("utf-8").decode(bytes));
}

function getSafeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter(item =>
      item &&
      typeof item === "object" &&
      ["user", "model"].includes(item.role) &&
      typeof item.text === "string"
    )
    .slice(-MAX_HISTORY_ITEMS)
    .map(item => ({
      role: item.role,
      text: item.text.slice(0, MAX_MESSAGE_LENGTH)
    }));
}

function hasUnsupportedMedia(body) {
  const mediaField = /^(image|images|video|videos|media|attachments|files)$/i;
  const mediaMime = /^(image|video)\//i;
  const mediaExtension = /\.(?:avif|bmp|gif|heic|jpe?g|m4v|mov|mp4|mpeg|mpg|png|webm|webp)$/i;

  function nonEmpty(value) {
    if (value == null || value === false || value === "") return false;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  }

  function inspect(value, depth = 0) {
    if (depth > 6 || !value || typeof value !== "object") return false;
    if (Array.isArray(value)) return value.some(item => inspect(item, depth + 1));

    const mime = String(value.mimeType || value.mime_type || value.contentType || "");
    const type = String(value.type || "");
    const name = String(value.name || value.filename || value.fileName || "");
    if (mediaMime.test(mime) || /^(image|video)$/i.test(type) || mediaExtension.test(name)) return true;

    return Object.entries(value).some(([key, nested]) => {
      if (mediaField.test(key) && nonEmpty(nested)) return true;
      if (key === "message" || key === "history") return false;
      if (typeof nested === "string" && /^data:(?:image|video)\//i.test(nested)) return true;
      return inspect(nested, depth + 1);
    });
  }

  return inspect(body);
}

function isTeacherMaterialsRequest(message) {
  const text = normalizeSearchText(message);
  return /^(?:tryb nauczycielski|nauczyciel)\b/.test(text)
    || /\b(scenariusz lekcji|konspekt lekcji|cele lekcji|przygotuj kartkowke|stworz kartkowke|przygotuj sprawdzian|stworz sprawdzian|materialy dla nauczyciela)\b/.test(text);
}

function parseTeacherBootstrapResponse(text) {
  const trimmed = String(text || "").trim();
  const marker = "koalaTeacherVerify(";
  const start = trimmed.indexOf(marker);
  if (start >= 0) {
    const jsonStart = start + marker.length;
    const end = trimmed.lastIndexOf(")");
    if (end <= jsonStart) return null;
    try { return JSON.parse(trimmed.slice(jsonStart, end).trim().replace(/;$/, "")); } catch { return null; }
  }
  try { return JSON.parse(trimmed); } catch { return null; }
}

async function verifyTeacherSession(sessionToken, userName) {
  const token = String(sessionToken || "").trim();
  const requestedName = normalizeSearchText(userName);
  if (!token || token.length > 4096 || !requestedName) return false;

  const endpoint = new URL(GOOGLE_SHEETS_URL);
  endpoint.searchParams.set("action", "bootstrap");
  endpoint.searchParams.set("token", token);
  endpoint.searchParams.set("callback", "koalaTeacherVerify");
  endpoint.searchParams.set("_", String(Date.now()));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const response = await fetch(endpoint.href, {
      method: "GET",
      redirect: "follow",
      headers: { Accept: "application/javascript, application/json, text/plain" },
      signal: controller.signal
    });
    const declaredSize = Number(response.headers.get("content-length") || 0);
    if (!response.ok || (declaredSize && declaredSize > 1_000_000)) return false;
    const payloadText = await response.text();
    if (payloadText.length > 1_000_000) return false;
    const payload = parseTeacherBootstrapResponse(payloadText);
    if (!payload || payload.success === false) return false;
    const result = payload.result && typeof payload.result === "object" ? payload.result : payload;
    const identity = result.authenticatedUser || result.currentUser || result.user || result.account || result.session?.user;
    return normalizeSearchText(identity?.name || identity?.username) === requestedName
      && normalizeSearchText(identity?.role) === "nauczyciel";
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

// ---------------------------------------------------------------------------
// CORS I ODPOWIEDZI JSON
// ---------------------------------------------------------------------------

function corsHeaders(origin) {
  const allowedOrigin = origin && ALLOWED_ORIGINS.has(origin)
    ? origin
    : FRONTEND_ORIGIN;

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function jsonResponse(data, status = 200, origin = null) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(origin),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });
}

// ---------------------------------------------------------------------------
// GŁÓWNA FUNKCJA NETLIFY
// ---------------------------------------------------------------------------

export default async function handler(request) {
  const origin = request.headers.get("origin");

  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return jsonResponse({ answer: "Niedozwolone źródło żądania." }, 403, FRONTEND_ORIGIN);
  }

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (request.method !== "POST") {
    return jsonResponse({ answer: "Ta funkcja obsługuje żądania POST." }, 405, origin);
  }

  let body;
  try {
    body = await readJsonBodyLimited(request);
  } catch (error) {
    const tooLarge = error instanceof RequestTooLargeError;
    return jsonResponse(
      { answer: tooLarge
        ? "Żądanie jest za duże. Skróć historię rozmowy i spróbuj ponownie."
        : "Nie udało się odczytać wiadomości. Wyślij ją ponownie." },
      tooLarge ? 413 : 400,
      origin
    );
  }

  if (hasUnsupportedMedia(body)) {
    return jsonResponse({
      answer: "🐨 Nie mogę odczytywać zdjęć ani filmów, w tym ukrytych poleceń. Wklej treść pytania jako tekst, a pomogę na jej podstawie."
    }, 200, origin);
  }

  if (!body || typeof body.message !== "string" || !body.message.trim()) {
    return jsonResponse({ answer: "Napisz pytanie, a Koala spróbuje Ci pomóc." }, 400, origin);
  }

  const message = body.message.trim();
  if (message.length > MAX_MESSAGE_LENGTH) {
    return jsonResponse(
      { answer: `Wiadomość jest za długa. Maksymalnie ${MAX_MESSAGE_LENGTH} znaków.` },
      413,
      origin
    );
  }

  const blockedReason = getBlockedContentReason(message);
  if (blockedReason) {
    return jsonResponse({
      answer: getContentBlockMessage(blockedReason, detectQuestionLanguage(message))
    }, 200, origin);
  }

  const history = getSafeHistory(body.history);

  if (isTeacherMaterialsRequest(message)) {
    const teacherSessionValid = await verifyTeacherSession(body.sessionToken, body.userName);
    if (!teacherSessionValid) {
      return jsonResponse({
        answer: "🔒 Narzędzia nauczyciela są dostępne wyłącznie po zalogowaniu na zweryfikowane konto z rolą nauczyciel."
      }, 403, origin);
    }
    return jsonResponse({ answer: createTeacherMaterials(message) }, 200, origin);
  }

  try {
    const localAnswer = answerQuestion(message, history);
    let finalAnswer = typeof localAnswer === "string"
      ? localAnswer
      : "Nie udało mi się przygotować odpowiedzi. Spróbuj ponownie.";

    const localUnknown = isLocalUnknown(finalAnswer);
    const route = classifyQuestion(message, finalAnswer, history);
    const onlineSearch = shouldSearchOnline(message, finalAnswer, history);

    if (onlineSearch && !["greeting", "thanks", "social", "math", "knowledge", "knowledge-comparison", "study-plan", "local-study", "quiz-answer", "teacher-answer"].includes(route.kind)) {
      const internetAnswer = await searchAllSources(route.searchQuery || message);
      const searchIsPrimary = !route.topic || localUnknown || asksForCurrentInformation(message) || Boolean(route.searchQuery);
      if (internetAnswer) {
        if (searchIsPrimary) {
          finalAnswer = internetAnswer;
        } else {
          finalAnswer += `\n\n---\n\n🐨 Dodatkowe materiały z internetu\n\n${internetAnswer}`;
        }
      } else {
        const noResult = getNoSearchResultMessage(message, localUnknown).trim();
        if (searchIsPrimary) finalAnswer = noResult;
        else finalAnswer += `\n\n${noResult}`;
      }
    }

    // Zachowujemy dotychczasowy kontrakt frontend-backend: wyłącznie { answer }.
    return jsonResponse({ answer: finalAnswer }, 200, origin);
  } catch (error) {
    console.error("Koala function error:", error?.message || error);
    return jsonResponse(
      { answer: "🐨 Wystąpił błąd podczas przygotowywania odpowiedzi. Spróbuj ponownie." },
      500,
      origin
    );
  }
}
