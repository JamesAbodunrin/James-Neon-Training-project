interface AnalysisResult {
  summary: string;
  statistics: Record<string, string | number>;
  insights: string[];
  recommendations: string[];
}

export function analyzeData(
  data: string,
  analysisType: string | null,
  application: string | null
): AnalysisResult {
  if (!data.trim()) {
    return {
      summary: 'No data provided. Please input or upload your data to begin analysis.',
      statistics: {},
      insights: [],
      recommendations: [],
    };
  }

  if (!analysisType || !application) {
    return {
      summary: 'Please select an analysis type and application to proceed.',
      statistics: {},
      insights: [],
      recommendations: [],
    };
  }

  // Parse data (simple CSV parser)
  const lines = data.trim().split('\n');
  const rows = lines.map((line) => line.split(',').map((cell) => cell.trim()));
  
  // Basic statistics
  const rowCount = rows.length;
  const colCount = rows[0]?.length || 0;
  const dataSize = data.length;
  
  // Try to detect numeric columns
  const numericColumns: number[] = [];
  if (rows.length > 1) {
    for (let i = 0; i < colCount; i++) {
      const firstValue = rows[1]?.[i];
      if (firstValue && !isNaN(parseFloat(firstValue))) {
        numericColumns.push(i);
      }
    }
  }

  // Calculate basic statistics for numeric columns
  const statistics: Record<string, string | number> = {
    'Total Rows': rowCount,
    'Total Columns': colCount,
    'Data Size': `${(dataSize / 1024).toFixed(2)} KB`,
    'Numeric Columns': numericColumns.length,
  };

  if (numericColumns.length > 0 && rows.length > 1) {
    numericColumns.forEach((colIndex) => {
      const values = rows.slice(1)
        .map((row) => parseFloat(row[colIndex] || '0'))
        .filter((val) => !isNaN(val));
      
      if (values.length > 0) {
        const sum = values.reduce((a, b) => a + b, 0);
        const mean = sum / values.length;
        const sorted = [...values].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        const min = Math.min(...values);
        const max = Math.max(...values);
        const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);

        const colName = rows[0]?.[colIndex] || `Column ${colIndex + 1}`;
        statistics[`${colName} - Mean`] = mean.toFixed(2);
        statistics[`${colName} - Median`] = median.toFixed(2);
        statistics[`${colName} - Min`] = min.toFixed(2);
        statistics[`${colName} - Max`] = max.toFixed(2);
        statistics[`${colName} - Std Dev`] = stdDev.toFixed(2);
      }
    });
  }

  // Generate insights based on analysis type
  const insights: string[] = [];
  const recommendations: string[] = [];

  switch (analysisType) {
    case 'statistical':
      insights.push(`Dataset contains ${rowCount} observations across ${colCount} variables.`);
      if (numericColumns.length > 0) {
        insights.push(`Found ${numericColumns.length} numeric columns suitable for statistical analysis.`);
      }
      recommendations.push('Consider performing normality tests before applying parametric tests.');
      recommendations.push('Use descriptive statistics to understand data distribution.');
      break;

    case 'regression':
      insights.push('Regression analysis requires at least one dependent and one independent variable.');
      if (numericColumns.length >= 2) {
        insights.push(`Dataset has ${numericColumns.length} numeric columns suitable for regression modeling.`);
      }
      recommendations.push('Check for multicollinearity if using multiple independent variables.');
      recommendations.push('Validate assumptions: linearity, homoscedasticity, and normality of residuals.');
      break;

    case 'correlation':
      if (numericColumns.length >= 2) {
        insights.push(`Can analyze correlations between ${numericColumns.length} numeric variables.`);
      }
      recommendations.push('Use Pearson correlation for linear relationships, Spearman for monotonic.');
      recommendations.push('Consider correlation matrix visualization for multiple variables.');
      break;

    case 'clustering':
      insights.push('Clustering analysis requires numeric features for distance calculation.');
      if (numericColumns.length >= 2) {
        insights.push(`Dataset suitable for clustering with ${numericColumns.length} features.`);
      }
      recommendations.push('Determine optimal number of clusters using elbow method or silhouette score.');
      recommendations.push('Normalize features before clustering to avoid scale bias.');
      break;

    case 'time-series':
      insights.push('Time series analysis requires temporal ordering of data.');
      recommendations.push('Check for stationarity and seasonality in the data.');
      recommendations.push('Consider decomposition methods (trend, seasonal, residual).');
      break;

    case 'text-analysis':
      insights.push('Text analysis requires text data in string format.');
      recommendations.push('Preprocess text: remove stopwords, tokenize, and normalize.');
      recommendations.push('Consider sentiment analysis or topic modeling based on research goals.');
      break;
  }

  // Application-specific recommendations
  switch (application) {
    case 'python':
      recommendations.push('Use pandas for data manipulation and scikit-learn for machine learning.');
      break;
    case 'r':
      recommendations.push('Leverage R packages like dplyr, ggplot2, and caret for analysis.');
      break;
    case 'excel':
      recommendations.push('Use Excel functions like CORREL, LINEST, and Data Analysis ToolPak.');
      break;
  }

  const summary = `Analysis completed using ${application.toUpperCase()} for ${analysisType.replace('-', ' ')}. 
    Processed ${rowCount} rows with ${colCount} columns. 
    ${numericColumns.length > 0 ? `Identified ${numericColumns.length} numeric columns for quantitative analysis.` : 'Text-based analysis recommended.'}`;

  return {
    summary,
    statistics,
    insights,
    recommendations,
  };
}

