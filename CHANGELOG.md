### 2021-07-29 - New SDK version (1.3.1).

#### Bugs:
- All selectors were updated to current + fixed https://github.com/vbartonicek/topuniversities-scraper/issues/9;
#### Improvements:
- SDK update (1.3.1);
- Improved logging during the run;
- Implemented default usage of proxy;
- Added new info fields to the output;
- Added "maxItem" value to the input (due to issues with pagination maxItems should be <= 100), to set desirable number of saved items in final dataset.