class MiniCart extends HTMLElement {
  constructor() {
    super();
    this.cart = {};
    this.cartElement = document.getElementById('mini-cart');
    this.addEventListener('change', this.onChange.bind(this));
    this.fetchCart();
  }

  connectedCallback() {
    this.cartUpdateUnsubscribe = subscribe(EVENTS.cartUpdate, (event) => {
      if (event.source === 'mini-cart') {
        return;
      }
      if (this.tagName === 'DROPDOWN-CART') {
        const showModal = this.dataset.showModal;
        if (showModal) {
          const modal = document.getElementById('modal-added-to-cart');
          modal.openModal();
        }
      }
      
      this.fetchCart();
      if (this.tagName === 'SIDE-CART') {
        this.openCart();
      }
    });
  }

  disconnectedCallback() {
    if (this.cartUpdateUnsubscribe) {
      this.cartUpdateUnsubscribe();
    }
  }

  renderCart() {
    let template = null;
    const cartQtd = document.querySelector('.cart-quantity');
    
    if (!this.cart?.items?.length) {
      template = document.getElementById("empty-cart").innerHTML;
      this.renderEmptyCart();
      cartQtd.innerHTML = 0;
    } else {
      cartQtd.innerHTML = this.cart.items.reduce((acc, item) => acc + item.quantity, 0);
      
      template = this.getCartTemplate(this.cart);
      this.cartElement.innerHTML = template;

      this.combos = groupBy(this.cart.items.filter(item => item.kit_id), 'kit_id');
      if (Object.keys(this.combos).length) {
        for (const kit_id in this.combos) {
          this.getCombo(kit_id, this.combos[kit_id]);
        }
      }
      
      this.getCartItemsTemplate(this.cart.items);

      if (this.dataset.showCartSavings === 'true') {
        const cartSavingsTemplate = this.getCartSavingsTemplate();
        this.renderCartSavings(cartSavingsTemplate);
      }
    }
  }

  fetchCart() {
    fetch(window.routes.cart_items_url)
    .then(response => {
      if (!response.ok) {
          throw new Error(`Erro na solicitação: ${response.status}`);
      }
      
      return response.json();
    })
    .then(data => {
      this.cart = data.cart;
      
      this.renderCart();
    });
  }

