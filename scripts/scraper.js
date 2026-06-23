const fs = require("fs");

const url =
  "https://spmb.semarangkota.go.id/smp/listjurnalpendaftaran2";

async function run() {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type":
        "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest"
    },
    body: new URLSearchParams({
      per_page: "50",
      cari: "",
      fsekolah: "301",
      rjalur: "3",
      rstatus: "1"
    })
  });

  const html = await res.text();

  const nilai = [];

  const regex =
    /<td[^>]*>\s*<div[^>]*>\s*([0-9]+\.[0-9]{2})\s*<\/div>/g;

  let match;

  while ((match = regex.exec(html)) !== null) {
    nilai.push(parseFloat(match[1]));
  }

  const data = {
    updated_at: new Date().toISOString(),
    sekolah: "SMP NEGERI 1",
    sekolah_id: 301,
    jalur: "Prestasi",
    total: nilai.length,
    nilai_tertinggi: nilai.length
      ? Math.max(...nilai)
      : null,
    nilai_terendah: nilai.length
      ? Math.min(...nilai)
      : null,
    sampel_nilai: nilai.slice(0, 10)
  };

  fs.mkdirSync("data", {
    recursive: true
  });

  fs.writeFileSync(
    "data/latest.json",
    JSON.stringify(data, null, 2)
  );

  console.log(data);
}

run();
