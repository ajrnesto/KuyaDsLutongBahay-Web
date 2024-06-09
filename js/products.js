import { db, auth, storage } from '../js/firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js';
import { doc, collection, collectionGroup, addDoc, setDoc, getDoc, getDocs, deleteDoc, updateDoc, increment, query, where, orderBy, startAt, endAt, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-storage.js";
import { blockNonAdmins, showModal, hideModal, resetValidation, invalidate } from '../js/utils.js';

// table
const divMenuItems = document.querySelector('#divMenuItems');
// modal
const tvManageMenuItemTitle = document.querySelector('#tvManageMenuItemTitle');
const btnSaveMenuItem = document.querySelector('#btnSaveMenuItem');
const btnCancelMenuItemManagement = document.querySelector('#btnCancelMenuItemManagement');
// modal form
const menuCategory = document.querySelector('#menuCategory');
const etMenuItemName = document.querySelector('#etMenuItemName');
const etMenuItemDetails = document.querySelector('#etMenuItemDetails');
const etPrice = document.querySelector('#etPrice');
const imgMenuItem = document.querySelector("#imgMenuItem")
const btnUploadImage = document.querySelector("#btnUploadImage")
let selectedMenuItemImage = null;
let productThumbnailWasChanged = false;

const etSearchMenuItem = document.querySelector('#etSearchMenuItem');
const menuCategoriesFilter = document.querySelector('#menuCategoriesFilter');
const btnSearchMenuItem = document.querySelector('#btnSearchMenuItem');
let unsubMenuItemsListener = null;

// delete modal
const tvConfirmDeleteMessage = document.querySelector('#tvConfirmDeleteMessage');
const btnDelete = document.querySelector('#btnDelete');

const productNameValidator = document.querySelectorAll('.product-name-validator');
const productDetailsValidator = document.querySelectorAll('.product-details-validator');
const priceValidator = document.querySelectorAll('.price-validator');

onAuthStateChanged(auth, user => {
	blockNonAdmins(user);
});

window.addEventListener("load", function() {
	autosizeTextareas();
	getMenuItems();
});

window.manageMenuItem = manageMenuItem;
window.confirmDeleteMenuItem = confirmDeleteMenuItem;

btnUploadImage.addEventListener("change", () => {
	selectedMenuItemImage = btnUploadImage.files[0];
	imgMenuItem.src = URL.createObjectURL(selectedMenuItemImage);
	console.log("CHANGED PRODUCT IMAGE: "+imgMenuItem.src);
	productThumbnailWasChanged = true;
});

btnSearchMenuItem.addEventListener("click", function() {
	console.log("Searching for products...");

	if (unsubMenuItemsListener != null) {
		unsubMenuItemsListener();
	}

	getMenuItems();
});

menuCategoriesFilter.addEventListener("change", () => {
	getMenuItems();
});

function getMenuItems() {
	const searchKey = etSearchMenuItem.value.toUpperCase();
	const selectedCategory = menuCategoriesFilter.value;

	let qryMenuItems = null;

	if (selectedCategory == -1) {
		if (searchKey == "") {
			qryMenuItems = query(collection(db, "products"));
		}
		else {
			qryMenuItems = query(collection(db, "products"), orderBy("productNameAllCaps"), startAt(searchKey), endAt(searchKey+'\uf8ff'));
		}
	}
	else {
		if (searchKey == "") {
			qryMenuItems = query(collection(db, "products"), where("categoryId", "==", selectedCategory));
		}
		else {
			qryMenuItems = query(collection(db, "products"), orderBy("productNameAllCaps"), startAt(searchKey), endAt(searchKey+'\uf8ff'), where("categoryId", "==", selectedCategory));
		}
	}
	
	unsubMenuItemsListener = onSnapshot(qryMenuItems, (snapMenuItems) => {
		// clear table
		divMenuItems.innerHTML = '';

		snapMenuItems.forEach(product => {
			getDoc(doc(db, "categories", product.data().categoryId)).then((category) => {
				renderMenuItems(
					product.id,
					product.data().productName,
					product.data().productDetails,
					product.data().price,
					product.data().categoryId,
					category.data().categoryName,
					product.data().thumbnail
				);
			});
    	});
	});
}

async function renderMenuItems(id, productName, productDetails, price, categoryId, categoryName, thumbnail) {
  const cardContainer = document.createElement('div');
  const card = document.createElement('div');
  const imgThumbnail = document.createElement('img');
  const tvItemName = document.createElement('h5');
  const tvCategory = document.createElement('h6');
  const tvPrice = document.createElement('h6');
  const tvDescription = document.createElement('p');
	const buttonEdit = document.createElement('button');
		const buttonEditIcon = document.createElement('i');
	const buttonDelete = document.createElement('button');
		const buttonDeleteIcon = document.createElement('i');

	cardContainer.className = "col-3 p-3";
	card.className = "col-12 p-3 rounded text-center shadow";
	
	if (thumbnail == null){
		imgThumbnail.src = "https://via.placeholder.com/150?text=No+Image";
	}
	else {
		getDownloadURL(ref(storage, 'products/'+thumbnail))
			.then((url) => {
				imgThumbnail.src = url;
			});
	}
	imgThumbnail.className = "col-12 mb-2 rounded";
	imgThumbnail.style.objectFit = "cover";
	imgThumbnail.style.aspectRatio = "1/1";

	tvItemName.innerHTML = productName;
	tvCategory.innerHTML = categoryName;
	tvCategory.style.fontSize = "0.85rem";
	tvCategory.className = "text-dark";
	tvPrice.innerHTML = "₱" + Number(price).toFixed(2) + "/Head";
	tvPrice.className = "text-dark";
	tvDescription.innerHTML = productDetails;
	tvDescription.style.fontSize = "0.85rem";
	tvDescription.style.display = "-webkit-box";
	tvDescription.style.overflow = "hidden";
	tvDescription.style.textOverflow = "ellipsis";
	tvDescription.style.webkitLineClamp = "4";
	tvDescription.style.webkitBoxOrient = "vertical";
	// getDoc(doc(db, "categories", categoryId)).then((category) => {
	// 	cellCategory.innerHTML = category.data().categoryName;
	// });

    buttonEdit.className = "btn btn-no-border btn-primary col me-2";
    buttonEdit.onclick = function() { manageMenuItem(id, productName, productDetails, categoryId, price, thumbnail) };
	buttonEdit.type = 'button';
		buttonEditIcon.className = "bi bi-pencil-fill text-light";
		buttonEditIcon.style.fontSize = "0.8rem";

	buttonDelete.className = "btn btn-no-border btn-danger col";
	buttonDelete.onclick = function() { confirmDeleteMenuItem(id, productName, thumbnail, categoryId) };
	buttonDelete.type = 'button';
		buttonDeleteIcon.className = "bi bi-trash-fill text-light";
		buttonDeleteIcon.style.fontSize = "0.8rem";

    cardContainer.appendChild(card);
		card.appendChild(imgThumbnail);
    card.appendChild(tvItemName);
    card.appendChild(tvCategory);
    card.appendChild(tvPrice);
    card.appendChild(tvDescription);
		card.appendChild(buttonEdit);
			buttonEdit.appendChild(buttonEditIcon);
			card.appendChild(buttonDelete);
			buttonDelete.appendChild(buttonDeleteIcon);

		divMenuItems.append(cardContainer);
}

function manageMenuItem(id, productName, productDetails, categoryId, price, oldThumbnail) {
	selectedMenuItemImage = null;
	resetCategorySelection();

	const NEW_PRODUCT = (id == null);
	if (!NEW_PRODUCT) {
		showModal('#modalManageMenuItem');
		tvManageMenuItemTitle.textContent = "Edit Item";
		btnSaveMenuItem.textContent = "Save Item";

		etMenuItemName.value = productName;
		etMenuItemDetails.value = productDetails;
		etPrice.value = Number(price).toFixed(2);
		menuCategory.value = categoryId;

		console.log("MENU CATEGORY ID IS: "+categoryId);

		if (oldThumbnail == null) {
			imgMenuItem.src = "https://via.placeholder.com/150?text=No+Image";
		}
		else {
			getDownloadURL(ref(storage, 'products/'+oldThumbnail)).then((url) => {
				imgMenuItem.src = url;
			});
		}
	}
	else if (NEW_PRODUCT) {
		imgMenuItem.src = "https://via.placeholder.com/150?text=No+Image";
		tvManageMenuItemTitle.textContent = "Add Menu Item";
		btnSaveMenuItem.textContent = "Add Menu Item";

		menuCategory.value = "Uncategorized";
		etMenuItemName.value = "";
		etMenuItemDetails.value = "";
	}

	btnSaveMenuItem.onclick = function() {
		saveMenuItem(id, oldThumbnail);
	}
}

function saveMenuItem(productId, oldThumbnail) {
	const category = menuCategory.value;
	const productName = etMenuItemName.value;
	const productDetails = etMenuItemDetails.value;
	const price = etPrice.value;

	const PRODUCT_NAME_IS_INVALID = (productName == null || productName == "");
	if (PRODUCT_NAME_IS_INVALID) {
		invalidate(productNameValidator);
		return;
	}
	resetValidation(productNameValidator);

	const PRODUCT_DETAILS_IS_INVALID = (productDetails == null || productDetails == "");
	if (PRODUCT_DETAILS_IS_INVALID) {
		invalidate(productDetailsValidator);
		return;
	}
	resetValidation(productDetailsValidator);

	const PRICE_IS_INVALID = (price == null || price == "");
	if (PRICE_IS_INVALID) {
		invalidate(priceValidator);
		return;
	}
	resetValidation(priceValidator);

	let productImageFileName = null;
	if (selectedMenuItemImage != null) {
		productImageFileName = Date.now();

		uploadBytes(ref(storage, "products/"+productImageFileName), selectedMenuItemImage).then((snapshot) => {
			uploadMenuItemData(productId, productName, productDetails, price, category, productImageFileName, oldThumbnail);
		});
	}
	else {
		uploadMenuItemData(productId, productName, productDetails, price, category, productImageFileName, oldThumbnail);
	}
}

function uploadMenuItemData(productId, productName, productDetails, price, category, productImageFileName, oldThumbnail) {
	const NEW_PRODUCT = (productId == null);
	
	let productRef = null;
	let status = null;
	
	if (NEW_PRODUCT) {
		productRef = doc(db, "products", String(Date.now()));
	}
	else if (!NEW_PRODUCT) {
		productRef = doc(db, "products", productId);
	}

	if (productThumbnailWasChanged) {
		deleteObject(ref(storage, 'products/'+oldThumbnail)).then(() => {
		}).catch((error) => {
			console.log("FAILED TO CHANGE THUMBNAIL: "+error);
		});			  

		// reset variable
		productThumbnailWasChanged = false;
	}
	else if (oldThumbnail != null) {
		productImageFileName = oldThumbnail;
	}

	console.log("GENERATED ID: "+productRef.id);

	setDoc((productRef), {
		id: productRef.id,
		productName: productName,
		productDetails: productDetails,
		price: parseFloat(price),
		productNameAllCaps: productName.toUpperCase(),
		categoryId: category,
		thumbnail: productImageFileName
	});

	if (NEW_PRODUCT) {
		// increment category
		const categoryRef = doc(db, "categories", category);
		updateDoc((categoryRef), {
			products: increment(1)
		})
	}

	etMenuItemName.value = "";
	etMenuItemDetails.value = "";
	etPrice.value = "";
	console.log("SAVED PRODUCT ID: "+productId);
	hideModal('#modalManageMenuItem');
}

function confirmDeleteMenuItem(productId, productName, thumbnail, categoryId) {
	tvConfirmDeleteMessage.textContent = "Delete the item \"" + productName + "\"?";
	btnDelete.textContent = "Delete MenuItem";
	showModal('#modalConfirmDelete');

	console.log("DELETING PRODUCT: "+productId);

	btnDelete.onclick = function() {
		deleteMenuItem(productId, categoryId);
	};
}

function deleteMenuItem(productId, categoryId) {
	hideModal("#modalConfirmDelete");
	deleteDoc(doc(db, "products", productId)).then(() => {
		updateDoc(doc(db, "categories", categoryId), {
			products: increment(-1)
		});
	}).catch((error) => {
		console.log("COULD NOT DELETE DATA: "+ error);
	});

	deleteCartItems(productId);
}

function deleteCartItems(productId) {
	const qryCartItems = query(collectionGroup(db, "items"), where("productId", "==", productId));

	getDocs(qryCartItems).then((docRefs) => {

		docRefs.forEach((docRef) => {
			deleteDoc(docRef.ref);
		});
	});
}

function resetCategorySelection() {
	if (menuCategory.value == -1) {
		menuCategory.value = "Uncategorized";
	}
}

function autosizeTextareas() {
	const txHeight = 56;
	const tx = document.getElementsByTagName("textarea");

	for (let i = 0; i < tx.length; i++) {
		if (tx[i].value == '') {
			tx[i].setAttribute("style", "height:" + txHeight + "px;overflow-y:hidden;");
		}
		else {
			tx[i].setAttribute("style", "height:" + (tx[i].scrollHeight) + "px;overflow-y:hidden;");
		}
		tx[i].addEventListener("input", OnInput, false);
	}

	function OnInput(e) {
		this.style.height = 0;
		this.style.height = (this.scrollHeight) + "px";
	}
}