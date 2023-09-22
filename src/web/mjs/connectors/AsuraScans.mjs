import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class AsuraScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'asurascans';
        super.label = 'Asura Scans';
        this.tags = ['webtoon', 'english'];
        this.path = '/manga/list-mode/';
        this.queryPages = 'div#readerarea p img';
        this.requestOptions.headers.set('x-user-agent', 'Mozilla/5.0 (Linux; Android 9; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4026.0 Mobile Safari/537.36');
        this.queryThumbnail = '.thumb > .wp-post-image',
        this.queryDetailsAll = '.bigcontent';
        this.queryDetails = {
            title: 'h1.entry-title',
            author: '.fmed',
            artist: '.fmed',
            description: '.entry-content > p',
            genre: '.mgen > a',
            status: '.imptdt',
        };
        this.details = {
            thumbnail: '',
            title: '',
            author: '',
            artist: '',
            description: '',
            genre: [],
            status: '',
        };
        this.config = {
            url: {
                label: 'URL',
                description: `This website change domains regularly.\nThis is the default URL which can also be manually set by the user.`,
                input: 'text',
                value: 'https://asura.nacm.xyz'
            }
        };
    }

    get url() {
        return this.config.url.value;
    }

    set url(value) {
        if (this.config && value) {
            this.config.url.value = value;
            Engine.Settings.save();
        }
    }

    async _getMangaDetails(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryDetailsAll);
        if (data.length == 1) {
            data = data[0];

            // Thumbnail
            let thumbnailRaw = data.querySelector(this.queryThumbnail).getAttribute('data-cfsrc').split('http');
            this.details.thumbnail = 'http' + thumbnailRaw[thumbnailRaw.length - 1];

            // Title
            this.details.title = data.querySelector(this.queryDetails.title).textContent.trim();

            // Description
            this.details.description = data.querySelector(this.queryDetails.description).textContent.trim();

            // Author and Artist
            let details = data.querySelectorAll(this.queryDetails.author);
            details.forEach(element => {
                let key = element.querySelector('b').textContent.trim();
                let value = element.querySelector('span').textContent.trim();
                switch (key) {
                    case 'Author':
                        this.details.author = value;
                        break;
                    case 'Artist':
                        this.details.artist = value;
                        break;
                    default:
                        break;
                }
            });

            // Genre
            data.querySelectorAll(this.queryDetails.genre).forEach(element => {
                this.details.genre.push(element.textContent.trim());
            });

            // Status
            data.querySelectorAll(this.queryDetails.status).forEach(element => {
                let raw = element.textContent.trim().split(' ');
                if (raw[0] == 'Status') {
                    this.details.status = raw[1];
                }
            });

        }
        return this.details;
    }

    async _getPages(chapter) {
        const excludes = [
            /panda_gif_large/i,
            /2021\/04\/page100-10\.jpg/i,
            /2021\/03\/20-ending-page-\.jpg/i,
            /ENDING-PAGE/i
        ];
        const images = await super._getPages(chapter);
        return images.filter(link => !excludes.some(rgx => rgx.test(link)));
    }
}
