// JavaScript Document
$(function () {
    var constant = GLOBAL.Constant;
    //end初始值为false，代码全部执行后设置为true，才能跳转到下一个页面
    var i = 0, end = false;
    if (GLOBAL.Common.checkNet())
        setInterval(replace_src, 500);
    else {
        var config = {
            id:'msg_box_fail',
            msg:constant.prompt_netFail
        };
        var layer = new GLOBAL.layer(config);
        layer.show();
    }

    //替换进度条内显示的图片地址
    function replace_src() {
        if (i >= 5 && end == true) {
            location.href = '../safe/index.html';
            return;
        }
        else{
            var imgIndex = 0;
            if(i < 5) imgIndex = i;
            else if(!end) imgIndex = 4;
            
            var arr = ['02', '04', '06', '08', '10'];
            var src_new = $('#progress img').attr('src').replace(/\d+/, arr[imgIndex]);
            $('#progress img').attr('src', src_new);
            i++;
        }
    }
    //获取当前经纬度并更新本地存储的位置信息（自车位置）
    GLOBAL.WatchGPS.GetCurrentPosition();
//系统初始化，系统本次通电后第一次进入时，进行初始化。如果不是客户端第一次装车使用，就赋值为上一次设置的值（可被用户修改），否则，赋值为默认值，即对象GLOBAL.ini的属性值，这样可以保证系统在任何状况下本地变量都设置了初值，方便程序调用及修改。
    $.each(system_ini, function (i, n) {
        if(localStorage[i] === undefined)
            localStorage[i] = n;
    });
    //记录导航过程中对应用程序的设置以便下次进入时使用
    var appParameters = {
        //当前是否是导航状态
        "tbt_state":false,
        //默认显示快速线路，普通线路为0
        'route_type':4,
        'Navi_Compass_Mode':"NorthUp" //地图向上模式，另一种情况是车头向上（HeadUp）
    }
    $.each(appParameters, function (i, n) {
        if(localStorage[i] === undefined)
            localStorage[i] = n;
    });

    end = true;
});