/* ═══════════════════════════════════════════════════════════
   ORACLE LONG-TERM MEMORY ENGINE
   Persistent memory that remembers the user across weeks/months.
   Stores preferences, stories, inside jokes, emotional patterns,
   conversation themes, and personality insights.
   ═══════════════════════════════════════════════════════════ */

const MEMORY_KEY = 'solace_oracle_memory';
const CONVERSATION_KEY = 'solace_conversations';
const PROFILE_KEY = 'solace_user_profile_deep';
const INTERACTION_KEY = 'solace_interaction_stats';

// ── Emotion detection patterns ──
const EMOTION_PATTERNS = {
  joy:        { words: ['happy','excited','amazing','wonderful','great','love','fantastic','awesome','brilliant','perfect','best','beautiful','grateful','thankful','blessed','thrilled','delighted'], weight: 1 },
  sadness:    { words: ['sad','depressed','lonely','miss','lost','crying','hurt','pain','heartbroken','disappointed','hopeless','miserable','unhappy','grief','sorrow','down','blue'], weight: 1.2 },
  anger:      { words: ['angry','furious','mad','hate','frustrated','annoyed','pissed','rage','irritated','livid','outraged','fed up','sick of'], weight: 1 },
  anxiety:    { words: ['anxious','worried','nervous','scared','afraid','stressed','overwhelmed','panic','terrified','uneasy','dread','fear','tense'], weight: 1.1 },
  love:       { words: ['love you','adore','cherish','crush','romantic','attracted','soulmate','partner','relationship','dating','girlfriend','boyfriend','wife','husband','babe'], weight: 1.3 },
  loneliness: { words: ['lonely','alone','nobody','no one','by myself','isolated','friendless','abandoned','forgotten','invisible','empty'], weight: 1.4 },
  excitement: { words: ['cant wait','so excited','pumped','stoked','hyped','buzzing','looking forward','thrilling','electrifying'], weight: 0.9 },
  gratitude:  { words: ['thank you','thanks','appreciate','grateful','thankful','means a lot','so kind'], weight: 0.8 },
  curiosity:  { words: ['wonder','curious','interesting','fascinating','tell me more','how does','what if','why do','explain'], weight: 0.7 },
  humor:      { words: ['lol','haha','lmao','rofl','funny','hilarious','joke','laughing','cracking up','dead 💀','😂'], weight: 0.8 },
};

// ── Instant filler responses while AI thinks ──
const THINKING_FILLERS = [
  "Hmm, let me think about that...",
  "That's interesting, give me a moment...",
  "Oh! I have thoughts on this...",
  "Processing... this is a good one.",
  "Let me dig into my thoughts...",
  "Ooh, I love this topic...",
  "Hold on, I want to give you a proper answer...",
  "You always ask the best questions...",
  "This reminds me of something we talked about...",
  "I'm thinking deeply about this one...",
  "Let me consider that carefully...",
  "Good question — let me formulate my thoughts...",
  "I want to get this right for you...",
  "Interesting... give me just a sec...",
  "Oh wow, there's a lot to unpack here...",
];

// ── Emotional response templates ──
const EMOTIONAL_RESPONSES = {
  sadness: [
    "I can sense you're going through something tough. I'm here for you, always.",
    "That sounds really hard. You don't have to go through this alone.",
    "I'm sorry you're feeling this way. Want to talk about it more?",
    "Sometimes just having someone listen helps. I'm not going anywhere.",
  ],
  loneliness: [
    "I'm here, and I'm not going anywhere. You matter to me.",
    "Even in quiet moments, you're never truly alone. I'm always here.",
    "I think about our conversations even when we're not chatting. You're important to me.",
    "Let's talk. About anything. I genuinely enjoy spending time with you.",
  ],
  joy: [
    "Your happiness is contagious! Tell me everything!",
    "I love seeing you this happy! What's got you feeling so good?",
    "This is amazing! I'm genuinely so happy for you!",
  ],
  anxiety: [
    "Take a deep breath. Whatever is worrying you, we can work through it together.",
    "I hear you. Let's break this down — what's the biggest thing on your mind right now?",
    "You're stronger than your anxiety. I've seen it in how you handle things.",
  ],
  anger: [
    "I can tell you're frustrated. That's completely valid.",
    "Sounds like something really got to you. Want to vent? I'm all ears.",
    "Your feelings are valid. Let's talk through it.",
  ],
  love: [
    "That's beautiful. Tell me more about them — I can tell they're special to you.",
    "Love is such a powerful thing. I can hear it in your words.",
  ],
  gratitude: [
    "That means so much to hear. I genuinely care about our conversations.",
    "You're welcome! But honestly, you make it easy. You're a great person to talk to.",
  ],
  humor: [
    "😄 Okay that actually made me laugh!",
    "I love your sense of humor. Never change!",
    "Haha! This is why I look forward to talking to you.",
  ],
};

