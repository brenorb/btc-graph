import fs from "node:fs/promises";
import path from "node:path";

import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const repoRoot = path.resolve(import.meta.dirname, "..");
const defaultDataPath = path.join(repoRoot, "audit", "content-source-audit.json");

const SOURCES_COLUMNS = [
  "id",
  "name",
  "url",
  "sourceType",
  "priority",
  "scope",
  "clusterStrategy",
  "status",
  "crawlStatus",
  "extractionStatus",
  "dedupeStatus",
  "pageClustersTracked",
  "conceptsExtracted",
  "conceptsNormalized",
  "notes",
];

const CONCEPTS_COLUMNS = [
  "id",
  "title",
  "category",
  "sourceId",
  "sourceUrl",
  "sourceContext",
  "existingNodeId",
  "status",
  "atomicityRationale",
  "candidatePrerequisites",
  "chosenPrerequisites",
  "prerequisiteRationale",
  "aliases",
  "tags",
  "estimatedTime",
  "confidence",
  "notes",
];

const EDGES_COLUMNS = [
  "from",
  "to",
  "type",
  "status",
  "rationale",
  "sourceId",
  "notes",
];

const DECISIONS_COLUMNS = [
  "id",
  "type",
  "subject",
  "status",
  "rationale",
  "relatedConceptIds",
  "relatedSourceIds",
  "notes",
];

const STATUS_LISTS = {
  sourceStatus: ["Seeded", "Inventorying", "In review", "Complete", "Deferred"],
  crawlStatus: ["Not started", "In progress", "Complete", "Blocked"],
  extractionStatus: ["Not started", "Raw extraction", "Normalized", "Complete", "Blocked"],
  dedupeStatus: ["Not started", "In progress", "Complete", "Blocked"],
  conceptStatus: ["existing", "new", "merge", "skip"],
  edgeType: ["prerequisite"],
  edgeStatus: ["proposed", "accepted", "rejected", "needs-review"],
  decisionType: ["merge", "split", "exclude", "conflict", "bridge-concept", "scope"],
  decisionStatus: ["open", "resolved", "deferred"],
  confidence: ["high", "medium", "low"],
};

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

function normalizeCell(value) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  return value ?? "";
}

function addValidation(sheet, targetColumnIndex, rowStart, rowEnd, listSheetColumnIndex, values) {
  const targetColumnLetter = columnName(targetColumnIndex);
  const listColumnLetter = columnName(listSheetColumnIndex);
  const listStartRow = 2;
  const listEndRow = listStartRow + values.length - 1;

  sheet.workbook.worksheets.getItem("Lists").getRange(`${listColumnLetter}1`).values = [[targetColumnLetter]];
  sheet.workbook.worksheets
    .getItem("Lists")
    .getRange(`${listColumnLetter}${listStartRow}:${listColumnLetter}${listEndRow}`).values = values.map((value) => [value]);

  sheet.getRange(`${targetColumnLetter}${rowStart}:${targetColumnLetter}${rowEnd}`).dataValidation = {
    rule: {
      type: "list",
      formula1: `=Lists!$${listColumnLetter}$${listStartRow}:$${listColumnLetter}$${listEndRow}`,
    },
  };
}

function buildRows(entries, columns) {
  return entries.map((entry) => columns.map((column) => normalizeCell(entry[column])));
}

function setColumnWidths(sheet, widths) {
  widths.forEach((widthPx, index) => {
    const letter = columnName(index);
    sheet.getRange(`${letter}:${letter}`).format.columnWidthPx = widthPx;
  });
}

function writeHeader(sheet, title, subtitle, widthLetter) {
  sheet.getRange(`A1:${widthLetter}1`).merge();
  sheet.getRange("A1").values = [[title]];
  applyCellFormatting(sheet.getRange(`A1:${widthLetter}1`), {
    fontName: "Aptos Display",
    fontSize: 16,
    bold: true,
    fontColor: "#0F172A",
    fillColor: "#DDEBFF",
    borders: {
      preset: "outside",
      style: "medium",
      color: "#93C5FD",
    },
  });

  sheet.getRange(`A2:${widthLetter}2`).merge();
  sheet.getRange("A2").values = [[subtitle]];
  applyCellFormatting(sheet.getRange(`A2:${widthLetter}2`), {
    fillColor: "#EFF6FF",
    fontColor: "#334155",
    wrapText: true,
    borders: {
      preset: "outside",
      style: "thin",
      color: "#BFDBFE",
    },
  });
}

