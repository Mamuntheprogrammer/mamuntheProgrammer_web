/**
 * Post-intro Lock Gate
 * A playful, fully static challenge wall: choose an expertise, answer one
 * tricky question in a typing terminal, or rebuild the decryption puzzle to
 * recover a cheat code. Passing shows a short success state and a three-second
 * countdown, then reveals the portfolio.
 *
 * Nothing is sent anywhere. Skip as visitor at any time; the result is stored
 * in sessionStorage so the gate does not interrupt repeat visits in the same
 * browser session. Add ?gate=off to the URL for demos or automated screenshots.
 */

import { sessionGet, sessionSet } from './utils/storage.js';

const PASS_KEY = 'mamun_gate_passed';

export const LOCK_CHALLENGES = {
  python: {
    label: 'Python',
    question: [
      'A list `nums = [1, 2, 3]` is aliased with `alias = nums`.',
      'Then `alias.append(4)` runs.',
      '',
      'What does `len(nums)` return?',
    ],
    answers: ['4', 'four'],
    hints: [
      'Assignment binds a name, not a copy — `alias` and `nums` point at the same list object.',
      '`append()` mutates the list in place. Count the elements again.',
    ],
    cheat: 'SNAKE',
    clue: 'A Python is also called a ___. Five letters, starts with S.',
    success: 'Correct — assignment aliases the object. `nums` and `alias` are two names for one list.',
  },
  abap: {
    label: 'ABAP',
    question: [
      'In ABAP, which internal table type supports BOTH a numeric index',
      'and key-based access?',
    ],
    answers: ['sorted table', 'sorted tables', 'sorted', 'sort table'],
    hints: [
      'It is not STANDARD (index only) and not HASHED (key only).',
      'Its name literally says the rows are ordered.',
    ],
    cheat: 'ALV',
    clue: "SAP's grid-style report output is called ___ (three letters).",
    success: 'Exactly — a SORTED TABLE keeps key order and a numeric index. ALV would be proud.',
  },
  sql: {
    label: 'SQL',
    question: [
      "`SELECT COUNT(*) FROM orders WHERE status = 'paid';` → 12",
      "`SELECT COUNT(coupon_code) FROM orders WHERE status = 'paid';` → 5",
      '',
      'How many paid orders have a NULL coupon_code?',
    ],
    answers: ['7', 'seven'],
    hints: [
      '`COUNT(*)` counts rows; `COUNT(column)` ignores NULLs.',
      'Subtract the second number from the first.',
    ],
    cheat: 'JOIN',
    clue: 'The SQL clause that stitches rows from two tables together. Four letters, starts with J.',
    success: 'Right — 12 − 5 = 7. `COUNT(column)` skips NULLs, `COUNT(*)` does not.',
  },
  javascript: {
    label: 'JavaScript',
    question: [
      'What does `console.log(typeof null)` print in JavaScript?',
    ],
    answers: ['object', 'object type'],
    hints: [
      'It is a famous bug from the first version of JavaScript.',
      'It is definitely not "null". Four letters, starts with O.',
    ],
    cheat: 'ASYNC',
    clue: "JavaScript's non-blocking superpower, usually paired with `await`. Five letters, starts with A.",
    success: 'Yep — `typeof null === "object"`, a bug kept for backward compatibility.',
  },
  go: {
    label: 'Go',
    question: [
      'Which keyword launches a function as a goroutine in Go?',
    ],
    answers: ['go', 'go keyword', 'go func', 'go func()'],
    hints: [
      'It is a two-letter keyword.',
      'You write it before a function call: ___ fn().',
    ],
    cheat: 'GOPHER',
    clue: 'The Go mascot is a rodent called a ___. Six letters, starts with G.',
    success: 'Correct — `go fn()` starts a goroutine. The scheduler does the rest.',
  },
  rust: {
    label: 'Rust',
    question: [
      'Which Rust enum represents either `Some(T)` or `None`?',
    ],
    answers: ['option', 'option<t>', 'std::option', 'std::option<t>', 'option enum'],
    hints: [
      'It is the safe alternative to null.',
      'Its two variants are `Some` and `None`.',
    ],
    cheat: 'BORROW',
    clue: "Rust's ownership system lends values through the ___ checker. Six letters, starts with B.",
    success: 'Yes — `Option<T>` makes absence explicit. The borrow checker approves.',
  },
  java: {
    label: 'Java',
    question: [
      'Which JVM component compiles hot bytecode into native machine code',
      'at runtime?',
    ],
    answers: ['jit', 'jit compiler', 'just-in-time compiler', 'just in time compiler', 'just-in-time'],
    hints: [
      'Three letters. It runs just in time.',
      'The JVM interprets at first, then this kicks in for hot code.',
    ],
    cheat: 'COFFEE',
    clue: "Java's mascot is a cup of ___. Six letters, starts with C.",
    success: 'Exactly — the JIT compiler. Hot paths get faster as they run.',
  },
  excel: {
    label: 'Excel',
    question: [
      'You need an exact-match lookup of `A2` inside `D2:D100`,',
      'returning the 3rd column. Which classic function do you use?',
    ],
    answers: ['vlookup', 'vlookup()', 'xlookup', 'xlookup()'],
    hints: [
      'Four arguments: lookup value, table array, column index, FALSE.',
      'It starts with V (or X, if you are modern).',
    ],
    cheat: 'PIVOT',
    clue: "Excel's drag-and-drop summary table is called a ___ table. Five letters, starts with P.",
    success: 'Correct — `=VLOOKUP(A2, D2:D100, 3, FALSE)`. XLOOKUP is the modern upgrade.',
  },
  linux: {
    label: 'Linux',
    question: [
      'Which command prints the last 20 lines of `server.log`?',
    ],
    answers: ['tail', 'tail -n 20', 'tail -n 20 server.log', 'tail -20', 'tail -20 server.log', 'tail server.log'],
    hints: [
      '`head` shows the beginning; this one shows the end.',
      'The flag `-n 20` sets the line count.',
    ],
    cheat: 'SUDO',
    clue: 'The four-letter prefix that runs a command as root. Starts with S.',
    success: 'Right — `tail -n 20 server.log`. The logs never stood a chance.',
  },
};

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const BACKGROUND_SELECTORS = [
  '.skip-link',
  '.site-header',
  '#spatial-viewport',
  '.pipeline-bottom-dock',
  '#scroll-driver-track',
  '#portrait-modal',
  '#analysis-modal',
  '#zen-modal',
];

