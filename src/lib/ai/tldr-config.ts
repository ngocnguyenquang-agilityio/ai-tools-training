// Shared by the server (`getTldr`) and the client (`TldrButton`). It lives in
// a plain module because a value imported from a "use client" file is only a
// client reference on the server.

/** Below this many comments there's too little discussion to summarize. */
export const TLDR_MIN_COMMENTS = 5;
