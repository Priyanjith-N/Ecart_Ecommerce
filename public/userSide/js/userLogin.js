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

const triggerPassword = document.querySelector('.fa');

triggerPassword.addEventListener('click', () => {
  if(document.querySelector('.passwordField').getAttribute('type') === 'password'){
    document.querySelector('.passwordField').setAttribute('type', 'text');
    triggerPassword.classList.remove('fa-eye-slash');
    triggerPassword.classList.add('fa-eye');
  }else if(document.querySelector('.passwordField').getAttribute('type') === 'text'){
    document.querySelector('.passwordField').setAttribute('type', 'password');
    triggerPassword.classList.remove('fa-eye');
    triggerPassword.classList.add('fa-eye-slash');
  }
});