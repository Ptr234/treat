'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type DisplaySettings = { largeText: boolean; highContrast: boolean; lowBandwidth: boolean };
const DEFAULT_SETTINGS: DisplaySettings = { largeText: false, highContrast: false, lowBandwidth: false };

export default function AccessTools() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('osc-display-settings');
      if (saved) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
    } catch { /* Keep the accessible defaults when storage is unavailable. */ }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('large-text', settings.largeText);
    root.classList.toggle('high-contrast', settings.highContrast);
    root.classList.toggle('low-bandwidth', settings.lowBandwidth);
    try { localStorage.setItem('osc-display-settings', JSON.stringify(settings)); } catch { /* Storage is optional. */ }
  }, [settings]);

  const toggle = (key: keyof DisplaySettings) => setSettings((current) => ({ ...current, [key]: !current[key] }));

  return (
    <div className="access-tools border-b border-neutral-200 bg-neutral-50 text-xs text-neutral-700">
      <div className="mx-auto flex min-h-10 max-w-6xl flex-wrap items-center justify-between gap-x-5 gap-y-2 px-4 py-2 sm:px-6 lg:px-8">
        <p className="font-semibold">Official government service · Republic of Uganda</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <details className="relative">
            <summary className="cursor-pointer font-semibold underline underline-offset-2">Language support</summary>
            <div className="absolute right-0 z-[60] mt-2 w-64 border border-neutral-200 bg-white p-4 shadow-lg">
              <p className="font-semibold text-neutral-900">Website language: English</p>
              <p className="mt-2 leading-5">For assistance in another language, use the chat assistant’s language selector.</p>
              <Link className="mt-3 inline-block font-semibold text-red-700 underline underline-offset-2" href="/chatbot">Open language support</Link>
            </div>
          </details>
          <button type="button" aria-pressed={settings.largeText} onClick={() => toggle('largeText')} className="font-semibold underline underline-offset-2">{settings.largeText ? 'Use standard text' : 'Use larger text'}</button>
          <button type="button" aria-pressed={settings.highContrast} onClick={() => toggle('highContrast')} className="font-semibold underline underline-offset-2">{settings.highContrast ? 'High contrast: on' : 'High contrast'}</button>
          <button type="button" aria-pressed={settings.lowBandwidth} onClick={() => toggle('lowBandwidth')} className="font-semibold underline underline-offset-2">{settings.lowBandwidth ? 'Low bandwidth: on' : 'Low bandwidth'}</button>
          <button type="button" onClick={() => window.print()} className="font-semibold underline underline-offset-2">Print page</button>
        </div>
      </div>
    </div>
  );
}
