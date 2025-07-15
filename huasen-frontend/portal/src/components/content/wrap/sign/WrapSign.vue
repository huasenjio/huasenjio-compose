<!--
 * @Autor: huasenjio
 * @Date: 2021-11-27 22:38:22
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-22 17:48:51
 * @Description: 登录面板
-->
<template>
  <HsDialog :title="'登录注册'" :fullscreen="true" :visible.sync="showWrapSign" @close="closeSignPanel" @closeDialog="closeSignPanel">
    <div class="sign shadow-md rounded-lg">
      <div class="banner">
        <img src="~@/assets/img/sign/default.svg" />
      </div>
      <div class="tab">
        <ul>
          <li :class="{ active: activeIndex == 0 }" @click="handleSelectTab(0)">
            登录
          </li>
          <li :class="{ active: activeIndex == 1 }" @click="handleSelectTab(1)">
            {{ isGetBackPassword ? '重置密码' : '注 册' }}
          </li>
        </ul>
        <div class="content">
          <!-- 登录 -->
          <span class="panel" v-show="0 == activeIndex">
            <section class="login">
              <el-form :model="submitForm" :rules="rules" ref="loginForm">
                <el-form-item class="form__id" prop="id">
                  <el-input v-model="submitForm.mail" @input="setId" placeholder="请输入邮箱地址">
                    <el-select v-model="submitForm.mailServer" @change="setId" slot="append">
                      <el-option v-for="(item, index) in mailOptions" :key="index" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                  </el-input>
                </el-form-item>
                <el-form-item class="form__password" prop="password">
                  <el-input
                    type="password"
                    v-model="submitForm.password"
                    :show-password="true"
                    autocomplete="off"
                    placeholder="密码仅支持数字/字母/下划线"
                    @keyup.enter.native="login"
                  ></el-input>
                </el-form-item>
              </el-form>
              <div class="btn" @click="login">
                登 录
              </div>
            </section>
          </span>
          <!-- 注册 -->
          <span class="panel" v-show="1 == activeIndex">
            <section class="register">
              <el-form :model="submitForm" :rules="rules" ref="registerForm">
                <el-form-item class="form__id" prop="id">
                  <el-input v-model="submitForm.mail" @input="setId" placeholder="请输入邮箱地址">
                    <el-select v-model="submitForm.mailServer" @change="setId" slot="append">
                      <el-option v-for="(item, index) in mailOptions" :key="index" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                  </el-input>
                </el-form-item>
                <el-form-item class="form__password" prop="password">
                  <el-input type="password" v-model="submitForm.password" :show-password="true" autocomplete="off" placeholder="密码仅支持数字/字母/下划线"></el-input>
                </el-form-item>
                <el-form-item class="form__mail-code" prop="mailCode">
                  <div class="mail-code-group">
                    <div class="code">
                      <el-input v-model="submitForm.mailCode" placeholder="请输入邮箱验证码" @keyup.enter.native="register"> </el-input>
                    </div>
                    <div class="send" ref="codeButtom" @click="sendMailCode">点击发送</div>
                  </div>
                </el-form-item>
              </el-form>
              <div class="btn" @click="register">
                {{ isGetBackPassword ? '确定' : '注 册' }}
              </div>
            </section>
          </span>
          <!-- 忘记密码 -->
          <div class="relative -top-px-28 text-right mt-px-8 px-px-4 flex justify-between">
            <el-tooltip effect="dark" content="暂无协议（最终解释权归网站所有）" placement="top">
              <el-checkbox v-model="submitForm.agree" label="is">
                同意用户协议
              </el-checkbox>
            </el-tooltip>
            <span class="text-gray-400 pointer" @click="handleGetBack">忘记密码？</span>
          </div>
        </div>
      </div>
    </div>
  </HsDialog>
</template>
<script>
import { mapState, mapMutations } from 'vuex';
import { Validator } from 'huasen-lib';
const validator = new Validator();
const getElementFormValidator = validator.getElementFormValidator.bind(validator);

