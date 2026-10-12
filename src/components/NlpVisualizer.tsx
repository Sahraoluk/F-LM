import React, { useState } from 'react';
import { nlpEngine } from '../services/nlpEngine';
import { Cpu, Check, X, BookOpen } from 'lucide-react';

export const NlpVisualizer: React.FC = () => {
  const [inputText, setInputText] = useState('Bu filmde bir astronot ve kızı için uzayda geçen solucan deliği ile zaman yolculuğu anlatılıyor.');

  const breakdown = nlpEngine.inspectPreprocessing(inputText);

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Başlık Alanı */}
      <div className="rounded-3xl bg-gradient-to-b from-[#1b0509] via-[#130407] to-[#0c0305] border border-red-950/80 p-6 sm:p-8">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-600/15 text-red-300 border border-red-600/30">
            <Cpu className="w-3.5 h-3.5 text-red-400" />
            <span>Doğal Dil İşleme (NLP) & Gensim Algoritma Laboratuvarı</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Metin Ön İşleme & Vektörleştirme Adım Adım Nasıl Çalışır?
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
            Gensim ve Doğal Dil İşleme modelleri ham metinleri doğrudan işleyemez. Metinler önce temizlenir, Türkçe stop-words (etkisiz kelimeler) elenir, kelime torbası (BoW) ve TF-IDF ağırlık matrislerine dönüştürülür.
          </p>
        </div>

        {/* Canlı Test Metni Girişi */}
        <div className="mt-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
            Ön İşlemeyi İncelemek İçin Bir Cümle Yazın:
          </label>
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={2}
              className="w-full bg-[#0c0305] border border-red-950/90 rounded-xl px-4 py-3 text-stone-100 text-sm focus:outline-none focus:border-red-600 resize-none font-sans"
              placeholder="Test etmek istediğiniz cümleyi buraya yazın..."
            />
          </div>
        </div>
      </div>

      {/* 5 Aşamalı NLP Pipeline Görselleştirmesi */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Adım 1: Ham Metin */}
        <div className="bg-[#130406]/90 border border-red-950/80 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-red-400">01. GİRDİ METNİ</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-[#1e060b] text-stone-400 font-mono">
                {inputText.length} Karakter
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mb-2">Ham Metin (Raw String)</h4>
            <p className="text-xs text-stone-400 mb-3">Kullanıcının girdiği işlenmemiş metin dizgisi.</p>
            <div className="bg-[#0b0305] p-3 rounded-xl border border-red-950 text-xs text-stone-300 font-mono break-words">
              "{breakdown.rawInput || '(Boş metin)'}"
            </div>
          </div>
        </div>

        {/* Adım 2: Küçük Harf & Noktalama Temizliği */}
        <div className="bg-[#130406]/90 border border-red-950/80 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-rose-400">02. TEMİZLİK & NORMALİZASYON</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-rose-950/60 text-rose-300 font-mono">
                Regex + Türkçe Casing
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mb-2">Küçük Harfe Çevirme & Regex</h4>
            <p className="text-xs text-stone-400 mb-3">Türkçe 'İ/i' ve 'I/ı' harfleri doğru çevrilir, noktalama ve sayılar silinir.</p>
            <div className="bg-[#0b0305] p-3 rounded-xl border border-red-950 text-xs text-rose-200 font-mono break-words">
              {breakdown.loweredCleaned || '(Temizlenmiş metin boş)'}
            </div>
          </div>
        </div>

        {/* Adım 3: Tokenization & Stop-Words */}
        <div className="bg-[#130406]/90 border border-red-950/80 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-red-400">03. STOP-WORDS ELEMESİ</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-red-950/80 text-red-300 font-mono">
                {breakdown.removedStopWords.length} Kelime Silindi
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mb-2">Türkçe Etkisiz Kelimeler</h4>
            <p className="text-xs text-stone-400 mb-3">Anlam taşımayan bağlaç ve edatlar elenir (ve, ile, bu, bir, için vb.).</p>
            <div className="bg-[#0b0305] p-3 rounded-xl border border-red-950 flex flex-wrap gap-1 min-h-[50px]">
              {breakdown.removedStopWords.length > 0 ? (
                breakdown.removedStopWords.map((w, idx) => (
                  <span key={idx} className="px-1.5 py-0.5 rounded bg-red-950/80 border border-red-800/80 text-red-300 text-[11px] font-mono line-through flex items-center space-x-1">
                    <X className="w-2.5 h-2.5" />
                    <span>{w}</span>
                  </span>
                ))
              ) : (
                <span className="text-stone-500 text-xs italic">Elenen stop-word yok.</span>
              )}
            </div>
          </div>
        </div>

        {/* Adım 4: Kalan Ayırt Edici Tokenlar */}
        <div className="bg-[#130406]/90 border border-red-950/80 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-emerald-400">04. AYIRT EDİCİ TOKENLAR</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 font-mono">
                {breakdown.filteredTokens.length} Token Kaldı
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mb-2">Vektör Girdisi Tokenlar</h4>
            <p className="text-xs text-stone-400 mb-3">Modele giren ve TF-IDF ağırlığı hesaplanacak asıl kavramlar.</p>
            <div className="bg-[#0b0305] p-3 rounded-xl border border-red-950 flex flex-wrap gap-1.5 min-h-[50px]">
              {breakdown.filteredTokens.length > 0 ? (
                breakdown.filteredTokens.map((tok, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs font-mono font-semibold flex items-center space-x-1">
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>{tok}</span>
                  </span>
                ))
              ) : (
                <span className="text-stone-500 text-xs italic">Ayırt edici token bulunamadı.</span>
              )}
            </div>
          </div>
        </div>

        {/* Adım 5: TF-IDF & Gensim Vektörü */}
        <div className="bg-[#130406]/90 border border-red-950/80 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-red-300">05. GENSİM TF-IDF</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-red-950 text-red-300 font-mono">
                Vektör Uzayı
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mb-2">TF x IDF Ağırlıklandırma</h4>
            <p className="text-xs text-stone-400 mb-3">Nadir kelimelere yüksek ağırlık (IDF), sık geçenlere düşük ağırlık verilir.</p>
            <div className="bg-[#0b0305] p-3 rounded-xl border border-red-950 text-xs font-mono text-red-200 space-y-1">
              <div>TF = 1 + log(kelime_frekansı)</div>
              <div>IDF = log((N + 1) / (df + 1)) + 1</div>
              <div className="text-stone-400 text-[11px] pt-1 border-t border-red-950">
                N: 40 Film, df: Kelimenin geçtiği film sayısı
              </div>
            </div>
          </div>
        </div>

        {/* Adım 6: Kosinüs Benzerliği Formülü */}
        <div className="bg-[#130406]/90 border border-red-950/80 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-rose-300">06. KOSİNÜS BENZERLİĞİ</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-rose-950/80 text-rose-300 font-mono">
                Cosine Similarity
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mb-2">Açısal Benzerlik (0 ile 1)</h4>
            <p className="text-xs text-stone-400 mb-3">Metin uzunluğundan bağımsız olarak iki vektörün yön benzerliği hesaplanır.</p>
            <div className="bg-[#0b0305] p-3 rounded-xl border border-red-950 text-xs font-mono text-rose-200 text-center py-2">
              <div className="text-sm font-bold mb-1">cos(θ) = (A · B) / (||A|| · ||B||)</div>
              <p className="text-[10px] text-stone-400">
                1.0 = Tam Eşleşme &bull; 0.0 = Ortak Kelime Yok
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Doc2Vec vs TF-IDF Karşılaştırması */}
      <div className="bg-gradient-to-r from-[#1c060a] via-[#140407] to-[#0d0305] border border-red-950/80 rounded-3xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center space-x-3">
          <BookOpen className="w-5 h-5 text-red-400" />
          <h3 className="text-lg sm:text-xl font-bold text-white">
            Üniversite Dersi Notu: Gensim TF-IDF vs. Doc2Vec Karşılaştırması
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs sm:text-sm">
          
          {/* TF-IDF */}
          <div className="bg-[#0c0305]/80 border border-red-950/80 p-5 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-red-300 text-sm">Gensim TF-IDF (Bu Projede Kullanılan)</h4>
              <span className="px-2 py-0.5 rounded text-[10px] bg-red-600/15 text-red-300 font-mono font-bold">
                Seyrek Vektör (Sparse)
              </span>
            </div>
            <ul className="space-y-2 text-stone-300 list-disc list-inside leading-relaxed">
              <li><strong className="text-white">Çalışma Prensibi:</strong> Kelimelerin belgedeki frekansı ile tüm korpustaki nadirliğini çarpar.</li>
              <li><strong className="text-white">Avantajı:</strong> Hızlıdır, açıklanabilirdir (Hangi kelimelerin eşleşmeyi sağladığı açıkça görülür).</li>
              <li><strong className="text-white">Küçük Veri Setleri:</strong> 30-50 gibi küçük film koleksiyonlarında Doc2Vec'e göre çok daha tutarlı ve net sonuç verir.</li>
              <li><strong className="text-white">Dezavantajı:</strong> Eşanlamlı kelimeleri sözlükte doğrudan eşleştiremez.</li>
            </ul>
          </div>

          {/* Doc2Vec */}
          <div className="bg-[#0c0305]/80 border border-red-950/80 p-5 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-rose-300 text-sm">Gensim Doc2Vec (PV-DM / PV-DBOW)</h4>
              <span className="px-2 py-0.5 rounded text-[10px] bg-rose-600/15 text-rose-300 font-mono font-bold">
                Yoğun Vektör (Dense Embedding)
              </span>
            </div>
            <ul className="space-y-2 text-stone-300 list-disc list-inside leading-relaxed">
              <li><strong className="text-white">Çalışma Prensibi:</strong> Word2Vec'in genişletilmiş halidir; her belge için 50-300 boyutlu gömme vektörü öğrenir.</li>
              <li><strong className="text-white">Avantajı:</strong> Kelimeler birebir aynı olmasa bile anlamsal bağlamı (semantik benzerlik) yakalar.</li>
              <li><strong className="text-white">Dezavantajı:</strong> Küçük veri setlerinde veri azlığından dolayı aşırı uyum (overfitting) yapabilir.</li>
              <li><strong className="text-white">Projedeki Durumu:</strong> Proje kodlarımız arasında <code className="text-rose-300 font-mono">doc2vec_example.py</code> olarak hazır sunulmuştur!</li>
            </ul>
          </div>

        </div>
      </div>

    </div>
  );
};
