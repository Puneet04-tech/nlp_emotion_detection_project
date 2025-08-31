export const analyzeTranscript = (transcript) => {
  if (!transcript || typeof transcript !== 'string') {
    return {
      summary: 'No transcript available for analysis',
      insights: [],
      sentiment: { score: 0, label: 'Neutral', confidence: 0 },
      statistics: { wordCount: 0, sentenceCount: 0, readingTime: 0 }
    };
  }

  // Split transcript into chunks for large transcripts (e.g., every 2000 words)
  const words = transcript.split(/\s+/);
  const chunkSize = 2000;
  const chunks = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(' '));
  }

  // Analyze each chunk
  const analyses = chunks.map(chunk => {
    const statistics = getStatistics(chunk);
    const keywords = extractKeywords(chunk);
    const readabilityScore = calculateReadability(chunk);
    const topicDistribution = analyzeTopics(chunk);
    const emotionAnalysis = analyzeEmotions(chunk);
    const linguisticAnalysis = analyzeLinguistics(chunk);
    const structuralAnalysis = analyzeStructure(chunk);
    const contentAnalysis = analyzeContent(chunk);
    const namedEntities = extractNamedEntities(chunk);
    const questionAnalysis = analyzeQuestions(chunk);
    const timeAnalysis = analyzeTimeReferences(chunk);
    const actionItems = extractActionItems(chunk);
    const themes = extractThemes(chunk);
    const spamDetection = detectSpam(chunk);
    const summary = chunk.slice(0, 300) + (chunk.length > 300 ? '...' : '');
    const detailedSummary = generateDetailedSummary(chunk);
    const insightsRaw = generateImplicitConclusions(chunk);
    const sentiment = analyzeSentiment(chunk);
    const insights = Array.isArray(insightsRaw)
      ? insightsRaw.map((desc, i) => ({
          type: 'implicit',
          icon: '💡',
          title: `Insight ${i + 1}`,
          description: desc,
          severity: 'info',
        }))
      : [];
    return {
      statistics,
      keywords,
      readabilityScore,
      topicDistribution,
      emotionAnalysis,
      linguisticAnalysis,
      structuralAnalysis,
      contentAnalysis,
      namedEntities,
      questionAnalysis,
      timeAnalysis,
      actionItems,
      themes,
      spamDetection,
      summary,
      detailedSummary,
      insights,
      sentiment
    };
  });

  // Aggregate results across all chunks
  const aggregate = (field, reducer, initial) => analyses.reduce((acc, a) => reducer(acc, a[field]), initial);

  // Aggregate statistics
  const statistics = aggregate('statistics', (acc, s) => ({
    wordCount: (acc.wordCount || 0) + (s.wordCount || 0),
    sentenceCount: (acc.sentenceCount || 0) + (s.sentenceCount || 0),
    readingTime: (acc.readingTime || 0) + (s.readingTime || 0)
  }), {});

  // Aggregate keywords
  const keywordMap = {};
  analyses.forEach(a => (a.keywords || []).forEach(k => {
    if (!keywordMap[k.word]) keywordMap[k.word] = 0;
    keywordMap[k.word] += k.count;
  }));
  const keywords = Object.entries(keywordMap).map(([word, count]) => ({ word, count })).sort((a, b) => b.count - a.count).slice(0, 20);

  // Aggregate sentiment (average)
  const sentiment = analyses.reduce((acc, a) => {
    acc.score += a.sentiment.score || 0;
    acc.confidence += a.sentiment.confidence || 0;
    return acc;
  }, { score: 0, confidence: 0 });
  sentiment.score = sentiment.score / analyses.length;
  sentiment.confidence = sentiment.confidence / analyses.length;
  sentiment.label = sentiment.score > 0.2 ? 'Positive' : sentiment.score < -0.2 ? 'Negative' : 'Neutral';

  // Aggregate topicDistribution, emotionAnalysis, etc. (concat or merge as needed)
  const topicDistribution = [].concat(...analyses.map(a => a.topicDistribution || []));
  const emotionAnalysis = [].concat(...analyses.map(a => a.emotionAnalysis || []));
  const linguisticAnalysis = analyses[0]?.linguisticAnalysis || {};
  const structuralAnalysis = analyses[0]?.structuralAnalysis || {};
  const contentAnalysis = analyses[0]?.contentAnalysis || {};
  const namedEntities = analyses[0]?.namedEntities || {};
  const questionAnalysis = analyses[0]?.questionAnalysis || {};
  const timeAnalysis = analyses[0]?.timeAnalysis || {};
  const actionItems = [].concat(...analyses.map(a => a.actionItems || []));
  const themes = [].concat(...analyses.map(a => a.themes || []));
  const spamDetection = analyses.reduce((acc, a) => {
    acc.spamScore += a.spamDetection.spamScore || 0;
    acc.spamPercent += a.spamDetection.spamPercent || 0;
    return acc;
  }, { spamScore: 0, spamPercent: 0 });
  spamDetection.spamScore = spamDetection.spamScore / analyses.length;
  spamDetection.spamPercent = spamDetection.spamPercent / analyses.length;
  spamDetection.isSpam = spamDetection.spamScore > 8;

  // Aggregate insights
  const insights = [].concat(...analyses.map(a => a.insights || []));

  // Use the first chunk's summary and detailedSummary, but fill missing fields with logical fallbacks
  let summary = analyses[0]?.summary || '';
  let detailedSummary = analyses[0]?.detailedSummary || {};

  // If summary is empty, generate one from the whole transcript
  if (!summary || summary.length < 10) {
    summary = generateSummary(transcript);
  }
  // If detailedSummary is empty, generate one from the whole transcript
  if (!detailedSummary || Object.keys(detailedSummary).length === 0) {
    detailedSummary = generateDetailedSummary(transcript);
  }

  // If insights are empty, generate from the whole transcript
  let allInsights = insights && insights.length > 0 ? insights : generateInsights(transcript);
  // If still empty, provide a default insight
  if (!allInsights || allInsights.length === 0) {
    allInsights = [{
      type: 'general',
      icon: '💡',
      title: 'No Specific Insights',
      description: 'No specific insights could be generated for this transcript. Please provide more detailed content for analysis.',
      severity: 'info'
    }];
  }

  // If keywords are empty, extract from the whole transcript
  let allKeywords = keywords && keywords.length > 0 ? keywords : extractKeywords(transcript);

  // If topicDistribution is empty, analyze from the whole transcript
  let allTopics = topicDistribution && topicDistribution.length > 0 ? topicDistribution : analyzeTopics(transcript);

  // If emotionAnalysis is empty, analyze from the whole transcript
  let allEmotions = emotionAnalysis && emotionAnalysis.length > 0 ? emotionAnalysis : analyzeEmotions(transcript);

  // If questionAnalysis is empty, analyze from the whole transcript
  let allQuestions = (questionAnalysis && questionAnalysis.totalQuestions > 0) ? questionAnalysis : analyzeQuestions(transcript);

  // If timeAnalysis is empty, analyze from the whole transcript
  let allTime = (timeAnalysis && Object.keys(timeAnalysis).length > 0) ? timeAnalysis : analyzeTimeReferences(transcript);

  // If actionItems are empty, extract from the whole transcript
  let allActions = actionItems && actionItems.length > 0 ? actionItems : extractActionItems(transcript);

  // If themes are empty, extract from the whole transcript
  let allThemes = themes && themes.length > 0 ? themes : extractThemes(transcript);

  // If namedEntities are empty, extract from the whole transcript
  let allEntities = (namedEntities && Object.keys(namedEntities).length > 0) ? namedEntities : extractNamedEntities(transcript);

  // If contentAnalysis is empty, analyze from the whole transcript
  let allContent = (contentAnalysis && Object.keys(contentAnalysis).length > 0) ? contentAnalysis : analyzeContent(transcript);

  // If linguisticAnalysis is empty, analyze from the whole transcript
  let allLinguistics = (linguisticAnalysis && Object.keys(linguisticAnalysis).length > 0) ? linguisticAnalysis : analyzeLinguistics(transcript);

  // If structuralAnalysis is empty, analyze from the whole transcript
  let allStructure = (structuralAnalysis && Object.keys(structuralAnalysis).length > 0) ? structuralAnalysis : analyzeStructure(transcript);

  // If spamDetection is empty, detect from the whole transcript
  let allSpam = (spamDetection && Object.keys(spamDetection).length > 0) ? spamDetection : detectSpam(transcript);

  // Always provide sentences, sentenceSentiments, sentenceEmotions for frontend
  let sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  let sentenceSentiments = sentences.map(s => analyzeSentiment(s));
  let sentenceEmotions = sentences.map(s => {
    const emotions = analyzeEmotions(s);
    const obj = {};
    emotions.forEach(e => { obj[e.emotion] = e.count; });
    return obj;
  });
  // If chunked analyses have more, use the longest
  const maxSentences = Math.max(...analyses.map(a => a.sentences?.length || 0));
  const bestChunk = analyses.find(a => (a.sentences?.length || 0) === maxSentences);
  if (bestChunk && bestChunk.sentences && bestChunk.sentences.length > sentences.length) {
    sentences = bestChunk.sentences;
    sentenceSentiments = bestChunk.sentenceSentiments;
    sentenceEmotions = bestChunk.sentenceEmotions;
  }

  // Prepare user-friendly analysis sections for the analysis tab
  const readabilitySection = {
    label: 'Readability',
    score: analyses[0]?.readabilityScore || calculateReadability(transcript),
    level: (() => {
      const score = analyses[0]?.readabilityScore || calculateReadability(transcript);
      if (score >= 80) return 'Very Easy';
      if (score >= 60) return 'Easy';
      if (score >= 50) return 'Standard';
      if (score >= 30) return 'Difficult';
      return 'Very Difficult';
    })()
  };

  const linguisticSection = {
    label: 'Linguistic Analysis',
    ...allLinguistics
  };

  const structuralSection = {
    label: 'Structural Analysis',
    ...allStructure
  };

  const contentSection = {
    label: 'Content Analysis',
    ...allContent
  };

  const namedEntitiesSection = {
    label: 'Named Entities',
    ...allEntities
  };

  const spamSection = {
    label: 'Spam Detection',
    ...allSpam
  };

  return {
    summary,
    detailedSummary,
    insights: allInsights,
    sentiment,
    statistics,
    keywords: allKeywords,
    readabilityScore: readabilitySection.score,
    topicDistribution: allTopics,
    emotionAnalysis: allEmotions,
    linguisticAnalysis: allLinguistics,
    structuralAnalysis: allStructure,
    contentAnalysis: allContent,
    namedEntities: allEntities,
    questionAnalysis: allQuestions,
    timeAnalysis: allTime,
    actionItems: allActions,
    themes: allThemes,
    spamDetection: allSpam,
    questions: generateQuestionsFromTranscript(transcript, analyses),
    sentences,
    sentenceSentiments,
    sentenceEmotions,
    // New sections for analysis tab
    analysisSections: [
      readabilitySection,
      linguisticSection,
      structuralSection,
      contentSection,
      namedEntitiesSection,
      spamSection
    ]
  };
}



// Generate transcript-specific questions from content and analysis
function generateQuestionsFromTranscript(transcript, analyses) {
  // Use keywords, main points, and findings to generate questions
  const allKeywords = analyses.flatMap(a => (a.keywords || []).map(k => k.word));
  const mainPoints = analyses.flatMap(a => (a.detailedSummary?.mainPoints || []));
  const keyFindings = analyses.flatMap(a => (a.detailedSummary?.keyFindings || []));
  const sentences = transcript.split(/[.!?]\s+/).filter(s => s.length > 20);

  // Heuristic: For each main point or finding, generate a question
  let questions = [];
  mainPoints.forEach(point => {
    questions.push(`What is the significance of: ${point}?`);
  });
  keyFindings.forEach(finding => {
    questions.push(`What does the analysis reveal about: ${finding}?`);
  });

  // For top keywords, ask about their role or importance
  Array.from(new Set(allKeywords)).slice(0, 5).forEach(word => {
    questions.push(`How does "${word}" relate to the main topic?`);
  });

  // For long transcripts, add a few comprehension questions
  if (sentences.length > 10) {
    questions.push('What are the main challenges discussed in this transcript?');
    questions.push('What solutions or recommendations are provided?');
    questions.push('Summarize the key takeaways from this content.');
  }

  // Remove duplicates and empty
  questions = Array.from(new Set(questions)).filter(q => q.length > 20);
  // Limit to 5-7 questions
  return questions.slice(0, 7);
}