import HsDialog from '@/components/content/dialog/Dialog.vue';
export default {
  name: 'WrapSign',
  components: { HsDialog },
  data() {
    return {
      // 提交数据
      submitForm: {
        id: '',
        password: '',
        mailCode: '',
        mail: '',
        mailServer: '@qq.com',
        agree: '',
      },

      // 校验的规则
      rules: {
        id: [{ validator: getElementFormValidator(['isNonEmpty::必填项', 'minLength:5::长度小于5', 'maxLength:50::长度大于50', 'isEmail::请输入邮箱']) }],
        password: [{ validator: getElementFormValidator(['isNonEmpty::必填项', 'minLength:5::长度小于5', 'maxLength:20::长度大于20']) }],
        mailCode: [{ validator: getElementFormValidator(['isNonEmpty::必填项', 'isInteger::请输入数字']) }],
      },

      // 状态变量
      activeIndex: 0,
      count: 60, // 倒计时秒数
      timer: null, // 定时器
      timerSwitch: true, // 可用开关
      isGetBackPassword: false, // 是否是找回密码
      // 邮箱选项
      mailOptions: [
        {
          label: '@qq.com',
          value: '@qq.com',
        },
        {
          label: '@163.com',
          value: '@163.com',
        },
        {
          label: '@gmail.com',
          value: '@gmail.com',
        },
        {
          label: '@139.com',
          value: '@139.com',
        },
        {
          label: '@126.com',
          value: '@126.com',
        },
        {
          label: '@outlook.com',
          value: '@outlook.com',
        },
        {
          label: '自定义邮箱',
          value: '',
        },
      ],
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

    /**
     * 切换tab
     */
    handleSelectTab(index) {
      if (index === 1 && this.isGetBackPassword) return;
      this.isGetBackPassword = false;
      this.activeIndex = index;
    },

    /**
     * 找回密码
     */
    handleGetBack() {
      this.isGetBackPassword = true;
      this.activeIndex = 1;
    },

    /**
     * 设置邮箱地址
     */
    setId() {
      this.submitForm.id = this.submitForm.mail + this.submitForm.mailServer;
    },

    // 关闭登录面板
    closeSignPanel() {
      this.commitAll({
        showWrapSign: false,
      });
    },

    // 发送邮箱验证码
    sendMailCode() {
      if (!this.submitForm.agree) {
        this.$tips('warning', '请先同意用户协议', 'top-right', 2000);
        return;
      }
      this.$refs.registerForm.validateField('id', valid => {
        if (!valid) {
          if (!this.timerSwitch == true) {
            this.$tips('warning', '请耐心等待验证码', 'top-right', 2000);
            return;
          }
          // 发送邮箱验证码
          this.API.Mail.getMailCode(
            {
              mail: this.submitForm.id,
            },
            {
              secret: true,
            },
          );
          // 无论是否发送成功均打开定时器
          this.timer = setInterval(() => {
            if (this.count >= 0) {
              this.$refs.codeButtom.innerText = --this.count; // 倒秒效果
            } else {
              clearInterval(this.timer); // 达到秒速停止定时器
              // 修改定时器初始参数
              this.count = 60;
              this.timerSwitch = true;
              this.$refs.codeButtom.innerText = '点击发送';
            }
          }, 1000);
          // 设置定时器为不可用
          this.timerSwitch = false;
        }
      });
    },

    // 登录处理
    login() {
      if (!this.submitForm.agree) {
        this.$tips('warning', '请先同意用户协议', 'top-right', 2000);
        return;
      }
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.$confirm('登录账号将会清空本地数据（如：自定义网站、墙纸等）并拉取云端数据，请合理备份数据，避免数据丢失。您是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          })
            .then(() => {
              let params = {
                id: this.submitForm.id,
                password: this.submitForm.password,
              };
              this.API.User.login(params, {
                notify: true,
                secret: 'aesinrsa',
              }).then(res => {
                // 用户数据本地持久化
                this.STORAGE.setItem(this.CONSTANT.localUser, res.data);
                location.reload();
              });
            })
            .catch(() => {});
        }
      });
    },

    // 注册和重置
    register() {
      if (!this.submitForm.agree) {
        this.$tips('warning', '请先同意用户协议', 'top-right', 2000);
        return;
      }
      this.$refs.registerForm.validate(valid => {
        if (valid) {
          let params = {
            id: this.submitForm.id,
            password: this.submitForm.password,
            mailCode: this.submitForm.mailCode,
          };
          if (!this.isGetBackPassword) {
            // 注册
            this.API.User.register(params, {
              secret: 'aesinrsa',
            }).then(res => {
              this.activeIndex = 0;
            });
          } else {
            // 重置密码
            this.API.User.updatePassword(params, { secret: 'aesinrsa' }).then(res => {
              this.activeIndex = 0;
            });
          }
        }
      });
    },
  },

  destroyed() {
    clearInterval(this.timer); // 防止页面刷新之后定时任务仍在继续
  },
};
</script>

<style lang="scss" scoped>
.sign {
  width: 360px;
  padding: 20px 20px 0 20px;
  margin: 0 auto;
  border: 1px solid var(--gray-100);
  box-sizing: border-box;
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
        width: 50%;
        padding: 10px 0;
        text-align: center;
        border-bottom: 3px solid var(--gray-0);
        cursor: pointer;
      }
      .active {
        border-bottom: 3px solid var(--red-500);
      }
    }
    .content {
      .panel {
        padding: 20px 10px;
        box-sizing: border-box;
        .register {
          .mail-code-group {
            display: flex;
            align-items: center;
            .code {
              width: calc(100% - 80px - 16px);
            }
            .send {
              width: 80px;
              margin-left: 16px;
              display: flex;
              justify-content: center;
              align-items: center;
              border-bottom: 3px solid var(--red-500);
              cursor: pointer;
            }
          }
        }
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
    }
  }
}
</style>

<style lang="scss">
.sign {
  .el-form {
    .el-form-item {
      &.form__id {
        .el-input {
          width: 100%;
          .el-input-group__append {
            .el-select {
              width: 148px;
            }
          }
        }
      }
      &.form__password {
      }
    }
  }
}
</style>
