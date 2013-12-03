window.GLOBAL = {};
	GLOBAL.namespace = function (str) {
        var arr = str.split('.'), o = GLOBAL;
        for (var i = (arr[0] == 'GLOBAL') ? 1 : 0, len = arr.length; i < len; i++) {
            o[arr[i]] = o[arr[i]] || {};
            o = o[arr[i]];
        }
    };
if (!localStorage) {//check whether localStorage is supported
		localStorage = {};
	}
/*
客户端数据,localStorage为字符串类型,赋值后全局变量得到其一份拷贝,修改该拷贝不会影响本地存储的数据。
*/
//定义简写形式
GLOBAL.namespace('Constant');
GLOBAL.namespace('init');
GLOBAL.namespace('Event');
GLOBAL.namespace('ui');
GLOBAL.namespace('Common');
GLOBAL.namespace('tools');
GLOBAL.namespace('layer');
//use a variable easy to write, init is globa variable
var init = GLOBAL.init,  Event = GLOBAL.Event, ui = GLOBAL.ui, tools = GLOBAL.tools;
(function(){
    var cons = {
        /**
         * @constant 请求路径时间限制 15s
         */
        tbt_timeout_interval : 15,

        //图标尺寸
        icon_target_size: {width:77, height:78},
        //页面文字常量
        favor_history: '历史目的地',
        favor_other: '收藏点',
        destination: '目的地',
        no_name_road: '无名道路',
        null_value: '',
        undefined_value:'未知',
        //提示框文字
        //目的地设置相关
        prompt_request: '正在请求路线，请稍候！',
        prompt_fail: '网络连接失败，请您稍后重试或检查终端网络是否连接正常，部分导航功能将不能使用',
        prompt_forbid: '模拟导航中无法进行该项操作',
        prompt_netFail:'网络连接失败，请您稍后重试或检查终端网络是否连接正常。',
        prompt_doublication: '起点和终点重合，无法计算路径',
        prompt_delete: '确认是否删除当前',
        prompt_delete_all: '请确认是否删除所有',
        prompt_reroute:'正在为您重新规划路径',
        prompt_tmcreroute:'正在为您重新规划路径避开拥堵路线',
        prompt_reroute_dialog:'路线发生拥堵，是否进行路线重算?',
        prompt_reroute_tts:"路线路况发生拥堵，请选择是否重新规划避开拥堵路线?",
        //图片alt属性
        ret_map_ini: '返回地图初始状态按钮',
        alt_lower_left_button: {
            ini: '返回地图初始状态按钮',
            ret_result: "返回搜索结果按钮",
            ret_rim_result:"返回周边搜索结果按钮",
            expand: '展开按钮',
            expand_simulator: '导航界面-展开按钮',
            contract: '收缩按钮',
            contract_simulator: '导航界面-收缩按钮',
            //menu 和 road 是导航状态下左下角按钮的alt值
            menu: '显示菜单栏',
            road: '显示当前道路名称',
            ret_pre: '返回上一页按钮',
            ret_path: '返回路径选项页面按钮',
            ret_subsection: '返回分段浏览页面'
        },
        alt_current: '自车位置图标',
        alt_target: '目的地图标',
        //模拟弹出窗口
        alt_forbidden: '禁止点击',
        alt_request_error: '请求路径失败',
        prom_point: '您不能选择超过四个以上的目的地',
        prom_no_result: '无检索结果',
        prom_beyond_num: '当前类别已经超过设定数量，请更换类别',
        btn_name: '全图浏览',
        //显示比例尺
        scale_range: ['25m', '50m', '100m', '200m', '400m', '800m', '1.5km', '3km', '6km', '13km', '25km', '50km', '100km', '200km', '400km', '800km'],
        /**
         @constant 导航段转向图标定义如下：
         1			// 自车图标
         2			// 左转图标
         3			// 右转图标
         4			// 左前方图标
         5			// 右前方图标
         6			// 左后方图标
         7			// 右后方图标
         8			// 左转掉头图标
         9			// 直行图标
         10		// 到达途经点图标
         11		// 进入环岛图标
         12		// 驶出环岛图标
         13		// 到达服务区图标
         14		// 到达收费站图标
         15		// 到达目的地图标
         16		// 进入隧道图标
         */
        icon_direction_nav: {
            '1自车': "images/images/car.png",
            //'9': '',
            '0': '',
            '15目的地': "images/images/goal.png",
            '9直行': "images/images/direct_up.png",

            '2左转': "images/images/direct_turn_left.png",
            '4左前方': "images/images/direct_zqf.png",
            '6左后方': "images/images/direct_up_left_back.png",
            '8左转掉头': "images/images/direct_turn_left_back.png",

            '3右转': "images/images/direct_turn_right.png",
            '5右前方': "images/images/driect_yqf.png",
            '7右后': "images/images/direct_up_right_back.png",

            '12交叉路口': "images/images/roundabout.png",
            '11交叉路口': "images/images/roundabout.png",
            '14收费站': "images/images/station.png",
            '16隧道': "images/images/tunnel.png",
            '10途经地': "images/images/pass.png",
            '13服务区': "images/images/service.png"
        },

        icon_direction_sub: {
            '1自车': "images/subsection_images/car_mark.png",
            '9直行': "images/subsection_images/direct_up_1.png",
            '0': '',
            '15目的地': "images/images/goal_pic_1.png",

            '2左转': "images/subsection_images/direct_turn_left_1.png",
            '4左前方': "images/subsection_images/directzqf_1.png",
            '6左后方': "images/subsection_images/direct_up_left_back_1.png",
            '8左转掉头': "images/subsection_images/direct_turn_left_back_1.png",

            '3右转': "images/subsection_images/direct_turn_right_1.png",
            '5右前方': "images/subsection_images/directyqf_1.png",
            '7右后方': "images/subsection_images/direct_up_right_back_1.png",

            '12交叉路口': "images/subsection_images/huandao_1.png",
            '11交叉路口': "images/subsection_images/huandao_1.png",
            '14收费站': "images/subsection_images/shoufeizhan_1.png",
            '16隧道': "images/subsection_images/tunnel_1.png",
            '10途经地': "images/subsection_images/tujing_pic_1.png",
            '13服务区': "images/subsection_images/service_1.png"
        },
        /**
         @constant 车道图标
         */
        icon_traffic_lane: {
            ahead: {
                code: 0,
                picture: 'road_info_go_straight.png'
            },
            left: {
                code: 1,
                picture: 'road_info_leftarrow.png'
            },
            aheadLeft: {
                code: 2,
                picture: 'road_info_go_straight_l.png'
            },
            right: {
                code: 3,
                picture: 'road_info_rightarrow.png'
            },
            aheadRight: {
                code: 4,
                picture: 'road_info_go_straight_r.png'
            },
            leftUTurn: {
                code: 5,
                picture: 'road_info_turn_round.png'
            },
            leftRight: {
                code: 6,
                picture: 'road_info_rl.png'
            },
            aheadLeftRight: {
                code: 7,
                picture: ''
            },
            rightUTurn: {
                code: 8,
                picture: ''
            },
            aheadLeftUTurn: {
                code: 9,
                picture: ''
            },
            aheadRightUTurn: {
                code: 10,
                picture: ''
            },
            leftLeftUTurn: {
                code: 11,
                picture: 'road_info_turn_round_l.png'
            },
            rightRightUTurn: {
                code: 12,
                picture: ''
            },
            leftInAhead: {
                code: 13,
                picture: ''
            },
            leftInLeftUTurn: {
                code: 14,
                picture: ''
            }
        },
        /**
         @description 推荐车道图片作为前景图时对应的图标
         */
        icon_traffic_lane_foreground: {
            0: {
                2: 'road_info_go_straight_l_1.png',
                4: 'road_info_go_straight_r_1.png',
           //     7: 'road_info_go_straight_1.png',
                9: 'road_info_go_straight_l_1.png',
                10: 'road_info_go_straight_r_1.png',
                13: 'road_info_go_straight_l_1.png'
            },
            1:{
                2: 'road_info_go_straight_l_2.png',
                6: 'road_info_rl_1.png',
              //  7:
                11:'road_info_turn_round_l_2.png'
             //   14:
            },
         //   2: 'road_info_go_straight_l_2.png',
            3:{
                4:'road_info_go_straight_r_2.png',
                6:'road_info_rl_2.png',
               // 7:'',
                12:''
            },

            5: {
                11:'road_info_turn_round_l_1.png'
            }
        },
        /**
         * @constant 轮询gps信息的参数设置
         * @default WatchGPS类的类属性，默认值
         */
        options_gps: {
            enableHighAccuracy: true,
            /**
             @description 1秒获取一个GPS点
             */
            timeout: 1000,
            /**
             @description 无条件重新获取GPS位置
             */
            maximumAge: 0
        },
        //polyline覆盖物设置
        outer_line: {
            //id: "pline",
            strokeColor: "#4ea9d7",
            strokeOpacity: 1,
            strokeWeight: 10,
            fillOpacity: 0.8,
            fillColor: "#96D2F0"
        },
        inner1_line: {
            //id:"pline_inner1",
            strokeColor:"#64B4DE",//线颜色
            strokeOpacity:1,//线透明度
            strokeWeight:8,//线宽
            fillOpacity: 0.8,
            fillColor: "#96D2F0"
        },
        inner2_line: {
            //id:"pline_inner2",
            strokeColor:"#84C6E8",//线颜色
            strokeOpacity:1,//线透明度
            strokeWeight:5,//线宽
            fillOpacity: 0.8
        },
        center_line:{
            //id:"pline_second",
            strokeColor:"#85D2F0",//线颜色
            strokeOpacity:1,//线透明度
            strokeWeight:2.5,//线宽
            fillOpacity: 0.8
        },
        iStrokeColor:"#F3F",//路径高亮时边界线的颜色

        /**
         @description 模拟导航速度值
         */
        tbt_speed_low: 15,
        tbt_speed_middle: 60,
        tbt_speed_high: 90,
        //动态交通功能设定相关参数
        //图片地址
        scale_up: 'images/images/scale_up.png',
        bg_normal : 'url(../navigate/images/images/panel02.png)',
        bg_nvi : 'url(../navigate/images/images/panel04.png) no-repeat 152px 17px, url(../navigate/images/images/panel02.png)',
        target_img : 'images/images/position.png',
        flag_img : 'images/images/goal_pic_2_small.png',
        current_img: 'images/images/car.png',
        mark_img: 'images/images/turning_point.png',
        mark_img_start: 'images/images/starting_point.png',
        set_destination: 'images/images/destination.png',
        src_ret: 'images/images/menu_back.png',
        lower_speed: 'images/images/low_speed.png',
        middle_speed: 'images/images/middle_speed.png',
        high_speed: 'images/images/high_speed.png',
        //确定按钮图片
        confirm_img: '../images/definitive02.png',
        contract_img: 'images/images/menu_close.png',

        //用户环境
        //路径类型，多路径（一条考虑实时交通路况路线，一条最优路线（未考虑实时交通））
        iRouteType:5,
        //距离单位
        iUnit:1000,
        //最小缩放级别
        iMinZoom:3,
        //最大绽放级别
        iMaxZoom:18,
        //高亮路径时须设置strokeColor属性的路径覆盖物id
        HighlightedLineId:"NGIRoute5",
        //快速路径
        iRapid:4,
        //普通路径
        iNormal:0,
        //绘制路径数量
        iNum_Route:2,
        //tbt请求网络返回数据格式错误
        iEstateError:5,
        //tbt请求网络超时
        iEstateTimeOut:2,
        //tbt请求网络失败
        iEstateFail:3,
        //tbt请求网络请求完成
        iEstateSuccess:[0,1], //0 表示reroute求路成功，1表示普通求路成功
        //地图放大一个级别
        iLeave_zoomin:1,
        //地图缩小一个级别
        iLeave_zoomout:0,

        /**
         @requires sdk链接
         */
        source_sdk_link_01: "http://apiv3.test.mapabc.com/map.js?key=f9bc6d756c9176716881e278638e0bb8f5bd78ddeb4ac3033e8ab3591e0fcefa8c26ce3fd36d5a0f",
        source_sdk_link_02: "http://apis.mapabc.com/webapi/auth.json?t=ajaxmap&v=3.0&key=f6c97a7f64063cfee7c2dc2157847204d4dbf093f42472345fce56979d1e9c292144138b89993c81",
        addLoadJsTime : 3000,
        resolution: 5 / 3,
        //如果本地资源够用可能修改为200条
        restrict_favor: 200,
        search_num: 30,
        //搜索结果页面显示数量，目前为6个，不翻页
        display_num: 6,
        favor_id: "",
        poi_search_result:{},
        turnMarkerIdPrefix: 'turnMarker_',
        SearchKeywordNum:5,
        //显示交通信息气泡的最小zoom level 3km
        iMinTrafficPanelLevel : 11,
        ViewDistanceArr:["2","8","all"],
        centerAfterDragging:null,
        tbt_gpsLog_state: false, //设置使用gps log模拟导航
        tbt_gpsLog_loop: true, //设置gps log模拟导航是否循环进行
        tbt_simulateGpsSpeed: 500 //使用GPS Log点模拟导航速度，1000毫秒传入一个gps点的值
    } ;
    $.each(cons, function(i, n) {
        GLOBAL.Constant[i] = n;
    });
})();



