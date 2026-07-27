name: Weekly JYSK Data Update

on:
  schedule:
    - cron: '0 6 * * 5'
  workflow_dispatch:

permissions:
  contents: write
  pages: write
  id-token: write

jobs:
  scrape-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm install -g agent-browser && agent-browser install

      - name: Scrape
        run: |
          mkdir -p _data
          for url in "drinking-glasses-mugs" "plates-bowls-cutlery" "kitchen-accessories"; do
            agent-browser open "https://jysk.co.uk/homeware/kitchen/$url" && \
            agent-browser wait --load networkidle && \
            agent-browser eval --stdin <<'JS' > "_data/$url.json" 2>/dev/null
            var items=[];
            document.querySelectorAll('[class*="product"],[class*="item"],[class*="grid"]>div').forEach(function(e){
              var t=e.textContent.trim(); if(t.length<20||t.length>600)return;
              var n=e.querySelector('h3,.name,[class*="title"]'); if(!n)return;
              var p=e.querySelector('[class*="price"]');
              var i=e.querySelector('img');
              var a=e.querySelector('a');
              items.push({n:n.textContent.trim(),p:p?p.textContent.trim().replace(/\s+/g,' '):'',i:i?i.src:'',u:a?a.href.split('?')[0]:''});
            });
            var s={};
            console.log(JSON.stringify(items.filter(function(x){var k=x.n+'|'+x.p;if(s[k])return false;s[k]=true;return true;})));
JS
            agent-browser close
          done

      - name: Generate page
        run: |
          cat > _site/index.html << 'HTML'
          <!DOCTYPE html><html><head><meta charset="UTF-8"><title>JYSK Update</title></head>
          <body><h1>JYSK Kitchen Data</h1><pre id="data"></pre>
          <script>
          fetch('/jysk-analysis/_data/drinking-glasses-mugs.json').then(r=>r.text()).then(d=>{
            document.getElementById('data').textContent=d;
          });
          </script></body></html>
          HTML

      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./_site
          publish_branch: gh-pages
          force_orphan: true
