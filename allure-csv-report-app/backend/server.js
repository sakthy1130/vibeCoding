
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");
const csvParser = require("csv-parser");

const upload = multer({ dest: "uploads/" });
const app = express();
app.use(cors());
const PORT = 5001;

// Friendly root handler
app.get('/', (req, res) => {
  res.send('Allure CSV Report Backend is running. Try /ping or /report');
});

// Health check endpoint
app.get('/ping', (req, res) => {
  res.send('pong');
});

// To serve the generated report
app.use("/report", express.static("allure-report"));

app.post("/upload", upload.single("file"), async (req, res) => {
  const filePath = req.file.path;
  const allureResultsDir = "allure-results";
  // Clean or recreate results directory
  fs.rmSync(allureResultsDir, { recursive: true, force: true });
  fs.mkdirSync(allureResultsDir);

  // Convert CSV rows to Allure JSON files (as a workaround)
  let testId = 1;
  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on("data", (row) => {
      const startTime = row["Start Time"] ? new Date(row["Start Time"]).getTime() : Date.now();
      const stopTime = row["Stop Time"] ? new Date(row["Stop Time"]).getTime() : Date.now();
      const testResult = {
        uuid: `${testId++}`,
        name: row["Name"] || row["Test Method"] || "Unknown test",
        fullName: row["Test Class"] ? `${row["Test Class"]}.${row["Test Method"]}` : row["Name"],
        status: (row["Status"] || "passed").toLowerCase(),
        historyId: Math.random().toString(36).substring(2),
        statusDetails: {},
        description: row["Description"] || "",
        stage: "finished",
        steps: [],
        attachments: [],
        labels: [
          ...(row["Parent Suite"] ? [{ name: "parentSuite", value: row["Parent Suite"] }] : []),
          ...(row["Suite"] ? [{ name: "suite", value: row["Suite"] }] : []),
          ...(row["Sub Suite"] ? [{ name: "subSuite", value: row["Sub Suite"] }] : []),
          ...(row["Test Class"] ? [{ name: "testClass", value: row["Test Class"] }] : []),
          ...(row["Test Method"] ? [{ name: "testMethod", value: row["Test Method"] }] : []),
        ],
        links: [],
        start: startTime,
        stop: stopTime,
      };
      fs.writeFileSync(
        `${allureResultsDir}/${testResult.uuid}-result.json`,
        JSON.stringify(testResult, null, 2)
      );
    })
    .on("end", () => {
      // Now call Allure to generate the report
      exec(
        "npx allure generate allure-results --clean -o allure-report",
        (err, stdout, stderr) => {
          if (err) {
            res.status(500).send("Allure report generation failed.");
            return;
          }
          res.json({ reportUrl: "http://localhost:5001/report/index.html" });
        }
      );
    });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});