export default class FileMoon {

    constructor(url) {
        this._uri = new URL(url);
        this._uri.searchParams.delete('autostart');
    }

    async getPlaylist() {
        const script = `
            new Promise((resolve, reject) => {
                setTimeout(() => {
                      resolve(window.videop.hls.url); 
                }, 3000);
            });
        `;
        const request = new Request(this._uri);
        return await Engine.Request.fetchUI(request, script);
    }
}
