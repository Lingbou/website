# 🍨 Lingbou's Homepage (Lingbou的主页)

个人主页，参考与致敬 [anzu.link](https://anzu.link/)。

## 📁 目录结构

- `content/`: 核心内容区（编辑 `about.md`, `games.md`, `site.json` 即可）
- `assets/`: 静态资源（背景图、头像、字体图标等）
- `src/`: 编译模板与零依赖构建脚本 `build.js`
- `style.css`: 页面核心样式
- `index.html`: 编译生成的主页
- `docker-compose.yml`: 一键部署配置

## 🚀 启动与构建

### 启动服务
```bash
docker compose up -d
```
访问 [http://localhost:3000](http://localhost:3000) 即可预览。

### 修改内容与编译
修改 `content/` 下的内容后，执行编译：
```bash
pnpm build
# 或监听模式（保存时毫秒级自动重编译）
pnpm dev
```

## 📄 License
[MIT](LICENSE)