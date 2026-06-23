const fs = require("fs");

const URL =
  "https://spmb.semarangkota.go.id/smp/listjurnalpendaftaran2";

const sekolahMap = {
  301: "SMP NEGERI 1",
  302: "SMP NEGERI 2",
  303: "SMP NEGERI 3",
  304: "SMP NEGERI 4",
  305: "SMP NEGERI 5",
  306: "SMP NEGERI 6",
  307: "SMP NEGERI 7",
  308: "SMP NEGERI 8",
  309: "SMP NEGERI 9",
  310: "SMP NEGERI 10",
  311: "SMP NEGERI 11",
  312: "SMP NEGERI 12",
  313: "SMP NEGERI 13",
  314: "SMP NEGERI 14",
  315: "SMP NEGERI 15",
  316: "SMP NEGERI 16",
  317: "SMP NEGERI 17",
  318: "SMP NEGERI 18",
  319: "SMP NEGERI 19",
  320: "SMP NEGERI 20",
  321: "SMP NEGERI 21",
  322: "SMP NEGERI 22",
  323: "SMP NEGERI 23",
  324: "SMP NEGERI 24",
  325: "SMP NEGERI 25",
  326: "SMP NEGERI 26",
  327: "SMP NEGERI 27",
  328: "SMP NEGERI 28",
  329: "SMP NEGERI 29",
  330: "SMP NEGERI 30",
  331: "SMP NEGERI 31",
  332: "SMP NEGERI 32",
  333: "SMP NEGERI 33",
  334: "SMP NEGERI 34",
  335: "SMP NEGERI 35",
  336: "SMP NEGERI 36",
  337: "SMP NEGERI 37",
  338: "SMP NEGERI 38",
  339: "SMP NEGERI 39",
  340: "SMP NEGERI 40",
  341: "SMP NEGERI 41",
  342: "SMP NEGERI 42",
  343: "SMP NEGERI 43"
};

async function getSekolah(id) {
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
      fsekolah: String(id),
      rjalur: "3",
      rstatus: "1"
    })
  });

  const html = await res.text();

  const totalMatch = html.match(/Total\s+(\d+)\s+Pendaftar/i);
  const total = totalMatch ? parseInt(totalMatch[1]) : 0;

  const nilai = [
    ...html.matchAll(/\b(\d{2,3}\.\d{2})\b/g)
  ]
    .map(x => parseFloat(x[1]))
    .filter(x => x > 50);

  return {
    sekolah_id: id,
    sekolah: sekolahMap[id],
    peserta: total,
    tertinggi: nilai.length
      ? Math.max(...nilai)
      : null,
    cutoff: nilai.length
      ? Math.min(...nilai)
      : null
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
      console.log("ERROR", sekolah, e.message);
    }
  }

  // Ranking berdasarkan CUTOFF
  ranking.sort((a, b) => b.cutoff - a.cutoff);

  const result = {
    updated_at: new Date().toISOString(),
    jalur: "Prestasi",
    ranking
  };

  fs.mkdirSync("data", {
    recursive: true
  });

  fs.writeFileSync(
    "data/latest.json",
    JSON.stringify(result, null, 2)
  );

  console.log("DONE");
}

run();
