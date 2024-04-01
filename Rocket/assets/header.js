class CategoryDropdown extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const trigger = this.querySelector('.category-dropdown-holder.has-subcategory');

    trigger.addEventListener('click', this.openDropdown.bind(this));
  }

  openDropdown(event) {
    const dropdown = this.querySelector('.dropdown');
    dropdown.classList.add('is-active');
  }

  closeDropdown(event) {
    const dropdown = this.querySelector('.dropdown');
    dropdown.classList.remove('is-active');
  }
}

customElements.define('category-dropdown', CategoryDropdown, extends: "li");