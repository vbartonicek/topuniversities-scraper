# topuniversities-scraper

## Top Universities scraper

Scraper to get a list of top universities based on the QS World University Rankings

Currently the scraper supports:

- Basic mode (to get a a list of ranked universitied with basic data like name, country and link to its detail)
- Detailed mode (to get a detailed information about the universities by visiting its detail pages)

## Future plans

## Input parameters

The input of this scraper should be JSON containing the filter of universities that should be scraped. Required fields are:

| Field | Type | Description |
| ----- | ---- | ----------- |
| detailedMode | boolean | Check if you want to run the detailed mode |
| year | String | Select a year of the rankings  |
| country | String | Select specific country or select "All countries" to not filter universities |

### Top Universities scraper Input example
```json
{
  "detailedMode": false,
  "year": "2020",
  "country": "Canada",
}
```
