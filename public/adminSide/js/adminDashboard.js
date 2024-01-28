$(".counter").counterUp({
  delay: 10,
  time: 900,
});

const ctx = document.getElementById("myChart");
let newChart;
let flag = false;

function chartShow(saleData) {
  if (flag) {
    newChart.destroy();
    flag = false;
  }
  newChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: saleData.label,
      datasets: [
        {
          label: "Total Sales",
          data: saleData.salesCount,
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

function chartDetails(filter) {
  $.ajax({
    url: "/api/getDetailsChart",
    method: "POST",
    data: { filter },
  })
    .then((res) => {
      chartShow(res);
    })
    .catch((err) => {
      console.log(err);
    });
}

try {
  const checkBox = document.querySelector('.checkBox');
  const formVal = document.querySelectorAll(".formVal");
  const errP = document.querySelectorAll(".err");
  const showErr = document.querySelectorAll(".showErr");

  checkBox?.addEventListener('change', () => {
    errP[1].innerHTML = "";
    errP[2].innerHTML = "";
    showErr[2].classList.remove("errDiv");
    showErr[3].classList.remove("errDiv");
    if(checkBox.checked){
      formVal[2].value = '';
      formVal[3].value = '';
    }
  });
  formVal?.forEach((element, i) => {
    element?.addEventListener("change", (e) => {
      if (i === 0 || i === 1) {
        errP[0].innerHTML = ``;
        showErr[i === 0 ? 1 : 0].classList.remove("errDiv");
      } else {
        checkBox.checked = false;
        errP[i - 1].innerHTML = "";
      }
      showErr[i].classList.remove("errDiv");
    });
  });
  const form = document.getElementById("downloadSalesReportPDFOrExcel");
  form.addEventListener("submit", (e) => {
    const data = {};
    $("#downloadSalesReportPDFOrExcel")
      .serializeArray()
      .forEach((val) => {
        data[`${val.name}`] = val.value?.trim();
      });

    let err = false;

    if (!data?.type) {
      showErr[0].classList.add("errDiv");
      showErr[1].classList.add("errDiv");
      errP[0].innerHTML = "This field is required";
      err = true;
    }

    if (!data?.full && !data?.fromDate) {
      showErr[2].classList.add("errDiv");
      errP[1].innerHTML = "This field is required";
      err = true;
    }

    if (!data?.full && !data?.toDate) {
      showErr[3].classList.add("errDiv");
      errP[2].innerHTML = "This field is required";
      err = true;
    }

    if (!data?.full && data?.toDate && data?.fromDate && data.toDate < data.fromDate) {
      showErr[2].classList.add("errDiv");
      showErr[3].classList.add("errDiv");
      errP[1].innerHTML =
        "From date need to be less than or equal to the to date";
      err = true;
    }

    if(!data?.full && data?.toDate && (new Date(data.toDate) > new Date())){
      showErr[3].classList.add("errDiv");
      errP[2].innerHTML = `Today is ${new Date().toISOString().split('T')[0].split('-').reverse().join('-')} choose date less than or equal to this`;
      err = true;
    }

    if(!data?.full && data?.fromDate && (new Date(data.fromDate) > new Date())){
      showErr[2].classList.add("errDiv");
      errP[1].innerHTML = `Today is ${new Date().toISOString().split('T')[0].split('-').reverse().join('-')} choose date less than or equal`;
      err = true;
    }

    if (err) {
      e.preventDefault();
    }
  });
} catch (err) {
  console.error('sales report err',err);
}

const formSelect = document.getElementById("filterSales");

window.addEventListener("load", () => {
  chartDetails(formSelect.value);
});

var x, i, j, l, ll, selElmnt, a, b, c;
x = document.getElementsByClassName("custom-select");
l = x.length;
for (i = 0; i < l; i++) {
  selElmnt = x[i].getElementsByTagName("select")[0];
  ll = selElmnt.length;
  a = document.createElement("DIV");
  a.setAttribute("class", "select-selected");
  a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
  x[i].appendChild(a);
  b = document.createElement("DIV");
  b.setAttribute("class", "select-items select-hide");
  for (j = 0; j < ll; j++) {
    c = document.createElement("DIV");
    c.innerHTML = selElmnt.options[j].innerHTML;
    c.addEventListener("click", function (e) {
      var y, i, k, s, h, sl, yl;
      s = this.parentNode.parentNode.getElementsByTagName("select")[0];
      sl = s.length;
      h = this.parentNode.previousSibling;
      for (i = 0; i < sl; i++) {
        if (s.options[i].innerHTML == this.innerHTML) {
          s.selectedIndex = i;
          h.innerHTML = this.innerHTML;
          y = this.parentNode.getElementsByClassName("same-as-selected");
          yl = y.length;
          invokeChangeEvent();
          for (k = 0; k < yl; k++) {
            y[k].removeAttribute("class");
          }
          this.setAttribute("class", "same-as-selected");
          break;
        }
      }
      h.click();
    });
    b.appendChild(c);
  }
  x[i].appendChild(b);
  a.addEventListener("click", function (e) {
    e.stopPropagation();
    closeAllSelect(this);
    this.nextSibling.classList.toggle("select-hide");
    this.classList.toggle("select-arrow-active");
  });
}

function closeAllSelect(elmnt) {
  var x,
    y,
    i,
    xl,
    yl,
    arrNo = [];
  x = document.getElementsByClassName("select-items");
  y = document.getElementsByClassName("select-selected");
  xl = x.length;
  yl = y.length;
  for (i = 0; i < yl; i++) {
    if (elmnt == y[i]) {
      arrNo.push(i);
    } else {
      y[i].classList.remove("select-arrow-active");
    }
  }
  for (i = 0; i < xl; i++) {
    if (arrNo.indexOf(i)) {
      x[i].classList.add("select-hide");
    }
  }
}

document.addEventListener("click", closeAllSelect);

formSelect.addEventListener("change", () => {
  flag = true;
  chartDetails(formSelect.value);
});

function invokeChangeEvent() {
  const event = new Event("change");
  formSelect.dispatchEvent(event);
}

const allSideMenu = document.querySelectorAll("#sidebar .side-menu.top li a");

allSideMenu.forEach((item) => {
  const li = item.parentElement;

  item.addEventListener("click", function () {
    allSideMenu.forEach((i) => {
      i.parentElement.classList.remove("active");
    });
    li.classList.add("active");
  });
});

// TOGGLE SIDEBAR
const menuBar = document.querySelector("#content nav .bx.bx-menu");
const sidebar = document.getElementById("sidebar");

menuBar.addEventListener("click", function () {
  sidebar.classList.toggle("hide");
});

const searchButton = document.querySelector(
  "#content nav form .form-input button"
);
const searchButtonIcon = document.querySelector(
  "#content nav form .form-input button .bx"
);
const searchForm = document.querySelector("#content nav form");

searchButton.addEventListener("click", function (e) {
  if (window.innerWidth < 576) {
    e.preventDefault();
    searchForm.classList.toggle("show");
    if (searchForm.classList.contains("show")) {
      searchButtonIcon.classList.replace("bx-search", "bx-x");
    } else {
      searchButtonIcon.classList.replace("bx-x", "bx-search");
    }
  }
});

if (window.innerWidth < 768) {
  sidebar.classList.add("hide");
} else if (window.innerWidth > 576) {
  searchButtonIcon.classList.replace("bx-x", "bx-search");
  searchForm.classList.remove("show");
}

window.addEventListener("resize", function () {
  if (this.innerWidth > 576) {
    searchButtonIcon.classList.replace("bx-x", "bx-search");
    searchForm.classList.remove("show");
  }
});

const switchMode = document.getElementById("switch-mode");

switchMode.addEventListener("change", function () {
  if (this.checked) {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
});
