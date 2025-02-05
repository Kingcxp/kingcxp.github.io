import{_ as s}from"./plugin-vue_export-helper-DlAUqK2U.js";import{c as a,b as e,o as p}from"./app-BxY7PwmM.js";const t={};function c(o,n){return p(),a("div",null,n[0]||(n[0]=[e(`<p>大家可能在做 <code>CQ&#39;s Challenge</code> 的时候发现利用 <code>getchar()</code> 读掉换行符的方式（这在平时 OJ 上都是非常有效的）出现了意想不到的问题，样例在本地跑的是对的，但是交上去就不大对劲，这到底是什么情况？</p><p>是这样的，某 CQ 在 <code>Windows</code> 下出题，一开始并没有考虑到这个问题，所以使用了自己用 C++ 编写的随机数程序，并直接在 <code>Windows</code> 平台的环境下自动生成数据。</p><p>那在 <code>Windows</code> 平台下生成数据会有什么区别呢？</p><p>是这样的，<code>Windows</code> 下的换行符和 <code>Linux</code> 下的换行符实际上并不一样，<code>Linux</code> 下的换行符是 <code>LF</code>，也就是大家平时碰到的，行末有一个换行符 <code>\\n</code> 来表示换行，但是 <code>Windows</code> 下就不一样了，它实际上是 <code>CRLF</code>，也即用 <code>\\r\\n</code> 来表示换行，所以当你发现你的 <code>getchar</code> 不好用了，实际上也许就是 <code>CRLF</code> 在捣鬼。</p><p>虽然说 OJ 数据按照标准应当是统一使用 <code>LF</code> 换行的，大大地提高了各位的做题体验，但是大部分情况下，我们并无法确定出题人用的是 <code>CRLF</code> 还是 <code>LF</code>，所以还是需要一种更稳妥的读入数据的方式，来帮助我们绕过这个 <code>CRLF</code> 和 <code>LF</code> 的问题。</p><p>解决这个问题的方法一般有两种：</p><p>1.老老实实使用 <code>scanf</code> 进行读入数据</p><p>我们都非常清楚（应该？），<code>scanf</code> 读入数据的时候，除了读入单个字符（<code>%c</code>），其它情况下，<code>scanf</code> 都会自动跳过空白符和一些无关的特殊字符，甚至你还可以利用 <code>scanf</code> 来指定输入的格式（如果你会用正则表达式的话），也就是说，当输入数据一切正常的时候，直接使用 <code>scanf</code>，而不去在意输入格式的具体情况，是一种非常好的做法。</p><p>2.继续使用 <code>getchar()</code>，但用另一种方式</p><p><code>scanf</code> 比 <code>getchar</code> 要智能的多，但是这种智能，是用时间来换的，也就是说，读入同样多的数据量，<code>scanf</code> 读入的速度，比 <code>getchar</code> 要慢不少，这么强大的工具，怎么会随手把它丢掉。</p><p>那用 <code>getchar</code> 如何绕过这些问题呢？<br> 答案是：用 <code>while</code>，直到读入到自己需要的数据。</p><p>这里举个例子可能会更清楚一点。</p><p><code>scanf</code>读入整数好慢好慢（当然printf也有点点慢，不过还好），如果你做过 <code>CQ&#39;s Challenge</code> C题的早期版本，你就会发现用 <code>scanf</code> 是无法通过的，只能拿到 80 分，那我们可以利用 <code>getchar</code> 来优化整数的读入过程：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">define</span> <span class="token macro-name function">isdigit</span><span class="token expression"><span class="token punctuation">(</span>ch<span class="token punctuation">)</span> <span class="token punctuation">(</span>ch <span class="token operator">&gt;=</span> </span><span class="token char">&#39;0&#39;</span> <span class="token expression"><span class="token operator">&amp;&amp;</span> ch <span class="token operator">&lt;=</span> </span><span class="token char">&#39;9&#39;</span><span class="token expression"><span class="token punctuation">)</span></span></span></span>
<span class="line"><span class="token comment">// isdigit()实际上在ctype.h当中有定义，这里假定你没有引用</span></span>
<span class="line"><span class="token keyword">void</span> <span class="token function">readInt</span><span class="token punctuation">(</span><span class="token keyword">int</span><span class="token operator">*</span> n<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token operator">*</span>n <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">// 用来表示这个数字是正数还是负数</span></span>
<span class="line">    <span class="token keyword">int</span> sign <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">char</span> ch <span class="token operator">=</span> <span class="token function">getchar</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">// 直到读到我们需要的数字</span></span>
<span class="line">    <span class="token keyword">while</span><span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">isdigit</span><span class="token punctuation">(</span>ch<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        ch <span class="token operator">=</span> <span class="token function">getchar</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token comment">// 有负号，是负数，在数据都是非负整数的情况下甚至可以舍去这条判断。</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>ch <span class="token operator">==</span> <span class="token char">&#39;-&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            sign <span class="token operator">=</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token comment">// 是数字，连续读入（因为是一个完整的数字），直到读到非数字（标志结束）</span></span>
<span class="line">    <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token function">isdigit</span><span class="token punctuation">(</span>ch<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">// 因为上面已经读到一个了，所以我们先把它处理了</span></span>
<span class="line">        <span class="token operator">*</span>n <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token operator">*</span>n<span class="token punctuation">)</span> <span class="token operator">&lt;&lt;</span> <span class="token number">3</span><span class="token punctuation">)</span> <span class="token operator">+</span> <span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token operator">*</span>n<span class="token punctuation">)</span> <span class="token operator">&lt;&lt;</span> <span class="token number">1</span><span class="token punctuation">)</span> <span class="token operator">+</span> ch <span class="token operator">-</span> <span class="token char">&#39;0&#39;</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token comment">// 这里的((*n) &lt;&lt; 3) + ((*n) &lt;&lt; 1)实际上就是 (*n) * 10 的意思，只不过位运算和加法都比乘法快</span></span>
<span class="line">        <span class="token comment">// 想一想为什么是这个式子</span></span>
<span class="line">        ch <span class="token operator">=</span> <span class="token function">getchar</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token operator">*</span>n <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token operator">*</span>n<span class="token punctuation">)</span> <span class="token operator">*</span> sign<span class="token punctuation">;</span> <span class="token comment">// 处理符号问题</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">// 具体使用：</span></span>
<span class="line"><span class="token keyword">int</span> n<span class="token punctuation">;</span></span>
<span class="line"><span class="token function">readInt</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>n<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>利用这种写法我们就获得了一种读入整数的更快的方式，你看到我们是怎样绕过 <code>LF</code> 和 <code>CRLF</code> 的问题的了吗？</p><p>实际上这种绕过方式的精髓在于，我们不是碰到无关的就跳过，而是不断读入直到读入到我们需要的东西再进行处理，这样在读入的过程中就自然而然地略过了无关的字符，达成了目标。</p><p>用 <code>CRLF</code> 出题，我真的错了！特以此篇，以表歉意 OTZ</p>`,17)]))}const d=s(t,[["render",c],["__file","CRLF_and_LF.html.vue"]]),r=JSON.parse(`{"path":"/posts/C-%E8%AF%AD%E8%A8%80%E5%AD%A6%E4%B9%A0%E5%88%86%E4%BA%AB/CRLF_and_LF.html","title":"关于 CRLF 和 LF","lang":"zh-CN","frontmatter":{"title":"关于 CRLF 和 LF","date":"2023-01-12T00:00:00.000Z","icon":"bug","order":3,"category":["C 语言学习分享"],"tag":["CPL"],"author":"Kingcq","description":"大家可能在做 CQ's Challenge 的时候发现利用 getchar() 读掉换行符的方式（这在平时 OJ 上都是非常有效的）出现了意想不到的问题，样例在本地跑的是对的，但是交上去就不大对劲，这到底是什么情况？ 是这样的，某 CQ 在 Windows 下出题，一开始并没有考虑到这个问题，所以使用了自己用 C++ 编写的随机数程序，并直接在 Win...","head":[["meta",{"property":"og:url","content":"https://kingcxp.github.io/posts/C-%E8%AF%AD%E8%A8%80%E5%AD%A6%E4%B9%A0%E5%88%86%E4%BA%AB/CRLF_and_LF.html"}],["meta",{"property":"og:site_name","content":"Kingcq's Blog"}],["meta",{"property":"og:title","content":"关于 CRLF 和 LF"}],["meta",{"property":"og:description","content":"大家可能在做 CQ's Challenge 的时候发现利用 getchar() 读掉换行符的方式（这在平时 OJ 上都是非常有效的）出现了意想不到的问题，样例在本地跑的是对的，但是交上去就不大对劲，这到底是什么情况？ 是这样的，某 CQ 在 Windows 下出题，一开始并没有考虑到这个问题，所以使用了自己用 C++ 编写的随机数程序，并直接在 Win..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2025-02-05T07:41:30.000Z"}],["meta",{"property":"article:author","content":"Kingcq"}],["meta",{"property":"article:tag","content":"CPL"}],["meta",{"property":"article:published_time","content":"2023-01-12T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2025-02-05T07:41:30.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"关于 CRLF 和 LF\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2023-01-12T00:00:00.000Z\\",\\"dateModified\\":\\"2025-02-05T07:41:30.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"Kingcq\\"}]}"]]},"headers":[],"git":{"createdTime":1738740544000,"updatedTime":1738741290000,"contributors":[{"name":"Kingcq","username":"Kingcq","email":"404291187@qq.com","commits":2,"url":"https://github.com/Kingcq"}]},"readingTime":{"minutes":3.63,"words":1090},"filePathRelative":"posts/C-语言学习分享/CRLF_and_LF.md","localizedDate":"2023年1月12日","excerpt":"<p>大家可能在做 <code>CQ's Challenge</code> 的时候发现利用 <code>getchar()</code> 读掉换行符的方式（这在平时 OJ 上都是非常有效的）出现了意想不到的问题，样例在本地跑的是对的，但是交上去就不大对劲，这到底是什么情况？</p>\\n<p>是这样的，某 CQ 在 <code>Windows</code> 下出题，一开始并没有考虑到这个问题，所以使用了自己用 C++ 编写的随机数程序，并直接在 <code>Windows</code> 平台的环境下自动生成数据。</p>\\n<p>那在 <code>Windows</code> 平台下生成数据会有什么区别呢？</p>","autoDesc":true}`);export{d as comp,r as data};
