<?php

/**
 * http请求助手类
 */
class HttpRequest
{
    /**
     * 发送http请求并返回请求的数据
     * @param $_url 请求的URL地址
     * @param $_data 提交的数据
     * @param $_referer 伪造来源地址
     * @param $_ssl 是否是https请求
     * @param $_cookie COOKIE
     */
    public static function getRequest($_url, $_data, $_referer, $_ssl, $_cookie, $_cookieSave)
    {
        $cookie = '';

        $curl = curl_init();

        if ($_ssl) {
            curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
        }
        if ($_data !== null) {
            curl_setopt($curl, CURLOPT_POSTFIELDS, $_data);
        }
        if ($_referer !== null) {
            curl_setopt($curl, CURLOPT_REFERER, $_referer);
        }
        if ($_cookie !== null) {
            curl_setopt($curl, CURLOPT_COOKIE, $_cookie);
        }
        if ($_cookieSave !== null) {
            curl_setopt($curl, CURLOPT_COOKIEJAR, $_cookieSave);
        }
        curl_setopt($curl, CURLOPT_URL, $_url);
        curl_setopt($curl, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/18.17763');
        //curl_setopt($curl, CURLOPT_FOLLOWLOCATION, 1);
        curl_setopt($curl, CURLOPT_AUTOREFERER, 1);
        curl_setopt($curl, CURLOPT_HEADER, 1);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);

        $curlResult = curl_exec($curl);
        $headerSize = curl_getinfo($curl, CURLINFO_HEADER_SIZE);
        // 根据头大小去获取头信息内容
        $header = substr($curlResult, 0, $headerSize);
        curl_close($curl);
        $headerCookie = '';
        if ($_cookieSave !== null) {
            $pattern = '/(.*?)	(.*?)	\/	(.*?)	(.*?)	(.*?)	(.*?)\n/U';
            $cookiefilecontent = file_get_contents($_cookieSave);
            if (preg_match_all($pattern, $cookiefilecontent, $cookies)) {
                $cookiestr = '';
                foreach ($cookies[0] as $cookieitem) {
                    if (preg_match_all($pattern, $cookieitem, $cookiesinfo)) {
                        $cookiestr .= $cookiesinfo[5][0] . '=' . $cookiesinfo[6][0] . '; ';
                    }
                }
                $headerCookie = substr($cookiestr, 0, strlen($cookiestr) - 2);
            }
            unlink($_cookieSave);
        } else {
            preg_match('/Set-Cookie: (.*?)\n/', $header, $matches);
            $headerCookie = $matches && count($matches) >= 2 ? $matches[1] : '';
        }
        $result = array(
            'result' => $curlResult,
            'cookie' => $headerCookie,
            'header' => $header,
        );
        return $result;
    }
}
