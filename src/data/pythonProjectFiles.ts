import { MOVIES_DATASET } from './movies';

export interface ProjectFile {
  filename: string;
  path: string;
  language: string;
  description: string;
  content: string;
}

export const MOVIES_JSON_STRING = JSON.stringify(MOVIES_DATASET, null, 2);

export const APP_PY_CONTENT = `"""
CineNLP - Film Konu Özetinden Tavsiye Motoru
Doğal Dil İşleme (Gensim TF-IDF & Kosinüs Benzerliği) Tabanlı Flask Uygulaması
Üniversite Projesi & Üretim Standardı

Gereksinimler:
pip install Flask gensim numpy scipy gunicorn
"""

import os
import json
import re
from flask import Flask, request, jsonify, render_template
import gensim
from gensim import corpora, models, similarities

app = Flask(__name__)

# ==========================================
# 1. TÜRKÇE METİN ÖN İŞLEME & STOP-WORDS
# ==========================================

TURKISH_STOP_WORDS = {
    'acaba', 'altı', 'ama', 'ancak', 'arada', 'artık', 'asla', 'aslında', 'ayrıca',
    'bana', 'bazen', 'bazı', 'bazıları', 'belki', 'ben', 'benden', 'beni', 'benim',
    'beş', 'bile', 'bin', 'bir', 'biraz', 'biri', 'birkaç', 'birkez', 'birçok',
    'biz', 'bizden', 'bizi', 'bizim', 'böyle', 'böylece', 'bu', 'buna', 'bunda',
    'bundan', 'bunlar', 'bunları', 'bunların', 'bunu', 'bunun', 'burada', 'bütün',
    'çoğu', 'çoğunlukla', 'çok', 'çünkü', 'da', 'daha', 'dahi', 'de', 'defa',
    'değil', 'demek', 'diğer', 'diğeri', 'diğerleri', 'diye', 'dokuz', 'dolayı',
    'dört', 'edecek', 'eden', 'ederek', 'edilecek', 'ediliyor', 'ediyor', 'eğer',
    'elli', 'en', 'etmesi', 'etti', 'ettiği', 'etmek', 'fakat', 'gene', 'gibi',
    'göre', 'hangi', 'hangisi', 'hani', 'hatta', 'hem', 'henüz', 'hep', 'hepsi',
    'her', 'herkes', 'hiç', 'hiçbir', 'için', 'içinde', 'iki', 'ile', 'ilgili',
    'ise', 'işte', 'kadar', 'karşın', 'kendi', 'kendine', 'kendini', 'kendisi',
    'kez', 'ki', 'kim', 'kimse', 'mı', 'mi', 'mu', 'mü', 'nasıl', 'ne', 'neden',
    'nitekim', 'niye', 'o', 'olan', 'olarak', 'oldu', 'olduğu', 'olmak', 'olması',
    'olsa', 'olup', 'olur', 'on', 'ona', 'ondan', 'onlar', 'onları', 'onu', 'onun',
    'orada', 'oysa', 'ön', 'önce', 'ötürü', 'öyle', 'pek', 'rağmen', 'sadece',
    'sanki', 'sen', 'siz', 'sonra', 'şu', 'şuna', 'şunu', 'tabii', 'tam', 'tüm',
    'üç', 'üzere', 'var', 'vardı', 've', 'veya', 'veyahut', 'ya', 'yani', 'yedi',
    'yine', 'yok', 'zaten', 'zaman'
}

def turkish_lower(text: str) -> str:
    """Türkçe İ/ı, Ş/ş karakter duyarlı küçük harfe çevirme."""
    mapping = {
        'İ': 'i', 'I': 'ı', 'Ğ': 'ğ', 'Ü': 'ü',
        'Ş': 'ş', 'Ö': 'ö', 'Ç': 'ç'
    }
    for tr_upper, tr_lower in mapping.items():
        text = text.replace(tr_upper, tr_lower)
    return text.lower()

def preprocess_text(text: str) -> list:
    """
    NLP Ön İşleme Adımları:
    1. Türkçe küçük harfe dönüştürme
    2. Noktalama işaretleri ve özel karakterleri temizleme
    3. Tokenization (kelimelere ayırma)
    4. Stop-words ve 2 harften kısa kelimeleri filtreleme
    """
    if not text:
        return []
    
    # 1. Küçük harf
    text = turkish_lower(text)
    
    # 2. Sadece Türkçe harfleri ve boşlukları koru (noktalamayı sil)
    text = re.sub(r'[^a-zçğıöşü\\s]', ' ', text)
    
    # 3. Tokenize
    tokens = text.split()
    
    # 4. Stop-words ve kısa kelime temizliği
    cleaned_tokens = [
        t for t in tokens 
        if len(t) >= 2 and t not in TURKISH_STOP_WORDS
    ]
    return cleaned_tokens

# ==========================================
# 2. VERİ SETİ & GENSİM MODELİ HAZIRLIĞI
# ==========================================

MOVIES_FILE = os.path.join(os.path.dirname(__file__), 'data', 'movies.json')

def load_movies():
    """data/movies.json dosyasını yükler."""
    if os.path.exists(MOVIES_FILE):
        with open(MOVIES_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    else:
        raise FileNotFoundError(f"{MOVIES_FILE} bulunamadı!")

movies_data = load_movies()

# Belge derlemini hazırla: Her filmin başlığı, türleri, etiketleri ve özeti birleştirilir.
documents = []
for m in movies_data:
    combined_text = f"{m['title']} {m['title']} {' '.join(m.get('genres', []))} {' '.join(m.get('tags', []))} {m['overview']}"
    documents.append(preprocess_text(combined_text))

# Gensim Dictionary oluştur
dictionary = corpora.Dictionary(documents)

# Bag-of-Words (BoW) korpusunu oluştur
corpus_bow = [dictionary.doc2bow(doc) for doc in documents]

# Gensim TF-IDF Modeli eğit
tfidf_model = models.TfidfModel(corpus_bow)
corpus_tfidf = tfidf_model[corpus_bow]

# Gensim MatrixSimilarity indeksi (Kosinüs Benzerliği hesabı)
similarity_index = similarities.MatrixSimilarity(corpus_tfidf, num_features=len(dictionary))

print(f"[CineNLP] Başarıyla yüklendi: {len(movies_data)} film, {len(dictionary)} sözlük kelimesi.")

# ==========================================
# 3. TAVSİYE MOTORU FONKSİYONU
# ==========================================

def get_recommendations(user_query: str, top_k: int = 5):
    """
    Kullanıcı arama sorgusunu Gensim TF-IDF ve Kosinüs Benzerliği
    kullanarak film özetleriyle karşılaştırır ve en benzer filmleri döner.
    """
    query_tokens = preprocess_text(user_query)
    if not query_tokens:
        return []
    
    # Sorguyu BoW ve TF-IDF formatına dönüştür
    query_bow = dictionary.doc2bow(query_tokens)
    query_tfidf = tfidf_model[query_bow]
    
    # Kosinüs benzerlik skorlarını hesapla
    sims = similarity_index[query_tfidf]
    
    # Skorlara göre sırala (büyükten küçüğe)
    ranked = sorted(enumerate(sims), key=lambda x: x[1], reverse=True)
    
    results = []
    for idx, score in ranked[:top_k]:
        sim_val = float(score)
        if sim_val > 0.01:
            movie = movies_data[idx]
            
            # Eşleşen kelimeleri tespit et
            movie_tokens = set(documents[idx])
            matching_keywords = [token for token in query_tokens if token in movie_tokens]
            
            # Yüzde hesabı (%10 - %99 arası orantılı sunum)
            match_pct = min(99, max(15, round(sim_val * 120)))
            
            results.append({
                'movie': movie,
                'similarity_score': round(sim_val, 4),
                'match_percentage': match_pct,
                'matching_keywords': list(set(matching_keywords))
            })
            
    return results

# ==========================================
# 4. FLASK WEB ROTASYONLARI (ROUTES)
# ==========================================

@app.route('/')
def home():
    """Ana sayfa: Modern film tavsiye arayüzü"""
    return render_template('index.html', total_movies=len(movies_data))

@app.route('/api/recommend', methods=['POST', 'GET'])
def recommend_api():
    """
    JSON API Uç Noktası:
    POST Body: { "query": "uzayda kara delik ve zaman yolculuğu", "top_k": 5 }
    veya GET Parametre: ?query=...&top_k=5
    """
    if request.method == 'POST':
        data = request.get_json(silent=True) or request.form
        query = data.get('query', '').strip()
        top_k = int(data.get('top_k', 5))
    else:
        query = request.args.get('query', '').strip()
        top_k = int(request.args.get('top_k', 5))
        
    if not query:
        return jsonify({
            'success': False,
            'message': 'Lütfen geçerli bir konu özeti veya tema girin.',
            'recommendations': []
        }), 400
        
    recommendations = get_recommendations(query, top_k=top_k)
    
    return jsonify({
        'success': True,
        'query': query,
        'total_found': len(recommendations),
        'recommendations': recommendations
    })

@app.route('/api/movies', methods=['GET'])
def list_movies():
    """Veri setindeki tüm filmleri listeler."""
    return jsonify({
        'success': True,
        'count': len(movies_data),
        'movies': movies_data
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
`;

