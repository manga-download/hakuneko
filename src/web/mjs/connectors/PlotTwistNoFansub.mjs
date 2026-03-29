import WordPressClarityMangaReader from './templates/WordPressClarityMangaReader.mjs';
export default class PlotTwistNoFansub extends WordPressClarityMangaReader {
    constructor() {
        super();
        super.id = 'plottwistnofansub';
        super.label = 'Plot Twist No Fansub';
        this.tags = [ 'manga', 'high-quality', 'spanish', 'scanlation' ];
        this.url = 'https://www.plot-twistnf-scans.com';
        this.links = {
            login: 'https://www.plot-twistnf-scans.com/wp-login.php'
        };
        this.paths = [ '/proyectos-finalizados-new/', '/proyectos-activosss/' ];
        this.queryMangas = 'div.vc_gitem-zone a.vc_gitem-link';
    }

    async _getChapters( manga ) {
        const uri = new URL( manga.id, this.url );
        const request = new Request(uri.href, this.requestOptions );
        const data = await this.fetchDOM(request, 'script#custompaginop-js-extra');
        const mangaid = data[0].text.match(/manid":"([0-9]+)/)[1];
        let chapterList = [];
        for(let page = 1, run = true; run; page++) {
            let chapters = await this._getChaptersFromPage(mangaid, page);
            chapters.length > 0 ? chapterList.push(...chapters) : run = false;
        }
        return chapterList;
    }

    async _getChaptersFromPage(mangaid, page) {
        const uri = new URL('/wp-admin/admin-ajax.php', this.url);
        let params = 'pageNumber='+ page+'&manga_id='+mangaid+'&action=lcap';
        const request = new Request(uri, {
            method: 'POST',
            body: params,
            headers: {
                'x-origin': this.url,
                'x-referer': this.url,
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest',
            }
        });
        let response = await fetch(request.clone());
        const data = await response.json();
        let chapters = data.map( element=>{
            //HACK resolve htmlentities
            let mydiv = document.createElement('div');
            //Adding capitulo to reflect the chapter naming convention used on the website /plot/manga/ page
            mydiv.innerHTML = 'Cap&iacute;tulo ' + element.chapter_number+': '+element.chapter_name;
            return {
                id: '/reader/'+element.post_name+'/chapter-'+element.chapter_number,
                title: mydiv.textContent.trim(),
                language : '',
            };
        });
        return chapters;
    }
}
