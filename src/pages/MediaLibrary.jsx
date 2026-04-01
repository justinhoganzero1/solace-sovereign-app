import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowLeft, Star, Search, Folder, Tag, Download, Trash2, Heart, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedOracle from '../components/oracle/AnimatedOracle';

const faceContent = {
  luma: {
    title: 'Luma Library',
    subtitle: 'Open, review, and reuse media generated inside the Luma creation suite.',
    backLabel: 'Back to Luma',
    backPage: 'VideoEditor',
  },
  library: {
    title: 'Media Library',
    subtitle: 'Open, review, favorite, and manage the assets your tools create without leaving the app.',
    backLabel: 'Back to Home',
    backPage: 'Home',
  },
  solace: {
    title: 'SOLACE Library',
    subtitle: 'Stay inside the SOLACE system while reviewing the media and outputs created across your tools.',
    backLabel: 'Back to SOLACE',
    backPage: 'Home',
  },
};

export default function MediaLibrary() {
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [media, setMedia] = useState([]);
  const [filteredMedia, setFilteredMedia] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('All');
  const [selectedTag, setSelectedTag] = useState(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const searchParams = new URLSearchParams(location.search);
  const appFace = searchParams.get('appFace') || 'library';
  const libraryFace = faceContent[appFace] || faceContent.library;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterMedia();
  }, [media, searchQuery, selectedFolder, selectedTag, showFavoritesOnly]);

  const loadData = async () => {
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      if (profiles.length > 0) setProfile(profiles[0]);

      const mediaAssets = await base44.entities.MediaAsset.filter({ created_by: user.email });
      setMedia(mediaAssets);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const filterMedia = () => {
    let filtered = [...media];

    if (showFavoritesOnly) {
      filtered = filtered.filter(m => m.is_favorite);
    }

    if (selectedFolder !== 'All') {
      filtered = filtered.filter(m => m.folder === selectedFolder);
    }

    if (selectedTag) {
      filtered = filtered.filter(m => m.tags?.includes(selectedTag));
    }

    if (searchQuery) {
      filtered = filtered.filter(m => 
        m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredMedia(filtered);
  };

  const toggleFavorite = async (asset) => {
    try {
      await base44.entities.MediaAsset.update(asset.id, {
        is_favorite: !asset.is_favorite
      });
      loadData();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const deleteMedia = async (assetId) => {
    if (!confirm('Delete this media?')) return;
    try {
      await base44.entities.MediaAsset.delete(assetId);
      loadData();
    } catch (error) {
      console.error('Error deleting media:', error);
    }
  };

  const folders = ['All', ...new Set(media.map(m => m.folder || 'Uncategorized'))];
  const allTags = [...new Set(media.flatMap(m => m.tags || []))];

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 z-0 opacity-20">
        <AnimatedOracle gender={profile?.oracle_gender || 'female'} />
      </div>

      {selectedAsset && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm p-4 md:p-8">
          <div className="mx-auto flex h-full max-w-6xl flex-col rounded-3xl border border-white/10 bg-[#0b0b0b] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="text-xl font-semibold text-white">{selectedAsset.title || 'Untitled asset'}</h2>
                <p className="text-sm text-zinc-400">{selectedAsset.tool_used || 'Library asset'}</p>
              </div>
              <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => setSelectedAsset(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid flex-1 gap-6 overflow-hidden p-5 lg:grid-cols-[minmax(0,2fr)_320px]">
              <div className="flex min-h-[320px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black">
                {selectedAsset.media_type === 'video' ? (
                  <video src={selectedAsset.file_url} controls className="max-h-full w-full rounded-2xl object-contain" />
                ) : (
                  <img src={selectedAsset.file_url} alt={selectedAsset.title || 'Library asset'} className="max-h-full w-full rounded-2xl object-contain" />
                )}
              </div>

              <div className="space-y-4 overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-amber-300/80">Asset Details</div>
                  <div className="mt-3 space-y-2 text-sm text-zinc-300">
                    <p><span className="text-zinc-500">Folder:</span> {selectedAsset.folder || 'Uncategorized'}</p>
                    <p><span className="text-zinc-500">Type:</span> {selectedAsset.media_type || 'Unknown'}</p>
                    <p><span className="text-zinc-500">Source:</span> {selectedAsset.tool_used || 'Unknown'}</p>
                  </div>
                </div>

                {selectedAsset.description && (
                  <div>
                    <div className="text-xs uppercase tracking-[0.3em] text-amber-300/80">Description</div>
                    <p className="mt-2 text-sm leading-6 text-zinc-300">{selectedAsset.description}</p>
                  </div>
                )}

                {selectedAsset.tags?.length > 0 && (
                  <div>
                    <div className="text-xs uppercase tracking-[0.3em] text-amber-300/80">Tags</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedAsset.tags.map(tag => (
                        <span key={tag} className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3 pt-2">
                  <a href={selectedAsset.file_url} download className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 text-sm font-medium text-black">
                    Download asset
                  </a>
                  <Button type="button" variant="outline" className="border-white/15 text-white hover:bg-white/10" onClick={() => setSelectedAsset(null)}>
                    Back to library
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl(libraryFace.backPage, { appFace, from: 'MediaLibrary' })}>
                <Button variant="ghost" className="text-white hover:bg-white/20">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  {libraryFace.backLabel}
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl font-bold text-white">{libraryFace.title}</h1>
                <p className="mt-1 text-sm text-zinc-400">{libraryFace.subtitle}</p>
              </div>
            </div>
            
            <Button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={showFavoritesOnly ? 'bg-pink-600' : 'bg-white/10'}
            >
              <Heart className="w-4 h-4 mr-2" />
              {showFavoritesOnly ? 'Show All' : 'Favorites'}
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-white mb-2">
                  <Search className="w-4 h-4" />
                  <span className="text-sm font-semibold">Search</span>
                </div>
                <Input
                  placeholder="Search media..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/20 border-white/30 text-white"
                />
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-white mb-2">
                  <Folder className="w-4 h-4" />
                  <span className="text-sm font-semibold">Folders</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {folders.map(folder => (
                    <button
                      key={folder}
                      onClick={() => setSelectedFolder(folder)}
                      className={`px-3 py-1 rounded-lg text-sm transition-all ${
                        selectedFolder === folder
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      {folder}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-white mb-2">
                  <Tag className="w-4 h-4" />
                  <span className="text-sm font-semibold">Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                      className={`px-2 py-1 rounded-lg text-xs transition-all ${
                        selectedTag === tag
                          ? 'bg-cyan-600 text-white'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Media Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {filteredMedia.map((asset) => (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className="bg-white/10 border-white/20 overflow-hidden group">
                    <div className="relative aspect-video bg-black">
                      {asset.media_type === 'video' ? (
                        <video src={asset.file_url} className="w-full h-full object-cover" />
                      ) : (
                        <img src={asset.file_url} alt={asset.title} className="w-full h-full object-cover" />
                      )}
                      
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => toggleFavorite(asset)}
                          className="p-2 bg-white/20 rounded-lg hover:bg-white/30"
                        >
                          <Star className={`w-5 h-5 ${asset.is_favorite ? 'text-yellow-400 fill-yellow-400' : 'text-white'}`} />
                        </button>
                        <button
                          onClick={() => setSelectedAsset(asset)}
                          className="p-2 bg-white/20 rounded-lg hover:bg-white/30"
                        >
                          <Eye className="w-5 h-5 text-white" />
                        </button>
                        <a
                          href={asset.file_url}
                          download
                          className="p-2 bg-white/20 rounded-lg hover:bg-white/30"
                        >
                          <Download className="w-5 h-5 text-white" />
                        </a>
                        <button
                          onClick={() => deleteMedia(asset.id)}
                          className="p-2 bg-red-600/80 rounded-lg hover:bg-red-600"
                        >
                          <Trash2 className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    </div>
                    
                    <CardContent className="p-3">
                      <p className="text-white text-sm font-semibold truncate">
                        {asset.title || 'Untitled'}
                      </p>
                      <p className="text-white/60 text-xs truncate">
                        {asset.tool_used || 'Unknown'}
                      </p>
                      <button
                        type="button"
                        onClick={() => setSelectedAsset(asset)}
                        className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-amber-300 transition hover:text-amber-200"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Open inside library
                      </button>
                      {asset.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {asset.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-cyan-600/30 text-cyan-300 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredMedia.length === 0 && (
            <div className="text-center py-16">
              <p className="text-white/60 text-lg">No media found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}