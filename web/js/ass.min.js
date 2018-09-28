(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.ASS = factory());
}(this, (function () { 'use strict';

  function parseEffect(text) {
    var param = text
      .toLowerCase()
      .trim()
      .split(/\s*;\s*/);
    if (param[0] === 'banner') {
      return {
        name: param[0],
        delay: param[1] * 1 || 0,
        leftToRight: param[2] * 1 || 0,
        fadeAwayWidth: param[3] * 1 || 0,
      };
    }
    if (/^scroll\s/.test(param[0])) {
      return {
        name: param[0],
        y1: Math.min(param[1] * 1, param[2] * 1),
        y2: Math.max(param[1] * 1, param[2] * 1),
        delay: param[3] * 1 || 0,
        fadeAwayHeight: param[4] * 1 || 0,
      };
    }
    return null;
  }

  function parseDrawing(text) {
    return text
      .toLowerCase()
      // numbers
      .replace(/([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)/g, ' $1 ')
      // commands
      .replace(/([mnlbspc])/g, ' $1 ')
      .trim()
      .replace(/\s+/g, ' ')
      .split(/\s(?=[mnlbspc])/)
      .map(function (cmd) { return (
        cmd.split(' ')
          .filter(function (x, i) { return !(i && Number.isNaN(x * 1)); })
      ); });
  }

  var numTags = [
    'b', 'i', 'u', 's', 'fsp',
    'k', 'K', 'kf', 'ko', 'kt',
    'fe', 'q', 'p', 'pbo', 'a', 'an',
    'fscx', 'fscy', 'fax', 'fay', 'frx', 'fry', 'frz', 'fr',
    'be', 'blur', 'bord', 'xbord', 'ybord', 'shad', 'xshad', 'yshad' ];

  var numRegexs = numTags.map(function (nt) { return ({ name: nt, regex: new RegExp(("^" + nt + "-?\\d")) }); });

  function parseTag(text) {
    var assign;

    var tag = {};
    for (var i = 0; i < numRegexs.length; i++) {
      var ref = numRegexs[i];
      var name = ref.name;
      var regex = ref.regex;
      if (regex.test(text)) {
        tag[name] = text.slice(name.length) * 1;
        return tag;
      }
    }
    if (/^fn/.test(text)) {
      tag.fn = text.slice(2);
    } else if (/^r/.test(text)) {
      tag.r = text.slice(1);
    } else if (/^fs[\d+-]/.test(text)) {
      tag.fs = text.slice(2);
    } else if (/^\d?c&?H?[0-9a-f]+|^\d?c$/i.test(text)) {
      var ref$1 = text.match(/^(\d?)c&?H?(\w*)/);
      var num = ref$1[1];
      var color = ref$1[2];
      tag[("c" + (num || 1))] = color && ("000000" + color).slice(-6);
    } else if (/^\da&?H?[0-9a-f]+/i.test(text)) {
      var ref$2 = text.match(/^(\d)a&?H?(\w\w)/);
      var num$1 = ref$2[1];
      var alpha = ref$2[2];
      tag[("a" + num$1)] = alpha;
    } else if (/^alpha&?H?[0-9a-f]+/i.test(text)) {
      (assign = text.match(/^alpha&?H?([0-9a-f]+)/i), tag.alpha = assign[1]);
      tag.alpha = ("00" + (tag.alpha)).slice(-2);
    } else if (/^(?:pos|org|move|fad|fade)\(/.test(text)) {
      var ref$3 = text.match(/^(\w+)\((.*?)\)?$/);
      var key = ref$3[1];
      var value = ref$3[2];
      tag[key] = value
        .trim()
        .split(/\s*,\s*/)
        .map(Number);
    } else if (/^i?clip/.test(text)) {
      var p = text
        .match(/^i?clip\((.*?)\)?$/)[1]
        .trim()
        .split(/\s*,\s*/);
      tag.clip = {
        inverse: /iclip/.test(text),
        scale: 1,
        drawing: null,
        dots: null,
      };
      if (p.length === 1) {
        tag.clip.drawing = parseDrawing(p[0]);
      }
      if (p.length === 2) {
        tag.clip.scale = p[0] * 1;
        tag.clip.drawing = parseDrawing(p[1]);
      }
      if (p.length === 4) {
        tag.clip.dots = p.map(Number);
      }
    } else if (/^t\(/.test(text)) {
      var p$1 = text
        .match(/^t\((.*?)\)?$/)[1]
        .trim()
        .replace(/\\.*/, function (x) { return x.replace(/,/g, '\n'); })
        .split(/\s*,\s*/);
      if (!p$1[0]) { return tag; }
      tag.t = {
        t1: 0,
        t2: 0,
        accel: 1,
        tags: p$1[p$1.length - 1]
          .replace(/\n/g, ',')
          .split('\\')
          .slice(1)
          .map(parseTag),
      };
      if (p$1.length === 2) {
        tag.t.accel = p$1[0] * 1;
      }
      if (p$1.length === 3) {
        tag.t.t1 = p$1[0] * 1;
        tag.t.t2 = p$1[1] * 1;
      }
      if (p$1.length === 4) {
        tag.t.t1 = p$1[0] * 1;
        tag.t.t2 = p$1[1] * 1;
        tag.t.accel = p$1[2] * 1;
      }
    }

    return tag;
  }

  function parseTags(text) {
    var tags = [];
    var depth = 0;
    var str = '';
    for (var i = 0; i < text.length; i++) {
      var x = text[i];
      if (x === '(') { depth++; }
      if (x === ')') { depth--; }
      if (depth < 0) { depth = 0; }
      if (!depth && x === '\\') {
        if (str) {
          tags.push(str);
        }
        str = '';
      } else {
        str += x;
      }
    }
    tags.push(str);
    return tags.map(parseTag);
  }

  function parseText(text) {
    var pairs = text.split(/{([^{}]*?)}/);
    var parsed = [];
    if (pairs[0].length) {
      parsed.push({ tags: [], text: pairs[0], drawing: [] });
    }
    for (var i = 1; i < pairs.length; i += 2) {
      var tags = parseTags(pairs[i]);
      var isDrawing = tags.reduce(function (v, tag) { return (tag.p === undefined ? v : !!tag.p); }, false);
      parsed.push({
        tags: tags,
        text: isDrawing ? '' : pairs[i + 1],
        drawing: isDrawing ? parseDrawing(pairs[i + 1]) : [],
      });
    }
    return {
      raw: text,
      combined: parsed.map(function (frag) { return frag.text; }).join(''),
      parsed: parsed,
    };
  }

  function parseTime(time) {
    var t = time.split(':');
    return t[0] * 3600 + t[1] * 60 + t[2] * 1;
  }

  function parseDialogue(text, format) {
    var fields = text.split(',');
    if (fields.length > format.length) {
      var textField = fields.slice(format.length - 1).join();
      fields = fields.slice(0, format.length - 1);
      fields.push(textField);
    }

    var dia = {};
    for (var i = 0; i < fields.length; i++) {
      var fmt = format[i];
      var fld = fields[i].trim();
      switch (fmt) {
        case 'Layer':
        case 'MarginL':
        case 'MarginR':
        case 'MarginV':
          dia[fmt] = fld * 1;
          break;
        case 'Start':
        case 'End':
          dia[fmt] = parseTime(fld);
          break;
        case 'Effect':
          dia[fmt] = parseEffect(fld);
          break;
        case 'Text':
          dia[fmt] = parseText(fld);
          break;
        default:
          dia[fmt] = fld;
      }
    }

    return dia;
  }

  function parseFormat(text) {
    return text.match(/Format\s*:\s*(.*)/i)[1].split(/\s*,\s*/);
  }

  function parseStyle(text) {
    return text.match(/Style\s*:\s*(.*)/i)[1].split(/\s*,\s*/);
  }

  function parse(text) {
    var tree = {
      info: {},
      styles: { format: [], style: [] },
      events: { format: [], comment: [], dialogue: [] },
    };
    var lines = text.split(/\r?\n/);
    var state = 0;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (/^;/.test(line)) { continue; }

      if (/^\[Script Info\]/i.test(line)) { state = 1; }
      else if (/^\[V4\+? Styles\]/i.test(line)) { state = 2; }
      else if (/^\[Events\]/i.test(line)) { state = 3; }
      else if (/^\[.*\]/.test(line)) { state = 0; }

      if (state === 0) { continue; }
      if (state === 1) {
        if (/:/.test(line)) {
          var ref = line.match(/(.*?)\s*:\s*(.*)/);
          var key = ref[1];
          var value = ref[2];
          tree.info[key] = value;
        }
      }
      if (state === 2) {
        if (/^Format\s*:/i.test(line)) {
          tree.styles.format = parseFormat(line);
        }
        if (/^Style\s*:/i.test(line)) {
          tree.styles.style.push(parseStyle(line));
        }
      }
      if (state === 3) {
        if (/^Format\s*:/i.test(line)) {
          tree.events.format = parseFormat(line);
        }
        if (/^(?:Comment|Dialogue)\s*:/i.test(line)) {
          var ref$1 = line.match(/^(\w+?)\s*:\s*(.*)/i);
          var key$1 = ref$1[1];
          var value$1 = ref$1[2];
          tree.events[key$1.toLowerCase()].push(parseDialogue(value$1, tree.events.format));
        }
      }
    }

    return tree;
  }

  var assign = Object.assign || (
    /* istanbul ignore next */
    function assign(target) {
      var sources = [], len = arguments.length - 1;
      while ( len-- > 0 ) sources[ len ] = arguments[ len + 1 ];

      for (var i = 0; i < sources.length; i++) {
        if (!sources[i]) { continue; }
        var keys = Object.keys(sources[i]);
        for (var j = 0; j < keys.length; j++) {
          // eslint-disable-next-line no-param-reassign
          target[keys[j]] = sources[i][keys[j]];
        }
      }
      return target;
    }
  );

  function createCommand(arr) {
    var cmd = {
      type: null,
      prev: null,
      next: null,
      points: [],
    };
    if (/[mnlbs]/.test(arr[0])) {
      cmd.type = arr[0]
        .toUpperCase()
        .replace('N', 'L')
        .replace('B', 'C');
    }
    for (var len = arr.length - !(arr.length & 1), i = 1; i < len; i += 2) {
      cmd.points.push({ x: arr[i] * 1, y: arr[i + 1] * 1 });
    }
    return cmd;
  }

  function isValid(cmd) {
    if (!cmd.points.length || !cmd.type) {
      return false;
    }
    if (/C|S/.test(cmd.type) && cmd.points.length < 3) {
      return false;
    }
    return true;
  }

  function getViewBox(commands) {
    var ref;

    var minX = Infinity;
    var minY = Infinity;
    var maxX = -Infinity;
    var maxY = -Infinity;
    (ref = []).concat.apply(ref, commands.map(function (ref) {
      var points = ref.points;

      return points;
    })).forEach(function (ref) {
      var x = ref.x;
      var y = ref.y;

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    });
    return {
      minX: minX,
      minY: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  /**
   * Convert S command to B command
   * Reference from https://github.com/d3/d3/blob/v3.5.17/src/svg/line.js#L259
   * @param  {Array}  points points
   * @param  {String} prev   type of previous command
   * @param  {String} next   type of next command
   * @return {Array}         converted commands
   */
  function s2b(points, prev, next) {
    var results = [];
    var bb1 = [0, 2 / 3, 1 / 3, 0];
    var bb2 = [0, 1 / 3, 2 / 3, 0];
    var bb3 = [0, 1 / 6, 2 / 3, 1 / 6];
    var dot4 = function (a, b) { return (a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]); };
    var px = [points[points.length - 1].x, points[0].x, points[1].x, points[2].x];
    var py = [points[points.length - 1].y, points[0].y, points[1].y, points[2].y];
    results.push({
      type: prev === 'M' ? 'M' : 'L',
      points: [{ x: dot4(bb3, px), y: dot4(bb3, py) }],
    });
    for (var i = 3; i < points.length; i++) {
      px = [points[i - 3].x, points[i - 2].x, points[i - 1].x, points[i].x];
      py = [points[i - 3].y, points[i - 2].y, points[i - 1].y, points[i].y];
      results.push({
        type: 'C',
        points: [
          { x: dot4(bb1, px), y: dot4(bb1, py) },
          { x: dot4(bb2, px), y: dot4(bb2, py) },
          { x: dot4(bb3, px), y: dot4(bb3, py) } ],
      });
    }
    if (next === 'L' || next === 'C') {
      var last = points[points.length - 1];
      results.push({ type: 'L', points: [{ x: last.x, y: last.y }] });
    }
    return results;
  }

  function toSVGPath(instructions) {
    return instructions.map(function (ref) {
      var type = ref.type;
      var points = ref.points;

      return (
      type + points.map(function (ref) {
        var x = ref.x;
        var y = ref.y;

        return (x + "," + y);
      }).join(',')
    );
    }).join('');
  }

  function compileDrawing(rawCommands) {
    var ref$1;

    var commands = [];
    var i = 0;
    while (i < rawCommands.length) {
      var arr = rawCommands[i];
      var cmd = createCommand(arr);
      if (isValid(cmd)) {
        if (cmd.type === 'S') {
          var ref = (commands[i - 1] || { points: [{ x: 0, y: 0 }] }).points.slice(-1)[0];
          var x = ref.x;
          var y = ref.y;
          cmd.points.unshift({ x: x, y: y });
        }
        if (i) {
          cmd.prev = commands[i - 1].type;
          commands[i - 1].next = cmd.type;
        }
        commands.push(cmd);
        i++;
      } else {
        if (i && commands[i - 1].type === 'S') {
          var additionPoints = {
            p: cmd.points,
            c: commands[i - 1].points.slice(0, 3),
          };
          commands[i - 1].points = commands[i - 1].points.concat(
            (additionPoints[arr[0]] || []).map(function (ref) {
              var x = ref.x;
              var y = ref.y;

              return ({ x: x, y: y });
          })
          );
        }
        rawCommands.splice(i, 1);
      }
    }
    var instructions = (ref$1 = []).concat.apply(
      ref$1, commands.map(function (ref) {
        var type = ref.type;
        var points = ref.points;
        var prev = ref.prev;
        var next = ref.next;

        return (
        type === 'S'
          ? s2b(points, prev, next)
          : { type: type, points: points }
      );
    })
    );

    return assign({ instructions: instructions, d: toSVGPath(instructions) }, getViewBox(commands));
  }

  var tTags = [
    'fs', 'clip',
    'c1', 'c2', 'c3', 'c4', 'a1', 'a2', 'a3', 'a4', 'alpha',
    'fscx', 'fscy', 'fax', 'fay', 'frx', 'fry', 'frz', 'fr',
    'be', 'blur', 'bord', 'xbord', 'ybord', 'shad', 'xshad', 'yshad' ];

  function compileTag(tag, key, presets) {
    var obj, obj$1, obj$2;

    if ( presets === void 0 ) presets = {};
    var value = tag[key];
    if (value === undefined) {
      return null;
    }
    if (key === 'pos' || key === 'org') {
      return value.length === 2 ? ( obj = {}, obj[key] = { x: value[0], y: value[1] }, obj) : null;
    }
    if (key === 'move') {
      var x1 = value[0];
      var y1 = value[1];
      var x2 = value[2];
      var y2 = value[3];
      var t1 = value[4]; if ( t1 === void 0 ) t1 = 0;
      var t2 = value[5]; if ( t2 === void 0 ) t2 = 0;
      return value.length === 4 || value.length === 6
        ? { move: { x1: x1, y1: y1, x2: x2, y2: y2, t1: t1, t2: t2 } }
        : null;
    }
    if (key === 'fad' || key === 'fade') {
      if (value.length === 2) {
        var t1$1 = value[0];
        var t2$1 = value[1];
        return { fade: { type: 'fad', t1: t1$1, t2: t2$1 } };
      }
      if (value.length === 7) {
        var a1 = value[0];
        var a2 = value[1];
        var a3 = value[2];
        var t1$2 = value[3];
        var t2$2 = value[4];
        var t3 = value[5];
        var t4 = value[6];
        return { fade: { type: 'fade', a1: a1, a2: a2, a3: a3, t1: t1$2, t2: t2$2, t3: t3, t4: t4 } };
      }
      return null;
    }
    if (key === 'clip') {
      var inverse = value.inverse;
      var scale = value.scale;
      var drawing = value.drawing;
      var dots = value.dots;
      if (drawing) {
        return { clip: { inverse: inverse, scale: scale, drawing: compileDrawing(drawing), dots: dots } };
      }
      if (dots) {
        var x1$1 = dots[0];
        var y1$1 = dots[1];
        var x2$1 = dots[2];
        var y2$1 = dots[3];
        return { clip: { inverse: inverse, scale: scale, drawing: drawing, dots: { x1: x1$1, y1: y1$1, x2: x2$1, y2: y2$1 } } };
      }
      return null;
    }
    if (/^[xy]?(bord|shad)$/.test(key)) {
      value = Math.max(value, 0);
    }
    if (key === 'bord') {
      return { xbord: value, ybord: value };
    }
    if (key === 'shad') {
      return { xshad: value, yshad: value };
    }
    if (/^c\d$/.test(key)) {
      return ( obj$1 = {}, obj$1[key] = value || presets[key], obj$1);
    }
    if (key === 'alpha') {
      return { a1: value, a2: value, a3: value, a4: value };
    }
    if (key === 'fr') {
      return { frz: value };
    }
    if (key === 'fs') {
      return {
        fs: /^\+|-/.test(value)
          ? (value * 1 > -10 ? (1 + value / 10) : 1) * presets.fs
          : value * 1,
      };
    }
    if (key === 't') {
      var t1$3 = value.t1;
      var accel = value.accel;
      var tags = value.tags;
      var t2$3 = value.t2 || (presets.end - presets.start) * 1e3;
      var compiledTag = {};
      tags.forEach(function (t) {
        var k = Object.keys(t)[0];
        if (~tTags.indexOf(k) && !(k === 'clip' && !t[k].dots)) {
          assign(compiledTag, compileTag(t, k, presets));
        }
      });
      return { t: { t1: t1$3, t2: t2$3, accel: accel, tag: compiledTag } };
    }
    return ( obj$2 = {}, obj$2[key] = value, obj$2);
  }

  var a2an = [
    null, 1, 2, 3,
    null, 7, 8, 9,
    null, 4, 5, 6 ];

  var globalTags = ['r', 'a', 'an', 'pos', 'org', 'move', 'fade', 'fad', 'clip'];

  function createSlice(name, styles) {
    return {
      name: name,
      borderStyle: styles[name].style.BorderStyle,
      tag: styles[name].tag,
      fragments: [],
    };
  }

  function compileText(ref) {
    var styles = ref.styles;
    var name = ref.name;
    var parsed = ref.parsed;
    var start = ref.start;
    var end = ref.end;

    var alignment;
    var pos;
    var org;
    var move;
    var fade;
    var clip;
    var slices = [];
    var slice = createSlice(name, styles);
    var prevTag = {};
    for (var i = 0; i < parsed.length; i++) {
      var ref$1 = parsed[i];
      var tags = ref$1.tags;
      var text = ref$1.text;
      var drawing = ref$1.drawing;
      var reset = (void 0);
      for (var j = 0; j < tags.length; j++) {
        var tag = tags[j];
        reset = tag.r === undefined ? reset : tag.r;
      }
      var fragment = {
        tag: reset === undefined ? JSON.parse(JSON.stringify(prevTag)) : {},
        text: text,
        drawing: drawing.length ? compileDrawing(drawing) : null,
      };
      for (var j$1 = 0; j$1 < tags.length; j$1++) {
        var tag$1 = tags[j$1];
        alignment = alignment || a2an[tag$1.a || 0] || tag$1.an;
        pos = pos || compileTag(tag$1, 'pos');
        org = org || compileTag(tag$1, 'org');
        move = move || compileTag(tag$1, 'move');
        fade = fade || compileTag(tag$1, 'fade') || compileTag(tag$1, 'fad');
        clip = compileTag(tag$1, 'clip') || clip;
        var key = Object.keys(tag$1)[0];
        if (key && !~globalTags.indexOf(key)) {
          var ref$2 = slice.tag;
          var c1 = ref$2.c1;
          var c2 = ref$2.c2;
          var c3 = ref$2.c3;
          var c4 = ref$2.c4;
          var fs = prevTag.fs || slice.tag.fs;
          var compiledTag = compileTag(tag$1, key, { start: start, end: end, c1: c1, c2: c2, c3: c3, c4: c4, fs: fs });
          if (key === 't') {
            fragment.tag.t = fragment.tag.t || [];
            fragment.tag.t.push(compiledTag.t);
          } else {
            assign(fragment.tag, compiledTag);
          }
        }
      }
      prevTag = fragment.tag;
      if (reset !== undefined) {
        slices.push(slice);
        slice = createSlice(styles[reset] ? reset : name, styles);
      }
      if (fragment.text || fragment.drawing) {
        var prev = slice.fragments[slice.fragments.length - 1] || {};
        if (prev.text && fragment.text && !Object.keys(fragment.tag).length) {
          // merge fragment to previous if its tag is empty
          prev.text += fragment.text;
        } else {
          slice.fragments.push(fragment);
        }
      }
    }
    slices.push(slice);

    return assign({ alignment: alignment, slices: slices }, pos, org, move, fade, clip);
  }

  function compileDialogues(ref) {
    var styles = ref.styles;
    var dialogues = ref.dialogues;

    var minLayer = Infinity;
    var results = [];
    for (var i = 0; i < dialogues.length; i++) {
      var dia = dialogues[i];
      if (dia.Start >= dia.End) {
        continue;
      }
      if (!styles[dia.Style]) {
        dia.Style = 'Default';
      }
      var stl = styles[dia.Style].style;
      var compiledText = compileText({
        styles: styles,
        name: dia.Style,
        parsed: dia.Text.parsed,
        start: dia.Start,
        end: dia.End,
      });
      var alignment = compiledText.alignment || stl.Alignment;
      minLayer = Math.min(minLayer, dia.Layer);
      results.push(assign({
        layer: dia.Layer,
        start: dia.Start,
        end: dia.End,
        // reset style by `\r` will not effect margin and alignment
        margin: {
          left: dia.MarginL || stl.MarginL,
          right: dia.MarginR || stl.MarginR,
          vertical: dia.MarginV || stl.MarginV,
        },
        effect: dia.Effect,
      }, compiledText, { alignment: alignment }));
    }
    for (var i$1 = 0; i$1 < results.length; i$1++) {
      results[i$1].layer -= minLayer;
    }
    return results.sort(function (a, b) { return a.start - b.start || a.end - b.end; });
  }

  // same as Aegisub
  // https://github.com/Aegisub/Aegisub/blob/master/src/ass_style.h
  var DEFAULT_STYLE = {
    Name: 'Default',
    Fontname: 'Arial',
    Fontsize: '20',
    PrimaryColour: '&H00FFFFFF&',
    SecondaryColour: '&H000000FF&',
    OutlineColour: '&H00000000&',
    BackColour: '&H00000000&',
    Bold: '0',
    Italic: '0',
    Underline: '0',
    StrikeOut: '0',
    ScaleX: '100',
    ScaleY: '100',
    Spacing: '0',
    Angle: '0',
    BorderStyle: '1',
    Outline: '2',
    Shadow: '2',
    Alignment: '2',
    MarginL: '10',
    MarginR: '10',
    MarginV: '10',
    Encoding: '1',
  };

  function parseStyleColor(color) {
    var ref = color.match(/&H(\w\w)?(\w{6})&?/);
    var a = ref[1];
    var c = ref[2];
    return [a || '00', c];
  }

  function compileStyles(ref) {
    var info = ref.info;
    var style = ref.style;
    var format = ref.format;
    var defaultStyle = ref.defaultStyle;

    var result = {};
    var styles = [
      assign({}, DEFAULT_STYLE, defaultStyle, { Name: 'Default' }) ].concat( style.map(function (stl) {
        var s = {};
        for (var i = 0; i < format.length; i++) {
          s[format[i]] = stl[i];
        }
        return s;
      }) );
    var loop = function ( i ) {
      var s = styles[i];
      // this behavior is same as Aegisub by black-box testing
      if (/^(\*+)Default$/.test(s.Name)) {
        s.Name = 'Default';
      }
      Object.keys(s).forEach(function (key) {
        if (key !== 'Name' && key !== 'Fontname' && !/Colour/.test(key)) {
          s[key] *= 1;
        }
      });
      var ref$1 = parseStyleColor(s.PrimaryColour);
      var a1 = ref$1[0];
      var c1 = ref$1[1];
      var ref$2 = parseStyleColor(s.SecondaryColour);
      var a2 = ref$2[0];
      var c2 = ref$2[1];
      var ref$3 = parseStyleColor(s.OutlineColour);
      var a3 = ref$3[0];
      var c3 = ref$3[1];
      var ref$4 = parseStyleColor(s.BackColour);
      var a4 = ref$4[0];
      var c4 = ref$4[1];
      var tag = {
        fn: s.Fontname,
        fs: s.Fontsize,
        c1: c1,
        a1: a1,
        c2: c2,
        a2: a2,
        c3: c3,
        a3: a3,
        c4: c4,
        a4: a4,
        b: Math.abs(s.Bold),
        i: Math.abs(s.Italic),
        u: Math.abs(s.Underline),
        s: Math.abs(s.StrikeOut),
        fscx: s.ScaleX,
        fscy: s.ScaleY,
        fsp: s.Spacing,
        frz: s.Angle,
        xbord: s.Outline,
        ybord: s.Outline,
        xshad: s.Shadow,
        yshad: s.Shadow,
        q: /^[0-3]$/.test(info.WrapStyle) ? info.WrapStyle * 1 : 2,
      };
      result[s.Name] = { style: s, tag: tag };
    };

    for (var i = 0; i < styles.length; i++) loop( i );
    return result;
  }

  function compile(text, options) {
    if ( options === void 0 ) options = {};

    var tree = parse(text);
    var styles = compileStyles({
      info: tree.info,
      style: tree.styles.style,
      format: tree.styles.format,
      defaultStyle: options.defaultStyle || {},
    });
    return {
      info: tree.info,
      width: tree.info.PlayResX * 1 || null,
      height: tree.info.PlayResY * 1 || null,
      collisions: tree.info.Collisions || 'Normal',
      styles: styles,
      dialogues: compileDialogues({
        styles: styles,
        dialogues: tree.events.dialogue,
      }),
    };
  }

  var raf =
    window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    (function (cb) { return setTimeout(cb, 50 / 3); });

  var caf =
    window.cancelAnimationFrame ||
    window.mozCancelAnimationFrame ||
    window.webkitCancelAnimationFrame ||
    clearTimeout;

  function color2rgba(c) {
    var t = c.match(/(\w\w)(\w\w)(\w\w)(\w\w)/);
    var a = 1 - ("0x" + (t[1])) / 255;
    var b = +("0x" + (t[2]));
    var g = +("0x" + (t[3]));
    var r = +("0x" + (t[4]));
    return ("rgba(" + r + "," + g + "," + b + "," + a + ")");
  }

  function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      var v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function createSVGEl(name, attrs) {
    if ( attrs === void 0 ) attrs = [];

    var $el = document.createElementNS('http://www.w3.org/2000/svg', name);
    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];
      $el.setAttributeNS(
        attr[0] === 'xlink:href' ? 'http://www.w3.org/1999/xlink' : null,
        attr[0],
        attr[1]
      );
    }
    return $el;
  }

  function getVendor(prop) {
    var ref = document.body;
    var style = ref.style;
    var Prop = prop.replace(/^\w/, function (x) { return x.toUpperCase(); });
    if (prop in style) { return ''; }
    if (("webkit" + Prop) in style) { return '-webkit-'; }
    if (("moz" + Prop) in style) { return '-moz-'; }
    return '';
  }

  var vendor = {
    transform: getVendor('transform'),
    animation: getVendor('animation'),
    clipPath: getVendor('clipPath'),
  };

  var strokeTags = ['c3', 'a3', 'c4', 'a4', 'xbord', 'ybord', 'xshad', 'yshad', 'blur', 'be'];
  var transformTags = ['fscx', 'fscy', 'frx', 'fry', 'frz', 'fax', 'fay'];

  function createClipPath(clip) {
    var sw = this._.scriptRes.width;
    var sh = this._.scriptRes.height;
    var d = '';
    if (clip.dots !== null) {
      var ref = clip.dots;
      var x1 = ref.x1;
      var y1 = ref.y1;
      var x2 = ref.x2;
      var y2 = ref.y2;
      x1 /= sw;
      y1 /= sh;
      x2 /= sw;
      y2 /= sh;
      d = "M" + x1 + "," + y1 + "L" + x1 + "," + y2 + "," + x2 + "," + y2 + "," + x2 + "," + y1 + "Z";
    }
    if (clip.drawing !== null) {
      d = clip.drawing.instructions.map(function (ref) {
        var type = ref.type;
        var points = ref.points;

        return (
        type + points.map(function (ref) {
          var x = ref.x;
          var y = ref.y;

          return ((x / sw) + "," + (y / sh));
        }).join(',')
      );
      }).join('');
    }
    var scale = 1 / (1 << (clip.scale - 1));
    if (clip.inverse) {
      d += "M0,0L0," + scale + "," + scale + "," + scale + "," + scale + ",0,0,0Z";
    }
    var id = "ASS-" + (uuid());
    var $clipPath = createSVGEl('clipPath', [
      ['id', id],
      ['clipPathUnits', 'objectBoundingBox'] ]);
    $clipPath.appendChild(createSVGEl('path', [
      ['d', d],
      ['transform', ("scale(" + scale + ")")],
      ['clip-rule', 'evenodd'] ]));
    this._.$defs.appendChild($clipPath);
    return {
      $clipPath: $clipPath,
      cssText: ((vendor.clipPath) + "clip-path:url(#" + id + ");"),
    };
  }

  function setClipPath(dialogue) {
    if (!dialogue.clip) {
      return;
    }
    var $fobb = document.createElement('div');
    this._.$stage.insertBefore($fobb, dialogue.$div);
    $fobb.appendChild(dialogue.$div);
    $fobb.className = 'ASS-fix-objectBoundingBox';
    var ref = createClipPath.call(this, dialogue.clip);
    var cssText = ref.cssText;
    var $clipPath = ref.$clipPath;
    this._.$defs.appendChild($clipPath);
    $fobb.style.cssText = cssText;
    assign(dialogue, { $div: $fobb, $clipPath: $clipPath });
  }

  var $fixFontSize = document.createElement('div');
  $fixFontSize.className = 'ASS-fix-font-size';
  $fixFontSize.textContent = 'M';

  var cache = Object.create(null);

  function getRealFontSize(fn, fs) {
    var key = fn + "-" + fs;
    if (!cache[key]) {
      $fixFontSize.style.cssText = "font-size:" + fs + "px;font-family:\"" + fn + "\",Arial;";
      cache[key] = fs * fs / $fixFontSize.clientHeight;
    }
    return cache[key];
  }

  function createSVGStroke(tag, id, scale) {
    var hasBorder = tag.xbord || tag.ybord;
    var hasShadow = tag.xshad || tag.yshad;
    var isOpaque = tag.a1 !== 'FF';
    var blur = tag.blur || tag.be || 0;
    var $filter = createSVGEl('filter', [['id', id]]);
    $filter.appendChild(createSVGEl('feGaussianBlur', [
      ['stdDeviation', hasBorder ? 0 : blur],
      ['in', 'SourceGraphic'],
      ['result', 'sg_b'] ]));
    $filter.appendChild(createSVGEl('feFlood', [
      ['flood-color', color2rgba(tag.a1 + tag.c1)],
      ['result', 'c1'] ]));
    $filter.appendChild(createSVGEl('feComposite', [
      ['operator', 'in'],
      ['in', 'c1'],
      ['in2', 'sg_b'],
      ['result', 'main'] ]));
    if (hasBorder) {
      $filter.appendChild(createSVGEl('feMorphology', [
        ['radius', ((tag.xbord * scale) + " " + (tag.ybord * scale))],
        ['operator', 'dilate'],
        ['in', 'SourceGraphic'],
        ['result', 'dil'] ]));
      $filter.appendChild(createSVGEl('feGaussianBlur', [
        ['stdDeviation', blur],
        ['in', 'dil'],
        ['result', 'dil_b'] ]));
      $filter.appendChild(createSVGEl('feComposite', [
        ['operator', 'out'],
        ['in', 'dil_b'],
        ['in2', 'SourceGraphic'],
        ['result', 'dil_b_o'] ]));
      $filter.appendChild(createSVGEl('feFlood', [
        ['flood-color', color2rgba(tag.a3 + tag.c3)],
        ['result', 'c3'] ]));
      $filter.appendChild(createSVGEl('feComposite', [
        ['operator', 'in'],
        ['in', 'c3'],
        ['in2', 'dil_b_o'],
        ['result', 'border'] ]));
    }
    if (hasShadow && (hasBorder || isOpaque)) {
      $filter.appendChild(createSVGEl('feOffset', [
        ['dx', tag.xshad * scale],
        ['dy', tag.yshad * scale],
        ['in', hasBorder ? 'dil' : 'SourceGraphic'],
        ['result', 'off'] ]));
      $filter.appendChild(createSVGEl('feGaussianBlur', [
        ['stdDeviation', blur],
        ['in', 'off'],
        ['result', 'off_b'] ]));
      if (!isOpaque) {
        $filter.appendChild(createSVGEl('feOffset', [
          ['dx', tag.xshad * scale],
          ['dy', tag.yshad * scale],
          ['in', 'SourceGraphic'],
          ['result', 'sg_off'] ]));
        $filter.appendChild(createSVGEl('feComposite', [
          ['operator', 'out'],
          ['in', 'off_b'],
          ['in2', 'sg_off'],
          ['result', 'off_b_o'] ]));
      }
      $filter.appendChild(createSVGEl('feFlood', [
        ['flood-color', color2rgba(tag.a4 + tag.c4)],
        ['result', 'c4'] ]));
      $filter.appendChild(createSVGEl('feComposite', [
        ['operator', 'in'],
        ['in', 'c4'],
        ['in2', isOpaque ? 'off_b' : 'off_b_o'],
        ['result', 'shadow'] ]));
    }
    var $merge = createSVGEl('feMerge', []);
    if (hasShadow && (hasBorder || isOpaque)) {
      $merge.appendChild(createSVGEl('feMergeNode', [['in', 'shadow']]));
    }
    if (hasBorder) {
      $merge.appendChild(createSVGEl('feMergeNode', [['in', 'border']]));
    }
    $merge.appendChild(createSVGEl('feMergeNode', [['in', 'main']]));
    $filter.appendChild($merge);
    return $filter;
  }

  function createCSSStroke(tag, scale) {
    var arr = [];
    var oc = color2rgba(tag.a3 + tag.c3);
    var ox = tag.xbord * scale;
    var oy = tag.ybord * scale;
    var sc = color2rgba(tag.a4 + tag.c4);
    var sx = tag.xshad * scale;
    var sy = tag.yshad * scale;
    var blur = tag.blur || tag.be || 0;
    if (!(ox + oy + sx + sy)) { return 'none'; }
    if (ox || oy) {
      for (var i = -1; i <= 1; i++) {
        for (var j = -1; j <= 1; j++) {
          for (var x = 1; x < ox; x++) {
            for (var y = 1; y < oy; y++) {
              if (i || j) {
                arr.push((oc + " " + (i * x) + "px " + (j * y) + "px " + blur + "px"));
              }
            }
          }
          arr.push((oc + " " + (i * ox) + "px " + (j * oy) + "px " + blur + "px"));
        }
      }
    }
    if (sx || sy) {
      var pnx = sx > 0 ? 1 : -1;
      var pny = sy > 0 ? 1 : -1;
      sx = Math.abs(sx);
      sy = Math.abs(sy);
      for (var x$1 = Math.max(ox, sx - ox); x$1 < sx + ox; x$1++) {
        for (var y$1 = Math.max(oy, sy - oy); y$1 < sy + oy; y$1++) {
          arr.push((sc + " " + (x$1 * pnx) + "px " + (y$1 * pny) + "px " + blur + "px"));
        }
      }
      arr.push((sc + " " + ((sx + ox) * pnx) + "px " + ((sy + oy) * pny) + "px " + blur + "px"));
    }
    return arr.join();
  }

  function createTransform(tag) {
    return [
      // TODO: I don't know why perspective is 314, it just performances well.
      'perspective(314px)',
      ("rotateY(" + (tag.fry || 0) + "deg)"),
      ("rotateX(" + (tag.frx || 0) + "deg)"),
      ("rotateZ(" + (-tag.frz || 0) + "deg)"),
      ("scale(" + (tag.p ? 1 : (tag.fscx || 100) / 100) + "," + (tag.p ? 1 : (tag.fscy || 100) / 100) + ")"),
      ("skew(" + (tag.fax || 0) + "rad," + (tag.fay || 0) + "rad)") ].join(' ');
  }

  function setTransformOrigin(dialogue) {
    var alignment = dialogue.alignment;
    var width = dialogue.width;
    var height = dialogue.height;
    var x = dialogue.x;
    var y = dialogue.y;
    var $div = dialogue.$div;
    var org = dialogue.org;
    if (!org) {
      org = { x: 0, y: 0 };
      if (alignment % 3 === 1) { org.x = x; }
      if (alignment % 3 === 2) { org.x = x + width / 2; }
      if (alignment % 3 === 0) { org.x = x + width; }
      if (alignment <= 3) { org.y = y + height; }
      if (alignment >= 4 && alignment <= 6) { org.y = y + height / 2; }
      if (alignment >= 7) { org.y = y; }
    }
    for (var i = $div.childNodes.length - 1; i >= 0; i--) {
      var node = $div.childNodes[i];
      if (node.dataset.hasRotate === 'true') {
        // It's not extremely precise for offsets are round the value to an integer.
        var tox = org.x - x - node.offsetLeft;
        var toy = org.y - y - node.offsetTop;
        node.style.cssText += (vendor.transform) + "transform-origin:" + tox + "px " + toy + "px;";
      }
    }
  }

  function getKeyframeString(name, list) {
    return ("@" + (vendor.animation) + "keyframes " + name + " {" + list + "}\n");
  }

  var KeyframeBlockList = function KeyframeBlockList() {
    this.obj = {};
  };
  KeyframeBlockList.prototype.set = function set (keyText, prop, value) {
    if (!this.obj[keyText]) { this.obj[keyText] = {}; }
    this.obj[keyText][prop] = value;
  };
  KeyframeBlockList.prototype.setT = function setT (ref) {
      var t1 = ref.t1;
      var t2 = ref.t2;
      var duration = ref.duration;
      var prop = ref.prop;
      var from = ref.from;
      var to = ref.to;

    this.set('0.000%', prop, from);
    if (t1 < duration) {
      this.set((((t1 / duration * 100).toFixed(3)) + "%"), prop, from);
    }
    if (t2 < duration) {
      this.set((((t2 / duration * 100).toFixed(3)) + "%"), prop, to);
    }
    this.set('100.000%', prop, to);
  };
  KeyframeBlockList.prototype.toString = function toString () {
      var this$1 = this;

    return Object.keys(this.obj)
      .map(function (keyText) { return (
        (keyText + "{" + (Object.keys(this$1.obj[keyText])
            .map(function (prop) { return ("" + (vendor[prop] || '') + prop + ":" + (this$1.obj[keyText][prop]) + ";"); })
            .join('')) + "}")
      ); })
      .join('');
  };

  // TODO: multi \t can't be merged directly
  function mergeT(ts) {
    return ts.reduceRight(function (results, t) {
      var merged = false;
      return results
        .map(function (r) {
          merged = t.t1 === r.t1 && t.t2 === r.t2 && t.accel === r.accel;
          return assign({}, r, merged ? { tag: assign({}, r.tag, t.tag) } : {});
        })
        .concat(merged ? [] : t);
    }, []);
  }

  function getKeyframes() {
    var this$1 = this;

    var keyframes = '';
    this.dialogues.forEach(function (dialogue) {
      var start = dialogue.start;
      var end = dialogue.end;
      var effect = dialogue.effect;
      var move = dialogue.move;
      var fade = dialogue.fade;
      var slices = dialogue.slices;
      var duration = (end - start) * 1000;
      var diaKbl = new KeyframeBlockList();
      // TODO: when effect and move both exist, its behavior is weird, for now only move works.
      if (effect && !move) {
        var name = effect.name;
        var delay = effect.delay;
        var lefttoright = effect.lefttoright;
        var y1 = effect.y1;
        var y2 = effect.y2 || this$1._.resampledRes.height;
        if (name === 'banner') {
          var tx = this$1.scale * (duration / delay) * (lefttoright ? 1 : -1);
          diaKbl.set('0.000%', 'transform', 'translateX(0)');
          diaKbl.set('100.000%', 'transform', ("translateX(" + tx + "px)"));
        }
        if (/^scroll/.test(name)) {
          var updown = /up/.test(name) ? -1 : 1;
          var tFrom = "translateY(" + (this$1.scale * y1 * updown) + "px)";
          var tTo = "translateY(" + (this$1.scale * y2 * updown) + "px)";
          var dp = (y2 - y1) / (duration / delay) * 100;
          diaKbl.set('0.000%', 'transform', tFrom);
          if (dp < 100) {
            diaKbl.set(((dp.toFixed(3)) + "%"), 'transform', tTo);
          }
          diaKbl.set('100.000%', 'transform', tTo);
        }
      }
      if (move) {
        var x1 = move.x1;
        var y1$1 = move.y1;
        var x2 = move.x2;
        var y2$1 = move.y2;
        var t1 = move.t1;
        var t2 = move.t2 || duration;
        var pos = dialogue.pos || { x: 0, y: 0 };
        var values = [{ x: x1, y: y1$1 }, { x: x2, y: y2$1 }].map(function (ref) {
          var x = ref.x;
          var y = ref.y;

          return (
          ("translate(" + (this$1.scale * (x - pos.x)) + "px, " + (this$1.scale * (y - pos.y)) + "px)")
        );
        });
        diaKbl.setT({ t1: t1, t2: t2, duration: duration, prop: 'transform', from: values[0], to: values[1] });
      }
      if (fade) {
        if (fade.type === 'fad') {
          var t1$1 = fade.t1;
          var t2$1 = fade.t2;
          diaKbl.set('0.000%', 'opacity', 0);
          if (t1$1 < duration) {
            diaKbl.set((((t1$1 / duration * 100).toFixed(3)) + "%"), 'opacity', 1);
            if (t1$1 + t2$1 < duration) {
              diaKbl.set(((((duration - t2$1) / duration * 100).toFixed(3)) + "%"), 'opacity', 1);
            }
            diaKbl.set('100.000%', 'opacity', 0);
          } else {
            diaKbl.set('100.000%', 'opacity', duration / t1$1);
          }
        } else {
          var a1 = fade.a1;
          var a2 = fade.a2;
          var a3 = fade.a3;
          var t1$2 = fade.t1;
          var t2$2 = fade.t2;
          var t3 = fade.t3;
          var t4 = fade.t4;
          var keyTexts = [t1$2, t2$2, t3, t4].map(function (t) { return (((t / duration * 100).toFixed(3)) + "%"); });
          var values$1 = [a1, a2, a3].map(function (a) { return 1 - a / 255; });
          diaKbl.set('0.000%', 'opacity', values$1[0]);
          if (t1$2 < duration) { diaKbl.set(keyTexts[0], 'opacity', values$1[0]); }
          if (t2$2 < duration) { diaKbl.set(keyTexts[1], 'opacity', values$1[1]); }
          if (t3 < duration) { diaKbl.set(keyTexts[2], 'opacity', values$1[1]); }
          if (t4 < duration) { diaKbl.set(keyTexts[3], 'opacity', values$1[2]); }
          diaKbl.set('100.000%', 'opacity', values$1[2]);
        }
      }
      var diaList = diaKbl.toString();
      if (diaList) {
        assign(dialogue, { animationName: ("ASS-" + (uuid())) });
        keyframes += getKeyframeString(dialogue.animationName, diaList);
      }
      slices.forEach(function (slice) {
        slice.fragments.forEach(function (fragment) {
          if (!fragment.tag.t || !fragment.tag.t.length) {
            return;
          }
          var kbl = new KeyframeBlockList();
          var fromTag = assign({}, slice.tag, fragment.tag);
          // TODO: accel is not implemented yet
          mergeT(fragment.tag.t).forEach(function (ref) {
            var t1 = ref.t1;
            var t2 = ref.t2;
            var tag = ref.tag;

            if (tag.fs) {
              var from = (this$1.scale * getRealFontSize(fromTag.fn, fromTag.fs)) + "px";
              var to = (this$1.scale * getRealFontSize(tag.fn, fromTag.fs)) + "px";
              kbl.setT({ t1: t1, t2: t2, duration: duration, prop: 'font-size', from: from, to: to });
            }
            if (tag.fsp) {
              var from$1 = (this$1.scale * fromTag.fsp) + "px";
              var to$1 = (this$1.scale * tag.fsp) + "px";
              kbl.setT({ t1: t1, t2: t2, duration: duration, prop: 'letter-spacing', from: from$1, to: to$1 });
            }
            var hasAlpha = (
              tag.a1 !== undefined &&
              tag.a1 === tag.a2 &&
              tag.a2 === tag.a3 &&
              tag.a3 === tag.a4
            );
            if (tag.c1 || (tag.a1 && !hasAlpha)) {
              var from$2 = color2rgba(fromTag.a1 + fromTag.c1);
              var to$2 = color2rgba((tag.a1 || fromTag.a1) + (tag.c1 || fromTag.c1));
              kbl.setT({ t1: t1, t2: t2, duration: duration, prop: 'color', from: from$2, to: to$2 });
            }
            if (hasAlpha) {
              var from$3 = 1 - parseInt(fromTag.a1, 16) / 255;
              var to$3 = 1 - parseInt(tag.a1, 16) / 255;
              kbl.setT({ t1: t1, t2: t2, duration: duration, prop: 'opacity', from: from$3, to: to$3 });
            }
            var hasStroke = strokeTags.some(function (x) { return (
              tag[x] !== undefined &&
              tag[x] !== (fragment.tag[x] || slice.tag[x])
            ); });
            if (hasStroke) {
              var scale = /Yes/i.test(this$1.info.ScaledBorderAndShadow) ? this$1.scale : 1;
              var from$4 = createCSSStroke(fromTag, scale);
              var to$4 = createCSSStroke(assign({}, fromTag, tag), scale);
              kbl.setT({ t1: t1, t2: t2, duration: duration, prop: 'text-shadow', from: from$4, to: to$4 });
            }
            var hasTransfrom = transformTags.some(function (x) { return (
              tag[x] !== undefined &&
              tag[x] !== (fragment.tag[x] || slice.tag[x])
            ); });
            if (hasTransfrom) {
              var toTag = assign({}, fromTag, tag);
              if (fragment.drawing) {
                // scales will be handled inside svg
                assign(toTag, {
                  p: 0,
                  fscx: ((tag.fscx || fromTag.fscx) / fromTag.fscx) * 100,
                  fscy: ((tag.fscy || fromTag.fscy) / fromTag.fscy) * 100,
                });
                assign(fromTag, { fscx: 100, fscy: 100 });
              }
              var from$5 = createTransform(fromTag);
              var to$5 = createTransform(toTag);
              kbl.setT({ t1: t1, t2: t2, duration: duration, prop: 'transform', from: from$5, to: to$5 });
            }
          });
          var list = kbl.toString();
          assign(fragment, { animationName: ("ASS-" + (uuid())) });
          keyframes += getKeyframeString(fragment.animationName, list);
        });
      });
    });
    return keyframes;
  }

  function createAnimation(name, duration, delay) {
    var va = vendor.animation;
    return (
      va + "animation-name:" + name + ";" +
      va + "animation-duration:" + duration + "s;" +
      va + "animation-delay:" + delay + "s;" +
      va + "animation-timing-function:linear;" +
      va + "animation-iteration-count:1;" +
      va + "animation-fill-mode:forwards;"
    );
  }

  function createDrawing(fragment, styleTag) {
    var tag = assign({}, styleTag, fragment.tag);
    var ref = fragment.drawing;
    var minX = ref.minX;
    var minY = ref.minY;
    var width = ref.width;
    var height = ref.height;
    var baseScale = this.scale / (1 << (tag.p - 1));
    var scaleX = (tag.fscx ? tag.fscx / 100 : 1) * baseScale;
    var scaleY = (tag.fscy ? tag.fscy / 100 : 1) * baseScale;
    var blur = tag.blur || tag.be || 0;
    var vbx = tag.xbord + (tag.xshad < 0 ? -tag.xshad : 0) + blur;
    var vby = tag.ybord + (tag.yshad < 0 ? -tag.yshad : 0) + blur;
    var vbw = width * scaleX + 2 * tag.xbord + Math.abs(tag.xshad) + 2 * blur;
    var vbh = height * scaleY + 2 * tag.ybord + Math.abs(tag.yshad) + 2 * blur;
    var $svg = createSVGEl('svg', [
      ['width', vbw],
      ['height', vbh],
      ['viewBox', ((-vbx) + " " + (-vby) + " " + vbw + " " + vbh)] ]);
    var strokeScale = /Yes/i.test(this.info.ScaledBorderAndShadow) ? this.scale : 1;
    var filterId = "ASS-" + (uuid());
    var $defs = createSVGEl('defs');
    $defs.appendChild(createSVGStroke(tag, filterId, strokeScale));
    $svg.appendChild($defs);
    var symbolId = "ASS-" + (uuid());
    var $symbol = createSVGEl('symbol', [
      ['id', symbolId],
      ['viewBox', (minX + " " + minY + " " + width + " " + height)] ]);
    $symbol.appendChild(createSVGEl('path', [['d', fragment.drawing.d]]));
    $svg.appendChild($symbol);
    $svg.appendChild(createSVGEl('use', [
      ['width', width * scaleX],
      ['height', height * scaleY],
      ['xlink:href', ("#" + symbolId)],
      ['filter', ("url(#" + filterId + ")")] ]));
    $svg.style.cssText = (
      'position:absolute;' +
      "left:" + (minX * scaleX - vbx) + "px;" +
      "top:" + (minY * scaleY - vby) + "px;"
    );
    return {
      $svg: $svg,
      cssText: ("position:relative;width:" + (width * scaleX) + "px;height:" + (height * scaleY) + "px;"),
    };
  }

  function encodeText(text, q) {
    return text
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\s/g, '&nbsp;')
      .replace(/\\h/g, '&nbsp;')
      .replace(/\\N/g, '<br>')
      .replace(/\\n/g, q === 2 ? '<br>' : '&nbsp;');
  }

  function createDialogue(dialogue) {
    var this$1 = this;

    var $div = document.createElement('div');
    $div.className = 'ASS-dialogue';
    var df = document.createDocumentFragment();
    var slices = dialogue.slices;
    var start = dialogue.start;
    var end = dialogue.end;
    slices.forEach(function (slice) {
      var borderStyle = slice.borderStyle;
      slice.fragments.forEach(function (fragment) {
        var text = fragment.text;
        var drawing = fragment.drawing;
        var animationName = fragment.animationName;
        var tag = assign({}, slice.tag, fragment.tag);
        var cssText = 'display:inline-block;';
        var vct = this$1.video.currentTime;
        if (!drawing) {
          cssText += "font-family:\"" + (tag.fn) + "\",Arial;";
          cssText += "font-size:" + (this$1.scale * getRealFontSize(tag.fn, tag.fs)) + "px;";
          cssText += "color:" + (color2rgba(tag.a1 + tag.c1)) + ";";
          var scale = /Yes/i.test(this$1.info.ScaledBorderAndShadow) ? this$1.scale : 1;
          if (borderStyle === 1) {
            cssText += "text-shadow:" + (createCSSStroke(tag, scale)) + ";";
          }
          if (borderStyle === 3) {
            cssText += (
              "background-color:" + (color2rgba(tag.a3 + tag.c3)) + ";" +
              "box-shadow:" + (createCSSStroke(tag, scale)) + ";"
            );
          }
          cssText += tag.b ? ("font-weight:" + (tag.b === 1 ? 'bold' : tag.b) + ";") : '';
          cssText += tag.i ? 'font-style:italic;' : '';
          cssText += (tag.u || tag.s) ? ("text-decoration:" + (tag.u ? 'underline' : '') + " " + (tag.s ? 'line-through' : '') + ";") : '';
          cssText += tag.fsp ? ("letter-spacing:" + (tag.fsp) + "px;") : '';
          // TODO: (tag.q === 0) and (tag.q === 3) are not implemented yet,
          // for now just handle it as (tag.q === 1)
          if (tag.q === 1 || tag.q === 0 || tag.q === 3) {
            cssText += 'word-break:break-all;white-space:normal;';
          }
          if (tag.q === 2) {
            cssText += 'word-break:normal;white-space:nowrap;';
          }
        }
        var hasTransfrom = transformTags.some(function (x) { return (
          /^fsc[xy]$/.test(x) ? tag[x] !== 100 : !!tag[x]
        ); });
        if (hasTransfrom) {
          cssText += (vendor.transform) + "transform:" + (createTransform(tag)) + ";";
          if (!drawing) {
            cssText += 'transform-style:preserve-3d;word-break:normal;white-space:nowrap;';
          }
        }
        if (animationName) {
          cssText += createAnimation(animationName, end - start, Math.min(0, start - vct));
        }
        if (drawing && tag.pbo) {
          var pbo = this$1.scale * -tag.pbo * (tag.fscy || 100) / 100;
          cssText += "vertical-align:" + pbo + "px;";
        }

        var hasRotate = /"fr[xyz]":[^0]/.test(JSON.stringify(tag));
        encodeText(text, tag.q).split('<br>').forEach(function (html, idx) {
          var $span = document.createElement('span');
          $span.dataset.hasRotate = hasRotate;
          if (drawing) {
            var obj = createDrawing.call(this$1, fragment, slice.tag);
            $span.style.cssText = obj.cssText;
            $span.appendChild(obj.$svg);
          } else {
            if (idx) {
              df.appendChild(document.createElement('br'));
            }
            if (!html) {
              return;
            }
            $span.innerHTML = html;
          }
          // TODO: maybe it can be optimized
          $span.style.cssText += cssText;
          df.appendChild($span);
        });
      });
    });
    $div.appendChild(df);
    return $div;
  }

  function allocate(dialogue) {
    var layer = dialogue.layer;
    var margin = dialogue.margin;
    var width = dialogue.width;
    var height = dialogue.height;
    var alignment = dialogue.alignment;
    var end = dialogue.end;
    var stageWidth = this.width - (this.scale * (margin.left + margin.right) | 0);
    var stageHeight = this.height;
    var vertical = this.scale * margin.vertical | 0;
    var vct = this.video.currentTime * 100;
    this._.space[layer] = this._.space[layer] || {
      left: { width: new Uint16Array(stageHeight + 1), end: new Uint16Array(stageHeight + 1) },
      center: { width: new Uint16Array(stageHeight + 1), end: new Uint16Array(stageHeight + 1) },
      right: { width: new Uint16Array(stageHeight + 1), end: new Uint16Array(stageHeight + 1) },
    };
    var channel = this._.space[layer];
    var align = ['right', 'left', 'center'][alignment % 3];
    var willCollide = function (y) {
      var lw = channel.left.width[y];
      var cw = channel.center.width[y];
      var rw = channel.right.width[y];
      var le = channel.left.end[y];
      var ce = channel.center.end[y];
      var re = channel.right.end[y];
      return (
        (align === 'left' && (
          (le > vct && lw) ||
          (ce > vct && cw && 2 * width + cw > stageWidth) ||
          (re > vct && rw && width + rw > stageWidth)
        )) ||
        (align === 'center' && (
          (le > vct && lw && 2 * lw + width > stageWidth) ||
          (ce > vct && cw) ||
          (re > vct && rw && 2 * rw + width > stageWidth)
        )) ||
        (align === 'right' && (
          (le > vct && lw && lw + width > stageWidth) ||
          (ce > vct && cw && 2 * width + cw > stageWidth) ||
          (re > vct && rw)
        ))
      );
    };
    var count = 0;
    var result = 0;
    var find = function (y) {
      count = willCollide(y) ? 0 : count + 1;
      if (count >= height) {
        result = y;
        return true;
      }
      return false;
    };
    if (alignment <= 3) {
      for (var i = stageHeight - vertical - 1; i > vertical; i--) {
        if (find(i)) { break; }
      }
    } else if (alignment >= 7) {
      for (var i$1 = vertical + 1; i$1 < stageHeight - vertical; i$1++) {
        if (find(i$1)) { break; }
      }
    } else {
      for (var i$2 = (stageHeight - height) >> 1; i$2 < stageHeight - vertical; i$2++) {
        if (find(i$2)) { break; }
      }
    }
    if (alignment > 3) {
      result -= height - 1;
    }
    for (var i$3 = result; i$3 < result + height; i$3++) {
      channel[align].width[i$3] = width;
      channel[align].end[i$3] = end * 100;
    }
    return result;
  }

  function getPosition(dialogue) {
    var effect = dialogue.effect;
    var move = dialogue.move;
    var alignment = dialogue.alignment;
    var width = dialogue.width;
    var height = dialogue.height;
    var margin = dialogue.margin;
    var slices = dialogue.slices;
    var x = 0;
    var y = 0;
    if (effect) {
      if (effect.name === 'banner') {
        if (alignment <= 3) { y = this.height - height - margin.vertical; }
        if (alignment >= 4 && alignment <= 6) { y = (this.height - height) / 2; }
        if (alignment >= 7) { y = margin.vertical; }
        x = effect.lefttoright ? -width : this.width;
      }
    } else if (dialogue.pos || move) {
      var pos = dialogue.pos || { x: 0, y: 0 };
      if (alignment % 3 === 1) { x = this.scale * pos.x; }
      if (alignment % 3 === 2) { x = this.scale * pos.x - width / 2; }
      if (alignment % 3 === 0) { x = this.scale * pos.x - width; }
      if (alignment <= 3) { y = this.scale * pos.y - height; }
      if (alignment >= 4 && alignment <= 6) { y = this.scale * pos.y - height / 2; }
      if (alignment >= 7) { y = this.scale * pos.y; }
    } else {
      if (alignment % 3 === 1) { x = 0; }
      if (alignment % 3 === 2) { x = (this.width - width) / 2; }
      if (alignment % 3 === 0) { x = this.width - width - this.scale * margin.right; }
      var hasT = slices.some(function (slice) { return (
        slice.fragments.some(function (ref) {
          var animationName = ref.animationName;

          return animationName;
        })
      ); });
      if (hasT) {
        if (alignment <= 3) { y = this.height - height - margin.vertical; }
        if (alignment >= 4 && alignment <= 6) { y = (this.height - height) / 2; }
        if (alignment >= 7) { y = margin.vertical; }
      } else {
        y = allocate.call(this, dialogue);
      }
    }
    return { x: x, y: y };
  }

  function createStyle(dialogue) {
    var layer = dialogue.layer;
    var start = dialogue.start;
    var end = dialogue.end;
    var alignment = dialogue.alignment;
    var effect = dialogue.effect;
    var pos = dialogue.pos;
    var margin = dialogue.margin;
    var animationName = dialogue.animationName;
    var width = dialogue.width;
    var height = dialogue.height;
    var x = dialogue.x;
    var y = dialogue.y;
    var vct = this.video.currentTime;
    var cssText = '';
    if (layer) { cssText += "z-index:" + layer + ";"; }
    if (animationName) {
      cssText += createAnimation(animationName, end - start, Math.min(0, start - vct));
    }
    cssText += "text-align:" + (['right', 'left', 'center'][alignment % 3]) + ";";
    if (!effect) {
      var mw = this.width - this.scale * (margin.left + margin.right);
      cssText += "max-width:" + mw + "px;";
      if (!pos) {
        if (alignment % 3 === 1) {
          cssText += "margin-left:" + (this.scale * margin.left) + "px;";
        }
        if (alignment % 3 === 0) {
          cssText += "margin-right:" + (this.scale * margin.right) + "px;";
        }
        if (width > this.width - this.scale * (margin.left + margin.right)) {
          cssText += "margin-left:" + (this.scale * margin.left) + "px;";
          cssText += "margin-right:" + (this.scale * margin.right) + "px;";
        }
      }
    }
    cssText += "width:" + width + "px;height:" + height + "px;left:" + x + "px;top:" + y + "px;";
    return cssText;
  }

  function renderer(dialogue) {
    var $div = createDialogue.call(this, dialogue);
    assign(dialogue, { $div: $div });
    this._.$stage.appendChild($div);
    var ref = $div.getBoundingClientRect();
    var width = ref.width;
    var height = ref.height;
    assign(dialogue, { width: width, height: height });
    assign(dialogue, getPosition.call(this, dialogue));
    $div.style.cssText = createStyle.call(this, dialogue);
    setTransformOrigin(dialogue);
    setClipPath.call(this, dialogue);
    return dialogue;
  }

  function framing() {
    var this$1 = this;

    var vct = this.video.currentTime;
    for (var i = this._.stagings.length - 1; i >= 0; i--) {
      var dia = this$1._.stagings[i];
      var end = dia.end;
      if (dia.effect && /scroll/.test(dia.effect.name)) {
        var ref = dia.effect;
        var y1 = ref.y1;
        var y2 = ref.y2;
        var delay = ref.delay;
        var duration = ((y2 || this$1._.resampledRes.height) - y1) / (1000 / delay);
        end = Math.min(end, dia.start + duration);
      }
      if (end < vct) {
        this$1._.$stage.removeChild(dia.$div);
        if (dia.$clipPath) {
          this$1._.$defs.removeChild(dia.$clipPath);
        }
        this$1._.stagings.splice(i, 1);
      }
    }
    var dias = this.dialogues;
    while (
      this._.index < dias.length &&
      vct >= dias[this._.index].start
    ) {
      if (vct < dias[this$1._.index].end) {
        var dia$1 = renderer.call(this$1, dias[this$1._.index]);
        this$1._.stagings.push(dia$1);
      }
      ++this$1._.index;
    }
  }

  function play() {
    var this$1 = this;

    var frame = function () {
      framing.call(this$1);
      this$1._.requestId = raf(frame);
    };
    this._.requestId = raf(frame);
    this._.$stage.classList.remove('ASS-animation-paused');
    return this;
  }

  function pause() {
    caf(this._.requestId);
    this._.requestId = 0;
    this._.$stage.classList.add('ASS-animation-paused');
    return this;
  }

  function clear() {
    var this$1 = this;

    while (this._.$stage.lastChild) {
      this$1._.$stage.removeChild(this$1._.$stage.lastChild);
    }
    while (this._.$defs.lastChild) {
      this$1._.$defs.removeChild(this$1._.$defs.lastChild);
    }
    this._.stagings = [];
    this._.space = [];
  }

  function seek() {
    var vct = this.video.currentTime;
    var dias = this.dialogues;
    clear.call(this);
    this._.index = (function () {
      var from = 0;
      var to = dias.length - 1;
      while (from + 1 < to && vct > dias[(to + from) >> 1].end) {
        from = (to + from) >> 1;
      }
      if (!from) { return 0; }
      for (var i = from; i < to; i++) {
        if (
          dias[i].end > vct && vct >= dias[i].start ||
          i && dias[i - 1].end < vct && vct < dias[i].start
        ) {
          return i;
        }
      }
      return to;
    })();
    framing.call(this);
  }

  function bindEvents() {
    var l = this._.listener;
    l.play = play.bind(this);
    l.pause = pause.bind(this);
    l.seeking = seek.bind(this);
    this.video.addEventListener('play', l.play);
    this.video.addEventListener('pause', l.pause);
    this.video.addEventListener('seeking', l.seeking);
  }

  function unbindEvents() {
    var l = this._.listener;
    this.video.removeEventListener('play', l.play);
    this.video.removeEventListener('pause', l.pause);
    this.video.removeEventListener('seeking', l.seeking);
    l.play = null;
    l.pause = null;
    l.seeking = null;
  }

  function resize() {
    var cw = this.video.clientWidth;
    var ch = this.video.clientHeight;
    var vw = this.video.videoWidth || cw;
    var vh = this.video.videoHeight || ch;
    var sw = this._.scriptRes.width;
    var sh = this._.scriptRes.height;
    var rw = sw;
    var rh = sh;
    var videoScale = Math.min(cw / vw, ch / vh);
    if (this.resampling === 'video_width') {
      rh = sw / vw * vh;
    }
    if (this.resampling === 'video_height') {
      rw = sh / vh * vw;
    }
    this.scale = Math.min(cw / rw, ch / rh);
    if (this.resampling === 'script_width') {
      this.scale = videoScale * (vw / rw);
    }
    if (this.resampling === 'script_height') {
      this.scale = videoScale * (vh / rh);
    }
    this.width = this.scale * rw;
    this.height = this.scale * rh;
    this._.resampledRes = { width: rw, height: rh };

    this.container.style.cssText = "width:" + cw + "px;height:" + ch + "px;";
    var cssText = (
      "width:" + (this.width) + "px;" +
      "height:" + (this.height) + "px;" +
      "top:" + ((ch - this.height) / 2) + "px;" +
      "left:" + ((cw - this.width) / 2) + "px;"
    );
    this._.$stage.style.cssText = cssText;
    this._.$svg.style.cssText = cssText;
    this._.$svg.setAttributeNS(null, 'viewBox', ("0 0 " + sw + " " + sh));

    this._.$animation.innerHTML = getKeyframes.call(this);
    seek.call(this);

    return this;
  }

  var GLOBAL_CSS = '.ASS-container,.ASS-stage{position:relative;overflow:hidden}.ASS-container video{position:absolute;top:0;left:0}.ASS-stage{pointer-events:none;position:absolute}.ASS-dialogue{font-size:0;position:absolute}.ASS-fix-font-size{position:absolute;visibility:hidden}.ASS-fix-objectBoundingBox{width:100%;height:100%;position:absolute;top:0;left:0}.ASS-animation-paused *{-webkit-animation-play-state:paused!important;animation-play-state:paused!important}';

  function init(source, video, options) {
    if ( options === void 0 ) options = {};

    this.scale = 1;

    // private variables
    this._ = {
      index: 0,
      stagings: [],
      space: [],
      listener: {},
      $svg: createSVGEl('svg'),
      $defs: createSVGEl('defs'),
      $stage: document.createElement('div'),
      $animation: document.createElement('style'),
    };
    this._.$svg.appendChild(this._.$defs);
    this._.$stage.className = 'ASS-stage ASS-animation-paused';
    this._.$animation.type = 'text/css';
    this._.$animation.className = 'ASS-animation';
    document.head.appendChild(this._.$animation);

    this._.resampling = options.resampling || 'video_height';

    this.container = options.container || document.createElement('div');
    this.container.classList.add('ASS-container');
    this.container.appendChild($fixFontSize);
    this.container.appendChild(this._.$svg);
    this._.hasInitContainer = !!options.container;

    this.video = video;
    bindEvents.call(this);
    if (!this._.hasInitContainer) {
      var isPlaying = !video.paused;
      video.parentNode.insertBefore(this.container, video);
      this.container.appendChild(video);
      if (isPlaying && video.paused) {
        video.play();
      }
    }
    this.container.appendChild(this._.$stage);

    var ref = compile(source);
    var info = ref.info;
    var width = ref.width;
    var height = ref.height;
    var dialogues = ref.dialogues;
    this.info = info;
    this._.scriptRes = {
      width: width || video.videoWidth,
      height: height || video.videoHeight,
    };
    this.dialogues = dialogues;

    var $style = document.getElementById('ASS-global-style');
    if (!$style) {
      $style = document.createElement('style');
      $style.type = 'text/css';
      $style.id = 'ASS-global-style';
      $style.appendChild(document.createTextNode(GLOBAL_CSS));
      document.head.appendChild($style);
    }

    resize.call(this);

    if (!this.video.paused) {
      seek.call(this);
      play.call(this);
    }

    return this;
  }

  function show() {
    this._.$stage.style.visibility = 'visible';
    return this;
  }

  function hide() {
    this._.$stage.style.visibility = 'hidden';
    return this;
  }

  function destroy() {
    var this$1 = this;

    pause.call(this);
    clear.call(this);
    unbindEvents.call(this, this._.listener);
    if (!this._.hasInitContainer) {
      var isPlay = !this.video.paused;
      this.container.parentNode.insertBefore(this.video, this.container);
      this.container.parentNode.removeChild(this.container);
      if (isPlay && this.video.paused) {
        this.video.play();
      }
    }
    document.head.removeChild(this._.$animation);
    // eslint-disable-next-line no-restricted-syntax
    for (var key in this$1) {
      if (Object.prototype.hasOwnProperty.call(this$1, key)) {
        this$1[key] = null;
      }
    }

    return this;
  }

  var regex = /^(video|script)_(width|height)$/;

  function getter() {
    return regex.test(this._.resampling) ? this._.resampling : 'video_height';
  }

  function setter(r) {
    if (r === this._.resampling) { return r; }
    if (regex.test(r)) {
      this._.resampling = r;
      this.resize();
    }
    return this._.resampling;
  }

  var ASS = function ASS(source, video, options) {
    if (typeof source !== 'string' || !(video instanceof HTMLVideoElement)) {
      return this;
    }
    return init.call(this, source, video, options);
  };

  var prototypeAccessors = { resampling: { configurable: true } };
  ASS.prototype.resize = function resize$1 () {
    return resize.call(this);
  };
  ASS.prototype.show = function show$1 () {
    return show.call(this);
  };
  ASS.prototype.hide = function hide$1 () {
    return hide.call(this);
  };
  ASS.prototype.destroy = function destroy$1 () {
    return destroy.call(this);
  };
  prototypeAccessors.resampling.get = function () {
    return getter.call(this);
  };
  prototypeAccessors.resampling.set = function (r) {
    return setter.call(this, r);
  };

  Object.defineProperties( ASS.prototype, prototypeAccessors );

  return ASS;

})));
