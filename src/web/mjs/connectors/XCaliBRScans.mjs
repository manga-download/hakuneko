import WordPressMangastream from './templates/WordPressMangastream.mjs';
export default class XCaliBRScans extends WordPressMangastream {
    constructor() {
        super();
        super.id = 'xcalibrscans';
        super.label = 'xCaliBR Scans';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://xcalibrscans.com';
        this.path = '/manga/list-mode/';
        this.requestOptions.headers.set('x-referer', this.url);
        this.config = {
            throttle: {
                label: 'Throttle Requests [ms]',
                description: 'Enter the timespan in [ms] to delay consecuitive HTTP requests.\nThe website may block images for to many consecuitive requests.',
                input: 'numeric',
                min: 1000,
                max: 7500,
                value: 1500
            }
        };
    }
    // Nothing : https://xcalibrscans.com/the-first-ancestor-in-history-chapter-1/
    // div#readerarea p img
    // 0
    // flipped single :  https://xcalibrscans.com/the-first-ancestor-in-history-chapter-86/
    // div#readerarea div.kage img
    // 1
    // flipped and splitted : https://xcalibrscans.com/above-ten-thousand-people-chapter-175/
    // div#readerarea div.kage div.sword_box div.sword img
    // 2
    async _getPages(chapter) {
        const script = `
        new Promise((resolve, reject) => {
            let scramble_method = 0;
            if (document.querySelector('div#readerarea div.kage div.sword_box div.sword img')){
                scramble_method = 2;
            }
            else if (document.querySelector('div#readerarea div.kage img')){
                scramble_method = 1;
            };
            if(window.ts_reader && ts_reader.params.sources) {
                resolve({
                    imagz : ts_reader.params.sources.shift().images,
                    scrambled : scramble_method
                });
            }
            else {
                setTimeout(() => {
                    try {
                        const images = [...document.querySelectorAll('${this.queryPages}')];
                        const imgz = images.map(image => image.dataset['lazySrc'] || image.dataset['src'] || image.getAttribute('original') || image.src);
                        resolve({
                            imagz : imgz,
                            scrambled : scramble_method
                        });
                    }
                    catch(error) {
                        reject(error);
                    }
                },
                2500);
            }
        });
        `;
        const uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await Engine.Request.fetchUI(request, script);
        // HACK: bypass 'i0.wp.com' image CDN to ensure original images are loaded directly from host
        const piclist = data.imagz.map(link => this.getAbsolutePath(link, request.url).replace(/\/i\d+\.wp\.com/, '')).filter(link => !link.includes('histats.com'));
        switch (data.scrambled) {
            case 0: //do nothing
            case 1: //Flip each picture, no grouping
                return piclist.map(element => {
                    return this.createConnectorURI({
                        picture : element, scrambled : data.scrambled
                    });
                });
            case 2: {//Flip and group by 2
                let puzzles = [];
                let count = 0;
                for(let i = 0; i < piclist.length-1; i+=2) {
                    puzzles.push(this.createConnectorURI({
                        picture1 : piclist[i],
                        picture2 : piclist[i+1],
                        scrambled : data.scrambled })
                    );
                    count +=2;
                }
                //get remaining picture if number was odd
                if (count < piclist.length) {
                    puzzles.push(piclist[count]);
                }
                return puzzles;
            }
            default:
        }
    }
    async _handleConnectorURI(payload) {
        let pictures = [];
        switch(payload.scrambled) {
            case 0:{
                const request = new Request(payload.picture, this.requestOptions);
                request.headers.set('x-referer', this.url);
                const response = await fetch(request);
                const data = await response.blob();
                return this._blobToBuffer(data);
            }
            case 1: {
                pictures.push(payload.picture);
                break;
            }
            case 2: {
                pictures.push(payload.picture1);
                pictures.push(payload.picture2);
                break;
            }
        }
        const promises = pictures.map(async part => {
            const request = new Request(part, this.requestOptions);
            request.headers.set('x-referer', this.url);
            const response = await fetch(request);
            const data = await response.blob();
            return createImageBitmap(data);
        });
        const bitmaps = await Promise.all(promises);
        const data = await this.composePuzzle(bitmaps, payload.scrambled);
        return this._blobToBuffer(data);
    }
    async composePuzzle(bitmaps, scramblemode) {
        switch (scramblemode) {
            case 1: //reverse picture
                return new Promise(resolve => {
                    let canvas = document.createElement('canvas');
                    canvas.width = bitmaps[0].width;
                    canvas.height = bitmaps[0].height;
                    let ctx = canvas.getContext('2d');
                    ctx.scale(-1, 1);
                    ctx.drawImage(bitmaps[0], 0, 0, -bitmaps[0].width, bitmaps[0].height);
                    canvas.toBlob(data => {
                        resolve(data);
                    },
                    Engine.Settings.recompressionFormat.value, parseFloat(Engine.Settings.recompressionQuality.value)/100);
                });
            case 2:
                return new Promise(resolve => {
                    let canvas = document.createElement('canvas');
                    //combine 2 pictures flipped
                    const b1 = bitmaps[0];
                    const b2 = bitmaps[1];
                    canvas.width = b1.width+b2.width;
                    canvas.height = b1.height;
                    let ctx = canvas.getContext('2d');
                    ctx.scale(-1, 1);
                    ctx.drawImage(b2, 0, 0, -b2.width, b2.height);
                    ctx.drawImage(b1, -b2.width, 0, -b1.width, b1.height);
                    canvas.toBlob(data => {
                        resolve(data);
                    },
                    Engine.Settings.recompressionFormat.value, parseFloat(Engine.Settings.recompressionQuality.value)/100);
                });
        }
    }
}
