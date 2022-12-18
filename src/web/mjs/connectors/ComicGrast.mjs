import Manga from '../engine/Manga.mjs';
import Connector from '../engine/Connector.mjs';

export default class ComicGrast extends Connector {

    constructor() {
        super();
        super.id = 'comicgrast';
        super.label = 'comic グラスト (Comic Grast)';
        this.tags = ['manga', 'japanese'];
        this.url = 'https://novema.jp';
    }

    async _getMangaFromURI(uri) {
        const id = uri.pathname;
        const request = new Request(uri, this.requestOptions);
        const [data] = await this.fetchDOM(request, 'dt.comicTit');
        const title = data.textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        const request = new Request(new URL('/comic/serial', this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'ul.comicList a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('dt p.line-clamp').textContent.trim()
            };
        });
    }

    async _getChapters(manga) {
        const request = new Request(new URL(manga.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'div.comicSerialList article a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('span.storyTitle').textContent.trim()
            };
        });
    }

    async _getPages(chapter) {
        const comicData = await this._fetchComicData(chapter);
        const comicContent = await this._fetchComicContent(comicData);
        return comicContent.map(content => this.createConnectorURI({
            data: comicData,
            content,
        }));
    }

    async _handleConnectorURI(payload) {
        const uri = new URL(`/img/serial-comic/${payload.data.serial_comic_id}/${payload.data.story_number}/content/${payload.content.name}?t=${payload.data.story_updated_at}`, this.url);
        const image = await this._loadImage(uri.href);
        const size = Math.max(image.width, image.height) / payload.content.size;
        const canvas = this._unscramble(image, size, payload.content.seed);
        const blob = await this._canvasToBlob(canvas);
        return this._blobToBuffer(blob);
    }

    async _fetchComicData(chapter) {
        const request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        const [data] = await this.fetchDOM(request, '#comic-data');
        return JSON.parse(data.textContent);
    }

    async _fetchComicContent(comicData) {
        const uri = new URL(`/img/serial-comic/${comicData.serial_comic_id}/${comicData.story_number}/content/index.json?t=${comicData.story_updated_at}`, this.url);
        const request = new Request(uri, this.requestOptions);
        return this.fetchJSON(request);
    }

    async _canvasToBlob(canvas) {
        return new Promise(resolve => {
            canvas.toBlob(data => {
                resolve(data);
            }, Engine.Settings.recompressionFormat.value, parseFloat(Engine.Settings.recompressionQuality.value) / 100);
        });
    }

    _loadImage(url) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = error => reject(error);
            image.src = url;
        });
    }
    _unscramble(image, sliceSize, seed) {
        return unscrambleImg(image, sliceSize, seed);
    }
}

// from https://github.com/webcaetano/image-scramble/blob/master/unscrambleImg.js
function unscrambleImg(img, sliceSize, seed) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    const totalParts = Math.ceil(img.width / sliceSize) * Math.ceil(img.height / sliceSize);
    const inds = [];
    for (let i = 0; i < totalParts; i++) {
        inds.push(i);
    }

    const slices = getSlices(img, sliceSize);
    for (const g in slices) {
        const group = getGroup(slices[g]);
        let shuffleInd = [];
        for (let i = 0; i < slices[g].length; i++) {
            shuffleInd.push(i);
        }
        shuffleInd = _shuffleSeed_(shuffleInd, seed);
        for (let i = 0; i < slices[g].length; i++) {
            const s = shuffleInd[i];
            const row = Math.floor(s / group.cols);
            const col = s - row * group.cols;
            const x = col * slices[g][i].width;
            const y = row * slices[g][i].height;
            ctx.drawImage(
                img,
                group.x + x,
                group.y + y,
                slices[g][i].width,
                slices[g][i].height,
                slices[g][i].x,
                slices[g][i].y,
                slices[g][i].width,
                slices[g][i].height
            );
        }
    }
    return canvas;
}

function getGroup(slices) {
    const self = {};
    self.slices = slices.length;
    self.cols = getColsInGroup(slices);
    self.rows = slices.length / self.cols;
    self.width = slices[0].width * self.cols;
    self.height = slices[0].height * self.rows;
    self.x = slices[0].x;
    self.y = slices[0].y;
    return self;
}

function getSlices(img, sliceSize) {
    const totalParts = Math.ceil(img.width / sliceSize) * Math.ceil(img.height / sliceSize);
    const verticalSlices = Math.ceil(img.width / sliceSize);
    const slices = {};
    for (let i = 0; i < totalParts; i++) {
        const slice = {};
        const row = Math.floor(i / verticalSlices);
        const col = i - row * verticalSlices;
        slice.x = col * sliceSize;
        slice.y = row * sliceSize;
        slice.width = sliceSize - (slice.x + sliceSize <= img.width ? 0 : slice.x + sliceSize - img.width);
        slice.height = sliceSize - (slice.y + sliceSize <= img.height ? 0 : slice.y + sliceSize - img.height);
        const key = `${slice.width}-${slice.height}`;
        if (slices[key] == null) {
            slices[key] = [];
        }
        slices[key].push(slice);
    }
    return slices;
}

function getColsInGroup(slices) {
    if (slices.length == 1) {
        return 1;
    }
    let t = 'init';
    for (let i = 0; i < slices.length; i++) {
        if (t == 'init') {
            t = slices[i].y;
        }
        if (t != slices[i].y) {
            return i;
        }
    }
    return slices.length;
}

// from https://github.com/webcaetano/shuffle-seed
function _shuffleSeed_(arr, seed) {
    const size = arr.length;
    const rng = _seedrandom_(seed);
    const resp = [];
    const keys = [];
    for (let i = 0; i < size; i++) keys.push(i);
    for (let i = 0; i < size; i++) {
        const r = Math.floor(rng() * keys.length);
        const g = keys[r];
        keys.splice(r, 1);
        resp.push(arr[g]);
    }
    return resp;
}

// from https://github.com/davidbau/seedrandom
var width = 256,
    chunks = 6,
    digits = 52,
    startdenom = Math.pow(width, chunks),
    significance = Math.pow(2, digits),
    overflow = significance * 2,
    mask = width - 1;

function _seedrandom_(seed) {
    var key = [];
    mixkey(seed, key);
    var arc4 = new ARC4(key);
    var prng = function () {
        var n = arc4.g(chunks),
            d = startdenom,
            x = 0;
        while (n < significance) {
            n = (n + x) * width;
            d *= width;
            x = arc4.g(1);
        }
        while (n >= overflow) {
            n /= 2;
            d /= 2;
            x >>>= 1;
        }
        return (n + x) / d;
    };
    return prng;
}

function ARC4(key) {
    var t, keylen = key.length,
        me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];

    if (!keylen) {
        key = [keylen++];
    }

    while (i < width) {
        s[i] = i++;
    }
    for (i = 0; i < width; i++) {
        s[i] = s[j = mask & j + key[i % keylen] + (t = s[i])];
        s[j] = t;
    }

    (me.g = function (count) {
        var t, r = 0,
            i = me.i, j = me.j, s = me.S;
        while (count--) {
            t = s[i = mask & i + 1];
            r = r * width + s[mask & (s[i] = s[j = mask & j + t]) + (s[j] = t)];
        }
        me.i = i; me.j = j;
        return r;
    })(width);
}

function mixkey(seed, key) {
    var stringseed = seed + '', smear, j = 0;
    while (j < stringseed.length) {
        key[mask & j] =
            mask & (smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++);
    }
    return String.fromCharCode.apply(0, key);
}