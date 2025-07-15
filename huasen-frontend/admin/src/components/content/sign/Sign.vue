<!--
 * @Autor: huasenjio
 * @Date: 2021-11-27 22:38:22
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-20 01:08:51
 * @Description: 登录面板
-->
<template>
  <HsDialog title="" :fullscreen="true" :show-close="false" :close-on-press-escape="false" :visible="showSign">
    <div class="sign shadow-md rounded-lg">
      <div class="banner">
        <img src="~@/assets/img/sign/default.svg" />
      </div>
      <div class="tab">
        <ul>
          <li>{{ isExistManege ? '登录后台管理系统' : '请添加系统管理员' }}</li>
        </ul>
        <div class="content">
          <span class="panel">
            <section class="login">
              <el-form :model="submitForm" :rules="rules" ref="loginForm">
                <el-form-item class="form__id" prop="id">
                  <el-input v-model="submitForm.mail" @input="setId" placeholder="请输入邮箱">
                    <el-select v-model="submitForm.mailServer" @change="setId" slot="append">
                      <el-option v-for="(item, index) in mailOptions" :key="index" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                  </el-input>
                </el-form-item>
                <el-form-item class="form__password" prop="password">
                  <el-input type="password" v-model="submitForm.password" :show-password="true" autocomplete="off" placeholder="请输入密码" @keyup.enter.native="login"></el-input>
                </el-form-item>
              </el-form>
              <div class="btn" @click="login">{{ isExistManege ? '登 录' : '添 加' }}</div>
            </section>
          </span>
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
import HsDialog from '@/components/common/dialog/Dialog.vue';
export default {
  name: 'Sign',
  components: { HsDialog },
  data() {
    return {
      showSign: true,
      // 判断管理员是否存在
      isExistManege: false,
      // 提交数据
      submitForm: {
        id: '',
        password: '',
        mail: '',
        mailServer: '@qq.com',
      },

      // 校验的规则
      rules: {
        id: [{ validator: getElementFormValidator(['isNonEmpty::必填项', 'minLength:5::长度小于5', 'maxLength:20::长度大于20', 'isEmail::请输入邮箱']) }],
        password: [{ validator: getElementFormValidator(['isNonEmpty::必填项', 'minLength:5::长度小于5', 'maxLength:20::长度大于20']) }],
      },

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
  async created() {
    await this.existMange();
  },
  methods: {
    ...mapMutations(['commitAll']),

    /**
     * 判断管理员是否存在
     */
    async existMange() {
      const res = await this.API.user.exist({}, { notify: false });
      this.isExistManege = !!res.data;
    },

    /**
     * 设置邮箱地址
     */
    setId() {
      this.submitForm.id = this.submitForm.mail + this.submitForm.mailServer;
    },

    // 登录处理
    login() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          if (this.isExistManege) {
            this.API.user
              .login(this.submitForm, {
                secret: 'rsa',
              })
              .then(res => {
                this.STORAGE.setItem(this.CONSTANT.localManage, res.data);
                location.reload();
              });
          } else {
            this.$confirm('该操作将为系统初始化管理员，请务必确保输入信息的正确性，一旦初始化后将无法再次更改！', '添加系统管理员', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning',
            })
              .then(async () => {
                await this.API.user.init(this.submitForm, {
                  secret: 'rsa',
                });
                this.isExistManege = true;
              })
              .catch(error => {});
          }
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
