/**
 * Sülale Kolları ve Nesil (Jenerasyon) Hesaplayıcı
 * (Sunmanlar Branch and Generation Detection Engine)
 */

export const BRANCH_DEFINITIONS = [
  { id: 'ALL', name: 'Tüm Aile Bireyleri', shortName: 'Tümü', color: 'amber' },
  { id: 'START', name: 'Kök Ata (Ali Sunman)', shortName: 'Kök Ata', color: 'stone' },
  { id: 'HGJ2X', name: 'Ali Ağa Kolu', shortName: 'Ali Ağa', color: 'blue' },
  { id: 'Z141M', name: 'Hasan Efendi Kolu', shortName: 'Hasan Efendi', color: 'emerald' },
  { id: 'MM62G', name: 'Laz Osman Kolu', shortName: 'Laz Osman', color: 'purple' },
  { id: 'NIS42', name: 'Mehmet Kolu', shortName: 'Mehmet', color: 'cyan' },
];

const branchCache = new Map();
const generationCache = new Map();

/**
 * Bir kişinin hangi sülale koluna ait olduğunu yukarı doğru tarayarak bulur
 */
export function getPersonBranch(person, personsMap) {
  if (!person) return null;
  if (branchCache.has(person.id)) return branchCache.get(person.id);

  if (person.id === 'START') {
    const res = { id: 'START', name: 'Kök Ata', color: 'amber' };
    branchCache.set(person.id, res);
    return res;
  }

  let curr = person;
  let visited = new Set();

  while (curr && !visited.has(curr.id)) {
    visited.add(curr.id);

    // Ana dallardan biri mi?
    if (curr.id === 'HGJ2X') {
      const res = { id: 'HGJ2X', name: 'Ali Ağa Kolu', color: 'blue' };
      branchCache.set(person.id, res);
      return res;
    }
    if (curr.id === 'MM62G') {
      const res = { id: 'MM62G', name: 'Laz Osman Kolu', color: 'purple' };
      branchCache.set(person.id, res);
      return res;
    }
    if (curr.id === 'Z141M') {
      const res = { id: 'Z141M', name: 'Hasan Efendi Kolu', color: 'emerald' };
      branchCache.set(person.id, res);
      return res;
    }
    if (curr.id === 'NIS42') {
      const res = { id: 'NIS42', name: 'Mehmet Kolu', color: 'cyan' };
      branchCache.set(person.id, res);
      return res;
    }
    if (curr.id === 'START') {
      const res = { id: 'START', name: 'Ali Sunman Kolu', color: 'amber' };
      branchCache.set(person.id, res);
      return res;
    }

    // Yukarı çık: öncelikle baba, yoksa anne
    curr = curr.fatherId ? personsMap[curr.fatherId] : (curr.motherId ? personsMap[curr.motherId] : null);
  }

  const def = { id: 'OTHER', name: 'Sunman Ailesi', color: 'stone' };
  branchCache.set(person.id, def);
  return def;
}

/**
 * Kök Ata Ali Sunman'dan (1. Nesil) itibaren kişinin kaçıncı nesil olduğunu hesaplar
 */
export function getPersonGeneration(person, personsMap) {
  if (!person) return 1;
  if (generationCache.has(person.id)) return generationCache.get(person.id);

  if (person.id === 'START') {
    generationCache.set(person.id, 1);
    return 1;
  }

  let depth = 1;
  let curr = person;
  let visited = new Set();

  while (curr && curr.id !== 'START' && !visited.has(curr.id)) {
    visited.add(curr.id);
    depth++;
    curr = curr.fatherId ? personsMap[curr.fatherId] : (curr.motherId ? personsMap[curr.motherId] : null);
  }

  generationCache.set(person.id, depth);
  return depth;
}
