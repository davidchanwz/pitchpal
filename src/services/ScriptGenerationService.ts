import { UploadService } from './UploadService';

export interface ExtractedSlide {
    id: number;
    title: string;
    content: string;
    notes?: string;
    thumbnail?: string;
    extractedText?: string;
    images?: string[];
}

export interface ScriptGenerationSettings {
    tone: 'professional' | 'casual' | 'enthusiastic' | 'academic';
    length: 'concise' | 'detailed' | 'comprehensive';
    focusAreas: string[];
    targetAudience: 'general' | 'technical' | 'executive' | 'sales';
}

export interface ScriptGenerationRequest {
    slides: ExtractedSlide[];
    settings: ScriptGenerationSettings;
    slideId?: string; // Optional slide ID to save the script
}

export interface ScriptGenerationResponse {
    script: string;
    error?: string;
    saved?: boolean; // Indicates if script was saved to database
}

export class ScriptGenerationService {
    static async generateScript(
        slides: ExtractedSlide[],
        settings: ScriptGenerationSettings,
        slideId?: string
    ): Promise<ScriptGenerationResponse> {
        try {
            const response = await fetch('/api/generate-script', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    slides,
                    settings,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate script');
            }

            const data = await response.json();
            const script = data.script;

            // Save script to database if slideId is provided
            let saved = false;
            if (slideId && script) {
                console.log('💾 [ScriptGenerationService.generateScript] Attempting to save script to database...');
                console.log('💾 [ScriptGenerationService.generateScript] slideId:', slideId);
                console.log('💾 [ScriptGenerationService.generateScript] script length:', script.length);

                const saveResult = await UploadService.saveScript(slideId, script);
                saved = saveResult.success;

                if (saved) {
                    console.log('✅ [ScriptGenerationService.generateScript] Script saved successfully!');
                } else {
                    console.error('❌ [ScriptGenerationService.generateScript] Failed to save script:', saveResult.error);
                }
            } else {
                console.warn('⚠️ [ScriptGenerationService.generateScript] Skipping script save - missing slideId or script');
                console.log('⚠️ [ScriptGenerationService.generateScript] slideId:', slideId);
                console.log('⚠️ [ScriptGenerationService.generateScript] script length:', script?.length || 0);
            }

            return { script, saved };

        } catch (error) {
            console.error('Script generation service error:', error);
            return {
                script: '',
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                saved: false
            };
        }
    }

    static async streamScript(
        slides: ExtractedSlide[],
        settings: ScriptGenerationSettings,
        onProgress?: (chunk: string) => void,
        slideId?: string
    ): Promise<ScriptGenerationResponse> {
        try {
            const response = await fetch('/api/generate-script/stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    slides,
                    settings,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate script');
            }

            if (!response.body) {
                throw new Error('No response body received');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let script = '';

            while (true) {
                const { done, value } = await reader.read();

                if (done) break;

                const chunk = decoder.decode(value);
                script += chunk;
                onProgress?.(chunk);
            }

            // Save script to database if slideId is provided
            let saved = false;
            if (slideId && script) {
                console.log('💾 [ScriptGenerationService.streamScript] Attempting to save script to database...');
                console.log('💾 [ScriptGenerationService.streamScript] slideId:', slideId);
                console.log('💾 [ScriptGenerationService.streamScript] script length:', script.length);

                const saveResult = await UploadService.saveScript(slideId, script);
                saved = saveResult.success;

                if (saved) {
                    console.log('✅ [ScriptGenerationService.streamScript] Script saved successfully!');
                } else {
                    console.error('❌ [ScriptGenerationService.streamScript] Failed to save script:', saveResult.error);
                }
            } else {
                console.warn('⚠️ [ScriptGenerationService.streamScript] Skipping script save - missing slideId or script');
                console.log('⚠️ [ScriptGenerationService.streamScript] slideId:', slideId);
                console.log('⚠️ [ScriptGenerationService.streamScript] script length:', script?.length || 0);
            }

            return { script, saved };

        } catch (error) {
            console.error('Script streaming service error:', error);
            return {
                script: '',
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                saved: false
            };
        }
    }

    static estimateDuration(script: string): string {
        const words = script.split(/\s+/).filter(word => word.length > 0).length;
        const minutes = Math.ceil(words / 150); // Average 150 words per minute
        return `${minutes} min${minutes !== 1 ? 's' : ''}`;
    }

    static getWordCount(script: string): number {
        return script.split(/\s+/).filter(word => word.length > 0).length;
    }

    static async getSavedScript(slideId: string): Promise<{ script?: string; error?: string }> {
        try {
            const result = await UploadService.getScript(slideId);
            if (result.success) {
                return { script: result.script };
            } else {
                return { error: result.error };
            }
        } catch (error) {
            console.error('Get saved script error:', error);
            return { error: 'Failed to retrieve saved script' };
        }
    }
}
