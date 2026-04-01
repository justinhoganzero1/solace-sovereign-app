/**
 * Universal Share System
 * Share to any platform, app, email, or phone number
 */

export class UniversalShare {
  constructor() {
    this.shareTargets = this.initializeShareTargets();
  }

  initializeShareTargets() {
    return {
      social: [
        { id: 'facebook', name: 'Facebook', icon: '📘', urlPattern: 'https://www.facebook.com/sharer/sharer.php?u={url}' },
        { id: 'twitter', name: 'Twitter/X', icon: '🐦', urlPattern: 'https://twitter.com/intent/tweet?url={url}&text={text}' },
        { id: 'linkedin', name: 'LinkedIn', icon: '💼', urlPattern: 'https://www.linkedin.com/sharing/share-offsite/?url={url}' },
        { id: 'reddit', name: 'Reddit', icon: '🤖', urlPattern: 'https://reddit.com/submit?url={url}&title={text}' },
        { id: 'pinterest', name: 'Pinterest', icon: '📌', urlPattern: 'https://pinterest.com/pin/create/button/?url={url}&description={text}' },
        { id: 'tumblr', name: 'Tumblr', icon: '📝', urlPattern: 'https://www.tumblr.com/widgets/share/tool?canonicalUrl={url}&caption={text}' },
        { id: 'instagram', name: 'Instagram', icon: '📷', type: 'native' },
        { id: 'snapchat', name: 'Snapchat', icon: '👻', type: 'native' },
        { id: 'tiktok', name: 'TikTok', icon: '🎵', type: 'native' },
        { id: 'whatsapp', name: 'WhatsApp', icon: '💬', urlPattern: 'https://wa.me/?text={text}%20{url}' },
        { id: 'telegram', name: 'Telegram', icon: '✈️', urlPattern: 'https://t.me/share/url?url={url}&text={text}' },
        { id: 'discord', name: 'Discord', icon: '🎮', type: 'native' },
        { id: 'slack', name: 'Slack', icon: '💼', type: 'native' },
        { id: 'wechat', name: 'WeChat', icon: '💚', type: 'native' },
        { id: 'line', name: 'LINE', icon: '💚', type: 'native' },
        { id: 'viber', name: 'Viber', icon: '💜', type: 'native' },
        { id: 'messenger', name: 'Messenger', icon: '💬', urlPattern: 'fb-messenger://share/?link={url}' }
      ],
      messaging: [
        { id: 'sms', name: 'SMS', icon: '📱', type: 'sms' },
        { id: 'email', name: 'Email', icon: '📧', type: 'email' },
        { id: 'imessage', name: 'iMessage', icon: '💬', type: 'sms' }
      ],
      productivity: [
        { id: 'gmail', name: 'Gmail', icon: '📧', urlPattern: 'https://mail.google.com/mail/?view=cm&body={text}%20{url}' },
        { id: 'outlook', name: 'Outlook', icon: '📧', urlPattern: 'https://outlook.live.com/mail/0/deeplink/compose?body={text}%20{url}' },
        { id: 'notion', name: 'Notion', icon: '📝', type: 'native' },
        { id: 'evernote', name: 'Evernote', icon: '🐘', type: 'native' },
        { id: 'onenote', name: 'OneNote', icon: '📓', type: 'native' },
        { id: 'googledrive', name: 'Google Drive', icon: '💾', type: 'native' },
        { id: 'dropbox', name: 'Dropbox', icon: '📦', type: 'native' }
      ],
      other: [
        { id: 'copy', name: 'Copy Link', icon: '📋', type: 'clipboard' },
        { id: 'qr', name: 'QR Code', icon: '📱', type: 'qr' },
        { id: 'native', name: 'More Options', icon: '⋯', type: 'native_share' }
      ]
    };
  }

  async share(content, options = {}) {
    const {
      url = window.location.href,
      title = document.title,
      text = '',
      files = [],
      target = null
    } = options;

    // If specific target is provided, use it
    if (target) {
      return this.shareToTarget(target, { url, title, text, files });
    }

    // Otherwise, show share picker
    return this.showSharePicker({ url, title, text, files });
  }

  async shareToTarget(targetId, content) {
    const target = this.findTarget(targetId);
    
    if (!target) {
      throw new Error(`Share target "${targetId}" not found`);
    }

    switch (target.type) {
      case 'email':
        return this.shareViaEmail(content);
      case 'sms':
        return this.shareViaSMS(content);
      case 'clipboard':
        return this.copyToClipboard(content.url);
      case 'qr':
        return this.generateQRCode(content.url);
      case 'native_share':
        return this.useNativeShare(content);
      case 'native':
        return this.openNativeApp(target, content);
      default:
        return this.shareViaURL(target, content);
    }
  }