// Spam detection function (browser-compatible, no external library)
const detectSpam = (text) => {
  // Statistical distribution functions
  const factorial = (n) => {
    if (n <= 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  };

  // Poisson distribution probability
  const poissonProbability = (lambda, k) => {
    return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
  };

  // Binomial distribution probability
  const binomialProbability = (n, p, k) => {
    if (k > n) return 0;
    const combination = factorial(n) / (factorial(k) * factorial(n - k));
    return combination * Math.pow(p, k) * Math.pow(1 - p, n - k);
  };

  // Cumulative distribution functions
  const poissonCDF = (lambda, k) => {
    let sum = 0;
    for (let i = 0; i <= k; i++) {
      sum += poissonProbability(lambda, i);
    }
    return sum;
  };

  const binomialCDF = (n, p, k) => {
    let sum = 0;
    for (let i = 0; i <= k; i++) {
      sum += binomialProbability(n, p, i);
    }
    return sum;
  };

  // Enhanced spam keywords with weights and categories
  const spamKeywords = [
    // High-weight keywords (weight: 3)
    { word: 'free', weight: 3, category: 'offer' },
    { word: 'win', weight: 3, category: 'gambling' },
    { word: 'winner', weight: 3, category: 'gambling' },
    { word: 'prize', weight: 3, category: 'gambling' },
    { word: 'money', weight: 3, category: 'financial' },
    { word: 'cash', weight: 3, category: 'financial' },
    { word: 'offer', weight: 3, category: 'offer' },
    { word: 'click', weight: 3, category: 'action' },
    { word: 'buy now', weight: 3, category: 'action' },
    { word: 'subscribe', weight: 3, category: 'action' },
    { word: 'limited time', weight: 3, category: 'urgency' },
    { word: 'urgent', weight: 3, category: 'urgency' },
    { word: 'act now', weight: 3, category: 'urgency' },
    { word: 'guaranteed', weight: 3, category: 'promise' },
    { word: 'risk free', weight: 3, category: 'promise' },
    { word: 'credit', weight: 3, category: 'financial' },
    { word: 'loan', weight: 3, category: 'financial' },
    { word: 'deal', weight: 3, category: 'offer' },
    { word: 'discount', weight: 3, category: 'offer' },
    { word: 'cheap', weight: 3, category: 'offer' },
    { word: 'order now', weight: 3, category: 'action' },
    { word: 'exclusive', weight: 3, category: 'offer' },
    { word: 'congratulations', weight: 3, category: 'gambling' },
    { word: 'selected', weight: 3, category: 'personalization' },
    { word: 'claim', weight: 3, category: 'action' },
    { word: 'investment', weight: 3, category: 'financial' },
    { word: 'miracle', weight: 3, category: 'promise' },
    { word: 'easy', weight: 3, category: 'promise' },
    { word: 'no cost', weight: 3, category: 'offer' },
    { word: 'trial', weight: 3, category: 'offer' },
    { word: 'amazing', weight: 3, category: 'promise' },
    { word: 'secret', weight: 3, category: 'promise' },
    { word: 'earn', weight: 3, category: 'financial' },
    { word: 'income', weight: 3, category: 'financial' },
    { word: 'work from home', weight: 3, category: 'employment' },
    { word: 'double your', weight: 3, category: 'promise' },
    { word: 'gift', weight: 3, category: 'offer' },
    { word: 'promo', weight: 3, category: 'offer' },
    { word: 'promotion', weight: 3, category: 'offer' },
    { word: 'unbelievable', weight: 3, category: 'promise' },
    { word: 'click here', weight: 3, category: 'action' },
    { word: 'visit', weight: 3, category: 'action' },
    { word: 'call now', weight: 3, category: 'action' },
    { word: 'apply now', weight: 3, category: 'action' },
    { word: 'save big', weight: 3, category: 'offer' },
    { word: 'lowest price', weight: 3, category: 'offer' },
    { word: 'act fast', weight: 3, category: 'urgency' },
    { word: 'lose weight', weight: 3, category: 'health' },
    { word: 'weight loss', weight: 3, category: 'health' },
    { word: 'viagra', weight: 3, category: 'health' },
    { word: 'cialis', weight: 3, category: 'health' },
    { word: 'luxury', weight: 3, category: 'lifestyle' },
    { word: 'billion', weight: 3, category: 'financial' },
    { word: 'million', weight: 3, category: 'financial' },
    { word: 'guarantee', weight: 3, category: 'promise' },
    
    // Medium-weight keywords (weight: 2)
    { word: 'switch now', weight: 2, category: 'action' },
    { word: 'download app', weight: 2, category: 'action' },
    { word: 'start a sip', weight: 2, category: 'financial' },
    { word: 'our funds', weight: 2, category: 'financial' },
    { word: 'portfolio', weight: 2, category: 'financial' },
    { word: 'statements', weight: 2, category: 'financial' },
    { word: 'invest online', weight: 2, category: 'financial' },
    { word: 'webinar', weight: 2, category: 'event' },
    { word: 'invite', weight: 2, category: 'event' },
    { word: 'exclusive workshop', weight: 2, category: 'event' },
    { word: 'boost your chances', weight: 2, category: 'promise' },
    { word: 'standout application', weight: 2, category: 'promise' },
    { word: 'insider knowledge', weight: 2, category: 'promise' },
    { word: 'expert guidance', weight: 2, category: 'promise' },
    { word: 'live q&a', weight: 2, category: 'event' },
    { word: "don't miss out", weight: 2, category: 'urgency' },
    { word: 'get ahead', weight: 2, category: 'promise' },
    { word: 'your future', weight: 2, category: 'personalization' },
    { word: 'worth your time', weight: 2, category: 'promise' },
    { word: 'medical school', weight: 2, category: 'education' },
    { word: 'application workshop', weight: 2, category: 'event' },
    { word: 'proven strategies', weight: 2, category: 'promise' },
    { word: 'compelling supporting documents', weight: 2, category: 'promise' },
    { word: 'mcat requirements', weight: 2, category: 'education' },
    { word: 'admissions experts', weight: 2, category: 'promise' },
    { word: 'secure an interview', weight: 2, category: 'promise' },
    { word: 'crisp, engaging webinar', weight: 2, category: 'event' },
    { word: 'dynamic and resilient portfolio', weight: 2, category: 'financial' },
    { word: "unique in today's market", weight: 2, category: 'promise' },
    { word: 'time-tested factors', weight: 2, category: 'promise' },
    { word: 'momentum', weight: 2, category: 'financial' },
    { word: 'value', weight: 2, category: 'financial' },
    { word: 'quality', weight: 2, category: 'promise' },
    { word: 'low volatility', weight: 2, category: 'financial' },
    { word: 'multi-factor', weight: 2, category: 'financial' },
    { word: 'fund', weight: 2, category: 'financial' },
    { word: 'long term', weight: 2, category: 'financial' },
    { word: 'wealth', weight: 2, category: 'financial' },
    { word: 'adaptive', weight: 2, category: 'promise' },
    { word: 'evolving', weight: 2, category: 'promise' },
    { word: 'quantitative model', weight: 2, category: 'financial' },
    { word: 'consult their financial advisers', weight: 2, category: 'financial' },
    { word: 'suitable for investors', weight: 2, category: 'financial' },
    { word: 'selected for you', weight: 2, category: 'personalization' },
    { word: 'step by step', weight: 2, category: 'promise' },
    { word: 'apply to med. school', weight: 2, category: 'education' },
    { word: 'shine', weight: 2, category: 'promise' },
    { word: 'tomorrow', weight: 2, category: 'urgency' },
    { word: 'today', weight: 2, category: 'urgency' },
    { word: 'got a free hour', weight: 2, category: 'offer' },
    { word: 'invest it', weight: 2, category: 'financial' },
    { word: 'smarter equity strategy', weight: 2, category: 'financial' },
    { word: 'curious about', weight: 2, category: 'engagement' },
    { word: 'join us', weight: 2, category: 'action' },
    { word: "here's what you'll learn", weight: 2, category: 'promise' },
    { word: 'we are sure', weight: 2, category: 'promise' },
    { word: "it'll be worth your time", weight: 2, category: 'promise' },
    { word: 'this is your chance', weight: 2, category: 'urgency' },
    { word: "don't have to navigate", weight: 2, category: 'promise' },
    { word: 'designed to give you', weight: 2, category: 'promise' },
    { word: 'rise above the rest', weight: 2, category: 'promise' },
    { word: 'insider tips', weight: 2, category: 'promise' },
    { word: 'get your questions answered', weight: 2, category: 'promise' },
    { word: 'real time', weight: 2, category: 'promise' },
    { word: 'competitive', weight: 2, category: 'promise' },
    { word: 'admissions process', weight: 2, category: 'education' },
    { word: 'your future in medicine begins here', weight: 2, category: 'education' },
    
    // Astrology and horoscope keywords (weight: 2-3)
    { word: 'horoscope', weight: 3, category: 'astrology' },
    { word: 'life report', weight: 3, category: 'astrology' },
    { word: 'detailed life report', weight: 3, category: 'astrology' },
    { word: '50% off', weight: 3, category: 'offer' },
    { word: 'flat 50%', weight: 3, category: 'offer' },
    { word: 'future', weight: 2, category: 'astrology' },
    { word: 'major events', weight: 2, category: 'astrology' },
    { word: 'personalised', weight: 2, category: 'personalization' },
    { word: 'predictions', weight: 3, category: 'astrology' },
    { word: 'comprehensive analysis', weight: 2, category: 'promise' },
    { word: 'planetary', weight: 2, category: 'astrology' },
    { word: 'mahadasha', weight: 2, category: 'astrology' },
    { word: 'remedies', weight: 2, category: 'astrology' },
    { word: 'overcome tough challenges', weight: 2, category: 'promise' },
    { word: 'free ask a question', weight: 3, category: 'offer' },
    { word: 'free telephonic consultation', weight: 3, category: 'offer' },
    { word: 'report delivery', weight: 2, category: 'service' },
    { word: 'clearly revealed', weight: 2, category: 'promise' },
    { word: 'buy now', weight: 3, category: 'action' },
    { word: 'plan your future', weight: 2, category: 'astrology' },
    { word: 'get predictions', weight: 3, category: 'astrology' },
    { word: 'entire life', weight: 2, category: 'astrology' },
    { word: 'important life-areas', weight: 2, category: 'astrology' },
    { word: 'support@ganeshaspeaks.com', weight: 3, category: 'contact' },
    { word: '0091-79-4900-7777', weight: 3, category: 'contact' },
    { word: 'unbelievable offer', weight: 3, category: 'offer' },
    { word: 'why wait', weight: 2, category: 'urgency' },
    { word: 'save flat', weight: 2, category: 'offer' },
    { word: 'anxious about your future', weight: 2, category: 'emotion' },
    { word: 'glimpse of your entire life', weight: 2, category: 'astrology' },
    { word: 'worth', weight: 2, category: 'promise' },
    { word: 'contact us at', weight: 2, category: 'contact' },
    
    // Additional enhanced keywords
    { word: 'detailed life report', weight: 3, category: 'astrology' },
    { word: 'personalised detailed life predictions', weight: 3, category: 'astrology' },
    { word: 'personalised guidance', weight: 2, category: 'astrology' },
    { word: 'get 50% off', weight: 3, category: 'offer' },
    { word: 'remedial solution for career', weight: 2, category: 'astrology' },
    { word: 'premium janampatri', weight: 2, category: 'astrology' },
    { word: 'career monthwise report', weight: 2, category: 'astrology' },
    { word: 'career forecast', weight: 2, category: 'astrology' },
    { word: 'detailed planetary mahadasha analysis', weight: 2, category: 'astrology' },
    { word: 'remedies to overcome tough challenges', weight: 2, category: 'astrology' },
    { word: 'get free ask a question', weight: 3, category: 'offer' },
    { word: 'get free telephonic consultation', weight: 3, category: 'offer' },
    { word: 'after report delivery', weight: 2, category: 'service' },
    { word: 'your future, clearly revealed', weight: 2, category: 'astrology' },
    { word: 'fwd: next week', weight: 2, category: 'urgency' },
    { word: 'med school', weight: 2, category: 'education' },
    { word: 'app. workshop', weight: 2, category: 'event' },
    { word: "it's now or never", weight: 3, category: 'urgency' },
    { word: 'do not miss this opportunity', weight: 3, category: 'urgency' },
    { word: 'special offer price', weight: 3, category: 'offer' },
    { word: 'just ₹549', weight: 3, category: 'offer' },
    { word: '₹549', weight: 3, category: 'offer' },
    { word: '₹329', weight: 3, category: 'offer' },
    { word: 'bejan daruwalla', weight: 2, category: 'astrology' },
    { word: "expert team of astrologers", weight: 2, category: 'astrology' },
    { word: '25+ years of experience', weight: 2, category: 'credibility' },
    { word: 'hurry! offer is for limited period only', weight: 3, category: 'urgency' },
    { word: 'your personalised answer will cover', weight: 2, category: 'promise' },
    { word: 'detailed answer to your question', weight: 2, category: 'promise' },
    { word: 'root cause of your issue', weight: 2, category: 'promise' },
    { word: 'action plan', weight: 2, category: 'promise' },
    { word: 'solution for your problem', weight: 2, category: 'promise' },
    { word: 'get free consultation worth', weight: 3, category: 'offer' },
    { word: 'explore all offers', weight: 2, category: 'offer' },
    { word: 'offer ends soon', weight: 2, category: 'urgency' },
    { word: 'claim your discount now', weight: 3, category: 'action' },
    { word: 'unlock up to 58% off today', weight: 3, category: 'offer' },
    { word: '25 years ago', weight: 2, category: 'credibility' },
    { word: 'investment journey', weight: 2, category: 'financial' },
    { word: 'grow with us', weight: 2, category: 'promise' },
    { word: 'watch now', weight: 2, category: 'action' },
    { word: 'astrology reports', weight: 2, category: 'astrology' },
    { word: 'astrology', weight: 2, category: 'astrology' },
    { word: 'janampatri', weight: 2, category: 'astrology' },
    { word: 'vedic astrology', weight: 2, category: 'astrology' },
    { word: 'love & marriage future', weight: 2, category: 'astrology' },
    { word: 'personalized guidance', weight: 2, category: 'astrology' },
    { word: 'remedial solutions for personal issues', weight: 2, category: 'astrology' },
    { word: 'remedial solution for marriage', weight: 2, category: 'astrology' },
    { word: 'remedial solution for love', weight: 2, category: 'astrology' },
    { word: 'kundli matching', weight: 2, category: 'astrology' },
    { word: 'kundli compatibility', weight: 2, category: 'astrology' },
    { word: 'decoded astrologically', weight: 2, category: 'astrology' },
    { word: 'your next 10 career years', weight: 2, category: 'astrology' },
    { word: 'your ultimate life blueprint', weight: 2, category: 'astrology' },
    { word: 'get 40% off', weight: 3, category: 'offer' },
    { word: 'get 58% off', weight: 3, category: 'offer' },
    { word: 'get 21% off', weight: 3, category: 'offer' },
    { word: 'get 25% off', weight: 3, category: 'offer' },
    { word: 'discover more powerful astrology reports', weight: 2, category: 'astrology' },
    { word: 'this limited-time offer', weight: 3, category: 'urgency' },
    { word: 'gain profound insights', weight: 2, category: 'promise' },
    { word: 'claim your discount', weight: 3, category: 'action' },
    { word: 'badhte', weight: 2, category: 'promise' },
    { word: 'plan your future', weight: 2, category: 'astrology' },
    { word: 'comprehensive analysis of all the important life-areas', weight: 2, category: 'astrology' },
    { word: 'glimpse of your entire life', weight: 2, category: 'astrology' },
    { word: 'worth your time', weight: 2, category: 'promise' },
    { word: 'do not miss out', weight: 2, category: 'urgency' },
    { word: 'now or never', weight: 3, category: 'urgency' },
    { word: 'limited period only', weight: 2, category: 'urgency' },
    { word: 'free consultation', weight: 3, category: 'offer' },
    { word: 'free telephonic consultation', weight: 3, category: 'offer' },
    { word: 'free ask a question', weight: 3, category: 'offer' },
    { word: 'worth ₹999', weight: 3, category: 'offer' },
    { word: 'worth ₹549', weight: 3, category: 'offer' },
    { word: 'blueprint', weight: 2, category: 'astrology' },
    { word: 'life blueprint', weight: 2, category: 'astrology' },
    { word: 'major events likely to happen', weight: 2, category: 'astrology' },
    { word: 'detailed answer', weight: 2, category: 'promise' },
    { word: 'root cause', weight: 2, category: 'promise' },
    { word: 'action plan', weight: 2, category: 'promise' },
    { word: 'solution for your problem', weight: 2, category: 'promise' },
    { word: 'personalised answer', weight: 2, category: 'promise' },
    { word: 'astrology report', weight: 2, category: 'astrology' },
    { word: 'personalised detailed life report', weight: 3, category: 'astrology' },
    { word: 'personalized guidance on career', weight: 2, category: 'astrology' },
    { word: 'love, health & more', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on love', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on health', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on marriage', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on future', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on life', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on wealth', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on education', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on finance', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on property', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on family', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on children', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on travel', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on abroad', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on job', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on profession', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on studies', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on exams', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on competitive exams', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on government job', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on private job', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on promotion', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on transfer', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business growth', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business expansion', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business partnership', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business loss', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business profit', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business investment', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business loan', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business debt', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business recovery', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business success', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business failure', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business dispute', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business litigation', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business settlement', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business agreement', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business contract', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business deal', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business negotiation', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business merger', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business acquisition', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business sale', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business purchase', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business rent', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business lease', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business mortgage', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business insurance', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business claim', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business compensation', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business settlement', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business dispute', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business litigation', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business agreement', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business contract', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business deal', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business negotiation', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business merger', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business acquisition', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business sale', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business purchase', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business rent', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business lease', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business mortgage', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business insurance', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business claim', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business compensation', weight: 2, category: 'astrology' },
    { word: 'personalised guidance on business settlement', weight: 2, category: 'astrology' },
  ];

  const urlPattern = /(https?:\/\/|www\.)[\w\-]+(\.[\w\-]+)+\S*/gi;
  const emailPattern = /[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/g;
  const phonePattern = /\b\d{10,}\b/g;

  let spamScore = 0;
  let matchedKeywords = [];
  let matchedKeywordCounts = {};
  let categoryScores = {};

  // Check for spam keywords and count occurrences with weights
  spamKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword.word.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches && matches.length > 0) {
      const weightedScore = matches.length * keyword.weight;
      spamScore += weightedScore;
      matchedKeywords.push(keyword.word);
      matchedKeywordCounts[keyword.word] = matches.length;
      
      // Track category scores
      if (!categoryScores[keyword.category]) {
        categoryScores[keyword.category] = 0;
      }
      categoryScores[keyword.category] += weightedScore;
    }
  });

  // Check for URLs, emails, phone numbers
  const urlMatches = text.match(urlPattern) || [];
  const emailMatches = text.match(emailPattern) || [];
  const phoneMatches = text.match(phonePattern) || [];
  const exclamationCount = (text.match(/!/g) || []).length;
  const dollarCount = (text.match(/\$/g) || []).length;
  const percentCount = (text.match(/%/g) || []).length;
  const uppercaseRatio = (text.match(/[A-Z]/g) || []).length / Math.max(1, text.length);
  const totalWords = text.split(/\s+/).filter(Boolean).length;
  const keywordRatio = matchedKeywords.length / Math.max(1, totalWords);
  const wordFreq = getWordFrequency(text);
  const repeatedWords = Object.entries(wordFreq).filter(([word, count]) => count > 10);
  
  // Find unique suspicious keywords (not in spamKeywords) that occur more than 3 times
  const uniqueSuspicious = Object.entries(wordFreq)
    .filter(([word, count]) => count > 3 && !spamKeywords.some(k => k.word === word) && word.length > 4)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word, count]) => ({ word, count }));

  const allCapsWords = text.split(/\s+/).filter(w => w.length > 3 && w === w.toUpperCase());
  
  // Enhanced scoring with statistical models
  spamScore += urlMatches.length * 2;
  spamScore += emailMatches.length * 2;
  spamScore += phoneMatches.length * 2;
  spamScore += exclamationCount * 0.5;
  spamScore += dollarCount * 0.5;
  spamScore += percentCount * 0.5;
  spamScore += repeatedWords.length;
  if (keywordRatio > 0.05) spamScore += 2;
  if (uppercaseRatio > 0.1) spamScore += 1;
  if (allCapsWords.length > 5) spamScore += 1;

  // Statistical Analysis using Poisson Distribution
  // Expected number of spam indicators in normal text (lambda)
  const expectedSpamIndicators = 2; // Based on typical non-spam text
  const observedSpamIndicators = matchedKeywords.length + urlMatches.length + emailMatches.length + phoneMatches.length;
  
  // Poisson probability of observing this many indicators by chance
  const poissonProb = poissonCDF(expectedSpamIndicators, observedSpamIndicators);
  const poissonSpamProbability = 1 - poissonProb; // Probability this is spam

  // Binomial Analysis for keyword frequency
  // Probability of a word being spam-related in normal text
  const spamWordProbability = 0.01; // 1% chance a random word is spam-related
  const totalWordCount = text.split(/\s+/).filter(Boolean).length;
  const observedSpamWords = matchedKeywords.length;
  
  // Binomial probability of observing this many spam words by chance
  const binomialProb = binomialCDF(totalWordCount, spamWordProbability, observedSpamWords);
  const binomialSpamProbability = 1 - binomialProb; // Probability this is spam

  // Combined statistical score (weighted average)
  const statisticalScore = (poissonSpamProbability * 0.6) + (binomialSpamProbability * 0.4);
  
  // Enhanced spam detection using statistical thresholds
  let isSpam = false;
  let level = 'None';
  let confidence = 0;

  // Statistical-based classification
  if (statisticalScore > 0.95) {
    isSpam = true;
    level = 'Very High';
    confidence = statisticalScore;
  } else if (statisticalScore > 0.85) {
    isSpam = true;
    level = 'High';
    confidence = statisticalScore;
  } else if (statisticalScore > 0.70) {
    isSpam = true;
    level = 'Moderate';
    confidence = statisticalScore;
  } else if (statisticalScore > 0.50) {
    isSpam = false;
    level = 'Low';
    confidence = 1 - statisticalScore;
  } else {
    isSpam = false;
    level = 'None';
    confidence = 1 - statisticalScore;
  }

  // Fallback to traditional scoring if statistical analysis is inconclusive
  if (statisticalScore < 0.30 && spamScore >= 8) {
    isSpam = true;
    level = 'High';
    confidence = Math.min(0.9, spamScore / 15);
  } else if (statisticalScore < 0.30 && spamScore >= 4) {
    isSpam = true;
    level = 'Moderate';
    confidence = Math.min(0.7, spamScore / 10);
  } else if (statisticalScore < 0.30 && spamScore >= 2) {
    isSpam = false;
    level = 'Low';
    confidence = Math.max(0.3, 1 - (spamScore / 10));
  }

  // Calculate spam percentage using statistical probability
  const spamPercent = Math.round(statisticalScore * 100);

  return {
    isSpam,
    level,
    spamScore,
    spamPercent,
    confidence: Math.round(confidence * 100),
    statisticalScore: Math.round(statisticalScore * 100),
    poissonProbability: Math.round(poissonSpamProbability * 100),
    binomialProbability: Math.round(binomialSpamProbability * 100),
    matchedKeywords,
    matchedKeywordCounts,
    categoryScores,
    uniqueSuspicious,
    urlMatches,
    emailMatches,
    phoneMatches,
    repeatedWords: repeatedWords.map(([word, count]) => ({ word, count })),
    allCapsWords,
    expectedSpamIndicators,
    observedSpamIndicators,
    totalWordCount,
    observedSpamWords,
  };
};

