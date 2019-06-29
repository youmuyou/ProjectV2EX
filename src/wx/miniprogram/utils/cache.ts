export class Cache {

  put(key: string, value: any): boolean {
    try {
      wx.setStorageSync(key, value);
      return true;
    } catch (e) {
      return false;
    }
  }

  take(key: string): any {
    try {
      var value = wx.getStorageSync(key)
      if (value) {
        return value;
      }
    } catch (e) {
      return "";
    }
  }

  remove(key: string) {
    try {
      wx.removeStorageSync(key)
    } catch (e) {
    }
  }
}