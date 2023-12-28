$(".counter").counterUp({
  delay: 10,
  time: 900,
});

const ctx = document.getElementById("myChart");
let newChart;
let flag = false;

function chartShow(saleData) {
  if(flag){
    newChart.destroy();
    flag = false
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
          backgroundColor: "blue", // Background color of the bars
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
    data: {filter}
  })
    .then(res => {
      console.log(res);
      chartShow(res);
    })
    .catch(err => {
      console.log(err);
    });
}

window.addEventListener("load", () => {
  chartDetails(document.getElementById('filterSales').value);
});

document.getElementById('filterSales').addEventListener('change', () => {
  flag = true;
  chartDetails(document.getElementById('filterSales').value);
});

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
