import Enums from './engine/Enums.mjs';
import Connector from './engine/Connector.mjs';
import ClipboardConnector from './connectors/system/ClipboardConnector.mjs';

import Blacklist from './engine/Blacklist.mjs';
import BookmarkImporter from './engine/BookmarkImporter.mjs';
import BookmarkManager from './engine/BookmarkManager.mjs';
import ChaptermarkManager from './engine/ChaptermarkManager.mjs';
import Connectors from './engine/Connectors.mjs';
import DownloadManager from './engine/DownloadManager.mjs';
//import HistoryWorker from './engine/HistoryWorker.mjs'
import Request from './engine/Request.mjs';
import Settings from './engine/Settings.mjs';
import Storage from './engine/Storage.mjs';

export default class HakuNeko {

    constructor(context) {
        // set global first, beause some of the engine classes access them during instantiation
        this._initializeGlobals(context);

        this._enums = Enums;

        this._blacklist = new Blacklist();
        this._bookmarkImporter = new BookmarkImporter();
        this._bookmarkManager = new BookmarkManager();
        this._chaptermarkManager = new ChaptermarkManager();
        this._downloadManager = new DownloadManager();
        this._request = new Request();
        this._connectors = new Connectors(this._request);
        this._settings = new Settings();
        this._storage = new Storage();
    }

    /**
     * Backward compatibility to expose various members and classes as globals to the given context.
     * This is required because the UI elements acess these globals directly instead of the engine.
     * @param context
     */
    _initializeGlobals(context) {
        // TODO: remove backward compatibility for global aliases when all their references are set to HakuNeko engine

        // required by various frontend and engine components
        context.Input = Enums.Input;
        context.EpisodeFormat = Enums.EpisodeFormat;
        context.ChapterFormat = Enums.ChapterFormat;
        context.HistoryFormat = Enums.HistoryFormat;
        context.DownloadStatus = Enums.DownloadStatus;
        context.EventListener = Enums.EventListener;

        // required by frontend/menu.html
        context.BookmarkImporter = BookmarkImporter;
        // required in frontende/bookmarks.html
        context.Connector = Connector;
        // required by frontend/mangas.html
        context.ClipboardConnector = ClipboardConnector;
    }

    async initialize() {
        await this._connectors.initialize();
    }

    get Blacklist() {
        return this._blacklist;
    }

    get BookmarkImporter() {
        return this._bookmarkImporter;
    }

    get BookmarkManager() {
        return this._bookmarkManager;
    }

    get ChaptermarkManager() {
        return this._chaptermarkManager;
    }

    get Connectors() {
        return this._connectors.list;
    }

    get DownloadManager() {
        return this._downloadManager;
    }

    get Enums() {
        return this._enums;
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
}