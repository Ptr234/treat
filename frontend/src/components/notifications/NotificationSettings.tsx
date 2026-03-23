'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  categories: {
    investment: boolean;
    business: boolean;
    tax: boolean;
    government: boolean;
    system: boolean;
  };
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export default function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: true,
    push: true,
    sms: false,
    categories: {
      investment: true,
      business: true,
      tax: true,
      government: false,
      system: true,
    },
    frequency: 'immediate',
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
  });

  const [saved, setSaved] = useState(false);

  const updatePreference = <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const updateCategory = (category: keyof NotificationPreferences['categories'], value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      categories: { ...prev.categories, [category]: value }
    }));
  };

  const updateQuietHours = <K extends keyof NotificationPreferences['quietHours']>(
    key: K,
    value: NotificationPreferences['quietHours'][K]
  ) => {
    setPreferences(prev => ({
      ...prev,
      quietHours: { ...prev.quietHours, [key]: value }
    }));
  };

  const saveSettings = async () => {
    // In a real app, this would save to backend
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Notification Settings</h2>
          <p className="text-gray-600 mt-1">
            Manage how and when you receive notifications from OneStopCentre Uganda.
          </p>
        </div>

        <div className="p-6 space-y-8">
          {/* Notification Methods */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Methods</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <button
                  onClick={() => updatePreference('email', !preferences.email)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    preferences.email ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      preferences.email ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
                  <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                </div>
                <button
                  onClick={() => updatePreference('push', !preferences.push)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    preferences.push ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      preferences.push ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
                  <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                </div>
                <button
                  onClick={() => updatePreference('sms', !preferences.sms)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    preferences.sms ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      preferences.sms ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Notification Categories */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Categories</h3>
            <div className="space-y-4">
              {Object.entries(preferences.categories).map(([category, enabled]) => (
                <div key={category} className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 capitalize">
                      {category} Notifications
                    </h4>
                    <p className="text-sm text-gray-500">
                      Updates about {category} services and opportunities
                    </p>
                  </div>
                  <button
                    onClick={() => updateCategory(category as keyof NotificationPreferences['categories'], !enabled)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      enabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Frequency</h3>
            <select
              value={preferences.frequency}
              onChange={(e) => updatePreference('frequency', e.target.value as NotificationPreferences['frequency'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            >
              <option value="immediate">Immediate</option>
              <option value="daily">Daily Digest</option>
              <option value="weekly">Weekly Summary</option>
              <option value="monthly">Monthly Report</option>
            </select>
          </div>

          {/* Quiet Hours */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiet Hours</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Enable Quiet Hours</h4>
                  <p className="text-sm text-gray-500">Pause notifications during specified hours</p>
                </div>
                <button
                  onClick={() => updateQuietHours('enabled', !preferences.quietHours.enabled)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    preferences.quietHours.enabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      preferences.quietHours.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {preferences.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={preferences.quietHours.start}
                      onChange={(e) => updateQuietHours('start', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={preferences.quietHours.end}
                      onChange={(e) => updateQuietHours('end', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end">
            <motion.button
              onClick={saveSettings}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              whileHover={{ scale: saved ? 1.05 : 1 }}
            >
              {saved ? '✓ Saved!' : 'Save Settings'}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}