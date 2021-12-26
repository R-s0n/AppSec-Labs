(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
(function (process){(function (){
// 'path' module extracted from Node.js v8.11.1 (only the posix part)
// transplited with Babel

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

function assertPath(path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string. Received ' + JSON.stringify(path));
  }
}

// Resolves . and .. elements in a path with directory names
function normalizeStringPosix(path, allowAboveRoot) {
  var res = '';
  var lastSegmentLength = 0;
  var lastSlash = -1;
  var dots = 0;
  var code;
  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (code === 47 /*/*/)
      break;
    else
      code = 47 /*/*/;
    if (code === 47 /*/*/) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /*.*/ || res.charCodeAt(res.length - 2) !== 46 /*.*/) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf('/');
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = '';
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += '/..';
          else
            res = '..';
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += '/' + path.slice(lastSlash + 1, i);
        else
          res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 /*.*/ && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root;
  var base = pathObject.base || (pathObject.name || '') + (pathObject.ext || '');
  if (!dir) {
    return base;
  }
  if (dir === pathObject.root) {
    return dir + base;
  }
  return dir + sep + base;
}

var posix = {
  // path.resolve([from ...], to)
  resolve: function resolve() {
    var resolvedPath = '';
    var resolvedAbsolute = false;
    var cwd;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path;
      if (i >= 0)
        path = arguments[i];
      else {
        if (cwd === undefined)
          cwd = process.cwd();
        path = cwd;
      }

      assertPath(path);

      // Skip empty entries
      if (path.length === 0) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === 47 /*/*/;
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);

    if (resolvedAbsolute) {
      if (resolvedPath.length > 0)
        return '/' + resolvedPath;
      else
        return '/';
    } else if (resolvedPath.length > 0) {
      return resolvedPath;
    } else {
      return '.';
    }
  },

  normalize: function normalize(path) {
    assertPath(path);

    if (path.length === 0) return '.';

    var isAbsolute = path.charCodeAt(0) === 47 /*/*/;
    var trailingSeparator = path.charCodeAt(path.length - 1) === 47 /*/*/;

    // Normalize the path
    path = normalizeStringPosix(path, !isAbsolute);

    if (path.length === 0 && !isAbsolute) path = '.';
    if (path.length > 0 && trailingSeparator) path += '/';

    if (isAbsolute) return '/' + path;
    return path;
  },

  isAbsolute: function isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47 /*/*/;
  },

  join: function join() {
    if (arguments.length === 0)
      return '.';
    var joined;
    for (var i = 0; i < arguments.length; ++i) {
      var arg = arguments[i];
      assertPath(arg);
      if (arg.length > 0) {
        if (joined === undefined)
          joined = arg;
        else
          joined += '/' + arg;
      }
    }
    if (joined === undefined)
      return '.';
    return posix.normalize(joined);
  },

  relative: function relative(from, to) {
    assertPath(from);
    assertPath(to);

    if (from === to) return '';

    from = posix.resolve(from);
    to = posix.resolve(to);

    if (from === to) return '';

    // Trim any leading backslashes
    var fromStart = 1;
    for (; fromStart < from.length; ++fromStart) {
      if (from.charCodeAt(fromStart) !== 47 /*/*/)
        break;
    }
    var fromEnd = from.length;
    var fromLen = fromEnd - fromStart;

    // Trim any leading backslashes
    var toStart = 1;
    for (; toStart < to.length; ++toStart) {
      if (to.charCodeAt(toStart) !== 47 /*/*/)
        break;
    }
    var toEnd = to.length;
    var toLen = toEnd - toStart;

    // Compare paths to find the longest common path from root
    var length = fromLen < toLen ? fromLen : toLen;
    var lastCommonSep = -1;
    var i = 0;
    for (; i <= length; ++i) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === 47 /*/*/) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from='/foo/bar'; to='/foo/bar/baz'
            return to.slice(toStart + i + 1);
          } else if (i === 0) {
            // We get here if `from` is the root
            // For example: from='/'; to='/foo'
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === 47 /*/*/) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from='/foo/bar/baz'; to='/foo/bar'
            lastCommonSep = i;
          } else if (i === 0) {
            // We get here if `to` is the root.
            // For example: from='/foo'; to='/'
            lastCommonSep = 0;
          }
        }
        break;
      }
      var fromCode = from.charCodeAt(fromStart + i);
      var toCode = to.charCodeAt(toStart + i);
      if (fromCode !== toCode)
        break;
      else if (fromCode === 47 /*/*/)
        lastCommonSep = i;
    }

    var out = '';
    // Generate the relative path based on the path difference between `to`
    // and `from`
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47 /*/*/) {
        if (out.length === 0)
          out += '..';
        else
          out += '/..';
      }
    }

    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if (out.length > 0)
      return out + to.slice(toStart + lastCommonSep);
    else {
      toStart += lastCommonSep;
      if (to.charCodeAt(toStart) === 47 /*/*/)
        ++toStart;
      return to.slice(toStart);
    }
  },

  _makeLong: function _makeLong(path) {
    return path;
  },

  dirname: function dirname(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    var code = path.charCodeAt(0);
    var hasRoot = code === 47 /*/*/;
    var end = -1;
    var matchedSlash = true;
    for (var i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          if (!matchedSlash) {
            end = i;
            break;
          }
        } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    if (end === -1) return hasRoot ? '/' : '.';
    if (hasRoot && end === 1) return '//';
    return path.slice(0, end);
  },

  basename: function basename(path, ext) {
    if (ext !== undefined && typeof ext !== 'string') throw new TypeError('"ext" argument must be a string');
    assertPath(path);

    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;

    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext.length === path.length && ext === path) return '';
      var extIdx = ext.length - 1;
      var firstNonSlashEnd = -1;
      for (i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i);
        if (code === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }

      if (start === end) end = firstNonSlashEnd;else if (end === -1) end = path.length;
      return path.slice(start, end);
    } else {
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // path component
          matchedSlash = false;
          end = i + 1;
        }
      }

      if (end === -1) return '';
      return path.slice(start, end);
    }
  },

  extname: function extname(path) {
    assertPath(path);
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    for (var i = path.length - 1; i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1)
            startDot = i;
          else if (preDotState !== 1)
            preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      return '';
    }
    return path.slice(startDot, end);
  },

  format: function format(pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
    }
    return _format('/', pathObject);
  },

  parse: function parse(path) {
    assertPath(path);

    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0) return ret;
    var code = path.charCodeAt(0);
    var isAbsolute = code === 47 /*/*/;
    var start;
    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;

    // Get non-dir info
    for (; i >= start; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
    // We saw a non-dot character immediately before the dot
    preDotState === 0 ||
    // The (right-most) trimmed path component is exactly '..'
    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute) ret.base = ret.name = path.slice(1, end);else ret.base = ret.name = path.slice(startPart, end);
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
      }
      ret.ext = path.slice(startDot, end);
    }

    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);else if (isAbsolute) ret.dir = '/';

    return ret;
  },

  sep: '/',
  delimiter: ':',
  win32: null,
  posix: null
};

posix.posix = posix;

