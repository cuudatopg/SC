"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Music, Disc, PlayCircle, Mic2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FeaturedGridSkeleton from "@/components/skeletons/FeaturedGridSkeleton";
import { usePlayerStore } from "@/stores/usePlayerStore";

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState({ albums: [], songs: [] });
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const navigate = useNavigate();
  
  // Chỉ lấy những gì thực sự sử dụng để tránh lỗi ESLint
  const { setCurrentSong, initializeQueue, currentSong } = usePlayerStore();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      
      setResults(data);

      if (data.songs.length > 0) {
        initializeQueue(data.songs);
      }
    } catch (error) {
      console.error("Lỗi tìm kiếm:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      
      {/* HEADER CỐ ĐỊNH */}
      <header className="flex-none p-6 md:p-10 bg-gradient-to-b from-zinc-900 to-black">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold tracking-tight text-center">Search</h1>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 h-5 w-5" />
            <input 
              className="w-full pl-12 pr-4 h-14 bg-zinc-800 border-none rounded-full text-lg focus:outline-none focus:ring-1 focus:ring-white transition-all text-white placeholder:text-zinc-500"
              placeholder="Find your song, artist or album..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
      </header>

      {/* VÙNG NỘI DUNG CÓ THỂ CUỘN */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-12 pb-24">
        <div className="max-w-6xl mx-auto">
          
          {!hasSearched ? (
            <WelcomeView />
          ) : (
            <Tabs defaultValue="all" className="w-full animate-in fade-in duration-500">
              <div className="sticky top-0 z-20 bg-black/95 backdrop-blur-sm py-4">
                <TabsList className="bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
                  <TabsTrigger value="all" className="px-6">Tất cả</TabsTrigger>
                  <TabsTrigger value="songs" className="px-6">Bài hát</TabsTrigger>
                  <TabsTrigger value="albums" className="px-6">Albums</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="space-y-10 mt-6 outline-none">
                {/* ALBUMS SECTION */}
                <section>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Disc className="text-orange-400 h-6 w-6" /> Albums
                  </h2>
                  
                  {loading ? (
                    <FeaturedGridSkeleton />
                  ) : results.albums.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {results.albums.map((album: any) => (
                        <AlbumItem 
                          key={album._id} 
                          album={album} 
                          onNavigate={() => navigate(`/albums/${album._id}`)} 
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-500 italic">No albums found.</p>
                  )}
                </section>

                {/* SONGS SECTION */}
                <section>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Music className="text-orange-400 h-6 w-6" /> Songs
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {loading ? (
                       <div className="space-y-3">
                         {[1,2,3,4].map(i => <div key={i} className="h-20 bg-zinc-800/50 animate-pulse rounded-md" />)}
                       </div>
                    ) : results.songs.length > 0 ? (
                      results.songs.map((song: any) => (
                        <SongItem 
                          key={song._id} 
                          song={song} 
                          onPlay={() => setCurrentSong(song)}
                          isActive={currentSong?._id === song._id}
                        />
                      ))
                    ) : (
                      <p className="text-zinc-500 italic">No songs found.</p>
                    )}
                  </div>
                </section>
              </TabsContent>

              <TabsContent value="songs" className="mt-6 outline-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {results.songs.map((song: any) => (
                    <SongItem 
                      key={song._id} 
                      song={song} 
                      onPlay={() => setCurrentSong(song)}
                      isActive={currentSong?._id === song._id}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="albums" className="mt-6 outline-none">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.albums.map((album: any) => (
                    <AlbumItem 
                      key={album._id} 
                      album={album} 
                      onNavigate={() => navigate(`/albums/${album._id}`)} 
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  );
}

/* --- SUB-COMPONENTS --- */

const WelcomeView = () => (
  <div className="flex flex-col items-center justify-center h-[50vh] text-zinc-500 space-y-4">
    <div className="p-6 bg-zinc-900 rounded-full">
       <Search className="h-12 w-12 opacity-20" />
    </div>
    <p className="text-lg font-medium tracking-tight">Search for your favorite music</p>
  </div>
);

const AlbumItem = ({ album, onNavigate }: { album: any, onNavigate: () => void }) => (
  <div 
    onClick={onNavigate}
    className="flex items-center bg-zinc-900/40 rounded-md overflow-hidden hover:bg-zinc-800 transition-all group p-2 cursor-pointer border border-transparent hover:border-zinc-700"
  >
    <img src={album.imageUrl} alt={album.title} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded shadow-lg flex-none transition-transform group-hover:scale-105" />
    <div className="ml-4 flex-1 min-w-0">
      <p className="font-bold truncate text-zinc-100 group-hover:text-white">{album.title}</p>
      <p className="text-sm text-zinc-400 truncate">{album.artist}</p>
      <p className="text-[10px] text-orange-400 font-bold mt-1 uppercase tracking-wider">{album.releaseYear}</p>
    </div>
  </div>
);

const SongItem = ({ song, onPlay, isActive }: { song: any, onPlay: () => void, isActive: boolean }) => (
  <div 
    onClick={onPlay}
    className={`group flex items-center p-2 rounded-md transition-all cursor-pointer border border-transparent 
      ${isActive ? "bg-zinc-800 border-zinc-700 shadow-inner" : "hover:bg-zinc-800/60 hover:border-zinc-800"}`}
  >
    <div className="relative h-12 w-12 flex-shrink-0">
      <img src={song.imageUrl} alt={song.title} className="h-full w-full object-cover rounded shadow-sm" />
      <div className={`absolute inset-0 flex items-center justify-center bg-black/40 rounded transition-opacity
        ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
        <PlayCircle className={`h-6 w-6 ${isActive ? "text-orange-400 fill-orange-400/10" : "text-white"}`} />
      </div>
    </div>
    <div className="ml-3 flex-1 min-w-0">
      <p className={`font-semibold truncate ${isActive ? "text-orange-400" : "text-zinc-200"}`}>
        {song.title}
      </p>
      <div className="flex items-center text-xs text-zinc-500 truncate">
        <Mic2 className="h-3 w-3 mr-1" /> {song.artist}
      </div>
    </div>
    {song.mood && (
      <span className="ml-2 px-2 py-0.5 text-[10px] bg-zinc-800 text-zinc-500 rounded-full border border-zinc-700 uppercase font-medium">
        {song.mood[0]}
      </span>
    )}
  </div>
);