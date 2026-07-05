const { H5_URL, CACHE_VER } = require("../../config/h5-url.js");

const LOAD_TIMEOUT_MS = 20000;

function webViewUrl() {
  const base = String(H5_URL || "").trim();
  if (!base) return "";
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}_mp=${Date.now()}`;
}

Page({
  data: {
    url: "",
    loading: true,
    loadFailed: false,
    errorHint: "",
    h5UrlDisplay: String(H5_URL || "").trim(),
  },

  onLoad() {
    this._loadedCacheVer = CACHE_VER;
    this.reloadH5();
  },

  /** 改 h5-url / 重新编译后回到本页 → 自动拉最新 H5 */
  onShow() {
    if (this._loadedCacheVer !== CACHE_VER) {
      this._loadedCacheVer = CACHE_VER;
      this.reloadH5();
    }
  },

  onUnload() {
    this._clearLoadTimer();
  },

  _clearLoadTimer() {
    if (this._loadTimer) {
      clearTimeout(this._loadTimer);
      this._loadTimer = null;
    }
  },

  _armLoadTimer() {
    this._clearLoadTimer();
    this._loadTimer = setTimeout(() => {
      if (this.data.loading && !this.data.loadFailed) {
        this._failLoad(
          "加载超时。请确认已在微信公众平台配置业务域名 saivenwang-byte.github.io，并检查网络。"
        );
      }
    }, LOAD_TIMEOUT_MS);
  },

  _failLoad(hint) {
    this._clearLoadTimer();
    this.setData({
      url: "",
      loading: false,
      loadFailed: true,
      errorHint: hint || "请稍后重试。",
    });
  },

  onReloadTap() {
    this.reloadH5();
  },

  reloadH5(done) {
    const next = webViewUrl();
    if (!next) {
      this._failLoad("未配置学习页地址（config/h5-url.js）。");
      if (typeof done === "function") done();
      return;
    }
    this._clearLoadTimer();
    this.setData(
      {
        loadFailed: false,
        loading: true,
        errorHint: "",
        h5UrlDisplay: String(H5_URL || "").trim(),
      },
      () => {
        const apply = () => {
          this.setData({ url: next }, () => {
            this._armLoadTimer();
            if (typeof done === "function") done();
          });
        };
        if (this.data.url) {
          this.setData({ url: "" }, apply);
        } else {
          apply();
        }
      }
    );
  },

  onWebViewLoad() {
    this._clearLoadTimer();
    this.setData({ loading: false, loadFailed: false });
  },

  onWebViewError() {
    this._failLoad(
      "无法打开网页。请在 mp.weixin.qq.com → 开发设置 → 业务域名 添加：saivenwang-byte.github.io（并完成校验文件上传）。"
    );
  },

  onShareAppMessage() {
    return {
      title: "日语初级课后练习",
      path: "/pages/study/study",
    };
  },

  onShareTimeline() {
    return {
      title: "日语初级课后练习",
      query: CACHE_VER ? `v=${CACHE_VER}` : "",
    };
  },
});
