/**
 * Personal data in one place. Change a value here and every part of the site follows.
 * Visible interface text (tagline, role, bio) is translated in src/i18n/locales/*.ts.
 */
export const profile = {
  name: 'Diera Deffranova',
  behance: 'https://www.behance.net/dierasdeffranova',
  upwork: 'https://www.upwork.com/freelancers/~019c35afdd7fc97937',

  /**
   * Optional contact details. Empty values are hidden; fill them in and they appear
   * in the contact section, the menu and the email fallback of the request form.
   * email: 'you@domain.com'   telegram: 'https://t.me/your_handle'
   */
  email: '',
  telegram: '',

  firstName: 'Diera',
  lastName: 'Deffranova',
  experience: '2+',

  /** Behance numbers; labels are translated. */
  behanceStats: {
    views: '1,500+',
    appreciations: '500+',
    followers: '85',
  },

  /**
   * Optional endpoint for project requests (Formspree, Getform, your own API).
   * It receives a JSON POST. Leave empty and the form still validates and shows
   * the success state, but requests are not delivered anywhere.
   */
  formEndpoint: '',
} as const;
