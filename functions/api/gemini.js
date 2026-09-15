// EdgeOne Pages Function. GEMINI_API_KEY stays in project server-side environment.
const MODEL_TEXT = 'gemini-3-flash-preview';
const MODEL_AUDIO = 'gemini-2.5-flash-preview-tts';
const JSON_HEADERS = {
  'content-type': 'application/json; charset=UTF-8',
  'cache-control': 'no-store'
};
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin)
    return json({ error: 'Cross-origin requests are not allowed.' }, 403);
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'none')
    return json({ error: 'Cross-site requests are not allowed.' }, 403);

  const apiKey = env?.GEMINI_API_KEY;
  if (!apiKey) return json({ error: 'Gemini is not configured.' }, 503);
  let input;
  try {
    input = await request.json();
  } catch {
    return json({ error: 'Invalid JSON.' }, 400);
  }
  const { task, text } = input || {};
  if (!['tokens', 'translation', 'audio'].includes(task)
      || typeof text !== 'string' || !text.trim() || text.length > 20000)
    return json({ error: 'Invalid task or text.' }, 400);

  let model = MODEL_TEXT;
  let prompt = '';
  let generationConfig;
  if (task === 'tokens') {
    prompt = 'Analyze this English text for a fill-in-the-blank exercise. Return tokens ' +
      'that perfectly reconstruct the original text, including every space, punctuation ' +
      'mark, and newline. Assign each token a part of speech: noun, verb (including ' +
      'auxiliaries), adj, adv, or other. Mark spaces, punctuation, and newlines as ' +
      'isSeparator=true. Text:\n"""' + text + '"""';
    generationConfig = {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            text: { type: 'STRING' },
            pos: { type: 'STRING', enum: ['noun', 'verb', 'adj', 'adv', 'other'] },
            isSeparator: { type: 'BOOLEAN' }
          },
          required: ['text', 'pos']
        }
      }
    };
  } else if (task === 'translation') {
    prompt = 'Split this English text into sentences. Give each sentence a natural ' +
      'Chinese translation and concise Chinese grammar points for an 8th-grade student. ' +
      'Return english, chinese, and grammarPoints for every sentence. Text:\n"""' +
      text + '"""';
    generationConfig = {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            english: { type: 'STRING' },
            chinese: { type: 'STRING' },
            grammarPoints: { type: 'STRING' }
          },
          required: ['english', 'chinese', 'grammarPoints']
        }
      }
    };
  } else {
    model = MODEL_AUDIO;
    prompt = text;
    generationConfig = {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
      }
    };
  }

  try {
    const upstream = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/' +
      model + ':generateContent',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig
        })
      }
    );
    if (!upstream.ok) return json({ error: 'Gemini request failed.' }, 502);
    const data = await upstream.json();
    const part = data.candidates?.[0]?.content?.parts?.[0];
    if (task === 'audio')
      return part?.inlineData?.data
        ? json({ audio: part.inlineData.data })
        : json({ error: 'No audio returned.' }, 502);
    return typeof part?.text === 'string'
      ? json({ text: part.text })
      : json({ error: 'No text returned.' }, 502);
  } catch (error) {
    console.error('Gemini proxy failed:', error);
    return json({ error: 'Gemini request failed.' }, 502);
  }
}
