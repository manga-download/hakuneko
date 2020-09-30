/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

class HakunekoBookmarks extends Polymer.Element {
    /**
     *
     */
    static get is() {
        return "hakuneko-bookmarks";
    }

    /**
     *
     */
    static get properties() {
        return {
            selectedManga: {
                type: Object,
            },
        };
    }

    /**
     *
     */
    ready() {
        super.ready();
        // load bookmarks in case UI was not ready when the bookmarks were loaded and event was fired
        this.bookmarkList = Engine.BookmarkManager.bookmarks;
        // register callbacks for published events
        Engine.BookmarkManager.addEventListener(
            "changed",
            this.onBookmarksChanged.bind(this)
        );
    }

    /**
     *
     */
    getBookmarkClass(manga, trigger) {
        if (manga) {
            if (manga.connector instanceof Connector) {
                let index = this.bookmarkList.findIndex((bookmark) => {
                    return (
                        bookmark.key.manga === manga.id &&
                        bookmark.key.connector === manga.connector.id
                    );
                });
                if (index > -1) {
                    return "mdi-minus-circle bookmarkDelete";
                }
                return "mdi-plus-circle bookmarkAdd";
            } else {
                return "mdi-circle-off-outline bookmarkInvalid";
            }
        }
        return "";
    }

    /**
     *
     */
    getBookmarkTitle(manga, trigger) {
        if (manga) {
            if (manga.connector instanceof Connector) {
                let index = this.bookmarkList.findIndex((bookmark) => {
                    return (
                        bookmark.key.manga === manga.id &&
                        bookmark.key.connector === manga.connector.id
                    );
                });
                if (index > -1) {
                    return "Click to remove the selected manga from the bookmark list";
                }
                return "Click to add the selected manga to the bookmark list";
            } else {
                return `Cannot bookmark mangas from this ${manga.connector.label}!`;
            }
        }
        return "Please select a manga to use the bookmark feature";
    }

    /**
     *
     */
    processBookmark(e) {
        let manga = this.selectedManga;
        if (manga && manga.connector instanceof Connector) {
            let bookmark = this.bookmarkList.find((b) => {
                return (
                    b.key.manga === manga.id &&
                    b.key.connector === manga.connector.id
                );
            });
            if (bookmark) {
                Engine.BookmarkManager.deleteBookmark(bookmark);
            } else {
                Engine.BookmarkManager.addBookmark(manga);
            }
            return "Click to add the selected manga to bookmarks";
        }
    }

    /**
     *
     */
    onBookmarksChanged(e) {
        this.bookmarkList = e.detail;
        this.notifyPath("bookmarkList.length");
    }
}
window.customElements.define(HakunekoBookmarks.is, HakunekoBookmarks);
