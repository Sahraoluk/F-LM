import React from 'react';
import { Film, Terminal, BookOpen, Rocket, Database, Cpu } from 'lucide-react';

export type ActiveTab = 'recommender' | 'nlp_lab' | 'python_code' | 'deploy_guide' | 'catalog';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  moviesCount: number;
  vocabCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  moviesCount,
  vocabCount
}) => {
  const tabs = [
    {
      id: 'recommender' as ActiveTab,
      label: 'Canlı Tavsiye Motoru',
      icon: Film,
      badge: 'Canlı Test'
    },
    {
      id: 'nlp_lab' as ActiveTab,
      label: 'NLP & Preprocessing Laboratuvarı',
      icon: Cpu,
      badge: 'Algoritma'
    },
    {
      id: 'python_code' as ActiveTab,
      label: 'Python & Flask Proje Kodları',
      icon: Terminal,
      badge: 'Tam Dosyalar'
    },
    {
      id: 'deploy_guide' as ActiveTab,
      label: 'Kurulum & Deploy Rehberi',
      icon: Rocket,
      badge: 'Render / HF'
    },
    {
      id: 'catalog' as ActiveTab,
      label: 'Veri Seti Kataloğu',
      icon: Database,
      badge: `${moviesCount} Film`
    }
  ];

  return (
    <header className="border-b border-red-950/80 bg-[#120407]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          
          {/* Logo & Başlık */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-800 flex items-center justify-center font-black text-white shadow-lg shadow-red-700/30">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold bg-gradient-to-r from-red-100 via-rose-200 to-red-400 bg-clip-text text-transparent">
                  CineNLP
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-600/20 text-red-300 border border-red-600/30 font-semibold">
                  Gensim + Flask
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Film Konu Özetinden NLP & Kosinüs Benzerliği Tavsiye Motoru
              </p>
            </div>
          </div>

          {/* Model Metrikleri */}
          <div className="flex items-center space-x-2 sm:space-x-3 text-xs">
            <div className="bg-[#1b060a] border border-red-900/40 px-3 py-1.5 rounded-lg flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-stone-400">Veri Seti:</span>
              <strong className="text-white font-mono">{moviesCount} Film</strong>
            </div>
            <div className="bg-[#1b060a] border border-red-900/40 px-3 py-1.5 rounded-lg flex items-center space-x-2">
              <span className="text-stone-400">Sözlük:</span>
              <strong className="text-red-300 font-mono">{vocabCount} Terim</strong>
            </div>
          </div>

        </div>

        {/* Tab Menüsü */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2 pt-1 border-t border-red-950/60 no-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-red-600 text-white font-bold shadow-md shadow-red-700/30'
                    : 'text-stone-300 hover:text-white hover:bg-[#1f060b]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                    isActive
                      ? 'bg-black/30 text-white'
                      : 'bg-[#1b060a] text-stone-400'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
