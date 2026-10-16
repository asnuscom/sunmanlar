import React, { useState } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Heart, 
  Send, 
  MessageCircle, 
  Sparkles, 
  Flower2, 
  Bell, 
  CheckCircle,
  X,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function WallFeed({ posts, onAddPost, claimedPerson, onAddComment, onLikePost }) {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openComments, setOpenComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    category: 'anı',
    authorName: claimedPerson ? `${claimedPerson.firstName} ${claimedPerson.lastName}` : ''
  });
  const [postSubmitted, setPostSubmitted] = useState(false);
  const [likedPosts, setLikedPosts] = useState({});

  const categories = [
    { id: 'ALL', label: 'Tüm Mesajlar' },
    { id: 'anı', label: '🕊️ Hatıralar & Anılar' },
    { id: 'duyuru', label: '📢 Aile Duyuruları' },
    { id: 'tebrik', label: '🎉 Kutlama & Tebrik' },
    { id: 'taziye', label: '🤍 Taziye & Dua' },
  ];

  const filteredPosts = posts.filter(post => {
    if (activeCategory === 'ALL') return true;
    return post.category === activeCategory;
  });

  const handleLike = (postId) => {
    const isCurrentlyLiked = !!likedPosts[postId];
    setLikedPosts(prev => ({
      ...prev,
      [postId]: !isCurrentlyLiked
    }));
    const targetPost = posts.find(p => p.id === postId);
    if (targetPost && onLikePost) {
      const currentLikes = targetPost.likes || 0;
      const newCount = isCurrentlyLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;
      onLikePost(postId, newCount);
    }
  };

  const toggleComments = (postId) => {
    setOpenComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleCommentSubmit = (postId, e) => {
    e.preventDefault();
    const commentText = commentInputs[postId]?.trim();
    if (!commentText) return;

    const author = claimedPerson ? `${claimedPerson.firstName} ${claimedPerson.lastName}` : 'Bir Aile Üyesi';

    if (onAddComment) {
      onAddComment(postId, {
        id: `c_${Date.now()}`,
        author,
        text: commentText,
        date: 'Az önce'
      });
    }

    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!postForm.title || !postForm.content) return;

    const newPost = {
      ...postForm,
      id: `post_${Date.now()}`,
      authorName: postForm.authorName || 'Bir Aile Üyesi',
      date: 'Bugün',
      likes: 1,
      comments: []
    };

    if (onAddPost) {
      onAddPost(newPost);
    }

    setPostSubmitted(true);
    setTimeout(() => {
      setPostSubmitted(false);
      setIsModalOpen(false);
      setPostForm({
        title: '',
        content: '',
        category: 'anı',
        authorName: ''
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Wall Header */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-600" />
            Aile Duvarı & Hatırat Defteri
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Akrabalar arası duyurular, büyüklerimizin hatıraları, bayramlaşma ve tebrik mesajları
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Anı / Mesaj Paylaş</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeCategory === cat.id
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {filteredPosts.map(post => {
          const isLiked = !!likedPosts[post.id];
          const totalLikes = (post.likes || 0) + (isLiked ? 1 : 0);
          const comments = post.comments || [];
          const isCommentsOpen = !!openComments[post.id];

          return (
            <div 
              key={post.id}
              className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs hover:border-amber-200 transition-colors space-y-4"
            >
              {/* Post Author & Category Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                    {post.authorName ? post.authorName[0] : 'S'}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-stone-900">{post.authorName}</h4>
                    <span className="text-[10px] text-stone-400">{post.date}</span>
                  </div>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-600 px-2.5 py-1 rounded-full">
                  {post.category === 'duyuru' && '📢 Duyuru'}
                  {post.category === 'anı' && '🕊️ Anı'}
                  {post.category === 'tebrik' && '🎉 Tebrik'}
                  {post.category === 'taziye' && '🤍 Taziye'}
                </span>
              </div>

              {/* Title & Content */}
              <div>
                <h3 className="font-bold text-base text-stone-900 mb-1">{post.title}</h3>
                <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors ${
                    isLiked 
                      ? 'bg-rose-50 text-rose-600' 
                      : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{totalLikes} Beğeni</span>
                </button>

                <button
                  onClick={() => toggleComments(post.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-amber-800 px-3 py-1.5 rounded-xl hover:bg-amber-50/50 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{comments.length} Yorum</span>
                  {isCommentsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Expandable Comments Section */}
              {isCommentsOpen && (
                <div className="pt-3 border-t border-stone-100 space-y-3 bg-stone-50/70 -mx-6 -mb-6 p-5 rounded-b-3xl">
                  {/* Comments List */}
                  {comments.length > 0 && (
                    <div className="space-y-2">
                      {comments.map((c, i) => (
                        <div key={c.id || i} className="p-3 bg-white rounded-xl border border-stone-200/80 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-stone-900">{c.author}</span>
                            <span className="text-[10px] text-stone-400">{c.date || ''}</span>
                          </div>
                          <p className="text-stone-700 leading-relaxed">{c.text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Comment Input */}
                  <form onSubmit={(e) => handleCommentSubmit(post.id, e)} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Bir yorum yazın..."
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                      className="flex-1 text-xs p-2.5 bg-white border border-stone-200 rounded-xl outline-none focus:border-amber-500"
                    />
                    <button
                      type="submit"
                      disabled={!commentInputs[post.id]?.trim()}
                      className="p-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white rounded-xl shadow-xs transition-colors"
                      title="Yorumu Gönder"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* New Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="p-4 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-600" />
                Aile Duvarına Mesaj Bırak
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {postSubmitted ? (
              <div className="p-8 text-center bg-emerald-50 text-emerald-900">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <h4 className="text-base font-bold">Mesajınız Alındı!</h4>
                <p className="text-xs text-emerald-700 mt-1">
                  Paylaşımınız yönetici onayının ardından Aile Duvarı'nda yayınlanacaktır.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    Duvar mesajları aile içi nezaket kurallarını korumak için <strong>admin onayından sonra</strong> yayınlanır.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Adınız & Soyadınız *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Örn: Mehmet Sunman"
                    value={postForm.authorName}
                    onChange={(e) => setPostForm({ ...postForm, authorName: e.target.value })}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Kategori</label>
                  <select
                    value={postForm.category}
                    onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                  >
                    <option value="anı">🕊️ Hatıra & Anı</option>
                    <option value="duyuru">📢 Aile Duyurusu</option>
                    <option value="tebrik">🎉 Doğum Günü & Tebrik</option>
                    <option value="taziye">🤍 Taziye & Dua</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Başlık *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Örn: Ali Dede'nin Unutulmaz Bir Öğüdü"
                    value={postForm.title}
                    onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Mesajınız / Anınız *</label>
                  <textarea 
                    rows="4"
                    required
                    placeholder="Paylaşmak istediğiniz hatıra veya mesajı buraya yazın..."
                    value={postForm.content}
                    onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-amber-500"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Onaya Gönder</span>
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
