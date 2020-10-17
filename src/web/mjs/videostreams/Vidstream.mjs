import MyCloud from './MyCloud.mjs';

export default class Vidstream extends MyCloud {

    constructor(url, referer, fetchRegex) {
        super(url.replace('/e/', '/embed/'), referer, fetchRegex);
    }
}