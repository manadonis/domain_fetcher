const DomainAnalysisService = require('./DomainAnalysisService');

class DomainSearchService {
  constructor() {
    this.analysisService = new DomainAnalysisService();

    // Premium prefixes and suffixes for 2025
    this.premiumPrefixes = [
      'get', 'my', 'the', 'smart', 'ai', 'auto', 'instant', 'rapid', 'ultra', 'pro', 'next',
      'super', 'mega', 'best', 'top', 'prime', 'elite', 'max', 'turbo', 'quick', 'fast',
      'easy', 'simple', 'direct', 'pure', 'true', 'real', 'live', 'new', 'fresh', 'modern'
    ];

    this.premiumSuffixes = [
      'ly', 'app', 'hub', 'lab', 'tech', 'pro', 'ai', 'io', 'wise', 'bot', 'flow',
      'zone', 'spot', 'base', 'core', 'link', 'sync', 'flex', 'boost', 'shift',
      'edge', 'peak', 'plus', 'max', 'studio', 'works', 'labs', 'systems'
    ];

    // Industry-specific keywords for targeted generation
    this.industryKeywords = {
      ai_tech: ['ai', 'bot', 'neural', 'smart', 'auto', 'machine', 'deep', 'cognitive', 'algorithm'],
      fintech: ['pay', 'coin', 'bank', 'fund', 'invest', 'cash', 'money', 'trade', 'crypto', 'defi'],
      health: ['health', 'med', 'care', 'wellness', 'bio', 'pharma', 'clinic', 'therapy', 'heal'],
      ecommerce: ['shop', 'buy', 'sell', 'store', 'market', 'cart', 'order', 'deal', 'vendor'],
      saas: ['cloud', 'data', 'platform', 'software', 'tool', 'system', 'analytics', 'dashboard'],
      green: ['green', 'eco', 'clean', 'solar', 'sustainable', 'carbon', 'climate', 'renewable']
    };

    // TLD preferences by category
    this.tldPreferences = {
      ai_tech: ['.ai', '.io', '.tech', '.com'],
      fintech: ['.finance', '.com', '.io', '.co'],
      health: ['.health', '.care', '.com', '.org'],
      ecommerce: ['.com', '.shop', '.store', '.co'],
      saas: ['.io', '.app', '.com', '.tech'],
      green: ['.green', '.eco', '.org', '.com'],
      general: ['.com', '.net', '.org', '.co', '.io']
    };

    // Alternative spellings and variations
    this.commonVariations = {
      'c': ['ck', 'k'],
      'ph': ['f'],
      'er': ['or', 'ar'],
      'ize': ['ise'],
      'tion': ['sion'],
      'y': ['ie', 'i'],
      'ou': ['u'],
      'ea': ['ee'],
      'ai': ['ay'],
      'ei': ['ie']
    };

    // Trending compound patterns for 2025
    this.trendingPatterns = [
      { pattern: '{keyword}ai', weight: 9 },
      { pattern: 'ai{keyword}', weight: 8 },
      { pattern: '{keyword}pro', weight: 7 },
      { pattern: 'smart{keyword}', weight: 8 },
      { pattern: '{keyword}hub', weight: 6 },
      { pattern: '{keyword}lab', weight: 6 },
      { pattern: '{keyword}tech', weight: 7 },
      { pattern: 'get{keyword}', weight: 7 },
      { pattern: '{keyword}bot', weight: 8 },
      { pattern: '{keyword}flow', weight: 6 }
    ];
  }

