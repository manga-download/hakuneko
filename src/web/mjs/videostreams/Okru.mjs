export default class Okru {
    constructor(url) {
        this._uri = new URL(url);
    }
    async getStream(resolution) {
        /*
        * mobile
        * low
        * sd
        * hd
        */
        const script = `
        new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const el = document.querySelector('div[data-module="OKVideo"]');
                    el.click();
                    resolve(el.getAttribute('data-options'));
                }
                catch(error) {
                    reject(error);
                }
            },
            3000);
        });
        `;
        const request = new Request(this._uri);
        const response = await Engine.Request.fetchUI(request, script, 10000);
        const data = JSON.parse(JSON.parse(response).flashvars.metadata);
        let video = (data.videos.find(video => video.name == resolution));
        (video) ? video = video.url : video = data.videos[0].url;
        return video;
    }
}
