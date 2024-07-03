const ExcelJS = require("exceljs");
const simpleGit = require("simple-git");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const git = simpleGit();
const workbook = new ExcelJS.Workbook();
const sheetName = "LeetCode Solutions";

async function updateExcelSheet() {
  let sheet;

  // Load existing workbook or create a new one
  try {
    await workbook.xlsx.readFile("leetcode_solutions.xlsx");
    sheet = workbook.getWorksheet(sheetName);
  } catch (error) {
    sheet = workbook.addWorksheet(sheetName);
    sheet.columns = [
      { header: "Question No.", key: "questionNo" },
      { header: "Problem Name", key: "problemName" },
      { header: "Problem Statement", key: "problemStatement" },
      { header: "Solution", key: "solution" },
      { header: "Technique", key: "technique" },
      { header: "Topic", key: "topic" },
      { header: "Difficulty", key: "difficulty" },
    ];
  }

  // Get list of changed files
  const status = await git.status();
  const changedFiles = status.files.filter(
    (file) =>
      file.path.endsWith(".js") && !file.path.includes("update-excel.js")
  );

  for (const file of changedFiles) {
    const content = fs.readFileSync(file.path, "utf8");
    const metadata = extractMetadata(content);

    if (metadata) {
      const existingRow = sheet.findRow(
        (row) => row.getCell("questionNo").value === metadata.questionNo
      );

      if (existingRow) {
        existingRow.values = metadata;
      } else {
        sheet.addRow(metadata);
      }
    }
  }

  await workbook.xlsx.writeFile("leetcode_solutions.xlsx");
  console.log("Excel sheet updated successfully.");
}

function extractMetadata(content) {
  console.log(content);
  const metadataRegex = /\/\*\s*Metadata:([\s\S]*?)\*\//;
  const match = content.match(metadataRegex);
  console.log(match);
  if (match) {
    const metadataString = match[1];
    const metadata = {};
    metadataString.split("\n").forEach((line) => {
      const [key, value] = line.split(":").map((s) => s.trim());
      if (key && value) {
        metadata[key] = value;
      }
    });
    return metadata;
  }

  return null;
}

updateExcelSheet().catch(console.error);
