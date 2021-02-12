const DASHBOARD_DOMAIN_NAME = process.env.NODE_ENV === 'production' ? 'https://dashboard.umile.xyz' : 'http://localhost:3000';

module.exports = {DASHBOARD_DOMAIN_NAME}