<!--
 * @Autor: huasenjio
 * @Date: 2022-01-19 00:38:51
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-05-26 00:33:07
 * @Description: 
-->
<template>
  <div class="site-manage">
    <TableList
      ref="tableList"
      :tableData="tableData"
      :tableMap="tableMap"
      :formMap="searchFormMap"
      :total="total"
      :showAdd="true"
      :showAddMany="true"
      :showSelection="true"
      :showRemoveMany="true"
      :showDetail="true"
      @edit="handleEdit"
      @add="handleAdd"
      @detail="handleDetail"
      @addMany="handleAddMany"
      @remove="handleRemove"
      @removeMany="handleRemoveMany"
      @search="queryData"
      @paginationChange="paginationChange"
      @updatePagination="updatePagination"
    ></TableList>
    <DialogForm
      v-if="show"
      ref="dialogForm"
      width="520"
      maxHeight="480"
      :title="mode == 'add' ? '添加网链' : '编辑网链'"
      :visible.sync="show"
      :formMap="formMap"
      :formData.sync="form"
      :formRule="rule"
      :close-on-click-modal="false"
      :mode="mode"
      :buttons="{ comfirm: '确 认', cancel: '取 消' }"
      footerExtraAlign="right"
      @onSelectChange="handleSelectChange"
      @comfirmForm="save"
      @cancelForm="cancel"
    >
      <template v-slot:tips>
        <div class="text text-gray-500">
          <i class="el-icon-warning-outline text-orange-400"></i>
          温馨提示：添加的<font class="text-red-400">网链</font>需要配置关联到<font class="text-red-400">栏目</font>后才会被加载显示
        </div>
      </template>
      <template v-slot:footer-extra>
        <el-button v-if="aiPluginAuthorized" type="warning" icon="el-icon-sugar" size="small" :disabled="!form.url" @click="openAiPlugin('site-form')" plain>
          AI 插件辅助
        </el-button>
      </template>
      <template v-slot:form-item-extra="{ formItem, formData }">
        <el-form-item v-if="formItem.type === 'icon'" :label="formItem.label" :prop="formItem.key">
          <div class="icon-group">
            <el-tabs v-model="activeName" type="border-card" @tab-click="handleTabClick">
              <el-tab-pane label="文字图标" name="text">
                <IconColorSelect :color.sync="iconColor"></IconColorSelect>
                <div>图标文字</div>
                <el-input placeholder="请输入文字" prefix-icon="el-icon-edit" v-model="iconText"> </el-input>
                <div>
                  图标效果
                  <el-tooltip slot="append" effect="dark" content="生成并存储图标后才会生效" placement="right">
                    <i class="el-icon-warning-outline"></i>
                  </el-tooltip>
                </div>
                <div class="result-view-container">
                  <IconResultContainer id="icon-text-target-container" :isTextMode="true" :color.sync="iconColor" :text="iconText"></IconResultContainer>
                </div>
              </el-tab-pane>
              <el-tab-pane label="上传图标" name="upload">
                <div>已选图标</div>
                <el-upload
                  :headers="headers"
                  :style="getUploadedStyle('icon')"
                  :action="getUploadAction('icon')"
                  :on-error="handleIconUploadError"
                  :on-success="handleIconUploadSuccess"
                  :show-file-list="false"
                  list-type="picture-card"
                >
                  <i class="el-icon-plus"></i>
                </el-upload>
              </el-tab-pane>
              <el-tab-pane v-if="showFindFaviconTab" label="推荐图标" name="query">
                <IconColorSelect :color.sync="iconImgModeColor"></IconColorSelect>
                <div>推荐图标</div>
                <ul class="favicon-group">
                  <li class="rounded" :class="{ select: selectFaviconIndex === index }" v-for="(item, index) in favicons" :key="index" @click="selectFavicon(index)">
                    <img class="w-full h-full" v-lazy="{ unload: unload }" :id="index" :src="item" alt="image" />
                  </li>
                </ul>
                <div>
                  图标效果
                  <el-tooltip slot="append" effect="dark" content="生成并存储图标后才会生效" placement="right">
                    <i class="el-icon-warning-outline"></i>
                  </el-tooltip>
                </div>
                <div v-if="faviconIconURL" class="result-view-container">
                  <IconResultContainer id="js-icon-img-target-container" :isTextMode="false" :color.sync="iconImgModeColor" :url="faviconIconURL"></IconResultContainer>
                </div>
              </el-tab-pane>
              <el-input class="mt-px-10" style="font-size: 12px" placeholder="图标地址" :disabled="!showUpload" v-model="formData[formItem.key]">
                <el-tooltip slot="append" effect="dark" :content="showUpload ? '从图标库中选择' : '生成并存储图标'" placement="top">
                  <el-button
                    class="create"
                    :icon="showUpload ? 'el-icon-files' : 'el-icon-document-add'"
                    :loading="iconGenerating && !showUpload"
                    :disabled="iconGenerating && !showUpload"
                    @click="handleCreateIconUrl"
                    >{{ showUpload ? '从图标库中选择' : '生成并存储图标' }}</el-button
                  >
                </el-tooltip>
              </el-input>
            </el-tabs>
          </div>
        </el-form-item>
      </template>
    </DialogForm>
    <DialogForm
      v-if="showImport"
      ref="dialogImportForm"
      width="420"
      height="fit-content"
      title="链接导入/出"
      :visible.sync="showImport"
      :formMap="importFormMap"
      :formData.sync="importForm"
      :formRule="importRule"
      :mode="importMode"
      :close-on-click-modal="false"
    >
      <template v-slot:form-item-extra="{ formItem, formData }">
        <el-form-item v-if="formItem.type === 'site-in-out-column' && formData.inoutType === 'export'" :label="formItem.label" :prop="formItem.key">
          <el-select v-model="formData[formItem.key]" :filterable="true" :multiple="true" :multiple-limit="10" :popper-append-to-body="false" placeholder="请选择">
            <el-option v-for="(item, index) in formItem.typeConfig.options" :key="index" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item v-if="formItem.type === 'site-in-out-code' && formData.inoutType === 'export'" :label="formItem.label" :prop="formItem.key">
          <el-select v-model="formData[formItem.key]" :filterable="true" :multiple="true" :multiple-limit="4" :popper-append-to-body="false" placeholder="请选择">
            <el-option v-for="(item, index) in CONSTANT.dictionary.code" :key="index" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>

        <div v-if="formItem.type === 'site-in-out-file'">
          <el-tabs :style="{ marginTop: formData.inoutType === 'export' ? '32px' : '0' }" v-model="formData.inoutType" type="border-card">
            <el-tab-pane name="import">
              <span slot="label"><i class="el-icon-top"></i> 导入</span>
              <el-upload
                ref="siteImportUpload"
                accept=".xlsx"
                :limit="1"
                :action="importSiteAction"
                :headers="headers"
                :on-exceed="handleSiteImportExceed"
                :on-error="handleSiteImportError"
                :on-success="handleSiteImportSuccess"
              >
                <div style="width: 348px; height: 80px" class="flex justify-center items-center border-dashed border border-gray-500 rounded">
                  <i class="el-icon-plus text-24px"></i>
                </div>
                <div class="text-gray-500 mt-px-10" @click.stop>
                  仅支持 .xlsx 文件，大小不超过 1MB，点击<font class="text-blue-500 pointer" @click="downloadSiteTemplate">下载模版</font>！
                </div>
              </el-upload>
            </el-tab-pane>
            <el-tab-pane name="export">
              <span slot="label"><i class="el-icon-download"></i>导出</span>
              <el-button type="primary" size="mini" icon="el-icon-plus" @click="exportSite(formData)">导出为 Excel 文件</el-button>
              <p class="text-gray-500 mt-px-10 leading-loose">tips：若选择栏目，则仅导出已选栏目下链接；若没有选择栏目，导出全部链接！</p>
            </el-tab-pane>
          </el-tabs>
        </div>
      </template>
    </DialogForm>
    <HDialog
      v-if="showDetail"
      ref="siteDetailRef"
      width="820"
      maxHeight="460"
      :title="`${LODASH.get(activeSite, 'name')}详情页`"
      :close-on-click-modal="false"
      :visible.sync="showDetail"
      :buttons="{ comfirm: '保 存' }"
      footerExtraAlign="right"
      @close="handleCancel"
      @comfirmDialog="handleSaveDetail"
    >
      <template v-slot:footer-extra>
        <el-button v-if="aiPluginAuthorized" type="warning" icon="el-icon-sugar" size="small" :disabled="!LODASH.get(activeSite, 'url')" @click="openAiPlugin('site-detail')" plain>
          AI 插件辅助
        </el-button>
      </template>
      <MarkdownEditor :value.sync="currentSiteDetail" :onImgAdd="handleImgAddUrl"></MarkdownEditor>
    </HDialog>

    <!-- AI 插件 -->
    <HDialog v-if="showAiPlugin" :visible.sync="showAiPlugin" width="620px" maxHeight="480px" title="AI 插件" @cancelDialog="showAiPlugin = false">
      <component
        :is="aiPluginComponent"
        v-if="aiPluginComponent"
        :ability-ids="aiPluginAbilityIds"
        :abilities="aiPluginAbilities"
        :form-data="aiPluginFormData"
        :form-options="{ siteColumn: columnOptions, siteTag: tagOptions, sitePin: pinOptions }"
        @ai-plugin:site-smart-fill="handleAiFill"
        @ai-plugin:site-find-similar="handleAiFill"
        @ai-plugin:site-detail-complete="handleAiFill"
        @ai-plugin:close="showAiPlugin = false"
      />
    </HDialog>

    <!-- 图标库 -->
    <HDialog title="图标库" :fullscreen="true" :visible="showIconLab" :buttons="{ cancel: '关 闭' }" @cancelDialog="closeIconLab" @close="closeIconLab">
      <el-row :gutter="20">
        <el-col :span="2" class="lab-icon-group" :class="{ 'select-active': form.icon === url }" v-for="(url, index) in icons" :key="`${url}-${index}`">
          <div :title="url" class="icon-item">
            <img v-lazy :src="url" :alt="url" />
            <i @click="handleSelectIcon(url)" title="选择" class="select-btn el-icon-success"></i>
            <el-popconfirm @confirm="handleRemoveIcon(url)" class="mr-px-10" popper-class="delete-popcomfirm" title="确定删除吗？">
              <i slot="reference" title="删除" class="remove-btn el-icon-delete-solid"></i>
            </el-popconfirm>
          </div>
        </el-col>
      </el-row>
    </HDialog>
  </div>
