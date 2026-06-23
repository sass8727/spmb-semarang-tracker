const fs = require("fs");

const URL =
  "https://spmb.semarangkota.go.id/smp/listjurnalpendaftaran2";

async function getSekolah(id) {
  const res = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type":
        "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest"
    },
    body: new URLSearchParams({
      per_page: "10",
      cari: "",
      fsekolah: String(id),
      rjalur: "3",
      rstatus: "1"
    })
  });

  const html = await res.text();

  const totalMatch = html.match(/Total\s+(\d+)\s+Pendaftar/i);
  const total = totalMatch ? parseInt(totalMatch[1]) : 0;

  const namaMatch = html.match(/<option value=".*?" selected[^>]*>(.*?)<\/option>/i);

  const sekolah =
    namaMatch?.[1]?.trim() || `SMP ${id}`;

  const nilai = [
    ...html.matchAll(/\b(\d{2,3}\.\d{2})\b/g)
  ]
    .map(x => parseFloat(x[1]))
    .filter(x => x > 50);

  return {
    sekolah_id: id,
    sekolah,
    peserta: total,
    tertinggi: nilai.length ? Math.max(...nilai) : null,
    cutoff: nilai.length ? Math.min(...nilai) : null
  };
}

async function run() {
  const ranking = [];

  for (let sekolah = 301; sekolah <= 343; sekolah++) {
    try {
      console.log("Scraping", sekolah);

      const data = await getSekolah(sekolah);

      ranking.push(data);
    } catch (e) {
      console.log("ERROR", sekolah);
    }
  }

  ranking.sort((a, b) => b.tertinggi - a.tertinggi);

  const result = {
    updated_at: new Date().toISOString(),
    jalur: "Prestasi",
    ranking
  };

  fs.mkdirSync("data", { recursive: true });

  fs.writeFileSync(
    "data/latest.json",
    JSON.stringify(result, null, 2)
  );

  console.log("DONE");
}

run();
