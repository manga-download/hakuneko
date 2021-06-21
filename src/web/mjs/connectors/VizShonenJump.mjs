import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class VizShonenJump extends Connector {

    constructor() {
        super();
        super.id = 'vizshonenjump';
        super.label = 'Viz - Shonen Jump';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://www.viz.com';
        this.requestOptions.headers.set( 'x-referer', this.url );
        this.config = {
            throttle: {
                label: 'Throttle Requests [ms]',
                description: 'Enter the timespan in [ms] to delay consecuitive HTTP requests.\nImage links may expire too fast and therefore downloads may fail.',
                input: 'numeric',
                min: 500,
                max: 30000,
                value: 500
            }
        };
    }

    async _getUserInfo() {
        let uri = new URL('/account/refresh_login_links', this.url);
        let request = new Request(uri, this.requestOptions);
        let response = await fetch(request);
        let data = await response.text();
        return {
            isLoggedIn: /user_id\s*=\s*[1-9]\d*/.test(data),
            isAdult: /adult\s*=\s*true/.test(data),
            isMember: /is_wsj_subscriber\s*=\s*true/.test(data)
        };
    }

    async _getMangasAvailibleByVolumes() {
        const request = new Request(new URL('/library', this.url), this.requestOptions);
        let data = await this.fetchDOM(request);

        data = [...data.querySelectorAll('table.purchase-table a')];

        return data.map(manga => {
            return {
                id: manga.pathname,
                title: manga.innerText.trim()
            };
        });
    }

    async _getMangasAvailibleByChapters() {
        const request = new Request(new URL('/shonenjump', this.url), this.requestOptions);
        let data = await this.fetchDOM(request);

        if ( !data.innerText.includes('Latest free chapters') ) {
            alert('This website is geolocked. It can only be accessed from the USA.\nYou may use MANGA Plus instead.', this.label, 'info');
            return;
        }

        data = [...data.querySelectorAll('div.o_sort_container div.o_sortable a.o_chapters-link')];

        return data.map(manga => {
            return {
                id: manga.pathname,
                title: manga.innerText.trim()
            };
        });
    }

    async _getMangas() {
        const mangaAvailibleByVolumes = await this._getMangasAvailibleByVolumes();
        const mangaAvailibleByChapters = await this._getMangasAvailibleByChapters();
        let both = mangaAvailibleByVolumes.concat(mangaAvailibleByChapters);

        both.sort((a, b) => a.title > b.title && a.id > b.id );

        return both;
    }

    async _getMangaChapters(manga) {
        let auth = await this._getUserInfo();
        const request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request);

        if ( data.innerText.includes('MANGA Plus by SHUEISHA') ) {
            alert('This website is geolocked. It can only be accessed from the USA.\nYou may use MANGA Plus instead.', this.label, 'info');
            return;
        }

        return [...data.querySelectorAll('div > a.o_chapter-container[data-target-url], tr.o_chapter td.ch-num-list-spacing a.o_chapter-container[data-target-url]')]
            .filter(element => {
                // login required (e.g. age verification) => javascript:void('login to read');
                if(/(?=javascript:)(?=.*login)/i.test(element.href)) {
                    return auth.isLoggedIn && auth.isAdult;
                }
                // subscription required => javascript:void('join to read');
                if(/(?=javascript:)(?=.*join)/i.test(element.href)) {
                    return auth.isMember;
                }
                // free
                return true;
            })
            .map(chapter => {
                if(chapter.dataset.targetUrl.includes('javascript:')) {
                    chapter.dataset.targetUrl = chapter.dataset.targetUrl.match(/['"](\/shonenjump[^']+)['"]/)[1];
                }
                let id = this.getRootRelativeOrAbsoluteLink(chapter.dataset.targetUrl, this.url);
                let format = chapter.querySelector('.disp-id');
                if( format ) {
                    return {
                        id: id,
                        title: format.innerText.trim()
                    };
                }

                format = chapter.dataset.targetUrl.match(/chapter-([-_0-9]+)\//);
                if(format && format.length > 1) {
                    return {
                        id: id,
                        title: 'Ch. ' + format[1].replace(/[-_]/g, '.')
                    };
                }

                throw new Error(`Unknown chapter format for ${id}. Please report at https://github.com/manga-download/hakuneko/issues`);
            });
    }

    async _getMangaVolumes(manga) {
        let auth = await this._getUserInfo();
        const request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request);

        return [...data.querySelectorAll('#o_products tr td:last-of-type a')]
            .filter(element => {
                // login required (e.g. age verification) => javascript:void('login to read');
                if(/(?=javascript:)(?=.*login)/i.test(element.href)) {
                    return auth.isLoggedIn && auth.isAdult;
                }
                // subscription required => javascript:void('join to read');
                if(/(?=javascript:)(?=.*join)/i.test(element.href)) {
                    return auth.isMember;
                }
                // free
                return true;
            })
            .map(chapter => {
                return {
                    id: chapter.href.replace("hakuneko://cache/", ""),
                    title: 'Vol. ' + chapter.href.match(/-volume-([-_0-9]+)/)[1]
                };
            });
    }

    async _getChapters(manga) {
        if (manga.id.startsWith("/shonenjump/chapters")) {
            return await this._getMangaChapters(manga);
        } else if (manga.id.startsWith("/library")) {
            return await this._getMangaVolumes(manga);
        }
    }

    async requestRegex(responseData, regex) {
        let regex2 = new RegExp(regex.source, regex.flags + "g");
        let result = [];
        let match = undefined;
        // eslint-disable-next-line no-cond-assign
        while(match = regex2.exec(responseData)) {
            result.push(match[1]);
        }

        return result;
    }

    async _getPages(chapter) {
        const request = new Request(new URL(chapter.id, this.url));
        let response = await fetch(request);
        let responseData = await response.text();

        let pageCount = 0;
        let mangaID = 0;

        if (chapter.id.startsWith("read/manga")) {
            const pageCountData = await this.requestRegex(responseData, /<div class="mar-b-md"><strong>Length<\/strong> (\d+) pages<\/div>/);
            pageCount = parseInt(pageCountData[0]);
            const mangaIdData = await this.requestRegex(responseData, /var\s+mangaCommonId\s*=\s*(\d+)/);
            mangaID = parseInt(mangaIdData[0]);
        } else if (chapter.id.startsWith("/shonenjump")) {
            const data = await this.requestRegex(responseData, /var\s+pages\s*=\s*(\d+)/);
            pageCount = parseInt(data[0]);
            mangaID = chapter.id.match(/chapter\/(\d+)/)[1];
        }

        return Array(pageCount+1).fill().map((_, index) => {
            let page = new URL('/manga/get_manga_url', this.url);
            page.searchParams.set('device_id', 3);
            page.searchParams.set('manga_id', mangaID);
            page.searchParams.set('page', index);
            return this.createConnectorURI({ id: page.href, referer: chapter.id });
        });
    }

    async _handleConnectorURI(payload) {
        try {
            // API request
            let request = new Request( new URL(payload.id, this.url), this.requestOptions);
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
            return this._blobToBuffer(data);
        } catch (error) {
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

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        let data;

        if (uri.href.match(/\/chapters\//)) {
            data = await this.fetchDOM(request, 'section#series-intro h2');
        } else {
            data = await this.fetchDOM(request, 'div#product_row h3.section_title a');
            uri.href = data[0].href;
        }

        const title = data[0].innerText.trim();
        return new Manga(this, uri, title);
    }
}