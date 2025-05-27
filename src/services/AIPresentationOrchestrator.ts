// AI Presentation Orchestrator
import { ScriptParser, ParsedScript, ScriptSegment } from './ScriptParser'
import { TTSService, TTSResponse } from './TTSService'
import { AvatarAnimationService, AnimationRequest } from './AvatarAnimationService'

export interface PresentationConfig {
  script: string
  avatar: any
  slides: any[]
  autoAdvance: boolean
  pauseBetweenSlides: number
  ttsConfig?: {
    provider: 'elevenlabs' | 'azure' | 'aws' | 'openai'
    apiKey: string
    voiceId: string
    speed?: number
    stability?: number
  }
  animationConfig?: {
    provider: 'd-id' | 'synthesia' | 'heygen'
    apiKey: string
    avatarId: string
  }
}

export interface PresentationState {
  isPlaying: boolean
  currentSegment: number
  currentSlide: number
  elapsedTime: number
  status: 'idle' | 'playing' | 'paused' | 'completed'
}

export class AIPresentationOrchestrator {
  private parsedScript: ParsedScript
  private config: PresentationConfig
  private state: PresentationState
  private ttsService: TTSService
  private animationService?: AvatarAnimationService
  private onStateChange: (state: PresentationState) => void
  private onSlideChange: (slideIndex: number) => void
  private currentAudio: HTMLAudioElement | null = null
  private segmentTimer: NodeJS.Timeout | null = null
  private animationJobs: Map<number, string> = new Map() // segment index -> job ID

  constructor(
    config: PresentationConfig,
    onStateChange: (state: PresentationState) => void,
    onSlideChange: (slideIndex: number) => void
  ) {
    this.config = config
    this.onStateChange = onStateChange
    this.onSlideChange = onSlideChange
    this.parsedScript = ScriptParser.parseScript(config.script)
    
    // Initialize TTS service
    if (config.ttsConfig) {
      this.ttsService = new TTSService({
        provider: config.ttsConfig.provider,
        apiKey: config.ttsConfig.apiKey,
        voiceId: config.ttsConfig.voiceId,
        speed: config.ttsConfig.speed,
        stability: config.ttsConfig.stability
      })
    } else {
      // Use a mock TTS service if no config provided
      this.ttsService = this.createMockTTSService()
    }

    // Initialize animation service if configured
    if (config.animationConfig) {
      this.animationService = new AvatarAnimationService({
        provider: config.animationConfig.provider,
        apiKey: config.animationConfig.apiKey,
        avatarId: config.animationConfig.avatarId
      })
    }
    
    this.state = {
      isPlaying: false,
      currentSegment: 0,
      currentSlide: 0,
      elapsedTime: 0,
      status: 'idle'
    }
  }

