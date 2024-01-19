$('#updateForm').submit((event) => {
	event.preventDefault();

	const data = {};

	$('#updateForm').serializeArray().map(value => {
	  data[`${value.name}`] = value.value;
	});

	axios.put($('#updateForm').attr("action"), data)
	  .then(res => {
		if(res.data.status){
		  location.href = '/adminCategoryManagement';
		}
	  })
	  .catch(err => {
		if(err.response.data.err){
		  return location.reload();
		}
		console.error(err, 'form err');
	  });
});

const lPrice = document.querySelector('.lPrice');
const fPrice = document.querySelector('.fPrice');
const discount = document.querySelector('.discount');
const errMesg = document.querySelector('.errMesg');
const addBtn = document.querySelector('.addBtn');

lPrice.addEventListener('keyup', () => {
	if(Number(fPrice.value) >= Number(lPrice.value)){
		console.log(fPrice.value, typeof fPrice.value, lPrice.value, typeof lPrice.value);
		errMesg.innerHTML = ``;
		fPrice.style.border = `none`
		addBtn.setAttribute('type', 'submit');
		discount.value = `${((fPrice.value - lPrice.value) / fPrice.value) * 100}`
	}else{
		discount.value = `0`;
		fPrice.style.border = `1px solid red`
		addBtn.setAttribute('type', 'button');
		errMesg.innerHTML = `First Price needs to be greater than Last Price`;
	}
});

discount.addEventListener('keyup', () => {
	if((Number(discount.value) < 100 && Number(discount.value) >= 0) || !discount.value){
		lPrice.value = `${fPrice.value - ((fPrice.value * discount.value) / 100)}`
	}else{
		if(Number(discount.value) > 100){
			discount.value = `100`;
			lPrice.value = `0`
		}else{
			discount.value = `0`;
			lPrice.value = `0`;
		}
	}
});

fPrice.addEventListener('keyup', () => {
	if(Number(fPrice.value) >= Number(lPrice.value)){
		if(lPrice.value){
			discount.value = `${((fPrice.value - lPrice.value) / fPrice.value) * 100}`
		}else{
			discount.value = `0`
		}
		
		errMesg.innerHTML = ``;
		fPrice.style.border = `none`
		addBtn.setAttribute('type', 'submit');
	}else{
		discount.value = `0`;
		fPrice.style.border = `1px solid red`
		addBtn.setAttribute('type', 'button');
		errMesg.innerHTML = `First Price needs to be greater than Last Price`;
	}
});



const allSideMenu = document.querySelectorAll('#sidebar .side-menu.top li a');

allSideMenu.forEach(item=> {
	const li = item.parentElement;

	item.addEventListener('click', function () {
		allSideMenu.forEach(i=> {
			i.parentElement.classList.remove('active');
		})
		li.classList.add('active');
	})
});




// TOGGLE SIDEBAR
const menuBar = document.querySelector('#content nav .bx.bx-menu');
const sidebar = document.getElementById('sidebar');

menuBar.addEventListener('click', function () {
	sidebar.classList.toggle('hide');
})







const searchButton = document.querySelector('#content nav form .form-input button');
const searchButtonIcon = document.querySelector('#content nav form .form-input button .bx');
const searchForm = document.querySelector('#content nav form');

searchButton.addEventListener('click', function (e) {
	if(window.innerWidth < 576) {
		e.preventDefault();
		searchForm.classList.toggle('show');
		if(searchForm.classList.contains('show')) {
			searchButtonIcon.classList.replace('bx-search', 'bx-x');
		} else {
			searchButtonIcon.classList.replace('bx-x', 'bx-search');
		}
	}
})





if(window.innerWidth < 768) {
	sidebar.classList.add('hide');
} else if(window.innerWidth > 576) {
	searchButtonIcon.classList.replace('bx-x', 'bx-search');
	searchForm.classList.remove('show');
}


window.addEventListener('resize', function () {
	if(this.innerWidth > 576) {
		searchButtonIcon.classList.replace('bx-x', 'bx-search');
		searchForm.classList.remove('show');
	}
})



const switchMode = document.getElementById('switch-mode');

switchMode.addEventListener('change', function () {
	if(this.checked) {
		document.body.classList.add('dark');
	} else {
		document.body.classList.remove('dark');
	}
});