An Apple macOS Dictionary parsed from David Foster Wallace Wiki : Infinite Jest

Installation:
1. Download the latest `Wallace.Dictionary.dictionary.zip` from [releases](https://github.com/taxnuke/wallace-apple-dictionary/releases) (under 'Assets')
2. Extract and move the extracted `.dictionary`-file to `~/Library/Dictionaries`, enable it in your Dictionary.app

Building from source:
1. Install Node.js version 12+ (required to parse fresh definitions from the website)
2. Download Apple's `Dictionary Development Kit` and place it inside `/Applications/Utilities/`
3. Run `npm i && make && make install`

![dictionary search](https://github.com/taxnuke/wallace-apple-dictionary/blob/master/ReadmeResources/screen_1.jpg)
![dictionary spotlight](https://github.com/taxnuke/wallace-apple-dictionary/blob/master/ReadmeResources/screen_2.jpg)
