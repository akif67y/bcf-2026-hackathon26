// eslint-disable-next-line @typescript-eslint/no-require-imports
// const pdf = require('pdf-parse');

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
    // const data = await pdf(buffer);
    // return data.text;
    return "Dummy PDF text for testing (pdf-parse disabled)";
}
