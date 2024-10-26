import path from "path";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import fs from "fs";
import PDFParser from "pdf2json";
import { fileURLToPath } from "url";
import { PdfReader } from "pdfreader";
import { ApiError } from "../utils/ApiError.js";
import { Invester } from "../models/invester.model.js";

const getAllInvester = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200));
});

const extractFileText1 = asyncHandler((req, res) => {
  const file = req.file;
  console.log("file", file);

  const pdfParser = new PDFParser();

  pdfParser.on("readable", (meta) => console.log("PDF Metadata", meta));
  pdfParser.on("pdfParser_dataReady", (pdfData) => {
    let textContent = "";
    // console.log("pdfData", pdfData);
    pdfData.Pages.forEach((page) => {
      console.log("page", page);
      page.Texts.forEach((text) => {
        text.R.forEach((textRun) => {
          textContent += decodeURIComponent(textRun.T);
        });
        textContent += " "; // Space between different text objects
      });
      textContent += "\n"; // Newline between pages
    });

    console.log("pdfParser.getRawTextContent()", textContent);
  });

  pdfParser.on("error", (err) => console.error("Parser Error", err));

  pdfParser.loadPDF(file.path);
  res.status(200).json(new ApiResponse(200, { message: "Ok", file }));
});

function parsePdf(file) {
  return new Promise((resolve, reject) => {
    let textContent = "";

    new PdfReader().parseFileItems(file.path, (err, item) => {
      if (err) {
        return reject(
          "Something went wrong while reading the PDF content, Please try again"
        );
      }
      if (!item) {
        // End of file, resolve with the collected text content
        return resolve(textContent);
      }
      if (item.text) {
        console.log("item.text", item.text);
        textContent += item.text;
      }
    });
  });
}

const extractFileText = asyncHandler(async (req, res) => {
  const file = req.file;
  console.log("file", file);

  try {
    const textContent = await parsePdf(req.file); // Assuming req.file contains the file data
    res.status(200).json(new ApiResponse(200, textContent));
  } catch (error) {
    res
      .status(error.status || 500)
      .json(new ApiResponse(error.status || 500, { message: error.message }));
  }
});

const addInvesterPdfContent = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    throw new ApiError(401, "Content is required");
  }

  const invester = await Invester.create({
    content: content,
  });

  res.status(201).json(new ApiResponse(201, invester));
});

export { getAllInvester, extractFileText, addInvesterPdfContent };
