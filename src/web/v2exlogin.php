<?php

require_once 'HttpRequest.php';

$url = 'https://www.v2ex.com/signin';
$referer = 'https://www.v2ex.com/signin';
$data = array();

//获取提交参数
foreach ($_POST as $key => $value) {
    $data[$key] = $value;
}
//去除不需要的参数
$cookie = $data['cookie'];
unset($data['cookie']);

$cookiePath = dirname(__FILE__) . '/cookie.txt';

$requestResult = HttpRequest::getRequest($url, $data, $referer, true, $cookie, null);

if (strpos($requestResult['result'], '用户名和密码无法匹配') !== false) {
    echo 0;
} else if (strpos($requestResult['result'], '输入的验证码不正确') !== false) {
    echo 1;
} else if (strpos($requestResult['result'], '登录有点问题，请重试一次') !== false) {
    echo 2;
} else if (strpos($requestResult['result'], '请解决以下问题然后再提交') !== false) {
    echo 3;
} else if (strpos($requestResult['result'], '短时间内的登录尝试次数太多，目前暂时不能继续尝试') !== false) {
    echo 4;
} else if(!empty($requestResult['cookie'])){
    //登录成功
    echo $requestResult['cookie'];
}
else{
    echo 5;
}