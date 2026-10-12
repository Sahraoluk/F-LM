import React, { useState } from 'react';
import { Header, ActiveTab } from './components/Header';
import { LiveRecommender } from './components/LiveRecommender';
import { NlpVisualizer } from './components/NlpVisualizer';
import { CodeExplorer } from './components/CodeExplorer';
import { DeployGuide } from './components/DeployGuide';
import { MovieCatalog } from './components/MovieCatalog';
import { nlpEngine } from './services/nlpEngine';
import { Film, Terminal, BookOpen, Heart, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('recommender');

  const moviesCount = nlpEngine.getMoviesCount();
  const vocabCount = nlpEngine.getVocabularySize();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#140407] via-[#0d0305] to-[#070102] text-stone-100 flex flex-col font-sans selection:bg-red-600/40 selection:text-red-100 relative overflow-x-hidden">
      {/* Arka Plan Kırmızı Ambiyans Parıltıları */}
      <div className="fixed top-0 left-1/3 w-[600px] h-[350px] bg-red-600/8 blur-[140px] pointer-events-none rounded-full" />
      <div className="fixed bottom-10 right-10 w-[500px] h-[300px] bg-rose-700/6 blur-[130px] pointer-events-none rounded-full" />
      
      {/* Üst Navigasyon & Başlık */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        moviesCount={moviesCount}
        vocabCount={vocabCount}
      />

      {/* Ana Gövde */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 relative z-10">
        {activeTab === 'recommender' && <LiveRecommender />}
        {activeTab === 'nlp_lab' && <NlpVisualizer />}
        {activeTab === 'python_code' && <CodeExplorer />}
        {activeTab === 'deploy_guide' && <DeployGuide />}
        {activeTab === 'catalog' && <MovieCatalog />}
      </main>

      {/* Alt Footer */}
      <footer className="border-t border-red-950/70 bg-[#0c0305]/90 backdrop-blur-md py-8 text-xs text-stone-400 mt-auto relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50"></span>
            <span className="font-bold text-white tracking-wide">CineNLP</span>
            <span className="text-stone-400">&bull; Doğal Dil İşleme Dersi Proje Ödevi</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-stone-300">
            <button
              onClick={() => setActiveTab('python_code')}
              className="hover:text-red-400 transition cursor-pointer flex items-center space-x-1"
            >
              <Terminal className="w-3.5 h-3.5 text-red-500" />
              <span>Python Dosyaları</span>
            </button>
            <button
              onClick={() => setActiveTab('deploy_guide')}
              className="hover:text-red-400 transition cursor-pointer flex items-center space-x-1"
            >
              <BookOpen className="w-3.5 h-3.5 text-rose-500" />
              <span>Render Rehberi</span>
            </button>
            <span className="text-red-950">|</span>
            <span className="text-stone-400 font-mono text-[11px]">Gensim 4.3 &bull; Flask 3.0 &bull; TF-IDF &bull; Cosine Similarity</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
