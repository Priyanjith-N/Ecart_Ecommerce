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

const cName = document.querySelector('.cName');

function showPopUp(bannerId, name) {
	cName.innerHTML = `${name}`;
	document.getElementById('confirm-btn').setAttribute('data-bannerId', bannerId);
	document.getElementById('confirmation-popup').style.display = 'block';
};

document.getElementById('confirm-btn').addEventListener('click', function() {
	if((cName.innerHTML === 'restore') && cName.innerHTML){
		axios.patch(`/adminRestoreBanner/${document.getElementById('confirm-btn').getAttribute('data-bannerId')}`)
		.then(res => {
			if(res.status){
				document.getElementById('confirmation-popup').style.display = 'none';
				location.reload();
			}
		})
		.catch(err => {
			location.href = '/adminLogin';
		})
	} else {
		axios.delete(`/adminPremenentDeleteBanner/${document.getElementById('confirm-btn').getAttribute('data-bannerId')}`)
		.then(res => {
			if(res.status){
				document.getElementById('confirmation-popup').style.display = 'none';
				location.reload();
			}
		})
		.catch(err => {
			location.href = '/adminLogin';
		})
	}
});

document.getElementById('cancel-btn').addEventListener('click', function() {
	document.getElementById('confirm-btn').setAttribute('data-bannerId', '');
	document.getElementById('confirmation-popup').style.display = 'none';
	cName.innerHTML = '';
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
})