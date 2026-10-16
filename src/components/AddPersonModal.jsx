import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Search, 
  X, 
  CheckCircle, 
  ShieldCheck, 
  Send, 
  GitFork, 
  Sparkles,
  Heart,
  Baby,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AddPersonModal({ 
  isOpen, 
  onClose, 
  persons, 
  onAddRequest,
  prefillData = null,
  claimedPerson = null
}) {
  if (!isOpen) return null;

  const [form, setForm] = useState({
    firstName: '',
    lastName: 'SUNMAN',
    maidenName: '',
    gender: 'male',
    birthDate: '',
    birthPlace: '',
    nickname: '',
    burialPlace: '',
    fatherId: '',
    fatherName: '',
    motherId: '',
    motherName: '',
    spouseId: '',
    spouseName: '',
    requesterName: '',
    requesterPhone: '',
    requesterEmail: '',
    notes: ''
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [fatherSearch, setFatherSearch] = useState('');
  const [motherSearch, setMotherSearch] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Apply prefill data if opened from a leaf button
  useEffect(() => {
    if (prefillData) {
      setForm(prev => ({
        ...prev,
        gender: prefillData.gender || 'male',
        fatherId: prefillData.fatherId || '',
        fatherName: prefillData.fatherName || '',
        motherId: prefillData.motherId || '',
        motherName: prefillData.motherName || '',
        spouseId: prefillData.spouseId || '',
        spouseName: prefillData.spouseName || '',
        requesterName: claimedPerson ? `${claimedPerson.firstName} ${claimedPerson.lastName}` : (prev.requesterName || 'Aile Bireyi')
      }));
    } else if (claimedPerson && !form.requesterName) {
      setForm(prev => ({
        ...prev,
        requesterName: `${claimedPerson.firstName} ${claimedPerson.lastName}`
      }));
    }
  }, [prefillData, claimedPerson]);

  // Father search
  const fatherResults = fatherSearch.trim().length >= 2
    ? persons.filter(p => 
        p.gender === 'male' &&
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(fatherSearch.toLowerCase())
      ).slice(0, 5)
    : [];

  // Mother search
  const motherResults = motherSearch.trim().length >= 2
    ? persons.filter(p => 
        p.gender === 'female' &&
        `${p.firstName} ${p.lastName} ${p.maidenName || ''}`.toLowerCase().includes(motherSearch.toLowerCase())
      ).slice(0, 5)
    : [];

  const triggerConfettiCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.firstName.trim()) return;

    const finalRequester = form.requesterName || (claimedPerson ? `${claimedPerson.firstName} ${claimedPerson.lastName}` : 'Bir Aile Üyesi');

    if (onAddRequest) {
      onAddRequest({
        type: 'NEW_PERSON',
        personData: { 
          ...form,
          requesterName: finalRequester
        },
        createdAt: new Date().toISOString()
      });
    }

    triggerConfettiCelebration();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
      setForm({
        firstName: '',
        lastName: 'SUNMAN',
        maidenName: '',
        gender: 'male',
        birthDate: '',
        birthPlace: '',
        nickname: '',
        burialPlace: '',
        fatherId: '',
        fatherName: '',
        motherId: '',
        motherName: '',
        spouseId: '',
        spouseName: '',
        requesterName: '',
        requesterPhone: '',
        requesterEmail: '',
        notes: ''
      });
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header - Cheerful, Modern & Friendly */}
        <div className="p-4 bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl shadow-xs">
              {form.gender === 'male' ? '👦' : '👧'}
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                {prefillData?.relationLabel || 'Ağaca Yeni Kişi Ekle'}
              </h3>
              <p className="text-[11px] text-amber-100 font-medium">
                {prefillData ? 'Bağlantı otomatik seçildi, sadece adını yazın!' : 'Soyağacımıza yeni bir aile ferdi dahil edin'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-10 text-center bg-gradient-to-b from-amber-50 to-emerald-50 text-emerald-950 space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl shadow-sm animate-bounce">
              🎉
            </div>
            <h4 className="text-lg font-black text-emerald-900">Harika! Kişi Ağaca İletildi!</h4>
            <p className="text-xs text-emerald-800 max-w-sm mx-auto leading-relaxed">
              <strong>{form.firstName} {form.lastName}</strong> için ekleme talebiniz alındı ve soyağacına işlenmek üzere yönetici onayına gönderildi.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
            
            {/* Bağlantı Özeti (Eğer yapraktan tıklandıysa) */}
            {prefillData && (
              <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs text-amber-950 flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <span className="font-extrabold block text-amber-900">
                    {prefillData.relationLabel}
                  </span>
                  <span className="text-[11px] text-amber-800">
                    {form.fatherName && `Baba: ${form.fatherName} `}
                    {form.motherName && `• Anne: ${form.motherName} `}
                    {form.spouseName && `• Eş: ${form.spouseName} `}
                  </span>
                </div>
              </div>
            )}

            {/* CİNSİYET SEÇİMİ (5 yaşındaki çocuğun bile tek dokunuşla anlayabileceği büyük butonlar) */}
            <div>
              <label className="block text-xs font-black text-stone-700 mb-1.5">
                Cinsiyet Seçin:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, gender: 'male' })}
                  className={`p-3 rounded-2xl border-2 flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                    form.gender === 'male'
                      ? 'border-blue-500 bg-blue-50 text-blue-900 ring-4 ring-blue-500/20 shadow-sm scale-[1.02]'
                      : 'border-stone-200 bg-stone-50 hover:bg-white text-stone-600'
                  }`}
                >
                  <span className="text-xl">👦</span>
                  <span>Erkek</span>
                </button>

                <button
                  type="button"
                  onClick={() => setForm({ ...form, gender: 'female' })}
                  className={`p-3 rounded-2xl border-2 flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                    form.gender === 'female'
                      ? 'border-rose-500 bg-rose-50 text-rose-900 ring-4 ring-rose-500/20 shadow-sm scale-[1.02]'
                      : 'border-stone-200 bg-stone-50 hover:bg-white text-stone-600'
                  }`}
                >
                  <span className="text-xl">👧</span>
                  <span>Kız / Kadın</span>
                </button>
              </div>
            </div>

            {/* AD VE SOYAD (Büyük ve Net) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-stone-700 mb-1">
                  Adı Nedir? *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="Örn: Ali, Mehmet, Zeynep..."
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="w-full text-sm font-bold p-3 bg-stone-50 border-2 border-stone-200 rounded-2xl outline-none focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 transition-all placeholder:font-normal placeholder:text-stone-400"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-black text-stone-700 mb-1">
                  Soyadı
                </label>
                <input 
                  type="text" 
                  required
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full text-sm font-bold p-3 bg-stone-50 border-2 border-stone-200 rounded-2xl outline-none focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 transition-all"
                />
              </div>
            </div>

            {/* BABA VE ANNE BAĞLANTILARI (Önceden seçildiyse yeşil rozet, seçilmediyse arama) */}
            <div className="space-y-3 pt-1">
              {/* Baba Alanı */}
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  Babası Kim?
                </label>
                {form.fatherName ? (
                  <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">👨</span>
                      <span className="font-extrabold text-blue-950">Baba: {form.fatherName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, fatherId: '', fatherName: '' })}
                      className="text-stone-400 hover:text-stone-700 text-xs font-semibold px-2 py-0.5 rounded-md hover:bg-white"
                    >
                      Değiştir
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Babasının adını arayın..."
                      value={fatherSearch}
                      onChange={(e) => setFatherSearch(e.target.value)}
                      className="w-full text-xs p-2.5 pl-8 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-amber-500"
                    />
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-3" />

                    {fatherResults.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-stone-200 rounded-xl shadow-lg divide-y divide-stone-100 overflow-hidden z-20">
                        {fatherResults.map(p => (
                          <div
                            key={p.id}
                            onClick={() => {
                              setForm({ ...form, fatherId: p.id, fatherName: `${p.firstName} ${p.lastName}` });
                              setFatherSearch('');
                            }}
                            className="p-2 hover:bg-amber-50 text-xs font-semibold cursor-pointer flex items-center justify-between"
                          >
                            <span>{p.firstName} {p.lastName}</span>
                            <span className="text-[10px] text-amber-700 font-bold">+ Seç</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Anne Alanı */}
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  Annesi Kim?
                </label>
                {form.motherName ? (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">👩</span>
                      <span className="font-extrabold text-rose-950">Anne: {form.motherName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, motherId: '', motherName: '' })}
                      className="text-stone-400 hover:text-stone-700 text-xs font-semibold px-2 py-0.5 rounded-md hover:bg-white"
                    >
                      Değiştir
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Annesinin adını arayın..."
                      value={motherSearch}
                      onChange={(e) => setMotherSearch(e.target.value)}
                      className="w-full text-xs p-2.5 pl-8 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-amber-500"
                    />
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-3" />

                    {motherResults.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-stone-200 rounded-xl shadow-lg divide-y divide-stone-100 overflow-hidden z-20">
                        {motherResults.map(p => (
                          <div
                            key={p.id}
                            onClick={() => {
                              setForm({ ...form, motherId: p.id, motherName: `${p.firstName} ${p.lastName}` });
                              setMotherSearch('');
                            }}
                            className="p-2 hover:bg-rose-50 text-xs font-semibold cursor-pointer flex items-center justify-between"
                          >
                            <span>{p.firstName} {p.lastName}</span>
                            <span className="text-[10px] text-rose-700 font-bold">+ Seç</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Eş Alanı (Eğer eş ekleniyorsa) */}
              {form.spouseName && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">💍</span>
                    <span className="font-extrabold text-amber-950">Eşi: {form.spouseName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, spouseId: '', spouseName: '' })}
                    className="text-stone-400 hover:text-stone-700 text-xs font-semibold px-2 py-0.5 rounded-md hover:bg-white"
                  >
                    Kaldır
                  </button>
                </div>
              )}
            </div>

            {/* İsteğe Bağlı Detaylar (Akordeon) */}
            <div className="pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full py-2 flex items-center justify-between text-xs font-bold text-stone-500 hover:text-stone-800 transition-colors"
              >
                <span>➕ Daha Fazla Bilgi Ekle (Doğum yılı, lakap, doğum yeri)</span>
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAdvanced && (
                <div className="space-y-3 pt-2 animate-in fade-in duration-150">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 mb-1">Doğum Yılı / Tarihi</label>
                      <input 
                        type="text" 
                        placeholder="Örn: 1995"
                        value={form.birthDate}
                        onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                        className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 mb-1">Bilinen Lakap</label>
                      <input 
                        type="text" 
                        placeholder="Örn: Hacı, Demirci..."
                        value={form.nickname}
                        onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                        className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 mb-1">Doğum Yeri</label>
                      <input 
                        type="text" 
                        placeholder="Örn: Hendek"
                        value={form.birthPlace}
                        onChange={(e) => setForm({ ...form, birthPlace: e.target.value })}
                        className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 mb-1">Kabir / Defin Yeri (Vefat ise)</label>
                      <input 
                        type="text" 
                        placeholder="Örn: Hendek Mezarlığı"
                        value={form.burialPlace}
                        onChange={(e) => setForm({ ...form, burialPlace: e.target.value })}
                        className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">Açıklama / Not</label>
                    <textarea 
                      rows="2"
                      placeholder="Eklemek istediğiniz özel bir not veya hatıra..."
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-amber-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Büyük Neşeli Gönder Butonu */}
            <button 
              type="submit"
              disabled={!form.firstName.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 disabled:opacity-40 text-white rounded-2xl text-sm font-extrabold shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Sparkles className="w-4 h-4" />
              <span>Aile Ağacına Ekle!</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
