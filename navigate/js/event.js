/**
 * @fileoverview 地图显示及操作类
 * @author 张红亮，程盼望
 **/
/**
 * @class GpsNav
 */
var GpsNav = {
    initializeDemoTbt : function() {
        var constant = GLOBAL.Constant,requestContext = {
            requestPath : true,
            error : MapEvent.loadError,
            hideLaneEle : function() {
                $('#mark').html('');
                constant.nav_obj.laneInfo = null;
            },
            errorOnePath : function() {
                thisPage.request_path_failed();
            }
        } ;
         //初始化导航类，获取全局对象constant.nav_obj和tbt
        constant.nav_obj = new NavFrame(requestContext);
         //为html5 获取经纬度信息的接口配置有效的回调函数
        var config = this.generateNviArg();
        var gpsNav = new GLOBAL.WatchGPS(config);
        //通过浏览器获取gps方法的返回id，在程序运行期间始终推送gps信息
        constant.nav_obj.watchId = gpsNav.inspectCurrentGPS();
    },
    /**
     * @return [object] config 包括两个方法，GPS导航时，用html5接口轮询服务器获得position对象成功或失败时执行的函数
     **/
    generateNviArg: function() {
        var constant = GLOBAL.Constant,that = this;
        var config = {
            onSuccess:function (position) {
                GLOBAL.WatchGPS.currGPS = GLOBAL.WatchGPS.generateGPS(position);
                try {
                    that.pushGpsInfo(GLOBAL.WatchGPS.currGPS);
                }catch (error) {
                    console.log('%s : %s', error.name, error.message);
                    if (!tbt.SetGPSInfo)
                        throw new Error('no obtain gps infomation');
                }
                GLOBAL.WatchGPS.lastGPS = GLOBAL.WatchGPS.currGPS;
                GLOBAL.WatchGPS.currGPS = null;
            },
            onError:function (error) {
                if (!GLOBAL.WatchGPS.currGPS && GLOBAL.WatchGPS.lastGPS) {
                    that.pushGpsInfo( GLOBAL.WatchGPS.lastGPS);
                }
            }
        };
        return config;
    },

    pushGpsInfo : function(curr) {
        tbt.SetGPSInfo(curr.longitude, curr.latitude, curr.speed, curr.direction, curr.year, curr.month, curr.day, curr.hour, curr.minute, curr.second);
    },
    prepareRequestPath : function() {
        var constant = GLOBAL.Constant;
        constant.nav_obj.promptBoxWhenRequest.show();
        if (JSON.parse(localStorage['tbt_state']) && !constant.resumeLastNavi) {
            constant.nav_obj.StopGpsNavi();
        }
        this.requestPath();
    },
    requestPath : function() {
        var constant = GLOBAL.Constant;
        try {
            constant.nav_obj.start = {
                x: JSON.parse(localStorage['Map_lng']),
                y: JSON.parse(localStorage['Map_lat'])
            };
            constant.nav_obj.end = {
                x : constant.poi_search_result.lng,
                y : constant.poi_search_result.lat
            }
            UtilFunc.saveHistoryTarget(constant.poi_search_result);//保存当前位置信息到检索历史记录
            constant.nav_obj.RequestPath();
        }
        catch(e) {
            alert(e.stack);
        }
    }

};
/**
 @class 工具函数类
 */
UtilFunc = {
    saveHistoryTarget:function(destinfo){
        var constant = GLOBAL.Constant,common = GLOBAL.Common;
        if(destinfo.name !="" || destinfo.address !="" || destinfo.tel !=""){
            var config =  $.extend({
                type:constant.favor_history
            },destinfo);
            UtilFunc.add_favor_history(config);
        }else{
            Tab.coord_regeocode(destinfo.lng, destinfo.lat, function(data){
                var poi = data.list[0];
                UtilFunc.add_favor_history(poi);
            });
        }

    },
    setRegularOptionGray : function(config) {
        $('[data="normal"]').css('opacity', config.opacity);
        if(config.opacity != 1)
            $('[data="normal"]').off();
    },
    setUiDoubleLight : function() {
        GLOBAL.Traffic.messagePanel.hide_traffic_bubbles();//by Zhen Xia,双光柱界面隐藏交通信息情报板气泡
        //新增语句：设置地图到合适缩放级别
        //Event.mapObj.setFitView();
        var pathArray = MapEvent.getPathArray();
        GLOBAL.Common.MapUtil.setPathZoom(Event.mapObj,pathArray);
        //显示比例尺
        MapEvent.display_scale();
        GLOBAL.layer.normal.hide();
    },
    //将求路目的地保存到历史目的地记录中
    add_favor_history : function(poi) {
        var constant = GLOBAL.Constant,favorconfig = null,poiinfo={};
        if (typeof poi !== 'undefined') {
            favorconfig = {
                type: constant.favor_history,
                name: poi.name,
                lng: typeof poi.x =="undefined" ? poi.lng:poi.x,
                lat: typeof poi.y =="undefined"? poi.lat:poi.y,
                address: poi.address,
                tel: poi.tel
            };
            for(var p in favorconfig){
                if(p != "type")
                    poiinfo[p] = favorconfig[p];
            }

            new FavoriteService().saveFavor(favorconfig) ;
            GLOBAL.Common.LocalSave.save('NaviDestination', poiinfo);
        }else{
            GLOBAL.Common.LocalSave.save('NaviDestination',constant.poi_search_result);
        }
    },

    addNormalData : function(lenTime) {
        var objConfig = this.unitConversion(lenTime);
        $('#normalRouteDis').text(objConfig.length) ;
        $('#normalRouteTime').text(objConfig.time);
    },
    addTmcData : function(config) {
        var objConfig = this.unitConversion(config);
        $('#TMCRouteTime').text(objConfig.time) ;
        $('#TMCRouteDis').text(objConfig.length) ;
    },
    unitConversion : function(config) {
        var constant = GLOBAL.Constant, configUnit = {};
        try{
            configUnit.length = Tab.unit_conversion(config.length , 1),
            configUnit.time = GLOBAL.tools.formatMinute(config.time)
        }
        catch(e) {
            configUnit.length = constant.null_value , configUnit.time = constant.null_value ;
        }
        return configUnit;
    }
};
/**
 * @class 双光柱页面地图事件
 */
