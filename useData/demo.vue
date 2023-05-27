<script>
import { useData } from "@/useData.js";

export default {
  ...useData({ a: 333 }),
  ...useData({ b: 999 }),
  ...useData("xxx", { c: 1980 }),

  created() {
    setInterval((_) => {
      this.a++;
      this.b++;
      this.$xxx.c++;
    }, 1000);
  },

  render(h) {
    return (
      <div>
        {this.a} === {this.b} === {this.$xxx.c}
      </div>
    );
  },
};
</script>
