import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Piccoma extends Connector {

    constructor() {
        super();
        super.id = 'piccoma';
        super.label = 'Piccoma';
        this.tags = ['manga', 'webtoon', 'japanese'];
        this.url = 'https://piccoma.com';
        this.viewer = '/web/viewer/';
    }

    canHandleURI(uri) {
        return new RegExp('^https://(jp\\.)?piccoma.com/web/product/\\d+').test(uri);
    }

    async _getMangaFromURI(uri) {
        const id = uri.pathname.split('/')[3];
        uri.pathname = uri.pathname.split('/').slice(0, 4).join('/');
        const [ element ] = await this.fetchDOM(new Request(uri, this.requestOptions), 'h1.PCM-productTitle');
        return new Manga(this, id, element.textContent.trim());
    }

    async _getMangas() {
        const genres = [ 1, 2, 3, 4, 5, 6, 7, 9, 10 ];
        const mangaList = [];
        try {
            for(const genre of genres) {
                const result = await this.getMangasFromPage(genre, 1);
                mangaList.push(...result.mangas);
                for (let page = 2; page <= result.pages; page++) {
                    const {mangas} = await this.getMangasFromPage(genre, page);
                    mangaList.push(...mangas);
                }

            }
        } catch(error) {
            //
        }
        return [...new Set(mangaList.map(manga => manga.id))].map(id => mangaList.find(manga => manga.id === id));
    }

    async getMangasFromPage(genre, page) {
        const uri = new URL('/web/next_page/list', this.url);
        uri.searchParams.set('list_type', 'G');
        uri.searchParams.set('result_id', `${genre}`);
        uri.searchParams.set('page_id', `${page}`);
        const { data } = await this.fetchJSON(new Request(uri, this.requestOptions));
        return {
            pages: data.total_page,
            mangas: data.products.map(entry => {
                return {
                    id: entry.id,
                    title : entry.title
                };
            })
        };
    }

    async _getChapters(manga) {
        return [
            ... await this.fetchEpisodes(manga),
            ... await this.fetchVolumes(manga),
        ].sort((self, other) => self.title.localeCompare(other.title));
    }

    async fetchEpisodes(manga) {
        const request = new Request(`${this.url}/web/product/${manga.id}/episodes?etype=E`, this.requestOptions);
        const data = await this.fetchDOM(request, 'ul.PCM-epList li a[data-episode_id]');
        return data.map(element => {
            return {
                id: element.dataset.episode_id,
                title : element.querySelector('div.PCM-epList_title h2').textContent.trim()
            };
        });
    }

    async fetchVolumes(manga) {
        const request = new Request(`${this.url}/web/product/${manga.id}/episodes?etype=V`);
        const data = await this.fetchDOM(request, 'ul.PCM-volList li');
        return data.map(element => {
            const volume = [ ...element.querySelectorAll('div.PCM-prdVol_btns > a:not([class*="buyBtn"])') ].pop();
            const title = [
                element.querySelector('div.PCM-prdVol_title h2').innerText.trim(),
                volume.classList.contains('PCM-prdVol_freeBtn') ? ` (${ volume.innerText.trim() })` : '',
                volume.classList.contains('PCM-prdVol_trialBtn') ? ` (${ volume.innerText.trim() })` : '',
            ].join('');
            return {
                id : volume.dataset.episode_id,
                title : title
            };
        });
    }

    async _getPages(chapter) {

        const script = `
   	        new Promise((resolve, reject) => {

    	          function _getSeed(url) {
                    const uri = new URL(url.startsWith('http') ? url : 'https:'+url);
                    let checksum = uri.searchParams.get('q') || url.split('/').slice(-2)[0]; //PiccomaFR use q=, JP is the other
                    const expires = uri.searchParams.get('expires');
                    const total = expires.split('').reduce((total, num2) => total + parseInt(num2), 0);
                    const ch = total % checksum.length;
                    checksum = checksum.slice(ch * -1) + checksum.slice(0, ch * -1);
                    return globalThis.dd(checksum);
                }
                
                try {
                    const pdata = window.__NEXT_DATA__ ?  __NEXT_DATA__.props.pageProps.initialState.viewer.pData : window._pdata_; //PiccomaFR VS JP
                    const images = (pdata.img ?? pdata.contents)
                        .filter(img => !!img.path)
                        .map(img => {
                            	return {
                            	    url : img.path.startsWith('http') ? img.path : 'https:' + img.path,
                            	    key : pdata.isScrambled ? _getSeed(img.path) : null,
                            	}
                        });
                     resolve(images);
                }
                catch (error) {
                }
                reject();
      	    });
      	`;

        const request = new Request(`${this.url}${this.viewer}${chapter.manga.id}/${chapter.id}`, this.requestOptions);
        const images = await Engine.Request.fetchUI(request, script, 10000);
        if (!images) {
            throw new Error(`The chapter '${chapter.title}' is neither public, nor purchased!`);
        }
        return images.map(image => this.createConnectorURI({...image}));

    }

    async _handleConnectorURI(payload) {
        if (payload.key) {
            const image = await this._loadImage(payload.url);
            const canvas = this._unscramble(image, 50, payload.key);
            const blob = await this._canvasToBlob(canvas);
            return this._blobToBuffer(blob);
        } else {
            const uri = new URL(payload.url, this.url);
            const request = new Request(uri, this.requestOptions);
            const response = await fetch(request);
            let data = await response.blob();
            return this._blobToBuffer(data);
        }
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
