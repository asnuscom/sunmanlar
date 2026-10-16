import React, { useState } from 'react';
import { UserCheck, Search, X, CheckCircle, ShieldCheck, Send } from 'lucide-react';

export default function ClaimProfileModal({ 
  isOpen, 
  onClose, 
  persons, 
  onClaimRequest,
  currentClaimedPerson,
  onUnclaim
}) {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [requesterName, setRequesterName] = useState('');
  const [requesterEmail, setRequesterEmail] = useState('');
  const [requesterPhone, setRequesterPhone] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const searchResults = searchQuery.trim().length >= 2
    ? persons.filter(p => 
        `${p.firstName} ${p.lastName} ${p.maidenName || ''}`.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedPerson || !requesterName) return;

    if (onClaimRequest) {
      onClaimRequest({
        type: 'CLAIM_PROFILE',
        personId: selectedPerson.id,
        personName: `${selectedPerson.firstName} ${selectedPerson.lastName}`,
        requesterName,
        requesterEmail,
        requesterPhone,
        note,
        createdAt: new Date().toISOString()
      });
    }

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
      setSelectedPerson(null);
      setSearchQuery('');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900">Ağaçta Ben Kimim?</h3>
              <p className="text-[11px] text-stone-500">Profilinizi eşleştirin ve akrabalık bağlarınızı görün</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {currentClaimedPerson && (
          <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="text-xs font-bold text-emerald-950 block">Şu An Eşleşmiş Profil:</span>
                <span className="text-xs text-emerald-800 font-semibold">{currentClaimedPerson.firstName} {currentClaimedPerson.lastName}</span>
              </div>
            </div>
            <button
              onClick={onUnclaim}
              className="text-[11px] font-bold text-rose-600 hover:text-rose-800 bg-rose-100/50 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition-colors"
            >
              Bağı Kaldır
            </button>
          </div>
        )}

        {isSubmitted ? (
          <div className="p-8 text-center bg-emerald-50 text-emerald-900">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h4 className="text-base font-bold">Talebiniz Alındı!</h4>
            <p className="text-xs text-emerald-700 mt-1">
              Profil sahiplenme talebiniz yöneticimize iletildi. Onaylandığında profiliniz doğrulanmış olarak işaretlenecektir.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
            
            <p className="text-xs text-stone-600 leading-relaxed">
              Soyağacında kayıtlı olan kendi isminizi bulun. Eşleştikten sonra akrabalık hesaplayıcı otomatik çalışacak ve profil bilgilerinizi düzenleyebileceksiniz.
            </p>

            {/* Kişi Arama */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Ağaçtaki İsminizi Arayın *
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="İsminizi yazın (örn: Mehmet Sunman)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs p-2.5 pl-8 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-amber-500"
                />
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-3" />
              </div>

              {/* Arama Sonuçları */}
              {searchResults.length > 0 && !selectedPerson && (
                <div className="mt-1 bg-white border border-stone-200 rounded-xl shadow-lg divide-y divide-stone-100 overflow-hidden">
                  {searchResults.map(p => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedPerson(p);
                        setSearchQuery(`${p.firstName} ${p.lastName}`);
                      }}
                      className="p-2.5 hover:bg-amber-50 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <span className="text-xs font-bold text-stone-800">{p.firstName} {p.lastName}</span>
                      <span className="text-[10px] text-amber-700 font-bold bg-amber-100/60 px-2 py-0.5 rounded-full">
                        Bu Benim
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {selectedPerson && (
                <div className="mt-2 p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950">
                    Seçilen: {selectedPerson.firstName} {selectedPerson.lastName}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPerson(null);
                      setSearchQuery('');
                    }}
                    className="text-xs text-stone-500 hover:text-stone-800 font-semibold"
                  >
                    Değiştir
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Gerçek Adınız & Soyadınız *</label>
              <input 
                type="text" 
                required
                placeholder="Örn: Mehmet Sunman"
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Telefon / WhatsApp</label>
                <input 
                  type="text" 
                  placeholder="0532 ..."
                  value={requesterPhone}
                  onChange={(e) => setRequesterPhone(e.target.value)}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">E-posta</label>
                <input 
                  type="email" 
                  placeholder="ornek@gmail.com"
                  value={requesterEmail}
                  onChange={(e) => setRequesterEmail(e.target.value)}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Doğrulama Notu (Admin için)</label>
              <textarea 
                rows="2"
                placeholder="Örn: 'Ben Sakarya kolundan Ahmet'in oğluyum.'"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-amber-500"
              />
            </div>

            <button 
              type="submit"
              disabled={!selectedPerson || !requesterName}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Sahiplenme Talebini İlet</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
