import fs from "node:fs/promises";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const nodesDir = path.join(repoRoot, "content", "nodes");
const shouldWrite = process.argv.includes("--write");

const BOOKS = {
  masteringBitcoin: {
    title: "Mastering Bitcoin",
    url: "https://amzn.to/4ro0NdG",
    regionalUrls: {
      BR: "https://amzn.to/4te47JX",
    },
    notes:
      "Broad technical reference for the wallet, transaction, and protocol ideas that support this topic.",
  },
  programmingBitcoin: {
    title: "Programming Bitcoin",
    url: "https://amzn.to/4b5xUhC",
    regionalUrls: {
      BR: "https://amzn.to/4lX5bzw",
    },
    notes:
      "Deeper walk-through of the cryptography, scripting, and transaction mechanics behind this topic.",
  },
  masteringLightning: {
    title: "Mastering the Lightning Network",
    url: "https://amzn.to/40V421t",
    regionalUrls: {
      BR: "https://amzn.to/4v6P9aq",
    },
    notes:
      "Book-length explanation of Lightning channel, routing, and operational tradeoffs tied to this topic.",
  },
  bitcoinStandard: {
    title: "The Bitcoin Standard",
    url: "https://amzn.to/4h1H0iK",
    regionalUrls: {
      BR: "https://amzn.to/4byFMZo",
    },
    notes:
      "Macro and monetary framing that situates this concept in Bitcoin's economic context.",
  },
  inventingBitcoin: {
    title: "Inventing Bitcoin",
    url: "https://amzn.to/3Njwy9P",
    regionalUrls: {
      BR: "https://amzn.to/4rTB6C8",
    },
    notes: "Beginner-friendly conceptual bridge into the mechanics behind this topic.",
  },
  denationalisation: {
    title: "Denationalisation of Money",
    url: "https://amzn.to/4uiDGEh",
    regionalUrls: {
      BR: "https://amzn.to/4dIgWaD",
    },
    notes:
      "Classical monetary-competition framing that helps explain the economic ideas behind this topic.",
  },
  blocksizeWar: {
    title: "The Blocksize War",
    url: "https://amzn.to/4b64b8s",
    regionalUrls: {
      BR: "https://amzn.to/4rXhk90",
    },
    notes:
      "Historical narrative for how this topic showed up in Bitcoin's scaling and governance debates.",
  },
  genesisBook: {
    title: "Genesis Book",
    url: "https://amzn.to/4bjOd9C",
    regionalUrls: {
      BR: "https://amzn.to/41xvliA",
    },
    notes: "Early-history perspective from the Satoshi era and surrounding context.",
  },
  littleBitcoinBook: {
    title: "The Little Bitcoin Book",
    url: "https://amzn.to/4sJ3wjb",
    regionalUrls: {
      BR: "https://amzn.to/3NMybNF",
    },
    notes: "Accessible beginner framing for the user-level tradeoffs behind this topic.",
  },
  bookOfSatoshi: {
    title: "The Book of Satoshi",
    url: "https://amzn.to/4lvhhQ8",
    regionalUrls: {
      BR: "https://amzn.to/3NWFpyF",
    },
    notes:
      "Primary-source writing that helps anchor the historical and philosophical context around this topic.",
  },
  ascentOfMoney: {
    title: "The Ascent of Money",
    url: "https://amzn.to/4eSQHig",
    regionalUrls: {
      BR: "https://link.amazon/B0j0dwMtg",
    },
    notes: "Long-run financial history context that helps place this topic in a wider monetary arc.",
  },
};

function isAmazonUrl(urlString) {
  const host = new URL(urlString).hostname.replace(/^www\./, "");
  return host === "amzn.to" || host.includes("amazon.");
}

function buildBookResource(book) {
  return {
    type: "book",
    title: book.title,
    url: book.url,
    notes: book.notes,
    regionalUrls: book.regionalUrls,
  };
}

