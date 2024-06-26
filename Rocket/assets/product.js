const setLocalStorageCache = (value, payload, selectedCardAlias) => {
  let storage = window.localStorage;
  let ttl = 10;

  if (!storage) {
    return null;
  }

  payload.expire_at = new Date().getTime() + 10 * 60000; //add 10 minutes

  storage.setItem(
    getLocalStorageCacheKey(value, selectedCardAlias),
    JSON.stringify(payload)
  );
}

const getLocalStorageCache = (value, selectedCardAlias) => {
  let storage = window.localStorage;

  if (!storage) {
    return null;
  }

  let cached = JSON.parse(
    storage.getItem(getLocalStorageCacheKey(value, selectedCardAlias))
  ) || {};

  if ((cached.expire_at || 0) < new Date().getTime()) {
    return null;
  }

  return cached;
}

const getLocalStorageCacheKey = (value, selectedCardAlias) => {
  const cardBrand = selectedCardAlias || 'visa';

  if (!cardBrand) {
    return null;
  }

  return `installments_${cardBrand}_${value}`;
}

const convertToNumber = (string) => parseInt(string);

const compareNumber = (a, b) => a - b;

const isEmpty = obj => [Object, Array].includes((obj || {}).constructor) && !Object.entries((obj || {})).length;

const maskCep = (cep) => {
  cep = cep.replace(/\D/g, '');

  if (cep.length > 5) {
    cep = cep.substring(0, 5) + '-' + cep.substring(5, 8);
  }

  return cep;
}

class BaseInstallments extends HTMLElement {
  constructor() {
    super();
    this.installments = {};
    this.productId = this.getAttribute('product-id');
    this.amount = this.getAttribute('amount');
    this.getInstallments(this.productId, this.amount);
  }

  getInstallments(productId, amount, brand = 'visa') {
    const cached = getLocalStorageCache(amount, brand);

    if (cached) {
      this.installments = cached;
      this.handleInstallmentsFetch();
      return;
    }
    
    const route = `${window.Yampi.api_domain_public}/catalog/products/${productId}/installments?amount=${amount}&brand=${brand}`; 
    
    fetch(route)
    .then(response => {
      if (!response.ok) {
          throw new Error(`Erro na solicitação: ${response.status}`);
      }
      
      return response.json();
    })
    .then(data => {
      this.installments = data.data;
      setLocalStorageCache(amount, data.data, brand);
      this.handleInstallmentsFetch();
    });
  }

  handleInstallmentsFetch() {
    return;
  }
}

class InstallmentsText extends BaseInstallments {
  constructor() {
    super();
  }

  handleInstallmentsFetch() {
    const template = this.getTemplate(this.installments);
    this.innerHTML = template;
  }

  getTemplate(installments) {
    const lastInstallment = this.installments.installments[this.installments.installments.length - 1];
    
    const formattedValue = lastInstallment.installment_value_formated;
    
    let text = `${lastInstallment.installment}x de <span class="price">${formattedValue}</span>`;

    if (lastInstallment.text.includes('sem juros')) {
        text += ' <span class="-free-tax">sem juros</span>';
    }
    
    const template = `
      <div class="installment-text">
        ${text}
      </div>
    `;

    return template;
  }
}

customElements.define('installments-text', InstallmentsText);

class InstallmentsTable extends BaseInstallments {
  static get observedAttributes() {
    return ["brand", "amount"];
  }
  
  constructor() {
    super();
    this.selectBrand = document.querySelector('#modal-installments .custom-select-image-prefix');
    this.selectBrand.addEventListener('change', this.handleBrandChange.bind(this));
  }

  handleBrandChange(event) {
    this.setAttribute('brand', event.target.value);
  }

  getTemplate(installment) {
    const cleanText = (string) => {
      return string.replace(" *", "");
    }
    
    const template = `
      <tr>
        <td>${installment.installment}</td>
        <td>${cleanText(installment.text)}</td>
        <td>${installment.amount_formated}</td>
      </tr>
    `;

    return htmlToElement(template);
  }

