/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

class HakunekoChapters extends Polymer.Element {
    /**
     *
     */
    static get is() {
        return "hakuneko-chapters";
    }

    /**
     *
     */
    static get properties() {
        return {
            selectedConnector: {
                type: Object,
                value: undefined,
                observer: "onSelectedConnectorChanged",
            },
            selectedManga: {
                type: Object,
                value: undefined,
                observer: "onSelectedMangaChanged",
            },
            selectedChapter: {
                type: Object,
                notify: true,
                value: undefined,
                observer: "onSelectedChapterChanged",
            },
        };
    }

    /**
     *
     */
    ready() {
        super.ready();
        // the bookmark connector which is required for some exceptional handling
        this.bookmarkConnectorID = "bookmarks";
        this.clipboardConnectorID = "clipboard";
        // load settings in case UI was not ready when the settings were loaded and event was fired
        this.readerEnabled = Engine.Settings.readerEnabled.value;
        //
        this.sort = {
            none: null,
            asc: Symbol(),
            desc: Symbol(),
        };
        // sort direction and type used for chapter list
        this.chapterSort = this.sort.none;
        // list of all available chapters
        this.chapterList = undefined;
        // list of all existing languages in the chapter list
        this.languageList = undefined;
        // the chapter that has been marked as last read by the user
        this.markedChapter = undefined;

        Engine.Settings.addEventListener(
            "saved",
            this.onSettingsSaved.bind(this)
        );
        document.addEventListener(
            EventListener.onChapterStatusChanged,
            this.onChapterStatusChanged.bind(this)
        );
        window.addEventListener(
            "chapterUp",
            this.onRequestChapterUp.bind(this)
        );
        window.addEventListener(
            "chapterDown",
            this.onRequestChapterDown.bind(this)
        );
        Engine.ChaptermarkManager.addEventListener(
            "changed",
            this.onChaptermarksChanged.bind(this)
        );
    }

    /**
     *
     */
    getAppearance() {
        let appearance = "";
        appearance +=
            localStorage.getItem("themeColor") !== null
                ? `${localStorage.getItem("themeColor")}`
                : "";

        appearance +=
            localStorage.getItem("corner") !== null
                ? ` ${localStorage.getItem("corner")}`
                : "";

        return appearance;
    }

    /**
     * Observer will be executed, whenever the 'selectedConnector' is changed.
     */
    onSelectedConnectorChanged(connector) {
        //console.log( connector.id );
        this.set("selectedChapter", undefined);
    }

    /**
     * Observer will be executed, whenever the 'selectedConnector' is changed.
     */
    onSelectedMangaChanged(manga) {
        this.set("selectedChapter", undefined);
        this.set("chapterList", undefined);
        if (!this.selectedConnector || !manga) {
            return;
        }
        // load marked chapter for this manga
        this.onChaptermarksChanged(undefined);
        // load chapterlist
        let statusID = this.$.status.addToQueue(
            "Loading chapter list (" + manga.title + ")"
        );
        manga.getChapters((error, chapters) => {
            // only apply chapters when selected manga has not changed
            if (manga === this.selectedManga) {
                this.set("chapterList", chapters);
                // extract languages from chapters and use a set to remove duplicates
                this.languageList = Array.from(
                    new Set(
                        chapters
                            .map((chapter) => {
                                return chapter.language;
                            })
                            .filter((lng) => !!lng)
                            .sort()
                    )
                );
                this.searchLanguage = undefined;
            }
            this.$.status.removeFromQueue(statusID);
        });
    }

    /**
     *
     */
    getSortClass(chapterSort) {
        switch (chapterSort) {
            case this.sort.asc:
                return "mdi-sort-alphabetical-descending-variant";
            case this.sort.desc:
                return "mdi-sort-alphabetical-ascending-variant";
            default:
                return "mdi-sort-alphabetical-variant";
        }
    }

    /**
     *
     */
    getChapterClass(selectedChapter, id) {
        return !selectedChapter || selectedChapter.id !== id ? "" : "focus";
    }

    /**
     *
     */
    getChapterDownloadTooltip(status) {
        switch (status) {
            case "unavailable":
                return "Chapter is not available";
            case "offline":
                return "OFFLINE\nThe chapter is only accessable from the manga directory";
            case "available":
                return "AVAILABLE\nClick to download chapter";
            case "queued":
                return "QUEUED\nClick to remove chapter from download manager";
            case "downloading":
                return "DOWNLOADING";
            case "completed":
                return "DOWNLOADED\nClick to delete and re-download chapter";
            case "failed":
                return "DOWNLOAD FAILED\nCheck the exclamation mark in the joblist for details\nClick to delete and re-download the chapter";
            default:
                return "No tooltip available!";
        }
    }

