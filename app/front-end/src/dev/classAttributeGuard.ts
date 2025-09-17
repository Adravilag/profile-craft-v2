// Dev-only guard: detect when an element receives a class that looks like an asset path
// This helps track down accidental uses of asset paths as class names (e.g. '/assets/svg/...')
// Only enabled in development by importing from the app entry point under `import.meta.env.DEV`.

function captureStack() {
  try {
    throw new Error('stack');
  } catch (e: any) {
    return e.stack;
  }
}

function logMatch(el: Element, attrValue: string) {
  const info = {
    message: 'Detected class attribute containing /assets/svg/ path',
    classValue: attrValue,
    element: el.outerHTML?.slice?.(0, 300) ?? String(el),
    stack: captureStack(),
    time: new Date().toISOString(),
  };
  // Use grouped logging for readability
  // eslint-disable-next-line no-console
  console.warn('[class-guard] ' + info.message, info);
}

export function installClassAttributeGuard() {
  if (typeof window === 'undefined') return;

  // Patch Element.prototype.setAttribute to detect class assignments
  const origSetAttribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (name: string, value: string) {
    try {
      if (name === 'class' && typeof value === 'string' && value.includes('/assets/svg/')) {
        logMatch(this as Element, value);
      }
    } catch (err) {
      // ignore
    }
    return origSetAttribute.call(this, name, value);
  };

  // Observe existing DOM for class attributes that already contain asset paths
  const checkNode = (node: Element) => {
    try {
      const cls = node.getAttribute && node.getAttribute('class');
      if (cls && cls.includes('/assets/svg/')) {
        logMatch(node, cls);
      }
    } catch (e) {
      // ignore
    }
  };

  // Initial scan
  try {
    document.querySelectorAll('*[class*="/assets/svg/"]').forEach(el => checkNode(el as Element));
  } catch (e) {
    // ignore
  }

  // MutationObserver to watch for future additions/changes
  const mo = new MutationObserver(mutations => {
    for (const m of mutations) {
      if (m.type === 'attributes' && m.attributeName === 'class' && m.target instanceof Element) {
        const cls = (m.target as Element).getAttribute('class');
        if (cls && cls.includes('/assets/svg/')) logMatch(m.target as Element, cls);
      }
      if (m.type === 'childList') {
        m.addedNodes.forEach(n => {
          if (n instanceof Element) {
            // check the added node and its subtree
            if (n.getAttribute && n.getAttribute('class')?.includes('/assets/svg/')) {
              logMatch(n, n.getAttribute('class') || '');
            }
            try {
              n.querySelectorAll &&
                n
                  .querySelectorAll('*[class*="/assets/svg/"]')
                  .forEach(el => checkNode(el as Element));
            } catch (e) {
              // ignore
            }
          }
        });
      }
    }
  });

  mo.observe(document.documentElement || document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class'],
  });

  // Also patch Element.className setter to catch direct assignments like el.className = '...'
  try {
    const descriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'className');
    if (descriptor && descriptor.set) {
      const origSetter = descriptor.set;
      Object.defineProperty(Element.prototype, 'className', {
        set: function (v) {
          try {
            if (typeof v === 'string' && v.includes('/assets/svg/')) {
              logMatch(this as Element, v);
            }
          } catch (e) {}
          return origSetter.call(this, v);
        },
        get: descriptor.get,
        configurable: true,
        enumerable: descriptor.enumerable,
      });
    }
  } catch (e) {
    // ignore
  }
}

export default installClassAttributeGuard;
