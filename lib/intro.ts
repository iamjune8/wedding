/** Shared settings for the opening sequence (CSS drives the motion; JS only skips it). */

export const INTRO_STORAGE_KEY = 'nj-intro-seen';

/** When the last opening scene has settled (latest delay in the hero + its duration). */
export const INTRO_DURATION_MS = 7800;

/**
 * Runs in <head> before first paint. Skips the opening sequence when the guest has already
 * seen it this session or arrived on a deep link (e.g. /#mehndi). Must stay dependency-free.
 */
export const INTRO_HEAD_SCRIPT = `(function(){try{var d=document.documentElement;if((location.hash&&location.hash.length>1)||sessionStorage.getItem('${INTRO_STORAGE_KEY}')==='1'){d.setAttribute('data-intro','skip')}}catch(e){}})();`;
