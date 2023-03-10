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
		this.links = {
			login : 'https://www.peanutoon.com/ko/login'
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

        const request = new Request(this.url + '/ko/days', this.requestOptions);


		return Engine.Request.fetchUI(request, script).then((data) => {
			const genre_manga = data.map(element => {
				return {
					id: this.getRootRelativeOrAbsoluteLink(element.url, this.url),
					title: element.title
				};
			});

			return genre_manga;
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

		return Engine.Request.fetchUI(request, script).then((data) => {
			const genre_manga = data.map(element => {
				return {
					id: this.getRootRelativeOrAbsoluteLink(element.url, this.url),
					title: element.title
				};
			});

			return genre_manga
		});
    }

    async _getMangas() {

        const days_manga = await this._getDaysMangas();
        const genre_manga = await this._getGenreMangas();

        console.log(Array.prototype.concat(days_manga, genre_manga));
        return Array.prototype.concat(days_manga, genre_manga);
    }

    async _getChapters(manga) {
        const request = new Request(this.url + manga.id, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.detail_area a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title:  element.querySelectorAll('div.detail_work_list div div:not([class])')[0].textContent.trim() + " " + element.querySelectorAll('div.detail_work_list div div:not([class])')[1].textContent.trim(),
                language: ''
            };
        });
    }
	
    async _getPages(chapter) {
        if(chapter.id.includes("/#payment"))
            throw new Error(`The paid chapter '${chapter.title}' has not been purchased!`);
        else if(chapter.id.includes("/login"))
            throw new Error(`The chapter '${chapter.title}' requires login!`);
		
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'section#viewer-list source.lazyload');
        return data.map(element => this.getAbsolutePath(element.dataset['src'], request.url));
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.info_title h2');
        const id = uri.pathname;
        const title = data[0].innerText.trim();
        return new Manga(this, id, title);
    }
}