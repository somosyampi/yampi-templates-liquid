class ComboProduct extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.btnAddToCart = this.querySelector('button[type="submit"]');
    this.products = this.querySelectorAll('.buy-together-product');
    this.btnAddToCart.addEventListener('click', this.handleClick.bind(this));
    this.addEventListener('skuSelected', this.handleSkuSelected.bind(this));
    this.fillValues();
  }

  fillValues() {
    const comboId = this.dataset.comboId;
    const combo = JSON.parse(localStorage.getItem('comboCartGroup'))[comboId];

    const originalPrice = combo.products.data.reduce((total, item) => total + Number(item.prices.data.price), 0);

    const finalPrice = combo.discount_type === 'p'
      ? (1 - combo.discount_value / 100) * originalPrice
      : originalPrice - combo.discount_value;

    const discount = originalPrice - finalPrice;

    this.querySelector('.old-price').innerText = numberToBRL(originalPrice);
    this.querySelector('.final-value').innerText = numberToBRL(finalPrice);
    this.querySelector('.discount-value').innerText = `Economize ${numberToBRL(discount)}`;
  }

  handleClick(event) {
    this.addToCart();
  }

  handleSkuSelected(event) {
    console.log('foo');
    const boxProduct = event.target.closest('.buy-together-product');
    boxProduct.dataset.sku = event.detail.sku.id;
  }

  addToCart() {
    const buyButton = this.querySelector('button[type="submit"]');
    buyButton.classList.add('sending');
    
    const url = `${window.routes.cart_base_url}/items?store_token=${window.Yampi.store_token}&cart_token=${window.Yampi.cart_token}`;

    const itemsIds = Array.from(this.products).map(item => item.dataset.sku);
    const quantity = Array.from({ length: this.products.length }, () => 1);
    const kit_id = this.dataset.comboId; 
 
    const body = {
      cart_token: window.Yampi.cart_token,
      customization: {},
      has_recomm: false,
      item_metadata: [],
      metadata: {
        source_platform: "open_store"
      },
      kit_id,
      product_option_id: itemsIds,
      quantity,
      skipShipment: true,
      store_token: window.Yampi.store_token
    }

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(response => {
      return response.json();
    }).then(response => {
      publish(EVENTS.cartUpdate, { source: 'buy-together', cartData: response });
      buyButton.classList.remove('sending');
    });
  }
}

customElements.define('combo-product', ComboProduct);