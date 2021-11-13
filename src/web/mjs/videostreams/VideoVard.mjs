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
                    const form = new FormData();
                    form.append('cmd', 'download');
                    form.append('file_code', file);
                    form.append('hash', data.hash);
                    form.append('version', data.version);
                    const request = new Request('https://videovard.sx/api/front/download', { method: 'POST', body: form });
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
        // Referer: 'https://videovard.sx/'
        /*
        https://content-videovard-delivery-s11.videovard.to/ivs5xbbyvrypab7wfunyx5jigwrb6jlkxmh4e36xwwj3vpzp34p22zl4d2pa/e6740d0dc7acb5b1e853041fe2f5e774.mp4

        https://content-videovard-delivery-s11.videovard.to/drm/hls/,ivs5xbbyvrypab7wfunyx5jigwrb6jlkxmh4e36xwwj37pzp34p7pk2vdfaa,.urlset/master.m3u8
        => https://content-videovard-delivery-s11.videovard.to/drm/hls/ivs5xbbyvrypab7wfunyx5jigwrb6jlkxmh4e36xwwj37pzp34p7pk2vdfaa/index-v1-a1.m3u8
        */
    }
}