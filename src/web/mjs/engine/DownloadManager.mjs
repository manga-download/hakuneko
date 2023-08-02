import DownloadJob from './DownloadJob.mjs';

const statusDefinitions = {
    queued: 'queued', // chapter/manga that is queued for download to the users device
};

export default class DownloadManager extends EventTarget {

    constructor() {
        super();
        this.queue = [];
        this.worker = setInterval( this.processQueue.bind( this ), 250 );
        this.queuePaused = false;
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
     * Returns true if the download queue is paused.
     */
    isQueuePaused() {
        return this.queuePaused;
    }

    /**
     * Pause the download queue processing.
     */
    pauseQueue() {
        this.queuePaused = true;
    }

    /**
     * Start the download queue processing if it was paused.
     */
    startQueue() {
        this.queuePaused = false;
        this.processQueue(); // Start processing the queue again
    }

    /**
     * Remove a job from the download queue.
     * @param job
     */
    removeFromQueue(job) {
        if (!job) return;

        const connectorID = job.chapter.manga.connector.id;
        const index = this.queue[connectorID].indexOf(job);
        if (index !== -1) {
            this.queue[connectorID].splice(index, 1);
            job.setStatus(job.initialStatus);
        }
    }

    /**
     *
     */
    processQueue() {
        // find a connector in queue that has downloads available and is not locked
        for( let connectorID in this.queue ) {
            if (this.isQueuePaused()) {
                break;
            }

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

    /**
     * Clear the download queue.
     */
    clearQueue() {
        for (let connectorID in this.queue) {
            const jobs = this.queue[connectorID];
            for (let i = jobs.length - 1; i >= 0; i--) {
                const job = jobs[i];
                job.setStatus(job.initialStatus);
                jobs.splice(i, 1);
            }
        }
    }
}