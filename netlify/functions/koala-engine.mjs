/*
 * Koala.ai v9 — Brain — lokalny silnik edukacyjny z kontekstem, ćwiczeniami i rozszerzoną bazą wiedzy.
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
  },
  {
    title: "Równania liniowe",
    keywords: ["równanie liniowe", "równania liniowe", "równanie z niewiadomą", "równania z x"],
    aliases: ["równania", "równaniu", "niewiadoma"],
    short: "Równanie to zapis, w którym dwie strony są równe. Rozwiązanie to taka wartość niewiadomej, która spełnia równość.",
    explanation: "Aby rozwiązać równanie, wykonujemy te same działania po obu stronach, tak aby zostawić niewiadomą po jednej stronie, a liczby po drugiej.",
    example: "W równaniu x + 5 = 12 odejmujemy 5 po obu stronach: x = 12 − 5, więc x = 7.",
    related: "Po znalezieniu rozwiązania warto podstawić je do równania i sprawdzić, czy obie strony są równe.",
    check: "Rozwiąż w pamięci: x + 5 = 12."
  },
  {
    title: "Ułamki dziesiętne",
    keywords: ["ułamek dziesiętny", "ułamki dziesiętne", "liczby dziesiętne", "przecinek dziesiętny"],
    aliases: ["ułamka dziesiętnego", "ułamkach dziesiętnych"],
    short: "Ułamek dziesiętny zapisuje część całości za pomocą cyfr po przecinku.",
    explanation: "Pierwsza cyfra po przecinku oznacza części dziesiąte, druga — setne, a trzecia — tysięczne. Zera na końcu części dziesiętnej nie zmieniają wartości liczby.",
    example: "0,5 to pięć dziesiątych, czyli tyle samo co 0,50 i jedna druga.",
    related: "Ułamki dziesiętne można dodawać i odejmować, ustawiając przecinki jeden pod drugim.",
    check: "Ile setnych oznacza liczba 0,25?"
  },
  {
    title: "Podmiot i orzeczenie",
    keywords: ["podmiot i orzeczenie", "podmiot", "orzeczenie", "części zdania"],
    aliases: ["podmiotu", "orzeczenia", "podmiocie", "orzeczeniu"],
    short: "Podmiot wskazuje, o kim lub o czym jest zdanie, a orzeczenie mówi, co podmiot robi lub co się z nim dzieje.",
    explanation: "Podmiot najczęściej odpowiada na pytania „kto?” lub „co?”, a orzeczenie jest zwykle czasownikiem i odpowiada na pytania „co robi?” lub „co się z nim dzieje?”.",
    example: "W zdaniu „Ania czyta książkę” podmiotem jest „Ania”, a orzeczeniem „czyta”.",
    related: "Podmiot i orzeczenie tworzą główne części zdania.",
    check: "W zdaniu „Ptaki śpiewają” wskaż podmiot i orzeczenie."
  },
  {
    title: "Stany skupienia",
    keywords: ["stany skupienia", "stan skupienia", "ciało stałe", "ciecz i gaz"],
    aliases: ["stanie skupienia", "stanach skupienia"],
    short: "Podstawowe stany skupienia materii to stan stały, ciekły i gazowy.",
    explanation: "Ciało stałe zachowuje kształt i objętość. Ciecz zachowuje objętość, ale przyjmuje kształt naczynia. Gaz rozprzestrzenia się i wypełnia dostępną przestrzeń.",
    example: "Lód jest ciałem stałym, woda w szklance jest cieczą, a para wodna jest gazem.",
    related: "Ogrzewanie lub chłodzenie może powodować zmianę stanu skupienia.",
    check: "Jaki stan skupienia ma woda w szklance?"
  },
  {
    title: "Obieg wody w przyrodzie",
    keywords: ["obieg wody", "cykl wody", "krążenie wody w przyrodzie"],
    aliases: ["obiegu wody", "cyklu wody"],
    short: "Woda nieustannie krąży między powierzchnią Ziemi, atmosferą i organizmami.",
    explanation: "Słońce ogrzewa wodę, która paruje. Para wodna ochładza się i skrapla w chmurach. Potem woda spada jako opad i wraca do rzek, jezior, mórz oraz gleby.",
    example: "Kałuża po deszczu paruje w ciepły dzień, a woda trafia do atmosfery.",
    related: "Energia Słońca napędza obieg wody, a grawitacja pomaga opadom spływać ku niżej położonym miejscom.",
    check: "Jak nazywa się zmiana ciekłej wody w parę wodną?"
  },
  {
    title: "Układ krwionośny",
    keywords: ["układ krwionośny", "uklad krazenia", "krążenie krwi", "serce i krew"],
    aliases: ["układu krwionośnego", "krążenia"],
    short: "Układ krwionośny transportuje krew, tlen, substancje odżywcze i produkty przemiany materii po organizmie.",
    explanation: "Serce działa jak pompa. Krew płynie naczyniami krwionośnymi: tętnicami, żyłami i naczyniami włosowatymi.",
    example: "Podczas wysiłku serce zwykle bije szybciej, aby sprawniej dostarczać tlen pracującym mięśniom.",
    related: "Serce, krew i naczynia krwionośne współpracują, utrzymując transport substancji w ciele.",
    check: "Jaką funkcję pełni serce w układzie krwionośnym?"
  },
  {
    title: "Kontynenty i oceany",
    keywords: ["kontynenty i oceany", "kontynenty", "oceany świata", "oceany swiata"],
    aliases: ["kontynentów", "oceanów", "kontynencie"],
    short: "Na Ziemi wyróżnia się siedem kontynentów i pięć oceanów.",
    explanation: "Kontynenty to duże obszary lądowe. Oceany to rozległe słone zbiorniki wodne. Ich nazwy i podział pomagają opisywać mapę świata.",
    example: "Europa jest jednym z kontynentów, a Ocean Atlantycki leży między Europą i Afryką a Amerykami.",
    related: "W szkolnym podziale wyróżniamy kontynenty: Azję, Afrykę, Amerykę Północną, Amerykę Południową, Antarktydę, Europę i Australię.",
    check: "Wymień dwa dowolne oceany."
  },
  {
    title: "Epoki historyczne",
    keywords: ["epoki historyczne", "podział dziejów", "prehistoria i historia"],
    aliases: ["epok historycznych", "epokach historycznych"],
    short: "Dzieje człowieka dzieli się na epoki, aby łatwiej porządkować wydarzenia i zmiany.",
    explanation: "W szkolnym podziale historii wyróżnia się starożytność, średniowiecze, nowożytność i czasy współczesne. Prehistoria obejmuje dzieje przed wynalezieniem pisma.",
    example: "Upadek zachodniego Cesarstwa Rzymskiego w 476 roku tradycyjnie przyjmuje się jako koniec starożytności.",
    related: "Granice epok są umowne i pomagają porządkować przeszłość.",
    check: "Jak nazywa się epoka między starożytnością a nowożytnością?"
  },
  {
    title: "Twierdzenie Pitagorasa",
    keywords: ["twierdzenie pitagorasa", "pitagoras", "trójkąt prostokątny", "trojkat prostokatny"],
    aliases: ["pitagorasa", "przeciwprostokątna", "przeciwprostokatna"],
    short: "W trójkącie prostokątnym suma kwadratów przyprostokątnych jest równa kwadratowi przeciwprostokątnej: a² + b² = c².",
    explanation: "Przyprostokątne tworzą kąt prosty, a przeciwprostokątna leży naprzeciw niego i jest najdłuższym bokiem. Twierdzenie pozwala obliczyć długość brakującego boku.",
    example: "Dla przyprostokątnych 3 i 4: c² = 3² + 4² = 9 + 16 = 25, więc c = 5.",
    related: "Twierdzenie stosujemy tylko do trójkątów prostokątnych.",
    check: "Jaką długość ma przeciwprostokątna trójkąta o przyprostokątnych 3 i 4?"
  },
  {
    title: "Pole trójkąta",
    keywords: ["pole trójkąta", "pole trojkata", "pole trójkąta wzór"],
    aliases: ["pola trójkąta", "polu trojkata"],
    short: "Pole trójkąta obliczamy ze wzoru P = a × h ÷ 2.",
    explanation: "Mnożymy długość podstawy przez wysokość opuszczoną na tę podstawę, a następnie dzielimy wynik przez 2.",
    example: "Dla podstawy 8 cm i wysokości 5 cm: P = 8 × 5 ÷ 2 = 20 cm².",
    related: "Wysokość musi być prostopadła do wybranej podstawy.",
    check: "Oblicz pole trójkąta o podstawie 6 cm i wysokości 4 cm."
  },
  {
    title: "Pole koła",
    keywords: ["pole koła", "pole kola", "koło i okrąg", "kolo i okrag"],
    aliases: ["pola koła", "polu kola", "promień koła", "promien kola"],
    short: "Pole koła obliczamy ze wzoru P = πr², gdzie r to promień, a π jest w przybliżeniu równe 3,14.",
    explanation: "Podnosimy promień do kwadratu i mnożymy przez π. Promień to odległość od środka koła do jego brzegu.",
    example: "Dla promienia 2 cm: P = π × 2² = 4π cm², czyli około 12,56 cm².",
    related: "Obwód okręgu obliczamy ze wzoru O = 2πr.",
    check: "Jaki wzór zastosujesz, aby obliczyć pole koła?"
  },
  {
    title: "Średnia arytmetyczna",
    keywords: ["średnia arytmetyczna", "srednia arytmetyczna", "jak obliczyć średnią", "jak obliczyc srednia"],
    aliases: ["średniej arytmetycznej", "srednia"],
    short: "Średnia arytmetyczna to suma liczb podzielona przez ich liczbę.",
    explanation: "Dodajemy wszystkie wartości, a potem dzielimy sumę przez to, ile wartości dodaliśmy.",
    example: "Średnia liczb 2, 4 i 6 wynosi (2 + 4 + 6) ÷ 3 = 4.",
    related: "Średnia pomaga opisać typową wartość w zestawie danych, ale nie musi być jedną z podanych liczb.",
    check: "Oblicz średnią liczb 3, 5 i 7."
  },
  {
    title: "Skala mapy",
    keywords: ["skala mapy", "skala na mapie", "skala liczbowa"],
    aliases: ["skali mapy", "skali na mapie"],
    short: "Skala mapy pokazuje, ile razy odległości na mapie są mniejsze od odległości w terenie.",
    explanation: "W skali 1:100 000 jeden centymetr na mapie odpowiada 100 000 centymetrów w terenie, czyli 1 kilometrowi.",
    example: "Przy skali 1:100 000 odcinek 3 cm na mapie oznacza 3 km w terenie.",
    related: "Przed obliczeniem odległości sprawdź, czy jednostki są takie same.",
    check: "Ile kilometrów w terenie odpowiada 2 cm na mapie w skali 1:100 000?"
  },
  {
    title: "Łańcuch pokarmowy",
    keywords: ["łańcuch pokarmowy", "lancuch pokarmowy", "sieć pokarmowa", "siec pokarmowa"],
    aliases: ["łańcucha pokarmowego", "lancucha pokarmowego"],
    short: "Łańcuch pokarmowy pokazuje, kto jest pokarmem dla kolejnego organizmu.",
    explanation: "Często zaczyna się od producenta, na przykład rośliny. Roślinożerca zjada roślinę, a drapieżnik może zjadać roślinożercę.",
    example: "Trawa → konik polny → żaba → bocian.",
    related: "Strzałka wskazuje kierunek przepływu materii i energii — od zjadanej istoty do zjadającej.",
    check: "Kto jest producentem w łańcuchu: trawa → zając → lis?"
  },
  {
    title: "Chrzest Polski",
    keywords: ["chrzest polski", "966", "mieszko i", "mieszko pierwszy"],
    aliases: ["chrztu polski", "chrzcie polski"],
    short: "Chrzest Mieszka I w 966 roku jest tradycyjnie uznawany za symboliczny początek chrystianizacji państwa Polan.",
    explanation: "Decyzja Mieszka I wiązała się z przyjęciem chrześcijaństwa przez jego dwór i państwo oraz wzmacniała pozycję wśród europejskich władców.",
    example: "Ważna data: 966 — chrzest Mieszka I.",
    related: "Wydarzenie nie oznaczało, że wszyscy mieszkańcy przyjęli nową religię tego samego dnia.",
    check: "W którym roku odbył się chrzest Mieszka I?"
  },
  {
    title: "Rozbiory Polski",
    keywords: ["rozbiory polski", "rozbiory", "pierwszy rozbiór polski", "trzeci rozbiór polski"],
    aliases: ["rozbiorów", "rozbiorze polski"],
    short: "Rozbiory Polski to trzy podziały ziem Rzeczypospolitej dokonane przez Rosję, Prusy i Austrię w latach 1772, 1793 i 1795.",
    explanation: "Po trzecim rozbiorze państwo polskie zniknęło z mapy Europy na 123 lata. Przyczyną były między innymi osłabienie państwa i działania sąsiednich mocarstw.",
    example: "Daty do zapamiętania: 1772 — I rozbiór, 1793 — II rozbiór, 1795 — III rozbiór.",
    related: "Odzyskanie niepodległości przez Polskę nastąpiło w 1918 roku.",
    check: "W którym roku miał miejsce trzeci rozbiór Polski?"
  },
  {
    title: "Starożytna Grecja",
    keywords: ["starożytna grecja", "starozytna grecja", "greckie polis", "ateny i sparta"],
    aliases: ["starożytnej grecji", "grecji"],
    short: "Starożytna Grecja składała się z wielu niezależnych poleis, czyli miast-państw.",
    explanation: "Ateny kojarzy się z rozwojem demokracji i kultury, a Spartę z silną organizacją wojskową. Grecy rozwinęli filozofię, teatr, igrzyska i naukę.",
    example: "Ateny i Sparta leżały w tej samej krainie kulturowej, ale miały odmienne ustroje i sposób życia.",
    related: "Demokracja ateńska była ograniczona — praw politycznych nie mieli wszyscy mieszkańcy.",
    check: "Jak nazywały się niezależne miasta-państwa w starożytnej Grecji?"
  },
  {
    title: "Prawa dziecka",
    keywords: ["prawa dziecka", "konwencja o prawach dziecka", "praw dziecka"],
    aliases: ["prawach dziecka", "praw dziecka"],
    short: "Prawa dziecka chronią godność, bezpieczeństwo i rozwój każdej osoby przed ukończeniem 18 lat.",
    explanation: "Obejmują między innymi prawo do nauki, ochrony przed przemocą, opieki zdrowotnej, odpoczynku oraz wyrażania własnego zdania z uwzględnieniem wieku i dojrzałości.",
    example: "Uczeń ma prawo do bezpiecznych warunków nauki i do tego, by jego zdanie zostało wysłuchane.",
    related: "Prawom towarzyszą obowiązki i odpowiedzialność za szanowanie praw innych osób.",
    check: "Podaj jedno prawo dziecka."
  },
  {
    title: "Bezpieczeństwo w internecie",
    keywords: ["bezpieczeństwo w internecie", "bezpieczenstwo w internecie", "bezpieczny internet", "cyberbezpieczeństwo"],
    aliases: ["bezpieczeństwa w internecie", "cyberbezpieczeństwa"],
    short: "Bezpieczeństwo w internecie polega na ochronie swoich danych, kont i prywatności oraz na odpowiedzialnym traktowaniu innych.",
    explanation: "Używaj unikalnych haseł, nie podawaj obcym danych prywatnych, sprawdzaj wiarygodność wiadomości i zgłaszaj zaufanej osobie niepokojące sytuacje.",
    example: "Jeśli nieznajomy prosi o hasło lub adres, nie wysyłaj tych danych i powiedz o tym zaufanemu dorosłemu.",
    related: "To, co publikujemy w sieci, może być kopiowane i długo pozostawać dostępne.",
    check: "Co zrobisz, gdy ktoś nieznajomy poprosi Cię w internecie o hasło?"
  },
  {
    title: "Układ oddechowy",
    keywords: ["układ oddechowy", "uklad oddechowy", "oddychanie człowieka", "oddychanie czlowieka"],
    aliases: ["układu oddechowego", "płuca", "pluca"],
    short: "Układ oddechowy pobiera tlen z powietrza i usuwa z organizmu dwutlenek węgla.",
    explanation: "Powietrze przepływa przez drogi oddechowe do płuc. W pęcherzykach płucnych tlen przenika do krwi, a dwutlenek węgla przechodzi z krwi do powietrza wydychanego.",
    example: "Podczas wdechu klatka piersiowa się rozszerza, a podczas wydechu powietrze opuszcza płuca.",
    related: "Układ oddechowy współpracuje z układem krwionośnym, który rozprowadza tlen po ciele.",
    check: "Jaki gaz pobieramy z powietrza podczas oddychania?"
  },
  {
    title: "Układ pokarmowy",
    keywords: ["układ pokarmowy", "uklad pokarmowy", "trawienie", "droga pokarmu"],
    aliases: ["układu pokarmowego", "układzie pokarmowym"],
    short: "Układ pokarmowy rozdrabnia i trawi pokarm oraz umożliwia wchłanianie składników odżywczych.",
    explanation: "Pokarm przechodzi przez jamę ustną, przełyk, żołądek i jelito cienkie. W jelicie cienkim większość składników odżywczych trafia do krwi, a w jelicie grubym wchłaniana jest między innymi woda.",
    example: "Trawienie skrobi zaczyna się już w jamie ustnej dzięki enzymom obecnym w ślinie.",
    related: "Zdrowe odżywianie i regularne picie wody wspierają pracę układu pokarmowego.",
    check: "W którym narządzie wchłania się większość składników odżywczych?"
  },
  {
    title: "Ekosystem",
    keywords: ["ekosystem", "ekosystemy", "elementy ekosystemu"],
    aliases: ["ekosystemu", "ekosystemie"],
    short: "Ekosystem tworzą organizmy żywe oraz środowisko, w którym żyją, i zależności między nimi.",
    explanation: "W ekosystemie występują czynniki ożywione, takie jak rośliny i zwierzęta, oraz nieożywione, takie jak woda, gleba, światło i temperatura.",
    example: "Las jest ekosystemem: żyją w nim drzewa, grzyby i zwierzęta, a ich życie zależy od gleby, wody i światła.",
    related: "Zmiana jednego elementu może wpływać na wiele innych organizmów.",
    check: "Podaj jeden czynnik ożywiony i jeden nieożywiony w lesie."
  },
  {
    title: "Mieszaniny i roztwory",
    keywords: ["mieszanina", "mieszaniny", "roztwór", "roztwor", "mieszanina jednorodna"],
    aliases: ["mieszaniny", "roztworu", "roztworze"],
    short: "Mieszanina powstaje z połączenia co najmniej dwóch substancji, które nie tracą swoich właściwości chemicznych.",
    explanation: "W mieszaninie jednorodnej składników nie da się odróżnić gołym okiem, na przykład w roztworze soli. W niejednorodnej składniki są widoczne, jak piasek w wodzie.",
    example: "Woda z całkowicie rozpuszczoną solą jest mieszaniną jednorodną.",
    related: "Składniki mieszanin można często rozdzielać metodami fizycznymi, na przykład filtracją lub odparowaniem.",
    check: "Czy piasek zmieszany z wodą tworzy mieszaninę jednorodną?"
  },
  {
    title: "Siła tarcia",
    keywords: ["siła tarcia", "sila tarcia", "tarcie", "siła oporu"],
    aliases: ["siły tarcia", "tarcia"],
    short: "Tarcie to siła, która zwykle utrudnia przesuwanie się stykających powierzchni względem siebie.",
    explanation: "Tarcie zależy między innymi od rodzaju i nacisku powierzchni. Może być pożyteczne, jak tarcie butów o podłoże, albo niepożądane, jak zużywanie części maszyn.",
    example: "Bieżnik buta zwiększa przyczepność, dzięki czemu łatwiej i bezpieczniej chodzić.",
    related: "Tarcie można zmniejszać przez smarowanie lub stosowanie kół i łożysk.",
    check: "Podaj przykład, w którym tarcie pomaga człowiekowi."
  },
  {
    title: "Ruch obrotowy Ziemi",
    keywords: ["ruch obrotowy ziemi", "obrót ziemi wokół osi", "doba i dzień noc"],
    aliases: ["ruchu obrotowego ziemi", "obrocie ziemi"],
    short: "Ziemia obraca się wokół własnej osi z zachodu na wschód.",
    explanation: "Pełny obrót trwa około 24 godzin. Jego skutkiem jest następstwo dnia i nocy, ponieważ różne części Ziemi są kolejno oświetlane przez Słońce.",
    example: "Gdy w Polsce jest dzień, po przeciwnej stronie Ziemi może być noc.",
    related: "Ruch obrotowy Ziemi należy odróżniać od jej obiegu wokół Słońca.",
    check: "Jaki jest główny skutek ruchu obrotowego Ziemi?"
  },
  {
    title: "Zdania pojedyncze i złożone",
    keywords: ["zdanie pojedyncze", "zdanie złożone", "zdania pojedyncze i złożone"],
    aliases: ["zdania pojedynczego", "zdania złożonego", "zdaniu złożonym"],
    short: "Zdanie pojedyncze zawiera jedno orzeczenie, a zdanie złożone — co najmniej dwa orzeczenia.",
    explanation: "Liczba orzeczeń pomaga rozpoznać liczbę wypowiedzeń składowych. Zdania złożone mogą łączyć części współrzędnie lub podrzędnie.",
    example: "„Pada deszcz” jest zdaniem pojedynczym. „Pada deszcz, więc zostajemy w domu” jest złożone.",
    related: "Samo występowanie kilku czasowników nie zawsze wystarcza — sprawdź, które z nich pełnią funkcję orzeczeń.",
    check: "Ile orzeczeń ma zdanie: „Ola czyta, a Kuba rysuje”?"
  },
  {
    title: "Liczby rzymskie",
    keywords: ["liczby rzymskie", "cyfry rzymskie", "zapis rzymski"],
    aliases: ["liczb rzymskich", "cyfr rzymskich"],
    short: "W zapisie rzymskim używa się znaków I, V, X, L, C, D i M.",
    explanation: "Zwykle mniejszy znak po większym dodajemy, na przykład VI = 6. Gdy mniejszy znak stoi przed większym, odejmujemy go, na przykład IV = 4.",
    example: "XXIV = 10 + 10 + (5 − 1) = 24.",
    related: "Zapis rzymski nie używa cyfry zero.",
    check: "Jaką liczbę oznacza zapis IX?"
  },
  {
    title: "Droga, prędkość i czas",
    keywords: ["droga prędkość czas", "droga predkosc czas", "wzór na prędkość", "wzor na predkosc"],
    aliases: ["drogi i prędkości", "prędkości", "predkosci"],
    short: "Prędkość obliczamy ze wzoru v = s ÷ t, gdzie s to droga, a t to czas.",
    explanation: "Jeśli znamy prędkość i czas, drogę obliczamy ze wzoru s = v × t. Jeśli znamy drogę i prędkość, czas to t = s ÷ v. Jednostki muszą do siebie pasować.",
    example: "Samochód przejechał 120 km w 2 godziny. Jego średnia prędkość wyniosła 120 ÷ 2 = 60 km/h.",
    related: "Prędkość łączy trzy wielkości: drogę, czas i szybkość ruchu.",
    check: "Rowerzysta przejechał 30 km w 2 godziny. Jaka była jego średnia prędkość?"
  },
  {
    title: "Kolejność wykonywania działań",
    keywords: ["kolejność działań", "kolejnosc dzialan", "nawiasy potęgi mnożenie dzielenie"],
    aliases: ["kolejności działań", "kolejnosc obliczen"],
    short: "W wyrażeniach najpierw obliczamy nawiasy, potem potęgi, mnożenie i dzielenie, a na końcu dodawanie i odejmowanie.",
    explanation: "Działania o tym samym pierwszeństwie wykonujemy od lewej do prawej. Mnożenie nie ma pierwszeństwa przed dzieleniem, a dodawanie przed odejmowaniem.",
    example: "W 18 − 2 × 5 najpierw mnożymy: 2 × 5 = 10, więc wynik to 18 − 10 = 8.",
    related: "Nawias może zmienić kolejność, np. (18 − 2) × 5 = 80.",
    check: "Oblicz 20 − 3 × 4."
  },
  {
    title: "Liczby całkowite",
    keywords: ["liczby całkowite", "liczby ujemne", "dodawanie liczb ujemnych"],
    aliases: ["liczbach całkowitych", "liczb ujemnych"],
    short: "Liczby całkowite to liczby naturalne, zero oraz liczby przeciwne do naturalnych, np. −3.",
    explanation: "Na osi liczbowej liczby rosną w prawo. Liczby ujemne leżą na lewo od zera. Liczba przeciwna ma tę samą odległość od zera, ale przeciwny znak.",
    example: "Liczbą przeciwną do 7 jest −7, a do −4 jest 4.",
    related: "Temperaturę poniżej zera i piętra podziemne można opisywać liczbami ujemnymi.",
    check: "Jaka jest liczba przeciwna do −12?"
  },
  {
    title: "Proporcje",
    keywords: ["proporcja", "proporcje", "wielkości wprost proporcjonalne"],
    aliases: ["proporcji", "proporcją"],
    short: "Proporcja to równość dwóch ilorazów, np. a/b = c/d.",
    explanation: "W proporcji można pomnożyć na krzyż: a × d = b × c. Warto sprawdzić, czy jednostki opisują tę samą wielkość.",
    example: "Jeśli 3 zeszyty kosztują 12 zł, to 1 zeszyt kosztuje 4 zł, a 5 zeszytów — 20 zł.",
    related: "Proporcje pomagają skalować przepisy, mapy i ceny.",
    check: "Jeśli 2 kg jabłek kosztują 8 zł, ile kosztuje 5 kg w tej samej cenie za kilogram?"
  },
  {
    title: "Prostopadłościan i objętość",
    keywords: ["objętość prostopadłościanu", "objetosc prostopadloscianu", "prostopadłościan", "prostopadloscian"],
    aliases: ["objętości prostopadłościanu", "objętość sześcianu", "objetosc szescianu"],
    short: "Objętość prostopadłościanu obliczamy ze wzoru V = a × b × c.",
    explanation: "Mnożymy trzy wymiary bryły. Objętość zapisujemy w jednostkach sześciennych, np. cm³. Dla sześcianu V = a³.",
    example: "Pudełko 4 cm × 3 cm × 2 cm ma objętość 24 cm³.",
    related: "Pole powierzchni opisuje ściany bryły, a objętość — miejsce w jej wnętrzu.",
    check: "Oblicz objętość prostopadłościanu o wymiarach 5 cm, 2 cm i 3 cm."
  },
  {
    title: "Układ współrzędnych",
    keywords: ["układ współrzędnych", "uklad wspolrzednych", "oś x oś y", "współrzędne punktu"],
    aliases: ["układzie współrzędnych", "współrzędnych punktu"],
    short: "Punkt w układzie współrzędnych opisujemy parą (x, y). Najpierw podajemy położenie na osi poziomej, potem pionowej.",
    explanation: "Początek układu ma współrzędne (0, 0). Pierwsza współrzędna wskazuje ruch wzdłuż osi x, druga wzdłuż osi y.",
    example: "Punkt (3, 2) leży 3 jednostki w prawo i 2 jednostki w górę od początku.",
    related: "Układ współrzędnych pozwala opisywać położenie punktów i rysować wykresy.",
    check: "W którą stronę od początku leży punkt (−2, 4)?"
  },
  {
    title: "Części zdania",
    keywords: ["części zdania", "czesci zdania", "podmiot orzeczenie przydawka dopełnienie okolicznik"],
    aliases: ["częściach zdania", "podmiot i orzeczenie"],
    short: "Główne części zdania to podmiot i orzeczenie. Inne części, np. przydawka, dopełnienie i okolicznik, rozwijają ich treść.",
    explanation: "Podmiot wskazuje, o kim lub o czym mówimy. Orzeczenie informuje, co podmiot robi lub co się z nim dzieje.",
    example: "W zdaniu „Mały kot śpi na kanapie” wyraz „kot” jest podmiotem, „śpi” orzeczeniem, a „mały” przydawką.",
    related: "Pytania pomagają rozpoznawać części zdania, ale warto sprawdzać ich rolę w całym wypowiedzeniu.",
    check: "W zdaniu „Ola czyta ciekawą książkę” wskaż orzeczenie."
  },
  {
    title: "Przypadki w języku polskim",
    keywords: ["przypadki", "przypadki w języku polskim", "mianownik dopełniacz celownik"],
    aliases: ["przypadków", "odmiana przez przypadki"],
    short: "W języku polskim wyróżniamy siedem przypadków: mianownik, dopełniacz, celownik, biernik, narzędnik, miejscownik i wołacz.",
    explanation: "Przypadek pokazuje między innymi rolę rzeczownika w zdaniu. Rozpoznajemy go pytaniem, np. kto? co? dla kogo? z kim? o czym?",
    example: "„Kot” — kto? co?; „kota” — kogo? czego?; „z kotem” — z kim? z czym?",
    related: "Odmiana przez przypadki nazywa się deklinacją.",
    check: "Na jakie pytanie odpowiada narzędnik w wyrażeniu „z kolegą”?"
  },
  {
    title: "Środki stylistyczne",
    keywords: ["środki stylistyczne", "srodki stylistyczne", "metafora epitet porównanie"],
    aliases: ["środków stylistycznych", "epitet", "metafora", "porównanie"],
    short: "Środki stylistyczne pomagają tworzyć obrazy, podkreślać emocje i nadawać tekstowi brzmienie.",
    explanation: "Epitet określa rzeczownik, porównanie zestawia dwa zjawiska, zwykle za pomocą „jak”, a metafora łączy słowa w znaczeniu przenośnym.",
    example: "„Srebrny głos” to przenośnia, a „lekki jak piórko” to porównanie.",
    related: "Interpretując środek stylistyczny, wyjaśnij, jaki obraz lub efekt tworzy w danym fragmencie.",
    check: "Jak nazywa się środek stylistyczny w wyrażeniu „szybki jak wiatr”?"
  },
  {
    title: "Fotosynteza — równanie i warunki",
    keywords: ["równanie fotosyntezy", "warunki fotosyntezy", "substraty fotosyntezy"],
    aliases: ["równaniu fotosyntezy", "substratów fotosyntezy"],
    short: "W fotosyntezie z wody i dwutlenku węgla, przy udziale światła i chlorofilu, powstaje glukoza i tlen.",
    explanation: "Uproszczony zapis: dwutlenek węgla + woda —(światło, chlorofil)→ glukoza + tlen. Roślina magazynuje część energii światła w glukozie.",
    example: "Liść pobiera CO₂ z powietrza, wodę doprowadzają korzenie, a światło dostarcza energii.",
    related: "Fotosynteza zachodzi w chloroplastach komórek roślin i niektórych innych organizmów.",
    check: "Jakie dwa produkty powstają w fotosyntezie?"
  },
  {
    title: "Siła i jej pomiar",
    keywords: ["siła fizyczna", "pomiar siły", "jednostka siły", "niuton"],
    aliases: ["siły w fizyce", "siłą"],
    short: "Siła może zmienić ruch lub kształt ciała. Jej jednostką w układzie SI jest niuton (N).",
    explanation: "Siłę przedstawiamy strzałką: jej kierunek i zwrot pokazują działanie, a długość może oznaczać wartość według przyjętej skali.",
    example: "Siłomierz pokazuje 2 N, gdy sprężyna rozciąga się zgodnie ze skalą przyrządu.",
    related: "Siły mogą wprawiać ciało w ruch, zatrzymywać je lub zmieniać kierunek ruchu.",
    check: "W jakiej jednostce mierzymy siłę?"
  },
  {
    title: "Masa i ciężar",
    keywords: ["masa i ciężar", "masa a ciężar", "ciężar ciała", "ciezar ciala"],
    aliases: ["masy i ciężaru", "różnica masy i ciężaru"],
    short: "Masa opisuje ilość materii i jest mierzona w kilogramach. Ciężar jest siłą grawitacji działającą na ciało i mierzymy go w niutonach.",
    explanation: "Masa ciała nie zmienia się przy przeniesieniu na inną planetę, ale jego ciężar może być inny, ponieważ zależy od grawitacji.",
    example: "Na Księżycu człowiek ma tę samą masę co na Ziemi, lecz mniejszy ciężar.",
    related: "W codziennej mowie „waga” często oznacza masę, ale w fizyce masa i ciężar to różne wielkości.",
    check: "Czy masa astronauty zmieni się po locie na Księżyc?"
  },
  {
    title: "Mieszaniny jednorodne i niejednorodne",
    keywords: ["mieszanina jednorodna", "mieszanina niejednorodna", "roztwór", "rozdzielanie mieszanin"],
    aliases: ["mieszaniny jednorodnej", "mieszaniny niejednorodnej"],
    short: "W mieszaninie jednorodnej składników nie rozróżniamy gołym okiem, a w niejednorodnej można zauważyć różne składniki lub warstwy.",
    explanation: "Sól rozpuszczona w wodzie tworzy mieszaninę jednorodną. Piasek z wodą jest mieszaniną niejednorodną.",
    example: "Piasek można oddzielić od wody przez sączenie, a sól z roztworu odzyskać przez odparowanie wody.",
    related: "Dobór metody rozdzielania zależy od właściwości składników.",
    check: "Czy piasek zmieszany z wodą tworzy mieszaninę jednorodną?"
  },
  {
    title: "Odczyn kwaśny, obojętny i zasadowy",
    keywords: ["odczyn kwaśny", "odczyn zasadowy", "skala ph", "skala pH"],
    aliases: ["odczynie kwasowym", "odczynu roztworu"],
    short: "Skala pH opisuje odczyn: pH poniżej 7 jest kwaśne, pH równe 7 obojętne, a pH powyżej 7 zasadowe.",
    explanation: "Wartość pH mierzy się wskaźnikami lub pH-metrem. Nie próbujemy substancji laboratoryjnych ani nie dotykamy ich bez polecenia nauczyciela.",
    example: "Roztwór o pH 3 ma odczyn kwaśny, a o pH 9 — zasadowy.",
    related: "Wskaźniki, takie jak papierek uniwersalny, zmieniają barwę zależnie od odczynu.",
    check: "Jaki odczyn ma roztwór o pH 8?"
  },
  {
    title: "Pogoda i klimat",
    keywords: ["pogoda i klimat", "różnica pogody i klimatu", "klimat", "elementy pogody"],
    aliases: ["klimatu", "pogodą"],
    short: "Pogoda to stan atmosfery w danym miejscu i czasie. Klimat opisuje typowe warunki pogodowe obserwowane przez wiele lat.",
    explanation: "Do elementów pogody należą między innymi temperatura, opady, wiatr, ciśnienie i zachmurzenie.",
    example: "Deszcz dziś po południu to pogoda; częste opady w danym regionie przez wiele lat są cechą klimatu.",
    related: "Pojedynczy zimny dzień nie wystarcza, by opisać klimat.",
    check: "Które pojęcie opisuje warunki atmosferyczne z wielu lat?"
  },
  {
    title: "Szerokość i długość geograficzna",
    keywords: ["szerokość geograficzna", "długość geograficzna", "współrzędne geograficzne"],
    aliases: ["szerokości geograficznej", "długości geograficznej"],
    short: "Współrzędne geograficzne określają położenie miejsca na Ziemi za pomocą szerokości i długości geograficznej.",
    explanation: "Szerokość mierzymy od równika na północ lub południe. Długość mierzymy od południka zerowego na wschód lub zachód.",
    example: "Współrzędne zapisujemy zwykle w stopniach, np. 52°N, 21°E.",
    related: "Równoleżniki pomagają odczytywać szerokość, a południki — długość geograficzną.",
    check: "Od jakiej linii liczymy szerokość geograficzną?"
  },
  {
    title: "Ruch obiegowy Ziemi i pory roku",
    keywords: ["ruch obiegowy ziemi", "pory roku", "ziemia wokół słońca", "ruch ziemi wokół słońca"],
    aliases: ["obiegu ziemi", "ruchu obiegowego ziemi"],
    short: "Ziemia obiega Słońce w ciągu około jednego roku, a jej oś jest nachylona względem płaszczyzny orbity.",
    explanation: "Zmiany oświetlenia półkul w ciągu roku powodują pory roku. Gdy na półkuli północnej jest lato, na południowej trwa zima.",
    example: "Pory roku nie wynikają z tego, że Ziemia raz jest dużo bliżej Słońca, a raz dalej.",
    related: "Ruch obiegowy trwa około 365 dni i 6 godzin, stąd lata przestępne.",
    check: "Co wraz z ruchem Ziemi wokół Słońca powoduje pory roku?"
  },
  {
    title: "Konstytucja i trójpodział władzy",
    keywords: ["konstytucja", "trójpodział władzy", "trojpodzial wladzy", "władza ustawodawcza wykonawcza sądownicza"],
    aliases: ["konstytucji", "podział władzy"],
    short: "Konstytucja jest najważniejszym aktem prawnym państwa. Opisuje między innymi ustrój oraz prawa i obowiązki obywateli.",
    explanation: "W Polsce władzę ustawodawczą sprawują parlament, wykonawczą — Prezydent i Rada Ministrów, a sądowniczą — niezależne sądy i trybunały.",
    example: "Sejm i Senat uchwalają ustawy, a sądy rozstrzygają sprawy zgodnie z prawem.",
    related: "Podział władzy ma ograniczać jej skupienie w jednym miejscu.",
    check: "Który rodzaj władzy sprawują sądy?"
  },
  {
    title: "Unia Europejska",
    keywords: ["unia europejska", "państwa unii europejskiej", "instytucje unii europejskiej"],
    aliases: ["unii europejskiej", "w unii europejskiej"],
    short: "Unia Europejska jest związkiem państw europejskich współpracujących w wielu obszarach na podstawie wspólnych traktatów.",
    explanation: "Państwa członkowskie współpracują m.in. w sprawach gospodarki, wspólnych zasad i swobodnego przemieszczania się. Nie wszystkie kraje UE używają euro.",
    example: "Polska należy do Unii Europejskiej od 2004 roku, ale zachowała złotego jako walutę.",
    related: "UE i Europa to różne pojęcia: Europa jest kontynentem, a UE organizacją państw.",
    check: "Czy wszystkie państwa Unii Europejskiej używają euro?"
  },
  {
    title: "Prawa i obowiązki ucznia",
    keywords: ["prawa ucznia", "obowiązki ucznia", "prawa i obowiązki ucznia"],
    aliases: ["praw ucznia", "obowiązków ucznia"],
    short: "Uczeń ma prawa określone między innymi w przepisach i statucie szkoły, a także obowiązki związane z nauką i zasadami wspólnoty szkolnej.",
    explanation: "Szczegóły, takie jak zasady oceniania i usprawiedliwiania nieobecności, zależą od przepisów i statutu konkretnej szkoły.",
    example: "W razie wątpliwości warto sprawdzić statut szkoły i porozmawiać z wychowawcą lub pedagogiem.",
    related: "Koala nie zastępuje aktualnych dokumentów szkoły ani rozmowy z dorosłym.",
    check: "Gdzie sprawdzisz szczegółowe zasady obowiązujące w twojej szkole?"
  },
  {
    title: "Bezpieczne źródła informacji",
    keywords: ["wiarygodne źródła informacji", "weryfikacja informacji", "fake news", "fałszywe informacje"],
    aliases: ["sprawdzanie źródeł", "wiarygodności informacji"],
    short: "Informację warto sprawdzić w kilku niezależnych źródłach, zwracając uwagę na autora, datę, dowody i cel publikacji.",
    explanation: "Oddzielaj fakt od opinii. Sprawdź, czy inne wiarygodne instytucje potwierdzają wiadomość i czy cytat nie został wyrwany z kontekstu.",
    example: "Przed udostępnieniem sensacyjnej wiadomości poszukaj jej w serwisie instytucji lub redakcji, która podaje źródła.",
    related: "Brak autora, daty i źródeł może być powodem do ostrożności, ale sam w sobie nie rozstrzyga, czy coś jest fałszywe.",
    check: "Wymień dwa elementy, które warto sprawdzić przed udostępnieniem wiadomości."
  },
  {
    title: "Największy wspólny dzielnik i najmniejsza wspólna wielokrotność",
    keywords: ["największy wspólny dzielnik", "najmniejsza wspólna wielokrotność", "nwd i nww"],
    aliases: ["NWD", "NWW", "wspólny dzielnik", "wspólna wielokrotność"],
    short: "NWD to największa liczba, która dzieli podane liczby bez reszty. NWW to najmniejsza dodatnia liczba będąca wielokrotnością każdej z nich.",
    explanation: "NWD można znaleźć algorytmem Euklidesa. Dla dwóch dodatnich liczb NWW obliczamy ze wzoru NWW(a,b) = a × b ÷ NWD(a,b).",
    example: "Dla 12 i 18: NWD = 6, a NWW = 12 × 18 ÷ 6 = 36.",
    related: "NWD przydaje się przy skracaniu ułamków, a NWW przy sprowadzaniu ich do wspólnego mianownika.",
    check: "Jaki jest NWD liczb 12 i 18?"
  },
  {
    title: "Rozkład na czynniki pierwsze",
    keywords: ["rozkład na czynniki pierwsze", "rozklad na czynniki pierwsze", "czynniki pierwsze liczby"],
    aliases: ["rozkładu na czynniki pierwsze", "faktoryzacja liczby"],
    short: "Rozkład na czynniki pierwsze zapisuje liczbę jako iloczyn liczb pierwszych.",
    explanation: "Dzielimy liczbę przez najmniejsze liczby pierwsze: 2, 3, 5, 7 i kolejne. Kontynuujemy, aż otrzymamy 1.",
    example: "60 = 2 × 2 × 3 × 5 = 2² × 3 × 5.",
    related: "Jednoznaczny rozkład na czynniki pierwsze pomaga wyznaczać NWD i NWW.",
    check: "Rozłóż 12 na czynniki pierwsze."
  },
  {
    title: "Pierwiastek kwadratowy",
    keywords: ["pierwiastek kwadratowy", "pierwiastki kwadratowe", "pierwiastkowanie", "pierwiastek z liczby"],
    aliases: ["pierwiastka kwadratowego", "pierwiastka z liczby"],
    short: "Pierwiastek kwadratowy z liczby nieujemnej to liczba, której kwadrat daje tę liczbę.",
    explanation: "√a = b oznacza, że b × b = a. Na przykład √49 = 7, ponieważ 7² = 49. W liczbach rzeczywistych nie pierwiastkujemy kwadratowo liczb ujemnych.",
    example: "√64 = 8, bo 8 × 8 = 64.",
    related: "Pierwiastkowanie jest działaniem odwrotnym do podnoszenia do kwadratu.",
    check: "Ile wynosi √81 i jak możesz sprawdzić wynik?"
  },
  {
    title: "Potęgi",
    keywords: ["potęga", "potęgi", "podnoszenie do potęgi", "wykładnik potęgi"],
    aliases: ["potęgi liczby", "potęgowania"],
    short: "Potęga skraca zapis wielokrotnego mnożenia tej samej liczby: aⁿ oznacza n czynników równych a.",
    explanation: "W zapisie aⁿ liczba a jest podstawą, a n wykładnikiem. Na przykład 2⁴ = 2 × 2 × 2 × 2 = 16. Dla a różnego od zera a⁰ = 1.",
    example: "3² = 3 × 3 = 9, a 3³ = 3 × 3 × 3 = 27.",
    related: "Kwadrat liczby ma wykładnik 2, a sześcian — wykładnik 3.",
    check: "Zapisz 5³ jako mnożenie i oblicz wynik."
  },
  {
    title: "Cechy podzielności",
    keywords: ["cechy podzielności", "cechy podzielnosci", "podzielność przez 2 3 5 10"],
    aliases: ["podzielności liczby", "podzielność przez 3"],
    short: "Cechy podzielności pozwalają sprawdzić, czy liczba dzieli się przez inną bez wykonywania dzielenia pisemnego.",
    explanation: "Liczba parzysta dzieli się przez 2. Liczba dzieli się przez 5, gdy kończy się na 0 lub 5, a przez 10 — gdy kończy się na 0. Przez 3 dzieli się, gdy suma jej cyfr dzieli się przez 3.",
    example: "234 dzieli się przez 3, bo 2 + 3 + 4 = 9, a 9 dzieli się przez 3.",
    related: "Cechy podzielności ułatwiają skracanie ułamków i rozkład liczb na czynniki.",
    check: "Czy 735 dzieli się przez 5? Uzasadnij odpowiedź."
  },
  {
    title: "Pole powierzchni prostopadłościanu",
    keywords: ["pole powierzchni prostopadłościanu", "pole powierzchni prostopadloscianu", "pole powierzchni bryły"],
    aliases: ["powierzchni prostopadłościanu", "pole sześciu ścian"],
    short: "Pole powierzchni prostopadłościanu to suma pól jego sześciu ścian. Dla wymiarów a, b i c: P = 2ab + 2ac + 2bc.",
    explanation: "Każdy z trzech różnych prostokątów występuje w dwóch przeciwległych ścianach. Wynik zapisujemy w jednostkach kwadratowych.",
    example: "Dla 2 cm, 3 cm i 4 cm: P = 2×6 + 2×8 + 2×12 = 52 cm².",
    related: "Pole powierzchni opisuje zewnętrzne ściany, a objętość — przestrzeń wewnątrz bryły.",
    check: "Ile par jednakowych ścian ma prostopadłościan?"
  }
];

function addKnowledgeCards(subject, rows) {
  const entries = rows.map(([title, aliasText, short, explanation, example, related, check, answerText, gradeRange]) => {
    const aliases = aliasText ? aliasText.split("|").filter(Boolean) : [];
    const all = answerText.split("&").map(group => group.split("|").filter(Boolean));
    let grades;
    if (gradeRange) {
      const bounds = gradeRange.split("-").map(value => Number(value));
      if (bounds.length === 2 && bounds.every(value => Number.isInteger(value) && value >= 4 && value <= 8)) {
        const [first, last] = bounds;
        grades = Array.from({ length: Math.abs(last - first) + 1 }, (_, index) => first <= last ? first + index : first - index);
      } else {
        grades = bounds.filter(value => Number.isInteger(value) && value >= 4 && value <= 8);
      }
    }
    return {
      title,
      subject,
      ...(grades?.length ? { grades } : {}),
      keywords: [title, ...aliases],
      aliases,
      short,
      explanation,
      example,
      related,
      check,
      teacherAnswer: { all, hint: `Wskazówka: ${explanation}` }
    };
  });
  knowledge.push(...entries);
}

// The same curriculum concept is often asked about in many different ways.
// These prompt patterns and grade labels are normalized before lookup, so the
// factual cards stay unique while more than 100 common class/prompt forms work.
const LEARNING_QUERY_PROMPTS = [
  "co to jest", "czym jest", "co oznacza", "co znaczy", "wyjaśnij", "wytłumacz",
  "opowiedz o", "naucz mnie", "pokaż mi", "daj przykład", "podaj przykład",
  "jak działa", "jak rozumieć", "jak zapamiętać", "jak rozwiązać", "krok po kroku",
  "zrób notatkę", "przygotuj notatkę", "zrób powtórkę", "przepytaj mnie",
  "sprawdź moją wiedzę", "przygotuj quiz", "ułóż plan nauki", "wytłumacz prosto",
  "wytłumacz prostymi słowami", "nie rozumiem", "mam problem z", "pomóż mi z"
];
const GRADE_QUERY_FORMS = [
  ["4", "iv", "czwartej", "czwarta", "czwartoklasisty", "czwartoklasista"],
  ["5", "v", "piątej", "piąta", "piątoklasisty", "piątoklasista"],
  ["6", "vi", "szóstej", "szósta", "szóstoklasisty", "szóstoklasista"],
  ["7", "vii", "siódmej", "siódma", "siódmoklasisty", "siódmoklasista"],
  ["8", "viii", "ósmej", "ósma", "ósmoklasisty", "ósmoklasista"]
];

const KNOWLEDGE_QUERY_SYNONYMS = [
  [/\b(skracanie ulamkow|skrocic ulamek|skroc ulamki|wspolny dzielnik licznika)\b/, "skracanie ułamków"],
  [/\b(rozszerzanie ulamkow|rozszerzyc ulamek|wspolny mianownik)\b/, "rozszerzanie ułamków"],
  [/\b(licznik|mianownik|kreska ulamkowa|ulamki zwykle)\b/, "ułamki zwykłe"],
  [/\b(ulamki po przecinku|liczby z przecinkiem|ulamki dziesietne)\b/, "ułamki dziesiętne"],
  [/\b(ile to procent|procent z liczby|procenty w zadaniu)\b/, "obliczanie procentu liczby"],
  [/\b(x w rownaniu|niewiadoma|jak rozwiazac rownanie|przeniesc na druga strone)\b/, "rozwiązywanie równania przez działania odwrotne"],
  [/\b(wykres liniowy|odczytac wykres liniowy)\b/, "Odczytywanie wykresu liniowego"],
  [/\b(wykres slupkowy)\b/, "wykres słupkowy"],
  [/\b(kat prosty|kat ostry|kat rozwarty)\b/, "kąty ostre, proste i rozwarte"],
  [/\b(rodzaje wyrazow|czesci mowy|jak nazwac rzecz)\b/, "rzeczownik"],
  [/\b(co robi w zdaniu|wyraz oznaczajacy czynnosc)\b/, "czasownik"],
  [/\b(cecha rzeczownika|wyraz opisujacy rzecz)\b/, "przymiotnik"],
  [/\b(osoba opowiadajaca|kto opowiada tekst|ja w narracji)\b/, "narrator pierwszoosobowy"],
  [/\b(przenosnia|metafora)\b/, "środki stylistyczne"],
  [/\b(slowo o przeciwnym znaczeniu|wyraz przeciwny)\b/, "synonim i antonim"],
  [/\b(simple present|czas terazniejszy po angielsku|do does)\b/, "Present Simple"],
  [/\b(present progressive|present continuous|am is are ing)\b/, "Present Continuous"],
  [/\b(past tense|czas przeszly po angielsku|did)\b/, "Past Simple"],
  [/\b(roslina robi pokarm|pokarm rosliny|dwutlenek wegla i slonce)\b/, "fotosynteza"],
  [/\b(krew krazy|serce pompuje|naczynia krwionosne)\b/, "układ krwionośny"],
  [/\b(czasteczki i atomy|z czego zbudowana jest materia)\b/, "atom"],
  [/\b(odparowanie|parowanie wody|wrzenie a parowanie)\b/, "parowanie i wrzenie"],
  [/\b(przemieszczenie|ile kilometrow na godzine|droga predkosc czas)\b/, "droga, prędkość i czas"],
  [/\b(kraje i stolice|kontynenty swiata|oceany swiata)\b/, "kontynenty i oceany"],
  [/\b(zerowy poludnik|greenwich|dlugosc i szerokosc na mapie)\b/, "szerokość i długość geograficzna"],
  [/\b(kiedy bylo|ustawic daty|wiek z daty)\b/, "chronologia historyczna"],
  [/\b(kto uchwala ustawy|izba nizsza|izba wyzsza)\b/, "Sejm i Senat"],
  [/\b(wirus komputerowy|oszustwo na haslo|podejrzany link)\b/, "phishing"],
  [/\b(jak sprawdzic czy strona jest wiarygodna|sprawdzic zrodlo|fake news)\b/, "weryfikowanie informacji online"],
  [/\b(wpisac formule w excelu|komorka arkusza|suma w arkuszu)\b/, "formuła w arkuszu kalkulacyjnym"],
  [/\b(masa na objetosc|masa podzielona przez objetosc|ile masy w objetosci)\b/, "Gęstość"],
  [/\b(sila na powierzchnie|nacisk na powierzchnie|wzor na cisnienie)\b/, "Ciśnienie"],
  [/\b(u rowna sie i razy r|i u przez r|natezenie z napiecia i oporu|prawo oma)\b/, "Prawo Ohma"],
  [/\b(praca rowna sie sila razy droga|sila razy przesuniecie)\b/, "Praca mechaniczna"],
  [/\b(energia podzielona przez czas|tempo wykonywania pracy)\b/, "Moc"],
  [/\b(wypieranie cieczy|dlaczego statek plywa|czy cialo utonie)\b/, "Siła wyporu"],
  [/\b(cieplo przeplywa|jak cieplo sie rozchodzi|przekazywanie ciepla)\b/, "Przewodnictwo cieplne"],
  [/\b(liczba protonow w atomie|numer porzadkowy pierwiastka)\b/, "Liczba atomowa"],
  [/\b(jak czytac układ okresowy|wiersze i kolumny ukladu okresowego)\b/, "Grupa i okres w układzie okresowym"],
  [/\b(zrownowazenie reakcji|ile atomow po obu stronach|bilans reakcji)\b/, "Uzgadnianie równania reakcji"],
  [/\b(kwas czy zasada)\b/, "Kwas a zasada"],
  [/\b(odczyn roztworu|ph roztworu|wartosc ph)\b/, "Jak odczytać skalę pH"],
  [/\b(rozdzielanie piasku i wody|oddzielenie soli od wody)\b/, "Filtracja a destylacja"],
  [/\b(pani twardowska|powrot taty)\b/, "Powrót taty i Pani Twardowska"],
  [/\b(reduta ordona|smierc pulkownika)\b/, "Reduta Ordona i Śmierć Pułkownika"],
  [/\b(switezianka|sonet krymski)\b/, "Świtezianka i wybrany Sonet krymski"],
  [/\b(tren vii|tren viii|fraszki kochanowskiego)\b/, "Tren VII i Tren VIII oraz wybrane fraszki"],
  [/\b(nwd|najwiekszy wspolny dzielnik|wspolny dzielnik dwoch liczb)\b/, "Największy wspólny dzielnik"],
  [/\b(nww|najmniejsza wspolna wielokrotnosc|wspolna wielokrotnosc dwoch liczb)\b/, "Najmniejsza wspólna wielokrotność"],
  [/\b(diagram kolowy|wykres kolowy|procent na wykresie kolowym)\b/, "Odczytywanie diagramu kołowego"],
  [/\b(pole powierzchni prostopadloscianu|ile papieru na pudelko)\b/, "Pole powierzchni prostopadłościanu"],
  [/\b(objetosc graniastoslupa|pole podstawy razy wysokosc)\b/, "Objętość graniastosłupa prostego"],
  [/\b(zdanie pojedyncze czy zlozone|ile orzeczen w zdaniu)\b/, "Zdanie pojedyncze i złożone"],
  [/\b(argument do tezy|jak uzasadnic teze|wstep rozwiniecie zakonczenie rozprawki)\b/, "Rozprawka"],
  [/\b(chrzest polski|mieszko przyjal chrzest|rok 966)\b/, "Chrzest Polski i Mieszko I"],
  [/\b(bitwa warszawska|cud nad wisla|wojna polsko bolszewicka)\b/, "Wojna polsko-bolszewicka i Bitwa Warszawska"],
  [/\b(budowa jadra|protony i neutrony|z czego sklada sie jadro atomu)\b/, "Budowa jądra atomowego"],
  [/\b(wiazanie jonowe czy kowalencyjne|wiazanie kowalencyjne|wiazanie jonowe)\b/, "Wiązanie jonowe i kowalencyjne"],
  [/\b(schemat obwodu|symbole obwodu elektrycznego|narysuj obwod)\b/, "Schemat obwodu elektrycznego"]
];

const KNOWLEDGE_QUERY_FILLERS = new Set([
  "a", "aby", "ale", "albo", "bo", "czy", "co", "czemu", "dlaczego", "do", "dla",
  "gdzie", "ile", "jak", "jaka", "jakie", "jaki", "jest", "jestem", "mi", "mnie",
  "na", "nie", "o", "od", "oraz", "po", "pod", "poniewaz", "prosze", "przez",
  "sie", "to", "w", "we", "z", "za", "ze", "ten", "ta", "te", "temat", "tematu",
  "zagadnienie", "lekcja", "material", "materialy", "nauki", "powtorki", "quiz", "test",
  "plan", "klasa", "klasy", "klasie", "uczen", "uczniowi", "szkoly", "szkolny", "szkolna",
  "wyjasnij", "wytlumacz", "opowiedz", "naucz", "pokaz", "podaj", "daj", "przygotuj",
  "zrob", "uloz", "rozpisz", "sprawdz", "przepytaj", "prosto", "prosciej", "latwiej",
  "krok", "kroki", "przyklad", "przyklady", "notatke", "notatka", "podsumuj", "rozwin"
]);

function expandKnowledgeQuery(question) {
  const normalized = normalize(question);
  const grade = getRequestedSchoolGrade(question);
  const gradeToken = `(?:${[...new Set(GRADE_QUERY_FORMS.flat())].map(normalize).join("|")})`;
  const classToken = "(?:klas(?:a|y|ie|e|ach)?|grade|class)";
  let searchable = normalized.replace(new RegExp(
    `\\b${classToken}\\s*${gradeToken}\\b|\\b${gradeToken}\\s+${classToken}\\b|\\b(?:dla|do|w)\\s+${gradeToken}\\b`,
    "g"
  ), " ");

  for (const prompt of LEARNING_QUERY_PROMPTS) {
    const normalizedPrompt = normalize(prompt);
    searchable = searchable.replace(new RegExp(`\\b${normalizedPrompt.replace(/\s+/g, "\\s+")}\\b`, "g"), " ");
  }
  const tokens = lexicalTokens(searchable).filter(token =>
    !KNOWLEDGE_QUERY_FILLERS.has(token) && !(grade && /^\d+$/.test(token))
  );
  const expanded = [...tokens];
  for (const [pattern, canonical] of KNOWLEDGE_QUERY_SYNONYMS) {
    if (pattern.test(normalized)) expanded.push(...lexicalTokens(canonical));
  }

  // Grade cues are retained as context metadata and removed from the topic text.
  // A subject query can therefore still find its topic card when phrased in any grade.
  return { tokens: [...new Set(expanded)], grade };
}

addKnowledgeCards("Matematyka", [
  ["Wartość pozycyjna cyfry", "miejsce cyfry|wartość cyfry", "Wartość cyfry zależy od jej miejsca w liczbie.", "Od prawej strony rozróżniamy jedności, dziesiątki, setki i kolejne rzędy.", "W liczbie 4 582 cyfra 5 oznacza 500.", "Rozkład pozycyjny pomaga czytać i porównywać duże liczby.", "Jaką wartość ma cyfra 7 w liczbie 3 742?", "setki|700"] ,
  ["Zaokrąglanie liczb naturalnych", "zaokrąglanie|przybliżanie liczb", "Zaokrąglanie zastępuje liczbę prostszą wartością bliską oryginałowi.", "Patrzymy na cyfrę stojącą zaraz za pozycją, do której zaokrąglamy. Cyfra 5–9 podnosi poprzednią o jeden.", "3 468 zaokrąglone do setek to 3 500.", "Przybliżenie ułatwia szybkie szacowanie wyniku.", "Zaokrąglij 2 746 do setek.", "2700|2 700"] ,
  ["Podzielność przez 2", "liczba parzysta", "Liczba jest podzielna przez 2, jeśli jej ostatnia cyfra jest parzysta.", "Ostatnia cyfra musi być jedną z: 0, 2, 4, 6, 8.", "1 348 jest podzielne przez 2, bo kończy się na 8.", "To pierwsza szybka cecha podzielności.", "Czy 572 dzieli się przez 2?", "tak|jest podzielna"] ,
  ["Podzielność przez 3", "cecha podzielności przez 3", "Liczba dzieli się przez 3, gdy suma jej cyfr dzieli się przez 3.", "Dodajemy cyfry liczby i sprawdzamy podzielność otrzymanej sumy.", "516: 5 + 1 + 6 = 12, a 12 dzieli się przez 3.", "Tę samą regułę można powtarzać dla dużej sumy cyfr.", "Czy 741 dzieli się przez 3? Uzasadnij.", "tak&suma cyfr 12|12"],
  ["Podzielność przez 4", "cecha podzielności przez 4", "O podzielności przez 4 decydują dwie ostatnie cyfry.", "Liczba jest podzielna przez 4, jeśli liczba utworzona z jej dwóch ostatnich cyfr dzieli się przez 4.", "1 316 dzieli się przez 4, bo 16 dzieli się przez 4.", "Reguła skraca sprawdzanie podzielności dużych liczb.", "Czy 2 124 dzieli się przez 4?", "tak|24 dzieli się przez 4"] ,
  ["Podzielność przez 5", "cecha podzielności przez 5", "Liczba jest podzielna przez 5, gdy kończy się na 0 albo 5.", "Wystarczy sprawdzić ostatnią cyfrę.", "735 dzieli się przez 5, bo kończy się na 5.", "Łatwo połączyć tę cechę z podzielnością przez 10.", "Czy 1 240 dzieli się przez 5?", "tak|kończy się na 0"] ,
  ["Podzielność przez 9", "cecha podzielności przez 9", "Liczba dzieli się przez 9, gdy suma jej cyfr dzieli się przez 9.", "Dodaj cyfry i sprawdź, czy suma jest wielokrotnością 9.", "729: 7 + 2 + 9 = 18, więc 729 dzieli się przez 9.", "Cecha dla 9 jest podobna do cechy dla 3.", "Czy 4 563 dzieli się przez 9?", "tak&18|suma cyfr 18"] ,
  ["Podzielność przez 10", "cecha podzielności przez 10", "Liczba jest podzielna przez 10, gdy kończy się zerem.", "Wystarczy sprawdzić ostatnią cyfrę liczby.", "6 250 dzieli się przez 10, bo ostatnią cyfrą jest 0.", "Dzięki tej cesze łatwo odczytać wielokrotności dziesięciu.", "Czy 9 315 dzieli się przez 10?", "nie|nie kończy się na 0"] ,
  ["Wielokrotności liczby", "wielokrotność", "Wielokrotności liczby powstają przez mnożenie jej przez liczby naturalne.", "Kolejne wielokrotności otrzymujemy, dodając stale tę samą liczbę.", "Wielokrotności 6 to 6, 12, 18, 24 i kolejne.", "Wielokrotności wykorzystujemy przy szukaniu NWW.", "Podaj trzy dodatnie wielokrotności liczby 7.", "14&21&28|14 21 28"] ,
  ["Dzielniki liczby", "dzielnik|dzielniki", "Dzielnik dzieli daną liczbę bez reszty.", "Sprawdzamy, czy iloraz dwóch liczb naturalnych jest liczbą całkowitą.", "Dzielniki 12 to 1, 2, 3, 4, 6 i 12.", "Dzielniki są podstawą rozkładu na czynniki i skracania ułamków.", "Czy 4 jest dzielnikiem 28?", "tak|28 dzieli się przez 4"] ,
  ["Liczba złożona", "liczby złożone", "Liczba złożona ma więcej niż dwa dodatnie dzielniki.", "Można ją zapisać jako iloczyn mniejszych liczb naturalnych większych od 1.", "12 jest złożona, bo 12 = 3 × 4.", "Liczby złożone można rozkładać na czynniki pierwsze.", "Dlaczego 21 jest liczbą złożoną?", "dzieli się przez 3&dzieli się przez 7|21=3×7"] ,
  ["Skracanie ułamków", "skróć ułamek|skracanie ułamka", "Skracanie ułamka polega na podzieleniu licznika i mianownika przez ten sam dzielnik.", "Warto znaleźć największy wspólny dzielnik, aby od razu otrzymać ułamek nieskracalny.", "18/24 skracamy przez 6 i otrzymujemy 3/4.", "Ułamek po skróceniu ma tę samą wartość.", "Skróć ułamek 15/25.", "3/5"] ,
  ["Rozszerzanie ułamków", "rozszerz ułamek|rozszerzanie ułamka", "Rozszerzając ułamek, mnożymy licznik i mianownik przez tę samą liczbę niezerową.", "Wartość ułamka się nie zmienia, bo mnożymy przez 1 w postaci k/k.", "2/3 rozszerzone przez 4 to 8/12.", "Rozszerzanie przydaje się przy wspólnym mianowniku.", "Rozszerz 3/5 przez 2.", "6/10"] ,
  ["Porównywanie ułamków o wspólnym mianowniku", "porównaj ułamki|ułamki wspólny mianownik", "Przy wspólnym mianowniku większy jest ułamek z większym licznikiem.", "Mianownik pokazuje wielkość części, a licznik — ile tych części bierzemy.", "5/8 > 3/8, bo 5 > 3.", "Ten sposób działa, gdy mianowniki są jednakowe.", "Który ułamek jest większy: 4/9 czy 7/9?", "7/9"] ,
  ["Wspólny mianownik ułamków", "sprowadzanie do wspólnego mianownika|wspólny mianownik", "Wspólny mianownik pozwala dodawać, odejmować i porównywać ułamki.", "Rozszerzamy każdy ułamek tak, by mianowniki stały się równe.", "1/2 i 1/3 można zapisać jako 3/6 i 2/6.", "Często wygodnie użyć najmniejszej wspólnej wielokrotności mianowników.", "Do jakiego mianownika najprościej sprowadzić 1/4 i 1/6?", "12"] ,
  ["Dodawanie liczb mieszanych", "liczby mieszane dodawanie", "Liczby mieszane można dodawać osobno jako całości i części ułamkowe.", "Gdy suma części ułamkowych jest niewłaściwa, zamieniamy ją na całość i resztę.", "1 1/2 + 2 1/2 = 3 + 1 = 4.", "Wynik trzeba zapisać w najprostszej postaci.", "Oblicz 2 1/4 + 1 2/4.", "3 3/4"] ,
  ["Odejmowanie liczb mieszanych", "liczby mieszane odejmowanie", "Liczby mieszane odejmujemy po sprowadzeniu części ułamkowych do wspólnego mianownika.", "Jeśli część ułamkowa pierwszej liczby jest mniejsza, pożyczamy jedną całość.", "3 1/4 − 1 2/4 = 2 5/4 − 1 2/4 = 1 3/4.", "Pożyczona całość ma wartość jednego mianownika, np. 1 = 4/4.", "Oblicz 4 1/3 − 2 2/3.", "1 2/3"] ,
  ["Mnożenie ułamka przez liczbę naturalną", "ułamek razy liczba całkowita", "Mnożąc ułamek przez liczbę naturalną, mnożymy licznik przez tę liczbę.", "Mianownik zostaje bez zmian; przed mnożeniem można skrócić czynniki.", "3 × 2/5 = 6/5 = 1 1/5.", "Ten sam wynik można uzyskać przez dodanie ułamka trzy razy.", "Oblicz 4 × 3/8 i skróć wynik.", "3/2|1 1/2"] ,
  ["Dzielenie ułamka przez liczbę naturalną", "ułamek podzielić przez liczbę", "Dzielenie ułamka przez liczbę naturalną można zamienić na mnożenie przez jej odwrotność.", "Mianownik mnożymy przez dzielnik, a następnie skracamy wynik.", "3/4 : 3 = 3/12 = 1/4.", "Dzielnik musi być różny od zera.", "Oblicz 2/3 : 2.", "1/3"] ,
  ["Ułamek jako część całości", "część całości ułamek", "Licznik mówi, ile równych części wybieramy, a mianownik — na ile części podzielono całość.", "Aby znaleźć część liczby, dzielimy całość przez mianownik i mnożymy przez licznik.", "3/5 z 20 to 20 : 5 × 3 = 12.", "To pojęcie łączy ułamki z procentami i proporcjami.", "Ile wynosi 2/3 z 18?", "12"] ,
  ["Dodawanie liczb dziesiętnych", "dodawanie ułamków dziesiętnych", "Liczby dziesiętne dodajemy, ustawiając przecinki jeden pod drugim.", "W razie potrzeby dopisujemy zera, aby wyrównać liczbę miejsc po przecinku.", "2,35 + 0,8 = 2,35 + 0,80 = 3,15.", "Wyrównane miejsca dziesiętne zapobiegają pomyłkom w rzędach.", "Oblicz 4,7 + 2,36.", "7,06|7.06"] ,
  ["Odejmowanie liczb dziesiętnych", "odejmowanie ułamków dziesiętnych", "Liczby dziesiętne odejmujemy, zapisując przecinki pod sobą.", "Można dopisać zera, aby oba składniki miały tyle samo cyfr po przecinku.", "5,2 − 1,75 = 5,20 − 1,75 = 3,45.", "Po obliczeniu sprawdź wynik dodawaniem.", "Oblicz 8,00 − 3,46.", "4,54|4.54"] ,
  ["Mnożenie liczb dziesiętnych", "mnożenie ułamków dziesiętnych", "Najpierw mnożymy liczby tak, jakby nie miały przecinków.", "W wyniku oddzielamy tyle cyfr po przecinku, ile łącznie miały oba czynniki.", "1,2 × 0,3 = 0,36.", "Szacowanie pomaga sprawdzić położenie przecinka.", "Oblicz 2,5 × 0,4.", "1|1,0|1.0"] ,
  ["Dzielenie liczb dziesiętnych", "dzielenie ułamków dziesiętnych", "Dzielnik można zamienić na liczbę naturalną, przesuwając przecinek w obu liczbach tak samo.", "Mnożymy dzielną i dzielnik przez tę samą potęgę 10.", "4,2 : 0,6 = 42 : 6 = 7.", "Warto oszacować, czy iloraz powinien być większy czy mniejszy od dzielnej.", "Oblicz 3,6 : 0,4.", "9"] ,
  ["Zaokrąglanie liczb dziesiętnych", "zaokrąglanie po przecinku", "Zaokrąglając liczbę dziesiętną, sprawdzamy cyfrę za ostatnim zachowywanym miejscem.", "Cyfry 0–4 pozostawiają cyfrę bez zmian, a 5–9 zwiększają ją o 1.", "4,786 zaokrąglone do setnych to 4,79.", "Przybliżenia powinny zachować potrzebną dokładność.", "Zaokrąglij 8,264 do dziesiątych.", "8,3"] ,
  ["Zamiana ułamka zwykłego na dziesiętny", "ułamek zwykły na dziesiętny", "Ułamek zwykły zamieniamy na dziesiętny przez podzielenie licznika przez mianownik.", "Dzielenie może zakończyć się albo dać rozwinięcie okresowe.", "3/4 = 3 : 4 = 0,75.", "Zamiana ułatwia porównywanie różnych zapisów tej samej liczby.", "Zamień 1/5 na liczbę dziesiętną.", "0,2|0.2"] ,
  ["Zamiana procentu na ułamek", "procent na ułamek zwykły", "Procent oznacza setną część liczby.", "Zapisujemy procent jako ułamek o mianowniku 100 i skracamy.", "35% = 35/100 = 7/20.", "Procenty można porównywać jako ułamki lub liczby dziesiętne.", "Zapisz 40% jako ułamek nieskracalny.", "2/5"] ,
  ["Obniżka procentowa", "rabat procentowy|procentowa obniżka", "Obniżkę obliczamy jako wskazany procent ceny, a potem odejmujemy ją od ceny początkowej.", "Można też pomnożyć cenę przez pozostałą część, np. po obniżce 20% zostaje 80% ceny.", "100 zł obniżone o 20% kosztuje 80 zł.", "Procent obniżki liczymy od pierwotnej ceny.", "Ile kosztuje 60 zł po obniżce o 10%?", "54 zł|54"] ,
  ["Podwyżka procentowa", "procentowa podwyżka|wzrost procentowy", "Podwyżkę obliczamy jako procent wartości początkowej i dodajemy ją do tej wartości.", "Po podwyżce o 15% nowa wartość to 115% wartości początkowej.", "200 zł po wzroście o 10% to 220 zł.", "Zmianę procentową zawsze odnosimy do wartości początkowej.", "Ile wynosi 50 zł po podwyżce o 20%?", "60 zł|60"] ,
  ["Liczba przeciwna", "liczba przeciwna do", "Liczby przeciwne mają tę samą wartość bezwzględną i przeciwne znaki.", "Ich suma wynosi zero.", "Liczbą przeciwną do −7 jest 7.", "Liczba przeciwna pomaga odejmować liczby całkowite.", "Jaka jest liczba przeciwna do 12?", "-12|−12"] ,
  ["Wartość bezwzględna", "moduł liczby", "Wartość bezwzględna to odległość liczby od zera na osi liczbowej.", "Odległość nie jest ujemna, więc moduł liczby i jej przeciwnej jest taki sam.", "|−6| = 6.", "Moduł jest używany przy odległości i różnicy liczb.", "Ile wynosi |−13|?", "13"] ,
  ["Dodawanie liczb całkowitych", "dodawanie liczb ujemnych", "Liczby o jednakowych znakach dodajemy, zachowując ich wspólny znak.", "Przy różnych znakach odejmujemy moduły i zachowujemy znak liczby o większym module.", "−8 + 3 = −5.", "Oś liczbowa pomaga zobaczyć przesunięcie w lewo lub w prawo.", "Oblicz −4 + 9.", "5"] ,
  ["Odejmowanie liczb całkowitych", "odejmowanie liczb ujemnych", "Odejmowanie można zamienić na dodawanie liczby przeciwnej.", "Zapis a − b zmieniamy na a + (−b), a potem dodajemy liczby ze znakami.", "5 − (−3) = 5 + 3 = 8.", "Ta zasada działa dla każdej pary liczb całkowitych.", "Oblicz −2 − 6.", "-8|−8"] ,
  ["Potęga o wykładniku 1", "pierwsza potęga", "Każda liczba podniesiona do pierwszej potęgi jest równa samej sobie.", "Wykładnik 1 oznacza jeden czynnik równy podstawie.", "9¹ = 9.", "To szczególny przypadek definicji potęgi.", "Ile wynosi 14¹?", "14"] ,
  ["Potęga o wykładniku 0", "zerowa potęga", "Każda niezerowa liczba podniesiona do potęgi zerowej jest równa 1.", "Wynika to z reguły dzielenia potęg o tej samej podstawie.", "5⁰ = 1.", "Warunek: podstawa nie może być zerem w standardowej definicji szkolnej.", "Ile wynosi 12⁰?", "1"] ,
  ["Wyrażenie algebraiczne", "wyrażenie z literą|wyrażenie z niewiadomą", "Litera w wyrażeniu algebraicznym może oznaczać liczbę.", "Aby obliczyć wartość wyrażenia, podstawiamy za literę daną wartość i wykonujemy działania.", "Dla x = 4 wyrażenie 2x + 1 ma wartość 9.", "Algebra pozwala opisywać wiele podobnych sytuacji jednym wzorem.", "Oblicz 3a − 2 dla a = 5.", "13"] ,
  ["Redukowanie wyrazów podobnych", "wyrazy podobne", "Wyrazy podobne mają takie same części literowe.", "Dodajemy lub odejmujemy ich współczynniki, pozostawiając tę samą literę.", "3x + 2x − x = 4x.", "Redukcja upraszcza równania i wyrażenia.", "Uprość 7a − 2a + a.", "6a"] ,
  ["Równanie jako równowaga", "znaczenie równania", "Równanie jest prawdziwe, gdy jego lewa i prawa strona mają tę samą wartość.", "Te same działania wykonujemy po obu stronach, aby zachować równość.", "x + 4 = 9, więc x = 5.", "Rozwiązanie równania to wartość niewiadomej spełniająca równość.", "Co trzeba zrobić po obu stronach równania?", "to samo działanie|wykonać to samo działanie"] ,
  ["Oś liczbowa", "oś liczb|liczby na osi", "Oś liczbowa przedstawia liczby jako punkty na prostej.", "Zero jest punktem odniesienia, liczby dodatnie leżą po prawej, a ujemne po lewej.", "Punkt −3 leży trzy jednostki na lewo od zera.", "Oś ułatwia porównywanie, dodawanie i odejmowanie liczb.", "Po której stronie zera leży liczba −5?", "po lewej|lewo"] ,
  ["Kąty wierzchołkowe", "kąty wierzchołkowe równe", "Kąty wierzchołkowe leżą naprzeciw siebie przy przecięciu dwóch prostych.", "Każda para kątów wierzchołkowych ma równe miary.", "Jeśli jeden z kątów ma 62°, kąt wierzchołkowy też ma 62°.", "Pozostałe kąty przy przecięciu prostych są przyległe.", "Ile wynosi kąt wierzchołkowy do kąta 47°?", "47|47 stopni"] ,
  ["Kąty przyległe", "kąty przyległe suma", "Kąty przyległe mają wspólne ramię, a pozostałe ramiona tworzą prostą.", "Suma ich miar wynosi 180°.", "Do kąta 125° przylega kąt 55°.", "Własność pomaga obliczać brakujący kąt.", "Ile wynosi kąt przyległy do 68°?", "112|112 stopni"] ,
  ["Suma kątów w trójkącie", "kąty wewnętrzne trójkąta", "Suma miar kątów wewnętrznych każdego trójkąta wynosi 180°.", "Dwa znane kąty odejmujemy od 180°, aby znaleźć trzeci.", "Dla kątów 50° i 60° trzeci ma 70°.", "Ta reguła pozwala też rozpoznawać trójkąty.", "Dwa kąty mają 35° i 85°. Ile ma trzeci?", "60|60 stopni"] ,
  ["Suma kątów w czworokącie", "kąty czworokąta", "Suma kątów wewnętrznych czworokąta wynosi 360°.", "Czworokąt można podzielić przekątną na dwa trójkąty.", "W prostokącie są cztery kąty po 90°, razem 360°.", "Przekątna pomaga przenieść wiedzę o trójkątach na wielokąty.", "Jaka jest suma kątów wewnętrznych czworokąta?", "360|360 stopni"] ,
  ["Pole równoległoboku", "wzór na pole równoległoboku", "Pole równoległoboku to iloczyn podstawy i wysokości opuszczonej na tę podstawę.", "Wysokość jest prostopadła do podstawy, nie musi być bokiem równoległoboku.", "Dla a = 8 cm i h = 3 cm pole wynosi 24 cm².", "Wzór przypomina pole prostokąta.", "Oblicz pole równoległoboku o podstawie 9 cm i wysokości 4 cm.", "36|36 cm2|36 cm²"] ,
  ["Pole trapezu", "wzór na pole trapezu", "Pole trapezu jest równe połowie sumy długości podstaw pomnożonej przez wysokość.", "Dodajemy równoległe podstawy, mnożymy przez wysokość i dzielimy przez 2.", "Podstawy 5 cm i 9 cm, wysokość 4 cm: pole = 28 cm².", "Wysokość mierzymy prostopadle między podstawami.", "Oblicz pole trapezu o podstawach 6 cm i 10 cm oraz wysokości 3 cm.", "24|24 cm2|24 cm²"] ,
  ["Pole rombu", "wzór na pole rombu", "Pole rombu można obliczyć jako iloczyn boku i wysokości albo połowę iloczynu przekątnych.", "Wzór z przekątnymi to P = e × f ÷ 2.", "Przekątne 6 cm i 8 cm dają pole 24 cm².", "Wybieramy wzór odpowiadający podanym wymiarom.", "Ile wynosi pole rombu o przekątnych 4 cm i 10 cm?", "20|20 cm2|20 cm²"] ,
  ["Promień i średnica koła", "średnica koła promień", "Promień łączy środek koła z jego brzegiem, a średnica przechodzi przez środek.", "Średnica jest dwa razy dłuższa od promienia.", "Dla promienia 4 cm średnica ma 8 cm.", "Promień i średnica występują we wzorach na obwód i pole koła.", "Jaka jest średnica koła o promieniu 7 cm?", "14|14 cm"] ,
  ["Objętość prostopadłościanu", "wzór na objętość prostopadłościanu", "Objętość prostopadłościanu obliczamy, mnożąc trzy wymiary.", "V = a × b × c, a wynik zapisujemy w jednostkach sześciennych.", "2 cm × 3 cm × 4 cm = 24 cm³.", "Objętość opisuje przestrzeń wewnątrz bryły.", "Oblicz objętość bryły o wymiarach 5 cm, 2 cm i 3 cm.", "30|30 cm3|30 cm³"] ,
  ["Siatka prostopadłościanu", "siatka bryły|siatka prostopadłościanu", "Siatka prostopadłościanu pokazuje wszystkie jego ściany po rozłożeniu na płaszczyźnie.", "Ma sześć prostokątnych ścian tworzących trzy pary równych prostokątów.", "Wymiary 2, 3 i 4 cm dają pary ścian 2×3, 2×4 i 3×4.", "Pole siatki jest równe polu powierzchni bryły.", "Ile ścian ma siatka prostopadłościanu?", "6|sześć"] ,
  ["Jednostki pola", "cm kwadratowy|metry kwadratowe", "Pole mierzymy jednostkami kwadratowymi.", "Przy zamianie sąsiednich jednostek długości w polu czynnik wynosi 100, np. 1 m² = 100 dm².", "1 m² = 10 000 cm².", "Nie wolno mylić jednostek długości z jednostkami pola.", "Ile centymetrów kwadratowych ma 1 dm²?", "100|100 cm2|100 cm²"] ,
  ["Jednostki objętości", "cm sześcienny|metry sześcienne", "Objętość mierzymy jednostkami sześciennymi.", "1 dm³ jest równy 1 litrowi, a 1 m³ to 1000 dm³.", "2 dm³ to 2 litry.", "Zależność między dm³ i litrem przydaje się przy pojemności.", "Ile litrów to 3 dm³?", "3|3 litry"] ,
  ["Obliczanie średniej arytmetycznej", "średnia z liczb|średnia arytmetyczna z zestawu", "Średnią arytmetyczną obliczamy, dzieląc sumę wartości przez ich liczbę.", "Każdą wartość dodajemy raz, a sumę dzielimy przez liczbę danych.", "Średnia liczb 2, 4 i 9 wynosi 5.", "Średnia opisuje typowy poziom zestawu danych.", "Oblicz średnią liczb 6, 8 i 10.", "8"] ,
  ["Obliczanie drogi, prędkości i czasu", "wzór s v t|ruch jednostajny", "Drogę obliczamy jako prędkość pomnożoną przez czas.", "Wzory są powiązane: s = v × t, v = s : t, t = s : v.", "Przy 60 km/h przez 2 h pokonamy 120 km.", "Jednostki prędkości, czasu i drogi muszą być zgodne.", "Ile kilometrów przejedzie rowerzysta 12 km/h przez 3 h?", "36|36 km"] ,
  ["Skala liczbowa mapy", "skala mapy odległość", "Skala 1:n mówi, że jedna jednostka na mapie odpowiada n takim samym jednostkom w terenie.", "Najpierw zachowujemy te same jednostki, potem przeliczamy wynik.", "W skali 1:100 000 jeden centymetr odpowiada 1 km.", "Skala pomaga porównywać mapę z rzeczywistością.", "Ile metrów odpowiada 2 cm w skali 1:50 000?", "1000|1000 m|1 km"] ,
  ["Proporcja", "proporcjonalność|wielkości wprost proporcjonalne", "Proporcja to równość dwóch ilorazów.", "W równaniu a/b = c/d można użyć mnożenia na krzyż, jeśli mianowniki są niezerowe.", "2/3 = 8/12.", "Proporcje pomagają przeliczać ceny, przepisy i skale.", "Uzupełnij proporcję 2/5 = x/20.", "8"] ,
  ["Kolejność działań z nawiasami", "nawiasy kolejność działań", "Najpierw wykonujemy działania w nawiasach.", "Potem obliczamy potęgi, mnożenie i dzielenie, a na końcu dodawanie i odejmowanie.", "2 × (3 + 4) = 14.", "Zmiana nawiasów może zmienić wynik działania.", "Oblicz 5 + 2 × 6.", "17"] ,
  ["Układ współrzędnych — ćwiartki", "ćwiartki układu współrzędnych", "Osie dzielą płaszczyznę na cztery ćwiartki.", "W pierwszej ćwiartce x i y są dodatnie; dalej znaki zmieniają się w ustalonej kolejności.", "Punkt (3, 2) leży w pierwszej ćwiartce.", "Znaki współrzędnych pokazują położenie punktu.", "W której ćwiartce leży punkt (−2, 5)?", "drugiej|II"] ,
  ["Oś symetrii figury", "symetria osiowa", "Oś symetrii dzieli figurę na dwie lustrzane części.", "Każdy punkt i jego odbicie leżą w równej odległości od osi.", "Kwadrat ma cztery osie symetrii.", "Symetria pomaga opisywać własności figur i wzorów.", "Ile osi symetrii ma prostokąt, który nie jest kwadratem?", "2|dwie"] ,
  ["Prawdopodobieństwo zdarzenia", "szansa zdarzenia", "W prostych doświadczeniach prawdopodobieństwo to liczba wyników sprzyjających podzielona przez liczbę wszystkich jednakowo możliwych wyników.", "Wynik zapisujemy od 0 do 1 albo jako procent.", "Wyrzucenie orła w uczciwym rzucie monetą ma prawdopodobieństwo 1/2.", "Prawdopodobieństwo 0 oznacza zdarzenie niemożliwe, a 1 — pewne.", "Jakie jest prawdopodobieństwo wyrzucenia szóstki na kostce?", "1/6"] ,
  ["Szacowanie wyniku działania", "szacowanie obliczeń|przybliżony wynik", "Szacowanie pozwala ocenić wynik przed dokładnym obliczeniem.", "Zaokrąglamy liczby do wygodnych wartości i wykonujemy proste działanie.", "198 × 5 jest bliskie 200 × 5 = 1000.", "Szacowanie pomaga wykryć błędy rachunkowe.", "Około ile wynosi 49 × 21?", "1000|około 1000"] ,
  ["Zamiana jednostek długości", "mm cm dm m km", "Jednostki długości w układzie metrycznym zmieniają się dziesięciokrotnie między sąsiednimi jednostkami.", "Przy przejściu do mniejszej jednostki mnożymy, a do większej dzielimy.", "3,5 m = 350 cm.", "Zawsze zapisuj jednostkę przy wyniku.", "Ile centymetrów to 2,4 m?", "240|240 cm"] ,
  ["Zamiana jednostek masy", "mg g kg tona", "Podstawowymi jednostkami w szkolnych zadaniach są gram, kilogram i tona.", "1 kg = 1000 g, a 1 t = 1000 kg.", "2,5 kg = 2500 g.", "Przed dodaniem mas zamień je na tę samą jednostkę.", "Ile gramów to 3 kg?", "3000|3000 g"] ,
  ["Zamiana jednostek czasu", "sekundy minuty godziny", "Jedna minuta ma 60 sekund, a jedna godzina 60 minut.", "Przy zamianie na mniejsze jednostki mnożymy przez 60.", "2,5 h = 150 min.", "Czas w zadaniach o ruchu musi być zgodny z jednostką prędkości.", "Ile minut to 3 godziny?", "180|180 minut"]
]);

addKnowledgeCards("Język polski", [
  ["Rodzaje rzeczownika", "rodzaj gramatyczny rzeczownika", "Rzeczowniki mają rodzaj męski, żeński albo nijaki.", "Rodzaj rozpoznajemy między innymi po formie wyrazu i łączącym się z nim przymiotniku.", "Ten stół, ta ławka, to okno.", "Rodzaj wpływa na zgodę między wyrazami w zdaniu.", "Jaki rodzaj ma rzeczownik „morze”?", "nijaki"],
  ["Liczba rzeczownika", "liczba pojedyncza i mnoga", "Rzeczownik występuje w liczbie pojedynczej lub mnogiej.", "Liczba pojedyncza oznacza zwykle jeden obiekt, a mnoga — więcej niż jeden.", "Uczeń — uczniowie; książka — książki.", "Liczbę rozpoznajemy razem z formą czasownika i określeń.", "W jakiej liczbie jest wyraz „drzewa”?", "mnogiej|liczba mnoga"],
  ["Przypadki rzeczownika", "odmiana przez przypadki", "Rzeczownik odmienia się przez siedem przypadków.", "Przypadek rozpoznajemy pytaniem i funkcją wyrazu w zdaniu.", "Mianownik: kot; dopełniacz: kota; celownik: kotu.", "Odmiana pokazuje związki między wyrazami.", "Ile przypadków ma język polski?", "7|siedem"],
  ["Mianownik", "przypadek mianownika", "Mianownik odpowiada na pytania kto? co? i często wskazuje wykonawcę czynności.", "To podstawowa forma, którą zwykle znajdziemy w słowniku.", "Kto czyta? Uczeń czyta.", "Mianownik jest jedną z form potrzebnych do analizy zdania.", "Na jakie pytania odpowiada mianownik?", "kto&co"],
  ["Dopełniacz", "przypadek dopełniacza", "Dopełniacz odpowiada na pytania kogo? czego?", "Często wskazuje brak, przynależność albo część całości.", "Nie ma kogo? ucznia. Nie ma czego? zeszytu.", "Przyimek może wpływać na wybór dopełniacza.", "Na jakie pytania odpowiada dopełniacz?", "kogo&czego"],
  ["Celownik", "przypadek celownika", "Celownik odpowiada na pytania komu? czemu?", "Często wskazuje odbiorcę lub osobę, której coś dotyczy.", "Podarowałam komu? siostrze.", "Celownik pomaga określić, do kogo kieruje się czynność.", "Na jakie pytania odpowiada celownik?", "komu&czemu"],
  ["Biernik", "przypadek biernika", "Biernik odpowiada na pytania kogo? co?", "Często nazywa obiekt, na który skierowana jest czynność.", "Czytam co? książkę.", "Niektóre przyimki łączą się z biernikiem.", "Na jakie pytania odpowiada biernik?", "kogo&co"],
  ["Narzędnik", "przypadek narzędnika", "Narzędnik odpowiada na pytania z kim? z czym?", "Może wskazywać narzędzie, towarzysza albo sposób wykonania czynności.", "Piszę czym? ołówkiem.", "Często występuje po przyimku „z”.", "Na jakie pytania odpowiada narzędnik?", "z kim&z czym"],
  ["Miejscownik", "przypadek miejscownika", "Miejscownik odpowiada na pytania o kim? o czym?", "Występuje z określonymi przyimkami, na przykład o, w, na.", "Rozmawiam o czym? o książce.", "Przyimka używamy razem z właściwą formą rzeczownika.", "Na jakie pytania odpowiada miejscownik?", "o kim&o czym"],
  ["Wołacz", "przypadek wołacza", "Wołacz służy do bezpośredniego zwracania się do osoby lub rzeczy.", "Często występuje samodzielnie albo po wykrzykniku.", "Mamo, chodź tutaj! Piotrze, posłuchaj.", "W rozmowie wołacz sygnalizuje, do kogo mówimy.", "Który przypadek występuje w zwrocie „Aniu, podejdź”?", "wołacz"],
  ["Stopniowanie przymiotników", "stopień równy wyższy najwyższy", "Przymiotniki można stopniować, gdy nazywają cechę o różnym nasileniu.", "Wyróżniamy stopień równy, wyższy i najwyższy; nie każdy przymiotnik się stopniuje.", "wysoki — wyższy — najwyższy.", "Stopniowanie ułatwia dokładne porównywanie cech.", "Podaj stopień wyższy od „szybki”.", "szybszy"],
  ["Stopniowanie przysłówków", "stopniowanie przysłówka", "Przysłówki utworzone od stopniowalnych przymiotników również mogą się stopniować.", "Tworzymy stopień wyższy i najwyższy, na przykład przez końcówki lub słowo „najbardziej”.", "szybko — szybciej — najszybciej.", "Stopień przysłówka pokazuje, jak silnie wykonujemy czynność.", "Jaki jest stopień wyższy od „ładnie”?", "ładniej"],
  ["Liczebnik główny i porządkowy", "typy liczebników", "Liczebnik główny informuje o liczbie, a porządkowy — o kolejności.", "Liczebniki porządkowe zapisujemy z kropką, gdy używamy cyfr.", "trzy książki; trzecia książka; 3. miejsce.", "Rozpoznanie rodzaju liczebnika pomaga dobrać poprawną formę rzeczownika.", "Czy „piąty” jest liczebnikiem głównym czy porządkowym?", "porządkowym"],
  ["Zaimek osobowy", "zaimki osobowe", "Zaimek osobowy zastępuje nazwę osoby lub grupy.", "Odmienia się przez osoby, liczby, przypadki i niektóre rodzaje.", "ja, ty, on, ona, my, wy, oni.", "Zaimki ograniczają powtarzanie tych samych rzeczowników.", "Jakim zaimkiem zastąpisz „Marek i Ola”?", "oni"],
  ["Zaimek dzierżawczy", "zaimki dzierżawcze", "Zaimek dzierżawczy wskazuje, do kogo coś należy.", "Dopasowuje się do określanego rzeczownika w rodzaju, liczbie i przypadku.", "mój zeszyt, twoja książka, ich dom.", "Pomaga wyrazić przynależność bez powtarzania imienia właściciela.", "Wskaż zaimek dzierżawczy w „Nasza klasa jest duża”.", "nasza"],
  ["Przyimek", "przyimki w zdaniu", "Przyimek łączy się z innym wyrazem i określa relację miejsca, czasu lub sposobu.", "Samodzielnie zwykle nie odpowiada na pytanie; tworzy wyrażenie przyimkowe.", "na stole, przed lekcją, pod drzewem.", "Przyimek może wymagać określonego przypadku.", "Wskaż przyimek w wyrażeniu „za domem”.", "za"],
  ["Spójnik", "spójniki w zdaniu", "Spójnik łączy wyrazy, części zdania lub całe zdania.", "Nie odmienia się; często wskazuje relację, na przykład przeciwieństwo albo przyczynę.", "Ola czyta i notuje. Zostałem w domu, ponieważ padało.", "Spójniki pomagają budować zdania złożone.", "Jaki spójnik łączy zdania w „Chciałem wyjść, ale padało”?", "ale"],
  ["Partykuła", "partykuły", "Partykuła modyfikuje znaczenie wypowiedzi albo wzmacnia jej część.", "Jest nieodmienna i zwykle łączy się z innym wyrazem.", "Czy naprawdę już idziesz? Niech przyjdzie.", "Partykuła może zmienić pytanie w prośbę lub przypuszczenie.", "Wskaż partykułę w „Czy przyjdziesz jutro?”.", "czy"],
  ["Wykrzyknik jako część mowy", "wykrzykniki", "Wykrzyknik wyraża emocję, dźwięk lub nagłą reakcję.", "Zazwyczaj jest nieodmienny i może tworzyć samodzielną wypowiedź.", "Ach! Bum! Hej!", "Wykrzykniki wzmacniają ekspresję tekstu.", "Podaj wykrzyknik wyrażający zdziwienie.", "ach|ojej|wow"],
  ["Czas teraźniejszy", "czas teraźniejszy czasownika", "Czas teraźniejszy opisuje czynność trwającą teraz albo regularnie wykonywaną.", "W języku polskim tworzymy go głównie z czasowników niedokonanych.", "Codziennie czytam książkę.", "Forma czasu pomaga ustalić kolejność wydarzeń.", "W jakim czasie jest czasownik „pisze”?", "teraźniejszym"],
  ["Czas przeszły", "czas przeszły czasownika", "Czas przeszły opisuje czynność, która odbyła się wcześniej.", "Forma uwzględnia rodzaj w liczbie pojedynczej oraz osobę i liczbę.", "Ona przeczytała książkę. Oni wrócili.", "Czas przeszły pomaga budować opowiadanie.", "W jakim czasie jest „zobaczyliśmy”?", "przeszłym"],
  ["Czas przyszły", "czas przyszły czasownika", "Czas przyszły mówi o czynności, która dopiero nastąpi.", "Czasowniki dokonane mają zwykle prostą formę przyszłą, a niedokonane formę złożoną.", "Napiszę list. Będę pisać list.", "Dobór aspektu pokazuje, czy podkreślamy zakończenie czynności.", "W jakim czasie jest „będziemy czytać”?", "przyszłym"],
  ["Czasownik dokonany i niedokonany", "aspekt czasownika", "Aspekt dokonany przedstawia czynność jako zakończoną, a niedokonany jako trwającą lub powtarzaną.", "Pary aspektowe często różnią się przedrostkiem albo rdzeniem.", "czytać — przeczytać; robić — zrobić.", "Aspekt wpływa na formę czasu przyszłego.", "Który czasownik jest dokonany: „pisać” czy „napisać”?", "napisać"],
  ["Osoba i liczba czasownika", "odmiana czasownika przez osoby", "Czasownik odmienia się przez trzy osoby w liczbie pojedynczej i mnogiej.", "Końcówka czasownika pokazuje, kto wykonuje czynność.", "ja czytam; ty czytasz; oni czytają.", "Osoba i liczba pomagają dopasować podmiot do orzeczenia.", "Jaka osoba i liczba występuje w „śpiewamy”?", "pierwsza&mnogiej"],
  ["Tryb oznajmujący", "tryby czasownika", "Tryb oznajmujący informuje o czynności lub stanie.", "Wypowiedzenie w tym trybie może opisywać fakt, przewidywanie albo zwyczaj.", "Uczniowie rozwiązują zadanie.", "Rozpoznanie trybu pomaga określić intencję wypowiedzi.", "W jakim trybie jest zdanie „Ola czyta książkę”?", "oznajmującym"],
  ["Tryb rozkazujący", "rozkaz prośba polecenie", "Tryb rozkazujący wyraża polecenie, prośbę, zakaz lub zachętę.", "Formy zależą od osoby i liczby; często mają wykrzyknik, ale nie zawsze.", "Otwórz zeszyt. Nie spóźnij się.", "Ten tryb bezpośrednio wpływa na odbiorcę.", "Podaj czasownik „usiąść” w trybie rozkazującym do jednej osoby.", "usiądź"]
]);

addKnowledgeCards("Matematyka", [
  ["Dodawanie ułamków o różnych mianownikach", "dodawanie ułamków zwykłych", "Przed dodawaniem ułamków o różnych mianownikach sprowadzamy je do wspólnego mianownika.", "Rozszerz każdy ułamek, dodaj liczniki i zostaw wspólny mianownik.", "1/2 + 1/3 = 3/6 + 2/6 = 5/6.", "Wynik warto skrócić.", "Oblicz 1/4 + 1/2.", "3/4"],
  ["Odejmowanie ułamków o różnych mianownikach", "odejmowanie ułamków zwykłych", "Ułamki o różnych mianownikach odejmujemy po sprowadzeniu ich do wspólnego mianownika.", "Rozszerz ułamki, odejmij liczniki i uprość wynik.", "5/6 − 1/3 = 5/6 − 2/6 = 1/2.", "Mianownik opisuje tę samą wielkość części.", "Oblicz 3/4 − 1/2.", "1/4"],
  ["Mnożenie ułamków zwykłych", "mnożenie ułamków", "Aby pomnożyć ułamki, mnożymy licznik przez licznik i mianownik przez mianownik.", "Możemy skrócić licznik jednego ułamka z mianownikiem drugiego przed mnożeniem.", "2/3 × 3/5 = 6/15 = 2/5.", "Wynik skracamy, jeśli to możliwe.", "Oblicz 2/5 × 5/6.", "1/3"],
  ["Dzielenie ułamków zwykłych", "dzielenie ułamków", "Dzielenie przez ułamek zamieniamy na mnożenie przez ułamek odwrotny.", "Odwracamy drugi ułamek, a pierwszy pozostawiamy bez zmian.", "3/4 : 1/2 = 3/4 × 2/1 = 3/2.", "Nie dzielimy przez zero.", "Oblicz 2/3 : 4/5.", "5/6"],
  ["Ułamek niewłaściwy", "zamiana ułamka niewłaściwego na liczbę mieszaną", "Ułamek niewłaściwy ma licznik nie mniejszy od mianownika.", "Dzielimy licznik przez mianownik; reszta tworzy licznik części ułamkowej.", "11/4 = 2 i 3/4.", "Liczba mieszana i ułamek niewłaściwy mogą oznaczać tę samą wartość.", "Zamień 7/3 na liczbę mieszaną.", "2 i 1/3|2 1/3"],
  ["Liczba mieszana na ułamek niewłaściwy", "zamiana liczby mieszanej na ułamek", "Całość mnożymy przez mianownik i dodajemy licznik.", "Otrzymana suma zostaje licznikiem, a mianownik się nie zmienia.", "2 i 1/3 = 7/3.", "Warto sprawdzić zamianę dzieleniem.", "Zamień 3 i 2/5 na ułamek niewłaściwy.", "17/5"],
  ["Ułamek jako procent", "zamiana ułamka na procent", "Aby zamienić ułamek na procent, mnożymy jego wartość przez 100%.", "Możemy rozszerzyć ułamek do mianownika 100 albo wykonać dzielenie.", "3/4 = 0,75 = 75%.", "Procent oznacza setną część całości.", "Ile procent to 1/5?", "20%|20"],
  ["Obliczanie procentu liczby", "procent z liczby|ile wynosi procent liczby", "Procent liczby obliczamy, mnożąc tę liczbę przez procent zapisany jako ułamek.", "10% to 0,1; 25% to 0,25; 50% to połowa.", "20% z 60 to 0,2 × 60 = 12.", "Najpierw ustal, od jakiej liczby liczysz procent.", "Ile wynosi 25% z 80?", "20"],
  ["Porównywanie procentów i ułamków", "procent ułamek liczba dziesiętna", "Procent, ułamek i liczba dziesiętna mogą być różnymi zapisami tej samej wartości.", "Zamień wartości do wspólnego rodzaju zapisu i dopiero wtedy porównaj.", "1/2 = 0,5 = 50%.", "Wybierz taki zapis, który najłatwiej porównać.", "Zapisz 0,2 jako procent.", "20%"],
  ["Stosunek dwóch wielkości", "stosunek wielkości|proporcja w zadaniu", "Stosunek porównuje dwie wielkości przez dzielenie lub zapis a:b.", "Przed porównaniem zamień wielkości na takie same jednostki.", "2 czerwone kulki i 3 niebieskie dają stosunek 2:3.", "Kolejność liczb w stosunku ma znaczenie.", "Zapisz stosunek 4 do 10 w najprostszej postaci.", "2:5|2 do 5"],
  ["Prędkość średnia", "obliczanie prędkości średniej", "Średnia prędkość to całkowita droga podzielona przez całkowity czas.", "Używamy wzoru v = s : t i sprawdzamy zgodność jednostek.", "120 km w 2 h oznacza średnio 60 km/h.", "Na różnych odcinkach prędkość może się zmieniać.", "Jaka jest średnia prędkość na 90 km w 3 godziny?", "30 km/h|30"],
  ["Droga z wykresu ruchu", "wykres drogi od czasu", "Na wykresie drogi od czasu nachylenie pokazuje, jak szybko zmienia się droga.", "Porównaj przyrost drogi w równych przedziałach czasu.", "Linia pozioma oznacza postój.", "Opis osi i jednostek jest częścią odczytu.", "Co oznacza pozioma linia na wykresie drogi od czasu?", "postój|droga się nie zmienia"],
  ["Własność rozdzielności mnożenia", "rozdzielność mnożenia względem dodawania", "Mnożenie jest rozdzielne względem dodawania i odejmowania.", "Liczbę mnożoną przez sumę możemy pomnożyć przez każdy składnik osobno.", "3 × (10 + 2) = 3 × 10 + 3 × 2 = 36.", "Ta własność ułatwia rachunek w pamięci i przekształcanie wyrażeń.", "Oblicz 4 × (8 + 2) przez rozdzielność.", "40"],
  ["Wyrażenia z nawiasami", "upraszczanie wyrażeń algebraicznych", "Nawiasy usuwamy zgodnie z działaniem stojącym przed nawiasem.", "Plus przed nawiasem nie zmienia znaków, minus zmienia znak każdego składnika.", "2(x + 3) = 2x + 6.", "Najpierw wykonaj mnożenie przez każdy składnik.", "Uprość 3(x + 2).", "3x+6|3x + 6"],
  ["Rozwiązywanie równania przez działania odwrotne", "jak rozwiązać równanie", "Równanie rozwiązujemy, wykonując po obu stronach te same działania.", "Najpierw odwracamy dodawanie lub odejmowanie, potem mnożenie lub dzielenie.", "3x + 2 = 14; odejmujemy 2 i dzielimy przez 3, więc x = 4.", "Podstawienie sprawdza otrzymane rozwiązanie.", "Rozwiąż x − 7 = 5.", "12"],
  ["Sprawdzanie rozwiązania równania", "sprawdzenie równania", "Rozwiązanie równania sprawdzamy przez podstawienie niewiadomej do pierwotnego zapisu.", "Obliczamy obie strony i porównujemy ich wartości.", "Dla x = 4 w równaniu 2x = 8 obie strony są równe 8.", "Sprawdzaj w oryginalnym równaniu, nie w przekształconym.", "Czy x = 3 spełnia równanie x + 4 = 7?", "tak"],
  ["Nierówność", "znaki nierówności", "Nierówność porównuje wyrażenia znakami <, >, ≤ albo ≥.", "Rozwiązaniem może być wiele liczb, a nie tylko jedna.", "x > 2 spełniają 3, 4 i wiele innych liczb.", "Przy mnożeniu przez liczbę ujemną zmieniamy zwrot znaku.", "Podaj całkowitą liczbę spełniającą x < 0.", "-1|−1"],
  ["Rodzaje trójkątów według boków", "trójkąt równoboczny równoramienny różnoboczny", "Trójkąty dzielimy na równoboczne, równoramienne i różnoboczne.", "Porównaj długości boków: trzy równe, dwa równe albo wszystkie różne.", "Trójkąt o bokach 5, 5 i 8 jest równoramienny.", "Klasyfikację według boków łączymy z klasyfikacją według kątów.", "Jak nazywa się trójkąt z trzema równymi bokami?", "równoboczny"],
  ["Rodzaje trójkątów według kątów", "trójkąt ostrokątny prostokątny rozwartokątny", "Trójkąt jest ostrokątny, prostokątny albo rozwartokątny zależnie od największego kąta.", "Kąt prosty ma 90°, rozwarty więcej niż 90°, a ostre są mniejsze niż 90°.", "Trójkąt z kątem 90° jest prostokątny.", "Suma kątów w każdym trójkącie to 180°.", "Jak nazywa się trójkąt z kątem 90°?", "prostokątny"],
  ["Proste równoległe i prostopadłe", "równoległość prostopadłość", "Proste równoległe się nie przecinają, a prostopadłe przecinają się pod kątem prostym.", "W zapisie geometrycznym używamy odpowiednich symboli i oznaczeń.", "Sąsiednie boki prostokąta są prostopadłe.", "Relacje można sprawdzić ekierką lub na rysunku.", "Jaki kąt tworzą proste prostopadłe?", "90 stopni|kąt prosty"],
  ["Kąty ostre, proste i rozwarte", "rodzaje kątów", "Kąt ostry ma mniej niż 90°, prosty 90°, a rozwarty między 90° a 180°.", "Porównaj miarę kąta z kątem prostym.", "120° to kąt rozwarty.", "Kąt półpełny ma 180°, a pełny 360°.", "Jakiego rodzaju jest kąt 45°?", "ostry"],
  ["Obwód wielokąta", "obwód figury wielokąt", "Obwód wielokąta to suma długości wszystkich jego boków.", "Przed dodawaniem doprowadź długości do tych samych jednostek.", "Boki 3, 4, 5 i 6 cm dają obwód 18 cm.", "Obwód mierzymy w jednostkach długości.", "Oblicz obwód trójkąta o bokach 4, 5 i 7 cm.", "16 cm|16"],
  ["Obwód koła", "długość okręgu obwód koła", "Obwód koła obliczamy ze wzoru 2πr albo πd.", "Promień to połowa średnicy; dobierz wzór do podanych danych.", "Dla promienia 3 cm obwód wynosi 6π cm.", "Wynik przybliżony zależy od użytej wartości π.", "Jaki wzór z średnicą oblicza obwód koła?", "pi razy d|πd"],
  ["Wykres słupkowy", "odczytywanie wykresu słupkowego", "Wykres słupkowy porównuje wartości za pomocą słupków.", "Odczytaj tytuł, legendę, jednostkę i wysokość słupka.", "Dłuższy słupek oznacza większą wartość, jeśli skala jest wspólna.", "Nie pomijaj skali osi pionowej.", "Co pokazuje legenda na wykresie?", "co oznaczają kolory lub symbole|znaczenie kolorów"],
  ["Mediana", "wartość środkowa danych", "Mediana to środkowa wartość uporządkowanego zestawu danych.", "Ułóż dane rosnąco; przy parzystej liczbie elementów uśrednij dwa środkowe.", "W zestawie 2, 5, 9 mediana wynosi 5.", "Mediana jest mniej wrażliwa na skrajne wartości niż średnia.", "Podaj medianę liczb 1, 4, 7.", "4"],
  ["Dominanta", "moda statystyka najczęstsza wartość", "Dominanta to wartość występująca w zestawie najczęściej.", "Policz częstość każdej wartości; może być więcej niż jedna dominanta albo żadna.", "W zestawie 2, 2, 3, 5 dominantą jest 2.", "Zestaw może mieć kilka wartości o tej samej największej częstości.", "Jaka jest dominanta zestawu 1, 3, 3, 4?", "3"],
  ["Prawdopodobieństwo niemożliwe i pewne", "zdarzenie pewne niemożliwe", "Zdarzenie niemożliwe ma prawdopodobieństwo 0, a pewne ma prawdopodobieństwo 1.", "Wartości prawdopodobieństwa mieszczą się od 0 do 1.", "Wyrzucenie liczby od 1 do 6 na zwykłej kostce jest pewne.", "Najpierw sprawdź, jakie wyniki są możliwe.", "Jakie prawdopodobieństwo ma zdarzenie niemożliwe?", "0|zero"],
  ["Współrzędne punktu", "odczytywanie współrzędnych punktu", "Współrzędne punktu zapisujemy jako parę (x, y).", "Najpierw odczytujemy położenie poziome, potem pionowe.", "Punkt (−2, 3) leży 2 jednostki w lewo i 3 w górę.", "Kolejność współrzędnych ma znaczenie.", "Która współrzędna jest pierwsza w parze?", "x"],
  ["Jednostki objętości i litry", "litr decymetr sześcienny", "Jeden decymetr sześcienny jest równy jednemu litrowi.", "Przy przeliczaniu pojemności zachowaj równość 1 dm³ = 1 l.", "2,5 dm³ = 2,5 l.", "Mililitr to jedna tysięczna litra.", "Ile litrów to 750 ml?", "0,75 litra|0,75 l"]
]);

addKnowledgeCards("Język polski", [
  ["Pisownia ó i u", "ó u zasady ortograficzne", "Pisownię ó często sprawdzamy przez wymianę na o, e albo a; u zwykle trzeba zapamiętać lub rozpoznać w zakończeniu.", "Szukaj formy pokrewnej, na przykład stół — stoły, albo reguły końcówki.", "W wyrazie miód zapisujemy ó, bo wymienia się na o w miodzie.", "Nie każda pisownia ma prostą wymianę; warto sprawdzić słownik.", "Na jaką literę wymienia się ó w słowie stół — stoły?", "o"],
  ["Pisownia rz i ż", "rz ż zasady ortografii", "Rz często wymienia się na r, a ż między innymi na g, z, s, dz albo h.", "Znajdź wyraz pokrewny i sprawdź, czy pojawia się wskazana spółgłoska.", "Morze — morski pokazuje wymianę rz na r.", "Wyjątki trzeba zapamiętać lub sprawdzić w słowniku.", "Na jaką spółgłoskę wymienia się rz w parze morze — morski?", "r"],
  ["Pisownia ch i h", "ch h ortografia", "Ch może wymieniać się na sz, a h często występuje w zapamiętanych wyrazach i zapożyczeniach.", "Szukaj wyrazu pokrewnego, na przykład mucha — muszka.", "Ch w słowie mucha wymienia się na sz w wyrazie muszka.", "W razie wątpliwości korzystaj ze słownika.", "Na co wymienia się ch w parze mucha — muszka?", "sz"],
  ["Wielka litera w nazwach własnych", "wielka litera nazwy własne", "Imiona, nazwiska, nazwy państw i miast zapisujemy wielką literą.", "Sprawdź, czy wyraz nazywa konkretną osobę, miejsce, instytucję lub święto.", "Wisła, Warszawa i Maria są nazwami własnymi.", "Przymiotniki od nazw państw zwykle piszemy małą literą.", "Jaką literą zapisujemy nazwę miasta Kraków?", "wielką"],
  ["Przecinek w zdaniu złożonym", "przecinek zdanie złożone", "Zdania składowe zdania złożonego oddzielamy przecinkiem zgodnie z ich budową.", "Znajdź orzeczenia i spójniki; przecinek stawiamy między zdaniami składowymi, choć istnieją wyjątki.", "Wiem, że jutro przyjdziesz.", "Nie stawiaj przecinka automatycznie przed każdym i.", "Jaki znak rozdziela zdania składowe w przykładzie Wiem, że przyjdziesz?", "przecinek"],
  ["Przecinek przed ale i lecz", "przecinek przed spójnikiem ale", "Przed spójnikami przeciwstawnymi ale, lecz i jednak zwykle stawiamy przecinek.", "Sprawdź, czy druga część przeciwstawia się pierwszej.", "Chciałem wyjść, ale zaczęło padać.", "Interpunkcja pomaga pokazać relację między myślami.", "Jaki znak stawiamy przed ale w zdaniu złożonym?", "przecinek"],
  ["Cytat i mowa niezależna", "mowa niezależna zapis dialogu", "Mowa niezależna przytacza dokładne słowa mówiącej osoby.", "Używamy cudzysłowu albo zapisu dialogowego z pauzą i właściwej interpunkcji.", "Mama powiedziała: „Wrócę później”.", "Zapis dialogu powinien jasno wskazywać, kto mówi.", "Jak nazywa się przytoczenie dokładnych słów rozmówcy?", "mowa niezależna"],
  ["Mowa zależna", "zamiana mowy niezależnej na zależną", "Mowa zależna przekazuje sens cudzej wypowiedzi bez cytowania jej dokładnych słów.", "Zmieniamy osobę, zaimki i czas odpowiednio do nowego zdania.", "Ola powiedziała, że wróci później.", "Treść pozostaje podobna, ale forma wypowiedzi jest inna.", "Czy w mowie zależnej cytujemy dokładne słowa?", "nie"],
  ["Rodzaje zdań ze względu na cel", "zdanie oznajmujące pytające rozkazujące", "Zdanie oznajmujące informuje, pytające pyta, a rozkazujące wyraża polecenie, prośbę lub zachętę.", "Rozpoznaj intencję wypowiedzi i zwróć uwagę na znak kończący.", "Czytasz książkę? jest pytające.", "Wykrzyknik nie zawsze oznacza rozkaz.", "Jakie zdanie prosi o informację?", "pytające"],
  ["Równoważnik zdania", "równoważnik zdania bez orzeczenia", "Równoważnik zdania przekazuje myśl, ale nie zawiera osobowej formy czasownika.", "Sprawdź, czy w wypowiedzeniu występuje orzeczenie.", "Cisza na korytarzu. to równoważnik zdania.", "W dialogach równoważniki są częste i naturalne.", "Czy wypowiedzenie Cisza! ma orzeczenie?", "nie"],
  ["Zdanie rozwinięte", "zdanie nierozwinięte rozwinięte", "Zdanie rozwinięte zawiera określenia, które dokładniej opisują podmiot lub orzeczenie.", "Znajdź dodatkowe wyrazy odpowiadające na pytania, na przykład jaki?, gdzie? albo kiedy?", "Ptak śpiewa. rozwiniemy jako Mały ptak śpiewa głośno na balkonie.", "Rozwinięcie dodaje szczegóły, ale nie zmienia głównej myśli.", "Które zdanie zawiera więcej określeń: Pies biegnie czy Mały pies szybko biegnie?", "male pies szybko biegnie|mały pies szybko biegnie"],
  ["Bohater pierwszoplanowy", "główny bohater utworu", "Bohater pierwszoplanowy jest najważniejszą postacią utworu i skupia najwięcej uwagi.", "Śledź, czyje decyzje i losy napędzają najważniejsze wydarzenia.", "W wielu baśniach bohaterem pierwszoplanowym jest postać, której dotyczy główna próba.", "Bohater nie zawsze jest narratorem.", "Jak nazywamy najważniejszą postać utworu?", "bohater pierwszoplanowy|główny bohater"],
  ["Narrator pierwszoosobowy", "narracja pierwszoosobowa", "Narrator pierwszoosobowy opowiada, używając form ja lub my.", "Zwróć uwagę na czasowniki i zaimki wskazujące osobę mówiącą.", "Wszedłem do lasu i zobaczyłem ślady.", "Narrator może być bohaterem, ale nie musi opowiadać wszystkiego obiektywnie.", "Jakiej osoby używa narrator mówiący Widziałem to?", "pierwszej"],
  ["Narrator trzecioosobowy", "narracja trzecioosobowa", "Narrator trzecioosobowy opowiada o postaciach, używając form on, ona lub oni.", "Szukaj czasowników takich jak poszedł, zobaczyła, rozmawiali.", "Ania otworzyła drzwi i weszła do pokoju.", "Zakres wiedzy narratora może być ograniczony albo szeroki.", "W jakiej osobie mówi narrator zdania Ania weszła?", "trzeciej"],
  ["Elementy świata przedstawionego", "czas miejsce bohaterowie wydarzenia", "Świat przedstawiony obejmuje czas, miejsce, bohaterów i wydarzenia utworu.", "Wypisz, kiedy i gdzie dzieje się akcja, kto w niej uczestniczy i co się zmienia.", "W opowiadaniu szkolnym miejscem może być klasa, a czasem poranek.", "Te elementy pomagają uporządkować treść lektury.", "Wymień dwa elementy świata przedstawionego.", "czas&miejsce|bohaterowie|wydarzenia"],
  ["Wątek i wydarzenie", "wątek główny poboczny", "Wątek to ciąg powiązanych wydarzeń dotyczących postaci lub sprawy.", "Oddziel wydarzenia główne od pobocznych i ułóż je w kolejności.", "Poszukiwanie skarbu może być głównym wątkiem opowieści.", "W jednym utworze może występować kilka wątków.", "Jak nazywamy ciąg powiązanych wydarzeń?", "wątek"],
  ["Opowiadanie", "jak napisać opowiadanie", "Opowiadanie przedstawia wydarzenia w określonym czasie i miejscu.", "Zaplanuj bohatera, sytuację początkową, problem, rozwinięcie i zakończenie.", "Dialog i opis mogą urozmaicić przebieg wydarzeń.", "Zachowaj logiczną kolejność i czas narracji.", "Jakie trzy elementy warto zaplanować przed napisaniem opowiadania?", "bohater&problem&zakończenie|czas&miejsce&bohater"],
  ["Opis postaci", "charakterystyka bohatera", "Opis postaci przedstawia jej wygląd, cechy, zachowanie i ocenę.", "Popieraj cechy konkretnymi czynami lub wypowiedziami postaci.", "Zamiast napisać odważny, pokaż decyzję bohatera w trudnej sytuacji.", "Wygląd i charakter to różne elementy opisu.", "Czym warto poprzeć ocenę charakteru postaci?", "przykładem|zachowaniem"],
  ["Baśń", "cechy baśni", "Baśń to utwór, w którym świat realistyczny łączy się z magią i niezwykłymi zdarzeniami.", "Wypatruj elementów fantastycznych, powtarzalnych motywów i zwycięstwa dobra.", "Mówiące zwierzę może być bohaterem baśni.", "Baśń często przekazuje pouczenie.", "Czy magia może występować w baśni?", "tak"],
  ["Legenda", "cechy legendy", "Legenda łączy elementy historyczne lub lokalne z opowieścią niezwykłą.", "Sprawdź, czy utwór wyjaśnia pochodzenie miejsca, nazwy albo tradycji.", "Legenda może opowiadać o powstaniu miasta.", "Nie każda legenda jest ścisłym zapisem faktów.", "Co legenda może wyjaśniać?", "pochodzenie miejsca|nazwę lub tradycję"],
  ["Mit", "mitologia cechy mitu", "Mit to dawna opowieść wyjaśniająca świat, wierzenia i losy bogów lub herosów.", "Rozpoznaj postacie nadprzyrodzone oraz próbę wyjaśnienia zjawiska.", "Mit o Demeter opowiada o zmianach pór roku.", "Mity tworzą ważną część kultury starożytnej.", "O czym często opowiada mit?", "bogach|powstaniu świata|wyjaśnieniu zjawiska"],
  ["Bajka", "cechy bajki morał", "Bajka to krótki utwór, który często kończy się morałem.", "Bohaterami mogą być ludzie lub zwierzęta uosabiające ludzkie cechy.", "Lis w bajce może symbolizować spryt.", "Morał podsumowuje naukę płynącą z historii.", "Jak nazywamy pouczenie na końcu bajki?", "morał"],
  ["Powieść", "cechy powieści", "Powieść to dłuższy utwór epicki z rozbudowaną fabułą i bohaterami.", "Śledź główny wątek, wątki poboczne, czas, miejsce i przemiany postaci.", "W powieści wydarzenia mogą obejmować wiele dni lub lat.", "Podział na rozdziały porządkuje lekturę.", "Do jakiego rodzaju literackiego należy powieść?", "epika|epickiego"],
  ["Liryka", "rodzaj literacki liryka", "Liryka wyraża przeżycia i myśli podmiotu mówiącego w utworze.", "Odróżniaj autora od podmiotu lirycznego i szukaj obrazów oraz emocji.", "Wiersz może wyrażać tęsknotę podmiotu lirycznego.", "Podmiot liryczny jest głosem utworu, niekoniecznie autorem.", "Kto wyraża uczucia w utworze lirycznym?", "podmiot liryczny"],
  ["Dramat", "rodzaj literacki dramat", "Dramat jest przeznaczony do wystawienia na scenie i składa się głównie z dialogów oraz monologów.", "Sprawdź podział na akty, sceny i didaskalia.", "Didaskalia opisują zachowanie, miejsce albo sposób wypowiedzi.", "Konflikt często napędza akcję dramatu.", "Jak nazywają się wskazówki autora w dramacie?", "didaskalia"],
  ["Strofa i wers", "zwrotka wers wiersza", "Wers to pojedyncza linijka wiersza, a strofa to grupa wersów oddzielona od kolejnej przerwą.", "Spójrz na układ tekstu i policz linijki w każdej zwrotce.", "Cztery wersy tworzące grupę mogą składać się na czterowersową strofę.", "Podział graficzny może wspierać rytm i znaczenie.", "Jak nazywa się pojedyncza linijka wiersza?", "wers"],
  ["Rym", "rymy w poezji", "Rym to podobne brzmienie końcowych części wyrazów, często na końcu wersów.", "Czytaj zakończenia na głos i porównuj ich dźwięki.", "Słowa kot i płot tworzą rym.", "Rymy mogą porządkować rytm wiersza.", "Czy słowa kot i płot się rymują?", "tak"],
  ["Porównanie", "środek stylistyczny porównanie", "Porównanie zestawia dwie rzeczy za pomocą słów takich jak jak, niczym albo podobny do.", "Wskaż porównywane elementy i cechę wspólną.", "Lekki jak piórko to porównanie.", "Porównanie ułatwia wyobrażenie sobie opisywanej cechy.", "Jakie słowo często wprowadza porównanie?", "jak|niczym"],
  ["Uosobienie", "personifikacja uosobienie", "Uosobienie przypisuje przedmiotom, zjawiskom lub zwierzętom ludzkie cechy i zachowania.", "Sprawdź, czy coś nieludzkiego mówi, myśli albo czuje jak człowiek.", "Wiatr śpiewa za oknem to uosobienie.", "Uosobienie ożywia opis.", "Jaki środek stylistyczny występuje w zdaniu Słońce się uśmiecha?", "uosobienie|personifikacja"],
  ["Wyraz dźwiękonaśladowczy", "onomatopeja", "Wyraz dźwiękonaśladowczy naśladuje dźwięk.", "Przeczytaj wyraz na głos i sprawdź, czy przypomina opisywany odgłos.", "Kap, kap naśladuje kapanie wody.", "Onomatopeje mogą budować nastrój i tempo.", "Podaj przykład wyrazu naśladującego dźwięk.", "kap|bum|miau"],
  ["Teza i argument", "argumentowanie rozprawka", "Teza to stanowisko, a argument uzasadnia, dlaczego warto je przyjąć.", "Do każdego argumentu dobierz przykład lub fakt, który go wspiera.", "Teza Czytanie rozwija wyobraźnię wymaga uzasadnienia przykładem.", "Argument powinien wspierać tezę, a nie tylko powtarzać ją innymi słowami.", "Czym różni się argument od tezy?", "argument uzasadnia stanowisko|teza jest stanowiskiem"],
  ["Synonim i antonim", "wyrazy bliskoznaczne przeciwstawne", "Synonimy mają podobne znaczenie, a antonimy znaczenie przeciwne.", "Dobieraj wyraz pasujący do sensu i stylu zdania.", "Radosny i wesoły są bliskoznaczne; wysoki i niski są przeciwstawne.", "Synonimy nie zawsze można zamieniać w każdym kontekście.", "Podaj antonim słowa wysoki.", "niski"]
]);

addKnowledgeCards("Język angielski", [
  ["Present Simple", "czas teraźniejszy prosty angielski", "Present Simple opisuje rutyny, fakty i czynności powtarzające się.", "W trzeciej osobie liczby pojedynczej zwykle dodajemy do czasownika s.", "She reads every evening.", "Typowe określenia to always, often, usually i every day.", "Jak brzmi czasownik play dla he w Present Simple?", "plays"],
  ["Present Continuous", "czas teraźniejszy ciągły angielski", "Present Continuous opisuje czynność trwającą teraz albo tymczasową sytuację.", "Używamy am, is lub are oraz czasownika z końcówką ing.", "They are studying now.", "To, co dzieje się zwykle, często wymaga Present Simple.", "Uzupełnij: I ___ reading now.", "am"],
  ["Past Simple", "czas przeszły prosty angielski", "Past Simple opisuje zakończone wydarzenie w przeszłości.", "Regularne czasowniki zwykle przyjmują końcówkę ed, a nieregularne trzeba zapamiętać.", "We visited London last year.", "Pytania i przeczenia tworzymy z did oraz formą podstawową.", "Jaka forma visited jest w zdaniu We visited London?", "past simple|czas przeszły"],
  ["Future z will", "will przyszłość angielski", "Will służy między innymi do przewidywań, spontanicznych decyzji i obietnic.", "Po will używamy podstawowej formy czasownika.", "I will help you.", "W przeczeniu używamy will not albo won't.", "Jakiej formy czasownika używamy po will?", "podstawowej|bezokolicznika bez to"],
  ["Going to", "be going to plan zamiar angielski", "Konstrukcja be going to wyraża zamiar lub przewidywanie oparte na widocznych oznakach.", "Odmień be do osoby, dodaj going to i formę podstawową czasownika.", "She is going to study tonight.", "Po be going to czasownik nie przyjmuje końcówki ing.", "Uzupełnij: They ___ going to travel.", "are"],
  ["Present Perfect", "czas present perfect angielski", "Present Perfect łączy przeszłe wydarzenie z jego skutkiem lub doświadczeniem ważnym teraz.", "Tworzymy go z have albo has i trzecią formą czasownika.", "I have lost my keys.", "Nie podajemy zwykle dokładnego zakończonego czasu z Past Simple.", "Jaki czasownik pomocniczy występuje z she?", "has"],
  ["Rzeczownik policzalny i niepoliczalny po angielsku", "countable uncountable nouns", "Rzeczowniki policzalne mają liczbę mnogą, a niepoliczalnych nie liczymy zwykle pojedynczymi sztukami.", "Używamy many i few z policzalnymi, a much i little z niepoliczalnymi.", "Many apples, but much water.", "Some może występować z obiema grupami.", "Z jakim typem rzeczownika używamy many?", "policzalnym|policzalnymi"],
  ["Some i any", "użycie some any angielski", "Some występuje często w zdaniach twierdzących, a any w pytaniach i przeczeniach.", "Zwróć uwagę na typ zdania i to, czy oferujesz lub prosisz o coś.", "There are some books. Are there any books?", "W uprzejmych propozycjach some może pojawić się w pytaniu.", "Które słowo pasuje zwykle do przeczenia: some czy any?", "any"],
  ["Much, many i a lot of", "much many a lot of", "Many łączy się z rzeczownikami policzalnymi, a much z niepoliczalnymi.", "A lot of pasuje do obu rodzajów i często pojawia się w zdaniach twierdzących.", "Many books, much milk, a lot of time.", "Dobierz określenie do rzeczownika.", "Którego słowa użyjemy z books: much czy many?", "many"],
  ["Stopniowanie przymiotników po angielsku", "comparative superlative english", "Przymiotniki stopniujemy, by porównywać cechy.", "Krótkie często przyjmują er i est, a długie more i most.", "small, smaller, the smallest.", "Niektóre formy są nieregularne, na przykład good, better, best.", "Jaki jest stopień wyższy od small?", "smaller"],
  ["Przysłówki częstotliwości po angielsku", "always usually often sometimes never", "Przysłówki częstotliwości mówią, jak często coś się dzieje.", "Zwykle stoją przed czasownikiem głównym, ale po czasowniku be.", "I often read. She is always kind.", "Always oznacza zawsze, a never nigdy.", "Co oznacza usually?", "zwykle|najczęściej"],
  ["Przyimki miejsca po angielsku", "in on under next to", "Przyimki miejsca opisują położenie.", "In oznacza wewnątrz, on na powierzchni, a under pod czymś.", "The book is on the desk.", "Niektóre przyimki tworzą utrwalone połączenia.", "Jak przetłumaczysz under?", "pod"],
  ["Przyimki czasu in on at", "in on at czas angielski", "At łączy się z godzinami, on z dniami i datami, a in z miesiącami, latami i dłuższymi okresami.", "Ustal, czy podajesz dokładną godzinę, dzień czy dłuższy przedział.", "At six, on Monday, in July.", "Są wyjątki, takie jak at night.", "Którego przyimka użyjemy przed Monday?", "on"],
  ["Zaimki dopełnienia po angielsku", "me him her us them object pronouns", "Zaimki dopełnienia występują po czasowniku lub przyimku.", "Używamy form me, you, him, her, it, us i them.", "She called me.", "Nie myl ich z zaimkami podmiotu.", "Jaki zaimek dopełnienia zastępuje he?", "him"],
  ["Dopełniacz saksoński", "s possessive apostrophe english", "Dopełniacz saksoński z apostrofem pokazuje przynależność.", "Dodaj apostrof i s do pojedynczego właściciela; dla regularnej liczby mnogiej często sam apostrof.", "Tom's book; my parents' car.", "Dla rzeczy często używamy konstrukcji with of.", "Co oznacza zapis Anna's bag?", "torba Anny|należy do Anny"],
  ["Czasownik modalny can", "can umiejętność pozwolenie", "Can wyraża umiejętność, możliwość albo prośbę o pozwolenie.", "Po can używamy podstawowej formy czasownika bez to.", "He can swim.", "W pytaniu can stawiamy przed podmiotem.", "Jakiej formy czasownika używamy po can?", "podstawowej|bez to"],
  ["Have to i must", "obowiązek must have to", "Must i have to wyrażają obowiązek, ale zaprzeczenia mają różne znaczenie.", "Mustn't oznacza zakaz, a don't have to brak konieczności.", "You mustn't park here. You don't have to come early.", "Rozróżnienie przeczeń jest ważne dla sensu polecenia.", "Co znaczy mustn't: brak obowiązku czy zakaz?", "zakaz"],
  ["Tryb rozkazujący po angielsku", "imperative english commands", "Tryb rozkazujący tworzymy zwykle z podstawowej formy czasownika.", "Przeczenie tworzymy przez don't przed czasownikiem.", "Open your book. Don't run.", "Please łagodzi prośbę.", "Jak utworzyć przeczenie w trybie rozkazującym?", "dont przed czasownikiem|don't przed czasownikiem"],
  ["Pytania z do i does", "do does pytania present simple", "W Present Simple pytania z większością czasowników zaczynamy od do albo does.", "Does używamy dla he, she, it; po does czasownik wraca do formy podstawowej.", "Does she like music?", "W pytaniu nie dodajemy s do czasownika po does.", "Którego operatora używamy z he: do czy does?", "does"],
  ["Pytania z did", "did pytania past simple", "Pytania w Past Simple tworzymy operatorem did i podstawową formą czasownika.", "Did pozostaje niezmienne dla osób; czasownik główny nie przyjmuje formy przeszłej.", "Did they go home?", "W zdaniu twierdzącym użyj formy przeszłej bez did.", "Jaką formę czasownika stawiamy po did?", "podstawową"],
  ["Przedimek a i an", "a an angielski przedimek", "A i an używamy przed pojedynczym rzeczownikiem policzalnym, gdy mówimy o czymś niesprecyzowanym.", "An stoi przed dźwiękiem samogłoskowym, a a przed dźwiękiem spółgłoskowym.", "an apple, a book, an hour.", "Liczy się wymowa, nie sama litera.", "Który przedimek pasuje przed apple?", "an"],
  ["Przedimek the", "użycie the angielski", "The wskazuje rzecz znaną rozmówcom lub konkretną.", "Użyj the, gdy z kontekstu wiadomo, o którym obiekcie mowa.", "I saw a dog. The dog was small.", "Nie każdy rzeczownik wymaga przedimka.", "Czy the wskazuje zwykle rzecz konkretną czy dowolną?", "konkretną"],
  ["Liczba mnoga rzeczowników angielskich", "plural nouns english", "Liczbę mnogą tworzymy najczęściej przez dodanie s albo es.", "Po niektórych końcówkach używamy es; część rzeczowników jest nieregularna.", "book — books; box — boxes; child — children.", "Sprawdź formę nieregularną, gdy reguła nie pasuje.", "Jaka jest liczba mnoga od child?", "children"],
  ["There is i there are", "there is there are angielski", "There is wprowadza rzeczownik w liczbie pojedynczej, a there are w mnogiej.", "Dopasuj czasownik do liczby rzeczownika.", "There is a chair. There are two chairs.", "Pytanie tworzymy przez inwersję is there albo are there.", "Która forma pasuje do two books?", "there are"],
  ["Kolejność przymiotników w angielskim", "adjective order english", "Gdy przed rzeczownikiem występuje kilka przymiotników, zwykle mają ustaloną kolejność.", "Najpierw często podajemy opinię, potem rozmiar, wiek, kolor i materiał.", "a beautiful small old red box.", "W praktyce najczęściej wystarczą dwa przymiotniki.", "Co zwykle podajemy wcześniej: opinię czy materiał?", "opinię"],
  ["Fałszywi przyjaciele polsko-angielscy", "false friends english polish", "Fałszywi przyjaciele przypominają polskie słowa, ale mają inne znaczenie.", "Sprawdź znaczenie w kontekście zamiast zgadywać po podobnym brzmieniu.", "Actually znaczy właściwie, a nie aktualnie.", "Kontekst i słownik pomagają uniknąć błędnego tłumaczenia.", "Co zwykle znaczy actually?", "właściwie|tak naprawdę"]
]);

addKnowledgeCards("Biologia i przyroda", [
  ["Jądro komórkowe", "jądro komórki", "Jądro komórkowe przechowuje DNA i pomaga kierować pracą komórki.", "Jądro jest otoczone błoną i zawiera materiał genetyczny.", "Komórka skóry człowieka ma jądro z DNA.", "Nie wszystkie komórki dojrzałe zachowują jądro.", "Jaką ważną cząsteczkę przechowuje jądro?", "dna"],
  ["Błona komórkowa", "membrana komórki", "Błona komórkowa oddziela wnętrze komórki od otoczenia i reguluje transport substancji.", "Niektóre substancje przechodzą łatwo, a inne wymagają mechanizmów transportu.", "Woda i wybrane cząsteczki mogą przechodzić przez błonę.", "Błona chroni komórkę i utrzymuje jej środowisko.", "Co reguluje przechodzenie substancji do komórki?", "blona komorkowa"],
  ["Cytoplazma", "cytoplazma komórki", "Cytoplazma wypełnia komórkę i jest środowiskiem wielu reakcji.", "Zawiera wodę, rozpuszczone substancje i struktury komórkowe.", "W cytoplazmie znajdują się między innymi mitochondria.", "Nie utożsamiaj cytoplazmy z jądrem.", "Gdzie w komórce zachodzi wiele reakcji?", "cytoplazma"],
  ["Mitochondrium", "mitochondria funkcja", "Mitochondria uczestniczą w uwalnianiu energii z substancji odżywczych podczas oddychania komórkowego.", "Ich liczba zależy od zapotrzebowania komórki na energię.", "Komórki mięśniowe mają dużo mitochondriów.", "Energia jest potrzebna do pracy komórki.", "Jaką rolę pełnią mitochondria?", "uwalniają energię|oddychanie komórkowe"],
  ["Tkanka, narząd i układ narządów", "organizacja ciała tkanka narząd", "Podobne komórki tworzą tkanki, tkanki budują narządy, a narządy współpracują w układach.", "To kolejne poziomy organizacji ciała wielokomórkowego.", "Tkanka mięśniowa współtworzy serce, które należy do układu krwionośnego.", "Komórka, tkanka, narząd, układ i organizm tworzą hierarchię.", "Co jest wyższym poziomem organizacji: tkanka czy narząd?", "narząd"],
  ["Korzeń rośliny", "funkcje korzenia", "Korzeń umocowuje roślinę i pobiera z gleby wodę oraz sole mineralne.", "Włośniki zwiększają powierzchnię pobierania.", "Marchew magazynuje substancje zapasowe w korzeniu.", "Korzeń może także gromadzić zapasy.", "Jaką substancję korzeń pobiera z gleby?", "wodę|woda"],
  ["Łodyga rośliny", "funkcje łodygi", "Łodyga podtrzymuje liście i kwiaty oraz przewodzi wodę i substancje odżywcze.", "Wiązki przewodzące łączą różne części rośliny.", "Pień jest zdrewniałą łodygą drzewa.", "Łodygi mogą rosnąć nad ziemią albo pod nią.", "Wymień jedną funkcję łodygi.", "podtrzymuje liście|przewodzi wodę"],
  ["Liść i wymiana gazowa", "funkcje liścia aparaty szparkowe", "Liść prowadzi fotosyntezę i wymianę gazową z otoczeniem.", "Aparaty szparkowe umożliwiają wymianę gazów i regulują utratę wody.", "Dwutlenek węgla może wnikać do liścia przez aparaty szparkowe.", "Budowa liścia jest dostosowana do pochłaniania światła.", "Jak nazywają się otworki regulujące wymianę gazową liścia?", "aparaty szparkowe"],
  ["Kwiat i zapylanie", "części kwiatu zapylanie", "Kwiat jest organem rozmnażania wielu roślin; zapylenie przenosi pyłek na znamię słupka.", "Pyłek może przenosić wiatr albo zwierzęta, na przykład owady.", "Pszczoła odwiedza kwiat i może przenieść pyłek.", "Zapylanie poprzedza powstanie nasion u roślin kwiatowych.", "Jak nazywa się przeniesienie pyłku na znamię słupka?", "zapylenie"],
  ["Nasiono i kiełkowanie", "warunki kiełkowania nasion", "Nasiono zawiera zarodek rośliny i zapas substancji odżywczych.", "Do kiełkowania zwykle potrzebne są woda, tlen i odpowiednia temperatura.", "Fasola zaczyna kiełkować po namoczeniu w ciepłym, przewiewnym miejscu.", "Światło nie jest warunkiem kiełkowania wszystkich nasion.", "Podaj dwa warunki potrzebne do kiełkowania.", "woda&tlen|odpowiednia temperatura"],
  ["Zapylanie i zapłodnienie roślin", "różnica zapylenie zapłodnienie", "Zapylenie przenosi pyłek na znamię słupka, a zapłodnienie łączy komórki rozrodcze.", "To dwa różne etapy rozmnażania roślin kwiatowych.", "Po zapłodnieniu zalążek może rozwinąć się w nasiono.", "Nie używaj tych słów zamiennie.", "Który proces polega na przeniesieniu pyłku?", "zapylenie"],
  ["Kręgowce i bezkręgowce", "zwierzęta kręgowce bezkręgowce", "Kręgowce mają kręgosłup, a bezkręgowce go nie mają.", "To podstawowy podział zwierząt według budowy szkieletu osiowego.", "Pies jest kręgowcem, a ślimak bezkręgowcem.", "Bezkręgowce stanowią bardzo zróżnicowaną grupę.", "Czy dżdżownica jest kręgowcem?", "nie"],
  ["Ssaki", "cechy ssaków", "Ssaki karmią młode mlekiem i zwykle mają ciało pokryte włosami.", "Większość ssaków jest stałocieplna i oddycha płucami.", "Nietoperz jest ssakiem, choć lata.", "Nie każdy ssak rodzi żywe młode.", "Czym samice ssaków karmią młode?", "mlekiem"],
  ["Ptaki", "cechy ptaków pióra", "Ciało ptaków pokrywają pióra, a ich przednie kończyny przekształciły się w skrzydła.", "Ptaki oddychają płucami i składają jaja.", "Pingwin jest ptakiem, choć nie lata.", "Nie każdy ptak potrafi latać.", "Czym pokryte jest ciało ptaków?", "piórami"],
  ["Ryby", "cechy ryb skrzela łuski", "Ryby żyją w wodzie, oddychają skrzelami i poruszają się dzięki płetwom.", "Większość ryb jest zmiennocieplna i ma ciało pokryte łuskami.", "Karp pobiera tlen rozpuszczony w wodzie przez skrzela.", "Niektóre gatunki różnią się od typowego schematu.", "Jak ryby pobierają tlen z wody?", "skrzelami"],
  ["Płazy", "cechy płazów rozwój", "Płazy zwykle przechodzą rozwój z larwy wodnej do postaci dorosłej.", "Ich cienka skóra może uczestniczyć w wymianie gazowej.", "Kijanka żaby żyje w wodzie, a dorosła żaba może żyć także na lądzie.", "Rozmnażanie wielu płazów zależy od wody.", "Jak nazywa się larwa żaby?", "kijanka"],
  ["Gady", "cechy gadów skóra jaja", "Gady mają suchą skórę pokrytą łuskami lub tarczkami i oddychają płucami.", "Są zmiennocieplne, a wiele gatunków składa jaja na lądzie.", "Jaszczurka jest gadem.", "Nie wszystkie gady rozmnażają się przez składanie jaj.", "Czy gady oddychają płucami?", "tak"],
  ["Bezkręgowce stawonogi", "stawonogi owady pajęczaki skorupiaki", "Stawonogi mają członowane odnóża i zewnętrzny szkielet.", "Do stawonogów należą między innymi owady, pajęczaki i skorupiaki.", "Pająk ma cztery pary odnóży, a owad trzy pary.", "Nie każdy stawonóg jest owadem.", "Ile par odnóży ma typowy dorosły owad?", "3|trzy"],
  ["Grzyby", "cechy grzybów", "Grzyby są odrębną grupą organizmów i nie przeprowadzają fotosyntezy.", "Pobierają gotowe substancje organiczne, często rozkładając martwe szczątki.", "Drożdże i borowik należą do grzybów.", "Nie wszystkie grzyby tworzą widoczne owocniki.", "Czy grzyby prowadzą fotosyntezę?", "nie"],
  ["Bakterie", "bakterie organizmy jednokomórkowe", "Bakterie to mikroskopijne organizmy jednokomórkowe bez jądra komórkowego.", "Mogą żyć w różnych środowiskach; część pomaga, a część wywołuje choroby.", "Bakterie jelitowe pomagają w trawieniu.", "Antybiotyki działają na wybrane bakterie, nie na wirusy.", "Czy bakteria ma jądro komórkowe?", "nie"],
  ["Wirusy", "wirus a bakteria", "Wirusy namnażają się tylko wewnątrz komórek gospodarza i nie są komórkami.", "Wirus składa się z materiału genetycznego i otoczki białkowej.", "Wirus grypy wykorzystuje komórki gospodarza do namnażania.", "Antybiotyki nie leczą zakażeń wirusowych.", "Czy wirusy mają budowę komórkową?", "nie"],
  ["Odporność i szczepienia", "układ odpornościowy szczepionki", "Układ odpornościowy rozpoznaje zagrożenia i pomaga organizmowi zwalczać drobnoustroje.", "Szczepienie uczy układ odpornościowy rozpoznawania wybranego zagrożenia.", "Po szczepieniu organizm może szybciej zareagować na określony patogen.", "Szczepienia chronią osobę i mogą ograniczać rozprzestrzenianie chorób.", "Jaką rolę pełni szczepienie dla układu odpornościowego?", "uczy rozpoznawać zagrożenie|wspiera odporność"],
  ["Tętno i krążenie", "tętno puls", "Tętno to wyczuwalna fala ciśnienia krwi wywołana pracą serca.", "Mierzymy je przez określony czas i zapisujemy liczbę uderzeń na minutę.", "Po biegu tętno zwykle wzrasta, bo mięśnie potrzebują więcej tlenu.", "Tętno spoczynkowe i po wysiłku porównuj w podobnych warunkach.", "W jakiej jednostce najczęściej zapisujemy tętno?", "uderzenia na minutę|na minutę"],
  ["Mięśnie szkieletowe", "mięśnie ruch", "Mięśnie szkieletowe kurczą się i rozluźniają, poruszając kościami.", "Często współpracują parami: jeden mięsień zgina staw, a drugi go prostuje.", "Zginacz i prostownik łokcia działają przeciwnie.", "Ruch wymaga współpracy mięśni, kości i układu nerwowego.", "Co poruszają mięśnie szkieletowe?", "kości"],
  ["Szkielet i stawy", "funkcje kości stawy", "Szkielet podpiera ciało, chroni narządy i współpracuje z mięśniami.", "Stawy łączą kości w sposób umożliwiający ruch.", "Czaszka chroni mózg, a staw kolanowy umożliwia zginanie nogi.", "Niektóre połączenia kości są nieruchome.", "Jak nazywa się ruchome połączenie kości?", "staw"],
  ["Zdrowe odżywianie", "składniki odżywcze dieta", "Organizm potrzebuje zróżnicowanego pożywienia, wody i energii.", "Dieta powinna uwzględniać warzywa, owoce, źródła białka i produktów zbożowych.", "Woda wspiera transport substancji i regulację temperatury.", "Nie istnieje jeden jadłospis idealny dla każdej osoby.", "Jaki napój jest podstawowym źródłem nawodnienia?", "woda"],
  ["Oddychanie tlenowe i beztlenowe", "oddychanie komórkowe tlenowe beztlenowe", "Oddychanie tlenowe uwalnia energię z udziałem tlenu, a beztlenowe bez jego użycia.", "Różne organizmy i warunki prowadzą do różnych produktów oddychania.", "Drożdże mogą przeprowadzać fermentację alkoholową bez tlenu.", "Oba procesy dostarczają komórkom energii.", "Czy oddychanie beztlenowe wymaga tlenu?", "nie"]
]);

addKnowledgeCards("Fizyka", [
  ["Ciśnienie", "wzór na ciśnienie", "Ciśnienie to siła nacisku przypadająca na jednostkę powierzchni.", "Wzór p = F : S pokazuje, że ta sama siła daje większe ciśnienie na mniejszej powierzchni.", "Ostry nóż łatwiej tnie, bo nacisk skupia się na małej powierzchni.", "W układzie SI ciśnienie mierzymy w paskalach.", "Co stanie się z ciśnieniem, gdy ta sama siła działa na mniejszą powierzchnię?", "wzrośnie"],
  ["Gęstość", "obliczanie gęstości masa objętość", "Gęstość określa masę przypadającą na jednostkę objętości.", "Obliczamy ją ze wzoru d = m : V.", "1 kg w 1 litrze ma gęstość 1 kg/l.", "Porównywanie gęstości wymaga zgodnych jednostek.", "Jak obliczamy gęstość?", "masa podzielona przez objętość|m:v"],
  ["Praca mechaniczna", "wzór na pracę fizyka", "Praca mechaniczna jest wykonywana, gdy siła powoduje przesunięcie.", "Dla stałej siły zgodnej z ruchem W = F × s.", "Siła 10 N przesuwająca przedmiot o 2 m wykonuje 20 J pracy.", "Jednostką pracy jest dżul.", "Jaka jest jednostka pracy?", "dżul|j"],
  ["Moc", "wzór na moc fizyka", "Moc mówi, jak szybko wykonywana jest praca albo przekazywana energia.", "Obliczamy ją jako pracę podzieloną przez czas.", "100 J wykonane w 10 s oznacza moc 10 W.", "Jednostką mocy jest wat.", "Jak nazywa się jednostka mocy?", "wat|w"],
  ["Energia potencjalna grawitacji", "energia położenia", "Energia potencjalna grawitacji zależy od położenia ciała w polu grawitacyjnym.", "W pobliżu Ziemi rośnie wraz z masą i wysokością.", "Książka na wysokiej półce ma więcej energii potencjalnej niż ta sama książka na podłodze.", "Może zamieniać się w energię kinetyczną.", "Która książka ma większą energię potencjalną: na półce czy na podłodze?", "na półce"],
  ["Przemiany energii", "zamiana energii", "Energia może zmieniać formę, na przykład potencjalna w kinetyczną.", "Wskazuj źródło energii, jej przemianę i skutek.", "Spadająca piłka zamienia energię położenia w energię ruchu.", "W rzeczywistych procesach część energii rozprasza się jako ciepło.", "W jaką energię zamienia się energia położenia spadającej piłki?", "kinetyczną"],
  ["Przewodnictwo cieplne", "przewodnik izolator ciepła", "Ciepło przepływa od cieplejszego ciała do chłodniejszego.", "Metale są zwykle dobrymi przewodnikami, a drewno i powietrze izolatorami.", "Metalowa łyżka nagrzewa się w gorącej herbacie.", "Izolator spowalnia przepływ energii cieplnej.", "Czy metal jest zwykle dobrym przewodnikiem ciepła?", "tak"],
  ["Konwekcja", "unoszenie ciepła konwekcja", "Konwekcja przenosi ciepło wraz z ruchem cieczy lub gazu.", "Ogrzany płyn zwykle staje się mniej gęsty i unosi się.", "Ciepłe powietrze nad grzejnikiem wznosi się.", "Konwekcja zachodzi w płynach, nie w ciałach stałych.", "W jakich substancjach zachodzi konwekcja?", "cieczach|gazach|płynach"],
  ["Promieniowanie cieplne", "przekazywanie ciepła promieniowanie", "Promieniowanie przenosi energię falami elektromagnetycznymi i nie wymaga ośrodka materialnego.", "Energia Słońca dociera do Ziemi przez przestrzeń kosmiczną.", "Czujemy ciepło ogniska nawet bez dotykania płomienia.", "Promieniowanie może przechodzić przez próżnię.", "Czy promieniowanie potrzebuje powietrza, by przenosić energię?", "nie"],
  ["Topnienie i krzepnięcie", "zmiana stanu skupienia", "Topnienie zmienia ciało stałe w ciecz, a krzepnięcie ciecz w ciało stałe.", "Podczas zmiany stanu substancja pobiera lub oddaje energię.", "Lód topnieje w wodę, a woda zamarza w lód.", "Temperatura przemiany zależy od substancji i ciśnienia.", "Jak nazywa się przejście cieczy w ciało stałe?", "krzepnięcie"],
  ["Parowanie i wrzenie", "różnica parowanie wrzenie", "Parowanie zachodzi na powierzchni cieczy w różnych temperaturach, a wrzenie w całej objętości przy temperaturze wrzenia.", "Wiatr i większa powierzchnia mogą przyspieszyć parowanie.", "Kałuża paruje bez wrzenia.", "Temperatura wrzenia zależy od ciśnienia.", "Czy parowanie zachodzi tylko podczas wrzenia?", "nie"],
  ["Skraplanie", "kondensacja para woda", "Skraplanie zmienia gaz w ciecz, gdy cząsteczki oddają energię.", "Para wodna może skraplać się na chłodnej powierzchni.", "Krople na zimnej szybie powstają wskutek skraplania pary wodnej.", "Gaz podczas skraplania oddaje energię cieplną.", "Jak nazywa się zmiana gazu w ciecz?", "skraplanie"],
  ["Prąd elektryczny", "natężenie prądu", "Prąd elektryczny to uporządkowany ruch ładunków elektrycznych.", "W metalach przemieszczają się elektrony, gdy obwód jest zamknięty.", "Bateria może wymusić przepływ prądu w obwodzie.", "Prąd mierzymy w amperach.", "Jak nazywa się jednostka natężenia prądu?", "amper|a"],
  ["Napięcie elektryczne", "wolt napięcie", "Napięcie opisuje różnicę energii przypadającej na ładunek między punktami obwodu.", "Można je mierzyć woltomierzem podłączonym równolegle.", "Ogniwo 1,5 V dostarcza napięcie około półtora wolta.", "Jednostką napięcia jest wolt.", "Jaką literą oznacza się jednostkę wolt?", "v|wolt"],
  ["Obwód elektryczny", "zamknięty obwód prądu", "Prąd płynie w prostym obwodzie, gdy źródło i odbiorniki tworzą zamkniętą drogę.", "Przerwa w przewodzie albo otwarty wyłącznik przerywa przepływ.", "Żarówka świeci, gdy obwód z baterią jest zamknięty.", "Schemat używa umownych symboli elementów.", "Czy prąd płynie przez otwarty obwód?", "nie"],
  ["Połączenie szeregowe i równoległe", "obwody elektryczne", "W połączeniu szeregowym elementy leżą w jednej drodze prądu, a równoległe tworzą osobne gałęzie.", "W szeregu awaria jednego odbiornika przerywa cały obwód.", "Lampki domowe łączy się równolegle, by działały niezależnie.", "Sposób połączenia wpływa na działanie odbiorników.", "W którym połączeniu odbiorniki mają osobne gałęzie?", "równoległym"],
  ["Magnes i bieguny", "biegun północny południowy magnes", "Magnes ma dwa bieguny; różnoimienne przyciągają się, a jednoimienne odpychają.", "Pole magnetyczne działa również wokół magnesu.", "Biegun północny i południowy przyciągają się.", "Nie można otrzymać pojedynczego bieguna przez przecięcie magnesu.", "Co robią bieguny jednoimienne?", "odpychają się"],
  ["Dźwięk i drgania", "powstawanie dźwięku", "Dźwięk powstaje wskutek drgań i potrzebuje ośrodka, w którym może się rozchodzić.", "Drgające źródło wprawia otaczające cząsteczki w ruch.", "Struna gitary drga i wytwarza dźwięk.", "Dźwięk nie rozchodzi się w próżni.", "Co musi drgać, by powstał dźwięk?", "źródło|ciało"],
  ["Wysokość i głośność dźwięku", "częstotliwość amplituda dźwięku", "Wysokość dźwięku zależy od częstotliwości, a jego głośność wiąże się z amplitudą drgań.", "Szybsze drgania dają wyższy ton.", "Cienka struna zwykle wydaje wyższy dźwięk niż gruba.", "Głośność i wysokość opisują różne cechy dźwięku.", "Od czego zależy wysokość dźwięku?", "częstotliwości drgań|częstotliwości"],
  ["Odbicie światła", "prawo odbicia światła", "Światło odbija się od powierzchni; kąt odbicia jest równy kątowi padania.", "Oba kąty mierzymy względem prostej prostopadłej do powierzchni.", "Gładkie lustro daje uporządkowane odbicie.", "Kierunek promienia padającego i odbitego zależy od powierzchni.", "Czy kąt odbicia jest równy kątowi padania?", "tak"],
  ["Załamanie światła", "refrakcja załamanie światła", "Załamanie to zmiana kierunku światła przy przejściu między ośrodkami.", "W różnych ośrodkach światło rozchodzi się z różną prędkością.", "Łyżeczka w szklance wody może wyglądać na złamaną.", "Załamanie nie oznacza, że promień znika.", "Jak nazywa się zmiana kierunku światła między ośrodkami?", "załamanie"],
  ["Barwy światła", "rozszczepienie światła tęcza", "Białe światło można rozdzielić na barwy widma.", "Różne długości fal załamują się pod różnym kątem.", "Krople wody rozszczepiają światło słoneczne, tworząc tęczę.", "Barwy łączą się ponownie w białe światło.", "Jakie światło można rozdzielić na barwy tęczy?", "białe"],
  ["Soczewka skupiająca i rozpraszająca", "rodzaje soczewek", "Soczewka skupiająca zbiera równoległe promienie, a rozpraszająca je rozchyla.", "Kształt soczewki wpływa na kierunek promieni.", "Lupa zwykle używa soczewki skupiającej.", "Soczewki są częścią okularów i aparatów.", "Jaki typ soczewki znajduje się zwykle w lupie?", "skupiająca"],
  ["Dźwignia", "maszyna prosta dźwignia", "Dźwignia obraca się wokół punktu podparcia i może ułatwiać wykonanie pracy.", "Dłuższe ramię siły zmniejsza potrzebną siłę przy podnoszeniu ładunku.", "Łom może działać jak dźwignia.", "Zysk na sile wiąże się zwykle z dłuższą drogą.", "Jak nazywa się nieruchomy punkt obrotu dźwigni?", "punkt podparcia|podpora"],
  ["Odnawialne i nieodnawialne źródła energii", "energia odnawialna paliwa kopalne", "Źródła odnawialne uzupełniają się w skali ludzkiego życia, a paliwa kopalne powstają bardzo długo.", "Do odnawialnych zaliczamy wiatr, słońce i wodę; do kopalnych węgiel, ropę i gaz.", "Panel fotowoltaiczny zamienia energię promieniowania na elektryczną.", "Każde źródło ma zalety i wpływ na środowisko.", "Czy wiatr jest źródłem odnawialnym?", "tak"]
]);

addKnowledgeCards("Chemia", [
  ["Układ okresowy pierwiastków", "tablica Mendelejewa", "Układ okresowy porządkuje pierwiastki według liczby atomowej i podobnych właściwości.", "Wiersze nazywamy okresami, a kolumny grupami.", "Lit i sód leżą w tej samej grupie i mają podobne właściwości.", "Położenie pomaga przewidywać zachowanie pierwiastka.", "Jak nazywają się pionowe kolumny układu okresowego?", "grupy"],
  ["Symbol chemiczny pierwiastka", "symbole pierwiastków chemicznych", "Symbol chemiczny to jedno- albo dwuliterowy skrót nazwy pierwiastka.", "Pierwsza litera jest wielka, a druga, jeśli występuje, mała.", "Symbol sodu to Na, a tlenu O.", "Wielkość liter zmienia znaczenie symbolu.", "Jaki symbol ma tlen?", "o|O"],
  ["Liczba atomowa", "liczba protonów atom", "Liczba atomowa mówi, ile protonów znajduje się w jądrze atomu.", "W obojętnym atomie liczba elektronów jest taka sama jak protonów.", "Węgiel ma liczbę atomową 6, więc ma 6 protonów.", "Liczba atomowa identyfikuje pierwiastek.", "Co określa liczbę atomową?", "liczbę protonów|protony"],
  ["Elektrony i powłoki elektronowe", "elektrony powłoki", "Elektrony mają ładunek ujemny i zajmują obszary wokół jądra.", "W uproszczonym modelu szkolnym rozmieszcza się je na powłokach.", "Obojętny atom tlenu ma tyle samo elektronów co protonów.", "Elektrony uczestniczą w tworzeniu wiązań chemicznych.", "Jaki ładunek ma elektron?", "ujemny"],
  ["Jon", "kation anion", "Jon to atom lub grupa atomów z ładunkiem elektrycznym po oddaniu albo przyjęciu elektronów.", "Kation ma ładunek dodatni, a anion ujemny.", "Atom sodu po oddaniu elektronu tworzy kation.", "Liczba protonów w jądrze się nie zmienia.", "Jaki ładunek ma anion?", "ujemny"],
  ["Wiązanie chemiczne", "łączenie atomów wiązanie", "Wiązanie chemiczne łączy atomy w cząsteczki lub sieci krystaliczne.", "Atomy mogą współdzielić elektrony albo je przekazywać.", "W cząsteczce wody atom tlenu łączy się z atomami wodoru.", "Rodzaj wiązania wpływa na właściwości substancji.", "Co łączy atomy w cząsteczce?", "wiązanie chemiczne"],
  ["Wzór chemiczny", "odczytywanie wzorów chemicznych", "Wzór chemiczny pokazuje rodzaj i liczbę atomów w cząsteczce.", "Mała cyfra po symbolu wskazuje liczbę atomów danego pierwiastka.", "H₂O ma dwa atomy wodoru i jeden tlenu.", "Brak cyfry oznacza jeden atom.", "Ile atomów wodoru zawiera H2O?", "2|dwa"],
  ["Pierwiastek i związek chemiczny", "różnica pierwiastek związek", "Pierwiastek składa się z atomów jednego rodzaju, a związek z atomów różnych pierwiastków połączonych chemicznie.", "Sprawdź, czy wzór zawiera symbole jednego czy kilku pierwiastków.", "Tlen jest pierwiastkiem, a woda związkiem chemicznym.", "Związek ma określony skład.", "Czy woda jest pierwiastkiem czy związkiem?", "związkiem"],
  ["Mieszanina i związek chemiczny", "różnica mieszanina związek", "Mieszaninę można rozdzielić metodami fizycznymi, a związek wymaga przemiany chemicznej.", "W mieszaninie składniki zachowują wiele swoich właściwości.", "Piasek z solą to mieszanina, a woda to związek.", "Nie myl połączenia składników z reakcją chemiczną.", "Czy piasek z solą jest mieszaniną?", "tak"],
  ["Roztwór i rozpuszczalnik", "substancja rozpuszczona", "Roztwór to mieszanina jednorodna rozpuszczalnika i substancji rozpuszczonej.", "Rozpuszczalnik występuje zwykle w większej ilości i rozprasza substancję.", "Woda z rozpuszczoną solą tworzy roztwór.", "Nie każda mieszanina jest roztworem.", "Co rozpuszcza sól w wodzie?", "woda|rozpuszczalnik"],
  ["Rozpuszczalność", "od czego zależy rozpuszczalność", "Rozpuszczalność określa maksymalną ilość substancji, którą można rozpuścić w danej ilości rozpuszczalnika.", "Zależy od substancji, rozpuszczalnika i temperatury.", "W ciepłej wodzie zwykle da się rozpuścić więcej cukru niż w zimnej.", "Mieszanie przyspiesza rozpuszczanie, ale nie zawsze zwiększa jego granicę.", "Czy rozpuszczalność zawsze jest taka sama w każdej temperaturze?", "nie"],
  ["Filtracja", "sączenie rozdzielanie mieszanin", "Filtracja oddziela nierozpuszczalne ciało stałe od cieczy za pomocą filtra.", "Ciecz przechodzi przez pory, a większe cząstki zostają na filtrze.", "Piasek można odfiltrować z wody.", "Filtracja nie oddzieli rozpuszczonej soli od wody.", "Czy filtracja oddzieli piasek od wody?", "tak"],
  ["Krystalizacja", "otrzymywanie kryształów roztwór", "Krystalizacja wydziela substancję rozpuszczoną z roztworu.", "Możemy odparować część rozpuszczalnika lub ochłodzić nasycony roztwór.", "Po odparowaniu wody z solanki pozostają kryształy soli.", "Metoda sprawdza się dla substancji tworzących kryształy.", "Co pozostanie po odparowaniu wody z roztworu soli?", "kryształy soli|sól"],
  ["Destylacja", "rozdzielanie destylacja", "Destylacja rozdziela substancje dzięki różnicom temperatur wrzenia.", "Składnik paruje, a następnie para skrapla się w chłodnicy.", "Z wody morskiej można uzyskać wodę destylowaną.", "Układ wymaga ogrzewania i chłodzenia.", "Na jakiej różnicy opiera się destylacja?", "temperatur wrzenia"],
  ["Sedymentacja i dekantacja", "opadanie osadu zlewanie cieczy", "Sedymentacja pozwala cięższym cząstkom opaść, a dekantacja polega na ostrożnym zlaniu cieczy.", "Najpierw czekamy, aż osad osiądzie, potem zlewamy warstwę nad nim.", "Błoto może osiąść na dnie wody.", "Dekantacja nie usuwa substancji całkowicie rozpuszczonych.", "Co robimy podczas dekantacji?", "zlewamy ciecz znad osadu|zlewanie cieczy"],
  ["Reakcja chemiczna", "substraty produkty reakcji", "Reakcja chemiczna przekształca substraty w nowe substancje zwane produktami.", "Obserwuj zmianę barwy, wydzielanie gazu, osadu lub energii, ale potwierdź wnioski.", "Spalanie magnezu tworzy nowy związek z tlenem.", "Zmiana stanu skupienia sama w sobie nie musi być reakcją chemiczną.", "Jak nazywamy substancje powstające w reakcji?", "produkty"],
  ["Prawo zachowania masy", "masa substratów i produktów", "W układzie zamkniętym łączna masa substratów jest równa łącznej masie produktów.", "Atomy zmieniają połączenia, ale nie znikają ani nie powstają z niczego.", "Jeśli reaguje 4 g i 6 g substancji, produkty ważą razem 10 g.", "Gaz trzeba uwzględnić, nawet gdy jest niewidoczny.", "Czy masa całkowita w układzie zamkniętym się zmienia?", "nie"],
  ["Wskaźnik kwasowo-zasadowy", "lakmus wskaźniki chemiczne", "Wskaźnik zmienia barwę zależnie od odczynu roztworu.", "Używamy go, by odróżnić roztwór kwaśny, obojętny i zasadowy.", "Uniwersalny papierek wskaźnikowy przyjmuje różne barwy w różnych odczynach.", "Barwy zależą od rodzaju wskaźnika.", "Do czego służy papierek wskaźnikowy?", "określa odczyn|sprawdza kwasowość"],
  ["Skala pH", "pH kwas zasada", "Skala pH opisuje odczyn: poniżej 7 jest kwaśny, 7 obojętny, a powyżej 7 zasadowy.", "Im niższe pH, tym roztwór jest bardziej kwaśny.", "Sok cytrynowy ma kwaśny odczyn.", "Wyniki pH interpretuje się w zależności od stężenia i warunków.", "Jaki odczyn ma roztwór o pH 7?", "obojętny"],
  ["Metale i niemetale", "właściwości metali i niemetali", "Metale zwykle przewodzą prąd i ciepło, a wiele z nich jest kowalnych.", "Niemetale mają różnorodne właściwości i często słabo przewodzą.", "Miedź przewodzi prąd i jest metalem.", "Są wyjątki, dlatego porównuj konkretne pierwiastki.", "Czy miedź jest metalem czy niemetalem?", "metalem"],
  ["Korozja", "rdzewienie metali", "Korozja to stopniowe niszczenie materiału wskutek reakcji z otoczeniem.", "Rdzewienie żelaza wymaga dostępu tlenu i wody.", "Powłoka farby ogranicza kontakt metalu z wilgocią.", "Korozji można zapobiegać przez ochronne powłoki i dobór materiału.", "Jak nazywa się korozja żelaza?", "rdzewienie"],
  ["Spalanie", "warunki spalania trójkąt ognia", "Spalanie to reakcja chemiczna, która zwykle przebiega z wydzielaniem ciepła i światła.", "Potrzebne są paliwo, utleniacz i temperatura zapłonu.", "Usunięcie jednego z tych elementów może ugasić ogień.", "Pożaru oleju nie wolno gasić wodą.", "Wymień jeden warunek spalania.", "paliwo|tlen|wysoka temperatura"]
]);

addKnowledgeCards("Historia", [
  ["Źródło historyczne", "źródła do historii", "Źródło historyczne to ślad przeszłości, który pomaga badać minione wydarzenia.", "Źródłem może być dokument, przedmiot, budowla, fotografia albo relacja.", "List z XIX wieku jest źródłem pisanym.", "Źródło trzeba oceniać z uwzględnieniem autora i czasu powstania.", "Podaj jeden przykład źródła historycznego.", "dokument|przedmiot|fotografia|relacja"],
  ["Archeologia", "badanie przeszłości archeolog", "Archeologia bada przeszłość między innymi przez odkrywanie i analizę materialnych pozostałości.", "Archeolodzy opisują miejsce znalezienia, warstwy i funkcję przedmiotów.", "Ceramika może pomóc ustalić, jak żyli dawni ludzie.", "Znalezisko nabiera znaczenia w swoim kontekście.", "Jakie źródła bada archeolog?", "materialne|przedmioty"],
  ["Chronologia historyczna", "kolejność wydarzeń historia", "Chronologia porządkuje wydarzenia według czasu ich wystąpienia.", "Ustal, które wydarzenie było wcześniej, a które później.", "Na osi czasu umieszczamy daty w kolejności.", "Dobra oś czasu ma równą, opisaną skalę.", "Co porządkuje chronologia?", "wydarzenia według czasu|kolejność wydarzeń"],
  ["Przed naszą erą i naszej ery", "pne ne daty historyczne", "Lata przed naszą erą liczymy wstecz ku początkowi naszej ery.", "W obrębie lat p.n.e. mniejsza liczba oznacza datę późniejszą.", "500 p.n.e. wydarzyło się po 600 p.n.e.", "Nie ma roku zerowego w tradycyjnym podziale na p.n.e. i n.e.", "Która data jest późniejsza: 500 czy 600 p.n.e.?", "500 p.n.e.|pięćset p.n.e."],
  ["Stulecie i tysiąclecie", "obliczanie wieku z daty", "Stulecie obejmuje sto lat, a tysiąclecie tysiąc lat.", "Dla lat od 1 do 100 stulecie to I; lata 1901–2000 to XX stulecie.", "Rok 2025 należy do XXI wieku.", "Wiek zwykle jest o jeden większy od pierwszych cyfr roku, jeśli rok nie kończy się na 00.", "Do którego wieku należy rok 1410?", "15|xv|piętnastego"],
  ["Cywilizacja starożytnego Egiptu", "starożytny egipt nil faraon", "Cywilizacja egipska rozwijała się wzdłuż Nilu, którego wylewy użyźniały pola.", "Rzekę wykorzystywano do rolnictwa, transportu i organizacji państwa.", "Piramidy były związane między innymi z władzą faraonów i pochówkiem.", "Dzieje Egiptu obejmują wiele dynastii i okresów.", "Nad jaką rzeką rozwinął się starożytny Egipt?", "nil|nad nilem"],
  ["Demokracja ateńska", "początki demokracji Ateny", "W starożytnych Atenach część obywateli uczestniczyła w podejmowaniu decyzji państwowych.", "Była to demokracja bezpośrednia, ale nie obejmowała wszystkich mieszkańców.", "Obywatele mogli głosować podczas zgromadzenia.", "Nie utożsamiaj praw obywateli Aten z powszechnym prawem wyborczym dziś.", "Jak nazywa się demokracja, w której obywatele głosują bezpośrednio?", "bezpośrednia"],
  ["Republika rzymska", "ustrój republikański rzym", "Republika rzymska była ustrojem, w którym władzę sprawowali wybierani urzędnicy i senat.", "Urzędy miały określone kompetencje, a obywatele uczestniczyli w życiu publicznym.", "Konsulowie należeli do najważniejszych urzędników.", "Republika rzymska zmieniała się na przestrzeni stuleci.", "Jak nazywali się dwaj najważniejsi urzędnicy republiki rzymskiej?", "konsulowie"],
  ["Pax Romana", "pokój rzymski", "Pax Romana to okres względnej stabilizacji i pokoju w cesarstwie rzymskim.", "Sprzyjał rozwojowi handlu, miast, dróg i administracji.", "Rzymskie drogi łączyły odległe prowincje.", "Określenie nie oznacza całkowitego braku konfliktów.", "Co oznacza określenie Pax Romana?", "pokój rzymski|okres stabilizacji"],
  ["Średniowieczny system feudalny", "feudalizm zależności lennych", "Feudalizm opierał się na zależnościach między seniorami i wasalami oraz posiadaniu ziemi.", "Wasal otrzymywał lenno i zobowiązywał się do służby.", "Rycerz mógł być wasalem możnego pana.", "Rzeczywiste stosunki społeczne różniły się między regionami.", "Co otrzymywał wasal od seniora?", "lenno|ziemię"],
  ["Stany społeczne w średniowieczu", "duchowieństwo rycerstwo chłopi", "W średniowieczu społeczeństwo dzielono między innymi na duchowieństwo, rycerstwo i chłopów.", "Każda grupa miała różne obowiązki i przywileje.", "Chłopi uprawiali ziemię, a duchowni prowadzili życie religijne.", "Podział był uproszczeniem zróżnicowanego społeczeństwa.", "Wymień jeden stan średniowieczny.", "duchowieństwo|rycerstwo|chłopi"],
  ["Zakon rycerski", "zakony rycerskie średniowiecze", "Zakony rycerskie łączyły życie religijne z obowiązkami wojskowymi.", "Ich członkowie składali śluby i uczestniczyli w działaniach militarnych.", "Zakon krzyżacki działał między innymi nad Bałtykiem.", "Zakony wpływały na politykę i gospodarkę regionów.", "Jaki zakon rycerski działał nad Bałtykiem?", "krzyżacki|krzyżacy"],
  ["Renesans", "odrodzenie epoka", "Renesans był epoką zainteresowania kulturą antyczną, nauką i możliwościami człowieka.", "Rozwijał się w Europie od XIV wieku, w różnych regionach w różnym czasie.", "Leonardo da Vinci łączył działalność artystyczną i naukową.", "Renesans nie oznaczał identycznych zmian w całej Europie.", "Do jakiej kultury chętnie nawiązywali twórcy renesansu?", "antycznej|starożytnej"],
  ["Reformacja", "reformacja kościoła", "Reformacja była ruchem religijnym XVI wieku, który doprowadził do powstania kościołów protestanckich.", "Dyskusje dotyczyły między innymi nauczania, praktyk i organizacji Kościoła.", "Marcin Luter ogłosił postulaty w 1517 roku.", "Reformacja miała także skutki polityczne i społeczne.", "Jaki ruch religijny doprowadził do powstania protestantyzmu?", "reformacja"],
  ["Wynalezienie druku", "Gutenberg prasa drukarska", "Druk z ruchomą czcionką przyspieszył kopiowanie i rozpowszechnianie książek w Europie.", "Więcej osób mogło korzystać z tekstów, a wiedza szybciej krążyła.", "Biblia Gutenberga jest jednym z wczesnych drukowanych dzieł europejskich.", "Druk istniał wcześniej w innych regionach świata.", "Co ułatwił druk z ruchomą czcionką?", "kopiowanie książek|rozpowszechnianie tekstów"],
  ["Wielkie odkrycia geograficzne", "wyprawy odkrywców skutki", "Wyprawy oceaniczne Europejczyków od XV wieku połączyły odległe kontynenty intensywnymi kontaktami.", "Przyniosły wymianę towarów, ale też podboje, kolonizację i cierpienie ludności.", "Wyprawa Kolumba w 1492 roku dotarła do wysp Karaibów.", "Opisuj zarówno skutki gospodarcze, jak i społeczne.", "W którym roku wyprawa Kolumba dotarła do Karaibów?", "1492"],
  ["Rewolucja francuska", "rewolucja 1789 francja", "Rewolucja francuska rozpoczęła się w 1789 roku i zmieniła ustrój oraz społeczeństwo Francji.", "Hasła wolności i równości wpłynęły na politykę Europy.", "Zdobycie Bastylii stało się symbolem początku rewolucji.", "Jej przebieg obejmował wiele etapów i konfliktów.", "W którym roku rozpoczęła się rewolucja francuska?", "1789"],
  ["Rewolucja przemysłowa", "industrializacja maszyna parowa", "Rewolucja przemysłowa przekształciła produkcję przez mechanizację i rozwój fabryk.", "Zmieniła pracę, transport, miasta i życie rodzin.", "Kolej parowa skróciła czas podróży i przewozu towarów.", "Postęp techniczny wiązał się także z trudnymi warunkami pracy.", "Co zastępowało część pracy ręcznej podczas industrializacji?", "maszyny|mechanizacja"],
  ["Konstytucja 3 maja", "uchwalenie konstytucji 1791", "Konstytucję 3 maja uchwalono w 1791 roku jako próbę reformy Rzeczypospolitej.", "Wzmacniała władzę centralną i zmieniała zasady ustroju.", "Była pierwszą konstytucją w Europie i jedną z pierwszych na świecie.", "Jej reformy przerwały konflikty i dalsze rozbiory.", "W którym roku uchwalono Konstytucję 3 maja?", "1791"],
  ["I wojna światowa", "pierwsza wojna światowa 1914 1918", "I wojna światowa trwała od 1914 do 1918 roku i objęła wiele państw.", "Wojna pozycyjna i nowe rodzaje broni przyniosły ogromne straty.", "Zakończył ją rozejm z 11 listopada 1918 roku.", "Przyczyny konfliktu były złożone i narastały przez lata.", "W którym roku zakończyła się I wojna światowa?", "1918"],
  ["Odzyskanie niepodległości przez Polskę", "niepodległość polski 1918", "Polska odzyskała niepodległość w 1918 roku po 123 latach zaborów.", "Na odbudowę państwa wpłynęło wiele działań społecznych i politycznych.", "11 listopada jest w Polsce świętem narodowym związanym z tym wydarzeniem.", "Niepodległość kształtowała się w procesie, a nie w jednej chwili.", "W którym roku Polska odzyskała niepodległość?", "1918"],
  ["Holokaust", "zagłada Żydów podczas drugiej wojny", "Holokaust był systematyczną zagładą Żydów europejskich dokonaną przez nazistowskie Niemcy.", "Pamięć o ofiarach i świadectwa pomagają rozumieć skalę zbrodni.", "Obozy zagłady były elementem niemieckiego planu eksterminacji.", "Należy odróżniać odpowiedzialność sprawców od narodowości ofiar i świadków.", "Kto zorganizował Holokaust?", "nazistowskie niemcy|reżim nazistowski"],
  ["Powstanie warszawskie", "1 sierpnia 1944 warszawa", "Powstanie warszawskie rozpoczęło się 1 sierpnia 1944 roku przeciw niemieckiej okupacji.", "Trwało 63 dni, a walkom towarzyszyły wielkie straty ludności i zniszczenie miasta.", "Godzina W oznaczała początek walk o godzinie 17.", "Ocena decyzji o powstaniu jest przedmiotem dyskusji historyków.", "W którym roku rozpoczęło się powstanie warszawskie?", "1944"],
  ["Zimna wojna", "konflikt wschód zachód", "Zimna wojna była długotrwałym napięciem politycznym i militarnym między blokiem wschodnim a zachodnim.", "Rywalizacja obejmowała zbrojenia, propagandę, wyścig kosmiczny i konflikty zastępcze.", "USA i ZSRR stały po przeciwnych stronach rywalizacji.", "Okres ten nie był bezpośrednią wojną tych dwóch mocarstw.", "Jak nazywa się powojenna rywalizacja bloków bez bezpośredniej wojny USA z ZSRR?", "zimna wojna"],
  ["Mur berliński", "upadek muru berlińskiego", "Mur berliński dzielił Berlin od 1961 roku do otwarcia granicy w 1989 roku.", "Stał się symbolem podziału Europy podczas zimnej wojny.", "Otwarcie przejść nastąpiło 9 listopada 1989 roku.", "Jego upadek wiązał się z przemianami politycznymi w Europie.", "W którym roku otwarto mur berliński?", "1989"],
  ["Unia lubelska", "unia polsko litewska 1569", "Unia lubelska z 1569 roku połączyła Koronę Królestwa Polskiego i Wielkie Księstwo Litewskie w Rzeczpospolitą Obojga Narodów.", "Państwa miały wspólnego monarchę i sejm, ale zachowały odrębne instytucje.", "Unia była przykładem porozumienia dwóch państw.", "Nie oznaczała pełnego zlania wszystkich urzędów.", "W którym roku zawarto unię lubelską?", "1569"],
  ["Dynastia Jagiellonów", "Jagiellonowie Polska Litwa", "Jagiellonowie byli dynastią rządzącą w Polsce i innych państwach Europy Środkowej.", "Jej znaczenie wzrosło po unii Polski i Litwy.", "Władysław Jagiełło był królem Polski i wielkim księciem litewskim.", "Dynastia obejmowała wielu władców i kilka państw.", "Jak nazywała się dynastia związana z Władysławem Jagiełłą?", "jagiellonowie"],
  ["Bitwa pod Grunwaldem", "grunwald 1410 zakon krzyżacki", "Bitwa pod Grunwaldem odbyła się w 1410 roku między wojskami polsko-litewskimi a zakonem krzyżackim.", "Zwycięstwo osłabiło pozycję zakonu, choć nie zakończyło od razu wszystkich sporów.", "W bitwie walczyły siły dowodzone przez Władysława Jagiełłę.", "Wyniki bitew należy odróżniać od późniejszych skutków politycznych.", "W którym roku odbyła się bitwa pod Grunwaldem?", "1410"]
]);

addKnowledgeCards("Geografia", [
  ["Równik", "równik geograficzny", "Równik to równoleżnik o szerokości geograficznej 0° dzielący Ziemię na półkulę północną i południową.", "Pozostałe równoleżniki biegną równolegle do równika.", "Ekwador leży w pobliżu równika.", "Równik jest najdłuższym równoleżnikiem.", "Jaką szerokość geograficzną ma równik?", "0 stopni|0°"],
  ["Południk zerowy", "greenwich długość geograficzna 0", "Południk zerowy przechodzi przez Greenwich i ma długość geograficzną 0°.", "Od niego liczymy długość geograficzną wschodnią i zachodnią.", "Południk zerowy i południk 180° dzielą Ziemię na półkule wschodnią i zachodnią.", "Południki zbiegają się na biegunach.", "Przez jaką miejscowość przechodzi południk zerowy?", "greenwich"],
  ["Równoleżniki i południki", "siatka geograficzna", "Równoleżniki wyznaczają szerokość geograficzną, a południki długość geograficzną.", "Szerokość podajemy jako północną lub południową, a długość jako wschodnią lub zachodnią.", "Warszawa leży na półkuli północnej i wschodniej.", "Współrzędne pozwalają wskazać położenie miejsca.", "Które linie pomagają określić długość geograficzną?", "południki"],
  ["Szerokość geograficzna", "północna południowa szerokość", "Szerokość geograficzna określa odległość kątową miejsca od równika.", "Podajemy ją w stopniach na północ lub południe, od 0° do 90°.", "Warszawa leży na szerokości północnej.", "Szerokość odczytujemy z równoleżników.", "Od czego mierzymy szerokość geograficzną?", "równika"],
  ["Długość geograficzna", "wschodnia zachodnia długość", "Długość geograficzna określa położenie na wschód lub zachód od południka zerowego.", "Podajemy ją w stopniach, maksymalnie do 180°.", "Warszawa leży na długości wschodniej.", "Długość odczytujemy z południków.", "Od którego południka liczymy długość geograficzną?", "zerowego|greenwich"],
  ["Strefy czasowe", "czas strefowy", "Strefy czasowe upraszczają zapis czasu na obszarach o podobnej porze dnia.", "Ziemia obraca się o około 15° długości geograficznej w ciągu godziny.", "Przesuwając się na wschód, zwykle dodajemy godziny.", "Granice stref dostosowano do granic państw i regionów.", "Ile stopni obraca się Ziemia w przybliżeniu w godzinę?", "15"],
  ["Kierunki świata", "północ południe wschód zachód", "Cztery główne kierunki to północ, południe, wschód i zachód.", "Na większości map północ znajduje się u góry, jeśli legenda nie wskazuje inaczej.", "Wschód leży po prawej stronie mapy z północą u góry.", "Kompas wskazuje kierunek północny.", "Jaki kierunek wskazuje kompas?", "północ"],
  ["Legenda mapy", "znaki kartograficzne", "Legenda objaśnia symbole i kolory użyte na mapie.", "Porównaj znak na mapie z jego opisem w legendzie.", "Niebieska linia może oznaczać rzekę, jeśli legenda tak stanowi.", "Ten sam kolor może znaczyć co innego na różnych mapach.", "Gdzie sprawdzisz znaczenie symbolu na mapie?", "w legendzie|legenda"],
  ["Poziomice", "warstwice wysokość terenu", "Poziomice łączą punkty o tej samej wysokości nad poziomem morza.", "Gęsto ułożone poziomice oznaczają zwykle stromy stok.", "Szeroko rozstawione poziomice wskazują łagodniejszy teren.", "Różnica wysokości między sąsiednimi poziomicami to cięcie poziomicowe.", "Co pokazuje poziomica?", "jednakową wysokość|wysokość terenu"],
  ["Wysokość bezwzględna i względna", "wysokość nad poziomem morza", "Wysokość bezwzględna jest mierzona od poziomu morza, a względna od wybranego punktu.", "Wysokość względna dwóch miejsc to różnica ich wysokości bezwzględnych.", "Szczyt 1000 m i dolina 400 m różnią się wysokością względną 600 m.", "Zawsze sprawdź, od jakiego poziomu liczysz wysokość.", "Od czego mierzy się wysokość bezwzględną?", "poziomu morza"],
  ["Formy ukształtowania powierzchni", "niziny wyżyny góry", "Do głównych form terenu należą niziny, wyżyny i góry.", "Różnią się wysokością oraz nachyleniem i rozczłonkowaniem powierzchni.", "Niziny leżą niżej niż wyżyny.", "Granice wysokości mogą zależeć od przyjętego podziału szkolnego.", "Która forma terenu jest najwyższa z tych trzech?", "góry"],
  ["Wulkan", "budowa wulkanu lawa magma", "Wulkan to miejsce, przez które magma, gazy i materiał skalny mogą wydostawać się na powierzchnię.", "Magma pod powierzchnią po wydostaniu na zewnątrz nazywa się lawą.", "Erupcja może wyrzucać popiół i gazy.", "Wulkany mają różne typy i przebieg erupcji.", "Jak nazywa się magma po wydostaniu na powierzchnię?", "lawa"],
  ["Trzęsienie ziemi", "ruchy płyt tektonicznych", "Trzęsienie ziemi to drgania podłoża, najczęściej związane z nagłym uwolnieniem energii we wnętrzu Ziemi.", "Często występuje na granicach płyt litosfery.", "Sejsmograf rejestruje drgania gruntu.", "Silne trzęsienia mogą powodować osuwiska i zniszczenia.", "Jak nazywa się urządzenie rejestrujące drgania ziemi?", "sejsmograf"],
  ["Płyty litosfery", "tektonika płyt kontynenty", "Litosfera składa się z płyt, które przemieszczają się powoli względem siebie.", "Ich ruch może tworzyć góry, rowy oceaniczne i obszary trzęsień.", "Zderzenie płyt może wypiętrzać góry.", "Prędkość ruchu płyt jest niewielka w skali człowieka.", "Czy płyty litosfery poruszają się szybko w skali człowieka?", "nie"],
  ["Lodowiec", "powstawanie lodowców", "Lodowiec powstaje, gdy śniegu gromadzi się więcej niż topnieje, a jego warstwy zagęszczają się w lód.", "Lód przemieszcza się pod wpływem grawitacji.", "Lodowiec może żłobić dolinę i przenosić materiał skalny.", "Lodowce są ważnym rezerwuarem wody słodkiej.", "Co musi gromadzić się przez długi czas, by powstał lodowiec?", "śnieg"],
  ["Dopływ i ujście rzeki", "źródło dopływ ujście", "Dopływ wpływa do większej rzeki, a ujście jest miejscem, gdzie rzeka kończy bieg.", "Rzeka może uchodzić do morza, jeziora albo innej rzeki.", "Narew jest dopływem Wisły.", "Nazwy lewego i prawego dopływu zależą od kierunku patrzenia z biegiem rzeki.", "Jak nazywa się mniejsza rzeka wpadająca do większej?", "dopływ"],
  ["Dorzecze i zlewisko", "obszar dorzecza zlewisko", "Dorzecze obejmuje obszar odwadniany przez rzekę główną i jej dopływy.", "Zlewisko to obszar, z którego wody spływają do jednego morza lub oceanu.", "Większość Polski należy do zlewiska Morza Bałtyckiego.", "Granice zlewisk wyznaczają działy wodne.", "Jak nazywa się obszar odwadniany przez rzekę i jej dopływy?", "dorzecze"],
  ["Jezioro polodowcowe", "typy jezior polodowcowych", "Jeziora polodowcowe powstały w krajobrazie ukształtowanym przez lądolód lub lodowiec.", "Ich kształt zależy od rodzaju zagłębienia pozostawionego przez lód.", "Jeziora rynnowe są długie i wąskie.", "Polska ma wiele jezior polodowcowych na pojezierzach.", "Jaki kształt mają często jeziora rynnowe?", "długi i wąski|wąskie i długie"],
  ["Krajobraz a środowisko", "elementy krajobrazu", "Krajobraz obejmuje naturalne i stworzone przez człowieka elementy widoczne na danym obszarze.", "Opisuj rzeźbę terenu, wody, roślinność, zabudowę i działalność ludzi.", "Krajobraz miejski zawiera gęstą zabudowę i drogi.", "Krajobraz zmienia się pod wpływem natury i człowieka.", "Podaj jeden element krajobrazu stworzony przez człowieka.", "droga|budynek|most"],
  ["Gęstość zaludnienia", "obliczanie gęstości zaludnienia", "Gęstość zaludnienia to liczba mieszkańców przypadająca na jednostkę powierzchni.", "Dzielimy liczbę mieszkańców przez powierzchnię, zwykle w km².", "1000 osób na 10 km² daje 100 osób/km².", "Średnia nie pokazuje, jak nierówno ludzie są rozmieszczeni.", "Jak obliczamy gęstość zaludnienia?", "ludność podzielona przez powierzchnię|liczbę mieszkańców przez powierzchnię"],
  ["Migracja", "emigracja imigracja", "Migracja to przemieszczanie się ludzi z jednego miejsca do innego na pewien czas lub na stałe.", "Emigracja oznacza wyjazd z kraju, a imigracja przyjazd do kraju.", "Przeprowadzka rodziny do innego państwa jest migracją.", "Przyczyny migracji mogą być rodzinne, ekonomiczne lub związane z bezpieczeństwem.", "Jak nazywa się przyjazd do kraju?", "imigracja"],
  ["Urbanizacja", "rozwój miast urbanizacja", "Urbanizacja to wzrost znaczenia miast i udziału ludności mieszkającej w miastach.", "Obejmuje zmiany przestrzenne, społeczne i gospodarcze.", "Rozrastające się przedmieścia są przykładem procesu urbanizacji.", "Szybki rozwój miast wymaga planowania transportu i usług.", "Jak nazywa się wzrost znaczenia miast?", "urbanizacja"],
  ["Rolnictwo intensywne i ekstensywne", "typy rolnictwa", "Rolnictwo intensywne uzyskuje wysokie plony dzięki dużym nakładom, a ekstensywne używa ich mniej na jednostkę powierzchni.", "Porównuj nawożenie, mechanizację, pracę i wielkość plonów.", "Nowoczesne gospodarstwo z dużą ilością maszyn może prowadzić produkcję intensywną.", "System zależy od warunków i rodzaju upraw.", "Który typ rolnictwa wykorzystuje zwykle więcej nakładów na hektar?", "intensywne"],
  ["Surowce odnawialne i nieodnawialne", "zasoby naturalne", "Zasoby odnawialne odtwarzają się w krótkim czasie, a nieodnawialne są ograniczone w skali życia człowieka.", "Klasyfikuj zasób według tempa jego naturalnego odtwarzania.", "Wiatr jest odnawialny, a węgiel nieodnawialny.", "Sposób wykorzystania wpływa na dostępność zasobów.", "Czy węgiel kamienny jest odnawialny?", "nie"],
  ["Susza", "przyczyny suszy skutki", "Susza to długotrwały niedobór opadów powodujący spadek dostępności wody.", "Może dotyczyć gleby, rolnictwa albo zasobów wodnych.", "Brak opadów obniża poziom rzek i utrudnia uprawy.", "Oszczędzanie wody i retencja mogą ograniczać skutki.", "Co jest główną przyczyną suszy meteorologicznej?", "niedobór opadów"],
  ["Powódź", "przyczyny powodzi", "Powódź to czasowe zalanie obszaru przez wodę, która wystąpiła z koryta lub osłon.", "Przyczyną mogą być intensywne opady, roztopy albo cofka.", "Wały i poldery mogą zmniejszać zagrożenie w wybranych miejscach.", "Nie wchodź do szybko płynącej wody powodziowej.", "Wymień jedną przyczynę powodzi.", "intensywne opady|roztopy|cofka"],
  ["Ochrona przyrody", "parki narodowe rezerwaty przyrody", "Ochrona przyrody zachowuje gatunki, siedliska i cenne krajobrazy.", "Park narodowy chroni rozległe obszary, a rezerwat wybrane cenne obiekty lub ekosystemy.", "Białowieski Park Narodowy chroni fragment Puszczy Białowieskiej.", "Ochrona może wymagać ograniczeń w użytkowaniu terenu.", "Co chroni park narodowy?", "przyrodę|siedliska i gatunki"],
  ["Zrównoważony rozwój", "rozwój społeczny środowisko gospodarka", "Zrównoważony rozwój uwzględnia potrzeby ludzi, gospodarki i środowiska.", "Szukaj rozwiązań, które nie wyczerpują zasobów potrzebnych przyszłym pokoleniom.", "Transport publiczny może ograniczać część emisji i korków.", "Decyzje mają skutki społeczne, ekonomiczne i przyrodnicze.", "Jakie trzy obszary łączy zrównoważony rozwój?", "ludzi&gospodarkę&środowisko|społeczeństwo&gospodarkę&środowisko"]
]);

addKnowledgeCards("Informatyka", [
  ["Algorytm", "algorytm przepis na rozwiązanie", "Algorytm to uporządkowany zestaw jednoznacznych kroków prowadzących do rozwiązania problemu.", "Kroki powinny mieć określone dane wejściowe, kolejność i wynik.", "Przepis kulinarny przypomina algorytm, jeśli kroki są jasne.", "Ten sam algorytm można zapisać słowami, schematem albo kodem.", "Co opisuje algorytm?", "kroki rozwiązania problemu|sposób rozwiązania"],
  ["Sekwencja, wybór i pętla", "podstawowe konstrukcje programowania", "Sekwencja wykonuje kroki po kolei, wybór podejmuje decyzję, a pętla powtarza instrukcje.", "Rozpoznaj, czy fragment programu wykonuje działania, sprawdza warunek czy wraca do początku.", "Jeśli pada deszcz, weź parasol to przykład wyboru.", "Te trzy konstrukcje występują w wielu językach programowania.", "Która konstrukcja powtarza instrukcje?", "pętla"],
  ["Zmienna w programie", "zmienna programowanie", "Zmienna przechowuje wartość, z której program może korzystać lub którą może zmieniać.", "Nadaj jej nazwę pasującą do przechowywanej informacji.", "wiek = 12 może przechowywać liczbę lat.", "Typ wartości wpływa na możliwe działania.", "Do czego służy zmienna?", "przechowuje wartość|dane"],
  ["Warunek w programie", "instrukcja warunkowa if", "Instrukcja warunkowa wykonuje różne działania zależnie od tego, czy warunek jest prawdziwy.", "Sformułuj warunek tak, by wynik był prawdą albo fałszem.", "Jeśli temperatura jest poniżej zera, pokaż komunikat o mrozie.", "Niektóre programy mają kilka rozgałęzień.", "Jakie dwa wyniki może mieć warunek logiczny?", "prawda&fałsz|prawdziwy&fałszywy"],
  ["Pętla programistyczna", "powtarzanie instrukcji pętla", "Pętla powtarza blok instrukcji określoną liczbę razy albo dopóki warunek jest spełniony.", "Zadbaj o warunek zakończenia, by uniknąć pętli nieskończonej.", "Powtórz pięć razy może narysować pięć kroków.", "Pętle skracają powtarzalny kod.", "Co powinna mieć pętla warunkowa, by mogła się skończyć?", "warunek zakończenia"],
  ["Testowanie i debugowanie", "szukanie błędów programu", "Debugowanie to wyszukiwanie i poprawianie błędów w programie.", "Odtwórz problem, zawęź miejsce błędu i sprawdź poprawkę na przykładach.", "Test z małą liczbą ujawnia błąd w obliczaniu sumy.", "Nie zmieniaj kilku rzeczy naraz, jeśli chcesz ustalić przyczynę.", "Jak nazywa się proces poprawiania błędów programu?", "debugowanie"],
  ["Dane wejściowe i wyjściowe", "wejście i wyjście programu", "Dane wejściowe trafiają do programu, a wyjściowe są wynikiem jego działania.", "Określ, co użytkownik podaje i co program ma zwrócić.", "Kalkulator przyjmuje liczby i pokazuje wynik.", "Dobre opisanie wejścia i wyjścia ułatwia projektowanie.", "Co pokazuje program po przetworzeniu danych?", "dane wyjściowe|wynik"],
  ["Arkusz kalkulacyjny i komórka", "komórki arkusza adres komórki", "Arkusz kalkulacyjny organizuje dane w wierszach, kolumnach i komórkach.", "Adres komórki składa się z litery kolumny i numeru wiersza.", "B3 oznacza komórkę w kolumnie B i wierszu 3.", "Formuły mogą odwoływać się do adresów komórek.", "Co oznacza adres C4?", "kolumnę c i wiersz 4|kolumna c wiersz 4"],
  ["Formuła w arkuszu kalkulacyjnym", "formuły arkusz kalkulacyjny", "Formuła wykonuje obliczenie na danych w komórkach i zwykle zaczyna się od znaku równości.", "Użyj adresów komórek oraz operatorów lub funkcji.", "=A1+B1 dodaje wartości z komórek A1 i B1.", "Zmiana danych może automatycznie zmienić wynik formuły.", "Od jakiego znaku zwykle zaczyna się formuła?", "=|znaku równości"],
  ["Sortowanie i filtrowanie danych", "filtr sortuj arkusz", "Sortowanie zmienia kolejność danych, a filtrowanie pokazuje tylko wiersze spełniające warunek.", "Przed sortowaniem zaznacz całą tabelę, by nie rozdzielić rekordów.", "Filtr może wyświetlić tylko uczniów z wybranej klasy.", "Kopia danych chroni przed przypadkową utratą.", "Która funkcja ukrywa wiersze niespełniające warunku?", "filtrowanie|filtr"],
  ["System operacyjny", "windows system operacyjny funkcje", "System operacyjny zarządza sprzętem, plikami i uruchamianiem programów.", "Udostępnia interfejs użytkownikowi i koordynuje pracę urządzenia.", "Windows, Linux i macOS są systemami operacyjnymi.", "System i aplikacja to różne rodzaje oprogramowania.", "Co zarządza pracą sprzętu komputera?", "system operacyjny"],
  ["Plik i folder", "folder katalog plik", "Plik przechowuje dane, a folder pomaga porządkować pliki i inne foldery.", "Nadawaj nazwy, które opisują zawartość, i używaj logicznej struktury.", "Folder Matematyka może zawierać pliki z notatkami.", "Kopia zapasowa chroni przed utratą plików.", "Do czego służy folder?", "porządkuje pliki|organizowania plików"],
  ["Rozszerzenie pliku", "typy plików pdf jpg docx", "Rozszerzenie pliku często wskazuje jego format i programy, które potrafią go otworzyć.", "To część nazwy po kropce, na przykład .pdf albo .jpg.", "Dokument .pdf zachowuje układ strony.", "Samo zmienienie rozszerzenia nie konwertuje zawartości pliku.", "Jak nazywa się końcówka nazwy pliku po kropce?", "rozszerzenie"],
  ["Przeglądarka i wyszukiwarka", "browser search engine", "Przeglądarka otwiera strony, a wyszukiwarka pomaga znaleźć strony pasujące do zapytania.", "Wpisz adres w pasek adresu, a temat w pole wyszukiwania.", "Firefox jest przeglądarką, a wyszukiwarka indeksuje strony.", "Wynik wyszukiwania nie gwarantuje wiarygodności strony.", "Które narzędzie wyświetla strony internetowe?", "przeglądarka"],
  ["Adres URL", "budowa adresu strony", "URL wskazuje adres zasobu w internecie.", "Może zawierać protokół, nazwę domeny i ścieżkę do strony.", "https://example.org/lekcja wskazuje stronę w domenie example.org.", "Sprawdź domenę, gdy oceniasz wiarygodność linku.", "Jak nazywa się adres strony internetowej?", "url|adres url"],
  ["HTTPS i szyfrowane połączenie", "kłódka https bezpieczeństwo", "HTTPS szyfruje połączenie między przeglądarką a witryną.", "Chroni przesyłane dane przed prostym podsłuchem, ale nie potwierdza uczciwości treści strony.", "Kłódka oznacza szyfrowane połączenie z daną domeną.", "Sprawdzaj też właściciela domeny i treść witryny.", "Czy samo HTTPS gwarantuje, że strona jest uczciwa?", "nie"],
  ["Phishing", "fałszywe wiadomości wyłudzanie", "Phishing to próba wyłudzenia danych przez podszywanie się pod zaufaną osobę lub instytucję.", "Sprawdź adres nadawcy, domenę linku i nieoczekiwane żądanie hasła.", "Fałszywa wiadomość o blokadzie konta może nakłaniać do podania hasła.", "Nie klikaj podejrzanych linków i zgłoś wiadomość dorosłemu.", "Jaki jest cel phishingu?", "wyłudzenie danych|kradzież danych"],
  ["Złośliwe oprogramowanie", "malware wirus trojan", "Złośliwe oprogramowanie może kraść dane, uszkadzać pliki lub przejmować kontrolę nad urządzeniem.", "Może dostać się na komputer przez załącznik, pobrany program lub lukę w systemie.", "Trojan udaje pożyteczny program.", "Aktualizacje i ostrożność ograniczają ryzyko.", "Czy trojan zawsze wygląda na szkodliwy program?", "nie"],
  ["Silne hasło i uwierzytelnianie", "bezpieczne hasło 2fa", "Silne hasło jest długie, unikalne i trudne do odgadnięcia.", "Używaj menedżera haseł i włącz dodatkowy składnik logowania, gdy to możliwe.", "Unikalne hasło do poczty chroni przed skutkiem wycieku z innego serwisu.", "Nie wysyłaj nikomu kodów jednorazowych.", "Czy warto używać tego samego hasła wszędzie?", "nie"],
  ["Prywatność w sieci", "dane osobowe prywatność", "Dane osobowe mogą pozwolić rozpoznać konkretną osobę.", "Zanim opublikujesz zdjęcie lub lokalizację, sprawdź odbiorców i uzyskaj zgodę osób na zdjęciu.", "Numer telefonu i adres są danymi osobowymi.", "Raz opublikowana treść może być trudna do usunięcia.", "Podaj przykład danych osobowych.", "adres|numer telefonu|imię i nazwisko"],
  ["Prawa autorskie w internecie", "copyright cytowanie autor", "Prawa autorskie chronią utwory i określają zasady korzystania z nich.", "Podaj autora i źródło, a do ponownego użycia sprawdź licencję.", "Zdjęcie znalezione w wyszukiwarce nie staje się automatycznie wolne.", "Cytat powinien mieć cel i oznaczone źródło.", "Czy każde zdjęcie znalezione online można dowolnie skopiować?", "nie"],
  ["Licencje Creative Commons", "cc by sa nc nd licencje", "Licencje Creative Commons pozwalają autorom określić warunki ponownego wykorzystania utworu.", "Sprawdź wymagania dotyczące autora, zmian, użytku komercyjnego i dalszej licencji.", "CC BY wymaga wskazania autora.", "Skrót licencji opisuje konkretne warunki.", "Co oznacza BY w licencji Creative Commons?", "uznanie autorstwa|podanie autora"],
  ["Kopia zapasowa", "backup kopia plików", "Kopia zapasowa to dodatkowy egzemplarz danych przechowywany na innym nośniku lub w innej lokalizacji.", "Wykonuj ją regularnie i sprawdź, czy da się odzyskać pliki.", "Dysk zewnętrzny może przechowywać kopię ważnych dokumentów.", "Synchronizacja nie zawsze zastępuje kopię, bo może powielić usunięcie.", "Po co tworzymy kopię zapasową?", "chroni dane przed utratą|odzyskiwanie plików"],
  ["Dostępność cyfrowa", "czytelna strona dostępność", "Dostępna strona może być używana przez osoby o różnych potrzebach.", "Dbaj o tekst alternatywny, kontrast, napisy i obsługę klawiaturą.", "Napisy pomagają osobom niesłyszącym i oglądającym bez dźwięku.", "Dostępność poprawia korzystanie dla wielu osób.", "Wymień jeden element dostępnej strony.", "napisy|tekst alternatywny|kontrast"],
  ["Weryfikowanie informacji online", "sprawdzanie wiarygodności internetu", "Informację z internetu warto potwierdzić w kilku niezależnych i wiarygodnych źródłach.", "Sprawdź autora, datę, dowody i pierwotne źródło cytatu.", "Komunikat urzędu jest dobrym źródłem informacji o jego własnej decyzji.", "Popularność wpisu nie jest dowodem jego prawdziwości.", "Co sprawdzisz oprócz samego nagłówka?", "autora&datę&źródła|autora|datę"],
  ["Sztuczna inteligencja a dane", "jak działa system ai ograniczenia", "System AI przetwarza dane według zaprojektowanej metody, ale może popełniać błędy.", "Sprawdź ważne odpowiedzi w źródłach i nie wpisuj wrażliwych danych.", "Wynik automatycznego rozpoznawania trzeba zweryfikować.", "Narzędzie nie zastępuje samodzielnego myślenia ani wiedzy nauczyciela.", "Czy odpowiedź narzędzia AI zawsze jest poprawna?", "nie"]
]);

addKnowledgeCards("Wiedza o społeczeństwie", [
  ["Trójpodział władzy", "władza ustawodawcza wykonawcza sądownicza", "W Polsce władzę dzieli się na ustawodawczą, wykonawczą i sądowniczą.", "Podział ogranicza skupienie całej władzy w jednym miejscu.", "Parlament uchwala ustawy, rząd wykonuje politykę państwa, a sądy rozstrzygają sprawy.", "Instytucje współdziałają i kontrolują się w ramach prawa.", "Kto sprawuje władzę ustawodawczą w Polsce?", "parlament|sejm i senat"],
  ["Sejm i Senat", "parlament polski izby", "Parlament Rzeczypospolitej Polskiej tworzą Sejm i Senat.", "Sejm ma 460 posłów, a Senat 100 senatorów.", "Posłowie i senatorowie są wybierani w wyborach.", "Izby różnią się liczbą członków i częścią kompetencji.", "Ile izb tworzy polski parlament?", "2|dwie"],
  ["Rząd i premier", "rada ministrów prezes rady ministrów", "Rada Ministrów prowadzi politykę państwa, a jej pracami kieruje prezes Rady Ministrów.", "Ministrów powołuje się do kierowania określonymi działami administracji.", "Minister edukacji odpowiada za swój dział w ramach rządu.", "Rząd podlega kontroli parlamentarnej zgodnie z prawem.", "Kto kieruje pracami Rady Ministrów?", "premier|prezes rady ministrów"],
  ["Prezydent Rzeczypospolitej", "głowa państwa polskiego", "Prezydent jest głową państwa i pełni zadania określone w Konstytucji.", "Reprezentuje państwo oraz wykonuje kompetencje dotyczące między innymi ustaw i bezpieczeństwa.", "Prezydent może podpisać ustawę albo skorzystać z uprawnienia weta.", "Kompetencje wynikają z Konstytucji i ustaw.", "Jak nazywa się głowa państwa polskiego?", "prezydent"],
  ["Wybory demokratyczne", "zasady wyborów powszechne równe tajne", "Wybory pozwalają obywatelom wybierać przedstawicieli i wpływać na władzę.", "Ich podstawowe zasady w Polsce obejmują powszechność, równość, bezpośredniość i tajność, zależnie od rodzaju wyborów.", "Tajność głosowania chroni swobodę wyborcy.", "Szczegółowe zasady różnią się między wyborami.", "Co chroni tajność głosowania?", "swobodę wyborcy|wybór bez nacisku"],
  ["Samorząd gminny", "gmina wójt burmistrz prezydent miasta", "Gmina jest podstawową jednostką samorządu terytorialnego.", "Za jej sprawy odpowiadają wybierane władze, a urząd organizuje usługi lokalne.", "Gmina może zajmować się lokalnymi drogami i szkołami podstawowymi.", "Zakres zadań określają przepisy.", "Jak nazywa się podstawowa jednostka samorządu?", "gmina"],
  ["Powiat i województwo", "szczeble samorządu terytorialnego", "Powiat i województwo to kolejne poziomy samorządu terytorialnego.", "Realizują zadania obejmujące większy obszar niż pojedyncza gmina.", "Powiat może prowadzić szkoły ponadpodstawowe.", "Wojewoda jest przedstawicielem rządu w województwie, a nie organem samorządu.", "Który szczebel samorządu obejmuje większy obszar: gmina czy województwo?", "województwo"],
  ["Obywatelstwo", "obywatel prawa i obowiązki", "Obywatelstwo to formalna więź osoby z państwem, z której wynikają prawa i obowiązki.", "Obywatel może korzystać z praw politycznych określonych w przepisach.", "Obywatelstwo polskie można nabyć na zasadach opisanych w ustawie.", "Pobyt w kraju i obywatelstwo to różne pojęcia.", "Czy pobyt w Polsce sam w sobie zawsze oznacza obywatelstwo polskie?", "nie"],
  ["Prawa człowieka", "uniwersalne prawa człowieka", "Prawa człowieka przysługują każdej osobie ze względu na jej godność.", "Państwa mają obowiązek je szanować i chronić w granicach prawa.", "Prawo do nauki i zakaz tortur są przykładami praw człowieka.", "Prawa mogą podlegać ograniczeniom tylko na określonych zasadach.", "Komu przysługują prawa człowieka?", "każdemu|każdej osobie"],
  ["Prawo i obowiązek", "norma prawna przepisy", "Prawo ustala reguły obowiązujące w państwie, a obowiązki określają wymagane zachowania.", "Przepisy są uchwalane i stosowane przez uprawnione instytucje.", "Obowiązek szkolny dotyczy nauki dzieci i młodzieży w określonym wieku.", "Spór prawny rozwiązuj z pomocą zaufanej osoby lub specjalisty.", "Gdzie zapisane są obowiązujące reguły prawa?", "w przepisach|ustawach"],
  ["Sąd i niezależność sądów", "władza sądownicza sąd", "Sądy rozstrzygają spory i orzekają w sprawach zgodnie z prawem.", "Niezależność sądów pomaga zapewnić bezstronne rozpoznanie spraw.", "Sąd ocenia dowody i stosuje odpowiednie przepisy.", "W sprawie prawnej warto korzystać z oficjalnej informacji lub porady prawnika.", "Która władza rozstrzyga sprawy sądowe?", "sądownicza"],
  ["Podatki", "po co płacimy podatki", "Podatki są obowiązkowymi świadczeniami, które finansują wspólne zadania państwa i samorządów.", "Z podatków finansuje się między innymi szkoły, drogi i służby publiczne.", "Podatek dochodowy zależy od przepisów i sytuacji podatnika.", "Szczegóły stawek zmieniają się, więc sprawdzaj aktualne źródła urzędowe.", "Podaj jeden wspólny cel podatków.", "finansują usługi publiczne|szkoły|drogi"],
  ["Media publiczne i prywatne", "rodzaje mediów", "Media przekazują informacje i treści; mogą działać jako instytucje publiczne lub prywatne.", "Oceniaj autorstwo, finansowanie, źródła i sposób oddzielania faktów od opinii.", "Reportaż przedstawia wydarzenia, a komentarz zawiera ocenę autora.", "Różne media mogą opisywać wydarzenie z odmiennych perspektyw.", "Co warto sprawdzić przy ocenie artykułu?", "autora&źródła|autora|źródła"],
  ["Rozwiązywanie konfliktu", "mediacja rozmowa konflikt", "Konflikt można rozwiązywać przez spokojną rozmowę, wysłuchanie stron i szukanie wspólnego rozwiązania.", "Nazwij problem, opisz potrzeby i ustal możliwe kroki.", "Mediator pomaga stronom rozmawiać, ale nie narzuca decyzji.", "W sytuacji przemocy najpierw zadbaj o bezpieczeństwo i poszukaj pomocy.", "Czym zajmuje się mediator?", "pomaga stronom rozmawiać|ułatwia porozumienie"],
  ["Budżet domowy", "planowanie wydatków oszczędzanie", "Budżet porównuje dochody, wydatki i oszczędności w określonym czasie.", "Zapisuj wpływy i wydatki, grupuj je, a potem planuj rezerwę.", "Jeśli wydatki przekraczają dochody, trzeba zmienić plan.", "Przewidywanie wydatków pomaga uniknąć zadłużenia.", "Co robimy, gdy wydatki są większe od dochodów?", "zmieniamy plan|ograniczamy wydatki"]
]);

addKnowledgeCards("Muzyka i plastyka", [
  ["Rytm w muzyce", "wartości rytmiczne muzyka", "Rytm porządkuje dźwięki i pauzy w czasie.", "Słuchaj powtarzających się akcentów i grupuj uderzenia.", "Klaszcząc równomiernie, możesz odtworzyć prosty puls.", "Rytm i melodia są różnymi elementami muzyki.", "Co porządkuje dźwięki w czasie?", "rytm"],
  ["Tempo", "szybkość utworu muzycznego", "Tempo określa szybkość wykonywania utworu.", "Można je opisać słowami lub oznaczyć liczbą uderzeń na minutę.", "Allegro oznacza tempo szybkie, a largo wolne.", "Zmiana tempa może wpłynąć na nastrój utworu.", "Co opisuje tempo utworu?", "szybkość"],
  ["Dynamika w muzyce", "głośność forte piano", "Dynamika określa głośność dźwięków i jej zmiany w utworze.", "P oznacza cicho, a f głośno; więcej liter może wzmacniać oznaczenie.", "Crescendo oznacza stopniowe narastanie głośności.", "Dynamika pomaga budować nastrój i napięcie.", "Co oznacza crescendo?", "stopniowe narastanie głośności|coraz głośniej"],
  ["Melodia", "linia melodyczna", "Melodia to uporządkowany ciąg dźwięków o różnych wysokościach i rytmie.", "Można ją zanucić i rozpoznać nawet bez akompaniamentu.", "Motyw powtarzający się w piosence jest częścią melodii.", "Melodia współgra z rytmem i harmonią.", "Co tworzy melodię?", "ciąg dźwięków"],
  ["Barwy podstawowe", "kolory podstawowe plastyka", "W tradycyjnym szkolnym modelu barw farb za podstawowe uznaje się czerwony, żółty i niebieski.", "Mieszanie ich może dawać barwy pochodne.", "Żółty z niebieskim daje zielony pigment.", "Modele światła i pigmentów różnią się.", "Wymień jeden kolor podstawowy w tradycyjnym modelu farb.", "czerwony|żółty|niebieski"],
  ["Barwy pochodne", "kolory pochodne mieszanie", "Barwy pochodne powstają w wyniku mieszania wybranych barw podstawowych.", "W tradycyjnym modelu farb zielony powstaje z żółtego i niebieskiego.", "Czerwony z żółtym daje pomarańczowy.", "Dokładny efekt zależy od użytych pigmentów.", "Jaką barwę daje połączenie żółtego i niebieskiego w modelu farb?", "zieloną"],
  ["Barwy ciepłe i zimne", "temperatura barw", "Barwy ciepłe kojarzą się z ogniem i słońcem, a zimne z wodą i cieniem.", "Dobór temperatury barw wpływa na nastrój pracy.", "Pomarańczowy jest zwykle odbierany jako ciepły, a błękitny jako chłodny.", "To wrażenie artystyczne, a nie temperatura fizyczna.", "Czy błękit zwykle zaliczamy do barw ciepłych czy zimnych?", "zimnych"],
  ["Perspektywa zbieżna", "punkt zbiegu perspektywa", "Perspektywa zbieżna przedstawia głębię przez linie zbiegające się w punkcie na horyzoncie.", "Równoległe krawędzie oddalające się od widza mogą kierować się do punktu zbiegu.", "Tory kolejowe wydają się spotykać w oddali.", "Punkt zbiegu zależy od położenia obserwatora.", "Jak nazywa się punkt, w którym zbiegają się linie perspektywy?", "punkt zbiegu"],
  ["Kompozycja plastyczna", "układ elementów obrazu", "Kompozycja to sposób rozmieszczenia elementów w dziele.", "Zwróć uwagę na równowagę, rytm, kontrast i główny punkt.", "Duży jasny kształt może przyciągać wzrok jako centrum kompozycji.", "Kompozycja prowadzi uwagę odbiorcy.", "Co opisuje kompozycja?", "rozmieszczenie elementów|układ elementów"],
  ["Kontrast w sztuce", "kontrast barw kształtów", "Kontrast zestawia wyraźnie różniące się elementy.", "Może dotyczyć jasności, koloru, wielkości, kształtu lub faktury.", "Jasny obiekt na ciemnym tle jest kontrastowy.", "Kontrast może podkreślić najważniejszą część pracy.", "Podaj jeden rodzaj kontrastu.", "jasny i ciemny|kolorystyczny|wielkości"]
]);

addKnowledgeCards("Matematyka", [
  ["Odczytywanie wykresu liniowego", "wykres liniowy|zmiana na wykresie|odczytaj dane z wykresu", "Wykres liniowy pokazuje, jak wartości zmieniają się wraz z upływem czasu albo zmianą innej wielkości.", "Sprawdź tytuł, opisy osi, jednostki i skalę. Następnie porównuj punkty albo odczytuj wartość dla wybranego argumentu.", "Na wykresie temperatury odczytaj wartość dla godziny 12 i porównaj ją z godziną 9.", "Wykres pomaga zauważyć wzrost, spadek i okres bez zmian.", "Co należy najpierw sprawdzić przed odczytaniem wartości z wykresu?", "opisy osi&tytuł wykresu|skalę", "5-8"],
  ["Procentowa zmiana wielkości", "o ile procent wzrosło|spadek procentowy|zmiana o procent", "Procentową zmianę obliczamy, porównując różnicę wartości z wartością początkową.", "Najpierw oblicz różnicę, potem podziel ją przez wartość początkową i pomnóż przez 100%. Wzrost i spadek opisujemy osobno.", "Cena wzrosła z 40 zł do 50 zł. Zmiana to 10 zł, czyli 10/40 = 25% wartości początkowej.", "W zadaniu ważne jest ustalenie, która liczba jest podstawą procentu.", "Cena 80 zł spadła do 60 zł. O ile złotych i o ile procent spadła?", "20 zł&25%", "6-8"],
  ["Notacja wykładnicza", "zapis naukowy|liczba razy dziesięć do potęgi|bardzo duże liczby", "Notacja wykładnicza zapisuje liczbę jako iloczyn liczby od 1 do 10 i potęgi liczby 10.", "Przesuń przecinek tak, aby przed nim została jedna niezerowa cyfra. Liczba przesunięć określa wykładnik potęgi dziesięciu.", "3 500 000 = 3,5 × 10⁶.", "Taki zapis ułatwia porównywanie bardzo dużych i bardzo małych liczb.", "Zapisz 42 000 w notacji wykładniczej.", "4,2×10^4|4,2 × 10⁴", "7-8"]
]);

addKnowledgeCards("Język polski", [
  ["Związki frazeologiczne", "frazeologizm|utarty zwrot|znaczenie powiedzenia", "Związek frazeologiczny to utrwalone połączenie wyrazów, którego znaczenie często nie wynika wprost z pojedynczych słów.", "Wyrażenie może mieć znaczenie przenośne, dlatego odczytujemy je w kontekście.", "„Mieć muchy w nosie” znaczy być w złym humorze, a nie mieć owady w nosie.", "Frazeologizmy wzbogacają język i pomagają wyrazić myśl obrazowo.", "Co oznacza powiedzenie „mieć serce na dłoni”?", "być życzliwym|być dobrym i otwartym", "4-8"],
  ["Zgoda podmiotu z orzeczeniem", "zgodność podmiotu i orzeczenia|liczba czasownika w zdaniu", "Orzeczenie powinno zgadzać się z podmiotem między innymi w liczbie i osobie.", "Najpierw znajdź wykonawcę czynności, a potem sprawdź, czy forma czasownika do niego pasuje.", "„Uczniowie czytają”, a nie „uczniowie czyta”.", "Zgodność pomaga budować poprawne i jasne zdania.", "Popraw zdanie: „Dziewczynki biegnie do klasy”.", "dziewczynki biegną", "4-8"],
  ["Imiesłowy przymiotnikowe", "imiesłów czynny|imiesłów bierny|końcówka ący ony ty", "Imiesłowy przymiotnikowe nazywają cechę związaną z czynnością i odmieniają się podobnie jak przymiotniki.", "Czynne często mają końcówkę „-ący”, a bierne „-ny”, „-ony” lub „-ty”. Dobór formy zależy od czasownika.", "„Czytający uczeń” sam czyta, a „przeczytana książka” została przeczytana.", "Imiesłów może skrócić wypowiedź, ale powinien jasno wskazywać wykonawcę czynności.", "Wskaż imiesłów przymiotnikowy w wyrażeniu „zamknięte drzwi”.", "zamknięte|zamknięte drzwi", "7-8"],
  ["Interpretacja wiersza", "jak analizować wiersz|podmiot liryczny|sens utworu", "Interpretacja wiersza to uzasadnione odczytanie jego sensu na podstawie tekstu.", "Zwróć uwagę na osobę mówiącą, sytuację, nastrój, obrazy i środki stylistyczne. Każdy wniosek poprzyj przykładem z utworu.", "Jeśli powtarzające się słowa opisują ciszę i noc, mogą budować nastrój spokoju — sprawdź to w całym wierszu.", "Nie ma sensu zgadywać intencji autora bez dowodów w tekście.", "Czym poprzesz swoją interpretację utworu?", "przykładem z tekstu|cytatem", "5-8"]
]);

addKnowledgeCards("Język angielski", [
  ["Past Continuous", "past continuous tense|was were ing|czynność trwająca w przeszłości", "Past Continuous opisuje czynność, która trwała w określonym momencie w przeszłości.", "Budujemy go: was lub were + czasownik z końcówką -ing. Często łączy się z krótszym zdarzeniem w Past Simple.", "At 7 p.m. I was doing my homework. — O 19 odrabiałem pracę domową.", "Ten czas pomaga opisać tło zdarzenia albo czynność przerwaną przez inną.", "Uzupełnij: They ___ (play) football at five o'clock.", "were playing", "6-8"],
  ["First Conditional", "first conditional|if present simple will|realny warunek po angielsku", "First Conditional opisuje realny warunek i jego możliwy skutek w przyszłości.", "Po if używamy zwykle Present Simple, a w drugiej części will i czasownika w formie podstawowej.", "If it rains, we will stay at home. — Jeśli będzie padać, zostaniemy w domu.", "Po if w tym zdaniu nie wstawiamy will.", "Uzupełnij: If I finish early, I ___ (call) you.", "will call", "7-8"],
  ["Present Perfect a Past Simple", "różnica present perfect i past simple|ever never yesterday ago", "Past Simple mówi o zakończonym wydarzeniu w określonym czasie, a Present Perfect łączy przeszłość z teraźniejszością.", "Słowa takie jak yesterday i ago zwykle wskazują Past Simple. Doświadczenia bez podanego czasu często opisujemy Present Perfect.", "I visited London last year. / I have visited London twice.", "Najpierw poszukaj w zdaniu informacji, czy podano zakończony moment w przeszłości.", "Którego czasu użyjesz z „yesterday”: Present Perfect czy Past Simple?", "Past Simple", "7-8"],
  ["Pytania z question words po angielsku", "what where when why who which how pytajniki angielskie", "Question words służą do zadawania pytań o osobę, rzecz, miejsce, czas, powód lub sposób.", "Najczęstsze to: who, what, where, when, why i how. Zwykłe pytanie często ma szyk: słowo pytające + operator + osoba + czasownik.", "Where do you live? — Gdzie mieszkasz?", "Dobór słowa zależy od informacji, której szukamy.", "Jakiego słowa pytającego użyjesz, aby zapytać o miejsce?", "where", "4-8"]
]);

addKnowledgeCards("Biologia i przyroda", [
  ["Bioróżnorodność", "różnorodność biologiczna|różne gatunki w ekosystemie", "Bioróżnorodność oznacza bogactwo życia: różnorodność ekosystemów, gatunków i różnic między osobnikami.", "Zdrowe środowisko daje organizmom miejsca do życia, pokarm i warunki rozmnażania.", "Łąka z wieloma gatunkami roślin i owadów jest bardziej różnorodna niż trawnik z jednym gatunkiem trawy.", "Utrata siedlisk, zanieczyszczenie i zmiany klimatu mogą zmniejszać bioróżnorodność.", "Podaj jeden przykład działania, które może chronić bioróżnorodność.", "ochrona siedlisk|sadzenie rodzimych roślin", "5-8"],
  ["Ochrona zapylaczy", "pszczoły zapylanie roślin|owady zapylające", "Zapylacze przenoszą pyłek między kwiatami i umożliwiają rozmnażanie wielu roślin.", "Do zapylaczy należą między innymi pszczoły, trzmiele, motyle i niektóre muchówki.", "Sadzenie różnych kwitnących roślin może zapewniać owadom pokarm w różnych porach sezonu.", "Zapylacze wspierają przyrodę i produkcję części żywności.", "W jaki sposób owady pomagają roślinom kwiatowym?", "przenoszą pyłek|zapylają", "4-8"]
]);

addKnowledgeCards("Chemia", [
  ["Reakcja zobojętniania", "kwas i zasada|neutralizacja|kwas reaguje z zasadą", "W reakcji zobojętniania kwas reaguje z zasadą, a w uproszczonym opisie powstają sól i woda.", "To szczególny rodzaj reakcji chemicznej. W doświadczeniu nie wolno próbować substancji ani mieszać odczynników bez nadzoru nauczyciela.", "Kwas solny i wodorotlenek sodu mogą reagować, tworząc chlorek sodu i wodę.", "O przebiegu reakcji decydują konkretne reagenty i ich proporcje.", "Jakie dwie klasy substancji reagują w zobojętnianiu?", "kwas i zasada|kwas z zasadą", "7-8"]
]);

addKnowledgeCards("Geografia", [
  ["Krajobraz naturalny i przekształcony", "krajobraz kulturowy|krajobraz zmieniony przez człowieka", "Krajobraz naturalny powstał głównie pod wpływem przyrody, a przekształcony został wyraźnie zmieniony przez człowieka.", "W krajobrazie mogą współwystępować elementy przyrodnicze i zbudowane przez ludzi.", "Las z naturalnym ciekiem ma inny stopień przekształcenia niż centrum miasta z ulicami i budynkami.", "Rozpoznawanie zmian krajobrazu pomaga rozumieć wpływ człowieka na środowisko.", "Podaj jeden element krajobrazu przekształconego przez człowieka.", "droga|budynek|pole uprawne", "4-8"],
  ["Czas miejscowy i strefy czasowe", "obliczanie różnicy czasu|strefy czasowe na świecie", "Strefy czasowe porządkują czas na Ziemi według położenia względem południków.", "Przybliżenie jednej godziny na każde 15° długości geograficznej pomaga oszacować różnicę czasu; dokładne granice stref są ustalane umownie.", "Jeśli w miejscu położonym 30° na wschód jest południe, w miejscu 30° na zachód różnica może wynosić około czterech godzin.", "Przy obliczeniach sprawdź kierunek wschód–zachód i przejście przez północ lub północ.", "Dlaczego na wschód od Greenwich czas słoneczny jest zwykle późniejszy?", "Ziemia obraca się z zachodu na wschód|wschód ma późniejszy czas", "6-8"]
]);

addKnowledgeCards("Fizyka", [
  ["Prawo Ohma", "natężenie napięcie opór|zależność U I R|om", "Prawo Ohma opisuje zależność napięcia, natężenia prądu i oporu w określonych warunkach.", "Dla elementu spełniającego prawo Ohma: U = I × R. Jednostką napięcia jest wolt, natężenia amper, a oporu om.", "Przy napięciu 6 V i oporze 3 Ω natężenie wynosi I = 6/3 = 2 A.", "Zawsze zapisuj jednostki i sprawdź, czy wielkości dotyczą tego samego fragmentu obwodu.", "Jak obliczyć natężenie, gdy znasz napięcie i opór?", "podzielić napięcie przez opór|I=U/R", "8"]
]);

addKnowledgeCards("Informatyka", [
  ["Pętla z warunkiem", "powtarzaj dopóki|while loop|pętla while", "Pętla z warunkiem powtarza instrukcje, dopóki określony warunek jest spełniony.", "Warunek powinien kiedyś przestać być prawdziwy, inaczej program może zapętlić się bez końca.", "Powtarzaj dodawanie 1, dopóki licznik jest mniejszy niż 5.", "Zmienianie wartości użytej w warunku pozwala kontrolować zakończenie pętli.", "Co może się stać, jeśli warunek pętli nigdy się nie zmieni?", "pętla nie będzie się kończyć|nieskończona pętla", "5-8"]
]);

addKnowledgeCards("Fizyka", [
  ["Droga a przemieszczenie", "dystans i przesunięcie|droga w ruchu", "Droga opisuje długość przebytej trasy, a przemieszczenie zmianę położenia od startu do końca.", "Droga zależy od całej trasy i jest nieujemna. Przemieszczenie ma kierunek i może być równe zero po powrocie do punktu startu.", "Okrążenie boiska to dodatnia droga, ale zerowe przemieszczenie, jeśli kończysz tam, gdzie zaczynasz.", "To rozróżnienie pomaga poprawnie opisywać ruch.", "Po pełnym okrążeniu toru wracasz na start. Czy przemieszczenie wynosi zero?", "tak", "6-8"],
  ["Przyspieszenie", "zmiana prędkości w czasie|przyspieszenie ruchu", "Przyspieszenie opisuje, jak szybko zmienia się prędkość.", "Średnie przyspieszenie obliczamy jako zmianę prędkości podzieloną przez czas tej zmiany. Jednostką w układzie SI jest m/s².", "Jeśli prędkość wzrośnie o 6 m/s w 3 s, średnie przyspieszenie wynosi 2 m/s².", "Ujemna wartość może oznaczać zmniejszanie prędkości w przyjętym kierunku.", "Jaką jednostkę ma przyspieszenie?", "m/s2|metr na sekundę do kwadratu", "7-8"],
  ["Bezwładność", "pierwsza zasada dynamiki|ciało zachowuje ruch", "Bezwładność to tendencja ciała do zachowania dotychczasowego stanu ruchu.", "Im większa masa ciała, tym trudniej zmienić jego prędkość. Zmiana ruchu wymaga niezrównoważonej siły.", "Podczas gwałtownego hamowania pasażer pochyla się do przodu, bo jego ciało zachowuje ruch.", "Pasy bezpieczeństwa pomagają zmienić ruch ciała w kontrolowany sposób.", "Dlaczego pasażer pochyla się do przodu przy hamowaniu?", "bezwładność|ciało zachowuje ruch", "7-8"],
  ["Siła wypadkowa", "wypadkowa sił|siły działające na ciało", "Siła wypadkowa jest skutkiem wspólnego działania wszystkich sił na ciało.", "Siły o tym samym kierunku i zwrocie dodajemy, a o przeciwnych zwrotach odejmujemy ich wartości.", "Dwie siły 8 N w prawo i 3 N w lewo dają wypadkową 5 N w prawo.", "Gdy siła wypadkowa jest zerowa, prędkość ciała się nie zmienia.", "Jaką wypadkową dają siły 6 N i 6 N o przeciwnych zwrotach?", "0 N|zero", "7-8"],
  ["Zasada akcji i reakcji", "trzecia zasada dynamiki Newtona|siły wzajemnego oddziaływania", "Gdy dwa ciała oddziałują na siebie, każde działa na drugie siłą o tej samej wartości i przeciwnym zwrocie.", "Siły akcji i reakcji działają na różne ciała, dlatego się nie równoważą.", "Podczas odbicia od ściany naciskasz ścianę, a ona działa na ciebie przeciwnie skierowaną siłą.", "Siły wzajemnego oddziaływania występują parami.", "Czy siła reakcji działa na to samo ciało co siła akcji?", "nie|na drugie ciało", "7-8"],
  ["Siła wyporu", "wypór w cieczy i gazie|dlaczego przedmiot pływa", "Siła wyporu działa na ciało zanurzone w cieczy lub gazie i jest skierowana ku górze.", "Jej wartość zależy od gęstości płynu i objętości wypartego płynu.", "Łódź wypiera dużo wody, dlatego działa na nią duża siła wyporu.", "Porównanie siły wyporu z ciężarem pomaga wyjaśnić pływanie i tonięcie.", "W którą stronę działa siła wyporu?", "do góry|ku górze", "7-8"],
  ["Ciepło a temperatura", "różnica między ciepłem i temperaturą|energia cieplna", "Temperatura opisuje stan cieplny, a ciepło to energia przekazywana między ciałami z powodu różnicy temperatur.", "Ciepło przepływa samorzutnie od cieplejszego ciała do chłodniejszego, aż zbliżą się do równowagi cieplnej.", "Łyżka w gorącej herbacie ogrzewa się, bo energia przepływa z herbaty do łyżki.", "Ciepło mierzymy w dżulach, a temperaturę między innymi w stopniach Celsjusza.", "Czy temperatura i ciepło oznaczają tę samą wielkość?", "nie", "6-8"],
  ["Ciepło właściwe", "energia potrzebna do ogrzania substancji|ciepło właściwe wzór", "Ciepło właściwe określa, ile energii potrzeba, by ogrzać kilogram substancji o jeden kelwin.", "Wzór Q = m·c·ΔT łączy energię, masę, ciepło właściwe i zmianę temperatury.", "Do ogrzania 1 kg wody o 1°C potrzeba około 4200 J energii.", "Różne substancje nagrzewają się w różnym tempie przy tej samej energii.", "Co oznacza symbol c we wzorze Q = m·c·ΔT?", "ciepło właściwe", "8"],
  ["Równowaga cieplna", "wyrównanie temperatury|temperatura końcowa po zmieszaniu", "Równowaga cieplna występuje, gdy ciała stykające się nie wymieniają już netto energii cieplnej.", "W izolowanym układzie energia oddana przez cieplejsze ciało przechodzi do chłodniejszego.", "Zimna łyżka pozostawiona w ciepłej wodzie po pewnym czasie ma temperaturę zbliżoną do wody.", "Izolacja spowalnia wymianę ciepła z otoczeniem.", "W którą stronę przepływa ciepło przed osiągnięciem równowagi?", "od cieplejszego do chłodniejszego", "7-8"],
  ["Parcie cieczy", "ciśnienie hydrostatyczne|ciśnienie rośnie z głębokością", "Ciśnienie cieczy w spoczynku rośnie wraz z głębokością i gęstością cieczy.", "Wzrost ciśnienia wynika z ciężaru warstw cieczy znajdujących się wyżej.", "Na większej głębokości w basenie woda mocniej naciska na uszy.", "Zależność wykorzystuje się przy wyjaśnianiu działania tam i zbiorników.", "Gdzie ciśnienie w tej samej cieczy jest większe: płycej czy głębiej?", "głębiej", "7-8"],
  ["Zasada Archimedesa", "prawo Archimedesa|siła wyporu równa ciężarowi wypartej cieczy", "Na ciało zanurzone w płynie działa siła wyporu równa ciężarowi płynu wypartego przez to ciało.", "Wynik zależy od objętości zanurzonej części ciała i gęstości płynu.", "Ciało wypierające 100 cm³ wody wypiera wodę o masie około 100 g.", "Zasada wyjaśnia, dlaczego statki mogą pływać.", "Ciężar czego odpowiada sile wyporu według zasady Archimedesa?", "wypartego płynu|wypartej cieczy", "8"],
  ["Energia kinetyczna", "energia ruchu|energia ciała w ruchu", "Energia kinetyczna jest energią związaną z ruchem ciała.", "Zależy od masy i kwadratu prędkości: Eₖ = m·v²/2.", "Przy tej samej prędkości cięższy wózek ma większą energię kinetyczną.", "Podwojenie prędkości zwiększa energię kinetyczną czterokrotnie.", "Od jakich dwóch wielkości zależy energia kinetyczna?", "masy i prędkości", "8"],
  ["Wahadło i okres drgań", "okres drgania wahadła|czas jednego drgania", "Okres drgań to czas jednego pełnego powtórzenia ruchu.", "Oznaczamy go literą T i mierzymy w sekundach. Dla małych wychyleń okres wahadła zależy głównie od jego długości i przyspieszenia grawitacyjnego.", "Jeżeli wahadło wykonuje 10 drgań w 20 s, jego okres wynosi 2 s.", "Liczba drgań w sekundzie to częstotliwość.", "Jak obliczyć okres, jeśli 10 drgań trwa 20 s?", "2 s|2 sekundy", "7-8"],
  ["Częstotliwość drgań", "ile drgań na sekundę|częstotliwość f", "Częstotliwość mówi, ile pełnych drgań przypada na sekundę.", "Oznaczamy ją literą f, mierzymy w hercach i obliczamy jako odwrotność okresu: f = 1/T.", "Okres 0,5 s odpowiada częstotliwości 2 Hz.", "Większa częstotliwość dźwięku oznacza wyższy ton.", "Jaka jest jednostka częstotliwości?", "herc|hz", "7-8"],
  ["Długość fali", "odległość między grzbietami fali|lambda fala", "Długość fali to odległość między najbliższymi punktami fali drgającymi w tej samej fazie.", "Oznaczamy ją grecką literą λ. Dla fali poruszającej się ze stałą prędkością λ = v/f.", "Przy prędkości 10 m/s i częstotliwości 2 Hz długość fali wynosi 5 m.", "Długość fali i częstotliwość opisują inne cechy tego samego ruchu falowego.", "Jaką literą oznacza się długość fali?", "lambda|λ", "8"],
  ["Echo", "odbicie dźwięku od przeszkody|echo w górach", "Echo to dźwięk odbity od przeszkody i słyszany ponownie po krótkim czasie.", "Aby odróżnić echo od dźwięku bezpośredniego, odbicie musi dotrzeć z dostatecznym opóźnieniem.", "Krzyk odbity od odległej ściany może wrócić jako echo.", "Znając czas powrotu i prędkość dźwięku, można oszacować odległość do przeszkody.", "Od czego powstaje echo?", "od odbicia dźwięku|od przeszkody", "6-8"],
  ["Moc prądu elektrycznego", "moc urządzenia elektrycznego|waty w urządzeniach", "Moc elektryczna opisuje tempo przekazywania energii elektrycznej.", "Dla odbiornika prądu stałego P = U·I. Moc podaje się w watach.", "Urządzenie przy 6 V i 2 A ma moc 12 W.", "Większa moc oznacza większy pobór energii w tym samym czasie.", "W jakiej jednostce podaje się moc elektryczną?", "wat|waty|w", "8"],
  ["Energia elektryczna i kilowatogodzina", "rachunek za prąd|kwh energia elektryczna", "Zużyta energia zależy od mocy urządzenia i czasu jego pracy.", "E = P·t. Kilowatogodzina oznacza energię pobraną przez urządzenie o mocy 1 kW pracujące przez godzinę.", "Czajnik o mocy 2 kW pracujący 0,5 h zużyje 1 kWh energii.", "Kilowatogodzina jest jednostką energii, a nie mocy.", "Czy kWh jest jednostką energii czy mocy?", "energii", "7-8"],
  ["Bezpiecznik elektryczny", "zabezpieczenie obwodu|bezpiecznik topikowy", "Bezpiecznik przerywa obwód, gdy płynie zbyt duży prąd.", "Ogranicza ryzyko przegrzania przewodów i pożaru. Nie wolno zastępować go drutem ani naprawiać instalacji pod napięciem.", "Przeciążony obwód może wyłączyć bezpiecznik.", "Urządzenia sieciowe naprawia wyłącznie osoba z odpowiednimi kwalifikacjami.", "Co robi bezpiecznik, gdy prąd jest zbyt duży?", "przerywa obwód|wyłącza obwód", "6-8"],
  ["Obraz w zwierciadle płaskim", "odbicie w lustrze|lustro płaskie obraz", "Zwierciadło płaskie tworzy obraz pozorny, prosty i tej samej wielkości co przedmiot.", "Obraz wydaje się znajdować za lustrem w takiej samej odległości, w jakiej przedmiot znajduje się przed nim.", "Gdy stoisz 1 m od lustra, obraz pozornie znajduje się 1 m za jego powierzchnią.", "Promienie światła odbijają się zgodnie z prawem odbicia.", "Czy obraz w zwykłym płaskim lustrze jest rzeczywisty czy pozorny?", "pozorny", "7-8"],
  ["Zaćmienie Słońca i Księżyca", "zaćmienie słońca|zaćmienie księżyca", "Zaćmienie powstaje, gdy ciała niebieskie ustawiają się tak, że jedno zasłania światło docierające do drugiego.", "Przy zaćmieniu Słońca Księżyc znajduje się między Ziemią a Słońcem. Przy zaćmieniu Księżyca Ziemia znajduje się między Słońcem a Księżycem.", "Podczas całkowitego zaćmienia Księżyca cień Ziemi pada na Księżyc.", "Zaćmienie Słońca można obserwować wyłącznie z użyciem właściwego, certyfikowanego filtra.", "Co znajduje się między Ziemią a Słońcem podczas zaćmienia Słońca?", "Księżyc", "6-8"]
]);

addKnowledgeCards("Fizyka", [
  ["Ruch jednostajny prostoliniowy", "stała prędkość po prostej|ruch bez przyspieszenia", "W ruchu jednostajnym prostoliniowym ciało porusza się po linii prostej ze stałą prędkością.", "W równych odstępach czasu pokonuje równe drogi. Wypadkowa sił jest równa zeru.", "W 5 sekund ciało pokonuje po 2 m w każdej sekundzie: razem 10 m.", "Wykres drogi od czasu jest linią prostą.", "Czy prędkość zmienia się w ruchu jednostajnym?", "nie|jest stała", "6-8"],
  ["Ruch jednostajnie przyspieszony", "stałe przyspieszenie|zmiana prędkości co sekundę", "W ruchu jednostajnie przyspieszonym prędkość zmienia się w równych odstępach czasu o taką samą wartość.", "Przyspieszenie jest stałe. Dla startu z bezruchu prędkość po czasie t wynosi v = a·t.", "Przy przyspieszeniu 2 m/s² prędkość rośnie o 2 m/s w każdej sekundzie.", "W ruchu opóźnionym wartość prędkości maleje.", "Co pozostaje stałe w ruchu jednostajnie przyspieszonym?", "przyspieszenie", "7-8"],
  ["Grawitacja i ciężar", "siła ciężkości|ciężar ciała wzór", "Grawitacja przyciąga ciała mające masę, a ciężar jest siłą, z jaką ciało naciska na podparcie lub napina zawieszenie.", "W pobliżu powierzchni Ziemi wartość siły ciężkości obliczamy w przybliżeniu jako F = m·g.", "Dla 1 kg na Ziemi ciężar wynosi około 9,8 N, często zaokrąglane do 10 N.", "Masa i ciężar są różnymi wielkościami fizycznymi.", "W jakiej jednostce mierzymy ciężar jako siłę?", "niuton|n", "7-8"],
  ["Siła sprężystości", "sprężyna wraca do kształtu|prawo Hooke'a", "Siła sprężystości pojawia się, gdy odkształcone ciało dąży do powrotu do wcześniejszego kształtu.", "Dla niewielkich odkształceń sprężyny siła jest proporcjonalna do jej wydłużenia.", "Rozciągnięta sprężyna ciągnie końce z powrotem ku sobie.", "Nie wolno przekraczać bezpiecznego zakresu odkształcenia materiału.", "W którą stronę działa siła sprężystości względem odkształcenia?", "przeciwnie|przeciwnie do odkształcenia", "7-8"],
  ["Tarcie statyczne i kinetyczne", "tarcie podczas poślizgu|tarcie przed ruchem", "Tarcie przeciwdziała względnemu przesuwaniu się stykających powierzchni.", "Tarcie statyczne może zapobiec rozpoczęciu ruchu, a kinetyczne występuje podczas poślizgu.", "Tarcie między butem i podłożem pomaga chodzić.", "Tarcie może być pożyteczne, ale powoduje też zużycie i ogrzewanie.", "Który rodzaj tarcia działa, zanim przedmiot zacznie się ślizgać?", "tarcie statyczne", "6-8"],
  ["Ciśnienie atmosferyczne", "nacisk powietrza|barometr", "Ciśnienie atmosferyczne wynika z nacisku powietrza otaczającego Ziemię.", "Mierzy się je barometrem. Wartość zmienia się między innymi z wysokością i pogodą.", "Na szczycie góry ciśnienie atmosferyczne jest zwykle niższe niż nad morzem.", "Powietrze ma masę i wywiera nacisk, choć zwykle go nie zauważamy.", "Jak nazywa się przyrząd do pomiaru ciśnienia atmosferycznego?", "barometr", "7-8"],
  ["Rozszerzalność cieplna", "ciała zwiększają rozmiar przy ogrzewaniu|dylatacja", "Większość ciał zwiększa swoje wymiary podczas ogrzewania i zmniejsza je podczas ochładzania.", "Zmiana rozmiaru zależy od materiału, pierwotnego wymiaru i zmiany temperatury.", "Mosty mają szczeliny dylatacyjne, które pozwalają konstrukcji bezpiecznie zmieniać długość.", "Woda ma nietypowe zachowanie w pobliżu temperatury zamarzania.", "Po co w mostach pozostawia się szczeliny dylatacyjne?", "na rozszerzalność cieplną|zmiany długości", "7-8"],
  ["Ciepło topnienia i parowania", "energia zmiany stanu skupienia|ciepło przemiany", "Podczas zmiany stanu skupienia czysta substancja może pobierać lub oddawać energię bez zmiany temperatury.", "Energia jest zużywana na zmianę uporządkowania i oddziaływań między drobinami.", "Lód topniejący w temperaturze 0°C pobiera energię, choć jego temperatura pozostaje wtedy bliska 0°C.", "Do odparowania potrzeba energii; skraplanie ją oddaje.", "Czy podczas topnienia lodu w temperaturze topnienia temperatura musi rosnąć?", "nie", "7-8"],
  ["Współczynnik załamania światła", "światło zmienia kierunek w szkle|załamanie światła współczynnik", "Współczynnik załamania opisuje, jak światło zwalnia w ośrodku w porównaniu z próżnią.", "Dla ośrodka n = c/v, gdzie c to prędkość światła w próżni, a v w ośrodku.", "Światło biegnie wolniej w szkle niż w powietrzu, dlatego na granicy może zmienić kierunek.", "Zmiana kierunku zależy też od kąta padania i rodzaju ośrodków.", "Co opisuje współczynnik załamania?", "jak zmienia się prędkość światła w ośrodku", "8"],
  ["Prawo odbicia światła", "kąt padania równy kątowi odbicia|promień odbity", "Prawo odbicia mówi, że kąt padania jest równy kątowi odbicia.", "Oba kąty mierzymy od prostej prostopadłej do powierzchni, czyli normalnej.", "Gładkie lustro odbija światło kierunkowo.", "Na chropowatej powierzchni promienie odbijają się w wielu kierunkach.", "Od jakiej linii mierzymy kąty padania i odbicia?", "od normalnej|od prostej prostopadłej", "6-8"],
  ["Soczewka i ognisko", "punkt skupienia promieni|ogniskowa soczewki", "Ognisko soczewki skupiającej to punkt, w którym zbiegają się promienie biegnące równolegle do osi optycznej.", "Odległość ogniska od środka soczewki nazywamy ogniskową.", "Lupa skupia światło i może tworzyć powiększony obraz przedmiotu znajdującego się blisko.", "Nie wolno skupiać światła słonecznego na skórze ani materiale łatwopalnym.", "Jak nazywa się odległość ogniska od soczewki?", "ogniskowa", "7-8"],
  ["Pole magnetyczne", "obszar działania magnesu|linie pola magnetycznego", "Pole magnetyczne to obszar, w którym działają siły magnetyczne.", "Umowny kierunek linii pola na zewnątrz magnesu biegnie od bieguna północnego do południowego.", "Opiłki żelaza układają się wzdłuż linii pola wokół magnesu.", "Linie pola nie przecinają się i są gęstsze tam, gdzie pole jest silniejsze.", "Od którego bieguna do którego biegną umowne linie pola na zewnątrz magnesu?", "od północnego do południowego", "7-8"],
  ["Elektromagnes", "cewka z prądem i rdzeń|magnes zasilany prądem", "Elektromagnes wytwarza pole magnetyczne dzięki przepływowi prądu przez cewkę.", "Żelazny rdzeń wzmacnia pole, a po wyłączeniu prądu pole zwykle słabnie.", "Elektromagnesy działają w dzwonkach i niektórych urządzeniach dźwigowych.", "Siłę elektromagnesu można zmieniać między innymi przez zmianę prądu i liczby zwojów.", "Co wytwarza pole magnetyczne w cewce elektromagnesu?", "prąd elektryczny", "7-8"],
  ["Przewodnik i izolator elektryczny", "materiał przewodzący prąd|izolacja elektryczna", "Przewodnik pozwala ładunkom elektrycznym przemieszczać się łatwiej niż izolator.", "Metale są zwykle dobrymi przewodnikami, a tworzywa sztuczne i suche drewno izolatorami.", "Metalowy przewód przewodzi prąd, a jego plastikowa osłona ogranicza ryzyko porażenia.", "Woda i zabrudzenia mogą zmienić bezpieczeństwo izolacji.", "Który materiał zwykle jest izolatorem: miedź czy plastik?", "plastik", "6-8"],
  ["Ładunek elektryczny", "elektryzowanie przez tarcie|ładunek dodatni i ujemny", "Ładunek elektryczny jest właściwością materii odpowiedzialną za oddziaływania elektryczne.", "Wyróżniamy ładunki dodatnie i ujemne; ładunki jednoimienne się odpychają, a różnoimienne przyciągają.", "Potarty balon może przyciągać lekkie skrawki papieru.", "Ładunek całkowity układu izolowanego jest zachowany.", "Jak zachowują się dwa ładunki jednoimienne?", "odpychają się", "7-8"],
  ["Energia w obwodzie szeregowym i równoległym", "różnica połączenia szeregowego i równoległego", "W obwodzie szeregowym elementy są połączone jeden za drugim, a w równoległym każda gałąź tworzy osobną drogę dla prądu.", "Przerwanie jedynej drogi w obwodzie szeregowym wyłącza wszystkie odbiorniki; w równoległym pozostałe gałęzie mogą nadal działać.", "Domowe lampy zwykle łączy się równolegle, aby działały niezależnie.", "Schemat obwodu pozwala odczytać drogi przepływu prądu.", "W którym połączeniu odbiorniki mają osobne gałęzie?", "równoległym", "7-8"],
  ["Wolt jako jednostka napięcia", "jednostka napięcia elektrycznego|symbol V", "Wolt (V) jest jednostką napięcia elektrycznego.", "Napięcie opisuje różnicę potencjałów między punktami obwodu.", "Bateria AA ma napięcie nominalne około 1,5 V.", "Napięcie samo w sobie nie określa natężenia bez znajomości obwodu.", "Jakim symbolem oznacza się wolt?", "V", "6-8"],
  ["Amper jako jednostka natężenia", "jednostka prądu elektrycznego|symbol A", "Amper (A) jest jednostką natężenia prądu elektrycznego.", "Natężenie mówi, jaki ładunek przepływa przez przekrój przewodnika w jednostce czasu.", "Prąd o natężeniu 2 A przenosi ładunek 2 C w każdej sekundzie.", "Natężenie mierzy się amperomierzem włączonym szeregowo.", "Jakim symbolem oznacza się amper?", "A", "7-8"],
  ["Om jako jednostka oporu", "jednostka rezystancji|symbol omega", "Om (Ω) jest jednostką oporu elektrycznego.", "Opór opisuje, jak bardzo element ogranicza przepływ prądu.", "Wartość 10 Ω oznacza opór dziesięciu omów.", "W prostym obwodzie omowym R = U/I.", "Jak nazywa się jednostka oporu?", "om|omega", "8"],
  ["Dżul jako jednostka energii", "jednostka pracy i energii|symbol J", "Dżul (J) jest jednostką energii i pracy w układzie SI.", "Jeden dżul pracy wykonuje siła 1 N przesuwająca ciało o 1 m w swoim kierunku.", "Podniesienie małego przedmiotu wymaga wykonania pracy i przekazania mu energii.", "Energia może zmieniać postać, ale w układzie izolowanym jest zachowana.", "Jakim symbolem oznacza się dżul?", "J", "6-8"],
  ["Wat jako jednostka mocy", "jednostka mocy|symbol W", "Wat (W) jest jednostką mocy, czyli szybkości wykonywania pracy lub przekazywania energii.", "Jeden wat odpowiada jednemu dżulowi na sekundę.", "Urządzenie o mocy 60 W przekazuje 60 J energii w ciągu sekundy.", "Wata nie należy mylić z watogodziną, jednostką energii.", "Ile dżuli na sekundę odpowiada jednemu watowi?", "jeden", "6-8"],
  ["Herc jako jednostka częstotliwości", "jednostka drgań na sekundę|symbol Hz", "Herc (Hz) jest jednostką częstotliwości.", "Jeden herc oznacza jedno pełne powtórzenie zjawiska w ciągu sekundy.", "Częstotliwość 5 Hz oznacza pięć drgań w sekundzie.", "Wysokość tonu dźwięku zależy od częstotliwości drgań źródła.", "Ile drgań na sekundę oznacza 1 Hz?", "jedno", "6-8"]
]);

addKnowledgeCards("Chemia", [
  ["Model cząsteczkowy materii", "z czego zbudowana jest substancja|cząsteczki są w ruchu", "Substancje składają się z drobin, które są w ciągłym ruchu.", "Odległości i ruch drobin pomagają wyjaśniać właściwości ciał oraz różnice między stanami skupienia.", "Zapach perfum rozchodzi się po pokoju, bo drobiny poruszają się i mieszają z powietrzem.", "Model drobinowy łączy obserwacje makroskopowe z budową materii.", "Czy drobiny substancji w gazie pozostają nieruchome?", "nie", "7-8"],
  ["Izotopy", "atomy tego samego pierwiastka różne neutrony|izotop atomu", "Izotopy to atomy tego samego pierwiastka o tej samej liczbie protonów, ale różnej liczbie neutronów.", "Mają ten sam numer atomowy, lecz różną liczbę masową.", "Węgiel-12 i węgiel-14 to izotopy węgla.", "Niektóre izotopy są trwałe, a inne promieniotwórcze.", "Czym różnią się izotopy jednego pierwiastka?", "liczbą neutronów", "8"],
  ["Izomery i odmiany alotropowe", "odmiany alotropowe pierwiastka|diament i grafit", "Odmiany alotropowe to różne formy tego samego pierwiastka w tym samym stanie skupienia.", "Ich atomy są połączone lub uporządkowane w odmienny sposób, dlatego mogą mieć różne właściwości.", "Diament i grafit są odmianami alotropowymi węgla.", "Różnica w budowie może silnie zmienić twardość i przewodnictwo.", "Podaj dwie odmiany alotropowe węgla.", "diament i grafit", "8"],
  ["Współczynnik stechiometryczny", "liczba przed wzorem w równaniu|uzgadnianie równania reakcji", "Współczynnik stechiometryczny pokazuje liczbę cząsteczek lub jednostek substancji w równaniu reakcji.", "Uzgadniając równanie, zmieniamy współczynniki przed wzorami, a nie indeksy we wzorach.", "2H₂ + O₂ → 2H₂O ma współczynniki 2, 1 i 2.", "Liczba atomów każdego pierwiastka musi być taka sama po obu stronach równania.", "Czy przy uzgadnianiu zmieniamy indeks we wzorze wody?", "nie", "8"],
  ["Reakcja syntezy", "reakcja łączenia|synteza chemiczna", "Synteza to reakcja, w której z kilku substratów powstaje jeden produkt.", "Ogólny zapis ma postać A + B → AB.", "Wodór i tlen mogą reagować, tworząc wodę.", "Liczba atomów każdego pierwiastka nadal musi się zgadzać po obu stronach równania.", "Ile produktów powstaje w typowej reakcji syntezy?", "jeden", "7-8"],
  ["Reakcja rozkładu", "analiza chemiczna|rozkład związku na prostsze substancje", "Rozkład to reakcja, w której jedna substancja rozpada się na dwie lub więcej prostszych substancji.", "Ogólny schemat można zapisać jako AB → A + B.", "Pod wpływem ogrzewania niektóre związki rozkładają się na prostsze produkty.", "Do rozkładu może być potrzebna energia, na przykład ciepło lub światło.", "Ile substratów występuje zwykle w reakcji rozkładu?", "jeden", "7-8"],
  ["Reakcja wymiany", "reakcja podstawienia|wymiana składników reakcji", "W reakcji wymiany składniki dwóch substancji zamieniają się partnerami.", "W uproszczonym schemacie AB + CD → AD + CB; rzeczywisty przebieg zależy od reagujących substancji.", "Reakcje kwasów z zasadami są przykładem szczególnej reakcji wymiany.", "Trzeba sprawdzić, czy produkty rzeczywiście mogą powstać w danym układzie.", "Co dzieje się ze składnikami w reakcji wymiany?", "zamieniają się partnerami|wymieniają się", "8"],
  ["Stężenie procentowe roztworu", "obliczanie procentów roztworu|ile substancji w roztworze", "Stężenie procentowe mówi, ile gramów substancji rozpuszczonej przypada na 100 g roztworu.", "Obliczamy je jako masę substancji podzieloną przez masę roztworu i pomnożoną przez 100%.", "10 g soli w 100 g roztworu daje stężenie 10%.", "Masa roztworu to masa substancji rozpuszczonej i rozpuszczalnika razem.", "Ile gramów substancji jest w 100 g roztworu 5-procentowego?", "5 g", "8"],
  ["Roztwór nasycony", "nasycenie roztworu|czy można rozpuścić więcej substancji", "Roztwór nasycony zawiera maksymalną ilość substancji, która może rozpuścić się w danych warunkach.", "Rozpuszczalność zależy od substancji, temperatury i czasem ciśnienia.", "Gdy do nasyconej wody dosypiesz więcej soli, część może pozostać na dnie.", "Zmiana temperatury może zmienić rozpuszczalność wielu substancji.", "Czy w nasyconym roztworze można bez końca rozpuszczać więcej substancji?", "nie", "7-8"],
  ["Kwasy i zasady w roztworach", "odczyn kwasowy i zasadowy|kwas a zasada", "Roztwory kwasów mają odczyn kwasowy, a roztwory zasad — zasadowy.", "Odczyn sprawdzamy wskaźnikiem lub pH-metrem; nigdy nie rozpoznajemy substancji przez próbowanie.", "Sok z cytryny ma odczyn kwasowy, a roztwór mydła zwykle zasadowy.", "Pojęcie mocnego kwasu ma ścisłe znaczenie chemiczne i nie oznacza po prostu stężonego roztworu.", "Jak bezpiecznie sprawdza się odczyn roztworu w pracowni?", "wskaźnikiem|papierkiem wskaźnikowym", "7-8"],
  ["Tlenki", "związek pierwiastka z tlenem|tlenek chemia", "Tlenki to związki chemiczne tlenu z innym pierwiastkiem.", "Wzór tlenku zależy od składu związku i wartościowości lub ładunków łączących się atomów.", "Dwutlenek węgla CO₂ jest tlenkiem węgla.", "Niektóre tlenki reagują z wodą, tworząc kwasy lub zasady.", "Z jakim pierwiastkiem połączony jest tlen w CO₂?", "węglem", "7-8"],
  ["Wodorotlenki", "zasady i wodorotlenki|grupa OH", "Wodorotlenki zawierają kation metalu i grupę wodorotlenową OH.", "Nie każdy wodorotlenek dobrze rozpuszcza się w wodzie. Rozpuszczalne wodorotlenki tworzą zasady.", "Wodorotlenek sodu zapisujemy NaOH.", "Nie wolno dotykać ani mieszać odczynników bez polecenia i nadzoru nauczyciela.", "Jaki wzór ma wodorotlenek sodu?", "NaOH", "7-8"],
  ["Sole", "sól chemiczna|kation i anion soli", "Sole to związki zbudowane z kationów metalu lub amonu oraz anionów reszty kwasowej.", "Wiele soli powstaje podczas reakcji kwasu z zasadą, ale istnieją też inne drogi ich otrzymywania.", "Chlorek sodu ma wzór NaCl.", "Sól kuchenna to tylko jeden przykład dużej grupy związków.", "Jaki wzór ma chlorek sodu?", "NaCl", "8"],
  ["Węglowodory", "związki węgla i wodoru|alkany alkeny alkiny", "Węglowodory to związki chemiczne zbudowane wyłącznie z węgla i wodoru.", "Należą do nich między innymi alkany, alkeny i alkiny, które różnią się typem wiązań.", "Metan CH₄ jest najprostszym alkanem.", "Wiele węglowodorów jest palnych; pracę z nimi prowadzi się zgodnie z zasadami bezpieczeństwa.", "Z jakich pierwiastków zbudowane są węglowodory?", "węgla i wodoru", "8"],
  ["Spalanie całkowite i niecałkowite", "niedobór tlenu przy spalaniu|tlenek węgla czad", "Spalanie całkowite zachodzi przy dostatecznej ilości tlenu, a niecałkowite przy jego niedoborze.", "Produkty zależą od reagenta i warunków; przy niecałkowitym spalaniu węgla może powstać trujący tlenek węgla.", "Nieprawidłowy dopływ powietrza do pieca może zwiększać ryzyko powstania czadu.", "Czad jest bezbarwny i bezwonny; w razie alarmu należy opuścić miejsce i wezwać pomoc.", "Jaki niebezpieczny gaz może powstać przy niecałkowitym spalaniu węgla?", "tlenek węgla|czad", "8"],
  ["Korozja żelaza", "rdzewienie|jak powstaje rdza", "Korozja to stopniowe niszczenie materiału wskutek reakcji ze środowiskiem.", "Żelazo koroduje szczególnie łatwo w obecności wody i tlenu; sól może przyspieszać ten proces.", "Farba lub powłoka ochronna ogranicza dostęp wody i tlenu do żelaza.", "Ochrona przed korozją wydłuża trwałość mostów, pojazdów i narzędzi.", "Jak można ograniczyć rdzewienie żelaza?", "pokryć warstwą ochronną|odizolować od wody i tlenu", "7-8"],
  ["Gazy cieplarniane", "dwutlenek węgla metan klimat|efekt cieplarniany", "Gazy cieplarniane pochłaniają i emitują promieniowanie podczerwone, wpływając na bilans energii Ziemi.", "Do gazów cieplarnianych należą między innymi para wodna, dwutlenek węgla, metan i podtlenek azotu.", "Spalanie paliw kopalnych zwiększa stężenie dwutlenku węgla w atmosferze.", "Naturalny efekt cieplarniany umożliwia życie; jego wzmacnianie przez człowieka zmienia klimat.", "Podaj jeden gaz cieplarniany.", "dwutlenek węgla|metan|para wodna", "7-8"],
  ["Zasady bezpieczeństwa w pracowni chemicznej", "piktogramy chemiczne|bezpieczne doświadczenie", "Bezpieczna praca z chemikaliami wymaga stosowania poleceń nauczyciela, ochrony oczu i właściwego postępowania z odczynnikami.", "Nie próbuj substancji, nie wąchaj ich bezpośrednio i nie mieszaj nieznanych preparatów.", "Rozlany odczynnik zgłasza się nauczycielowi zamiast samodzielnie go wycierać.", "Piktogramy ostrzegawcze informują o konkretnym rodzaju zagrożenia.", "Co zrobisz, jeśli nieznana substancja rozleje się na stanowisku?", "powiem nauczycielowi|zgłoszę nauczycielowi", "4-8"]
]);

addKnowledgeCards("Fizyka", [
  ["Układ odniesienia", "względność ruchu|względem czego ciało się porusza", "Ruch opisujemy względem wybranego układu odniesienia, na przykład drogi, budynku albo jadącego pojazdu.", "To samo ciało może spoczywać względem jednego obiektu i poruszać się względem innego.", "Pasażer siedzi nieruchomo względem autobusu, ale przemieszcza się względem przystanku.", "Zanim nazwiesz ciało poruszającym się, określ punkt odniesienia.", "Czy pasażer autobusu porusza się względem siedzenia?", "nie|spoczywa względem siedzenia", "5-8"],
  ["Tor ruchu", "trajektoria ciała|kształt drogi ruchu", "Tor ruchu to linia, po której porusza się ciało.", "Tor może być prostoliniowy lub krzywoliniowy; droga jest długością przebytej części toru.", "Piłka kopnięta po łuku porusza się po torze krzywoliniowym.", "Kształt toru zależy od ruchu i przyjętego układu odniesienia.", "Jaki tor ma ciało poruszające się po prostej?", "prostoliniowy|po linii prostej", "5-8"],
  ["Prędkość a szybkość", "różnica prędkości i szybkości|kierunek ruchu", "Szybkość mówi, jak szybko ciało pokonuje drogę, a prędkość w fizyce może uwzględniać także kierunek ruchu.", "W prostych zadaniach szkolnych często obliczamy wartość prędkości ze wzoru v = s/t.", "Samochód jadący 50 km/h na północ i 50 km/h na południe ma taką samą szybkość, lecz inny kierunek prędkości.", "Wielkość z kierunkiem nazywamy wektorową.", "Co odróżnia prędkość wektorową od samej szybkości?", "kierunek|kierunek ruchu", "7-8"],
  ["Średnia prędkość całej podróży", "średnia prędkość z kilku odcinków|łączna droga i czas", "Średnią prędkość z całej podróży liczymy, dzieląc łączną drogę przez łączny czas.", "Nie dodajemy po prostu prędkości z poszczególnych odcinków; trzeba uwzględnić, ile czasu trwał każdy odcinek.", "Jeśli 60 km zajęło 1 h, a kolejne 60 km 2 h, średnia wynosi 120 km ÷ 3 h = 40 km/h.", "Postój wliczamy do czasu, jeśli pytanie dotyczy całej podróży.", "Co dzielimy przez całkowity czas, aby znaleźć średnią prędkość?", "całkowitą drogę|łączną drogę", "7-8"],
  ["Wykres drogi od czasu w fizyce", "wykres s(t)|nachylenie wykresu ruchu", "Wykres drogi od czasu pokazuje, jak zmienia się położenie lub droga wraz z czasem.", "Linia pozioma oznacza brak zmiany położenia; większe nachylenie w prostym ruchu oznacza większą szybkość.", "Jeśli w 2 s droga rośnie o 6 m, szybkość na tym odcinku wynosi 3 m/s.", "Zawsze odczytaj skalę i jednostki obu osi.", "Co oznacza poziomy wykres drogi od czasu?", "spoczynek|brak zmiany położenia", "6-8"],
  ["Przeliczanie km/h na m/s", "zamiana kilometrów na godzinę na metry na sekundę|jednostki prędkości", "Aby zamienić km/h na m/s, dzielimy wartość przez 3,6; w drugą stronę mnożymy przez 3,6.", "Wynika to z tego, że 1 km = 1000 m, a 1 h = 3600 s.", "36 km/h = 10 m/s, bo 36 ÷ 3,6 = 10.", "W zadaniu porównuj prędkości zapisane w tych samych jednostkach.", "Ile m/s to 72 km/h?", "20 m/s|20", "6-8"],
  ["Masa i ciężar ciała", "masa a siła ciężkości|kilogram a niuton", "Masa opisuje ilość materii i jest podawana w kilogramach, a ciężar jest siłą grawitacji działającą na ciało i mierzy się go w niutonach.", "W szkolnych zadaniach blisko powierzchni Ziemi ciężar można oszacować jako Fg = m·g, gdzie g ≈ 10 N/kg.", "Ciało o masie 2 kg ma na Ziemi ciężar około 20 N.", "Masa nie zmienia się przy przeniesieniu na Księżyc, ale ciężar tam jest mniejszy.", "W jakiej jednostce mierzymy ciężar jako siłę?", "niuton|n", "7-8"],
  ["Ciśnienie jako siła na powierzchnię", "wzór na ciśnienie|p równa się F przez S", "Ciśnienie określa, jak duża siła naciska na jednostkę powierzchni.", "Obliczamy je ze wzoru p = F/S; jednostką jest paskal, czyli N/m².", "Tę samą siłę łatwiej wywierać na miękkie podłoże ostrym końcem, bo mniejsza powierzchnia daje większe ciśnienie.", "Przed podstawieniem sprawdź, czy siła jest w niutonach, a powierzchnia w metrach kwadratowych.", "Jak zmieni się ciśnienie, gdy ta sama siła działa na mniejszą powierzchnię?", "wzrośnie|będzie większe", "7-8"],
  ["Barometr i manometr", "przyrząd do pomiaru ciśnienia|pomiar ciśnienia gazu", "Barometr służy do pomiaru ciśnienia atmosferycznego, a manometr mierzy ciśnienie gazu lub cieczy w układzie.", "Wynik pomiaru zapisujemy razem z jednostką, na przykład paskalem lub hektopaskalem.", "Prognozy pogody często podają ciśnienie atmosferyczne w hPa.", "Przyrząd trzeba odczytać zgodnie z jego skalą.", "Który przyrząd mierzy ciśnienie atmosferyczne?", "barometr", "6-8"],
  ["Prawo Pascala i urządzenia hydrauliczne", "prasa hydrauliczna|ciśnienie w cieczy zamkniętej", "Zmiana ciśnienia wywierana na ciecz zamkniętą rozchodzi się w niej we wszystkich kierunkach.", "W urządzeniu hydraulicznym mała siła na małym tłoku może równoważyć większą siłę na większym tłoku, kosztem większej drogi ruchu.", "Podnośnik hydrauliczny wykorzystuje ciśnienie przekazywane przez ciecz.", "Urządzenie nie tworzy energii; zamienia siłę i drogę jej działania.", "Co przenosi nacisk między tłokami w układzie hydraulicznym?", "ciecz|ciśnienie cieczy", "8"],
  ["Warunek pływania ciała", "kiedy przedmiot pływa|siła wyporu i ciężar", "Ciało pływa, gdy siła wyporu może równoważyć jego ciężar.", "O zachowaniu ciała decyduje też jego średnia gęstość w porównaniu z gęstością płynu.", "Statek z pustymi przestrzeniami ma średnią gęstość mniejszą niż gęstość wody, choć jest zbudowany z metalu.", "Kształt i objętość wypartej wody wpływają na siłę wyporu.", "Jakie dwie siły równoważą się, gdy ciało spokojnie pływa?", "siła wyporu i ciężar", "7-8"],
  ["Praca mechaniczna a siła", "kiedy siła wykonuje pracę|wzór praca siła droga", "W fizyce praca jest wykonywana, gdy siła powoduje przesunięcie ciała w kierunku swojego działania.", "Dla stałej siły w tym samym kierunku W = F·s; pracę mierzymy w dżulach.", "Siła 5 N przesuwająca pudełko o 2 m wykonuje pracę 10 J.", "Samo trzymanie ciężkiej torby nieruchomo nie oznacza pracy mechanicznej w tym sensie.", "Jaka praca powstaje, gdy siła 4 N przesuwa przedmiot o 3 m?", "12 J|12 dżuli", "7-8"],
  ["Sprawność urządzenia", "sprawność energetyczna|energia użyteczna i dostarczona", "Sprawność mówi, jaka część dostarczonej energii staje się energią użyteczną.", "Obliczamy ją jako energię użyteczną podzieloną przez dostarczoną i mnożymy przez 100%.", "Jeśli z 100 J energii 80 J staje się użyteczne, sprawność wynosi 80%.", "Pozostała energia najczęściej rozprasza się, na przykład jako ciepło lub dźwięk.", "Czy sprawność rzeczywistego urządzenia może przekroczyć 100%?", "nie", "8"],
  ["Zasada zachowania energii", "energia nie ginie|przemiana energii", "Energia nie znika ani nie powstaje z niczego; może zmieniać formę i być przekazywana między ciałami.", "W rzeczywistych procesach część energii użytecznej często rozprasza się do otoczenia, na przykład w postaci ciepła.", "Podczas spadania energia potencjalna grawitacji zmienia się głównie w kinetyczną.", "W opisie układu uwzględnij wszystkie formy energii i wymianę z otoczeniem.", "Czy energia może samoczynnie zniknąć?", "nie|zmienia formę", "7-8"],
  ["Izolacja cieplna", "jak ograniczyć utratę ciepła|izolator cieplny", "Izolacja cieplna spowalnia przekazywanie energii między ciałem a otoczeniem.", "Powietrze uwięzione w materiale, na przykład w wełnie lub piance, słabo przewodzi ciepło.", "Termos ma warstwy ograniczające przewodzenie, konwekcję i promieniowanie.", "Izolacja spowalnia wymianę, ale zwykle nie zatrzymuje jej całkowicie.", "Dlaczego puchowa kurtka pomaga utrzymać ciepło?", "zatrzymuje warstwę powietrza|ogranicza utratę ciepła", "4-8"],
  ["Parowanie a chłodzenie", "dlaczego pot chłodzi|parowanie zabiera energię", "Podczas parowania najbardziej energetyczne drobiny opuszczają ciecz, dlatego pozostała ciecz i jej otoczenie mogą się ochładzać.", "Szybkość parowania rośnie między innymi przy większej powierzchni, ruchu powietrza i wyższej temperaturze.", "Mokra skóra chłodzi się, gdy woda z niej paruje.", "Parowanie zachodzi także poniżej temperatury wrzenia.", "Dlaczego mokra skóra może się ochładzać?", "woda paruje i pobiera energię|parowanie", "7-8"],
  ["Elektromierz i zużycie energii", "licznik energii elektrycznej|zużycie prądu w domu", "Licznik energii elektrycznej rejestruje energię pobraną przez instalację, zwykle w kilowatogodzinach.", "Koszt zależy od zużytej energii i stawki za jednostkę; sama moc urządzenia nie mówi jeszcze, ile energii zużyje.", "Urządzenie 1 kW działające przez 2 h zużywa 2 kWh.", "Energia elektryczna to moc pomnożona przez czas pracy.", "W jakiej jednostce domowy licznik zwykle podaje zużytą energię?", "kilowatogodzinie|kwh", "6-8"],
  ["Amperomierz w obwodzie", "jak podłączyć amperomierz|pomiar natężenia prądu", "Amperomierz mierzy natężenie prądu i włącza się go szeregowo z elementem, przez który płynie mierzony prąd.", "W szkolnych doświadczeniach stosuj właściwy zakres miernika i wykonuj pomiary pod nadzorem nauczyciela.", "Aby zmierzyć prąd przez żarówkę, amperomierz włączamy w ten sam szeregowy tor obwodu.", "Nie podłączaj miernika bezpośrednio do gniazdka ani źródła sieciowego.", "Jak włącza się amperomierz względem badanego odbiornika?", "szeregowo", "7-8"],
  ["Woltomierz w obwodzie", "jak podłączyć woltomierz|pomiar napięcia", "Woltomierz mierzy napięcie między dwoma punktami i podłącza się go równolegle do badanego elementu.", "Przed pomiarem wybierz właściwy rodzaj i zakres napięcia na mierniku.", "Aby zmierzyć napięcie żarówki, końcówki woltomierza przykładamy do jej dwóch zacisków.", "Pomiary wykonuj na bezpiecznych zestawach szkolnych, zgodnie z poleceniami nauczyciela.", "Jak podłączamy woltomierz do żarówki?", "równolegle", "7-8"],
  ["Zwarcie elektryczne", "co to jest zwarcie|nadmierny prąd w obwodzie", "Zwarcie powstaje, gdy prąd otrzymuje drogę o bardzo małym oporze, omijając zwykły odbiornik.", "Może wtedy popłynąć bardzo duży prąd, który nagrzewa przewody i stwarza ryzyko pożaru.", "Uszkodzona izolacja przewodów może doprowadzić do zwarcia.", "Zabezpieczenia instalacji powinny odłączyć obwód; nie wolno samodzielnie naprawiać przewodów pod napięciem.", "Dlaczego zwarcie może być niebezpieczne?", "może popłynąć bardzo duży prąd|przewody mogą się przegrzać", "7-8"],
  ["Uziemienie i bezpieczeństwo instalacji", "przewód ochronny|po co jest uziemienie", "Uziemienie i przewód ochronny pomagają odprowadzić niebezpieczny prąd w razie uszkodzenia urządzenia.", "Instalacje sieciowe wymagają właściwych zabezpieczeń i pracy osób z kwalifikacjami.", "Metalowa obudowa urządzenia z uszkodzoną izolacją może znaleźć się pod napięciem; nie dotykaj jej i zgłoś problem dorosłemu.", "Nie otwieraj gniazdek ani urządzeń zasilanych z sieci.", "Komu zgłosisz uszkodzone urządzenie elektryczne?", "dorosłemu|nauczycielowi|opiekunowi", "6-8"],
  ["Elektryzowanie przez tarcie", "ładunki elektryczne przez pocieranie|naelektryzowany balon", "Podczas pocierania niektóre materiały mogą wymieniać elektrony i uzyskać ładunki elektryczne.", "Ładunki jednoimienne się odpychają, a różnoimienne przyciągają.", "Potarty balon może przyciągać drobne skrawki papieru.", "Ładunek nie powstaje z niczego — przenosi się między ciałami.", "Jak zachowują się ładunki różnoimienne?", "przyciągają się", "6-8"],
  ["Linie pola magnetycznego", "jak rysujemy pole magnesu|linie pola magnetycznego", "Linie pola magnetycznego umownie pokazują kierunek i względną siłę pola.", "Poza magnesem biegną od bieguna północnego do południowego; nie przecinają się.", "Opilki żelaza wokół magnesu układają się w charakterystyczny wzór pola.", "Rysunek pola jest modelem, a linie nie są fizycznymi nitkami.", "Czy linie pola magnetycznego mogą się przecinać?", "nie", "7-8"],
  ["Co wzmacnia elektromagnes", "jak zwiększyć siłę elektromagnesu|zwoje i rdzeń", "Elektromagnes powstaje, gdy prąd płynie przez zwojnicę; jego działanie można zmieniać.", "Większa liczba zwojów i żelazny rdzeń zwykle wzmacniają pole w prostym szkolnym elektromagnesie.", "Włączony elektromagnes może przyciągać spinacze, a po wyłączeniu jego działanie słabnie.", "Doświadczenia wykonuj przy bezpiecznym, niskim napięciu i nie zwieraj źródła.", "Podaj jeden sposób na zwiększenie pola elektromagnesu.", "zwiększyć liczbę zwojów|dodać żelazny rdzeń", "7-8"],
  ["Dźwięk potrzebuje ośrodka", "czy dźwięk rozchodzi się w próżni|fale dźwiękowe", "Dźwięk jest falą mechaniczną, która rozchodzi się dzięki drganiom cząstek ośrodka.", "Może rozchodzić się w gazach, cieczach i ciałach stałych, ale nie w próżni.", "W kosmosie nie usłyszymy bezpośrednio wybuchu, bo między ciałami nie ma powietrza przenoszącego dźwięk.", "Cząstki przekazują drgania dalej; same nie muszą przebywać całej drogi fali.", "Czy dźwięk rozchodzi się w próżni?", "nie", "6-8"],
  ["Amplituda i głośność dźwięku", "co wpływa na głośność dźwięku|amplituda fali", "Większa amplituda drgań fali dźwiękowej zwykle oznacza głośniejszy dźwięk.", "Głośność odczuwana przez człowieka zależy także od częstotliwości i wrażliwości słuchu.", "Mocniejsze uderzenie w bęben powoduje większe drgania jego membrany.", "Wysokość tonu zależy głównie od częstotliwości, a nie od amplitudy.", "Co zwykle zwiększa amplituda fali dźwiękowej?", "głośność", "6-8"],
  ["Rozszczepienie światła białego", "tęcza pryzmat kolory światła|widmo światła", "Światło białe składa się z wielu barw, które mogą się rozdzielić podczas załamania.", "Krople wody i pryzmat załamują różne barwy pod nieco innymi kątami.", "Tęcza powstaje, gdy światło Słońca załamuje się i odbija w kroplach wody.", "Kolory widma przechodzą płynnie jeden w drugi.", "Z jakich barw składa się światło białe?", "z wielu barw|z widma", "6-8"],
  ["Cień i półcień", "jak powstaje cień|przeszkoda zasłania światło", "Cień powstaje, gdy nieprzezroczyste ciało blokuje światło docierające do powierzchni.", "Przy większym źródle światła lub kilku źródłach może powstać też półcień, do którego dociera część światła.", "Drzewo rzuca cień, bo jego korona zasłania część promieni słonecznych.", "Kształt cienia zależy od źródła światła, przeszkody i ekranu.", "Co musi znaleźć się na drodze światła, by powstał cień?", "nieprzezroczysta przeszkoda", "4-8"],
  ["Fazy Księżyca", "dlaczego Księżyc zmienia kształt|nów i pełnia", "Fazy Księżyca wynikają ze zmiany widocznej z Ziemi części jego oświetlonej półkuli.", "Księżyc nie świeci własnym światłem widzialnym; odbija światło Słońca.", "W pełni widzimy prawie całą oświetloną tarczę, a podczas nowiu jej ciemną stronę.", "Fazy nie są skutkiem cienia Ziemi; jej cień powoduje zaćmienie Księżyca.", "Co oświetla Księżyc?", "Słońce|światło Słońca", "5-8"],
  ["Ruch obrotowy Ziemi i dzień", "dlaczego jest dzień i noc|obrót Ziemi", "Ziemia obraca się wokół własnej osi, a ta część jej powierzchni, która jest zwrócona ku Słońcu, ma dzień.", "Pełny obrót trwa około doby; obrót Ziemi wyjaśnia pozorną wędrówkę Słońca po niebie.", "Gdy w Polsce jest dzień, po przeciwnej stronie Ziemi może być noc.", "Dzień i noc nie wynikają z obiegania Słońca.", "Jaki ruch Ziemi powoduje następowanie dnia i nocy?", "ruch obrotowy|obrót wokół osi", "5-8"],
  ["Ruch obiegowy Ziemi i pory roku", "dlaczego są pory roku|nachylenie osi Ziemi", "Pory roku wynikają z obiegu Ziemi wokół Słońca oraz nachylenia osi Ziemi.", "Nachylenie sprawia, że w różnych porach roku półkule otrzymują różną ilość światła i ciepła.", "Gdy półkula północna jest nachylona ku Słońcu, ma lato, a południowa wtedy zimę.", "Pory roku nie wynikają głównie ze zmiany odległości Ziemi od Słońca.", "Co oprócz obiegu Ziemi wokół Słońca jest ważne dla pór roku?", "nachylenie osi Ziemi", "6-8"],
  ["Planeta a gwiazda", "różnica między gwiazdą i planetą", "Gwiazda świeci dzięki energii powstającej w jej wnętrzu, a planeta krąży wokół gwiazdy i zwykle świeci odbitym światłem.", "Słońce jest gwiazdą, a Ziemia planetą Układu Słonecznego.", "Planeta może wyglądać jasno na niebie, bo odbija światło Słońca.", "Obserwowany blask nie oznacza, że obiekt sam wytwarza światło.", "Który obiekt Układu Słonecznego jest gwiazdą?", "Słońce", "4-8"]
]);

addKnowledgeCards("Chemia", [
  ["Zmiana fizyczna a chemiczna", "różnica przemiany fizycznej i chemicznej|czy powstała nowa substancja", "Zmiana fizyczna zmienia stan, kształt lub rozdrobnienie substancji, a zmiana chemiczna prowadzi do powstania innych substancji.", "Samo rozpuszczenie lub stopienie nie zawsze oznacza reakcję chemiczną; szukaj dowodów powstania nowych produktów.", "Topnienie lodu jest zmianą fizyczną, a rdzewienie żelaza chemiczną.", "Zmiana barwy lub wydzielanie gazu może być wskazówką, ale należy ocenić cały przebieg.", "Czy topnienie lodu tworzy nową substancję?", "nie", "4-8"],
  ["Substraty i produkty reakcji", "co jest substratem a co produktem|lewa i prawa strona równania", "Substraty to substancje wyjściowe, które reagują, a produkty to substancje powstałe w reakcji.", "W zapisie równania substraty stoją po lewej stronie strzałki, a produkty po prawej.", "W 2H₂ + O₂ → 2H₂O wodór i tlen są substratami, a woda produktem.", "Strzałka oznacza kierunek przemiany, nie znak równości liczby cząsteczek.", "Po której stronie strzałki zapisuje się produkty?", "po prawej", "7-8"],
  ["Uzgadnianie równania reakcji", "bilansowanie równań chemicznych|dobieranie współczynników", "Równanie reakcji uzgadniamy tak, aby po obu stronach była taka sama liczba atomów każdego pierwiastka.", "Zmieniamy współczynniki przed wzorami, a nigdy indeksy w samym wzorze substancji.", "2H₂ + O₂ → 2H₂O ma po obu stronach 4 atomy wodoru i 2 atomy tlenu.", "Po uzgodnieniu policz atomy każdego pierwiastka ponownie.", "Co zmieniamy podczas uzgadniania równania: współczynnik czy indeks we wzorze?", "współczynnik", "8"],
  ["Najczęstsze wzory kwasów", "wzory kwasu solnego siarkowego azotowego", "W szkolnych przykładach często spotyka się kwas chlorowodorowy HCl, siarkowy(VI) H₂SO₄, azotowy(V) HNO₃ i węglowy H₂CO₃.", "Wzór pokazuje rodzaj i liczbę atomów w cząsteczce; nazwy i stopnie utlenienia poznaje się stopniowo.", "HCl zawiera wodór i chlor, a H₂SO₄ — wodór, siarkę i tlen.", "Nie próbuj ani nie dotykaj kwasów laboratoryjnych; pracuj tylko według poleceń nauczyciela.", "Jaki wzór ma kwas siarkowy(VI)?", "H2SO4|H₂SO₄", "8"],
  ["Kwas a zasada", "jak odróżnić kwas od zasady|odczyn kwasowy zasadowy", "Kwas i zasada to różne grupy substancji; ich roztwory mogą mieć odczyn odpowiednio kwasowy lub zasadowy.", "Odczyn określa się wskaźnikiem lub pH-metrem, nigdy przez smakowanie.", "Sok cytrynowy ma odczyn kwasowy, a roztwór mydła zwykle zasadowy.", "Właściwości zależą od konkretnej substancji i stężenia roztworu.", "Jak bezpiecznie sprawdzić, czy roztwór ma odczyn kwasowy?", "wskaźnikiem|papierkiem wskaźnikowym|ph-metrem", "7-8"],
  ["Jak odczytać skalę pH", "pH poniżej 7 powyżej 7|odczyn obojętny", "W uproszczonym szkolnym ujęciu pH poniżej 7 wskazuje odczyn kwasowy, pH 7 obojętny, a powyżej 7 zasadowy.", "Skala pH jest logarytmiczna, więc różnica jednej jednostki oznacza dziesięciokrotną zmianę stężenia jonów wodorowych.", "Roztwór o pH 3 jest bardziej kwasowy niż roztwór o pH 5.", "Wynik dotyczy roztworu w określonych warunkach i temperaturze.", "Jaki odczyn ma roztwór o pH 9?", "zasadowy", "7-8"],
  ["Fenoloftaleina i papierek wskaźnikowy", "kolory wskaźników chemicznych|jak używać wskaźnika", "Wskaźniki zmieniają barwę zależnie od odczynu roztworu.", "Papierek uniwersalny porównuje się ze skalą barw, a fenoloftaleina przyjmuje malinową barwę w roztworze zasadowym.", "Papierek można zwilżyć badaną próbką zgodnie z instrukcją doświadczenia.", "Kolor interpretuje się z legendą konkretnego wskaźnika; nie wszystkie wskaźniki działają tak samo.", "W jakim odczynie fenoloftaleina staje się malinowa?", "zasadowym", "7-8"],
  ["Reakcja egzotermiczna i endotermiczna", "reakcja oddaje lub pobiera ciepło|energia reakcji", "Reakcja egzotermiczna przekazuje energię do otoczenia, a endotermiczna pobiera ją z otoczenia.", "O zmianie energii można wnioskować między innymi z kontrolowanego pomiaru temperatury.", "Spalanie jest zwykle reakcją egzotermiczną, a niektóre rozkłady wymagają stałego ogrzewania.", "Nie oceniaj reakcji przez dotykanie naczynia; stosuj bezpieczny pomiar i nadzór.", "Czy reakcja egzotermiczna oddaje czy pobiera energię z otoczenia?", "oddaje|przekazuje", "8"],
  ["Wykrywanie tlenu w doświadczeniu", "jak wykryć tlen|żarzące łuczywo", "Tlen podtrzymuje spalanie, dlatego w doświadczeniu szkolnym jego obecność sprawdza się odpowiednią metodą pod nadzorem nauczyciela.", "Żarzące się łuczywo może ponownie się rozpalić w atmosferze bogatszej w tlen.", "Tlen sam nie jest paliwem, ale umożliwia intensywniejsze spalanie wielu substancji.", "Doświadczenia z ogniem i gazami wykonuje wyłącznie nauczyciel lub klasa pod jego bezpośrednim nadzorem.", "Czy tlen jest paliwem?", "nie|podtrzymuje spalanie", "7-8"],
  ["Wykrywanie dwutlenku węgla", "próba z wodą wapienną|jak rozpoznać co2", "Dwutlenek węgla można rozpoznać w szkolnym doświadczeniu między innymi po zmętnieniu wody wapiennej.", "Reakcja tworzy trudno rozpuszczalny węglan wapnia, który powoduje mleczne zmętnienie.", "CO₂ powstaje między innymi podczas oddychania i spalania węgla w tlenie.", "Nie wdychaj gazów z doświadczeń; przeprowadzaj je tylko według instrukcji i pod nadzorem.", "Jaki widoczny efekt może dać CO₂ w wodzie wapiennej?", "zmętnienie|mętna woda", "8"],
  ["Stop metali", "co to jest stop|brąz mosiądz stal", "Stop to materiał złożony z co najmniej dwóch składników, z których przynajmniej jeden jest metalem.", "Skład stopu dobiera się, by uzyskać użyteczne właściwości, takie jak większa twardość lub odporność na korozję.", "Stal jest stopem na bazie żelaza i węgla, a mosiądz zawiera miedź i cynk.", "Stop jest mieszaniną, a nie pojedynczym pierwiastkiem.", "Z jakich głównych składników powstaje mosiądz?", "miedzi i cynku", "7-8"],
  ["Woda jako rozpuszczalnik", "co rozpuszcza woda|substancje rozpuszczalne i nierozpuszczalne", "Woda dobrze rozpuszcza wiele substancji polarnych i jonowych, ale nie rozpuszcza wszystkiego.", "Rozpuszczanie tworzy mieszaninę jednorodną; olej i woda po wymieszaniu tworzą osobne warstwy.", "Sól kuchenna rozpuszcza się w wodzie, a piasek pozostaje widoczny.", "Mieszanina jednorodna nie oznacza, że substancja zniknęła.", "Czy każda substancja rozpuszcza się w wodzie?", "nie", "4-8"],
  ["Filtracja a destylacja", "jak rozdzielić mieszaniny|różnica filtracji destylacji", "Filtracja zatrzymuje nierozpuszczalne cząstki, a destylacja wykorzystuje różnice temperatur wrzenia i skraplanie pary.", "Metodę dobieramy do właściwości składników mieszaniny.", "Piasek oddzielimy od wody filtrem, a czystą wodę z roztworu soli można otrzymać przez destylację.", "Sama filtracja nie usuwa rozpuszczonej soli z wody.", "Która metoda oddzieli piasek od wody?", "filtracja", "6-8"],
  ["Metale przewodzą ciepło i prąd", "właściwości metali|przewodnictwo metali", "Wiele metali dobrze przewodzi prąd i ciepło, a także można je formować.", "Przewodnictwo wynika z budowy metalu; różne metale mają różne właściwości i zastosowania.", "Miedź wykorzystuje się w przewodach, a aluminium w lekkich konstrukcjach.", "Nie każdy srebrzysty materiał jest metalem i nie każdy metal jest bezpieczny w każdej sytuacji.", "Dlaczego miedź stosuje się w przewodach elektrycznych?", "dobrze przewodzi prąd", "6-8"],
  ["Grupa i okres w układzie okresowym", "wiersz i kolumna układu okresowego", "Okres to poziomy wiersz układu okresowego, a grupa to pionowa kolumna.", "Położenie pierwiastka pomaga porządkować informacje o jego budowie i podobieństwie właściwości.", "Lit i sód znajdują się w tej samej grupie i mają podobne niektóre właściwości chemiczne.", "Samo położenie nie zastępuje znajomości szczegółów reakcji.", "Jak nazywa się pionowa kolumna układu okresowego?", "grupa", "7-8"],
  ["Elektrony walencyjne", "elektrony na zewnętrznej powłoce|wartościowość", "Elektrony walencyjne znajdują się na zewnętrznej powłoce atomu i uczestniczą w tworzeniu wiązań.", "W prostych modelach szkolnych pomagają przewidywać, jak atomy łączą się w związki.", "Atom sodu łatwo oddaje jeden elektron, tworząc jon Na⁺.", "Pełniejszy opis wiązań wymaga modelu elektronowego, a nie tylko reguły oktetu.", "Które elektrony atomu biorą udział w tworzeniu wiązań?", "walencyjne", "8"],
  ["Polimery i tworzywa sztuczne", "czym są polimery|plastik recykling", "Polimery to bardzo duże cząsteczki zbudowane z powtarzających się fragmentów; wiele tworzyw sztucznych jest polimerami.", "Różne tworzywa mają różne właściwości i oznaczenia, dlatego segreguje się je zgodnie z lokalnymi zasadami.", "Polietylen stosuje się między innymi w opakowaniach, a nylon w włóknach.", "Ograniczanie jednorazowych produktów i poprawne sortowanie zmniejsza ilość odpadów.", "Z jakich powtarzających się elementów zbudowany jest polimer?", "fragmentów|jednostek", "7-8"],
  ["Substancje organiczne w życiu codziennym", "chemia organiczna w jedzeniu|cukry tłuszcze białka", "Wiele substancji zawierających węgiel spotykamy w żywności, paliwach, lekach i materiałach.", "Cukry, tłuszcze i białka są przykładami ważnych związków organicznych; nie każdy związek węgla zalicza się jednak do organicznych.", "Glukoza jest cukrem o wzorze C₆H₁₂O₆.", "Nazwa „organiczny” w chemii nie oznacza automatycznie, że produkt jest naturalny lub zdrowy.", "Podaj jeden przykład grupy związków organicznych w żywności.", "cukry|tłuszcze|białka", "7-8"]
]);

addKnowledgeCards("Matematyka", [
  ["Największy wspólny dzielnik", "NWD|największy dzielnik wspólny", "Największy wspólny dzielnik dwóch liczb to największa liczba, która dzieli obie bez reszty.", "Można wypisać dzielniki albo rozłożyć liczby na czynniki pierwsze i wybrać wspólne czynniki.", "Dzielniki 18 i 24 mają wspólną największą wartość 6, więc NWD(18, 24) = 6.", "NWD pomaga skracać ułamki i rozwiązywać zadania o równym podziale.", "Jaki jest NWD liczb 12 i 20?", "4", "4-8"],
  ["Najmniejsza wspólna wielokrotność", "NWW|najmniejsza wspólna wielokrotnosc liczb", "Najmniejsza wspólna wielokrotność dwóch liczb to najmniejsza dodatnia liczba będąca wielokrotnością obu.", "Można wypisać kolejne wielokrotności albo skorzystać z rozkładu na czynniki pierwsze.", "Wielokrotności 4 i 6 spotykają się po raz pierwszy przy 12, zatem NWW(4, 6) = 12.", "NWW wykorzystujemy między innymi przy sprowadzaniu ułamków do wspólnego mianownika.", "Jaka jest najmniejsza wspólna wielokrotność 3 i 5?", "15", "4-8"],
  ["Cecha podzielności przez 6", "liczba podzielna przez 6|podzielnosc przez szesc", "Liczba dzieli się przez 6 wtedy i tylko wtedy, gdy dzieli się jednocześnie przez 2 i przez 3.", "Sprawdź ostatnią cyfrę, a potem sumę cyfr. Oba warunki muszą być spełnione.", "516 kończy się cyfrą parzystą, a 5 + 1 + 6 = 12; dlatego 516 dzieli się przez 6.", "Łączenie cech podzielności pozwala szybko sprawdzać większe liczby.", "Czy 234 dzieli się przez 6? Uzasadnij dwoma warunkami.", "tak&jest parzysta&dzieli się przez 3", "4-6"],
  ["Wartość wyrażenia algebraicznego", "podstawianie do wyrażenia|oblicz wartosc wyrazenia", "Wartość wyrażenia algebraicznego otrzymujemy, podstawiając za litery podane liczby i wykonując działania we właściwej kolejności.", "Najpierw podstawiaj liczby z nawiasami, a potem obliczaj według kolejności działań.", "Dla a = 3 wyrażenie 2a + 5 ma wartość 2 · 3 + 5 = 11.", "Zapisuj podstawienie w nawiasach, szczególnie gdy liczba jest ujemna.", "Oblicz 3x − 2 dla x = 4.", "10", "5-8"],
  ["Pole powierzchni prostopadłościanu", "pole powierzchni bryly|pole scian prostopadloscianu", "Pole powierzchni prostopadłościanu jest sumą pól wszystkich jego ścian.", "Dla krawędzi a, b i c wzór to P = 2ab + 2ac + 2bc. Wynik zapisujemy w jednostkach kwadratowych.", "Dla krawędzi 2 cm, 3 cm i 4 cm pole wynosi 2·6 + 2·8 + 2·12 = 52 cm².", "Nie myl pola powierzchni z objętością bryły.", "Ile par równych ścian ma prostopadłościan?", "trzy|3", "5-8"],
  ["Objętość graniastosłupa prostego", "objetosc graniastoslupa|pole podstawy razy wysokosc", "Objętość graniastosłupa prostego obliczamy, mnożąc pole podstawy przez wysokość.", "Wzór V = Pp · H działa dla graniastosłupów o dowolnym wielokącie w podstawie. Jednostką jest jednostka sześcienna.", "Pole podstawy wynosi 12 cm², a wysokość 5 cm, więc objętość to 60 cm³.", "Wysokość graniastosłupa jest odległością między jego podstawami.", "Jak obliczysz objętość, jeśli pole podstawy to 8 cm², a wysokość 3 cm?", "24 cm3|24", "6-8"],
  ["Odczytywanie diagramu kołowego", "wykres kolowy|diagram kolowy procenty", "Diagram kołowy pokazuje, jak części składają się na całość.", "Całe koło odpowiada 100% i 360°. Porównuj udziały, odczytując legendę oraz opis danych.", "Ćwiartka koła przedstawia jedną czwartą całości, czyli 25% i 90°.", "Zawsze sprawdź, czego dotyczy całość i jakie wartości opisuje legenda.", "Jaki procent całości przedstawia połowa diagramu kołowego?", "50%|polowe", "5-8"],
  ["Proporcjonalność prosta", "wprost proporcjonalne wielkosci|cena za kilogram", "Dwie wielkości są wprost proporcjonalne, gdy ich iloraz jest stały.", "Jeśli jedną wielkość pomnożymy przez daną liczbę, druga zmieni się tyle samo razy.", "Przy stałej cenie kilogram jabłek kosztuje 4 zł, więc 3 kg kosztują 12 zł.", "Najpierw sprawdź, czy warunki zadania rzeczywiście utrzymują stały przelicznik.", "Jeśli 2 zeszyty kosztują 10 zł, ile kosztuje 6 takich zeszytów?", "30 zł|30", "5-8"],
  ["Suma kątów wewnętrznych wielokąta", "ile wynosi suma katow wielokata|wzor na katy wielokata", "Sumę kątów wewnętrznych n-kąta można obliczyć ze wzoru (n − 2) · 180°.", "Wielokąt dzielimy przekątnymi z jednego wierzchołka na n − 2 trójkąty.", "Suma kątów pięciokąta wynosi (5 − 2) · 180° = 540°.", "Wzór dotyczy wypukłego wielokąta.", "Jaka jest suma kątów wewnętrznych sześciokąta?", "720 stopni|720", "7-8"],
  ["Potęgi o tej samej podstawie", "mnozenie i dzielenie poteg o tej samej podstawie", "Przy mnożeniu potęg o tej samej podstawie dodajemy wykładniki, a przy dzieleniu odejmujemy wykładniki.", "aᵐ · aⁿ = aᵐ⁺ⁿ, a aᵐ : aⁿ = aᵐ⁻ⁿ dla a różnego od zera w dzieleniu.", "2³ · 2² = 2⁵ = 32.", "Nie dodawaj podstaw; łączymy wykładniki tylko wtedy, gdy podstawa jest taka sama.", "Uprość 5² · 5³.", "5 do potegi 5|5^5|3125", "7-8"]
]);

addKnowledgeCards("Język polski", [
  ["Podmiot i orzeczenie", "podmiot orzeczenie czesci zdania|kto co robi w zdaniu", "Podmiot wskazuje, o kim lub o czym jest zdanie, a orzeczenie informuje, co podmiot robi lub w jakim jest stanie.", "Orzeczenie najczęściej jest osobową formą czasownika. Podmiot może być wyrażony rzeczownikiem, zaimkiem albo pominięty.", "W zdaniu „Uczniowie czytają” podmiotem są uczniowie, a orzeczeniem — czytają.", "Znalezienie orzeczenia często ułatwia rozpoznanie podmiotu.", "W zdaniu „Pies szczeka” wskaż podmiot i orzeczenie.", "pies&szczeka", "4-8"],
  ["Zdanie pojedyncze i złożone", "ile orzeczen zdanie pojedyncze zlozone", "Zdanie pojedyncze ma jedno orzeczenie, a zdanie złożone zawiera co najmniej dwa orzeczenia.", "Policz osobowe formy czasowników; zdania składowe mogą być połączone spójnikiem lub znakiem interpunkcyjnym.", "„Pada deszcz” jest pojedyncze, a „Pada deszcz, więc zostaję w domu” jest złożone.", "Nie oceniaj wyłącznie po długości wypowiedzi — liczy się liczba orzeczeń.", "Ile orzeczeń ma zdanie złożone?", "co najmniej dwa|2", "4-8"],
  ["Przydawka i dopełnienie", "czesci zdania przydawka dopelnienie", "Przydawka określa rzeczownik, a dopełnienie uzupełnia treść czasownika lub przymiotnika.", "Przydawka odpowiada między innymi na pytania jaki?, czyj?, który? Dopełnienie odpowiada na pytania przypadków poza mianownikiem.", "W „czytam ciekawą książkę”: ciekawą jest przydawką, a książkę — dopełnieniem.", "Pytanie zadawaj od wyrazu, który dana część zdania określa.", "Jaką funkcję pełni wyraz „ciekawą” w wyrażeniu „ciekawą książkę”?", "przydawka", "5-8"],
  ["Epitet", "srodek stylistyczny epitet|okreslenie rzeczownika w poezji", "Epitet to określenie, które uwydatnia cechę osoby, rzeczy lub zjawiska.", "Najczęściej jest przymiotnikiem połączonym z rzeczownikiem, ale może mieć też inną formę.", "W wyrażeniu „złota jesień” słowo „złota” jest epitetem.", "Epitet może opisywać dosłowną cechę albo budować obraz poetycki.", "Wskaż epitet w wyrażeniu „cichy wieczór”.", "cichy", "4-8"],
  ["Metafora i znaczenie przenośne", "metafora przenosnia|znaczenie niedoslowne", "Metafora łączy słowa w znaczeniu przenośnym, tworząc nowy obraz lub sens.", "Nie odczytuj jej dosłownie. Zastanów się, jakie skojarzenie i emocję buduje w kontekście.", "„Morze świateł” nie oznacza prawdziwego morza, lecz bardzo wiele świateł.", "Interpretację uzasadnij konkretnymi słowami z utworu.", "Czy wyrażenie „morze świateł” należy rozumieć dosłownie?", "nie", "5-8"],
  ["Rozprawka", "jak napisac rozprawke teza argument przyklad", "Rozprawka przedstawia stanowisko wobec problemu i uzasadnia je argumentami.", "Wstęp wprowadza temat i tezę lub hipotezę, rozwinięcie podaje argumenty z przykładami, a zakończenie zbiera wnioski.", "Do tezy „Warto pomagać innym” można podać argument i przykład z lektury lub życia.", "Argument powinien wyjaśniać, dlaczego teza jest słuszna; sam przykład nie zastępuje uzasadnienia.", "Co powinno uzasadniać tezę w rozprawce?", "argumenty", "6-8"],
  ["Plan wydarzeń i streszczenie", "jak zrobic plan wydarzen streszczenie lektury", "Plan wydarzeń zapisuje najważniejsze zdarzenia w kolejności, a streszczenie krótko opowiada ich przebieg.", "Wybieraj tylko kluczowe fakty, zachowuj kolejność i pomijaj własne oceny oraz mało ważne szczegóły.", "Punktem planu może być „Bohater odnajduje list”, a streszczenie łączy takie punkty w spójną wypowiedź.", "Nie dopisuj wydarzeń, których nie ma w utworze.", "Czy plan wydarzeń powinien zachowywać kolejność zdarzeń?", "tak", "4-8"],
  ["Uzasadnianie interpretacji lektury", "jak uzasadnic interpretacje tekstu lektury dowod z tekstu", "Interpretację utworu trzeba uzasadniać wydarzeniami, wypowiedziami bohaterów lub innymi szczegółami tekstu.", "Najpierw postaw wniosek, potem wskaż dowód z utworu i wyjaśnij, jak go potwierdza.", "Wniosek, że bohater jest odważny, poprzyj konkretną decyzją podjętą w trudnej sytuacji.", "Oddzielaj fakt z lektury od własnej opinii o postaci.", "Czym poprzesz wniosek o bohaterze?", "dowodem z tekstu|wydarzeniem z utworu|wypowiedzia bohatera", "4-8"]
]);

addKnowledgeCards("Historia", [
  ["Chrzest Polski i Mieszko I", "966 chrzest polski|mieszko pierwszy chrzest", "Chrzest Mieszka I w 966 roku włączył jego państwo do kręgu kultury chrześcijańskiej.", "Było to wydarzenie religijne i polityczne, które wzmacniało pozycję władcy oraz kontakty z sąsiadami.", "Rok 966 jest umowną datą początku państwa polskiego przyjmowaną w szkolnej chronologii.", "W średniowieczu przyjęcie chrześcijaństwa miało także znaczenie dla organizacji państwa.", "W którym roku tradycyjnie datuje się chrzest Mieszka I?", "966", "5-8"],
  ["Zjazd gnieźnieński", "zjazd gnieznienski 1000 otton trzeci boleslaw chrobry", "W 1000 roku w Gnieźnie spotkali się cesarz Otton III i Bolesław Chrobry.", "Zjazd wiązał się z kultem świętego Wojciecha i powstaniem polskiej organizacji kościelnej z arcybiskupstwem w Gnieźnie.", "Utworzenie arcybiskupstwa wzmacniało niezależność kościelną państwa Bolesława.", "Rozróżniaj sam fakt spotkania od późniejszych interpretacji jego symboliki.", "W którym roku odbył się zjazd gnieźnieński?", "1000", "5-8"],
  ["Kazimierz Wielki", "kazimierz wielki panowanie polska XIV wiek", "Kazimierz Wielki panował w Polsce w latach 1333–1370 i umocnił państwo po okresie rozbicia dzielnicowego.", "W jego czasach rozwijały się miasta, prawo i fortyfikacje. W 1364 roku założono w Krakowie uniwersytet.", "Akademia Krakowska, późniejszy Uniwersytet Jagielloński, powstała w 1364 roku.", "Przy wyjaśnianiu rozwoju państwa łącz wydarzenia z ich skutkami.", "W którym mieście i roku powstała Akademia Krakowska?", "Krakowie&1364", "5-8"],
  ["Unia w Krewie", "unia w krewie 1385 jagiello polska litwa", "Unia w Krewie z 1385 roku rozpoczęła związek Polski i Litwy związany z małżeństwem Jadwigi i Jagiełły.", "Jagiełło przyjął chrzest i został królem Polski jako Władysław II Jagiełło. Związek obu państw zmieniał układ sił w regionie.", "Unia poprzedziła wspólne działania Polski i Litwy, między innymi w wojnie z zakonem krzyżackim.", "Nie utożsamiaj unii personalnej z późniejszą wspólną Rzecząpospolitą Obojga Narodów.", "W którym roku zawarto unię w Krewie?", "1385", "6-8"],
  ["Wojna polsko-bolszewicka i Bitwa Warszawska", "1920 bitwa warszawska cud nad wisla", "Bitwa Warszawska w sierpniu 1920 roku była jednym z kluczowych starć wojny polsko-bolszewickiej.", "Zatrzymanie natarcia Armii Czerwonej miało znaczenie dla obrony niepodległości Polski i przebiegu wojny.", "Współczesne opracowania analizują zarówno decyzje wojskowe, jak i szerszy kontekst konfliktu.", "Porównuj mapy, wspomnienia i opracowania, bo źródła mogą opisywać wydarzenie z różnych perspektyw.", "W którym roku rozegrała się Bitwa Warszawska?", "1920", "8"],
  ["II wojna światowa — początek i koniec", "daty drugiej wojny swiatowej 1939 1945", "II wojna światowa trwała w latach 1939–1945.", "W Europie rozpoczęła się niemieckim atakiem na Polskę 1 września 1939 roku; zakończyła się w 1945 roku po kapitulacji państw Osi.", "Kampania wrześniowa była początkiem wojny w Europie, ale konflikt szybko objął wiele kontynentów.", "Oddzielaj daty, przyczyny i skutki; nie sprowadzaj wojny do jednego wydarzenia.", "W którym roku zakończyła się II wojna światowa?", "1945", "8"],
  ["Solidarność i przemiany 1989 roku", "solidarnosc 1980 okragly stol 1989", "Niezależny związek zawodowy „Solidarność” powstał w 1980 roku, a rozmowy Okrągłego Stołu odbyły się w 1989 roku.", "Wybory z 4 czerwca 1989 roku i późniejsze zmiany polityczne zapoczątkowały pokojową transformację ustroju w Polsce.", "Rok 1989 wiąże się też z przemianami w innych państwach Europy Środkowo-Wschodniej.", "W historii najnowszej korzystaj z wielu źródeł i odróżniaj relacje świadków od późniejszych opracowań.", "W którym roku odbyły się rozmowy Okrągłego Stołu?", "1989", "8"],
  ["Stan wojenny w Polsce", "stan wojenny 13 grudnia 1981", "Stan wojenny w Polsce wprowadzono 13 grudnia 1981 roku.", "Władze ograniczyły swobody obywatelskie, internowały działaczy opozycji i użyły wojska oraz milicji do kontroli społeczeństwa.", "Kartki, godzina milicyjna i internowania były elementami codzienności tego okresu.", "Wspomnienia świadków zestawiaj z dokumentami i opracowaniami historycznymi.", "Kiedy wprowadzono stan wojenny w Polsce?", "13 grudnia 1981|1981", "8"]
]);

addKnowledgeCards("Fizyka", [
  ["Jednostki układu SI", "podstawowe jednostki fizyczne SI|metr kilogram sekunda amper", "Układ SI to wspólny międzynarodowy system jednostek używany w pomiarach naukowych.", "W szkole często używamy metra dla długości, kilograma dla masy, sekundy dla czasu, ampera dla natężenia i kelwina dla temperatury.", "Prędkość 5 m/s oznacza pięć metrów w każdej sekundzie.", "Przed podstawieniem do wzoru sprowadź dane do zgodnych jednostek.", "Jaka jest podstawowa jednostka czasu w układzie SI?", "sekunda|s", "4-8"],
  ["Schemat obwodu elektrycznego", "symbole na schemacie obwodu bateria zarowka", "Schemat obwodu przedstawia elementy układu za pomocą umownych symboli.", "Przewody rysuje się jako linie, a źródło, żarówkę, wyłącznik i mierniki — symbolami. Zamknięta droga pozwala na przepływ prądu.", "Otwarty wyłącznik przerywa obwód i żarówka nie świeci.", "Na schemacie sprawdź, czy elementy tworzą zamkniętą drogę.", "Czy przez przerwany obwód płynie prąd?", "nie", "6-8"],
  ["Pomiar i niepewność wyniku", "dokladnosc pomiaru blad pomiarowy", "Każdy pomiar ma ograniczoną dokładność, zależną między innymi od przyrządu i sposobu odczytu.", "Wynik zapisuj z jednostką i taką dokładnością, na jaką pozwala skala przyrządu. Powtórzenie pomiaru pomaga wykryć przypadkowe różnice.", "Linijka z podziałką co 1 mm nie uzasadnia podania długości z dokładnością do 0,001 mm.", "Niepewność pomiaru nie oznacza, że pomiar był bezużyteczny.", "Co oprócz liczby należy dopisać do wyniku pomiaru?", "jednostke|jednostkę", "5-8"],
  ["Energia mechaniczna", "energia kinetyczna i potencjalna suma", "Energia mechaniczna ciała jest sumą energii kinetycznej i potencjalnej.", "Podczas ruchu energia może przechodzić z jednej postaci w drugą; w idealnym układzie całkowita energia mechaniczna pozostaje stała.", "Spadająca piłka traci część energii potencjalnej, a zyskuje kinetyczną.", "Opory ruchu mogą przenosić energię do otoczenia, na przykład w postaci ciepła.", "Z jakich dwóch rodzajów energii składa się energia mechaniczna?", "kinetycznej&potencjalnej", "7-8"],
  ["Ruch drgający", "drgania okresowe wahadlo sprężyna", "Ruch drgający powtarza się wokół położenia równowagi.", "Wychylenie zmienia się w czasie, a okres oznacza czas jednego pełnego drgania.", "Ciężarek na sprężynie porusza się raz w jedną, raz w drugą stronę wokół położenia równowagi.", "Amplituda to największe wychylenie, a okres i częstotliwość opisują tempo drgań.", "Jak nazywamy czas jednego pełnego drgania?", "okres", "6-8"],
  ["Termometr i pomiar temperatury", "jak mierzyc temperature termometr skala celsjusza", "Termometr służy do pomiaru temperatury; wynik należy odczytać po ustabilizowaniu wskazania.", "W Polsce w życiu codziennym często używa się skali Celsjusza. W fizyce temperaturę bezwzględną podaje się w kelwinach.", "Temperatura 0°C odpowiada 273,15 K.", "Nie dotykaj gorących ani laboratoryjnych termometrów bez zgody nauczyciela.", "Jaka jednostka temperatury należy do układu SI?", "kelwin|K", "4-8"],
  ["Siła a zmiana ruchu", "niezrownowazona sila zmienia ruch ciala", "Niezrównoważona siła może zmienić prędkość lub kierunek ruchu ciała.", "Gdy siły się równoważą, ciało zachowuje spoczynek albo porusza się ruchem jednostajnym prostoliniowym.", "Pchnięcie nieruchomego wózka wprawia go w ruch, bo działa niezrównoważona siła.", "Sama obecność siły nie oznacza, że ciało zawsze porusza się szybciej — liczy się wypadkowa i kierunek.", "Co dzieje się z ruchem, gdy siły działające na ciało się równoważą?", "nie zmienia sie|pozostaje bez zmian", "6-8"]
]);

addKnowledgeCards("Chemia", [
  ["Budowa jądra atomowego", "protony neutrony jadro atomu", "Jądro atomu składa się z protonów i neutronów; wokół niego znajduje się chmura elektronowa.", "Proton ma ładunek dodatni, neutron jest elektrycznie obojętny, a elektron ma ładunek ujemny.", "Jądro atomu węgla-12 zawiera 6 protonów i 6 neutronów.", "Prawie cała masa atomu jest skupiona w jądrze.", "Które cząstki budują jądro atomowe?", "protony&neutrony", "5-8"],
  ["Liczba masowa i izotopy", "liczba masowa suma protonow neutronow izotopy", "Liczba masowa określa łączną liczbę protonów i neutronów w jądrze atomu.", "Izotopy tego samego pierwiastka mają tyle samo protonów, ale różną liczbę neutronów.", "Węgiel-12 i węgiel-14 są izotopami węgla; oba mają 6 protonów.", "Nie myl liczby masowej z liczbą atomową.", "Czym różnią się izotopy jednego pierwiastka?", "liczba neutronow|liczbą neutronów", "7-8"],
  ["Wiązanie jonowe i kowalencyjne", "roznica wiazanie jonowe kowalencyjne", "W wiązaniu jonowym atomy tworzą jony o przeciwnych ładunkach, a w kowalencyjnym uwspólniają pary elektronów.", "Sód i chlor w chlorku sodu tworzą jony, natomiast atomy wodoru w cząsteczce H₂ współdzielą elektrony.", "NaCl jest przykładem związku jonowego, a H₂O — cząsteczki z wiązaniami kowalencyjnymi.", "To szkolny model wiązań; rzeczywiste wiązania mogą mieć różny stopień polarności.", "Czy w wiązaniu kowalencyjnym atomy uwspólniają czy przekazują elektrony?", "uwspolniaja|uwspólniają", "7-8"],
  ["Wartościowość w zapisie wzoru", "wartosciowosc pierwiastka indeksy we wzorze", "Wartościowość pomaga ustalić, w jakich proporcjach atomy łączą się w prostych wzorach związków.", "Indeksy we wzorze zapisują liczbę atomów; nie zmieniamy ich podczas uzgadniania równania reakcji.", "W cząsteczce H₂O dwa atomy wodoru łączą się z jednym atomem tlenu.", "Współczesny opis wiązań opiera się na elektronach; wartościowość jest użytecznym szkolnym modelem.", "Co oznacza mała liczba zapisana we wzorze chemicznym?", "liczbe atomow|liczbę atomów", "7-8"],
  ["Tlenki metali i niemetali", "jak powstaja tlenki|tlenek metalu reakcja z tlenem", "Tlenki to związki tlenu z innym pierwiastkiem.", "Wiele tlenków powstaje podczas łączenia pierwiastka z tlenem; ich właściwości zależą od składu i budowy.", "Spalanie magnezu w tlenie może prowadzić do powstania tlenku magnezu.", "Doświadczenia ze spalaniem prowadzi wyłącznie nauczyciel zgodnie z zasadami bezpieczeństwa.", "Jakie dwa rodzaje pierwiastków mogą tworzyć tlenki?", "metale&niemetale", "7-8"],
  ["Wzór sumaryczny a strukturalny", "roznica wzor sumaryczny strukturalny", "Wzór sumaryczny podaje rodzaj i liczbę atomów, a strukturalny pokazuje sposób ich połączenia w uproszczonym modelu.", "Wzory należy czytać zgodnie z symbolami pierwiastków i indeksami dolnymi.", "H₂O informuje o dwóch atomach wodoru i jednym tlenu; wzór strukturalny może dodatkowo pokazać wiązania.", "Wzór nie zawsze pokazuje przestrzenny kształt cząsteczki.", "Który wzór podaje liczbę atomów, ale nie pokazuje wiązań?", "sumaryczny", "6-8"],
  ["Rozcieńczanie roztworu", "jak rozcienczyc roztwor dodac wody", "Rozcieńczanie zwiększa ilość rozpuszczalnika, przez co stężenie roztworu maleje.", "Jeśli nie dodajemy ani nie usuwamy substancji rozpuszczonej, jej masa pozostaje taka sama, a rośnie masa całego roztworu.", "Dodanie wody do słonej wody zmniejsza stężenie soli, ale nie usuwa jej z roztworu.", "W pracowni chemicznej roztwory przygotowuje się zgodnie z instrukcją nauczyciela.", "Czy po dolaniu wody stężenie roztworu zwykle rośnie czy maleje?", "maleje", "7-8"]
]);

const PERIODIC_ELEMENTS_PL = [
  ["wodór", "H"], ["hel", "He"], ["lit", "Li"], ["beryl", "Be"], ["bor", "B"], ["węgiel", "C"], ["azot", "N"], ["tlen", "O"], ["fluor", "F"], ["neon", "Ne"],
  ["sód", "Na"], ["magnez", "Mg"], ["glin", "Al"], ["krzem", "Si"], ["fosfor", "P"], ["siarka", "S"], ["chlor", "Cl"], ["argon", "Ar"], ["potas", "K"], ["wapń", "Ca"],
  ["skand", "Sc"], ["tytan", "Ti"], ["wanad", "V"], ["chrom", "Cr"], ["mangan", "Mn"], ["żelazo", "Fe"], ["kobalt", "Co"], ["nikiel", "Ni"], ["miedź", "Cu"], ["cynk", "Zn"],
  ["gal", "Ga"], ["german", "Ge"], ["arsen", "As"], ["selen", "Se"], ["brom", "Br"], ["krypton", "Kr"], ["rubid", "Rb"], ["stront", "Sr"], ["itr", "Y"], ["cyrkon", "Zr"],
  ["niob", "Nb"], ["molibden", "Mo"], ["technet", "Tc"], ["ruten", "Ru"], ["rod", "Rh"], ["pallad", "Pd"], ["srebro", "Ag"], ["kadm", "Cd"], ["ind", "In"], ["cyna", "Sn"],
  ["antymon", "Sb"], ["tellur", "Te"], ["jod", "I"], ["ksenon", "Xe"], ["cez", "Cs"], ["bar", "Ba"], ["lantan", "La"], ["cer", "Ce"], ["prazeodym", "Pr"], ["neodym", "Nd"],
  ["promet", "Pm"], ["samar", "Sm"], ["europ", "Eu"], ["gadolin", "Gd"], ["terb", "Tb"], ["dysproz", "Dy"], ["holm", "Ho"], ["erb", "Er"], ["tul", "Tm"], ["iterb", "Yb"],
  ["lutet", "Lu"], ["hafn", "Hf"], ["tantal", "Ta"], ["wolfram", "W"], ["ren", "Re"], ["osm", "Os"], ["iryd", "Ir"], ["platyna", "Pt"], ["złoto", "Au"], ["rtęć", "Hg"],
  ["tal", "Tl"], ["ołów", "Pb"], ["bizmut", "Bi"], ["polon", "Po"], ["astat", "At"], ["radon", "Rn"], ["frans", "Fr"], ["rad", "Ra"], ["aktyn", "Ac"], ["tor", "Th"],
  ["protaktyn", "Pa"], ["uran", "U"], ["neptun", "Np"], ["pluton", "Pu"], ["ameryk", "Am"], ["kiur", "Cm"], ["berkel", "Bk"], ["kaliforn", "Cf"], ["einstein", "Es"], ["ferm", "Fm"],
  ["mendelew", "Md"], ["nobel", "No"], ["lorens", "Lr"], ["rutherford", "Rf"], ["dubn", "Db"], ["seaborg", "Sg"], ["bohr", "Bh"], ["has", "Hs"], ["meitner", "Mt"], ["darmsztadt", "Ds"],
  ["roentgen", "Rg"], ["kopernik", "Cn"], ["nihon", "Nh"], ["flerow", "Fl"], ["moskow", "Mc"], ["liwermor", "Lv"], ["tenes", "Ts"], ["oganeson", "Og"]
];

const ELEMENT_PROFILES_PL = new Map([
  ["H", ["W warunkach pokojowych wodór występuje zwykle jako cząsteczki H₂. Jest najlżejszym pierwiastkiem.", "Woda zawiera wodór i tlen; wodór występuje też w wielu związkach organicznych."]],
  ["He", ["Hel jest gazem szlachetnym i w zwykłych warunkach mało chętnie reaguje z innymi pierwiastkami.", "Lekkość i mała reaktywność helu wykorzystuje się w wybranych zastosowaniach technicznych i naukowych."]],
  ["Li", ["Lit jest lekkim metalem alkalicznym. W przyrodzie spotyka się go głównie w związkach.", "Związki litu wykorzystuje się między innymi w akumulatorach; właściwości zależą od konkretnego związku."]],
  ["B", ["Bor jest półmetalem, a nie typowym metalem.", "Związki boru stosuje się między innymi do produkcji szkła borokrzemowego i detergentów."]],
  ["C", ["Węgiel jest niemetalem i tworzy różne odmiany alotropowe, między innymi grafit i diament.", "Węgiel buduje związki organiczne oraz występuje w dwutlenku węgla i węglanach."]],
  ["N", ["Azot cząsteczkowy N₂ stanowi około 78% objętości suchego powietrza.", "Azot jest składnikiem białek i kwasów nukleinowych, a jego obieg łączy atmosferę z organizmami."]],
  ["O", ["Tlen cząsteczkowy O₂ stanowi około 21% objętości suchego powietrza i jest potrzebny w oddychaniu tlenowym.", "Tlen nie jest paliwem, ale podtrzymuje spalanie; występuje też w wodzie i wielu minerałach."]],
  ["F", ["Fluor jest niemetalem z grupy halogenów. W przyrodzie występuje przede wszystkim w związkach.", "Jony fluorkowe w odpowiednich ilościach wykorzystuje się w profilaktyce próchnicy; sam fluor pierwiastkowy jest niebezpieczny."]],
  ["Ne", ["Neon jest gazem szlachetnym, który w typowych warunkach mało reaguje.", "Neon wykorzystuje się w niektórych źródłach światła i wskaźnikach."]],
  ["Na", ["Sód jest miękkim metalem alkalicznym i silnie reaguje z wodą, dlatego nie występuje w przyrodzie jako swobodny metal.", "W chlorku sodu, czyli soli kuchennej, sód jest połączony chemicznie z chlorem."]],
  ["Mg", ["Magnez jest lekkim metalem. Jego jony są ważne dla organizmów, a atom magnezu znajduje się w cząsteczce chlorofilu.", "Stopy magnezu wykorzystuje się tam, gdzie liczy się mała masa materiału."]],
  ["Al", ["Glin jest lekkim metalem. Cienka warstwa tlenku na jego powierzchni spowalnia dalszą korozję.", "Mała gęstość i odporność powierzchniowa sprawiają, że glin stosuje się w opakowaniach i konstrukcjach."]],
  ["Si", ["Krzem jest półmetalem. W przyrodzie występuje w dużych ilościach w krzemionce i krzemianach.", "Kontrolowane przewodnictwo krzemu pozwala wykorzystywać go w elektronice i ogniwach fotowoltaicznych."]],
  ["P", ["Fosfor jest niemetalem i występuje w różnych odmianach; w organizmach jego związki są składnikiem między innymi kości i DNA.", "Związki fosforu są ważne dla roślin i wykorzystuje się je w nawozach; substancje fosforowe wymagają właściwego obchodzenia się."]],
  ["S", ["Siarka jest żółtym niemetalem. Występuje zarówno jako pierwiastek, jak i w wielu minerałach.", "Siarka jest składnikiem niektórych aminokwasów, a jej związki mają zastosowania przemysłowe."]],
  ["Cl", ["Chlor jest halogenem i w warunkach pokojowych występuje jako cząsteczki Cl₂; wolny chlor jest toksycznym gazem.", "Chlorki, czyli związki zawierające jony chlorkowe, są powszechne; wybrane związki chloru służą do dezynfekcji wody."]],
  ["Ar", ["Argon jest gazem szlachetnym i stanowi niecały 1% objętości suchego powietrza.", "Mała reaktywność argonu jest wykorzystywana między innymi do ochrony materiałów podczas wybranych procesów technicznych."]],
  ["K", ["Potas jest metalem alkalicznym; w przyrodzie występuje w związkach, a jego jony są ważne dla pracy komórek.", "Potas jest składnikiem wielu minerałów i nawozów; pierwiastkowego potasu nie należy samodzielnie badać."]],
  ["Ca", ["Wapń jest metalem, ale w przyrodzie spotyka się go głównie w związkach.", "Związki wapnia budują między innymi wapień i kredę, a jony wapniowe są ważne dla kości i zębów."]],
  ["Fe", ["Żelazo jest metalem, który w obecności wody i tlenu może korodować.", "Żelazo wykorzystuje się do produkcji stali; jego atomy są też częścią hemoglobiny."]],
  ["Cu", ["Miedź jest metalem dobrze przewodzącym prąd i ciepło.", "Wykorzystuje się ją w przewodach elektrycznych i stopach, na przykład w mosiądzu."]],
  ["Zn", ["Cynk jest metalem, który na powierzchni może tworzyć warstwę ochronną.", "Powłoki cynkowe pomagają chronić stal przed korozją; cynk wchodzi też w skład mosiądzu."]],
  ["Ag", ["Srebro jest metalem o bardzo dobrym przewodnictwie elektrycznym.", "Stosuje się je w jubilerstwie i wybranych elementach elektrycznych; srebro jest również pierwiastkiem chemicznym, nie tylko nazwą koloru."]],
  ["Au", ["Złoto jest metalem mało podatnym na korozję i łatwym do kształtowania.", "Wykorzystuje się je w jubilerstwie, elektronice i wybranych zastosowaniach medycznych."]],
  ["Hg", ["Rtęć jest metalem ciekłym w typowej temperaturze pokojowej. Jej opary i związki mogą być toksyczne.", "Ze względu na zagrożenie rtęcią nie wolno dotykać rozbitego termometru ani samodzielnie zbierać rtęci."]]
]);

for (const [index, [name, symbol]] of PERIODIC_ELEMENTS_PL.entries()) {
  const atomicNumber = index + 1;
  const profile = ELEMENT_PROFILES_PL.get(symbol);
  knowledge.push({
    title: `${name[0].toLocaleUpperCase("pl-PL")}${name.slice(1)} (${symbol})`,
    subject: "Chemia",
    grades: [7, 8],
    educationStage: "VII–VIII",
    keywords: [name, `${name} pierwiastek`, `pierwiastek ${name}`, `symbol ${symbol}`, `liczba atomowa ${atomicNumber}`, symbol],
    aliases: [`${symbol} — ${name}`, `atom ${name}`, `numer atomowy ${atomicNumber}`],
    short: `${name[0].toLocaleUpperCase("pl-PL")}${name.slice(1)} ma symbol ${symbol} i liczbę atomową ${atomicNumber}.`,
    explanation: `Liczba atomowa ${atomicNumber} oznacza, że jądro każdego atomu ${name} ma ${atomicNumber} protonów. W obojętnym atomie jest też ${atomicNumber} elektronów.${profile ? ` ${profile[0]}` : ""}`,
    example: profile ? profile[1] : `Zapis ${symbol} oznacza pierwiastek ${name}; w jego jądrze znajduje się ${atomicNumber} protonów.`,
    related: profile ? `Symbol pierwiastka to ${symbol}. ${profile[1]}` : "Symbol pierwiastka jest umownym zapisem literowym, a jego pierwsza litera jest wielka.",
    check: `Jaki jest symbol ${name} i ile protonów ma jego atom?`,
    teacherAnswer: { all: [[symbol], [String(atomicNumber)]], hint: `Symbol to ${symbol}, a liczba atomowa to ${atomicNumber}.` }
  });
}

const LITERATURE_CATALOG = new Map();

function registerLiteratureList(version, role, grades, entries) {
  for (const line of entries.trim().split("\n")) {
    const separator = line.indexOf("|");
    if (separator < 0) continue;
    const author = line.slice(0, separator).trim();
    const title = line.slice(separator + 1).trim();
    if (!title) continue;
    const key = normalize(title);
    const item = LITERATURE_CATALOG.get(key) || { title, author, roles: [] };
    if (!item.author || item.author.includes("lub")) item.author = author;
    item.roles.push({ version, role, grades });
    LITERATURE_CATALOG.set(key, item);
  }
}

registerLiteratureList("2017", "required", [4, 5, 6], `
Jan Brzechwa|Akademia Pana Kleksa
Janusz Christa|Kajko i Kokosz. Szkoła latania
René Goscinny i Jean-Jacques Sempé|Mikołajek — wybór opowiadań
Rafał Kosik|Felix, Net i Nika oraz Gang Niewidzialnych Ludzi
Ignacy Krasicki|Wybrane bajki
C.S. Lewis|Opowieści z Narnii. Lew, czarownica i stara szafa
Adam Mickiewicz|Powrót taty i Pani Twardowska
Adam Mickiewicz|Pan Tadeusz — wybrane fragmenty
Ferenc Molnár|Chłopcy z Placu Broni
Bolesław Prus|Katarynka
Juliusz Słowacki|W pamiętniku Zofii Bobrówny
J.R.R. Tolkien|Hobbit, czyli tam i z powrotem
Henryk Sienkiewicz|W pustyni i w puszczy
Józef Wybicki|Mazurek Dąbrowskiego
Autorzy różni|Wybrane mity greckie
Autorzy różni|Biblia — stworzenie świata i wybrane przypowieści
Autorzy różni|Wybrane podania i legendy polskie
Autorzy różni|Wybrane baśnie polskie i europejskie
Autorzy różni|Wybrane wiersze i pieśni patriotyczne`);

registerLiteratureList("2017", "required", [7, 8], `
Charles Dickens|Opowieść wigilijna
Aleksander Fredro|Zemsta
Jan Kochanowski|Wybór fraszek, pieśni i trenów
Aleksander Kamiński|Kamienie na szaniec
Ignacy Krasicki|Żona modna
Adam Mickiewicz|Dziady część II
Adam Mickiewicz|Reduta Ordona i Śmierć Pułkownika
Adam Mickiewicz|Świtezianka i wybrany Sonet krymski
Adam Mickiewicz|Pan Tadeusz — całość
Antoine de Saint-Exupéry|Mały Książę
Henryk Sienkiewicz|Quo vadis
Henryk Sienkiewicz|Latarnik
Juliusz Słowacki|Balladyna
Stefan Żeromski|Syzyfowe prace
Sławomir Mrożek|Artysta
Melchior Wańkowicz|Ziele na kraterze — fragmenty
Melchior Wańkowicz|Tędy i owędy — wybrany reportaż
Autorzy różni|Wybrane wiersze poetów dla klas VII–VIII`);

registerLiteratureList("2017", "choice", [4, 5, 6], `
Adam Bahdaj|Kapelusz za 100 tysięcy
Frances Hodgson Burnett|Tajemniczy ogród lub inna powieść
Lewis Carroll|Alicja w Krainie Czarów
Aleksander Dumas|Trzej muszkieterowie
Olaf Fritsche|Skarb Troi
Rudyard Kipling|Księga dżungli
Janusz Korczak|Król Maciuś Pierwszy
Marcin Kozioł|Skrzynia Władcy Piorunów
Selma Lagerlöf|Cudowna podróż
Stanisław Lem|Cyberiada — fragmenty
Kornel Makuszyński|Wybrana powieść
Andrzej Maleszka|Magiczne drzewo
Karol May|Winnetou
Lucy Maud Montgomery|Ania z Zielonego Wzgórza
Małgorzata Musierowicz|Wybrana powieść
Ewa Nowak|Pajączek na rowerze
Edmund Niziurski|Sposób na Alcybiadesa
Sat-Okh|Biały Mustang
Henryk Sienkiewicz|Janko Muzykant
Alfred Szklarski|Wybrana powieść
Mark Twain|Przygody Tomka Sawyera
Autorzy różni|Seria Nazywam się… — wybrana pozycja`);

registerLiteratureList("2017", "choice", [7, 8], `
Miron Białoszewski|Pamiętnik z powstania warszawskiego — fragmenty
Agatha Christie|Wybrana powieść kryminalna
Arkady Fiedler|Dywizjon 303
Ernest Hemingway|Stary człowiek i morze
Barbara Kosmowska|Pozłacana rybka
Jan Paweł II|Przekroczyć próg nadziei — fragmenty
Nancy H. Kleinbaum|Stowarzyszenie Umarłych Poetów
Henryk Sienkiewicz|Krzyżacy
Éric-Emmanuel Schmitt|Oskar i pani Róża
Melchior Wańkowicz|Monte Cassino — fragmenty
Karolina Lanckorońska|Wspomnienia wojenne 22 IX 1939–5 IV 1945 — fragmenty`);

registerLiteratureList("2026", "required", [4, 5, 6, 7, 8], `
Jan Kochanowski|Tren VII i Tren VIII oraz wybrane fraszki
Ignacy Krasicki|Wybrane bajki
Adam Mickiewicz|Dziady część II
Adam Mickiewicz|Reduta Ordona
Adam Mickiewicz|Śmierć pułkownika
Adam Mickiewicz|Pan Tadeusz — Inwokacja
Adam Mickiewicz|Wybrana ballada
Juliusz Słowacki|Balladyna
Bolesław Prus lub Henryk Sienkiewicz|Wybrana nowela
Aleksander Kamiński|Kamienie na szaniec
Sławomir Mrożek|Wybrane opowiadanie lub jednoaktówka
Ida Fink|Wybrane opowiadanie
Autorzy różni|Wybrane wiersze poetów wskazanych w podstawie 2026`);

registerLiteratureList("2026", "choice", [4, 5, 6, 7, 8], `
Adam Bahdaj|Do przerwy 0:1 lub inna powieść
Justyna Bednarek|Dom numer 5
Paweł Beręsewicz|Wszystkie lajki Marczuka lub Szeptane
Miron Białoszewski|Pamiętnik z powstania warszawskiego — fragmenty
Karol Olgierd Borchardt|Znaczy Kapitan
Frances Hodgson Burnett|Tajemniczy ogród
Lewis Carroll|Alicja w Krainie Czarów
Marine Carteron|Wybrana powieść z serii Podpalacze książek
Joanna Chmielewska|Nawiedzony dom lub Zwyczajne życie
Agatha Christie|Wybrana powieść kryminalna
Carlo Collodi|Pinokio
Sarah Crossan|Kasieńka
Charles Dickens|Opowieść wigilijna
Lloyd Cassel Douglas|Wielki Rybak
Jacek Dukaj|Wroniec
Aleksander Dumas|Trzej muszkieterowie
Michael Ende|Momo lub Niekończąca się historia
John Flanagan|Wybrana powieść z cyklu Zwiadowcy
Aleksander Fredro|Zemsta lub Śluby panieńskie
Olaf Fritsche|Skarb Troi
Ernest Hemingway|Stary człowiek i morze
Roksana Jędrzejewska-Wróbel|Stan splątania
Grzegorz Kasdepke|Wybrana powieść
Jacqueline Kelly|Ewolucja według Calpurnii Tate
Emilia Kiereś|Rzeka
Rudyard Kipling|Księga dżungli
Nancy H. Kleinbaum|Stowarzyszenie umarłych poetów
Janusz Korczak|Król Maciuś Pierwszy lub Bankructwo małego Dżeka
Rafał Kosik|Felix, Net i Nika oraz Gang Niewidzialnych Ludzi
Barbara Kosmowska|Pozłacana rybka
Zofia Kossak-Szczucka|Topsy i Lupus — opowiadanie z tomu Bursztyny
Marcin Kozioł|Skrzynia Władcy Piorunów
Alice Kuipers|Życie na drzwiach lodówki
Selma Lagerlöf|Cudowna podróż
Ursula K. Le Guin|Czarnoksiężnik z Archipelagu
Stanisław Lem|Cyberiada lub Bajki robotów
Bolesław Leśmian|Klechdy sezamowe
C.S. Lewis|Wybrana powieść z cyklu Opowieści z Narnii
Astrid Lindgren|Bracia Lwie Serce lub Ronja, córka zbójnika
Kornel Makuszyński|Wybrana powieść
Andrzej Maleszka|Wybrana powieść z cyklu Magiczne drzewo
A.A. Milne|Kubuś Puchatek
Ferenc Molnár|Chłopcy z Placu Broni
Lucy Maud Montgomery|Ania z Zielonego Wzgórza
Brandon Mull|Baśniobór lub Wojna cukierkowa
Małgorzata Musierowicz|Wybrana powieść z cyklu Jeżycjada
Edmund Niziurski|Sposób na Alcybiadesa
Ewa Nowak|Pajączek na rowerze
Longin Jan Okoń|Tecumseh
George Orwell|Folwark zwierzęcy
Ferdynand Antoni Ossendowski|Słoń Birara
Raquel Jaramillo Palacio|Cudowny chłopak
Katherine Paterson|Most do Terabithii
Sara Pennypacker|Pax
Jacek Podsiadło|Czerwona kartka dla Sprężyny
Rick Riordan|Wybrana powieść z cyklu Percy Jackson i bogowie olimpijscy
J.K. Rowling|Wybrana powieść o Harrym Potterze
Katarzyna Ryrych|Król, Wyspa mojej siostry lub Lato na Rodos
Antoine de Saint-Exupéry|Mały Książę
Éric-Emmanuel Schmitt|Oskar i pani Róża
William Shakespeare|Romeo i Julia lub Sen nocy letniej
Henryk Sienkiewicz|Krzyżacy, W pustyni i w puszczy lub Quo vadis
Linn Skåber|Młodość. Wyznania nastolatków
Nancy Springer|Wybrana powieść z cyklu Enola Holmes
Erin Stewart|Blizny jak skrzydła
Marcin Szczygielski|Teatr Niewidzialnych Dzieci lub Arka Czasu
Alfred Szklarski|Wybrana powieść o Tomku Wilmowskim
Dorota Terakowska|Tam, gdzie spadają anioły lub Córka czarownic
J.R.R. Tolkien|Hobbit, czyli tam i z powrotem
Mark Twain|Przygody Tomka Sawyera
Katarzyna Wasilkowska|Już, już!
Danuta Wawiłow i Natalia Usenko|Wierzbowa 13
Louis de Wohl|Posłaniec króla
Karol Wojtyła|Wybrany utwór
Markus Zusak|Złodziejka książek
Stefan Żeromski|Syzyfowe prace lub Siłaczka
Autorzy różni|Gorzka czekolada i inne opowiadania o ważnych sprawach
Autorzy różni|Nazywam się… — wybrana biografia
Autorzy różni|Wszystkie kolory świata
Autorzy różni|Wybrane wiersze dawnych i współczesnych poetów
Autorzy różni|Zbiory mitologii światowej
Francesco D’Adamo|Iqbal
Anna Dziewit-Meller|Damy, dziewuchy, dziewczyny
Arkady Fiedler|Dywizjon 303
Rachel Firth, Minna Lacey i Jordan Akpojoro|Filozofia dla początkujących
Natalia Gancarz|Mietek na wojnie
Magdalena Grzebałkowska|Wojenka — wybrany reportaż
Boguś Janiszewski|Wybrana pozycja z serii To, o czym dorośli ci nie mówią
Leszek Kołakowski|Mini-wykłady o maxi-sprawach — wybrany fragment
Simona Kossak|Serce i pazur. Opowieści o uczuciach zwierząt
Anna Kowalczyk|Brakująca połowa dziejów
Karolina Lanckorońska|Wspomnienia wojenne — fragmenty
Anna Mieszkowska|Dzieci Ireny Sendlerowej
Nela Mała Reporterka|Wybrany utwór
Lidia Ostałowska|Bezprizorni
Marie Pavlenko|A kiedy zniknie pustynia
Łukasz Pilip|Podwórko bez trzepaka — wybrany reportaż
Michel Piquemal|Bajki filozoficzne
Magdalena Rigamonti|Niewygodni — wywiad lub inny wywiad
Michał Rusinek|Szalik. O Wisławie Szymborskiej dla dzieci
Maria Strzelecka|Simona
Justyna Suchecka|Young power. 30 historii o tym, jak młodzi zmieniają świat
Zbigniew Urbanyi|Na szlaku kliprów i windjammerów — fragmenty
Melchior Wańkowicz|Bitwa o Monte Cassino lub Ziele na kraterze
Urszula Zajączkowska|Patyki, badyle`);

for (const literature of LITERATURE_CATALOG.values()) {
  const selectedGrades = [...new Set(literature.roles.flatMap(role => role.grades))].sort();
  const roleSummary = literature.roles.map(({ version, role, grades }) =>
    `${version === "2026" ? "podstawa 2026" : "podstawa 2017"}: ${role === "required" ? "obowiązkowa" : "pozycja do wyboru"} (klasy ${grades.join(", ")})`
  ).join("; ");
  const title = `Lektura: ${literature.title}`;
  const aliases = [literature.title, `${literature.author} ${literature.title}`, `${literature.title} autor`, `lektura ${literature.title}`];
  knowledge.push({
    title,
    subject: "Lektury szkolne",
    grades: selectedGrades,
    educationStage: "IV–VIII",
    keywords: [title, ...aliases],
    aliases,
    short: `${literature.author} — ${literature.title}. ${roleSummary}.`,
    explanation: "Status zależy od rocznika ucznia, klasy i podstawy programowej wdrażanej w danym roku szkolnym.",
    example: "Możesz poprosić o autora, status lektury, krótki plan czytania albo pytania sprawdzające.",
    related: "Wykaz pozycji uzupełniających jest przykładowy; nauczyciel i uczniowie wybierają konkretne tytuły zgodnie z programem.",
    check: `Kto jest autorem lub autorką utworu „${literature.title}”?`,
    teacherAnswer: { all: [literature.author], hint: `Autorem lub autorką jest ${literature.author}.` },
    literature
  });
}

const LITERATURE_GUIDES = [
  ["akademia pana kleksa", "Jan Brzechwa", "Adaś Niezgódka trafia do niezwykłej szkoły profesora Kleksa, gdzie zwykłe lekcje ustępują miejsca wyobraźni, eksperymentom i przygodom.", "wyobraźnia, ciekawość, odwaga"],
  ["kajko i kokosz szkola latania", "Janusz Christa", "Komiks opowiada o wojach Kajku i Kokoszu, którzy mierzą się z niebezpieczeństwami i pomagają mieszkańcom grodu kasztelana Mirmiła.", "przyjaźń, spryt, współpraca"],
  ["mikolajek", "René Goscinny i Jean-Jacques Sempé", "Zbiór humorystycznych opowiadań pokazuje świat szkolnych i rodzinnych przygód Mikołajka oraz jego kolegów.", "przyjaźń, dziecięca perspektywa, humor"],
  ["opowiesci z narnii lew czarownica i stara szafa", "C.S. Lewis", "Dzieci przechodzą przez starą szafę do Narnii, gdzie pomagają walczyć z Białą Czarownicą i przywrócić w krainie sprawiedliwy ład.", "odwaga, lojalność, dobro i zło"],
  ["chlopcy z placu broni", "Ferenc Molnár", "Chłopcy bronią swojego placu zabaw, a próba lojalności i przyjaźni pokazuje cenę odpowiedzialności oraz poświęcenia.", "przyjaźń, honor, odpowiedzialność"],
  ["katarynka", "Bolesław Prus", "Pan Tomasz nie znosi katarynek, lecz spotkanie z niewidomą dziewczynką zmienia jego spojrzenie i skłania go do działania.", "empatia, przemiana, pomoc drugiemu człowiekowi"],
  ["hobbit czyli tam i z powrotem", "J.R.R. Tolkien", "Bilbo Baggins wyrusza z krasnoludami w podróż, która wystawia na próbę jego odwagę, spryt i stosunek do bogactwa.", "odwaga, dojrzewanie, przyjaźń, odpowiedzialność"],
  ["opowiesc wigilijna", "Charles Dickens", "Skąpy Ebenezer Scrooge podczas niezwykłej nocy poznaje duchy, które pomagają mu zobaczyć skutki jego postępowania i możliwość zmiany.", "empatia, przemiana, odpowiedzialność za innych"],
  ["zemsta", "Aleksander Fredro", "Komedia przedstawia spór Cześnika i Rejenta oraz perypetie młodych, którzy próbują połączyć swoje losy mimo konfliktu dorosłych.", "zgoda, pycha, komizm, konflikt"],
  ["kamienie na szaniec", "Aleksander Kamiński", "Reportażowa opowieść o Alku, Rudym i Zośce pokazuje przyjaźń oraz działalność młodych ludzi w okupowanej Warszawie.", "przyjaźń, patriotyzm, odwaga, odpowiedzialność"],
  ["maly ksiaze", "Antoine de Saint-Exupéry", "Podróż Małego Księcia przez różne planety prowadzi do rozmów o przyjaźni, odpowiedzialności i tym, jak patrzymy na świat.", "przyjaźń, troska, odpowiedzialność, perspektywa"],
  ["balladyna", "Juliusz Słowacki", "Dramat pokazuje, jak żądza władzy i kolejne złe decyzje Balladyny prowadzą do krzywdy innych oraz jej własnego upadku.", "ambicja, wina, sprawiedliwość, odpowiedzialność"],
  ["latarnik", "Henryk Sienkiewicz", "Skawiński, polski emigrant pracujący jako latarnik, po latach tułaczki otrzymuje spokojną posadę, lecz lektura polskiej książki budzi w nim silne wspomnienia.", "tęsknota za ojczyzną, pamięć, emigracja"],
  ["quo vadis", "Henryk Sienkiewicz", "Powieść osadzona w starożytnym Rzymie splata historię miłości Ligii i Marka Winicjusza z prześladowaniem pierwszych chrześcijan.", "miłość, przemiana, wiara, władza"],
  ["dziady czesc ii", "Adam Mickiewicz", "Podczas obrzędu dziadów przywoływane duchy opowiadają o swoich winach i cierpieniach, a ich historie niosą nauki moralne.", "wina, kara, współczucie, moralność"],
  ["syzyfowe prace", "Stefan Żeromski", "Powieść śledzi szkolne doświadczenia Marcina Borowicza i pokazuje, jak młodzi ludzie odkrywają własną tożsamość oraz siłę języka i kultury.", "dojrzewanie, tożsamość, język, opór"],
  ["tajemniczy ogrod", "Frances Hodgson Burnett", "Mary odkrywa zamknięty ogród i stopniowo nawiązuje relacje z innymi, a wspólna opieka nad miejscem przynosi zmianę bohaterom.", "przyjaźń, natura, przemiana, troska"],
  ["przygody tomka sawyera", "Mark Twain", "Tomek przeżywa liczne przygody w miasteczku nad Missisipi, ucząc się odpowiedzialności mimo zamiłowania do psot.", "przygoda, dojrzewanie, odwaga, przyjaźń"]
];

function findLiteratureKnowledgeItem(question) {
  const query = normalize(question);
  if (!query) return null;
  const expandedQuery = [...expandKnowledgeQuery(question).tokens, ...lexicalTokens(query)].join(" ");
  const grade = getRequestedSchoolGrade(question);
  const edition = grade ? getCurriculumEditionForGrade(grade) : null;
  const titleMatches = [...LITERATURE_CATALOG.values()].map(literature => {
    const title = normalize(literature.title)
      .replace(/\b(wybrane|wybrana|wybrany|fragmenty|fragment|opowiadania|powiesc|wybor)\b/g, " ")
      .replace(/\s+/g, " ").trim();
    const terms = title.split(" ").filter(term => term.length >= 4);
    const expandedTokens = lexicalTokens(expandedQuery);
    const matched = terms.filter(term => expandedQuery.includes(term) || expandedTokens.some(token => tokenStemMatch(token, term)));
    const exact = title.length >= 5 && expandedQuery.includes(title);
    const hasDistinctiveTitleLead = terms[0]?.length >= 5 && (expandedQuery.includes(terms[0]) || expandedTokens.some(token => tokenStemMatch(token, terms[0])));
    let score = exact ? title.length + 100 : matched.length >= Math.min(2, terms.length) || hasDistinctiveTitleLead ? matched.join(" ").length + matched.length * 10 + (hasDistinctiveTitleLead ? 8 : 0) : 0;
    if (score && edition && getLiteratureRole(literature, edition, grade)) score += 60;
    return { literature, score };
  }).filter(match => match.score > 0).sort((left, right) => right.score - left.score);
  const best = titleMatches[0]?.literature;
  if (!best) return null;
  return knowledge.find(item => item.literature === best) || null;
}

function isLiteratureListQuestion(question) {
  const text = normalize(question);
  if (!/\blektur\w*\b/.test(text)) return false;
  return /\b(obowiazk\w*|nieobowiazk\w*|uzupelniaj\w*|wykaz|lista|wymien\w*|jakie|ktore|spis|co czytac|mam czytac|musze czytac|wybrane|polecane)\b/.test(text)
    || Boolean(getRequestedSchoolGrade(question) && /\blektur\w*\b/.test(text));
}

function getLiteratureRole(literature, edition, grade) {
  return literature.roles.find(role => role.version === edition && (!grade || role.grades.includes(grade))) || null;
}

function formatLiteratureListAnswer(question) {
  if (!isLiteratureListQuestion(question)) return null;
  const context = getCurriculumContext(question);
  const grade = context?.grade || null;
  const edition = context?.edition || null;
  const wantsChoice = /\b(nieobowiazk\w*|uzupelniaj\w*|polecane|do wyboru|wybrane)\b/.test(normalize(question));
  const baseUrl2017 = "https://eli.gov.pl/eli/DU/2017/356/ogl";
  const baseUrl2026 = "https://eli.gov.pl/eli/DU/2026/378/ogl";

  if (!edition) {
    return "Koala rozdziela dwa wykazy, bo nowa podstawa jest wdrażana etapami. W roku szkolnym 2026/2027 klasa IV korzysta już z podstawy 2026, a klasy V–VIII z dotychczasowego wykazu 2017. Podaj klasę, a pokażę właściwy zestaw i rozdzielę lektury obowiązkowe od pozycji wybieranych przez nauczyciela i uczniów.\n\nPodstawy: 2026 — " + baseUrl2026 + " · 2017 — " + baseUrl2017;
  }

  const matching = [...LITERATURE_CATALOG.values()].filter(literature => getLiteratureRole(literature, edition, grade));
  const list = matching.filter(literature => getLiteratureRole(literature, edition, grade).role === (wantsChoice ? "choice" : "required"));
  if (!list.length) return null;

  const currentLabel = edition === "2026" ? "nowa podstawa 2026" : "dotychczasowa podstawa 2017";
  const gradeGroup = edition === "2017" ? (grade <= 6 ? "klasy IV–VI" : "klasy VII–VIII") : "etap klas IV–VIII";
  const examples = wantsChoice ? list.slice(0, 12) : list;
  const formatted = examples.map(item => `• ${item.author} — ${item.title}`).join("\n");
  let explanation;
  if (edition === "2026" && !wantsChoice) {
    explanation = "To wykaz klasyki wskazany w nowej podstawie. Ponadto w każdym roku szkolnym uczeń czyta co najmniej 4 dłuższe utwory, wybierane wspólnie przez nauczyciela i uczniów z listy przykładów lub spoza niej. Tytuły z listy przykładów nie są wszystkie obowiązkowe.";
  } else if (edition === "2026") {
    explanation = "To przykładowe propozycje do wspólnego wyboru, a nie lista tytułów, które każdy uczeń musi przeczytać. Nowa podstawa wymaga co najmniej 4 dłuższych utworów w każdym roku szkolnym.";
  } else if (wantsChoice) {
    explanation = `W podstawie 2017 wskazano lektury uzupełniające — wybiera się dwie w każdym roku szkolnym. Poniżej przykłady; możliwe są też inne utwory wybrane przez nauczyciela.`;
  } else {
    explanation = `To wykaz obowiązkowy dla grupy ${gradeGroup}, a nie roczny przydział dla jednej klasy. Dokładną kolejność w klasie ustala szkolny program nauczania.`;
  }
  const title = wantsChoice ? "Pozycje do wyboru / lektury uzupełniające" : "Lektury obowiązkowe";
  const source = edition === "2026" ? baseUrl2026 : baseUrl2017;
  const year = context.schoolYear;
  return `🐨 ${title} — klasa ${grade}, rok szkolny ${year}\nPodstawa: ${currentLabel}; wykaz dotyczy ${gradeGroup}.\n\n${formatted}${wantsChoice && list.length > examples.length ? `\n• … oraz ${list.length - examples.length} dalszych propozycji z pełnego wykazu` : ""}\n\n${explanation}\n\nŹródło urzędowe: ${source}\nW ARKONIE konkretny rozkład lektur może doprecyzować szkolny program i nauczyciel.`;
}

function formatLiteratureAnswer(item, question) {
  if (!item?.literature) return null;
  const literature = item.literature;
  const context = getCurriculumContext(question);
  const matchingRole = context ? getLiteratureRole(literature, context.edition, context.grade) : null;
  const roleLabel = matchingRole
    ? matchingRole.role === "required" ? "obowiązkowa w tej podstawie" : "pozycja z listy do wyboru / uzupełniającej"
    : literature.roles.map(role => `${role.version}: ${role.role === "required" ? "obowiązkowa" : "do wyboru"} (klasy ${role.grades.join(", ")})`).join("; ");
  const guideKey = normalize(literature.title).replace(/\s+/g, " ");
  const guide = LITERATURE_GUIDES.find(([key]) => guideKey.includes(key) || key.includes(guideKey));
  const intent = normalize(question);
  const asksAuthor = /\b(kto napisal|autorem|autorka|autor|autorstwo)\b/.test(intent);
  const asksStatus = /\b(obowiazk\w*|uzupelniaj\w*|nieobowiazk\w*|program|ktora klasa|jaka klasa)\b/.test(intent);
  const asksContent = /\b(o czym|streszcz\w*|opowiedz|plan wydarzen|bohater\w*|motyw\w*|temat\w*|analiz\w*|omow\w*|notatk\w*|powtork\w*)\b/.test(intent);
  const contextLabel = context ? `klasa ${context.grade}, rok ${context.schoolYear}` : "właściwa klasa zależy od roku wdrożenia podstawy";
  let response = `🐨 ${literature.title}\nAutor: ${literature.author}.\nStatus: ${roleLabel}. (${contextLabel})`;
  if (guide && asksContent) response += `\n\nKrótko o utworze: ${guide[2]}\n\nWażne zagadnienia: ${guide[3]}.`;
  else if (!asksAuthor && !asksStatus && guide) response += `\n\nKrótko o utworze: ${guide[2]}\nWażne zagadnienia: ${guide[3]}.`;
  else if (asksContent && !guide) response += "\n\nNie mam jeszcze lokalnego, sprawdzonego streszczenia tego tytułu. Mogę pomóc na podstawie wklejonego fragmentu albo wyszukać materiały, jeśli poprosisz o źródła online.";
  response += `\n\nWażne: pozycja oznaczona jako „do wyboru” nie jest automatycznie obowiązkowa w każdej klasie. Podstawa dla ${context?.schoolYear || "bieżącego roku"}: ${context?.edition === "2026" ? "https://eli.gov.pl/eli/DU/2026/378/ogl" : "https://eli.gov.pl/eli/DU/2017/356/ogl"}.`;
  return response;
}

for (const item of knowledge) {
  item.grades ||= [4, 5, 6, 7, 8];
  item.educationStage ||= "IV–VIII";
}

const teacherAnswerRules = {
  "Rzeczownik": { all: ["kot"], hint: "Poszukaj wyrazu nazywającego zwierzę." },
  "Czasownik": { all: [["graja", "grają"]], hint: "Szukaj wyrazu, który oznacza wykonywaną czynność." },
  "Przymiotnik": { all: ["maly"], hint: "Przymiotnik odpowiada między innymi na pytanie: jaki?" },
  "Przysłówek": { all: ["kiedy"], hint: "Zastanów się, na jakie pytanie odpowiada wyraz „wczoraj”." },
  "Zaimek": { all: ["ona", "swoja"], hint: "W zdaniu są dwa wyrazy zastępujące inne części mowy." },
  "Liczby pierwsze": { any: ["dzieli sie przez 3", "dzieli sie przez 5", "ma dzielnik 3", "ma dzielnik 5"], hint: "15 dzieli się bez reszty przez 3 i przez 5, więc ma więcej niż dwa dzielniki." },
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
  "Najdłuższa rzeka Polski": { any: ["baltyk", "baltyckiego"], hint: "Wisła uchodzi do morza na północy Polski." },
  "Równania liniowe": { all: ["7"], hint: "Odejmij 5 po obu stronach równania x + 5 = 12." },
  "Ułamki dziesiętne": { all: ["25", "setnych"], hint: "Cyfry po przecinku oznaczają kolejno części dziesiąte i setne." },
  "Podmiot i orzeczenie": { all: ["ptaki", "spiewaja"], hint: "Podmiot odpowiada na pytanie „kto?”, a orzeczenie mówi, co robi." },
  "Stany skupienia": { all: ["ciecz"], hint: "Woda w szklance przyjmuje kształt naczynia." },
  "Obieg wody w przyrodzie": { all: ["parowanie"], hint: "Proces zaczyna się, gdy woda ogrzana przez Słońce zamienia się w parę." },
  "Układ krwionośny": { any: ["serce", "pompa"], hint: "Ten narząd rytmicznie kurczy się i wprawia krew w ruch." },
  "Kontynenty i oceany": { all: ["atlantycki"], hint: "Jeden z oceanów leży między Europą i Afryką a Amerykami." },
  "Epoki historyczne": { all: ["sredniowiecze"], hint: "Ta epoka zaczyna się po starożytności." },
  "Twierdzenie Pitagorasa": { all: ["5"], hint: "Policz pierwiastek z 3² + 4²." },
  "Pole trójkąta": { all: ["12"], hint: "Pomnóż 6 przez 4 i podziel wynik przez 2." },
  "Pole koła": { all: [["pi", "π"], "r"], hint: "Wzór zawiera liczbę π i kwadrat promienia." },
  "Średnia arytmetyczna": { all: ["5"], hint: "Dodaj liczby i podziel sumę przez trzy." },
  "Skala mapy": { all: ["2", ["km", "kilometr"]], hint: "W tej skali 1 cm na mapie to 1 km w terenie." },
  "Łańcuch pokarmowy": { all: ["trawa"], hint: "Producentem jest roślina, która sama wytwarza pokarm." },
  "Chrzest Polski": { all: ["966"], hint: "To trzycyfrowa data z X wieku." },
  "Rozbiory Polski": { all: ["1795"], hint: "To ostatni z trzech rozbiorów." },
  "Starożytna Grecja": { all: ["polis"], hint: "Jedno takie miasto-państwo to polis." },
  "Prawa dziecka": { any: ["nauki", "edukacji", "bezpieczenstwa", "ochrony", "odpoczynku", "zdrowia", "do wyrazania opinii"], hint: "Pomyśl o prawie do nauki, ochrony, zdrowia albo odpoczynku." },
  "Bezpieczeństwo w internecie": { any: ["nie podam", "nie wysle", "zaufanemu doroslemu", "zglosze"], hint: "Nie podawaj hasła. Porozmawiaj z zaufanym dorosłym." },
  "Układ oddechowy": { all: ["tlen"], hint: "To gaz potrzebny komórkom do oddychania." },
  "Układ pokarmowy": { all: ["jelito cienkie"], hint: "To narząd, w którym wchłania się większość składników odżywczych." },
  "Ekosystem": { all: [["roslina", "drzewo", "grzyb", "zwierze"], ["woda", "gleba", "swiatlo", "temperatura"]], hint: "Wymień organizm i składnik nieożywiony środowiska." },
  "Mieszaniny i roztwory": { any: ["nie", "niejednorodna", "nie jednorodna", "heterogeniczna"], hint: "Piasek i woda tworzą mieszaninę niejednorodną, bo można odróżnić składniki." },
  "Siła tarcia": { any: ["chodzenie", "but", "hamowanie", "przyczepnosc"], hint: "Pomyśl o chodzeniu albo hamowaniu roweru." },
  "Ruch obrotowy Ziemi": { all: ["dzien", "noc"], hint: "Z jednej strony Ziemi jest jasno, a z drugiej ciemno." },
  "Zdania pojedyncze i złożone": { all: [["2", "dwa"], "orzeczenia"], hint: "Znajdź czasowniki „czyta” i „rysuje”." },
  "Liczby rzymskie": { all: ["9"], hint: "W zapisie IX mniejsza I stoi przed większą X, więc ją odejmujemy." },
  "Droga, prędkość i czas": { all: ["15", ["km/h", "kilometrow na godzine"]], hint: "Podziel przebytą drogę przez czas: 30 km ÷ 2 h." },
  "Kolejność wykonywania działań": { all: ["8"], hint: "Najpierw wykonaj mnożenie 3 × 4." },
  "Liczby całkowite": { all: ["12"], hint: "Liczba przeciwna ma taki sam moduł, ale zmieniony znak." },
  "Proporcje": { all: ["20"], hint: "Najpierw oblicz cenę jednego kilograma." },
  "Prostopadłościan i objętość": { all: ["30", ["cm3", "cm³"]], hint: "Pomnóż trzy wymiary: 5 × 2 × 3." },
  "Układ współrzędnych": { all: ["lewo", "gore"], hint: "Ujemne x oznacza lewo, dodatnie y — w górę." },
  "Części zdania": { all: ["czyta"], hint: "Orzeczenie informuje, co robi Ola." },
  "Przypadki w języku polskim": { any: ["kim", "czym"], hint: "Narzędnik odpowiada m.in. na pytania: z kim? z czym?" },
  "Środki stylistyczne": { any: ["porownanie", "porownaniem"], hint: "Słowo „jak” łączy zestawiane ze sobą zjawiska." },
  "Fotosynteza — równanie i warunki": { all: ["glukoza", "tlen"], hint: "Powstaje cukier będący źródłem energii oraz gaz uwalniany do otoczenia." },
  "Siła i jej pomiar": { all: ["niuton"], hint: "Nazwa jednostki zaczyna się na literę N." },
  "Masa i ciężar": { any: ["nie zmieni sie", "pozostaje taka sama", "taka sama"], hint: "Masa astronauty pozostaje taka sama, choć ciężar na Księżycu jest mniejszy." },
  "Mieszaniny jednorodne i niejednorodne": { any: ["niejednorodna", "nie jednorodna", "heterogeniczna"], hint: "Widać osobno składniki piasku i wody." },
  "Odczyn kwaśny, obojętny i zasadowy": { all: ["zasadowy"], hint: "pH większe od 7 oznacza odczyn zasadowy." },
  "Pogoda i klimat": { all: ["klimat"], hint: "To pojęcie opisuje typowe warunki z wielolecia." },
  "Szerokość i długość geograficzna": { all: ["rownik"], hint: "Ta linia ma szerokość geograficzną 0°." },
  "Ruch obiegowy Ziemi i pory roku": { all: ["nachylenie", "osi"], hint: "Liczy się nachylenie osi Ziemi podczas obiegu wokół Słońca." },
  "Konstytucja i trójpodział władzy": { all: ["sadowa"], hint: "Sądy sprawują władzę sądowniczą." },
  "Unia Europejska": { all: ["nie wszystkie"], hint: "Polska jest przykładem państwa UE, które nadal ma własną walutę." },
  "Prawa i obowiązki ucznia": { all: ["statut", "szkoly"], hint: "Sprawdź dokument określający zasady w twojej szkole." },
  "Bezpieczne źródła informacji": { all: ["autora", ["datę", "date"]], hint: "Sprawdź, kto opublikował informację i kiedy." },
  "Największy wspólny dzielnik i najmniejsza wspólna wielokrotność": { all: ["6"], hint: "Szukamy największej liczby, która dzieli zarówno 12, jak i 18." },
  "Rozkład na czynniki pierwsze": { any: ["2 × 2 × 3", "2^2 × 3", "2 razy 2 razy 3"], hint: "Podziel 12 przez 2, a wynik 6 jeszcze raz przez 2." },
  "Pierwiastek kwadratowy": { all: ["9"], hint: "Sprawdź, jaka liczba pomnożona przez siebie daje 81." },
  "Potęgi": { all: ["125"], hint: "5³ oznacza 5 × 5 × 5." },
  "Cechy podzielności": { any: ["konczy sie na 5", "ostatnia cyfra to 5"], hint: "Spójrz na ostatnią cyfrę liczby. Liczby kończące się na 0 lub 5 dzielą się przez 5." },
  "Pole powierzchni prostopadłościanu": { any: ["3", "trzy"], hint: "Przeciwległe ściany tworzą trzy pary." }
};

function isNewQuestionDuringLesson(value) {
  const text = normalize(value);
  const raw = String(value ?? "");
  if (raw.includes("?") || /^(co to jest|czym jest|jak dziala|dlaczego|czemu|kto|gdzie|kiedy|ile wynosi|wyjasnij|wytlumacz)\b/.test(text)) {
    return true;
  }
  return /\d/.test(raw) && calculate(value) !== null;
}

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

function splitStudySentences(text) {
  return String(text ?? "")
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+|\n+/)
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length >= 18)
    .slice(0, 30);
}

function extractStudyMaterial(question) {
  const raw = String(question ?? "").trim();
  const intentText = normalize(raw);
  if (!/\b(notatk\w*|streszcz\w*|stresc\w*|podsum\w*|quiz|test|przepytaj mnie)\b/.test(intentText)) return "";

  const colonIndex = raw.indexOf(":");
  let material = "";
  if (colonIndex >= 0 && /\b(notatk\w*|streszcz\w*|stresc\w*|podsum\w*|quiz|test|przepytaj mnie)\b/.test(normalize(raw.slice(0, colonIndex)))) {
    material = raw.slice(colonIndex + 1).trim();
  } else {
    const match = raw.match(/(?:z tego tekstu|z tekstu|z materiału|z materialu|z fragmentu|na podstawie(?: tekstu| materiału| materialu)?)\s*:?\s*([\s\S]{40,})/i);
    if (match) material = match[1].trim();
  }

  return material.length >= 40 ? material.slice(0, MAX_QUESTION_LENGTH) : "";
}

function rankStudySentences(material) {
  const sentences = splitStudySentences(material);
  if (!sentences.length) return [];

  const frequencies = new Map();
  const sentenceTokens = sentences.map(sentence => {
    const tokens = lexicalTokens(sentence).filter(token => token.length >= 4 && !STOPWORDS.has(token));
    for (const token of tokens) frequencies.set(token, (frequencies.get(token) || 0) + 1);
    return tokens;
  });

  return sentences
    .map((sentence, index) => ({
      sentence,
      index,
      tokens: sentenceTokens[index],
      score: sentenceTokens[index].reduce((total, token) => total + Math.min(frequencies.get(token) || 1, 4), 0)
        + (/[0-9]/.test(sentence) ? 2 : 0)
        + (sentence.length > 45 && sentence.length < 240 ? 1 : 0)
    }))
    .sort((left, right) => right.score - left.score || left.index - right.index);
}

function createStudyNote(material) {
  const ranked = rankStudySentences(material);
  if (!ranked.length) return null;
  const keyPoints = ranked.slice(0, Math.min(5, ranked.length)).sort((left, right) => left.index - right.index);
  const frequencies = new Map();
  for (const item of ranked) {
    for (const token of item.tokens) frequencies.set(token, (frequencies.get(token) || 0) + 1);
  }
  const keyTerms = [...frequencies.entries()]
    .sort((left, right) => right[1] - left[1] || right[0].length - left[0].length)
    .slice(0, 6)
    .map(([term]) => term);

  return `## 📝 Notatka z wklejonego materiału\n\n**Najważniejsze punkty**\n${keyPoints.map(item => `• ${item.sentence}`).join("\n")}\n\n**Słowa kluczowe**\n${keyTerms.join(" • ")}\n\nNotatka powstała wyłącznie z wklejonego tekstu. Jeśli czegoś w nim nie ma, nie dopowiadam tego z pamięci.`;
}

function createTextQuiz(material) {
  const ranked = rankStudySentences(material);
  const selected = ranked.slice(0, 3).sort((left, right) => left.index - right.index);
  return selected.map(item => {
    const candidates = item.sentence.match(/[\p{L}][\p{L}-]{4,}/gu) || [];
    const answer = candidates
      .map(word => ({ word, frequency: item.tokens.includes(normalize(word)) ? 1 : 0 }))
      .filter(candidate => candidate.frequency)
      .sort((left, right) => right.word.length - left.word.length)[0]?.word;
    if (!answer) return null;
    const escaped = answer.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const question = item.sentence.replace(new RegExp(escaped, "i"), "________");
    return { question, answer, sentence: item.sentence };
  }).filter(Boolean);
}

function startTextQuiz(quiz, index = 0) {
  const item = quiz[index];
  if (!item) return null;
  return `## 🧩 Quiz — pytanie ${index + 1}/${quiz.length}\n\nUzupełnij zdanie jednym słowem z tekstu:\n\n> ${item.question}\n\nOdpowiedz własnymi słowami. Jeśli utkniesz, napisz „podpowiedź”.`;
}

function getActiveTextQuiz(history) {
  const safeHistory = getSafeHistory(history);
  let latestAssistantIndex = -1;
  for (let index = safeHistory.length - 1; index >= 0; index--) {
    if (safeHistory[index].role === "model") {
      latestAssistantIndex = index;
      break;
    }
  }
  if (latestAssistantIndex < 0) return null;

  const latestAnswer = safeHistory[latestAssistantIndex].text;
  const step = latestAnswer.match(/## 🧩 (?:Quiz|Podpowiedź|Spróbuj jeszcze raz) — pytanie (\d+)\/(\d+)/);
  if (!step) return null;
  const currentIndex = Number(step[1]) - 1;
  let sourcePrompt = "";
  for (let index = latestAssistantIndex - 1; index >= 0; index--) {
    if (safeHistory[index].role !== "user") continue;
    const candidate = safeHistory[index].text;
    if (extractStudyMaterial(candidate)) {
      sourcePrompt = candidate;
      break;
    }
  }
  if (!sourcePrompt) return null;

  const material = extractStudyMaterial(sourcePrompt);
  const quiz = createTextQuiz(material);
  if (currentIndex < 0 || currentIndex >= quiz.length) return null;
  return { quiz, currentIndex };
}

function gradeTextQuizAnswer(quiz, index, answer) {
  const item = quiz[index];
  if (!item) return null;
  const expected = normalize(item.answer);
  const actualTokens = lexicalTokens(answer);
  const correct = containsPhrase(answer, expected)
    || actualTokens.some(token => tokenStemMatch(token, expected));

  if (!correct && /\b(podpowiedz|podpowiedzi|nie wiem|nie rozumiem)\b/.test(normalize(answer))) {
    return `## 🧩 Podpowiedź — pytanie ${index + 1}/${quiz.length}\n\nWróć do zdania z luką i poszukaj w nim nazwy lub pojęcia, które najlepiej pasuje do brakującego miejsca. Spróbuj jeszcze raz.`;
  }
  if (!correct) {
    return `## 🧩 Spróbuj jeszcze raz — pytanie ${index + 1}/${quiz.length}\n\nOdpowiedź znajdziesz w zdaniu z luką. Poszukaj dokładnego słowa użytego w materiale. Możesz napisać „podpowiedź”.`;
  }

  if (index + 1 >= quiz.length) {
    return `## 🧩 Quiz zakończony!\n\nDobra robota — odpowiedzi zostały sprawdzone na podstawie wklejonego tekstu.\n\n**Zapamiętaj:** ${item.sentence}`;
  }

  return `## 🧩 Dobra odpowiedź!\n\nSprawdziłem ją w materiale.\n\n${startTextQuiz(quiz, index + 1)}`;
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
  if (Math.min(left.length, right.length) < 4) return false;
  const suffixes = ["owego", "owych", "owej", "aniem", "eniem", "owaniu", "owania", "ami", "ach", "owie", "osci", "osc", "eniu", "enie", "ania", "anie", "owym", "ego", "emu", "owa", "owe", "owi", "om", "ow", "ie", "em", "ym", "im", "mi", "ii", "ia", "iu", "y", "a", "e", "u", "i", "ą", "ę"];
  const stem = value => {
    for (const suffix of suffixes) {
      if (value.length - suffix.length >= 3 && value.endsWith(suffix)) return value.slice(0, -suffix.length);
    }
    return value;
  };
  if (stem(left) === stem(right)) return true;
  if (Math.min(left.length, right.length) >= 5 && Math.max(left.length, right.length) >= 6 && Math.abs(left.length - right.length) <= 1) {
    let leftIndex = 0;
    let rightIndex = 0;
    let edits = 0;
    while (leftIndex < left.length && rightIndex < right.length) {
      if (left[leftIndex] === right[rightIndex]) {
        leftIndex++;
        rightIndex++;
        continue;
      }
      edits++;
      if (edits > 1) break;
      if (left.length > right.length) leftIndex++;
      else if (right.length > left.length) rightIndex++;
      else if (left[leftIndex + 1] === right[rightIndex] && left[leftIndex] === right[rightIndex + 1]) {
        leftIndex += 2;
        rightIndex += 2;
      } else {
        leftIndex++;
        rightIndex++;
      }
    }
    if (leftIndex < left.length || rightIndex < right.length) edits++;
    if (edits <= 1) return true;
  }
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
  const query = expandKnowledgeQuery(question);
  const questionTokens = query.tokens;
  if (!questionTokens.length) return [];
  const requestedSubject = getRequestedSubject(question);
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
    if (query.grade && Array.isArray(item.grades)) {
      if (!item.grades.includes(query.grade)) continue;
      score += 12;
    }
    if (requestedSubject && item.subject) {
      const subjectAliases = {
        "język polski": ["język polski", "lektury szkolne"],
        "biologia i przyroda": ["biologia i przyroda", "biologia", "przyroda"],
        "język angielski": ["język angielski", "angielski"]
      };
      const acceptedSubjects = subjectAliases[requestedSubject] || [requestedSubject];
      if (acceptedSubjects.some(subject => normalize(item.subject) === normalize(subject))) score += 28;
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
  return /\b(aktualnie|obecnie|dzisiaj|dzis|jutro|wczoraj|najnowsz\w*|na zywo|teraz|aktualn\w*|ostatnie wiadomosci|co nowego|co wiadomo|co sie dzieje|co sie wydarzylo|ostatnie informacje|ostatnie wydarzenia|na swiecie)\b/.test(text)
    || /\b(mecz|mecze|spotkanie|terminarz|wynik meczu|pogoda|kurs walut|kurs euro|kurs dolara|aktualnosci|wiadomosci)\b/.test(text)
    || /\b(podstawa programowa|wymagania programowe|program nauczania|reforma26|kompas jutra|program nauczania arkona|szkola arkona)\b/.test(text);
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

function getBroadSubjectOnlyQuestion(question) {
  const normalized = normalize(question);
  const subjects = [
    ["matematyka", /\b(matm\w*|matematyk\w*|maths?|mathematics?)\b/],
    ["język polski", /\b(jezyk polski|polski|polskiego|polszczyzna)\b/],
    ["język angielski", /\b(jezyk angielski|angielski|angielskiego|english)\b/],
    ["biologia i przyroda", /\b(biologi\w*|przyrod\w*)\b/],
    ["fizyka", /\b(fizyk\w*|physics)\b/],
    ["chemia", /\b(chem\w*|chemistry)\b/],
    ["historia", /\b(histori\w*|history)\b/],
    ["geografia", /\b(geografi\w*|geography)\b/],
    ["informatyka", /\b(informatyka|informatyki|informatyce|computer science)\b/]
  ];
  const matched = subjects.find(([, pattern]) => pattern.test(normalized));
  if (!matched) return null;

  const grade = getRequestedSchoolGrade(question) || Number(normalized.match(/\b([4-8])\b/)?.[1]) || null;
  let remainder = normalized;
  for (const [, pattern] of subjects) remainder = remainder.replace(new RegExp(pattern.source, "g"), " ");
  remainder = remainder
    .replace(/\b(?:klas(?:a|y|ie|e|ach)?|grade|class)\s*(?:iv|viii|vii|vi|v|[4-8]|czwartej|czwarta|czwarty|piatej|piata|piaty|szostej|szosta|szosty|siodmej|siodma|siodmy|osmej|osma|osmy)\b/g, " ")
    .replace(/\b(?:iv|viii|vii|vi|v|[4-8])\s+klas(?:a|y|ie|e|ach)\b/g, " ")
    .replace(/\b(?:dla|z|mi|pomoz|pomocy|prosze|temat|tematu|przedmiot|przedmiotu|nauka|nauki|zakres|zakresu|podstawowe|tematy|dzial|dzialy|lekcja|lekcji|material|materialy|chce|chcialbym|chcialabym|ucze|sie|poznac|powtorka|powtorki|moj|moja|to)\b/g, " ")
    .replace(/\b[4-8]\b/g, " ")
    .replace(/[.,!?;:]/g, " ")
    .replace(/\s+/g, " ").trim();
  return remainder ? null : { subject: matched[0], grade };
}

function createBroadSubjectAnswer(question) {
  const request = getBroadSubjectOnlyQuestion(question);
  if (!request) return null;
  const examples = {
    matematyka: "ułamki, procenty, obliczenia i geometrię",
    "język polski": "gramatykę, pisanie, analizę tekstu i lektury",
    "język angielski": "słownictwo, gramatykę, wymowę i krótkie dialogi",
    "biologia i przyroda": "organizmy, ekosystemy, ciało człowieka i doświadczenia przyrodnicze",
    fizyka: "ruch, siły, energię, ciepło, światło i obwody elektryczne",
    chemia: "budowę materii, pierwiastki, mieszaniny, roztwory i reakcje",
    historia: "chronologię, wydarzenia, źródła historyczne i ich przyczyny",
    geografia: "mapy, krajobrazy, klimat, ludność i pracę z danymi",
    informatyka: "algorytmy, programowanie, arkusze i bezpieczeństwo cyfrowe"
  };
  const gradeLabel = request.grade ? `, klasa ${request.grade}` : "";
  return `🐨 Pomogę z ${request.subject}${gradeLabel}. Mogę wyjaśnić ${examples[request.subject]}, rozwiązać zadanie krok po kroku albo zrobić krótką powtórkę.\n\nNapisz konkretny temat lub wklej zadanie. Kolejność materiału w ARKONIE ustala szkolny program i nauczyciel, więc nie zgaduję, który dział macie teraz.`;
}

function getQuestionRoute(question, localAnswer = "", history = []) {
  const text = String(question ?? "").trim();
  if (!text) return { kind: "empty", shouldSearchWeb: false };
  if (isGreetingMessage(text)) return { kind: "greeting", shouldSearchWeb: false };
  if (isThanksMessage(text)) return { kind: "thanks", shouldSearchWeb: false };
  if (isSocialMessage(text)) return { kind: "social", shouldSearchWeb: false };

  const normalized = normalize(text);
  if (getBroadSubjectOnlyQuestion(text)) return { kind: "subject-menu", shouldSearchWeb: false, topic: null, searchQuery: null };
  if (!asksToSearchOnline(text)) {
    const literatureItem = findLiteratureKnowledgeItem(text);
    if (literatureItem) return { kind: "literature", shouldSearchWeb: false, topic: literatureItem.title, searchQuery: null };
    const literatureList = formatLiteratureListAnswer(text);
    if (literatureList) return { kind: "literature-list", shouldSearchWeb: false, topic: "lektury szkolne", searchQuery: null };
  }
  const topic = findKnowledge(text);
  const equationAnswer = solveLinearEquation(text);
  if (equationAnswer) return { kind: "math", shouldSearchWeb: false };
  const math = calculate(text) !== null;
  if (math) return { kind: "math", shouldSearchWeb: false };
  if (solvePhysicsProblem(text)) return { kind: "physics-calculation", shouldSearchWeb: false };

  if (getIntent(text) === "study-plan" && !asksToSearchOnline(text) && !isCurrentInformationQuestion(text)) {
    return { kind: "study-plan", shouldSearchWeb: false, topic: findKnowledge(text)?.title || null };
  }

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
  if (/\b(plan(?:u)? nauk\w*|rozpisz plan|przygotuj plan|uloz plan|plan powtork\w*|zaplanuj nauk\w*|15[\s-]*minut\w*.{0,18}\bplan|study plan|revision plan|15[\s-]*minute\w*.{0,18}\bplan)\b/.test(text)
    || /\b(?:uloz|rozpisz|przygotuj|zaplanuj|make|create|prepare)\w*.{0,24}\bplan\b/.test(text)) return "study-plan";
  if (/\b(quiz|test|sprawdz mnie|przepytaj mnie|zrob quiz|pytanie sprawdzajace|test me|quiz me)\b/.test(text)) return "quiz";
  if (/\b(notatk\w*|streszcz\w*|stresc\w*|podsumuj\w*|podsumowani\w*|skroc\w*|najwazniejsz\w*|summari[sz]e|short summary)\b/.test(text)) return "summary";
  if (/\b(porownaj|roznica miedzy|czym sie rozni|podobienstwa|compare|difference between)\b/.test(text)) return "compare";
  if (/\b(przyklad\w*|podaj przyklad|daj przyklad|example|for instance)\b/.test(text)) return "example";
  if (/\b(prosciej|latwiej|nie rozumiem|wytlumacz\w*|wyjasn\w*|po ludzku|simpler|more simply|explain simply)\b/.test(text)) return "simple";
  if (/\b(dlaczego|czemu|z jakiego powodu|why)\b/.test(text)) return "why";
  if (/\b(rozwin\w*|rozszerz\w*|dokladniej|wiecej|opowiedz wiecej|szerzej|elaborate|more detail)\b/.test(text)) return "expand";
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

function formatKnowledgeComparison(items, question = "") {
  const uniqueItems = [...new Map(items.map(item => [item.title, item])).values()].slice(0, 3);
  if (uniqueItems.length < 2) return null;
  const sections = uniqueItems.map(item => `### ${item.title}\n${item.short}\n\n**Przykład:** ${item.example}`);
  return `## 🐨 Porównajmy pojęcia\n\n${sections.join("\n\n---\n\n")}\n\n**Najważniejsza wskazówka:** zwróć uwagę na to, co każde pojęcie opisuje i do czego służy.${createCurriculumNote(question)}`;
}

function findExplicitKnowledgeTopics(question) {
  const normalized = normalize(question);
  if (!/\b(i|oraz|a takze|and)\b|[,;]/.test(normalized)) return [];
  const clauses = normalized.split(/\b(?:i|oraz|a takze|and)\b|[,;]/)
    .map(part => part.trim())
    .filter(part => lexicalTokens(part).filter(token => !KNOWLEDGE_QUERY_FILLERS.has(token)).length >= 1);
  const items = [];
  for (const clause of clauses) {
    const item = findKnowledge(clause);
    const clauseTokens = lexicalTokens(clause).filter(token => !KNOWLEDGE_QUERY_FILLERS.has(token));
    const itemTokens = lexicalTokens([item?.title, ...(item?.keywords || []), ...(item?.aliases || [])].filter(Boolean).join(" "));
    const hasDirectTopicMatch = clauseTokens.some(token => itemTokens.some(candidate => tokenStemMatch(token, candidate)));
    if (item && hasDirectTopicMatch && !items.some(existing => existing.title === item.title)) items.push(item);
    if (items.length >= 3) break;
  }
  return items.length >= 2 ? items : [];
}

function formatKnowledgeBundle(items, intent = "normal", question = "") {
  const uniqueItems = [...new Map(items.map(item => [item.title, item])).values()].slice(0, 3);
  if (uniqueItems.length < 2) return null;
  const sections = uniqueItems.map(item => {
    if (intent === "example") return `**${item.title}**\n${item.example}\n\nSprawdź: ${item.check}`;
    if (intent === "simple") return `**${item.title}**\n${item.short}\n\nPrzykład: ${item.example}`;
    if (intent === "summary") return `**${item.title}**\n${item.short}\n\nZapamiętaj: ${item.related}`;
    if (intent === "why") return `**${item.title}**\n${item.related}\n\nDokładniej: ${item.explanation}`;
    if (intent === "expand") return `**${item.title}**\n${item.short}\n\n${item.explanation}\n\nPrzykład: ${item.example}\n\nZapamiętaj: ${item.related}`;
    return `**${item.title}**\n${item.short}\n\n${item.explanation}\n\nPrzykład: ${item.example}`;
  });
  return `🐨 Rozbijmy pytanie na części\n\n${sections.join("\n\n---\n\n")}\n\nJeśli chcesz, mogę teraz porównać te pojęcia albo przygotować do nich krótkie ćwiczenie.${createCurriculumNote(question)}`;
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
  return /\b(wiadomosci|aktualnosci|wydarzenia|co sie dzieje|co sie wydarzylo|co nowego|na swiecie|ze swiata|najnowsz|ostatnie wydarzenia)\b/.test(text);
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
  const decimalInput = String(input ?? "").replace(/(\d),(\d)/g, "$1.$2");
  const original = normalize(decimalInput).replace(/^(ile (?:to|wynosi|jest)|oblicz|policz) /, "");
  const match = original.match(/^(-?\d+(?:\.\d+)?)\s*(?:%|procent(?:y|ow|a)?)\s*(?:z\s*)?(-?\d+(?:\.\d+)?)$/);
  if (!match) return null;
  const percentage = Number(match[1].replace(",", "."));
  const whole = Number(match[2].replace(",", "."));
  const result = percentage * whole / 100;
  if (!Number.isFinite(result)) return null;
  return `## 🐨 Procenty — wynik: ${formatNumber(result)}\n\n1. Zamieniamy procent na ułamek: ${formatNumber(percentage)}% = ${formatNumber(percentage / 100)}.\n2. Mnożymy przez całość: ${formatNumber(percentage / 100)} × ${formatNumber(whole)}.\n3. Otrzymujemy **${formatNumber(result)}**.\n\n💡 Procent oznacza jedną setną całości.`;
}

function greatestCommonDivisor(a, b) {
  let left = a < 0n ? -a : a;
  let right = b < 0n ? -b : b;
  while (right !== 0n) [left, right] = [right, left % right];
  return left || 1n;
}

function reduceFraction(numerator, denominator) {
  if (denominator < 0n) {
    numerator = -numerator;
    denominator = -denominator;
  }
  const divisor = greatestCommonDivisor(numerator, denominator);
  return { numerator: numerator / divisor, denominator: denominator / divisor };
}

function formatFraction(numerator, denominator) {
  const fraction = reduceFraction(numerator, denominator);
  if (fraction.denominator === 1n) return String(fraction.numerator);
  const absoluteNumerator = fraction.numerator < 0n ? -fraction.numerator : fraction.numerator;
  if (absoluteNumerator < fraction.denominator) return `${fraction.numerator}/${fraction.denominator}`;
  const whole = absoluteNumerator / fraction.denominator;
  const remainder = absoluteNumerator % fraction.denominator;
  const sign = fraction.numerator < 0n ? "−" : "";
  return remainder === 0n
    ? `${sign}${whole}`
    : `${sign}${whole} ${remainder}/${fraction.denominator}`;
}

function solveFractionOperation(input) {
  let expression = String(input ?? "")
    .toLocaleLowerCase("pl-PL")
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[×·]/g, "*")
    .replace(/÷/g, "/")
    .replace(/\b(ile to(?: jest)?|oblicz|policz|uprosc|wykonaj dzialanie)\b/g, " ")
    .replace(/\b(plus|dodaj)\b/g, "+")
    .replace(/\b(minus|odejmij)\b/g, "-")
    .replace(/\b(razy|pomnoz przez)\b/g, "*")
    .replace(/\b(podzielone przez|podziel przez)\b/g, "/")
    .replace(/\s+/g, "");
  const match = expression.match(/^([+-]?\d{1,12})\/(\d{1,12})([+*/-])([+-]?\d{1,12})\/(\d{1,12})$/);
  if (!match) return null;

  const [, leftNumeratorText, leftDenominatorText, operator, rightNumeratorText, rightDenominatorText] = match;
  const leftNumerator = BigInt(leftNumeratorText);
  const leftDenominator = BigInt(leftDenominatorText);
  const rightNumerator = BigInt(rightNumeratorText);
  const rightDenominator = BigInt(rightDenominatorText);
  if (leftDenominator === 0n || rightDenominator === 0n) return "Nie można zapisać ułamka z mianownikiem równym zero.";
  if (operator === "/" && rightNumerator === 0n) return "Nie można dzielić przez zero.";

  let numerator;
  let denominator;
  let method;
  if (["+", "-"].includes(operator)) {
    const commonDenominator = leftDenominator * rightDenominator;
    const adjustedLeft = leftNumerator * rightDenominator;
    const adjustedRight = rightNumerator * leftDenominator;
    numerator = operator === "+" ? adjustedLeft + adjustedRight : adjustedLeft - adjustedRight;
    denominator = commonDenominator;
    method = `Sprowadzamy ułamki do wspólnego mianownika ${commonDenominator}: ${leftNumerator}/${leftDenominator} ${operator} ${rightNumerator}/${rightDenominator} = ${adjustedLeft}/${commonDenominator} ${operator} ${adjustedRight}/${commonDenominator}.`;
  } else if (operator === "*") {
    numerator = leftNumerator * rightNumerator;
    denominator = leftDenominator * rightDenominator;
    method = `Mnożymy liczniki i mianowniki: (${leftNumerator} × ${rightNumerator}) / (${leftDenominator} × ${rightDenominator}) = ${numerator}/${denominator}.`;
  } else {
    numerator = leftNumerator * rightDenominator;
    denominator = leftDenominator * rightNumerator;
    method = `Mnożenie przez odwrotność drugiego ułamka: (${leftNumerator}/${leftDenominator}) × (${rightDenominator}/${rightNumerator}) = ${numerator}/${denominator}.`;
  }

  const reduced = reduceFraction(numerator, denominator);
  const result = formatFraction(reduced.numerator, reduced.denominator);
  const simplified = `${reduced.numerator}/${reduced.denominator}`;
  const reductionStep = reduced.numerator === numerator && reduced.denominator === denominator
    ? "Otrzymany ułamek jest już nieskracalny."
    : `Skracamy ułamek ${numerator}/${denominator} przez ${greatestCommonDivisor(numerator, denominator)}: ${simplified}.`;

  return `## 🐨 Ułamki krok po kroku\n\n${method}\n\n${reductionStep}\n\n**Wynik: ${result}**`;
}

function solveUnitConversion(input) {
  const text = String(input ?? "")
    .toLocaleLowerCase("pl-PL")
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/²/g, "2")
    .replace(/,/g, ".")
    .trim();
  const match = text.match(/^\s*(?:(?:zamien|przelicz|ile to|ile wynosi|oblicz|policz)\s+)?([+-]?\d+(?:\.\d+)?)\s*([a-z0-9]+)\s+(?:na|w|to)\s+([a-z0-9]+)\s*\??\s*$/);
  if (!match) return null;

  const [, valueText, fromText, toText] = match;
  const units = {
    mm: { dimension: "length", factor: 0.001, label: "mm" }, millimetr: { dimension: "length", factor: 0.001, label: "mm" }, millimetry: { dimension: "length", factor: 0.001, label: "mm" }, millimetrow: { dimension: "length", factor: 0.001, label: "mm" },
    cm: { dimension: "length", factor: 0.01, label: "cm" }, centymetr: { dimension: "length", factor: 0.01, label: "cm" }, centymetry: { dimension: "length", factor: 0.01, label: "cm" }, centymetrow: { dimension: "length", factor: 0.01, label: "cm" },
    dm: { dimension: "length", factor: 0.1, label: "dm" }, decymetr: { dimension: "length", factor: 0.1, label: "dm" }, decymetry: { dimension: "length", factor: 0.1, label: "dm" }, decymetrow: { dimension: "length", factor: 0.1, label: "dm" },
    m: { dimension: "length", factor: 1, label: "m" }, metr: { dimension: "length", factor: 1, label: "m" }, metry: { dimension: "length", factor: 1, label: "m" }, metrow: { dimension: "length", factor: 1, label: "m" }, metra: { dimension: "length", factor: 1, label: "m" },
    km: { dimension: "length", factor: 1000, label: "km" }, kilometr: { dimension: "length", factor: 1000, label: "km" }, kilometry: { dimension: "length", factor: 1000, label: "km" }, kilometrow: { dimension: "length", factor: 1000, label: "km" }, kilometra: { dimension: "length", factor: 1000, label: "km" },
    mm2: { dimension: "area", factor: 0.000001, label: "mm²" }, cm2: { dimension: "area", factor: 0.0001, label: "cm²" }, dm2: { dimension: "area", factor: 0.01, label: "dm²" }, m2: { dimension: "area", factor: 1, label: "m²" }, km2: { dimension: "area", factor: 1000000, label: "km²" }, ha: { dimension: "area", factor: 10000, label: "ha" }, hektar: { dimension: "area", factor: 10000, label: "ha" }, hektary: { dimension: "area", factor: 10000, label: "ha" },
    mg: { dimension: "mass", factor: 0.000001, label: "mg" }, miligram: { dimension: "mass", factor: 0.000001, label: "mg" }, miligramy: { dimension: "mass", factor: 0.000001, label: "mg" },
    g: { dimension: "mass", factor: 0.001, label: "g" }, gram: { dimension: "mass", factor: 0.001, label: "g" }, gramy: { dimension: "mass", factor: 0.001, label: "g" }, gramow: { dimension: "mass", factor: 0.001, label: "g" },
    kg: { dimension: "mass", factor: 1, label: "kg" }, kilogram: { dimension: "mass", factor: 1, label: "kg" }, kilogramy: { dimension: "mass", factor: 1, label: "kg" }, kilogramow: { dimension: "mass", factor: 1, label: "kg" },
    t: { dimension: "mass", factor: 1000, label: "t" }, tona: { dimension: "mass", factor: 1000, label: "t" }, tony: { dimension: "mass", factor: 1000, label: "t" }, ton: { dimension: "mass", factor: 1000, label: "t" },
    ml: { dimension: "volume", factor: 0.001, label: "ml" }, mililitr: { dimension: "volume", factor: 0.001, label: "ml" }, mililitry: { dimension: "volume", factor: 0.001, label: "ml" },
    l: { dimension: "volume", factor: 1, label: "l" }, litr: { dimension: "volume", factor: 1, label: "l" }, litry: { dimension: "volume", factor: 1, label: "l" }, litrow: { dimension: "volume", factor: 1, label: "l" },
    s: { dimension: "time", factor: 1, label: "s" }, sekunda: { dimension: "time", factor: 1, label: "s" }, sekundy: { dimension: "time", factor: 1, label: "s" }, sekund: { dimension: "time", factor: 1, label: "s" },
    min: { dimension: "time", factor: 60, label: "min" }, minuta: { dimension: "time", factor: 60, label: "min" }, minuty: { dimension: "time", factor: 60, label: "min" }, minut: { dimension: "time", factor: 60, label: "min" },
    h: { dimension: "time", factor: 3600, label: "h" }, godz: { dimension: "time", factor: 3600, label: "h" }, godzina: { dimension: "time", factor: 3600, label: "h" }, godziny: { dimension: "time", factor: 3600, label: "h" }, godzin: { dimension: "time", factor: 3600, label: "h" },
    doba: { dimension: "time", factor: 86400, label: "d" }, doby: { dimension: "time", factor: 86400, label: "d" }, dni: { dimension: "time", factor: 86400, label: "d" }
  };
  const from = units[fromText];
  const to = units[toText];
  if (!from || !to || from.dimension !== to.dimension) return null;

  const value = Number(valueText);
  const result = value * from.factor / to.factor;
  if (!Number.isFinite(result)) return null;
  return `## 🐨 Zamiana jednostek krok po kroku\n\n1. ${from.label} = ${formatNumber(from.factor / to.factor)} ${to.label}.\n2. Mnożymy: ${formatNumber(value)} × ${formatNumber(from.factor / to.factor)}.\n\n**Wynik: ${formatNumber(result)} ${to.label}**`;
}

function getNumbersFromProblem(text) {
  const normalized = normalize(String(text ?? "").replace(/,/g, "."))
    .replace(/\b(?:mm|cm|dm|km|m|kg|g|ml|l)\b/g, " ");
  return [...normalized.matchAll(/-?\d+(?:\.\d+)?/g)].map(match => Number(match[0]));
}

function solveGeometryProblem(question) {
  const text = normalize(String(question ?? "").replace(/,/g, "."));
  const numbers = getNumbersFromProblem(question);
  const isArea = /\bpole\b/.test(text);
  const isPerimeter = /\bobwod\b/.test(text);
  if ((!isArea && !isPerimeter) || numbers.some(value => !Number.isFinite(value) || value < 0)) return null;

  if (/\bkwadrat\w*/.test(text) && numbers.length === 1) {
    const side = numbers[0];
    if (isArea) return `## 🐨 Pole kwadratu krok po kroku\n\nWzór: P = a × a.\n\nPodstawiamy bok ${formatNumber(side)}: P = ${formatNumber(side)} × ${formatNumber(side)}.\n\n**Pole wynosi ${formatNumber(side * side)} jednostek².**`;
    if (isPerimeter) return `## 🐨 Obwód kwadratu krok po kroku\n\nKwadrat ma cztery równe boki, więc O = 4 × a.\n\nO = 4 × ${formatNumber(side)}.\n\n**Obwód wynosi ${formatNumber(4 * side)} jednostek.**`;
  }

  if (/\bprostokat\w*/.test(text) && numbers.length === 2) {
    const [a, b] = numbers;
    if (isArea) return `## 🐨 Pole prostokąta krok po kroku\n\nWzór: P = a × b.\n\nP = ${formatNumber(a)} × ${formatNumber(b)}.\n\n**Pole wynosi ${formatNumber(a * b)} jednostek².**`;
    if (isPerimeter) return `## 🐨 Obwód prostokąta krok po kroku\n\nWzór: O = 2a + 2b.\n\nO = 2 × ${formatNumber(a)} + 2 × ${formatNumber(b)} = ${formatNumber(2 * a)} + ${formatNumber(2 * b)}.\n\n**Obwód wynosi ${formatNumber(2 * a + 2 * b)} jednostek.**`;
  }

  if (/\btrojkat\w*/.test(text) && isArea && numbers.length === 2) {
    const [base, height] = numbers;
    return `## 🐨 Pole trójkąta krok po kroku\n\nWzór: P = a × h ÷ 2.\n\nP = ${formatNumber(base)} × ${formatNumber(height)} ÷ 2 = ${formatNumber(base * height)} ÷ 2.\n\n**Pole wynosi ${formatNumber(base * height / 2)} jednostek².**`;
  }

  if (/\bkolo\w*/.test(text) && numbers.length === 1) {
    const radius = numbers[0];
    if (isArea) return `## 🐨 Pole koła krok po kroku\n\nWzór: P = πr².\n\nP = π × ${formatNumber(radius)}² = ${formatNumber(Math.PI)} × ${formatNumber(radius * radius)}.\n\n**Pole wynosi około ${formatNumber(Math.PI * radius * radius)} jednostek².**`;
    if (isPerimeter) return `## 🐨 Obwód koła krok po kroku\n\nWzór: O = 2πr.\n\nO = 2 × π × ${formatNumber(radius)}.\n\n**Obwód wynosi około ${formatNumber(2 * Math.PI * radius)} jednostek.**`;
  }
  return null;
}

function solvePythagoreanProblem(question) {
  const text = normalize(question);
  if (!/\b(pitagoras|przeciwprostokatn\w*)\b/.test(text)) return null;
  const numbers = getNumbersFromProblem(question);
  if (numbers.length !== 2 || numbers.some(value => !Number.isFinite(value) || value < 0)) return null;
  const [a, b] = numbers;
  const sum = a * a + b * b;
  const hypotenuse = Math.sqrt(sum);
  const rounded = Math.round(hypotenuse * 1e8) / 1e8;
  return `## 🐨 Twierdzenie Pitagorasa krok po kroku\n\nDla przyprostokątnych a = ${formatNumber(a)} i b = ${formatNumber(b)} stosujemy wzór c² = a² + b².\n\n1. Podnosimy boki do kwadratu: ${formatNumber(a)}² + ${formatNumber(b)}² = ${formatNumber(a * a)} + ${formatNumber(b * b)}.\n2. Dodajemy: c² = ${formatNumber(sum)}.\n3. Obliczamy pierwiastek: c = √${formatNumber(sum)}.\n\n**Przeciwprostokątna ma około ${formatNumber(rounded)} jednostek.**`;
}

function solveAverageProblem(question) {
  const raw = String(question ?? "").toLocaleLowerCase("pl-PL").replace(/ł/g, "l").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const match = raw.match(/\bsrednia(?: arytmetyczna)?\b[\s\S]*?([+-]?\d[\d.,;\s]*)\s*$/);
  if (!match) return null;
  const listText = match[1].trim();
  const parts = listText.includes(";")
    ? listText.split(/;\s*/)
    : listText.split(/,\s+|\s+/);
  const values = parts.map(value => Number(value.replace(",", ".")));
  if (values.length < 2 || values.length > 30 || values.some(value => !Number.isFinite(value))) return null;
  const sum = values.reduce((total, value) => total + value, 0);
  const mean = sum / values.length;
  return `## 🐨 Średnia arytmetyczna krok po kroku\n\n1. Dodajemy liczby: ${values.map(formatNumber).join(" + ")} = ${formatNumber(sum)}.\n2. Dzielimy sumę przez liczbę wartości: ${formatNumber(sum)} ÷ ${values.length}.\n\n**Średnia wynosi ${formatNumber(mean)}.**`;
}

function solveGcdLcmProblem(question) {
  const text = normalize(question);
  const isGcd = /\b(nwd|najwieksz\w* wspoln\w* dzielnik)\b/.test(text);
  const isLcm = /\b(nww|najmniejsz\w* wspoln\w* wielokrotn\w*)\b/.test(text);
  if (!isGcd && !isLcm) return null;

  const rawValues = String(question ?? "").match(/\d{1,15}/g) || [];
  if (rawValues.length < 2 || rawValues.length > 12) return null;
  const values = rawValues.map(value => BigInt(value));
  const gcdWithSteps = (leftValue, rightValue) => {
    let left = leftValue < 0n ? -leftValue : leftValue;
    let right = rightValue < 0n ? -rightValue : rightValue;
    const steps = [];
    while (right !== 0n) {
      const remainder = left % right;
      steps.push(`${left} = ${left / right} × ${right} + ${remainder}`);
      [left, right] = [right, remainder];
    }
    return { value: left, steps };
  };

  let gcdResult = values[0];
  let lcmResult = values[0];
  const gcdSteps = [];
  const lcmSteps = [];
  for (let index = 1; index < values.length; index++) {
    const next = values[index];
    if (isGcd) {
      const { value: gcd, steps: euclid } = gcdWithSteps(gcdResult, next);
      gcdSteps.push(`NWD(${gcdResult}, ${next}): ${euclid.length ? `${euclid.join("; ")}.` : `${gcdResult} = ${gcd}.`}`);
      gcdResult = gcd;
    }
    if (isLcm) {
      const { value: gcd } = gcdWithSteps(lcmResult, next);
      const lcm = gcd === 0n ? 0n : (lcmResult / gcd) * next;
      const explanation = gcd === 0n
        ? `NWW(${lcmResult}, ${next}) = 0.`
        : `NWW(${lcmResult}, ${next}) = |${lcmResult} × ${next}| ÷ ${gcd} = ${lcm}.`;
      lcmSteps.push(explanation);
      lcmResult = lcm;
    }
  }
  const sections = [];
  if (isGcd) sections.push(`### Największy wspólny dzielnik\n${gcdSteps.map((step, index) => `${index + 1}. ${step}`).join("\n")}`);
  if (isLcm) sections.push(`### Najmniejsza wspólna wielokrotność\n${lcmSteps.map((step, index) => `${index + 1}. ${step}`).join("\n")}`);
  const result = isGcd && isLcm
    ? `NWD = ${gcdResult}; NWW = ${lcmResult}`
    : isGcd ? String(gcdResult) : String(lcmResult);
  const title = isGcd && isLcm ? "NWD i NWW" : isGcd ? "NWD" : "NWW";
  return `## 🐨 ${title} krok po kroku\n\n${sections.join("\n\n")}\n\n**Wynik: ${result}**`;
}

function solvePrimeFactorization(question) {
  const text = normalize(question);
  if (!/\b(rozloz|rozklad|czynniki pierwsze|faktoryzuj)\b/.test(text)) return null;
  const rawValues = String(question ?? "").match(/\d{1,10}/g) || [];
  if (rawValues.length !== 1) return null;
  const value = Number(rawValues[0]);
  if (!Number.isSafeInteger(value) || value < 2 || value > 1_000_000_000) return null;

  let remainder = value;
  const factors = [];
  const divisions = [];
  for (let divisor = 2; divisor * divisor <= remainder; divisor = divisor === 2 ? 3 : divisor + 2) {
    while (remainder % divisor === 0) {
      factors.push(divisor);
      divisions.push(`${remainder} ÷ ${divisor} = ${remainder / divisor}`);
      remainder /= divisor;
    }
  }
  if (remainder > 1) {
    factors.push(remainder);
    divisions.push(`${remainder} jest liczbą pierwszą`);
  }

  const grouped = [...new Set(factors)].map(factor => {
    const exponent = factors.filter(item => item === factor).length;
    return exponent > 1 ? `${factor}^${exponent}` : String(factor);
  });
  return `## 🐨 Rozkład na czynniki pierwsze\n\n${divisions.map((step, index) => `${index + 1}. ${step}`).join("\n")}\n\n**${value} = ${grouped.join(" × ")}**`;
}

function solveSquareRoot(question) {
  const raw = String(question ?? "").trim();
  const text = normalize(raw);
  const asksSquareRoot = raw.includes("√") || /\b(sqrt|pierwiastek kwadratowy|pierwiastek z|oblicz pierwiastek)\b/.test(text);
  if (!asksSquareRoot || /\b(stopnia|stopien)\b/.test(text)) return null;
  const numberMatch = raw.match(/-?\d+(?:[.,]\d+)?/);
  if (!numberMatch) return null;
  const value = Number(numberMatch[0].replace(",", "."));
  if (!Number.isFinite(value) || Math.abs(value) > 1e16) return null;
  if (value < 0) return "## 🐨 Pierwiastek kwadratowy\n\nW zbiorze liczb rzeczywistych nie ma pierwiastka kwadratowego z liczby ujemnej. Jeśli właśnie poznajesz liczby zespolone, napisz o tym.";

  const root = Math.sqrt(value);
  const rounded = Math.round(root * 1e8) / 1e8;
  if (Number.isInteger(root)) {
    return `## 🐨 Pierwiastek kwadratowy krok po kroku\n\nSzukamy liczby, która pomnożona przez siebie daje ${formatNumber(value)}.\n\n**√${formatNumber(value)} = ${formatNumber(root)}, ponieważ ${formatNumber(root)} × ${formatNumber(root)} = ${formatNumber(value)}.**`;
  }
  return `## 🐨 Pierwiastek kwadratowy krok po kroku\n\nSzukamy liczby, której kwadrat jest równy ${formatNumber(value)}. Ponieważ ${formatNumber(Math.floor(root))}² < ${formatNumber(value)} < ${formatNumber(Math.ceil(root))}², wynik nie jest liczbą całkowitą.\n\n**√${formatNumber(value)} ≈ ${formatNumber(rounded)}**`;
}

function solvePhysicsProblem(question) {
  const raw = String(question ?? "")
    .replace(/(\d),(\d)/g, "$1.$2")
    .replace(/²/g, "2")
    .replace(/³/g, "3");
  const text = normalize(raw);
  if (!/\b(oblicz|policz|wyznacz|znajdz|ile wynosi|jaka jest|jakie jest)\b/.test(text)) return null;

  function readQuantity(labels, units) {
    const match = text.match(new RegExp(`\\b(?:${labels})\\b\\s*(?:(?:wynosi|to|rowna sie|jest)\\s*)?[:=]?\\s*(-?\\d+(?:\\.\\d+)?)\\s*(${units})\\b`));
    if (!match) return null;
    const value = Number(match[1]);
    if (!Number.isFinite(value)) return null;
    return { value, unit: match[2].replace(/\s+/g, "").replace(/\^/g, "") };
  }

  const mass = readQuantity("masa|masy|mase", "kg|g|mg");
  const volume = readQuantity("objetosc|objetosci", "m3|cm3|dm3|l|ml|litra|litry|litrow");
  const force = readQuantity("sila|sily|sile|nacisk", "n|niuton|niutony");
  const area = readQuantity("powierzchnia|pole", "m2|cm2|mm2");
  const distance = readQuantity("droga|przesuniecie|odleglosc", "m|cm|mm|km");
  const duration = readQuantity("czas pracy|czas|czasu", "s|sekunda|sekundy|sekund|min|minuta|minuty|minut|h|godzina|godziny|godzin");
  const voltage = readQuantity("napiecie|napiecie elektryczne", "v|volt|volty");
  const current = readQuantity("natezenie|natezenie pradu|prad", "a|amper|ampery");
  const resistance = readQuantity("opor|rezystancja", "ohm|om");
  const work = readQuantity("praca mechaniczna|praca|prace|pracy|energia", "j|kj|dzul|dzule|dzuli");

  const wants = pattern => pattern.test(text);
  const wantsPressure = wants(/\b(cisnienie|cisnienia|cisnieniu)\b/);
  const wantsDensity = wants(/\b(gestosc|gestosci)\b/);
  const wantsWeight = wants(/\b(ciezar|sila ciezkosci)\b/);
  const wantsWork = wants(/\b(praca mechaniczna|prace mechaniczna|prace|praca|pracy)\b/);
  const wantsPower = wants(/\b(moc|mocy)\b/);
  const wantsCurrent = wants(/\b(natezenie|natezenie pradu)\b/);
  const wantsVoltage = wants(/\b(napiecie|napiecie elektryczne)\b/);
  const wantsResistance = wants(/\b(opor|rezystancja)\b/);
  let formula = "";
  let substitution = "";
  let answer = "";

  if (wantsDensity && mass && volume) {
    const massKg = mass.value * (mass.unit === "g" ? 0.001 : mass.unit === "mg" ? 0.000001 : 1);
    const volumeM3 = volume.value * ({ m3: 1, dm3: 0.001, l: 0.001, litra: 0.001, litrow: 0.001, cm3: 0.000001, ml: 0.000001 }[volume.unit] || 1);
    if (massKg < 0 || volumeM3 <= 0) return null;
    formula = "ρ = m ÷ V";
    substitution = `ρ = ${formatNumber(massKg)} kg ÷ ${formatNumber(volumeM3)} m³`;
    answer = `${formatNumber(massKg / volumeM3)} kg/m³`;
  } else if (wantsPressure && force && area) {
    const areaM2 = area.value * ({ m2: 1, cm2: 0.0001, mm2: 0.000001 }[area.unit] || 1);
    if (force.value < 0 || areaM2 <= 0) return null;
    formula = "p = F ÷ S";
    substitution = `p = ${formatNumber(force.value)} N ÷ ${formatNumber(areaM2)} m²`;
    answer = `${formatNumber(force.value / areaM2)} Pa`;
  } else if (wantsWeight && mass) {
    const massKg = mass.value * (mass.unit === "g" ? 0.001 : mass.unit === "mg" ? 0.000001 : 1);
    if (massKg < 0) return null;
    formula = "Fg ≈ m · g, gdzie g ≈ 10 N/kg";
    substitution = `Fg ≈ ${formatNumber(massKg)} kg · 10 N/kg`;
    answer = `${formatNumber(massKg * 10)} N`;
  } else if (wantsWork && force && distance) {
    const distanceM = distance.value * ({ m: 1, cm: 0.01, mm: 0.001, km: 1000 }[distance.unit] || 1);
    if (force.value < 0 || distanceM < 0) return null;
    formula = "W = F · s";
    substitution = `W = ${formatNumber(force.value)} N · ${formatNumber(distanceM)} m`;
    answer = `${formatNumber(force.value * distanceM)} J`;
  } else if (wantsPower && voltage && current) {
    formula = "P = U · I";
    substitution = `P = ${formatNumber(voltage.value)} V · ${formatNumber(current.value)} A`;
    answer = `${formatNumber(voltage.value * current.value)} W`;
  } else if (wantsPower && work && duration) {
    const workJ = work.value * (work.unit === "kj" ? 1000 : 1);
    const timeS = duration.value * ({ s: 1, sekunda: 1, sekundy: 1, sekund: 1, min: 60, minuta: 60, minuty: 60, minut: 60, h: 3600, godzina: 3600, godziny: 3600, godzin: 3600 }[duration.unit] || 1);
    if (timeS <= 0) return null;
    formula = "P = W ÷ t";
    substitution = `P = ${formatNumber(workJ)} J ÷ ${formatNumber(timeS)} s`;
    answer = `${formatNumber(workJ / timeS)} W`;
  } else if (wantsCurrent && voltage && resistance && resistance.value > 0) {
    formula = "I = U ÷ R";
    substitution = `I = ${formatNumber(voltage.value)} V ÷ ${formatNumber(resistance.value)} Ω`;
    answer = `${formatNumber(voltage.value / resistance.value)} A`;
  } else if (wantsVoltage && current && resistance) {
    formula = "U = I · R";
    substitution = `U = ${formatNumber(current.value)} A · ${formatNumber(resistance.value)} Ω`;
    answer = `${formatNumber(current.value * resistance.value)} V`;
  } else if (wantsResistance && voltage && current && current.value > 0) {
    formula = "R = U ÷ I";
    substitution = `R = ${formatNumber(voltage.value)} V ÷ ${formatNumber(current.value)} A`;
    answer = `${formatNumber(voltage.value / current.value)} Ω`;
  } else {
    return null;
  }

  return `🐨 Obliczenie z fizyki krok po kroku\n\nWzór: ${formula}\nDane po zamianie jednostek: ${substitution}\n\nOdpowiedź: ${answer}\n\nSprawdź, czy w zadaniu przyjęto te same jednostki i czy podany model pasuje do sytuacji.`;
}

function solveMotionProblem(question) {
  const text = normalize(String(question ?? "").replace(/,/g, "."));
  if (!/\b(droga|czas|predkosc)\b/.test(text)) return null;

  const distanceMatch = text.match(/\bdroga\s*(?:wynosi|to|=)?\s*([+-]?\d+(?:\.\d+)?)\s*(km|m)\b/);
  const timeMatch = text.match(/\bc(?:zas)?\s*(?:wynosi|to|=)?\s*([+-]?\d+(?:\.\d+)?)\s*(h|godzina|godziny|godzin|godz|min|minuta|minuty|minut|s|sekunda|sekundy|sekund)\b/);
  const speedMatch = text.match(/\bpredkosc\s*(?:wynosi|to|=)?\s*([+-]?\d+(?:\.\d+)?)\s*(km\s*\/\s*h|m\s*\/\s*s)\b/);
  const distance = distanceMatch ? Number(distanceMatch[1]) * (distanceMatch[2] === "km" ? 1000 : 1) : null;
  const secondsByUnit = { h: 3600, godzina: 3600, godziny: 3600, godzin: 3600, godz: 3600, min: 60, minuta: 60, minuty: 60, minut: 60, s: 1, sekunda: 1, sekundy: 1, sekund: 1 };
  const duration = timeMatch ? Number(timeMatch[1]) * secondsByUnit[timeMatch[2]] : null;
  const speedUnit = speedMatch?.[2].replace(/\s+/g, "") || "";
  const speed = speedMatch ? Number(speedMatch[1]) * (speedUnit === "km/h" ? 1000 / 3600 : 1) : null;
  const known = [distance, duration, speed].filter(value => value !== null);
  if (known.length < 2 || known.some(value => !Number.isFinite(value) || value < 0)) return null;

  const wantsDistance = /\b(oblicz|wyznacz|policz|znajdz)\s+(?:mi\s+)?droge\b/.test(text);
  const wantsTime = /\b(oblicz|wyznacz|policz|znajdz)\s+(?:mi\s+)?czas\b/.test(text);
  const wantsSpeed = /\b(oblicz|wyznacz|policz|znajdz)\s+(?:mi\s+)?predkosc\b/.test(text);
  let target = wantsDistance ? "distance" : wantsTime ? "time" : wantsSpeed ? "speed" : distance === null ? "distance" : duration === null ? "time" : speed === null ? "speed" : null;
  if (!target) return null;

  let result;
  let formula;
  let substitution;
  let answer;
  if (target === "speed" && distance !== null && duration !== null && duration !== 0) {
    result = distance / duration;
    formula = "v = s ÷ t";
    substitution = `v = ${formatNumber(distance)} m ÷ ${formatNumber(duration)} s`;
    const useKilometresPerHour = distanceMatch?.[2] === "km" || speedUnit === "km/h";
    answer = useKilometresPerHour
      ? `${formatNumber(result * 3.6)} km/h`
      : `${formatNumber(result)} m/s`;
  } else if (target === "distance" && speed !== null && duration !== null) {
    result = speed * duration;
    formula = "s = v × t";
    substitution = `s = ${formatNumber(speed)} m/s × ${formatNumber(duration)} s`;
    answer = distanceMatch?.[2] === "km" || speedUnit === "km/h"
      ? `${formatNumber(result / 1000)} km`
      : `${formatNumber(result)} m`;
  } else if (target === "time" && distance !== null && speed !== null && speed !== 0) {
    result = distance / speed;
    formula = "t = s ÷ v";
    substitution = `t = ${formatNumber(distance)} m ÷ ${formatNumber(speed)} m/s`;
    answer = (timeMatch && timeMatch[2].startsWith("godz")) || timeMatch?.[2] === "h" || speedUnit === "km/h"
      ? `${formatNumber(result / 3600)} h`
      : `${formatNumber(result)} s`;
  } else {
    return null;
  }

  return `## 🐨 Droga, prędkość i czas krok po kroku\n\n1. Wybieramy wzór: **${formula}**.\n2. Sprowadzamy dane do zgodnych jednostek i podstawiamy je: ${substitution}.\n3. Obliczamy wynik i zapisujemy go w odpowiedniej jednostce.\n\n**Odpowiedź: ${answer}**`;
}

function convertRomanNumerals(question) {
  const text = normalize(question);
  const hasRomanIntent = /\brzymsk\w*\b/.test(text);
  const wantsRoman = hasRomanIntent && /\b(zapisz|zamien|przedstaw|zapis|cyframi|ile to|ile wynosi|jaki zapis)\b|\bna rzymsk\w*\b/.test(text);
  const values = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
    [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]
  ];

  function toRoman(number) {
    let remainder = number;
    let result = "";
    for (const [value, numeral] of values) {
      while (remainder >= value) {
        result += numeral;
        remainder -= value;
      }
    }
    return result;
  }

  if (wantsRoman) {
    const numberMatch = text.match(/\b([1-9]\d{0,3})\b/);
    if (!numberMatch) return null;
    const number = Number(numberMatch[1]);
    if (number > 3999) return "## 🐨 Liczby rzymskie\n\nW tym ćwiczeniu mogę zamieniać liczby od 1 do 3999. Podaj liczbę z tego zakresu.";
    const roman = toRoman(number);
    let remainder = number;
    const parts = [];
    for (const [value, numeral] of values) {
      const count = Math.floor(remainder / value);
      if (count > 0) parts.push(`${numeral}${count > 1 ? ` × ${count}` : ""}`);
      remainder %= value;
    }
    return `## 🐨 Liczby rzymskie krok po kroku\n\nRozkładamy ${number} na składniki zapisu rzymskiego: ${parts.join(" + ")}.\n\n**${number} = ${roman}**`;
  }

  const wantsArabic = /\b(arabsk\w*|odczytaj|odczyt|ile to|co oznacza|zamien na liczbe)\b/.test(text);
  if (!wantsArabic) return null;
  const romanMatch = text.match(/\b([ivxlcdm]{1,15})\b/i);
  if (!romanMatch) return null;
  const roman = romanMatch[1].toUpperCase();
  let total = 0;
  for (let index = 0; index < roman.length; index++) {
    const current = values.find(([, numeral]) => numeral.length === 1 && numeral === roman[index])?.[0];
    const next = values.find(([, numeral]) => numeral.length === 1 && numeral === roman[index + 1])?.[0] || 0;
    total += current < next ? -current : current;
  }
  if (!total || total > 3999 || toRoman(total) !== roman) return null;
  return `## 🐨 Odczytajmy liczbę rzymską\n\nW zapisie ${roman} mniejsze znaki przed większym odejmujemy, a pozostałe dodajemy.\n\n**${roman} = ${total}**`;
}

function solveLinearEquation(question) {
  const text = normalize(String(question ?? "").replace(/(\d),(\d)/g, "$1.$2"));
  const equalsAt = text.indexOf("=");
  if (equalsAt < 0 || text.indexOf("=", equalsAt + 1) >= 0) return null;

  const leftMatch = text.slice(0, equalsAt).match(/([0-9x().+\-*/\s]+)$/);
  const rightMatch = text.slice(equalsAt + 1).match(/^([0-9x().+\-*/\s]+)/);
  if (!leftMatch || !rightMatch) return null;

  let leftSource = leftMatch[1].trim().replace(/(\d|\))\s*(x|\()/g, "$1*$2").replace(/x\s*(\d|\()/g, "x*$1");
  let rightSource = rightMatch[1].trim().replace(/(\d|\))\s*(x|\()/g, "$1*$2").replace(/x\s*(\d|\()/g, "x*$1");
  if (!/[x]/.test(leftSource + rightSource)) return null;

  function parseLinearExpression(source) {
    const tokens = [];
    const pattern = /\s*(\d+(?:\.\d+)?|x|[()+\-*/])\s*/gy;
    let position = 0;
    while (position < source.length) {
      pattern.lastIndex = position;
      const match = pattern.exec(source);
      if (!match) throw new Error("Nieobsługiwany zapis równania.");
      tokens.push(match[1]);
      if (tokens.length > MAX_MATH_TOKENS) throw new Error("Równanie jest za długie.");
      position = pattern.lastIndex;
    }

    let index = 0;
    const add = (left, right) => ({ a: left.a + right.a, b: left.b + right.b });
    const subtract = (left, right) => ({ a: left.a - right.a, b: left.b - right.b });

    function primary() {
      const token = tokens[index];
      if (token === "(") {
        index++;
        const value = expression();
        if (tokens[index] !== ")") throw new Error("Brak nawiasu zamykającego.");
        index++;
        return value;
      }
      if (token === "x") {
        index++;
        return { a: 1, b: 0 };
      }
      if (/^\d/.test(token || "")) {
        index++;
        return { a: 0, b: Number(token) };
      }
      throw new Error("Nieprawidłowy zapis równania.");
    }

    function unary() {
      if (tokens[index] === "+") { index++; return unary(); }
      if (tokens[index] === "-") {
        index++;
        const value = unary();
        return { a: -value.a, b: -value.b };
      }
      return primary();
    }

    function multiplication() {
      let value = unary();
      while (["*", "/"].includes(tokens[index])) {
        const operator = tokens[index++];
        const next = unary();
        if (operator === "/") {
          if (next.a !== 0 || next.b === 0) throw new Error("Dzielenie musi być przez liczbę różną od zera.");
          value = { a: value.a / next.b, b: value.b / next.b };
        } else {
          if (value.a !== 0 && next.a !== 0) throw new Error("To nie jest równanie liniowe.");
          value = {
            a: value.a * next.b + next.a * value.b,
            b: value.b * next.b
          };
        }
      }
      return value;
    }

    function expression() {
      let value = multiplication();
      while (["+", "-"].includes(tokens[index])) {
        const operator = tokens[index++];
        const next = multiplication();
        value = operator === "+" ? add(value, next) : subtract(value, next);
      }
      return value;
    }

    const result = expression();
    if (index !== tokens.length || !Number.isFinite(result.a) || !Number.isFinite(result.b)) {
      throw new Error("Nieprawidłowy zapis równania.");
    }
    return result;
  }

  try {
    const left = parseLinearExpression(leftSource);
    const right = parseLinearExpression(rightSource);
    const coefficient = left.a - right.a;
    const constant = right.b - left.b;

    if (coefficient === 0) {
      return constant === 0
        ? "## 🐨 Równanie ma nieskończenie wiele rozwiązań\n\nPo uproszczeniu otrzymujemy prawdziwą równość, która zachodzi dla każdej wartości x."
        : "## 🐨 Równanie nie ma rozwiązania\n\nPo uproszczeniu otrzymujemy sprzeczność, więc nie istnieje wartość x, która spełnia to równanie.";
    }

    const solution = constant / coefficient;
    if (!Number.isFinite(solution)) return null;
    return `## 🐨 Rozwiążmy równanie krok po kroku\n\n**Równanie:** ${leftSource} = ${rightSource}\n\n1. Zbieramy wyrazy z x po lewej, a liczby po prawej stronie.\n2. Po uproszczeniu otrzymujemy **${formatNumber(coefficient)}x = ${formatNumber(constant)}**.\n3. Dzielimy obie strony przez ${formatNumber(coefficient)}.\n\n**Rozwiązanie: x = ${formatNumber(solution)}**\n\n**Sprawdzenie:** po podstawieniu x = ${formatNumber(solution)} obie strony równania są równe.`;
  } catch {
    return null;
  }
}

function calculate(input) {
  const gcdLcm = solveGcdLcmProblem(input);
  if (gcdLcm) return gcdLcm;
  const factorization = solvePrimeFactorization(input);
  if (factorization) return factorization;
  const squareRoot = solveSquareRoot(input);
  if (squareRoot) return squareRoot;

  const expression = cleanMathExpression(input);
  if (!expression || expression.length > MAX_MATH_LENGTH) return null;

  const percent = calculatePercent(input);
  if (percent) return percent;

  const fraction = solveFractionOperation(input);
  if (fraction) return fraction;

  const conversion = solveUnitConversion(input);
  if (conversion) return conversion;

  const geometry = solveGeometryProblem(input);
  if (geometry) return geometry;
  const pythagorean = solvePythagoreanProblem(input);
  if (pythagorean) return pythagorean;
  const average = solveAverageProblem(input);
  if (average) return average;
  const motion = solveMotionProblem(input);
  if (motion) return motion;
  const roman = convertRomanNumerals(input);
  if (roman) return roman;

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
    return power();
  }
  function power() {
    const left = primary();
    if (tokens[index] === "^") {
      index++;
      const right = unary();
      if (Math.abs(right) > 10) throw new Error("Potęga");
      return left ** right;
    }
    return left;
  }
  function multiplication() {
    let value = unary();
    while (["*", "/"].includes(tokens[index])) {
      const operator = tokens[index++];
      const right = unary();
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
  const rules = teacherAnswerRules[item.title] || item.teacherAnswer;
  if (!rules) return null;
  const studentAnswer = normalize(answer);
  if (!studentAnswer) return null;
  if (/^(nie wiem|nie pamietam|nie rozumiem)$/.test(studentAnswer)) {
    return `## 🐨 🧑‍🏫 Podpowiedź\n\nNie szkodzi — spróbujmy małym krokiem.\n\n${rules.hint}\n\nMożesz odpowiedzieć własnymi słowami.`;
  }

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
  return `## 🐨 Tryb wspólnej lekcji\n\n**Temat lekcji:** ${item.title}\n\n### Krok 1 — Poznajmy temat\n${item.short}\n\n### Krok 2 — Zrozumienie\n${item.explanation}\n\n### Krok 3 — Przykład\n${item.example}\n\n### 🎓 Pytanie do Ciebie\n${item.check}\n\nOdpowiedz własnymi słowami. Sprawdzę odpowiedź i dam Ci podpowiedź, jeśli będzie potrzebna.`;
}

function createStudyPlan(item, question = "") {
  if (!item) return null;
  return `## 🐨 15-minutowy plan nauki: ${item.title}\n\n**Minuty 0–4 — zrozumienie**\nPrzeczytaj najważniejszą myśl: ${item.short}\n\n**Minuty 4–8 — wyjaśnij własnymi słowami**\nPrzeczytaj wyjaśnienie i spróbuj powiedzieć je bez patrzenia: ${item.explanation}\n\n**Minuty 8–12 — przykład**\nPrzeanalizuj przykład: ${item.example}\n\n**Minuty 12–15 — sprawdzenie**\nOdpowiedz bez zaglądania: ${item.check}\n\nNa koniec sprawdź, czy potrafisz połączyć temat z tym zagadnieniem: ${item.related}${createCurriculumNote(question)}`;
}

function getRequestedSchoolGrade(question) {
  const text = normalize(question);
  const gradePattern = "viii|vii|vi|iv|v|[4-8]|czwartoklasisty|czwartoklasistki|czwartoklasista|czwartej|czwarta|czwarty|piatoklasisty|piatoklasistki|piatoklasista|piatej|piata|piaty|szostoklasisty|szostoklasistki|szostoklasista|szostej|szosta|szosty|siodmoklasisty|siodmoklasistki|siodmoklasista|siodmej|siodma|siodmy|osmoklasisty|osmoklasistki|osmoklasista|osmej|osma|osmy";
  const classPattern = "(?:klas(?:a|y|ie|e|ach)?|classes?|grades?)";
  const match = text.match(new RegExp(`\\b${classPattern}\\s*(${gradePattern})\\b|\\b(${gradePattern})\\s+${classPattern}\\b|\\b(?:w|dla|jestem uczniem|ucze sie w)\\s+(${gradePattern})(?:\\s+klas\\w*)?\\b`));
  const token = match?.[1] || match?.[2] || match?.[3];
  if (!token) return null;
  const gradeMap = {
    iv: 4, v: 5, vi: 6, vii: 7, viii: 8,
    czwarta: 4, czwartej: 4, czwarty: 4, czwartoklasisty: 4, czwartoklasistki: 4, czwartoklasista: 4,
    piata: 5, piatej: 5, piaty: 5, piatoklasisty: 5, piatoklasistki: 5, piatoklasista: 5,
    szosta: 6, szostej: 6, szosty: 6, szostoklasisty: 6, szostoklasistki: 6, szostoklasista: 6,
    siodma: 7, siodmej: 7, siodmy: 7, siodmoklasisty: 7, siodmoklasistki: 7, siodmoklasista: 7,
    osma: 8, osmej: 8, osmy: 8, osmoklasisty: 8, osmoklasistki: 8, osmoklasista: 8
  };
  return gradeMap[token] || Number(token) || null;
}

function getSchoolYearStart(date = new Date()) {
  const month = date.getMonth() + 1;
  return month >= 9 ? date.getFullYear() : date.getFullYear() - 1;
}

function getCurriculumEditionForGrade(grade, schoolYearStart = getSchoolYearStart()) {
  if (!grade || grade < 4 || grade > 8 || schoolYearStart < 2026) return "2017";
  const latestNewBaseGrade = Math.min(8, 4 + schoolYearStart - 2026);
  return grade <= latestNewBaseGrade ? "2026" : "2017";
}

function getCurriculumContext(question) {
  const grade = getRequestedSchoolGrade(question);
  if (!grade) return null;
  const schoolYearStart = getSchoolYearStart();
  const schoolYear = `${schoolYearStart}/${String(schoolYearStart + 1).slice(-2)}`;
  const edition = getCurriculumEditionForGrade(grade, schoolYearStart);
  return { grade, schoolYear, edition };
}

function getRequestedSubject(question) {
  const text = normalize(question);
  const subjects = [
    ["matematyka", /\b(matm\w*|matematy\w*|maths?|mathematics?)\b/],
    ["język polski", /\b(polski|polskiego|jezyk polski|gramatyka|ortografia|lektura|literatura)\b/],
    ["język angielski", /\b(angielski|angielskiego|english)\b/],
    ["biologia i przyroda", /\b(biologi\w*|przyrod\w*|organizm|ekosystem|rosliny|zwierzeta)\b/],
    ["fizyka", /\b(fizyk\w*|ruch|sila|energia|prad)\b/],
    ["chemia", /\b(chem\w*|atom|pierwiastek|reakcja)\b/],
    ["historia", /\b(histori\w*|wiek|dynastia|wojna|krol)\b/],
    ["geografia", /\b(geografi\w*|mapa|kontynent|klimat|ludnosc)\b/],
    ["informatyka", /\b(informatyka|programowanie|algorytm|komputer|arkusz)\b/],
    ["wiedza o społeczeństwie", /\b(wos|obywatel|konstytucja|wybory|samorzad|prawa czlowieka)\b/]
  ];
  return subjects.find(([, pattern]) => pattern.test(text))?.[0] || null;
}

function createCurriculumNote(question) {
  const context = getCurriculumContext(question);
  if (!context) return "";
  const baseLabel = context.edition === "2026" ? "nowa podstawa MEN (2026)" : "dotychczasowa podstawa (2017)";
  const subject = getRequestedSubject(question);
  return `\n\n**Dopasowanie:** klasa ${context.grade}${subject ? ` · ${subject}` : ""} · rok szkolny ${context.schoolYear} · ${baseLabel}. Kolejność działów w ARKONIE może zależeć od szkolnego programu i planu nauczyciela. Szczegóły: [podstawa programowa MEN](https://www.gov.pl/web/edukacja/podstawa-programowa2) · [programy nauczania ARKONY](https://arkona.edupage.org/a/szkolne-programy-nauczania-szkola-podstawowa).`;
}

function createGeneralStudyPlan(question) {
  const raw = String(question ?? "");
  const grade = getRequestedSchoolGrade(question);
  const subject = getRequestedSubject(question);
  const cleanedTopic = raw
    .replace(/^\s*(?:ułóż|uloz|rozpisz|przygotuj|zaplanuj|make|create|prepare|build)\s+(?:mi|me)?\s*/i, "")
    .replace(/^\s*(?:15[\s-]*minut\w*\s+)?(?:study |learning |revision )?plan(?:\s+(?:nauki|powtórki|powtorki))?\s*/i, "")
    .replace(/^\s*(?:na temat|tematu|z przedmiotu|on the topic of|about|for|z|o)\s*[:\-–]?\s*/i, "")
    .replace(/\b(?:klas(?:a|y|ie|e|ach)?|grade|class)\s*(?:iv|viii|vii|vi|v|[4-8]|czwartej|czwarta|czwartoklasisty|piatej|piata|piatoklasisty|szostej|szosta|szostoklasisty|siodmej|siodma|siodmoklasisty|osmej|osma|osmoklasisty)\b/gi, " ")
    .replace(/\b(?:iv|viii|vii|vi|v|[4-8])\s+klas(?:a|y|ie|e|ach)\b/gi, " ")
    .replace(/[?!.]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const topicOnlyLabels = {
    matematyka: /^(?:matm\w*|matematy\w*)$/,
    "język polski": /^(?:polski|polskiego|jezyk polski|jezyka polskiego)$/,
    "język angielski": /^(?:angielski|angielskiego|jezyk angielski|jezyka angielskiego|english)$/,
    "biologia i przyroda": /^(?:biologi\w*|przyrod\w*)$/,
    fizyka: /^fizyk\w*$/,
    chemia: /^chem\w*$/,
    historia: /^histori\w*$/,
    geografia: /^geografi\w*$/,
    informatyka: /^informatyka$/
  };
  const subjectOnly = subject && topicOnlyLabels[subject]?.test(normalize(cleanedTopic));
  const topicSubjectLabels = {
    matematyka: "matematyki",
    "język polski": "języka polskiego",
    "język angielski": "języka angielskiego",
    "biologia i przyroda": "biologii lub przyrody",
    fizyka: "fizyki",
    chemia: "chemii",
    historia: "historii",
    geografia: "geografii",
    informatyka: "informatyki"
  };
  const topic = subjectOnly
    ? `wybrany dział z ${topicSubjectLabels[subject]}`
    : cleanedTopic.slice(0, 100) || subject || "wybrany temat";
  const subjectLabel = subject ? `${subject}${grade ? `, klasa ${grade}` : ""}` : `${topic}${grade ? `, klasa ${grade}` : ""}`;
  const subjectMethod = subject === "matematyka"
    ? "Rozwiąż jedno zadanie i przy każdym kroku zapisz, jakiej reguły używasz. Na końcu oszacuj, czy wynik ma sens."
    : subject === "język polski"
      ? "Przeczytaj fragment, zaznacz ważne słowa i ułóż własne zdanie lub krótką wypowiedź z użyciem poznanej reguły."
      : subject === "język angielski"
        ? "Powtórz pięć słów, ułóż z nimi dwa własne zdania i przeczytaj je na głos."
        : subject === "fizyka"
          ? "Zapisz dane z jednostkami, wybierz wzór i pokaż podstawienie. Potem sprawdź, czy wynik i jego jednostka mają sens w opisanej sytuacji."
          : subject === "chemia"
            ? "Narysuj prosty model drobin albo zapis reakcji. Podpisz substraty i produkty, policz atomy po obu stronach i przypomnij sobie zasady bezpieczeństwa."
        : subject === "historia"
          ? "Ułóż trzy wydarzenia w kolejności i dopisz po jednym powodzie lub skutku każdego z nich."
          : subject === "geografia"
            ? "Pracuj z mapą lub wykresem: wskaż miejsce, odczytaj jedną informację i wyjaśnij ją własnymi słowami."
            : subject === "biologia i przyroda"
              ? "Narysuj prosty schemat zjawiska, podpisz jego elementy i opowiedz, jak łączą się ze sobą."
              : "Wypisz najważniejsze pojęcia, połącz je strzałkami i spróbuj wyjaśnić jedno połączenie bez notatek.";
  return `## 🐨 Plan nauki na 15 minut — ${subjectLabel}

**Cel:** powtórzyć temat „${topic}” aktywnie, a nie tylko przeczytać notatkę.

**0–3 min — przypomnij sobie**
Zapisz z pamięci trzy rzeczy, które już wiesz. Zaznacz jedno pytanie, na które chcesz znaleźć odpowiedź.

**3–7 min — uporządkuj temat**
Otwórz zeszyt lub podręcznik i wybierz krótką część dotyczącą „${topic}”. Podkreśl definicję, regułę albo najważniejszą przyczynę.

**7–11 min — ćwicz w swoim przedmiocie**
${subjectMethod}

**11–14 min — sprawdź pamięć**
Zamknij notatki. Wyjaśnij temat własnymi słowami i odpowiedz na jedno pytanie z podręcznika albo od nauczyciela.

**14–15 min — zapisz kolejny krok**
Zapisz, co już umiesz i co wymaga powtórki. ${subjectOnly ? "Nie podałeś dokładnego działu, więc plan opisuje sposób nauki. Wybierz temat, który teraz omawiacie, a dobiorę konkretne ćwiczenia." : "Jeśli podasz dokładny dział lub wkleisz zadanie, dopasuję plan do konkretnego materiału."}${createCurriculumNote(question)}`;
}

function formatTeacherExpectedAnswer(item) {
  const rules = item?.teacherAnswer || teacherAnswerRules[item?.title];
  if (!rules?.all?.length) return item?.short || "Odpowiedź zgodna z omawianą zasadą.";
  return rules.all
    .map(group => Array.isArray(group) ? group[0] : group)
    .filter(Boolean)
    .join("; ");
}

export function createTeacherMaterials(question) {
  const raw = String(question ?? "").replace(/^\s*(?:tryb nauczycielski\s*:?|nauczyciel\s*:)\s*/i, "").trim();
  const item = findKnowledge(raw);
  const topic = item?.title || raw
    .replace(/^(?:przygotuj|stworz|zrob|opracuj)\s+/i, "")
    .replace(/^(?:scenariusz|kartkowke|kartkówkę|sprawdzian|lekcje|lekcję|materialy|materiały)\s*(?:z|na temat|o)?\s*/i, "")
    .replace(/[?.!:]+$/g, "")
    .trim()
    .slice(0, 100) || "wybrany temat";

  if (!item) {
    return `## 🐨 Materiał dla nauczyciela — ${topic}\n\nNie mam w lokalnej bazie wystarczająco dokładnej karty tego zagadnienia, więc nie dopisuję faktów na chybił trafił. Podaj klasę i wklej fragment materiału, a przygotuję na jego podstawie cele, przebieg lekcji, ćwiczenia i kryteria oceniania.\n\n### Szkielet 45-minutowej lekcji\n1. 5 min — przypomnienie wiadomości i pytanie otwierające.\n2. 10 min — krótkie wprowadzenie oraz przykład.\n3. 15 min — wspólne ćwiczenie krok po kroku.\n4. 10 min — samodzielna praca uczniów.\n5. 5 min — bilet wyjścia: jedno pytanie sprawdzające.`;
  }

  const answer = formatTeacherExpectedAnswer(item);
  return `## 🐨 Materiał dla nauczyciela — ${item.title}\n\n### Cele lekcji\nPo lekcji uczeń wyjaśnia główną zasadę, stosuje ją w przykładzie i potrafi uzasadnić kolejność własnych kroków.\n\n### Przebieg lekcji — 45 minut\n1. 0–5 min — rozgrzewka: poproś uczniów o przykład lub skojarzenie z tematem.\n2. 5–15 min — wprowadzenie: ${item.short}\n3. 15–25 min — modelowanie: pokaż przykład i głośno uzasadnij kolejne kroki: ${item.example}\n4. 25–38 min — praca uczniów: poproś o rozwiązanie pytania kontrolnego najpierw samodzielnie, potem w parach.\n5. 38–45 min — podsumowanie i bilet wyjścia.\n\n### Mini-kartkówka\n1. ${item.check}\n2. Wyjaśnij własnymi słowami, na czym polega zagadnienie „${item.title}”.\n3. Podaj przykład zastosowania tej zasady i uzasadnij rozwiązanie.\n\n### Klucz i kryteria odpowiedzi\n1. Oczekiwane elementy: ${answer}.\n2. Uczeń poprawnie wskazuje główną regułę: ${item.short}\n3. Uczeń pokazuje sensowny tok rozumowania; przykładowy wzorzec: ${item.example}\n\n### Różnicowanie pracy\n• Wsparcie: podaj uczniom pierwszy krok i poproś o dokończenie z partnerem.\n• Rozszerzenie: poproś o własny przykład, kontrprzykład albo wyjaśnienie, dlaczego reguła działa.\n\n### Szybka ocena\nSprawdź, czy uczeń: (1) rozpoznaje pojęcie, (2) stosuje je poprawnie, (3) potrafi wyjaśnić swój wybór.`;
}

function createLearningHint(topic) {
  return `## 🐨 Zróbmy to razem\n\nNie mam jeszcze wystarczającej wiedzy zapisanej lokalnie o temacie **„${topic}”**. Nie chcę zgadywać.\n\nNapisz, z jakiego to przedmiotu i dla której klasy (IV–VIII), albo wklej fragment z podręcznika czy treść zadania. Wyjaśnię materiał prostym językiem, pokażę przykład i przygotuję krótkie ćwiczenie. Możesz też poprosić mnie o poszukanie materiałów w źródłach edukacyjnych.`;
}

export function classifyQuestion(question, localAnswer = "", history = []) {
  const safeHistory = getSafeHistory(history);
  if (extractStudyMaterial(question)) return { kind: "local-study", shouldSearchWeb: false, topic: null, searchQuery: null };
  const activeTextQuiz = getActiveTextQuiz(safeHistory);
  if (activeTextQuiz && !isNewQuestionDuringLesson(question)) {
    return { kind: "quiz-answer", shouldSearchWeb: false, topic: null, searchQuery: null };
  }
  const route = getQuestionRoute(question, localAnswer, safeHistory);
  const activeTeacher = getActiveTeacherTopic(safeHistory);

  if (activeTeacher && !isFollowUp(question) && !isNewQuestionDuringLesson(question) && !isGreetingMessage(question) && !isThanksMessage(question)) {
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
      return "## 🐨 Hej! Jestem Koala.ai.\n\nPomagam w szkolnej nauce: z matematyki, języka polskiego, przyrody, historii i innych przedmiotów. Mogę wyjaśnić temat prostym językiem, pokazać przykład, zrobić krótką powtórkę albo poprowadzić Cię przez zadanie krok po kroku.\n\n**Co dziś chcesz zrozumieć?**";
    }
    if (isThanksMessage(text)) return "Nie ma za co! 🐨 Dobra robota. Możemy przejść do następnego pytania.";
    if (isSocialMessage(text)) {
      if (/kim jestes|co potrafisz/.test(normalized)) {
        return "## 🐨 Jestem Koala.ai\n\nJestem własnym, lokalnym silnikiem edukacyjnym opartym na kodzie, regułach, bazie wiedzy i analizie kontekstu rozmowy. Nie korzystam z zewnętrznego modelu językowego. Pomagam w nauce, wybranych obliczeniach i analizie informacji z witryn skonfigurowanych w wyszukiwarce.";
      }
      return "U mnie wszystko dobrze — jestem gotowa do pomocy! 🐨 Nad czym dziś pracujesz?";
    }

    if (isTopicChange(text)) return "Jasne, zmieniamy temat! 🐨 Napisz, czego teraz chcesz się nauczyć.";

    const broadSubjectAnswer = createBroadSubjectAnswer(text);
    if (broadSubjectAnswer) return broadSubjectAnswer;

    const activeTextQuiz = getActiveTextQuiz(safeHistory);
    if (activeTextQuiz) {
      if (/^(koniec quizu|zakoncz quiz|stop)$/i.test(normalized)) {
        return "🐨 Quiz zakończony. Możemy wrócić do notatki albo zacząć nowy temat.";
      }
      const asksNewQuestion = isNewQuestionDuringLesson(text);
      if (!asksNewQuestion) {
        return gradeTextQuizAnswer(activeTextQuiz.quiz, activeTextQuiz.currentIndex, text);
      }
    }

    const studyMaterial = extractStudyMaterial(text);
    if (studyMaterial) {
      if (intent === "quiz") {
        const quiz = createTextQuiz(studyMaterial);
        return quiz.length
          ? startTextQuiz(quiz)
          : "🐨 Mam za mało zdań, żeby przygotować uczciwy quiz. Wklej dłuższy tekst z co najmniej kilkoma pełnymi zdaniami.";
      }
      const studyNote = createStudyNote(studyMaterial);
      if (studyNote) return studyNote;
    }

    const activeTeacherTopic = getActiveTeacherTopic(safeHistory);
    if (activeTeacherTopic && !isFollowUp(text) && !isNewQuestionDuringLesson(text)) {
      if (/^(koniec lekcji|zakoncz lekcje|stop)$/i.test(normalized)) {
        return "🐨 Lekcja zakończona! Dobra robota. Możemy rozpocząć nowy temat.";
      }
      const teacherResult = evaluateTeacherAnswer(activeTeacherTopic, text);
      if (teacherResult) return teacherResult;
    }

    if (!asksToSearchOnline(text)) {
      const literatureItem = findLiteratureKnowledgeItem(text);
      if (literatureItem) return formatLiteratureAnswer(literatureItem, text);
      const literatureList = formatLiteratureListAnswer(text);
      if (literatureList) return literatureList;
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
      const explicitTopics = findExplicitKnowledgeTopics(text);
      const matches = explicitTopics.length
        ? explicitTopics
        : findKnowledgeMatches(text).map(match => match.item);
      const comparison = formatKnowledgeComparison(matches, text);
      if (comparison) return comparison;
    }

    if (!asksToSearchOnline(text) && !["compare", "study-plan", "quiz"].includes(intent)) {
      const bundledAnswer = formatKnowledgeBundle(findExplicitKnowledgeTopics(text), intent, text);
      if (bundledAnswer) return bundledAnswer;
    }

    const equationAnswer = solveLinearEquation(text);
    if (equationAnswer) return equationAnswer;

    const gcdLcmAnswer = solveGcdLcmProblem(text);
    if (gcdLcmAnswer) return gcdLcmAnswer;
    const factorizationAnswer = solvePrimeFactorization(text);
    if (factorizationAnswer) return factorizationAnswer;
    const squareRootAnswer = solveSquareRoot(text);
    if (squareRootAnswer) return squareRootAnswer;

    const percentAnswer = calculatePercent(text);
    if (percentAnswer) return percentAnswer;
    const fractionAnswer = solveFractionOperation(text);
    if (fractionAnswer) return fractionAnswer;
    const conversionAnswer = solveUnitConversion(text);
    if (conversionAnswer) return conversionAnswer;
    const geometryAnswer = solveGeometryProblem(text);
    if (geometryAnswer) return geometryAnswer;
    const pythagoreanAnswer = solvePythagoreanProblem(text);
    if (pythagoreanAnswer) return pythagoreanAnswer;
    const averageAnswer = solveAverageProblem(text);
    if (averageAnswer) return averageAnswer;
    const motionAnswer = solveMotionProblem(text);
    if (motionAnswer) return motionAnswer;
    const romanAnswer = convertRomanNumerals(text);
    if (romanAnswer) return romanAnswer;

    const physicsAnswer = solvePhysicsProblem(text);
    if (physicsAnswer) return physicsAnswer;

    // Tryb nauczyciela.
    const knowledgeItem = findKnowledge(text);
    if (knowledgeItem) {
      if (intent === "study-plan") return createStudyPlan(knowledgeItem, text);
      const wantsTeacher = /\b(naucz mnie|nauczysz mnie|tryb nauczyciela|lekcja|lekcje|przygotuj mnie|przepytaj mnie|sprawdz mnie|zrob quiz|quiz|powtorka|powtorzmy)\b/.test(normalized);
      if (wantsTeacher || intent === "quiz") return `${startTeacherLesson(knowledgeItem)}${createCurriculumNote(text)}`;
      return `${formatKnowledge(knowledgeItem, intent)}${createCurriculumNote(text)}`;
    }

    if (intent === "study-plan") return createGeneralStudyPlan(text);

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
