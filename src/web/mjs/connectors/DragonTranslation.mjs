import WordPressMadara from "./templates/WordPressMadara.mjs";

export default class DragonTranslation extends WordPressMadara {
    constructor() {
        super();
        super.id = "dragontranslation";
        super.label = "DragonTranslation";
        this.tags = ["webtoon", "hentai", "spanish"];
        this.url = "https://dragontranslation.org";
        this.queryMangas = "div.item-summary div.post-title h3 a";
        this.queryChapters = "li.wp-manga-chapter a";
        this.queryChaptersTitleBloat = "span";
    }

    _createMangaRequest(page) {
        return new Request(
            new URL(`/manga?page=${page}`, this.url),
            this.requestOptions,
        );
    }
    async _getPages(chapter) {
        const chapterUrl = new URL(chapter.id, this.url);
        const request = new Request(chapterUrl, this.requestOptions);

        let data = await this.fetchRegex(
            request,
            /(https:\/\/dragontranslation\.org\/wp-content\/uploads\/WP-manga\/data\/[^"]+\.(jpg|jpeg|png|webp))/g,
        );

        return data.map((element) => this.getAbsolutePath(element, request.url));
    }
}