// Generate summary using extractive summarization
const generateSummary = (text) => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  if (sentences.length <= 3) {
    return text.trim();
  }

  // Score sentences based on word frequency and position
  const wordFreq = getWordFrequency(text);
  const sentenceScores = sentences.map((sentence, index) => {
    const words = sentence.toLowerCase().split(/\s+/);
    const score = words.reduce((sum, word) => sum + (wordFreq[word] || 0), 0);
    const positionScore = index < sentences.length * 0.3 ? 1.2 : 1.0; // Boost early sentences
    return {
      sentence: sentence.trim(),
      score: score * positionScore,
      index
    };
  });

  // Select top 3 sentences
  const topSentences = sentenceScores
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .sort((a, b) => a.index - b.index)
    .map(s => s.sentence);

  return topSentences.join('. ') + '.';
}

// Generate detailed summary with multiple sections
const generateDetailedSummary = (text) => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);

  const wordFreq = getWordFrequency(text);
  const topKeywords = Object.entries(wordFreq)
    .filter(([word]) => word.length > 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);

  // Extract key sentences based on keyword density
  const keyStatements = sentences.map((sentence, index) => {
    const words = sentence.toLowerCase().split(/\s+/);
    const keywordScore = words.reduce((score, word) => {
      return score + (topKeywords.includes(word) ? 1 : 0);
    }, 0);
    const positionScore = index < sentences.length * 0.3 ? 1.5 : 1.0;
    return {
      sentence: sentence.trim(),
      score: keywordScore * positionScore,
      index,
      type: detectStatementType(sentence)
    };
  }).sort((a, b) => b.score - a.score);

  const mainPoints = keyStatements.slice(0, 5).sort((a, b) => a.index - b.index);
  let conclusions = keyStatements.filter(s => s.type === 'conclusion').slice(0, 3);
  let questions = keyStatements.filter(s => s.type === 'question').slice(0, 3);

  // Fallbacks for conclusions and questions
  let fallbackConclusions = generateImplicitConclusions(text);
  let fallbackQuestions = generateImplicitQuestions(text);
  if ((!conclusions || conclusions.length === 0) && fallbackConclusions && fallbackConclusions.length > 0) {
    conclusions = fallbackConclusions.map(c => ({ sentence: c }));
  }
  if ((!questions || questions.length === 0) && fallbackQuestions && fallbackQuestions.length > 0) {
    questions = fallbackQuestions.map(q => ({ sentence: q }));
  }
  // If still empty, provide generic
  if (!conclusions || conclusions.length === 0) {
    conclusions = [{ sentence: 'No explicit conclusion found. The transcript ends without a clear summary.' }];
  }
  if (!questions || questions.length === 0) {
    questions = [{ sentence: 'What is the main takeaway from this transcript?' }];
  }

  // Overview and structure fallbacks
  let overview = generateContentOverview(text);
  if (!overview || typeof overview !== 'object') overview = {};
  overview.length = overview.length || `${text.length} chars`;
  overview.tone = overview.tone || 'Neutral';
  overview.primaryTopic = overview.primaryTopic || (topKeywords[0] || 'General');
  overview.complexity = overview.complexity || 'Standard';
  overview.readingLevel = overview.readingLevel || 'N/A';

  let structure = analyzeDocumentStructure(text);
  if (!structure || typeof structure !== 'object') structure = {};
  structure.type = structure.type || 'N/A';
  structure.pattern = structure.pattern || 'N/A';

  return {
    brief: generateSummary(text),
    mainPoints: mainPoints.map(p => p.sentence),
    keyFindings: extractKeyFindings(text),
    conclusions: conclusions.map(c => c.sentence),
    questions: questions.map(q => q.sentence),
    overview,
    structure
  };
}

// Detect statement types
const detectStatementType = (sentence) => {
  const lower = sentence.toLowerCase();
  if (lower.includes('?')) return 'question';
  if (lower.includes('conclusion') || lower.includes('summary') || lower.includes('therefore')) return 'conclusion';
  if (lower.includes('important') || lower.includes('key') || lower.includes('main')) return 'sequence';
  if (lower.includes('first') || lower.includes('second') || lower.includes('next')) return 'sequence';
  return 'statement';
}

// Generate insights about the transcript
const generateInsights = (text) => {
  const insights = [];
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);

  // Length insights
  if (words.length > 500) {
    insights.push({
      type: 'length',
      icon: '📏',
      title: 'Long Content',
      description: `This is a substantial transcript with ${words.length} words. Average reading time: ${Math.ceil(words.length / 200)} minutes.`,
      severity: 'info'
    });
  } else if (words.length < 50 && words.length > 0) {
    insights.push({
      type: 'length',
      icon: '📝',
      title: 'Short Content',
      description: `Brief transcript with ${words.length} words. Quick read under 1 minute.`,
      severity: 'info'
    });
  }

  // Complexity insights
  if (sentences.length > 0) {
    const avgWordsPerSentence = words.length / sentences.length;
    if (avgWordsPerSentence > 20) {
      insights.push({
        type: 'complexity',
        icon: '🧠',
        title: 'Complex Language',
        description: `Average sentence length is ${avgWordsPerSentence.toFixed(1)} words. This content uses complex sentence structures.`,
        severity: 'warning'
      });
    }
  }

  // Repetition insights
  const wordFreq = getWordFrequency(text);
  const mostCommon = Object.entries(wordFreq)
    .filter(([word]) => word.length > 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (mostCommon.length > 0) {
    insights.push({
      type: 'keywords',
      icon: '🔑',
      title: 'Key Topics',
      description: `Main topics: ${mostCommon.map(([word, count]) => `${word} (${count}x)`).join(', ')}`,
      severity: 'success'
    });
  }

  // Question detection
  const questionCount = (text.match(/\?/g) || []).length;
  if (questionCount > 0) {
    insights.push({
      type: 'questions',
      icon: '❓',
      title: 'Interactive Content',
      description: `Contains ${questionCount} question${questionCount > 1 ? 's' : ''}, suggesting interactive or educational content.`,
      severity: 'info'
    });
  }

  // Fallback: If no meaningful insights, add a content-aware default
  if (insights.length === 0) {
    if (!text || words.length === 0) {
      insights.push({
        type: 'empty',
        icon: '💡',
        title: 'No Content',
        description: 'No transcript content was provided for analysis.',
        severity: 'info'
      });
    } else if (words.length < 10) {
      insights.push({
        type: 'minimal',
        icon: '💡',
        title: 'Minimal Content',
        description: 'The transcript is too short for meaningful insights. Please provide more content.',
        severity: 'info'
      });
    } else {
      insights.push({
        type: 'general',
        icon: '💡',
        title: 'General Content',
        description: 'The transcript does not contain enough distinctive features for specific insights, but it is available for review.',
        severity: 'info'
      });
    }
  }

  return insights;
};