module.exports = posix;

}).call(this)}).call(this,require('_process'))
},{"_process":3}],3:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],4:[function(require,module,exports){
const AE = require('analytical-engine');

window.run = (cards) => {
    let inf = new AE.Interface();
    inf.submitProgram(cards);
    inf.runToCompletion();
    return inf;
};
},{"analytical-engine":5}],5:[function(require,module,exports){
const Annunciator = require('./scripts/annunciator');
const Timing = require('./scripts/timing');
const Printer = require('./scripts/printer');
const CurveDrawingApparatus = require('./scripts/curvedrawing');
const Attendant = require('./scripts/attendant');
const Mill = require('./scripts/mill');
const Program = require('./scripts/program');
const Store = require('./scripts/store');
const Engine = require('./scripts/engine');

exports.Annunciator = Annunciator;
exports.Timing = Timing;
exports.Printer = Printer;
exports.CurveDrawingApparatus = CurveDrawingApparatus;
exports.Attendant = Attendant;
exports.Mill = Mill;
exports.Program = Program;
exports.Store = Store;
exports.Engine = Engine;

function Interface() {
	// Annunciator
	this.annunciator = new Annunciator();

	//  Timing
	this.timing = new Timing();

	//  Printer
	this.printer = new Printer();

	//  Curve Drawing Apparatus
	this.curveDrawingApparatus = new CurveDrawingApparatus(512, 512);

	//  Attendant
	this.attendant = new Attendant(this.annunciator, this.timing);
	this.attendant.setLibraryTemplate("Library/$.ae");

	//  Mill
	this.mill = new Mill(this.annunciator, this.attendant, this.timing);

	//  Card Reader
	this.cardReader = new Program.CardReader(this.annunciator, this.attendant, this.timing);

	//  Store
	this.store = new Store(this.annunciator, this.attendant, this.timing);

	//  Engine
	this.engine = new Engine(this.annunciator, this.attendant, this.mill, this.store, this.cardReader, this.printer, this.curveDrawingApparatus);
}

Interface.prototype.clearState = function() {
	this.engine.commence();
}

Interface.prototype.submitProgram = function(cards) {
	this.program = new Program.Program(cards, this.attendant, this.cardReader, this.store, this.curveDrawingApparatus, this.timing, this.engine);
	return this.program.submit();
}

Interface.prototype.runToCompletion = function() {
	//library loads gave no errors, run the program
	this.annunciator.setOverride(true);
	this.engine.start();
	this.annunciator.setOverride(false);
	while(this.engine.processCard()) {}
	this.annunciator.setOverride(true);
	this.engine.halt();
	this.annunciator.setOverride(false);
}

exports.Interface = Interface;

},{"./scripts/annunciator":6,"./scripts/attendant":7,"./scripts/curvedrawing":8,"./scripts/engine":10,"./scripts/mill":11,"./scripts/printer":12,"./scripts/program":13,"./scripts/store":14,"./scripts/timing":15}],6:[function(require,module,exports){
//  The Annunciator Panel

"use strict";

function Annunciator() {
  this.L_output = "";
  this.M_ingress = [];
  this.M_egress = [];
  this.M_op = "";
  this.M_runup = "";
  this.M_runstop = "";

  this.tracing = false;
  this.animating = false;
  this.override = false;
  this.watch = false;
  this.bellSound = null;
  this.audioVolume = 0.3;
  this.panelShowing = true;

  this.cardChain = null; // Card chain for panel display
  this.currentCard = 0;
}

Annunciator.prototype.setBellSound = function(soundfile) {
  console.log("Function disabled");
};

//  Ring the bell
Annunciator.prototype.ringBell = function() {
  console.log("Bell ring!");
};

//  Append a message to the Attendant's Log
Annunciator.prototype.attendantLogMessage = function(s) {
  this.L_output += s;
};

//  Write an item to the Mill operation trace
Annunciator.prototype.attendantWriteTrace = function(s) {
  this.attendantLogMessage(s);
};

//  Decide whether the attendant is watching the panel
Annunciator.prototype.watchMan = function() {
  this.watch = this.tracing || this.animating || this.override;
  return this.watch;
};

//  Set or clear tracing
Annunciator.prototype.setTrace = function(t) {
  this.tracing = t;
  this.watchMan();
};

//  Set or clear animating
Annunciator.prototype.setAnimate = function(t) {
  this.animating = t;
  this.watchMan();
};

//	Set or clear status display override
Annunciator.prototype.setOverride = function(t) {
  this.override = t;
  this.watchMan();
};

//  Set or clear annunciator panel visible
Annunciator.prototype.setPanelShowing = function(t) {
  this.panelShowing = t;
  this.watchMan();
};

//  Mount new chain in card reader display
Annunciator.prototype.mountCardReaderChain = function(chain) {
  this.cardChain = chain;
  this.currentCard = 0;
};

//  Change Mill ingress axis value
Annunciator.prototype.changeIngress = function(which, v) {
  if (this.watch) {
    this.M_ingress[which] = v.toString();
  }
};

//  Change Mill egress axis value
Annunciator.prototype.changeEgress = function(which, v) {
  if (this.watch) {
    this.M_egress[which] = v.toString();
  }
};

//  Change current Mill operation
Annunciator.prototype.changeOperation = function(op) {
  if (this.watch) {
    this.M_op = op == "-" ? C_minus : op;
  }
};

//  Change state of Mill run up lever
Annunciator.prototype.changeRunUp = function(runup) {
  if (this.watch) {
    this.M_runup = runup ? "Set" : "Not set";
  }
};

//  Change Mill run/stop state
Annunciator.prototype.changeMillRunning = function(run) {
  if (this.watch) {
    this.M_runstop = run ? "Running" : "Stopped";
  }
};

module.exports = Annunciator;

},{}],7:[function(require,module,exports){
(function (__dirname){(function (){
const fs = require("fs");
const path = require("path");
const bigInt = require("big-integer");

const definitions = require('./definitions');
const Program = require('./program');
const CardSource = Program.CardSource;
const Card = Program.Card;

//  The Attendant

("use strict");

function Attendant(p, t) {
  this.panel = p;
  this.timing = t;
  this.reset();
}

//  Reset to starting conditions
Attendant.prototype.reset = function() {
  this.newCardChain();
  this.timing.reset();
  this.allowFileInclusion = false;
  this.annotationDevice = null;

  this.Source = new CardSource("Attendant", -1);
  this.addComments = true;
  this.libraryTemplate = null;
  this.libLoadStatus = 0; // Library load status: 0 = idle, 1 = pending, 2 = error
  this.allowFileInclusion = false;

  this.restart();
};

//	Reset modes to defaults at start of card chain
Attendant.prototype.restart = function() {
  this.writeDown = true;
  this.numberPicture = null;
};

//  Begin a new chain of cards
Attendant.prototype.newCardChain = function() {
  this.cardChain = [];
  this.ncards = 0;
  this.errorDetected = false;
};

//  Append a card to the card chain
Attendant.prototype.appendCard = function(ctext, sname, sindex) {
  var cardSource = new CardSource(sname, sindex);
  var card = new Card(ctext, this.ncards, cardSource);
  this.cardChain[this.ncards++] = card;
};

//  Issue a complaint when an error is found in the card chain
Attendant.prototype.complain = function(c, s) {
  this.panel.attendantLogMessage(c + "\n");
  this.panel.attendantLogMessage(s + "\n");
  this.errorDetected = true;
};

//  Dump the card chain to the Attendant's log for debugging
Attendant.prototype.logCards = function() {
  for (var i = 0; i < this.cardChain.length; i++) {
    this.traceLog(this.cardChain[i].toString());
  }
  if (this.ncards != this.cardChain.length) {
    this.traceLog(
      "ncards (" +
        this.ncards +
        " disagrees with this.cardChain.length (" +
        this.cardChain.length +
        ")"
    );
  }
};

/*  Test whether this card marks the end of a cycle
        which is to be translated into combinatorial
        cards.  */
Attendant.prototype.isCycleStart = function(c) {
  var s = c.text;

  return s.length > 0 && (s.charAt(0) == "(" || s.charAt(0) == "{");
};

//  Test whether this card marks the end of a cycle.
Attendant.prototype.isCycleEnd = function(c) {
  var s = c.text;

  return s.length > 0 && (s.charAt(0) == ")" || s.charAt(0) == "}");
};

//  Test whether card is a comment.
Attendant.prototype.isComment = function(c) {
  var s = c.text;

  return s.length < 1 || s.charAt(0) == "." || s.charAt(0) == " ";
};

/*
  Translate a cycle into equivalent combinatorial
  cards the Mill can process.  If addComments
  is set the original attendant request cards are
  left in place as comments; otherwise they are
  removed.  If the cycle contains a cycle,
  translateCycle calls itself to translate the
  inner cycle.

  Warning: fiddling with the logic that computes
  the number of cards the combinatorial cards skip
  may lead to a skull explosion.  The correct number
  depends on the type of cycle, whether or not an
  else branch exists on a conditional, and whether
  comments are being retained or deleted, and is
  intimately associated with precisely where the
  combinatorial card is inserted when comments are
  being retained.
*/

Attendant.prototype.translateCycle = function(cards, start) {
  var c = cards[start];
  var s = c.text;
  var which = s.charAt(0);
  var depends = false, error = false;
  var i;

  if (s.length > 1) {
    depends = s.charAt(1) == "?";
  }
  if (this.addComments) {
    c.text = ". " + s + " Translated by attendant";
  } else {
    cards.splice(start, 1);
    start--;
  }

  /*  Search for the end of this cycle.  If a sub-cycle
            is detected, recurse to translate it.  */

  for (i = start + 1; i < cards.length; i++) {
    var u = cards[i];

    if (this.isCycleStart(u)) {
      this.translateCycle(cards, i);
    }
    if (this.isCycleEnd(u)) {
      var isElse = u.text.match(/^}{/);

      if (u.text.charAt(0) != (which == "(" ? ")" : "}")) {
        this.complain(
          u,
          "End of cycle does not match " + which + " beginning on card " + start
        );
        error = true;
      }
      if (this.addComments) {
        u.text = ". " + u.text + " Translated by attendant";
      } else {
        cards.splice(i, 1);
      }
      if (which == "(") {
        //  It's a loop

        cards.splice(
          i,
          0,
          new Card("CB" + (depends ? "?" : "+") + (i - start), -1, this.Source)
        );
      } else {
        //  It's a forward skip, possibly with an else clause

        cards.splice(
          start + 1,
          0,
          new Card(
            "CF" +
              (depends ? "?" : "+") +
              ((isElse
                ? this.addComments ? 1 : 0
                : this.addComments ? 0 : -1) +
                Math.abs(i - start)) +
              "  . " +
              (isElse ? "Else" : "IfOnly") +
              " " +
              (i - start),
            -1,
            this.Source
          )
        );

        //  Translate else branch of conditional, if present

        if (isElse) {
          for (var j = i + 1; j < cards.length; j++) {
            u = cards[j];

            if (this.isCycleStart(u)) {
              this.translateCycle(cards, j);
            }
            if (this.isCycleEnd(u)) {
              if (u.text.charAt(0) != "}") {
                this.complain(
                  u,
                  "End of else cycle does not match " +
                    which +
                    " beginning on card " +
                    i
                );
                error = true;
              }
              if (this.addComments) {
                u.text = ". " + u.text + " Translated by attendant";
              } else {
                cards.splice(j, 1);
              }
              cards.splice(
                i + (this.addComments ? 2 : 1),
                0,
                new Card(
                  "CF+" + (Math.abs(j - i) - (this.addComments ? 1 : 1)),
                  -1,
                  this.Source
                )
              );
              return error;
            }
          }
        }
      }
      return error;
    }
  }
  this.complain(c, "No matching end of cycle.");
  return true;
};

//  Translate attendant combinatoric cards in chain to native cards
Attendant.prototype.translateCombinatorics = function(cards) {
  for (var i = 0; i < cards.length; i++) {
    if (this.isCycleStart(cards[i])) {
      this.translateCycle(cards, i);
    }
  }
};

//  Perform any requested fixed-point expansions.
Attendant.prototype.translateFixedPoint = function(cards, comments) {
  var i;
  var decimalPlace = -1;

  for (i = 0; i < cards.length; i++) {
    var thisCard = cards[i];
    var card = thisCard.text.toLowerCase();

    //  A set decimal places to [+/-]n

    if (card.match(/^a set decimal places to /)) {
      var dspec = card.substr(24).replace(/\s+$/, "");
      var relative = 0;
      var dspok = true;

      if (dspec.charAt(0) == "+" || dspec.charAt(0) == "-") {
        if (decimalPlace == -1) {
          this.complain(
            thisCard,
            "I cannot accept a relative decimal place setting\nwithout a prior absolute setting."
          );
          dspok = false;
        } else {
          relative = dspec.charAt(0) == "+" ? 1 : -1;
          dspec = dspec.substr(1);
        }
      }
      if (dspok) {
        var d = parseInt(dspec);
        if (!isNaN(d)) {
          if (relative !== 0) {
            d = decimalPlace + d * relative;
          }
          if (d < 0 || d > 50) {
            this.complain(
              thisCard,
              "I can only set the decimal place between 0 and 50 digits."
            );
          } else {
            if (comments) {
              thisCard.text = ". " + thisCard.text;
            } else {
              cards.splice(i, 1);
              i--;
            }
            decimalPlace = d;
          }
        } else {
          this.complain(
            thisCard,
            "I cannot find the number of decimal places you wish to use."
          );
        }
      }

      //  Convert "A write numbers with decimal point" to a picture
    } else if (card.match(/^a write numbers with decimal point/)) {
      var dpa;

      if (decimalPlace < 0) {
        this.complain(
          thisCard,
          "I cannot add the number of decimal places because\n" +
            "you have not instructed me how many decimal\n" +
            'places to use in a prior "A set decimal places to"\ninstruction.'
        );
        return;
      }
      thisCard.text = "A write numbers as 9.";
      for (dpa = 0; dpa < decimalPlace; dpa++) {
        thisCard.text += "9";
      }

      //  Add step up/down to "<" or ">" if not specified
    } else if (
      (card.match(/^</) || card.match(/^>/)) &&
      card.replace(/(?:\s+\.\s.*|\s+)$/, "").length == 1
    ) {
      if (decimalPlace < 0) {
        this.complain(
          thisCard,
          "I cannot add the number of decimal places because\n" +
            "you have not instructed me how many decimal\n" +
            'places to use in a prior "A set decimal places"\ninstruction.'
        );
        return;
      } else {
        thisCard.text =
          thisCard.text.replace(/(?:\s+\.\s.*|\s+)$/, "") +
          decimalPlace.toString();
        if (comments) {
          thisCard.text += " . Step count added by attendant";
        }
      }

      /*  Replace number cards with decimal points with
                cards scaled to the proper number of digits.  */
    } else if (card.match(/^n/)) {
      //StringTokenizer stok = new StringTokenizer(card.substring(1));
      var p = card.substr(1).match(/\s*(\d+)\s+((?:[\+\-\u2212])?[\d\.]+)/);
      if (p) {
        var cn, nspec;

        cn = p[1]; // Column number
        nspec = p[2]; // Number specification
        var dp = nspec.indexOf(".");

        if (dp >= 0) {
          if (decimalPlace < 0) {
            this.complain(
              thisCard,
              "I cannot add the number of decimal places because\n" +
                "you have not instructed me how many decimal\n" +
                'places to use in a prior "A set decimal places"\ninstruction.'
            );
            return;
          } else {
            var dpart = nspec.substr(dp + 1), // Decimal part
              dpnew = "";
            var j, places = 0;
            var ch;

            for (j = 0; j < dpart.length; j++) {
              if ((ch = dpart.charAt(j)).match(/\d/)) {
                dpnew += ch;
                places++;
              }
            }

            /* Now adjust the decimal part to the given number
                               of decimal places by trimming excess digits and
                               appending zeroes as required. */

            if (dpart.length > decimalPlace) {
              /* If we're trimming excess digits, round the
                                   remaining digits based on the first digit
                                   of the portion trimmed. */
              if (decimalPlace > 0 && dpart.charAt(decimalPlace) >= 5) {
                dpart = bigInt(dpart.substr(0, decimalPlace))
                  .add(bigInt(1))
                  .toString();
              } else {
                dpart = dpart.substring(0, decimalPlace);
              }
            }
            while (dpart.length < decimalPlace) {
              dpart += "0";
            }

            //  Append the decimal part to fixed part from card

            thisCard.text = "N" + cn + " " + nspec.substr(0, dp) + dpart;
            if (comments) {
              thisCard.text += " . Decimal expansion by attendant";
            }
          }
        }
      }
    }
  }
};

//	Set library template
Attendant.prototype.setLibraryTemplate = function(s) {
  this.libraryTemplate = s;
};

//	Test if library name is valid.  This avoids mischief by the user
Attendant.prototype.isLibraryNameValid = function(s) {
  return s.match(/^[abcdefghijklmnopqrstuvwxyz\-_0123456789]+$/);
};

//	Process library inclusion requests in mounted chain
Attendant.prototype.expandLibraryRequests = function(start) {
  if (this.libLoadStatus == 1) {
    // If request still pending...
    return this.libLoadStatus; // ...inform the caller
  }

  this.libLoadStatus = 0; // Set library load idle
  for (var i = start; i < this.cardChain.length; i++) {
    if (this.cardChain[i].text.match(/^a include from library cards for /i)) {
      this.lspec = this.cardChain[i].text.substr(33).toLowerCase();
      this.lspec = this.lspec.replace(/^\s+/, "");
      this.lspec = this.lspec.replace(/\s+$/, "");
      if (this.isLibraryNameValid(this.lspec) && this.libraryTemplate) {
        var url = this.libraryTemplate.replace(/\$/, this.lspec);
        this.libLoadI = i;
        this.libLoadStatus = 1;
        try {
          var text = fs.readFileSync(path.resolve(__dirname, '..', url), {
            encoding: "utf8"
          });
          var lines = text.replace(/\r\n/g, '\n').split("\n");
          this.cardChain.splice(
            this.libLoadI,
            1,
            new Card(
              ". Begin interpolation of " +
                this.lspec +
                " from library by attendant",
              -1,
              this.Source
            )
          );
          var n = this.libLoadI + 1;
          var src = new CardSource(this.lspec + " [Library]", 0);
          for (var j = 0; j < lines.length; j++) {
            this.cardChain.splice(n, 0, new Card(lines[j], j, src));
            n++;
          }
          this.cardChain.splice(
            n,
            0,
            new Card(
              ". End interpolation of " +
                this.lspec +
                " from library by attendant",
              -1,
              this.Source
            )
          );
          this.ncards = this.cardChain.length;
          this.libLoadStatus = 0; // Set library load idle
        } catch (e) {
          this.complain(
            this.cardChain[this.libLoadI],
            "Cannot load cards from library " + url + ", error " + e + "."
          );
          this.libLoadStatus = 2; // Mark library load failed
        }
      } else {
        this.complain(
          this.cardChain[i],
          'I cannot include cards from the invalid library name of "' +
            lspec +
            '".'
        );
        this.libLoadStatus = 2; // Mark library load failed
      }
    } else if (this.cardChain[i].text.match(/^a include cards /i)) {
      this.lspec = this.cardChain[i].text.substr(16);
      var url = '$.ae'.replace(/\$/, this.lspec);
      this.libLoadI = i;
      this.libLoadStatus = 1;
      try {
        var text = fs.readFileSync(path.resolve('.', url), {
          encoding: "utf8"
        });
        var lines = text.replace(/\r\n/g, '\n').split("\n");
        this.cardChain.splice(
          this.libLoadI,
          1,
          new Card(
            ". Begin interpolation of " +
              this.lspec +
              " from library by attendant",
            -1,
            this.Source
          )
        );
        var n = this.libLoadI + 1;
        var src = new CardSource(this.lspec + " [Library]", 0);
        for (var j = 0; j < lines.length; j++) {
          this.cardChain.splice(n, 0, new Card(lines[j], j, src));
          n++;
        }
        this.cardChain.splice(
          n,
          0,
          new Card(
            ". End interpolation of " +
              this.lspec +
              " from library by attendant",
            -1,
            this.Source
          )
        );
        this.ncards = this.cardChain.length;
        this.libLoadStatus = 0; // Set library load idle
      } catch (e) {
        this.complain(
          this.cardChain[this.libLoadI],
          "Cannot load cards from library " + url + ", error " + e + "."
        );
        this.libLoadStatus = 2; // Mark library load failed
      }
    }
  }
  return this.libLoadStatus;
};

//  Examine cards in the chain and perform attendant transformations
Attendant.prototype.examineCards = function(comments) {
  this.addComments = comments;
  //  If we're eliding comments, remove them from the card chain
  if (!comments) {
    for (var i = 0; i < this.cardChain.length; i++) {
      if (this.isComment(this.cardChain[i])) {
        this.cardChain.splice(i, 1);
        i--;
      }
    }
  }
  this.translateFixedPoint(this.cardChain, comments);
  this.translateCombinatorics(this.cardChain);
  this.ncards = this.cardChain.length; // Update ncards to reflect changes
};

//  Deliver completed card chain for mounting in reader
Attendant.prototype.deliverCardChain = function() {
  return this.errorDetected ? null : this.cardChain;
};

//  Process request when the mill stops on an attendant action card.
Attendant.prototype.processActionCard = function(c, printer) {
  var ok = true;
  var card = c.text;

  /*  "write"  Control the transcription of
                     output from the printer to the
                     final summary of the computation.  */

  if (card.toLowerCase().substr(1).match(/ write /)) {
    var cws = card.toLowerCase().substr(8);
    if (cws.match(/numbers as /)) {
      this.setPicture(card.substring(19));
    } else if (cws.match(/annotation /)) {
      this.writeAnnotation(card.substring(19), printer);
    } else if (cws.match(/in columns/)) {
      this.setWriteAcross();
    } else if (cws.match(/in rows/)) {
      this.setWriteDown();
    } else if (cws.match(/new line/)) {
      this.writeNewLine(printer);
    } else if (cws.match(/timing/)) {
      this.traceLog(this.timing.report());
    } else {
      ok = false;
    }
  } else {
    ok = false;
  }
  if (!ok) {
    this.complain(c, "I do not understand this request for attendant action.");
  }
  return ok;
};

//  Set picture to be used in printing subsequent numbers
Attendant.prototype.setPicture = function(pic) {
  if (pic.length < 1) {
    pic = null;
  }
  this.numberPicture = pic;
};

//  Edit a number to the current picture specification
Attendant.prototype.editToPicture = function(v) {
  var s;
  var negative = v.isNegative(), sign = false;

  if (this.numberPicture) {
    s = v.abs().toString();
    var i = this.numberPicture.length;
    var o = "";

    while (--i >= 0) {
      var c = this.numberPicture.charAt(i);

      switch (c) {
        case "9": //  Digit, unconditionally
          if (s.length === 0) {
            o = "0" + o;
          } else {
            o = s.substr(s.length - 1, s.length) + o;
            s = s.substr(0, s.length - 1);
          }
          break;

        case "#": // Digit, if number not exhausted
          if (s.length > 0) {
            o = s.substr(s.length - 1, s.length) + o;
            s = s.substr(0, s.length - 1);
          }
          break;

        case ",": // Comma if digits remain to output
          if (this.numberPicture.indexOf("9") >= 0 || s.length > 0) {
            o = c + o;
          }
          break;

        case "-": // Sign if negative
          if (negative) {
            o = "-" + o;
            sign = true;
          }
          break;

        case definitions.C_plusmn: // Plus or minus sign
          o = (negative ? "-" : "+") + o;
          sign = true;
          break;

        case "+": // Sign if negative, space if positive
          o = (negative ? "-" : " ") + o;
          sign = true;
          break;

        default:
          // Copy character to output
          o = c + o;
          break;
      }
    }
    /*  If there's any number "left over", write it to
                prevent truncation without warning.  */
    if (s.length > 0) {
      o = s + o;
    }
    /*  If the number is negative and no sign has been output
                so far, prefix it with a sign.  */
    if (negative && !sign) {
      o = "-" + o;
    }
    s = o;
  } else {
    s = v.toString();
  }

  return s;
};

//  Inform the attendant of an item to be added to the trace log.
Attendant.prototype.traceLog = function(s) {
  this.panel.attendantWriteTrace(s + "\n");
};

//  Report a Mill abnormality
Attendant.prototype.millAbnormality = function(why, card) {
  this.panel.attendantWriteTrace("Error: " + why + " card " + card + "\n");
};

//  Write selected end of line sequence at end of log item
Attendant.prototype.writeEndOfLogItem = function() {
  if (this.writeDown) {
    this.panel.attendantLogMessage("\n");
  }
};

//  Write selected end of line sequence to output apparatus
Attendant.prototype.writeEndOfItem = function(apparatus) {
  if (this.writeDown) {
    apparatus.output("\n");
  }
};

//  Write text annotation on output apparatus
Attendant.prototype.writeAnnotation = function(s, apparatus) {
  apparatus.output(s);
  this.writeEndOfItem(apparatus);
};

//  Write new line on output apparatus
Attendant.prototype.writeNewLine = function(apparatus) {
  apparatus.output("\n");
};

//  Set write across the page or down
Attendant.prototype.setWriteAcross = function() {
  this.writeDown = false;
};

Attendant.prototype.setWriteDown = function() {
  this.writeDown = true;
};

module.exports = Attendant;

}).call(this)}).call(this,"/node_modules/analytical-engine/scripts")
},{"./definitions":9,"./program":13,"big-integer":16,"fs":1,"path":2}],8:[function(require,module,exports){
const bigInt = require("big-integer");
//	Curve Drawing Apparatus

("use strict");

var K10e25 = bigInt("10000000000000000000000000"),
  Kround = bigInt("5000000000000000000000000");

function CurveDrawingApparatus(width, height) {
  this.cwid = width;
  this.chgt = height;
  this.cdim = Math.min(this.cwid, this.chgt);
  this.cscale = Math.floor(this.cdim / 2);
  this.ctrx = Math.floor(this.cwid / 2);
  this.ctry = Math.floor(this.chgt / 2);
  this.currentPen = 'black';
  this.changePaper();
}

//	Set X co-ordinate
CurveDrawingApparatus.prototype.setX = function(x) {
  this.currentX = x;
};

//	Set X co-ordinate
CurveDrawingApparatus.prototype.setY = function(y) {
  this.currentY = y;
};

//	Move, with the pen up, to the current co-ordinates
CurveDrawingApparatus.prototype.moveTo = function() {
  if (this.penDown) {
    this.displayX.push(null);
    this.displayY.push("up");
    this.penDown = false;
  }
  this.startX = this.currentX;
  this.startY = this.currentY;
};

//	Draw, with the pen down, to the current co-ordinates
CurveDrawingApparatus.prototype.drawTo = function() {
  this.displayX.push(this.scaleNum(this.currentX));
  this.displayY.push(this.cdim - this.scaleNum(this.currentY));
  if (!this.penDown) {
    this.penDown = true;
  }
};

//	Change pen to a different colour
CurveDrawingApparatus.prototype.changePen = function(colour) {
  if (this.currentPen != colour) {
    this.currentPen = colour;
    this.displayX.push(null);
    this.displayY.push("pen:" + colour);
  }
};

//	Change paper
CurveDrawingApparatus.prototype.changePaper = function() {
  this.currentX = bigInt.zero;
  this.currentY = bigInt.zero;
  this.startX = bigInt.zero;
  this.startY = bigInt.zero;
  this.penDown = false;
  this.displayX = []; // Display list
  this.displayY = [];
  this.currentPen = "black";
  this.printScreen();
};

CurveDrawingApparatus.prototype.printScreen = function() {
  let svg = `<svg width="${this.cwid}" height="${this.chgt}" xmlns="http://www.w3.org/2000/svg">`;

  //  Replay the display list, drawing vectors on screen
  var opath = false;
  var ncol;
  for (var i = 0; i < this.displayX.length; i++) {
    if (this.displayX[i] === null) {
      if ((ncol = this.displayY[i].match(/^pen:\s*(.*)\s*$/))) {
        this.currentPen = ncol[1];
      }
      if (opath) {
        svg += `" />`;
      }
      opath = false;
    } else {
      if (!opath) {
        svg += `<polyline fill="none" stroke="${this.currentPen}" stroke-width="1" points="`;
      }
      svg += `${this.displayX[i]},${this.displayY[i]} `;
      opath = true;
    }
  }

  if (opath) {
    svg += `" />`;
  }
  svg += `</svg>`;
  return svg;
};

//	Scale a fixed point co-ordinate into a pixel value
CurveDrawingApparatus.prototype.scaleNum = function(v) {
  v = v.multiply(this.cscale).add(Kround.multiply(v.isNegative() ? -1 : 1));
  v = v.divide(K10e25);
  return v.toJSNumber() + this.cscale;
};

module.exports = CurveDrawingApparatus;

},{"big-integer":16}],9:[function(require,module,exports){
const bigInt = require("big-integer");
//  Global definitions

("use strict");

//  Unicode character escapes.  Named from HTML text entities

exports.C_plusmn = "\xB1"; // Plus or minus sign
exports.C_times = "\xD7"; // Multiplication sign
exports.C_divide = "\xF7"; // Division sign
exports.C_minus = "\u2212"; // Minus sign

//  Global utility functions

//  Return true zero if bigInt is either positive or negative zero
exports.pzero = function(v) {
  return v.isZero() ? bigInt.zero : v;
};

//  Negate a bigInt by subtracting it from zero
const negate = function(v) {
  return bigInt.zero.subtract(v);
};

exports.negate = negate;

//	Edit an integer with commas between thousands
exports.commas = function(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

//  Useful bigInts

const K10e50 = bigInt("100000000000000000000000000000000000000000000000000");
exports.K10e50 = K10e50;
const Km10e50 = negate(K10e50);
exports.Km10e50 = Km10e50;
exports.K10 = bigInt(10);

//operation codes
exports.OP_NONE = 0;
exports.OP_ADD = 1;
exports.OP_SUBTRACT = 2;
exports.OP_MULTIPLY = 3;
exports.OP_DIVIDE = 4;
exports.OP_SHIFT = 5;

},{"big-integer":16}],10:[function(require,module,exports){
const bigInt = require("big-integer");

const definitions = require('./definitions');
//  The Analytical Engine

/*  This function connects all of the components of the engine
        into the complete, functioning engine.  Its main function
        is to read cards from the card chain supplied by the card
        reader and direct the operation of the components based
        upon their instructions.  */

("use strict");

function Engine(p, at, mi, st, cr, pr, cda) {
  this.panel = p;
  this.attendant = at;
  this.mill = mi;
  this.store = st;
  this.cardReader = cr;
  this.printer = pr;
  this.curvedraw = cda;
  //        this.punch = new CardPunchingApparatus();
  this.reset();
}

//  Reset the engine
Engine.prototype.reset = function() {
  this.errorDetected = false;
  this.running = false;
  this.trace = false;
  this.cardReader.firstCard();
};

//  Test if an error has occurred
Engine.prototype.error = function() {
  return this.errorDetected;
};

//  Set or clear trace mode
Engine.prototype.setTrace = function(t) {
  this.trace = t;
  this.mill.setTrace(t);
  this.store.setTrace(t);
};

//  Prepare to load a new chain of cards
Engine.prototype.loadNewCards = function() {
  this.errorDetected = false;
  this.attendant.newCardChain();
};

//  Start the engine
Engine.prototype.start = function() {
  this.panel.changeMillRunning((this.running = true));
};

// Runs to completion
Engine.prototype.runToCompletion = function() {
	this.start();
	while(this.processCard()) {}
	this.halt();
}

//  Stop the engine
Engine.prototype.halt = function() {
  this.panel.changeMillRunning((this.running = false));
};

//  If engine running ?
Engine.prototype.isRunning = function() {
  return this.running;
};

//  Notify attendant if an error is detected in the mill
Engine.prototype.errorHalt = function(why, perpetrator) {
  this.attendant.millAbnormality(why, perpetrator);
  this.errorDetected = true;
  this.halt();
};

// Set up to run new chain of cards
Engine.prototype.commence = function() {
  this.attendant.restart();
  this.store.reset();
  this.mill.reset();
  this.curvedraw.changePaper();
  this.cardReader.firstCard();
};

//  Process the next card
Engine.prototype.processCard = function() {
  var cardAvailable = false, halted = false;
  var currentCard;

  if ((currentCard = this.cardReader.nextCard())) {
    var card = currentCard.text;
    var operation = card.length === 0 ? " " : card.charAt(0);
    var prime = false;
    var n = 0;
    var v = bigInt.zero;

    cardAvailable = true;
    if (this.trace) {
      this.attendant.traceLog("Card:  " + currentCard);
    }

    //  Trim possible comment from card

    card = card.replace(/\.\s.*$/, "");

    switch (operation) {
      //  Mill operations (Operation cards)

      case "+":
      case "-":
      case definitions.C_minus:
      case definitions.C_times:
      case "*":
      case "x":
      case definitions.C_divide:
      case "/":
        this.mill.setOperation(operation);
        break;

      case "<":
      case ">":
        card = card.replace(/\s+$/, "");
        if (card.length > 1) {
          n = parseInt(card.substr(1), 10);
        }
        if (isNaN(n) || n < 0 || n > 100) {
          this.errorHalt("Bad stepping up/down card", currentCard);
        }
        this.mill.shiftAxes(operation == "<" ? n : -n);
        break;
      //  Mill to store transfers (Variable cards)


      case "L":
      case "Z":
      case "S":
        prime = false;
        if (card.substr(1).match(/'\s*$/) !== null) {
          prime = true;
        }
        n = parseInt(card.substr(1).match(/\d+/)[0]);
        //console.log("M/S " + operation + " prime " + prime + "  n " + n + " card(" + card + ")");
        if (isNaN(n) || n < 0) {
          this.errorHalt("Bad variable card", currentCard);
          break;
        }

        switch (operation) {
          case "L":
            this.mill.transferIn(this.store.get(n), prime);
            break;

          case "Z":
            this.mill.transferIn(this.store.get(n), prime);
            this.store.set(n, bigInt.zero);
            break;

          case "S":
            this.store.set(n, this.mill.transferOut(prime));
            break;
        }
        break;
      //  Number cards


      case "N":
        n = -1;
        var pn = card.substr(1).match(/(\d+)\s+([\d\+\-\u2212]+)/);
        if (pn) {
          n = parseInt(pn[1], 10);
          pn[2] = pn[2].replace(/^\+/, ""); // bigInt doesn't understand leading + sign...
          pn[2] = pn[2].replace(/^\u2212/, "-"); // ...nor Unicode minus sign
          v = bigInt(pn[2]);
        }
        //                              Defined by the Mill VVVVVV
        if (isNaN(n) || n < 0 || n > 999 || v.abs().compare(definitions.K10e50) >= 0) {
          this.errorHalt("Bad number card", currentCard);
          break;
        }
        this.store.set(n, v);
        break;
      //  Combinatorial cards


      case "C":
        {
          var howMany;
          var withinChain = true;

          if (
            card.length < 4 ||
            (card.charAt(1) != "F" && card.charAt(1) != "B") ||
            (card.charAt(2) != "?" &&
              card.charAt(2) != "1" &&
              card.charAt(2) != "+")
          ) {
            this.errorHalt("Bad combinatorial card", currentCard);
            break;
          }
          howMany = parseInt(card.substring(3).replace(/\s+$/, ""), 10);
          if (isNaN(howMany) || n < 0) {
            this.errorHalt("Bad combinatorial card cycle length", currentCard);
            break;
          }
          if (
            card.charAt(2) == "1" ||
            card.charAt(2) == "+" ||
            this.mill.hasRunUp()
          ) {
            if (card.charAt(1) == "F") {
              withinChain = this.cardReader.advance(howMany);
            } else {
              withinChain = this.cardReader.repeat(howMany);
            }
            if (!withinChain) {
              this.errorHalt("Card chain fell on floor during", currentCard);
              break;
            }
          }
        }
        break;
      //  Control cards


      case "B": // Ring Bell
        this.panel.ringBell();
        break;

      case "P": // Print
        this.mill.print(this.printer);
        break;

      case "H": // Halt
        this.panel.changeMillRunning((this.running = false), card.substring(1));
        halted = true;
        card = card.substr(2).replace(/^\s+/, "");
        card = card.replace(/\s+$/, "");
        if (card !== "") {
          this.attendant.traceLog("Halt: " + card);
        }
        break;
      //  Curve Drawing Apparatus
      case "D":
        if (card.length > 1) {
          switch (card.charAt(1)) {
            case "X":
              this.curvedraw.setX(this.mill.outAxis());
              break;

            case "Y":
              this.curvedraw.setY(this.mill.outAxis());
              break;

            case "+":
              this.curvedraw.drawTo();
              break;

            case "-":
            case definitions.C_minus:
              this.curvedraw.moveTo();
              break;

            case "P":
              this.curvedraw.changePaper();
              break;

            case "C":
              this.curvedraw.changePen(card.substr(2));
              break;

            default:
              this.errorHalt("Bad curve drawing card", currentCard);
              break;
          }
        }
        break;
      //  Attendant action cards


      case "A":
        if (!this.attendant.processActionCard(currentCard, this.printer)) {
          //  Attendant didn't know what to do with card
          this.panel.changeMillRunning((this.running = false));
          this.errorDetected = true;
          break;
        }
        break;
      //  Non-period diagnostic cards


      case "T": // Trace
        this.setTrace(card.length > 1 && card.charAt(1) == "1");
        break;

      case " ":
      case ".": // Comment
        break;

      default:
        this.errorHalt("Unknown operation", currentCard);
        break;
    }
  }
  return cardAvailable && !halted && !this.errorDetected;
};

module.exports = Engine;

},{"./definitions":9,"big-integer":16}],11:[function(require,module,exports){
const bigInt = require("big-integer");

const definitions = require('./definitions');

//  The Mill

("use strict");

var shiftFactor = new Array(101); // Shift factors created as needed

function Mill(p, a, t) {
  this.panel = p;
  this.attendant = a;
  this.timing = t;

  this.ingress = new Array(3); // Ingress axes
  this.egress = new Array(2); // Egress axes

  this.reset();
}

//  Set ingress axis
Mill.prototype.setIngress = function(which, v) {
  this.ingress[which] = bigInt(v);
  this.panel.changeIngress(which, this.ingress[which]);
};

//  Set egress axis
Mill.prototype.setEgress = function(which, v) {
  this.egress[which] = bigInt(v);
  this.panel.changeEgress(which, this.egress[which]);
};

//  Reset the mill
Mill.prototype.reset = function() {
  this.operation = definitions.OP_NONE;
  this.panel.changeOperation(this.currentOperationString());
  this.opargs = 2;
  this.index = 0;
  this.run_up = false;
  this.panel.changeRunUp(this.run_up);
  this.trace = false;

  var i;
  for (i = 0; i < 3; i++) {
    this.setIngress(i, 0);
  }
  for (i = 0; i < 2; i++) {
    this.setEgress(i, 0);
  }

  this.currentAxis = bigInt.zero;
  this.index = 0;
  this.run_up = false;
  this.panel.changeRunUp(this.run_up);
};

//  Return status of run up lever
Mill.prototype.hasRunUp = function() {
  return this.run_up;
};

//  Return string representing current Mill operation
Mill.prototype.currentOperationString = function() {
  var s = "";

  switch (this.operation) {
    case definitions.OP_NONE:
      s = " ";
      break;
    case definitions.OP_ADD:
      s = "+";
      break;
    case definitions.OP_SUBTRACT:
      s = definitions.C_minus;
      break;
    case definitions.OP_MULTIPLY:
      s = definitions.C_times;
      break;
    case definitions.OP_DIVIDE:
      s = definitions.C_divide;
      break;
  }
  return s;
};

//  Set or clear trace mode
Mill.prototype.setTrace = function(t) {
  this.trace = t;
};

//  Set current mill operation
Mill.prototype.setOperation = function(which) {
  switch (which) {
    case "+":
      this.operation = definitions.OP_ADD;
      this.opargs = 2;
      break;

    case definitions.C_minus:
    case "-":
      this.operation = definitions.OP_SUBTRACT;
      this.opargs = 2;
      break;

    case definitions.C_times:
    case "*":
    case "x":
      this.operation = definitions.OP_MULTIPLY;
      this.opargs = 2;
      break;

    case definitions.C_divide:
    case "/":
      this.operation = definitions.OP_DIVIDE;
      this.opargs = 2;
      break;

    default:
      alert("Unknown Mill operation" + which);
  }
  this.index = 0;
  this.panel.changeOperation(this.currentOperationString());
};

//  Transfer a value into the Mill
Mill.prototype.transferIn = function(v, upper) {
  var vb = bigInt(v);
  if (upper) {
    this.setIngress(2, (this.currentAxis = vb));
  } else {
    this.setIngress(this.index, (this.currentAxis = v));
    //  When first ingress axis set, clear prime axis
    if (this.index === 0) {
      this.setIngress(2, bigInt.zero);
    }
    this.index = (this.index + 1) % 2; // Rotate to next ingress axis
    if (this.index == this.opargs || this.index === 0) {
      this.crank(); // All arguments transferred; turn the crank
    }
  }
};

//  Transfer a value out of the Mill
Mill.prototype.transferOut = function(prime) {
  var b = this.egress[prime ? 1 : 0];

  this.currentAxis = b;
  return b;
};

//  Turn the crank and perform a Mill operation
Mill.prototype.crank = function() {
  var result = null, tresult = null;
  var qr;

  this.timing.millOperation(this.operation, this.ingress);
  this.run_up = false; // Reset run up lever
  switch (this.operation) {
    case definitions.OP_ADD:
      result = this.ingress[0].add(this.ingress[1]);
      /*  Check for passage through infinity (carry out)
                    and set run up lever if that has occurred.  The
                    result is then taken modulo 10^50. */
      if (result.compare(definitions.K10e50) >= 0) {
        this.run_up = true;
        result = result.subtract(definitions.K10e50);
      } else if (
        !this.ingress[0].isNegative() &&
        result.isNegative() &&
        !result.isZero()
      ) {
        /* Run up gets set when the result of a
                       addition changes the sign of the
                       first argument.  Note that since the same
                       lever is used to indicate carry and change
                       of sign, it is not possible to distinguish
                       overflow from sign change. */
        this.run_up = true;
      }
      this.setEgress(1, 0);
      if (this.trace) {
        this.attendant.traceLog(
          "Mill:  " +
            this.ingress[0].toString() +
            " + " +
            this.ingress[1].toString() +
            " = " +
            result.toString() +
            (this.run_up ? " Run up" : "")
        );
      }
      break;

    case definitions.OP_SUBTRACT:
      result = this.ingress[0].subtract(this.ingress[1]);
      /* Check for passage through negative infinity
                   (borrow) and set run up and trim value as a
                   result. */
      if (result.compare(definitions.Km10e50) <= 0) {
        this.run_up = true;
        result = bigInt.zero.subtract(result.add(definitions.K10e50));
      } else if (
        !this.ingress[0].isNegative() &&
        result.isNegative() &&
        !result.isZero()
      ) {
        /* Run up gets set when the result of a
                       subtraction changes the sign of the
                       first argument.  Note that since the same
                       lever is used to indicate borrow and change
                       of sign, it is not possible to distinguish
                       overflow from sign change. */
        this.run_up = true;
      }
      if (this.trace) {
        this.attendant.traceLog(
          "Mill:  " +
            this.ingress[0].toString() +
            " - " +
            this.ingress[1].toString() +
            " = " +
            result.toString() +
            (this.run_up ? " Run up" : "")
        );
      }
      this.setEgress(1, 0);
      break;

    case definitions.OP_MULTIPLY:
      result = this.ingress[0].multiply(this.ingress[1]);
      if (this.trace) {
        tresult = result;
      }
      /* Check for product longer than one column and
                   set the primed egress axis to the upper part. */
      if (result.abs().compare(definitions.K10e50) > 0) {
        qr = result.divmod(definitions.K10e50);
        this.setEgress(1, qr.quotient);
        result = qr.remainder;
      } else {
        this.setEgress(1, 0);
      }
      if (this.trace) {
        this.attendant.traceLog(
          "Mill:  " +
            this.ingress[0].toString() +
            " " +
            definitions.C_times +
            " " +
            this.ingress[1].toString() +
            " = " +
            tresult.toString() +
            (this.run_up ? " Run up" : "")
        );
      }
      break;

    case definitions.OP_DIVIDE:
      var dividend = this.ingress[0];

      if (!this.ingress[2].isZero()) {
        dividend = dividend.add(this.ingress[2].multiply(definitions.K10e50));
      }
      if (this.ingress[1].isZero()) {
        this.setEgress(1, (result = bigInt.zero));
        this.run_up = true;
        break;
      }
      qr = dividend.divmod(this.ingress[1]);
      if (qr.quotient.abs().compare(definitions.K10e50) > 0) {
        //  Overflow if quotient more than 50 digits
        this.setEgress(1, (result = bigInt.zero));
        this.run_up = true;
        break;
      }
      this.setEgress(1, qr.quotient);
      result = qr.remainder;
      if (this.trace) {
        this.attendant.traceLog(
          "Mill:  " +
            dividend.toString() +
            " / " +
            this.ingress[1].toString() +
            " = " +
            qr.quotient.toString() +
            ", Rem: " +
            qr.remainder.toString() +
            (this.run_up ? " Run up" : "")
        );
      }
      break;

    case definitions.OP_NONE:
      result = this.currentAxis;
      break;
  }
  this.setEgress(0, (this.currentAxis = result));
  this.index = 0;
  this.panel.changeRunUp(this.run_up);
};

/*  In Section 1.[5] of his 26 December 1837 "On the Mathematical
        Powers of the Calculating Engine", Babbage remarks: "The
        termination of the Multiplication arises from the action of
        the Counting apparatus which at a certain time directs the
        barrels to order the product thus obtained to be stepped down
        so the decimal point may be in its proper place,...", which
        implies a right shift as an integral part of the multiply
        operation.  This makes enormous sense, since it would take
        only a tiny fraction of the time a full-fledged divide would
        require to renormalise the number.  I have found no
        description in this or later works of how the number of digits
        to shift was to be conveyed to the mill.  So, I am introducing
        a rather curious operation for this purpose.  Invoked after a
        multiplication, but before the result has been emitted from
        the egress axes, it shifts the double-length product right by
        a fixed number of decimal places, and leaves the result in the
        egress axes.  Thus, to multiply V11 and V12, scale the result
        right 10 decimal places, and store the scaled product in V10,
        one would write:

             *
             L011
             L012
             >10
             S010

        Similarly, we provide a left shift for prescaling fixed
        point dividends prior to division; this operation shifts
        the two ingress axes containing the dividend by the given
        amount, and must be done after the ingress axes are loaded
        but before the variable card supplying the divisor is given.
        For example, if V11 and V12 contain the lower and upper halves
        of the quotient, respectively, and we wish to shift this
        quantity left 10 digits before dividing by the divisor in
        V13, we use:

            /
            L011
            L012'
            <10
            L013
            S010

        Note that shifting does not change the current operation
        for which the mill is set; it merely shifts the axes in
        place.  */

Mill.prototype.shiftAxes = function(count) {
  var right = count < 0;
  var sf, value;

  this.timing.millOperation(definitions.OP_SHIFT, count);

  /* Assemble the value from the axes.  For a right shift,
           used to normalise after a fixed point multiplication,
           the egress axes are used while for a left shift,
           performed before a fixed point division, the two
           ingress axes containing the dividend are shifted. */

  if (right) {
    count = -count;
    value = this.egress[0];
    if (!this.egress[1].isZero()) {
      value = value.add(this.egress[1].multiply(definitions.K10e50));
    }
  } else {
    value = this.ingress[0];
    if (!this.ingress[2].isZero()) {
      value = value.add(this.ingress[2].multiply(definitions.K10e50));
    }
  }

  /*  If we don't have a ready-made shift factor in stock,
            create one.  */

  if (!shiftFactor[count]) {
    shiftFactor[count] = definitions.K10.pow(count);
  }

  /*  Perform the shift and put the result back where
            we got it.  */

  sf = shiftFactor[count];
  if (right) {
    var qr;

    qr = value.divmod(sf);
    if (this.trace) {
      this.attendant.traceLog(
        "Mill:  " +
          value.toString() +
          " > " +
          count +
          " = " +
          qr.quotient.toString()
      );
    }
    if (qr.quotient.compare(definitions.K10e50) !== 0) {
      qr = qr.quotient.divmod(definitions.K10e50);
      this.setEgress(1, qr.quotient);
      this.setEgress(0, qr.remainder);
    } else {
      this.setEgress(0, qr.quotient);
      this.setEgress(1, 0);
    }
    this.currentAxis = this.egress[0];
  } else {
    var pr = value.multiply(sf);
    var pq;

    if (this.trace) {
      this.attendant.traceLog(
        "Mill:  " + value.toString() + " < " + count + " = " + pr.toString()
      );
    }
    if (pr.compare(definitions.K10e50) !== 0) {
      pq = pr.divmod(definitions.K10e50);
      this.setIngress(2, pq.quotient);
      this.setIngress(0, pq.remainder);
    } else {
      this.setIngress(0, pr);
      this.setIngress(2, 0);
    }
    this.currentAxis = this.ingress[0];
  }
};

//	Print the contents of the current axis
Mill.prototype.print = function(apparatus) {
  apparatus.output(this.attendant.editToPicture(this.outAxis()));
  this.attendant.writeEndOfItem(apparatus);
};

//  Return current axis
Mill.prototype.outAxis = function() {
  return this.currentAxis;
};

//	Display the complete state of the Mill on the panel
Mill.prototype.showState = function() {
  this.panel.changeOperation(this.currentOperationString());
  this.panel.changeRunUp(this.run_up);
  var i;
  for (i = 0; i < 3; i++) {
    this.panel.changeIngress(i, this.ingress[i]);
  }
  for (i = 0; i < 2; i++) {
    this.panel.changeEgress(i, this.egress[i]);
  }
};

module.exports = Mill;

},{"./definitions":9,"big-integer":16}],12:[function(require,module,exports){
//  The Printer

"use strict";

function Printer() {
  this.O_output = "";
}

//  Append text to the Printer
Printer.prototype.output = function(s) {
  this.O_output += s;
};

module.exports = Printer;

},{}],13:[function(require,module,exports){
//  Program Cards

"use strict";

//  Program display/editing panel

var loadButton;

function Program(c, att, cr, st, cda, t, eng) {
  this.cards = c;
  this.attendant = att;
  this.cardreader = cr;
  this.store = st;
  this.curvedraw = cda;
  this.timing = t;
  this.engine = eng;
}

Program.prototype.clear = function() {
  this.cards = "";
};

/*  Submit the contents of the Analyst's Program by
        passing lines to the attendant to be appended to
        the card chain. */
Program.prototype.submit0 = function(comments) {
  this.attendant.newCardChain();
  var lines = this.cards.split("\n");
  for (var i = 0; i < lines.length; i++) {
    this.attendant.appendCard(lines[i], "Analyst", 0);
  }
};

Program.prototype.submit1 = function(comments) {
  var stat = this.attendant.expandLibraryRequests(0);
  if (stat != 1) {
    this.attendant.examineCards(comments);
    this.cardreader.mountCards(this.attendant.deliverCardChain());
    //	    this.attendant.restart(); 	// Reset attendant modes to start
    this.engine.reset(); // Reset the engine
    this.engine.commence(); // Set up to run a new chain of cards
    //	    this.store.reset();     	// Clear the store
    //	    this.curvedraw.changePaper(); // Change paper in curve drawing apparatus
    this.timing.reset(); // Reset timing
  }
  return stat; // Return indication of pending library load
};

/*  Submit the contents of the Analyst's Program by
        passing lines to the attendant to be appended to
        the card chain. */
Program.prototype.submit = function(comments) {
  this.attendant.newCardChain();
  var lines = this.cards.replace(/\r\n/g, '\n').split("\n");
  for (var i = 0; i < lines.length; i++) {
    this.attendant.appendCard(lines[i], "Analyst", 0);
  }
  var stat = this.attendant.expandLibraryRequests(0);
  if (stat != 1) {
    this.attendant.examineCards(comments);
    this.cardreader.mountCards(this.attendant.deliverCardChain());
    //	    this.attendant.restart(); 	// Reset attendant modes to start
    this.engine.reset(); // Reset the engine
    this.engine.commence(); // Set up to run a new chain of cards
    //	    this.store.reset();     	// Clear the store
    //	    this.curvedraw.changePaper(); // Change paper in curve drawing apparatus
    this.timing.reset(); // Reset timing
  }
  return stat; // Return indication of pending library load
}

//  A single card

function Card(s, i, si) {
  this.text = s; // Contents of card
  this.index = i; // Index in chain of cards
  this.source = si; // Index in list of sources
}

Card.prototype.toString = function() {
  return (
    this.index +
    1 +
    ". (" +
    this.source.sourceName +
    ":" +
    (this.index - this.source.startIndex + 1) +
    ") " +
    this.text
  );
};

//  Card source index

function CardSource(sn, si) {
  this.sourceName = sn; // Card source (usually file name)
  this.startIndex = si; // First index from this source
}

//  The card reader

function CardReader(p, a, t) {
  this.panel = p; // Annunciator panel
  this.attendant = a; // Attendant
  this.timing = t; // Timing

  this.reset();
}

//  Clear card chain to void
CardReader.prototype.reset = function() {
  this.cards = []; // Card chain
  this.ncards = 0; // Number of cards
  this.nextCardNumber = 0; // Next card to read
};

//  Mount a chain of cards in the reader
CardReader.prototype.mountCards = function(cChain) {
  if (cChain) {
    this.reset();
  }
  if (cChain) {
    this.panel.mountCardReaderChain((this.cards = cChain));
    this.ncards = this.cards.length;
    this.firstCard();
  }
};

//  Rewind card chain to start
CardReader.prototype.firstCard = function() {
  this.nextCardNumber = 0;
};

//  Return next card from chain; advance chain
CardReader.prototype.nextCard = function() {
  if (this.nextCardNumber < this.ncards) {
    var c = this.cards[this.nextCardNumber++];
    this.timing.cardProcess();
    return c;
  } else {
    return null;
  }
};

//  Advance the chain n cards.  Returns true if within
//  chain, false if we've run off the end.
CardReader.prototype.advance = function(n) {
  this.timing.cardAdvance(n);
  if (this.nextCardNumber + n >= this.ncards) {
    return false;
  }
  this.nextCardNumber += n;
  return true;
};

//  Back up the chain n cards.  Returns true if within
//  chain, false if we've run off the start.
CardReader.prototype.repeat = function(n) {
  this.timing.cardBack(n);
  if (this.nextCardNumber - n < 0) {
    return false;
  }
  this.nextCardNumber -= n;
  return true;
};

module.exports = {
  CardReader: CardReader,
  CardSource: CardSource,
  Card: Card,
  Program: Program
}

},{}],14:[function(require,module,exports){
const bigInt = require("big-integer");
//  The Store

("use strict");

function Store(p, a, t) {
  // Annunciator panel, Attendant, Timing
  this.panel = p;
  this.attendant = a;
  this.timing = t;
  this.trace = false;
  this.reset();
}

//  Clear the store
Store.prototype.reset = function() {
  this.rack = [];
  return this;
};

//  Turn trace of store operations on or off
Store.prototype.setTrace = function(t) {
  this.trace = t;
  return this;
};

//  Set column which in the rack to value v.  v may be a number,
//  in which case it is automatically converted to a bigInt.
Store.prototype.set = function(which, v) {
  if (typeof v == "number") {
    v = bigInt(v);
  }
  this.rack[which] = v;
  if (this.trace) {
    this.attendant.traceLog("Store: V" + which + " = " + v.toString());
  }
  this.timing.storePut(which);
};

//  Get the value from column which of the rack.  Columns into
//  which nothing has been stored will return zero.
Store.prototype.get = function(which) {
  var v;

  if (!this.rack[which]) {
    this.set(which, bigInt(0));
  }
  v = this.rack[which];
  if (this.trace) {
    this.attendant.traceLog(
      "Store: Mill <= V" + which + "(" + v.toString() + ")"
    );
  }
  this.timing.storeGet(which);
  return v;
};

module.exports = Store;

},{"big-integer":16}],15:[function(require,module,exports){
//  Timing
const definitions = require('./definitions');

"use strict";

var tiMillOp = ["", "+", definitions.C_minus, definitions.C_times, definitions.C_divide, "<"];

function Timing() {
  this.Ncols = 1000; // Number of columns in store

  //  Operation times in seconds
  this.AddSubTime = 1; // Add/subtract time
  this.MulBaseTime = 10; // Multiplication base time (regardless of arguments)
  this.MulDigitTime = 1; // Multiplication time per digit of shorter argument
  this.DivBaseTime = 10; // Division base time (regardless of arguments)
  this.DivDigitTime = 1; // Division time per digit count difference of dividend and divisor
  this.ShiftTimeCol = 0.1; // Shift time per column
  this.AdvBackTime = 0.5; // Advance / backing time per card
  this.StoreSlewTime = 0.5; // Store slew time per column
  this.StoreCircular = true; // Are store columns arranged circularly ?
  this.StoreTransferTime = 0.25; // Transfer time between store and mill

  this.reset();
}

//	Reset timing
Timing.prototype.reset = function() {
  this.millOperations = 0; // Number of mill operations
  this.millOp = [0, 0, 0, 0, 0, 0]; // Number of mill operations by type
  this.storeOperations = 0; // Number of store operations
  this.storeOpPut = 0; //  Store puts
  this.storeOpGet = 0; //  Store gets
  this.storeCurCol = 0; //  Current store column
  this.storeSlewCol = 0; //	Number of store column slew operations
  this.cardsProcessed = 0; // Number of cards executed
  this.cardsAdvance = 0; //  Cards advanced past
  this.cardsBack = 0; //  Cards repeated
  this.runTime = 0; // Simulated run time in seconds
};

//	Card Events

//	Process card
Timing.prototype.cardProcess = function() {
  this.cardsProcessed++;
  this.runTime += this.AdvBackTime;
};

//	Advance past cards
Timing.prototype.cardAdvance = function(n) {
  this.cardsAdvance += n;
  this.runTime += n * this.AdvBackTime;
};

//	Back over cards to repeat
Timing.prototype.cardBack = function(n) {
  this.cardsBack += n;
  this.runTime += n * this.AdvBackTime;
};

//	Store Events

//	Generic handling of store operation
Timing.prototype.storeOp = function(col) {
  this.storeOperations++;
  var slew = this.storeCircular
    ? this.colDistMod(col, this.storeCurCol)
    : this.colDistLin(col, this.storeCurCol);
  this.storeSlewCol += slew;
  this.storeCurCol = col;
  this.runTime += this.StoreTransferTime + slew * this.StoreSlewTime;
};

//	Put item in store
Timing.prototype.storePut = function(col) {
  this.storeOpPut++;
  this.storeOp(col);
};

//	Get item from store
Timing.prototype.storeGet = function(col) {
  this.storeOpGet++;
  this.storeOp(col);
};

//	Mill Events

//	Mill operation
Timing.prototype.millOperation = function(which, arg) {
  this.millOperations++;
  this.millOp[which]++;
  switch (which) {
    case definitions.OP_ADD:
    case definitions.OP_SUBTRACT:
      this.runTime += this.AddSubTime;
      break;

    case definitions.OP_MULTIPLY:
      //  Find argument with least number of digits
      var mdig = Math.min(
        arg[0].toString().replace(/\-/, "").length,
        arg[1].toString().replace(/\-/, "").length
      );
      this.runTime += this.MulBaseTime + mdig * this.MulDigitTime;
      //att.traceLog("Mul " + arg[0].toString() + " * " + arg[1].toString() + ":  " +
      //    (this.MulBaseTime + (mdig * this.MulDigitTime)));
      break;

    case definitions.OP_DIVIDE:
      //  Compute number of digits in dividend
      var didig = arg[2].isZero()
        ? arg[0].toString().replace(/\-/, "").length
        : arg[2].toString().replace(/\-/, "").length + 50;
      var dvdig = arg[1].toString().replace(/\-/, "").length;
      var diffdig = Math.max(0, didig - dvdig);
      this.runTime += this.DivBaseTime + this.DivDigitTime * diffdig;
      //att.traceLog("Div " + arg[2].toString() + ":" + arg[0].toString() + " / " + arg[1].toString() + ":  " +
      //    (this.DivBaseTime + (this.DivDigitTime * diffdig)) +
      //    "  " + didig + "  " + dvdig + "  " + diffdig);
      break;

    case definitions.OP_SHIFT:
      this.runTime += Math.abs(arg) * this.ShiftTimeCol;
      break;
  }
};

//	Report accumulated statistics and timings
Timing.prototype.report = function() {
  var s = "", i;

  s += "Cards read: " + definitions.commas(this.cardsProcessed) + "\n";
  s += "    Advanced:  " + definitions.commas(this.cardsAdvance) + "\n";
  s += "    Backed:    " + definitions.commas(this.cardsBack) + "\n";

  s += "Mill operations: " + definitions.commas(this.millOperations) + "\n";
  for (i = 1; i < this.millOp.length; i++) {
    s += "    " + tiMillOp[i] + "  " + definitions.commas(this.millOp[i]) + "\n";
  }

  s += "Store operations: " + definitions.commas(this.storeOperations) + "\n";
  s += "    Put:  " + definitions.commas(this.storeOpPut) + "\n";
  s += "    Get:  " + definitions.commas(this.storeOpGet) + "\n";
  s += "    Slew: " + definitions.commas(this.storeSlewCol) + " columns\n";

  var days = Math.floor(this.runTime / (24 * 60 * 60)),
    secs = Math.floor(this.runTime % (24 * 60 * 60));
  var d = new Date(secs * 1000);
  s +=
    "Total running time: " +
    definitions.commas(Math.round(this.runTime)) +
    " seconds (" +
    (days > 0 ? days + " days " : "") +
    d.toISOString().substr(11, 8) +
    ").";
  return s;
};

//  Modulus of Euclidian division
Timing.prototype.eucMod = function(a, n) {
  return a - n * Math.floor(a / n);
};

//  Distance between columns for rotary store
Timing.prototype.colDistMod = function(col1, col2) {
  return Math.min(
    this.eucMod(col1 - col2, this.Ncols),
    this.eucMod(col2 - col1, this.Ncols)
  );
};

//  Distance between columns for linear store
Timing.prototype.colDistLin = function(col1, col2) {
  return Math.abs(col1 - col2);
};

module.exports = Timing;

},{"./definitions":9}],16:[function(require,module,exports){
var bigInt = (function (undefined) {
    "use strict";

    var BASE = 1e7,
        LOG_BASE = 7,
        MAX_INT = 9007199254740992,
        MAX_INT_ARR = smallToArray(MAX_INT),
        DEFAULT_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";

    var supportsNativeBigInt = typeof BigInt === "function";

    function Integer(v, radix, alphabet, caseSensitive) {
        if (typeof v === "undefined") return Integer[0];
        if (typeof radix !== "undefined") return +radix === 10 && !alphabet ? parseValue(v) : parseBase(v, radix, alphabet, caseSensitive);
        return parseValue(v);
    }

    function BigInteger(value, sign) {
        this.value = value;
        this.sign = sign;
        this.isSmall = false;
    }
    BigInteger.prototype = Object.create(Integer.prototype);

    function SmallInteger(value) {
        this.value = value;
        this.sign = value < 0;
        this.isSmall = true;
    }
    SmallInteger.prototype = Object.create(Integer.prototype);

    function NativeBigInt(value) {
        this.value = value;
    }
    NativeBigInt.prototype = Object.create(Integer.prototype);

    function isPrecise(n) {
        return -MAX_INT < n && n < MAX_INT;
    }

    function smallToArray(n) { // For performance reasons doesn't reference BASE, need to change this function if BASE changes
        if (n < 1e7)
            return [n];
        if (n < 1e14)
            return [n % 1e7, Math.floor(n / 1e7)];
        return [n % 1e7, Math.floor(n / 1e7) % 1e7, Math.floor(n / 1e14)];
    }

    function arrayToSmall(arr) { // If BASE changes this function may need to change
        trim(arr);
        var length = arr.length;
        if (length < 4 && compareAbs(arr, MAX_INT_ARR) < 0) {
            switch (length) {
                case 0: return 0;
                case 1: return arr[0];
                case 2: return arr[0] + arr[1] * BASE;
                default: return arr[0] + (arr[1] + arr[2] * BASE) * BASE;
            }
        }
        return arr;
    }

    function trim(v) {
        var i = v.length;
        while (v[--i] === 0);
        v.length = i + 1;
    }

    function createArray(length) { // function shamelessly stolen from Yaffle's library https://github.com/Yaffle/BigInteger
        var x = new Array(length);
        var i = -1;
        while (++i < length) {
            x[i] = 0;
        }
        return x;
    }

    function truncate(n) {
        if (n > 0) return Math.floor(n);
        return Math.ceil(n);
    }

    function add(a, b) { // assumes a and b are arrays with a.length >= b.length
        var l_a = a.length,
            l_b = b.length,
            r = new Array(l_a),
            carry = 0,
            base = BASE,
            sum, i;
        for (i = 0; i < l_b; i++) {
            sum = a[i] + b[i] + carry;
            carry = sum >= base ? 1 : 0;
            r[i] = sum - carry * base;
        }
        while (i < l_a) {
            sum = a[i] + carry;
            carry = sum === base ? 1 : 0;
            r[i++] = sum - carry * base;
        }
        if (carry > 0) r.push(carry);
        return r;
    }

    function addAny(a, b) {
        if (a.length >= b.length) return add(a, b);
        return add(b, a);
    }

    function addSmall(a, carry) { // assumes a is array, carry is number with 0 <= carry < MAX_INT
        var l = a.length,
            r = new Array(l),
            base = BASE,
            sum, i;
        for (i = 0; i < l; i++) {
            sum = a[i] - base + carry;
            carry = Math.floor(sum / base);
            r[i] = sum - carry * base;
            carry += 1;
        }
        while (carry > 0) {
            r[i++] = carry % base;
            carry = Math.floor(carry / base);
        }
        return r;
    }

    BigInteger.prototype.add = function (v) {
        var n = parseValue(v);
        if (this.sign !== n.sign) {
            return this.subtract(n.negate());
        }
        var a = this.value, b = n.value;
        if (n.isSmall) {
            return new BigInteger(addSmall(a, Math.abs(b)), this.sign);
        }
        return new BigInteger(addAny(a, b), this.sign);
    };
    BigInteger.prototype.plus = BigInteger.prototype.add;

    SmallInteger.prototype.add = function (v) {
        var n = parseValue(v);
        var a = this.value;
        if (a < 0 !== n.sign) {
            return this.subtract(n.negate());
        }
        var b = n.value;
        if (n.isSmall) {
            if (isPrecise(a + b)) return new SmallInteger(a + b);
            b = smallToArray(Math.abs(b));
        }
        return new BigInteger(addSmall(b, Math.abs(a)), a < 0);
    };
    SmallInteger.prototype.plus = SmallInteger.prototype.add;

    NativeBigInt.prototype.add = function (v) {
        return new NativeBigInt(this.value + parseValue(v).value);
    }
    NativeBigInt.prototype.plus = NativeBigInt.prototype.add;

    function subtract(a, b) { // assumes a and b are arrays with a >= b
        var a_l = a.length,
            b_l = b.length,
            r = new Array(a_l),
            borrow = 0,
            base = BASE,
            i, difference;
        for (i = 0; i < b_l; i++) {
            difference = a[i] - borrow - b[i];
            if (difference < 0) {
                difference += base;
                borrow = 1;
            } else borrow = 0;
            r[i] = difference;
        }
        for (i = b_l; i < a_l; i++) {
            difference = a[i] - borrow;
            if (difference < 0) difference += base;
            else {
                r[i++] = difference;
                break;
            }
            r[i] = difference;
        }
        for (; i < a_l; i++) {
            r[i] = a[i];
        }
        trim(r);
        return r;
    }

    function subtractAny(a, b, sign) {
        var value;
        if (compareAbs(a, b) >= 0) {
            value = subtract(a, b);
        } else {
            value = subtract(b, a);
            sign = !sign;
        }
        value = arrayToSmall(value);
        if (typeof value === "number") {
            if (sign) value = -value;
            return new SmallInteger(value);
        }
        return new BigInteger(value, sign);
    }

    function subtractSmall(a, b, sign) { // assumes a is array, b is number with 0 <= b < MAX_INT
        var l = a.length,
            r = new Array(l),
            carry = -b,
            base = BASE,
            i, difference;
        for (i = 0; i < l; i++) {
            difference = a[i] + carry;
            carry = Math.floor(difference / base);
            difference %= base;
            r[i] = difference < 0 ? difference + base : difference;
        }
        r = arrayToSmall(r);
        if (typeof r === "number") {
            if (sign) r = -r;
            return new SmallInteger(r);
        } return new BigInteger(r, sign);
    }

    BigInteger.prototype.subtract = function (v) {
        var n = parseValue(v);
        if (this.sign !== n.sign) {
            return this.add(n.negate());
        }
        var a = this.value, b = n.value;
        if (n.isSmall)
            return subtractSmall(a, Math.abs(b), this.sign);
        return subtractAny(a, b, this.sign);
    };
    BigInteger.prototype.minus = BigInteger.prototype.subtract;

    SmallInteger.prototype.subtract = function (v) {
        var n = parseValue(v);
        var a = this.value;
        if (a < 0 !== n.sign) {
            return this.add(n.negate());
        }
        var b = n.value;
        if (n.isSmall) {
            return new SmallInteger(a - b);
        }
        return subtractSmall(b, Math.abs(a), a >= 0);
    };
    SmallInteger.prototype.minus = SmallInteger.prototype.subtract;

    NativeBigInt.prototype.subtract = function (v) {
        return new NativeBigInt(this.value - parseValue(v).value);
    }
    NativeBigInt.prototype.minus = NativeBigInt.prototype.subtract;

    BigInteger.prototype.negate = function () {
        return new BigInteger(this.value, !this.sign);
    };
    SmallInteger.prototype.negate = function () {
        var sign = this.sign;
        var small = new SmallInteger(-this.value);
        small.sign = !sign;
        return small;
    };
    NativeBigInt.prototype.negate = function () {
        return new NativeBigInt(-this.value);
    }

    BigInteger.prototype.abs = function () {
        return new BigInteger(this.value, false);
    };
    SmallInteger.prototype.abs = function () {
        return new SmallInteger(Math.abs(this.value));
    };
    NativeBigInt.prototype.abs = function () {
        return new NativeBigInt(this.value >= 0 ? this.value : -this.value);
    }


    function multiplyLong(a, b) {
        var a_l = a.length,
            b_l = b.length,
            l = a_l + b_l,
            r = createArray(l),
            base = BASE,
            product, carry, i, a_i, b_j;
        for (i = 0; i < a_l; ++i) {
            a_i = a[i];
            for (var j = 0; j < b_l; ++j) {
                b_j = b[j];
                product = a_i * b_j + r[i + j];
                carry = Math.floor(product / base);
                r[i + j] = product - carry * base;
                r[i + j + 1] += carry;
            }
        }
        trim(r);
        return r;
    }

    function multiplySmall(a, b) { // assumes a is array, b is number with |b| < BASE
        var l = a.length,
            r = new Array(l),
            base = BASE,
            carry = 0,
            product, i;
        for (i = 0; i < l; i++) {
            product = a[i] * b + carry;
            carry = Math.floor(product / base);
            r[i] = product - carry * base;
        }
        while (carry > 0) {
            r[i++] = carry % base;
            carry = Math.floor(carry / base);
        }
        return r;
    }

    function shiftLeft(x, n) {
        var r = [];
        while (n-- > 0) r.push(0);
        return r.concat(x);
    }

    function multiplyKaratsuba(x, y) {
        var n = Math.max(x.length, y.length);

        if (n <= 30) return multiplyLong(x, y);
        n = Math.ceil(n / 2);

        var b = x.slice(n),
            a = x.slice(0, n),
            d = y.slice(n),
            c = y.slice(0, n);

        var ac = multiplyKaratsuba(a, c),
            bd = multiplyKaratsuba(b, d),
            abcd = multiplyKaratsuba(addAny(a, b), addAny(c, d));

        var product = addAny(addAny(ac, shiftLeft(subtract(subtract(abcd, ac), bd), n)), shiftLeft(bd, 2 * n));
        trim(product);
        return product;
    }

    // The following function is derived from a surface fit of a graph plotting the performance difference
    // between long multiplication and karatsuba multiplication versus the lengths of the two arrays.
    function useKaratsuba(l1, l2) {
        return -0.012 * l1 - 0.012 * l2 + 0.000015 * l1 * l2 > 0;
    }

    BigInteger.prototype.multiply = function (v) {
        var n = parseValue(v),
            a = this.value, b = n.value,
            sign = this.sign !== n.sign,
            abs;
        if (n.isSmall) {
            if (b === 0) return Integer[0];
            if (b === 1) return this;
            if (b === -1) return this.negate();
            abs = Math.abs(b);
            if (abs < BASE) {
                return new BigInteger(multiplySmall(a, abs), sign);
            }
            b = smallToArray(abs);
        }
        if (useKaratsuba(a.length, b.length)) // Karatsuba is only faster for certain array sizes
            return new BigInteger(multiplyKaratsuba(a, b), sign);
        return new BigInteger(multiplyLong(a, b), sign);
    };

    BigInteger.prototype.times = BigInteger.prototype.multiply;

    function multiplySmallAndArray(a, b, sign) { // a >= 0
        if (a < BASE) {
            return new BigInteger(multiplySmall(b, a), sign);
        }
        return new BigInteger(multiplyLong(b, smallToArray(a)), sign);
    }
    SmallInteger.prototype._multiplyBySmall = function (a) {
        if (isPrecise(a.value * this.value)) {
            return new SmallInteger(a.value * this.value);
        }
        return multiplySmallAndArray(Math.abs(a.value), smallToArray(Math.abs(this.value)), this.sign !== a.sign);
    };
    BigInteger.prototype._multiplyBySmall = function (a) {
        if (a.value === 0) return Integer[0];
        if (a.value === 1) return this;
        if (a.value === -1) return this.negate();
        return multiplySmallAndArray(Math.abs(a.value), this.value, this.sign !== a.sign);
    };
    SmallInteger.prototype.multiply = function (v) {
        return parseValue(v)._multiplyBySmall(this);
    };
    SmallInteger.prototype.times = SmallInteger.prototype.multiply;

    NativeBigInt.prototype.multiply = function (v) {
        return new NativeBigInt(this.value * parseValue(v).value);
    }
    NativeBigInt.prototype.times = NativeBigInt.prototype.multiply;

    function square(a) {
        //console.assert(2 * BASE * BASE < MAX_INT);
        var l = a.length,
            r = createArray(l + l),
            base = BASE,
            product, carry, i, a_i, a_j;
        for (i = 0; i < l; i++) {
            a_i = a[i];
            carry = 0 - a_i * a_i;
            for (var j = i; j < l; j++) {
                a_j = a[j];
                product = 2 * (a_i * a_j) + r[i + j] + carry;
                carry = Math.floor(product / base);
                r[i + j] = product - carry * base;
            }
            r[i + l] = carry;
        }
        trim(r);
        return r;
    }

    BigInteger.prototype.square = function () {
        return new BigInteger(square(this.value), false);
    };

    SmallInteger.prototype.square = function () {
        var value = this.value * this.value;
        if (isPrecise(value)) return new SmallInteger(value);
        return new BigInteger(square(smallToArray(Math.abs(this.value))), false);
    };

    NativeBigInt.prototype.square = function (v) {
        return new NativeBigInt(this.value * this.value);
    }

    function divMod1(a, b) { // Left over from previous version. Performs faster than divMod2 on smaller input sizes.
        var a_l = a.length,
            b_l = b.length,
            base = BASE,
            result = createArray(b.length),
            divisorMostSignificantDigit = b[b_l - 1],
            // normalization
            lambda = Math.ceil(base / (2 * divisorMostSignificantDigit)),
            remainder = multiplySmall(a, lambda),
            divisor = multiplySmall(b, lambda),
            quotientDigit, shift, carry, borrow, i, l, q;
        if (remainder.length <= a_l) remainder.push(0);
        divisor.push(0);
        divisorMostSignificantDigit = divisor[b_l - 1];
        for (shift = a_l - b_l; shift >= 0; shift--) {
            quotientDigit = base - 1;
            if (remainder[shift + b_l] !== divisorMostSignificantDigit) {
                quotientDigit = Math.floor((remainder[shift + b_l] * base + remainder[shift + b_l - 1]) / divisorMostSignificantDigit);
            }
            // quotientDigit <= base - 1
            carry = 0;
            borrow = 0;
            l = divisor.length;
            for (i = 0; i < l; i++) {
                carry += quotientDigit * divisor[i];
                q = Math.floor(carry / base);
                borrow += remainder[shift + i] - (carry - q * base);
                carry = q;
                if (borrow < 0) {
                    remainder[shift + i] = borrow + base;
                    borrow = -1;
                } else {
                    remainder[shift + i] = borrow;
                    borrow = 0;
                }
            }
            while (borrow !== 0) {
                quotientDigit -= 1;
                carry = 0;
                for (i = 0; i < l; i++) {
                    carry += remainder[shift + i] - base + divisor[i];
                    if (carry < 0) {
                        remainder[shift + i] = carry + base;
                        carry = 0;
                    } else {
                        remainder[shift + i] = carry;
                        carry = 1;
                    }
                }
                borrow += carry;
            }
            result[shift] = quotientDigit;
        }
        // denormalization
        remainder = divModSmall(remainder, lambda)[0];
        return [arrayToSmall(result), arrayToSmall(remainder)];
    }

    function divMod2(a, b) { // Implementation idea shamelessly stolen from Silent Matt's library http://silentmatt.com/biginteger/
        // Performs faster than divMod1 on larger input sizes.
        var a_l = a.length,
            b_l = b.length,
            result = [],
            part = [],
            base = BASE,
            guess, xlen, highx, highy, check;
        while (a_l) {
            part.unshift(a[--a_l]);
            trim(part);
            if (compareAbs(part, b) < 0) {
                result.push(0);
                continue;
            }
            xlen = part.length;
            highx = part[xlen - 1] * base + part[xlen - 2];
            highy = b[b_l - 1] * base + b[b_l - 2];
            if (xlen > b_l) {
                highx = (highx + 1) * base;
            }
            guess = Math.ceil(highx / highy);
            do {
                check = multiplySmall(b, guess);
                if (compareAbs(check, part) <= 0) break;
                guess--;
            } while (guess);
            result.push(guess);
            part = subtract(part, check);
        }
        result.reverse();
        return [arrayToSmall(result), arrayToSmall(part)];
    }

    function divModSmall(value, lambda) {
        var length = value.length,
            quotient = createArray(length),
            base = BASE,
            i, q, remainder, divisor;
        remainder = 0;
        for (i = length - 1; i >= 0; --i) {
            divisor = remainder * base + value[i];
            q = truncate(divisor / lambda);
            remainder = divisor - q * lambda;
            quotient[i] = q | 0;
        }
        return [quotient, remainder | 0];
    }

    function divModAny(self, v) {
        var value, n = parseValue(v);
        if (supportsNativeBigInt) {
            return [new NativeBigInt(self.value / n.value), new NativeBigInt(self.value % n.value)];
        }
        var a = self.value, b = n.value;
        var quotient;
        if (b === 0) throw new Error("Cannot divide by zero");
        if (self.isSmall) {
            if (n.isSmall) {
                return [new SmallInteger(truncate(a / b)), new SmallInteger(a % b)];
            }
            return [Integer[0], self];
        }
        if (n.isSmall) {
            if (b === 1) return [self, Integer[0]];
            if (b == -1) return [self.negate(), Integer[0]];
            var abs = Math.abs(b);
            if (abs < BASE) {
                value = divModSmall(a, abs);
                quotient = arrayToSmall(value[0]);
                var remainder = value[1];
                if (self.sign) remainder = -remainder;
                if (typeof quotient === "number") {
                    if (self.sign !== n.sign) quotient = -quotient;
                    return [new SmallInteger(quotient), new SmallInteger(remainder)];
                }
                return [new BigInteger(quotient, self.sign !== n.sign), new SmallInteger(remainder)];
            }
            b = smallToArray(abs);
        }
        var comparison = compareAbs(a, b);
        if (comparison === -1) return [Integer[0], self];
        if (comparison === 0) return [Integer[self.sign === n.sign ? 1 : -1], Integer[0]];

        // divMod1 is faster on smaller input sizes
        if (a.length + b.length <= 200)
            value = divMod1(a, b);
        else value = divMod2(a, b);

        quotient = value[0];
        var qSign = self.sign !== n.sign,
            mod = value[1],
            mSign = self.sign;
        if (typeof quotient === "number") {
            if (qSign) quotient = -quotient;
            quotient = new SmallInteger(quotient);
        } else quotient = new BigInteger(quotient, qSign);
        if (typeof mod === "number") {
            if (mSign) mod = -mod;
            mod = new SmallInteger(mod);
        } else mod = new BigInteger(mod, mSign);
        return [quotient, mod];
    }

    BigInteger.prototype.divmod = function (v) {
        var result = divModAny(this, v);
        return {
            quotient: result[0],
            remainder: result[1]
        };
    };
    NativeBigInt.prototype.divmod = SmallInteger.prototype.divmod = BigInteger.prototype.divmod;


    BigInteger.prototype.divide = function (v) {
        return divModAny(this, v)[0];
    };
    NativeBigInt.prototype.over = NativeBigInt.prototype.divide = function (v) {
        return new NativeBigInt(this.value / parseValue(v).value);
    };
    SmallInteger.prototype.over = SmallInteger.prototype.divide = BigInteger.prototype.over = BigInteger.prototype.divide;

    BigInteger.prototype.mod = function (v) {
        return divModAny(this, v)[1];
    };
    NativeBigInt.prototype.mod = NativeBigInt.prototype.remainder = function (v) {
        return new NativeBigInt(this.value % parseValue(v).value);
    };
    SmallInteger.prototype.remainder = SmallInteger.prototype.mod = BigInteger.prototype.remainder = BigInteger.prototype.mod;

    BigInteger.prototype.pow = function (v) {
        var n = parseValue(v),
            a = this.value,
            b = n.value,
            value, x, y;
        if (b === 0) return Integer[1];
        if (a === 0) return Integer[0];
        if (a === 1) return Integer[1];
        if (a === -1) return n.isEven() ? Integer[1] : Integer[-1];
        if (n.sign) {
            return Integer[0];
        }
        if (!n.isSmall) throw new Error("The exponent " + n.toString() + " is too large.");
        if (this.isSmall) {
            if (isPrecise(value = Math.pow(a, b)))
                return new SmallInteger(truncate(value));
        }
        x = this;
        y = Integer[1];
        while (true) {
            if (b & 1 === 1) {
                y = y.times(x);
                --b;
            }
            if (b === 0) break;
            b /= 2;
            x = x.square();
        }
        return y;
    };
    SmallInteger.prototype.pow = BigInteger.prototype.pow;

    NativeBigInt.prototype.pow = function (v) {
        var n = parseValue(v);
        var a = this.value, b = n.value;
        var _0 = BigInt(0), _1 = BigInt(1), _2 = BigInt(2);
        if (b === _0) return Integer[1];
        if (a === _0) return Integer[0];
        if (a === _1) return Integer[1];
        if (a === BigInt(-1)) return n.isEven() ? Integer[1] : Integer[-1];
        if (n.isNegative()) return new NativeBigInt(_0);
        var x = this;
        var y = Integer[1];
        while (true) {
            if ((b & _1) === _1) {
                y = y.times(x);
                --b;
            }
            if (b === _0) break;
            b /= _2;
            x = x.square();
        }
        return y;
    }

    BigInteger.prototype.modPow = function (exp, mod) {
        exp = parseValue(exp);
        mod = parseValue(mod);
        if (mod.isZero()) throw new Error("Cannot take modPow with modulus 0");
        var r = Integer[1],
            base = this.mod(mod);
        if (exp.isNegative()) {
            exp = exp.multiply(Integer[-1]);
            base = base.modInv(mod);
        }
        while (exp.isPositive()) {
            if (base.isZero()) return Integer[0];
            if (exp.isOdd()) r = r.multiply(base).mod(mod);
            exp = exp.divide(2);
            base = base.square().mod(mod);
        }
        return r;
    };
    NativeBigInt.prototype.modPow = SmallInteger.prototype.modPow = BigInteger.prototype.modPow;

    function compareAbs(a, b) {
        if (a.length !== b.length) {
            return a.length > b.length ? 1 : -1;
        }
        for (var i = a.length - 1; i >= 0; i--) {
            if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1;
        }
        return 0;
    }

    BigInteger.prototype.compareAbs = function (v) {
        var n = parseValue(v),
            a = this.value,
            b = n.value;
        if (n.isSmall) return 1;
        return compareAbs(a, b);
    };
    SmallInteger.prototype.compareAbs = function (v) {
        var n = parseValue(v),
            a = Math.abs(this.value),
            b = n.value;
        if (n.isSmall) {
            b = Math.abs(b);
            return a === b ? 0 : a > b ? 1 : -1;
        }
        return -1;
    };
    NativeBigInt.prototype.compareAbs = function (v) {
        var a = this.value;
        var b = parseValue(v).value;
        a = a >= 0 ? a : -a;
        b = b >= 0 ? b : -b;
        return a === b ? 0 : a > b ? 1 : -1;
    }

    BigInteger.prototype.compare = function (v) {
        // See discussion about comparison with Infinity:
        // https://github.com/peterolson/BigInteger.js/issues/61
        if (v === Infinity) {
            return -1;
        }
        if (v === -Infinity) {
            return 1;
        }

        var n = parseValue(v),
            a = this.value,
            b = n.value;
        if (this.sign !== n.sign) {
            return n.sign ? 1 : -1;
        }
        if (n.isSmall) {
            return this.sign ? -1 : 1;
        }
        return compareAbs(a, b) * (this.sign ? -1 : 1);
    };
    BigInteger.prototype.compareTo = BigInteger.prototype.compare;

    SmallInteger.prototype.compare = function (v) {
        if (v === Infinity) {
            return -1;
        }
        if (v === -Infinity) {
            return 1;
        }

        var n = parseValue(v),
            a = this.value,
            b = n.value;
        if (n.isSmall) {
            return a == b ? 0 : a > b ? 1 : -1;
        }
        if (a < 0 !== n.sign) {
            return a < 0 ? -1 : 1;
        }
        return a < 0 ? 1 : -1;
    };
    SmallInteger.prototype.compareTo = SmallInteger.prototype.compare;

    NativeBigInt.prototype.compare = function (v) {
        if (v === Infinity) {
            return -1;
        }
        if (v === -Infinity) {
            return 1;
        }
        var a = this.value;
        var b = parseValue(v).value;
        return a === b ? 0 : a > b ? 1 : -1;
    }
    NativeBigInt.prototype.compareTo = NativeBigInt.prototype.compare;

    BigInteger.prototype.equals = function (v) {
        return this.compare(v) === 0;
    };
    NativeBigInt.prototype.eq = NativeBigInt.prototype.equals = SmallInteger.prototype.eq = SmallInteger.prototype.equals = BigInteger.prototype.eq = BigInteger.prototype.equals;

    BigInteger.prototype.notEquals = function (v) {
        return this.compare(v) !== 0;
    };
    NativeBigInt.prototype.neq = NativeBigInt.prototype.notEquals = SmallInteger.prototype.neq = SmallInteger.prototype.notEquals = BigInteger.prototype.neq = BigInteger.prototype.notEquals;

    BigInteger.prototype.greater = function (v) {
        return this.compare(v) > 0;
    };
    NativeBigInt.prototype.gt = NativeBigInt.prototype.greater = SmallInteger.prototype.gt = SmallInteger.prototype.greater = BigInteger.prototype.gt = BigInteger.prototype.greater;

    BigInteger.prototype.lesser = function (v) {
        return this.compare(v) < 0;
    };
    NativeBigInt.prototype.lt = NativeBigInt.prototype.lesser = SmallInteger.prototype.lt = SmallInteger.prototype.lesser = BigInteger.prototype.lt = BigInteger.prototype.lesser;

    BigInteger.prototype.greaterOrEquals = function (v) {
        return this.compare(v) >= 0;
    };
    NativeBigInt.prototype.geq = NativeBigInt.prototype.greaterOrEquals = SmallInteger.prototype.geq = SmallInteger.prototype.greaterOrEquals = BigInteger.prototype.geq = BigInteger.prototype.greaterOrEquals;

    BigInteger.prototype.lesserOrEquals = function (v) {
        return this.compare(v) <= 0;
    };
    NativeBigInt.prototype.leq = NativeBigInt.prototype.lesserOrEquals = SmallInteger.prototype.leq = SmallInteger.prototype.lesserOrEquals = BigInteger.prototype.leq = BigInteger.prototype.lesserOrEquals;

    BigInteger.prototype.isEven = function () {
        return (this.value[0] & 1) === 0;
    };
    SmallInteger.prototype.isEven = function () {
        return (this.value & 1) === 0;
    };
    NativeBigInt.prototype.isEven = function () {
        return (this.value & BigInt(1)) === BigInt(0);
    }

    BigInteger.prototype.isOdd = function () {
        return (this.value[0] & 1) === 1;
    };
    SmallInteger.prototype.isOdd = function () {
        return (this.value & 1) === 1;
    };
    NativeBigInt.prototype.isOdd = function () {
        return (this.value & BigInt(1)) === BigInt(1);
    }

    BigInteger.prototype.isPositive = function () {
        return !this.sign;
    };
    SmallInteger.prototype.isPositive = function () {
        return this.value > 0;
    };
    NativeBigInt.prototype.isPositive = SmallInteger.prototype.isPositive;

    BigInteger.prototype.isNegative = function () {
        return this.sign;
    };
    SmallInteger.prototype.isNegative = function () {
        return this.value < 0;
    };
    NativeBigInt.prototype.isNegative = SmallInteger.prototype.isNegative;

    BigInteger.prototype.isUnit = function () {
        return false;
    };
    SmallInteger.prototype.isUnit = function () {
        return Math.abs(this.value) === 1;
    };
    NativeBigInt.prototype.isUnit = function () {
        return this.abs().value === BigInt(1);
    }

    BigInteger.prototype.isZero = function () {
        return false;
    };
    SmallInteger.prototype.isZero = function () {
        return this.value === 0;
    };
    NativeBigInt.prototype.isZero = function () {
        return this.value === BigInt(0);
    }

    BigInteger.prototype.isDivisibleBy = function (v) {
        var n = parseValue(v);
        if (n.isZero()) return false;
        if (n.isUnit()) return true;
        if (n.compareAbs(2) === 0) return this.isEven();
        return this.mod(n).isZero();
    };
    NativeBigInt.prototype.isDivisibleBy = SmallInteger.prototype.isDivisibleBy = BigInteger.prototype.isDivisibleBy;

    function isBasicPrime(v) {
        var n = v.abs();
        if (n.isUnit()) return false;
        if (n.equals(2) || n.equals(3) || n.equals(5)) return true;
        if (n.isEven() || n.isDivisibleBy(3) || n.isDivisibleBy(5)) return false;
        if (n.lesser(49)) return true;
        // we don't know if it's prime: let the other functions figure it out
    }

    function millerRabinTest(n, a) {
        var nPrev = n.prev(),
            b = nPrev,
            r = 0,
            d, t, i, x;
        while (b.isEven()) b = b.divide(2), r++;
        next: for (i = 0; i < a.length; i++) {
            if (n.lesser(a[i])) continue;
            x = bigInt(a[i]).modPow(b, n);
            if (x.isUnit() || x.equals(nPrev)) continue;
            for (d = r - 1; d != 0; d--) {
                x = x.square().mod(n);
                if (x.isUnit()) return false;
                if (x.equals(nPrev)) continue next;
            }
            return false;
        }
        return true;
    }

    // Set "strict" to true to force GRH-supported lower bound of 2*log(N)^2
    BigInteger.prototype.isPrime = function (strict) {
        var isPrime = isBasicPrime(this);
        if (isPrime !== undefined) return isPrime;
        var n = this.abs();
        var bits = n.bitLength();
        if (bits <= 64)
            return millerRabinTest(n, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]);
        var logN = Math.log(2) * bits.toJSNumber();
        var t = Math.ceil((strict === true) ? (2 * Math.pow(logN, 2)) : logN);
        for (var a = [], i = 0; i < t; i++) {
            a.push(bigInt(i + 2));
        }
        return millerRabinTest(n, a);
    };
    NativeBigInt.prototype.isPrime = SmallInteger.prototype.isPrime = BigInteger.prototype.isPrime;

    BigInteger.prototype.isProbablePrime = function (iterations, rng) {
        var isPrime = isBasicPrime(this);
        if (isPrime !== undefined) return isPrime;
        var n = this.abs();
        var t = iterations === undefined ? 5 : iterations;
        for (var a = [], i = 0; i < t; i++) {
            a.push(bigInt.randBetween(2, n.minus(2), rng));
        }
        return millerRabinTest(n, a);
    };
    NativeBigInt.prototype.isProbablePrime = SmallInteger.prototype.isProbablePrime = BigInteger.prototype.isProbablePrime;

    BigInteger.prototype.modInv = function (n) {
        var t = bigInt.zero, newT = bigInt.one, r = parseValue(n), newR = this.abs(), q, lastT, lastR;
        while (!newR.isZero()) {
            q = r.divide(newR);
            lastT = t;
            lastR = r;
            t = newT;
            r = newR;
            newT = lastT.subtract(q.multiply(newT));
            newR = lastR.subtract(q.multiply(newR));
        }
        if (!r.isUnit()) throw new Error(this.toString() + " and " + n.toString() + " are not co-prime");
        if (t.compare(0) === -1) {
            t = t.add(n);
        }
        if (this.isNegative()) {
            return t.negate();
        }
        return t;
    };

    NativeBigInt.prototype.modInv = SmallInteger.prototype.modInv = BigInteger.prototype.modInv;

    BigInteger.prototype.next = function () {
        var value = this.value;
        if (this.sign) {
            return subtractSmall(value, 1, this.sign);
        }
        return new BigInteger(addSmall(value, 1), this.sign);
    };
    SmallInteger.prototype.next = function () {
        var value = this.value;
        if (value + 1 < MAX_INT) return new SmallInteger(value + 1);
        return new BigInteger(MAX_INT_ARR, false);
    };
    NativeBigInt.prototype.next = function () {
        return new NativeBigInt(this.value + BigInt(1));
    }

    BigInteger.prototype.prev = function () {
        var value = this.value;
        if (this.sign) {
            return new BigInteger(addSmall(value, 1), true);
        }
        return subtractSmall(value, 1, this.sign);
    };
    SmallInteger.prototype.prev = function () {
        var value = this.value;
        if (value - 1 > -MAX_INT) return new SmallInteger(value - 1);
        return new BigInteger(MAX_INT_ARR, true);
    };
    NativeBigInt.prototype.prev = function () {
        return new NativeBigInt(this.value - BigInt(1));
    }

    var powersOfTwo = [1];
    while (2 * powersOfTwo[powersOfTwo.length - 1] <= BASE) powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);
    var powers2Length = powersOfTwo.length, highestPower2 = powersOfTwo[powers2Length - 1];

    function shift_isSmall(n) {
        return Math.abs(n) <= BASE;
    }

    BigInteger.prototype.shiftLeft = function (v) {
        var n = parseValue(v).toJSNumber();
        if (!shift_isSmall(n)) {
            throw new Error(String(n) + " is too large for shifting.");
        }
        if (n < 0) return this.shiftRight(-n);
        var result = this;
        if (result.isZero()) return result;
        while (n >= powers2Length) {
            result = result.multiply(highestPower2);
            n -= powers2Length - 1;
        }
        return result.multiply(powersOfTwo[n]);
    };
    NativeBigInt.prototype.shiftLeft = SmallInteger.prototype.shiftLeft = BigInteger.prototype.shiftLeft;

    BigInteger.prototype.shiftRight = function (v) {
        var remQuo;
        var n = parseValue(v).toJSNumber();
        if (!shift_isSmall(n)) {
            throw new Error(String(n) + " is too large for shifting.");
        }
        if (n < 0) return this.shiftLeft(-n);
        var result = this;
        while (n >= powers2Length) {
            if (result.isZero() || (result.isNegative() && result.isUnit())) return result;
            remQuo = divModAny(result, highestPower2);
            result = remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
            n -= powers2Length - 1;
        }
        remQuo = divModAny(result, powersOfTwo[n]);
        return remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
    };
    NativeBigInt.prototype.shiftRight = SmallInteger.prototype.shiftRight = BigInteger.prototype.shiftRight;

    function bitwise(x, y, fn) {
        y = parseValue(y);
        var xSign = x.isNegative(), ySign = y.isNegative();
        var xRem = xSign ? x.not() : x,
            yRem = ySign ? y.not() : y;
        var xDigit = 0, yDigit = 0;
        var xDivMod = null, yDivMod = null;
        var result = [];
        while (!xRem.isZero() || !yRem.isZero()) {
            xDivMod = divModAny(xRem, highestPower2);
            xDigit = xDivMod[1].toJSNumber();
            if (xSign) {
                xDigit = highestPower2 - 1 - xDigit; // two's complement for negative numbers
            }

            yDivMod = divModAny(yRem, highestPower2);
            yDigit = yDivMod[1].toJSNumber();
            if (ySign) {
                yDigit = highestPower2 - 1 - yDigit; // two's complement for negative numbers
            }

            xRem = xDivMod[0];
            yRem = yDivMod[0];
            result.push(fn(xDigit, yDigit));
        }
        var sum = fn(xSign ? 1 : 0, ySign ? 1 : 0) !== 0 ? bigInt(-1) : bigInt(0);
        for (var i = result.length - 1; i >= 0; i -= 1) {
            sum = sum.multiply(highestPower2).add(bigInt(result[i]));
        }
        return sum;
    }

    BigInteger.prototype.not = function () {
        return this.negate().prev();
    };
    NativeBigInt.prototype.not = SmallInteger.prototype.not = BigInteger.prototype.not;

    BigInteger.prototype.and = function (n) {
        return bitwise(this, n, function (a, b) { return a & b; });
    };
    NativeBigInt.prototype.and = SmallInteger.prototype.and = BigInteger.prototype.and;

    BigInteger.prototype.or = function (n) {
        return bitwise(this, n, function (a, b) { return a | b; });
    };
    NativeBigInt.prototype.or = SmallInteger.prototype.or = BigInteger.prototype.or;

    BigInteger.prototype.xor = function (n) {
        return bitwise(this, n, function (a, b) { return a ^ b; });
    };
    NativeBigInt.prototype.xor = SmallInteger.prototype.xor = BigInteger.prototype.xor;

    var LOBMASK_I = 1 << 30, LOBMASK_BI = (BASE & -BASE) * (BASE & -BASE) | LOBMASK_I;
    function roughLOB(n) { // get lowestOneBit (rough)
        // SmallInteger: return Min(lowestOneBit(n), 1 << 30)
        // BigInteger: return Min(lowestOneBit(n), 1 << 14) [BASE=1e7]
        var v = n.value,
            x = typeof v === "number" ? v | LOBMASK_I :
                typeof v === "bigint" ? v | BigInt(LOBMASK_I) :
                    v[0] + v[1] * BASE | LOBMASK_BI;
        return x & -x;
    }

    function integerLogarithm(value, base) {
        if (base.compareTo(value) <= 0) {
            var tmp = integerLogarithm(value, base.square(base));
            var p = tmp.p;
            var e = tmp.e;
            var t = p.multiply(base);
            return t.compareTo(value) <= 0 ? { p: t, e: e * 2 + 1 } : { p: p, e: e * 2 };
        }
        return { p: bigInt(1), e: 0 };
    }

    BigInteger.prototype.bitLength = function () {
        var n = this;
        if (n.compareTo(bigInt(0)) < 0) {
            n = n.negate().subtract(bigInt(1));
        }
        if (n.compareTo(bigInt(0)) === 0) {
            return bigInt(0);
        }
        return bigInt(integerLogarithm(n, bigInt(2)).e).add(bigInt(1));
    }
    NativeBigInt.prototype.bitLength = SmallInteger.prototype.bitLength = BigInteger.prototype.bitLength;

    function max(a, b) {
        a = parseValue(a);
        b = parseValue(b);
        return a.greater(b) ? a : b;
    }
    function min(a, b) {
        a = parseValue(a);
        b = parseValue(b);
        return a.lesser(b) ? a : b;
    }
    function gcd(a, b) {
        a = parseValue(a).abs();
        b = parseValue(b).abs();
        if (a.equals(b)) return a;
        if (a.isZero()) return b;
        if (b.isZero()) return a;
        var c = Integer[1], d, t;
        while (a.isEven() && b.isEven()) {
            d = min(roughLOB(a), roughLOB(b));
            a = a.divide(d);
            b = b.divide(d);
            c = c.multiply(d);
        }
        while (a.isEven()) {
            a = a.divide(roughLOB(a));
        }
        do {
            while (b.isEven()) {
                b = b.divide(roughLOB(b));
            }
            if (a.greater(b)) {
                t = b; b = a; a = t;
            }
            b = b.subtract(a);
        } while (!b.isZero());
        return c.isUnit() ? a : a.multiply(c);
    }
    function lcm(a, b) {
        a = parseValue(a).abs();
        b = parseValue(b).abs();
        return a.divide(gcd(a, b)).multiply(b);
    }
    function randBetween(a, b, rng) {
        a = parseValue(a);
        b = parseValue(b);
        var usedRNG = rng || Math.random;
        var low = min(a, b), high = max(a, b);
        var range = high.subtract(low).add(1);
        if (range.isSmall) return low.add(Math.floor(usedRNG() * range));
        var digits = toBase(range, BASE).value;
        var result = [], restricted = true;
        for (var i = 0; i < digits.length; i++) {
            var top = restricted ? digits[i] : BASE;
            var digit = truncate(usedRNG() * top);
            result.push(digit);
            if (digit < top) restricted = false;
        }
        return low.add(Integer.fromArray(result, BASE, false));
    }

    var parseBase = function (text, base, alphabet, caseSensitive) {
        alphabet = alphabet || DEFAULT_ALPHABET;
        text = String(text);
        if (!caseSensitive) {
            text = text.toLowerCase();
            alphabet = alphabet.toLowerCase();
        }
        var length = text.length;
        var i;
        var absBase = Math.abs(base);
        var alphabetValues = {};
        for (i = 0; i < alphabet.length; i++) {
            alphabetValues[alphabet[i]] = i;
        }
        for (i = 0; i < length; i++) {
            var c = text[i];
            if (c === "-") continue;
            if (c in alphabetValues) {
                if (alphabetValues[c] >= absBase) {
                    if (c === "1" && absBase === 1) continue;
                    throw new Error(c + " is not a valid digit in base " + base + ".");
                }
            }
        }
        base = parseValue(base);
        var digits = [];
        var isNegative = text[0] === "-";
        for (i = isNegative ? 1 : 0; i < text.length; i++) {
            var c = text[i];
            if (c in alphabetValues) digits.push(parseValue(alphabetValues[c]));
            else if (c === "<") {
                var start = i;
                do { i++; } while (text[i] !== ">" && i < text.length);
                digits.push(parseValue(text.slice(start + 1, i)));
            }
            else throw new Error(c + " is not a valid character");
        }
        return parseBaseFromArray(digits, base, isNegative);
    };

    function parseBaseFromArray(digits, base, isNegative) {
        var val = Integer[0], pow = Integer[1], i;
        for (i = digits.length - 1; i >= 0; i--) {
            val = val.add(digits[i].times(pow));
            pow = pow.times(base);
        }
        return isNegative ? val.negate() : val;
    }

    function stringify(digit, alphabet) {
        alphabet = alphabet || DEFAULT_ALPHABET;
        if (digit < alphabet.length) {
            return alphabet[digit];
        }
        return "<" + digit + ">";
    }

    function toBase(n, base) {
        base = bigInt(base);
        if (base.isZero()) {
            if (n.isZero()) return { value: [0], isNegative: false };
            throw new Error("Cannot convert nonzero numbers to base 0.");
        }
        if (base.equals(-1)) {
            if (n.isZero()) return { value: [0], isNegative: false };
            if (n.isNegative())
                return {
                    value: [].concat.apply([], Array.apply(null, Array(-n.toJSNumber()))
                        .map(Array.prototype.valueOf, [1, 0])
                    ),
                    isNegative: false
                };

            var arr = Array.apply(null, Array(n.toJSNumber() - 1))
                .map(Array.prototype.valueOf, [0, 1]);
            arr.unshift([1]);
            return {
                value: [].concat.apply([], arr),
                isNegative: false
            };
        }

        var neg = false;
        if (n.isNegative() && base.isPositive()) {
            neg = true;
            n = n.abs();
        }
        if (base.isUnit()) {
            if (n.isZero()) return { value: [0], isNegative: false };

            return {
                value: Array.apply(null, Array(n.toJSNumber()))
                    .map(Number.prototype.valueOf, 1),
                isNegative: neg
            };
        }
        var out = [];
        var left = n, divmod;
        while (left.isNegative() || left.compareAbs(base) >= 0) {
            divmod = left.divmod(base);
            left = divmod.quotient;
            var digit = divmod.remainder;
            if (digit.isNegative()) {
                digit = base.minus(digit).abs();
                left = left.next();
            }
            out.push(digit.toJSNumber());
        }
        out.push(left.toJSNumber());
        return { value: out.reverse(), isNegative: neg };
    }

    function toBaseString(n, base, alphabet) {
        var arr = toBase(n, base);
        return (arr.isNegative ? "-" : "") + arr.value.map(function (x) {
            return stringify(x, alphabet);
        }).join('');
    }

    BigInteger.prototype.toArray = function (radix) {
        return toBase(this, radix);
    };

    SmallInteger.prototype.toArray = function (radix) {
        return toBase(this, radix);
    };

    NativeBigInt.prototype.toArray = function (radix) {
        return toBase(this, radix);
    };

    BigInteger.prototype.toString = function (radix, alphabet) {
        if (radix === undefined) radix = 10;
        if (radix !== 10) return toBaseString(this, radix, alphabet);
        var v = this.value, l = v.length, str = String(v[--l]), zeros = "0000000", digit;
        while (--l >= 0) {
            digit = String(v[l]);
            str += zeros.slice(digit.length) + digit;
        }
        var sign = this.sign ? "-" : "";
        return sign + str;
    };

    SmallInteger.prototype.toString = function (radix, alphabet) {
        if (radix === undefined) radix = 10;
        if (radix != 10) return toBaseString(this, radix, alphabet);
        return String(this.value);
    };

    NativeBigInt.prototype.toString = SmallInteger.prototype.toString;

    NativeBigInt.prototype.toJSON = BigInteger.prototype.toJSON = SmallInteger.prototype.toJSON = function () { return this.toString(); }

    BigInteger.prototype.valueOf = function () {
        return parseInt(this.toString(), 10);
    };
    BigInteger.prototype.toJSNumber = BigInteger.prototype.valueOf;

    SmallInteger.prototype.valueOf = function () {
        return this.value;
    };
    SmallInteger.prototype.toJSNumber = SmallInteger.prototype.valueOf;
    NativeBigInt.prototype.valueOf = NativeBigInt.prototype.toJSNumber = function () {
        return parseInt(this.toString(), 10);
    }

    function parseStringValue(v) {
        if (isPrecise(+v)) {
            var x = +v;
            if (x === truncate(x))
                return supportsNativeBigInt ? new NativeBigInt(BigInt(x)) : new SmallInteger(x);
            throw new Error("Invalid integer: " + v);
        }
        var sign = v[0] === "-";
        if (sign) v = v.slice(1);
        var split = v.split(/e/i);
        if (split.length > 2) throw new Error("Invalid integer: " + split.join("e"));
        if (split.length === 2) {
            var exp = split[1];
            if (exp[0] === "+") exp = exp.slice(1);
            exp = +exp;
            if (exp !== truncate(exp) || !isPrecise(exp)) throw new Error("Invalid integer: " + exp + " is not a valid exponent.");
            var text = split[0];
            var decimalPlace = text.indexOf(".");
            if (decimalPlace >= 0) {
                exp -= text.length - decimalPlace - 1;
                text = text.slice(0, decimalPlace) + text.slice(decimalPlace + 1);
            }
            if (exp < 0) throw new Error("Cannot include negative exponent part for integers");
            text += (new Array(exp + 1)).join("0");
            v = text;
        }
        var isValid = /^([0-9][0-9]*)$/.test(v);
        if (!isValid) throw new Error("Invalid integer: " + v);
        if (supportsNativeBigInt) {
            return new NativeBigInt(BigInt(sign ? "-" + v : v));
        }
        var r = [], max = v.length, l = LOG_BASE, min = max - l;
        while (max > 0) {
            r.push(+v.slice(min, max));
            min -= l;
            if (min < 0) min = 0;
            max -= l;
        }
        trim(r);
        return new BigInteger(r, sign);
    }

    function parseNumberValue(v) {
        if (supportsNativeBigInt) {
            return new NativeBigInt(BigInt(v));
        }
        if (isPrecise(v)) {
            if (v !== truncate(v)) throw new Error(v + " is not an integer.");
            return new SmallInteger(v);
        }
        return parseStringValue(v.toString());
    }

    function parseValue(v) {
        if (typeof v === "number") {
            return parseNumberValue(v);
        }
        if (typeof v === "string") {
            return parseStringValue(v);
        }
        if (typeof v === "bigint") {
            return new NativeBigInt(v);
        }
        return v;
    }
    // Pre-define numbers in range [-999,999]
    for (var i = 0; i < 1000; i++) {
        Integer[i] = parseValue(i);
        if (i > 0) Integer[-i] = parseValue(-i);
    }
    // Backwards compatibility
    Integer.one = Integer[1];
    Integer.zero = Integer[0];
    Integer.minusOne = Integer[-1];
    Integer.max = max;
    Integer.min = min;
    Integer.gcd = gcd;
    Integer.lcm = lcm;
    Integer.isInstance = function (x) { return x instanceof BigInteger || x instanceof SmallInteger || x instanceof NativeBigInt; };
    Integer.randBetween = randBetween;

    Integer.fromArray = function (digits, base, isNegative) {
        return parseBaseFromArray(digits.map(parseValue), parseValue(base || 10), isNegative);
    };

    return Integer;
})();

// Node.js check
if (typeof module !== "undefined" && module.hasOwnProperty("exports")) {
    module.exports = bigInt;
}

//amd check
if (typeof define === "function" && define.amd) {
    define( function () {
        return bigInt;
    });
}

},{}]},{},[4]);
