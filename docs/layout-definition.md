# Layout Definition

The `Layout` object defines the structure and content of the pages in the application. It is the root of the
configuration.

See the [Example](#example) at the end of this document for a complete `Layout` definition.

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

## Available Widgets

This section describes the available widgets and their parameters.

### Tree Widget (`tree`)

The Tree Widget displays test results in a hierarchical tree structure. It allows for filtering and sorting of the
tests.

[//]: # "'TODO: add image of tree widget'"

#### Parameters (`TreeWidgetParameters`)

| Field            | Type       | Description                                                                                                    |
| ---------------- | ---------- | -------------------------------------------------------------------------------------------------------------- |
| `strategy`       | `string`   | The organization strategy for the tree. Possible values are `'folder'` (default) and `'status'`.               |
| `sortStrategies` | `string[]` | An array of sorting strategies to apply to the tree. Currently, the only possible value is `'name'` (default). |

### Test Distribution Pie (`distribution-pie`)

The Test Distribution Pie widget displays a pie chart showing the distribution of test results.

[//]: # " 'TODO: add image of distribution pie widget'"

#### Parameters (`TestDistributionPieParameters`)

| Field      | Type     | Description                                                                                             |
| ---------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `strategy` | `string` | The distribution strategy for the pie chart. Possible values are `'status'` (default) and `'duration'`. |

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

## Example

Here is a complete example of a `Layout` configuration:

```json
{
  "dataSources": [
    {
      "id": "latest-run",
      "url": "https://api.example.com/tests/latest",
      "headers": {
        "Authorization": "Bearer YOUR_API_TOKEN"
      }
    },
    {
      "id": "previous-run",
      "url": "https://api.example.com/tests/previous"
    }
  ],
  "pages": [
    {
      "title": "Dashboard",
      "path": "/",
      "navIcon": "home",
      "widgets": [
        {
          "id": "summary-pie",
          "type": "distribution-pie",
          "data": {
            "dataSourceId": "latest-run"
          },
          "style": {
            "width": "50%",
            "height": "300px"
          }
        },
        {
          "id": "test-tree",
          "type": "tree",
          "data": {
            "dataSourceId": "latest-run"
          }
        }
      ]
    },
    {
      "title": "Previous Run",
      "path": "/previous",
      "navIcon": "history",
      "widgets": [
        {
          "id": "previous-test-tree",
          "type": "tree",
          "data": {
            "dataSourceId": "previous-run"
          }
        }
      ]
    }
  ]
}
```
