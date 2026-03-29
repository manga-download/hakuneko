import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ManhwaClub extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manhwaclub';
        super.label = 'ManhwaHentai';
        this.tags = [ 'webtoon', 'hentai', 'multi-lingual' ];
        this.url = 'https://manhwahentai.to';
        this.queryMangas = 'div.post_title a';
        this.queryTitleForURI = 'div.post-summary div.post-title';
    }

    async _getChapters(manga) {
        const request = new Request(new URL(manga.id, this.url));
        const script = `
            new Promise((resolve) => {
                setTimeout(() => {
                   resolve(manga.manga_id);
                }, 1500);
            });
        `;
        const mangaid = await Engine.Request.fetchUI(request, script);
        const url = new URL(`/wp-admin/admin-ajax.php?action=get-all-chapters-list&post_id=${mangaid}&chapters_per_page=9999&offset=0`, this.url);
        const { data } = await this.fetchJSON(new Request(url));
        const dom = new DOMParser().parseFromString(data, 'text/html');
        const links = [...dom.querySelectorAll('li a')];
        return links.map(chapter => {
            return {
                id: `${mangaid.slug}${chapter.pathname.split('/').pop()}`,
                title: chapter.querySelector('p.truncate').textContent.trim()
            };
        });
    }

    async _getPages(chapter) {
        const request = new Request(new URL(chapter.id, this.url));
        const script = `
            new Promise((resolve) => {
                setTimeout(() => {
                    resolve(chapter_preloaded_images.map(image => image.src.replace('http://', 'https://')));
                }, 1500);
            });
        `;
        return Engine.Request.fetchUI(request, script);
    }
}
