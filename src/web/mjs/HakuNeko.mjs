import Enums from './hakuneko/Enums.mjs'
/*
<link rel="import" href="request.html">
<link rel="import" href="settings.html">
<link rel="import" href="storage.html">
<link rel="import" href="blacklist.html">
<link rel="import" href="history.html">
<link rel="import" href="downloader.html">
<link rel="import" href="connectors.html">
<link rel="import" href="bookmarks.html">
<link rel="import" href="chaptermarks.html">
*/

export default class HakuNeko {

    constructor() {
        this._enums = Enums;
        //this._connectorList = new Connectors().list;
        //this._downloadManager = new DownloadManager();
        //this._bookmarkManager = new BookmarkManager();
        //this._chaptermarkManager = new ChaptermarkManager();
        //this._request = new RequestElectron();
        //this._settings = new Settings();
        //this._storage = new Storage();
        //this._blacklist = new Blacklist();
    }

    get Enums() {
        return this._enums;
    }
    /*
    get Connectors() {
        return this._connectorList;
    }

    get DownloadManager() {
        return this._downloadManager;
    }

    get BookmarkManager() {
        return this._bookmarkManager;
    }

    get ChaptermarkManager() {
        return this._chaptermarkManager;
    }

    get Request() {
        return this._request;
    }

    get Settings() {
        return this._settings;
    }

    get Storage() {
        return this._storage;
    }

    get Blacklist() {
        return this._blacklist;
    }
    */
}