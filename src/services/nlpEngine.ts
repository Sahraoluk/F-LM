import { Movie, MOVIES_DATASET } from '../data/movies';

export const TURKISH_STOP_WORDS = new Set([
  'acaba', 'altı', 'ama', 'ancak', 'arada', 'artık', 'asla', 'aslında', 'ayrıca',
  'bana', 'bazen', 'bazı', 'bazıları', 'belki', 'ben', 'benden', 'beni', 'benim',
  'beş', 'bile', 'bin', 'bir', 'biraz', 'biri', 'birkaç', 'birkez', 'birçok',
  'biri', 'birisi', 'biz', 'bizden', 'bizi', 'bizim', 'böyle', 'böylece', 'bu',
  'buna', 'bunda', 'bundan', 'bunlar', 'bunları', 'bunların', 'bunu', 'bunun',
  'burada', 'bütün', 'çoğu', 'çoğunlukla', 'çok', 'çünkü', 'da', 'daha', 'dahi',
  'de', 'defa', 'değil', 'demek', 'diğer', 'diğeri', 'diğerleri', 'diye', 'dokuz',
  'dolayı', 'dolaşıyla', 'dört', 'edecek', 'eden', 'ederek', 'edilecek', 'ediliyor',
  'edilmesi', 'ediyor', 'eğer', 'elli', 'en', 'etmesi', 'etti', 'ettiği', 'ettiğini',
  'etmek', 'fakat', 'falan', 'filan', 'gene', 'gibi', 'göre', 'halen', 'hangi',
  'hangisi', 'hani', 'hatta', 'hem', 'henüz', 'hep', 'hepsi', 'her', 'herhangi',
  'herkes', 'herkese', 'herkesi', 'herkesin', 'hiç', 'hiçbir', 'hiçbiri', 'için',
  'içinde', 'iki', 'ile', 'ilgili', 'ise', 'işte', 'itibaren', 'itibariyle',
  'kadar', 'karşın', 'katrilyon', 'kendi', 'kendine', 'kendini', 'kendisi',
  'kendisine', 'kendisini', 'kez', 'ki', 'kim', 'kimden', 'kime', 'kimi', 'kimse',
  'kırk', 'mı', 'mi', 'mu', 'mü', 'nasıl', 'ne', 'neden', 'nedenle', 'nerde',
  'nerede', 'nereye', 'nitekim', 'niye', 'o', 'olan', 'olarak', 'oldu', 'olduğu',
  'olduğunu', 'olduklarını', 'olmadı', 'olmadığı', 'olmak', 'olması', 'olmayan',
  'olmaz', 'olsa', 'olsun', 'olup', 'olur', 'olursa', 'oluyor', 'on', 'ona',
  'ondan', 'onlar', 'onlardan', 'onları', 'onların', 'onu', 'onun', 'orada',
  'oysa', 'oysaki', 'öbürü', 'ön', 'önce', 'ötürü', 'öyle', 'özellikle', 'pek',
  'rağmen', 'sadece', 'sanki', 'sekiz', 'seksen', 'sen', 'senden', 'seni', 'senin',
  'siz', 'sizden', 'sizi', 'sizin', 'sonra', 'şayet', 'şey', 'şeyden', 'şeye',
  'şeyi', 'şeyler', 'şu', 'şuna', 'şunda', 'şundan', 'şunlar', 'şunları', 'şunu',
  'şunun', 'tabii', 'tam', 'tamam', 'tamamen', 'tarafından', 'trilyon', 'tüm',
  'üç', 'üzere', 'var', 'vardı', 've', 'veya', 'veyahut', 'ya', 'yani', 'yapacak',
  'yapılan', 'yapılması', 'yapıyor', 'yapmak', 'yaptı', 'yaptığı', 'yaptığını',
  'yaptıkları', 'yedi', 'yerine', 'yetmiş', 'yine', 'yirmi', 'yok', 'yoksa',
  'zaten', 'zaman'
]);