DoubleLightMapEvent = {
    drawLneAddDistanceTime : function() {
        var constant = GLOBAL.Constant,configNormal,configRapid;
        try{
            //处理收到的快速路径信息
            tbt.SelectRoute(constant.iRapid);
            constant.nav_obj.rapidPathArray = MapEvent.getCoordsArray({tbt : tbt});
            configRapid = {
                length:tbt.GetRouteLength(),
                time:tbt.GetRouteTime()
            };
            //处理收到的普通路径信息
            tbt.SelectRoute(constant.iNormal);
            constant.nav_obj.normalPathArray = MapEvent.getCoordsArray({ tbt : tbt});
            configNormal = {
                length:tbt.GetRouteLength(),
                time:tbt.GetRouteTime()
            };
            //默认选中的是快速路线
            localStorage['route_type'] = constant.iRapid;
            UtilFunc.addNormalData(configNormal);
            if(configNormal.length == configRapid.length && configNormal.time == configRapid.time){
                UtilFunc.addTmcData(configRapid);
                MapEvent.drawOnePath(constant.nav_obj.rapidPathArray);
                UtilFunc.setRegularOptionGray({ opacity : 0.4 });
            }else{
                //TODO 如果快速路线时间长于普通路线,则普通路线的时间强制等于快速路线的时间,
                configRapid.time = configRapid.time > configNormal.time?configNormal.time:configRapid.time;
                UtilFunc.addTmcData(configRapid);
                MapEvent.drawMultiPath([constant.iNormal,constant.iRapid]);
                UtilFunc.setRegularOptionGray({ opacity : 1 });
            }
        }catch(e){
            console.log("Error occured in dealing with route, the error is:" +JSON.stringify(e));
        }
    }
};
/**
 * @class 地图操作类
 * @static
 **/