</template>

<script>
import { Validator, tool } from 'huasen-lib';
import html2canvas from 'html2canvas';
import { HDialog } from '@huasen/ui';
import { aiPluginMixin } from '@huasen/shared';
import TableList from '@/components/content/table-list/TableList.vue';
import DialogForm from '@/components/content/dialog-form/DialogForm.vue';
import MarkdownEditor from '@/components/content/markdown-editor/MarkdownEditor.vue';
import IconColorSelect from './IconColorSelect.vue';
import IconResultContainer from './IconResultContainer.vue';

import { downloadFileByUrl, downloadFileByBlob } from '@/network/request.js';

const validator = new Validator();
const getElementFormValidator = validator.getElementFormValidator.bind(validator);

export default {
  name: 'SiteManage',
  mixins: [aiPluginMixin],
  components: { HDialog, TableList, DialogForm, MarkdownEditor, IconColorSelect, IconResultContainer },
  data() {
    return {
      // 表格相关
      total: 0,
      tableData: [],
      tableMap: [
        {
          label: '网站名称',
          key: 'name',
        },
        {
          label: '网站链接',
          key: 'url',
        },
        {
          label: '网站描述',
          key: 'description',
        },
        {
          label: '网站图标',
          key: 'icon',
          width: 100,
        },
        {
          label: '访问量',
          key: 'pv',
          width: 64,
        },
        // {
        //   label: '备注',
        //   key: 'remarks',
        // },
        // {
        //   label: '拓展字段',
        //   key: 'expand',
        // },
        {
          label: '权限码',
          key: 'code',
        },
        {
          label: '是否可用',
          key: 'enabled',
        },
      ],

      searchFormMap: [
        {
          label: '名称',
          type: 'input',
          key: 'name',
          value: '',
          show: true,
        },
        {
          label: '链接',
          key: 'url',
          type: 'input',
          value: '',
          show: false,
        },
        {
          label: '描述',
          type: 'input',
          key: 'description',
          value: '',
          show: false,
        },
        {
          label: '备注',
          type: 'input',
          key: 'remarks',
          value: '',
          show: false,
        },
        {
          label: '标签',
          type: 'select',
          key: 'tag',
          value: undefined,
          show: true,
          typeConfig: {
            options: [],
          },
        },
        {
          label: '置顶标记',
          type: 'select',
          key: 'pin',
          value: undefined,
          typeConfig: {
            options: [],
          },
          show: false,
        },
        {
          label: '权限码',
          key: 'code',
          type: 'select',
          value: undefined,
          typeConfig: {
            options: this.CONSTANT.dictionary.code,
          },
          show: true,
        },
        {
          label: '是否可用',
          key: 'enabled',
          type: 'select',
          value: undefined,
          typeConfig: {
            options: [
              {
                label: '可用',
                value: true,
              },
              {
                label: '禁用',
                value: false,
              },
            ],
          },
          show: false,
        },
      ],
      show: false,
      showImport: false,
      showDetail: false,
      mode: 'add',
      importMode: 'add',
      formMap: [
        {
          label: '名称',
          key: 'name',
          type: 'input',
        },
        {
          label: '链接',
          key: 'url',
          type: 'input',
        },
        {
          label: '图标',
          key: 'icon',
          type: 'icon',
        },
        {
          label: '描述',
          key: 'description',
          type: 'input',
        },
        {
          label: '网站标签',
          key: 'siteTag',
          type: 'select',
          typeConfig: {
            options: [],
            'allow-create': true,
            filterable: true,
            multiple: true,
          },
        },
        {
          label: '置顶标记',
          key: 'sitePin',
          type: 'select',
          typeConfig: {
            options: [],
            'allow-create': true,
            filterable: true,
            multiple: true,
          },
        },
        {
          label: '所属栏目',
          key: 'siteColumn',
          type: 'select',
          typeConfig: {
            options: [],
            'allow-create': true,
            filterable: true,
            multiple: true,
          },
        },
        {
          label: '备注',
          key: 'remarks',
          type: 'input',
        },
        {
          label: '权限码',
          key: 'code',
          type: 'select',
          typeConfig: {
            options: this.CONSTANT.dictionary.code,
          },
        },
        {
          label: '是否可用',
          key: 'enabled',
          type: 'switch',
        },
      ],
      importFormMap: [
        {
          label: '所属栏目',
          key: 'siteColumn',
          type: 'site-in-out-column',
          typeConfig: {
            options: [],
            filterable: true,
            multiple: true,
          },
        },
        {
          label: '导出链接权限范围',
          key: 'code',
          type: 'site-in-out-code',
          typeConfig: {
            options: this.CONSTANT.dictionary.code,
            filterable: true,
            multiple: true,
          },
        },
        {
          label: '操作类型',
          key: 'inoutType',
          type: 'site-in-out-file',
        },
      ],
      rule: {
        name: [
          {
            validator: getElementFormValidator(['isNonEmpty::必填项', 'minLength:2::长度不能小于2', 'maxLength:20::长度不能大于20']),
          },
        ],
        url: [{ validator: getElementFormValidator(['isNonEmpty::必填项', 'isUrl::请输入正确的网址']) }],
        expand: [{ validator: getElementFormValidator(['isNonEmpty::必填项', 'isJSONObject::请输入JSON对象']) }],
      },
      importRule: {},
      form: {
        name: '',
        url: '',
        icon: '',
        description: '',
        remarks: '',
        expand: '{}',
        enabled: true,
        code: 0,
        siteTag: [],
        sitePin: [],
        siteColumn: [],
        detail: '',
      },
      importForm: {
        siteColumn: [],
        code: [],
        inoutType: 'import',
      },
      initForm: null,
      pageNo: 1,
      pageSize: 10,

      activeSite: {},
      currentSiteDetail: '',

      // 图标相关数据
      activeName: 'text',
      iconColor: '#fd4648',
      iconImgModeColor: 'transparent',
      iconText: '网站',
      favicons: [],
      selectFaviconIndex: 0,
      showIconLab: false,
      icons: [],
      showAiPlugin: false,
      aiPluginScene: 'site-form',
      unload: require('@/assets/img/error/image-error.png'),
      iconGenerating: false,
    };
  },

  computed: {
    aiPluginAbilityIds() {
      return this.aiPluginScene === 'site-detail' ? ['site-detail-complete'] : ['site-smart-fill', 'site-find-similar'];
    },
    aiPluginFormData() {
      if (this.aiPluginScene !== 'site-detail') return this.form;
      return Object.assign({}, this.activeSite || {}, {
        detail: this.currentSiteDetail,
      });
    },
    columnOptions() {
      return this.formMap.find(item => item.key === 'siteColumn').typeConfig.options;
    },
    tagOptions() {
      return this.formMap.find(item => item.key === 'siteTag').typeConfig.options;
    },
    pinOptions() {
      return this.formMap.find(item => item.key === 'sitePin').typeConfig.options;
    },
    headers() {
      return {
        token: this.$store.state.manage.token,
      };
    },
    importSiteAction() {
      return this.TOOL.getServerApi('/site/importSite');
    },
    // 图标相关计算属性
    faviconIconURL() {
      return this.favicons[this.selectFaviconIndex];
    },
    showUpload() {
      return this.activeName === 'upload';
    },
    showFindFaviconTab() {
      return this.form['url'];
    },
  },

  mounted() {
    // this.init()
  },

  activated() {
    this.init();
  },

  methods: {
    init() {
      this.queryData();
      this.refreshTagOptions();
      this.refreshPinOptions();
    },
    async queryData() {
      // 获取搜索表单数据
      let formData = this.$refs.tableList.getFormData();
      let params = Object.assign(
        {
          pageNo: this.pageNo,
          pageSize: this.pageSize,
        },
        formData,
      );
      // 请求站点数据
      this.API.site
        .findSiteByPage(params, {
          notify: false,
        })
        .then(res => {
          this.tableData = res.data.list;
          this.total = res.data.total;
          this.cancel();
        });
    },

    /**
     * 刷新标签选项
     */
    async refreshTagOptions() {
      try {
        const res = await this.API.tag.findByList({}, { notify: false });
        let targetSiteTagForEdit = this.formMap.find(item => item.key === 'siteTag');
        if (targetSiteTagForEdit) {
          targetSiteTagForEdit.typeConfig.options = [
            ...res.data.map(item => {
              return {
                label: item.name,
                value: item._id,
              };
            }),
          ];
        }
        // 更新搜索表单中的选项
        let targetSearchTag = this.searchFormMap.find(item => item.key === 'tag');
        if (targetSearchTag) {
          targetSearchTag.typeConfig.options = [
            ...res.data.map(item => {
              return {
                label: item.name,
                value: item._id,
              };
            }),
          ];
        }
      } catch (err) {
        this.$tips('error', '获取标签列表异常', 'top-right', 2000);
      }
    },

    /**
     * 刷新栏目选项
     */
    async refreshColumnOptions() {
      try {
        const res = await this.API.column.findColumnByList({}, { notify: false });
        let targetSiteColumnForEdit = this.formMap.find(item => item.key === 'siteColumn');
        if (targetSiteColumnForEdit) {
          targetSiteColumnForEdit.typeConfig.options = [
            ...res.data.map(item => {
              return {
                label: item.name,
                value: item._id,
              };
            }),
          ];
        }
        let targetSiteColumnForImport = this.importFormMap.find(item => item.key === 'siteColumn');
        if (targetSiteColumnForImport) {
          this.$set(targetSiteColumnForImport.typeConfig, 'options', [
            ...res.data.map(item => {
              return {
                label: item.name,
                value: item._id,
              };
            }),
          ]);
        }
      } catch (err) {
        this.$tips('error', '获取栏目列表异常', 'top-right', 2000);
      }
    },

    /**
     * 刷新标记选项
     */
    async refreshPinOptions() {
      try {
        const res = await this.API.pin.findByList({}, { notify: false });
        let targetSitePinForEdit = this.formMap.find(item => item.key === 'sitePin');
        if (targetSitePinForEdit) {
          targetSitePinForEdit.typeConfig.options = [
            ...res.data.map(item => {
              return {
                label: item.name,
                value: item._id,
              };
            }),
          ];
        }

        // 更新搜索表单中的选项
        let targetSearchPin = this.searchFormMap.find(item => item.key === 'pin');
        if (targetSearchPin) {
          this.$set(targetSearchPin.typeConfig, 'options', [
            ...res.data.map(item => {
              return {
                label: item.name,
                value: item._id,
              };
            }),
          ]);
        }
      } catch (err) {
        this.$tips('error', '获取标记列表异常', 'top-right', 2000);
      }
    },

    updatePagination(pageNo, pageSize) {
      this.pageNo = pageNo;
      this.pageSize = pageSize;
    },

    handleRemove(index, row) {
      this.API.site.removeSite({ _id: row._id }).then(res => {
        this.queryData();
      });
    },

    handleRemoveMany(list) {
      let _ids = list.map(item => item._id);
      this.API.site.removeManySite({ _ids }).then(res => {
        this.queryData();
      });
    },

    handleAdd() {
      this.show = true;
      this.mode = 'add';
      this.activeName = 'text';
      this.queryIcon();
      this.$nextTick(() => {
        this.initForm = this.LODASH.cloneDeep(this.form);
      });
    },

    handleDetail(index, row) {
      this.API.site
        .findSiteDetail({ _id: row._id }, { notify: false })
        .then(res => {
          this.activeSite = res.data;
          this.currentSiteDetail = this.LODASH.get(res.data, 'detail', '');
          this.$nextTick(() => {
            this.showDetail = true;
          });
        })
        .catch(err => {});
    },

    async handleAddMany() {
      await this.refreshColumnOptions();
      this.showImport = true;
    },

    async handleEdit(index, row) {
      // 打开编辑弹窗
      this.show = true;
      this.mode = 'edit';
      this.activeName = 'upload';
      this.queryIcon();

      let siteTag = [];
      let sitePin = [];
      let siteColumn = [];
      try {
        // 刷新网站标签的选项
        await this.refreshTagOptions();
        // 刷新网站标记的选项
        await this.refreshPinOptions();
        // 刷新网站栏目选项
        await this.refreshColumnOptions();

        // 查询站点绑定的标签
        const bindTags = await this.API.site.findSiteTagByList({ siteId: row._id }, { notify: false, loading: false });
        // 查询站点绑定的栏目
        const bindColumns = await this.API.site.findSiteColmunByList({ siteId: row._id }, { notify: false, loading: false });
        // 查询站点绑定的标记
        const bindPins = await this.API.site.findSitePinByList({ siteId: row._id }, { notify: false, loading: false });

        siteTag = (bindTags.data || []).map(item => item._id);
        siteColumn = (bindColumns.data || []).map(item => item._id);
        sitePin = (bindPins.data || []).map(item => item._id);

        // 编辑数据回显，保存编辑表单的初始值
        this.form = Object.assign(this.form, row, { siteTag, sitePin, siteColumn });
        this.initForm = this.LODASH.cloneDeep(this.form);
      } catch (err) {
        console.log(err);
        this.$tips('error', '初始化编辑数据异常', 'top-right', 2000);
      }
    },

    // 分页组件发生变化
    paginationChange() {
      this.queryData();
    },

    /**
     * 处理选择框变化，处理添加选项功能，然后刷新选项列表
     */
    async handleSelectChange(formKey, seleced) {
      if (formKey === 'siteColumn') {
        const columnNames = this.LODASH.difference(
          seleced,
          this.columnOptions.map(item => item.value),
        );
        if (columnNames.length) {
          this.API.column
            .addColumn({ column: [{ name: columnNames[0] }] }, { notify: false })
            .then(async res => {
              this.$tips('success', '添加栏目成功', 'top-right', 2000);
              await this.refreshColumnOptions();
              this.$nextTick(() => {
                seleced.splice(seleced.indexOf(columnNames[0]), 1, res.data[0]._id);
              });
            })
            .catch(err => {
              seleced.splice(seleced.indexOf(columnNames[0]), 1);
              return this.$tips('error', '添加栏目异常', 'top-right', 2000);
            });
        }
      } else if (formKey === 'sitePin') {
        const pinNames = this.LODASH.difference(
          seleced,
          this.pinOptions.map(item => item.value),
        );
        if (pinNames.length) {
          this.API.pin
            .addPin({ name: pinNames[0] }, { notify: false })
            .then(async res => {
              this.$tips('success', '添加标记成功', 'top-right', 2000);
              await this.refreshPinOptions();
              this.$nextTick(() => {
                seleced.splice(seleced.indexOf(pinNames[0]), 1, res.data[0]._id);
              });
            })
            .catch(err => {
              seleced.splice(seleced.indexOf(pinNames[0]), 1);
              return this.$tips('error', '添加标记异常', 'top-right', 2000);
            });
        }
      } else if (formKey === 'siteTag') {
        const tagNames = this.LODASH.difference(
          seleced,
          this.tagOptions.map(item => item.value),
        );
        if (tagNames.length) {
          this.API.tag
            .addTag({ name: tagNames[0] }, { notify: false })
            .then(async res => {
              this.$tips('success', '添加标签成功', 'top-right', 2000);
              await this.refreshTagOptions();
              this.$nextTick(() => {
                seleced.splice(seleced.indexOf(tagNames[0]), 1, res.data[0]._id);
              });
            })
            .catch(err => {
              seleced.splice(seleced.indexOf(tagNames[0]), 1);
              return this.$tips('error', '添加标签异常', 'top-right', 2000);
            });
        }
      }
    },

    async save(form) {
      let params = { ...this.form };

      const needUnbind = new Map(); // 原本有，现在无，即：需要解除绑定
      const needBind = new Map(); // 现在有，原本无，即：需要建立绑定

      // 借助lodash工具类，筛选出needUnbind、needBind的元素
      needUnbind.set('column', this.LODASH.difference(this.initForm.siteColumn, params.siteColumn));
      needBind.set('column', this.LODASH.difference(params.siteColumn, this.initForm.siteColumn));
      needUnbind.set('tag', this.LODASH.difference(this.initForm.siteTag, params.siteTag));
      needBind.set('tag', this.LODASH.difference(params.siteTag, this.initForm.siteTag));
      needUnbind.set('pin', this.LODASH.difference(this.initForm.sitePin, params.sitePin));
      needBind.set('pin', this.LODASH.difference(params.sitePin, this.initForm.sitePin));
      // 把map的内容，按对象格式，传递给后台
      params.site2Column = {
        unbind: needUnbind.get('column'),
        bind: needBind.get('column'),
      };
      params.site2Tag = {
        unbind: needUnbind.get('tag'),
        bind: needBind.get('tag'),
      };
      params.site2Pin = {
        unbind: needUnbind.get('pin'),
        bind: needBind.get('pin'),
      };
      // 添加、编辑站点数据
      if (this.mode === 'edit') {
        await this.API.site.updateSite(params);
      } else if (this.mode === 'add') {
        delete params._id;
        delete params._v;
        await this.API.site.addSite(params);
      }
      this.queryData();
    },

    cancel() {
      this.show = false;
      this.initForm = null;
    },

    /**
     * 取消或重置详情页
     */
    handleCancel() {
      this.showDetail = false;
      this.activeSite = null;
      this.currentSiteDetail = '';
    },

    /**
     * 保存详情页
     */
    handleSaveDetail() {
      this.API.site.updateSite({ _id: this.activeSite._id, detail: this.currentSiteDetail }, { notify: false }).then(res => {
        this.$tips('success', '网链详情页保存成功', 'top-right', 1200);
        this.activeSite.detail = this.currentSiteDetail;
        this.handleCancel();

        this.$nextTick(() => {
          this.queryData();
        });
      });
    },

    /**
     * 处理详情页图片上传
     * @param {*} index
     * @param {*} file
     */
    async handleImgAddUrl(index, file) {
      let formdata = new FormData();
      formdata.append('file', file);
      let result = await this.API.file.uploadFile(formdata, {
        url: '/file/upload?type=article',
      });
      this.$tips('success', '上传成功', 'top-right', 1200);
      // 返回url写入内容
      return location.origin + location.pathname + result.data[0].path;
    },

    // 模版导入成功之后，关闭面板
    handleSiteImportSuccess(result, file, fileList, type) {
      // 导入成功后，刷新数据，清空已选文件
      this.queryData();
      this.$tips('success', '链接导入成功', 'top-right', 2000, () => {
        if (this.$refs.siteImportUpload) {
          this.$refs.siteImportUpload.clearFiles();
        }
      });
    },

    // 链接导入失败
    handleSiteImportError() {
      this.$tips('error', '链接导入失败', 'top-right', 2000);
    },

    // 链接导入文件超过限制，并且清空已选文件
    handleSiteImportExceed() {
      this.$tips('error', '您上传文件数量已超过限制', 'top-right', 2000);
    },

    // 按栏目导出链接
    exportSite(data) {
      downloadFileByBlob('/site/exportSite', { codes: data.code, columns: data.siteColumn }, 'sites', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', () => {
        this.$tips('success', '链接导出成功', 'top-right', 2000);
      });
    },

    // 下载预置网站导入模版：/admin/file/site-template.xlsx
    downloadSiteTemplate() {
      downloadFileByUrl(window.location.origin + window.location.pathname + 'file/site-template.xlsx', '链接导入模版');
    },

    // 根据数据生成图片，存储到服务器，获取存储地址链接
    handleCreateIconUrl() {
      // 防止重复点击
      if (this.iconGenerating) return;

      let node;
      if (this.activeName === 'text') {
        node = document.getElementById('icon-text-target-container');
      } else if (this.activeName === 'query') {
        if (!this.faviconIconURL) {
          this.$tips('error', '未选择图标', 'top-right', 1200);
          return;
        } else {
          node = document.getElementById('js-icon-img-target-container');
        }
      } else if (this.activeName === 'upload') {
        this.showIconLab = true;
        return;
      }

      if (node) {
        this.iconGenerating = true;
        this.$nextTick(() => {
          html2canvas(node, {
            useCORS: true,
            logging: false,
            scale: window.devicePixelRatio <= 4 ? window.devicePixelRatio : 2,
          })
            .then(canvas => {
              canvas.toBlob(blob => {
                let file = new File([blob], 'favicon.png', { type: blob.type });
                let formdata = new FormData();
                formdata.append('file', file);
                this.API.file
                  .uploadFile(formdata, {
                    url: '/file/upload?type=icon',
                  })
                  .then(res => {
                    this.form['icon'] = res.data[0].path;
                    this.$tips('success', '图标上传成功', 'top-right', 1200);
                  })
                  .catch(() => {
                    this.$tips('error', '图标上传失败', 'top-right', 1200);
                  })
                  .finally(() => {
                    this.iconGenerating = false;
                  });
              });
            })
            .catch(() => {
              this.$tips('error', '图标生成失败', 'top-right', 1200);
              this.iconGenerating = false;
            });
        });
      }
    },

    // tab点击时
    handleTabClick(tabInfo) {
      this.favicons = [];
      if (tabInfo.name === 'query') {
        this.queryFaviconbyUrl();
      }
    },

    // 选择远程下载的图标
    selectFavicon(i) {
      this.selectFaviconIndex = i;
    },

    // 获取el-upload的上传地址
    getUploadAction(type) {
      return this.TOOL.getServerApi('/file/upload?type=' + type);
    },

    // 显示图片到el-upload中
    getUploadedStyle(type) {
      let iconUrl = this.form[type];
      const url = tool.getFullURL(iconUrl);
      return {
        '--icon': url ? `url(${url})` : '',
      };
    },

    // 图标上传成功
    handleIconUploadSuccess(result, file, fileList) {
      if (result.data.length !== 0) {
        this.form['icon'] = result.data[0].path;
      } else {
        this.$tips('error', '上传文件的链接已丢失', 'top-right', 1200);
      }
    },

    // 图标上传失败
    handleIconUploadError() {
      this.$tips('error', '上传失败', 'top-right', 1200);
    },

    // 请求图片地址
    queryFaviconbyUrl() {
      if (!this.form['url']) {
        this.$tips('error', '请输入网站地址', 'top-right', 1200);
        return;
      }
      this.API.site.findSiteFavicon({ url: this.form['url'] }, { notify: false }).then(res => {
        this.favicons = res.data;
      });
    },

    // 查询图标库
    queryIcon() {
      this.API.file.findAllIcon({}, { notify: false }).then(
        res => {
          this.icons = res.data;
        },
        { notify: false },
      );
    },

    // 选择图标库图标
    handleSelectIcon(url) {
      this.form.icon = url;
      this.closeIconLab();
    },

    // 删除图标
    handleRemoveIcon(path) {
      this.API.file
        .removeFile(
          { filePath: path },
          {
            notify: true,
          },
        )
        .then(res => {
          this.queryIcon();
        });
    },

    // 关闭图标库
    closeIconLab() {
      this.showIconLab = false;
    },

    async openAiPlugin(scene) {
      this.aiPluginScene = scene || 'site-form';
      await this.refreshAiPluginAbilities();
      this.showAiPlugin = true;
    },

    // AI 插件回调：填充表单数据
    handleAiFill({ abilityCode, data }) {
      if (abilityCode === 'site-find-similar') {
        if (data.sites && Array.isArray(data.sites) && data.sites.length > 0) {
          this.API.site
            .importSite({ sites: data.sites }, { notify: false, loading: false })
            .then(() => {
              this.$message.success('已添加 ' + data.sites.length + ' 个站点');
              this.queryData();
            })
            .catch(() => {
              this.$message.error('批量添加失败');
            });
        }
        return;
      }
      if (abilityCode === 'site-detail-complete') {
        if (data.detail) {
          this.currentSiteDetail = data.detail;
          this.$message.success('详情页内容已填充');
        }
        return;
      }
      if (abilityCode !== 'site-smart-fill') return;
      const fillableFields = ['name', 'url', 'description', 'icon', 'siteTag', 'sitePin', 'siteColumn'];
      fillableFields.forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          this.form[key] = ['siteTag', 'sitePin', 'siteColumn'].includes(key) ? (Array.isArray(data[key]) ? data[key] : []) : data[key];
        }
      });
      this.$message.success('站点信息已填充');
    },
  },
};
</script>

