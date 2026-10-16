import React, { useState, useMemo, useEffect } from 'react';
import Navbar from './components/Navbar';
import BirthdaysWidget from './components/BirthdaysWidget';
import InteractiveTree from './components/TreeViewer/InteractiveTree';
import ListViewer from './components/TreeViewer/ListViewer';
import PersonModal from './components/PersonModal';
import PhotoGallery from './components/Gallery/PhotoGallery';
import WallFeed from './components/FamilyWall/WallFeed';
import ClaimProfileModal from './components/ClaimProfileModal';
import AddPersonModal from './components/AddPersonModal';
import AdminModal from './components/AdminPanel/AdminModal';
import KinshipModal from './components/KinshipModal';
import MemorialsAndArchiveModal from './components/MemorialsAndArchiveModal';
import TreePosterModal from './components/TreePoster/TreePosterModal';

import familyDataRaw from './data/familyData.json';
import { INITIAL_PHOTOS, INITIAL_WALL_POSTS } from './data/mockPhotosAndPosts';
import { BRANCH_DEFINITIONS } from './utils/branchHelper';
import { 
  getSystemStatus,
  runInAppMigration,
  fetchAllPersonsFromCloud,
  subscribeToPersonDeltas,
  subscribeToPhotos,
  subscribeToWallPosts,
  subscribeToPendingRequests,
  savePendingRequestToCloud,
  deletePendingRequestFromCloud,
  savePhotoToCloud,
  saveWallPostToCloud,
  addCommentToCloud,
  toggleLikeInCloud,
  approvePersonInCloud,
  approveEditInCloud
} from './services/familySyncService';
import { 
  GitFork, 
  List, 
  Camera, 
  MessageSquare, 
  Cake, 
  Users, 
  Sparkles, 
  Compass, 
  Landmark,
  DownloadCloud,
  ShieldCheck,
  UserPlus,
  Cloud,
  FileText
} from 'lucide-react';

