/**
 * @fileOverview 该文件控制主界面加载地图逻辑
 *  COPYRIGHT Shanghai RaxTone-Tech Co.,Ltd.
 * @author hongliang.zhang, qq:	 20132277
 * @version V1.0
 **/

$(function() {
    var constant = GLOBAL.Constant;
    //地图界面加载完毕执行该函数
    if (JSON.parse(localStorage['tbt_state'])) {
        var layerFirst = new GLOBAL.layer({id:'msg_box'});
        $('#msg_box img[alt="是按钮"]').click(function() {
            constant.poi_search_result = GLOBAL.Common.LocalSave.read('NaviDestination');//读取上次导航终点
            // 以当前自车位置作为起点，上次导航目的地作为终点求导航路径
            constant.resumeLastNavi = true;
            constant.nav_obj.end = {
                x : constant.poi_search_result.lng,
                y : constant.poi_search_result.lat
            }
            MapEvent.add_target_overlay();
            GpsNav.prepareRequestPath();
        });
        $('#msg_box img[alt="否按钮"]').click(function() {
            localStorage['tbt_state'] = false;
            uiManager.setPageState({pageState:''});
        });
        layerFirst.show();
    }
    localStorage['tbt_state'] = false;
    if (typeof MMap !== 'undefined') {
        GpsNav.initializeDemoTbt();
        GLOBAL.Event.NavScreenEvent.showMapScreen();
        getCurrentCity(localStorage['Map_lng'], localStorage['Map_lat']);
    }else {
        var config = {
            id:'msg_box_fail',
            msg:constant.prompt_netFail
        };
        var layer=new GLOBAL.layer(config);
        layer.show();
         // map.js未加载到时，进行处理。尚需余小龙确认具体需求，目前设置为用户点击确定后，跳转到安全页面。另外，可使用ui.js中的judgeGRPS处理
        $('#msg_box_fail img').click(function() {
            layer.hide();
            location.href = '../safe/index.html';
        });
    }
});
//你地址编码获取当前城市
function getCurrentCity(lng,lat){
    if(typeof lng == "undefined" || typeof lat == "undefined"){
        console.log('invalid lng or lat');
        return;
    }
    Tab.coord_regeocode(lng,lat,function(data){
                if(typeof data.city !="undefined"){
                    var city = data.city;
                    localStorage['Map_search_area'] = city;
                }
    });
}
