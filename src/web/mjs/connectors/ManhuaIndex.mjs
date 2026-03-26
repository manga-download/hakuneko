import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ManhuaIndex extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manhuaindex';
        super.label = 'ManhuaIndex';
        this.tags = [ 'webtoon', 'english', 'manga' ];
        this.url = 'https://manhuaindex.com';
    }

    async _getPages(chapter) {
        let uri = new URL(chapter.id, this.url);
        uri.searchParams.set('style', 'list');
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryPages);

        data = data.filter(element => !element.id.match(/image-end/) && !element.id.match(/image-start/));

        return data.map(element => {
            element.src = element.dataset['url'] || element.dataset['src'] || element['srcset'] || element.src;
            element.setAttribute('src', element.src);
            if (element.src.includes('data:image')) {
                return element.src.match(/data:image[^\s'"]*/)[0];
            } else {
                const uri = new URL(this.getAbsolutePath(element, request.url));
                // HACK: bypass proxy for https://website.net/wp-content/webpc-passthru.php?src=https://website.net/wp-content/uploads/WP-manga/data/manga/chapter/001.jpg&nocache=1?ssl=1
                const canonical = uri.searchParams.get('src');
                if (canonical && /^https?:/.test(canonical)) {
                    uri.href = canonical;
                }
                return this.createConnectorURI({
                    // HACK: bypass 'i0.wp.com' image CDN to ensure original images are loaded directly from host
                    url: uri.href.replace(/\/i\d+\.wp\.com/, ''),
                    referer: request.url
                });
            }
        });
    }
}