/**
 * Viewport capability checks.
 *
 * Phones and tablets use the classic flowing document layout: the fixed 3D
 * stage requires scrolling *inside* each station panel, which fights with
 * touch scrolling. Desktop keeps the full 3D fly-through.
 */

export const COMPACT_VIEWPORT_QUERY = '(max-width: 900px), ((pointer: coarse) and (hover: none))';

export function isCompactViewport() {
  return window.matchMedia(COMPACT_VIEWPORT_QUERY).matches;
}