export function normalizeAnswer(value) {
  let normalized = String(value)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');

  normalized = normalized.replace(/^[`"'=]+/, '').replace(/[`"'=]+$/, '');
  normalized = normalized.replace(/[.!?]+$/, '').trim();
  normalized = normalized.replace(/^[`"'=]+/, '').replace(/[`"'=]+$/, '');
  return normalized;
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function makeSessionId() {
  try {
    const bytes = new Uint8Array(2);
    window.crypto.getRandomValues(bytes);
    return `#${Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
  } catch (error) {
    return `#${Math.random().toString(16).slice(2, 6).toUpperCase()}`;
  }
}

function gateIsBypassed() {
  try {
    return new URLSearchParams(window.location.search).get('gate') === 'off';
  } catch (error) {
    return false;
  }
}

function scrambleCode(code, key) {
  const letters = [...code];
  let seed = [...key].reduce((total, char) => total + char.charCodeAt(0), 17);

  for (let index = letters.length - 1; index > 0; index -= 1) {
    seed = (seed * 9301 + 49297) % 233280;
    const swapIndex = Math.floor((seed / 233280) * (index + 1));
    [letters[index], letters[swapIndex]] = [letters[swapIndex], letters[index]];
  }

  const scrambled = letters.join('');
  return scrambled === code ? [...code].reverse().join('') : scrambled;
}

function getFocusable(container) {
  return Array.from(container.querySelectorAll(FOCUSABLE)).filter(
    (element) => element.offsetParent !== null && !element.closest('[hidden]')
  );
}

function trapTabKey(event, container) {
  if (event.key !== 'Tab') return;

  const focusable = getFocusable(container);
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (!container.contains(document.activeElement)) {
    event.preventDefault();
    first.focus();
    return;
  }

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

/**
 * Initializes the lock gate. Returns an object with open() and close().
 * Call open() from the intro's completion callback.
 */
export function initLockGate(options = {}) {
  const onClose = typeof options.onClose === 'function' ? options.onClose : null;

  const gate = document.getElementById('lock-gate');
  if (!gate) {
    return {
      open() {
        if (onClose) onClose('missing');
      },
      close() {},
    };
  }

  const refs = {
    shell: gate.querySelector('.lock-gate-shell'),
    main: gate.querySelector('.lock-gate-main'),
    skip: document.getElementById('lock-gate-skip'),
    skipInline: document.getElementById('gate-skip-inline'),
    status: document.getElementById('lock-gate-status'),
    sessionId: document.getElementById('gate-session-id'),
    lockSvg: document.getElementById('gate-lock-svg'),
    lockState: document.getElementById('gate-lock-state'),
    intro: document.getElementById('gate-intro'),
    skillGrid: document.getElementById('gate-skill-grid'),
    challenge: document.getElementById('gate-challenge'),
    challengeEyebrow: document.getElementById('gate-challenge-eyebrow'),
    challengeTitle: document.getElementById('gate-challenge-title'),
    backBtn: document.getElementById('gate-back-btn'),
    terminalTitle: document.getElementById('gate-terminal-title'),
    output: document.getElementById('gate-terminal-output'),
    form: document.getElementById('gate-form'),
    answer: document.getElementById('gate-answer'),
    submit: document.getElementById('gate-submit'),
    feedback: document.getElementById('gate-feedback'),
    hintBtn: document.getElementById('gate-hint-btn'),
    resetBtn: document.getElementById('gate-reset-btn'),
    attempts: document.getElementById('gate-attempts'),
    puzzle: document.getElementById('gate-puzzle'),
    puzzleClue: document.getElementById('gate-puzzle-clue'),
    puzzleProgress: document.getElementById('gate-puzzle-progress'),
    puzzleSlots: document.getElementById('gate-puzzle-slots'),
    puzzleTiles: document.getElementById('gate-puzzle-tiles'),
    success: document.getElementById('gate-success'),
    successTitle: document.getElementById('gate-success-title'),
    successMessage: document.getElementById('gate-success-message'),
    countdownBar: document.getElementById('gate-countdown-bar'),
    countdownLabel: document.getElementById('gate-countdown-label'),
    enterBtn: document.getElementById('gate-enter-btn'),
    readoutSkill: document.getElementById('gate-readout-skill'),
    readoutChallenge: document.getElementById('gate-readout-challenge'),
    readoutStatus: document.getElementById('gate-readout-status'),
  };

  if (!refs.shell || !refs.skillGrid || !refs.form) {
    return {
      open() {
        if (onClose) onClose('incomplete');
      },
      close() {},
    };
  }

  const skillButtons = Array.from(refs.skillGrid.querySelectorAll('.gate-skill'));

  const state = {
    open: false,
    closing: false,
    solved: false,
    skill: null,
    attempts: 0,
    hintIndex: 0,
    typeToken: 0,
    picked: [],
    puzzleLocked: false,
    puzzleSolved: false,
    previousFocus: null,
    inerted: [],
    countdownTimer: null,
    timeouts: new Set(),
  };

  function gateTimeout(callback, delay) {
    const timer = window.setTimeout(() => {
      state.timeouts.delete(timer);
      callback();
    }, delay);
    state.timeouts.add(timer);
    return timer;
  }

  function clearGateTimeouts() {
    state.timeouts.forEach((timer) => window.clearTimeout(timer));
    state.timeouts.clear();
  }

  function setFeedback(message, tone = '') {
    refs.feedback.textContent = message;
    refs.feedback.className = `gate-feedback${tone ? ` is-${tone}` : ''}`;
  }

  function appendLine(text, className = '') {
    const row = document.createElement('div');
    row.className = `gate-line ${className}`.trim();
    row.textContent = text;
    refs.output.append(row);
    refs.output.scrollTop = refs.output.scrollHeight;
    return row;
  }

  function setBackgroundInert(active) {
    if (active) {
      state.inerted = [];
      BACKGROUND_SELECTORS.forEach((selector) => {
        document.querySelectorAll(selector).forEach((element) => {
          state.inerted.push({
            element,
            inert: element.inert,
            ariaHidden: element.getAttribute('aria-hidden'),
          });
          element.inert = true;
          element.setAttribute('aria-hidden', 'true');
        });
      });
      return;
    }

    state.inerted.forEach(({ element, inert, ariaHidden }) => {
      element.inert = inert;
      if (ariaHidden === null) element.removeAttribute('aria-hidden');
      else element.setAttribute('aria-hidden', ariaHidden);
    });
    state.inerted = [];
  }

  function restoreFocus() {
    const previousFocus = state.previousFocus;
    state.previousFocus = null;

    const previousIsVisible =
      previousFocus &&
      previousFocus !== document.body &&
      document.contains(previousFocus) &&
      (previousFocus.offsetParent !== null || previousFocus.getClientRects().length > 0);

    if (previousIsVisible) {
      previousFocus.focus({ preventScroll: true });
      return;
    }

    const main = document.getElementById('section-00-source');
    if (main) {
      main.setAttribute('tabindex', '-1');
      main.focus({ preventScroll: true });
      main.addEventListener('blur', () => main.removeAttribute('tabindex'), { once: true });
    }

    if (document.activeElement === document.body) {
      const brand = document.querySelector('.header-brand');
      if (brand) brand.focus({ preventScroll: true });
    }
  }

  function shakeLock() {
    gate.classList.remove('is-denied');
    void gate.offsetWidth;
    gate.classList.add('is-denied');
    gateTimeout(() => gate.classList.remove('is-denied'), 500);
  }

  function clearCountdown() {
    if (state.countdownTimer) {
      window.clearInterval(state.countdownTimer);
      state.countdownTimer = null;
    }
  }

  function onKeydown(event) {
    if (!state.open) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      if (state.solved) {
        clearCountdown();
        closeGate('unlocked');
      } else {
        skipAsVisitor();
      }
      return;
    }

    trapTabKey(event, refs.shell);
  }

  function openGate() {
    if (state.open || state.solved || state.closing) return;

    if (sessionGet(PASS_KEY) === 'true' || gateIsBypassed()) {
      if (onClose) onClose('passed');
      return;
    }

    state.open = true;
    state.previousFocus = document.activeElement;
    state.attempts = 0;
    state.hintIndex = 0;
    state.skill = null;
    state.solved = false;
    state.picked = [];
    state.puzzleLocked = false;
    state.puzzleSolved = false;

    gate.setAttribute('aria-labelledby', 'lock-gate-title');
    gate.setAttribute('aria-describedby', 'lock-gate-desc');
    refs.status.textContent = 'STATUS: LOCKED';
    refs.lockState.textContent = 'LOCKED';
    refs.sessionId.textContent = `SESSION ${makeSessionId()}`;
    refs.intro.hidden = false;
    refs.challenge.hidden = true;
    refs.success.hidden = true;
    refs.attempts.textContent = 'ATTEMPTS: 0';
    refs.readoutSkill.textContent = 'UNSET';
    refs.readoutChallenge.textContent = '—';
    refs.readoutStatus.textContent = 'AWAITING INPUT';
    refs.output.replaceChildren();
    refs.answer.value = '';
    refs.answer.disabled = false;
    refs.submit.disabled = false;
    refs.hintBtn.disabled = false;
    refs.resetBtn.disabled = false;
    setFeedback('Read the question, then answer below. Hints are free.');

    gate.hidden = false;
    gate.setAttribute('aria-hidden', 'false');
    document.body.classList.add('gate-open');
    setBackgroundInert(true);
    document.addEventListener('keydown', onKeydown);

    window.requestAnimationFrame(() => {
      gate.classList.add('is-active');
      window.requestAnimationFrame(() => {
        const firstSkill = skillButtons[0] || refs.skip;
        if (firstSkill) firstSkill.focus({ preventScroll: true });
      });
    });
  }

  function skipAsVisitor() {
    if (state.solved) {
      clearCountdown();
      closeGate('unlocked');
      return;
    }
    refs.status.textContent = 'STATUS: VISITOR PASS';
    refs.lockState.textContent = 'BYPASS';
    sessionSet(PASS_KEY, 'true');
    closeGate('visitor');
  }

  function closeGate(reason) {
    if (!state.open || state.closing) return;

    state.open = false;
    state.closing = true;
    state.typeToken += 1;
    clearGateTimeouts();
    clearCountdown();
    sessionSet(PASS_KEY, 'true');
    gate.classList.remove('is-active');
    gate.classList.add('is-closing');
    document.removeEventListener('keydown', onKeydown);

    const finalize = () => {
      gate.hidden = true;
      gate.setAttribute('aria-hidden', 'true');
      gate.classList.remove('is-closing', 'is-unlocked', 'is-challenging', 'is-denied');
      refs.lockSvg.classList.remove('is-unlocked');
      setBackgroundInert(false);
      document.body.classList.remove('gate-open');
      state.closing = false;
      restoreFocus();
      if (onClose) onClose(reason);
      window.dispatchEvent(new CustomEvent('lockgate-finished', { detail: { reason } }));
    };

    if (prefersReducedMotion()) finalize();
    else window.setTimeout(finalize, 470);
  }

  function updatePuzzleProgress() {
    const data = LOCK_CHALLENGES[state.skill];
    if (!data) return;
    refs.puzzleProgress.textContent = `${state.picked.length} / ${data.cheat.length}`;
  }

  function resetPuzzleSelection() {
    const data = LOCK_CHALLENGES[state.skill];
    if (!data) return;

    state.picked = [];
    state.puzzleLocked = false;
    refs.puzzle.classList.remove('is-wrong');

    Array.from(refs.puzzleTiles.children).forEach((tile) => {
      tile.disabled = false;
    });

    Array.from(refs.puzzleSlots.children).forEach((slot, index) => {
      slot.textContent = '';
      slot.disabled = true;
      slot.setAttribute('aria-label', `Slot ${index + 1}, empty`);
    });

    updatePuzzleProgress();
  }

  function undoPuzzleFrom(index) {
    if (state.puzzleSolved || state.puzzleLocked) return;

    const data = LOCK_CHALLENGES[state.skill];
    if (!data || index < 0 || index >= state.picked.length) return;

    const removed = state.picked.splice(index);
    removed.forEach(({ tileIndex }) => {
      const tile = refs.puzzleTiles.querySelector(`[data-index="${tileIndex}"]`);
      if (tile) tile.disabled = false;
    });

    for (let slotIndex = index; slotIndex < data.cheat.length; slotIndex += 1) {
      const slot = refs.puzzleSlots.children[slotIndex];
      slot.textContent = '';
      slot.disabled = true;
      slot.setAttribute('aria-label', `Slot ${slotIndex + 1}, empty`);
    }

    updatePuzzleProgress();
    refs.feedback.textContent = 'Letter removed — keep rebuilding the code.';
    refs.feedback.className = 'gate-feedback';
  }

  function finishPuzzle() {
    const data = LOCK_CHALLENGES[state.skill];
    if (!data) return;

    const guess = state.picked.map(({ letter }) => letter).join('');
    state.puzzleLocked = true;

    if (guess === data.cheat) {
      state.puzzleSolved = true;
      refs.puzzle.classList.add('is-solved');
      refs.puzzleProgress.textContent = 'DECRYPTED';
      refs.readoutStatus.textContent = 'CHEAT CODE FOUND';
      setFeedback(`DECRYPTION COMPLETE // CHEAT CODE RECOVERED: ${data.cheat}`, 'success');
      appendLine(`! DECRYPTION COMPLETE // ${data.cheat}`, 'gate-line-success');

      gateTimeout(() => {
        if (!state.open || state.solved) return;
        refs.answer.value = data.cheat;
        unlock('cheat');
      }, 700);
      return;
    }

    refs.puzzle.classList.add('is-wrong');
    refs.readoutStatus.textContent = 'PUZZLE MISMATCH';
    shakeLock();
    setFeedback('SEQUENCE MISMATCH // the tiles reset. Read the clue and try again.', 'error');

    gateTimeout(() => {
      if (state.solved) return;
      resetPuzzleSelection();
    }, 650);
  }

  function pickPuzzleTile(tileIndex) {
    const data = LOCK_CHALLENGES[state.skill];
    if (!data || state.puzzleLocked || state.puzzleSolved) return;

    const tile = refs.puzzleTiles.querySelector(`[data-index="${tileIndex}"]`);
    if (!tile || tile.disabled) return;

    const slotIndex = state.picked.length;
    if (slotIndex >= data.cheat.length) return;

    state.picked.push({ letter: tile.textContent, tileIndex });
    tile.disabled = true;

    const slot = refs.puzzleSlots.children[slotIndex];
    slot.textContent = tile.textContent;
    slot.disabled = false;
    slot.setAttribute('aria-label', `Slot ${slotIndex + 1}, ${tile.textContent}. Click to remove.`);

    updatePuzzleProgress();

    if (state.picked.length === data.cheat.length) finishPuzzle();
  }

  function buildPuzzle(data, key) {
    state.picked = [];
    state.puzzleLocked = false;
    state.puzzleSolved = false;
    refs.puzzle.classList.remove('is-solved', 'is-wrong');
    refs.puzzleClue.textContent = data.clue;

    refs.puzzleSlots.replaceChildren();
    refs.puzzleTiles.replaceChildren();

    const scrambled = scrambleCode(data.cheat, key);

    [...scrambled].forEach((letter, index) => {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'gate-tile';
      tile.textContent = letter;
      tile.dataset.index = String(index);
      tile.setAttribute('aria-label', `Letter ${letter}`);
      tile.addEventListener('click', () => pickPuzzleTile(index));
      refs.puzzleTiles.append(tile);
    });

    for (let index = 0; index < data.cheat.length; index += 1) {
      const slot = document.createElement('button');
      slot.type = 'button';
      slot.className = 'gate-slot';
      slot.disabled = true;
      slot.setAttribute('aria-label', `Slot ${index + 1}, empty`);
      slot.addEventListener('click', () => undoPuzzleFrom(index));
      refs.puzzleSlots.append(slot);
    }

    updatePuzzleProgress();
  }

  async function typeQuestion(data, token) {
    const reduced = prefersReducedMotion();
    refs.output.replaceChildren();
    refs.output.setAttribute(
      'aria-label',
      `${data.label} challenge: ${data.question.filter(Boolean).join(' ')}`
    );

    const lines = [
      { text: `$ challenge --topic ${data.label.toUpperCase()}`, className: 'gate-line-cmd' },
      { text: '', className: '' },
      { text: `> ${data.label.toUpperCase()} // AUTH CHALLENGE`, className: 'gate-line-tag' },
      ...data.question.map((line) => ({
        text: line ? `  ${line}` : '',
        className: 'gate-line-question',
      })),
    ];

    for (const line of lines) {
      if (token !== state.typeToken) return;

      const row = document.createElement('div');
      row.className = `gate-line ${line.className}`.trim();
      const textElement = document.createElement('span');
      row.append(textElement);

      if (!reduced) {
        const caret = document.createElement('span');
        caret.className = 'gate-caret';
        caret.setAttribute('aria-hidden', 'true');
        row.append(caret);
      }

      refs.output.append(row);
      refs.output.scrollTop = refs.output.scrollHeight;

      if (reduced) {
        textElement.textContent = line.text;
      } else {
        const characters = [...line.text];
        let index = 0;
        while (index < characters.length) {
          if (token !== state.typeToken) return;
          const chunk = 3 + Math.floor(Math.random() * 3);
          textElement.textContent += characters.slice(index, index + chunk).join('');
          index += chunk;
          await wait(10 + Math.random() * 8);
        }
      }

      const caret = row.querySelector('.gate-caret');
      if (caret) caret.remove();

      if (!reduced) await wait(30);
      refs.output.scrollTop = refs.output.scrollHeight;
    }
  }

  function chooseSkill(key) {
    const data = LOCK_CHALLENGES[key];
    if (!data || state.solved || state.closing) return;

    clearGateTimeouts();
    clearCountdown();
    state.typeToken += 1;
    const token = state.typeToken;

    state.skill = key;
    state.attempts = 0;
    state.hintIndex = 0;
    state.puzzleLocked = false;
    state.puzzleSolved = false;

    refs.intro.hidden = true;
    refs.challenge.hidden = false;
    refs.success.hidden = true;
    gate.classList.add('is-challenging');
    gate.setAttribute('aria-labelledby', 'gate-challenge-title');
    gate.setAttribute('aria-describedby', 'gate-feedback');

    refs.challengeEyebrow.textContent = `CHALLENGE // ${data.label.toUpperCase()}`;
    refs.challengeTitle.textContent = 'One tricky question.';
    refs.terminalTitle.textContent = `guest@mamun: ~ /${key}`;
    refs.readoutSkill.textContent = data.label.toUpperCase();
    refs.readoutChallenge.textContent = 'TRICKY QUESTION';
    refs.readoutStatus.textContent = 'AWAITING INPUT';
    refs.status.textContent = 'STATUS: CHALLENGE ARMED';
    refs.lockState.textContent = 'LOCKED';

    refs.answer.value = '';
    refs.answer.disabled = false;
    refs.submit.disabled = false;
    refs.hintBtn.disabled = false;
    refs.resetBtn.disabled = false;
    refs.attempts.textContent = 'ATTEMPTS: 0';
    refs.feedback.textContent = `Challenge armed for ${data.label}. Type your answer or rebuild the cheat code below.`;
    refs.feedback.className = 'gate-feedback';

    buildPuzzle(data, key);
    typeQuestion(data, token);

    gateTimeout(() => {
      if (token === state.typeToken) refs.answer.focus({ preventScroll: true });
    }, 380);
  }

  function goBackToSkills() {
    if (state.solved || state.closing) return;

    clearGateTimeouts();
    clearCountdown();
    state.typeToken += 1;
    const previousSkill = state.skill;
    state.skill = null;

    refs.challenge.hidden = true;
    refs.success.hidden = true;
    refs.intro.hidden = false;
    gate.classList.remove('is-challenging');
    gate.setAttribute('aria-labelledby', 'lock-gate-title');
    gate.setAttribute('aria-describedby', 'lock-gate-desc');
    refs.status.textContent = 'STATUS: LOCKED';
    refs.lockState.textContent = 'LOCKED';
    refs.readoutSkill.textContent = 'UNSET';
    refs.readoutChallenge.textContent = '—';
    refs.readoutStatus.textContent = 'AWAITING INPUT';

    const previousButton = skillButtons.find((button) => button.dataset.skill === previousSkill);
    (previousButton || skillButtons[0] || refs.skip).focus({ preventScroll: true });
  }

  function showNextHint() {
    const data = LOCK_CHALLENGES[state.skill];
    if (!data || state.solved) return;

    if (state.hintIndex >= data.hints.length) {
      refs.hintBtn.disabled = true;
      setFeedback('All hints revealed. The decryption puzzle is the friendly back door.', 'warn');
      return;
    }

    const hint = data.hints[state.hintIndex];
    state.hintIndex += 1;
    appendLine(`? hint ${state.hintIndex} // ${hint}`, 'gate-line-hint');
    setFeedback(`Hint ${state.hintIndex} of ${data.hints.length} unlocked.`, 'info');
    refs.readoutStatus.textContent = `HINT ${state.hintIndex}/${data.hints.length}`;

    if (state.hintIndex >= data.hints.length) refs.hintBtn.disabled = true;
    refs.answer.focus({ preventScroll: true });
  }

  function denyAnswer(raw) {
    const data = LOCK_CHALLENGES[state.skill];
    if (!data) return;

    state.attempts += 1;
    refs.attempts.textContent = `ATTEMPTS: ${state.attempts}`;
    refs.readoutStatus.textContent = `DENIED ×${state.attempts}`;
    refs.status.textContent = 'STATUS: ACCESS DENIED';
    refs.answer.select();
    appendLine(`$ ${raw}`, 'gate-line-cmd');
    appendLine(`✗ ACCESS DENIED // attempt ${state.attempts}`, 'gate-line-error');
    shakeLock();

    if (state.attempts === 2) {
      setFeedback('Still locked. That second failure unlocks a hint for free.', 'error');
      showNextHint();
    } else if (state.attempts >= 3) {
      setFeedback('The lock is patient. Use [ HINT ] or decode the puzzle for the cheat code.', 'error');
    } else {
      setFeedback('Not quite. Press [ HINT ] for a nudge, or solve the decryption puzzle below.', 'error');
    }
  }

  function evaluateAnswer(raw) {
    if (!state.open || state.solved || !state.skill) return;

    const data = LOCK_CHALLENGES[state.skill];
    const value = String(raw || '').trim();

    if (!value) {
      setFeedback('Type an answer or the cheat code first.', 'warn');
      refs.answer.focus({ preventScroll: true });
      return;
    }

    const normalized = normalizeAnswer(value);

    if (normalized === normalizeAnswer(data.cheat)) {
      appendLine(`$ ${value}`, 'gate-line-cmd');
      unlock('cheat');
      return;
    }

    if (data.answers.some((answer) => normalizeAnswer(answer) === normalized)) {
      appendLine(`$ ${value}`, 'gate-line-cmd');
      unlock('answer');
      return;
    }

    denyAnswer(value);
  }

  function startCountdown() {
    clearCountdown();
    let remaining = 3;

    state.countdownTimer = window.setInterval(() => {
      remaining -= 1;
      if (remaining > 0) {
        refs.countdownLabel.textContent = `UNLOCKING PIPELINE IN ${remaining}…`;
        return;
      }

      refs.countdownLabel.textContent = 'ACCESS GRANTED — WELCOME IN.';
      clearCountdown();
      closeGate('unlocked');
    }, 1000);
  }

  function unlock(method) {
    if (state.solved || !state.skill) return;

    clearGateTimeouts();
    state.solved = true;
    state.typeToken += 1;
    sessionSet(PASS_KEY, 'true');

    const data = LOCK_CHALLENGES[state.skill];
    const extra =
      method === 'cheat'
        ? 'You decoded the cheat code instead of answering — honestly, the pipeline respects a good back door.'
        : 'You answered it straight. No hints, no tricks. The pipeline approves.';

    gate.classList.add('is-unlocked');
    gate.classList.remove('is-challenging', 'is-denied');
    refs.lockSvg.classList.add('is-unlocked');
    refs.lockState.textContent = 'OPEN';
    refs.status.textContent = 'STATUS: ACCESS GRANTED';
    refs.readoutStatus.textContent = 'UNLOCKED';
    refs.challenge.hidden = true;
    refs.success.hidden = false;
    gate.setAttribute('aria-labelledby', 'gate-success-title');
    gate.setAttribute('aria-describedby', 'gate-success-message');
    refs.successTitle.textContent = method === 'cheat' ? 'Clever. Very clever.' : 'You belong here.';
    refs.successMessage.textContent = `${data.success} ${extra}`;
    refs.answer.disabled = true;
    refs.submit.disabled = true;
    refs.hintBtn.disabled = true;
    refs.resetBtn.disabled = true;
    refs.countdownBar.style.transform = 'scaleX(0)';
    refs.countdownLabel.textContent = 'UNLOCKING PIPELINE IN 3…';

    if (refs.main) refs.main.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        refs.countdownBar.style.transform = 'scaleX(1)';
      });
    });

    startCountdown();
    refs.enterBtn.focus({ preventScroll: true });
  }

  function resetChallenge() {
    if (!state.skill || state.solved) return;
    chooseSkill(state.skill);
  }

  refs.form.addEventListener('submit', (event) => {
    event.preventDefault();
    evaluateAnswer(refs.answer.value);
  });

  skillButtons.forEach((button) => {
    button.addEventListener('click', () => chooseSkill(button.dataset.skill));
  });

  refs.skip.addEventListener('click', skipAsVisitor);
  if (refs.skipInline) refs.skipInline.addEventListener('click', skipAsVisitor);
  refs.backBtn.addEventListener('click', goBackToSkills);
  refs.hintBtn.addEventListener('click', showNextHint);
  refs.resetBtn.addEventListener('click', resetChallenge);
  refs.enterBtn.addEventListener('click', () => {
    clearCountdown();
    closeGate('unlocked');
  });

  return {
    open: openGate,
    close: () => closeGate('manual'),
  };
}
