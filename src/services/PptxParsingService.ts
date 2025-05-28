import JSZip from 'jszip';

export interface ParsedSlide {
    id: number;
    title: string;
    content: string;
    notes?: string;
    extractedText?: string;
    images?: string[];
    thumbnail?: string;
}

export class PptxParsingService {
    /**
     * Parse a PPTX file and extract slide content
     */
    static async parsePptxFile(file: File): Promise<ParsedSlide[]> {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const zip = await JSZip.loadAsync(arrayBuffer);

            const slides: ParsedSlide[] = [];
            const slideFiles: { [key: string]: JSZip.JSZipObject } = {};
            const slideRelFiles: { [key: string]: JSZip.JSZipObject } = {};
            const notesFiles: { [key: string]: JSZip.JSZipObject } = {};

            // Find all slide files
            zip.forEach((relativePath, file) => {
                if (relativePath.startsWith('ppt/slides/slide') && relativePath.endsWith('.xml')) {
                    const slideNumber = this.extractSlideNumber(relativePath);
                    if (slideNumber) {
                        slideFiles[slideNumber] = file;
                    }
                }

                // Find slide relationship files
                if (relativePath.startsWith('ppt/slides/_rels/slide') && relativePath.endsWith('.xml.rels')) {
                    const slideNumber = this.extractSlideNumber(relativePath);
                    if (slideNumber) {
                        slideRelFiles[slideNumber] = file;
                    }
                }

                // Find notes files
                if (relativePath.startsWith('ppt/notesSlides/notesSlide') && relativePath.endsWith('.xml')) {
                    const slideNumber = this.extractSlideNumber(relativePath);
                    if (slideNumber) {
                        notesFiles[slideNumber] = file;
                    }
                }
            });

            // Process each slide
            const slideNumbers = Object.keys(slideFiles).sort((a, b) => parseInt(a) - parseInt(b));
            console.log(`Found ${slideNumbers.length} slides to process:`, slideNumbers);

            for (const slideNumber of slideNumbers) {
                const slideFile = slideFiles[slideNumber];
                const notesFile = notesFiles[slideNumber];

                try {
                    const slideXml = await slideFile.async('text');
                    const slideContent = await this.extractSlideContent(slideXml);

                    let notes = '';
                    if (notesFile) {
                        const notesXml = await notesFile.async('text');
                        notes = await this.extractNotesContent(notesXml);
                    }

                    slides.push({
                        id: parseInt(slideNumber),
                        title: slideContent.title || `Slide ${slideNumber}`,
                        content: slideContent.content,
                        notes: notes || undefined,
                        extractedText: slideContent.fullText,
                        images: [], // TODO: Extract image references
                        thumbnail: `/api/placeholder/200/150?text=Slide${slideNumber}`
                    });
                } catch (error) {
                    console.error(`Error processing slide ${slideNumber}:`, error);
                    // Add a fallback slide with some helpful information
                    slides.push({
                        id: parseInt(slideNumber),
                        title: `Slide ${slideNumber} (Parsing Error)`,
                        content: 'This slide contains content that could not be automatically extracted. It may contain complex formatting, images, or special elements.',
                        notes: undefined,
                        extractedText: '',
                        images: [],
                        thumbnail: `/api/placeholder/200/150?text=Slide${slideNumber}&bg=orange`
                    });
                }
            }

            return slides;
        } catch (error) {
            console.error('Error parsing PPTX file:', error);
            throw new Error('Failed to parse PPTX file. Please ensure it is a valid PowerPoint presentation.');
        }
    }

    /**
     * Extract slide number from file path
     */
    private static extractSlideNumber(path: string): string | null {
        const match = path.match(/slide(\d+)/);
        return match ? match[1] : null;
    }

    /**
     * Extract content from slide XML
     */
    private static async extractSlideContent(xml: string): Promise<{ title: string; content: string; fullText: string }> {
        try {
            // Parse XML and extract text content
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xml, 'text/xml');

            // Extract all text content from different possible namespaces
            const textSelectors = [
                'a\\:t',  // Drawing namespace
                't',      // Simple text
                'a\\:pPr', // Paragraph properties
                'p\\:txBody', // Text body
                'a\\:p'   // Paragraph
            ];

            const allText: string[] = [];
            const paragraphs: string[] = [];
            let title = '';

            // Try multiple selectors to extract text
            textSelectors.forEach(selector => {
                try {
                    const elements = xmlDoc.querySelectorAll(selector);
                    elements.forEach(element => {
                        const text = this.extractTextFromElement(element);
                        if (text) {
                            allText.push(text);
                        }
                    });
                } catch (e) {
                    // Continue if selector fails
                }
            });

            // Alternative: Extract text from text runs
            const textRuns = xmlDoc.querySelectorAll('a\\:r, r');
            textRuns.forEach(run => {
                const textNode = run.querySelector('a\\:t, t');
                if (textNode?.textContent) {
                    const text = textNode.textContent.trim();
                    if (text) {
                        allText.push(text);
                    }
                }
            });

            // Remove duplicates and filter meaningful text
            const uniqueTextSet = new Set(allText);
            const uniqueText = Array.from(uniqueTextSet)
                .filter(text => text.length > 1)
                .filter(text => !text.match(/^[\s\n\r\t]*$/));

            // Determine title and content
            if (uniqueText.length > 0) {
                // First substantial text as title
                const potentialTitle = uniqueText.find(text => text.length > 3 && text.length < 100);
                title = potentialTitle || uniqueText[0];

                // Rest as content, excluding the title
                const contentTexts = uniqueText.filter(text => text !== title);
                paragraphs.push(...contentTexts);
            }

            const content = paragraphs.join('. ').replace(/\.\./g, '.');
            const fullText = uniqueText.join(' ');

            console.log(`Extracted slide content - Title: "${title}", Content length: ${content.length}`);

            return {
                title: title || 'Untitled Slide',
                content: content || 'No content extracted from this slide.',
                fullText: fullText || ''
            };
        } catch (error) {
            console.error('Error extracting slide content:', error);
            return {
                title: 'Untitled Slide',
                content: 'Unable to extract content from this slide.',
                fullText: ''
            };
        }
    }

    /**
     * Extract text content from XML element recursively
     */
    private static extractTextFromElement(element: Element): string {
        let text = '';

        // Get direct text content
        if (element.textContent) {
            text += element.textContent.trim();
        }

        // Look for text in child elements
        const textElements = element.querySelectorAll('a\\:t, t');
        textElements.forEach(textEl => {
            const content = textEl.textContent?.trim();
            if (content && !text.includes(content)) {
                text += (text ? ' ' : '') + content;
            }
        });

        return text.trim();
    }

    /**
     * Extract notes content from notes XML
     */
    private static async extractNotesContent(xml: string): Promise<string> {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xml, 'text/xml');

            // Extract text from notes using multiple selectors
            const textSelectors = ['a\\:t', 't', 'a\\:r'];
            const notesText: string[] = [];

            textSelectors.forEach(selector => {
                try {
                    const elements = xmlDoc.querySelectorAll(selector);
                    elements.forEach((element) => {
                        const text = element.textContent?.trim();
                        if (text && text.length > 1 && !notesText.includes(text)) {
                            notesText.push(text);
                        }
                    });
                } catch (e) {
                    // Continue if selector fails
                }
            });

            const result = notesText.join(' ').trim();
            console.log(`Extracted notes content: "${result.substring(0, 100)}..."`);

            return result;
        } catch (error) {
            console.error('Error extracting notes content:', error);
            return '';
        }
    }

    /**
     * Validate if file is a valid PPTX file
     */
    static isValidPptxFile(file: File): boolean {
        const validExtensions = ['.pptx', '.ppt'];
        const validMimeTypes = [
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.ms-powerpoint'
        ];

        const hasValidExtension = validExtensions.some(ext =>
            file.name.toLowerCase().endsWith(ext)
        );

        const hasValidMimeType = validMimeTypes.includes(file.type);

        return hasValidExtension || hasValidMimeType;
    }
}
