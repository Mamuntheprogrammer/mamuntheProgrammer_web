import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCommand } from '../js/utils/command-parser.js';
import { filterAndFormatRepos } from '../js/utils/github-filter.js';
import { generateSpinePath, clamp, interpolate } from '../js/utils/spine-math.js';

test('parseCommand handles valid SAP transaction codes and easter eggs', () => {
  assert.equal(parseCommand('/nSE38').type, 'navigate');
  assert.equal(parseCommand('/nse38').targetId, 'station-sap-abap');
  assert.equal(parseCommand('/nVA01').targetId, 'station-sap-sd');
  assert.equal(parseCommand('/nME21N').targetId, 'station-sap-mm');
  assert.equal(parseCommand('/nSE16').targetId, 'section-02-transform');
  assert.equal(parseCommand('/nHOME').targetId, 'section-00-source');
  assert.equal(parseCommand('/nPORBO').targetId, 'porbobd-spotlight');
  assert.equal(parseCommand('/nYT').targetId, 'section-06-report');
  assert.equal(parseCommand('/nPROJ').targetId, 'section-03-load');
  assert.equal(parseCommand('/nCONTACT').targetId, 'section-06-report');

  assert.equal(parseCommand('help').type, 'help');
  assert.equal(parseCommand('import this').type, 'zen');
  assert.equal(parseCommand('clear').type, 'clear');
  assert.equal(parseCommand('unknown_cmd').type, 'unknown');
  assert.equal(parseCommand('').type, 'unknown');
});

test('filterAndFormatRepos excludes forks and empty repos while prioritizing featured items', () => {
  const sampleRepos = [
    {
      name: 'forked-repo',
      description: 'Some forked library',
      language: 'Python',
      html_url: 'https://github.com/fork',
      stargazers_count: 10,
      fork: true,
      size: 100,
    },
    {
      name: 'Excel_to_sql',
      description: null,
      language: 'Python',
      html_url: 'https://github.com/Mamuntheprogrammer/Excel_to_sql',
      stargazers_count: 2,
      fork: false,
      size: 50,
    },
    {
      name: 'Excel_Merger_Desktop_Application-',
      description: 'Simple Python Gui Application that merge multiple excel files.',
      language: 'Python',
      html_url: 'https://github.com/Mamuntheprogrammer/Excel_Merger_Desktop_Application-',
      stargazers_count: 0,
      fork: false,
      size: 50,
    },
    {
      name: 'empty-test-repo',
      description: null,
      language: null,
      html_url: 'https://github.com/empty',
      stargazers_count: 0,
      fork: false,
      size: 0,
    },
  ];

  const filtered = filterAndFormatRepos(sampleRepos);
  assert.equal(filtered.length, 2); // Excludes fork and empty test repo
  assert.equal(filtered[0].featured, true);
  assert.equal(filtered[0].name, 'Excel_to_sql');
  // Strict honesty: known description substituted without hallucinating metrics
  assert.ok(filtered[0].description.includes('Excel2SQL'));
});

test('generateSpinePath returns valid SVG paths for desktop and mobile', () => {
  const mobilePath = generateSpinePath(400, 2000);
  assert.ok(mobilePath.startsWith('M 28 0'));

  const desktopPath = generateSpinePath(1440, 3000);
  assert.ok(desktopPath.startsWith('M'));
  assert.ok(desktopPath.includes('C'));

  assert.equal(clamp(5, 0, 10), 5);
  assert.equal(clamp(-2, 0, 10), 0);
  assert.equal(clamp(15, 0, 10), 10);
  assert.equal(interpolate(10, 20, 0.5), 15);
});
