import WordPressMadara from './templates/WordPressMadara.mjs';

export default class WebtoonHatti extends WordPressMadara {

    constructor() {
        super();
        super.id = 'webtoonhatti';
        super.label = 'Webtoon Hatti';
        this.tags = [ 'webtoon', 'turkish' ];
        this.url = 'https://webtoonhatti.net';
    }

    async _getPages(chapter) {
        const pages = await super._getPages(chapter);
        const pageList = [];

        for (const page of pages) {
            let pageUrl = new URL(page).searchParams.get('payload');
            pageUrl= JSON.parse(atob(pageUrl)).url;
            const request = new Request(pageUrl, {
                method : 'HEAD',
            });

            try {
                const response = await fetch(request);
                if (response.status == 200) pageList.push(page);
            } catch (error) {
                //
            }

            await this.wait(150);
        }
        return pageList;
    }
}
