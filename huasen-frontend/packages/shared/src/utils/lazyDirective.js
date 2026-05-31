/**
 * 创建图片懒加载指令
 * 调用方提供业务侧 loading/error 图片
 */
export function createLazyDirective({ loadImg, unloadImg }) {
  function prepareLazy(el, binding, vnode) {
    const options = binding.value || {};
    const unload = options.unload || unloadImg;
    const url = getLazySrc(el, vnode);
    const normalizedUrl = normalizeLazyUrl(url);
    const loadNormalizedUrl = normalizeLazyUrl(loadImg);
    const unloadNormalizedUrl = normalizeLazyUrl(unload);

    if (!url) {
      el.src = unload;
      el.dataset.loaded = 'false';
      el.dataset.lazyError = 'true';
      return;
    }

    if (normalizedUrl === loadNormalizedUrl || normalizedUrl === unloadNormalizedUrl) {
      return;
    }

    el.dataset.lazySrc = normalizedUrl;
    el.dataset.lazyLoading = 'false';
    el.dataset.loaded = 'false';
    el.dataset.lazyError = 'false';
    el.src = loadImg;
  }

  function handleLazy(el, binding, vnode) {
    const options = binding.value || {};
    const unload = options.unload || unloadImg;
    const url = getLazySrc(el, vnode);
    const oldUrl = el.dataset.lazySrc || '';
    const normalizedUrl = normalizeLazyUrl(url);
    const currentNormalizedUrl = normalizeLazyUrl(el.getAttribute('src') || el.src);
    const loadNormalizedUrl = normalizeLazyUrl(loadImg);
    const unloadNormalizedUrl = normalizeLazyUrl(unload);
    const isCurrentLoadingImg = currentNormalizedUrl === loadNormalizedUrl;
    const isCurrentUnloadImg = currentNormalizedUrl === unloadNormalizedUrl;

    if (!url) {
      clearLazy(el);
      el.src = unload;
      el.dataset.loaded = 'false';
      return;
    }

    if (normalizedUrl === loadNormalizedUrl || normalizedUrl === unloadNormalizedUrl) {
      return;
    }

    if (oldUrl === normalizedUrl && el.dataset.lazyLoading === 'true' && el._lazyImage) {
      return;
    }

    if (oldUrl === normalizedUrl && el._lazyObserver) {
      return;
    }

    if (oldUrl === normalizedUrl && el.dataset.loaded === 'true' && !isCurrentLoadingImg && !isCurrentUnloadImg) {
      return;
    }

    if (oldUrl === normalizedUrl && el.dataset.lazyError === 'true' && isCurrentUnloadImg) {
      return;
    }

    clearLazy(el);
    el.dataset.lazySrc = normalizedUrl;
    el.dataset.lazyLoading = 'false';
    el.dataset.loaded = 'false';
    el.dataset.lazyError = 'false';
    el.src = loadImg;
    el.isIconPatch = false;

    const load = () => {
      clearLazy(el);
      el.dataset.lazyLoading = 'true';
      preloadImage(
        url,
        function () {
          // 过期回调保护
          if (el.dataset.lazySrc !== normalizedUrl) return;
          el.src = url;
          el.dataset.lazyLoading = 'false';
          el.dataset.loaded = 'true';
          clearLazy(el);
        },
        function () {
          if (el.dataset.lazySrc !== normalizedUrl) return;
          if (options.iconPatch && !el.isIconPatch && options.siteUrl) {
            const domain = getDomainFromURL(options.siteUrl);
            if (domain) {
              const patchUrl = `https://favicon.im/${domain}?larger=true`;
              el.isIconPatch = true;
              preloadImage(
                patchUrl,
                function () {
                  if (el.dataset.lazySrc !== normalizedUrl) return;
                  el.src = patchUrl;
                  el.dataset.lazyLoading = 'false';
                  el.dataset.loaded = 'true';
                  clearLazy(el);
                },
                function () {
                  setUnload(el, unload);
                },
              );
              return;
            }
          }
          setUnload(el, unload);
        },
        el,
      );
    };

    if (!window.IntersectionObserver) {
      load();
      return;
    }

    if (isElementInViewport(el)) {
      load();
      return;
    }

    const observe = new IntersectionObserver(([{ isIntersecting }]) => {
      if (isIntersecting) {
        load();
      }
    });
    el._lazyObserver = observe;
    observe.observe(el);
  }

  return {
    bind: prepareLazy,
    inserted: handleLazy,
    componentUpdated: handleLazy,
    unbind: clearLazy,
  };
}

function getLazySrc(el, vnode) {
  const attrs = (vnode && vnode.data && vnode.data.attrs) || {};
  const domProps = (vnode && vnode.data && vnode.data.domProps) || {};
  return attrs.src || domProps.src || el.getAttribute('src') || '';
}

function preloadImage(url, onload, onerror, el) {
  const image = new Image();
  if (el) {
    el._lazyImage = image;
  }
  image.onload = onload;
  image.onerror = onerror;
  image.src = url;
}

function setUnload(el, unload) {
  clearLazy(el);
  el.src = unload;
  el.dataset.lazyLoading = 'false';
  el.dataset.loaded = 'false';
  el.dataset.lazyError = 'true';
}

function clearLazy(el) {
  if (el._lazyObserver) {
    el._lazyObserver.unobserve(el);
    el._lazyObserver.disconnect();
    el._lazyObserver = null;
  }
  if (el._lazyImage) {
    el._lazyImage.onload = null;
    el._lazyImage.onerror = null;
    el._lazyImage = null;
  }
  el.onload = null;
  el.onerror = null;
}

function normalizeLazyUrl(url) {
  if (!url) return '';
  try {
    return new URL(url, window.location.href).href;
  } catch (error) {
    return url;
  }
}

function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  return rect.width > 0 && rect.height > 0 && rect.bottom >= 0 && rect.right >= 0 && rect.top <= viewportHeight && rect.left <= viewportWidth;
}

function getDomainFromURL(urlString) {
  try {
    const url = new URL(urlString);
    return url.hostname;
  } catch (error) {
    console.error('Invalid URL:', error);
    return null;
  }
}
