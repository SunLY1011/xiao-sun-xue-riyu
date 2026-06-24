/** 小程序内加载的正式学习页（须与微信公众平台「业务域名」一致） */
/** CACHE_VER 与仓库根目录 js/share-wechat.js 保持同步 */
const CACHE_VER = "403";
const ORIGIN = "https://saivenwang-byte.github.io/XiaoWangXueRiyu-v2";

module.exports = {
  H5_URL: `${ORIGIN}/index.html?v=${CACHE_VER}`,
  /** 自测满级（勿上架学员）：见 docs/测试卡-满级链接.md */
  H5_TEST_CARD_URL: `${ORIGIN}/index.html?v=${CACHE_VER}&testcard=1`,
  CACHE_VER,
};
