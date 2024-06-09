import { db } from '../js/firebase.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js';

/* authentication */
export function checkUserTypeThenRedirect(user) {
	if (!user) {
		window.location = "./login.html";
		return;
	}

	const docRef = doc(db, "users", user.uid);
	getDoc(docRef).then(userSnap => {
		const userType = userSnap.data().userType;
		// if (userType == 0) {
		// 	window.location = "./login.html";
		// }
		// else
		if (userType == 1) {
			window.location = "./menu-items.html";
		}
	});
}

export function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

export function parseDate(millis) {
    const date = new Date(millis);
    const formattedDate = date.toLocaleString('en-US',
        {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
            // weekday:"long",
            // hour: '2-digit',
            // hour12: true,
            // minute:'2-digit',
            //second:'2-digit'
        });
    return formattedDate;
}

export function parseTime(millis) {
    const date = new Date(millis);
    const formattedDate = date.toLocaleString('en-US',
        {
            // year: 'numeric',
            // month: 'long',
            // day: 'numeric'
            // weekday:"long",
            hour: '2-digit',
            hour12: true,
            minute:'2-digit',
            //second:'2-digit'
        });
    return formattedDate;
}

export function checkAuthThenRedirect(user) {
	if (!user) {
		window.location = "./login.html";
		return;
	}

	checkUserTypeThenRedirect(user);
}

export function blockNonAdmins(user) {
	if (!user) {
		window.location = "./login.html";
		return;
	}

	const docRef = doc(db, "users", user.uid);
	getDoc(docRef).then(userSnap => {
		const userType = userSnap.data().userType;
		if (userType == 0) {
			window.location = "./login.html";
		}
	});
}

/* ui */
export function showModal(modalId) {
    const modal = bootstrap.Modal.getOrCreateInstance(document.querySelector(modalId)); 
    modal.show();
}

export function hideModal(modalId) {
    const modal = bootstrap.Modal.getOrCreateInstance(document.querySelector(modalId)); 
    modal.hide();
}

export function hideElement(element) {
	element.classList.toggle('d-none', true);
}

export function showElement(element) {
	element.classList.toggle('d-none', false);
}

export function validate(elements) {
	elements.forEach((element) => {
		element.classList.toggle('is-invalid', false);
		element.classList.toggle('is-valid', true);
	});
}

export function invalidate(elements) {
	elements.forEach((element) => {
		element.classList.toggle('is-valid', false);
		element.classList.toggle('is-invalid', true);
	});
}

export function resetValidation(elements) {
	elements.forEach((element) => {
		element.classList.toggle('is-valid', false);
		element.classList.toggle('is-invalid', false);
	});
}

export function generateAvatar(firstName) {
	const firstLetter = firstName.charAt(0);
    const imgAvatar = document.querySelectorAll('.user-avatar');
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    const foregroundColor = "white";
    const backgroundColor = '#E13333';

    canvas.width = 35;
    canvas.height = 35;

    // Draw background
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw text
    context.font = "1.2rem Nunito";
    context.fillStyle = foregroundColor;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(firstLetter, canvas.width / 2, canvas.height / 1.8);

	imgAvatar.forEach(element => {
		element.src = canvas.toDataURL("image/png");
		element.style.borderRadius = "50%";
	});
}

export function parseButtonAction(status) {
	if (status == "Pending") {
		return "Accept Booking";
	}
	else if (status == "Confirmed") {
		return "Start Preparations";
	}
	else if (status == "Preparing") {
		return "Transport Food to Venue";
	}
	else if (status == "In Transit") {
		return "Mark as Completed";
	}
	else if (status == "Completed") {
		return -1;
	}
}
// export function parseDate(millis) {
// 	const seconds = millis
// }

export function titleCase(str) {
	var splitStr = str.toLowerCase().split(' ');
	for (var i = 0; i < splitStr.length; i++) {
			// You do not need to check if i is larger than splitStr length, as your for does that for you
			// Assign it back to the array
			splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
	}
	// Directly return the joined string
	return splitStr.join(' '); 
}