#!/usr/bin/env python3
"""
Simple domain checker script - easy command line usage
Usage: python check_domain.py domain1.com domain2.net
"""

import sys
from domain_checker import DomainChecker


def main():
    if len(sys.argv) < 2:
        print("Usage: python check_domain.py <domain1> <domain2> ...")
        print("Example: python check_domain.py google.com mynewdomain.com")
        sys.exit(1)

    checker = DomainChecker()
    domains = sys.argv[1:]

    print("🔍 Domain Availability Check Results:\n")

    for domain in domains:
        result = checker.check_domain(domain)

        if result.available is True:
            status = "✅ AVAILABLE"
        elif result.available is False:
            status = "❌ TAKEN"
        else:
            status = f"❓ UNKNOWN ({result.error})"

        print(f"{domain:<30} {status}")
        if result.method:
            print(f"{'':30} Method: {result.method}")
        print()


if __name__ == "__main__":
    main()