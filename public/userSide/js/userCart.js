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
  document.querySelector(".shopByCat").addEventListener("click", () => {
    document.querySelector("#shopByCat").classList.toggle("display");
  });
} catch (err) {
  console.error(err);
}
try {
  let cData;
  const valDiv = document.querySelector('.valDiv');
  const errVal = document.querySelector('.errVal');
  let usedCoupon;
  const couponForm = document.querySelector('.couponForm');

  document.querySelector(".removecD").addEventListener("click", (e) => {
    document.querySelector(".sCD").classList.add("d-none");
    document.querySelector(".cD").innerHTML = "";
    document.getElementById("codeCoupon").setAttribute('value', '');
    document.getElementById("cId").value = '';
    document.getElementById("cDPrice").innerHTML = "0";
    const tPrice = document.getElementById("tPrice");
    tPrice.innerHTML = cData.total.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
    });
    usedCoupon = false;
  });

  couponForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {};

    $(".couponForm").serializeArray().forEach((val) => {
      data[`${val.name}`] = val.value.trim().toUpperCase();
    });

    if(data?.code && !usedCoupon){
      axios.post('/isCouponValidCart', data)
      .then((res) => {
        if (!res.data?.status) {
          location.href = `/login`;
        }
        
        document.querySelector('#cDPrice').innerHTML = `-${res.data.totalDiscount}`;
        const totalNumber = Number(res.data.total - res.data.totalDiscount);
        console.log(totalNumber);
        document.querySelector('#tPrice').innerHTML = totalNumber.toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
        });
        document.querySelector('#codeCoupon').setAttribute('value', `${res.data.coupon._id}`);
        document.querySelector(".cD").innerHTML = res.data.coupon.code;
        document.querySelector(".sCD").classList.remove("d-none");
        cData = res.data;
        usedCoupon = true;
      }).catch((err) => {
        if (err.response.status !== 401 && err.response.status !== 500) {
          return console.error(err);
        }

        if (err.response.data.reload) {
          return location.reload();
        }

        errVal.innerHTML = err.response.data.message;
        valDiv.classList.add("errDiv");
        console.error(err, "sdkfsjgfdshg");
      });
    }
    
  });

  document.querySelector('#cId')?.addEventListener('keydown', (e) => {
    errVal.innerHTML = '';
    valDiv.classList.remove("errDiv");
  });
} catch (err) {
  console.log(err);
}
const decBtn = document.querySelectorAll(".dec");
const incBtn = document.querySelectorAll(".inc");
const qty = document.querySelectorAll(".qtyOne");
const lPrice = document.querySelectorAll(".lPrice");
const fPrice = document.querySelectorAll(".fPrice");
const sTotal = document.querySelector("#sTotal");
const dPrice = document.querySelector("#dPrice");
const tPrice = document.querySelector("#tPrice");

const stockErr = document.querySelectorAll(".stockErr");

decBtn.forEach((value, index) => {
  value.addEventListener("click", () => {
    if (Number(qty[index].innerHTML) > 1) {
      $.ajax({
        url: `/cartItemUpdate/${document
          .querySelectorAll(".items")
          [index].getAttribute("data-productId")}/0?couponId=${document.querySelector('#codeCoupon').getAttribute('value')}`, // Update the path to your EJS file
        method: "GET",
      }).then((data) => {
        if (data.stock >= Number(qty[index].innerHTML - 1)) {
          stockErr[index].style.display = "none";
          stockErr[index].classList.remove('d-block');
        }
        if (data.result) {
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
          console.log(tNum,'total number');
          tPrice.innerHTML = tNum.toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
          });

          document.querySelector('#cDPrice').innerHTML = `-${data.totalDiscount}`;
          document.querySelector('#tPrice').innerHTML = (data.total - data.totalDiscount).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
          });
        }
      });
    }
  });
});

incBtn.forEach((value, index) => {
  value.addEventListener("click", () => {
    $.ajax({
      url: `/cartItemUpdate/${document
        .querySelectorAll(".items")
        [index].getAttribute("data-productId")}/1?couponId=${document.querySelector('#codeCoupon').getAttribute('value')}`, // Update the path to your EJS file
      method: "GET",
    }).then((data) => {
      if (!data.result) {
        if(data.stock === 0){
          stockErr[index].innerHTML = "Out Of Stock";
          return (stockErr[index].style.display = "block");
        }
        stockErr[index].innerHTML = data.message;
        return (stockErr[index].style.display = "block");
      }
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
      document.querySelector('#cDPrice').innerHTML = `-${data.totalDiscount}`;
      document.querySelector('#tPrice').innerHTML = (data.total - data.totalDiscount).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
      });
    });
  });
});

document.querySelectorAll('.stop').forEach(element => {
  element.addEventListener('click', (e) => {
    e.stopPropagation();
  })
})