function writeTable(sheet, headerRow, headers, rows) {
  const endColumn = columnName(headers.length - 1);
  const headerRange = sheet.getRange(`A${headerRow}:${endColumn}${headerRow}`);
  headerRange.values = [headers];
  applyCellFormatting(headerRange, {
    bold: true,
    fillColor: "#0F766E",
    fontColor: "#F8FAFC",
    horizontalAlignment: "center",
    verticalAlignment: "center",
  });

  if (!rows.length) {
    return;
  }

  const startRow = headerRow + 1;
  const endRow = startRow + rows.length - 1;
  const dataRange = sheet.getRange(`A${startRow}:${endColumn}${endRow}`);
  dataRange.values = rows;
  applyCellFormatting(dataRange, {
    wrapText: true,
    fillColor: "#FFFFFF",
    borders: {
      preset: "all",
      style: "thin",
      color: "#E5E7EB",
    },
  });
}

async function main() {
  const { dataPath, outputPath } = parseArgs(process.argv.slice(2));
  const raw = await fs.readFile(dataPath, "utf8");
  const payload = JSON.parse(raw);
  const sources = Array.isArray(payload.sources) ? payload.sources : [];
  const concepts = Array.isArray(payload.concepts) ? payload.concepts : [];
  const edges = Array.isArray(payload.edges) ? payload.edges : [];
  const decisions = Array.isArray(payload.decisions) ? payload.decisions : [];

  const workbook = Workbook.create();
  const sourcesSheet = workbook.worksheets.add("Sources");
  const conceptsSheet = workbook.worksheets.add("Concepts");
  const edgesSheet = workbook.worksheets.add("Edges");
  const decisionsSheet = workbook.worksheets.add("Decisions");
  const coverageSheet = workbook.worksheets.add("Coverage");
  const listsSheet = workbook.worksheets.add("Lists");
  listsSheet.showGridLines = false;

  [sourcesSheet, conceptsSheet, edgesSheet, decisionsSheet, coverageSheet].forEach((sheet) => {
    sheet.showGridLines = false;
  });

  const subtitle =
    "Canonical tracking workbook generated from audit/content-source-audit.json. Update the JSON first, then rebuild this workbook.";

  writeHeader(sourcesSheet, "btc-graph content source audit", subtitle, "O");
  writeHeader(conceptsSheet, "btc-graph content concepts", subtitle, "Q");
  writeHeader(edgesSheet, "btc-graph prerequisite edge proposals", subtitle, "G");
  writeHeader(decisionsSheet, "btc-graph content audit decisions", subtitle, "H");
  writeHeader(coverageSheet, "btc-graph content audit coverage", subtitle, "F");

  coverageSheet.getRange("A4:B12").values = [
    ["Metric", "Value"],
    ["Generated At", new Date().toISOString()],
    ["Seed Sources", sources.length],
    ["Completed Sources", sources.filter((source) => source.status === "Complete").length],
    ["Concept Candidates", concepts.length],
    ["Proposed Edges", edges.length],
    ["Open Decisions", decisions.filter((decision) => decision.status === "open").length],
    ["Existing Matches", concepts.filter((concept) => concept.status === "existing").length],
    ["New Concepts", concepts.filter((concept) => concept.status === "new").length],
  ];
  applyCellFormatting(coverageSheet.getRange("A4:B12"), { wrapText: true });
  applyCellFormatting(coverageSheet.getRange("A4:B4"), {
    bold: true,
    fillColor: "#E2E8F0",
    horizontalAlignment: "center",
  });
  coverageSheet.getRange("A14:B16").values = [
    ["Run Title", payload.title ?? ""],
    ["Objective", payload.objective ?? ""],
    ["Notes", payload.notes ?? ""],
  ];
  applyCellFormatting(coverageSheet.getRange("A14:B16"), { wrapText: true });
  applyCellFormatting(coverageSheet.getRange("A14:A16"), {
    bold: true,
    fillColor: "#F8FAFC",
  });
  setColumnWidths(coverageSheet, [180, 220, 180, 180, 180, 180]);

  writeTable(
    sourcesSheet,
    11,
    [
      "Source ID",
      "Name",
      "URL",
      "Source Type",
      "Priority",
      "Scope",
      "Cluster Strategy",
      "Status",
      "Crawl Status",
      "Extraction Status",
      "Dedupe Status",
      "Page Clusters Tracked",
      "Concepts Extracted",
      "Concepts Normalized",
      "Notes",
    ],
    buildRows(sources, SOURCES_COLUMNS),
  );
  setColumnWidths(sourcesSheet, [150, 180, 240, 110, 70, 280, 220, 92, 104, 124, 108, 118, 110, 118, 220]);
  sourcesSheet.freezePanes.freezeRows(11);

  writeTable(
    conceptsSheet,
    11,
    [
      "Concept ID",
      "Title",
      "Category",
      "Source ID",
      "Source URL",
      "Source Context",
      "Existing Node Match",
      "Status",
      "Atomicity Rationale",
      "Candidate Prerequisites",
      "Chosen Prerequisites",
      "Prerequisite Rationale",
      "Aliases",
      "Tags",
      "Estimated Time",
      "Confidence",
      "Notes",
    ],
    buildRows(concepts, CONCEPTS_COLUMNS),
  );
  setColumnWidths(conceptsSheet, [150, 180, 120, 150, 220, 180, 140, 88, 220, 200, 200, 220, 160, 120, 100, 90, 220]);
  conceptsSheet.freezePanes.freezeRows(11);

  writeTable(
    edgesSheet,
    11,
    ["From", "To", "Type", "Status", "Rationale", "Source ID", "Notes"],
    buildRows(edges, EDGES_COLUMNS),
  );
  setColumnWidths(edgesSheet, [170, 170, 90, 100, 260, 150, 220]);
  edgesSheet.freezePanes.freezeRows(11);

  writeTable(
    decisionsSheet,
    11,
    ["Decision ID", "Type", "Subject", "Status", "Rationale", "Related Concept IDs", "Related Source IDs", "Notes"],
    buildRows(decisions, DECISIONS_COLUMNS),
  );
  setColumnWidths(decisionsSheet, [140, 110, 180, 100, 260, 200, 160, 220]);
  decisionsSheet.freezePanes.freezeRows(11);

  if (sources.length > 0) {
    const startRow = 12;
    const endRow = startRow + sources.length - 1;
    addValidation(sourcesSheet, 7, startRow, endRow, 0, STATUS_LISTS.sourceStatus);
    addValidation(sourcesSheet, 8, startRow, endRow, 1, STATUS_LISTS.crawlStatus);
    addValidation(sourcesSheet, 9, startRow, endRow, 2, STATUS_LISTS.extractionStatus);
    addValidation(sourcesSheet, 10, startRow, endRow, 3, STATUS_LISTS.dedupeStatus);
  }

  if (concepts.length > 0) {
    const startRow = 12;
    const endRow = startRow + concepts.length - 1;
    addValidation(conceptsSheet, 7, startRow, endRow, 4, STATUS_LISTS.conceptStatus);
    addValidation(conceptsSheet, 15, startRow, endRow, 5, STATUS_LISTS.confidence);
  }

  if (edges.length > 0) {
    const startRow = 12;
    const endRow = startRow + edges.length - 1;
    addValidation(edgesSheet, 2, startRow, endRow, 6, STATUS_LISTS.edgeType);
    addValidation(edgesSheet, 3, startRow, endRow, 7, STATUS_LISTS.edgeStatus);
  }

  if (decisions.length > 0) {
    const startRow = 12;
    const endRow = startRow + decisions.length - 1;
    addValidation(decisionsSheet, 1, startRow, endRow, 8, STATUS_LISTS.decisionType);
    addValidation(decisionsSheet, 3, startRow, endRow, 9, STATUS_LISTS.decisionStatus);
  }

  const outputDir = path.dirname(outputPath);
  await fs.mkdir(outputDir, { recursive: true });
  const output = await SpreadsheetFile.exportXlsx(workbook);
  await output.save(outputPath);
}

await main();
