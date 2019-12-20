import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';
/*
 * import PrettyFast from '../videostreams/PrettyFast.mjs';
 * import HydraX from '../videostreams/HidraX.mjs';
 */

export default class AnimeYT extends Connector {
    constructor() {
        super();
        super.id = 'animeyt';
        super.label = 'AnimeYT';
        this.mangas = [];
        this.tags = ['anime', 'spanish'];
        this.url = 'https://animeyt2.tv';

        this.path = '/animes?pages=';
        this.pager = '.pager > nav > ul > li:nth-last-of-type(2) > a';
        this.listChapters = '.serie-capitulos > div > div > a'
        this.queryAnimes = '.animes-grid > article > div.anime--flip > div > div.anime--flip__front > a';
        this.servers = '.ver-anime__mirrors > li > .ver-anime__mirror'

        this.requestOptions.headers.set('x-requested-with', 'XMLHttpRequest');
        this.config = {
            resolution:  {
                label: 'Preferred Resolution',
                description: 'Try to download video in the selected resolution.\nIf the resolution is not supported, depending on the mirror the download may fail, or a fallback resolution may be used!',
                input: 'select',
                options: [
                    { value: '', name: 'Mirror\'s Default' },
                    { value: '480', name: '480p' },
                    { value: '720', name: '720p' },
                    { value: '1080', name: '1080p' }
                ],
                value: ''
            }
        };
    }


    async _getMangasFromPage(page) {
        let request = await new Request(this.url + this.path + page, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryAnimes);
        return data.map(element => {
            this.cfMailDecrypt(element);
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.href.split('/')[3].replace(/(-)/g,' ')
            }
        })
    }

    async _getMangas() {
        let mangaList = [];
        let request = await new Request(this.url + this.path + '1' , this.requestOptions);
        let data = await this.fetchDOM(request, this.pager);
        let pageCount = parseInt(data[0].href.match(/\d+$/));
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            await mangaList.push(...mangas);
        }

        return mangaList;
    }

    async _getChapters(manga) {
        let request = new Request(this.url + manga.id, this.requestOptions);
        let data = await this.fetchDOM(request, this.listChapters);
        return data.map(element => {
            console.log({
                element: [element],
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim(),
            })
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(this.url + chapter.id, this.requestOptions);
        let data = await this.fetchDOM(request, this.servers);
        console.log({
            data:[data]
        })
        return data.map(element => this.getAbsolutePath(element, request.url));
    }


/*

   async _getMangasFromPage(page) {
        let request = new Request(this.url + this.path + page, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryAnimes);
        return data.map(element => {
            this.cfMailDecrypt(element);
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.href.split('/')[3].replace(/(-)/g,' ')
            }
        }).filter(manga => manga.id.startsWith('/'));
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(this.url + this.path + '1' , this.requestOptions);
        let data = await this.fetchDOM(request, this.pager);
        let pageCount = parseInt(data[0].href.match(/\d+$/));
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getChapters(manga) {
        let request = new Request(this.url + manga.id, this.requestOptions);
        let data = await this.fetchDOM(request, this.listChapters);
        return data.map(element => {
            console.log({
                element: [element],
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim(),
                language: ''
            })
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim(),
                language: ''
            };
        });
    }
*/

}
