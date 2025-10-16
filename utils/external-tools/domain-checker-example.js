// Example usage of Domain Availability Checker
require('dotenv').config();
const DomainAvailabilityChecker = require('./domain-checker');

async function main() {
  const checker = new DomainAvailabilityChecker();

  try {
    console.log('🔍 Domain Availability Checker Demo\n');

    // Example 1: Check single domain
    console.log('1. Checking single domain...');
    const singleResult = await checker.checkDomain('example-test-domain-123.com');
    console.log('Result:', singleResult);
    console.log('');

    // Example 2: Search for domain suggestions
    console.log('2. Searching for domain suggestions...');
    const searchResults = await checker.searchDomains('myawesomeapp', ['com', 'net', 'io']);
    console.log('Search results:', searchResults.slice(0, 5)); // Show first 5 results
    console.log('');

    // Example 3: Generate and check multiple domains
    console.log('3. Checking multiple domain variations...');
    const baseName = 'mynewstartup';
    const suggestions = checker.generateDomainSuggestions(baseName);

    console.log('Generated suggestions:', suggestions);

    // Check each suggestion (one by one to avoid rate limits)
    for (const domain of suggestions.slice(0, 3)) { // Check first 3 to avoid rate limits
      console.log(`Checking ${domain}...`);
      const result = await checker.checkDomain(domain);
      console.log(`${domain}: ${result.available ? '✅ Available' : '❌ Not Available'}`);

      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Example 4: Validate domain names
    console.log('\n4. Domain validation examples:');
    const testDomains = ['valid-domain.com', 'invalid..domain', 'good-site.io', ''];
    testDomains.forEach(domain => {
      const isValid = checker.isValidDomainName(domain);
      console.log(`${domain}: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
    console.log('\n💡 Make sure to:');
    console.log('1. Set your RAPIDAPI_KEY in .env file');
    console.log('2. Subscribe to the Domain Availability API on RapidAPI');
    console.log('3. Install dependencies: npm install axios dotenv');
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = main;