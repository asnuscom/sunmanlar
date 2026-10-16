/**
 * Başlangıç Fotoğraf Galerisi ve Aile Duvarı Örnek Verileri
 */

export const INITIAL_PHOTOS = [
  {
    id: "photo_1",
    title: "1965 Sakarya Hendek Aile Buluşması",
    description: "Köy meydanında bayram sabahı çekilen tarihi aile fotoğrafı. Büyükler ve torunlar bir arada.",
    url: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80",
    year: "1965",
    location: "Sakarya / Hendek",
    taggedPersons: ["START", "NIS42", "Z141M", "HGJ2X"], // Ali, Mehmet, Hasan Efendi, Ali Ağa
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
    taggedPersons: ["MM62G", "HGJ2X"], // Laz Osman, Ali Ağa
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
    taggedPersons: ["GA7F8", "QWN7W", "GY0KU"], // Şevki, Mahmut, Hasan
    uploadedBy: "Ahmet Sunman",
    createdAt: "2025-08-15"
  }
];

export const INITIAL_WALL_POSTS = [
  {
    id: "post_1",
    authorName: "Hüseyin Sunman",
    authorPersonId: "START",
    category: "duyuru", // duyuru, tebrik, anı, taziye
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
