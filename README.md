![master](https://github.com/semyonf/wallace-apple-dictionary/actions/workflows/ci.yml/badge.svg?branch=master)
[![Test Coverage](https://api.codeclimate.com/v1/badges/a6c5b5bd1a51e4472891/test_coverage)](https://codeclimate.com/github/semyonf/wallace-apple-dictionary/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/a6c5b5bd1a51e4472891/maintainability)](https://codeclimate.com/github/semyonf/wallace-apple-dictionary/maintainability)

## macOS Dictionary scraped from David Foster Wallace Wiki : Infinite Jest

![context](https://github.com/semyonf/wallace-apple-dictionary/blob/master/readme-resources/demo.gif)

### Installation:

1. Download the latest `Wallace.Dictionary.dictionary.zip` from [releases](https://github.com/semyonf/wallace-apple-dictionary/releases) (under 'Assets')
2. Extract and move the extracted `.dictionary`-direcory to `~/Library/Dictionaries`, enable it in your Dictionary.app

### Building from source:

1. Install Node.js version 16 (required to parse fresh annotations from the website)
2. Run `npm i && make`
3. Run `make install` to add the dictionary

![dictionary search by page](https://github.com/semyonf/wallace-apple-dictionary/blob/master/readme-resources/screen-1.jpg)
![dictionary spotlight](https://github.com/semyonf/wallace-apple-dictionary/blob/master/readme-resources/screen-2.jpg)
![dictionary search by annotation](https://github.com/semyonf/wallace-apple-dictionary/blob/master/readme-resources/screen-3.jpg)