/**
 * Turkish specific lowercase mapping (handles İ -> i, I -> ı)
 */
export function turkishToLower(text: string): string {
  return text
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .replace(/Ğ/g, 'ğ')
    .replace(/Ü/g, 'ü')
    .replace(/Ş/g, 'ş')
    .replace(/Ö/g, 'ö')
    .replace(/Ç/g, 'ç')
    .toLowerCase();
}

/**
 * Text Preprocessing Pipeline:
 * 1. Lowercase with Turkish support
 * 2. Remove punctuation and numbers
 * 3. Tokenize by whitespace
 * 4. Filter stop-words and short tokens (<2 chars)
 */
export function preprocessText(text: string, filterStopwords = true): string[] {
  const lowered = turkishToLower(text);
  // Replace punctuation, special chars and numbers with space
  const cleaned = lowered.replace(/[^a-zçğıöşü\s]/g, ' ');
  const rawTokens = cleaned.split(/\s+/).filter(t => t.length >= 2);

  if (!filterStopwords) {
    return rawTokens;
  }

  return rawTokens.filter(t => !TURKISH_STOP_WORDS.has(t));
}

export interface RecommendationResult {
  movie: Movie;
  similarity: number; // 0 to 1
  matchPercentage: number; // 0 to 100
  matchingTokens: string[];
  scoreContribution: { token: string; weight: number }[];
}

export interface PreprocessingStepBreakdown {
  rawInput: string;
  loweredCleaned: string;
  allTokens: string[];
  filteredTokens: string[];
  removedStopWords: string[];
}

export class GensimStyleNlpEngine {
  private movies: Movie[];
  private docTokens: Map<number, string[]>;
  private termDocFrequency: Map<string, number>;
  private vocab: string[];
  private idfMap: Map<string, number>;
  private movieVectors: Map<number, Map<string, number>>;
  private movieNorms: Map<number, number>;

  constructor(movies: Movie[] = MOVIES_DATASET) {
    this.movies = movies;
    this.docTokens = new Map();
    this.termDocFrequency = new Map();
    this.vocab = [];
    this.idfMap = new Map();
    this.movieVectors = new Map();
    this.movieNorms = new Map();

    this.train();
  }

  private train() {
    const totalDocs = this.movies.length;

    // 1. Process all movie documents
    for (const movie of this.movies) {
      // Document text includes title (repeated for weight), genres, tags, overview
      const docText = `${movie.title} ${movie.title} ${movie.genres.join(' ')} ${movie.tags.join(' ')} ${movie.tags.join(' ')} ${movie.overview}`;
      const tokens = preprocessText(docText);
      this.docTokens.set(movie.id, tokens);

      const uniqueTerms = new Set(tokens);
      for (const term of uniqueTerms) {
        this.termDocFrequency.set(term, (this.termDocFrequency.get(term) || 0) + 1);
      }
    }

    this.vocab = Array.from(this.termDocFrequency.keys());

    // 2. Calculate Gensim-style / Standard TF-IDF: IDF = log((totalDocs + 1) / (df + 1)) + 1
    for (const [term, df] of this.termDocFrequency.entries()) {
      const idf = Math.log((totalDocs + 1) / (df + 1)) + 1;
      this.idfMap.set(term, idf);
    }

    // 3. Compute TF-IDF vectors and norms for each movie
    for (const movie of this.movies) {
      const tokens = this.docTokens.get(movie.id) || [];
      const tfMap = new Map<string, number>();

      for (const t of tokens) {
        tfMap.set(t, (tfMap.get(t) || 0) + 1);
      }

      const vector = new Map<string, number>();
      let sumSq = 0;

      for (const [term, count] of tfMap.entries()) {
        const tf = Math.log(1 + count); // sublinear tf scaling
        const idf = this.idfMap.get(term) || 1;
        const weight = tf * idf;
        vector.set(term, weight);
        sumSq += weight * weight;
      }

      this.movieVectors.set(movie.id, vector);
      this.movieNorms.set(movie.id, Math.sqrt(sumSq) || 1);
    }
  }

