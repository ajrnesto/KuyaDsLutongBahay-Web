import { db, auth, storage } from '../js/firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js';
import { doc, collection, getDoc, onSnapshot, getDocs, setDoc, updateDoc, increment, query, where, orderBy } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js';
import { ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-storage.js";
import { parseButtonAction, capitalizeFirstLetter, parseDate, parseTime, showModal } from '../js/utils.js';

const tbodyUsers = document.querySelector("#tbodyUsers");
const tvUserName = document.querySelector("#tvUserName");
const bookingsContainer = document.querySelector("#ordersContainer");
const etFirstName = document.querySelector("#etFirstName");
const etLastName = document.querySelector("#etLastName");
const btnSearchUser = document.querySelector("#btnSearchUser");
const btnSearchId = document.querySelector("#btnSearchId");
const dlId = document.querySelector("#dlId");
const dlFirstName = document.querySelector("#dlFirstName");
const dlLastName = document.querySelector("#dlLastName");

onAuthStateChanged(auth, user => {
	const docRef = doc(db, "users", user.uid);
	getDoc(docRef).then(userSnap => {
		const userType = userSnap.data().userType;
	});
});

window.addEventListener("load", function() {
	getUsersData("");
	populateDatalists();
});

btnSearchUser.addEventListener("click", function() {
	getUsersData("name");
});

// btnSearchId.addEventListener("click", function() {
// 	etFirstName.value = "";
// 	etLastName.value = "";
// 	getUsersData("id");
// });

function populateDatalists() {
	dlFirstName.value = "";
}

function getUsersData(filter) {
	let qryUsers = null;

	if (etFirstName.value.toUpperCase() && !etLastName.value.toUpperCase()) {
		qryUsers = query(collection(db, "users"), where("firstName", "==", etFirstName.value.toUpperCase()));	
	}
	else if (!etFirstName.value.toUpperCase() && etLastName.value.toUpperCase()) {
		qryUsers = query(collection(db, "users"), where("lastName", "==", etLastName.value.toUpperCase()));	
	}
	else if (etFirstName.value.toUpperCase() && etLastName.value.toUpperCase()) {
		qryUsers = query(collection(db, "users"), where("firstName", "==", etFirstName.value.toUpperCase()), where("lastName", "==", etLastName.value.toUpperCase()));	
	}
	else if (!etFirstName.value && !etLastName.value) {
		qryUsers = query(collection(db, "users"));	
	}
	
	onSnapshot(qryUsers, (users) => {
		// clear table
		tbodyUsers.innerHTML = '';

		console.log("Users size: "+users.size);
		if (users.size == 0) {
			tbodyUsers.innerHTML = '<div class="col-12 text-center mt-4"><h4>No Users to Display</h4></div>';
		}
		else {
			tbodyUsers.innerHTML = '';
		}
			
		users.forEach(user => {
			if (user.data().email != "beautypro.admin@gmail.com") {
				// const newIdOption = document.createElement('option');
				// newIdOption.value = user.id;
				// dlId.appendChild(newIdOption);

				const newFirstNameOption = document.createElement('option');
				newFirstNameOption.value = user.data().firstName;
				dlFirstName.appendChild(newFirstNameOption);
				
				const newLastNameOption = document.createElement('option');
				newLastNameOption.value = user.data().lastName;
				dlLastName.appendChild(newLastNameOption);
			}

			if (user.data().userType != 1 || user.data().userType != 2) {
				if (user.data().email != "kuyads-lutongbahay@gmail.com") {
					renderUsers(
						user.id,
						user.data().firstName,
						user.data().lastName,
						user.data().email,
						user.data().mobile,
						user.data().addressPurok,
						user.data().addressBarangay
					);
				}
			}
		});
	});
}

function renderUsers(id, firstName, lastName, email, mobile, addressPurok, addressBarangay) {
	const newRow = document.createElement('tr');
	// const cellId = document.createElement('td');
	const cellName = document.createElement('td');
	const cellAddress = document.createElement('td');
	const cellMobile = document.createElement('td');
	const cellEmail = document.createElement('td');
	// const cellVerification = document.createElement('td');
	// const btnVerificationAction = document.createElement('button');
	// const tvVerificationMessage = document.createElement('p');
	const cellHistory = document.createElement('td');
	const btnHistoryAction = document.createElement('button');

	// cellId.innerHTML = id;
	cellName.innerHTML = firstName + " " + lastName;
	cellAddress.innerHTML = ((addressPurok?(addressPurok + ", SIATON"):""))?(addressPurok?(addressPurok + ", SIATON"):""):"No Address Specified";
	cellMobile.innerHTML = mobile;
	cellEmail.innerHTML = email;

	// btnVerificationAction.className = "btn btn-no-border btn-success";
	// btnVerificationAction.innerHTML = "Verify";
	// tvVerificationMessage.className = "text-success";
	// tvVerificationMessage.innerHTML = "Verified";
	// if (!isVerified) {
	// 	btnVerificationAction.classList.toggle("d-none", false);
	// 	tvVerificationMessage.classList.toggle("d-none", true);
	// }
	// else {
	// 	btnVerificationAction.classList.toggle("d-none", true);
	// 	tvVerificationMessage.classList.toggle("d-none", false);
	// }
	// btnVerificationAction.onclick = function() {
	// 	verifyUser(id);
	// }

	btnHistoryAction.className = "btn btn-no-border btn-primary";
	btnHistoryAction.innerHTML = "View";
	btnHistoryAction.onclick = function() {
		viewUserHistory(id, firstName, lastName);
	}
	
	// newRow.appendChild(cellId);
	newRow.appendChild(cellName);
	newRow.appendChild(cellAddress);
	newRow.appendChild(cellMobile);
	newRow.appendChild(cellEmail);
	// newRow.appendChild(cellVerification);
	// cellVerification.appendChild(btnVerificationAction);
	// cellVerification.appendChild(tvVerificationMessage);
	newRow.appendChild(cellHistory);
	cellHistory.appendChild(btnHistoryAction);
	
	tbodyUsers.append(newRow);
}

// function verifyUser(userId) {
// 	updateDoc(doc(db, "users", userId), {
// 		isVerified: true
// 	});
// }

function viewUserHistory(userId, firstName, lastName) {
	tvUserName.innerHTML = firstName + " " + lastName;
	showModal("#modalViewHistory");

	getDocs(query(collection(db, "bookings"), where("customerUid", "==", userId), orderBy("timestamp", "asc"))).then((bookings) => {
		// clear table
		ordersContainer.innerHTML = '';

		if (bookings.size == 0) {
			ordersContainer.innerHTML = '<div class="col-12 text-center mt-4"><h4>No Orders to Display</h4></div>';
		}
		else {
			ordersContainer.innerHTML = '';
		}
			
		bookings.forEach(order => {
			renderOrderCard(
				order.id,
				order.data().customerUid,
				order.data().firstName,
				order.data().lastName,
				order.data().mobile,
				order.data().eventType,
				order.data().headcount,
				order.data().bundleSize,
				order.data().dishes,
				order.data().purok,
				order.data().barangay,
				order.data().eventDate,
				order.data().eventTime,
				order.data().status,
				order.data().timestamp,
				order.data().total
			);
		});
	});
}

function renderOrderCard(id, customerUid, firstName, lastName, mobile, eventType, headcount, bundleSize, dishes, purok, barangay, eventDate, eventTime, status, timestamp, total) {
    const cardContainer = document.createElement('div');
    	const card = document.createElement('div');
    		const cardHeader = document.createElement('div');
    			const tvTimestamp = document.createElement('p');
    			const tvStatus = document.createElement('h6');
    			const divButtonContainer = document.createElement('div');
					const btnChat = document.createElement('button');
					const btnAction = document.createElement('button');
					const btnSecondaryAction = document.createElement('button');
					const tvCustomer = document.createElement('h6');
					const tvEventType = document.createElement('p');
    			const tvBundleSize = document.createElement('p');
    			const tvHeadcount = document.createElement('p');
    			const tvVenue = document.createElement('p');
    			const tvEventDate = document.createElement('p');
			const cardBody = document.createElement('div');
				const table = document.createElement('table');
					const thead = document.createElement('thead');
						const tr = document.createElement('tr');
							const thImage = document.createElement('th');
							const thMenuItem = document.createElement('th');
					const tbody = document.createElement('tbody');
			const cardFooter = document.createElement('div');
				const tvTotal = document.createElement('h6');

	cardContainer.className = "row container mx-auto col-12 p-4 justify-content-center";
	card.className = "rounded bg-white col-6 text-center p-4";
	cardHeader.className = "row";
	tvTimestamp.className = "col-6 text-start text-dark fs-6";
	tvStatus.className = "col-6 text-end text-danger fs-6";
	divButtonContainer.className = "col-12 text-end p-0";
	btnAction.className = "btn btn-primary m-0";
	btnChat.classList = "btn btn-primary float-start me-2";
	btnSecondaryAction.className = "ms-2 btn btn-danger text-white";
	tvCustomer.className = "text-primary text-start my-0 py-0";
	tvEventType.className = "text-dark text-start my-0 py-0";
	tvBundleSize.className = "text-dark text-start my-0 py-0 d-none";
	tvHeadcount.className = "text-dark text-start my-0 py-0";
	tvVenue.className = "text-dark text-start my-0 py-0";
	tvEventDate.className = "text-dark text-start my-0 py-0";
	cardBody.className = "row mt-3";
	table.className = "col-6 table align-middle";
	thImage.className = "col-1 invisible text-end";
	thMenuItem.className = "col-auto text-start";
	cardFooter.className = "row";
	tvTotal.className = "text-primary col-12 text-end mt-2";

	thMenuItem.innerHTML = "Selected Items";

	const date = new Date(timestamp);
	tvTimestamp.innerHTML = date.toLocaleString();
	tvStatus.innerHTML = "Status: "+status;

	const btnActionValue = parseButtonAction(status);
	if (btnActionValue == -1) {
		btnAction.className = "invisible";
	}
	else {
		btnAction.innerHTML = btnActionValue;
	}
	btnAction.onclick = function() { updateOrderStatus(id, firstName, lastName, status, total) }

	if (status == "In Transit"){
		btnSecondaryAction.innerHTML = "Failed To Deliver";
	}
	else {
		btnSecondaryAction.className = "invisible";
	}
	btnChat.onclick = function() { chat(customerUid) }
	
	tvTotal.innerHTML = "Total: ₱"+Number(total * headcount).toFixed(2);

	tvCustomer.innerHTML = firstName + " " + lastName + " (" + mobile + ")";
	tvEventType.innerHTML = "Event Type: " + capitalizeFirstLetter(eventType);
	tvBundleSize.innerHTML = "Bundle Size: " + bundleSize + " Dishes";
	tvHeadcount.innerHTML = "Headcount: " + headcount + " Persons";
	tvVenue.innerHTML = purok + ", " + barangay + ", Siaton";
	if (eventTime) {
		tvEventDate.innerHTML = "Event Date: " + parseDate(eventDate) + ", " + parseTime(eventTime);
	}
	else {
		tvEventDate.innerHTML = "Event Date: " + parseDate(eventDate);
	}
	btnChat.innerHTML = "<i class=\"bi bi-chat-dots-fill me-2 text-white fs-6\"></i>Chat";

	cardContainer.appendChild(card);
		card.appendChild(cardHeader);
			cardHeader.appendChild(tvTimestamp);
			cardHeader.appendChild(tvStatus);
			cardHeader.appendChild(tvCustomer);
			cardHeader.appendChild(tvEventType);
			cardHeader.appendChild(tvBundleSize);
			cardHeader.appendChild(tvHeadcount);
			cardHeader.appendChild(tvVenue);
			cardHeader.appendChild(tvEventDate);
		card.appendChild(cardBody);
			card.appendChild(table);
				table.appendChild(thead);
					thead.appendChild(tr);
						tr.appendChild(thImage);
						tr.appendChild(thMenuItem);
						//tr.appendChild(thDetails);
				table.appendChild(tbody);
		card.appendChild(cardFooter);
			cardFooter.appendChild(tvTotal);
			cardFooter.appendChild(divButtonContainer);
				divButtonContainer.appendChild(btnChat);
				divButtonContainer.appendChild(btnAction);
				// divButtonContainer.appendChild(btnSecondaryAction);
			// cardHeader.appendChild(tvDeliveryAddress);

	bookingsContainer.prepend(cardContainer);

	getOrderItemsData(id, dishes, tbody);
}

function updateOrderStatus(orderId, status, deliveryOption, total, userUid, firstName, lastName) {
	if (status == "Pending") {
		updateDoc(doc(db, "orders", orderId), {
			status: "Preparing"
		});

		const now = new Date();
		const thisMonth = ("0" + (now.getMonth() + 1)).slice(-2);
		const thisYear = now.getFullYear();
		setDoc(doc(db, "revenue", thisYear+thisMonth), {
			revenue: increment(total)
		},
		{
			merge:true
		});
	}
	else if (status == "Preparing") {
		if (deliveryOption == "Delivery") {
			updateDoc(doc(db, "orders", orderId), {
				status: "In Transit"
			});
		}
		else if (deliveryOption == "Pick-up") {
			updateDoc(doc(db, "orders", orderId), {
				status: "Ready for Pick-up"
			});
		}
	}
	else if (status == "In Transit" || status == "Ready for Pick-up") {
		updateDoc(doc(db, "orders", orderId), {
			status: "Delivered/Picked-up"
		});
	}
	else if (status == "Marked as Failed Delivery") {
		updateDoc(doc(db, "orders", orderId), {
			status: "Failed Delivery"
		});
	}
	
	viewUserHistory(userUid, firstName, lastName);
}

async function getOrderItemsData(orderId, dishes, tbody) {
	dishes.forEach((dish) => {
		// if (!product.exists()) {
		// 	renderOrderItems(
		// 		tbody,
		// 		"-1",
		// 		"Deleted Item",
		// 		"Deleted Item",
		// 		0,
		// 		0,
		// 		null
		// 	);

		// 	return;
		// }

		renderOrderItems(
			tbody,
			dish.id,
			dish.productName,
			dish.thumbnail,
			dish.categoryId
		);
	});
}

function renderOrderItems(tbody, productId, productName, thumbnail, categoryId) {
	const newRow = document.createElement('tr');
	const cellMenuItemThumbnail = document.createElement('td');
		const imgThumbnail = document.createElement('img');
	const cellMenuItemName = document.createElement('td');
	const cellUnitPrice = document.createElement('td');
	const cellQuantity = document.createElement('td');
	const cellSubtotal = document.createElement('td');

	if (thumbnail == null){
		imgThumbnail.src = "https://via.placeholder.com/150?text=No+Image";
	}
	else {
		getDownloadURL(ref(storage, 'products/'+thumbnail))
			.then((url) => {
				imgThumbnail.src = url;
			});
	}
	cellMenuItemThumbnail.className = "text-end";
	imgThumbnail.className = "col-12 rounded";
	imgThumbnail.style.width = "50px";
	imgThumbnail.style.height = "50px";
	imgThumbnail.style.objectFit = "cover";

	cellMenuItemName.innerHTML = productName;
	cellMenuItemName.className = "text-start";

	newRow.appendChild(cellMenuItemThumbnail);
		cellMenuItemThumbnail.appendChild(imgThumbnail);
	newRow.appendChild(cellMenuItemName);

	tbody.append(newRow);
}