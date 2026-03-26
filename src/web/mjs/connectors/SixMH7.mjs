import SinMH from './templates/SinMH.mjs';

export default class SixMH7 extends SinMH {

    constructor() {
        super();
        super.id = '6mh7';
        super.label = '6漫画 (6mh7)';
        this.tags = [ 'manga', 'webtoon', 'chinese' ];
        this.url = 'http://www.sixmh7.com';

        this.path = '/sort/1-%PAGE%.html';
        this.queryManga = 'div.cy_main div.cy_info div.cy_title h1';
        this.queryMangasPageCount = 'div.NewPages ul li:last-of-type a';
        this.queryMangas = 'div.cy_list_mh ul li.title a';
        this.queryChaptersScript = `
            new Promise((resolve, reject) => {
                charpterMore(null);
                setInterval(() => {
                    try {
                        if(!document.querySelector('a#zhankai:not([style*="none"])')) {
                            const chapters = [...document.querySelectorAll('ul[id^="mh-chapter-list"] li a')].map(element => {
                                return {
                                    id: element.pathname,
                                    title: element.text.trim()
                                }
                            });
                            resolve(chapters);
                        }
                    } catch(error) {
                        reject(error);
                    }
                }, 500);
            });
        `;
        this.queryPagesScript = `
            new Promise(resolve => resolve(newImgs));
        `;
    }
}