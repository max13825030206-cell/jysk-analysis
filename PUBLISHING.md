# JYSK KITCHEN 长期发布方案

## 方案
使用 GitHub Pages 发布：

- 发布目录：`docs/`
- 入口文件：`docs/index.html`
- 更新方式：修改 `docs/index.html` 后提交到 GitHub 仓库，Pages 会自动更新

## 你后续怎么改
1. 打开仓库里的 `docs/index.html`
2. 修改页面内容
3. `git add . && git commit -m "update dashboard" && git push`
4. 等 GitHub Pages 自动刷新

## 我已经准备好的内容
- `docs/index.html`：可直接发布的单文件网页
- `docs/.nojekyll`：避免 GitHub Pages 的 Jekyll 处理

## 还差的最后一步
需要先把这个目录放进你的 GitHub 仓库，并在仓库 Settings 里把 Pages 源设置成：

- Branch: `main`
- Folder: `/docs`

如果你要我继续，我可以下一步帮你把仓库建好并把 Pages 开起来。