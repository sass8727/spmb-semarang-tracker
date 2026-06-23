const fs = require("fs");

const URL =
  "https://spmb.semarangkota.go.id/smp/listjurnalpendaftaran2";

async function ambilDataSekolah(idSekolah) {
  try {
    const res = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest"
      },
      body: new URLSearchParams({
        per_page: "50",
        cari: "",
        fsekolah: String(idSekolah),
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

    return {
      sekolah_id: idSekolah,
      sekolah: `SMP NEGERI ${idSekolah - 300}`,
      total: nilai.length,
      tertinggi: nilai.length
        ? Math.max(...nilai)
        : null,
      terendah: nilai.length
        ? Math.min(...nilai)
        : null
    };
  } catch (err) {
    return {
      sekolah_id: idSekolah,
      error: err.message
    };
  }
}

async function run() {
  const hasil = [];

  for (let id = 301; id <= 343; id++) {
    console.log("Scan sekolah:", id);

    const data = await ambilDataSekolah(id);

    hasil.push(data);
  }

  hasil.sort((a, b) => {
    return (b.tertinggi || 0) - (a.tertinggi || 0);
  });

  const output = {
    updated_at: new Date().toISOString(),
    jalur: "Prestasi",
    jumlah_sekolah: hasil.length,
    ranking: hasil
  };

  fs.mkdirSync("data", {
    recursive: true
  });

  fs.writeFileSync(
    "data/latest.json",
    JSON.stringify(output, null, 2)
  );

  console.log("SELESAI");
}

run();
