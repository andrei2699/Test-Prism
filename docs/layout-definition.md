# Layout Definition

The `Layout` object defines the structure and content of the pages in the application. It is the root of the
configuration.

## `Layout`

| Field         | Type                          | Description                                                                |
| ------------- | ----------------------------- | -------------------------------------------------------------------------- |
| `pages`       | `Page[]`                      | An array of `Page` objects, each representing a page in the application.   |
| `dataSources` | `[DataSource](#datasource)[]` | An array of `DataSource` objects that can be used by widgets on the pages. |

## `Page`

| Field     | Type       | Description                                                                      |
| --------- | ---------- | -------------------------------------------------------------------------------- |
| `title`   | `string`   | The title of the page, displayed in the UI.                                      |
| `path`    | `string`   | The URL path for the page.                                                       |
| `navIcon` | `string`   | (Optional) The name of the icon to display in the navigation menu for this page. |
| `widgets` | `Widget[]` | An array of `Widget` objects to display on the page.                             |

## `Widget`

A `Widget` is a component that displays data on a page. There are different types of widgets, each with its own set of
parameters.

### Base Widget Fields

All widgets have the following base fields:

| Field   | Type                        | Description                                                      |
| ------- | --------------------------- | ---------------------------------------------------------------- |
| `id`    | `string`                    | A unique identifier for the widget.                              |
| `type`  | `WidgetType`                | The type of the widget. See `WidgetType` for possible values.    |
| `data`  | `[WidgetData](#widgetdata)` | An object that specifies the data to be displayed by the widget. |
| `style` | `CSSStyleDeclaration`       | (Optional) An object that defines the CSS styles for the widget. |

### `WidgetType`

The `WidgetType` can be one of the following:

- `'tree'`: A widget that displays data in a tree structure.
- `'distribution-pie'`: A widget that displays data in a pie chart.
- `'analysis-summary'`: A widget that displays a summary of the analysis.

### `WidgetData`

| Field          | Type                        | Description                                                                                 |
| -------------- | --------------------------- | ------------------------------------------------------------------------------------------- |
| `dataSourceId` | `DataSourceId`              | The ID of the `DataSource` to use for this widget.                                          |
| `filter`       | `[DataFilter](#datafilter)` | (Optional) A `DataFilter` object that can be used to filter the data from the `DataSource`. |

## `DataSource`

A `DataSource` defines how to fetch data from a remote source.

| Field         | Type                     | Description                                                            |
| ------------- | ------------------------ | ---------------------------------------------------------------------- |
| `id`          | `DataSourceId`           | A unique identifier for the data source.                               |
| `url`         | `string`                 | The URL to fetch the data from.                                        |
| `headers`     | `Record<string, string>` | (Optional) An object containing HTTP headers to send with the request. |
| `queryParams` | `Record<string, string>` | (Optional) An object containing query parameters to append to the URL. |

## `DataFilter`

The `DataFilter` is used to filter the data returned from a `DataSource`.

The `DataFilter` will allow you to specify conditions that the data must meet to be included in the result set. For
example, you could filter a list of test results to only show the tests that have failed.

The exact structure of the `DataFilter` is still being determined, but it will likely involve a combination of logical
operators (`AND`, `OR`, `NOT`) and comparison operators (`=`, `!=`, `>`, `<`, etc.).
