import { db, auth, storage } from '../js/firebase.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js';
import { doc, collection, getDoc, or, and, getDocs, addDoc, updateDoc, increment, deleteDoc, Timestamp, arrayUnion, deleteField, limit, query, where, orderBy, startAt, endAt, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js';
import { ref as sRef, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-storage.js";
import * as utils from '../js/utils.js';

const cardBookings = document.querySelector("#cardBookings");
const tvBookings = document.querySelector("#tvBookings");

const cardDocumentRequests = document.querySelector("#cardDocumentRequests");
const tvDocumentRequests = document.querySelector("#tvDocumentRequests");

const cardIncidentReports = document.querySelector("#cardIncidentReports");
const tvIncidentReports = document.querySelector("#tvIncidentReports");

const cardMenuItems = document.querySelector("#cardMenuItems");
const tvMenuItems = document.querySelector("#tvMenuItems");

const cardRevenue = document.querySelector("#cardRevenue");
const tvRevenue = document.querySelector("#tvRevenue");

const bookingsContainer = document.querySelector("#bookingsContainer");

const cardBookingsHistory = document.querySelector("#cardBookingsHistory");
const tvEmptyBookingsHistory = document.querySelector("#tvEmptyBookingsHistory");
const divBookingsHistory = document.querySelector("#divBookingsHistory");
let chartBookingsHistory = Chart.getChart("#chartBookingsHistory");

const cardCategories = document.querySelector("#cardCategories");
const tvEmptyCategories = document.querySelector("#tvEmptyCategories");
const divCategories = document.querySelector("#divCategories");
let chartCategories = Chart.getChart("#chartCategories");

const cardRevnueAllTime = document.querySelector("#cardRevnueAllTime");
const tvEmptyRevenueAllTime = document.querySelector("#tvEmptyRevenueAllTime");
const divRevenueAllTime = document.querySelector("#divRevenueAllTime");
let chartRevenueAllTime = Chart.getChart("#chartRevenueAllTime");

const date = new Date();
const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getTime();
const firstDayOfMonth1MonthAgo = new Date(date.getFullYear(), date.getMonth()-1, 1).getTime();
const lastDayOfMonth1MonthAgo = new Date(date.getFullYear(), date.getMonth()-1 + 1, 0).getTime();
const firstDayOfMonth2MonthsAgo = new Date(date.getFullYear(), date.getMonth()-2, 1).getTime();
const lastDayOfMonth2MonthsAgo = new Date(date.getFullYear(), date.getMonth()-2 + 1, 0).getTime();
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// on load, check if user is not logged in
onAuthStateChanged(auth, user => {
	if (!user) {
		logOut();
		return;
	}
});

function logOut() {
	signOut(auth).then(() => {
		window.location = "../index.html";
	}).catch((error) => {});
};

window.addEventListener("load", function() {
	listenToBookingsToday();
	listenToBookingsThisWeek();
	listenToBookingsHistory();
	listenToMenuItems();
	listenToMenuCategories();
	listenToRevenueThisMonth();
	listenToRevenueAllTime();
});

function listenToBookingsToday() {
	const dateToday = new Date();
	dateToday.setHours(0);
	dateToday.setMinutes(0);
	dateToday.setSeconds(0);
	dateToday.setMilliseconds(0);

	const qryBookings = query(collection(db, "bookings"), where("eventDate", "==", dateToday.getTime()));

	onSnapshot(qryBookings, (bookings) => {
		// clear table
		bookingsContainer.innerHTML = '';

		console.log("Bookings size: "+bookings.size);
		if (bookings.size == 0) {
			bookingsContainer.innerHTML = '<div class="col-12 text-center"><h5>There are no bookings for today</h5></div>';
		}
		else {
			bookingsContainer.innerHTML = '';
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
				order.data().total,
				bookings.size
			);
		});
	});

}

