import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const About = () => {
  const { isDarkMode } = useTheme();

  const stats = [
    { label: 'Domains Analyzed', value: '2.5M+' },
    { label: 'Active Users', value: '50K+' },
    { label: 'Countries Served', value: '120+' },
    { label: 'Uptime', value: '99.9%' }
  ];

  const team = [
    {
      name: 'Alex Chen',
      role: 'CEO & Founder',
      bio: 'Former domain investor with 15+ years of experience. Led product teams at major tech companies.',
      image: '👨‍💼'
    },
    {
      name: 'Sarah Johnson',
      role: 'CTO',
      bio: 'AI and machine learning expert. Previously built analytics platforms for Fortune 500 companies.',
      image: '👩‍💻'
    },
    {
      name: 'Mike Rodriguez',
      role: 'Head of Data Science',
      bio: 'PhD in Computer Science. Specializes in domain valuation algorithms and predictive modeling.',
      image: '👨‍🔬'
    },
    {
      name: 'Emma Williams',
      role: 'Head of Product',
      bio: 'UX expert with a passion for making complex data accessible. Previously at leading design agencies.',
      image: '👩‍🎨'
    }
  ];

  const features = [
    {
      icon: '🔍',
      title: 'Advanced AI Analysis',
      description: 'Our proprietary AI algorithms analyze millions of data points to provide accurate domain valuations and insights.'
    },
    {
      icon: '📊',
      title: 'Real-time Data',
      description: 'Access live market data, availability checks, and pricing information from multiple sources instantly.'
    },
    {
      icon: '🛡️',
      title: 'Enterprise Security',
      description: 'Bank-grade security with encrypted data storage, secure APIs, and compliance with international standards.'
    },
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Optimized infrastructure delivers results in milliseconds, not minutes. Built for scale and performance.'
    },
    {
      icon: '🤝',
      title: 'Expert Support',
      description: 'Our team of domain experts and data scientists are here to help you make informed decisions.'
    },
    {
      icon: '🌍',
      title: 'Global Coverage',
      description: 'Comprehensive data coverage across all major TLDs and international domain markets.'
    }
  ];

  const timeline = [
    {
      year: '2020',
      title: 'Company Founded',
      description: 'Started with a vision to democratize domain intelligence and make professional tools accessible to everyone.'
    },
    {
      year: '2021',
      title: 'AI Engine Launch',
      description: 'Launched our first AI-powered domain analysis engine with proprietary scoring algorithms.'
    },
    {
      year: '2022',
      title: 'Enterprise Features',
      description: 'Added enterprise-grade features including API access, bulk analysis, and team collaboration tools.'
    },
    {
      year: '2023',
      title: 'Global Expansion',
      description: 'Expanded to serve customers in over 120 countries with localized data and multi-language support.'
    },
    {
      year: '2024',
      title: 'Market Leadership',
      description: 'Became the leading platform for domain intelligence with 50,000+ active users and 2.5M+ domains analyzed.'
    }
  ];

  return (
    <div className={`min-h-screen ${
      isDarkMode ? 'bg-gray-900' : 'bg-white'
    }`}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              About Domain Intelligence
            </h1>
            <p className={`text-xl sm:text-2xl mb-8 max-w-3xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              We're on a mission to democratize domain intelligence and empower everyone
              with professional-grade tools for smarter domain decisions.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className={`py-16 ${
        isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-3xl sm:text-4xl font-bold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {stat.value}
                </div>
                <div className={`text-sm sm:text-base ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className={`text-3xl sm:text-4xl font-bold mb-6 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Our Mission
              </h2>
              <p className={`text-lg mb-6 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                The domain industry has long been dominated by expensive, complex tools
                that were only accessible to large organizations and experienced investors.
                We believe everyone should have access to professional-grade domain intelligence.
              </p>
              <p className={`text-lg mb-6 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Our platform combines cutting-edge AI, comprehensive data sources, and
                intuitive design to make domain research, analysis, and investment
                accessible to entrepreneurs, small businesses, and domain professionals alike.
              </p>
              <p className={`text-lg ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                We're not just building software – we're building the future of how
                people discover, evaluate, and invest in domain names.
              </p>
            </div>
            <div className="relative">
              <div className={`rounded-2xl p-8 ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
                <div className="text-6xl mb-4 text-center">🚀</div>
                <h3 className={`text-xl font-semibold mb-4 text-center ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Vision 2025
                </h3>
                <p className={`text-center ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  To become the world's most trusted platform for domain intelligence,
                  serving millions of users and facilitating billions in domain transactions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className={`py-20 ${
        isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              What Makes Us Different
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              We've built the most comprehensive and user-friendly domain intelligence
              platform from the ground up.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl transition-all duration-200 hover:shadow-xl ${
                  isDarkMode
                    ? 'bg-gray-900 border border-gray-700'
                    : 'bg-white border border-gray-200 shadow-lg'
                }`}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className={`text-xl font-semibold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {feature.title}
                </h3>
                <p className={`${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Meet Our Team
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              We're a diverse team of domain experts, data scientists, and engineers
              passionate about building the best tools for the domain industry.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className={`text-center p-6 rounded-xl transition-all duration-200 hover:shadow-lg ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'
                }`}
              >
                <div className="text-6xl mb-4">{member.image}</div>
                <h3 className={`text-xl font-semibold mb-1 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {member.name}
                </h3>
                <p className={`text-blue-600 font-medium mb-3`}>
                  {member.role}
                </p>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className={`py-20 ${
        isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
      }`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Our Journey
            </h2>
            <p className={`text-xl ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              From startup to industry leader in just a few years
            </p>
          </div>

          <div className="space-y-8">
            {timeline.map((event, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 w-24 text-right mr-8">
                  <span className={`text-lg font-bold ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    {event.year}
                  </span>
                </div>
                <div className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-600 mt-2 mr-8"></div>
                <div className="flex-1">
                  <h3 className={`text-xl font-semibold mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {event.title}
                  </h3>
                  <p className={`${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {event.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Our Values
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className={`text-xl font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Accuracy First
              </h3>
              <p className={`${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                We prioritize data accuracy and reliable insights over flashy features.
                Our users depend on us for critical business decisions.
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">🌟</div>
              <h3 className={`text-xl font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                User-Centric Design
              </h3>
              <p className={`${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Every feature we build starts with understanding our users' needs.
                We believe powerful tools should be simple to use.
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">🔮</div>
              <h3 className={`text-xl font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Innovation
              </h3>
              <p className={`${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                We continuously push the boundaries of what's possible with AI,
                data science, and user experience design.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className={`py-20 ${
        isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
      }`}>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className={`text-3xl sm:text-4xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Ready to Experience the Difference?
          </h2>
          <p className={`text-xl mb-8 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Join thousands of domain professionals who trust our platform for their
            domain intelligence needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold text-lg rounded-xl hover:bg-blue-700 transition-colors duration-200"
            >
              Get Started Free
            </a>
            <a
              href="/contact"
              className={`inline-block px-8 py-3 font-semibold text-lg rounded-xl border-2 transition-colors duration-200 ${
                isDarkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;