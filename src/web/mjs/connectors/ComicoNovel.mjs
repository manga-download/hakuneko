import Connector from './Comico.mjs';

export default class ComicoNovel extends Connector {

    constructor() {
        super();
        super.id = 'comico-novel';
        super.label = 'Comico Novel (コミコ)';
        this.tags = [ 'novel', 'japanese' ];
        this.url = 'https://novel.comico.jp';
    }

    _getTitleNumber(href) {
        let uri = new URL(href, this.url);
        return uri.pathname.match(/\/(\d+)\/?$/)[1];
    }

    async _getPages(chapter) {
        let script = `
            new Promise((resolve, reject) => {
                let script = document.createElement('script');
                script.onload = async function() {
                    try {
                        let images = [];
                        let elements = [...document.querySelectorAll('div.cn-page div.cn-block > div[class*="cn-"]')];
                        for(let element of elements) {
                            if(element.className.includes('cn-picture')) {
                                images.push(...[...element.querySelectorAll('img.cn-picture__img')].map(img => img.src));
                                // TODO: include figcaption.cn-picture__caption
                            } else {
                                element.parentElement.style.margin = '0';
                                let canvas = await html2canvas(element);
                                images.push(canvas.toDataURL('image/png'));
                            }
                        }
                        resolve(images);
                    } catch(error) {
                        reject(error);
                    }
                }
                script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
                document.body.appendChild(script);
            });
        `;

        let uri = new URL(`/${chapter.manga.id}/${chapter.id}/`, this.url);
        let request = new Request(uri, this.requestOptions);
        return Engine.Request.fetchUI(request, script);
    }
}