  /**
   * Preprocess inspection helper for UI demonstration
   */
  public inspectPreprocessing(text: string): PreprocessingStepBreakdown {
    const rawInput = text;
    const loweredCleaned = turkishToLower(text).replace(/[^a-zçğıöşü\s]/g, ' ');
    const allTokens = loweredCleaned.split(/\s+/).filter(t => t.length >= 2);
    const filteredTokens: string[] = [];
    const removedStopWords: string[] = [];

    for (const t of allTokens) {
      if (TURKISH_STOP_WORDS.has(t)) {
        removedStopWords.push(t);
      } else {
        filteredTokens.push(t);
      }
    }

    return {
      rawInput,
      loweredCleaned,
      allTokens,
      filteredTokens,
      removedStopWords
    };
  }

  /**
   * Calculate Cosine Similarity between user query and all movies
   */
  public recommend(query: string, topK = 5, genreFilter = 'Tümü'): RecommendationResult[] {
    const queryTokens = preprocessText(query);
    if (queryTokens.length === 0) {
      return [];
    }

    // Query TF
    const queryTf = new Map<string, number>();
    for (const t of queryTokens) {
      queryTf.set(t, (queryTf.get(t) || 0) + 1);
    }

    // Query TF-IDF vector & norm
    const queryVector = new Map<string, number>();
    let querySumSq = 0;

    for (const [term, count] of queryTf.entries()) {
      const tf = Math.log(1 + count);
      // If term in vocab, use calculated IDF, otherwise penalize unknown term
      const idf = this.idfMap.get(term) || (Math.log(this.movies.length + 1) + 1);
      const weight = tf * idf;
      queryVector.set(term, weight);
      querySumSq += weight * weight;
    }

    const queryNorm = Math.sqrt(querySumSq) || 1;

    const results: RecommendationResult[] = [];

    for (const movie of this.movies) {
      if (genreFilter !== 'Tümü' && !movie.genres.includes(genreFilter)) {
        continue;
      }

      const movieVec = this.movieVectors.get(movie.id);
      const movieNorm = this.movieNorms.get(movie.id) || 1;
      if (!movieVec) continue;

      let dotProduct = 0;
      const matchingTokens: string[] = [];
      const scoreContribution: { token: string; weight: number }[] = [];

      for (const [term, qWeight] of queryVector.entries()) {
        const mWeight = movieVec.get(term);
        if (mWeight) {
          const contrib = qWeight * mWeight;
          dotProduct += contrib;
          matchingTokens.push(term);
          scoreContribution.push({
            token: term,
            weight: Number((contrib / (queryNorm * movieNorm)).toFixed(4))
          });
        }
      }

      // Cosine similarity
      const cosineSim = dotProduct / (queryNorm * movieNorm);

      if (cosineSim > 0.01) {
        // Boost slightly for visualization to provide intuitive 0-100% ranges
        // while preserving strict rank order
        const matchPercentage = Math.min(99, Math.round(cosineSim * 125));

        scoreContribution.sort((a, b) => b.weight - a.weight);

        results.push({
          movie,
          similarity: Number(cosineSim.toFixed(4)),
          matchPercentage: Math.max(12, matchPercentage),
          matchingTokens,
          scoreContribution
        });
      }
    }

    // Sort descending by similarity
    results.sort((a, b) => b.similarity - a.similarity);

    return results.slice(0, topK);
  }

  public getVocabularySize(): number {
    return this.vocab.length;
  }

  public getMoviesCount(): number {
    return this.movies.length;
  }

  public getAllGenres(): string[] {
    const genres = new Set<string>();
    for (const m of this.movies) {
      m.genres.forEach(g => genres.add(g));
    }
    return Array.from(genres).sort();
  }
}

export const nlpEngine = new GensimStyleNlpEngine(MOVIES_DATASET);
