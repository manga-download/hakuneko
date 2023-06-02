import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';
import { render_image, init } from './Cuutruyen_wasm.mjs';

export default class Cuutruyen extends Connector {
    constructor() {
        super();
        super.id = 'cuutruyen';
        super.label = 'Cứu Truyện';
        this.tags = ['manga', 'vietnamese'];
        this.url = 'https://cuutruyen.net';
        this.api = 'https://kakarot.cuutruyen.net';

        this.wasm = init(fetch("https://cuutruyen.net/d660d30a7af3c1ad.module.wasm"));

        sessionStorage.setItem("_9421424163", "1284069429");
        sessionStorage.setItem("_3236353668", "6321050717");
        sessionStorage.setItem("_8864459579", "\u200B4283056037");
        sessionStorage.setItem("_2038728281", "8111913161");
        sessionStorage.setItem("_3843324144", "4499219618");
    }

    async _getMangaFromURI(uri) {
        const mangaid = uri.href.match(/\/mangas\/([0-9]+)/)[1];
        const req = new URL('/api/v1/mangas/' + mangaid, this.api);
        const request = new Request(req, this.requestOptions);
        const data = await this.fetchJSON(request);
        return new Manga(this, mangaid, data.data.attributes.name.trim());
    }

    async _getMangas() {
        const uri = new URL('/api/v2/mangas/recently_updated?page=1&per_page=30', this.api);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        const pages = data._metadata.total_pages;
        let mangaList = this._getMangasFromPage(data);

        for (let page = 2; page <= pages; page++) {
            const uri = new URL(`/api/v2/mangas/recently_updated?page=${page}&per_page=30`, this.api);
            const request = new Request(uri, this.requestOptions);
            const data = await this.fetchJSON(request);
            const mangas = await this._getMangasFromPage(data);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(data) {
        return data.data.map((element) => {
            return {
                id: element.id,
                title: element.name.trim(),
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL('/api/v2/mangas/' + manga.id + '/chapters', this.api);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.data.map((element) => {
            return {
                id: element.id,
                title: 'Chapter ' + element.number,
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL('/api/v2/chapters/' + chapter.id, this.api);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        const pages = data.data.pages.filter((image) => image.status === "processed");
        return pages.map((image) => {
            return this.createConnectorURI({
                url: image.image_url,
                scrambleString: image.drm_data,
            });
        });
    }

    async _handleConnectorURI(payload) {
        const image = await new Promise((resolve) => {
            const image = new Image();
            image.src = payload.url;
            image.onload = () => {
                resolve(image);
            };
        });
        const canvas = await this._descramble(image, payload.scrambleString);
        const blobFinally = await this._canvasToBlob(canvas);
        return this._blobToBuffer(blobFinally);
    }

    async _descramble(image, scrambleString) {
        await this.wasm;

        let canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        ctx.textAlign = "right";

        render_image(image, ctx, scrambleString);

        return canvas;
    }

    _canvasToBlob(canvas) {
        return new Promise(resolve => {
            canvas.toBlob(data => {
                resolve(data);
            }, Engine.Settings.recompressionFormat.value, parseFloat(Engine.Settings.recompressionQuality.value) / 100);
        });
    }
}
