import natural from "natural";
import compromise from "compromise";

export class PaperAnalyzer {
  constructor() {
    this.sectionHeaders = [
      "abstract",
      "introduction",
      "methodology",
      "algorithm",
      "method",
      "implementation",
      "approach",
      "results",
      "conclusion",
      "references",
      "related work",
      "background",
      "literature review",
      "evaluation",
      "experiment",
      "discussion",
      "future work",
      "analysis",
    ];

    this.algorithmKeywords = [
      "algorithm",
      "procedure",
      "function",
      "method",
      "approach",
      "technique",
      "strategy",
      "process",
      "step",
      "iteration",
      "recursive",
      "iterative",
      "sort",
      "search",
      "optimize",
      "compute",
      "calculate",
      "traverse",
      "insert",
      "delete",
      "update",
      "merge",
      "split",
      "partition",
      "heap",
      "tree",
      "graph",
      "array",
      "list",
      "queue",
      "stack",
      "hash",
    ];

    this.codeIndicators = [
      "pseudocode",
      "code",
      "implementation",
      "function",
      "variable",
      "input",
      "output",
      "return",
      "while",
      "for",
      "if",
      "else",
      "begin",
      "end",
      "do",
      "repeat",
      "until",
      "loop",
    ];

    this.mathematicalKeywords = [
      "theorem",
      "proof",
      "lemma",
      "proposition",
      "corollary",
      "equation",
      "formula",
      "complexity",
      "time",
      "space",
      "O(",
      "big-o",
      "theta",
      "omega",
      "logarithmic",
      "polynomial",
      "exponential",
      "linear",
      "quadratic",
      "cubic",
    ];
  }

  /**
   * Identify and extract sections from paper text
   * @param {string} text - Full paper text
   * @returns {Object} Sections mapped by header
   */
  identifySections(text) {
    const sections = {};
    const lines = text.split("\n");
    let currentSection = "unknown";
    let content = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lowerLine = line.toLowerCase();
      if (!line) continue;
      const matchedSection = this.sectionHeaders.find((header) => {
        return (
          (lowerLine === header ||
            lowerLine.startsWith(header) ||
            lowerLine.includes(header)) &&
          line.length < 100 &&
          this.isLikelyHeader(line)
        );
      });

      if (matchedSection) {
        if (content.length > 0) {
          sections[currentSection] = content.join("\n").trim();
        }

        currentSection = matchedSection;
        content = [];
      } else {
        content.push(line);
      }
    }

    if (content.length > 0) {
      sections[currentSection] = content.join("\n").trim();
    }

