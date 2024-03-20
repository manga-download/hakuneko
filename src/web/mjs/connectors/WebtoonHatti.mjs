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
        const promises = [];
        for(const page of pages) {
            const promise = new Promise( (resolve, reject) => {
                const pageData= JSON.parse(atob(new URL(page).searchParams.get( 'payload' )));
                const request = new Request(pageData.url, {
                    method : 'HEAD',
                });
                request.headers.set('x-referer', pageData.referer);

                try {
                    fetch(request)
                        .then(response => response.status == 200 ? resolve(page) : reject());
                } catch(error) {
                    reject();
                }
            });
            promises.push(promise);
        }

        const results = await Promise.allSettled(promises);
        return results.filter(promise => /fulfilled/i.test(promise.status)).map(promise => promise.value);
    }
}
