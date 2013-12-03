/**
 * 弹出层操作
 * @COPYRIGHT Shanghai RaxTone-Tech Co.,Ltd.
 * @Title: Layer.js
 * @Description: 弹出层操作
 * @author wangyonggang qq:135274859 zhanghongliang qq: 20132277
 * @date 2012-6-27
 * @version V1.0
 * Modification History:  2012-7-27
 */
//实例化对象需要传入id,msg,如果没有，则显示默认值

GLOBAL.layer = function (config) {
    //设定默认值
    var config = $.extend({
        id:"msg_box",
        msg:""
    }, config);
    this.id = config.id;
    this.msg = config.msg;
    this.box = $('#' + config.id);
    this.bindClickEvent();
};

function createMsgBox(optionsBox) {
    var box;
    if (optionsBox.id == 'msg_box') {
        box = $('<aside>', {
            id:optionsBox.id,
            "class":'tc fb f20 none css3_center',
            html:'<h3 class="f24"></h3>'
        }).appendTo('div:first');
    }
    if (optionsBox.id == 'msg_box_fail') {
        box = $('<aside>', {
            id:optionsBox.id,
            'class':'tc fb f20 none css3_center',
            html:'<h3 class="f24"></h3><div id="button" class="button" style="margin-top:40px;border-top:#fff;">确 定</div>'
        }).prependTo('div:first');
    }
    if(optionsBox.id == 'alert_box'){
       box = $('<aside>', {
            id:optionsBox.id,
            'class':'tc fb f20 loading_box none css3_center',
            html:'<h3 class="f24"></h3>'
        }).prependTo('div:first');
    }
    if(optionsBox.id == 'prompt_box'){
        box = $('<aside>', {
            id:optionsBox.id,
            'class':'tc fb f20 loading_box none css3_center',
            html:'<h3 class="f24"></h3><img src="../images/yes_on.png" width="103" height="43" alt="是按钮"><img src="../images/no.png" style="margin-left: 40px"  width="103" height="43" alt="否按钮">'
        }).prependTo('div:first');
    }
    box.css("marginTop", "0px");
    return box;
}

GLOBAL.layer.prototype = {
    bindClickEvent:function () {
        this.box.find('img[alt="确定按钮"],img[alt="是按钮"],img[alt="否按钮"]').click($.proxy(
            function () {
                this.box.hide();
                $("#_blockOverLayer").hide();
            },
            this
        ));
    },
    show:function () {
        if (this.box.length == 0) {
            this.box = createMsgBox(this);
        }
        if (!this.msg == "")
            this.box.children('h3').html(this.msg);
        if ($("#_blockOverLayer").length < 1) {
            $("<div>", {
                "id":"_blockOverLayer",
                text:"",
                click:function () {
                }
            }).appendTo("div:first");
        }
        if (supportCss3(document.getElementsByTagName('body')[0], '-webkit-transform', 'perspective(400px) rotateX(0deg)')) {
            this.box
                .removeClass('none')
                .addClass('box css3_center')
                .css({
                    "z-index":1001,
                    position:'absolute',
                    left:($(window).width() - this.box.width()) / 2 + "px",
                    top:($("div:first").height() - this.box.height()) / 2 + "px",
                }
            );

            $("#_blockOverLayer").show();
            this.box
                .show();
        }
        else {
            this.box
                .removeClass('none')
                .css({
                    "z-index":1001,
                    position:'absolute',
                    left:($(window).width() - this.box.width()) / 2 + "px",
                    top:($("div:first").height() - this.box.height()) / 2 + "px",
                }
            );

            $("#_blockOverLayer")
                .show();
            this.box
                .show();
        }
    },
    hide:function () {
        if (supportCss3(document.getElementsByTagName('body')[0], '-webkit-transform', 'perspective(400px) rotateX(0deg)')) {
            this.box
                .add("#_blockOverLayer")
                .hide();
            $.proxy(
                function () {
                    window.setTimeout(function () {
                            this.box
                                .add("#_blockOverLayer")
                                .addClass('none');
                        },
                        1000
                    )
                },
                this
            );
        }
        else {
            $("#" + this.id)
                .add("#_blockOverLayer")
                .hide();
            window.setTimeout(function () {
                    $("#" + id)
                        .add("#_blockOverLayer")
                        .addClass('none');
                },
                1000
            );
        }
        if(['alert_box','prompt_box'].indexOf(this.id) != -1)
            $("#"+this.id).remove();

    }
};

function supportCss3(element, styleSheet, styleValue) {
    if (styleSheet in element.style) {
        element.style[styleSheet] = styleValue;
        return element.style[styleSheet] === styleValue;
    } else {
        return false;
    }
}

function supportCss3Property(config) {
    if (!config.element) {
        config.element = document.getElementsByTagName('body')[0];
    }
    return config.styleSheet in config.element.style;
}

GLOBAL.layer.normal = new GLOBAL.layer();
GLOBAL.layer.deleteLayer = function(configBox) {
    var  constant = GLOBAL.Constant;
    if (!parent.window.GLOBAL) {
        console.log('error call in the main interface');
        return;
    }
    var config = {
        id:configBox.id
    };
    var msg = (parent.window.GLOBAL.Constant.favor_type == constant.favor_history ? constant.favor_history : constant.favor_other);
    config.msg = configBox.pre + msg + '?';
    var layer = new GLOBAL.layer(config);
    layer.show();
    $('#' + configBox.id + ' img:first').click(function () {
        configBox.callback();
    });
}