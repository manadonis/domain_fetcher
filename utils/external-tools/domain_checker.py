#!/usr/bin/env python3
"""
Python Domain Availability Checker
Supports multiple APIs and fallback methods for checking domain availability.
"""

import os
import re
import requests
import time
import json
from typing import List, Dict, Optional, Union
from dataclasses import dataclass
import whois
import socket
from urllib.parse import urlparse


@dataclass
class DomainResult:
    """Data class for domain check results"""
    domain: str
    available: Optional[bool] = None
    status: Optional[str] = None
    error: Optional[str] = None
    details: Optional[Dict] = None
    method: Optional[str] = None


class DomainChecker:
    """
    Comprehensive domain availability checker with multiple fallback methods
    """

    def __init__(self):
        self.rapidapi_key = os.getenv('RAPIDAPI_KEY')
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })

        # API configurations
        self.apis = {
            'whoisapi': {
                'url': 'https://whois-lookup4.p.rapidapi.com/domain',
                'headers': {
                    'X-RapidAPI-Key': self.rapidapi_key,
                    'X-RapidAPI-Host': 'whois-lookup4.p.rapidapi.com'
                }
            },
            'domaindb': {
                'url': 'https://domaindb.p.rapidapi.com',
                'headers': {
                    'X-RapidAPI-Key': self.rapidapi_key,
                    'X-RapidAPI-Host': 'domaindb.p.rapidapi.com'
                }
            }
        }

    def is_valid_domain(self, domain: str) -> bool:
        """Validate domain name format"""
        if not domain or len(domain) > 253:
            return False

        # Basic domain regex
        pattern = r'^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.([a-zA-Z]{2,})$'
        return bool(re.match(pattern, domain))

    def check_domain_whois(self, domain: str) -> DomainResult:
        """Check domain using python-whois library"""
        try:
            w = whois.whois(domain)

            # If domain_name is None or empty, it's likely available
            if not w.domain_name:
                return DomainResult(
                    domain=domain,
                    available=True,
                    status='AVAILABLE',
                    method='whois_library',
                    details={'whois_data': 'No registration found'}
                )

            # If we get domain data, it's registered
            return DomainResult(
                domain=domain,
                available=False,
                status='REGISTERED',
                method='whois_library',
                details={
                    'registrar': w.registrar,
                    'creation_date': str(w.creation_date) if w.creation_date else None,
                    'expiration_date': str(w.expiration_date) if w.expiration_date else None
                }
            )

        except whois.parser.PywhoisError as e:
            if "No match" in str(e) or "not found" in str(e).lower():
                return DomainResult(
                    domain=domain,
                    available=True,
                    status='AVAILABLE',
                    method='whois_library'
                )
            else:
                return DomainResult(
                    domain=domain,
                    available=None,
                    error=f"WHOIS error: {str(e)}",
                    method='whois_library'
                )
        except Exception as e:
            return DomainResult(
                domain=domain,
                available=None,
                error=f"WHOIS check failed: {str(e)}",
                method='whois_library'
            )

    def check_domain_dns(self, domain: str) -> DomainResult:
        """Check domain using DNS resolution"""
        try:
            # Try to resolve the domain
            socket.gethostbyname(domain)
            return DomainResult(
                domain=domain,
                available=False,
                status='REGISTERED',
                method='dns_resolution',
                details={'dns_resolves': True}
            )
        except socket.gaierror:
            # DNS resolution failed, might be available
            return DomainResult(
                domain=domain,
                available=True,
                status='AVAILABLE',
                method='dns_resolution',
                details={'dns_resolves': False}
            )
        except Exception as e:
            return DomainResult(
                domain=domain,
                available=None,
                error=f"DNS check failed: {str(e)}",
                method='dns_resolution'
            )

    def check_domain_rapidapi(self, domain: str, api_name: str = 'whoisapi') -> DomainResult:
        """Check domain using RapidAPI services"""
        if not self.rapidapi_key:
            return DomainResult(
                domain=domain,
                available=None,
                error="RapidAPI key not found in environment variables",
                method=f'rapidapi_{api_name}'
            )

        try:
            api_config = self.apis.get(api_name)
            if not api_config:
                return DomainResult(
                    domain=domain,
                    available=None,
                    error=f"Unknown API: {api_name}",
                    method=f'rapidapi_{api_name}'
                )

            if api_name == 'whoisapi':
                response = self.session.get(
                    api_config['url'],
                    params={'domain': domain},
                    headers=api_config['headers'],
                    timeout=10
                )
            else:
                response = self.session.get(
                    f"{api_config['url']}/{domain}",
                    headers=api_config['headers'],
                    timeout=10
                )

            response.raise_for_status()
            data = response.json()

            # Parse response based on API
            if api_name == 'whoisapi':
                # Look for registration info
                if 'registrar' in data or 'creation_date' in data:
                    available = False
                    status = 'REGISTERED'
                else:
                    available = True
                    status = 'AVAILABLE'
            else:
                # Generic parsing
                available = not bool(data.get('registered', True))
                status = 'AVAILABLE' if available else 'REGISTERED'

            return DomainResult(
                domain=domain,
                available=available,
                status=status,
                method=f'rapidapi_{api_name}',
                details=data
            )

        except requests.exceptions.RequestException as e:
            return DomainResult(
                domain=domain,
                available=None,
                error=f"API request failed: {str(e)}",
                method=f'rapidapi_{api_name}'
            )
        except Exception as e:
            return DomainResult(
                domain=domain,
                available=None,
                error=f"API check failed: {str(e)}",
                method=f'rapidapi_{api_name}'
            )

    def check_domain(self, domain: str, methods: List[str] = None) -> DomainResult:
        """
        Check domain availability using multiple methods

        Args:
            domain: Domain name to check
            methods: List of methods to try ['whois', 'dns', 'rapidapi']
        """
        if not self.is_valid_domain(domain):
            return DomainResult(
                domain=domain,
                available=None,
                error="Invalid domain format"
            )

        if methods is None:
            methods = ['whois', 'dns', 'rapidapi']

        last_result = None

        for method in methods:
            try:
                if method == 'whois':
                    result = self.check_domain_whois(domain)
                elif method == 'dns':
                    result = self.check_domain_dns(domain)
                elif method == 'rapidapi':
                    result = self.check_domain_rapidapi(domain)
                else:
                    continue

                last_result = result

                # If we got a definitive answer, return it
                if result.available is not None and not result.error:
                    return result

                # Add small delay between methods
                time.sleep(0.5)

            except Exception as e:
                continue

        # Return the last result if no definitive answer
        return last_result or DomainResult(
            domain=domain,
            available=None,
            error="All methods failed"
        )

    def check_multiple_domains(self, domains: List[str], delay: float = 1.0) -> List[DomainResult]:
        """Check multiple domains with rate limiting"""
        results = []

        for domain in domains:
            result = self.check_domain(domain)
            results.append(result)

            # Rate limiting
            if delay > 0:
                time.sleep(delay)

        return results

    def generate_domain_suggestions(self, base_name: str, tlds: List[str] = None) -> List[str]:
        """Generate domain name suggestions"""
        if tlds is None:
            tlds = ['com', 'net', 'org', 'io', 'co', 'app', 'dev', 'tech']

        suggestions = []

        # Basic suggestions
        for tld in tlds:
            suggestions.append(f"{base_name}.{tld}")

        # Add some variations
        variations = [
            f"get{base_name}",
            f"{base_name}app",
            f"{base_name}hq",
            f"{base_name}pro",
            f"my{base_name}",
            f"{base_name}online"
        ]

        for variation in variations[:3]:  # Limit variations
            for tld in tlds[:4]:  # Limit TLDs for variations
                suggestions.append(f"{variation}.{tld}")

        return suggestions

    def search_available_domains(self, base_name: str, max_results: int = 10) -> List[DomainResult]:
        """Search for available domains based on a base name"""
        suggestions = self.generate_domain_suggestions(base_name)
        available_domains = []

        for domain in suggestions:
            if len(available_domains) >= max_results:
                break

            result = self.check_domain(domain)
            if result.available:
                available_domains.append(result)

            # Rate limiting
            time.sleep(0.8)

        return available_domains


