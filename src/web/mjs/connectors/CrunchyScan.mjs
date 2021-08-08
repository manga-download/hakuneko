import WordPressMadara from './templates/WordPressMadara.mjs';

export default class CrunchyScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'crunchyscan';
        super.label = 'Crunchyscan';
        this.tags = [ 'manga', 'webtoon', 'french' ];
        this.url = 'https://crunchyscan.fr';

        Engine.Blacklist.addPattern('*://crunchyscan.fr/cdn-cgi/*');
    }

    async _getPages(chapter) {
        const script = `
            new Promise((resolve, reject) => {
                resolve([...document.querySelectorAll('div.reading-content img')].map(img => new URL(img.dataset.src, window.location.origin).href));
            });
        `;
        const uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        return await Engine.Request.fetchUI(request, script, 120000, true);
    }
}