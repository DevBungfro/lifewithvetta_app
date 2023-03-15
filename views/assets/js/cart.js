const products = document.getElementById("products")

const storage = JSON.parse(sessionStorage.getItem("cart"))
console.log(storage)

function buildParams(data) {
  const params = new URLSearchParams()

  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(value => params.append(key, value.toString()))
    } else {
      params.append(key, value.toString())
    }
  });

  return params.toString()
}

function remove(itemname, itemsize) {
  console.log(itemname, itemsize)
  storage.some((item, index) => {
    if (item.name == itemname && item.size == itemsize) {
      storage.splice(index, 1)

      sessionStorage.setItem("cart", JSON.stringify(storage))
      window.location.href = "/cart"
      return true
    }
  })
}

function purchaseClicked() {
  var items = []
  var cartItemContainer = document.getElementsByClassName('products')[0]
  var cartRows = cartItemContainer.getElementsByClassName('product')
  for (var i = 0; i < cartRows.length; i++) {
    var cartRow = cartRows[i]
    var priceElement = cartRow.getElementsByClassName('product-price')[0]
    var quantityElement = cartRow.getElementsByClassName('product-quantity')[0]
    var name = cartRow.getElementsByClassName('product-name')[0]
    var price = parseFloat(priceElement.textContent.replace('$', ''))
    var quantity = parseInt(quantityElement.textContent.substring(5, 100))
    items.push({
      name: name.textContent,
      price: price,
      quantity: quantity
    })
    console.log(items)
  }
  let url = "/purchase?"
 items.forEach(item => {
   url += "&" + buildParams(item)
 })
  console.log(url)
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
  }).then(res => {
    if (res.ok) return res.json()
    return res.json().then(json => Promise.reject(json))
  })
    .then(({ url }) => {
      sessionStorage.setItem("cart", [])
      window.location = url
    })
    .catch(e => {
      console.error(e.error)
    })
}

storage.forEach(product => {
  let found = null

  let productNames = [...document.querySelectorAll('.product-name')]
  let productSizes = [...document.querySelectorAll('.product-offer')]

  productNames.forEach((productName) => {
    if (productName.textContent == `${product.name}`) {
      productSizes.forEach((productSize) => {
        if (productSize.textContent == `Size: ${product.size}`) {
          found = productName
        }
      })
      return;
    }
  })

  if (found === null) {

    products.innerHTML += `
<div class="product">

				<img src="${product.image}">

				<div class="product-info">

					<h3 class="product-name">${product.name}</h3>

					<h4 class="product-price">$${product.price}</h4>

					<h4 class="product-offer">Size: ${product.size}</h4>

					<p class="product-quantity">Qnt: 1

					<p onclick="" class="product-remove">

						<i class="fa fa-trash" aria-hidden="true"></i>

						<span  class="remove">Remove</span>

					</p>

				</div>
		

		</div>
`
    updateCartTotal()
  } else {
    const product_info = found.parentElement;

    const product_qty = product_info.getElementsByClassName("product-quantity")[0]
    const textQty = product_qty.textContent
    let num = parseInt(textQty.substring(5, 100))

    num += 1

    product_qty.textContent = "Qnt: " + num.toString()

    // -- Total Price -- //

    updateCartTotal()
  }
})


function updateCartTotal() {
  var cartItemContainer = document.getElementsByClassName('products')[0]
  var cartRows = cartItemContainer.getElementsByClassName('product')
  var total = 0
  for (var i = 0; i < cartRows.length; i++) {
    var cartRow = cartRows[i]
    var priceElement = cartRow.getElementsByClassName('product-price')[0]
    var quantityElement = cartRow.getElementsByClassName('product-quantity')[0]
    var price = parseFloat(priceElement.textContent.replace('$', ''))
    var quantity = parseInt(quantityElement.textContent.substring(5, 100))
    total = total + (price * quantity)
    console.log(priceElement.textContent, quantity)
  }
  console.log(total)
  total = Math.round(total * 100) / 100
  document.getElementById('totalprice').textContent = '$' + total
}

document.body.onload = function addEvents() {
  let product_removes = [...document.querySelectorAll(".product-remove")]

  product_removes.forEach(product => {
    product.onclick = function clicked() {
      const product_info = product.parentElement;

      var nameElement = product_info.getElementsByClassName('product-name')[0]
      var sizeElement = product_info.getElementsByClassName('product-offer')[0]

      remove(nameElement.textContent, sizeElement.textContent.substring(6, 100))
    }
  })

}