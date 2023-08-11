
var cart = JSON.parse(localStorage.getItem('cart'));
if (!cart) {cart = {};}

var products = {};
$.get('./data/products.json', function(data) {
  products = JSON.parse(data)
}, 'text').done(function() {
  $(document).ready(function() {
    renderCart(Object.keys(products));

    $("#formShipping").submit(function(e) {
      e.preventDefault();
      $(this).modal('hide');
      $('#offcanvasCart').offcanvas('hide');
      $('#purchased').modal('show');
    });

  })


})

function renderCart_old() {
  $('#cart-items').empty()
  for (const id in cart) {
    const productId = id.slice(0, id.lastIndexOf('-'))
    const colorId = id.slice(id.lastIndexOf('-') + 1)
    const product = products[productId];
    // console.log(product)
    // console.log(product);
    let HTML = 
     `<div class="d-flex gap-2">
        <img class="align-self-center" src="${product['colors'][colorId].image}" height="100">
        <div class="d-flex flex-grow-1 flex-column justify-content-between">
          <p class="m-0">${product.name}</p>
          <div class="d-flex flex-wrap mb-2 gap-1">`;
    
    // Adding tags
    for (const tag of ['ram', 'storage', 'display']) {
      if (product[tag]) {
        HTML += '<span class="badge rounded-1 text-secondary-emphasis border-secondary border fw-medium">';
        HTML += {
          ram: `<i class="bi bi-memory"></i> ${product.ram} GB`,
          storage: `<i class="bi bi-hdd-fill"></i> ${product.storage} GB`,
          display: `<i class="fi fi-rr-arrow-up-right-and-arrow-down-left-from-center"></i><span class='ps-1'>${product.display}"</span>`
        }[tag]
        HTML += '</span>'
      }
    }

    HTML +=
         `</div>
          <div class="input-group justify-content-end" style="min-width: max-content;">
            ${cart[id] > 1 ?
              `<button type="button" class="btn btn-primary pt-2" onclick="decreaseCartProduct('${id}')">
                <i class="fi fi-rs-minus-small"></i>
              </button>`
              :
             `<button type="button" class="btn btn-primary pt-2" style="pointer-events: all; cursor: not-allowed" disabled>
                <i class="fi fi-rs-minus-small"></i>
              </button>`
            }
            
            <input type="number" class="form-control text-center" value="${cart[id]}" style="max-width: 40px;">
            <button type="button" class="btn btn-primary pt-2" onclick="increaseCartProduct('${id}')">
              <i class="fi fi-rs-plus-small"></i>
            </button>
          </div>
        </div>
        <div class="d-flex flex-column justify-content-between">
          <div class="text-end">
            <small class="text-decoration-line-through text-secondary fw-normal">${formatNum(product['price-sub'])}₫</small>
            <p class="text-danger fw-bold m-0">${formatNum(product.price)}₫</p>
          </div>
          <button type="button" class="btn btn-outline-danger pt-2 w-min" onclick="removeConfirm('${id}')">
            <i class="fi fi-bs-cart-minus"></i>
          </button>
        </div>
      </div>`
      $('#cart-items').append(HTML);
  }
}

