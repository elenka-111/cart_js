const rateUrl = "https://www.cbr-xml-daily.ru/daily_json.js";
const selectedCart = [
	{
		id:0,
		name:"Товар 1",
		price: 20
	},
	{
		id:1,
		name:"Товар 2",
		price: 45
	},
	{
		id:2,
		name:"Товар 3",
		price: 67 },
	{
		id:3,
		name:"Товар 4",
		price: 1305 
	}
];

const currency = {
	available: {
		RUB: "rubles",
		EUR: "euros",
		USD: "US dollars",
		GBP: "pounds",
		JPY: "yens"
	},
	base: "USD",
	active: "USD",
};

let rateValute = {};
let arrayTotal = {};


drawCart(selectedCart);
drawValute(currency);
getTotalCartPrice(selectedCart, currency).then(
	result => {
		console.log(result);
		arrayTotal = result;
		drawTotalPrice(arrayTotal, currency);
	} 
).catch(
	error => console.log("Получена ошибка ", error)
);



async function changeValute(e){
	currency.active = e.options[e.selectedIndex].value;
	//let res = await getTotalCartPrice(selectedCart, currency);
	if (Object.keys(arrayTotal).length) {
			drawTotalPrice(arrayTotal, currency);
	} else {
		alert("Возникла ошибка..");
	}


}

async function deleteOne(e){
	let index = selectedCart.findIndex((item, index) => {
		return (item.id == e.id);
	});
	selectedCart.splice(index, 1);
	drawCart(selectedCart);
	arrayTotal = await getTotalCartPrice(selectedCart, currency);
	console.log(arrayTotal);
	if (Object.keys(arrayTotal).length) {
			drawTotalPrice(arrayTotal, currency);
	} else {
		alert("Возникла ошибка..");
	}

}

function drawValute(currency){
	Object.keys(currency.available).forEach(item => {
		let option = document.createElement('option');
		option.value = item;
		option.innerHTML = currency.available[item];
		if (item === currency.active) {
			option.selected = true;
		}
		document.getElementById("valute").append(option);
	});
}

function drawTotalPrice(arrTotal, currency){
	let total = arrTotal[currency.active];
	document.getElementById("totalSum").innerHTML = total.toFixed(2) ;
}

function drawCart(iselectedCart) {
	document.getElementById("card").innerHTML = '';
	if (selectedCart.length){
		selectedCart.forEach(item => {
			let cartItem = document.createElement("div");
			cartItem.id = item.id;
			cartItem.className = "cart__item item";
			let nameItem = document.createElement("div");
			nameItem.innerHTML = item.name;
			let priceItem = document.createElement("div");
			priceItem.innerHTML = `<strong>${item.price}</strong> ${currency.available[currency.base]}`;
			let deleteBtn = document.createElement("button");
			deleteBtn.className = "item_delete-btn";
			deleteBtn.innerHTML = "Удалить";
			priceItem.append(deleteBtn);
			deleteBtn.onclick = ()=>deleteOne(cartItem);
			cartItem.append(nameItem, priceItem);
			document.getElementById("card").append(cartItem);
		});
		
	} else {
		document.getElementById("card").innerHTML = "<p>В корзине нет элементов</p>";
	}
}

async function getTotalCartPrice(selectedCart, currency){
	let sum = getTotalSum(selectedCart);
	if (Object.keys(rateValute).length == 0){
		let rate = await getRate();
		if (rate){
			//Сохраняем курс в глобальную переменную
			rateValute = rate.Valute;
		}
	}
	//пересчет относительно базовой валюты веб сервиса - RUB
	let sumRub = currency.base === "RUB" ? sum : sum * rateValute[currency.base].Value;
	let totalCartPrice = 
	Object.keys(currency.available).reduce((previousValue, item) => {
		if (item === "RUB") {
			previousValue[item] = sumRub;
		} else {
			previousValue[item] = sumRub/rateValute[item].Value
		}
		return previousValue;
	}, {});
	return totalCartPrice;
	

}

async function getRate(){
	let response = await fetch(rateUrl);
	if (response.ok) {
	  let rate = response.json(); 
	  return rate;
	} else {
	  console.log("Ошибка HTTP: " + response.status);
	}
	
}

function getTotalSum(cart){
	return cart.reduce((previousValue, item) => previousValue + item.price, 0);
}


