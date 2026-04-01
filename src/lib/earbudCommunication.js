/**
 * Earbud Communication System
 * Voice interaction through earbuds like a normal phone call
 */

export class EarbudCommunication {
  constructor() {
    this.isActive = false;
    this.audioContext = null;
    this.mediaStream = null;
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.conversationMode = false;
    this.earbudConnected = false;
  }

  async initialize() {
    // Initialize audio context
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContext();

    // Initialize speech recognition
    this.initializeSpeechRecognition();

    // Check for earbud connection
    await this.detectEarbuds();

    // Set up audio routing
    await this.setupAudioRouting();
  }

  initializeSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event) => {
      this.handleSpeechResult(event);
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };

    this.recognition.onend = () => {
      if (this.conversationMode) {
        this.recognition.start(); // Restart for continuous listening
      }
    };
  }

  async detectEarbuds() {
    // Detect if earbuds/headphones are connected
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioOutputs = devices.filter(device => device.kind === 'audiooutput');
      
      // Check for Bluetooth audio devices
      this.earbudConnected = audioOutputs.some(device => 
        device.label.toLowerCase().includes('bluetooth') ||
        device.label.toLowerCase().includes('airpods') ||
        device.label.toLowerCase().includes('earbuds') ||
        device.label.toLowerCase().includes('headphones')
      );

      if (this.earbudConnected) {
        console.log('Earbuds detected:', audioOutputs);
      }

      return this.earbudConnected;

    } catch (error) {
      console.error('Error detecting earbuds:', error);
      return false;
    }
  }

  async setupAudioRouting() {
    // Route audio to earbuds if connected
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioOutputs = devices.filter(device => device.kind === 'audiooutput');
      
      // Find Bluetooth/earbud device
      const earbudDevice = audioOutputs.find(device => 
        device.label.toLowerCase().includes('bluetooth') ||
        device.label.toLowerCase().includes('airpods') ||
        device.label.toLowerCase().includes('earbuds')
      );

      if (earbudDevice && this.audioContext) {
        // Set audio output to earbuds
        await this.audioContext.setSinkId?.(earbudDevice.deviceId);
        console.log('Audio routed to earbuds:', earbudDevice.label);
      }

    } catch (error) {
      console.error('Error setting up audio routing:', error);
    }
  }

  async startConversation() {
    // Start voice conversation mode
    if (!this.recognition) {
      throw new Error('Speech recognition not available');
    }

    try {
      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      // Start listening
      this.recognition.start();
      this.conversationMode = true;
      this.isActive = true;

      // Greet user
      await this.speak('Hello! I\'m ready to help. What can I do for you?');

      return { success: true, mode: 'conversation' };

    } catch (error) {
      console.error('Failed to start conversation:', error);
      return { success: false, error: error.message };
    }
  }

  async stopConversation() {
    // Stop voice conversation mode
    if (this.recognition) {
      this.recognition.stop();
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }

    this.conversationMode = false;
    this.isActive = false;

    await this.speak('Goodbye! Let me know if you need anything else.');
  }

  async handleSpeechResult(event) {
    // Process speech recognition results
    const transcript = Array.from(event.results)
      .map(result => result[0].transcript)
      .join('');

    const isFinal = event.results[event.results.length - 1].isFinal;

    if (isFinal) {
      console.log('User said:', transcript);
      
      // Process user command
      await this.processVoiceCommand(transcript);
    }
  }

  async processVoiceCommand(command) {
    // Process voice commands and respond
    const lowerCommand = command.toLowerCase();

    // Check for wake words
    if (lowerCommand.includes('hey solace') || lowerCommand.includes('ok solace')) {
      await this.speak('Yes, I\'m listening.');
      return;
    }

    // Safety commands (highest priority)
    if (lowerCommand.includes('help') || lowerCommand.includes('emergency') || lowerCommand.includes('panic')) {
      await this.handleEmergency(command);
      return;
    }

    // App commands
    if (lowerCommand.includes('create app') || lowerCommand.includes('build app')) {
      await this.handleAppCreation(command);
      return;
    }

    if (lowerCommand.includes('generate movie') || lowerCommand.includes('make movie')) {
      await this.handleMovieGeneration(command);
      return;
    }

    if (lowerCommand.includes('voice') || lowerCommand.includes('speak')) {
      await this.handleVoiceGeneration(command);
      return;
    }

    // General questions - use customer service AI
    const { customerServiceAI } = await import('./customerServiceAI');
    const response = await customerServiceAI.getChatResponse('voice_user', command);
    await this.speak(response);
  }

  async handleEmergency(command) {
    // Handle emergency/panic commands
    const { customerServiceAI } = await import('./customerServiceAI');
    
    await this.speak('Activating emergency mode. Help is on the way.');
    
    await customerServiceAI.handleUserIssue('voice_user', command, {
      emergency: true,
      voiceActivated: true
    });
  }

  async handleAppCreation(command) {
    // Handle app creation via voice
    await this.speak('I\'ll help you create an app. What kind of app would you like to build?');
    
    // Extract app description from command
    const description = command.replace(/create app|build app|make app/gi, '').trim();
    
    if (description) {
      await this.speak(`Creating a ${description} app. This will take a moment.`);
      
      // Trigger app generation
      const { autonomousAppMaker } = await import('./autonomousAppMaker');
      
      autonomousAppMaker.onProgressUpdate = async ({ message, percentage }) => {
        if (percentage % 25 === 0) {
          await this.speak(`Progress: ${percentage}%. ${message}`);
        }
      };

      try {
        const app = await autonomousAppMaker.generateCompleteApp(description);
        await this.speak('Your app is ready! Check your dashboard to download it.');
      } catch (error) {
        await this.speak('Sorry, I encountered an error creating your app. Please try again.');
      }
    }
  }

  async handleMovieGeneration(command) {
    // Handle movie generation via voice
    await this.speak('I can help you create a movie. What\'s your movie about?');
    
    // Extract movie description
    const description = command.replace(/generate movie|make movie|create movie/gi, '').trim();
    
    if (description) {
      await this.speak('Creating your movie. This may take a few minutes.');
      // Movie generation would be triggered here
    }
  }

  async handleVoiceGeneration(command) {
    // Handle voice generation via voice
    await this.speak('What text would you like me to speak?');
    // Voice generation would be triggered here
  }

  async speak(text, options = {}) {
    // Speak text through earbuds
    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure voice
      const voices = this.synthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Female') || voice.name.includes('Samantha')
      ) || voices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.rate = options.rate || 1.0;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;

      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);

      this.synthesis.speak(utterance);
    });
  }

  async playNotificationSound() {
    // Play notification sound through earbuds
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.5);
  }

  async enableHandsFreeMode() {
    // Enable hands-free mode for driving/walking
    await this.startConversation();
    await this.speak('Hands-free mode enabled. I\'m listening for your commands.');
  }

  async disableHandsFreeMode() {
    // Disable hands-free mode
    await this.stopConversation();
  }

  getStatus() {
    return {
      active: this.isActive,
      conversationMode: this.conversationMode,
      earbudConnected: this.earbudConnected,
      recognitionAvailable: !!this.recognition,
      synthesisAvailable: !!this.synthesis
    };
  }
}

export const earbudCommunication = new EarbudCommunication();
