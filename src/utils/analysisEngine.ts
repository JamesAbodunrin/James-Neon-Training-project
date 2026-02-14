// --- Types (aligned with PRD/ERD: outputs only, interpretation_json) ---

import { parseCSVToRows } from './csvUtils';

/** User-selectable analysis types: run only what is requested, no assumption */
export type RequestedAnalysis =
  | 'simple_percentage'
  | 'descriptive_mean'
  | 'correlation'
  | 't_test'
  | 'chi_square'
  | 'linear_regression'
  | 'k_means_clustering'
  | 'time_trend'
  | 'word_frequency';

export interface AnalysisOptions {
  /** Analyses to run; if empty or omitted, all applicable analyses are run (backward compatible) */
  requestedAnalyses?: RequestedAnalysis[];
  /** Purpose of the thesis/research; used to tone interpretations */
  researchPurpose?: string;
}

export interface DataTable {
  /** Section label (e.g. "Section 1: Demographic Information") */
  sectionLabel: string;
  /** Section number (1, 2, 3, ...) */
  sectionNum: number;
  /** Table number within section (1.1, 1.2, 2.1, ...) */
  tableNum: string;
  title: string;
  headers: string[];
  rows: (string | number)[][];
  /** Academic interpretation for this table */
  interpretation?: string;
}

export interface HypothesisTestResult {
  name: string;
  nullHypothesis: string;
  alternativeHypothesis: string;
  testStatistic: string;
  statisticValue: number;
  pValue: number;
  alpha: number;
  conclusion: 'reject' | 'fail_to_reject';
  interpretation: string;
}

export interface InterpretationJson {
  methodSummary: string;
  findings: string[];
  significanceStatement: string | null;
  effectSizeStatement: string | null;
  academicParagraph: string;
}

export interface ChartSeries {
  name: string;
  data: { label: string; value: number }[];
}

export interface AnalysisResult {
  summary: string;
  methodUsed: string;
  statistics: Record<string, string | number>;
  tables: DataTable[];
  interpretation_json: InterpretationJson;
  hypothesisTesting: HypothesisTestResult[];
  chartData: ChartSeries[];
  insights: string[];
  recommendations: string[];
}

// --- Helpers ---

function parseCSV(data: string): string[][] {
  return parseCSVToRows(data);
}

function isNumericColumn(rows: string[][], colIndex: number): boolean {
  if (rows.length < 2) return false;
  const sample = rows.slice(1, 6).map((r) => r[colIndex]);
  return sample.every((v) => v !== '' && !isNaN(parseFloat(v)));
}

function getNumericValues(rows: string[][], colIndex: number): number[] {
  return rows
    .slice(1)
    .map((r) => parseFloat(r[colIndex] ?? ''))

    .filter((v) => !isNaN(v));
}

// Pearson correlation and p-value (two-tailed)
function pearsonCorrelation(x: number[], y: number[]): { r: number; p: number } {
  const n = Math.min(x.length, y.length);
  if (n < 3) return { r: 0, p: 1 };
  const xSlice = x.slice(0, n);
  const ySlice = y.slice(0, n);
  const sumX = xSlice.reduce((a, b) => a + b, 0);
  const sumY = ySlice.reduce((a, b) => a + b, 0);
  const sumXY = xSlice.reduce((acc, xi, i) => acc + xi * ySlice[i], 0);
  const sumX2 = xSlice.reduce((a, b) => a + b * b, 0);
  const sumY2 = ySlice.reduce((a, b) => a + b * b, 0);
  const num = n * sumXY - sumX * sumY;
  const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  const r = den === 0 ? 0 : num / den;
  // Approximate t-test for correlation: t = r * sqrt(n-2) / sqrt(1-r^2)
  const t = r * Math.sqrt(n - 2) / Math.sqrt(Math.max(1 - r * r, 1e-10));
  const p = twoTailedTPValue(t, n - 2);
  return { r, p };
}

// Approximate p-value for t-statistic (two-tailed) using normal approximation for df > 30
function twoTailedTPValue(t: number, df: number): number {
  const x = Math.abs(t);
  if (df <= 0) return 1;
  // Normal approximation for large df
  const z = x;
  const pNormal = 2 * (1 - normalCDF(z));
  if (df >= 30) return Math.min(1, Math.max(0, pNormal));
  // Rough correction for small df (simplified)
  const p = pNormal * (1 + 1 / (2 * df));
  return Math.min(1, Math.max(0, p));
}

function normalCDF(z: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1.0 / (1.0 + p * Math.abs(z));
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-z * z * 0.5);
  return z < 0 ? 1 - y : y;
}

// One-sample t-test (H0: mean = 0)
function oneSampleTTest(values: number[]): { t: number; p: number; mean: number; std: number; n: number } {
  const n = values.length;
  if (n < 2) return { t: 0, p: 1, mean: 0, std: 0, n };
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / (n - 1);
  const std = Math.sqrt(variance);
  const se = std / Math.sqrt(n);
  const t = se === 0 ? 0 : mean / se;
  const p = twoTailedTPValue(t, n - 1);
  return { t, p, mean, std, n };
}

