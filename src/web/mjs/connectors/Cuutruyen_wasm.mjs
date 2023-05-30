/* eslint-disable */
let wasm;

const heap = new Array(128).fill(undefined);
heap.push(undefined, null, true, false);

function getObject(idx) {
    return heap[idx];
}

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

let WASM_VECTOR_LEN = 0;

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

const lTextEncoder = typeof TextEncoder === 'undefined' ? (0, module.require)('util').TextEncoder : TextEncoder;

let cachedTextEncoder = new lTextEncoder('utf-8');

const encodeString = typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
        return cachedTextEncoder.encodeInto(arg, view);
    }
    : function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
}

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

let stack_pointer = 32;

function addBorrowedObject(obj) {
    if (stack_pointer == 1) throw new Error('out of js stack');
    heap[--stack_pointer] = obj;
    return stack_pointer;
}
/**
* @param {HTMLImageElement} obfuscated_image
* @param {CanvasRenderingContext2D} ctx
* @param {string} drm_data
*/
export function render_image(obfuscated_image, ctx, drm_data) {
    try {
        var ptr0 = passStringToWasm0(drm_data, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.render_image(addBorrowedObject(obfuscated_image), addBorrowedObject(ctx), ptr0, len0);
    } finally {
        heap[stack_pointer++] = undefined;
        heap[stack_pointer++] = undefined;
    }
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}

export function __wbindgen_object_drop_ref(arg0) {
    takeObject(arg0);
}

export function __wbg_drawImage_b0048171a8941c61() {
    return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        getObject(arg0).drawImage(getObject(arg1), arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9);
    }, arguments);
}

export function __wbg_width_9b5b21f79c220ac9(arg0) {
    var ret = getObject(arg0).width;
    return ret;
}

export function __wbg_stack_0ddaca5d1abfb52f(arg0, arg1) {
    var ret = getObject(arg1).stack;
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
}

/* eslint-disable-next-line no-unused-vars */
export function __wbg_instanceof_Window_c5579e140698a9dc(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof Window;
    } catch {
        result = false;
    }
    const ret = result;
    return ret;
}

export function __wbg_newnoargs_c9e6043b8ad84109(arg0, arg1) {
    var ret = new Function(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
}

export function __wbg_call_557a2f2deacc4912() {
    return handleError(function (arg0, arg1) {
        var ret = getObject(arg0).call(getObject(arg1));
        return addHeapObject(ret);
    }, arguments);
}

export function __wbg_document_508774c021174a52(arg0) {
    const ret = getObject(arg0).document;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
}

export function __wbg_querySelector_41d5da02fa776534() {
    return handleError(function (arg0, arg1, arg2) {
        const ret = document.createElement("div");
        ret.setAttribute("data-v-33be1776", "");
        ret.id = "phrase";
        ret.classList = "hidden";
        ret.innerText = "gallery-diploma-tango";
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments);
}

export function __wbg_innerHTML_f2c91e18a4bf9c97(arg0, arg1) {
    var ret = getObject(arg1).innerHTML;
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
}

export function __wbg_self_742dd6eab3e9211e() {
    return handleError(function () {
        const ret = self.self;
        return addHeapObject(ret);
    }, arguments);
}

export function __wbg_window_c409e731db53a0e2() {
    return handleError(function () {
        const ret = window.window;
        return addHeapObject(ret);
    }, arguments);
}

export function __wbg_globalThis_b70c095388441f2d() {
    return handleError(function () {
        const ret = globalThis.globalThis;
        return addHeapObject(ret);
    }, arguments);
}

export function __wbg_global_1c72617491ed7194() {
    return handleError(function () {
        const ret = global.global;
        return addHeapObject(ret);
    }, arguments);
}

/* eslint-disable-next-line no-unused-vars */
export function __wbindgen_is_undefined(arg0) {
    const ret = getObject(arg0) === undefined;
    return ret;
}

export function __wbindgen_object_clone_ref(arg0) {
    var ret = getObject(arg0);
    return addHeapObject(ret);
}

export function __wbindgen_debug_string(arg0, arg1) {
    var ret = debugString(getObject(arg1));
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
}

export function __wbindgen_throw(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

/* eslint-disable-next-line no-unused-vars */
function initMemory(imports, maybe_memory) {

}

/**
 * 
 * @param {WebAssembly.Instance} instance 
 * @param {WebAssembly.Module} module 
 * @returns {WebAssembly.Exports}
 */
function finalizeInit(instance, module) {
    wasm = instance.exports;
    return wasm;
}

/**
 * 
 * @param {WebAssembly.Module | Response | PromiseLike<Response>} mod 
 * @returns 
 */
export async function init(mod) {
    const imports = {
        "./cuudrm_bg.js": {
            __wbindgen_object_drop_ref,
            __wbg_instanceof_Window_c5579e140698a9dc,
            __wbg_document_508774c021174a52,
            __wbg_sessionStorage_263f344230ee7188:  function() {
                return handleError(function (arg0) {
                    const ret = getObject(arg0).sessionStorage;
                    return isLikeNone(ret) ? 0 : addHeapObject(ret);
                }, arguments);
            },
            __wbg_querySelector_41d5da02fa776534,
            __wbg_getItem_84095995ffbc84fc: function() {
                return handleError(function (arg0, arg1, arg2, arg3) {
                    const ret = getObject(arg1).getItem(getStringFromWasm0(arg2, arg3));
                    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
                    var len1 = WASM_VECTOR_LEN;
                    getInt32Memory0()[arg0 / 4 + 1] = len1;
                    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
                }, arguments);
            },
            __wbg_drawImage_b0048171a8941c61,
            __wbg_width_9b5b21f79c220ac9,
            __wbg_newnoargs_c9e6043b8ad84109,
            __wbg_call_557a2f2deacc4912,
            __wbg_self_742dd6eab3e9211e,
            __wbg_window_c409e731db53a0e2,
            __wbg_globalThis_b70c095388441f2d,
            __wbg_global_1c72617491ed7194,
            __wbindgen_is_undefined,
            __wbindgen_object_clone_ref,
            __wbindgen_debug_string,
            __wbindgen_throw,
        }
    };

    initMemory(imports);

    if (!(mod instanceof WebAssembly.Module)) {
        mod = await WebAssembly.compileStreaming(mod);
    }

    const instance = await WebAssembly.instantiate(mod, imports);

    return finalizeInit(instance, mod);
}
