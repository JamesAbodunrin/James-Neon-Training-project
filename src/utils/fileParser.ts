/**
 * Parse uploaded files (.csv, .xlsx, .docx, .pdf, .txt) into CSV string for analysis.
 * Robust error handling: never throws; returns { data, error }.
 */

import * as XLSX from 'xlsx';
import { parseCSVLine, rowsToCSVString } from './csvUtils';

export interface ParseResult {
  data: string;
  error?: string;
  fileName?: string;
}

export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

function textToCSV(text: string): string {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return '';
  const rows = lines.map((line) => parseCSVLine(line));
  return rowsToCSVString(rows);
}

/** Parse CSV file (UTF-8) */
async function parseCSVFile(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = (reader.result as string) || '';
        const data = textToCSV(text);
        if (!data.trim()) {
          resolve({ data: '', error: 'The file appears to be empty.' });
          return;
        }
        resolve({ data, fileName: file.name });
      } catch (e) {
        resolve({
          data: '',
          error: `Could not parse CSV: ${e instanceof Error ? e.message : 'Unknown error'}.`,
          fileName: file.name,
        });
      }
    };
    reader.onerror = () =>
      resolve({ data: '', error: 'Failed to read the file.', fileName: file.name });
    reader.readAsText(file, 'UTF-8');
  });
}

/** Parse XLSX file: first sheet to CSV */
async function parseXLSXFile(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const ab = reader.result as ArrayBuffer;
        const wb = XLSX.read(ab, { type: 'array', raw: true });
        const firstSheet = wb.SheetNames[0];
        if (!firstSheet) {
          resolve({ data: '', error: 'The workbook has no sheets.', fileName: file.name });
          return;
        }
        const ws = wb.Sheets[firstSheet];
        const csv = XLSX.utils.sheet_to_csv(ws, { blankrows: false, strip: true });
        const data = textToCSV(csv);
        if (!data.trim()) {
          resolve({ data: '', error: 'The sheet appears to be empty.', fileName: file.name });
          return;
        }
        resolve({ data, fileName: file.name });
      } catch (e) {
        resolve({
          data: '',
          error: `Could not parse Excel file: ${e instanceof Error ? e.message : 'Unknown error'}.`,
          fileName: file.name,
        });
      }
    };
    reader.onerror = () =>
      resolve({ data: '', error: 'Failed to read the file.', fileName: file.name });
    reader.readAsArrayBuffer(file);
  });
}

/** Parse DOCX: extract text via mammoth then try table-like split */
async function parseDOCXFile(file: File): Promise<ParseResult> {
  try {
    const mammoth = await import('mammoth');
    const ab = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: ab });
    const text = (result.value || '').trim();
    if (!text) {
      return { data: '', error: 'No text could be extracted from the document.', fileName: file.name };
    }
    // Try to detect table structure: lines with tabs or multiple commas
    const data = textToCSV(text);
    if (!data.trim()) {
      return { data: '', error: 'The document text could not be converted to a table. Try CSV or XLSX for data.', fileName: file.name };
    }
    return { data, fileName: file.name };
  } catch (e) {
    return {
      data: '',
      error: `Could not read Word document: ${e instanceof Error ? e.message : 'Unknown error'}. Use CSV or XLSX for reliable analysis.`,
      fileName: file.name,
    };
  }
}

/** PDF: no client-side text extraction in this build; suggest CSV/XLSX */
async function parsePDFFile(_file: File): Promise<ParseResult> {
  return {
    data: '',
    error: 'PDF analysis is not supported in this version. Please export your data to CSV or XLSX and upload again.',
    fileName: _file.name,
  };
}

/** Plain text: try CSV/tab parsing */
async function parseTXTFile(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = (reader.result as string) || '';
        const data = textToCSV(text);
        if (!data.trim()) {
          resolve({ data: '', error: 'The file appears to be empty.', fileName: file.name });
          return;
        }
        resolve({ data, fileName: file.name });
      } catch (e) {
        resolve({
          data: '',
          error: `Could not parse file: ${e instanceof Error ? e.message : 'Unknown error'}.`,
          fileName: file.name,
        });
      }
    };
    reader.onerror = () =>
      resolve({ data: '', error: 'Failed to read the file.', fileName: file.name });
    reader.readAsText(file, 'UTF-8');
  });
}

const EXT = (name: string) => (name.split('.').pop() || '').toLowerCase();

/**
 * Parse an uploaded file to CSV string. Supports .csv, .xlsx, .docx, .txt.
 * PDF returns a friendly error. Never throws.
 */
export async function parseUploadedFile(file: File): Promise<ParseResult> {
  const ext = EXT(file.name);
  if (ext === 'csv') return parseCSVFile(file);
  if (ext === 'xlsx' || ext === 'xls') return parseXLSXFile(file);
  if (ext === 'docx' || ext === 'doc') return parseDOCXFile(file);
  if (ext === 'pdf') return parsePDFFile(file);
  if (ext === 'txt' || ext === 'tsv') return parseTXTFile(file);
  // Unknown: try as text (e.g. .data)
  return parseTXTFile(file);
}

export const ACCEPTED_EXTENSIONS = '.csv,.xlsx,.xls,.docx,.doc,.pdf,.txt,.tsv';
