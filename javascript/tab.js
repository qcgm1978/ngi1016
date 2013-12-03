var Tab = {
    /**
     * @function 时间间隔计算
     */
    getDateDiff:function (startDate, endDate, interval) {
        var startTime = new Date(Date.parse(startDate)).getTime();
        endTime = new Date(Date.parse(endDate)).getTime();
        var dates = Math.abs((startTime - endTime)) / 1000;
        return  dates > interval;
    },
    /**
     * @description 生成动态光柱的参数
     */
    generateArgLightCross:function (config) {
        try {
            var arg = {
                data:config[0],
                traffic:config[1]
            }
        } catch (err) {
            console.log(err.message);
        }
        return arg;
    },
    /**
     * 如果返回的绘制光柱的颜色数据为[[], []],转换为[[1], [0]]，表示没有动态交通信息，显示未知状态光柱，即灰色光柱，
     * 第一个数组的唯一元素表示全程为1，第二个数组的唯一元素表示路况为0，即未知路况
     * @param arrLight 绘制光柱的颜色数据
     * @return {*} arrLight 转换后的光柱的颜色数据
     */
    changeTmcLightCrossData:function (arrLight) {
 //       console.log("arrLight.distanceData:"+JSON.stringify(arrLight[0])+";<br/>arrLight.traffic"+JSON.stringify(arrLight[1]));
        if (arrLight == null || arrLight[0] == null || arrLight[0].length < 1) {
            arrLight = [[1], [0] ];
        }
        return arrLight;
    },
    /**
     * @function 设置双光柱背景
     */
    set_bg:function (config) {
        var metric = config.metric;
        if (config.id == "light_cross") {
            $.each(config.arr, function (i, n) {
                $('<blockquote>')
                    .css({
                        'background-image':config.address + n.color + '.png)'
                    })
                    .css(metric, parseInt(n.percent * config.total))
                    .appendTo('#' + config.id);
            });
            /**
             * @description 纠正浮点数精度造成的填充容器元素不足问题
             */
            var quote_metric = 0;
            $('#' + config.id)
                .children()
                .each(function (i) {
                    quote_metric += parseInt($(this).css(config.metric));
                });
            if (quote_metric < config.total) {
                $('#' + config.id)
                    .children(':last')
                    .clone()
                    .css(config.metric, parseInt(config.total - quote_metric))
                    .appendTo('#' + config.id);
            }
        }
        else {
            var insert = '',totalLen = 0;
            $.each(config.arr, function (i, n) {
                var str = '<p style = "' + metric + ':' +
                    parseInt(n.percent * config.total) + 'px;' +
                    'background-image:' + config.address +
                    n.color + '.png);' +
                    'display:block;width: 20px;"></p>';
                insert = str + insert;
                totalLen += parseInt(n.percent * config.total);
            });
            //纠正浮点数精度造成的填充容器元素不足问题
            if(totalLen < config.total){
                var str = '<p style = "' + metric + ':' +
                    parseInt(config.total - totalLen) + 'px;' +
                    'background-image:' + config.address +
                    config.arr[config.arr.length - 1].color + '.png);' +
                    'display:block;width: 20px;"></p>';
                insert += str;
            }
            $('#' + config.id).html(insert);
        }
    },

    /**
     * 逆地理编码又称位置描述或地址解析，即从已知的经纬度坐标到对应的地址描述（如省市、街区、楼层、房间等）的转换
     * @param lng 经度信息
     * @param lat 纬度信息
     * @param callback 解析之后的回调函数
     */
    coord_regeocode:function (lng, lat, callback) {
        var geocoderOption = {
            range:10000, //范围
            crossnum:0,
            roadnum:0,
            poinum:1//POI点数
        };
        var poiService = typeof PoiSDK!="undefined" ? PoiSDK : parent.PoiSDK;
        var geocoder = new poiService.Geocoder(geocoderOption);
        geocoder.regeocode(new poiService.LngLat(lng, lat), function (data) {
            if (data) {
                if (data.error) {
                    console.log(data.error.description, 'failed to regeocode.');
                    return;
                }
                else {
                    callback(data);
                }
            }
            else {
                console.info('no data about the coordinate');
            }
        });
    },
    //验证当前兴趣点与自车位置是否相同,1,不相同：返回true，2,相同，返回false
    validate_poi:function () {
        if (isNaN(localStorage['Map_lng']) || isNaN(localStorage['Map_lat']) ||
            isNaN(parent.window.GLOBAL.Constant.poi_search_result.lng) || isNaN(parent.window.GLOBAL.Constant.poi_search_result.lat)) {
            return false;
        }
        if (localStorage['Map_lng'] != parent.GLOBAL.Constant.poi_result_lng ||
            localStorage['Map_lat'] != parent.GLOBAL.Constant.poi_result_lat) {
            return true;
        }
        return false;
    },

    //数值转换函数，
    unit_conversion:function (m, decimal) {
        if(m == Infinity)
            return "未知";
        if (m < 1000) {
            return parseInt(m) + 'm';
        }
        else {
            //number的字符串表示，不采用指数计数法，小数点后有固定的digics位数字。如果 必要，该数字会被舍入，也可以用0补足，以便它达到指定的长度。
            var k = 0;
            //如果大于等于100公里，不显示小数
            if (m / 1000 >= 100) {
                k = (m / 1000).toFixed(0);
            }
            else {
                k = (m / 1000).toFixed(decimal);
            }
            return k + 'km';
        }

    },
    //设置显示灰色图片或背景效果
    gray_img:function (config) {
        config.ele.attr(config.attr, function (index, attr) {
                if (!attr.match(/_gray/)) {
                    var str = attr.replace(/(\.png)$/, '_gray$1');
                    return str;
                }
            }
        );
    },
    /**
     * @event 正常显示图片
     */
    displayNormalImg:function (config) {
        config.ele.attr(config.attr, function (index, attr) {
                var str = attr.replace(/_gray(\.png)$/, '$1');
                return str;
            }
        );
    },
    //显示时间
    startTime:function ($container) {
        var today = new Date();
        var h = today.getHours();
        var m = today.getMinutes();
        h = this.formatTime(h);
        m = this.formatTime(m);
        $('#time_right span').text(h + ':' + m);
        var t = window.setTimeout(function(){Tab.startTime();}, 60);
    },
    //检测时间，两位数显示
    formatTime:function (i) {
        if (i < 10) {
            i = "0" + i
        }
        return i
    }
};
		 