function chooseBook(node) {
  const prefix = node.id.split(".")[0];
  const haystack = [
    node.id,
    node.title,
    node.description,
    ...(node.tags ?? []),
    ...(node.aliases ?? []),
  ]
    .join(" ")
    .toLowerCase();

  if (prefix === "lightning" || haystack.includes("lightning")) {
    return BOOKS.masteringLightning;
  }

  if (/(hayek|spontaneous-order|money-competition|road to serfdom)/.test(haystack)) {
    return BOOKS.denationalisation;
  }

  if (prefix === "history") {
    if (/(blocksize|scaling|segwit|taproot activation|rbf|activation|war)/.test(haystack)) {
      return BOOKS.blocksizeWar;
    }
    if (/(genesis|satoshi)/.test(haystack)) {
      return BOOKS.genesisBook;
    }
    if (/(cypherpunk|philosophy)/.test(haystack)) {
      return BOOKS.bookOfSatoshi;
    }
    if (/(pre-bitcoin|digital cash|bit gold|b-money|hashcash|digicash)/.test(haystack)) {
      return BOOKS.bitcoinStandard;
    }
    return BOOKS.bitcoinStandard;
  }

  if (prefix === "economics") {
    if (/(miner|mining|subsidy|fee|blockspace|revenue)/.test(haystack)) {
      return BOOKS.masteringBitcoin;
    }
    if (/(monetary history|history of money|contact shocks)/.test(haystack)) {
      return BOOKS.ascentOfMoney;
    }
    return BOOKS.bitcoinStandard;
  }

  if (prefix === "fundamentals") {
    if (
      /(modular|finite field|fermat|inverse|discrete log|elliptic|scalar|secp256k1|ecdsa|schnorr|signature|private key|public key|hash|merkle)/.test(
        haystack,
      )
    ) {
      return BOOKS.programmingBitcoin;
    }
    return BOOKS.inventingBitcoin;
  }

  if (prefix === "protocol") {
    if (/(mempool|policy|rbf|dust|cpfp|relay|standardness|fee market)/.test(haystack)) {
      return BOOKS.masteringBitcoin;
    }
    if (
      /(taproot|tapscript|schnorr|script|opcode|checksig|wtxid|txid|transaction|sighash|timelock|covenant|utxo|segwit|musig)/.test(
        haystack,
      )
    ) {
      return BOOKS.programmingBitcoin;
    }
    return BOOKS.masteringBitcoin;
  }

  if (prefix === "dev") {
    if (/(descriptor|wallet|psbt|rpc|hwi|coin selection|transaction building)/.test(haystack)) {
      return BOOKS.masteringBitcoin;
    }
    return BOOKS.programmingBitcoin;
  }

  if (prefix === "custody") {
    if (/(law|legal|beginner)/.test(haystack)) {
      return BOOKS.littleBitcoinBook;
    }
    return BOOKS.masteringBitcoin;
  }

  if (prefix === "extension") {
    return /(lightning|channel)/.test(haystack) ? BOOKS.masteringLightning : BOOKS.masteringBitcoin;
  }

  if (prefix === "mining" || prefix === "ops" || prefix === "privacy" || prefix === "security") {
    return BOOKS.masteringBitcoin;
  }

  return BOOKS.masteringBitcoin;
}

function resourcePriority(resource) {
  if (resource.type === "book" && !isAmazonUrl(resource.url)) {
    return -1;
  }

  const url = new URL(resource.url);
  const host = url.hostname.replace(/^www\./, "");
  const pathname = url.pathname.toLowerCase();

  if (host.endsWith("wikipedia.org")) {
    return 0;
  }
  if (host === "bitcoin.page" || host === "lopp.net" || host === "bitcoin.design") {
    return 1;
  }
  if (host === "developer.bitcoin.org" || host === "mempool.space") {
    return 2;
  }
  if (host === "bitcoinops.org" && pathname.includes("/topics/")) {
    return 2;
  }
  if (host === "bitcoindev.network" || host === "bitcoin.org") {
    return 3;
  }
  if (host === "github.com" && pathname.includes("/bitcoin/bips/blob/")) {
    return 5;
  }
  if (host === "bitcoincore.academy" || host === "github.com") {
    return 4;
  }

  return 3;
}

function findReplacementIndex(resources) {
  let bestIndex = 0;
  let bestPriority = Number.POSITIVE_INFINITY;

  for (let index = 0; index < resources.length; index += 1) {
    const priority = resourcePriority(resources[index]);
    if (priority < bestPriority) {
      bestPriority = priority;
      bestIndex = index;
    }
  }

  return bestIndex;
}

function updateNode(node) {
  const hasAmazonBook = node.resources.some((resource) => {
    return resource.type === "book" && isAmazonUrl(resource.url);
  });

  if (hasAmazonBook) {
    return { changed: false, action: "skip", bookTitle: "" };
  }

  const book = chooseBook(node);
  const nextBookResource = buildBookResource(book);
  const existingBookIndex = node.resources.findIndex((resource) => resource.type === "book");

  if (existingBookIndex >= 0) {
    node.resources[existingBookIndex] = nextBookResource;
    return { changed: true, action: "normalized-book", bookTitle: book.title };
  }

  if (node.resources.length < 3) {
    node.resources.push(nextBookResource);
    return { changed: true, action: "appended-book", bookTitle: book.title };
  }

  const replacementIndex = findReplacementIndex(node.resources);
  node.resources[replacementIndex] = nextBookResource;
  return { changed: true, action: "replaced-resource", bookTitle: book.title };
}

async function main() {
  const files = (await fs.readdir(nodesDir))
    .filter((file) => file.endsWith(".json"))
    .sort((a, b) => a.localeCompare(b));

  const summary = {
    normalizedBook: 0,
    appendedBook: 0,
    replacedResource: 0,
  };
  const bookCounts = new Map();

  for (const file of files) {
    const nodePath = path.join(nodesDir, file);
    const raw = await fs.readFile(nodePath, "utf8");
    const node = JSON.parse(raw);
    const result = updateNode(node);

    if (!result.changed) {
      continue;
    }

    if (result.action === "normalized-book") {
      summary.normalizedBook += 1;
    } else if (result.action === "appended-book") {
      summary.appendedBook += 1;
    } else if (result.action === "replaced-resource") {
      summary.replacedResource += 1;
    }

    bookCounts.set(result.bookTitle, (bookCounts.get(result.bookTitle) ?? 0) + 1);

    if (shouldWrite) {
      await fs.writeFile(nodePath, `${JSON.stringify(node, null, 2)}\n`);
    }
  }

  const output = {
    shouldWrite,
    ...summary,
    updatedNodes: summary.normalizedBook + summary.appendedBook + summary.replacedResource,
    bookCounts: Object.fromEntries([...bookCounts.entries()].sort((a, b) => a[0].localeCompare(b[0]))),
  };

  console.log(JSON.stringify(output, null, 2));
}

await main();
