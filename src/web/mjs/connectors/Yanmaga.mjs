import SpeedBinb from './templates/SpeedBinb.mjs';
import Manga from '../engine/Manga.mjs';

export default class Yanmaga extends SpeedBinb {
    constructor() {
        super();
        super.id = 'yanmaga';
        super.label = 'Yanmaga';
        this.tags = ['manga', 'japanese'];
        this.url = 'https://yanmaga.jp';
        this.links = {
            login: 'https://yanmaga.jp/customers/sign-in'
        };
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri);
        const [data] = await this.fetchDOM(request, '.detailv2-outline-title');
        const id = uri.pathname;
        const title = data.textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        const request = new Request(new URL('comics', this.url));
        const data = await this.fetchDOM(request, '.ga-comics-book-item');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('.mod-book-title').textContent.trim(),
            };
        });
    }

    async _getChapters(manga) {
        const chapterScript = `
            new Promise(resolve => {
                const interval = setInterval(() => {
                    let morebtn = document.querySelector('.mod-episode-more-button') ;
                    if (morebtn) morebtn.click()
                        else {
                            clearInterval(interval);
                            const chapters = [...document.querySelectorAll('a.mod-episode-link')];
                            resolve(chapters.map(chapter => {
                                return {
                                    id: chapter.pathname,
                                    title: chapter.querySelector('.mod-episode-title').textContent.trim()
                                }
                            }));
                    }
                 }, 1000);
            });
        `;

        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        return Engine.Request.fetchUI(request, chapterScript, 10000);
    }

    _getPageList( manga, chapter, callback ) {
        const uri = new URL(chapter.id, this.url);
        fetch(uri)
            .then(response => {
                if (response.redirected) {
                    const newurl = new URL(response.url);
                    return super._getPageList(manga, { id: newurl.pathname+newurl.search }, callback);
                }
                if (!uri.searchParams.get('cid')) {
                    throw new Error(`You need to login to see ${chapter.title}`);
                }
                return super._getPageList(manga, chapter, callback);
            })
            .catch(error => {
                console.error(error, chapter);
                callback(error, undefined);
            });
    }
}