// Chi-square for 2x2 or r x c contingency (observed counts)
function chiSquareTest(observed: number[][]): { chi2: number; p: number; df: number } {
  const r = observed.length;
  const c = observed[0]?.length ?? 0;
  if (r < 2 || c < 2) return { chi2: 0, p: 1, df: 0 };
  const rowSums = observed.map((row) => row.reduce((a, b) => a + b, 0));
  const colSums = Array.from({ length: c }, (_, j) => observed.reduce((a, row) => a + (row[j] ?? 0), 0));
  const total = rowSums.reduce((a, b) => a + b, 0);
  if (total === 0) return { chi2: 0, p: 1, df: (r - 1) * (c - 1) };
  let chi2 = 0;
  for (let i = 0; i < r; i++) {
    for (let j = 0; j < c; j++) {
      const expected = (rowSums[i] * colSums[j]) / total;
      if (expected > 0) {
        const o = observed[i][j] ?? 0;
        chi2 += (o - expected) ** 2 / expected;
      }
    }
  }
  const df = (r - 1) * (c - 1);
  const p = chiSquarePValue(chi2, df);
  return { chi2, p, df };
}

function chiSquarePValue(chi2: number, df: number): number {
  if (df <= 0) return 1;
  // Wilson-Hilferty approximation for chi-square to normal
  const x = (Math.pow(chi2 / df, 1 / 3) - (1 - 2 / (9 * df))) / Math.sqrt(2 / (9 * df));
  return Math.min(1, Math.max(0, 1 - normalCDF(x)));
}

/** Simple linear regression: Y = a + b*X; returns slope, intercept, R², p-value for slope */
function simpleLinearRegression(x: number[], y: number[]): { slope: number; intercept: number; r2: number; pValue: number } {
  const n = Math.min(x.length, y.length);
  if (n < 3) return { slope: 0, intercept: 0, r2: 0, pValue: 1 };
  const xSlice = x.slice(0, n);
  const ySlice = y.slice(0, n);
  const sumX = xSlice.reduce((a, b) => a + b, 0);
  const sumY = ySlice.reduce((a, b) => a + b, 0);
  const meanX = sumX / n;
  const meanY = sumY / n;
  const ssX = xSlice.reduce((a, v) => a + (v - meanX) ** 2, 0);
  const ssXY = xSlice.reduce((acc, xi, i) => acc + (xi - meanX) * (ySlice[i] - meanY), 0);
  const slope = ssX === 0 ? 0 : ssXY / ssX;
  const intercept = meanY - slope * meanX;
  const yHat = xSlice.map((xi) => intercept + slope * xi);
  const ssRes = ySlice.reduce((a, yi, i) => a + (yi - (yHat[i] ?? 0)) ** 2, 0);
  const ssTot = ySlice.reduce((a, yi) => a + (yi - meanY) ** 2, 0);
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;
  const seSlope = n < 3 || ssX === 0 ? 1 : Math.sqrt(ssRes / (n - 2) / ssX);
  const t = seSlope === 0 ? 0 : slope / seSlope;
  const pValue = twoTailedTPValue(t, n - 2);
  return { slope, intercept, r2, pValue };
}

/** K-means with k clusters; returns cluster labels (0..k-1) and centroids */
function kMeans(rows: number[][], k: number, maxIters = 20): { labels: number[]; centroids: number[][] } {
  const n = rows.length;
  const dim = rows[0]?.length ?? 0;
  if (n < k || dim === 0) return { labels: [], centroids: [] };
  const centroids = rows.slice(0, k).map((r) => [...r]);
  const labels = new Array(n).fill(0);
  for (let iter = 0; iter < maxIters; iter++) {
    const sums = Array.from({ length: k }, () => new Array(dim).fill(0));
    const counts = new Array(k).fill(0);
    for (let i = 0; i < n; i++) {
      const row = rows[i] ?? [];
      let best = 0;
      let bestD = Infinity;
      for (let c = 0; c < k; c++) {
        const cent = centroids[c] ?? [];
        const d = row.reduce((a, v, j) => a + (v - (cent[j] ?? 0)) ** 2, 0);
        if (d < bestD) {
          bestD = d;
          best = c;
        }
      }
      labels[i] = best;
      for (let j = 0; j < dim; j++) sums[best][j] += row[j] ?? 0;
      counts[best]++;
    }
    let unchanged = true;
    for (let c = 0; c < k; c++) {
      const newCent = (sums[c] ?? []).map((s, j) => (counts[c] > 0 ? s / counts[c] : (centroids[c]?.[j] ?? 0)));
      for (let j = 0; j < dim; j++) {
        if (Math.abs((newCent[j] ?? 0) - (centroids[c]?.[j] ?? 0)) > 1e-6) unchanged = false;
      }
      centroids[c] = newCent;
    }
    if (unchanged) break;
  }
  return { labels, centroids };
}

/** Section labels for table grouping */
const SECTION_LABELS: Record<number, string> = {
  1: 'Demographic Information',
  2: 'Descriptive Statistics',
  3: 'Correlation',
  4: 'Hypothesis Testing',
  5: 'Regression',
  6: 'Clustering',
  7: 'Time Series',
  8: 'Text Analysis',
};

/**
 * Analyses that are valid for the given (analysis type, application).
 * Single source of truth so UI and engine stay in line.
 */
