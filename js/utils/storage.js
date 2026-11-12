/**
 * Safe wrappers around Web Storage.
 * Browsers can throw when storage is disabled (Safari private mode, embedded
 * webviews, strict privacy settings). The site must still work in those cases.
 */

export function storageGet(storage, key) {
  try {
    return storage.getItem(key);
  } catch (error) {
    return null;
  }
}

export function storageSet(storage, key, value) {
  try {
    storage.setItem(key, value);
    return true;
  } catch (error) {
    return false;
  }
}

export function sessionGet(key) {
  return storageGet(window.sessionStorage, key);
}

export function sessionSet(key, value) {
  return storageSet(window.sessionStorage, key, value);
}

export function localGet(key) {
  return storageGet(window.localStorage, key);
}

export function localSet(key, value) {
  return storageSet(window.localStorage, key, value);
}
