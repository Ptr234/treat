'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  // Mock user data - will be replaced with real authentication in Phase 3
  const mockUser = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+256 700 123 456',
    company: 'Doe Enterprises Ltd',
    registrationDate: '2024-01-15',
    status: 'Active',
    applications: [
      {
        id: 'BR-2024-001',
        type: 'Business Registration',
        status: 'Approved',
        date: '2024-01-15',
        documents: 4
      },
      {
        id: 'IL-2024-002',
        type: 'Investment License',
        status: 'In Review',
        date: '2024-03-10',
        documents: 8
      },
      {
        id: 'TC-2024-003',
        type: 'Tax Certificate',
        status: 'Pending',
        date: '2024-09-01',
        documents: 3
      }
    ]
  };

  // Form state
  const [name, setName] = useState(mockUser.name);
  const [email, setEmail] = useState(mockUser.email);
  const [phone, setPhone] = useState(mockUser.phone);

  // Notification preferences state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [marketingComms, setMarketingComms] = useState(false);
  const [systemNotifications, setSystemNotifications] = useState(true);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false
  });

  // Original values for cancel
  const [originalValues, setOriginalValues] = useState({
    name: mockUser.name,
    email: mockUser.email,
    phone: mockUser.phone,
    emailNotifications: true,
    smsNotifications: true,
    marketingComms: false,
    systemNotifications: true
  });

  // Load saved data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('profileData');
    if (saved) {
      const data = JSON.parse(saved);
      setName(data.name);
      setEmail(data.email);
      setPhone(data.phone);
      setEmailNotifications(data.emailNotifications);
      setSmsNotifications(data.smsNotifications);
      setMarketingComms(data.marketingComms);
      setSystemNotifications(data.systemNotifications);
      setOriginalValues(data);
    }
  }, []);

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast({ message: '', visible: false });
    }, 3000);
  };

  const handleEditProfile = () => {
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = () => {
    const profileData = {
      name,
      email,
      phone,
      emailNotifications,
      smsNotifications,
      marketingComms,
      systemNotifications
    };
    localStorage.setItem('profileData', JSON.stringify(profileData));
    setOriginalValues(profileData);
    setIsEditing(false);
    showToast('Profile updated successfully');
  };

  const handleCancel = () => {
    setName(originalValues.name);
    setEmail(originalValues.email);
    setPhone(originalValues.phone);
    setEmailNotifications(originalValues.emailNotifications);
    setSmsNotifications(originalValues.smsNotifications);
    setMarketingComms(originalValues.marketingComms);
    setSystemNotifications(originalValues.systemNotifications);
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-yellow-100 text-neutral-800 border-yellow-200';
      case 'in review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center mb-6 lg:mb-0">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mr-6">
                <span className="text-2xl font-bold text-primary-600">
                  {name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {name}
                </h1>
                <p className="text-gray-600">{email}</p>
                <p className="text-gray-600">{mockUser.company}</p>
                <div className="flex items-center mt-2">
                  <span className="bg-yellow-100 text-neutral-800 px-3 py-1 rounded-full text-sm font-medium">
                    {mockUser.status}
                  </span>
                  <span className="text-gray-500 text-sm ml-3">
                    Member since {new Date(mockUser.registrationDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleEditProfile}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                {isEditing ? 'Editing...' : 'Edit Profile'}
              </button>
              <button
                onClick={() => showToast('Certificate download will be available soon')}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Download Certificate
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Application Status */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">My Applications</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {mockUser.applications.map((application) => (
                    <div key={application.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {application.type}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(application.status)}`}>
                            {application.status}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-1">
                          Application ID: {application.id}
                        </p>
                        <div className="flex items-center text-gray-500 text-sm">
                          <span>Submitted: {new Date(application.date).toLocaleDateString()}</span>
                          <span className="mx-2">•</span>
                          <span>{application.documents} documents</span>
                        </div>
                      </div>
                      <div className="ml-4 flex gap-2">
                        <button
                          onClick={() => showToast('Application details view coming soon')}
                          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => showToast('Document download coming soon')}
                          className="text-gray-600 hover:text-gray-700 font-medium text-sm"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Link
                    href="/business/registration"
                    className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                  >
                    Start New Application
                  </Link>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3"></div>
                    <div>
                      <p className="text-gray-900 font-medium">Business Registration Approved</p>
                      <p className="text-gray-600 text-sm">Your business registration for Doe Enterprises Ltd has been approved</p>
                      <p className="text-gray-500 text-xs mt-1">2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3"></div>
                    <div>
                      <p className="text-gray-900 font-medium">Investment License Under Review</p>
                      <p className="text-gray-600 text-sm">Your investment license application is currently being reviewed</p>
                      <p className="text-gray-500 text-xs mt-1">1 week ago</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                    <div>
                      <p className="text-gray-900 font-medium">Documents Uploaded</p>
                      <p className="text-gray-600 text-sm">Additional documents uploaded for investment license application</p>
                      <p className="text-gray-500 text-xs mt-1">2 weeks ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6 space-y-4">
                <Link
                  href="/business/registration"
                  className="block w-full bg-primary-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  New Application
                </Link>
                <Link
                  href="/tools"
                  className="block w-full bg-gray-100 text-gray-700 text-center py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Investment Tools
                </Link>
                <Link
                  href="/downloads"
                  className="block w-full bg-gray-100 text-gray-700 text-center py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Download Forms
                </Link>
                <Link
                  href="/support"
                  className="block w-full bg-gray-100 text-gray-700 text-center py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Get Support
                </Link>
              </div>
            </div>

            {/* Account Security */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Account Security</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Two-Factor Auth</span>
                  <span className="text-yellow-600 font-medium">Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Password</span>
                  <button
                    onClick={() => showToast('Password change coming in Phase 3')}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    Change
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Email Verification</span>
                  <span className="text-yellow-600 font-medium">Verified</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Phone Verification</span>
                  <button
                    onClick={() => showToast('Phone verification coming in Phase 3')}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    Verify
                  </button>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white text-center">
              <h3 className="text-lg font-bold mb-2">Need Help?</h3>
              <p className="text-primary-100 text-sm mb-4">
                Our support team is here to help you with any questions.
              </p>
              <Link
                href="/support"
                className="inline-block bg-white text-primary-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      disabled={!isEditing}
                      className="mr-3"
                    />
                    <span className="text-gray-700">Email notifications for application updates</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={smsNotifications}
                      onChange={(e) => setSmsNotifications(e.target.checked)}
                      disabled={!isEditing}
                      className="mr-3"
                    />
                    <span className="text-gray-700">SMS notifications for urgent matters</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={marketingComms}
                      onChange={(e) => setMarketingComms(e.target.checked)}
                      disabled={!isEditing}
                      className="mr-3"
                    />
                    <span className="text-gray-700">Marketing communications</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={systemNotifications}
                      onChange={(e) => setSystemNotifications(e.target.checked)}
                      disabled={!isEditing}
                      className="mr-3"
                    />
                    <span className="text-gray-700">System maintenance notifications</span>
                  </label>
                </div>
              </div>
            </div>
            {isEditing && (
              <div className="mt-8 flex gap-4">
                <button
                  onClick={handleSaveChanges}
                  className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {toast.message}
        </div>
      )}
    </div>
  );
}
