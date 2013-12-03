/**
 * @class ThisPage类继承自Core.js中的Class类
 * @function {function} initialize 初始化
 * @function {function} initializeDOM 初始化DOM元素
 * @function {function} initializeEvent 事件绑定
 **/
(function(){
    var ThisPage = {
        initialize: function ()
        {   var constant = GLOBAL.Constant;
            this.retMapIni = function(state) {
                thisPage.initCompass();
                if(!constant.nav_obj.naviStatus.emulNaviStatus){
                    //Event.mapObj.setCenter(new MMap.LngLat(localStorage["Map_lng"],localStorage['Map_lat']));
                    //uiManager.changeCarDirection();
                    uiManager.mapSetCenter(new MMap.LngLat(localStorage["Map_lng"],localStorage['Map_lat']));
                }
                if (state == 'mapIni') {
                    uiManager.setPageState({pageState:''});
                    MapEvent.setPolylineState(false);
                    MapEvent.setOverlayStateById({
                        id : 'target',
                        state : false
                    });
                    MapEvent.setOverlayStateById({
                        id : 'destnDirection',
                        state : false
                    });
                    MapEvent.setTurnMarkerState({state: false});
                    Event.mapObj.setStatus({dragEnable : true});
                    MapEvent.displayChosenScale();
                }
                else {
                    MapEvent.setOverlayStateById({
                        id : 'target',
                        state : true
                    });
                    Event.mapObj.setStatus({dragEnable : false});
                    MapEvent.setPolylineState(true);
                    MapEvent.setOverlayStateById({id:'target', state : true});
                    //MapEvent.setTurnMarkerState({state: true});
                    MapEvent.displayChosenScale();
                    GLOBAL.NavClass.updatePointingDirection();
                //    $('#emulatorNaviCurrRoad').hide();
                    MapEvent.setOverlayStateById({
                        id : 'destnDirection',
                        state : true
                    });
                    MapEvent.setTurnMarkerState({state: true});
                    MapEvent.changePointArrow(constant.nav_obj);
                    $('svg').show();
                    if (constant.nav_obj.naviStatus.emulNaviStatus) {
                        constant.nav_obj.ResumeEmulator();
                        return;
                    }
                    uiManager.setPageState({pageState:''});
                }
            };
            //初始化状态机，初始状态为map
            GLOBAL.Event.NGIStateManager = new NGIStateManager(GLOBAL.Constant.NGIStates.Map);
            var href = location.href , i = href.indexOf('/navigate'), path=href.substring(0,i);
            constant.WebPath = path + '/'; //获取站点根目录路径
        },
        initializeDOM: function() {
            var arr_ele = ['#pull_back_btn img', '#menu_first','#name div', '#name', '#search img:first', '#simulator', '#simulator img[alt="停止模拟"]', '#mark','#input_first','#nav','#ret'],
                arr_prop = ['lower_left_button', 'menu_first', 'name_div', 'name', 'search_img', 'simulator', 'stop_navi', 'mark','input_first','nav','ret'];
            $.each(arr_ele, function(i, n) {
                this['$' + arr_prop[i]] = $(n);
            }.proxy(this));
            this.judgeGRPS();

            /**
             * @class 主界面ui显示，从不同页面进入实现不同功能状态下的地图ui
             * @description {function} normal 页面正常切换状态下的主界面显示
             * @description {function} view_detail （从搜索页面或收藏页面、详细信息页面的地图查看按钮进入）
             * @description {function} simulator 模拟导航状态，ui设置，需先调用ui.interface.route方法
             * @description {function} gps 真实GPS导航状态，ui额外设置
             **/
            ui.interface = {
                iniState : this.retMapIni,
                marker: this.change_direction_icon,
                request_path_failed: this.request_path_failed,
                request_path_now: this.request_path_now,
                lightCross: this.lightCross
            };
            this.initCompass();
            $('#compassContainer').bind('click',this.setCompass);
        },

        initCompass: function(){
            //初始化罗盘模式为地图向北模式的图标
            localStorage['Navi_Compass_Mode'] = 'NorthUp';
            $('#compass').attr('src' , 'images/images/compass.png');
            if(Event.mapObj)
                Event.mapObj.setRotation(0) ;
            $('#current').css('-webkit-transform' , 'rotate(0deg)');
        },


        initializeEvent: function ()
        {
            var statemanager =  GLOBAL.Event.NGIStateManager,navscreenevent = GLOBAL.Event.NavScreenEvent,
                constant = GLOBAL.Constant,ngistates = GLOBAL.Constant.NGIStates;
            //快速路线、常规路线点击切换事件
            $('#light_cross_html nav section, #light_cross_html figure').click(this.selectPathEle);
            //绑定返回按钮点击事件
            this.$ret.click(function() {
                statemanager.goToPreviousState(navscreenevent.showInitMapScreen);
                $('#compassContainer').unbind().bind('click',thisPage.setCompass);
            });

            //绑定导航图片点击事件
            this.$nav.click(function() {
                statemanager.goToNextState(ngistates.Navigation,navscreenevent.showNaviMapScreen);
            });
            /**
             * @description 点击路线详细按钮图片事件
             **/
            this.$input_first.click(function() {
                statemanager.goToNextState(ngistates.RoadSegInfo, navscreenevent.showRoadSegInfoScreen);
            });
            //显示GpsInfo信息
            $('#scale,#satellite').click(function(){
         //      statemanager.goToNextState(ngistates.GpsInfo,navscreenevent.showGpsInfoScreen);
            });
            //导航状态预计到达时间面板设置
            $('#reach_time')
                .mouseover(function() {
                    $(this).css('cursor', 'pointer');
                })
                .click(function() {
                    statemanager.goToNextState(ngistates.PathOptions,navscreenevent.showPathOptionsScreen);
                });
            //进入分段浏览界面
            $('#right img[alt="路程图标"]').parent().click(function(){
                statemanager.goToNextState(ngistates.RoadSegInfo, navscreenevent.showRoadSegInfoScreen);
            });

            //绑定查找按钮点击事件

            $('#search img:first').click(function() {
                statemanager.goToNextState(ngistates.PoiSearchByKeyword, navscreenevent.showPoiSearchByKeywordScreen);
            });
            //绑定详细按钮点击事件
            $('#details').click(function() {
                statemanager.goToNextState(ngistates.ViewPoiDetail,navscreenevent.showViewPoiDetailScreen);
            });
            //左侧（#left元素事件）结束--}.proxy(this));

            //{-- 导航栏元素事件开始
            //重构：Rename Method 根据原有注释重新命名，并将注释中的常数说明转变为参数传入，即在location画面，当用户10秒内无操作，面板自动收缩。//如果设置了自动收缩面板功能，则在导航状态下亦收缩，该功能后期完善
            this.pull_nav_menu_auto(10000);

            //绑定左下角按钮点击事件
            $('#pull_back_btn img').live('click', function() {
                this.click_lower_left_button();
            }.proxy(this));
            //设置放大缩小按钮功能
            MapEvent.setMapZoom('images/images/scale_up_gray.png',"images/images/scale_down.png");
            //绑定主菜单兼设终点按钮点击事件
            $('#menu_first').live('click', function() {
                this.click_menu_termination(this);
            }.proxy(this));
            //绑定周边检索按钮点击事件
            $('#rim').live('click', function() {
                statemanager.goToNextState(ngistates.PoiSearchNearby,navscreenevent.showNearBySearchScreen);
            });
            //绑定收藏按钮点击事件
            $('#add_favor').live('click', function() {
                statemanager.goToNextState(ngistates.AddToFavorites, navscreenevent.showAddToFavoritesScreen, { 'regeocodeCallback' : this.add_data});
                this.hide_assist_menu();//折叠快捷菜单
            }.proxy(this));
            //为目的地位置图标绑定事件
            $('#target').attr('bChangeIcon',false).click(function(){
                //获取地图中心坐标，显示地址
                thisPage.getMapCenterInfo();
                Tab.coord_regeocode(constant.poi_search_result.lng, constant.poi_search_result.lat,function(data){
                    var list = data ? data.list : null ;//判断是否取到数据

                    if(list){
                        //if(list[0].poilist){//poi sdk与map abc regeo返回结果结构不一致
                        //var poi = list[0].poilist[0];
                        var poi = list[0];
                        var city = data.city;
                        var info ="";
                        if(poi.address){
                            info += '<b>' + poi.address +'</b>' + '<br/>';
                        }
                        info += city + poi.name + '附近';
                        var inforWindow = new MMap.InfoWindow({
                            offset: new MMap.Pixel(-104 , -105),
                            content: '<span style="font:12px/16px Verdana, Helvetica, Arial, sans-serif;">' + info + '</span>'
                        });
                        inforWindow.open(Event.mapObj,new MMap.LngLat(constant.poi_search_result.lng, constant.poi_search_result.lat));
                    }
                    //}
                })});
            //显示时间，目前使用系统时间，如GPS提供，优先显示GPS时间。
            Tab.startTime($('.navi_menu'));
            //分段浏览返回主界面页面，上一条和下一条按钮图片点击事件
            $('#subsection').click({ordinal: false,oldOrdinal:false}, function(e) {
                if(e.data.oldOrdinal!=constant.newSubsection){
                    e.data.oldOrdinal=constant.newSubsection;
                    e.data.ordinal=false;
                }
                var ordinal = e.data.ordinal;
                ordinal = (ordinal !== false ? ordinal : GLOBAL.Common.LocalSave.read('Map_seg_center').ordinal);
                e.data.ordinal = ordinal;
                var $target = $(e.target),
                    i_item = ordinal-1,
                    /**
                     * @function 动态获取行程Guide列表，路径重算时保证其存在，否则可能该条路径会被动态删除。以后可通过对重算进行判断决定是否重新计算(优化)。即根据constant.nav_obj.bReroute
                     * @obj_sub {Array} GuideItem数组
                     */
                        obj_sub = tbt.GetNaviGuideList();
                if ($target.attr('alt') == '上一条' && i_item > 0) {
                    var prev = obj_sub[i_item - 1];
                    //Event.mapObj.setCenter(new MMap.LngLat(prev.startLon, prev.startLat));
                    uiManager.mapSetCenter(new MMap.LngLat(prev.startLon, prev.startLat));
                    $('#poi_current').text(prev.roadName || constant.no_name_road);
                    e.data.ordinal --;
                }
                if ($target.attr('alt') == '下一条' && i_item < obj_sub.length ) {
                    if (i_item == obj_sub.length - 1) {
                        var position = Event.mapObj.getOverlays('target').position;
                        //Event.mapObj.setCenter(new MMap.LngLat(Event.mapObj.getOverlays('target').position.lng, Event.mapObj.getOverlays('target').position.lat));
                        uiManager.mapSetCenter(new MMap.LngLat(position.lng, position.lat));
                        $('#poi_current').text(constant.destination);
                        e.data.ordinal=obj_sub.length+1;
                    }
                    else {
                        var next = obj_sub[i_item + 1];
                        //Event.mapObj.setCenter(new MMap.LngLat(next.startLon, next.startLat));
                        uiManager.mapSetCenter(new MMap.LngLat(next.startLon, next.startLat));
                        $('#poi_current').text(next.roadName || constant.no_name_road);
                        e.data.ordinal ++;
                    }
                }
                GLOBAL.NavClass.updatePointingDirection();
            });
            /**
             * @description 动态光柱按钮点击事件
             **/
                //导航栏元素事件结束 --}
                //{-- 右侧（#right)元素事件开始

            $('#overLayer').click(function(){
                    /**
                 @description 保存剩余距离和剩余时间
                 */
                var lightBarStateArr = GLOBAL.Constant.ViewDistanceArr, length = lightBarStateArr.length,currentLightBar = localStorage['Map_tbt_view'];
                var nextLightBarIndex = (lightBarStateArr.indexOf(currentLightBar) +1) % length;//循环切换状态
                localStorage['Map_tbt_view'] = lightBarStateArr[nextLightBarIndex];
                //更新lightbar
                uiManager.showLightBar();
               /* var routeRemainDis = $('#routeRemainDis').html(),
                    routeRemainTime = constant.nav_obj.tbt_remain_miniute,common = GLOBAL.Common;
                    common.LocalSave.save('Map_routeRemainDis', routeRemainDis);
                    common.LocalSave.save('Map_routeRemainTime', routeRemainTime);
                    statemanager.goToNextState(ngistates.TrafficCondition,navscreenevent.showTrafficConditionScreen);*/
                });


            //设置右侧收缩扩展功能。重构：Extract Method, Rename Method
            $('#menu_extend').click(function () {
                var re = /open\.png$/g;
                if (re.test($(this).find('img').attr('src'))) {
                    thisPage.display_assist_menu();
                } else {
                    thisPage.hide_assist_menu();
                }
            });
            //设置交通信息情报板点击事件
            $('#traffic_panel_toggle img').click(
                function() {
                    if($(this).attr('alt') == '关闭情报板'){//关闭情报板
                       $(this).attr('alt', "打开情报板");
                        $(this).attr('src',"images/images/bubble_disable.png");
                        GLOBAL.Traffic.messagePanel.setTrafficPanelOn(false);
                        GLOBAL.Traffic.messagePanel.delete_traffic_bubbles();
                    }
                    else{//打开情报板
                        $(this).attr('alt', "关闭情报板");
                        $(this).attr('src', "images/images/bubble_enable.png");
                        GLOBAL.Traffic.messagePanel.setTrafficPanelOn(true);
                        var zoomLevel = Event.mapObj.getZoom();
                        GLOBAL.Traffic.messagePanel.add_traffic_bubbles(zoomLevel);
                    }
                }
            );
            //绑定4s维修站点击事件
            $('#four_s').click(function() {
                navscreenevent.showPoiSearchResultScreen({ type: '通用维修', range: 50000});// by Zhen Xia
            });
            //停止模拟按钮图片点击事件
            $('#simulator img[alt="停止模拟"]').click(function() {
                constant.nav_obj.StopEmulator();
                uiManager.setPageState({pageState:'',gpsState:true});
            });
            /**
             * @description 模拟速度按钮图片点击事件，设置模拟导航的速度
             * @param iEmulatorSpeed 所设置的车速，单位公里/小时
             */
            $('#simulator img[alt="模拟速度"]').toggle(
                function() {
                    $(this).attr('src', constant.lower_speed);
                    if(tbt){
                        tbt.SetEmulatorSpeed(constant.tbt_speed_low);
                    }
                },
                function() {
                    $(this).attr('src', constant.middle_speed);
                    if(tbt){
                        tbt.SetEmulatorSpeed(constant.tbt_speed_middle);
                    }
                },

                function() {
                    $(this).attr('src', constant.high_speed);
                    if(tbt){
                        tbt.SetEmulatorSpeed(constant.tbt_speed_high);
                    }
                }
            );
        },

        //左侧#left元素工具函数
        /**
         * @description 根据网络情况，显示#gprs img元素显示图片
         **/
        judgeGRPS : function() {
            var timer_reloadMMap;
            if (typeof MMap == 'undefined') {
                    if(typeof AMap == 'undefined'){
                        console.log('no internet connection or connection to map server failed');
                        timer_reloadMMap=setInterval( function(){reloadMMap();}, 10000);   //10秒运行一次
                        function reloadMMap()
                        {
                            var constant = GLOBAL.Constant;
                            $('script').each(function(index, elsements) {

                                if($(this).attr('src').indexOf(constant.source_sdk_link_02)>=0){
                                    $(this).remove();
                                    return false;
                                }
                            });
                            var   script='<script type="text/javascript" src='+constant.source_sdk_link_02+'></script>';
                            $('head').after(script);
                            if (typeof MMap != 'undefined') {
                                clearInterval(timer_reloadMMap);
                            }

                    }
                    //连接不上网络，目前设置为自动刷新
                    //location.reload();
                }
                else{
                    MMap = AMap;//将AMap命名空间赋值给MMap，以适应应用AMap地图sdk的情况
                    //显示GPRS状态
                    $('#gprs img').attr('src' , 'images/images/gprs01.png') ;
                }
            }
            else {
                //显示GPRS状态
                $('#gprs img').attr('src' , 'images/images/gprs01.png') ;
            }
        },

        //左侧元素工具函数结束--}
        //{--菜单栏工具函数开始
        //点击左下角按钮处理函数
        click_lower_left_button: function (config) {

            var constant = GLOBAL.Constant,obj = constant.alt_lower_left_button,
                alt = $('#pull_back_btn img').attr('alt');
            switch(alt) {
                //绑定返回地图初始状态图片点击事件
                case obj.ini: {
                    if (Event.mapObj.getOverlaysByType('polyline').length == 0) {
                        $('#center').hide();
                        $('#details').hide();
                        this.expand_menu();
                        constant.centerAfterDragging = null;
                        MapEvent.pan_center(new MMap.LngLat(localStorage['Map_lng'], localStorage['Map_lat']));
                    }
                    else {
                        if (ui.route) {
                            ui.route();
                        }
                    }
                    Event.mapObj.clearOverlaysByType('polyline');
                    //Event.mapObj.setCenter(new MMap.LngLat(localStorage['Map_lng'], localStorage['Map_lat']));
                    uiManager.mapSetCenter(new MMap.LngLat(localStorage['Map_lng'], localStorage['Map_lat']));
                    break;
                }
                case obj.expand: {
                    this.expand_menu();
                    break;
                }
                case obj.expand_simulator: {
                    //$('#msg_box h3').text(constant.prompt_forbid);
                    $('#msg_box img:last').hide();
                    $('#msg_box img:first')
                        .attr({
                            'src': constant.confirm_img,
                            'alt': constant.alt_forbidden
                        })
                        .css('top', 98)
                        .off()
                        .click(function() {
                            constant.nav_obj.ResumeEmulator();
                            layer.hide();
                        });
                    var layer = new GLOBAL.layer({
                        id : 'msg_box',
                        msg : constant.prompt_forbid
                    });
                    layer.show();
                    constant.nav_obj.Pause();
                    break;
                }
                case obj.contract:{
                    this.pull_back_menu(this);
                    break;
                }
                case obj.menu:{
                    this.expand_menu(this);
                    $('#pull_back_btn img').attr({
                        'alt': obj.road
                    });
                    break;
                }
                case obj.road: {
                    this.pull_back_menu(this);
                    this.show_currRoadNameOnBottom();
                    /*$('#navi_menu_warp_left,#navi_menu_warp_right').hide();
                    $('#navi_menu_warp').show();
                    $('.navi_menu li').slice(2, 5).hide();
                    $('#current_pos').text(constant.nav_obj.currentRoadName).show();
                    $('#gpsNaviCurrRoad').val(constant.nav_obj.nextRoadName);
                    $('#pull_back_btn img').attr({
                        'alt': obj.menu
                    });*/
                    break;
                }

                case obj.ret_pre:{
                    var nextState = GLOBAL.Event.NGIStateManager.getNextState();
                    var state = GLOBAL.Constant.NGIStates;
                    switch(nextState){
                        case state.RoadSegInfo :
                            GLOBAL.Event.NGIStateManager.goToPreviousState(GLOBAL.Event.NavScreenEvent.showRoadSegInfoScreen);
                            break;
                        case state.PoiSearchResult :
                            //Event.mapObj.setCenter(new MMap.LngLat(localStorage['Map_lng'], localStorage['Map_lat']));//重设地图中心
                            uiManager.mapSetCenter(new MMap.LngLat(localStorage['Map_lng'], localStorage['Map_lat']));
                            GLOBAL.Event.NGIStateManager.goToPreviousState(GLOBAL.Event.NavScreenEvent.showPoiSearchResultScreen);
                            break;
                        case state.ViewPoiDetail :
                            GLOBAL.Event.NGIStateManager.goToPreviousState(GLOBAL.Event.NavScreenEvent.showReturnViewPoiDetailScreen);
                            break;
                        case state.PathOptions :
                            if($('#poi_current').val() == '全图浏览') $('#poi_current').val('');
                            GLOBAL.Event.NGIStateManager.goToPreviousState(GLOBAL.Event.NavScreenEvent.showPathOptionsScreen);
                            break;
                        default:
                            console.log('unexpected state: '+nextState);
                            break;
                    }
                    break;
                }

                default: {
                    console.log('undefined value');
                    break;
                }
            }
        },
        //在画页下方显示当前道路名称
        show_currRoadNameOnBottom : function () {
            var constant = GLOBAL.Constant,obj = constant.alt_lower_left_button;
            $('#navi_menu_warp_left,#navi_menu_warp_right').hide();
             $('#navi_menu_warp').show();
             $('.navi_menu li').slice(2, 5).hide();
             $('#current_pos').text(constant.nav_obj.currentRoadName).show();
             $('#gpsNaviCurrRoad').text(constant.nav_obj.nextRoadName);
             $('#pull_back_btn img').attr({
             'alt': obj.menu
             });
        },
        //点击主菜单兼设终点按钮处理函数
        click_menu_termination: function () {
            if ($('#menu_first').attr('alt') == '设终点按钮') {
                if(GLOBAL.Event.NGIStateManager.getCurrentState() == GLOBAL.Constant.NGIStates.Map)
                    thisPage.getMapCenterInfo();
                GpsNav.prepareRequestPath();
            }
            else if ($('#menu_first').attr('alt') == '主菜单按钮') {
                GLOBAL.Event.NGIStateManager.goToNextState(GLOBAL.Constant.NGIStates.MainMenu, GLOBAL.Event.NavScreenEvent.showMainMenuScreen);
            }
        },

        //加载路径时调用
        request_path_now : function() {
            var constant = GLOBAL.Constant;
            $('#msg_box h3').text(constant.prompt_request);
            $('#msg_box img:last').hide();
            $('#msg_box img:first')
                .attr({
                    'src': constant.confirm_img,
                    'alt': constant.alt_request_error
                })
                .css('top', 98);
            GLOBAL.layer.normal.show();
            $('#msg_box img').click(function() {
                GLOBAL.layer.normal.hide();
            });
        },
        //路径规划失败调用函数
        request_path_failed : function() {
            var constant = GLOBAL.Constant;
            $('#msg_box h3').text(constant.prompt_fail);
            $('#msg_box img:last').hide();
            $('#msg_box img:first')
                .attr({
                    'src': constant.confirm_img,
                    'alt': constant.alt_request_error
                });
            $('#msg_box img')
                .off()
                .click(function() {
                    GLOBAL.layer.normal.hide();
                    Event.mapObj.setStatus({dragEnable:true});
                    MapEvent.drag(Event.mapObj);
                    //thisPage.$lower_left_button.click();
                });
            GLOBAL.layer.normal.show();
        },
        getMapCenterInfo : function() {
            if (Event.mapObj !== undefined) {
                var config = {
                    lng:Event.mapObj.getCenter().lng,
                    lat:Event.mapObj.getCenter().lat,
                    name:"",
                    address:"",
                    tel:""
                },common = GLOBAL.Common;
                common.savePoiData(config);
            }
            return config;
        },
        //导航菜单自动收缩函数
        pull_nav_menu_auto: function(seconds){
            var pullMethod={
                pull:function(){
                    var currentState = GLOBAL.Event.NGIStateManager.getCurrentState(),ngiStates = GLOBAL.Constant.NGIStates;
                    //先检查导航菜单是否展开，展开才判断是否需要自动收缩
                    if( $('#navi_menu_warp').is(':visible') && (currentState == ngiStates.Map || currentState == ngiStates.Navigation) ){//导航/非导航状态均10s无操作自动收缩面板,MapWithPoi界面不收缩
                        thisPage.pull_back_menu();
                        if(currentState ==  GLOBAL.Constant.NGIStates.Navigation )
                            thisPage.show_currRoadNameOnBottom();
                        if($('#target').is(':visible')){//地图拖动后
                             $('#center').hide();
                             uiManager.mapSetCenter(new MMap.LngLat(localStorage['Map_lng'], localStorage['Map_lat']));
                        }
                    }
                    thisPage.hide_assist_menu();
                },
                naviPull:function(){
                    iframeObj.remove();
                    thisPage.retMapIni();
                    $('#compassContainer').unbind().bind('click',this.setCompass);
                    //Event.mapObj.setCenter(new MMap.LngLat(localStorage['Map_lng'], localStorage['Map_lat']));
                     uiManager.mapSetCenter(new MMap.LngLat(localStorage['Map_lng'], localStorage['Map_lat']));
                    return true;
                },
                unNaviPull:function(){
                    iframeObj.remove();
                    $('#center').hide();
                    $('#details').hide();
                    $('#poi_current').hide();
                    thisPage.expand_menu(thisPage);
                    Event.mapObj.setStatus({dragEnable:true});
                    //Event.mapObj.setCenter(new MMap.LngLat(localStorage['Map_lng'], localStorage['Map_lat']));
                    uiManager.mapSetCenter(new MMap.LngLat(localStorage['Map_lng'], localStorage['Map_lat']));
                    return true;
                }
            }
            var constant = GLOBAL.Constant;
            var saver = new ScreenSaver({timeout:seconds, callback: function(){
              /*  if($('#iframeDiv').is(':visible') || constant.nav_obj.naviStatus.emulNaviStatus ){
                    return;
                }
                var currentState = GLOBAL.Event.NGIStateManager.getCurrentState();
                if(!JSON.parse(localStorage['tbt_state'])){
                    if(currentState==GLOBAL.Constant.NGIStates.LightCross || currentState==GLOBAL.Constant.NGIStates.MapRoadSegment){
                        return;
                    }
                    if($('#target').is(':visible')){
                        if(currentState==GLOBAL.Constant.NGIStates.MapWithPoi){
                            GLOBAL.Event.NGIStateManager.goToNextState(GLOBAL.Constant.NGIStates.Map, pullMethod.unNaviPull);
                        }else{
                            pullMethod.unNaviPull();
                        }
                    }else{
                        pullMethod.pull();
                        if (typeof Event.mapObj !='undefined'){
                            Event.mapObj.setStatus({dragEnable:true});
                        }
                    }
                }else{
                    if(currentState==GLOBAL.Constant.NGIStates.MapRoadSegment ||currentState==GLOBAL.Constant.NGIStates.MapOverview || currentState==GLOBAL.Constant.NGIStates.MapWithPoi){
                        GLOBAL.Event.NGIStateManager.goToNextState(GLOBAL.Constant.NGIStates.Navigation, pullMethod.naviPull);
                    }else{
                        pullMethod.pull();
                    }
                }
                //判断收缩状态，是否继续收缩
                if($('#navi_menu_warp').is(':visible')){
                    window.clearTimeout(saver.timerID);
                    saver.timerID = window.setTimeout(function(){saver.timeout()}, seconds);
                }*/

                pullMethod.pull();
            }});

        },

        //导航菜单收缩函数
        pull_back_menu: function () {
            $('.navi_menu li:not(#pull_back_btn, #zoom_in, #zoom_out, #time_right, #current_pos,#assist)').hide();
            var altStr='展开按钮',constant = GLOBAL.Constant;
            //区分导航状态和非导航状态下的情况
            if($('#pull_back_btn img').attr('alt')!='显示当前道路名称'){
                if(JSON.parse(localStorage['tbt_state'])){
                    altStr='显示当前道路名称';
            //        $('#name input').attr('nextRoad',typeof constant.nextRoadName=='undefined'?$('#name input').val():constant.nextRoadName);
                    $('#name div').text($('#current_pos').text());
                    $('#current_pos').hide();
                }
            }

            if (!constant.nav_obj.naviStatus.emulNaviStatus){
                $('#pull_back_btn img').attr({
                    'src': 'images/images/menu_open.png',
                    'alt': altStr
                });
                //切换背景图片为半圆形图片
                $('#navi_menu_warp').hide();
                $('#navi_menu_warp_left,#navi_menu_warp_right').show();
            }
        },
        //导航菜单展开函数
        expand_menu: function () {
            var constant = GLOBAL.Constant;
            $('img[alt="设终点按钮"]').attr({
                'alt':'主菜单按钮',
                src:'images/images/main_menu.png'
            });
            $('.navi_menu li').slice(2,5).show();
            $('#navi_menu_warp').show();
            $('#navi_menu_warp_left,#navi_menu_warp_right').hide();
           // $('#name input').attr('nextRoad',typeof constant.nextRoadName=='undefined'?$('#name input').val():constant.nextRoadName);
            $('#name div').text(constant.nav_obj.currentRoadName);
            $('#pull_back_btn img').attr({
                'src': 'images/images/menu_close.png',
                'alt': '收缩按钮'
            });
            $('#current_pos').hide();
        },

        /** 点击收藏图片按钮函数工具
         * @description
         **/
        add_data : function(data) {
            var list = data.list,constant = GLOBAL.Constant ;
            if(list){
                var poi = list[0];
                var config = {
                    lng:poi.x,
                    lat:poi.y,
                    name:poi.name,
                    address:poi.address,
                    tel:poi.tel
                };
                GLOBAL.Common.savePoiData(config);
                //逆地址查询属异步调用，需在回调里跳转地址
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
        },

        lightCross : function(config) {
            var arg = {
                id : 'light_bar',
                total : $('#light_bar').height(),
                arr : config,
                address: 'url(images/images/bg_',
                metric: 'height'
            };
            ui.testLight = new SimulatorLight(arg);
            var configArg = ui.testLight.generateArg();
            Tab.set_bg(configArg);
        },
        /**
         @description 车道信息显示ui
         */
        trafficLane : function(len) {
            $('#mark span')
                .slice(1, len - 1)
                .css('background', 'url(../navigate/images/images/road_info_middle.png) no-repeat');
            var width = $('#mark').width();
            $('#mark')
                .css('left', 800 / 2 - width / 2)
                .show();
        },
        //显示右侧辅助功能菜单
        display_assist_menu : function() {
            //改变图片src属性，即更改图片
            $('#menu_extend img').attr('src', "images/images/volume_bar_close.png");
            //显示被隐藏的部分
            $('#menu_extend img').css({'width':'52px','height':'52px'});
            $('#menu_extend img').css({'padding-left':'13px','padding-right':'13px','padding-top':'5px'});
            $('#traffic_panel_toggle, #four_s').css('display', 'block');
            $('#shortcut ul').css('background-image', 'url(images/images/volume_bar.png)');
        },
        //隐藏右侧辅助功能菜单
        hide_assist_menu : function() {
            if($('#shortcut ul').css('background-image') != ''){ //右侧快捷菜单展开状态
                $('#menu_extend img').attr('src', "images/images/volume_bar_open.png");
                $('#menu_extend img').css({'width':'73px','height':'63px'});
                $('#menu_extend img').css({'padding-left':'0px','padding-right':'0px','padding-top':'0px'});
                $('#traffic_panel_toggle, #four_s').css('display', 'none');
                $('#shortcut ul').css('background-image', '');
            }
        },
        switchToMapInterface : function() {
            uiManager.setPageState({pageState:'',gpsState:false});
        },
        //点击指南针,切换地图是否进入罗盘模式
        setMapWithCompassMode:function(mode){
            if(mode == "NorthUp"){
                //指南针
                $('#compass').attr('src' , 'images/images/compass.png') ;
                localStorage['Navi_Compass_Mode'] = "NorthUp";
                //设置地图方向
                if(Event.mapObj)
                    Event.mapObj.setRotation(0) ;
            } else {
                var  t = JSON.parse(localStorage['Map_direction']);
                //算法:角度除以45再模8,得到0-7等8个方向数值,再根据图片的各字,来换相应的图片
                $('#compass').attr('src' , 'images/images/compass0'+
                    ( Math.round(t / 45) % 8 + 1) + '.png') ;
                //改变地图方向 (因为自车位置在地图覆盖物,地图旋转自车位置也会旋转,必须调整自车位置方向向上
                $('#current').css('-webkit-transform' , 'rotate('+ t +'deg)');
                //根据tbt返回的角度旋转地图
                Event.mapObj.setRotation(-t) ;
                localStorage['Navi_Compass_Mode'] = "HeadUp";
            }
        },
        /**
         * This function is for the click event of compass icon
         */
        setCompass:function(){
            var compass = localStorage['Navi_Compass_Mode'];
            if(compass == "HeadUp"){
                localStorage['Navi_Compass_Mode'] = "NorthUp";
                thisPage.setMapWithCompassMode("NorthUp");
            } else {
                localStorage['Navi_Compass_Mode'] = "HeadUp";
                thisPage.setMapWithCompassMode("HeadUp");
            }
        },
        clearMapMainInterface : function() {
            Event.mapObj.clearOverlaysByType("polyline");//删除polyline类型覆盖物
            //Event.mapObj.clearOverlaysByType("marker");//删除marker类型覆盖物 by Zhen Xia
            Event.mapObj.removeOverlays(['current','target']);
        },

        /**
         * @description 确保快速线路所在元素被选中
         */
        reSetNormalEvent : function(){
            $('#fastSection').find('img[alt="单选按钮"]').attr('src',function(i,src){return selectImg(src,true)});
            $('#normalSection').find('img[alt="单选按钮"]').attr('src',function(i,src){return selectImg(src,false)});
            $('#fastSection').css('background-image','url("images/images/select01_on.png")');
            $('#normalSection').css('background-image','url("images/images/select01.png")');
            $('#fastLine').css('background-image','url("images/images/select02_on.png")');
            $('#normalLine').css('background-image','url("images/images/select02.png")');
            $('#light_cross_html nav section, #light_cross_html figure').unbind().click(thisPage.selectPathEle).removeAttr('heigh');

            function selectImg(src,bool){
                if(bool){
                    if(!src.match(/_on\.png$/)){
                        return src.replace(/(\.png)/,'_on$1');
                    }
                    return src;
                }else{
                    if(src.match(/_on\.png$/)){
                        return src.replace(/_on(\.png)/,'$1');
                    }
                    return src;
                }
            };
        },
        selectPathEle : function() {
            var constant = GLOBAL.Constant,selectedRouteType = localStorage['route_type'],
                lightbars = $("#light_cross_html figure"),infopanels = $("#light_cross_html nav section");
            //以下两条语句设置相关元素及子元素均为未选中状态
            if($(this).attr('heigh')!='true'){
                $('#light_cross_html nav section, #light_cross_html figure').css('background-image', function(index, value) {
                    if (value.match(/_on\.png/)) {
                        value=value.replace(/\_on(\.png)/,'$1');
                        return value;
                    }
                });
                $('#light_cross_html nav section,#light_cross_html figure').find('img').attr('src', function(index, value) {
                    if (value.match(/_on\.png/)) {
                        value=value.replace(/\_on(\.png)/,'$1');
                        return value;
                    }
                });
                //设置点击元素及关联元素为选中状态
                var data = $(this).attr('data');
                $('[data=' + data + ']')
                    .find('img[alt="单选按钮"]')
                    .attr('src',function(index,value){return value.replace(/(\.png)/,'_on$1');});
                //分开处理，否则可能会气泡，重复执行mousedown方法
                if ($(this).is(infopanels)) {
                    lightbars
                        .filter('[data=' + data + ']')
                        .css('background-image', function(index, value) {
                            return value.replace(/(\.png)/,'_on$1');
                        });
                    $(this).css('background-image', function(index, value) {
                        return value.replace(/(\.png)/,'_on$1');
                    });

                }
                if ($(this).is(lightbars)) {
                    infopanels
                        .filter('[data='+data+']')
                        .css('background-image', function(index, value) {
                            return value.replace(/(\.png)/,'_on$1');
                        });
                    $(this).css('background-image', function(index, value) {
                        return value.replace(/(\.png)/,'_on$1');
                    });
                }
                lightbars.filter('[data=' + data + ']').attr('heigh','true');
                lightbars.filter('[data=' + data + ']').siblings().attr('heigh','false');
                infopanels.filter('[data=' + data + ']').attr('heigh','true');
                infopanels.filter('[data=' + data + ']').siblings().attr('heigh','false');

                if (data == 'normal') {
                    selectedRouteType = constant.iNormal;
                }
                if (data == 'rapid') {
                    selectedRouteType =  constant.iRapid;
                }
                if(selectedRouteType != localStorage['route_type'])
                    localStorage['route_type'] = selectedRouteType;
                highlightPath(selectedRouteType, constant.HighlightedLineId) ;
            }
            /**
             * 高亮选中的路线
             * 1为高亮TMC路线
             * 2为高亮普通路线
             */
            function highlightPath(type,line){
                var constant = GLOBAL.Constant;
                if(Event.mapObj.getOverlaysByType('polyline').length<=4){
                   /* var strokeColor = Event.mapObj.getOverlays("NGIRoute1").getOptions().strokeColor,changedColor;
                    changedColor = strokeColor == constant.inner1_line.strokeColor?constant.iStrokeColor:constant.inner1_line.strokeColor;
                    Event.mapObj.getOverlays("NGIRoute1").setOptions({strokeColor : changedColor}) ;*/
                    return;
                }
                Event.mapObj.clearOverlaysByType('polyline');
                var typeArr = [constant.iRapid,constant.iNormal];
                typeArr.splice(typeArr.indexOf(parseInt(type)),1);
                typeArr.push(parseInt(type));
                MapEvent.drawMultiPath(typeArr);
            };
        }
    };// JavaScript Document
    //初始化，实例化ThisPage，详见ui.js
    thisPage = Class.create(ThisPage);
})();

