const hamburgerBtn = document.querySelector('.hamburger');
const mobilenavigationList = document.querySelector('.mobilenavigationList');
const mobilenavigation = document.querySelector('.mobilenavigation');
const logo = document.querySelector('.logo');

hamburgerBtn.addEventListener('click', () => {
    hamburgerBtn.classList.toggle('active');
    mobilenavigationList.classList.toggle('active');
    mobilenavigation.classList.toggle('active');
    logo.classList.toggle('active');
});

const filterBtn = document.querySelector('.fliterIcon');
const fliterMoblie = document.querySelector('.fliter-moblie');

filterBtn.addEventListener('click', () => {
    fliterMoblie.classList.toggle('active');
});

document.querySelector('.shopByCat').addEventListener('click', ()=>{
    document.querySelector('#shopByCat').classList.toggle('display');
});

const aWishlistBtn = document.querySelectorAll('.wishlist')
aWishlistBtn.forEach((element) => {
console.log(element.getAttribute('href'));
    element.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        axios({
        method: element.getAttribute('data-methode'),
        url: element.getAttribute('href'),
        data: { url: location.pathname },
        })
        .then(res => {
        if(res.data.status){
            return location.reload();
        }
        }) 
        .catch(err => {
        location.href = '/userLogin';
        console.log(err);
        })
    })
})