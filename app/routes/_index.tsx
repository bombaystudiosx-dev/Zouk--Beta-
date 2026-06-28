import { json, type MetaFunction } from '@remix-run/cloudflare';
import { useState, useEffect } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '~/components/chat/BaseChat';
import { Chat } from '~/components/chat/Chat.client';
import { Header } from '~/components/header/Header';
import { SplashScreen, shouldShowSplash } from '~/components/zouk/SplashScreen';

export const meta: MetaFunction = () => {
  return [{ title: 'Zouk' }, { name: 'description', content: 'Talk with Zouk, an AI assistant from StackBlitz' }];
};

export const loader = () => json({});

export default function Index() {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    setShowSplash(shouldShowSplash());
  }, []);

  return (
    <div className="flex flex-col h-full w-full" style={{ background: '#060606' }}>
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      <Header />
      <ClientOnly fallback={<BaseChat />}>{() => <Chat />}</ClientOnly>
    </div>
  );
}