  getCartItemsTemplate(items) {
    const template = `
      <div class="product-cart-box__container item-{{ product.id }}" data-item-id="{{ product.id }}">
        <div class="product-cart-box__metadata">
            <div class="product-cart-box__holder-image">
                <div class="image-ratio">
                    <img src="{{ product.small }}" alt="">
                </div>
            </div>
    
            <div class="product-cart-box__text--holder-info">
                <div class="product-cart-box__text--product-name">
                    {{ product.name }}
                </div>
                
                <ul class="product-cart-box__text--product-extra">
                </ul>
    
                <div class="product-cart-box__text--price">
                    {{ product.price_total_formated }}
                </div>
            </div>
    
            <div class="product-cart-box__holder-actions">
                <quantity-selector class="quantity-selector">
                  <button type="button" class="quantity-btn minus" name="minus">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="2" viewBox="0 0 14 2" fill="#222222">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M0.25 0.75C0.25 0.335786 0.585786 -3.62117e-08 1 0L13 1.04907e-06C13.4142 1.08528e-06 13.75 0.335788 13.75 0.750001C13.75 1.16421 13.4142 1.5 13 1.5L1 1.5C0.585786 1.5 0.25 1.16421 0.25 0.75Z" fill="#222222"/>
                    </svg>
                  </button>
          
                  <input type="number" min="1" value="{{ product.quantity }}" name="product-quantity">
          
                  <button type="button" class="quantity-btn plus" name="plus">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="#222222">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M0 7C3.62135e-08 6.58579 0.335786 6.25 0.75 6.25L12.75 6.25C13.1642 6.25 13.5 6.58579 13.5 7C13.5 7.41421 13.1642 7.75 12.75 7.75L0.75 7.75C0.335786 7.75 -3.62099e-08 7.41421 0 7Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M6.75 0C7.16421 5.43176e-08 7.5 0.335787 7.5 0.75L7.5 12.75C7.5 13.1642 7.16421 13.5 6.75 13.5C6.33578 13.5 6 13.1642 6 12.75L6 0.75C6 0.335786 6.33579 -5.43175e-08 6.75 0Z"/>
                    </svg>
                  </button>
                </quantity-selector>
    
                <cart-remove-button class="product-cart-box__text--remove" item-id="{{ product.id }}">
                    Remover
                </cart-remove-button>
            </div>
        </div>
    </div>
    `;

    const promotionalPriceTemplate = `
      <div class="product-cart-box__text--price-discount">
          {{ originalProductPrice }}
      </div>
    `;

    items.filter(item => !item.kit_id).forEach(item => {
      const templateWithItem = renderTemplate(template, {product: item});
      const itemElement = htmlToElement(templateWithItem);

      //check if product has promotional price
      if (parseFloat(item.price_sale) - parseFloat(item.price) > 0) {
        const originalPrice = numberToBRL(parseFloat(item.price_sale * item.quantity));
        const priceEl = htmlToElement(renderTemplate(promotionalPriceTemplate, { originalProductPrice: originalPrice }));

        const elToInsert = itemElement.querySelector('.product-cart-box__text--price');
        elToInsert.parentNode.insertBefore(priceEl, elToInsert);
      }

      if (this.dataset.showProductCartSavings && item.has_price_discount) {
        itemElement.querySelector('.product-cart-box__text--holder-info').appendChild(this.createDiscountTag(item));
      }
      
      document.querySelector('#mini-cart .cart-products-list').appendChild(itemElement);
      this.createVariationsLine(item.id, item.grids);
      this.createCustomizationsLine(item.id, item.customizations.filter(customization => customization.selected_value != null));
    });
  }

  getCombo(kitId, comboProducts) {
    let { products, ...combo } = JSON.parse(localStorage.getItem('comboCartGroup'))[kitId];
    combo.products = comboProducts;

    const originalPrice = combo.products.reduce((total, item) => total + Number(item.price), 0);

    const finalPrice = combo.discount_type === 'p'
      ? (1 - combo.discount_value / 100) * originalPrice
      : originalPrice - combo.discount_value;

    const discount = originalPrice - finalPrice;
    
    const container = `
      <div class="buy-together-cart-group__container" data-combo-id="${kitId}">
        <div class="buy-together-cart-group-title">Compre Junto</div>
        <remove-combo class="side-cart-remove">
          <div>
              <i class="icon icon-trash"></i>
          </div>
          <div class="remove-text">Remover Tudo</div>
        </remove-combo>
          
        <div class="buy-together-total-value">
          <div class="row">
            <div class="text discount-original-value">${numberToBRL(originalPrice)}</div>
            <div class="text after-discount-value">${numberToBRL(finalPrice)}</div>
          </div>
          <div class="row discount-percent">Desconto (-${numberToBRL(discount)})</div>
        </div>
      </div>
    `;

    const getProductElement = (product) => {
      const template = `
        <div class="product-cart-box__container--combo" item-id="${product.id}">
          <div class="product-cart-box__metadata">
            <div class="product-cart-box__holder-image">
              <div class="image-ratio">
                <img
                  src="${product.small}"
                  width="auto"
                  height="auto"
                  alt="Imagem do Produto"
                />
              </div>
            </div>
            <div class="product-cart-box__text--holder-info">
              <div class="product-cart-box__text--product-name">${product.name}</div>
              <div class="product-cart-box__text--product-extra">
                <ul>
                  ${product.grids.map(grid => {
                    return `
                      <li class="product-cart-box__text--sku">
                        ${ grid.name }: ${ grid.value }
                      </li>
                    `
                  }).join('')}
                </ul>
              </div>
              <div class="product-cart-box__text--quantity">
                Qtd.: ${product.quantity}
              </div>
            </div>
          </div>
        </div>
      `;

      return htmlToElement(template);
    };

    const renderedContainer = htmlToElement(container);

    combo.products.forEach(product => renderedContainer.appendChild(getProductElement(product)));

    document.querySelector('#mini-cart .cart-products-list').appendChild(renderedContainer);
  }

