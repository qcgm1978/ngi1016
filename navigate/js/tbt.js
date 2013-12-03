/**
 * @class NavFrame类
 * @construct NavFrame
 */
function NavFrame(config) {
    if(config) {
        this.error = config.error;
        this.hideLaneEle = config.hideLaneEle;
    }
    this.watchId = null;
    this.naviStatus = {
        emulNaviStatus : false //模拟导航状态
    }
    this.bReroute =false;
    this.tbt_enable_ret = false;
    this.remain_metre = Infinity;
    this.tbt_remain_miniute = Infinity;
    var layerConfig = {
        id : 'msg_box_light_cross',
        msg : GLOBAL.Constant.prompt_request
    };
    this.promptBoxWhenRequest = new GLOBAL.layer(layerConfig);
    /**
     @description 在实例化NavFrame()时创建tbt对象，将框架的引用赋给tbt对象，以使得tbt内部能调用框架接口
     */
    tbt = new MRoute.CTBT(this, "");
    this.currentRoadName = this.nextRoadName = null;
    this.rapidPathArray = this.normalPathArray = null;
    this.NavigationInfo = null;
    this.laneInfo = null;//车道信息
}

NavFrame.prototype = {
    iniData : function() {
        this.itype = parseInt(localStorage['route_type']);
        this.remain_metre = this.plan_distance = tbt.GetRouteLength();
		tbt.SetEleyePrompt(localStorage['Map_system_eye']=="true"?1:0);
        try{
            var roadSeg = tbt.GetNaviGuideList();
            this.currentRoadName = roadSeg[0].roadName;
            this.nextRoadName = typeof roadSeg[1] !="undefined"? roadSeg[1].roadName:roadSeg[0].roadName;
            this.firstSegLength = Tab.unit_conversion(roadSeg[0].distance, 1);
        }catch(e){
            console.log("Error occured in iniData function:"+e);
        }

        this.tbt_remain_miniute = tbt.GetRouteTime();
    },
//    只有在手动停止导航，或到达终点时重置导航类数据
    setIniState : function() {
        this.remain_metre = Infinity;
        this.tbt_remain_miniute = Infinity;
        this.naviStatus = {
            emulNaviStatus : false //模拟导航状态
        }
        this.bReroute =false;
        this.tbt_enable_ret = false;
        this.currentRoadName = null;
        this.nextRoadName = null;
        this.NavigationInfo = null;
        this.firstSegLength = Infinity;
    },

    RequestPath : function() {
         // 设置自车起始位置
        tbt.SetCarLocation(new MRoute.NaviPoint(this.start.x, this.start.y));
         //time 请求发起时间，用于判断请求是否超时
        this.startRequestTime = new Date();
        var pathState = tbt.RequestRoute(parseInt(localStorage['RouteRequestType']) , [ new MRoute.NaviPoint(
            this.end.x, this.end.y) ]);
        // 如果起始点坐标相同，退出导航状态.此时不会发起网络路径请求，处理这种异常
        if (pathState == false) {
            localStorage['tbt_state'] = false;
            this.bReroute = false;
            GLOBAL.NavClass.startEndSameHandler(this);
        }
    },

    StartEmulator : function() {
        tbt.SelectRoute(this.itype);
        this.naviStatus.emulNaviStatus = tbt.StartEmulatorNavi();
    },
    //重构：Extract Method,抽取出新方法ResumeEmulator，分别控制模拟导航的暂停及恢复
    Pause : function() {
        if (this.naviStatus.emulNaviStatus) {
            tbt.PauseNavi();
        }
    },
    ResumeEmulator : function() {
        tbt.SelectRoute(this.itype);
        tbt.ResumeNavi();
        this.naviStatus.emulNaviStatus = true;
    },
//        停止模拟导航时首先调用接口方法，然后再重置状态参数值，否则地图状态有误
    StopEmulator : function() {
        if( this.naviStatus.emulNaviStatus){
            tbt.StopEmulatorNavi();
            this.naviStatus.emulNaviStatus = false;
            this.setIniState();
            this.iniData();
        }
    },
    StartGpsNavi : function() {
        GLOBAL.NavClass.startGpsNavi(this);
    },

    ShowPath : function(itype) {
        var constant = GLOBAL.Constant;
         //请求到两条路径或重算路径的情况下清除后重画路径
        var polylineNum = Event.mapObj.getOverlaysByType('polyline').length;
        tbt.SelectRoute(localStorage['route_type']);
        if (polylineNum > 4) {
            Event.mapObj.removeOverlays(["NGIRoute0","NGIRoute1","NGIRoute2","NGIRoute3"]);//只保留高亮的路径
            Event.mapObj.getOverlays(constant.HighlightedLineId).setOptions({strokeColor:constant.inner1_line.strokeColor});
        }else if(polylineNum == 4){
            Event.mapObj.getOverlays("NGIRoute1").setOptions({strokeColor:constant.inner1_line.strokeColor});
        }else if(polylineNum < 4){
            var path = MapEvent.getCoordsArray({tbt : tbt});
            if(parseInt(localStorage['route_type'] == constant.iRapid))
                constant.nav_obj.rapidPathArray = path;
            else
                constant.nav_obj.normalPathArray = path;
            MapEvent.drawOnePath(path);
            Event.mapObj.getOverlays("NGIRoute1").setOptions({strokeColor:constant.inner1_line.strokeColor});
        }
        MapEvent.add_destn_direction();
        var arrGuideList = tbt.GetNaviGuideList();
        //添加转折marker覆盖物
        MapEvent.AddMarkerOverlays(arrGuideList);
    },
    StopGpsNavi : function() {
        tbt.StopNavi();
        localStorage['tbt_state'] = false;
        this.setIniState();
    },
    /*以下的部分是导航sdk需要回调的应用端函数实现*/
    /**
     * 响应TBT模块的HTTP请求
     * 此接口为异步接口，调用占用实现者的线程，函数调用必须立即返回
     * @param iModelID      模块号：1 移动交通台，2 TMC，3 在线导航
     * @param iConnectID    连接ID，Frame请求到数据后用此ID将数据传给TBT
     * @param strURL        请求的URL串
     * @param strHead       HTTP头，默认为空
     * @param strData       Post方式的Data数据，默认为空
     * @param bGetMode      true为Get方式，false为post方式
     */
    NetRequestHTTP : function(iModelID,iConnectID, strURL,strHead,strData, bGetMode) {
        new NGIRoute.RouteRequest(strURL,function(postStream){
            tbt.ReceiveNetData(iModelID, iConnectID, postStream);
        });
    },

    /**
     * 更新导航信息
     * @param DGNaviInfor  包含的字段如下
         eNaviType:0,            // 当前导航类型，1为模拟导航，2为GPS导航
         eTurnIcon:0,            // 导航段转向图标
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
         fLongitude:0,           // 自车经度位置
         fLatitude:0,            // 自车纬度位置
         nCurSegIndex:0,         // 当前自车所在导航段编号;
         nCurLinkIndex:0,        // 当前自车所在Link编号
         nCurPtIndex:0,          // 当前自车距离最近的形状点位编号
     */
    UpdateNaviInfor : function(DGNaviInfor) {
        if(!JSON.parse(localStorage['tbt_state']) && !GLOBAL.Constant.nav_obj.naviStatus.emulNaviStatus )
            return;
        var navclass = GLOBAL.NavClass;
        this.NavigationInfo = DGNaviInfor;
        navclass.saveCurrLngLat(DGNaviInfor);
        navclass.updateGPS(DGNaviInfor);
        navclass.updatePathName(DGNaviInfor,this);
        navclass.updateMark(DGNaviInfor);
        navclass.updateTimeDistance(DGNaviInfor,this);
        navclass.updateMapWithCompass(DGNaviInfor) ;
        navclass.updatePointingDirection(DGNaviInfor);
        navclass.drawDynamicLightCross(this);
        navclass.updateCrossDistImg(DGNaviInfor.nSegRemainDist,this);

    },
    /**
     * 播报字符串的相关处理
     * @param iType  语音类型：0 导航播报，2 前方路况播报
     * @param SoundStr 要播报的字符串
     */
    PlayNaviSound : function(iType, SoundStr) {
        if(iType == 2){
            if(JSON.parse(localStorage['TMCBroadcast'])){
                //TODO 调用语音播报接口
                parent.playTTS(SoundStr);
            }
        }else  if (iType == 0) {//导航语音播报
            parent.playTTS(SoundStr);
            GLOBAL.NavClass.voice_or_text(SoundStr);
        }
        if(typeof  parent.logtest !="undefined"){
            parent.logtest.writeFile(SoundStr);
        }
    },
    /**
     * 通知到达途经点，如果到达目的地iWayID为-1
     * @param iWayID 到达途径点的编号，标号从1开始，如果到达目的地iWayID为-1
     */
    ArriveWay : function(iWayID) {
        console.log("way id:"+iWayID);
        if (iWayID == -1) {
            this.HideLaneInfo();
             //导航结束后恢复初始状态
            thisPage.retMapIni('mapIni');
            GLOBAL.Event.NGIStateManager.goToNextState("Map",function(){return true;});
        }
    },

    /**
     * @description 通知当前匹配后的GPS位置点
     * @param vpLocation 当前匹配后的点
     * @see 参见VPLocation结构
         dLon:0,                         //  当前自车经度
         dLat:0,                         //  当前自车纬度
         nAngle:0,                       // 当前车辆的方向
         nSpeed:0,                       //当前车辆的行驶速度
     */
    CarLocationChange : function(vpLocation) {
        //保存自车经纬度到本地变量，以便下次请求路径或下次程序启动时未获得经纬度情况下调用.只要调用了tbt.Setgpsinfo（html5接口或gps log模拟导航时调用），就会有carLocationChange通知,因此需要保存当前经纬度信息。
        var config = {
            lng : vpLocation.dLon,
            lat : vpLocation.dLat,
            direction : vpLocation.nAngle
        };
        GLOBAL.Common.modifyCurrentPosition(config);
           //非导航状态下
       if (!this.naviStatus.emulNaviStatus && !JSON.parse(localStorage['tbt_state'])) {
             //改变自车位置，未查询兴趣点时改变地图中心位置及自车或地图旋转角度.
            GLOBAL.NavClass.setCurrentCarLocation(vpLocation);
        }
    },
    /**
     * 通知路径计算状态
     * @param eState  参见RouteRequestState定义，异步实现
     * 	说    明：requestRouteState含义如下
     *  1	路径计算成功
     *  2	网络超时
     *  3	网络失败
     *  4	请求参数错误
     *  5	返回数据格式错误
     *  6	起点周围没有道路
     *  7	起点在步行街
     *  8	终点周围没有道路
     *  9	终点在步行街
     *  10	途经点周围没有道路
     *  11	途经点在步行街
     */
    SetRequestRouteState : function(eState) {
        var constant = GLOBAL.Constant;
        this.promptBoxWhenRequest.hide();
        if($("#alert_box").is(":visible"))
            $("#alert_box").remove();
        //如果路径请求失败,目前区分提供网络超时和网络失败，只提供三种状态，成功，数据格式错误，网络错误
        if(constant.iEstateSuccess.indexOf(eState) == -1){
            switch(eState){
                case constant.iEstateTimeOut:
                case constant.iEstateFail:
                    GLOBAL.NavClass.requestPathTimeOutOrFail(this);
                    break;
                case constant.iEstateError:
                    console.log('return data format error');
                    break;
                default:
                    console.log('other error');
            }
            //1表示从开始请求算路到现在最大请求时间为1秒, 默认15
           // constant.tbt_timeout_interval = 1;
            localStorage['tbt_state'] = false;
            this.bReroute = false;
            if(Event.mapObj.getOverlays("target"))
                Event.mapObj.removeOverlays('target') ;
            if(GLOBAL.Event.NGIStateManager.getCurrentState() != constant.NGIStates.Map)
                GLOBAL.Event.NGIStateManager.goToNextState(constant.NGIStates.Map,function(){
                        thisPage.switchToMapInterface();
                        businessManager.init_Map();
                        return true;}
                );
            return;
        }


        //如果上次导航非正常退出且当前不在导航状态，说明是第一次进入页面状态
        if (constant.resumeLastNavi) {
            GLOBAL.Event.NGIStateManager.goToNextState(GLOBAL.Constant.NGIStates.Navigation,GLOBAL.Event.NavScreenEvent.showNaviMapScreen);
            constant.resumeLastNavi = null;
        }else{
            if(eState == 1) //如果是普通求路的情况
                GLOBAL.NavClass.displayDoubleLightLayer();
            else{
                this.iniData();
                this.ShowPath(this.itype);
                this.bReroute = false;
                localStorage['tbt_state'] = true;
                //移动地图，使当前自车位置在地图中心
                GLOBAL.NavClass.updateGPS();
            }
        }
    },

    /**
     * 通知当前位置前方2km范围内需要下载的扩大图
     * @param arrBack {Array}  背景图
     * @param arrFore {Array}  前景图
     * @param arrSegId {Array} 所属导航段编号
     */
    CrossRequest:function(arrBack, arrFore, arrSegId){
        for(var i=0;i<arrBack.length;i++){
            if(arrBack[i] == -1)
                continue;
            var img1 = new Image(),img2 = new Image();
            img1.src ="http://211.151.71.28:8888/bgpic/"+arrBack[i]+".jpg";
            img2.src ="http://211.151.71.28:8888/arrowpic/"+arrFore[i]+".png";
        }

    },
    /**
     * 显示路口扩大图时，tbt会回调这个函数，参数是前景图和背景图的id以及到路口的距离
     * @param bgImageId 背景图对应的id
     * @param foreImageId 前景图也就是箭头对应的id
     * @param segRemainDist 当前位置到路口的距离
     */
    ShowCross : function(bgImageId,foreImageId,segRemainDist) {
        if(bgImageId == undefined || foreImageId == undefined)
            return;
        var roadCrossPanel = $("#roadCrossPanel"),imgServerhost ="http://211.151.71.28:8888" ;
        var bgimg = imgServerhost+"/bgpic/"+bgImageId+".jpg",
            foreimg = imgServerhost+"/arrowpic/"+foreImageId +".png";
        if(roadCrossPanel.hasClass("none") && GLOBAL.Event.NGIStateManager.getCurrentState() == GLOBAL.Constant.NGIStates.Navigation){
            $("#roadCrossPanel > .roadName").html(this.currentRoadName);
            var bgImage = $('<img src="'+bgimg+'" class="crossImage" alt="">');
            var foreImage = $('<img src="'+foreimg+'" class="crossImage" alt="">');
            var distanceFromCross = $("#roadCrossPanel > .distanceFromCross");
            distanceFromCross.before(bgImage).before(foreImage);
            roadCrossPanel.removeClass("none");
        }
        if(segRemainDist !=undefined)
            GLOBAL.NavClass.updateCrossDistImg(segRemainDist,this);
    },

    /**
     * 隐藏路口扩大图
     * 该函数会被tbt回调
     */
    HideCross : function() {
        if(!($("#roadCrossPanel").hasClass("none")))
            $("#roadCrossPanel").addClass("none");
        $("#roadCrossPanel img").remove();
    },
    /**
     * 通知需要重新规划路径 一般应调用TBT的Reroute函数完成路径重规划
     * 当偏离原路径时触发，用户可控制重新规划的逻辑
     */
    Reroute:function () {
        parent.playTTS(GLOBAL.Constant.prompt_reroute);
        GLOBAL.NavClass.reroutePath(this);
    },
    /**
     * 在外部关注是否reroute中,用于管理重新规划路径方法
     * @description 通知需要重新规划路径 一般应调用TBT的Reroute函数完成路径重规划
     * 当偏离原路径时触发，用户可控制重新规划的逻辑.通知重新规划路径, 因TMC改变触发,静默算路
     */
    RerouteForTMC:function(){
        var that = this,layerPrompt = new GLOBAL.layer({id:'alert_box',msg:GLOBAL.Constant.prompt_tmcreroute});
        if(!JSON.parse(localStorage['TMCReroute'])) //用户设置禁止静默算路
            return;
        else{
            if($("#alert_box").is(":visible") || $("#prompt_box").is(":visible"))
                return;
            if(JSON.parse(localStorage['TMCReroutePrompt'])){
                parent.playTTS(GLOBAL.Constant.prompt_reroute_tts);
                var layerFirst = new GLOBAL.layer({id:'prompt_box',msg:GLOBAL.Constant.prompt_reroute_dialog});
                layerFirst.show();
                $('#prompt_box img[alt="是按钮"]').click(function() {
                    GLOBAL.NavClass.reroutePath(that);
                    layerFirst.hide();
                    layerPrompt.show();
                });
                $('#prompt_box img[alt="否按钮"]').click(function() {
                    layerFirst.hide();
                });
                setTimeout(function(){layerFirst.hide()},10000);
                return;
            }else{
                parent.playTTS(GLOBAL.Constant.prompt_tmcreroute);
                layerPrompt.show();
                GLOBAL.NavClass.reroutePath(that);
            }
        }
    },
    /**
     * 通知当前路径销毁，reroute,正常求路，以及结束导航之前都会发送RouteDestroy，这个通知到达后，可以做外部的路径清理工作，
     */
    RouteDestroy : function() {
        localStorage['tbt_state'] = false;
        this.NavigationInfo = null;
        if (!this.bReroute) {
            this.setIniState();
        }
         //删除polyline,转折marker
        Event.mapObj.clearOverlaysByType('polyline');
        GLOBAL.NavClass.removeTurnMarkerState();
        Event.mapObj.removeOverlays("destnDirection");
    },
    /**
     * tbt内部成功结束模拟导航的回调函数
     * 指引模拟导航结束后通知Frame以便更新UI界面等
     */
    EndEmulatorNavi : function() {
        this.naviStatus.emulNaviStatus = false;
        if(JSON.parse(localStorage['tbt_state'])){
            uiManager.setPageState({pageState:'',gpsState:true});
        }else{
            ui.interface.iniState('mapIni');
        }
    },
    /**
     * 通知动态信息改变，应用层可以去获取动态更新后的值，来更新光柱等显示信息
     */
    TMCUpdate : function() {
        if ($('#light_cross_html').is(':visible')) {
            GLOBAL.NavClass.lightCross();
        }
    },

    /**
     * 显示车道信息
     * @param BackInfo  {Array} 车道背景信息
     * @param SelectInfo {Array} 车道选择信息
     */
    ShowLaneInfo : function(iBackInfo, iSelectInfo) {
        this.laneInfo = { 'iBackInfo':iBackInfo,'iSelectInfo':iSelectInfo};//保存车道信息
        //仅在导航界面显示车道信息
        if(GLOBAL.Event.NGIStateManager.getCurrentState() == GLOBAL.Constant.NGIStates.Navigation)
            GLOBAL.NavClass.addTrafficLaneIcon(iBackInfo, iSelectInfo);
    },
    /**
     * 隐藏车道信息
     */
    HideLaneInfo : function() {
        if (this.hideLaneEle) {
            this.hideLaneEle();
        }
    },
    /**
     * 显示情报板
     * @param id     情报板图片对应的id
     */
    ShowTrafficPanel:function (id) {
    },
    /**
     * 关闭情报板
     */
    HideTrafficPanel : function() {
    }
};
/**
 @class 导航事件类,工具函数
 */
