# Layout Definition

The `Layout` object defines the structure and content of the pages in the application. It is the root of the
configuration.

See the [Examples](#examples) at the end of this document for a complete `Layout` definition.

## `Layout`

| Field         | Type                          | Description                                                                          |
| ------------- | ----------------------------- | ------------------------------------------------------------------------------------ |
| `pages`       | `Page[]`                      | An array of `Page` objects, each representing a page in the application.             |
| `dataSources` | `[DataSource](#datasource)[]` | An array of `DataSource` objects that can be used by widgets on the pages.           |
| `colors`      | `[TestColors](#testcolors)`   | (Optional) An object that defines the colors for the different test execution types. |

## `Page`

| Field     | Type       | Description                                                                      |
| --------- | ---------- | -------------------------------------------------------------------------------- |
| `title`   | `string`   | The title of the page, displayed in the UI.                                      |
| `path`    | `string`   | The URL path for the page.                                                       |
| `navIcon` | `string`   | (Optional) The name of the icon to display in the navigation menu for this page. |
| `widgets` | `Widget[]` | An array of `Widget` objects to display on the page.                             |

## `TestColors`

The `TestColors` object is a mapping from a `TestExecutionType` to a color string. The color can be any valid CSS color string, such as a hex code, RGB value, or color name.

The possible values for `TestExecutionType` are:

- `'SUCCESS'`
- `'FAILURE'`
- `'SKIPPED'`
- `'ERROR'`

### Example

```json
{
  "colors": {
    "SUCCESS": "#4CAF50",
    "FAILURE": "#F44336",
    "SKIPPED": "#FFC107",
    "ERROR": "#FF9800"
  }
}
```

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

- `'container'`: A widget that groups other widgets.
- `'tree'`: A widget that displays data in a tree structure.
- `'distribution-pie'`: A widget that displays data in a pie chart.
- `'summary'`: A widget that displays a summary of the analysis.

### `WidgetData`

| Field          | Type                        | Description                                                                                 |
| -------------- | --------------------------- | ------------------------------------------------------------------------------------------- |
| `dataSourceId` | `DataSourceId`              | The ID of the `DataSource` to use for this widget.                                          |
| `filter`       | `[DataFilter](#datafilter)` | (Optional) A `DataFilter` object that can be used to filter the data from the `DataSource`. |

## Available Widgets

This section describes the available widgets and their parameters.

### Summary Widget (`summary`)

The Summary Widget displays a summary of the test results, including the total number of tests and the number of tests in each status (passed, failed, skipped, error).

#### Parameters (`SummaryWidgetParameters`)

| Field   | Type     | Description                                                         |
| ------- | -------- | ------------------------------------------------------------------- |
| `title` | `string` | (Optional) The title of the widget. Defaults to "Analysis Summary". |

### Container Widget (`container`)

The Container Widget is used to group other widgets together. This is useful for organizing the layout of a page.

#### Children

The `container` widget has a `children` field, which is an array of `Widget` objects. These are the widgets that will be rendered inside the container.

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

The `DataFilter` is used to filter the data returned from a `DataSource`. It allows for building complex queries by
nesting conditions.

A `DataFilter` object has a recursive structure:

| Field        | Type                             | Description                                                                                              |
| ------------ | -------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `operator`   | `LogicalOperator`                | The logical operator to apply to the `conditions` array. Can be `'AND'` or `'OR'`.                       |
| `conditions` | `Array<DataFilter \| Condition>` | An array that can contain either `Condition` objects or other `DataFilter` objects for nested filtering. |

### `Condition`

A `Condition` object represents a single rule in the filter.

| Field | Type | Description -
| `field` | `string` | The property of the data object to evaluate. Use dot notation for nested
properties (e.g., `details.author`). -
| `operator` | `ConditionOperator` | The comparison operator to use. -
| `value` | `FieldValue` | The value to compare against. This can be a string, number, boolean, null, or an
array of these types. |

### `ConditionOperator`

| Operator             | Description                                                                                                                               |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `==` or `equals`     | Checks for strict equality (`===`).                                                                                                       |
| `!=` or `not equals` | Checks for strict inequality (`!==`).                                                                                                     |
| `in`                 | Checks if the field's value is present in the provided array.                                                                             |
| `not in`             | Checks if the field's value is not present in the provided array.                                                                         |
| `contains`           | For string fields, checks if the string contains the value. For array fields, checks if the array contains an element equal to the value. |
| `>=`                 | Checks if a numeric field is greater than or equal to the value.                                                                          |
| `>`                  | Checks if a numeric field is strictly greater than the value.                                                                             |
| `<`                  | Checks if a numeric field is strictly less than the value.                                                                                |
| `<=`                 | Checks if a numeric field is less than or equal to the value.                                                                             |

## Examples

### Basic Page with a Single Widget

This example shows a minimal layout with one data source and one page, which displays a single `tree` widget.

```json
{
  "dataSources": [
    {
      "id": "main-run",
      "url": "https://api.example.com/tests/latest"
    }
  ],
  "pages": [
    {
      "title": "Test Results",
      "path": "/",
      "widgets": [
        {
          "id": "main-test-tree",
          "type": "tree",
          "data": {
            "dataSourceId": "main-run"
          }
        }
      ]
    }
  ]
}
```

### Using a Container Widget

This example shows how to use a `container` widget to group two widgets together.

```json
{
  "dataSources": [
    {
      "id": "main-run",
      "url": "https://api.example.com/tests/latest"
    }
  ],
  "pages": [
    {
      "title": "Dashboard",
      "path": "/",
      "widgets": [
        {
          "id": "main-container",
          "type": "container",
          "style": {
            "display": "flex",
            "flex-direction": "row",
            "gap": "16px"
          },
          "children": [
            {
              "id": "main-test-tree",
              "type": "tree",
              "data": {
                "dataSourceId": "main-run"
              }
            },
            {
              "id": "main-distribution-pie",
              "type": "distribution-pie",
              "data": {
                "dataSourceId": "main-run"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

### Filtering Widget Data

This example demonstrates how to use a `DataFilter` to show only the tests that have failed.

```json
{
  "dataSources": [
    {
      "id": "main-run",
      "url": "https://api.example.com/tests/latest"
    }
  ],
  "pages": [
    {
      "title": "Failed Tests",
      "path": "/failed",
      "widgets": [
        {
          "id": "failed-test-tree",
          "type": "tree",
          "data": {
            "dataSourceId": "main-run",
            "filter": {
              "operator": "AND",
              "conditions": [
                {
                  "field": "lastExecutionType",
                  "operator": "==",
                  "value": "FAILURE"
                }
              ]
            }
          }
        }
      ]
    }
  ]
}
```

### Using Widget Parameters

This example shows how to configure a `distribution-pie` widget to group data by `duration` instead of the default
`status`.

```json
{
  "dataSources": [
    {
      "id": "main-run",
      "url": "https://api.example.com/tests/latest"
    }
  ],
  "pages": [
    {
      "title": "Duration Analysis",
      "path": "/durations",
      "widgets": [
        {
          "id": "duration-pie-chart",
          "type": "distribution-pie",
          "parameters": {
            "strategy": "duration"
          },
          "data": {
            "dataSourceId": "main-run"
          }
        }
      ]
    }
  ]
}
```

### Comprehensive Layout

Here is a complete example of a `Layout` configuration that combines multiple pages, widgets, and a complex filter.

```json
{
  "colors": {
    "SUCCESS": "#4CAF50",
    "FAILURE": "#F44336",
    "SKIPPED": "#FFC107",
    "ERROR": "#FF9800"
  },
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
            "dataSourceId": "latest-run",
            "filter": {
              "operator": "AND",
              "conditions": [
                {
                  "field": "lastExecutionType",
                  "operator": "!=",
                  "value": "SKIPPED"
                },
                {
                  "operator": "OR",
                  "conditions": [
                    {
                      "field": "tags",
                      "operator": "contains",
                      "value": "smoke"
                    },
                    {
                      "field": "durationMs",
                      "operator": "==",
                      "value": 200
                    }
                  ]
                }
              ]
            }
          }
        }
      ]
    },
    {
      "title": "Failed Tests",
      "path": "/failed",
      "navIcon": "error",
      "widgets": [
        {
          "id": "failed-test-tree",
          "type": "tree",
          "data": {
            "dataSourceId": "latest-run",
            "filter": {
              "operator": "AND",
              "conditions": [
                {
                  "field": "lastExecutionType",
                  "operator": "==",
                  "value": "FAILURE"
                }
              ]
            }
          }
        }
      ]
    }
  ]
}
```
