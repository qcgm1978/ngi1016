
//GLOBAL.namespace('tools') ;

/**
 * 页面跳转
 * @param url 转向的页面url
 */
GLOBAL.tools.jump = function(url){
	location.href = url;
} ;

/**
 * 判断字符串或对象是否为空
 * @param o
 * @returns {Boolean}
 */
GLOBAL.tools.isBlank = function(o){
	if(typeof o == "undefined")
		return true ;
	if(o instanceof String || typeof o == "string"){
		o = o.replace(/(^\s*)|(\s*$)/g , "") ;
		return o.length == 0;

	}
	
	return false ;
} ;

/**
 * 字符串转为DOM
 * @param data
 */
GLOBAL.tools.parseStr2Dom = function(data) {
	if (document.implementation.hasFeature('XML', '2.0')) {
		var parser = new DOMParser();
		var xmldom = parser.parseFromString(data.xmlStr, 'text/xml');
		data.callback(xmldom);
	}
	// 其他浏览器尝试使用AJAX方法读取本地xml文件
	else {
		console.log('the browser doesn\'t support DOM LEVEL 2 XML, AJAX method need here');
	}
} ; 

/**
 +------------------------------------------------------------
 * 将分钟转换为hh:mm格式
 +------------------------------------------------------------
 *@param newM 分钟
 +------------------------------------------------------------
 */
GLOBAL.tools.formatMinute = function (newM) {
    if (typeof newM !== 'undefined' && newM != Infinity) {
        var minute = Math.round(newM);
        if (minute < 61)
            return minute + " 分";
        else {
            var h = Math.floor(minute / 60);
            var m = minute % 60;
            return h + "小时" + m + "分钟";
        }
    } else {
        return '未知';
    }
};
