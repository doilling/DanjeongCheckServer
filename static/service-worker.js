'use strict';

// 5.0.7 migration shim:
// Existing installations may still request /danjeong/service-worker.js.
// The page now registers /danjeong/sw.js with scope /danjeong/.
importScripts('/danjeong/sw.js');
