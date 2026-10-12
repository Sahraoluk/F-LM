import React, { useState } from 'react';
import { Rocket, Terminal, Cloud, HelpCircle, Copy, Check } from 'lucide-react';

export const DeployGuide: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      title: '1. Adım: Proje Klasörünü ve Dosyalarını Hazırlayın',
      desc: 'Bilgisayarınızda yeni bir klasör oluşturup sağlanan proje dosyalarını bu yapıya göre yerleştirin:',
      code: `mkdir film_tavsiye_projesi
cd film_tavsiye_projesi
mkdir data templates

# app.py, requirements.txt, Procfile -> ana dizine
# movies.json -> data/movies.json içine
# index.html  -> templates/index.html içine`
    },
    {
      title: '2. Adım: Sanal Ortam (venv) Kurulumu ve Aktifleştirme',
      desc: 'Kütüphanelerin sistem Python\'unu kirletmemesi için izole bir ortam oluşturun:',
      code: `# Windows için:
python -m venv venv
venv\\Scripts\\activate

# macOS / Linux için:
python3 -m venv venv
source venv/bin/activate`
    },
    {
      title: '3. Adım: Kütüphaneleri Yükleyin (pip install)',
      desc: 'Gensim, Flask, NumPy, SciPy ve Gunicorn kütüphanelerini tek seferde kurun:',
      code: `pip install -r requirements.txt`
    },
    {
      title: '4. Adım: Uygulamayı Yerelde Başlatın',
      desc: 'Flask sunucusunu ayağa kaldırın ve tarayıcıda test edin:',
      code: `python app.py
# Çıktı: Running on http://127.0.0.1:5000`
    }
  ];

  const interviewQuestions = [
    {
      q: 'Hoca Sorusu: Gensim kütüphanesini bu projede ne amaçla kullandınız?',
      a: 'Gensim; büyük metin korpusları üzerinde konu modelleme (Topic Modeling), kelime/belge gömmeleri (Word2Vec, Doc2Vec) ve vektör benzerlik sorguları için yüksek performanslı ve optimize edilmiş bir Python NLP kütüphanesidir. Bu projede filmlerin özetlerini Bag-of-Words sözlüğüne aktarıp TF-IDF uzayına taşımak ve kullanıcının sorgusuyla filmler arasındaki açıyı MatrixSimilarity ile hızlıca hesaplamak amacıyla kullandık.'
    },
    {
      q: 'Hoca Sorusu: Metin ön işlemede (Preprocessing) hangi adımları uyguladınız?',
      a: '1) Türkçe karakter uyumlu küçük harfe dönüştürme (turkish_lower; İ->i, I->ı dönüşüm hatalarını engeller), 2) Regex ile noktalama işaretlerini ve özel karakterleri temizleme, 3) Tokenization (metni kelimelere parçalama), 4) Türkçe stop-words (bağlaç ve edatlar: ve, ile, bu, için) elemesi ve 2 harften kısa gürültü kelimeleri filtreleme.'
    },
    {
      q: 'Hoca Sorusu: TF-IDF ve Kosinüs Benzerliği (Cosine Similarity) neden seçildi?',
      a: 'TF (Term Frequency), bir kelimenin ilgili film özetinde ne kadar sık geçtiğini; IDF (Inverse Document Frequency) ise o kelimenin tüm film koleksiyonundaki nadirliğini ölçer. Örneğin "kara delik" kelimeleri sadece Interstellar gibi birkaç filmde geçtiği için yüksek IDF ağırlığı alır. Kosinüs Benzerliği ise metin uzunluklarından etkilenmeden iki vektör arasındaki yön farkını ölçer, böylece kısa veya uzun özetler adil kıyaslanır.'
    },
    {
      q: 'Hoca Sorusu: Doc2Vec ile TF-IDF arasındaki fark nedir?',
      a: 'TF-IDF seyrek (sparse) vektör tabanlıdır; kelimelerin birebir eşleşmesine ve frekansına dayanır. Doc2Vec ise yapay sinir ağıyla eğitilen yoğun (dense) bir gömme modelidir; kelimeler farklı olsa bile anlamsal bağlamı kavrayabilir. Ancak 30-40 filmlik küçük veri setlerinde derin modeller yerine TF-IDF çok daha kararlı ve açıklanabilir sonuçlar verir.'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Üst Bilgi */}
      <div className="rounded-3xl bg-gradient-to-b from-[#1b0509] via-[#130407] to-[#0c0305] border border-red-950/80 p-6 sm:p-8">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-600/15 text-red-300 border border-red-600/30">
            <Rocket className="w-3.5 h-3.5 text-red-400" />
            <span>Dağıtım & Canlıya Alma Rehberi</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Yerel Bilgisayar & Render.com Ücretsiz Yayınlama Adımları
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
            Flask ve Gensim projenizi yerel makinenizde çalıştırabilir veya Render / Hugging Face Spaces üzerinden internete açık ücretsiz canlı bir web sitesine dönüştürebilirsiniz.
          </p>
        </div>
      </div>

      {/* Yerel Kurulum Adımları */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-red-400" />
          <span>Yerel Bilgisayarda Adım Adım Çalıştırma</span>
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {steps.map((st, idx) => (
            <div key={idx} className="bg-[#130406]/90 border border-red-950/80 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-red-300">{st.title}</h4>
                <button
                  onClick={() => copyToClipboard(st.code, idx)}
                  className="px-2.5 py-1 rounded-lg bg-[#1f060b] hover:bg-[#2b080f] text-stone-300 text-xs font-mono flex items-center space-x-1 border border-red-900/30 cursor-pointer"
                >
                  {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-red-400" />}
                  <span>{copiedIndex === idx ? 'Kopyalandı' : 'Komutu Kopyala'}</span>
                </button>
              </div>
              <p className="text-xs text-stone-400">{st.desc}</p>
              <div className="bg-[#0a0204] p-3 rounded-xl border border-red-950 font-mono text-xs text-stone-200 overflow-x-auto">
                <pre>{st.code}</pre>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Render.com Canlı Dağıtım Rehberi */}
      <div className="bg-gradient-to-br from-[#1b0509] via-[#120406] to-[#0a0204] border border-red-950/80 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center space-x-3">
          <Cloud className="w-6 h-6 text-red-400" />
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Render.com Ücretsiz Yayınlama (Deploy) Adımları
            </h3>
            <p className="text-xs text-stone-400">
              Kredi kartı gerekmeden ücretsiz olarak Flask projenizi internete açın.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="bg-[#0a0204] p-4 rounded-xl border border-red-950 space-y-2">
            <span className="w-6 h-6 rounded-full bg-red-600/20 text-red-300 font-bold flex items-center justify-center text-xs">
              1
            </span>
            <h4 className="font-bold text-white">GitHub Deposu Açın</h4>
            <p className="text-stone-400 leading-relaxed text-xs">
              Proje dosyalarınızı GitHub üzerinde yeni bir depoya (<code className="text-red-300 font-mono">git push</code>) yükleyin.
            </p>
          </div>

          <div className="bg-[#0a0204] p-4 rounded-xl border border-red-950 space-y-2">
            <span className="w-6 h-6 rounded-full bg-red-600/20 text-red-300 font-bold flex items-center justify-center text-xs">
              2
            </span>
            <h4 className="font-bold text-white">Render Web Service</h4>
            <p className="text-stone-400 leading-relaxed text-xs">
              Render.com'a girin, <strong>New + Web Service</strong> seçin ve GitHub deponuzu bağlayın.
            </p>
          </div>

          <div className="bg-[#0a0204] p-4 rounded-xl border border-red-950 space-y-2">
            <span className="w-6 h-6 rounded-full bg-red-600/20 text-red-300 font-bold flex items-center justify-center text-xs">
              3
            </span>
            <h4 className="font-bold text-white">Komutları Tanımlayın</h4>
            <p className="text-stone-400 leading-relaxed text-xs">
              Build Command: <code className="text-red-300 font-mono">pip install -r requirements.txt</code><br />
              Start Command: <code className="text-red-300 font-mono">gunicorn app:app</code>
            </p>
          </div>
        </div>
      </div>

      {/* Sıkça Sorulan Hoca Soruları & Cevapları */}
      <div className="bg-[#130406]/90 border border-red-950/80 rounded-3xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center space-x-3">
          <HelpCircle className="w-5 h-5 text-red-400" />
          <h3 className="text-lg font-bold text-white">
            Üniversite Projesi Sunumuna Hazırlık: Olası Hoca Soruları & Cevapları
          </h3>
        </div>

        <div className="space-y-3">
          {interviewQuestions.map((item, qIdx) => (
            <div key={qIdx} className="bg-[#0a0204] p-4 rounded-xl border border-red-950 space-y-2">
              <h4 className="text-xs sm:text-sm font-bold text-red-300">
                {item.q}
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
