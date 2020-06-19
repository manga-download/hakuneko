import Connector from '../engine/Connector.mjs';

export default class VizShonenJump extends Connector {

    constructor() {
        super();
        super.id = 'vizshonenjump';
        super.label = 'Viz - Shonen Jump';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://www.viz.com/shonenjump';
        this.requestOptions.headers.set( 'x-referer', this.url );
        this.config = {
            /* Since the website requires us to fetch the image data a few seconds after the API call
            *  we need to ensure we can download the data fast enough.
            *  Also the website itself only loads a maximum of 4 pages at a time to ensure that.
            */
            concurrent: {
                label: 'Concurrent downloads',
                description: 'The maximum number of concurrent downloads.',
                input: 'numeric',
                min: 1,
                max: 12,
                value: 5
            }
        };
        this.concurrent = 0;
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
        let script = `
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        window.loadPages = function loadPages() {
                            var aj_images = [];
                            for (var page_count = 0; page_count <= pages; page_count++) 
                                if (!(page_count < 0 || page_count > pages) && "undefined" == typeof pageImages["page" + page_count]) {
                                    var aj_req = {
                                        url: pageUrl + "&manga_id=" + manga_id + "&page=" + page_count,
                                        dataType: "text"
                                    };
                                    aj_images.push(aj_req)
                                } 
                                resolve(Object.values(aj_images));
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
                id: page.url,
                referer: chapter.id
            }
        ));
    }

    async _handleConnectorURI(payload) {
        while (this.concurrent >= this.config.concurrent.value) {
            await this.throttle_connections( Math.floor(Math.random() * (2000 - 1000)) + 1000);
        }
        this.concurrent += 1;

        try {
            // API request
            let request = new Request(new URL(payload.id, new URL(this.url).origin ), this.requestOptions);
            request.headers.set('x-referer', new URL(payload.referer, new URL(this.url).origin));
            request.headers.set('Accept', 'text/plain, */*; q=0.01');
            let response = await fetch(request);
            const img_url = await response.text();

            // Image request
            request = new Request(new URL(img_url), this.requestOptions);
            request.headers.set('x-referer', new URL(payload.referer, new URL(this.url).origin));
            request.headers.set('crossOrigin', 'Anonymous');
            request.headers.set('Origin', new URL(this.url).origin);

            response = await fetch(request);
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
            this.concurrent -= 1;
            return this._blobToBuffer(data);
        } catch (error) {
            this.concurrent -= 1;
            throw new Error('Failed to retrieve image data. Please report at https://github.com/manga-download/hakuneko/issues');
        }
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