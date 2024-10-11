export interface IconAttributes {
  [key: string]: string
}

export interface IconData {
  name: string
  attributes?: IconAttributes
  vectors: string[]
}

export const icons: IconData[] = [
  {
    name: 'mail',
    attributes: {
      stroke: 'none',
    },
    vectors: [
      `<path d="M3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3ZM20 7.23792L12.0718 14.338L4 7.21594V19H20V7.23792ZM4.51146 5L12.0619 11.662L19.501 5H4.51146Z"></path>`,
    ],
  },
  {
    name: 'user',
    attributes: {
      stroke: 'none',
    },
    vectors: [
      `<path d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22H18C18 18.6863 15.3137 16 12 16C8.68629 16 6 18.6863 6 22H4ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11Z"></path>`,
    ],
  },
  {
    name: 'key',
    attributes: {
      stroke: 'none',
    },
    vectors: [
      `<path d="M12.917 13C12.441 15.8377 9.973 18 7 18C3.68629 18 1 15.3137 1 12C1 8.68629 3.68629 6 7 6C9.973 6 12.441 8.16229 12.917 11H23V13H21V17H19V13H17V17H15V13H12.917ZM7 16C9.20914 16 11 14.2091 11 12C11 9.79086 9.20914 8 7 8C4.79086 8 3 9.79086 3 12C3 14.2091 4.79086 16 7 16Z"></path>`,
    ],
  },
  {
    name: 'search',
    attributes: {
      fill: 'none',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    },
    vectors: [`<circle cx="11" cy="11" r="8"></circle>`, `<line x1="21" y1="21" x2="16.65" y2="16.65"></line>`],
  },
  {
    name: 'close',
    vectors: [`<path d="M6 18 18 6M6 6l12 12" />`],
  },
  {
    name: 'calendar',
    attributes: {
      stroke: 'none',
    },
    vectors: [
      `<path d="M9 1V3H15V1H17V3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H7V1H9ZM20 11H4V19H20V11ZM7 5H4V9H20V5H17V7H15V5H9V7H7V5Z"></path>`,
    ],
  },
  {
    name: 'left',
    attributes: {
      stroke: 'none',
    },
    vectors: [
      `<path d="M10.8284 12.0007L15.7782 16.9504L14.364 18.3646L8 12.0007L14.364 5.63672L15.7782 7.05093L10.8284 12.0007Z"></path>`,
    ],
  },
  {
    name: 'right',
    attributes: {
      stroke: 'none',
    },
    vectors: [
      `<path d="M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z"></path>`,
    ],
  },
]
