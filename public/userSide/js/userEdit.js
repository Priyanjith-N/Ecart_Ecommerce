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

const triggerPassword = document.querySelectorAll('.fa');
const passwordField = document.querySelectorAll('.passwordField')

triggerPassword.forEach((each, index) => {
  each.addEventListener('click', () => {
    if(passwordField[index].getAttribute('type') === 'password'){
      passwordField[index].setAttribute('type', 'text');
      each.classList.remove('fa-eye-slash');
      each.classList.add('fa-eye');
    }else if(passwordField[index].getAttribute('type') === 'text'){
      passwordField[index].setAttribute('type', 'password');
      each.classList.remove('fa-eye');
      each.classList.add('fa-eye-slash');
    }
  });
});