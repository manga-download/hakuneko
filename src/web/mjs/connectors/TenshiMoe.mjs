import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class TenshiMoe extends Connector {

    constructor() {
        super();
        super.id = 'tenshimoe';
        super.label = 'Tenshi.moe';
        this.tags = [ 'anime', 'english'];
        this.url = 'https://tenshi.moe';
        this.config = {
            format: {
                label: 'Language Settings',
                description: 'Choose between Subbed or Dubbed anime. If your choice is not available the other is used as fallback',
                input: 'select',
                options: [
                    { value: 'SUB', name: 'Subbed' },
                    { value: 'DUB', name: 'Dubbed' }
                ],
                value: 'SUB'
            },
            resolution: {
                label: 'Preferred Resolution',
                description: 'Try to download video in the selected resolution.\nIf the resolution is not supported, depending on the mirror the download may fail, or a fallback resolution may be used!',
                input: 'select',
                options: [
                    { value: '', name: 'Mirror\'s Default' },
                    { value: '360', name: '360p' },
                    { value: '480', name: '480p' },
                    { value: '720', name: '720p' },
                    { value: '1080', name: '1080p' }
                ],
                value: ''
            }
        };

    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'article.anime-entry header.entry-header h1');
        const id = uri.pathname;
        const title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        const uri = new URL('/anime', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'ul.pagination li:nth-last-of-type(2) a');
        const pageCount = parseInt(data[0].text);
        for(let page = 1; page <= pageCount; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL('/anime?page=' + page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'ul.loop.anime-loop li a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.title.trim()
            };
        });
    }

    async _getChapters(manga) {
        let chapterlist = [];
        const request = new Request(new URL(manga.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'ul.pagination li:nth-last-of-type(2) a');
        const pageCount = data.length > 0 ? parseInt(data[0].text): 1;
        for(let page = 1; page <= pageCount; page++) {
            const chapters = await this._getchaptersFromPage(manga, page);
            chapterlist.push(...chapters);
        }
        return chapterlist.reverse();
    }

    async _getchaptersFromPage(manga, page) {
        const uri = new URL(manga.id +'?page='+ page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'ul.loop.episode-loop li a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('div.episode-number').textContent.trim()
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'ul.dropdown-menu a');
        let sourceUrl = '';

        sourceUrl = data.length == 1 ? data : this.findPreferedLanguage(data);

        let uri = new URL(sourceUrl);
        const videoid = uri.searchParams.get('v');
        uri = new URL('/embed', this.url);
        uri.searchParams.set('v', videoid);
        request = new Request(uri, this.requestOptions);
        data = await this.fetchDOM(request, 'video source');
        let video = data.find(element => element.getAttribute('size') == this.config.resolution.value);
        video = !video ? data[0] : video;
        return {video : video.src, subtitles :[]}; //subtitles are forced

    }

    findPreferedLanguage(data) {
        //look for a span node with 'subtitle' without N/A
        let hasSubtitle = false;

        for (const aNode of data) {
            hasSubtitle = false;
            const spanNodes = aNode.querySelectorAll('span');
            for(const node of spanNodes) {
                if(node.title.includes('Subtitle') && !node.title.includes('N/A')) {
                    hasSubtitle = true;
                }
            }
            if (this.config.format.value == 'SUB' && hasSubtitle) {
                return aNode.href;
            }
            if (this.config.format.value == 'DUB' && !hasSubtitle) {
                return aNode.href;
            }

        }
        return data[0].href;
    }
}
