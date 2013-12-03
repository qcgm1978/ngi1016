(function(){

var MRoute = {};
MRoute.Conf = {
	"version":"3.1-beta-0229",
	server : "Server/route.php"
};

var Class = function() {
	//创建一个新类
    var cls = function() {
        if (arguments && arguments[0] != Class.isPrototype) {//第一个参数不为空函数时
            this["initialize"].apply(this, arguments);//构造函数
        }
    };
    var extended = {};
    var parent, initialize;
    for(var i=0, len=arguments.length; i<len; ++i) {
        if(typeof arguments[i] == "function") {
            //使第一个参数成为超类的基类
            if(i == 0 && len > 1) {
                initialize = arguments[i].prototype["initialize"];
                // 用户一个空函数替换initialize方法，因为我们不需要在此实例化。
                arguments[i].prototype["initialize"] = function() {};
                //确保新类有一个超类
                extended = new arguments[i];
                //还原原始的initialize方法
                if(initialize === undefined){
                    delete arguments[i].prototype["initialize"];
                }else{
                    arguments[i].prototype["initialize"] = initialize;
                }
            }
            //获得一个超类的原型
            parent = arguments[i].prototype;
        } else {
            //扩展原型
            parent = arguments[i];
        }
        extend(extended, parent);
    }
    cls.prototype = extended;
    return cls;
};

Class.isPrototype = function () {};
/**
 +------------------------------------------------------------------------------
 * 函数: extend
 * 复制源对象中所有所有属性到目标对象，以达到类继承的目的
 +------------------------------------------------------------------------------
 * 
 * > extend(destination, source);
 +------------------------------------------------------------------------------
 */
var extend = function(destination, source) {
    destination = destination || {};
    if(source) {
        for(var property in source) {
            var value = source[property];
            if(value !== undefined) {
                destination[property] = value;
            }
        }
        var sourceIsEvt = typeof window.Event == "function" && source instanceof window.Event;
        if(!sourceIsEvt && source.hasOwnProperty && source.hasOwnProperty('toString')) {
            destination.toString = source.toString;
        }
    }
    return destination;
};

/**
 +----------------------------------------------------------
 * 请求发送类
 +----------------------------------------------------------
 * @return Number
 +----------------------------------------------------------
 */
MRoute.MyResult = {};//请求结果缓存对象
MRoute["_xdc_"]  = function(rid,data){
	MRoute.MyResult[rid] = data;
};//查询结果缓存对象

MRoute["Request"] = function(url,func){
	var rid = Math.round(Math.random()*100000);
	var __script = document.getElementById(rid);
	if(__script){document.getElementsByTagName("head")[0].removeChild(__script);}
	__script = document.createElement("script");
	__script.id = rid;
	__script.type = "text/javascript";
	__script.src = url + "&cbk=MRoute._xdc_&rid="+rid;
	document.getElementsByTagName("head")[0].appendChild(__script);
	var __self = this;
	if (/msie/i.test(navigator.userAgent) && !/msie 9.0/i.test(navigator.userAgent)) {//IE
		__script.onreadystatechange = function (){
			if(this.readyState=="loaded" || this.readyState=="complete"){
				__self.ajaxResult();
			}
		}
	}else{//firefox,chrom etc.
		__script.onload = function (){
			__self.ajaxResult();
		};
		__script.onerror = function(){
            if(func){
                func(null);
            }
			//alert("搜索服务出现异常,请联系MapABC,感谢!\n\r"+url);
		};
	}
	
	this.ajaxResult = function(){
		if(MRoute.MyResult[rid]){//加载服务数据
			if(func){
				func(MRoute.MyResult[rid]);
			}
			document.getElementsByTagName("head")[0].removeChild(document.getElementById(rid));//删除JS文件
			MRoute.MyResult[rid] = null;
			delete MRoute.MyResult[rid];
		}else{
			//alert("搜索服务出现异常,请联系MapABC,感谢!\n\r"+url);
            if(func){
                func(MRoute.MyResult[rid]);
            }
		}
	}
};
/**
 +------------------------------------------------------------------------------
 * Base64处理数据类
 +------------------------------------------------------------------------------
 */
MRoute.Base64 = Class({
	// private property
    keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",  
	
	"initialize":function(){
		
	},
    // public method for encoding  
    encode : function (input){
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        input = this._utf8_encode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);  
            chr3 = input.charCodeAt(i++);  
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);  
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);  
            enc4 = chr3 & 63;  
            if (isNaN(chr2)) {  
                enc3 = enc4 = 64;  
            } else if (isNaN(chr3)) {  
                enc4 = 64;  
            }  
            output = output +  
            this.keyStr.charAt(enc1) + this.keyStr.charAt(enc2) +  
            this.keyStr.charAt(enc3) + this.keyStr.charAt(enc4);  
        }  
        return output;  
    } ,
   
    // public method for decoding  
    _decode_ : function (input) {
        var output = "";  
        var chr1, chr2, chr3;  
        var enc1, enc2, enc3, enc4;  
        var i = 0;  
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");  
        while (i < input.length) {  
            enc1 = this.keyStr.indexOf(input.charAt(i++));  
            enc2 = this.keyStr.indexOf(input.charAt(i++));  
            enc3 = this.keyStr.indexOf(input.charAt(i++));  
            enc4 = this.keyStr.indexOf(input.charAt(i++));  
            chr1 = (enc1 << 2) | (enc2 >> 4);  
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);  
            chr3 = ((enc3 & 3) << 6) | enc4;  
            output = output + String.fromCharCode(chr1);  
            if (enc3 != 64) {  
                output = output + String.fromCharCode(chr2);  
            }
            if(enc4 != 64) {  
            	output = output + String.fromCharCode(chr3);  
            }
        }
        output = this._utf8_decode(output);
        return output;  
    },
    // private method for UTF-8 encoding  
    _utf8_encode : function (string) {  
        string = string.replace(/\r\n/g,"\n");  
        var utftext = "";  
        for (var n = 0; n < string.length; n++) {  
            var c = string.charCodeAt(n);  
            if(c < 128) {  
                utftext += String.fromCharCode(c);  
            }else if((c > 127) && (c < 2048)) {  
                utftext += String.fromCharCode((c >> 6) | 192);  
                utftext += String.fromCharCode((c & 63) | 128);  
            }else{  
                utftext += String.fromCharCode((c >> 12) | 224);  
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);  
                utftext += String.fromCharCode((c & 63) | 128);  
            }
        }
        return utftext;  
    },
   
    // private method for UTF-8 decoding  
    _utf8_decode : function (utftext) {  
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;
        while ( i < utftext.length ){
            c = utftext.charCodeAt(i);
            if(c < 128){
                string += String.fromCharCode(c);  
                i++;
            }else if((c > 191) && (c < 224)) {  
                c2 = utftext.charCodeAt(i+1);  
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));  
                i += 2; 
            }else {
                c2 = utftext.charCodeAt(i+1);  
                c3 = utftext.charCodeAt(i+2);  
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));  
                i += 3;
            }
        }  
        return string;  
    }
});

var ONERADIAN = 57.29578;				          //一弧度对应的角度值
var LONG_DISTANCE = 39940.67;			          // 地球子午线长，单位：km
var LATI_DISTANCE = 40075.36;			          // 赤道长，单位：km
var LONG_DISTANCE_PER_DEGREE = LONG_DISTANCE / 360; // 纬度改变一度，对应经线的距离，单位：km
var LATI_DISTANCE_PER_DEGREE = LATI_DISTANCE / 360; //经度改变一度，对应纬线的距离，单位：km
var CoordFactor = 3600 * 64;

// 根据两点的经纬度坐标（单位为度），估算其距离（单位：km）
function GetMapDistance(sx, sy, ex, ey) {
    var meanlati = (sy + ey) / 2.0;
    var tmpdist = LATI_DISTANCE_PER_DEGREE * Math.sin((90.0 - meanlati) * Math.PI / 180.0);

    var longDist = (sx - ex) * tmpdist;
    var latiDist = (ey - sy) * LONG_DISTANCE_PER_DEGREE;

    return Math.sqrt(longDist * longDist + latiDist * latiDist);
}

function GetMapDistInMeter(sx, sy, ex, ey) {
    return Math.round(0.5 + 1000 * GetMapDistance(sx, sy, ex, ey));
}

// 计算两点构成的方向角，单位：弧度 0 -2*PI
function CalcMathAngle(fStartLon, fStartLat, fEndLon, fEndLat) {
    var fAngle = 0.0;
    if (fEndLon != fStartLon) {
        var ftmp = Math.cos((fEndLat + fStartLat) / (2 * ONERADIAN));
        var fAtan = (fEndLat - fStartLat) / (fEndLon - fStartLon) / ftmp;
        fAngle = Math.atan(fAtan);
        if (fEndLon - fStartLon < 0)
            fAngle += Math.PI;
        else if (fAngle < 0)
            fAngle += 2 * Math.PI;
    }
    else {
        if (fEndLat > fStartLat) {
            fAngle = Math.PI / 2;
        }
        else if (fEndLat < fStartLat) {
            fAngle = Math.PI / 2 * 3;
        }
        else if (fEndLat == fStartLat) {
            fAngle = 0;
        }
    }
    return fAngle;
}

function TestInfoLog(str){
    if(parent!= null && parent["logtest"]){
        parent["logtest"]["writeFile"](str);
    }
//    else{
//        console.log(str);
//    }
}

// 以正北为0度，角度按顺时针方向增长， 范围0-2*PI
function CalcGeoAngle(fStartLon, fStartLat, fEndLon, fEndLat)
{
    var fAngle = CalcMathAngle(fStartLon, fStartLat, fEndLon, fEndLat);

    fAngle = Math.PI * 5 / 2 - fAngle;
    if (fAngle > Math.PI * 2) {
        fAngle = fAngle - Math.PI * 2;
    }

    return fAngle;
}

// 计算两点构成的方向角，单位：角度 0 - 360
function CalcGeoAngleInDegree(fStartLon, fStartLat, fEndLon, fEndLat) {

    var fAngle = CalcGeoAngle(fStartLon, fStartLat, fEndLon, fEndLat);
    return Math.round(fAngle * 180 / Math.PI);
}



/*
 * 求一个点到一条线的距离，
 *@return 最小距离，及线上最近点坐标，以度为单位的浮点经纬度坐标
 */
function FindNearPt(startX, startY, endX, endY, PtAx, PtAy) {
    var fPtB0 = 0.0,
        fPtB1 = 0.0,
        dX = endX - startX,
        dY = endY - startY,
        dR = -(startY - PtAy) * dY - (startX - PtAx) * dX,
        dL = dX * dX + dY * dY,
        dPercent = 0;

    if (dR <= 0) {
        dPercent = 0;
        fPtB0 = startX;
        fPtB1 = startY;
    }
    else if (dR >= dL) {
        dPercent = 1;
        fPtB0 = endX;
        fPtB1 = endY;
    }
    else {
        dPercent = dR / dL;
        fPtB0 = startX + dPercent * dX;
        fPtB1 = startY + dPercent * dY;
    }

    return [fPtB0, fPtB1, dPercent];
}

MRoute.GeoUtils = {

    /// 计算2点间距离 单位米
    CalculateDistance:function (x1, y1, x2, y2) {
        var earthRadiu = 6378137.0;
        earthRadiu = earthRadiu / 1000;
        var lon1 = this.Deg2Rad(x1),
            lat1 = this.Deg2Rad(y1),
            lon2 = this.Deg2Rad(x2),
            lat2 = this.Deg2Rad(y2),
            deltaLat = lat1 - lat2,
            deltaLon = lon1 - lon2,
            step1 = Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(lat2) * Math.cos(lat1) * Math.pow(Math.sin(deltaLon / 2), 2),
            step2 = 2 * Math.atan2(Math.sqrt(step1), Math.sqrt(1 - step1));
        return Math.round(step2 * earthRadiu * 1000);
    },

    Deg2Rad:function (deg) {
        return deg * Math.PI / 180;
    },

    Rad2Deg:function (rad) {
        return rad * 180 / Math.PI;
    }
};

/// 道路状态
MRoute.RouteStatus = {
    Status_Unknown:0, // 道路状态未知。
    Status_Expedite:1, // 道路通畅。
    Status_Congested:2, // 道路缓行。
    Status_Blocked:3, // 道路阻塞严重。
    Status_EndStatus:4    // 结尾状态，不应该使用。
};


/// 导航状态

MRoute.NaviState = {
    NaviState_NULL:0,
    NaviState_Common:1,
    NaviState_Routing:2,
    NaviState_StartNavi:3
};

MRoute.CalcRouteType =
{
    CalcRouteType_NULL:0,       // 无定义
    CalcRouteType_Reroute:1,    // Reroute类型
    CalcRouteType_Command:2     // 正常算路类型
};

// 路径策略
MRoute.PathStrategy =
{
    Strategy_SPEED:0, // 速度优先
    Strategy_FEE:1, // 费用优先(不走收费路段最快道路)
    Strategy_DISTANCE:2, // 距离优先
    Strategy_TMC_FUEL_LEAST:3, // TMC省油
    Strategy_TMC_FAST:4, // TMC最快
    Strategy_NORMAL_ROAD:5, // 不走快速路(不包含高速路)
    Strategy_NATIONAL:6, // 国道优先
    Strategy_PROVINCIAL:7, // 省道优先
    Strategy_MULTI_NORM:9, // 多策略1 ：速度优先+费用优先+距离优先
    Strategy_MULTI_AUDI:10, // 多策略2（针对audi）：TMC最快 +TMC省油+速度优先+费用优先
    Strategy_MULTI_TB:11    // 多策略3： TMC最快 +速度优先
};

// 算路附加标记
MRoute.CalcFlag = {
    Flag_INVALID:0, // 初始化的无效数据
    Flag_STREET_NAME:0X00000001, // 道路名称?omit
    Flag_COORD_POS:0X00000002, // 坐标数据?omit
    Flag_DIST_LIMIT:0X00000004, // new 起点找路是否有距离的限制(超过50m则不进行算路)
    Flag_TMC:0X00000008, // 是否包含动态交通信息

    Flag_TIME_TMC:0X00000010, // new 旅行时间表示实际的旅行时间还是参考旅行时间(有tmc时有效)
    Flag_LOC_CODE:0X00000020, // 是否包含导航段的Lcode信息
    Flag_CROSSING:0X00000080, // 路口数据(保留)

    Flag_TARGET_INFO:0X00000100, // 目标信息
    Flag_FROM_CS:0X00000200, // 从Callcenter获取信息标示
    Flag_UTURN:0X00000400, // 是否允许调头
    Flag_PREVIEW:0X00000800, // 是否允许预览抽稀
    Flag_PROMPT_EFF:0X00001000, // new 是否提及提升效率

    Flag_STRAIGHT_GUIDE:0X00010000, // 距离大于2000m中间添加直行点
    Flag_INGNORE_LIGHT:0X00020000, // 忽略红绿灯(保留)?conflict
    Flag_DETAIL_ROAD_ATTR:0X00040000, // 详细道路属性?omit

    Flag_TRAFFIC_SAFETY:0X00100000, // 交通安全信息
    Flag_DYNAMIC_TRAFFIC:0X00200000, // 动态交通信息?omit
    Flag_COMPRESS_DATA:0X00400000, // 是否压缩数据
    Flag_USE_ALTERNATE:0X00800000, // 是否启用多条备选路径计算

    Flag_FRAG_DOWNLOAD:0X01000000, // new 是否启用分段下载
    Flag_MAIN_ASSIST:0X02000000, // new 是否启用主辅路双路径模式（此模式下其它多路径选项无效）
    Flag_NON_GUIDE_ROAD:0X10000000, // 是否启用非导航道路
    Flag_TRAFFIC_CALC:0X20000000, // 是否启用动态交通信息参与路径计算

    Flag_MULTI_ROUTE_CALC:0X40000000             // 是否启用多路经计算?omit
};

// 计算路径类型
MRoute.CalcType = {
    CalcType_NULL : -1,				// 无定义
    CalcType_Best : 0,				// 最优路径
    CalcType_High : 1,				// 快速路优先
    CalcType_Dist : 2,				// 距离优先
    CalcType_Norm : 3,				// 普通路优先
    CalcType_TMC : 4,				// 考虑实时路况的路线
    CalcType_Multi : 5				// 多路径
};

MRoute.Direction = {
    RouteDire_NULL:0, // 无效道路方向
    RouteDire_North:1, // 北向道路方向
    RouteDire_North_East:2, // 东北道路方向
    RouteDire_East:3, // 东向道路方向
    RouteDire_East_South:4, // 东南道路方向
    RouteDire_South:5, // 南方道路方向
    RouteDire_West_South:6, // 西南道路方向
    RouteDire_West:7, // 西方道路方向
    RouteDire_West_North:8    // 西北道路方向
};
// 请求路径状态
MRoute.RouteRequestState = {
    RouteRequestState_NULL : 0,				// 无定义
    RouteRequestState_Success : 1,			// 路径计算成功
    RouteRequestState_TimeOut : 2,			// 网络超时
    RouteRequestState_NetERROR : 3,			// 网络失败
    RouteRequestState_RequestParError : 4,	// 请求参数错误
    RouteRequestState_DataFormatError : 5,	// 返回数据格式错误
    RouteRequestState_StartNoRoad : 6,		// 起点周围没有道路
    RouteRequestState_StartOnWalkRoad : 7,	// 起点在步行街
    RouteRequestState_EndNoRoad : 8,		// 终点周围没有道路
    RouteRequestState_EndOnWalkRoad : 9,	// 终点在步行街
    RouteRequestState_ViaNoRoad : 10,		// 途经点周围没有道路
    RouteRequestState_ViaOnWalkRoad : 11	// 途经点在步行街
};

MRoute.PlayMode ={
    PlayMode_NULL:0,    //无效模式
    PlayMode_Common:1,  //正常模式
    PlayMode_Count:2    //数路口模式
};

MRoute.ProbeResult = {
    ProbeResult_NoGPS:0,  // can not sample GPS
    ProbeResult_Normal:1, // trigger with freqency condition, send to Server
    ProbeResult_Turning:2 // trigger with car is tuning, send to Server
};
MRoute.PicState = {
    Traffic_Pic_NULL:0,
    Traffic_Pic_Show:1,
    Traffic_Pic_Hide:2,
    Traffic_Pic_Change:3
};

MRoute.ConnectId = {
    CONNECTID_LOGON:0x1,
    CONNECTID_LOGOFF:0x2,
    CONNECTID_TRAFFIC:0x3,
    CONNECTID_PIC:0x4,
    CONNECTID_ROUTE:0x5
};


MRoute.RadioFlag = {
    FLAG_FORCE_UPLOAD:0x1,
    FLAG_REGION_BOARD:0x2,
    FLAG_NO_FILTER:0x4,
    FLAG_DESCRIPTION:0x8,
    FLAG_INCIDENT:0x10,
    FLAG_ASSIST_ROAD:0x20
};

/// 光柱方向
MRoute.ColorBarDirection = {
    ColorBarDirection_NULL:0,   /// 无定义
    ColorBarDirection_Vertical:1,   /// 垂直方向
    ColorBarDirection_Horizontal:2  /// 水平方向
};

MRoute.CameraType = {
    CameraType_Speed:0,     /// 测速
    CameraType_Monitor:1    /// 监控摄像
};

MRoute.PlayGrade = {
    PlayGrade_NULL:0,   /// 无效播报
    PlayGrade_Start:1,  /// 开始概要播报
    PlayGrade_After:2,  /// 过后音
    PlayGrade_Far:3,     /// 远距离提示
    PlayGrade_Mid:4,    /// 中距离提示
    PlayGrade_MMid:5,	// 最短预报
    PlayGrade_Near:6,    /// 近距离提示
    PlayGrade_Real_Time:7,  /// 实时播报
    PlayGrade_Arrive:8 /// 到达提示
};

///  网络请求状态
MRoute.NetRequestState = {
    NetRequestState_NULL:0,     /// 无定义
    NetRequestState_OK:1,   ///  请求成功
    NetRequestState_TimeOut:2,  /// 请求超时
    NetRequestState_Error:3     /// 错误
};

/// 网络请求类型
MRoute.NetType = {
    NetType_UDP_IP:1,   /// IP方式UDP
    NetType_TCP_IP:2,   /// IP方式TCP
    NetType_UDP_DN:3,   /// 域名方式UDP
    NetType_TCP_DN:4    /// 域名方式TCP
};

/// 位置匹配状态
MRoute.VPStatus = {
    VPStatus_OnRoute:0,     /// 在路径上
    VPStatus_OnLink:1,      /// 没有在路径上但在道路上
    VPStatus_Unreliable:2   /// 没有在道路上
};

// FormWay对应常量列表
MRoute.Formway = {
    Formway_Divised_Link : 1,			// 1 主路
    Formway_Cross_Link : 2,				// 2 复杂节点内部道路
    Formway_JCT : 3,					// 3 高架
    Formway_Round_Circle : 4,			//  4 环岛
    Formway_Service_Road : 5,			// 5 辅助道路
    Formway_Slip_Road : 6,				// 6 匝道
    Formway_Side_Road : 7,				// 7 辅路
    Formway_Slip_JCT : 8,				// 8 匝道
    Formway_Exit_Link : 9,				// 9 出口
    Formway_Entrance_Link : 10,			// 10 入口
    Formway_Turn_Right_LineA : 11,		// 11 右转专用道
    Formway_Turn_Right_LineB : 12,		// 12 右转专用道
    Formway_Turn_Left_LineA : 13,		// 13 左转专用道
    Formway_Turn_Left_LineB : 14,		//  14 左转专用道
    Formway_Common_Link : 15,			//  15 普通道路
    Formway_Turn_LeftRight_Line : 16,	// 16 左右转专用道
    Formay_Count : 17,
    Formway_ServiceJCT_Road : 53,		// 53 高架(?与3区别)
    Formway_ServiceSlip_Road : 56,		// 56 匝道(?与58区别)
    Formway_ServiceSlipJCT_Road : 58	// 58 匝道(?与56区别)
};

// RoadClass对应常量列表
MRoute.RoadClass = {
    RoadClass_Freeway : 0,			// 0 高速公路
    RoadClass_National_Road : 1,	// 1 国道
    RoadClass_Province_Road : 2,	// 2 省道
    RoadClass_County_Road : 3,		//  3 县道
    RoadClass_Rural_Road : 4,		// 4 乡公路
    RoadClass_In_County_Road : 5,	// 5 县乡村内部道路
    RoadClass_City_Speed_way : 6,	// 6 主要大街、城市快速道
    RoadClass_Main_Road : 7,		// 7 主要道路
    RoadClass_Secondary_Road : 8,	// 8 次要道路
    RoadClass_Common_Road : 9,		//  9 普通道路
    RoadClass_Non_Navi_Road : 10,	// 10 非导航道路
    RoadClass_Count : 11			// RoadClass的个数
};

// LinkType对应常量列表
MRoute.LinkType = {
    LinkType_Common : 0,	//  0 普通道路
    LinkType_Ferry : 1,		//  1 航道
    LinkType_Tunnel : 2,	//  2 隧道
    LinkType_Bridge : 3,	// 3 桥梁
    LinkType_Count : 4		// LinkType的个数
};




/// 转向图标宏定义

MRoute.DirIcon = {
    
    /// 无定义
    
    DirIcon_NULL:0,
    
    /// 自车图标
    
    DirIcon_Car:1,
    
    /// 左转图标
    
    DirIcon_Turn_Left:2,
    
    /// 右转图标
    
    DirIcon_Turn_Right:3,
    
    /// 左前方图标
    
    DirIcon_Slight_Left:4,
    
    /// 右前方图标
    
    DirIcon_Slight_Right:5,
    
    /// 左后方图标
    
    DirIcon_Turn_Hard_Left:6,
    
    /// 右后方图标
    
    DirIcon_Turn_Hard_Right:7,
    
    /// 左转掉头图标
    
    DirIcon_UTurn:8,
    
    /// 直行图标
    
    DirIcon_Continue:9,
    
    /// 到达途经点图标
    
    DirIcon_Way:10,
    
    /// 进入环岛图标
    
    DirIcon_Entry_Ring:11,
    
    /// 驶出环岛图标
    
    DirIcon_Leave_Ring:12,
    
    /// 到达服务区图标
    
    DirIcon_SAPA:13,
    
    /// 到达收费站图标
    
    DirIcon_TollGate:14,
    
    /// 到达目的地图标
    
    DirIcon_Destination:15,
    
    /// 进入隧道图标
    
    DirIcon_Tunnel:16
};


/// 导航类型

MRoute.NaviType = {
    
    /// 无效状态
    
    NaviType_NULL:0,
    
    /// GPS导航
    
    NaviType_GPS:1,
    
    /// 模拟导航
    
    NaviType_Emul:2
};


/// 播报等级

MRoute.PlayVoiceLeve = {
    
    /// 无效级别
    
    PlayVoiceLeve_NULL:0,
    
    /// 最高级别，用于播报必须马上播报的声音使用
    
    PlayVoiceLeve_RealTime:1,
    
    /// 紧急级别，一般用与导航指引播报
    
    PlayVoiceLeve_DGNavi:2,
    
    /// 一般级别，一般用与电子眼播报
    
    PlayVoiceLeve_DGCamere:3,
    
    /// 较低级别，一般用于路况播报
    
    PlayVoiceLeve_Radio:4
};


MRoute.AssistantAction = {
    
    /// 无辅助导航动作
    
    AssiAction_NULL:0x00,
    
    /// 进入主路
    
    AssiAction_Entry_Main:0x01,
    
    /// 进入辅路
    
    AssiAction_Entry_Side_Road:0x02,
    
    /// 进入高速
    
    AssiAction_Entry_Freeway:0x03,
    
    /// 进入匝道
    
    AssiAction_Entry_Slip:0x04,
    
    /// 进入隧道
    
    AssiAction_Entry_Tunnel:0x05,
    
    /// 进入中间岔道
    
    AssiAction_Entry_Center_Branch:0x06,
    
    /// 进入右岔路
    
    AssiAction_Entry_Right_Branch:0x07,
    
    /// 进入右岔路
    
    AssiAction_Entry_Left_Branch:0x08,
    
    /// 进入右转专用道
    
    AssiAction_Entry_Right_Road:0x09,
    
    /// 进入左转专用道
    
    AssiAction_Entry_Left_Road:0x0A,
    
    /// 进入中间道路
    
    AssiAction_Entry_Merge_Center:0x0B,
    
    /// 进入右侧道路
    
    AssiAction_Entry_Merge_Right:0x0C,
    
    /// 进入左侧道路
    
    AssiAction_Entry_Merge_Left:0x0D,
    
    /// 靠右行驶进入辅路
    
    AssiAction_Entry_Merge_Right_Sild:0x0E,
    
    /// 靠左行驶进入辅路
    
    AssiAction_Entry_Merge_Left_Sild:0x0F,
    
    /// 靠右行驶进入主路
    
    AssiAction_Entry_Merge_Right_MAIN:0x10,
    
    /// 靠左行驶进入主路
    
    AssiAction_Entry_Merge_Left_MAIN:0x11,
    
    /// 靠右行驶进入右转专用道
    
    AssiAction_Entry_Merge_Right_Right:0x12,
    
    ///
    
    AssiAction_Entry_Ferry:0x13,
    
    /// 沿当前道路行驶
    
    AssiAction_Along_Road:0x17,
    
    /// 沿辅路行驶
    
    AssiAction_Along_Sild:0x18,
    
    /// 沿主路行驶
    
    AssiAction_Along_Main:0x19,
    
    /// 到达出口
    
    AssiAction_Arrive_Exit:0x20,
    
    /// 到达服务区
    
    AssiAction_Arrive_Service_Area:0x21,
    
    /// 到达收费站
    
    AssiAction_Arrive_TollGate:0x22,
    
    /// 到达途经地
    
    AssiAction_Arrive_Way:35,
    
    /// 到达目的地的
    
    AssiAction_Arrive_Destination:0x24,
    
    /// 绕环岛左转
    
    AssiAction_Entry_Ring_Left:0x30,
    
    /// 绕环岛右转
    
    AssiAction_Entry_Ring_Right:0x31,
    
    /// 绕环岛直行
    
    AssiAction_Entry_Ring_Continue:0x32,
    
    /// 绕环岛右转
    
    AssiAction_Entry_Ring_UTurn:0x33,
    
    /// 小环岛不数出口
    
    AssiAction_Small_Ring_Not_Count:0x34,
    
    /// 到达复杂路口，走右边第一出口
    
    AssiAction_Right_Branch_1:0x40,
    
    /// 到达复杂路口，走右边第二出口
    
    AssiAction_Right_Branch_2:0x41,
    
    /// 到达复杂路口，走右边第三出口
    
    AssiAction_Right_Branch_3:0x42,
    
    /// 到达复杂路口，走右边第四出口
    
    AssiAction_Right_Branch_4:0x43,
    
    /// 到达复杂路口，走右边第五出口
    
    AssiAction_Right_Branch_5:0x44,
    
    /// 到达复杂路口，走左边第一出口
    
    AssiAction_Left_Branch_1:0x45,
    
    /// 到达复杂路口，走左边第二出口
    
    AssiAction_Left_Branch_2:0x46,
    
    /// 到达复杂路口，走左边第三出口
    
    AssiAction_Left_Branch_3:0x47,
    
    /// 到达复杂路口，走左边第四出口
    
    AssiAction_Left_Branch_4:0x48,
    
    /// 到达复杂路口，走左边第五出口
    
    AssiAction_Left_Branch_5:0x49,
    
    /// 辅助动作个数,一定要放最后一个
    
    AssistAction_Count:0x50
};

/// 道路速度限制 千米每小时

MRoute.LimitedSpeed = {
    LimitedSpeed_NULL:-1,
    LimitedSpeed_30:30,
    LimitedSpeed_40:40,
    LimitedSpeed_50:50,
    LimitedSpeed_60:60,
    LimitedSpeed_70:70,
    LimitedSpeed_80:80,
    LimitedSpeed_90:90,
    LimitedSpeed_100:100,
    LimitedSpeed_110:110,
    LimitedSpeed_120:120
};



/// 基本导航动作对应常量列表

MRoute.MainAction = {
    MainAction_NULL:0x0,            // 无基本导航动作
    MainAction_Turn_Left:0x1,       // 左转
    MainAction_Turn_Right:0x2,      // 右转
    MainAction_Slight_Left:0x3,     // 向左前方行驶
    MainAction_Slight_Right:0x4,    // 向右前方行驶
    MainAction_Turn_Hard_Left:0x5,  // 向左后方行驶
    MainAction_Turn_Hard_Right:0x6, // 向右后方行驶
    MainAction_UTurn:0x7,           // 左转调头
    MainAction_Continue:0x8,        // 直行
    MainAction_Merge_Left:0x9,      // 靠左
    MainAction_Merge_Right:0x0A,    // 靠右
    MainAction_Entry_Ring:0x0B,     // 进入环岛
    MainAction_Leave_Ring:0x0C,     // 离开环岛
    MainAction_Slow:0x0D,           // 减速行驶
    MainAction_Plug_Continue:0x0E,  // 插入直行（泛亚特有）
    MainAction_Count:0x0F
};

MRoute.OGGSound = {
    OGG_Distance_Kilometre_120:33, // 120公里
    OGG_Distance_Kilometre_110:32, // 110公里
    OGG_Distance_Kilometre_100:31, // 100公里
    OGG_Distance_Kilometre_90:30, // 90公里
    OGG_Distance_Kilometre_80:29, // 80公里
    OGG_Distance_Kilometre_70:28, // 70公里
    OGG_Distance_Kilometre_60:27, // 60公里
    OGG_Distance_Kilometre_50:26, // 50公里
    OGG_Distance_Kilometre_40:25, // 40公里
    OGG_Distance_Kilometre_30:24, // 30公里
    OGG_Distance_Kilometre_4:23, // 4公里
    OGG_Distance_Kilometre_3:22, // 3公里
    OGG_Distance_Kilometre_2:21, // 2公里
    OGG_Distance_Kilometre_1:20, // 1公里
    OGG_Distance_Meter_900:19, // 900米
    OGG_Distance_Meter_800:18, // 800米
    OGG_Distance_Meter_700:17, // 700米
    OGG_Distance_Meter_600:16, // 600米
    OGG_Distance_Meter_500:15, // 500米
    OGG_Distance_Meter_400:14, // 400米
    OGG_Distance_Meter_300:13, // 300米
    OGG_Distance_Meter_200:12, // 200米
    OGG_Distance_Meter_150:11, // 150米
    OGG_Distance_Meter_100:10, // 100米

    OGG_Along_Kilometre_35:160, // 前方有35公里以上顺行道路
    OGG_Along_Kilometre_15:161, // 前方有15公里以上顺行道路
    OGG_Along_Kilometre_5:162, // 前方有5公里以上顺行道路
    OGG_Along_All:163, // 请顺道路行驶，直到有新的导航提示
    OGG_Pass_SAPA:164, // 前方2公里有服务区，请适当休息

    OGG_MainAction_Turn_Left:200, //左转
    OGG_MainAction_Turn_Right:201, //右转
    OGG_MainAction_Left_Ahead:202, // 向左前方行驶
    OGG_MainAction_Right_Ahead:203, // 向右前方行驶
    OGG_MainAction_Left_Back:204, //向左后方行驶
    OGG_MainAction_Right_Back:205, //向右后方行驶
    OGG_MainAction_UTurn:206, // 左转掉头
    OGG_MainAction_Continue:207, // 直行
    OGG_MainAction_Merge_Left:208, // 靠左行驶
    OGG_MainAction_Merge_Right:209, // 靠右行驶
    OGG_MainAction_Pass_Ring:210, // 经过环岛
    OGG_MainAction_Exit_Ring:211, //驶出环岛
    OGG_MainAction_Slow:212, // 注意减速
    OGG_MainAction_Along_Road:214,

    OGG_MainAction_Entry_Ring:220, //进入环岛
    OGG_MainAction_FP_Exit_Ring:221, //前方请驶出环岛
    OGG_MainAction_Pass_Ring_Go:222, //经过环岛走
    OGG_MainAction_Slight_Left:223, //偏左转
    OGG_MainAction_Slight_Right:224, // 偏右转
    OGG_MainAction_Turn_Hard_Left:225, // 左后转
    OGG_MainAction_Turn_Hard_Right:226, // 右后转

    OGG_AssiAction_Entry_Main:300, // 进入主路
    OGG_AssiAction_Entry_Side_Road:301, // 进入辅路
    OGG_AssiAction_Entry_Freeway:302, // 进入高速路
    OGG_AssiAction_Entry_Slip:303, // 进入匝道
    OGG_AssiAction_Entry_Tunnel:304, // 进入隧道
    OGG_AssiAction_Entry_Center_Branch:305, // 进入中间岔路
    OGG_AssiAction_Entry_Right_Branch:306, // 进入右岔路
    OGG_AssiAction_Entry_Left_Branch:307, // 进入左岔路
    OGG_AssiAction_Entry_Right_Road:308, // 进入右转专用道
    OGG_AssiAction_Entry_Left_Road:309, // 进入左转专用道

    OGG_AssiAction_Entry_Center_Side_Road:310, //进入中间道路
    OGG_AssiAction_Entry_Right_Side_Road:311, //进入右侧道路
    OGG_AssiAction_Entry_Left_Side_Road:312, //进入左侧道路
    OGG_AssiAction_Along_Side:313, //沿辅路行驶
    OGG_AssiAction_Along_Main:314, //沿主路行驶
    OGG_AssiAction_Along_Right_Road:315, //沿右转专用道行驶

    OGG_AssiAction_Arrive_Exit:320, // 到达出口
    OGG_AssiAction_Arrive_Service_Area:321, // 到达服务区
    OGG_AssiAction_Arrive_TollGate:322, // 到达收费站
    OGG_AssiAction_Arrive_Way:323, // 到达途经点附近
    OGG_AssiAction_Arrive_Destination:324, // 到达目的地附近
    OGG_AssiAction_Arrive_Ferry:325, //到达轮渡码头附近
    OGG_AssiAction_Arrive_Ferry_Stop_Sound:326, //到达轮渡码头附近导航中断

    OGG_AssiAction_Front_Branck:327, //前方路口

    OGG_AssiAction_Left_Branch_1:335, // 走左数第一岔路
    OGG_AssiAction_Left_Branch_2:336, // 走左数第二岔路
    OGG_AssiAction_Left_Branch_3:337, // 走左数第三岔路
    OGG_AssiAction_Left_Branch_4:338, // 走左数第四岔路
    OGG_AssiAction_Left_Branch_5:339, // 走左数第五岔路
    OGG_AssiAction_Right_Branch_1:330, // 走右数第一岔路
    OGG_AssiAction_Right_Branch_2:331, // 走右数第二岔路
    OGG_AssiAction_Right_Branch_3:332, // 走右数第三岔路
    OGG_AssiAction_Right_Branch_4:333, // 走右数第四岔路
    OGG_AssiAction_Right_Branch_5:334, // 走右数第五岔路

    OGG_AssiAction_Exit_1:340, // 第一出口
    OGG_AssiAction_Exit_2:341, // 第二出口
    OGG_AssiAction_Exit_3:342, // 第三出口
    OGG_AssiAction_Exit_4:343, // 第四出口
    OGG_AssiAction_Exit_5:344, // 第五出口
    OGG_AssiAction_Exit_6:345, // 第六出口
    OGG_AssiAction_Exit_7:346, // 第七出口

    OGG_AssiAction_G0_Exit_1:347, // 走第一出口
    OGG_AssiAction_G0_Exit_2:348, // 走第二出口
    OGG_AssiAction_G0_Exit_3:349, // 走第三出口
    OGG_AssiAction_G0_Exit_4:350, // 走第四出口
    OGG_AssiAction_G0_Exit_5:351, // 走第五出口
    OGG_AssiAction_G0_Exit_6:352, // 走第六出口
    OGG_AssiAction_G0_Exit_7:353, // 走第七出口

    OGG_AssiAction_Pass_Exit_1:354, // 经过第一出口
    OGG_AssiAction_Pass_Exit_2:355, // 经过第二出口
    OGG_AssiAction_Pass_Exit_3:356, // 经过第三出口
    OGG_AssiAction_Pass_Exit_4:357, // 经过第四出口
    OGG_AssiAction_Pass_Exit_5:358, // 经过第五出口
    OGG_AssiAction_Pass_Exit_6:359, // 经过第六出口
    OGG_AssiAction_Pass_Exit_7:360, // 经过第七出口

    OGG_AssiAction_Road_1:370, // 第一路口
    OGG_AssiAction_Road_2:371, // 第二路口
    OGG_AssiAction_Road_3:372, // 第三路口
    OGG_AssiAction_Road_4:373, // 第四路口
    OGG_AssiAction_Road_5:374, // 第五路口
    OGG_AssiAction_Road_6:375, // 第六路口
    OGG_AssiAction_Road_7:376, // 第七路口
    OGG_AssiAction_Road_8:377, // 第八路口

    OGG_AssiAction_Pass_Road_1:380, // 经过第一路口
    OGG_AssiAction_Pass_Road_2:381, // 经过第二路口
    OGG_AssiAction_Pass_Road_3:382, // 经过第三路口
    OGG_AssiAction_Pass_Road_4:383, // 经过第四路口
    OGG_AssiAction_Pass_Road_5:384, // 经过第五路口
    OGG_AssiAction_Pass_Road_6:385, // 经过第六路口
    OGG_AssiAction_Pass_Road_7:386, // 经过第七路口
    OGG_AssiAction_Pass_Road_8:387, // 经过第八路口

    OGG_Then:400,       // 随后
    OGG_Forword:401,    // 前方
    OGG_Is:402,         // 是
    OGG_Target:403,     // 方向

    OGG_Please_At:404,  //请在
    OGG_Pass:405,       //经过
    OGG_Please:406,     //请

    OGG_Drive_Carefully:421,                // 请谨慎驾驶
    OGG_Have_Continuous_Camera:422,         // 有连续摄像
    OGG_Have_Speed_Camera:423,              // 有测速摄像
    OGG_Have_Surveillance_Camera:424,       // 有监控摄像

    OGG_POIType_Traffic_Accident:451,           // 发生交通事故
    OGG_POIType_Serious_Traffic_Accident:452,   // 发生严重交通事故
    OGG_POIType_Construct:453,                  // 占路施工
    OGG_POIType_Traffic_Control:454,            // 交通管制
    OGG_POIType_Move_Low:455,                   // 行驶缓慢
    OGG_POIType_Move_Fast:456,                  // 行驶畅通
    OGG_POIType_Traffic_JAM:457,                // 交通拥堵

    OGG_Navi_End:601,                           // 本次导航结束
    OGG_Reroute:602,                            // 重新计算路径
    OGG_Navi_Start:603,                         // 开始导航
    OGG_Stop_Navi:604,                          // 结束导航
    OGG_Dong:605,                               // 咚
    OGG_GPS_OK:606,                             // GPS信号正常
    OGG_Volum:607,                              // 这是当前音量
    OGG_Max_Volum:608,                          // 这是最大音量
    OGG_Power_Low:609,                          // 电力不足，请及时充电
    OGG_Receive_Destination:610,                // 收到下发目的地
    OGG_Exceed_Speed_Limt:611,                  // 您已超速
    OGG_Current_Road_SPeed_Limt:612,            // 当前道路限速
    OGG_Off_ROute:613                           // 你已经偏离了预设路线
};

/**
 +----------------------------------------------------------
 * 经纬度对象对象
 +----------------------------------------------------------
 * 
 +----------------------------------------------------------
 */
MRoute.LngLat = Class({
	//经度
	lng:0,
	//维度
	lat:0,
	/**
	 +------------------------------------------------------------------------------
	 * 构建经纬度坐标
	 +----------------------------------------------------------
	 * @param lng {Number}
	 * @param lat {Number}
	 +------------------------------------------------------------------------------
	 */
	"initialize":function(lng,lat){
		if(isNaN(lng)){throw new Error("MMap.LngLat<lng>参数无效:"+lng+"\r");}
		if(isNaN(lat)){throw new Error("MMap.LngLat<lat>参数无效:"+lat+"\r");}
		this.lng = Number(Number(lng).toFixed(8));
		this.lat = Number(Number(lat).toFixed(8));
	}

});

MRoute.TMCBarItem = Class({
    code:0,
    dist:0,
    state:0,
    "initialize":function(code, dist, state){
        this.code = code;
        this.dist = dist;
        this.state = state;
    }
});
/**
 +----------------------------------------------------------
 * 路径共有属性类。当一次请求多条路径时，存在一些路径的共有属性，为了减少冗余，这些属性统一存储，每条路径保存其应用。
 +----------------------------------------------------------
 * 已结束
 +----------------------------------------------------------
 */
MRoute.TmcInfo = Class({
	"initialize":function(){
		this.locationCode = 0;	// 动态交通信息位置编码
		this.locationDist = 0;	// 动态交通信息位置编码对应道路长度
		this.locationTime = 0;	// 行驶此段距离预计的时间。
	},
	/**
	 * 获取LocationCode。
	 * @deprecated 为了兼容保留此接口，但以后不建议再使用，可以使用 getLCode()替代。
	 * @return LocationCode对应的ID,低15位表示LCode，第16位表示方向，0为正向，1为反向。
	 * @author 周琦
	 */
	getLocationCode:function(){
		return this.locationCode;
	},
	
	/**
	 * 获取LocationCode。原始值是双字节表示的，最高位是符号位，需要转成相应的整型，在请求时用转化后的数值请求
	 * @return LocationCode对应的ID，如果是正向LocationCode，则返回值大于0，如果为负向LocationCode，返回值小于0。
	 */
	getLCode:function(){
		if((this.locationCode & 0x8000) == 0){
			return this.locationCode;
		}else{
			return -(this.locationCode & 0x7fff);
		}		
	},
	
	/**
	 * 获取此LocationCode对应的道路长度。
	 * @return 长度，单位：米。
	 */
	getLength:function(){
		return this.locationDist;
	},
	
	/**
	 * 获取此LocationCode路段所需的时间。
	 * @return 时间，单位：秒。
	 */
	getTime:function(){
		return this.locationTime;
	}
	
});
/**
 +----------------------------------------------------------
 * 路牌类型
 +----------------------------------------------------------
 * 已结束
 +----------------------------------------------------------
 */
MRoute.RoadSign = Class({
	_type : 0,
	_content : null,
	
	"initialize":function(){
		
	},
	
	/**
	 * 获取路牌类型。
	 * @return 返回路牌类型。
	 */
	getType:function(){
		return this._type;
	},
	
	/**
	 * 获取路牌内容。	
	 * @return 返回路牌内容。
	 */
	getContent:function(){
		return this._content;
	},
	
	/**
	 * 设置路牌类型
	 * @param type 路牌类型，目前的取值范围为1-7。
	 */
	setType:function(type){
		this._type = type;
	},
	
	/**
	 * 设置路牌内容。
	 * @param content 路牌内容，不能为null。
	 */
	setContent:function(content){
		if(content == null){
			throw Error("road signs cannot be null");
		}
		this._content = content;
	}
});

MRoute.PathDecode = Class({
	stream:0,
	paths : null,
	sharedSegs : null,
	sharedPathAttribute : null,
	
	"initialize":function(base64){
		var binary = this.decodebase64(base64);
		//将二进制解码
		this._decode_(binary);
		//console.log(this.paths);
	},
	/**
	 +----------------------------------------------------------
	 * BASE64解码数据为二进制
	 +----------------------------------------------------------
	 * @param input [base64]
	 * @return [binary]
	 +----------------------------------------------------------
	 */
	decodebase64 : function (input) {//base64解码
        var output = "",keyStr="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="; 
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4, i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");  
        while (i < input.length) {  
            enc1 = keyStr.indexOf(input.charAt(i++));  
            enc2 = keyStr.indexOf(input.charAt(i++));  
            enc3 = keyStr.indexOf(input.charAt(i++));  
            enc4 = keyStr.indexOf(input.charAt(i++));  
            chr1 = (enc1 << 2) | (enc2 >> 4);  
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);  
            chr3 = ((enc3 & 3) << 6) | enc4;  
            output = output + String.fromCharCode(chr1);  
            if (enc3 != 64){
                output = output + String.fromCharCode(chr2);  
            }
            if(enc4 != 64){
            	output = output + String.fromCharCode(chr3);  
            }
        }
        return output;
    },
	/**
	 +----------------------------------------------------------
	 * 字节转文本
	 +----------------------------------------------------------
	 * @param buf 字节数组
	 * @param offset 起始值
	 * @param lenth 变化量
	 * @return [String] 文本 
	 +----------------------------------------------------------
	 */	
	byte2text:function(buf, offset, lenth){
		var arr = [],text=[];
		for(var i=offset;i<(offset+lenth);i++){
			text.push(String.fromCharCode(buf[i+1]<<8|(buf[i]&0xFF)));
			i++
		}
		return text.join("");
	},
	intbyte:function(i){
		return (i>127?i-256:i);
	},
	intshort:function(i){
		return (i>32767?i-65536:i);
	},
	/**
	 +----------------------------------------------------------
	 * 字节解码
	 +----------------------------------------------------------
	 * @param buf 字节数组
	 * @param offset 起始值
	 * @param offset 变化量
	 * @return [String] 文本 
	 +----------------------------------------------------------
	 */	
	_decode_:function(is){
		// 1 读取包头
		var i=0,header=[];
		while(i<8){//取8个字节
			header.push((is.charCodeAt(this.stream) & 0xff).toString());
			i++;this.stream++;
		}
		if(i<8){
			throw Error("Failed to read package header.");
		}
		// 1.1 获取数据包长度 3B
		var len = ((header[0] & 0xFF)) + ((header[1] & 0xFF) << 8) + ((header[2] & 0xFF) << 16);// 2846
		// 1.2 获取协议版本 1B,并检查是否支持
		if (!this.checkVersion(header[3] & 0xFF)){
			throw Error("Unsupported protocol.");
		}

		// 1.3 获得错误代码 1B
		var errorCode = header[4] & 0xFF;
		if (errorCode != 0){
			throw Error("Failed to resolve any path with error code:" + errorCode);
		}
		// 1.4 获得时间戳 2B
		var timestamp = ((header[5] & 0xFF)) + ((header[6] & 0xFF) << 8);
		
		// 1.5 获得控制信息 1B
		var ctrlflag = header[7] & 0xFF;
		// 至此，数据包头已经解析完成
		var spa = new MRoute.SharedPathAttribute();
		spa.timestamp = timestamp;
		spa.lineSimplification = (ctrlflag & 0x10) != 0;
		spa.hasDivideInfo = (ctrlflag & 0x20) != 0;
		this.sharedPathAttribute = spa;

		var cis = is;
		if ((ctrlflag & 0x8) != 0) {
			// 不支持zlib压缩
			throw Error("Compression is not unsupported.");
		}

		// idx记录解析的长度
		var idx = header.length;

		// 2 如果存在预览信息，则 解析预览信息
		if ((ctrlflag & 0x1) != 0) {
			// 如果含有上次解析的路径，则重置解码器
			if (this.paths != null){
				this.reset();
			}
			// 解析预览信息，累加解析长度
			idx += this.decodePreviewInfo(cis);
		}

		// 3 如果存在详细信息，则解析详细信息
		if ((ctrlflag & 0x2) != 0) {
			// 如果包含详细信息
			while (idx < len) {
				idx += this.decodeDetailInfo(cis);
			}
		}

		// 如果最终解析长度与包长度不一致，则解析失败
		if (idx != len){
			throw new DecodeException("Failed to decode,package length does not match.");
		}
		
		return this.paths;
	},
	/**
	 * 从路径数据流中解析出一条路径的预览信息。
	 * 
	 * @param is
	 *            路径数据流，必须从下个字节开始都是预览数据。
	 * @return 预览数据的长度。
	 * @throws IOException
	 *             读取流发生错误，抛出此异常。
	 * @throws DecodeException
	 *             如果路径数据存在问题，无法按其解析出路径，则抛出此异常。
	 * @throws NullPointerException
	 *             如果is为null，抛出此异常。
	 */
	decodePreviewInfo:function(is){
		if (is == null){
			throw Error("Input stream can not be null.");
		}
		// 1.1 计算预览包长度 2B
		var i=0,lenBuf=[];//value: -28,1
		while(i<2){//取2个字节
			lenBuf[i] = (is.charCodeAt(this.stream) & 0xff).toString();
			i++;this.stream++;
		}
		if (i<2) {
			throw Error("Failed to read the length of detail data.");
		}
		var packlens = ((lenBuf[0] & 0xFF)) + ((lenBuf[1] & 0xFF) << 8);//value: 372

		// 读取预览包的内容
		var idx = 0,j=0,buf=[], ite=0;
		while(j<(packlens-lenBuf.length)){//取n个字节
			buf[j] = (is.charCodeAt(this.stream) & 0xff).toString();
			j++;this.stream++;
		}
		if (j<(packlens-lenBuf.length)) {
			throw Error("Failed to read preview data.");
		}
		// 1.2 获取路径数目 1B
		var pathCount = buf[idx++] & 0xFF;
		if (pathCount == 0) {
			throw Error("Illegal preview data which has no path included.");
		}

		// 1.3 获取预览控制信息 1B
		var ctrlflag = buf[idx++] & 0xFF;
		
		// 1.4 获取终点信息
		if ((ctrlflag & 0x4) != 0) {
			idx += 32;
			var endlen = buf[idx++] & 0xFF;
			if (endlen > 0) {
				this.sharedPathAttribute.endPointName = this.byte2text(buf, idx, endlen*2);
				idx += endlen * 2;
			}
		}

		// 2.1 获取道路名称表长度 2B
		var namelens = ((buf[idx] & 0xFF)) + ((buf[idx + 1] & 0xFF) << 8);
		idx += 2;

		// 2.2 获取道路名称表地址,记录起始索引
		var nameidxs = idx;
		idx += namelens * 2;

		// 3.1 共用导航段数 2B
		var sharecount = ((buf[idx] & 0xFF)) + ((buf[idx + 1] & 0xFF) << 8);
		if (sharecount == 0) {
			throw Error("Illegal preview data which has no segment included.");
		}
		idx += 2;

		// 3.2 共用导航段信息
		var sharedSegs = [];
		for (var i = 0; i < sharecount; i++) {
			var seg = new MRoute.SharedSegmentAttribute();
			sharedSegs[i] = seg;
			var val;
			// 3.2.1 导航段行驶距离 2B
			val = ((buf[idx] & 0xFF)) + ((buf[idx + 1] & 0xFF) << 8);
			idx += 2;
			seg.passDist = (val & 0x8000) == 0 ? val : (val & 0x7FFF) << 5;

			// 3.2.2 导航段收费距离 2B
			val = ((buf[idx] & 0xFF)) + ((buf[idx + 1] & 0xFF) << 8);
			idx += 2;
			seg.tollDist = (val & 0x8000) == 0 ? val : (val & 0x7FFF) << 5;

			// 3.2.3 导航段名称+索引 1B + 2B
			var navilens = buf[idx++] & 0xFF;
			if (navilens > 0) {
				var naviidxs = ((buf[idx] & 0xFF)) + ((buf[idx + 1] & 0xFF) << 8);
				idx += 2;
				if (naviidxs < namelens){
					seg.roadName = this.byte2text(buf, nameidxs+naviidxs*2, navilens*2);
				}else{
					throw Error("Invalid name index");
				}
			}

			// 3.2.4 起点坐标 4B + 4B
			var x = ((buf[idx] & 0xFF)) + ((buf[idx + 1] & 0xFF) << 8) + ((buf[idx + 2] & 0xFF) << 16) + ((buf[idx + 3] & 0xFF) << 24);
			idx += 4;
			var y = ((buf[idx] & 0xFF)) + ((buf[idx + 1] & 0xFF) << 8) + ((buf[idx + 2] & 0xFF) << 16) + ((buf[idx + 3] & 0xFF) << 24);
			idx += 4;

			// 3.2.5 预览形状点
			if ((ctrlflag & 0x1) != 0) {
				val = ((buf[idx] & 0xFF)) + ((buf[idx + 1] & 0xFF) << 8);
				idx += 2;

				var count = val & 0x1FFF,
					scale = val >> 13;

				var ltx = x,
					lty = y;

				seg.simpleCoor = [];
				for (var k = 0; k < count; k++) {
					val = ((buf[idx] & 0xFF)) + ((buf[idx + 1] & 0xFF) << 8);
					idx += 2;
					ltx += this.intshort(val) << scale;
					
					val = ((buf[idx] & 0xFF)) + ((buf[idx + 1] & 0xFF) << 8);
					idx += 2;
					lty += this.intshort(val) << scale;

					seg.simpleCoor[2 * k + 2] = ltx;// *
													// 20;这里没有将坐标转为3600000倍，以服务端为准.
					seg.simpleCoor[2 * k + 3] = lty;// * 20;
				}
			}else{
				seg.simpleCoor = [];
			}
			seg.simpleCoor[0] = x;// * 20;
			seg.simpleCoor[1] = y;// * 20;

			// 3.2.6 交通信息
			if ((ctrlflag & 0x2) != 0) {
				var size = buf[idx++] & 0xFF;
				if (size < 0) {
					throw Error("Illegal count of TMC records");
				} else if (size == 0) {
					var ltime = ((buf[idx] & 0xFF)) + ((buf[idx + 1] & 0xFF) << 8);
					idx += 2;
					seg.tmcTime = ltime * 10;
				} else {
					var unit0 = (buf[idx++] & 0xFF) * 10;
					var tmcinf = [];
					for (var k = 0; k < size; k++) {
						var lcode = ((buf[idx] & 0xFF)) + ((buf[idx + 1] & 0xFF) << 8);
						idx += 2;
						var ldist = buf[idx++] & 0xFF,
							ltime = buf[idx++] & 0xFF;
						ltime *= 10;

						var tmcitem = new MRoute.TmcInfo();
						tmcinf[k] = tmcitem;
						tmcitem.locationCode = lcode;
						tmcitem.locationDist = ldist * unit0;
						tmcitem.locationTime = ltime;
						seg.tmcTime += ltime;
					}
					seg.tmcRecords = tmcinf;
				}
			}
		}
		// 4.开始处理路径信息
		var paths = [];
		var mainsegcount = 0; // 主路径导航段个数
		var mainsegment = null;
		for (var i = 0; i < pathCount; i++) {
			var path = new MRoute.NaviPath();
			path.sharedPathAttribue = this.sharedPathAttribute;
			var val;
			// 4.1 获取策略与分组 1B
			val = buf[idx++] & 0xFF;
			path.group = val & 0x0F;
			path.strategy = (val & 0x70) >> 4;
			path.bestpath = (val & 0x80) != 0;
			// 获取分段信息
			if (path.sharedPathAttribue.hasDivideInfo) {
				path.bDivided = (buf[idx] & 0x01) != 0;
				path.detailSegmentCount = ((buf[idx] & 0xFE) >> 1) + ((buf[idx + 1] & 0xFF) << 7);
				idx += 2;

				// 下一个点信息
				var coorX = 0,coorY = 0;
				coorX = (buf[idx] & 0xFF) + ((buf[idx + 1] & 0xFF) << 8) + ((buf[idx + 2] & 0xFF) << 16) + ((buf[idx + 3] & 0xFF) << 24);
				idx += 4;
				coorY = (buf[idx] & 0xFF) + ((buf[idx + 1] & 0xFF) << 8) + ((buf[idx + 2] & 0xFF) << 16) + ((buf[idx + 3] & 0xFF) << 24);
				idx += 4;
				if (coorX != 0 && coorY != 0) {
					path.hasPointForNextRequest = true;
					path.nextPoint = new MRoute.NvPoint(coorX,coorY);
				}

			}
			paths[i] = path;
			
			
			// 4.2 获取结合点之前导航段个数 2B（非重合导航段个数）
			val = ((buf[idx] & 0xFF)) + ((buf[idx + 1] & 0xFF) << 8);
			idx += 2;
			var selfcount = val;

			// 4.3 获取结合点当前导航段索引 2B
			val = ((buf[idx] & 0xFF)) + ((buf[idx + 1] & 0xFF) << 8);
			idx += 2;
			var joinindex = val;

			var pathsegcount;
			if (i == 0) {
				// 主路径，总导航段个数等于非重合导航段个数
				mainsegcount = pathsegcount = selfcount;
			} else {
				if (joinindex > mainsegcount){
					throw Error("Illegal joint index");
				}
				pathsegcount = selfcount + mainsegcount - joinindex;
			}

			var navisegment = [];
			path.segments = navisegment;

			if (i == 0){
				mainsegment = navisegment;
			}
			// 4.4 解析结合点前的导航段
			for (var k = 0; k < selfcount; k++) {
				var navi = new MRoute.NaviSegment();
				navisegment.push(navi);

				navi.basicAction = buf[idx++] & 0xFF;
				navi.assistAction = buf[idx++] & 0xFF;
				var shareindex = ((buf[idx] & 0xFF)) + ((buf[idx + 1] & 0xFF) << 8);
				idx += 2;
				if (shareindex < sharecount){
					navi.sharedSegAttribute = sharedSegs[shareindex];
				}else{
					throw Error("Failed get shared segment attribute.");
				}
			}

			// 4.4 解析结合点后的导航段
			for (var k = selfcount; k < pathsegcount; k++) {
				navisegment[k] = mainsegment[joinindex + k - selfcount];
			}
		}

		idx += lenBuf.length;
		if (idx != packlens) {
			throw Error("Failed to decode preview data,length does not match");
		} else {
			// 统一更新成员
			this.sharedSegs = sharedSegs;
			this.paths = paths;
			this.onPreviewOk(); // 回调
		}
		return idx;
	},

	decodeDetailInfo:function(is){
		if (is == null){
			throw Error("Input stream can not be null.");
		}
		// 如果不存在预览信息，则无法解析详细信息
		if (this.paths == null){
			throw Error("Failed to decode detail info without preview info.");
		}
		// 1.1 获取详细导航段信息长度 2B
		var i=0,lenBuf=[];
		while(i<2){
			lenBuf[i] = (is.charCodeAt(this.stream) & 0xff).toString();
			i++;this.stream++;
		}
		if (i<2) {
			throw Error("Failed to read the length of detail data.");
		}
		var packlens = ((lenBuf[0] & 0xFF)) + ((lenBuf[1] & 0xFF) << 8);

		// 读取详细导航段的内容
		var idx = 0;
		var i=0,buf=[],ite=0;
		while(i<(packlens - lenBuf.length)){//取8个字节
			buf[i] = (is.charCodeAt(this.stream) & 0xff).toString();
			i++;this.stream++;
		}
		
		if (i<(packlens - lenBuf.length)) {
			throw Error("Failed to read detail data.");
		}

		// 1.2 导航段id 2B
		var segid = ((buf[idx] & 0xFF)) + ((buf[idx + 1] & 0xFF) << 8);
		idx += 2;

		// 1.3 路径id 1B
		var pathid = buf[idx++] & 0xFF;
		if (pathid >= this.paths.length){
			throw Error("Illegal path id.");
		}
		if (segid >= this.paths[pathid].segments.length){
			throw Error("Illegal segment id.");
		}
		var seg = this.paths[pathid].segments[segid]; // 定位到需要填充详细信息的导航段对象

		// 1.4 扩展位 1B
		var ctrlflag = buf[idx++] & 0xFF;

		// 1.5 路口背景图片+前景图片 2B+2B
		if ((ctrlflag & 0x8) != 0) {
			seg.backImage = ((buf[idx] & 0xFF)) + ((buf[idx + 1] & 0xFF) << 8);
			idx += 2;
			seg.foreImage = ((buf[idx] & 0xFF)) + ((buf[idx + 1] & 0xFF) << 8);
			idx += 2;
		}

		// 1.6 路口名称信息 1B + nB
		if ((ctrlflag & 0x20) != 0) {
			var namelens = buf[idx++] & 0xFF;
			if (namelens > 0) {
				seg.nodeName = this.byte2text(buf, idx, namelens * 2,"UTF-16LE");
				idx += namelens * 2;
			}
		}

		// 1.7 道路路牌信息 1B + nB
		if ((ctrlflag & 0x40) != 0) {
			var signlens = buf[idx++] & 0xFF;
			if (signlens > 0) {
				seg.signpost = this.byte2text(buf, idx, signlens * 2,"UTF-16LE");
				idx += signlens * 2;
			}
		}


		if ((ctrlflag & 0x4) != 0) {
			// 如果包含Link列表，则表明此导航段到目前为止还没有重复过

			// 2.1 link列表
			// 2.1.0 道路名称表 2B + nB
			var namelens = 0;
			if ((ctrlflag & 0x2) != 0) {
				namelens = ((buf[idx] & 0xFF)) + ((buf[idx + 1] & 0xFF) << 8);
				idx += 2;
			}

			var nameidxs = idx;
			idx += namelens * 2;

			// 2.1.1 Link堆个数
			var piles = ((buf[idx] & 0xFF)) + ((buf[idx + 1] & 0xFF) << 8);
			idx += 2;

			// 2.2 获取link属性，并统计link总数，形状点数
			if (piles > 0) {
				var indexvalue = idx;
				var linkscount = 0;
				var pointcount = 1; // 必含起点
				// 每个Link堆对应一个共有属性
				var sharedSeg = seg.sharedSegAttribute;
				if (sharedSeg == null)
					throw Error("Failed to get shared segment attribute");
				sharedSeg.sharedLinkAttributes = [];

				// 初始化每个堆的共有属性及每个Link的属性
				for (var i = 0; i < piles; i++) {
					var attr = new MRoute.SharedLinkAttribute();
					sharedSeg.sharedLinkAttributes[i] = attr;

					// 2.2.1 共用信息 4B
					var val = ((buf[idx] & 0xFF)) + ((buf[idx + 1] & 0xFF) << 8) + ((buf[idx + 2] & 0xFF) << 16) + ((buf[idx + 3] & 0xFF) << 24);
					idx += 4;

					attr.RoadClass = (val) & 0x0F;
					attr.Formway = (val >> 4) & 0x0F;
					attr.linkType = (val >> 8) & 0x03;
					attr.direction = ((val >> 10) & 0x01) != 0;
					attr.btoll = ((val >> 11) & 0x01) != 0;
					attr.cityRoad = (val >> 12) & 0x03;

					var linklens = (val >> 14) & 0x03F,
						linkidxs = (val >> 20) & 0xFFF;
					if (linklens > 0) {
						if (linkidxs == 0xFFF) {
							attr.linkName = sharedSeg.roadName;
						} else {
							attr.linkName = this.byte2text(buf, nameidxs + linkidxs * 2, linklens * 2,"UTF-16LE");
						}
					}

					// 2.2.1 link数量 1B
					var count = buf[idx++] & 0xFF;
					linkscount += count;
					for (var k = 0; k < count; k++) {
						var linkflag = buf[idx++] & 0xFF;
						var extendedFlag = 0;
						if ((linkflag & 0x80) != 0){ // 如果存在扩展控制信息
							extendedFlag = buf[idx++] & 0xFF;
						}

						if ((linkflag & 0x01) != 0){ // 路口车道 4B
							idx += 4;
						}
						if ((linkflag & 0x02) != 0){ // 转弯车道 4B
							idx += 4;
						}
						if ((linkflag & 0x04) != 0){ // 路牌信息 1B + n * 2B
							var signlens = buf[idx++] & 0xFF;
							idx += signlens * 2;
						}
						var cameraCount = 0; // 电子眼个数
						if ((linkflag & 0x10) != 0 && (linkflag & 0x80) != 0 && (extendedFlag & 0x01) != 0) {
							cameraCount = buf[idx++];
						} else if ((linkflag & 0x10) != 0) {
							cameraCount = 1;
						}
						if (cameraCount > 0){ // 电子眼信息 2B + 2B + B
							idx += 5 * cameraCount;
						}
						// if ((linkflag & 0x20) != 0) // 车道数目 1B
						// idx++;

						var ptvalue = ((buf[idx] & 0xFF)) + ((buf[idx + 1] & 0xFF) << 8);
						idx += 2;
						var ptcount = ptvalue & 0x3FFF;
						if ((ptvalue & 0x4000) != 0){
							idx += ptcount * 2;
						}else{
							idx += ptcount * 4;
						}
						pointcount += ptcount;
					}
				}

				// 2.3 生成详细坐标数组与link数组
				var detailCoor = [];

				// 初始化坐标起点
				var ltx = sharedSeg.simpleCoor[0];
				var lty = sharedSeg.simpleCoor[1];
				detailCoor[0] = ltx;
				detailCoor[1] = lty;
				var totalLink = [];

				// 处理link信息
				idx = indexvalue;
				var linksindex = 0;
				var pointindex = 1;
				for (var i = 0; i < piles; i++) {
					var linkAttr = sharedSeg.sharedLinkAttributes[i];
					// 2.3.1 共用信息 4B
					idx += 4;

					// 2.3.2 link数量 1B
					var count = buf[idx++] & 0xFF;

					// 2.3.3 处理每个Link
					for (var k = 0; k < count; k++) {
						var link0 = new MRoute.NaviLink();
						totalLink[linksindex++] = link0;
						link0.sharedAttribute = linkAttr;

						// 2.3.3.1 Link控制信息
						var linkflag = buf[idx++] & 0xFF;
						var extendedFlag = 0;
						if ((linkflag & 0x80) != 0){
							extendedFlag = buf[idx++] & 0xFF;
						}

						if ((linkflag & 0x01) != 0){ // 路口车道 4B
							link0.backLane = ((buf[idx] & 0xFF)) + ((buf[idx + 1] & 0xFF) << 8) + ((buf[idx + 2] & 0xFF) << 16) + ((buf[idx + 3] & 0xFF) << 24);
							idx += 4;
						}

						if ((linkflag & 0x02) != 0) // 转弯车道 4B
						{
							link0.foreLane = ((buf[idx] & 0xFF)) + ((buf[idx + 1] & 0xFF) << 8) + ((buf[idx + 2] & 0xFF) << 16) + ((buf[idx + 3] & 0xFF) << 24);
							idx += 4;
						}

						if ((linkflag & 0x04) != 0){ // 路牌信息 1B + n * 2B
							var signlens = buf[idx++] & 0xFF;
							link0.signpost = this.byte2text(buf, idx, signlens*2);
							idx += signlens * 2;
						}

						var cameraNum = 0; // 电子眼个数
						if ((linkflag & 0x10) != 0 && (linkflag & 0x80) != 0 && (extendedFlag & 0x01) != 0) {
							cameraNum = buf[idx++] & 0xFF;
						} else if ((linkflag & 0x10) != 0) {
							cameraNum = 1;
						}
						link0.cameraCount = cameraNum;

						if ((linkflag & 0x08) != 0){ // 服务区信息
							link0.atService = true;
						} else{
							link0.atService = false;
						}
						if ((extendedFlag & 0x02) != 0){ // 进入不同动态交通城市的标志
							link0.bIntoDiffCity = true;
						} else {
							link0.bIntoDiffCity = false;
						}
						if ((extendedFlag & 0x04) != 0){ // 复杂路口处的可播报标志
							link0.isNeedPlay = true;
						} else {
							link0.isNeedPlay = false;
						}
						if (cameraNum != 0){ // 电子眼信息 2B + 2B + B
							var cameras = [];
							link0.cameras = cameras;
							for (var curIndex = 0; curIndex < cameraNum; ++curIndex) {

								var camera = new MRoute.Camera();
								link0.cameras[curIndex] = camera;
								camera.x = this.intshort(((buf[idx] & 0xFF)) + ((buf[idx + 1] & 0xFF) << 8));
								idx += 2;
								camera.y = this.intshort(((buf[idx] & 0xFF)) + ((buf[idx + 1] & 0xFF) << 8));
								idx += 2;
								camera.type = buf[idx] & 0x0F;
								camera.speed = (buf[idx] & 0xF0) >> 4;
								idx++;
								camera.speed *= 10; // 将速度换算为kmph
							}
						}

						if ((linkflag & 0x20) != 0){ // 分叉路
							link0.mixFork = true;
						} else{
							link0.mixFork = false;
						}
						if ((linkflag & 0x40) != 0){ // 交通灯
							link0.trafficLight = true;
						} else{
							link0.trafficLight = false;
						}
						var ptvalue = ((buf[idx] & 0xFF)) + ((buf[idx + 1] & 0xFF) << 8);
						idx += 2;
						var ptcount = ptvalue & 0x3FFF;

						link0.detailCoor = detailCoor;
						if ((ptvalue & 0x8000) != 0){
							link0.begOffCoor = 2 * pointindex;
						}else{
							link0.begOffCoor = 2 * (pointindex - 1);
						}
						if ((ptvalue & 0x4000) != 0) {
							for (var n = 0; n < ptcount; n++, pointindex++) {
								var val;
								val = buf[idx++] & 0xFF;
								ltx += this.intbyte(val);

								val = buf[idx++] & 0xFF;
								lty += this.intbyte(val);
								detailCoor[2 * pointindex] = ltx;
								detailCoor[2 * pointindex + 1] = lty;
							}
						} else {
							for (var n = 0; n < ptcount; n++, pointindex++) {
								var val;
								val = ((buf[idx] & 0xFF)) + ((buf[idx + 1] & 0xFF) << 8);
								idx += 2;
								ltx += this.intshort(val);

								val = ((buf[idx] & 0xFF)) + ((buf[idx + 1] & 0xFF) << 8);
								idx += 2;
								lty += this.intshort(val);

								detailCoor[2 * pointindex] = ltx;
								detailCoor[2 * pointindex + 1] = lty;
							}
						}
						link0.endOffCoor = 2 * pointindex;

						if ((linkflag & 0x10) != 0){ // 电子眼信息
						
							// 由于camera坐标是相对于本link起点的偏移坐标，需要进行处理
							for (var curIndex = 0; curIndex < link0.cameraCount; ++curIndex) {
								var camera = link0.cameras[curIndex];
								camera.x += detailCoor[link0.begOffCoor];
								camera.y += detailCoor[link0.begOffCoor + 1];
							}
						}
					}
				}
				sharedSeg.detailCoor = detailCoor;
				sharedSeg.links = totalLink;
			}
		}

		// 用户数据
		if ((ctrlflag & 0x10) != 0) {
			var userDataLen = 0;
			userDataLen = ((buf[idx] & 0xFF)) + ((buf[idx + 1] & 0xFF) << 8);
			idx += 2;
			if (userDataLen > 0) {
                seg.userData = [];
                var i= 0, ud = seg.userData;
                while(i<userDataLen){//取8个字节
                    ud[i] = buf[i+idx];
                    i++;
                }
//				seg.userData = new byte[userDataLen];
//				System.arraycopy(buf, idx, seg.userData, 0, userDataLen);
				idx += userDataLen;
			}
		}

		idx += lenBuf.length;
		if (idx != packlens) {
			throw Error("Failed to decode detail data,length does not match");
		} else {
			this.onSegmentOk(seg); // 回调
			return idx;
		}
	},

	checkVersion:function(ver) {
		switch (ver){
			case 1:
				return true;
			default:
				return false;
		}
	},

	/**
	 * 重置解码器。如果此前使用本类对象成功解析完一条路径的所有信息，然后又重新使用本对象的decode方法解析一条新路径的数据，
	 * 这时本解码器会自动先调用reset方法重置解码器。但如果上条路径未解析完或者解析中发生了错误，则不保证还以能用decode解析
	 * 出新路径，而需要调用者先调用reset重置解码器，或者新生成一个PathDecoder对象进行解析。因此，如果希望复用一个解码器进
	 * 行多个路径的解码，建议在每次解析完后调用reset方法重置解码器。但如果是对一条路径进行多次解析（例如先请求预览包，再
	 * 请求详细包，这时需要对两次下载的数据各调用一次decode），则不应该在之间调用reset。本方法没有同步，不保证线程安全，
	 * 调用者应自己注意在调用此方法时没有其他线程正在解析路径或访问解码器。
	 */
	reset:function() {
		this.onResetting();
		this.sharedSegs = null;
		this.sharedPathAttribute = null;
		this.paths = null;
	},

	/**
	 * 获取已解析的路径。可以在解析完一段预览数据包后，或者在另一线程访问此方法。
	 * 
	 * @return 如果已经可以获取预览信息，返回路径数组，否则返回null。
	 */
	getPaths:function(){
		return this.paths;
	},

	/**
	 * 获取指定策略的最佳路径。
	 * 
	 * @param strategy
	 *            路径策略。
	 * @return 如果找到这返回路径对象，如果没有找到或者路径未解析成功，则返回null
	 */
	getBestPath:function(strategy) {
		if (this.paths != null) {
			for (var i = 0; i < this.paths.length; i++) {
				var path = this.paths[i];
				if (path.getStrategy() == strategy && path.isBestPath()){
					return path;
				}
			}
		}
		return null;
	},

	/**
	 * 预览解析完成时的回调。本方法在接码线程中调用，执行完之前不会进行进一步解码。
	 */
	onPreviewOk:function() {

	},

	/**
	 * 当一个导航段解析完所有信息时的回调。本方法在接码线程中调用，执行完之前不会进行进一步解码。
	 * 
	 * @param seg
	 *            解析完成的导航段对象。
	 */
	onSegmentOk:function(seg) {

	},

	/**
	 * 解码器重置之前的回调。
	 */
	onResetting:function() {

	}	
});

/**
 +----------------------------------------------------------
 * 导航时间
 +----------------------------------------------------------
 * 已结束
 +----------------------------------------------------------
 */
MRoute.NaviTime = Class({
	speedTable : [90,60,50,40,30,30,60,45,35,30,20],
	time : Number.MAX_VALUE,

    /**
     * 用于求一个导航段或一组导航段的行驶时间， 单位：秒
     * @param seg
     */
	"initialize":function(seg){

        var links = seg.getLinks();//NaviLink[]
        // 遍历导航段中的Link，以速度最快的Link作为本导航段的速度。
        var maxSpeed = 1;
        for(var i =0; i < links.length; i++){
            var grade =  links[i].getRoadClass(),
                speed = this.speedTable[grade];
            if(speed > maxSpeed){
                maxSpeed = speed;
            }
        }
        maxSpeed = maxSpeed * 1000 ;
        this.time = (seg.getDistance() ) / maxSpeed; //+ maxSpeed -1
	},
	/**
	 * 根据语言输出时间字符串。
	 * @param lang 目前支持"cn"与"en",即中文与英文，否则输出""。
	 */
	toString:function(lang){
		var time = this.time;
        var ts,hour, minute;
		if(lang == "cn"){
			if(time < 60){
				return time + "分钟";
			}else{
				hour = time / 60;
				ts = hour + "小时";				 
				minute =  time % 60;
				if(minute > 0){
					ts +=  minute + "分钟";
				}
				return ts;
			}			
		}else if(lang == "en"){
			if(time < 60){
				return time <= 1 ? time + " minute" : time + " minutes";
			}else{
				hour = time / 60;
				ts = hour == 1 ? "1 hour" : hour + " hours";
				minute =  time % 60;
				if( minute > 0){
					ts += minute == 1 ? " 1 minute":" " + minute + " minutes";
				}			
				return ts;
			}
		}else{
			if(time < 60){
				return time + "分钟";
			}else{
				hour = time / 60;
				minute =  time % 60;
				return hour + "小时" + minute + "分钟";
			}
		}
	},
	
	/**
	 * 获取驾驶时间。
	 * @return 驾驶时间，单位：分钟。
	 */
	getTime:function(){
		return this.time;
	}
	
});

/**
 * 导航段共用属性类。当存在多条路径时，它们可能存在一些重复的导航段，而这些信息是多条路径
 * 共有的（包括长度，坐标点等），为了减少冗余，这些共用的导航段信息只保存一次，每条路径中
 * 的导航段仅保存其应用。本类只供本包内部使用，外部无法访问。
 * @author 周琦
 *
 */
MRoute.SharedSegmentAttribute = Class({
	
	direction : null,			//导航段方向
	// 预览中包含以下信息
	passDist : 0,				// 行驶距离
	tollDist : 0,				// 收费距离		
	roadName : null,			// 导航段名称
	simpleCoor : null,			// 抽稀道路坐标
	tmcRecords : null,			// 动态交通信息
	tmcTime : 0,				// TMC参考时间，单位秒。
	
	// 详细段中包含以下信息
	detailCoor : null,				// 详细道路坐标		
	sharedLinkAttributes : null,	// Link共有属性
	links : null,					// Link列表
	driveTime : null,				// 行驶时间
	
	"initialize":function(){
		
	},
	/// <summary>
	/// 根据DetailCoor算出来的经纬度值
	/// </summary>
	_detailCoorLngLat:[],
	/// <summary>
	/// 根据int 坐标计算出经纬度坐标
	/// </summary>
	GetDetailCoorLngLat:function(){
		if (this._detailCoorLngLat.length==0){
			this._detailCoorLngLat = [];
			for (var i = 0; i < this.detailCoor.length; i++){
				this._detailCoorLngLat[i] = this.detailCoor[i] / CoordFactor;
			}
		}
		return this._detailCoorLngLat;
	}
	
});

/**
 +----------------------------------------------------------
 * 导航段类，每条路径都是由多个导航段组成，每个导航段的结尾都存在导航动作，提示用户如何进入
 * 下一个导航段。
 +----------------------------------------------------------
 */
MRoute.NaviSegment = Class({
    // 以下属性是每条路径导航段独有的，即使其他路径也经过这个导航段，这些值也可能不同。其中，

    basicAction:0, // 导航基本动作
    assistAction:0, // 导航辅助动作
    backImage:-1, // 路口图片的背景图ID
    foreImage:-1, // 路口图片的前景图ID
    nodeName:null, // 路口名称
    signpost:null, // 路牌信息

    bDistUpdated:false, // 是否重算了seg 和 link长度信息

    //---------- diff with c++-----------------
    userData:null, // 用户数据 c not have
    sharedSegAttribute:null, /// Segment共有属性 c not have
    // -----------  move to sharedSegAttribute
//    PassDist : 0,                   /// 行驶距离
//    TollDist : 0,                   /// 收费距离
//    RoadName :null,                 /// 导航段名称
//    SimpleCoor :[],                 /// 抽稀道路坐标
//    DetailCoor :null,               /// 详细道路坐标
//    SharedLinkAttributes : null,    /// Link共有属性
//    Links : null,                   /// Link列表
//    DriveTime : null,               /// 行驶时间
//    _detailCoorLngLat : null,       /// 根据DetailCoor算出来的经纬度值
//    TmcRecords :null,               /// 动态交通信息
//    TmcTime :0,                     /// TMC参考时间，单位秒


    "initialize":function () {

    },

    /**
     * 获取指定位置的LinkId
     * @param  ptId   对应的形状点编号
     * @return {Number} 所求link编号
     */
    getLinkId:function (ptId) {
        var links = this.getLinks(),
            nextId = ptId + 1;
        if (links != null) {
            for (var i = 0; i < links.length; i++) {
                if (links[i].isContain(nextId)) {
                    return i;
                }
            }
            if (i == links.length) {
                return i - 1;
            }
        }
        return 0;
    },

    /**
     *
     * @param linkId 指定的link序号
     * @return {MRoute.NaviLink} 对应编号的link
     */
    getLink:function (linkId) {
        var links = this.getLinks();
        if (links != null && linkId < links.length && linkId >= 0) {
            return links[linkId];
        }
        return null;
    },

    getLinkAngle:function (linkId) {
        var selLink = this.getLink(linkId);
        if (!selLink) {
            return 0;
        }

        var start = selLink.getStartCoorIndex(),
            end = selLink.getEndCoorIndex(),
            cords = this.getDetailedCoors(),
            coLen = cords.length;
        if (end >= coLen) {
            end -= 2;
        }

        return CalcGeoAngleInDegree(cords[start], cords[start + 1], cords[end], cords[end - 1]);

    },

    /**
     *
     * @param linkId 当前link编号
     * @return {Number}从当前形状点始符合条件的RoadClass
     */
    calcRoadClass:function (linkId) {
        var eRoadClass = MRoute.RoadClass.RoadClass_Main_Road;

        var links = this.getLinks();
        for (var i = linkId; i < links.length; i++) {
            eRoadClass = links[i].getRoadClass();
            var eForm = links[i].getLinkForm();
            if (eForm != MRoute.Formway.Formway_Slip_Road
                && eForm != MRoute.Formway.Formway_JCT
                && eForm != MRoute.Formway.Formway_Exit_Link
                && eForm != MRoute.Formway.Formway_Entrance_Link
                && eForm != MRoute.Formway.Formway_Round_Circle) {
                break;
            }
        }

        return eRoadClass;
    },

    calcMixForkNum:function (linkId) {
        var num = 0,
            linkNum = this.getLinkCount();
        for (var i = linkId; i < linkNum; i++) {
            var link = this.getLink(i);
            if (link.hasMixFork()) {
                num++;
            }
        }

        return num;
    },

    calcForkInfo:function (ptId, stPoint) {
        var remainForkNum = 0,
            nearestForkDist = 0;

        var lastIndex = -1,
            startIndex = 0,
            linkNum = this.getLinkCount(),
            i = linkNum - 1;
        for (; i >= 0; i--) {
            var link = this.getLink(i);
            startIndex = link.getStartPtId();
            if (link.hasMixFork()) {
                remainForkNum++;
                lastIndex = i;
            }
            if (startIndex <= ptId) {
                break;
            }
        }

        if (lastIndex != -1) {
            var ptNum = this.getDetailedPointsCount(),
                endPtId;
            if (lastIndex == linkNum - 1) {
                endPtId = ptNum - 1;
            }
            else {
                var nextLink = this.getLink(lastIndex + 1);
                endPtId = nextLink.getStartPtId();
            }
            if (ptId < endPtId) {
                var coors = this.getDetailedCoorsLngLat(),
                    index = 2 * (ptId + 1);
                nearestForkDist += GetMapDistInMeter(stPoint.x, stPoint.y, coors[index], coors[index + 1]);
                for (i = ptId + 1; i < endPtId; i++) {
                    index = 2 * i;
                    nearestForkDist += GetMapDistInMeter(coors[index], coors[index + 1], coors[index + 2], coors[index + 3]);
                }
            }

        }

        return [remainForkNum, nearestForkDist];
    },

    /**
     * 计算指定点到seg终点的剩余距离
     * @param linkId  当前link编号
     * @param ptId    当前形状点编号
     * @param stPoint 指定点
     * @return {Number}
     */
    getRemainSegDist:function(linkId, ptId, stPoint){
        // 使用预先计算的link到seg终点的剩余距离，减少重复计算
        var link   = this.getLink(linkId);
        return this.getRemainLinkDist(linkId, ptId, stPoint) + link.getDistToExit();
    },

    /**
     * 计算指定点到link终点的剩余距离
     * @param linkId  当前link编号
     * @param ptId    当前形状点编号
     * @param stPoint 指定点
     * @return {Number}
     */
    getRemainLinkDist:function (linkId, ptId, stPoint) {
        var linkRemain = 0,
            curLink = this.getLink(linkId),
            clist = this.getDetailedCoorsLngLat(),
            endID = curLink.getEndCoorIndex() / 2,
            nextID = ptId + 1;

        if (nextID >= endID) {
            return linkRemain;
        }

        for (var i = nextID; i < endID - 1; i++) {
            var j = 2 * i;
            linkRemain += GetMapDistInMeter(clist[j], clist[j + 1], clist[j + 2], clist[j + 3]);
        }

        if (stPoint != null) {
            linkRemain += GetMapDistInMeter(stPoint.x, stPoint.y, clist[2 * nextID], clist[2 * nextID + 1]);
        }
        return linkRemain;
    },

    /**
     *
     * @param linkId  当前link编号
     * @return {Number}所求link行车时间估计，单位分钟
     */
    getLinkTime:function (linkId) {
        var segDist = this.getDistance();
        if (segDist > 0) {
            var segTime = this.getTmcTimeMinute();
            if (segTime <= 0) {
                segTime = this.getDriveTimeMinute();
            }

            var linkLen = this.getLinkLength(linkId);
            return Math.ceil(segTime * linkLen / segDist);
        }
        return 0;
    },

    /**
     *
     * @param linkId
     * @return {Number} link长度, 单位米
     */
    getLinkLength:function (linkId) {
        var link = this.getLink(linkId);
        return link.getDistance();
    },


    /**
     * 求当前link 中和已知点最近的形状点
     * @param fx        当前点经度
     * @param fy        当前点纬度
     * @param linkId    当前所在link
     * @return {Number}
     */
    calcNearestPtId:function (fx, fy, linkId) {
        var coors = this.getDetailedCoorsLngLat();
        var ptID = 0;
        var length = coors.length / 2;
        var minDist = Number.MAX_VALUE;
        var sId = 0, eId = length - 1;
        if (linkId >= 0 && linkId < this.getLinks().length) {
            var link = this.getLink(linkId);
            sId = link.getStartPtId();
            eId = link.getEndCoorIndex() / 2 - 1;
        }

        for (var i = sId; i < eId; i++) {
            var j = i * 2;
            var x1 = coors[j], y1 = coors[j + 1],
                x2 = coors[j + 2], y2 = coors[j + 3];

            // 计算点到线的投影点
            var res = FindNearPt(x1, y1, x2, y2, fx, fy);

            // 计算当前点到投影点之间的Map距离
            var nDistance = Math.round(1000 * GetMapDistance(fx, fy, res[0], res[1]));
            if (nDistance < minDist) {
                minDist = nDistance;
                ptID = i;
            }
        }

        return ptID;
    },

    /**
     *
     * @return {Number} 所含link数目
     */
    getLinkCount:function () {
        if (this.getLinks() == null) {
            return 0;
        }
        return this.getLinks().length;
    },

    /**
     * @param linkId 当前link
     * @return {string} 查找本导航段的下一路名
     */
    getNextRoadName:function (linkId) {
        var nextName = null;
        var links = this.getLinks();
        for (var i = linkId + 1; i < links.length; i++) {
            nextName = links[i].getLinkName();
            if (nextName != null && nextName.length > 0) {
                break;
            }
        }
        return nextName;
    },

    _getSharedSegAttribute_:function () {//SharedSegmentAttribute
        // assert sharedSegAttribute != null;
        return this.sharedSegAttribute;
    },

    // 下面一些方法解析完预览信息即可获得
    /**
     * 获取导航段结束进入下一导航段时的基本导航动作。
     * @return 基本导航动作，此信息预览解析后即可获得。
     */
    getBasicAction:function () {
        return this.basicAction;
    },


    /**
     * 获取导航段结束进入下一导航段时的辅助导航动作。
     * @return 辅助导航动作，此信息预览解析后即可获得。。
     */
    getAssistAction:function () {
        return this.assistAction;
    },

    /**
     * 获取导航段长度。
     * @return 整个导航段长度，单位：米，此信息预览解析后即可获得。。
     */
    getDistance:function () {
        if(!this.bDistUpdated){
            this.distUpdate();
        }

        return this._getSharedSegAttribute_().passDist;
    },

    /**
     * 获取导航段收费道路的长度。
     * @return 整个导航段收费道路长度，单位：米，此信息预览解析后即可获得。。
     */
    getTollDistance:function () {
        return this._getSharedSegAttribute_().tollDist;
    },

    /**
     * 获取导航段名称。
     * @return 如果导航段存在名称，则返回该名称，否则返回null。此信息预览解析后即可获得。。
     */
    getRoadName:function () {
        return this._getSharedSegAttribute_().roadName;
    },

    /**
     * 获取本导航段的预览坐标数组。此方法可以一次性获得原生坐标，无须生成NaviPoint对象，效率要远远高于对每个点调用getPreviewPoint()方法。
     * @return 预览点数组。因为每个坐标的X与Y各占一个int，所以数组的长度必然为偶数。 注意：只有当
     * NaviPath.hasLineSimplification()返回true时预览点才有作用，否则数组中只会包含每个导航段的起点。
     */
    getPreviewCoors:function () {
        return this._getSharedSegAttribute_().simpleCoor;
    },

    /**
     * 获取本导航段的预览点的个数。
     * @return 因为每个点两个坐标，所以应该为getPreviewCoors().length的一半。
     */
    getPreviewPointsCount:function () {
        var len = this.getPreviewCoors().length;
        // assert (len & 0x1) == 0;
        return len / 2;
    },

    /**
     * 获取本导航段的第index个预览点。
     * @param index 预览点索引，从0开始，小于getPreviewPointsCount()
     * @return 预览点对象。
     * @exception ArrayIndexOutOfBoundsException 如果index超出范围则抛出此异常。
     */
    getPriviewPoint:function (index) {
        var coors = this.getPreviewCoors();
        index *= 2;
        return new MRoute.NvPoint(coors[index], coors[index + 1]);
    },

    /**
     * 获取此导航段中TMC信息。
     * @return 如果存在TMC信息，则返回包含TMC记录数组，否则返回null；
     */
    getTmcInfo:function () {
        return this._getSharedSegAttribute_().tmcRecords;
    },


    /**
     * 获取此导航段服务端预计的行驶时间,方法只有在请求开启了TMC时才有效；
     * @return 导航段的行驶时间, 单位：秒
     */
    getTmcTime:function () {
        return this._getSharedSegAttribute_().tmcTime;
    },

    /**
     * 当服务端提供有tmc时间时采用tmc时间，反之采用本地估计时间
     * @return {Number} 估计的行驶时间，单位：分钟
     */
    getEstimateTime:function() {
        var time = this.getTmcTime() / 60;
        if(time == 0){
            time = this.getOrigDriveTime() / 60;
        }
        return time;
    },

    /**
     * 获取此导航段服务端预计的行驶时间,单位：分钟
     * @return {Number} 服务端提供的tmc时间转为分钟整数
     */
    getTmcTimeMinute:function () {
        return Math.ceil(this.getTmcTime() / 60);
    },

    /**
     * 获取导航段的行驶时间
     * @return {Number}驾驶时间，单位：秒
     * @throws Error 此方法只能在解析完详细信息后，即hasDetailedInfo()返回true时才能调用
     */
    getDriveTimeMinute:function () {
        var time = Number(this.getOrigDriveTime() / 60);
        return Math.ceil(time);
    },

    /**
     * 获取导航段的行驶时间
     * @return 驾驶时间, 精确浮点数值，单位：秒
     * @throws Error 此方法只能在解析完详细信息后，即hasDetailedInfo()返回true时才能调用
     */
    getOrigDriveTime:function () {
        this._checkHasDetailedInfo_();
        var driveTime = this._getSharedSegAttribute_().driveTime;

        if (driveTime == null) {
            var nvTime = new MRoute.NaviTime(this);
            this._getSharedSegAttribute_().driveTime = nvTime.getTime();
        }
        return  this._getSharedSegAttribute_().driveTime;
    },

    /**
     * 获取本导航段是否已经解析出详细导航信息。
     * 采用分段下载模式时,并非所有导航段都含有详细信息,所以,在获取详细信息之前,一定有用此方法来检查是否含有详细信息
     * @return 如果已经解析出详细信息，返回true，否则返回false。
     */
    _hasDetailedInfo_:function () {
        return this._getSharedSegAttribute_().links != null;
    },

    _checkHasDetailedInfo_:function () {
        if (!this._hasDetailedInfo_()) {
            throw Error("Detailed Info has not been resolved yet.需要解析出来本段的详细导航信息后调用");
        }
    },

    // 以下方法只有在解析完详细信息后方可调用：
    /**
     * 获取是否存在路口放大图。
     * @return 如果存在路口放大图则返回true，否则返回false。
     * @throws Error 此方法只能在解析完详细信息后，即hasDetailedInfo()返回true时才能调用，
     * 如果在此之前调用会抛出此异常。
     */
    _hasCrossingImage_:function () {
        this._checkHasDetailedInfo_();
        return this.backImage != -1 && this.foreImage != -1;
    },

    /**
     * 获取是否存在用户数据。
     * @return 如果存在用户数据则返回true，否则返回false。
     * @throws Error 此方法只能在解析完详细信息后，即hasDetailedInfo()返回true时才能调用，
     * 如果在此之前调用会抛出此异常。
     */
    _hasUserData_:function () {
        this._checkHasDetailedInfo_();
        return this.userData != null;
    },

    /**
     * 获取用户数据。
     * @return 如果用户数据则返回用户数据，否则返回null。
     * @throws Error 此方法只能在解析完详细信息后，即hasDetailedInfo()返回true时才能调用，
     * 如果在此之前调用会抛出此异常。
     */
    getUserData:function () {
        return this._hasUserData_() ? this.userData : null;
    },

    /**
     * 获取路口放大图背景图ID。
     * @return 如果存在路口放大图则返回背景图的ID，否则返回-1。
     * @throws Error 此方法只能在解析完详细信息后，即hasDetailedInfo()返回true时才能调用，
     * 如果在此之前调用会抛出此异常。
     */
    getBackgroundImage:function () {
        return this._hasCrossingImage_() ? this.backImage : -1;
    },

    /**
     * 获取路口放大图前景图的ID。
     * @return 如果存在路口放大图则返回前景图的ID，否则返回-1。
     * @throws Error 此方法只能在解析完详细信息后，即hasDetailedInfo()返回true时才能调用，
     * 如果在此之前调用会抛出此异常。
     */
    getForegroundImage:function () {
        return this._hasCrossingImage_() ? this.foreImage : -1;
    },

    /**
     * 获取路口名称。
     * @return 如果存在路口名称，则返回名称，如果不存在则返回null；
     * @throws Error 此方法只能在解析完详细信息后，即hasDetailedInfo()返回true时才能调用，
     * 如果在此之前调用会抛出此异常。
     */
    getIntersectionName:function () {
        this._checkHasDetailedInfo_();
        return this.nodeName;
    },

    /**
     * 获取路牌名称。
     * @return 如果存在路牌，则返回路牌信息，如果不存在则返回null；
     * @throws Error 此方法只能在解析完详细信息后，即hasDetailedInfo()返回true时才能调用，
     * 如果在此之前调用会抛出此异常。
     */
    getSignpost:function () {
        this._checkHasDetailedInfo_();
        return this.signpost;
    },

    /**
     * 获取数组化的路牌列表。
     * @return 如果存在路牌，则返回路牌信息列表，如果不存在则返回null；
     * @throws Error 此方法只能在解析完详细信息后，即hasDetailedInfo()返回true时才能调用，
     * 如果在此之前调用会抛出此异常。
     */
    getRoadSigns:function () {
        var list = [];
        if (!this._hasDetailedInfo_()) {
            throw Error("Detailed Info has not been resolved yet.");
        }
        if (this.signpost == null || this.signpost.length <= 0) {
            return list;
        }
        var arrStr = this.signpost.split("::");
        if (arrStr.length == 0) {
            return list;
        }

        for (var i = 0; i < arrStr.length; i++) {
            var str = arrStr[i];
            if (str.length <= 1) {
                return list;
            }
            var ch = str.charAt(0);
            if (!/^[0-9A-Za-z]*$/.test(ch)) {
                return list;
            }

            var sign = new MRoute.RoadSign();
            if (/^[0-9]*$/.test(ch)) {//是否为数字
                sign.setType(parseInt(ch));
            } else if (/^[a-z]*$/.test(ch)) {//是否为小写字母
                sign.setType(ch.charCodeAt(0) - "a".charCodeAt(0) + 1);
            } else {//是否为大写字母
                sign.setType(ch.charCodeAt(0) - "A".charCodeAt(0) + 1);
            }
            sign.setContent(str.substring(1));
            list.push(sign);
        }
        return list;
    },

    /**
     * 获取本导航段下的Link集合。
     * @return link集合，一个导航段至少含有一个Link；
     * @throws Error 此方法只能在解析完详细信息后，即hasDetailedInfo()返回true时才能调用，
     * 如果在此之前调用会抛出此异常。
     */
    getLinks:function () {
        this._checkHasDetailedInfo_();
        return this._getSharedSegAttribute_().links;
    },

    /**
     * 获取本导航段的详细坐标组。此方法可以一次性获得原生坐标，无须生成NaviPoint对象，效率要远远高于对每个点调用getDetailedPoint()方法。
     * @return 详细坐标点数组。每个坐标占两个int（X与Y各占一个int，它们分别等于经度与纬度乘以NaviPoint.coorFactor），数组长度必为偶数。
     * @throws Error 此方法只能在解析完详细信息后，即hasDetailedInfo()返回true时才能调用，
     * 如果在此之前调用会抛出此异常。
     */
    getDetailedCoors:function () {
        this._checkHasDetailedInfo_();
        return this._getSharedSegAttribute_().detailCoor;
    },

    /**
     * 获取本导航段的详细坐标点的个数。
     * @return 因为每个点两个坐标，所以应该为getDetailedCoors().length的一半。
     * @throws Error 此方法只能在解析完详细信息后，即hasDetailedInfo()返回true时才能调用，
     * 如果在此之前调用会抛出此异常。
     */
    getDetailedPointsCount:function () {
        var len = this.getDetailedCoors().length;
        return len / 2;
    },

    /**
     * 获取本导航段的第index个详细坐标点。
     * @param index 坐标点索引，从0开始，小于getDetailedPointsCount()。
     * @return 坐标点对象。
     * @throws Error 此方法只能在解析完详细信息后，即hasDetailedInfo()返回true时才能调用，
     * 如果在此之前调用会抛出此异常。
     * @exception ArrayIndexOutOfBoundsException 如果index超出范围则抛出此异常。
     */
    getDetailedPoint:function (index) {
        var coors = this.getDetailedCoors();
        index *= 2;
        if(index >=0 && index < coors.length-1){
            return new MRoute.NvPoint(coors[index], coors[index + 1]);
        }
        return null;
    },

    getPointAngle:function(ptId){
        if(ptId < 0){
            return 0;
        }
        var cords = this.getDetailedCoors(),
            start = ptId * 2,
            end = (ptId+1)*2;
        if(end >= cords.length){
            start = cords.length - 4;
            end = start + 2;
        }

        return CalcGeoAngleInDegree(cords[start], cords[start + 1], cords[end], cords[end - 1]);
    },



    /**
     * 获取导航段方向，可以用NaviDirection类的toString()方法将对象转化为字符串。
     * @return 只有当路径解析出详细导航段信息且导航段第一个Link的Form为主路、辅路或普通路时可以获得方向，其他情况则返回null。
     * @throws Error 此方法只能在解析完详细信息后，即hasDetailedInfo()返回true时才能调用，
     * 如果在此之前调用会抛出此异常。
     */
    getDirection:function () {
        this._checkHasDetailedInfo_();
        var direction = this._getSharedSegAttribute_().direction;
        if (direction == null) {
            if (this.getLinks()[0].getLinkForm() != MRoute.Formway.Formway_Common_Link) {
                return null;
            }
            var points = this.getDetailedCoors();
            if (points.length < 4) {
                return null;
            }
            var len = points.length;
            direction = new MRoute.NaviDirection(points[0], points[1], points[len - 2], points[len - 1]);
            this._getSharedSegAttribute_().direction = direction.getAngle();
        }
        return direction;
    },

    /**
     * 取当前分段的前300米计算起始方向
     * @return {Number} 当前导航段起始方向
     */
    getStartDirection:function () {
        this._checkHasDetailedInfo_();

        var coords = this.getDetailedCoorsLngLat();
        var len = this.getDetailedPointsCount();

        var sx, sy, ex, ey;
        sx = coords[0];
        sy = coords[1];
        if (this.getDistance() > 300) {
            var dist = 0, id = 0;
            while (dist < 300 && id < coords.length - 4) {
                dist += GetMapDistInMeter(coords[id], coords[id + 1],
                    coords[id + 2], coords[id + 3]);
                id += 2;
            }
            ex = coords[id + 2];
            ey = coords[id + 3];
        }
        else {
            ex = coords[2 * len - 2];
            ey = coords[2 * len - 1];
        }

        var dAngle = CalcGeoAngle(sx, sy, ex, ey);
        return this._angleToDirection_(dAngle);

    },

    getWholeDirection:function () {
        this._checkHasDetailedInfo_();

        var coords = this.getDetailedCoorsLngLat();
        var len = this.getDetailedPointsCount();

        var sx, sy, ex, ey;
        sx = coords[0];
        sy = coords[1];
        ex = coords[2 * len - 2];
        ey = coords[2 * len - 1];

        var dAngle = CalcGeoAngle(sx, sy, ex, ey);
        return this._angleToDirection_(dAngle);
    },

    _angleToDirection_:function (dAngle) {
        if (dAngle > (15.0 / 8 * Math.PI) || dAngle < (1.0 / 8 * Math.PI)) {
            return MRoute.Direction.RouteDire_North;
        }
        else if (dAngle > 1.0 / 8 * Math.PI && dAngle < (3.0 / 8 * Math.PI)) {
            return MRoute.Direction.RouteDire_North_East;
        }
        else if (dAngle > 3.0 / 8 * Math.PI && dAngle < (5.0 / 8 * Math.PI)) {
            return MRoute.Direction.RouteDire_East;
        }
        else if (dAngle > 5.0 / 8 * Math.PI && dAngle < (7.0 / 8 * Math.PI)) {
            return MRoute.Direction.RouteDire_East_South;
        }
        else if (dAngle > 7.0 / 8 * Math.PI && dAngle < (9.0 / 8 * Math.PI)) {
            return MRoute.Direction.RouteDire_South;
        }
        else if (dAngle > 9.0 / 8 * Math.PI && dAngle < (11.0 / 8 * Math.PI)) {
            return MRoute.Direction.RouteDire_West_South;
        }
        else if (dAngle > 11.0 / 8 * Math.PI && dAngle < (13.0 / 8 * Math.PI)) {
            return MRoute.Direction.RouteDire_West;
        }
        else if (dAngle > 13.0 / 8 * Math.PI && dAngle < (15.0 / 8 * Math.PI)) {
            return MRoute.Direction.RouteDire_West_North;
        }

        return MRoute.Direction.RouteDire_NULL;
    },



    /**
     * 用详细坐标重算segment的实际长度， 代替下载数据中给定的长度
     * 同时更新各link的长度，以及link终点到本导航段末端的剩余距离
     * @private
     */
    distUpdate:function() {
        var coors = this._getSharedSegAttribute_().GetDetailCoorLngLat(),
            dist = 0,
            sumDist = 0,
            linkId = 0,
            linkDist = 0,
            curLink = this.getLink(linkId),
            linkCount = this.getLinkCount(),
            linkIntegral = [],
            end = coors.length - 2;
        for (var i = 0; i < end; i += 2) {
            dist = GetMapDistInMeter(coors[i], coors[i + 1], coors[i + 2], coors[i + 3]);
            sumDist += dist;

            // 可能本link的起点并不是前一link的终点
            if(curLink.begOffCoor <= i){
                linkDist += dist;
            }

            if(curLink.endOffCoor == i + 4){
                curLink.setDistance(linkDist);
                linkIntegral.push(sumDist);
                linkId++;
                if(linkId < linkCount){
                    curLink = this.getLink(linkId);
                    linkDist = 0;
                }
            }
        }
        if(linkIntegral.length < linkCount){
            linkIntegral.push(sumDist);
        }

        for(i = 0; i < linkCount; i++){
            curLink = this.getLink(i);
            curLink.setDistToExit(sumDist - linkIntegral[i]);
        }

        this._getSharedSegAttribute_().passDist = sumDist;
        this.bDistUpdated = true;
    },

    /**
     * @return {Array}本导航段的详细经纬度坐标组
     */
    getDetailedCoorsLngLat:function () {
        this._checkHasDetailedInfo_();
        return this._getSharedSegAttribute_().GetDetailCoorLngLat();
    }

});
/**
 +----------------------------------------------------------
 * 导航点类型
 +----------------------------------------------------------
 * 已结束
 +----------------------------------------------------------
 */

MRoute.NvPoint = Class({
	coorFactor : 3600 * 64,
	x:0,
	y:0,
	
	"initialize":function(x,y){//设置坐标
		if(/^(-?[1-9][0-9]*|0)$/.test(x)){//整形
			this.x = x/this.coorFactor;
			this.y = y/this.coorFactor;
		}else{//浮点型
			this.x = x;
			this.y = y;
		}
	},
	/**
	 * 获取浮点经度。
	 * @return 经度，单位：度。
	 */
	getX:function(){
		return this.x;
	},

	/**
	 * 获取浮点纬度。
	 * @return 纬度，单位：度。
	 */
	getY:function(){
		return this.y;
	},
	
	/**
	 * 获取整形经度。
	 * @return 整形经度，为浮点经度的coorFactor倍。
	 */
	getIntX:function(){
		return Math.round(this.x * this.coorFactor);
	},
	
	/**
	 * 获取整形纬度。
	 * @return 整形纬度，为浮点纬度的coorFactor倍。
	 */
	getIntY:function(){
		return Math.round(this.y * this.coorFactor);
	}

});

MRoute["NaviPoint"] = MRoute.NvPoint;

/**
 +----------------------------------------------------------
 * 路径共有属性类。当一次请求多条路径时，存在一些路径的共有属性，为了减少冗余，这些属性统一存储，每条路径保存其应用。
 +----------------------------------------------------------
 */
MRoute.SharedPathAttribute = Class({
	
	timestamp : 0,				// 服务端计算路径的时间戳	
	endPointName : null,		// 终点名称
	lineSimplification : false,	// 是否含抽稀的预览点 
	hasDivideInfo : false,		//是否包含分段信息
	
	"initialize":function(){
		
	}
	
});
/**
 +----------------------------------------------------------
 * 导航路径。每个NaviPath对应一条导航路径。
 +----------------------------------------------------------
 * @return Number
 +----------------------------------------------------------
 */
MRoute.NaviPath = Class({


//    WORD m_nOverlapedSeg;							//记录与主路径Joint之后重叠的导航段个数

	"initialize":function(){
		// 以下属性非public，只有本包中的PathDecoder可以设置这些值，包外无法获取
        this.group = -1;								//路径组
        this.strategy = -1;								//路径策略
        this.totalDist = -1;							//整条路径的长度
        this.tollLength = -1;							//整条路径的收费长度
        this.detailSegmentCount = 0;					//启用分段下载时，详细导航段的个数
        this.bestpath = false;							//记录是否最佳路径
        this.bDivided = false;						//标志该路径是否经过了分段处理
        this.hasPointForNextRequest = false;			//标志是否有下一次请求时的起点信息
        this.nextPoint = null;							//下一次请求的

        this.segments = null;  							//本路径分段列表
        this.sharedPathAttribue = null; 				//本路径共有的属性
        this.driveTime = -1;
        this.nTmcTime = -1;

	},
	/**
	 * 获取路径的GroupID。此属性在单策略多路径，或多策略多路径时有效。每种策略都可能返回多条路径，它们的
	 * Group从0开始编号。
	 * @return 组号，每种策略的组号都从0开始编号。
	 */
	getGroup:function(){
		return this.group;
	},
	
	/**
	 * 获取路径的策略。
	 * @return	目前可能的值有：0.速度最快、1 费用最低、2距离最短、3耗油最少、4参考交通信息最快、5不走快速路、6国道优先、7省道优先
	 */
	getStrategy:function(){
		return this.strategy;
	},

	/**
	 * 判断是否本策略中的最佳路径。注意：此方法获得最佳路径并非多策略时的"推荐道路"（实际上，多策略时的最
	 * 佳路径始终是strategy=0的路径），而是在多路径时有效，这时每种策略都可能存在一条最好的路径。例如：当
	 * 策略为"推荐道路"时，仍然可能存在多条路径，但当中有一条是最好的。如果我们请求没有开启多路径，而是开
	 * 启了多策略，那么返回不同策略的3条路径，它们都是本策略中最好的。
	 * @return 如果是本策略多条路径中最好的路径，则返回true，否则返回false。如果没有开启多路径或者本种策
	 * 略只有一条路径，那么始终返回true。
	 */
	isBestPath:function(){
		return this.bestpath;
	},
	
	/**
	 * 获取服务器计算这条路径的时间戳。
	 * @return 时间戳。
	 */
	getTimeStamp:function(){
		// assert sharedPathAttribue != null;
		return this.sharedPathAttribue.timestamp;
	},
	
	/**
	 * 获取终端名称。
	 * @return 如果存在终点名称，则返回名称，否则返回null。
	 */
	getEndPointName:function(){
		// assert sharedPathAttribue != null;
		return this.sharedPathAttribue.endPointName;		
	},
	
	/**
	 * 获取路径是否经过抽稀。
	 * @return 如果服务端对预览形状点进行了抽稀，则返回true，否则返回false。
	 */
	isLineSimplified:function()
	{
		// assert sharedPathAttribue != null;
		return this.sharedPathAttribue.lineSimplification;
	},
	
	/**
	 * 返回本路径的导航段数组。
	 * @return 导航段数组，调用方不应该对其进行修改。
	 */
	getSegments:function(){
		return this.segments;
	},

    getSegmentByID:function (nIndex) {
        if (nIndex < 0) {
            return null;
        }
        var segments = this.getSegments();
        if (null == segments || segments.length <= nIndex) {
            return null;
        }
        return segments[nIndex];
    },

    /**
     * 获取导航段个数
     * @return {Number}
     */
    getSegmentCount:function(){
        return this.segments.length;
    },

    driveTime:-1,
    nTmcTime:-1,

	/**
	 * 返回本条道路的驾驶时间。
	 * @return {Number}驾驶时间。单位:秒
	 */
    getOrigDriveTime:function(){
        if(this.driveTime <= 0){
            var time = 0;
            var segments = this.getSegments();
            for(var i = 0; i < segments.length; i++){
                time += segments[i].getOrigDriveTime();
            }
            this.driveTime = time;
        }
        return this.driveTime;
    },

    /**
     * 获取取整后的驾驶时间，单位：秒
     * @return {Number}
     */
	getDriveTimeMinute:function(){
        return Math.ceil(this.getOrigDriveTime() / 60);
	},


    /**
     * 获取参考实时路况算得的行车时间，单位：秒
     * @return {Number}根据TMC估计出的行车时间
     */
    getTmcTime:function(){
        if(this.nTmcTime < 0){
            var time = 0;
            var segments = this.getSegments();

            for(var i = 0; i < segments.length; i++){
                var curT = segments[i].getTmcTime();
                if(curT == 0){
                    curT = segments[i].getOrigDriveTime();
                }
                time += curT;
            }
            this.nTmcTime = Math.round(time);
        }
        return this.nTmcTime;
    },

    /**
     * 返回以分钟计的tmc时间
     * @return {Number}
     */
    getTmcTimeMinute:function(){
        return Math.ceil(this.getTmcTime() / 60);
    },

    /**
     * 更新路径信息， 服务端给出的距离值不准确，用坐标重算一遍
     */
    updateRouteInfo:function(){
        var len = 0,
            segs = this.getSegments();
        for(var i = 0; i < segs.length; i++)
        {
            len += segs[i].getDistance();
        }
        this.totalDist = len;
    },
	
	/**
	 * 获取本路径的长度。
	 * @return 本路径长度，单位：米。
	 */
	getDistance:function(){

		if(this.totalDist <= 0){
            this.updateRouteInfo();
        }

		return this.totalDist;
	},
	
	/**
	 * 获取本路径收费路径长度。
	 * @return 本收费路径的长度，单位：米。
	 */
	getTollDistance:function(){
		if(this.tollLength >= 0){
			return this.tollLength;
		}
		var len = 0,
			segs = this.getSegments();
		for(var i=0;i<segs.length;i++ ){
			var seg = segs[i];
			len += seg.getTollDistance();			
		}
		this.tollLength = len;
		return len;
	},
	/**
	 * 获取本路径是否是分段路径,当分段下载时,对最后一段调用此方法会返回false;
	 * 此方法可以用来获取此段路径是否是全路径的最后一段
	 * @return 如果此分段是全路径的最后一段,返回false,否则返回true
	 */
	getIsDivided:function(){
		return this.bDivided;
	},
	/***
	 * 获得此路径的详细导航段数,只有分段下载时调用此方法返回的值才有意义
	 * @return 分段下载模式下(isDivided返回为true时),返回此路径的详细导航段个数,否则,返回0
	 */
	getDetailSegmentCount:function(){
		return this.detailSegmentCount;
	},
	/***
	 * 获取此路径中是否包含下一次请求的起点坐标信息，只在分段下载模式下有效
	 * @return 如果是分段下载模式，且此路径包含有效的下一次请求起点信息，则返回true,否则，返回false。
	 */
	hasPointInfoForNextRequest:function(){
		return this.hasPointForNextRequest;
	},
	/***
	 * 获取本路径下一次请求的起点信息，只在分段模式下有效
	 * @return 如果是分段下载模式，且存在下一次请求的起点信息，则返回下一个点的信息,否则，返回null
	 */
	getPointInfoForNextRequest:function(){
		if(this.hasPointInfoForNextRequest()){
			return this.nextPoint;
		}
		return null;
	},

    /**
     * 判别当前路段一定范围内是否拥堵
     * 两重判定：拥堵路段达到一定比例，时间较原来时间要长
     * @param segId         当前导航段
     * @param segRemainDist     当前导航段剩余距离
     * @param sId           起始查找位置
     * @param codeList      经过转换的locationCode列表
     * @param stateList     当前路况列表, 和codeList等长匹配
     * @return {Boolean}
     */
    isRouteBlocked:function(segId, segRemainDist, sId, codeList, stateList){
        var segs = this.getSegments(),
            curSeg = segs[segId],
            timePerDist = curSeg.getOrigDriveTime() / curSeg.getDistance(),
            driveLen = curSeg.getDistance() - segRemainDist,
            tmcRecords = curSeg.getTmcInfo(),
            timeSum = 0,
            newTimeSum = 0,
            distSum = 0,
            totalNum = 0,
            slowNum = 0,
            blockedNum = 0,
            listId = sId,
            bFind = false,
            i, code, curTime, curDist;

        // 遍历当前导航段剩余路段
        if(tmcRecords != null && tmcRecords.length > 0){
            for(i = 0; i <tmcRecords.length; i++){
                curDist = tmcRecords[i].getLength();
                if(distSum + curDist <= driveLen){
                    distSum += curDist;
                }
                else{
                    totalNum++;
                    //curTime = tmcRecords[i].getTime();
                    curTime = Math.round( timePerDist * curDist );
                    //处在剩余路段
                    code = tmcRecords[i].getLCode();
                    listId = this._getPos_(listId, code, codeList);
                    if(stateList[listId] == MRoute.RouteStatus.Status_Congested){
                        slowNum++;
                        curTime *= 2;
                    }
                    else if(stateList[listId] == MRoute.RouteStatus.Status_Blocked){
                        blockedNum++;
                        curTime *= 4;
                    }
                    if(!bFind){
                        bFind = true;
                        timeSum += Math.round(tmcRecords[i].getTime() * (distSum + curDist - driveLen)/curDist);
                        newTimeSum += Math.round(curTime *  (distSum + curDist - driveLen)/curDist);
                    }
                    else{
                        timeSum += tmcRecords[i].getTime();
                        newTimeSum += curTime;
                    }
                }
            }
        }
        else{
            curTime = Math.round(timePerDist * segRemainDist );
            timeSum +=  curTime;
            newTimeSum += curTime;
        }

        // 遍历剩余导航段，如timeSum已经足够大，则跳出
        for(var k = segId+1; k < segs.length; k++){
            tmcRecords = segs[k].getTmcInfo();
            timePerDist = segs[k].getOrigDriveTime() / segs[k].getDistance();
            if(tmcRecords != null && tmcRecords.length > 0){
                for(i = 0; i <tmcRecords.length; i++){
                    totalNum++;
                    //curTime = tmcRecords[i].getTime();
                    curTime = Math.round(timePerDist * tmcRecords[i].getLength() );
                    //处在剩余路段
                    code = tmcRecords[i].getLCode();
                    listId = this._getPos_(listId, code, codeList);
                    if(stateList[listId] == MRoute.RouteStatus.Status_Congested){
                        slowNum++;
                        curTime *= 2;
                    }
                    else if(stateList[listId] == MRoute.RouteStatus.Status_Blocked){
                        blockedNum++;
                        curTime *= 4;
                    }

                    timeSum += tmcRecords[i].getTime();
                    newTimeSum += curTime;
                }
            }
            else{
                curTime = Math.round(segs[k].getOrigDriveTime());
                timeSum +=  curTime;
                newTimeSum += curTime;
            }
            if(timeSum > 240 * 60){ // 4小时
                break;
            }
        }

        if(totalNum == 0){
            return false;
        }

        // 路况拥堵
        if( (slowNum + blockedNum)/totalNum > 0.35
            || slowNum /totalNum > 0.4
            || blockedNum /totalNum > 0.3)
        {
            // 剩余路段根据当前路况所需时间超出算路时估计的时间 30 分钟
            if(newTimeSum - timeSum > 30*60){
                return true;
            }
        }
        return false;
    },

    /**
     * 找到指定code 在数组中的位置编号
     * @param startId
     * @param code
     * @param codeList
     * @return {Number}
     * @private
     */
    _getPos_:function(startId, code, codeList){
        for(var i = startId; i < codeList.length; i++){
            if(codeList[i] == code){
                return i;
            }
        }
        // 处理未找到的情形，就本应用来说，不可能找不到
        return 0;
    },

    /**
     * 计算剩余TMC时间
     * @param segId
     * @param segRemainDist
     * @return {Number}
     */
    getRemainTMCTime:function(segId, segRemainDist){
        var i, timeRemain = 0,
            segs = this.getSegments();
        for(i = segId + 1; i < segs.length;i++ )
        {
            var seg = segs[i];
            timeRemain += seg.getTmcTime();
        }

        timeRemain += segs[segId].getTmcTime() *segRemainDist/ segs[segId].getDistance();

        return Math.round(timeRemain / 60);
    },

    /**
     * 获得整条路径的locCode（经转换），及对应的路段长度，各分段locCode起始位置
     * @return {Array, Array, Array}
     */
    getLocCodeList:function(){
        var codeList = [], distList = [], idList = [];
        var segs = this.getSegments();
        var lastId, segDist, tmcDist;
        for(var i = 0; i < segs.length; i++){
            segDist = segs[i].getDistance();
            var tmcRecords = segs[i].getTmcInfo();
            if(tmcRecords != null && tmcRecords.length > 0){
                idList[i] = codeList.length;
                tmcDist = 0;
                for(var j = 0; j < tmcRecords.length;j++){
                    codeList.push(tmcRecords[j].getLCode());
                    distList.push(tmcRecords[j].getLength());
                    tmcDist += tmcRecords[j].getLength();
                }
                // adjust dist to keep equal
                if(tmcDist != segDist){
                    lastId = codeList.length - 1;
                    distList[lastId] += segDist - tmcDist;

                    //防范非法情况
                    if(distList[lastId] <= 0){
                        var tmp = 0, off = idList[i];
                        for(j = 0; j < tmcRecords.length - 1; j++){
                            distList[j+off] = Math.round(tmcRecords[j].getLength()*segDist / tmcDist);
                            tmp += distList[j+off];
                        }
                        distList[j+off] = segDist - tmp;
                    }
                }
            }
            else{
                lastId = codeList.length - 1;
                if(codeList.length > 0 && codeList[lastId] == 0){
                    idList[i] = lastId;
                    distList[lastId] += segDist;
                }
                else{
                    idList[i] = codeList.length;
                    codeList.push(0);
                    distList.push(segDist);
                }
            }
        }

        return [codeList, distList, idList];
    },

    /**
     * 计算当前路径剩余距离
     * @param nSegId
     * @param nPtId
     * @param stPoint
     * @return {Number}
     */
    getRemainRouteDist:function(nSegId, nPtId, stPoint){
        var routeRemain = 0,
            segs = this.getSegments();
        for(var i = nSegId + 1; i < segs.length;i++ )
        {
            var seg = segs[i];
            routeRemain += seg.getDistance();
        }

        var segRemain = 0,
            curSeg = segs[nSegId],
            nextID = nPtId + 1,
            length = curSeg.getDetailedPointsCount();

        if(nextID < length){
            var linkId = curSeg.getLinkId(nPtId);
            segRemain  = curSeg.getRemainSegDist(linkId, nPtId, stPoint);

        } else {
            // 不在本导航段，处于导航段间过渡带
            // 过渡带长度未计入路径长度，略去过渡带上点到下一导航段间的距离计算
        }

        routeRemain += segRemain;

        return routeRemain;
    },


    /**
     * 计算当前路径及当前分段的剩余距离和剩余时间, 单位分别为米 和 分钟
     * @param nSegId
     * @param nPtId
     * @param stPoint
     * @return {Array}
     */
    getRemainDistAndTime:function(nSegId, nPtId, stPoint)
    {
        var routeRemain = 0,
            routeRTime = 0,
            segs = this.getSegments();
        for(var i = nSegId + 1; i < segs.length;i++ )
        {
            var seg = segs[i];
            routeRemain += seg.getDistance();
            //routeRTime  += seg.getDriveTimeMinute();
            routeRTime += seg.getEstimateTime();
        }

        var segRemain = 0,
            curSeg = segs[nSegId],
            nextID = nPtId + 1,
            length = curSeg.getDetailedPointsCount();

        if(nextID < length){
            var linkId = curSeg.getLinkId(nPtId);
            segRemain  = curSeg.getRemainSegDist(linkId, nPtId, stPoint);

        } else {
            // 不在本导航段，处于导航段间过渡带
            // 过渡带长度未计入路径长度，略去过渡带上点到下一导航段间的距离计算
        }


        routeRemain += segRemain;

        //var segRemainTime = segs[nSegId].getDriveTimeMinute() * (segRemain/segs[nSegId].getDistance());
        var segRemainTime = segs[nSegId].getEstimateTime() * (segRemain/segs[nSegId].getDistance());
        routeRTime += segRemainTime;

        segRemainTime = Math.round(segRemainTime);
        routeRTime = Math.round(routeRTime);

        return [routeRemain, segRemain, routeRTime, segRemainTime];

    }


	
});

/**
 +----------------------------------------------------------
 * 共用Link属性。由于Link的颗粒度很小，有时后可能连续多个Link都拥有许多相同的属性，为了减少冗余，我们
 * 把这些易重复的属性提取出来，单独组成一个共用属性，如果多个Link都含有相同属性，则它们会引用同一个共
 * 有属性。本类型只供本包内部使用，外部无法访问。
 +----------------------------------------------------------
 */
MRoute.SharedLinkAttribute = Class({
	linkType:0,		// 连接类型，取值范围：0-3
	Formway:0,		// 道路类型，取值范围：0-10
    RoadClass:0,	// 道路等级，取值范围：0-16
	bCityRoad:0,	// 是否城市道路
	direction:0,	// 道路方向：true 双向，false 单向
	btoll:0,		// 是否收费
	linkName:null,		// 道路名称
	
	"initialize":function(){
		
	}
	
});
MRoute.NaviLink = Class({
    cameras:null, // 电子眼信息,Camera[]

    backLane:-1, // 背景车道信息
    foreLane:-1, // 前景车道信息（箭头）
    laneCount:0, // 车道数目

    bIntoDiffCity:false, // 进入不同动态交通城市的Link标志
    bNeedPlay:false, // 复杂路口处的可播报标志
    atService:false, // 是否在服务区
    mixFork:false, // 是否含分叉路
    trafficLight:false, // 是否含交通灯

    signpost:null, // 路牌信息,目前不支持在Link中的路牌，此字段一直为空

    detailCoor:null, // 详细道路坐标,int[]

    begOffCoor:0,    // 道路坐标开始下标
    endOffCoor:0,    // 道路坐标结束下标

    distToExit:0,
    distance:0,

    sharedAttribute:null, // Link的共用属性,SharedLinkAttribute

    //------ 缺乏的信息
//    BYTE  m_TrafficStatus;			// 记录最初Link的交通状态
//    WORD  m_nLocde;					// 当前Link对应的Lcode		//add by hrb
//    WORD  m_nTopTime;				    // 拓扑本身的旅行时间
//    WORD  m_nLinkTime;				// 路口的旅行时间
//    DWORD m_nLinkLen;				    // link 段长度

    "initialize":function () {

    },


    /**
     * 获取LinkType。
     * @return {Number} Link的类型，取值范围为：0-3
     * @exception NullPointerException 如果Link属性没有被赋值，则会抛出此异常。
     */
    getLinkType:function () {
        if (this.sharedAttribute == null) {
            throw Error("Attribute reference can not be null.");
        }
        return this.sharedAttribute.linkType;
    },


    /**
     * 获取Link所在道路的类型。
     * @return {Number} Link的Form way，取值范围为：0-16。
     * @exception NullPointerException 如果Link属性没有被赋值，则会抛出此异常。
     */
    getLinkForm:function () {
        if (this.sharedAttribute == null) {
            throw Error("Attribute reference can not be null.");
        }
        return this.sharedAttribute.Formway;
    },

    /**
     * 获取RoadClass
     * @return {Number} Road的类型
     * @exception NullPointerException 如果Link属性没有被赋值，则会抛出此异常。
     */
    getRoadClass:function () {
        if (this.sharedAttribute == null) {
            throw Error("Attribute reference can not be null.");
        }
        return this.sharedAttribute.RoadClass;
    },

    /**
     * 获取Link所在道路是否城市道路。
     * @return {Boolean} 如果是汽车双向路则返回true，单向路则返回false。
     * @exception NullPointerException 如果Link属性没有被赋值，则会抛出此异常。
     */
    isCityRoad:function () {
        if (this.sharedAttribute == null) {
            throw Error("Attribute reference can not be null.");
        }
        return this.sharedAttribute.bCityRoad;
    },


    /**
     * 获取Link所在道路是否汽车双向路。
     * @return {Boolean} 如果是汽车双向路则返回true，单向路则返回false。
     * @exception NullPointerException 如果Link属性没有被赋值，则会抛出此异常。
     */
    getDirection:function () {
        if (this.sharedAttribute == null) {
            throw Error("Attribute reference can not be null.");
        }
        return this.sharedAttribute.direction;
    },

    /**
     * 获取Link所在道路是否收费。
     * @return {Boolean} 收费返回true，否则返回false。
     * @exception NullPointerException 如果Link属性没有被赋值，则会抛出此异常。
     */
    isToll:function () {
        if (this.sharedAttribute == null) {
            throw Error("Attribute reference can not be null.");
        }
        return this.sharedAttribute.btoll;
    },


    /**
     * 获取Link所在道路的名称。
     * @return {string} 如果Link所在道路存在名称，则返回该道路的名称；如果不存在名称，则返回null。
     * @exception NullPointerException 如果Link属性没有被赋值，则会抛出此异常。
     */
    getLinkName:function () {
        if (this.sharedAttribute == null) {
            throw Error("Attribute reference can not be null.");
        }
        return this.sharedAttribute.linkName;
    },

    /**
     * 给出点的索引，判定给定点是否位于本link段
     * @return {Boolean}
     */
    isContain:function (nPtId) {
        var Id = nPtId * 2;
        return Id >= this.begOffCoor && Id < this.endOffCoor;
    },

    /**
     * @return {Number}首点在segment中的坐标编号
     */
    getStartPtId:function () {
        return this.begOffCoor / 2;
    },

    /**
     * @return {Number} 尾点在segment中的坐标编号
     */
    getLastPtId:function(){
        return this.endOffCoor / 2 - 1;
    },

    setDistance:function(dist){
        this.distance = dist;
    },

    setDistToExit:function(dist){
        this.distToExit = dist;
    },

    getDistToExit:function(){
        return this.distToExit;
    },

    getDistance:function(){
        return this.distance;
    },

    /***
     * 获取此link上包含的电子眼信息个数
     * @return {Number} 返回该Link上包含的电子眼信息个数,如果没有电子眼信息,返回0
     */
    getCameraCount:function () {
        if (this.cameras == null) {
            return 0;
        }
        return this.cameras.length;
    },

    /**
     * 获取本Link中第idx个Camera对象,idx从0开始。
     * @return  {Boolean} 当本Link中存在摄像头时返回第idx个摄像头对象，不存在摄像头或idx不合法时返回null。
     */
    getCameras:function (idx) {
        if (idx) {
            if (idx < this.getCameraCount()) {
                return this.cameras[idx];
            }
        } else {
            if (this.cameras != null) {
                return this.cameras[0];
            }
        }
        return null;
    },
    /**
     * 获取本Link所在道路中是否存在服务区。
     * @return  {Boolean} 如果存在服务区则返回true，否则返回false。
     */
    isAtService:function () {
        return this.atService;
    },

    /**
     * 获取本Link是否含分叉路。
     * @return  {Boolean} 如果含分叉路则返回true，否则返回false。
     */
    hasMixFork:function () {
        return this.mixFork;
    },

    /**
     * 获取本Link结尾是否有交通灯。
     * @return  {Boolean} 如果有交通灯则返回true，否则返回false。
     */
    hasTrafficLight:function () {
        return this.trafficLight;
    },

    /**
     * 获取Link所在道路的车道数。
     * @return {Number} 车道数目。
     */
    getLaneCount:function () {
        return this.laneCount;
    },

    /**
     * 获取车道信息的背景。
     * @return {Number} 如果不存在则返回-1。
     */
    getBackgroundLane:function () {
        return this.backLane;
    },

    /**
     * 获取车道信息的前景转弯箭头。
     * @return {Number} 如果不存在则返回-1。
     */
    getForegroundLane:function () {
        return this.foreLane;
    },

    /**
     * 获取Link中的路牌信息。目前服务端未提供此信息，只提供导航段级的路牌。
     * @return {String} 如果不存在路牌则返回null；
     */
    getSignpost:function () {
        return this.signpost;
    },

    /**
     * 获取本Link坐标在导航段详细坐标数组的start index。
     * @return {Number} 由于本Link的坐标为本导航段坐标的一部分，因此可以通过此索引直接在导航段的详细坐标数组中获取本Link的坐标。
     */
    getStartCoorIndex:function () {
        return this.begOffCoor;
    },
    /**
     * 获取本Link坐标在导航段详细坐标数组的end index（ 注意：本Link不包含这个结束坐标）。
     * @return {Number} 坐标的结束索引。
     */
    getEndCoorIndex:function () {
        return this.endOffCoor;
    },


    /**
     * 获取本Link的详细坐标点的个数。
     * @return {Number} 因为每个点两个坐标，所以应该为总长一半。
     */
    getDetailedPointsCount:function () {
        var size = this.endOffCoor - this.begOffCoor;
        // assert size >= 0 && (size & 0x1) == 0;
        return size / 2;
    },

    /***
     * 获取该Link是否是进入不同动态交通城市的Link,主要用于跨城市的动态路径,当过了此Link时重新请求路径
     * @return {Boolean} 如果该Link的最后一个点进入了另一个动态交通城市,返回true,否则,返回false
     */
    isIntoDiffCityLink:function () {
        return this.bIntoDiffCity;
    },

    /***
     * 判断该Link的尾部是否位于复杂结点处,该方法主要用于客户端解决长时间没有播报的问题.
     * @return  {Boolean}  如果该Link的尾部位于复杂结点处,则返回true;否则,返回false
     */
    isNeedPlay:function () {
        return this.bNeedPlay;
    }



});

MRoute.NaviDirection = Class({
	angle: 0,		// 整数方向角（0-4096），以正东方向为0度角，360度角对应TRIGONOMETRIC_MAXS*4
	TRIGONOMETRIC_BITS : 12,
	TRIGONOMETRIC_MAXS : 0x1000,
	TRIGONOMETRIC_MASK : 0x0FFF,
	TRIGONOMETRIC_LIMIT : 0x7FFFF,
	DEGREE_TO_RAW : 45.511111,

	costab : [
		0x1000, 0x0FFF, 0x0FFF, 0x0FFF, 0x0FFE, 0x0FFE, 0x0FFD, 0x0FFC,
		0x0FFB, 0x0FF9, 0x0FF8, 0x0FF6, 0x0FF4, 0x0FF2, 0x0FF0, 0x0FEE,
		0x0FEC, 0x0FE9, 0x0FE7, 0x0FE4, 0x0FE1, 0x0FDE, 0x0FDA, 0x0FD7,
		0x0FD3, 0x0FCF, 0x0FCB, 0x0FC7, 0x0FC3, 0x0FBF, 0x0FBA, 0x0FB6,
		0x0FB1, 0x0FAC, 0x0FA7, 0x0FA1, 0x0F9C, 0x0F96, 0x0F91, 0x0F8B,
		0x0F85, 0x0F7F, 0x0F78, 0x0F72, 0x0F6B, 0x0F64, 0x0F5D, 0x0F56,
		0x0F4F, 0x0F48, 0x0F40, 0x0F39, 0x0F31, 0x0F29, 0x0F21, 0x0F18,
		0x0F10, 0x0F08, 0x0EFF, 0x0EF6, 0x0EED, 0x0EE4, 0x0EDB, 0x0ED1,
		0x0EC8, 0x0EBE, 0x0EB4, 0x0EAA, 0x0EA0, 0x0E96, 0x0E8B, 0x0E81,
		0x0E76, 0x0E6B, 0x0E60, 0x0E55, 0x0E4A, 0x0E3F, 0x0E33, 0x0E28,
		0x0E1C, 0x0E10, 0x0E04, 0x0DF8, 0x0DEB, 0x0DDF, 0x0DD2, 0x0DC6,
		0x0DB9, 0x0DAC, 0x0D9F, 0x0D91, 0x0D84, 0x0D77, 0x0D69, 0x0D5B,
		0x0D4D, 0x0D3F, 0x0D31, 0x0D23, 0x0D14, 0x0D06, 0x0CF7, 0x0CE8,
		0x0CD9, 0x0CCA, 0x0CBB, 0x0CAC, 0x0C9D, 0x0C8D, 0x0C7D, 0x0C6E,
		0x0C5E, 0x0C4E, 0x0C3E, 0x0C2D, 0x0C1D, 0x0C0D, 0x0BFC, 0x0BEB,
		0x0BDA, 0x0BCA, 0x0BB8, 0x0BA7, 0x0B96, 0x0B85, 0x0B73, 0x0B62,
		0x0B50, 0x0B3E, 0x0B2C, 0x0B1A, 0x0B08, 0x0AF6, 0x0AE3, 0x0AD1,
		0x0ABE, 0x0AAC, 0x0A99, 0x0A86, 0x0A73, 0x0A60, 0x0A4D, 0x0A39,
		0x0A26, 0x0A12, 0x09FF, 0x09EB, 0x09D7, 0x09C4, 0x09B0, 0x099C,
		0x0987, 0x0973, 0x095F, 0x094B, 0x0936, 0x0921, 0x090D, 0x08F8,
		0x08E3, 0x08CE, 0x08B9, 0x08A4, 0x088F, 0x087A, 0x0864, 0x084F,
		0x0839, 0x0824, 0x080E, 0x07F8, 0x07E2, 0x07CD, 0x07B7, 0x07A0,
		0x078A, 0x0774, 0x075E, 0x0748, 0x0731, 0x071B, 0x0704, 0x06ED,
		0x06D7, 0x06C0, 0x06A9, 0x0692, 0x067B, 0x0664, 0x064D, 0x0636,
		0x061F, 0x0608, 0x05F0, 0x05D9, 0x05C2, 0x05AA, 0x0593, 0x057B,
		0x0563, 0x054C, 0x0534, 0x051C, 0x0504, 0x04EC, 0x04D5, 0x04BD,
		0x04A5, 0x048C, 0x0474, 0x045C, 0x0444, 0x042C, 0x0413, 0x03FB,
		0x03E3, 0x03CA, 0x03B2, 0x0399, 0x0381, 0x0368, 0x0350, 0x0337,
		0x031F, 0x0306, 0x02ED, 0x02D5, 0x02BC, 0x02A3, 0x028A, 0x0271,
		0x0259, 0x0240, 0x0227, 0x020E, 0x01F5, 0x01DC, 0x01C3, 0x01AA,
		0x0191, 0x0178, 0x015F, 0x0146, 0x012D, 0x0114, 0x00FB, 0x00E2,
		0x00C8, 0x00AF, 0x0096, 0x007D, 0x0064, 0x004B, 0x0032, 0x0019,
		0x0000
	],
	
	tantab : [
		0x0000, 0x000A, 0x0014, 0x001E, 0x0028, 0x0032, 0x003D, 0x0047,
		0x0051, 0x005B, 0x0065, 0x006F, 0x007A, 0x0084, 0x008E, 0x0098,
		0x00A2, 0x00AC, 0x00B7, 0x00C1, 0x00CB, 0x00D5, 0x00DF, 0x00E9,
		0x00F3, 0x00FD, 0x0107, 0x0112, 0x011C, 0x0126, 0x0130, 0x013A,
		0x0144, 0x014E, 0x0158, 0x0162, 0x016C, 0x0176, 0x0180, 0x018A,
		0x0194, 0x019E, 0x01A8, 0x01B1, 0x01BB, 0x01C5, 0x01CF, 0x01D9,
		0x01E3, 0x01ED, 0x01F6, 0x0200, 0x020A, 0x0214, 0x021E, 0x0227,
		0x0231, 0x023B, 0x0244, 0x024E, 0x0258, 0x0261, 0x026B, 0x0275,
		0x027E, 0x0288, 0x0291, 0x029B, 0x02A5, 0x02AE, 0x02B8, 0x02C1,
		0x02CA, 0x02D4, 0x02DD, 0x02E7, 0x02F0, 0x02F9, 0x0303, 0x030C,
		0x0315, 0x031F, 0x0328, 0x0331, 0x033A, 0x0343, 0x034D, 0x0356,
		0x035F, 0x0368, 0x0371, 0x037A, 0x0383, 0x038C, 0x0395, 0x039E,
		0x03A7, 0x03B0, 0x03B9, 0x03C2, 0x03CB, 0x03D3, 0x03DC, 0x03E5,
		0x03EE, 0x03F6, 0x03FF, 0x0408, 0x0411, 0x0419, 0x0422, 0x042A,
		0x0433, 0x043B, 0x0444, 0x044C, 0x0455, 0x045D, 0x0466, 0x046E,
		0x0477, 0x047F, 0x0487, 0x048F, 0x0498, 0x04A0, 0x04A8, 0x04B0,
		0x04B9, 0x04C1, 0x04C9, 0x04D1, 0x04D9, 0x04E1, 0x04E9, 0x04F1,
		0x04F9, 0x0501, 0x0509, 0x0511, 0x0518, 0x0520, 0x0528, 0x0530,
		0x0538, 0x053F, 0x0547, 0x054F, 0x0556, 0x055E, 0x0566, 0x056D,
		0x0575, 0x057C, 0x0584, 0x058B, 0x0593, 0x059A, 0x05A1, 0x05A9,
		0x05B0, 0x05B7, 0x05BF, 0x05C6, 0x05CD, 0x05D4, 0x05DC, 0x05E3,
		0x05EA, 0x05F1, 0x05F8, 0x05FF, 0x0606, 0x060D, 0x0614, 0x061B,
		0x0622, 0x0629, 0x0630, 0x0637, 0x063D, 0x0644, 0x064B, 0x0652,
		0x0659, 0x065F, 0x0666, 0x066D, 0x0673, 0x067A, 0x0680, 0x0687,
		0x068D, 0x0694, 0x069A, 0x06A1, 0x06A7, 0x06AE, 0x06B4, 0x06BB,
		0x06C1, 0x06C7, 0x06CD, 0x06D4, 0x06DA, 0x06E0, 0x06E6, 0x06ED,
		0x06F3, 0x06F9, 0x06FF, 0x0705, 0x070B, 0x0711, 0x0717, 0x071D,
		0x0723, 0x0729, 0x072F, 0x0735, 0x073B, 0x0741, 0x0746, 0x074C,
		0x0752, 0x0758, 0x075D, 0x0763, 0x0769, 0x076E, 0x0774, 0x077A,
		0x077F, 0x0785, 0x078B, 0x0790, 0x0796, 0x079B, 0x07A1, 0x07A6,
		0x07AB, 0x07B1, 0x07B6, 0x07BC, 0x07C1, 0x07C6, 0x07CC, 0x07D1,
		0x07D6, 0x07DB, 0x07E1, 0x07E6, 0x07EB, 0x07F0, 0x07F5, 0x07FA,
		0x0800, 0x0800
	],
	
    dirtab : [
		"东",
		"东北",
		"北",
		"西北",
		"西",
		"西南",
		"南",
		"东南"
    ],
    
    dirtab_en : [
		"east",
		"northeast",
		"north",
		"northwest",
		"west",
		"southwest",
		"south",
		"southeast"
    ],
	
	"initialize":function(x1, y1, x2, y2){
		var cy = parseInt((y1 + y2)/CoordFactor/2 * this.DEGREE_TO_RAW),
			dx = x2 - x1,
			dy = y2 - y1;
		dx = (dx * this.intCos(cy)) >> 12;

        // problem
		this.angle = this.arcTan(dx,dy);
	},
	

	/**
	 * 获取p1 -> p2 的角度。
	 * @return 返回角度的返回为[0,360)。
	 */
	getAngle:function(){
		return this.angle / this.DEGREE_TO_RAW;
	},
	
	/**
	 * 获取内部使用的p1 -> p2 的角度。
	 * @return 返回角度的返回为[0,TRIGONOMETRIC_MAXS * 4)
	 */
	getRawAngle:function(){
		return this.angle;
	},
	
	/**
	 * 重置toString方法。将返回方向字符串，缺省为中文。
	 */
	toString:function(lang){
        var idx;
		if(lang){
			idx = this.angle + (this.TRIGONOMETRIC_MAXS >> 2);
			if (idx >= this.TRIGONOMETRIC_MAXS * 4)
				idx -= this.TRIGONOMETRIC_MAXS * 4;
			idx = idx / (this.TRIGONOMETRIC_MAXS >> 1);
			if(lang == "en"){
				return this.dirtab_en[idx];
			}else{
				return this.dirtab[idx];
			}
		}else{
			idx = this.angle + (this.TRIGONOMETRIC_MAXS >> 2);
			if (idx >= this.TRIGONOMETRIC_MAXS * 4){
				idx -= this.TRIGONOMETRIC_MAXS * 4;
			}
			idx = idx / (this.TRIGONOMETRIC_MAXS >> 1);
			return this.dirtab[idx];
		}
	},

	intCos:function(x){
		if(x <= 0){
			return this.TRIGONOMETRIC_MAXS;
		}
		if(x >= this.TRIGONOMETRIC_MAXS){
			return 0;
		}

		var i = parseInt(x >> 4),
			e = parseInt(x & 15),
			a = parseInt(this.costab[i]),
			b = parseInt(this.costab[i + 1]);

		return a - (((a - b) * e) >> 4);
	},

	/**
	 * 计算向量方向角。
	 * @param x 向量的x分量。 
	 * @param y 向量的y分量。
	 * @return  返回以x正方向为0度方向的象限角，每个象限划分为TRIGONOMETRIC_MAXS度，因此
	 * 返回值范围为[0, TRIGONOMETRIC_MAXS *4)。
	 * @exception ArithmeticException x与y的绝对值中较小的不能大于TRIGONOMETRIC_LIMIT，否则
	 * 会抛出此异常。 
	 */
	arcTan:function(x, y){
		// y==0时，可能是0度或180度，注意：x=0，y=0时将返回0。
		if (y == 0){
			return (x >= 0) ? 0 : this.TRIGONOMETRIC_MAXS * 2;
		}
		// x==0时，可能是90度或270度。
		if (x == 0){
			return (y > 0)  ? this.TRIGONOMETRIC_MAXS : this.TRIGONOMETRIC_MAXS *3;
		}
		var X = Math.abs(x),
			Y = Math.abs(y);
		var max0 = Math.max(Y, X),
            min0 = Math.min(Y,X);

		if(min0 > this.TRIGONOMETRIC_LIMIT){
			throw Error("out of range");
		}

		// w = 2^TRIGONOMETRIC_BITS * min(x,y)/max(x,y) 
		var w = (min0 << this.TRIGONOMETRIC_BITS) / max0,

			i = w >> 4, //  0 =< i <= 2^8
			e = w & 0xf,
			a = this.tantab[i    ],
			b = this.tantab[i + 1];

		w = a - (((a - b) * e) >> 4);		
		if (Y > X){
			w = this.TRIGONOMETRIC_MAXS - w;
		}
		if (x > 0 ){
			if(y > 0){	   	// 第一象限
				return w;
			}
            else{				// 第四象限
				return this.TRIGONOMETRIC_MAXS * 4 - w;		
			}
		}else{
			if ( y > 0){		// 第二象限
				return this.TRIGONOMETRIC_MAXS * 2 - w;
			}
			if ( y < 0){		// 第四象限
				return this.TRIGONOMETRIC_MAXS * 2 + w;
			}
		}
		return w;		
	}
});
// +----------------------------------------------------------------------
// | MapABC WebRoute API
// +----------------------------------------------------------------------
// | Copyright (c) 2010 http://MapABC.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed AutoNavi MapABC
// +----------------------------------------------------------------------
// | Author: yhostc <yhostc@gmail.com>
// +----------------------------------------------------------------------

/**
 +----------------------------------------------------------
 * 
 +----------------------------------------------------------
 * 
 +----------------------------------------------------------
 */
MRoute.Camera = Class({
	
	type : -1,			
	x : 0,
	y : 0,
	speed : -1,
	
	
	"initialize":function(){
		
	},
	/**
	 * 获取摄像头类型。
	 * @return 摄像头类型。
	 */
	getCameraType:function(){
		return this.type;	
	},
	
	/**
	 * 获取摄像头的整形的坐标。
	 * @return 坐标。
	 */	
	getCoordinate:function(){
		return new MRoute.NvPoint(this.x,this.y);
	},
	
	/**
	 * 获取整形的经度。
	 * @return 整形经度，为浮点经度的NaviPoint.coorFactor倍。
	 */
	getIntX:function(){
		return this.x;
	},
	
	/**
	 * 获取整形的纬度。
	 * @return  整形纬度，为浮点纬度的NaviPoint.coorFactor倍。
	 */
	getIntY:function(){
		return this.y;
	},
	
	/***
	 * 获取该摄像头的限速信息(一般测速摄像头才有限速信息)
	 * @return	该摄像头的限速信息,单位:km/h,如果该摄像头没有限速信息,则返回0
	 */
	getSpeed:function(){
		return this.speed;
	}
	
});

/**
 +----------------------------------------------------------
 * 导航抓路
 +----------------------------------------------------------
 */

//MRoute.GPSInfo = Class({
//    fLongitude:0,       //经度
//    fLatitude:0,        //纬度
//    fElevation:0,       //海拔
//    fSpeed:0,           //速度
//    fDirection:0,       //方位
//    fDop:0,             //位置精度
//    nDate:0,            //日期
//    nTime:0,            //时间
//    bValid: false,      //有效性
//    nDistToRoad:0,      //到路径的距离
//
//    "initialize":function(){
//        this.fLongitude = 0;
//        this.fLatitude = 0;
//        this.fElevation = 0;
//        this.fSpeed = 0;
//        this.fDirection = 0;
//        this.nDate = 0;
//        this.nTime = 0;
//        this.bValid = false;
//        this.nDistToRoad = 0;
//    }
//});

MRoute.GPSContainer = Class({
    gpsList:[],
    lastGPS:null,
    invalidGPS:null,
    nInvalidNum:0,
    nLastTime:0,
    KEEP_LEN:5,
    MINI_SPEED:3, // GPS最小速度  0.8333米/秒  3Km/1h

    "initialize":function () {
    },

    /**
     * 判别gps数据是否有效，有效则保存到列表
     * @param newGps 新GPS信息
     * @return {Boolean} 是否成功加入gps列表
     */
    pushGPSInfo:function (newGps) {

        var bValid = true;
        if (this.gpsList == null || this.gpsList.length == 0) {
            this.lastGPS = newGps;
            this.gpsList.push(newGps);
        }
        else {
            if (this._CheckGPS_(newGps)) {
                this.nInvalidNum = 0;
                this.gpsList.push(newGps);
            }
            else {
                this.nInvalidNum++;
                this.invalidGPS = newGps;
                bValid = false;
            }
        }

        if (bValid) {
            this.nLastTime = Math.round(new Date().getTime() / 1000);
        }

        this._PruneList_();

        return bValid;
    },

    /**
     * 裁减列表，仅维护短列表
     * @private
     */
    _PruneList_:function () {
        if (this.gpsList.length > 90) {
            var newlist = [];
            var lastid = this.gpsList.length - 1;

            // 仅保留尾部元素
            newlist.push(this.gpsList[lastid - 4]);
            newlist.push(this.gpsList[lastid - 3]);
            newlist.push(this.gpsList[lastid - 2]);
            newlist.push(this.gpsList[lastid - 1]);
            newlist.push(this.gpsList[lastid]);

            this.gpsList = newlist;
        }
    },

    /**
     * 返回时间最近的有效GPS坐标
     * @param num 请求的坐标点数目
     * @return {Array} 按经纬度排列的最新GPS坐标，时间最近的在列表尾部
     */
    getRecentPt:function (num) {
        var list = [];

        var curTime = Math.round(new Date().getTime() / 1000);
        if (curTime - this.nLastTime > 60) {
            return list;
        }

        if (num <= 0 || this.gpsList == null) {
            return list;
        }
        num = Math.min(this.gpsList.length, num);

        var id = this.gpsList.length - num;
        for (var i = 0; i < num; i++) {
            list.push(this.gpsList[id].lon);
            list.push(this.gpsList[id].lat);
            id++;
        }

        return list;
    },

    getPtListWithAngle:function(num){
        var list = [];

        var curTime = Math.round(new Date().getTime() / 1000);
        if (curTime - this.nLastTime > 60) {
            return list;
        }

        if (num <= 0 || this.gpsList == null) {
            return list;
        }
        num = Math.min(this.gpsList.length, num);

        var id = this.gpsList.length - num;
        for (var i = 0; i < num; i++) {
            list.push({x:this.gpsList[id].lon, y:this.gpsList[id].lat, a:this.gpsList[id].track});
            id++;
        }

        return list;
    },

    /**
     * 判定数据是否合格
     * @param newGps 新gps数据
     * @return {Boolean}  数据是否合格
     * @private
     */
    _CheckGPS_:function (newGps) {

        //步骤一：如果与前一个无效点坐标一致，则直接过滤
        if (this.invalidGPS != null) {
            if (this.invalidGPS.lon == newGps.lon && this.invalidGPS.lat == newGps.lat) {
                return false;
            }
        }

        if (!this._CheckGPSSpeed_(newGps)) {//步骤二：如果速度小于3km/h，则过滤此点
            this.invalidGPS = newGps;
            return false;
        }

        if (!this._CheckGPSTime_(newGps)) {//步骤三：判断时间因素
            this.invalidGPS = newGps;
            return false;
        }

        this.lastGPS = newGps;
        return true;
    },

    /**
     * 判断速度是否合格
     * @param newGps 新gps数据
     * @return {Boolean} 速度是否满足要求
     * @private
     */
    _CheckGPSSpeed_:function (newGps) {
        return newGps.speed >= this.MINI_SPEED;
    },

    /**
     * 判断时间是否合格
     * @param newGps 新gps数据
     * @return {Boolean} 时间是否满足要求
     * @private
     */
    _CheckGPSTime_:function (newGps) {
        if (this.lastGPS == null) {
            return true;
        }
        var lastgps = this.lastGPS;
        if (lastgps.TimeEqual(newGps)) {//原则一：如果与前一点时间重合，则认为此点无效
            return false;
        }
        var nowLoc = newGps.GetLoc();
        var lastLoc = this.lastGPS.GetLoc();

        //计算两个GPS点的距离间隔，单位米
        var dDistance = MRoute.GeoUtils.CalculateDistance(nowLoc.x, nowLoc.y, lastLoc.x, lastLoc.y);
        if ((1e-5 > dDistance)) {
            return false;
        }

        //原则三：根据在正常行驶过程中(>10km/h),前后两点的时间间隔和距离计算速度，然后再跟GPS信息中的速度进行比较，
        //如果计算速度明显大于GPS速度则有可能是漂移点，过滤此点

        var time1 = Date.UTC(newGps.Year, newGps.Month, newGps.Day,
            newGps.Hour, newGps.Minute, newGps.Second) / 1000;
        var time0 = Date.UTC(lastgps.Year, lastgps.Month, lastgps.Day,
            lastgps.Hour, lastgps.Minute, lastgps.Second) / 1000;
        var nInterval = Number(time1.toFixed(0)) - Number(time0.toFixed(0));

        if (nInterval <= 3 && nInterval != 0)//如果时间间隔超过3秒则此条原则无效
        {

            var dSpeed = dDistance / nInterval * 3600;
            if ((newGps.speed > 10) && (dSpeed > newGps.speed * 2)) {
                //如果gps速度可靠，而计算速度大于gps指示速度的两倍
                //方向在原来稳定的情况下突然发生较大的变动(>30度)，则过滤该点
                if (this._CalcDirTrend_(5)) {
                    var diff = Math.abs(lastgps.track - newGps.track);
                    if (diff > 30 && diff < 330) {
                        return false;
                    }
                }
            }
        }
        return true;
    },

    _CalcDirTrend_:function (num) {
        if (this.gpsList.length < num || num < 3) {
            return false;
        }
        //判断原则：如果前后两点的方向角度之差在15度以内，则认为方向稳定
        var lastid = this.gpsList.length - 1;
        var start = Math.max(lastid - num, 0);
        for (var i = start; i < lastid - 1; i++) {
            var diff = Math.abs(this.gpsList[i].track - this.gpsList[i + 1].track);
            if (diff > 15 && diff < 345) {
                return false;
            }
        }

        return true;
    }

});


MRoute.VP = Class({

    NAVIRANGE_ONROUTE:50, // 在路上的距离范围 如果偏离了预设值则认为偏离,单位米
    OFFROUTE_MAXCOUNTER:5, // 偏离轨道的最大次数，超过本数量为偏离


    m_nOffCount:0, // 距离脱离路径次数阈值

    m_NaviLon:0, // 当前采用的匹配位置
    m_NaviLat:0,
    m_Percent:0,

    m_MatchLon:0, // 当前点匹配到的最近点
    m_MatchLat:0,

    m_CurSegID:0, // 当前导航段序号
    m_CurPtID:0, // 当前形状点序号
    m_CurLinkID:0, // 当前Link序号

    m_bReroute:false, //  是否自动重算路
    m_bProcessing:false, //  是否正在匹配

    segments:[], // 道路信息 NaviSegment[]
    m_pstFrame:null,
    m_carLoc:null, // 当前车位信息，VPLocation
    m_container:null, // gps数据管理及有效性检查工具

    "initialize":function (Frame) {
        this.m_pstFrame = Frame;
        this.m_container = new MRoute.GPSContainer();

        // new出来的自车车位采用无效值
        this.m_carLoc = new MRoute.VPLocation();
        this._resetVP_();
    },


    /**
     * 接收外部传入的GPS数据
     * @param stNmea
     */
    SetNmea:function (stNmea) {
        // 上一数据还没有处理完毕
        if (this.m_bProcessing) {
            return;
        }

        //进入匹配处理
        this.m_bProcessing = true;

        //omit 纠偏
        this._dealWithGPS_(stNmea);

        this.m_bProcessing = false;
    },

    bFirstMatch:false,

    _dealWithGPS_:function (gpsInfo) {
        // gps信息无效则不处理
        if (!gpsInfo.nValid) {
            this.m_pstFrame.OnSetValidGPS(false);
            return false;
        }

        this._setCarLoc_(gpsInfo);

        // 检查GPS有效性，如果无效，获得GPS坐标，也触发一次界面更新
        if (!this.m_container.pushGPSInfo(gpsInfo)) {
            this.m_pstFrame.OnCarLocationChange(false, false);
            return false;
        }

        var bSuc = this._matchProc_(gpsInfo.lon, gpsInfo.lat);
//        if (bSuc) {
//            this.PushProbeInfo(gpsInfo);
//        }

        // 只要gps信息实际有效就通知车位变更
        // 匹配后segid，ptid等会变化
        this.m_carLoc.nValid = 1;
        this.m_carLoc.nSegId = this.m_CurSegID;
        this.m_carLoc.nPtId = this.m_CurPtID;

        // 触发更新事件，匹配成功的点会传给DG
        this.m_pstFrame.OnCarLocationChange(true, bSuc);
        return bSuc;

    },

    PushProbeInfo:function (gpsInfo) {
        var info = new MRoute.ProbeInfo();

        info.BJYear = gpsInfo.Year;
        info.BJMonth = gpsInfo.Month;
        info.BJDay = gpsInfo.Day;
        info.BJHour = gpsInfo.Hour;
        info.BJMinute = gpsInfo.Minute;
        info.BJSecond = gpsInfo.Second;
        info.GpsLon = gpsInfo.lon;
        info.GpsLat = gpsInfo.lat;
        info.Speed = gpsInfo.speed;
        info.Angle = gpsInfo.track;

        var curSeg = this.segments[this.m_CurSegID],
            linkNum = curSeg.getLinkCount();

        info.nReliable = 1;
        info.bIsEndLinkOfSeg = !!((this.m_CurLinkID == linkNum - 1));
        info.ucSegNaviAction = curSeg.getBasicAction();
        info.MatchLat = this.m_NaviLat;
        info.MatchLon = this.m_NaviLon;

        this.m_pstFrame.OnPushProbeInfo(info);
    },

    /**
     * 通过该接口给VP对象设置路径信息
     * @param segments 被选路径的分段列表
     */
    SetRoute:function (segments) {
        // 注意：偏离原路reroute时会置空
        this._resetVP_();
        this.segments = segments;
        this.bFirstMatch = false;
    },


    /**
     * 执行路径匹配
     * @return {Boolean} 是否成功标志
     * @private
     */
    _matchProc_:function (gpsLon, gpsLat) {

        // 若reroute成功前，segments为空，不做匹配
        if (this.segments == null || this.m_CurSegID >= this.segments.length) {
            return false;
        }

        // 通过GPS点向导航线路做垂线,来确定当前位置
        // 更新位置量 m_CurSegID，m_CurPtID，m_NaviLon，m_NaviLat, m_Percent
        // 获得离路径最短距离
        var nMinDistance = this._updateCarLoc_(gpsLon, gpsLat);

        // 在确定了当前导航段内的坐标点序号后，确定当前坐标点序号所在的Link序号
        var curSeg = this.segments[this.m_CurSegID],
            linkId = curSeg.getLinkId(this.m_CurPtID),
            curLink = curSeg.getLink(linkId);

        // 求车在路线上的方向角
        this.m_carLoc.nAngle = this._calCarAngle_(this.segments, this.m_CurSegID, this.m_CurPtID);
        this.m_carLoc.eFormWay = curLink.getLinkForm();
        this.m_carLoc.eRoadClass = curLink.getRoadClass();

        this.m_CurLinkID = linkId; // 保存当前linkId信息

        if (nMinDistance >= this.NAVIRANGE_ONROUTE)    //如果偏离了预设路径
        {
            this.m_carLoc.eState = MRoute.VPStatus.VPStatus_OnLink;

            var linkType = curLink.getLinkType();
            if (linkType == MRoute.LinkType.LinkType_Tunnel)
                return false;

            TestInfoLog("TBT-VP-_matchProc_: deviate" + this.m_nOffCount + ",dist:" + nMinDistance);
            TestInfoLog("gpsLoc:" + gpsLon + "," + gpsLat + "," + "matchLoc:" + this.m_MatchLon + "," + this.m_MatchLat);

            this.m_nOffCount++;
            if (this.m_nOffCount < 5) {
                return false;
            }
            TestInfoLog("TBT-VP-_matchProc_: reroute");

            this.m_bReroute = true;
            this.m_pstFrame.OnReroute();
            return false;
        }
        else {
            this.m_nOffCount = 0;
        }

        if (!this.bFirstMatch) {
            this.bFirstMatch = true;
            TestInfoLog("TBT-VP-_matchProc_first match:" + (new Date()).getTime());
        }

        this.m_carLoc.eState = MRoute.VPStatus.VPStatus_OnRoute;
        // 转为DG使用的Geo坐标
        this.m_carLoc.dLon = this.m_NaviLon;
        this.m_carLoc.dLat = this.m_NaviLat;
        return true;
    },

    /**
     * 计算当前车的角度, 结合下一点求角度
     * @param segments
     * @param segId
     * @param ptId
     * @return {Number}
     * @private
     */
    _calCarAngle_:function (segments, segId, ptId) {

        if (segId >= segments.length) {
            segId = segments.length - 1;
        }

        var curSeg = segments[segId],
            coors = curSeg.getDetailedCoorsLngLat(),
            ptNum = curSeg.getDetailedPointsCount(),
            dLon1, dLat1, dLon2, dLat2, start;

        if (ptId == ptNum - 1) {
            if (segId == segments.length - 1) {
                // 最后一段一个点，和前一点组合求方向
                start = 2 * (ptId - 1);
                dLon1 = coors[start];
                dLat1 = coors[start + 1];
                dLon2 = coors[start + 2];
                dLat2 = coors[start + 3];
            }
            else {
                // 前几段最后一个点，结合下一段首点求方向
                dLon1 = coors[2 * ptId];
                dLat1 = coors[2 * ptId + 1];
                var nextSeg = segments[segId + 1];
                var nextCoors = nextSeg.getDetailedCoorsLngLat();
                dLon2 = nextCoors[0];
                dLat2 = nextCoors[1];
                // 如前后段衔接紧密，再朝后取一个点
                if(GetMapDistInMeter(dLon1, dLat1, dLon2, dLat2) < 3){
                    // 每个导航段至少含有两个点的经纬坐标
                    dLon2 = nextCoors[2];
                    dLat2 = nextCoors[3];
                }

            }
        }
        else {
            // 非本段最后一个点，和下一点配合求角度
            start = 2 * ptId;
            dLon1 = coors[start];
            dLat1 = coors[start + 1];
            dLon2 = coors[start + 2];
            dLat2 = coors[start + 3];
        }

        return CalcGeoAngleInDegree(dLon1, dLat1, dLon2, dLat2);
    },


    /**
     * 更新车位，并获得路径与gps的最短距离
     * @param gpsLon 当前gps经度
     * @param gpsLat 当前gps纬度
     * @return {Number} 路径与gps的最短距离
     * @private
     */
    _updateCarLoc_:function (gpsLon, gpsLat) {

        var arrSeg = this.segments,
            minDistance = 10000;

        if (arrSeg == null || this.m_CurSegID >= arrSeg.length) {
            return minDistance;
        }

        var nOldDistance = 0, //上一次计算的距离
            nLongerCount = 0, //远离的次数
            minSegmentNo = 0,
            minPointNo = 0,
            minDistX = this.m_NaviLon,
            minDistY = this.m_NaviLat,
            newPos = this.m_Percent,
            startSegId = this.m_CurSegID,
            startPtId = this.m_CurPtID;
        //首先判断当前位置和导航路径之间的相互关系
        //先从最简单的情况判断,假设GPS点始终在导航线路附近,并一直是顺着导航道路方向行驶,
        //通过GPS点向导航线路做垂线,来确定当前位置

        if (startPtId == 0 && startSegId > 0) {
            startSegId--;
            startPtId = arrSeg[startSegId].getDetailedPointsCount() - 2;
        }
        else if(startPtId > 0){
            startPtId --;
            //if(startPtId > 0) startPtId--;
        }

        while (true) {
            var seg = arrSeg[startSegId],
                coor = seg.getDetailedCoorsLngLat(),
                length = seg.getDetailedPointsCount(),
                end = length - 1;
            var nextSeg, nextCoor;
            if(startSegId < arrSeg.length-1){
                nextSeg = arrSeg[startSegId+1];
                nextCoor = nextSeg.getDetailedCoorsLngLat();
                end = length;
            }

            for (var i = startPtId; i < end; i++) {

                var j = i * 2,
                    x1, x2, y1, y2;
                if (i < length - 1) {
                    x1 = coor[j];
                    y1 = coor[j + 1];
                    x2 = coor[j + 2];
                    y2 = coor[j + 3];
                }
                else {
                    x1 = coor[j];
                    y1 = coor[j + 1];
                    x2 = nextCoor[0];
                    y2 = nextCoor[1];
                }

                var res = FindNearPt(x1, y1, x2, y2, gpsLon, gpsLat), // 计算点到线的投影点
                    ptBx = res[0],
                    ptBy = res[1],
                    percentPos = res[2];

                // 计算当前点到投影点之间的Map距离
                var nDistance = GetMapDistInMeter(gpsLon, gpsLat, ptBx, ptBy);

                /*****************************************************************************
                 *在比较GPS点与每条几何道路的距离的时候,
                 *如果每一次的距离都比前一次的距离要近,则说明在逐步接近最匹配的位置

                 *如果每一次的距离都比前一次的距离要远,则说明在逐步远离最匹配的位置,
                 *如果连续三条道路都是远离的趋势,则可停止比较
                 *****************************************************************************/

                // 记录下当前最短距离的位置
                if (nDistance <= minDistance) {
                    minPointNo = i;
                    minSegmentNo = startSegId;
                    minDistance = nDistance;
                    minDistX = ptBx;
                    minDistY = ptBy;
                    newPos = percentPos;
                }

                //判断前后两段距离的远近
                if (nOldDistance < nDistance) {
                    nLongerCount++;
                    //如果连续三条道路都是远离的趋势,则可停止比较
                    if (nLongerCount == 3) {
                            break;
                    }
                } else {
                    nLongerCount = 0;
                }

                nOldDistance = nDistance;

            }

            if (nLongerCount >= 3) //如果连续三条道路都是远离的趋势,则可停止比较
            {
                break;
            }

            startSegId++;
            startPtId = 0;
            if (startSegId == arrSeg.length) {
                break;
            }
        }

        this.m_MatchLon = minDistX;
        this.m_MatchLat = minDistY;

        if (this.m_CurSegID > minSegmentNo) {
            // 如果发现倒退不做更新
        } else if (this.m_CurSegID == minSegmentNo
            && (this.m_CurPtID > minPointNo || (this.m_CurPtID == minPointNo && this.m_Percent > newPos))) {
            // 防止两个形状点间的倒退
        } else {
            this.m_CurSegID = minSegmentNo;
            this.m_CurPtID = minPointNo;
            this.m_NaviLon = minDistX;
            this.m_NaviLat = minDistY;
            this.m_Percent = newPos;
        }

        return minDistance;
    },

    /**
     * 重置参数
     * @private
     */
    _resetVP_:function () {
        this.m_nOffCount = 0;
        this.m_bReroute = false;
        this.m_CurSegID = 0;
        this.m_CurPtID = 0;
        this.m_Percent = 0;
        this.m_CurLinkID = 0;
    },

    /**
     * 重置车位信息
     * @param gpsInfo
     * @private
     */
    _setCarLoc_:function (gpsInfo) {

        this.m_carLoc.nAngle = gpsInfo.track;
        this.m_carLoc.nSpeed = Math.round(gpsInfo.speed);
        this.m_carLoc.dLon = gpsInfo.lon;         // 置为GPS位置，不一定在路径上
        this.m_carLoc.dLat = gpsInfo.lat;

        // 置初值
        this.m_carLoc.nValid = 0;
//        this.m_carLoc.nSegId = 0;
//        this.m_carLoc.nPtId = 0;
//        this.m_carLoc.eState = MRoute.VPStatus.VPStatus_Unreliable;
//        this.m_carLoc.eRoadClass = MRoute.RoadClass.RoadClass_Count;
//        this.m_carLoc.eFormWay = MRoute.Formway.Formay_Count;
    },

    GetGpsList:function (num) {
        return this.m_container.getRecentPt(num);
    },

    GetGpsListWithAngle:function(num){
        return this.m_container.getPtListWithAngle(num);
    },

    GetVPLocation:function () {
        return this.m_carLoc.Clone();
    }
});
MRoute.CameraBuffer = Class({
	/// <summary>
	///  电子眼列表
	/// </summary>
	m_astItemList : [],
    CAMERA_BUFFER_SIZE:4,

	/// <summary>
	/// Buffer的开始下标
	/// </summary>
	m_dwStartIndex:0,
	/// <summary>
	///  Buffer中最后一个电子眼的导航段号
	/// </summary>
	m_dwEndSegNo:0,
	/// <summary>
	/// Buffer中最后一个电子眼所在的导航段中的编号
	/// </summary>
	m_dwEndLinkNo:0,
	/// <summary>
	/// 上次播放电子眼导航段剩余距离
	/// </summary>
	m_dwLastPlayRemainDist:Number.MAX_VALUE,
	/// <summary>
	/// 是否路径中最后一个电子眼已在Buffer中
	/// </summary>
	m_bAllInBuffer : false,//整条导航路径上的电子眼已经被查找过
    m_dwTotal:0,//当前buffer里面有效的电子眼数
		
	"initialize":function(){
		for(var i = 0; i< this.CAMERA_BUFFER_SIZE ;i++){
            var camera = new MRoute.CameraItem();
            this.m_astItemList.push(camera);
        }

	},
	Clear:function(){
        this.m_dwTotal = 0;
		this.m_dwStartIndex = 0;
		this.m_dwEndSegNo = 0;
		this.m_dwEndLinkNo = 0;
		this.m_dwLastPlayRemainDist = Number.MAX_VALUE;
		this.m_bAllInBuffer = false;

        for(var i = 0; i < this.CAMERA_BUFFER_SIZE ;i++){
            this.m_astItemList[i].clear();
        }
	}
});

MRoute.CameraItem = Class({
	/// <summary>
	/// 电子眼所在的导航段号
	/// </summary>
	m_dwSegeNo:0,		 
	/// <summary>
	/// 电子眼距离所在导航终点的距离
	/// </summary>
	m_dwDistance:0,		 
	/// <summary>
	/// 电子眼类型
	/// </summary>
	m_eCameraType:0,
	///// <summary>
	///// 电子眼的位置
	///// </summary>
	//m_stLocation:null,
	/// <summary>
	/// 电子眼播放状态
	/// </summary>
	m_ePlayed:0,//0,未播，1，已播
    m_nSpeed:0,
		
	"initialize":function(){
	},

    clear:function(){
        this.m_dwSegeNo = 0;
        this.m_dwDistance = 0;
        this.m_eCameraType = 0;
        this.m_ePlayed = 0;
        this.m_nSpeed = 0;

//        if(this.m_stLocation!= null){
//            this.m_stLocation.x = 0;
//            this.m_stLocation.y = 0;
//        }
    }


});

MRoute.DGNaviInfor = Class({

	eNaviType:0,            // 当前导航类型，1为模拟导航，2为GPS导航
    eTurnIcon:0,            // 转向图标
	curRoadName:"",         // 当前道路名称
	nextRoadName:"",        // 下条道路名称
	nSAPADist:-1,           // 距离最近服务区的距离，, 单位米，若为-1则说明距离无效，没有服务区
	nCameraDist:-1,         // 距离最近电子眼距离，, 单位米，若为-1则说明距离无效，没有电子眼
    nLimitedSpeed:0,        // 当前道路速度限制，单位公里/小时
	nRouteRemainDist:0,     // 路径剩余距离, 单位米
	nRouteRemainTime:0,     // 路径剩余时间，单位分钟
	nSegRemainDist:0,       // 当前导航段剩余距离, 单位米
	nSegRemainTime:0,       // 当前导航段剩余时间，单位分钟
	nCarDirection:0,        // 自车方向，0 - 360度
    fLongitude:0,           // 自车经度位置，浮点型
    fLatitude:0,            // 自车纬度位置，浮点型
	nCurSegIndex:0,         // 当前自车所在导航段编号
    nCurLinkIndex:0,        // 当前自车所在Link编号
    nCurPtIndex:0,          // 当前自车距离最近的形状点位编号
		
	"initialize":function(){
		
	},
	
	Clear:function(){
		this.curRoadName = null;
		this.nextRoadName = null;
        this.fLongitude = 0;
        this.fLatitude = 0;
		this.eNaviType = MRoute.NaviType.NaviType_NULL;
        this.eTurnIcon = MRoute.DirIcon.DirIcon_NULL;
		this.nLimitedSpeed = MRoute.LimitedSpeed.LimitedSpeed_NULL;
		this.nSAPADist = -1;
        this.nCameraDist = -1;
		this.nRouteRemainDist = 0;
		this.nRouteRemainTime = 0;
		this.nSegRemainDist = 0;
		this.nSegRemainTime = 0;
		this.nCarDirection = 0;
        this.nCurSegIndex = 0;
        this.nCurLinkIndex = 0;
        this.nCurPtIndex = 0;
	},

    getInfo:function(){
        var info = new Object();
        info["curRoadName"] = this.curRoadName;
        info["nextRoadName"] = this.nextRoadName;
        info["fLongitude"] = this.fLongitude;
        info["fLatitude"] = this.fLatitude;
        info["eNaviType"] = this.eNaviType;
        info["eTurnIcon"] = this.eTurnIcon;
        info["nLimitedSpeed"] = this.nLimitedSpeed;
        info["nSAPADist"] = this.nSAPADist;
        info["nCameraDist"] = this.nCameraDist;
        info["nRouteRemainDist"] = this.nRouteRemainDist;
        info["nRouteRemainTime"] = this.nRouteRemainTime;
        info["nSegRemainDist"] = this.nSegRemainDist;
        info["nSegRemainTime"] = this.nSegRemainTime;
        info["nCarDirection"] = this.nCarDirection;
        info["nCurSegIndex"] = this.nCurSegIndex;
        info["nCurLinkIndex"] = this.nCurLinkIndex;
        info["nCurPtIndex"] = this.nCurPtIndex;
        return info;
    }
});

MRoute.DGUtil = {

	/// <summary>
	/// 根据 基本动作和辅助动作来获取图片信息
	/// </summary>
	/// <param name="p"></param>
	/// <param name="p_2"></param>
	/// <returns></returns>
	GetNaviIcon:function(eMainAction, eAssiAction){
		var AssistantAction = MRoute.AssistantAction,
		DirIcon = MRoute.DirIcon,
		icon = null;
		switch (eAssiAction){
			case AssistantAction.AssiAction_Entry_Tunnel:
				icon = DirIcon.DirIcon_Tunnel;break;
			case AssistantAction.AssiAction_Arrive_Service_Area:
				icon = DirIcon.DirIcon_SAPA;break;
			case AssistantAction.AssiAction_Arrive_TollGate:
				icon = DirIcon.DirIcon_TollGate;break;
			case AssistantAction.AssiAction_Arrive_Way:
				icon = DirIcon.DirIcon_Way;break;
			case AssistantAction.AssiAction_Arrive_Destination:
				icon = DirIcon.DirIcon_Destination;break;
		}
		if(icon!=null){
			return icon;
		}
		var MainAction = MRoute.MainAction;
		switch(eMainAction){
			case MainAction.MainAction_Turn_Left:
				icon = DirIcon.DirIcon_Turn_Left;break;
			case MainAction.MainAction_Turn_Right:
				icon = DirIcon.DirIcon_Turn_Right;break;
			case MainAction.MainAction_Slight_Left:
			case MainAction.MainAction_Merge_Left:
				icon = DirIcon.DirIcon_Slight_Left;break;
			case MainAction.MainAction_Slight_Right:
			case MainAction.MainAction_Merge_Right:
				icon = DirIcon.DirIcon_Slight_Right;break;
			case MainAction.MainAction_Turn_Hard_Left:
				icon = DirIcon.DirIcon_Turn_Hard_Left;break;
			case MainAction.MainAction_Turn_Hard_Right:
				icon = DirIcon.DirIcon_Turn_Hard_Right;break;
			case MainAction.MainAction_UTurn:
				icon = DirIcon.DirIcon_UTurn;break;
			case MainAction.MainAction_Continue:
				icon = DirIcon.DirIcon_Continue;break;
			case MainAction.MainAction_Entry_Ring:
				icon = DirIcon.DirIcon_Entry_Ring;break;
			case MainAction.MainAction_Leave_Ring:
				icon = DirIcon.DirIcon_Leave_Ring;break;
			default:
				icon = DirIcon.DirIcon_Continue;break;
		}
		return icon;
	},

	GetLimitedSpeed:function(formWay, roadClass){
		var  m_nLimitedSpeed,
		LimitedSpeed = MRoute.LimitedSpeed;
		if (1 == formWay){ // 主路
			switch (roadClass){
				case 0: // 高速道路
					m_nLimitedSpeed = LimitedSpeed.LimitedSpeed_120;
					break;
				case 1: // 国道
					m_nLimitedSpeed = LimitedSpeed.LimitedSpeed_110;
					break;
				case 2: // 省道
					m_nLimitedSpeed = LimitedSpeed.LimitedSpeed_90;
					break;
				case 6: // 城市快速路
					m_nLimitedSpeed = LimitedSpeed.LimitedSpeed_100;
					break;
				case 7: // 主要道路
					m_nLimitedSpeed = LimitedSpeed.LimitedSpeed_80;
					break;
				default:
					m_nLimitedSpeed = LimitedSpeed.LimitedSpeed_NULL;
					break;
			}
		}else{ /// 非主路
			switch (roadClass)
			{
				case 0: // 高速道路
					m_nLimitedSpeed = LimitedSpeed.LimitedSpeed_80;
					break;
				case 1: // 国道
					m_nLimitedSpeed = LimitedSpeed.LimitedSpeed_70;
					break;
				case 2: // 省道
					m_nLimitedSpeed = LimitedSpeed.LimitedSpeed_50;
					break;
				case 6: // 城市快速路
					m_nLimitedSpeed = LimitedSpeed.LimitedSpeed_60;
					break;
				case 7: // 主要道路
					m_nLimitedSpeed = LimitedSpeed.LimitedSpeed_50;
					break;
				default:
					m_nLimitedSpeed = LimitedSpeed.LimitedSpeed_NULL;
					break;
			}
		}
		return m_nLimitedSpeed;
	},
	GetIndexVoiceText:function(index){
		var txt = "",OGGSound = MRoute.OGGSound;
		switch (index){
			case OGGSound.OGG_Distance_Kilometre_120:
				txt = "一百二十公里";break;
			case OGGSound.OGG_Distance_Kilometre_110:
				txt = "一百一十公里";break;
			case OGGSound.OGG_Distance_Kilometre_100:
				txt = "一百公里";break;
			case OGGSound.OGG_Distance_Kilometre_90:
				txt = "九十公里";break;
			case OGGSound.OGG_Distance_Kilometre_80:
				txt = "八十公里";break;
			case OGGSound.OGG_Distance_Kilometre_70:
				txt = "七十公里";break;
			case OGGSound.OGG_Distance_Kilometre_60:
				txt = "六十公里";break;
			case OGGSound.OGG_Distance_Kilometre_50:
				txt = "五十公里";break;
			case OGGSound.OGG_Distance_Kilometre_40:
				txt = "四十公里";break;
			case OGGSound.OGG_Distance_Kilometre_30:
				txt = "三十公里";break;
			case OGGSound.OGG_Distance_Kilometre_4:
				txt = "四公里";break;
			case OGGSound.OGG_Distance_Kilometre_3:
				txt = "三公里";break;
			case OGGSound.OGG_Distance_Kilometre_2:
				txt = "两公里";break;
			case OGGSound.OGG_Distance_Kilometre_1:
				txt = "一公里";break;
			case OGGSound.OGG_Distance_Meter_900:
				txt = "九百米";break;
			case OGGSound.OGG_Distance_Meter_800:
				txt = "八百米";break;
			case OGGSound.OGG_Distance_Meter_700:
				txt = "七百米";break;
			case OGGSound.OGG_Distance_Meter_600:
				txt = "六百米";break;
			case OGGSound.OGG_Distance_Meter_500:
				txt = "五百米";break;
			case OGGSound.OGG_Distance_Meter_400:
				txt = "四百米";break;
			case OGGSound.OGG_Distance_Meter_300:
				txt = "三百米";break;
			case OGGSound.OGG_Distance_Meter_200:
				txt = "两百米";break;
			case OGGSound.OGG_Distance_Meter_100:
				txt = "一百米";break;
			case OGGSound.OGG_Along_Kilometre_35:
				txt = "前方有三十五公里以上顺行道路";break;
			case OGGSound.OGG_Along_Kilometre_15:
				txt = "前方有十五公里以上顺行道路";break;
			case OGGSound.OGG_Along_Kilometre_5:
				txt = "前方有五公里以上顺行道路";break;
			case OGGSound.OGG_Along_All:
				txt = "请顺道路行驶，直到有新的导航提示";break;
			case OGGSound.OGG_Pass_SAPA:
				txt = "前方2公里有服务区，请适当休息";break;
			case OGGSound.OGG_MainAction_Turn_Left:
				txt = "左转";break;
			case OGGSound.OGG_MainAction_Turn_Right://201
				txt = "右转";break;
			case OGGSound.OGG_MainAction_Left_Ahead:
				txt = "向左前方行驶";break;
			case OGGSound.OGG_MainAction_Right_Ahead:
				txt = "向右前方行驶";break;
			case OGGSound.OGG_MainAction_Left_Back:
				txt = "向左后方行驶";break;
			case OGGSound.OGG_MainAction_Right_Back:
				txt = "向右后方行驶";break;
			case OGGSound.OGG_MainAction_UTurn:
				txt = "左转掉头";break;
			case OGGSound.OGG_MainAction_Continue:
				txt = "直行";break;
			case OGGSound.OGG_MainAction_Merge_Left:
				txt = "靠左行驶";break;
			case OGGSound.OGG_MainAction_Merge_Right:
				txt = "靠右行驶";break;
			case OGGSound.OGG_MainAction_Pass_Ring:
				txt = "经过环岛";break;
			case OGGSound.OGG_MainAction_Exit_Ring:
				txt = "驶出环岛";break;
			case OGGSound.OGG_MainAction_Slow:
				txt = "注意减速";break;
			case OGGSound.OGG_MainAction_Along_Road:
				txt = "沿当前道路行驶";break;
			case OGGSound.OGG_MainAction_Entry_Ring:
				txt = "进入环岛";break;
			case OGGSound.OGG_MainAction_FP_Exit_Ring:
				txt = "前方请驶出环岛";break;
			case OGGSound.OGG_MainAction_Pass_Ring_Go:
				txt = "经过环岛走";break;
			case OGGSound.OGG_MainAction_Slight_Left:
				txt = "偏左转";break;
			case OGGSound.OGG_MainAction_Slight_Right:
				txt = "偏右转";break;
			case OGGSound.OGG_MainAction_Turn_Hard_Left:
				txt = "左后转";break;
			case OGGSound.OGG_MainAction_Turn_Hard_Right:
				txt = "右后转";break;
			case OGGSound.OGG_AssiAction_Entry_Main:
				txt = "进入主路";break;
			case OGGSound.OGG_AssiAction_Entry_Side_Road:
				txt = "进入辅路";break;
			case OGGSound.OGG_AssiAction_Entry_Freeway:
				txt = "进入高速路";break;
			case OGGSound.OGG_AssiAction_Entry_Slip:
				txt = "进入匝道";break;
			case OGGSound.OGG_AssiAction_Entry_Tunnel:
				txt = "进入隧道";break;
			case OGGSound.OGG_AssiAction_Entry_Center_Branch:
				txt = "进入中间岔路";break;
			case OGGSound.OGG_AssiAction_Entry_Right_Branch:
				txt = "进入右岔路";break;
			case OGGSound.OGG_AssiAction_Entry_Left_Branch:
				txt = "进入左岔路";break;
			case OGGSound.OGG_AssiAction_Entry_Right_Road:
				txt = "进入右转专用道";break;
			case OGGSound.OGG_AssiAction_Entry_Left_Road:
				txt = "进入左转专用道";break;
			case OGGSound.OGG_AssiAction_Entry_Center_Side_Road:
				txt = "进入中间道路";break;
			case OGGSound.OGG_AssiAction_Entry_Right_Side_Road:
				txt = "进入右侧道路";break;
			case OGGSound.OGG_AssiAction_Entry_Left_Side_Road:
				txt = "进入左侧道路";break;
			case OGGSound.OGG_AssiAction_Along_Side:
				txt = "沿辅路行驶";break;
			case OGGSound.OGG_AssiAction_Along_Main:
				txt = "沿主路行驶";break;
			case OGGSound.OGG_AssiAction_Along_Right_Road:
				txt = "沿右转专用道行驶";break;
			case OGGSound.OGG_AssiAction_Arrive_Exit:
				txt = "到达出口";break;
			case OGGSound.OGG_AssiAction_Arrive_Service_Area:
				txt = "到达服务区";break;
			case OGGSound.OGG_AssiAction_Arrive_TollGate:
				txt = "到达收费站";break;
			case OGGSound.OGG_AssiAction_Arrive_Way:
				txt = "到达途经点附近";break;
			case OGGSound.OGG_AssiAction_Arrive_Destination:
				txt = "到达目的地附近";break;
			case OGGSound.OGG_AssiAction_Arrive_Ferry:
				txt = "到达轮渡码头附近";break;
			case OGGSound.OGG_AssiAction_Arrive_Ferry_Stop_Sound:
				txt = "到达轮渡码头附近导航中断";break;
			case OGGSound.OGG_AssiAction_Front_Branck:
				txt = "前方路口";break;
			case OGGSound.OGG_AssiAction_Left_Branch_1:
				txt = "走左数第一岔路";break;
			case OGGSound.OGG_AssiAction_Left_Branch_2:
				txt = "走左数第二岔路";break;
			case OGGSound.OGG_AssiAction_Left_Branch_3:
				txt = "走左数第三岔路";break;
			case OGGSound.OGG_AssiAction_Left_Branch_4:
				txt = "走左数第四岔路";break;
			case OGGSound.OGG_AssiAction_Left_Branch_5:
				txt = "走左数第五岔路";break;
			case OGGSound.OGG_AssiAction_Right_Branch_1:
				txt = "走右数第一岔路";break;
			case OGGSound.OGG_AssiAction_Right_Branch_2:
				txt = "走右数第二岔路";break;
			case OGGSound.OGG_AssiAction_Right_Branch_3:
				txt = "走右数第三岔路";break;
			case OGGSound.OGG_AssiAction_Right_Branch_4:
				txt = "走右数第四岔路";break;
			case OGGSound.OGG_AssiAction_Right_Branch_5:
				txt = "走右数第五岔路";break;
			case OGGSound.OGG_AssiAction_Exit_1:
				txt = "第一出口";break;
			case OGGSound.OGG_AssiAction_Exit_2:
				txt = "第二出口";break;
			case OGGSound.OGG_AssiAction_Exit_3:
				txt = "第三出口";break;
			case OGGSound.OGG_AssiAction_Exit_4:
				txt = "第四出口";break;
			case OGGSound.OGG_AssiAction_Exit_5:
				txt = "第五出口";break;
			case OGGSound.OGG_AssiAction_Exit_6:
				txt = "第六出口";break;
			case OGGSound.OGG_AssiAction_Exit_7:
				txt = "第七出口";break;
			case OGGSound.OGG_AssiAction_G0_Exit_1:
				txt = "走第一出口";break;
			case OGGSound.OGG_AssiAction_G0_Exit_2:
				txt = "走第二出口";break;
			case OGGSound.OGG_AssiAction_G0_Exit_3:
				txt = "走第三出口";break;
			case OGGSound.OGG_AssiAction_G0_Exit_4:
				txt = "走第四出口";break;
			case OGGSound.OGG_AssiAction_G0_Exit_5:
				txt = "走第五出口";break;
			case OGGSound.OGG_AssiAction_G0_Exit_6:
				txt = "走第六出口";break;
			case OGGSound.OGG_AssiAction_G0_Exit_7:
				txt = "走第七出口";break;
			case OGGSound.OGG_AssiAction_Pass_Exit_1:
				txt = "经过第一出口";break;
			case OGGSound.OGG_AssiAction_Pass_Exit_2:
				txt = "经过第二出口";break;
			case OGGSound.OGG_AssiAction_Pass_Exit_3:
				txt = "经过第三出口";break;
			case OGGSound.OGG_AssiAction_Pass_Exit_4:
				txt = "经过第四出口";break;
			case OGGSound.OGG_AssiAction_Pass_Exit_5:
				txt = "经过第五出口";break;
			case OGGSound.OGG_AssiAction_Pass_Exit_6:
				txt = "经过第六出口";break;
			case OGGSound.OGG_AssiAction_Pass_Exit_7:
				txt = "经过第七出口";break;
			case OGGSound.OGG_AssiAction_Road_1:
				txt = "第一路口";break;
			case OGGSound.OGG_AssiAction_Road_2:
				txt = "第二路口";break;
			case OGGSound.OGG_AssiAction_Road_3:
				txt = "第三路口";break;
			case OGGSound.OGG_AssiAction_Road_4:
				txt = "第四路口";break;
			case OGGSound.OGG_AssiAction_Road_5:
				txt = "第五路口";break;
			case OGGSound.OGG_AssiAction_Road_6:
				txt = "第六路口";break;
			case OGGSound.OGG_AssiAction_Road_7:
				txt = "第七路口";break;
			case OGGSound.OGG_AssiAction_Road_8:
				txt = "第八路口";break;
			case OGGSound.OGG_AssiAction_Pass_Road_1:
				txt = "经过第一路口";break;
			case OGGSound.OGG_AssiAction_Pass_Road_2:
				txt = "经过第二路口";break;
			case OGGSound.OGG_AssiAction_Pass_Road_3:
				txt = "经过第三路口";break;
			case OGGSound.OGG_AssiAction_Pass_Road_4:
				txt = "经过第四路口";break;
			case OGGSound.OGG_AssiAction_Pass_Road_5:
				txt = "经过第五路口";break;
			case OGGSound.OGG_AssiAction_Pass_Road_6:
				txt = "经过第六路口";break;
			case OGGSound.OGG_AssiAction_Pass_Road_7:
				txt = "经过第七路口";break;
			case OGGSound.OGG_AssiAction_Pass_Road_8:
				txt = "经过第八路口";break;
			case OGGSound.OGG_Then:
				txt = "，随后";break;
			case OGGSound.OGG_Forword:
				txt = "前方";break;
			case OGGSound.OGG_Is:
				txt = "，是";break;
			case OGGSound.OGG_Target:
				txt = "方向";break;
			case OGGSound.OGG_Please_At:
				txt = "请在";break;
			case OGGSound.OGG_Pass:
				txt = "经过";break;
			case OGGSound.OGG_Please:
				txt = "请";break;
			case OGGSound.OGG_Drive_Carefully:
				txt = "，请谨慎驾驶";break;
			case OGGSound.OGG_Have_Continuous_Camera:
				txt = "有连续摄像";break;
			case OGGSound.OGG_Have_Speed_Camera:
				txt = "有测速摄像";break;
			case OGGSound.OGG_Have_Surveillance_Camera:
				txt = "有监控摄像";break;
			case OGGSound.OGG_POIType_Traffic_Accident:
				txt = "发生交通事故";break;
			case OGGSound.OGG_POIType_Serious_Traffic_Accident:
				txt = "发生严重交通事故";break;
			case OGGSound.OGG_POIType_Construct:
				txt = "占路施工";break;
			case OGGSound.OGG_POIType_Traffic_Control:
				txt = "交通管制";break;
			case OGGSound.OGG_POIType_Move_Low:
				txt = "行驶缓慢";break;
			case OGGSound.OGG_POIType_Move_Fast:
				txt = "行驶畅通";break;
			case OGGSound.OGG_POIType_Traffic_JAM:
				txt = "交通拥堵";break;
			case OGGSound.OGG_Navi_End:
				txt = "本次导航结束";break;
			case OGGSound.OGG_Reroute:
				txt = "重新计算路径";break;
			case OGGSound.OGG_Navi_Start:
				txt = "开始导航，";break;
			case OGGSound.OGG_Stop_Navi:
				txt = "结束导航";break;
			case OGGSound.OGG_Dong:
				txt = "咚";break;
			case OGGSound.OGG_GPS_OK:
				txt = "GPS信号正常";break;
			case OGGSound.OGG_Volum:
				txt = "这是当前音量";break;
			case OGGSound.OGG_Max_Volum:
				txt = "这是最大音量";break;
			case OGGSound.OGG_Power_Low:
				txt = "电力不足，请及时充电";break;
			case OGGSound.OGG_Receive_Destination:
				txt = "收到下发目的地";break;
			case OGGSound.OGG_Exceed_Speed_Limt:
				txt = "您已超速";break;
			case OGGSound.OGG_Current_Road_SPeed_Limt:
				txt = "当前道路限速";break;
			case OGGSound.OGG_Off_ROute:
				txt = "你已经偏离了预设路线";break;
			default:
				txt = "";break;
		}
		return txt;
	}
};

MRoute.NDG = Class({
    
    /// 判断导航段长短的阈值，决定了播报的策略（是否近接播报）
    PROXIMITY_DISTANCE:200,
    /// 判定抵达终点的距离门限
    WAY_ARRIVE_DIST:50,

    /// 高速、省道、国道对应的值
    cnActionDistTable:[
        [2000, 1000, 200 ],
        [ 1000, 500, 200 ],
        [ 99999999, 500, 200 ]//普通路的远中近距离播报
    ],
    cnForShowTable:[ 150, 100, 50 ],//实际中固定点播报的提前距离
    cnTwoVoiceDistance:[500, 200, 150],//两个导航声音的距离间隔，cn表示经验值，暂时不用
    cnCameraDistTable:[700, 500, 300],//电子眼显示的距离，根据不同的道路级别
    cnPassMinDistTable:[3000, 2000, 700],//许可过后音播报的导航段的最短剩余距离

    /// DG 触发 给界面的接口
    m_pstFrame:null,
    /// DG 触发 声音接口
    m_pstVoiceManager:null,//暂时没用到

    /// 要DG的道路
    naviPath:null,
    /// 要更新的导航信息
    naviInfor:null,

    // 起始车位，设定路径时给出
    startVPLocation:null,

    // 当前真实的车位，来自VP
    realVPLocation:null,

    // 当前使用的车位
    curVPLocation:null,

    /// 道路段的摄像头信息
    cameraBuffer:null,
    /// 道路段的服务区信息
    sapaBuffer:null,

    m_lastCrossSegId:-1,

    m_playToken:null,

    // 是否显示路口扩大图
    m_bCrossShowed:false,
    // 是否显示车道信息
    m_bLaneShowed:false,

    m_laneLinkId:0,     // 当前导航段下一个待显示车道信息的link段编号
    m_laneDistance:0,   // 对应link到 导航段末端路口的剩余距离

    /// 是否正在重播
    m_bManualPlay:false,
    /// 是否已开始导航
    m_bStartGPS:false,
    m_bStartEmul:false,

    /// 是否暂停导航
    m_bPauseGPS:false,
    m_bPauseEmul:false,

    /// 是否通知播报准备消息
    m_bNotifyPrepareVoice:false,//暂时无用
    /// 是否播报电子眼
    m_bPlayCamera:true,
    /// 播报准备时间
    m_iPrepareVoiceTime:2,//暂时无用
    /// 导航播报类型： 1简单，2详细（默认）
    m_eNaviPlayType:2,
    /// 模拟导航的速度
    m_iEmulatorSpeed:60,
    /// 旧导航号
    m_OldSegID:-1,
    /// 旧形状点号
    m_OldPtID:-1,
    /// 当前道路的FormWay
    m_eCurFormWay:0,//匝道，辅路
    /// 当前道路的道路级别号
    m_iCurGradNo:2,
    /// 当前道路的RoadClass
    m_eCurRoadClass:0,//与FormWay从不同属性角度描述道路
    /// 当前道路的LinkType
    m_eCurLinkType:0,

    // 模拟导航定时触发器
    emulatorTimer:null,

    "initialize":function (pstFrame, pstVoiceManager) {
        this.m_pstFrame = pstFrame;
        this.m_pstVoiceManager = pstVoiceManager;
        this.naviInfor = new MRoute.DGNaviInfor();
        this.cameraBuffer = new MRoute.CameraBuffer();
        this.sapaBuffer = new MRoute.SAPABuffer();
        this.m_playToken = new MRoute.PalyToken();
        this.InitDG();
    },
    
    /// 初始化导航的一些参数
    
    InitDG:function () {
        this.m_OldSegID = -1;
        this.m_OldPtID = -1;
        this.m_nArriveSegId = -1;

        this.m_bTargetPlayed = false;
        this.m_bNotifyPrepareVoice = false;

        this.m_eCurLinkType = 0;
        this.m_eCurFormWay = 0;
        this.m_eCurRoadClass = 0;
        this.m_iCurGradNo = 2;

        this.naviInfor.Clear();
        this.curVPLocation = null;

        this.m_eCurState_Far = 0;
        this.m_eCurState_Mid = 0;
        this.m_eCurState_Near = 0;
        this.m_eCurState_RealTime = 0;
        this.m_eStartSummaryPlayState = 0;
        this.m_eEndSummaryPlayState = 0;
        this.m_eAfterPass = 0;

        this.m_lastCrossSegId = -1;

    },

    
    /// 设置路径源
    /// <param name="naviPath">要导航的路径</param>
    /// <param name="iStartSeg">开始的路段</param>
    /// <param name="iStartPoint">在路段上的形状点</param>
    /// <param name="stStartLoc"></param>
    SetNaviRoute:function (naviPath, bStartHead, vpLocation) {
        this.naviPath = naviPath;

        this.realVPLocation = null;
        if(bStartHead){
            this.startVPLocation = this._getHeadLocation_();
        }
        else {
            this.startVPLocation = vpLocation.Clone();
        }

        this._initForRouteSuccess_(bStartHead);
    },

    _initForStartNavi_:function (bStartHead, vpLocation) {
        this.InitDG();

        this.cameraBuffer.Clear();
        this.sapaBuffer.Clear();

        var curSeg, iStartPoint;
        if (bStartHead) {
            iStartPoint = 0;
            curSeg = this.GetNaviSegment(0);
        }
        else {
            iStartPoint = vpLocation.nPtId;
            curSeg = this.GetNaviSegment(vpLocation.nSegId);
        }

        //初始化FormWay与RoadClass
        var linkId = curSeg.getLinkId(iStartPoint),
            curLink = curSeg.getLink(linkId);
        if (curLink != null) {
            this.m_eCurFormWay = curLink.getLinkForm();
            this.m_eCurLinkType = curLink.getLinkType();
        }

        this.m_eCurRoadClass = curSeg.calcRoadClass(linkId);
        this.m_iCurGradNo = this.FORMAT_GRADE(this.m_eCurRoadClass);

        if (!this._setStateToStartRoute_(bStartHead, vpLocation)) {//_setStateToStartRoute_始终返回true
            return false;
        }
    },

    _getHeadLocation_:function(){
        var vpLocation = new MRoute.VPLocation();
        var curseg = this.GetNaviSegment(0);
        if (curseg == null) {
            return false;
        }
        var clist = curseg.getDetailedCoorsLngLat();
        vpLocation.dLon = clist[0];
        vpLocation.dLat = clist[1];
        vpLocation.nSegId = 0;
        vpLocation.nPtId = 0;

        return vpLocation;
    },

    _setStateToStartRoute_:function (bStartHead, vpLocation) {

        this._hideInfo_();

        if (bStartHead) {
            this.curVPLocation = this._getHeadLocation_();
        }
        else {
            this.curVPLocation = vpLocation.Clone();
        }

        this._updateRemainDistAndTime_(this.curVPLocation.dLon, this.curVPLocation.dLat);

        //载入服务区信息
        this.loadSAPA();
        this.loadCamera();
        this._updateNaviInfo_(this.curVPLocation.dLon, this.curVPLocation.dLat);

        return true;
    },


    // need supply
    _initForRouteSuccess_:function (bStartHead) {
        var segs = this.naviPath.getSegments();
        if (segs == null || segs.length <= 0) {
            return false;
        }

        this.curVPLocation = this.startVPLocation;

        // omit 整理途径列表 途径点列表改由tbt维护

        // 初始导航需要发opening的提示，但自动ReRoute或切换道路后不提示opening
        if (this.m_pstFrame.GetRouteType() != MRoute.CalcRouteType.CalcRouteType_Reroute && bStartHead) {
            this.m_eStartSummaryPlayState = 0;
            if (this.getCurrentCarSpeed() <= 5)
            {
                this.playRouteReady();
            }
        }

        this.m_eCurState_Far = 0;//0 未播报
        this.m_eCurState_Mid = 0;
        this.m_eCurState_Near = 0;
        this.m_eCurState_RealTime = 0;
        this.m_eEndSummaryPlayState = 0;

        // 如有可播报信息则播报
        this.flushNaviSound();

        return true;
    },


    _updateDist_:function () {

        // 更新下一电子眼剩余距离
        var dist = -1;
        if (this.cameraBuffer.m_dwTotal > 0) {
            var id = this.cameraBuffer.m_dwStartIndex;
            dist = this.naviInfor.nRouteRemainDist - this.cameraBuffer.m_astItemList[id].m_dwDistance;
        }
        this.naviInfor.nCameraDist = dist;//下一电子眼剩余距离

        // 更新下一服务区剩余距离
        dist = -1;
        if (this.sapaBuffer.m_dwTotal > 0) {
            var curID = this.sapaBuffer.m_dwStartIndex;
            dist = this.naviInfor.nRouteRemainDist - this.sapaBuffer.m_astItemList[curID].m_dwDistance;
        }
        this.naviInfor.nSAPADist = dist;
    },


    
    /// 当VP变更时TBT调用该方法, 接口函数
    /// <param name="stLocation"></param>
    CarLocationChange:function (stLocation) {
        if (stLocation == null) {
            return;
        }

        // 记录位置
        this.realVPLocation = stLocation.Clone();

        // 暂停导航时，不做更新
        if (this.m_bPauseGPS) {
            return;
        }

        // 更新导航信息
        if (this.m_bStartGPS) {
            this.curVPLocation = this.realVPLocation;
            this.NaviProc(this.curVPLocation);
        }
    },

    _updateCarLoc_:function(stLocation){
        this._updateRemainDistAndTime_(stLocation.dLon, stLocation.dLat);

         // 更新naviinfo
        this._updateNaviInfo_(stLocation.dLon, stLocation.dLat);
    },

    NaviProc:function (stLocation) {

        //if (MRoute.VPStatus.VPStatus_OnRoute == stLocation.eState)
        {//在路上

            this._updateRemainDistAndTime_(stLocation.dLon, stLocation.dLat);
            // 通知自车位置发生变化
            this._notifyLocChange_(stLocation.nSegId, stLocation.nPtId);

            // 更新naviinfo
            this._updateNaviInfo_(stLocation.dLon, stLocation.dLat);

            if (0 == this.m_eStartSummaryPlayState)//未播报
            {
                if (this.m_pstVoiceManager.GetRemainTime() > 0){// 未播报完成
                    return true;
                }
                this.playStartSummary();
                this.m_eStartSummaryPlayState = 1;
            }


            //更新导航 //调用声音播放信息
            this.updateNavigation();

            // GPS导航时途经点抵达判定
            if (this.IsGPSNaving()) {
                this.judgeArrive();
            }

            // 设定重播，也是等待下一次位置更新后播报，是否有可能连播两次？
            // 等待车位更新后才能播报，会导致在没有有效gps的地方无法重播
            if (this.m_bManualPlay) {
                if (!this.m_bPlayed) {
                    this.playCurrent();
                    this.flushNaviSound();
                }
                this.m_bManualPlay = false;
            }
        }
    },

    /**
     * 设置模拟导航速度
     */
    setEmulatorSpeed:function (iEmulatorSpeed) {
        this.m_iEmulatorSpeed = iEmulatorSpeed;
    },

    /**
     * 是否播报电子眼
     */
    setEleyePrompt:function (bval) {
        this.m_bPlayCamera = bval;
    },

    setPrepareVoiceTime:function (val) {
        this.m_iPrepareVoiceTime = val;
    },

    setNaviPlayType:function (val) {
        this.m_eNaviPlayType = val;
    },

    /**
     * 通知调用者TBT抵达途径点
     */
    m_nArriveSegId:-1,
    m_bArriveNotifyed:false,
    judgeArrive:function () {
        var curSegId = this.naviInfor.nCurSegIndex;
        var curSeg = this.GetNaviSegment(curSegId);
        if (curSeg == null) {
            return;
        }

        // 已经路过而没有通知，补发通知
        if (this.m_nArriveSegId >= 0 && this.m_nArriveSegId < curSegId
            && !this.m_bArriveNotifyed) {
            this.m_pstFrame.ArriveWay(this.m_nArriveSegId);
            this.m_bArriveNotifyed = true;
        }

        // 当前到达途径点分段
        var action = curSeg.getAssistAction();
        if (action == MRoute.AssistantAction.AssiAction_Arrive_Way) {
            // 记录途径段编号，置为未通知状态
            if (this.m_nArriveSegId < curSegId) {
                this.m_nArriveSegId = curSegId;
                this.m_bArriveNotifyed = false;
            }

            // 剩余距离不多，发送通知，置为已通知状态
            // 虽然距离不靠谱，但太晚播报也不好，万一在途径点附近reroute...
            // 播报途径点挺准的，但未单列，否则播报加通知就ok了
            if (this.naviInfor.nSegRemainDist < this.WAY_ARRIVE_DIST && !this.m_bArriveNotifyed) {
                this.m_pstFrame.ArriveWay(curSegId);
                this.m_bArriveNotifyed = true;
            }
        }
    },

    _getRoadName_:function (stLocation) {
        //-----当前路段名称
        var curSegId = stLocation.nSegId,
            curSeg = this.GetNaviSegment(curSegId),
            linkId = curSeg.getLinkId(stLocation.nPtId),
            naviLink = curSeg.getLink(linkId),
            segments = this.naviPath.getSegments(),
            curName = naviLink.getLinkName(),
            nextName = "";

        if (curName == null || curName.length == 0 || curName == 0) {
            curName = "无名道路";
        }

        //----下一路段的名称
        if (curSegId == segments.length - 1 &&
            linkId >= curSeg.getLinkCount() - 2) { //最后一段
            nextName = "目的地";
        }
        else {
            // 显示较远部位的有名道路是否合理呢？
            // 查找本导航段的下一link路名
            nextName = curSeg.getNextRoadName(linkId);

            // 遍历之后的导航段确定名称
            if (nextName == null || nextName.length == 0) {
                for (var i = curSegId + 1; i < segments.length; i++) {
                    var seg = this.GetNaviSegment(i);
                    nextName = seg.getRoadName();
                    if (nextName != null && nextName.length > 0) {
                        break;
                    }
                }
            }

            // 仍未能获取有效名称
            if (nextName == null || nextName.length == 0  || nextName == 0) {
                nextName = "无名道路";
            }
        }

        this.naviInfor.curRoadName = curName;
        this.naviInfor.nextRoadName = nextName;

    },

    getRoadName:function (nSegId, nLinkId) {
        var curSeg = this.GetNaviSegment(nSegId);
        if (curSeg != null) {
            var curLink = curSeg.getLink(nLinkId);
            if (curLink != null) {
                return curLink.getLinkName();
            }
        }
        return null;
    },



    _notifyLocChange_:function (nSegId, nPtId) {

        if (-1 == this.m_OldSegID || nSegId > this.m_OldSegID) {
            this.segmentChange(nSegId, nPtId);
        }
        else if (nSegId == this.m_OldSegID) {
            if (nPtId != this.m_OldPtID) {
                this.shapePointChange(nPtId);
            }
        }

        // 分段，点位发生改变，需更新电子眼信息
        this.loadCamera();

        // 普通导航段数路口时机 1.未数过路口数 2. 范围小于等于中距离播报范围 3.中距离已经播报过
        if(this.m_nStartCountNum < 0
            && this.IsShortThanMiddle() && this.m_eCurState_Mid == 1)
        {
            this.countForkNum();
        }

        var curSeg = this.GetNaviSegment(nSegId);

        // 接近具有车道信息的link尾部时，显示车道信息
        // 注意该link比较短时，未抵达该link也开始显示
        if(!this.m_bLaneShowed && this.naviInfor.nSegRemainDist - this.m_laneDistance  <= 200 ){
            var laneLink = curSeg.getLink(this.m_laneLinkId);
            this.m_pstFrame.ShowLaneInfo(laneLink.getBackgroundLane(), laneLink.getForegroundLane());
            this.m_bLaneShowed = true;
        }

        var MinDist = 2000;
        if (this.naviInfor.nSegRemainDist < MinDist){
            var arrBack = [],
                arrFore = [],
                arrSegId = [],
                backInfo;
            if(this.m_lastCrossSegId < nSegId){
                backInfo = curSeg.getBackgroundImage();
                if(backInfo >= 0)
                {
                    arrBack.push(backInfo);
                    arrFore.push(curSeg.getForegroundImage());
                    arrSegId.push(nSegId);
                }

                this.m_lastCrossSegId = nSegId;
            }

            var dist = this.naviInfor.nSegRemainDist,
                id = nSegId+1,
                count = this.naviPath.getSegmentCount(),
                seg;
            while(id <= this.m_lastCrossSegId ){
                seg = this.GetNaviSegment(id);
                dist += seg.getDistance();
                id++;
            }

            while(id < count && dist < MinDist){
                seg = this.GetNaviSegment(id);
                var segDist = seg.getDistance();
                if(dist + segDist >= MinDist)
                {
                    break;
                }
                backInfo = seg.getBackgroundImage();
                if(backInfo >= 0)
                {
                    arrBack.push(backInfo);
                    arrFore.push(seg.getForegroundImage());
                    arrSegId.push(id);
                }

                this.m_lastCrossSegId = id;
                dist += segDist;
                id++;
            }

            if(arrBack.length > 0){
                this.m_pstFrame.CrossRequest(arrBack, arrFore, arrSegId);
            }
        }


        if(this.naviInfor.nSegRemainDist < 300 && !this.m_bCrossShowed){
            var backId = curSeg.getBackgroundImage(),
                foreId = curSeg.getForegroundImage();
            if(backId >= 0 && foreId >= 0){
                this.m_pstFrame.ShowCross(backId, foreId, this.naviInfor.nSegRemainDist);
                this.m_bCrossShowed = true;
            }
        }

    },



    IsShortThanMiddle:function(){
        var roadGrade = this.m_iCurGradNo;
        return this.naviInfor.nSegRemainDist
            <= (this.cnActionDistTable[roadGrade][1] + this.cnForShowTable[roadGrade]);
    },


    /**
     * 决定本段统一的信息播报标志位
     * @param eMainAction
     * @param eAssiAction
     * @private
     */
    _updatePlayToken_:function(eMainAction, eAssiAction){

        var stToken = this.m_playToken;
        stToken.m_bProximityToken = true;
        stToken.m_bTargetInfoToken = true;

        var curSegID = this.naviInfor.nCurSegIndex;
        if (curSegID >= this.naviPath.getSegmentCount() - 1) {
            stToken.m_bTargetInfoToken = false;
            stToken.m_bProximityToken = false;
            return;
        }

        if (eAssiAction == MRoute.AssistantAction.AssiAction_Arrive_Way
            || eAssiAction == MRoute.AssistantAction.AssiAction_Arrive_TollGate // 收费站
            ) {
            stToken.m_bTargetInfoToken = false;
            stToken.m_bProximityToken = false;
        }

        if (eAssiAction == MRoute.AssistantAction.AssiAction_Entry_Ferry
            || eAssiAction == MRoute.AssistantAction.AssiAction_Entry_Tunnel
            ) {
            stToken.m_bProximityToken = false;
        }

        if (eMainAction == MRoute.MainAction.MainAction_Entry_Ring) {
            stToken.m_bProximityToken = false;	// 进入环岛不播报近接提示
        }
    },



    _parseInfo_:function(info){
        var arrData = [], curLane;
        for(var i = 0; i < 8; i++){
            curLane = (info>>(4*i)) & 0xf;
            if( 15 == curLane ){
                break;
            }
            else if( 13 == curLane )
            {
                curLane = 0;
            }
            else if( 14 == curLane )
            {
                curLane = 11;
            }
            arrData[i] = curLane;
        }
        return arrData;
    },

    _isValidInfo_:function(backInfo, selectInfo){
        if( 0xffffffff == backInfo  || 0 >= backInfo || 0 >= selectInfo)
        {
            return false;
        }

        var arrBackInfo = this._parseInfo_(backInfo),
            arrSelInfo  = this._parseInfo_(selectInfo);
        if(arrBackInfo.length == 0 || arrSelInfo.length == 0){
            return false;
        }

        var firstSel = arrSelInfo[0];

        if(firstSel == 2 || firstSel == 4 || firstSel == 6 || firstSel == 7
            || firstSel == 9 || firstSel == 10 || firstSel == 11 || firstSel == 12 ){
            return false;  // 禁止原始选中状态为复杂车线
        }

        for(var k = 0; k < arrSelInfo.length; k++){
            if(firstSel != arrSelInfo[k]){
                return false; // 选择不同，出错返回
            }
        }

        return true;

    },

    /**
     * 更新车道信息，记录下一个要显示车道信息的link编号及其终点到导航段终点的距离
     * 将过滤无效车道信息的工作提前到DG中完成
     * @private
     */
    _updateLaneInfo_:function(){
        var curSeg = this.GetNaviSegment(this.curVPLocation.nSegId),
            linkCount = curSeg.getLinkCount(),
            startId = curSeg.getLinkId(this.curVPLocation.nPtId),
            tmpLink, back, select,
            bFind = false;
        for(var i = startId; i < linkCount; i++){
            tmpLink = curSeg.getLink(i);
            back = tmpLink.getBackgroundLane();
            select = tmpLink.getForegroundLane();
            if(this._isValidInfo_(back, select)) {
                this.m_laneLinkId = i;
                this.m_laneDistance = tmpLink.getDistToExit();
                bFind = true;
                break;
            }
        }

        if (!bFind){
            this.m_laneLinkId = linkCount - 1;
            this.m_laneDistance = -300;
        }
    },


    /// 导航段发生改变
    segmentChange:function (newSegId, newPtId) {

        this._hideInfo_();

        if (newSegId != 0) {
            this.m_eCurState_Far = 0;
            this.m_eCurState_Mid = 0;
            this.m_eCurState_Near = 0;
            this.m_eCurState_RealTime = 0;
            this.m_eAfterPass = 0;
        }

        this.m_laneLinkId = 0;
        this.m_laneDistance = 0;
        this._updateLaneInfo_();

        this.m_nStartCountNum = -1;
        this.m_nLastCountNum = -1;

        this.m_bTargetPlayed = false;
        this.m_OldSegID = newSegId;

        this.shapePointChange(newPtId); //触发形状点变化事件
        var curSeg = this.GetNaviSegment(newSegId),
            mainAction = curSeg.getBasicAction(),
            assistAction = curSeg.getAssistAction();

        if(mainAction == MRoute.MainAction.MainAction_Leave_Ring
            || this.m_eCurFormWay == MRoute.Formway.Formway_Round_Circle)
        {
            this.countForkNum();
        }

        // 更新本导航段是否播报某信息的统一标记
        this._updatePlayToken_(mainAction, assistAction);
        this.m_iCurGradNo = this._getRoadGrade_();


        if (2 == this.m_iCurGradNo) {
            this.m_eCurState_Far = 1;
        }
    },

    _getRoadGrade_:function(){

        var curSeg = this.GetNaviSegment(this.curVPLocation.nSegId),
            linkNum = curSeg.getLinkCount(),
            arrSum = [0,0,0],
            domainGrad = 2,
            tmpLink,eRoadClass, tmpGrade;
        for(var i = 0; i < linkNum; i++){
            tmpLink = curSeg.getLink(i);
            eRoadClass = tmpLink.getRoadClass();
            tmpGrade = this.FORMAT_GRADE(eRoadClass);
            arrSum[tmpGrade] += tmpLink.getDetailedPointsCount();
        }
        if(arrSum[1] > arrSum[domainGrad]) {
            domainGrad = 1;
        }
        if(arrSum[0] > arrSum[domainGrad]){
            domainGrad = 0;
        }

        return domainGrad;
    },

    
    ///  形状点发生改变
    shapePointChange:function (newPtId) {

        // m_eCurFormWay , m_eCurLinkType, m_eCurRoadClass, m_iCurGradNo计算
        var segID = this.curVPLocation.nSegId,
            curSeg = this.GetNaviSegment(segID),
            linkId = curSeg.getLinkId(newPtId),
            curLink = curSeg.getLink(linkId);
        this.m_eCurLinkType = curLink.getLinkType();

        if (this.m_bStartEmul) {
            this.m_eCurFormWay = curLink.getLinkForm();
            this.m_eCurRoadClass = curSeg.calcRoadClass(linkId);
        }
        else {
            this.m_eCurFormWay = this.curVPLocation.eFormWay;
            this.m_eCurRoadClass = this.curVPLocation.eRoadClass;
        }

        // 缺 sapabuff 更新信息
        this.collectSAPABuffer();
        if (!this.sapaBuffer.m_bCollectEnd && this.sapaBuffer.m_dwTotal == 0) {
            this.loadSAPA();
        }

        this.m_OldPtID = newPtId;

        if (linkId > this.m_laneLinkId) {
            if(this.m_bLaneShowed){
                this.m_pstFrame.HideLaneInfo();
                this.m_bLaneShowed = false;
            }
            this._updateLaneInfo_();
        }
    },

    FORMAT_GRADE:function (eRoadClass) {
        if (MRoute.RoadClass.RoadClass_Freeway == eRoadClass) {
            return 0;
        } else if (MRoute.RoadClass.RoadClass_City_Speed_way == eRoadClass) {
            return 1;
        } else {
            return 2;
        }
    },

    /**
     * 计算当前车的角度, 结合下一点求角度
     * @param segments
     * @param segId
     * @param ptId
     * @return {Number}
     * @private
     */
    _calCarAngle_:function (segments, segId, ptId) {

        if (segId >= segments.length) {
            segId = segments.length - 1;
        }

        var curSeg = segments[segId],
            coors = curSeg.getDetailedCoorsLngLat(),
            ptNum = curSeg.getDetailedPointsCount(),
            dLon1, dLat1, dLon2, dLat2, start;

        if (ptId == ptNum - 1) {
            if (segId == segments.length - 1) {
                // 最后一段一个点，和前一点组合求方向
                start = 2 * (ptId - 1);
                dLon1 = coors[start];
                dLat1 = coors[start + 1];
                dLon2 = coors[start + 2];
                dLat2 = coors[start + 3];
            }
            else {
                // 前几段最后一个点，结合下一段首点求方向
                dLon1 = coors[2 * ptId];
                dLat1 = coors[2 * ptId + 1];
                var nextSeg = segments[segId + 1];
                var nextCoors = nextSeg.getDetailedCoorsLngLat();
                dLon2 = nextCoors[0];
                dLat2 = nextCoors[1];
                // 如前后段衔接紧密，再朝后取一个点
                if(GetMapDistInMeter(dLon1, dLat1, dLon2, dLat2) < 3){
                    // 每个导航段至少含有两个点的经纬坐标
                    dLon2 = nextCoors[2];
                    dLat2 = nextCoors[3];
                }

            }
        }
        else {
            // 非本段最后一个点，和下一点配合求角度
            start = 2 * ptId;
            dLon1 = coors[start];
            dLat1 = coors[start + 1];
            dLon2 = coors[start + 2];
            dLat2 = coors[start + 3];
        }

        return CalcGeoAngleInDegree(dLon1, dLat1, dLon2, dLat2);
    },


    /// 获取指定的导航段
    /// <param name="nIndex"></param>
    /// <returns></returns>
    GetNaviSegment:function (nIndex) {
        return this.naviPath.getSegmentByID(nIndex);
    },


    PauseNavi:function (bSim) {
        // 当模拟导航处于开启状态， 只能暂停模拟导航
        if(this.m_bStartEmul)
        {
            if (bSim){
                this.m_bPauseEmul = true;
            }
        }
        else if(this.m_bStartGPS)
        {
            if(!bSim){
                this.m_bPauseGPS = true;
            }
        }
    },

    ResumeNavi:function (bSim) {
        if (this.m_bStartEmul)
        {
            if(bSim){
                this.m_bPauseEmul = false;
            }
        }
        else if(this.m_bStartGPS)
        {
            if(!bSim){
                this.m_bPauseGPS = false;
            }
        }
    },

    
    /// 开始模拟导航
    /// <returns></returns>
    StartNavi:function (IsGps) {
        // 启动之前必须设定好导航路径
        if (this.naviPath == null) {
            return false;
        }

        if (IsGps) {
            if(this.m_bStartGPS && !this.m_bPauseGPS){
                return true; //正在进行相应导航，则直接返回
            }

            this.m_bStartGPS = true;
            this.m_bPauseGPS = false;
            if (this.m_bStartEmul) {
                this.m_pstFrame.EndEmulatorNavi();
            }

        }
        else {

            if(this.m_bStartEmul && !this.m_bPauseEmul){
                return true; //正在进行相应导航，则直接返回
            }

            this.m_bStartEmul = true;
            this.m_bPauseEmul = false;
            if (this.m_bStartGPS) {
                this.m_bPauseGPS = true;
            }
        }

        var vpLocation = this.startVPLocation;
        if(this.realVPLocation != null){
            vpLocation = this.realVPLocation;
        }
        var bFromHead = true;
        if(vpLocation.nSegId != 0 || vpLocation.nPtId != 0){
            bFromHead = false;
        }
        this._initForStartNavi_(bFromHead, vpLocation);

        this.naviInfor.eNaviType = IsGps ?
            MRoute.NaviType.NaviType_GPS : MRoute.NaviType.NaviType_Emul;

        if (IsGps) {
            // 等待VP模块触发位置更新
        }
        else {
            if (this.emulatorTimer == null) {
                var self = this;
                this.emulatorTimer = window.setInterval(function () {
                    self.Timer_Tick();
                }, 500);
            }
        }
        return true;
    },


    Timer_Tick:function () {
        if (!this.m_bPauseEmul) {
            if (!this.EmulatorProc()) {
                // 通知frame，自发请求终止导航
                this.m_pstFrame.EndEmulatorNavi();
            }
        }
    },

    
    /// 停止模拟导航
    /// <returns></returns>
    StopEmulatorNavi:function () {

        if (!this.m_bStartEmul) { //如模拟导航未开始，退出
            return false;
        }

        this.m_bStartEmul = false;
        this.m_bPauseEmul = false;

        if (this.emulatorTimer) {
            window.clearInterval(this.emulatorTimer);
            this.emulatorTimer = null;
        }
        // 设为未播报状态
        this.InitDG();

        if(this.m_bStartGPS){ // 重新启动GPS导航
            this.m_bPauseGPS = false;

            if(this.realVPLocation != null){
                // 用匹配后的gps更新一次车位
                this.curVPLocation = this.realVPLocation;
                this._updateCarLoc_(this.curVPLocation);
            }
            else if(this.startVPLocation != null){
                this.curVPLocation = this.startVPLocation;
                this._updateCarLoc_(this.curVPLocation);
            }
        }

        this._hideInfo_();

        return true;
    },

    /// 停止GPS导航
    StopGPSNavi:function () {
        if (!this.m_bStartGPS) {
            return false;
        }

        if(this.m_bStartEmul){ // 如有模拟导航，请求终止模拟导航
            this.m_pstFrame.EndEmulatorNavi();
        }

        this.m_bStartGPS = false;
        this.m_bPauseGPS = false;
        this.realVPLocation = null;
        this._hideInfo_();
        // 设为未播报状态
        this.InitDG();
        return true;
    },

    _hideInfo_:function(){
        if(this.m_bCrossShowed){
            this.m_pstFrame.HideCross();
            this.m_bCrossShowed = false;
        }
        if(this.m_bLaneShowed){
            this.m_pstFrame.HideLaneInfo();
            this.m_bLaneShowed = false;
        }
    },

    INTERCEPT:function (ptStart, ptEnd, totalLen, cutLen) {
        if (cutLen < 0.00001) {
            return ptStart;
        }
        if (0 == totalLen || cutLen >= totalLen) {
            return ptEnd;
        }
        var dX = ptEnd.x - ptStart.x;
        var dY = ptEnd.y - ptStart.y;
        var longitude = Number(ptStart.x) + Number(dX * (cutLen / totalLen));
        var latitude = Number(ptStart.y) + Number(dY * (cutLen / totalLen));

        return new MRoute.NvPoint(longitude, latitude);
    },


    EmulatorProc:function () {

        //lock (vpCurrrentVPLocation){
        //如果不是模拟导航退出
        if (!this.m_bStartEmul ) {
            return false;
        }

        if (this.curVPLocation == null) {
            if(this.realVPLocation != null){
                this.curVPLocation = this.realVPLocation.Clone();
            }
            else{
                this.curVPLocation = this.startVPLocation.Clone();
            }
        }

        // 未播报模拟导航开始，则播报
        if (this.m_eStartSummaryPlayState == 0) {
            this.playStartSummary();
            this.m_eStartSummaryPlayState = 1;
        }


        var segCount = this.naviPath.getSegmentCount();
        var dwStepLength = Math.ceil(this.m_iEmulatorSpeed / 3.6),  //模拟导航步长
            newSegId = this.curVPLocation.nSegId,
            newPtId = this.curVPLocation.nPtId,
            curSeg  = this.GetNaviSegment(newSegId),
            ptList  = curSeg.getDetailedCoorsLngLat(),
            ptCount = curSeg.getDetailedPointsCount(),
            lastId  = ptCount - 1;

        // 符合模拟导航结束条件，则请求终止
        if (this.naviInfor.nRouteRemainDist <= 10
            || (this.curVPLocation.nSegId >= segCount - 1 && newPtId == lastId)) {
            this.m_pstFrame.EndEmulatorNavi();
            return true;
        }

        //计算当前自车位置到下一个形状点的距离

        var stStart, stEnd, newNvPt, nDistance, nextSeg;
        stStart = new MRoute.NvPoint(this.curVPLocation.dLon, this.curVPLocation.dLat);

        if (newPtId == lastId) {
            // 其实前面逻辑已保证非最后一个导航段
            if(newSegId < segCount -1){
                nextSeg = this.GetNaviSegment(newSegId + 1);
                stEnd = nextSeg.getDetailedPoint(0);
                nDistance = MRoute.GeoUtils.CalculateDistance(stStart.x, stStart.y, stEnd.x, stEnd.y);
                if (nDistance > dwStepLength) { //自车到下一形状点的距离比还需截取长度长，截取
                    newNvPt = this.INTERCEPT(stStart, stEnd, nDistance, dwStepLength);
                }
                else {   // 直接移到下一段起点
                    newPtId = 0;
                    newSegId += 1;
                    newNvPt = stEnd;
                }
            }
        }
        else {
            stEnd = new MRoute.NvPoint(ptList[2*(newPtId + 1)], ptList[2*(newPtId + 1) + 1]);
            nDistance = MRoute.GeoUtils.CalculateDistance(stStart.x, stStart.y, stEnd.x, stEnd.y);
            if (nDistance > dwStepLength) { //自车到下一形状点的距离比还需截取长度长，截取
                newNvPt = this.INTERCEPT(stStart, stEnd, nDistance, dwStepLength);
            }
            else {
                //自车到下一形状点的距离小于还需获取的距离，将自车移到下一形状点
                newNvPt = stEnd;
                newPtId = newPtId + 1;

                // 如果最后一个点和下一段起点距离太近，跳过本段最后一个点
                if(newPtId == lastId && newSegId < segCount -1){
                    nextSeg = this.GetNaviSegment(newSegId + 1);
                    var stFirst = nextSeg.getDetailedPoint(0);
                    nDistance = MRoute.GeoUtils.CalculateDistance(stEnd.x, stEnd.y, stFirst.x, stFirst.y);
                    if(nDistance < 3){
                        newPtId = 0;
                        newSegId +=1;
                        newNvPt = stFirst;
                    }
                }
            }
        }

        this.curVPLocation.dLon = newNvPt.getX();
        this.curVPLocation.dLat = newNvPt.getY();
        this.curVPLocation.nSegId = newSegId;
        this.curVPLocation.nPtId = newPtId;
        this.curVPLocation.nSpeed = this.m_iEmulatorSpeed; //km/h

        this.NaviProc(this.curVPLocation);
        //}
        return true;
    },

    m_nLinkRemainDist:0,

    _updateRemainDistAndTime_:function(x,y) {
        //------当前道路段剩余距离----全程剩余距离
        var nvpt = new MRoute.NvPoint(x, y),
            nSegId = this.curVPLocation.nSegId,
            nPtId = this.curVPLocation.nPtId,
            resArr = this.naviPath.getRemainDistAndTime(nSegId, nPtId, nvpt);
        this.naviInfor.nRouteRemainDist = Math.round(resArr[0]);
        this.naviInfor.nSegRemainDist = Math.round(resArr[1]);
        this.naviInfor.nRouteRemainTime = Math.round(resArr[2]);
        this.naviInfor.nSegRemainTime = Math.round(resArr[3]);

        var curSeg = this.GetNaviSegment(nSegId),
            linkId = curSeg.getLinkId(nPtId);
        this.m_nLinkRemainDist = curSeg.getRemainLinkDist(linkId, nPtId, nvpt);
    },

    _updateNaviInfo_:function (x, y) {

        var stLocation = this.curVPLocation,
            naviSeg = this.GetNaviSegment(stLocation.nSegId),
            linkId = naviSeg.getLinkId(stLocation.nPtId),
            naviLink = naviSeg.getLink(linkId);

        if (naviLink == null)
            return false;

        this._getRoadName_(stLocation);

        //-------路段限速
        this.naviInfor.nLimitedSpeed =
            MRoute.DGUtil.GetLimitedSpeed(naviLink.getLinkForm(), naviLink.getRoadClass());


        this.naviInfor.fLongitude = Number(x.toFixed(8));
        this.naviInfor.fLatitude = Number(y.toFixed(8));

        // 更新到最近的电子眼、服务区的距离
        this._updateDist_();

        // 获得转向图标
        this.naviInfor.eTurnIcon = MRoute.DGUtil.GetNaviIcon(naviSeg.getBasicAction(), naviSeg.getAssistAction());
        this.naviInfor.nCurSegIndex = stLocation.nSegId;
        this.naviInfor.nCurLinkIndex = linkId;
        this.naviInfor.nCurPtIndex = stLocation.nPtId;

        if (this.m_bStartEmul) {
            // 模拟导航时需要计算车位方向角
            var segments = this.naviPath.getSegments(),
                ptId = this.curVPLocation.nPtId,
                segId = this.curVPLocation.nSegId;
            this.naviInfor.nCarDirection = this._calCarAngle_(segments, segId, ptId);
            this.naviInfor.eNaviType = MRoute.NaviType.NaviType_Emul;

        }
        else {
            // gps导航时直接用vp算得结果
            this.naviInfor.nCarDirection = stLocation.nAngle;
            this.naviInfor.eNaviType = MRoute.NaviType.NaviType_GPS;
        }

        this.m_pstFrame.UpdateNaviInfor(this.naviInfor, this.m_nLinkRemainDist);//调用更新界面信息
        return true;

    },

    m_bPlayed:false,

    
    /// 更新位置
    
    /// <returns></returns>
    updateNavigation:function () {
        this.notifyPrepareVoice();

        if (this.playRouteInfo()) {
            var validCharacterLen = this.m_wStrTTSBufer.split(",").length,currentTime = new Date().getTime();
            this.endTimeofTTS = currentTime + this.timePerCharacter * (this.m_wStrTTSBufer.length - validCharacterLen + 1);
        }
        else if (this.playCamera()) {
            console.log("will play camera info,this.endTimeofTTS"+ this.endTimeofTTS);
            var cut = new Date().getTime();
            if(cut < this.endTimeofTTS)
                this.m_wStrTTSBufer = "";
        }
        else if (this.playSAPA()) {

        }

        //当前是最后一个导航段且距离目的地小于50M播放结束导航概要提示
        var rDistRemain = this.naviInfor.nRouteRemainDist;
        var curSegID = this.curVPLocation.nSegId;
        if (rDistRemain < 50 && 0 == this.m_eEndSummaryPlayState && curSegID == this.naviPath.getSegmentCount() - 1) {
            this.playEndSummary(); //播报结束到行概要提示
            // this.naviInfor.eNaviType
            if (this.IsGPSNaving()) {
                this.m_pstFrame.ArriveWay(-1);
            }
        }

        // 防止当前有播报内容，而设置重播，播报两次
        this.m_bPlayed = this.m_wStrTTSBufer.length > 0;
        this.flushNaviSound();
        return true;
    },
    
    /// 后期补充
    /// <returns></returns>
    notifyPrepareVoice:function () {
        if (!this.m_bNotifyPrepareVoice && this.m_iPrepareVoiceTime > 0) {
            var len = this.getNextSoundLength();
            if (len > 0 && len < this.m_iPrepareVoiceTime * this.getCurrentCarSpeed()) {
                this.m_bNotifyPrepareVoice = true;
                this.m_pstFrame.PrepareVoice();
                return true;
            }
        }
        return false;
    },

    getNextSoundLength:function () {
        var curSeg = this.GetNaviSegment(this.curVPLocation.nSegId);
        var leftSegDist = this.naviInfor.nSegRemainDist;
        if ((0 == this.m_eCurState_Far || this.m_iCurGradNo == 2)
            && 0 == this.m_eCurState_Mid
            && 0 == this.m_eCurState_Near
            && 0 == this.m_eCurState_RealTime
            && this.curVPLocation.nSegId > 0) {
            var dist = curSeg.getDistance();
            if (dist > leftSegDist && dist - leftSegDist < 50) {
                return 50 - (dist - leftSegDist);
            }
            else {
                return 0;
            }
        }

        var len = 0;
        var cameraBuf = this.cameraBuffer;
        if(cameraBuf.m_dwTotal > 0)
        {
            var nGrad = this.m_iCurGradNo;
            var itemId = cameraBuf.m_dwStartIndex;
            var nextLen = leftSegDist - cameraBuf.m_astItemList[itemId].m_dwDistance;
            nextLen -= this.cnCameraDistTable[nGrad] + this.cnForShowTable[nGrad];
            if(nextLen < len)
            {
                len = nextLen;
            }
        }
        return (len < 0) ? 0 : len;

    },



    getGuideDescribe:function(path, segID)
    {
        var strDescribe = "";
        if(path == null)
        {
            return strDescribe;
        }

        var selSeg = path.getSegmentByID(segID),
            nextSeg = path.getSegmentByID(segID+1);

        if(selSeg != null) {
            var roadName = selSeg.getRoadName(),
                nextName = "",
                segLen = selSeg.getDistance(),
                eMainAction = selSeg.getBasicAction(),
                eAssiAction = selSeg.getAssistAction();

            if(nextSeg!= null){
                nextName = nextSeg.getRoadName();
            }

            if(nextName == null || nextName.length == 0) {
                nextName = "无名道路";
            }

            if(roadName == null || roadName.length == 0) {
                roadName = "无名道路";
            }

            // 1：路名
            strDescribe += "沿";
            strDescribe += roadName;

            // 2: 里程
            strDescribe += "行驶";
            strDescribe += this._getLengthDescribe_(segLen);

            // 3：动作 + 下一段名称
            if(segID+1 == path.getSegmentCount()){
                strDescribe += "，到达目的地附近";
            }
            else{
                strDescribe +="，";
                strDescribe += this._getActionDescribe_(eMainAction, eAssiAction);
                if(eAssiAction == MRoute.AssistantAction.AssiAction_NULL
                    && 0 != roadName.localeCompare(nextName)){
                    strDescribe += "进入";
                    strDescribe += nextName;
                }
            }

        }

        return strDescribe;
    },

    _customActionDescribe_:function(voiceID) {
        var OGGSound = MRoute.OGGSound, str = "";
        switch (voiceID)
        {
            case OGGSound.OGG_MainAction_Left_Ahead:
                str = "向左前方";break;
            case OGGSound.OGG_MainAction_Right_Ahead:
                str = "向右前方";break;
            case OGGSound.OGG_MainAction_Left_Back:
                str = "向左后方";break;
            case OGGSound.OGG_MainAction_Right_Back:
                str = "向右后方";break;
            case OGGSound.OGG_MainAction_Merge_Left:
                str = "靠左";break;
            case OGGSound.OGG_MainAction_Merge_Right:
                str = "靠右";break;
            default :
                str = MRoute.DGUtil.GetIndexVoiceText(voiceID);
        }

        return str;

    },

    _getActionDescribe_:function(eMAction, eAAction){
        var str ="",
            mActId = this.getMainActionVoiceID(eMAction),
            dw = this.getAssiActionVoiceID(eMAction, eAAction),
            dwIDNum = dw[0],
            adwIDList = dw[1];

        // 主动作描述
        if (eAAction == MRoute.AssistantAction.AssiAction_Along_Main
            || eAAction == MRoute.AssistantAction.AssiAction_Along_Road
            || eAAction == MRoute.AssistantAction.AssiAction_Along_Sild) {
            this.addSoundStr(this._customActionDescribe_(mActId));
        }
        else {
            str += MRoute.DGUtil.GetIndexVoiceText(mActId);
        }

        // 辅动作描述
        for (var i = 0; i < dwIDNum; i++) {
            if (adwIDList[i] > 0) {
                str += MRoute.DGUtil.GetIndexVoiceText(adwIDList[i]);
            }
        }
        return str;
    },

    getCurrentCarSpeed:function () {
        return this.m_pstFrame.GetCarSpeed();
    },

    
    /// 过后音播报
    
    /// <returns></returns>
    playAfterPass:function () {
        if(this.m_eAfterPass > 0){
            return false;
        }

        if(this.naviInfor.nCurSegIndex == 0){
            return false;
        }

        var bPlayed = false,
            remainSegDist = this.naviInfor.nSegRemainDist,
            curSeg = this.GetNaviSegment(this.naviInfor.nCurSegIndex),
            curSegDist = curSeg.getDistance();

        if (this.m_eCurLinkType == MRoute.LinkType.LinkType_Tunnel) {
            bPlayed = this.playTunnelAfterPass();
        }

        if (!bPlayed) {
            if(this.naviInfor.nSegRemainDist < this.cnPassMinDistTable[this.m_iCurGradNo]){
                this.m_eAfterPass = 1;
                return false;
            }

            if (curSegDist - remainSegDist > 100) {
                this.playRandomDist(MRoute.PlayGrade.PlayGrade_After);
                return true;
            }
        }

        return bPlayed;
    },
    
    /// 进入隧道
    
    /// <returns></returns>
    playTunnelAfterPass:function () {

        var curSegID = this.naviInfor.nCurSegIndex,
            nCount = 0;

        if (this.m_eAfterPass == 0 && curSegID != 0) {
            var segments = this.naviPath.getSegments();
            for (var i = curSegID; i < segments.length - 1; i++) {
                var curSeg = this.GetNaviSegment(i),
                    linkNum = curSeg.getLinkCount(),
                    bInTunnel = true;
                for(var j = 0; j < linkNum; j++){
                    if(MRoute.LinkType.LinkType_Tunnel != curSeg.getLink(j).getLinkType()){
                        bInTunnel = false;
                        break;
                    }
                }

                if(!bInTunnel){
                    break;
                }

                var nextSeg = this.GetNaviSegment(i + 1),
                    nextLinkType = nextSeg.getLink(0).getLinkType();
                if (nextLinkType == MRoute.LinkType.LinkType_Tunnel) {
                    nCount++;
                    if (nCount == 1) {
                        this.addSoundStr("前方");
                    }
                    else {
                        this.addSoundStr("，");
                    }
                    this.addSound(MRoute.OGGSound.OGG_AssiAction_Road_1 + nCount-1);
                    this.playAction(curSeg.getBasicAction(), MRoute.AssistantAction.AssiAction_NULL, false);

                    if (nCount == 2) break;
                }
                else {
                    break;
                }
            }

            if (nCount > 0) {
                this.m_eAfterPass = 1;
                return true;
            }
        }

        return false;
    },

    playRouteInfo:function(){
        if(this.m_nStartCountNum > 0) //数路口模式
        {
            return this.playCountFork();
        }
        else
        {
            if(this.playCommonNavi())
            {
                this.m_eAfterPass = 1;
                return true;
            }
            else if(this.playAfterPass())
            {
                this.m_eAfterPass = 1;
                return true;
            }
        }
        return false;
    },


    /**
     * 环岛数路口播报
     */
    playCountRound:function () {
        if (this.m_nLastCountNum > 0) {
            this.addSound(MRoute.OGGSound.OGG_Pass);
            this.addSound(MRoute.OGGSound.OGG_AssiAction_Exit_1 + (this.m_nStartCountNum - this.m_nLastCountNum) - 1);
        }
        else {
            this.addSound(MRoute.OGGSound.OGG_MainAction_Exit_Ring);
            if (this.naviInfor.nSegRemainDist > 60 || this.m_nStartCountNum > 1) {
                this.addSound(MRoute.OGGSound.OGG_AssiAction_Front_Branck);
            }

            var playGrade = this.getPlayGrade();
            var bHaveProximity = this.playProximity(playGrade);
            if(!bHaveProximity && this.isplayTarget(playGrade)){
                this.playTarget();
            }

        }
    },

    /**
     * 普通路混淆路口播报
     */
    playCountCommon:function(){
        if (this.m_nLastCountNum > 0) {
            this.addSound(MRoute.OGGSound.OGG_MainAction_Continue);
            this.addSound(MRoute.OGGSound.OGG_Pass);
            if (this.m_iCurGradNo != 0
                || (this.m_eCurFormWay != MRoute.Formway.Formway_Divised_Link
                && this.m_eCurFormWay != MRoute.Formway.Formway_Slip_Road)) {
                this.addSound(MRoute.OGGSound.OGG_AssiAction_Road_1 + (this.m_nStartCountNum - this.m_nLastCountNum) - 1);
            }
            else {
                this.addSound(MRoute.OGGSound.OGG_AssiAction_Exit_1 + (this.m_nStartCountNum - this.m_nLastCountNum) - 1);
            }
        }
        else {
            this.addSound(MRoute.OGGSound.OGG_AssiAction_Front_Branck);
            var curSeg = this.GetNaviSegment(this.curVPLocation.nSegId);

            this.playAction(curSeg.getBasicAction(), curSeg.getAssistAction(), true);
            this.setPlayState();

            var playGrade = this.getPlayGrade();
            var bHaveProximity = this.playProximity(playGrade);
            if(!bHaveProximity && this.isplayTarget(playGrade)){
                this.playTarget();
            }
        }
    },

    playCountFork:function () {

        var segId = this.curVPLocation.nSegId,
            ptId = this.curVPLocation.nPtId,
            geoPt = {x:this.curVPLocation.dLon, y:this.curVPLocation.dLat},
            curSeg = this.GetNaviSegment(segId);

        var res = curSeg.calcForkInfo(ptId, geoPt),
            dwMixForkNum = res[0],
            dwRemainForkDis = res[1];

        var dwPlayNum = (dwMixForkNum > 0) ? dwMixForkNum - 1 : 0;
        // 如果距离最后一个路口太近，强制播报最后一个路口
        if(this.naviInfor.nSegRemainDist < 10){
            dwPlayNum = 0;
        }

        if(!this.m_bManualPlay && this.m_nLastCountNum == dwPlayNum){
            return false;
        }

        if ((dwRemainForkDis < 70 && dwMixForkNum > 0) || dwMixForkNum == 1) {
            this.m_nLastCountNum = dwPlayNum;
            if( this.m_eCurFormWay == MRoute.Formway.Formway_Round_Circle ) // 环岛路口播报
            {
                this.playCountRound();
            }
            else // 普通混淆路口播报
            {
                this.playCountCommon();
            }

            // 在确认音播报区内，屏蔽确认音播报
            if(this.naviInfor.nSegRemainDist < 60)
            {
                this.m_eCurState_RealTime = 1;
            }

            if (this.m_nLastCountNum == 0)
            {
                this.m_nStartCountNum = 0;
            }
            return true;
        }

        return false;
    },

    getPlayGrade:function(){
        var segDistRemain = this.naviInfor.nSegRemainDist,
            rDistRemain = this.naviInfor.nRouteRemainDist,
            nGrad = this.m_iCurGradNo;
        if (segDistRemain < this.cnActionDistTable[nGrad][0] + this.cnForShowTable[nGrad]
            && segDistRemain >= this.cnActionDistTable[nGrad][0] && 0 == this.m_eCurState_Far) {
            return MRoute.PlayGrade.PlayGrade_Far; // 远距离
        }
        else if (segDistRemain < this.cnActionDistTable[nGrad][1] + this.cnForShowTable[nGrad]
            && segDistRemain >= this.cnActionDistTable[nGrad][1] && 0 == this.m_eCurState_Mid) {
            return MRoute.PlayGrade.PlayGrade_Mid; // 中距离
        }
        else if (segDistRemain < this.cnActionDistTable[nGrad][2] + this.cnForShowTable[nGrad]
            && segDistRemain >= this.cnActionDistTable[nGrad][2] && 0 == this.m_eCurState_Near) {
            return MRoute.PlayGrade.PlayGrade_Near; // 近距离
        }
        else if ( rDistRemain > 50 + 100  && segDistRemain <= 80) {
            return MRoute.PlayGrade.PlayGrade_Real_Time; // 实时
        }
        return MRoute.PlayGrade.PlayGrade_NULL;
    },

    playCommonNavi:function () {
        var segDistRemain = this.naviInfor.nSegRemainDist,
            rDistRemain = this.naviInfor.nRouteRemainDist,
            curSegID = this.naviInfor.nCurSegIndex,
            segCount = this.naviPath.getSegmentCount(),
            nGrad = this.m_iCurGradNo;

        if (segDistRemain < this.cnActionDistTable[nGrad][0] + this.cnForShowTable[nGrad]
            && segDistRemain >= this.cnActionDistTable[nGrad][0] && 0 == this.m_eCurState_Far) {// 远距离播报
            this.playFixedDist(MRoute.PlayGrade.PlayGrade_Far);
            this.m_eCurState_Far = 1;
            this.m_eAfterPass = 1;
            return true;
        } else if (segDistRemain < this.cnActionDistTable[nGrad][1] + this.cnForShowTable[nGrad]
            && segDistRemain >= this.cnActionDistTable[nGrad][1] && 0 == this.m_eCurState_Mid) {//中距离播报
            // 向播放列表添加基本导航中距离播报
            this.playFixedDist(MRoute.PlayGrade.PlayGrade_Mid);
            this.m_eCurState_Mid = 1;
            this.m_eAfterPass = 1;
            return true;
        } else if (segDistRemain < this.cnActionDistTable[nGrad][2] + this.cnForShowTable[nGrad]
            && segDistRemain >= this.cnActionDistTable[nGrad][2] && 0 == this.m_eCurState_Near) {// 近距播报
            // 向播放列表添加基本导航近距离播报
            this.playFixedDist(MRoute.PlayGrade.PlayGrade_Near);
            this.m_eCurState_Near = 1;
            this.m_eAfterPass = 1;
            return true;
        } else if (segDistRemain < this.cnActionDistTable[nGrad][2] && (rDistRemain > 50 + 100 || curSegID < segCount - 1) && segDistRemain <= 80 && this.m_eCurState_RealTime == 0) {// 实时播报
            // 向播放列表添加基本导航实时播报
            this.playFixedDist(MRoute.PlayGrade.PlayGrade_Real_Time);
            this.m_eCurState_RealTime = 1;
            this.m_eAfterPass = 1;
            return true;
        }
        return false;
    },

    /**
     * 重新请求路径后的reroute信息播报
     */
    playRouteReady:function () {
        //TestInfoLog("TBT-DG-playRouteReady:" + (new Date()).getTime());

        this.addSoundStr("导航准备就绪，");
        var routeDist = this.naviPath.getDistance();
        if (routeDist > 0) {
            this.addSoundStr("全程");
            routeDist = this._lookUpDist_(MRoute.PlayGrade.PlayGrade_Start, routeDist);
            var str = this.getLengthString(routeDist);
            this.addSoundStr(str);
        }

        var routeTime = this.naviPath.getTmcTimeMinute();
        if (routeTime > 0) {
            this.addSoundStr(",大约需要");

            var nDay = 0;
            var nHours = Math.floor(routeTime / 60);
            var nMinutes = routeTime % 60;
            if (nHours > 24) {
                nDay = Math.floor(nHours / 24);
                nHours = nHours % 24;
            }

            if (nDay > 0) {
                this.addSoundStr(this.NumValueToString(nDay) + "天");
            }
            if (nHours > 0) {
                this.addSoundStr(this.NumValueToString(nHours) + "小时");
            }
            if (nMinutes > 0) {
                this.addSoundStr(this.NumValueToString(nMinutes) + "分钟");
            }
            this.addSoundStr("，");
        }

        var bHaveName = false;
        if (this.naviInfor.curRoadName != null && this.naviInfor.curRoadName.length > 0) {
            bHaveName = true;
            if (this.naviInfor.curRoadName.length == 4) {
                if (this.naviInfor.curRoadName == "无名道路") {
                    bHaveName = false;
                }
            }
        }

        if (bHaveName) {
            this.addSoundStr("请行驶到");
            this.addSoundStr(this.naviInfor.curRoadName);
        }
        else {
            this.addSoundStr("请行驶上路");
        }
        var curSeg = this.GetNaviSegment(this.curVPLocation.nSegId);
        var eDirect = curSeg.getStartDirection();
        if(eDirect != MRoute.Direction.RouteDire_NULL){
            this.addSoundStr(",随后");
            this.addSoundStr(this._directionDescribe_(eDirect));
        }

        return true;
    },

    _directionDescribe_:function(eDirect){
        var str = "";
        switch (eDirect) {
            case MRoute.Direction.RouteDire_North:
            {
                str = "向北行驶";
            }
                break;
            case MRoute.Direction.RouteDire_North_East:
            {
                str = "向东北方向行驶";
            }
                break;
            case MRoute.Direction.RouteDire_East:
            {
                str = "向东行驶";
            }
                break;
            case MRoute.Direction.RouteDire_East_South:
            {
                str = "向东南方向行驶";
            }
                break;
            case MRoute.Direction.RouteDire_South:
            {
                str = "向南行驶";
            }
                break;
            case MRoute.Direction.RouteDire_West_South:
            {
                str = "向西南方向行驶";
            }
                break;
            case MRoute.Direction.RouteDire_West:
            {
                str = "向西行驶";
            }
                break;
            case MRoute.Direction.RouteDire_West_North:
            {
                str = "向西北方向行驶";
            }
                break;
            default:
                break;
        }

        return str;

    },

    playSAPA:function () {
        if (this.sapaBuffer.m_dwTotal > 0) {
            var iDist = 5000;
            if (this.m_eCurRoadClass != MRoute.RoadClass.RoadClass_Freeway) {
                iDist = 1000;
            }
            var startId = this.sapaBuffer.m_dwStartIndex;
            var item = this.sapaBuffer.m_astItemList[startId];
            if (0 == item.m_ePlayed) {
                var realDist = this.naviInfor.nRouteRemainDist - item.m_dwDistance;
                if (realDist < iDist + this.cnForShowTable[0]) {
                    item.m_ePlayed = 1;
                    this.addSoundStr("前方");
                    if (this.m_eCurRoadClass == MRoute.RoadClass.RoadClass_Freeway){
                        if (realDist < iDist){
                            this.addSoundStr(this.getLengthString(realDist));
                        } else {
                            this.addSoundStr("五公里");
                        }
                    } else {
                        if (realDist < iDist) {
                            this.addSoundStr(this.getLengthString(realDist));
                        }
                        else {
                            this.addSoundStr("一公里");
                        }
                    }

                    this.addSoundStr("有服务区");
                    return true;
                }
            }
        }
        return false;
    },

    
    /// 载入道路段的服务区信息
    
    loadSAPA:function () {

        var Buf = this.sapaBuffer,
            itemId = (Buf.m_dwStartIndex + Buf.m_dwTotal) % Buf.SAPA_BUFFER_SIZE,
            segId  = Buf.m_dwEndSegNo,
            linkId = Buf.m_dwEndLinkNo, //自前次遍历的后一link开始遍历，该link编号可能不存在
            segments = this.naviPath.getSegments();

        for (; segId < segments.length; segId++) {
            var curSeg = segments[segId];
            var linkCount = curSeg.getLinkCount();
            for (; linkId < linkCount; linkId++) {
                var curLink = curSeg.getLink(linkId);

                //? 只有高速路上的服务区才播报
//                var eRoadClass = curLink.getRoadClass();
//                if (eRoadClass != MRoute.RoadClass.RoadClass_Freeway) {
//                    Buf.m_dwEndSegNo = segId;
//                    Buf.m_dwEndLinkNo = linkId;
//                    return true;
//                }

                if (curLink.isAtService()) {
                    var ptId = curLink.getLastPtId(),
                        pt = curSeg.getDetailedPoint(ptId);
                    Buf.m_astItemList[itemId].m_dwDistance = this.naviPath.getRemainRouteDist(segId, ptId, pt);
                    Buf.m_astItemList[itemId].m_dwSegeNo = segId;
                    Buf.m_astItemList[itemId].m_ePlayed = 0;

                    Buf.m_dwEndSegNo = segId;
                    Buf.m_dwEndLinkNo = linkId +1;//
                    Buf.m_dwTotal++;
                    itemId = (itemId + 1) % Buf.SAPA_BUFFER_SIZE;

                    if (Buf.m_dwTotal >= Buf.SAPA_BUFFER_SIZE) {
                        return true;
                    }
                }
            }
            linkId = 0;
        }

        Buf.m_bCollectEnd = true;
        return true;
    },


    playCamera:function () {
        this.collectCameraBuffer();//检查播报时电子眼是否已经被经过
        var Buf = this.cameraBuffer;

        if (0 == Buf.m_dwTotal) {    //Buffer中没有合适的电子眼
            return false;
        }

        var nGrad = this.m_iCurGradNo;
        var dwPlayNeedLength = this.cnCameraDistTable[nGrad] + this.cnForShowTable[nGrad];
        var dwNearestIndex = Buf.m_dwStartIndex;
        var cameraItem = Buf.m_astItemList[dwNearestIndex];


        if (this.naviInfor.nRouteRemainDist - cameraItem.m_dwDistance < dwPlayNeedLength
            && cameraItem.m_dwSegeNo == this.curVPLocation.nSegId
            && cameraItem.m_ePlayed == 0) {
            //当前距离满足电子眼播报
            cameraItem.m_ePlayed = 1;
            Buf.m_dwStartIndex = (dwNearestIndex + 1) % Buf.CAMERA_BUFFER_SIZE;
            Buf.m_dwTotal--;

            if (this.m_bPlayCamera) {
                if (cameraItem.m_eCameraType == MRoute.CameraType.CameraType_Speed) {
                    this.addSoundStr("前方有测速摄像，");
                    var speed = cameraItem.m_nSpeed;
//                    if (speed < 1 || speed > this.naviInfor.nLimitedSpeed) {
//                        speed = this.naviInfor.nLimitedSpeed;
//                    }

                    if (speed > 0) {
                        this.addSoundStr("限速");
                        this.addSoundStr(this.NumValueToString(speed));
                        this.addSoundStr("公里");
                        if (this.curVPLocation.nSpeed > speed) {
                            this.addSoundStr("，您已超速");
                        }
                    }
                    else {
                        this.addSoundStr("请谨慎驾驶");
                    }
                }
                else {
                    this.addSoundStr("前方有监控摄像，请谨慎驾驶");
                }
                return true;
            }
        }

        return false;
    },

    
    /// 载入道路段的摄像头信息
    loadCamera:function () {
        var Buf = this.cameraBuffer;
        if (Buf.m_bAllInBuffer) {
            return true;
        }

        // 回收播过的电子眼Item
        this.collectCameraBuffer();
        if (Buf.m_dwTotal >= 2) {//如果buffer中仍有2个有效的电子眼就不再继续查找
            return true;
        }
        //前方电子眼的查找
        var itemId = (Buf.m_dwStartIndex + Buf.m_dwTotal) % Buf.CAMERA_BUFFER_SIZE;
        var segId = Buf.m_dwEndSegNo;
        var linkId = Buf.m_dwEndLinkNo;
        var segments = this.naviPath.getSegments();
        for (; segId < segments.length; segId++) {
            var curSeg = segments[segId];
            var linkCount = curSeg.getLinkCount();
            for (; linkId < linkCount; linkId++) {//linkid 从零开始，每一个segment上的ptid linkid是连续的
                var curLink = curSeg.getLink(linkId);
                if (curLink.getCameraCount()) {
                    var camera = curLink.getCameras(0);
                    var nvPt = camera.getCoordinate();
                    var ptId = curSeg.calcNearestPtId(nvPt.x, nvPt.y, linkId);

                    var dist = this.naviPath.getRemainRouteDist(segId, ptId, nvPt);
                    if (Buf.m_dwLastPlayRemainDist <= dist) {
                        continue;
                    }

                    //if(Buf.m_dwLastPlayRemainDist - dist < this.PROXIMITY_DISTANCE)
                    if (Buf.m_dwLastPlayRemainDist - dist < this.cnCameraDistTable[0]) {
                        Buf.m_dwLastPlayRemainDist = dist;//已经在播报的经验距离范围之内不再添加
                        // 距离不合要求不添加
                    }
                    else {
                        Buf.m_dwLastPlayRemainDist = dist;
                        var cameraItem = Buf.m_astItemList[itemId];
                        cameraItem.m_dwSegeNo = segId;
                        cameraItem.m_eCameraType = camera.getCameraType();
                        cameraItem.m_ePlayed = 0;
                        cameraItem.m_dwDistance = dist;
                        cameraItem.m_nSpeed = camera.getSpeed();

                        Buf.m_dwTotal++;

                        Buf.m_dwEndSegNo = segId;
                        Buf.m_dwEndLinkNo = linkId + 1;

                        itemId = (itemId + 1) % Buf.CAMERA_BUFFER_SIZE;
                        if (Buf.m_dwTotal >= Buf.CAMERA_BUFFER_SIZE) {
                            return true;
                        }
                    }
                }
            }
            linkId = 0;
        }
        Buf.m_bAllInBuffer = true;
        return true;

    },

    // 将已经过的电子眼改为已播报状态，回收item以便记录将至的电子眼
    collectCameraBuffer:function () {
        //别名
        var Buf = this.cameraBuffer;
        var List = Buf.m_astItemList;
        var naviInfo = this.naviInfor;

        var index = Buf.m_dwStartIndex;
        var dwTestNum;
        for (dwTestNum = 0; dwTestNum < Buf.m_dwTotal; index = (index + 1) % Buf.CAMERA_BUFFER_SIZE, dwTestNum++) {
            if (List[index].m_dwSegeNo == naviInfo.nCurSegIndex) {
                if (naviInfo.nRouteRemainDist > List[index].m_dwDistance
                    && 0 == List[index].m_ePlayed) {
                    break;
                }
                else {
                    List[index].m_ePlayed = 1;
                }
            }
            else if (List[index].m_dwSegeNo < naviInfo.nCurSegIndex) {
                List[index].m_ePlayed = 1;
            }
            else {
                break; // 未到当前路段
            }
        }
        Buf.m_dwStartIndex = index;
       // if (Buf.m_dwTotal >= dwTestNum) {
            Buf.m_dwTotal -= dwTestNum;
       // }

    },

    collectSAPABuffer:function () {

        var Buf = this.sapaBuffer;

        var index = Buf.m_dwStartIndex;
        var dwTestNum = 0;
        for (; dwTestNum < Buf.m_dwTotal; index = (index + 1) % Buf.SAPA_BUFFER_SIZE, dwTestNum++) {
            if (Buf.m_astItemList[index].m_dwSegeNo == this.naviInfor.nCurSegIndex) {
                if (this.naviInfor.nRouteRemainDist > Buf.m_astItemList[index].m_dwDistance
                    && 0 == Buf.m_astItemList[index].m_ePlayed) {
                    break;
                }
                else {
                    Buf.m_astItemList[index].m_ePlayed = 1;
                }
            }
            else if (Buf.m_astItemList[index].m_dwSegeNo < this.naviInfor.nCurSegIndex) {
                Buf.m_astItemList[index].m_ePlayed = 1;
            }
            else {
                break;
            }
        }
        Buf.m_dwStartIndex = index;
        if (Buf.m_dwTotal >= dwTestNum) {
            Buf.m_dwTotal -= dwTestNum;
        }
    },

    getNaviInfo:function() {
        return this.naviInfor;
    },


    
    /// 播报开始导航概要提示
    
    playStartSummary:function () {
        this.m_bNotifyPrepareVoice = true;
        this.m_pstFrame.PrepareVoice();
        //this.loadCamera();

        if (this.m_pstFrame.GetRouteType() != MRoute.CalcRouteType.CalcRouteType_Reroute) {
            this.addSound(MRoute.OGGSound.OGG_Navi_Start);
        }else{
            //by TangJing
            this.loadCamera();
            var nGrad = this.m_iCurGradNo,dwPlayNeedLength = this.cnCameraDistTable[nGrad] + this.cnForShowTable[nGrad];
            var dwNearestIndex = this.cameraBuffer.m_dwStartIndex,cameraItem = this.cameraBuffer.m_astItemList[dwNearestIndex];
            if(this.naviInfor.nRouteRemainDist - cameraItem.m_dwDistance < dwPlayNeedLength
                && cameraItem.m_dwSegeNo == this.curVPLocation.nSegId
                && cameraItem.m_ePlayed == 0)
                cameraItem.m_ePlayed = 1;
        }
        this.playRandomDist(MRoute.PlayGrade.PlayGrade_Start);
        var validCharacterLen = this.m_wStrTTSBufer.split(",").length,currentTime = new Date().getTime();
        this.endTimeofTTS = currentTime + this.timePerCharacter * (this.m_wStrTTSBufer.length - validCharacterLen + 1);
        this.flushNaviSound();
        this.m_eStartSummaryPlayState = 1;

    },

    
    /// 播报结束导航概要提示
    
    playEndSummary:function () {
        this.addSound(MRoute.OGGSound.OGG_AssiAction_Arrive_Destination);
        this.addSound(MRoute.OGGSound.OGG_Navi_End);
        console.log("_initForRouteSuccess_: playEndSummary");
        this.flushNaviSound();
        this.m_eEndSummaryPlayState = 1;
    },



    /// !!!是否为GPS导航
    /// <returns></returns>
    IsGPSNaving:function () {
        return this.m_bStartGPS && !this.m_bPauseGPS;
    },
    /*
     #endregion
     #region 导航
     */

    /*
     #endregion
     #region 声音播报模块
     */
    
    /// 远距离播报状态
    
    m_eCurState_Far:null,
    
    /// 中距离播报状态
    
    m_eCurState_Mid:null,
    
    /// 近距离播报状态
    
    m_eCurState_Near:null,
    
    /// 确认音播报状态
    
    m_eCurState_RealTime:null,
    
    /// 开始导航播报状态
    
    m_eStartSummaryPlayState:null,
    
    /// 结束导航播报状态
    
    m_eEndSummaryPlayState:null,
    
    /// 过后音播报状态
    
    m_eAfterPass:null,
    m_bTargetPlayed:null,
    LEAST_DISTANCE_VOICE:100,
    
    /// 数路口开始路口数
    
    m_nStartCountNum:-1,
    m_nLastCountNum:-1,


    m_wStrTTSBufer:"", // TTS播报字符串缓存
    endTimeofTTS: 0, //本次播报结束的时间
    timePerCharacter: 270, //经验值，每个汉字播报需要的时间


    getEndTimeOfLastTTS:function(){
        return this.endTimeofTTS;
    },
    /// 添加声音
       /// <param name="oGGId"></param>
    addSound:function (oGGId) {
        if(oGGId < 0){
            return;
        }
        //如果是枚举类型，则转换
        var str = MRoute.DGUtil.GetIndexVoiceText(oGGId);
        if (this.m_wStrTTSBufer.length > 0) {
            this.m_wStrTTSBufer = this.m_wStrTTSBufer.concat(str);
        }
        else {
            this.m_wStrTTSBufer = str;
        }

    },

    addSoundStr:function (str) {
        if (this.m_wStrTTSBufer.length > 0) {
            this.m_wStrTTSBufer = this.m_wStrTTSBufer.concat(str);
        }
        else {
            this.m_wStrTTSBufer = str;
        }
    },

    /**
     * 随机距离播报
     * @param ePlayGrade    播报类别
     * @return {Boolean}    是否有播报内容
     */
    playRandomDist:function (ePlayGrade) {
        if (this.isNeedPlayLongRoad(this.m_iCurGradNo)) {
            this.addSoundStr("前方大约有");
            this.addSoundStr(this.getLengthString(this.naviInfor.nSegRemainDist));
            this.addSoundStr("顺行道路");
        } else {
            this.setPlayState();
            this.playFixedDist(ePlayGrade);
        }
        return true;
    },
    
    /// 设置播报状态 用来在随机距离播报时设置固定播报是否还需要播报
    
    setPlayState:function () {
        var remainDist = this.naviInfor.nSegRemainDist,
            eCurRoadClass = this.m_eCurRoadClass;
        if (remainDist < 100) {
            this.m_eCurState_Mid = 1;
            this.m_eCurState_Near = 1;
            this.m_eCurState_RealTime = 1;
        }
        else {
            if (eCurRoadClass == MRoute.RoadClass.RoadClass_Freeway) {
                if (remainDist < 3000) {
                    this.m_eCurState_Far = 1;
                    if (remainDist < 1000) {
                        this.m_eCurState_Mid = 1;
                        if (remainDist < 400) {
                            this.m_eCurState_Near = 1;
                        }
                    }
                }
            } else if (eCurRoadClass == MRoute.RoadClass.RoadClass_City_Speed_way) {
                if (remainDist < 2000) {
                    this.m_eCurState_Far = 1;
                    if (remainDist < 700) {
                        this.m_eCurState_Mid = 1;
                        if (remainDist < 400) {
                            this.m_eCurState_Near = 1;
                        }
                    }
                }
            } else {
                if (remainDist < 700) {
                    this.m_eCurState_Mid = 1;
                    if (remainDist < 400) {
                        this.m_eCurState_Near = 1;
                    }
                }
            }
        }
    },


    isplayTarget:function(ePlayGrade){
        return !(!this.m_playToken.m_bTargetInfoToken
            || this.m_bTargetPlayed
            || this.naviInfor.nSegRemainDist < this.cnActionDistTable[2][2]    // 剩余距离小于近距离播报不播报方面名称
            || ePlayGrade == MRoute.PlayGrade.PlayGrade_Real_Time
            || ePlayGrade == MRoute.PlayGrade.PlayGrade_Arrive);


    },

    isplayProximity:function(){
        if(!this.m_playToken.m_bProximityToken){
            return false;
        }
        // 和距离相关的判定
        return true;
    },

    /**
     * 固定距离播报
     * @param ePlayGrade    播报类别
     * @return {Boolean}    是否有播报内容
     */
    playFixedDist:function (ePlayGrade) {

        var segId = this.naviInfor.nCurSegIndex,
            curSeg = this.GetNaviSegment(segId);
        if (curSeg == null) {
            return false;
        }

        var baseAction = curSeg.getBasicAction(),
            assAction = curSeg.getAssistAction(),
            segRemainDist = this.naviInfor.nSegRemainDist;

        if (segRemainDist >= this.LEAST_DISTANCE_VOICE && this.m_eCurFormWay != MRoute.Formway.Formway_Round_Circle) {
            segRemainDist = this._lookUpDist_(ePlayGrade, segRemainDist);
            this.addSound(MRoute.OGGSound.OGG_Forword);
            this.addSoundStr(this.getLengthString(segRemainDist));
        }

        // 中距离时未数路口，数路口播报，孙文博反映，若不播报路口数，直接播报感觉突兀
        if (this.m_nStartCountNum < 0 && this.IsShortThanMiddle()) {
            this.countForkNum();
            if (this.m_nStartCountNum > 0)
            {
                this.addSound(MRoute.OGGSound.OGG_AssiAction_Road_1 + this.m_nStartCountNum - 1);
            }
        }

        // 播报基本和辅助动作
        if(this.m_playToken.m_bTargetInfoToken && baseAction != MRoute.MainAction.MainAction_NULL){
            this.playAction(baseAction, MRoute.AssistantAction.AssiAction_NULL, true);
        }
        else {
            this.playAction(baseAction, assAction, true);
        }

        var bHaveProximity = false;
        if (this.isplayProximity()) {
            bHaveProximity = this.playProximity(ePlayGrade);
        }
        var bplayTarget = this.isplayTarget(ePlayGrade);

        if (bplayTarget && !bHaveProximity) {
            if (this.getPlayGrade() != MRoute.PlayGrade.PlayGrade_NULL) {
                this.m_bTargetPlayed = true;
            }
            this.playTarget();
        }
        return true;
    },

    /**
     * 近接播报
     * @param ePlayGrade 播报级别
     * @return {Boolean}
     */
    playProximity:function (ePlayGrade) {

        var curSegId = this.naviInfor.nCurSegIndex,
            nextSeg = this.GetNaviSegment(curSegId + 1);
        if(nextSeg == null){
            return false;
        }

        if (nextSeg.getDistance() < this.PROXIMITY_DISTANCE) {
            var mainAction = nextSeg.getBasicAction(),
                assistAction = nextSeg.getAssistAction();
            this.addSoundStr("，随后");
            if (assistAction == MRoute.AssistantAction.AssiAction_Arrive_TollGate) {
                this.playAction(MRoute.MainAction.MainAction_NULL,
                    MRoute.AssistantAction.AssiAction_Arrive_TollGate, false);
            }
            else if (mainAction == MRoute.MainAction.MainAction_NULL) {
                this.playAction(mainAction, assistAction, false);
            }
            else if (mainAction == MRoute.MainAction.MainAction_Entry_Ring && ePlayGrade == MRoute.PlayGrade.PlayGrade_Far) {
                this.addSoundStr("经过环岛");
            }
            else {
                this.playAction(mainAction, MRoute.AssistantAction.AssiAction_NULL, false);
            }
            return true;
        }

        return false;

    },

    playTarget:function () {
        var segments = this.naviPath.getSegments();
        if (segments == null) {
            return false;
        }

        var segmentNum = segments.length,
            curSegID = this.naviInfor.nCurSegIndex,
            targetName = this.getTargetInfoData(curSegID),
            nextRoadName = null,
            curRoadName = this.getRoadName(curSegID, this.naviInfor.nCurLinkIndex);

        var curSeg = this.GetNaviSegment(curSegID);
        if ((curSegID >= segmentNum - 2)
            || (curSegID < segmentNum - 2 && curSeg.getBasicAction() == MRoute.MainAction.MainAction_Entry_Ring)) {
            // 接近最后一段或进入环岛
            nextRoadName = this.getRoadName(curSegID + 2, 0);
        }
        else {
            nextRoadName = this.getRoadName(curSegID + 1, 0);
        }

        if (targetName != null && targetName.length > 0) {
            this.addSoundStr("，是");
            this.addSoundStr(targetName);
            this.addSoundStr("方向");
            return true;
        } else if (nextRoadName != null && nextRoadName.length > 0 && nextRoadName != curRoadName) {
            this.addSoundStr("，进入");
            this.addSoundStr(nextRoadName);
            return true;
        }

        return false;

    },

    getTargetInfoData:function (dwSegNum) {
        var pwName = null;
        var pSegment = this.GetNaviSegment(dwSegNum);
        var Signs = pSegment.getRoadSigns();
        if (Signs != null && Signs.length > 0) {
            pwName = Signs[0].getContent();
//            for(var i = 1; i < Signs.length; i++){
//                pwName = pwName + Signs[i].getContent();
//            }
        }
        return pwName;
    },

    manualPlay:function () {
        if (this.m_bManualPlay) {
            return;
        }

        if(!this.m_bStartEmul && !this.m_bStartGPS) {
            return;
        }

        this.m_bManualPlay = true;
    },


    playCurrent:function () {

        if(this.m_pstVoiceManager.GetRemainTime() > 0){
            return false;
        }

        if (this.m_nStartCountNum > 0 && this.playCountFork())
        {
        }
        else
        {
            // 在固定距离播报范围内播报固定距离
            if (this.playCommonNavi())
            {
            }
            else
            {
                // 非固定距离，根据当前距离播报
                this.playRandomDist(MRoute.PlayGrade.PlayGrade_NULL);
            }
        }

        if(this.m_wStrTTSBufer.length > 0)
        {
            this.m_bManualPlay = false;
            console.log("_initForRouteSuccess_: playCurrent");
            this.flushNaviSound();
            return true;
        }
        return false;
    },

    calcManualGrade:function (bval) {
        var ePlayGrade = MRoute.PlayGrade.PlayGrade_NULL,
            nGrad = this.m_iCurGradNo,
            offset = this.cnForShowTable[nGrad],
            rSegDist = this.naviInfor.nSegRemainDist,
            rRouteDist = this.naviInfor.nRouteRemainDist;

        if (rSegDist >= this.cnActionDistTable[nGrad][0]) {
            //远距离播报
            if (bval) {
                if (rSegDist < this.cnActionDistTable[nGrad][0] + offset) {
                    ePlayGrade = MRoute.PlayGrade.PlayGrade_Far;
                }
            }
            else {
                ePlayGrade = MRoute.PlayGrade.PlayGrade_Far;
            }

        }
        else if (rSegDist >= this.cnActionDistTable[nGrad][1]) {
            //中距离播报
            if (bval) {
                if (rSegDist < this.cnActionDistTable[nGrad][1] + offset) {
                    ePlayGrade = MRoute.PlayGrade.PlayGrade_Mid;
                }
            }
            else {
                ePlayGrade = MRoute.PlayGrade.PlayGrade_Mid;
            }
        }
        else if (rSegDist >= this.cnActionDistTable[nGrad][2]) {
            //近距播报
            if (bval) {
                if (rSegDist < this.cnActionDistTable[nGrad][2] + offset) {
                    ePlayGrade = MRoute.PlayGrade.PlayGrade_Near;
                }
            }
            else {
                ePlayGrade = MRoute.PlayGrade.PlayGrade_Near;
            }
        }
        else if (rSegDist < this.cnActionDistTable[nGrad][2]) {
            var segCount = this.naviPath.getSegmentCount();
            if (rRouteDist > 50 + 100 || this.naviInfor.nCurSegIndex < segCount - 1) {
                // 即时播报
                var iSpeed = this.getCurrentCarSpeed();
                var iRealTimeDis = 50 + iSpeed;	// 处理Gps有1秒延迟的情况
                if (rSegDist <= iRealTimeDis) {
                    var dwNeedTime = this.m_pstVoiceManager.GetRemainTime();
                    var bCanPlay = true;
                    if (dwNeedTime == 0) {
                        dwNeedTime = this.m_pstVoiceManager.GetNoVoiceTime();
                        if (dwNeedTime < 1000) {
                            bCanPlay = false;
                        }
                    }
                    else {
                        bCanPlay = false;
                    }

                    if (rSegDist < 30) {
                        bCanPlay = true;
                    }

                    if (bCanPlay) {
                        ePlayGrade = MRoute.PlayGrade.PlayGrade_Real_Time;
                    }
                }
            }
            else if (this.naviInfor.nCurSegIndex >= segCount - 1) {
                if (rRouteDist < 50) {
                    ePlayGrade = MRoute.PlayGrade.PlayGrade_Arrive;//到达播报
                }
            }
        }

        return ePlayGrade;
    },

    /**
     * 播报动作
     * @param eMainAction           主导航动作
     * @param eAssistantAction      辅助导航动作
     * @param bCurrent              是否当前导航段
     */
    playAction:function (eMainAction, eAssistantAction, bCurrent) {

        var MAction = MRoute.MainAction,
            AAction = MRoute.AssistantAction;

        if(eMainAction == MAction.MainAction_Entry_Ring)
        {
            eAssistantAction = AAction.AssiAction_NULL;
        }
        else if(eMainAction == MAction.MainAction_Slow && eAssistantAction == AAction.AssiAction_NULL)
        {
            eMainAction = MAction.MainAction_NULL;
            eAssistantAction = AAction.AssiAction_Arrive_TollGate;
        }


        // 收费站先播辅助信息
        if (eAssistantAction == AAction.AssiAction_Arrive_TollGate) {
            this.playAssitAction(eMainAction, eAssistantAction, bCurrent);
            this.playMainAction(eMainAction, eAssistantAction, bCurrent);
        }
        else {
            this.playMainAction(eMainAction, eAssistantAction, bCurrent);
            this.playAssitAction(eMainAction, eAssistantAction, bCurrent);
        }

    },

    /**
     * 播报主要动作
     * @param eMAction      主导航动作
     * @param eAAction      辅助导航动作
     * @param bCurrent      是否当前导航段
     */
    playMainAction:function (eMAction, eAAction, bCurrent) {
        var MAction = MRoute.MainAction,
            AAction = MRoute.AssistantAction;

        if(MAction.MainAction_NULL == eMAction){
            return;
        }

        if(bCurrent){
            var bOnRoundStartPlay = false;
            var curSegID = this.naviInfor.nCurSegIndex;
            if (eMAction == MAction.MainAction_Leave_Ring && curSegID == 0) {
                bOnRoundStartPlay = true;
            }
            else if (eMAction == MAction.MainAction_Leave_Ring && curSegID > 0) {
                var curSeg = this.GetNaviSegment(curSegID - 1);
                if (curSeg == null) {
                    return;
                }

                if (curSeg.getBasicAction() != MAction.MainAction_Entry_Ring) {
                    bOnRoundStartPlay = true;
                }
            }
            if (bOnRoundStartPlay && this.m_nStartCountNum < 0) {
                this.countForkNum();
                var iExitNum = this.m_nStartCountNum;
                this.addSound(MRoute.OGGSound.OGG_Forword);
                this.addSound(iExitNum + MRoute.OGGSound.OGG_AssiAction_Exit_1 - 1);
            }
        }

        var dwVoiceID = this.getMainActionVoiceID(eMAction);
        if (eAAction == AAction.AssiAction_Along_Main
            || eAAction == AAction.AssiAction_Along_Road
            || eAAction == AAction.AssiAction_Along_Sild) {
            this.addSoundStr(this._customActionDescribe_(dwVoiceID));
        }
        else {
            this.addSound(dwVoiceID);
        }

    },

    countForkNum:function(){

        var curSegId = this.naviInfor.nCurSegIndex,
            curLinkId = this.naviInfor.nCurLinkIndex,
            curSeg = this.GetNaviSegment(curSegId);
        if (curSeg == null) {
            return;
        }

        this.m_nStartCountNum = curSeg.calcMixForkNum(curLinkId);
        if(this.m_nStartCountNum > 7)
            this.m_nStartCountNum = 7;

        // 只有一个路口，非环岛情形省略播报，因为不至于混淆
        if (this.m_nStartCountNum == 1 && this.m_eCurFormWay != MRoute.Formway.Formway_Round_Circle)
        {
            this.m_nStartCountNum = 0;
        }
    },

    /**
     * 获得主要动作的预录音号
     * @param eMAction 主导航动作
     * @return {Number} 预录音号
     */
    getMainActionVoiceID:function (eMAction) {
        if (MRoute.MainAction.MainAction_NULL == eMAction) {
            return -1;
        }
        else {
            return (MRoute.OGGSound.OGG_MainAction_Turn_Left + eMAction - 1);
        }
    },

    /**
     * 播报辅助动作
     * @param eMAction      主导航动作
     * @param eAAction      辅助导航动作
     * @param bCurrent      是否当前导航段
     */
    playAssitAction:function (eMAction, eAAction, bCurrent) {
        if (eMAction == MRoute.MainAction.MainAction_Entry_Ring && bCurrent) {
            var curSegID = this.naviInfor.nCurSegIndex;
            if (curSegID >= this.naviPath.getSegmentCount() - 2) {
                this.addSoundStr("，随后到达目的地附近");
            }
            else {
                var nextSeg = this.GetNaviSegment(this.naviInfor.nCurSegIndex + 1);
                if (nextSeg == null) {
                    return;
                }
                if (nextSeg.getAssistAction() == MRoute.AssistantAction.AssiAction_Arrive_Way) {
                    this.addSoundStr("，随后到达途经点附近");
                }
                else {
                    var iExitNum = nextSeg.calcMixForkNum(0);
                    if (iExitNum > 0) {
                        iExitNum = iExitNum > 7 ? 7 : iExitNum;
                        this.addSound(iExitNum + MRoute.OGGSound.OGG_AssiAction_G0_Exit_1 - 1);
                    }
                }
            }
        }
        else {
            if (eAAction != MRoute.AssistantAction.AssiAction_NULL) {
                var dw = this.getAssiActionVoiceID(eMAction, eAAction);
                var dwIDNum = dw[0], adwIDList = dw[1];
                for (var i = 0; i < dwIDNum; i++) {
                    if (adwIDList[i] != 0) {
                        this.addSound(adwIDList[i]);
                    }
                }
            }
        }
    },

    
    /// 获得辅助动作的预录音号
    /// <param name="eMAction">主要动作</param>
    /// <param name="eAAction">辅助动作</param>
    /// <param name="adwIDList">声音号列表</param>
    /// <returns>返回声音号数量</returns>
    getAssiActionVoiceID:function (eMAction, eAAction) {
        var dwIDNum = 0, adwIDList = [];
        if (MRoute.AssistantAction.AssiAction_NULL == eAAction) {
            return 0;
        }

        if (eAAction >= MRoute.AssistantAction.AssiAction_Arrive_Exit && eAAction <= MRoute.AssistantAction.AssiAction_Arrive_Destination) {
            adwIDList[dwIDNum] = (MRoute.OGGSound.OGG_AssiAction_Arrive_Exit + eAAction - MRoute.AssistantAction.AssiAction_Arrive_Exit);
            dwIDNum++;
        } else if (MRoute.AssistantAction.AssiAction_Entry_Ferry == eAAction) {
            adwIDList[dwIDNum] = MRoute.OGGSound.OGG_AssiAction_Arrive_Ferry;
            dwIDNum++;
        } else if (MRoute.AssistantAction.AssiAction_Entry_Ring_Left == eAAction) {
            adwIDList[dwIDNum] = MRoute.OGGSound.OGG_MainAction_Turn_Left;
            dwIDNum++;
        } else if (MRoute.AssistantAction.AssiAction_Entry_Ring_Right == eAAction) {
            adwIDList[dwIDNum] = MRoute.OGGSound.OGG_MainAction_Turn_Right;
            dwIDNum++;
        } else if (MRoute.AssistantAction.AssiAction_Entry_Ring_Continue == eAAction) {
            adwIDList[dwIDNum] = MRoute.OGGSound.OGG_MainAction_Continue;
            dwIDNum++;
        } else if (MRoute.AssistantAction.AssiAction_Entry_Ring_UTurn == eAAction) {
            adwIDList[dwIDNum] = MRoute.OGGSound.OGG_MainAction_UTurn;
            dwIDNum++;
        } else if (eAAction >= MRoute.AssistantAction.AssiAction_Right_Branch_1 && eAAction <= MRoute.AssistantAction.AssiAction_Left_Branch_5) {
            adwIDList[dwIDNum] = (MRoute.OGGSound.OGG_AssiAction_Right_Branch_1 + eAAction - MRoute.AssistantAction.AssiAction_Right_Branch_1);
            dwIDNum++;
        } else if (eAAction >= MRoute.AssistantAction.AssiAction_Entry_Merge_Center && eAAction <= MRoute.AssistantAction.AssiAction_Entry_Merge_Left) {
            if (eMAction != MRoute.MainAction.MainAction_Continue) {
                adwIDList[dwIDNum] = MRoute.OGGSound.OGG_Then;
                dwIDNum++;
            }
            adwIDList[dwIDNum] = (MRoute.OGGSound.OGG_AssiAction_Entry_Center_Side_Road + eAAction - MRoute.AssistantAction.AssiAction_Entry_Merge_Center);
            dwIDNum++;
        } else if (eAAction >= MRoute.AssistantAction.AssiAction_Entry_Merge_Right_Sild && eAAction <= MRoute.AssistantAction.AssiAction_Entry_Merge_Right_Right) {
            switch (eAAction) {
                case MRoute.AssistantAction.AssiAction_Entry_Merge_Right_Sild:
                    adwIDList[dwIDNum] = MRoute.OGGSound.OGG_Then;
                    dwIDNum++;
                    adwIDList[dwIDNum] = MRoute.OGGSound.OGG_AssiAction_Along_Side;
                    dwIDNum++;
                    break;
                case MRoute.AssistantAction.AssiAction_Entry_Merge_Left_Sild:
                    adwIDList[dwIDNum] = MRoute.OGGSound.OGG_Then;
                    dwIDNum++;
                    adwIDList[dwIDNum] = MRoute.OGGSound.OGG_AssiAction_Along_Side;
                    dwIDNum++;
                    break;
                case MRoute.AssistantAction.AssiAction_Entry_Merge_Right_MAIN:
                    adwIDList[dwIDNum] = MRoute.OGGSound.OGG_Then;
                    dwIDNum++;
                    adwIDList[dwIDNum] = MRoute.OGGSound.OGG_AssiAction_Along_Main;
                    dwIDNum++;
                    break;
                case MRoute.AssistantAction.AssiAction_Entry_Merge_Left_MAIN:
                    adwIDList[dwIDNum] = MRoute.OGGSound.OGG_Then;
                    dwIDNum++;
                    adwIDList[dwIDNum] = MRoute.OGGSound.OGG_AssiAction_Along_Main;
                    dwIDNum++;
                    break;
                case MRoute.AssistantAction.AssiAction_Entry_Merge_Right_Right:
                    adwIDList[dwIDNum] = MRoute.OGGSound.OGG_AssiAction_Entry_Right_Side_Road;
                    dwIDNum++;
                    adwIDList[dwIDNum] = MRoute.OGGSound.OGG_AssiAction_Along_Right_Road;
                    dwIDNum++;
                    break;
            }
        }
        else if (eAAction == MRoute.AssistantAction.AssiAction_Along_Sild) {
            adwIDList[dwIDNum] = MRoute.OGGSound.OGG_AssiAction_Along_Side;
            dwIDNum++;
        } else if (eAAction == MRoute.AssistantAction.AssiAction_Along_Main) {
            adwIDList[dwIDNum] = MRoute.OGGSound.OGG_AssiAction_Along_Main;
            dwIDNum++;
        } else if (eAAction >= MRoute.AssistantAction.AssiAction_Entry_Main && eAAction <= MRoute.AssistantAction.AssiAction_Entry_Left_Road) {
            adwIDList[dwIDNum] = (MRoute.OGGSound.OGG_AssiAction_Entry_Main + eAAction - 1);
            dwIDNum++;
        }

        return [dwIDNum, adwIDList];
    },



    // 查表，返回播报距离
    _lookUpDist_:function (ePlayGrade, dist) {
        var nGrad = this.m_iCurGradNo;
        switch (ePlayGrade) {
            case MRoute.PlayGrade.PlayGrade_Far://远距离提示
                if (nGrad == MRoute.RoadClass.RoadClass_Province_Road) {
                    dist = this.cnActionDistTable[nGrad][1];
                }
                else {
                    dist = this.cnActionDistTable[nGrad][0];
                }
                break;

            case MRoute.PlayGrade.PlayGrade_Mid://中距离提示
                dist = this.cnActionDistTable[nGrad][1];
                break;

            case MRoute.PlayGrade.PlayGrade_Near://近距离提示
                dist = this.cnActionDistTable[nGrad][2];
                break;

            case MRoute.PlayGrade.PlayGrade_Start:
                if (dist > 1000) {
                    dist = Math.ceil(dist / 1000) * 1000;
                } else if (dist > 100) {
                    dist = Math.ceil(dist / 100) * 100;
                }
                else if (dist > 10) {
                    dist = Math.ceil(dist / 10) * 10;
                }
                break;
            default:
                break;
        }

        return dist;
    },
    
    /**
     * 将距离转化为字符串描述
     * @param dist
     * @return {String}
     */
    getLengthString:function (dist) {
        var str ="", iDis;
        if (dist > 950) {
            iDis = dist < 1000 ? 1 : Math.floor(dist / 1000);
            str = this.NumValueToString(iDis) + "公里";
            return str;
        }
        else {
            iDis = dist;
            if (iDis >= 100) {
                iDis = Math.round(dist / 100);
                iDis *= 100;
            }
            else if (iDis >= 10) {
                iDis = Math.round(dist / 10);
                iDis *= 10;
            }
            str = this.NumValueToString(iDis) + "米";
            return str;
        }
    },

    _getLengthDescribe_:function(dist){
        var str = "", iDis;
        if(dist > 1000){
            iDis = Math.floor(dist / 1000);
            var remain = dist % 1000;
            if(remain >= 100) {
                remain = Math.floor(remain / 100) * 0.1;
                iDis += remain;
            }
            str = iDis.toString() + "公里";
        } else {
            str = dist.toString() + "米";
        }

        return str;
    },

    NumValueToString:function (num, bval) {

        if (num > 9999 * 10000) {
            return "";
        }

        var bHaveH = false;
        if(arguments.length == 2){
            bHaveH = bval;
        }

        var acText = [], //字符串数组
            units = "",  //单位
            minNum = 100;

        if (num >= 10000) {//如果大于万值
            minNum = 10000;
            units = "万";
        } else if (num >= 1000) {//如果大于千值
            minNum = 1000;
            units = "千";
        } else if (num >= 100) {//如果大于百值
            minNum = 100;
            units = "百";
        } else if (num > 10) {//如果大于十值
            minNum = 10;
            units = "十";
        } else {
            minNum = 1;
        }

        var intPartCount = Math.floor(num / minNum);    //转换后的取整数值
        // 首位用“两”代替“二”  , 但首位是十位时不替换
        if (intPartCount == 2 && !bHaveH && (minNum != 10)) {
            acText.push("两" + units);
        }
        else {
            acText.push(this.NumberToChar(intPartCount) + units);
        }

        // 非首尾位置为0值，需播报一次“零” 如一千零五（十）
        var remainderCount = num - intPartCount * minNum;//取整后剩余值

        if(remainderCount > 0){
            // 非首尾位置为0值，需播报一次“零” 如一千零五（十）
            if (remainderCount < minNum / 10) {
                acText.push("零");
            }
            acText.push(this.NumValueToString(remainderCount, true));
        }
        return acText.join("");
    },

    NumberToChar:function (dwNum) {
        var s = "";
        switch (dwNum) {
            case 0:
                s = "零";
                break;
            case 1:
                s = "一";
                break;
            case 2:
                s = "二";
                break;
            case 3:
                s = "三";
                break;
            case 4:
                s = "四";
                break;
            case 5:
                s = "五";
                break;
            case 6:
                s = "六";
                break;
            case 7:
                s = "七";
                break;
            case 8:
                s = "八";
                break;
            case 9:
                s = "九";
                break;
            case 10:
                s = "十";
                break;
            default:
                s = "";
                break;
        }
        return s;
    },

    
    /// 判断短路段剩余距离是否可以播报
    
    /// <param name="iCurGradNo"></param>
    /// <returns></returns>
    isNeedPlayLongRoad:function (nGrad) {
        var dwLongDist = 0;
        if (nGrad == MRoute.RoadClass.RoadClass_Freeway) {
            dwLongDist = 35000;
        }
        else if (nGrad == MRoute.RoadClass.RoadClass_National_Road) {
            dwLongDist = 15000;
        }
        else {
            dwLongDist = 5000;
        }

        return dwLongDist < this.naviInfor.nSegRemainDist;



    },

    /**
     * 播放声音，播报后清空播报内容，以便下次播报
     */
    flushNaviSound:function () {
        if (this.m_wStrTTSBufer == null || this.m_wStrTTSBufer.length == 0) {
            return;
        }
        //this.m_pstVoiceManager.RealTimePlay(this.m_wStrTTSBufer, MRoute.PlayVoiceLeve.PlayVoiceLeve_DGNavi);
        // 通知FrameForDG ，后者又通知到FrameForTBT播放
        this.m_pstFrame.PlayNaviSound(this.m_wStrTTSBufer);
        this.m_wStrTTSBufer = "";
    }

});

MRoute.SAPABuffer = Class({
	/// <summary>
	/// 电子眼Buffer空间区域
	/// </summary>
	m_astItemList : [],
    m_dwStartIndex :0,
    SAPA_BUFFER_SIZE:4,
			
	/// <summary>
	/// Buffer中最后一个电子眼的导航段号
	/// </summary>
	m_dwEndSegNo:0,					
	/// <summary>
	/// Buffer中最后一个电子眼在她导航段中的编号
	/// </summary>
	m_dwEndLinkNo:0,
    m_bCollectEnd:false,
    m_dwTotal:0,

	"initialize":function(){
        for(var i = 0; i< this.SAPA_BUFFER_SIZE ;i++){
            var item = new MRoute.SAPAItem();
            this.m_astItemList.push(item);
        }
	},
	Clear:function(){
        this.m_dwTotal = 0;
		this.m_dwEndSegNo = 0;
		this.m_dwEndLinkNo = 0;
        this.m_dwStartIndex = 0;
        this.m_bCollectEnd = false;

        for(var i = 0; i < this.SAPA_BUFFER_SIZE ;i++){
            this.m_astItemList[i].clear();
        }
	}
});

MRoute.SAPAItem = Class({
	/// <summary>
	/// 服务区所在的导航段号
	/// </summary>
	m_dwSegeNo:0,	
	/// <summary>
	/// 服务区距离所在导航段结束点的距离
	/// </summary>
	m_dwDistance:0,
	/// <summary>
	/// 服务区的位置
	/// </summary>
	//m_stLocation:{},
	/// <summary>
	/// 服务区播放状态
	/// </summary>
	m_ePlayed:0,	

	"initialize":function(){
		
	},
    clear:function(){
        this.m_dwSegeNo = 0;
        this.m_dwDistance = 0;
        this.m_ePlayed = 0;
    }

});

MRoute.VPLocation = Class({

    dLon:0,                                    //  当前自车经度
    dLat:0,                                    //  当前自车纬度
    nAngle:0,                                  // 当前车辆的方向
	nSpeed:0,                                  // 当前自车速度

    nValid:0,                                  // GPS是否有效
    nSegId:0,                                  // 当前自车所在导航段
	nPtId:0,                                   // 当前自车所在形状点
    eState:0,                                  // 当前自车状态
    eFormWay:0,                                // 当前自车所在Link的FormWay
	eRoadClass:0,                              // 但前自车所在Link的RoadClass

    "initialize":function(){

    },
	// 克隆, 最好不包含引用对象，否则修改克隆体，被克隆者也发生改变
	Clone:function(){
		var vp = new MRoute.VPLocation();
		for(var i in this){
			if(typeof(i)!="function"){
				vp[i] = this[i];
			}
		}
		return vp;
	},

    getInfo:function(){
        var info = new Object();
        info["dLon"] = this.dLon;
        info["dLat"] = this.dLat;
        info["nAngle"] = this.nAngle;
        info["nSpeed"] = this.nSpeed;
//        info["nValid"] = this.nValid;
//        info["nSegId"] = this.nSegId;
//        info["nPtId"] = this.nPtId;
//        info["eState"] = this.eState;
//        info["eFormWay"] = this.eFormWay;
//        info["eRoadClass"] = this.eRoadClass;
        return info;
    }


});

MRoute.PalyToken = Class({
	/// <summary>
	/// 主要动作是否播报
	/// </summary>
	m_bMainActToken:true,
	/// <summary>
	/// 辅助动作是否播报
	/// </summary>
	m_bAssiActToken:true,
	/// <summary>
	/// 近接动作是否播报
	/// </summary>
	m_bProximityToken:true,
	/// <summary>
	/// 方面名称是否播报
	/// </summary>
	m_bTargetInfoToken:true,
		
	"initialize":function(){
		
	}
});

MRoute.CFrameForDG = Class({
    m_pstFrame:null,
	
	"initialize":function(pstFrame){
		this.m_pstFrame = pstFrame;
	},

	UpdateNaviInfor:function(dgInfo, linkRemain){
		this.m_pstFrame.m_pstFrame["UpdateNaviInfor"](dgInfo.getInfo());

        this.m_pstFrame.OnDGNaviInfoChanged(dgInfo, linkRemain);

	},

	EndEmulatorNavi:function(){
        this.m_pstFrame["StopEmulatorNavi"]();
		this.m_pstFrame.m_pstFrame["EndEmulatorNavi"]();
	},

	ArriveWay:function(nSegID){
        this.m_pstFrame.OnArriveWay(nSegID);
	},

    _parseInfo_:function(info){
        var arrData = [], curLane;
        for(var i = 0; i < 8; i++){
            curLane = (info>>(4*i)) & 0xf;
            if( 15 == curLane ){
                break;
            }
            else if( 13 == curLane )
            {
                curLane = 0;
            }
            else if( 14 == curLane )
            {
                curLane = 11;
            }
            arrData[i] = curLane;
        }
        return arrData;
    },

	ShowLaneInfo:function(dwBackInfo, dwSelectInfo){

        if( 0xffffffff == dwBackInfo  || 0 == dwBackInfo || 0 == dwSelectInfo)
        {
            return;
        }

        var arrBackInfo = this._parseInfo_(dwBackInfo);
        var arrSelInfo  = this._parseInfo_(dwSelectInfo);
        if(arrBackInfo.length == 0 || arrSelInfo.length == 0){
            return;
        }

        var arrSelFinal = [], firstSel = arrSelInfo[0];

        if(firstSel == 2 || firstSel == 4 || firstSel == 6 || firstSel == 7
            || firstSel == 9 || firstSel == 10 || firstSel == 11 || firstSel == 12 ){
            return ;  // 禁止原始选中状态为复杂车线
        }

        for(var k = 0; k < arrSelInfo.length; k++){
            if(firstSel != arrSelInfo[k]){
                return; // 选择不同，出错返回
            }
        }

        var bFound = false;
        for(var i = 0; i < arrBackInfo.length ;i++){
            if(arrBackInfo[i] == firstSel){
                break;
            }
            switch(arrBackInfo[i]){
                case 2:
                    if(0 == firstSel || 1 == firstSel){
                        bFound = true;
                    }
                    break;
                case 4:
                    if(0 == firstSel || 3 == firstSel){
                        bFound = true;
                    }
                    break;
                case 6:
                    if(1 == firstSel || 3 == firstSel){
                        bFound = true;
                    }
                    break;
                case 7:
                    if(0 == firstSel || 1 == firstSel || 3 == firstSel){
                        bFound = true;
                    }
                    break;
                case 9:
                    if(0 == firstSel || 5 == firstSel){
                        bFound = true;
                    }
                    break;
                case 10:
                    if(0 == firstSel || 8 == firstSel){
                        bFound = true;
                    }
                    break;
                case 11:
                    if(1 == firstSel || 5 == firstSel){
                        bFound = true;
                    }
                    break;
                case 12:
                    if(3 == firstSel || 5 == firstSel){
                        bFound = true;
                    }
                    break;
                default :
                    break;
            }

            if(bFound) break;

            arrSelFinal[i] = 15;
        }

        if(i < arrBackInfo.length){
            for(var j = 0; j < arrSelInfo.length; j++){
                arrSelFinal[i+j] = arrSelInfo[j];
            }

            // 保持数组长度一致
            while(arrSelFinal.length < arrBackInfo.length){
                arrSelFinal[arrSelFinal.length] = 15;
            }
            while(arrBackInfo.length < arrSelFinal.length){
                arrBackInfo[arrBackInfo.length] = 15;
            }
        }

		this.m_pstFrame.m_pstFrame["ShowLaneInfo"](arrBackInfo, arrSelFinal);
	},

	HideLaneInfo:function(){
		this.m_pstFrame.m_pstFrame["HideLaneInfo"]();
	},

	ShowCross:function(backId, foreId, segRemainDist){
		this.m_pstFrame.m_pstFrame["ShowCross"](backId, foreId, segRemainDist);
	},

    CrossRequest:function(arrBack, arrFore, arrSegId){
        this.m_pstFrame.m_pstFrame["CrossRequest"](arrBack, arrFore, arrSegId);
    },

	HideCross:function(){
		this.m_pstFrame.m_pstFrame["HideCross"]();
	},

	GetGPSIsValid:function(){
		return this.m_pstFrame.m_NaviStatus.GetValidGPS();
	},

	GetRouteType:function(){
        return this.m_pstFrame.m_NaviStatus.GetRouteCalcType();
	},

    GetCarSpeed:function(){
        //need discuss
        return this.m_pstFrame.OnGetCarSpeed();
    },

	PrepareVoice:function(){
	   // throw new NotImplementedException();
	},

	PlayNaviSound:function(strSound){
		this.m_pstFrame.m_pstFrame["PlayNaviSound"](0, strSound);
		return 0;
	}

});

MRoute.CVoiceManager = Class({
    m_pstFrame:null,
    m_dwVoiceStartTime:0,
    m_dwVoiceNeedTime:0,
    m_iPlayOneWordTime:50,

    "initialize":function(pstFrame){
        this.m_pstFrame = pstFrame;
    },

    SetPlayOneWordUseTime:function(nVal){
        this.m_iPlayOneWordTime = nVal;
    },

    RealTimePlay:function(eLevel, strSound){
        if(this.m_pstFrame)
        {
            var date = new Date();
            var dwCurTime = date.getTime();
            var len = strSound.length;
            // 上一条声音已播报完毕，可立即播报
            if((dwCurTime - this.m_dwVoiceStartTime) > this.m_dwVoiceNeedTime)
            {
                this.m_dwVoiceNeedTime = 0;
                this.m_dwVoiceStartTime = dwCurTime;
            }
//            else{
//                // 等上条播报完一秒后在播
//                var remainTime = this.m_dwVoiceNeedTime + this.m_dwVoiceStartTime - dwCurTime + 1000;
//            }
            this.m_dwVoiceNeedTime += len * this.m_iPlayOneWordTime;
            this.m_pstFrame.m_pstFrame["PlayNaviSound"](eLevel, strSound);

            return true;
        }

        return false;

    },

    GetRemainTime:function(){
        if(this.m_dwVoiceStartTime == 0)
        {
            return 0;
        }
        else
        {
            var date = new Date();
            var dwCurTime = date.getTime();
            if(dwCurTime - this.m_dwVoiceStartTime > this.m_dwVoiceNeedTime)
            {
                return 0;
            }
            else
            {
                return this.m_dwVoiceNeedTime - (dwCurTime - this.m_dwVoiceStartTime);
            }
        }
    },

    GetNoVoiceTime:function(){

        var date = new Date();
        var dwCurTime = date.getTime();
        if(this.m_dwVoiceStartTime == 0)
        {
            return dwCurTime;
        }
        else
        {
            if(dwCurTime - this.m_dwVoiceStartTime > this.m_dwVoiceNeedTime)
            {
                return (dwCurTime - this.m_dwVoiceStartTime) - this.m_dwVoiceNeedTime;
            }
            else
            {
                return 0;
            }
        }
    }

});

MRoute.CFrameForVP = Class({
	m_pstFrame:null,

	
	"initialize":function(){
	
	},
	
	CFrameForVP:function(pstFrame){
		this.m_pstFrame = pstFrame;
	},

	VehiclePositionChange:function(){
		//throw new NotImplementedException();
	},

    GetGpsList:function()
    {

    },

	SwitchRoad:function(bSwitch){
		//throw new NotImplementedException();
	},

	Reroute:function(){
		//throw new NotImplementedException();
	},

	GetIsCanMM:function(){
		//throw new NotImplementedException();
	},

	GetNaviLocation:function(stLocation){
		//throw new NotImplementedException();
	},

	GetLogKey:function(){
		//throw new NotImplementedException();
	},

	UpdatePCD:function(pData){
		//throw new NotImplementedException();
	}
});

MRoute.CNaviStatus = Class({

    m_iGPSGeoX:0, //GPS坐标X
    m_iGPSGeoY:0, //GPS坐标Y
    m_iTotalRouteDist:0,
    m_iTotalRemainDist:0, //总剩余里程
    m_iTotalRemainTime:0, //总估计剩余时间
    m_iSegmentNo:0, //当前段号
    m_iSegmentRemainDist:0, //分段剩余里程
    m_iSegmentRemainTime:0,
    m_iSimNaviSpeed:0, //模拟导航速度:0, 单位为米/秒
    m_iPlayOneWordUseTime:0, //播报每个字需要的时间:0, 单位为毫秒/字
    m_bStartEmulator:false, //是否开始模拟导航
    m_bStartNavi:false, //是否开始实际导航
    m_bPauseDG:false, // 是否暂停DG
    m_bValid:false, // GPS是否有效
    m_bSwitchMapStatus:false, //切换主辅路的状态
    m_bIsDTReady:false, //记录动态信息是否已经下
    m_bDrawDt:false, //是否绘制动态交通信息
    m_bTrafficRadio:false, //移动交通台功能
    m_bVoicePrompt:false, /// 语音提示 TRUE为详细提示，FALSE为简洁提示。默认值为FALSE
    m_bEleyePrompt:false, //电子眼提示  TRUE为提示，FALSE为不提示。默认值为TRUE
    m_bNetConnect:false, //网络是否连接  TRUE为连接，FALSE为未连接
    m_CalcRouteType:0,
    m_cNearRoad:"", //匹配的道路名称(导航过程中记载当前到道路的名称)
    m_cNextRoad:"", //导航过程中下一条道路的名称


    "initialize":function () {
        this.ResetAllMapStatus();
    },

    ResetAllMapStatus:function () {
        this.m_iGPSGeoX = 116.288948; // GPS坐标X
        this.m_iGPSGeoY = 39.983688; // GPS坐标Y

        this.m_iTotalRouteDist = 0; // 路径总里程
        this.m_iTotalRemainDist = 0; // 总的剩余里程
        this.m_iTotalRemainTime = 0; // 总的估计剩余时间

        this.m_iSegmentNo = -1; // 当前段号
        this.m_iSegmentRemainDist = 0;  //分段剩余里程

        this.m_iSimNaviSpeed = 60;
        this.m_iPlayOneWordUseTime = 50;

        this.m_CalcRouteType = MRoute.CalcRouteType.CalcRouteType_NULL;

        this.m_bStartEmulator = false;  //是否开始模拟导航
        this.m_bStartNavi = false;  //是否开始实际导航

        this.m_bPauseDG = false;  // 是否暂停DG

        this.m_bValid = false;  // GPS是否有效

        this.m_bSwitchMapStatus = false;

        this.m_bIsDTReady = false;

        this.m_bDrawDt = true;
        this.m_bTrafficRadio = true;
        this.m_bVoicePrompt = true;
        this.m_bEleyePrompt = true;
        this.m_bNetConnect = false;

        this.m_cNextRoad = "";
        this.m_cNearRoad = "";
    },

    SetGPSGeoX:function (iGPSGeoX) {
        this.m_iGPSGeoX = iGPSGeoX;
    },

    GetGPSGeoX:function () {
        return this.m_iGPSGeoX;
    },

    SetGPSGeoY:function (iGPSGeoY) {
        this.m_iGPSGeoY = iGPSGeoY;
    },

    GetGPSGeoY:function () {
        return this.m_iGPSGeoY;
    },

    SetTotalDist:function (iTotalDist) {
        this.m_iTotalRouteDist = iTotalDist;
    },

    GetTotalDist:function () {
        return this.m_iTotalRouteDist;
    },

    SetTotalRemainDist:function (iTotalRemainDist) {
        this.m_iTotalRemainDist = iTotalRemainDist;
    },

    GetTotalRemainDist:function () {
        return this.m_iTotalRemainDist;
    },

    SetTotalRemainTime:function (iTotalRemainTime) {
        this.m_iTotalRemainTime = iTotalRemainTime;
    },

    SetSegmentRemainTime:function (iSegRemainTime) {
        this.m_iSegmentRemainTime = iSegRemainTime;
    },

    GetSegmentRemainTime:function () {
        return this.m_iSegmentRemainTime;
    },

    GetTotalRemainTime:function () {
        return this.m_iTotalRemainTime;
    },

    SetSegmentRemainDist:function (iSegmentRemainDist) {
        this.m_iSegmentRemainDist = iSegmentRemainDist;
    },

    GetSegmentRemainDist:function () {
        return this.m_iSegmentRemainDist;
    },

    SetSegmentNo:function (iSegmentNo) {
        this.m_iSegmentNo = iSegmentNo;
    },

    GetSegmentNo:function () {
        return this.m_iSegmentNo;
    },

    SetSimNaviSpeed:function (iSimuNaviSpd) {
        if (iSimuNaviSpd > 200) {
            iSimuNaviSpd = 200;
        }
        this.m_iSimNaviSpeed = iSimuNaviSpd;
    },

    GetSimNaviSpeed:function () {
        return this.m_iSimNaviSpeed;
    },

    SetPlayOneWordUseTime:function (iUseTime) {
        this.m_iPlayOneWordUseTime = iUseTime;
    },

    GetPlayOneWordUseTime:function () {
        return this.m_iPlayOneWordUseTime;
    },

    SetValidGPS:function (bValidGPS) {
        this.m_bValid = bValidGPS;
    },

    GetValidGPS:function () {
        return this.m_bValid;
    },

    SetIsStartNavi:function (bStartNavi) {
        this.m_bStartNavi = bStartNavi;
    },

    GetIsStartNavi:function () {
        return this.m_bStartNavi;
    },

    SetIsStartEmulator:function (bStartEmulator) {
        this.m_bStartEmulator = bStartEmulator;
    },

    GetIsStartEmulator:function () {
        return this.m_bStartEmulator;
    },

    SetIsDgPause:function (bPause) {
        this.m_bPauseDG = bPause;
    },

    GetIsDgPause:function () {
        return this.m_bPauseDG;
    },

    SetSwitchRoadStatus:function (bSwitchRoadStatus) {
        this.m_bSwitchMapStatus = bSwitchRoadStatus;
    },

    GetSwitchRoadStatus:function () {
        return this.m_bSwitchMapStatus;
    },

    SetDTReady:function (bIsReady) {
        this.m_bIsDTReady = bIsReady;
    },

    GetDTReady:function () {
        return this.m_bIsDTReady;
    },

    SetDrawDt:function (bDrawDt) {
        this.m_bDrawDt = bDrawDt;
    },

    GetDrawDt:function () {
        return this.m_bDrawDt;
    },

    SetPlayTrafficRadio:function (bTrafficRadio) {
        this.m_bTrafficRadio = bTrafficRadio;
    },

    GetPlayTrafficRadio:function () {
        return this.m_bTrafficRadio;
    },

    SetVoicePrompt:function (btVoicePromt) {
        this.m_bVoicePrompt = btVoicePromt;
    },

    GetVoicePrompt:function () {
        return this.m_bVoicePrompt;
    },

    SetEleyePrompt:function (btEleyePrompt) {
        this.m_bEleyePrompt = btEleyePrompt;
    },

    GetEleyePrompt:function () {
        return this.m_bEleyePrompt;
    },

    SetNetStatus:function (bNetStatus) {
        this.m_bNetConnect = bNetStatus;
    },

    GetNetStatus:function () {
        return this.m_bNetConnect;
    },

    SetRouteCalcType:function (eCalcRouteType) {
        this.m_CalcRouteType = eCalcRouteType;
    },

    GetRouteCalcType:function () {
        return this.m_CalcRouteType;
    },

    SetNearRoad:function (pNearRoad) {
        this.m_cNearRoad = pNearRoad;
    },

    GetNearRoad:function () {
        return this.m_cNearRoad;
    },

    SetNextRoad:function (pNextRoad) {
        this.m_cNextRoad = pNextRoad;
    },

    GetNextRoad:function () {
        return this.m_cNextRoad;
    }
});

MRoute.RouteManager = Class({

    Paths:null,         //所有路径
    selectId:-1,
    navigateId:-1,
    "initialize":function(){
    },

    getRoutes:function(){
        return this.Paths;
    },

    getRouteNum:function(){
        if(this.Paths != null){
            return this.Paths.length;
        }
        return 0;
    },

    setRoutes:function(Paths){
        this.Paths = Paths;
        // 默认选中首条路径
        if(Paths != null && Paths.length > 0){
            this.selectId = 0;
        }
        else{
            this.selectId = -1;
        }

        this.navigateId = -1;
    },

    selectRoute:function(iRouteType){
        if (this.Paths != null && this.Paths.length > 0) {

            for (var i = 0; i < this.Paths.length; i++) {
                if (this.Paths[i].getStrategy() == iRouteType) {
                    this.selectId = i;
                    break;
                }
            }

            // 没找到对应路径 , 设为首条路径
            if(this.selectId < 0){
                this.selectId = 0;
            }
        }

        return this.getSelectRoute();
    },

    getSelectIndex:function(){
        return this.selectId;
    },

    getSelectRoute:function(){
        if(this.selectId >= 0){
            return this.Paths[this.selectId];
        }

        return null;
    },

    getNavigateIndex:function(){
        return this.navigateId;
    },

    getNaviRoute:function(){
        if(this.navigateId >= 0){
            return this.Paths[this.navigateId];
        }

        return null;
    },

    setNaviRoute:function(){
        if(this.selectId >= 0){
            this.navigateId = this.selectId;
        }
        else if(this.Paths != null && this.Paths.length > 0){
            this.navigateId = 0;
        }

        if(this.navigateId >= 0){
            return this.Paths[this.navigateId];
        }

        return this.getNaviRoute();
    }
});

MRoute.JsTMC = Class({


    pathManager:null,
    selectId:-1,
    selectPath:null,    // 当前选择路径
    carLon:0,           // 当前车位
    carLat:0,

    distList:[],        // 当前选择路径 locationCode 对应路段长度
    segmentStartId:[],  // 当前选择路径 各分段首个locationCode 对应的编号

    pathStartId:[],
    wholeCodeList:[],   // 全部路径locationCode列表
    wholeStateList:[],  // locationCode 对应路况

    timer:null,         // 触发计时器
    m_pstFrame:null,    // 外部支持类


    "initialize":function(pstFrame, manager){
        this.m_pstFrame = pstFrame;
        this.pathManager = manager;
    },


    routeUpdate:function(){
        // 重置路径
        this.selectId = -1;
        var paths = this.pathManager.getRoutes(),
            whList = [];

        if(paths != null && paths.length > 0){
            for(var i = 0; i < paths.length; i++){
                var res = paths[i].getLocCodeList();
                this.pathStartId[i] = whList.length;
                if(whList.length == 0){
                    whList = res[0];
                }
                else{
                    whList = whList.concat(res[0]);
                }
            }
        }
        this.wholeCodeList = whList;
        this.wholeStateList = [];
        if(paths != null){
            this.netRequest();
//            TestInfoLog("TBT-TMC-routeUpdate-code list:" + whList.toString());
        }

    },

    setCarLoc:function(x,y){
        this.carLon = x;
        this.carLat = y;
    },

    netRequest:function(){
        if(!this.m_pstFrame.m_NaviStatus.GetDrawDt()){
            return ;
        }

        // need supply 暂停导航时是否不必要更新tmc信息
        var codeList = this.wholeCodeList;
        if(codeList != null && codeList.length > 0){

            var url = "http://211.151.71.28:8888/trafficinfo.php";
            url += "?locs=";

            var bNext = false, num = 0;
            for(var i = 0; i < codeList.length;i++){
                // 只查询非0的locationCode对应路况
                if(codeList[i] != 0){
                    num++;
                    if(bNext){
                        url += ",";
                    }
                    url += codeList[i];
                    bNext = true;
                }
            }

            if(num == 0){// 防范整条路径都没有locationCode
                this.m_pstFrame.OnTMCReceived();
                return;
            }
            url += "&x=" + this.carLon + "&y=" + this.carLat;

            //发送请求
            this.m_pstFrame.OnNetRequest(2, url, null, null, true);
        }
    },

    isRouteBlocked:function(segId, segRemainDist){

        var naviId = this.pathManager.getNavigateIndex(),
            naviPath = this.pathManager.getNaviRoute();

        if(naviPath == null){
            return false;
        }

        var res = naviPath.getLocCodeList(),
            codeList = res[0],
            sId = res[2][segId],
            stateList = [],
            startId = this.pathStartId[naviId],
            endId = this.wholeStateList.length;
        if(naviId+1 < this.pathManager.getRouteNum()){
            endId = this.pathStartId[naviId+1];
        }

        // codeList 和 stateList等长
        for(var i = startId, id = 0; i < endId; i++, id++){
            stateList[id] = this.wholeStateList[i];
        }

        return naviPath.isRouteBlocked(segId, segRemainDist, sId, codeList, stateList);

    },

    isNavigate:function(){
        return this.m_pstFrame.IsNavigate();
    },

    receiveNetData:function(dataStream){

        var bSuc = this._decode_(dataStream);

        // 不论是否解析成功，都通知外部tmc数据已准备好，避免无tmc信息时无法告知外部路径已准备好
        this.m_pstFrame.OnTMCReceived();

        if(bSuc){
            this.m_pstFrame.OnTMCUpdate();
        }
        return bSuc;
    },

    getRoadStatus:function(locCode){
        for(var i = 0; i < this.wholeCodeList.length; i++){
            if(locCode == this.wholeCodeList[i])
            {
                return this.wholeStateList[i];
            }
        }
        return 0;
    },

    _updateSelect_:function(){
        this.selectId = this.pathManager.getSelectIndex();
        this.selectPath = this.pathManager.getSelectRoute();
        if(this.selectPath != null){
            var res = this.selectPath.getLocCodeList();
            this.distList  = res[1];
            this.segmentStartId = res[2];
        }
    },

    /**
     * 获取创建光柱所需信息
     * @param iStart        到路径起点的距离
     * @param len           要获取路况的路段长度
     * @return {Array, Array}      各段长度列表，各段路况列表
     */
    createTMCBar:function(iStart, len){

        var distList = [], stateList = [];

        // 状态数据是否查询到了
        if(!this.wholeStateList || this.wholeStateList.length == 0){
            TestInfoLog("TBT-TMC-createTMCBar: no state data!");
            return [distList,stateList];
        }

        if(this.selectId != this.pathManager.getSelectIndex()){
            this._updateSelect_();
        }

        if(this.selectPath != null){

            // 范围修正，限制在路长范围内
            var routeDist = this.selectPath.getDistance();
            if(iStart < 0){
                iStart = 0;
            }
            else if(iStart >= routeDist ){
                //TestInfoLog("TBT-TMC-createTMCBar: start location error!");
                iStart = routeDist - 1;
            }

            if(len < 0 || len + iStart > routeDist){
                len = routeDist - iStart;
            }

            var offset = this.pathStartId[this.selectId];
            var num = this.distList.length;
            if(this.wholeStateList.length > offset){

                var left = iStart,
                    segId = 0;
                //求当前导航段编号
                var segs = this.selectPath.getSegments();
                while(left > 0){
                    var segDist = segs[segId].getDistance();
                    if(left < segDist){
                        break;
                    }
                    left -= segDist;
                    segId++;
                }

                var i = this.segmentStartId[segId],
                    dist = 0;
                while(left > 0){
                    if(left < this.distList[i]){
                        dist = this.distList[i] - left;
                        distList.push(dist);
                        stateList.push(this.wholeStateList[i+offset]);
                        i++;
                        break;
                    }
                    left -= this.distList[i];
                    i++;
                }

                while(dist < len && i < num){
                    distList.push(this.distList[i]);
                    stateList.push(this.wholeStateList[i+offset]);
                    dist += this.distList[i];
                    i++;
                }

                if(dist > len){
                    var lastId = distList.length - 1;
                    distList[lastId] -= dist - len;
                }
            }
        }

        return [distList, stateList];
    },


    _decode_:function(data){

        if(data == null || data.length == 0){
            return false;
        }

        var arrStr = data.split(","),
            listLen = this.wholeCodeList.length,
            len = Math.min(arrStr.length, listLen),
            badNum = 0,
            arrVal = [];
        for(var k = 0; k < arrStr.length; k++){
            arrVal[k] = Number(arrStr[k]);
            if(isNaN(arrVal[k])){
                arrVal[k] = 0;
            }
            if(arrVal[k] == 0){
                badNum++;
            }
        }

        if(badNum*2 > arrStr.length){
            return false;
        }


        k = 0;
        this.wholeStateList = new Array(listLen);
        for(var i = 0; i < listLen; i++)
        {
            // locationCode 为0的直接赋0，其他的沿用查询结果
            if(this.wholeCodeList[i] == 0){
                this.wholeStateList[i] = 0;
            }
            else{
                this.wholeStateList[i] = arrVal[k];
                k++;

                // 剩余路段locationCode为0,未查询其状态
                if(k == len){
                    i++;
                    break;
                }
            }

        }

        for(; i < listLen; i++){
            this.wholeStateList[i] = 0;
        }

        return true;
    },

//    setNetRequestState:function(eState){
//
//    },

    start:function(){
        if(this.timer!= null){
            this.stop();
        }

        var self = this;
        this.timer = window.setInterval(function(){
            if(self.isNavigate()){
                self.netRequest();
            }

        }, 120000); //1000*60*2

    },

    stop:function(){
        if(this.timer){
            window.clearInterval(this.timer);
            this.timer = null;
        }
    }


});
MRoute.ProbeInfo = Class({
    BJYear:0, // GPS(BJ)时间－－年
    BJMonth:0, // GPS(BJ)时间－－月
    BJDay:0, // GPS(BJ)时间－－日
    BJHour:0, // GPS(BJ)时间－－时
    BJMinute:0, // GPS(BJ)时间－－分
    BJSecond:0, // GPS(BJ)时间－－秒

    GpsLat:0, // 纬度, 单位度 (正值为北纬, 负值为南纬)
    GpsLon:0, // 经度, 单位度 (正值为东经, 负值为西经)
    Speed:0, // 速度, 单位千米/时
    Angle:0, // 方向角, 单位度

    MatchLat:0,             // VP 匹配经纬度， 单位同上面的GPS经纬度是一致的
    MatchLon:0,

    nReliable:0,       // VP 匹配结果
    bIsEndLinkOfSeg:false, // 匹配link是否是当前导航段的最后一个link
    ucSegNaviAction:0,           // 当前导航段的导航段的动作

    "initialize":function () {

    },

    getDayTime:function(){
        return this.BJHour * 3600 + this.BJMinute * 60 + this.BJSecond;
    },

    match:function(info){
        if(Math.round(this.GpsLat* CoordFactor) == Math.round(info.GpsLat*CoordFactor)
            && Math.round(this.GpsLon * CoordFactor) == Math.round(info.GpsLon*CoordFactor)
            && Math.round(this.Angle*1000) == Math.round(info.Angle*1000)){
            return true;
        }
        return false;
    }
});

function uIntToStr(dwVal){
    var str = String.fromCharCode((dwVal & 0xFF000000) >>> 24);
    str += String.fromCharCode((dwVal&0x00FF0000)>>>16);
    str += String.fromCharCode((dwVal&0x0000FF00)>>>8);
    str += String.fromCharCode(dwVal&0x000000FF);
    return str;
}

function strToUInt(str){
    if(!str || str.length != 4){
        return 0;
    }
    return str.charCodeAt(0) * 0x1000000
        + str.charCodeAt(1) * 0x10000
        + str.charCodeAt(2) * 0x100
        + str.charCodeAt(3);
}

function uShortToStr(dwVal){
    var str = String.fromCharCode((dwVal&0x0000FF00)>>> 8);
    str += String.fromCharCode(dwVal&0x000000FF);
    return str;
}

function strToUShort(str){
    if(!str || str.length != 4){
        return 0;
    }
    return str.charCodeAt(0) * 256
        + str.charCodeAt(1);
}

function uLong64ToStr(llVal){
    var val = 0x100000000,
        high = Number((llVal / val).toFixed(0)),
        low = llVal % val;

    return uIntToStr(high) + uIntToStr(low);
}

var PROBE_VERSION= 1;
var CoFactor = 3600*256;
var GPS_INDEX_LIST_MAX = 39;
var TURNING_GPS_MAX=21;

MRoute.ProbeManager = Class({

    m_ip:0xac15025e, //服务器IP
    m_port:6901, //服务器端口
    m_idmode:1, // 0: 使用本地配置ID， 1： 使用健全后的ValidID；
    m_naviflag:0, //有路径才上传位置。 0：都上传、1：有路径才上传。
    m_frequency:60, //上传频率。[1 - 120 秒]

    m_pValidID:"00000000",

    // sample data
    m_pGpsArray:[],
    m_pSampleIndexList:[],
    m_GPSPosArrayForTurningJudge:[], // sample gps pos for turning judge

    m_State:0,  // state infor
    m_bNodeSign:false,
    m_bNavigation:false, // flag if VP match CCP to route

    m_eProbeResult:null,
    m_pData:null,

    m_TrafficRadio:null,

    "initialize":function(trafficRadio){
        this.m_TrafficRadio = trafficRadio;
        this.m_frequency = 60;
        this.m_pGpsArray = [];
    },

    SetUUID:function(uuid){
        this.m_pValidID = uuid;
    },

    SetSampleFrequency:function(freq){
        if(freq > 0){
            this.m_frequency = freq;
            var len = this.m_pGpsArray.length;
            if(len > freq){
                this.m_pGpsArray = this.m_pGpsArray.slice(0, len-freq);
            }
        }
    },



    GetProbePackageData:function(){
        var len = this.m_pGpsArray.length;
        if(len > 0){
            this._extractSample_();
            var listLen = this.m_pSampleIndexList.length,
                lastId = this.m_pSampleIndexList[listLen-1];
            this._setCarState_(this.m_pGpsArray[lastId]);
            // only sample 255B for latest 39 items
            var start = 0;
            if(listLen > GPS_INDEX_LIST_MAX){
                start = listLen - GPS_INDEX_LIST_MAX;
            }

            this.m_pData = this._probeInfoPacked_(start, listLen-1);
        }

        return null;

    },

    ProbeProc:function(probeInfo){
        if(this._probeInfoAnalyse_(probeInfo)){
            if(this._trigger_()){
                this._probeProcSub_();
                return true;
            }
        }
        return false;
    },

    _probeProcSub_:function(){
        // filter sample by speed
        this._extractSample_();

        var len = this.m_pSampleIndexList.length;

        if(len > GPS_INDEX_LIST_MAX){
            //	total data size of GPS_INDEX_LIST_MAX  items is bigger than 255B
            var packLen = 0;
            while(packLen < len){
                var start = packLen,
                    end = 0,
                    cutId;
                if(len - packLen > GPS_INDEX_LIST_MAX){
                    end = packLen + GPS_INDEX_LIST_MAX-1;
                }
                else {
                    end = len -1;
                }
                cutId = this.m_pSampleIndexList[end];

                this._setCarState_(this.m_pGpsArray[cutId]);
                this._probeInfoPacked_(start,end);

                // send by udp protocol
                this._probeInfoSendToSvr_();

                packLen += GPS_INDEX_LIST_MAX;
            }
        }
        else {
            this._setCarState_(this.m_pGpsArray[len-1]);
            this._probeInfoPacked_(0,len-1);

            // send by udp protocol
            this._probeInfoSendToSvr_();
        }

        this._probeInit_();

    },



    _probeInfoAnalyse_:function(probeInfo){
        var len = this.m_pGpsArray.length;
        if(len < this.m_frequency){
            if(len > 0 && probeInfo.match(this.m_pGpsArray[len-1])){
                return false;
            }

            if(probeInfo.speed > 127){
                probeInfo.speed = 127;
            }

            this.m_pGpsArray.push(probeInfo);
            if(probeInfo.speed > 7){
                this.m_GPSPosArrayForTurningJudge.push({x:probeInfo.GpsLon,y:probeInfo.GpsLat});

                if(this.m_GPSPosArrayForTurningJudge.length > 2 * TURNING_GPS_MAX){
                    this.m_GPSPosArrayForTurningJudge.splice(0,TURNING_GPS_MAX);
                }
            }
            return true;
        }
        return false;
    },

    _extractSample_:function(){
        var idList = [0],
            posArr = this.m_pGpsArray,
            posLen = posArr.length;
        this.m_pSampleIndexList = idList;

        if(posLen > 1){
            for(var i = 1; i < posLen-1; i++){
                var curSpeed = posArr[i].nSpeed,
                    preSpeed = posArr[i-1].nSpeed,
                    nextSpeed = posArr[i+1].nSpeed,
                    valid = false;

                if(idList.length > posLen-2){
                    break;
                }

                if(curSpeed >= 80 && (preSpeed < 80 || nextSpeed < 80)){
                    valid = true;
                }
                else if(curSpeed >= 40 && (preSpeed < 40 || nextSpeed < 40)){
                    valid = true;
                }
                else if(curSpeed >= 20 && (preSpeed < 20 || nextSpeed < 20)){
                    valid = true;
                }
                else if(curSpeed >= 10 && (preSpeed < 10 || nextSpeed < 10)){
                    valid = true;
                }
                else if(curSpeed >= 5 && (preSpeed < 5 || nextSpeed < 5)){
                    valid = true;
                }
                else{
                    this._reviseSampleIndexList_(i);
                }

                if(valid){
                    idList.push(i);
                }
            }
        }
        idList.push(posLen-1);
    },

    _reviseSampleIndexList_:function(index){
        var end = this.m_pSampleIndexList.length- 1,
            preId = this.m_pSampleIndexList[end];

        if(index - preId > 5){
            this.m_pSampleIndexList.push(index);
        }
        else if(index-preId > 2){
            var deltaX = (this.m_pGpsArray[index].GpsLon - this.m_pGpsArray[preId].GpsLon)*3600000,
                deltaY = (this.m_pGpsArray[index].GpsLat - this.m_pGpsArray[preId].GpsLat)*3600000,
                dist = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
            if(dist > 323.4){
                this.m_pSampleIndexList.push(index);
            }
        }
    },

    _isTurning_:function(){
        var arrPos = this.m_GPSPosArrayForTurningJudge,
            posLen = arrPos.length;
        if(posLen > TURNING_GPS_MAX){
            var dA1 = CalcMathAngle(arrPos[posLen-TURNING_GPS_MAX].x,arrPos[posLen-TURNING_GPS_MAX].y,
                    arrPos[posLen-12].x, arrPos[posLen-12].y),
                dA2 = CalcMathAngle(arrPos[posLen-3].x,arrPos[posLen-3].y,
                    arrPos[posLen-2].x, arrPos[posLen-2].y),
                dA3 = CalcMathAngle(arrPos[posLen-2].x,arrPos[posLen-2].y,
                    arrPos[posLen-1].x, arrPos[posLen-1].y),
                diff1 = this._getDiff_(dA2,dA1),
                diff2 = this._getDiff_(dA3,dA1),
                diff3 = this._getDiff_(dA3,dA2);
            if(diff1 > Math.PI/3 && diff2 > Math.PI/3 && diff3 < Math.PI/4){
                return true;
            }
        }
        return false;
    },

    _getDiff_:function (d1, d2) {
        var diff = Math.abs(d1 - d2);
        if (diff > Math.PI) {
            diff = 2 * Math.PI - diff;
        }
        return diff;
    },

    _trigger_:function(){
        this.m_eProbeResult = MRoute.ProbeResult.ProbeResult_NoGPS;
        var len = this.m_pGpsArray.length;
        if(len > 1){
            var t1 = this.m_pGpsArray[0].getDayTime(),
                t2 = this.m_pGpsArray[len-1].getDayTime(),
                diffTime = t2 - t1;
            if(diffTime < 0){
                diffTime += 3600 * 24;
            }

            if(diffTime > this.m_frequency || len > this.m_frequency){
                this.m_eProbeResult = MRoute.ProbeResult.ProbeResult_Normal;
                this.m_GPSPosArrayForTurningJudge  = [];// reset gps pos list
                return true;
            }
            else if(this._isTurning_()){
                this.m_eProbeResult = MRoute.ProbeResult.ProbeResult_Turning;
                this.m_GPSPosArrayForTurningJudge  = [];
                return true;
            }
        }
        return false;
    },


    //? 如何将有符号数转为伪二进制字符串
    _probeInfoPacked_:function(start, end){

        var strBuf = uShortToStr(this.m_State); // state

        if(this.m_State & 0x80){ //uuid
            strBuf += this.m_pValidID;
        }

        if(this.m_State & 0x1000){
            var angle = Number((this.m_pGpsArray[end].nAngle/2 + 0.5).toFixed(0));
            strBuf += String.fromCharCode(angle);
        }

        /************************** current gps ******************************
         字段		大小（B）		说明						参考类型
         Latitude	4		当前浮动车的地理纬度，单位1/256秒	DWORD
         Longitude	4		当前浮动车的地理经度，单位1/256秒	DWORD
         Time		2		当前GPS采样的北京时间，单位秒		WORD
         Speed		1		当前GPS测位速度，单位km/h			BYTE
         **********************************************************************/
        var info = this.m_pGpsArray[end],
            res = this._formatData_(info),
            lat = res[0],
            lon = res[1],
            time = res[2],
            speed = res[3];

        strBuf += uIntToStr(lat) + uIntToStr(lon);
        // time
        var t1 = (time >= 43200) ? time- 43200 : time;
        strBuf += uShortToStr(t1);
        strBuf += String.fromCharCode(speed);

        // problem: 此处差值可正可负，如何转为字符串？
        /************************* offset gps ***s***************************
         字段		大小（B）		说明					参考类型
         Lat_off		2		GPS采样纬度偏移值，单位1/256秒	INT16
         Long_off	2		GPS采样经度偏移值，单位1/256秒	INT16
         Time_off	1		GPS时间偏移差，单位秒			BYTE
         Speed		1		GPS测位速度						BYTE
         *********************************************************************/
        for(var i = end-1; i >= start; --i){
            var id = this.m_pSampleIndexList[i],
                curRes = this._formatData_(this.m_pGpsArray[id]),
                latOff = curRes[0] - lat,
                lonOff= curRes[1] - lon,
                ttOff = curRes[2] - time,
                curSpeed = curRes[3];
            // omit
            // var tt = (INT8)ttOff;
            if(ttOff < -120){
                continue;
            }
            strBuf += uShortToStr(latOff) + uShortToStr(lonOff);
            strBuf += uShortToStr(ttOff);
            strBuf += String.fromCharCode(curSpeed);
        }

       //首位存储数据包大小
       strBuf = String.fromCharCode(strBuf.length+1) + strBuf;
       return strBuf;

    },

    _formatData_:function(info){
        var lat,
            lon,
            speed,
            time = info.getDayTime();
        // ？ lat ， lon
        if(info.nReliable){
            lat = Number((info.MatchLat*CoFactor).toFixed(0));
            lon = Number((info.MatchLon*CoFactor).toFixed(0));
        }
        else{
            lat = Number((info.GpsLat*CoFactor).toFixed(0));
            lon = Number((info.GpsLon*CoFactor).toFixed(0));
        }

        speed = info.Speed & 0x7f;
        speed |= (info.nReliable << 7) & 0x80;

        return [lat, lon, time, speed];
    },

    _probeInfoSendToSvr_:function(){
        if(this.m_TrafficRadio){
            this.m_TrafficRadio.UpdatePF(this.m_pData, this.m_eProbeResult);
        }
    },

    _setCarState_:function(pos){
        /******************************************************************************
         字段					大小（bit）			说明					参考类型
         State_Exist_ID			1	0x80	表示是否存在ID字段，默认为0
         0：无ID  1：有ID

         State_is_Navi			1	0x40	表示导航状态，默认为0
         0：非导航状态 1：导航状态

         State_is_TrfLgt			1	0x20	表示是否有红绿灯，默认为0
         0：有红绿灯 1：无红绿灯

         State_carriage			2 0x00| 0x08 | 0x10	表示车道位置，默认为00
         00：直行车道
         01：左转车道
         10：右转车道

         State_is_Empty			1	0x04	表示汽车是否空载，默认问0
         0:空载
         1:载客

         State_VP_Reliability	1	0x02	表示匹配可信度
         0：不可信
         1： 可信

         Reserved3				1	0x01	上下午
         ********************************************************************************/

        var state =  (PROBE_VERSION << 8) & 0x0f00; //四位版本号

        state |= 0x80;   // 有VaildID
        state |= 0x1000; // ADD_LAST_ANGLE

        if (pos.BJHour >= 12 )
        {
            state |= 0x1;
        }

        if (!this.m_bNodeSign)
            state |= 0x20;

        // judge the end point reliabe
        if (pos.nReliable)
            state |= 0x2;

        if(pos.nReliable  && pos.bIsEndLinkOfSeg)
        {
            var MA = MRoute.MainAction;
            state |= 0x40; // 是否导航状态
            switch(pos.ucSegNaviAction)
            {
                case MA.MainAction_Turn_Left:
                case MA.MainAction_Slight_Left:
                case MA.MainAction_Turn_Hard_Left:
                case MA.MainAction_UTurn:
                case MA.MainAction_Merge_Left:
                    state |= 0x8;
                    break;
                case MA.MainAction_Turn_Right:
                case MA.MainAction_Slight_Right:
                case MA.MainAction_Turn_Hard_Right:
                case MA.MainAction_Merge_Right:
                    state |= 0x10;
                    break;
                default:
                    // 直行
                    break;
            }
        }

        this.m_State = state;
    },


    _probeInit_:function(){
        this.m_pGpsArray = [];
        this.m_State = 0;
    }

});

MRoute.TrafficRadio = Class({

    m_pstFrame:null,
    naviPath:null,

    m_bIsLoginSuccess:false, // 是否登录成功
    m_bJustReqSuccess:false, // 刚请求成功了态势数据
    m_ePicState:0, // 是否在显示情报板

    m_nPID:0, // 终端打包PCD或fcd数据时使用该ID，使用此ID作为PCD或fcd的上传ID
    m_strPID:"00000000",
    m_bisForce:false, //是否强制请求路况信息
    m_pPFcdBuf:null, //请求路况信息的PCD或FCD数据
    m_pResultBuf:null,

    timer:null,

    m_arrDescription:[],

    m_strAddress:"",
    m_strPinCode:"", // 后台形成的临时PIN码，终端每次请求都必须带此PIN码回来
    m_pstrUsercode:"",
    m_pstrUserbatch:"",
    m_strUserID:"", // 唯一用户标识(DeviceID/SimID/UUID)
    m_strTimeStamp:"", // 结果时机戳
    m_strDescription:"",

    TIME_INTERVAL:300000, // 5分钟timer
    TMC_ROUTE_RANGE:10000, // 经路查找形状点的距离范围
    MIN_DIS_TO_DEST:1000, // 能播报态势的最小距目的地范围(小于此范围不播报态势)
    DIFF_DIS_BETWEEN_POINT:500, // 两次态势播报的最小距离差值

    MAX_DESCRIPTION_NUM:5,


    "initialize":function (pstFrame, strUserCode, strBatch, strDeviceId) {
        this.m_pstFrame = pstFrame;
        this.m_strAddress = "http://211.151.71.28:8888/RouteStatusService/Handle.do?";
        //this.m_strAddress = "http://trafficapp.autonavi.com:8888/RouteStatusService/Handle.do?";
        this.m_pstrUsercode = strUserCode;
        this.m_pstrUserbatch = strBatch;
        this.m_strUserID = strDeviceId;

        this.start();
    },


    /**
     * 设置关联路径，
     * @param path
     */
    SetNaviRoute:function (path) {
        this.naviPath = path;
    },

    /**
     * 请求前方路况播报
     * @param pcdData
     * @param ptList        [I]前方路径的经纬度序列
     * @param bUpload
     * @param bHand
     * @constructor
     */
    RequestTraffic:function (pcdData, ptList, bUpload, bHand) {
        if (!this.m_bIsLoginSuccess) {
            return false;
        }

        if (pcdData == null || pcdData.length == 0) {
            if (this.m_pPFcdBuf == null || this.m_pPFcdBuf.length == 0) {
                return false;
            }
            pcdData = this.m_pPFcdBuf;
        }

        return this.requestTmcStateData(pcdData, ptList, bUpload, bHand);
    },


    /**
     * 设置网络请求状态
     */
//    SetNetRequestState:function (iConnectID, eNetState) {
//
//    },


    /**
     * 解析数据
     * @param iConnectID
     * @param data
     */
    receiveNetData:function (iConnectID, data) {
        if (data == null || data.length == 0) {
            return;
        }

        // 若是压缩数据，先解压，反之直接赋值
        // js版假定已完成解压
        this.m_pResultBuf = "" + data;

        var bRet = false,
            CnID = MRoute.ConnectId;

        switch (iConnectID) {
            case CnID.CONNECTID_TRAFFIC: // 解析前方态势数据
                bRet = this.parseReqDataResult(this.m_pResultBuf);
                if (bRet && this.m_arrDescription.length > 0) {
                    this.playTmcState(this.m_arrDescription);
                }
                break;
            case CnID.CONNECTID_LOGON: // 解析登录结果
                bRet = this.parseLogonResult(this.m_pResultBuf);
                break;
            case CnID.CONNECTID_LOGOFF: // 解析注销结果
                bRet = this.parseLogoffResult(this.m_pResultBuf);
                break;
            case CnID.CONNECTID_PIC:  // 解析概要图数据
                //bRet = this.parseBoardPicResult(this.m_pResultBuf);
                break;
            case CnID.CONNECTID_ROUTE:
                bRet = this.parseRouteTrafficResult(this.m_pResultBuf);
                break;
            default:
                break;
        }
    },

    /**
     * 更新PCD或FCD数据
     * @param data
     * @param result
     */
    UpdatePF:function (data, result) {
        if (data == null || data.length == 0) {
            return;
        }
        this.m_pPFcdBuf = data;
        this.m_bisForce = !!((result == MRoute.ProbeResult.ProbeResult_Turning));

        //通知请求前方路况
        this.m_pstFrame.NoticeRequestTrafficInfo();
    },

    /**
     * 设置请求参数
     * @param x
     * @param y
     * @param iSegNo
     * @param iStartSegLen
     */
    SetTmcReqParam:function (x, y, iSegNo, iStartSegLen) {
        if (this.naviPath == null) {
            return "";
        }

        var dist = 0,
            sList = "",
            segNum = this.naviPath.getSegmentCount();
        for (var i = iSegNo; i < segNum; i++) {
            var curSeg = this.naviPath.getSegmentByID(i);
            if (curSeg != null) {
                var tmcRecords = curSeg.getTmcInfo();
                if (tmcRecords == null || tmcRecords.length == 0) {
                    continue;
                }
                for (var j = 0; j < tmcRecords.length; j++) {
                    dist += tmcRecords[j].getLength();
                    if (i == iSegNo && dist < iStartSegLen) {
                        continue;
                    }
                    var code = tmcRecords[j].getLCode();
                    if (sList.length > 0) {
                        sList += ",";
                    }
                    sList += code.toString();
                    if (dist > 50000) {
                        break;
                    }
                }
            }
            if (dist > 50000) {
                break;
            }
        }

        if (sList.length == 0) {
            return false;
        }

        var size = 180;
        // 写入xml头, type=80表示请求内容中屏蔽items和evaluation元素
        var sParam = "<\?xml version=\"1.0\" encoding=\"gbk\"\?><request>";

        // 写入当前位置x，y
        sParam += "<frontQuery x=\"" + x + "\" y=\"" + y + "\" type=\"80\" descSize =\"" + size + "\"><list>";

        // 写入xml尾
        sParam += sList;
        sParam += "</list></frontQuery></request>";

        return sParam;
    },


    //请求整条路径的态势数据
//    RequestRouteTraffic:function (iGPSGeoX, iGPSGeoY, iSegNo, iStartSegLen) {
//
//    },

    loginFailedCount:0,

    ThreadProc:function () {
        console.log(new Date().getTime()+"ThreadProc be called!");
        this.m_pstFrame.NoticeRequestTrafficInfo();
//        if (!this.m_bIsLoginSuccess) {
//            if (!this.Login()) {
//                this.loginFailedCount++;
//                if (this.loginFailedCount > 10) {
//                    this.stop();
//                }
//            }
//        }
//        else {
//            if (this.m_bJustReqSuccess) {
//                this.m_bJustReqSuccess = false;
//            }
//        }
    },

    start:function () {
        if (this.timer != null) {
            this.stop();
        }

        var self = this;
        this.timer = window.setInterval(function () {
            self.ThreadProc();
        }, 60000); //1000*60*2

    },

    stop:function () {
        if (this.timer) {
            window.clearInterval(this.timer);
            this.timer = null;
        }
    },

    Login:function () {
        if (this.m_bIsLoginSuccess) {
            return;
        }

        var strBuf = this.m_strAddress + "cmdtype=logon&usercode=" + this.m_pstrUsercode;
        strBuf += "&userbatch=";
        strBuf += this.m_pstrUserbatch;
        strBuf += "&deviceid=";
        strBuf += this.m_strUserID;

        this.m_pstFrame.NetRequestHTTP(MRoute.ConnectId.CONNECTID_LOGON, strBuf, null, null, false);
    },

    Logout:function () {
        if (!this.m_bIsLoginSuccess) {
            return true;
        }

        var strBuf = this.m_strAddress + "cmdtype=logout&pincode=" + this.m_strPinCode;

        this.m_pstFrame.NetRequestHTTP(MRoute.ConnectId.CONNECTID_LOGOFF, strBuf, null, null, false);
        return true;
    },

    //判断是否符合请求态势时机，请求态势播报数据
    requestTmcStateData:function (pPcdBuf, ptList, bUpload, bHand) {

        if (pPcdBuf == null || pPcdBuf.length == 0) {
            return false;
        }

        var strBuf,
            bForce = false,
            bReqPic = false,
            bShowPic = this.m_pstFrame.GetShowTrafficPic();
        if (!this.m_pstFrame.GetPlayTrafficVoice() && !bShowPic) {
            bForce = true;
        }

        if (bShowPic
            && this.m_ePicState != MRoute.PicState.Traffic_Pic_Show
            && this.m_ePicState != MRoute.PicState.Traffic_Pic_Change) {
            bReqPic = true;
        }

        strBuf = this.m_strAddress + "cmdtype=trafficinfo&pincode=" + this.m_strPinCode;
        strBuf += "&datatype=1";
        strBuf += "&gpsdata=";

        var strBin = pPcdBuf.substring(0, 3) + this.m_strPID + pPcdBuf.substring(11);
        strBuf += MRoute.Base64.encode(strBin);

//        var  strBase64 = MRoute.Base64.encode(strBin);
//        //urlEncode need supply
//        strBuf += strBase64;

        // 未经压缩
        strBuf += "&compress=0";

        // 预测点列表
        var bHavePt = ptList != null && ptList.length > 0 && (ptList.length % 2 == 0);
        if (bHavePt) {
            strBuf += "&frontcoords=";
            for (var i = 0; i < ptList.length; i++) {
                if (i > 0) {
                    strBuf += ",";
                }
                strBuf += ptList[i].toString();
            }
        }

        // 合成请求标志
        var dwFlag = 0;
        if (bForce || bUpload) {
            dwFlag |= MRoute.RadioFlag.FLAG_FORCE_UPLOAD;
        }
        if (bReqPic) {
            dwFlag |= MRoute.RadioFlag.FLAG_REGION_BOARD;
        }
        if (this.m_bisForce || bHand) {
            dwFlag |= MRoute.RadioFlag.FLAG_NO_FILTER;
        }
        if (bHavePt) {
            dwFlag |= MRoute.RadioFlag.FLAG_ASSIST_ROAD;
        }

        dwFlag |= MRoute.RadioFlag.FLAG_INCIDENT;
        dwFlag |= MRoute.RadioFlag.FLAG_DESCRIPTION;

        strBuf += "&flag=" + dwFlag;

        this.m_pstFrame.NetRequestHTTP(MRoute.ConnectId.CONNECTID_TRAFFIC, strBuf, null, null, false);
        return true;
    },

    //播报当前路况
    playTmcState:function (arrStr) {
        if (!arrStr || arrStr.length == 0) {
            return false;
        }
        if (this.m_pstFrame.GetPlayTrafficVoice()) {
            for (var i = 0; i < arrStr.length; i++) {
                this.m_pstFrame.PlayNaviSound(arrStr[i]);
            }
        }
        this.m_arrDescription = [];
        return true;
    },

    _getText_:function (node) {
        return node.childNodes[0].nodeValue;
    },

    _parseState_:function (root) {
        var status = -1,
            node;
        node = root.firstChild;
        if (node && node.nodeName == "status") {
            status = Number(this._getText_(node));
        }
        else {
            return null;
        }

        node = node.nextSibling;
        if (node && node.nodeName == "timestamp") {
            this.m_strTimeStamp = this._getText_(node);
        }
        else {
            return null;
        }

        if (status != 0) {
            if (status == 2) {
                this.m_bIsLoginSuccess = false;
            }
            return null;
        }

        return node;
    },

    _getRoot_:function (buf) {
        var parser = new DOMParser(),
            xmlDom = parser.parseFromString(buf, "text/xml");

        if (!xmlDom || !xmlDom.documentElement) {
            return null;
        }

        var root = xmlDom.documentElement;
        if (!root.nodeName || root.nodeName != "response") {
            return null;
        }

        return root;
    },


    //解析登录返回的结果
    parseLogonResult:function (buf) {

        var root = this._getRoot_(buf);
        if (!root) {
            return false;
        }

        // 属性验证
        if (root.getAttribute("type") != "logon") {
            return false;
        }

        var node = this._parseState_(root);
        if (!node) {
            return false;
        }

        node = node.nextSibling;
        if (node && node.nodeName == "pincode") {
            this.m_strPinCode = this._getText_(node);
        }
        else {
            return false;
        }

        // not used
        node = node.nextSibling;
        if (node && node.nodeName == "pid") {
            var str = this._getText_(node);
            if (str.length > 9) {
                var strLow = str.slice(str.length - 9),
                    strMid,
                    strHigh,
                    id = Number(strLow);
                if (str.length > 18) {
                    strMid = str.slice(str.length - 18, str.length - 9);
                    strHigh = str.slice(0, str.length - 18);
                    id += Number(strMid) * Math.pow(10, 9) + Number(strHigh) * Math.pow(10, 18);
                }
                else {
                    strHigh = str.slice(0, str.length - 9);
                    id += Number(strHigh) * Math.pow(10, 9);
                }
                this.m_nPID = id;

            }
            else {
                this.m_nPID = Number(str);
            }
        }
        else {
            return false;
        }

        this.m_bIsLoginSuccess = true;
        return true;
    },


    //解析注销返回的结果
    parseLogoffResult:function (buf) {

        var root = this._getRoot_(buf);
        if (!root) {
            return false;
        }

        // 属性验证
        if (root.getAttribute("type") != "logout") {
            return false;
        }

        if (!this._parseState_(root)) {
            return false;
        }

        this.m_bIsLoginSuccess = false;
        return true;
    },

    //解析数据请求的结果
    parseReqDataResult:function (buf) {
        var root = this._getRoot_(buf);
        if (!root) {
            return false;
        }

        // 属性验证
        if (root.getAttribute("type") != "trafficinfo") {
            return false;
        }

        var node = this._parseState_(root);
        if (!node) {
            return false;
        }

        node = node.nextSibling;
        if (node && node.nodeName == "front") {
            for (var child = node.firstChild; child != null; child = child.nextSibling) {
                if (this.m_arrDescription.length < this.MAX_DESCRIPTION_NUM) {
                    var str = this._getText_(child);
                    if (str && str.length > 0) {
                        this.m_arrDescription.push(str);
                        if (!this.m_bJustReqSuccess) {
                            this.m_bJustReqSuccess = true;
                        }
                    }

                }
            }
        }
        else {
            return false;
        }

        if (this.m_pstFrame.GetShowTrafficPic()) {
            node = node.nextSibling;
            if (node && node.nodeName == "url") {
                var strBuf = this.m_strAddress + "cmdtype=boardpic&pincode=" + this.m_strPinCode;
                strBuf += "&picid=" + this._getText_(node);
                strBuf += "&size=480x320" + "&whscale=true";
                this.m_pstFrame.NetRequestHTTP(MRoute.ConnectId.CONNECTID_PIC,
                    strBuf, null, null, false);
            }
        }
        return true;
    },

    //解析概要图数据的结果
//    parseBoardPicResult:function (buf) {
//    },



    /**
     * 解析数据
     * @param data
     */
    ParserTmc:function (data) {
        var nCode = 0,
            nStart = -1,
            nEnd = -1,
            info = "";
        if (data != null && data.length > 0) {
            nStart = data.indexOf("<description>");
            nEnd = data.indexOf("</description>");
            if (nStart != -1 && nEnd > nStart) {
                nCode = 1;
                info = data.substring(nStart + 13, nEnd);
            }
            else {
                nStart = data.indexOf("<error>");
                nEnd = data.indexOf("</error>");
                if (nStart != -1 && nEnd > nStart) {
                    nCode = 2;
                    info = data.substring(nStart + 7, nEnd);
                }
            }
        }

        return [nCode, info];
    },

    //解析请求路径的前方态势数据的结果,暂时没有用到
    parseRouteTrafficResult:function (buf) {
        console.log("parse 前方态势数据"+buf);
        var res = this.ParserTmc(buf),
            code = res[0],
            str = res[1];
        if (code != 1) {
            return false;
        }
        this.m_pstFrame.PlayNaviSound(2, str);

    }

});

MRoute.CFrameForTrafficRadio = Class({
    m_pstFrame:null,
    m_pIdMap:[],

    "initialize":function (pstFrame) {
        this.m_pstFrame = pstFrame;
        this.m_pIdMap = new Array(0, 0, 0, 0, 0, 0);
    },

    NetRequestHTTP:function (iConnectId, strUrl, strHead, strData, bGet) {
        this.m_pIdMap[iConnectId] = this.m_pstFrame.OnNetRequest(1, strUrl, strHead, strData, bGet);
    },

    ShowTrafficPanel:function (data, size) {
        this.m_pstFrame.m_pstFrame["ShowTrafficPanel"](data, size);
    },

    HideTrafficPanel:function () {
        this.m_pstFrame.m_pstFrame["HideTrafficPanel"]();
    },

    PlayNaviSound:function (type, str) {
        this.m_pstFrame.m_pstFrame["PlayNaviSound"](type, str);
    },

    NoticeRequestTrafficInfo:function () {
        this.m_pstFrame.OnRequestTrafficInfo();
    },

    GetPlayTrafficVoice:function () {
        return this.m_pstFrame.m_NaviStatus.GetPlayTrafficRadio();
    },

    GetShowTrafficPic:function () {
        // need supply
        return false;
        //return this.m_pstFrame.m_NaviStatus.GetPlayTrafficRadio();
    },

    GetInnerConnectId:function (cnId) {
        for (var i = 1; i < 6; i++) {
            if (this.m_pIdMap[i] == cnId) {
                return i;
            }
        }
        return 0;
    }


});

MRoute.JsTBT = Class({

    naviPath:null, // 当前导航路径
    selectPath:null, // 当前选中路径

    m_routeMgr:null,
    m_pstVoiceMgr:null,
    m_pstFrame:null,

    m_pstProbe:null,
    m_pstDG:null,
    m_pstVP:null,
    m_pstTMC:null,
    m_pstFrameForDG:null,
    m_pstTrafficRadio:null,
    m_pstFrameForTraffic:null,
    m_voiceManager:null,

    m_NaviStatus:null,
    m_eNaviState:MRoute.NaviState.NaviState_Common,
    m_eCalcType:null,

    m_bDataReady:false,
    m_bNotifyed:false, // 是否已通知路径准备情况
    m_bReroute:false,

    m_arrDest:[],
    m_curDestID:0,
    // CFrameForRP m_pstFrameForRP:null,
    // CFrameForTMC* m_pstFrameForTMC:null,
    // CFrameForTmcBar* m_pstFrameForTmcBar:null,
    // CFrameForTrafficRadio* m_pstFrameForTR:null,

    /**
     * 初始化, 必先于其他接口函数调用
     * @param TBTFrame      由用户实现的外部支持类的引用
     * @param strWorkPath   工作路径，TBT的一些配置文件等资料，以及输出信息将输出到此路径下
     * @param usrCode       用户码，从高德申请的到
     * @param usrBatch      用户码，从高德申请的到
     * @param deviceId      每个设备号必须唯一，可以是SIM卡号，也可以是设备唯一ID
     */
    "initialize":function (TBTFrame, strWorkPath, usrCode, usrBatch, deviceId) {
        if (null == TBTFrame /*|| null == strWorkPath*/) {
            return false;
        }
        // need supply
        this.m_pstFrame = TBTFrame;
        this.m_pstFrameForDG = new MRoute.CFrameForDG(this);
        this.m_voiceManager = new MRoute.CVoiceManager(this);
        this.m_pstDG = new MRoute.NDG(this.m_pstFrameForDG, this.m_voiceManager);
        this.m_pstVP = new MRoute.VP(this);
        this.m_NaviStatus = new MRoute.CNaviStatus();

        this.m_routeMgr = new MRoute.RouteManager();

        this.m_pstTMC = new MRoute.JsTMC(this, this.m_routeMgr);
        if (this.m_pstTMC != null) {
            this.m_pstTMC.start();
        }


        this.m_pstFrameForTraffic = new MRoute.CFrameForTrafficRadio(this);
        this.m_pstTrafficRadio = new MRoute.TrafficRadio(this.m_pstFrameForTraffic, usrCode, usrBatch, deviceId);
        this.m_pstProbe = new MRoute.ProbeManager(this.m_pstTrafficRadio);

        // m_pRoute = new CTBTRoute();
        // m_pstVP->StartMapmatch();
        return true;
    },


    /**
     * 接口函数，不再使用TBT时用来释放它管理的内部资源
     * 调用后不可调用其他接口
     */
    "Destroy":function () {
        if (this.m_pstTMC != null) {
            this.m_pstTMC.stop();
            this.m_pstTMC = null;
        }
        this.m_pstFrame = null;
        this.m_pstDG = null;
        this.m_pstVP = null;
        this.m_pstFrameForDG = null;
        this.m_NaviStatus = null;
        this.m_routeMgr = null;
    },

    /**
     * 接口函数，调用此接口告知TBT当前的车辆位置
     * @param stLocation 车位所在经纬度，参见NavPoint定义
     */
    "SetCarLocation":function (stLocation) {
        this.m_NaviStatus.SetGPSGeoX(stLocation.x);
        this.m_NaviStatus.SetGPSGeoY(stLocation.y);
    },

    /**
     * 接口函数，设置模拟导航的速度
     * 在系统初始化时，以及模拟导航速度变化时调用此接口
     * @param iEmulatorSpeed 所设置的车速，单位公里/小时
     */
    "SetEmulatorSpeed":function (iEmulatorSpeed) {
        this.m_NaviStatus.SetSimNaviSpeed(iEmulatorSpeed);
        if (this.m_pstDG) {
            var speed = this.m_NaviStatus.GetSimNaviSpeed();
            this.m_pstDG.setEmulatorSpeed(speed);
        }
    },

    /**
     * 接口函数，设置是否播报电子眼
     * 在系统初始化时，以及电子眼播报设置变化时调用此接口，默认播报电子眼
     * @param iIsEleyePrompt 0 为不播报，1为播报
     */
    "SetEleyePrompt":function (iIsEleyePrompt) {
        var bval = iIsEleyePrompt ? true : false;
        this.m_NaviStatus.SetEleyePrompt(bval);
        this.m_pstDG.setEleyePrompt(bval);
    },

    /**
     * 接口函数，设置导航的播报类型
     * 在系统初始化时，以及播报类型设置变化时调用此接口，默认详细播报
     * @param iNaviType 播报类型，1 简单播报，2 详细播报
     */
    "SetNaviType":function (iNaviType) {
        if (iNaviType == 1) {
            this.m_NaviStatus.SetVoicePrompt(false);
        } else {
            this.m_NaviStatus.SetVoicePrompt(true);
        }
    },

    /**
     * 接口函数，设置TTS播报每个字需要的时间
     * 为了获得更好的播报效果，在导航前调用此接口来设置最准确的值
     * @param useTime 播报每个字需要的时间，单位为毫秒
     */
    "SetPlayOneWordUseTime":function (useTime) {
        this.m_NaviStatus.SetPlayOneWordUseTime(useTime);
        if (this.m_voiceManager != null) {
            this.m_voiceManager.SetPlayOneWordUseTime(useTime);
        }
    },

    /**
     * 接口函数，通知网络请求成功或失败
     * @param connectID 连接号，区分不同连接
     * @param eNetState 请求状态,参见MRoute.NetRequestState定义
     *        1    请求成功
     *        2    请求失败
     *        3    请求超时
     *        4    用户手动结束请求
     */
    m_eRPNetState:MRoute.NetRequestState.NetRequestState_NULL,
    "SetNetRequestState":function (connectID, eNetState) {
        //目前只有RP请求
        // need supply
        if (connectID == 0) {
            this.m_eRPNetState = eNetState;
        }
    },


    /**
     * 接口函数，选择路径
     * @param iRouteType 路径类型
     * @return {Number} 0-7 被选中道路的路径类型
     *                        若没有指定类型，则选中首条路径，并返回其类型
     *                  -1 没有任何道路可选
     */
    "SelectRoute":function (iRouteType) {
        this.selectPath = this.m_routeMgr.selectRoute(iRouteType);
        if (this.selectPath != null) {
            return this.selectPath.getStrategy();
        }
        return -1;
    },


    /**
     * 设定导航路径
     * @private
     */
    _setNaviRoute_:function () {
        if (this.m_eNaviState == MRoute.NaviState.NaviState_Routing) {    // 正在计算路径，直接返回
            return false;
        }
        this.naviPath = this.m_routeMgr.setNaviRoute();
        if (this.naviPath != null) {
            // 只在gps导航时修改算路类型为单一，模拟导航不会重算路？
            // 如果根据路况来，模拟导航也还是有可能reroute的
            // 请求单路径耗费流量小
            if (this.m_eCalcType == MRoute.CalcType.CalcType_Multi) {
                this.m_eCalcType = (this.naviPath.getStrategy() == MRoute.PathStrategy.Strategy_TMC_FAST) ?
                    MRoute.CalcType.CalcType_TMC : MRoute.CalcType.CalcType_Best;
            }

            return true;
        }
        return false;
    },

    /**
     * 将导航路径通知到各子模块
     * @private
     */
    _notifyNaviRoute_:function () {
        if (this.m_pstVP != null) {
            this.m_pstVP.SetRoute(this.naviPath.getSegments());
        }

        if (this.m_pstDG != null) {
//                var coorlist = this.GetNaviCoor();//用起点来代替GPS点
//                var pt = new MRoute.NaviPoint(coorlist[0], coorlist[1]);
            var vpl = new MRoute.VPLocation();
            vpl.nSegId = 0;
            vpl.nPtId = 0;
            vpl.dLon = this.m_NaviStatus.GetGPSGeoX();
            vpl.dLat = this.m_NaviStatus.GetGPSGeoY();

            this.m_pstDG.SetNaviRoute(this.naviPath, true, vpl);
        }

        if (this.m_pstTMC != null) {
            var firstSeg = this.naviPath.getSegmentByID(0),
                startPt = firstSeg.getDetailedPoint(0);
            this.m_pstTMC.setCarLoc(startPt.x, startPt.y);
        }

        if (this.m_pstTrafficRadio) {
            this.m_pstTrafficRadio.SetNaviRoute(this.naviPath);
        }

        var dist = this.naviPath.getDistance();
        this.m_NaviStatus.SetTotalDist(dist);

        this.m_eNaviState = MRoute.NaviState.NaviState_StartNavi;
    },

    OnArriveWay:function (nSegId) {

        // 基于顺序抵达，且一个分段只有一个途径点的假设
        var len = this.m_arrDest.length;
        if (this.m_curDestID < len) {
            this.m_arrDest[this.m_curDestID].IsArrived = true;
            this.m_curDestID++;
        }
        var id = this.m_curDestID;
        if (this.m_curDestID == len || nSegId < 0) {
            this["StopNavi"]();
            id = -1;
        }

        this.m_pstFrame["ArriveWay"](id);

    },

    bfirstChange:false,
    OnCarLocationChange:function (bValid, bMatched) {
        var carloc = this.m_pstVP.GetVPLocation();
        this.m_NaviStatus.SetValidGPS(true);
        if (!this.m_NaviStatus.GetIsStartEmulator()) {
            this.m_NaviStatus.SetGPSGeoX(carloc.dLon);
            this.m_NaviStatus.SetGPSGeoY(carloc.dLat);
        }

        if (bValid) {
            // 非gps导航状态，即使通知dg，dg也没有什么响应动作而是立即返回
            if (bMatched) {

//                if (!this.bfirstChange) {
//                    TestInfoLog("TBT-OnCarLocationChange-first loc changing:" + (new Date()).getTime());
//                }
                this.m_pstDG.CarLocationChange(carloc);
//                if (!this.bfirstChange) {
//                    this.bfirstChange = true;
//                    TestInfoLog("TBT-OnCarLocationChange-first loc changed:" + (new Date()).getTime());
//                }

            }

            // 只有有效点才通知外部车位信息
            this.m_pstFrame["CarLocationChange"](carloc.getInfo());
        }
    },

    OnPushProbeInfo:function (info) {
        if (this.m_pstProbe) {
            this.m_pstProbe.ProbeProc(info);
        }
    },

    OnGetCarSpeed:function () {
        if(this.m_NaviStatus.GetIsStartEmulator())
        {
            return this.m_NaviStatus.GetSimNaviSpeed();
        }
        var carLoc = this.m_pstVP.GetVPLocation();
        if (carLoc != null) {
            return carLoc.nSpeed;
        }
        return 0;
    },

    /**
     * 响应内部对象DG发出的重算路请求，转发请求给Frame
     */

    lastRerouteNotifyTime:0,  /// 最后一次通知外部reroute的时间
    OnReroute:function () {
        // 仅在gps导航进行中才reroute
        if (this.m_pstDG.IsGPSNaving()) {

            // 避免频繁发送reroute通知
            var curTime = (new Date()).getTime();
            if(curTime - this.lastRerouteNotifyTime > 15000){
                this.m_pstFrame["Reroute"]();
                this.lastRerouteNotifyTime = curTime;
            }
        }
    },

    OnSetValidGPS:function (bval) {
        this.m_NaviStatus.SetValidGPS(bval);
    },

    nLinkRemainDist:Number.MIN_VALUE,

    OnDGNaviInfoChanged:function (dgInfo, linkRemainDist) {

        this.nLinkRemainDist = linkRemainDist;
        var data = this.m_NaviStatus;
        data.SetTotalRemainDist(dgInfo.nRouteRemainDist);
        data.SetTotalRemainTime(dgInfo.nRouteRemainTime);
        data.SetSegmentRemainDist(dgInfo.nSegRemainDist);
        data.SetSegmentRemainTime(dgInfo.nSegRemainTime);
        data.SetSegmentNo(dgInfo.nCurSegIndex);
        if (dgInfo.eNaviType != MRoute.NaviType.NaviType_Emul) {
            data.SetGPSGeoX(dgInfo.fLongitude);
            data.SetGPSGeoY(dgInfo.fLatitude);
        }
    },


    OnTMCReceived:function () {
        if (!this.m_bNotifyed && this.m_bDataReady) {
            this._notifyReceiveState_(MRoute.RouteRequestState.RouteRequestState_Success);
        }
    },

    OnTMCUpdate:function () {
        // 先更新路况
        this.m_pstFrame["TMCUpdate"]();

        // 只有真正GPS导航时，才考虑静默算路
        if (this.m_NaviStatus.GetIsStartNavi() && !this.m_NaviStatus.GetIsStartEmulator()) {
            //如果当前车位在当前link对应的路口150m范围内则不进行重算，避免在路口突然提示用户转向
            if (this.nLinkRemainDist > 150) {
                if (this.m_pstTMC.isRouteBlocked(this.m_NaviStatus.GetSegmentNo(), this.m_NaviStatus.GetSegmentRemainDist())) {
                    this.m_pstFrame["RerouteForTMC"]();
                }
            }
        }

    },

    connectNum:0,
    usedConnectId:[],

    OnNetRequest:function (modelId, url, head, data, bGet) {
        var conId;
        if (this.usedConnectId.length > 0) {
            conId = this.usedConnectId.pop();
        }
        else {
            conId = this.connectNum;
            this.connectNum++;
        }
        this.m_pstFrame["NetRequestHTTP"](modelId, conId, url, head, data, bGet);
        return conId;

    },

    /**
     * 接口函数，开始GPS导航
     * @return {Boolean} 请求是否成功
     */
    "StartGpsNavi":function () {
        if (!this.m_bDataReady) {
            return false;
        }

        this.m_NaviStatus.SetIsStartNavi(true);
        if (this.m_eNaviState != MRoute.NaviState.NaviState_StartNavi) {
            if (this._setNaviRoute_()) {
                //TestInfoLog("TBT-StartGpsNavi:" + (new Date()).getTime());

                this.bfirstChange = false;

                this._notifyNaviRoute_();
            }
            else {
                this.m_NaviStatus.SetIsStartNavi(false);
                return false;
            }
        }


        this.m_pstDG.StartNavi(true);

        return true;

    },

    /**
     * 接口函数，开始模拟导航
     * @return {Boolean} 请求是否成功
     */
    "StartEmulatorNavi":function () {
        if (!this.m_bDataReady) {
            return false;
        }

        this.m_NaviStatus.SetIsStartEmulator(true);

        if (this.m_eNaviState != MRoute.NaviState.NaviState_StartNavi) {

            if (this._setNaviRoute_()) {
                this._notifyNaviRoute_();
            }
            else {
                this.m_NaviStatus.SetIsStartEmulator(false);
                return false;
            }
        }

        this.m_pstDG.StartNavi(false);

        return true;
    },

    /**
     * 接口函数，停止模拟导航
     * 路径信息仍然存在，可以再次导航
     */
    "StopEmulatorNavi":function () {

        this.m_pstDG.StopEmulatorNavi();

        // 同时不在gps导航状态 置为普通状态
        if (!this.m_NaviStatus.GetIsStartNavi()) {
            this.m_eNaviState = MRoute.NaviState.NaviState_Common;
        }

        this.m_NaviStatus.SetIsStartEmulator(false);
    },


    /**
     * 接口函数，暂停导航
     */
    "PauseNavi":function () {
        var bSim = true;
        if (this.m_pstDG.IsGPSNaving()) {
            bSim = false;
        }
        else if (!this.m_NaviStatus.GetIsStartEmulator()) {
            bSim = false;
        }

        this.m_pstDG.PauseNavi(bSim);
        //并不准确，标志变更后很有可能过一定时间才停止导航，非立即响应的
        this.m_NaviStatus.SetIsDgPause(true);
    },

    /**
     * 接口函数，恢复导航
     */
    "ResumeNavi":function () {
        var bSim = true;
        if (this.m_pstDG.IsGPSNaving()) {
            bSim = false;
        }
        else if (!this.m_NaviStatus.GetIsStartEmulator()) {
            bSim = false;
        }
        if (this.m_NaviStatus.GetIsDgPause()) {
            this.m_pstDG.ResumeNavi(bSim);
            this.m_NaviStatus.SetIsDgPause(false);
        }
    },

    /**
     * 接口函数，停止导航，不论是GPS还是Emulator导航
     * 路径被销毁，下次导航需要重新请求路径
     */
    "StopNavi":function () {

        if (this.m_pstDG != null) {
            if (this.m_NaviStatus.GetIsDgPause()) {
                this.m_pstDG.ResumeNavi();
            }
        }

        if (this.m_NaviStatus.GetIsStartNavi()) {
            this.m_pstDG.StopGPSNavi();
            this.m_NaviStatus.SetIsStartNavi(false);
        }

        if (this.m_NaviStatus.GetIsStartEmulator()) {
            this.m_pstDG.StopEmulatorNavi();
            this.m_NaviStatus.SetIsStartEmulator(false);
        }

        this.m_eNaviState = MRoute.NaviState.NaviState_Common;
        this._releasePath_();

    },

    _releasePath_:function () {

        if (this.m_pstTrafficRadio) {
            this.m_pstTrafficRadio.SetNaviRoute(null);
        }

        if (this.m_pstVP) {
            this.m_pstVP.SetRoute(null);
        }

        if (this.m_pstTMC) {
            this.m_pstTMC.routeUpdate();
        }

        if (this.naviPath || this.selectPath ) {
            this.naviPath = null;
            this.selectPath = null;
            this.m_pstFrame["RouteDestroy"]();	// 通知使用者路径删除
        }

        this.m_routeMgr.setRoutes(null);

        this.m_bDataReady = false;

    },

    lastSpeed:0,

    /**
     * 接口，接收外部gps信息
     * @param longitude 经度, 单位度
     * @param latitude  纬度, 单位度
     * @param speed     速度，单位公里/小时？
     * @param direction 方向，单位度，以正北为基准，顺时针增加
     * @param year      年
     * @param month     月
     * @param day       日
     * @param hour      时
     * @param minute    分
     * @param second    秒
     */
    "SetGPSInfo":function (longitude, latitude, speed, direction, year, month, day, hour, minute, second) {
        if (this.m_pstVP != null) {
            var gpsData = new MRoute.NmeaData();
            gpsData.lon = longitude;
            gpsData.lat = latitude;
            gpsData.speed = speed;
            gpsData.track = direction;
            gpsData.Year = year;
            gpsData.Month = month;
            gpsData.Day = day;
            gpsData.Hour = hour;
            gpsData.Minute = minute;
            gpsData.Second = second;

            this.m_pstVP.SetNmea(gpsData);
        }

        this.lastSpeed = speed;

    },

    /**
     * 请求路径
     * TBT要将请求结果状态通过SetRequestRouteState通知TBTFrame
     * @param eCalcType 路径类型，参见MRoute.CalcType
     *    0    最优路径
     *    1    快速路优先
     *    2    距离优先
     *    3    普通路优先
     *    4    考虑实时路况的路线
     *    5    多路径（一条考虑实时交通路况路线，一条最优路线（未考虑实时交通））
     * @param destList  []途径点及终点数组，含各点经纬度信息，参见NaviPoint
     * @return {Boolean}
     */
    "RequestRoute":function (eCalcType, destList) {
        if (destList == null) {
            return false;
        }

        destList = this._clearRepeated_(destList);
        var lastID = destList.length - 1;
        if (lastID < 0) return false;


        var startList = [];

        //如果当前GPS有效,则直接使用轨迹中最新三点
        if (this.m_NaviStatus.GetValidGPS()) {
            var arrPos = this.m_pstVP.GetGpsList(3);
            if (arrPos != null && arrPos.length > 0) {

                for (var i = 0; i < arrPos.length; i += 2) {
                    startList.push(new MRoute.NvPoint(arrPos[i], arrPos[i + 1]));
                }
            }
        }

        //没有gps点，用指定位置初始化
        if (startList.length == 0) {
            var sx = this.m_NaviStatus.GetGPSGeoX(),
                sy = this.m_NaviStatus.GetGPSGeoY();
            startList.push(new MRoute.NvPoint(sx, sy));
        }


        return this["RequestRouteHaveStart"](eCalcType, startList, destList);
    },

    _pointEqual_:function (pt1, pt2) {
        return Math.round(pt1.x * CoordFactor) == Math.round(pt2.x * CoordFactor)
            && Math.round(pt1.y * CoordFactor) == Math.round(pt2.y * CoordFactor);

    },

    _clearRepeated_:function (ptList) {
        if (ptList == null || ptList.length == 1) {
            return ptList;
        }

        var newList = [];
        newList.push(ptList[0]);

        var i = 1;
        while (i < ptList.length) {
            if (!this._pointEqual_(ptList[i - 1], ptList[i])) {
                newList.push(ptList[i]);
            }
            i++;
        }

        return newList;
    },

    /**
     * 接口函数，带起点的路径请求 // need supply
     * @param eCalcType  算路类型
     *      0 最优路径 1 快速路优先 2 距离优先 3 普通路优先 4 考虑TMC路况 5 一条TMC路径，一条最优路（无TMC）
     * @param startList  []起点数组，含各点经纬度信息，参见NaviPoint
     * @param destList  []途径点及终点数组，含各点经纬度信息，参见NaviPoint
     * @return {Boolean}
     */
    "RequestRouteHaveStart":function (eCalcType, startList, destList) {
        if(eCalcType > 5 || eCalcType < 0){
            eCalcType = 5;
        }
        if (startList == null || destList == null) {
            return false;
        }

        var i, j ;
        for(i = 0; i < startList.length; i++){
            startList[i].x = Number(startList[i].x);
            startList[i].y = Number(startList[i].y);
        }

        for(j = 0; j < destList.length; j++){
            destList[j].x = Number(destList[j].x);
            destList[j].y = Number(destList[j].y);
        }


        startList = this._clearRepeated_(startList);
        destList = this._clearRepeated_(destList);

        if (this.m_eNaviState == MRoute.NaviState.NaviState_Routing) {    // 正在计算路径，直接返回
            return false;
        }
        else if (this.m_eNaviState == MRoute.NaviState.NaviState_StartNavi) { // 已经开始导航，停止导航

            if (this.m_NaviStatus.GetIsStartNavi()) {
                this.m_pstDG.StopGPSNavi();
                this.m_NaviStatus.SetIsStartNavi(false);
            }

            if (this.m_NaviStatus.GetIsStartEmulator()) {
                this.m_pstDG.StopEmulatorNavi();
                this.m_NaviStatus.SetIsStartEmulator(false);
            }
        }

        this._releasePath_();

        // 此时应发送算路请求
        // 没有RP模块，请求代码暂时放在此处
        {
            var lastID = destList.length - 1;
            if (lastID < 0){
                return false;
            }

            var routeType = this._switchType_(eCalcType),
                dist = GetMapDistance(startList[0].x, startList[0].y, destList[0].x, destList[0].y),
                routeFlag = this._compositeFlag_(); //539361320;

            if(dist > 100){
                routeFlag = 539365416; //距离较远，则梯级算路，尽量选择高速路
            }

            if (startList.length == 1 && destList.length == 1 && this._pointEqual_(startList[0], destList[0])) {
                // 避免起止点相同
                return false;
            }

            var url = "http://211.151.71.28:8888/routenew1.php";

            // 起点
            url += "?xys=";
            for (i = 0; i < startList.length; i++) {
                url += startList[i].x + "," + startList[i].y + ";";
            }
            url += ";";

            // 途径点，终点
            for (j = 0; j < destList.length; j++) {
                url += destList[j].x + "," + destList[j].y;
                if (j != lastID) {
                    url += ";";
                }
            }
            url += "&type=" + routeType + "&flag=" + routeFlag;

            this.m_eNaviState = MRoute.NaviState.NaviState_Routing;

            //发送请求
            this.OnNetRequest(3, url, null, null, true);

            if (this.m_bReroute) {
                this.m_NaviStatus.SetRouteCalcType(MRoute.CalcRouteType.CalcRouteType_Reroute);
            }
            else {
                this.m_NaviStatus.SetRouteCalcType(MRoute.CalcRouteType.CalcRouteType_Command);
            }
        }

        this.m_eCalcType = eCalcType;
        var len = destList.length;
        this.m_arrDest = [];
        this.m_curDestID = 0;
        for (var n = 0; n < len; n++) {
            var node = new MRoute.DestNode;
            node.x = destList[n].x;
            node.y = destList[n].y;
            node.IsArrived = false;
            this.m_arrDest.push(node);
        }
        return true;
    },

    _compositeFlag_:function () {
        var dwFlag = MRoute.CalcFlag.Flag_DETAIL_ROAD_ATTR;
        dwFlag |= MRoute.CalcFlag.Flag_INGNORE_LIGHT;
        dwFlag |= MRoute.CalcFlag.Flag_DYNAMIC_TRAFFIC;
        dwFlag |= MRoute.CalcFlag.Flag_TRAFFIC_CALC;
        dwFlag |= MRoute.CalcFlag.Flag_TMC;
        dwFlag |= MRoute.CalcFlag.Flag_LOC_CODE;
        //dwFlag |= MRoute.CalcFlag.Flag_TIME_TMC;
        return dwFlag;
    },

    /**
     * 将内部算路类型转化为服务器路径请求类型
     * @param eCalcType
     * @return {Number} 发往服务器的路径请求类型
     * @private
     */
    _switchType_:function (eCalcType) {
        var nRouteType;
        switch (eCalcType) {
            case MRoute.CalcType.CalcType_Best:
            {
                nRouteType = 0;     //ROUTE_TYPE_PRIORITY_SPEED;
            }
                break;
            case MRoute.CalcType.CalcType_High:
            {
                nRouteType = 1;     //ROUTE_TYPE_PRIORITY_FEE;
            }
                break;
            case MRoute.CalcType.CalcType_Dist:
            {
                nRouteType = 2;     //ROUTE_TYPE_PRIORITY_DISTANCE;
            }
                break;
            case MRoute.CalcType.CalcType_TMC:
            {
                nRouteType = 4;     //ROUTE_TYPE_PRIORITY_TMC_FAST;
            }
                break;
            case MRoute.CalcType.CalcType_Norm:
            {
                nRouteType = 5;     //ROUTE_TYPE_PRIORITY_NORMAL_ROAD;
            }
                break;
            case MRoute.CalcType.CalcType_Multi:
            {
                nRouteType = 11;     //ROUTE_TYPE_PRIORITY_MULTI3;
            }
                break;

            default:
            {
                nRouteType = 0;     //ROUTE_TYPE_PRIORITY_SPEED;
            }
                break;
        }
        return nRouteType;
    },


    /**
     * 接口函数，负责接收解析各连接所请求到的数据
     * @param modelID  模块号：1 移动交通台，2 TMC，3 在线导航
     * @param connectID  连接编号
     * @param postStream 数据流
     */
    "ReceiveNetData":function (modelID, connectID, postStream) {
        if (modelID == 3) {
            this.m_eNaviState = MRoute.NaviState.NaviState_Common;
            this.m_bNotifyed = false;
            if (postStream == null) {
                this._notifyReceiveState_(MRoute.RouteRequestState.RouteRequestState_NetERROR);
                return;
            }

            try {
                var pd = new MRoute.PathDecode(postStream);
                if (pd == null) { // 创建对象失败的防范
                    this._notifyReceiveState_(MRoute.RouteRequestState.RouteRequestState_DataFormatError);
                    return;
                }

                var Paths = pd.getPaths();
                pd = null;

                this.m_routeMgr.setRoutes(Paths);
                this.selectPath = this.m_routeMgr.getSelectRoute();
                this.nLinkRemainDist = 0;

                if (Paths == null || Paths.length == 0) {
                    this._notifyReceiveState_(MRoute.RouteRequestState.RouteRequestState_DataFormatError);
                    return;
                }
                else {

                    // 更新route信息
                    for (var i = 0; i < Paths.length; i++) {
                        Paths[i].updateRouteInfo();
                    }

                    this.m_bDataReady = true;
                    if (!this.m_NaviStatus.GetDrawDt()) {
                        this._notifyReceiveState_(MRoute.RouteRequestState.RouteRequestState_Success);
                    }

                    if (this.m_pstTMC) {
                        var firstSeg = Paths[0].getSegmentByID(0),
                            startPt = firstSeg.getDetailedPoint(0);
                        this.m_pstTMC.setCarLoc(startPt.x, startPt.y);
                        this.m_pstTMC.routeUpdate();
                    }
                }
            }
            catch (err) {// 如果请求失败，PathDecode会抛出错误
                this._notifyReceiveState_(MRoute.RouteRequestState.RouteRequestState_NetERROR);
            }
        }
        else if (modelID == 2) {
            this.m_pstTMC.receiveNetData(postStream);
        }
        else if (modelID == 1) {
//            var innerId = this.m_pstFrameForTraffic.GetInnerConnectId(connectID);
//            this.m_pstTrafficRadio.receiveNetData(innerId, postStream);
            this._tParseTrafficRadio_(postStream);
        }
        this.usedConnectId.push(connectID);

    },
    /**
     * 接收Traffic请求到的信息结果，并且解析，周期是1min
     * @param postStream
     * @private
     */
    _tParseTrafficRadio_:function (postStream) {
        console.log("_tParseTrafficRadio_ content:"+postStream);
        if (postStream) {
            var strArr = postStream.split(";;;");
            if (strArr && strArr.length > 0) {
                if (strArr[0].length) {
                    if (new Date().getTime() > this.m_pstDG.getEndTimeOfLastTTS() && this.m_pstDG.getNaviInfo().nSegRemainDist >300 ) //todo,300是经验值
                        this.m_pstFrame["PlayNaviSound"](2, strArr[0]);
                }
                if (strArr[1].length) {
                    var id = Number(strArr[1]);
                    if (!isNaN(id)) {
                        this.m_pstFrame["ShowTrafficPanel"](id);
                    }
                }
            }
        }

    },

    _notifyReceiveState_:function (eState) {
        //TestInfoLog("TBT-_notifyReceiveState_:" + (new Date()).getTime());

        this.m_eNaviState = MRoute.NaviState.NaviState_Common;
        this.m_bNotifyed = true;

        // reroute状态，如成功接收到数据，立即重启导航
        if (eState == MRoute.RouteRequestState.RouteRequestState_Success && this.m_bReroute) {
            this.m_pstFrame["SetRequestRouteState"](0); //eState
            this.lastRerouteNotifyTime = 0; // reroute成功，则不在计数，以便下次reroute
            this.m_bReroute = false;
            this["StartGpsNavi"]();
        } else {
            this.m_pstFrame["SetRequestRouteState"](eState);
        }
    },

    /**
     *
     * @param driveTime
     * @param tmcTime
     * @return {Number} 驾驶时间估计值
     * @private
     */
    _getTime_:function (driveTime, tmcTime) {

        if (tmcTime < driveTime / 2) {// tmc 比最快限速时间短太多，则不可信
            return driveTime;
        }
        return tmcTime;
    },


    /**
     * 接口函数，响应外部调用，执行路径重算
     */
    "Reroute":function () {
        if (this.m_pstVP == null) {
            return;
        }

        // 更新目的地列表，废弃已到达点
        var newlist = [];
        var len = this.m_arrDest.length;
        for (var i = 0; i < len; i++) {
            if (!this.m_arrDest[i].IsArrived) {
                newlist.push(this.m_arrDest[i]);
            }
        }

        if (newlist.length > 0) {
            this.m_bReroute = true;
            this["RequestRoute"](this.m_eCalcType, newlist);
        }
    },

    /**
     * 接口函数，手动播报当前导航信息
     * 会视当前路况播报，不一定是前一条播报信息的重复
     * @return {Boolean}
     */
    "PlayNaviManual":function () {
        this.m_pstDG.manualPlay();
        return true;
    },


    /**
     * 接口函数，打开动态交通信息
     * 系统初始化完默认动态交通信息是打开的
     */
    "OpenTMC":function () {
        this.m_NaviStatus.SetDrawDt(true);
    },

    /**
     * 接口函数，关闭动态交通信息
     * 关闭动态交通信息后CreateTMCBar与GetRoadStatus将不能使用
     */
    "CloseTMC":function () {
        this.m_NaviStatus.SetDrawDt(false);
    },

    _tGetPredictPoint_:function () {
        var list = [],
            dist = this.m_NaviStatus.GetSegmentRemainDist(),
            path = this.naviPath,
            segNum = path.getSegmentCount(),
            curSegID = this.m_NaviStatus.GetSegmentNo(),
            curSeg = path.getSegmentByID(curSegID);

        if (!curSeg) {
            return list;
        }

        // 添加当前车位，当前seg终点
        list.push(this.m_NaviStatus.GetGPSGeoX());
        list.push(this.m_NaviStatus.GetGPSGeoY());
        var segPtNum = curSeg.getDetailedPointsCount(),
            Pt = curSeg.getDetailedPoint(segPtNum - 1);
        list.push(Pt.x);
        list.push(Pt.y);

        // 添加剩余segment的link中点
        for (var i = curSegID + 1; i < segNum; i++) {
            var seg = path.getSegmentByID(i),
                linkNum = seg.getLinkCount();
            for (var j = 0; j < linkNum; j++) {
                var link = seg.getLink(j),
                    startId = link.getStartPtId(),
                    linkPtNum = link.getDetailedPointsCount(),
                    middleId = Math.floor(startId + linkPtNum / 2);
                Pt = seg.getDetailedPoint(middleId);
                if (Pt != null) {
                    list.push(Pt.x);
                    list.push(Pt.y);
                }

            }
            dist += seg.getDistance();
            if (dist > 10000) {
                break;
            }
        }

        return list;
    },

    _tNeedRequestTraffic_:function () {
        if (!this.m_NaviStatus.GetPlayTrafficRadio()) {
            return false;
        }

        if (this.m_NaviStatus.GetIsStartNavi() || this.m_NaviStatus.GetIsStartEmulator()) {
            return this.m_NaviStatus.GetTotalRemainDist() >= 2000;
        }
        else {
            return this._getPath_().getDistance() >= 2000;
        }
    },

    OnRequestTrafficInfo:function () {

        var bSuc = false;
        if (this.IsNavigate()) {
            var xyList = this._tGetFrontPtList_();
            bSuc = this._tRequestTrafficRadio_(xyList);
        } else {
            if (this.m_pstVP && this.lastSpeed > 6) {
                var gpsList = this.m_pstVP.GetGpsListWithAngle(10);
                bSuc = this._tRequestWithoutRoute_(gpsList);
            }
        }

        return bSuc;

//        var bUpload = false,
//            ptList = this._tGetPredictPoint_();
//        if (ptList && ptList.length && !this._tNeedRequestTraffic_()) {
//            bUpload = true;
//        }
//        this.m_pstTrafficRadio.RequestTraffic(null, ptList, bUpload, false);
    },

    // 获得路径前方10公里范围内的预测点
    _tGetFrontPtList_:function () {
        var list = [],
            path = this.naviPath,
            segNum, curSegID, curSeg, dist, angle;

        if (!path) {
            return list;
//            path = this._getPath_();
//            if (!path) {
//                return list;
//            }
        }

        segNum = path.getSegmentCount();
        if (this.m_NaviStatus.GetIsStartEmulator() || this.m_NaviStatus.GetIsStartNavi()) {
            var info = this.m_pstDG.getNaviInfo();
            curSegID = info.nCurSegIndex;
            dist = info.nSegRemainDist;
            //angle = info.nCarDirection;
            Pt = new MRoute.NvPoint(info.fLongitude, info.fLatitude);
        }
        else {
            curSegID = 0;
            dist = path.getSegmentByID(curSegID).getDistance();
            angle = -1;
        }

        curSeg = path.getSegmentByID(curSegID);
        if (!curSeg) {
            return list;
        }

        if (angle < 0) {
            //angle = curSeg.getPointAngle(0);
            Pt = curSeg.getDetailedPoint(0);
        }

        // 添加当前车位
        //list.push({x:Pt.x, y:Pt.y, a:angle});
        list.push({x:Pt.x, y:Pt.y});

        var segPtNum = curSeg.getDetailedPointsCount(),
            Pt = curSeg.getDetailedPoint(segPtNum - 1);
        // 添加当前seg终点
        //angle = curSeg.getPointAngle(segPtNum - 1);
        //list.push({x:Pt.x, y:Pt.y, a:angle});
        list.push({x:Pt.x, y:Pt.y});

        // 添加剩余segment的link中点
        for (var i = curSegID + 1; i < segNum; i++) {
            var seg = path.getSegmentByID(i),
                linkNum = seg.getLinkCount();
            for (var j = 0; j < linkNum; j++) {
                var link = seg.getLink(j),
                    startId = link.getStartPtId(),
                    linkPtNum = link.getDetailedPointsCount(),
                    middleId = Math.floor(startId + linkPtNum / 2);
                Pt = seg.getDetailedPoint(middleId);
                //angle = seg.getPointAngle(middleId);
                if (!(Pt == null /*|| angle == null*/)) {
                    //list.push({x:Pt.x, y:Pt.y, a:angle});
                    list.push({x:Pt.x, y:Pt.y});
                }

            }
            dist += seg.getDistance();
            if (dist > 10000) {
                break;
            }
        }

        return list;
    },

    // 非导航模式下
    _tRequestWithoutRoute_:function (ptList) {
        if (!this.m_NaviStatus.GetPlayTrafficRadio()) {
            return false;
        }

        var strUrl = "http://211.151.71.28:8888/aheadtraffic.php?xys=";

//        strUrl +="116.31015866,39.91313513,180;116.31016107,39.91291088,180;116.31016348,39.91268663,180;";
//        strUrl +="116.31016493,39.91255208,180;116.31016542,39.91232718,180;116.31016592,39.91210227,180;";
//        strUrl +="116.31016641,39.91187737,180;116.3101669,39.91165246,180;116.3101674,39.91142756,180;";
//        strUrl +="116.31016789,39.91120265,180;116.31016838,39.91097775,180;116.31016888,39.91075284,180;";
//        strUrl +="116.31016927,39.91057292,179;116.31017222,39.91034778,179;116.31017518,39.91012265,179;";
//        strUrl +="116.31017813,39.90989752,179;116.31018108,39.90967238,179;116.31018403,39.90944725,179;";
//        strUrl +="116.31018663,39.90924913,180;116.31018663,39.90902493,180;116.31018663,39.90880073,180;";
//        strUrl +="116.31018663,39.90857653,180;116.31018663,39.90835233,180;116.31018663,39.90812813,180;";
//        strUrl +="116.31018663,39.90790393,180;116.31018663,39.90789497,179;116.31019081,39.9076696,179;";
//        strUrl +="116.31019498,39.90744424,179;116.31019531,39.90742622,180;116.31019531,39.90720101,180;";
//        strUrl +="116.31019531,39.90697581,180;116.31019531,39.90694878,180;116.31019605,39.90672444,180;";
//        strUrl +="116.31019678,39.90650009,180;116.31019751,39.90627575,180;116.31019825,39.9060514,180;";
//        strUrl +="116.31019898,39.90582706,180;116.31019965,39.90562066,180;116.31020045,39.90539644,180;";
//        strUrl +="116.31020125,39.90517222,180;116.31020206,39.904948,180;116.31020286,39.90472378,180;";
//        strUrl +="116.31020366,39.90449955,180;116.31020446,39.90427533,180;116.31020526,39.90405111,180;";
//        strUrl +="116.31020606,39.90382689,180;116.31020686,39.90360267,180;116.31020766,39.90337845,180;";
//        strUrl +="116.31020833,39.9031901,180;116.31020905,39.90296552,180;116.31020978,39.90274094,180;";
//        strUrl +="116.3102105,39.90251635,180;116.31021122,39.90229177,180;116.31021194,39.90206718,180;";
//        strUrl +="116.31021266,39.9018426,180;116.31021338,39.90161802,180;116.3102141,39.90139343,180;";
//        strUrl +="116.31021482,39.90116885,180;116.31021554,39.90094426,180;116.31021626,39.90071968,180";

        if (ptList && ptList.length > 1) {
            var end = ptList.length;
            for (var i = 0; i < end; i++) {
                strUrl += ptList[i].x + "," + ptList[i].y + "," + ptList[i].a;
                if (i < end - 1) {
                    strUrl += ";";
                }
            }
        } else {
            return false;
        }

        //strUrl +="121.455669,31.223854,90;121.456098,31.223854,90";
        //strUrl +="116.303323,39.985025,90;116.303962,39.985021,90;116.304101,39.985041,90";

        strUrl += "&state=1632";

        this.OnNetRequest(1, strUrl, null, null, false);
        return true;
    },

    IsNavigate:function () {
        return this.m_NaviStatus.GetIsStartEmulator() || this.m_NaviStatus.GetIsStartNavi();
    },

    _tRequestTrafficRadio_:function (xyList) {

        var strUrl = "http://211.151.71.28:8888/navitraffic.php?xys=";
        if (xyList && xyList.length > 1) {
            var end = xyList.length;
            for (var i = 0; i < end; i++) {
                strUrl += xyList[i].x + "," + xyList[i].y;
                if (i < end - 1) {
                    strUrl += ",";
                }
            }
        } else {
            return false;
        }

        this.OnNetRequest(1, strUrl, null, null, false);
        return true;
    },

    /**
     * 接口函数，手动播报移动交通台信息
     * @return {Boolean}
     */
    "PlayTrafficRadioManual":function () {
        return this.OnRequestTrafficInfo();

//        if(!this.m_pstProbe){
//            return false;
//        }
//        var strPCD = this.m_pstProbe.GetProbePackageData();
//        if(!strPCD || strPCD.length == 0){
//            return false;
//        }
//
//        var bUpload = false,
//            xyList = this._tGetPredictPoint_();
//        if(xyList && xyList.length && !this._tNeedRequestTraffic_()){
//            bUpload = true;
//        }
//
//        this.m_pstTrafficRadio.RequestTraffic(strPCD, xyList, bUpload, false);
//
//        return true;

    },


    /**
     * 接口函数，打开移动交通台功能, 系统初始化完默认路况是打开的
     */
    "OpenTrafficRadio":function () {
        this.m_NaviStatus.SetPlayTrafficRadio(true);
        if (this.m_pstProbe) {
            this.m_pstProbe.SetSampleFrequency(60);
        }
    },

    /**
     *  接口函数，关闭路况
     */
    "CloseTrafficRadio":function () {
        this.m_NaviStatus.SetPlayTrafficRadio(false);
        if (this.m_pstProbe) {
            this.m_pstProbe.SetSampleFrequency(120);
        }

    },

    /**
     * 按被选路径，导航路径，首条路径顺序 获取路径
     * @return {MRoute.NaviPath} 成功则返回一条路径，失败返回null
     * @private
     */
    _getPath_:function () {
        if (this.selectPath != null) {
            return this.selectPath;
        }
        else if (this.naviPath != null) {
            return this.naviPath;
        }

        return null;
    },

    /**
     * 获得当前路径的长度，单位米
     * @return {Number}
     */
    "GetRouteLength":function () {
        var path = this._getPath_();
        if (path != null) {
            return path.getDistance();
        }
        return 0;
    },

    /**
     * 获得指定导航段的导航描述信息
     * @param iSegIndex
     * @return {String}
     */
    "GetSegmentDescribe":function (iSegIndex) {
        var strDescribe = "";
        if (this.m_pstDG) {
            strDescribe = this.m_pstDG.getGuideDescribe(this.selectPath, iSegIndex);
        }
        return strDescribe;
    },

    /**
     * 接口函数，获得行程Guide列表
     * @return {Array} GuideItem数组,参见NaviGuideItem定义
     */
    "GetNaviGuideList":function () {
        var naviGuideList = [];
        var path = this._getPath_();
        if (path != null) {
            var segs = path.getSegments();
            if (segs != null) {
                for (var i = 0; i < segs.length; i++) {
                    var curSeg = segs[i];
                    var icon = MRoute.DGUtil.GetNaviIcon(curSeg.getBasicAction(), curSeg.getAssistAction());
                    var coords = curSeg.getDetailedCoorsLngLat(),
                        time = curSeg.getDriveTimeMinute(),
                        strName = segs[i].getRoadName();
                    if (strName == null){
                        strName = "无名道路";
                    }
                    var item = new MRoute["NaviGuideItem"](curSeg.getDistance(), time,
                        icon, coords[0], coords[1], strName);

                    naviGuideList.push(item);
                }
            }

        }

        return naviGuideList;
    },

    /**
     * 接口函数，获得当前路径的导航段个数
     * 只有在收到SetRequestRouteState发送的接收成功消息后可使用
     * @return {Number} 有路径返回当前导航路径的导航段个数，否则返回0
     */
    "GetSegmentNum":function () {
        var path = this._getPath_();
        if (path != null) {
            return path.getSegmentCount();
        }

        return 0;
    },

    /**
     * 接口函数，获得当前路径的旅行时长，单位分钟
     * @return {Number}
     */
    "GetRouteTime":function () {
        var path = this._getPath_();
        if (path != null) {
            return this._getTime_(path.getDriveTimeMinute(), path.getTmcTimeMinute());
        }

        return 0;
    },

    /**
     * 接口函数，获得一个导航段中Link的数量
     * @param iSegIndex 导航段编号，编号从0开始
     * @return {Number}
     */
    "GetLinkNum":function (iSegIndex) {
        var path = this._getPath_();
        if (path != null) {
            var segments = path.getSegments();
            if (segments != null && segments.length > iSegIndex) {
                return segments[iSegIndex].getLinkCount();
            }
        }

        return 0;
    },

    /**
     * 接口函数，获得一个导航段的旅行时间,单位：分钟
     * @param iSegIndex 导航段编号，编号从0开始
     * @return {Number}
     */
    "GetSegTime":function (iSegIndex) {
        var path = this._getPath_();
        if (path != null) {
            var segments = path.getSegments();
            if (segments != null && segments.length > iSegIndex) {
                return this._getTime_(segments[iSegIndex].getDriveTimeMinute(), segments[iSegIndex].getTmcTimeMinute());
            }
        }

        return 0;
    },

    /**
     * 接口函数，获得一个导航段的长度,单位：米
     * @param iSegIndex 导航段编号
     * @return {Number}
     */
    "GetSegLength":function (iSegIndex) {
        var path = this._getPath_();
        if (path != null) {
            var segments = path.getSegments();
            if (segments != null && segments.length > iSegIndex) {
                return segments[iSegIndex].getDistance();
            }
        }

        return 0;
    },

    /**
     * 接口函数，获得一个导航段的收费长度,单位：米
     * @param iSegIndex 导航段编号
     * @return {Number}
     */
    "GetSegChargeLength":function (iSegIndex) {
        var path = this._getPath_();
        if (path != null) {
            var segments = path.getSegments();
            if (segments != null && segments.length > iSegIndex) {
                return segments[iSegIndex].getTollDistance();
            }
        }

        return 0;
    },

    /**
     * 接口函数，获得一个导航段的LocationCode的数目
     * @param iSegIndex 导航段编号
     * @return {Number}
     */
    "GetSegLocationCodeNum":function (iSegIndex) {
        var path = this._getPath_();
        if (path != null) {
            var segments = path.getSegments();
            if (segments != null && segments.length > iSegIndex) {
                var nslc = segments[iSegIndex].getTmcInfo();
                if (nslc != null) {
                    return nslc.length;
                }
            }
        }

        return 0;

    },

    /**
     * 接口函数，获得一个LocationCodeItem
     * @param iSegIndex 导航段编号
     * @param iLocIndex  code编号
     * @return {MRoute.LocationCodeItem} 参见LocationCodeItem定义
     */
    "GetSegLocationCode":function (iSegIndex, iLocIndex) {
        var path = this._getPath_();
        if (path != null) {
            var segments = path.getSegments();
            if (segments != null && segments.length > iSegIndex) {
                var records = segments[iSegIndex].getTmcInfo();
                if (records != null && records.length > iLocIndex) {
                    return new MRoute["LocationCodeItem"](records[iLocIndex].getLocationCode(),
                        records[iLocIndex].getLength(),
                        records[iLocIndex].getTime());
                }
            }
        }

        return null;
    },

    /**
     * 接口函数，获得一个导航段的形状坐标点列表
     * 当前iSegIndex小于总导航个数时返回形状点数组，否则返回null
     * @param iSegIndex 要获取信息的导航段编号，编号从0开始
     * @return {Array}坐标信息列表 ，按经度，纬度，经度，纬度顺序排列
     */
    "GetSegCoor":function (iSegIndex) {
        var coorList = [];
        var path = this._getPath_();
        if (path != null) {
            var segments = path.getSegments();
            if (segments != null && segments.length > iSegIndex) {
                var coors = segments[iSegIndex].getDetailedCoorsLngLat();
                for (var i = 0; i < coors.length; i++) {
                    coorList.push(coors[i]);
                }
            }
        }
        return coorList;
    },

    /**
     * 接口函数，获得一个Link的形状坐标点列表
     * 输入参数正确返回列表，否则返回空列表
     * @param iSegIndex 要获取信息的导航段编号，编号从0开始
     * @param iLinkIndex 要获取信息的Link段编号，编号从0开始
     * @return {Array}坐标信息列表，按经度，纬度，经度，纬度顺序排列
     */
    "GetLinkCoor":function (iSegIndex, iLinkIndex) {
        var coorList = [];
        var path = this._getPath_();
        if (path != null) {
            var segments = path.getSegments();
            if (segments != null && segments.length > iSegIndex) {
                var link = segments[iSegIndex].getLink(iLinkIndex);
                if (link != null) {
                    var coors = segments[iSegIndex].getDetailedCoorsLngLat();
                    var sId = link.getStartCoorIndex(), eId = link.getEndCoorIndex();
                    for (var i = sId; i < eId; i++) {
                        coorList.push(coors[i]);
                    }
                }
            }
        }
        return coorList;
    },

    /**
     * 接口函数，获得一个Link的道路名称
     * @param iSegIndex  要获取信息的导航段编号，编号从0开始
     * @param iLinkIndex 要获取信息的Link段编号，编号从0开始
     * @return {string}
     */
    "GetLinkRoadName":function (iSegIndex, iLinkIndex) {
        var path = this._getPath_();
        if (path != null) {
            var segments = path.getSegments();
            if (segments != null && segments.length > iSegIndex) {
                var link = segments[iSegIndex].getLink(iLinkIndex);
                if (link != null) {
                    return link.getLinkName();
                }
            }
        }

        return null;
    },


    /**
     * 接口函数，获得一个Link的长度，单位：米
     * @param iSegIndex 要获取信息的导航段编号，编号从0开始
     * @param iLinkIndex 要获取信息的Link段编号，编号从0开始
     * @return {Number}
     */
    "GetLinkLength":function (iSegIndex, iLinkIndex) {
        var path = this._getPath_();
        if (path != null) {
            var segments = path.getSegments();
            if (segments != null && segments.length > iSegIndex) {
                return segments[iSegIndex].getLinkLength(iLinkIndex);
            }
        }
        return 0;
    },


    /**
     * 接口函数，获得一个Link的旅行时长，单位：分钟
     * @param iSegIndex 要获取信息的导航段编号，编号从0开始
     * @param iLinkIndex 要获取信息的Link段编号，编号从0开始
     * @return {Number}
     */
    "GetLinkTime":function (iSegIndex, iLinkIndex) {
        var path = this._getPath_();
        if (path != null) {
            var segments = path.getSegments();
            if (segments != null && segments.length > iSegIndex) {
                return segments[iSegIndex].getLinkTime(iLinkIndex);
            }
        }
        return 0;
    },

    /**
     * 接口函数，获得一个Link的FormWay
     * @param iSegIndex 要获取信息的导航段编号，编号从0开始
     * @param iLinkIndex 要获取信息的Link段编号，编号从0开始
     * @return {Number} 枚举变量，参见MRoute.Formway
     */
    "GetLinkFormWay":function (iSegIndex, iLinkIndex) {
        var path = this._getPath_();
        if (path != null) {
            var segments = path.getSegments();
            if (segments != null && segments.length > iSegIndex) {
                var link = segments[iSegIndex].getLink(iLinkIndex);
                if (link != null) {
                    return Number(link.getLinkForm());
                }
            }
        }

        return Number(MRoute.Formway.Formway_Divised_Link);
    },

    /**
     * 接口函数，获得一个Link的RoadClass
     * @param iSegIndex 要获取信息的导航段编号，编号从0开始
     * @param iLinkIndex 要获取信息的Link段编号，编号从0开始
     * @return {Number} 枚举变量，参见MRoute.RoadClass
     */
    "GetLinkRoadClass":function (iSegIndex, iLinkIndex) {
        var path = this._getPath_();
        if (path != null) {
            var segments = path.getSegments();
            if (segments != null && segments.length > iSegIndex) {
                var link = segments[iSegIndex].getLink(iLinkIndex);
                if (link != null) {
                    return Number(link.getRoadClass());
                }
            }
        }

        return Number(MRoute.RoadClass.RoadClass_Non_Navi_Road);
    },

    /**
     * 接口函数，获得一个Link的LinkType
     * @param iSegIndex 要获取信息的导航段编号，编号从0开始
     * @param iLinkIndex 要获取信息的Link段编号，编号从0开始
     * @return {Number} 枚举变量，参见MRoute.LinkType
     */
    "GetLinkLinkType":function (iSegIndex, iLinkIndex) {
        var path = this._getPath_();
        if (path != null) {
            var segments = path.getSegments();
            if (segments != null && segments.length > iSegIndex) {
                var link = segments[iSegIndex].getLink(iLinkIndex);
                if (link != null) {
                    return Number(link.getLinkType());
                }
            }
        }

        return Number(MRoute.LinkType.LinkType_Common);
    },

    /**
     * 接口函数，获得一个路段的状态  // need supply
     * @param wLocCode 路段对应的LocationCode
     * @return {Number} 查询到的道路状态, 参见MRoute.RoadStatus
     */
    "GetRoadStatus":function (wLocCode) {

        if ((wLocCode & 0x8000) != 0)         //反向		最高位为1，反向
        {
            wLocCode = -(wLocCode & 0x7FFF);
        }
        //实时获取 tmc信息
        //m_pstTMC->GetRoadStatus( wLocCode,forward, stRoadStatus);
        //var stObj = new MRoute.RoadStatus();
        //return Number(stObj.eStatus);

        if (this.m_pstTMC != null) {
            return this.m_pstTMC.getRoadStatus(wLocCode);
        }
        return 0;

    },

    /**
     * 接口函数，创建一个光柱
     * @param iStart        到路径起点的距离
     * @param iLength           要获取路况的路段长度
     * @return {Array, Array}      各段长度列表，各段路况列表
     */
    "CreateTMCBar":function (iStart, iLength) {

        if (!this.m_NaviStatus.GetDrawDt()) {
            //TestInfoLog("TBT-CreateTMCBar: tmc forbid!");
            return null;
        }

        if (this.m_pstTMC != null) {
            return this.m_pstTMC.createTMCBar(iStart, iLength);
        }

        return null;
    }

});
MRoute["CTBT"] = MRoute.JsTBT;

MRoute.DestNode = Class(MRoute.NvPoint,{

    IsArrived : 0,      /// 是否到达
    //relatedSegId :0,    /// 关联分段号

	"initialize":function(){
		
	}

});

MRoute.NmeaData = Class({
    /// 浮点数，纬度, 单位度 (正值为北纬, 负值为南纬)
    lat:0,
    /// 浮点数，经度, 单位度 (正值为东经, 负值为西经)
    lon:0,
    /// 浮点数，海拔, 单位米
    altitude:0,
    /// 浮点数，速度, 单位千米/时
    speed:0,
    /// 浮点数，方向角, 单位度
    track:0,
    /// 浮点数，地磁变化, 单位度
    magVariation:0,
    /// 浮点数，位置精度参数
    pdop:0,
    /// 浮点数，水平精度参数
    hdop:0,
    /// 浮点数，垂直精度参数
    vdop:0,
    /// 浮点数，星空图卫星个数
    numSats:0,
    /// GPS定位质量
    FixedMode:0,
    /// GPS(BJ)时间－－年
    Year:0,
    /// GPS(BJ)时间－－月
    Month:0,
    /// GPS(BJ)时间－－日
    Day:0,
    /// GPS(BJ)时间－－时
    Hour:0,
    /// GPS(BJ)时间－－分
    Minute:0,
    /// GPS(BJ)时间－－秒
    Second:0,
    /// 前一次定位质量 0 无效点 1有效点 2修正点
    lastFixQuality:0,
    /// bool型，是否曾经定位成功过
    bEverValid:false,
    /// 定位成功与否的标志
    nValid:true,
    "initialize":function(){

    },

    GetLoc:function()
    {
        return new MRoute.NvPoint(this.lon, this.lat);
    },

    TimeEqual:function(np){
        if(this.Year == np.Year
            && this.Month == np.Month
            && this.Day == np.Day
            && this.Hour == np.Hour
            && this.Minute == np.Minute
            && this.Second == np.Second)
        {
            return true;
        }
        return false;

    }

});
MRoute["LocationCodeItem"] = Class({

    "code":0,
    "dist":0,
    "time":0,
   "initialize":function(code, dist, time){
       this["code"] = code;
       this["dist"] = dist;
       this["time"] = time;
	}
   
});
MRoute["NaviGuideItem"] = Class({
    "distance":0,         //当前分段路径长度, 单位：米
    "driveTime":0,        //当前分段行驶时间，单位：分钟
    "directionIcon":0,    //当前分段转向图标
    "roadName":"",        //路径名称
    "startLon":0,         //起始点经度
    "startLat":0,         //起始点纬度

    "initialize":function(dist, time, icon, lon, lat, name){
        this["distance"] = dist;
        this["driveTime"] = time;
        this["startLon"] = lon;
        this["startLat"] = lat;
        this["roadName"] = name;
        this["directionIcon"] = icon;
    }
});

MRoute.RoadStatus = Class({
    nSpeed : 0,		// 速度
    eStatus : 0,     // 状态
    "initialize":function(){
    }
});
window["MRoute"] = MRoute;

})();