import {
  PoThemeColorAction,
  PoThemeColorCategorical,
  PoThemeColorFeedback,
  PoThemeColorNeutral,
  poThemeColorBrand
} from '../../interfaces/po-theme-color.interface';

/**
 * Define as cores de ação padrão para temas claros.
 */
const poThemeDefaultActions: PoThemeColorAction = {
  /** Cor padrão. */
  default: 'var(--color-brand-01-base)',
  /** Cor ao passar o mouse. */
  hover: 'var(--color-brand-01-dark)',
  /** Cor quando pressionado. */
  pressed: 'var(--color-brand-01-darker)',
  /** Cor quando desabilitado. */
  disabled: 'var(--color-neutral-light-30)',
  /** Cor ao focar. */
  focus: 'var(--color-brand-01-darkest)'
};

/**
 * Define as cores neutras padrão para temas claros.
 */
const poThemeDefaultNeutrals: PoThemeColorNeutral = {
  /** Tons de cinza claro. */
  light: {
    '00': '#ffffff',
    '05': '#fbfbfb',
    '10': '#eceeee',
    '20': '#dadedf',
    '30': '#b6bdbf'
  },
  /** Tons de cinza intermediários. */
  mid: {
    '40': '#9da7a9',
    '60': '#6e7c7f'
  },
  /** Tons de cinza escuro. */
  dark: {
    '70': '#4a5c60',
    '80': '#2c3739',
    '90': '#1d2426',
    '95': '#0b0e0e'
  }
};

/**
 * Define as cores de feedback padrão para temas claros.
 */
const poThemeDefaultFeedback: PoThemeColorFeedback = {
  /** Cores para feedback negativo. */
  negative: {
    lightest: '#f6e6e5',
    lighter: '#e3aeab',
    light: '#d58581',
    base: '#be3e37',
    dark: '#9b2d27',
    darker: '#72211d',
    darkest: '#4a1512'
  },
  /** Cores para feedback informativo. */
  info: {
    lightest: '#e3e9f7',
    lighter: '#b0c1e8',
    light: '#7996d7',
    base: '#23489f',
    dark: '#173782',
    darker: '#0f2557',
    darkest: '#081536'
  },
  /** Cores para feedback positivo. */
  positive: {
    lightest: '#def7ed',
    lighter: '#7ecead',
    light: '#41b483',
    base: '#107048',
    dark: '#0f5236',
    darker: '#083a25',
    darkest: '#002415'
  },
  /** Cores para feedback de aviso. */
  warning: {
    lightest: '#fcf6e3',
    lighter: '#f7dd97',
    light: '#f1cd6a',
    base: '#efba2a',
    dark: '#d8a20e',
    darker: '#705200',
    darkest: '#473400'
  }
};

/**
 * Define as cores da Brand padrão para temas claros.
 */
const poThemeDefaultBrands: poThemeColorBrand = {
  '01': {
    lightest: '#f2eaf6',
    lighter: '#d9c2e5',
    light: '#bd94d1',
    base: '#753399',
    dark: '#5b1c7d',
    darker: '#400e58',
    darkest: '#260538'
  },
  '02': {
    base: '#b92f72'
  },
  '03': {
    base: '#ffd464'
  }
};

const poThemeDefaultCategoricals: PoThemeColorCategorical = {
  '01': '#004CFF',
  '02': '#C25534',
  '03': '#792CC7',
  '04': '#008768',
  '05': '#D62793',
  '06': '#D44317',
  '07': '#4779A8',
  '08': '#AD6207'
};

const poThemeDefaultOverlayCategoricals: PoThemeColorCategorical = {
  '01': '#739CFD',
  '02': '#F6B5A1',
  '03': '#C6A8E6',
  '04': '#69CAB8',
  '05': '#F3AFD9',
  '06': '#FCA58B',
  '07': '#99BFE3',
  '08': '#E8B16E'
};

/**
 * Define estilos específicos por componente e onRoot para temas claros para AAA.
 */
const poThemeDefaultLightValues = {
  perComponent: {},
  onRoot: {
    /* CATEGORICAL COLORS */
    '--color-caption-categorical-01': '#004CFF',
    '--color-caption-categorical-02': '#C25534',
    '--color-caption-categorical-03': '#792CC7',
    '--color-caption-categorical-04': '#008768',
    '--color-caption-categorical-05': '#D62793',
    '--color-caption-categorical-06': '#D44317',
    '--color-caption-categorical-07': '#4779A8',
    '--color-caption-categorical-08': '#AD6207',
    /* CATEGORICAL OVERLAY COLORS */
    '--color-caption-categorical-overlay-01': '#739CFD',
    '--color-caption-categorical-overlay-02': '#F6B5A1',
    '--color-caption-categorical-overlay-03': '#C6A8E6',
    '--color-caption-categorical-overlay-04': '#69CAB8',
    '--color-caption-categorical-overlay-05': '#F3AFD9',
    '--color-caption-categorical-overlay-06': '#FCA58B',
    '--color-caption-categorical-overlay-07': '#99BFE3',
    '--color-caption-categorical-overlay-08': '#E8B16E'
  }
};

export {
  poThemeDefaultBrands,
  poThemeDefaultActions,
  poThemeDefaultFeedback,
  poThemeDefaultNeutrals,
  poThemeDefaultLightValues,
  poThemeDefaultCategoricals,
  poThemeDefaultOverlayCategoricals
};
