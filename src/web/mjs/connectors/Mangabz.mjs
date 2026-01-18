import Connector from "../engine/Connector.mjs";
import Manga from "../engine/Manga.mjs";

export default class Mangabz extends Connector {
    constructor() {
        super();
        super.id = "mangabz";
        super.label = "MangaBZ";
        this.tags = ["webtoon", "chinese", "anime"];
        this.url = "https://www.mangabz.com";
    }

    async _getMangas() {
        const BATCH_COUNT = 8;
        let pageNumber = 1;
        let hasNextBatch = true;

        const allMangas = [];
        while (hasNextBatch) {
            const promises = [];
            for (let i = pageNumber; i < pageNumber + BATCH_COUNT; i++) {
                promises.push(this._getMangasByPage(i));
            }
            const data = await Promise.all(promises);
            const flattenData = data.flat();

            if (flattenData.length === 0) {
                hasNextBatch = false;
            }

            allMangas.push(...flattenData);
            pageNumber += BATCH_COUNT;
        }

        return allMangas;
    }

    async _getMangasByPage(pageNumber) {
        const uri = new URL(`/manga-list-p${pageNumber}/`, this.url);

        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, ".mh-list .mh-item-detali a");

        return data.map((element) => ({
            id: element.getAttribute("href"),
            title: element.getAttribute("title"),
        }));
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);

        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, "#chapterlistload a");

        return data.map((element) => ({
            id: element.getAttribute("href"),
            title: element.innerText,
        }));
    }

    async _getPages(chapter) {
        const script = `
                new Promise((resolve, reject) => {
                    setTimeout(async () => {
                        try {
                            resolve(
                                Array.from(document.querySelectorAll('img')).map((img) => img.getAttribute('data-src'))
                            )
                        } catch(error) {
                            reject(error);
                        }
                    }, 500);
                });
            `;

        const uri = new URL(chapter.id, this.url);
        this.requestOptions.headers.set(
            "x-user-agent",
            "Mozilla/5.0 (iPod; CPU iPhone OS 14_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/87.0.4280.163 Mobile/15E148 Safari/604.1",
        );

        const request = new Request(uri, this.requestOptions);
        const data = await Engine.Request.fetchUI(request, script);

        return data.map((imgUrl) => this.createConnectorURI(imgUrl));
    }

    async _getMangaFromURI(uri) {
        const id = uri.pathname;

        const request = new Request(uri, this.requestOptions);
        const [titleEle] = await this.fetchDOM(
            request,
            ".detail-info-title,.detail-main-title",
        );
        return new Manga(this, id, titleEle.innerText.trim());
    }

    async _handleConnectorURI(payload) {
        const request = new Request(payload, this.requestOptions);
        request.headers.set("x-referer", this.url);
        const response = await fetch(request);
        let data = await response.blob();
        data = await this._blobToBuffer(data);
        this._applyRealMime(data);
        return data;
    }
}

