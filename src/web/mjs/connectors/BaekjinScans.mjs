import WordPressEManga from './templates/WordPressEManga.mjs';

export default class BaekjinScans extends WordPressEManga {

    constructor() {
        super();
        super.id = 'baekjinscans';
        super.label = 'Baekjin Scans';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://baekjinscans.xyz';
        this.path = '/manga/?list';

        this.queryChapters = 'div.bxcl ul li span.lchx a';
    }
}