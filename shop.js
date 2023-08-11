
// var products = {};
// $.get("./data/products.csv", function(data) {
// 	const lines = data.trim().split('\r\n');
// 	const header = lines[0].split(',').slice(1);

// 	for (let line of lines.slice(1)) {
// 	var product = {};
// 	const values = line.split(',');
// 	for (let i in header) {
// 		product[header[i]] = values[parseInt(i) + 1];
// 	}
// 	products[values[0]] = product;
// 	}
// }, 'text').done(function() {
// 	$(document).ready(function() {
    
// 		renderProducts(Object.keys(products));
// 	})
// });

var products = {};
$.get('./data/products.json', function(data) {
  products = JSON.parse(data)
}, 'text').done(function() {
  $(document).ready(function() {
    processParameters();
    refreshProducts(Object.keys(products));
  })
})

function processParameters() {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);
  if (params.has('category')) {
    console.log(params.get('category'));
    $("[id^='category-']").each(function() {
      const id = $(this).attr('id')
      if (params.get('category') != id.slice(id.indexOf('-') + 1)) {
        $(this).attr('checked', false)
      }
    })
    $('#filters-column')[0].scrollIntoView(true);
  }
}

function refreshProducts() {
  function filterByTags(productList) {
    let allowed_category = []
    $("[id^='category-']").each(function() {
      if ($(this).prop('checked')) {
        const id = $(this).attr('id');
        allowed_category.push(id.slice(id.indexOf('-') + 1))
        // console.log(id.slice(id.indexOf('-') + 1))
      }
    })

    let allowed_ram = []
    $("[id^='filter-ram-']").each(function() {
      if ($(this).prop('checked')) {
        const id = $(this).attr('id');
        allowed_ram.push(id.slice(id.lastIndexOf('-') + 1))
      }
    })
    
    let allowed_storage = []
    $("[id^='filter-storage-']").each(function() {
      if ($(this).prop('checked')) {
        const id = $(this).attr('id');
        allowed_storage.push(id.slice(id.lastIndexOf('-') + 1))
      }
    })
  
    let allowed_brands = []
    $("[id^='filter-brands-']").each(function() {
      if ($(this).prop('checked')) {
        const id = $(this).attr('id');
        allowed_brands.push(id.slice(id.lastIndexOf('-') + 1))
      }
    })
    
    let filtered = []
    for (id in productList) {
      if (
        (!productList[id].hasOwnProperty('ram') || allowed_ram.includes(productList[id].ram)) && 
        (!productList[id].hasOwnProperty('storage') || allowed_storage.includes(productList[id].storage)) &&
        allowed_brands.includes(productList[id].brand) &&
        allowed_category.includes(productList[id].category)
      ) {
        filtered.push(id);
      }
    }
    
    return filtered;
  }
  
  function filterByRanges(product_list) {
    let allowed = [];
    
    for (id of product_list) {
      if (parseInt($('#filter-price-min').val()) <= parseInt(products[id]['price']) &&
          parseInt($('#filter-price-max').val()) >= parseInt(products[id]['price'])) {
        allowed.push(id);
      }
    }
    return allowed;
  }

  function filterBySearch(product_list) {
    const search = $("#search").val().toLowerCase();
    return product_list.filter((productName) => {return productName.replaceAll('-', ' ').includes(search)})
  }

  function sortProducts(product_list) {
    function sortedByProperty(property, array, reverse = false) {
      function sortAlgorithm(a, b) {
        valueA = parseInt(products[a][property]);
        valueB = parseInt(products[b][property])
        if (valueA > valueB) { return -1; }
        else if (valueA < valueB) { return 1; }
        else { return 0; }
      }

      array.sort(sortAlgorithm);
      if (reverse) {array.reverse();}
      return array;
    }

    $("[id^='sort-']").each(function() {
      if ($(this).prop('checked')) {
        sortBy = $(this).attr('id')
        if (sortBy == 'sort-price-low') {
          product_list = sortedByProperty('price', product_list, true)
        } else if (sortBy == 'sort-price-high') {
          product_list = sortedByProperty('price', product_list)
        } else if (sortBy == 'sort-discount') {
          product_list = sortedByProperty('discount', product_list)
        }
      }
    })
    
    return product_list
  }

  const filteredByTag = filterByTags(products);
  const filteredByRanges = filterByRanges(filteredByTag);
  const searched = filterBySearch(filteredByRanges);
  const sorted = sortProducts(searched);
  renderProducts(sorted);

  $(".color-selection > input").on('change', function() {
    const imgElement = $(this).parents('.card').children('img')
    const eleId = $(this).attr('id')
    const productId = eleId.slice(0, eleId.lastIndexOf('-'))
    const colorId = eleId.slice(eleId.lastIndexOf('-') + 1)
    
    imgElement.attr('src', products[productId]['colors'][colorId].image)
  })

  

}

