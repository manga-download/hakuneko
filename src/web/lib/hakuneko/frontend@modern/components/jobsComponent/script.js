/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

class HakunekoJobs extends Polymer.Element {
    /**
     *
     */
    static get is() {
        return "hakuneko-jobs";
    }

    /**
     *
     */
    static get properties() {
        return {
            settings: {
                type: Object,
                value: undefined,
                notify: true, // enable upward data flow,
                //readOnly: true, // prevent downward data flow
                //observer: 'onSelectedMangaChanged'
            },
        };
    }

    /**
     *
     */
    ready() {
        super.ready();
        // HACK: electron specific code should not be added to UI elements, but due to the
        //       close confirmation bug this workaround is currently the best solution...
        this.ipc = require("electron").ipcRenderer;
        this.popupVisibility = false;
        this.jobList = [];
        // register callbacks for events published by download manager
        Engine.DownloadManager.addEventListener(
            "updated",
            this.onDownloadStatusUpdated.bind(this)
        );
        this.ipc.on("close", this.onClose.bind(this));
    }

    /**
     *
     */
    roundValue(value, rounder) {
        return parseFloat(value).toFixed(rounder);
    }

    /**
     *
     */
    toggleJobList() {
        this.set("popupVisibility", !this.popupVisibility);
    }

    /**
     * CSS class for the job list.
     * The CSS class depends on the current visibility state.
     */
    getListClass(visibility) {
        return visibility ? "show" : "hide";
    }

    /**
     * CSS class for the show/hide button of the job list.
     * The CSS class depends on the current visibility state.
     */
    getButtonClass(visibility) {
        return visibility ? "mdi-close-box" : "mdi-download-multiple"; // fa-tasks
    }

    /**
     * CSS class for the status of a job in the job list.
     * The CSS class depends on the curent status of the job.
     */
    getStatusClass(status) {
        switch (status) {
            //case 'unavailable':
            //    return 'fa-exclamation-triangle';
            //case 'available':
            //    return 'fa-cloud';
            case "queued":
                return "mdi-progress-clock buttonQueued";
            case "downloading":
                return "mdi-transfer buttonDownloading";
            case "completed":
                return "mdi-check-circle button buttonCompleted";
            case "failed":
                return "mdi-alert-decagram button buttonFailed";
            default:
                return "";
        }
    }

    /**
     *
     */
    getErrorTitle(errors) {
        return (
            (errors && errors.length > 0 ? `${this.i18n('jobs.re_download')}\n` : "") +
            errors
                .map((error) => {
                    return error.toString();
                })
                .join("\n")
        );
    }

    /**
     *
     */
    restartDownload(e) {
        let job = e.model.item;
        if (job.status === "failed" || job.status === "completed") {
            Engine.DownloadManager.addDownload(job.chapter);
        }
    }

    /**
     *
     */
    onDownloadStatusUpdated(e) {
        let job = e.detail;
        let index = this.jobList.indexOf(job);
        if (index > -1) {
            // force an UI update of the changed job
            this.notifyPath("jobList." + index + ".status");
            this.notifyPath("jobList." + index + ".progress");
            if (job.status === "completed") {
                this.splice("jobList", index, 1);
            }
            if (
                job.status === "failed" &&
                job.errors &&
                job.errors.length > 0
            ) {
                this.notifyPath("jobList." + index + ".errors");
            }
        } else {
            // remove similar job that failed
            let position = this.jobList.findIndex((item) => {
                return job.isSame(item);
            });
            if (position > -1 && this.jobList[position].status === "failed") {
                this.splice("jobList", position, 1);
            }
            // add new job
            if (job.status === "queued" || job.status === "downloading") {
                this.push("jobList", job);
            }
        }
    }

    /**
     *
     */
    async onClose(event) {
        // check if any job is running
        let index = this.jobList.findIndex((job) => {
            return job.status === "queued" || job.status === "downloading";
        });
        if (
            index < 0 ||
            await confirm(
                `${this.i18n('jobs.download_in_progress')}\n${'jobs.close_application_anyway'}`
            )
        ) {
            this.ipc.send("quit");
        }
    }

    /**
    * 
    */
    i18n(key, def) {
        return Engine.I18n.translate(key, def);
    }
}
window.customElements.define(HakunekoJobs.is, HakunekoJobs);
