const axios = require('axios');
const config = require('./domain-checker-config');

class DomainAvailabilityChecker {
  constructor() {
    this.apiKey = process.env.RAPIDAPI_KEY;
    if (!this.apiKey) {
      throw new Error('RAPIDAPI_KEY is required. Please set it in your .env file.');
    }
  }

  // Check single domain availability using WHOIS API
  async checkDomain(domainName) {
    try {
      const response = await axios.get(`${config.DOMAIN_API.baseUrl}${config.DOMAIN_API.endpoint}`, {
        params: {
          domainName: domainName
        },
        headers: config.DOMAIN_API.headers
      });

      return {
        domain: domainName,
        available: response.data.domainAvailability === 'AVAILABLE',
        status: response.data.domainAvailability,
        details: response.data
      };
    } catch (error) {
      console.error(`Error checking domain ${domainName}:`, error.response?.data || error.message);
      return {
        domain: domainName,
        available: null,
        error: error.response?.data || error.message
      };
    }
  }

  // Search domains using Domainr API
  async searchDomains(query, tlds = []) {
    try {
      const params = { query };
      if (tlds.length > 0) {
        params.tlds = tlds.join(',');
      }

      const response = await axios.get(`${config.DOMAINR_API.baseUrl}${config.DOMAINR_API.searchEndpoint}`, {
        params,
        headers: config.DOMAINR_API.headers
      });

      return response.data.results || [];
    } catch (error) {
      console.error(`Error searching domains for ${query}:`, error.response?.data || error.message);
      return [];
    }
  }

  // Check multiple domains in bulk
  async checkMultipleDomains(domains) {
    try {
      const response = await axios.post(`${config.BULK_API.baseUrl}${config.BULK_API.endpoint}`, {
        domains: domains
      }, {
        headers: {
          ...config.BULK_API.headers,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error checking multiple domains:', error.response?.data || error.message);
      return null;
    }
  }

  // Get detailed domain status using Domainr
  async getDomainStatus(domain) {
    try {
      const response = await axios.get(`${config.DOMAINR_API.baseUrl}${config.DOMAINR_API.statusEndpoint}`, {
        params: { domain },
        headers: config.DOMAINR_API.headers
      });

      return response.data;
    } catch (error) {
      console.error(`Error getting status for ${domain}:`, error.response?.data || error.message);
      return null;
    }
  }

  // Utility method to validate domain name format
  isValidDomainName(domain) {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  }

  // Generate domain suggestions with different TLDs
  generateDomainSuggestions(baseName, tlds = ['com', 'net', 'org', 'io', 'co']) {
    if (!baseName) return [];

    return tlds.map(tld => `${baseName}.${tld}`);
  }
}

module.exports = DomainAvailabilityChecker;