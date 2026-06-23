const fs = require("fs");

const SEKOLAH = [
  { id: 301, nama: "SMP NEGERI 1" }
];

async function getPage(sekolahId, offset) {
  const url =
    offset === 0
      ? "https://spmb.semarangkota.go.id/smp/listjurnalpendaftaran2"
      : `https://spmb.semarangkota.go.id/smp/listjurnalpendaftaran2/${offset}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type":
        "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest"
    },
    body: new URLSearchParams({
      per_page: "10",
      cari: "",
      fsekolah: String(sekolahId),
      rstatus: "1",
      rjalur: "3"
    })
  });

  return await res.text();
}

async function scrapeSekolah(sekolah) {
  let offset = 0;
  let peserta = [];

  while (true) {
    const html = await getPage(sekolah.id, offset);

    const rows = [
      ...html.matchAll(
        /class="REGNO"[^>]*>(\d+)<\/span>[\s\S]*?(\d+\.\d{2})/g
      )
    ];

    console.log(
      `${sekolah.nama} offset=${offset} rows=${rows.length}`
    );

    if (rows.length === 0) break;

    for (const row of rows) {
      peserta.push({
        regno: row[1],
        nilai: parseFloat(row[2])
      });
    }

    if (rows.length < 10) break;

    offset += 10;

    await new Promise((r) => setTimeout(r, 300));
  }

  peserta.sort((a, b) => b.nilai - a.nilai);

  return {
    sekolah: sekolah.nama,
    peserta: peserta.length,
    tertinggi: peserta[0]?.nilai ?? 0,
    cutoff: peserta[peserta.length - 1]?.nilai ?? 0
  };
}

async function run() {
  const hasil = [];

  for (const sekolah of SEKOLAH) {
    const data = await scrapeSekolah(sekolah);
    hasil.push(data);
  }

  const output = {
    updated_at: new Date().toISOString(),
    ranking: hasil
  };

  fs.mkdirSync("data", { recursive: true });

  fs.writeFileSync(
    "data/latest.json",
    JSON.stringify(output, null, 2)
  );

  console.log("DONE");
}

run();