export default function App() {
  // Main states
  const [persons, setPersons] = useState(() => {
    const saved = localStorage.getItem('sunmanlar_persons');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return familyDataRaw;
  });

  const [photos, setPhotos] = useState(() => {
    const saved = localStorage.getItem('sunmanlar_photos');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_PHOTOS;
  });

  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem('sunmanlar_posts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_WALL_POSTS;
  });

  const [pendingRequests, setPendingRequests] = useState(() => {
    const saved = localStorage.getItem('sunmanlar_pending');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'req_demo_1',
        type: 'NEW_PERSON',
        personData: {
          firstName: 'Emre',
          lastName: 'SUNMAN',
          gender: 'male',
          birthDate: '1998-04-12',
          fatherName: 'Şevki Sunman',
          motherName: 'Zehra Sunman',
          requesterName: 'Emre Sunman',
          requesterPhone: '0532 111 22 33',
          notes: 'Şevki Sunman\'ın en küçük oğluyum, beni de soyağacına ekler misiniz?'
        }
      }
    ];
  });

  // Cloud Sync & Migration State
  const [syncStatus, setSyncStatus] = useState('syncing'); // 'connected' | 'syncing' | 'offline'
  const [cloudSystemInfo, setCloudSystemInfo] = useState(null);
  const [migrationProgress, setMigrationProgress] = useState(null);

  // Fast ID Lookup Map
  const personsMap = useMemo(() => {
    const map = {};
    persons.forEach(p => {
      map[p.id] = p;
    });
    return map;
  }, [persons]);

  // Selected & Navigation State
  const [focusPerson, setFocusPerson] = useState(() => {
    return persons.find(p => p.id === 'START') || persons[0];
  });
  const [detailModalPerson, setDetailModalPerson] = useState(null);
  const [activeTab, setActiveTab] = useState('tree'); // tree, gallery, wall, special
  const [treeViewMode, setTreeViewMode] = useState('tree'); // tree, list
  const [selectedBranch, setSelectedBranch] = useState('ALL');

  // Claimed Profile ("Ben Kimim?")
  const [claimedPerson, setClaimedPerson] = useState(() => {
    const savedId = localStorage.getItem('sunmanlar_claimed_id');
    return savedId ? personsMap[savedId] : null;
  });

  // Modals
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isKinshipModalOpen, setIsKinshipModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);
  const [posterTargetPerson, setPosterTargetPerson] = useState(null);
  const [photoUploadPreselectedPersonId, setPhotoUploadPreselectedPersonId] = useState(null);
  const [quickAddPrefill, setQuickAddPrefill] = useState(null);

  // PWA Install Prompt State
  const [pwaInstallPrompt, setPwaInstallPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setPwaInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPwa = async () => {
    if (!pwaInstallPrompt) return;
    pwaInstallPrompt.prompt();
    const { outcome } = await pwaInstallPrompt.userChoice;
    if (outcome === 'accepted') {
      setPwaInstallPrompt(null);
    }
  };

  // Real-time Firebase Firestore Listeners
  useEffect(() => {
    let isMounted = true;

    // Check system status & migration flag
    getSystemStatus().then(status => {
      if (!isMounted) return;
      setCloudSystemInfo(status);
      setSyncStatus('connected');
    }).catch(err => {
      console.warn('Bulut bağlantısı kurulamadı:', err);
      if (!isMounted) return;
      setSyncStatus('offline');
    });

    // 1. Photos real-time listener
    const unsubPhotos = subscribeToPhotos((cloudPhotos) => {
      if (cloudPhotos && cloudPhotos.length > 0) {
        setPhotos(cloudPhotos);
      }
    });

    // 2. Wall posts real-time listener
    const unsubPosts = subscribeToWallPosts((cloudPosts) => {
      if (cloudPosts && cloudPosts.length > 0) {
        setPosts(cloudPosts);
      }
    });

    // 3. Pending requests real-time listener
    const unsubRequests = subscribeToPendingRequests((cloudRequests) => {
      if (cloudRequests) {
        setPendingRequests(cloudRequests);
      }
    });

    // 4. Person deltas real-time listener (merge updates across devices)
    const unsubDeltas = subscribeToPersonDeltas((deltaPersons) => {
      setPersons(prev => {
        const deltaMap = new Map(deltaPersons.map(p => [p.id, p]));
        let changed = false;
        const next = prev.map(p => {
          if (deltaMap.has(p.id)) {
            changed = true;
            const updated = deltaMap.get(p.id);
            deltaMap.delete(p.id);
            return { ...p, ...updated };
          }
          return p;
        });
        for (const newP of deltaMap.values()) {
          changed = true;
          next.push(newP);
        }
        return changed ? next : prev;
      });
    });

    return () => {
      isMounted = false;
      if (unsubPhotos) unsubPhotos();
      if (unsubPosts) unsubPosts();
      if (unsubRequests) unsubRequests();
      if (unsubDeltas) unsubDeltas();
    };
  }, []);

  // Persistence helpers
  useEffect(() => {
    localStorage.setItem('sunmanlar_persons', JSON.stringify(persons));
  }, [persons]);

  useEffect(() => {
    localStorage.setItem('sunmanlar_photos', JSON.stringify(photos));
  }, [photos]);

  useEffect(() => {
    localStorage.setItem('sunmanlar_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('sunmanlar_pending', JSON.stringify(pendingRequests));
  }, [pendingRequests]);

  // Handlers
  const handleSelectPerson = (person) => {
    setFocusPerson(person);
    setDetailModalPerson(person);
  };

  const handleClaimRequest = (reqData) => {
    const newReq = { ...reqData, id: `claim_${Date.now()}` };
    setPendingRequests(prev => [newReq, ...prev]);
    savePendingRequestToCloud(newReq).catch(console.warn);
    const person = personsMap[reqData.personId];
    if (person) {
      setClaimedPerson(person);
      localStorage.setItem('sunmanlar_claimed_id', person.id);
    }
  };

  const handleUnclaim = () => {
    setClaimedPerson(null);
    localStorage.removeItem('sunmanlar_claimed_id');
  };

  const handleAddRequest = (reqData) => {
    const newReq = { ...reqData, id: `add_${Date.now()}` };
    setPendingRequests(prev => [newReq, ...prev]);
    savePendingRequestToCloud(newReq).catch(console.warn);
  };

  // Quick addition directly from tree leaves
  const handleQuickAdd = ({ targetPerson, relationType }) => {
    let prefill = {};
    if (relationType === 'CHILD_BOY') {
      prefill = {
        gender: 'male',
        fatherId: targetPerson.gender === 'male' ? targetPerson.id : '',
        fatherName: targetPerson.gender === 'male' ? `${targetPerson.firstName} ${targetPerson.lastName}` : '',
        motherId: targetPerson.gender === 'female' ? targetPerson.id : '',
        motherName: targetPerson.gender === 'female' ? `${targetPerson.firstName} ${targetPerson.lastName}` : '',
        relationLabel: `👦 ${targetPerson.firstName} ${targetPerson.lastName}'e Erkek Çocuk Ekle`
      };
    } else if (relationType === 'CHILD_GIRL') {
      prefill = {
        gender: 'female',
        fatherId: targetPerson.gender === 'male' ? targetPerson.id : '',
        fatherName: targetPerson.gender === 'male' ? `${targetPerson.firstName} ${targetPerson.lastName}` : '',
        motherId: targetPerson.gender === 'female' ? targetPerson.id : '',
        motherName: targetPerson.gender === 'female' ? `${targetPerson.firstName} ${targetPerson.lastName}` : '',
        relationLabel: `👧 ${targetPerson.firstName} ${targetPerson.lastName}'e Kız Çocuk Ekle`
      };
    } else if (relationType === 'SPOUSE') {
      prefill = {
        gender: targetPerson.gender === 'male' ? 'female' : 'male',
        spouseId: targetPerson.id,
        spouseName: `${targetPerson.firstName} ${targetPerson.lastName}`,
        relationLabel: `💍 ${targetPerson.firstName} ${targetPerson.lastName}'e Eş Ekle`
      };
    } else if (relationType === 'FATHER') {
      prefill = {
        gender: 'male',
        childId: targetPerson.id,
        childName: `${targetPerson.firstName} ${targetPerson.lastName}`,
        relationLabel: `👨 ${targetPerson.firstName} ${targetPerson.lastName}'in Babasını Ekle`
      };
    } else if (relationType === 'MOTHER') {
      prefill = {
        gender: 'female',
        childId: targetPerson.id,
        childName: `${targetPerson.firstName} ${targetPerson.lastName}`,
        relationLabel: `👩 ${targetPerson.firstName} ${targetPerson.lastName}'in Annesini Ekle`
      };
    }
    setQuickAddPrefill(prefill);
    setIsAddModalOpen(true);
  };

  const handleUploadPhotoRequest = (photoData) => {
    setPhotos(prev => [photoData, ...prev]);
    savePhotoToCloud(photoData).catch(console.warn);
    const req = {
      id: `photo_req_${Date.now()}`,
      type: 'NEW_PHOTO',
      photoData
    };
    setPendingRequests(prev => [req, ...prev]);
    savePendingRequestToCloud(req).catch(console.warn);
  };

  const handleAddPostRequest = (postData) => {
    setPosts(prev => [postData, ...prev]);
    saveWallPostToCloud(postData).catch(console.warn);
    const req = {
      id: `post_req_${Date.now()}`,
      type: 'NEW_POST',
      postData
    };
    setPendingRequests(prev => [req, ...prev]);
    savePendingRequestToCloud(req).catch(console.warn);
  };

  const handleAddComment = (postId, comment) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...(post.comments || []), comment]
        };
      }
      return post;
    }));
    addCommentToCloud(postId, comment).catch(console.warn);
  };

  const handleLikePost = (postId, newLikeCount) => {
    toggleLikeInCloud(postId, newLikeCount).catch(console.warn);
  };

  const handleRequestEdit = (person, editForm) => {
    const req = {
      id: `edit_${Date.now()}`,
      type: 'EDIT_PERSON',
      personId: person.id,
      personName: `${person.firstName} ${person.lastName}`,
      editForm,
      createdAt: new Date().toISOString()
    };
    setPendingRequests(prev => [req, ...prev]);
    savePendingRequestToCloud(req).catch(console.warn);
  };

  // Admin approval
  const handleApproveRequest = (request) => {
    if (request.type === 'NEW_PERSON') {
      const pData = request.personData;
      const newPersonId = `NEW_${Date.now()}`;
      const newPerson = {
        id: newPersonId,
        firstName: pData.firstName,
        lastName: pData.lastName,
        maidenName: pData.maidenName || '',
        nickname: pData.nickname || '',
        gender: pData.gender || 'male',
        birthDate: pData.birthDate || '',
        birthPlace: pData.birthPlace || '',
        deathDate: '',
        fatherId: pData.fatherId || null,
        motherId: pData.motherId || null,
        spouseIds: pData.spouseId ? [pData.spouseId] : [],
        childrenIds: pData.childId ? [pData.childId] : [],
        verified: true
      };

      const relativesToUpdate = [];

      setPersons(prev => {
        const next = [...prev, newPerson];
        // Connect father
        if (newPerson.fatherId) {
          const father = next.find(p => p.id === newPerson.fatherId);
          if (father && !father.childrenIds.includes(newPersonId)) {
            father.childrenIds.push(newPersonId);
            relativesToUpdate.push({ id: father.id, updates: { childrenIds: father.childrenIds } });
          }
        }
        // Connect mother
        if (newPerson.motherId) {
          const mother = next.find(p => p.id === newPerson.motherId);
          if (mother && !mother.childrenIds.includes(newPersonId)) {
            mother.childrenIds.push(newPersonId);
            relativesToUpdate.push({ id: mother.id, updates: { childrenIds: mother.childrenIds } });
          }
        }
        // Connect spouse
        if (pData.spouseId) {
          const spouse = next.find(p => p.id === pData.spouseId);
          if (spouse && !spouse.spouseIds.includes(newPersonId)) {
            spouse.spouseIds.push(newPersonId);
            relativesToUpdate.push({ id: spouse.id, updates: { spouseIds: spouse.spouseIds } });
          }
        }
        // Connect child (if person added was a parent to a child)
        if (pData.childId) {
          const child = next.find(p => p.id === pData.childId);
          if (child) {
            if (newPerson.gender === 'male') child.fatherId = newPersonId;
            else child.motherId = newPersonId;
            if (!newPerson.childrenIds.includes(pData.childId)) {
              newPerson.childrenIds.push(pData.childId);
            }
            relativesToUpdate.push({
              id: child.id,
              updates: {
                fatherId: child.fatherId,
                motherId: child.motherId
              }
            });
          }
        }
        return next;
      });

      // Bulut senkronizasyonu
      approvePersonInCloud(newPerson, relativesToUpdate, request.id).catch(console.warn);

    } else if (request.type === 'EDIT_PERSON' && request.editForm) {
      const editFields = {
        instagram: request.editForm.instagram || '',
        facebook: request.editForm.facebook || '',
        linkedin: request.editForm.linkedin || '',
        profession: request.editForm.profession || '',
        burialPlace: request.editForm.burialPlace || '',
        nickname: request.editForm.nickname || '',
        bio: request.editForm.bio || '',
        verified: true
      };

      setPersons(prev => prev.map(p => {
        if (p.id === request.personId) {
          return {
            ...p,
            ...editFields
          };
        }
        return p;
      }));

      // Bulut senkronizasyonu
      approveEditInCloud(request.personId, editFields, request.id).catch(console.warn);

    } else if (request.type === 'CLAIM_PROFILE') {
      setPersons(prev => prev.map(p => {
        if (p.id === request.personId) {
          return { ...p, verified: true };
        }
        return p;
      }));

      // Bulut senkronizasyonu
      approveEditInCloud(request.personId, { verified: true }, request.id).catch(console.warn);
    }

    // Remove from pending
    setPendingRequests(prev => prev.filter(r => r.id !== request.id));
  };

  const handleRejectRequest = (request) => {
    setPendingRequests(prev => prev.filter(r => r.id !== request.id));
    deletePendingRequestFromCloud(request.id).catch(console.warn);
  };

  // Cloud Actions (Force Refresh & Migration)
  const handleForceCloudRefresh = async () => {
    setSyncStatus('syncing');
    try {
      const cloudPersons = await fetchAllPersonsFromCloud();
      if (cloudPersons && cloudPersons.length > 0) {
        setPersons(cloudPersons);
        setSyncStatus('connected');
        alert(`✅ Buluttaki ${cloudPersons.length} kişi başarıyla eşitlendi!`);
      }
    } catch (err) {
      alert(`❌ Bulut verisi çekilemedi: ${err.message}`);
      setSyncStatus('offline');
    }
  };

  const handleRunMigration = async () => {
    try {
      setMigrationProgress({ percent: 0, stage: 'Başlatılıyor...' });
      await runInAppMigration(persons, (prog) => {
        setMigrationProgress(prog);
      });
      const updatedStatus = await getSystemStatus();
      setCloudSystemInfo(updatedStatus);
      setTimeout(() => {
        setMigrationProgress(null);
        alert('🎉 1.415 Kişilik soyağacı Firestore bulutuna başarıyla aktarıldı!');
      }, 800);
    } catch (err) {
      setMigrationProgress(null);
      alert(`❌ Migrasyon hatası: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        persons={persons}
        onSelectPerson={handleSelectPerson}
        claimedPerson={claimedPerson}
        onOpenClaimModal={() => setIsClaimModalOpen(true)}
        onOpenAddModal={() => {
          setQuickAddPrefill(null);
          setIsAddModalOpen(true);
        }}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onOpenKinshipModal={() => setIsKinshipModalOpen(true)}
        onOpenArchiveModal={() => setIsArchiveModalOpen(true)}
        pwaInstallPrompt={pwaInstallPrompt}
        onInstallPwa={handleInstallPwa}
        totalPersonsCount={persons.length}
        syncStatus={syncStatus}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 space-y-6">
        
        {/* TAB 1: Soyağacı Görünümü */}
        {activeTab === 'tree' && (
          <div className="space-y-4">
            
            {/* View Mode Toggle & Branch Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-700">Görünüm:</span>
                <div className="flex items-center bg-stone-100 p-1 rounded-xl">
                  <button
                    onClick={() => setTreeViewMode('tree')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      treeViewMode === 'tree' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    <GitFork className="w-3.5 h-3.5" />
                    <span>Şema Ağacı</span>
                  </button>
                  <button
                    onClick={() => setTreeViewMode('list')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      treeViewMode === 'list' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>Rehber / Liste</span>
                  </button>
                </div>
              </div>

              {/* Sülale Dalı Seçici & Hızlı Butonlar */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                <button
                  onClick={() => setIsKinshipModalOpen(true)}
                  className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Compass className="w-3.5 h-3.5 text-amber-700" />
                  <span>Akrabalık Hesapla</span>
                </button>

                <button
                  onClick={() => setIsArchiveModalOpen(true)}
                  className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Landmark className="w-3.5 h-3.5 text-stone-600" />
                  <span>Arşiv & Kabirler</span>
                </button>

                {/* Soyağacı Poster & PDF Çıktı Butonu */}
                <button
                  id="open-poster-modal-btn"
                  onClick={() => {
                    setPosterTargetPerson(focusPerson);
                    setIsPosterModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                  title="Yazdırılabilir Büyük Boy Soyağacı Posteri ve PDF Çıktısı"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Poster & PDF</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-stone-500">Ana Dal:</span>
                  <select
                    value={selectedBranch}
                    onChange={(e) => {
                      setSelectedBranch(e.target.value);
                      const branchPerson = persons.find(p => p.id === e.target.value);
                      if (branchPerson) {
                        setFocusPerson(branchPerson);
                      }
                    }}
                    className="text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 font-bold text-stone-800 outline-none focus:border-amber-500"
                  >
                    <option value="START">Kök Ata: Ali Sunman</option>
                    <option value="HGJ2X">Ali Ağa Kolu</option>
                    <option value="Z141M">Hasan Efendi Kolu</option>
                    <option value="MM62G">Laz Osman Kolu</option>
                    <option value="NIS42">Mehmet Kolu</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tree Component or List Component */}
            {treeViewMode === 'tree' ? (
              <InteractiveTree
                persons={persons}
                personsMap={personsMap}
                focusPerson={focusPerson}
                onSelectPerson={setFocusPerson}
                onOpenDetails={setDetailModalPerson}
                claimedPerson={claimedPerson}
                onResetToRoot={() => {
                  const root = persons.find(p => p.id === 'START') || persons[0];
                  setFocusPerson(root);
                }}
                onQuickAdd={handleQuickAdd}
              />
            ) : (
              <ListViewer
                persons={persons}
                personsMap={personsMap}
                onSelectPerson={setFocusPerson}
                onOpenDetails={setDetailModalPerson}
              />
            )}

            {/* Quick Birthdays Banner in Tree View */}
            <BirthdaysWidget
              persons={persons}
              onSelectPerson={handleSelectPerson}
              onOpenWallForWish={() => setActiveTab('wall')}
            />

          </div>
        )}

        {/* TAB 2: Fotoğraf Köşesi */}
        {activeTab === 'gallery' && (
          <PhotoGallery
            photos={photos}
            personsMap={personsMap}
            persons={persons}
            onSelectPerson={handleSelectPerson}
            onRequestUploadPhoto={handleUploadPhotoRequest}
            initialUploadOpen={!!photoUploadPreselectedPersonId}
            pretaggedPersonId={photoUploadPreselectedPersonId}
            onCloseUpload={() => setPhotoUploadPreselectedPersonId(null)}
          />
        )}

        {/* TAB 3: Aile Duvarı */}
        {activeTab === 'wall' && (
          <WallFeed
            posts={posts}
            onAddPost={handleAddPostRequest}
            claimedPerson={claimedPerson}
            onAddComment={handleAddComment}
            onLikePost={handleLikePost}
          />
        )}

        {/* TAB 4: Özel Günler & Hatıralar */}
        {activeTab === 'special' && (
          <div className="space-y-6">
            <BirthdaysWidget
              persons={persons}
              onSelectPerson={handleSelectPerson}
              onOpenWallForWish={() => setActiveTab('wall')}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-xs text-stone-500 space-y-1">
          <p className="font-semibold text-stone-700">
            © 2026 Sunmanlar Ailesi Portalı — Tüm Hakları Saklıdır
          </p>
          <p className="text-[11px] text-stone-400">
            1.415 Aile Bireyinin Kayıtlı Olduğu Dijital Soyağacı ve Aile Hafızası
          </p>
        </div>
      </footer>

      {/* Modals */}
      <PersonModal
        person={detailModalPerson}
        onClose={() => setDetailModalPerson(null)}
        personsMap={personsMap}
        onSelectPerson={handleSelectPerson}
        claimedPerson={claimedPerson}
        photos={photos}
        onOpenPhoto={() => setActiveTab('gallery')}
        onRequestEdit={handleRequestEdit}
        onOpenPhotoUpload={(personId) => {
          setActiveTab('gallery');
          setPhotoUploadPreselectedPersonId(personId);
        }}
        onOpenPoster={(p) => {
          setPosterTargetPerson(p);
          setIsPosterModalOpen(true);
        }}
      />

      <ClaimProfileModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        persons={persons}
        onClaimRequest={handleClaimRequest}
        currentClaimedPerson={claimedPerson}
        onUnclaim={handleUnclaim}
      />

      <AddPersonModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setQuickAddPrefill(null);
        }}
        persons={persons}
        onAddRequest={handleAddRequest}
        prefillData={quickAddPrefill}
        claimedPerson={claimedPerson}
      />

      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        pendingRequests={pendingRequests}
        onApproveRequest={handleApproveRequest}
        onRejectRequest={handleRejectRequest}
        totalPersonsCount={persons.length}
        allPersons={persons}
        syncStatus={syncStatus}
        cloudSystemInfo={cloudSystemInfo}
        onForceRefresh={handleForceCloudRefresh}
        onRunMigration={handleRunMigration}
        migrationProgress={migrationProgress}
      />

      <KinshipModal
        isOpen={isKinshipModalOpen}
        onClose={() => setIsKinshipModalOpen(false)}
        persons={persons}
        personsMap={personsMap}
        claimedPerson={claimedPerson}
        onSelectPerson={handleSelectPerson}
      />

      <MemorialsAndArchiveModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        onSelectPerson={handleSelectPerson}
        personsMap={personsMap}
      />

      <TreePosterModal
        isOpen={isPosterModalOpen}
        onClose={() => {
          setIsPosterModalOpen(false);
          setPosterTargetPerson(null);
        }}
        persons={persons}
        personsMap={personsMap}
        initialRootPerson={posterTargetPerson || focusPerson}
        claimedPerson={claimedPerson}
      />

    </div>
  );
}