  // Main domain search function
  async searchDomains(query, options = {}) {
    const {
      maxResults = 50,
      includeVariations = true,
      includeSimilar = true,
      industries = ['general'],
      tlds = null,
      minScore = 5,
      onlyAvailable = true,
      includeAnalysis = true
    } = options;

    try {
      const startTime = Date.now();

      // Generate base suggestions
      const suggestions = await this.generateDomainSuggestions(query, {
        industries,
        tlds,
        includeVariations,
        maxResults: maxResults * 2 // Generate more to filter
      });

      // Add similar domain suggestions
      if (includeSimilar) {
        const similarSuggestions = await this.generateSimilarDomains(query, {
          industries,
          tlds,
          maxResults: Math.floor(maxResults * 0.5)
        });
        suggestions.push(...similarSuggestions);
      }

      // Remove duplicates
      const uniqueSuggestions = [...new Set(suggestions)];

      // Analyze domains if requested
      let results = [];
      if (includeAnalysis) {
        results = await this.analyzeDomainList(uniqueSuggestions, {
          onlyAvailable,
          minScore,
          maxResults
        });
      } else {
        results = uniqueSuggestions.slice(0, maxResults).map(domain => ({
          domain,
          analyzed: false,
          generated: true
        }));
      }

      return {
        query,
        results,
        totalGenerated: uniqueSuggestions.length,
        totalAnalyzed: results.length,
        searchTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Domain search failed:', error);
      throw new Error(`Domain search failed: ${error.message}`);
    }
  }

  // Generate domain suggestions based on keywords
  async generateDomainSuggestions(query, options = {}) {
    const {
      industries = ['general'],
      tlds = null,
      includeVariations = true,
      maxResults = 100
    } = options;

    const keywords = this.extractKeywords(query);
    const suggestions = new Set();

    // Determine TLDs to use
    const targetTlds = tlds || this.getTLDsForIndustries(industries);

    // Generate for each keyword
    for (const keyword of keywords) {
      // Direct keyword domains
      for (const tld of targetTlds) {
        suggestions.add(`${keyword}${tld}`);
      }

      // Prefix combinations
      for (const prefix of this.premiumPrefixes) {
        if ((prefix + keyword).length <= 15) {
          for (const tld of targetTlds) {
            suggestions.add(`${prefix}${keyword}${tld}`);
          }
        }
      }

      // Suffix combinations
      for (const suffix of this.premiumSuffixes) {
        if ((keyword + suffix).length <= 15) {
          for (const tld of targetTlds) {
            suggestions.add(`${keyword}${suffix}${tld}`);
          }
        }
      }

      // Trending patterns
      for (const { pattern, weight } of this.trendingPatterns) {
        const domain = pattern.replace('{keyword}', keyword);
        if (domain.length <= 15) {
          for (const tld of targetTlds) {
            suggestions.add(`${domain}${tld}`);
          }
        }
      }

      // Industry-specific combinations
      for (const industry of industries) {
        if (this.industryKeywords[industry]) {
          for (const industryKeyword of this.industryKeywords[industry]) {
            if (industryKeyword !== keyword) {
              const combo1 = `${keyword}${industryKeyword}`;
              const combo2 = `${industryKeyword}${keyword}`;

              if (combo1.length <= 12) {
                for (const tld of targetTlds) {
                  suggestions.add(`${combo1}${tld}`);
                }
              }

              if (combo2.length <= 12) {
                for (const tld of targetTlds) {
                  suggestions.add(`${combo2}${tld}`);
                }
              }
            }
          }
        }
      }

      // Variations if enabled
      if (includeVariations) {
        const variations = this.generateVariations(keyword);
        for (const variation of variations) {
          for (const tld of targetTlds) {
            suggestions.add(`${variation}${tld}`);
          }
        }
      }
    }

    // Multi-keyword combinations
    if (keywords.length > 1) {
      for (let i = 0; i < keywords.length; i++) {
        for (let j = i + 1; j < keywords.length; j++) {
          const combo = keywords[i] + keywords[j];
          if (combo.length <= 12) {
            for (const tld of targetTlds) {
              suggestions.add(`${combo}${tld}`);
            }
          }
        }
      }
    }

    return Array.from(suggestions).slice(0, maxResults);
  }

  // Generate similar domain suggestions
  async generateSimilarDomains(query, options = {}) {
    const {
      industries = ['general'],
      tlds = null,
      maxResults = 25
    } = options;

    const suggestions = new Set();
    const keywords = this.extractKeywords(query);
    const targetTlds = tlds || this.getTLDsForIndustries(industries);

    for (const keyword of keywords) {
      // Phonetic variations
      const phoneticVariations = this.generatePhoneticVariations(keyword);
      for (const variation of phoneticVariations) {
        for (const tld of targetTlds) {
          suggestions.add(`${variation}${tld}`);
        }
      }

      // Rhyming words (simplified approach)
      const rhymes = this.generateRhymes(keyword);
      for (const rhyme of rhymes) {
        for (const tld of targetTlds) {
          suggestions.add(`${rhyme}${tld}`);
        }
      }

      // Synonyms and related terms
      const related = this.getRelatedTerms(keyword, industries);
      for (const term of related) {
        for (const tld of targetTlds) {
          suggestions.add(`${term}${tld}`);
        }
      }
    }

    return Array.from(suggestions).slice(0, maxResults);
  }

  // Extract keywords from query
  extractKeywords(query) {
    return query
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length >= 2)
      .slice(0, 5); // Limit to 5 keywords
  }

