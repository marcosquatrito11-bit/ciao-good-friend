export type StepKey =
  | "personal"
  | "contact"
  | "about"
  | "languages"
  | "specializations"
  | "documents"
  | "payments"
  | "agreement";

export const STEPS: { key: StepKey; label: string }[] = [
  { key: "personal", label: "Personal info" },
  { key: "contact", label: "Contact" },
  { key: "about", label: "About you" },
  { key: "languages", label: "Languages" },
  { key: "specializations", label: "Specializations" },
  { key: "documents", label: "Documents" },
  { key: "payments", label: "Payments" },
  { key: "agreement", label: "Agreement" },
];

export const CATEGORIES = [
  "hiking",
  "volcano",
  "food",
  "wine",
  "culture",
  "photo",
  "adventure",
  "family",
  "wellness",
  "sea",
] as const;

export const LANGUAGE_OPTIONS = [
  { code: "it", name: "Italian" },
  { code: "en", name: "English" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "es", name: "Spanish" },
  { code: "ja", name: "Japanese" },
  { code: "zh", name: "Chinese" },
  { code: "ru", name: "Russian" },
];

export const LEVELS = ["basic", "conversational", "fluent", "native"] as const;

export type ApplicationDraft = {
  current_step: number;
  status?: "draft" | "pending" | "approved" | "rejected" | "suspended";
  first_name?: string | null;
  last_name?: string | null;
  date_of_birth?: string | null;
  nationality?: string | null;
  city?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  emergency_contact?: string | null;
  headline?: string | null;
  bio_short?: string | null;
  bio_long?: string | null;
  years_experience?: number | null;
  languages?: { code: string; level: string }[];
  specializations?: string[];
  areas_covered?: string[];
  certifications?: { name: string; issuer?: string; year?: string }[];
  id_document_url?: string | null;
  certificate_urls?: string[];
  insurance_url?: string | null;
  iban?: string | null;
  vat_number?: string | null;
  stripe_account_id?: string | null;
  terms_accepted?: boolean;
  privacy_accepted?: boolean;
  motivation?: string | null;
};
