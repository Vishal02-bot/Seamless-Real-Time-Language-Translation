// Translation Application Core Logic

class TranslationApp {
  constructor() {
    this.sourceLang = 'auto';
    this.targetLang = 'es';
    this.autoTranslateEnabled = true;
    this.debounceTimer = null;
    this.isTranslating = false;
    this.speechRecognition = null;
    this.isRecording = false;
    this.currentSpeakingUtterance = null;
    this.storageKey = 'polyglot_history_v1';
    this.themeKey = 'polyglot_theme';
    this.settingsKey = 'polyglot_settings';
    
    this.settings = {
      apiEngine: 'mymemory',
      customApiKey: '',
      customEndpoint: '',
      autoTranslate: true
    };

    this.init();
  }

  init() {
    this.loadSettings();
    this.setupTheme();
    this.cacheDomElements();
    this.populateLanguagePickers();
    this.attachEventListeners();
    this.setupSpeechRecognition();
    this.renderHistory();
    this.updateCharCount();
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem(this.settingsKey);
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to parse settings from storage', e);
    }
    this.autoTranslateEnabled = this.settings.autoTranslate !== false;
  }

  saveSettings() {
    try {
      localStorage.setItem(this.settingsKey, JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Failed to save settings', e);
    }
  }

  setupTheme() {
    const savedTheme = localStorage.getItem(this.themeKey) || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeIcon(savedTheme);
  }

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem(this.themeKey, nextTheme);
    this.updateThemeIcon(nextTheme);
    this.showToast(`Switched to ${nextTheme} theme`);
  }

  updateThemeIcon(theme) {
    const themeBtn = document.getElementById('btnToggleTheme');
    if (!themeBtn) return;
    if (theme === 'light') {
      themeBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      `;
      themeBtn.setAttribute('data-tooltip', 'Switch to Dark Mode');
    } else {
      themeBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      `;
      themeBtn.setAttribute('data-tooltip', 'Switch to Light Mode');
    }
  }

  cacheDomElements() {
    this.elements = {
      sourceInput: document.getElementById('sourceTextInput'),
      targetOutput: document.getElementById('targetTextOutput'),
      charCount: document.getElementById('sourceCharCount'),
      btnTranslate: document.getElementById('btnTranslate'),
      btnSwap: document.getElementById('btnSwapLanguages'),
      btnClearSource: document.getElementById('btnClearSource'),
      btnVoiceInput: document.getElementById('btnVoiceInput'),
      btnSpeakSource: document.getElementById('btnSpeakSource'),
      btnSpeakTarget: document.getElementById('btnSpeakTarget'),
      btnCopyTarget: document.getElementById('btnCopyTarget'),
      btnCopySource: document.getElementById('btnCopySource'),
      autoTranslateCheckbox: document.getElementById('autoTranslateCheckbox'),
      shimmerLoader: document.getElementById('outputShimmer'),
      historyContainer: document.getElementById('historyList'),
      btnClearHistory: document.getElementById('btnClearHistory'),
      sourceSelectBtn: document.getElementById('sourceSelectBtn'),
      targetSelectBtn: document.getElementById('targetSelectBtn'),
      sourceDropdownMenu: document.getElementById('sourceDropdownMenu'),
      targetDropdownMenu: document.getElementById('targetDropdownMenu'),
      sourceSearchInput: document.getElementById('sourceSearchInput'),
      targetSearchInput: document.getElementById('targetSearchInput'),
      sourceLangList: document.getElementById('sourceLangList'),
      targetLangList: document.getElementById('targetLangList'),
      sourcePills: document.getElementById('sourcePills'),
      targetPills: document.getElementById('targetPills'),
      sourceSpeakingWave: document.getElementById('sourceSpeakingWave'),
      targetSpeakingWave: document.getElementById('targetSpeakingWave'),
      toastContainer: document.getElementById('toastContainer'),
      settingsModal: document.getElementById('settingsModal'),
      btnOpenSettings: document.getElementById('btnOpenSettings'),
      btnCloseSettings: document.getElementById('btnCloseSettings'),
      btnSaveSettings: document.getElementById('btnSaveSettings'),
      apiEngineSelect: document.getElementById('apiEngineSelect'),
      apiKeyInput: document.getElementById('apiKeyInput'),
      customEndpointInput: document.getElementById('customEndpointInput')
    };

    if (this.elements.autoTranslateCheckbox) {
      this.elements.autoTranslateCheckbox.checked = this.autoTranslateEnabled;
    }
  }

  populateLanguagePickers() {
    // Generate Pills for popular languages
    this.renderLanguagePills('source');
    this.renderLanguagePills('target');

    // Populate dropdown options
    this.renderLanguageDropdown('source');
    this.renderLanguageDropdown('target');

    // Set initial display labels
    this.updateDropdownButtonLabel('source', this.sourceLang);
    this.updateDropdownButtonLabel('target', this.targetLang);
  }

  renderLanguagePills(type) {
    const container = type === 'source' ? this.elements.sourcePills : this.elements.targetPills;
    if (!container) return;
    container.innerHTML = '';

    const list = type === 'source' ? ['auto', ...POPULAR_LANGUAGES] : POPULAR_LANGUAGES;

    list.forEach(code => {
      const lang = getLanguageByCode(code);
      if (!lang) return;
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = `lang-pill ${((type === 'source' && this.sourceLang === code) || (type === 'target' && this.targetLang === code)) ? 'active' : ''}`;
      pill.innerHTML = `<span>${lang.flag}</span> <span>${lang.name}</span>`;
      pill.addEventListener('click', () => {
        this.selectLanguage(type, code);
      });
      container.appendChild(pill);
    });
  }

  renderLanguageDropdown(type, filterText = '') {
    const listElem = type === 'source' ? this.elements.sourceLangList : this.elements.targetLangList;
    if (!listElem) return;
    listElem.innerHTML = '';

    const q = filterText.trim().toLowerCase();
    const languages = SUPPORTED_LANGUAGES.filter(lang => {
      if (type === 'target' && lang.sourceOnly) return false;
      if (!q) return true;
      return lang.name.toLowerCase().includes(q) || 
             lang.native.toLowerCase().includes(q) || 
             lang.code.toLowerCase().includes(q);
    });

    if (languages.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'dropdown-item';
      empty.style.color = 'var(--text-muted)';
      empty.textContent = 'No matching language found';
      listElem.appendChild(empty);
      return;
    }

    languages.forEach(lang => {
      const item = document.createElement('li');
      const isCurrent = (type === 'source' && this.sourceLang === lang.code) || (type === 'target' && this.targetLang === lang.code);
      item.className = `dropdown-item ${isCurrent ? 'selected' : ''}`;
      item.innerHTML = `
        <div class="dropdown-item-left">
          <span>${lang.flag}</span>
          <span>${lang.name}</span>
        </div>
        <span class="dropdown-native-name">${lang.native}</span>
      `;
      item.addEventListener('click', () => {
        this.selectLanguage(type, lang.code);
        this.closeAllDropdowns();
      });
      listElem.appendChild(item);
    });
  }

  selectLanguage(type, code) {
    if (type === 'source') {
      this.sourceLang = code;
    } else {
      this.targetLang = code;
    }

    this.renderLanguagePills(type);
    this.renderLanguageDropdown(type);
    this.updateDropdownButtonLabel(type, code);

    // Apply RTL direction if target/source requires it
    const langObj = getLanguageByCode(code);
    if (type === 'target' && this.elements.targetOutput) {
      this.elements.targetOutput.dir = (langObj && langObj.rtl) ? 'rtl' : 'ltr';
    } else if (type === 'source' && this.elements.sourceInput) {
      this.elements.sourceInput.dir = (langObj && langObj.rtl) ? 'rtl' : 'ltr';
    }

    // Trigger translation if input has text
    if (this.elements.sourceInput.value.trim().length > 0) {
      this.performTranslation();
    }
  }

  updateDropdownButtonLabel(type, code) {
    const btn = type === 'source' ? this.elements.sourceSelectBtn : this.elements.targetSelectBtn;
    if (!btn) return;
    const lang = getLanguageByCode(code) || { name: 'Select', flag: '🌐' };
    const labelSpan = btn.querySelector('.btn-label');
    if (labelSpan) {
      labelSpan.innerHTML = `<span class="flag-icon">${lang.flag}</span> <span>${lang.name}</span>`;
    }
  }

  closeAllDropdowns() {
    if (this.elements.sourceDropdownMenu) this.elements.sourceDropdownMenu.classList.remove('open');
    if (this.elements.targetDropdownMenu) this.elements.targetDropdownMenu.classList.remove('open');
  }

  toggleDropdown(type) {
    const menu = type === 'source' ? this.elements.sourceDropdownMenu : this.elements.targetDropdownMenu;
    const otherMenu = type === 'source' ? this.elements.targetDropdownMenu : this.elements.sourceDropdownMenu;
    if (otherMenu) otherMenu.classList.remove('open');
    if (menu) {
      const isOpen = menu.classList.toggle('open');
      if (isOpen) {
        const searchInput = type === 'source' ? this.elements.sourceSearchInput : this.elements.targetSearchInput;
        if (searchInput) {
          searchInput.value = '';
          this.renderLanguageDropdown(type, '');
          setTimeout(() => searchInput.focus(), 50);
        }
      }
    }
  }

  attachEventListeners() {
    // Dropdown triggers
    this.elements.sourceSelectBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleDropdown('source');
    });

    this.elements.targetSelectBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleDropdown('target');
    });

    // Dropdown search filters
    this.elements.sourceSearchInput.addEventListener('input', (e) => {
      this.renderLanguageDropdown('source', e.target.value);
    });

    this.elements.targetSearchInput.addEventListener('input', (e) => {
      this.renderLanguageDropdown('target', e.target.value);
    });

    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.dropdown-wrapper')) {
        this.closeAllDropdowns();
      }
    });

    // Input text listener & char counter
    this.elements.sourceInput.addEventListener('input', () => {
      this.updateCharCount();
      if (this.autoTranslateEnabled) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          this.performTranslation();
        }, 550);
      }
    });

    // Keyboard shortcuts: Ctrl+Enter to translate
    this.elements.sourceInput.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        this.performTranslation();
      }
    });

    // Translate button click
    this.elements.btnTranslate.addEventListener('click', () => {
      this.performTranslation();
    });

    // Auto-translate toggle
    this.elements.autoTranslateCheckbox.addEventListener('change', (e) => {
      this.autoTranslateEnabled = e.target.checked;
      this.settings.autoTranslate = this.autoTranslateEnabled;
      this.saveSettings();
      this.showToast(`Auto-translate ${this.autoTranslateEnabled ? 'enabled' : 'disabled'}`);
      if (this.autoTranslateEnabled && this.elements.sourceInput.value.trim().length > 0) {
        this.performTranslation();
      }
    });

    // Language swap button
    this.elements.btnSwap.addEventListener('click', () => {
      this.swapLanguages();
    });

    // Clear source button
    this.elements.btnClearSource.addEventListener('click', () => {
      this.elements.sourceInput.value = '';
      this.elements.targetOutput.textContent = '';
      this.elements.targetOutput.classList.add('placeholder');
      this.elements.targetOutput.textContent = 'Translation will appear here...';
      this.updateCharCount();
      this.elements.sourceInput.focus();
    });

    // Copy Target button
    this.elements.btnCopyTarget.addEventListener('click', () => {
      const text = this.elements.targetOutput.textContent.trim();
      if (!text || this.elements.targetOutput.classList.contains('placeholder')) {
        this.showToast('No translated text to copy', 'error');
        return;
      }
      this.copyToClipboard(text, 'Translated text copied to clipboard!');
    });

    // Copy Source button
    this.elements.btnCopySource.addEventListener('click', () => {
      const text = this.elements.sourceInput.value.trim();
      if (!text) {
        this.showToast('No source text to copy', 'error');
        return;
      }
      this.copyToClipboard(text, 'Source text copied to clipboard!');
    });

    // Text-to-Speech (Target)
    this.elements.btnSpeakTarget.addEventListener('click', () => {
      const text = this.elements.targetOutput.textContent.trim();
      if (!text || this.elements.targetOutput.classList.contains('placeholder')) {
        this.showToast('No translation to read aloud', 'error');
        return;
      }
      this.speakText(text, this.targetLang, this.elements.targetSpeakingWave);
    });

    // Text-to-Speech (Source)
    this.elements.btnSpeakSource.addEventListener('click', () => {
      const text = this.elements.sourceInput.value.trim();
      if (!text) {
        this.showToast('Please type something first to listen', 'error');
        return;
      }
      this.speakText(text, this.sourceLang === 'auto' ? 'en' : this.sourceLang, this.elements.sourceSpeakingWave);
    });

    // Voice Dictation (Speech-to-Text)
    this.elements.btnVoiceInput.addEventListener('click', () => {
      this.toggleVoiceInput();
    });

    // Theme switch
    const btnToggleTheme = document.getElementById('btnToggleTheme');
    if (btnToggleTheme) {
      btnToggleTheme.addEventListener('click', () => this.toggleTheme());
    }

    // Settings Modal
    this.elements.btnOpenSettings.addEventListener('click', () => this.openSettings());
    this.elements.btnCloseSettings.addEventListener('click', () => this.closeSettings());
    this.elements.btnSaveSettings.addEventListener('click', () => this.handleSaveSettings());
    this.elements.settingsModal.addEventListener('click', (e) => {
      if (e.target === this.elements.settingsModal) this.closeSettings();
    });

    // Clear History button
    this.elements.btnClearHistory.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear your translation history?')) {
        this.clearHistory();
      }
    });
  }

  updateCharCount() {
    const len = this.elements.sourceInput.value.length;
    const max = 5000;
    this.elements.charCount.textContent = `${len.toLocaleString()} / ${max.toLocaleString()}`;
    if (len > 4500) {
      this.elements.charCount.className = 'char-counter danger';
    } else if (len > 3500) {
      this.elements.charCount.className = 'char-counter warning';
    } else {
      this.elements.charCount.className = 'char-counter';
    }
  }

  swapLanguages() {
    if (this.sourceLang === 'auto') {
      this.showToast('Select a specific source language before swapping', 'error');
      return;
    }

    const tempLang = this.sourceLang;
    this.sourceLang = this.targetLang;
    this.targetLang = tempLang;

    // Swap text values
    const currentSourceText = this.elements.sourceInput.value;
    const currentTargetText = this.elements.targetOutput.classList.contains('placeholder') ? '' : this.elements.targetOutput.textContent;

    this.elements.sourceInput.value = currentTargetText;
    if (currentSourceText) {
      this.elements.targetOutput.textContent = currentSourceText;
      this.elements.targetOutput.classList.remove('placeholder');
    }

    this.populateLanguagePickers();
    this.updateCharCount();

    if (this.elements.sourceInput.value.trim().length > 0) {
      this.performTranslation();
    }
  }

  async performTranslation() {
    const text = this.elements.sourceInput.value.trim();
    if (!text) {
      this.elements.targetOutput.textContent = 'Translation will appear here...';
      this.elements.targetOutput.classList.add('placeholder');
      return;
    }

    // Identical languages
    if (this.sourceLang === this.targetLang && this.sourceLang !== 'auto') {
      this.elements.targetOutput.textContent = text;
      this.elements.targetOutput.classList.remove('placeholder');
      return;
    }

    this.setLoading(true);

    try {
      let translated = '';
      let detectedLang = null;

      if (this.settings.apiEngine === 'mymemory' || !this.settings.customApiKey) {
        // Free & high-speed MyMemory Translation Engine
        const pair = `${this.sourceLang}|${this.targetLang}`;
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${pair}`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        const data = await response.json();
        
        if (data.responseData && data.responseData.translatedText) {
          translated = data.responseData.translatedText;
          if (data.responseData.detectedLanguage) {
            detectedLang = data.responseData.detectedLanguage;
          }
        } else {
          throw new Error(data.responseDetails || 'Translation failed');
        }
      } else if (this.settings.apiEngine === 'google' && this.settings.customApiKey) {
        // Custom Google Cloud Translation API
        const url = `https://translation.googleapis.com/language/translate/v2?key=${this.settings.customApiKey}`;
        const body = {
          q: text,
          target: this.targetLang
        };
        if (this.sourceLang !== 'auto') body.source = this.sourceLang;

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const data = await response.json();
        if (data.data && data.data.translations && data.data.translations.length > 0) {
          translated = data.data.translations[0].translatedText;
        } else {
          throw new Error('Google Cloud Translation failed');
        }
      } else if (this.settings.apiEngine === 'custom' && this.settings.customEndpoint) {
        // Custom LibreTranslate or proxy endpoint
        const response = await fetch(this.settings.customEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            q: text,
            source: this.sourceLang,
            target: this.targetLang,
            format: 'text',
            api_key: this.settings.customApiKey || ''
          })
        });
        const data = await response.json();
        translated = data.translatedText || text;
      }

      // Decode possible HTML entities (e.g., &#39; to ')
      translated = this.decodeHtmlEntities(translated);

      this.elements.targetOutput.textContent = translated;
      this.elements.targetOutput.classList.remove('placeholder');

      // If source was 'auto' and a language was detected, show badge or notify
      if (this.sourceLang === 'auto' && detectedLang) {
        const detectedObj = getLanguageByCode(detectedLang);
        if (detectedObj) {
          this.updateDropdownButtonLabel('source', 'auto');
          const label = this.elements.sourceSelectBtn.querySelector('.btn-label');
          if (label) {
            label.innerHTML = `<span class="flag-icon">✨</span> <span>Auto (${detectedObj.name})</span>`;
          }
        }
      }

      // Save to Translation History
      this.saveToHistory({
        sourceText: text,
        translatedText: translated,
        sourceLang: this.sourceLang,
        targetLang: this.targetLang,
        timestamp: Date.now()
      });

    } catch (err) {
      console.error('Translation error:', err);
      this.showToast(`Error: ${err.message || 'Unable to translate'}`, 'error');
      this.elements.targetOutput.textContent = 'An error occurred during translation. Please try again.';
      this.elements.targetOutput.classList.remove('placeholder');
    } finally {
      this.setLoading(false);
    }
  }

  decodeHtmlEntities(str) {
    if (!str) return '';
    const txt = document.createElement('textarea');
    txt.innerHTML = str;
    return txt.value;
  }

  setLoading(isLoading) {
    this.isTranslating = isLoading;
    if (this.elements.shimmerLoader) {
      this.elements.shimmerLoader.classList.toggle('active', isLoading);
    }
    if (this.elements.btnTranslate) {
      this.elements.btnTranslate.disabled = isLoading;
      const textSpan = this.elements.btnTranslate.querySelector('.btn-text');
      if (textSpan) {
        textSpan.textContent = isLoading ? 'Translating...' : 'Translate';
      }
    }
  }

  // Web Speech API: Text-to-Speech (TTS)
  speakText(text, langCode, waveIndicator) {
    if (!('speechSynthesis' in window)) {
      this.showToast('Text-to-speech is not supported by your browser', 'error');
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      if (this.currentSpeakingIndicator) {
        this.currentSpeakingIndicator.classList.remove('active');
      }
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const langObj = getLanguageByCode(langCode);
    const bcp47 = langObj && langObj.speechCode ? langObj.speechCode : (langCode === 'auto' ? 'en-US' : langCode);
    utterance.lang = bcp47;
    utterance.rate = 0.95;

    // Pick best matching voice if available
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang.startsWith(langCode) || v.lang === bcp47);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    if (waveIndicator) {
      waveIndicator.classList.add('active');
      this.currentSpeakingIndicator = waveIndicator;
    }

    utterance.onend = () => {
      if (waveIndicator) waveIndicator.classList.remove('active');
      this.currentSpeakingIndicator = null;
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      if (waveIndicator) waveIndicator.classList.remove('active');
      this.currentSpeakingIndicator = null;
    };

    window.speechSynthesis.speak(utterance);
  }

  // Web Speech API: Speech-to-Text (STT)
  setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.elements.btnVoiceInput.style.display = 'none';
      return;
    }

    this.speechRecognition = new SpeechRecognition();
    this.speechRecognition.continuous = false;
    this.speechRecognition.interimResults = true;

    this.speechRecognition.onstart = () => {
      this.isRecording = true;
      this.elements.btnVoiceInput.classList.add('active');
      this.showToast('Listening... Speak into your microphone', 'info');
    };

    this.speechRecognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        this.elements.sourceInput.value = (this.elements.sourceInput.value + ' ' + finalTranscript).trim();
        this.updateCharCount();
        if (this.autoTranslateEnabled) {
          this.performTranslation();
        }
      }
    };

    this.speechRecognition.onerror = (e) => {
      console.warn('Speech recognition error:', e.error);
      this.isRecording = false;
      this.elements.btnVoiceInput.classList.remove('active');
      if (e.error !== 'no-speech') {
        this.showToast(`Voice input error: ${e.error}`, 'error');
      }
    };

    this.speechRecognition.onend = () => {
      this.isRecording = false;
      this.elements.btnVoiceInput.classList.remove('active');
    };
  }

  toggleVoiceInput() {
    if (!this.speechRecognition) {
      this.showToast('Speech recognition is not supported in this browser', 'error');
      return;
    }

    if (this.isRecording) {
      this.speechRecognition.stop();
      this.isRecording = false;
      this.elements.btnVoiceInput.classList.remove('active');
    } else {
      const langObj = getLanguageByCode(this.sourceLang);
      this.speechRecognition.lang = (langObj && langObj.speechCode) ? langObj.speechCode : 'en-US';
      try {
        this.speechRecognition.start();
      } catch (err) {
        console.warn(err);
      }
    }
  }

  // Copy with Clipboard API
  async copyToClipboard(text, successMsg = 'Copied to clipboard!') {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      this.showToast(successMsg, 'success');
    } catch (err) {
      console.error('Failed to copy text', err);
      this.showToast('Failed to copy to clipboard', 'error');
    }
  }

  // Toast notifications
  showToast(message, type = 'normal') {
    if (!this.elements.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
    } else {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }

    toast.innerHTML = `${iconSvg} <span>${message}</span>`;
    this.elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 2800);
  }

  // Translation History Management
  saveToHistory(item) {
    let history = this.getHistory();
    // Prevent duplicate adjacent entries
    if (history.length > 0 && history[0].sourceText === item.sourceText && history[0].targetLang === item.targetLang) {
      return;
    }
    history.unshift(item);
    if (history.length > 30) history = history.slice(0, 30);
    localStorage.setItem(this.storageKey, JSON.stringify(history));
    this.renderHistory();
  }

  getHistory() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  clearHistory() {
    localStorage.removeItem(this.storageKey);
    this.renderHistory();
    this.showToast('Translation history cleared');
  }

  deleteHistoryItem(index) {
    let history = this.getHistory();
    history.splice(index, 1);
    localStorage.setItem(this.storageKey, JSON.stringify(history));
    this.renderHistory();
  }

  renderHistory() {
    const list = this.getHistory();
    const container = this.elements.historyContainer;
    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `
        <div class="history-empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 10px; display: block; opacity: 0.5;">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <p>No translation history yet. Your completed translations will appear here for quick access!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    list.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'history-card';

      const sLang = getLanguageByCode(item.sourceLang) || { name: item.sourceLang, flag: '🌐' };
      const tLang = getLanguageByCode(item.targetLang) || { name: item.targetLang, flag: '🌐' };
      const timeStr = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      card.innerHTML = `
        <div class="history-card-header">
          <div class="history-lang-badge">
            <span>${sLang.flag} ${sLang.name}</span>
            <span>→</span>
            <span>${tLang.flag} ${tLang.name}</span>
          </div>
          <span>${timeStr}</span>
        </div>
        <div class="history-source-text">${this.escapeHtml(item.sourceText)}</div>
        <div class="history-translated-text">${this.escapeHtml(item.translatedText)}</div>
        <div class="history-card-actions">
          <button class="action-btn" data-action="use" title="Load into translator">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="23"></line>
            </svg>
            Load
          </button>
          <button class="action-btn" data-action="copy" title="Copy translated text">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Copy
          </button>
          <button class="action-btn" data-action="delete" title="Delete from history" style="color: #ef4444;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      `;

      // Card action buttons
      card.querySelector('[data-action="use"]').addEventListener('click', () => {
        this.selectLanguage('source', item.sourceLang);
        this.selectLanguage('target', item.targetLang);
        this.elements.sourceInput.value = item.sourceText;
        this.elements.targetOutput.textContent = item.translatedText;
        this.elements.targetOutput.classList.remove('placeholder');
        this.updateCharCount();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.showToast('Loaded translation into editor');
      });

      card.querySelector('[data-action="copy"]').addEventListener('click', () => {
        this.copyToClipboard(item.translatedText, 'Copied translation from history!');
      });

      card.querySelector('[data-action="delete"]').addEventListener('click', () => {
        this.deleteHistoryItem(index);
      });

      container.appendChild(card);
    });
  }

  escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Settings Modal Controls
  openSettings() {
    this.elements.apiEngineSelect.value = this.settings.apiEngine || 'mymemory';
    this.elements.apiKeyInput.value = this.settings.customApiKey || '';
    this.elements.customEndpointInput.value = this.settings.customEndpoint || '';
    this.elements.settingsModal.classList.add('open');
  }

  closeSettings() {
    this.elements.settingsModal.classList.remove('open');
  }

  handleSaveSettings() {
    this.settings.apiEngine = this.elements.apiEngineSelect.value;
    this.settings.customApiKey = this.elements.apiKeyInput.value.trim();
    this.settings.customEndpoint = this.elements.customEndpointInput.value.trim();
    this.saveSettings();
    this.closeSettings();
    this.showToast('Settings saved successfully', 'success');
  }
}

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new TranslationApp();
});
