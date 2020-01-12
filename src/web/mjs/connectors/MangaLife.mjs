import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

// Very similar visual to MangaSee (older viewer)
export default class MangaLife extends Connector {

    constructor() {
        super();
        super.id = 'mangalife';
        super.label = 'MangaLife';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://manga4life.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'ul.list-group li h1');
        let id = uri.pathname.split('/').pop();
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let request = new Request(new URL('/directory/', this.url), this.requestOptions);
        let data = await this.fetchRegex(request, /vm\.FullDirectory\s*=\s*(.+\})\s*/g);
        return JSON.parse(data[0]).Directory.map(manga => {
            // resolve html entities
            let element = document.createElement('div');
            element.innerHTML = manga.s;
            return {
                id: manga.i,
                title: element.textContent
            };
        });
    }

    async _getChapters(manga) {
        let script = `
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        let vm = angular.element($('[ng-app="MainApp"]')).scope().vm;
                        let chapters = vm.Chapters.map(chapter => {
                            return {
                                id: '/read-online/' + vm.IndexName + vm.ChapterURLEncode(chapter.Chapter).replace(/-page-\\d+/, ''),
                                title: (chapter.Type || 'Chapter') + ' ' + vm.ChapterDisplay(chapter.Chapter),
                                language: ''
                            }
                        });
                        resolve(chapters);
                    } catch(error) {
                        reject(error);
                    }
                }, 2500);
            });
        `;
        let request = new Request(new URL('/manga/' + manga.id, this.url), this.requestOptions);
        return Engine.Request.fetchUI(request, script);
        /*
         *let request = new Request(new URL('/rss/' + manga.id + '.xml', this.url), this.requestOptions);
         *let data = await this.fetchDOM(request, 'channel item');
         *return data.map(element => {
         *    return {
         *        id: this.getRootRelativeOrAbsoluteLink(element.querySelector('link').textContent.trim(), this.url),
         *        title: element.querySelector('title').textContent.replace(manga.title, '').trim(),
         *        language: ''
         *    };
         *});
         */
    }

    async _getPages(chapter) {
        let script = `
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        let vm = angular.element($('[ng-app="MainApp"]')).scope().vm;
                        let pages = vm.Pages.map(page => {
                            // TODO: skip slash when vm.CurChapter.Directory is empty
                            return 'https://' + vm.CurPathName + '/manga' + '/' + vm.IndexName + '/' + vm.CurChapter.Directory + '/' + vm.ChapterImage(vm.CurChapter.Chapter) + '-' + vm.PageImage(page) + '.png';
                        });
                        resolve(pages);
                    } catch(error) {
                        reject(error);
                    }
                }, 2500);
            });
        `;
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await Engine.Request.fetchUI(request, script);
        return data.map(element => this.createConnectorURI(this.getAbsolutePath(element, request.url)));
    }

    async _handleConnectorURI( payload ) {
        let request = new Request( payload, this.requestOptions );
        /*
         * TODO: only perform requests when from download manager
         * or when from browser for preview and selected chapter matches
         */
        let response = await fetch(request);
        let data = await response.blob();
        data = await this._blobToBuffer(data);
        super._applyRealMime(data);
        return data;
    }
}