  createVariationsLine(itemId, variations) {
    const template = `
      <li class="product-cart-box__text--sku">
        {{ grid.name }}: {{ grid.value }}
      </li>
    `;

    const elementToAppend = document.querySelector(`[data-item-id="${itemId}"] .product-cart-box__text--product-extra`);

    variations.forEach((variation) => {
      const elementRendered = htmlToElement(renderTemplate(template, {grid: variation}));
      elementToAppend.append(elementRendered);
    });
  }

  createCustomizationsLine(itemId, customizations) {
    const elementToAppend = document.querySelector(`[data-item-id="${itemId}"] .product-cart-box__text--product-extra`);

    customizations.forEach((customization) => {
      const template = `
        <li class="product-cart-box__text--customization">
          ${ customization.name }: ${ customization.selected_value }
          <span class="product-cart-box__text--customization--price">
              (+ ${ customization.price_formated })
          </span>
        </li>
      `;
      
      const elementRendered = htmlToElement(template);
      
      elementToAppend.append(elementRendered);
    });
  }

  createDiscountTag(item) {
    const template = `
      <div class="product-cart-box__discount-tag">
        <div class="product-cart-box__discount-tag-text">
            {{ discount }} mais barato
        </div>
      </div>
    `;

    const productDiscount = numberToBRL(parseFloat(item.price_sale - item.price));
    const renderedElemenent = htmlToElement(renderTemplate(template, { discount: productDiscount }));

    return renderedElemenent;
  }

  renderCartSavings(template) {
    const subtotal = parseFloat(this.cart.prices.subtotal);
    const cartDiscount = parseFloat(this.cart.prices.discount);
    const totalCartSavings = numberToBRL(this.cart.prices.items_amount - subtotal + cartDiscount);
    
    const templateRendered = renderTemplate(template, { totalCartSavings: totalCartSavings, cart: this.cart });
    const elementToInsert = htmlToElement(templateRendered);

    const elementBefore = document.querySelector('#mini-cart .side-cart-total-value.-subtotal') || document.querySelector('#mini-cart .btn-cart-product');
    
    elementBefore.parentNode.insertBefore(elementToInsert, elementBefore);

    if (this.tagName === 'SIDE-CART') {
      document.querySelector('.side-cart-row.cart-savings').after(document.createElement('hr'));  
    }
  }

  updateQuantity(item, newQuantity) {
    addLoadingToCartLine(item);
    const url = `${window.routes.cart_base_url}/items/${item}?store_token=${window.Yampi.store_token}&cart_token=${window.Yampi.cart_token}`;
    
    const body = {
      product_option_id: parseInt(item),
      oldQuantity: parseInt(newQuantity),
      quantity: parseInt(newQuantity),
      skipShipment: true,
      store_token: window.Yampi.store_token,
      cart_token: window.Yampi.cart_token,
      metadata: {
        source_platform: "open_store"
      }
    }

    fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(response => {
      return response.json();
    }).then(response => {
      this.cart = response.cart;
      this.renderCart();
    }).finally(() => {
      removeLoadingFromCartLine(item);
    });
  }

  onChange(event) {
    this.updateQuantity(event.target.closest('.product-cart-box__container').dataset.itemId, event.target.value);
  }
}

customElements.define('mini-cart', MiniCart);