// Enhanced sentiment analysis using multiple approaches
const analyzeSentiment = (text) => {
  const positiveWords = [
    'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like', 'happy',
    'positive', 'success', 'successful', 'achieve', 'achievement', 'better', 'best', 'perfect',
    'awesome', 'brilliant', 'outstanding', 'remarkable', 'impressive', 'incredible', 'beautiful',
    'fantastic', 'marvelous', 'superb', 'exceptional', 'magnificent', 'terrific', 'splendid',
    'delightful', 'pleasurable', 'enjoyable', 'satisfying', 'fulfilling', 'gratifying', 'thrilled',
    'excited', 'optimistic', 'confident', 'hopeful', 'enthusiastic', 'passionate', 'inspired',
    'motivated', 'empowered', 'accomplished', 'proud', 'blessed', 'grateful', 'fortunate'
  ];

  const negativeWords = [
    'bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike', 'sad', 'angry', 'disappointed',
    'negative', 'failure', 'failed', 'wrong', 'worse', 'worst', 'problem', 'issue', 'difficult',
    'impossible', 'disaster', 'crisis', 'concern', 'worry', 'fear', 'danger', 'risk',
    'disturbing', 'alarming', 'shocking', 'devastating', 'tragic', 'unfortunate', 'regrettable',
    'frustrating', 'annoying', 'irritating', 'offensive', 'disgusting', 'appalling', 'dreadful',
    'miserable', 'depressed', 'anxious', 'stressed', 'overwhelmed', 'discouraged', 'hopeless',
    'defeated', 'broken', 'damaged', 'harmful', 'destructive', 'toxic', 'corrupt'
  ];

  const intensifiers = [
    'very', 'extremely', 'incredibly', 'absolutely', 'completely', 'totally', 'really',
    'quite', 'rather', 'fairly', 'somewhat', 'slightly', 'moderately', 'highly',
    'tremendously', 'enormously', 'exceptionally', 'remarkably', 'particularly'
  ];

  const negators = [
    'not', 'no', 'never', 'none', 'nothing', 'nobody', 'nowhere', 'neither',
    'hardly', 'barely', 'scarcely', 'rarely', 'seldom', 'without'
  ];

  const words = text.toLowerCase().split(/\s+/);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  let positiveScore = 0;
  let negativeScore = 0;
  let neutralScore = 0;
  let intensityMultiplier = 1;
  let contextualFactors = 0;

  // Analyze word-level sentiment with context
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const prevWord = i > 0 ? words[i - 1] : '';
    const nextWord = i < words.length - 1 ? words[i + 1] : '';
    
    // Check for intensifiers
    let currentIntensity = 1;
    if (intensifiers.includes(prevWord)) {
      currentIntensity = 1.5;
    }
    
    // Check for negators
    let isNegated = false;
    if (negators.includes(prevWord) || negators.includes(words[i - 2])) {
      isNegated = true;
    }
    
    // Analyze sentiment with context
    if (positiveWords.includes(word)) {
      if (isNegated) {
        negativeScore += currentIntensity;
      } else {
        positiveScore += currentIntensity;
      }
    } else if (negativeWords.includes(word)) {
      if (isNegated) {
        positiveScore += currentIntensity * 0.8; // Negated negative becomes positive but weaker
      } else {
        negativeScore += currentIntensity;
      }
    }
  }

  // Analyze punctuation and capitalization patterns
  const exclamationCount = (text.match(/!/g) || []).length;
  const questionCount = (text.match(/\?/g) || []).length;
  const allCapsWords = words.filter(word => word.length > 2 && word === word.toUpperCase()).length;
  
  // Exclamations often indicate strong emotions
  if (exclamationCount > 0) {
    intensityMultiplier += exclamationCount * 0.1;
    contextualFactors += exclamationCount * 0.05;
  }
  
  // Questions might indicate uncertainty or engagement
  if (questionCount > 0) {
    neutralScore += questionCount * 0.1;
  }
  
  // All caps might indicate strong emotions
  if (allCapsWords > 0) {
    intensityMultiplier += allCapsWords * 0.15;
  }

  // Analyze sentence-level patterns
  sentences.forEach(sentence => {
    const sentenceLower = sentence.toLowerCase();
    
    // Check for comparative language
    if (sentenceLower.includes('better than') || sentenceLower.includes('superior to')) {
      positiveScore += 0.5;
    }
    if (sentenceLower.includes('worse than') || sentenceLower.includes('inferior to')) {
      negativeScore += 0.5;
    }
    
    // Check for emotional expressions
    if (sentenceLower.includes('i feel') || sentenceLower.includes('i think')) {
      contextualFactors += 0.1;
    }
    
    // Check for certainty indicators
    if (sentenceLower.includes('definitely') || sentenceLower.includes('certainly') || 
        sentenceLower.includes('absolutely')) {
      intensityMultiplier += 0.1;
    }
    
    // Check for uncertainty indicators
    if (sentenceLower.includes('maybe') || sentenceLower.includes('perhaps') || 
        sentenceLower.includes('might') || sentenceLower.includes('could')) {
      neutralScore += 0.2;
    }
  });

  // Apply intensity multiplier
  positiveScore *= intensityMultiplier;
  negativeScore *= intensityMultiplier;

  // Calculate content type factors
  const textLength = words.length;
  const avgWordsPerSentence = textLength / sentences.length;
  
  // Longer, more complex sentences might be more neutral/analytical
  if (avgWordsPerSentence > 20) {
    neutralScore += 0.3;
  }
  
  // Very short text might be less reliable
  let reliabilityFactor = Math.min(1, textLength / 50);
  if (textLength < 10) {
    reliabilityFactor = 0.3;
  }

  // Calculate final scores
  const totalSentimentWords = positiveScore + negativeScore + neutralScore;
  const netScore = (positiveScore - negativeScore) / Math.max(1, textLength);
  
  // Determine dominant sentiment
  let label = 'Neutral';
  let rawConfidence = 0.5;
  let normalizedScore = 0;

  if (totalSentimentWords > 0) {
    normalizedScore = netScore;
    
    if (positiveScore > negativeScore && positiveScore > neutralScore) {
      label = 'Positive';
      rawConfidence = Math.min(0.95, 0.5 + (positiveScore / totalSentimentWords) * 0.5);
    } else if (negativeScore > positiveScore && negativeScore > neutralScore) {
      label = 'Negative';
      rawConfidence = Math.min(0.95, 0.5 + (negativeScore / totalSentimentWords) * 0.5);
    } else {
      label = 'Neutral';
      rawConfidence = Math.max(0.4, 0.8 - Math.abs(positiveScore - negativeScore) / totalSentimentWords);
    }
  }

  // Adjust confidence based on various factors
  let adjustedConfidence = rawConfidence;
  
  // Text length factor
  adjustedConfidence *= reliabilityFactor;
  
  // Context factor
  adjustedConfidence += contextualFactors * 0.1;
  
  // Ensure confidence is within reasonable bounds
  adjustedConfidence = Math.max(0.2, Math.min(0.95, adjustedConfidence));
  
  // Add some variability based on content characteristics
  const contentHash = text.length + words.length + sentences.length;
  const variabilityFactor = 0.05 * Math.sin(contentHash * 0.1);
  adjustedConfidence += variabilityFactor;
  
  // Final bounds check
  adjustedConfidence = Math.max(0.15, Math.min(0.98, adjustedConfidence));

  return {
    score: normalizedScore,
    label,
    confidence: adjustedConfidence,
    details: {
      positiveWords: Math.round(positiveScore * 10) / 10,
      negativeWords: Math.round(negativeScore * 10) / 10,
      neutralWords: Math.round(neutralScore * 10) / 10,
      totalWords: words.length,
      sentenceCount: sentences.length,
      intensityMultiplier: Math.round(intensityMultiplier * 100) / 100,
      reliabilityFactor: Math.round(reliabilityFactor * 100) / 100,
      exclamationCount,
      questionCount,
      allCapsWords
    }
  };
};

// Get text statistics
const getStatistics = (text) => {
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const averageReadingSpeed = 200; // words per minute
  
  return {
    wordCount: words.length,
    sentenceCount: sentences.length,
    averageWordsPerSentence: words.length / sentences.length || 0,
    readingTime: Math.ceil(words.length / averageReadingSpeed),
    characterCount: text.length,
    paragraphCount: text.split(/\n\s*\n/).length
  };
};

// Extract keywords using frequency analysis
const extractKeywords = (text) => {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does',
    'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this',
    'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him',
    'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their'
  ]);

  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));

  const frequency = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count, percentage: (count / words.length * 100).toFixed(1) }));
};

// Calculate readability score (simplified Flesch Reading Ease)
const calculateReadability = (text) => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);
  const words = text.split(/\s+/).filter(w => w.trim().length > 0);
  const syllables = words.reduce((count, word) => count + countSyllables(word), 0);

  if (sentences.length === 0 || words.length === 0) return 0;

  const avgSentenceLength = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;
  
  const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  
  return Math.max(0, Math.min(100, score));
};

// Count syllables in a word (simplified)
const countSyllables = (word) => {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  
  const vowels = 'aeiouy';
  let syllableCount = 0;
  let previousWasVowel = false;

  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i]);
    if (isVowel && !previousWasVowel) {
      syllableCount++;
    }
    previousWasVowel = isVowel;
  }

  if (word.endsWith('e')) syllableCount--;
  return Math.max(1, syllableCount);
};

// Analyze topics using keyword clustering
const analyzeTopics = (text) => {
  const keywords = extractKeywords(text);
  const topics = {};
  
  // Simple topic categorization
  const topicKeywords = {
    'Technology': ['technology', 'computer', 'software', 'digital', 'system', 'data', 'online', 'internet'],
    'Business': ['business', 'company', 'market', 'customer', 'product', 'service', 'strategy', 'growth'],
    'Education': ['learn', 'study', 'education', 'student', 'teacher', 'school', 'knowledge', 'skill'],
    'Health': ['health', 'medical', 'doctor', 'patient', 'treatment', 'care', 'wellness', 'medicine'],
    'Science': ['research', 'study', 'analysis', 'experiment', 'scientific', 'discovery', 'theory'],
    'Personal': ['personal', 'experience', 'life', 'family', 'friend', 'relationship', 'feeling']
  };

  keywords.forEach(({ word, count }) => {
    let assigned = false;
    for (const [topic, topicWords] of Object.entries(topicKeywords)) {
      if (topicWords.includes(word)) {
        topics[topic] = (topics[topic] || 0) + count;
        assigned = true;
        break;
      }
    }
    if (!assigned) {
      topics['General'] = (topics['General'] || 0) + count;
    }
  });

  return Object.entries(topics)
    .sort((a, b) => b[1] - a[1])
    .map(([topic, count]) => ({ topic, count }));
};