export const TEMPLATES_INDEX_HTML = `<!DOCTYPE html>
<html lang="tr" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CineNLP - Film Konu Özetinden Tavsiye Motoru</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
  </style>
</head>
<body class="bg-[#0b0305] text-stone-100 min-h-screen">

  <!-- Üst Başlık / Navbar -->
  <header class="border-b border-red-950/80 bg-[#120407]/90 backdrop-blur-md sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-800 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-red-700/30">
          C
        </div>
        <div>
          <h1 class="text-xl font-bold bg-gradient-to-r from-red-100 via-rose-200 to-red-400 bg-clip-text text-transparent">
            CineNLP
          </h1>
          <p class="text-xs text-stone-400 font-mono">Gensim TF-IDF & Cosine Similarity</p>
        </div>
      </div>
      <div class="flex items-center space-x-3">
        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#1c060b] text-red-300 border border-red-900/50">
          <span class="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
          {{ total_movies }} Film Hazır
        </span>
      </div>
    </div>
  </header>

  <!-- Ana İçerik -->
  <main class="max-w-5xl mx-auto px-4 py-10">
    
    <!-- Hero Başlık & Açıklama -->
    <div class="text-center max-w-2xl mx-auto mb-10">
      <div class="inline-block px-3 py-1 mb-3 rounded-full text-xs font-semibold uppercase tracking-wider text-red-300 bg-red-600/15 border border-red-600/30">
        Doğal Dil İşleme Destekli
      </div>
      <h2 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
        Ne İzlemek İstediğini Anlat,<br>
        <span class="bg-gradient-to-r from-red-100 via-rose-200 to-red-400 bg-clip-text text-transparent">Gensim NLP En Uygununu Bulsun</span>
      </h2>
      <p class="mt-3 text-sm sm:text-base text-stone-400">
        İstediğin filmin konusunu, hissini veya anahtar kelimelerini kendi cümlelerinle yaz. Modelimiz metni tokenize edip kosinüs benzerliği ile eşleştirsin.
      </p>
    </div>

    <!-- Arama Kutusu & Form -->
    <div class="bg-[#130406]/90 border border-red-950/80 rounded-2xl p-4 sm:p-6 shadow-2xl mb-8">
      <form id="recommendForm" class="space-y-4">
        <div>
          <label for="queryInput" class="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
            İzlemek İstediğin Film Teması / Konu Özeti:
          </label>
          <textarea
            id="queryInput"
            name="query"
            rows="3"
            placeholder="Örn: Uzayda geçen, solucan deliği ve karadelik içeren, zaman yolculuğu ve baba-kız ilişkisi olan bir bilim kurgu..."
            class="w-full bg-[#0a0204] border border-red-950/90 rounded-xl px-4 py-3 text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 transition resize-none text-sm"
            required
          ></textarea>
        </div>

        <!-- Hızlı Öneri Butonları -->
        <div class="flex flex-wrap items-center gap-2 pt-1">
          <span class="text-xs text-stone-400 font-medium">Hızlı Örnekler:</span>
          <button type="button" onclick="setQuery('Kara delik, uzayda kaybolma ve zaman genişlemesi içeren astronot hikayesi')" class="px-2.5 py-1 text-xs rounded-lg bg-[#1e060b] text-stone-300 hover:bg-[#2c0910] hover:text-white border border-red-900/40 transition">
            🚀 Uzay & Zaman
          </button>
          <button type="button" onclick="setQuery('Akıl hastanesinde geçen gizemli cinayet ve ters köşe yapan dedektif')" class="px-2.5 py-1 text-xs rounded-lg bg-[#1e060b] text-stone-300 hover:bg-[#2c0910] hover:text-white border border-red-900/40 transition">
            🧠 Psikolojik Gizem
          </button>
          <button type="button" onclick="setQuery('Mafya ailesi içindeki intikam, suç örgütü ve güç savaşı')" class="px-2.5 py-1 text-xs rounded-lg bg-[#1e060b] text-stone-300 hover:bg-[#2c0910] hover:text-white border border-red-900/40 transition">
            🔫 Mafya & Suç
          </button>
          <button type="button" onclick="setQuery('Rüya içinde rüya, zihin manipülasyonu ve bilinçaltı hırsızlığı')" class="px-2.5 py-1 text-xs rounded-lg bg-[#1e060b] text-stone-300 hover:bg-[#2c0910] hover:text-white border border-red-900/40 transition">
            🌀 Rüya & Gerçeklik
          </button>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-red-950">
          <div class="flex items-center space-x-2 text-xs text-stone-400">
            <span>Öneri Sayısı:</span>
            <select id="topKInput" class="bg-[#180509] border border-red-900/40 rounded px-2 py-1 text-stone-200">
              <option value="3">İlk 3 Film</option>
              <option value="5" selected>İlk 5 Film</option>
              <option value="8">İlk 8 Film</option>
            </select>
          </div>

          <button
            type="submit"
            id="submitBtn"
            class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 font-bold text-white text-sm transition transform active:scale-95 shadow-lg shadow-red-700/30 flex items-center space-x-2"
          >
            <span id="btnText">Tavsiyeleri Getir</span>
            <span id="btnSpinner" class="hidden animate-spin">&#9696;</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Sonuçlar Alanı -->
    <div id="resultsContainer">
      <div id="emptyState" class="text-center py-12 border border-dashed border-red-950/80 rounded-2xl bg-[#130406]/40">
        <div class="text-4xl mb-3">🎬</div>
        <h3 class="text-base font-semibold text-stone-300">Henüz arama yapmadınız</h3>
        <p class="text-xs text-stone-400 mt-1">Yukarıdaki kutucuğa bir tema yazıp "Tavsiyeleri Getir" butonuna tıklayın.</p>
      </div>

      <div id="loadingState" class="hidden text-center py-12">
        <div class="inline-block w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        <p class="mt-3 text-sm text-stone-400">Gensim NLP modeli metni işliyor ve matris benzerliğini hesaplıyor...</p>
      </div>

      <div id="cardList" class="space-y-4"></div>
    </div>
  </main>

  <footer class="mt-20 border-t border-red-950 py-6 text-center text-xs text-stone-400">
    <p>Doğal Dil İşleme Projesi &bull; Gensim (TF-IDF & Kosinüs Benzerliği) &bull; Flask Web Mimarisi</p>
  </footer>

  <script>
    function setQuery(text) {
      document.getElementById('queryInput').value = text;
      document.getElementById('queryInput').focus();
    }

    const form = document.getElementById('recommendForm');
    const queryInput = document.getElementById('queryInput');
    const topKInput = document.getElementById('topKInput');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const btnSpinner = document.getElementById('btnSpinner');
    const emptyState = document.getElementById('emptyState');
    const loadingState = document.getElementById('loadingState');
    const cardList = document.getElementById('cardList');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const query = queryInput.value.trim();
      const topK = topKInput.value;
      if (!query) return;

      // Loading durumunu aç
      btnText.textContent = 'Analiz Ediliyor...';
      btnSpinner.classList.remove('hidden');
      submitBtn.disabled = true;
      emptyState.classList.add('hidden');
      loadingState.classList.remove('hidden');
      cardList.innerHTML = '';

      try {
        const response = await fetch('/api/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: query, top_k: parseInt(topK) })
        });
        const data = await response.json();

        loadingState.classList.add('hidden');

        if (data.success && data.recommendations.length > 0) {
          renderResults(data.recommendations);
        } else {
          cardList.innerHTML = \`
            <div class="text-center py-10 bg-[#130406] border border-red-950 rounded-2xl">
              <p class="text-rose-400 text-sm font-semibold">Eşleşen film bulunamadı.</p>
              <p class="text-stone-400 text-xs mt-1">Farklı anahtar kelimeler veya daha detaylı bir özet yazmayı deneyin.</p>
            </div>
          \`;
        }
      } catch (err) {
        loadingState.classList.add('hidden');
        cardList.innerHTML = \`
          <div class="text-center py-8 bg-red-950/40 border border-red-900/60 rounded-2xl text-red-300 text-sm">
            Bağlantı hatası oluştu. Lütfen sunucunun (app.py) çalıştığından emin olun.
          </div>
        \`;
      } finally {
        btnText.textContent = 'Tavsiyeleri Getir';
        btnSpinner.classList.add('hidden');
        submitBtn.disabled = false;
      }
    });

    function renderResults(recommendations) {
      cardList.innerHTML = recommendations.map((item, index) => {
        const m = item.movie;
        const pct = item.match_percentage;
        const keywords = item.matching_keywords || [];

        return \`
          <div class="bg-[#130406]/90 border border-red-950 hover:border-red-900/70 rounded-2xl p-5 transition hover:shadow-xl flex flex-col md:flex-row gap-5">
            <div class="w-full md:w-36 h-48 md:h-auto rounded-xl overflow-hidden bg-[#0a0204] flex-shrink-0 relative">
              <img src="\${m.posterUrl}" alt="\${m.title}" class="w-full h-full object-cover">
              <div class="absolute top-2 left-2 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded text-xs font-bold text-red-300">
                #\${index + 1}
              </div>
            </div>

            <div class="flex-1 flex flex-col justify-between">
              <div>
                <div class="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 class="text-lg font-bold text-white">\${m.title} <span class="text-stone-400 text-sm font-normal">(\${m.year})</span></h3>
                    <p class="text-xs text-stone-400 italic">\${m.originalTitle} &bull; Yönetmen: \${m.director}</p>
                  </div>
                  
                  <div class="flex items-center space-x-2">
                    <span class="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-red-600/20 text-red-300 border border-red-600/30">
                      %\${pct} Eşleşme
                    </span>
                    <span class="px-2 py-1 rounded-lg text-xs font-semibold bg-[#1e060b] text-amber-400 border border-red-950">
                      ★ \${m.imdbScore}
                    </span>
                  </div>
                </div>

                <div class="flex flex-wrap gap-1.5 my-2.5">
                  \${m.genres.map(g => \`<span class="px-2 py-0.5 rounded-full text-[11px] bg-[#1e060b] text-stone-300 border border-red-900/30">\${g}</span>\`).join('')}
                </div>

                <p class="text-xs sm:text-sm text-stone-300 leading-relaxed line-clamp-3">
                  \${m.overview}
                </p>
              </div>

              \${keywords.length > 0 ? \`
                <div class="mt-3 pt-3 border-t border-red-950/80 flex items-center gap-1.5 flex-wrap">
                  <span class="text-[11px] text-stone-400 font-medium">Eşleşen Terimler:</span>
                  \${keywords.map(kw => \`<span class="px-2 py-0.5 rounded bg-red-950/80 text-red-200 border border-red-800/60 text-[10px] font-mono">\${kw}</span>\`).join('')}
                </div>
              \` : ''}
            </div>
          </div>
        \`;
      }).join('');
    }
  </script>
</body>
</html>
`;