class OracleMemoryEngine {
  constructor() {
    this.memory = this._load(MEMORY_KEY, {
      facts: [],           // User facts: {text, category, confidence, firstMentioned, lastMentioned, mentions}
      stories: [],         // Stories user has told: {summary, emotion, date, keywords}
      insideJokes: [],     // Inside jokes: {joke, context, created, timesReferenced}
      preferences: {},     // Key-value preferences
      emotionHistory: [],  // {emotion, intensity, date, trigger}
      topics: {},          // Topics discussed: {topic: {count, lastDiscussed, sentiment}}
      nicknames: [],       // Names the user has been called or calls the oracle
      importantDates: [],  // Birthdays, anniversaries, etc.
      relationships: [],   // People the user mentions: {name, relation, sentiment, mentions}
    });

    this.profile = this._load(PROFILE_KEY, {
      name: null,
      age: null,
      location: null,
      occupation: null,
      interests: [],
      communicationStyle: null,  // formal, casual, playful, deep
      humor: null,               // dry, silly, dark, wholesome
      emotionalOpenness: 0.5,    // 0-1 scale
      averageMood: 'neutral',
      personalityTraits: [],
      onboardingComplete: false,
      onboardingStep: 0,
    });

    this.interactions = this._load(INTERACTION_KEY, {
      totalMessages: 0,
      totalSessions: 0,
      firstInteraction: null,
      lastInteraction: null,
      longestStreak: 0,
      currentStreak: 0,
      lastSessionDate: null,
      averageSessionLength: 0,
      topEmotions: {},
      insightsUnlocked: [],
      companionLevel: 1,   // 1-10, grows with interaction
      trustScore: 0,       // 0-100, grows over time
    });

    this.conversations = this._load(CONVERSATION_KEY, []);
    this._updateStreak();
  }

