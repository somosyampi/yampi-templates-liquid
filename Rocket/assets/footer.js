class FormNewsletter extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.form = document.getElementById('form-newsletter');
    this.form.addEventListener('submit', this.handleFormSubmit.bind(this));
  }

  async handleFormSubmit(event) {
    event.preventDefault();

    const formData = new FormData(this.form);

    const url = `${window.Yampi.api_domain}/leads`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      console.log(data);
    } catch (error) {
      console.error(error);
    }
  }
}

customElements.define('form-newsletter', FormNewsletter);

class ExpandableElement extends HTMLElement {
  static get observedAttributes() {
    return ["expanded"];
  }
  
  constructor() {
    super();
  }

  connectedCallback() {
    const title = this.querySelector('.title');
    this.height = title.scrollHeight;
    this.isExpanded = this.getAttribute('expanded') === 'true';
    if (window.innerWidth <= 700) {
      title.addEventListener('click', this.handleClick.bind(this));
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // Avoids the first time that the component is rendered, the callback is triggered but with oldValue being null
    if (newValue && oldValue) {
      this.isExpanded = newValue === 'true';
    }
  }

  handleClick() {
    if (this.isExpanded) {
      return this.close();
    }

    return this.open();
  }

  open() {
    this.style.height = this.scrollHeight + 'px';
    this.setAttribute('expanded', true);
  }

  close() {
    this.style.height = this.height + 'px';
    this.setAttribute('expanded', false);
  }
}

customElements.define('expandable-element', ExpandableElement);