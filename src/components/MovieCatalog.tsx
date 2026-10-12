import React, { useState, useMemo } from 'react';
import { MOVIES_DATASET, Movie } from '../data/movies';
import { MovieModal } from './MovieModal';
import { Database, Search, ExternalLink } from 'lucide-react';

export const MovieCatalog: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Tümü');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const genres = useMemo(() => {
    const set = new Set<string>();
    MOVIES_DATASET.forEach(m => m.genres.forEach(g => set.add(g)));
    return ['Tümü', ...Array.from(set).sort()];
  }, []);

  const filteredMovies = useMemo(() => {
    return MOVIES_DATASET.filter(m => {
      const matchesGenre = selectedGenre === 'Tümü' || m.genres.includes(selectedGenre);
      const matchesSearch = 
        searchTerm.trim() === '' ||
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.originalTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.director.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.overview.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesGenre && matchesSearch;
    });
  }, [searchTerm, selectedGenre]);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      
      {/* Üst Bilgi Kartı */}
      <div className="rounded-3xl bg-gradient-to-b from-[#1b0509] via-[#130407] to-[#0c0305] border border-red-950/80 p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-600/15 text-red-300 border border-red-600/30">
            <Database className="w-3.5 h-3.5 text-red-400" />
            <span>Veri Seti Kataloğu</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            40 Popüler Film & Konu Özeti Koleksiyonu
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
            Bilim kurgu, psikolojik gerilim, suç, dram, animasyon ve fantastik türlerinden özenle seçilmiş, zengin anahtar kelimeler içeren Türkçe film özetleri derlemi.
          </p>
        </div>

        <div className="bg-[#0b0305] px-4 py-3 rounded-2xl border border-red-950 text-center">
          <div className="text-2xl font-black text-red-400 font-mono">
            {filteredMovies.length} / {MOVIES_DATASET.length}
          </div>
          <div className="text-[11px] text-stone-400">Listelenen Film</div>
        </div>
      </div>

      {/* Arama ve Filtreleme */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-[#130406]/90 p-4 rounded-2xl border border-red-950/80">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Film adı, yönetmen, etiket veya özet içinde ara..."
            className="w-full bg-[#0a0204] border border-red-950/90 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-stone-200 placeholder-stone-500 focus:outline-none focus:border-red-600"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-stone-400 font-medium whitespace-nowrap">Tür:</span>
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="bg-[#0a0204] border border-red-950/90 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-red-600"
          >
            {genres.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Film Izgarası */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredMovies.map((m) => (
          <div
            key={m.id}
            onClick={() => setSelectedMovie(m)}
            className="group bg-[#130406]/90 hover:bg-[#1a060a] border border-red-950/80 hover:border-red-900/60 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition flex flex-col justify-between cursor-pointer"
          >
            {/* Afiş Görseli */}
            <div className="relative h-48 w-full overflow-hidden bg-[#0a0204]">
              <img
                src={m.posterUrl}
                alt={m.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#130406] via-transparent to-transparent opacity-80" />
              
              <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-black/75 text-amber-300 backdrop-blur-md">
                ★ {m.imdbScore}
              </div>

              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs text-stone-300">
                <span className="font-semibold text-white">{m.year}</span>
                <span className="text-[11px] italic truncate max-w-[140px] text-right">{m.director}</span>
              </div>
            </div>

            {/* Bilgiler */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="font-bold text-white text-base group-hover:text-red-300 transition truncate">
                  {m.title}
                </h3>
                <p className="text-[11px] text-stone-400 italic truncate mb-2">
                  {m.originalTitle}
                </p>

                <div className="flex flex-wrap gap-1 mb-2.5">
                  {m.genres.slice(0, 2).map((g, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-[#1e060b] text-stone-300 border border-red-900/30">
                      {g}
                    </span>
                  ))}
                  {m.genres.length > 2 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#1e060b]/60 text-stone-400">
                      +{m.genres.length - 2}
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-400 line-clamp-3 leading-relaxed">
                  {m.overview}
                </p>
              </div>

              {/* Alt Etiketler */}
              <div className="pt-2 border-t border-red-950/80 flex items-center justify-between text-[11px]">
                <span className="text-stone-500 font-mono">
                  {m.overview.split(/\s+/).length} Kelime
                </span>
                <span className="text-red-400 flex items-center space-x-1 font-semibold group-hover:translate-x-0.5 transition-transform">
                  <span>İncele</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <MovieModal
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />

    </div>
  );
};
