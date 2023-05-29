<script>
export default {
  inject: ["getInstall", "parentChildThis", "destroy"],
  props: {
    h: {
      type: Function,
      default: () => {},
    },
  },
  data() {
    return {
      ctx: null,
      render: null,
    };
  },
  created() {
    this.ctx = {
      attrs: this.$attrs,
      slots: this.$slots,
      emit: this.$emit,
    };
    if (this.getInstall) {
      this.render = this.h.bind(this.getInstall);
      if (this.parentChildThis) this.render = this.h.call(this.getInstall);
    } else this.render = this.h;
  },
  mounted() {
    if (this.getInstall && this.getInstall.__isRef)
      Object.assign(this.getInstall.$refs, this.$refs);
  },
  render(h) {
    return this.render(h, this.ctx);
  },
  beforeDestroy() {
    this.destroy && this.destroy();
  },
};
</script>
