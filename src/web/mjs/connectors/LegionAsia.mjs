import WordPressMangastream from './templates/WordPressMangastream.mjs';
export default class LegionAsia extends WordPressMangastream {
    constructor() {
        super();
        super.id = 'legionasia';
        super.label = 'LegionAsia';
        this.tags = [ 'webtoon', 'spanish' ];
        this.url = 'https://legionasia.com';
        this.path = '/manga/list-mode/';
        this.requestOptions.headers.set('x-referer', this.url);
    }
    // HACK : Overload this method to prevent the
    //WP cache bypass inside the template WordPressMangastream
    async _getPages(chapter) {
        const script = `
        new Promise((resolve, reject) => {
            if(window.ts_reader && ts_reader.params.sources) {
                resolve(ts_reader.params.sources.shift().images);
            }
            else {
                setTimeout(() => {
                    try {
                        const images = [...document.querySelectorAll('${this.queryPages}')];
                        resolve(images.map(image => image.dataset['lazySrc'] || image.dataset['src'] || image.getAttribute('original') || image.src));
                    }
                    catch(error) {
                        reject(error);
                    }
                },
                2500);
            }
        });
        `;
        const uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await Engine.Request.fetchUI(request, script);
        // HACK : Since the WP bypass is also present in Chapter class, as a workaround,
        // we change the image links by adding /i0/wp.com inside.
        return data.map(link => {
            let lnk = this.getAbsolutePath(link, request.url);
            //HACK Extract the wp part of the server
            let realwp = link.match(/\/i\d+\.wp\.com/);
            if (realwp != null) {
                //replace /ix.wp.com with /ix.wp.com/i0.wp.com
                lnk = lnk.replace(realwp[0], realwp[0]+'/i0.wp.com');
            }
            return lnk;
        });
    }
}