//定义常量和全局变量
//定义页面状态
GLOBAL.Constant.NGIStates = {
    Map : 'Map', //only for non-navigate mode
    MapWithPoi:"MapWithPoi",
    Navigation:"Navigation",//for navigation mode
    GpsInfo : 'GpsInfo',
    
    //从非导航状态地图界面可能进入的界面
    LightCross : 'LightCross',					  //双光柱界面
    PoiSearchByKeyword : 'PoiSearchByKeyword', //目的地检索界面
    MainMenu : 'MainMenu',                        //主菜单界面
    PoiSearchNearby : 'PoiSearchNearby',        //周边检索界面
    AddToFavorites : 'AddToFavorites',          //收藏界面
    //从导航状态地图界面可能进入的界面
    RoadSegInfo : 'RoadSegInfo',            //分段浏览界面
    TrafficCondition : 'TrafficCondition',     //路径状况界面
    PathOptions : 'PathOptions' ,                //路径选项界面

    //主菜单界面可能进入的界面
    TrafficInfo : 'TrafficInfo',                 //动态交通界面
    SystemSettings : 'SystemSettings',          //系统设定界面
    Favorites : 'Favorites',                      //收藏夹界面
    AuxiliaryFuncs : 'AuxiliaryFuncs',      //辅助功能界面
    //目的地检索可能进入的界面
    PoiSearchRegion : 'PoiSearchRegion',        //检索区域变更界面
    PoiSearchResult : 'PoiSearchResult',        //检索结果界面
    ViewPoiDetail : 'ViewPoiDetail',             //详细信息界面

    //路径选项界面可能进入的界面
    MapOverview : 'MapOverview',                 //全图浏览

    //分段信息可能进入的界面
    MapRoadSegment:"MapRoadSegment", // 分段道路信息地图浏览

    //动态交通界面可能进入的界面
    TrafficInfoSetting : 'TrafficInfoSetting',        //动态交通-功能设定
    TrafficLegend : ' TrafficLegend',            //动态交通-图例说明

    //收藏夹界面可能进入的界面
    FavoritesList : 'FavoritesList',             //收藏列表
    
    //辅助功能界面可能进入的界面
    VersionInfo : ' VersionInfo',                  //版本信息界面

    //周边检索界面可能进入的界面
    PoiSearchRange : 'PoiSearchRange',           //检索范围界面
    PoiSearchResultFilter : 'PoiSearchResultFilter' ,//筛选界面
    NearBySearchMore : 'NearBySearchMore'         //更多设施界面
};
//定义状态对应的URL
GLOBAL.Constant.NGIStatesURL = {
    Map : 'navigate/index.html',
    MapWithPoi:'navigate/index.html',
    Navigation:'navigate/index.html',//for navigation mode
    GpsInfo : 'main_menu/assist/gps.html',

    //从非导航状态地图界面可能进入的界面
    PoiSearchByKeyword : 'main_menu/destn/index.html', //目的地检索界面
    MainMenu : 'main_menu/index.html',                        //主菜单界面
    PoiSearchNearby : 'rim/index.html',        //周边检索界面
    AddToFavorites : 'main_menu/favorite/add.html',          //收藏界面

    //从导航状态地图界面可能进入的界面
    RoadSegInfo : 'navigate/subsection.html',            //分段浏览界面
    TrafficCondition : 'main_menu/traffic/conditions.html',     //路径状况界面
    PathOptions : 'main_menu/path/index.html' ,                //路径选项界面

    //主菜单界面可能进入的界面
    LightCross : 'navigate/index.html',					  //双光柱界面
    TrafficInfo : 'main_menu/traffic/index.html',       //动态交通界面
    SystemSettings : 'main_menu/system/index.html',          //系统设定界面
    Favorites : 'main_menu/favorite/index.html',                      //收藏夹界面
    AuxiliaryFuncs : 'main_menu/assist/index.html',      //辅助功能界面

    //目的地检索可能进入的界面
    PoiSearchRegion : 'main_menu/destn/region.html',        //检索区域变更界面
    PoiSearchResult : 'main_menu/destn/POISearchResult.html',        //检索结果界面，包括目的地检索结果界面、周边检索结果界面
    ViewPoiDetail : 'navigate/details.html',             //详细信息界面

    //路径选项界面可能进入的界面
    MapOverview : 'navigate/index.html',                 //全图浏览

    //动态交通界面可能进入的界面
    TrafficInfoSetting : 'main_menu/traffic/func.html',        //动态交通-功能设定
    TrafficLegend : 'main_menu/traffic/legend.html',            //动态交通-图例说明

    //收藏夹界面可能进入的界面
    FavoritesList : 'main_menu/favorite/type.html',             //收藏列表

    //辅助功能界面可能进入的界面
    VersionInfo : 'main_menu/assist/version.html',                  //版本信息界面

    //周边检索界面可能进入的界面
    PoiSearchRange : 'rim/range.html',           //检索范围界面
    PoiSearchResultFilter : 'main_menu/destn/choose.html' ,//筛选界面 目前没有切换到该状态
    NearBySearchMore : 'rim/more.html'         //更多设施界面
};