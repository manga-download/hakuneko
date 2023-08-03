import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Siyahmelek extends WordPressMadara {

    constructor() {
        super();
        super.id = 'siyahmelek';
        super.label = 'Siyahmelek';
        this.tags = [ 'manga', 'webtoon', 'turkish' ];
        this.url = 'https://siyahmelek.net';
    }

    async _getPages(chapter) {
        return (await super._getPages(chapter)).filter(picture => {
            const pic= JSON.parse(atob(new URL(picture).searchParams.get('payload')));
            return !pic.url.endsWith('xxxxx/99.jpg');
        });
    }
}