    /**
     *
     */
    getChapterDownloadClass(status) {
        switch (status) {
            case "unavailable":
                return "mdi-alert-decagram";
            case "offline":
                return "mdi-folder buttonOffline";
            case "available":
                return "mdi-cloud-outline buttonAvailable";
            case "queued":
                return "mdi-cloud-download-outline buttonQueued";
            case "downloading":
                return "mdi-cloud-download-outline buttonDownloading";
            case "completed":
                return "mdi-folder-open buttonCompleted";
            case "failed":
                return "mdi-alert-decagram buttonFailed";
            default:
                return "";
        }
    }

    /**
     *
     */
    existChaptermarkForChapters(markedChapter, chapterList) {
        return (
            markedChapter &&
            chapterList &&
            !chapterList.find((chapter) =>
                Engine.ChaptermarkManager.isChapterMarked(
                    chapter,
                    markedChapter
                )
            )
        );
    }

    /**
     *
     */
    getChapterMarkTooltip(markedChapter, chapter) {
        return Engine.ChaptermarkManager.isChapterMarked(chapter, markedChapter)
            ? 'Remove the "recently read" marker from this chapter'
            : 'Mark this chapter as "recently read"';
    }

    /**
     *
     */
    getChapterMarkClass(markedChapter, chapter) {
        return Engine.ChaptermarkManager.isChapterMarked(chapter, markedChapter)
            ? "mdi-bookmark-check markerActive"
            : "mdi-bookmark-outline markerInactive";
    }

    /**
     *
     */
    getPagePreviewStyle(readerEnabled) {
        return readerEnabled ? "" : "display: none;";
    }

    /**
     * Determine chapter status and execute the corresponding action
     */
    async onProcessChapterClick(e) {
        let chapter = e.model.item;
        switch (chapter.status) {
            case "unavailable":
                alert("No action available!");
                break;
            case "offline":
                alert("No action available!");
                break;
            case "available":
                Engine.DownloadManager.addDownload(chapter);
                break;
            case "completed":
                if (await confirm("Re-download existing chapter?")) {
                    Engine.DownloadManager.addDownload(chapter);
                }
                break;
            case "failed":
                Engine.DownloadManager.addDownload(chapter);
                break;
            default:
                alert("No action available!");
                break;
        }
    }

    /**
     * Add all chapters currently visible (filtered) with status available to the download manager
     */
    async onDownloadChaptersClick(e) {
        if (!this.chapterList || this.chapterList.length < 1) {
            return;
        }
        // clone list for in-place sorting
        let chapterList = this.chapterList.slice();
        let sortFunction = this.sortChapters(this.chapterSort);
        if (sortFunction) {
            chapterList.sort(sortFunction);
        }
        let filterFunction = this.filterChapters(
            this.searchPattern,
            this.searchLanguage
        );
        if (filterFunction) {
            chapterList = chapterList.filter(filterFunction);
        }
        chapterList = chapterList.filter((chapter) => {
            return chapter.status === "available";
        });
        if (
            chapterList.length > 0 &&
            await confirm(
                "Download " +
                    chapterList.length +
                    " new chapter(s) from the current chapter list?"
            )
        ) {
            chapterList.forEach((chapter) => {
                Engine.DownloadManager.addDownload(chapter);
            });
        }
    }

    /**
     *
     */
    onToggleSortClick(e) {
        switch (this.chapterSort) {
            case this.sort.none:
                this.set("chapterSort", this.sort.asc);
                break;
            case this.sort.asc:
                this.set("chapterSort", this.sort.desc);
                break;
            case this.sort.desc:
                this.set("chapterSort", this.sort.none);
                break;
            default:
                this.set("chapterSort", this.sort.none);
                break;
        }
    }

    /**
     * Select a chapter => this will trigger the pages to be viewed.
     */
    onSelectChapterClick(e) {
        if (!e.model || !e.model.item) {
            return;
        }
        this.set("selectedChapter", e.model.item);
    }

    /**
     *
     */
    onUnmarkChapterClick(event) {
        Engine.ChaptermarkManager.deleteChaptermark(this.markedChapter);
    }

    /**
     *
     */
    onMarkChapterClick(e) {
        if (!e.model || !e.model.item) {
            return;
        }
        let chapter = e.model.item;
        if (
            Engine.ChaptermarkManager.isChapterMarked(
                chapter,
                this.markedChapter
            )
        ) {
            Engine.ChaptermarkManager.deleteChaptermark(this.markedChapter);
        } else {
            Engine.ChaptermarkManager.addChaptermark(chapter);
        }
    }

