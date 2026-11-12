/**
 * Parser for SAP-style command bar and Easter eggs
 * Handles T-codes (/nSE38, /nVA01, /nME21N, /nSE16, /nHOME, /nPROJ, /nCONTACT, /nPORBO, /nYT, help, import this)
 */

export interface CommandResult {
  type: 'navigate' | 'zen' | 'help' | 'unknown' | 'clear';
  targetId?: string;
  label?: string;
  message: string;
}

export function parseCommand(raw: string): CommandResult {
  const cmd = (raw || '').trim().toLowerCase();

  if (!cmd) {
    return {
      type: 'unknown',
      message: 'Enter a valid transaction code or type "help".',
    };
  }

  if (cmd === 'help') {
    return {
      type: 'help',
      message: 'Commands: /nSE38 (ABAP), /nVA01 (SD), /nME21N (MM), /nSE16 (Toolbelt), /nPORBO (porbobd.com), /nPROJ (Projects), /nCONTACT (Contact), "import this".',
    };
  }

  if (cmd === 'import this') {
    return {
      type: 'zen',
      message: 'The Zen of Python, by Tim Peters',
    };
  }

  if (cmd === 'clear') {
    return {
      type: 'clear',
      message: 'Cleared command console.',
    };
  }

  // T-Codes mapping
  const tcodes: Record<string, { targetId: string; label: string }> = {
    '/nse38': { targetId: 'station-sap-abap', label: 'SE38: ABAP Program Development' },
    '/nva01': { targetId: 'station-sap-sd', label: 'VA01: Create Sales Order (SD)' },
    '/nme21n': { targetId: 'station-sap-mm', label: 'ME21N: Create Purchase Order (MM)' },
    '/nse16': { targetId: 'section-02-transform', label: 'SE16: Data Browser / Toolbelt' },
    '/nhome': { targetId: 'section-00-source', label: 'SOURCE: Hero Refinery' },
    '/nporbo': { targetId: 'porbobd-spotlight', label: 'PORBOBD: Special Venture Spotlight' },
    '/nproj': { targetId: 'section-03-load', label: 'LOAD: Repository Records' },
    '/ncontact': { targetId: 'section-06-report', label: 'REPORT: Communication Endpoint' },
    '/nyt': { targetId: 'section-06-report', label: 'YOUTUBE: @MamunTheProgrammer Channel' },
  };

  if (tcodes[cmd]) {
    return {
      type: 'navigate',
      targetId: tcodes[cmd].targetId,
      label: tcodes[cmd].label,
      message: `Navigating to ${tcodes[cmd].label}...`,
    };
  }

  return {
    type: 'unknown',
    message: `Unknown command "${raw}". Type "help" for a list of SAP transaction codes.`,
  };
}
