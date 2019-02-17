
//imageInfo={width:999,height:333,box_style_width:99,box_style_height:33,image_width:90,image_height:30,flowRowNo}
//virtualContainer={children:imageInfos[],offsetWidth:750}
//options={defaultHeight:280,margin:6}
function HorizontalWaterfallFlow(virtualContainer, options) {
    var _this = this;
    if (_this.container = virtualContainer,
        _this.childrens = _this.container.children,
        _this.childrens && _this.childrens.length > 0) {
        _this.opt = {
            /*
            defaultHeight: 280,
            margin: parseInt(getComputedStyle(_this.childrens[0])["margin-left"]) + parseInt(getComputedStyle(_this.childrens[0])["margin-right"])
            */
        };
        for (var i in options)
            _this.opt[i] = options[i];
        _this.refleshLayout()
    }
};
HorizontalWaterfallFlow.prototype = {
    _getEveryLineNums: function () {
        for (var _this = this, divItemsCount = _this.childrens.length, flowRowWidth = 0, n = 0, flowRowItem = {}, flowRows = [], i = 0; i < divItemsCount; i++) {
            var imageSize = _this._imgMsg(_this.childrens[i]);
            flowRowWidth += _this.opt.defaultHeight * imageSize.w / imageSize.h + _this.opt.margin,
                flowRowWidth >= _this.maxWidth && (flowRowItem = {
                    start: n,
                    end: i,
                    height: Math.round(_this.maxWidth / flowRowWidth * _this.opt.defaultHeight)
                },
                    flowRows.push(flowRowItem),
                    n = i + 1,
                    flowRowWidth = 0)
        }
        return flowRows
    },
    _imgMsg: function (divItem) {
        var t = {
            w: divItem.width,
            h: divItem.height
        };
        return t
    },
    _sort: function (flowRows) {
        var _this = this
            , divItemsCount = _this.childrens.length - 1;
        if (flowRows.length > 0) {
            for (var i in flowRows)
                _this._setAttr(flowRows[i].start, flowRows[i].end, flowRows[i].height, !1, parseInt(i));
            flowRows[i].end < divItemsCount && _this._setAttr(flowRows[i].end + 1, divItemsCount, _this.opt.defaultHeight, !0, parseInt(i) + 1)
        } else
            _this._setAttr(0, divItemsCount, _this.opt.defaultHeight, !0, 0)
    },
    _setAttr: function (start, end, height, n, flowRowNo) {
        var _this = this
            , divItems = _this.childrens
            , flowRowImageWidths = _this._getNeWidth(start, end, height, n, divItems);
        for (var i in flowRowImageWidths)
            _this.__setAttrBox(flowRowImageWidths[i], height, divItems[i]),
                _this.__setAttrImg(flowRowImageWidths[i], height, divItems[i]),
                divItems[i].flowRowNo = flowRowNo//行号
    },
    __setAttrBox: function (width, height, divItem) {
        divItem.box_style_width = width + "px",
            divItem.box_style_height = height + "px"
    },
    __setAttrImg: function (width, height, divItem) {
        var _this = this
            , imageObj = divItem// divItem.getElementsByTagName("img")[0]
            , imageSize = _this._imgMsg(divItem);
        width * height / imageSize.w > imageSize.h ? height = width * imageSize.h / imageSize.w : width = imageSize.w * height / imageSize.h,
            imageObj.image_width =Math.round(width),
            imageObj.image_height =Math.round(height)
    },
    _getNeWidth: function (start, end, height, n, divItems) {
        for (var flowRowImageWidth, _this = this, imageSize = {}, flowRowImageWidths = [], flowRowWidth = 0, u = end > start ? end - start + 1 : 1, i = start; i <= end; i++)
            imageSize = _this._imgMsg(divItems[i]),
                flowRowImageWidths[i] = height / imageSize.h * imageSize.w,
                flowRowWidth += flowRowImageWidths[i];
        var f = n ? 0 : Math.round((_this.maxWidth - flowRowWidth - _this.opt.margin * u) / u);
        flowRowWidth = 0;
        for (var i in flowRowImageWidths)
            flowRowImageWidth = Math.floor(flowRowImageWidths[i] + f),
                (flowRowWidth + flowRowImageWidth + _this.opt.margin > _this.maxWidth || Number(i) === end && flowRowWidth + flowRowImageWidth + _this.opt.margin <= _this.maxWidth && !n) && (flowRowImageWidth = _this.maxWidth - flowRowWidth - _this.opt.margin),
                flowRowImageWidths[i] = flowRowImageWidth,
                flowRowWidth += flowRowImageWidth + _this.opt.margin;
        return flowRowImageWidths
    },
    refleshLayout: function () {
        var _this = this;
        _this.maxWidth = _this.container.offsetWidth,
            _this._sort(_this._getEveryLineNums())
    }
};

module.exports = HorizontalWaterfallFlow;