  // Get TLDs for specific industries
  getTLDsForIndustries(industries) {
    const allTlds = new Set();

    for (const industry of industries) {
      const tlds = this.tldPreferences[industry] || this.tldPreferences.general;
      tlds.forEach(tld => allTlds.add(tld));
    }

    return Array.from(allTlds);
  }

  // Generate spelling and phonetic variations
  generateVariations(keyword) {
    const variations = new Set([keyword]);

    // Apply common spelling variations
    for (const [from, toList] of Object.entries(this.commonVariations)) {
      if (keyword.includes(from)) {
        for (const to of toList) {
          variations.add(keyword.replace(from, to));
        }
      }
    }

    // Remove/add common letters
    if (keyword.length > 4) {
      // Double letters
      for (let i = 0; i < keyword.length - 1; i++) {
        if (keyword[i] === keyword[i + 1]) {
          variations.add(keyword.slice(0, i) + keyword.slice(i + 1));
        }
      }

      // Add double letters
      for (let i = 0; i < keyword.length; i++) {
        const char = keyword[i];
        if ('aeiou'.includes(char)) continue; // Skip vowels
        variations.add(keyword.slice(0, i + 1) + char + keyword.slice(i + 1));
      }
    }

    return Array.from(variations).filter(v => v.length >= 3 && v.length <= 12);
  }

  // Generate phonetic variations
  generatePhoneticVariations(keyword) {
    const variations = new Set();

    // Simple phonetic patterns
    const phoneticMap = {
      'c': 'k', 'k': 'c', 'ph': 'f', 'f': 'ph',
      'x': 'z', 'z': 'x', 'i': 'y', 'y': 'i'
    };

    for (const [from, to] of Object.entries(phoneticMap)) {
      if (keyword.includes(from)) {
        variations.add(keyword.replace(new RegExp(from, 'g'), to));
      }
    }

    return Array.from(variations).filter(v => v.length >= 3);
  }

  // Generate rhyming words (simplified)
  generateRhymes(keyword) {
    const rhymes = new Set();

    if (keyword.length < 3) return Array.from(rhymes);

    // Common rhyming endings
    const rhymeEndings = {
      'ay': ['ai', 'ey'],
      'ee': ['ea', 'ie'],
      'y': ['ie', 'i'],
      'er': ['or', 'ar'],
      'le': ['al', 'el']
    };

    for (const [ending, alternatives] of Object.entries(rhymeEndings)) {
      if (keyword.endsWith(ending)) {
        const base = keyword.slice(0, -ending.length);
        for (const alt of alternatives) {
          rhymes.add(base + alt);
        }
      }
    }

    return Array.from(rhymes);
  }