function renderOrderCard(id, customerUid, firstName, lastName, mobile, eventType, headcount, bundleSize, dishes, purok, barangay, eventDate, eventTime, status, timestamp, total, bookingsSize) {
    const cardContainer = document.createElement('div');
    	const card = document.createElement('div');
    		const cardHeader = document.createElement('div');
    			const tvTimestamp = document.createElement('p');
    			const tvStatus = document.createElement('h6');
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

	cardContainer.className = bookingsSize>1?"row container col-6 justify-content-center":"row container col-6 mx-auto justify-content-center";
	cardContainer.role = "button";
	cardContainer.onclick = function() {
		window.location = "./bookings.html";
	}
	card.className = "rounded bg-white col-12 text-center p-4";
	cardHeader.className = "row";
	tvTimestamp.className = "col-6 text-start text-dark fs-6";
	tvStatus.className = "col-6 text-end text-danger fs-6";
	tvCustomer.className = "text-primary text-start my-0 py-0";
	tvEventType.className = "col-6 text-dark text-start my-0 py-0";
	tvBundleSize.className = "col-6 text-dark text-start my-0 py-0 d-none";
	tvHeadcount.className = "col-6 text-dark text-end my-0 py-0";
	tvVenue.className = "col-6 text-dark text-start my-0 py-0";
	tvEventDate.className = "col-6 text-dark text-end my-0 py-0";
	cardBody.className = "row mt-3";
	table.className = "col-6 table align-middle";
	thImage.className = "col-1 invisible text-end";
	thMenuItem.className = "col-auto text-start";
	cardFooter.className = "row";
	tvTotal.className = "text-primary col-12 text-end";

	thMenuItem.innerHTML = "Selected Items";

	const date = new Date(timestamp);
	tvTimestamp.innerHTML = date.toLocaleString();
	tvStatus.innerHTML = "Status: "+status;
	
	tvTotal.innerHTML = "Total: ₱"+Number(total * headcount).toFixed(2);

	tvCustomer.innerHTML = firstName + " " + lastName + " (" + mobile + ")";
	tvEventType.innerHTML = "Event Type: " + utils.capitalizeFirstLetter(eventType);
	tvBundleSize.innerHTML = "Bundle Size: " + bundleSize + " Dishes";
	tvHeadcount.innerHTML = "Headcount: " + headcount + " Persons";
	tvVenue.innerHTML = purok + ", " + barangay + ", Siaton";
	if (eventTime) {
		tvEventDate.innerHTML = "Event Date: " + utils.parseDate(eventDate) + ", " + utils.parseTime(eventTime);
	}
	else {
		tvEventDate.innerHTML = "Event Date: " + utils.parseDate(eventDate);
	}

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
			// card.appendChild(table);
				// table.appendChild(thead);
					// thead.appendChild(tr);
						// tr.appendChild(thImage);
						// tr.appendChild(thMenuItem);
						//tr.appendChild(thDetails);
				// table.appendChild(tbody);
		card.appendChild(cardFooter);
			cardFooter.appendChild(tvTotal);

	bookingsContainer.prepend(cardContainer);

	// getOrderItemsData(id, dishes, tbody);
}

function listenToBookingsThisWeek() {
	const d = new Date; // get current date
	let dFirst = new Date;
	let dLast = new Date;
	const first = d.getDate() - d.getDay(); // First day is the day of the month - the day of the week
	const last = first + 6; // last day is the first day + 6

	dFirst = new Date(d.setDate(first)).getTime();
	dLast = new Date(d.setDate(last)).getTime();

	let qryBookings = query(collection(db, "bookings"), or((where("timestamp", ">=", dFirst), where("timestamp", "<=", dLast)), (where("timestamp", ">=", dFirst), where("timestamp", "<=", dLast))));
	
	onSnapshot(qryBookings, (bookings) => {
		tvBookings.innerHTML = bookings.size;
	});
}

function listenToMenuItems() {
	let qryMenuItems = query(collection(db, "products"));
	
	onSnapshot(qryMenuItems, (menuItems) => {
		tvMenuItems.innerHTML = menuItems.size;
	});
}

function listenToBookingsHistory() {
	const qryBookings = query(collection(db, "bookings"));

	onSnapshot(qryBookings, (bookings) => {
		let totalBookings = 0;
		let bookingsThisMonth = 0;
		let bookingsOneMonthAgo = 0;
		let bookingsTwoMonthsAgo = 0;
		let extraBookings = 0;

		bookings.forEach(booking => {
			totalBookings++;

			const timestamp = booking.data().timestamp;
			if (timestamp >= firstDayOfMonth && timestamp <= lastDayOfMonth) {
				bookingsThisMonth++;
			}
			else if (timestamp >= firstDayOfMonth1MonthAgo && timestamp <= lastDayOfMonth1MonthAgo) {
				bookingsOneMonthAgo++;
			}
			else if (timestamp >= firstDayOfMonth2MonthsAgo && timestamp <= lastDayOfMonth2MonthsAgo) {
				bookingsTwoMonthsAgo++;
			}
			else {
				extraBookings++;
			}
		

			if (chartBookingsHistory != undefined) {
				chartBookingsHistory.destroy();
			}
		
			const d = new Date();
			let month = d.getMonth();
			chartBookingsHistory = new Chart("chartBookingsHistory", {
				type: "line",
				data: {
					labels: [
						months[month-2],
						months[month-1],
						months[month]
					],
					datasets: [{
						label: 'Bookings',
						data: [
							bookingsTwoMonthsAgo,
							bookingsOneMonthAgo,
							bookingsThisMonth
						]
					}]
				},
				options: {
					plugins: {
							legend: {
									display: true,
									position: 'bottom',
									align: 'start'
							}
					}
				}
			});
		
			if (totalBookings == 0) {
				tvEmptyBookingsHistory.classList.toggle("d-none", false);
				divBookingsHistory.classList.toggle("d-none", true);
			}
			else {
				tvEmptyBookingsHistory.classList.toggle("d-none", true);
				divBookingsHistory.classList.toggle("d-none", false);
			}
		});
	});
}