function renderCart() {
  function renderCartProducts() {
    $('#cart-items').empty()
    for (const id in cart) {
      const productId = id.slice(0, id.lastIndexOf('-'))
      const colorId = id.slice(id.lastIndexOf('-') + 1)
      const product = products[productId];
      const HTML = `
        <div class="d-flex gap-2">
          <img class="align-self-center" src="${product['colors'][colorId].image}" height="100">
          <div class="d-flex flex-grow-1 flex-column justify-content-between">
            <div class="d-flex gap-2 justify-content-between">
              <div>
                <p class="m-0">${product.name}</p>
                <span class="badge rounded-1 text-secondary-emphasis border-secondary border fw-semibold text-capitalize">
                  ${colorId}
                </span>
              </div>
              <button type="button" class="btn btn-outline-danger pt-2 h-min" onclick="removeConfirm('${id}')">
                <i class="fi fi-bs-cart-minus"></i>
              </button>
            </div>
            <div class="d-flex align-items-end">
              <div class="input-group h-min mb-1" style="min-width: max-content;">
                ${cart[id] > 1 ?
                `<button type="button" class="btn btn-primary pt-2" onclick="decreaseCartProduct('${id}')">
                    <i class="fi fi-rs-minus-small"></i>
                  </button>`
                  :
                `<button type="button" class="btn btn-primary pt-2" style="pointer-events: all; cursor: not-allowed" disabled>
                    <i class="fi fi-rs-minus-small"></i>
                  </button>`
                }
                <input type="number" class="form-control text-center" value="${cart[id]}" style="max-width: 40px;">
                <button type="button" class="btn btn-primary pt-2" onclick="increaseCartProduct('${id}')">
                  <i class="fi fi-rs-plus-small"></i>
                </button>
              </div>
              <div class="text-end">
                <small class="text-decoration-line-through text-secondary fw-normal">${formatNum(product['price-sub'])}₫</small>
                <p class="text-danger fw-bold m-0">${formatNum(product.price)}₫</p>
              </div>
            </div>
          </div>
        </div>`
      $('#cart-items').append(HTML);
    }
  }

  function renderCheckout() {
    let sum = discount = total = 0;
    for (id in cart) {
      const priceSub = parseInt(products[id.slice(0, id.lastIndexOf('-'))]['price-sub'])
      const price = parseInt(products[id.slice(0, id.lastIndexOf('-'))]['price'])
      const ammount = parseInt(cart[id])
      sum += priceSub * ammount;
      discount += (priceSub - price) * ammount;
      total += price * ammount;
    }
    $('#cart-subtotal').text(`${formatNum(sum)}₫`);
    $('#cart-discount').text(`- ${formatNum(discount)}₫`);
    $('#cart-total').text(`${formatNum(total)}₫`);
  }
  
  renderCartProducts();
  $('#cart-item-count').text(Object.keys(cart).length);
  renderCheckout()
  
  // $('#cart-subtotal').text(Object.keys(cart).map((id) => {
  //   return products[id.slice(0, id.lastIndexOf('-'))]['price']
  // }))
}

function updateCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}



// Thêm sản phẩm giỏ hàng
function addProductToCart(productId) {
  const id = $(`[id^='${productId}-']:checked`).attr('id');
  // console.log(id)
  Toast('addedToCart');
  if (cart.hasOwnProperty(id)) {
    increaseCartProduct(id);
    return;
  } else {
    cart[id] = 1;
    updateCart();
  }
}

function increaseCartProduct(id) {
  if (cart.hasOwnProperty(id)) {
    cart[id] += 1;
  } else {
    cart[id] = 1;
  }
  updateCart();
}

// Giảm số lượng sản phẩm trong giỏ hàng
function decreaseCartProduct(id) {
  cart[id] -= 1;
  updateCart();
}

// Xóa sản phẩm khỏi giỏ hàng
function removeCartProduct(id) {
  delete cart[id];
  updateCart();
}


function Toast(target) {
  const toastBootstrap = bootstrap.Toast.getOrCreateInstance($('#' + target));
  toastBootstrap.show();
}

function removeConfirm(id) {
  console.log(id);
  const modal = bootstrap.Modal.getOrCreateInstance($('#removeConfirmation'));
  
  $('#removeConfirmation .modal-footer')
  .empty()
  .append(`
    <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Cancel</button>
    <button type="button" class="btn btn-outline-danger" data-bs-dismiss="modal" onclick="removeCartProduct('${id}'); Toast('removedFromCart')">Remove</button>
  `)
  modal.show();
}

function formatNum(num) {
  return parseInt(
    num
  )
  .toLocaleString('en-US')
  .replaceAll(',', '.')
}

function completedShipping() {
  
}