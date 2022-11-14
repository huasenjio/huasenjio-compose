<!--
 * @Autor: huasenjio
 * @Date: 2021-11-27 22:38:22
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-20 01:08:51
 * @Description: 登陆面板
-->
<template>
  <HsDialog title="" :fullscreen="true" :show-close="false" :close-on-press-escape="false" :visible.sync="showWrapSign">
    <div class="sign shadow-md rounded-lg">
      <div class="banner">
        <img src="~@/assets/img/sign/default.svg" />
      </div>
      <div class="tab">
        <ul>
          <li>登陆后台管理系统</li>
        </ul>
        <div class="content">
          <span class="panel">
            <section class="login">
              <el-form :model="submitForm" :rules="rules" ref="loginForm" status-icon>
                <el-form-item prop="id">
                  <el-input v-model="submitForm.id" placeholder="请输入邮箱"> </el-input>
                </el-form-item>
                <el-form-item prop="password">
                  <el-input type="password" v-model="submitForm.password" :show-password="true" autocomplete="off" placeholder="请输入密码"></el-input>
                </el-form-item>
              </el-form>
              <div class="btn" @click="login">
                登 陆
              </div>
            </section>
          </span>
        </div>
      </div>
    </div>
  </HsDialog>
</template>
<script>
import { mapState, mapMutations } from 'vuex';
import { getElementFormValidator } from '@/plugin/strategy.js';
import HsDialog from '@/components/common/dialog/Dialog.vue';
export default {
  name: 'WrapSign',
  components: { HsDialog },
  data() {
    return {
      // 提交数据
      submitForm: {
        id: '',
        password: '',
      },

      // 校验的规则
      rules: {
        id: [{ validator: getElementFormValidator(['isNoEmpty::必填项', 'minLength:5::长度小于5', 'maxLength:20::长度大于20', 'isEmail::请输入邮箱']), trigger: 'blur' }],
        password: [{ validator: getElementFormValidator(['isNoEmpty::必填项', 'minLength:5::长度小于5', 'maxLength:20::长度大于20']), trigger: 'blur' }],
      },
    };
  },
  computed: {
    showWrapSign: {
      get() {
        return this.$store.state.showWrapSign;
      },
      set(value) {
        this.commitAll({
          showWrapSign: value,
        });
      },
    },
  },
  methods: {
    ...mapMutations(['commitAll']),
    // 登陆处理
    login() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.API.login(this.submitForm, {
            secret: true,
          }).then(res => {
            this.STORAGE.setItem(this.CONSTANT.localManage, res.data);
            // 关闭登陆面板
            this.commitAll({
              showWrapSign: false,
            });
            location.reload();
          });
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.sign {
  width: 350px;
  padding: 20px 20px 0 20px;
  margin: 0 auto;
  border: 1px solid var(--gray-100);
  .banner {
    img {
      width: 100%;
    }
  }
  .tab {
    ul {
      display: flex;
      justify-content: space-around;
      li {
        width: 70%;
        padding: 10px 0;
        text-align: center;
        font-size: 18px;
        font-weight: 700;
        border-bottom: 3px solid var(--red-500);
        cursor: pointer;
      }
    }
    .content {
      .panel {
        padding: 20px 10px;
      }
      .btn {
        border-radius: 28px;
        margin: 32px 0px 10px 0px;
        padding: 10px 5px;
        text-align: center;
        color: var(--gray-0);
        background-color: var(--red-500);
        box-sizing: border-box;
        cursor: pointer;
      }
      ::v-deep .el-form {
        .el-form-item__content {
          input {
            border-radius: 0;
            border: none;
            padding: 0;
            border-bottom: 1px solid var(--gray-400);
          }
        }
      }
    }
  }
}
</style>
