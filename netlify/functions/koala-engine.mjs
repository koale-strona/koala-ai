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
  "Najdłuższa rzeka Polski": { any: ["baltyk", "baltyckiego"], hint: "Wisła uchodzi do morza na północy Polski." },
  "Równania liniowe": { all: ["7"], hint: "Odejmij 5 po obu stronach równania x + 5 = 12." },
  "Ułamki dziesiętne": { all: ["25", "setnych"], hint: "Cyfry po przecinku oznaczają kolejno części dziesiąte i setne." },
  "Podmiot i orzeczenie": { all: ["ptaki", "spiewaja"], hint: "Podmiot odpowiada na pytanie „kto?”, a orzeczenie mówi, co robi." },
  "Stany skupienia": { all: ["ciecz"], hint: "Woda w szklance przyjmuje kształt naczynia." },
  "Obieg wody w przyrodzie": { all: ["parowanie"], hint: "Proces zaczyna się, gdy woda ogrzana przez Słońce zamienia się w parę." },
  "Układ krwionośny": { all: ["pompa"], hint: "Ten narząd rytmicznie kurczy się i wprawia krew w ruch." },
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
  "Masa i ciężar": { all: ["pozostaje taka sama"], hint: "Masa astronauty pozostaje taka sama, choć ciężar na Księżycu jest mniejszy." },
  "Mieszaniny jednorodne i niejednorodne": { any: ["niejednorodna", "nie jednorodna", "heterogeniczna"], hint: "Widać osobno składniki piasku i wody." },
  "Odczyn kwaśny, obojętny i zasadowy": { all: ["zasadowy"], hint: "pH większe od 7 oznacza odczyn zasadowy." },
  "Pogoda i klimat": { all: ["klimat"], hint: "To pojęcie opisuje typowe warunki z wielolecia." },
  "Szerokość i długość geograficzna": { all: ["rownik"], hint: "Ta linia ma szerokość geograficzną 0°." },
  "Ruch obiegowy Ziemi i pory roku": { all: ["nachylenie", "osi"], hint: "Liczy się nachylenie osi Ziemi podczas obiegu wokół Słońca." },
  "Konstytucja i trójpodział władzy": { all: ["sadowa"], hint: "Sądy sprawują władzę sądowniczą." },
  "Unia Europejska": { all: ["nie wszystkie"], hint: "Polska jest przykładem państwa UE, które nadal ma własną walutę." },
  "Prawa i obowiązki ucznia": { all: ["statut", "szkoly"], hint: "Sprawdź dokument określający zasady w twojej szkole." },
  "Bezpieczne źródła informacji": { all: ["autora", "date"], hint: "Sprawdź, kto opublikował informację i kiedy." }
};

