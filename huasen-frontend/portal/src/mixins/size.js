export default {
  data() {
    return {
      _cpnWidth: 0,
      _cpnHeight: 0,
    };
  },

  mounted() {
    this._cpnObsever = new ResizeObserver(([entry]) => {
      let { width, height } = entry.contentRect;
      this._cpnWidth = width;
      this._cpnHeight = height;
    });
    this._cpnObsever.observe(this.$el);
  },

  destroyed() {
    if (this._cpnObsever) {
      this._cpnObsever.unobserve(this.$el);
    }
  },
};