export function getApplicableAnalyses(
  analysisType: string | null,
  application: string | null
): RequestedAnalysis[] {
  if (!analysisType || !application) return [];
  const all: RequestedAnalysis[] = ['simple_percentage', 'descriptive_mean', 'correlation', 't_test', 'chi_square'];
  const statistical = all;
  const correlationOnly: RequestedAnalysis[] = ['simple_percentage', 'descriptive_mean', 'correlation', 't_test', 'chi_square'];
  const regressionFull: RequestedAnalysis[] = ['simple_percentage', 'descriptive_mean', 'correlation', 'linear_regression'];
  const clusteringFull: RequestedAnalysis[] = ['simple_percentage', 'descriptive_mean', 'k_means_clustering'];
  const timeSeriesFull: RequestedAnalysis[] = ['simple_percentage', 'descriptive_mean', 'correlation', 'time_trend'];
  const textFull: RequestedAnalysis[] = ['simple_percentage', 'descriptive_mean', 'word_frequency'];
  const byType: Record<string, RequestedAnalysis[]> = {
    statistical,
    correlation: correlationOnly,
    regression: regressionFull,
    clustering: clusteringFull,
    'time-series': timeSeriesFull,
    'text-analysis': textFull,
  };
  let allowed = byType[analysisType] ?? statistical;
  if (application === 'nltk' && analysisType !== 'text-analysis') {
    allowed = ['simple_percentage'];
  } else if (application === 'nltk' && analysisType === 'text-analysis') {
    allowed = ['simple_percentage', 'descriptive_mean', 'word_frequency'];
  }
  return allowed;
}

function wants(
  options: AnalysisOptions | undefined,
  key: RequestedAnalysis,
  allowed: RequestedAnalysis[]
): boolean {
  if (!allowed.includes(key)) return false;
  const list = options?.requestedAnalyses;
  if (!list || list.length === 0) return true;
  return list.includes(key);
}

