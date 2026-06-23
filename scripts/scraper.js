const fs = require("fs");

async function getPage(sekolahId, offset = 0) {
  const res = await fetch(
    `https://spmb.semarangkota.go.id/smp/listjurnalpendaftaran2/${offset}`,
    {
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
        rjalur: "3",
        rstatus: "1"
      })
    }
  );

  return await res.text();
}

function extractNilai(html) {
  const hasil = [];

  const regex =
    /<td[^>]*align="center"[^>]*>\s*<div[^>]*>\s*(\d+\.\d+)\s*<\/div>/g;

  let m;

  while ((m = regex.exec(html)) !== null) {
    hasil.push(parseFloat(m[1]));
  }

  return hasil;
}

async function scrapeSekolah(id, nama) {
  let semuaNilai = [];
  let offset = 0;

  while (true) {
    const html = await getPage(id, offset);

    const nilai = extractNilai(html);

    if (nilai.length === 0) {
      break;
    }

    semuaNilai.push(...nilai);

    console.log(
      `${nama} offset=${offset} data=${nilai.length}`
    );

    offset += 10;

    if (offset > 1000) break;
  }

  if (!semuaNilai.length) {
    return null;
  }

  return {
    sekolah_id: id,
    sekolah: nama,
    peserta: semuaNilai.length,
    tertinggi: Math.max(...semuaNilai),
    cutoff: Math.min(...semuaNilai)
  };
}

async function run() {

  const sekolah = [
    [301,"SMP NEGERI 1"],
    [302,"SMP NEGERI 2"],
    [303,"SMP NEGERI 3"],
    [304,"SMP NEGERI 4"],
    [305,"SMP NEGERI 5"],
    [306,"SMP NEGERI 6"],
    [307,"SMP NEGERI 7"],
    [308,"SMP NEGERI 8"],
    [309,"SMP NEGERI 9"],
    [310,"SMP NEGERI 10"],
    [311,"SMP NEGERI 11"],
    [312,"SMP NEGERI 12"],
    [313,"SMP NEGERI 13"],
    [314,"SMP NEGERI 14"],
    [315,"SMP NEGERI 15"],
    [316,"SMP NEGERI 16"],
    [317,"SMP NEGERI 17"],
    [318,"SMP NEGERI 18"],
    [319,"SMP NEGERI 19"],
    [320,"SMP NEGERI 20"],
    [321,"SMP NEGERI 21"],
    [322,"SMP NEGERI 22"],
    [323,"SMP NEGERI 23"],
    [324,"SMP NEGERI 24"],
    [325,"SMP NEGERI 25"],
    [326,"SMP NEGERI 26"],
    [327,"SMP NEGERI 27"],
    [328,"SMP NEGERI 28"],
    [329,"SMP NEGERI 29"],
    [330,"SMP NEGERI 30"],
    [331,"SMP NEGERI 31"],
    [332,"SMP NEGERI 32"],
    [333,"SMP NEGERI 33"],
    [334,"SMP NEGERI 34"],
    [335,"SMP NEGERI 35"],
    [336,"SMP NEGERI 36"],
    [337,"SMP NEGERI 37"],
    [338,"SMP NEGERI 38"],
    [339,"SMP NEGERI 39"],
    [340,"SMP NEGERI 40"],
    [341,"SMP NEGERI 41"],
    [342,"SMP NEGERI 42"],
    [343,"SMP NEGERI 43"]
  ];

  const ranking = [];

  for (const [id, nama] of sekolah) {
    const data = await scrapeSekolah(id, nama);

    if (data) ranking.push(data);
  }

  ranking.sort((a, b) => b.cutoff - a.cutoff);

  fs.mkdirSync("data", { recursive: true });

  fs.writeFileSync(
    "data/latest.json",
    JSON.stringify(
      {
        updated_at: new Date().toISOString(),
        jalur: "Prestasi",
        ranking
      },
      null,
      2
    )
  );

  console.log(`Saved ${ranking.length} sekolah`);
}

run();
