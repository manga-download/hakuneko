export default class Cookie {

    constructor(cookies) {
        this.list = {};
        (cookies || '').split(';')
            .filter(cookie => cookie.trim())
            .forEach(cookie => {
                let pair = cookie.split('=');
                this.set(pair.shift(), pair.join('='));
            });
    }

    toString() {
        return Object.keys(this.list)
            .filter(key => this.list[key] !== 'EXPIRED')
            .map(key => key + '=' + this.list[key])
            .join('; ');
    }

    get(key) {
        return this.list[key];
    }

    set(key, value) {
        this.list[key.toString().trim()] = value.toString().trim();
    }

    delete(key) {
        delete this.list[key];
    }

    merge(cookie) {
        let result = new Cookie();
        Object.keys(this.list).forEach(key => result.set(key, this.list[key]));
        if(cookie instanceof Cookie) {
            Object.keys(cookie.list).forEach(key => result.set(key, cookie.list[key]));
        }
        return result;
    }
}