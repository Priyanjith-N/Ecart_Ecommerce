const lDisplay = document.querySelectorAll('.adminUpload')[0];
const sDisplay = document.querySelectorAll('.adminUpload')[1];

const lImage = document.querySelector('.lImage');
const sImage = document.querySelector('.sImage');

lImage.addEventListener('change', () => {
	const inputFiles = lImage.files;
	if(inputFiles.length === 0){
		document.querySelector('.largeImageUpload').style.display = 'none';
		return document.querySelector('.largeImageSrc').setAttribute('src', ``); 
	}
	console.log(URL.createObjectURL(inputFiles[0]));
	document.querySelector('.largeImageUpload').style.display = 'block';
	document.querySelector('.largeImageSrc').setAttribute('src', `${URL.createObjectURL(inputFiles[0])}`);
});

sImage.addEventListener('change', () => {
	const inputFiles = sImage.files;
	if(inputFiles.length === 0){
		document.querySelector('.smallImageUpload').style.display = 'none';
		return document.querySelector('.smallImageSrc').setAttribute('src', ``); 
	}
	console.log(URL.createObjectURL(inputFiles[0]));
	document.querySelector('.smallImageUpload').style.display = 'block';
	document.querySelector('.smallImageSrc').setAttribute('src', `${URL.createObjectURL(inputFiles[0])}`);
});

function deleteImg(selector, imgSelector, inputType){
	document.querySelector(`.${selector}`).style.display = 'none';
	document.querySelector(`.${imgSelector}`).setAttribute('src', ``); 
	document.querySelector(`.${inputType}`).value = '';
}



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