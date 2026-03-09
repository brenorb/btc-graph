import fs from "node:fs";
import path from "node:path";

import { writeNodeInfoPages } from "./lib/node-info-pages.mjs";

const repoRoot = process.cwd();
const sourceDir = path.join(repoRoot, "content", "nodes");
const outputDir = path.join(repoRoot, "public", "data");
const outputFile = path.join(outputDir, "graph.json");
const infoPagesOutputDir = path.join(repoRoot, "public", "nodes");

const requiredFields = [
  "id",
  "title",
  "description",
  "category",
  "prerequisites",
  "resources",
  "estimatedTime",
];

function loadNodes() {
  const files = fs
    .readdirSync(sourceDir)
    .filter((file) => file.endsWith(".json"))
    .sort((a, b) => a.localeCompare(b));

  return files.map((file) => {
    const raw = fs.readFileSync(path.join(sourceDir, file), "utf8");
    return JSON.parse(raw);
  });
}

function validate(nodes) {
  const errors = [];
  const byId = new Map();

  for (const node of nodes) {
    for (const field of requiredFields) {
      if (!(field in node)) {
        errors.push(`Node ${node.id ?? "<unknown>"} missing required field: ${field}`);
      }
    }

    if (typeof node.id !== "string" || node.id.length === 0) {
      errors.push("Node has invalid id");
      continue;
    }

    if (byId.has(node.id)) {
      errors.push(`Duplicate node id: ${node.id}`);
    }

    byId.set(node.id, node);

    if (!Array.isArray(node.prerequisites)) {
      errors.push(`Node ${node.id} has invalid prerequisites type`);
    }

    if (!Array.isArray(node.resources)) {
      errors.push(`Node ${node.id} has invalid resources type`);
    }
  }

  for (const node of nodes) {
    const prerequisites = Array.isArray(node.prerequisites)
      ? node.prerequisites
      : [];
    for (const prerequisite of prerequisites) {
      if (!byId.has(prerequisite)) {
        errors.push(`Unknown prerequisite ${prerequisite} in node ${node.id}`);
      }
    }
  }

  const visiting = new Set();
  const visited = new Set();

  const walk = (id) => {
    if (visiting.has(id)) {
      errors.push(`Cycle detected at ${id}`);
      return;
    }

    if (visited.has(id)) {
      return;
    }

    visited.add(id);
    visiting.add(id);

    const node = byId.get(id);
    if (!node) {
      visiting.delete(id);
      return;
    }

    const prerequisites = Array.isArray(node.prerequisites)
      ? node.prerequisites
      : [];
    for (const prerequisite of prerequisites) {
      walk(prerequisite);
    }

    visiting.delete(id);
  };

  for (const node of nodes) {
    walk(node.id);
  }

  return errors;
}

if (!fs.existsSync(sourceDir)) {
  throw new Error(`Source directory not found: ${sourceDir}`);
}

const nodes = loadNodes();
const errors = validate(nodes);
if (errors.length > 0) {
  console.error("Graph content validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

const graph = { nodes: nodes.sort((a, b) => a.id.localeCompare(b.id)) };

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputFile, JSON.stringify(graph, null, 2));
writeNodeInfoPages(graph, infoPagesOutputDir);

console.log(
  `Built ${graph.nodes.length} nodes -> ${path.relative(repoRoot, outputFile)} and ${path.relative(repoRoot, infoPagesOutputDir)}`,
);