export const REQUIREMENTS_TXT = `Flask==3.0.3
gensim==4.3.3
numpy>=1.24.0,<2.0.0
scipy>=1.10.0
gunicorn==22.0.0
`;

export const PROCFILE_CONTENT = `web: gunicorn app:app --log-file -
`;

export const RENDER_YAML = `services:
  - type: web
    name: film-tavsiye-motoru
    env: python
    plan: free
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn app:app
`;

export const README_MD = `# CineNLP - Film Konu Özetinden Tavsiye Motoru 🎬

Bu proje, Doğal Dil İşleme (**NLP**) teknikleri ve **Gensim** kütüphanesini kullanarak kullanıcıların girdikleri konu özeti veya temalara göre en benzer filmleri **TF-IDF ve Kosinüs Benzerliği** ile öneren tam teşekküllü bir **Python Flask** web uygulamasıdır.

---

## 📁 Proje Klasör Yapısı

\`\`\`text
film_tavsiye_projesi/
│
├── app.py                  # Ana Flask uygulaması & Gensim NLP motoru
├── requirements.txt        # Gerekli Python kütüphaneleri
├── Procfile                # Render / PaaS dağıtım dosyası
├── render.yaml             # Render otomatik build yapılandırması
├── README.md               # Kurulum ve çalıştırma kılavuzu
│
├── data/
│   └── movies.json         # 40 adet popüler Türkçe film ve konu özeti
│
└── templates/
    └── index.html          # Modern, koyu temalı web arayüzü (Tailwind CSS + AJAX)
\`\`\`

---

## ⚙️ 1. Adım: Yerel Bilgisayarda Kurulum ve Çalıştırma

### 1. Projeyi İndirin veya Klasöre Girin
\`\`\`bash
mkdir film_tavsiye_projesi
cd film_tavsiye_projesi
\`\`\`

### 2. Python Sanal Ortamını (venv) Oluşturun ve Aktifleştirin
**Windows için:**
\`\`\`bash
python -m venv venv
venv\\Scripts\\activate
\`\`\`

**macOS / Linux için:**
\`\`\`bash
python3 -m venv venv
source venv/bin/activate
\`\`\`

### 3. Kütüphaneleri Yükleyin
\`\`\`bash
pip install -r requirements.txt
\`\`\`

### 4. Uygulamayı Başlatın
\`\`\`bash
python app.py
\`\`\`

Tarayıcınızı açıp \`http://127.0.0.1:5000\` adresine gidin. Uygulama kullanıma hazırdır!

---

## 🚀 2. Adım: Render.com Üzerinde Ücretsiz Yayınlama (Deploy)

Render, Python Flask uygulamalarını ücretsiz olarak yayınlamak için en pratik platformdur:

1. Proje dosyalarınızı bir **GitHub** deposuna yükleyin (\`git init\`, \`git commit\`, \`git push\`).
2. [Render.com](https://render.com) adresine giriş yapın ve **New + -> Web Service** seçeneğine tıklayın.
3. GitHub deponuzu bağlayın.
4. Ayarları şu şekilde doldurun:
   - **Name**: \`film-tavsiye-motoru\`
   - **Environment**: \`Python 3\`
   - **Build Command**: \`pip install -r requirements.txt\`
   - **Start Command**: \`gunicorn app:app\`
5. **Create Web Service** butonuna basın. 2-3 dakika içinde \`.onrender.com\` uzantılı canlı linkiniz hazır olacaktır.

---

## 🤗 3. Adım: Hugging Face Spaces Üzerinde Yayınlama

1. [Hugging Face Spaces](https://huggingface.co/spaces) adresine gidin.
2. **Create new Space** deyin.
3. **Space SDK** olarak **Docker** veya **Gradio / Flask** seçin.
4. Dosyaları depoya push edin. Port olarak \`7860\` kullanmak isterseniz \`app.py\` içinde varsayılan portu 7860 yapabilirsiniz.

---

## 🧠 Algoritma & NLP Mantığı (Gensim)

1. **Türkçe Ön İşleme (Preprocessing):**
   - \`turkish_lower()\`: Türkçe'ye özgü büyük/küçük harf ayrımı (İ->i, I->ı).
   - Regex temizliği: Noktalama işaretleri ve özel karakterler ayıklanır.
   - Stop-words temizliği: Anlamsal ağırlığı olmayan bağlaç ve zamirler (\`ve\`, \`ile\`, \`bu\`, \`için\`) filtrelenir.

2. **Gensim Sözlüğü & BoW (Bag-of-Words):**
   - Her filmin başlık, tür, etiket ve özet metni birleştirilerek \`corpora.Dictionary\` içine alınır.
   - \`dictionary.doc2bow()\` ile kelime frekans vektörleri oluşturulur.

3. **TF-IDF & Kosinüs Benzerliği:**
   - \`models.TfidfModel\`: Nadir ve ayırt edici kelimelerin ağırlığını artırır.
   - \`similarities.MatrixSimilarity\`: Kullanıcının sorgusu ile 40 filmin TF-IDF vektörleri arasındaki kosinüs açısını (\`dot product / (|A| * |B|)\`) hesaplar.
   - Sonuçlar %0 - %100 aralığında sezgisel eşleşme yüzdesine dönüştürülür.
`;