  handleInstallmentsFetch() {
    const tbody = this.querySelector('table tbody');
    tbody.innerHTML = '';

    this.installments.installments.forEach((installment) => {
      const template = this.getTemplate(installment);
      tbody.appendChild(template);
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // Avoids the first time that the component is rendered, the callback is triggered but with oldValue being null
    if (newValue && oldValue) {
      const amount = this.getAttribute('amount');
      const brand = this.getAttribute('brand');
      const productId = this.productId;

      this.getInstallments(productId, amount, brand);
    }
  }
}

customElements.define('installments-table', InstallmentsTable);

class InventoryCountdown extends HTMLElement {
  constructor() {
    super();
    this.actual = 12;
    this.start = 12;
    this.max = 48;
    this.min = 2;
    this.timeout= 10000;
  }

  startCountdown() {
    const nextTimeout = (this.start - this.actual + 1) * this.timeout;

    setTimeout(() => {
      this.actual--;
      this.getBarStyle();

      const text = this.querySelector('.quantity-left').innerText = this.actual;

      if (this.actual > this.min) {
          this.startCountdown();
      }
    }, nextTimeout);
  }

  getBarStyle() {
    const percentage = 10 + Math.round((this.actual / this.max) * 100, 2);
    const bar = this.querySelector('.percentage-bar').style.width = `${percentage}%`;
  }

  connectedCallback() {
    this.startCountdown();
  }
}

customElements.define('inventory-countdown', InventoryCountdown);

class ShippingForm extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.form = this.querySelector('form');
    this.querySelector('input').addEventListener('input', this.handleInputChange.bind(this));

    this.form.addEventListener('submit', this.onFormSubmit.bind(this));
  }

  async onFormSubmit(event) {
    event.preventDefault();
    const button = this.querySelector('button');
    button.classList.add('sending');
    const optionId = this.dataset.optionId;
    const quantity = 1;
    const zipcode = this.querySelector('input#zipcode').value;
    const total = this.dataset.productPrice;
    const route = `${window.Yampi.bart_url}/api/v1/shipping/calculate?product_option_id[]=${optionId}&quantity[]=${quantity}&zipcode=${zipcode}&total=${total}`;

    try {
      this.clearError();
      const response = await fetch(route);

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message);
        error.name = "";
        throw error;
      }

      this.renderResponse(data);
    } catch (error) {
      this.setError(error)
    } finally {
      button.classList.remove('sending');
    }
  }

  renderResponse(data) {
    this.quotes = Object.values(data);

    const hasCustomShipping = this.dataset.customShipping;

    let deliveryTime = 0;

    const firstQuote = this.quotes[0];

    if (hasCustomShipping) {
      this.quotes.forEach(shippingOption => {
        if (shippingOption.delivery_time > deliveryTime) {
          deliveryTime = shippingOption.delivery_time
        }
      });
      
      this.quotes = [
        {
          service_display_name: 'FRETE',
          service_id: 'shipping_custom',
          service_name: 'shipping_custom',
          service_type_name: 'shipping_custom',
          id: 'shipping_custom',
          quote_id: 'shipping_custom',
          real_price: this.dataset.shippingPrice,
          formated_price: parseFloat(this.dataset.shippingPrice)
              ? numberToBRL(parseFloat(this.dataset.shippingPrice))
              : 'Grátis',
         delivery_time: deliveryTime,
         formated_delivery_time: 'até ' + deliveryTime + ' dias úteis'
          
        }
      ]
    }
    
    const modalBody = document.getElementById('modal-shipping');

    modalBody.querySelector('.selected-zipcode').textContent = maskCep(firstQuote.zipcode);
    modalBody.querySelector('.selected-city').textContent = `${firstQuote.city} - ${firstQuote.uf}`;

    const template = `
      <tr>
          <th>Tipo</th>
          <th>Prazo</th>
          <th>Valor</th>
      </tr>

      <tr>
        ${this.quotes.map(quote => {
          return `
            <td>${ quote.service_display_name }</td>
            <td>${ quote.formated_delivery_time }</td>
            <td class="price">${ quote.formated_price }</td>
          `
        }).join('')}
      </tr>
    `;

    modalBody.querySelector('.modal-content table').innerHTML = template.trim();
    
    modalBody.openModal();
  }

  handleInputChange(event) {
    event.target.value = maskCep(event.target.value);
  }

  setError(message) {
    const input = this.querySelector('input');
    input.classList.add('error');

    const errorElement = document.createElement('div');
    errorElement.classList.add('error-text');
    errorElement.textContent = message;

    input.parentElement.appendChild(errorElement);
  }

  clearError() {
    const input = this.querySelector('input');
    input.classList.remove('error');

    const holderInput = input.parentElement;
    const textError = holderInput.querySelector('.error-text');

    if (!textError) {
      return;
    }
    
    holderInput.removeChild(textError);
  }
}

customElements.define('shipping-form', ShippingForm);

