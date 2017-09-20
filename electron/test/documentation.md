[TOC]

# Test Documentation

...

## Automated Tests

NOT AVAILABLE

## Manual Tests

Manual test must be executed individually by a developer. A test protocol may summarize the results of the tests and test cases. A release shall only be published when all tests have been passed without any failure.

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








Behaviour with broken archive (but valid signature)
=>
Behaviour with old cache, internet connection and invalid signature