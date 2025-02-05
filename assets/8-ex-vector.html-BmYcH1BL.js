import{_ as s}from"./plugin-vue_export-helper-DlAUqK2U.js";import{c as a,b as p,o as t}from"./app-BxY7PwmM.js";const e={};function c(o,n){return t(),a("div",null,n[0]||(n[0]=[p(`<p>这次我们介绍一个很方便但是在 C 语言当中依然用起来有些难度的东西——动态数组。</p><p>行向量 <code>vector</code>，在 <code>C++STL</code> 当中有它，但我们更习惯称它位动态数组，它的特点就是能够动态分配数组的内存，方便我们应对未知数据量的问题。</p><p>这么好用？不，它虽然优化了空间，但它也用掉了一部分的时间用来维护这个动态数组。不过总体上来说，这个动态数组还是很推荐学一学，用一用的。</p><p>（有些人特别钟爱用 <code>vector</code> 存图，时间常数大的起飞，我不说是谁（︶^︶））</p><p>接下来就大概的看一看实现的代码，相信加上注释和清晰的变量命名，你们应该能看懂。</p><p>这次依旧没有经过检查，所以直接抄代码请你谨慎。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">include</span> <span class="token string">&lt;stdio.h&gt;</span></span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">include</span> <span class="token string">&lt;stdlib.h&gt;</span></span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">include</span> <span class="token string">&lt;string.h&gt;</span></span></span>
<span class="line"></span>
<span class="line"><span class="token comment">// 建立一个行向量结构体，里面存三个指针</span></span>
<span class="line"><span class="token keyword">struct</span> <span class="token class-name">Vector</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">// 指向数组开头</span></span>
<span class="line">    <span class="token keyword">int</span><span class="token operator">*</span> begin<span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">// 指向数组结尾</span></span>
<span class="line">    <span class="token keyword">int</span><span class="token operator">*</span> end<span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">// 指向内存结尾</span></span>
<span class="line">    <span class="token keyword">int</span><span class="token operator">*</span> endOfStorage<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span>vec<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">// 初始化动态数组</span></span>
<span class="line"><span class="token keyword">void</span> <span class="token function">initialize</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    vec<span class="token punctuation">.</span>begin <span class="token operator">=</span> vec<span class="token punctuation">.</span>end <span class="token operator">=</span> vec<span class="token punctuation">.</span>endOfStorage <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">// 删除这个动态数组，释放内存</span></span>
<span class="line"><span class="token keyword">void</span> <span class="token function">destroy</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token function">free</span><span class="token punctuation">(</span>vec<span class="token punctuation">.</span>begin<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">// 返回指向数组开头的指针</span></span>
<span class="line"><span class="token keyword">int</span><span class="token operator">*</span> <span class="token function">begin</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">return</span> vec<span class="token punctuation">.</span>begin<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">// 返回指向数组结尾的指针</span></span>
<span class="line"><span class="token keyword">int</span><span class="token operator">*</span> <span class="token function">end</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">return</span> vec<span class="token punctuation">.</span>end<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">// 返回当前数组大小</span></span>
<span class="line"><span class="token keyword">int</span> <span class="token function">size</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">return</span> vec<span class="token punctuation">.</span>end <span class="token operator">-</span> vec<span class="token punctuation">.</span>begin<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">// 返回当前数组容量</span></span>
<span class="line"><span class="token keyword">int</span> <span class="token function">capacity</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">return</span> vec<span class="token punctuation">.</span>endOfStorage <span class="token operator">-</span> vec<span class="token punctuation">.</span>begin<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">// 特别提醒，为了节约时间成本</span></span>
<span class="line"><span class="token comment">// 每次扩容时会把容量多扩一些</span></span>
<span class="line"><span class="token comment">// 因为每次扩容都需要重新申请一段内存，然后把原来的移过来</span></span>
<span class="line"><span class="token comment">// 所以这里的容量和数组大小并不相同</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">// 将容量扩充至 n，如果当前容量不够需要重新申请内存</span></span>
<span class="line"><span class="token keyword">void</span> <span class="token function">reserve</span><span class="token punctuation">(</span><span class="token keyword">int</span> n<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>n <span class="token operator">&gt;</span> <span class="token function">capacity</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">int</span><span class="token operator">*</span> tmp <span class="token operator">=</span> <span class="token function">malloc</span><span class="token punctuation">(</span>n <span class="token operator">*</span> <span class="token keyword">sizeof</span><span class="token punctuation">(</span><span class="token keyword">int</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">int</span> sz <span class="token operator">=</span> <span class="token function">size</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>vec<span class="token punctuation">.</span>begin<span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">int</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> sz<span class="token punctuation">;</span> <span class="token operator">++</span>i<span class="token punctuation">)</span></span>
<span class="line">                tmp<span class="token punctuation">[</span>i<span class="token punctuation">]</span> <span class="token operator">=</span> vec<span class="token punctuation">.</span>begin<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token function">free</span><span class="token punctuation">(</span>vec<span class="token punctuation">.</span>begin<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">        vec<span class="token punctuation">.</span>begin <span class="token operator">=</span> tmp<span class="token punctuation">;</span></span>
<span class="line">        vec<span class="token punctuation">.</span>end <span class="token operator">=</span> vec<span class="token punctuation">.</span>begin <span class="token operator">+</span> sz<span class="token punctuation">;</span></span>
<span class="line">        vec<span class="token punctuation">.</span>endOfStorage <span class="token operator">=</span> vec<span class="token punctuation">.</span>begin <span class="token operator">+</span> n<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">// 改变数组长度至 n，其中未定义的数组元素会被赋值成 val</span></span>
<span class="line"><span class="token keyword">void</span> <span class="token function">resize</span><span class="token punctuation">(</span><span class="token keyword">int</span> n<span class="token punctuation">,</span> <span class="token keyword">int</span> val<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>n <span class="token operator">&gt;</span> <span class="token function">capacity</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">reserve</span><span class="token punctuation">(</span>n<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">int</span> i <span class="token operator">=</span> <span class="token function">size</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> n<span class="token punctuation">;</span> <span class="token operator">++</span>i<span class="token punctuation">)</span></span>
<span class="line">        vec<span class="token punctuation">.</span>begin<span class="token punctuation">[</span>i<span class="token punctuation">]</span> <span class="token operator">=</span> val<span class="token punctuation">;</span></span>
<span class="line">    vec<span class="token punctuation">.</span>end <span class="token operator">=</span> vec<span class="token punctuation">.</span>begin <span class="token operator">+</span> n<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">// 在数组尾部添加一个元素，值为 val</span></span>
<span class="line"><span class="token keyword">void</span> <span class="token function">push_back</span><span class="token punctuation">(</span><span class="token keyword">int</span> val<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">size</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token function">capacity</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">int</span> newcapacity <span class="token operator">=</span> <span class="token function">size</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token number">0</span> <span class="token operator">?</span> <span class="token keyword">sizeof</span><span class="token punctuation">(</span><span class="token keyword">int</span><span class="token punctuation">)</span> <span class="token operator">:</span> <span class="token function">capacity</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">*</span> <span class="token number">2</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">reserve</span><span class="token punctuation">(</span>newcapacity<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token operator">*</span>vec<span class="token punctuation">.</span>end <span class="token operator">=</span> val<span class="token punctuation">;</span></span>
<span class="line">    <span class="token operator">++</span>vec<span class="token punctuation">.</span>end<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">void</span> <span class="token function">pop_back</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token comment">// 在数组尾部删除一个元素</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">size</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token operator">--</span>vec<span class="token punctuation">.</span>end<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">// 在数组的第 pos 位插入一个元素，值为val</span></span>
<span class="line"><span class="token keyword">void</span> <span class="token function">insert</span><span class="token punctuation">(</span><span class="token keyword">int</span> pos<span class="token punctuation">,</span> <span class="token keyword">int</span> val<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>vec<span class="token punctuation">.</span>end <span class="token operator">==</span> vec<span class="token punctuation">.</span>endOfStorage<span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">reserve</span><span class="token punctuation">(</span><span class="token function">size</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">int</span> i <span class="token operator">=</span> <span class="token function">size</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> i <span class="token operator">&gt;</span> pos<span class="token punctuation">;</span> <span class="token operator">--</span>i<span class="token punctuation">)</span></span>
<span class="line">        <span class="token operator">*</span><span class="token punctuation">(</span>vec<span class="token punctuation">.</span>begin <span class="token operator">+</span> i<span class="token punctuation">)</span> <span class="token operator">=</span> <span class="token operator">*</span><span class="token punctuation">(</span>vec<span class="token punctuation">.</span>begin <span class="token operator">+</span> i <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token operator">*</span><span class="token punctuation">(</span>vec<span class="token punctuation">.</span>begin <span class="token operator">+</span> pos<span class="token punctuation">)</span> <span class="token operator">=</span> val<span class="token punctuation">;</span></span>
<span class="line">    <span class="token operator">++</span>vec<span class="token punctuation">.</span>end<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">// 删除数组的第 pos 位元素</span></span>
<span class="line"><span class="token keyword">void</span> <span class="token function">erase</span><span class="token punctuation">(</span><span class="token keyword">int</span> pos<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">int</span> i <span class="token operator">=</span> <span class="token function">size</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> i <span class="token operator">&gt;</span> pos<span class="token punctuation">;</span> <span class="token operator">--</span>i<span class="token punctuation">)</span></span>
<span class="line">        <span class="token operator">*</span><span class="token punctuation">(</span>vec<span class="token punctuation">.</span>begin <span class="token operator">+</span> i <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">)</span> <span class="token operator">=</span> <span class="token operator">*</span><span class="token punctuation">(</span>vec<span class="token punctuation">.</span>begin <span class="token operator">+</span> i<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token operator">--</span>vec<span class="token punctuation">.</span>end<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">// 获取数组的第 pos 位元素</span></span>
<span class="line"><span class="token keyword">int</span> <span class="token function">get</span><span class="token punctuation">(</span><span class="token keyword">int</span> pos<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">return</span> <span class="token operator">*</span><span class="token punctuation">(</span>vec<span class="token punctuation">.</span>begin <span class="token operator">+</span> pos<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">int</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token keyword">int</span> argc<span class="token punctuation">,</span> <span class="token keyword">char</span> <span class="token operator">*</span>argv<span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token function">initialize</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">int</span> x<span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">scanf</span><span class="token punctuation">(</span><span class="token string">&quot;%d&quot;</span><span class="token punctuation">,</span> <span class="token operator">&amp;</span>x<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">push_back</span><span class="token punctuation">(</span>x<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">push_back</span><span class="token punctuation">(</span>x<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">pop_back</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">insert</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">erase</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">destroy</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">return</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="hint-container warning"><p class="hint-container-title">注意</p><p>在之后的 <code>C++ 高级程序设计</code> 课程作业中会出现这个数据结构！</p><p>我警告过你了！</p></div><p>题单链接：</p><p><a href="https://www.luogu.com.cn/training/253705" target="_blank" rel="noopener noreferrer">南哪2022-8-pointer EX 动态数组 - 题单 - 洛谷 | 计算机科学教育新生态 (luogu.com.cn)</a></p><p>这次还是没有题目做……</p>`,11)]))}const u=s(e,[["render",c],["__file","8-ex-vector.html.vue"]]),k=JSON.parse(`{"path":"/posts/DotOJ-%E8%A1%A5%E5%AE%8C%E8%AE%A1%E5%88%92/8-ex-vector.html","title":"南哪 2022-8-pointer EX 动态数组","lang":"zh-CN","frontmatter":{"title":"南哪 2022-8-pointer EX 动态数组","date":"2022-11-21T00:00:00.000Z","icon":"face-grin-beam-sweat","order":14,"category":["CPL DotOJ 补完计划"],"tag":["CPL","DotOJ"],"author":"Kingcq","description":"这次我们介绍一个很方便但是在 C 语言当中依然用起来有些难度的东西——动态数组。 行向量 vector，在 C++STL 当中有它，但我们更习惯称它位动态数组，它的特点就是能够动态分配数组的内存，方便我们应对未知数据量的问题。 这么好用？不，它虽然优化了空间，但它也用掉了一部分的时间用来维护这个动态数组。不过总体上来说，这个动态数组还是很推荐学一学，用...","head":[["meta",{"property":"og:url","content":"https://kingcxp.github.io/posts/DotOJ-%E8%A1%A5%E5%AE%8C%E8%AE%A1%E5%88%92/8-ex-vector.html"}],["meta",{"property":"og:site_name","content":"Kingcq's Blog"}],["meta",{"property":"og:title","content":"南哪 2022-8-pointer EX 动态数组"}],["meta",{"property":"og:description","content":"这次我们介绍一个很方便但是在 C 语言当中依然用起来有些难度的东西——动态数组。 行向量 vector，在 C++STL 当中有它，但我们更习惯称它位动态数组，它的特点就是能够动态分配数组的内存，方便我们应对未知数据量的问题。 这么好用？不，它虽然优化了空间，但它也用掉了一部分的时间用来维护这个动态数组。不过总体上来说，这个动态数组还是很推荐学一学，用..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2025-02-05T07:41:30.000Z"}],["meta",{"property":"article:author","content":"Kingcq"}],["meta",{"property":"article:tag","content":"CPL"}],["meta",{"property":"article:tag","content":"DotOJ"}],["meta",{"property":"article:published_time","content":"2022-11-21T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2025-02-05T07:41:30.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"南哪 2022-8-pointer EX 动态数组\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2022-11-21T00:00:00.000Z\\",\\"dateModified\\":\\"2025-02-05T07:41:30.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"Kingcq\\"}]}"]]},"headers":[],"git":{"createdTime":1738740544000,"updatedTime":1738741290000,"contributors":[{"name":"Kingcq","username":"Kingcq","email":"404291187@qq.com","commits":2,"url":"https://github.com/Kingcq"}]},"readingTime":{"minutes":2.78,"words":835},"filePathRelative":"posts/DotOJ-补完计划/8-ex-vector.md","localizedDate":"2022年11月21日","excerpt":"<p>这次我们介绍一个很方便但是在 C 语言当中依然用起来有些难度的东西——动态数组。</p>\\n<p>行向量 <code>vector</code>，在 <code>C++STL</code> 当中有它，但我们更习惯称它位动态数组，它的特点就是能够动态分配数组的内存，方便我们应对未知数据量的问题。</p>\\n<p>这么好用？不，它虽然优化了空间，但它也用掉了一部分的时间用来维护这个动态数组。不过总体上来说，这个动态数组还是很推荐学一学，用一用的。</p>\\n<p>（有些人特别钟爱用 <code>vector</code> 存图，时间常数大的起飞，我不说是谁（︶^︶））</p>\\n<p>接下来就大概的看一看实现的代码，相信加上注释和清晰的变量命名，你们应该能看懂。</p>","autoDesc":true}`);export{u as comp,k as data};
