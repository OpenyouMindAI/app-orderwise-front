class Printer {
  constructor () {
    if (!window.Capacitor || !window.Capacitor.Plugins.Printer) {
      throw new Error('Printer plugin not available')
    }
    this.plugin = window.Capacitor.Plugins.Printer
  }

  async setPaperWidth (width) {
    await this.plugin.setPaperWidth({ width })
    this.paperWidth = width
  }

  async text (content, options = {}) {
    if (!this.plugin.text) {
      throw new Error('text() method not implemented in native code')
    }
    return this.plugin.text({
      text: content,
      ...options
    })
  }

  async print () {
    if (!this.plugin.print) {
      throw new Error('print() method not implemented in native code')
    }
    return this.plugin.print()
  }

  // Métodos de conveniencia
  async left (text, options = {}) {
    return this.text(text, { ...options, align: 'left' })
  }

  async center (text, options = {}) {
    return this.text(text, { ...options, align: 'center' })
  }

  async right (text, options = {}) {
    return this.text(text, { ...options, align: 'right' })
  }

  async bold (text, options = {}) {
    return this.text(text, { ...options, fontWeight: 'bold' })
  }

  async large (text, options = {}) {
    return this.text(text, { ...options, fontSize: 'large' })
  }

  async qr (data, options = {}) {
    return this.plugin.qr({
      data,
      align: options.align || 'center',
      size: options.size || 4,
      correction: options.correction || 2
    })
  }
}

// Exportar una instancia singleton
export const printer = new Printer()