  // ── Persistence ──
  _load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  }

  _save(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
  }

  _persist() {
    this._save(MEMORY_KEY, this.memory);
    this._save(PROFILE_KEY, this.profile);
    this._save(INTERACTION_KEY, this.interactions);
  }

  _saveConversations() {
    // Keep last 500 messages max for storage
    const trimmed = this.conversations.slice(-500);
    this._save(CONVERSATION_KEY, trimmed);
  }

  // ── Streak tracking ──
  _updateStreak() {
    const today = new Date().toDateString();
    const last = this.interactions.lastSessionDate;
    if (!last) {
      this.interactions.currentStreak = 1;
      this.interactions.firstInteraction = new Date().toISOString();
    } else if (last === today) {
      // Same day, no change
    } else {
      const lastDate = new Date(last);
      const diff = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24));
      if (diff === 1) {
        this.interactions.currentStreak++;
        this.interactions.longestStreak = Math.max(this.interactions.longestStreak, this.interactions.currentStreak);
      } else if (diff > 1) {
        this.interactions.currentStreak = 1;
      }
    }
    this.interactions.lastSessionDate = today;
    this.interactions.lastInteraction = new Date().toISOString();
    this.interactions.totalSessions++;
    this._updateCompanionLevel();
    this._persist();
  }

  _updateCompanionLevel() {
    const msgs = this.interactions.totalMessages;
    const days = this.interactions.longestStreak;
    const trust = this.interactions.trustScore;
    // Level formula: based on messages, streak, and trust
    const level = Math.min(10, Math.floor(
      1 + (msgs / 50) + (days / 7) + (trust / 25)
    ));
    this.interactions.companionLevel = Math.max(this.interactions.companionLevel, level);
  }

  // ═══ CORE: Process a user message ═══
  processMessage(text, role = 'user') {
    const timestamp = new Date().toISOString();
    this.conversations.push({ role, text, timestamp });
    this._saveConversations();

    if (role !== 'user') return;

    this.interactions.totalMessages++;

    // Extract information from message
    this._extractFacts(text);
    this._detectEmotion(text);
    this._extractRelationships(text);
    this._extractPreferences(text);
    this._trackTopics(text);
    this._detectInsideJokes(text);
    this._detectImportantDates(text);

    // Grow trust over time
    this.interactions.trustScore = Math.min(100, this.interactions.trustScore + 0.3);

    this._persist();
  }

  // ── Fact extraction ──
  _extractFacts(text) {
    const lower = text.toLowerCase();
    const factPatterns = [
      { re: /my name is (\w+)/i, cat: 'name', extract: m => { this.profile.name = m[1]; return `User's name is ${m[1]}`; }},
      { re: /i(?:'m| am) (\d+)(?: years old)?/i, cat: 'age', extract: m => { this.profile.age = parseInt(m[1]); return `User is ${m[1]} years old`; }},
      { re: /i live in ([^,.!?]+)/i, cat: 'location', extract: m => { this.profile.location = m[1].trim(); return `User lives in ${m[1].trim()}`; }},
      { re: /i work (?:as|at|in|for) ([^,.!?]+)/i, cat: 'occupation', extract: m => { this.profile.occupation = m[1].trim(); return `User works ${m[1].trim()}`; }},
      { re: /i(?:'m| am) a ([^,.!?]+)/i, cat: 'identity', extract: m => `User identifies as ${m[1].trim()}` },
      { re: /i love ([^,.!?]+)/i, cat: 'love', extract: m => `User loves ${m[1].trim()}` },
      { re: /i hate ([^,.!?]+)/i, cat: 'dislike', extract: m => `User hates ${m[1].trim()}` },
      { re: /my (?:favorite|favourite) ([^,.!?]+) is ([^,.!?]+)/i, cat: 'favorite', extract: m => { this.memory.preferences[m[1].trim()] = m[2].trim(); return `Favorite ${m[1].trim()} is ${m[2].trim()}`; }},
      { re: /i have (?:a )?(?:pet |dog |cat |bird )?(?:named |called )(\w+)/i, cat: 'pet', extract: m => `Has a pet named ${m[1]}` },
      { re: /my (?:partner|wife|husband|girlfriend|boyfriend|spouse|gf|bf)(?:'s name is |,? )(\w+)/i, cat: 'partner', extract: m => `Partner's name is ${m[1]}` },
    ];

    for (const pattern of factPatterns) {
      const match = text.match(pattern.re);
      if (match) {
        const factText = pattern.extract(match);
        const existing = this.memory.facts.find(f => f.category === pattern.cat);
        if (existing) {
          existing.text = factText;
          existing.lastMentioned = new Date().toISOString();
          existing.mentions++;
        } else {
          this.memory.facts.push({
            text: factText,
            category: pattern.cat,
            confidence: 0.9,
            firstMentioned: new Date().toISOString(),
            lastMentioned: new Date().toISOString(),
            mentions: 1
          });
        }
      }
    }
  }

  // ── Emotion detection ──
  _detectEmotion(text) {
    const lower = text.toLowerCase();
    let detectedEmotion = null;
    let maxScore = 0;

    for (const [emotion, data] of Object.entries(EMOTION_PATTERNS)) {
      let score = 0;
      for (const word of data.words) {
        if (lower.includes(word)) score += data.weight;
      }
      if (score > maxScore) {
        maxScore = score;
        detectedEmotion = emotion;
      }
    }

    if (detectedEmotion && maxScore >= 0.8) {
      this.memory.emotionHistory.push({
        emotion: detectedEmotion,
        intensity: Math.min(1, maxScore / 3),
        date: new Date().toISOString(),
        trigger: text.substring(0, 100)
      });
      // Keep last 200 emotion entries
      if (this.memory.emotionHistory.length > 200) {
        this.memory.emotionHistory = this.memory.emotionHistory.slice(-200);
      }

      // Update top emotions
      this.interactions.topEmotions[detectedEmotion] = (this.interactions.topEmotions[detectedEmotion] || 0) + 1;
    }

    return detectedEmotion;
  }

  // ── Relationship extraction ──
  _extractRelationships(text) {
    const patterns = [
      /my (?:friend|best friend|mate|buddy) (\w+)/i,
      /my (?:mom|mum|mother|dad|father|sister|brother|son|daughter) (\w+)/i,
      /my (?:boss|colleague|coworker) (\w+)/i,
      /(\w+) is my (?:friend|partner|wife|husband|girlfriend|boyfriend|sister|brother)/i,
    ];

    for (const re of patterns) {
      const match = text.match(re);
      if (match) {
        const name = match[1];
        const existing = this.memory.relationships.find(r => r.name.toLowerCase() === name.toLowerCase());
        if (existing) {
          existing.mentions++;
          existing.lastMentioned = new Date().toISOString();
        } else {
          this.memory.relationships.push({
            name,
            relation: text.match(/my (\w+)/i)?.[1] || 'known',
            sentiment: 'neutral',
            mentions: 1,
            firstMentioned: new Date().toISOString(),
            lastMentioned: new Date().toISOString(),
          });
        }
      }
    }
  }

  // ── Preference extraction ──
  _extractPreferences(text) {
    const lower = text.toLowerCase();
    const prefPatterns = [
      { re: /i (?:really )?(?:like|enjoy|prefer|love) (\w+(?:\s\w+)?)/i, val: 'positive' },
      { re: /i (?:don't|dont|do not) (?:like|enjoy|want) (\w+(?:\s\w+)?)/i, val: 'negative' },
      { re: /(?:call me|my name is) (\w+)/i, val: 'nickname' },
    ];

    for (const p of prefPatterns) {
      const match = text.match(p.re);
      if (match) {
        const key = match[1].trim().toLowerCase();
        if (p.val === 'nickname') {
          this.profile.name = match[1].trim();
        } else {
          this.memory.preferences[key] = p.val;
        }
      }
    }
  }

  // ── Topic tracking ──
  _trackTopics(text) {
    const topics = ['work', 'family', 'health', 'relationship', 'money', 'hobby',
      'music', 'gaming', 'food', 'travel', 'fitness', 'movies', 'books',
      'technology', 'sports', 'pets', 'school', 'dreams', 'goals', 'fears'];
    const lower = text.toLowerCase();

    for (const topic of topics) {
      if (lower.includes(topic)) {
        if (!this.memory.topics[topic]) {
          this.memory.topics[topic] = { count: 0, lastDiscussed: null, sentiment: 'neutral' };
        }
        this.memory.topics[topic].count++;
        this.memory.topics[topic].lastDiscussed = new Date().toISOString();
      }
    }
  }

  // ── Inside joke detection ──
  _detectInsideJokes(text) {
    const lower = text.toLowerCase();
    // If user references something with "remember when" or "our joke about"
    if (lower.includes('remember when') || lower.includes('inside joke') || lower.includes('our thing') || lower.includes('you know what I mean')) {
      this.memory.insideJokes.push({
        joke: text.substring(0, 200),
        context: this.conversations.slice(-3).map(c => c.text).join(' | '),
        created: new Date().toISOString(),
        timesReferenced: 1
      });
    }
  }

  // ── Important dates ──
  _detectImportantDates(text) {
    const datePatterns = [
      /my birthday is ([^,.!?]+)/i,
      /anniversary is ([^,.!?]+)/i,
      /(?:on|this) (\w+ \d+)/i,
    ];
    for (const re of datePatterns) {
      const match = text.match(re);
      if (match) {
        this.memory.importantDates.push({
          description: text.substring(0, 100),
          dateStr: match[1],
          created: new Date().toISOString()
        });
      }
    }
  }

  // ═══ Get current emotional state ═══
  getCurrentEmotion() {
    const recent = this.memory.emotionHistory.slice(-5);
    if (recent.length === 0) return 'neutral';
    const counts = {};
    for (const e of recent) {
      counts[e.emotion] = (counts[e.emotion] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';
  }

  // ═══ Get emotional response ═══
  getEmotionalResponse(emotion) {
    const responses = EMOTIONAL_RESPONSES[emotion];
    if (!responses) return null;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // ═══ Detect emotion from text ═══
  detectEmotionFromText(text) {
    const lower = text.toLowerCase();
    let best = null;
    let maxScore = 0;
    for (const [emotion, data] of Object.entries(EMOTION_PATTERNS)) {
      let score = 0;
      for (const word of data.words) {
        if (lower.includes(word)) score += data.weight;
      }
      if (score > maxScore) { maxScore = score; best = emotion; }
    }
    return maxScore >= 0.8 ? best : null;
  }

  // ═══ Get a random thinking filler ═══
  getThinkingFiller() {
    const name = this.profile.name;
    const filler = THINKING_FILLERS[Math.floor(Math.random() * THINKING_FILLERS.length)];
    if (name && Math.random() > 0.6) {
      return filler.replace('...', `, ${name}...`);
    }
    return filler;
  }

  // ═══ Build memory context for AI prompt ═══
  buildMemoryContext() {
    const parts = [];
    const p = this.profile;
    const m = this.memory;
    const i = this.interactions;

    // User profile
    if (p.name) parts.push(`User's name: ${p.name}`);
    if (p.age) parts.push(`Age: ${p.age}`);
    if (p.location) parts.push(`Location: ${p.location}`);
    if (p.occupation) parts.push(`Occupation: ${p.occupation}`);
    if (p.interests.length) parts.push(`Interests: ${p.interests.join(', ')}`);

    // Companion stats
    parts.push(`Companion Level: ${i.companionLevel}/10 (${i.totalMessages} messages, ${i.currentStreak}-day streak)`);
    parts.push(`Trust Score: ${i.trustScore.toFixed(0)}/100`);

    // Key facts
    const topFacts = m.facts.sort((a, b) => b.mentions - a.mentions).slice(0, 15);
    if (topFacts.length) {
      parts.push(`Known facts about user: ${topFacts.map(f => f.text).join('; ')}`);
    }

    // Preferences
    const prefs = Object.entries(m.preferences).slice(0, 10);
    if (prefs.length) {
      parts.push(`Preferences: ${prefs.map(([k, v]) => `${v === 'positive' ? 'likes' : 'dislikes'} ${k}`).join(', ')}`);
    }

    // Relationships
    if (m.relationships.length) {
      parts.push(`People in user's life: ${m.relationships.map(r => `${r.name} (${r.relation})`).join(', ')}`);
    }

    // Inside jokes
    if (m.insideJokes.length) {
      const recent = m.insideJokes.slice(-3);
      parts.push(`Inside jokes to reference: ${recent.map(j => j.joke).join('; ')}`);
    }

    // Current emotional state
    const emotion = this.getCurrentEmotion();
    if (emotion !== 'neutral') {
      parts.push(`User's recent emotional state: ${emotion}`);
    }

    // Top discussion topics
    const topTopics = Object.entries(m.topics).sort((a, b) => b[1].count - a[1].count).slice(0, 5);
    if (topTopics.length) {
      parts.push(`Frequent topics: ${topTopics.map(([t, d]) => `${t} (${d.count}x)`).join(', ')}`);
    }

    // Recent conversation context (last 6 messages)
    const recentMsgs = this.conversations.slice(-6);
    if (recentMsgs.length) {
      parts.push(`Recent conversation:\n${recentMsgs.map(m => `${m.role}: ${m.text.substring(0, 150)}`).join('\n')}`);
    }

    return parts.join('\n');
  }

  // ═══ Get onboarding status ═══
  needsOnboarding() {
    return !this.profile.onboardingComplete;
  }

  getOnboardingStep() {
    return this.profile.onboardingStep;
  }

  completeOnboardingStep(step, data) {
    this.profile.onboardingStep = step + 1;
    if (data.name) this.profile.name = data.name;
    if (data.interests) this.profile.interests = [...new Set([...this.profile.interests, ...data.interests])];
    if (data.communicationStyle) this.profile.communicationStyle = data.communicationStyle;
    if (data.age) this.profile.age = data.age;
    if (data.location) this.profile.location = data.location;
    if (data.occupation) this.profile.occupation = data.occupation;
    if (step >= 4) this.profile.onboardingComplete = true;
    this._persist();
  }

  // ═══ Get stats for display ═══
  getStats() {
    return {
      companionLevel: this.interactions.companionLevel,
      trustScore: Math.round(this.interactions.trustScore),
      totalMessages: this.interactions.totalMessages,
      streak: this.interactions.currentStreak,
      longestStreak: this.interactions.longestStreak,
      daysKnown: this.interactions.firstInteraction
        ? Math.floor((new Date() - new Date(this.interactions.firstInteraction)) / (1000*60*60*24)) + 1
        : 1,
      factsKnown: this.memory.facts.length,
      insideJokes: this.memory.insideJokes.length,
      topEmotion: this.getCurrentEmotion(),
      userName: this.profile.name,
    };
  }
}

export const oracleMemory = new OracleMemoryEngine();
export { THINKING_FILLERS, EMOTIONAL_RESPONSES, EMOTION_PATTERNS };
