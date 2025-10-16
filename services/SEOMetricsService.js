const axios = require('axios');

class SEOMetricsService {
  constructor() {
    this.ahrefsAPI = process.env.AHREFS_API_TOKEN;
    this.semrushAPI = process.env.SEMRUSH_API_KEY;
    this.mozAccessId = process.env.MOZ_ACCESS_ID;
    this.mozSecretKey = process.env.MOZ_SECRET_KEY;

    // Rate limiting
    this.lastAhrefsCall = 0;
    this.lastSemrushCall = 0;
    this.lastMozCall = 0;

    // Minimum intervals between calls (ms)
    this.ahrefsInterval = 1000; // 1 second
    this.semrushInterval = 100;  // 0.1 second
    this.mozInterval = 10000;    // 10 seconds
  }

  // Main method to get comprehensive SEO metrics
  async getComprehensiveSEOMetrics(domain) {
    try {
      const results = await Promise.allSettled([
        this.getAhrefsMetrics(domain),
        this.getSemrushMetrics(domain),
        this.getMozMetrics(domain),
        this.getBasicSEOMetrics(domain)
      ]);

      const [ahrefs, semrush, moz, basic] = results.map(result =>
        result.status === 'fulfilled' ? result.value : null
      );

      return this.aggregateSEOMetrics({
        domain,
        ahrefs,
        semrush,
        moz,
        basic,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`SEO metrics error for ${domain}:`, error);
      throw new Error(`Failed to get SEO metrics: ${error.message}`);
    }
  }

  // Ahrefs API integration
  async getAhrefsMetrics(domain) {
    if (!this.ahrefsAPI) {
      console.warn('Ahrefs API token not configured');
      return null;
    }

    // Rate limiting
    const now = Date.now();
    if (now - this.lastAhrefsCall < this.ahrefsInterval) {
      await new Promise(resolve =>
        setTimeout(resolve, this.ahrefsInterval - (now - this.lastAhrefsCall))
      );
    }
    this.lastAhrefsCall = Date.now();

    try {
      const endpoints = {
        overview: `https://apiv2.ahrefs.com/v3/site-explorer/overview`,
        backlinks: `https://apiv2.ahrefs.com/v3/site-explorer/backlinks-stats`,
        organic: `https://apiv2.ahrefs.com/v3/site-explorer/organic-keywords-overview`
      };

      const headers = {
        'Authorization': `Bearer ${this.ahrefsAPI}`,
        'Accept': 'application/json'
      };

      const requests = Object.entries(endpoints).map(async ([key, url]) => {
        try {
          const response = await axios.get(url, {
            headers,
            params: {
              target: domain,
              mode: 'domain'
            },
            timeout: 15000
          });
          return [key, response.data];
        } catch (error) {
          console.error(`Ahrefs ${key} error:`, error.response?.data || error.message);
          return [key, null];
        }
      });

      const results = await Promise.all(requests);
      const data = Object.fromEntries(results);

      return {
        source: 'ahrefs',
        domainRating: data.overview?.domain_rating || null,
        urlRating: data.overview?.url_rating || null,
        backlinks: {
          total: data.backlinks?.backlinks || 0,
          dofollow: data.backlinks?.dofollow || 0,
          nofollow: data.backlinks?.nofollow || 0,
          uniqueDomains: data.backlinks?.ref_domains || 0,
          ips: data.backlinks?.ref_ips || 0,
          subnets: data.backlinks?.ref_subnets || 0
        },
        organicKeywords: {
          total: data.organic?.keywords || 0,
          top3: data.organic?.keywords_top3 || 0,
          top10: data.organic?.keywords_top10 || 0,
          top100: data.organic?.keywords_top100 || 0
        },
        organicTraffic: {
          value: data.organic?.traffic || 0,
          cost: data.organic?.cost || 0
        },
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      console.error('Ahrefs API error:', error);
      return null;
    }
  }

  // SEMrush API integration
  async getSemrushMetrics(domain) {
    if (!this.semrushAPI) {
      console.warn('SEMrush API key not configured');
      return null;
    }

    // Rate limiting
    const now = Date.now();
    if (now - this.lastSemrushCall < this.semrushInterval) {
      await new Promise(resolve =>
        setTimeout(resolve, this.semrushInterval - (now - this.lastSemrushCall))
      );
    }
    this.lastSemrushCall = Date.now();

    try {
      const baseUrl = 'https://api.semrush.com/';
      const params = {
        type: 'domain_overview',
        key: this.semrushAPI,
        domain: domain,
        database: 'us',
        export_columns: 'Or,Ot,Oc,Ad,At,Ac,Rk,Fk'
      };

      const response = await axios.get(baseUrl, {
        params,
        timeout: 15000
      });

      // Parse SEMrush CSV response
      const lines = response.data.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        return null;
      }

      const data = lines[1].split(';');

      return {
        source: 'semrush',
        organicKeywords: parseInt(data[0]) || 0,
        organicTraffic: parseInt(data[1]) || 0,
        organicCost: parseFloat(data[2]) || 0,
        adKeywords: parseInt(data[3]) || 0,
        adTraffic: parseInt(data[4]) || 0,
        adCost: parseFloat(data[5]) || 0,
        authority: parseFloat(data[6]) || 0,
        toxicity: parseFloat(data[7]) || 0,
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      console.error('SEMrush API error:', error);
      return null;
    }
  }

  // Moz API integration
  async getMozMetrics(domain) {
    if (!this.mozAccessId || !this.mozSecretKey) {
      console.warn('Moz API credentials not configured');
      return null;
    }

    // Rate limiting
    const now = Date.now();
    if (now - this.lastMozCall < this.mozInterval) {
      await new Promise(resolve =>
        setTimeout(resolve, this.mozInterval - (now - this.lastMozCall))
      );
    }
    this.lastMozCall = Date.now();

    try {
      const crypto = require('crypto');

      // Moz API authentication
      const expires = Math.floor(Date.now() / 1000) + 300; // 5 minutes
      const stringToSign = `${this.mozAccessId}\n${expires}`;
      const signature = crypto
        .createHmac('sha1', this.mozSecretKey)
        .update(stringToSign)
        .digest('base64');

      const response = await axios.post('https://lsapi.seomoz.com/v2/url_metrics', {
        targets: [domain]
      }, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.mozAccessId}:${signature}`).toString('base64')}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      const data = response.data.results?.[0];
      if (!data) return null;

      return {
        source: 'moz',
        domainAuthority: data.domain_authority || 0,
        pageAuthority: data.page_authority || 0,
        linkingRootDomains: data.linking_root_domains || 0,
        totalLinks: data.links || 0,
        spamScore: data.spam_score || 0,
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      console.error('Moz API error:', error);
      return null;
    }
  }

  // Basic SEO metrics using free methods
  async getBasicSEOMetrics(domain) {
    try {
      const results = await Promise.allSettled([
        this.checkSSL(domain),
        this.analyzePageSpeed(domain),
        this.checkSitemap(domain),
        this.checkRobots(domain),
        this.analyzeTitleAndMeta(domain)
      ]);

      const [ssl, pageSpeed, sitemap, robots, titleMeta] = results.map(result =>
        result.status === 'fulfilled' ? result.value : null
      );

      return {
        source: 'basic',
        ssl: ssl,
        pageSpeed: pageSpeed,
        sitemap: sitemap,
        robots: robots,
        titleMeta: titleMeta,
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      console.error('Basic SEO metrics error:', error);
      return null;
    }
  }

  // SSL certificate check
  async checkSSL(domain) {
    try {
      const https = require('https');
      const url = require('url');

      return new Promise((resolve, reject) => {
        const options = {
          hostname: domain.replace(/^https?:\/\//, '').split('/')[0],
          port: 443,
          method: 'HEAD',
          timeout: 5000
        };

        const req = https.request(options, (res) => {
          const cert = res.socket.getPeerCertificate();

          if (cert && Object.keys(cert).length > 0) {
            resolve({
              hasSSL: true,
              issuer: cert.issuer?.O || 'Unknown',
              validFrom: cert.valid_from,
              validTo: cert.valid_to,
              algorithm: cert.sigalg || 'Unknown'
            });
          } else {
            resolve({ hasSSL: false });
          }
        });

        req.on('error', () => {
          resolve({ hasSSL: false, error: 'Connection failed' });
        });

        req.on('timeout', () => {
          req.destroy();
          resolve({ hasSSL: false, error: 'Timeout' });
        });

        req.end();
      });

    } catch (error) {
      return { hasSSL: false, error: error.message };
    }
  }

  // Page speed analysis using Google PageSpeed Insights API
  async analyzePageSpeed(domain) {
    try {
      if (!process.env.GOOGLE_PAGESPEED_API_KEY) {
        return null;
      }

      const url = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed`;
      const params = {
        url: `https://${domain}`,
        key: process.env.GOOGLE_PAGESPEED_API_KEY,
        strategy: 'desktop',
        category: ['PERFORMANCE', 'SEO', 'ACCESSIBILITY', 'BEST_PRACTICES']
      };

      const response = await axios.get(url, { params, timeout: 30000 });
      const data = response.data;

      return {
        performance: data.lighthouseResult?.categories?.performance?.score * 100 || 0,
        seo: data.lighthouseResult?.categories?.seo?.score * 100 || 0,
        accessibility: data.lighthouseResult?.categories?.accessibility?.score * 100 || 0,
        bestPractices: data.lighthouseResult?.categories?.['best-practices']?.score * 100 || 0,
        loadingExperience: data.loadingExperience?.overall_category || 'UNKNOWN'
      };

    } catch (error) {
      console.error('PageSpeed API error:', error);
      return null;
    }
  }

  // Check for sitemap
  async checkSitemap(domain) {
    try {
      const sitemapUrls = [
        `https://${domain}/sitemap.xml`,
        `https://${domain}/sitemap_index.xml`,
        `https://${domain}/sitemaps/sitemap.xml`
      ];

      for (const url of sitemapUrls) {
        try {
          const response = await axios.head(url, { timeout: 5000 });
          if (response.status === 200) {
            return {
              exists: true,
              url: url,
              contentType: response.headers['content-type']
            };
          }
        } catch (error) {
          // Continue to next URL
        }
      }

      return { exists: false };

    } catch (error) {
      return { exists: false, error: error.message };
    }
  }

  // Check robots.txt
  async checkRobots(domain) {
    try {
      const robotsUrl = `https://${domain}/robots.txt`;
      const response = await axios.get(robotsUrl, { timeout: 5000 });

      return {
        exists: true,
        content: response.data.substring(0, 1000), // First 1000 chars
        size: response.data.length,
        disallowRules: (response.data.match(/Disallow:/gi) || []).length,
        sitemapReferences: (response.data.match(/Sitemap:/gi) || []).length
      };

    } catch (error) {
      return { exists: false, error: error.message };
    }
  }

  // Analyze title and meta tags
  async analyzeTitleAndMeta(domain) {
    try {
      const puppeteer = require('puppeteer');
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (compatible; DomainAnalyzer/1.0)');

      await page.goto(`https://${domain}`, {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });

      const analysis = await page.evaluate(() => {
        const title = document.querySelector('title')?.textContent || '';
        const description = document.querySelector('meta[name="description"]')?.content || '';
        const keywords = document.querySelector('meta[name="keywords"]')?.content || '';
        const h1s = Array.from(document.querySelectorAll('h1')).map(h => h.textContent);
        const images = document.querySelectorAll('img');
        const links = document.querySelectorAll('a');

        return {
          title: {
            text: title,
            length: title.length,
            hasKeyword: title.toLowerCase().includes(domain.split('.')[0].toLowerCase())
          },
          metaDescription: {
            text: description,
            length: description.length,
            exists: description.length > 0
          },
          metaKeywords: {
            text: keywords,
            exists: keywords.length > 0
          },
          headings: {
            h1Count: h1s.length,
            h1Text: h1s.slice(0, 3) // First 3 H1s
          },
          images: {
            total: images.length,
            withoutAlt: Array.from(images).filter(img => !img.alt).length
          },
          links: {
            total: links.length,
            internal: Array.from(links).filter(link =>
              link.href.includes(domain) || link.href.startsWith('/')
            ).length
          }
        };
      });

      await browser.close();
      return analysis;

    } catch (error) {
      console.error('Title/Meta analysis error:', error);
      return null;
    }
  }

  // Aggregate all SEO metrics into a comprehensive score
  aggregateSEOMetrics(data) {
    const { ahrefs, semrush, moz, basic } = data;

    // Calculate domain authority (average from multiple sources)
    const authorityScores = [];
    if (ahrefs?.domainRating) authorityScores.push(ahrefs.domainRating);
    if (moz?.domainAuthority) authorityScores.push(moz.domainAuthority);
    if (semrush?.authority) authorityScores.push(semrush.authority);

    const avgAuthority = authorityScores.length > 0
      ? authorityScores.reduce((sum, score) => sum + score, 0) / authorityScores.length
      : 0;

    // Calculate backlink metrics
    const backlinks = {
      total: Math.max(
        ahrefs?.backlinks?.total || 0,
        moz?.totalLinks || 0
      ),
      uniqueDomains: Math.max(
        ahrefs?.backlinks?.uniqueDomains || 0,
        moz?.linkingRootDomains || 0
      ),
      qualityScore: this.calculateBacklinkQuality(ahrefs, moz)
    };

    // Calculate traffic metrics
    const organicTraffic = {
      monthly: Math.max(
        ahrefs?.organicTraffic?.value || 0,
        semrush?.organicTraffic || 0
      ),
      keywords: Math.max(
        ahrefs?.organicKeywords?.total || 0,
        semrush?.organicKeywords || 0
      ),
      trend: this.calculateTrafficTrend(ahrefs, semrush)
    };

    // Technical SEO score
    const technicalScore = this.calculateTechnicalScore(basic);

    // Overall SEO score (0-100)
    const overallScore = this.calculateOverallSEOScore({
      authority: avgAuthority,
      backlinks,
      traffic: organicTraffic,
      technical: technicalScore
    });

    return {
      domain: data.domain,
      timestamp: data.timestamp,

      // Aggregated scores
      overallScore: Math.round(overallScore),
      domainAuthority: Math.round(avgAuthority),

      // Backlink metrics
      backlinks,

      // Traffic metrics
      organicTraffic,

      // Technical SEO
      technicalSEO: {
        score: technicalScore,
        ssl: basic?.ssl,
        pageSpeed: basic?.pageSpeed,
        sitemap: basic?.sitemap,
        robots: basic?.robots,
        onPage: basic?.titleMeta
      },

      // Spam/Risk assessment
      spamScore: moz?.spamScore || 0,
      toxicity: semrush?.toxicity || 0,

      // Raw data from sources
      sources: {
        ahrefs: ahrefs ? { available: true, data: ahrefs } : { available: false },
        semrush: semrush ? { available: true, data: semrush } : { available: false },
        moz: moz ? { available: true, data: moz } : { available: false },
        basic: basic ? { available: true, data: basic } : { available: false }
      },

      // Recommendations
      recommendations: this.generateSEORecommendations({
        authority: avgAuthority,
        backlinks,
        technical: basic,
        spam: moz?.spamScore || 0
      })
    };
  }

  // Calculate backlink quality score
  calculateBacklinkQuality(ahrefs, moz) {
    let quality = 50; // Base score

    if (ahrefs?.backlinks) {
      const dofollowRatio = ahrefs.backlinks.dofollow / (ahrefs.backlinks.total || 1);
      quality += dofollowRatio * 20; // Up to 20 points for dofollow ratio

      if (ahrefs.backlinks.uniqueDomains > 100) quality += 10;
      if (ahrefs.backlinks.uniqueDomains > 1000) quality += 10;
    }

    if (moz?.spamScore) {
      quality -= moz.spamScore; // Reduce quality for spam
    }

    return Math.max(0, Math.min(100, quality));
  }

  // Calculate traffic trend
  calculateTrafficTrend(ahrefs, semrush) {
    // This would require historical data to calculate properly
    // For now, return neutral
    return 'stable';
  }

  // Calculate technical SEO score
  calculateTechnicalScore(basic) {
    if (!basic) return 0;

    let score = 0;
    let maxScore = 0;

    // SSL check (20 points)
    if (basic.ssl) {
      maxScore += 20;
      if (basic.ssl.hasSSL) score += 20;
    }

    // Page speed (30 points)
    if (basic.pageSpeed) {
      maxScore += 30;
      const avgScore = (
        (basic.pageSpeed.performance || 0) +
        (basic.pageSpeed.seo || 0) +
        (basic.pageSpeed.accessibility || 0) +
        (basic.pageSpeed.bestPractices || 0)
      ) / 4;
      score += (avgScore / 100) * 30;
    }

    // Sitemap (15 points)
    if (basic.sitemap) {
      maxScore += 15;
      if (basic.sitemap.exists) score += 15;
    }

    // Robots.txt (10 points)
    if (basic.robots) {
      maxScore += 10;
      if (basic.robots.exists) score += 10;
    }

    // On-page SEO (25 points)
    if (basic.titleMeta) {
      maxScore += 25;
      let onPageScore = 0;

      if (basic.titleMeta.title.length > 0 && basic.titleMeta.title.length <= 60) {
        onPageScore += 8;
      }
      if (basic.titleMeta.metaDescription.exists && basic.titleMeta.metaDescription.length <= 160) {
        onPageScore += 8;
      }
      if (basic.titleMeta.headings.h1Count === 1) {
        onPageScore += 5;
      }
      if (basic.titleMeta.images.withoutAlt === 0) {
        onPageScore += 4;
      }

      score += onPageScore;
    }

    return maxScore > 0 ? (score / maxScore) * 100 : 0;
  }

  // Calculate overall SEO score
  calculateOverallSEOScore({ authority, backlinks, traffic, technical }) {
    const weights = {
      authority: 0.3,
      backlinks: 0.25,
      traffic: 0.25,
      technical: 0.2
    };

    const scores = {
      authority: Math.min(authority, 100),
      backlinks: Math.min(backlinks.qualityScore || 0, 100),
      traffic: Math.min((traffic.monthly / 1000) * 10, 100), // Scale traffic
      technical: technical
    };

    return Object.entries(weights).reduce((total, [key, weight]) => {
      return total + (scores[key] * weight);
    }, 0);
  }

  // Generate SEO recommendations
  generateSEORecommendations({ authority, backlinks, technical, spam }) {
    const recommendations = [];

    if (authority < 30) {
      recommendations.push({
        type: 'authority',
        priority: 'high',
        message: 'Focus on building domain authority through quality content and backlinks'
      });
    }

    if (backlinks.total < 100) {
      recommendations.push({
        type: 'backlinks',
        priority: 'high',
        message: 'Increase backlink acquisition from high-quality domains'
      });
    }

    if (spam > 5) {
      recommendations.push({
        type: 'spam',
        priority: 'critical',
        message: 'High spam score detected - audit and disavow toxic backlinks'
      });
    }

    if (technical?.ssl && !technical.ssl.hasSSL) {
      recommendations.push({
        type: 'technical',
        priority: 'high',
        message: 'Implement SSL certificate for security and SEO benefits'
      });
    }

    if (technical?.pageSpeed && technical.pageSpeed.performance < 50) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        message: 'Optimize page speed for better user experience and rankings'
      });
    }

    return recommendations;
  }
}

module.exports = SEOMetricsService;