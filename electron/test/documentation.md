[TOC]

# Test Documentation

...

## Automated Tests

NOT AVAILABLE

## Manual Tests

Manual test must be executed individually by a developer. A test [protocol](#Protocols) may summarize the results of the tests and test cases. A release shall only be published when all tests have been passed without any failure.

### Offline Cache

Since the offline cache directory is system dependent, the test schedule must be executed for all packages:

| System             | Offline Cache Directory            |
| ------------------ | ---------------------------------- |
| Linux              | ~/.cache/hakuneko-desktop          |
| MacOS              | ~/Library/Caches/hakuneko-desktop  |
| Windows (Setup)    | ~\AppData\Roaming\hakuneko-desktop |
| Windows (Portable) | %APPLICATION%\cache                |

#### Prerequisite for all Cases

1. The package that should be tested must be installed/extracted on the test system
2. The test cases must be conducted in the correct order to ensure the offline cache is in the correct state

#### Case 01:

**Test the behavior of the application when the offline cache is empty and no internet connection is available.**

1. *Ensure the cache directory is empty, if not clear the content of the folder*
2. *Make sure the internet connection is not available*
3. *Start the application from a terminal*

The application shall start with a white window and the terminal shall show an error message.

#### Case 02:

**Test the behavior of the application when the offline cache is empty and an internet connection is available.**

1. *Ensure the cache directory is empty, if not clear the content of the folder*
2. *Make sure the internet connection is available*
3. *Start the application from a terminal*

The application shall update the offline cache and start without any error.

#### Case 03:

**Test the behavior of the application when the offline cache is valid and no internet connection is available.**

1. *Ensure the cache directory is not empty, if not update with a working internet connection*
2. *Make sure the internet connection is not available*
3. *Start the application from a terminal*

The application shall not delete the offline cache and start without any error.

#### Case 04:

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

#### Case 06:

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

## Protocols

### Offline Cache

Revision: #1234567890

| Test Case            | Win (Setup) | Win (Portable) | Linux | MacOS |
| -------------------- | ----------- | -------------- | ----- | ----- |
| [Case 01](#Case 01:) |             |                |       |       |
| [Case 02](#Case 02:) |             |                |       |       |
| [Case 03](#Case 03:) |             |                |       |       |
| [Case 04](#Case 04:) |             |                |       |       |
| [Case 05](#Case 05:) |             |                |       |       |
| [Case 06](#Case 06:) |             |                |       |       |

