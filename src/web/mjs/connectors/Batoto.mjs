import AnyACG from './templates/AnyACG.mjs';

export default class Batoto extends AnyACG {

    constructor() {
        super();
        super.id = 'batoto';
        super.label = 'Batoto (by AnyACG)';
        this.tags = [ 'manga', 'multi-lingual' ];

        this.path = '/browse?sort=title&page=';
        this.queryMangaTitle = 'h3.item-title';
        this.queryMangaTitleText = 'a';
        this.queryMangaTitleFlag = 'span.item-flag';
        this.queryMangaPages = 'nav.d-none ul.pagination li.page-item:nth-last-child(2) a.page-link';
        this.queryMangas = 'div#series-list div.item-text';
        this.queryMangaLink = 'a.item-title';
        this.queryMangaFlag = 'span.item-flag';
        this.queryChapters = 'div.episode-list div.main a.visited';

        this.config = {
            url: {
                label: 'URL',
                description: `This website's main domain doesn't always work, but has alternate domains.\nThis is the default URL which can also be manually set by the user.`,
                input: 'text',
                value: 'https://bato.to'
            }
        };
    }

    get url() {
        return this.config.url.value;
    }

    set url(value) {
        if(this.config && value) {
            this.config.url.value = value;
            Engine.Settings.save();
        }
    }

    async _getPages(chapter) {
        let script = `
        new Promise(resolve => {
            const params = JSON.parse(CryptoJS.AES.decrypt(batoWord, batoPass).toString(CryptoJS.enc.Utf8));
            resolve(imgHttpLis.map((data, i) => \`\${data}?\${params[i]}\`));
        });
        `;
        let request = new Request(this.url + chapter.id, this.requestOptions);
        return Engine.Request.fetchUI(request, script);
    }
}