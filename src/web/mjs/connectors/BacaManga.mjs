import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class BacaManga extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'bacamanga';
        super.label = 'BacaManga';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://bacamanga.co';
        this.path = '/manga/?list';

        this.queryChapters = 'div.bxcl ul li span.lchx a';
        this.queryChaptersTitle = undefined;
    }

    async _getPages(chapter) {
        const script = `
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        const loadedImages = [...document.querySelectorAll('${this.queryPages}')].map(img => img.src);
                        if(loadedImages.length === 0) {
                            throw new Error('No references found which could be used to extract images!');
                        }
                        const qualifiers = Object.values(window).filter(value => value instanceof Array && value.length && loadedImages.every(img => value.includes(img)));
                        resolve(qualifiers.pop());
                    } catch(error) {
                        reject(error);
                    }
                }, 500);
            });
        `;
        const uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await Engine.Request.fetchUI(request, script);
        return data.map(link => this.getAbsolutePath(link, request.url));
    }
}