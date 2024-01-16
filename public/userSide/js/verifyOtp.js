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

const time = document.querySelector(".seconds");

const cancelIntervel = setInterval(() => {
  if (Number(time.innerHTML) > 0) {
    document.querySelector(".remainingTime").value = `${
      Number(time.innerHTML) - 1
    }`;
    time.innerHTML = `${Number(time.innerHTML) - 1}`;
  } else {
    clearInterval(cancelIntervel);
    showButton();
  }
}, 1000);

function showButton() {
  document.querySelector(".resendbtn").style.display = "block";
}

try {
  document.querySelector('.shopByCat').addEventListener('click', ()=>{
    document.querySelector('#shopByCat').classList.toggle('display');
  });
} catch (err) {
  console.error(err);
}