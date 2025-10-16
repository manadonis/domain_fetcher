# Domain Availability Checker with RapidAPI

A Node.js implementation for checking domain availability using RapidAPI services.

## Setup Instructions

1. **Get RapidAPI Key**:
   - Visit [RapidAPI.com](https://rapidapi.com/)
   - Sign up for an account
   - Subscribe to one of these APIs:
     - [Domain Availability by WHOIS API](https://rapidapi.com/whoisapi/api/domain-availability) (Recommended)
     - [Domainr API](https://rapidapi.com/domainr/api/domainr)
     - [Bulk Domain Check](https://rapidapi.com/backend_box/api/bulk-domain-check)

2. **Configure Environment**:
   ```bash
   cp .env.example .env
   # Edit .env and add your RAPIDAPI_KEY
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

## Usage

### Command Line
```bash
npm run domain-check
```

### Programmatic Usage
```javascript
const DomainAvailabilityChecker = require('./domain-checker');

const checker = new DomainAvailabilityChecker();

// Check single domain
const result = await checker.checkDomain('example.com');
console.log(result.available ? 'Available' : 'Not Available');

// Search for domains
const suggestions = await checker.searchDomains('myapp');

// Check multiple domains
const domains = ['test1.com', 'test2.com'];
const results = await checker.checkMultipleDomains(domains);
```

## API Features

- **Single Domain Check**: Verify if a specific domain is available
- **Domain Search**: Find available variations of a domain name
- **Bulk Checking**: Check multiple domains at once
- **Domain Validation**: Validate domain name format
- **Suggestion Generator**: Generate domain variations with different TLDs

## Files

- `domain-checker.js` - Main checker class
- `domain-checker-config.js` - API configuration
- `domain-checker-example.js` - Usage examples
- `.env.example` - Environment template