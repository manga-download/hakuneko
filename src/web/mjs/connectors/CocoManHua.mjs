import ZYMK from './templates/ZYMK.mjs';

export default class CocoManHua extends ZYMK {

    constructor() {
        super();
        super.id = 'cocomanhua';
        super.label = 'Coco漫画';
        this.tags = [ 'webtoon', 'chinese' ];
        this.url = 'https://www.cocomanhua.com';

        this.path = '/show?page=';
        this.pathSuffix = '';
        this.queryMangaTitle = 'dl.fed-deta-info dd.fed-deta-content h1.fed-part-eone';
        this.queryMangasPageCount = 'div.fed-page-info a.fed-show-sm-inline';
        this.queryMangas = 'ul.fed-list-info li.fed-list-item a.fed-list-title';
        this.queryChapters = 'div.all_data_list ul li a';
        this.queryPage = `
            new Promise(resolve => {
                /*
                // from manga.read.js __cr.showPic(...)
                => base64.decode('dlSxHGdzZuE8IyExLyP0MucxL4M4ZmIzZ4gmN1ZhciB1aFSzVFhkQmVuayzmT0ZFd0nvVTVkQFQXTWwnMkQERX9uQkZ5TUcwclIpUmVXQl7vVm9RTVnxNDMuQ4wPZSUwMVUxeDSQWS9HYlwaaFMVVuBWVE9oTVQNU0YvdSQNa0jxZF0Sd0SqaEZUVz9zU0cwdV9qQkVTQUZhTkMzQFIoPjkiVTS3VzdWd4IqcSdjbXQMYjQQMSYxbE0iLj2xYUdRLkVSeShVVjIyT0QnU4HxNWhhbSH4WVhRWWLxLUZiaj3yY4rZME3pbEZZbj3KZSdqVkkWWj3uRS9oUkZRT0IFcSkXaygvUTMaclQrLWSLLuSPUTItekSpMX9WWE3pVDSWT0EyRj8UQVYyVUQJVFMrNVkNLlM2ZUV1eFS3NW8NVkk5T0QWUlIWRj8XQXM5YyH0QkIURTBKLU30U4rMekPvZSQZa0I9TVZZLWQETuBXQEk5ZW9FbU0XUkQULW81YuMRRVIERkBWLSYxYVhvUz3YWmVWelgxVlj3MlVraSBZelQOZEQNbk9pY1dWLzZYYyMvTWHvLU3aalhpYWrqUlIHPTIMVkZSUTMaQE3XNDQVa4g4YW3NTSQHbyQhbSZ3VWwjTkVHcGZQbmAxUzVqTj0FZGkXWEZFYuSjQE8URl0LLuVZWjdWTj8UaDQuQj31Y43RRSdSdErXbjZrYuBvbkZqaEQhVlqvVG9WQEzwTkhWQmBrVF0FWlLvbGdaajI3UjdjbE3FQmhRVmBtVWrvR0SXayBVLXBGT0haaFQsayVhV09VVW9ILlSHPXhiVjS3Wl0aTWSEQjkuLjZIY0hNRlMYVXIiL485WVZMd0QUPTIiVlh3T0hJTU3HaGVhayVzWlraMWSGQXhXVFQrTjU0elISNTVMVjYxVzdRclHyaDSkVU2zVl9Jdj0XdGkMaz30TjZNYVjxcFSNL4PwUzZjeVYxbFrVLj9RVkdjbSnwQlwWVlQ0VUcwd0ExLGkVWFh4ZUQCb4PwcS9uWEYvTUdjVWIoUmVNVE9HUyBJWE3XUlhUbE32ZWqwMkdETTQTQyPvUTAwclIqcErjVXhJYuBqeS9oQjdMbE9HYkQRPlIUQj0iVXQTVXkzeFVWbEIZLDVrVEhjQlVXeDQQVFr5VEVQLkdFWuSMVEIXYWj3Qj3sTl0jbXBYWlrjWkVFPjrLekn0RyIFbFHxb19TVkIsVuIteSSXQmIhL47wZSVFRlVqbFriREnwUWwRRj3FPuZiWSIVVSV2aVdXbShQVTVKZUVnTz3VNVhQWSS1U0QWR0ZGLU8hbUk5ZUhaeWVSMW9LelQ5VEdRTU8HbSIPVDA8Iyr4YXHgd1QlLu0fX4MjZWMxeXBzJGdzZuEqHEMxeXBzbz9TKlVsYx3CYXMkMuPscFSxc4Und4hhdSQnZUZ0Y4q9KmQtU1QxaW3mJEMxeXBzbz9TKlVsYx3VdFY2JRj6ZXZhbCh1dFYxJTq=')
                
                // decoded base64
                var wtf1 = '123456723cvfrtgh';
                var whatTheFuck = 'OVFwZ0U5eDdWMlh6TDIzcFVzMG1rbkRuWFo0VzRMZ283cGlPdU15U2x1QXZHblZhcUV0VTJjMTNSV0tTNkY2dmEwQlhFTWJtSW1uZlFUSEFaNStDbjBIbU1yWGVwblpWdmtMbDQ4V2lMb2N2aGR2UExXUVBsOThSb29halR6YXRYc21FbjNsckY4NklFYnNKdWlVYVZNcHZjRVRORFpYWk80Q3Zrdm1aL21PQ2ozQk5zVXNkT1VOQ3JOTEV3UDJTcm9YN2cxeEwxay9oNVYzOTVRbVJOWEszc25FRTI0K1NuSkMzT0dTYkRiMVY1dDN0WDIzejFmMWRTT1owb3RIRDJPV0V2aXpSNXZuVzh2Vi96emhPYzdOdDNnZkcwV3FXc3pMb01NZjhkaklRbHA2MVVEQ3ZDNW84Ukh6anNLTHo4alVyUldNUHpvQnp2SElNMFdyWXFFb1dDOTJmL25YZGVNOTh4cFNwcnRHWEtKWnFmb0pnVlhDaVk0TzVDM1NXVFpmTmFZc0lwZjByRGdlNFFxRVpoUkpKQWk0U1pGOXZhdnk5aWZUUjI2aHAxbVAyZmZMaDFIc2FIcXNJcXUrb3ozYVMwTTA2bVhyOXJMNHhuak5tZkZ5aGExWTdmNE5zbE95MVF2WGRrb3h1eUN4VjJvMWtyMkNuNFNaY2paN3d1SFdyV2lkU2JRVWdlZ1FlVVduUG1wQ20yUXhveDBod1pZcXF0MGdUbjRuNTJHS0JXNWRhTlNxek16WDM4SG40Q01rblpKdUxJb0lxZjFGMlJHbTRBbTFMbUtSUytxeVlBY05mTHdFeWx4QTkzTEQ2WFZ1MTBWai9FNnNmdmpXZkdZUFBKLzZ5K2Flb2ozSVRnV2oxQWFra3o1dUFJellkbHJ1QlRJNFB6bXRUTUxiWWlXQU5KeEhONU9XQXQwSTVKVG1OamIzeHZyeE5jLzdzTGRMOHlRPT0=';
                var wtf2 = __cdecrypt(wtf1, CryptoJS.enc.Base64.parse(whatTheFuck).toString(CryptoJS.enc.Utf8));

                // decrypted wtf2
                var __READKEY = 'fw122587mkertyui';
                var DECRIPT_DATA;
                try {
                    DECRIPT_DATA = __cdecrypt(__READKEY, CryptoJS.enc.Base64.parse(mh_info.enc_code1).toString(CryptoJS.enc.Utf8));
                    if(DECRIPT_DATA==''){
                        DECRIPT_DATA = __cdecrypt('fw12558899ertyui', CryptoJS.enc.Base64.parse(mh_info.enc_code1).toString(CryptoJS.enc.Utf8));
                    }
                } catch (error) {
                    DECRIPT_DATA = __cdecrypt('fw12558899ertyui', CryptoJS.enc.Base64.parse(mh_info.enc_code1).toString(CryptoJS.enc.Utf8));
                }
                eval(DECRIPT_DATA);
                */
                const totalimg = mh_info.totalimg
                || __cdecrypt('fw122587mkertyui', CryptoJS.enc.Base64.parse(mh_info.enc_code1).toString(CryptoJS.enc.Utf8))
                || __cdecrypt('fw12558899ertyui', CryptoJS.enc.Base64.parse(mh_info.enc_code1).toString(CryptoJS.enc.Utf8));
                resolve(new Array(parseInt(totalimg)).fill().map((_, index) => new URL(__cr.getPicUrl(index + 1), window.location.origin).href));
            });
        `;
    }
}