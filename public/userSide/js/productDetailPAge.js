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

const demoTrigger = document.querySelector(".demo-trigger");
const paneContainer = document.querySelector(".detail");

new Drift(demoTrigger, {
  paneContainer: paneContainer,
  inlinePane: false,
});

function changeImg(url) {
  document.querySelector(".mainFistImg").setAttribute("src", `${url}`);
  document.querySelector(".mainFistImg").setAttribute("data-zoom", `${url}`);
}

const filterBtn = document.querySelector(".fliterIcon");
const fliterMoblie = document.querySelector(".fliter-moblie");

filterBtn.addEventListener("click", () => {
  fliterMoblie.classList.toggle("active");
});

document.querySelector('.mainImg').addEventListener('mouseover', () => {
    document.querySelector('.detail').style.display = 'block';
    document.querySelector('.detail').style.background = 'white';
});

document.querySelector('.mainFistImg').addEventListener('mouseout', () => {
  console.log('hhh');
    document.querySelector('.detail').style.display = 'none';
    document.querySelector('.detail').style.background = 'transparent';
});

document.querySelector('.mainImg').addEventListener('mouseout', () => {
  console.log('hhh');
    document.querySelector('.detail').style.display = 'none';
    document.querySelector('.detail').style.background = 'transparent';
});

try {
  document.querySelector('.shopByCat').addEventListener('click', ()=>{
    document.querySelector('#shopByCat').classList.toggle('display');
  });
} catch (err) {
  console.error(err);
}

const aWishlistBtn = document.querySelector('#wishlist')
aWishlistBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    axios({
      method: aWishlistBtn.getAttribute('data-methode'),
      url: aWishlistBtn.getAttribute('href'),
      data: { url: location.pathname },
    })
    .then(res => {
      if(res.data.status){
        return location.reload();
      }
    }) 
    .catch(err => {
      location.href = '/login';
      console.log(err);
    })
})