import WordPressEManga from "./templates/WordPressEManga.mjs";

/**
 * Is this really a WordPressEManga theme?
 * Same as OtakuIndo
 */
export default class Komiku extends WordPressEManga {
    /**
     *
     */
    constructor() {
        super();
        super.id = "komiku";
        super.label = "Komiku";
        this.tags = ["manga", "indonesian"];
        this.url = "https://komiku.co";
        this.path = "/daftar-komik/?list";

        this.queryMangas = "div#a-z ol li.ranking1 h4 a";
        this.queryChapters = "section#chapter table.chapter tbody._3Rsjq tr td.judulseries a.iklan";
        this.queryPages = "div#readerareaimg.konten source[src]:not([src=''])";
    }
}