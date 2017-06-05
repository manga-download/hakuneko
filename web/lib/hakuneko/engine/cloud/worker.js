var queue = [];
var mutex = [];

onmessage = function( e ) {
    console.log('<WORKER>', 'RECEIVED', e.data, e);

    let opcode = 'ADD_DOWNLOAD';
    let job = e.data;

    if( opcode === 'ADD_DOWNLOAD' ) {
        if( !queue[job.id.connector] ) {
            queue[job.id.connector] = [];
        }
        queue[job.id.connector].push( job );
        postMessage( job );
    }
}

function download() {
    // find a connector in queue that has downloads available and is not locked
    for( let connectorID in queue ) {
        // check if queue is not empty
        if( queue[connectorID].length > 0 ) {
            // emulate download start
            let job = queue[connectorID].shift();
            job.status = 'downloading';//DownloadStatus.downloading;
            postMessage( job );

            // emulate download process
            for( let t=750; t<5000; t+=750) {
                setTimeout( () => {
                    job.progress += 1.0/6.0;
                    postMessage( job );
                }, t );
            }

            // emulate download finished
            setTimeout( () => {
                job.progress = 1.0;
                job.status = 'completed';//DownloadStatus.completed;
                postMessage( job );
                this.queue[connectorID].locked = false;
            }, 5000 );
        }
    }
}

setInterval( download, 500 );
