/**
 * Gelişmiş Türk Aile Yapısına Uygun Akrabalık Bağı Hesaplayıcı & Yol Haritası Bulucu
 * (Authentic Turkish Kinship Graph Engine & Path Finder)
 * 
 * Türk aile geleneğinde var olan tüm unvanları (Amca, Dayı, Hala, Teyze, 
 * Görümce, Baldız, Bacanak, Elti, Yenge, Enişte, Kayınpeder, Kayınvalide, 
 * Kayınbirader, Dünür, Dede, Babaanne, Anneanne, Ağabey, Abla, Amcaoğlu vb.)
 * 1.415 kişilik ağaçta BFS graf algoritması ile tespit eder.
 */

export const BRANCH_NAMES = {
  'START': 'Kök Ata Kolu (Ali Sunman)',
  'HGJ2X': 'Ali Ağa Kolu',
  'Z141M': 'Hasan Efendi Kolu',
  'MM62G': 'Laz Osman Kolu',
  'NIS42': 'Mehmet Kolu'
};

/**
 * BFS ile iki kişi arasındaki en kısa akrabalık yolunu bulur.
 */
export function findKinshipPath(sourceId, targetId, personsMap) {
  if (!sourceId || !targetId || !personsMap) return null;
  if (sourceId === targetId) return { type: 'SELF', text: 'Kendiniz', path: [] };

  const source = personsMap[sourceId];
  const target = personsMap[targetId];
  if (!source || !target) return null;

  // BFS Queue: [ { currentId, path: [ { personId, relation, text } ] } ]
  const queue = [{ id: sourceId, path: [] }];
  const visited = new Set([sourceId]);

  while (queue.length > 0) {
    const { id, path } = queue.shift();
    const current = personsMap[id];
    if (!current) continue;

    const neighbors = [];

    // 1. Baba
    if (current.fatherId && personsMap[current.fatherId]) {
      neighbors.push({
        id: current.fatherId,
        relation: 'BABA',
        text: 'Babası'
      });
    }

    // 2. Anne
    if (current.motherId && personsMap[current.motherId]) {
      neighbors.push({
        id: current.motherId,
        relation: 'ANNE',
        text: 'Annesi'
      });
    }

    // 3. Çocuklar
    (current.childrenIds || []).forEach(childId => {
      const child = personsMap[childId];
      if (child) {
        neighbors.push({
          id: childId,
          relation: child.gender === 'male' ? 'OGUL' : 'KIZ',
          text: child.gender === 'male' ? 'Oğlu' : 'Kızı'
        });
      }
    });

    // 4. Eşler
    (current.spouseIds || []).forEach(spId => {
      const sp = personsMap[spId];
      if (sp) {
        neighbors.push({
          id: spId,
          relation: 'ES',
          text: sp.gender === 'female' ? 'Hanımı' : 'Kocası'
        });
      }
    });

    for (const neighbor of neighbors) {
      if (neighbor.id === targetId) {
        // Hedefe ulaşıldı!
        const fullPath = [...path, neighbor];
        const kinshipText = describeTurkishKinshipPath(fullPath, source, target, personsMap);
        return {
          source,
          target,
          path: fullPath,
          text: kinshipText.title,
          subDescription: kinshipText.detail,
          degree: kinshipText.degree
        };
      }

      if (!visited.has(neighbor.id)) {
        visited.add(neighbor.id);
        queue.push({
          id: neighbor.id,
          path: [...path, neighbor]
        });
      }
    }
  }

  return {
    source,
    target,
    path: [],
    text: 'Sunmanlar Aile Bireyi',
    subDescription: 'Aynı sülaleden akrabanız',
    degree: 'Uzak Soydaş'
  };
}

/**
 * BFS adımlarını Türk Aile Yapısı ve Terminolojisine dönüştürür
 */
