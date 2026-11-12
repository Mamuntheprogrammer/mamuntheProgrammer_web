/**
 * SAP-style Command Bar & Easter Eggs
 * Handles T-Codes (/nSE38, /nVA01, /nME21N, /nSE16, /nHOME, /nPORBO, /nPROJ, /nCONTACT, /nYT),
 * "import this" (Zen of Python modal), and keyboard hotkey "/".
 */

import { parseCommand } from './utils/command-parser.js';

const ZEN_OF_PYTHON = `The Zen of Python, by Tim Peters

Beautiful is better than ugly.
Explicit is better than implicit.
Simple is better than complex.
Complex is better than complicated.
Flat is better than nested.
Sparse is better than dense.
Readability counts.
Special cases aren't special enough to break the rules.
Although practicality beats purity.
Errors should never pass silently.
Unless explicitly silenced.
In the face of ambiguity, refuse the temptation to guess.
There should be one-- and preferably only one --obvious way to do it.
Although that way may not be obvious at first unless you're Dutch.
Now is better than never.
Although never is often better than *right* now.
If the implementation is hard to explain, it's a bad idea.
If the implementation is easy to explain, it may be a good idea.
Namespaces are one honking great idea -- let's do more of those!`;

export function initCommandBar() {
  const input = document.getElementById('sap-command-input');
  const feedback = document.getElementById('command-feedback');
  const zenModal = document.getElementById('zen-modal');
  const zenCloseBtn = document.getElementById('zen-close-btn');

  console.log(
    '%c[THE PIPELINE 3D]%c Md Abdullah Al Mamun (Mamuntheprogrammer)\n%c"I move data from messy to meaningful."\nDhaka, Bangladesh | GitHub: https://github.com/Mamuntheprogrammer | YouTube: https://www.youtube.com/@MamunTheProgrammer\nTip: Press "/" to focus the SAP OK-CODE bar!',
    'color: #5eead4; font-weight: bold; font-size: 14px;',
    'color: #fbbf24; font-weight: bold; font-size: 13px;',
    'color: #8b98a5; font-style: italic; font-size: 12px;'
  );

  const showFeedback = (msg, isError = false) => {
    if (!feedback) return;
    feedback.textContent = msg;
    feedback.style.borderColor = isError ? 'var(--accent-red)' : 'var(--line-mint)';
    feedback.style.color = isError ? 'var(--accent-red)' : 'var(--line-mint)';
    feedback.classList.add('visible');

    setTimeout(() => {
      feedback.classList.remove('visible');
    }, 3800);
  };

  const execute = (rawText) => {
    const result = parseCommand(rawText);

    if (result.type === 'navigate' && result.targetId) {
      showFeedback(result.message);
      if (typeof window.navigateToStationById === 'function') {
        window.navigateToStationById(result.targetId);
      } else {
        const targetEl = document.getElementById(result.targetId);
        if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else if (result.type === 'zen') {
      if (zenModal) {
        zenModal.classList.add('active');
        zenModal.setAttribute('aria-hidden', 'false');
      }
      showFeedback('Executing "import this"... Displaying Zen of Python.');
    } else if (result.type === 'help') {
      showFeedback(result.message);
    } else if (result.type === 'clear') {
      if (input) input.value = '';
      showFeedback('Console cleared.');
    } else {
      showFeedback(result.message, true);
    }
  };

  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        execute(input.value);
      }
      if (e.key === 'Escape') {
        input.blur();
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    const activeTag = document.activeElement?.tagName.toLowerCase();
    const isTyping = activeTag === 'input' || activeTag === 'textarea';

    if (e.key === '/' && !isTyping && input) {
      e.preventDefault();
      input.focus();
      input.select();
    }

    if (e.key === 'Escape' && zenModal?.classList.contains('active')) {
      zenModal.classList.remove('active');
      zenModal.setAttribute('aria-hidden', 'true');
    }
  });

  if (zenCloseBtn && zenModal) {
    zenCloseBtn.addEventListener('click', () => {
      zenModal.classList.remove('active');
      zenModal.setAttribute('aria-hidden', 'true');
    });
    zenModal.addEventListener('click', (e) => {
      if (e.target === zenModal) {
        zenModal.classList.remove('active');
        zenModal.setAttribute('aria-hidden', 'true');
      }
    });
  }

  const zenBody = document.getElementById('zen-modal-body');
  if (zenBody) {
    zenBody.textContent = ZEN_OF_PYTHON;
  }
}
