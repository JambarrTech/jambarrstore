/** Shared Tailwind theme for jambarrstore */
const theme = {
  colors: {
    brand: {
      DEFAULT: '#E85D04',
      dark: '#B34503',
      soft: '#FFF0E3',
    },
    ink: {
      DEFAULT: '#171310',
      soft: '#4A423C',
      muted: '#857A71',
    },
    sand: '#FAF7F2',
    line: '#EAE2D8',
    leaf: '#0F6B54',
    berry: '#B3123C',
  },
  fontFamily: {
    sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
  },
  boxShadow: {
    card: '0 1px 2px rgba(23,19,16,0.04), 0 8px 24px -12px rgba(23,19,16,0.18)',
    device: '0 40px 80px -30px rgba(23,19,16,0.45)',
  },
};

export default theme;