  private createMockTTSService(): TTSService {
    // Mock service for development/fallback
    return {
      synthesizeSpeech: async (text: string): Promise<TTSResponse> => {
        // Create a short beep sound as placeholder
        const audioContext = new AudioContext()
        const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 2, audioContext.sampleRate)
        const data = buffer.getChannelData(0)
        
        for (let i = 0; i < data.length; i++) {
          data[i] = Math.sin(2 * Math.PI * 440 * i / audioContext.sampleRate) * 0.1
        }

        // Convert to ArrayBuffer
        const arrayBuffer = new ArrayBuffer(data.length * 4)
        const view = new Float32Array(arrayBuffer)
        view.set(data)

        const wordCount = text.split(/\s+/).length
        const estimatedDuration = (wordCount / 150) * 60

        return {
          audioBuffer: arrayBuffer,
          duration: estimatedDuration,
          mimeType: 'audio/wav'
        }
      }
    } as TTSService
  }

  async startPresentation(): Promise<void> {
    this.state.status = 'playing'
    this.state.isPlaying = true
    this.onStateChange(this.state)
    
    await this.processNextSegment()
  }

  pausePresentation(): void {
    this.state.status = 'paused'
    this.state.isPlaying = false
    
    if (this.currentAudio) {
      this.currentAudio.pause()
    }
    
    if (this.segmentTimer) {
      clearTimeout(this.segmentTimer)
    }
    
    this.onStateChange(this.state)
  }

  resumePresentation(): void {
    this.state.status = 'playing'
    this.state.isPlaying = true
    
    if (this.currentAudio) {
      this.currentAudio.play()
    }
    
    this.onStateChange(this.state)
  }

  stopPresentation(): void {
    this.state.status = 'idle'
    this.state.isPlaying = false
    this.state.currentSegment = 0
    this.state.currentSlide = 0
    this.state.elapsedTime = 0
    
    this.cleanup()
    this.onStateChange(this.state)
  }

  private async processNextSegment(): Promise<void> {
    if (this.state.currentSegment >= this.parsedScript.segments.length) {
      // Presentation completed
      this.state.status = 'completed'
      this.state.isPlaying = false
      this.onStateChange(this.state)
      return
    }

    const segment = this.parsedScript.segments[this.state.currentSegment]
    
    if (segment.type === 'speech') {
      await this.processSpeechSegment(segment)
    } else if (segment.type === 'action') {
      await this.processActionSegment(segment)
    }
  }

  private async processSpeechSegment(segment: ScriptSegment): Promise<void> {
    try {
      // Generate speech audio using TTS
      const audioBuffer = await this.ttsService.synthesizeSpeech(
        segment.text,
        this.config.avatar.voiceId
      )
      
      // Convert AudioBuffer to playable audio
      const audioUrl = await this.audioBufferToUrl(audioBuffer)
      this.currentAudio = new Audio(audioUrl)
      
      // Play audio and wait for completion
      await new Promise<void>((resolve) => {
        if (!this.currentAudio) return resolve()
        
        this.currentAudio.onended = () => {
          resolve()
        }
        
        this.currentAudio.onerror = () => {
          console.error('Audio playback error')
          resolve()
        }
        
        this.currentAudio.play()
      })
      
      // Move to next segment
      this.state.currentSegment++
      this.onStateChange(this.state)
      
      if (this.state.isPlaying) {
        await this.processNextSegment()
      }
      
    } catch (error) {
      console.error('Error processing speech segment:', error)
      this.state.currentSegment++
      if (this.state.isPlaying) {
        await this.processNextSegment()
      }
    }
  }

  private async processActionSegment(segment: ScriptSegment): Promise<void> {
    if (segment.action === 'click') {
      // Advance to next slide
      this.state.currentSlide++
      this.onSlideChange(this.state.currentSlide)
      
      // Add brief pause between slides
      if (this.config.pauseBetweenSlides > 0) {
        await this.wait(this.config.pauseBetweenSlides * 1000)
      }
      
    } else if (segment.action === 'pause') {
      // Pause for specified duration
      const duration = segment.duration || 1
      await this.wait(duration * 1000)
    }
    
    // Move to next segment
    this.state.currentSegment++
    this.onStateChange(this.state)
    
    if (this.state.isPlaying) {
      await this.processNextSegment()
    }
  }

  private async audioBufferToUrl(buffer: AudioBuffer): Promise<string> {
    const audioContext = new AudioContext()
    const numberOfChannels = buffer.numberOfChannels
    const length = buffer.length * numberOfChannels * 2 + 44
    const arrayBuffer = new ArrayBuffer(length)
    const view = new DataView(arrayBuffer)
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }
    
    writeString(0, 'RIFF')
    view.setUint32(4, length - 8, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, numberOfChannels, true)
    view.setUint32(24, buffer.sampleRate, true)
    view.setUint32(28, buffer.sampleRate * numberOfChannels * 2, true)
    view.setUint16(32, numberOfChannels * 2, true)
    view.setUint16(34, 16, true)
    writeString(36, 'data')
    view.setUint32(40, length - 44, true)
    
    // Audio data
    const channelData = []
    for (let channel = 0; channel < numberOfChannels; channel++) {
      channelData.push(buffer.getChannelData(channel))
    }
    
    let offset = 44
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, channelData[channel][i]))
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true)
        offset += 2
      }
    }
    
    const blob = new Blob([arrayBuffer], { type: 'audio/wav' })
    return URL.createObjectURL(blob)
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => {
      this.segmentTimer = setTimeout(resolve, ms)
    })
  }

  private cleanup(): void {
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio = null
    }
    
    if (this.segmentTimer) {
      clearTimeout(this.segmentTimer)
      this.segmentTimer = null
    }
  }

  // Get current presentation progress
  getProgress(): { current: number; total: number; percentage: number } {
    const current = this.state.currentSegment
    const total = this.parsedScript.segments.length
    const percentage = total > 0 ? (current / total) * 100 : 0
    
    return { current, total, percentage }
  }
}
