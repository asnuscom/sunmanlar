import React, { useState } from 'react';
import { 
  Compass, 
  X, 
  MapPin, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  ExternalLink, 
  Calendar, 
  FileText, 
  Award, 
  Landmark, 
  Users, 
  Sparkles,
  Flower2,
  Play,
  Pause
} from 'lucide-react';

export default function MemorialsAndArchiveModal({ isOpen, onClose, onSelectPerson, personsMap }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('cemeteries'); // cemeteries, documents, audio
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Aile Mezarlıkları
  const CEMETERIES = [
    {
      id: 'c1',
      name: 'Hendek Merkez Aile Mezarlığı',
      city: 'Sakarya / Hendek',
      description: 'Sunmanlar ailesinin kök atalarının ve büyük dedelerimizin ebedi istirahatgâhı. Ali Sunman, Hasan Efendi ve Mehmet kollarının kabirleri burada yer alır.',
      coordinates: '40.7963, 30.7486',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Hendek+Mezarligi+Sakarya',
      buriedPersons: ['START', 'Z141M', 'NIS42', 'HGJ2X']
    },
    {
      id: 'c2',
      name: 'Akçakoca Tarihi Aile Kabristanı',
      city: 'Düzce / Akçakoca',
      description: 'Laz Osman kolu ve Karadeniz sahilinde yerleşen Sunman fertlerinin tarihi aile mezarlığı.',
      coordinates: '41.0850, 31.1167',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Akcakoca+Mezarligi+Duzce',
      buriedPersons: ['MM62G']
    },
    {
      id: 'c3',
      name: 'İstanbul Edirnekapı Aile Kabristanı',
      city: 'İstanbul / Eyüpsultan',
      description: 'Cumhuriyet döneminde İstanbul\'a göç eden Sunmanlar tüccar ve bürokrat büyüklerimizin kabirleri.',
      coordinates: '41.0315, 28.9328',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Edirnekapi+Sehitligi+ve+Mezarligi',
      buriedPersons: []
    }
  ];

  // Tarihi Belgeler ve Osmanlıca Beratlar
  const HISTORICAL_DOCUMENTS = [
    {
      id: 'doc_1',
      title: '1844 Osmanlı Temettuat ve Nüfus Kaydı',
      category: 'Nüfus & Vergi Kaydı',
      period: 'Hicri 1260 (Miladi 1844)',
      summary: 'Kocaeli Sancağı Hendek kazası Sunmanlar hanesine ait hane reisi Ali Sunman ve oğullarının resmi Osmanlıca berat kaydı.',
      transcription: '“Kaza-i mezbur kurasından Hendek karyesinde mukim Sunmanoğlu Ali ve mahdumları Mehmed, Hasan ve Osman... Ashab-ı emlak ve zürra olup hüsn-i hal ile maruftur.”',
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'doc_2',
      title: '1902 Tarihi Su Değirmeni Vakfiyesi ve Tapusu',
      category: 'Tapu & Vakfiye',
      period: 'Hicri 1320 (Miladi 1902)',
      summary: 'Sunmanlar ailesinin Hendek çayı kenarında işlettiği 4 taşlı un değirmeninin mülkiyet ve su hakkı beratı.',
      transcription: '“Nefs-i Hendek civarında cari nehir üzerinde kain dört bab un değirmeni mülk-i mevrus olup Sunmanzade Ali Ağa tasarrufunda bulunmağla...”',
      imageUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'doc_3',
      title: 'Çanakkale ve İstiklal Harbi Gazilik Vesikası',
      category: 'Tarihi Askeri Belge',
      period: '1915 - 1922',
      summary: 'Sunman ailesinden Çanakkale ve Sakarya Meydan Muharebesi cephelerinde gazi olan aile büyüklerimizin madalya şerafet beratı.',
      transcription: '“Vatan ve millet uğrunda ifa eylediği fedakarane hidemat-ı celilesine mebni İstiklal Madalyası ile taltif kılınmıştır.”',
      imageUrl: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=1200&q=80'
    }
  ];

  // Ses Kayıtları
  const AUDIO_ARCHIVES = [
    {
      id: 'audio_1',
      title: '1984 Hendek Köy Odası Bayram Sohbeti',
      narrator: 'Hüseyin Sunman & Ahmet Sunman',
      duration: '4 dk 18 sn',
      year: '1984',
      description: 'Eski bayramlaşma gelenekleri, köy meydanındaki güreşler ve büyüklerin gençlere nasihatlerini içeren tarihi kaset kaydı.'
    },
    {
      id: 'audio_2',
      title: 'Laz Osman Dedemizin Kafkasya\'dan Göç Hatıraları',
      narrator: 'Mehmet Sunman (Torun)',
      duration: '6 dk 45 sn',
      year: '1992',
      description: 'Ailenin Kafkasya ve Karadeniz sahilinden Sakarya Hendek\'e yerleşme serüveni ve ilk değirmenin kuruluş hikayesi.'
    }
  ];

  const toggleAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-800 via-amber-700 to-amber-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white shadow-md">
              <Landmark className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Tarihi Arşiv, Belgeler ve Kabir Rehberi</h3>
              <p className="text-xs text-amber-200">Sunmanlar ailesinin tarihi tapuları, beratları, defin yerleri ve ses kayıtları</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6">
          <button
            onClick={() => setActiveTab('cemeteries')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'cemeteries'
                ? 'border-amber-600 text-amber-800 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Flower2 className="w-3.5 h-3.5 text-stone-500" />
            <span>Aile Mezarlıkları & Kabirler ({CEMETERIES.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'documents'
                ? 'border-amber-600 text-amber-800 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            <span>Tarihi Belgeler & Beratlar ({HISTORICAL_DOCUMENTS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audio')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'audio'
                ? 'border-amber-600 text-amber-800 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Sesli Sohbetler & Hatırat ({AUDIO_ARCHIVES.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: MEZARLIKLAR */}
          {activeTab === 'cemeteries' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 text-xs text-amber-950 flex items-start gap-2.5">
                <Flower2 className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold">Ebediyete İrtihal Eden Aile Büyüklerimizi Anma</h4>
                  <p className="text-[11px] text-amber-900 mt-0.5">
                    Aile büyüklerimizin kabir yerlerini ziyaret etmek ve dualar göndermek isteyen akrabalarımız için GPS koordinatları ve harita yol tarifleri aşağıdadır.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {CEMETERIES.map(cem => (
                  <div
                    key={cem.id}
                    className="p-5 bg-stone-50 hover:bg-stone-100/70 rounded-2xl border border-stone-200 transition-colors space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="font-extrabold text-sm text-stone-900 flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-amber-700" />
                          {cem.name}
                        </h4>
                        <span className="text-[11px] font-semibold text-stone-500">{cem.city}</span>
                      </div>

                      <a
                        href={cem.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-white border border-stone-300 hover:bg-amber-50 hover:border-amber-300 text-amber-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
                      >
                        <span>Google Haritalar'da Yol Tarifi Al</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed">
                      {cem.description}
                    </p>

                    {cem.buriedPersons.length > 0 && (
                      <div className="pt-2 border-t border-stone-200 flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                          Burada Yatan Büyüklerimiz:
                        </span>
                        {cem.buriedPersons.map(pid => {
                          const p = personsMap[pid];
                          if (!p) return null;
                          return (
                            <button
                              key={pid}
                              onClick={() => {
                                onClose();
                                onSelectPerson(p);
                              }}
                              className="px-2.5 py-1 bg-white hover:bg-amber-100 rounded-lg border border-stone-200 text-xs font-semibold text-stone-800 transition-colors"
                            >
                              {p.firstName} {p.lastName}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: TARİHİ BELGELER */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {HISTORICAL_DOCUMENTS.map(doc => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs hover:border-amber-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="relative aspect-16/9 rounded-xl overflow-hidden bg-stone-100 mb-3 border border-stone-100">
                        <img 
                          src={doc.imageUrl} 
                          alt={doc.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2 left-2 bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {doc.period}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-xs text-stone-900 group-hover:text-amber-800 transition-colors">
                        {doc.title}
                      </h4>
                      <p className="text-[11px] text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                        {doc.summary}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                        {doc.category}
                      </span>
                      <span className="text-[11px] font-bold text-stone-600 group-hover:text-amber-700 transition-colors">
                        Tercümeyi Oku →
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Document Detail Lightbox */}
              {selectedDoc && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
                  <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto animate-in zoom-in-95">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                          {selectedDoc.period} • {selectedDoc.category}
                        </span>
                        <h3 className="font-extrabold text-base text-stone-900">{selectedDoc.title}</h3>
                      </div>
                      <button 
                        onClick={() => setSelectedDoc(null)}
                        className="p-1.5 rounded-full hover:bg-stone-100"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="aspect-16/9 rounded-xl overflow-hidden bg-stone-100 border">
                      <img src={selectedDoc.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h5 className="text-xs font-bold text-stone-700">Tarihi Arka Planı:</h5>
                        <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">{selectedDoc.summary}</p>
                      </div>

                      <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200">
                        <h5 className="text-xs font-bold text-amber-950 mb-1">Osmanlıca Orijinal Metin Tercümesi:</h5>
                        <p className="text-xs font-serif italic text-amber-900 leading-relaxed whitespace-pre-line">
                          {selectedDoc.transcription}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SESLİ ANILAR VE SOHBETLER */}
          {activeTab === 'audio' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleAudio}
                    className="w-12 h-12 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center shadow-md shadow-amber-600/30 transition-transform active:scale-95"
                  >
                    {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                  <div>
                    <h4 className="font-bold text-xs text-stone-900">
                      {isPlayingAudio ? 'Şu An Çalıyor: 1984 Hendek Bayram Sohbeti' : 'Sesli Hatıralar Arşivini Dinleyin'}
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      {isPlayingAudio ? 'Kaset kaydından restore edilmiş aile büyüklerimizin sesi...' : 'Büyüklerimizin sesini ve hatıralarını geleceğe taşıyoruz'}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full hidden sm:block">
                  {isPlayingAudio ? '● Yayında' : 'Hazır'}
                </span>
              </div>

              <div className="space-y-3">
                {AUDIO_ARCHIVES.map(item => (
                  <div
                    key={item.id}
                    className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-stone-200 flex items-center justify-center text-stone-700">
                        <Volume2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-stone-900">{item.title}</h4>
                        <div className="text-[11px] text-stone-500">
                          Anlatan: <strong>{item.narrator}</strong> • {item.year} ({item.duration})
                        </div>
                        <p className="text-[11px] text-stone-600 mt-1">{item.description}</p>
                      </div>
                    </div>

                    <button
                      onClick={toggleAudio}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 shadow-xs"
                    >
                      <Play className="w-3 h-3" />
                      <span>Dinle</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
