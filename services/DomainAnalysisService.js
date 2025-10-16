const whois = require('node-whois');
const dns = require('dns').promises;
const axios = require('axios');
const { performance } = require('perf_hooks');

class DomainAnalysisService {
  constructor() {
    // Commercial keywords by category (enhanced from existing Python scripts)
    this.commercialKeywords = {
      ai_tech: ['ai', 'artificial', 'intelligence', 'machine', 'learning', 'neural', 'deep', 'smart', 'auto', 'bot'],
      fintech: ['pay', 'coin', 'crypto', 'bank', 'invest', 'fund', 'money', 'cash', 'trade', 'loan', 'wallet', 'defi'],
      health: ['health', 'med', 'care', 'wellness', 'fit', 'heal', 'therapy', 'clinic', 'pharma', 'bio', 'life'],
      ecommerce: ['buy', 'sell', 'shop', 'store', 'market', 'deal', 'sale', 'cart', 'order', 'vendor', 'merchant'],
      real_estate: ['home', 'house', 'property', 'real', 'estate', 'rent', 'lease', 'land', 'realty', 'building'],
      business: ['biz', 'pro', 'expert', 'consultant', 'service', 'solution', 'agency', 'firm', 'corp', 'enterprise'],
      saas: ['app', 'software', 'platform', 'tool', 'system', 'cloud', 'data', 'analytics', 'dashboard'],
      green_tech: ['green', 'eco', 'sustainable', 'clean', 'solar', 'renewable', 'carbon', 'climate', 'environment']
    };

    // 2025 trending keywords
    this.trending2025 = {
      ai_revolution: ['agi', 'llm', 'chatbot', 'copilot', 'assistant', 'automation', 'gpt'],
      web3: ['blockchain', 'nft', 'metaverse', 'dao', 'web3', 'polygon', 'ethereum', 'solana'],
      sustainability: ['carbon', 'net-zero', 'esg', 'circular', 'renewable', 'impact', 'climate'],
      future_work: ['remote', 'hybrid', 'async', 'nomad', 'gig', 'freelance', 'cowork'],
      health_tech: ['telemedicine', 'wearable', 'biotech', 'longevity', 'precision', 'genomics'],
      emerging_tech: ['quantum', 'edge', 'iot', '5g', '6g', 'augmented', 'virtual', 'mixed', 'ar', 'vr']
    };

    // Premium action keywords
    this.premiumActions = [
      'get', 'find', 'book', 'buy', 'sell', 'rent', 'hire', 'order', 'schedule',
      'connect', 'access', 'unlock', 'secure', 'optimize', 'boost', 'grow',
      'instant', 'rapid', 'quick', 'fast', 'easy', 'simple', 'direct', 'ultra'
    ];

    // Premium extensions with value multipliers
    this.premiumExtensions = {
      '.com': 10,
      '.ai': 9,
      '.io': 8,
      '.co': 7,
      '.app': 6,
      '.tech': 6,
      '.finance': 8,
      '.health': 7,
      '.green': 6,
      '.org': 5,
      '.net': 4
    };

    // Geographic modifiers
    this.geoModifiers = [
      'ny', 'sf', 'la', 'london', 'tokyo', 'singapore', 'dubai', 'miami',
      'austin', 'seattle', 'boston', 'chicago', 'toronto', 'sydney', 'berlin'
    ];
  }

  // Main domain analysis function
  async analyzeDomain(domainName) {
    try {
      const startTime = performance.now();

      const analysis = {
        domain: domainName,
        timestamp: new Date().toISOString(),
        basicInfo: await this.getBasicInfo(domainName),
        availability: await this.checkAvailability(domainName),
        whoisData: await this.getWhoisData(domainName),
        dnsInfo: await this.getDNSInfo(domainName),
        scoring: this.calculateScoring(domainName),
        valuation: null,
        seoMetrics: await this.getSEOMetrics(domainName),
        brandAnalysis: await this.analyzeBrand(domainName),
        marketIntelligence: this.analyzeMarket(domainName),
        technicalAnalysis: await this.getTechnicalAnalysis(domainName),
        aiAnalysis: this.performAIAnalysis(domainName),
        performance: {
          analysisTime: Math.round(performance.now() - startTime),
          dataFreshness: Date.now()
        }
      };

      // Calculate valuation based on all factors
      analysis.valuation = this.estimateValue(domainName, analysis.scoring);

      return analysis;
    } catch (error) {
      console.error(`Error analyzing domain ${domainName}:`, error);
      throw new Error(`Domain analysis failed: ${error.message}`);
    }
  }

