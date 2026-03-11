'use client';

import { motion } from 'framer-motion';
import type { ChatLanguage } from '@/types';

interface LanguageSelectorProps {
  currentLanguage: ChatLanguage;
  onLanguageChange: (lang: ChatLanguage) => void;
}

const languages: { code: ChatLanguage; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'ar', label: 'AR' },
  { code: 'zh', label: 'ZH' },
  { code: 'sw', label: 'SW' },
];

export default function LanguageSelector({ currentLanguage, onLanguageChange }: LanguageSelectorProps) {
  return (
    <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-full p-1">
      {languages.map((lang) => {
        const isActive = currentLanguage === lang.code;

        return (
          <motion.button
            key={lang.code}
            onClick={() => onLanguageChange(lang.code)}
            className={`relative px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
              isActive
                ? 'text-black'
                : 'text-neutral-500 hover:text-yellow-500'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={`Switch to ${lang.label}`}
            aria-pressed={isActive}
          >
            {isActive && (
              <motion.span
                layoutId="activeLanguage"
                className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full shadow-md shadow-yellow-500/30"
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10">{lang.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
