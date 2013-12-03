/**
 * 创建iframe加载其它页面
 * @COPYRIGHT Shanghai RaxTone-Tech Co.,Ltd.
 * @Title: iframeJS.js
 * @Description:创建iframe加载其它页面
 * @author wangyonggang qq:135274859
 * @date 2012-6-27
 * @version V1.0
 * Modification History:
 */
//实例化对象需要传入id,msg,如果没有，则显示默认
var Iframe=function(config){
	var config=$.extend({
		//在id元素里面创建Iframe
		id:"iframeHTML",	
		//iframe名称，window可访问
		name:"iframeHTML",
		//iframe要加载的src
		src:""
	},config);
	 _createIframe=function(){
		var $iframe=$('#iframeDiv');
         $iframe.html("<iframe id="+config.id+" name="+config.name+" class='w800 h480'  frameborder='no' border='0' marginwidth='0' marginheight='0' scrolling='no' allowtransparency='true' src="+config.src+"></iframe>");
	};
    var _removeIframe = function () {
        $('iframe')[0].src = '';
        $(frames[0].document).empty();
        _hide();
    };
    var _show = function () {
        var constant = GLOBAL.Constant;
        if (constant.nav_obj.naviStatus.emulNaviStatus) {
            constant.nav_obj.Pause();
            constant.mapCenter = Event.mapObj.getCenter();
            $('#simulator').hide();
        }
        var $iframe = $('#iframeDiv');
       // $iframe.show();
        $iframe.css("visibility","visible");
    };
    var _hide = function () {
        var $iframe = $('#iframeDiv');
        $iframe.css("visibility","hidden");
        //$iframe.hide();
    };
    Iframe.prototype.create = function () {
        _createIframe();
    };
    Iframe.prototype.remove = function () {
        _removeIframe();
    };
    Iframe.prototype.show = function () {
        _show();
    };
	Iframe.prototype.hide = function () {
		_hide();
	};
	Iframe.prototype.setIframe = function (param) {
        $('iframe')[0].src = '';
        $(frames[0].document).empty();
        config.id = param.id;
		config.name = param.name;
		config.src = param.src;
		var iframe = $('iframe')[0];
		iframe.id = param.id;
		iframe.name = param.name;
		iframe.src = param.src;

	};
	Iframe.prototype.getIframe = function () {
		return '[parentId]:' + config.id + '[name]:' + config.name + '[src]:' + config.src;
	};
	Iframe.prototype.toString = function () {
		return '[parentId]:' + config.id + '[name]:' + config.name + '[src]:' + config.src;
	};

};
if(typeof(iframeObj)=='undefined'){
	 iframeObj=new Iframe();
	 iframeObj.create();
	 iframeObj.hide();
}