/**
 * @class 验证图片src和background-image类
 * @param [jquery object or array] 要验证的jquery对象或由其组成的数组
 */
	function ImgValidate($obj) {
		this.obj = $obj;
		this.regex = /_on(_gray)?\.png$/;
		this.state = false;
		this.index = NaN;
		this.validateSelected();
	}	
	ImgValidate.prototype = {
		validateSelected : function() {
			var that = this;
			if (this.obj.length == 1) {		
				var config = this.retSrcBg(this.obj);	
				this.state = !!(config.src.match(this.regex) || config.bg.match(this.regex));
			}
			else if (this.obj instanceof Object) {
				$.each(this.obj, function(i, n) {
					var config = that.retSrcBg($(n));
					if (config.src.match(that.regex) || config.bg.match(that.regex)) {
						that.state = true;
						that.index = i;
						return false;
					}
				});
			}
		},
		/**
		 * @return 返回jquery对象的src和background-image属性构建的对象
		 */		 
		 retSrcBg : function($obj) {
			 /**
			  * @default '' [string] 必须有值，否则返回undefined，不能使用match方法
			  */
			 var boolSrc = $obj.attr('src') || '',
				 boolBg = $obj.attr('background-image') || '';
			 return {
				 src : boolSrc,
				 bg : boolBg
			 };
		 }
	};

	/**
     * @example 主界面动态光柱模拟信息
     **/
    /**
     *
     * @param arrLight
     * @constructor
     */
    var SimulatorLight = function (arrLight) {
     //   var arg = Tab.generateArgLightCross(arrLight.arr);
        this.data = arrLight.arr[0];
        this.traffic = arrLight.arr[1];
        this.arr = this.generateTMCArray();
        this.id = arrLight.id;
        this.total = arrLight.total;
        this.metric = arrLight.metric;
        this.address = arrLight.address;
    };
	SimulatorLight.color = ['grey', 'green', 'yellow', 'red'];
	SimulatorLight.prototype.generateArg = function () {
        var argLight = {
            arr:this.arr,
            id:this.id,
            total:this.total,
            metric:this.metric,
            address:this.address
        }
        return argLight;
    };
    /**
     * 生成一个新的数组，每一项元素如下{color: "red"，percent:0.3}
     * @return {Array}
     */
	SimulatorLight.prototype.generateTMCArray = function() {
		var total = 0,arr = [];
		$.each(this.data, function(i, n) {
			total += n;
		});
		var self = this;
		$.each(this.data, function(i, n) {
			/**
			@description 数字对应的交通路况
			0, // 道路状态未知。
			1, // 道路通畅。		
			2, // 道路缓行。		
			3, // 道路阻塞严重
			*/
			var colorVal = self.traffic[i];
			var config = {
				color: SimulatorLight.color[colorVal],
				percent: n / total
			};
			arr.push(config);
		});
		return arr;
	};

	


