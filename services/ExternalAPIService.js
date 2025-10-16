const axios = require('axios');
const cheerio = require('cheerio');

class ExternalAPIService {
  constructor() {
    this.apiKeys = {
      namecheap: process.env.NAMECHEAP_API_KEY,
      godaddy: {
        key: process.env.GODADDY_API_KEY,
        secret: process.env.GODADDY_SECRET
      },
      sedo: process.env.SEDO_API_KEY,
      whoisAPI: process.env.WHOIS_API_KEY
    };

    // Rate limiting
    this.rateLimits = {
      namecheap: { calls: 0, resetTime: Date.now() + 60000, limit: 60 },
      godaddy: { calls: 0, resetTime: Date.now() + 60000, limit: 1000 },
      sedo: { calls: 0, resetTime: Date.now() + 60000, limit: 100 },
      whoisAPI: { calls: 0, resetTime: Date.now() + 60000, limit: 1000 }
    };
  }

  // Rate limiting helper
  async checkRateLimit(service) {
    const limit = this.rateLimits[service];
    if (!limit) return true;

    const now = Date.now();
    if (now > limit.resetTime) {
      limit.calls = 0;
      limit.resetTime = now + 60000;
    }

    if (limit.calls >= limit.limit) {
      const waitTime = limit.resetTime - now;
      console.warn(`Rate limit reached for ${service}, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.checkRateLimit(service);
    }

    limit.calls++;
    return true;
  }

  // Comprehensive domain availability check across multiple registrars
  async checkDomainAvailabilityMultiple(domain) {
    const results = await Promise.allSettled([
      this.checkAvailabilityNamecheap(domain),
      this.checkAvailabilityGoDaddy(domain),
      this.checkAvailabilityWhoisAPI(domain)
    ]);

    const [namecheap, godaddy, whoisAPI] = results.map(result =>
      result.status === 'fulfilled' ? result.value : null
    );

    // Aggregate results
    const sources = [namecheap, godaddy, whoisAPI].filter(Boolean);

    if (sources.length === 0) {
      return {
        available: null,
        confidence: 0,
        sources: [],
        error: 'No availability sources responded'
      };
    }

    // Calculate consensus
    const availableCount = sources.filter(s => s.available === true).length;
    const unavailableCount = sources.filter(s => s.available === false).length;

    const consensus = availableCount > unavailableCount;
    const confidence = Math.max(availableCount, unavailableCount) / sources.length;

    return {
      available: consensus,
      confidence: confidence,
      sources: sources,
      lastChecked: new Date().toISOString()
    };
  }

  // Namecheap API availability check
  async checkAvailabilityNamecheap(domain) {
    if (!this.apiKeys.namecheap) {
      return null;
    }

    try {
      await this.checkRateLimit('namecheap');

      const response = await axios.get('https://api.namecheap.com/xml.response', {
        params: {
          ApiUser: process.env.NAMECHEAP_API_USER,
          ApiKey: this.apiKeys.namecheap,
          UserName: process.env.NAMECHEAP_API_USER,
          Command: 'namecheap.domains.check',
          ClientIp: process.env.SERVER_IP || '127.0.0.1',
          DomainList: domain
        },
        timeout: 10000
      });

      // Parse XML response (simplified)
      const available = response.data.includes('Available="true"');

      return {
        source: 'namecheap',
        available: available,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Namecheap availability check error:', error.message);
      return null;
    }
  }

  // GoDaddy API availability check
  async checkAvailabilityGoDaddy(domain) {
    if (!this.apiKeys.godaddy.key || !this.apiKeys.godaddy.secret) {
      return null;
    }

    try {
      await this.checkRateLimit('godaddy');

      const response = await axios.get(`https://api.godaddy.com/v1/domains/available`, {
        params: {
          domain: domain,
          checkType: 'FAST'
        },
        headers: {
          'Authorization': `sso-key ${this.apiKeys.godaddy.key}:${this.apiKeys.godaddy.secret}`,
          'Accept': 'application/json'
        },
        timeout: 10000
      });

      return {
        source: 'godaddy',
        available: response.data.available,
        price: response.data.price,
        currency: response.data.currency,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('GoDaddy availability check error:', error.message);
      return null;
    }
  }