var MapEvent = {
    display_scale:function(src_gray, src) {
        if (Event.mapObj !== undefined) {
            //arr是页面实际显示的图片名称，调用相应图片，arr_scale是由3-18数字组成的数组，对应地图的缩放级别。两个数组是一一对应的关系
            var arr = GLOBAL.Constant.scale_range,  index = 0, zoom = Event.mapObj.getZoom();

            //设置当前比例尺显示图片，由地图缩放级别确定
            var index = parseInt(zoom);
            var $img = $('<img>').attr('src', 'images/images/' + arr[18-index] + '.png').attr('bChangeIcon','false');
            $('#scale strong, #scale_light_cross strong').html($img);

            this.setZoomButtonState(zoom); //设置
            this.setTrafficBubbleState(zoom);//调整交通信息气泡的显示状态
        }
    },
    //设置放大、缩小按钮的状态
    setZoomButtonState: function(zoom){
        var constant = GLOBAL.Constant,zoom_in_btn = this.getZoomInButton() ,zoom_out_btn = this.getZoomOutButton();
         //设置放大、缩小按钮状态(是否需要置为灰色背景)
        if(zoom_in_btn.attr("src").match(/_gray(\.png)$/) != null && zoom != constant.iMaxZoom)
            Tab.displayNormalImg({'ele':zoom_in_btn,'attr':'src'});
        if(zoom_out_btn.attr("src").match(/_gray(\.png)$/) != null && zoom != constant.iMinZoom)
            Tab.displayNormalImg({'ele':zoom_out_btn,'attr':'src'});

            switch(zoom){
                case constant.iMaxZoom://最大缩放级别
                    //放大按钮不可用
                    Tab.gray_img({'ele':zoom_in_btn,'attr':'src'});
                    break;
                case constant.iMinZoom://最低缩放级别
                    //缩小按钮不可用
                    Tab.gray_img({'ele':zoom_out_btn,'attr':'src'});
                    break;
                default:
                    break;
            }
    },
    //取得放大按钮Bt
    getZoomInButton: function(){
        var zoom_in_btn = $('#zoom_in img');//地图界面按钮
        if (!zoom_in_btn.is(':visible') || !zoom_in_btn.is('img')){
            zoom_in_btn =  $('#zoom_in_light_cross');//双光柱界面按钮
        }
        return zoom_in_btn;
    },
    //取得缩小按钮
    getZoomOutButton: function(){
         var zoom_out_btn = $('#zoom_out img');//地图界面按钮
        if (!zoom_out_btn.is(':visible') || !zoom_out_btn.is('img')){//双光柱界面缩小按钮
           zoom_out_btn = $('#zoom_out_light_cross');
        }
        return zoom_out_btn;
    },
    //调整交通信息气泡的显示状态
    setTrafficBubbleState:  function(zoom){
         //不是双光柱或全图浏览界面
         if(!$('#light_cross_html').is(':visible') && $('#poi_current').text()!= '全图浏览'){
            if(zoom < GLOBAL.Constant.iMinTrafficPanelLevel)//当前比例尺高于3km，隐藏气泡
                    GLOBAL.Traffic.messagePanel.hide_traffic_bubbles();
             else
                    GLOBAL.Traffic.messagePanel.show_traffic_bubbles(zoom);
         }
    },
    displayChosenScale : function() {
        Event.mapObj.setZoom(localStorage["Map_scale"]);
        this.display_scale();
    },
    deleteOverlays  : function() {
        Event.mapObj.removeOverlays(['current','target']);
        MapEvent.add_current_overlay();
        $(document).find('svg').hide();
    },
    changePointArrow : function(instance) {
        if(Event.mapObj.getOverlays('target')){
            var currentLngLat = {
                fLatitude : localStorage['Map_lat'],
                fLongitude : localStorage['Map_lng']
            };
            GLOBAL.NavClass.updatePointingDirection(currentLngLat);
        }
    },
    setTurnMarkerState : function(obj) {
        var marker= Event.mapObj.getOverlaysByType('marker'), idPrefix = GLOBAL.Constant.turnMarkerIdPrefix;
        $.each(marker, function(i, n) {
            if (n.id.indexOf(idPrefix) > -1) {
                obj.state ? n.show() : n.hide();
            }
        });
    },

    /**
     * @description 以下方法可以考虑使用poly对象的 hide()方法实现
     */
    setPolylineState : function(bool) {
        var polyline= Event.mapObj.getOverlaysByType('polyline');
        $.each(polyline, function(i, n) {
            bool ? n.show() : n.hide();
        });
    },
    setOverlayStateById : function(obj) {
        var overlay= Event.mapObj.getOverlays(obj.id);
        if (overlay) {
            overlay.visible = obj.state;
            obj.state?overlay.show():overlay.hide();
        }
    },

    /**
     @description 添加转折mark处覆盖物
     */
    addMarkerOverlay : function(config) {
        if (Event.mapObj && config) {
            var config_mark = {
                coord:new MMap.LngLat(config.lng, config.lat),
                img:config.img,
                imageOffset:config.imageOffset,
                autoRotation:true,
                id: config.id // by Zhen Xia
            };
            var marker_mark = MapEvent.add_icon(config_mark);
            //添加终点覆盖物
            Event.mapObj.addOverlays(marker_mark);
        }
    },
    /**
     @description 添加指向目的地方向尖头
     **/
    add_destn_direction : function(){
        var destnDirection = new MMap.Marker({
            id : 'destnDirection' ,
            position:new MMap.LngLat(Event.mapObj.getOverlays('current').position.lng, Event.mapObj.getOverlays('current').position.lat),
            icon : 'images/images/direction_1.png' ,
            offset: new MMap.Pixel(-34, -36) ,
            visible : true
        });
        Event.mapObj.addOverlays(destnDirection);
    } ,
    /**
     @description 添加所有转折处的红色标志覆盖物
     */
    AddMarkerOverlays : function(arrMarker) {
        var arr_mark = arrMarker, that = this , idPrefix = GLOBAL.Constant.turnMarkerIdPrefix;
        $.each(arr_mark, function(i, n) {
            var config = {
                lng:n.startLon,
                lat:n.startLat,
                img:(i == 0 ? GLOBAL.Constant.mark_img_start : GLOBAL.Constant.mark_img),
                imageOffset:(i == 0 ? new MMap.Pixel(32, 27) : new MMap.Pixel(35, 31)),
                id : idPrefix + i //添加id by Zhen Xia
            };
            that.addMarkerOverlay(config);
        });
        $('#map img[src$="starting_point.png"]').parent().parent().css('z-index', 0);
    },
    getCoordsArray : function(config) {
        var tbt = config.tbt,
            glist = tbt.GetSegmentNum(), path = [];
        for (var i = 0; i < glist; i++) {
            var coors = tbt.GetSegCoor(i);
            if (coors == null) {
                return;
            }
            var s = 0 ;
            for ( var m = 0; m < coors.length - 1; m += 2) {
                path.push(new MMap.LngLat(coors[m], coors[m + 1]));
            }
        }
        return path;
    },
    setIniMapState : function() {
        this.add_current_overlay();
        this.mapOperate();
    },
    mapOperate : function() {
        if (Event.mapObj.getOverlaysByType('polyline').length > 0) {
            console.log('there are polylines on the map that affect the dragging behaviour');
        }
        this.drag(Event.mapObj);
        //绑定zoomChange事件无效？
        Event.mapObj.bind(Event.mapObj, 'zoomChange', function() {
            console.log('change');
        });
    },
    drag : function(obj) {
        if (obj.getStatus().dragEnable == false) {
            obj.setStatus({dragEnable : true})
        }
        Event.mapObj.bind(Event.mapObj, 'dragging', MapEvent.drag_map);
        //Event.mapObj.bind(obj, 'mousemove', this.drag_map);
        //电容屏或手机上可能要使用touchmove事件
        Event.mapObj.bind(Event.mapObj, 'touchmove', MapEvent.drag_map);
    },
    /**
      * 鼠标在地图上拖动时，地图中心始终显示当前地图中心位置的目的地图标，在dragging或touchmove时触发
      **/
    drag_map : function(data) {
        //ui设置
        var currentState = GLOBAL.Event.NGIStateManager.getCurrentState(),constant = GLOBAL.Constant;
        if(!(currentState == constant.NGIStates.MapRoadSegment ||currentState == constant.NGIStates.MapOverview)){
            uiManager.setPageState({pageState:'dragMap'});
        }
    },
    /**
     * @description 只画一条路径，不高亮显示
     */
    drawOnePath : function(pathArray) {
        var constant = GLOBAL.Constant;
        var drawLine = new NGIPolyLine({
            path: pathArray,
            lineStyle:[constant.outer_line,constant.inner1_line,constant.inner2_line,constant.center_line]
        });
        drawLine.addMultiPolyline();
        Event.mapObj.getOverlays("NGIRoute1").setOptions({strokeColor:GLOBAL.Constant.iStrokeColor});
    },
    /**
     * 同时画两条路径，并高亮其中一条
     * @param typeArray [normal,rapid]
     */
    drawMultiPath : function(typeArray){
        var constant = GLOBAL.Constant,drawLine,lineStyle = [constant.outer_line,constant.inner1_line,constant.inner2_line,constant.center_line];
        for(var i=0;i<typeArray.length;i++){
            var pathType = typeArray[i],path;
            if(pathType == constant.iNormal){
                path = constant.nav_obj.normalPathArray;
            }else if(pathType == constant.iRapid){
                path = constant.nav_obj.rapidPathArray;
            }
            drawLine = new NGIPolyLine({
                path: path,
                lineStyle:lineStyle
            });
            drawLine.addMultiPolyline();
        }
        //高亮一条路线
        Event.mapObj.getOverlays(constant.HighlightedLineId).setOptions({strokeColor:GLOBAL.Constant.iStrokeColor});
    },
    /**
     *@description 添加自车位置覆盖物
     **/
    add_current_overlay : function() {
        //添加自车位置覆盖物
        if (Event.mapObj) {
            var config_start = {
                id: 'current',
                coord: new MMap.LngLat(localStorage['Map_lng'], localStorage['Map_lat']),
                //coord: new MMap.LngLat(localStorage['Map_lng'], localStorage['Map_lat']),
                img: GLOBAL.Constant.current_img,
                //自车位置覆盖物图标偏移,使其在导航时位于路径当中
                offset: new MMap.Pixel(-34, -36)
            };
            //this指MapEvent
            var marker_start = this.add_icon(config_start);
            Event.mapObj.addOverlays(marker_start);
        }
    },

    //添加终点位置覆盖物
    add_target_overlay : function() {
        var constant = GLOBAL.Constant;
        if (Event.mapObj) {
            var config_target = {
                coord:new MMap.LngLat(constant.nav_obj.end.x, constant.nav_obj.end.y),
                img:GLOBAL.Constant.flag_img,
                //size: new MMap.Size(156, 158),
                //imageOffset: new MMap.Pixel(24, 50),
                id:'target',
                offset:new MMap.Pixel(-19, -57)
            };
            var marker_target = this.add_icon(config_target);
            //添加终点覆盖物
            Event.mapObj.addOverlays(marker_target);
            //$('#target > div').css('overflow', 'visible');
        }
    },

    //判断是否规划了路径
    determine_path : function() {
        return Event.mapObj.getOverlaysByType('polyline').length != 0;
    },
    /**
     * @description 绘制右侧动态光柱
     **/
    drawLight : function(config) {
        var arrTMC = tbt.CreateTMCBar(config.pass, config.ken);
        arrTMC = Tab.changeTmcLightCrossData(arrTMC);
        if (config.callback) {
            config.callback(arrTMC);
        }
        return arrTMC;
    },

    //设置地图缩放级别为17，及比例尺ui显示
    setZoom_17: function() {
//		var center = Event.mapObj.getCenter();
        Event.mapObj.setZoom(17);
        $('#scale img').attr('src', "images/images/50m.png");
        $('#zoom_in img').attr('src', GLOBAL.Constant.scale_up);
//		this.pan_center(center);
    },
    /**
     * 获取地图上点的位置的标注
     * @param[object] 设置覆盖物的位置、图片、大小、id等属性。包括img, size, id, coord属性，其中coord为必有属性
     * @return 标注点类型的覆盖物对象
     * markerOptions 局部变量，由函数内部定义，可通过param改变属性
     **/
    add_icon : function(config) {

        var markerOptions = {}/*new MarkerOption()*/;
        //设置覆盖物标注点类型的图片url
        if (!config.img)
            config.img = GLOBAL.Constant.current_img;
        markerOptions.icon = new MMap.Icon({
            image: config.img,
            //size:图标所在区域长宽
            size: config.size ? new MMap.Size(config.size.width, config.size.height) : new MMap.Size(68, 69),
            //图标偏移量，相对于markerOptions.offset定义的div
            imageOffset: config.imageOffset ? config.imageOffset : new MMap.Pixel(0, 0)
        });
        //else
//		markerOptions.icon = config.img;
        //设置标注点类型覆盖物的id属性
        if (config.id) {
            //如果id重复，会自动删除过去添加的同值id覆盖物
            markerOptions.id = config.id;
        }
        else {
            //markerOptions.id = Event.num_des;
//		//生成下一个标注点类型覆盖物的id属性值
//		Event.num_des ++;
        }
        markerOptions.position = config.coord;
        //对象相对于基点的偏移量。保证覆盖物图片中心位于基点中心
        markerOptions.offset = config.offset ? config.offset : new MMap.Pixel(-38, -38);
        //设置标注点类型覆盖物的宽高
        //markerOptions.imageSize = new MSize(50, 50);
        //通过经纬度坐标及参数选项确定标注点类型覆盖物的信息
        var marker = new MMap.Marker(markerOptions);

        return marker;
    },

    //移动自车位置到指定位置：1，地图中心坐标，2，实际自车位置坐标
    pan_center : function(objCenter) {
        var current = Event.mapObj.getOverlays('current'),
            poly = Event.mapObj.getOverlaysByType('polyline');
        //没有规划线路，同时目的地图标隐藏时，比例尺缩放时需移动自车位置到指定坐标
        try {
            if (poly.length == 0 && $('#target').is(':hidden')) {
                current.setPosition(new MMap.LngLat(objCenter.lng, objCenter.lat));
            }
            else if (poly.length !== 0) {
                //var	center = Event.mapObj.getCenter();
//			Event.mapObj.panTo(center);
            }
        }
        catch(e) {
            console.log(e.message);
        }
    },
    //添加实时交通图
    addTmc : function(){
        //如果动态交通图层不存在，则添加动态交通图层
        if (!Event.mapObj.getLayer('traffic_layer')) {
           var tmc = new MMap.TileLayer({
            zIndex: 10,
            //如果添加id属性，必须保证其不发生冲突，否则将不显示
            id: 'traffic_layer',
            getTileUrl:function(x,y,z){
                return "http://tm.mapabc.com/trafficengine/mapabc/traffictile?v=1.0&t=1&zoom="+(17-z)+"&x="+x+"&y="+y;
            }
            });
            //如果动态交通里的功能设定页面没有选择显示动态交通信息，则不添加交通图层，如果未设置过该选项，则本地变量未初始化
            if (!!eval(localStorage['Map_tbt_display'])) {
                Event.mapObj.addLayer(tmc);
            }
        }
    },
    removeTmc:function(){
        if (Event.mapObj.getLayer('traffic_layer')) {
            Event.mapObj.removeLayer('traffic_layer');
        }
    },
    //获取目的地或地图中心坐标，作为当前兴趣点1，有目的地图标；2，只有自车位置图标
    //todo delete this function
    get_center : function() {
        var constant = GLOBAL.Constant;
        if (Event.mapObj !== undefined) {
            var center = Event.mapObj.getCenter();
            //获得地图中心位置坐标，作为收藏和周边检索的中心点
            constant.poi_search_result.lng = center.lng;
            constant.poi_search_result.lat = center.lat;
        }
        return center;
    },
    /**
     * @event 放大地图工具函数
     */
    zoomInUtil : function() {
        var constant = GLOBAL.Constant;
        var level = Event.mapObj.getZoom();
        if (level >= constant.iMaxZoom) {
            return;
        }
        MapEvent.zoomInOut(constant.iLeave_zoomin);
        MapEvent.display_scale();//修改比例尺、放大缩小按钮状态
        //MapEvent.addTmc(Event.mapObj);//by zhen xia
        //设置下载加载地图时显示的比例尺
        localStorage['Map_scale'] = level + 1;
        uiManager.changeCarDirection();
    },
    /**
     * @event 缩小地图工具函数
     */
    zoomOutUtil : function() {
        var constant = GLOBAL.Constant;
        var level = Event.mapObj.getZoom();
        if (level <= constant.iMinZoom) {
            return;
        }
        MapEvent.zoomInOut(constant.iLeave_zoomout);
        this.display_scale();//修改比例尺、放大缩小按钮状态
        //MapEvent.addTmc();  //by zhen xia
        //设置下载加载地图时显示的比例尺
        localStorage['Map_scale'] = level - 1;
        uiManager.changeCarDirection();
    },
    /**
     @description 缩放地图并设置地图中心到原中心
     */
    zoomInOut : function(config) {
        var constant = GLOBAL.Constant;
        if (config == constant.iLeave_zoomout) {
            Event.mapObj.zoomOut();
        }
        else if (config == constant.iLeave_zoomin) {
            Event.mapObj.zoomIn();
        }
        MapEvent.changePointArrow(constant.nav_obj);
    },
    determin_distance : function(coord_target) {
        var constant = GLOBAL.Constant;
        //计算当前地图中心与自车位置距离
        var distance = 0, current = null;
        current = new MMap.LngLat(localStorage['Map_lng'], localStorage['Map_lat']);
        var target = coord_target || new MMap.LngLat(constant.poi_search_result.lng, constant.poi_search_result.lat);
        distance = Event.mapObj.getDistance(current, target);
        distance = Tab.unit_conversion(distance, 1);
        return distance;
    } ,
    /**
     * @description [function] loadError 一条路径都请求不到，loadError方法，数据加载失败时调用
     */
    loadError : function() {
        var layer=new GLOBAL.layer({
            id:"msg_box_fail",
            msg : GLOBAL.Constant.prompt_fail
        });
        layer.show();
        /*
         * @description 添加重试、取消按钮图片，重试为重新载入页面,取消为返回主界面
         */
        $('#msg_box_fail img:first').click(function() {
            layer.hide();
            $('#msg_box_light_cross').hide();
            thisPage.switchToMapInterface();
//			Event.mapObj.setCenter(new MMap.LngLat(localStorage["Map_lng"],localStorage['Map_lat']));
        });
    },
    //指定经纬度坐标值加载地图,1,以自车坐标为中心加载地图，2，以目的地坐标为中心加载地图
    showLocation:function(config){
        var constant = GLOBAL.Constant;
        //如果没有传递参数，以自车位置为中心生成地图
        if (config === undefined) {
            config = {
                lng: localStorage['Map_lng'],
                lat: localStorage['Map_lat']
            }
        }
        var mapOptions = {
            //初始化地图时设置的缩放级别，目前设置为14，如果希望放大到最大级别，可设置为18
            level : Number(localStorage['Map_scale']),
            zooms : [constant.iMinZoom, constant.iMaxZoom],
            /**
             * @event 暂不设置地图的双击放大和滚轮缩放功能。
             */
            doubleClickZoom : false,
            scrollWheel : false
        };
        if (arguments[1] !== undefined) {
            mapOptions.center = new MMap.LngLat(arguments[1], arguments[0]);
        }
        else {
            mapOptions.center = new MMap.LngLat(config.lng, config.lat);
        }

        mapOptions.defaultTileLayer = new MMap.TileLayer({
            id:"cdn",//唯一ID
            zIndex:1,//图层叠加顺序
            tileSize:256,
            tileUrl:"http://webrd0{1,2,3,4}.is.autonavi.com/appmaptile?x=[x]&y=[y]&z=[z]&lang=zh_cn&size=1&scale=1&style=7" //amap取图地址
        });
        //测试id为map的对象是否存在，如果存在，加载图像
        if ($('#mmap')[0]) {
            //生成初始化地图，以当前位置或查找的poi位置为中心
            Event.mapObj = new MMap.Map('mmap', mapOptions);
            //定义地图回调函数
            Event.mapObj.defaultTileLayer.getTileUrl = function(x,y,z){
                return businessManager.setTileUrl(x,y,z);
            }
            MapEvent.addTmc();
        }
        //显示比例尺
        MapEvent.display_scale();
        //初始化交通信息气泡开关
        setTimeout(GLOBAL.Event.NavScreenEvent.initTrafficMessageBubbles,30000);
    },
    /**
     * @event 绑定放大按钮点击事件
     */
    setMapZoom : function(img_zoom_in_gray, img_zoom_out) {
        $('#zoom_in, #zoom_in_light_cross').live('click', function() {
            MapEvent.zoomInUtil();
        });
        $('#zoom_out, #zoom_out_light_cross').live('click', function() {
            MapEvent.zoomOutUtil();
        });
    },
    /**获取地图上所有polyline的形状点数组，合并成一个数组返回
     *
     * @param mapObj
     */
     getPathArray : function(){
        var polylines = Event.mapObj.getOverlaysByType('polyline'),pathArray = [];
        if(polylines.length == 4 || polylines.length == 8){//用4条path表示一条path的情形
            if(polylines.length == 4) pathArray = polylines[0].path;
            else pathArray = polylines[0].path.concat(polylines[4].path);//用8条path表示两条path的情形
        }
        else if(polylines.length == 1 || polylines.length == 2){//用1条path表示一条path
            if(polylines.length == 1) pathArray = polylines[0].path;
            else
                pathArray = polylines[0].path.concat(polylines[1].path);
        }
         return pathArray;
     }
} ;
/**
 * @param config 包含路径数组以及路线样式
 * @constructor  调用mapsdk中的函数来绘制多边线表示导航的路径
 */
