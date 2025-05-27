// Script Parser for AI Presentation
export interface ScriptSegment {
  id: string
  text: string
  type: 'speech' | 'action'
  action?: 'click' | 'pause' | 'highlight'
  duration?: number
}

export interface ParsedScript {
  segments: ScriptSegment[]
  totalDuration: number
  slideCount: number
}

export class ScriptParser {
  // Parse script with delimiters like <CLICK>, <PAUSE:3>, etc.
  static parseScript(script: string): ParsedScript {
    const segments: ScriptSegment[] = []
    let slideCount = 0
    
    // Split by action delimiters
    const parts = script.split(/(<[^>]+>)/g)
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim()
      if (!part) continue
      
      if (part.startsWith('<') && part.endsWith('>')) {
        // Action command
        const command = part.slice(1, -1).toLowerCase()
        
        if (command === 'click') {
          segments.push({
            id: `action-${segments.length}`,
            text: '',
            type: 'action',
            action: 'click'
          })
          slideCount++
        } else if (command.startsWith('pause:')) {
          const duration = parseInt(command.split(':')[1]) || 1
          segments.push({
            id: `action-${segments.length}`,
            text: '',
            type: 'action',
            action: 'pause',
            duration
          })
        }
      } else {
        // Speech content
        if (part.length > 0) {
          segments.push({
            id: `speech-${segments.length}`,
            text: part,
            type: 'speech'
          })
        }
      }
    }
    
    // Estimate total duration (average 150 words per minute)
    const totalWords = segments
      .filter(s => s.type === 'speech')
      .reduce((acc, s) => acc + s.text.split(' ').length, 0)
    
    const totalDuration = Math.ceil(totalWords / 150 * 60) // seconds
    
    return {
      segments,
      totalDuration,
      slideCount
    }
  }
  
  // Generate script with click commands
  static generateScriptWithClicks(slides: any[]): string {
    let script = "Welcome to today's presentation! Let me walk you through our key insights.\n\n"
    
    slides.forEach((slide, index) => {
      script += `On this slide, we can see ${slide.title}. ${slide.content}\n\n`
      
      if (index < slides.length - 1) {
        script += `<CLICK>\n\n`
        script += "Now let's move to our next point.\n\n"
      }
    })
    
    script += "Thank you for your attention. I'm happy to answer any questions you may have."
    
    return script
  }
}