//提示框确定按钮点击事件@deprecated 
$('img[alt*="确定按钮"],img[alt*="是按钮"]', '#msg_box').click(function () {
    var ret = $(this).attr('src');
    if (!ret.match(/_on\.png$/)) {
        var src_name = ret.replace(/(\.png)$/, '_on$1');
        $(this).attr('src', src_name);
        var oCancel = $('img[alt*="取消按钮"],img[alt*="否按钮"]', '#msg_box');
        if (oCancel.length > 0) {
            ret = oCancel.attr('src');
            src_name = ret.replace(/\_on(.png)$/, '$1');
            oCancel.attr('src', src_name);
        }
    }
});
$('img[alt*="取消按钮"],img[alt*="否按钮"]','#msg_box').click(function(){
	var ret = $(this).attr('src');
	if (!ret.match(/_on\.png$/)) {
			var src_name = ret.replace(/(\.png)$/, '_on$1');
			$(this).attr('src', src_name);
			var oSure=$('img[alt*="确定按钮"],img[alt*="是按钮"]','#msg_box');
			if(oSure.length>0){
				ret=oSure.attr('src');
		    	src_name = ret.replace(/\_on(.png)$/, '$1');
				oSure.attr('src', src_name);
			}
			
		}	  
});
//清除系统自动title提示
$("table").delegate("td","mouseover",function(){$(this).attr('myTitle',$(this).attr('title'));$(this).attr('title','');});
$("table").delegate("td","mouseout",function(){$(this).attr('title',$(this).attr('myTitle'));});

/**
 @description 设置图片或背景图点击闪动效果，可能使用伪类:active进行设置更好，即对body元素或需要显示点击效果的元素添加一个伪类
*/
var supportTouch = {
	touch: (navigator.userAgent.match(/iPhone/i)) ||(navigator.userAgent.match(/iPad/i)) ||(navigator.userAgent.match(/android/i))
};

var EventObj = {
	start: supportTouch.touch ? 'touchstart' : 'mousedown',
	move: supportTouch.touch ? 'touchmove' : 'mouseleave',
	end: supportTouch.touch ? 'touchend' : 'mouseup'
};
$('img, ul a, ul li, td, figure, section, input[type=submit]').live(EventObj.start+' '+EventObj.move+' '+EventObj.end,tabFun=function(e){
    var that=this , change_icon = $(this).attr('bChangeIcon') ;
    if(change_icon == "false") return;//by Zhen Xia, 检测属性值，为'false'则不自动换图标
    ReductionOther(e,that);});
