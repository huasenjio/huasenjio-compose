export default {
  data() {
    return {
      _onResizeHook: null,
    };
  },

  mounted() {
    if (this._resizeHook) {
      this._onResizeHook = this.LODASH.debounce(this._resizeHook, 200);
      window.addEventListener('resize', this._onResizeHook);
      let event = new Event('resize', { bubbles: true, cancelable: false });
      document.dispatchEvent(event);
    }
  },

  destroyed() {
    if (this._onResizeHook) {
      window.removeEventListener('resize', this._onResizeHook);
    }
  },

  methods: {
    // 引用组件需要方法重写
    _resizeHook(e) {},
  },
};
