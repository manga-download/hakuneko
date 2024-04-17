import MojoPortalComic from './templates/MojoPortalComic.mjs';

export default class MangaSect extends MojoPortalComic {

    constructor() {
        super();
        super.id = 'mangasect';
        super.label = 'MangaSect';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://mangasect.net';
        this.path = '/all-manga/';
    }

    async _getPages(chapter) {
        const request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        const script = `
            new Promise(resolve => {

                function parseResults(data) {
                    const dom = new DOMParser().parseFromString(data, 'text/html');
                    let nodes = [...dom.querySelectorAll('img')];
                    resolve(nodes.map(element => element.dataset.original));
                }

                const ajaxendpoint = new URL('/ajax/image/list/chap/' + CHAPTER_ID, window.location.href);
                fetch(ajaxendpoint, {
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest',
                        }
                    })
                    .then(response => response.json())
                    .then(jsonData => {
                        parseResults(jsonData.html);
                    });
            });
        `;
        return Engine.Request.fetchUI(request, script);
    }

}
