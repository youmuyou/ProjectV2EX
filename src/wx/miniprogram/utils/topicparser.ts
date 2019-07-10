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

  getMatchTopics(html: string): ITopic[] {
    console.log("正在匹配帖子列表");
    let topicList: ITopic[] = [];
    let Reg: any = /<table cellpadding="0" cellspacing="0" border="0" width="100%">([\s\S]*?)<\/table>/g;

    let dataArray: any[] | null = html.match(Reg);
    if (dataArray != null) {
      dataArray.forEach((item: any) => {
        if (item.indexOf("id=\"LogoMobile\"") == -1 &&
          item.indexOf("class=\"super normal button\"") == -1) {
          console.log(item);
          //ID
          let idReg: any = /<a href="\/t\/([0-9]{2,10})(.*?)">/g;
          let id = idReg.exec(item)[1];
          //标题
          let titleReg: any = /<span class="item_title"><a(.*?)>([\s\S]*?)<\/a><\/span>/g;
          let title = titleReg.exec(item)[2];
          //头像
          let avatarReg: any = /<img loading="lazy" src="(.*?)"(.*?)>/g;
          let avatar = "https:"+avatarReg.exec(item)[1];
          //节点名称
          let nodeReg: any = /<a class="node"(.*?)>(.*?)<\/a>/g;
          let node = nodeReg.exec(item)[2];
          //用户
          let memberReg: any = /<a href="\/member\/(.*?)"><img/g;
          let member = memberReg.exec(item)[1];
          //时间
          let timeReg: any = /<span class="small fade">(.*?)前/g;
          let time = timeReg.exec(item)[1] + "前";
          time = time.replace(/\s/g, "");
          //回复数
          let replysHtmlReg: any = /<td width="70" align="right" valign="middle">([\s\S]*?)<\/td>/g;
          let replysHtml = replysHtmlReg.exec(item)[1];
          let replys = 0;
          if (replysHtml.length > 5) {
            //有回复
            let replysReg: any = /<a(.*?)>(.*?)<\/a>/g;
            replys = replysReg.exec(replysHtml)[2];
          }
          let topicMember: IMember = {
            username: member,
            avatar_normal: avatar

          }
          let topicNode: INode = {
            title: node
          }
          let t: ITopic = {
            id: id,
            created: time,
            title: title,
            replies: replys,
            node: topicNode,
            member: topicMember,
            content_rendered: ''
          };
          topicList.push(t);

          console.log("ID：" + id + "，" +"标题：" + title + "，" + "头像：" + avatar + "，" + "节点：" + node + "，" + "用户：" + member + "，" + "时间：" + time + "，" + "回复：" + replys);

        }
      });
    }
    else {
      console.log("匹配不到任何帖子");
    }
    return topicList;
  }
}