function describeTurkishKinshipPath(path, source, target, personsMap) {
  const len = path.length;
  const isTargetMale = target.gender === 'male';
  const isSourceMale = source.gender === 'male';

  // Doğum yılına göre yaş kıyası (Ağabey / Abla tespiti)
  const isTargetOlder = () => {
    if (target.birthDate && source.birthDate) {
      const tYear = parseInt(target.birthDate.slice(0, 4), 10);
      const sYear = parseInt(source.birthDate.slice(0, 4), 10);
      if (!isNaN(tYear) && !isNaN(sYear)) {
        return tYear < sYear;
      }
    }
    return false;
  };

  // 1 Adım: Çekirdek Aile
  if (len === 1) {
    const rel = path[0].relation;
    if (rel === 'BABA') return { title: 'Babanız', detail: '1. Derece Kan Bağı', degree: '1. Derece' };
    if (rel === 'ANNE') return { title: 'Anneniz', detail: '1. Derece Kan Bağı', degree: '1. Derece' };
    if (rel === 'OGUL') return { title: 'Oğlunuz', detail: '1. Derece Kan Bağı', degree: '1. Derece' };
    if (rel === 'KIZ') return { title: 'Kızınız', detail: '1. Derece Kan Bağı', degree: '1. Derece' };
    if (rel === 'ES') return { title: isTargetMale ? 'Eşiniz (Kocanız / Beyiniz)' : 'Eşiniz (Hanımınız)', detail: 'Sıhri Hısımlık', degree: 'Eş' };
  }

  // 2 Adım: Kardeşler, Dedeler, Nineler, Torunlar, Damat/Gelin, Kayınpeder/Kayınvalide
  if (len === 2) {
    const [r1, r2] = [path[0].relation, path[1].relation];

    // Kardeşler: Baba -> Çocuk veya Anne -> Çocuk
    if ((r1 === 'BABA' || r1 === 'ANNE') && (r2 === 'OGUL' || r2 === 'KIZ')) {
      if (isTargetMale) {
        const older = isTargetOlder();
        return { 
          title: older ? 'Ağabeyiniz (Abiniz)' : 'Erkek Kardeşiniz', 
          detail: 'Öz Erkek Kardeşiniz', 
          degree: '2. Derece' 
        };
      } else {
        const older = isTargetOlder();
        return { 
          title: older ? 'Ablanız' : 'Kız Kardeşiniz', 
          detail: 'Öz Kız Kardeşiniz', 
          degree: '2. Derece' 
        };
      }
    }

    // Dedeler / Nineler (Büyükbaba / Babaanne / Anneanne ayrımı)
    if (r1 === 'BABA' && r2 === 'BABA') return { title: 'Dedeniz (Büyükbabanız - Baba Tarafı)', detail: 'Babanızın Babası', degree: '2. Derece' };
    if (r1 === 'BABA' && r2 === 'ANNE') return { title: 'Babaanneniz', detail: 'Babanızın Annesi', degree: '2. Derece' };
    if (r1 === 'ANNE' && r2 === 'BABA') return { title: 'Dedeniz (Büyükbabanız - Anne Tarafı)', detail: 'Annenizin Babası', degree: '2. Derece' };
    if (r1 === 'ANNE' && r2 === 'ANNE') return { title: 'Anneanneniz', detail: 'Annenizin Annesi', degree: '2. Derece' };

    // Torunlar
    if (r1 === 'OGUL' && r2 === 'OGUL') return { title: 'Erkek Torununuz (Oğlunuzun Oğlu)', detail: 'Torununuz', degree: '2. Derece' };
    if (r1 === 'OGUL' && r2 === 'KIZ') return { title: 'Kız Torununuz (Oğlunuzun Kızı)', detail: 'Torununuz', degree: '2. Derece' };
    if (r1 === 'KIZ' && r2 === 'OGUL') return { title: 'Erkek Torununuz (Kızınızın Oğlu)', detail: 'Torununuz', degree: '2. Derece' };
    if (r1 === 'KIZ' && r2 === 'KIZ') return { title: 'Kız Torununuz (Kızınızın Kızı)', detail: 'Torununuz', degree: '2. Derece' };

    // Kayınpeder & Kayınvalide (Kaynata & Kaynana)
    if (r1 === 'ES' && r2 === 'BABA') return { title: 'Kayınpederiniz (Kayınbabanız / Kaynatanız)', detail: 'Eşinizin Babası', degree: 'Sıhri Hısım' };
    if (r1 === 'ES' && r2 === 'ANNE') return { title: 'Kayınvalideniz (Kaynananız)', detail: 'Eşinizin Annesi', degree: 'Sıhri Hısım' };

    // Gelin & Damat
    if (r1 === 'OGUL' && r2 === 'ES') return { title: 'Gelininiz', detail: 'Oğlunuzun Eşi', degree: 'Sıhri Hısım' };
    if (r1 === 'KIZ' && r2 === 'ES') return { title: 'Damadınız', detail: 'Kızınızın Eşi', degree: 'Sıhri Hısım' };

    // Üvey Çocuk
    if (r1 === 'ES' && (r2 === 'OGUL' || r2 === 'KIZ')) {
      return { 
        title: isTargetMale ? 'Üvey Oğlunuz' : 'Üvey Kızınız', 
        detail: 'Eşinizin Çocuğu', 
        degree: 'Sıhri Hısım' 
      };
    }
  }

  // 3 Adım: Amca, Dayı, Hala, Teyze, Yeğen, Yenge, Enişte, Baldız, Görümce, Kayınbirader
  if (len === 3) {
    const [r1, r2, r3] = [path[0].relation, path[1].relation, path[2].relation];

    // Amca / Hala (Babanın Kardeşleri)
    if (r1 === 'BABA' && (r2 === 'BABA' || r2 === 'ANNE') && (r3 === 'OGUL' || r3 === 'KIZ')) {
      if (r3 === 'OGUL') return { title: 'Amcanız', detail: 'Babanızın Erkek Kardeşi', degree: '3. Derece Kan Bağı' };
      if (r3 === 'KIZ') return { title: 'Halanız', detail: 'Babanızın Kız Kardeşi', degree: '3. Derece Kan Bağı' };
    }

    // Dayı / Teyze (Annenin Kardeşleri)
    if (r1 === 'ANNE' && (r2 === 'BABA' || r2 === 'ANNE') && (r3 === 'OGUL' || r3 === 'KIZ')) {
      if (r3 === 'OGUL') return { title: 'Dayınız', detail: 'Annenizin Erkek Kardeşi', degree: '3. Derece Kan Bağı' };
      if (r3 === 'KIZ') return { title: 'Teyzeniz', detail: 'Annenizin Kız Kardeşi', degree: '3. Derece Kan Bağı' };
    }

    // Yeğenler (Kardeşin Çocukları)
    if ((r1 === 'BABA' || r1 === 'ANNE') && (r2 === 'OGUL' || r2 === 'KIZ') && (r3 === 'OGUL' || r3 === 'KIZ')) {
      const parentIsBro = r2 === 'OGUL';
      return { 
        title: isTargetMale ? 'Erkek Yeğeniniz' : 'Kız Yeğeniniz', 
        detail: `${parentIsBro ? 'Erkek Kardeşinizin' : 'Kız Kardeşinizin'} Çocuğu`, 
        degree: '3. Derece Kan Bağı' 
      };
    }

    // Yenge & Enişte (Öz Kardeşlerin Eşleri)
    if ((r1 === 'BABA' || r1 === 'ANNE') && (r2 === 'OGUL' || r2 === 'KIZ') && r3 === 'ES') {
      if (r2 === 'OGUL') return { title: 'Yengeniz', detail: 'Erkek Kardeşinizin Eşi', degree: 'Sıhri Hısım' };
      if (r2 === 'KIZ') return { title: 'Enişteniz', detail: 'Kız Kardeşinizin Eşi', degree: 'Sıhri Hısım' };
    }

    // Kayınbirader / Baldız / Görümce (Eşin Kardeşleri - Türk Aile Yapısı Ayrımı)
    if (r1 === 'ES' && (r2 === 'BABA' || r2 === 'ANNE') && (r3 === 'OGUL' || r3 === 'KIZ')) {
      if (isTargetMale) {
        return { 
          title: 'Kayınbiraderiniz (Kaynınız)', 
          detail: 'Eşinizin Erkek Kardeşi', 
          degree: 'Sıhri Hısım' 
        };
      } else {
        // Hedef kadın ise:
        // Erkek kullanıcı için eşinin kız kardeşi = BALDIZ
        // Kadın kullanıcı için eşinin kız kardeşi = GÖRÜMCE
        return { 
          title: isSourceMale ? 'Baldızınız' : 'Görümceniz', 
          detail: isSourceMale ? 'Hanımınızın Kız Kardeşi' : 'Beyinizin Kız Kardeşi', 
          degree: 'Sıhri Hısım' 
        };
      }
    }

    // Büyük Dede & Büyük Nine
    if ((r1 === 'BABA' || r1 === 'ANNE') && (r2 === 'BABA' || r2 === 'ANNE') && (r3 === 'BABA' || r3 === 'ANNE')) {
      return { 
        title: isTargetMale ? 'Büyük Dedeniz' : 'Büyük Büyükanne / Büyük Nineniz', 
        detail: 'Dedenizin / Ninenizin Ebeveyni', 
        degree: '3. Derece' 
      };
    }

    // Torun Çocuğu (Büyük Torun)
    if ((r1 === 'OGUL' || r1 === 'KIZ') && (r2 === 'OGUL' || r2 === 'KIZ') && (r3 === 'OGUL' || r3 === 'KIZ')) {
      return {
        title: isTargetMale ? 'Torun Çocuğunuz (Erkek Büyük Torun)' : 'Torun Çocuğunuz (Kız Büyük Torun)',
        detail: 'Torununuzun Çocuğu',
        degree: '3. Derece'
      };
    }
  }

  // 4 Adım: Kuzenler, Amca/Dayı/Hala Yengesi ve Eniştesi, Bacanak, Elti, Dünür
  if (len === 4) {
    const [r1, r2, r3, r4] = [path[0].relation, path[1].relation, path[2].relation, path[3].relation];

    // Amcaoğlu / Amcakızı (Babanın erkek kardeşinin çocuğu)
    if (r1 === 'BABA' && (r2 === 'BABA' || r2 === 'ANNE') && r3 === 'OGUL' && (r4 === 'OGUL' || r4 === 'KIZ')) {
      return {
        title: isTargetMale ? 'Amcaoğlunuz' : 'Amcakızınız',
        detail: `Amcanızın ${isTargetMale ? 'Oğlu' : 'Kızı'} (Öz Kuzeniniz)`,
        degree: '4. Derece Kan Bağı'
      };
    }

    // Halaoğlu / Halakızı (Babanın kız kardeşinin çocuğu)
    if (r1 === 'BABA' && (r2 === 'BABA' || r2 === 'ANNE') && r3 === 'KIZ' && (r4 === 'OGUL' || r4 === 'KIZ')) {
      return {
        title: isTargetMale ? 'Halaoğlunuz' : 'Halakızınız',
        detail: `Halanızın ${isTargetMale ? 'Oğlu' : 'Kızı'} (Öz Kuzeniniz)`,
        degree: '4. Derece Kan Bağı'
      };
    }

    // Dayıoğlu / Dayıkızı (Annenin erkek kardeşinin çocuğu)
    if (r1 === 'ANNE' && (r2 === 'BABA' || r2 === 'ANNE') && r3 === 'OGUL' && (r4 === 'OGUL' || r4 === 'KIZ')) {
      return {
        title: isTargetMale ? 'Dayıoğlunuz' : 'Dayıkızınız',
        detail: `Dayınızın ${isTargetMale ? 'Oğlu' : 'Kızı'} (Öz Kuzeniniz)`,
        degree: '4. Derece Kan Bağı'
      };
    }

    // Teyzeoğlu / Teyzekızı (Annenin kız kardeşinin çocuğu)
    if (r1 === 'ANNE' && (r2 === 'BABA' || r2 === 'ANNE') && r3 === 'KIZ' && (r4 === 'OGUL' || r4 === 'KIZ')) {
      return {
        title: isTargetMale ? 'Teyzeoğlunuz' : 'Teyzekızınız',
        detail: `Teyzenizin ${isTargetMale ? 'Oğlu' : 'Kızı'} (Öz Kuzeniniz)`,
        degree: '4. Derece Kan Bağı'
      };
    }

    // Amca Yengesi / Dayı Yengesi / Hala Eniştesi / Teyze Eniştesi
    if ((r1 === 'BABA' || r1 === 'ANNE') && (r2 === 'BABA' || r2 === 'ANNE') && (r3 === 'OGUL' || r3 === 'KIZ') && r4 === 'ES') {
      if (r1 === 'BABA' && r3 === 'OGUL') return { title: 'Yengeniz (Amcanızın Hanımı)', detail: 'Amca Eşi', degree: 'Sıhri Hısım' };
      if (r1 === 'BABA' && r3 === 'KIZ') return { title: 'Enişteniz (Halanızın Beyi)', detail: 'Hala Eşi', degree: 'Sıhri Hısım' };
      if (r1 === 'ANNE' && r3 === 'OGUL') return { title: 'Yengeniz (Dayınızın Hanımı)', detail: 'Dayı Eşi', degree: 'Sıhri Hısım' };
      if (r1 === 'ANNE' && r3 === 'KIZ') return { title: 'Enişteniz (Teyzenizin Beyi)', detail: 'Teyze Eşi', degree: 'Sıhri Hısım' };
    }

    // Bacanak & Elti (Kardeşlerin Eşleri Arasındaki Türk Akrabalık Bağı)
    if (r1 === 'ES' && (r2 === 'BABA' || r2 === 'ANNE') && (r3 === 'OGUL' || r3 === 'KIZ') && r4 === 'ES') {
      if (isSourceMale && isTargetMale) {
        return { 
          title: 'Bacanağınız', 
          detail: 'Eşlerinizin kız kardeş olması', 
          degree: 'Sıhri Hısım' 
        };
      }
      if (!isSourceMale && !isTargetMale) {
        return { 
          title: 'Eltiniz', 
          detail: 'Eşlerinizin erkek kardeş olması', 
          degree: 'Sıhri Hısım' 
        };
      }
    }

    // Dünür (Çocuğun eşinin ebeveyni)
    if ((r1 === 'OGUL' || r1 === 'KIZ') && r2 === 'ES' && (r3 === 'BABA' || r3 === 'ANNE')) {
      const inLawType = isTargetMale ? 'Dünürünüz (Erkek Dünür)' : 'Dünürünüz (Hanım Dünür)';
      return {
        title: inLawType,
        detail: `${r1 === 'OGUL' ? 'Gelinimizin' : 'Damadımızın'} ${isTargetMale ? 'Babası' : 'Annesi'}`,
        degree: 'Dünürlük Bağı'
      };
    }

    // Yeğeninizin Çocuğu (Kardeş Torunu)
    if ((r1 === 'BABA' || r1 === 'ANNE') && (r2 === 'OGUL' || r2 === 'KIZ') && (r3 === 'OGUL' || r3 === 'KIZ') && (r4 === 'OGUL' || r4 === 'KIZ')) {
      return {
        title: isTargetMale ? 'Yeğeninizin Oğlu (Kardeş Torunu)' : 'Yeğeninizin Kızı (Kardeş Torunu)',
        detail: 'Kardeşinizin Torunu',
        degree: '4. Derece'
      };
    }

    // Babanın Amcası / Dayısı / Halası / Teyzesi (Büyük Amcalar)
    if (r1 === 'BABA' && (r2 === 'BABA' || r2 === 'ANNE') && (r3 === 'BABA' || r3 === 'ANNE') && (r4 === 'OGUL' || r4 === 'KIZ')) {
      if (r4 === 'OGUL') return { title: 'Büyük Amcanız', detail: 'Babanızın Amcası / Dedenizin Kardeşi', degree: '4. Derece' };
      if (r4 === 'KIZ') return { title: 'Büyük Halanız', detail: 'Babanızın Halası / Dedenizin Kız Kardeşi', degree: '4. Derece' };
    }
  }

  // 5 Adım: Babanın Amcasının Oğlu (2. Kuşak Kuzen), Kuzen Çocukları
  if (len === 5) {
    const [r1, r2, r3, r4, r5] = [path[0].relation, path[1].relation, path[2].relation, path[3].relation, path[4].relation];

    // Babanın amcasının oğlu
    if (r1 === 'BABA' && (r2 === 'BABA' || r2 === 'ANNE') && (r3 === 'BABA' || r3 === 'ANNE') && r4 === 'OGUL' && (r5 === 'OGUL' || r5 === 'KIZ')) {
      return {
        title: isTargetMale ? 'Babanızın Amcasının Oğlu' : 'Babanızın Amcasının Kızı',
        detail: 'Babanızın Kuzeni (2. Kuşak Kuzeniniz)',
        degree: '5. Derece Soy Bağı'
      };
    }

    // Kuzeninizin Çocuğu
    if ((r1 === 'BABA' || r1 === 'ANNE') && (r2 === 'BABA' || r2 === 'ANNE') && (r3 === 'OGUL' || r3 === 'KIZ') && (r4 === 'OGUL' || r4 === 'KIZ') && (r5 === 'OGUL' || r5 === 'KIZ')) {
      return {
        title: isTargetMale ? 'Kuzeninizin Oğlu (Yeğen Derecesi)' : 'Kuzeninizin Kızı (Yeğen Derecesi)',
        detail: 'Kuzeninizin Çocuğu',
        degree: '5. Derece'
      };
    }
  }

  // 6+ Adım: Derin Soydaşlık Zinciri
  const stepChain = path.map(p => p.text).join(' → ');
  return {
    title: `${path[0].text} ${path[path.length - 1].text} (Soydan Akrabanız)`,
    detail: `Bağlantı Yolu: ${stepChain}`,
    degree: `${len}. Kuşak Akraba`
  };
}

/**
 * Geriye uyumluluk için eski metot
 */
export function findRelationship(sourceId, targetId, personsMap) {
  const res = findKinshipPath(sourceId, targetId, personsMap);
  return res ? res.text : null;
}
