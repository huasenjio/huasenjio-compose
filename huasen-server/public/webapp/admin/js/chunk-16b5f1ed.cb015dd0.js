(window.webpackJsonp=window.webpackJsonp||[]).push([["chunk-16b5f1ed"],{"2b19":function(e,t,n){"use strict";n.r(t);var a=n("1da1"),o=(n("96cf"),n("b2d8")),r=(n("64e1"),{name:"MarkdownEditor",data:function(){return{toolbars:{bold:!0,italic:!0,header:!0,underline:!0,mark:!1,superscript:!1,quote:!0,ol:!0,link:!0,imagelink:!1,help:!1,code:!0,subfield:!0,fullscreen:!0,readmodel:!1,undo:!0,shortCut:!1,trash:!0,autofocus:!1,save:!0,navigation:!1},prop:{subfield:!0,defaultOpen:"preview",editable:!1,toolbarsFlag:!1,scrollStyle:!0}}},props:{value:{type:String,default:function(){return""}},onImgAdd:{type:Function,default:function(){}}},computed:{valueCP:{get:function(){return this.value},set:function(e){this.$emit("update:value",e)}}},components:{mavonEditor:o.mavonEditor},methods:{save:function(e,t){this.$emit("doSave")},change:function(){this.$emit("change")},handleImgAdd:function(e,t){var n=this;return Object(a.a)(regeneratorRuntime.mark((function a(){var o;return regeneratorRuntime.wrap((function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,n.onImgAdd(e,t);case 2:o=a.sent,n.$refs.mavonEditor.$img2Url(e,o);case 4:case"end":return a.stop()}}),a)})))()}}}),i=(n("acef"),n("2877")),s=Object(i.a)(r,(function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"h-markdown-editor"},[n("mavon-editor",{ref:"mavonEditor",staticClass:"markdown-editor",attrs:{toolbars:this.toolbars,scrollStyle:!0,transition:!0,placeholder:"开始记录点滴...",editable:!0,ishljs:!0,tabSize:2},on:{save:e.save,change:e.change,imgAdd:e.handleImgAdd},model:{value:e.valueCP,callback:function(t){e.valueCP=t},expression:"valueCP"}})],1)}),[],!1,null,"61ef16b5",null);t.default=s.exports},acef:function(e,t,n){"use strict";n("bb10")},bb10:function(e,t,n){}}]);