GLOBAL.NavClass = {
    /**
     @description 改变旋转方向。NorthUp，地图向北；HeadUp，车头向上
     地图进入导航时是否进入罗盘模式(罗盘模式:车头向上,改变地图方向,同时在左上角显示出地图向上时的方向 ,
     地图向北模式:上方为地图正北方向,行驶过程中,尖头方向为车辆当前方向
     */
    /**
     *
     * @param DGNaviInfor
     */
    updateMapWithCompass : function(DGNaviInfor){
        if(localStorage['Navi_Compass_Mode'] =="HeadUp") {
            var t = DGNaviInfor.nCarDirection ;
            //算法:角度除以45再模8,得到0-7等8个方向数值,再根据图片的各字,来换相应的图片
            $('#compass').attr('src' , 'images/images/compass0'+
                ( Math.round(t / 45) % 8 + 1) + '.png') ;
            //改变地图方向 (因为自车位置在地图覆盖物,地图旋转自车位置也会旋转,必须调整自车位置方向向上
            $('#current').css('-webkit-transform' , 'rotate('+ t +'deg)');
            //根据tbt返回的角度旋转地图
            Event.mapObj.setRotation(-t) ;
        }
        else {
            $('#current').css('-webkit-transform' , 'rotate('+ DGNaviInfor.nCarDirection +'deg)');
        }
    } ,
    addTrafficLaneIcon : function(iBackInfo, iSelectInfo) {
        var constant = GLOBAL.Constant,iconTrafficLane = constant.icon_traffic_lane, spans = '';
        $.each(iBackInfo, function(i, n) {
            $.each(iconTrafficLane, function(k, m) {
                var src = '', bgImg = '';
                /**
                 @description 如果车道背景数组元素等于常量对象某属性的code值
                 */
                if (n == m.code) {
                    /**
                     @description 如果该车道背景元素值等于推荐车道数组的相应元素值，说明推荐该道路，直接插入该图片的高亮格式，无须设置背景图片
                     */
                    if (n == iSelectInfo[i]) {
                        bgImg = 'none';
                        src = 	"images/images/" + m.picture;
                        src = src.replace(/(\.png)/, '_1$1');
                    }
                    /**
                     @description 如果两个值不相等，且推荐车道数组对应值为有效值，则设置背景数组元素对应图片为背景属性值，推荐车道数组对应值为插入图片src值
                     */
                    else if (iSelectInfo[i] != 15) {
                        var srcCode = iSelectInfo[i];
                        var config = {
                            bgCode: n,
                            foreCode: srcCode
                        };
                        var strImg = GLOBAL.NavClass.getForeImg(config);
                        src = "images/images/" + strImg;
                        bgImg =  'url(' + "images/images/" + m.picture + ')';
                    }
                    /**
                     @description 如果推荐车道数组对应值为无效值，直接插入背景数组元素值的灰色形式作为图片值
                     */
                    else if (iSelectInfo[i] == 15){
                        src = "images/images/" + m.picture;
                        bgImg = 'none';
                    }
                    /**
                     @description 创建具有src属性和背景图片样式的img元素到#mark元素内
                     */
                    var img = '<img src="' +src +'" style="background-image:' + bgImg +';">';
                    var span = '<span>' + img + '</span>';
                    spans += span;
                    return false;
                }
            });
        });
        $('#mark').html(spans);
        var width = $('#mark').width();
        $('#mark')
            .css('left', 800 / 2 - width / 2)
            .show();
    },
    /**
     @description 获得前景图名称，如果foreCode属性里的值是一个对象，遍历这个对象，查找对应的前景图。前景图根据其相对于背景图的位置可能有多种选择
     */
    getForeImg: function(config) {
       var constant = GLOBAL.Constant;
        var imgForeground = constant.icon_traffic_lane_foreground,strImg = '';
        var ele = imgForeground[config.foreCode];
        if (ele instanceof Object) {
            $.each(ele, function(i, n) {
                if (i == config.bgCode) {
                    strImg = n;
                    return false;
                }
            });
        }
        else {
            strImg = ele;
        }
        return strImg;
    },
    /**
     * 根据推送的gps参数信息更新自车覆盖物和地图中心位置，产生移动效果
     * @param DGNaviInfor
     */
    updateGPS : function(DGNaviInfor) {
        var constant = GLOBAL.Constant;
        if (constant.nav_obj.naviStatus.emulNaviStatus || JSON.parse(localStorage['tbt_state'])) {
            if (typeof DGNaviInfor === 'undefined') {
                DGNaviInfor = {
                    fLongitude : localStorage['Map_lng'],
                    fLatitude : localStorage['Map_lat']
                };
            }
            var pt = new MMap.LngLat(DGNaviInfor.fLongitude,DGNaviInfor.fLatitude );
            Event.mapObj.getOverlays('current').setPosition(pt);
            //根据状态机确定的状态进行判断,如果是导航状态就移动地图中心,在全图浏览、分段浏览、poi浏览界面不移动
            if ( Event.NGIStateManager.getCurrentState() == constant.NGIStates.Navigation) {
                Event.mapObj.panTo(pt);
            }
        }
    },
    updateMark : function(DGNaviInfor) {
        if (DGNaviInfor.eTurnIcon < 1 || DGNaviInfor.eTurnIcon > 16)
            console.log("valid sdk data %d in the first updating time", DGNaviInfor.eTurnIcon);
        var config = {
            strDir : DGNaviInfor.eTurnIcon,
            distanceSeg : DGNaviInfor.nSegRemainDist
        };
        this.change_direction_icon(config);
    },
    /**
     * 更改mark右上角图片及当前道路剩余路程
     * @param config
     */
    change_direction_icon : function (config) {
        var constant = GLOBAL.Constant,obj_icon = constant.icon_direction_nav;
        $.each(obj_icon, function(i, n) {
            if (parseInt(i) == config.strDir && String(parseInt(i)).length == String(config.strDir).length) {
                var distance = Tab.unit_conversion(config.distanceSeg, 1);
                $('#right img[alt="路程图标"]')
                    .attr('src', n)
                    .siblings()
                    .html(distance);
                return false;
            }
        });
    },
    /**
     * 更新剩余时间和距离
     * @param DGNaviInfor
     */
    updateTimeDistance : function(DGNaviInfor,instance) {
        var routeRemainDis, routeRemainTime, now,constant = GLOBAL.Constant;
        try{
            instance.tbt_remain_miniute = DGNaviInfor.nRouteRemainTime;
            instance.remain_metre = DGNaviInfor.nRouteRemainDist;
            routeRemainDis = Tab.unit_conversion(instance.remain_metre , 1) ;
            if(isNaN(DGNaviInfor.nRouteRemainTime)) {
                routeRemainTime = constant.null_value ;
            }
            else {
                now = new Date() ;
                //当前时间加上用时,计算出预计到达时间
                now.setMilliseconds(now.getMilliseconds() + (instance.tbt_remain_miniute * 1000 * 60 )) ;
                var minute = now.getMinutes() ;
                if(minute < 10)
                    minute = "0" + minute ;
                routeRemainTime = now.getHours() + ":" + minute ;
            }
        } catch(e) {
            routeRemainTime = constant.null_value ;
            routeRemainDis = constant.null_value ;
        }
        $("#routeRemainDis").html(routeRemainDis) ;
        $("#routeRemainTime").html(routeRemainTime) ;
    },
    /*
     @event 更新指向目的地方向的箭头覆盖物坐标及旋转角度
     @arguments NavFrame
     @description
     算法:根据自车位置,终点位置的经纬度,算出正切值再算出解度,取负加90转换成与正北方向的夹角,加上360模360取得0-360的角度
     */
    updatePointingDirection : function(DGNaviInfor) {
        var constant = GLOBAL.Constant;
        /**
         @field constant.nav_obj.end 目的地经纬度对象
         */
        var angle = 0, end = null, obj = Event.mapObj, $img = $('#destnDirection img');
        if (typeof constant.nav_obj !== 'undefined') {
            end = constant.nav_obj.end ;
        }
        else {
            end = {
                x : constant.poi_search_result.lng,
                y : constant.poi_search_result.lat
            }
        }
        if (typeof DGNaviInfor === 'undefined') {
            DGNaviInfor = {
                fLatitude : localStorage['Map_lat'],
                fLongitude : localStorage['Map_lng']
            };
        }
        try{
            if (DGNaviInfor) {
                angle = Math.round(Math.atan2( end.y - DGNaviInfor.fLatitude , end.x - DGNaviInfor.fLongitude ) * 180 / Math.PI);
                angle = ((-angle) + 90 + 360) % 360 ;
                if (obj.getOverlays('destnDirection')) {
                    obj.getOverlays('destnDirection').setPosition(new MMap.LngLat(obj.getOverlays('current').position.lng, obj.getOverlays('current').position.lat)) ;
                }
            }
        } catch(e) {
            console.log(e.message);
            angle = 0 ;
        }
        if('-webkit-transform' in $('img')[0].style){
            $img.css('-webkit-transform' , 'rotate('+ angle + 'deg)') ;
        }
    },
    updatePathName : function(DGNaviInfor,instance) {
        var constant = GLOBAL.Constant;
      /*  if (instance.currentRoadName == DGNaviInfor.curRoadName &&
            instance.nextRoadName == DGNaviInfor.nextRoadName) {
            return;
        }*/
        instance.currentRoadName = DGNaviInfor.curRoadName || constant.no_name_road;
        instance.nextRoadName = DGNaviInfor.nextRoadName || constant.no_name_road;
        if ($('#pull_back_btn img').attr('alt') == GLOBAL.Constant.alt_lower_left_button.menu) {
            $('#gpsNaviCurrRoad').text(instance.nextRoadName);
            $("#current_pos").text(instance.currentRoadName);
         //   $("#emulatorNaviCurrRoad").val(instance.currentRoadName);
        } else {
            $('#gpsNaviCurrRoad').text(instance.currentRoadName);
         //   $("#emulatorNaviCurrRoad").val(instance.currentRoadName);
        }
    },
    //向页面添加导航语音文字，将会被语音引擎调用替换
    voice_or_text : function(SoundStr) {
        $('video').detach();
        $('<video>', {
            autoplay :"autoplay",
            name : "media",
            width : "0",
            height : "0",
            src:"http://10.2.28.86/Test/newfile.php?inputStr="+SoundStr
        }).appendTo('#voice');
        $('#name p').remove();
        $('#name').append('<p>' + SoundStr + '</p>');
    },
    /**
     * 重新开始GPS导航
     * @param instance
     */
    restartGpsNav : function(instance) {
        uiManager.setPageState({pageState:'',gpsState:true});
    },
    startGpsNavi : function(instance) {
        var constant = GLOBAL.Constant;
        tbt.SelectRoute(parseInt(localStorage['route_type']));
        instance.iniData();
        instance.ShowPath(instance.itype);
        //TODO
        localStorage['tbt_state'] = tbt.StartGpsNavi();
        /**
         * @event gps导航状态下，在第一次进入主界面时，可能gps信息未更新，此时调用一次方法，设置地图ui，该方法可能在实走时会有问题
         */
        GLOBAL.NavClass.updateGPS();
        uiManager.changeCarDirection();//更新自车mark方向
        GLOBAL.NavClass.updatePointingDirection();
    },
    /**
     * 读取GPS log文件中的记录并推送给tbt
     * @param arrgps log数组
     */
    GPSTimer_Tick : function(arrgps) {
        if ( GLOBAL.WatchGPS.logGPSId < arrgps.length) {
            var curr = arrgps[GLOBAL.WatchGPS.logGPSId];
            GpsNav.pushGpsInfo(curr);
            GLOBAL.WatchGPS.logGPSId ++;
        } else {
            if (GLOBAL.Constant.tbt_gpsLog_loop) {
                GLOBAL.WatchGPS.logGPSId = 0;
            }
            else {
                clearInterval(GLOBAL.Constant.nav_obj.watchId);
                GLOBAL.Constant.nav_obj.watchId = null;
            }
        }
    },
    /**
     * 使用log中的位置信息作为gps导航的位置来源
     * @return {Number}
     */
    pushGPSLogLatLon:function(){
        var constant = GLOBAL.Constant,that = this;
        var timer = window.setInterval(function() {
            that.GPSTimer_Tick(arrGpsLog2);
        }, constant.tbt_simulateGpsSpeed);
        return timer;
    },
    /**
     * 重算路径通知RouteDestroy时删除转折mark处的红色标志
     */
    removeTurnMarkerState : function() {
	    var marker= Event.mapObj.getOverlaysByType('marker'),markerIdPrefix = GLOBAL.Constant.turnMarkerIdPrefix;
        $.each(marker, function(i, n) {
             //地图上的marker覆盖物包括四种：自车，目的地，指向目的地方向的箭头，以及转折marker标志
				if (n.id.indexOf(markerIdPrefix) > -1) {
                Event.mapObj.removeOverlays(n.id);
            }
        });
    },
    /**
     * 起点和终点重合时候所应该进行的操作
     * @param instance
     */
    startEndSameHandler : function(instance) {
        var constant = GLOBAL.Constant;
        instance.promptBoxWhenRequest.hide();
        var layer = new GLOBAL.layer({
            id : 'msg_box_fail',
            msg : constant.prompt_doublication
        });
        layer.show();
        $('#msg_box_fail img:first').click(function() {
            layer.hide();
            thisPage.switchToMapInterface();
            GLOBAL.Event.NGIStateManager.goToNextState(constant.NGIStates.Map,function(){
                 businessManager.init_Map();
                return true;});
        });
    },
    /**
     * @event 绘制动态光柱信息
     * @param [obj] instance 导航对象
     * @param {int} RemainMetre 可选，导航过程中调用时传入剩余距离
     */
    drawDynamicLightCross : function(instance) {
        var constant = GLOBAL.Constant,remain = 0,pass = 0;
        try {
            remain = GLOBAL.NavClass.getPathRemain(instance);
            pass = GLOBAL.NavClass.getPathDistance(instance) - remain;
             // constant.nav_obj.tbt_enable_ret {bool} 判断是否能执行返程操作
            if (!instance.tbt_enable_ret && pass > 300 && !instance.naviStatus.emulNaviStatus) {
                instance.tbt_enable_ret = true;
            }
            var config = {
                pass:pass,
                callback:ui.interface.lightCross
            };
            //如果光柱显示范围为全程，就传入剩余距离值
            if (isNaN(localStorage['Map_tbt_view'])) {
                config.ken = remain;
            } else {
                config.ken = localStorage['Map_tbt_view'] * constant.iUnit;
            }
            MapEvent.drawLight(config);
        }
        catch (err) {
            console.log(err.message);
        }
    },
    /**
     * 非导航状态更新地图上的自车位置以及自车的方向
     * @param vpLocation
     */
    setCurrentCarLocation : function(vpLocation) {
        var currentOverlay = Event.mapObj.getOverlays('current'),
            objGps = new MMap.LngLat(vpLocation.dLon, vpLocation.dLat);
        currentOverlay.setPosition(objGps);
        if (vpLocation.nAngle != null) {
            vpLocation.nCarDirection = vpLocation.nAngle;
            this.updateMapWithCompass(vpLocation) ;
        }
        //地图拖动后，光标可见，此时不改变地图中心。
        var isMapPaned = $('#center #target').is(':visible');
        if ((Event.NGIStateManager.getCurrentState() == GLOBAL.Constant.NGIStates.Map && !isMapPaned)|| GLOBAL.Constant.nav_obj.bReroute) {
            Event.mapObj.panTo(objGps);
        }
    },
    timeOutHandler : function() {
        var config = {
            id : 'msg_box_fail',
            msg : '路径请求超时，请您稍后重试或检查终端网络是否连接正常。'
        };
        var layer = new GLOBAL.layer(config);
        layer.show();
    },
    /**
     * @event 重新规划路径,调用TBT的Reroute函数完成路径重规划
     */
    reroutePath : function(instance) {
        instance.bReroute = true;
        tbt.Reroute();
        instance.remain_metre = Infinity;
        instance.tbt_remain_miniute = Infinity;
        instance.plan_distance = Infinity;
    },
    /**
     * 绘制双光柱界面的光柱
     */
    lightCross : function() {
        var constant = GLOBAL.Constant;
        tbt.SelectRoute(constant.iRapid);
        this.obtainFullTrafic({
            id: 'rapid',
            routeLength: tbt.GetRouteLength()
        });
        tbt.SelectRoute(constant.iNormal);
        this.obtainFullTrafic({
            id: 'normal',
            routeLength: tbt.GetRouteLength()
        });
    },
    obtainFullTrafic : function(config) {
        var arr = MapEvent.drawLight({
            pass: 0,
            ken: config.routeLength
        });
        try {
            var arg = {
                arr: arr,
                id: config.id,
                total: $('#rapid').height(),
                metric: 'height',
                address: 'url(images/images/bg_'
            }
        } catch (err) {
            console.log(err.message);
        }
        var testLight = new SimulatorLight(arg);
        var configArg = testLight.generateArg();
        Tab.set_bg(configArg);
    },
    /**
     * 将当前的位置写入到localstorage中
     * @param DGNaviInfor
     */
    saveCurrLngLat : function(DGNaviInfor) {
        if (!GLOBAL.Constant.nav_obj.naviStatus.emulNaviStatus) {
            var config = {
                lng : DGNaviInfor.fLongitude,
                lat : DGNaviInfor.fLatitude,
                direction : DGNaviInfor.nCarDirection
            };
            GLOBAL.Common.modifyCurrentPosition(config);
        }
    },
    /**
     * 路径请求超时应该弹出对话框，并且恢复地图状态
     * @param instance
     */
    handleRequestPathTimeOut : function(instance) {
        GLOBAL.NavClass.timeOutHandler();
        instance.setIniState();
        ui.interface.iniState('mapIni');
        GLOBAL.Event.NGIStateManager.goToNextState("Map",function(){return true;});
    },
    /**
     * 收到路径请求失败的结果，根据所花费的时间判断是否需要再次发起请求
     * @param instance
     */
    requestPathTimeOutOrFail : function(instance) {
        if (!navigator.onLine) {
            GLOBAL.NavClass.timeOutHandler();
        } else {
            if (instance.startRequestTime instanceof Date) {
                var timeNow = new Date(), bool = 0;
                bool = Tab.getDateDiff(instance.startRequestTime, timeNow, GLOBAL.Constant.tbt_timeout_interval);
                //判断路径请求是否超时，如果超时则提示用户，否则需要再次发起请求
             /*   if (!bool) {
                    instance.RequestPath();
                } else {
                    this.handleRequestPathTimeOut(instance);
                }*/
                this.handleRequestPathTimeOut(instance);
            }
        }
    },
    /**
     * 请求路径成功后进入双光柱界面显示
     */
    displayDoubleLightLayer : function() {
        var event = GLOBAL.Event;
        event.NGIStateManager.goToNextState(GLOBAL.Constant.NGIStates.LightCross, event.NavScreenEvent.showLightCrossScreen);
    },
    //TODO
    startNavWhenFirstEnter : function() {
        thisPage.retMapIni();
    },
    /**
     * 获取路径的总长度
     * @param instance
     * @return {Number}
     */
    getPathDistance : function(instance) {
        var pathLength = 0;
        //如果还没有开始导航
        if ( !JSON.parse(localStorage['tbt_state'])) {
            pathLength = tbt.GetRouteLength();
        }
        //  否则读取请求路径成功后获得的长度值
        else {
            pathLength = instance.plan_distance;
        }
        return pathLength;
    },
    /**
     * 获取当前位置到终点的剩余距离信息
     * @param instance
     * @return {Number} 剩余距离值
     */
    getPathRemain : function(instance) {
        var remain = instance.remain_metre ;
        if (instance.remain_metre == Infinity) {
            remain = instance.plan_distance;
        }
        return remain;
    },
    /**
     * 只有在显示路口扩大图的时候去更新距离信息,每30米更新一次
     * @param dist2cross 当前位置到路口的距离
     * @param instance tbt对象
     */
    updateCrossDistImg:function(dist2cross,instance){
        if($("#roadCrossPanel > img").length > 0){
            if($("#roadCrossPanel").is(":visible"))
                $("#roadCrossPanel").removeClass("none");
            var imgId = Math.floor(dist2cross/30),imgpath;
            var roadname = $("#roadCrossPanel > .roadName");
            if(roadname.html() != instance.currentRoadName)
                roadname.html(instance.currentRoadName);
            if(imgId < 10 && imgId > 0){
                imgpath = "../navigate/images/images/roadCross/0-300line_0"+imgId+".png";
                if($("#roadCrossPanel > .distanceFromCross > img")[0] !=undefined)
                    $("#roadCrossPanel > .distanceFromCross > img").attr("src",imgpath);
                else
                    $("#roadCrossPanel > .distanceFromCross").append($("<img src='"+imgpath+"' style='position:absolute;left:8px;top:16px'>"));
            }
        }

    }


}
NGIRoute = {};
NGIRoute.RouteRequestData = {};//请求结果缓存对象
NGIRoute["RouteRequestCB"]  = function(rid,data){
    NGIRoute.RouteRequestData[rid] = data;
};
NGIRoute["RouteRequest"] = function(url,func){
    var rid = Math.round(Math.random()*100000);
    var __script = document.getElementById(rid);
    if(__script){document.getElementsByTagName("head")[0].removeChild(__script);}
    __script = document.createElement("script");
    __script.id = rid;
    __script.type = "text/javascript";
    __script.src = url + "&cbk=NGIRoute.RouteRequestCB&rid="+rid;
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
        };
    }

    this.ajaxResult = function(){
        if(NGIRoute.RouteRequestData[rid]){//加载服务数据
            if(func){
                func(NGIRoute.RouteRequestData[rid]);
            }
            document.getElementsByTagName("head")[0].removeChild(document.getElementById(rid));//删除JS文件
            NGIRoute.RouteRequestData[rid] = null;
            delete NGIRoute.RouteRequestData[rid];
        }else{
            if(func){
                func(NGIRoute.RouteRequestData[rid]);
            }
        }
    }
};
