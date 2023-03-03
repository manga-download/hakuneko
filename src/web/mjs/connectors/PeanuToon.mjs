import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class PeanuToon extends Connector {

    constructor() {
        super();
        super.id = 'peanutoon';
        super.label = 'Peanutoon (피너툰)';
        this.tags = [ 'webtoon', 'korean' ];
        this.url = 'https://www.peanutoon.com';
        this.config = {
            scrapeDelay: {
                label: 'Page Scrape Delay',
                description: 'Time to wait until the page initialization process is complete.\nIncrease the value if no pages are found for the chapter.',
                input: 'numeric',
                min: 100,
                max: 10000,
                value: 2500
            }
        };
    }

    async _getDaysMangas() {
        const script = `new Promise(async (resolve, reject) => {
                            async function wait( time ) {
                                return new Promise( resolve => {
                                    setTimeout( resolve, time );
                                } );
                            };
                            function getTitleAndUrl(element) {
                                return {
                                    url: element.href,
                                    title: element.text.trim()
                                };
                            }; 
                            function getMangasForMenu(element) {
                                return ([...document.querySelectorAll("div.serialization_work_cnt a")].map(element => getTitleAndUrl(element)));
                                
                            };             


                            let promise = Promise.resolve();
                            [...document.querySelectorAll("ul#comic-nav-tabs a")].forEach((tab, index) => {
                                promise = promise.then(async prom => {
                                    tab.click();
                                    await wait(1000);
                                    return getMangasForMenu(tab);
                                });
                            });

                            const result = await promise;
                            resolve(result);
                                            
                        }, ${this.config.scrapeDelay.value});`;

        let request = new Request(this.url + '/ko/days', this.requestOptions);

        return new Promise((resolve, reject) => {
            return Engine.Request.fetchUI(request, script).then((data) => {
                const genre_manga = data.map(element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink(element.url, this.url),
                        title: element.title
                    };
                });

                resolve(genre_manga);
            }).fail(error => {
                reject(error);
            });

        });
    }

    async _getGenreMangas() {

        const script = `new Promise(async (resolve, reject) => {
                            async function wait( time ) {
                                return new Promise( resolve => {
                                    setTimeout( resolve, time );
                                } );
                            };
                            function getTitleAndUrl(element) {
                                return {
                                    url: element.href,
                                    title: element.text.trim()
                                };
                            }; 
                            function getMangasForMenu(element) {
                                return ([...document.querySelectorAll("div#로맨스 article div.g-py-10 a")].map(element => getTitleAndUrl(element)));
                                
                            };             


                            let promise = Promise.resolve();
                            [...document.querySelectorAll("ul#comic-nav-tabs li.nav-item")].forEach((tab, index) => {
                                promise = promise.then(async prom => {
                                    tab.click();
                                    await wait(1000);
                                    return getMangasForMenu(tab);
                                });
                            });

                            const result = await promise;
                            resolve(result);
                                            
                        }, ${this.config.scrapeDelay.value});`;

        let request = new Request(this.url + '/ko/genre?로맨스', this.requestOptions);
        return new Promise((resolve, reject) => {
            return Engine.Request.fetchUI(request, script).then((data) => {
                const genre_manga = data.map(element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink(element.url, this.url),
                        title: element.title
                    };
                });

                resolve(genre_manga);
            }).fail(error => {
                reject(error);
            });

        });
    }

    async _getMangas() {

        let days_manga = await this._getDaysMangas();
        let genre_manga = await this._getGenreMangas();

        console.log(Array.prototype.concat(days_manga, genre_manga));
        return Array.prototype.concat(days_manga, genre_manga);
    }

    async _getChapters(manga) {
        let request = new Request(this.url + manga.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.detail_area a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title:  element.querySelectorAll('div')[7].textContent.trim().split("\n")[0].trim() + " " + element.querySelectorAll('div')[7].textContent.trim().split("\n")[3].trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        const script = `new Promise((resolve, reject) => {
                        setTimeout(async () => {
                                            function getSrc(element) {
                                                return element.getAttribute('data-src') ? element.getAttribute('data-src') : element.getAttribute('src');
                                            }; 
                                            
                                            if( document.querySelectorAll("img[alt*='성인 표시 이미지']").length > 0){
                                                //This is an adult work and the current user has not verified their age
                                                reject();
                                            }
                                            
                                            let data = document.querySelectorAll("img.info-v5-2__image");
                                            const pages = Array.from(data).map(element => getSrc(element));
                                            resolve(pages);
                                            
                        }, ${this.config.scrapeDelay.value});
                    });`;

        if(chapter.id.includes("/#payment"))
            throw new Error(`The paid chapter '${chapter.title}' has not been purchased!`);
        else if(chapter.id.includes("/login"))
            throw new Error(`The chapter '${chapter.title}' requires login!`);

        const uri = new URL( chapter.id, this.url );

        const request = new Request( uri.href, this.requestOptions );
        const data = await Engine.Request.fetchUI(request, script);
        if(data)
            return data.map(element => this.getAbsolutePath(element, request.url));
        else
            throw new Error(`The adult chapter '${chapter.title}' requires age verification!`);
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.info_title h2');
        let id = uri.pathname;
        let title = data[0].innerText.trim();
        return new Manga(this, id, title);
    }
}