import fs from "fs-extra";
import natural from "natural";
import path from "path";
import { execa } from "execa";

export class PaperParser {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
  }

  /**
   * Extract text content from a PDF file using pdftotext
   * @param {string} pdfPath - Path to the PDF file
   * @returns {Promise<Object>} Extracted content with metadata
   */
  async extractText(pdfPath) {
    try {
      const exists = await fs.pathExists(pdfPath);
      if (!exists) {
        throw new Error(`PDF file not found: ${pdfPath}`);
      }

      console.log(`Reading PDF from: ${pdfPath}`);
      const text = await this.extractTextWithPdftotext(pdfPath);
      const pages = await this.getPdfPageCount(pdfPath);
      console.log(`PDF processed: ${pages} pages, ${text.length} characters`);

      return {
        text: text,
        pages: pages,
        info: { Title: this.extractTitleFromPath(pdfPath) },
        metadata: {},
        rawData: { text, pages },
      };
    } catch (error) {
      throw new Error(`PDF parsing failed: ${error.message}`);
    }
  }

  /**
   * Extract text using pdftotext command
   * @param {string} pdfPath - Path to PDF file
   * @returns {Promise<string>} Extracted text
   */
  async extractTextWithPdftotext(pdfPath) {
    try {
      const { stdout } = await execa("pdftotext", [pdfPath, "-"], {
        encoding: "utf8",
        maxBuffer: 50 * 1024 * 1024, 
      });
      return stdout;
    } catch (error) {
      throw new Error(`pdftotext extraction failed: ${error.message}`);
    }
  }

  /**
   * Get page count from PDF
   * @param {string} pdfPath - Path to PDF file
   * @returns {Promise<number>} Number of pages
   */
  async getPdfPageCount(pdfPath) {
    try {
      const { stdout } = await execa("pdfinfo", [pdfPath]);
      const match = stdout.match(/Pages:\s+(\d+)/);
      return match ? parseInt(match[1], 10) : 1;
    } catch (error) {
      console.warn("Could not get page count, defaulting to 1");
      return 1;
    }
  }

  /**
   * Extract a reasonable title from the PDF file path
   * @param {string} pdfPath - Path to PDF file
   * @returns {string} Extracted title
   */
  extractTitleFromPath(pdfPath) {
    const filename = path.basename(pdfPath, ".pdf");
    
    // Clean up common filename patterns
    let cleanTitle = filename
      .replace(/^\d+\.\d+\.\d+v?\d*/, "") // Remove arxiv numbers like "1706.03762v7"
      .replace(/^arxiv[-_]?\d+/i, "") // Remove "arxiv" prefix
      .replace(/[-_]+/g, " ") // Replace hyphens and underscores with spaces
      .replace(/\s+/g, " ") // Normalize multiple spaces
      .replace(/^\s*[-_\s]+/, "") // Remove leading separators
      .replace(/[-_\s]+\s*$/, "") // Remove trailing separators
      .trim();

    // Capitalize first letter of each word
    if (cleanTitle) {
      cleanTitle = cleanTitle
        .toLowerCase()
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      
      return cleanTitle;
    }

    return "Untitled Paper";
  }

  /**
   * Clean and normalize extracted text
   * @param {string} text - Raw text from PDF
   * @returns {string} Cleaned text
   */
  preprocessText(text) {
    if (!text || typeof text !== "string") {
      return "";
    }

    return (
      text
        .replace(/\s+/g, " ")
        .replace(/[^\w\s\.\,\;\:\!\?\-\(\)\[\]\{\}\"\']/g, "")
        .replace(/\n\s*\n\s*\n/g, "\n\n")
        .trim()
    );
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
      modificationDate: pdfInfo.ModDate || null,
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
    words.forEach((word) => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    const stopWords = new Set(natural.stopwords);
    const meaningfulWords = words.filter(
      (word) => !stopWords.has(word) && word.length > 3
    );

    const meaningfulWordFreq = {};
    meaningfulWords.forEach((word) => {
      meaningfulWordFreq[word] = (meaningfulWordFreq[word] || 0) + 1;
    });

    const topWords = Object.entries(meaningfulWordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([word, count]) => ({ word, count }));

    return {
      totalWords: words.length,
      uniqueWords: Object.keys(wordFreq).length,
      totalSentences: sentences.length,
      averageWordsPerSentence: Math.round(words.length / sentences.length),
      topWords,
      wordFrequency: meaningfulWordFreq,
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
          pages: extracted.pages,
        },
        statistics,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        metadata: null,
        content: null,
        statistics: null,
        error: error.message,
      };
    }
  }
}