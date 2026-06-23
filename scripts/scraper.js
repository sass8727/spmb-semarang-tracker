const fs = require("fs");

async function getPage(sekolahId, page = 0) {
  const res = await fetch(
    `https://spmb.semarangkota.go.id/smp/listjurnalpendaftaran2/${page}`,
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

async function scrapeSekolah(sekolahId, namaSekolah) {
  let allNilai = [];
  let page = 0;

  while (true) {
    const html = await getPage(sekolahId, page);

    const nilai = [
      ...html.matchAll(/>(\d+\.\d+)<\/div>/g)
    ].map(x => parseFloat(x[1]));

    if (nilai.length === 0) break;

    allNilai.push(...nilai);

    console.log(
      `${namaSekolah} page ${page} => ${nilai.length} data`
    );

    page += 10;
  }

  if (allNilai.length === 0) {
    return null;
  }

  return {
    sekolah_id: sekolahId,
    sekolah: namaSekolah,
    peserta: allNilai.length,
    tertinggi: Math.max(...allNilai),
    cutoff: Math.min(...allNilai)
  };
}

async function run() {

  const sekolahList = [
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

  const hasil = [];

  for (const [id, nama] of sekolahList) {
    const data = await scrapeSekolah(id, nama);

    if (data) {
      hasil.push(data);
    }
  }

  hasil.sort((a, b) => b.cutoff - a.cutoff);

  const output = {
    updated_at: new Date().toISOString(),
    jalur: "Prestasi",
    ranking: hasil
  };

  fs.mkdirSync("data", {
    recursive: true
  });

  fs.writeFileSync(
    "data/latest.json",
    JSON.stringify(output, null, 2)
  );

  console.log(
    `Saved ${hasil.length} sekolah`
  );
}

run();
