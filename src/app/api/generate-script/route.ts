import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { slides, settings } = body;

        if (!slides || !Array.isArray(slides)) {
            return NextResponse.json(
                { error: 'Slides data is required and must be an array' },
                { status: 400 }
            );
        }

        // Create prompt based on slides and settings
        const systemPrompt = createSystemPrompt(settings);
        const userPrompt = createUserPrompt(slides, settings);

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 2000,
        });

        const script = completion.choices[0]?.message?.content;

        if (!script) {
            throw new Error('No script generated from OpenAI');
        }

        return NextResponse.json({ script });

    } catch (error) {
        console.error('Script generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate script' },
            { status: 500 }
        );
    }
}

function createSystemPrompt(settings: any) {
    const { tone, length, targetAudience } = settings;

    return `You are an expert presentation script writer. Create a natural, engaging presentation script based on the provided slides.

Guidelines:
- Tone: ${tone} (professional, casual, enthusiastic, or academic)
- Length: ${length} (concise, detailed, or comprehensive)
- Target Audience: ${targetAudience} (general, technical, executive, or sales)
- Create smooth transitions between slides
- Make it sound conversational and natural when spoken aloud
- Include engaging opening and closing statements

CRITICAL FORMATTING RULES:
- Use ONLY <CLICK> markers to indicate slide transitions
- Do NOT use any other markers, tags, or formatting symbols
- Do NOT include stage directions, presenter notes, or emphasis markers
- Do NOT use brackets, parentheses, or other special characters for instructions
- Write the script as pure spoken text with <CLICK> markers only
- Start with the opening for slide 1, then <CLICK> before each subsequent slide's content
- The script will be split by <CLICK> markers and fed to an AI avatar for speaking`;
}

function createUserPrompt(slides: any[], settings: any) {
    const slideContent = slides.map((slide, index) =>
        `Slide ${index + 1}: ${slide.title}\nContent: ${slide.content}\n${slide.notes ? `Notes: ${slide.notes}` : ''}`
    ).join('\n\n');

    return `Please create a presentation script for the following slides:

${slideContent}

IMPORTANT: Generate the script as pure spoken text with ONLY <CLICK> markers to indicate slide transitions.

Example format:
Welcome everyone to today's presentation. I'm excited to share our latest findings with you. Let's begin by looking at our market analysis.

<CLICK>

As you can see on this slide, our research shows significant growth opportunities. The data indicates a 25% increase in market demand.

<CLICK>

Moving to our next point, let's examine the competitive landscape...

Remember:
- Use ONLY <CLICK> markers for slide transitions
- No other formatting, brackets, or special markers
- Write as natural spoken language
- Include smooth transitions between slides
- The script will be split by <CLICK> and each segment will be spoken by an AI avatar

Generate a complete presentation script following this exact format.`;
}
