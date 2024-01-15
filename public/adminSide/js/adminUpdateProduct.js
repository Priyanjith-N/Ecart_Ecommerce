const lPrice = document.querySelector('.lPrice');
const fPrice = document.querySelector('.fPrice');
const discount = document.querySelector('.discount');
const errMesg = document.querySelector('.errMesg');
const addBtn = document.querySelector('.addBtn');
const lErr = document.querySelector('.lErr');

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
		errMesg.innerHTML = ``;
		fPrice.style.border = `none`
		addBtn.setAttribute('type', 'submit');
	}else{
		discount.value = `0`;
		fPrice.style.border = `1px solid red`
		addBtn.setAttribute('type', 'button');
		lErr.innerHTML = ``;
		errMesg.innerHTML = `First Price needs to be greater than Last Price`;
		errMesg.style.display = 'block';
	}
});

function reloadPage(){
	$.ajax({
		url: `/adminUpdateProduct/${document.querySelector('.uploadedImg').getAttribute('data-Id')}`, // Update the path to your EJS file
		method: 'GET',
		dataType: 'html',
		success: function (data) {
		  // Extract the content of the #myDiv from the loaded data
		  var newContent = $(data).find('.uploadedImg').html();
  
		  // Update the content of the existing #myDiv
		  $('.uploadedImg').html(newContent);

		  showImg();
  
		  // You may need to reinitialize any JavaScript associated with the new content
		  // For example, if there are event listeners, you may need to reattach them.
		},
		error: function (error) {
		  console.error('Error loading content:', error);
		}
	  });
}

const NoOfImg = document.querySelector('.uploadedImg').getAttribute('data-NoOfImg');

const errImgOne = document.querySelector('.errImgOne');

if(NoOfImg >= 4){
	document.querySelector('.imgFile').setAttribute('disabled','');
}



const uploadedImg = document.querySelector('.uploadedImg');

const inputBox = document.querySelector('.imgFile');

const files = [];

inputBox.addEventListener('change', () => {
	const file = inputBox.files;

	if(file.length + files.length + Number(document.querySelector('.uploadedImg').getAttribute('data-NoOfImg')) > 4){
		errImgOne.innerHTML = `Please Select 4 files only`;
		errImgOne.style.display = 'block'
		inputBox.value = '';
	}else{
		for (let i = 0; i < file.length; i++) {
			files.push(file[i]);
		}
		console.log(files,'fiels');
		errImgOne.innerHTML = ``;
		showImg();
	}
});


function showImg(){
	if (Number(document.querySelector('.uploadedImg').getAttribute('data-NoOfImg')) < 4 ) {
		document.querySelector('.imgFile').removeAttribute('disabled');
	}

	let images = '';

	files.forEach((value, index) => {
		images += `<div class="img">
		<img src="${URL.createObjectURL(value)}" alt="">
		<a onclick='deleteImg(${index})'>
			<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
				<circle cx="10" cy="10" r="10" fill="white"/>
				<path d="M10 0C4.47679 0 0 4.47679 0 10C0 15.5232 4.47679 20 10 20C15.5232 20 20 15.5232 20 10C20 4.47679 15.5232 0 10 0ZM13.7946 12.5321C14.1429 12.8804 14.1429 13.4464 13.7946 13.7946C13.4464 14.1429 12.8804 14.1429 12.5321 13.7946L10 11.2625L7.46786 13.7946C7.11964 14.1429 6.55357 14.1429 6.20536 13.7946C5.85714 13.4464 5.85714 12.8804 6.20536 12.5321L8.7375 10L6.20536 7.46786C5.85714 7.11964 5.85714 6.55357 6.20536 6.20536C6.55357 5.85714 7.11964 5.85714 7.46786 6.20536L10 8.7375L12.5321 6.20536C12.8804 5.85714 13.4464 5.85714 13.7946 6.20536C14.1429 6.55357 14.1429 7.11964 13.7946 7.46786L11.2625 10L13.7946 12.5321Z" fill="#FF0000"/>
			</svg>
		</a>
	  </div>`
	});
	console.log(images);

	
	if(Number(document.querySelector('.uploadedImg').getAttribute('data-NoOfImg')) === 0){
		uploadedImg.innerHTML = images;
	}else{
		document.querySelector('.adminUpload').innerHTML = images;
	}
}


function deleteImg(index) {
	files.splice(index,1);
	errImgOne.innerHTML = ``;
	errImgOne.style.display = 'none'
	console.log(files);
	reloadPage();
}

function deleteImgFromDB(id, index){
	$.ajax({
		url: `/adminDeleteProductImg?id=${id}&index=${index}`, // Update the path to your EJS file
		method: 'GET',
		dataType: 'html',
		success: function (data) {
		  // Extract the content of the #myDiv from the loaded data
		  var newContent = $(data).find('.uploadedImg').html();
  
		  // Update the content of the existing #myDiv
		  console.log(newContent);
		  $('.uploadedImg').html(newContent);
		  document.querySelector('.uploadedImg').setAttribute('data-NoOfImg', `${Number(document.querySelector('.uploadedImg').getAttribute('data-NoOfImg')) - 1}`);

		  showImg();
  
		  // You may need to reinitialize any JavaScript associated with the new content
		  // For example, if there are event listeners, you may need to reattach them.
		},
		error: function (error) {
		  console.error('Error loading content:', error);
		}
	  });
}


$(".addProductForm").submit(function(event) {
	event.preventDefault();

  const unindexed_array = $(this).serializeArray();

  const formData = new FormData();

  unindexed_array.forEach((value) => {
	formData.append(`${value['name']}`, value['value']);
  });

  files.forEach((value) => {
	formData.append("fileInput", value);
  })

  $.ajax({
	type: "POST",
	url: `/adminUpdateProduct?id=${document.querySelector('.addProductForm').getAttribute('data-productId')}`,
	data: formData,
	contentType: false,
	processData: false,
	success: function(response) {
		console.log(response);
		window.location.href = response;
	},
	error: function(error) {
		console.log('Error: '+ JSON.stringify(error));
	}
  })

  console.log(formData);
})

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