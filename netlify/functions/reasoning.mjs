/* Lokalne, deterministyczne rozwiązania kilku częstych zadań z fizyki. */

const NUMBER = "(-?\\d+(?:[.,]\\d+)?)";

function format(value, digits = 4) {
  if (!Number.isFinite(value)) return null;
  return new Intl.NumberFormat("pl-PL", { maximumFractionDigits: digits }).format(value);
}

function readMeasurement(text, expression) {
  const match = text.match(expression);
  if (!match) return null;
  const value = Number(match[1].replace(",", "."));
  return Number.isFinite(value) ? { value, unit: String(match[2] || "").toLowerCase() } : null;
}

function wantsCalculation(text) {
  return /\b(oblicz|policz|wyznacz|ile wynosi|jaka jest|jaką ma|jaka ma)\b/i.test(text);
}

export function solveSchoolProblem(input) {
  const text = String(input || "").toLocaleLowerCase("pl-PL")
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (!wantsCalculation(text)) return null;

  if (/\b(predkosc|szybkosc)\b/.test(text)) {
    const distance = readMeasurement(text, new RegExp(`${NUMBER}\\s*(km|kilometr(?:y|ów)?|m|metr(?:y|ów)?)\\b`, "i"));
    const time = readMeasurement(text, new RegExp(`${NUMBER}\\s*(h|godz(?:ina|iny|in)?|min|minut(?:a|y)?|s|sek(?:unda|undy)?)\\b`, "i"));
    if (distance && time && distance.value >= 0 && time.value > 0) {
      const meters = distance.value * (/^(km|kilometr)/.test(distance.unit) ? 1000 : 1);
      const seconds = time.value * (/^(h|godz)/.test(time.unit) ? 3600 : /^(min)/.test(time.unit) ? 60 : 1);
      const useKilometersPerHour = /^(km|kilometr)/.test(distance.unit) && /^(h|godz)/.test(time.unit);
      const value = useKilometersPerHour ? (meters / 1000) / (seconds / 3600) : meters / seconds;
      const unit = useKilometersPerHour ? "km/h" : "m/s";
      return `## 🐨 Prędkość — rozwiązanie krok po kroku\n\n**Dane:** droga ${format(distance.value)} ${distance.unit}, czas ${format(time.value)} ${time.unit}.\n\nKorzystamy ze wzoru **v = s/t**. Najpierw zapisujemy wielkości w zgodnych jednostkach: ${format(meters)} m oraz ${format(seconds)} s.\n\n**Obliczenie:** v = ${format(meters)} m ÷ ${format(seconds)} s = **${format(value)} ${unit}**.\n\nŚrednia prędkość wynosi **${format(value)} ${unit}**.`;
    }
  }

  if (/\bgestosc\b/.test(text)) {
    const mass = readMeasurement(text, new RegExp(`${NUMBER}\\s*(kg|g|mg)\\b`, "i"));
    const volume = readMeasurement(text, new RegExp(`${NUMBER}\\s*(cm(?:3|³)|ml|l|dm(?:3|³)|m(?:3|³))(?![\\p{L}\\p{N}])`, "iu"));
    if (mass && volume && mass.value >= 0 && volume.value > 0) {
      const grams = mass.value * (mass.unit === "kg" ? 1000 : mass.unit === "mg" ? 0.001 : 1);
      const cubicCentimeters = volume.value * (/^(l|dm)/.test(volume.unit) ? 1000 : /^m/.test(volume.unit) ? 1_000_000 : 1);
      const value = grams / cubicCentimeters;
      return `## 🐨 Gęstość — rozwiązanie krok po kroku\n\n**Dane:** masa ${format(mass.value)} ${mass.unit}, objętość ${format(volume.value)} ${volume.unit}.\n\nKorzystamy ze wzoru **d = m/V**. Po przeliczeniu: ${format(grams)} g oraz ${format(cubicCentimeters)} cm³.\n\n**Obliczenie:** d = ${format(grams)} g ÷ ${format(cubicCentimeters)} cm³ = **${format(value)} g/cm³**.`;
    }
  }

  if (/\b(sila|sile|sily|ii zasada dynamiki|druga zasada dynamiki)\b/.test(text)) {
    const mass = readMeasurement(text, new RegExp(`${NUMBER}\\s*(kg|g)\\b`, "i"));
    const acceleration = readMeasurement(text, new RegExp(`${NUMBER}\\s*(?:m\\s*\\/\\s*s(?:2|²)|m\\s*s(?:-2|−2))(?![\\p{L}\\p{N}])`, "iu"));
    if (mass && acceleration && mass.value >= 0 && acceleration.value >= 0) {
      const kilograms = mass.value * (mass.unit === "g" ? 0.001 : 1);
      const value = kilograms * acceleration.value;
      return `## 🐨 Siła — rozwiązanie krok po kroku\n\nKorzystamy z II zasady dynamiki Newtona: **F = m·a**.\n\nMasa: ${format(kilograms)} kg. Przyspieszenie: ${format(acceleration.value)} m/s².\n\n**Obliczenie:** F = ${format(kilograms)} kg × ${format(acceleration.value)} m/s² = **${format(value)} N**.`;
    }
  }

  return null;
}
