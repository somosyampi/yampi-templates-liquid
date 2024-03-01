class ComboProduct extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.btnAddToCart = this.querySelector('button[type="submit"]');
    this.products = this.querySelectorAll('.buy-together-product');
    console.log(this.btnAddToCart);
    this.btnAddToCart.addEventListener('click', this.handleClick.bind(this));
    console.log('combo products');
  }

  handleClick(event) {
    this.addToCart();
  }

  addToCart() {
    const url = `${window.routes.cart_base_url}/items?store_token=${window.Yampi.store_token}&cart_token=${window.Yampi.cart_token}`;

    const itemsIds = Array.from(this.products).map(item => item.dataset.sku);
    const quantity = Array.from({ length: this.products.length }, () => 1);
    const kit_id = this.dataset.comboId; 
 
    console.log(itemsIds);
    console.log(quantity);
    console.log(kit_id);

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
      // publish(EVENTS.cartUpdate, { source: 'product-form', productOptionId: itemId, cartData: response });
      // event.submitter.classList.remove('sending');
    });
  }
}

customElements.define('combo-product', ComboProduct);