export const DOC2VEC_SNIPPET = `"""
Alternatif: Gensim Doc2Vec ile Film Tavsiyesi
Eğer ödevinizde Doc2Vec talep ediliyorsa aşağıdaki sınıftan faydalanabilirsiniz:
"""
from gensim.models.doc2vec import Doc2Vec, TaggedDocument

class Doc2VecRecommender:
    def __init__(self, movies_data):
        self.movies = movies_data
        # 1. TaggedDocument formatına dönüştürme
        self.tagged_data = [
            TaggedDocument(
                words=preprocess_text(f"{m['title']} {' '.join(m['genres'])} {m['overview']}"),
                tags=[str(i)]
            )
            for i, m in enumerate(movies_data)
        ]
        # 2. Doc2Vec Modeli Eğitimi
        self.model = Doc2Vec(
            vector_size=50,
            min_count=1,
            epochs=40,
            dm=1  # Distributed Memory (PV-DM)
        )
        self.model.build_vocab(self.tagged_data)
        self.model.train(self.tagged_data, total_examples=self.model.corpus_count, epochs=self.model.epochs)

    def recommend(self, query_text, top_k=5):
        tokens = preprocess_text(query_text)
        # Sorgu metnini vektöre dönüştür
        inferred_vector = self.model.infer_vector(tokens)
        # En yakın dökümanları bul
        sims = self.model.dv.most_similar([inferred_vector], topn=top_k)
        return [(self.movies[int(tag)], float(score)) for tag, score in sims]
`;

