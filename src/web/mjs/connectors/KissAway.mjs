import FlatManga from './templates/FlatManga.mjs';

export default class KissAway extends FlatManga {

    constructor() {
        super();
        super.id = 'kissaway';
        super.label = 'KLManga';
        this.tags = [ 'manga', 'raw', 'japanese' ];
        this.url = 'https://klz9.com';
        this.requestOptions.headers.set('x-referer', this.url);
    }

    generateRandomStr(length) {
        const charmap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result ='';
        for (let o = 0; o < length; o++) result += charmap.charAt(Math.floor(Math.random() * charmap.length));
        return result;
    }

    async _getChapters(manga) {
        const randomStr = this.generateRandomStr(25);
        const script = `
            new Promise(async resolve => {
                const uri = new URL('${randomStr}.lstc', window.location.origin);
                uri.searchParams.set('slug', dataL);
                const response = await fetch(uri);
                data = await response.text();
                const dom = new DOMParser().parseFromString(data, "text/html");
                const nodes = [...dom.querySelectorAll('a.chapter[title]')];
                const chapters= nodes.map(chapter => {
                    return {
                        id : chapter.pathname,
                        title : chapter.title
                    };
                });
                resolve(chapters);
            });
        `;

        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        return await Engine.Request.fetchUI(request, script);
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const randomStr = this.generateRandomStr(30);
        const script = `
            new Promise(async resolve => {
            	const chapId = document.querySelector('input#chapter').value;
                const uri = new URL('${randomStr}.iog', window.location.origin);
                uri.searchParams.set('cid', chapId);
                const response = await fetch(uri);
                const data = await response.text();
                const dom = new DOMParser().parseFromString(data, "text/html");
                const nodes = [...dom.querySelectorAll('img.chapter-img')];
                resolve(nodes.map(picture => picture.src).filter(image => !image.match(/olimposcan/)));
            });
        `;
        const request = new Request(uri, this.requestOptions);
        const data = await Engine.Request.fetchUI(request, script);
        return data.map(link => this.createConnectorURI(link));
    }
}