  // WHOIS API check
  async checkAvailabilityWhoisAPI(domain) {
    if (!this.apiKeys.whoisAPI) {
      return null;
    }

    try {
      await this.checkRateLimit('whoisAPI');

      const response = await axios.get(`https://www.whoisxmlapi.com/whoisserver/WhoisService`, {
        params: {
          apiKey: this.apiKeys.whoisAPI,
          domainName: domain,
          outputFormat: 'JSON'
        },
        timeout: 15000
      });

      const whoisData = response.data.WhoisRecord;
      const available = !whoisData || !whoisData.registryData;

      return {
        source: 'whoisAPI',
        available: available,
        whoisData: whoisData,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('WHOIS API check error:', error.message);
      return null;
    }
  }

  // Get domain marketplace listings
  async getMarketplaceListings(domain) {
    const results = await Promise.allSettled([
      this.getSedoListings(domain),
      this.getAfternicListings(domain),
      this.getDanListings(domain)
    ]);

    const [sedo, afternic, dan] = results.map(result =>
      result.status === 'fulfilled' ? result.value : null
    );

    return {
      domain,
      listings: [sedo, afternic, dan].filter(Boolean),
      aggregated: this.aggregateMarketplaceData([sedo, afternic, dan].filter(Boolean)),
      lastChecked: new Date().toISOString()
    };
  }

  // Sedo marketplace integration
  async getSedoListings(domain) {
    try {
      // Note: Sedo doesn't have a public API, this would require scraping or partnership
      // This is a placeholder for the integration

      const response = await axios.get(`https://sedo.com/search/details/?partnerid=&language=e&domain=${domain}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; DomainAnalyzer/1.0)'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);

      // This would need to be adapted based on Sedo's actual HTML structure
      const priceElement = $('.price');
      const price = priceElement.text().match(/[\d,]+/)?.[0];

      return {
        source: 'sedo',
        domain: domain,
        available: !!price,
        price: price ? parseInt(price.replace(/,/g, '')) : null,
        currency: 'USD',
        url: `https://sedo.com/search/details/?domain=${domain}`,
        type: 'marketplace'
      };

    } catch (error) {
      console.error('Sedo listings error:', error.message);
      return null;
    }
  }

  // Afternic marketplace integration
  async getAfternicListings(domain) {
    try {
      // Similar to Sedo, this would require scraping or API access
      const response = await axios.get(`https://www.afternic.com/domain/${domain}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; DomainAnalyzer/1.0)'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);

      // Parse Afternic listing data
      const priceElement = $('.domain-price');
      const price = priceElement.text().match(/\$[\d,]+/)?.[0];

      return {
        source: 'afternic',
        domain: domain,
        available: !!price,
        price: price ? parseInt(price.replace(/[$,]/g, '')) : null,
        currency: 'USD',
        url: `https://www.afternic.com/domain/${domain}`,
        type: 'marketplace'
      };

    } catch (error) {
      console.error('Afternic listings error:', error.message);
      return null;
    }
  }

  // Dan.com marketplace integration
  async getDanListings(domain) {
    try {
      const response = await axios.get(`https://dan.com/buy-domain/${domain}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; DomainAnalyzer/1.0)'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);

      // Parse Dan.com listing data
      const priceElement = $('.domain-price, .price');
      const price = priceElement.text().match(/\$[\d,]+/)?.[0];

      return {
        source: 'dan',
        domain: domain,
        available: !!price,
        price: price ? parseInt(price.replace(/[$,]/g, '')) : null,
        currency: 'USD',
        url: `https://dan.com/buy-domain/${domain}`,
        type: 'marketplace'
      };

    } catch (error) {
      console.error('Dan.com listings error:', error.message);
      return null;
    }
  }

  // Social media username availability checker
  async checkSocialMediaAvailability(username) {
    const platforms = [
      { name: 'twitter', url: `https://twitter.com/${username}`, method: 'status' },
      { name: 'instagram', url: `https://instagram.com/${username}`, method: 'status' },
      { name: 'facebook', url: `https://facebook.com/${username}`, method: 'status' },
      { name: 'linkedin', url: `https://linkedin.com/in/${username}`, method: 'status' },
      { name: 'youtube', url: `https://youtube.com/c/${username}`, method: 'status' },
      { name: 'tiktok', url: `https://tiktok.com/@${username}`, method: 'status' },
      { name: 'github', url: `https://github.com/${username}`, method: 'status' }
    ];

    const results = await Promise.allSettled(
      platforms.map(async (platform) => {
        try {
          const response = await axios.head(platform.url, {
            timeout: 5000,
            validateStatus: (status) => status < 500 // Don't throw on 404
          });

          return {
            platform: platform.name,
            available: response.status === 404,
            status: response.status,
            url: platform.url
          };
        } catch (error) {
          return {
            platform: platform.name,
            available: error.response?.status === 404,
            status: error.response?.status || 0,
            url: platform.url,
            error: error.message
          };
        }
      })
    );

    return results.map(result =>
      result.status === 'fulfilled' ? result.value : null
    ).filter(Boolean);
  }

  // Trademark database search
  async searchTrademarks(term) {
    try {
      // This would integrate with USPTO TESS or other trademark databases
      // For now, this is a placeholder that would need proper API access

      const response = await axios.get(`https://tsdr.uspto.gov/caseviewer/`, {
        params: {
          caseNumber: term,
          searchType: 'wordMark'
        },
        timeout: 10000
      });

      // Parse trademark search results
      // This would need to be implemented based on the actual API structure

      return {
        term: term,
        results: [],
        totalFound: 0,
        disclaimer: 'Trademark search requires proper API integration'
      };

    } catch (error) {
      console.error('Trademark search error:', error.message);
      return {
        term: term,
        results: [],
        totalFound: 0,
        error: error.message
      };
    }
  }

  // Expired domains finder
  async findExpiredDomains(filters = {}) {
    try {
      // This would integrate with services like ExpiredDomains.net
      // For now, this is a placeholder

      const {
        tld = '.com',
        minLength = 4,
        maxLength = 15,
        hasBacklinks = false,
        minDA = 0
      } = filters;

      // Placeholder response
      return {
        domains: [],
        filters: filters,
        totalFound: 0,
        note: 'Expired domains integration requires specialized API access'
      };

    } catch (error) {
      console.error('Expired domains search error:', error.message);
      return {
        domains: [],
        error: error.message
      };
    }
  }

  // Historical domain sales data
  async getDomainSalesHistory(domain) {
    try {
      // This would integrate with NameBio, DNJournal, or other sales databases
      // For now, this is a placeholder

      return {
        domain: domain,
        sales: [],
        avgPrice: null,
        lastSale: null,
        totalSales: 0,
        note: 'Sales history requires integration with domain sales databases'
      };

    } catch (error) {
      console.error('Sales history error:', error.message);
      return {
        domain: domain,
        sales: [],
        error: error.message
      };
    }
  }

  // Web archive analysis
  async analyzeWebArchive(domain) {
    try {
      const waybackAPI = `http://web.archive.org/cdx/search/cdx`;
      const response = await axios.get(waybackAPI, {
        params: {
          url: domain,
          output: 'json',
          limit: 100,
          collapse: 'timestamp:6' // Group by year
        },
        timeout: 15000
      });

      const data = response.data;
      if (!data || data.length < 2) {
        return {
          domain: domain,
          hasHistory: false,
          firstSeen: null,
          lastSeen: null,
          totalSnapshots: 0
        };
      }

      // Skip header row
      const snapshots = data.slice(1);

      const timestamps = snapshots.map(snapshot => snapshot[1]);
      const firstSeen = timestamps[timestamps.length - 1]; // Oldest
      const lastSeen = timestamps[0]; // Newest

      return {
        domain: domain,
        hasHistory: true,
        firstSeen: this.parseWaybackTimestamp(firstSeen),
        lastSeen: this.parseWaybackTimestamp(lastSeen),
        totalSnapshots: snapshots.length,
        snapshots: snapshots.slice(0, 10).map(s => ({
          timestamp: this.parseWaybackTimestamp(s[1]),
          url: `http://web.archive.org/web/${s[1]}/${s[2]}`,
          status: s[4]
        }))
      };

    } catch (error) {
      console.error('Web archive analysis error:', error.message);
      return {
        domain: domain,
        hasHistory: false,
        error: error.message
      };
    }
  }

  // Helper methods
  parseWaybackTimestamp(timestamp) {
    if (!timestamp || timestamp.length !== 14) return null;

    const year = timestamp.substring(0, 4);
    const month = timestamp.substring(4, 6);
    const day = timestamp.substring(6, 8);
    const hour = timestamp.substring(8, 10);
    const minute = timestamp.substring(10, 12);
    const second = timestamp.substring(12, 14);

    return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
  }

  aggregateMarketplaceData(listings) {
    if (!listings.length) return null;

    const available = listings.filter(l => l.available);
    if (!available.length) return null;

    const prices = available.map(l => l.price).filter(Boolean);
    if (!prices.length) return null;

    return {
      availableOn: available.map(l => l.source),
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices),
        avg: Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length)
      },
      marketplaces: available.length
    };
  }

  // Get comprehensive external data for a domain
  async getComprehensiveExternalData(domain) {
    try {
      const [
        availability,
        marketplace,
        archive,
        social,
        trademarks
      ] = await Promise.allSettled([
        this.checkDomainAvailabilityMultiple(domain),
        this.getMarketplaceListings(domain),
        this.analyzeWebArchive(domain),
        this.checkSocialMediaAvailability(domain.split('.')[0]),
        this.searchTrademarks(domain.split('.')[0])
      ]);

      return {
        domain,
        availability: availability.status === 'fulfilled' ? availability.value : null,
        marketplace: marketplace.status === 'fulfilled' ? marketplace.value : null,
        archive: archive.status === 'fulfilled' ? archive.value : null,
        social: social.status === 'fulfilled' ? social.value : null,
        trademarks: trademarks.status === 'fulfilled' ? trademarks.value : null,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Comprehensive external data error:', error);
      throw new Error(`Failed to get external data: ${error.message}`);
    }
  }
}

module.exports = ExternalAPIService;