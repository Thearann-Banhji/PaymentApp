import { File, Paths } from "expo-file-system";
import { useSyncExternalStore } from "react";
import { Platform } from "react-native";
import { customer, INSTITUTE_ID } from "../constants/invoice";

export type ProfileDetails = {
  /** Customer id */
  id: string;
  institute: string;
  contract: string;
  contractId: string;
  phone: string;
  name: string;
};

// Saved in the app's documents folder; web keeps edits for the session only.
const persistent = Platform.OS !== "web";
const DETAILS_FILE = "profile.json";
const FIELDS = ["id", "institute", "contract", "contractId", "phone", "name"] as const;
const defaults: ProfileDetails = {
  id: customer.id,
  institute: INSTITUTE_ID,
  contract: customer.contract,
  contractId: "",
  phone: customer.phone,
  name: customer.name,
};

/** Fills missing or non-string fields from `fallback`. */
function normalize(raw: Record<string, unknown>, fallback: ProfileDetails): ProfileDetails {
  const result = { ...fallback };
  for (const key of FIELDS) {
    const value = raw[key];
    if (typeof value === "string" || typeof value === "number") {
      const text = String(value).trim();
      if (text) result[key] = text;
    }
  }
  return result;
}

function loadDetails(): ProfileDetails {
  if (!persistent) return defaults;
  try {
    const file = new File(Paths.document, DETAILS_FILE);
    if (!file.exists) return defaults;
    return normalize(JSON.parse(file.textSync()), defaults);
  } catch {
    return defaults;
  }
}

let details = loadDetails();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getDetails() {
  return details;
}

/** Saves a partial update merged over the current profile. */
export async function saveProfileDetails(next: Partial<ProfileDetails>) {
  const merged = { ...details, ...next };
  if (persistent) {
    await new File(Paths.document, DETAILS_FILE).write(JSON.stringify(merged));
  }
  details = merged;
  listeners.forEach((listener) => listener());
}

/**
 * Parses a sign-in QR payload (JSON with id, institute, contract, contractId,
 * phone, name). Returns null when it isn't a valid profile code.
 */
export function parseProfileQr(data: string): ProfileDetails | null {
  try {
    const raw = JSON.parse(data);
    if (!raw || typeof raw !== "object") return null;
    // Accept the misspelled key some generated codes use.
    if (raw.institute == null && raw.insttitute != null) raw.institute = raw.insttitute;
    const empty: ProfileDetails = { id: "", institute: "", contract: "", contractId: "", phone: "", name: "" };
    const parsed = normalize(raw, empty);
    return parsed.id && parsed.institute ? parsed : null;
  } catch {
    return null;
  }
}

/** Current profile (from QR sign-in or Profile edits); updates everywhere when saved. */
export function useProfileDetails() {
  return useSyncExternalStore(subscribe, getDetails);
}

/** Non-hook access for code outside React render. */
export { getDetails as getProfileDetails };
