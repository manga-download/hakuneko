import WordPressMangastream from "./templates/WordPressMangastream.mjs";

export default class RokariComics extends WordPressMangastream {
    constructor() {
        super();
        super.id = "rokaricomics";
        super.label = "Rokari Comics";
        this.tags = ["webtoon", "english"];
        this.path="/manga/list-mode/";
        this.url = "https://rokaricomics.com";
        this.links = {
            login: 'https://rokaricomics.com/login/'
        };
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryChapters);
        return data
        // filtering out premium chapters
            .filter(element => element.href)
            .map(element => {
                this.adLinkDecrypt(element);
                const title = this.queryChaptersTitle ? element.querySelector(this.queryChaptersTitle).textContent : element.text;
                return {
                    id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                    title: title.replace(manga.title, '').trim() || manga.title
                };
            });
    }

}
