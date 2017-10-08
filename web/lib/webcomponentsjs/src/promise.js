/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
'use strict';
import ES6Promise from '../node_modules/es6-promise/lib/es6-promise/promise.js';

/*
Assign the ES6 promise polyfill to window ourselves instead of using the "auto" polyfill
to work around https://github.com/webcomponents/webcomponentsjs/issues/837
*/
if (!window.Promise) {
  window.Promise = ES6Promise;
  // save catch function with a string name to prevent renaming and dead code eliminiation with closure
  ES6Promise.prototype['catch'] = ES6Promise.prototype.catch;
}