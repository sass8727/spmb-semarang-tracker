const fs = require("fs");

async function run() {

  const params = new URLSearchParams();

  params.append("fsekolah", "301");
  params.append("rjalur", "3");
  params.append("rstatus", "1");

  const res = await fetch(
    "https://spmb.semarangkota.go.id/smp/listjurnalpendaftaran.html",
    {
      method: "POST",
      body: params
    }
  );

  const html = await res.text();

  const totalMatch = html.match(/Total\\s+(\\d+)\\s+Pendaftar/i);

  const nilaiMatch = [...html.matchAll(/>(\\d+\\.\\d+)</g)];

  const data = {
    updated_at: new Date().toISOString(),
    total: totalMatch ? parseInt(totalMatch[1]) : 0,
    nilai_tertinggi: nilaiMatch.length
      ? Math.max(...nilaiMatch.map(x => Number(x[1])))
      : null,
    nilai_terendah: nilaiMatch.length
      ? Math.min(...nilaiMatch.map(x => Number(x[1])))
      : null
  };

  fs.mkdirSync("data", { recursive: true });

  fs.writeFileSync(
    "data/latest.json",
    JSON.stringify(data, null, 2)
  );

  console.log(data);
}

run();
