const assert = require('assert');
const CommandlineArgumentExtractor = require('../../src/app/CommandlineArgumentExtractor.js');

describe('CommandlineArgumentExtractor', function() {

    describe('_get', function() {

        it('contains flag', () => {
            let testee = new CommandlineArgumentExtractor(['-a', '-b', '-c']);
            assert.equal(testee._get('-b', true), true);
        });

        it('does not contain flag', () => {
            let testee = new CommandlineArgumentExtractor(['-a', '-b', '-c']);
            assert.equal(testee._get('-x', true), false);
        });
        
        it('contains flag when followed by value', () => {
            let testee = new CommandlineArgumentExtractor(['-a', '-b', '1']);
            assert.equal(testee._get('-b', true), true);
        });
        
        it('followed by value', () => {
            let testee = new CommandlineArgumentExtractor(['-a', '-b', 'x']);
            assert.equal(testee._get('-b'), 'x');
        });
        
        it('followed by option instead of value', () => {
            let testee = new CommandlineArgumentExtractor(['-a', '-b', '-c']);
            assert.equal(testee._get('-b'), undefined);
        });
        
        it('no value because at end', () => {
            let testee = new CommandlineArgumentExtractor(['-a', '-b', '-c']);
            assert.equal(testee._get('-c'), undefined);
        });
        
        it('assigned value', () => {
            let testee = new CommandlineArgumentExtractor(['-a', '-b=x', '-c']);
            assert.equal(testee._get('-b'), 'x');
        });
        
        it('assigned nothing', () => {
            let testee = new CommandlineArgumentExtractor(['-a', '-b=', '-c']);
            assert.equal(testee._get('-b'), undefined);
        });
    });

    describe('options when containing argument', function() {

        it('--update-url', () => {
            let expected = 'https://raw.gihub.com/manga-downloader/releases/0.4.0/latest';
            let testee = new CommandlineArgumentExtractor([`--update-url=${expected}`]);
            assert.equal(testee.options.applicationUpdateURL, expected);
        });

        it('-u', () => {
            let expected = 'https://raw.gihub.com/manga-downloader/releases/0.4.0/latest';
            let testee = new CommandlineArgumentExtractor(['-u', expected]);
            assert.equal(testee.options.applicationUpdateURL, expected);
        });

        it('--startup-url', () => {
            let expected = 'cache://hakuneko/index.html';
            let testee = new CommandlineArgumentExtractor([`--startup-url=${expected}`]);
            assert.equal(testee.options.applicationStartupURL, expected);
        });

        it('--cache-directory', () => {
            let expected = './cache';
            let testee = new CommandlineArgumentExtractor([`--cache-directory=${expected}`]);
            assert.equal(testee.options.applicationCacheDirectory, expected);
        });

        it('-c', () => {
            let expected = './cache';
            let testee = new CommandlineArgumentExtractor(['-c', expected]);
            assert.equal(testee.options.applicationCacheDirectory, expected);
        });

        it('--user-directory', () => {
            let expected = './user';
            let testee = new CommandlineArgumentExtractor([`--user-directory=${expected}`]);
            assert.equal(testee.options.applicationUserDataDirectory, expected);
        });
    });

    describe('options when missing argument', function() {

        it('--update-url', () => {
            let testee = new CommandlineArgumentExtractor([]);
            assert.equal(testee.options.applicationUpdateURL, undefined);
        });

        it('-u', () => {
            let testee = new CommandlineArgumentExtractor([]);
            assert.equal(testee.options.applicationUpdateURL, undefined);
        });

        it('--startup-url', () => {
            let testee = new CommandlineArgumentExtractor([]);
            assert.equal(testee.options.applicationStartupURL, undefined);
        });

        it('--cache-directory', () => {
            let testee = new CommandlineArgumentExtractor([]);
            assert.equal(testee.options.applicationCacheDirectory, undefined);
        });

        it('-c', () => {
            let testee = new CommandlineArgumentExtractor([]);
            assert.equal(testee.options.applicationCacheDirectory, undefined);
        });

        it('--user-directory', () => {
            let testee = new CommandlineArgumentExtractor([]);
            assert.equal(testee.options.applicationUserDataDirectory, undefined);
        });
    });

});