import React, { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid'; 
import { INITIAL_ESSAYS, REMOTE_AUDIO_BASE_URL, smartTokenize } from './constants';
import { Essay, PracticeMode, Token, UserAnswers, VerificationResult } from './types';
import { analyzeTextForMemorization, analyzeTextForTranslation, generateSpeechForText } from './services/geminiService';
import { playText, playWav, playAudioFromURL, pcmToWav, stopAudio } from './services/audioService';
import { saveAudioToDB, getAudioFromDB, hasAudioInDB } from './services/storageService';

// --- Icons ---
const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
);
const PauseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
);
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
);
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
);
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
const PrinterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
);
const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
);

const LoadingSpinner = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

// --- Helpers ---
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);
const DELETED_BUILTIN_KEY = 'memomaster_deleted_builtin_titles_v1';

const normalizeText = (text: string) => {
    return text.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");
};

const joinPaths = (base: string, path: string) => {
    const b = base.endsWith('/') ? base.slice(0, -1) : base;
    const p = path.startsWith('/') ? path : '/' + path;
    return b + p;
};

// --- Components ---

export default function App() {
  const [essays, setEssays] = useState<Essay[]>([]);
  const [activeEssayId, setActiveEssayId] = useState<string | null>(null);
  const [mode, setMode] = useState<PracticeMode>(PracticeMode.READ);
  
  // UI State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // State for practice
  const [answers, setAnswers] = useState<UserAnswers>({});
  const [results, setResults] = useState<VerificationResult | null>(null);
  const [score, setScore] = useState<number | null>(null);

  // State for Audio
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDownloadingAudio, setIsDownloadingAudio] = useState(false);
  const [isLocalFileReady, setIsLocalFileReady] = useState(false);
  const [isRemoteFileReady, setIsRemoteFileReady] = useState(false);

  // Initialization
  useEffect(() => {
    // Changed key to v3 to force refresh with new translation data
    const STORAGE_KEY = 'memomaster_essays_v3';
    const savedEssays = localStorage.getItem(STORAGE_KEY);
    let deletedTitles: string[] = [];
    try {
      const parsedTitles = JSON.parse(localStorage.getItem(DELETED_BUILTIN_KEY) || '[]');
      if (Array.isArray(parsedTitles)) deletedTitles = parsedTitles;
    } catch {
      // Ignore malformed deletion preferences and keep the saved essays.
    }
    const deletedBuiltins = new Set(deletedTitles);
    
    if (savedEssays) {
      let parsed: Essay[] = JSON.parse(savedEssays);
      
      // Update logic: Sync `audioPath`, `grammarPoints`, and `rawContent` from INITIAL_ESSAYS to `savedEssays`
      // This ensures that if the code is updated with new paths or grammar points, existing users get them.
       parsed = parsed.map((saved: Essay) => {
           const fresh = INITIAL_ESSAYS.find(init => init.title === saved.title);
           const rawContent = saved.rawContent || fresh?.rawContent || '';
           if (fresh && rawContent === fresh.rawContent) {
               return {
                   ...saved,
                   audioPath: fresh.audioPath,
                   sentences: fresh.sentences,
                   rawContent,
                   tokens: smartTokenize(rawContent),
                   isBuiltIn: true
               };
           }
           return saved.tokens?.map(t => t.text).join('') === rawContent
             ? { ...saved, rawContent }
             : { ...saved, rawContent, tokens: smartTokenize(rawContent) };
       });

       parsed = parsed.filter(saved => !(saved.isBuiltIn && deletedBuiltins.has(saved.title)));

      // Add any new INITIAL_ESSAYS that are missing
      const existingTitles = new Set(parsed.map((e: Essay) => e.title));
       const newEssays = INITIAL_ESSAYS.filter(init => !existingTitles.has(init.title) && !deletedBuiltins.has(init.title));
      parsed = [...parsed, ...newEssays];

      // Remove the old duplicate essay without the prefix
      parsed = parsed.filter((e: Essay) => e.title !== "Body Language: Making a Fist");

      // Sort parsed essays to match INITIAL_ESSAYS order
      parsed.sort((a: Essay, b: Essay) => {
          const indexA = INITIAL_ESSAYS.findIndex(init => init.title === a.title);
          const indexB = INITIAL_ESSAYS.findIndex(init => init.title === b.title);
          
          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return -1; // custom essays first
          if (indexB === -1) return 1;
          
          return indexA - indexB;
      });

      setEssays(parsed);
      if (parsed.length > 0) setActiveEssayId(parsed[0].id);
    } else {
      // Load initial essays from updated constants
       const availableEssays = INITIAL_ESSAYS.filter(init => !deletedBuiltins.has(init.title));
       setEssays(availableEssays);
       if (availableEssays.length > 0) setActiveEssayId(availableEssays[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save to local storage whenever essays change
  useEffect(() => {
    const STORAGE_KEY = 'memomaster_essays_v3';
    if (essays.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(essays));
    }
  }, [essays]);

  // Check for local file existence when active essay changes
  useEffect(() => {
      const checkFile = async () => {
          if (!activeEssayId) return;
          const essay = essays.find(e => e.id === activeEssayId);
          if (essay && essay.audioPath) {
              try {
                  // Add cache buster to avoid cached 404s
                  const res = await fetch(`${essay.audioPath}?t=${Date.now()}`, { method: 'HEAD' });
                  const contentType = res.headers.get('content-type');
                  const isLocalReady = res.ok && contentType !== null && !contentType.includes('text/html');
                  setIsLocalFileReady(isLocalReady);
                  setIsRemoteFileReady(false);
                  
                  if (!isLocalReady) {
                      // Try resolving from GitHub branch if local is missing
                      const remoteRes = await fetch(`${joinPaths(REMOTE_AUDIO_BASE_URL, essay.audioPath)}?t=${Date.now()}`, { method: 'HEAD' });
                      setIsRemoteFileReady(remoteRes.ok);
                  }
              } catch (e) {
                  setIsLocalFileReady(false);
                  setIsRemoteFileReady(false);
              }
          } else {
              setIsLocalFileReady(false);
              setIsRemoteFileReady(false);
          }
          // Stop audio if switching essays
          stopAudio();
          setIsPlaying(false);
      };
      checkFile();
  }, [activeEssayId, essays]);

  // Reset answers when mode changes
  useEffect(() => {
    setAnswers({});
    setResults(null);
    setScore(null);
    stopAudio();
    setIsPlaying(false);
  }, [mode]);

  const activeEssay = essays.find(e => e.id === activeEssayId);

  const handleAddEssay = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    
    setIsProcessing(true);
    try {
      const [tokens, sentences] = await Promise.all([
          analyzeTextForMemorization(newContent),
          analyzeTextForTranslation(newContent)
      ]);
      
      const newEssay: Essay = {
        id: generateId(),
        title: newTitle,
        rawContent: newContent,
        tokens,
        sentences,
        isAnalyzed: true,
        createdAt: Date.now()
      };
      setEssays(prev => [...prev, newEssay]);
      setActiveEssayId(newEssay.id);
      setIsAddModalOpen(false);
      setNewTitle('');
      setNewContent('');
      setMode(PracticeMode.READ);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to process essay.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteEssay = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this essay?")) {
        const essay = essays.find(ex => ex.id === id);
        if (essay?.isBuiltIn) {
            let deletedTitles: string[] = [];
            try {
                const parsedTitles = JSON.parse(localStorage.getItem(DELETED_BUILTIN_KEY) || '[]');
                if (Array.isArray(parsedTitles)) deletedTitles = parsedTitles;
            } catch {
                // Replace malformed preferences with the confirmed deletion.
            }
            localStorage.setItem(DELETED_BUILTIN_KEY, JSON.stringify([...new Set([...deletedTitles, essay.title])]));
        }
        const newEssays = essays.filter(ex => ex.id !== id);
        setEssays(newEssays);
        localStorage.setItem('memomaster_essays_v3', JSON.stringify(newEssays));
        if (activeEssayId === id) {
            setActiveEssayId(newEssays.length > 0 ? newEssays[0].id : null);
        }
    }
  };

  const handleSelectEssayMobile = (id: string) => {
      setActiveEssayId(id);
      setIsMobileMenuOpen(false);
  }

  // --- Audio Export Logic ---
  const handleExportAudio = async () => {
    if (!activeEssay) return;

    setIsDownloadingAudio(true);
    try {
        // 1. Get raw PCM from Gemini
        const pcmData = await generateSpeechForText(activeEssay.rawContent);
        // 2. Convert to WAV
        const wavData = pcmToWav(pcmData);
        
        // Save to DB for cache playback
        try {
            await saveAudioToDB(activeEssay.id, wavData);
        } catch (e) {
            console.warn("Failed to save audio to DB:", e);
        }

        // 3. Create a download link
        const blob = new Blob([wavData], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        // Use the configured audioPath filename if available, otherwise default
        let filename = 'audio.wav';
        if (activeEssay.audioPath) {
            // Extract filename from path (e.g., /audio/nie_er.wav -> nie_er.wav)
            const parts = activeEssay.audioPath.split('/');
            filename = parts[parts.length - 1];
        } else {
             filename = `${activeEssay.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.wav`;
        }
        
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Trigger a check to see if the user moves it
        setTimeout(() => {
             if (activeEssay.audioPath) {
                  fetch(`${activeEssay.audioPath}?t=${Date.now()}`, { method: 'HEAD' }).then(res => setIsLocalFileReady(res.ok)).catch(()=>{});
             }
        }, 5000);

        alert(`Downloaded ${filename}!\n\nPlease move this file to: \n<YourProject>/public/audio/${filename}\n\nThen it will be detected automatically.`);

    } catch (e) {
        console.error(e);
        alert(e instanceof Error ? e.message : "Failed to generate audio.");
    } finally {
        setIsDownloadingAudio(false);
    }
  };

  const handlePlayAudio = async () => {
    if (!activeEssay) return;
    
    if (isPlaying) {
        stopAudio();
        setIsPlaying(false);
    } else {
        setIsPlaying(true);
        const onFinish = () => setIsPlaying(false);

        // Priority 1: Local File in public/audio
        if (isLocalFileReady && activeEssay.audioPath) {
             console.log("Playing from local file:", activeEssay.audioPath);
             playAudioFromURL(activeEssay.audioPath, onFinish, () => {
                 // Error fallback
                 console.warn("Local file failed, trying cache");
                 playFromCacheOrTTS(onFinish);
             });
        } 
        // Priority 2: Remote Branch File
        else if (isRemoteFileReady && activeEssay.audioPath) {
             const remoteUrl = joinPaths(REMOTE_AUDIO_BASE_URL, activeEssay.audioPath);
             console.log("Playing from remote branch:", remoteUrl);
             playAudioFromURL(remoteUrl, onFinish, () => {
                 console.warn("Remote file failed, trying cache");
                 playFromCacheOrTTS(onFinish);
             });
        }
        else {
             // Priority 3/4: Cache or TTS
             playFromCacheOrTTS(onFinish);
        }
    }
  };

  const playFromCacheOrTTS = async (onFinish: () => void) => {
       if (!activeEssay) return;
       // Fallback 1: Cache
       let cachedAudio;
       try {
           cachedAudio = await getAudioFromDB(activeEssay.id);
       } catch (e) {
           console.warn("Failed to get audio from DB:", e);
       }
       
       if (cachedAudio) {
            playWav(cachedAudio, onFinish);
       } else {
            // Fallback 2: TTS
            playText(activeEssay.rawContent, onFinish);
       }
  }

  const handlePrint = () => {
      window.print();
  };

  const isTokenHidden = (token: Token) => {
    if (token.isSeparator) return false;
    
    const p = token.pos;
    if (mode === PracticeMode.READ || mode === PracticeMode.TRANSLATION) return false;
    
    // Level 1: Nouns
    if (mode === PracticeMode.LEVEL_1) {
        return p === 'noun';
    }
    
    // Level 2: Nouns + Verbs
    if (mode === PracticeMode.LEVEL_2) {
        return p === 'noun' || p === 'verb';
    }
    
    // Level 3: Nouns + Verbs + Adj + Adv
    if (mode === PracticeMode.LEVEL_3) {
        return p === 'noun' || p === 'verb' || p === 'adj' || p === 'adv';
    }

    return false;
  };

  const handleInputChange = (id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const checkAnswers = () => {
    if (!activeEssay) return;

    if (mode === PracticeMode.TRANSLATION) {
        checkTranslationAnswers();
        return;
    }
    
    let correctCount = 0;
    let totalHidden = 0;
    const newResults: VerificationResult = {};

    activeEssay.tokens.forEach(token => {
        if (isTokenHidden(token)) {
            totalHidden++;
            const userVal = (answers[token.id] || "").trim();
            const correctVal = token.text.trim();
            
            const cleanUser = normalizeText(userVal);
            const cleanCorrect = normalizeText(correctVal);

            const isCorrect = cleanUser === cleanCorrect;
            newResults[token.id] = isCorrect;
            if (isCorrect) correctCount++;
        }
    });

    setResults(newResults);
    setScore(totalHidden === 0 ? 100 : Math.round((correctCount / totalHidden) * 100));
  };

  const checkTranslationAnswers = () => {
      if (!activeEssay || !activeEssay.sentences) return;

      let correctCount = 0;
      let totalSentences = activeEssay.sentences.length;
      const newResults: VerificationResult = {};

      activeEssay.sentences.forEach(sent => {
          const userVal = (answers[sent.id] || "").trim();
          const cleanUser = normalizeText(userVal);
          const cleanCorrect = normalizeText(sent.english);
          
          const isCorrect = cleanUser === cleanCorrect;
          newResults[sent.id] = isCorrect;
          if (isCorrect) correctCount++;
      });
      
      setResults(newResults);
      setScore(totalSentences === 0 ? 100 : Math.round((correctCount / totalSentences) * 100));
  }

  // --- Render Helpers ---

  const renderToken = (token: Token) => {
    // If it's a newline, we handle it in the paragraph grouping logic, but if it slips through or is inside a paragraph for some reason:
    if (token.text.includes('\n')) return null;

    if (token.isSeparator) {
        // whitespace-pre-wrap allows spaces to wrap if they are at the end of a line
        return <span key={token.id} className="whitespace-pre-wrap text-gray-800">{token.text}</span>;
    }

    const hidden = isTokenHidden(token);

    if (hidden) {
        const isChecked = results !== null;
        const isCorrect = isChecked ? results[token.id] : undefined;
        
        let borderClass = "border-gray-300 focus:border-blue-500";
        let textClass = "text-gray-800";
        
        if (isChecked) {
            borderClass = isCorrect ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50";
            textClass = isCorrect ? "text-green-700" : "text-red-700";
        }

        // Calculate width approx based on char length, min 30px
        const width = Math.max(30, token.text.length * 11) + "px";

        return (
            <span key={token.id} className="inline-block relative group align-baseline">
                <input
                    type="text"
                    value={answers[token.id] || ''}
                    onChange={(e) => handleInputChange(token.id, e.target.value)}
                    className={`border-b-2 outline-none text-center bg-transparent transition-colors px-0.5 mx-0.5 rounded-none appearance-none ${borderClass} ${textClass}`}
                    style={{ width }}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                />
                {isChecked && !isCorrect && (
                     <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg print:hidden">
                        {token.text}
                     </span>
                )}
            </span>
        );
    }

    return <span key={token.id} className="text-gray-800">{token.text}</span>;
  };

  const renderEssayContent = () => {
    if (!activeEssay) return null;

    // Group tokens into paragraphs based on newline characters
    const paragraphs: Token[][] = [];
    let currentParagraph: Token[] = [];
    
    // Safety check for tokens
    const tokens = activeEssay.tokens || [];

    tokens.forEach(token => {
        if (token.text.includes('\n')) {
            if (currentParagraph.length > 0) {
                paragraphs.push(currentParagraph);
                currentParagraph = [];
            }
            // Ignore the newline token itself for rendering
        } else {
            currentParagraph.push(token);
        }
    });
    // Push the last paragraph if exists
    if (currentParagraph.length > 0) paragraphs.push(currentParagraph);

    return (
        <div className="space-y-6 font-serif leading-relaxed text-base md:text-lg">
            {paragraphs.map((para, idx) => (
                <p key={idx} className="indent-6 md:indent-8 text-left break-words">
                    {para.map(token => renderToken(token))}
                </p>
            ))}
        </div>
    );
  };

  const renderTranslationMode = () => {
    if (!activeEssay || !activeEssay.sentences) return null;
    
    return (
        <div className="space-y-6">
            {activeEssay.sentences.map((sent, idx) => {
                const isChecked = results !== null;
                const isCorrect = isChecked ? results[sent.id] : undefined;
                
                return (
                    <div key={sent.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm print:border-none print:shadow-none print:p-0 print:mb-8">
                         <div className="mb-2 text-gray-500 text-sm font-semibold tracking-wide uppercase">Sentence {idx + 1}</div>
                         <div className="mb-3 text-lg font-medium text-gray-900">{sent.chinese}</div>
                         <textarea 
                             className={`w-full p-3 border rounded-lg focus:ring-2 outline-none transition-all resize-none text-lg ${
                                 isChecked 
                                    ? (isCorrect ? 'border-green-300 bg-green-50 focus:ring-green-200' : 'border-red-300 bg-red-50 focus:ring-red-200')
                                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                             }`}
                             rows={2}
                             placeholder="Type the English translation..."
                             value={answers[sent.id] || ''}
                             onChange={(e) => handleInputChange(sent.id, e.target.value)}
                         />
                         {isChecked && !isCorrect && (
                             <div className="mt-2 text-green-700 bg-green-50 p-2 rounded-md border border-green-200 text-sm print:hidden">
                                 <strong>Correct:</strong> {sent.english}
                             </div>
                         )}
                    </div>
                );
            })}
        </div>
    );
  };

  const renderExplanationMode = () => {
    if (!activeEssay || !activeEssay.sentences) return null;
    
    return (
        <div className="space-y-6">
            {activeEssay.sentences.map((sent, idx) => {
                return (
                    <div key={sent.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm print:border-none print:shadow-none print:p-0 print:mb-8">
                         <div className="flex justify-between items-center mb-2">
                             <div className="text-gray-500 text-sm font-semibold tracking-wide uppercase">Sentence {idx + 1}</div>
                             <button
                                 onClick={() => playText(sent.english, () => {})}
                                 className="text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 p-1.5 rounded-full transition-colors"
                                 title="Play sentence"
                             >
                                 <PlayIcon />
                             </button>
                         </div>
                         <div className="mb-3 text-lg font-medium text-gray-900">{sent.english}</div>
                         <div className="mb-3 text-md text-gray-700">{sent.chinese}</div>
                         {sent.grammarPoints && (
                             <div className="mt-4 bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                                 <div className="text-sm font-semibold text-emerald-800 mb-1">关键语法点 / Key Grammar</div>
                                 <div className="text-sm text-emerald-700 whitespace-pre-wrap">{sent.grammarPoints}</div>
                             </div>
                         )}
                    </div>
                );
            })}
        </div>
    );
  };

  const SidebarContent = () => (
      <>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar">
            {essays.map(essay => (
                <div
                    key={essay.id}
                    onClick={() => {
                        if (window.innerWidth < 768) {
                           handleSelectEssayMobile(essay.id);
                        } else {
                           setActiveEssayId(essay.id);
                        }
                    }}
                    className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                        activeEssayId === essay.id ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                >
                    <span className="truncate pr-2">{essay.title}</span>
                    <button 
                        onClick={(e) => handleDeleteEssay(essay.id, e)}
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <TrashIcon />
                    </button>
                </div>
            ))}
        </div>

        <div className="p-4 border-t border-gray-100">
            <button
                onClick={() => {
                    setIsAddModalOpen(true);
                    setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors shadow-sm"
            >
                <PlusIcon /> New Essay
            </button>
        </div>
      </>
  );

  // --- Main Render ---

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 print:block print:h-auto print:overflow-visible">
      
      {/* Sidebar (Desktop) */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex print:hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h1 className="font-bold text-xl text-blue-600 tracking-tight">范文记忆</h1>
        </div>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative min-w-0 print:block print:h-auto print:overflow-visible">
        
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b p-4 flex justify-between items-center z-20 relative shadow-sm print:hidden">
             <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-600 hover:text-blue-600">
                 <MenuIcon />
             </button>
             <h1 className="font-bold text-lg text-blue-600">范文记忆</h1>
             <button onClick={() => setIsAddModalOpen(true)} className="text-blue-600">
                 <PlusIcon />
             </button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 md:hidden flex print:hidden">
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
                <div className="relative bg-white w-64 h-full shadow-xl flex flex-col animate-in slide-in-from-left duration-200">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h1 className="font-bold text-xl text-blue-600 tracking-tight">范文记忆</h1>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-gray-600">
                            <XIcon />
                        </button>
                    </div>
                    <SidebarContent />
                </div>
            </div>
        )}

        {/* Top Control Bar */}
        {activeEssay && (
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm z-10 print:border-none print:shadow-none print:px-0">
            <div className="flex items-center gap-3 min-w-0">
                <div className="flex-1 min-w-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">{activeEssay.title}</h2>
                    <div className="text-sm text-gray-400 mt-1 print:hidden">
                        {activeEssay.tokens.length > 0 ? `${activeEssay.tokens.filter(t=>!t.isSeparator).length} words` : 'Processing...'}
                    </div>
                </div>
                 <button 
                    onClick={handlePrint} 
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors print:hidden flex-shrink-0"
                    title="Print Essay"
                >
                    <PrinterIcon />
                </button>
            </div>

            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg self-start sm:self-auto overflow-x-auto max-w-full no-scrollbar print:hidden w-full sm:w-auto">
                <button
                    onClick={() => setMode(PracticeMode.READ)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${mode === PracticeMode.READ ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Read
                </button>
                <button
                    onClick={() => setMode(PracticeMode.LEVEL_1)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${mode === PracticeMode.LEVEL_1 ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    第一步
                </button>
                <button
                    onClick={() => setMode(PracticeMode.LEVEL_2)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${mode === PracticeMode.LEVEL_2 ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    第二步
                </button>
                <button
                    onClick={() => setMode(PracticeMode.LEVEL_3)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${mode === PracticeMode.LEVEL_3 ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    第三步
                </button>
                <div className="w-px h-4 bg-gray-300 mx-1 flex-shrink-0"></div>
                <button
                    onClick={() => setMode(PracticeMode.EXPLANATION)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${mode === PracticeMode.EXPLANATION ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    逐句讲解
                </button>
                <button
                    onClick={() => setMode(PracticeMode.TRANSLATION)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${mode === PracticeMode.TRANSLATION ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    汉译英
                </button>
            </div>
        </header>
        )}

        {/* Text Area */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-8 bg-gray-50 print:overflow-visible print:h-auto print:bg-white print:p-0 w-full">
            <div className={`max-w-3xl mx-auto min-h-[50vh] ${(mode !== PracticeMode.TRANSLATION && mode !== PracticeMode.EXPLANATION) ? 'bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-10 text-gray-800' : ''} print:max-w-none print:shadow-none print:border-none print:p-0`}>
                {activeEssay ? (
                    !activeEssay.isAnalyzed ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                           <p>Analyzing grammar structure...</p>
                        </div>
                    ) : (
                        mode === PracticeMode.TRANSLATION ? (
                            renderTranslationMode()
                        ) : mode === PracticeMode.EXPLANATION ? (
                            renderExplanationMode()
                        ) : (
                            renderEssayContent()
                        )
                    )
                ) : (
                   <div className="text-center text-gray-400 mt-20">No essay selected. Create one to start.</div>
                )}
            </div>
             {/* Spacer for bottom bar */}
             <div className="h-24 print:hidden"></div>
        </div>

        {/* Bottom Sticky Action Bar */}
        {activeEssay && activeEssay.isAnalyzed && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 px-4 pointer-events-none z-30 print:hidden">
                <div className="bg-white/90 backdrop-blur-md shadow-lg border border-gray-200 rounded-full p-2 flex items-center gap-2 sm:gap-4 pointer-events-auto pr-4 sm:pr-6 max-w-full overflow-x-auto no-scrollbar">
                    
                    {/* Audio Control */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Download / Prepare Button */}
                         <button 
                            onClick={handleExportAudio}
                            disabled={isDownloadingAudio}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-blue-100 hover:bg-blue-200 text-blue-700 ${isDownloadingAudio ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={isLocalFileReady ? "Download again" : "Generate Audio File (Required for offline use)"}
                        >
                            {isDownloadingAudio ? <LoadingSpinner /> : <DownloadIcon />}
                        </button>
                        
                        {/* Play Button */}
                        <button 
                            onClick={handlePlayAudio}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                                isPlaying 
                                    ? 'bg-blue-600 text-white' 
                                    : ((isLocalFileReady || isRemoteFileReady) ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700')
                            }`}
                            title={isLocalFileReady ? "Play (Local High-Quality File)" : isRemoteFileReady ? "Play (Remote Branch High-Quality File)" : "Play (Missing Audio File - Using Web Fallback)"}
                        >
                            {isPlaying ? <PauseIcon /> : <PlayIcon />}
                        </button>
                        
                        {/* Status Text */}
                        <div className="text-xs font-medium px-2 hidden sm:block whitespace-nowrap">
                            {isLocalFileReady ? (
                                <span className="text-green-600">Local Audio Ready</span>
                            ) : isRemoteFileReady ? (
                                <span className="text-green-600">Remote Audio Ready</span>
                            ) : (
                                <span className="text-orange-500">Missing Audio File</span>
                            )}
                        </div>
                    </div>

                    <div className="w-px h-6 bg-gray-300 flex-shrink-0"></div>

                    {/* Check Action (Only in practice modes) */}
                    {(mode !== PracticeMode.READ && mode !== PracticeMode.EXPLANATION) && (
                         <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                            {score !== null && (
                                <div className={`font-bold text-lg ${score > 80 ? 'text-green-600' : 'text-orange-500'}`}>
                                    {score}%
                                </div>
                            )}
                            <button
                                onClick={checkAnswers}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-5 py-2 rounded-full font-medium shadow-md transition-transform active:scale-95 whitespace-nowrap"
                            >
                                <CheckIcon /> <span className="hidden sm:inline">Check Answers</span><span className="sm:hidden">Check</span>
                            </button>
                         </div>
                    )}
                    
                    {mode === PracticeMode.READ && (
                        <span className="text-sm text-gray-500 font-medium px-2 whitespace-nowrap">Read Mode</span>
                    )}
                    {mode === PracticeMode.EXPLANATION && (
                        <span className="text-sm text-gray-500 font-medium px-2 whitespace-nowrap">Explanation Mode</span>
                    )}

                </div>
            </div>
        )}

        {/* Add Modal */}
        {isAddModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 print:hidden">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                    <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Essay</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="e.g. Unit 1: My School"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                                <textarea
                                    value={newContent}
                                    onChange={e => setNewContent(e.target.value)}
                                    rows={8}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                    placeholder="Paste your essay here..."
                                />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
                        <button
                            onClick={() => setIsAddModalOpen(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddEssay}
                            disabled={isProcessing || !newTitle || !newContent}
                            className={`px-4 py-2 bg-blue-600 text-white rounded-lg font-medium shadow-sm transition-all flex items-center gap-2 ${
                                (isProcessing || !newTitle || !newContent) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                            }`}
                        >
                            {isProcessing ? <><LoadingSpinner /> Processing...</> : 'Add Essay'}
                        </button>
                    </div>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}
