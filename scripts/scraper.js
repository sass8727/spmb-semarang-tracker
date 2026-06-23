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

  const nilai = [...html.matchAll(/([0-9]{2,3}\.[0-9]{2})/g)]
    .map(x => parseFloat(x[1]))
    .filter(x => x > 50);

  const data = {
    updated_at: new Date().toISOString(),
    total: nilai.length,
    nilai_tertinggi: nilai.length
      ? Math.max(...nilai)
      : null,
    nilai_terendah: nilai.length
      ? Math.min(...nilai)
      : null
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
