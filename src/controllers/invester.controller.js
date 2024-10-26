import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import PDFParser from "pdf2json";
import { PdfReader } from "pdfreader";
import { ApiError } from "../utils/ApiError.js";
import { Invester } from "../models/invester.model.js";
import { ObjectId } from "mongodb";

import fs from "fs";
import mongoose from "mongoose";

const getAllInvester = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType } = req.query;

  const aggregation = [];

  if (query) {
    const matchConditions = [
      { content: { $regex: new RegExp(query, "i") } },
      { name: { $regex: new RegExp(query, "i") } },
    ];

    // Check if the query is a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(query)) {
      matchConditions.push({ _id: new ObjectId(query) });
    }

    aggregation.push({
      $match: {
        $or: matchConditions,
      },
    });
  }

  if (sortBy && ["name", "content", "createdAt"].includes(sortBy)) {
    const sortOrder = sortType.toLowerCase() === "desc" ? -1 : 1;
    aggregation.push({
      $sort: {
        [sortBy]: sortOrder,
      },
    });
  }

  const options = {
    page: +page,
    limit: +limit,
  };

  const pipeline = Invester.aggregate(aggregation);

  const investersPaginated = await Invester.aggregatePaginate(
    pipeline,
    options
  );

  res.status(200).json(new ApiResponse(200, investersPaginated));
});

const extractFileText1 = asyncHandler((req, res) => {
  const file = req.file;
  console.log("file", file);

  const pdfParser = new PDFParser();

  pdfParser.on("readable", (meta) => console.log("PDF Metadata", meta));
  pdfParser.on("pdfParser_dataReady", (pdfData) => {
    let textContent = "";

    pdfData.Pages.forEach((page) => {
      page.Texts.forEach((text) => {
        text.R.forEach((textRun) => {
          textContent += decodeURIComponent(textRun.T);
        });
        textContent += " "; // Space between different text objects
      });
      textContent += "\n"; // Newline between pages
    });
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
        textContent += item.text;
      }
    });
  });
}

const extractFileText = asyncHandler(async (req, res) => {
  const file = req.file;

  try {
    const textContent = await parsePdf(req.file); // Assuming req.file contains the file data
    fs.unlinkSync(req.file.path);
    res.status(200).json(new ApiResponse(200, textContent));
  } catch (error) {
    res
      .status(error.status || 500)
      .json(new ApiResponse(error.status || 500, { message: error.message }));
  }
});

const addInvesterPdfContent = asyncHandler(async (req, res) => {
  const { content, name } = req.body;

  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  const invester = await Invester.create({
    content,
    name,
  });

  res.status(201).json(new ApiResponse(201, invester));
});

const matchInvester = asyncHandler(async (req, res) => {
  const { location, size, money, industry } = req.body;

  // Initialize an empty array for query conditions
  const conditions = [];

  // Check and add conditions based on the presence of parameters
  if (location) {
    conditions.push({ content: new RegExp(location, "i") });
  }
  if (size) {
    conditions.push({ content: new RegExp(size, "i") });
  }
  if (money) {
    conditions.push({ content: new RegExp(`\\b${money}\\b`, "i") });
  }
  if (industry) {
    conditions.push({ content: new RegExp(industry, "i") });
  }

  // Check if there are any conditions to apply
  if (conditions.length === 0) {
    return res.json({
      success: false,
      message: "No search criteria provided.",
    });
  }

  // Construct the query using the conditions
  const query = { $and: conditions };

  const investors = await Invester.find(query);

  // Structure the response
  const response = investors.map((investor) => ({
    content: investor.content,
  }));

  res.json({ success: true, investors: response });
});

const deleteInvester = asyncHandler(async (req, res) => {
  const { investerId } = req.params;

  // check if the Comment Id is in correct format
  if (!mongoose.Types.ObjectId.isValid(investerId))
    throw new ApiError(404, "Invalid Comment");

  const comment = await Invester.findByIdAndDelete(investerId);

  if (!comment) {
    throw new ApiError("Failed to delete Invester!, Please try again");
  }

  res
    .status(200)
    .json(new ApiResponse(200, null, "Invester deleted successfully"));
});

export {
  getAllInvester,
  extractFileText,
  addInvesterPdfContent,
  matchInvester,
  deleteInvester,
};
