import fs from "node:fs/promises";
import path from "node:path";

import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const repoRoot = path.resolve(import.meta.dirname, "..");
const defaultDataPath = path.join(repoRoot, "audit", "feature-audit.json");

const STATUS_COLUMNS = {
  storyStatus: {
    header: "Story Status",
    values: ["Identified", "Deprecated"],
  },
  baselineTestStatus: {
    header: "Baseline Test Status",
    values: ["Pending", "Pass", "Fail", "Partial", "Blocked"],
  },
  errorStatus: {
    header: "Error Status",
    values: ["Not tested", "No issues", "Open issue", "Fixed"],
  },
  fixStatus: {
    header: "Fix Status",
    values: ["Not started", "In progress", "Done", "N/A"],
  },
  retestStatus: {
    header: "Retest Status",
    values: ["Pending", "Pass", "Fail", "N/A"],
  },
};

const COLUMN_KEYS = [
  "id",
  "area",
  "surface",
  "feature",
  "userStory",
  "expectedBehavior",
  "evidence",
  "baselineMethod",
  "storyStatus",
  "baselineTestStatus",
  "errorStatus",
  "fixStatus",
  "retestStatus",
  "notes",
];

const HEADERS = [
  "Story ID",
  "Area",
  "Surface",
  "Feature",
  "User Story",
  "Expected Behavior",
  "Evidence",
  "Baseline Method",
  STATUS_COLUMNS.storyStatus.header,
  STATUS_COLUMNS.baselineTestStatus.header,
  STATUS_COLUMNS.errorStatus.header,
  STATUS_COLUMNS.fixStatus.header,
  STATUS_COLUMNS.retestStatus.header,
  "Notes",
];

function parseArgs(argv) {
  const args = {
    dataPath: defaultDataPath,
    outputPath: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--data" && next) {
      args.dataPath = path.resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--out" && next) {
      args.outputPath = path.resolve(next);
      index += 1;
      continue;
    }
  }

  if (!args.outputPath) {
    throw new Error("Missing required --out <output.xlsx> argument.");
  }

  return args;
}

