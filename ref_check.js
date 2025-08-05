// ref_check.js

// Lis referans ki siprime
const refSupprimes = ["Celien", "ref_test1", "ref_expire"];

// Tcheke si URL gen paramet ref
const urlParams = new URLSearchParams(window.location.search);
const ref = urlParams.get("ref");

if (ref) {
  const refFormat = ref.replace(/[^a-zA-Z0-9_]/g, ""); // pwoteksyon kont karaktè spesyal
  if (refSupprimes.includes(refFormat)) {
    // Redireksyon otomatik si ref la siprime
    window.location.href = "ref_supprime.html";
  } else {
    // Sinon, ou ka mete lòt tracking script ou vle la si ref la valab
    console.log("Referral actif :", refFormat);
  }
}
