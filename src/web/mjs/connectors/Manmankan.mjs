import SinMH from './templates/SinMH.mjs';

export default class Manmankan extends SinMH {

    constructor() {
        super();
        super.id = 'manmankan';
        super.label = '漫漫看漫画网 (ManManKan)';
        this.tags = [ 'manga', 'webtoon', 'chinese' ];
        this.url = 'https://manmankan.cc';

        this.path = '/sort/%PAGE%.html';
        this.queryManga = 'div.cy_main div.cy_info div.cy_title h1';
        this.queryMangasPageCount = 'a.mylast';
        this.queryMangas = 'div.cy_list_mh ul li.title a';
        this.queryChaptersScript = `
            new Promise(resolve =>{
                resolve([...document.querySelectorAll('#mh-chapter-list-ol-0 > li > a')].map(ele => {
                    return{
                        id:ele.href,
                        title:ele.text.trim()
                    };
                }));
            });
        `;
        this.queryPagesScript = `
            new Promise(resolve => resolve(picArry));
        `;
    }
}