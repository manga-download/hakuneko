import Connector from '../engine/Connector.mjs';

export default class WeebCentral extends Connector {

    constructor() {
        super();
        super.id = 'weebcentral';
        super.label = 'Weeb Central';
        this.tags = [ 'manga', 'manhua', 'manhwa', 'english' ];
        this.url = 'https://weebcentral.com';
    }

    async _getMangas() {
        const limit = 32;
        let offset = 0;
        let mangaList = [];
        let run = true;

        while (run) {
            const uri = new URL(`${this.url}/search/data?display_mode=Minimal+Display&limit=${limit}&offset=${offset}`);

            const request = new Request(uri, this.requestOptions);
            const data = await this.fetchDOM(request, 'article.bg-base-300');

            if (data.length < 1) {
                run = false;
                break; // Exit the loop if no more mangas are found
            }

            const mangas = data.map(element => {
                const linkElement = element.querySelector('a.link-hover');
                const title = linkElement.querySelector('h2').textContent.trim();
                const link = linkElement.href;
                return {
                    id: this.getRootRelativeOrAbsoluteLink(link, this.url),
                    title: title
                };
            });

            // Add mangas into mangaList array
            mangaList = mangaList.concat(mangas);

            // Next page
            offset += limit;
        }

        return mangaList;
    }

    async _getChapters(manga) {
        const mangaChapterListUrl = manga.id.replace(/\/[^/]+$/, '/full-chapter-list');
        const uri = new URL(mangaChapterListUrl, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'a[href*="/chapters/"]');

        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('span.grow span').textContent.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(`${chapter.id}/images?is_prev=False&current_page=1&reading_style=long_strip`, this.url);
        const request = new Request(uri, this.requestOptions);

        let script = `
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        resolve([...document.querySelectorAll('section img')].map(img => img.src));
                    } catch(error) {
                        reject(error);
                    }
                }, 2500);
            });
        `;

        const data = await Engine.Request.fetchUI(request, script);
        return data.map(element => this.createConnectorURI(this.getAbsolutePath(element, request.url)));
    }
}