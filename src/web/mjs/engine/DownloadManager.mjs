import DownloadJob from './DownloadJob.mjs';

const statusDefinitions = {
    queued: 'queued', // chapter/manga that is queued for download to the users device
};

export default class DownloadManager extends EventTarget {

    constructor() {
        super();
        this.queue = [];
        this.worker = setInterval( this.processQueue.bind( this ), 250 );
    }

    /**
     * Add a new job to the download queue.
     */
    addDownload( chapter ) {
        let manga = chapter.manga;
        let connector = manga.connector;

        if( !this.queue[connector.id] ) {
            this.queue[connector.id] = [];
            this.queue[connector.id].activeCount = 0;
        }
        // create a job for the chapter and add the job to the download queue (if not already exist)
        let job = new DownloadJob( chapter );
        let jobExist = this.queue[connector.id].find( ( item ) => {
            return job.isSame( item );
        });
        if( !jobExist ) {
            // cannot dispatch the same event twice => create new event
            job.addEventListener('updated', evt => this.dispatchEvent(new CustomEvent(evt.type, evt)));
            this.queue[connector.id].push( job );
            job.setStatus( statusDefinitions.queued );
        }
    }

    /**
     *
     */
    processQueue() {
        // find a connector in queue that has downloads available and is not locked
        for( let connectorID in this.queue ) {
            // check if queue is not empty, there are no active jobs for this connector and the connector is not locked internally through other requests
            if( this.queue[connectorID].length > 0 && this.queue[connectorID].activeCount < 1 && !this.queue[connectorID][0].chapter.manga.connector.isLocked ) {
                this.queue[connectorID].activeCount++;
                let job = this.queue[connectorID].shift();
                job.downloadPages( '', () => {
                    this.queue[connectorID].activeCount--;
                });
            }
        }
    }
}