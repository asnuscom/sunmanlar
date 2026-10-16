import React, { useState, useEffect, useMemo } from 'react';
import { 
  Camera, 
  Plus, 
  MapPin, 
  Calendar, 
  Users, 
  X, 
  Tag, 
  Search, 
  Check, 
  Send,
  GitFork,
  CheckCircle,
  ShieldCheck,
  Filter
} from 'lucide-react';
import { uploadImageFile } from '../../services/firebase';

export default function PhotoGallery({ 
  photos, 
  personsMap, 
  persons, 
  onSelectPerson, 
  onRequestUploadPhoto,
  initialUploadOpen = false,
  pretaggedPersonId = null,
  onCloseUpload
}) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(initialUploadOpen);
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    year: '',
    location: '',
    url: '',
    taggedPersons: pretaggedPersonId ? [pretaggedPersonId] : []
  });
  const [fileObject, setFileObject] = useState(null);
  const [tagSearch, setTagSearch] = useState('');
  const [uploadSubmitted, setUploadSubmitted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (initialUploadOpen) {
      setIsUploadOpen(true);
      if (pretaggedPersonId) {
        setUploadForm(prev => ({
          ...prev,
          taggedPersons: prev.taggedPersons.includes(pretaggedPersonId)
            ? prev.taggedPersons
            : [...prev.taggedPersons, pretaggedPersonId]
        }));
      }
    }
  }, [initialUploadOpen, pretaggedPersonId]);

  // Extract distinct years for filter
  const distinctYears = useMemo(() => {
    const years = new Set();
    photos.forEach(ph => {
      if (ph.year) years.add(ph.year);
    });
    return Array.from(years).sort();
  }, [photos]);

  // Filtered photos
  const filteredPhotos = useMemo(() => {
    return photos.filter(ph => {
      const matchesSearch = !searchTerm || 
        `${ph.title} ${ph.description || ''} ${ph.location || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesYear = yearFilter === 'ALL' || ph.year === yearFilter;
      return matchesSearch && matchesYear;
    });
  }, [photos, searchTerm, yearFilter]);

  // Filter persons for tag search
  const tagSearchResults = tagSearch.trim().length >= 2
    ? persons.filter(p => 
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(tagSearch.toLowerCase()) &&
        !uploadForm.taggedPersons.includes(p.id)
      ).slice(0, 6)
    : [];

  const handleAddTag = (personId) => {
    if (!uploadForm.taggedPersons.includes(personId)) {
      setUploadForm(prev => ({
        ...prev,
        taggedPersons: [...prev.taggedPersons, personId]
      }));
    }
    setTagSearch('');
  };

  const handleRemoveTag = (personId) => {
    setUploadForm(prev => ({
      ...prev,
      taggedPersons: prev.taggedPersons.filter(id => id !== personId)
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileObject(file);
      const localUrl = URL.createObjectURL(file);
      setUploadForm(prev => ({ ...prev, url: localUrl }));
    }
  };

  const handleSubmitPhoto = async (e) => {
    e.preventDefault();
    if (!uploadForm.title) return;

    setIsUploading(true);
    let finalUrl = uploadForm.url;

    if (fileObject) {
      finalUrl = await uploadImageFile(fileObject, 'family_photos');
    }

    const newPhotoData = {
      ...uploadForm,
      url: finalUrl,
      id: `photo_${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
      uploadedBy: 'Aile Üyesi'
    };

    if (onRequestUploadPhoto) {
      onRequestUploadPhoto(newPhotoData);
    }

    setIsUploading(false);
    setUploadSubmitted(true);
    setTimeout(() => {
      setUploadSubmitted(false);
      setIsUploadOpen(false);
      if (onCloseUpload) onCloseUpload();
      setUploadForm({
        title: '',
        description: '',
        year: '',
        location: '',
        url: '',
        taggedPersons: []
      });
      setFileObject(null);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Gallery Header */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-600" />
            Aile Fotoğraf Albümü
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Tarihi kareler, bayram buluşmaları ve akraba fotoğrafları ({photos.length} Fotoğraf)
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="w-full sm:w-auto px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Fotoğraf Yükle & Etiketle</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Fotoğraf veya konum ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-amber-500"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs font-semibold text-stone-500">Yıl Filtresi:</span>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 font-semibold text-stone-800 outline-none"
          >
            <option value="ALL">Tüm Yıllar</option>
            {distinctYears.map(yr => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>
          <span className="text-xs font-bold text-stone-600 pl-2">
            {filteredPhotos.length} Fotoğraf
          </span>
        </div>
      </div>

      {/* Photos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {filteredPhotos.map(photo => {
          const taggedList = (photo.taggedPersons || []).map(id => personsMap[id]).filter(Boolean);

          return (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="group bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col"
            >
              {/* Photo Image */}
              <div className="relative aspect-4/3 bg-stone-100 overflow-hidden">
                <img 
                  src={photo.url} 
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {(photo.year || photo.location) && (
                  <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    {photo.year && <span>{photo.year}</span>}
                    {photo.year && photo.location && <span>•</span>}
                    {photo.location && <span>{photo.location}</span>}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-1">
                    {photo.title}
                  </h3>
                  {photo.description && (
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                      {photo.description}
                    </p>
                  )}
                </div>

                {/* Tagged Persons Preview */}
                {taggedList.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-1.5 flex-wrap">
                    <Tag className="w-3 h-3 text-stone-400 shrink-0" />
                    {taggedList.slice(0, 3).map(p => (
                      <span 
                        key={p.id}
                        className="text-[10px] font-semibold bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md"
                      >
                        {p.firstName}
                      </span>
                    ))}
                    {taggedList.length > 3 && (
                      <span className="text-[10px] text-stone-400 font-semibold">
                        +{taggedList.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredPhotos.length === 0 && (
        <div className="text-center py-16 text-stone-400 text-xs italic">
          Arama kriterine uygun fotoğraf bulunamadı.
        </div>
      )}

      {/* Photo Viewer Modal with Tag Navigation */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-stone-900">{selectedPhoto.title}</h3>
                <div className="text-[11px] text-stone-500 flex items-center gap-2">
                  {selectedPhoto.year && <span>Yıl: {selectedPhoto.year}</span>}
                  {selectedPhoto.location && <span>Konum: {selectedPhoto.location}</span>}
                </div>
              </div>
              <button 
                onClick={() => setSelectedPhoto(null)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto">
              <div className="bg-black/95 flex items-center justify-center max-h-[55vh] overflow-hidden">
                <img 
                  src={selectedPhoto.url} 
                  alt={selectedPhoto.title} 
                  className="max-h-[55vh] w-auto object-contain mx-auto"
                />
              </div>

              <div className="p-5 space-y-4">
                {selectedPhoto.description && (
                  <p className="text-xs text-stone-700 leading-relaxed">
                    {selectedPhoto.description}
                  </p>
                )}

                {/* Etiketli Kişiler Bölümü */}
                <div>
                  <h4 className="text-xs font-bold text-stone-900 mb-2 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-amber-600" />
                    Bu Fotoğrafta Etiketlenen Aile Fertleri (Tıklayınca Ağaçta Görünür):
                  </h4>

                  {selectedPhoto.taggedPersons && selectedPhoto.taggedPersons.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedPhoto.taggedPersons.map(id => {
                        const person = personsMap[id];
                        if (!person) return null;
                        return (
                          <button
                            key={id}
                            onClick={() => {
                              setSelectedPhoto(null);
                              onSelectPerson(person);
                            }}
                            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors group"
                          >
                            <span>{person.firstName} {person.lastName}</span>
                            <GitFork className="w-3 h-3 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-stone-400 italic">Bu fotoğrafta henüz etiketli kişi yok.</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Upload & Tag Photo Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="p-4 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-600" />
                Fotoğraf Yükle & Kişileri Etiketle
              </h3>
              <button 
                onClick={() => {
                  setIsUploadOpen(false);
                  if (onCloseUpload) onCloseUpload();
                }}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadSubmitted ? (
              <div className="p-8 text-center bg-emerald-50 text-emerald-900">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <h4 className="text-base font-bold">Fotoğraf Onaya İletildi!</h4>
                <p className="text-xs text-emerald-700 mt-1">
                  Yüklediğiniz fotoğraf ve etiketler yönetici onayından sonra albümde ve ilgili akrabaların profillerinde yer alacaktır.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitPhoto} className="p-5 overflow-y-auto space-y-4">
                
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    Aile albümünün düzenini korumak için yüklenen fotoğraflar <strong>admin onayından sonra</strong> yayınlanır.
                  </span>
                </div>

                {/* Dosya Seç */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Fotoğraf Seçin</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-xs text-stone-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 cursor-pointer"
                  />
                  {uploadForm.url && (
                    <div className="mt-2 w-28 h-20 rounded-xl overflow-hidden border border-stone-200">
                      <img src={uploadForm.url} alt="Önizleme" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Fotoğraf Başlığı *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Örn: 1982 Hendek Köy Konağı Bayramlaşması"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Çekildiği Yıl</label>
                    <input 
                      type="text" 
                      placeholder="Örn: 1978"
                      value={uploadForm.year}
                      onChange={(e) => setUploadForm({ ...uploadForm, year: e.target.value })}
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Çekildiği Konum</label>
                    <input 
                      type="text" 
                      placeholder="Örn: Hendek / Sakarya"
                      value={uploadForm.location}
                      onChange={(e) => setUploadForm({ ...uploadForm, location: e.target.value })}
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Açıklama / Hikayesi</label>
                  <textarea 
                    rows="2"
                    placeholder="Fotoğraftaki anı, kimlerin bir araya geldiği vb."
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-amber-500"
                  />
                </div>

                {/* Kişi Etiketleme Alanı */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Fotoğraftaki Kişileri Etiketle (1.415 Kişiden Seç)
                  </label>
                  
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="İsim arayarak etiketleyin (örn: Mehmet, Ali)..."
                      value={tagSearch}
                      onChange={(e) => setTagSearch(e.target.value)}
                      className="w-full text-xs p-2.5 pl-8 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-amber-500"
                    />
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-3" />
                  </div>

                  {/* Search Results */}
                  {tagSearchResults.length > 0 && (
                    <div className="mt-1 bg-white border border-stone-200 rounded-xl shadow-md overflow-hidden divide-y divide-stone-100 z-10">
                      {tagSearchResults.map(p => (
                        <div
                          key={p.id}
                          onClick={() => handleAddTag(p.id)}
                          className="p-2 hover:bg-amber-50 text-xs font-semibold text-stone-800 cursor-pointer flex items-center justify-between"
                        >
                          <span>{p.firstName} {p.lastName}</span>
                          <span className="text-[10px] text-amber-700 font-bold">+ Etiketle</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tagged Pills */}
                  {uploadForm.taggedPersons.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {uploadForm.taggedPersons.map(id => {
                        const person = personsMap[id];
                        if (!person) return null;
                        return (
                          <span 
                            key={id}
                            className="text-xs bg-amber-100 text-amber-900 px-2.5 py-1 rounded-xl flex items-center gap-1 font-semibold"
                          >
                            <span>{person.firstName} {person.lastName}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(id)}
                              className="text-amber-700 hover:text-amber-950"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                <button 
                  type="submit"
                  disabled={isUploading || !uploadForm.title}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'Yükleniyor...' : 'Onaya Gönder'}</span>
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
