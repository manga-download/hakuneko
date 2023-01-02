import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';
export default class YugenMangas extends Connector {
    constructor() {
        super();
        super.id = 'yugenmangas';
        super.label = 'YugenMangas';
        this.tags = [ 'webtoon', 'novel', 'spanish' ];
        this.url = 'https://yugenmangas.com';
        this.apiURL = 'https://api.yugenmangas.com';
        this.queryChapters = 'ul.chapters-list-single a';
        this.novelContentQuery = 'div#reading-content';
        this.novelFormat = 'image/png';
        this.novelWidth = '56em';// parseInt(1200 / window.devicePixelRatio) + 'px';
        this.novelPadding = '1.5em';
    }
    async _getMangas() {
        let mangaList = [];
        for(let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }
    async _getMangasFromPage(page) {
        const uri = new URL('/series/querysearch', this.apiURL);
        const body = {
            'order_by' : 'latest',
            'tags_ids': [],
            'order':'desc',
            'page':page
        };
        let request = new Request(uri, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'content-type': 'application/json',
                'x-referer': this.url
            }
        });
        const data = await this.fetchJSON(request);
        return data.data.map(element => {
            return {
                id: '/series/'+element.series_slug,
                title: element.title.trim()
            };
        });
    }
    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'ul.chapters-list-single.grid a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('span.name').textContent.trim()
            };
        });
    }
    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const darkmode = Engine.Settings.NovelColorProfile();
        const script = `
        new Promise(async resolve => {
            //fetch chapter content
            const response = await fetch('${this.apiURL}'+'/series/chapter/'+ __NEXT_DATA__.props.pageProps.data.id);
            const obj = await response.json();
            //if its pictures, list pictures
            if (obj.content.images) {
                resolve( {
                    pictures : obj.content.images
                });
                return;
            }
            else {
                //else render the novel
                document.body.style.width = '${this.novelWidth}';
                let novel = document.querySelector('${this.novelContentQuery}');
                novel.innerHTML = obj.content;
                novel.style.padding = '${this.novelPadding}';
                [...novel.querySelectorAll(":not(:empty)")].forEach(ele => {
                    ele.style.backgroundColor = '${darkmode.background}'
                    ele.style.color = '${darkmode.text}'
                })
                novel.style.backgroundColor = '${darkmode.background}'
                novel.style.color = '${darkmode.text}'
                let script = document.createElement('script');
                script.onerror = error => reject(error);
                script.onload = async function() {
                    try{
                        let canvas = await html2canvas(novel);
                        resolve({
                            rendered : canvas.toDataURL('${this.novelFormat}')
                        });
                    }
                    catch (error){
                        reject(error)
                    }
                }
                script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
                document.body.appendChild(script);
            }
        });
        `;
        const data = await Engine.Request.fetchUI(request, script, 30000, true);
        return data.pictures ? data.pictures.map(picture => this.getAbsolutePath(picture, this.apiURL)) : [data.rendered];
    }
    async _getMangaFromURI(uri) {
        const request = new Request(new URL(uri), this.requestOptions);
        const data = await this.fetchDOM(request, 'div.series-title h1');
        const element = [...data].pop();
        const title = (element.content || element.textContent).trim();
        return new Manga(this, uri.pathname, title);
    }
}
