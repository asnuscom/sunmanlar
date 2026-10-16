/**
 * Sunmanlar Ailesi - Gerçek Zamanlı Firebase Firestore Senkronizasyon Servisi
 * Bu servis tüm aile bireyleri arasında anlık veri akışını, migrasyonu ve çift yönlü senkronizasyonu yönetir.
 */

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  writeBatch, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from "firebase/firestore";
import { db, COLLECTIONS } from "./firebase";
import { INITIAL_PHOTOS, INITIAL_WALL_POSTS } from "../data/mockPhotosAndPosts";

/**
 * Sistem durumunu getirir (migrasyon yapılmış mı, kişi sayısı vb.)
 */
export async function getSystemStatus() {
  try {
    const docRef = doc(db, COLLECTIONS.SETTINGS, "system");
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data();
    }
    return { migrated: false, totalPersons: 0 };
  } catch (err) {
    console.warn("Firestore sistem durumu okunamadı:", err);
    return { migrated: false, totalPersons: 0, error: err.message };
  }
}

/**
 * 1.415 Kişilik aile verisini ve başlangıç içeriklerini Firestore'a migre eder
 */
export async function runInAppMigration(allPersons, onProgress) {
  try {
    if (onProgress) onProgress({ percent: 5, stage: "Migrasyon hazırlanıyor..." });

    const BATCH_SIZE = 400;
    const totalBatches = Math.ceil(allPersons.length / BATCH_SIZE);

    // 1. Kişileri gruplar halinde yaz
    for (let i = 0; i < totalBatches; i++) {
      const batch = writeBatch(db);
      const chunk = allPersons.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);

      chunk.forEach(p => {
        const pRef = doc(db, COLLECTIONS.PERSONS, p.id);
        batch.set(pRef, {
          ...p,
          isBase: true,
          migratedAt: new Date().toISOString()
        }, { merge: true });
      });

      await batch.commit();
      const percent = Math.round(10 + ((i + 1) / totalBatches) * 70);
      if (onProgress) {
        onProgress({ 
          percent, 
          stage: `Kişiler aktarılıyor: ${Math.min((i + 1) * BATCH_SIZE, allPersons.length)} / ${allPersons.length}` 
        });
      }
    }

    // 2. Fotoğrafları yaz
    if (onProgress) onProgress({ percent: 85, stage: "Fotoğraf galerisi aktarılıyor..." });
    const photoBatch = writeBatch(db);
    INITIAL_PHOTOS.forEach(photo => {
      const pRef = doc(db, COLLECTIONS.PHOTOS, photo.id);
      photoBatch.set(pRef, { ...photo, updatedAt: new Date().toISOString() }, { merge: true });
    });
    await photoBatch.commit();

    // 3. Duvar gönderilerini yaz
    if (onProgress) onProgress({ percent: 92, stage: "Aile duvarı gönderileri aktarılıyor..." });
    const wallBatch = writeBatch(db);
    INITIAL_WALL_POSTS.forEach(post => {
      const wRef = doc(db, COLLECTIONS.WALL_POSTS, post.id);
      wallBatch.set(wRef, { ...post, updatedAt: new Date().toISOString() }, { merge: true });
    });
    await wallBatch.commit();

    // 4. Sistem durumunu kaydet
    if (onProgress) onProgress({ percent: 98, stage: "Sistem durumu güncelleniyor..." });
    await setDoc(doc(db, COLLECTIONS.SETTINGS, "system"), {
      migrated: true,
      totalPersons: allPersons.length,
      rootPersonId: "START",
      version: 1,
      lastMigratedAt: new Date().toISOString(),
      updatedAt: serverTimestamp()
    });

    if (onProgress) onProgress({ percent: 100, stage: "Migrasyon başarıyla tamamlandı!" });
    return { success: true };
  } catch (err) {
    console.error("Migrasyon hatası:", err);
    throw err;
  }
}

/**
 * Buluttaki tüm bireyleri tek seferde çeker (Tam Yenileme)
 */
export async function fetchAllPersonsFromCloud() {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.PERSONS));
    const persons = [];
    snap.forEach(d => {
      persons.push(d.data());
    });
    return persons;
  } catch (err) {
    console.error("Buluttan kişiler çekilemedi:", err);
    throw err;
  }
}

/**
 * Değişen / Yeni eklenen kişileri canlı dinler (Delta Listener)
 */
export function subscribeToPersonDeltas(onDeltaReceived) {
  try {
    const q = query(
      collection(db, COLLECTIONS.PERSONS), 
      where("isDelta", "==", true)
    );
    return onSnapshot(q, (snapshot) => {
      const deltaPersons = [];
      snapshot.forEach(d => {
        deltaPersons.push(d.data());
      });
      if (deltaPersons.length > 0) {
        onDeltaReceived(deltaPersons);
      }
    }, (err) => {
      console.warn("Kişi delta dinleme hatası:", err);
    });
  } catch (err) {
    console.warn("Kişi dinleyicisi başlatılamadı:", err);
    return () => {};
  }
}

/**
 * Fotoğrafları gerçek zamanlı dinler
 */
