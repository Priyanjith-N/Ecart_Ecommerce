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

const decBtn = document.querySelectorAll(".dec");
const incBtn = document.querySelectorAll(".inc");
const qty = document.querySelectorAll(".qtyOne");
const lPrice = document.querySelectorAll(".lPrice");
const fPrice = document.querySelectorAll(".fPrice");
const sTotal = document.querySelector("#sTotal");
const dPrice = document.querySelector("#dPrice");
const tPrice = document.querySelector("#tPrice");

decBtn.forEach((value, index) => {
  value.addEventListener("click", () => {
    if (Number(qty[index].innerHTML) !== 1) {
      qty[index].innerHTML = `${Number(qty[index].innerHTML) - 1}`;
      const sNum = Number(sTotal.innerHTML.replace(/[₹,]/g, ""));
      const fNum = Number(fPrice[index].innerHTML.replace(/[₹,]/g, ""));
      const subNum = sNum - fNum;
      sTotal.innerHTML = subNum.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
      });
      const lNum = Number(lPrice[index].innerHTML.replace(/[₹,]/g, ""));
      let dNum = Number(dPrice.innerHTML.replace(/[-,]/g, ""));
      dNum = dNum - (fNum - lNum);
      if (dNum === 0) {
        dPrice.innerHTML = `0`;
      } else {
        dNum = dNum.toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
        });
        dPrice.innerHTML = `${dNum.replace(/[₹]/g, "-")}`;
      }
      let tNum = Number(tPrice.innerHTML.replace(/[₹,]/g, ""));
      tNum = tNum - lNum;
      tPrice.innerHTML = tNum.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
      });
    }
  });
});

incBtn.forEach((value, index) => {
  value.addEventListener("click", () => {
    qty[index].innerHTML = `${Number(qty[index].innerHTML) + 1}`;
    const sNum = Number(sTotal.innerHTML.replace(/[₹,]/g, ""));
    const fNum = Number(fPrice[index].innerHTML.replace(/[₹,]/g, ""));
    const subNum = sNum + fNum;
    sTotal.innerHTML = subNum.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
    });
    const lNum = Number(lPrice[index].innerHTML.replace(/[₹,]/g, ""));
    let dNum = Number(dPrice.innerHTML.replace(/[-,]/g, ""));
    dNum = dNum + (fNum - lNum);
    dNum = dNum.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
    });
    dPrice.innerHTML = 0;
    dPrice.innerHTML = `${dNum.replace(/[₹]/g, "-")}`;
    let tNum = Number(tPrice.innerHTML.replace(/[₹,]/g, ""));
    tNum = tNum + lNum;
    tPrice.innerHTML = tNum.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
    });
  });
});

const radio = document.querySelectorAll('.radio');

radio.forEach((element, index) => {
  element.addEventListener('change', () => {
    document.querySelector('.formDiv').submit();
  })
}); 

try {
  document.querySelector('.shopByCat').addEventListener('click', ()=>{
    document.querySelector('#shopByCat').classList.toggle('display');
  });
} catch (err) {
  console.error(err);
}


document.getElementById('confirm-btn').addEventListener('click', function() {
  console.log($('#form').serialize());
  $.ajax({
    url: '/buyNowPaymentOrder',
    data: $('#form').serialize(),
    method: "POST"
  })
  .then(res => {
    if(res.err){
      return location.href = res.url;
    }

    if(res.payMethode === "COD"){
      return location.href = res.url;
    }

    if(res.payMethode === "onlinePayment"){
      const options = {
        "key": res.keyId,
        "amount": res.order.amount,
        "currency": "INR",
        "name": "Ecart",
        "description": "Test Transaction",
        // "image": "/userSide/images/header/logo.svg",
        "order_id": res.order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "callback_url": "/onlinePaymentSuccessfull", //after sucessful payment
        "prefill": { //We recommend using the prefill parameter to auto-fill customer's contact information especially their phone number
            "name": "Priyanjith N", 
            "email": "jithpriyan2006@example.com",
            "contact": "9188336166" //Provide the customer's phone number for better conversion rates 
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        }
      };
  
      const rzp1 = new Razorpay(options);
  
      rzp1.open();
    }
  })
  .catch(err => {
    console.err(err)
  })
	document.getElementById('confirmation-popup').style.display = 'none';
});

document.getElementById('cancel-btn').addEventListener('click', function() {
	document.getElementById('confirmation-popup').style.display = 'none';
});

document.querySelector('#form').addEventListener('submit', (e) => {
  e.preventDefault();
	document.getElementById('confirmation-popup').style.display = 'block';
});

const formAddNewAddress = document.querySelector('#addNewAddress');

formAddNewAddress.addEventListener('submit', (e) => {
  e.preventDefault();
  $.ajax({
    url: '/AddAddress?checkOut=true',
    method: 'POST',
    dataType: 'html',
    data: $('#addNewAddress').serialize(),
  })
  .then(data => {
    if (data === 'true') {
      return location.reload();
    }
    const newContent = $(data).find('.editBody').html();

    $('.editBody').html(newContent);
  })
  .catch(err => {
    console.log(err);
  });
});