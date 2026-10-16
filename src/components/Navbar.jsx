import React, { useState } from 'react';
import { 
  GitFork, 
  Search, 
  Camera, 
  MessageSquare, 
  Cake, 
  Shield, 
  UserCheck, 
  UserPlus, 
  Menu, 
  X,
  Users,
  Compass,
  Landmark,
  DownloadCloud,
  Cloud
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  persons, 
  onSelectPerson, 
  claimedPerson, 
  onOpenClaimModal,
  onOpenAddModal,
  onOpenAdminModal,
  onOpenKinshipModal,
  onOpenArchiveModal,
  pwaInstallPrompt,
  onInstallPwa,
  totalPersonsCount,
  syncStatus = 'connected'
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filter search results
  const searchResults = searchQuery.trim().length >= 2 
    ? persons.filter(p => {
        const full = `${p.firstName} ${p.lastName} ${p.maidenName || ''} ${p.nickname || ''}`.toLowerCase();
        return full.includes(searchQuery.toLowerCase());
      }).slice(0, 8)
    : [];

  const handleSelectSearchResult = (person) => {
    onSelectPerson(person);
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const navItems = [
    { id: 'tree', label: 'Soyağacı', icon: GitFork },
    { id: 'gallery', label: 'Fotoğraf Köşesi', icon: Camera },
    { id: 'wall', label: 'Aile Duvarı', icon: MessageSquare },
    { id: 'special', label: 'Özel Günler', icon: Cake },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Family Title */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => setActiveTab('tree')}
              className="cursor-pointer flex items-center gap-2.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-700 to-amber-500 flex items-center justify-center text-white shadow-md shadow-amber-900/10 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-base tracking-tight text-stone-900 flex items-center gap-1.5">
                  SUNMANLAR
                  <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">
                    {totalPersonsCount} Kişi
                  </span>
                  <button 
                    onClick={onOpenAdminModal}
                    className={`hidden sm:inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border cursor-pointer hover:scale-105 transition-transform ${
                      syncStatus === 'connected'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : syncStatus === 'syncing'
                        ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                        : 'bg-stone-100 text-stone-500 border-stone-200'
                    }`}
                    title="Firebase Bulut Durumu & Yönetim Paneli"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${syncStatus === 'connected' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    {syncStatus === 'connected' ? 'Bulut Canlı' : 'Eşitleniyor'}
                  </button>
                </div>
                <div className="text-[11px] text-stone-500 font-medium">
                  Aile Portalı & Dijital Hafıza
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive 
                      ? 'bg-white text-stone-900 shadow-sm' 
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-600' : 'text-stone-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Search & Actions */}
          <div className="flex items-center gap-1.5">
            
            {/* Live Search Bar */}
            <div className="relative">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Akraba ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchOpen(true)}
                  className="w-28 sm:w-36 md:w-44 pl-8 pr-2 py-1.5 text-xs bg-stone-100 border border-transparent focus:border-amber-400 focus:bg-white rounded-xl outline-none transition-all"
                />
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 pointer-events-none" />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 text-stone-400 hover:text-stone-600 text-xs"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {isSearchOpen && searchResults.length > 0 && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="p-2 text-[10px] font-bold text-stone-400 uppercase tracking-wider bg-stone-50 border-b border-stone-100">
                    Arama Sonuçları ({searchResults.length})
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-stone-100">
                    {searchResults.map(p => (
                      <div
                        key={p.id}
                        onClick={() => handleSelectSearchResult(p)}
                        className="p-2.5 hover:bg-amber-50/80 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div>
                          <div className="text-xs font-semibold text-stone-900">
                            {p.firstName} {p.lastName}
                          </div>
                          <div className="text-[10px] text-stone-500">
                            {p.gender === 'male' ? 'Erkek' : 'Kadın'}
                            {p.birthDate ? ` • D: ${p.birthDate}` : ''}
                            {p.deathDate ? ` • Ö: ${p.deathDate}` : ''}
                          </div>
                        </div>
                        <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50">
                          Odaklan
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* PWA Install Button (if prompt ready) */}
            {pwaInstallPrompt && (
              <button
                onClick={onInstallPwa}
                className="hidden xl:flex items-center gap-1 px-2 py-1.5 bg-amber-50 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors"
                title="Telefona Uygulama Olarak Yükle"
              >
                <DownloadCloud className="w-3.5 h-3.5 text-amber-700" />
                <span>Yükle</span>
              </button>
            )}

            {/* Claim Profile / Member Button */}
            {claimedPerson ? (
              <button
                onClick={() => onSelectPerson(claimedPerson)}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold hover:bg-emerald-100 transition-colors"
                title="Kendi Profiliniz"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="max-w-[70px] truncate">{claimedPerson.firstName}</span>
              </button>
            ) : (
              <button
                onClick={onOpenClaimModal}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-100 text-stone-700 border border-stone-200 rounded-xl text-xs font-semibold hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200 transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Ben Kimim?</span>
              </button>
            )}

            {/* Kendini Ekle Butonu */}
            <button
              id="nav-add-person-btn"
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 shadow-sm shadow-amber-600/20 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ağaca Ekle</span>
            </button>

            {/* Admin Girişi */}
            <button
              id="nav-admin-btn"
              onClick={onOpenAdminModal}
              className="p-2 text-stone-500 hover:text-amber-700 hover:bg-stone-100 rounded-xl transition-colors bg-stone-50 border border-stone-200"
              title="Yönetici Paneli"
            >
              <Shield className="w-4 h-4 text-amber-700" />
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-stone-600 hover:bg-stone-100 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-200 py-3 space-y-2 animate-in slide-in-from-top-2 duration-150">
            <div className="grid grid-cols-2 gap-2 pb-2">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-colors ${
                      isActive 
                        ? 'bg-amber-50 text-amber-900 border border-amber-200' 
                        : 'bg-stone-50 text-stone-700'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-700' : 'text-stone-400'}`} />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Extra Mobile Actions */}
            <div className="grid grid-cols-2 gap-2 pb-2">
              <button
                onClick={() => {
                  onOpenKinshipModal();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 p-2.5 bg-stone-100 text-stone-800 rounded-xl text-xs font-semibold"
              >
                <Compass className="w-3.5 h-3.5 text-amber-600" />
                <span>Akrabalık Bağı</span>
              </button>
              <button
                onClick={() => {
                  onOpenArchiveModal();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 p-2.5 bg-stone-100 text-stone-800 rounded-xl text-xs font-semibold"
              >
                <Landmark className="w-3.5 h-3.5 text-amber-700" />
                <span>Arşiv & Kabirler</span>
              </button>
            </div>

            <div className="flex gap-2 pt-2 border-t border-stone-100">
              <button
                onClick={() => {
                  onOpenClaimModal();
                  setMobileMenuOpen(false);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-stone-100 text-stone-800 rounded-xl text-xs font-semibold"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Ben Kimim?</span>
              </button>
              <button
                onClick={() => {
                  onOpenAddModal();
                  setMobileMenuOpen(false);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-amber-600 text-white rounded-xl text-xs font-semibold"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Ağaca Ekle</span>
              </button>
            </div>

            {pwaInstallPrompt && (
              <button
                onClick={() => {
                  onInstallPwa();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 bg-amber-50 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold"
              >
                <DownloadCloud className="w-4 h-4 text-amber-700" />
                <span>Uygulamayı Telefona Yükle</span>
              </button>
            )}
          </div>
        )}

      </div>
    </header>
  );
}
