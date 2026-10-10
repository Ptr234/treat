'use client';

import { useState } from 'react';
import { User } from 'lucide-react';
import AuthModal from '@/components/auth/AuthModal';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import type { ChatLanguage } from '@/types';

const LABELS: Record<ChatLanguage, { title: string; body: string; signIn: string; or: string }> = {
  en: {
    title: 'Sign in to use the assistant',
    body: 'The investment assistant is available to signed-in users. Sign in or create a free account to start a conversation.',
    signIn: 'Sign in or create an account',
    or: 'or',
  },
  fr: {
    title: "Connectez-vous pour utiliser l'assistant",
    body: "L'assistant d'investissement est réservé aux utilisateurs connectés. Connectez-vous ou créez un compte gratuit pour commencer.",
    signIn: 'Se connecter ou créer un compte',
    or: 'ou',
  },
  ar: {
    title: 'سجّل الدخول لاستخدام المساعد',
    body: 'مساعد الاستثمار متاح للمستخدمين المسجلين فقط. سجّل الدخول أو أنشئ حسابًا مجانيًا لبدء المحادثة.',
    signIn: 'تسجيل الدخول أو إنشاء حساب',
    or: 'أو',
  },
  zh: {
    title: '登录后使用助手',
    body: '投资助手仅向已登录用户开放。请登录或免费注册账户后开始对话。',
    signIn: '登录或注册账户',
    or: '或',
  },
  sw: {
    title: 'Ingia ili kutumia msaidizi',
    body: 'Msaidizi wa uwekezaji unapatikana kwa watumiaji walioingia tu. Ingia au fungua akaunti bila malipo ili kuanza mazungumzo.',
    signIn: 'Ingia au fungua akaunti',
    or: 'au',
  },
};

/**
 * Shown in place of the assistant to anyone not signed in. The API refuses
 * anonymous calls too; this just explains why and offers the way in.
 */
export default function AssistantSignInGate({ language }: { language: ChatLanguage }) {
  const [showAuth, setShowAuth] = useState(false);
  const labels = LABELS[language] ?? LABELS.en;

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-white p-6 text-center" dir={language === 'ar' ? 'rtl' : undefined}>
      <div className="mb-3 flex h-14 w-14 items-center justify-center bg-black">
        <User className="h-7 w-7 text-[#ffd700]" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-bold text-black">{labels.title}</h2>
      <p className="mt-2 max-w-sm text-sm text-neutral-700">{labels.body}</p>
      <div className="mt-5 w-full max-w-xs space-y-3">
        <button type="button" onClick={() => setShowAuth(true)} className="gov-btn w-full">
          {labels.signIn}
        </button>
        <p className="text-xs text-neutral-600">{labels.or}</p>
        <GoogleSignInButton />
      </div>
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} mode="user" />
    </div>
  );
}