function renderProducts(product_list) {
  function coloredProduct(id) {
    const product = products[id];
    let HTML = `
      <div class="card pt-3 flex-shrink-1">
        <img src="${product.colors[Object.keys(product.colors)[0]].image}" class="card-img-top p-3">
        <div class="card-body d-flex flex-column">
          <p class="card-title">${product.name}</p>
          <div class="d-flex gap-1 mb-2">`
    
    // Adding color swatches
    first = true;
    for (const colorName in product.colors) {
      // console.log(colorName)
      HTML += `
        <div class="color-selection">
          <input type="radio" class="btn-check" name='${id}-color' id="${id}-${colorName}" ${first ? 'checked' : ''} autocomplete="off">
          <label class="btn rounded-pill d-flex" for="${id}-${colorName}">
            <div class="flex-grow-1 rounded-pill bgx-${colorName}"></div>
          </label>
        </div>`
      if (first) {first = false}
    }


    HTML += `
     </div>
      <div class="flex-wrap mb-3 d-inline-flex gap-1">\n`;

    // Adding tags
    for (const tag of ['ram', 'storage', 'display']) {
      if (product[tag]) {
        HTML += '<span class="badge rounded-1 text-secondary-emphasis text-bg-secondary bg-opacity-25 fw-medium">\n';
        HTML += {
          ram: `<i class="bi bi-memory"></i> ${product.ram} GB`,
          storage: `<i class="bi bi-hdd-fill"></i> ${product.storage} GB`,
          display: `<i class="fi fi-rr-arrow-up-right-and-arrow-down-left-from-center"></i><span class='ps-1'>${product.display}"</span>`
        }[tag]
        HTML += '\n</span>'
      }
    }

    HTML += `
      </div>
        <div class="d-flex flex-column flex-grow-1 justify-content-end">
          <small class="text-decoration-line-through text-secondary fw-normal">${formatNum(product['price-sub'])}₫</small>
          <div class="d-flex gap-2 mb-2">
            <p class="text-danger fw-bold m-0">${formatNum(product.price)}₫</p>
            <span class="badge bg-danger-subtle text-danger h-min">-${product.discount}%</span>
          </div> 
          <div class="d-flex gap-1">
            <button type="button" class="btn btn-outline-primary flex-grow-1">Buy now</button>
            <button type="button" class="btn btn-primary float-end" onclick="addProductToCart('${id}')">
              <i class="bi bi-cart-plus-fill"></i>
            </button>
          </div>
        </div>
      </div>
    </div>`
    $('#product-container').append(HTML);
  }

  $('#product-container').empty()
  for (const id of product_list) {
    if (products[id].hasOwnProperty('image')) {

    } else {
      coloredProduct(id);
    }
    
  }
}

function renderProducts_old(product_list) {
  $('#product-container').empty()
  for (const id of product_list) {
    const product = products[id];
    
    let HTML =
    `<div class="card pt-3 flex-shrink-1" style="max-width: 14rem;">
      <img src="data/products-images/${id}.jpg" class="card-img-top p-3">
      <div class="card-body d-flex flex-column">
      <p class="card-title">${product.name}</p>
      <div class="flex-wrap mb-2 d-inline-flex gap-1">`;

    // Adding tags
    for (const tag of ['brand', 'ram', 'storage', 'display']) {
      if (product[tag]) {
        HTML += '<span class="badge rounded-1 text-secondary-emphasis text-bg-secondary bg-opacity-25 fw-medium">';
        HTML += {
          brand: {
            Apple: `<i class="fi fi-brands-apple"></i> ${product.brand}`,
            Samsung: '<i class="fi fi-brands-samsung"></i>'
          }[product.brand],
          ram: `<i class="bi bi-memory"></i> ${product.ram} GB`,
          storage: `<i class="bi bi-hdd-fill"></i> ${product.storage} GB`,
          display: `<i class="fi fi-rr-arrow-up-right-and-arrow-down-left-from-center"></i><span class='ps-1'>${product.display}"</span>`
        }[tag]
        HTML += '</span>'
      }
    }

    HTML +=  
      `</div>
        <div class="d-flex flex-column flex-grow-1 justify-content-end">
          <div class="mt-2 mb-1">
            ${parseInt(product['discount-price']) ?
             `<p class="text-danger fw-bold d-inline">$${product['discount-price']}</p>
              <small class="text-decoration-line-through text-secondary fw-normal">$${product.price}</small>`
            :
             `<p class='m-0'>$${product.price}</p>`
            }
          </div>
          <div class="d-flex gap-1">
            <button type="button" class="btn btn-outline-primary flex-grow-1">Buy now</button>
            <button type="button" class="btn btn-primary float-end" onclick="addProductToCart('${id}'); Toast('addedToCart')">
              <i class="bi bi-cart-plus-fill"></i>
            </button>
          </div>
        </div>
      </div>
    </div>`
    $('#product-container').append(HTML);
  }
}




// Search bar and clear search
$('#search + button').on('click', function() {
  $('#search').val('');
  refreshProducts();
})

// $("[id^='filter-price-']").on('input', function(){
//   $(this).val(formatNum($(this).val() == '' ? 0 : $(this).val()));
// });

$("#search, [id^='filter-price-']").on('input', function(){
  refreshProducts();
});

// Update products list on filter toggle
$("[id^='sort-'], [id^='filter-'], [id^='category-']").on('change', function() {
  refreshProducts();
})