    /**
     *
     */
    onChaptermarksChanged(e) {
        let chaptermark = Engine.ChaptermarkManager.getChaptermark(
            this.selectedManga
        );
        this.set("markedChapter", chaptermark);
    }

    /**
     * Observer will be executed, whenever the 'selectedChapter' is changed.
     */
    onSelectedChapterChanged(chapter) {
        //
    }

    /**
     *
     */
    onShowFileManagerClick(e) {
        //e.model.item.openInFileBrowser();
        Engine.Storage.showFolderContent(e.model.item);
    }

    /**
     *
     */
    onRequestChapterUp(e) {
        let chapter = e.detail;
        let chapterList = this.getFilteredAndSortedList();
        let index = chapterList.findIndex((c) => {
            return c === chapter;
        });
        if (index > 0) {
            this.selectedChapter = chapterList[index - 1];
        }
    }

    /**
     *
     */
    onRequestChapterDown(e) {
        //
        let chapter = e.detail;
        let chapterList = this.getFilteredAndSortedList();
        let index = chapterList.findIndex((c) => {
            return c === chapter;
        });
        if (index < chapterList.length - 1) {
            this.selectedChapter = chapterList[index + 1];
        }
    }

    /**
     *
     */
    filterChapters(pattern, language) {
        if (
            (!pattern || pattern.length < 1) &&
            (!language || language.length < 1)
        ) {
            return null;
        }
        return (chapter) => {
            let matchTitle;
            let regex = pattern ? pattern.split("/") : undefined;
            if (
                regex &&
                regex.length === 3 &&
                regex[0].length === 0 &&
                regex[1].length > 0
            ) {
                try {
                    matchTitle = new RegExp(regex[1], regex[2]).test(
                        chapter.title
                    );
                } catch (error) {
                    matchTitle = false;
                }
            } else {
                matchTitle =
                    !pattern ||
                    chapter.title.toLowerCase().indexOf(pattern.toLowerCase()) >
                        -1;
            }
            let chapterLanguage = chapter.language
                ? chapter.language.toLowerCase()
                : chapter.language;
            let matchLanguage =
                !language || language.toLowerCase() === chapterLanguage;
            return matchTitle && matchLanguage;
        };
    }

    /**
     *
     */
    sortChapters(chapterSort) {
        let collator = new Intl.Collator(undefined, {
            numeric: true,
            sensitivity: "base",
        });
        if (chapterSort === this.sort.asc) {
            return (a, b) => {
                return collator.compare(a.title, b.title);
            };
        }
        if (chapterSort === this.sort.desc) {
            return (a, b) => {
                return -1 * collator.compare(a.title, b.title);
            };
        }
        return null;
    }

    /**
     *
     */
    getFilteredAndSortedList() {
        let filterFunction = this.filterChapters(
            this.searchPattern,
            this.searchLanguage
        );
        let sortFunction = this.sortChapters(this.chapterSort);
        let chapterList = this.chapterList;
        chapterList = filterFunction
            ? chapterList.filter(filterFunction)
            : chapterList;
        chapterList = sortFunction
            ? chapterList.sort(sortFunction)
            : chapterList;
        return chapterList;
    }

    /**
     *
     */
    onSettingsSaved(e) {
        this.readerEnabled = Engine.Settings.readerEnabled.value;
        // chapter naming format may have been changed => reload chapter list
        if (this.selectedManga) {
            // use timeout to ensure chapter cache is cleared before list is reloaded
            setTimeout(
                (() => {
                    this.onSelectedMangaChanged(this.selectedManga);
                }).bind(this),
                0
            );
        }
    }

    /**
     *
     */
    onChapterStatusChanged(e) {
        let chapter = e.detail;
        if (
            !this.chapterList ||
            !this.selectedManga ||
            !this.selectedConnector ||
            this.selectedManga.id !== chapter.manga.id ||
            this.selectedConnector.id !== this.bookmarkConnectorID &&
                this.selectedConnector.id !== this.clipboardConnectorID &&
                this.selectedConnector.id !== chapter.manga.connector.id
        ) {
            return;
        }
        let index = this.chapterList.findIndex((item) => {
            // chapters may be different objects (reloading chapter list) but still be the equivalent
            // => comparing ids instead of comparing the objects directly
            return item.id === chapter.id;
        });
        if (index > -1) {
            this.notifyPath("chapterList." + index + ".status");
        }
    }
}
window.customElements.define(HakunekoChapters.is, HakunekoChapters);
