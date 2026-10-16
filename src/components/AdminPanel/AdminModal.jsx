import React, { useState } from 'react';
import { 
  Shield, 
  X, 
  Check, 
  Trash2, 
  UserPlus, 
  Edit3, 
  Camera, 
  MessageSquare, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Cloud,
  Download,
  Upload,
  Save
} from 'lucide-react';

export default function AdminModal({ 
  isOpen, 
  onClose, 
  pendingRequests, 
  onApproveRequest, 
  onRejectRequest,
  totalPersonsCount,
  allPersons = [],
  syncStatus = 'connected',
  cloudSystemInfo = null,
  onForceRefresh,
  onRunMigration,
  migrationProgress = null
}) {
  if (!isOpen) return null;

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('new_persons'); // new_persons, claims, photos, posts, cloud, backup

  // Simple demo password protection (can be replaced with Firebase Auth email/password)
  const handleLogin = (e) => {
    e.preventDefault();
    if (adminPassword === 'sunmanlar123' || adminPassword === 'admin') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Hatalı yönetici şifresi! (Demo için: sunmanlar123)');
    }
  };

  const handleDownloadBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allPersons, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `sunmanlar-family-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const newPersonsList = pendingRequests.filter(r => r.type === 'NEW_PERSON');
  const claimRequests = pendingRequests.filter(r => r.type === 'CLAIM_PROFILE' || r.type === 'EDIT_PERSON');
  const photoRequests = pendingRequests.filter(r => r.type === 'NEW_PHOTO');
  const postRequests = pendingRequests.filter(r => r.type === 'NEW_POST');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-600 flex items-center justify-center text-white">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Sunmanlar Yönetici & Moderasyon Paneli</h3>
              <p className="text-[11px] text-stone-400">Onay bekleyen içerikler, yedekleme ve veri yönetimi</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isAuthenticated ? (
          /* Login Screen */
          <div className="p-8 text-center max-w-sm mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-base text-stone-900">Yönetici Girişi</h4>
              <p className="text-xs text-stone-500 mt-1">
                Moderasyon paneline erişmek için lütfen yönetici şifrenizi girin.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-3">
              <input 
                type="password" 
                required
                placeholder="Yönetici Şifresi"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-amber-500 text-center font-bold tracking-widest"
              />

              {authError && (
                <div className="text-xs text-rose-600 font-semibold">{authError}</div>
              )}

              <button 
                type="submit"
                className="w-full py-2.5 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-md transition-colors"
              >
                Giriş Yap
              </button>

              <div className="text-[11px] text-stone-400 italic">
                (Test şifresi: <span className="font-mono text-stone-600">sunmanlar123</span>)
              </div>
            </form>
          </div>
        ) : (
          /* Admin Dashboard */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Stats Header */}
            <div className="bg-stone-50 p-4 border-b border-stone-200 flex items-center justify-between text-xs flex-wrap gap-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 font-semibold text-stone-700">
                  <Database className="w-4 h-4 text-amber-600" />
                  <span>Kayıtlı Kişi: <strong>{totalPersonsCount}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-emerald-700">
                  <Cloud className="w-4 h-4 text-emerald-600" />
                  <span>Firebase: <strong>Bağlı (sunmanlar-31f36)</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadBackup}
                  className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                  title="Tüm veriyi JSON olarak bilgisayara indir"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Yedek İndir (JSON)</span>
                </button>
                <button 
                  onClick={() => setIsAuthenticated(false)}
                  className="text-stone-400 hover:text-stone-700 font-semibold text-[11px] ml-2"
                >
                  Çıkış
                </button>
              </div>
            </div>

            {/* Moderation Tabs */}
            <div className="flex border-b border-stone-200 bg-white px-4 overflow-x-auto">
              <button
                onClick={() => setActiveTab('new_persons')}
                className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                  activeTab === 'new_persons'
                    ? 'border-amber-600 text-amber-800'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Kişi Talepleri ({newPersonsList.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('claims')}
                className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                  activeTab === 'claims'
                    ? 'border-amber-600 text-amber-800'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Sahiplenme & Güncelleme ({claimRequests.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('photos')}
                className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                  activeTab === 'photos'
                    ? 'border-amber-600 text-amber-800'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Fotoğraflar ({photoRequests.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('posts')}
                className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                  activeTab === 'posts'
                    ? 'border-amber-600 text-amber-800'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Duvar ({postRequests.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('cloud')}
                className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                  activeTab === 'cloud'
                    ? 'border-emerald-600 text-emerald-800'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                <span>Bulut & Migrasyon</span>
              </button>
            </div>

            {/* Content Queue */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              
              {/* Tab 1: Yeni Kişi Talepleri */}
              {activeTab === 'new_persons' && (
                <>
                  {newPersonsList.length === 0 ? (
                    <div className="text-center py-12 text-stone-400 text-xs italic">
                      Onay bekleyen yeni kişi ekleme talebi bulunmuyor.
                    </div>
                  ) : (
                    newPersonsList.map(req => (
                      <div 
                        key={req.id}
                        className="bg-stone-50 rounded-2xl p-4 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="font-bold text-sm text-stone-900">
                            {req.personData.firstName} {req.personData.lastName}
                            <span className="text-xs font-normal text-stone-500 ml-2">
                              ({req.personData.gender === 'male' ? 'Erkek' : 'Kadın'}, Doğum: {req.personData.birthDate || 'Belirtilmedi'})
                            </span>
                          </div>
                          <div className="text-xs text-stone-600 mt-1">
                            {req.personData.fatherName && <span>Baba: <strong>{req.personData.fatherName}</strong> • </span>}
                            {req.personData.motherName && <span>Anne: <strong>{req.personData.motherName}</strong></span>}
                          </div>
                          <div className="text-[11px] text-amber-800 mt-1">
                            İleten: {req.personData.requesterName} ({req.personData.requesterPhone || req.personData.requesterEmail})
                            {req.personData.notes && ` — "${req.personData.notes}"`}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => onApproveRequest(req)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Onayla & Ekle</span>
                          </button>
                          <button
                            onClick={() => onRejectRequest(req)}
                            className="px-3 py-1.5 bg-stone-200 hover:bg-rose-100 hover:text-rose-700 text-stone-600 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Reddet</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              {/* Tab 2: Sahiplenme & Güncelleme */}
              {activeTab === 'claims' && (
                <>
                  {claimRequests.length === 0 ? (
                    <div className="text-center py-12 text-stone-400 text-xs italic">
                      Onay bekleyen profil sahiplenme veya güncelleme talebi yok.
                    </div>
                  ) : (
                    claimRequests.map(req => (
                      <div 
                        key={req.id}
                        className="bg-stone-50 rounded-2xl p-4 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="font-bold text-sm text-stone-900">
                            Hedef Profil: {req.personName}
                          </div>
                          <div className="text-xs text-stone-600 mt-1">
                            Talep Eden: <strong>{req.requesterName}</strong> ({req.requesterPhone || req.requesterEmail})
                          </div>
                          {req.note && (
                            <div className="text-xs text-stone-500 italic mt-0.5">"{req.note}"</div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => onApproveRequest(req)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Onayla</span>
                          </button>
                          <button
                            onClick={() => onRejectRequest(req)}
                            className="px-3 py-1.5 bg-stone-200 hover:bg-rose-100 hover:text-rose-700 text-stone-600 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Reddet</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              {/* Tab 3: Fotoğraflar */}
              {activeTab === 'photos' && (
                <>
                  {photoRequests.length === 0 ? (
                    <div className="text-center py-12 text-stone-400 text-xs italic">
                      Onay bekleyen yeni fotoğraf yok.
                    </div>
                  ) : (
                    photoRequests.map(req => (
                      <div 
                        key={req.id}
                        className="bg-stone-50 rounded-2xl p-4 border border-stone-200 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <img src={req.photoData.url} alt="" className="w-14 h-14 rounded-xl object-cover border" />
                          <div>
                            <div className="font-bold text-xs text-stone-900">{req.photoData.title}</div>
                            <div className="text-[11px] text-stone-500">{req.photoData.year} • {req.photoData.location}</div>
                            <div className="text-[10px] text-amber-800">
                              Etiketli: {req.photoData.taggedPersons?.length || 0} Kişi
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => onApproveRequest(req)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Yayınla</span>
                          </button>
                          <button
                            onClick={() => onRejectRequest(req)}
                            className="px-3 py-1.5 bg-stone-200 hover:bg-rose-100 text-stone-600 rounded-xl text-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              {/* Tab 4: Duvar Gönderileri */}
              {activeTab === 'posts' && (
                <>
                  {postRequests.length === 0 ? (
                    <div className="text-center py-12 text-stone-400 text-xs italic">
                      Onay bekleyen duvar mesajı yok.
                    </div>
                  ) : (
                    postRequests.map(req => (
                      <div 
                        key={req.id}
                        className="bg-stone-50 rounded-2xl p-4 border border-stone-200 flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="font-bold text-xs text-stone-900">{req.postData.title}</div>
                          <div className="text-xs text-stone-600 line-clamp-1">{req.postData.content}</div>
                          <div className="text-[10px] text-amber-800 mt-1">Yazan: {req.postData.authorName}</div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => onApproveRequest(req)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Yayınla</span>
                          </button>
                          <button
                            onClick={() => onRejectRequest(req)}
                            className="px-3 py-1.5 bg-stone-200 hover:bg-rose-100 text-stone-600 rounded-xl text-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              {/* Tab 5: Bulut ve Migrasyon */}
              {activeTab === 'cloud' && (
                <div className="space-y-4 py-2">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm mb-1">
                      <Cloud className="w-4 h-4 text-emerald-600" />
                      <span>Firebase Firestore Senkronizasyon Durumu</span>
                    </div>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Soyağacı veritabanı doğrudan Firebase bulut sunucusuna bağlıdır. Yapılan her kişi eklemesi, onay ve fotoğraf tüm aile bireylerinin cihazlarında anlık (realtime) güncellenir.
                    </p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-4">
                      <div className="bg-white p-3 rounded-xl border border-emerald-100">
                        <div className="text-[10px] text-stone-400 font-medium">Bağlantı Durumu</div>
                        <div className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                          <span>Canlı & Aktif</span>
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-emerald-100">
                        <div className="text-[10px] text-stone-400 font-medium">Buluttaki Birey</div>
                        <div className="text-xs font-bold text-stone-800 mt-0.5">
                          {cloudSystemInfo?.totalPersons || totalPersonsCount} Kişi
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-emerald-100 col-span-2 sm:col-span-1">
                        <div className="text-[10px] text-stone-400 font-medium">Proje ID</div>
                        <div className="text-xs font-bold text-stone-800 mt-0.5 font-mono">
                          sunmanlar-31f36
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Migrasyon İlerleme Çubuğu */}
                  {migrationProgress && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2 animate-in fade-in">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                        <span>{migrationProgress.stage}</span>
                        <span>%{migrationProgress.percent}</span>
                      </div>
                      <div className="w-full bg-amber-200/60 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-amber-600 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${migrationProgress.percent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Bulut İşlem Butonları */}
                  <div className="space-y-2.5 pt-1">
                    <div className="text-xs font-bold text-stone-700">Veritabanı Yönetim Araçları:</div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        onClick={onRunMigration}
                        disabled={migrationProgress !== null}
                        className="p-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        <span>1.415 Kişiyi Firestore'a Yeniden Migre Et</span>
                      </button>

                      <button
                        onClick={onForceRefresh}
                        className="p-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-stone-200"
                      >
                        <Database className="w-4 h-4 text-stone-600" />
                        <span>Buluttan Verileri Yenile (Force Refresh)</span>
                      </button>
                    </div>

                    <button
                      onClick={handleDownloadBackup}
                      className="w-full p-2.5 bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Download className="w-4 h-4 text-amber-700" />
                      <span>Tam Veritabanını Bilgisayara İndir (JSON Yedek)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
