/**
 * 定义系统初值
 * @COPYRIGHT Shanghai RaxTone-Tech Co.,Ltd.
 * @Title: SystemIni.js
 * @Description:  定义系统初值
 * @author xiazhen
 * @date 2012-11-7
 * @version V1.0
 * Modification History:
 */
 var system_ini = {
        //动态交通-功能设定页面默认值
        //动态更新频率,默认两分钟
        'Map_tbt_fqcy':2,
        //默认显示当前路况信息
        'Map_tbt_display':true,
        //动态光柱默认显示
        'Map_tbt_conditions':true,
        //路径视野范围默认值两公里
        'Map_tbt_view':2,
        //系统设定页面默认值
        'Map_system_style':'switcher',
        //语音提示,可选值concise, detailed,默认详细显示
        'Map_system_prompt':'detailed',
        //电子眼提示,可选值true,false,默认显示
        'Map_system_eye':true,//1播报，0，不播报
        //音量值，区间未定，需根据硬件要求完善。
        'Map_system_volume':'09',
        //是否设置静音,默认有声音
        'Map_system_voice':true, //可能不需要
        //比例尺默认值
        'Map_scale':15,
        'Map_poi_range':2000,
        //关键词查询，默认为上海市内的poi检索
        'Map_search_area':'上海市',
        'Map_lng':'121.499053',
        'Map_lat':"31.2392739",
        'Map_keywords':'',//用户搜索的最后五个关键词,
        'TMCReroute':true,
        'TMCReroutePrompt':true,
        'TMCBroadcast':false,//由于常打断正常的导航播报，所以默认为关掉的状态
        'favorite_local':'',
        'RouteRequestType':5, //0最优路径，1快速路，2距离优先，3普通路，4考虑实时路况，5多路径
		 //交通情报板，默认打开
        'traffic_panel_on': true
    };