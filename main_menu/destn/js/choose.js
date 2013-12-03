$(function () {
    //根据传入的查询关键字使用ajax方式加载二级关键字
    function ajax_query(key) {

        var xmlParser = {
            xml_dom:xml_dom,
            callback:function (xml) {
                var styleStr = 'background-image:url(images/images/btn02.png); width:733px; height:57px;background-position-y: 50%; background-repeat:no-repeat; background-position-y:50%;text-align: left;color: #24305d;background-repeat: no-repeat;font-size: 24px;font-weight: bold;padding-left: 20px;';
                var $child = $(xml).find('[name="' + key + '"]').children('c3');
                if ($child.length !== 0) {
                    $child.each(function (i, n) {
                        var third = $(this).attr('name');
                        var str = '<tr><td style="'+styleStr +'">' + third + '</td></tr>';
                        $(str).appendTo('#filterTable');
                    });
                }
                else {
                    //查询三级关键字的所有兄弟元素
                    var third = $(xml).find('[name="' + key + '"]').siblings().andSelf();
                    third.each(function (i, n) {
                        var str = '<tr><td style="'+styleStr +'">' + $(n).attr('name') + '</td></tr>';
                        $(str).appendTo('#filterTable');
                    });
                }
            }
        };
        parent.GLOBAL.Common.parseStr2Dom(xmlParser);
    }

    ajax_query(parent.window.GLOBAL.Constant.poi_search_type);
    //设置检索三级查询关键字点击事件
    $('#filterTable td').die().live('click', function () {
        var parentglobal = parent.window.GLOBAL;
        parentglobal.Constant.poi_search_type = $(this).text();
        filterQuery();
    });
    //绑定检索全部按钮点击事件
    $('#search_all').off().click(function () {
        $.get('../../rim/classes.xml', function (xml) {
            var $c2 = $(xml).find('[name="' + parent.GLOBAL.Constant.poi_search_type + '"]').filter('c2');
            if ($c2.length == 0) {
                //当前关键字是三级关键字，查询其父元素
                var second = $(xml).find('[name="' + parent.GLOBAL.Constant.poi_search_type + '"]').parent();
                parent.window.GLOBAL.Constant.poi_search_type = $(second).attr('name');
            }
            parent.window.GLOBAL.Event.NGIStateManager.goToPreviousState(filterQuery);
        }, 'xml');
    });
    $('#returnSearch').off().click(function () {
        parent.POISearchService.cancleRequest();//如果POI请求结果还未返回，则取消请求
        $("#aside_spinner").hide() ;//如果正在请求数据，关闭加载提示
        parent.window.GLOBAL.Event.NGIStateManager.goToPreviousState(returnSearch);
    });
    function filterQuery() {
        var parentglobal = parent.window.GLOBAL;
        parentglobal.POISearchResult.type = parentglobal.Constant.poi_search_type;
        parentglobal.POISearchResult.searchContext.type = parentglobal.Constant.poi_search_type;
        parent.window.GLOBAL.POISearchResult.searchContext.batch = 1;//重置为请求第一页
        $("#aside_spinner").show() ;
        //根据地图中心查找
        parent.POISearchService.byCenPoi(parentglobal.POISearchResult.searchContext);
        return true;
    };
    function returnSearch() {
        $('#filterResult').remove();
        return true;
    }
});

