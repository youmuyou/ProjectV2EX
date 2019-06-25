export class TopicParser {
  parse(html: string) {
    let matchImg: string[] | null = html.match(/<(img)\ssrc.*?>/g);
    if (matchImg !== null) {
      for (let i = 0; i < matchImg.length; i++) {
        html = html.replace(matchImg[i], this.parseImg(matchImg[i]));
      }
    }
    //match link
    let matchHref: string[] | null = html.match(/<(a).*?>.*?<\/a>/g);
    //console.log(matchHref);
    if (matchHref !== null) {
      for (let i = 0; i < matchHref.length; i++) {
        html = html.replace(matchHref[i], this.parseHref(matchHref[i]));
      }
    }

    //parse pre tag
    html = html.replace(/<(pre)>/g, "<pre class=\"md_pre\">");
    //parse h1 tag
    html = html.replace(/<(h1)>/g, "<h1 class=\"md_t1\">");
    //parse h2 tag
    html = html.replace(/<(h2)>/g, "<h2 class=\"md_t2\">");
    //parse h3 tag
    html = html.replace(/<(h3)>/g, "<h3 class=\"md_t3\">");
    //parse h4 tag
    html = html.replace(/<(h4)>/g, "<h4 class=\"md_t4\">");
    //parse li tag
    html = html.replace(/<(li)>/g, "<li class=\"md_listitem\">");
    //parse p tag
    html = html.replace(/<(p)>/g, "<p class=\"md_text\">");
    //parse blockquote tag
    html = html.replace(/<(blockquote)>/g, "<blockquote class=\"md_blockquote\">");
    //console.log("html:" + html);
    return "<div style=\"width:100%;\">" + html + "</div>";
  }

  parseImg(img: string) {
    img = img.replace("<img", "<img class=\"topic_img\"");
    return img;
  }

  parseHref(href: string) {
    href = href.replace("<a", "<a class=\"md_link\"");
    return href;
  }

  matchTopics(html: string) {
    console.log("正在匹配帖子列表");
    console.log(html);
    let Reg: any = /<div class="cell item">([\s\S]*?)<\/div>/g;

    let dataArray: any[] | null = html.match(Reg);
    if (dataArray != null) {
      dataArray.forEach((item: any) => {
        console.log(item);
      });
    }
    else{
      console.log("匹配不到任何帖子");
    }
  }
}