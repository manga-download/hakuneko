import Connector from "../engine/Connector.mjs";
import Manga from "../engine/Manga.mjs";

export default class WestManga extends Connector {
    constructor() {
        super();
        super.id = "westmanga";
        super.label = "WestManga";
        this.tags = ["manga", "manhua", "manhwa", "indonesian"];
        this.url = "https://westmanga.me";
        this.queryMangaTitle = "h1";

        // API configuration
        this.api = {
            url: "https://data.westmanga.me/api/",
            nonce: "wm-api-request",
            accessKey: "WM_WEB_FRONT_END",
            secretKey: "xxxoidj",
        };
    }

    cleanTitle(title) {
        return title.replace(/bahasa indonesia/i, "").trim();
    }

    async _getMangas() {
        const mangaList = [];
        for (let page = 1; ; page++) {
            const mangas = await this.getMangasFromPage(page);
            if (mangas.length === 0) break;
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async getMangasFromPage(page) {
        try {
            const { data } = await this.fetchAPI(`./contents?page=${page}`);
            return data
                ? data.map(({ slug, title }) => ({
                      id: slug,
                      title: "Chapter" + this.cleanTitle(title),
                  }))
                : [];
        } catch (error) {
            return [];
        }
    }

    async _getChapters(manga) {
        try {
            const {
                data: { chapters },
            } = await this.fetchAPI(`./comic/${manga.id}`);
            return chapters.map(({ slug, number }) => {
                let title = number.toString().trim();
                if (/^\d+(\.\d+)?$/.test(title)) {
                    title = `Chapter ${title}`;
                }

                return {
                    id: slug,
                    title: title,
                };
            });
        } catch (error) {
            return [];
        }
    }

    async _getPages(chapter) {
        try {
            const {
                data: { images },
            } = await this.fetchAPI(`./v/${chapter.id}`);
            return images;
        } catch (error) {
            return [];
        }
    }

    async _getMangaFromURI(uri) {
        const slug = uri.pathname.split("/").pop();
        try {
            const {
                data: { title },
            } = await this.fetchAPI(`./comic/${slug}`);
            return new Manga(this, slug, this.cleanTitle(title));
        } catch (error) {
            return null;
        }
    }

    async fetchAPI(endpoint) {
        const url = new URL(endpoint, this.api.url);
        const timestamp = `${Date.now()}`.slice(0, -3);

        const signature = await this.generateHMAC256(
            this.api.nonce,
            timestamp,
            "GET",
            url.pathname,
            this.api.accessKey,
            this.api.secretKey,
        );

        const request = new Request(url, {
            ...this.requestOptions,
            headers: {
                ...this.requestOptions.headers,
                Referer: this.url,
                "X-Wm-Request-Time": timestamp,
                "X-Wm-Accses-Key": this.api.accessKey,
                "X-Wm-Request-Signature": signature,
            },
        });

        return this.fetchJSON(request);
    }

    async generateHMAC256(data, ...keyData) {
        const algorithm = { name: "HMAC", hash: { name: "SHA-256" } };
        const encoder = new TextEncoder();
        const keyBytes = encoder.encode(keyData.join(""));
        const dataBytes = encoder.encode(data);

        const key = await crypto.subtle.importKey(
            "raw",
            keyBytes,
            algorithm,
            false,
            ["sign"],
        );
        const signature = await crypto.subtle.sign(algorithm, key, dataBytes);

        return Array.from(new Uint8Array(signature))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
    }

    canHandleURI(uri) {
        return new RegExp(
            `^${this.url.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}/comic/[^/]+$`,
        ).test(uri.href);
    }
}
