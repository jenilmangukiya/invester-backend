import fs from "fs";
import PDFParser from "pdf2json";

const pdfParser = new PDFParser(this, 1);

pdfParser.on("pdfParser_dataError", (errData) =>
  console.error(errData.parserError)
);
pdfParser.on("pdfParser_dataReady", (pdfData) => {
  fs.writeFile(
    "./pdf2json/test/F1040EZ.content.txt",
    pdfParser.getRawTextContent(),
    () => {
      console.log("Done.", pdfParser.getRawTextContent());
    }
  );
});

pdfParser.loadPDF("./file-sample_150kB.pdf");