class RemoveCombo extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.addEventListener('click', this.handleClick.bind(this));
  }

  handleClick(event) {
    const closestProductCartItem = this.parentElement.querySelector('.product-cart-box__container--combo');
    const product_option_id = parseInt(closestProductCartItem.getAttribute('item-id'));
    const delete_url = `${window.routes.cart_base_url}/items/${product_option_id}/delete?store_token=${window.Yampi.store_token}&cart_token=${window.Yampi.cart_token}`;

    const body = JSON.stringify({
      product_option_id,
      skipShipment: true,
      store_token: window.Yampi.store_token,
      cart_token: window.Yampi.cart_token,
      metadata:{
        source_platform: "open_store"
      }
    });
    
    // addLoadingToCartLine(product_option_id);
    
    fetch(delete_url, 
      { 
        method: 'DELETE',
        body 
      }
    ).then(response => {
      if (response.ok) {
        return response.json();
      }
    }).then(response => {
      const cart = document.querySelector('dropdown-cart') || document.querySelector('side-cart');
      cart.cart = response.cart;
      cart.combos = groupBy(cart.cart.items.filter(item => item.kit_id), 'kit_id');
      cart.renderCart();
    });
  }
}

customElements.define('remove-combo', RemoveCombo);

class DropdownCart extends MiniCart {
  getCartTemplate(cart) {
    const template = `
    <div class="products-cart">
      <div class="cart-header flex -between">
        <span class="-title">MEU CARRINHO</span>
        <span
            v-if="!shouldShowCartSavings"
            class="cart-value price"
        >{{ cart.prices.total_formated }}</span>
      </div>

      <div class="cart-products-list">
        
      </div>

      <a href="{{ checkoutData.redirectUrl }}" class="btn btn-primary -block btn-cart-product -clean">
        Ver carrinho
      </a>
    </div>
    `;

    const checkoutData = {
      redirectUrl: `${window.routes.cart_base_url}?cart_token=${window.Yampi.cart_token}&store_token=${window.Yampi.store_token}`
    }
    
    return renderTemplate(template, { cart: cart, checkoutData: checkoutData });
  }

  renderEmptyCart() {
    this.cartElement.innerHTML = document.getElementById("empty-cart").innerHTML;
  }

  getCartSavingsTemplate() {
    const template = `
      <div>
        <div class="side-cart-total-value">
          <div class="side-cart-row">
            <div class="side-cart-total-text">
              PRODUTOS ({{ cart.items.length }})
            </div>
            <div class="side-cart-subtotal">{{ cart.prices.items_amount_formated }}</div>
          </div>
          <div class="side-cart-row cart-savings shake">
            <div class="side-cart-savings-text">
              VOCÊ ESTÁ ECONOMIZANDO
            </div>
            <div class="side-cart-savings-price">
              {{ totalCartSavings }}
            </div>
          </div>
          <hr>
        </div>
        <div class="side-cart-total-value -subtotal">
          <div class="side-cart-row">
              <span class="side-cart-total-text">SUBTOTAL</span>
              <span
                  class="side-cart-subtotal-after-discounts"
              >{{ cart.prices.total_formated }}
              </span>
          </div>
        </div>
      </div>
    `;

    return template;
  }
}

customElements.define('dropdown-cart', DropdownCart);

class SideCart extends MiniCart {
  constructor() {
    super();
    this.drawer = document.querySelector('.navigation-drawer-background');
    this.addListenerToCartClick();
    this.drawer.addEventListener('click', this.closeCart.bind(this));
  }
  
