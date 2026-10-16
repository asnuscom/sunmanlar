import React, { useState, useMemo } from 'react';
import { 
  Search, 
  User, 
  ChevronRight, 
  GitFork, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  SortAsc, 
  Filter,
  Sparkles
} from 'lucide-react';
import { getPersonBranch, getPersonGeneration, BRANCH_DEFINITIONS } from '../../utils/branchHelper';

const TURKISH_ALPHABET = ['TÜMÜ', 'A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'H', 'I', 'İ', 'K', 'L', 'M', 'N', 'O', 'Ö', 'P', 'R', 'S', 'Ş', 'T', 'U', 'Ü', 'V', 'Y', 'Z'];

export default function ListViewer({ persons, onSelectPerson, onOpenDetails, personsMap = {} }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [groupMode, setGroupMode] = useState('alphabetical'); // alphabetical, generation, flat
  const [selectedLetter, setSelectedLetter] = useState('TÜMÜ');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [openGenerations, setOpenGenerations] = useState({ 1: true, 2: true, 3: true });

  // Filtered persons
  const filteredPersons = useMemo(() => {
    return persons.filter(p => {
      // Search
      const searchMatch = !searchTerm || 
        `${p.firstName} ${p.lastName} ${p.maidenName || ''} ${p.nickname || ''}`.toLowerCase().includes(searchTerm.toLowerCase());

      // Letter
      const letterMatch = selectedLetter === 'TÜMÜ' || 
        p.firstName.trim().toLocaleUpperCase('tr-TR').startsWith(selectedLetter);

      // Gender
      const genderMatch = genderFilter === 'ALL' || p.gender === genderFilter;

      // Status
      const statusMatch = statusFilter === 'ALL' || 
        (statusFilter === 'alive' ? !p.deathDate : !!p.deathDate);

      // Branch
      let branchMatch = true;
      if (selectedBranch !== 'ALL') {
        const b = getPersonBranch(p, personsMap);
        branchMatch = b && b.id === selectedBranch;
      }

      return searchMatch && letterMatch && genderMatch && statusMatch && branchMatch;
    });
  }, [persons, searchTerm, selectedLetter, genderFilter, statusFilter, selectedBranch, personsMap]);

  // Alphabetical grouping
  const alphabetGroups = useMemo(() => {
    if (groupMode !== 'alphabetical') return null;
    const groups = {};
    filteredPersons.forEach(p => {
      const letter = p.firstName.trim().charAt(0).toLocaleUpperCase('tr-TR');
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(p);
    });
    return groups;
  }, [filteredPersons, groupMode]);

  // Generation grouping
  const generationGroups = useMemo(() => {
    if (groupMode !== 'generation') return null;
    const groups = {};
    filteredPersons.forEach(p => {
      const gen = getPersonGeneration(p, personsMap);
      if (!groups[gen]) groups[gen] = [];
      groups[gen].push(p);
    });
    return groups;
  }, [filteredPersons, groupMode, personsMap]);

  const toggleGeneration = (gen) => {
    setOpenGenerations(prev => ({
      ...prev,
      [gen]: !prev[gen]
    }));
  };

  const renderPersonRow = (p) => {
    const isAlive = !p.deathDate;
    const branch = getPersonBranch(p, personsMap);
    const gen = getPersonGeneration(p, personsMap);

    return (
      <div
        key={p.id}
        onClick={() => onSelectPerson(p)}
        className="p-3 bg-stone-50/70 hover:bg-amber-50/70 rounded-2xl border border-stone-200/80 hover:border-amber-300 transition-all cursor-pointer flex items-center justify-between group shadow-2xs"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
            p.gender === 'male' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
          }`}>
            {p.firstName[0]}
          </div>

          <div className="min-w-0">
            <div className="text-xs font-bold text-stone-900 truncate group-hover:text-amber-900 flex items-center gap-1.5">
              <span>{p.firstName} {p.lastName}</span>
              {(p.nickname || p.lakap) && (
                <span className="text-[10px] text-amber-700 font-semibold italic">
                  "{p.nickname || p.lakap}"
                </span>
              )}
            </div>
            <div className="text-[11px] text-stone-500 truncate flex items-center gap-1.5 flex-wrap">
              <span>{p.gender === 'male' ? 'Erkek' : 'Kadın'}</span>
              {p.birthDate && <span>• D: {p.birthDate.slice(0, 4)}</span>}
              {p.deathDate && <span>• Ö: {p.deathDate.slice(0, 4)}</span>}
              {branch && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-stone-200/60 text-stone-600 font-medium">
                  {branch.name}
                </span>
              )}
              <span className="text-[9px] text-stone-400 font-medium">
                {gen}. Kuşak
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(p);
            }}
            className="p-1.5 rounded-lg text-stone-400 hover:text-amber-700 hover:bg-white text-xs transition-colors"
            title="Detay Profil"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-4 sm:p-6 space-y-4">
      
      {/* Top Filter & Group Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pb-4 border-b border-stone-100">
        
        {/* Search */}
        <div className="relative w-full lg:w-72">
          <input
            type="text"
            placeholder="İsim, soyisim veya lakap ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-amber-500"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
        </div>

        {/* Group Mode Toggles */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          
          {/* Gruplama */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setGroupMode('alphabetical')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                groupMode === 'alphabetical' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <SortAsc className="w-3 h-3 text-amber-600" />
              <span>Alfabetik</span>
            </button>
            <button
              onClick={() => setGroupMode('generation')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                groupMode === 'generation' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Layers className="w-3 h-3 text-amber-600" />
              <span>Nesil / Kuşak</span>
            </button>
            <button
              onClick={() => setGroupMode('flat')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                groupMode === 'flat' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <span>Düz Liste</span>
            </button>
          </div>

          {/* Sülale Kolu Filtresi */}
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="text-xs bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-2 outline-none font-semibold"
          >
            {BRANCH_DEFINITIONS.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          {/* Cinsiyet */}
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="text-xs bg-stone-50 border border-stone-200 rounded-xl px-2 py-2 outline-none"
          >
            <option value="ALL">Cinsiyet: Tümü</option>
            <option value="male">Erkek</option>
            <option value="female">Kadın</option>
          </select>

          {/* Durum */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-stone-50 border border-stone-200 rounded-xl px-2 py-2 outline-none"
          >
            <option value="ALL">Durum: Tümü</option>
            <option value="alive">Hayatta</option>
            <option value="deceased">Rahmetli</option>
          </select>

          <span className="text-xs font-bold text-stone-600 whitespace-nowrap pl-1">
            {filteredPersons.length} Kişi
          </span>
        </div>
      </div>

      {/* Alphabet Fast Jump Bar (Only in Alphabetical mode) */}
      {groupMode === 'alphabetical' && (
        <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-thin">
          {TURKISH_ALPHABET.map(letter => (
            <button
              key={letter}
              onClick={() => setSelectedLetter(letter)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-colors ${
                selectedLetter === letter
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
            >
              {letter}
            </button>
          ))}
        </div>
      )}

      {/* Content Rendering */}
      <div className="max-h-[72vh] overflow-y-auto pr-1 space-y-4">
        
        {/* Mode 1: Alfabetik Gruplar */}
        {groupMode === 'alphabetical' && alphabetGroups && (
          Object.keys(alphabetGroups).sort().map(letter => (
            <div key={letter} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center">
                  {letter}
                </span>
                <span className="text-xs font-bold text-stone-500">
                  ({alphabetGroups[letter].length} Kişi)
                </span>
                <div className="h-[1px] flex-1 bg-stone-200" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {alphabetGroups[letter].map(renderPersonRow)}
              </div>
            </div>
          ))
        )}

        {/* Mode 2: Nesil / Kuşak Akordeonu */}
        {groupMode === 'generation' && generationGroups && (
          Object.keys(generationGroups).sort((a, b) => Number(a) - Number(b)).map(gen => {
            const list = generationGroups[gen];
            const isOpen = openGenerations[gen] !== false;

            return (
              <div key={gen} className="border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
                <button
                  onClick={() => toggleGeneration(gen)}
                  className="w-full p-3.5 bg-stone-50 hover:bg-amber-50/50 flex items-center justify-between text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-amber-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                      {gen}
                    </span>
                    <div>
                      <h4 className="text-xs font-extrabold text-stone-900">
                        {gen}. Kuşak / Nesil
                        {gen === '1' && ' — Kök Ata (Ali Sunman)'}
                        {gen === '2' && ' — Ana Kollar ve Evlatlar'}
                        {gen === '3' && ' — Torun Kuşağı'}
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        Bu nesilde kayıtlı {list.length} aile bireyi
                      </p>
                    </div>
                  </div>

                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-stone-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-stone-500" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-3 bg-white grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 border-t border-stone-100">
                    {list.map(renderPersonRow)}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Mode 3: Düz Liste (Flat) */}
        {groupMode === 'flat' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {filteredPersons.map(renderPersonRow)}
          </div>
        )}

        {filteredPersons.length === 0 && (
          <div className="text-center py-16 text-stone-400 text-xs italic">
            Arama kriterlerine uygun aile bireyi bulunamadı.
          </div>
        )}

      </div>

    </div>
  );
}
