if(localStorage.getItem("merchantLogged")!=="true"){
  window.location.href="merchantloginfobas.html";
}

function logout(){
  localStorage.removeItem("merchantLogged");
  window.location.href="merchantloginfobas.html";
}

function generateQR(){
  qr.innerHTML="<h3>QR Paiement FOBAS</h3><p>[QR CODE ICI]</p>";
}