export function subscribeToPhotos(onPhotosUpdated) {
  try {
    const q = collection(db, COLLECTIONS.PHOTOS);
    return onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach(d => {
        list.push({ ...d.data(), id: d.id });
      });
      // Yeniden eskiye sırala
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      onPhotosUpdated(list);
    }, (err) => {
      console.warn("Fotoğraf dinleme hatası:", err);
    });
  } catch (err) {
    console.warn("Fotoğraf dinleyicisi başlatılamadı:", err);
    return () => {};
  }
}

/**
 * Aile Duvarı gönderilerini gerçek zamanlı dinler
 */
export function subscribeToWallPosts(onPostsUpdated) {
  try {
    const q = collection(db, COLLECTIONS.WALL_POSTS);
    return onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach(d => {
        list.push({ ...d.data(), id: d.id });
      });
      // Yeniden eskiye sırala
      list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      onPostsUpdated(list);
    }, (err) => {
      console.warn("Duvar gönderileri dinleme hatası:", err);
    });
  } catch (err) {
    console.warn("Duvar dinleyicisi başlatılamadı:", err);
    return () => {};
  }
}

/**
 * Onay bekleyen talepleri gerçek zamanlı dinler (Admin için)
 */
export function subscribeToPendingRequests(onRequestsUpdated) {
  try {
    const q = collection(db, COLLECTIONS.PENDING_REQUESTS);
    return onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach(d => {
        list.push({ ...d.data(), id: d.id });
      });
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      onRequestsUpdated(list);
    }, (err) => {
      console.warn("Talepler dinleme hatası:", err);
    });
  } catch (err) {
    console.warn("Talep dinleyicisi başlatılamadı:", err);
    return () => {};
  }
}

/**
 * Yeni başvuru / talep kaydeder (Kişi ekleme, profil sahiplenme vb.)
 */
export async function savePendingRequestToCloud(reqData) {
  const reqId = reqData.id || `req_${Date.now()}`;
  const docRef = doc(db, COLLECTIONS.PENDING_REQUESTS, reqId);
  await setDoc(docRef, {
    ...reqData,
    id: reqId,
    createdAt: Date.now()
  });
  return reqId;
}

/**
 * Talebi reddeder veya siler
 */
export async function deletePendingRequestFromCloud(requestId) {
  const docRef = doc(db, COLLECTIONS.PENDING_REQUESTS, requestId);
  await deleteDoc(docRef);
}

/**
 * Yeni fotoğraf kaydeder
 */
export async function savePhotoToCloud(photoData) {
  const photoId = photoData.id || `photo_${Date.now()}`;
  const docRef = doc(db, COLLECTIONS.PHOTOS, photoId);
  await setDoc(docRef, {
    ...photoData,
    id: photoId,
    createdAt: photoData.createdAt || new Date().toISOString()
  });
}

/**
 * Aile Duvarına yeni gönderi kaydeder
 */
export async function saveWallPostToCloud(postData) {
  const postId = postData.id || `post_${Date.now()}`;
  const docRef = doc(db, COLLECTIONS.WALL_POSTS, postId);
  await setDoc(docRef, {
    ...postData,
    id: postId,
    timestamp: Date.now(),
    date: postData.date || "Şimdi",
    likes: postData.likes || 0,
    comments: postData.comments || []
  });
}

/**
 * Gönderiye yorum ekler
 */
export async function addCommentToCloud(postId, comment) {
  const docRef = doc(db, COLLECTIONS.WALL_POSTS, postId);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    const post = snap.data();
    const comments = [...(post.comments || []), comment];
    await updateDoc(docRef, { comments });
  }
}

/**
 * Gönderi beğeni sayısını günceller
 */
export async function toggleLikeInCloud(postId, newLikeCount) {
  const docRef = doc(db, COLLECTIONS.WALL_POSTS, postId);
  await updateDoc(docRef, { likes: newLikeCount });
}

/**
 * Admin: Yeni kişiyi onaylayıp Firestore'a kaydeder ve akrabaları bağlar
 */
export async function approvePersonInCloud(newPerson, relativesToUpdate = [], requestId = null) {
  const batch = writeBatch(db);

  // 1. Yeni kişiyi kaydet
  const personRef = doc(db, COLLECTIONS.PERSONS, newPerson.id);
  batch.set(personRef, {
    ...newPerson,
    isDelta: true,
    verified: true,
    updatedAt: new Date().toISOString()
  });

  // 2. Akraba bağlantılarını güncelle (anne, baba, eş, çocuk)
  relativesToUpdate.forEach(rel => {
    const relRef = doc(db, COLLECTIONS.PERSONS, rel.id);
    batch.update(relRef, {
      ...rel.updates,
      isDelta: true,
      updatedAt: new Date().toISOString()
    });
  });

  // 3. Bekleyen talebi sil
  if (requestId) {
    const reqRef = doc(db, COLLECTIONS.PENDING_REQUESTS, requestId);
    batch.delete(reqRef);
  }

  await batch.commit();
}

/**
 * Admin: Kişi profil düzenlemesini onaylar
 */
export async function approveEditInCloud(personId, editFields, requestId = null) {
  const batch = writeBatch(db);
  const personRef = doc(db, COLLECTIONS.PERSONS, personId);

  batch.update(personRef, {
    ...editFields,
    isDelta: true,
    verified: true,
    updatedAt: new Date().toISOString()
  });

  if (requestId) {
    const reqRef = doc(db, COLLECTIONS.PENDING_REQUESTS, requestId);
    batch.delete(reqRef);
  }

  await batch.commit();
}
