// pdf-parse v1 ships types only for its root entry, but the root entry runs debug code when
// imported outside CommonJS, so tests import the library file directly.
declare module 'pdf-parse/lib/pdf-parse.js' {
  interface PdfParseResult {
    text: string;
    numpages: number;
  }
  function pdfParse(data: Buffer): Promise<PdfParseResult>;
  export default pdfParse;
}
