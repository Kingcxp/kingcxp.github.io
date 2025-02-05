import{_ as e}from"./plugin-vue_export-helper-DlAUqK2U.js";import{c as i,b as a,o}from"./app-BxY7PwmM.js";const p="/assets/7-1-C5VFalZY.jpeg",n="/assets/7-2-Dgldq0kg.jpeg",r="/assets/7-3-DSsFqEjq.jpeg",c="/assets/7-4-CmI5vJzo.jpeg",s="/assets/7-5-CcVdrve9.jpeg",g="/assets/7-6-D89XVBz3.jpeg",l="/assets/7-7-fHUyy4sh.jpeg",m="/assets/7-8-DG3nTpsV.jpeg",d={};function u(f,t){return o(),i("div",null,t[0]||(t[0]=[a('<p>为了让我们能够很轻松地用简单的几句话控制音乐的播放、音量还有暂停，以及游戏音效的随意施放，我们有必要写两个类来分别处理音乐和音效：</p><figure><img src="'+p+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>先给自己准备好的每一个音乐都准备好独特的id，在这里我们实际上还没有准备任何的音乐，所以我们这里只放上一个MusicCount用来占位。</p><p>然后就是MusicPlayer类：</p><figure><img src="'+n+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>在这里需要注意的是，音乐和其它文件是不一样的，音乐文件一般比较大，因为音乐很长，所以SFML的打开方式并不是像其他类型的文件一样，而是根据音乐播放的进度选取文件当中的某一段读入，在之后销毁掉换成另一段，也就是说这个音乐播放时需要保证文件一直能够访问到。</p><figure><img src="'+r+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>此外是SoundPlayer：</p><figure><img src="'+c+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>同理先记id</p><figure><img src="'+s+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>在这里特别需要注意的是，游戏音效往往是有位置的，不仅仅是 3D 游戏会有声音随着位置改变，2D 游戏也是一样。一种理解是根据主角位置的不同将其他物体发出的声音按照方向环绕在玩家耳边，另一种理解是玩家坐在电脑面前，相当于在一张二维平面图上方一定距离处，在这个平面上不同位置发出的声音，玩家听到的感觉肯定也不一样。</p><p>所以在写 <code>SoundPlayer</code> 的时候要特别注意这点。</p><p><em>SFML Game Development</em> 这本书为我们提供了非常合适的常量，我们直接用上：</p><figure><img src="'+g+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><figure><img src="'+l+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>然后在播放的时候指定播放的位置。</p><figure><img src="'+m+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>别忘了每次更新的时候要把已经播放完的音效清除。<br> 这样就完成了对音乐和音效的播放的类的编写。</p>',19)]))}const h=e(d,[["render",u],["__file","7.html.vue"]]),M=JSON.parse(`{"path":"/posts/C__-SFML-%E6%B8%B8%E6%88%8F%E5%BC%80%E5%8F%91/7.html","title":"7. 音乐播放器，轻松拿捏游戏音乐和音效","lang":"zh-CN","frontmatter":{"title":"7. 音乐播放器，轻松拿捏游戏音乐和音效","date":"2024-03-21T00:00:00.000Z","icon":"music","order":8,"category":["C++ SFML"],"tag":["C++","SFML"],"author":"Kingcq","description":"为了让我们能够很轻松地用简单的几句话控制音乐的播放、音量还有暂停，以及游戏音效的随意施放，我们有必要写两个类来分别处理音乐和音效： 先给自己准备好的每一个音乐都准备好独特的id，在这里我们实际上还没有准备任何的音乐，所以我们这里只放上一个MusicCount用来占位。 然后就是MusicPlayer类： 在这里需要注意的是，音乐和其它文件是不一样的，音...","head":[["meta",{"property":"og:url","content":"https://kingcxp.github.io/posts/C__-SFML-%E6%B8%B8%E6%88%8F%E5%BC%80%E5%8F%91/7.html"}],["meta",{"property":"og:site_name","content":"Kingcq's Blog"}],["meta",{"property":"og:title","content":"7. 音乐播放器，轻松拿捏游戏音乐和音效"}],["meta",{"property":"og:description","content":"为了让我们能够很轻松地用简单的几句话控制音乐的播放、音量还有暂停，以及游戏音效的随意施放，我们有必要写两个类来分别处理音乐和音效： 先给自己准备好的每一个音乐都准备好独特的id，在这里我们实际上还没有准备任何的音乐，所以我们这里只放上一个MusicCount用来占位。 然后就是MusicPlayer类： 在这里需要注意的是，音乐和其它文件是不一样的，音..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2025-02-05T07:41:30.000Z"}],["meta",{"property":"article:author","content":"Kingcq"}],["meta",{"property":"article:tag","content":"C++"}],["meta",{"property":"article:tag","content":"SFML"}],["meta",{"property":"article:published_time","content":"2024-03-21T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2025-02-05T07:41:30.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"7. 音乐播放器，轻松拿捏游戏音乐和音效\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2024-03-21T00:00:00.000Z\\",\\"dateModified\\":\\"2025-02-05T07:41:30.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"Kingcq\\"}]}"]]},"headers":[],"git":{"createdTime":1738740544000,"updatedTime":1738741290000,"contributors":[{"name":"Kingcq","username":"Kingcq","email":"404291187@qq.com","commits":2,"url":"https://github.com/Kingcq"}]},"readingTime":{"minutes":1.78,"words":534},"filePathRelative":"posts/C++-SFML-游戏开发/7.md","localizedDate":"2024年3月21日","excerpt":"<p>为了让我们能够很轻松地用简单的几句话控制音乐的播放、音量还有暂停，以及游戏音效的随意施放，我们有必要写两个类来分别处理音乐和音效：</p>\\n<figure><figcaption></figcaption></figure>\\n<p>先给自己准备好的每一个音乐都准备好独特的id，在这里我们实际上还没有准备任何的音乐，所以我们这里只放上一个MusicCount用来占位。</p>\\n<p>然后就是MusicPlayer类：</p>\\n<figure><figcaption></figcaption></figure>\\n<p>在这里需要注意的是，音乐和其它文件是不一样的，音乐文件一般比较大，因为音乐很长，所以SFML的打开方式并不是像其他类型的文件一样，而是根据音乐播放的进度选取文件当中的某一段读入，在之后销毁掉换成另一段，也就是说这个音乐播放时需要保证文件一直能够访问到。</p>","autoDesc":true}`);export{h as comp,M as data};