  // Get related terms for a keyword
  getRelatedTerms(keyword, industries) {
    const related = new Set();

    // Industry-specific related terms
    for (const industry of industries) {
      if (this.industryKeywords[industry]) {
        this.industryKeywords[industry].forEach(term => {
          if (term !== keyword && this.isRelated(keyword, term)) {
            related.add(term);
          }
        });
      }
    }

    // Common related terms
    const generalRelated = {
      'buy': ['shop', 'get', 'order', 'purchase'],
      'sell': ['trade', 'offer', 'deal', 'exchange'],
      'app': ['tool', 'software', 'platform', 'system'],
      'smart': ['clever', 'bright', 'quick', 'fast'],
      'pro': ['expert', 'professional', 'elite', 'premium'],
      'ai': ['smart', 'auto', 'intelligent', 'bot'],
      'tech': ['digital', 'cyber', 'system', 'platform']
    };

    if (generalRelated[keyword]) {
      generalRelated[keyword].forEach(term => related.add(term));
    }

    return Array.from(related).slice(0, 10);
  }

  // Check if two keywords are related
  isRelated(keyword1, keyword2) {
    // Simple relatedness check
    if (keyword1.includes(keyword2) || keyword2.includes(keyword1)) {
      return true;
    }

    // Check if they share common letters (simplified)
    const shared = keyword1.split('').filter(char => keyword2.includes(char));
    return shared.length >= Math.min(keyword1.length, keyword2.length) * 0.5;
  }

