import React, { useState, useMemo, useRef } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Sliders, 
  Layers, 
  Check, 
  Palette, 
  FileText, 
  Share2, 
  Sparkles,
  TreePine,
  Shield,
  Heart,
  ChevronDown
} from 'lucide-react';
import { BRANCH_DEFINITIONS } from '../../utils/branchHelper';

export default function TreePosterModal({ 
  isOpen, 
  onClose, 
  persons, 
  personsMap, 
  initialRootPerson = null,
  claimedPerson = null
}) {
  if (!isOpen) return null;

  // Selected root person / branch
  const [selectedRootId, setSelectedRootId] = useState(() => {
    if (initialRootPerson) return initialRootPerson.id;
    return 'START'; // Kök ata: Ali Sunman
  });

  // Poster Configuration States
  const [treeMode, setTreeMode] = useState('descendants'); // 'descendants' (torunlar) | 'ancestors' (atalar) | 'hourglass'
  const [maxGenerations, setMaxGenerations] = useState(4); // 2, 3, 4, 5, 99 (all)
  const [theme, setTheme] = useState('parchment'); // 'parchment' | 'emerald' | 'royal' | 'minimal'
  const [orientation, setOrientation] = useState('landscape'); // 'landscape' | 'portrait'
  const [paperSize, setPaperSize] = useState('A3'); // 'A4' | 'A3' | 'A2'
  
  // Display Options
  const [showDates, setShowDates] = useState(true);
  const [showNicknames, setShowNicknames] = useState(true);
  const [showSpouses, setShowSpouses] = useState(true);
  const [showBurials, setShowBurials] = useState(false);
  const [showGenBadges, setShowGenBadges] = useState(true);

  // Custom text customization
  const [posterTitle, setPosterTitle] = useState(() => {
    return 'SUNMANLAR AİLESİ SOY KÜTÜĞÜ';
  });
  const [posterDedication, setPosterDedication] = useState('Sakarya Hendek • Geçmişten Günümüze Aile Hafızası');

  // Zoom & Preview State
  const [zoomLevel, setZoomLevel] = useState(1);
  const posterRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);

  // Selected root person object
  const rootPerson = useMemo(() => {
    return personsMap[selectedRootId] || persons[0];
  }, [selectedRootId, personsMap, persons]);

  // Build the hierarchical tree data structure
  const treeData = useMemo(() => {
    if (!rootPerson) return null;

    // Helper to recursively collect descendants up to depth
    function getDescendantTree(person, currentDepth) {
      if (!person || currentDepth > maxGenerations) return null;

      const children = (person.childrenIds || [])
        .map(cid => personsMap[cid])
        .filter(Boolean)
        .map(c => getDescendantTree(c, currentDepth + 1))
        .filter(Boolean);

      const spouses = (person.spouseIds || [])
        .map(sid => personsMap[sid])
        .filter(Boolean);

      return {
        person,
        spouses,
        generation: currentDepth,
        children
      };
    }

    // Helper to recursively collect ancestors up to depth
    function getAncestorTree(person, currentDepth) {
      if (!person || currentDepth > maxGenerations) return null;

      const father = person.fatherId ? personsMap[person.fatherId] : null;
      const mother = person.motherId ? personsMap[person.motherId] : null;

      const ancestors = [];
      if (father) ancestors.push(getAncestorTree(father, currentDepth + 1));
      if (mother) ancestors.push(getAncestorTree(mother, currentDepth + 1));

      return {
        person,
        spouses: (person.spouseIds || []).map(sid => personsMap[sid]).filter(Boolean),
        generation: currentDepth,
        ancestors: ancestors.filter(Boolean)
      };
    }

    if (treeMode === 'ancestors') {
      return { type: 'ancestors', data: getAncestorTree(rootPerson, 1) };
    }
    return { type: 'descendants', data: getDescendantTree(rootPerson, 1) };
  }, [rootPerson, maxGenerations, treeMode, personsMap]);

  // Count total people included in this poster view
  const totalTreePersonsCount = useMemo(() => {
    if (!treeData || !treeData.data) return 0;
    const visited = new Set();
    
    function countNodes(node) {
      if (!node || !node.person) return;
      visited.add(node.person.id);
      if (showSpouses && node.spouses) {
        node.spouses.forEach(s => visited.add(s.id));
      }
      if (node.children) {
        node.children.forEach(c => countNodes(c));
      }
      if (node.ancestors) {
        node.ancestors.forEach(a => countNodes(a));
      }
    }
    
    countNodes(treeData.data);
    return visited.size;
  }, [treeData, showSpouses]);

  // Themes Color Palette
  const currentThemeStyles = useMemo(() => {
    switch (theme) {
      case 'emerald':
        return {
          bg: 'bg-emerald-50/40',
          border: 'border-emerald-700',
          innerBorder: 'border-emerald-600/30',
          headerBg: 'from-emerald-900 via-emerald-800 to-teal-900',
          headerText: 'text-emerald-50',
          subText: 'text-emerald-200',
          badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          cardBg: 'bg-white',
          cardBorder: 'border-emerald-200',
          cardMale: 'border-l-4 border-l-teal-600',
          cardFemale: 'border-l-4 border-l-rose-500',
          lineColor: '#047857',
          accentColor: 'text-emerald-800'
        };
      case 'royal':
        return {
          bg: 'bg-slate-50',
          border: 'border-blue-900',
          innerBorder: 'border-amber-500/40',
          headerBg: 'from-slate-950 via-blue-950 to-slate-900',
          headerText: 'text-amber-300',
          subText: 'text-slate-300',
          badgeBg: 'bg-amber-100 text-amber-950 border-amber-300',
          cardBg: 'bg-white',
          cardBorder: 'border-slate-300',
          cardMale: 'border-l-4 border-l-blue-700',
          cardFemale: 'border-l-4 border-l-rose-500',
          lineColor: '#1e3a8a',
          accentColor: 'text-blue-900'
        };
      case 'minimal':
        return {
          bg: 'bg-white',
          border: 'border-stone-900',
          innerBorder: 'border-stone-300',
          headerBg: 'from-stone-900 to-stone-800',
          headerText: 'text-white',
          subText: 'text-stone-300',
          badgeBg: 'bg-stone-100 text-stone-900 border-stone-300',
          cardBg: 'bg-white',
          cardBorder: 'border-stone-400',
          cardMale: 'border-l-4 border-l-stone-900',
          cardFemale: 'border-l-4 border-l-stone-600',
          lineColor: '#1c1917',
          accentColor: 'text-stone-900'
        };
      case 'parchment':
      default:
        return {
          bg: 'bg-[#faf6ee]',
          border: 'border-[#8b5a2b]',
          innerBorder: 'border-[#cda274]/50',
          headerBg: 'from-[#4a2e18] via-[#633e20] to-[#784c28]',
          headerText: 'text-[#fbf5ea]',
          subText: 'text-[#e6cbb1]',
          badgeBg: 'bg-[#f4ebd9] text-[#5c3818] border-[#cda274]',
          cardBg: 'bg-[#fffdfa]',
          cardBorder: 'border-[#dfcaa7]',
          cardMale: 'border-l-4 border-l-[#4a7c59]',
          cardFemale: 'border-l-4 border-l-[#a24857]',
          lineColor: '#8b5a2b',
          accentColor: 'text-[#633e20]'
        };
    }
  }, [theme]);

  // Native Browser Print to PDF
  const handlePrint = () => {
    window.print();
  };

  // Zoom helpers
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.15, 2.2));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.15, 0.4));
  const handleResetZoom = () => setZoomLevel(1);

  // Render individual person badge in poster
  const renderPosterCard = (person, isSpouse = false) => {
    if (!person) return null;
    const isMale = person.gender === 'male';

    return (
      <div 
        key={person.id + (isSpouse ? '_sp' : '')}
        className={`px-3 py-2 rounded-xl text-center shadow-xs transition-all relative ${currentThemeStyles.cardBg} border ${currentThemeStyles.cardBorder} ${
          isMale ? currentThemeStyles.cardMale : currentThemeStyles.cardFemale
        } min-w-[130px] max-w-[170px] shrink-0`}
      >
        {isSpouse && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-amber-300 flex items-center gap-0.5">
            <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
            <span>Eşi</span>
          </div>
        )}

        <div className="font-extrabold text-xs text-stone-900 leading-tight">
          {person.firstName} {person.lastName}
        </div>

        {person.maidenName && (
          <div className="text-[10px] text-stone-500 font-medium italic">
            ({person.maidenName})
          </div>
        )}

        {showNicknames && (person.nickname || person.lakap) && (
          <div className="text-[10px] text-amber-800 font-bold bg-amber-50 px-1 py-0.5 rounded mt-0.5 inline-block">
            "{person.nickname || person.lakap}"
          </div>
        )}

        {showDates && (person.birthDate || person.deathDate) && (
          <div className="text-[10px] text-stone-600 mt-1 font-mono">
            {person.birthDate || '?'} — {person.deathDate || (person.birthDate ? 'Sağ' : '')}
          </div>
        )}

        {showBurials && person.burialPlace && (
          <div className="text-[9px] text-stone-500 truncate mt-0.5">
            📍 {person.burialPlace}
          </div>
        )}
      </div>
    );
  };

  // Recursive Tree Node Renderer
  const renderTreeNode = (node) => {
    if (!node || !node.person) return null;
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.person.id} className="flex flex-col items-center">
        
        {/* Person and Spouses group */}
        <div className="flex items-center gap-1.5 relative z-10">
          {renderPosterCard(node.person)}
          {showSpouses && node.spouses && node.spouses.map(spouse => renderPosterCard(spouse, true))}
        </div>

        {/* Children branch connector */}
        {hasChildren && (
          <div className="flex flex-col items-center w-full">
            {/* Vertical stem from parent */}
            <div 
              className="w-0.5 h-6"
              style={{ backgroundColor: currentThemeStyles.lineColor }}
            />

            {/* Horizontal branch bar */}
            <div className="flex justify-center relative w-full pt-0">
              {node.children.length > 1 && (
                <div 
                  className="absolute top-0 h-0.5"
                  style={{ 
                    backgroundColor: currentThemeStyles.lineColor,
                    left: `calc(${100 / (node.children.length * 2)}%)`,
                    right: `calc(${100 / (node.children.length * 2)}%)`
                  }}
                />
              )}

              {/* Children Nodes */}
              <div className="flex justify-center gap-4 sm:gap-6 pt-0">
                {node.children.map(child => (
                  <div key={child.person.id} className="flex flex-col items-center">
                    {/* Vertical stem to child */}
                    <div 
                      className="w-0.5 h-6"
                      style={{ backgroundColor: currentThemeStyles.lineColor }}
                    />
                    {renderTreeNode(child)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-150">
      
      {/* Modal Container */}
      <div className="bg-white rounded-3xl w-full max-w-7xl h-[94vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200">
        
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 bg-stone-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center text-white shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                <span>Soyağacı Poster & PDF Çıktı Motoru</span>
                <span className="text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  Büyük Boy Şecere
                </span>
              </h3>
              <p className="text-[11px] text-stone-400">
                Seçilen sülale kolunu yüksek çözünürlüklü duvar posteri veya PDF olarak hazırlayın
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all active:scale-95"
              title="Yazıcıya gönder veya PDF olarak kaydet"
            >
              <Printer className="w-4 h-4" />
              <span>Yazdır / PDF Kaydet</span>
            </button>

            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Control Toolbar (Options) */}
        <div className="p-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between gap-3 flex-wrap text-xs shrink-0">
          
          <div className="flex items-center gap-3 flex-wrap">
            {/* Kök Birey / Sülale Kolu Seçici */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-stone-600">Sülale Kolu:</span>
              <select
                value={selectedRootId}
                onChange={(e) => setSelectedRootId(e.target.value)}
                className="bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 font-bold text-stone-800 text-xs outline-none focus:border-amber-500 shadow-2xs"
              >
                <option value="START">🌳 Kök Ata: Ali Sunman (Tüm Aile)</option>
                <option value="HGJ2X">🔷 Ali Ağa Kolu (286+ Kişi)</option>
                <option value="MM62G">🟣 Laz Osman Kolu (321+ Kişi)</option>
                <option value="Z141M">🟢 Hasan Efendi Kolu (112+ Kişi)</option>
                <option value="NIS42">💠 Mehmet Kolu</option>
                {claimedPerson && (
                  <option value={claimedPerson.id}>⭐ Kendi Kolum: {claimedPerson.firstName} {claimedPerson.lastName}</option>
                )}
              </select>
            </div>

            {/* Kuşak Derinliği */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-stone-600">Kuşak:</span>
              <select
                value={maxGenerations}
                onChange={(e) => setMaxGenerations(Number(e.target.value))}
                className="bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 font-semibold text-stone-800 text-xs outline-none focus:border-amber-500 shadow-2xs"
              >
                <option value={2}>2 Kuşak (Ebeveyn & Çocuklar)</option>
                <option value={3}>3 Kuşak (Dede & Torunlar)</option>
                <option value={4}>4 Kuşak (Standart Duvar Boyu)</option>
                <option value={5}>5 Kuşak (Geniş Şecere)</option>
                <option value={99}>Tüm Kuşaklar (Sınırsız)</option>
              </select>
            </div>

            {/* Tema Seçici */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-stone-600">Tema:</span>
              <div className="flex items-center bg-stone-200/60 p-0.5 rounded-xl">
                <button
                  onClick={() => setTheme('parchment')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                    theme === 'parchment' ? 'bg-amber-100 text-amber-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="Klasik Nostaljik Parşömen & Altın"
                >
                  📜 Parşömen
                </button>
                <button
                  onClick={() => setTheme('emerald')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                    theme === 'emerald' ? 'bg-emerald-100 text-emerald-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="Zümrüt Yeşili Aile Çınarı"
                >
                  🌿 Çınar
                </button>
                <button
                  onClick={() => setTheme('royal')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                    theme === 'royal' ? 'bg-blue-100 text-blue-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="Kraliyet Laciverti & Altın"
                >
                  👑 Lacivert
                </button>
                <button
                  onClick={() => setTheme('minimal')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                    theme === 'minimal' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="Matbaa Siyah-Beyaz (Mürekkep Dostu)"
                >
                  🖨️ Matbaa
                </button>
              </div>
            </div>

            {/* Bilgi Kutucukları */}
            <div className="flex items-center gap-3 bg-white px-3 py-1 rounded-xl border border-stone-200 text-xs font-medium">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDates}
                  onChange={(e) => setShowDates(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-0"
                />
                <span>Tarihler</span>
              </label>

              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showNicknames}
                  onChange={(e) => setShowNicknames(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-0"
                />
                <span>Lakaplar</span>
              </label>

              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSpouses}
                  onChange={(e) => setShowSpouses(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-0"
                />
                <span>Eşler</span>
              </label>

              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBurials}
                  onChange={(e) => setShowBurials(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-0"
                />
                <span>Kabirler</span>
              </label>
            </div>
          </div>

          {/* Zoom & View Controls */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-stone-500 bg-stone-200/80 px-2 py-1 rounded-lg">
              {totalTreePersonsCount} Birey
            </span>

            <div className="flex items-center bg-white border border-stone-200 rounded-xl p-0.5 shadow-2xs">
              <button
                onClick={handleZoomOut}
                className="p-1 hover:bg-stone-100 rounded text-stone-600"
                title="Küçült"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono text-[11px] font-bold text-stone-700">
                %{Math.round(zoomLevel * 100)}
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1 hover:bg-stone-100 rounded text-stone-600"
                title="Büyüt"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1 hover:bg-stone-100 rounded text-stone-600 ml-1 border-l border-stone-200"
                title="Sıfırla"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Poster Canvas Preview Area */}
        <div className="flex-1 bg-stone-200/80 p-4 sm:p-8 overflow-auto flex items-center justify-center">
          
          {/* THE PRINTABLE POSTER CONTAINER */}
          <div 
            id="sunmanlar-poster-canvas"
            ref={posterRef}
            style={{ 
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out'
            }}
            className={`shadow-2xl rounded-2xl p-8 sm:p-12 relative border-8 ${currentThemeStyles.bg} ${currentThemeStyles.border} min-w-[900px] max-w-[1800px] my-auto`}
          >
            
            {/* Outer Decorative Border Inlay */}
            <div className={`absolute inset-2 border-2 border-dashed ${currentThemeStyles.innerBorder} pointer-events-none rounded-xl`} />

            {/* Poster Header */}
            <div className="text-center pb-8 border-b-2 border-amber-900/10 mb-8 relative">
              
              {/* Crest & Title */}
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-700/10 text-amber-800 mb-2 border border-amber-600/30 shadow-xs">
                <TreePine className="w-6 h-6 text-amber-800" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-wider uppercase text-stone-900 font-serif">
                {posterTitle}
              </h1>

              <div className="text-xs sm:text-sm font-semibold text-stone-600 mt-1 italic">
                {posterDedication}
              </div>

              {/* Sub-badge: Branch and statistics */}
              <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${currentThemeStyles.badgeBg}`}>
                  🌿 Kol: {rootPerson.firstName} {rootPerson.lastName} ({rootPerson.id === 'START' ? 'Tüm Aile' : 'Kolu'})
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${currentThemeStyles.badgeBg}`}>
                  👥 Toplam {totalTreePersonsCount} Aile Bireyi
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${currentThemeStyles.badgeBg}`}>
                  📅 Basım: {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>

            {/* The Hierarchical Tree */}
            <div className="py-4 flex justify-center overflow-x-auto min-w-full">
              {treeData && treeData.data ? (
                renderTreeNode(treeData.data)
              ) : (
                <div className="text-center py-12 text-stone-400">
                  Ağaç verisi yükleniyor...
                </div>
              )}
            </div>

            {/* Poster Footer Stamp */}
            <div className="mt-12 pt-6 border-t-2 border-amber-900/10 flex items-center justify-between text-[11px] text-stone-500 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-700" />
                <span className="font-semibold text-stone-700">
                  Sunmanlar Aile Portalı & Soyağacı Arşivi Resmi Çıktısı
                </span>
              </div>

              <div className="italic text-stone-400">
                "Kökleri mazide, dalları atide 1.415 kişilik büyük ailemiz."
              </div>

              <div className="font-mono text-stone-400">
                sunmanlar.web.app
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Global Print Stylesheet for true Vector PDF / Paper Printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #sunmanlar-poster-canvas, #sunmanlar-poster-canvas * {
            visibility: visible !important;
          }
          #sunmanlar-poster-canvas {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            min-width: 100% !important;
            transform: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 20px !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: ${orientation === 'landscape' ? 'landscape' : 'portrait'};
            margin: 8mm;
          }
        }
      `}</style>

    </div>
  );
}
