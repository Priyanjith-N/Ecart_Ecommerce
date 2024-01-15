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
			<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
				<circle cx="10" cy="10" r="10" fill="white"/>
				<path d="M10 0C4.47679 0 0 4.47679 0 10C0 15.5232 4.47679 20 10 20C15.5232 20 20 15.5232 20 10C20 4.47679 15.5232 0 10 0ZM13.7946 12.5321C14.1429 12.8804 14.1429 13.4464 13.7946 13.7946C13.4464 14.1429 12.8804 14.1429 12.5321 13.7946L10 11.2625L7.46786 13.7946C7.11964 14.1429 6.55357 14.1429 6.20536 13.7946C5.85714 13.4464 5.85714 12.8804 6.20536 12.5321L8.7375 10L6.20536 7.46786C5.85714 7.11964 5.85714 6.55357 6.20536 6.20536C6.55357 5.85714 7.11964 5.85714 7.46786 6.20536L10 8.7375L12.5321 6.20536C12.8804 5.85714 13.4464 5.85714 13.7946 6.20536C14.1429 6.55357 14.1429 7.11964 13.7946 7.46786L11.2625 10L13.7946 12.5321Z" fill="#FF0000"/>
			</svg>
		</a>
	  </div>`
	});

	uploadedImg.innerHTML = images;
}

inputBox.addEventListener('change', () => {
	document.querySelector('#fileDiv').classList.remove('errDiv');
	const inputFiles = inputBox.files;
	if(files.length + inputFiles.length > 4){
		const dataTransfer = new DataTransfer();
		for (let i = 0; i < files.length; i++) {
			dataTransfer.items.add(files[i]);
		}
		inputBox.files = dataTransfer.files;
		document.querySelector('#fileDiv').classList.add('errDiv');
		document.querySelector('#err').innerHTML = `Please select 4 images Only`
	}else{
		const validImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
		const dataTransfer = new DataTransfer();
		document.querySelector('#fileDiv').classList.remove('errDiv');
		for (let i = 0; i < inputFiles.length; i++) {
			if(!validImageExtensions.includes(inputFiles[i].name.substring(inputFiles[i].name.lastIndexOf('.')))){
				document.querySelector('#fileDiv').classList.add('errDiv');
				document.querySelector('#err').innerHTML = `Please select ${validImageExtensions.toString().split(',').join(', ')} images Only`;
				continue;
			}
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