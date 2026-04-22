export const EXPERIENCE_CATEGORIES = [
  { value: "hiking", label: "Hiking", emoji: "🥾" },
  { value: "volcano", label: "Volcano tour", emoji: "🌋" },
  { value: "food", label: "Food tour", emoji: "🍝" },
  { value: "wine", label: "Wine tasting", emoji: "🍷" },
  { value: "culture", label: "Culture & history", emoji: "🏛️" },
  { value: "photo", label: "Photography", emoji: "📸" },
  { value: "adventure", label: "Adventure", emoji: "🧗" },
  { value: "family", label: "Family-friendly", emoji: "👨‍👩‍👧" },
  { value: "wellness", label: "Wellness", emoji: "🧘" },
  { value: "sea", label: "Sea & coast", emoji: "🌊" },
] as const;

export const LANGUAGES = [
  { code: "it", name: "Italian" },
  { code: "en", name: "English" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "es", name: "Spanish" },
  { code: "ja", name: "Japanese" },
  { code: "zh", name: "Chinese" },
  { code: "ru", name: "Russian" },
];

export type ExperienceCategory = (typeof EXPERIENCE_CATEGORIES)[number]["value"];

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
