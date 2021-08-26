export default class Streamtape {

    constructor(url) {
        this._uri = new URL(url);
    }

    async getStream() {
        const script = `
            new Promise(async (resolve, reject) => {
                try {
                    const uri = new URL(document.querySelector('div[id$=link]').textContent.trim(), window.location.origin);
                    const response = await fetch(uri, {
                        method: 'HEAD' // headers: { 'Range': 'bytes=0-0' }
                    });
                    resolve(response.url);
                } catch (error) {
                    reject(error);
                }
            });
        `;
        const request = new Request(this._uri);
        return Engine.Request.fetchUI(request, script);
    }
}