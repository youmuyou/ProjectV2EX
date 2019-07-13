export class UtilUI {
  /**
   * 显示加载弹窗
   */
  showLoading(msg: string) {
      wx.showLoading({
        title: msg,
      });

  }
}