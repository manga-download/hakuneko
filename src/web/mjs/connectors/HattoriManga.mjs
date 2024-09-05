import Connector from '../engine/Connector.mjs';

export default class HattoriManga extends Connector {
    constructor() {
        super();
        super.id = 'hattorimanga';
        super.label = 'Hattori Manga';
        this.tags = ['webtoon', 'turkish'];
        this.url = 'https://www.hattorimanga.net';
        this.links = {
            login: 'https://www.hattorimanga.net/giris'
        };
    }

    async _getMangas() {
        const mangas = [];
        let page = 1;
        let hasMorePages = true;

        while (hasMorePages) {
            let request = new Request(`${this.url}/manga?page=${page}`, this.requestOptions);
            let data = await this.fetchDOM(request, 'div.manga-card h5 a'); // CSS se�icisini �zelle�tirir

            if (data.length > 0) {
                mangas.push(...data.map(element => ({
                    id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                    title: element.text.trim()
                })));

                page++;
            } else {
                hasMorePages = false;
            }
        }

        return mangas;
    }

    async _getChapters(manga) {
        manga.id = manga.id.replace('manga/', '');
        let allChapters = [];
        let page = 1;
        const lastPage = await this._getLastPage(manga.id);

        while (page <= lastPage) {
            let uri = `${this.url}/load-more-chapters${manga.id}?page=${page}`;
            try {
                const response = await fetch(uri);
                const veri = await response.json();
                allChapters = allChapters.concat(veri.chapters.map(element => {
                    let chapterId = `${this.url}/manga/${element.manga_slug}/${element.chapter_slug}`;
                    return {
                        id: chapterId,
                        title: element.title
                    };
                }));
                page++;
            } catch (error) {
                console.error('Hata:', error);
                break;
            }
        }
        return allChapters;
    }

    async _getLastPage(mangaId) {
        let uri = `${this.url}/load-more-chapters${mangaId}?page=1`;
        try {
            const response = await fetch(uri);
            const veri = await response.json();
            return veri.lastPage;
        } catch (error) {
            console.error('Hata:', error);
            return 1;
        }
    }

    async _getPages(chapter) {
        try {
            // Verilen chapterUrl'den HTML i�eri�ini al�r
            const response = await fetch(chapter.id);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const html = await response.text();

            // HTML i�eri�i bir DOM nesnesine d�n���r
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // CSS se�iciyi kullanarak t�m resim elementlerini se�me
            const imgElements = doc.querySelectorAll('div.image-wrapper img');

            // Resim URL'leri bir diziye d�n���r
            const imageUrls = Array.from(imgElements).map(img => `${this.url}${img.getAttribute('data-src') || img.src}`);
            console.log(imageUrls);

            return imageUrls;
        } catch (error) {
            console.error('Error fetching the pages:', error);
            return [];
        }
    }

    // async i�levi fetchMangaPages bir s�n�f y�ntemi olmal�d�r
    async fetchMangaPages(manga) {
        try {
            let chapters = await this._getChapters(manga);
            for (let chapter of chapters) {
                let pages = await this._getPages(chapter);
                console.log(`Pages for ${chapter.id}:`, pages);
            }
        } catch (error) {
            console.error('Error fetching manga pages:', error);
        }
    }
}
