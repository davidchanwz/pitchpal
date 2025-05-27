// Avatar Animation Service for lip-sync and expressions
export interface AvatarAnimationConfig {
  provider: 'd-id' | 'synthesia' | 'heygen';
  apiKey: string;
  avatarId: string;
  webhookUrl?: string;
}

export interface AnimationRequest {
  audioUrl: string;
  text: string;
  duration: number;
  expressions?: Array<{
    timestamp: number;
    expression: 'happy' | 'serious' | 'surprised' | 'neutral';
    intensity: number;
  }>;
}

export interface AnimationResponse {
  videoUrl?: string;
  animationData?: any;
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  estimatedCompletionTime?: number;
}

export class AvatarAnimationService {
  private config: AvatarAnimationConfig;

  constructor(config: AvatarAnimationConfig) {
    this.config = config;
  }

  async generateLipSync(request: AnimationRequest): Promise<AnimationResponse> {
    switch (this.config.provider) {
      case 'd-id':
        return this.generateWithDID(request);
      case 'synthesia':
        return this.generateWithSynthesia(request);
      case 'heygen':
        return this.generateWithHeyGen(request);
      default:
        throw new Error(`Unsupported animation provider: ${this.config.provider}`);
    }
  }

  private async generateWithDID(request: AnimationRequest): Promise<AnimationResponse> {
    try {
      // Step 1: Create talk job with D-ID
      const createResponse = await fetch('https://api.d-id.com/talks', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source_url: `https://api.d-id.com/images/${this.config.avatarId}`,
          script: {
            type: 'audio',
            audio_url: request.audioUrl,
            reduce_noise: true
          },
          config: {
            fluent: true,
            pad_audio: 0.0,
            stitch: true,
            result_format: 'mp4'
          },
          webhook: this.config.webhookUrl
        })
      });

      if (!createResponse.ok) {
        throw new Error(`D-ID API error: ${createResponse.status}`);
      }

      const createResult = await createResponse.json();
      
      return {
        jobId: createResult.id,
        status: 'queued',
        estimatedCompletionTime: request.duration * 1000 + 30000 // Add 30s processing time
      };
    } catch (error) {
      console.error('D-ID animation error:', error);
      throw error;
    }
  }

  private async generateWithSynthesia(request: AnimationRequest): Promise<AnimationResponse> {
    // Synthesia API implementation would go here
    throw new Error('Synthesia integration not implemented yet');
  }

  private async generateWithHeyGen(request: AnimationRequest): Promise<AnimationResponse> {
    // HeyGen API implementation would go here
    throw new Error('HeyGen integration not implemented yet');
  }

  async checkJobStatus(jobId: string): Promise<AnimationResponse> {
    switch (this.config.provider) {
      case 'd-id':
        return this.checkDIDJobStatus(jobId);
      default:
        throw new Error(`Status check not implemented for ${this.config.provider}`);
    }
  }

  private async checkDIDJobStatus(jobId: string): Promise<AnimationResponse> {
    try {
      const response = await fetch(`https://api.d-id.com/talks/${jobId}`, {
        headers: {
          'Authorization': `Basic ${this.config.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`D-ID status check error: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        jobId,
        status: result.status,
        videoUrl: result.result_url,
        animationData: result
      };
    } catch (error) {
      console.error('D-ID status check error:', error);
      throw error;
    }
  }

  // Real-time lip-sync for live presentations (WebRTC)
  async createRealtimeLipSync(audioStream: MediaStream): Promise<MediaStream> {
    // This would integrate with WebRTC for real-time avatar animation
    // For now, return the original stream
    return audioStream;
  }

  // Get available avatars for the current provider
  async getAvailableAvatars(): Promise<Array<{ id: string; name: string; imageUrl: string }>> {
    switch (this.config.provider) {
      case 'd-id':
        return this.getDIDAvatars();
      default:
        return [];
    }
  }

  private async getDIDAvatars() {
    try {
      const response = await fetch('https://api.d-id.com/images', {
        headers: {
          'Authorization': `Basic ${this.config.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch D-ID avatars');
      }

      const data = await response.json();
      return data.images?.map((img: any) => ({
        id: img.id,
        name: img.name || `Avatar ${img.id}`,
        imageUrl: img.url
      })) || [];
    } catch (error) {
      console.error('Error fetching D-ID avatars:', error);
      return [];
    }
  }

  // Generate expressions based on script content
  static generateExpressions(text: string, duration: number): Array<{
    timestamp: number;
    expression: 'happy' | 'serious' | 'surprised' | 'neutral';
    intensity: number;
  }> {
    const expressions = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const timePerSentence = duration / sentences.length;

    sentences.forEach((sentence, index) => {
      let expression: 'happy' | 'serious' | 'surprised' | 'neutral' = 'neutral';
      let intensity = 0.5;

      // Simple sentiment analysis for expressions
      if (sentence.includes('!') || /\b(exciting|amazing|great|excellent|fantastic)\b/i.test(sentence)) {
        expression = 'happy';
        intensity = 0.8;
      } else if (/\b(important|critical|serious|problem|issue)\b/i.test(sentence)) {
        expression = 'serious';
        intensity = 0.7;
      } else if (sentence.includes('?') || /\b(surprising|unexpected|wow)\b/i.test(sentence)) {
        expression = 'surprised';
        intensity = 0.6;
      }

      expressions.push({
        timestamp: index * timePerSentence,
        expression,
        intensity
      });
    });

    return expressions;
  }
}
