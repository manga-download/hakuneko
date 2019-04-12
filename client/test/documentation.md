[TOC]

# Test Documentation

...

## Offline Cache

A test script for base functionality exists in the test directory. The test script can be executed with electron `electron cache_test.js` and the result is printed to the command-line output. The correctness of the operating system depending  cache directory must be validated manually with a HakuNeko installation package.

| System             | Offline Cache Directory                |
| ------------------ | -------------------------------------- |
| Linux              | ~/.cache/hakuneko-desktop              |
| MacOS              | ~/Library/Caches/hakuneko-desktop      |
| Windows (Setup)    | ~\AppData\Local\hakuneko-desktop\cache |
| Windows (Portable) | %APPLICATION%\cache                    |

The following test cases are covered by the test script `cache_test.js`. The generated mock data described in the test cases is also included in the test script.

### Case 01:

**Test the behavior of the application when the offline cache is empty and no internet connection is available.**

1. *Ensure the cache directory is empty, if not clear the content of the folder*
2. *Make sure the internet connection is not available*
3. *Start the application from a terminal*

The application shall start with a white window and the terminal shall show an error message.

### Case 02:

**Test the behavior of the application when the offline cache is empty and an internet connection is available.**

1. *Ensure the cache directory is empty, if not clear the content of the folder*
2. *Make sure the internet connection is available*
3. *Start the application from a terminal*

The application shall update the offline cache and start without any error.

### Case 03:

**Test the behavior of the application when the offline cache is valid and no internet connection is available.**

1. *Ensure the cache directory is not empty, if not update with a working internet connection*
2. *Make sure the internet connection is not available*
3. *Start the application from a terminal*

The application shall not delete the offline cache and start without any error.

### Case 04:

**Test the behavior of the application when the offline cache is outdated and an internet connection is available**

1. *Ensure the cache directory is not empty, if not update with a working internet connection*
2. *Modify the version file in the cache directory with any text editor*
3. *Make sure the internet connection is available*
4. *Start the application from a terminal*

The application shall update the offline cache and the version must be the [latest](http://hakuneko.ovh/latest).

#### Case 05:

**Test the behavior of the application when the host provides an invalid archive with a valid signature**

1. *Ensure the cache directory is not empty, if not update with a working internet connection*

2. *Create an invalid archive with a valid signature*

   ```shell
   ZIP="invalid.zip"
   KEY=../../web/hakuneko.key
   openssl rand 8192 > $ZIP
   echo -n $ZIP?signature=$(openssl dgst -sha256 -hex -sign $KEY $ZIP | cut -d' ' -f2) > latest
   ```

3. *Launch a HTTP webserver in the folder where the zip archive and the signature were created*

   ```shell
   cd path/to/folder
   polymer serve
   ```

4. *Start the application from a terminal with the --url argument pointing to the signature of the local HTTP webserver (e.g. `http://127.0.0.1:8081/latest`)*

The application shall not update the offline cache and start normally, but showing an error in the terminal during startup.

### Case 06:

**Test the behavior of the application when the host provides a valid archive with an invalid signature**

1. *Ensure the cache directory is not empty, if not update with a working internet connection*

2. *Create a valid archive with an invalid signature*

   ```shell
   ZIP="valid.zip"
   KEY=../../web/hakuneko.key
   curl "http://hakuneko.ovh/$(curl http://hakuneko.ovh/latest)" > $ZIP
   echo -n $ZIP?signature=$(openssl rand -hex 256) > latest
   ```

3. *Launch a HTTP webserver in the folder where the zip archive and the signature were created*

   ```shell
   cd path/to/folder
   polymer serve
   ```

4. *Start the application from a terminal with the --url argument pointing to the signature of the local HTTP webserver (e.g. `http://127.0.0.1:8081/latest`)*


The application shall not update the offline cache and start normally, but showing an error in the terminal during startup.
