const hamburgerBtn = document.querySelector(".hamburger");
const mobilenavigationList = document.querySelector(".mobilenavigationList");
const mobilenavigation = document.querySelector(".mobilenavigation");
const logo = document.querySelector(".logo");

hamburgerBtn.addEventListener("click", () => {
  hamburgerBtn.classList.toggle("active");
  mobilenavigationList.classList.toggle("active");
  mobilenavigation.classList.toggle("active");
  logo.classList.toggle("active");
});

try {
  document.querySelector('.shopByCat').addEventListener('click', ()=>{
    document.querySelector('#shopByCat').classList.toggle('display');
  });
} catch (err) {
  console.error(err);
}

function copyToClipboard() {
  var copyText = document.getElementById("referralLink");
  var tempInput = document.createElement("input");
  tempInput.value = copyText.textContent;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand("copy");
  document.body.removeChild(tempInput);

  var copiedTooltip = document.getElementById("copiedTooltip");
  copiedTooltip.classList.add("show");

  setTimeout(function() {
    copiedTooltip.classList.remove("show");
  }, 1500);
}