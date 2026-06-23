const fs = require("fs");

async function ambilHalaman(sekolah, jalur, offset) {
  const url =
    `https://spmb.semarangkota.go.id/smp/listjurnalpendaftaran2/${offset}`;

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
      fsekolah: String(sekolah),
      rjalur: String(jalur),
      rstatus: "1"
    })
  });

  return await res.text();
}

async function ambilSemuaNilai(sekolah, jalur) {
  let offset = 0;
  let semuaNilai = [];

  while (true) {
    const html =
      await ambilHalaman(sekolah, jalur, offset);

    const nilai = [];

    const regex =
      /<td[^>]*>\s*<div[^>]*>\s*([0-9]+\.[0-9]{2})\s*<\/div>/g;

    let match;

    while ((match = regex.exec(html)) !== null) {
      nilai.push(parseFloat(match[1]));
    }

    if (nilai.length === 0) {
      break;
    }

    semuaNilai.push(...nilai);

    console.log(
      sekolah,
      "offset",
      offset,
      "dapat",
      nilai.length
    );

    if (nilai.length < 10) {
      break;
    }

    offset += 10;
  }

  return semuaNilai;
}

async function run() {
  const hasil = [];

  for (let sekolah = 301; sekolah <= 343; sekolah++) {

    const nilai =
      await ambilSemuaNilai(sekolah, 3);

    hasil.push({
      sekolah_id: sekolah,
      sekolah: `SMP NEGERI ${sekolah - 300}`,
      peserta: nilai.length,
      tertinggi:
        nilai.length
          ? Math.max(...nilai)
          : null,
      cutoff:
        nilai.length
          ? Math.min(...nilai)
          : null
    });

    console.log(
      sekolah,
      nilai.length
    );
  }

  hasil.sort(
    (a, b) =>
      (b.tertinggi || 0) -
      (a.tertinggi || 0)
  );

  fs.mkdirSync(
    "data",
    { recursive: true }
  );

  fs.writeFileSync(
    "data/latest.json",
    JSON.stringify({
      updated_at:
        new Date().toISOString(),
      jalur: "Prestasi",
      ranking: hasil
    }, null, 2)
  );

  console.log("SELESAI");
}

run();
