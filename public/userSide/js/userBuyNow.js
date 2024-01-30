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

const noOfPro = document.querySelector("#noOfPro");

let couponDiscount;

let usedCoupon = false;
document.querySelector(".removecD").addEventListener("click", (e) => {
  document.querySelector(".sCD").classList.add("d-none");
  document.querySelector(".cD").innerHTML = "";
  document.getElementById("cId").setAttribute('value', '');
  document.querySelector(".inputCouponVal").value = "";
  document.getElementById("cDPrice").innerHTML = "0";
  const tPrice = document.getElementById("tPrice");
  const lPrice = Number(
    document.querySelector(".lPrice").innerHTML.replace(/[₹,]/g, "")
  );
  tPrice.innerHTML = (
    Number(document.querySelector(".qtyOne").innerHTML) * lPrice
  ).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
  });
  couponDiscount = 0;
  usedCoupon = false;
});
const valDiv = document.querySelector(".valDiv");
const errVal = document.querySelector(".errVal");
const couponForm = document.querySelector("#couponsForm");

document.querySelector(".inputCouponVal")?.addEventListener("keydown", (e) => {
  valDiv.classList.remove("errDiv");
  errVal.innerHTML = "";
});

couponForm.addEventListener("submit", (e) => {
  valDiv.classList.remove("errDiv");
  errVal.innerHTML = "";
  e.preventDefault();
  const data = {};

  $("#couponsForm")
    .serializeArray()
    .forEach((val) => {
      data[`${val.name}`] = val.value.trim().toUpperCase();
    });

  if (data.code && !usedCoupon) {
    axios
      .post("/isCouponValid", data)
      .then((res) => {
        if (!res.data?.status) {
          location.href = `/login`;
        }
        const tPrice = document.getElementById("tPrice");
        const lPrice = document.querySelector(".lPrice");
        const quantity = document.getElementById("noOfPro");

        document
          .getElementById("cId")
          .setAttribute("value", res.data.coupon._id);

        document.getElementById("cDPrice").innerHTML = `-${Math.round(
          (res.data.coupon.discount *
            Number(tPrice.innerHTML.replace(/[₹,]/g, ""))) /
            100
        )}`;

        tPrice.innerHTML = Math.round(
          Number(
            lPrice.innerHTML.replace(/[₹,]/g, "") * Number(quantity.value)
          ) -
            (res.data.coupon.discount *
              Number(
                lPrice.innerHTML.replace(/[₹,]/g, "") * Number(quantity.value)
              )) /
              100
        ).toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
        });
        
        document.querySelector(".cD").innerHTML = res.data.coupon.code;
        document.querySelector(".sCD").classList.remove("d-none");
        usedCoupon = true;
        couponDiscount = Number(res.data.coupon.discount);
      })
      .catch((err) => {
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
      noOfPro.setAttribute("value", `${Number(qty[index].innerHTML)}`);
      const lNum = Number(lPrice[index].innerHTML.replace(/[₹,]/g, ""));
      let dNum = ((fNum - lNum) * Number(noOfPro.value));
      if (dNum === 0) {
        dPrice.innerHTML = `0`;
      } else {
        dNum = dNum.toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
        });
        dPrice.innerHTML = `${dNum.replace(/[₹]/g, "-")}`;
      }

      
      let tNum = (lNum * Number(noOfPro.value));
      if(couponDiscount){
        document.querySelector('#cDPrice').innerHTML = `-${Math.round(tNum * couponDiscount / 100)}`;
        tNum = Math.round(tNum - (tNum * couponDiscount / 100));
      }
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
    // above is seting sub total
    noOfPro.setAttribute("value", `${Number(qty[index].innerHTML)}`);// inc the quantity

    const lNum = Number(lPrice[index].innerHTML.replace(/[₹,]/g, "")); // last price p
    let dNum = Number(dPrice.innerHTML.replace(/[-,]/g, ""));// discount price p
    dNum = (fNum - lNum) * Number(noOfPro.value);
    dNum = dNum.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
    });

    dPrice.innerHTML = `${dNum.replace(/[₹]/g, "-")}`;
    //discount is set in above
    let tNum;
    tNum = (lNum * Number(noOfPro.value));
    if(couponDiscount){
      document.querySelector('#cDPrice').innerHTML = `-${Math.round(tNum * couponDiscount / 100)}`;
      tNum = Math.round(tNum - (tNum * couponDiscount / 100));
    }
    tPrice.innerHTML = tNum.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
    });
  });
});

try {
  document.querySelector(".shopByCat").addEventListener("click", () => {
    document.querySelector("#shopByCat").classList.toggle("display");
  });
} catch (err) {
  console.error(err);
}
