/**
 * @author wangyonggang
 * @class
 * @description 业务管理类
 */
var BusinessManager = {
    /**
     * @function 默认状态下的地图效果
     * @description 默认状态下的地图显示，即主界面默认效果包括：１，显示地图；２，添加自车位置覆盖物；３，注册拖动地图事件；４,注册放大缩小地图事件（接口似不支持；５，自车覆盖物及地图中心随ＧＰＳ改变而改变
     */
    default_map_ini:function () {
        MapEvent.showLocation();
        MapEvent.setIniMapState();
    },
    /**
     * @function 双光柱地图效果
     * @description
     */
    init_lightCross:function () {
        thisPage.clearMapMainInterface();
        localStorage['Navi_Compass_Mode'] == "NorthUp";
        Event.mapObj.setRotation(0);
        MapEvent.add_current_overlay();
        MapEvent.add_target_overlay();
        DoubleLightMapEvent.drawLneAddDistanceTime();
        UtilFunc.setUiDoubleLight();
    },
    /**
     * @function 未导航地图效果
     * @description
     */
    init_Map:function () {
        Event.mapObj.clearOverlaysByType('polyline');
        Event.mapObj.removeOverlays('target');
//      html5接口获取经纬度信息时，gps发生变化时才会通知，这里有必要重新设置      html5接口获取经纬度信息时，gps发生变化时才会通知，这里有必要重新设置地图中心，否则可能接口不会返回经纬度
        //Event.mapObj.setCenter(new MMap.LngLat(localStorage['Map_lng'], localStorage['Map_lat']));
        uiManager.mapSetCenter(new MMap.LngLat(localStorage['Map_lng'], localStorage['Map_lat']));
        Event.mapObj.setStatus({dragEnable:true });
        var currentState = GLOBAL.Event.NGIStateManager.getCurrentState();
        if (currentState == GLOBAL.Constant.NGIStates.LightCross) {
            var zoomLevel = Event.mapObj.getZoom();
            GLOBAL.Traffic.messagePanel.show_traffic_bubbles(zoomLevel);//显示交通信息气泡
            MapEvent.display_scale();
        }
    },
    /**
     * @function 导航地图初始效果
     * @description
     */
    navi_Map:function () {
        var constant = GLOBAL.Constant, navState = JSON.parse(localStorage['tbt_state']);
        //设置地图中心点为自车位置，双光柱界面地图中心点为路的中点。
        Event.mapObj.setStatus({dragEnable:false});
        //MapEvent.displayChosenScale(); // by Zhen Xia
        //Event.mapObj.panTo(new MMap.LngLat(localStorage['Map_lng'], localStorage['Map_lat']));
        uiManager.mapSetCenter(new MMap.LngLat(localStorage['Map_lng'], localStorage['Map_lat']));
        if ((!navState || constant.resumeLastNavi) && !constant.nav_obj.bReroute) {
            constant.nav_obj.StartGpsNavi();
        }
        var zoomLevel = Event.mapObj.getZoom();
        GLOBAL.Traffic.messagePanel.show_traffic_bubbles(zoomLevel);
        MapEvent.display_scale();
    },
    /**
     * @function 模拟导航设置
     * @description
     */
    emulator_Map:function () {
        Event.mapObj.setStatus({dragEnable:false});
        //MapEvent.setZoom_17();
        GLOBAL.Constant.nav_obj.ResumeEmulator();
    },

    /**
     * poi搜索界面检索按钮监听器,处理点击事件
     * @param event
     */
    searchButtonListener:function (options) {
        //使用该语句而不是return false
        var keyword = options.keyword;
        var type = options.type;
        //var event=options.event;
        GLOBAL.namespace("POISearchResult");
        var rsHandler = function (data) {
            if (POISearchService.isRequestCancled()) return;//如果poi查询请求已取消，则返回
            var constant = GLOBAL.Constant;
            if (data.list) {
                var filterResult = $('#filterResult', window.frames[0].document);
                if (filterResult.length > 0) {
                    filterResult.remove();//移除周边检索结果筛选页面
                    $('#prev_button', window.frames[0].document).attr('src', '../../images/previous_page_gray.png');//上一页按钮初始化为不可用
                    GLOBAL.Event.NGIStateManager.goToPreviousState(function () {
                        $('#searchTable', window.frames[0].document).empty();//清空周边检索结果列表
                        return true;
                    });
                }
                filterResult = null;
                GLOBAL.POISearchResult.data = data;
                if (GLOBAL.Event.NGIStateManager.getCurrentState() != 'PoiSearchResult') {
                    GLOBAL.Event.NGIStateManager.goToNextState(GLOBAL.Constant.NGIStates.PoiSearchResult, businessManager.searchPoiButtonListener);
                } else {
                    if (GLOBAL.POISearchResult.keyword != null) {
                        frames[0].window.GLOBAL.POISearchResult.rsHandler(data, 'byKeyword');
                    } else {
                        if (data, data.list.length <= constant.search_num) {
                            frames[0].window.GLOBAL.POISearchResult.rsHandler(data, 'byCenPoi');
                        }
                        //else{
                        //frames[0].window.GLOBAL.POISearchResult.rsHandler(data,data.list.length-constant.search_num);
                        //}
                    }
                }
            } else {
                var promptmsg;
                if (data.message == "Time out.")
                    promptmsg = "网络连接超时，请检查网络重试";
                else
                    promptmsg = "无检索结果";
                var container = window;//元素所在页面容器
                if($('#iframeDiv').css("visibility")=="visible"){
                    container = frames[0].window;
                }
                var layer = new container.GLOBAL.layer({msg:promptmsg, id:'msg_box_fail'});
                layer.show();
                $("#msg_box_fail img[alt='确定按钮']", container.document).click(function () {
                    $("#aside_spinner", container.document).hide();
                    GLOBAL.layer.normal.hide();
                });
            }
        };
        /*if(typeof event !='undefined'){
         event.preventDefault();
         }*/
        if (typeof type != 'undefined') {
            try {
                GLOBAL.Constant.poi_search_type = type;
                /*if ($('#center').is(':visible')) {
                 thisPage.save_poi_data();
                 }*/
                GLOBAL.POISearchResult.type = type;
                GLOBAL.POISearchResult.searchContext = {
                    "type":GLOBAL.POISearchResult.type,
                    "successHandler":rsHandler,
                    "range":options.range || null, //by Zhen Xia
                    "batch":1,
                    "keyword":keyword || '' //by Zhen Xia
                };
                //根据地图中心查找
                POISearchService.byCenPoi(GLOBAL.POISearchResult.searchContext);
            } catch (e) {
                console.log("POI search error : " + e.message);
            }
            return;
        }
        if (!GLOBAL.tools.isBlank(keyword)) {
            try {
                localStorage.setItem('Map_current_keyword', keyword);
                GLOBAL.POISearchResult.keyword = keyword;
                GLOBAL.POISearchResult.region = localStorage['Map_search_area'];
                GLOBAL.POISearchResult.searchContext = {
                    "keyword":GLOBAL.POISearchResult.keyword,
                    "region":GLOBAL.POISearchResult.region,
                    "successHandler":rsHandler,
                    "batch":1
                };
                //根据关键字,城市查找
                POISearchService.byKeywords(GLOBAL.POISearchResult.searchContext);
            } catch (e) {
                console.log("POI search error : " + e.message);
            }
        }
    },
    /**
     * 搜索结果点击事件监听器
     * @param lng
     * @param lat
     * @param name
     * @param address
     * @param tel
     */
    rsItemListener:function (config) {
        //设置返回按钮点击条件
        GLOBAL.Constant.poi_search_result = config;
        //$('#poi_current').val(config.name);//by zhen xia,在显示详细之处显示
        //var coord_target = new MMap.LngLat(config.lng, config.lat);
        //Event.mapObj.setCenter(coord_target);
        //var distance = MapEvent.determin_distance(coord_target);
        //将距离写入地图中心图标的标题元素中,该搜索结果到自车的距离
        //$('#center figcaption').text(distance);
        //MapEvent.add_current_overlay();
        //Event.mapObj.setStatus({dragEnable:false});
        //MapEvent.setZoom_17();
    },

    /**
     * 打开城市按钮监听器
     */
//	regionButtonListener : function() {
//		frames[0].window.location.href = "region.html" ;
//	} ,
    displayPoiPage:function () {
        frames[0].$('#region_html').hide();
        frames[0].$('div:first').show();
    }, /**
     * 打开城市按钮监听器，load页面region.html
     */
    regionButtonListener:function () {
        frames[0].$('body > div').hide();
        if (frames[0].$('#region_html').length == 0) {
            var that = this;
            frames[0].$('<div id="region_html"></div>')
                .appendTo('body', frames[0].document)
                .load('region.html', function () {
                    $('img[alt="返回按钮"]', this).click(function () {
                        that.displayPoiPage();
                    });
                });
        } else {
            frames[0].$('#region_html').show();
        }
    },
    /**
     * poi检索监听器
     */
    searchPoiButtonListener:function () {
        if($('#iframeDiv').css("visibility")=="hidden"){
            iframeObj.show();
        }
        frames[0].window.location.href = "../main_menu/destn/POISearchResult.html";
        return true;
    },
    /**
     * @function 显示详细信息
     * @description
     */
    showViewPoiDetailScreen:function () {
        if($('#iframeDiv').css("visibility")=="hidden"){
            $('<div id="detailsDiv" class="w800 h480" style="position:absolute;top:0px;display:none;z-index:9999"></div>').appendTo('#map');
            $('#detailsDiv').load('details.html');
            $('#detailsDiv').show();
        } else {
            frames[0].window.location.href = "detail.html";
        }
    },
    /**
     * @function
     * @description  显示全图浏览业务处理
     */
    showMapOverviewScreen:function () {
        Event.mapObj.setRotation(0);
        //Event.mapObj.setFitView();
        var pathArray = MapEvent.getPathArray();
        GLOBAL.Common.MapUtil.setPathZoom(Event.mapObj, pathArray);
        //MapEvent.add_target_overlay();
        Event.mapObj.setStatus({dragEnable:true});
        MapEvent.setPolylineState(true);
        MapEvent.setOverlayStateById({id:'target', state:true});
        MapEvent.changePointArrow(GLOBAL.Constant.nav_obj);
        MapEvent.display_scale();
        GLOBAL.Traffic.messagePanel.hide_traffic_bubbles();
    },
    /**
     * @function
     * @description  分段道路信息地图浏览
     */
    showMapRoadSegmentScreen:function () {
        var config = GLOBAL.Common.LocalSave.read('Map_seg_center');
        Event.mapObj.setStatus({dragEnable:true});
        //MapEvent.add_target_overlay();
        MapEvent.setPolylineState(true);
        MapEvent.setOverlayStateById({id:'target', state:true});
        //Event.mapObj.setCenter(new MMap.LngLat(config.lng, config.lat));
        uiManager.mapSetCenter(new MMap.LngLat(config.lng, config.lat));
        //MapEvent.setZoom_17();
        Event.mapObj.setRotation(0);
        var currentLngLat = {
            fLatitude:localStorage['Map_lat'],
            fLongitude:localStorage['Map_lng']
        };
        GLOBAL.NavClass.updatePointingDirection(currentLngLat);

        $('#poi_current').text(config.name);
        var zoom = Event.mapObj.getZoom();
        GLOBAL.Traffic.messagePanel.show_traffic_bubbles(zoom);//显示交通信息气泡
    },
    /**
     * @function
     * @description  显示模拟导航界面
     */
    showEmulatorScreen:function () {
        var constant = GLOBAL.Constant;
        constant.nav_obj.naviStatus.emulNaviStatus = true;
        constant.nav_obj.StartEmulator();
        tbt.SetEmulatorSpeed(constant.tbt_speed_high);
        Event.mapObj.setStatus({dragEnable:false});
        //MapEvent.setZoom_17();
    },
    /**
     * @function
     * @description  显示GpsInfo界面
     */
    showGpsInfoScreen:function () {
        frames[0].window.location.href = '../main_menu/assist/gps.html';
        iframeObj.show();
    },
    //显示筛选界面
    /*showPoiSearchResultFilterScreen :function(){
     $('<div id="filterResult" class="w800 h480" style="position:absolute;top:0px;"></div').appendTo(frames[0].window.document.body);
     $(frames[0].window.document.body).find('#filterResult').load('../main_menu/destn/choose.html');
     },*/
    TilesArray:[], //地图Tile信息数组
    //缓存地图
    setTileUrl:function (x, y, z) {
        var domainsNumber = 4 , domain = -1 , tiles = this.TilesArray;
        for (var i = 0, len = tiles.length; i < len; i++) {//检查Tile是否已经加载过
            if (tiles[i].x == x && tiles[i].y == y && tiles[i].z == z) {
                domain = tiles[i].domain;
                break;
            }
        }
        if (domain == -1) {//没有加载过，保存该tile
            domain = Math.ceil(Math.random() * domainsNumber);
            tiles.push({"domain":domain, "x":x, "y":y, "z":z});//保存tile信息
        }
        return "http://webrd0" + domain + ".is.autonavi.com/appmaptile?x=" + x + "&y=" + y + "&z=" + z + "&lang=zh_cn&size=1&scale=1&style=7";
    }

};
businessManager = Class.create(BusinessManager);