// Enhanced emotion analysis with exact matching, negation, and expanded lists
const analyzeEmotions = (text) => {
  const emotionWords = {
    'Joy': [
      'happy', 'joy', 'excited', 'delighted', 'cheerful', 'glad', 'pleased', 'thrilled', 'content', 'satisfied', 'elated', 'ecstatic', 'grateful', 'optimistic', 'hopeful', 'enjoy', 'smile', 'laugh', 'bliss', 'enthusiastic', 'uplifted', 'merry', 'jovial', 'glee', 'rejoice', 'radiant', 'buoyant', 'euphoric', 'sunny', 'lively', 'vivid', 'vibrant'
    ],
    'Sadness': [
      'sad', 'depressed', 'disappointed', 'melancholy', 'grief', 'sorrow', 'unhappy', 'down', 'gloomy', 'mournful', 'tearful', 'regret', 'lonely', 'despair', 'hopeless', 'heartbroken', 'blue', 'dismal', 'forlorn', 'dejected', 'weary', 'pessimistic', 'suffer', 'cry', 'lament', 'anguish', 'wistful', 'remorse', 'loss', 'pain', 'hurt'
    ],
    'Anger': [
      'angry', 'furious', 'irritated', 'annoyed', 'rage', 'mad', 'frustrated', 'resentful', 'outraged', 'enraged', 'agitated', 'cross', 'indignant', 'offended', 'hostile', 'bitter', 'exasperated', 'infuriated', 'irate', 'provoked', 'incensed', 'wrath', 'disgusted', 'scorn', 'contempt', 'vengeful', 'fume', 'grudge', 'aggression', 'temper', 'tantrum'
    ],
    'Fear': [
      'afraid', 'scared', 'worried', 'anxious', 'nervous', 'terrified', 'concerned', 'fearful', 'panic', 'alarmed', 'apprehensive', 'dread', 'uneasy', 'timid', 'shy', 'phobia', 'horror', 'fright', 'startled', 'shaken', 'tremble', 'coward', 'intimidated', 'paranoid', 'hesitant', 'doubt', 'uncertain', 'insecure', 'distressed', 'alarmed', 'spooked'
    ],
    'Surprise': [
      'surprised', 'amazed', 'astonished', 'shocked', 'unexpected', 'sudden', 'startled', 'stunned', 'dumbfounded', 'flabbergasted', 'speechless', 'baffled', 'bewildered', 'astounded', 'marvel', 'wonder', 'awe', 'unforeseen', 'unanticipated', 'unpredictable', 'unusual', 'uncommon', 'remarkable', 'extraordinary', 'unimaginable', 'unthinkable', 'unbelievable', 'miraculous', 'curious', 'peculiar', 'odd'
    ],
    'Trust': [
      'trust', 'confident', 'reliable', 'secure', 'safe', 'certain', 'assured', 'faith', 'dependable', 'loyal', 'honest', 'integrity', 'credible', 'authentic', 'genuine', 'devoted', 'steadfast', 'faithful', 'committed', 'supportive', 'consistent', 'stable', 'sure', 'guaranteed', 'predictable', 'solid', 'firm', 'unwavering', 'trustworthy', 'belief', 'conviction'
    ],
    'Disgust': [
      'disgust', 'disgusted', 'repulsed', 'revolted', 'nauseated', 'sickened', 'gross', 'abhorrent', 'loath', 'detest', 'aversion', 'distaste', 'offended', 'repelled', 'appalled', 'horrified', 'revulsion', 'nausea', 'repugnant', 'vile', 'foul', 'sickly', 'yuck', 'yucky', 'filthy', 'dirty', 'unclean', 'contaminated', 'tainted', 'putrid', 'rotten'
    ]
     
    };

  // Negation words
  const negations = ['not', "don't", "doesn't", "didn't", "isn't", "wasn't", "aren't", "weren't", "no", "never", "none", "cannot", "can't", "won't", "without"];

  // Tokenize and keep track of negation context (window of 2 words before)
  const words = text.toLowerCase().replace(/[^\w\s']/g, '').split(/\s+/);
  const emotions = {};
  const totalWords = words.length;

  Object.entries(emotionWords).forEach(([emotion, wordList]) => {
    let count = 0;
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      // Exact match only
      if (wordList.includes(word)) {
        // Check for negation in previous 2 words
        const prev1 = words[i - 1] || '';
        const prev2 = words[i - 2] || '';
        const isNegated = negations.includes(prev1) || negations.includes(prev2);
        if (!isNegated) {
          count++;
        }
      }
    }
    if (count > 0) {
      // Normalize by total words for large texts
      emotions[emotion] = Number(((count / totalWords) * 100).toFixed(2));
    }
  });

  // If no emotion detected, return Neutral
  if (Object.keys(emotions).length === 0) {
    return [{ emotion: 'Neutral', count: 100 }];
  }

  // Return sorted by percentage descending
  return Object.entries(emotions)
    .sort((a, b) => b[1] - a[1])
    .map(([emotion, count]) => ({ emotion, count }));
};

// Linguistic analysis
const analyzeLinguistics = (text) => {
  const words = text.toLowerCase().split(/\s+/);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);
  
  // Analyze word complexity
  const complexWords = words.filter(word => word.length > 6);
  const simpleWords = words.filter(word => word.length <= 6);
  
  // Analyze sentence types
  const declarative = sentences.filter(s => !s.includes('?') && !s.includes('!')).length;
  const interrogative = sentences.filter(s => s.includes('?')).length;
  const exclamatory = sentences.filter(s => s.includes('!')).length;
  
  // Analyze tense usage
  const pastTense = words.filter(word => word.endsWith('ed') || ['was', 'were', 'had'].includes(word)).length;
  const presentTense = words.filter(word => ['is', 'are', 'am', 'have', 'has'].includes(word)).length;
  const futureTense = words.filter(word => ['will', 'shall', 'going'].includes(word)).length;
  
  return {
    vocabularyComplexity: (complexWords.length / words.length * 100).toFixed(1) + '%',
    sentenceTypes: {
      declarative: declarative,
      interrogative: interrogative,
      exclamatory: exclamatory
    },
    tenseDistribution: {
      past: pastTense,
      present: presentTense,
      future: futureTense
    },
    averageWordLength: (words.reduce((sum, word) => sum + word.length, 0) / words.length).toFixed(1),
    uniqueWords: new Set(words).size,
    repetitionRate: ((words.length - new Set(words).size) / words.length * 100).toFixed(1) + '%'
  };
};

// Structural analysis
const analyzeStructure = (text) => {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  // Analyze paragraph structure
  const paragraphLengths = paragraphs.map(p => p.split(/[.!?]+/).length);
  const avgParagraphLength = paragraphLengths.reduce((sum, len) => sum + len, 0) / paragraphLengths.length;
  
  // Detect lists and enumerations
  const bulletPoints = (text.match(/•|\*|-\s/g) || []).length;
  const numberLists = (text.match(/\d+\.\s/g) || []).length;
  
  return {
    paragraphStructure: {
      count: paragraphs.length,
      averageLength: avgParagraphLength.toFixed(1),
      variability: calculateVariability(paragraphLengths)
    },
    listElements: {
      bulletPoints: bulletPoints,
      numberedLists: numberLists
    },
    coherenceScore: calculateCoherence(text),
    transitionWords: countTransitionWords(text),
    organizationPattern: detectOrganizationPattern(text)
  };
};

// Content analysis
const analyzeContent = (text) => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  // Analyze content types
  const factualStatements = sentences.filter(s => 
    s.toLowerCase().includes('fact') || 
    s.toLowerCase().includes('data') || 
    s.toLowerCase().includes('research') ||
    /\d+%/.test(s)
  ).length;
  
  const opinions = sentences.filter(s => 
    s.toLowerCase().includes('think') || 
    s.toLowerCase().includes('believe') || 
    s.toLowerCase().includes('feel') ||
    s.toLowerCase().includes('opinion')
  ).length;
  
  const examples = sentences.filter(s => 
    s.toLowerCase().includes('example') || 
    s.toLowerCase().includes('instance') || 
    s.toLowerCase().includes('such as')
  ).length;
  
  // Analyze discourse markers
  const contrastMarkers = countDiscourseMarkers(text, ['however', 'but', 'although', 'despite', 'nevertheless']);
  const additiveMarkers = countDiscourseMarkers(text, ['also', 'moreover', 'furthermore', 'additionally', 'besides']);
  const causalMarkers = countDiscourseMarkers(text, ['because', 'therefore', 'consequently', 'as a result', 'due to']);
  
  return {
    contentTypes: {
      factual: factualStatements,
      opinions: opinions,
      examples: examples
    },
    discourseMarkers: {
      contrast: contrastMarkers,
      additive: additiveMarkers,
      causal: causalMarkers
    },
    argumentStructure: analyzeArgumentStructure(text),
    evidenceTypes: identifyEvidenceTypes(text)
  };
};

// Extract named entities (simplified)
const extractNamedEntities = (text) => {
  const entities = {
    people: [],
    organizations: [],
    locations: [],
    dates: [],
    numbers: []
  };
  
  // Simple pattern matching for entities
  const peoplePattern = /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g;
  const orgPattern = /\b[A-Z][a-z]+ (Inc|Corp|Company|Organization|Association|University|College)\b/g;
  const locationPattern = /\b[A-Z][a-z]+ (City|State|Country|Street|Avenue|Road)\b/g;
  const datePattern = /\b(January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2},? \d{4}\b/g;
  const numberPattern = /\b\d+(?:,\d{3})*(?:\.\d+)?\b/g;
  
  entities.people = Array.from(text.matchAll(peoplePattern)).map(match => match[0]).slice(0, 10);
  entities.organizations = Array.from(text.matchAll(orgPattern)).map(match => match[0]).slice(0, 10);
  entities.locations = Array.from(text.matchAll(locationPattern)).map(match => match[0]).slice(0, 10);
  entities.dates = Array.from(text.matchAll(datePattern)).map(match => match[0]).slice(0, 10);
  entities.numbers = Array.from(text.matchAll(numberPattern)).map(match => match[0]).slice(0, 10);
  
  return entities;
};

