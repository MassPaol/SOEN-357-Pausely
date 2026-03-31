const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PAUSELY_EXPORT_PORT || 4001);
const EXPORTS_DIR = path.join(process.cwd(), "exports");
const SESSION_LOG_CSV_PATH = path.join(EXPORTS_DIR, "pausely-session-log.csv");

const ensureExportsDir = () => {
  fs.mkdirSync(EXPORTS_DIR, { recursive: true });
};

const sendJson = (response, statusCode, payload) => {
  response.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  });
  response.end(JSON.stringify(payload));
};

const syncHeader = (header) => {
  if (!fs.existsSync(SESSION_LOG_CSV_PATH)) {
    return false;
  }

  const currentContents = fs.readFileSync(SESSION_LOG_CSV_PATH, "utf8");
  const [currentHeader = "", ...rows] = currentContents.split(/\r?\n/);

  if (currentHeader === header) {
    return true;
  }

  const remainingRows = rows.filter((row) => row.length > 0);
  const nextContents = [header, ...remainingRows].join("\n");
  fs.writeFileSync(SESSION_LOG_CSV_PATH, nextContents, "utf8");
  return true;
};

const appendCompletedRow = ({ header, row }) => {
  if (syncHeader(header)) {
    fs.appendFileSync(SESSION_LOG_CSV_PATH, `\n${row}`, "utf8");
    return;
  }

  fs.writeFileSync(SESSION_LOG_CSV_PATH, `${header}\n${row}`, "utf8");
};

const server = http.createServer((request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }

  if (request.method === "GET" && request.url === "/health") {
    sendJson(response, 200, {
      ok: true,
      sessionLogCsvPath: SESSION_LOG_CSV_PATH,
    });
    return;
  }

  if (request.method !== "POST" || request.url !== "/session-export") {
    sendJson(response, 404, { error: "Not found" });
    return;
  }

  let rawBody = "";

  request.on("data", (chunk) => {
    rawBody += chunk;
  });

  request.on("end", () => {
    try {
      const payload = JSON.parse(rawBody);

      if (
        typeof payload.header !== "string" ||
        typeof payload.row !== "string"
      ) {
        sendJson(response, 400, { error: "Invalid payload" });
        return;
      }

      ensureExportsDir();
      appendCompletedRow(payload);

      sendJson(response, 200, {
        ok: true,
        sessionLogCsvPath: SESSION_LOG_CSV_PATH,
      });
    } catch (error) {
      sendJson(response, 500, {
        error: "Failed to save CSV payload",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
});

server.listen(PORT, () => {
  ensureExportsDir();
  console.log(`Pausely CSV export server listening on http://0.0.0.0:${PORT}`);
  console.log(`Session log CSV: ${SESSION_LOG_CSV_PATH}`);
});