class ProductForm extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.form = this.querySelector('form');
    this.submitButton = this.querySelector('[type="submit"]');

    this.form.addEventListener('submit', this.onFormSubmit.bind(this));
  }

  allVariantsSelected() {
    const skuSelect = document.querySelectorAll('.main-product-info select-sku select');
    const invalidValues = Array.from(skuSelect).filter(element => !convertToNumber(element.value));

    if (invalidValues.length) {
      invalidValues.forEach(element => element.classList.add('error'));
      return false;
    }

    return true; 
  }

  getCustomizationValues() {
    let values = {};
    const inputs = document.querySelectorAll('product-customization input, product-customization select');

    Array.from(inputs).forEach((element) => {
       const id = element.id.split('customization-')[1];
        values[id] = element.value;
    });

    return values;
  }

  async onFormSubmit(event) {
    event.preventDefault();

    if (!this.allVariantsSelected()) {
      return false;
    }

    const productCustomizations = document.querySelector('product-customization');

    if (productCustomizations && !productCustomizations.checkValues()) {
      return;
    }

    const btn = event.submitter.classList.add('sending');
    
    const formData = new FormData(this.form);

    const itemId = parseInt(formData.get('product_option_id'));
    const quantity = parseInt(formData.get('quantity'));

    const url = `${window.routes.cart_base_url}/items?store_token=${window.Yampi.store_token}&cart_token=${window.Yampi.cart_token}`;

    const body = {
      cart_token: window.Yampi.cart_token,
      customization: {
        [itemId]: this.getCustomizationValues()
      },
      has_recomm: false,
      item_metadata: [],
      metadata: {
        source_platform: "open_store"
      },
      product_option_id: [itemId],
      quantity: [quantity],
      skipShipment: true,
      store_token: window.Yampi.store_token
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      console.log(response);

      const cartData = await response.json();

      console.log(cartData);

      console.log(cartData.message[0].message);

      if (!response.ok) {
        throw new Error(cartData.message[0].message);
      }

      publish(EVENTS.cartUpdate, { source: 'product-form', productOptionId: itemId, cartData });
      event.submitter.classList.remove('sending');
    } catch (error) {
      console.error(error);
    }
  }
}

customElements.define('product-form', ProductForm);

class SelectSku extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.selectedValues = [];
    this.selectedSku = null;
    this.selects = this.querySelectorAll('select');
    this.selects.forEach(select => {
      select.addEventListener('change', this.handleChange.bind(this));
    })
  }

  handleChange(event) {
    event.target.classList.remove('error');
    this.selectedValues = Array.from(this.selects).map(select => select.value);
    this.selectedSku = this.skus.find(sku => {
        const combination = sku.combinations;
        return this.selectedValues.sort(compareNumber).join('-') === combination;
    });

    this.checkIfIsValidSku(this.selectedSku);
  }

  insertCustomizationBox() {
    const productForm = document.querySelector('product-form');
    const productCustomization = document.createElement('product-customization');
    
    productForm.parentNode.insertBefore(productCustomization, productForm);
  }

  checkIfIsValidSku(sku) {
    window.selectedSku = sku;
    const optionToCart = document.getElementById('option-to-cart');
    optionToCart.value = sku.id;
    
    if (!sku || sku.blocked_sale) {
      console.log('!sku || sku.blocked_sale');
      return false;
    }

    const previousCustomization = document.querySelector('product-customization');

    if (previousCustomization) {
      previousCustomization.remove();
    }

    if (sku.customizations.data.length) {
      this.insertCustomizationBox();
    }

    this.dispatchEvent(
      new CustomEvent("skuSelected", {
        bubbles: true,
        detail: { sku: this.selectedSku },
      }),
    );
    
    return true;
  }
}

customElements.define('select-sku', SelectSku);

