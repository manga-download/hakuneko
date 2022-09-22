import Connector from "../engine/Connector.mjs";
import Manga from "../engine/Manga.mjs";

export default class ToCoronaEx extends Connector {
    constructor() {
        super();
        super.id = "to-corona-ex";
        super.label = "コロナ (to-corona-ex)";
        this.tags = ["manga", "japanese"];
        this.url = "https://to-corona-ex.com/";
        this.apiurl = 'https://api.to-corona-ex.com';
        this.cdnurl = 'https://cdn.to-corona-ex.com';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, ".mi-text-xl.mi-font-semibold"); //title object
        const id = uri.pathname.split("/")[2];//just the id of the comic.
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        let nextCursor = '/comics?order=asc&sort=title_yomigana';
        for (let run = true; run;) {
            const data = await this._getMangasFromPage(nextCursor);
            nextCursor = data.nextCursor;
            mangaList.push(...data.mangas);
            if (nextCursor == null) {
                run = false;
            }
        }
        return mangaList;
    }

    async _getMangasFromPage(nextCursor) {
        let uri = new URL(nextCursor, this.apiurl);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        return {
            mangas: data.resources.map(element => {
                return {
                    id: element.id,
                    title: element.title.trim().replace('@COMIC', '')
                };
            }),
            nextCursor: data.next_cursor != null ? '/comics?order=asc&sort=title_yomigana&after_than=' + data.next_cursor : null
        };
    }

    async _getChapters(manga) {
        let chapterList = [];
        const getToken = await this.getToken();
        let hasSubscription = false;
        if (getToken) {
            this.requestOptions.headers.set('authorization', 'Bearer ' + getToken);
            try {
                let suburl = `/users/me/subscription/status`;
                let uri = new URL(suburl, this.apiurl);
                let request = new Request(uri, this.requestOptions);
                let subdata = await this.fetchJSON(request);
                hasSubscription = subdata.subscription_service_status == "enabled";
            } catch (_e) {
                //page will give 401 if not loggedin
                hasSubscription = false;
            }
        }
        let nextCursor = `/episodes?comic_id=${manga.id}&order=asc&sort=episode_order`;
        if (hasSubscription) {
            nextCursor += "&episode_status=free_viewing%2Conly_for_subscription";
        }
        for (let run = true; run;) {
            const data = await this._getChaptersFromPage(manga, nextCursor, hasSubscription);
            nextCursor = data.nextCursor;
            chapterList.push(...data.chapters);
            if (nextCursor == null) {
                run = false;
            }
        }
        return chapterList.reverse();
    }
    //get auth token from indexedDB
    async getToken() {
        let script = `new Promise(resolve => {
            setTimeout(() => {
                try{
                    let tRequest = window.indexedDB.open("firebaseLocalStorageDb", 1);
                    tRequest.onerror = function (event) {
                        resolve(undefined);
                    };
                    tRequest.onsuccess = function (e) {

                        const db = e.target.result;
                        const transaction = db.transaction("firebaseLocalStorage", 'readonly');
                        const objectStore = transaction.objectStore("firebaseLocalStorage");

                        if ('getAll' in objectStore) {
                            objectStore.getAll().onsuccess = function (event) {
                                if(event.target.result.length == 0){
                                    resolve(undefined);
                                }
                                else{resolve(event.target.result[0].value.stsTokenManager.accessToken);
                                    }
                            };
                            objectStore.getAll().onerror = function (event) {
                                resolve(undefined);
                            };
                        }
                        else{resolve(undefined);}
                    }
                }
                catch(e){resolve(undefined);}
            }, 2500);
        });`;
        const uri = new URL('/', this.url);
        let request = new Request(uri, this.requestOptions);
        return await Engine.Request.fetchUI(request, script);
    }

    async _getChaptersFromPage(manga, nextCursor, hasSubscription) {
        let uri = new URL(nextCursor, this.apiurl);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        let extraparameters = "";
        if (hasSubscription) {
            extraparameters += "&episode_status=free_viewing%2Conly_for_subscription";
        }
        return {
            chapters: data.resources.map(element => {
                return {
                    id: element.id,
                    title: element.title
                };
            }),
            nextCursor: data.next_cursor != null ? `/episodes?comic_id=${manga.id}&order=asc&sort=episode_order&after_than=${data.next_cursor}` + extraparameters : null
        };
    }

    async _getPages(chapter) {
        let uri = new URL(`/episodes/${chapter.id}/begin_reading`, this.apiurl);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        return data.pages.map(element => this.createConnectorURI(element.page_image_url));
    }

    async _handleConnectorURI(payload) {
        if (!payload.includes(`${this.cdnurl}/pages/images/`)) {
            return super._handleConnectorURI(payload);
        }
        let data = await this.prepareForDescramble(payload);
        data = await this._blobToBuffer(data);
        this._applyRealMime(data);
        return data;
    }

    async prepareForDescramble(scrambledImageURL) {
        let uri = new URL(scrambledImageURL);
        let descrambleKey = uri.search.substring(10, uri.search.indexOf("&"));
        let res = await fetch(scrambledImageURL, this.requestOptions);
        let data = await res.blob();
        let bitmap = await createImageBitmap(data);
        return await this.descramble(bitmap, descrambleKey);
    }

    descramble(bitmap, key) {
        return new Promise(resolve => {
            var r = function (e) {
                    for (var t = atob(e), n = [], r = 0; r < t.length; r += 1) {
                        n[r] = t.charCodeAt(r);
                    }
                    return n;
                }(key),
                i = r[0],
                o = r[1],
                a = r.slice(2),
                s = bitmap.width,
                u = bitmap.height,
                c = i * o,
                l = Math.floor((s - s % 8) / i),
                f = Math.floor((u - u % 8) / o);
            let canvas = document.createElement('canvas');
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            let ctx = canvas.getContext('2d');
            //first the original images is set as baseline as parts outside of the jigsaw squares(that haven't been moved) are still in their original position.
            ctx.drawImage(bitmap, 0, 0);
            for (var d = 0; d < c; d += 1) {
                var h = a[d],
                    p = h % i,
                    m = Math.floor(h / i),
                    g = d % i,
                    v = Math.floor(d / i);
                ctx.drawImage(bitmap, p * l, m * f, l, f, g * l, v * f, l, f);
            }
            canvas.toBlob(data => {
                resolve(data);
            }, Engine.Settings.recompressionFormat.value, parseFloat(Engine.Settings.recompressionQuality.value) / 100);
        });
    }
}
