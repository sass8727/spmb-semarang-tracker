const fs = require("fs");

async function run() {
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
        fsekolah: "301",
        rjalur: "3",
        rstatus: "1"
      })
    }
  );

  const html = await res.text();

  console.log("===== HTML START =====");
  console.log(html.substring(0, 5000));
  console.log("===== HTML END =====");

  fs.mkdirSync("data", {
    recursive: true
  });

  fs.writeFileSync(
    "data/latest.json",
    JSON.stringify(
      {
        updated_at: new Date().toISOString(),
        html_length: html.length
      },
      null,
      2
    )
  );
}

run();
