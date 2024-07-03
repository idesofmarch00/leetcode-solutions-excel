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
      { header: "Technique", key: "technique" },
      { header: "Topic", key: "topic" },
      { header: "Difficulty", key: "difficulty" },
    ];
  }

  // Create a mapping of column keys to column indices
  const columnKeyToIndex = {};
  sheet.columns.forEach((col, index) => {
    columnKeyToIndex[col.key] = index + 1; // ExcelJS columns are 1-based
  });

  // Get list of changed files
  const status = await git.status();
  const changedFiles = status.files.filter(
    (file) =>
      file.path.endsWith(".js") && !file.path.includes("update-excel.js")
  );

  for (const file of changedFiles) {
    const content = fs.readFileSync(file.path, "utf8");
    const metadata = extractMetadata(content);

    console.log(metadata);

    if (metadata) {
      //todo:fix existing/target row logic (currently not working : always adding new row)
      // Get the total number of rows in the sheet
      const rowCount = sheet.rowCount;

      // Replace the existing row finding logic with this:
      let targetRow;
      for (let i = 1; i <= rowCount; i++) {
        const row = sheet.getRow(i);
        const rowValues = row.values;
        if (
          rowValues &&
          rowValues[columnKeyToIndex["questionNo"]] === metadata.questionNo
        ) {
          targetRow = row;
          break;
        }
      }

      if (targetRow) {
        sheet.columns.forEach((column) => {
          if (metadata[column.key] !== undefined) {
            targetRow.getCell(column.key).value = metadata[column.key];
          }
        });
        console.log("Updated existing row with metadata.");
      } else {
        const newRowData = Object.keys(metadata).map((key) => metadata[key]);
        sheet.addRow(newRowData);
        console.log("New row added with metadata.");
      }

      // Log the contents of the sheet to verify the row was added
      sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        console.log(`Row ${rowNumber}:`, row.values);
      });
    }
  }

  await workbook.xlsx.writeFile("leetcode_solutions.xlsx");
  console.log("Excel sheet updated successfully.");
}

function extractMetadata(content) {
  const metadataRegex = /\/\*\s*Metadata:([\s\S]*?)\*\//;
  const match = content.match(metadataRegex);
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
