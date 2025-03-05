
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 0,
    "redirectTo": "/auth",
    "route": "/"
  },
  {
    "renderMode": 0,
    "redirectTo": "/auth/login",
    "route": "/auth"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-LTX3BEY3.js",
      "chunk-AT4CX56Z.js",
      "chunk-ACTGEGDR.js",
      "chunk-X5YLR3NI.js",
      "chunk-I3XKZ46R.js",
      "chunk-JRCFCQI6.js",
      "chunk-M7WHMGKP.js"
    ],
    "route": "/auth/login"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-B4ZRHIM6.js",
      "chunk-AT4CX56Z.js",
      "chunk-ACTGEGDR.js",
      "chunk-X5YLR3NI.js",
      "chunk-KIPILDK7.js",
      "chunk-I3XKZ46R.js",
      "chunk-JRCFCQI6.js",
      "chunk-M7WHMGKP.js"
    ],
    "route": "/auth/registro"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-QDB2TUKS.js",
      "chunk-FDZTNL54.js",
      "chunk-AT4CX56Z.js",
      "chunk-ACTGEGDR.js",
      "chunk-X5YLR3NI.js",
      "chunk-JRCFCQI6.js",
      "chunk-M7WHMGKP.js"
    ],
    "route": "/auth/recuperar-senha"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-V65MPANU.js",
      "chunk-FDZTNL54.js",
      "chunk-AT4CX56Z.js",
      "chunk-ACTGEGDR.js",
      "chunk-X5YLR3NI.js",
      "chunk-JRCFCQI6.js",
      "chunk-M7WHMGKP.js"
    ],
    "route": "/auth/nova-senha"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-BPLDW4Q6.js",
      "chunk-F2CCDYMQ.js",
      "chunk-ACTGEGDR.js",
      "chunk-X5YLR3NI.js",
      "chunk-UEO2IPRT.js",
      "chunk-M7WHMGKP.js"
    ],
    "route": "/contador"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-BPLDW4Q6.js",
      "chunk-F2CCDYMQ.js",
      "chunk-ACTGEGDR.js",
      "chunk-X5YLR3NI.js",
      "chunk-UEO2IPRT.js",
      "chunk-M7WHMGKP.js",
      "chunk-WUT322VX.js",
      "chunk-UH3LNN65.js",
      "chunk-KIPILDK7.js",
      "chunk-I3XKZ46R.js"
    ],
    "route": "/contador/dashboard"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-HAN4QL6F.js",
      "chunk-F2CCDYMQ.js",
      "chunk-AT4CX56Z.js",
      "chunk-ACTGEGDR.js",
      "chunk-X5YLR3NI.js",
      "chunk-UH3LNN65.js",
      "chunk-UEO2IPRT.js",
      "chunk-KIPILDK7.js",
      "chunk-I3XKZ46R.js",
      "chunk-JRCFCQI6.js"
    ],
    "route": "/cliente"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-HAN4QL6F.js",
      "chunk-F2CCDYMQ.js",
      "chunk-AT4CX56Z.js",
      "chunk-ACTGEGDR.js",
      "chunk-X5YLR3NI.js",
      "chunk-UH3LNN65.js",
      "chunk-UEO2IPRT.js",
      "chunk-KIPILDK7.js",
      "chunk-I3XKZ46R.js",
      "chunk-JRCFCQI6.js"
    ],
    "route": "/cliente/documentos"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-HAN4QL6F.js",
      "chunk-F2CCDYMQ.js",
      "chunk-AT4CX56Z.js",
      "chunk-ACTGEGDR.js",
      "chunk-X5YLR3NI.js",
      "chunk-UH3LNN65.js",
      "chunk-UEO2IPRT.js",
      "chunk-KIPILDK7.js",
      "chunk-I3XKZ46R.js",
      "chunk-JRCFCQI6.js"
    ],
    "route": "/cliente/dashboard"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-HAN4QL6F.js",
      "chunk-F2CCDYMQ.js",
      "chunk-AT4CX56Z.js",
      "chunk-ACTGEGDR.js",
      "chunk-X5YLR3NI.js",
      "chunk-UH3LNN65.js",
      "chunk-UEO2IPRT.js",
      "chunk-KIPILDK7.js",
      "chunk-I3XKZ46R.js",
      "chunk-JRCFCQI6.js"
    ],
    "route": "/cliente/plantoes"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-HAN4QL6F.js",
      "chunk-F2CCDYMQ.js",
      "chunk-AT4CX56Z.js",
      "chunk-ACTGEGDR.js",
      "chunk-X5YLR3NI.js",
      "chunk-UH3LNN65.js",
      "chunk-UEO2IPRT.js",
      "chunk-KIPILDK7.js",
      "chunk-I3XKZ46R.js",
      "chunk-JRCFCQI6.js"
    ],
    "route": "/cliente/plantoes/registrar"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-HAN4QL6F.js",
      "chunk-F2CCDYMQ.js",
      "chunk-AT4CX56Z.js",
      "chunk-ACTGEGDR.js",
      "chunk-X5YLR3NI.js",
      "chunk-UH3LNN65.js",
      "chunk-UEO2IPRT.js",
      "chunk-KIPILDK7.js",
      "chunk-I3XKZ46R.js",
      "chunk-JRCFCQI6.js"
    ],
    "route": "/cliente/plantoes/detalhes/*"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-HAN4QL6F.js",
      "chunk-F2CCDYMQ.js",
      "chunk-AT4CX56Z.js",
      "chunk-ACTGEGDR.js",
      "chunk-X5YLR3NI.js",
      "chunk-UH3LNN65.js",
      "chunk-UEO2IPRT.js",
      "chunk-KIPILDK7.js",
      "chunk-I3XKZ46R.js",
      "chunk-JRCFCQI6.js"
    ],
    "route": "/cliente/plantoes/calendario"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 2710, hash: 'a57d18644109d1d09b3e5ed1ee122fa5e2dc701d25c8d3a7c521b65b91f6fd47', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1548, hash: 'ab503222cad699310fa95c8856be074ce53a7e7b8ecc8d055f490faef8243b9f', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-34PLNYMS.css': {size: 599245, hash: 'W6SwO5LfVx8', text: () => import('./assets-chunks/styles-34PLNYMS_css.mjs').then(m => m.default)}
  },
};
