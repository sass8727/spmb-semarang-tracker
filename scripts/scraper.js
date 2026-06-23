const fs = require("fs");

const URL =
"https://spmb.semarangkota.go.id/smp/listjurnalpendaftaran2";

async function fetchData({
sekolah = "301",
jalur = "3",
status = "1"
}) {
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
fsekolah: sekolah,
rjalur: jalur,
rstatus: status
})
});

return await res.text();
}

async function run() {
const html = await fetchData({
sekolah: "301",
jalur: "3",
status: "1"
});

const totalMatch =
html.match(/Total\s+(\d+)\s+Pendaftar/i);

const totalPendaftar =
totalMatch ? parseInt(totalMatch[1]) : 0;

const nilai = [
...html.matchAll(/([0-9]{2,3}.[0-9]{2})/g)
]
.map((x) => parseFloat(x[1]))
.filter((x) => x > 50);

const data = {
updated_at: new Date().toISOString(),
sekolah: "SMP NEGERI 1",
sekolah_id: 301,
jalur: "Prestasi",
total: totalPendaftar,
nilai_tertinggi:
nilai.length > 0
? Math.max(...nilai)
: null,
nilai_terendah:
nilai.length > 0
? Math.min(...nilai)
: null,
sampel_nilai: nilai.slice(0, 10)
};

fs.mkdirSync("data", {
recursive: true
});

fs.writeFileSync(
"data/latest.json",
JSON.stringify(data, null, 2)
);

console.log(data);
}

run().catch((err) => {
console.error(err);
process.exit(1);
});
