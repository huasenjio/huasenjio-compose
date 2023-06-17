<!--
 * @Autor: huasenjio
 * @Date: 2022-09-10 15:01:36
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-12-04 22:50:34
 * @Description: 右键调色面板
-->
<template>
  <div class="style-menu shadow-md animate__animated animate__fadeIn">
    <section class="menu-item">
      <div class="label">背景颜色</div>
      <div class="color-pick">
        <ul>
          <li v-for="(item, index) in backgroundColors" :key="index" @click="changeStyle(item, 'backgroundColor')" :style="{ backgroundColor: item }"></li>
        </ul>
        <el-color-picker class="picker" v-model="backgroundColor" @change="changeStyle($event, 'backgroundColor')" size="mini" show-alpha></el-color-picker>
      </div>
    </section>
    <section class="menu-item">
      <div class="label">字体颜色</div>
      <div class="color-pick">
        <ul>
          <li v-for="(item, index) in colors" :key="index" @click="changeStyle(item, 'color')" :style="{ backgroundColor: item }"></li>
        </ul>
        <el-color-picker class="picker" v-model="color" @change="changeStyle($event, 'color')" size="mini"></el-color-picker>
      </div>
    </section>
    <section>
      <button @click="reset" class="init" style="vertical-align:middle">
        <span>立即重置</span>
      </button>
      <button @click="resetAll" class="init init-all" style="vertical-align:middle">
        <span>重置全部</span>
      </button>
    </section>
  </div>
</template>
<script>
import { getStyleById, setStyleById, removeStyleById } from '@/plugin/style-store.js';
export default {
  name: 'StyleMenu',

  props: {
    xpath: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      // 显示值
      backgroundColor: '',
      color: '',

      // 色值
      backgroundColors: ['#9CA3AF', '#F87171', '#FBBF24', '#34D399', '#60A5FA', '#A78BFA', '#F472B6'],
      colors: ['#F9FAFB', '#F3F4F6', '#9CA3AF', '#6B7280', '#4B5563', '#1F2937', '#111827'],
    };
  },
  mounted() {
    this.initStyle();
  },
  methods: {
    changeStyle(val, tag) {
      this.$data[tag] = val;
      let style = getStyleById(this.xpath);
      style[tag] = val;
      setStyleById(this.xpath, style);
      this.$store.dispatch('snapshoot');
      this.$store.dispatch('initLocalStyleInfo');
    },

    initStyle() {
      let style = getStyleById(this.xpath);
      this.backgroundColor = style.backgroundColor;
      this.color = style.color;
    },

    reset() {
      removeStyleById(this.xpath);
      this.$store.dispatch('snapshoot');
      window.location.reload();
    },

    // 移除全部主题
    resetAll() {
      this.$store.commit('commitAll', {
        user: {
          config: {
            theme: {},
          },
        },
      });
      this.$store.dispatch('snapshoot');
      // 刷新页面，重新加载主题
      this.$tips('success', '清除配色主题成功', 'top-right', 2000, () => {
        window.location.reload();
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.style-menu {
  padding: 10px;
  border-radius: 4px;
  box-sizing: border-box;
  border: 1px solid var(--gray-100);
  background-color: var(--gray-0);
  .menu-item {
    .color-pick {
      display: flex;
      align-items: center;
      ul {
        display: flex;
        align-items: center;
        li {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          border: 1px solid var(--gray-200);
          margin-left: 8px;
          &:first-of-type {
            margin-left: 0;
          }
        }
      }
      .picker {
        margin-left: 8px;
      }
    }
  }
}

.init {
  display: inline-block;
  width: 100px;
  padding: 8px;
  border-radius: 4px;
  border: none;
  margin-top: 20px;
  text-align: center;
  font-size: 12px;
  vertical-align: middle;
  background-color: var(--blue-500);
  color: var(--gray-0);
  box-sizing: border-box;
  cursor: pointer;
}

.init span {
  position: relative;
  display: inline-block;
  transition: 0.4s;
}

.init span:after {
  content: '主题';
  position: absolute;
  opacity: 0;
  top: 0;
  right: -20px;
  transition: 0.6s;
}

.init:hover span {
  padding-right: 25px;
}

.init:hover span:after {
  opacity: 4;
  right: 0;
}

.init-all {
  margin-left: 10px;
  background-color: var(--red-400);
}
</style>
