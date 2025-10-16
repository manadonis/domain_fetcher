import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { isDarkMode, toggleTheme, applyColorScheme, colorSchemes } = useTheme();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    company: user?.company || '',
    website: user?.website || '',
    bio: user?.bio || ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      company: user?.company || '',
      website: user?.website || '',
      bio: user?.bio || ''
    });
    setIsEditing(false);
  };

  const subscriptionPlan = user?.subscription?.plan || 'free';
  const usageStats = user?.usage || {};

  return (
    <div className={`min-h-screen ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Profile Settings
          </h1>
          <p className={`mt-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className={`p-6 rounded-xl ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Personal Information
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancel}
                      className={`px-4 py-2 border rounded-lg transition-colors duration-200 ${
                        isDarkMode
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
                    >
                      {isLoading ? <LoadingSpinner size="sm" /> : 'Save'}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  ) : (
                    <p className={`py-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {user?.firstName || 'Not provided'}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  ) : (
                    <p className={`py-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {user?.lastName || 'Not provided'}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  ) : (
                    <p className={`py-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {user?.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Company
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  ) : (
                    <p className={`py-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {user?.company || 'Not provided'}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Website
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  ) : (
                    <p className={`py-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {user?.website || 'Not provided'}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      rows={3}
                      value={formData.bio}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  ) : (
                    <p className={`py-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {user?.bio || 'Not provided'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Theme Settings */}
            <div className={`p-6 rounded-xl ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              <h2 className={`text-xl font-semibold mb-6 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Appearance Settings
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Dark Mode
                    </h3>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Toggle between light and dark themes
                    </p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ${
                      isDarkMode ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                        isDarkMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <h3 className={`font-medium mb-3 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Color Scheme
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(colorSchemes).map(([name, scheme]) => (
                      <button
                        key={name}
                        onClick={() => applyColorScheme(name)}
                        className={`p-2 rounded-lg border transition-all duration-200 ${
                          isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex space-x-1">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: scheme.primary }}
                          />
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: scheme.accent }}
                          />
                        </div>
                        <p className={`text-xs mt-1 capitalize ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {name}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscription Plan */}
            <div className={`p-6 rounded-xl ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Subscription Plan
              </h3>
              <div className={`p-4 rounded-lg ${
                subscriptionPlan === 'free'
                  ? isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                  : isDarkMode ? 'bg-blue-900' : 'bg-blue-100'
              }`}>
                <p className={`font-semibold capitalize ${
                  subscriptionPlan === 'free'
                    ? isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    : isDarkMode ? 'text-blue-200' : 'text-blue-800'
                }`}>
                  {subscriptionPlan} Plan
                </p>
                {subscriptionPlan !== 'free' && (
                  <p className={`text-sm ${
                    isDarkMode ? 'text-blue-300' : 'text-blue-600'
                  }`}>
                    Next billing: {new Date(user?.subscription?.nextBilling).toLocaleDateString()}
                  </p>
                )}
              </div>
              <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                {subscriptionPlan === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}
              </button>
            </div>

            {/* Usage Statistics */}
            <div className={`p-6 rounded-xl ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Usage This Month
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                      Domain Searches
                    </span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      {usageStats.searches || 0} / {user?.subscription?.limits?.searches || 50}
                    </span>
                  </div>
                  <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2`}>
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, ((usageStats.searches || 0) / (user?.subscription?.limits?.searches || 50)) * 100)}%`
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                      Domain Analyses
                    </span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      {usageStats.analyses || 0} / {user?.subscription?.limits?.analyses || 10}
                    </span>
                  </div>
                  <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2`}>
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, ((usageStats.analyses || 0) / (user?.subscription?.limits?.analyses || 10)) * 100)}%`
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                      CSV Exports
                    </span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      {usageStats.exports || 0} / {user?.subscription?.limits?.exports || 2}
                    </span>
                  </div>
                  <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2`}>
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, ((usageStats.exports || 0) / (user?.subscription?.limits?.exports || 2)) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className={`p-6 rounded-xl ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Account Actions
              </h3>
              <div className="space-y-2">
                <button className={`w-full text-left px-3 py-2 rounded transition-colors duration-200 ${
                  isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                }`}>
                  Download Data
                </button>
                <button className={`w-full text-left px-3 py-2 rounded transition-colors duration-200 ${
                  isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                }`}>
                  Change Password
                </button>
                <button className={`w-full text-left px-3 py-2 rounded transition-colors duration-200 ${
                  isDarkMode ? 'text-red-400 hover:bg-red-900' : 'text-red-600 hover:bg-red-100'
                }`}>
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;