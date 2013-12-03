$(function() {
    if(!GLOBAL.Common)
        GLOBAL.namespace("Common");
    GLOBAL.Common.parseStr2Dom = function(data) {
        if (document.implementation.hasFeature('XML', '2.0')) {
            var parser = new DOMParser();
            var xmldom = parser.parseFromString(data.xml_dom, 'text/xml');
            data.callback(xmldom, data.other);
        }
        // 其他浏览器尝试使用AJAX方法读取本地xml文件
        else {
            console.log('the browser doesn\'t support DOM LEVEL 2 XML, AJAX method need here');
            $.get(data.xml_file, function(xml) {
                data.callback(xml, data.other);
            }, 'xml');
        }
    } ;
    GLOBAL.namespace("WatchGPS");
    /**
     * @Class  GLOBAL.WatchGPS 调用html5 地理位置接口函数获取当前地点的位置信息
     * @param config
     * @constructor
     */
    GLOBAL.WatchGPS = function (config) {
        var that = this;
        if (config) {
            this.onSuccess = config.onSuccess;
            this.onError = function (error) {
                GLOBAL.WatchGPS.handle_error(error);
                config.onError(error);
            };
            this.options_gps = config.options_gps || GLOBAL.Constant.options_gps;
        }
    };
    GLOBAL.WatchGPS.currGPS = null;
    GLOBAL.WatchGPS.lastGPS = null;
    GLOBAL.WatchGPS.logGPSId = 0; //TODO Only for gps log navigation
    GLOBAL.WatchGPS.handle_error = function (err){
        //错误处理
        console.log(err.code, err.message);
        switch (err.code) {
            case 1 :
                console.log("位置服务被拒绝。");
                break;
            case 2:
                console.log("暂时获取不到位置信息。");
                break;
            case 3:
                console.log("获取信息超时。");
                break;
            default:
                console.log("未知错误。");
                break;
        }
    }
    GLOBAL.WatchGPS.handle_position = function (position){
        var config = {
            lng:position.coords.longitude,
            lat:position.coords.latitude,
            altitude:position.coords.altitude
        };
        //将当前位置车位置经纬度存储在localStorage中，以便其他页面访问,尚未提供GPS接口
        GLOBAL.Common.modifyCurrentPosition(config);
    }
    GLOBAL.WatchGPS.GetCurrentPosition=function (){
        var watchGPS = GLOBAL.WatchGPS;
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(watchGPS.handle_position,watchGPS.handle_error);
        }else {
            console.log("你的浏览器不支持使用HTML5来获取地理位置信息。");
            location.href = '../safe/index.html';
        }
    }
    GLOBAL.WatchGPS.generateGPS = function(position) {
        var temp = parent.updateCoord(position.coords.latitude, position.coords.longitude),gpsinfo = {};
        if (parseFloat(temp.lon)) {
            gpsinfo.longitude = parseFloat(temp.lon);
        }
        if (parseFloat(temp.lat)) {
            gpsinfo.latitude = parseFloat(temp.lat);
        }
        gpsinfo.speed  = position.coords.speed * 3.6; //速度单位从m/s转换到km/h
        gpsinfo.direction = position.coords.heading;
        var date  = new Date() ;
        date.setTime(position.timestamp);
        // TODO 确认
        gpsinfo.year      = date.getFullYear();
        gpsinfo.month     = date.getMonth() + 1;
        gpsinfo.day       = date.getDate();
        gpsinfo.hour      = date.getHours();
        gpsinfo.minute    = date.getMinutes();
        gpsinfo.second    = date.getSeconds();
		if(typeof parent.logtest != "undefined"){
			var gpsinfostr = gpsinfo.longitude+","+gpsinfo.latitude+","+gpsinfo.speed+","+gpsinfo.direction+","+date.getTime()+",";
			parent.logtest.writeFile(gpsinfostr);
		}
        return gpsinfo;
    }
    GLOBAL.WatchGPS.prototype= {
        //通过html5接口轮询服务器，获取gps信息
        inspectCurrentGPS:function(){
            var that = this,watchGPS = null;
            if(navigator.geolocation && !GLOBAL.Constant.tbt_gpsLog_state)
                watchGPS = navigator.geolocation.watchPosition(function(position) {
                    that.onSuccess(position);
                }, that.onError, that.options_gps);
            else
                watchGPS = GLOBAL.NavClass.pushGPSLogLatLon();
            return watchGPS;
        }
    };

    /**
     *更新自车位置坐标
     */
    GLOBAL.Common.modifyCurrentPosition = function (config) {
        localStorage['Map_lng'] = config.lng;
        localStorage['Map_lat'] = config.lat;
        if(typeof config.direction !="undefined"){//自车mark方向
            localStorage['Map_direction'] = config.direction;
        }
        if(config.altitude !=undefined)
            localStorage['Map_altitude'] = config.altitude;
    };

    /**
     * 任意值以该方法存到到本地变量中
     * @param strName 本地变量名
     * @param anyValue 要存储到本地变量的值
     * @return {*} 存储后生成的本地变量的值
     */
    GLOBAL.Common.LocalSave={};
    GLOBAL.Common.LocalSave.save = function(strName, anyValue) {
        if (typeof strName !== 'string') {
            console.log('no local variable name');
            return;
        } else {
            if (JSON instanceof Object && JSON.stringify) {
                try {
                    localStorage[strName] = JSON.stringify(anyValue, function(key, value) {
                        if (value instanceof Function) {
                            return "(function)";
                        } else {
                            return value;
                        }
                    });
                } catch (e) {
                    console.log('error: ' + e.message);
                    if (e.type == "circular_structure") {
                        var str = dojox.json.ref.toJson(anyValue);
                        localStorage[strName] = str;
                    }
                }
            }
        }
        return localStorage[strName];
    }
    /**
     * 读取localStorage值的方法
     * @param strName 要读取的本地变量名
     * @return {*} 存储后生成的本地变量的值
     */
     GLOBAL.Common.LocalSave.read = function(strName) {
            if (JSON instanceof Object && JSON.parse) {
                    var any_value = JSON.parse(localStorage[strName]);
                    return any_value;
            }
     }
    /**
     * @description 存储poi数据
     * @param [poi] 对象类型
     **/
    GLOBAL.Common.savePoiData = function (poi) {
        var constant = GLOBAL.Constant,common = GLOBAL.Common;
        for (var p in poi) {
            if (tools.isBlank(poi[p])) {
                poi[p] = constant.null_value;
            }
        }
       if (parent.window && parent.window.GLOBAL) {
            parent.window.GLOBAL.Constant.poi_search_result = poi;
        }
        else {
            constant.poi_search_result = poi;
        }
    };
//    TODO 需要使用其他方法判断网络连接状态
    GLOBAL.Common.checkNet = function(){
        return top.window.navigator.onLine;
    };
    $('input').bind('keyup',function(){
        checkLength(30,$(this));
    });
    function checkLength(num,obj,show){
        var $input=obj;
        var length=$input.val().replace(/[^\x00-\xff]/g,'aa').length;
        var over=length-num;
        var chinaOver=over/2;
        if(length>num){
            $input.val($input.val().replace(eval("/[^\x00-\xff]{1}$|.$/"),""));
            checkLength(num,obj,show);
        }
    };
    //为输入框加入自动完成功能
    GLOBAL.Common.AutoCompleteHelper = function(city){
        //构建类实例
        var poiservice = typeof PoiSDK != "undefined"? PoiSDK : parent.window.PoiSDK , MPoi = new poiservice.PoiSearch({});
        return {
			source: function( request, response ) {
					MPoi.inputPrompt(request.term, city ,function( data ) {
                        var resultList = [];
                        if(typeof data.list != "undefined")
                            resultList = data.list;
					        response( $.map( resultList, function( item ) {
                                return {
                                    label: item,
                                    value: item
                                }
					    }))
					}); 
			},
			minLength: 1,
			select: function( event, ui ) {
                $( this ).value = this.value;
			},
			open: function() {
				$( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
			},
			close: function() {
				$( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
			}
		};
    };
    /**
     * 地图工具类
     */
     GLOBAL.Common.MapUtil = {
         /**根据道路形状点调整地图的zoom
         * @param mapObj {object}MMap.Map实例
	     * @param pathArray {array}路径形状的数组
         * @param w {Number} 地图宽度
         * @param h {Number} 地图高度
         */
        setPathZoom : function(mapObj,pathArray,w,h){
            var bounds = this.getPathBounds(pathArray);
            this.setBounds(mapObj,bounds,w,h);
        },
        /**
         * 根据bounds计算地图缩放级别
         * @param mapObj {object}MMap.Map实例
         * @param bounds {object}{southwest,northeast}
         * @param w {Number} 地图宽度
         * @param h {Number} 地图高度
         */
        setBounds : function (mapObj , bounds , w , h){
            if(typeof bounds.southwest == "undefined" || typeof bounds.northeast == "undefined"){
                console.log("invalid bounds.");
                return;
            }
            var distance = mapObj.getDistance(bounds.southwest , bounds.northeast),
                centerPoint = new MMap.LngLat((bounds.southwest.lng+bounds.northeast.lng)/2,(bounds.southwest.lat+bounds.northeast.lat)/2);
            if(typeof w !="Number" || w <= 0 ) w = 800;//默认宽度
            if(typeof h !="Number" || h <= 0 ) h = 480;//默认高度
            //计算分辨率
            var resoultion = Math.round(distance) / Math.sqrt(Math.pow(w,2)+Math.pow(h,2));
            //计算ZOOM级别
            var level = Math.floor(Math.LOG2E * Math.log(Math.cos(centerPoint.lat * Math.PI/180)*2*Math.PI*6378137.0/resoultion/256))-1;
            mapObj.setZoomAndCenter(level,centerPoint);
        },
        /**
         * 计算道路的外接矩形，记录下左下(西南)和右上(东北)的两个点经纬度坐标
         * @param pathArray{array} lnglat数组
         */
        getPathBounds : function (pathArray){
            var bounds = {minX:180,minY:90,maxX:-180,maxY:-90},
                compare = function(lnglat){
                    bounds.minX = Math.min(lnglat["lng"], bounds.minX);
                    bounds.minY = Math.min(lnglat["lat"], bounds.minY);
                    bounds.maxX = Math.max(lnglat["lng"], bounds.maxX);
                    bounds.maxY = Math.max(lnglat["lat"], bounds.maxY);
                };

            for(var i=0;i<pathArray.length;i++){
                compare(pathArray[i]);
            }
            return {'southwest': new MMap.LngLat(bounds.minX,bounds.minY),'northeast':new MMap.LngLat(bounds.maxX,bounds.maxY)};
        }
     };
});