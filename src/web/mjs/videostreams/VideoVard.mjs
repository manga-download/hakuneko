export default class VideoVard {

    constructor(url) {
        this._uri = new URL(url.replace('/e/', '/d/'));
    }

    async getStream() {
        const script = `
            new Promise(async (resolve, reject) => {
                try {
                    const file = window.location.pathname.split('/').pop();
                    const response = await fetch('https://videovard.sx/api/make/download/' + file);
                    const data = await response.json();
                    const request = new Request('https://videovard.sx/api/front/download', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                        },
                        body: new URLSearchParams({
                            cmd: 'download',
                            file_code: file,
                            hash: data.hash,
                            version: data.version,
                        }).toString()
                    });
                    const timer = setInterval(async () => {
                        try {
                            const response = await fetch(request.clone());
                            const data = await response.json();
                            if(data.status == 200) {
                                clearInterval(timer);
                                const map = { 0: '5', 1: '6', 2: '7', 5: '0', 6: '1', 7: '2' };
                                const key = data.seed.replace(/[012567]/g, c => map[c]);
                                const decrypted = window.decrypt(data.link, key).replace(/[012567]/g, c => map[c]);
                                resolve(decrypted);
                            }
                        } catch(error) {
                            clearInterval(timer);
                            reject(error);
                        }
                    }, 2500);
                } catch(error) {
                    reject(error);
                }
            });
        `;
        const request = new Request(this._uri);
        return Engine.Request.fetchUI(request, script);
    }
}