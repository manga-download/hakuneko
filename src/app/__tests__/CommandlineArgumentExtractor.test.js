const CommandlineArgumentExtractor = require('../CommandlineArgumentExtractor.js');

describe('CommandlineArgumentExtractor', function() {

    describe('_get', function() {

        it('contains flag', () => {
            let testee = new CommandlineArgumentExtractor(['-a', '-b', '-c']);
            expect(testee._get('-b', true)).toEqual(true);
        });

        it('does not contain flag', () => {
            let testee = new CommandlineArgumentExtractor(['-a', '-b', '-c']);
            expect(testee._get('-x', true)).toEqual(false);
        });

        it('contains flag when followed by value', () => {
            let testee = new CommandlineArgumentExtractor(['-a', '-b', '1']);
            expect(testee._get('-b', true)).toEqual(true);
        });

        it('followed by value', () => {
            let testee = new CommandlineArgumentExtractor(['-a', '-b', 'x']);
            expect(testee._get('-b')).toEqual('x');
        });

        it('followed by option instead of value', () => {
            let testee = new CommandlineArgumentExtractor(['-a', '-b', '-c']);
            expect(testee._get('-b')).toEqual(undefined);
        });

        it('no value because at end', () => {
            let testee = new CommandlineArgumentExtractor(['-a', '-b', '-c']);
            expect(testee._get('-c')).toEqual(undefined);
        });

        it('assigned value', () => {
            let testee = new CommandlineArgumentExtractor(['-a', '-b=x', '-c']);
            expect(testee._get('-b')).toEqual('x');
        });

        it('assigned nothing', () => {
            let testee = new CommandlineArgumentExtractor(['-a', '-b=', '-c']);
            expect(testee._get('-b')).toEqual(undefined);
        });
    });

    describe('options when containing argument', function() {

        it('--update-url', () => {
            let expected = 'https://raw.gihub.com/manga-downloader/releases/0.4.0/latest';
            let testee = new CommandlineArgumentExtractor([`--update-url=${expected}`]);
            expect(testee.options.applicationUpdateURL).toEqual(expected);
        });

        it('-u', () => {
            let expected = 'https://raw.gihub.com/manga-downloader/releases/0.4.0/latest';
            let testee = new CommandlineArgumentExtractor(['-u', expected]);
            expect(testee.options.applicationUpdateURL).toEqual(expected);
        });

        it('--startup-url', () => {
            let expected = 'cache://hakuneko/index.html';
            let testee = new CommandlineArgumentExtractor([`--startup-url=${expected}`]);
            expect(testee.options.applicationStartupURL).toEqual(expected);
        });

        it('--cache-directory', () => {
            let expected = './cache';
            let testee = new CommandlineArgumentExtractor([`--cache-directory=${expected}`]);
            expect(testee.options.applicationCacheDirectory).toEqual(expected);
        });

        it('-c', () => {
            let expected = './cache';
            let testee = new CommandlineArgumentExtractor(['-c', expected]);
            expect(testee.options.applicationCacheDirectory).toEqual(expected);
        });

        it('--user-directory', () => {
            let expected = './user';
            let testee = new CommandlineArgumentExtractor([`--user-directory=${expected}`]);
            expect(testee.options.applicationUserDataDirectory).toEqual(expected);
        });
    });

    describe('options when missing argument', function() {

        it('--update-url', () => {
            let testee = new CommandlineArgumentExtractor([]);
            expect(testee.options.applicationUpdateURL).toEqual(undefined);
        });

        it('-u', () => {
            let testee = new CommandlineArgumentExtractor([]);
            expect(testee.options.applicationUpdateURL).toEqual(undefined);
        });

        it('--startup-url', () => {
            let testee = new CommandlineArgumentExtractor([]);
            expect(testee.options.applicationStartupURL).toEqual(undefined);
        });

        it('--cache-directory', () => {
            let testee = new CommandlineArgumentExtractor([]);
            expect(testee.options.applicationCacheDirectory).toEqual(undefined);
        });

        it('-c', () => {
            let testee = new CommandlineArgumentExtractor([]);
            expect(testee.options.applicationCacheDirectory).toEqual(undefined);
        });

        it('--user-directory', () => {
            let testee = new CommandlineArgumentExtractor([]);
            expect(testee.options.applicationUserDataDirectory).toEqual(undefined);
        });
    });

});