function NGIPolyLine(config){
    this.path = config.path;//多段线经纬度数组
    this.lineStyle = config.lineStyle; //线段的样式,支持样式数组传入
}
NGIPolyLine.StrokeColor = GLOBAL.Constant.iStrokeColor;
NGIPolyLine.mapObj = Event.mapObj;
NGIPolyLine.prototype = {
    /**
     * @param config 多边线的样式
     * 绘制一条多边线
     */
    addOnePolyline:function(config){
        var path = this.path;
        this.id = Event.mapObj.getOverlaysByType('polyline').length;
        var line =  new MMap.Polyline({
            path : path,
            id : "NGIRoute"+ this.id++,
            strokeColor : config.strokeColor, //线颜色
            strokeOpacity : config.strokeOpacity, //线透明度
            strokeWeight : config.strokeWeight, //线宽
            fillOpacity : config.fillOpacity,
            fillColor : config.fillColor
        });
        Event.mapObj.addOverlays(line);
    },
    /**
     * 一次添加多条多边线
     */
    addMultiPolyline:function(){
        var lineStyle = this.lineStyle,that = this;
        $.each(lineStyle, function(i, n){
            that.addOnePolyline(n);
        });
    }
};

GLOBAL.Event.NavScreenEvent = {
    //检索区域变更界面
    showPoiSearchRegionScreen : function(){
        businessManager.regionButtonListener();
        return true;
    },
    //检索结果界面跳转到地图界面
    showSearchResultInMapScreen : function(options){
    //    businessManager.rsItemListener(options);
        uiManager.setPageState({pageState:'searchResult'});
        return true;
    },
    //主菜单界面跳转子界面事件
    showNextInterfaceScreen : function(options){
        frames[0].location.href=options.nextPage ;
        return true;
    },
    //地图导航状态界面
    showNaviMapScreen : function(){
        businessManager.navi_Map();
        uiManager.setPageState({pageState:'',gpsState:true});
        MapEvent.display_scale(); //解决在地图和双光柱界面使用不同的zoomin/out按钮灰化以及恢复正常不同步
        return true;
    },
    //地图未导航状态界面
    showInitMapScreen : function(){
        uiManager.setPageState({pageState:''});
        businessManager.init_Map();
        return true;
    },
    //显示双光柱界面
    showLightCrossScreen : function(){
        if(parent.window.iframeObj)
           parent.window.iframeObj.remove();
        else
            iframeObj.remove();
        uiManager.setPageState({pageState:'lightCross'});
        businessManager.init_lightCross();
        return true;
    },
    //从安全界面到主界面
    showMapScreen : function(){
        uiManager.setPageState({pageState:''});
        businessManager.default_map_ini();
        return true;
    },
    //显示主菜单界面
    showMainMenuScreen : function() {
        if(iframeObj){
            var param={
                id:"iframeHTML",
                name:"main_menu",
                src:"../main_menu/index.html"
            };
            iframeObj.setIframe(param);
            iframeObj.show();
        }
        return true;
    },
    //显示目的地检索界面
    showPoiSearchByKeywordScreen : function() {
        if(iframeObj && ($('#iframeDiv').css("visibility")=="hidden")){
            var param={
                id:"iframeHTML",
                name:"destn",
                src:"../main_menu/destn/index.html"
            };
            iframeObj.setIframe(param);
            iframeObj.show();
            return true;
        }else{
            businessManager.displayPoiPage();
        }
        return true;
    },
    //显示周边检索界面
    showNearBySearchScreen : function () {
        thisPage.getMapCenterInfo();
        if(iframeObj){
            var param={
                id:"iframeHTML",
                name:"rim",
                src:"../rim/index.html"
            };
            iframeObj.setIframe(param);
            iframeObj.show();
            return true;
        }
    },
    //显示添加到收藏界面
    showAddToFavoritesScreen : function (options) {
        var constant = GLOBAL.Constant;
        var regeocodeCallback=options.regeocodeCallback;
        if ($('#details').is(':hidden')) {
            //获取地图中心坐标，作为当前兴趣点
            thisPage.getMapCenterInfo();
            Tab.coord_regeocode(constant.poi_search_result.lng, constant.poi_search_result.lat, regeocodeCallback);
        }
        else {
            if(iframeObj){
                var param={
                    id:"iframeHTML",
                    name:"favorite",
                    src:"../main_menu/favorite/add.html"
                };
                iframeObj.setIframe(param);
                iframeObj.show();
            }

        }
        return true;
    },
    //显示GpsInfo界面
    showGpsInfoScreen : function(){
        businessManager.showGpsInfoScreen();
        return true;
    },
    //显示模拟导航界面
    showEmulatorScreen : function(){
        uiManager.setPageState({pageState:'simulator'});
        businessManager.showEmulatorScreen();
        return true;
    },
    //显示分段浏览界面
    showRoadSegInfoScreen : function () {
        if(iframeObj && ($('#iframeDiv').css("visibility")=="hidden")){
            var param={
                id:"iframeHTML",
                name:"subsection",
                src:"subsection.html"
            };
            if(!$('iframe')[0].src.match(/subsection\.html$/)){
                iframeObj.setIframe(param);
            }
            iframeObj.show();
        }else{
            frames[0].location.href='../../navigate/subsection.html' ;
        }
        return true;
    },
    //分段道路信息地图浏览
    showMapRoadSegmentScreen : function(){
        //修改uiManager.setPageState与businessManager.showMapRoadSegmentScreen的执行顺序 by Zhen Xia
        uiManager.setPageState({pageState:'subsection'});
        businessManager.showMapRoadSegmentScreen();
        return true;
    },
    //显示全图浏览界面
    showMapOverviewScreen : function () {
        businessManager.showMapOverviewScreen();
        uiManager.setPageState({pageState:'fitview'});
        return true;
    },
    //显示详细信息界面
    showViewPoiDetailScreen : function () {
        businessManager.showViewPoiDetailScreen();
        return true;
    },
    //返回详细信息界面
    showReturnViewPoiDetailScreen : function(){
        iframeObj.show();
        return true;
    },
    //显示检索结果界面
    showPoiSearchResultScreen : function (options) {
        //如果参数options不为空，并且options.keyword或者options.type不为空则做poi检索，否则仅作结果显示
        var isDoSearch = (typeof options!="undefined") && (typeof options.keyword!="undefined" ||typeof options.type!="undefined");
        if(($('#iframeDiv').css("visibility")=="hidden") && !isDoSearch){
            var param={
                id:"iframeHTML",
                name:"destn",
                src:"../main_menu/destn/POISearchResult.html"
            };
            if(frames[0].window.location.href.indexOf('destn/POISearchResult.html') == -1){
                iframeObj.setIframe(param);
            }
            iframeObj.show();
        }else{
            businessManager.searchButtonListener(options);
        }
        return true;
    },

//显示筛选界面
    /*showPoiSearchResultFilterScreen : function(){
        businessManager.showPoiSearchResultFilterScreen();
        return true;
    },*/
    //显示路径选项界面
    showPathOptionsScreen : function () {
  //      $('#compass').unbind().bind('click',thisPage.setCompass);
        if(frames[0].location.href.indexOf('path/index.html') == -1){
            var param={
                id:"iframeHTML",
                name:"path",
                src:"../main_menu/path/index.html"
            };
            iframeObj.setIframe(param);
            iframeObj.show();
        }else if($('#iframeDiv').css("visibility")=="hidden"){
            iframeObj.show();
        }
        return true;
    },
    //显示路径状态界面
    /*showTrafficConditionScreen : function () {
        if(iframeObj){
            var param={
                id:"iframeHTML",
                name:"conditions.",
                src:"../main_menu/traffic/conditions.html"
            };
            iframeObj.setIframe(param);
            iframeObj.show();
        }
        return true;
    },*/
    //双光柱，路线详细页返回
    BackToLightCrossScreen : function (options) {
        MapEvent.setPolylineState(true);
        MapEvent.setTurnMarkerState({
            state : true
        });
        iframeObj.remove();
        GLOBAL.Traffic.messagePanel.hide_traffic_bubbles();//by Zhen Xia,双光柱界面隐藏交通信息情报板气泡
        //Event.mapObj.setFitView();
        var pathArray = MapEvent.getPathArray();
        GLOBAL.Common.MapUtil.setPathZoom(Event.mapObj,pathArray);
        uiManager.setPageState({pageState:'lightCross'});
        return true;
    },
    //返回地图界面
    ShowPreviousScreen : function (options) {
        var constant = GLOBAL.Constant;
        var backUrl=options.backUrl;
        if(backUrl.indexOf("navigate/index.html")>=0){
            iframeObj.remove();
            thisPage.hide_assist_menu();//折叠快捷菜单
            var nextState = GLOBAL.Event.NGIStateManager.getNextState();
            var state = GLOBAL.Constant.NGIStates;
            switch(nextState){
                case state.MapWithPoi :
                    uiManager.setPageState({pageState:'searchResult'});
                    break;
                case state.Navigation :
                    if(constant.nav_obj.naviStatus.emulNaviStatus){
                        uiManager.setPageState({pageState:'simulator'});
                        businessManager.emulator_Map();
                    }else{
                        uiManager.setPageState({pageState:''});
                        businessManager.navi_Map();
                    }
                    break;
                case state.Map :
                    if(GLOBAL.Event.NGIStateManager.getCurrentState() == GLOBAL.Constant.NGIStates.PoiSearchNearby){
                    //    var center = Event.mapObj.getCenter();
                        var center = constant.centerAfterDragging;
                       // var distance = MapEvent.determin_distance(new MMap.LngLat(center.lng, center.lat));
                       // if(distance == "0m"){
                        if(constant.centerAfterDragging == null){
                            uiManager.setPageState({pageState:''});
                            businessManager.init_Map();
                        }else{
                            //在MapWithPoi界面地图不可拖动，点周边后再返回，将地图改为可拖动
                            if(!Event.mapObj.getStatus().dragEnable)//by Zhen Xia
                                Event.mapObj.setStatus({dragEnable : true});
                            uiManager.setPageState({pageState:'dragMap'});
                            $('#details[alt="详细按钮"],#poi_current').hide();
                        }
                    }else{
                        uiManager.setPageState({pageState:''});
                        businessManager.init_Map();
                    }
                    break;
                default:
                    console.log('unexpected state: '+nextState);
                    break;
            }
        }
        else{
            frames[0].location.href = GLOBAL.Constant.WebPath + backUrl; //通过完整路径来跳转
        }
        return true;
    },
    //点击返回地图返回到地图界面
    showReturnToMapDirectlyScreen : function(options){
        var constant = GLOBAL.Constant;
        iframeObj.remove();
        thisPage.hide_assist_menu();//折叠快捷菜单
        if(constant.nav_obj.naviStatus.emulNaviStatus){
            uiManager.setPageState({pageState:'simulator'});
            businessManager.emulator_Map();
        }else{
            if(JSON.parse(localStorage['tbt_state'])){
                uiManager.setPageState({pageState:''});
                businessManager.navi_Map();
                $('#compassContainer').unbind().bind('click',thisPage.setCompass);
            }else{
                uiManager.setPageState({pageState:''});
                businessManager.init_Map();
            }
        }
        return true;
    },
    initTrafficMessageBubbles : function(){
            var traffic_panel_on = GLOBAL.Traffic.messagePanel.isTrafficPanelOn();
            btnToggle = $('#traffic_panel_toggle img');
            if(!traffic_panel_on){//恢复UI状态
                 btnToggle.attr('alt', "打开情报板").attr('src',"images/images/bubble_disable.png");
            }else{
                if(btnToggle.attr('alt')!="关闭情报板")//恢复出厂时，如果之前开关已关闭
                     btnToggle.attr('alt', "打开情报板").attr('src',"images/images/bubble_enable.png");
                var zoomLevel = Event.mapObj.getZoom();
                GLOBAL.Traffic.messagePanel.add_traffic_bubbles(zoomLevel);
            }
    }
};