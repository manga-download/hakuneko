import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class VizShonenJump extends Connector {

    constructor() {
        super();
        super.id = 'vizshonenjump';
        super.label = 'Viz - Shonen Jump';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://www.viz.com/shonenjump';
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

    }

    async _handleConnectorURI(payload) {

    }

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