import { File, Paths } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useSyncExternalStore } from "react";
import { Platform } from "react-native";

// The photo is copied into the app's documents folder so it survives restarts.
// Web has no app file system, so there it only lasts for the session.
const PHOTO_NAME = "profile-photo.jpg";
const persistent = Platform.OS !== "web";

function savedPhotoUri() {
  if (!persistent) return null;
  try {
    const file = new File(Paths.document, PHOTO_NAME);
    return file.exists ? file.uri : null;
  } catch {
    return null;
  }
}

let photoUri: string | null = savedPhotoUri();
const listeners = new Set<() => void>();

function setPhoto(uri: string | null) {
  photoUri = uri;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Opens the photo library; returns false if the user denied access. */
export async function pickProfilePhoto(): Promise<boolean> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted && Platform.OS !== "web") return false;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: "images",
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });
  if (result.canceled) return true;

  const picked = result.assets[0].uri;
  if (!persistent) {
    setPhoto(picked);
    return true;
  }
  const destination = new File(Paths.document, PHOTO_NAME);
  await new File(picked).copy(destination, { overwrite: true });
  // Same file path every time, so bust the image cache with a version query.
  setPhoto(`${destination.uri}?v=${Date.now()}`);
  return true;
}

export function removeProfilePhoto() {
  if (persistent) {
    const file = new File(Paths.document, PHOTO_NAME);
    if (file.exists) file.delete();
  }
  setPhoto(null);
}

/** Current profile photo URI, or null; updates everywhere when it changes. */
export function useProfilePhoto() {
  return useSyncExternalStore(subscribe, () => photoUri);
}
