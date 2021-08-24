import ZYMK from './templates/ZYMK.mjs';

export default class CocoManHua extends ZYMK {

    constructor() {
        super();
        super.id = 'cocomanhua';
        super.label = 'Coco漫画';
        this.tags = [ 'webtoon', 'chinese' ];
        this.url = 'https://www.cocomanga.com';

        this.path = '/show?page=';
        this.pathSuffix = '';
        this.queryMangaTitle = 'dl.fed-deta-info dd.fed-deta-content h1.fed-part-eone';
        this.queryMangasPageCount = 'div.fed-page-info a.fed-show-sm-inline';
        this.queryMangas = 'ul.fed-list-info li.fed-list-item a.fed-list-title';
        this.queryChapters = 'div.all_data_list ul li a';
        this.queryPage = `
            new Promise(resolve => {
                // from manga.read.js __cr.showPic(...)
                const script = 'dlSxHGdzZuE8IyExLyP0MucxL4M4ZmIzZ4gmN1ZhciB1aFSzVFhkQmVuayzmT0ZFd0nvVTVkQFQXTWwnMkQERX9uQkZ5TUcwclIpUmVXQl7vVm9RTVnxNDMuQ4wPZSUwMVUxeDSQWS9HYlwaaFMVVuBWVE9oTVQNU0YvdSQNa0jxZF0Sd0SqaEZUVz9zU0cwdV9qQkVTQUZhTkMzQFIoPjkiVTS3VzdWd4IqcSdjbXQMYjQQMSYxbE0iLj2xYUdRLkVSeShVVjIyT0QnU4HxNWhhbSH4WVhRWWLxLUZiaj3yY4rZME3pbEZZbj3KZSdqVkkWWj3uRS9oUkZRT0IFcSkXaygvUTMaclQrLWSLLuSPUTItekSpMX9WWE3pVDSWT0EyRj8UQVYyVUQJVFMrNVkNLlM2ZUV1eFS3NW8NVkk5T0QWUlIWRj8XQXM5YyH0QkIURTBKLU30U4rMekPvZSQZa0I9TVZZLWQETuBXQEk5ZW9FbU0XUkQULW81YuMRRVIERkBWLSYxYVhvUz3YWmVWelgxVlj3MlVraSBZelQOZEQNbk9pY1dWLzZYYyMvTWHvLU3aalhpYWrqUlIHPTIMVkZSUTMaQE3XNDQVa4g4YW3NTSQHbyQhbSZ3VWwjTkVHcGZQbmAxUzVqTj0FZGkXWEZFYuSjQE8URl0LLuVZWjdWTj8UaDQuQj31Y43RRSdSdErXbjZrYuBvbkZqaEQhVlqvVG9WQEzwTkhWQmBrVF0FWlLvbGdaajI3UjdjbE3FQmhRVmBtVWrvR0SXayBVLXBGT0haaFQsayVhV09VVW9ILlSHPXhiVjS3Wl0aTWSEQjkuLjZIY0hNRlMYVXIiL485WVZMd0QUPTIiVlh3T0hJTU3HaGVhayVzWlraMWSGQXhXVFQrTjU0elISNTVMVjYxVzdRclHyaDSkVU2zVl9Jdj0XdGkMaz30TjZNYVjxcFSNL4PwUzZjeVYxbFrVLj9RVkdjbSnwQlwWVlQ0VUcwd0ExLGkVWFh4ZUQCb4PwcS9uWEYvTUdjVWIoUmVNVE9HUyBJWE3XUlhUbE32ZWqwMkdETTQTQyPvUTAwclIqcErjVXhJYuBqeS9oQjdMbE9HYkQRPlIUQj0iVXQTVXkzeFVWbEIZLDVrVEhjQlVXeDQQVFr5VEVQLkdFWuSMVEIXYWj3Qj3sTl0jbXBYWlrjWkVFPjrLekn0RyIFbFHxb19TVkIsVuIteSSXQmIhL47wZSVFRlVqbFriREnwUWwRRj3FPuZiWSIVVSV2aVdXbShQVTVKZUVnTz3VNVhQWSS1U0QWR0ZGLU8hbUk5ZUhaeWVSMW9LelQ5VEdRTU8HbSIPVDA8Iyr4YXHgd1QlLu0fX4MjZWMxeXBzJGdzZuEqHEMxeXBzbz9TKlVsYx3CYXMkMuPscFSxc4Und4hhdSQnZUZ0Y4q9KmQtU1QxaW3mJEMxeXBzbz9TKlVsYx3VdFY2JRj6ZXZhbCh1dFYxJTq=';
                const totalimg = mh_info.enc_code1 ? parseInt(eval(base64.decode(script))) : mh_info.totalimg;
                resolve(new Array(totalimg).fill().map((_, index) => new URL(__cr.getPicUrl(index + 1), window.location.origin).href));
            });
        `;

        this.config.throttle = {
            label: 'Throttle Requests [ms]',
            description: 'Enter the timespan in [ms] to delay consecuitive HTTP requests.\nThe website may block images for to many consecuitive requests.',
            input: 'numeric',
            min: 50,
            max: 1000,
            value: 250
        };
    }

    async _getPages(chapter) {
        const images = await super._getPages(chapter);
        return images.map(image => {
            return this.createConnectorURI({
                url: image,
                referer: new URL(chapter.id, this.url).href
            });
        });
    }

    async _handleConnectorURI(payload) {
        const request = new Request(payload.url, this.requestOptions);
        request.headers.set('x-referer', payload.referer);
        const response = await fetch(request);
        let data = await response.blob();
        data = await this._blobToBuffer(data);
        this._applyRealMime(data);
        return data;
    }
}