<style lang="scss" scoped>
.site-manage {
  width: 100%;
  height: 100%;
  padding: 10px 10px;

  ::v-deep .h-markdown-editor {
    width: 100%;
    height: 100%;
    margin: 0 auto;
    .markdown-editor {
      height: 430px;
    }
  }
}

// 图标相关样式
.icon-group {
  .favicon-group {
    display: flex;
    padding-bottom: 8px;
    overflow-x: auto;
    overflow-y: hidden;
    li {
      position: relative;
      width: 70px;
      height: 70px;
      padding: 2px;
      flex-shrink: 0;
      margin-left: 10px;
      border: 2px dashed var(--gray-400);
      overflow: hidden;
      cursor: pointer;

      &:first-of-type {
        margin-left: 0px;
      }
    }
    .select {
      border: 2px solid var(--blue-500);
      box-shadow: 0px 18px 20px -25px rgba(0, 0, 0, 0.45);
    }
  }
  .create {
    color: var(--gray-500);
  }
  .result-view-container {
    width: 70px;
    height: 70px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    border: 1px dashed var(--gray-400);
  }
  ::v-deep .el-upload--picture-card {
    width: 100%;
    height: 135px;
    background-image: var(--icon);
    background-size: contain;
    background-position: center center;
    background-repeat: no-repeat;
  }
}

.lab-icon-group {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  .icon-item {
    position: relative;
    width: 70px;
    height: 70px;
    border-radius: 6px;
    box-shadow: 0px 0px 20px -5px rgba(158, 158, 158, 0.2);
    transition: all 0.3s ease;
    overflow: hidden;
    cursor: pointer;

    .select-btn {
      left: 12px;
      &:hover {
        color: var(--green-400);
      }
    }
    .remove-btn {
      right: 12px;
      &:hover {
        color: var(--red-400);
      }
    }
    img {
      width: 100%;
      height: 100%;
    }
    i {
      display: none;
      position: absolute;
      top: 40%;
      font-size: 18px;
      color: var(--gray-100);
    }

    &::before {
      content: '';
      display: block;
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      background-color: var(--black-o1);
      transition: all 0.3s ease;
    }

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 26px 40px -24px var(--gray-800);
      &::before {
        background-color: var(--black-o6);
      }
      i {
        display: block;
      }
    }
  }
}

.select-active {
  .icon-item {
    i {
      display: block !important;
    }
    &::before {
      background-color: var(--black-o6) !important;
    }
  }
}
</style>