  getCartTemplate(cart) {
    const checkoutData = {
      redirectUrl: `${window.routes.cart_base_url}?cart_token=${window.Yampi.cart_token}&store_token=${window.Yampi.store_token}`
    }
    
    const template = `
    <div class="navigation-drawer-container">
      <div class="navigation-drawer">
        <div class="side-cart-container">
          <div class="side-cart-header">
            <div class="theme-title side-cart-title">Meu carrinho</div>
            <div class="close-modal icon icon-close-modal">X</div>
          </div>
          <div class="side-cart-content">
            <div class="cart-products-list"></div>
            <div class="side-cart-button-container">
              <div class="side-cart-total-value">
                <div class="side-cart-row">
                  <div class="side-cart-total-text">
                    PRODUTOS (${cart.items.length} ${cart.items.length > 1 ? 'itens' : 'item'})
                  </div>
                  <div class="side-cart-subtotal">${cart.prices.items_amount_formated}</div>
                </div>
              </div>
              <div class="side-cart-total-value -subtotal">
                <div class="side-cart-row">
                  <span class="side-cart-total-text">SUBTOTAL</span>
                  <span class="side-cart-subtotal-after-discounts">${cart.prices.total_formated} </span>
                </div>
              </div>
              <a 
                href="${checkoutData.redirectUrl}" 
                class="loader-button btn btn-primary side-cart-button -clean"
              >Ver carrinho</a>
            </div>
          </div>
        </div>
      </div>
    </div>
    `;

    return renderTemplate(template);
  }

  renderEmptyCart() {
    const template = `
      <div class="navigation-drawer-container">
        <div class="navigation-drawer">
          <div class="side-cart-container">
            <div class="side-cart-header">
              <div class="theme-title side-cart-title">Meu carrinho</div>
              <div class="icon icon-close-modal">X</div>
            </div>
            ${document.getElementById("empty-cart").innerHTML}
          </div>
        </div>
      </div>
      `;
    
    this.cartElement.innerHTML = template;
  }

  getCartSavingsTemplate() {
    const template = `
      <div class="side-cart-row cart-savings shake">
        <div class="side-cart-savings-text">
          VOCÊ ESTÁ ECONOMIZANDO
        </div>
        <div class="side-cart-savings-price">
          {{ totalCartSavings }}
        </div>
      </div>
    `;

    return template;
  }

  addListenerToCartClick() {
    const cartHolder = document.querySelector('.mini-cart-holder');

    if (cartHolder) {
      cartHolder.addEventListener('click', (event) => {
        event.preventDefault();
        this.openCart();
      })
    }
  }

  openCart() {
    this.drawer.classList.add('active');
    document.querySelector('body').classList.add('no-scroll');
  }

  closeCart(event) {
    event.stopPropagation();
    const closeElements = [
      this.drawer,
      this.querySelector('.icon-close-modal'),
      this.querySelector('.close-modal')
    ]
    if (closeElements.includes(event.target)) {
      this.drawer.classList.remove('active');
      document.querySelector('body').classList.remove('no-scroll');
    }
  }
}

customElements.define('side-cart', SideCart);

class CartRemoveButton extends HTMLElement {
  constructor() {
    super();
    const product_option_id = parseInt(this.getAttribute('item-id'));
    const delete_url = `${window.routes.cart_base_url}/items/${product_option_id}/delete?store_token=${window.Yampi.store_token}&cart_token=${window.Yampi.cart_token}`;

    const body = JSON.stringify({
      product_option_id,
      skipShipment: true,
      store_token: window.Yampi.store_token,
      cart_token: window.Yampi.cart_token,
      metadata:{
        source_platform: "open_store"
      }
    });
    
    this.addEventListener('click', (event) => {
      addLoadingToCartLine(product_option_id);
      event.preventDefault();
      fetch(delete_url, 
        { 
          method: 'DELETE',
          body 
        }
      ).then(response => {
        if (response.ok) {
          return response.json();
        }
      }).then(response => {
        const cart = document.querySelector('dropdown-cart') || document.querySelector('side-cart');
        cart.cart = response.cart;
        cart.renderCart();
      });
    });
  }
}

customElements.define('cart-remove-button', CartRemoveButton);

const addLoadingToCartLine = (itemId) => {
  const element = document.querySelector(`.product-cart-box__container.item-${itemId} quantity-selector`);
  element.classList.add('disabled');
}

const removeLoadingFromCartLine = (itemId) => {
  const element = document.querySelector(`.product-cart-box__container.item-${itemId} quantity-selector`);
  element.classList.remove('disabled');
}