/*if(isTouchDevice()){
	fitTouchDevice();
}	
function isTouchDevice() {
  return 'ontouchstart' in window;
}

function fitTouchDevice() {
  if (!isTouchDevice()) {	   
    return;
  }  
}*/

function ReductionOther(e,that){
	switch (e.type){
		case 'mousedown':
			Reduction(that);
			$(that).attr('bMousedown','true');		
		break;
		case 'mouseleave':
			setAttr();
		break;
		case 'mouseup':
			setAttr();
		break; 	
		case 'touchstart':
			Reduction(that);
			$(that).attr('bMousedown','true');	
		break;
		case 'touchmove':
			setAttr();
		break;
		case 'touchend':
			setAttr();
		break; 	
		default:
			setAttr();
	}
	function setAttr(){
		if($(that).attr('bMousedown')=='true'){
			Reduction(that);
			$(that).attr('bMousedown','false');
		}
	}
}
function Reduction(that) {	
		 var src = $(that).attr('src'),
			bg_img = $(that).css('background-image'),
			ret;
		ret = src || bg_img;
        if (ret == 'none' || ret.match(/_gray\.png/))
                return;
		switch (ret) {
			case undefined:	return true;
			case src: {
			if (ret.match(/_on\.png$/)) {
				var src_name = ret.replace(/\_on(.png)$/, '$1');
				$(that).attr('src', src_name);	
			}
			else {			
				var src_name = ret.replace(/(\.png)$/, '_on$1');
				$(that).attr('src', src_name);
			}
			break;
			}
			case bg_img: {
			if (bg_img.match(/_on\.png/)) {
				var bg02 = bg_img.replace(/\_on(.png)/, '$1');
				$(that).css('background-image', bg02);	
			}
			else {
				var bg02 = bg_img.replace(/(\.png)/, '_on$1');
				var href = bg02.replace(/^url\((.*)\)$/,'$1');
				$(that).css('background-image', bg02);
			}
			break;
			}
			default: {
				console.log('no such image');
			}
			
		}
		$(that).error(function() {
			try {
				if(src){
					$(that).attr('src', ret);
				}else{
					$(that).css('background-image', ret);
				}
			} catch(e) {
				console.log(e.message);	
			}
			return true;
		});	
}




//设置文档标题，即为页面中左上角h1元素的文本节点内容
document.title = $('h1:first').text();


//指定多少毫秒无动作将跳转
function ScreenSaver(settings){   
    this.settings = settings;   
    //将无动作时间值作为实例属性
    this.nTimeout = this.settings.timeout;   
	//将目标地址作为实例属性
	if (this.settings.url)
	this.url = this.settings.url;   
	if (this.settings.callback) {
		this.callback = this.settings.callback;
	}
    document.body.screenSaver = this;   
    // link in to body events   
    document.body.onmousemove = ScreenSaver.prototype.onevent;   
    document.body.onmousedown = ScreenSaver.prototype.onevent;   
    document.body.onkeydown = ScreenSaver.prototype.onevent;   
    document.body.onkeypress = ScreenSaver.prototype.onevent;   
       
    var pThis = this;   
	//类的私有方法
    var f = function () {
        pThis.timeout();
    };
	//声明实例属性，一定时间后开始调用私有方法f
    this.timerID = window.setTimeout(f, this.nTimeout);   
}   
ScreenSaver.prototype.timeout = function () {
    if (!(this.saver)) {
        if (this.url)
            window.location = this.url;
        if (this.callback) {
            ($.proxy(this.callback, thisPage))();
        }
    }
};
ScreenSaver.prototype.signal = function () {
    if (this.saver) {
        this.saver.stop();
    }
    window.clearTimeout(this.timerID);
    var pThis = this;
    var f = function () {
        pThis.timeout();
    }
    this.timerID = window.setTimeout(f, this.nTimeout);
};
  
ScreenSaver.prototype.onevent = function (e) {
    this.screenSaver.signal();
};
