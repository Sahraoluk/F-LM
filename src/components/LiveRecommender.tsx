import React, { useState, useMemo } from 'react';
import { nlpEngine, RecommendationResult } from '../services/nlpEngine';
import { Movie } from '../data/movies';
import { MovieModal } from './MovieModal';
import { 
  Search, 
  Sparkles, 
  SlidersHorizontal, 
  Star, 
  ExternalLink, 
  CheckCircle2, 
  RotateCcw,
  LayoutGrid,
  ListFilter,
  Info
} from 'lucide-react';

export const LiveRecommender: React.FC = () => {
  const [query, setQuery] = useState('Uzayda kara delik, solucan deliği ve zaman yolculuğu içeren astronot hikayesi');
  const [topK, setTopK] = useState(5);
  const [selectedGenre, setSelectedGenre] = useState('Tümü');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedMovieStats, setSelectedMovieStats] = useState<{
    similarity?: number;
    matchPercentage?: number;
    matchingTokens?: string[];
  }>({});
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const genres = useMemo(() => ['Tümü', ...nlpEngine.getAllGenres()], []);

  // Compute live recommendations
  const results = useMemo(() => {
    if (!query.trim()) return [];
    return nlpEngine.recommend(query, topK, selectedGenre);
  }, [query, topK, selectedGenre]);

  const quickPrompts = [
    {
      label: '🚀 Uzay & Zaman',
      text: 'Kara delik, uzayda kaybolma, solucan deliği ve zaman genişlemesi yaşayan astronotlar'
    },
    {
      label: '🧠 Psikolojik & Ters Köşe',
      text: 'Akıl hastanesinde geçen cinayet soruşturması, hafıza kaybı, halüsinasyon ve ters köşe final'
    },
    {
      label: '🔫 Mafya & Suç Ailesi',
      text: 'New York suç ailesi, babasını koruyan oğul, organize mafya, ihanet ve intikam'
    },
    {
      label: '🌀 Bilinçaltı & Rüyalar',
      text: 'Rüya içinde rüya mimarisi, zihin bilinçaltı hırsızlığı ve gerçeklik algısının bulanıklaşması'
    },
    {
      label: '🤖 Yapay Zeka & Bilinç',
      text: 'Münzevi CEO nun evinde kadın insansı robot üzerinde yapılan Turing testi ve manipülasyon'
    },
    {
      label: '🧙 Büyü & Cadılık Okulu',
      text: 'Büyücülük okuluna kabul edilen yetim çocuk, cadılar, asâlar, sihirli yaratıklar ve dostluk'
    }
  ];

  const handleOpenModal = (item: RecommendationResult) => {
    setSelectedMovie(item.movie);
    setSelectedMovieStats({
      similarity: item.similarity,
      matchPercentage: item.matchPercentage,
      matchingTokens: item.matchingTokens
    });
  };

  // Helper to highlight matching words in summary text
  const renderHighlightedOverview = (text: string, matchingTokens: string[]) => {
    if (!matchingTokens || matchingTokens.length === 0) {
      return text;
    }
    
    // Create token match regex
    const escaped = matchingTokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, i) => {
          const isMatch = matchingTokens.some(
            t => t.toLowerCase() === part.toLowerCase()
          );
          if (isMatch) {
            return (
              <mark
                key={i}
                className="bg-red-600/35 text-red-200 px-1 py-0.5 rounded font-semibold"
              >
                {part}
              </mark>
            );
          }
          return part;
        })}
      </>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Tanıtım & Arama Alanı */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#1b0509] via-[#130407] to-[#0c0305] border border-red-950/80 p-6 sm:p-8 shadow-2xl overflow-hidden">
        
        {/* Arka Plan Kırmızı Işık Efekti */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-rose-700/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-600/15 text-red-300 border border-red-600/30">
            <Sparkles className="w-3.5 h-3.5 text-red-400" />
            <span>Gensim TF-IDF & Kosinüs Benzerliği Canlı Test Motoru</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Film Konu Özetini veya Ruh Halini Yaz,<br />
            <span className="bg-gradient-to-r from-red-100 via-rose-200 to-red-400 bg-clip-text text-transparent">
              NLP Motoru En Benzer Filmleri Eşleştirsin
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 max-w-2xl mx-auto">
            Metniniz Türkçe ön işleme (küçük harf, noktalama temizliği, stop-words filtreleme) adımlarından geçirilerek TF-IDF vektörüne dönüştürülür ve 40 filmin özetleriyle kosinüs matris çarpımı yapılır.
          </p>
        </div>

        {/* Form & Textarea */}
        <div className="relative z-10 max-w-4xl mx-auto mt-6 space-y-4">
          <div className="relative bg-[#0c0305] rounded-2xl border border-red-950/90 focus-within:border-red-600 focus-within:ring-2 focus-within:ring-red-600/20 transition shadow-inner">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={3}
              placeholder="Örn: Akıl hastanesinde geçen ters köşe bir dedektif soruşturması, travmatik sırlar ve ada atmosferi..."
              className="w-full bg-transparent px-4 py-3.5 text-stone-100 placeholder-stone-500 text-sm focus:outline-none resize-none leading-relaxed"
            />
            
            <div className="flex items-center justify-between px-4 py-2 border-t border-red-950/80 bg-[#140407]/60 rounded-b-2xl">
              <span className="text-[11px] text-stone-500 font-mono">
                {query.length} karakter &bull; {query.trim() ? query.trim().split(/\s+/).length : 0} kelime
              </span>
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="text-xs text-stone-400 hover:text-red-300 flex items-center space-x-1 cursor-pointer transition"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Temizle</span>
                </button>
              )}
            </div>
          </div>

          {/* Hızlı Şablonlar */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-stone-400">Örnek Temalar:</span>
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setQuery(p.text)}
                className="px-3 py-1.5 rounded-xl text-xs bg-[#190509] hover:bg-[#25070d] text-stone-300 hover:text-white border border-red-900/35 transition cursor-pointer active:scale-95"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Filtre ve Kontroller Barı */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-red-950 text-xs">
            
            {/* Tür Filtresi & Sonuç Sayısı */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-red-400" />
                <span className="text-stone-400 font-medium">Tür:</span>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="bg-[#180509] border border-red-900/40 rounded-lg px-2.5 py-1 text-stone-200 focus:outline-none focus:border-red-500"
                >
                  {genres.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-stone-400 font-medium">Öneri Sayısı:</span>
                <select
                  value={topK}
                  onChange={(e) => setTopK(Number(e.target.value))}
                  className="bg-[#180509] border border-red-900/40 rounded-lg px-2.5 py-1 text-stone-200 focus:outline-none focus:border-red-500"
                >
                  <option value={3}>İlk 3 Film</option>
                  <option value={5}>İlk 5 Film</option>
                  <option value={8}>İlk 8 Film</option>
                  <option value={10}>İlk 10 Film</option>
                </select>
              </div>
            </div>

            {/* Görünüm Modu */}
            <div className="flex items-center space-x-1 bg-[#180509] border border-red-950 p-0.5 rounded-lg">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-md transition ${viewMode === 'cards' ? 'bg-red-600 text-white' : 'text-stone-400 hover:text-stone-200'}`}
                title="Kart Görünümü"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition ${viewMode === 'table' ? 'bg-red-600 text-white' : 'text-stone-400 hover:text-stone-200'}`}
                title="Tablo Görünümü"
              >
                <ListFilter className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Sonuçlar Alanı */}
      <div className="space-y-4">
        
        {/* Başlık ve Sonuç İstatistiği */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-base sm:text-lg font-bold text-white">
              Önerilen Filmler
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-red-600/20 text-red-300 border border-red-600/30">
              {results.length} Eşleşme
            </span>
          </div>

          <div className="text-xs text-stone-400 hidden sm:flex items-center space-x-2">
            <Info className="w-3.5 h-3.5 text-red-400/80" />
            <span>Kırmızı vurgulu kelimeler arama metninizle eşleşen Gensim terimleridir.</span>
          </div>
        </div>

        {/* Sonuç Yoksa Durum */}
        {results.length === 0 ? (
          <div className="text-center py-16 bg-[#130406]/60 border border-red-950/80 rounded-3xl p-6">
            <div className="text-5xl mb-4">🔍</div>
            <h4 className="text-base font-bold text-stone-200">
              Girdiğiniz metinle eşleşen film bulunamadı
            </h4>
            <p className="text-xs sm:text-sm text-stone-400 max-w-md mx-auto mt-2">
              Lütfen farklı anahtar kelimeler (örn: "uzay", "mafya", "büyü", "cinayet", "akıl hastanesi", "hafıza") veya yukarıdaki örnek temalardan birini deneyin.
            </p>
          </div>
        ) : viewMode === 'cards' ? (
          
          /* Kart Görünümü */
          <div className="space-y-4">
            {results.map((item, idx) => {
              const m = item.movie;
              const isTop = idx === 0;

              return (
                <div
                  key={m.id}
                  className={`group relative rounded-2xl border transition-all duration-300 p-5 sm:p-6 flex flex-col md:flex-row gap-5 overflow-hidden ${
                    isTop
                      ? 'bg-gradient-to-r from-red-950/35 via-[#180508] to-[#100305] border-red-700/50 shadow-xl shadow-red-950/20'
                      : 'bg-[#130406]/90 hover:bg-[#180508] border-red-950/80 hover:border-red-900/60 shadow-lg'
                  }`}
                >
                  {/* Sıralama Rozeti */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-black shadow-md ${
                      isTop 
                        ? 'bg-red-600 text-white' 
                        : 'bg-[#1e060b] text-stone-300 border border-red-900/40'
                    }`}>
                      #{idx + 1} Öneri
                    </span>
                  </div>

                  {/* Film Afişi */}
                  <div className="w-full md:w-44 h-56 md:h-auto rounded-xl overflow-hidden bg-slate-800 flex-shrink-0 relative group-hover:scale-[1.02] transition-transform duration-300 shadow-md">
                    <img
                      src={m.posterUrl}
                      alt={m.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                    
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] text-white">
                      <span className="font-semibold">{m.year}</span>
                      <span className="flex items-center text-yellow-400 font-bold">
                        ★ {m.imdbScore}
                      </span>
                    </div>
                  </div>

                  {/* Film İçeriği */}
                  <div className="flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      {/* Üst Satır: Başlık ve Skor */}
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-xl font-bold text-white group-hover:text-red-300 transition">
                              {m.title}
                            </h4>
                            <span className="text-xs text-stone-400 font-normal">
                              ({m.year})
                            </span>
                          </div>
                          <p className="text-xs text-stone-400 italic">
                            {m.originalTitle} &bull; Yönetmen: <strong className="text-stone-300 font-normal">{m.director}</strong>
                          </p>
                        </div>

                        {/* NLP Skor Göstergesi */}
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <div className="text-xl font-black text-red-300 font-mono tracking-tight">
                              %{item.matchPercentage}
                            </div>
                            <div className="text-[10px] text-stone-400 font-mono">
                              Kosinüs: {item.similarity}
                            </div>
                          </div>

                          <div className="w-12 h-12 rounded-xl bg-red-600/15 border border-red-600/35 flex items-center justify-center">
                            <div 
                              className="radial-progress text-red-400 font-bold text-xs" 
                              style={{ transform: 'rotate(-90deg)' }}
                            >
                              <CheckCircle2 className="w-5 h-5 text-red-400" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Türler */}
                      <div className="flex flex-wrap gap-1.5 mt-2.5 mb-3">
                        {m.genres.map((g, gIdx) => (
                          <span
                            key={gIdx}
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#1c060b] text-stone-300 border border-red-900/30"
                          >
                            {g}
                          </span>
                        ))}
                      </div>

                      {/* Konu Özeti (Eşleşen Kelimeler Vurgulu) */}
                      <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                        {renderHighlightedOverview(m.overview, item.matchingTokens)}
                      </p>
                    </div>

                    {/* Alt Kısım: Eşleşen Anahtar Terimler & Buton */}
                    <div className="pt-3 border-t border-red-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] text-stone-400 font-semibold">
                          Eşleşen TF-IDF Terimleri:
                        </span>
                        {item.matchingTokens.map((tok, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 text-[11px] font-mono font-medium"
                          >
                            ✓ {tok}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => handleOpenModal(item)}
                        className="self-end sm:self-auto px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#1c060b] hover:bg-[#28080f] text-stone-200 hover:text-white border border-red-900/40 transition flex items-center space-x-1.5 cursor-pointer"
                      >
                        <span>Detayları İncele</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          
          /* Tablo Görünümü */
          <div className="overflow-x-auto rounded-2xl border border-red-950/80 bg-[#130406]/90">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0b0305] text-stone-400 border-b border-red-950 font-mono uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Sıra</th>
                  <th className="py-3 px-4">Film Adı</th>
                  <th className="py-3 px-4">Yıl / Yönetmen</th>
                  <th className="py-3 px-4">Türler</th>
                  <th className="py-3 px-4">Eşleşme</th>
                  <th className="py-3 px-4">Kosinüs Skoru</th>
                  <th className="py-3 px-4">Eşleşen Terimler</th>
                  <th className="py-3 px-4 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-950 text-stone-300">
                {results.map((item, idx) => (
                  <tr key={item.movie.id} className="hover:bg-[#1e060b]/60 transition">
                    <td className="py-3 px-4 font-bold text-red-400">#{idx + 1}</td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {item.movie.title}
                      <span className="block text-[11px] text-stone-400 font-normal italic">
                        {item.movie.originalTitle}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-400">
                      {item.movie.year} &bull; {item.movie.director}
                    </td>
                    <td className="py-3 px-4">
                      {item.movie.genres.join(', ')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full font-bold font-mono text-[11px] bg-red-600/20 text-red-300 border border-red-600/40">
                        %{item.matchPercentage}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-stone-400">
                      {item.similarity}
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-400">
                      {item.matchingTokens.join(', ')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="px-2.5 py-1 rounded bg-[#1e060b] hover:bg-[#2c0910] text-stone-200 border border-red-900/40 font-medium"
                      >
                        İncele
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Film Detay Modalı */}
      <MovieModal
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
        similarityScore={selectedMovieStats.similarity}
        matchPercentage={selectedMovieStats.matchPercentage}
        matchingTokens={selectedMovieStats.matchingTokens}
      />

    </div>
  );
};