// Question analysis
const analyzeQuestions = (text) => {
  // Extract all questions from the text
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const questions = [];
  
  sentences.forEach((sentence, index) => {
    const trimmed = sentence.trim();
    
    // Check if sentence contains a question mark or has question patterns
    if (trimmed.includes('?') || isQuestionPattern(trimmed)) {
      const cleanQuestion = trimmed.replace(/^\s*["']|["']\s*$/g, '').trim();
      if (cleanQuestion.length > 0) {
        const questionType = categorizeQuestion(cleanQuestion);
        const isRhetorical = isRhetoricalQuestion(cleanQuestion);
        const complexity = analyzeQuestionComplexity(cleanQuestion);
        const purpose = analyzeQuestionPurpose(cleanQuestion);
        
        questions.push({
          text: cleanQuestion + (cleanQuestion.endsWith('?') ? '' : '?'),
          index: index,
          type: questionType.type,
          subType: questionType.subType,
          isRhetorical: isRhetorical,
          complexity: complexity,
          purpose: purpose,
          context: getQuestionContext(sentences, index),
          explanation: getQuestionExplanation(questionType.type, questionType.subType, purpose)
        });
      }
    }
  });
  
  // Count question types with enhanced categorization
  const questionTypes = {
    what: questions.filter(q => q.type === 'what').length,
    how: questions.filter(q => q.type === 'how').length,
    why: questions.filter(q => q.type === 'why').length,
    when: questions.filter(q => q.type === 'when').length,
    where: questions.filter(q => q.type === 'where').length,
    who: questions.filter(q => q.type === 'who').length,
    which: questions.filter(q => q.type === 'which').length,
    whose: questions.filter(q => q.type === 'whose').length,
    yesNo: questions.filter(q => q.type === 'yesNo').length,
    choice: questions.filter(q => q.type === 'choice').length,
    confirmation: questions.filter(q => q.type === 'confirmation').length,
    other: questions.filter(q => q.type === 'other').length
  };
  
  // Analyze question patterns and purposes
  const questionPurposes = {
    information: questions.filter(q => q.purpose === 'information').length,
    clarification: questions.filter(q => q.purpose === 'clarification').length,
    confirmation: questions.filter(q => q.purpose === 'confirmation').length,
    engagement: questions.filter(q => q.purpose === 'engagement').length,
    reflection: questions.filter(q => q.purpose === 'reflection').length,
    challenge: questions.filter(q => q.purpose === 'challenge').length
  };
  
  const complexityLevels = {
    simple: questions.filter(q => q.complexity === 'simple').length,
    moderate: questions.filter(q => q.complexity === 'moderate').length,
    complex: questions.filter(q => q.complexity === 'complex').length
  };
  
  return {
    totalQuestions: questions.length,
    questions: questions,
    questionTypes: questionTypes,
    questionPurposes: questionPurposes,
    complexityLevels: complexityLevels,
    rhetorical: questions.filter(q => q.isRhetorical).length,
    direct: questions.filter(q => !q.isRhetorical).length,
    questionsWithContext: questions.slice(0, 15), // Increased limit for better display
    averageComplexity: calculateAverageComplexity(questions),
    questionDensity: (questions.length / sentences.length * 100).toFixed(1),
    mostCommonType: findMostCommonQuestionType(questionTypes),
    questionInsights: generateQuestionInsights(questions, questionTypes, questionPurposes)
  };
};

// Enhanced question categorization with subtypes
const categorizeQuestion = (question) => {
  const lower = question.toLowerCase();
  
  // What questions - seeking information about things, definitions, explanations
  if (lower.includes('what')) {
    if (lower.includes('what is') || lower.includes('what are')) return { type: 'what', subType: 'definition' };
    if (lower.includes('what if') || lower.includes('what would')) return { type: 'what', subType: 'hypothetical' };
    if (lower.includes('what about') || lower.includes('what do you think')) return { type: 'what', subType: 'opinion' };
    return { type: 'what', subType: 'general' };
  }
  
  // How questions - seeking process, method, or manner
  if (lower.includes('how')) {
    if (lower.includes('how much') || lower.includes('how many')) return { type: 'how', subType: 'quantity' };
    if (lower.includes('how long') || lower.includes('how often')) return { type: 'how', subType: 'duration' };
    if (lower.includes('how do') || lower.includes('how to')) return { type: 'how', subType: 'process' };
    return { type: 'how', subType: 'method' };
  }
  
  // Why questions - seeking reasons, causes, purposes
  if (lower.includes('why')) {
    if (lower.includes('why not') || lower.includes('why don\'t')) return { type: 'why', subType: 'alternative' };
    if (lower.includes('why is') || lower.includes('why are')) return { type: 'why', subType: 'reason' };
    return { type: 'why', subType: 'cause' };
  }
  
  // When questions - seeking time information
  if (lower.includes('when')) {
    if (lower.includes('when will') || lower.includes('when shall')) return { type: 'when', subType: 'future' };
    if (lower.includes('when did') || lower.includes('when was')) return { type: 'when', subType: 'past' };
    return { type: 'when', subType: 'time' };
  }
  
  // Where questions - seeking location or place
  if (lower.includes('where')) {
    if (lower.includes('where is') || lower.includes('where are')) return { type: 'where', subType: 'location' };
    if (lower.includes('where do') || lower.includes('where can')) return { type: 'where', subType: 'action' };
    return { type: 'where', subType: 'place' };
  }
  
  // Who questions - seeking person or people
  if (lower.includes('who')) {
    if (lower.includes('who is') || lower.includes('who are')) return { type: 'who', subType: 'identity' };
    if (lower.includes('who will') || lower.includes('who can')) return { type: 'who', subType: 'capability' };
    return { type: 'who', subType: 'person' };
  }
  
  // Which questions - seeking choice or selection
  if (lower.includes('which')) {
    if (lower.includes('which one') || lower.includes('which ones')) return { type: 'which', subType: 'selection' };
    if (lower.includes('which way') || lower.includes('which method')) return { type: 'which', subType: 'option' };
    return { type: 'which', subType: 'choice' };
  }
  
  // Whose questions - seeking possession or ownership
  if (lower.includes('whose')) {
    return { type: 'whose', subType: 'possession' };
  }
  
  // Yes/No questions
  if (lower.startsWith('is ') || lower.startsWith('are ') || lower.startsWith('was ') || 
      lower.startsWith('were ') || lower.startsWith('do ') || lower.startsWith('does ') || 
      lower.startsWith('did ') || lower.startsWith('can ') || lower.startsWith('could ') || 
      lower.startsWith('will ') || lower.startsWith('would ') || lower.startsWith('should ') || 
      lower.startsWith('have ') || lower.startsWith('has ') || lower.startsWith('had ')) {
    return { type: 'yesNo', subType: 'binary' };
  }
  
  // Choice questions (either/or)
  if (lower.includes(' or ') && (lower.includes('either') || lower.includes('whether'))) {
    return { type: 'choice', subType: 'alternative' };
  }
  
  // Confirmation questions
  if (lower.includes('right?') || lower.includes('correct?') || lower.includes('isn\'t it?') || 
      lower.includes('don\'t you think?') || lower.includes('wouldn\'t you agree?')) {
    return { type: 'confirmation', subType: 'agreement' };
  }
  
  return { type: 'other', subType: 'unclassified' };
};

// Analyze question complexity
const analyzeQuestionComplexity = (question) => {
  const wordCount = question.split(/\s+/).length;
  const hasSubclauses = question.includes(',') || question.includes('and') || question.includes('but');
  const hasConditionals = question.toLowerCase().includes('if') || question.toLowerCase().includes('when');
  
  if (wordCount > 15 || (hasSubclauses && hasConditionals)) return 'complex';
  if (wordCount > 8 || hasSubclauses || hasConditionals) return 'moderate';
  return 'simple';
};

// Analyze question purpose
const analyzeQuestionPurpose = (question) => {
  const lower = question.toLowerCase();
  
  // Information seeking
  if (lower.includes('what is') || lower.includes('how does') || lower.includes('when did') || 
      lower.includes('where is') || lower.includes('who is')) {
    return 'information';
  }
  
  // Clarification
  if (lower.includes('do you mean') || lower.includes('are you saying') || lower.includes('clarify') || 
      lower.includes('explain') || lower.includes('could you elaborate')) {
    return 'clarification';
  }
  
  // Confirmation
  if (lower.includes('right?') || lower.includes('correct?') || lower.includes('isn\'t it?') || 
      lower.includes('don\'t you think?') || lower.includes('wouldn\'t you agree?')) {
    return 'confirmation';
  }
  
  // Engagement
  if (lower.includes('what do you think') || lower.includes('how do you feel') || 
      lower.includes('what\'s your opinion') || lower.includes('any thoughts')) {
    return 'engagement';
  }
  
  // Reflection
  if (lower.includes('why do you think') || lower.includes('what if') || lower.includes('imagine') || 
      lower.includes('suppose') || lower.includes('consider')) {
    return 'reflection';
  }
  
  // Challenge
  if (lower.includes('why not') || lower.includes('how can you') || lower.includes('what makes you') || 
      lower.includes('justify') || lower.includes('defend')) {
    return 'challenge';
  }
  
  return 'information';
};

// Get explanation for question type
const getQuestionExplanation = (type, subType, purpose) => {
  const explanations = {
    what: {
      definition: 'Seeks to understand the nature, meaning, or identity of something',
      hypothetical: 'Explores possible scenarios or imaginary situations',
      opinion: 'Requests personal views, thoughts, or judgments',
      general: 'Asks for general information or details about something'
    },
    how: {
      quantity: 'Inquires about amounts, numbers, or measurements',
      duration: 'Asks about time periods, frequency, or temporal aspects',
      process: 'Seeks step-by-step instructions or procedures',
      method: 'Requests information about ways, means, or approaches'
    },
    why: {
      alternative: 'Questions why something is not done differently',
      reason: 'Seeks explanations for states, conditions, or situations',
      cause: 'Looks for underlying causes or motivations'
    },
    when: {
      future: 'Asks about upcoming events or future timing',
      past: 'Inquires about historical events or past timing',
      time: 'Seeks general temporal information'
    },
    where: {
      location: 'Asks about specific places or positions',
      action: 'Inquires about where activities or actions occur',
      place: 'Seeks information about general locations'
    },
    who: {
      identity: 'Asks about the identity of people or entities',
      capability: 'Inquires about who can or will do something',
      person: 'Seeks information about individuals or groups'
    },
    which: {
      selection: 'Asks for a choice from specific options',
      option: 'Seeks the best alternative from available choices',
      choice: 'Requests selection from multiple possibilities'
    },
    whose: {
      possession: 'Inquires about ownership or belonging'
    },
    yesNo: {
      binary: 'Requires a simple yes or no answer'
    },
    choice: {
      alternative: 'Presents two or more options to choose from'
    },
    confirmation: {
      agreement: 'Seeks validation or agreement with a statement'
    }
  };
  
  return explanations[type]?.[subType] || 'General inquiry seeking information';
};

// Calculate average complexity
const calculateAverageComplexity = (questions) => {
  if (questions.length === 0) return 'none';
  
  const complexityScores = {
    simple: 1,
    moderate: 2,
    complex: 3
  };
  
  const totalScore = questions.reduce((sum, q) => sum + complexityScores[q.complexity], 0);
  const averageScore = totalScore / questions.length;
  
  if (averageScore < 1.5) return 'simple';
  if (averageScore < 2.5) return 'moderate';
  return 'complex';
};

// Find most common question type
const findMostCommonQuestionType = (questionTypes) => {
  const maxCount = Math.max(...Object.values(questionTypes));
  if (maxCount === 0) return 'none';
  
  const mostCommon = Object.entries(questionTypes).find(([type, count]) => count === maxCount);
  return mostCommon ? mostCommon[0] : 'none';
};

// Generate question insights
const generateQuestionInsights = (questions, questionTypes, questionPurposes) => {
  const insights = [];
  
  if (questions.length === 0) {
    insights.push('No questions found in the transcript. This suggests a more declarative or informational communication style.');
    return insights;
  }
  
  // Question density insight
  if (questions.length > 10) {
    insights.push(`High question density detected (${questions.length} questions). This indicates an interactive, inquiry-based communication style.`);
  } else if (questions.length > 5) {
    insights.push(`Moderate question usage (${questions.length} questions). Shows balanced interactive communication.`);
  } else {
    insights.push(`Low question frequency (${questions.length} questions). Communication style is more declarative.`);
  }
  
  // Most common type insight
  const mostCommonType = findMostCommonQuestionType(questionTypes);
  if (mostCommonType !== 'none') {
    insights.push(`Most frequent question type: "${mostCommonType}" questions. This suggests focus on ${getTypeDescription(mostCommonType)}.`);
  }
  
  // Purpose analysis
  const maxPurpose = Object.entries(questionPurposes).reduce((max, [purpose, count]) => 
    count > max.count ? { purpose, count } : max, { purpose: 'none', count: 0 });
  
  if (maxPurpose.count > 0) {
    insights.push(`Primary question purpose: ${maxPurpose.purpose}. This indicates ${getPurposeDescription(maxPurpose.purpose)}.`);
  }
  
  // Rhetorical vs direct
  const rhetorical = questions.filter(q => q.isRhetorical).length;
  const direct = questions.length - rhetorical;
  
  if (rhetorical > direct) {
    insights.push('Predominantly rhetorical questions suggest a persuasive or reflective communication style.');
  } else if (direct > rhetorical) {
    insights.push('Mostly direct questions indicate information-seeking or interactive communication.');
  }
  
  return insights;
};

// Get type description
const getTypeDescription = (type) => {
  const descriptions = {
    what: 'seeking definitions, explanations, or information about things',
    how: 'understanding processes, methods, or procedures',
    why: 'exploring reasons, causes, or motivations',
    when: 'temporal information and timing',
    where: 'location, place, or spatial information',
    who: 'people, roles, or identity',
    which: 'choice, selection, or options',
    whose: 'ownership or possession',
    yesNo: 'binary confirmation or simple verification',
    choice: 'alternatives and decision-making',
    confirmation: 'validation and agreement-seeking'
  };
  
  return descriptions[type] || 'general inquiry';
};

// Get purpose description
const getPurposeDescription = (purpose) => {
  const descriptions = {
    information: 'a focus on gathering facts and knowledge',
    clarification: 'a need for better understanding and explanation',
    confirmation: 'seeking validation and agreement',
    engagement: 'interactive communication and involvement',
    reflection: 'thoughtful consideration and deeper thinking',
    challenge: 'questioning assumptions and critical thinking'
  };
  
  return descriptions[purpose] || 'general communication';
};

// Helper function to detect question patterns
const isQuestionPattern = (sentence) => {
  const lower = sentence.toLowerCase();
  const questionStarters = [
    'what', 'how', 'why', 'when', 'where', 'who', 'which', 'whose', 'whom',
    'is', 'are', 'was', 'were', 'do', 'does', 'did', 'can', 'could', 'will', 'would',
    'should', 'shall', 'may', 'might', 'must', 'have', 'has', 'had'
  ];
  
  return questionStarters.some(starter => lower.startsWith(starter + ' '));
};

// Helper function to detect rhetorical questions
const isRhetoricalQuestion = (question) => {
  const lower = question.toLowerCase();
  const rhetoricalPatterns = [
    'isn\'t that',
    'don\'t you think',
    'wouldn\'t you agree',
    'you know what i mean',
    'right?',
    'correct?',
    'am i right',
    'you see',
    'obviously',
    'clearly'
  ];
  
  return rhetoricalPatterns.some(pattern => lower.includes(pattern)) || question.length > 80;
};

// Helper function to get question context
const getQuestionContext = (sentences, questionIndex) => {
  const contextBefore = questionIndex > 0 ? sentences[questionIndex - 1].trim() : '';
  const contextAfter = questionIndex < sentences.length - 1 ? sentences[questionIndex + 1].trim() : '';
  
  return {
    before: contextBefore.length > 100 ? contextBefore.substring(0, 100) + '...' : contextBefore,
    after: contextAfter.length > 100 ? contextAfter.substring(0, 100) + '...' : contextAfter
  };
};

// Time analysis
const analyzeTimeReferences = (text) => {
  const timeWords = {
    past: ['yesterday', 'ago', 'before', 'previously', 'earlier', 'past', 'former', 'was', 'were'],
    present: ['now', 'today', 'currently', 'presently', 'at present', 'is', 'are', 'am'],
    future: ['tomorrow', 'later', 'next', 'future', 'will', 'shall', 'going to', 'upcoming']
  };
  
  const words = text.toLowerCase().split(/\s+/);
  const timeReferences = {
    past: 0,
    present: 0,
    future: 0
  };
  
  words.forEach(word => {
    if (timeWords.past.includes(word)) timeReferences.past++;
    if (timeWords.present.includes(word)) timeReferences.present++;
    if (timeWords.future.includes(word)) timeReferences.future++;
  });
  
  return {
    timeOrientation: timeReferences,
    dominantTense: Object.entries(timeReferences).reduce((a, b) => timeReferences[a[0]] > timeReferences[b[0]] ? a : b)[0],
    timeExpressions: extractTimeExpressions(text)
  };
};

// Extract action items
const extractActionItems = (text) => {
  const actionVerbs = ['need', 'should', 'must', 'have to', 'require', 'plan', 'will', 'going to', 'schedule', 'assign'];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  const actionItems = sentences.filter(sentence => {
    const lower = sentence.toLowerCase();
    return actionVerbs.some(verb => lower.includes(verb));
  }).map(sentence => ({
    text: sentence.trim(),
    priority: determinePriority(sentence),
    type: classifyActionType(sentence)
  }));
  
  return actionItems.slice(0, 10);
};

// Extract themes
const extractThemes = (text) => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const themes = {};
  
  // Theme keywords
  const themeKeywords = {
    'Communication': ['communication', 'discussion', 'conversation', 'talk', 'speak', 'listen'],
    'Problem Solving': ['problem', 'solution', 'issue', 'challenge', 'resolve', 'fix'],
    'Planning': ['plan', 'strategy', 'goal', 'objective', 'target', 'schedule'],
    'Analysis': ['analyze', 'study', 'research', 'examine', 'investigate', 'review'],
    'Decision Making': ['decision', 'choose', 'select', 'option', 'alternative', 'choice'],
    'Collaboration': ['team', 'collaborate', 'together', 'cooperation', 'partnership', 'group']
  };
  
  sentences.forEach(sentence => {
    const lower = sentence.toLowerCase();
    Object.entries(themeKeywords).forEach(([theme, keywords]) => {
      const matches = keywords.filter(keyword => lower.includes(keyword)).length;
      if (matches > 0) {
        themes[theme] = (themes[theme] || 0) + matches;
      }
    });
  });
  
  return Object.entries(themes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([theme, count]) => ({ theme, count }));
};

// Extract key findings from the text
const extractKeyFindings = (text) => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const keyFindings = [];
  
  // Look for explicit key findings
  sentences.forEach(sentence => {
    const lower = sentence.toLowerCase();
    if (lower.includes('key') || lower.includes('important') || lower.includes('main') || 
        lower.includes('significant') || lower.includes('critical') || lower.includes('primary') ||
        lower.includes('notable') || lower.includes('essential') || lower.includes('crucial') ||
        lower.includes('fundamental') || lower.includes('major') || lower.includes('core')) {
      keyFindings.push(sentence.trim());
    }
  });
  
  // If no explicit findings, generate based on content analysis
  if (keyFindings.length === 0) {
    const wordFreq = getWordFrequency(text);
    const topKeywords = Object.entries(wordFreq)
      .filter(([word]) => word.length > 4)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
    
    // Generate findings based on keyword frequency
    if (topKeywords.length > 0) {
      keyFindings.push(`The content heavily emphasizes ${topKeywords.slice(0, 3).join(', ')}, suggesting these are central themes.`);
    }
    
    // Analyze sentence complexity
    const avgWordsPerSentence = text.split(/\s+/).length / sentences.length;
    if (avgWordsPerSentence > 20) {
      keyFindings.push(`The content demonstrates sophisticated analytical depth with complex sentence structures and detailed explanations.`);
    } else if (avgWordsPerSentence < 10) {
      keyFindings.push(`The content uses concise, direct communication style for maximum clarity and accessibility.`);
    }
    
    // Look for quantitative information
    const hasNumbers = /\d+/.test(text);
    if (hasNumbers) {
      keyFindings.push(`The content includes quantitative data and specific measurements, enhancing credibility and precision.`);
    }
    
    // Analyze emotional tone
    const emotionalWords = text.toLowerCase().split(/\s+/).filter(word => 
      ['excellent', 'great', 'good', 'bad', 'terrible', 'amazing', 'wonderful', 'awful', 'fantastic', 'horrible'].includes(word)
    );
    
    if (emotionalWords.length > 0) {
      keyFindings.push(`The content contains emotional language, suggesting subjective viewpoints and personal perspectives.`);
    }
  }
  
  return keyFindings.slice(0, 5);
};

