import Connector from "../engine/Connector.mjs";
import Manga from '../engine/Manga.mjs';

export default class RokariComics extends Connector {
    constructor() {
        super();
        super.id = "rokaricomics";
        super.label = "Rokari Comics";
        this.tags = ["webtoon", "english"];
        this.url = "https://rokaricomics.com";
    }

    async _getMangas() {
        let page=1;

        let request = new Request(
            this.url + `/manga?page=${page++}`,
            this.requestOptions
        );
        let data=[];
        let tmp=await this.fetchDOM(request, ".listupd .bsx a");

        while(tmp.length>0) {
            data=[...data, ...tmp];
            request = new Request(
                this.url + `/manga?page=${page++}`,
                this.requestOptions
            );
            tmp=await this.fetchDOM(request, ".listupd .bsx a");
        }
        return data.map((element) => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim(),
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(this.url + manga.id, this.requestOptions);
        let data = await this.fetchDOM(request, '#chapterlist li a[href]');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        const scriptPages = `
            new Promise(resolve => {
                resolve([...document.querySelectorAll('#readerarea img')].map(img => img.src));
            });
        `;

        const request = new Request(new URL(chapter.id, this.url), this.requestOptions);

        return await Engine.Request.fetchUI(request, scriptPages);
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        let title= (await this.fetchDOM(request, "h1.entry-title"))[0].textContent.trim();
        return new Manga(this, uri.pathname, title);
    }
}
