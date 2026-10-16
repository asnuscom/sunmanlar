/**
 * Sunmanlar Ailesi - Firebase Firestore Veri Migrasyon Betiği
 * 1.415 Kişilik soyağacı, başlangıç fotoğrafları ve duvar gönderilerini Firestore'a aktarır.
 */

import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  writeBatch, 
  doc, 
  collection, 
  getDocs, 
  setDoc,
  serverTimestamp 
} from "firebase/firestore";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase Yapılandırması
const firebaseConfig = {
  apiKey: "AIzaSyBJSPYjun1C11G9VynQvmBsvG8roto5FBA",
  authDomain: "sunmanlar-31f36.firebaseapp.com",
  projectId: "sunmanlar-31f36",
  storageBucket: "sunmanlar-31f36.firebasestorage.app",
  messagingSenderId: "106447788622",
  appId: "1:106447788622:web:1bb8841cbeadb0c435c11f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Veri dosyalarını oku
const familyDataPath = path.resolve(__dirname, "../src/data/familyData.json");
const rawData = fs.readFileSync(familyDataPath, "utf-8");
const persons = JSON.parse(rawData);

// Mock fotoğraflar ve duvar mesajları
const INITIAL_PHOTOS = [
  {
    id: "photo_1",
    title: "1965 Sakarya Hendek Aile Buluşması",
    description: "Köy meydanında bayram sabahı çekilen tarihi aile fotoğrafı. Büyükler ve torunlar bir arada.",
    url: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80",
    year: "1965",
    location: "Sakarya / Hendek",
    taggedPersons: ["START", "NIS42", "Z141M", "HGJ2X"],
    uploadedBy: "Admin",
    createdAt: "2025-06-12"
  },
  {
    id: "photo_2",
    title: "Eski Değirmen Önünde Hatıra",
    description: "Sunmanlar ailesinin işlettiği tarihi su değirmeninin önünde bir ikindi vakti.",
    url: "https://images.unsplash.com/photo-1473186578172-c141e6798cf4?auto=format&fit=crop&w=1200&q=80",
    year: "1972",
    location: "Düzce / Akçakoca",
    taggedPersons: ["MM62G", "HGJ2X"],
    uploadedBy: "Sümeyye Sunman",
    createdAt: "2025-07-20"
  },
  {
    id: "photo_3",
    title: "1988 Gençler Düğün Hatırası",
    description: "Tüm akrabaların bir araya geldiği neşeli bir düğün hatırası.",
    url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
    year: "1988",
    location: "İstanbul",
    taggedPersons: ["GA7F8", "QWN7W", "GY0KU"],
    uploadedBy: "Ahmet Sunman",
    createdAt: "2025-08-15"
  }
];

const INITIAL_WALL_POSTS = [
  {
    id: "post_1",
    authorName: "Hüseyin Sunman",
    authorPersonId: "START",
    category: "duyuru",
    title: "Geleneksel Sunmanlar Aile Buluşması",
    content: "Kıymetli akrabalarımız, bu yılki geleneksel aile buluşmamızı Hendek köy konağında düzenliyoruz. Tüm kolların katılımını bekliyoruz!",
    date: "Bugün, 14:30",
    likes: 24,
    comments: [
      { id: "c1", author: "Emine Sunman", text: "İnşallah ailece oradayız!" },
      { id: "c2", author: "Kemal Sunman", text: "Sabırsızlıkla bekliyoruz." }
    ]
  },
  {
    id: "post_2",
    authorName: "Ayşe Sunman",
    authorPersonId: "MXR17",
    category: "anı",
    title: "Ali Ağa Dedemin Güzel Bir Hatırası",
    content: "Rahmetli Ali Ağa dedemiz her bayram sofrada önce en küçük torundan başlar, herkesin halini hatırını tek tek sorardı. Mekanı cennet olsun.",
    date: "Dün, 19:15",
    likes: 42,
    comments: [
      { id: "c3", author: "Mehmet Sunman", text: "Mekanı cennet olsun, çok büyük adamdı." }
    ]
  },
  {
    id: "post_3",
    authorName: "Sümeyye Sunman",
    authorPersonId: null,
    category: "tebrik",
    title: "Yeni Aile Portalımız Hayırlı Olsun!",
    content: "Tüm Sunmanlar ailesine selamlar! 1.415 kişilik soy kütüğümüzü bir araya getirdiğimiz sitemizde herkes kendi profilini inceleyebilir, fotoğraf ekleyebilir.",
    date: "3 gün önce",
    likes: 58,
    comments: []
  }
];

async function runMigration() {
  console.log("==================================================");
  console.log("🌿 Sunmanlar Ailesi Firestore Migrasyonu Başlıyor...");
  console.log(`📊 Toplam Birey Sayısı: ${persons.length}`);
  console.log("==================================================");

  // 1. Kişileri Batch'ler halinde Firestore'a yaz (Her batch 400 kişi)
  const BATCH_SIZE = 400;
  const totalBatches = Math.ceil(persons.length / BATCH_SIZE);

  for (let i = 0; i < totalBatches; i++) {
    const batch = writeBatch(db);
    const chunk = persons.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);

    chunk.forEach(person => {
      const docRef = doc(db, "persons", person.id);
      batch.set(docRef, {
        ...person,
        isBase: true,
        migratedAt: new Date().toISOString()
      }, { merge: true });
    });

    console.log(`⏳ Batch ${i + 1}/${totalBatches} yazılıyor (${chunk.length} kişi)...`);
    await batch.commit();
    console.log(`✅ Batch ${i + 1}/${totalBatches} tamamlandı!`);
  }

  // 2. Fotoğrafları Yaz
  console.log("📸 Fotoğraf galerisi Firestore'a aktarılıyor...");
  const photoBatch = writeBatch(db);
  INITIAL_PHOTOS.forEach(photo => {
    const docRef = doc(db, "photos", photo.id);
    photoBatch.set(docRef, { ...photo, updatedAt: new Date().toISOString() }, { merge: true });
  });
  await photoBatch.commit();
  console.log(`✅ ${INITIAL_PHOTOS.length} başlangıç fotoğrafı aktarıldı.`);

  // 3. Aile Duvarı Gönderilerini Yaz
  console.log("💬 Aile duvarı gönderileri Firestore'a aktarılıyor...");
  const wallBatch = writeBatch(db);
  INITIAL_WALL_POSTS.forEach(post => {
    const docRef = doc(db, "wall_posts", post.id);
    wallBatch.set(docRef, { ...post, updatedAt: new Date().toISOString() }, { merge: true });
  });
  await wallBatch.commit();
  console.log(`✅ ${INITIAL_WALL_POSTS.length} duvar gönderisi aktarıldı.`);

  // 4. Sistem ve Migrasyon Durumunu Kaydet
  console.log("⚙️ Sistem meta bilgileri kaydediliyor...");
  await setDoc(doc(db, "settings", "system"), {
    migrated: true,
    totalPersons: persons.length,
    rootPersonId: "START",
    version: 1,
    lastMigratedAt: new Date().toISOString(),
    updatedAt: serverTimestamp()
  });

  console.log("==================================================");
  console.log("🎉 TEBRİKLER! Tüm veriler başarıyla Firestore'a aktarıldı!");
  console.log("==================================================");
  process.exit(0);
}

runMigration().catch(err => {
  console.error("❌ Migrasyon Hatası:", err);
  process.exit(1);
});