  findTarget(targetId) {
    for (const category of Object.values(this.shareTargets)) {
      const target = category.find(t => t.id === targetId);
      if (target) return target;
    }
    return null;
  }

  shareViaURL(target, content) {
    const shareUrl = target.urlPattern
      .replace('{url}', encodeURIComponent(content.url))
      .replace('{text}', encodeURIComponent(content.text || content.title))
      .replace('{title}', encodeURIComponent(content.title));

    window.open(shareUrl, '_blank', 'width=600,height=400');
    return { success: true, target: target.name };
  }

  async shareViaEmail(content) {
    const subject = encodeURIComponent(content.title);
    const body = encodeURIComponent(`${content.text}\n\n${content.url}`);
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    return { success: true, target: 'Email' };
  }

  async shareViaSMS(content) {
    const message = encodeURIComponent(`${content.text} ${content.url}`);
    
    // iOS uses different URL scheme than Android
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const smsUrl = isIOS ? `sms:&body=${message}` : `sms:?body=${message}`;
    
    window.location.href = smsUrl;
    return { success: true, target: 'SMS' };
  }

  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true, target: 'Clipboard' };
    } catch (error) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return { success: true, target: 'Clipboard' };
    }
  }

  async generateQRCode(url) {
    // Generate QR code for the URL
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
    
    // Open QR code in new window
    const qrWindow = window.open('', '_blank', 'width=400,height=400');
    qrWindow.document.write(`
      <html>
        <head><title>QR Code</title></head>
        <body style="margin:0;display:flex;align-items:center;justify-content:center;background:#000;">
          <img src="${qrCodeUrl}" alt="QR Code" style="max-width:100%;max-height:100%;" />
        </body>
      </html>
    `);
    
    return { success: true, target: 'QR Code' };
  }

  async useNativeShare(content) {
    if (!navigator.share) {
      throw new Error('Native sharing not supported on this device');
    }

    try {
      const shareData = {
        title: content.title,
        text: content.text,
        url: content.url
      };

      if (content.files && content.files.length > 0) {
        shareData.files = content.files;
      }

      await navigator.share(shareData);
      return { success: true, target: 'Native Share' };
    } catch (error) {
      if (error.name === 'AbortError') {
        return { success: false, cancelled: true };
      }
      throw error;
    }
  }

  async openNativeApp(target, content) {
    // Try to open native app, fallback to web if not available
    const appSchemes = {
      instagram: 'instagram://share',
      snapchat: 'snapchat://share',
      tiktok: 'tiktok://share',
      discord: 'discord://share',
      slack: 'slack://share',
      wechat: 'weixin://share',
      line: 'line://msg/text/',
      viber: 'viber://forward'
    };

    const scheme = appSchemes[target.id];
    if (scheme) {
      window.location.href = scheme;
      
      // Fallback to web share after 2 seconds if app doesn't open
      setTimeout(() => {
        this.useNativeShare(content).catch(() => {
          alert(`Please install ${target.name} to share directly to the app`);
        });
      }, 2000);
    }

    return { success: true, target: target.name };
  }

  async showSharePicker(content) {
    // Return all available share targets for UI to display
    return {
      content,
      targets: this.shareTargets,
      share: (targetId) => this.shareToTarget(targetId, content)
    };
  }

  async shareToPhoneNumber(phoneNumber, content) {
    const message = encodeURIComponent(`${content.text} ${content.url}`);
    const smsUrl = `sms:${phoneNumber}?body=${message}`;
    
    window.location.href = smsUrl;
    return { success: true, target: `SMS to ${phoneNumber}` };
  }

  async shareToEmail(emailAddress, content) {
    const subject = encodeURIComponent(content.title);
    const body = encodeURIComponent(`${content.text}\n\n${content.url}`);
    
    window.location.href = `mailto:${emailAddress}?subject=${subject}&body=${body}`;
    return { success: true, target: `Email to ${emailAddress}` };
  }

  getAllTargets() {
    const allTargets = [];
    for (const [category, targets] of Object.entries(this.shareTargets)) {
      allTargets.push(...targets.map(t => ({ ...t, category })));
    }
    return allTargets;
  }
}

export const universalShare = new UniversalShare();
