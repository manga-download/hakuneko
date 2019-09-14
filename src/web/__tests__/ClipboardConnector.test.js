// jest and its implementation of require has no support for es6 modules yet ...
//import ClipboardConnector from '../mjs/connectors/system/ClipboardConnector.mjs';

jest.mock('electron');
const electron = require('electron');

describe.skip('ClipboardConnector', function() {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        //
    });

    describe('getMangas', function() {
        it('should provide empty manga list on initialization', done => {
            electron.clipboard.readText.mockReturnValueOnce('http://mangadex.org/a/b');
            let testee = new ClipboardConnector();
            testee.getMangas((error, mangas) => {
                expect(error).toEqual(null);
                expect(mangas).toEqual([]);
                expect(electron.clipboard.readText).toHaveBeenCalledTimes(0);
                done();
            });
            //expect(electron.clipboard.readText).toHaveBeenCalledTimes(1);
            //expect(electron.clipboard.readText).toHaveBeenLastCalledWith('...');
        });

        it('should provide cached manga list', done => {
            //electron.clipboard.readText.mockReturnValueOnce('http://mangadex.org/a/b');
            let testee = new ClipboardConnector();
            let expected = [1, 2, 3];
            testee.mangaCache = expected;
            testee.getMangas((error, mangas) => {
                expect(error).toEqual(null);
                expect(mangas).toEqual(expected);
                expect(electron.clipboard.readText).toHaveBeenCalledTimes(0);
                done();
            });
        });
    });
});