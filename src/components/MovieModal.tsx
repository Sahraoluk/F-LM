import React from 'react';
import { Movie } from '../data/movies';
import { X, Star, User, Film, Tag } from 'lucide-react';

interface MovieModalProps {
  movie: Movie | null;
  onClose: () => void;
  similarityScore?: number;
  matchPercentage?: number;
  matchingTokens?: string[];
}

export const MovieModal: React.FC<MovieModalProps> = ({
  movie,
  onClose,
  similarityScore,
  matchPercentage,
  matchingTokens
}) => {
  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-[#130406] border border-red-900/60 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Üst Kapatma Butonu */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[#1b0509]/80 hover:bg-[#2b080f] text-stone-300 hover:text-white transition cursor-pointer"
          aria-label="Kapat"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Banner / Görsel */}
        <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-[#090203]">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#130406] via-[#130406]/40 to-transparent" />
          
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-600 text-white">
                  {movie.year}
                </span>
                <span className="text-xs text-stone-300 italic">
                  {movie.originalTitle}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow">
                {movie.title}
              </h2>
            </div>

            {matchPercentage !== undefined && (
              <div className="bg-red-600/20 border border-red-600/40 px-3 py-1.5 rounded-xl backdrop-blur-md text-right">
                <div className="text-[10px] uppercase font-bold text-red-300">NLP Eşleşme</div>
                <div className="text-xl font-black text-red-300 font-mono">
                  %{matchPercentage}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal İçerik */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          
          {/* Künye Bilgileri */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#0a0204] p-3.5 rounded-xl border border-red-950">
            <div className="flex items-center space-x-2 text-stone-300">
              <User className="w-4 h-4 text-red-400" />
              <div>
                <p className="text-[11px] text-stone-500">Yönetmen</p>
                <p className="font-semibold text-xs text-white">{movie.director}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-stone-300">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <div>
                <p className="text-[11px] text-stone-500">IMDb Puanı</p>
                <p className="font-semibold text-xs text-white">{movie.imdbScore} / 10</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-stone-300 col-span-2 sm:col-span-1">
              <Film className="w-4 h-4 text-rose-400" />
              <div>
                <p className="text-[11px] text-stone-500">Türler</p>
                <p className="font-semibold text-xs text-white">{movie.genres.join(', ')}</p>
              </div>
            </div>
          </div>

          {/* Konu Özeti */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
              Türkçe Konu Özeti (NLP Metni)
            </h4>
            <p className="text-stone-200 leading-relaxed bg-[#0a0204] p-4 rounded-xl border border-red-950/80">
              {movie.overview}
            </p>
          </div>

          {/* NLP Eşleşme Ayrımı */}
          {matchingTokens && matchingTokens.length > 0 && (
            <div className="bg-[#1b0509]/80 border border-red-900/50 p-4 rounded-xl">
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-300 mb-2 flex items-center justify-between">
                <span>Sorgunuzla Örtüşen Anahtar Kelimeler (Gensim BoW)</span>
                {similarityScore !== undefined && (
                  <span className="font-mono text-[11px] text-red-300 font-normal">
                    Kosinüs Skoru: {similarityScore}
                  </span>
                )}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {matchingTokens.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md bg-red-950/80 text-red-200 border border-red-800/80 text-xs font-mono font-semibold"
                  >
                    ✓ {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Etiketler */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 flex items-center space-x-1">
              <Tag className="w-3.5 h-3.5 text-red-400" />
              <span>Karakteristik Etiketler</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {movie.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs bg-[#1a0509] text-stone-300 border border-red-900/30"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Alt Kısım */}
        <div className="p-4 bg-[#0a0204] border-t border-red-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#1c060b] hover:bg-[#28080f] text-white font-medium text-xs border border-red-900/40 transition cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