    return sections;
  }

  /**
   * Check if a line is likely a section header
   * @param {string} line - Line to check
   * @returns {boolean} True if likely a header
   */
  isLikelyHeader(line) {

    const isAllCaps = line === line.toUpperCase() && line.length > 2;
    const isTitleCase = line.charAt(0) === line.charAt(0).toUpperCase();
    const isShort = line.length < 100;
    const hasNoEndPeriod = !line.endsWith(".");
    const hasNumber = /^\d+\.?\s/.test(line);

    return (
      (isAllCaps || (isTitleCase && hasNumber)) && isShort && hasNoEndPeriod
    );
  }

  /**
   * Extract algorithm blocks from text
   * @param {string} text - Input text
   * @returns {Array<Object>} Algorithm blocks with metadata
   */
  extractAlgorithmBlocks(text) {
    const blocks = [];
    const sentences = new natural.SentenceTokenizer().tokenize(text);
    const paragraphs = text.split("\n\n");

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const confidence = this.calculateAlgorithmConfidence(sentence);

      if (confidence > 0.3) {
        const start = Math.max(0, i - 2);
        const end = Math.min(sentences.length, i + 5);
        const context = sentences.slice(start, end).join(" ");

        blocks.push({
          type: "algorithm",
          content: context.trim(),
          originalSentence: sentence,
          position: i,
          confidence,
          keywords: this.extractRelevantKeywords(sentence),
        });
      }
    }

    paragraphs.forEach((paragraph, index) => {
      const codeConfidence = this.calculateCodeConfidence(paragraph);
      if (codeConfidence > 0.4) {
        blocks.push({
          type: "pseudocode",
          content: paragraph.trim(),
          position: index,
          confidence: codeConfidence,
          keywords: this.extractRelevantKeywords(paragraph),
        });
      }
    });

    return blocks
      .filter((block) => block.confidence > 0.3)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10);
  }

  /**
   * Calculate confidence that text contains algorithm description
   * @param {string} text - Text to analyze
   * @returns {number} Confidence score (0-1)
   */
  calculateAlgorithmConfidence(text) {
    const lowerText = text.toLowerCase();
    const doc = compromise(text);
    let score = 0;
    const algorithmMatches = this.algorithmKeywords.filter((keyword) =>
      lowerText.includes(keyword)
    ).length;
    score += algorithmMatches * 0.2;

    const codeMatches = this.codeIndicators.filter((keyword) =>
      lowerText.includes(keyword)
    ).length;
    score += codeMatches * 0.15;

    const mathMatches = this.mathematicalKeywords.filter((keyword) =>
      lowerText.includes(keyword)
    ).length;
    score += mathMatches * 0.1;

    const proceduralTerms = ["first", "then", "next", "finally", "step"];
    const proceduralMatches = proceduralTerms.filter((term) =>
      lowerText.includes(term)
    ).length;
    score += proceduralMatches * 0.1;

    if (/\d+[\.\)]\s/.test(text)) {
      score += 0.2;
    }

    if (/\w+\([^)]*\)/.test(text)) {
      score += 0.15;
    }

    return Math.min(1.0, score);
  }

  /**
   * Calculate confidence that text contains pseudocode
   * @param {string} text - Text to analyze
   * @returns {number} Confidence score (0-1)
   */
  calculateCodeConfidence(text) {
    const lowerText = text.toLowerCase();
    let score = 0;

    const lines = text.split("\n");
    const indentedLines = lines.filter((line) => line.match(/^\s{2,}/)).length;
    if (indentedLines > lines.length * 0.3) {
      score += 0.3;
    }

    const controlFlow = ["if", "else", "while", "for", "do", "repeat", "until"];
    const controlMatches = controlFlow.filter((keyword) =>
      lowerText.includes(keyword)
    ).length;
    score += controlMatches * 0.15;

    if (text.includes(":=") || text.includes("=") || text.includes("←")) {
      score += 0.2;
    }

    if (/\w+\([^)]*\)/.test(text) || /\w+\[\w+\]/.test(text)) {
      score += 0.2;
    }

    if (lowerText.includes("begin") && lowerText.includes("end")) {
      score += 0.3;
    }

    return Math.min(1.0, score);
  }

  /**
   * Extract relevant keywords from text
   * @param {string} text - Input text
   * @returns {Array<string>} Relevant keywords
   */
  extractRelevantKeywords(text) {
    const lowerText = text.toLowerCase();
    const relevantKeywords = [];

    this.algorithmKeywords.forEach((keyword) => {
      if (lowerText.includes(keyword)) {
        relevantKeywords.push(keyword);
      }
    });

    this.codeIndicators.forEach((keyword) => {
      if (lowerText.includes(keyword)) {
        relevantKeywords.push(keyword);
      }
    });

    this.mathematicalKeywords.forEach((keyword) => {
      if (lowerText.includes(keyword)) {
        relevantKeywords.push(keyword);
      }
    });

    return [...new Set(relevantKeywords)]; 
  }

  /**
   * Analyze paper structure and extract key information
   * @param {string} text - Full paper text
   * @returns {Object} Complete analysis result
   */
  analyzeStructure(text) {
    const sections = this.identifySections(text);
    const algorithmBlocks = this.extractAlgorithmBlocks(text);
    const lines = text.split("\n").filter((line) => line.trim().length > 0);

    let potentialTitle = this.extractPaperTitle(lines);

    const algorithmSection = Object.keys(sections).find(
      (key) =>
        key.includes("algorithm") ||
        key.includes("method") ||
        key.includes("approach")
    );

    const metrics = {
      totalSections: Object.keys(sections).length,
      algorithmBlocks: algorithmBlocks.length,
      hasAbstract: !!sections.abstract,
      hasConclusion: !!(sections.conclusion || sections.discussion),
      mainAlgorithmSection: algorithmSection || "unknown",
      avgConfidence:
        algorithmBlocks.length > 0
          ? algorithmBlocks.reduce((sum, block) => sum + block.confidence, 0) /
            algorithmBlocks.length
          : 0,
    };

    return {
      title: potentialTitle || "Unknown Paper",
      sections,
      algorithmBlocks,
      metrics,
      keywords: this.extractPaperKeywords(text),
      classification: this.classifyPaper(sections, algorithmBlocks),
    };
  }

  /**
   * Enhanced title extraction with multiple strategies
   * @param {Array<string>} lines - Text lines from the paper
   * @returns {string|null} Extracted title
   */
  extractPaperTitle(lines) {
    // Strategy 1: Look for title patterns in first 50 lines
    for (let i = 0; i < Math.min(50, lines.length); i++) {
      const line = lines[i].trim();

      // Skip obviously non-title lines
      if (
        line.includes("Provided proper attribution") ||
        line.includes("Google hereby grants") ||
        line.includes("arXiv:") ||
        line.includes("@") ||
        line.includes(".com") ||
        line.includes("University") ||
        line.includes("Department") ||
        line.includes("∗") ||
        line.includes("†") ||
        line.length < 8 ||
        line.length > 150 ||
        /^\d+$/.test(line) ||
        line.toLowerCase().includes("abstract") ||
        line.toLowerCase().includes("introduction") ||
        line.toLowerCase().includes("copyright") ||
        line.toLowerCase().includes("license") ||
        line.toLowerCase().includes("permission")
      ) {
        continue;
      }

      // Look for title-like patterns
      if (
        line.length > 8 &&
        line.length < 150 &&
        !this.sectionHeaders.some((header) =>
          line.toLowerCase().includes(header)
        ) &&
        !line.includes("Google") &&
        !line.includes("Brain") &&
        !line.includes("Research") &&
        !/^[A-Z][a-z]+ [A-Z][a-z]+$/.test(line) && // Not "John Smith" pattern
        line !== line.toUpperCase() && // Not all uppercase
        line.split(" ").length > 2 && // At least 3 words
        line.split(" ").length < 20 && // Not too many words
        !line.match(/^\d+[\.\)]\s/) && // Not numbered list
        !line.includes("Figure") &&
        !line.includes("Table") &&
        !line.includes("Equation")
      ) {
        // Clean up the title
        let cleanTitle = line
          .replace(/^\d+\.?\s*/, "") // Remove leading numbers
          .replace(/[{}[\]]/g, "") // Remove brackets
          .replace(/\s+/g, " ") // Normalize spaces
          .replace(/^[^\w]*/, "") // Remove leading non-word chars
          .replace(/[^\w]*$/, "") // Remove trailing non-word chars
          .trim();

        if (cleanTitle.length > 10 && cleanTitle.split(" ").length >= 3) {
          return cleanTitle;
        }
      }
    }

    // Strategy 2: Look for the first substantial multi-word line after skipping headers
    for (let i = 5; i < Math.min(30, lines.length); i++) {
      const line = lines[i].trim();
      
      if (
        line.length > 15 &&
        line.length < 120 &&
        line.split(" ").length >= 4 &&
        line.split(" ").length <= 15 &&
        !line.includes("@") &&
        !line.includes(".com") &&
        !line.includes("arXiv") &&
        !line.toLowerCase().includes("abstract") &&
        !line.toLowerCase().includes("introduction") &&
        !/^\d/.test(line) &&
        !line.includes("Figure") &&
        !line.includes("Table")
      ) {
        const cleanTitle = line
          .replace(/[{}[\]]/g, "")
          .replace(/\s+/g, " ")
          .trim();
        
        return cleanTitle;
      }
    }

    // Strategy 3: Use filename-based extraction as fallback
    return null;
  }

  /**
   * Extract key terms from the entire paper
   * @param {string} text - Full paper text
   * @returns {Array<string>} Key terms
   */
  extractPaperKeywords(text) {
    const doc = compromise(text);

    const nouns = doc.nouns().out("array");
    const nounFreq = {};

    nouns.forEach((noun) => {
      const clean = noun.toLowerCase();
      if (clean.length > 3) {
        nounFreq[clean] = (nounFreq[clean] || 0) + 1;
      }
    });

    const topNouns = Object.entries(nounFreq)
      .filter(([word, count]) => count > 2)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([word]) => word);

    return topNouns;
  }

  /**
   * Classify the paper type based on content
   * @param {Object} sections - Paper sections
   * @param {Array} algorithmBlocks - Algorithm blocks
   * @returns {Object} Classification result
   */
  classifyPaper(sections, algorithmBlocks) {
    const allText = Object.values(sections).join(" ").toLowerCase();

    const classifications = {
      algorithm: ["sort", "search", "tree", "graph", "optimization"],
      "data-structure": ["array", "list", "heap", "hash", "tree", "graph"],
      "machine-learning": [
        "neural",
        "learning",
        "training",
        "model",
        "classification",
      ],
      theoretical: ["proof", "theorem", "complexity", "analysis", "bound"],
      systems: ["system", "architecture", "implementation", "performance"],
    };

    const scores = {};
    Object.entries(classifications).forEach(([type, keywords]) => {
      scores[type] = keywords.filter((keyword) =>
        allText.includes(keyword)
      ).length;
    });

    const primaryType = Object.entries(scores).sort(([, a], [, b]) => b - a)[0];

    return {
      primaryType: primaryType ? primaryType[0] : "unknown",
      scores,
      confidence: algorithmBlocks.length > 0 ? "high" : "medium",
    };
  }
}