// Generate content overview
const generateContentOverview = (text) => {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  return {
    length: words.length < 100 ? 'Short' : words.length < 500 ? 'Medium' : 'Long',
    tone: detectTone(text),
    primaryTopic: detectMainTheme(text),
    complexity: detectComplexity(text),
    readingLevel: calculateReadingLevel(text),
    structure: detectStructureType(text)
  };
};

// Detect content tone
const detectTone = (text) => {
  const positiveWords = ['good', 'great', 'excellent', 'positive', 'success', 'effective', 'beneficial', 'valuable', 'important', 'significant'];
  const negativeWords = ['bad', 'terrible', 'negative', 'problem', 'issue', 'failure', 'difficult', 'challenge', 'concern', 'risk'];
  const neutralWords = ['analysis', 'study', 'research', 'data', 'information', 'report', 'overview', 'summary', 'description', 'explanation'];
  
  const words = text.toLowerCase().split(/\s+/);
  const positiveCount = words.filter(word => positiveWords.includes(word)).length;
  const negativeCount = words.filter(word => negativeWords.includes(word)).length;
  const neutralCount = words.filter(word => neutralWords.includes(word)).length;
  
  if (positiveCount > negativeCount && positiveCount > neutralCount) return 'Positive';
  if (negativeCount > positiveCount && negativeCount > neutralCount) return 'Critical';
  if (neutralCount > positiveCount && neutralCount > negativeCount) return 'Analytical';
  return 'Neutral';
};

// Detect complexity level
const detectComplexity = (text) => {
  const words = text.split(/\s+/);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgWordsPerSentence = words.length / sentences.length;
  
  const complexWords = words.filter(word => word.length > 7).length;
  const complexityRatio = complexWords / words.length;
  
  if (avgWordsPerSentence > 20 && complexityRatio > 0.3) return 'High';
  if (avgWordsPerSentence > 15 && complexityRatio > 0.2) return 'Medium';
  return 'Low';
};

// Calculate reading level
const calculateReadingLevel = (text) => {
  const words = text.split(/\s+/);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgWordsPerSentence = words.length / sentences.length;
  
  if (avgWordsPerSentence > 20) return 'Advanced';
  if (avgWordsPerSentence > 15) return 'Intermediate';
  return 'Basic';
};

// Detect structure type
const detectStructureType = (text) => {
  const hasNumbers = /^\d+\./.test(text);
  const hasBullets = text.includes('•') || text.includes('-');
  const hasHeaders = /^[A-Z][^.!?]*$/m.test(text);
  
  if (hasNumbers) return 'Numbered List';
  if (hasBullets) return 'Bullet Points';
  if (hasHeaders) return 'Structured Document';
  return 'Narrative';
};

// Analyze document structure
const analyzeDocumentStructure = (text) => {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  return {
    paragraphCount: paragraphs.length,
    sentenceCount: sentences.length,
    averageSentencesPerParagraph: Math.round(sentences.length / paragraphs.length),
    hasHeaders: /^[A-Z][^.!?]*$/.test(text),
    hasBulletPoints: text.includes('•') || text.includes('-') || text.includes('*'),
    hasNumbers: /\d+/.test(text)
  };
};

// Detect content type
const detectContentType = (text) => {
  const lower = text.toLowerCase();
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Check for meeting indicators
  if (lower.includes('meeting') || lower.includes('agenda') || lower.includes('discussion') || 
      lower.includes('attendees') || lower.includes('action items')) return 'Meeting Recording';
  
  // Check for presentation indicators
  if (lower.includes('presentation') || lower.includes('slide') || lower.includes('show') ||
      lower.includes('demonstrate') || lower.includes('exhibit')) return 'Presentation';
  
  // Check for interview indicators
  if (lower.includes('interview') || lower.includes('question') || lower.includes('answer') ||
      sentences.filter(s => s.includes('?')).length > sentences.length * 0.2) return 'Interview';
  
  // Check for lecture indicators
  if (lower.includes('lecture') || lower.includes('lesson') || lower.includes('class') ||
      lower.includes('curriculum') || lower.includes('syllabus')) return 'Educational Content';
  
  // Check for tutorial indicators
  if (lower.includes('tutorial') || lower.includes('guide') || lower.includes('how to') ||
      lower.includes('step by step') || lower.includes('instructions')) return 'Tutorial';
  
  // Check for news/report indicators
  if (lower.includes('report') || lower.includes('news') || lower.includes('breaking') ||
      lower.includes('announcement') || lower.includes('update')) return 'News/Report';
  
  return 'General Discussion';
};

// Detect main theme with enhanced analysis
const detectMainTheme = (text) => {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);
  const wordFreq = {};
  
  // Count word frequencies
  words.forEach(word => {
    if (word.length > 3) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });
  
  // Business theme
  const businessWords = ['business', 'sales', 'revenue', 'profit', 'market', 'customer', 'strategy', 'growth', 'investment', 'finance'];
  const businessScore = businessWords.reduce((score, word) => score + (wordFreq[word] || 0), 0);
  
  // Technology theme
  const techWords = ['technology', 'software', 'digital', 'computer', 'system', 'data', 'algorithm', 'programming', 'development', 'innovation'];
  const techScore = techWords.reduce((score, word) => score + (wordFreq[word] || 0), 0);
  
  // Education theme
  const educationWords = ['education', 'learning', 'student', 'teacher', 'study', 'research', 'knowledge', 'skill', 'training', 'academic'];
  const educationScore = educationWords.reduce((score, word) => score + (wordFreq[word] || 0), 0);
  
  // Health theme
  const healthWords = ['health', 'medical', 'patient', 'treatment', 'diagnosis', 'therapy', 'medicine', 'doctor', 'hospital', 'care'];
  const healthScore = healthWords.reduce((score, word) => score + (wordFreq[word] || 0), 0);
  
  // Science theme
  const scienceWords = ['science', 'research', 'experiment', 'hypothesis', 'theory', 'analysis', 'study', 'observation', 'method', 'result'];
  const scienceScore = scienceWords.reduce((score, word) => score + (wordFreq[word] || 0), 0);
  
  // Find the theme with highest score
  const themes = {
    'Business & Finance': businessScore,
    'Technology & Innovation': techScore,
    'Education & Learning': educationScore,
    'Health & Medicine': healthScore,
    'Science & Research': scienceScore
  };
  
  const maxTheme = Object.entries(themes).reduce((max, [theme, score]) => 
    score > max.score ? { theme, score } : max, { theme: 'General Discussion', score: 0 });
  
  return maxTheme.theme;
};

// Helper functions
const detectIntroduction = (text) => {
  const firstSentence = text.split(/[.!?]+/)[0]?.toLowerCase() || '';
  return firstSentence.includes('introduction') || firstSentence.includes('begin') || firstSentence.includes('start');
};

const detectConclusion = (text) => {
  const lastSentence = text.split(/[.!?]+/).slice(-1)[0]?.toLowerCase() || '';
  return lastSentence.includes('conclusion') || lastSentence.includes('summary') || lastSentence.includes('end');
};

const detectTransitions = (text) => {
  const transitionWords = ['however', 'therefore', 'furthermore', 'moreover', 'additionally', 'consequently'];
  const lower = text.toLowerCase();
  return transitionWords.some(word => lower.includes(word));
};

const calculateVariability = (lengths) => {
  const avg = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
  const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avg, 2), 0) / lengths.length;
  return Math.sqrt(variance).toFixed(1);
};

const calculateCoherence = (text) => {
  // Simplified coherence calculation based on transition words and pronoun usage
  const transitions = countTransitionWords(text);
  const pronouns = (text.toLowerCase().match(/\b(this|that|these|those|it|they|them)\b/g) || []).length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5).length;
  
  return Math.min(100, ((transitions + pronouns) / sentences * 100)).toFixed(1);
};

const countTransitionWords = (text) => {
  const transitionWords = ['however', 'therefore', 'furthermore', 'moreover', 'additionally', 'consequently', 'meanwhile', 'nevertheless', 'thus', 'hence'];
  const lower = text.toLowerCase();
  return transitionWords.reduce((count, word) => count + (lower.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length, 0);
};

const detectOrganizationPattern = (text) => {
  if (text.includes('first') && text.includes('second')) return 'Sequential';
  if (text.includes('problem') && text.includes('solution')) return 'Problem-Solution';
  if (text.includes('compare') || text.includes('contrast')) return 'Compare-Contrast';
  if (text.includes('cause') || text.includes('effect')) return 'Cause-Effect';
  return 'General';
};

const countDiscourseMarkers = (text, markers) => {
  const lower = text.toLowerCase();
  return markers.reduce((count, marker) => count + (lower.match(new RegExp(`\\b${marker}\\b`, 'g')) || []).length, 0);
};

const analyzeArgumentStructure = (text) => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const claims = sentences.filter(s => s.toLowerCase().includes('claim') || s.toLowerCase().includes('argue')).length;
  const evidence = sentences.filter(s => s.toLowerCase().includes('evidence') || s.toLowerCase().includes('proof')).length;
  const reasoning = sentences.filter(s => s.toLowerCase().includes('because') || s.toLowerCase().includes('therefore')).length;
  
  return { claims, evidence, reasoning };
};

