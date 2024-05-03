[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/aIBftyMV)

## Data Used
1. [The World Bank - A Global Dataset of Inflation](https://www.worldbank.org/en/research/brief/inflation-database)
2. [The World Bank - International Tourism](https://data.worldbank.org/indicator/ST.INT.DPRT)
3. [World Map GeoJSON](https://geojson-maps.ash.ms/)

## User Definition
- Our dashboard has several potential target users:
- Tourists deciding whether or not to travel to other countries
- Economists studying inflation trends
- Experts looking into tourism trends/impact on global economies

User Stories:
- As a frequent traveler, I want updated information on inflation data so that I can more effectively plan future travel
- As an economist, I want to visualize time series inflation data in order to analyze correlations between different inflation indicators

## Dashboard Initialization
```
run npm install
```

## Home Page
Introdcution to the project and brief summary of each dashboard.

## Page 1 - Inflation by Year
***Interactivity:***
- User can use the dropdown to select a year and view the world HCPI inflation data for that year.
- User can interact with choropleth map by hovering to see exact percentage information.
- User can see specific inflation metrics about specific countries via line charts by clicking on the map.

***Charts by Type:***
1. Choropleth Map on Inflation HCPI Percentages
- Normalized legend scale and blue colorScale for negative inflation, red colorScale for positive inflation.
- Countries with no avaialable data are grayed out and can be hovered over using the tooltip to verify this.
- Default year for the chloropleth is 1995, with data through 2020

2. Time Series Line Chart on other Inflation Indicators (up to four for each country)
- Indicators: Official Core consumer price index, Food price index, Energy price index, and/or Producer price index
- Include explanatory texts on the side of each line chart to explain the indices to the user.
- Dyamically recognizes if data is present for the given country and creates the correct number of charts accordingly.

***Insights:***
- In general, energy price index and food price index share similar trends within the same country.
- Because produce price index is indicative of a potential fluctuation in core consumer price index, you can identify potential inflation trends using PPI.
- Countries with very high GDPs (USA, China, etc.) have more stable inflation rates over time that do not fluctuate much.

## Page 2 - Tourism by Year
***Interactivity:***
- User can use the dropdown to select a year and view the data for that specific year.
- User can interact with all charts by hovering to see more information.
- User can interact with bar charts by clicking on buttons to filter and sort.

***Charts by Type:***
1. Choropleth Map on Depature over Arrival Ratios
- Numbers on color scale changes based on specified year, but colors stay consistent to allow cross year comparison.
- Hover to see the ratio and the country names.

2. Pie Charts on Number of Arrivals/Departures in Each Continent
- Data is grouped by continent and percentage of arrivals/depatures calculated for specified year.
- Hover to see the continent and the percentage of arrivals/departures in that continent

3. Bar Charts on Top 20 Countries with Highest Arrivals/Depatures
- Filtering and sorting buttons are added so user can filter countries by continent and/or sort them by arrival/depature or alphabetical order.
- Button for continents that do not have any countries in the top 20 in specified year are darken to show that they have been disabled.
- Bar chart will dynamically move based on filtering and sorting.
- Each bar is labeled with 3-alphabet country code, but on hover, user can see full country names.

***Insights:***
- Europe and America dominate in number of arriving/departing travelers through 1995-2020.
- Countries in Africa are mainly identified by region in the World Bank data, so country-level data is missing.

## Page 3 - Inflation and Tourism Forecasting and Correlation
***Interactivity:***
- User can click on buttons to filter the forecasting bar chart by category.
- User can hover over specific row in the table to highlight the row. This allows user to easily read across the entire row and view all numbers.

***Charts by Type:***
1. Bar Chart on Forecasting Inflation Index, Number of Arrivals/Depatures, and Expenditures in USD
- Bar chart visualizing time series data for four indicators along with predicted values.
- Different colors are used for predictions.

2. Table showing the values of the bar chart with predicted values highlighted
- Predicted rows are highlighted in different colors.

3. Heatmap showing correlation matrix between inflation index and indicators for tourism
- Correlation matrix plotted as part of the model analyzing inflation vs tourism.

***Insights:***
Forecast of the Inflation and Tourism data for the next 4 years:
- No drastic changes expected in inflation , but certainly getting better.
- Trend change after 2019 continue for other indicators.

Insights on the correlation:
- Strong negative correlation between the inflation and departures.
- Strong negative correlation between the inflation and expenditures.
- Inflation does have a say with some aspects of tourism.
