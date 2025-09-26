import fs from 'fs-extra';
import pdf from 'pdf-parse';
import natural from 'natural';

export class PaperParser {
    constructor() {
        this.tokenizer = new natural.WordTokenizer();
    }

    /**
     * Extract text content from a PDF file
     * @param {string} pdfPath - Path to the PDF file
     * @returns {Promise<Object>} Extracted content with metadata
     */
    async extractText(pdfPath) {
        try {
            const exists = await fs.pathExists(pdfPath);
            if (!exists) {
                throw new Error(`PDF file not found: ${pdfPath}`);
            }

            const dataBuffer = await fs.readFile(pdfPath);
            const data = await pdf(dataBuffer);
            
            return {
                text: data.text,
                pages: data.numpages,
                info: data.info || {},
                metadata: data.metadata || {},
                rawData: data
            };
        } catch (error) {
            throw new Error(`PDF parsing failed: ${error.message}`);
        }
    }

    /**
     * Clean and normalize extracted text
     * @param {string} text - Raw text from PDF
     * @returns {string} Cleaned text
     */
    preprocessText(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }

        return text
            // for whitespace
            .replace(/\s+/g, ' ')
            // Remove non-printable characters but keep basic punctuation
            .replace(/[^\w\s\.\,\;\:\!\?\-\(\)\[\]\{\}\"\']/g, '')
            // Remove excessive line breaks
            .replace(/\n\s*\n\s*\n/g, '\n\n')
            // Trim whitespace
            .trim();
    }

    /**
     * Extract basic metadata from PDF info
     * @param {Object} pdfInfo - PDF info object
     * @returns {Object} Structured metadata
     */
    extractMetadata(pdfInfo) {
        return {
            title: pdfInfo.Title || null,
            author: pdfInfo.Author || null,
            subject: pdfInfo.Subject || null,
            keywords: pdfInfo.Keywords || null,
            creator: pdfInfo.Creator || null,
            producer: pdfInfo.Producer || null,
            creationDate: pdfInfo.CreationDate || null,
            modificationDate: pdfInfo.ModDate || null
        };
    }

    /**
     * Split text into sentences for further processing
     * @param {string} text - Input text
     * @returns {Array<string>} Array of sentences
     */
    splitIntoSentences(text) {
        const tokenizer = new natural.SentenceTokenizer();
        return tokenizer.tokenize(text);
    }

    /**
     * Extract words and basic statistics
     * @param {string} text - Input text
     * @returns {Object} Word statistics
     */
    getTextStatistics(text) {
        const words = this.tokenizer.tokenize(text.toLowerCase());
        const sentences = this.splitIntoSentences(text);
        const wordFreq = {};
        words.forEach(word => {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        });

        const stopWords = new Set(natural.stopwords);
        const meaningfulWords = words.filter(word => 
            !stopWords.has(word) && word.length > 3
        );
        
        const meaningfulWordFreq = {};
        meaningfulWords.forEach(word => {
            meaningfulWordFreq[word] = (meaningfulWordFreq[word] || 0) + 1;
        });

        const topWords = Object.entries(meaningfulWordFreq)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 20)
            .map(([word, count]) => ({ word, count }));

        return {
            totalWords: words.length,
            uniqueWords: Object.keys(wordFreq).length,
            totalSentences: sentences.length,
            averageWordsPerSentence: Math.round(words.length / sentences.length),
            topWords,
            wordFrequency: meaningfulWordFreq
        };
    }

    /**
     * Complete PDF processing pipeline
     * @param {string} pdfPath - Path to PDF file
     * @returns {Promise<Object>} Complete analysis result
     */
    async processPDF(pdfPath) {
        try {
            const extracted = await this.extractText(pdfPath);
            const cleanText = this.preprocessText(extracted.text);
            const metadata = this.extractMetadata(extracted.info);
            const statistics = this.getTextStatistics(cleanText);

            return {
                success: true,
                metadata,
                content: {
                    raw: extracted.text,
                    cleaned: cleanText,
                    pages: extracted.pages
                },
                statistics,
                error: null
            };
        } catch (error) {
            return {
                success: false,
                metadata: null,
                content: null,
                statistics: null,
                error: error.message
            };
        }
    }
}