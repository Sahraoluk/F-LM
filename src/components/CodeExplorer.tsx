import React, { useState } from 'react';
import { PROJECT_FILES, ProjectFile } from '../data/pythonProjectFiles';
import { 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  FolderTree, 
  Terminal, 
  FileText, 
  FileJson
} from 'lucide-react';

export const CodeExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [downloadAllStatus, setDownloadAllStatus] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = (file: ProjectFile) => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    setDownloadAllStatus('Dosyalar indiriliyor...');
    PROJECT_FILES.forEach((f, idx) => {
      setTimeout(() => {
        downloadFile(f);
      }, idx * 250);
    });
    setTimeout(() => {
      setDownloadAllStatus('Tüm dosyalar başarıyla indirildi!');
      setTimeout(() => setDownloadAllStatus(null), 3000);
    }, PROJECT_FILES.length * 250 + 500);
  };

  const getFileIcon = (lang: string) => {
    switch (lang) {
      case 'python': return <FileCode className="w-4 h-4 text-red-400" />;
      case 'json': return <FileJson className="w-4 h-4 text-rose-400" />;
      case 'html': return <FileCode className="w-4 h-4 text-red-300" />;
      default: return <FileText className="w-4 h-4 text-stone-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      
      {/* Üst Bilgilendirme */}
      <div className="rounded-3xl bg-gradient-to-b from-[#1b0509] via-[#130407] to-[#0c0305] border border-red-950/80 p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-600/15 text-red-300 border border-red-600/30">
            <Terminal className="w-3.5 h-3.5 text-red-400" />
            <span>Eksiksiz Python / Flask & Gensim Proje Paketi</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Doğrudan Kopyalayıp Çalıştırabileceğiniz Kod Dosyaları
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
            Aşağıdaki tüm dosyalar üniversite ödeviniz veya sunumunuz için eksiksiz, üretime hazır ve test edilmiş haldedir. Dosyaları tek tıkla kopyalayabilir veya doğrudan bilgisayarınıza indirebilirsiniz.
          </p>
        </div>

        {/* Tümünü İndir Butonu */}
        <div className="flex-shrink-0">
          <button
            onClick={handleDownloadAll}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 font-bold text-white text-xs sm:text-sm transition flex items-center justify-center space-x-2 shadow-lg shadow-red-700/30 cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Tüm Proje Dosyalarını İndir (.py, .html, .json)</span>
          </button>
          {downloadAllStatus && (
            <p className="text-[11px] text-red-300 text-center mt-2 font-mono">
              {downloadAllStatus}
            </p>
          )}
        </div>
      </div>

      {/* Kod Gezgini IDE Düzeni */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Sol Panel: Dosya Ağacı */}
        <div className="lg:col-span-4 bg-[#130406]/90 border border-red-950/80 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-red-950 text-xs">
            <span className="font-bold text-stone-300 flex items-center space-x-2">
              <FolderTree className="w-4 h-4 text-red-400" />
              <span>Proje Dosya Ağacı</span>
            </span>
            <span className="text-[11px] font-mono text-stone-500">
              {PROJECT_FILES.length} Dosya
            </span>
          </div>

          <div className="space-y-1.5">
            {PROJECT_FILES.map((f) => {
              const isSelected = selectedFile.filename === f.filename;
              return (
                <button
                  key={f.filename}
                  onClick={() => setSelectedFile(f)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-red-600/20 text-red-200 border border-red-600/40 font-semibold'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-[#1e060b]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    {getFileIcon(f.language)}
                    <span className="truncate">{f.path}</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase text-stone-500">
                    {f.language}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Klasör Rehberi Bilgisi */}
          <div className="pt-3 border-t border-red-950 text-[11px] text-stone-400 space-y-1">
            <p className="font-semibold text-stone-300">Önemli Klasör Notu:</p>
            <p>
              • <code className="text-red-300 font-mono">movies.json</code> dosyası <code className="text-red-300 font-mono">data/</code> klasöründe olmalıdır.
            </p>
            <p>
              • <code className="text-rose-300 font-mono">index.html</code> dosyası <code className="text-rose-300 font-mono">templates/</code> klasöründe olmalıdır.
            </p>
          </div>
        </div>

        {/* Sağ Panel: Kod Önizleme ve Kopyalama */}
        <div className="lg:col-span-8 bg-[#0a0204] border border-red-950/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          
          {/* Dosya Başlık Çubuğu */}
          <div className="bg-[#140407] px-4 py-3 border-b border-red-950 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              {getFileIcon(selectedFile.language)}
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white font-mono">
                  {selectedFile.path}
                </h3>
                <p className="text-[11px] text-stone-400">
                  {selectedFile.description}
                </p>
              </div>
            </div>

            {/* Butonlar */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => downloadFile(selectedFile)}
                className="px-3 py-1.5 rounded-lg bg-[#1f060b] hover:bg-[#2c0910] text-stone-300 hover:text-white text-xs font-medium border border-red-900/30 transition flex items-center space-x-1.5 cursor-pointer"
                title="Bu dosyayı indir"
              >
                <Download className="w-3.5 h-3.5" />
                <span>İndir</span>
              </button>

              <button
                onClick={handleCopy}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-red-600 hover:bg-red-500 text-white'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Kopyalandı!' : 'Kodu Kopyala'}</span>
              </button>
            </div>
          </div>

          {/* Kod İçeriği */}
          <div className="p-4 overflow-x-auto max-h-[600px] overflow-y-auto font-mono text-xs text-stone-200 leading-relaxed bg-[#0a0204]">
            <pre>
              <code>{selectedFile.content}</code>
            </pre>
          </div>

        </div>

      </div>

    </div>
  );
};
