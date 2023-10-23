import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';
export default class YugenMangas extends Connector {
    constructor() {
        super();
        super.id = 'yugenmangas';
        super.label = 'YugenMangas';
        this.tags = [ 'webtoon', 'novel', 'spanish' ];
        this.url = 'https://yugenmangas.lat';
        this.apiURL = 'https://api.yugenmangas.net';
        this.queryChapters = 'ul.chapters-list-single a';
        this.novelContentQuery = 'div#reader-container';
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
        const uri = new URL(`/query?visibility=Public&series_type=All&order=desc&page=${page}&perPage=200`, this.apiURL);
        const request = new Request(uri, this.requestOptions);
        request.headers.set('x-referer', this.url);
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
        const data = await this.fetchDOM(request, 'ul.grid a');
        return data.map(element => {
            return {
                id: element.pathname,
                title: element.querySelector('li.flex div.flex span').textContent.trim()
            };
        });
    }

    async _getPages(chapter) {
        const darkmode = Engine.Settings.NovelColorProfile();
        const script = `
            new Promise((resolve, reject) => {
            	  
            	  //check for images container
            	  const imgcontainer = document.querySelector('div.container p.items-center');
            	  if (imgcontainer) {
                    let images = [...imgcontainer.querySelectorAll('img[data-src]')];
                    images = images.map(image => image.dataset['src'] ||  image.src)
                        .filter(image => !image.match(/,/));//they put invalid characters in some pictures (not chapters one), gotta filter it
                    resolve(images); //return images
            	  } else { //else render the text canvas
	                  document.body.style.width = '${this.novelWidth}';
	                  let container = document.querySelector('div.container');
	                  container.style.maxWidth = '${this.novelWidth}';
	                  container.style.padding = '0';
	                  container.style.margin = '0';
	                  let novel = document.querySelector('${this.novelContentQuery}');
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
	                          resolve([canvas.toDataURL('${this.novelFormat}')]);
	                      }catch (error){
	                          reject(error)
	                      }
	                  }
	                  script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
	                  document.body.appendChild(script);  	  	
            	  }
            });
        `;

        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        return await Engine.Request.fetchUI(request, script, 30000, true);
    }

    async _getMangaFromURI(uri) {
        const request = new Request(new URL(uri), this.requestOptions);
        const data = await this.fetchDOM(request, 'meta[property="og:title"]');
        const element = [...data].pop();
        const title = (element.content || element.textContent).replace('- Yugen Manga', '').trim();
        return new Manga(this, uri.pathname, title);
    }
}
