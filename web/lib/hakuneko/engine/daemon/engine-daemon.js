/**
 *
 */
class Settings extends SettingsBase {

    /**
     * Declare settings unique to the cloud engine
     */
    static initialize() {
        //
    }
}
Settings.initialize();

/**
 *
 */
class Request extends RequestBase {
    /**
     *
     */
    static get( url, referer, agent, callback ) {
        //
    }
}

/**
 *
 */
class Storage extends StorageBase {

    /**
     * Directory chooser not supported for cloud engine
     */
    static folderBrowser( rootPath ) {
        return undefined;
    }

    /**
     * Determine status for each manga in the given list and add a field to the manga with the corresponding status
     */
    static applyMangaStatus( connector, mangas ) {
        mangas.forEach( ( manga ) => {
            //manga['status'] = 'completed';
        });
    }

    /**
     *
     */
    static applyChapterStatus( connector, manga, chapters ) {
        chapters.forEach( ( chapter ) => {
            //chapter['status'] = 'completed';
        });
    }

    /**
     *
     */
    static saveChapter( connector, manga, chapter ) {
        console.log( 'Storage::saveChapter', connector.label, manga.title, chapter.title );
    }
}

/**
 *
 */
class DownloadManager extends DownloadManagerBase {
    //
}