  // Analyze a list of domains
  async analyzeDomainList(domains, options = {}) {
    const {
      onlyAvailable = true,
      minScore = 5,
      maxResults = 50,
      maxConcurrency = 10
    } = options;

    const results = [];

    // Process domains in batches
    for (let i = 0; i < domains.length; i += maxConcurrency) {
      const batch = domains.slice(i, i + maxConcurrency);

      const batchPromises = batch.map(async (domain) => {
        try {
          const analysis = await this.analysisService.analyzeDomain(domain);

          // Apply filters
          if (onlyAvailable && !analysis.availability.isAvailable) {
            return null;
          }

          if (analysis.scoring.overall < minScore) {
            return null;
          }

          return {
            domain,
            analysis,
            score: analysis.scoring.overall,
            available: analysis.availability.isAvailable,
            estimatedValue: analysis.valuation.estimatedValue,
            industries: analysis.marketIntelligence.targetIndustries,
            keywords: analysis.scoring.factors.keywords
          };
        } catch (error) {
          console.error(`Failed to analyze ${domain}:`, error);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter(result => result !== null));

      // Stop if we have enough results
      if (results.length >= maxResults) {
        break;
      }

      // Add delay between batches
      if (i + maxConcurrency < domains.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Sort by score and return top results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);
  }

  // Advanced domain search with filters
  async advancedSearch(filters) {
    const {
      keywords = [],
      industries = ['general'],
      tlds = null,
      minLength = 3,
      maxLength = 15,
      minScore = 5,
      maxPrice = null,
      onlyAvailable = true,
      includeNumbers = false,
      includeHyphens = false,
      maxResults = 50
    } = filters;

    try {
      // Generate domain suggestions
      let suggestions = [];

      if (keywords.length > 0) {
        for (const keyword of keywords) {
          const keywordSuggestions = await this.generateDomainSuggestions(keyword, {
            industries,
            tlds,
            maxResults: 200
          });
          suggestions.push(...keywordSuggestions);
        }
      } else {
        // Generate based on industries
        suggestions = await this.generateIndustryDomains(industries, { tlds, maxResults: 500 });
      }

      // Apply length filters
      suggestions = suggestions.filter(domain => {
        const baseName = domain.split('.')[0];
        return baseName.length >= minLength && baseName.length <= maxLength;
      });

      // Apply character filters
      if (!includeNumbers) {
        suggestions = suggestions.filter(domain => !/\d/.test(domain.split('.')[0]));
      }

      if (!includeHyphens) {
        suggestions = suggestions.filter(domain => !/-/.test(domain.split('.')[0]));
      }

      // Remove duplicates
      suggestions = [...new Set(suggestions)];

      // Analyze and filter
      const results = await this.analyzeDomainList(suggestions, {
        onlyAvailable,
        minScore,
        maxResults: maxResults * 2
      });

      // Apply price filter
      let filteredResults = results;
      if (maxPrice) {
        filteredResults = results.filter(result =>
          result.estimatedValue && result.estimatedValue.min <= maxPrice
        );
      }

      return {
        filters,
        results: filteredResults.slice(0, maxResults),
        totalGenerated: suggestions.length,
        totalAnalyzed: results.length,
        totalFiltered: filteredResults.length,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Advanced search failed:', error);
      throw new Error(`Advanced search failed: ${error.message}`);
    }
  }

  // Generate domains for specific industries
  async generateIndustryDomains(industries, options = {}) {
    const { tlds = null, maxResults = 100 } = options;
    const suggestions = new Set();

    for (const industry of industries) {
      if (this.industryKeywords[industry]) {
        const keywords = this.industryKeywords[industry];
        const targetTlds = tlds || this.tldPreferences[industry] || this.tldPreferences.general;

        // Generate combinations within industry
        for (let i = 0; i < keywords.length; i++) {
          for (let j = i + 1; j < keywords.length; j++) {
            const combo1 = keywords[i] + keywords[j];
            const combo2 = keywords[j] + keywords[i];

            if (combo1.length <= 12) {
              for (const tld of targetTlds) {
                suggestions.add(`${combo1}${tld}`);
              }
            }

            if (combo2.length <= 12) {
              for (const tld of targetTlds) {
                suggestions.add(`${combo2}${tld}`);
              }
            }
          }
        }

        // Add trending patterns for industry
        for (const keyword of keywords.slice(0, 5)) {
          for (const { pattern } of this.trendingPatterns) {
            const domain = pattern.replace('{keyword}', keyword);
            if (domain.length <= 15) {
              for (const tld of targetTlds) {
                suggestions.add(`${domain}${tld}`);
              }
            }
          }
        }
      }
    }

    return Array.from(suggestions).slice(0, maxResults);
  }

  // Find expired/expiring domains (placeholder for external API integration)
  async findExpiredDomains(options = {}) {
    const { industries = [], tlds = [], maxResults = 50 } = options;

    // This would integrate with expired domain APIs like ExpiredDomains.net
    return {
      placeholder: true,
      message: 'Expired domain integration pending',
      results: [],
      note: 'Would integrate with APIs like ExpiredDomains.net, DropCatch, etc.'
    };
  }

  // Suggest brandable names using AI patterns
  async generateBrandableNames(concept, options = {}) {
    const { maxResults = 25, industries = ['general'] } = options;
    const suggestions = new Set();

    // Extract core concept
    const coreKeywords = this.extractKeywords(concept);
    const targetTlds = this.getTLDsForIndustries(industries);

    // Brandable patterns
    const brandablePatterns = [
      '{concept}ly', '{concept}fy', '{concept}io', '{concept}ai',
      'my{concept}', 'get{concept}', '{concept}hub', '{concept}lab',
      '{concept}wise', '{concept}spot', '{concept}zone', '{concept}base'
    ];

    for (const keyword of coreKeywords) {
      // Apply brandable patterns
      for (const pattern of brandablePatterns) {
        const brandName = pattern.replace('{concept}', keyword);
        if (brandName.length >= 5 && brandName.length <= 12) {
          for (const tld of targetTlds) {
            suggestions.add(`${brandName}${tld}`);
          }
        }
      }

      // Create blended names
      for (const suffix of ['fy', 'ly', 'io', 'ai', 'co']) {
        if (keyword.length <= 8) {
          const blended = keyword + suffix;
          for (const tld of targetTlds) {
            suggestions.add(`${blended}${tld}`);
          }
        }
      }

      // Vowel substitutions for uniqueness
      const vowelSubs = { 'a': 'e', 'e': 'i', 'i': 'o', 'o': 'u', 'u': 'a' };
      for (const [from, to] of Object.entries(vowelSubs)) {
        if (keyword.includes(from)) {
          const substituted = keyword.replace(new RegExp(from, 'g'), to);
          if (substituted !== keyword) {
            for (const tld of targetTlds) {
              suggestions.add(`${substituted}${tld}`);
            }
          }
        }
      }
    }

    return Array.from(suggestions).slice(0, maxResults);
  }
}

module.exports = DomainSearchService;