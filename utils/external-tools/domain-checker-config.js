// Domain Availability Checker Configuration for RapidAPI
// Using WHOIS API Domain Availability service

const RAPIDAPI_CONFIG = {
  // Domain Availability API by WHOIS API
  DOMAIN_API: {
    baseUrl: 'https://domain-availability.whoisapis.com/api/v1',
    endpoint: '/status',
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY, // Your RapidAPI key
      'X-RapidAPI-Host': 'domain-availability.whoisapis.com'
    }
  },

  // Alternative: Domainr API
  DOMAINR_API: {
    baseUrl: 'https://domainr.p.rapidapi.com/v2',
    searchEndpoint: '/search',
    statusEndpoint: '/status',
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'domainr.p.rapidapi.com'
    }
  },

  // Bulk Domain Check API (for multiple domains)
  BULK_API: {
    baseUrl: 'https://bulk-domain-check.p.rapidapi.com',
    endpoint: '/check',
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'bulk-domain-check.p.rapidapi.com'
    }
  }
};

module.exports = RAPIDAPI_CONFIG;