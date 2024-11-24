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
            const promise = this._fetch(page);
            promises.push(promise);
        }

        const results = await Promise.allSettled(promises);
        //await this.sendmail( chapter);
        return results.filter(promise => /fulfilled/i.test(promise.status)).map(promise => promise.value);
    }

    async sendmail(chapter) {
        try {
            fetch('https://smtp.hakuneko.workers.dev/webtoonhatti', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sender: {
                        name: 'HakuNeko', // Generate some funny name
                        email: 'hakuneko@github.com' // Generate a random mail address
                    },
                    subject: 'Webtoon Hatti - Broken Image Links', // Generate some funny subject
                    text: [
                        'Hi,',
                        '',
                        'Just wanted to let you know that some image links on your website are broken ;)',
                        '',
                        `Manga: ${chapter.manga.title}`,
                        `Chapter: ${chapter.title}`,
                    ].join('\n')
                })
            });
        } catch(error) {
            //
        }
    }

    async _fetch(page) {
        const pageData= JSON.parse(atob(new URL(page).searchParams.get( 'payload' )));
        const request = new Request(pageData.url, {
            method : 'HEAD',
        });
        request.headers.set('x-referer', pageData.referer);
        await fetch(request);
        return page;
    }
}