function listenToMenuCategories() {
	let qryCategories = query(collection(db, "categories"));

	onSnapshot(qryCategories, (categories) => {
		let totalCategories = 0;
		let categoriesCount = [];

		categories.forEach(category => {
			totalCategories++;
			const categoryName = category.data().categoryName;

			const qryCategoryItems = query(collection(db, "products"), where("categoryId", "==", category.id));
			getDocs(qryCategoryItems).then((menuItems) => {
				categoriesCount[categoryName] = menuItems.size;

				if (chartCategories != undefined) {
					chartCategories.destroy();
				}

				chartCategories = new Chart("chartCategories", {
					type: "pie",
					data: {
						labels: Object.keys(categoriesCount),
						datasets: [{
							data: Object.values(categoriesCount)
						}]
					},
					options: {
						plugins: {
							legend: {
								display: true,
								position: 'bottom',
								align: 'start'
							}
						}
					}
				});
			
				if (totalCategories == 0) {
					tvEmptyCategories.classList.toggle("d-none", false);
					divCategories.classList.toggle("d-none", true);
				}
				else {
					tvEmptyCategories.classList.toggle("d-none", true);
					divCategories.classList.toggle("d-none", false);
				}
			});
		});
	})
}

function listenToRevenueThisMonth() {
	const qry = query(collection(db, "bookings"), where("status", "==", "Completed"), where("timestamp", ">=", firstDayOfMonth), where("timestamp", "<=", lastDayOfMonth));

	onSnapshot(qry, (bookings) => {
		let total = 0;

		bookings.forEach((booking) => {
			total += (booking.data().total * booking.data().headcount);
			tvRevenue.innerHTML = "₱" + total.toFixed(2);
		});
	});
}

function listenToRevenueAllTime() {
	const qryBookings = query(collection(db, "bookings"), where("status", "==", "Completed"));

	onSnapshot(qryBookings, (bookings) => {
		let totalBookings = 0;
		let revenueThisMonth = 0;
		let revenueOneMonthAgo = 0;
		let revenueTwoMonthsAgo = 0;

		bookings.forEach(booking => {
			const timestamp = booking.data().timestamp;
			if (timestamp >= firstDayOfMonth && timestamp <= lastDayOfMonth) {
				revenueThisMonth += (booking.data().total * booking.data().headcount);
				totalBookings++;
			}
			else if (timestamp >= firstDayOfMonth1MonthAgo && timestamp <= lastDayOfMonth1MonthAgo) {
				revenueOneMonthAgo += (booking.data().total * booking.data().headcount);
				totalBookings++;
			}
			else if (timestamp >= firstDayOfMonth2MonthsAgo && timestamp <= lastDayOfMonth2MonthsAgo) {
				revenueTwoMonthsAgo += (booking.data().total * booking.data().headcount);
				totalBookings++;
			}

			if (chartRevenueAllTime != undefined) {
				chartRevenueAllTime.destroy();
			}
		
			const d = new Date();
			let month = d.getMonth();
			chartRevenueAllTime = new Chart("chartRevenueAllTime", {
				type: "line",
				data: {
					labels: [
						months[month-2],
						months[month-1],
						months[month]
					],
					datasets: [{
						label: 'Revenue',
						data: [
							revenueTwoMonthsAgo,
							revenueOneMonthAgo,
							revenueThisMonth
						]
					}]
				},
				options: {
					plugins: {
						legend: {
							display: true,
							position: 'bottom',
							align: 'start'
						}
					}
				}
			});
		
			if (totalBookings == 0) {
				tvEmptyRevenueAllTime.classList.toggle("d-none", false);
				divRevenueAllTime.classList.toggle("d-none", true);
			}
			else {
				tvEmptyRevenueAllTime.classList.toggle("d-none", true);
				divRevenueAllTime.classList.toggle("d-none", false);
			}
		});
	});
}

async function getOrderItemsData(orderId, dishes, tbody) {
	dishes.forEach((dish) => {

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
		getDownloadURL(sRef(storage, 'products/'+thumbnail))
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