  // Basic domain information extraction
  getBasicInfo(domainName) {
    const parts = domainName.split('.');
    const baseName = parts[0];
    const tld = '.' + parts.slice(1).join('.');

    return {
      fullName: domainName,
      baseName: baseName,
      tld: tld,
      length: baseName.length,
      hasNumbers: /\d/.test(baseName),
      hasHyphens: /-/.test(baseName),
      isIDN: /[^\x00-\x7F]/.test(domainName)
    };
  }

  // Enhanced availability checking
  async checkAvailability(domainName) {
    try {
      // Try DNS resolution first
      const addresses = await dns.resolve(domainName, 'A');
      return {
        isAvailable: false,
        method: 'dns_resolution',
        ipAddress: addresses[0],
        lastChecked: new Date().toISOString(),
        confidence: 0.95
      };
    } catch (error) {
      if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
        return {
          isAvailable: true,
          method: 'dns_resolution',
          lastChecked: new Date().toISOString(),
          confidence: 0.85,
          note: 'Domain does not resolve - likely available'
        };
      }

      return {
        isAvailable: null,
        method: 'dns_resolution',
        error: error.message,
        lastChecked: new Date().toISOString(),
        confidence: 0.1
      };
    }
  }

  // WHOIS data retrieval
  async getWhoisData(domainName) {
    return new Promise((resolve) => {
      whois.lookup(domainName, (err, data) => {
        if (err) {
          resolve({
            available: null,
            error: err.message,
            rawData: null
          });
          return;
        }

        try {
          const parsed = this.parseWhoisData(data);
          resolve(parsed);
        } catch (parseError) {
          resolve({
            available: null,
            error: parseError.message,
            rawData: data
          });
        }
      });
    });
  }

  // Parse WHOIS data into structured format
  parseWhoisData(rawData) {
    const lines = rawData.split('\n');
    const result = {
      registrar: null,
      registeredDate: null,
      expiryDate: null,
      updatedDate: null,
      nameservers: [],
      status: [],
      registrantCountry: null,
      registrantOrg: null,
      adminEmail: null,
      techEmail: null,
      dnsSec: null,
      privacy: false,
      rawData: rawData
    };

    lines.forEach(line => {
      const lower = line.toLowerCase();

      if (lower.includes('registrar:') && !result.registrar) {
        result.registrar = line.split(':')[1]?.trim();
      }

      if (lower.includes('creation date:') || lower.includes('registered on:')) {
        const dateStr = line.split(':')[1]?.trim();
        result.registeredDate = this.parseDate(dateStr);
      }

      if (lower.includes('expiry date:') || lower.includes('expires on:')) {
        const dateStr = line.split(':')[1]?.trim();
        result.expiryDate = this.parseDate(dateStr);
      }

      if (lower.includes('updated date:') || lower.includes('last updated:')) {
        const dateStr = line.split(':')[1]?.trim();
        result.updatedDate = this.parseDate(dateStr);
      }

      if (lower.includes('name server:') || lower.includes('nserver:')) {
        const ns = line.split(':')[1]?.trim();
        if (ns) result.nameservers.push(ns);
      }

      if (lower.includes('status:')) {
        const status = line.split(':')[1]?.trim();
        if (status) result.status.push(status);
      }

      if (lower.includes('country:')) {
        result.registrantCountry = line.split(':')[1]?.trim();
      }

      if (lower.includes('organization:') || lower.includes('org:')) {
        result.registrantOrg = line.split(':')[1]?.trim();
      }

      if (lower.includes('privacy') || lower.includes('whois privacy')) {
        result.privacy = true;
      }
    });

    return result;
  }

  // Date parsing helper
  parseDate(dateStr) {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date.toISOString();
  }

  // DNS information gathering
  async getDNSInfo(domainName) {
    const dnsInfo = {
      a: [],
      aaaa: [],
      cname: [],
      mx: [],
      txt: [],
      ns: [],
      lastChecked: new Date().toISOString()
    };

    try {
      const recordTypes = [
        { type: 'A', key: 'a' },
        { type: 'AAAA', key: 'aaaa' },
        { type: 'CNAME', key: 'cname' },
        { type: 'MX', key: 'mx' },
        { type: 'TXT', key: 'txt' },
        { type: 'NS', key: 'ns' }
      ];

      await Promise.allSettled(
        recordTypes.map(async ({ type, key }) => {
          try {
            const records = await dns.resolve(domainName, type);
            dnsInfo[key] = records;
          } catch (error) {
            dnsInfo[key] = [];
          }
        })
      );

    } catch (error) {
      console.error(`DNS lookup failed for ${domainName}:`, error);
    }

    return dnsInfo;
  }

  // Enhanced scoring system (based on existing Python algorithms)
  calculateScoring(domainName) {
    const basicInfo = this.getBasicInfo(domainName);
    const baseName = basicInfo.baseName.toLowerCase();

    // Individual scores
    const brevityScore = this.scoreBrevityMemorability(basicInfo);
    const commercialScore = this.scoreCommercialPotential(baseName);
    const seoScore = this.scoreSEOPotential(baseName);
    const trendScore = this.scoreMarketTrends(baseName);
    const brandabilityScore = this.scoreBrandability(basicInfo);

    // Weighted overall score (2025 priorities)
    const overallScore = (
      brevityScore.score * 0.20 +        // Brevity/memorability
      commercialScore.score * 0.30 +     // Commercial potential
      seoScore.score * 0.20 +            // SEO potential
      trendScore.score * 0.20 +          // Market trends
      brandabilityScore.score * 0.10     // Brandability
    );

    return {
      overall: Math.round(overallScore * 10) / 10,
      brevity: brevityScore.score,
      commercial: commercialScore.score,
      seo: seoScore.score,
      trend: trendScore.score,
      brandability: brandabilityScore.score,
      factors: {
        length: basicInfo.length,
        keywords: [...commercialScore.keywords, ...trendScore.keywords],
        industries: commercialScore.industries,
        reasoning: {
          brevity: brevityScore.reasoning,
          commercial: commercialScore.reasoning,
          seo: seoScore.reasoning,
          trend: trendScore.reasoning,
          brandability: brandabilityScore.reasoning
        }
      },
      lastUpdated: new Date().toISOString()
    };
  }

  // Brevity and memorability scoring
  scoreBrevityMemorability(basicInfo) {
    const { baseName, length, hasNumbers, hasHyphens } = basicInfo;
    let score = 5; // Base score
    let reasoning = [];

    // Length scoring (optimal: 4-8 characters)
    if (length >= 4 && length <= 6) {
      score += 4;
      reasoning.push('Optimal length (4-6 chars)');
    } else if (length >= 7 && length <= 9) {
      score += 3;
      reasoning.push('Good length (7-9 chars)');
    } else if (length >= 10 && length <= 12) {
      score += 1;
      reasoning.push('Acceptable length (10-12 chars)');
    } else if (length > 15) {
      score -= 2;
      reasoning.push('Too long (>15 chars)');
    }

    // Penalty for numbers and hyphens
    if (hasNumbers) {
      score -= 2;
      reasoning.push('Contains numbers (-2)');
    }

    if (hasHyphens) {
      score -= 2;
      reasoning.push('Contains hyphens (-2)');
    }

    // Pronounceability check
    const vowels = (baseName.match(/[aeiou]/g) || []).length;
    const consonants = (baseName.match(/[bcdfghjklmnpqrstvwxyz]/g) || []).length;

    if (vowels === 0) {
      score -= 3;
      reasoning.push('No vowels - hard to pronounce');
    } else if (vowels / length < 0.2) {
      score -= 1;
      reasoning.push('Few vowels - may be hard to pronounce');
    }

    // Consonant cluster penalty
    const clusters = baseName.match(/[bcdfghjklmnpqrstvwxyz]{3,}/g);
    if (clusters) {
      score -= clusters.length * 1.5;
      reasoning.push(`Consonant clusters (${clusters.length})`);
    }

    return {
      score: Math.max(0, Math.min(10, score)),
      reasoning: reasoning.join('; ')
    };
  }

  // Commercial potential scoring
  scoreCommercialPotential(baseName) {
    let score = 0;
    let keywords = [];
    let industries = [];
    let reasoning = [];

    // Category weights for 2025
    const categoryWeights = {
      ai_tech: 5,
      fintech: 4.5,
      health: 4,
      saas: 4,
      ecommerce: 3.5,
      green_tech: 4,
      business: 3,
      real_estate: 3.5
    };

    // Score commercial keywords
    for (const [category, categoryKeywords] of Object.entries(this.commercialKeywords)) {
      const weight = categoryWeights[category] || 3;
      for (const keyword of categoryKeywords) {
        if (baseName.includes(keyword)) {
          score += weight;
          keywords.push(keyword);
          industries.push(category.replace('_', ' '));
          reasoning.push(`${keyword} (${category}, +${weight})`);
        }
      }
    }

    // Score trending 2025 keywords
    for (const [trendCategory, trendKeywords] of Object.entries(this.trending2025)) {
      for (const keyword of trendKeywords) {
        if (baseName.includes(keyword)) {
          score += 3;
          keywords.push(keyword);
          reasoning.push(`2025 trend: ${keyword} (+3)`);
        }
      }
    }

    // Score premium action keywords
    for (const action of this.premiumActions) {
      if (baseName.includes(action)) {
        score += 2;
        keywords.push(action);
        reasoning.push(`Action: ${action} (+2)`);
      }
    }

    // Geographic premium bonus
    for (const geo of this.geoModifiers) {
      if (baseName.includes(geo)) {
        score += 1.5;
        keywords.push(geo);
        reasoning.push(`Geo premium: ${geo} (+1.5)`);
      }
    }

    return {
      score: Math.min(10, score),
      keywords: [...new Set(keywords)],
      industries: [...new Set(industries)],
      reasoning: reasoning.join('; ') || 'No premium commercial keywords'
    };
  }

  // SEO potential scoring
  scoreSEOPotential(baseName) {
    let score = 5; // Base score
    let reasoning = [];

    // Exact match potential for high-value terms
    const highValueTerms = ['ai', 'app', 'pay', 'buy', 'sell', 'health', 'crypto', 'smart', 'auto'];
    for (const term of highValueTerms) {
      if (baseName === term) {
        score += 4;
        reasoning.push(`Exact match: ${term}`);
      } else if (baseName.includes(term)) {
        score += 2;
        reasoning.push(`Contains: ${term}`);
      }
    }

    // Generic high-volume terms
    const genericTerms = ['online', 'digital', 'virtual', 'instant', 'pro', 'express', 'direct', 'premium'];
    for (const term of genericTerms) {
      if (baseName.includes(term)) {
        score += 1.5;
        reasoning.push(`High-volume: ${term}`);
      }
    }

    // Length factor for SEO
    if (baseName.length <= 8) {
      score += 1;
      reasoning.push('SEO-friendly length');
    }

    // Voice search optimization
    if (/^(get|find|buy|book|order)/.test(baseName)) {
      score += 1.5;
      reasoning.push('Voice search optimized');
    }

    return {
      score: Math.min(10, score),
      reasoning: reasoning.join('; ') || 'Standard SEO potential'
    };
  }

  // Market trends scoring for 2025
  scoreMarketTrends(baseName) {
    let score = 5; // Base score
    let keywords = [];
    let reasoning = [];

    // 2025 mega trends
    const megaTrends = {
      'ai': 6, 'artificial': 5, 'agi': 7, 'llm': 5, 'chatbot': 4,
      'quantum': 5, 'crypto': 4, 'defi': 4, 'nft': 3, 'web3': 4,
      'sustainable': 4, 'green': 3, 'carbon': 4, 'climate': 4,
      'remote': 3, 'hybrid': 3, 'metaverse': 3, 'virtual': 3,
      'biotech': 5, 'longevity': 5, 'precision': 4, 'genomics': 5,
      'edge': 4, 'iot': 3, '5g': 3, 'autonomous': 4
    };

    for (const [trend, multiplier] of Object.entries(megaTrends)) {
      if (baseName.includes(trend)) {
        score += multiplier;
        keywords.push(trend);
        reasoning.push(`Mega trend: ${trend} (+${multiplier})`);
      }
    }

    // Industry transformation trends
    const transformationTerms = {
      'fintech': 4, 'proptech': 4, 'edtech': 3, 'healthtech': 4,
      'insurtech': 3, 'legaltech': 3, 'agtech': 3, 'cleantech': 4
    };

    for (const [term, value] of Object.entries(transformationTerms)) {
      if (baseName.includes(term)) {
        score += value;
        keywords.push(term);
        reasoning.push(`Industry transform: ${term} (+${value})`);
      }
    }

    return {
      score: Math.min(10, score),
      keywords: [...new Set(keywords)],
      reasoning: reasoning.join('; ') || 'Standard market positioning'
    };
  }

  // Brandability scoring
  scoreBrandability(basicInfo) {
    const { baseName, length, hasNumbers, hasHyphens } = basicInfo;
    let score = 5;
    let reasoning = [];

    // Ideal brandable length
    if (length >= 5 && length <= 9) {
      score += 3;
      reasoning.push('Ideal brandable length');
    }

    // Dictionary word bonus
    if (/^[a-z]+$/.test(baseName.toLowerCase()) && length >= 4) {
      score += 2;
      reasoning.push('Clean alphabetic structure');
    }

    // Penalties
    if (hasNumbers || hasHyphens) {
      score -= 2;
      reasoning.push('Numbers/hyphens reduce brandability');
    }

    // Pronounceability for branding
    const vowelRatio = (baseName.match(/[aeiou]/g) || []).length / length;
    if (vowelRatio >= 0.3 && vowelRatio <= 0.6) {
      score += 1;
      reasoning.push('Good vowel balance');
    }

    return {
      score: Math.min(10, score),
      reasoning: reasoning.join('; ')
    };
  }

  // Value estimation based on comprehensive analysis
  estimateValue(domainName, scoring) {
    const extension = '.' + domainName.split('.').slice(1).join('.');
    const baseMultiplier = this.premiumExtensions[extension] || 3;
    const baseName = domainName.split('.')[0];

    // Length multiplier
    let lengthMultiplier = 1.0;
    if (baseName.length <= 4) {
      lengthMultiplier = 2.0; // Super premium short domains
    } else if (baseName.length <= 6) {
      lengthMultiplier = 1.5;
    }

    const finalMultiplier = baseMultiplier * lengthMultiplier;

    // Base value calculation based on overall score
    let baseValue;
    if (scoring.overall >= 9.5) {
      baseValue = 100000 * finalMultiplier;
    } else if (scoring.overall >= 9) {
      baseValue = 50000 * finalMultiplier;
    } else if (scoring.overall >= 8) {
      baseValue = 15000 * finalMultiplier;
    } else if (scoring.overall >= 7) {
      baseValue = 5000 * finalMultiplier;
    } else if (scoring.overall >= 6) {
      baseValue = 1500 * finalMultiplier;
    } else if (scoring.overall >= 5) {
      baseValue = 500 * finalMultiplier;
    } else {
      baseValue = 100;
    }

    return {
      estimatedValue: {
        min: Math.round(baseValue),
        max: Math.round(baseValue * 3),
        currency: 'USD'
      },
      factors: {
        overallScore: scoring.overall,
        extensionMultiplier: baseMultiplier,
        lengthMultiplier: lengthMultiplier,
        finalMultiplier: finalMultiplier
      },
      confidence: this.calculateValuationConfidence(scoring),
      lastUpdated: new Date().toISOString()
    };
  }

  // Calculate valuation confidence
  calculateValuationConfidence(scoring) {
    let confidence = 0.5; // Base confidence

    if (scoring.overall >= 8) confidence += 0.3;
    if (scoring.commercial >= 7) confidence += 0.2;
    if (scoring.trend >= 7) confidence += 0.15;
    if (scoring.seo >= 7) confidence += 0.1;

    return Math.min(0.95, confidence);
  }

  // Placeholder for SEO metrics (would integrate with external APIs)
  async getSEOMetrics(domainName) {
    // This would integrate with Ahrefs, SEMrush, Moz APIs
    return {
      placeholder: true,
      note: 'SEO metrics integration pending',
      domainAuthority: null,
      backlinks: { total: null, quality: null },
      organicTraffic: null,
      keywords: [],
      lastUpdated: new Date().toISOString()
    };
  }

  // Brand analysis
  async analyzeBrand(domainName) {
    const baseName = domainName.split('.')[0].toLowerCase();

    return {
      socialMedia: {
        // Would check actual availability via APIs
        placeholder: true,
        availabilityChecked: false
      },
      trademarks: {
        // Would check trademark databases
        placeholder: true,
        conflictsFound: null
      },
      brandability: {
        score: this.scoreBrandability(this.getBasicInfo(domainName)).score,
        memorable: baseName.length <= 8,
        pronounceable: !/[bcdfghjklmnpqrstvwxyz]{3,}/.test(baseName),
        unique: true // Would check against existing brands
      },
      lastUpdated: new Date().toISOString()
    };
  }

  // Market intelligence analysis
  analyzeMarket(domainName) {
    const commercialAnalysis = this.scoreCommercialPotential(domainName.split('.')[0].toLowerCase());

    return {
      category: commercialAnalysis.industries,
      targetIndustries: commercialAnalysis.industries,
      marketSize: 'large', // Would calculate based on industry data
      competition: 'medium', // Would analyze similar domains
      demandScore: Math.min(10, commercialAnalysis.score),
      trends: commercialAnalysis.keywords,
      seasonality: null, // Would analyze based on industry
      lastUpdated: new Date().toISOString()
    };
  }

  // Technical analysis
  async getTechnicalAnalysis(domainName) {
    try {
      const dnsInfo = await this.getDNSInfo(domainName);

      return {
        dns: dnsInfo,
        ssl: {
          // Would check SSL certificate details
          hasSSL: null,
          grade: null,
          validTo: null
        },
        performance: {
          // Would run performance tests
          loadTime: null,
          pageSize: null,
          lighthouse: null
        },
        hosting: {
          // Would identify hosting provider
          provider: null,
          location: null,
          technology: []
        },
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      return {
        error: error.message,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  // AI-powered analysis
  performAIAnalysis(domainName) {
    const scoring = this.calculateScoring(domainName);

    return {
      sentiment: this.calculateSentiment(domainName),
      clustering: {
        group: this.determineCluster(domainName),
        similarity: 0.75 // Would calculate against domain database
      },
      predictions: {
        futureValue: scoring.overall >= 7 ? 'increasing' : 'stable',
        trendDirection: scoring.trend >= 7 ? 'up' : 'stable',
        confidenceLevel: this.calculateValuationConfidence(scoring)
      },
      recommendations: this.generateRecommendations(scoring),
      lastUpdated: new Date().toISOString()
    };
  }

  // Calculate domain sentiment
  calculateSentiment(domainName) {
    const baseName = domainName.split('.')[0].toLowerCase();

    // Positive words
    const positiveWords = ['smart', 'pro', 'premium', 'ultra', 'best', 'top', 'quick', 'easy', 'secure'];
    const negativeWords = ['bad', 'worst', 'slow', 'hard', 'difficult', 'ugly'];

    let sentiment = 0;

    positiveWords.forEach(word => {
      if (baseName.includes(word)) sentiment += 0.2;
    });

    negativeWords.forEach(word => {
      if (baseName.includes(word)) sentiment -= 0.3;
    });

    return Math.max(-1, Math.min(1, sentiment));
  }

  // Determine domain cluster/category
  determineCluster(domainName) {
    const scoring = this.scoreCommercialPotential(domainName.split('.')[0].toLowerCase());

    if (scoring.industries.length > 0) {
      return scoring.industries[0];
    }

    return 'general';
  }

  // Generate AI recommendations
  generateRecommendations(scoring) {
    const recommendations = [];

    if (scoring.overall >= 8) {
      recommendations.push('High-quality domain - consider premium pricing');
    }

    if (scoring.commercial >= 7) {
      recommendations.push('Strong commercial potential - good for business use');
    }

    if (scoring.trend >= 7) {
      recommendations.push('Trending keywords - capitalize on current market demand');
    }

    if (scoring.brevity < 5) {
      recommendations.push('Consider shorter variations for better memorability');
    }

    if (scoring.seo >= 7) {
      recommendations.push('Good SEO potential - develop content strategy');
    }

    return recommendations;
  }

  // Bulk domain analysis
  async analyzeBulkDomains(domainList, options = {}) {
    const { maxConcurrency = 5, includeUnavailable = false } = options;
    const results = [];

    // Process domains in batches
    for (let i = 0; i < domainList.length; i += maxConcurrency) {
      const batch = domainList.slice(i, i + maxConcurrency);

      const batchPromises = batch.map(async (domain) => {
        try {
          const analysis = await this.analyzeDomain(domain);

          // Filter based on availability if requested
          if (!includeUnavailable && !analysis.availability.isAvailable) {
            return null;
          }

          return analysis;
        } catch (error) {
          console.error(`Failed to analyze ${domain}:`, error);
          return { domain, error: error.message };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter(result => result !== null));

      // Add delay between batches to avoid rate limiting
      if (i + maxConcurrency < domainList.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Sort by overall score
    return results.sort((a, b) => (b.scoring?.overall || 0) - (a.scoring?.overall || 0));
  }
}

module.exports = DomainAnalysisService;