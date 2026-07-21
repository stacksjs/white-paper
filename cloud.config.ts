export default {
  project: {
    name: 'Stacks Whitepaper',
    slug: 'white-paper',
    region: 'us-east-1',
  },

  cloud: {
    provider: 'hetzner',
    attachTo: 'stacks',
  },

  environments: {
    production: {
      type: 'production',
      domain: 'whitepaper.stacksjs.com',
    },
  },

  infrastructure: {
    compute: {
      mode: 'server',
      runtime: 'bun',
      proxy: {
        engine: 'rpx',
        onDemandTls: true,
        onDemandTlsEmail: 'hello@stacksjs.com',
      },
    },
    dns: {
      provider: 'route53',
      domain: 'stacksjs.com',
      hostedZoneId: 'Z01455702Q7952O6RCY37',
    },
  },

  sites: {
    whitepaper: {
      deploy: 'server',
      root: 'dist/.bunpress',
      path: '/',
      domain: 'whitepaper.stacksjs.com',
      build: 'bun run build',
      pathRewriteStyle: 'directory',
    },
  },
}
