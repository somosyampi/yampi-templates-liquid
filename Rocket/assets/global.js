function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

function setCookie(name, value, days) {
  let expires = "";
  
  if (days) {
    let date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function renderTemplate(template, variables) {
  const variableRegex = /\{\{(.*?)\}\}/g;

  const replaceVariables = (str, vars) => {
    return str.replace(variableRegex, (match, key) => {
      const keys = key.split('.').map(k => k.trim());
      let value = vars;

      for (const k of keys) {
        value = value[k];
        if (value === undefined) {
          return match;
        }
      }

      return value;
    });
  };

  return replaceVariables(template, variables);
}

function htmlToElement(html) {
  const template = document.createElement('template');
  html = html.trim();
  template.innerHTML = html;
  return template.content.firstChild;
}

function numberToBRL(number) {
  return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function groupBy (array, key) {
	return array.reduce((acc, item) => ({
      ...acc,
      [item[key]]: [...(acc[item[key]] ?? []), item],
    }),
  {})
}

class QuantitySelector extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true });
    this.input.addEventListener('change', this.onInputChange.bind(this));
    this.querySelectorAll('button').forEach((button) =>
      button.addEventListener('click', this.onButtonClick.bind(this))
    );
  }

  onInputChange(event) {
    this.validateQtyRules();
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;

    event.target.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
    if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
  }

  validateQtyRules() {
    const value = parseInt(this.input.value);
    if (this.input.min) {
      const min = parseInt(this.input.min);
      const buttonMinus = this.querySelector(".quantity-btn.minus");
      buttonMinus.classList.toggle('disabled', value <= min);
    }
    if (this.input.max) {
      const max = parseInt(this.input.max);
      const buttonPlus = this.querySelector(".quantity-btn.plus");
      buttonPlus.classList.toggle('disabled', value >= max);
    }
  }
}

customElements.define('quantity-selector', QuantitySelector);

class SideBarTrigger extends HTMLElement {
  constructor() {
    super();
    const background = document.querySelector('.over-background')
    this.addEventListener('click', this.openMenu.bind(this));
    background.addEventListener('click', this.closeMenu.bind(this));
    
    this.body = document.querySelector('body');
  }

  openMenu(event) {
    this.body.classList.add('active-menu');
  }

  closeMenu(event) {
    event.stopPropagation();
    this.body.classList.remove('active-menu');
  }
  
}

customElements.define('side-bar-trigger', SideBarTrigger);

class StopwatchTimer extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.loadCountdown();
  }

  loadCountdown() {
    const now = new Date();
    const hours =  String(23 - now.getHours()).padStart(2, '0');
    const minutes = String(59 - now.getMinutes()).padStart(2, '0');
    const seconds = String(59 - now.getSeconds()).padStart(2, '0');
  
    this.text = `${hours} : ${minutes} : ${seconds}`;
    this.innerText = this.text;
  
    setTimeout(() => {
      this.loadCountdown();
    }, 1000);
  }
}

customElements.define('stopwatch-timer', StopwatchTimer);

class ModalDialog extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.btnClose = this.querySelector('.close-modal');
    this.btnClose.addEventListener('click', this.closeModal.bind(this));
    this.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE') {
         this.closeModal();
      }
    });
    this.addEventListener('click', (event) => {
        if (event.target === this) {
          this.closeModal();
        } 
    });
  }

  openModal(source = undefined) {
    this.classList.add('active');
    if (source) {
      this.source = source;
    }
  }

  closeModal() {
    this.classList.remove('active');
  }
}

customElements.define('modal-dialog', ModalDialog);

class ZoomModal extends ModalDialog {
  constructor() {
    super();
  }

  openModal(source = undefined) {
    this.classList.add('active');
    if (source) {
      this.source = source;
    }

    const img = this.querySelector('img');

    img.src = this.source.src;
  }
}

customElements.define('zoom-modal', ZoomModal);

class ModalOpener extends HTMLElement {
  constructor() {
    super();

    this.addEventListener('click', (event) => {
      const modal = document.querySelector(this.getAttribute('data-modal'));
      if (modal) {
        modal.openModal(event.target);
      }
    });
  }
}

customElements.define('modal-opener', ModalOpener);

class CustomSelect extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.select = this.querySelector('select');
    this.select.addEventListener('change', this.handleChange.bind(this));
  }

  handleChange(event) {
    const iconEl = this.querySelector('img.icon');
    const iconUrl = event.target.selectedOptions[0].dataset.icon;
    iconEl.src = iconUrl;
  }
}

customElements.define('custom-select', CustomSelect);

class CollapseItem extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.targetSelector = this.dataset.target;
    this.addEventListener('click', this.handleClick.bind(this));
  }

  handleClick(event) {
    const target = document.querySelector(this.targetSelector);

    if (!target) {
      return;
    }

    target.classList.toggle('show');
  }
}

customElements.define('collapse-item', CollapseItem);

class SmoothScroller extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.target = document.querySelector(this.dataset.target);
    this.addEventListener('click', this.handleClick.bind(this));
  }

  handleClick(event) {
    window.scroll({
      top: this.target.offsetTop,
      behavior: "smooth",
    });
  }
}

customElements.define('smooth-scroller', SmoothScroller);