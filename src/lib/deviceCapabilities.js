export function detectDeviceCapabilities() {
  const nav = typeof navigator !== 'undefined' ? navigator : undefined;
  const win = typeof window !== 'undefined' ? window : undefined;

  return {
    camera: !!nav?.mediaDevices?.getUserMedia,
    microphone: !!nav?.mediaDevices?.getUserMedia,
    geolocation: !!nav?.geolocation,
    vibration: !!nav?.vibrate,
    bluetooth: !!nav?.bluetooth,
    share: !!nav?.share,
    notifications: !!win?.Notification,
    wakeLock: !!nav?.wakeLock,
    speechRecognition: !!(win?.SpeechRecognition || win?.webkitSpeechRecognition),
    speechSynthesis: !!win?.speechSynthesis,
    storage: !!win?.localStorage,
    connection: !!nav?.connection,
    clipboard: !!nav?.clipboard,
    deviceMemory: nav?.deviceMemory || null,
    maxTouchPoints: nav?.maxTouchPoints || 0,
    wearableLikely: !!(nav?.bluetooth || nav?.hid || nav?.usb)
  };
}

export function getCapabilityStatus(required = [], detected = detectDeviceCapabilities()) {
  return required.map((key) => ({
    key,
    available: Boolean(detected[key]),
  }));
}
