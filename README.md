# topuniversities-scraper

## Top Universities scraper

An API to get a list of top universities based on the QS World University Rankings in various formats (HTML table, JSON, CSV, Excel, XML or RSS feed).

Currently, the scraper supports two modes:

- Basic mode (to get a list of ranked universities with basic data like name, country, and link to its detail)
- Detailed mode (to get detailed information about the universities by visiting its detail pages)

## Future plans

- To scrape more information in the detailed mode
- To be able to filter countries for a region (e.g. Europe)

## Input parameters

The input of this scraper should be JSON containing the filter of universities that should be scrapped. Required fields are:

| Field | Type | Description |
| ----- | ---- | ----------- |
| mode | String | Choose a mode (see the description above) |
| year | String | Select a year of the rankings  |
| country | String | Select specific country or select "All countries" to not filter universities |

### Top Universities scraper Input example
```json
{
  "mode": "mode",
  "year": "2020",
  "country": "Canada"
}
```
