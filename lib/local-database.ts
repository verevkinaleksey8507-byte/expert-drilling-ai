import type { DrillCalcProject } from "./project";

const DATABASE = "expert-drilling-ai";
const STORE = "projects";
const CURRENT = "current";

const openDatabase = () => new Promise<IDBDatabase>((resolve, reject) => {
  const request = indexedDB.open(DATABASE, 1);
  request.onupgradeneeded = () => {
    if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

export async function saveLocalProject(project: DrillCalcProject) {
  if (!("indexedDB" in window)) return;
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE, "readwrite");
    transaction.objectStore(STORE).put(project, CURRENT);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}

export async function loadLocalProject() {
  if (!("indexedDB" in window)) return null;
  const database = await openDatabase();
  const project = await new Promise<DrillCalcProject | null>((resolve, reject) => {
    const request = database.transaction(STORE, "readonly").objectStore(STORE).get(CURRENT);
    request.onsuccess = () => resolve((request.result as DrillCalcProject | undefined) ?? null);
    request.onerror = () => reject(request.error);
  });
  database.close();
  return project;
}
