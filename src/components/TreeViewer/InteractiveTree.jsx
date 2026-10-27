import React, { useState, useRef } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  ArrowLeft, 
  GitFork, 
  Heart, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Info,
  Compass,
  Users,
  Baby,
  Plus,
  UserPlus
} from 'lucide-react';
import { getPersonBranch } from '../../utils/branchHelper';

export default function InteractiveTree({ 
  persons, 
  personsMap, 
  focusPerson, 
  onSelectPerson, 
  onOpenDetails,
  claimedPerson,
  onResetToRoot,
  onQuickAdd // { targetPerson, relationType: 'CHILD_BOY' | 'CHILD_GIRL' | 'SPOUSE' | 'FATHER' | 'MOTHER' }
}) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [touchDistance, setTouchDistance] = useState(null);
  const [history, setHistory] = useState([]);
  const [showGrandchildren, setShowGrandchildren] = useState(true);
  const [activeMenuCardId, setActiveMenuCardId] = useState(null);
  const containerRef = useRef(null);

  // If focusPerson changes, track history
  const handleRefocus = (newPerson) => {
    if (newPerson && newPerson.id !== focusPerson?.id) {
      setHistory(prev => [...prev, focusPerson]);
      onSelectPerson(newPerson);
      setPan({ x: 0, y: 0 });
      setActiveMenuCardId(null);
    }
  };

  const handleGoBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory(history.slice(0, -1));
      onSelectPerson(prev);
      setPan({ x: 0, y: 0 });
      setActiveMenuCardId(null);
    }
  };

  // Touch & Mouse Handlers for Pan & Pinch-Zoom
  const handleMouseDown = (e) => {
    if (e.target.closest('button') || e.target.closest('.person-card') || e.target.closest('.leaf-action-card')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom(prev => Math.min(Math.max(prev * zoomFactor, 0.4), 1.8));
  };

  // Touch Handlers for Mobile (Pan & Pinch-to-zoom)
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      if (e.target.closest('button') || e.target.closest('.person-card') || e.target.closest('.leaf-action-card')) return;
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y
      });
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setTouchDistance(dist);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && isDragging) {
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    } else if (e.touches.length === 2 && touchDistance) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / touchDistance;
      setZoom(prev => Math.min(Math.max(prev * (factor > 1 ? 1.03 : 0.97), 0.4), 1.8));
      setTouchDistance(dist);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setTouchDistance(null);
  };

  if (!focusPerson) {
    return <div className="p-8 text-center text-stone-500 font-bold">Kişi verisi yükleniyor...</div>;
  }

  // Relations to render for the focused person
  const father = focusPerson.fatherId ? personsMap[focusPerson.fatherId] : null;
  const mother = focusPerson.motherId ? personsMap[focusPerson.motherId] : null;
  const spouses = (focusPerson.spouseIds || []).map(id => personsMap[id]).filter(Boolean);
  const children = (focusPerson.childrenIds || []).map(id => personsMap[id]).filter(Boolean);

  // Grandparents
  const grandFatherPaternal = father?.fatherId ? personsMap[father.fatherId] : null;
  const grandMotherPaternal = father?.motherId ? personsMap[father.motherId] : null;
  const grandFatherMaternal = mother?.fatherId ? personsMap[mother.fatherId] : null;
  const grandMotherMaternal = mother?.motherId ? personsMap[mother.motherId] : null;

  // Siblings
  const siblings = [];
  if (father || mother) {
    const parentChildren = new Set([
      ...(father ? father.childrenIds : []),
      ...(mother ? mother.childrenIds : [])
    ]);
    parentChildren.forEach(id => {
      if (id !== focusPerson.id && personsMap[id]) {
        siblings.push(personsMap[id]);
      }
    });
  }

  // Grandchildren (Torunlar)
  const grandchildren = [];
  children.forEach(ch => {
    (ch.childrenIds || []).forEach(gcId => {
      if (personsMap[gcId]) {
        grandchildren.push({
          person: personsMap[gcId],
          parent: ch
        });
      }
    });
  });

  // Branch of focus person
  const focusBranch = getPersonBranch(focusPerson, personsMap);

  // Quick Action Dispatcher
  const triggerQuickAdd = (targetPerson, relationType) => {
    setActiveMenuCardId(null);
    if (onQuickAdd) {
      onQuickAdd({ targetPerson, relationType });
    }
  };

  // Modern Person Card
  const NodeCard = ({ person, role, isFocus = false, subInfo = null }) => {
    if (!person) return null;
    const isMale = person.gender === 'male';
    const isAlive = !person.deathDate;
    const branch = getPersonBranch(person, personsMap);
    const isMenuOpen = activeMenuCardId === person.id;

    // Emoji avatar for 5-year-old friendly recognition
    const emojiIcon = role?.includes('Dede') ? '👴' : 
                      role?.includes('Nine') || role?.includes('Babaanne') || role?.includes('Anneanne') ? '👵' :
                      role?.includes('Baba') ? '👨' :
                      role?.includes('Anne') ? '👩' :
                      role?.includes('Torun') ? '👶' :
                      isMale ? '👦' : '👧';

    return (
      <div 
        className={`person-card select-none rounded-3xl p-3.5 border-2 transition-all duration-200 shadow-sm relative flex flex-col items-center text-center group ${
          isFocus 
            ? 'w-56 sm:w-64 bg-gradient-to-b from-amber-50 to-orange-50/60 border-amber-500 ring-4 ring-amber-500/25 shadow-xl scale-105 z-20' 
            : 'w-44 sm:w-52 bg-white hover:bg-stone-50 border-stone-200 hover:border-amber-400 hover:shadow-lg cursor-pointer z-10'
        }`}
        onClick={() => {
          if (!isFocus) {
            handleRefocus(person);
          } else {
            onOpenDetails(person);
          }
        }}
      >
        {/* Quick Add Floating Button (Top Right of Card) */}
        <div className="absolute -top-2.5 -right-2.5 z-30">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenuCardId(isMenuOpen ? null : person.id);
            }}
            className="w-7 h-7 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center shadow-md transition-transform hover:scale-110 active:scale-95"
            title="Bu kişiye akraba ekle"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Quick Add Mini Dropdown */}
          {isMenuOpen && (
            <div 
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-8 w-48 bg-white rounded-2xl shadow-2xl border-2 border-amber-300 p-2 z-50 space-y-1 animate-in zoom-in-95 duration-150"
            >
              <div className="text-[10px] font-black text-amber-800 uppercase px-2 py-1 tracking-wider border-b border-amber-100">
                {person.firstName}'a Ekle:
              </div>
              <button
                onClick={() => triggerQuickAdd(person, 'CHILD_BOY')}
                className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-blue-50 text-xs font-bold text-blue-900 flex items-center gap-2 transition-colors"
              >
                <span>👦</span>
                <span>Erkek Çocuk Ekle</span>
              </button>
              <button
                onClick={() => triggerQuickAdd(person, 'CHILD_GIRL')}
                className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-rose-50 text-xs font-bold text-rose-900 flex items-center gap-2 transition-colors"
              >
                <span>👧</span>
                <span>Kız Çocuk Ekle</span>
              </button>
              <button
                onClick={() => triggerQuickAdd(person, 'SPOUSE')}
                className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-amber-50 text-xs font-bold text-amber-900 flex items-center gap-2 transition-colors"
              >
                <span>💍</span>
                <span>Eş Ekle</span>
              </button>
              <button
                onClick={() => triggerQuickAdd(person, 'FATHER')}
                className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-stone-100 text-xs font-bold text-stone-800 flex items-center gap-2 transition-colors"
              >
                <span>👨</span>
                <span>Baba Ekle</span>
              </button>
              <button
                onClick={() => triggerQuickAdd(person, 'MOTHER')}
                className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-stone-100 text-xs font-bold text-stone-800 flex items-center gap-2 transition-colors"
              >
                <span>👩</span>
                <span>Anne Ekle</span>
              </button>
            </div>
          )}
        </div>

        {/* Role badge & branch */}
        <div className="flex items-center gap-1 mb-1.5 flex-wrap justify-center">
          {role && (
            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
              isFocus 
                ? 'bg-amber-600 text-white shadow-2xs' 
                : 'bg-stone-100 text-stone-700'
            }`}>
              {role}
            </span>
          )}
          {branch && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 border border-stone-200">
              {branch.shortName || branch.name}
            </span>
          )}
        </div>

        {/* Avatar with friendly emoji */}
        <div className={`w-13 h-13 rounded-2xl flex items-center justify-center font-black text-xl shadow-xs mb-1.5 border-2 relative ${
          isFocus
            ? 'bg-gradient-to-tr from-amber-500 to-amber-400 text-white border-white ring-2 ring-amber-400'
            : isMale
              ? 'bg-blue-100 text-blue-800 border-blue-200'
              : 'bg-rose-100 text-rose-800 border-rose-200'
        }`}>
          {person.avatar ? (
            <img src={person.avatar} alt={person.firstName} className="w-full h-full rounded-2xl object-cover" />
          ) : (
            <span>{emojiIcon}</span>
          )}
          <span className="absolute -bottom-1 -right-1 text-[11px] bg-white rounded-full px-1 shadow-2xs border">
            {isMale ? '♂' : '♀'}
          </span>
        </div>

        {/* Name */}
        <div className="font-black text-xs sm:text-sm text-stone-900 leading-tight truncate w-full px-1">
          {person.firstName} {person.lastName}
        </div>

        {/* Nickname / Lakap */}
        {(person.nickname || person.lakap) && (
          <div className="text-[10px] text-amber-700 font-bold italic truncate w-full mt-0.5">
            "{person.nickname || person.lakap}"
          </div>
        )}

        {/* Dates */}
        <div className="text-[11px] font-semibold text-stone-500 mt-0.5">
          {person.birthDate ? person.birthDate.slice(0, 4) : '—'} 
          {' '}-{' '} 
          {person.deathDate ? person.deathDate.slice(0, 4) : (isAlive ? 'Sağ' : 'Vefat')}
        </div>

        {/* Sub Info */}
        {subInfo && (
          <div className="text-[10px] text-stone-500 mt-0.5 font-bold">
            {subInfo}
          </div>
        )}

        {/* Card Actions */}
        <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-stone-100 w-full justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(person);
            }}
            className="text-[11px] font-bold text-amber-800 hover:text-amber-950 bg-amber-100/70 hover:bg-amber-100 px-2.5 py-1 rounded-xl transition-colors"
          >
            Detay
          </button>
          {!isFocus && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRefocus(person);
              }}
              className="text-[11px] font-bold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-xl flex items-center gap-1 transition-colors"
              title="Ağacı buraya odakla"
            >
              <GitFork className="w-3 h-3 text-amber-600" />
              <span>Odakla</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  // Direct Tree Leaf Addition Card (Yaprak Üzerinde Ekleme Butonu)
  const LeafAddCard = ({ icon, title, subtitle, colorScheme, onClick }) => {
    return (
      <div
        onClick={onClick}
        className={`leaf-action-card select-none w-44 sm:w-48 rounded-3xl p-3.5 border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer group hover:scale-105 active:scale-95 shadow-2xs ${
          colorScheme === 'blue'
            ? 'border-blue-300 hover:border-blue-500 bg-blue-50/60 hover:bg-blue-100/70 text-blue-900'
            : colorScheme === 'rose'
              ? 'border-rose-300 hover:border-rose-500 bg-rose-50/60 hover:bg-rose-100/70 text-rose-900'
              : 'border-amber-300 hover:border-amber-500 bg-amber-50/60 hover:bg-amber-100/70 text-amber-900'
        }`}
      >
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl mb-1.5 shadow-2xs bg-white group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div className="font-black text-xs leading-tight flex items-center gap-1">
          <Plus className="w-3.5 h-3.5 shrink-0" />
          <span>{title}</span>
        </div>
        {subtitle && (
          <span className="text-[10px] text-stone-500 font-medium mt-0.5">
            {subtitle}
          </span>
        )}
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[calc(100vh-140px)] min-h-[550px] bg-stone-100/80 border border-stone-200/90 rounded-3xl overflow-hidden canvas-container cursor-grab active:cursor-grabbing select-none"
      style={{ touchAction: 'none' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Floating Canvas Controls */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-2 flex-wrap">
        {history.length > 0 && (
          <button
            onClick={handleGoBack}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-md text-stone-700 hover:text-stone-900 border border-stone-200 rounded-xl text-xs font-bold shadow-xs hover:bg-white transition-all active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Geri</span>
          </button>
        )}

        <button
          onClick={onResetToRoot}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-md text-stone-800 hover:text-stone-900 border border-stone-200 rounded-xl text-xs font-bold shadow-xs hover:bg-white transition-all active:scale-95"
        >
          <Compass className="w-3.5 h-3.5 text-amber-600" />
          <span>Kök Ata (Ali Sunman)</span>
        </button>

        {grandchildren.length > 0 && (
          <button
            onClick={() => setShowGrandchildren(!showGrandchildren)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border shadow-xs transition-all active:scale-95 ${
              showGrandchildren 
                ? 'bg-amber-100/90 text-amber-900 border-amber-300' 
                : 'bg-white/90 text-stone-600 border-stone-200 hover:bg-white'
            }`}
          >
            <Baby className="w-3.5 h-3.5 text-amber-600" />
            <span>Torunları Göster ({grandchildren.length})</span>
          </button>
        )}
      </div>

      {/* Floating Zoom & Fit Controls */}
      <div className="absolute bottom-4 right-4 z-30 flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-stone-200 shadow-md">
        <button
          onClick={() => setZoom(prev => Math.min(prev * 1.15, 1.8))}
          className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors font-bold"
          title="Yakınlaştır"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <span className="text-[11px] font-black text-stone-600 w-10 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(prev => Math.max(prev * 0.85, 0.4))}
          className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors font-bold"
          title="Uzaklaştır"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-stone-200 mx-0.5" />
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors"
          title="Ortala ve Sıfırla"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Touch Help Tip Banner */}
      <div className="absolute top-4 right-4 z-20 hidden sm:flex items-center gap-1.5 bg-white/80 backdrop-blur-xs px-3 py-1 rounded-full text-[11px] text-stone-600 border border-stone-200 pointer-events-none font-semibold">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span>Yapraklardaki "+" butonuna dokunarak çocuk veya eş ekleyin</span>
      </div>

      {/* Infinite Scalable Tree Surface */}
      <div 
        className="w-full h-full flex items-center justify-center transition-transform duration-75 origin-center"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        <div className="flex flex-col items-center gap-10 py-16 px-12">
          
          {/* TIER -2: Dedeler & Nineler (Grandparents) */}
          {(grandFatherPaternal || grandMotherPaternal || grandFatherMaternal || grandMotherMaternal) && (
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                Büyük Dedeler & Nineler
              </span>
              <div className="flex items-center gap-6 sm:gap-12">
                
                {/* Baba Tarafı */}
                {(grandFatherPaternal || grandMotherPaternal) && (
                  <div className="flex items-center gap-3 p-3 bg-stone-200/50 rounded-3xl border border-stone-200/70">
                    {grandFatherPaternal && <NodeCard person={grandFatherPaternal} role="Dede (Baba Tarafı)" />}
                    {grandMotherPaternal && <NodeCard person={grandMotherPaternal} role="Babaanne" />}
                  </div>
                )}

                {/* Anne Tarafı */}
                {(grandFatherMaternal || grandMotherMaternal) && (
                  <div className="flex items-center gap-3 p-3 bg-stone-200/50 rounded-3xl border border-stone-200/70">
                    {grandFatherMaternal && <NodeCard person={grandFatherMaternal} role="Dede (Anne Tarafı)" />}
                    {grandMotherMaternal && <NodeCard person={grandMotherMaternal} role="Anneanne" />}
                  </div>
                )}

              </div>
              <div className="w-[2px] h-6 bg-stone-300" />
            </div>
          )}

          {/* TIER -1: Anne ve Baba (Parents) + Eksik Anne/Baba Ekle Butonları */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-4 sm:gap-8 relative">
              {father ? (
                <NodeCard person={father} role="Baba" />
              ) : (
                <LeafAddCard
                  icon="👨"
                  title="Baba Ekle"
                  subtitle={`${focusPerson.firstName}'in Babası`}
                  colorScheme="blue"
                  onClick={() => triggerQuickAdd(focusPerson, 'FATHER')}
                />
              )}

              <div className="flex items-center">
                <div className="w-4 sm:w-8 h-[2px] bg-stone-300" />
                <Heart className="w-4 h-4 text-rose-400 fill-rose-400 shrink-0" />
                <div className="w-4 sm:w-8 h-[2px] bg-stone-300" />
              </div>

              {mother ? (
                <NodeCard person={mother} role="Anne" />
              ) : (
                <LeafAddCard
                  icon="👩"
                  title="Anne Ekle"
                  subtitle={`${focusPerson.firstName}'in Annesi`}
                  colorScheme="rose"
                  onClick={() => triggerQuickAdd(focusPerson, 'MOTHER')}
                />
              )}
            </div>
            <div className="w-[2px] h-8 bg-stone-300" />
          </div>

          {/* TIER 0: MERKEZ (Focus Person, Spouses, Siblings) + Eş Ekle Yaprağı */}
          <div className="flex items-center gap-4 sm:gap-6 relative">
            
            {/* Kardeşler (Solda) */}
            {siblings.length > 0 && (
              <div className="flex items-center gap-2 mr-2">
                {siblings.slice(0, 3).map(sib => (
                  <NodeCard key={sib.id} person={sib} role="Kardeş" />
                ))}
                {siblings.length > 3 && (
                  <div 
                    onClick={() => onOpenDetails(focusPerson)}
                    className="w-16 h-28 rounded-3xl border-2 border-dashed border-stone-300 bg-white/70 hover:bg-white flex flex-col items-center justify-center p-2 text-center cursor-pointer transition-colors"
                  >
                    <span className="text-xs font-black text-stone-700">+{siblings.length - 3}</span>
                    <span className="text-[10px] text-stone-500 font-bold">Kardeş</span>
                  </div>
                )}
                <div className="w-4 h-[2px] bg-stone-300" />
              </div>
            )}

            {/* SEÇİLİ ODAK KİŞİ (Center Node) */}
            <NodeCard 
              person={focusPerson} 
              role="Merkez Kişi" 
              isFocus={true} 
              subInfo={`${children.length} Çocuk • ${grandchildren.length} Torun`}
            />

            {/* Eş(ler)i ve EŞ EKLE Butonu (Sağda) */}
            <div className="flex items-center gap-3 ml-2">
              <div className="flex items-center">
                <div className="w-3 sm:w-6 h-[2px] bg-amber-400" />
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0 mx-1" />
                <div className="w-3 sm:w-6 h-[2px] bg-amber-400" />
              </div>

              {spouses.map(sp => (
                <NodeCard key={sp.id} person={sp} role="Eş" />
              ))}

              {/* Doğrudan Ağaçta Eş Ekle Yaprağı */}
              <LeafAddCard
                icon="💍"
                title="Eş Ekle"
                subtitle={`${focusPerson.firstName}'e Eş`}
                colorScheme="amber"
                onClick={() => triggerQuickAdd(focusPerson, 'SPOUSE')}
              />
            </div>

          </div>

          {/* TIER +1: Çocuklar */}
          {children.length > 0 && (
            <div className="flex flex-col items-center gap-2">
              <div className="w-[2px] h-8 bg-stone-300" />
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                Çocukları ({children.length})
              </span>

              <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center max-w-5xl">
                {/* Mevcut Çocuklar */}
                {children.map(ch => {
                  const chGrandchildren = (ch.childrenIds || []).length;
                  return (
                    <NodeCard 
                      key={ch.id} 
                      person={ch} 
                      role={ch.gender === 'male' ? 'Oğul' : 'Kız'} 
                      subInfo={chGrandchildren > 0 ? `${chGrandchildren} Çocuk` : null}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* TIER +2: Torunlar (Grandchildren) */}
          {showGrandchildren && grandchildren.length > 0 && (
            <div className="flex flex-col items-center gap-2">
              <div className="w-[2px] h-8 bg-stone-300" />
              <div className="flex items-center gap-2">
                <Baby className="w-4 h-4 text-amber-600" />
                <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">
                  Torunları ({grandchildren.length})
                </span>
              </div>
              <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap justify-center max-w-5xl">
                {grandchildren.map(({ person, parent }) => (
                  <NodeCard 
                    key={person.id} 
                    person={person} 
                    role={person.gender === 'male' ? 'Erkek Torun' : 'Kız Torun'} 
                    subInfo={`${parent.firstName}'in çocuğu`}
                  />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
