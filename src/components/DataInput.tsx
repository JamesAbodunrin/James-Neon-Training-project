'use client';

import { useState, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { parseUploadedFile, MAX_FILE_SIZE_BYTES } from '@/utils/fileParser';

interface DataInputProps {
  onDataChange: (data: string) => void;
  selectedApplication: string | null;
  className?: string;
}

interface Cell {
  value: string;
}

export default function DataInput({ onDataChange, selectedApplication, className = '' }: DataInputProps) {
  const [inputMethod, setInputMethod] = useState<'manual' | 'upload'>('manual');
  const [manualData, setManualData] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Spreadsheet state for Excel
  const [spreadsheet, setSpreadsheet] = useState<Cell[][]>([
    [{ value: '' }, { value: '' }, { value: '' }, { value: '' }],
    [{ value: '' }, { value: '' }, { value: '' }, { value: '' }],
    [{ value: '' }, { value: '' }, { value: '' }, { value: '' }],
    [{ value: '' }, { value: '' }, { value: '' }, { value: '' }],
  ]);
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(4);

  // Python/R code editor state
  const [codeData, setCodeData] = useState('');

  // Convert spreadsheet to CSV
  const spreadsheetToCSV = (grid: Cell[][]): string => {
    return grid
      .map((row) => row.map((cell) => cell.value || '').join(','))
      .join('\n');
  };

  // Parse CSV to spreadsheet
  const csvToSpreadsheet = (csv: string): Cell[][] => {
    const lines = csv.trim().split('\n');
    return lines.map((line) =>
      line.split(',').map((cell) => ({ value: cell.trim() }))
    );
  };

  // Helper to notify parent of data changes
  const notifyDataChange = (data: string) => {
    setManualData(data);
    onDataChange(data);
  };

  const handleManualChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setManualData(value);
    onDataChange(value);
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setUploadError(`File size must be 20MB or less. This file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`);
      e.target.value = '';
      return;
    }
    setUploading(true);
    setFileName(file.name);
    try {
      const { data, error } = await parseUploadedFile(file);
      if (error) {
        setUploadError(error);
        setManualData('');
        onDataChange('');
        setFileName(null);
      } else {
        setManualData(data);
        onDataChange(data);
        if (selectedApplication === 'excel' && /\.(csv|txt|tsv)$/i.test(file.name)) {
          try {
            const parsed = csvToSpreadsheet(data);
            setSpreadsheet(parsed);
            setRows(parsed.length);
            setCols(parsed[0]?.length || 4);
          } catch {
            // ignore
          }
        }
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to read file.');
      setManualData('');
      onDataChange('');
      setFileName(null);
    } finally {
      setUploading(false);
    }
    e.target.value = '';
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleCellChange = (row: number, col: number, value: string) => {
    const newSpreadsheet = spreadsheet.map((r, rIdx) =>
      rIdx === row
        ? r.map((c, cIdx) => (cIdx === col ? { value } : c))
        : r
    );
    setSpreadsheet(newSpreadsheet);
    // Convert to CSV and notify parent
    const csv = spreadsheetToCSV(newSpreadsheet);
    notifyDataChange(csv);
  };

  const handleCellKeyDown = (e: KeyboardEvent<HTMLInputElement>, row: number, col: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (row < rows - 1) {
        setActiveCell({ row: row + 1, col });
      } else {
        // Add new row
        const newRow = Array(cols).fill(null).map(() => ({ value: '' }));
        setSpreadsheet([...spreadsheet, newRow]);
        setRows(rows + 1);
        setActiveCell({ row: row + 1, col });
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (col < cols - 1) {
        setActiveCell({ row, col: col + 1 });
      } else if (row < rows - 1) {
        setActiveCell({ row: row + 1, col: 0 });
      }
    } else if (e.key === 'ArrowRight' && col < cols - 1) {
      setActiveCell({ row, col: col + 1 });
    } else if (e.key === 'ArrowLeft' && col > 0) {
      setActiveCell({ row, col: col - 1 });
    } else if (e.key === 'ArrowDown' && row < rows - 1) {
      setActiveCell({ row: row + 1, col });
    } else if (e.key === 'ArrowUp' && row > 0) {
      setActiveCell({ row: row - 1, col });
    }
  };

  const addRow = () => {
    const newRow = Array(cols).fill(null).map(() => ({ value: '' }));
    const newSpreadsheet = [...spreadsheet, newRow];
    setSpreadsheet(newSpreadsheet);
    setRows(rows + 1);
    const csv = spreadsheetToCSV(newSpreadsheet);
    notifyDataChange(csv);
  };

  const addColumn = () => {
    const newSpreadsheet = spreadsheet.map((row) => [...row, { value: '' }]);
    setSpreadsheet(newSpreadsheet);
    setCols(cols + 1);
    const csv = spreadsheetToCSV(newSpreadsheet);
    notifyDataChange(csv);
  };

  const renderInputInterface = () => {
    if (inputMethod === 'upload') {
      return (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls,.docx,.doc,.pdf,.txt,.tsv"
            onChange={handleFileUpload}
            className="hidden"
            aria-label="Upload data file (CSV, Excel, Word, PDF, or text)"
          />
          {uploadError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {uploadError}
            </div>
          )}
          <div
            onClick={() => !uploading && handleFileClick()}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200 ${uploading ? 'border-gray-200 bg-gray-50 cursor-wait' : 'border-gray-300 cursor-pointer hover:border-blue-500 hover:bg-blue-50'}`}
          >
            {uploading ? (
              <div>
                <p className="text-gray-700 font-medium">Reading file…</p>
              </div>
            ) : fileName ? (
              <div>
                <svg className="w-12 h-12 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-900 font-medium">{fileName}</p>
                <p className="text-sm text-gray-600 mt-2">Click to upload a different file</p>
              </div>
            ) : (
              <div>
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-gray-900 font-medium mb-2">Click to upload a file</p>
                <p className="text-sm text-gray-600">Supports CSV, XLSX, DOCX, PDF, TXT</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Application-specific manual input interfaces
    switch (selectedApplication) {
      case 'excel':
        return (
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Excel Spreadsheet Interface
              </label>
              <div className="flex gap-2">
                <button
                  onClick={addRow}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  + Row
                </button>
                <button
                  onClick={addColumn}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  + Column
                </button>
              </div>
            </div>
            <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
              <div className="overflow-x-auto overflow-y-auto max-h-96">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="w-12 bg-gray-100 border border-gray-300 p-2 text-xs text-gray-600"></th>
                      {Array.from({ length: cols }).map((_, colIdx) => (
                        <th
                          key={colIdx}
                          className="min-w-32 bg-gray-100 border border-gray-300 p-2 text-xs text-gray-600 font-semibold"
                        >
                          {String.fromCharCode(65 + colIdx)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {spreadsheet.map((row, rowIdx) => (
                      <tr key={rowIdx}>
                        <td className="w-12 bg-gray-100 border border-gray-300 p-2 text-xs text-gray-600 text-center font-semibold">
                          {rowIdx + 1}
                        </td>
                        {row.map((cell, colIdx) => (
                          <td key={colIdx} className="border border-gray-300 p-0">
                            <input
                              type="text"
                              value={cell.value}
                              onChange={(e) => handleCellChange(rowIdx, colIdx, e.target.value)}
                              onFocus={() => setActiveCell({ row: rowIdx, col: colIdx })}
                              onKeyDown={(e) => handleCellKeyDown(e, rowIdx, colIdx)}
                              className={`w-full min-w-32 p-2 outline-none border-0 text-gray-900 text-base ${
                                activeCell?.row === rowIdx && activeCell?.col === colIdx
                                  ? 'bg-blue-100 ring-2 ring-blue-500'
                                  : 'bg-white hover:bg-gray-50'
                              }`}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Click cells to edit. Use Tab/Enter to navigate. Data is automatically saved.
            </p>
          </div>
        );

      case 'python':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Python Code Editor
            </label>
            <textarea
              value={codeData}
              onChange={(e) => {
                const newCode = e.target.value;
                setCodeData(newCode);
                onDataChange(newCode);
              }}
              placeholder={`import pandas as pd
import numpy as np

# Load your data
data = {
    'Name': ['John', 'Jane', 'Bob', 'Alice'],
    'Age': [25, 30, 28, 32],
    'Score': [85, 92, 78, 95]
}

df = pd.DataFrame(data)
print(df)`}
              className="w-full h-80 p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none font-mono text-sm text-gray-900 bg-white placeholder:text-gray-500"
            />
            <p className="mt-2 text-sm text-gray-600">
              Write Python code using pandas, numpy, or other data analysis libraries
            </p>
          </div>
        );

      case 'r':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              R Code Editor
            </label>
            <textarea
              value={codeData}
              onChange={(e) => {
                const newCode = e.target.value;
                setCodeData(newCode);
                onDataChange(newCode);
              }}
              placeholder={`library(dplyr)
library(ggplot2)

# Load your data
data <- data.frame(
  Name = c("John", "Jane", "Bob", "Alice"),
  Age = c(25, 30, 28, 32),
  Score = c(85, 92, 78, 95)
)

print(data)`}
              className="w-full h-80 p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none font-mono text-sm text-gray-900 bg-white placeholder:text-gray-500"
            />
            <p className="mt-2 text-sm text-gray-600">
              Write R code using dplyr, ggplot2, or other R packages
            </p>
          </div>
        );

      case 'matlab':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              MATLAB Matrix/Array Input
            </label>
            <textarea
              value={manualData}
              onChange={handleManualChange}
              placeholder="Enter MATLAB array format:&#10;[1 2 3; 4 5 6; 7 8 9]&#10;or&#10;data = [1, 2, 3; 4, 5, 6];"
              className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none font-mono text-sm text-gray-900 bg-white placeholder:text-gray-500"
            />
            <p className="mt-2 text-sm text-gray-600">
              Enter data in MATLAB matrix format (semicolon-separated rows, space/comma-separated columns)
            </p>
          </div>
        );

      case 'spss':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SPSS Data Input (Variable-Value Format)
            </label>
            <textarea
              value={manualData}
              onChange={handleManualChange}
              placeholder="Variable1 Variable2 Variable3&#10;Value1 Value2 Value3&#10;Value4 Value5 Value6"
              className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none font-mono text-sm text-gray-900 bg-white placeholder:text-gray-500"
            />
            <p className="mt-2 text-sm text-gray-600">
              Enter data with variable names in the first row, followed by tab or space-separated values
            </p>
          </div>
        );

      case 'nltk':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text Data Input
            </label>
            <textarea
              value={manualData}
              onChange={handleManualChange}
              placeholder="Enter your text data here for sentiment analysis, topic modeling, or NLP processing..."
              className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none text-gray-900 bg-white placeholder:text-gray-500"
            />
            <p className="mt-2 text-sm text-gray-600">
              Enter text data for natural language processing and text analysis
            </p>
          </div>
        );

      default:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter your data (CSV, JSON, or plain text format)
            </label>
            <textarea
              value={manualData}
              onChange={handleManualChange}
              placeholder="Paste your data here...&#10;Example CSV:&#10;Name,Age,Score&#10;John,25,85&#10;Jane,30,92"
              className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none font-mono text-sm text-gray-900 bg-white placeholder:text-gray-500"
            />
            <p className="mt-2 text-sm text-gray-600">
              Supports CSV, JSON, or tab-separated values. Select an application for specialized input.
            </p>
          </div>
        );
    }
  };

  return (
    <div className={className}>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Input Your Data</h2>
      
      {/* Toggle between manual and upload */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setInputMethod('manual')}
          className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
            inputMethod === 'manual'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Manual Input
        </button>
        <button
          onClick={() => setInputMethod('upload')}
          className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
            inputMethod === 'upload'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Upload File
        </button>
      </div>

      {selectedApplication ? (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Selected:</span> {selectedApplication.toUpperCase()} - 
            {selectedApplication === 'excel' && ' Using spreadsheet interface'}
            {selectedApplication === 'python' && ' Using Python code editor'}
            {selectedApplication === 'r' && ' Using R code editor'}
            {selectedApplication === 'matlab' && ' Using MATLAB matrix format'}
            {selectedApplication === 'spss' && ' Using SPSS variable format'}
            {selectedApplication === 'nltk' && ' Using text input'}
          </p>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Please select an application to see the appropriate input interface
          </p>
        </div>
      )}

      {renderInputInterface()}
    </div>
  );
}
