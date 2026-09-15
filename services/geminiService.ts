import { Token, Sentence } from "../types";
import { smartTokenize } from "../constants";

type GeminiTask = 'tokens' | 'translation' | 'audio';

const requestGemini = async (task: GeminiTask, text: string): Promise<{ text?: string; audio?: string }> => {
    const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, text })
    });
    if (!response.ok) {
        throw new Error(response.status === 503
            ? 'Gemini is not configured on EdgeOne.'
            : 'Gemini request failed.');
    }
    return response.json();
};

const base64ToUint8Array = (base64: string): Uint8Array => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
};

export const analyzeTextForMemorization = async (text: string): Promise<Token[]> => {
    const result = await requestGemini('tokens', text);
    const tokens = JSON.parse(result.text || '[]');
    if (!Array.isArray(tokens) || tokens.map((t: Token) => t.text).join('') !== text) {
        console.warn('Gemini tokens did not reconstruct the source; using local tokenizer.');
        return smartTokenize(text);
    }
    return tokens.map((token: Token, index: number) => ({
        ...token,
        id: 'token-' + index + '-' + Date.now()
    }));
};

export const analyzeTextForTranslation = async (text: string): Promise<Sentence[]> => {
    const result = await requestGemini('translation', text);
    const sentences = JSON.parse(result.text || '[]');
    if (!Array.isArray(sentences)) throw new Error('Invalid translation response.');
    return sentences.map((sentence: Sentence, index: number) => ({
        ...sentence,
        id: 'sent-' + index + '-' + Date.now()
    }));
};

export const generateSpeechForText = async (text: string): Promise<Uint8Array> => {
    const result = await requestGemini('audio', text);
    if (!result.audio) throw new Error('No audio returned from Gemini.');
    return base64ToUint8Array(result.audio);
};
