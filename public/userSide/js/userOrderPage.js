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

const dCat = document.querySelector('.dCat');

function showPopUp(orderId, productId) {
	dCat.setAttribute('href', href=`/orderCancel/${orderId}/${productId}`);
	document.getElementById('confirmation-popup').style.display = 'block';
};

document.getElementById('confirm-btn').addEventListener('click', function() {
	document.getElementById('confirmation-popup').style.display = 'none';
});

document.getElementById('cancel-btn').addEventListener('click', function() {
	document.getElementById('confirmation-popup').style.display = 'none';
});

const aTag = document.querySelectorAll('.aTag');

aTag.forEach(element => {
  element.addEventListener('click', (e) => {
    e.stopPropagation();
  })
})