export function analyzeData(
  data: string,
  analysisType: string | null,
  application: string | null,
  options?: AnalysisOptions
): AnalysisResult {
  const purpose = options?.researchPurpose?.trim() || '';
  const purposePrefix = purpose ? `Given the research purpose (${purpose}), ` : '';

  const emptyResult = (
    summary: string,
    methodUsed = 'None'
  ): AnalysisResult => ({
    summary,
    methodUsed,
    statistics: {},
    tables: [],
    interpretation_json: {
      methodSummary: '',
      findings: [],
      significanceStatement: null,
      effectSizeStatement: null,
      academicParagraph: summary,
    },
    hypothesisTesting: [],
    chartData: [],
    insights: [],
    recommendations: [],
  });

  if (!data.trim()) {
    return emptyResult('No data provided. Please input or upload your data to begin analysis.');
  }

  if (!analysisType || !application) {
    return emptyResult('Please select an analysis type and application to proceed.');
  }

  let rows: string[][];
  try {
    rows = parseCSV(data);
  } catch (e) {
    return emptyResult(
      `Data could not be parsed. Please use a valid CSV or upload an Excel/Word file. ${e instanceof Error ? e.message : ''}`
    );
  }

  const rowCount = rows.length;
  const colCount = rows[0]?.length || 0;
  const headers = rows[0] ?? [];

  const numericColIndices: number[] = [];
  for (let i = 0; i < colCount; i++) {
    if (isNumericColumn(rows, i)) numericColIndices.push(i);
  }

  const categoricalColIndices: number[] = [];
  for (let i = 0; i < colCount; i++) {
    if (!numericColIndices.includes(i) && rowCount > 1) categoricalColIndices.push(i);
  }

  const statistics: Record<string, string | number> = {
    'Total Rows': rowCount,
    'Total Columns': colCount,
    'Data Size': `${(data.length / 1024).toFixed(2)} KB`,
    'Numeric Columns': numericColIndices.length,
  };

  const allowedAnalyses = getApplicableAnalyses(analysisType, application);
  const tables: DataTable[] = [];
  const chartData: ChartSeries[] = [];
  const hypothesisTesting: HypothesisTestResult[] = [];
  const alpha = 0.05;
  const methodParts: string[] = [];

  // --- Section 1: Demographic Information (simple percentage) ---
  const section1 = 1;
  let table1Index = 0;
  if (wants(options, 'simple_percentage', allowedAnalyses) && categoricalColIndices.length > 0 && rowCount > 1) {
    methodParts.push('Simple percentage method (frequency and % per category)');
    categoricalColIndices.forEach((colIndex) => {
      table1Index += 1;
      const colName = headers[colIndex] ?? `Column ${colIndex + 1}`;
      const cellValues = rows.slice(1).map((r) => r[colIndex] ?? '').filter(Boolean);
      const freq: Record<string, number> = {};
      cellValues.forEach((v) => {
        freq[v] = (freq[v] ?? 0) + 1;
      });
      const total = cellValues.length;
      const sortedEntries = Object.entries(freq).sort((a, b) => b[1] - a[1]);

      const percParts = sortedEntries.map(([label, count], i) => {
        const pct = total > 0 ? ((100 * count) / total).toFixed(0) : '0';
        const labelLower = label.toLowerCase();
        if (i === 0) return `${pct}% of the respondents were ${labelLower}`;
        if (i === sortedEntries.length - 1 && sortedEntries.length === 2) return `${pct}% were ${labelLower}`;
        if (i === sortedEntries.length - 1) return `and ${pct}% were ${labelLower}`;
        return `${pct}% were ${labelLower}`;
      });
      const percSentence =
        percParts.length === 0
          ? 'The distribution is shown in the table.'
          : percParts.length === 1
            ? `${percParts[0]}.`
            : percParts.length === 2
              ? `${percParts[0]} and ${percParts[1]}.`
              : `${percParts.slice(0, -1).join(', ')}, ${percParts[percParts.length - 1]}.`;

      const maxPct = total > 0 ? (Math.max(...sortedEntries.map(([, c]) => c)) / total) * 100 : 0;
      const minPct = total > 0 ? (Math.min(...sortedEntries.map(([, c]) => c)) / total) * 100 : 0;
      const isBalanced = sortedEntries.length >= 2 && maxPct - minPct <= 15;
      const suggestionSentence = isBalanced
        ? `This suggests a balanced participation, ensuring that the views of the different groups in the sample are adequately represented.`
        : `This distribution indicates that the majority of respondents fall into one or a few categories; findings may be more representative of those groups.`;

      const tableId = `${section1}.${table1Index}`;
      let cumPct = 0;
      const rowsWithCum: (string | number)[][] = sortedEntries.map(([label, count]) => {
        const pct = total > 0 ? (100 * count) / total : 0;
        cumPct += pct;
        return [
          label,
          count,
          total > 0 ? ((100 * count) / total).toFixed(1) : '0',
          cumPct.toFixed(1),
        ];
      });
      rowsWithCum.push(['Total', total, '100.0', '100.0']);
      tables.push({
        sectionLabel: `Section ${section1}: ${SECTION_LABELS[section1]}`,
        sectionNum: section1,
        tableNum: tableId,
        title: `Table ${tableId}: Distribution by ${colName}`,
        headers: [colName, 'Frequency', 'Percentage (%)', 'Cumulative (%)'],
        rows: rowsWithCum,
        interpretation: `${purposePrefix}Table ${tableId} shows that ${percSentence} ${suggestionSentence}`,
      });

      chartData.push({
        name: colName,
        data: sortedEntries.map(([label, count]) => ({ label, value: count })),
      });
    });
  }

  // --- Section 2: Descriptive Statistics (mean, median, SD, etc.) ---
  const section2 = 2;
  let table2Index = 0;
  if (wants(options, 'descriptive_mean', allowedAnalyses) && numericColIndices.length > 0 && rowCount > 1) {
    methodParts.push('Descriptive statistics (mean, median, standard deviation, min, max)');
    numericColIndices.forEach((colIndex) => {
      table2Index += 1;
      const values = getNumericValues(rows, colIndex);
      const colName = headers[colIndex] ?? `Column ${colIndex + 1}`;
      const sum = values.reduce((a, b) => a + b, 0);
      const mean = sum / values.length;
      const sorted = [...values].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length;
      const stdDev = Math.sqrt(variance);
      const min = Math.min(...values);
      const max = Math.max(...values);

      statistics[`${colName} - Mean`] = mean.toFixed(2);
      statistics[`${colName} - Median`] = median.toFixed(2);
      statistics[`${colName} - Min`] = min.toFixed(2);
      statistics[`${colName} - Max`] = max.toFixed(2);
      statistics[`${colName} - Std Dev`] = stdDev.toFixed(2);

      const range = max - min;
      const variability =
        stdDev > 0 && range > 0
          ? range / stdDev > 3
            ? 'wide'
            : range / stdDev < 1.5
              ? 'limited'
              : 'moderate'
          : 'moderate';
      const tableId = `${section2}.${table2Index}`;
      tables.push({
        sectionLabel: `Section ${section2}: ${SECTION_LABELS[section2]}`,
        sectionNum: section2,
        tableNum: tableId,
        title: `Table ${tableId}: Descriptive statistics for ${colName}`,
        headers: ['Measure', 'Value'],
        rows: [
          ['Mean', mean.toFixed(2)],
          ['Median', median.toFixed(2)],
          ['Std. Deviation', stdDev.toFixed(2)],
          ['Min', min.toFixed(2)],
          ['Max', max.toFixed(2)],
          ['N', values.length],
        ],
        interpretation: `${purposePrefix}Table ${tableId} presents the descriptive statistics for ${colName}. The mean was ${mean.toFixed(2)} (SD = ${stdDev.toFixed(2)}). The range from ${min.toFixed(2)} to ${max.toFixed(2)} suggests ${variability} variability in the data, which supports the use of these summary measures for reporting.`,
      });

      chartData.push({
        name: colName,
        data: [
          { label: 'Mean', value: mean },
          { label: 'Min', value: min },
          { label: 'Max', value: max },
          { label: 'Median', value: median },
        ],
      });
    });
  }

  // --- Section 3: Correlation ---
  let correlationR = 0;
  let correlationP = 1;
  let correlationVar1 = '';
  let correlationVar2 = '';
  const section3 = 3;
  const runCorrelation =
    wants(options, 'correlation', allowedAnalyses) &&
    (analysisType === 'correlation' || analysisType === 'statistical') &&
    numericColIndices.length >= 2;

  if (runCorrelation) {
    const x = getNumericValues(rows, numericColIndices[0]);
    const y = getNumericValues(rows, numericColIndices[1]);
    const { r, p } = pearsonCorrelation(x, y);
    correlationR = r;
    correlationP = p;
    correlationVar1 = headers[numericColIndices[0]] ?? 'Var1';
    correlationVar2 = headers[numericColIndices[1]] ?? 'Var2';
    statistics['Pearson r'] = r.toFixed(4);
    statistics['p-value (two-tailed)'] = p.toFixed(4);
    statistics['Significant at α=0.05'] = p < 0.05 ? 'Yes' : 'No';
    methodParts.push('Pearson correlation (two-tailed test of H₀: ρ = 0); assumes linearity and approximate normality.');

    const tableId = '3.1';
    tables.push({
      sectionLabel: `Section ${section3}: ${SECTION_LABELS[section3]}`,
      sectionNum: section3,
      tableNum: tableId,
      title: `Table ${tableId}: Pearson correlation (${correlationVar1} vs ${correlationVar2})`,
      headers: ['Statistic', 'Value'],
      rows: [
        ['Pearson r', r.toFixed(4)],
        ['p-value (two-tailed)', p.toFixed(4)],
        ['Significant at α = 0.05', p < alpha ? 'Yes' : 'No'],
      ],
      interpretation: `${purposePrefix}Table ${tableId} shows the correlation between ${correlationVar1} and ${correlationVar2}. ${p < alpha ? `There is statistically significant correlation (r = ${r.toFixed(3)}, p = ${p.toFixed(4)}).` : `There is no statistically significant correlation at α = 0.05 (r = ${r.toFixed(3)}, p = ${p.toFixed(4)}).`}`,
    });

    hypothesisTesting.push({
      name: 'Pearson correlation test',
      nullHypothesis: `H₀: There is no linear correlation between ${correlationVar1} and ${correlationVar2} (ρ = 0).`,
      alternativeHypothesis: `H₁: There is a linear correlation (ρ ≠ 0).`,
      testStatistic: 'r (Pearson)',
      statisticValue: r,
      pValue: p,
      alpha,
      conclusion: p < alpha ? 'reject' : 'fail_to_reject',
      interpretation:
        p < alpha
          ? `There is statistically significant correlation between ${correlationVar1} and ${correlationVar2} (r = ${r.toFixed(3)}, p = ${p.toFixed(4)}).`
          : `There is no statistically significant correlation at α = 0.05 (r = ${r.toFixed(3)}, p = ${p.toFixed(4)}).`,
    });
  }

  // --- Section 4: Hypothesis Testing (t-test, chi-square) ---
  const section4 = 4;
  let table4Index = 0;
  let cohensD: number | null = null;
  let cramersV: number | null = null;

  if (wants(options, 't_test', allowedAnalyses) && numericColIndices.length >= 1 && (analysisType === 'statistical' || analysisType === 'correlation')) {
    const values = getNumericValues(rows, numericColIndices[0]);
    const colName = headers[numericColIndices[0]] ?? 'Variable';
    const { t, p, mean, std, n } = oneSampleTTest(values);
    cohensD = std > 0 ? mean / std : 0;
    statistics['One-sample t (vs 0)'] = t.toFixed(4);
    statistics['t-test p-value'] = p.toFixed(4);
    if (cohensD !== null) statistics["Cohen's d"] = cohensD.toFixed(4);
    methodParts.push('One-sample t-test (H₀: population mean = 0); assumes approximate normality of the sample.');

    table4Index += 1;
    const tableId = `4.${table4Index}`;
    tables.push({
      sectionLabel: `Section ${section4}: ${SECTION_LABELS[section4]}`,
      sectionNum: section4,
      tableNum: tableId,
      title: `Table ${tableId}: One-sample t-test (${colName})`,
      headers: ['Statistic', 'Value'],
      rows: [
        ['Mean', mean.toFixed(2)],
        ['SD', std.toFixed(2)],
        ['t', t.toFixed(4)],
        ['p-value', p.toFixed(4)],
        ['N', n],
      ],
      interpretation: `${purposePrefix}Table ${tableId} presents the one-sample t-test for ${colName}. The mean of ${colName} (M = ${mean.toFixed(2)}, SD = ${std.toFixed(2)}) is ${p < alpha ? 'significantly different from zero' : 'not significantly different from zero at α = 0.05'}, t(${n - 1}) = ${t.toFixed(3)}, p = ${p.toFixed(4)}.`,
    });

    hypothesisTesting.push({
      name: 'One-sample t-test',
      nullHypothesis: `H₀: The population mean of ${colName} is zero (μ = 0).`,
      alternativeHypothesis: 'H₁: The population mean is not zero (μ ≠ 0).',
      testStatistic: 't',
      statisticValue: t,
      pValue: p,
      alpha,
      conclusion: p < alpha ? 'reject' : 'fail_to_reject',
      interpretation:
        p < alpha
          ? `The mean of ${colName} (M = ${mean.toFixed(2)}, SD = ${std.toFixed(2)}) is significantly different from zero, t(${n - 1}) = ${t.toFixed(3)}, p = ${p.toFixed(4)}.`
          : `The mean of ${colName} (M = ${mean.toFixed(2)}) is not significantly different from zero at α = 0.05, t(${n - 1}) = ${t.toFixed(3)}, p = ${p.toFixed(4)}.`,
    });
  }

  if (wants(options, 'chi_square', allowedAnalyses) && categoricalColIndices.length >= 2 && (analysisType === 'statistical' || analysisType === 'correlation')) {
    const colA = categoricalColIndices[0];
    const colB = categoricalColIndices[1];
    const valuesA = rows.slice(1).map((r) => r[colA] ?? '');
    const valuesB = rows.slice(1).map((r) => r[colB] ?? '');
    const levelsA = [...new Set(valuesA)].filter(Boolean).sort();
    const levelsB = [...new Set(valuesB)].filter(Boolean).sort();
    const observed: number[][] = levelsA.map(() => levelsB.map(() => 0));
    valuesA.forEach((a, i) => {
      const b = valuesB[i];
      const ia = levelsA.indexOf(a);
      const ib = levelsB.indexOf(b);
      if (ia >= 0 && ib >= 0) observed[ia][ib]++;
    });
    const { chi2, p, df } = chiSquareTest(observed);
    if (df > 0) {
      const totalN = observed.flat().reduce((a, b) => a + b, 0);
      const minDim = Math.min(levelsA.length, levelsB.length) - 1;
      cramersV = minDim > 0 && totalN > 0 ? Math.sqrt(chi2 / (totalN * minDim)) : 0;
      statistics['Chi-square'] = chi2.toFixed(4);
      statistics['Chi-square p-value'] = p.toFixed(4);
      if (cramersV !== null) statistics["Cramér's V"] = cramersV.toFixed(4);
      methodParts.push('Chi-square test of independence; assumes expected cell counts ≥ 5.');

      table4Index += 1;
      const tableId = `4.${table4Index}`;
      const rowHeader = [headers[colA], ...levelsB];
      const tableRows: (string | number)[][] = levelsA.map((la, i) => [
        la,
        ...(observed[i] ?? []).map(String),
      ]);
      tables.push({
        sectionLabel: `Section ${section4}: ${SECTION_LABELS[section4]}`,
        sectionNum: section4,
        tableNum: tableId,
        title: `Table ${tableId}: Chi-square test of independence (${headers[colA]} × ${headers[colB]})`,
        headers: rowHeader as string[],
        rows: tableRows,
        interpretation: `${purposePrefix}Table ${tableId} shows the association between ${headers[colA]} and ${headers[colB]}. ${p < alpha ? `There is a statistically significant association, χ²(${df}) = ${chi2.toFixed(2)}, p = ${p.toFixed(4)}.` : `No significant association at α = 0.05, χ²(${df}) = ${chi2.toFixed(2)}, p = ${p.toFixed(4)}.`}`,
      });

      hypothesisTesting.push({
        name: 'Chi-square test of independence',
        nullHypothesis: `H₀: No association between ${headers[colA]} and ${headers[colB]}.`,
        alternativeHypothesis: 'H₁: There is an association between the two variables.',
        testStatistic: 'χ²',
        statisticValue: chi2,
        pValue: p,
        alpha,
        conclusion: p < alpha ? 'reject' : 'fail_to_reject',
        interpretation:
          p < alpha
            ? `There is a statistically significant association between ${headers[colA]} and ${headers[colB]}, χ²(${df}) = ${chi2.toFixed(2)}, p = ${p.toFixed(4)}.`
            : `No significant association at α = 0.05, χ²(${df}) = ${chi2.toFixed(2)}, p = ${p.toFixed(4)}.`,
      });
    }
  }

  // --- Section 5: Linear Regression ---
  const section5 = 5;
  if (wants(options, 'linear_regression', allowedAnalyses) && analysisType === 'regression' && numericColIndices.length >= 2 && rowCount > 2) {
    const xCol = numericColIndices[0];
    const yCol = numericColIndices[1];
    const xVals = getNumericValues(rows, xCol);
    const yVals = getNumericValues(rows, yCol);
    const xName = headers[xCol] ?? 'X';
    const yName = headers[yCol] ?? 'Y';
    const { slope, intercept, r2, pValue } = simpleLinearRegression(xVals, yVals);
    statistics['Regression slope'] = slope.toFixed(4);
    statistics['Regression intercept'] = intercept.toFixed(4);
    statistics['R²'] = r2.toFixed(4);
    statistics['Slope p-value'] = pValue.toFixed(4);
    methodParts.push(`Simple linear regression (${yName} on ${xName}); assumes linearity and homoscedasticity.`);
    tables.push({
      sectionLabel: `Section ${section5}: ${SECTION_LABELS[section5]}`,
      sectionNum: section5,
      tableNum: '5.1',
      title: `Table 5.1: Linear regression (${yName} on ${xName})`,
      headers: ['Statistic', 'Value'],
      rows: [
        ['Slope (b)', slope.toFixed(4)],
        ['Intercept (a)', intercept.toFixed(4)],
        ['R²', r2.toFixed(4)],
        ['p-value (slope ≠ 0)', pValue.toFixed(4)],
        ['Equation', `ŷ = ${intercept.toFixed(2)} + ${slope.toFixed(2)} × ${xName}`],
      ],
      interpretation: `${purposePrefix}A unit increase in ${xName} is associated with a ${slope.toFixed(2)} change in ${yName}. The model explains ${(r2 * 100).toFixed(1)}% of the variance. ${pValue < alpha ? 'The slope is statistically significant.' : 'The slope is not significant at α = 0.05.'}`,
    });
    chartData.push({
      name: `Regression: ${yName} on ${xName}`,
      data: [
        { label: 'Slope', value: slope },
        { label: 'Intercept', value: intercept },
        { label: 'R²', value: r2 },
      ],
    });
  }

  // --- Section 6: K-means Clustering ---
  const section6 = 6;
  if (wants(options, 'k_means_clustering', allowedAnalyses) && analysisType === 'clustering' && numericColIndices.length >= 1 && rowCount > 2) {
    const k = Math.min(3, Math.max(2, Math.floor(Math.sqrt(rowCount / 2))));
    const dataRows = rows.slice(1).map((r) => numericColIndices.map((i) => parseFloat(r[i] ?? '0')).filter((v) => !isNaN(v)));
    const validRows = dataRows.filter((row) => row.length === numericColIndices.length);
    if (validRows.length >= k) {
      const { labels, centroids } = kMeans(validRows, k);
      const clusterCounts = new Array(k).fill(0);
      labels.forEach((l) => { clusterCounts[l]++; });
      statistics['Clusters (k)'] = k;
      methodParts.push(`K-means clustering (k = ${k}) on ${numericColIndices.length} numeric variable(s).`);
      const clusterRows: (string | number)[][] = clusterCounts.map((count, i) => [`Cluster ${i + 1}`, count, centroids[i]?.map((c) => c.toFixed(2)).join(', ') ?? '']);
      tables.push({
        sectionLabel: `Section ${section6}: ${SECTION_LABELS[section6]}`,
        sectionNum: section6,
        tableNum: '6.1',
        title: 'Table 6.1: K-means cluster sizes and centroids',
        headers: ['Cluster', 'Count', 'Centroid (numeric vars)'],
        rows: clusterRows,
        interpretation: `${purposePrefix}K-means with k = ${k} produced ${clusterCounts.join(', ')} observations per cluster. Centroids are reported above. Consider normalizing variables and using elbow/silhouette methods to choose k.`,
      });
      chartData.push({
        name: 'Cluster sizes',
        data: clusterCounts.map((count, i) => ({ label: `Cluster ${i + 1}`, value: count })),
      });
    }
  }

  // --- Section 7: Time Series Trend ---
  const section7 = 7;
  if (wants(options, 'time_trend', allowedAnalyses) && analysisType === 'time-series' && numericColIndices.length >= 1 && rowCount > 2) {
    const timeIndex = Array.from({ length: rowCount - 1 }, (_, i) => i + 1);
    const yVals = getNumericValues(rows, numericColIndices[0]);
    const yName = headers[numericColIndices[0]] ?? 'Value';
    const { slope, intercept, r2, pValue } = simpleLinearRegression(timeIndex, yVals);
    statistics['Trend slope'] = slope.toFixed(4);
    statistics['Trend R²'] = r2.toFixed(4);
    statistics['Trend p-value'] = pValue.toFixed(4);
    methodParts.push('Linear trend (value regressed on time index); assumes linear trend over time.');
    tables.push({
      sectionLabel: `Section ${section7}: ${SECTION_LABELS[section7]}`,
      sectionNum: section7,
      tableNum: '7.1',
      title: `Table 7.1: Linear trend for ${yName}`,
      headers: ['Statistic', 'Value'],
      rows: [
        ['Slope (per time unit)', slope.toFixed(4)],
        ['Intercept', intercept.toFixed(4)],
        ['R²', r2.toFixed(4)],
        ['p-value (trend ≠ 0)', pValue.toFixed(4)],
      ],
      interpretation: `${purposePrefix}${yName} shows a ${slope >= 0 ? 'positive' : 'negative'} linear trend over time. The trend explains ${(r2 * 100).toFixed(1)}% of the variance. ${pValue < alpha ? 'The trend is statistically significant.' : 'The trend is not significant at α = 0.05.'}`,
    });
    chartData.push({
      name: `Trend: ${yName}`,
      data: [
        { label: 'Slope', value: slope },
        { label: 'R²', value: r2 },
      ],
    });
  }

  // --- Section 8: Word Frequency (Text Analysis) ---
  const section8 = 8;
  if (wants(options, 'word_frequency', allowedAnalyses) && analysisType === 'text-analysis' && categoricalColIndices.length >= 1 && rowCount > 1) {
    const textCol = categoricalColIndices[0];
    const colName = headers[textCol] ?? 'Text';
    const wordCount: Record<string, number> = {};
    rows.slice(1).forEach((r) => {
      const text = (r[textCol] ?? '').toString().toLowerCase();
      text.split(/\s+/).filter((w) => w.length > 1).forEach((w) => {
        const clean = w.replace(/[^\w]/g, '');
        if (clean.length > 0) wordCount[clean] = (wordCount[clean] ?? 0) + 1;
      });
    });
    const sorted = Object.entries(wordCount).sort((a, b) => b[1] - a[1]).slice(0, 20);
    const totalWords = sorted.reduce((a, [, c]) => a + c, 0);
    methodParts.push(`Word frequency (top 20) from column "${colName}".`);
    tables.push({
      sectionLabel: `Section ${section8}: ${SECTION_LABELS[section8]}`,
      sectionNum: section8,
      tableNum: '8.1',
      title: `Table 8.1: Word frequency (${colName})`,
      headers: [colName, 'Frequency', 'Percentage (%)'],
      rows: sorted.map(([word, count]) => [word, count, totalWords > 0 ? ((100 * count) / totalWords).toFixed(1) : '0']),
      interpretation: `${purposePrefix}Top 20 word frequencies from "${colName}". Use for thematic or keyword summary in text analysis.`,
    });
    chartData.push({
      name: `Word frequency: ${colName}`,
      data: sorted.slice(0, 10).map(([label, value]) => ({ label, value })),
    });
  }

  const methodUsed = methodParts.length > 0 ? methodParts.join('; ') : 'Descriptive summary';

  // --- Interpretation (academic style) ---
  const findings: string[] = [];
  if (numericColIndices.length > 0) {
    numericColIndices.slice(0, 3).forEach((colIndex) => {
      const colName = headers[colIndex] ?? `Column ${colIndex + 1}`;
      const mean = statistics[`${colName} - Mean`];
      const std = statistics[`${colName} - Std Dev`];
      if (mean != null && std != null) {
        findings.push(`${colName} had a mean of ${mean} (SD = ${std}).`);
      }
    });
  }
  let significanceStatement: string | null = null;
  const effectSizeParts: string[] = [];
  if (hypothesisTesting.length > 0) {
    const last = hypothesisTesting[hypothesisTesting.length - 1];
    significanceStatement =
      last.conclusion === 'reject'
        ? `The null hypothesis was rejected at α = ${last.alpha} (p = ${last.pValue.toFixed(4)}).`
        : `The null hypothesis was not rejected at α = ${last.alpha} (p = ${last.pValue.toFixed(4)}).`;
    if (last.testStatistic === 'r (Pearson)') {
      const r2 = correlationR * correlationR;
      effectSizeParts.push(`The correlation explains approximately ${(r2 * 100).toFixed(1)}% of the variance (r² = ${r2.toFixed(3)}).`);
    }
    if (cohensD !== null) {
      const magnitude = Math.abs(cohensD) < 0.2 ? 'negligible' : Math.abs(cohensD) < 0.5 ? 'small' : Math.abs(cohensD) < 0.8 ? 'medium' : 'large';
      effectSizeParts.push(`Cohen's d = ${cohensD.toFixed(3)} (${magnitude} effect).`);
    }
    if (cramersV !== null) {
      const magnitude = cramersV < 0.1 ? 'negligible' : cramersV < 0.3 ? 'small' : cramersV < 0.5 ? 'medium' : 'large';
      effectSizeParts.push(`Cramér's V = ${cramersV.toFixed(3)} (${magnitude} effect size for association).`);
    }
  }
  const effectSizeStatement = effectSizeParts.length > 0 ? effectSizeParts.join(' ') : null;

  const academicParagraph = [
    purposePrefix ? `This analysis is interpreted in light of the research purpose: "${purpose}". ` : '',
    `This analysis used ${methodUsed}.`,
    findings.length > 0 ? findings.join(' ') : '',
    significanceStatement ? significanceStatement : '',
    effectSizeStatement ? effectSizeStatement : '',
  ]
    .filter(Boolean)
    .join(' ');

  const interpretation_json: InterpretationJson = {
    methodSummary: methodUsed,
    findings,
    significanceStatement,
    effectSizeStatement,
    academicParagraph: academicParagraph.trim() || 'No interpretation generated.',
  };

  // --- Summary ---
  const summary = `Analysis completed using ${application.toUpperCase()} for ${analysisType.replace('-', ' ')}. Processed ${rowCount} rows with ${colCount} columns. ${methodUsed}. ${numericColIndices.length > 0 ? `Identified ${numericColIndices.length} numeric column(s) for quantitative analysis.` : ''}`;

  // --- Insights ---
  const insights: string[] = [];
  insights.push(`Dataset contains ${rowCount} observations across ${colCount} variables.`);
  if (numericColIndices.length > 0) {
    insights.push(`Descriptive statistics were computed for ${numericColIndices.length} numeric column(s).`);
  }
  if (categoricalColIndices.length > 0) {
    insights.push(`Frequency and percentage tables were produced for ${categoricalColIndices.length} categorical variable(s).`);
  }
  if (hypothesisTesting.length > 0) {
    insights.push(`${hypothesisTesting.length} hypothesis test(s) were performed; results are reported in the Hypothesis Testing section.`);
  }
  if (tables.some((t) => t.sectionNum === 5)) insights.push('Linear regression was performed; slope, intercept, R², and p-value are reported.');
  if (tables.some((t) => t.sectionNum === 6)) insights.push('K-means clustering was performed; cluster sizes and centroids are reported.');
  if (tables.some((t) => t.sectionNum === 7)) insights.push('Time-series linear trend was computed; trend slope and R² are reported.');
  if (tables.some((t) => t.sectionNum === 8)) insights.push('Word frequency (text analysis) was computed; top 20 words are reported.');

  // --- Context-aware recommendations (tied to what was actually done) ---
  const recommendations: string[] = [];
  if (analysisType === 'statistical') {
    if (hypothesisTesting.some((t) => t.name.includes('t-test') || t.name.includes('Chi-square'))) {
      recommendations.push('Report the test statistic, degrees of freedom, p-value, and effect size where applicable in your thesis.');
    }
    if (numericColIndices.length > 0 && !hypothesisTesting.some((t) => t.name.includes('normality'))) {
      recommendations.push('If you plan to use further parametric tests (e.g., ANOVA), consider checking normality (e.g., Shapiro–Wilk) and homogeneity of variance.');
    }
    recommendations.push('Use the descriptive statistics and frequency tables for data presentation in your results section.');
  }
  if (analysisType === 'correlation') {
    if (correlationP < 0.05) {
      recommendations.push('Report the correlation coefficient (r) and p-value; consider reporting r² as a measure of shared variance.');
    }
    recommendations.push('For non-linear or ordinal data, consider Spearman or Kendall correlation.');
  }
  if (analysisType === 'regression') {
    recommendations.push('Ensure you have one dependent and one or more independent variables; check linearity and residual assumptions.');
  }
  if (analysisType === 'clustering') {
    recommendations.push('Normalize numeric features before clustering; use elbow or silhouette methods to choose the number of clusters.');
  }
  if (application === 'excel') {
    recommendations.push('For advanced tests (t-test, ANOVA, correlation), you can use Excel’s Data Analysis ToolPak or paste results from this report.');
  }

  return {
    summary,
    methodUsed,
    statistics,
    tables,
    interpretation_json,
    hypothesisTesting,
    chartData,
    insights,
    recommendations,
  };
}
