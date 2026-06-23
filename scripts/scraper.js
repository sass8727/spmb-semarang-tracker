const fs = require("fs");

const data = {
  last_update: new Date().toISOString(),
  status: "running",
  test: true
};

fs.mkdirSync("data", { recursive: true });

fs.writeFileSync(
  "data/latest.json",
  JSON.stringify(data, null, 2)
);

console.log("latest.json generated");
