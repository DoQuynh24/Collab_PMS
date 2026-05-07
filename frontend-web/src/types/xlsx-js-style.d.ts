declare module 'xlsx-js-style' {
  import * as XLSX from 'xlsx';

  interface CellStyle {
    font?: {
      bold?: boolean;
      italic?: boolean;
      sz?: number;
      color?: { rgb: string };
      underline?: boolean;
    };
    fill?: {
      patternType?: string;
      fgColor?: { rgb: string };
      bgColor?: { rgb: string };
    };
    border?: {
      top?: { style: string; color?: { rgb: string } };
      bottom?: { style: string; color?: { rgb: string } };
      left?: { style: string; color?: { rgb: string } };
      right?: { style: string; color?: { rgb: string } };
    };
    alignment?: {
      horizontal?: 'left' | 'center' | 'right';
      vertical?: 'top' | 'center' | 'bottom';
      wrapText?: boolean;
    };
  }

  interface StyledCell {
    v: any;
    t?: string;
    s?: CellStyle;
    f?: string;
    z?: string;
  }

  interface StyledWorksheet extends XLSX.WorkSheet {
    [cell: string]: StyledCell | any;
  }

  const utils: typeof XLSX.utils;
  function writeFile(wb: XLSX.WorkBook, filename: string, opts?: XLSX.WritingOptions): void;
  function write(wb: XLSX.WorkBook, opts?: XLSX.WritingOptions): any;
}