class ProductCustomization extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.sku = window.selectedSku;
    this.appendChild(htmlToElement(this.getTemplate()));
    const inputs = this.querySelectorAll('input, select');
    inputs.forEach(input => {
      input.addEventListener('change', this.checkValues.bind(this))
    });
  }

  getTemplate() {
    const customizations = window.selectedSku.customizations.data;

    const priceSum = 0;
  
    const mapTypes = {
      input: (customization) => {
        return `
          <input
            id="customization-${customization.id}"
            type="text" 
            placeholder="Digite aqui..." 
            maxlength="${customization.max_chars}"
          >
        `;
      },

      select: (customization) => {
        return `
          <div class="custom-select">
            <select id="customization-${customization.id}">
              <option value="">Selecionar...</option>
              ${customization.values.map(value => {
                return `<option value="${value}">${value}</option>`
              }).join('')}
            </select>
          </div>
        `;
      }
    }
    
    const template = `
      <div class="text-center">
        ${window.selectedSku.allow_sell_without_customization
          ? `<collapse-item data-target='.main-product-customization'>
              <div class="-all-optional">
                <span class="link-alike">Personalize o Produto</span>
                <i class="icon icon-select-arrow"></i>
              </div>
            </collapse-item>`
          : ''
        }
        <div class="main-product-customization text-left">
          <div class="-title">Personalizar produto</div>
        
          ${customizations.map(customization => { return `
            <div class="customization">
              <label for="customization-${customization.id}">
                ${customization.name}
                
                ${customization.required
                  ? `<span class="required">*</span>`
                  : ''
                }
              </label>
              
              ${mapTypes[customization.type](customization)}
              
              <div class="error-text hide">Campo obrigatório</div>
          
              <div class="flex -between">
                <div class="-max-chars">
                  ${customization.type === 'input' ? `Máximo de ${customization.max_chars}
                  caracteres` : '' }
                </div>

                ${customization.price > 0
                  ? `<div class="-customization-price">
                      + ${numberToBRL(customization.price)}
                    </div>`
                  : ''
                }
              </div>
            </div>
          `; 
          }).join('')} 
          ${priceSum > 0 
            ? `<div class="total-sum flex -between">
                <div class="-text">Valor total da personalização:</div>
                <div>{{ priceSum }}</div>
              </div>` 
            : '' 
          }
        </div>
      </div>
    `;

    return template;
  }

  checkValues(context = undefined) {
    if (!context) {
      this.clearErrors();
    } else {
      this.clearErrors(context.target);
    }
    const invalidCustomizations = this.getInvalidCustomizations();

    if (!invalidCustomizations) {
      return true;
    }

    invalidCustomizations.forEach(customization => {
      this.setErrors(customization);
    });

    return false;
  }

  setErrors(input) {
    input.classList.add('error');
    if (input.tagName === 'SELECT') {
      input.parentElement.nextElementSibling.classList.remove('hide');
    } else {
      input.nextElementSibling.classList.remove('hide');
    }
  }

  clearErrors(input = undefined) {
    if (input) {
      input.classList.remove('error');
      input.closest('div.customization').querySelector('.error-text').classList.add('hide');
      return;
    }
  }

  getInvalidCustomizations() {
    this.values = this.getCustomizationValues();
    
    const customizations = window.selectedSku.customizations.data;

    if (customizations.length === 0 || window.selectedSku.allow_sell_without_customization) {
      return;
    }

    const emptyCustomizations = customizations
                .filter(customization => isEmpty(this.values[customization.id]));

    if (emptyCustomizations.every(customization => !customization.required)) {
      return;
    }

    const invalidCustomizations = emptyCustomizations.filter(customization => customization.required);

    const invalidInputs = [];

    invalidCustomizations.forEach(customization => {
      const input = document.getElementById(`customization-${customization.id}`);
      if (input) {
        invalidInputs.push(input);
      }
    });

    return invalidInputs;
  }

  getCustomizationValues() {
    let values = {};
    const inputs = this.querySelectorAll('input, select');

    Array.from(inputs).forEach((element) => {
       const id = element.id.split('customization-')[1];
        values[id] = element.value;
    });

    return values;
  }
}

customElements.define('product-customization', ProductCustomization);

class PinchZoom extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    let initialDistance = 0;
    let initialWidth = 0;

    const img = this.querySelector('#modal-product-zoom img');

    img.addEventListener('touchstart', (event) => {
        if (event.touches.length === 2) {
            initialDistance = this.calculateDistance(event.touches);
            initialWidth = parseInt(window.getComputedStyle(img).getPropertyValue('width'));
        }
    });
    
    img.addEventListener('touchmove', (event) => {
        if (event.touches.length === 2) {
            const currentDistance = this.calculateDistance(event.touches);
            const scaleFactor = currentDistance / initialDistance;
            const newWidth = initialWidth * scaleFactor;
            // Limitar o zoom máximo e mínimo para evitar distorção excessiva
            if (newWidth >= 100 && newWidth <= 1000) {
                img.style.width = newWidth + 'px';
            }
            event.preventDefault(); // Evitar zoom da página inteira
        }
    });
  }

  calculateDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

customElements.define('pinch-zoom', PinchZoom);

class ProductGallery extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const selectSku = document.querySelector('product-form select-sku');
    selectSku.addEventListener('skuSelected', this.handleSkuChange.bind(this));
  }

  handleSkuChange(event) {
    const images = event.detail.sku.images.data;
    this.refreshImages(images);
    
    console.log(event);
  }

  refreshImages(images) {
    const holder = this.querySelector('ul');
    
    holder.innerHTML = '';

    images.forEach((image, index) => {
      const template = `
        <li class="thumb-item" data-index="${index}">
          <img src="${image.url}" class="thumb-image">
        </li>
      `;

      console.log(template);

      holder.appendChild(htmlToElement(template));
    });
  }
}

customElements.define('product-gallery', ProductGallery);