function columnName(index) {
  let current = index + 1;
  let result = "";
  while (current > 0) {
    const remainder = (current - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    current = Math.floor((current - 1) / 26);
  }
  return result;
}

function statusColorMap(value) {
  const palette = {
    Identified: "#DBEAFE",
    Deprecated: "#E5E7EB",
    Pending: "#FEF3C7",
    Pass: "#DCFCE7",
    Fail: "#FEE2E2",
    Partial: "#FDE68A",
    Blocked: "#E9D5FF",
    "Not tested": "#F3F4F6",
    "No issues": "#DCFCE7",
    "Open issue": "#FEE2E2",
    Fixed: "#DBEAFE",
    "Not started": "#F3F4F6",
    "In progress": "#FEF3C7",
    Done: "#DCFCE7",
    "N/A": "#E5E7EB",
  };

  return palette[value] ?? "#FFFFFF";
}

function applyCellFormatting(range, options = {}) {
  range.format.font = {
    name: options.fontName ?? "Aptos",
    size: options.fontSize ?? 10,
    bold: options.bold ?? false,
    color: options.fontColor ?? "#1F2937",
  };
  range.format.fill = {
    color: options.fillColor ?? "#FFFFFF",
  };
  range.format.wrapText = options.wrapText ?? false;
  range.format.horizontalAlignment = options.horizontalAlignment ?? "left";
  range.format.verticalAlignment = options.verticalAlignment ?? "top";
  range.format.borders = options.borders ?? {
    preset: "all",
    style: "thin",
    color: "#D1D5DB",
  };
}

async function main() {
  const { dataPath, outputPath } = parseArgs(process.argv.slice(2));
  const raw = await fs.readFile(dataPath, "utf8");
  const payload = JSON.parse(raw);
  const stories = Array.isArray(payload.stories) ? payload.stories : [];

  const workbook = Workbook.create();
  const storiesSheet = workbook.worksheets.add("Stories");
  const listsSheet = workbook.worksheets.add("Lists");
  listsSheet.showGridLines = false;
  storiesSheet.showGridLines = false;

  storiesSheet.getRange("A1:N1").merge();
  storiesSheet.getRange("A1").values = [["btc-graph feature audit"]];
  applyCellFormatting(storiesSheet.getRange("A1:N1"), {
    fontName: "Aptos Display",
    fontSize: 16,
    bold: true,
    fontColor: "#0F172A",
    fillColor: "#DDEBFF",
    horizontalAlignment: "left",
    verticalAlignment: "center",
    borders: {
      preset: "outside",
      style: "medium",
      color: "#93C5FD",
    },
  });
  storiesSheet.getRange("A1:N1").format.rowHeight = 24;

  storiesSheet.getRange("A2:N2").merge();
  storiesSheet.getRange("A2").values = [[
    "Canonical tracking workbook generated from audit/feature-audit.json. Update story statuses in the JSON source and rebuild this file.",
  ]];
  applyCellFormatting(storiesSheet.getRange("A2:N2"), {
    fontSize: 10,
    fontColor: "#334155",
    fillColor: "#EFF6FF",
    wrapText: true,
    borders: {
      preset: "outside",
      style: "thin",
      color: "#BFDBFE",
    },
  });
  storiesSheet.getRange("A2:N2").format.rowHeight = 32;

  storiesSheet.getRange("A4:B9").values = [
    ["Metric", "Value"],
    ["Generated At", new Date().toISOString()],
    ["Total Stories", stories.length],
    ["Baseline Pass", "=COUNTIF(J12:J500,\"Pass\")"],
    ["Open Issues", "=COUNTIF(K12:K500,\"Open issue\")"],
    ["Retest Pass", "=COUNTIF(M12:M500,\"Pass\")"],
  ];
  applyCellFormatting(storiesSheet.getRange("A4:B9"), {
    fillColor: "#FFFFFF",
    wrapText: true,
  });
  applyCellFormatting(storiesSheet.getRange("A4:B4"), {
    bold: true,
    fillColor: "#E2E8F0",
    horizontalAlignment: "center",
    verticalAlignment: "center",
  });
  storiesSheet.getRange("B5:B9").setNumberFormat("@");

  const headerRow = 11;
  const dataStartRow = 12;
  const headerRange = storiesSheet.getRange(`A${headerRow}:N${headerRow}`);
  headerRange.values = [HEADERS];
  applyCellFormatting(headerRange, {
    bold: true,
    fillColor: "#0F766E",
    fontColor: "#F8FAFC",
    horizontalAlignment: "center",
    verticalAlignment: "center",
    borders: {
      preset: "all",
      style: "thin",
      color: "#0B5C55",
    },
  });

  const storyRows = stories.map((story) => COLUMN_KEYS.map((key) => story[key] ?? ""));
  if (storyRows.length > 0) {
    const endRow = dataStartRow + storyRows.length - 1;
    const dataRange = storiesSheet.getRange(`A${dataStartRow}:N${endRow}`);
    dataRange.values = storyRows;
    applyCellFormatting(dataRange, {
      wrapText: true,
      fillColor: "#FFFFFF",
      borders: {
        preset: "all",
        style: "thin",
        color: "#E5E7EB",
      },
    });

    for (const [columnKey, statusConfig] of Object.entries(STATUS_COLUMNS)) {
      const columnIndex = COLUMN_KEYS.indexOf(columnKey);
      const columnLetter = columnName(columnIndex);
      const listColumnIndex = Object.keys(STATUS_COLUMNS).indexOf(columnKey);
      const listColumnLetter = columnName(listColumnIndex);
      const listStartRow = 2;
      const listEndRow = listStartRow + statusConfig.values.length - 1;

      listsSheet.getRange(`${listColumnLetter}1`).values = [[statusConfig.header]];
      listsSheet.getRange(`${listColumnLetter}${listStartRow}:${listColumnLetter}${listEndRow}`).values =
        statusConfig.values.map((value) => [value]);

      const statusRange = storiesSheet.getRange(`${columnLetter}${dataStartRow}:${columnLetter}${endRow}`);
      statusRange.dataValidation = {
        rule: {
          type: "list",
          formula1: `=Lists!$${listColumnLetter}$${listStartRow}:$${listColumnLetter}$${listEndRow}`,
        },
      };

      for (let rowIndex = 0; rowIndex < storyRows.length; rowIndex += 1) {
        const cell = storiesSheet.getRange(`${columnLetter}${dataStartRow + rowIndex}`);
        applyCellFormatting(cell, {
          wrapText: true,
          horizontalAlignment: "center",
          verticalAlignment: "center",
          fillColor: statusColorMap(String(storyRows[rowIndex][columnIndex] ?? "")),
          borders: {
            preset: "all",
            style: "thin",
            color: "#D1D5DB",
          },
        });
      }
    }
  }

  const columnWidths = [
    92,
    88,
    96,
    160,
    240,
    280,
    260,
    140,
    110,
    128,
    110,
    104,
    110,
    180,
  ];

  columnWidths.forEach((widthPx, index) => {
    storiesSheet.getRange(`${columnName(index)}:${columnName(index)}`).format.columnWidthPx = widthPx;
  });

  storiesSheet.freezePanes.freezeRows(headerRow);
  storiesSheet.freezePanes.freezeColumns(4);

  const outputDir = path.dirname(outputPath);
  await fs.mkdir(outputDir, { recursive: true });
  const output = await SpreadsheetFile.exportXlsx(workbook);
  await output.save(outputPath);
}

await main();
