'use client';

import { useEffect, useState, useCallback } from 'react';

export function useDIDAgent() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // आधीच script आहे का ते check कर
    if (document.getElementById('did-agent-script')) {
      setIsReady(true);
      return;
    }

    // D-ID Script create कर
    const script = document.createElement('script');
    script.id = 'did-agent-script';
    script.type = 'module';
    script.src = 'https://agent.d-id.com/v2/index.js';
    
    // Data attributes set कर
    script.setAttribute('data-mode', 'fabio');
    script.setAttribute('data-client-key', 'ck_y5RkE0IVdM24mck0V3gr6');
    script.setAttribute('data-agent-id', 'v2_agt_4ddTie0Z');
    script.setAttribute('data-name', 'did-agent');
    script.setAttribute('data-monitor', 'true');
    script.setAttribute('data-orientation', 'horizontal');
    script.setAttribute('data-position', 'right');
    script.setAttribute('data-open-mode', 'expanded');

    script.onload = () => {
      console.log('✅ D-ID Agent script loaded!');
      setIsReady(true);
    };

    script.onerror = () => {
      console.error('❌ D-ID Agent script failed to load');
    };

    document.body.appendChild(script);

    return () => {
      const existing = document.getElementById('did-agent-script');
      if (existing) existing.remove();
    };
  }, []);

  // Agent ला बोलायला सांग
  const speak = useCallback((text: string) => {
    const trySpeak = () => {
      const agent = document.querySelector('did-agent') as any;
      if (agent && agent.sendMessage) {
        agent.sendMessage(text);
        console.log('🎤 Agent speaking:', text);
        return true;
      }
      return false;
    };

    let attempts = 0;
    const interval = setInterval(() => {
      if (trySpeak() || attempts > 10) {
        clearInterval(interval);
      }
      attempts++;
    }, 500);
  }, []);

  return { isReady, speak };
}