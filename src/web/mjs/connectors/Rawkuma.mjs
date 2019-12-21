import WordPressEManga from './templates/WordPressEManga.mjs';

export default class Rawkuma extends WordPressEManga {

    constructor() {
        super();
        super.id = 'rawkuma';
        super.label = 'Rawkuma';
        this.tags = [ 'manga', 'raw', 'japanese' ];
        this.url = 'https://rawkuma.com';

        this.path = '/manga/?list';
        this.queryChapters = 'div.bxcl ul li span.lchx a';
    }
}