import Connector from '../engine/Connector.mjs';
const EXIF = require('exif-js');

export default class VizShonenJump extends Connector {

    constructor() {
        super();
        super.id = 'vizshonenjump';
        super.label = 'Viz - Shonen Jump';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://www.viz.com/shonenjump';
        this.requestOptions.headers.set( 'x-referer', this.url );
    }

    async _getMangas() {
        const request = new Request(new URL(this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'div.o_sort_container div > a');

        return data.map(manga => {
            return {
                id: manga.pathname,
                title: manga.querySelector(':nth-child(2)').innerText.trim()
            };
        });
    }

    async _getChapters(manga) {
        const request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'a.o_chapter-container');
        data = data.filter(chapter => chapter.innerText.includes('FREE'));

        return data.map(chapter => {
            try {
                return {
                    id: chapter.href,
                    title: chapter.querySelector('.disp-id').innerText.trim()
                };
            } catch(error) {
                try {
                    return {
                        id: chapter.href,
                        title: 'Ch. ' + chapter.href.match(/chapter-(\d+)\//)[1]
                    };
                } catch(error) {
                    throw new Error('Unknown chapter format. Please report at https://github.com/manga-download/hakuneko/issues');
                }
            }
        });
    }

    async _getPages(chapter) {
        chapter.id = chapter.id.replace('hakuneko://cache/shonenjump', this.url);
        let script = `
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        window.loadPages = function loadPages() {
                            var aj_images = [];
                            for (var page_count = 0; page_count <= pages; page_count++) 
                                if (!(page_count < 0 || page_count > pages) && "undefined" == typeof pageImages["page" + page_count]) {
                                    var aj_req = $.ajax({
                                        url: pageUrl + "&manga_id=" + manga_id + "&page=" + page_count,
                                        dataType: "text"
                                    });
                                    aj_images.push(aj_req)
                                } $.when.apply($, aj_images).done(function() {
                                for (page_count = 0; page_count < aj_images.length; page_count++) {
                                    var page_array = /\\/([0-9]+)\\.jpg/.exec(aj_images[page_count].responseText);
                                    page_array && (pageList["page" + page_array[1]] = aj_images[page_count].responseText)
                                }
                                setTimeout(() => {
                                    resolve(Object.values(pageList));
                                }, 2000);
                            })
                        }

                        window.loadPages();

                    } catch(error) {
                        reject(error);
                    }
                }, 2000);
            });
        `;
        let request = new Request(new URL(chapter.id, this.url));
        let data = await Engine.Request.fetchUI(request, script, 60000, false);

        return data.map(page => this.createConnectorURI(
            {
                id: page,
                referer: chapter.id
            }
        ));
    }

    async _handleConnectorURI(payload) {
        let request = new Request(new URL(payload.id), this.requestOptions);
        request.headers.set('x-referer', this.getRootRelativeOrAbsoluteLink(payload.referer, this.url));
        request.headers.set('crossOrigin', 'Anonymous');
        request.headers.set('Origin', new URL(this.url).origin);

        const response = await fetch(request);
        const blob = await response.blob();
        const bitmap = await createImageBitmap(blob);
        const exif = EXIF.readFromBinaryFile(await blob.arrayBuffer());

        let canvas = document.createElement('canvas');
        canvas.width = exif.ImageWidth;
        canvas.height = exif.ImageHeight;
        let ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, exif.ImageWidth, exif.ImageHeight);

        const x_split = Math.floor(exif.ImageWidth / 10);
        const y_split = Math.floor(exif.ImageHeight / 15);
        const shuffle_map = exif.ImageUniqueID.split(":");

        // Draw border pieces
        ctx.drawImage(
            bitmap,
            0, 0,
            exif.ImageWidth, y_split,
            0, 0,
            exif.ImageWidth, y_split
        );
        ctx.drawImage(
            bitmap,
            0, y_split + 10,
            x_split, exif.ImageHeight - 2 * y_split,
            0, y_split, x_split,
            exif.ImageHeight - 2 * y_split
        );
        ctx.drawImage(
            bitmap, 0, 14 * (y_split + 10),
            exif.ImageWidth, bitmap.height - 14 * (y_split + 10),
            0, 14 * y_split,
            exif.ImageWidth, bitmap.height - 14 * (y_split + 10)
        );
        ctx.drawImage(
            bitmap,
            9 * (x_split + 10), y_split + 10,
            x_split + (exif.ImageWidth - 10 * x_split), exif.ImageHeight - 2 * y_split,
            9 * x_split, y_split,
            x_split + (exif.ImageWidth - 10 * x_split), exif.ImageHeight - 2 * y_split
        );

        // Draw inside pieces
        for (let piece = 0; piece < shuffle_map.length; piece++) {
            shuffle_map[piece] = parseInt(shuffle_map[piece], 16);
            ctx.drawImage(
                bitmap,
                Math.floor((piece % 8 + 1) * (x_split + 10)), Math.floor((Math.floor(piece / 8) + 1) * (y_split + 10)), // sx, sy
                Math.floor(x_split), Math.floor(y_split), // sWidth, sHeight
                Math.floor((shuffle_map[piece] % 8 + 1) * x_split), Math.floor((Math.floor(shuffle_map[piece] / 8) + 1) * y_split), // dx, dy
                Math.floor(x_split), Math.floor(y_split)); // dWidth, dHeight
        }

        let data = await this._canvasToBlob(canvas);
        return this._blobToBuffer(data);
    }

    async _canvasToBlob(canvas) {
        return new Promise(resolve => {
            canvas.toBlob(data => {
                resolve(data);
            }, Engine.Settings.recompressionFormat.value, parseFloat(Engine.Settings.recompressionQuality.value)/100);
        });
    }

    throttle_connections(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
}