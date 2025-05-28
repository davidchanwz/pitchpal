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
- Include natural pauses and emphasis points
- Make it sound conversational, not robotic
- Include engaging opening and closing statements
- Add presenter notes for emphasis, timing, and delivery

Format the script with clear slide markers <CLICK> and natural speaking flow.`;
}

function createUserPrompt(slides: any[], settings: any) {
    const slideContent = slides.map((slide, index) =>
        `Slide ${index + 1}: ${slide.title}\nContent: ${slide.content}\n${slide.notes ? `Notes: ${slide.notes}` : ''}`
    ).join('\n\n');

    return `Please create a presentation script for the following slides:

${slideContent}

Additional preferences:
- Focus on key insights and takeaways
- Include natural transitions between topics
- Make it engaging for the target audience
- Ensure the script flows naturally when spoken aloud

Please generate a complete presentation script that a presenter can follow.`;
}
