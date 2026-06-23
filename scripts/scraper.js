const fs = require("fs");

const data = {
  updated_at: new Date().toISOString(),
  sekolah: 301,
  jalur: 1,
  status: 1,
  total: 166,
  sample: [
    {
      regno: "301662",
      nama: "SHINTA DEWI PURNOMO",
      nilai: 95.56
    }
  ]
};

fs.mkdirSync("data", { recursive: true });

fs.writeFileSync(
  "data/latest.json",
  JSON.stringify(data, null, 2)
);

console.log("Data saved");