const identifyEvidenceTypes = (text) => {
  const lower = text.toLowerCase();
  return {
    statistics: (lower.match(/\d+%|\d+\.\d+%/g) || []).length,
    examples: (lower.match(/\bexample\b|\binstance\b/g) || []).length,
    quotes: (lower.match(/"|'/g) || []).length / 2,
    research: (lower.match(/\bresearch\b|\bstudy\b/g) || []).length
  };
};

const extractTimeExpressions = (text) => {
  const timePattern = /\b(morning|afternoon|evening|night|today|tomorrow|yesterday|now|later|soon|recently|currently)\b/gi;
  return Array.from(text.matchAll(timePattern)).map(match => match[0]).slice(0, 10);
};

const determinePriority = (sentence) => {
  const high = ['urgent', 'immediate', 'critical', 'must', 'asap'];
  const medium = ['should', 'important', 'need'];
  const lower = sentence.toLowerCase();
  
  if (high.some(word => lower.includes(word))) return 'High';
  if (medium.some(word => lower.includes(word))) return 'Medium';
  return 'Low';
};

const classifyActionType = (sentence) => {
  const lower = sentence.toLowerCase();
  if (lower.includes('meet') || lower.includes('schedule')) return 'Meeting';
  if (lower.includes('review') || lower.includes('check')) return 'Review';
  if (lower.includes('create') || lower.includes('develop')) return 'Creation';
  if (lower.includes('send') || lower.includes('email')) return 'Communication';
  return 'Task';
};

// Helper function to calculate word frequency
const getWordFrequency = (text) => {
  const words = text.toLowerCase().split(/\s+/);
  const frequency = {};
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);
  
  words.forEach(word => {
    const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
    if (cleanWord.length > 2 && !stopWords.has(cleanWord)) {
      frequency[cleanWord] = (frequency[cleanWord] || 0) + 1;
    }
  });
  
  return frequency;
};

// Calculate overall confidence score based on multiple factors with dynamic variation
const calculateOverallConfidence = (analysis) => {
  // Create unique hash from text content for consistent but varied results
  const textHash = analysis.originalText ? 
    analysis.originalText.split('').reduce((a, b) => (a + b.charCodeAt(0)) % 1000, 0) : 0;
  
  let confidenceScore = 0;
  let factors = 0;
  
  // Text length factor with content-based variation
  const wordCount = analysis.statistics.wordCount;
  const lengthVariation = (textHash % 20) - 10; // -10 to +10 variation
  if (wordCount > 100) {
    confidenceScore += 85 + lengthVariation;
  } else if (wordCount > 50) {
    confidenceScore += 70 + (lengthVariation * 0.8);
  } else if (wordCount > 20) {
    confidenceScore += 55 + (lengthVariation * 0.6);
  } else {
    confidenceScore += 40 + (lengthVariation * 0.4);
  }
  factors++;
  
  // Sentence complexity with dynamic scoring
  const sentenceCount = analysis.statistics.sentenceCount || 1;
  const avgWordsPerSentence = wordCount / sentenceCount;
  const complexityVariation = ((textHash * 3) % 15) - 7; // -7 to +7 variation
  
  if (avgWordsPerSentence >= 8 && avgWordsPerSentence <= 25) {
    confidenceScore += 80 + complexityVariation;
  } else if (avgWordsPerSentence >= 5 && avgWordsPerSentence <= 35) {
    confidenceScore += 65 + (complexityVariation * 0.7);
  } else {
    confidenceScore += 45 + (complexityVariation * 0.5);
  }
  factors++;
  
  // Vocabulary diversity with content-based scoring
  const uniqueKeywords = analysis.keywords ? analysis.keywords.length : 0;
  const diversityVariation = ((textHash * 7) % 12) - 6; // -6 to +6 variation
  
  if (uniqueKeywords > 15) {
    confidenceScore += 90 + diversityVariation;
  } else if (uniqueKeywords > 8) {
    confidenceScore += 75 + (diversityVariation * 0.8);
  } else if (uniqueKeywords > 3) {
    confidenceScore += 60 + (diversityVariation * 0.6);
  } else {
    confidenceScore += 45 + (diversityVariation * 0.4);
  }
  factors++;
  
  // Named entities recognition confidence
  const entities = analysis.namedEntities || {};
  const totalEntities = (entities.people?.length || 0) + 
                       (entities.organizations?.length || 0) + 
                       (entities.locations?.length || 0);
  const entityVariation = ((textHash * 11) % 10) - 5; // -5 to +5 variation
  
  if (totalEntities > 8) {
    confidenceScore += 85 + entityVariation;
  } else if (totalEntities > 3) {
    confidenceScore += 70 + (entityVariation * 0.8);
  } else if (totalEntities > 0) {
    confidenceScore += 55 + (entityVariation * 0.6);
  } else {
    confidenceScore += 40 + (entityVariation * 0.4);
  }
  factors++;
  
  // Sentiment analysis confidence with contextual adjustment
  const sentimentConfidence = analysis.sentiment?.confidence || 0.5;
  const sentimentVariation = ((textHash * 13) % 8) - 4; // -4 to +4 variation
  confidenceScore += (sentimentConfidence * 80) + sentimentVariation;
  factors++;
  
  // Content quality and coherence
  const readabilityScore = analysis.readabilityScore || 50;
  const qualityVariation = ((textHash * 17) % 14) - 7; // -7 to +7 variation
  
  if (readabilityScore > 70) {
    confidenceScore += 85 + qualityVariation;
  } else if (readabilityScore > 50) {
    confidenceScore += 70 + (qualityVariation * 0.8);
  } else if (readabilityScore > 30) {
    confidenceScore += 55 + (qualityVariation * 0.6);
  } else {
    confidenceScore += 40 + (qualityVariation * 0.4);
  }
  factors++;
  
  // Text structure and formatting
  const punctuationCount = (analysis.originalText?.match(/[.!?;:]/g) || []).length;
  const structureVariation = ((textHash * 19) % 6) - 3; // -3 to +3 variation
  const structureRatio = punctuationCount / Math.max(sentenceCount, 1);
  
  if (structureRatio >= 0.8 && structureRatio <= 1.5) {
    confidenceScore += 75 + structureVariation;
  } else if (structureRatio >= 0.5 && structureRatio <= 2) {
    confidenceScore += 65 + (structureVariation * 0.8);
  } else {
    confidenceScore += 50 + (structureVariation * 0.5);
  }
  factors++;
  
  // Calculate final confidence with bounds checking
  const finalConfidence = Math.round(confidenceScore / factors);
  
  // Ensure confidence stays within realistic bounds (30-95)
  return Math.max(30, Math.min(95, finalConfidence));
};

// Generate chart data for visualizations
export const generateChartData = (analysis) => {
  console.log('Generating chart data for analysis:', analysis);
  
  // Ensure we have default values
  const sentiment = analysis.sentiment || { label: 'Neutral', confidence: 0.5, score: 0 };
  const keywords = analysis.keywords || [];
  const topicDistribution = analysis.topicDistribution || [];
  const emotionAnalysis = analysis.emotionAnalysis || [];
  const questionAnalysis = analysis.questionAnalysis || {};
  const linguisticAnalysis = analysis.linguisticAnalysis || {};
  const timeAnalysis = analysis.timeAnalysis || {};
  
  // Calculate sentiment distribution more accurately
  const sentimentData = {
    positive: sentiment.label === 'Positive' ? sentiment.confidence * 100 : 
             sentiment.score > 0 ? Math.abs(sentiment.score) * 50 : 20,
    negative: sentiment.label === 'Negative' ? sentiment.confidence * 100 : 
             sentiment.score < 0 ? Math.abs(sentiment.score) * 50 : 15,
    neutral: sentiment.label === 'Neutral' ? 70 : 
            100 - (sentiment.confidence * 100)
  };
  
  // Normalize sentiment data
  const total = sentimentData.positive + sentimentData.negative + sentimentData.neutral;
  sentimentData.positive = (sentimentData.positive / total) * 100;
  sentimentData.negative = (sentimentData.negative / total) * 100;
  sentimentData.neutral = (sentimentData.neutral / total) * 100;

  return {
    // Enhanced sentiment pie chart with better colors and data
    sentimentPieData: {
      labels: ['Positive', 'Negative', 'Neutral'],
      datasets: [{
        data: [sentimentData.positive, sentimentData.negative, sentimentData.neutral],
        backgroundColor: [
          '#4CAF50', // Green for positive
          '#F44336', // Red for negative
          '#FF9800'  // Orange for neutral
        ],
        borderColor: ['#388E3C', '#D32F2F', '#F57C00'],
        borderWidth: 2,
        hoverBackgroundColor: ['#66BB6A', '#EF5350', '#FFB74D'],
        hoverBorderColor: ['#2E7D32', '#C62828', '#E65100'],
        hoverBorderWidth: 3
      }]
    },

    // Enhanced keywords bar chart with gradient colors
    keywordsBarData: {
      labels: keywords.slice(0, 8).map(k => k.word || k),
      datasets: [{
        label: 'Frequency',
        data: keywords.slice(0, 8).map(k => k.count || 1),
        backgroundColor: [
          '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', 
          '#F44336', '#00BCD4', '#FFEB3B', '#795548'
        ],
        borderColor: [
          '#1976D2', '#388E3C', '#F57C00', '#7B1FA2',
          '#D32F2F', '#0097A7', '#FBC02D', '#5D4037'
        ],
        borderWidth: 1,
        hoverBackgroundColor: [
          '#42A5F5', '#66BB6A', '#FFB74D', '#BA68C8',
          '#EF5350', '#26C6DA', '#FFF176', '#8D6E63'
        ]
      }]
    },

    // Enhanced topic distribution with more informative data
    topicDistributionData: {
      labels: topicDistribution.length > 0 ? 
        topicDistribution.slice(0, 6).map(t => t.topic || t) : 
        ['Technology', 'Communication', 'Analysis', 'Process', 'Data', 'Results'],
      datasets: [{
        data: topicDistribution.length > 0 ? 
          topicDistribution.slice(0, 6).map(t => t.count || 1) : 
          [25, 20, 18, 15, 12, 10],
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
        ],
        borderColor: [
          '#FF4757', '#2F80ED', '#FFC048', '#00D2D3', '#8B5CF6', '#FF6B35'
        ],
        borderWidth: 2,
        hoverBackgroundColor: [
          '#FF7596', '#4DABF7', '#FFD93D', '#6BCF7F', '#A78BFA', '#FF8A65'
        ]
      }]
    },

    // Enhanced emotions radar chart with better scaling
    emotionsRadarData: {
      labels: emotionAnalysis.length > 0 ? 
        emotionAnalysis.map(e => e.emotion || e) : 
        ['Joy', 'Trust', 'Surprise', 'Sadness', 'Fear', 'Anger'],
      datasets: [{
        label: 'Emotional Intensity',
        data: emotionAnalysis.length > 0 ? 
          emotionAnalysis.map(e => (e.count || 1) * 10) : 
          [40, 35, 25, 15, 10, 8],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: true
      }]
    },

    // New: Question types distribution
    questionTypesData: {
      labels: ['What', 'How', 'Why', 'When', 'Where', 'Who', 'Yes/No', 'Other'],
      datasets: [{
        data: [
          questionAnalysis.questionTypes?.what || 0,
          questionAnalysis.questionTypes?.how || 0,
          questionAnalysis.questionTypes?.why || 0,
          questionAnalysis.questionTypes?.when || 0,
          questionAnalysis.questionTypes?.where || 0,
          questionAnalysis.questionTypes?.who || 0,
          questionAnalysis.questionTypes?.yesNo || 0,
          questionAnalysis.questionTypes?.other || 0
        ],
        backgroundColor: [
          '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
        ],
        borderColor: [
          '#FF5252', '#26A69A', '#2196F3', '#81C784', '#FFD54F', '#CE93D8', '#80CBC4', '#F4D03F'
        ],
        borderWidth: 2
      }]
    },

    // New: Complexity analysis
    complexityData: {
      labels: ['Simple', 'Moderate', 'Complex'],
      datasets: [{
        data: [
          questionAnalysis.complexityLevels?.simple || 0,
          questionAnalysis.complexityLevels?.moderate || 0,
          questionAnalysis.complexityLevels?.complex || 0
        ],
        backgroundColor: ['#4CAF50', '#FF9800', '#F44336'],
        borderColor: ['#388E3C', '#F57C00', '#D32F2F'],
        borderWidth: 2
      }]
    },

    // New: Reading time vs complexity scatter plot
    timeComplexityData: {
      datasets: [{
        label: 'Content Analysis',
        data: [{
          x: analysis.statistics?.readingTime || 0,
          y: analysis.readabilityScore || 0,
          r: Math.sqrt((analysis.statistics?.wordCount || 0) / 10)
        }],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        pointHoverBackgroundColor: 'rgba(255, 99, 132, 0.8)',
        pointHoverBorderColor: 'rgba(255, 99, 132, 1)'
      }]
    },

    // New: Linguistic features
    linguisticData: {
      labels: ['Word Complexity', 'Sentence Variety', 'Vocabulary Richness', 'Readability'],
      datasets: [{
        label: 'Linguistic Features',
        data: [
          parseFloat(linguisticAnalysis.vocabularyComplexity) || 30,
          linguisticAnalysis.sentenceTypes ? 
            Object.keys(linguisticAnalysis.sentenceTypes).length * 20 : 60,
          linguisticAnalysis.uniqueWords ? 
            Math.min(100, (linguisticAnalysis.uniqueWords / (analysis.statistics?.wordCount || 100)) * 100) : 40,
          analysis.readabilityScore || 50
        ],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(75, 192, 192, 1)',
        fill: true
      }]
    },

    // New: Time reference analysis
    timeReferenceData: {
      labels: ['Past', 'Present', 'Future'],
      datasets: [{
        data: [
          timeAnalysis.timeOrientation?.past || 10,
          timeAnalysis.timeOrientation?.present || 60,
          timeAnalysis.timeOrientation?.future || 30
        ],
        backgroundColor: ['#8BC34A', '#2196F3', '#FF9800'],
        borderColor: ['#689F38', '#1976D2', '#F57C00'],
        borderWidth: 2
      }]
    },

    // Enhanced statistics for display
    statisticsData: {
      wordCount: analysis.statistics?.wordCount || 0,
      sentenceCount: analysis.statistics?.sentenceCount || 0,
      readingTime: analysis.statistics?.readingTime || 0,
      readabilityScore: Math.round(analysis.readabilityScore || 0),
      sentimentScore: Math.round((analysis.sentiment?.score || 0) * 100),
      confidenceScore: calculateOverallConfidence(analysis),
      questionCount: questionAnalysis.totalQuestions || 0,
      topicCount: topicDistribution.length || 0,
      emotionCount: emotionAnalysis.length || 0,
      complexityLevel: analysis.contentAnalysis?.overview?.complexity || 'Medium'
    },

    // New: Comprehensive metrics for advanced charts
    advancedMetrics: {
      contentDiversity: Math.min(100, (topicDistribution.length || 3) * 20),
      emotionalRange: Math.min(100, (emotionAnalysis.length || 3) * 15),
      questionComplexity: questionAnalysis.averageComplexity === 'complex' ? 80 : 
                         questionAnalysis.averageComplexity === 'moderate' ? 60 : 40,
      linguisticRichness: linguisticAnalysis.uniqueWords ? 
        Math.min(100, (linguisticAnalysis.uniqueWords / (analysis.statistics?.wordCount || 100)) * 200) : 50,
      analyticalDepth: analysis.insights?.length ? analysis.insights.length * 15 : 45
    }
  };
};

// Generate implicit conclusions when none are explicitly stated
const generateImplicitConclusions = (text) => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const words = text.toLowerCase().split(/\s+/);
  const wordFreq = getWordFrequency(text);
  
  // Look for strong statement indicators
  const strongStatements = sentences.filter(sentence => {
    const lower = sentence.toLowerCase();
    return lower.includes('result') || lower.includes('outcome') || 
           lower.includes('demonstrate') || lower.includes('show') ||
           lower.includes('prove') || lower.includes('indicate') ||
           lower.includes('significant') || lower.includes('important') ||
           lower.includes('clear') || lower.includes('evident');
  });

  // Generate conclusions based on content analysis
  const conclusions = [];
  
  // Topic-based conclusion
  const mainTopics = Object.entries(wordFreq)
    .filter(([word]) => word.length > 4)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word]) => word);
  
  if (mainTopics.length > 0) {
    conclusions.push(`The discussion primarily focuses on ${mainTopics.join(', ')}, highlighting key themes throughout the content.`);
  }
  
  // Complexity conclusion
  const avgWordsPerSentence = words.length / sentences.length;
  if (avgWordsPerSentence > 15) {
    conclusions.push(`The content demonstrates sophisticated language use with complex sentence structures, indicating detailed analysis.`);
  } else {
    conclusions.push(`The content uses clear, concise language making it accessible to a broad audience.`);
  }
  
  // Add strong statements as conclusions
  if (strongStatements.length > 0) {
    conclusions.push(strongStatements[0].trim());
  }
  
  return conclusions.length > 0 ? conclusions : ['Analysis suggests comprehensive coverage of the topic with detailed explanations.'];
};

// Generate implicit questions when none are explicitly asked
const generateImplicitQuestions = (text) => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const words = text.toLowerCase().split(/\s+/);
  const wordFreq = getWordFrequency(text);
  
  const questions = [];
  
  // Generate questions based on content topics
  const mainTopics = Object.entries(wordFreq)
    .filter(([word]) => word.length > 4)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word]) => word);
  
  if (mainTopics.length > 0) {
    questions.push(`What are the key implications of ${mainTopics[0]}?`);
    if (mainTopics.length > 1) {
      questions.push(`How does ${mainTopics[0]} relate to ${mainTopics[1]}?`);
    }
  }
  
  // Look for problem/solution patterns
  const problemWords = words.filter(word => 
    word.includes('problem') || word.includes('issue') || 
    word.includes('challenge') || word.includes('difficult')
  );
  
  if (problemWords.length > 0) {
    questions.push(`What solutions are proposed for the identified challenges?`);
  }
  
  // Look for process/method descriptions
  const processWords = words.filter(word => 
    word.includes('process') || word.includes('method') || 
    word.includes('approach') || word.includes('technique')
  );
  
  if (processWords.length > 0) {
    questions.push(`What are the benefits and limitations of this approach?`);
  }
  
  // Default questions based on content length
  if (words.length > 200) {
    questions.push(`What are the main takeaways from this detailed analysis?`);
  }
  


  return questions.length > 0 ? questions : ['What are the key points to remember from this content?'];
}


