const fs = require("fs");

async function getPage(sekolahId, offset) {
  const res = await fetch(
    "https://spmb.semarangkota.go.id/smp/listjurnalpendaftaran2",
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
        rstatus: "1",
        offset: String(offset)
      })
    }
  );

  return await res.text();
}

async function getKuotaPrestasi(regno, sekolahId) {
  const res = await fetch(
    "https://spmb.semarangkota.go.id/smp/popDetil",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest"
      },
      body: new URLSearchParams({
        regno: String(regno),
        opt: String(sekolahId)
      })
    }
  );

  const html = await res.text();

  const m = html.match(/1\s*dari\s*(\d+)/i);

  if (!m) return null;

  return parseInt(m[1]);
}

async function scrapeSekolah(id) {
  let offset = 0;
  let peserta = [];

  while (true) {
    const html = await getPage(id, offset);

    const regnos =
      [...html.matchAll(/class="REGNO"[^>]*>(\d+)/g)]
      .map(x => x[1]);

    const nilai =
      [...html.matchAll(/(\d+\.\d{2})/g)]
      .map(x => parseFloat(x[1]))
      .filter(x => x > 50);

    for (let i = 0; i < Math.min(regnos.length, nilai.length); i++) {
      peserta.push({
        regno: regnos[i],
        nilai: nilai[i]
      });
    }

    console.log(
      `SMP ${id} offset=${offset} data=${regnos.length}`
    );

    if (regnos.length < 10) break;

    offset += 10;
  }

  peserta.sort((a, b) => b.nilai - a.nilai);

  if (!peserta.length) return null;

  const kuota = await getKuotaPrestasi(
    peserta[0].regno,
    id
  );

  let cutoff = null;

  if (kuota && peserta.length >= kuota) {
    cutoff = peserta[kuota - 1].nilai;
  }

  return {
    sekolah: `SMP NEGERI ${id}`,
    peserta: peserta.length,
    tertinggi: peserta[0].nilai,
    kuota_prestasi: kuota,
    cutoff
  };
}

(async () => {
  const ranking = [];

  for (let id = 301; id <= 343; id++) {
    const data = await scrapeSekolah(id);

    if (data) ranking.push(data);
  }

  ranking.sort(
    (a, b) => (b.cutoff || 0) - (a.cutoff || 0)
  );

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

  console.log("DONE");
})();
