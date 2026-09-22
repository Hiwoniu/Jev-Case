# JEV Case

收集全网优秀 JEV / TypeSafe case 的收藏库 | A curated collection of excellent JEV / TypeSafe cases from across the web.

JEV Case 将 X 上公开分享的 JEV / TypeSafe 案例整理成可搜索、可筛选的静态案例墙。项目保留原帖入口、作者信息、互动指标、中文参考、引用关系与外部链接，方便集中浏览社区正在用 JEV 构建什么。

> 非官方社区项目，与 JEV / TypeSafe 无隶属关系。推文、视频、账号信息、封面和商标权利归原作者及原平台所有。

## Features

- 202 条社区案例，支持热门、最新、视频优先、外链优先排序
- 按中文内容、引用帖和外链进行筛选
- 搜索作者、原文、译文、标签、提及和链接域名
- 案例详情页展示原帖、中文参考、互动指标、引用及转载关系
- 视频进入视口后自动预览，并兼顾减少动态效果设置
- Astro 静态生成，包含 canonical、Open Graph 和 `SocialMediaPosting` JSON-LD
- 响应式布局，适配桌面与移动端

## Stack

- Astro：静态页面、案例详情页、SEO 和分享元数据
- React：案例墙、搜索、筛选、排序和播放调度
- 原生 CSS：响应式案例浏览界面
- Playwright：桌面与移动端冒烟测试

## Getting Started

```bash
npm install
npm run dev
```

开发服务器默认运行在 <http://localhost:4321>。

检查并构建静态站点：

```bash
npm run check
npm run build
```

构建结果输出到 `dist/`，可部署到 GitHub Pages、Cloudflare Pages、Vercel 或任意静态托管平台。

## Data

案例数据位于 `src/data/cases.json`，结构版本为 `schemaVersion: 1`。每条案例包含：

- 原作者、原文和中文参考
- 浏览量、点赞、收藏、转发等互动指标
- 视频、封面和媒体状态
- 外链、引用帖、转载与衍生内容
- 标签、提及和整理时间

媒体使用公开文件地址；缺少视频时页面会显示已有封面或占位图，不影响文字内容浏览。

## Configuration

构建时可通过环境变量设置公开域名，用于生成 canonical 和分享元数据：

```bash
PUBLIC_SITE_URL=https://your-domain.example npm run build
```

## Test

开发服务器运行在 `http://127.0.0.1:4321` 时执行：

```bash
npm run test:smoke
```

测试默认使用本机 Chrome。

## Project Article

- [JEV Case 项目介绍](https://x.com/compose/articles/edit/2101213805644832768)

## Author

向明

- X：[@woniu20758393](https://x.com/woniu20758393)
- GitHub：[@Hiwoniu](https://github.com/Hiwoniu)

## License

代码使用 [MIT License](LICENSE)。

推文、视频、账号信息、原始封面和商标权利归原作者及原平台所有；本项目仅整理公开来源并保留原帖入口。
