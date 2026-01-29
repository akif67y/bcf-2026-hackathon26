import PDFParser from 'pdf2json';

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
        // 1. Initialize parser (default mode = JSON)
        const parser = new PDFParser();

        // 2. Handle Errors
        parser.on("pdfParser_dataError", (errData: any) => {
            console.error("PDF Parser Error:", errData.parserError);
            reject(new Error(errData.parserError));
        });

        // 3. Handle Success
        parser.on("pdfParser_dataReady", (pdfData: any) => {
            try {
                // pdf2json returns a deeply nested object.
                // Pages -> Texts -> R (Array of runs) -> T (Text, URI encoded)

                let fullText = '';

                if (!pdfData || !pdfData.Pages) {
                    // Fallback or empty
                    resolve('');
                    return;
                }

                for (const page of pdfData.Pages) {
                    if (page.Texts) {
                        for (const textItem of page.Texts) {
                            if (textItem.R) {
                                for (const run of textItem.R) {
                                    // The text is URI encoded (e.g., "Hello%20World")
                                    if (run.T) {
                                        fullText += decodeURIComponent(run.T);
                                    }
                                }
                            }
                            // Add a space after each text block to simulate layout (rough approximation)
                            fullText += ' ';
                        }
                    }
                    // Add newline between pages
                    fullText += '\n\n';
                }

                resolve(fullText.trim());

            } catch (err) {
                console.error("Error parsing extract text from JSON:", err);
                reject(err);
            }
        });

        // 4. Start Parsing
        parser.parseBuffer(buffer);
    });
}
