import { useEffect, useRef } from 'react';
import { voiceManager } from './WebSpeechVoiceUtils';

export default function LoadingVoice({ isLoading, gender = 'female', autoSpeak = true }) {
  const hasSpokenRef = useRef(false);

  useEffect(() => {
    if (isLoading && autoSpeak && !hasSpokenRef.current) {
      hasSpokenRef.current = true;
      voiceManager.speakLoadingMessage({ gender });
    }
    
    if (!isLoading) {
      hasSpokenRef.current = false;
      voiceManager.stop();
    }
  }, [isLoading, autoSpeak, gender]);

  return null;
}

export function speakLoadingPhrase(gender = 'female') {
  return voiceManager.speakLoadingMessage({ gender });
}