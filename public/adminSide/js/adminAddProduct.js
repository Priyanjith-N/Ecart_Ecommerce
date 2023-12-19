const lPrice = document.querySelector('.lPrice');
const fPrice = document.querySelector('.fPrice');
const discount = document.querySelector('.discount');
const errMesg = document.querySelector('.errMesg');
const addBtn = document.querySelector('.addBtn');
const lErr = document.querySelector('.lErr');

lPrice.addEventListener('keyup', () => {
	if(Number(fPrice.value) >= Number(lPrice.value)){
		console.log(fPrice.value, typeof fPrice.value, lPrice.value, typeof lPrice.value);
		errMesg.style.display = 'none';
		errMesg.innerHTML = ``;
		fPrice.style.border = `none`
		addBtn.setAttribute('type', 'submit');
		discount.value = `${((fPrice.value - lPrice.value) / fPrice.value) * 100}`
	}else{
		discount.value = `0`;
		fPrice.style.border = `1px solid red`
		addBtn.setAttribute('type', 'button');
		lErr.innerHTML = ``;
		errMesg.innerHTML = `First Price needs to be greater than Last Price`;
		errMesg.style.display = 'block';
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
		errMesg.style.display = 'none';
		errMesg.innerHTML = ``;
		fPrice.style.border = `none`
		addBtn.setAttribute('type', 'submit');
	}else{
		discount.value = `0`;
		fPrice.style.border = `1px solid red`
		addBtn.setAttribute('type', 'button');
		lErr.innerHTML = ``;
		errMesg.style.display = 'block';
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

const uploadedImg = document.querySelector('.adminUpload');

const inputBox = document.querySelector('#imageFile');

const files = [];

function showImg(){
	let images = ``;

	files.forEach((element, index) => { 
		return images += `<div class="img">
		<img src="${URL.createObjectURL(element)}" alt="">
		<a onclick='deleteImg(${index})'>
		  <svg
			  width="13"
			  height="17"
			  viewBox="0 0 15 19"
			  fill="none"
			  xmlns="http://www.w3.org/2000/svg"
			>
			  <path
				d="M1.07143 16.8889C1.07143 18.05 2.03571 19 3.21429 19H11.7857C12.9643 19 13.9286 18.05 13.9286 16.8889V4.22222H1.07143V16.8889ZM15 1.05556H11.25L10.1786 0H4.82143L3.75 1.05556H0V3.16667H15V1.05556Z"
				fill="black"
			  />
		  </svg>
		</a>
	  </div>`
	});

	uploadedImg.innerHTML = images;
}

inputBox.addEventListener('change', () => {
	document.querySelector('#fileDiv').classList.remove('errDiv');
	const inputFiles = inputBox.files;
	console.log(inputBox.files,'shdfksdf');
	if(files.length + inputFiles.length > 4){
		const dataTransfer = new DataTransfer();
		for (let i = 0; i < files.length; i++) {
			dataTransfer.items.add(files[i]);
		}
		inputBox.files = dataTransfer.files;
		document.querySelector('#fileDiv').classList.add('errDiv');
		document.querySelector('#err').innerHTML = `Please select 4 images Only`
	}else{
		const dataTransfer = new DataTransfer();
		document.querySelector('#fileDiv').classList.remove('errDiv');
		for (let i = 0; i < inputFiles.length; i++) {
			files.push(inputFiles[i]);
		}
		for (let i = 0; i < files.length; i++) {
			dataTransfer.items.add(files[i]);
		}
		inputBox.files = dataTransfer.files;
		showImg();
	}
	console.log(inputBox.files);
});

function deleteImg(index) {
    const dataTransfer = new DataTransfer();
	files.splice(index, 1);
    for (let i = 0; i < files.length; i++) {
        dataTransfer.items.add(files[i]);
    }

    inputBox.files = dataTransfer.files;

    showImg();
}



// // TOGGLE SIDEBAR
// const menuBar = document.querySelector('#content nav .bx.bx-menu');
// const sidebar = document.getElementById('sidebar');

// menuBar.addEventListener('click', function () {
// 	sidebar.classList.toggle('hide');
// })







// const searchButton = document.querySelector('#content nav form .form-input button');
// const searchButtonIcon = document.querySelector('#content nav form .form-input button .bx');
// const searchForm = document.querySelector('#content nav form');

// searchButton.addEventListener('click', function (e) {
// 	if(window.innerWidth < 576) {
// 		e.preventDefault();
// 		searchForm.classList.toggle('show');
// 		if(searchForm.classList.contains('show')) {
// 			searchButtonIcon.classList.replace('bx-search', 'bx-x');
// 		} else {
// 			searchButtonIcon.classList.replace('bx-x', 'bx-search');
// 		}
// 	}
// });




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