export const PROJECT_FILES: ProjectFile[] = [
  {
    filename: 'app.py',
    path: 'app.py',
    language: 'python',
    description: 'Ana Flask uygulaması, Gensim kütüphanesi entegrasyonu, Türkçe NLP pipeline, REST API ve sayfa rotaları.',
    content: APP_PY_CONTENT
  },
  {
    filename: 'movies.json',
    path: 'data/movies.json',
    language: 'json',
    description: '40 adet popüler film, Türkçe konu özetleri, türler, IMDb puanları, yönetmenler ve afişler.',
    content: MOVIES_JSON_STRING
  },
  {
    filename: 'index.html',
    path: 'templates/index.html',
    language: 'html',
    description: 'Şık ve modern koyu tema Jinja2 şablonu, film afiş kartları, anlık AJAX sorgusu ve eşleşme göstergesi.',
    content: TEMPLATES_INDEX_HTML
  },
  {
    filename: 'requirements.txt',
    path: 'requirements.txt',
    language: 'text',
    description: 'Flask, Gensim, NumPy, SciPy ve Gunicorn bağımlılık listesi.',
    content: REQUIREMENTS_TXT
  },
  {
    filename: 'Procfile',
    path: 'Procfile',
    language: 'text',
    description: 'Render ve PaaS servisleri için Web başlatma komutu.',
    content: PROCFILE_CONTENT
  },
  {
    filename: 'render.yaml',
    path: 'render.yaml',
    language: 'yaml',
    description: 'Render.com için tek tıkla kurulum konfigürasyonu.',
    content: RENDER_YAML
  },
  {
    filename: 'README.md',
    path: 'README.md',
    language: 'markdown',
    description: 'Eksiksiz kurulum, yerel çalıştırma (venv), Render/HF Spaces deploy kılavuzu ve NLP algoritma açıklamaları.',
    content: README_MD
  },
  {
    filename: 'doc2vec_example.py',
    path: 'doc2vec_example.py',
    language: 'python',
    description: 'İsteğe bağlı: Gensim Doc2Vec (TaggedDocument & PV-DM) ile derin anlamsal tavsiye alternatif kodu.',
    content: DOC2VEC_SNIPPET
  }
];
