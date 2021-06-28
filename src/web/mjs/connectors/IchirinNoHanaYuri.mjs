import WordPressMadara from './templates/WordPressMadara.mjs';

export default class IchirinNoHanaYuri extends WordPressMadara {

    constructor() {
        super();
        super.id = 'ichirinnohanayuri';
        super.label = 'Ichirin No Hana Yuri';
        this.tags = [ 'hentai', 'high-quality', 'portuguese', 'scanlation' ];
        this.url = 'https://ichirinnohanayuri.com.br';
        this.queryMangas = 'div.post-title.font-title h4 a';
        this.queryChapters = 'li.wp-manga-chapter a';
    }
}