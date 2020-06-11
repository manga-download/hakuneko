import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

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
            }
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
                }
            } catch(error) {
                try {
                    return {
                        id: chapter.href,
                        title: 'Ch. ' + chapter.href.match(/chapter\-(\d+)\//)[1]
                    }
                } catch(error) {
                    throw new Error('Unknown chapter format. Please report at https://github.com/manga-download/hakuneko/issues');
                }
            }
        });
    }

    async _getPages(chapter) {
        chapter.id = chapter.id.replace('hakuneko://cache/shonenjump', this.url)
        console.log(chapter);
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
        
        console.log(data);
        return data;
    }

    // async _handleConnectorURI(payload) {

    // }

    async _canvasToBlob(canvas) {
        return new Promise(resolve => {
            canvas.toBlob(data => {
                resolve(data);
            }, Engine.Settings.recompressionFormat.value, parseFloat(Engine.Settings.recompressionQuality.value)/100);
        });
    }

    async _getMangaFromURI(uri) {

    }
}