def main():
    """Example usage of the domain checker"""
    checker = DomainChecker()

    print("🔍 Python Domain Availability Checker\n")

    # Example 1: Check single domain
    print("1. Checking single domain...")
    result = checker.check_domain('example-test-domain-12345.com')
    print(f"Domain: {result.domain}")
    print(f"Available: {'✅ Yes' if result.available else '❌ No' if result.available is False else '❓ Unknown'}")
    print(f"Method: {result.method}")
    if result.error:
        print(f"Error: {result.error}")
    print()

    # Example 2: Check multiple domains
    print("2. Checking multiple domains...")
    test_domains = ['google.com', 'definitely-not-taken-domain-12345.com', 'facebook.com']
    results = checker.check_multiple_domains(test_domains, delay=0.5)

    for result in results:
        status = '✅ Available' if result.available else '❌ Taken' if result.available is False else '❓ Unknown'
        print(f"{result.domain}: {status}")
    print()

    # Example 3: Generate suggestions
    print("3. Generating domain suggestions...")
    base_name = "mynewapp"
    suggestions = checker.generate_domain_suggestions(base_name, ['com', 'io', 'app'])
    print(f"Suggestions for '{base_name}':")
    for suggestion in suggestions[:8]:
        print(f"  - {suggestion}")
    print()

    # Example 4: Search for available domains
    print("4. Searching for available domains...")
    print("(This may take a while due to rate limiting)")
    available = checker.search_available_domains("techstartup", max_results=3)

    if available:
        print("Available domains found:")
        for result in available:
            print(f"  ✅ {result.domain}")
    else:
        print("No available domains found in the search")


if __name__ == "__main__":
    main()