import Connector from "../engine/Connector.mjs";
import Manga from "../engine/Manga.mjs";

export default class Baozimh extends Connector {
    constructor() {
        super();
        super.id = "baozimh";
        super.label = "包子漫書 (baozimh)";
        this.tags = ["manga", "webtoon", "chinese"];
        this.url = "https://www.baozimh.com";
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, ".comics-detail__title"); //title object
        const id = uri.pathname;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let msg = 'This website provides a manga list that is to large to scrape, please copy and paste the URL containing the images directly from your browser into HakuNeko.';
        throw new Error(msg);
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        //where can it find the chapters
        const data = await this.fetchDOM(request, ".l-box #chapter-items > div > a, .l-box #chapters_other_list > div > a");
        let chapters = data.reverse(); //get first chapters on top
        return chapters.map((element) => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim(),
            };
        });
    }
    async _getPages(chapter) {
        let request = new Request(
            new URL(chapter.id, this.url),
            this.requestOptions
        );
        let data = await this.fetchDOM(request, ".comic-contain amp-img.comic-contain__item");
        return data.map(element => element.getAttribute('src'));
    }
}
