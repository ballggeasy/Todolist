module.exports = ({ env }) => ({
    // ...
    email: {
      config: {
        provider: 'sendgrid',
        providerOptions: {
          apiKey: env('SENDGRID_API_KEY'),
        },
        settings: {
          defaultFrom: ('SENDGRID_EMAIL_FROM'),
          defaultReplyTo: ('SENDGRID_EMAIL_TO'),
        },
      },
    },
    // ...
  });