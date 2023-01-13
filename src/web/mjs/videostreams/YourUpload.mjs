export default class YourUpload {
    constructor(url) {
        this._uri = new URL(url);
    }
    async getStream() {
        const script = `
        new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    document.querySelector('[aria-label="Play"]').click();
                    resolve(jwplayerOptions.file);
                }
                catch(error) {
                    reject(error);
                }
            },
            3000);
        });
        `;
        const request = new Request(this._uri);
        return await Engine.Request.fetchUI(request, script, 10000);
    }
}