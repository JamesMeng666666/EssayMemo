
import { Essay, Token, PartOfSpeech, Sentence } from "./types";
import { v4 as uuidv4 } from 'uuid';
import { SEVENTH_GRADE_ESSAYS } from './sevenEssays';

// --- Local Dictionary for Offline Initialization ---
const NOUNS = new Set([
  "nie", "er", "yunnan", "talent", "music", "age", "song", "skill", "ears", "people", "nickname", "erduo", "name", "composer", "life", "works", "suffering", "achievement", "anthem", "nation", "hero", "year", "base", "tourists", "numbers", "january", "february", "march", "april", "may", "june", "satisfaction", "survey", "graph", "news", "experiences", "time", "situation", "areas", "guidance", "measures", "everyone", "opinions", "ai", "tools", "mistakes", "information", "answer", "problem", "coin", "sides", "effects", "ability", "communication", "teachers", "classmates", "run", "payment", "invention", "money", "convenience", "wallets", "cards", "qr", "code", "records", "app", "spending", "disadvantages", "smartphones", "network", "failures", "trouble", "addition", "things", "drawbacks", "mr", "mrs", "li", "thanks", "everything", "stay", "shenzhen", "home", "care", "help", "bikes", "culture", "lion", "dance", "festival", "dumplings", "highlight", "traditions", "kindness", "support", "touch", "uk", "wishes", "peter", "wisdom", "today", "story", "zhuge", "liang", "city", "plan", "period", "general", "shu", "day", "soldiers", "army", "idea", "gates", "streets", "wall", "zither", "smile", "ambush", "technique", "repetition", "words", "intervals", "process", "memory", "role", "confidence", "goals", "pets", "part", "family", "happiness", "companions", "elderly", "children", "school", "work", "responsibility", "others", "night", "neighbors", "waste", "problems", "cost", "food", "joy", "opinion", "way", "animation", "picture", "scene", "atmosphere", "handicraft", "duty", "action", "camera", "computer", "craft", "paper-cut", "dough", "figurine", "kite", "video", "art", "technology", "tradition", "generation", "animal", "animals", "yangtze", "porpoise", "threat", "extinction", "creatures", "skin", "heads", "smiles", "fish", "shrimps", "groups", "number", "water", "pollution", "lack", "overfishing", "result", "future", "river", "awareness", "alice", "week", "success", "variety", "activities", "treasure", "hunt", "corner", "book", "fair", "drama", "show", "lines", "class", "expressions", "gestures", "effort", "skills", "stage", "end", "performance", "activity", "english", "public", "importance", "teamwork", "mei", "astronaut", "astronauts", "aviation", "pilot", "efforts", "batch", "mission", "earth", "honour", "achievements", "medal", "teenager", "teenagers", "space", "province", "henan", "shenzhou", "club", "teacher", "hua", "classmate", "jack", "member", "members", "photography", "team", "campus", "friend", "friends", "hobby", "hobbies", "event", "events", "position"
]);

const VERBS = new Set([
  "born", "showed", "pick", "hearing", "moving", "gave", "adopted", "created", "composing", "encouraged", "fight", "passed", "lived", "respect", "remember", "attracted", "recorded", "conducted", "rose", "fell", "peaked", "dropped", "shown", "enjoyed", "plan", "add", "reduce", "provide", "believe", "attract", "satisfy", "stand", "share", "check", "correct", "save", "providing", "explain", "arrive", "brings", "makes", "noticed", "reduces", "help", "learn", "use", "changed", "manage", "need", "carry", "scanning", "pay", "stored", "keeping", "keep", "find", "cause", "lead", "spend", "buy", "hope", "writing", "express", "done", "feel", "arrived", "given", "taught", "adapted", "using", "riding", "watching", "making", "become", "understand", "welcome", "going", "go", "left", "came", "attack", "ordered", "let", "pretend", "sweep", "sat", "playing", "thought", "marched", "tells", "think", "review", "forget", "tend", "move", "build", "achieve", "is", "are", "was", "were", "am", "be", "been", "has", "have", "had", "do", "does", "did", "can", "could", "will", "would", "should", "may", "might", "must", "sacrifice", "protect", "reflect", "teach", "choose", "influence", "know", "disappear", "develop", "record", "post", "combine", "cherish", "pass", "join", "introduce", "feed", "live", "drop", "polluting", "stop", "raise", "held", "turned", "organized", "impressed", "joined", "practised", "adjusted", "spared", "act", "put", "improved", "built", "speak", "realized", "set", "dreamed", "flying", "admitted", "grew", "trained", "selected", "completed", "spent", "orbiting", "awarded", "inspires", "study", "stick", "recommend", "offer", "expect", "expects", "get", "wish", "wishes", "capture", "accept", "accepted", "take", "intends", "intend", "exchange"
]);

const ADJS = new Set([
  "extraordinary", "special", "formal", "gifted", "ordinary", "greatest", "young", "beloved", "national", "intangible", "cultural", "large", "first", "second", "good", "small", "long", "detailed", "glad", "challenging", "negative", "lazier", "bad", "harmful", "mobile", "convenient", "heavy", "unfamiliar", "poor", "unnecessary", "useful", "kind", "digital", "traditional", "fantastic", "another", "smart", "weak", "scared", "calm", "brilliant", "empty", "few", "old", "new", "right", "same", "short-term", "long-term", "important", "proud", "lovely", "less", "lonely", "noisy", "environmental", "medical", "high", "proper", "clean", "healthy", "well-trained", "wonderful", "exciting", "misunderstood", "disliked", "inspiring", "modern", "rich", "technological", "precious", "attractive", "short", "online", "popular", "rare", "fascinating", "finless", "grey", "white", "round", "friendly", "serious", "uncertain", "huge", "facial", "oral", "female", "great", "excellent", "persistent", "outstanding", "heroic", "second-class", "true", "international", "outgoing", "warm-hearted", "outdoor", "different", "willing", "creative", "lively", "qualified"
]);

const ADVS = new Set([
  "originally", "mainly", "especially", "also", "completely", "totally", "quickly", "too", "much", "moreover", "however", "actually", "really", "wisely", "so", "well", "very", "just", "once", "twice", "later", "sadly", "heavily", "sharply", "simply", "automatically", "often", "even", "never", "always", "properly", "naturally", "besides", "recently", "finally", "suddenly", "meanwhile", "fully", "slowly", "again", "usually", "repeatedly", "vividly", "greatly", "truly", "strictly", "successfully", "bravely", "strongly", "firmly", "sincerely"
]);

// Vocabulary from the seventh-grade built-in essays, for the three word-hiding levels.
[
  'challenge', 'study', 'maths', 'problem', 'sport', 'ping-pong', 'friendship',
  'student', 'breakfast', 'bus', 'lesson', 'lunchtime', 'canteen', 'nap', 'afternoon',
  'interest', 'housework', 'homework', 'schedule', 'minute', 'season', 'spring',
  'winter', 'temperature', 'weather', 'tree', 'leaf', 'flower', 'song', 'bird',
  'picnic', 'sunshine', 'air', 'energy', 'pollution', 'land', 'bag',
  'rubbish', 'step', 'planet', 'trip', 'spaceship', 'palace', 'facility',
  'adventure', 'station', 'greeting', 'spacewalk', 'moon', 'destination',
  'rock', 'dance', 'meal', 'hotel', 'journey', 'site', 'landscape', 'visitor',
  'fort', 'spot', 'history', 'street', 'paradise', 'niuza', 'tangshui',
  'view', 'fountain', 'library', 'reader', 'book', 'area',
  'achievement', 'collection', 'magnet', 'beijing', 'museum',
  'passion', 'shape', 'size', 'colour', 'landmark', 'reason', 'person',
  'mum', 'chance', 'word', 'model', 'holiday', 'harbin', 'northeast',
  'artwork', 'ice', 'skating', 'cathedral', 'dish', 'pear', 'park',
  'hole', 'sapling', 'stick', 'sound', 'laughter', 'dog', 'eye',
  'warhorse', 'soldier', 'cow', 'milk', 'meat', 'elephant', 'hunting',
  'ivory', 'tiger', 'habitat', 'loss', 'deforestation', 'nature',
  'source', 'being', 'agriculture', 'farmer', 'crop', 'industry',
  'machine', 'shortage', 'electricity', 'lighting', 'device',
  'rule', 'habit', 'appliance', 'power', 'pioneer', 'development',
  'science', 'research', 'devotion', 'country', 'contribution',
  'cycling', 'bike', 'gift', 'exercise', 'form'
].forEach(word => NOUNS.add(word));

[
  'face', 'count', 'lend', 'explain', 'improve', 'remain', 'catch', 'listen',
  'chat', 'laugh', 'explore', 'focus', 'adhere', 'rise', 'blossom', 'hike',
  'bring', 'reuse', 'recycle', 'sort', 'throw', 'ensure', 'travel', 'contact',
  'float', 'collect', 'visit', 'taste', 'miss', 'volunteer', 'search',
  'read', 'participate', 'grow', 'develop', 'hold', 'remind', 'present',
  'lie', 'skate', 'dig', 'care', 'support', 'water', 'plant', 'serve',
  'threaten', 'hunt', 'conserve', 'unplug', 'brighten', 'protect',
  'furthered', 'admire', 'contribute', 'balance', 'ride', 'connect', 'embark',
  'lends', 'explains', 'improved', 'becomes', 'begins', 'began', 'started',
  'facing', 'arrive', 'arrived', 'enjoy', 'enjoying', 'found', 'finding',
  'saw', 'gave', 'given', 'returned', 'returning', 'chose', 'chosen'
].forEach(word => VERBS.add(word));

