/**
 * Escapes angle brackets so user text can't close the XML fence a prompt puts
 * around it. Text decoded from HTML entities (`&lt;/comments&gt;` becomes a
 * real tag) must go through this after decoding, not before.
 */
export const fenced = (text: string) =>
  text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
