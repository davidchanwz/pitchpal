// TTS Service for AI Avatar Presentations
export interface TTSConfig {
  provider: 'elevenlabs' | 'azure' | 'aws' | 'openai';
  apiKey: string;
  voiceId: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
  speed?: number;
}

export interface TTSResponse {
  audioBuffer: ArrayBuffer;
  duration: number;
  mimeType: string;
}

export class TTSService {
  private config: TTSConfig;

  constructor(config: TTSConfig) {
    this.config = config;
  }

  async synthesizeSpeech(text: string, options?: Partial<TTSConfig>): Promise<TTSResponse> {
    const finalConfig = { ...this.config, ...options };

    switch (finalConfig.provider) {
      case 'elevenlabs':
        return this.synthesizeWithElevenLabs(text, finalConfig);
      case 'azure':
        return this.synthesizeWithAzure(text, finalConfig);
      case 'aws':
        return this.synthesizeWithAWS(text, finalConfig);
      case 'openai':
        return this.synthesizeWithOpenAI(text, finalConfig);
      default:
        throw new Error(`Unsupported TTS provider: ${finalConfig.provider}`);
    }
  }

  private async synthesizeWithElevenLabs(text: string, config: TTSConfig): Promise<TTSResponse> {
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${config.voiceId}`;
    
    const requestBody = {
      text,
      model_id: config.modelId || "eleven_monolingual_v1",
      voice_settings: {
        stability: config.stability || 0.5,
        similarity_boost: config.similarityBoost || 0.5,
        style: 0.0,
        use_speaker_boost: true
      }
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': config.apiKey
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
      }

      const audioBuffer = await response.arrayBuffer();
      
      // Estimate duration (rough calculation: ~150 words per minute)
      const wordCount = text.split(/\s+/).length;
      const estimatedDuration = (wordCount / 150) * 60; // seconds

      return {
        audioBuffer,
        duration: estimatedDuration,
        mimeType: 'audio/mpeg'
      };
    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      throw error;
    }
  }

  private async synthesizeWithAzure(text: string, config: TTSConfig): Promise<TTSResponse> {
    // Azure Speech Service implementation
    const endpoint = process.env.NEXT_PUBLIC_AZURE_SPEECH_ENDPOINT;
    const region = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION;

    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        <voice name="${config.voiceId}">
          <prosody rate="${config.speed || 1.0}">
            ${text}
          </prosody>
        </voice>
      </speak>
    `;

    try {
      const response = await fetch(`${endpoint}/cognitiveservices/v1`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': config.apiKey,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3'
        },
        body: ssml
      });

      if (!response.ok) {
        throw new Error(`Azure TTS error: ${response.status}`);
      }

      const audioBuffer = await response.arrayBuffer();
      const wordCount = text.split(/\s+/).length;
      const estimatedDuration = (wordCount / 150) * 60;

      return {
        audioBuffer,
        duration: estimatedDuration,
        mimeType: 'audio/mpeg'
      };
    } catch (error) {
      console.error('Azure TTS error:', error);
      throw error;
    }
  }

  private async synthesizeWithAWS(text: string, config: TTSConfig): Promise<TTSResponse> {
    // AWS Polly implementation would go here
    throw new Error('AWS Polly integration not implemented yet');
  }

  private async synthesizeWithOpenAI(text: string, config: TTSConfig): Promise<TTSResponse> {
    // OpenAI TTS implementation
    try {
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: config.modelId || 'tts-1',
          input: text,
          voice: config.voiceId,
          speed: config.speed || 1.0
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI TTS error: ${response.status}`);
      }

      const audioBuffer = await response.arrayBuffer();
      const wordCount = text.split(/\s+/).length;
      const estimatedDuration = (wordCount / 150) * 60;

      return {
        audioBuffer,
        duration: estimatedDuration,
        mimeType: 'audio/mpeg'
      };
    } catch (error) {
      console.error('OpenAI TTS error:', error);
      throw error;
    }
  }

  // Convert ArrayBuffer to playable audio URL
  static createAudioUrl(audioBuffer: ArrayBuffer, mimeType: string): string {
    const blob = new Blob([audioBuffer], { type: mimeType });
    return URL.createObjectURL(blob);
  }

  // Get available voices for the current provider
  async getAvailableVoices(): Promise<Array<{ id: string; name: string; language: string }>> {
    switch (this.config.provider) {
      case 'elevenlabs':
        return this.getElevenLabsVoices();
      case 'azure':
        return this.getAzureVoices();
      default:
        return [];
    }
  }

  private async getElevenLabsVoices() {
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': this.config.apiKey
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ElevenLabs voices');
      }

      const data = await response.json();
      return data.voices.map((voice: any) => ({
        id: voice.voice_id,
        name: voice.name,
        language: voice.labels?.language || 'en'
      }));
    } catch (error) {
      console.error('Error fetching ElevenLabs voices:', error);
      return [];
    }
  }

  private async getAzureVoices() {
    // Azure voices implementation
    return [];
  }
}
