/**
 * Utility functions for iOS detection and PWA-specific behaviors
 */

/**
 * Detects if the device is running iOS
 * @returns {boolean} True if the device is running iOS
 */
export const isIOS = () => {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
};

/**
 * Detects if the app is running in standalone mode (installed as PWA)
 * @returns {boolean} True if running in standalone mode
 */
export const isInStandaloneMode = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone === true;
};

/**
 * Applies iOS-specific CSS classes to elements
 * Call this function once when your app initializes
 */
export const applyIOSClasses = () => {
  if (!isIOS()) return;
  
  // Add iOS class to body for iOS-specific styling
  document.body.classList.add('ios-device');
  
  // Add standalone class if running as installed PWA
  if (isInStandaloneMode()) {
    document.body.classList.add('ios-standalone');
  }
  
  // Apply safe area padding to appropriate elements
  const header = document.querySelector('header');
  if (header) {
    header.classList.add('ios-status-bar-padding');
  }
  
  const footer = document.querySelector('footer');
  if (footer) {
    footer.classList.add('ios-bottom-bar-padding');
  }
  
  // Apply landscape padding if needed
  const sideNavs = document.querySelectorAll('.side-nav');
  sideNavs.forEach(nav => {
    if (nav.classList.contains('left')) {
      nav.classList.add('ios-landscape-padding-left');
    } else if (nav.classList.contains('right')) {
      nav.classList.add('ios-landscape-padding-right');
    }
  });
};

/**
 * Shows a prompt encouraging users to add the app to their home screen
 * Only shown on iOS Safari, not in standalone mode, and can be dismissed
 */
export const showIOSInstallPrompt = () => {
  // Only show on iOS Safari, not in standalone mode
  if (!isIOS() || isInStandaloneMode()) return;
  
  // Check if we've already shown the prompt
  const hasShownPrompt = localStorage.getItem('iosInstallPromptShown');
  if (hasShownPrompt) return;
  
  // Create and show the install prompt
  const promptElement = document.createElement('div');
  promptElement.className = 'ios-install-prompt';
  promptElement.innerHTML = `
    <div class="ios-install-prompt-content">
      <p>Install this app on your iPhone: tap <span class="share-icon">📤</span> and then "Add to Home Screen"</p>
      <button class="ios-install-prompt-close">✕</button>
    </div>
  `;
  
  document.body.appendChild(promptElement);
  
  // Add event listener to close button
  const closeButton = promptElement.querySelector('.ios-install-prompt-close');
  closeButton.addEventListener('click', () => {
    promptElement.remove();
    localStorage.setItem('iosInstallPromptShown', 'true');
  });
  
  // Auto-hide after 15 seconds
  setTimeout(() => {
    if (document.body.contains(promptElement)) {
      promptElement.remove();
    }
  }, 15000);
};

/**
 * Add styles for the iOS install prompt
 */
export const addIOSPromptStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    .ios-install-prompt {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(0, 0, 0, 0.8);
      color: white;
      border-radius: 10px;
      padding: 10px 15px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      max-width: 90%;
      width: 340px;
    }
    
    .ios-install-prompt-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .ios-install-prompt p {
      margin: 0;
      font-size: 14px;
    }
    
    .share-icon {
      font-size: 16px;
    }
    
    .ios-install-prompt-close {
      background: none;
      border: none;
      color: white;
      font-size: 16px;
      cursor: pointer;
      padding: 0 0 0 15px;
    }
  `;
  document.head.appendChild(style);
};