function isNewQuestionDuringLesson(value) {
  const text = normalize(value);
  return String(value ?? "").includes("?")
    || /^(co to jest|czym jest|jak dziala|dlaczego|czemu|kto|gdzie|kiedy|ile wynosi|wyjasnij|wytlumacz)\b/.test(text);
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
  const step = latestAnswer.match(/## 🧩 Quiz — pytanie (\d+)\/(\d+)/);
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
  return /\b(aktualnie|obecnie|dzisiaj|dzis|jutro|wczoraj|najnowsz\w*|na zywo|teraz|aktualn\w*|ostatnie wiadomosci|co nowego|co wiadomo|co sie dzieje|co sie wydarzylo|ostatnie informacje|ostatnie wydarzenia|na swiecie)\b/.test(text)
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
  const equationAnswer = solveLinearEquation(text);
  if (equationAnswer) return { kind: "math", shouldSearchWeb: false };
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
  if (/\b(plan nauki|rozpisz plan|przygotuj plan|plan powtorki|plan nauki do)\b/.test(text)) return "study-plan";
  if (/\b(quiz|test|sprawdz mnie|przepytaj mnie|zrob quiz|pytanie sprawdzajace)\b/.test(text)) return "quiz";
  if (/\b(notatk\w*|streszcz\w*|stresc\w*|podsumuj\w*|podsumowani\w*|skroc\w*|najwazniejsz\w*)\b/.test(text)) return "summary";
  if (/\b(porownaj|roznica miedzy|czym sie rozni|podobienstwa)\b/.test(text)) return "compare";
  if (/\b(przyklad\w*|podaj przyklad|daj przyklad)\b/.test(text)) return "example";
  if (/\b(prosciej|latwiej|nie rozumiem|wytlumacz\w*|wyjasn\w*|po ludzku)\b/.test(text)) return "simple";
  if (/\b(dlaczego|czemu|z jakiego powodu)\b/.test(text)) return "why";
  if (/\b(rozwin\w*|rozszerz\w*|dokladniej|wiecej|opowiedz wiecej|szerzej)\b/.test(text)) return "expand";
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
  const original = normalize(input).replace(/^(ile to|oblicz|policz) /, "");
  const match = original.match(/^(-?\d+(?:[.,]\d+)?)\s*(?:%|procent(?:y|ow|a)?)\s*(?:z\s*)?(-?\d+(?:[.,]\d+)?)$/);
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
  const match = text.match(/^\s*(?:(?:zamien|przelicz|ile to|oblicz|policz)\s+)?([+-]?\d+(?:\.\d+)?)\s*([a-z0-9]+)\s+(?:na|w|to)\s+([a-z0-9]+)\s*\??\s*$/);
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
  const text = normalize(question);
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
  return `## 🐨 🧑‍🏫 Tryb nauczyciela\n\n**Temat lekcji:** ${item.title}\n\n### Krok 1 — Poznajmy temat\n${item.short}\n\n### Krok 2 — Zrozumienie\n${item.explanation}\n\n### Krok 3 — Przykład\n${item.example}\n\n### 🎓 Pytanie do Ciebie\n${item.check}\n\nOdpowiedz własnymi słowami. Sprawdzę odpowiedź i dam Ci podpowiedź, jeśli będzie potrzebna.`;
}

function createStudyPlan(item) {
  if (!item) return null;
  return `## 🐨 15-minutowy plan nauki: ${item.title}\n\n**Minuty 0–4 — zrozumienie**\nPrzeczytaj najważniejszą myśl: ${item.short}\n\n**Minuty 4–8 — wyjaśnij własnymi słowami**\nPrzeczytaj wyjaśnienie i spróbuj powiedzieć je bez patrzenia: ${item.explanation}\n\n**Minuty 8–12 — przykład**\nPrzeanalizuj przykład: ${item.example}\n\n**Minuty 12–15 — sprawdzenie**\nOdpowiedz bez zaglądania: ${item.check}\n\nNa koniec sprawdź, czy potrafisz połączyć temat z tym zagadnieniem: ${item.related}`;
}

function createLearningHint(topic) {
  return `## 🐨 Zróbmy to razem\n\nNie mam jeszcze wystarczającej wiedzy zapisanej lokalnie o temacie **„${topic}”**. Nie chcę zgadywać.\n\nNapisz, z jakiego to przedmiotu i dla której klasy (IV–VIII), albo wklej fragment z podręcznika czy treść zadania. Wyjaśnię materiał prostym językiem, pokażę przykład i przygotuję krótkie ćwiczenie. Możesz też poprosić mnie o poszukanie materiałów w źródłach edukacyjnych.`;
}

export function classifyQuestion(question, localAnswer = "", history = []) {
  const safeHistory = getSafeHistory(history);
  if (extractStudyMaterial(question)) return { kind: "local-study", shouldSearchWeb: false, topic: null, searchQuery: null };
  const activeTextQuiz = getActiveTextQuiz(safeHistory);
  if (activeTextQuiz && !/[?]/.test(String(question ?? "")) && !/^(co|jak|dlaczego|czemu|wyjasnij|wytlumacz)\b/.test(normalize(question))) {
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

    const activeTextQuiz = getActiveTextQuiz(safeHistory);
    if (activeTextQuiz) {
      if (/^(koniec quizu|zakoncz quiz|stop)$/i.test(normalized)) {
        return "🐨 Quiz zakończony. Możemy wrócić do notatki albo zacząć nowy temat.";
      }
      const asksNewQuestion = text.includes("?") || /^(co|jak|dlaczego|czemu|wyjasnij|wytlumacz)\b/.test(normalized);
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

    const equationAnswer = solveLinearEquation(text);
    if (equationAnswer) return equationAnswer;

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

    // Tryb nauczyciela.
    const knowledgeItem = findKnowledge(text);
    if (knowledgeItem) {
      if (intent === "study-plan") return createStudyPlan(knowledgeItem);
      const wantsTeacher = /\b(naucz mnie|nauczysz mnie|tryb nauczyciela|lekcja|lekcje|przygotuj mnie|przepytaj mnie|sprawdz mnie|zrob quiz|quiz|powtorka|powtorzmy)\b/.test(normalized);
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
