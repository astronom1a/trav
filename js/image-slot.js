class ImageSlot extends HTMLElement {
  connectedCallback() {
    const placeholder = this.getAttribute('placeholder') || 'Image';
    this.style.display = 'block';
    this.style.background = 'var(--is-bg, #d9c8bd)';
    this.style.position = 'relative';
    this.style.overflow = 'hidden';

    const label = document.createElement('span');
    label.textContent = placeholder;
    label.style.cssText = `
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
      font-family: "DM Mono", monospace;
      font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase;
      color: var(--is-fg, #1d2a2e); opacity: 0.4;
      text-align: center; padding: 24px;
    `;
    this.appendChild(label);
  }
}
customElements.define('image-slot', ImageSlot);
