/**
 * 正式对外链接（微信人传人转发）
 * 改课后 push GitHub，约 1～2 分钟自动更新；链接域名不变。
 *
 * P0 语音加速：国内 Gitee/COS 请留空 HYOUGA_TTS_ORIGIN（与页面同源）。
 * 切换频道：python scripts/apply-deploy-target.py --channel gitee|cos|github
 * 手册：docs/国内发行-A-Gitee过渡-B-COS正式.md
 */
window.HYOUGA_PUBLIC_ORIGIN = "https://saivenwang-byte.github.io/XiaoWangXueRiyu-v2";

/** 语音包静态根（不含 /tts-cache/）；留空 = 与当前页面同源 */
window.HYOUGA_TTS_ORIGIN = "";

/** 国内镜像（GitHub 慢/失败时依次尝试）；与 docs/deploy-target.json gitee 一致 */
window.HYOUGA_TTS_MIRROR_ORIGINS = [
  "https://saivenwang-byte.gitee.io/xiao-wang-xue-riyu-v2",
];

/** 与 share-wechat.js CACHE_VER、tts-cache/sw-manifest.json 同步 */
window.HYOUGA_TTS_CACHE_VER = "410";
