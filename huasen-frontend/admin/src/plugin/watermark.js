import WaterMarkSettings from 'config/watermark.config.js'

export default function watermark(settings) {
    let defaultSettings = Object.assign(WaterMarkSettings, settings)
    // 采用配置项替换默认值
    if (arguments.length === 1 && typeof arguments[0] === 'object') {
        var src = arguments[0] || {}
        for (let key in src) {
            if (
                src[key] &&
                defaultSettings[key] &&
                src[key] === defaultSettings[key]
            ) {
                continue
            } else if (src[key]) {
                defaultSettings[key] = src[key]
            }
        }
    }
    var oTemp = document.createDocumentFragment()
    // 获取页面最大宽度
    var pageWidth = Math.max(document.body.scrollWidth, document.body.clientWidth) || 1280
    var cutWidth = pageWidth * 0.015
    pageWidth = pageWidth - cutWidth
    // 获取页面最大高度
    var pageHeight = Math.min(document.body.scrollHeight, document.body.clientHeight) || 768
    // 如果将水印列数设置为0，或水印列数设置过大，超过页面最大宽度，则重新计算水印列数和水印x轴间隔。
    if (
        defaultSettings.watermark_cols === 0 ||
        parseInt(
            defaultSettings.watermark_x +
            defaultSettings.watermark_width *
            defaultSettings.watermark_cols +
            defaultSettings.watermark_x_space *
            (defaultSettings.watermark_cols - 1)
        ) > pageWidth
    ) {
        defaultSettings.watermark_cols = parseInt(
            (pageWidth -
                defaultSettings.watermark_x +
                defaultSettings.watermark_x_space) /
            (defaultSettings.watermark_width +
                defaultSettings.watermark_x_space)
        )
        defaultSettings.watermark_x_space = parseInt(
            (pageWidth -
                defaultSettings.watermark_x -
                defaultSettings.watermark_width *
                defaultSettings.watermark_cols) /
            (defaultSettings.watermark_cols - 1)
        )
    }
    // 如果将水印行数设置为0，或水印行数设置过大，超过页面最大长度，则重新计算水印行数和水印y轴间隔。
    if (
        defaultSettings.watermark_rows === 0 ||
        parseInt(
            defaultSettings.watermark_y +
            defaultSettings.watermark_height *
            defaultSettings.watermark_rows +
            defaultSettings.watermark_y_space *
            (defaultSettings.watermark_rows - 1)
        ) > pageHeight
    ) {
        defaultSettings.watermark_rows = parseInt(
            (defaultSettings.watermark_y_space +
                pageHeight -
                defaultSettings.watermark_y) /
            (defaultSettings.watermark_height +
                defaultSettings.watermark_y_space)
        )
        defaultSettings.watermark_y_space = parseInt(
            (pageHeight -
                defaultSettings.watermark_y -
                defaultSettings.watermark_height *
                defaultSettings.watermark_rows) /
            (defaultSettings.watermark_rows - 1)
        )
    }
    var x
    var y
    for (var i = 0; i < defaultSettings.watermark_rows; i++) {
        y =
            defaultSettings.watermark_y +
            (defaultSettings.watermark_y_space +
                defaultSettings.watermark_height) *
            i
        for (var j = 0; j < defaultSettings.watermark_cols; j++) {
            x =
                defaultSettings.watermark_x +
                (defaultSettings.watermark_width +
                    defaultSettings.watermark_x_space) *
                j

            var maskDiv = document.createElement('div')
            maskDiv.id = 'maskDiv' + i + j
            maskDiv.className = 'maskDiv'
            var txtSpan = document.createElement('span')
            txtSpan.innerHTML = defaultSettings.watermark_txt
            txtSpan.style.setProperty(
                'font-size',
                defaultSettings.watermark_fontsize,
                'important'
            )
            maskDiv.appendChild(txtSpan)
            // 设置水印div倾斜显示
            maskDiv.style.webkitTransform =
                'rotate(-' + defaultSettings.watermark_angle + 'deg)'
            maskDiv.style.MozTransform =
                'rotate(-' + defaultSettings.watermark_angle + 'deg)'
            maskDiv.style.msTransform =
                'rotate(-' + defaultSettings.watermark_angle + 'deg)'
            maskDiv.style.OTransform =
                'rotate(-' + defaultSettings.watermark_angle + 'deg)'
            maskDiv.style.transform =
                'rotate(-' + defaultSettings.watermark_angle + 'deg)'
            maskDiv.style.visibility = ''
            maskDiv.style.position = 'absolute'
            maskDiv.style.left = x + 'px'
            maskDiv.style.top = y + 'px'
            maskDiv.style.zIndex = '9999'
            maskDiv.style.pointerEvents = 'none' // pointer-events:none  让水印不遮挡页面的点击事件
            maskDiv.style.opacity = defaultSettings.watermark_alpha
            maskDiv.style.fontFamily = defaultSettings.watermark_font
            maskDiv.style.color = defaultSettings.watermark_color
            maskDiv.style.textAlign = 'center'
            maskDiv.style.width = defaultSettings.watermark_width + 'px'
            maskDiv.style.height = '0px'
            oTemp.appendChild(maskDiv)
        }
    }
    var maskWrap = document.createElement('div')
    maskWrap.style.cssText =
        'position: absolute; top: 0;right: 0; bottom: 0;left: 0; z-index: 9999; pointer-events: none;overflow: hidden'
    maskWrap.appendChild(oTemp)
    defaultSettings.element.appendChild(maskWrap)
}
