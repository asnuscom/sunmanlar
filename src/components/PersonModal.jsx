import React, { useState } from 'react';
import { 
  X, 
  User, 
  Calendar, 
  MapPin, 
  Briefcase, 
  Instagram, 
  Facebook, 
  Linkedin, 
  Heart, 
  Users, 
  Camera, 
  GitFork, 
  CheckCircle, 
  Clock, 
  Send,
  Edit3,
  ShieldCheck,
  Compass,
  ExternalLink,
  ChevronRight,
  Plus,
  FileText
} from 'lucide-react';
import { findKinshipPath } from '../utils/relationshipCalculator';
import { getPersonBranch, getPersonGeneration } from '../utils/branchHelper';

export default function PersonModal({ 
  person, 
  onClose, 
  personsMap, 
  onSelectPerson, 
  claimedPerson,
  photos = [],
  onOpenPhoto,
  onRequestEdit,
  onOpenPhotoUpload,
  onOpenPoster
}) {
  if (!person) return null;

  const [activeTab, setActiveTab] = useState('details'); // details, kinship, photos, edit
  const [editForm, setEditForm] = useState({
    instagram: person.instagram || '',
    facebook: person.facebook || '',
    linkedin: person.linkedin || '',
    profession: person.profession || '',
    birthPlace: person.birthPlace || '',
    burialPlace: person.burialPlace || '',
    nickname: person.nickname || person.lakap || '',
    bio: person.bio || '',
    notes: ''
  });
  const [editSubmitted, setEditSubmitted] = useState(false);

  // Relationships
  const father = person.fatherId ? personsMap[person.fatherId] : null;
  const mother = person.motherId ? personsMap[person.motherId] : null;
  const spouses = (person.spouseIds || []).map(id => personsMap[id]).filter(Boolean);
  const children = (person.childrenIds || []).map(id => personsMap[id]).filter(Boolean);

  // Siblings
  const siblings = [];
  if (father || mother) {
    const parentChildren = new Set([
      ...(father ? father.childrenIds : []),
      ...(mother ? mother.childrenIds : [])
    ]);
    parentChildren.forEach(id => {
      if (id !== person.id && personsMap[id]) {
        siblings.push(personsMap[id]);
      }
    });
  }

  // Tagged photos
  const taggedPhotos = photos.filter(ph => ph.taggedPersons && ph.taggedPersons.includes(person.id));

  // Branch & Generation
  const branch = getPersonBranch(person, personsMap);
  const generation = getPersonGeneration(person, personsMap);

  // Full Kinship Path with claimed user
  const kinshipInfo = claimedPerson
    ? findKinshipPath(claimedPerson.id, person.id, personsMap)
    : null;

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (onRequestEdit) {
      onRequestEdit(person, editForm);
    }
    setEditSubmitted(true);
    setTimeout(() => {
      setEditSubmitted(false);
      setActiveTab('details');
    }, 2000);
  };

  const isAlive = !person.deathDate;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom duration-200"
      >
        
        {/* Header / Hero */}
        <div className="relative bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 p-6 text-white">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-2xl sm:text-3xl font-extrabold shadow-lg overflow-hidden shrink-0">
              {person.avatar ? (
                <img src={person.avatar} alt={person.firstName} className="w-full h-full object-cover" />
              ) : (
                <span>{person.firstName[0]}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black truncate">
                  {person.firstName} {person.lastName}
                </h2>
                {person.verified && (
                  <span title="Doğrulanmış Profil">
                    <ShieldCheck className="w-5 h-5 text-amber-300 inline shrink-0" />
                  </span>
                )}
              </div>

              {/* Nickname / Lakap */}
              {(person.nickname || person.lakap) && (
                <div className="text-xs text-amber-200 font-bold italic">
                  Lakap: "{person.nickname || person.lakap}"
                </div>
              )}

              {person.maidenName && (
                <div className="text-xs text-amber-200 font-medium">
                  Doğum / Kızlık Soyadı: <span className="font-semibold text-white">{person.maidenName}</span>
                </div>
              )}

              <div className="flex items-center gap-2 mt-1.5 text-xs text-amber-100 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                  isAlive ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/30' : 'bg-black/20 text-stone-300'
                }`}>
                  {isAlive ? 'Hayatta' : 'Merhum / Rahmetli'}
                </span>
                {branch && (
                  <span className="px-2 py-0.5 rounded-full font-semibold text-[11px] bg-white/20 text-white">
                    {branch.name}
                  </span>
                )}
                <span className="text-[11px] text-amber-200 font-medium">
                  {generation}. Kuşak
                </span>
                {person.birthDate && <span>• D: {person.birthDate}</span>}
                {person.deathDate && <span>• Ö: {person.deathDate}</span>}
              </div>
            </div>
          </div>

          {/* Social Media Links Header */}
          <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-white/10 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-amber-200 font-medium">Sosyal Medya:</span>
              {person.instagram && (
                <a 
                  href={person.instagram.startsWith('http') ? person.instagram : `https://instagram.com/${person.instagram}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                  title="Instagram Profili"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {person.facebook && (
                <a 
                  href={person.facebook.startsWith('http') ? person.facebook : `https://facebook.com/${person.facebook}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                  title="Facebook Profili"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {person.linkedin && (
                <a 
                  href={person.linkedin.startsWith('http') ? person.linkedin : `https://linkedin.com/in/${person.linkedin}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                  title="LinkedIn Profili"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {!person.instagram && !person.facebook && !person.linkedin && (
                <span className="text-[11px] text-amber-300/80 italic">Henüz eklenmedi</span>
              )}
            </div>

            {/* Ağaçta Odakla & Poster Butonları */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => {
                  onSelectPerson(person);
                  onClose();
                }}
                className="px-3 py-1 bg-white text-stone-900 hover:bg-amber-100 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <GitFork className="w-3.5 h-3.5 text-amber-700" />
                <span>Ağaçta Odakla</span>
              </button>

              {onOpenPoster && (
                <button
                  onClick={() => {
                    onOpenPoster(person);
                    onClose();
                  }}
                  className="px-2.5 py-1 bg-amber-500/30 hover:bg-amber-500/50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border border-white/20 transition-colors"
                  title="Bu kişinin soyağacı posterini ve PDF şeceresini hazırla"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-200" />
                  <span>Posteri İndir</span>
                </button>
              )}
            </div>
          </div>

          {/* Akrabalık bağı etiketi (Claimed kişi varsa) */}
          {kinshipInfo && (
            <div 
              onClick={() => setActiveTab('kinship')}
              className="mt-3 bg-black/25 hover:bg-black/35 cursor-pointer px-3 py-2 rounded-xl text-xs text-amber-100 flex items-center justify-between border border-white/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-300 shrink-0" />
                <span>
                  <strong className="text-white">{claimedPerson.firstName}</strong> ile bağı: <strong className="text-amber-200">{kinshipInfo.text}</strong>
                </span>
              </div>
              <span className="text-[10px] text-amber-300 font-bold underline flex items-center gap-0.5">
                Yolu Gör <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          )}
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'details'
                ? 'border-amber-600 text-amber-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Aile & Bilgiler
          </button>

          {claimedPerson && (
            <button
              onClick={() => setActiveTab('kinship')}
              className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1 ${
                activeTab === 'kinship'
                  ? 'border-amber-600 text-amber-800'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-amber-600" />
              <span>Akrabalık Yolu</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('photos')}
            className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'photos'
                ? 'border-amber-600 text-amber-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Fotoğrafları ({taggedPhotos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('edit')}
            className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'edit'
                ? 'border-amber-600 text-amber-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Bilgi Güncelle</span>
          </button>
        </div>

        {/* Tab 1: Aile & Bilgiler */}
        {activeTab === 'details' && (
          <div className="p-6 overflow-y-auto space-y-5">
            
            {/* Temel Bilgiler & Kabir Haritası */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {person.birthPlace && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <span className="text-stone-400 block text-[10px]">Doğum Yeri</span>
                    <span className="font-semibold text-stone-800">{person.birthPlace}</span>
                  </div>
                </div>
              )}
              {person.burialPlace && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-stone-600 shrink-0" />
                    <div>
                      <span className="text-stone-400 block text-[10px]">Kabir / Defin Yeri</span>
                      <span className="font-semibold text-stone-800">{person.burialPlace}</span>
                    </div>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(person.burialPlace)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-white border border-stone-200 hover:bg-amber-50 text-amber-700 rounded-lg flex items-center gap-1 text-[11px] font-semibold transition-colors"
                    title="Google Haritalar'da Konum Aç"
                  >
                    <span>Harita</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              {person.profession && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-center gap-2.5">
                  <Briefcase className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <span className="text-stone-400 block text-[10px]">Meslek / Uzmanlık</span>
                    <span className="font-semibold text-stone-800">{person.profession}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Biyografi */}
            {person.bio && (
              <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/80">
                <h4 className="text-xs font-bold text-amber-900 mb-1">Hayat Hikayesi & Hatırat</h4>
                <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-line">{person.bio}</p>
              </div>
            )}

            {/* Aile Bağları Listesi */}
            <div className="space-y-4 pt-2">
              
              {/* Ebeveynler */}
              <div>
                <h4 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                  Anne ve Baba
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {father ? (
                    <div 
                      onClick={() => onSelectPerson(father)}
                      className="p-2.5 rounded-xl border border-stone-200 hover:border-amber-300 hover:bg-amber-50/50 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-600 font-bold">Baba:</span>
                        <span className="text-xs font-semibold text-stone-900">{father.firstName} {father.lastName}</span>
                      </div>
                      <GitFork className="w-3.5 h-3.5 text-stone-400" />
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl border border-dashed border-stone-200 text-stone-400 text-xs italic">
                      Baba kaydı yok
                    </div>
                  )}

                  {mother ? (
                    <div 
                      onClick={() => onSelectPerson(mother)}
                      className="p-2.5 rounded-xl border border-stone-200 hover:border-amber-300 hover:bg-amber-50/50 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-rose-600 font-bold">Anne:</span>
                        <span className="text-xs font-semibold text-stone-900">{mother.firstName} {mother.lastName}</span>
                      </div>
                      <GitFork className="w-3.5 h-3.5 text-stone-400" />
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl border border-dashed border-stone-200 text-stone-400 text-xs italic">
                      Anne kaydı yok
                    </div>
                  )}
                </div>
              </div>

              {/* Eşler */}
              {spouses.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                    Eşi / Eşleri ({spouses.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {spouses.map(s => (
                      <div 
                        key={s.id}
                        onClick={() => onSelectPerson(s)}
                        className="p-2.5 rounded-xl border border-stone-200 hover:border-amber-300 hover:bg-amber-50/50 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
                          <span className="text-xs font-semibold text-stone-900">{s.firstName} {s.lastName}</span>
                        </div>
                        <GitFork className="w-3.5 h-3.5 text-stone-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Çocuklar */}
              {children.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                    Çocukları ({children.length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {children.map(c => (
                      <div 
                        key={c.id}
                        onClick={() => onSelectPerson(c)}
                        className="p-2.5 rounded-xl border border-stone-200 hover:border-amber-300 hover:bg-amber-50/50 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <span className="text-xs font-semibold text-stone-800 truncate">
                          {c.firstName}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {c.gender === 'male' ? 'Oğul' : 'Kız'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Kardeşler */}
              {siblings.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                    Kardeşleri ({siblings.length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {siblings.map(sib => (
                      <div 
                        key={sib.id}
                        onClick={() => onSelectPerson(sib)}
                        className="p-2 rounded-xl bg-stone-50 hover:bg-amber-50 border border-stone-200/80 cursor-pointer text-xs text-stone-700 truncate transition-colors"
                      >
                        {sib.firstName} {sib.lastName}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

        {/* Tab 2: Akrabalık Yolu (Kinship Path) */}
        {activeTab === 'kinship' && kinshipInfo && (
          <div className="p-6 overflow-y-auto space-y-4">
            <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-orange-500/10 rounded-2xl p-5 border border-amber-300/80 text-center space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full inline-block">
                {kinshipInfo.degree}
              </span>
              <h3 className="text-lg font-black text-stone-900">
                {kinshipInfo.text}
              </h3>
              <p className="text-xs text-stone-600">
                {kinshipInfo.subDescription}
              </p>
            </div>

            {kinshipInfo.path && kinshipInfo.path.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-stone-800 block">
                  Akrabalık Soy Yolu Adım Adım:
                </span>
                
                <div className="flex items-center gap-1.5 flex-wrap">
                  <div className="px-3 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs">
                    {claimedPerson.firstName} (Siz)
                  </div>
                  
                  {kinshipInfo.path.map((step, idx) => {
                    const stepPerson = personsMap[step.id];
                    return (
                      <React.Fragment key={idx}>
                        <div className="flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-lg">
                          <span>{step.text}</span>
                          <ChevronRight className="w-3 h-3 text-amber-700" />
                        </div>
                        <div 
                          onClick={() => stepPerson && onSelectPerson(stepPerson)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                            idx === kinshipInfo.path.length - 1
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-stone-100 text-stone-900 hover:bg-stone-200'
                          }`}
                        >
                          {stepPerson ? `${stepPerson.firstName} ${stepPerson.lastName}` : 'Akraba'}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Etiketlendiği Fotoğraflar */}
        {activeTab === 'photos' && (
          <div className="p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-stone-800">
                Bu Kişinin Yer Aldığı Fotoğraflar ({taggedPhotos.length})
              </h4>
              <button
                onClick={() => {
                  onClose();
                  if (onOpenPhotoUpload) onOpenPhotoUpload(person.id);
                }}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Fotoğraf Yükle & Etiketle</span>
              </button>
            </div>

            {taggedPhotos.length === 0 ? (
              <div className="text-center py-10">
                <Camera className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-stone-700">Henüz Etiketli Fotoğraf Yok</h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
                  Fotoğraf Köşesi'nden veya yukarıdaki butondan bu kişinin yer aldığı aile fotoğraflarını yükleyebilirsiniz.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {taggedPhotos.map(ph => (
                  <div 
                    key={ph.id}
                    onClick={() => {
                      if (onOpenPhoto) onOpenPhoto(ph);
                    }}
                    className="group relative rounded-2xl overflow-hidden aspect-square border border-stone-200 cursor-pointer shadow-xs hover:shadow-md transition-shadow"
                  >
                    <img 
                      src={ph.url} 
                      alt={ph.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end text-white">
                      <div className="text-xs font-bold leading-tight">{ph.title}</div>
                      <div className="text-[10px] text-stone-300">{ph.year || ph.location}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Bilgi Düzenle (Admin Onayına Gönder) */}
        {activeTab === 'edit' && (
          <div className="p-6 overflow-y-auto">
            {editSubmitted ? (
              <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <h4 className="text-base font-bold">Talebiniz Alındı!</h4>
                <p className="text-xs text-emerald-700 mt-1 max-w-md mx-auto">
                  Girdiğiniz bilgiler ve sosyal medya adresleri yönetici onayına iletildi. Onaylandıktan sonra bu profilde görünecektir.
                </p>
              </div>
            ) : (
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    Bu bilgileri siz düzenleyebilirsiniz; doğruluğu korumak adına tüm güncellemeler <strong>admin onayından sonra</strong> canlıya geçer.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Bilinen Lakap (Varsa)</label>
                    <input 
                      type="text" 
                      placeholder="Örn: Laz Osman, Hacı Ali, Demirci"
                      value={editForm.nickname}
                      onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Meslek / Uzmanlık</label>
                    <input 
                      type="text" 
                      placeholder="Örn: Öğretmen, Marangoz, Mühendis"
                      value={editForm.profession}
                      onChange={(e) => setEditForm({ ...editForm, profession: e.target.value })}
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Instagram Kullanıcı Adı</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="@kullaniciadi"
                        value={editForm.instagram}
                        onChange={(e) => setEditForm({ ...editForm, instagram: e.target.value })}
                        className="w-full text-xs p-2.5 pl-8 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-amber-500"
                      />
                      <Instagram className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Facebook Profil Linki</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="facebook.com/..."
                        value={editForm.facebook}
                        onChange={(e) => setEditForm({ ...editForm, facebook: e.target.value })}
                        className="w-full text-xs p-2.5 pl-8 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-amber-500"
                      />
                      <Facebook className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Doğum Yeri</label>
                    <input 
                      type="text" 
                      placeholder="Örn: Hendek / Sakarya"
                      value={editForm.birthPlace}
                      onChange={(e) => setEditForm({ ...editForm, birthPlace: e.target.value })}
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Kabir / Defin Yeri (Vefat ise)</label>
                    <input 
                      type="text" 
                      placeholder="Örn: Hendek Merkez Mezarlığı"
                      value={editForm.burialPlace}
                      onChange={(e) => setEditForm({ ...editForm, burialPlace: e.target.value })}
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Kısa Biyografi / Hatıra Notu</label>
                  <textarea 
                    rows="3"
                    placeholder="Bu kişi hakkında bilinmesi gereken önemli anılar, yaşam öyküsü veya sözleri..."
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Yöneticiye İletilecek Not (Kimliğiniz vb.)</label>
                  <input 
                    type="text" 
                    placeholder="Örn: 'Ben torunuyum, Instagram adresini ve lakabını ekledim.'"
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-amber-500"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Onaya Gönder</span>
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
