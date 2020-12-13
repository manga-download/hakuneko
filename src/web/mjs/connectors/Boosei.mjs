import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Boosei extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'boosei';
        super.label = 'Boosei';
        this.tags = [ 'webtoon', 'indonesian' ];
        this.url = 'https://boosei.com';
        this.path = '/manga/list-mode/';
    }

    async _getPages(chapter) {
        const script = `
            new Promise((resolve, reject) => {
                if(window.ts_reader) {
                    // resolve(ts_reader.params.source.pop().images);
                    resolve(ts_reader_control.getImages());
                } else {
                    setTimeout(() => {
                        try {
                            const images = [...document.querySelectorAll('${this.queryPages}')];
                            resolve(images.map(image => image.dataset['lazySrc'] || image.dataset['src'] || image.src));
                        } catch(error) {
                            reject(error);
                        }
                    }, 500);
                }
            });
        `;
        const uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await Engine.Request.fetchUI(request, script);
        return data.map(link => this.getAbsolutePath(link, request.url)).filter(link => !link.includes('histats.com'));
    }
}