# External Domain Checking Tools

This directory contains additional standalone domain checking utilities that complement the main domain_fetcher application. These tools can be used independently for domain availability checking via command line or integrated into other workflows.

## Available Tools

### 1. Python Domain Checker (`domain_checker.py`)
Comprehensive Python-based domain availability checker with multiple fallback methods.

**Features:**
- Multiple checking methods (WHOIS, DNS, RapidAPI)
- Fallback system for reliability
- Bulk domain checking
- Domain suggestion generation
- Rate limiting support

**Usage:**
```bash
# Simple command-line check
python3 check_domain.py example.com google.com

# Programmatic usage
python3 domain_checker.py
```

**Dependencies:** (install with: `pip install -r requirements_domain_checker.txt`)
- requests>=2.25.0
- python-whois>=0.7.3

### 2. Node.js Domain Checker (`domain-checker.js`)
RapidAPI-based domain availability checker for Node.js.

**Features:**
- RapidAPI integration with multiple providers
- Domain search functionality
- Bulk domain checking
- Domain name validation
- TLD suggestion generation

**Usage:**
```bash
# Install dependencies first (axios is already in main package.json)
# npm install axios dotenv

# Run the example
node domain-checker-example.js
```

**Configuration:**
Edit `domain-checker-config.js` to configure API endpoints and settings.

## Environment Setup

Both tools require API keys to be set in the main `.env` file:

```env
RAPIDAPI_KEY=your_rapidapi_key_here
```

### RapidAPI Setup
1. Visit [RapidAPI.com](https://rapidapi.com/)
2. Sign up for an account
3. Subscribe to one of these APIs:
   - [Domain Availability by WHOIS API](https://rapidapi.com/whoisapi/api/domain-availability) (Recommended)
   - [Domainr API](https://rapidapi.com/domainr/api/domainr)
   - [Bulk Domain Check](https://rapidapi.com/backend_box/api/bulk-domain-check)
4. Add your API key to the `.env` file

## Integration with Main Application

These tools are provided as utilities and can be:
1. Run independently for quick domain checks
2. Integrated into custom workflows
3. Used as reference implementations for additional features

The main domain_fetcher application already includes comprehensive domain checking functionality through its web interface and API endpoints.

## Files Description

- `check_domain.py` - Simple command-line interface for Python checker
- `domain_checker.py` - Main Python domain checker class
- `domain-checker.js` - Node.js domain checker class
- `domain-checker-config.js` - Configuration for RapidAPI services
- `domain-checker-example.js` - Example usage of Node.js checker
- `requirements_domain_checker.txt` - Python dependencies
- `README-domain-checker.md` - Original Node.js checker documentation

## Examples

### Python Example
```bash
# Check multiple domains
cd utils/external-tools
python3 check_domain.py mynewdomain.com example.net coolsite.io

# Result:
# 🔍 Domain Availability Check Results:
#
# mynewdomain.com               ✅ AVAILABLE
#                               Method: whois_library
#
# example.net                   ❌ TAKEN
#                               Method: whois_library
```

### Node.js Example
```bash
# Run the example script
cd utils/external-tools
node domain-checker-example.js
```

## Rate Limiting

Both tools implement rate limiting to respect API quotas:
- Python checker: 0.5-1.0 second delays between requests
- Node.js checker: 1.0 second delays between requests (configurable)

## Error Handling

Both tools include comprehensive error handling:
- Network timeouts
- API rate limit responses
- Invalid domain name formats
- Missing API keys
- DNS resolution failures

## Support

These tools are provided as-is for utility purposes. For production domain checking, use the main domain_fetcher application's web interface and API endpoints which include additional features like:
- User authentication
- Request tracking
- Database storage
- Advanced analytics
- Rate limiting per user
- Payment processing