[
  'helpful', 'active', 'confident', 'lucky', 'difficult', 'easy', 'busy',
  'hearty', 'challenging', 'relaxing', 'energetic', 'fulfilling', 'mild',
  'green', 'cheerful', 'fresh', 'serious', 'disposable', 'plastic',
  'healthier', 'super-cool', 'floating', 'thrilling', 'vast', 'unique',
  'unforgettable', 'historic', 'beautiful', 'delicious', 'must-see',
  'cheap', 'amazing', 'meaningful', 'right', 'fulfilled', 'special',
  'supportive', 'caring', 'freezing', 'stunning', 'frozen', 'steady',
  'blind', 'illegal', 'essential', 'sufficient', 'electronic',
  'energy-efficient', 'large', 'vital', 'excellent', 'strong', 'healthy'
].forEach(word => ADJS.add(word));

[
  'carefully', 'patiently', 'afterwards', 'throughout', 'freely',
  'nearly', 'firstly', 'secondly', 'lastly', 'definitely', 'meanwhile', 'newly',
  'additionally', 'tirelessly', 'further', 'truly'
].forEach(word => ADVS.add(word));

// Improved Tokenizer that handles whitespace correctly
export const smartTokenize = (text: string): Token[] => {
   const tokens: Token[] = [];
   // Match every character so token rendering reconstructs the source exactly.
   const regex = /[a-zA-Z0-9]+(?:['’][a-zA-Z0-9]+)*|\r\n|\n|\r|[^\r\n]/gu;
   const matches = text.match(regex);
   
   if (matches) {
       matches.forEach((part, index) => {
           const lower = part.toLowerCase();
            const isWord = /^[a-z0-9]+(?:['’][a-z0-9]+)*$/i.test(part);
           
           let pos: PartOfSpeech = 'other';
           if (isWord) {
                // Heuristic checks
                if (NOUNS.has(lower) || (lower.endsWith('s') && NOUNS.has(lower.slice(0, -1)))) pos = 'noun';
                else if (VERBS.has(lower) || (lower.endsWith('ed') && VERBS.has(lower.slice(0, -2))) || (lower.endsWith('ing') && VERBS.has(lower.slice(0, -3)))) pos = 'verb';
                else if (ADJS.has(lower)) pos = 'adj';
                else if (ADVS.has(lower)) pos = 'adv';
           }

           tokens.push({
               id: `t-${index}-${Date.now()}`,
               text: part,
               pos: pos,
               isSeparator: !isWord
           });
       });
   }
   return tokens;
};

// Data Structure for Pre-defined Essays
const RAW_ESSAYS = [
    {
        title: "8AU1: Nie Er",
        audioPath: "/audio/nie_er.wav",
        content: `Nie Er, originally named Nie Shouxin, was born in Yunnan in 1912. He showed extraordinary talent in music from an early age. He could pick up any song after hearing it just once or twice. Besides, he had a special skill of moving his ears, so people gave him the nickname "Erduo", which he later adopted as his formal name. 

As a gifted composer, Nie Er created over 30 songs during his life. Many of these works showed ordinary people's suffering. His greatest achievement is composing the music for China's national anthem, which encouraged people to fight for the nation. 

Sadly, Nie Er passed away at the young age of 23. However, his music has lived on. People respect him as "the People's Musician" and remember him as a beloved national hero.`,
        sentences: [
            { english: "Nie Er, originally named Nie Shouxin, was born in Yunnan in 1912.", chinese: "聂耳，原名聂守信，1912年出生于云南。", grammarPoints: "1. originally named... 过去分词短语作后置定语，意为“原名叫...”。\n2. be born in + 地点/年份，表示“出生于...”。" },
            { english: "He showed extraordinary talent in music from an early age.", chinese: "他从小就表现出非凡的音乐天赋。", grammarPoints: "1. show talent in... 在...方面展现天赋。\n2. from an early age 从小。" },
            { english: "He could pick up any song after hearing it just once or twice.", chinese: "任何歌曲他听一两遍就能学会。", grammarPoints: "1. pick up 学会，掌握（偶然或无意中）。\n2. after hearing... 介词after + 动名词(v.-ing)作宾语。" },
            { english: "Besides, he had a special skill of moving his ears, so people gave him the nickname \"Erduo\", which he later adopted as his formal name.", chinese: "此外，他还有一种动耳朵的特殊技能，所以人们给他起了个绰号叫“耳朵”，后来他把它作为了自己的正式名字。", grammarPoints: "1. a skill of doing sth. 做某事的技能。\n2. give sb. the nickname... 给某人起绰号...\n3. which引导非限制性定语从句，指代前面的nickname。" },
            { english: "As a gifted composer, Nie Er created over 30 songs during his life.", chinese: "作为一位天才作曲家，聂耳一生创作了30多首歌曲。", grammarPoints: "1. As + 身份，作为...。\n2. over = more than 超过。\n3. during his life 在他一生中。" },
            { english: "Many of these works showed ordinary people's suffering.", chinese: "其中许多作品展现了普通百姓的苦难。", grammarPoints: "1. Many of... ...中的许多。\n2. ordinary people's 普通人的（名词所有格）。" },
            { english: "His greatest achievement is composing the music for China's national anthem, which encouraged people to fight for the nation.", chinese: "他最大的成就是为中国国歌谱曲，激励人们为国家而战。", grammarPoints: "1. composing... 动名词作表语，解释achievement的内容。\n2. encourage sb. to do sth. 鼓励某人做某事。\n3. fight for 为...而战。" },
            { english: "Sadly, Nie Er passed away at the young age of 23.", chinese: "遗憾的是，聂耳在23岁时英年早逝。", grammarPoints: "1. pass away 去世（委婉说法）。\n2. at the age of 在...岁时。" },
            { english: "However, his music has lived on.", chinese: "然而，他的音乐却流传了下来。", grammarPoints: "1. live on 继续存在，流传。\n2. 现在完成时(has lived)表示过去发生的动作对现在仍有影响。" },
            { english: "People respect him as \"the People's Musician\" and remember him as a beloved national hero.", chinese: "人们尊称他为“人民音乐家”，并铭记他为受人爱戴的民族英雄。", grammarPoints: "1. respect sb. as... 尊某人为...\n2. remember sb. as... 铭记某人为..." }
        ]
    },
    {
        title: "8AU2: Intangible Cultural Heritage",
        audioPath: "/audio/cultural_heritage.wav",
        content: `This year, our Intangible Cultural Heritage Experience Base has attracted a large number of tourists. We recorded the monthly tourist numbers from January to June and conducted a tourist satisfaction survey. 

According to the first graph, there were about 25,000 tourists in January and 22,000 in February. The number rose to 35,000 in March, fell to 22,000 in April, then peaked at 40,000 in May. It dropped sharply to 20,000 in June. 

The good news, shown in the second graph, is that over 80% of the tourists enjoyed their experiences very much. However, a small number of tourists were not satisfied due to the long waiting time. 

To improve the situation, we plan to add more activity areas to reduce waiting time. Also, we will provide more detailed guidance for tourists. We believe these measures will attract and satisfy more tourists.`,
        sentences: [
            { english: "This year, our Intangible Cultural Heritage Experience Base has attracted a large number of tourists.", chinese: "今年，我们的非物质文化遗产体验基地吸引了大量游客。", grammarPoints: "1. 现在完成时(has attracted)表示过去发生的动作对现在造成的影响。\n2. a large number of + 可数名词复数，大量的..." },
            { english: "We recorded the monthly tourist numbers from January to June and conducted a tourist satisfaction survey.", chinese: "我们记录了1月至6月的月度游客人数，并进行了游客满意度调查。", grammarPoints: "1. from... to... 从...到...\n2. conduct a survey 进行调查。" },
            { english: "According to the first graph, there were about 25,000 tourists in January and 22,000 in February.", chinese: "根据第一张图表，1月份的游客约为25,000人，2月份约为22,000人。", grammarPoints: "1. According to 根据...\n2. there were... there be句型的过去时复数形式。" },
            { english: "The number rose to 35,000 in March, fell to 22,000 in April, then peaked at 40,000 in May.", chinese: "3月份人数升至35,000人，4月份降至22,000人，然后在5月份达到40,000人的峰值。", grammarPoints: "1. rise to 升至（rise的过去式是rose）。\n2. fall to 降至（fall的过去式是fell）。\n3. peak at 达到峰值..." },
            { english: "It dropped sharply to 20,000 in June.", chinese: "6月份急剧下降至20,000人。", grammarPoints: "1. drop sharply 急剧下降。\n2. in + 月份，在某月。" },
            { english: "The good news, shown in the second graph, is that over 80% of the tourists enjoyed their experiences very much.", chinese: "第二张图表显示的好消息是，超过80%的游客非常享受他们的体验。", grammarPoints: "1. shown in... 过去分词短语作后置定语。\n2. is that... that引导表语从句。\n3. enjoy oneself/one's experience 享受...的乐趣。" },
            { english: "However, a small number of tourists were not satisfied due to the long waiting time.", chinese: "然而，由于等待时间长，少数游客表示不满意。", grammarPoints: "1. a small number of 少量的...\n2. be satisfied (with) 对...感到满意。\n3. due to 由于，因为。" },
            { english: "To improve the situation, we plan to add more activity areas to reduce waiting time.", chinese: "为了改善这种情况，我们计划增加更多的活动区域以减少等待时间。", grammarPoints: "1. To improve... 动词不定式作目的状语。\n2. plan to do sth. 计划做某事。\n3. add... to... 增加...到..." },
            { english: "Also, we will provide more detailed guidance for tourists.", chinese: "此外，我们将为游客提供更详细的指导。", grammarPoints: "1. provide sth. for sb. 为某人提供某物。\n2. detailed 详细的（形容词）。" },
            { english: "We believe these measures will attract and satisfy more tourists.", chinese: "我们相信这些措施将吸引并满足更多的游客。", grammarPoints: "1. believe (that)... 相信...（宾语从句省略了that）。\n2. attract and satisfy 并列谓语动词。" }
        ]
    },
    {
        title: "8AU3: AI in Studies",
        audioPath: "/audio/ai_in_studies.wav",
        content: `Hello, everyone! I'm very glad to stand here and share my opinions of using AI in studies. 

First, AI tools can help me check for mistakes and correct them. Besides, they help me save time by providing information quickly. What's more, an AI tool can provide the answer to a challenging maths problem and explain how to arrive at the answer step by step. 

Every coin has two sides. AI also brings some negative effects. Using AI too much makes me lazier than before. Moreover, it is bad for improving my ability to think and solve problems. Worst of all, I've noticed that AI reduces my face-to-face communication with teachers and classmates. All these are harmful to me in the long run. 

In short, AI tools can help us learn better and faster, but we must use them wisely. Only in this way can we make good use of AI in our studies.`,
        sentences: [
             { english: "Hello, everyone! I'm very glad to stand here and share my opinions of using AI in studies.", chinese: "大家好！很高兴站在这里分享我对在学习中使用人工智能的看法。", grammarPoints: "1. be glad to do sth. 很高兴做某事。\n2. share one's opinions of... 分享关于...的看法。\n3. using AI 动名词作介词of的宾语。" },
             { english: "First, AI tools can help me check for mistakes and correct them.", chinese: "首先，人工智能工具可以帮我检查错误并加以改正。", grammarPoints: "1. help sb. (to) do sth. 帮助某人做某事。\n2. check for 检查以寻找...\n3. correct 改正（动词）。" },
             { english: "Besides, they help me save time by providing information quickly.", chinese: "此外，它们能快速提供信息，帮我节省时间。", grammarPoints: "1. save time 节省时间。\n2. by doing sth. 通过做某事（表示方式）。" },
             { english: "What's more, an AI tool can provide the answer to a challenging maths problem and explain how to arrive at the answer step by step.", chinese: "更重要的是，人工智能工具可以提供数学难题的答案，并一步步解释如何得出答案。", grammarPoints: "1. What's more 更重要的是。\n2. the answer to... ...的答案。\n3. how to arrive at... 疑问词+不定式，作explain的宾语。\n4. step by step 一步一步地。" },
             { english: "Every coin has two sides. AI also brings some negative effects.", chinese: "凡事都有两面性。人工智能也带来了一些负面影响。", grammarPoints: "1. Every coin has two sides. 谚语：凡事都有两面性。\n2. bring effects 带来影响。\n3. negative 负面的。" },
             { english: "Using AI too much makes me lazier than before.", chinese: "过度使用人工智能让我比以前更懒惰了。", grammarPoints: "1. Using AI too much 动名词短语作主语。\n2. make sb. + adj. 使某人处于某种状态。\n3. lazier 比较级，比以前更懒。" },
             { english: "Moreover, it is bad for improving my ability to think and solve problems.", chinese: "而且，这对提高我的思考和解决问题的能力很不利。", grammarPoints: "1. be bad for 对...有害/不利。\n2. ability to do sth. 做某事的能力。" },
             { english: "Worst of all, I've noticed that AI reduces my face-to-face communication with teachers and classmates.", chinese: "最糟糕的是，我发现人工智能减少了我与老师和同学的面对面交流。", grammarPoints: "1. Worst of all 最糟糕的是。\n2. notice that... 注意到...（宾语从句）。\n3. face-to-face 面对面的（复合形容词）。" },
             { english: "All these are harmful to me in the long run.", chinese: "从长远来看，这些对我都是有害的。", grammarPoints: "1. be harmful to 对...有害。\n2. in the long run 从长远来看。" },
             { english: "In short, AI tools can help us learn better and faster, but we must use them wisely.", chinese: "总之，人工智能工具可以帮助我们更好、更快地学习，但我们必须明智地使用它们。", grammarPoints: "1. In short 总之。\n2. learn better and faster 比较级并列。\n3. wisely 明智地（副词修饰动词use）。" },
             { english: "Only in this way can we make good use of AI in our studies.", chinese: "只有这样，我们才能在学习中利用好人工智能。", grammarPoints: "1. Only in this way 位于句首，句子需要部分倒装 (can we...)。\n2. make good use of 好好利用..." }
        ]
    },
    {
        title: "8AU4: Mobile Payment",
        audioPath: "/audio/mobile_payment.wav",
        content: `Mobile payment is one of the most wonderful inventions, which has totally changed how people manage money in daily life. 

It brings great convenience to us. We no longer need to carry heavy wallets or bank cards. Besides, it helps us save time by scanning a QR code to pay quickly. What's more, all payment records are stored in the app automatically, making it easier to keep track of our spending. 

However, it has some disadvantages. Elderly people and those who are unfamiliar with smartphones find it difficult to use. Also, poor network may cause payment failures and trouble. In addition, it might lead to overspending because people might spend less carefully and buy unnecessary things. 

In short, despite its drawbacks, mobile payment is really a useful invention. We should learn to use it wisely.`,
        sentences: [
            { english: "Mobile payment is one of the most wonderful inventions, which has totally changed how people manage money in daily life.", chinese: "移动支付是最奇妙的发明之一，它彻底改变了人们在日常生活中管理金钱的方式。", grammarPoints: "1. one of the most wonderful inventions 最奇妙的发明之一（one of + 形容词最高级 + 名词复数）。\n2. which引导非限制性定语从句，指代前面的inventions。\n3. how引导宾语从句。" },
            { english: "It brings great convenience to us.", chinese: "它给我们带来了极大的便利。", grammarPoints: "1. bring sth. to sb. 给某人带来某物。\n2. convenience 便利（名词）。" },
            { english: "We no longer need to carry heavy wallets or bank cards.", chinese: "我们不再需要携带厚重的钱包或银行卡。", grammarPoints: "1. no longer 不再。\n2. need to do sth. 需要做某事。" },
            { english: "Besides, it helps us save time by scanning a QR code to pay quickly.", chinese: "此外，通过扫描二维码快速支付，它帮助我们节省了时间。", grammarPoints: "1. help sb. (to) do sth. 帮助某人做某事。\n2. by scanning... 通过扫描...（by + 动名词表示方式）。" },
            { english: "What's more, all payment records are stored in the app automatically, making it easier to keep track of our spending.", chinese: "更重要的是，所有支付记录都会自动存储在应用程序中，使我们更容易追踪开支。", grammarPoints: "1. are stored 一般现在时的被动语态。\n2. making it easier... 现在分词短语作结果状语。\n3. keep track of 记录，追踪。" },
            { english: "However, it has some disadvantages.", chinese: "然而，它也有一些缺点。", grammarPoints: "1. However 然而（副词，常用于句首，用逗号隔开）。\n2. disadvantage 缺点，劣势。" },
            { english: "Elderly people and those who are unfamiliar with smartphones find it difficult to use.", chinese: "老年人和不熟悉智能手机的人觉得使用起来很困难。", grammarPoints: "1. those who... 那些...的人（who引导定语从句）。\n2. be unfamiliar with 对...不熟悉。\n3. find it difficult to use 发现做某事很困难（it作形式宾语）。" },
            { english: "Also, poor network may cause payment failures and trouble.", chinese: "此外，糟糕的网络可能会导致支付失败和麻烦。", grammarPoints: "1. cause 导致，引起。\n2. failure 失败（名词）。" },
            { english: "In addition, it might lead to overspending because people might spend less carefully and buy unnecessary things.", chinese: "另外，它可能会导致过度消费，因为人们可能会花钱不那么谨慎，购买不必要的东西。", grammarPoints: "1. In addition 另外，此外。\n2. lead to 导致（to是介词）。\n3. overspending 过度消费（动名词）。\n4. less carefully 不那么谨慎地（比较级）。" },
            { english: "In short, despite its drawbacks, mobile payment is really a useful invention.", chinese: "总之，尽管有缺点，移动支付确实是一项有用的发明。", grammarPoints: "1. In short 总之。\n2. despite 尽管（介词，后接名词或代词）。\n3. drawback 缺点。" },
            { english: "We should learn to use it wisely.", chinese: "我们应该学会明智地使用它。", grammarPoints: "1. learn to do sth. 学会做某事。\n2. wisely 明智地（副词）。" }
        ]
    },
    {
        title: "8AU5: Letter to Mr and Mrs Li",
        audioPath: "/audio/letter_to_li.wav",
        content: `Dear Mr and Mrs Li,

I hope you are doing well. I'm writing to express my thanks to you for everything you have done during my stay in Shenzhen. 

It was so kind of you to make me feel at home. When I arrived in Shenzhen, everything was unfamiliar to me. However, you have given me a lot of care and taught me some Chinese. Thanks to your help, I have adapted to the digital life so quickly, from using mobile payment to riding shared bikes. 

What's more, it was fantastic to learn about traditional culture with you. I especially enjoyed watching the lion dance during the Spring Festival. Making dumplings together has become another highlight that helped me understand Chinese traditions better. 

Thank you again for your kindness and support! I do hope that we can stay in touch all the time. Welcome to the UK someday! 

Best wishes,
Peter`,
        sentences: [
            { english: "I hope you are doing well.", chinese: "希望你们一切安好。", grammarPoints: "1. hope (that)... 希望...（宾语从句）。\n2. doing well 进展顺利，身体健康。" },
            { english: "I'm writing to express my thanks to you for everything you have done during my stay in Shenzhen.", chinese: "我写这封信是为了感谢你们在我逗留深圳期间所做的一切。", grammarPoints: "1. write to do sth. 写信做某事。\n2. express one's thanks to sb. for sth. 因某事向某人表达感谢。\n3. you have done 定语从句，修饰everything。" },
            { english: "It was so kind of you to make me feel at home.", chinese: "你们让我感觉像在家里一样，真是太好了。", grammarPoints: "1. It is kind of sb. to do sth. 某人做某事真是太好了。\n2. make sb. do sth. 使某人做某事（省略to的不定式作宾补）。\n3. feel at home 感觉像在家里一样，感到自在。" },
            { english: "When I arrived in Shenzhen, everything was unfamiliar to me.", chinese: "当我到达深圳时，一切对我来说都很陌生。", grammarPoints: "1. arrive in + 大地方，到达...。\n2. be unfamiliar to sb. 对某人来说很陌生。" },
            { english: "However, you have given me a lot of care and taught me some Chinese.", chinese: "然而，你们给了我很多关照，还教了我一些中文。", grammarPoints: "1. give sb. sth. 给某人某物。\n2. teach sb. sth. 教某人某物。\n3. have given / taught 现在完成时。" },
            { english: "Thanks to your help, I have adapted to the digital life so quickly, from using mobile payment to riding shared bikes.", chinese: "多亏了你们的帮助，我很快适应了数字生活，从使用移动支付到骑共享单车。", grammarPoints: "1. Thanks to 多亏了，由于。\n2. adapt to 适应...（to是介词）。\n3. from... to... 从...到...（连接两个动名词短语）。" },
            { english: "What's more, it was fantastic to learn about traditional culture with you.", chinese: "更棒的是，能和你们一起学习传统文化真是太好了。", grammarPoints: "1. What's more 更重要的是，而且。\n2. It is + adj. + to do sth. 做某事是...的（it作形式主语）。\n3. learn about 了解，学习关于..." },
            { english: "I especially enjoyed watching the lion dance during the Spring Festival.", chinese: "我特别喜欢春节期间看舞狮。", grammarPoints: "1. enjoy doing sth. 喜欢做某事。\n2. during the Spring Festival 在春节期间。" },
            { english: "Making dumplings together has become another highlight that helped me understand Chinese traditions better.", chinese: "一起包饺子成了另一个亮点，帮助我更好地了解中国传统。", grammarPoints: "1. Making dumplings 动名词短语作主语。\n2. that helped... that引导定语从句，修饰highlight。\n3. help sb. (to) do sth. 帮助某人做某事。" },
            { english: "Thank you again for your kindness and support!", chinese: "再次感谢你们的善意和支持！", grammarPoints: "1. Thank you for... 感谢你的...\n2. kindness 善良，善意（名词）。" },
            { english: "I do hope that we can stay in touch all the time.", chinese: "我真心希望我们能一直保持联系。", grammarPoints: "1. do hope 助动词do表强调，“确实，真心”。\n2. stay in touch 保持联系。\n3. all the time 一直，始终。" },
            { english: "Welcome to the UK someday!", chinese: "欢迎有一天来英国！", grammarPoints: "1. Welcome to + 地点，欢迎来到...。\n2. someday （将来的）某一天。" }
        ]
    },
    {
        title: "8AU6: Empty City Plan",
        audioPath: "/audio/empty_city_plan.wav",
        content: `Good morning, everyone! Welcome to Wisdom Today. I'm going to share the story of Zhuge Liang's Empty City Plan with you. 

During the Three Kingdoms Period, Zhuge Liang was a smart general of Shu. One day, most of his soldiers went out to fight while only a few old and weak soldiers were left. Suddenly, Sima Yi's large army came to attack it. 

Everyone in the city felt very scared, but Zhuge Liang stayed calm. He came up with a brilliant idea that he ordered soldiers to open the city gates and let some of them pretend to sweep the streets slowly. Meanwhile, he sat on the city wall, playing the zither with a peaceful smile. Sima Yi thought there was an ambush, so he marched his army away. 

This story tells us that we should think wisely when we are in trouble because nothing is more powerful than wisdom.`,
        sentences: [
            { english: "Good morning, everyone! Welcome to Wisdom Today.", chinese: "大家早上好！欢迎来到《智慧今日》。", grammarPoints: "1. Welcome to... 欢迎来到...。" },
            { english: "I'm going to share the story of Zhuge Liang's Empty City Plan with you.", chinese: "我要和大家分享诸葛亮空城计的故事。", grammarPoints: "1. be going to do sth. 打算/将要做某事。\n2. share sth. with sb. 和某人分享某物。" },
            { english: "During the Three Kingdoms Period, Zhuge Liang was a smart general of Shu.", chinese: "三国时期，诸葛亮是蜀国的一位聪明将领。", grammarPoints: "1. During 在...期间。\n2. general 将军，将领。" },
            { english: "One day, most of his soldiers went out to fight while only a few old and weak soldiers were left.", chinese: "有一天，他的大部分士兵都出去打仗了，只剩下一些老弱残兵。", grammarPoints: "1. go out to do sth. 出去做某事。\n2. while 然而，当...时候（表对比或同时）。\n3. were left 被留下（一般过去时的被动语态）。" },
            { english: "Suddenly, Sima Yi's large army came to attack it.", chinese: "突然，司马懿的大军来攻城。", grammarPoints: "1. Suddenly 突然（副词）。\n2. come to do sth. 来做某事。" },
            { english: "Everyone in the city felt very scared, but Zhuge Liang stayed calm.", chinese: "城里的每个人都很害怕，但诸葛亮保持镇定。", grammarPoints: "1. feel scared 感到害怕（系表结构）。\n2. stay calm 保持镇定（stay作连系动词）。" },
            { english: "He came up with a brilliant idea that he ordered soldiers to open the city gates and let some of them pretend to sweep the streets slowly.", chinese: "他想出了一个绝妙的主意，命令士兵打开城门，让其中一些人假装在慢慢扫街。", grammarPoints: "1. come up with 想出，提出。\n2. order sb. to do sth. 命令某人做某事。\n3. let sb. do sth. 让某人做某事。\n4. pretend to do sth. 假装做某事。" },
            { english: "Meanwhile, he sat on the city wall, playing the zither with a peaceful smile.", chinese: "与此同时，他坐在城墙上，带着平静的微笑弹琴。", grammarPoints: "1. Meanwhile 与此同时。\n2. playing the zither 现在分词短语作伴随状语。\n3. with a peaceful smile 带着平静的微笑（with表伴随）。" },
            { english: "Sima Yi thought there was an ambush, so he marched his army away.", chinese: "司马懿以为有埋伏，就把军队撤走了。", grammarPoints: "1. thought (that)... 以为...（宾语从句）。\n2. march... away 把...撤走，使...行军离开。" },
            { english: "This story tells us that we should think wisely when we are in trouble because nothing is more powerful than wisdom.", chinese: "这个故事告诉我们，遇到困难要运用智慧，因为没有什么比智慧更强大。", grammarPoints: "1. tell sb. that... 告诉某人...（宾语从句）。\n2. be in trouble 处于困境中。\n3. nothing is more powerful than... 没有什么比...更强大（比较级表最高级含义）。" }
        ]
    },
    {
        title: "8AU7: Spaced Repetition",
        audioPath: "/audio/spaced_repetition.wav",
        content: `Hi, everyone! Today, I'd like to share a useful memory technique - spaced repetition. 

When we learn something new, like English words, we often tend to forget them quickly. Spaced repetition can help us. The key is to review the information at right intervals. First, review the information on the same day we learn it. Then check it again after 24 hours. A week later, make a point of going over it once more. And finally, review it after 30 days. This process helps move knowledge from our short-term memory to long-term memory. 

Spaced repetition can play an important role in our studies. It can not only help us save time by reviewing the things we need to remember regularly, but also build our confidence because a good memory will make us feel proud. 

So, let's give spaced repetition a try! I'm sure it will help us achieve our learning goals.`,
        sentences: [
            { english: "Hi, everyone! Today, I'd like to share a useful memory technique - spaced repetition.", chinese: "大家好！今天，我想分享一种有用的记忆技巧——间隔重复。", grammarPoints: "1. would like to do sth. 想要做某事。\n2. technique 技巧，技术。" },
            { english: "When we learn something new, like English words, we often tend to forget them quickly.", chinese: "当我们学习新东西时，比如英语单词，我们往往忘得很快。", grammarPoints: "1. something new 形容词修饰不定代词要后置。\n2. tend to do sth. 倾向于做某事，往往会做某事。" },
            { english: "Spaced repetition can help us.", chinese: "间隔重复可以帮助我们。", grammarPoints: "1. spaced repetition 间隔重复。" },
            { english: "The key is to review the information at right intervals.", chinese: "关键是在适当的间隔复习信息。", grammarPoints: "1. The key is to do sth. 关键是做某事（不定式作表语）。\n2. at right intervals 在适当的间隔。" },
            { english: "First, review the information on the same day we learn it.", chinese: "首先，在学习当天的同一天复习信息。", grammarPoints: "1. review 复习（动词原形开头，祈使句）。\n2. on the same day 在同一天（具体某一天用介词on）。" },
            { english: "Then check it again after 24 hours.", chinese: "然后在24小时后再次查看。", grammarPoints: "1. after + 时间段，在...之后。" },
            { english: "A week later, make a point of going over it once more.", chinese: "一周后，务必再复习一遍。", grammarPoints: "1. make a point of doing sth. 务必做某事，特别注意做某事。\n2. go over 复习，回顾。\n3. once more 再一次。" },
            { english: "And finally, review it after 30 days.", chinese: "最后，在30天后复习。", grammarPoints: "1. finally 最后（副词）。" },
            { english: "This process helps move knowledge from our short-term memory to long-term memory.", chinese: "这个过程有助于将知识从短期记忆转移到长期记忆。", grammarPoints: "1. help (to) do sth. 帮助做某事。\n2. move... from... to... 把...从...转移到..." },
            { english: "Spaced repetition can play an important role in our studies.", chinese: "间隔重复可以在我们的学习中发挥重要作用。", grammarPoints: "1. play an important role in... 在...中发挥重要作用。" },
            { english: "It can not only help us save time by reviewing the things we need to remember regularly, but also build our confidence because a good memory will make us feel proud.", chinese: "它不仅可以通过定期复习我们需要记住的东西来帮助我们节省时间，还能建立我们的自信，因为好的记忆力会让我们感到自豪。", grammarPoints: "1. not only... but also... 不仅...而且...（连接并列结构）。\n2. the things we need to remember 定语从句修饰things。\n3. make sb. feel proud 使某人感到自豪。" },
            { english: "So, let's give spaced repetition a try!", chinese: "所以，让我们试试间隔重复法吧！", grammarPoints: "1. let's do sth. 让我们做某事。\n2. give sth. a try 尝试某事。" },
            { english: "I'm sure it will help us achieve our learning goals.", chinese: "我相信它会帮助我们实现学习目标。", grammarPoints: "1. be sure (that)... 确信...（宾语从句）。\n2. achieve goals 实现目标。" }
        ]
    },
    {
        title: "8AU8: Pets",
        audioPath: "/audio/pets.wav",
        content: `Recently, more and more young people like to keep pets. Some of them think their pets are part of the family. 

People keep pets mainly because they are lovely and can bring happiness. Pets are good companions, especially for the elderly and children, helping them feel less lonely. Playing with pets after school or work can help us relax. Moreover, taking care of pets teaches us responsibility and how to care for others. 

However, keeping pets also has its downsides. Pets can be noisy at night, which may disturb neighbors. Some pets might even attack people. Besides, they need to be cleaned often, and their waste can cause environmental problems. The cost of food and medical care for pets can also be high. 

In my opinion, keeping pets is a good idea if we can take proper care of them. We should make sure they are clean, healthy, and well-trained. By this way, pets can bring us joy without causing trouble to others.`,
        sentences: [
            { english: "Recently, more and more young people like to keep pets.", chinese: "最近，越来越多的年轻人喜欢养宠物。", grammarPoints: "1. Recently 最近（常与现在完成时或一般现在时连用）。\n2. more and more 越来越...（比较级 and 比较级）。\n3. keep pets 养宠物。" },
            { english: "Some of them think their pets are part of the family.", chinese: "他们中的一些人认为宠物是家庭的一部分。", grammarPoints: "1. think (that)... 认为...（宾语从句）。\n2. part of... ...的一部分。" },
            { english: "People keep pets mainly because they are lovely and can bring happiness.", chinese: "人们养宠物主要是因为它们可爱，能带来快乐。", grammarPoints: "1. mainly because 主要是因为（引导原因状语从句）。\n2. lovely 可爱的（形容词，不是副词）。" },
            { english: "Pets are good companions, especially for the elderly and children, helping them feel less lonely.", chinese: "宠物是很好的伴侣，特别是对于老人和孩子，帮助他们减少孤独感。", grammarPoints: "1. especially 特别是。\n2. the elderly 老年人（the + 形容词表示一类人）。\n3. helping them... 现在分词短语作伴随状语。\n4. feel less lonely 感觉没那么孤独。" },
            { english: "Playing with pets after school or work can help us relax.", chinese: "放学或下班后和宠物一起玩可以帮助我们放松。", grammarPoints: "1. Playing with pets 动名词短语作主语。\n2. help sb. (to) relax 帮助某人放松。" },
            { english: "Moreover, taking care of pets teaches us responsibility and how to care for others.", chinese: "此外，照顾宠物教会我们责任感以及如何关心他人。", grammarPoints: "1. Moreover 此外，而且。\n2. taking care of pets 动名词短语作主语。\n3. teach sb. sth. 教某人某事。\n4. how to care for... 疑问词+不定式作宾语。" },
            { english: "However, keeping pets also has its downsides.", chinese: "然而，养宠物也有其缺点。", grammarPoints: "1. downside 缺点，负面。" },
            { english: "Pets can be noisy at night, which may disturb neighbors.", chinese: "宠物在晚上可能会很吵，这可能会打扰邻居。", grammarPoints: "1. be noisy 吵闹的。\n2. which引导非限制性定语从句，指代前面整个句子。\n3. disturb 打扰。" },
            { english: "Some pets might even attack people.", chinese: "有些宠物甚至可能攻击人。", grammarPoints: "1. might 可能（表示推测）。\n2. attack 攻击。" },
            { english: "Besides, they need to be cleaned often, and their waste can cause environmental problems.", chinese: "此外，它们需要经常清洁，它们的排泄物可能会引起环境问题。", grammarPoints: "1. need to be cleaned 需要被清洁（含有被动语态的不定式）。\n2. cause 引起，导致。" },
            { english: "The cost of food and medical care for pets can also be high.", chinese: "宠物的食物和医疗费用也可能很高。", grammarPoints: "1. The cost of... ...的费用。\n2. medical care 医疗护理。" },
            { english: "In my opinion, keeping pets is a good idea if we can take proper care of them.", chinese: "在我看来，如果我们能妥善照顾它们，养宠物是个好主意。", grammarPoints: "1. In my opinion 在我看来。\n2. if引导条件状语从句。\n3. take proper care of... 妥善照顾..." },
            { english: "We should make sure they are clean, healthy, and well-trained.", chinese: "我们应该确保它们干净、健康并且训练有素。", grammarPoints: "1. make sure (that)... 确保...（宾语从句）。\n2. well-trained 训练有素的（复合形容词）。" },
            { english: "By this way, pets can bring us joy without causing trouble to others.", chinese: "通过这种方式，宠物可以给我们带来快乐，而不会给别人带来麻烦。", grammarPoints: "1. By this way 通过这种方式。\n2. bring sb. joy 给某人带来快乐。\n3. without doing sth. 没有做某事，而不...（介词后接动名词）。\n4. cause trouble to sb. 给某人惹麻烦。" }
        ]
    },
    {
        title: "8BU1: Digital Life Buddy",
        audioPath: "/audio/digital_life_buddy.wav",
        content: `Dear Mr Smith,

I am writing to you about my plan to start a voluntary activity called "Digital Life Buddy". 

I've found that many elderly foreign residents in our community have difficulty using Chinese digital services like WeChat Pay, Didi, and hospital booking apps. My classmates and I are willing to help. 

In order to help them, we'll devote our spare time to offering one-to-one guidance. For instance, we'll teach them how to use these apps as well as solve their daily digital problems. Moreover, we'll prepare some notes in both English and Chinese to avoid confusion. 

We hope to hold this activity on Sunday at the community hall. Could you please give us permission to organize it? Thank you for your support! 

We look forward to your reply. 

Yours sincerely,
Li Hua`,
        sentences: [
            { english: "Dear Mr Smith,", chinese: "亲爱的史密斯先生，", grammarPoints: "1. 英文信件的称呼语，通常用Dear开头，后接称谓和姓氏。" },
            { english: "I am writing to you about my plan to start a voluntary activity called \"Digital Life Buddy\".", chinese: "我写信给您是关于我计划开展一项名为“数字生活伙伴”的志愿活动。", grammarPoints: "1. write to sb. about sth. 写信给某人关于某事。\n2. plan to do sth. 计划做某事。\n3. called... 过去分词短语作后置定语，意为“被称为...的”。" },
            { english: "I've found that many elderly foreign residents in our community have difficulty using Chinese digital services like WeChat Pay, Didi, and hospital booking apps.", chinese: "我发现我们社区的许多外国老年居民在使用微信支付、滴滴和医院预约等中国数字服务时遇到困难。", grammarPoints: "1. find that... 发现...（宾语从句）。\n2. have difficulty (in) doing sth. 做某事有困难。\n3. like 像...一样，例如（介词）。" },
            { english: "My classmates and I are willing to help.", chinese: "我和我的同学很乐意帮忙。", grammarPoints: "1. be willing to do sth. 乐意做某事。" },
            { english: "In order to help them, we'll devote our spare time to offering one-to-one guidance.", chinese: "为了帮助他们，我们将利用业余时间提供一对一的指导。", grammarPoints: "1. In order to do sth. 为了做某事（表目的）。\n2. devote... to doing sth. 把...奉献给做某事（to是介词）。\n3. one-to-one 一对一的。" },
            { english: "For instance, we'll teach them how to use these apps as well as solve their daily digital problems.", chinese: "例如，我们将教他们如何使用这些应用程序，并解决他们日常的数字问题。", grammarPoints: "1. For instance 例如。\n2. how to use 疑问词+不定式。\n3. as well as 以及，也（连接并列成分）。" },
            { english: "Moreover, we'll prepare some notes in both English and Chinese to avoid confusion.", chinese: "此外，我们将准备中英文双语笔记以避免混淆。", grammarPoints: "1. in English and Chinese 用中英文（in表示用某种语言）。\n2. to avoid... 动词不定式作目的状语。" },
            { english: "We hope to hold this activity on Sunday at the community hall.", chinese: "我们希望周日在社区大厅举行这项活动。", grammarPoints: "1. hope to do sth. 希望做某事。\n2. on Sunday 在周日（具体某一天用on）。\n3. at the community hall 在社区大厅（小地点用at）。" },
            { english: "Could you please give us permission to organize it?", chinese: "您能批准我们组织这项活动吗？", grammarPoints: "1. Could you please do sth.? 请你做某事好吗？（委婉请求）。\n2. give sb. permission to do sth. 允许某人做某事。" },
            { english: "Thank you for your support!", chinese: "感谢您的支持！", grammarPoints: "1. Thank you for... 感谢你的...。" },
            { english: "We look forward to your reply.", chinese: "期待您的回复。", grammarPoints: "1. look forward to 期待（to是介词，后接名词、代词或动名词）。" },
            { english: "Yours sincerely,", chinese: "您真诚的，", grammarPoints: "1. 英文信件的结尾敬语，常用于知道收信人姓名的情况。" },
            { english: "Li Hua", chinese: "李华", grammarPoints: "1. 写信人签名。" }
        ]
    },
    {
        title: "8BU2: Body Language: Making a Fist",
        audioPath: "/audio/making_a_fist.wav",
        content: `Hello, everyone! Today I'd like to share my thoughts on a common kind of body language: making a fist.\n\nTo begin with, a fist often shows encouragement. For example, when we see a classmate struggling with a difficult Math problem, we can make a fist in front of our chest and shake it gently. It is a silent way to cheer others up and make them feel supported.\n\nHowever, we should also be careful with this gesture. A clenched fist can easily express anger, impatience or even danger. If someone is extremely angry, they may use this gesture as a warning, which makes others feel scared and uncomfortable.\n\nIn conclusion, understanding the different meanings of a simple gesture like a fist can help us improve our communication.\n\nThank you for listening!`,
        sentences: [
            { english: "Hello, everyone! Today I'd like to share my thoughts on a common kind of body language: making a fist.", chinese: "大家好！今天我想分享一下我对一种常见肢体语言的看法：握拳。", grammarPoints: "1. would like to do sth. 想要做某事。\n2. share one's thoughts on... 分享关于...的想法。\n3. a common kind of 一种常见的..." },
            { english: "To begin with, a fist often shows encouragement.", chinese: "首先，握拳通常表示鼓励。", grammarPoints: "1. To begin with 首先（常用于句首）。\n2. show encouragement 表达鼓励。" },
            { english: "For example, when we see a classmate struggling with a difficult Math problem, we can make a fist in front of our chest and shake it gently.", chinese: "例如，当我们看到同学在做一道数学难题时，我们可以在胸前握拳并轻轻摇动。", grammarPoints: "1. see sb. doing sth. 看见某人正在做某事。\n2. struggle with 与...作斗争，在...方面很吃力。\n3. in front of 在...前面。" },
            { english: "It is a silent way to cheer others up and make them feel supported.", chinese: "这是一种无声的方式来鼓励他人，让他们感到被支持。", grammarPoints: "1. a way to do sth. 做某事的方式。\n2. cheer sb. up 使某人振作起来（代词放中间）。\n3. make sb. feel + adj./v-ed 使某人感到..." },
            { english: "However, we should also be careful with this gesture.", chinese: "然而，我们也应该小心使用这个手势。", grammarPoints: "1. be careful with 小心对待...\n2. gesture 手势，姿势。" },
            { english: "A clenched fist can easily express anger, impatience or even danger.", chinese: "紧握的拳头很容易表达愤怒、不耐烦甚至危险。", grammarPoints: "1. clenched 握紧的（过去分词作定语）。\n2. express 表达（动词）。\n3. impatience 不耐烦（名词）。" },
            { english: "If someone is extremely angry, they may use this gesture as a warning, which makes others feel scared and uncomfortable.", chinese: "如果有人非常生气，他们可能会把这个手势作为警告，这会让别人感到害怕和不舒服。", grammarPoints: "1. If引导条件状语从句。\n2. use... as... 把...用作...\n3. which引导非限制性定语从句，指代前面的整个动作。\n4. make sb. feel + adj. 使某人感到..." },
            { english: "In conclusion, understanding the different meanings of a simple gesture like a fist can help us improve our communication.", chinese: "总之，了解像握拳这样简单手势的不同含义可以帮助我们改善沟通。", grammarPoints: "1. In conclusion 总之。\n2. understanding... 动名词短语作主语。\n3. help sb. (to) do sth. 帮助某人做某事。" },
            { english: "Thank you for listening!", chinese: "感谢您的聆听！", grammarPoints: "1. Thank you for doing sth. 感谢做某事。" }
        ]
    },
    {
        title: "8BU3: My favourite Chinese animation",
        audioPath: "/audio/my_favourite_chinese_animation.wav",
        content: `Among many wonderful Chinese animations, Ne Zha: Birth of the Demon Child stands out as my favourite. It tells the exciting story of a brave boy called Ne Zha. Though he is misunderstood and disliked at first, he finally sacrifice himself to protect others. 

I love this animation for three reasons. First, it is made with amazing pictures and exciting action scenes. Besides, traditional Chinese culture is fully reflected in it. Most importantly, it teaches us that we can choose to be kind and brave, and should not be easily influenced by others’ opinions. 

To sum up, this inspiring animation not only brings me joy but also makes me proud of Chinese animations.`,
        sentences: [
            { english: "Among many wonderful Chinese animations, Ne Zha: Birth of the Demon Child stands out as my favourite.", chinese: "在许多优秀的中国动画中，《哪吒之魔童降世》是我最喜欢的。", grammarPoints: "1. Among... 在...之中。\n2. stand out 脱颖而出，突出。\n3. as my favourite 作为我最喜欢的。" },
            { english: "It tells the exciting story of a brave boy called Ne Zha.", chinese: "它讲述了一个叫哪吒的勇敢男孩的激动人心的故事。", grammarPoints: "1. tell the story of... 讲述...的故事。\n2. called... 过去分词短语作后置定语，意为“名叫...的”。" },
            { english: "Though he is misunderstood and disliked at first, he finally sacrifice himself to protect others.", chinese: "虽然他起初被误解和讨厌，但他最终牺牲自己来保护他人。", grammarPoints: "1. Though 尽管，虽然（引导让步状语从句）。\n2. be misunderstood and disliked 被误解和讨厌（被动语态）。\n3. sacrifice oneself to do sth. 牺牲自己去做某事。" },
            { english: "I love this animation for three reasons.", chinese: "我喜欢这部动画有三个原因。", grammarPoints: "1. for... reasons 因为...原因。" },
            { english: "First, it is made with amazing pictures and exciting action scenes.", chinese: "首先，它是由精美的画面和激动人心的动作场面制作而成的。", grammarPoints: "1. be made with 用...制作。\n2. amazing pictures 精美的画面。\n3. exciting action scenes 激动人心的动作场面。" },
            { english: "Besides, traditional Chinese culture is fully reflected in it.", chinese: "此外，中国传统文化在其中得到了充分体现。", grammarPoints: "1. Besides 此外。\n2. be reflected in 在...中体现。" },
            { english: "Most importantly, it teaches us that we can choose to be kind and brave, and should not be easily influenced by others’ opinions.", chinese: "最重要的是，它教会我们，我们可以选择善良和勇敢，不应该轻易受他人意见的影响。", grammarPoints: "1. Most importantly 最重要的是。\n2. teach sb. that... 教会某人...（宾语从句）。\n3. choose to do sth. 选择做某事。\n4. be influenced by 被...影响。" },
            { english: "To sum up, this inspiring animation not only brings me joy but also makes me proud of Chinese animations.", chinese: "总之，这部鼓舞人心的动画不仅给我带来了快乐，也让我为中国动画感到自豪。", grammarPoints: "1. To sum up 总之。\n2. not only... but also... 不仅...而且...。\n3. bring sb. joy 给某人带来快乐。\n4. make sb. proud of... 让某人因...而自豪。" }
        ]
    },
    {
        title: "8BU4: Protecting Traditional Handicrafts",
        audioPath: "/audio/protecting_traditional_handicrafts.wav",
        content: `Dear classmates,
As we all know, Shenzhen is a wonderful modern city with rich culture and strong technological atmosphere. However, some traditional handicrafts are slowly disappearing. It is our duty to take action to protect and develop them.

We can use digital cameras and computers to record the whole making process of precious crafts，such as paper-cut, dough figurine and kite making. What’s more, it will be more attractive if we post short videos online to let more people know about traditional arts. By combining technology with tradition, we are able to make old crafts come to life and popular again.

Our traditional crafts should be cherished and passed on from generation to generation. Come and join us!`,
        sentences: [
            { english: "Dear classmates,", chinese: "亲爱的同学们，", grammarPoints: "1. 英文演讲或信件的常用称呼语。" },
            { english: "As we all know, Shenzhen is a wonderful modern city with rich culture and strong technological atmosphere.", chinese: "众所周知，深圳是一座拥有丰富文化和浓厚科技氛围的精彩现代城市。", grammarPoints: "1. As we all know 众所周知（非限制性定语从句）。\n2. with... 介词短语作后置定语，表示“具有...”。" },
            { english: "However, some traditional handicrafts are slowly disappearing.", chinese: "然而，一些传统手工艺品正在慢慢消失。", grammarPoints: "1. However 然而（表转折）。\n2. are disappearing 现在进行时表示正在发生的动作。" },
            { english: "It is our duty to take action to protect and develop them.", chinese: "采取行动保护和发展它们是我们的责任。", grammarPoints: "1. It is one's duty to do sth. 做某事是某人的责任。\n2. take action to do sth. 采取行动做某事。" },
            { english: "We can use digital cameras and computers to record the whole making process of precious crafts，such as paper-cut, dough figurine and kite making.", chinese: "我们可以使用数码相机和电脑来记录珍贵工艺品的整个制作过程，如剪纸、捏面人和风筝制作。", grammarPoints: "1. use... to do... 使用...来做...\n2. such as 例如（用于列举）。" },
            { english: "What’s more, it will be more attractive if we post short videos online to let more people know about traditional arts.", chinese: "更重要的是，如果我们在线发布短视频，让更多的人了解传统艺术，它会更有吸引力。", grammarPoints: "1. What's more 更重要的是。\n2. it will be... if... if引导的条件状语从句，主将从现。\n3. let sb. do sth. 让某人做某事。" },
            { english: "By combining technology with tradition, we are able to make old crafts come to life and popular again.", chinese: "通过将技术与传统相结合，我们能够让古老的工艺焕发生机并再次流行。", grammarPoints: "1. By doing sth. 通过做某事（方式状语）。\n2. combine... with... 把...与...结合。\n3. be able to do sth. 能够做某事。\n4. make sth. do/adj. 使某人...；come to life 焕发生机。" },
            { english: "Our traditional crafts should be cherished and passed on from generation to generation.", chinese: "我们的传统工艺应该被珍惜并代代相传。", grammarPoints: "1. should be cherished 情态动词的被动语态。\n2. pass on 传递，传下去。\n3. from generation to generation 代代相传。" },
            { english: "Come and join us!", chinese: "快来加入我们吧！", grammarPoints: "1. 祈使句，用于号召他人加入。" }
        ]
    },
    {
        title: "8BU5: The Yangtze Finless Porpoise",
        audioPath: "/audio/8bu5.wav",
        content: `Good morning, everyone. Today, I’d like to introduce a rare and fascinating animal—the Yangtze finless porpoise, which is sadly facing the threat of extinction.
These lovely creatures, with their grey and white skin, round heads and friendly smiles, mainly feed on fish and shrimps. They usually live in small groups, helping each other find food and stay safe.
However, their number is dropping quickly due to serious water pollution and lack of food caused by overfishing. As a result, their future looks very uncertain.
It is important for us to take action now. We should stop polluting the Yangtze River and protect their home. At the same time, everyone should work together to raise awareness and help save these special animals.
Thank you for listening. Let’s do our part to protect the Yangtze finless porpoise!`,
        sentences: [
            { english: "Good morning, everyone.", chinese: "大家早上好。", grammarPoints: "1. 常用作演讲开场白。" },
            { english: "Today, I’d like to introduce a rare and fascinating animal—the Yangtze finless porpoise, which is sadly facing the threat of extinction.", chinese: "今天，我想介绍一种罕见而迷人的动物——长江江豚，可悲的是它正面临灭绝的威胁。", grammarPoints: "1. would like to do sth. 想要做某事。\n2. which 引导非限制性定语从句，修饰前面的 animal。\n3. face the threat of extinction 面临灭绝的威胁。" },
            { english: "These lovely creatures, with their grey and white skin, round heads and friendly smiles, mainly feed on fish and shrimps.", chinese: "这些可爱的生物，长着灰白色的皮肤、圆圆的脑袋和友好的标志性微笑，主要以鱼虾为食。", grammarPoints: "1. with... 介词短语作后置定语，表示“具有...特征”。\n2. feed on... 以...为食。" },
            { english: "They usually live in small groups, helping each other find food and stay safe.", chinese: "它们通常成群生活，互相帮助寻找食物并保持安全。", grammarPoints: "1. in small groups 成小群地。\n2. helping 动词-ing形式作伴随状语。\n3. help sb. (to) do sth. 帮助某人做某事。\n4. stay safe 保持安全（stay是系动词，后接形容词）。" },
            { english: "However, their number is dropping quickly due to serious water pollution and lack of food caused by overfishing.", chinese: "然而，由于严重的水污染和过度捕捞导致的食物匮乏，它们的数量正在迅速下降。", grammarPoints: "1. their number is dropping 它们的数量正在下降。\n2. due to 由于，因为。\n3. caused by... 过去分词短语作后置定语，修饰 lack of food。" },
            { english: "As a result, their future looks very uncertain.", chinese: "结果，它们的未来看起来非常不确定。", grammarPoints: "1. As a result 结果。\n2. look uncertain 看起来不确定（look是系动词）。" },
            { english: "It is important for us to take action now.", chinese: "我们现在首要任务就是采取行动。", grammarPoints: "1. It is + adj. + for sb. + to do sth. 对某人来说做某事是...的。\n2. take action 采取行动。" },
            { english: "We should stop polluting the Yangtze River and protect their home.", chinese: "我们应该停止污染长江，保护它们的家园。", grammarPoints: "1. stop doing sth. 停止做（正在做的）某事。" },
            { english: "At the same time, everyone should work together to raise awareness and help save these special animals.", chinese: "同时，大家应该共同努力提高认识，帮助拯救这些特殊的动物。", grammarPoints: "1. At the same time 同时。\n2. work together to do sth. 共同努力做某事。\n3. raise awareness 提高意识。" },
            { english: "Thank you for listening.", chinese: "感谢大家的聆听。", grammarPoints: "1. 常见演讲结束语。\n2. Thank you for doing sth. 感谢做某事。" },
            { english: "Let’s do our part to protect the Yangtze finless porpoise!", chinese: "让我们尽自己的一份力量来保护长江江豚！", grammarPoints: "1. Let's do sth. 让我们做某事。\n2. do one's part 尽某人的一份力量。" }
        ]
    },
    {
        title: "8BU6: English Week",
        audioPath: "/audio/8bu6.wav",
        content: `Dear Alice,
How is everything going? I’m writing to share the wonderful English Week held in our school last week, which turned out to be a huge success.
A variety of fantastic activities were organized, such as treasure hunt, English corner, book fair, and so on. Among all of them, the English Drama Show impressed me most.
I joined in the drama with my classmates. We practised our lines repeatedly after class and adjusted our facial expressions and gestures over and over again. We spared no effort to polish our acting skills so that we could act vividly on stage. In the end, we put on a brilliant performance.
Not only has this activity greatly improved my oral English, but it also built up my confidence to speak in public. Meanwhile, I truly realized the importance of teamwork.
Yours
Li Mei`,
        sentences: [
            { english: "Dear Alice,", chinese: "亲爱的爱丽丝，", grammarPoints: "1. 英文信件常用称呼。" },
            { english: "How is everything going?", chinese: "一切都还好吗？", grammarPoints: "1. 信件开头常用问候语。" },
            { english: "I’m writing to share the wonderful English Week held in our school last week, which turned out to be a huge success.", chinese: "我写信是想和你分享上周在我们学校举办的精彩的英语周，它取得了巨大的成功。", grammarPoints: "1. I'm writing to do sth. 我写信是为了做某事。\n2. held... 过去分词定语，修饰 English Week。\n3. which 引导非限制性定语从句，指代前面的 English Week。\n4. turn out to be... 结果是...，被证明是...。" },
            { english: "A variety of fantastic activities were organized, such as treasure hunt, English corner, book fair, and so on.", chinese: "学校组织了各种精彩的活动，如寻宝游戏、英语角、书展等。", grammarPoints: "1. a variety of 各种各样的。\n2. such as 例如。\n3. and so on 等等。" },
            { english: "Among all of them, the English Drama Show impressed me most.", chinese: "在所有活动中，英语戏剧秀给我留下了最深刻的印象。", grammarPoints: "1. among 在...之中。\n2. impress sb. 给某人留下印象。" },
            { english: "I joined in the drama with my classmates.", chinese: "我和我的同学们一起参加了戏剧表演。", grammarPoints: "1. join in 参加（活动）。" },
            { english: "We practised our lines repeatedly after class and adjusted our facial expressions and gestures over and over again.", chinese: "课后我们一遍又一遍地练习台词，并反复调整我们的面部表情和手势。", grammarPoints: "1. practise doing sth. 练习做某事（此处跟名词）。\n2. repeatedly / over and over again 一遍又一遍地，反复地。\n3. adjust 调整。" },
            { english: "We spared no effort to polish our acting skills so that we could act vividly on stage.", chinese: "我们不遗余力地打磨我们的演技，以便我们能在舞台上生动表演。", grammarPoints: "1. spare no effort to do sth. 不遗余力做某事。\n2. polish 打磨，改善。\n3. so that 引导目的状语从句，以便。\n4. vividly 生动地。" },
            { english: "In the end, we put on a brilliant performance.", chinese: "最后，我们上演了一场精彩的表演。", grammarPoints: "1. In the end 最后。\n2. put on 上演，表演。" },
            { english: "Not only has this activity greatly improved my oral English, but it also built up my confidence to speak in public.", chinese: "这项活动不仅极大地提高了我的英语口语，而且还增强了我在公众面前讲话的信心。", grammarPoints: "1. Not only... but also... 不但...而且...（Not only置于句首，其引导的部分需用部分倒装）。\n2. build up one's confidence 建立某人的信心。\n3. in public 公开地，在公众面前。" },
            { english: "Meanwhile, I truly realized the importance of teamwork.", chinese: "同时，我真正意识到了团队合作的重要性。", grammarPoints: "1. Meanwhile 同时。\n2. realize 意识到。\n3. the importance of... ...的重要性。" },
            { english: "Yours", chinese: "你的，", grammarPoints: "1. 书信常用落款结尾词。" },
            { english: "Li Mei", chinese: "李梅", grammarPoints: "1. 署名。" }
        ]
    },
    {
        title: "8BU7: Liu Yang: A Role Model in Space",
        audioPath: "/audio/8bu7.wav",
        content: `Liu Yang, China’s first female astronaut, has set a great example for us all. Born in Henan Province in 1978, she dreamed of flying high from an early age. Later, she was admitted into an aviation school and grew into an excellent pilot through persistent efforts.
To make her dream come true, Liu kept improving herself and trained strictly every day. In 2010, she was selected as one of China’s second batch of astronauts. She successfully completed the 13-day Shenzhou-9 mission in 2012. Liu Yang spent 183 days orbiting the Earth during the Shenzhou-14 space mission 10 years later.
In honour of her outstanding achievements, Liu was awarded the title “Heroic Astronaut” and a second-class aerospace achievement medal. She is a true role model who inspires teenagers to study hard and stick to their dreams bravely.`,
        sentences: [
            { english: "Liu Yang, China’s first female astronaut, has set a great example for us all.", chinese: "中国首位女航天员刘洋为我们所有人树立了一个伟大的榜样。", grammarPoints: "1. China's first female astronaut 作 Liu Yang 的同位语。\n2. set a great example for sb. 为某人树立榜样。" },
            { english: "Born in Henan Province in 1978, she dreamed of flying high from an early age.", chinese: "她1978年出生于河南省，从小就梦想着飞得更高。", grammarPoints: "1. Born in... 过去分词短语作状语，表示时间或背景。\n2. dream of doing sth. 梦想做某事。\n3. from an early age 从小。" },
            { english: "Later, she was admitted into an aviation school and grew into an excellent pilot through persistent efforts.", chinese: "后来，她被一所航空学校录取，并通过不懈的努力成长为一名优秀的飞行员。", grammarPoints: "1. be admitted into 被……录取/接纳。\n2. grow into 成长为，变成。\n3. through persistent efforts 通过不懈的努力。" },
            { english: "To make her dream come true, Liu kept improving herself and trained strictly every day.", chinese: "为了让梦想成真，刘洋不断提升自己，每天进行严格的训练。", grammarPoints: "1. To make her dream come true 不定式短语作目的状语。\n2. make sth. do sth. 使某事发生 / 使……做某事（come使用原形）。\n3. keep doing sth. 持续做某事，不断做某事。\n4. train strictly 严格训练。" },
            { english: "In 2010, she was selected as one of China’s second batch of astronauts.", chinese: "2010年，她入选中国第二批航天员。", grammarPoints: "1. be selected as... 被选为……。\n2. one of + 名词复数，表示“……之一”。\n3. batch 指“一批”。" },
            { english: "She successfully completed the 13-day Shenzhou-9 mission in 2012.", chinese: "她在2012年成功完成了为期13天的神舟九号任务。", grammarPoints: "1. successfully 修饰动词 completed。\n2. 13-day 是复合形容词，作定语修饰 mission。" },
            { english: "Liu Yang spent 183 days orbiting the Earth during the Shenzhou-14 space mission 10 years later.", chinese: "10年后，在神舟十四号航天任务期间，刘洋在绕地球轨道的太空中度过了183天。", grammarPoints: "1. spend + 时间 + doing sth. 花费时间做某事。\n2. orbiting here is a verb meaning '围绕……轨道运行'。" },
            { english: "In honour of her outstanding achievements, Liu was awarded the title “Heroic Astronaut” and a second-class aerospace achievement medal.", chinese: "为表彰她的杰出成就，刘洋被授予“英雄航天员”荣誉称号和二级航天功勋奖章。", grammarPoints: "1. In honour of 为了纪念/向……致敬，为表彰。\n2. be awarded 被授予，被颁发。\n3. second-class medal 二等功勋章。" },
            { english: "She is a true role model who inspires teenagers to study hard and stick to their dreams bravely.", chinese: "她是一个真正的榜样，激励着青少年努力学习，勇敢地坚持自己的梦想。", grammarPoints: "1. who 引导限制性定语从句，修饰 preceding noun model。\n2. inspire sb. to do sth. 激励某人做某事。\n3. stick to 坚持，执着于。\n4. study hard and stick to... 两个动词不定式并列（第二个省略了 to）。" }
        ]
    },
    {
        title: "8BU8: Recommendation for Photography Club",
        audioPath: "/audio/8bu8.wav",
        content: `Dear club teachers,
I’m Li Hua and I’m writing to strongly recommend my international classmate Jack to become a member of our photography club.
As an outgoing and warm-hearted teenager, Jack has a great love for photography and outdoor team activities. Not only is he good at communicating with people from different cultures, but he is also always willing to offer help whenever his classmates are in trouble.
He expects to join our club so that he can get a deeper understanding of Chinese campus culture and make more friends who share the same hobbies. Besides, he wishes to capture wonderful school memories with his camera.
If accepted, he will take an active part in all club activities. He intends to take photos for our events and exchange creative thoughts with other members to make our club more lively. I firmly believe he is well qualified for this position.
Yours sincerely,
Li Hua`,
        sentences: [
            { english: "Dear club teachers,", chinese: "亲爱的俱乐部老师们，", grammarPoints: "1. 英文信件、申请书、推荐信常用称呼语。" },
            { english: "I’m Li Hua and I’m writing to strongly recommend my international classmate Jack to become a member of our photography club.", chinese: "我是李华，我写信是为了强烈推荐我的国际班同学杰克成为我们摄影俱乐部的一员。", grammarPoints: "1. write to do sth. 写信去做某事（表目的）。\n2. recommend sb. to do sth. 推荐某人做某事。\n3. become a member of... 成为……的成员。" },
            { english: "As an outgoing and warm-hearted teenager, Jack has a great love for photography and outdoor team activities.", chinese: "作为一名性格开朗、热心肠的青少年，杰克对摄影和户外团队活动有着极大的热爱。", grammarPoints: "1. As 作为（介词）。\n2. have a great love for... 对……有极大的热爱。" },
            { english: "Not only is he good at communicating with people from different cultures, but he is also always willing to offer help whenever his classmates are in trouble.", chinese: "他不仅擅长与来自不同文化背景的人交流，而且每当同学遇到困难时，他也总是乐意伸出援手。", grammarPoints: "1. Not only... but also... 不仅……而且……。\n2. Not only 置于句首时，其所在的句子要进行部分倒装（Not only is he...）。\n3. be good at doing sth. 擅长做某事。\n4. be willing to do sth. 乐意做某事。\n5. whenever 无论何时，引导时间状语从句。\n6. in trouble 处于困境中。" },
            { english: "He expects to join our club so that he can get a deeper understanding of Chinese campus culture and make more friends who share the same hobbies.", chinese: "他期望加入我们的俱乐部，以便他能更深入地了解中国的校园文化，并结交更多志同道合的朋友。", grammarPoints: "1. expect to do sth. 期望做某事。\n2. so that 引导目的状语从句，意为“以便；为了”。\n3. get a deeper understanding of... 获得对……更深入的理解。\n4. make friends 结交朋友。\n5. who share the same hobbies 关系代词 who 引导的定语从句，修饰 friends。" },
            { english: "Besides, he wishes to capture wonderful school memories with his camera.", chinese: "此外，他希望用他的相机记录下美好的校园回忆。", grammarPoints: "1. besides 此外，而且（副词）。\n2. wish to do sth. 希望做某事。\n3. capture memories 捕捉/记录回忆。\n4. with one's camera 用某人的相机（with表示用某种工具）。" },
            { english: "If accepted, he will take an active part in all club activities.", chinese: "如果被录用，他将积极参加俱乐部的一切活动。", grammarPoints: "1. If accepted 是条件状语从句的省略形式，完整为 If he is accepted。\n2. take an active part in 积极参加……。" },
            { english: "He intends to take photos for our events and exchange creative thoughts with other members to make our club more lively.", chinese: "他打算为我们的活动拍照，并与其他成员交流创意想法，使我们的俱乐部更加活跃。", grammarPoints: "1. intend to do sth. 打算/计划做某事。\n2. take photos for... 为……拍照。\n3. exchange... with... 与……交流/交换……。\n4. make our club more lively 使我们的俱乐部更加活跃（make + 宾语 + 宾补[形容词]）。" },
            { english: "I firmly believe he is well qualified for this position.", chinese: "我坚信他非常胜任这个职位。", grammarPoints: "1. firmly believe 坚信。\n2. he is... 是省略了 that 的宾语从句。\n3. be well qualified for 极其胜任/符合……的条件。" },
            { english: "Yours sincerely,", chinese: "您真诚的，", grammarPoints: "1. 英文信件、推荐信、求职信结尾的常用客套语。" },
            { english: "Li Hua", chinese: "李华", grammarPoints: "1. 信件署名。" }
        ]
    }
];

export const INITIAL_ESSAYS: Essay[] = [...RAW_ESSAYS, ...SEVENTH_GRADE_ESSAYS].reverse().map(raw => ({
    id: uuidv4(),
    title: raw.title,
    rawContent: raw.content,
    tokens: smartTokenize(raw.content),
    sentences: raw.sentences.map((s, i) => ({ ...s, id: `s-${i}-${Date.now()}` })), // Use pre-defined sentences
    isAnalyzed: true, 
    createdAt: Date.now(),
    isBuiltIn: true,
    audioPath: raw.audioPath
}));

// --- Separate Audio Branch Configuration ---
// When exporting to GitHub, AI Studio can sometimes overwrite branches or delete untracked audio files.
// To solve this, you can create a separate branch in your GitHub repository named 'audio-assets',
// and upload your .wav files there. This configuration will automatically fetch those files.
export const GITHUB_REPOSITORY_INFO = {
    username: "JamesMeng666666", // <-- 1. Change this to your GitHub username
    repo: "EssayMemo",     // <-- 2. Change this to your GitHub repository name
    audioBranch: "audio-assets",       // <-- 3. The separate branch for your audio files
};

export const REMOTE_AUDIO_BASE_URL = `https://raw.githubusercontent.com/${GITHUB_REPOSITORY_INFO.username}/${GITHUB_REPOSITORY_INFO.repo}/${GITHUB_REPOSITORY_INFO.audioBranch}/public`;
