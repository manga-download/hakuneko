const formats = {
    none: '',
    json: '.json',
    csv:  '.csv'
};

const statusDefinitions = {
    completed: 'completed', // chapter/manga that already exist on the users device
};

export default class HistoryWorker {

    // TODO: use dependency injection instead of globals for Engine.Settings, Enums
    constructor() {
        /*
         *document.addEventListener( EventListener.onChapterStatusChanged, this.onChapterStatusChanged.bind( this ) ); // => Chapter object
         *document.addEventListener( EventListener.onDownloadStatusUpdated, this.onDownloadStatusUpdated.bind( this ) ); // => Job object
         */
    }

    /**
     *
     */
    onDownloadStatusUpdated( evt ) {
        let job = evt.detail;
        if( job.status === statusDefinitions.completed) {
            let entry = {
                website: job.labels.connector,
                manga: job.labels.manga,
                chapter: job.labels.chapter,
                status: job.status
            };
            this.appendEntry( entry );
        }
    }

    /**
     *
     */
    appendEntry( data ) {
        let entry = Object.assign( { _time: new Date().toISOString() }, data );
        if( Engine.Settings.downloadHistoryLogFormat.value !== formats.none ) {
            console.log( 'Log Download History:', Engine.Settings.downloadHistoryLogFormat.value );
            console.log( JSON.stringify( entry ) );
        }
    }
}