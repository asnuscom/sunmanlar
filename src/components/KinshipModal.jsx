import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  X, 
  Search, 
  ArrowRight, 
  Users, 
  GitFork, 
  Sparkles, 
  HeartHandshake,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { findKinshipPath } from '../utils/relationshipCalculator';
import { getPersonBranch } from '../utils/branchHelper';

export default function KinshipModal({ 
  isOpen, 
  onClose, 
  persons, 
  personsMap, 
  claimedPerson,
  onSelectPerson 
}) {
  if (!isOpen) return null;

  const [sourcePerson, setSourcePerson] = useState(claimedPerson || persons[0]);
  const [targetPerson, setTargetPerson] = useState(null);

  const [sourceQuery, setSourceQuery] = useState('');
  const [targetQuery, setTargetQuery] = useState('');

  const [isSelectingSource, setIsSelectingSource] = useState(false);
  const [isSelectingTarget, setIsSelectingTarget] = useState(false);

  // If claimedPerson changes and source is not set
  useEffect(() => {
    if (claimedPerson && !sourcePerson) {
      setSourcePerson(claimedPerson);
    }
  }, [claimedPerson]);

  // Filter sources
  const sourceResults = sourceQuery.trim().length >= 2
    ? persons.filter(p => `${p.firstName} ${p.lastName}`.toLowerCase().includes(sourceQuery.toLowerCase())).slice(0, 6)
    : [];

  // Filter targets
  const targetResults = targetQuery.trim().length >= 2
    ? persons.filter(p => `${p.firstName} ${p.lastName}`.toLowerCase().includes(targetQuery.toLowerCase())).slice(0, 6)
    : [];

  // Kinship calculation
  const kinshipResult = (sourcePerson && targetPerson)
    ? findKinshipPath(sourcePerson.id, targetPerson.id, personsMap)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <Compass className="w-4 h-4 text-amber-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Akrabalık Bağı Hesaplayıcı</h3>
              <p className="text-[11px] text-amber-200">"Bu kişi benim neyim olur?" — İki akraba arasındaki soy yolunu keşfedin</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5">
          
          {/* Person Selector Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Person 1 (Kaynak) */}
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  1. Kişi (Başlangıç)
                </span>
                {claimedPerson && sourcePerson?.id === claimedPerson.id && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Siz
                  </span>
                )}
              </div>

              {sourcePerson && !isSelectingSource ? (
                <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-stone-200">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-stone-900 truncate">
                      {sourcePerson.firstName} {sourcePerson.lastName}
                    </div>
                    <div className="text-[10px] text-stone-500">
                      {getPersonBranch(sourcePerson, personsMap)?.name}
                    </div>
                  </div>
                  <button
                    onClick={() => setIsSelectingSource(true)}
                    className="text-[11px] text-amber-700 hover:text-amber-900 font-semibold ml-2 shrink-0"
                  >
                    Değiştir
                  </button>
                </div>
              ) : (
                <div className="space-y-1 relative">
                  <input
                    type="text"
                    placeholder="İsim arayın (örn: Ali)..."
                    value={sourceQuery}
                    onChange={(e) => setSourceQuery(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-stone-300 rounded-xl outline-none focus:border-amber-500"
                    autoFocus
                  />
                  {sourceResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-stone-200 rounded-xl shadow-lg divide-y divide-stone-100 z-20 max-h-44 overflow-y-auto">
                      {sourceResults.map(p => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setSourcePerson(p);
                            setIsSelectingSource(false);
                            setSourceQuery('');
                          }}
                          className="p-2 hover:bg-amber-50 text-xs font-semibold text-stone-800 cursor-pointer flex items-center justify-between"
                        >
                          <span>{p.firstName} {p.lastName}</span>
                          <span className="text-[10px] text-stone-400">
                            {p.birthDate ? p.birthDate.slice(0, 4) : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Person 2 (Hedef) */}
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                2. Kişi (Merak Edilen Akraba)
              </span>

              {targetPerson && !isSelectingTarget ? (
                <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-stone-200">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-stone-900 truncate">
                      {targetPerson.firstName} {targetPerson.lastName}
                    </div>
                    <div className="text-[10px] text-stone-500">
                      {getPersonBranch(targetPerson, personsMap)?.name}
                    </div>
                  </div>
                  <button
                    onClick={() => setIsSelectingTarget(true)}
                    className="text-[11px] text-amber-700 hover:text-amber-900 font-semibold ml-2 shrink-0"
                  >
                    Değiştir
                  </button>
                </div>
              ) : (
                <div className="space-y-1 relative">
                  <input
                    type="text"
                    placeholder="Merak ettiğiniz akrabanın adı..."
                    value={targetQuery}
                    onChange={(e) => setTargetQuery(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-stone-300 rounded-xl outline-none focus:border-amber-500"
                    autoFocus
                  />
                  {targetResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-stone-200 rounded-xl shadow-lg divide-y divide-stone-100 z-20 max-h-44 overflow-y-auto">
                      {targetResults.map(p => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setTargetPerson(p);
                            setIsSelectingTarget(false);
                            setTargetQuery('');
                          }}
                          className="p-2 hover:bg-amber-50 text-xs font-semibold text-stone-800 cursor-pointer flex items-center justify-between"
                        >
                          <span>{p.firstName} {p.lastName}</span>
                          <span className="text-[10px] text-stone-400">
                            {p.birthDate ? p.birthDate.slice(0, 4) : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Quick suggestions if target not selected */}
          {!targetPerson && (
            <div className="p-4 bg-amber-50/70 border border-amber-200/60 rounded-2xl text-center space-y-2">
              <Sparkles className="w-6 h-6 text-amber-600 mx-auto" />
              <h4 className="text-xs font-bold text-amber-950">Akrabanızı Seçin</h4>
              <p className="text-[11px] text-amber-800 max-w-sm mx-auto">
                Yukarıdaki arama kutusuna akrabanızın adını yazarak aralarındaki akrabalık bağı derecesini ve soy yolunu hesaplayın.
              </p>
            </div>
          )}

          {/* Result Card */}
          {kinshipResult && (
            <div className="p-5 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-orange-500/10 rounded-2xl border border-amber-300/80 space-y-4">
              
              <div className="text-center space-y-1">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest bg-amber-100 px-2.5 py-0.5 rounded-full inline-block">
                  {kinshipResult.degree || 'Akrabalık Bağı'}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-stone-900">
                  {kinshipResult.text}
                </h3>
                <p className="text-xs text-stone-600">
                  {kinshipResult.subDescription}
                </p>
              </div>

              {/* Step-by-Step Graph Chain */}
              {kinshipResult.path && kinshipResult.path.length > 0 && (
                <div className="pt-3 border-t border-amber-200/60 space-y-2">
                  <span className="text-[11px] font-bold text-stone-700 block">
                    Akrabalık Zinciri (Soy Yolu):
                  </span>
                  
                  <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto py-1">
                    {/* Source Node */}
                    <div className="px-2.5 py-1 bg-white rounded-xl border border-amber-300 shadow-2xs text-xs font-bold text-stone-900">
                      {sourcePerson.firstName}
                    </div>

                    {/* Intermediate Nodes */}
                    {kinshipResult.path.map((step, idx) => {
                      const person = personsMap[step.id];
                      return (
                        <React.Fragment key={idx}>
                          <div className="flex items-center gap-0.5 text-amber-700 text-[10px] font-bold bg-amber-100/80 px-2 py-0.5 rounded-md">
                            <span>{step.text}</span>
                            <ChevronRight className="w-3 h-3 text-amber-600" />
                          </div>
                          <div className={`px-2.5 py-1 rounded-xl border text-xs font-bold ${
                            idx === kinshipResult.path.length - 1
                              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                              : 'bg-white text-stone-900 border-stone-200'
                          }`}>
                            {person ? person.firstName : 'Akraba'}
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Navigation Action Buttons */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onSelectPerson(targetPerson);
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 flex items-center gap-1.5 transition-colors"
                >
                  <GitFork className="w-3.5 h-3.5" />
                  <span>Ağaçta {targetPerson.firstName}'e Odaklan</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
