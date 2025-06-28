import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

const steps = [
  {
    element: '#select-client',
    popover: {
      title: 'Cliente',
      description: 'Seleccione el cliente antes de comenzar.',
      side: 'left',
      align: 'start'
    }
  },
  {
    element: '#invoice-type',
    popover: {
      title: 'Tipo de factura',
      description: 'Elegí si es Ticket o Factura.',
      side: 'left',
      align: 'start'
    }
  },
  {
    element: '#service-type',
    popover: {
      title: 'Tipo de servicio',
      description: 'Indica si es mostrador, delivery u otro.',
      side: 'left',
      align: 'start'
    }
  },
  {
    element: '#input-code',
    popover: {
      title: 'C\u00f3digo',
      description: 'Pod\u00e9s ingresar el producto por código.',
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#buttons-bar',
    popover: {
      title: 'Acciones r\u00e1pidas',
      description: 'Acced\u00e9 a mesas, cobro y m\u00e1s.',
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#product-list',
    popover: {
      title: 'Lista de productos',
      description: 'Ac\u00e1 se muestran los productos seleccionados.',
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#product-categories',
    popover: {
      title: 'Categor\u00edas',
      description: 'Eleg\u00ed la categor\u00eda para ver sus productos.',
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '#product-grid',
    popover: {
      title: 'Productos',
      description: 'Toc\u00e1 un producto para agregarlo al pedido.',
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '#total-section',
    popover: {
      title: 'Total',
      description: 'Este es el total de la venta actual.',
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '#btn-pay',
    popover: {
      title: 'Cobrar',
      description: 'Finaliz\u00e1 el pedido y proces\u00e1 el cobro.',
      side: 'left',
      align: 'start'
    }
  }
]

export const getPopover = () => {
  const driverObj = driver({
    showProgress: true,
    steps
  })
  driverObj.drive()
}
