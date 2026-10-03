/**
 * Shared ECharts callback parameter types for dashboard chart components.
 * Avoids importing internal ECharts types directly and satisfies
 * the @typescript-eslint/no-explicit-any rule.
 */

/** Single data-point parameter passed to ECharts tooltip/label formatters. */
export interface EChartsCallbackDataParams {
  componentType: string;
  seriesType: string;
  seriesIndex: number;
  seriesName: string;
  name: string;
  dataIndex: number;
  data: Record<string, unknown>;
  value: number | string | (number | string)[];
  color: string;
  marker: string;
  $vars: string[];
}

/** Tooltip formatter receives a single param (for 'item' trigger) or array (for 'axis' trigger). */
export type EChartsTooltipFormatterParams =
  | EChartsCallbackDataParams
  | EChartsCallbackDataParams[];
